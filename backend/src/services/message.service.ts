import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/client';
import type { Message, Sender } from '../types';

interface MessageRow {
  id: string;
  conversation_id: string;
  sender: string;
  text: string;
  timestamp: string;
}

function toMessage(row: MessageRow): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    sender: row.sender as Sender,
    text: row.text,
    timestamp: row.timestamp,
  };
}

export const messageService = {
  create(conversationId: string, sender: Sender, text: string): Message {
    const id = uuidv4();
    const timestamp = new Date().toISOString();
    db.run(
      'INSERT INTO messages (id, conversation_id, sender, text, timestamp) VALUES (?, ?, ?, ?, ?)',
      [id, conversationId, sender, text, timestamp],
    );
    return toMessage(
      db.get<MessageRow>('SELECT id, conversation_id, sender, text, timestamp FROM messages WHERE id = ?', [id])!,
    );
  },

  getByConversation(conversationId: string, limit = 100): Message[] {
    return db
      .all<MessageRow>(
        `SELECT id, conversation_id, sender, text, timestamp
         FROM messages
         WHERE conversation_id = ?
         ORDER BY timestamp ASC
         LIMIT ?`,
        [conversationId, limit],
      )
      .map(toMessage);
  },

  /** Returns the N most recent messages in chronological order (for LLM context). */
  getRecentForContext(conversationId: string, limit: number): Message[] {
    return db
      .all<MessageRow>(
        `SELECT id, conversation_id, sender, text, timestamp
         FROM (
           SELECT id, conversation_id, sender, text, timestamp
           FROM messages
           WHERE conversation_id = ?
           ORDER BY timestamp DESC
           LIMIT ?
         )
         ORDER BY timestamp ASC`,
        [conversationId, limit],
      )
      .map(toMessage);
  },
};
