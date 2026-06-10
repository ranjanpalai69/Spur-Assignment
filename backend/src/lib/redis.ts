import { createClient } from 'redis';
import { config } from '../config/env';

type RedisClient = ReturnType<typeof createClient>;

let _client: RedisClient | null = null;
let _healthy = false;

/**
 * Attempt to connect to Redis. On any failure the server continues without
 * caching — callers must check `getRedisClient()` for null before using it.
 */
export async function connectRedis(): Promise<void> {
  if (!config.redisUrl) {
    console.log('  Redis       : disabled (REDIS_URL not configured)');
    return;
  }

  _client = createClient({
    url: config.redisUrl,
    socket: {
      // Exponential back-off capped at 5 s; give up after 20 retries
      reconnectStrategy: (retries) => {
        if (retries >= 20) {
          console.error('[Redis] Max reconnection attempts reached — giving up');
          _healthy = false;
          return false; // stop retrying
        }
        return Math.min(retries * 150, 5_000);
      },
      connectTimeout: 5_000,
    },
  });

  _client.on('error', (err: Error) => {
    // Log once per error type to avoid log spam during reconnection storms
    console.error(`[Redis] ${err.message}`);
    _healthy = false;
  });

  _client.on('ready', () => {
    _healthy = true;
    console.log('[Redis] Connection ready');
  });

  _client.on('reconnecting', () => {
    console.log('[Redis] Reconnecting…');
  });

  _client.on('end', () => {
    _healthy = false;
  });

  try {
    await _client.connect();
    _healthy = true;
    console.log(`  Redis       : connected (${config.redisUrl})`);
  } catch (err) {
    console.warn('[Redis] Could not connect — running without cache:', (err as Error).message);
    // Don't null _client yet — the auto-reconnect loop might recover it.
    // Routes must always check _healthy via getRedisClient().
    _healthy = false;
  }
}

/** Returns the Redis client only when it is connected and healthy. */
export function getRedisClient(): RedisClient | null {
  return _healthy && _client ? _client : null;
}

export async function disconnectRedis(): Promise<void> {
  if (_client) {
    try {
      await _client.quit();
    } catch {
      // quit() failed — force-close the underlying socket
      await _client.disconnect();
    }
    _client = null;
    _healthy = false;
  }
}

/** Liveness probe — used in the /health endpoint. */
export function redisStatus(): 'connected' | 'disabled' | 'degraded' {
  if (!config.redisUrl) return 'disabled';
  return _healthy ? 'connected' : 'degraded';
}
