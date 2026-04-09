# Kairo Agent Notes

## Runtime shape (important)
- Two apps must both run for WhatsApp/AI features: frontend (`/`, Vite+React) and bridge server (`whatsapp-bridge/`, Express).
- Frontend entrypoint: `src/main.jsx` → `src/App.jsx` (wrapped by `ErrorBoundary`, `BrowserRouter`, `AuthProvider`).
- Bridge entrypoint: `whatsapp-bridge/bridge-server.js`.
- Frontend is ESM (`"type": "module"`); bridge is CommonJS (`"type": "commonjs"`). Don't mix import styles across the boundary.

## Commands you will actually use
- Frontend: `npm run dev`, `npm run build`, `npm run preview`.
- Tests: `npm run test` (watch), `npx vitest run <path-to-test-file>`, `npm run test:coverage`, `npm run test:ui`.
- Typecheck: `npx tsc --noEmit`.
- Bridge: in `whatsapp-bridge/`, use `npm start` (production) or `npm run dev` (watch mode with `--watch`).
- Deploy frontend: `npm run build && firebase deploy --only hosting`.
- Deploy bridge: from `whatsapp-bridge/`, `railway up --no-gitignore` (the `--no-gitignore` is required because Railway project is not Git-connected).
- There is no ESLint or Prettier config in this repo.

## High-signal env/config gotchas
- Frontend uses `VITE_BRIDGE_URL` (not `VITE_WHATSAPP_BRIDGE_URL`). `SETUP.md` still references the old name — trust the code, not the docs.
- In dev, `whatsappClient.js` intentionally sets `BRIDGE_URL` to `''` (empty string) so requests go through the Vite dev proxy. Only in production does it fall back to `http://localhost:3001`.
- Vite dev proxy only forwards `/register`, `/users`, and `/health` to `http://localhost:3001` (see `vite.config.js`). New bridge endpoints need adding there too.
- `VITE_USE_BRIDGE_PROXY=true` with a missing/empty `VITE_BRIDGE_URL` will throw in `src/api/groqClient.js`.
- Never set `VITE_GROQ_API_KEY` in production — `VITE_*` vars are baked into the client bundle and visible to anyone.
- Auth behavior is environment-driven (`src/lib/envConfig.js`): production always requires auth; in dev, `VITE_REQUIRE_AUTH` controls it.
- Railway auto-sets `PORT`; do not set `BRIDGE_PORT` in production. Locally, bridge defaults to `3001`.

## Bridge auth behavior
- Only `/health` and `/register` are public in `bridge-server.js`.
- All `/users/:userId/*` routes require `X-User-ID` + `X-API-Key` via middleware (`middleware/bridgeAuth.js`).
- Dev auth bypass requires both: `BRIDGE_REQUIRE_AUTH=false` AND `NODE_ENV=development`.
- API keys are stored in `whatsapp-bridge/config/api-keys.json` (file-based, not in Supabase). This file is gitignored.

## Testing realities
- Vitest runs in `jsdom` with globals and `src/setupTests.js`.
- `setupTests.js` globally mocks `localStorage`, `matchMedia`, `DOMMatrix`, `Path2D` (needed by `pdfjs-dist`), `scrollIntoView`, and silences `console.error`/`console.warn`.
- Default test timeout is 5000 ms.
- Test files: `src/__tests__/` (unit) and `src/components/Modal/__tests__/` (component). Bridge tests in `whatsapp-bridge/__tests__/`.

## Data/model constraints
- Supabase schema in `supabase/schema.sql` (no migration tool configured).
- RLS is expected on user-scoped tables; app/store code assumes `user_id` filtering when querying Supabase.

## Deployment
- Frontend: built by Vite (`dist/`), hosted on Firebase Hosting with SPA rewrite (`firebase.json`).
- Bridge: Docker on Railway (`whatsapp-bridge/Dockerfile` — node:20-alpine + Chromium for whatsapp-web.js).

## Useful repo conventions
- Use `@/*` path alias (configured in Vite, Vitest, and TS config).
- React files are mostly `.jsx`; TS (`.ts`/`.tsx`) used selectively with strict options enabled.
- State management: Zustand stores in `src/store/` (useEventStore, useDarkStore, useSettingsStore, useChatStore, useToastStore, useNotificationStore, useWhatsAppSettings).
- Bridge `package.json` says `"main": "index.js"` but actual entrypoint is `bridge-server.js` — the `start` script targets the correct file.