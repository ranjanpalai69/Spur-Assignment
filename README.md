# ShopEase AI Support Chat

A full-stack AI-powered customer support chat for the ShopEase e-commerce store.  
**Frontend** → Vercel &nbsp;|&nbsp; **Backend** → Render (Docker)

---

## Live Demo

| Service | URL |
|---------|-----|
| Frontend | https://frontend-one-kappa-87.vercel.app |
| Backend API | https://spur-assignment-backend-ip41.onrender.com |
| Health check | https://spur-assignment-backend-ip41.onrender.com/health |

> The Render free tier spins down after 15 min of inactivity. The first request after idle takes ~30 s to wake up; subsequent requests are instant.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 · TypeScript · Vite · Tailwind CSS v3 |
| Icons | Font Awesome 6 Free |
| Backend | Node.js · TypeScript · Express |
| Database | sql.js (SQLite via WebAssembly — no native build tools needed) |
| LLM | OpenAI GPT-4o mini |
| Cache / Rate-limit | Redis (optional — app runs without it) |
| Deployment | Vercel (frontend) · Render Docker (backend) |

---

## Local Setup

### Prerequisites

- Node.js 20+
- An [OpenAI API key](https://platform.openai.com/api-keys)
- _(Optional)_ Redis — local or [Upstash free tier](https://upstash.com)

### 1. Clone

```bash
git clone https://github.com/ranjanpalai69/Spur-Assignment.git
cd Spur-Assignment
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and fill in:

```env
OPENAI_API_KEY=sk-proj-...          # Required — get from platform.openai.com
PORT=3001
NODE_ENV=development
DB_PATH=./data/chat.db
CORS_ORIGIN=http://localhost:5173

# Optional Redis (leave commented to run without cache)
# REDIS_URL=redis://localhost:6379
# For Upstash use the TLS URL:
# REDIS_URL=rediss://default:<password>@<host>.upstash.io:6380

LLM_MODEL=gpt-4o-mini
```

Start the backend:

```bash
npm run dev          # hot-reload via ts-node-dev
# or for production build:
npm run build && npm start
```

The API listens on `http://localhost:3001`.  
Verify with: `curl http://localhost:3001/health`

### 3. Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Open `http://localhost:5173`. In development, Vite proxies `/chat/*` and `/health` to `localhost:3001` automatically.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | **Yes** | — | OpenAI secret key |
| `PORT` | No | `3001` | HTTP port |
| `NODE_ENV` | No | `development` | `development` or `production` |
| `DB_PATH` | No | `./data/chat.db` | Path to SQLite file |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Allowed frontend origin |
| `REDIS_URL` | No | — | Redis connection string; omit to disable |
| `LLM_MODEL` | No | `gpt-4o-mini` | OpenAI model ID |
| `MAX_MESSAGE_LENGTH` | No | `2000` | Per-message character limit |
| `MAX_HISTORY_MESSAGES` | No | `20` | Messages fed to LLM as context |
| `MAX_TOKENS` | No | `1024` | Max tokens per LLM response |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | Rate-limit window (15 min) |
| `RATE_LIMIT_MAX` | No | `60` | Max requests per window |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | `""` | Backend base URL. Empty = Vite proxy (dev). Set to full URL in production. |

---

## Redis — Where It's Used

Redis is **optional**. The app runs fully without it; it just loses caching and distributed rate-limiting.

### Connection — `backend/src/lib/redis.ts`

```
connectRedis()   ← called once at startup in app.ts
getRedisClient() ← returns null when not connected; callers degrade gracefully
redisStatus()    ← "connected" | "disabled" | "degraded"  (shown in /health)
```

### Cache layer — `backend/src/lib/cache.ts`

| Cache key | TTL | Purpose |
|-----------|-----|---------|
| `shopease:v1:history:<sessionId>` | 10 min | Recent messages fed to LLM — avoids DB round-trip per message |
| `shopease:v1:conversations` | 30 s | Sidebar conversation list |

Both caches degrade silently to direct DB queries when Redis is unavailable.

### Rate limiting — `backend/src/middleware/rateLimit.ts`

Redis connected → limits are distributed across instances.  
Redis unavailable → limits fall back to in-process memory.

### Viewing cached data

**Upstash (production):** Dashboard → your database → **Data Browser** tab.

**Local Redis:**
```bash
redis-cli
> KEYS shopease:v1:*               # list all cached keys
> GET shopease:v1:conversations
> TTL shopease:v1:history:<uuid>   # seconds remaining
> GET shopease:v1:history:<uuid>   # raw JSON array of messages
```

---

## SQLite Database — How to Inspect It

The database file is `backend/data/chat.db` — a standard SQLite binary written by `sql.js` on every mutation.

### Tables

```sql
conversations (id TEXT PK, title TEXT, created_at TEXT, updated_at TEXT)
messages      (id TEXT PK, conversation_id TEXT, sender TEXT, text TEXT, timestamp TEXT)
```

### Option 1 — DB Browser for SQLite (GUI)

Download [DB Browser for SQLite](https://sqlitebrowser.org/dl/), open `backend/data/chat.db`. Browse/query tables visually.

### Option 2 — sqlite3 CLI

```bash
sqlite3 backend/data/chat.db

.tables
-- conversations  messages

SELECT id, title, updated_at FROM conversations ORDER BY updated_at DESC LIMIT 10;

SELECT sender, substr(text,1,80) AS preview, timestamp
FROM messages
WHERE conversation_id = '<paste-session-uuid>'
ORDER BY timestamp;
```

### Option 3 — REST API (no tools needed)

```bash
# All conversations
curl http://localhost:3001/chat/conversations

# Full message history for a session
curl http://localhost:3001/chat/history/<session-uuid>
```

> **Production note:** Render's free tier has an ephemeral filesystem — the DB resets on each redeploy. Add a [Render Disk](https://render.com/docs/disks) mounted at `/app/data` for persistent storage.

---

## Architecture

```
Browser (React + Vite)
  │
  │  POST /chat/message  { message, sessionId? }
  │  GET  /chat/history/:sessionId
  │  GET  /chat/conversations
  ▼
Express (TypeScript)  ←  Helmet · CORS · Morgan · Rate-limit
  ├── Rate limiter  ──► Redis (distributed) or memory (fallback)
  ├── Cache layer   ──► Redis: history (10 min) · conversations (30 s)
  ├── LLM service   ──► OpenAI GPT-4o mini
  └── DB layer      ──► sql.js SQLite  →  data/chat.db
```

**Message flow:**
1. Rate limiter checks quota
2. Create or resolve conversation in DB
3. Load recent messages from Redis cache (DB fallback on miss)
4. Call OpenAI with context + new message
5. Persist user + AI messages to DB; invalidate history cache
6. Return `{ reply, sessionId, messageId }`

---

## Deployment

### Frontend — Vercel

```bash
cd frontend
vercel --prod
```

Set the backend URL:
```bash
echo "https://your-backend.onrender.com" | vercel env add VITE_API_URL production
vercel --prod
```

### Backend — Render (Docker)

The root `Dockerfile` handles a multi-stage build. Render auto-deploys on every push to `master` (configured via the Render dashboard, service ID `srv-d8kh1bsm0tmc73cmf24g`).

Required env vars on Render:
- `OPENAI_API_KEY`
- `CORS_ORIGIN` → Vercel frontend URL
- `NODE_ENV=production`
- `PORT=3001`
- _(Optional)_ `REDIS_URL` — Upstash `rediss://` URL

---

## Project Structure

```
Spur-Assignment/
├── Dockerfile              # Multi-stage backend build (used by Render)
├── backend/
│   ├── src/
│   │   ├── app.ts          # Server entry — DB init → Redis → routes → listen
│   │   ├── config/env.ts   # Env var loading with validation
│   │   ├── db/client.ts    # sql.js SQLite wrapper (run / get / all)
│   │   ├── lib/
│   │   │   ├── redis.ts    # Connection with graceful fallback
│   │   │   └── cache.ts    # History + conversations cache helpers
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts
│   │   │   ├── rateLimit.ts
│   │   │   └── validate.ts
│   │   ├── routes/
│   │   │   └── chat.routes.ts
│   │   └── services/
│   │       ├── conversation.service.ts
│   │       ├── llm.service.ts
│   │       └── message.service.ts
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   ├── components/
    │   │   ├── ChatArea.tsx
    │   │   ├── InputBar.tsx
    │   │   ├── MessageBubble.tsx
    │   │   ├── Sidebar.tsx
    │   │   ├── TypingIndicator.tsx
    │   │   ├── WelcomeScreen.tsx
    │   │   └── ui/Fa.tsx   # Font Awesome pixel-size wrapper
    │   ├── hooks/
    │   │   ├── useChat.ts  # Chat state + optimistic UI + session persistence
    │   │   └── useTheme.ts # Dark/light toggle with localStorage
    │   └── services/api.ts
    ├── .env.example
    └── package.json
```
