import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { buildRateLimit } from '../middleware/rateLimit';
import { conversationService } from '../services/conversation.service';
import { messageService } from '../services/message.service';
import { generateReply, LLMError, friendlyErrorMessage } from '../services/llm.service';
import { historyCache, conversationsCache } from '../lib/cache';
import { config } from '../config/env';

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const chatMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(
      config.maxMessageLength,
      `Message too long — maximum ${config.maxMessageLength} characters allowed`,
    ),
  sessionId: z.string().uuid('Invalid session ID format').optional(),
});

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ---------------------------------------------------------------------------
// Factory — called AFTER Redis has connected so buildRateLimit can pick up the
// live Redis client and use it as the rate-limit store.
// ---------------------------------------------------------------------------

export function createChatRouter(): Router {
  const router = Router();

  // Stricter limit on the LLM-calling endpoint
  const messageLimiter = buildRateLimit(
    config.rateLimitWindowMs,
    config.rateLimitMaxRequests,
    'Too many messages sent — please wait a moment before trying again.',
  );

  // Reads are cheap; give a generous quota
  const readLimiter = buildRateLimit(
    config.rateLimitWindowMs,
    config.rateLimitMaxRequests * 5,
  );

  // -------------------------------------------------------------------------
  // POST /chat/message
  // -------------------------------------------------------------------------

  router.post(
    '/message',
    messageLimiter,
    validate(chatMessageSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { message, sessionId } = req.body as { message: string; sessionId?: string };

        // Resolve or create conversation
        let conversation = sessionId ? conversationService.findById(sessionId) : null;
        if (!conversation) {
          conversation = conversationService.create();
          void conversationsCache.invalidate();
        }

        const convId = conversation.id;

        // -----------------------------------------------------------------------
        // Fetch recent history for LLM context
        // Cache hit → skip DB round-trip; miss → load from DB and prime the cache
        // -----------------------------------------------------------------------
        const cachedHistory = await historyCache.get(convId);
        const history =
          cachedHistory ??
          messageService.getRecentForContext(convId, config.maxHistoryMessages);

        if (!cachedHistory) {
          void historyCache.set(convId, history);
        }

        // Persist user message (history is now stale — invalidate it)
        messageService.create(convId, 'user', message);
        void historyCache.invalidate(convId);

        // -----------------------------------------------------------------------
        // Call LLM — errors are caught and surfaced as friendly messages
        // -----------------------------------------------------------------------
        let reply: string;
        try {
          reply = await generateReply(history, message);
        } catch (llmErr) {
          const code = llmErr instanceof LLMError ? llmErr.code : 'UNKNOWN';
          reply = friendlyErrorMessage(code);
        }

        // Persist AI reply and update conversation metadata
        const aiMessage = messageService.create(convId, 'ai', reply);

        if (history.length === 0) {
          const title =
            message.length > 60 ? `${message.substring(0, 57).trim()}…` : message;
          conversationService.setTitle(convId, title);
        } else {
          conversationService.touch(convId);
        }

        // Conversations list order/title may have changed
        void conversationsCache.invalidate();

        res.json({ reply, sessionId: convId, messageId: aiMessage.id });
      } catch (err) {
        next(err);
      }
    },
  );

  // -------------------------------------------------------------------------
  // GET /chat/history/:sessionId
  // -------------------------------------------------------------------------

  router.get(
    '/history/:sessionId',
    readLimiter,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { sessionId } = req.params;

        if (!UUID_RE.test(sessionId)) {
          res.status(400).json({ error: 'Invalid session ID format' });
          return;
        }

        const conversation = conversationService.findById(sessionId);
        if (!conversation) {
          res.status(404).json({ error: 'Conversation not found' });
          return;
        }

        // Full message list for UI rendering — not cached (only LLM context is)
        const messages = messageService.getByConversation(sessionId);

        res.json({ sessionId, conversation, messages });
      } catch (err) {
        next(err);
      }
    },
  );

  // -------------------------------------------------------------------------
  // GET /chat/conversations
  // -------------------------------------------------------------------------

  router.get(
    '/conversations',
    readLimiter,
    async (_req: Request, res: Response, next: NextFunction) => {
      try {
        // 30-second TTL — short enough to feel fresh, long enough to help
        const cached = await conversationsCache.get();
        if (cached) {
          res.json({ conversations: cached });
          return;
        }

        const conversations = conversationService.list();
        void conversationsCache.set(conversations);

        res.json({ conversations });
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}
