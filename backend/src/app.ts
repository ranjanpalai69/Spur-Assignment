import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import { initDb } from './db/client';
import { connectRedis, disconnectRedis, redisStatus } from './lib/redis';
import { createChatRouter } from './routes/chat.routes';
import { errorHandler, notFound } from './middleware/errorHandler';

const app = express();

// ---------------------------------------------------------------------------
// Middleware that must run regardless of route (no Redis dependency)
// ---------------------------------------------------------------------------

app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  }),
);
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '16kb' }));

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    subsystems: {
      database: 'connected',
      redis: redisStatus(),
    },
  });
});

// ---------------------------------------------------------------------------
// Bootstrap
//
// Order matters:
//   1. DB init — required; aborts startup on failure
//   2. Redis connect — optional; server still starts if unavailable
//   3. Route + limiter registration — must come AFTER Redis so the rate-limit
//      store can be wired to the live Redis client
//   4. Error handlers — must be last in the middleware chain
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  await initDb();
  await connectRedis();

  // Build routes here (not at import time) so buildRateLimit() sees the
  // live Redis connection and can use it as the distributed rate-limit store.
  app.use('/chat', createChatRouter());
  app.use(notFound);
  app.use(errorHandler);

  const server = http.createServer(app);

  server.listen(config.port, () => {
    console.log(`✓ Server listening on http://localhost:${config.port}`);
    console.log(`  Environment : ${config.nodeEnv}`);
    console.log(`  LLM model   : ${config.llmModel}`);
  });

  async function gracefulShutdown(signal: string): Promise<void> {
    console.log(`\n[${signal}] Shutting down gracefully…`);
    server.close(async () => {
      await disconnectRedis();
      console.log('✓ Clean shutdown complete');
      process.exit(0);
    });
    // Force-exit if drain takes too long (e.g. a stuck keep-alive connection)
    setTimeout(() => {
      console.error('Forced exit after drain timeout');
      process.exit(1);
    }, 10_000).unref();
  }

  process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => void gracefulShutdown('SIGINT'));

  process.on('uncaughtException', (err) => {
    console.error('[uncaughtException]', err);
    void gracefulShutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason) => {
    // Log but don't kill — some LLM timeout paths surface here
    console.error('[unhandledRejection]', reason);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
