import type { ChatResponse, HistoryResponse, ConversationsResponse } from '../types';

// In dev, Vite proxies /chat → localhost:3001; in production set VITE_API_URL.
const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  const body = await res.json().catch(() => ({ error: 'Unexpected server response' }));

  if (!res.ok) {
    throw new ApiError(
      body.error ?? `HTTP ${res.status}`,
      res.status,
      body.code,
    );
  }

  return body as T;
}

export const api = {
  sendMessage(message: string, sessionId?: string): Promise<ChatResponse> {
    return request<ChatResponse>('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId }),
    });
  },

  getHistory(sessionId: string): Promise<HistoryResponse> {
    return request<HistoryResponse>(`/chat/history/${encodeURIComponent(sessionId)}`);
  },

  getConversations(): Promise<ConversationsResponse> {
    return request<ConversationsResponse>('/chat/conversations');
  },
};

export { ApiError };
