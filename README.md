<p align="center">
  <img src="docs/assets/kairo-logo.png" alt="Kairo Logo" width="120" height="120" />
</p>

<h1 align="center">Kairo</h1>

<p align="center">
  <strong>AI-Powered Calendar with WhatsApp Integration</strong>
</p>

<p align="center">
  An intelligent calendar that automatically extracts events from WhatsApp messages using AI, featuring natural language scheduling and real-time sync.
</p>

<p align="center">
  <a href="https://kairocalender.web.app">Live App</a> &bull;
  <a href="#features">Features</a> &bull;
  <a href="#architecture">Architecture</a> &bull;
  <a href="SETUP.md">Setup Guide</a> &bull;
  <a href="docs/architecture.html">Full Architecture Docs</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Supabase-Realtime-3FCF8E?style=flat-square&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Groq-Llama_3.3_70B-7C3AED?style=flat-square" alt="Groq" />
  <img src="https://img.shields.io/badge/AWS-EC2-FF9900?style=flat-square&logo=amazon-aws" alt="AWS" />
</p>

---

## The Problem

College students receive hundreds of WhatsApp messages daily about class schedules, exam dates, assignment deadlines, and event postponements. Important information gets buried in group chats, leading to:

- **Missed deadlines** from overlooked messages
- **Manual calendar entry** that's tedious and error-prone
- **Information scattered** across multiple group chats

## The Solution

**Kairo** monitors your WhatsApp groups and automatically extracts calendar events using AI. Connect WhatsApp, select your groups, and let Kairo handle the rest.

<!-- 📸 TODO: Add a hero screenshot here: docs/assets/demo-screenshot.png -->

---

## Features

### AI-Powered Event Extraction
- **WhatsApp Integration** — Connect via QR code, monitor selected groups in real-time
- **Multi-format Support** — Extract events from text messages, images (timetables), and PDFs
- **Smart Filtering** — Keyword relevance scoring identifies schedule-related messages
- **LLM Processing** — Powered by Llama 3.3 70B (text) and Llama 4 Scout (vision) via Groq

### Natural Language Scheduling
Chat with Kairo to manage your calendar:
```
"Add lunch with Sarah at 1pm tomorrow"
"What do I have on Friday?"
"Move my meeting to 3pm"
"Cancel tomorrow's gym session"
```

### Modern Calendar Experience
- **Drag-and-Drop** — Reschedule events by dragging (15-minute snap intervals)
- **Week/Month/Day Views** — Switch between calendar perspectives
- **Recurring Events** — Daily, weekly, and monthly patterns
- **Smart Awake Hours** — Grays out sleep periods (customizable)
- **Dark/Light Theme** — Automatic or manual theme switching

### Real-time Sync
- **Multi-device** — Changes sync instantly across all connected browsers
- **Supabase Realtime** — WebSocket-based live updates
- **Optimistic UI** — Instant local feedback with background sync

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        KAIRO ARCHITECTURE                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─────────────┐     ┌──────────────┐     ┌──────────────────┐   │
│  │   React     │────▶│   Supabase   │◀────│ WhatsApp Bridge  │   │
│  │   SPA       │     │   (BaaS)     │     │ (Node/EC2)       │   │
│  │             │     │              │     │                  │   │
│  │  • Calendar │     │  • Auth/JWT  │     │  • whatsapp-web  │   │
│  │  • AI Chat  │     │  • Realtime  │     │  • Session Mgr   │   │
│  │  • DnD      │     │  • Postgres  │     │  • Event Queue   │   │
│  └──────┬──────┘     └──────────────┘     └────────┬─────────┘   │
│         │                                          │              │
│         │            ┌──────────────┐              │              │
│         └───────────▶│   Groq API   │◀─────────────┘              │
│                      │   (LLM/AI)   │                             │
│                      │              │                             │
│                      │ Llama 3.3 70B│                             │
│                      │ Llama 4 Scout│                             │
│                      └──────────────┘                             │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18, Tailwind CSS, Vite 5 | SPA with calendar views, AI chat, WhatsApp panel |
| **State** | Zustand + Supabase Realtime | Client-side state + live database subscriptions |
| **Database** | Supabase (PostgreSQL + Realtime) | Auth, data storage, real-time sync, RLS |
| **AI/LLM** | Groq API (Llama 3.3 70B, Llama 4 Scout) | Event extraction, chat, vision/OCR |
| **WhatsApp** | Node.js + whatsapp-web.js + Chromium | Multi-tenant bridge on Docker |
| **Hosting** | Firebase Hosting (frontend) | Global CDN, auto-SSL |
| **Bridge Server** | AWS EC2 t3.micro (Docker Compose) | WhatsApp sessions, Groq proxy |
| **CI/CD** | GitHub Actions | Auto-deploy bridge to EC2 on push |

