# Deployment Guide

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND - Firebase Hosting                                     │
│  URL: https://kairo.srinesh.in (or custom domain)               │
│  Build: dist/                                                    │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ API calls (HTTPS/WebSocket)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  WHATSAPP BRIDGE - Persistent Server (NOT Vercel)               │
│  ⚠️  WhatsApp requires persistent connections                   │
│  ⚠️  Serverless (Vercel, AWS Lambda) will NOT work             │
│                                                                  │
│  Recommended hosting:                                            │
│  - Railway (railway.app) - $5/mo starter                       │
│  - Render - Free tier available                                 │
│  - Fly.io - Free tier available                                 │
│  - DigitalOcean Droplet - $4/mo                                 │
│  - Any VPS with Node.js support                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Frontend Deployment (Firebase)

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### 2. Initialize Firebase (first time only)
```bash
firebase init hosting
# Select: Use existing project
# Select: kairo (or your project ID)
# Public directory: dist
# Single-page app: Yes
# Don't overwrite index.html
```

### 3. Deploy
```bash
npm run build  # Build first
firebase deploy
```

### Custom Domain (optional)
```bash
firebase hosting:sites:create kairo-app
firebase hosting:domain:add kairo.srinesh.in
```

---

## WhatsApp Bridge Deployment (Railway example)

### 1. Prepare bridge for deployment
The bridge needs persistent storage for WhatsApp sessions.

### 2. Deploy to Railway
```bash
# Install Railway CLI
npm install -g @railway/cli
railway login

# Initialize in whatsapp-bridge directory
cd whatsapp-bridge
railway init

# Set environment variables in Railway dashboard:
# - GROQ_API_KEY=your_key
# - BRIDGE_PORT=3001
# - ALLOWED_ORIGINS=https://kairo.srinesh.in
# - CALENDAR_URL=https://kairo.srinesh.in

# Deploy
railway up
```

### 3. Get bridge URL
After deployment, Railway will give you a URL like: `https://kairo-bridge.up.railway.app`

### 4. Update frontend .env
```
VITE_BRIDGE_URL=https://kairo-bridge.up.railway.app
```

### 5. Rebuild and redeploy frontend
```bash
npm run build
firebase deploy
```

---

## Vercel Bridge (NOT RECOMMENDED)

⚠️ **Vercel serverless functions will NOT work for WhatsApp bridge**

WhatsApp Baileys requires:
- Persistent WebSocket connections
- Long-running processes
- File system access for session storage

Serverless functions:
- Timeout after 10-30 seconds
- Don't maintain persistent connections
- File system is ephemeral

If you still want to try, use Vercel Serverless Functions with WebSockets (paid feature):
```json
// vercel.json
{
  "version": 2,
  "functions": {
    "api/**/*.js": {
      "memory": 3008,
      "timeout": 60
    }
  }
}
```

But expect it to disconnect frequently and lose WhatsApp sessions.

---

## Environment Variables Summary

### Frontend (.env)
```
VITE_BRIDGE_URL=https://your-bridge-url.railway.app
VITE_USE_BRIDGE_PROXY=true
```

### Bridge Server (Railway/Render env vars)
```
GROQ_API_KEY=your_groq_key
BRIDGE_PORT=3001
ALLOWED_ORIGINS=https://kairo.srinesh.in
CALENDAR_URL=https://kairo.srinesh.in
```
