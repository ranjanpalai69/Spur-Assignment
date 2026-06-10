import { getRedisClient } from './redis';
import type { Message, Conversation } from '../types';

// Namespace + schema version — bump v-prefix to bust all keys on schema changes
const NS = 'shopease:v1:';

const TTL = {
  /** LLM context window for a given session. Invalidated on any new message. */
  history: 600, // 10 minutes
  /** Sidebar conversation list — short TTL since it's updated often. */
  conversations: 30, // 30 seconds
} as const;

function key(suffix: string): string {
  return `${NS}${suffix}`;
}

async function safeGet<T>(cacheKey: string): Promise<T | null> {
  const client = getRedisClient();
  if (!client) return null;
  try {
    const raw = await client.get(cacheKey);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null; // degrade gracefully — never throw to callers
  }
}

async function safeSetEx(cacheKey: string, ttl: number, value: unknown): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  try {
    await client.setEx(cacheKey, ttl, JSON.stringify(value));
  } catch {
    // Cache write failure is non-fatal
  }
}

async function safeDel(cacheKey: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  try {
    await client.del(cacheKey);
  } catch {
    // Stale key will expire on its own
  }
}

// ---------------------------------------------------------------------------
// History cache  (LLM context window per conversation)
// ---------------------------------------------------------------------------

export const historyCache = {
  get: (sessionId: string) =>
    safeGet<Message[]>(key(`history:${sessionId}`)),

  set: (sessionId: string, messages: Message[]) =>
    safeSetEx(key(`history:${sessionId}`), TTL.history, messages),

  /** Call after any write to the conversation so LLM gets fresh context. */
  invalidate: (sessionId: string) =>
    safeDel(key(`history:${sessionId}`)),
};

// ---------------------------------------------------------------------------
// Conversations list cache  (sidebar)
// ---------------------------------------------------------------------------

export const conversationsCache = {
  get: () =>
    safeGet<Conversation[]>(key('conversations')),

  set: (conversations: Conversation[]) =>
    safeSetEx(key('conversations'), TTL.conversations, conversations),

  /** Call whenever a conversation is created or its metadata changes. */
  invalidate: () =>
    safeDel(key('conversations')),
};