### Key Design Decisions

1. **Multi-tenant WhatsApp Bridge on EC2**
   - Each user gets an isolated headless Chromium session
   - Docker Compose with health checks and auto-restart
   - Sessions persist via LocalAuth on the EC2 filesystem
   - GitHub Actions CI/CD for automated deployment

2. **Groq for LLM Inference**
   - ~200ms inference (vs 2-3s for alternatives)
   - Vision model for timetable images and PDFs
   - API keys stay server-side, proxied through bridge

3. **Supabase as Backend**
   - Row Level Security ensures data isolation per user
   - Realtime subscriptions for instant UI updates
   - Built-in auth with Google OAuth support

---

## Project Structure

```
kairo/
├── src/
│   ├── api/                 # API clients (Groq proxy, WhatsApp bridge)
│   ├── components/
│   │   ├── Calendar/        # Week/Month/Day views, EventBlock, DnD
│   │   ├── Chat/            # AI chat sidebar
│   │   ├── Modal/           # Event editor, Profile, Settings tabs
│   │   └── WhatsApp/        # Connection UI, QR scanner, group picker
│   ├── contexts/            # Auth context (Supabase)
│   ├── hooks/               # Custom hooks (bridge status, sync, media)
│   ├── lib/                 # Supabase client, date utilities
│   ├── pages/               # Login, Signup, ForgotPassword
│   └── store/               # Zustand stores (events, settings, theme)
│
├── whatsapp-bridge/         # Separate Node.js service (deployed to EC2)
│   ├── bridge-server.js     # Express API (auth, connect, disconnect, chat)
│   ├── sessionManager.js    # Per-user WhatsApp session lifecycle
│   ├── whatsappProcessor.js # Message → Groq → event extraction
│   ├── extractor.js         # LLM prompt engineering for extraction
│   ├── supabaseClient.js    # Admin + user-scoped Supabase clients
│   ├── middleware/           # Auth middleware (cookie + header validation)
│   ├── Dockerfile           # Node 20 Alpine + Chromium
│   └── docker-compose.yml   # Production orchestration
│
├── docs/
│   ├── architecture.html    # Interactive architecture documentation
│   └── screenshots/         # Product screenshots
│
└── .github/workflows/
    └── deploy-bridge.yml    # CI/CD: SSH deploy to EC2 on push
```

---

## Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Firebase Hosting | [kairocalender.web.app](https://kairocalender.web.app) |
| Bridge Server | AWS EC2 (Docker) | `18.61.114.31:3001` |
| Database | Supabase Cloud | Managed PostgreSQL |
| AI/LLM | Groq Cloud | API-based inference |

---

## Getting Started

See the [Setup Guide](SETUP.md) for full local development instructions.

```bash
# Clone and install
git clone https://github.com/srineshr1/kairo.git
cd kairo && npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase and Groq keys

# Start frontend dev server
npm run dev

# Start bridge (separate terminal)
cd whatsapp-bridge
cp .env.example .env
npm install && npm run dev
```

---

## Screenshots

<!-- 📸 TODO: Add actual screenshots to docs/assets/ -->
<!-- Recommended: main-dashboard, ai-chat, whatsapp-connect, month-view, dark-mode -->

| Screenshot | Description |
|-----------|-------------|
| 📸 `docs/assets/week-view.png` | Week view with drag & drop events |
| 📸 `docs/assets/chat-ai.png` | AI chat for natural language scheduling |
| 📸 `docs/assets/whatsapp-sync.png` | WhatsApp QR connect and group selection |
| 📸 `docs/assets/dark-mode.png` | Dark mode with glass morphism UI |
| 📸 `docs/assets/mobile-view.png` | Responsive mobile layout |

---

## Future Roadmap

- [ ] Google Calendar sync (OAuth)
- [ ] TLS on bridge (Caddy reverse proxy)
- [ ] Telegram integration
- [ ] Shared calendars for teams
- [ ] Voice input for event creation
- [ ] Calendar analytics dashboard

---

## License

This project is private and not open for redistribution.

---

<p align="center">
  <strong>Built with React + Supabase + Groq AI + AWS</strong>
</p>

<p align="center">
  <a href="https://kairocalender.web.app">Live App</a> &bull;
  <a href="SETUP.md">Setup Guide</a> &bull;
  <a href="docs/architecture.html">Architecture Docs</a>
</p>
