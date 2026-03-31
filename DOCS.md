# Kairo - Technical Documentation

> This document contains detailed technical documentation for Kairo. For the main project overview, see [README.md](README.md). For setup instructions, see [SETUP.md](SETUP.md).

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [API Endpoints](#api-endpoints)
- [Configuration](#configuration)
- [Code Quality](#code-quality)
- [Known Limitations](#known-limitations)

---

## Features

### Calendar Management
- **Week View** - 24-hour timeline with 5-day work week (Monday-Friday)
- **Drag-and-Drop Scheduling** - Rearrange events by dragging them to different days/times with 15-minute snap intervals
- **Sleep/Awake Zones** - Customizable "awake hours" (default 6am-midnight) with grayed-out sleep periods
- **Recurring Events** - Support for daily, weekly, and monthly recurrence patterns
- **Color Coding** - 5 color themes (pink, green, blue, amber, gray) for event categorization
- **Real-time "Now" Line** - Shows current time on today's column
- **Dark/Light Mode** - Persistent theme preference with smooth transitions
- **Loading States** - Smooth loading indicators for all async operations
- **Error Handling** - Toast notifications for user-friendly error messages

### AI Assistant
- **Natural Language Processing** - Uses Groq API (Llama 3.3 70B) for calendar queries
- **Conversational Event Management**
  - Add events: "Add lunch at 1pm tomorrow"
  - Query schedule: "What do I have today?"
  - Edit/Delete events through conversation
- **Model Selection** - Customizable LLM model
- **Connection Status** - Visual indicator (green/yellow/red dot) showing API connectivity

### WhatsApp Integration
- **Automated Event Extraction** - Monitors WhatsApp groups for schedule information
- **Multi-format Support**
  - **Text Messages** - Extracts events from text containing keywords (exam, postponed, timetable, etc.)
  - **Images** - Uses vision models for timetable/schedule images
  - **PDFs** - Extracts text from PDF documents for event parsing
- **Smart Filtering** - Keyword-based relevance detection
- **Group Selection** - User-configurable group monitoring
- **QR Code Authentication** - One-time WhatsApp Web scan, session persists
- **Event Queue System** - Polls bridge server every 3 seconds for new events

### Task Management
- **Status Tracking**
  - Done (green pill)
  - Upcoming (blue pill)
  - Overdue (red pill)
  - Cancelled (gray pill)
- **Task Log** - Historical record of all task status changes with timestamps
- **Month View** - Shows current month's tasks in sidebar

### Mini Calendar
- Month-at-a-glance view in sidebar
- Date navigation (click to jump to that week)
- Event indicators (dots on dates with events)
- Today highlighting

---

## Tech Stack

### Frontend
- **React 18.3.1** - UI framework
- **TypeScript 5.9.3** - Type safety for core utilities and stores
- **Vite 5.3.5** - Build tool & dev server
- **Vitest 4.1.0** - Unit testing framework
- **Tailwind CSS 3.4.7** - Utility-first CSS framework
- **date-fns 3.6.0** - Date manipulation library
- **Zustand 4.5.4** - Lightweight state management with localStorage persistence
- **@dnd-kit/core** - Modern drag-and-drop toolkit
- **@supabase/supabase-js** - Supabase client for auth and realtime

### AI/Backend
- **Groq API** - Cloud LLM inference
  - Default model: `llama-3.3-70b-versatile`
- **Supabase** - PostgreSQL database with realtime subscriptions

### WhatsApp Bridge
- **Node.js** (CommonJS)
- **whatsapp-web.js 1.34.6** - WhatsApp Web API wrapper
- **Express 5.2.1** - HTTP server
- **Puppeteer** - Browser automation for WhatsApp
- **axios** - HTTP client

---

## Project Structure

```
kairo/
├── src/
│   ├── api/                    # API abstraction layer
│   │   ├── groqClient.js       # Groq LLM API client
│   │   └── whatsappClient.js   # WhatsApp bridge API client
│   ├── components/
│   │   ├── Calendar/           # WeekView, DayColumn, EventBlock, TopBar
│   │   ├── Chat/               # ChatSidebar, AI integration
│   │   ├── Modal/              # EventModal, SettingsModal
│   │   │   └── tabs/           # Settings modal tabs
│   │   ├── Notifications/      # NotificationPanel, NotificationItem
│   │   ├── Sidebar/            # Sidebar, TaskList, MiniCalendar
│   │   ├── WhatsApp/           # WhatsAppSettings, WhatsAppPopup
│   │   ├── ErrorBoundary.jsx   # Error boundary component
│   │   ├── LoadingSpinner.jsx  # Loading components
│   │   ├── ToastContainer.jsx  # Toast notification system
│   │   ├── ProtectedRoute.jsx  # Auth route wrapper
│   │   └── Icons.jsx           # Icon components
│   ├── contexts/               # React contexts
│   │   └── AuthContext.jsx     # Supabase authentication context
│   ├── hooks/                  # Custom React hooks
│   │   ├── useWhatsAppSync.js  # WhatsApp polling
│   │   ├── useWhatsAppBridgeStatus.js  # Bridge status
│   │   ├── useDebounce.js      # Debounce utility
│   │   ├── useLocalStorage.js  # localStorage wrapper
│   │   ├── usePWA.js           # PWA install prompt
│   │   └── useAsync.js         # Async state management
│   ├── lib/                    # Utility functions
│   │   ├── dateUtils.ts        # Date utilities (TypeScript)
│   │   ├── constants.ts        # App constants (TypeScript)
│   │   ├── supabase.js         # Supabase client initialization
│   │   ├── supabaseQueries.js  # Supabase query helpers
│   │   └── validation.js       # Input validation
│   ├── pages/                  # Page components
│   │   ├── Login.jsx           # Login page
│   │   ├── Signup.jsx          # Registration page
│   │   ├── ForgotPassword.jsx  # Password reset
│   │   └── AuthCallback.jsx    # OAuth callback
│   ├── store/                  # Zustand state management
│   │   ├── useEventStore.js    # Event CRUD
│   │   ├── useChatStore.js     # Chat history
│   │   ├── useToastStore.js    # Toast notifications
│   │   ├── useDarkStore.js     # Dark mode
│   │   ├── useNotificationStore.js  # Notification queue
│   │   ├── useSettingsStore.js # App settings
│   │   └── useWhatsAppSettings.js  # WhatsApp preferences
│   ├── __tests__/              # Unit & integration tests
│   ├── App.jsx                 # Root component
│   ├── main.jsx                # React entry point
│   └── index.css               # Global styles
├── whatsapp-bridge/
│   ├── sessions/               # Session management
│   │   └── manager.js          # Per-user session manager
│   ├── bridge-server.js        # Express API server
│   ├── analyzer.js             # AI-powered content analysis
│   ├── extractor.js            # Event parsing utilities
│   ├── calendarPush.js         # Event queue management
│   ├── config.js               # User configuration
│   └── public/                 # Static files
├── .env.example                # Frontend environment template
├── SETUP.md                    # Setup instructions
├── ARCHITECTURE.md             # System architecture
├── package.json
├── vite.config.js
├── vitest.config.js
├── tailwind.config.js
└── index.html
```

---

## How It Works

### Event Storage
- Events stored in Supabase PostgreSQL database
- Local cache in browser localStorage via Zustand persist middleware
- Each event contains: id, title, location, date, time, duration, color, recurrence
- Recurring events stored once and expanded dynamically for display
- Real-time sync via Supabase Realtime subscriptions

### AI Chat Assistant
- User input sent to Groq API with context (current events, today's date)
- Model responds with structured JSON actions: add/edit/delete/none
- Calendar automatically updates based on AI responses
- Temperature set to 0.1 for consistent structured output

### WhatsApp Event Extraction
1. Bridge monitors configured WhatsApp groups for messages
2. Filters messages by keyword relevance
3. Routes to appropriate analyzer based on content type:
   - **Text**: Groq API with event extraction prompt
   - **Images**: Vision model for timetable recognition
   - **PDFs**: Text extraction → event parsing
4. Extracts structured event data with Indian date format support
5. Pushes events to user's event queue
6. Frontend polls queue and auto-imports events
7. Toast notifications confirm additions

### Drag & Drop
- Events are draggable via @dnd-kit library
- Day columns are droppable targets
- On drop: calculates new date/time based on Y-axis delta (snapped to 15-min intervals)
- Updates event in store automatically

---

## API Endpoints (WhatsApp Bridge)

The WhatsApp Bridge server runs on port 3001 (configurable):

### Authentication
- `GET /qr/:userId` - Get QR code for WhatsApp authentication
- `GET /status/:userId` - Get connection status for a user

### Events
- `GET /events/:userId` - Fetch event queue for a user
- `POST /events/:userId` - Add event to user's queue
- `DELETE /events/:userId` - Clear user's event queue

### Health
- `GET /health` - Health check endpoint

---

## Configuration

### Customizing Awake Hours
Click the clock icon in the WeekView to set your sleep/awake schedule.

### Selecting AI Model
The default model is `llama-3.3-70b-versatile`. Configure in environment variables if needed.

### WhatsApp Groups
1. Click WhatsApp icon in top bar
2. Add/remove groups to monitor
3. Toggle sync on/off as needed

### Event Colors
Choose from 5 color themes when creating/editing events:
- Pink (default)
- Green
- Blue
- Amber
- Gray

---

## Code Quality & Architecture

### TypeScript Migration
The codebase uses TypeScript for improved type safety:

**TypeScript Files:**
- `src/lib/dateUtils.ts` - Date utilities with full type definitions
- `src/lib/constants.ts` - Centralized app constants

**Key Interfaces:**
```typescript
interface Event {
  id: string
  title: string
  date: string  // YYYY-MM-DD
  time: string  // HH:MM
  duration: number
  sub: string
  color: 'pink' | 'green' | 'blue' | 'amber' | 'gray'
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly'
  recurrenceEnd: string
  done: boolean
}
```

### API Abstraction Layer

**groqClient.js** - Groq API communication
- `generateText()` - Send prompts to LLM
- `checkHealth()` - Verify API is accessible
- Custom error handling

**whatsappClient.js** - WhatsApp bridge communication
- `getEvents()` - Fetch events from bridge
- `clearEvents()` - Clear processed events
- `getStatus()` - Get connection status and QR
- Custom `WhatsAppBridgeError` for error handling

### Custom Hooks

Reusable React hooks for common patterns:

- **useDebounce** - Debounce values for search/input
- **useLocalStorage** - Sync state with localStorage
- **useAsync** - Manage async operation states (loading, error, data)
- **usePWA** - PWA installation prompt handling
- **useMobileLayout** - Responsive layout detection

### Constants Extraction

Centralized constants in `src/lib/constants.ts`:
- Calendar configuration (PX_PER_HOUR, DAYS_OF_WEEK)
- Time/duration defaults
- Network/API config
- UI/animation settings
- Event colors and recurrence types
- Validation limits

---

## Known Limitations

- WhatsApp bridge requires active internet connection
- WhatsApp session may need re-authentication after ~2 weeks
- Calendar currently supports 5-day work week only (Monday-Friday)
- Groq API has rate limits on free tier

---

## Troubleshooting

### Supabase Connection Issues
- Ensure environment variables are set correctly
- Check Supabase project is active (free tier pauses after inactivity)
- Verify API keys are valid

### WhatsApp Bridge Not Working
- Check bridge server is running
- Re-scan QR code if session expired
- Verify CORS configuration for your frontend URL
- Check Railway logs for production issues

### Events Not Syncing
- Verify sync is enabled in WhatsApp settings
- Check bridge server logs for errors
- Ensure keywords in config match your message content

### Groq API Issues
- Verify API key is valid
- Check rate limits on free tier
- Review error messages in browser console

---

## Acknowledgments

- [Groq](https://groq.com) - Fast LLM inference
- [Supabase](https://supabase.com) - Backend as a service
- [whatsapp-web.js](https://wwebjs.dev) - WhatsApp Web API
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [dnd-kit](https://dndkit.com) - Drag and drop
- [Zustand](https://zustand-demo.pmnd.rs) - State management
