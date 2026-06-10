# ShopEase Support

A full-stack AI-powered customer support chat application for a fictional e-commerce store.

## Tech Stack

| Layer      | Technology                                   |
|------------|----------------------------------------------|
| Backend    | Node.js 20+, TypeScript, Express             |
| Database   | SQLite via `sql.js` (WASM — no build tools)  |
| Cache      | Redis (optional, Upstash free tier)          |
| LLM        | OpenAI GPT-4o mini                           |
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS     |
| Icons      | Font Awesome 6 Free                          |
| Validation | Zod                                          |

---

## Local Setup

### Prerequisites
- Node.js 20+
- OpenAI API key (platform.openai.com)

### 1. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure backend

```bash
cd backend
cp .env.example .env
# Set OPENAI_API_KEY in .env
```

### 3. Start servers

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

Open `http://localhost:5173`.

---

## Deployment

### Frontend → Vercel

1. Push this repo to GitHub
2. Import at vercel.com/new
3. Set **Root Directory** to `frontend`
4. Add env var: `VITE_API_URL=<your-backend-url>`
5. Deploy

### Backend → AWS Elastic Beanstalk

1. Build: `cd backend && npm run build`
2. Install EB CLI: `pip install awsebcli`
3. `eb init spur-assignment --platform node.js --region us-east-1`
4. `eb create spur-assignment-prod`
5. Set environment variables via EB Console or `eb setenv KEY=VALUE`

### Redis (Upstash free tier)

1. Sign up at console.upstash.com
2. Create a new Redis database
3. Copy the `rediss://...` URL
4. Set `REDIS_URL=rediss://...` in your backend environment

---

## API

| Method | Path                       | Description                    |
|--------|----------------------------|--------------------------------|
| POST   | `/chat/message`            | Send message, receive AI reply |
| GET    | `/chat/history/:sessionId` | Fetch conversation history     |
| GET    | `/chat/conversations`      | List all conversations         |
| GET    | `/health`                  | Health check                   |

---

## Features

- Real-time AI chat with conversation history
- Session persistence via localStorage
- Dark / light theme toggle
- Fully responsive (mobile, tablet, desktop)
- Optimistic UI with error rollback
- Redis caching with graceful degradation
- Per-IP rate limiting (Redis-backed when available)
- Smooth animations and polished design
