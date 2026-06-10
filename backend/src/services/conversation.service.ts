import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/client';
import type { Conversation } from '../types';

interface ConversationRow {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

function toConversation(row: ConversationRow): Conversation {
  return {
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const conversationService = {
  create(): Conversation {
    const id = uuidv4();
    const now = new Date().toISOString();
    db.run(
      'INSERT INTO conversations (id, created_at, updated_at) VALUES (?, ?, ?)',
      [id, now, now],
    );
    return toConversation(
      db.get<ConversationRow>('SELECT id, title, created_at, updated_at FROM conversations WHERE id = ?', [id])!,
    );
  },

  findById(id: string): Conversation | null {
    const row = db.get<ConversationRow>(
      'SELECT id, title, created_at, updated_at FROM conversations WHERE id = ?',
      [id],
    );
    return row ? toConversation(row) : null;
  },

  list(): Conversation[] {
    return db
      .all<ConversationRow>(
        'SELECT id, title, created_at, updated_at FROM conversations ORDER BY updated_at DESC LIMIT 50',
      )
      .map(toConversation);
  },

  setTitle(id: string, title: string): void {
    db.run(
      'UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?',
      [title, new Date().toISOString(), id],
    );
  },

  touch(id: string): void {
    db.run(
      'UPDATE conversations SET updated_at = ? WHERE id = ?',
      [new Date().toISOString(), id],
    );
  },
};
