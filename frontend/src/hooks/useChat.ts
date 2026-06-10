import { useState, useCallback, useRef } from 'react';
import { api, ApiError } from '../services/api';
import type { Message } from '../types';

const SESSION_KEY = 'shopease_session_id';

function loadStoredSessionId(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function saveSessionId(id: string): void {
  try {
    localStorage.setItem(SESSION_KEY, id);
  } catch {
    // localStorage might be unavailable (private mode, etc.)
  }
}

function clearSessionId(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export interface UseChatReturn {
  messages: Message[];
  sessionId: string | null;
  isLoading: boolean;
  isLoadingHistory: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  loadHistory: (sessionId: string) => Promise<void>;
  startNewChat: () => void;
  clearError: () => void;
}

export function useChat(onNewSession?: (id: string) => void): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(loadStoredSessionId);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prevent double-send if the user hammers the button
  const inFlightRef = useRef(false);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || inFlightRef.current) return;

      inFlightRef.current = true;
      setIsLoading(true);
      setError(null);

      // Optimistic: add the user message immediately
      const optimisticUserMsg: Message = {
        id: `optimistic-${Date.now()}`,
        conversationId: sessionId ?? '',
        sender: 'user',
        text: trimmed,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, optimisticUserMsg]);

      try {
        const data = await api.sendMessage(trimmed, sessionId ?? undefined);

        // Update session
        if (!sessionId || sessionId !== data.sessionId) {
          setSessionId(data.sessionId);
          saveSessionId(data.sessionId);
          onNewSession?.(data.sessionId);
        }

        // Replace optimistic msg with a proper one and append AI reply
        setMessages(prev => {
          const withoutOptimistic = prev.filter(m => m.id !== optimisticUserMsg.id);
          const userMsg: Message = {
            ...optimisticUserMsg,
            id: `user-${data.sessionId}-${Date.now()}`,
            conversationId: data.sessionId,
          };
          const aiMsg: Message = {
            id: data.messageId,
            conversationId: data.sessionId,
            sender: 'ai',
            text: data.reply,
            timestamp: new Date().toISOString(),
          };
          return [...withoutOptimistic, userMsg, aiMsg];
        });
      } catch (err) {
        // Remove optimistic message on failure
        setMessages(prev => prev.filter(m => m.id !== optimisticUserMsg.id));

        if (err instanceof ApiError) {
          if (err.status === 400) {
            setError(err.message);
          } else if (err.status >= 500) {
            setError('Server error — please try again in a moment.');
          } else if (err.message.toLowerCase().includes('failed to fetch')) {
            setError('Cannot reach the server. Check your connection and try again.');
          } else {
            setError(err.message);
          }
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
      } finally {
        setIsLoading(false);
        inFlightRef.current = false;
      }
    },
    [sessionId, onNewSession],
  );

  const loadHistory = useCallback(async (id: string) => {
    setIsLoadingHistory(true);
    setError(null);
    try {
      const data = await api.getHistory(id);
      setMessages(data.messages);
      setSessionId(id);
      saveSessionId(id);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        // Session no longer exists — start fresh
        clearSessionId();
        setSessionId(null);
        setMessages([]);
      } else {
        setError('Failed to load conversation history.');
      }
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const startNewChat = useCallback(() => {
    clearSessionId();
    setSessionId(null);
    setMessages([]);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    messages,
    sessionId,
    isLoading,
    isLoadingHistory,
    error,
    sendMessage,
    loadHistory,
    startNewChat,
    clearError,
  };
}
