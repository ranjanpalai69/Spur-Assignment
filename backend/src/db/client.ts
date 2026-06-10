import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { config } from '../config/env';

const DB_PATH = path.resolve(config.dbPath);

let _db: Database;

function saveToFile(): void {
  const data = _db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

/** Must be called once before the HTTP server starts. */
export async function initDb(): Promise<void> {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const SQL = await initSqlJs();

  _db = fs.existsSync(DB_PATH)
    ? new SQL.Database(fs.readFileSync(DB_PATH))
    : new SQL.Database();

  _db.run('PRAGMA foreign_keys = ON');

  _db.run(`
    CREATE TABLE IF NOT EXISTS conversations (
      id         TEXT PRIMARY KEY,
      title      TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  _db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id              TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender          TEXT NOT NULL CHECK(sender IN ('user', 'ai')),
      text            TEXT NOT NULL,
      timestamp       TEXT NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    )
  `);

  _db.run(
    'CREATE INDEX IF NOT EXISTS idx_msg_conv ON messages(conversation_id, timestamp)',
  );
  _db.run(
    'CREATE INDEX IF NOT EXISTS idx_conv_updated ON conversations(updated_at DESC)',
  );

  saveToFile();
  console.log(`  Database    : ${DB_PATH}`);
}

// ---------------------------------------------------------------------------
// Minimal query helpers — run, get, all
// ---------------------------------------------------------------------------

type Row = Record<string, string | number | Uint8Array | null>;

function getDb(): Database {
  if (!_db) throw new Error('DB not initialized — call initDb() first');
  return _db;
}

export const db = {
  /** Execute a write statement and flush to disk. */
  run(sql: string, params: (string | number | null)[] = []): void {
    getDb().run(sql, params);
    saveToFile();
  },

  /** Return the first matching row, or null. */
  get<T>(sql: string, params: (string | number | null)[] = []): T | null {
    const stmt = getDb().prepare(sql);
    stmt.bind(params);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = stmt.step() ? (stmt.getAsObject() as any as T) : null;
    stmt.free();
    return row;
  },

  /** Return all matching rows. */
  all<T>(sql: string, params: (string | number | null)[] = []): T[] {
    const rows: T[] = [];
    const stmt = getDb().prepare(sql);
    stmt.bind(params);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    while (stmt.step()) rows.push(stmt.getAsObject() as any as T);
    stmt.free();
    return rows;
  },
};
