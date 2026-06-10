import rateLimit, { Options } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedisClient } from '../lib/redis';

/**
 * Build an express-rate-limit middleware that uses Redis as its store when
 * available, and falls back to the in-memory store when Redis is absent/down.
 * The in-memory fallback is per-process only, which is fine for a single
 * instance; distributed deployments should always configure Redis.
 */
export function buildRateLimit(
  windowMs: number,
  max: number,
  message = 'Too many requests — please slow down.',
): ReturnType<typeof rateLimit> {
  const client = getRedisClient();

  const options: Partial<Options> = {
    windowMs,
    max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: message },
    skip: (req) => req.method === 'OPTIONS',
    // Omit `store` to use in-memory when Redis is unavailable
    ...(client
      ? {
          store: new RedisStore({
            // rate-limit-redis v4 expects a sendCommand wrapper
            sendCommand: (...args: string[]) => client.sendCommand(args),
          }),
        }
      : {}),
  };

  return rateLimit(options);
}
