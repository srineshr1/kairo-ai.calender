# WhatsApp Bridge Server

Multi-tenant WhatsApp bridge server for the Kairo calendar app. Handles WhatsApp message processing, event extraction using Groq AI, and serves as a secure proxy for the Groq API. Deployed on AWS EC2 behind a Caddy reverse proxy.

## Quick Start

### Local Development

```bash
npm install
cp .env.example .env   # edit with your SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GROQ_API_KEY
npm run dev             # starts on http://localhost:3001
```

Verify: `curl http://localhost:3001/health`

### Production (EC2 + Docker)

```bash
# On the EC2 instance:
cd ~/kairo/whatsapp-bridge
docker compose up -d --build
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full EC2 setup guide.

## Architecture

```
Internet ──▶ Caddy (:443, TLS) ──▶ Bridge (:3001, Docker)
                 │                       │
            Security headers          Express API
            Request limits            whatsapp-web.js
            Auto-TLS (LE)             Chromium headless
```

## Project Structure

```
whatsapp-bridge/
├── bridge-server.js       # Express API (health, auth-cookie, connect, disconnect, chat)
├── sessionManager.js      # Per-user WhatsApp session lifecycle
├── whatsappProcessor.js   # Message listener → event extraction pipeline
├── extractor.js           # LLM prompt engineering for event extraction
├── supabaseClient.js      # Admin + user-scoped Supabase clients
├── middleware/
│   └── bridgeAuth.js      # Cookie JWT + X-API-Key header validation
├── Dockerfile             # Node 20 Alpine + Chromium
├── docker-compose.yml     # Production container + resource limits
└── .env                   # Secrets (never committed)
```

## Environment Variables

Set in `.env` on the EC2 instance:

| Variable | Required | Purpose |
|----------|----------|---------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (admin) |
| `SUPABASE_ANON_KEY` | Yes | Anon key for user-scoped client |
| `GROQ_API_KEY` | Yes | Groq API key for LLM inference |
| `SUPABASE_JWT_SECRET` | No | Signs user JWT for RLS; falls back to admin if unset |
| `BRIDGE_REQUIRE_AUTH` | No | Defaults `true` in production |
| `PORT` | No | Defaults `3001` |

`NODE_ENV=production` is set in `docker-compose.yml`.

## API Endpoints

### Public

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check (returns JSON) |

### Auth-required

All require `X-User-ID` + `X-API-Key` headers (or cookie JWT):

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/users/:userId/auth-cookie` | Set httpOnly cookie (public, validates userId) |
| `POST` | `/users/:userId/connect` | Start WhatsApp session |
| `POST` | `/users/:userId/disconnect` | Stop WhatsApp session |
| `POST` | `/users/:userId/logout` | Delete session + clear auth |
| `POST` | `/users/:userId/chat` | Groq proxy (30 req/min per user) |

## Auth Flow

1. Frontend gets API key from Supabase via `get_or_create_bridge_api_key()` RPC
2. Credentials sent as `X-User-ID` + `X-API-Key` headers on every request
3. Bridge middleware validates against `bridge_api_keys` table in Supabase
4. Cookie JWT is also supported (set via `/auth-cookie` endpoint)

## Security Hardening

| Layer | Measure | Value |
|-------|---------|-------|
| OS | Swap space | 4 GB (prevents OOM kills on 1 GB t3.micro) |
| Container | Memory limit | 700 MiB hard, 500 MiB soft, 1 GiB swap cap |
| Node.js | V8 heap cap | `--max-old-space-size=400 --max-semi-space-size=32` |
| Caddy | TLS | Auto Let's Encrypt, HSTS |
| Caddy | Request body limit | 1 MB max |
| Caddy | Timeouts | 10s dial, 30s response header |
| Caddy | Security headers | X-Frame-Options, X-Content-Type-Options, Referrer-Policy, hide Server |
| App | Rate limits | 120 req/min per user, 30 req/min for Groq |
| App | Auth | All sensitive endpoints require validated credentials |

## CORS Configuration

The bridge allows:
- `localhost:5173-5175` (Vite dev server)
- `kairocalender.web.app`, `kairocalender.firebaseapp.com`, `kairo.srinesh.in`
- Wildcards: `*.onrender.com`, `*.ngrok-free.dev`, `*.ngrok.io`, `*.nip.io`
- CORS credentials enabled

## Common Issues

### Bridge health check fails

```bash
# Check container is running
docker ps | grep kairo-bridge

# Check logs
docker logs --tail 50 kairo-bridge

# Check Caddy
sudo systemctl status caddy
```

### Frontend can't connect

1. Verify `VITE_BRIDGE_URL=https://18.61.114.31.nip.io` in frontend `.env.production`
2. Check CORS origins include your frontend URL
3. Ensure security group allows port 443 from your IP

### Container keeps restarting

The container has a 700 MiB memory limit. If Puppeteer + Chromium spike above that, Docker kills it and restarts (health check catches it). Check with:
```bash
docker stats kairo-bridge
docker logs --tail 100 kairo-bridge
```

### WhatsApp sessions lost after reboot

Sessions are persisted in the `bridge-sessions` Docker volume. If the volume is lost, users need to re-scan the QR code.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm start` | Production server (port 3001) |
| `npm run dev` | Development with --watch (Node 18+) |

## Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) — EC2 + Docker + Caddy deployment guide
- [../SETUP.md](../SETUP.md) — Full project setup guide
- [../AGENTS.md](../AGENTS.md) — Agent reference (commands, env vars, auth flow)
