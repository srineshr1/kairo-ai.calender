# Kairo — Agent Notes

## Repo topology
- **Frontend**: ESM (`"type": "module"`), Vite + React 18, runs at `/`.
- **Bridge**: CommonJS (`"type": "commonjs"`), Express 4, lives in `whatsapp-bridge/`.
- Entrypoints: `src/main.jsx` → `src/App.jsx` (frontend), `whatsapp-bridge/bridge-server.js` (bridge).
- Do not mix `import`/`require` across the boundary.

## Commands
| What | Command |
|------|---------|
| Start frontend dev | `npm run dev` |
| Build frontend | `npm run build` |
| Preview prod build | `npm run preview` |
| Tests (watch) | `npm run test` |
| Single test file | `npx vitest run src/__tests__/dateUtils.test.js` |
| Typecheck | `npx tsc --noEmit` |
| Bridge (prod) | `cd whatsapp-bridge && npm start` |
| Bridge (dev, watch) | `cd whatsapp-bridge && npm run dev` |
| Deploy frontend | `npm run build && npx firebase deploy --only hosting` |
| Deploy bridge | push to `BackendChanges` (CI auto-deploys via SSH to EC2) |
| No ESLint, Prettier, or CI beyond the bridge deploy workflow. | |

## Deploy bridge manually to EC2
```
ssh -i aws/kairo-bridge-key.pem ubuntu@18.61.114.31 \
  "cd ~/kairo && git fetch origin BackendChanges && git reset --hard origin/BackendChanges && cd whatsapp-bridge && docker compose up -d --build"
```
EC2 repo is at `~/kairo/`, Docker container is `kairo-bridge`, port 3001.
There is also a reverse proxy on port 443 → 3001 on the EC2 instance.

## Environment variables

### Frontend (`.env.production`, baked at build time)
| Var | Purpose |
|-----|---------|
| `VITE_BRIDGE_URL` | Bridge base URL (prod: `https://18.61.114.31.nip.io`) |
| `VITE_USE_BRIDGE_PROXY` | Route Groq through bridge (`true` in prod) |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |

Never set `VITE_GROQ_API_KEY` — it embeds in the JS bundle.
Use `VITE_USE_BRIDGE_PROXY=true` instead (bridge proxies Groq).

In dev only: `VITE_REQUIRE_AUTH` controls auth enforcement (`src/lib/envConfig.js`).

### Bridge (`.env` on EC2)
Required: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GROQ_API_KEY`.
Also needed: `SUPABASE_ANON_KEY` for user-scoped write client.
Optional: `SUPABASE_JWT_SECRET` — if set, `getUserSupabase()` signs a user JWT (RLS-respecting). If unset, it falls back to admin client (service role bypasses RLS but `user_id` filtering still applies).

`NODE_ENV=production` is set in `docker-compose.yml` environment. Bridge cookie is `sameSite: 'none'` in production (needs HTTPS, which the EC2 reverse proxy provides on 443).

## Auth flow (updated — no longer file-based)

1. Frontend gets API key from Supabase via `get_or_create_bridge_api_key()` RPC (SECURITY DEFINER, reads/inserts `bridge_api_keys` table).
2. `setBridgeCredentials(userId, apiKey)` stores both in module-level memory only (never localStorage/sessionStorage).
3. It also fires a best-effort `POST /users/:userId/auth-cookie` to get an httpOnly cookie on the bridge domain.
4. `authHeaders()` sends `X-User-ID` + `X-API-Key` from memory on every bridge call.
5. Bridge middleware: first tries cookie JWT, then falls back to header auth → `validateCredentials()` against Supabase `bridge_api_keys`.
6. `validateUserParam` prevents cross-user access (`req.userId` must match `:userId` param).

The `/register` endpoint no longer exists. API keys live in Supabase `bridge_api_keys`, not `api-keys.json`.

## Bridge Supabase clients
- `getAdminSupabase()` — service role key, bypasses RLS. Used for auth lookups (`bridge_api_keys`) and `resetStaleStatus()`.
- `getUserSupabase(userId)` — tries anon key + signed user JWT (RLS-respecting). Falls back to admin client when `SUPABASE_JWT_SECRET` is missing. Used by `sessionManager.writeStatus()` and `whatsappProcessor.pushEvents()`.

## Bridge routes
| Method | Path | Auth |
|--------|------|------|
| `GET` | `/health` | Public |
| `POST` | `/users/:userId/auth-cookie` | Public (inline `isValidUserId` check only) |
| `POST` | `/users/:userId/connect` | Auth required |
| `POST` | `/users/:userId/disconnect` | Auth required |
| `POST` | `/users/:userId/logout` | Auth required |
| `POST` | `/users/:userId/chat` | Auth required (Groq proxy, 30 req/min) |

## Vite dev proxy
Only `/users` and `/health` are proxied to `http://localhost:3001` (`vite.config.js:24-27`).
New bridge endpoints need the proxy config updated. In dev, `whatsappClient.js` sets `BRIDGE_URL` to `''` so requests go through the proxy.

## CORS
Bridge allows: `localhost:5173-5175`, `kairocalender.web.app`, `kairocalender.firebaseapp.com`, `kairo.srinesh.in`, plus wildcard patterns `*.onrender.com`, `*.ngrok-free.dev`, `*.ngrok.io`, `*.nip.io`. CORS credentials enabled.

## Groq gotcha
`src/api/groqClient.js:231` — If `VITE_USE_BRIDGE_PROXY=true` but `VITE_BRIDGE_URL` is missing/empty, throws immediately with a clear message.

## Rate limits (bridge)
- Global: 120 req/min per user (fallback to IP if no `X-User-ID` header).
- Groq proxy (`/chat`): 30 req/min per user.

## Data constraints
- Supabase schema in `supabase/schema.sql` — apply manually (no migration tool).
- `supabase/bridge_rls_fix.sql` and `supabase/whatsapp_rebuild.sql` must also be applied manually.
- RLS policies on user-scoped tables; code assumes `user_id` filtering.
- `bridge_api_keys` table has a UNIQUE constraint on `user_id` — one key per user.
- `whatsapp_status`, `whatsapp_chats`, `whatsapp_events`, `whatsapp_watched_groups` tables needed for WhatsApp features.

## Testing
- Vitest in `jsdom` with globals, `src/setupTests.js`.
- `setupTests.js` mocks `localStorage`, `matchMedia`, `DOMMatrix`, `Path2D` (pdfjs-dist), `scrollIntoView`, silences `console.error`/`console.warn`.
- Default timeout 5000 ms.
- Tests: `src/__tests__/`, `src/components/Modal/__tests__/`, `whatsapp-bridge/__tests__/`.

## Conventions
- `@/*` path alias → `src/`.
- React files are `.jsx`; TS (`.ts`/`.tsx`) used selectively with strict options.
- Zustand stores in `src/store/`.
- Bridge `package.json` `"main"` says `index.js` but the real entrypoint is `bridge-server.js` — the `start` script targets the correct file.
- `BRIDGE_REQUIRE_AUTH=false` only works when `NODE_ENV=development` (ignored in production).
