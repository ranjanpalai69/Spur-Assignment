import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    console.error(`[Config] Missing required environment variable: ${key}`);
    process.exit(1);
  }
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

function optionalEnvNullable(key: string): string | null {
  return process.env[key] || null;
}

export const config = {
  port: parseInt(optionalEnv('PORT', '3001'), 10),
  nodeEnv: optionalEnv('NODE_ENV', 'development'),
  openaiApiKey: requireEnv('OPENAI_API_KEY'),
  dbPath: optionalEnv('DB_PATH', './data/chat.db'),
  corsOrigin: optionalEnv('CORS_ORIGIN', 'http://localhost:5173'),
  llmModel: optionalEnv('LLM_MODEL', 'gpt-4o-mini'),
  redisUrl: optionalEnvNullable('REDIS_URL'),            // null → Redis disabled
  maxMessageLength: parseInt(optionalEnv('MAX_MESSAGE_LENGTH', '2000'), 10),
  maxHistoryMessages: parseInt(optionalEnv('MAX_HISTORY_MESSAGES', '20'), 10),
  maxTokens: parseInt(optionalEnv('MAX_TOKENS', '1024'), 10),
  // Rate limiting
  rateLimitWindowMs: parseInt(optionalEnv('RATE_LIMIT_WINDOW_MS', String(15 * 60 * 1000)), 10),
  rateLimitMaxRequests: parseInt(optionalEnv('RATE_LIMIT_MAX', '60'), 10),
} as const;
