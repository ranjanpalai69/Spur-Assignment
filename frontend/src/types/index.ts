export type Sender = 'user' | 'ai';

export interface Message {
  id: string;
  conversationId: string;
  sender: Sender;
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
  messageId: string;
}

export interface HistoryResponse {
  sessionId: string;
  messages: Message[];
  conversation: Conversation;
}

export interface ConversationsResponse {
  conversations: Conversation[];
}

export interface ApiError {
  error: string;
  code?: string;
  details?: { field: string; message: string }[];
}
