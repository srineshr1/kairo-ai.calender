# AI Calendar Architecture

## System Overview

AI Calendar is a production-ready calendar application with AI-powered event management and WhatsApp integration. The system consists of three main components:

1. **Frontend (React + Vite)** - Calendar UI and AI chat interface
2. **Ollama LLM** - Local language model for natural language event management
3. **WhatsApp Bridge** - Node.js server for WhatsApp message parsing

```
┌─────────────────────────────────────────────────────────────────┐
│                        AI CALENDAR SYSTEM                        │
└─────────────────────────────────────────────────────────────────┘

┌───────────────────────────┐
│   Frontend (React App)    │
│   Port: 5173/5174/5175    │
│                           │
│  ┌─────────────────────┐  │
│  │  Calendar View      │  │      ┌──────────────────────┐
│  │  (Week/Day/Mini)    │  │      │   Ollama LLM Server  │
│  └─────────────────────┘  │      │   Port: 11434        │
│                           │◄────►│                      │
│  ┌─────────────────────┐  │      │  - llama3.2:3b      │
│  │  AI Chat Panel      │  │      │  - Natural Language  │
│  │  (useOllama)        │  │      │  - Event Management  │
│  └─────────────────────┘  │      └──────────────────────┘
│                           │
│  ┌─────────────────────┐  │      ┌──────────────────────┐
│  │  WhatsApp Status    │  │      │  WhatsApp Bridge     │
│  │  (QR Code/Sync)     │  │◄────►│  Port: 3001          │
│  └─────────────────────┘  │      │                      │
└───────────────────────────┘      │  - Message Parser    │
                                    │  - Event Extractor   │
                                    │  - QR Auth           │
                                    └──────────────────────┘
```

## Data Flow

### Event Creation Flow (AI Chat)

```
User Input → useOllama → ollamaClient → Ollama API
                ↓
         Parse JSON Response
                ↓
         Validate Action
                ↓
    ┌───────────┴───────────┐
    │                       │
  [add]                  [edit]                [delete]
    ↓                       ↓                      ↓
useEventStore.addEvent  editEvent             deleteEvent
    ↓                       ↓                      ↓
Zustand Store (localStorage persistence)
    ↓
Calendar UI Update
```

### WhatsApp Event Sync Flow

```
WhatsApp Message → whatsapp-web.js → extractor.js
                                          ↓
                                   Parse Date/Time
                                          ↓
                                   Extract Events
                                          ↓
                               Store in Memory (bridge)
                                          ↓
useWhatsAppSync (polling every 3s) → whatsappClient.getEvents()
                                          ↓
                                    Validate Events
                                          ↓
                                 useEventStore.addEvent()
                                          ↓
                                 Clear from Bridge
                                          ↓
                               Calendar UI Update
```

## Component Architecture

### Frontend Structure

```
src/
├── api/                      # API abstraction layer
│   ├── ollamaClient.js       # Ollama API calls
│   └── whatsappClient.js     # WhatsApp bridge API calls
│
├── components/               # React components
│   ├── Calendar/
│   │   ├── WeekView.jsx     # Main week calendar
│   │   ├── DayColumn.jsx    # Individual day column
│   │   ├── EventCard.jsx    # Event display card
│   │   └── MiniCalendar.jsx # Month overview
│   │
│   ├── Chat/
│   │   ├── ChatPanel.jsx    # AI chat interface
│   │   ├── useOllama.js     # Ollama integration hook
│   │   └── Message.jsx      # Chat message display
│   │
│   ├── Modals/
│   │   ├── AddEventModal.jsx    # Manual event creation
│   │   ├── EditEventModal.jsx   # Event editing
│   │   └── SettingsModal.jsx    # App settings
│   │
│   └── Shared/
│       ├── ErrorBoundary.jsx    # Error boundary wrapper
│       ├── Toast.jsx            # Toast notifications
│       └── LoadingSpinner.jsx   # Loading state
│
├── store/                    # Zustand state management
│   ├── useEventStore.ts      # Event CRUD + persistence
│   ├── useChatStore.js       # Chat history
│   ├── useToastStore.js      # Toast notifications
│   ├── useDarkStore.js       # Dark mode state
│   └── useSettingsStore.js   # App settings
│
├── hooks/                    # Custom React hooks
│   ├── useWhatsAppSync.js    # WhatsApp event polling
│   ├── useWhatsAppBridgeStatus.js  # Bridge connection
│   ├── useDebounce.js        # Debounce utility
│   ├── useLocalStorage.js    # localStorage wrapper
│   └── useAsync.js           # Async state management
│
├── lib/                      # Utility functions
│   ├── dateUtils.ts          # Date manipulation (TypeScript)
│   ├── constants.ts          # App constants (TypeScript)
│   └── validation.js         # Input validation
│
└── __tests__/                # Vitest test files
    ├── Calendar.test.jsx
    ├── useEventStore.test.js
    └── dateUtils.test.js
```

### State Management (Zustand)

```
┌─────────────────────────────────────────────────────────────┐
│                    Zustand Store Layer                       │
└─────────────────────────────────────────────────────────────┘

useEventStore (localStorage: 'calendar-events')
├── events: Event[]
├── addEvent(event)
├── editEvent(id, changes)
├── deleteEvent(id)
├── toggleEventDone(id)
└── expandRecurrence(event, startDate, endDate): ExpandedEvent[]

useChatStore (localStorage: 'chat-history')
├── messages: Message[]
├── model: string
├── isTyping: boolean
├── isOnline: boolean
├── addMessage(message)
├── clearMessages()
└── setModel(model)

useToastStore (in-memory)
├── toasts: Toast[]
├── addToast(message, type, title)
├── removeToast(id)
├── info(message, title)
├── error(message, title)
└── success(message, title)

useDarkStore (localStorage: 'dark-mode')
└── isDark: boolean

useSettingsStore (localStorage: 'settings')
└── settings: { ollamaUrl, bridgeUrl, pollInterval, ... }
```

## API Layer

### ollamaClient.js

Centralized Ollama API communication:

```javascript
generateText({ model, prompt, stream, options })
  → POST /api/generate
  → Returns: { response: string, ... }

checkHealth()
  → GET /api/tags
  → Returns: boolean

listModels()
  → GET /api/tags
  → Returns: Model[]
```

**Error Handling:**
- `OllamaError` - Custom error class with status codes
- Handles 404 (model not found), 500 (server error), network errors, timeouts

### whatsappClient.js

Centralized WhatsApp bridge API communication:

```javascript
getEvents()
  → GET /events
  → Returns: Event[]

clearEvents()
  → DELETE /events
  → Returns: void

getStatus()
  → GET /status
  → Returns: { connected, qr, message }

checkHealth()
  → GET /status
  → Returns: boolean
```

**Error Handling:**
- `WhatsAppBridgeError` - Custom error class
- Built-in timeout (5 seconds)
- Handles network errors, parse errors, bridge offline

## TypeScript Integration

### Type Coverage (~40%)

**TypeScript Files:**
- `src/lib/dateUtils.ts` - Date utility functions
- `src/store/useEventStore.ts` - Event store with full types
- `src/lib/constants.ts` - App-wide constants

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

interface ExpandedEvent extends Event {
  originalId: string
  instanceDate: string
}

interface MiniCalDay {
  day: number
  isToday: boolean
  isCurrentMonth: boolean
  date: string
}
```

## Security Features

### Phase 1 Production Hardening

1. **Rate Limiting** (whatsapp-bridge)
   - Global: 100 requests per 15 minutes
   - POST /events: 10 requests per minute
   - Uses `express-rate-limit`

2. **CORS Whitelist** (whatsapp-bridge)
   - Only allows: `http://localhost:5173`, `http://localhost:5174`, `http://localhost:5175`
   - Blocks unauthorized origins

3. **Content Security Policy** (whatsapp-bridge)
   - CSP headers via `helmet`
   - Restricts resource loading

4. **Input Validation** (whatsapp-bridge)
   - Validates event title, date, time formats
   - Sanitizes string inputs
   - Uses `validator` library

5. **Error Boundaries** (frontend)
   - Top-level ErrorBoundary component
   - Catches React component errors
   - Provides fallback UI

6. **Environment Variables**
   - `.env` files for frontend and bridge
   - Secrets not committed to Git

## Testing Strategy

### Test Coverage: 78 passing tests

**Test Suites:**
1. `Calendar.test.jsx` - Component rendering and interaction
2. `useEventStore.test.js` - State management logic
3. `dateUtils.test.js` - Date utility functions
4. `extractor.test.js` - WhatsApp message parsing

**Testing Tools:**
- **Vitest** - Fast unit test runner
- **@testing-library/react** - Component testing
- **@testing-library/user-event** - User interaction simulation

**Example Test Structure:**

```javascript
describe('useEventStore', () => {
  it('should add event to store', () => {
    const { result } = renderHook(() => useEventStore())
    
    act(() => {
      result.current.addEvent({
        id: 'test1',
        title: 'Meeting',
        date: '2026-03-22',
        // ...
      })
    })
    
    expect(result.current.events).toHaveLength(1)
    expect(result.current.events[0].title).toBe('Meeting')
  })
})
```

## Environment Configuration

### Frontend (.env)

```bash
VITE_OLLAMA_URL=http://localhost:11434
VITE_BRIDGE_URL=http://localhost:3001
VITE_POLL_INTERVAL=3000
```

### WhatsApp Bridge (.env)

```bash
PORT=3001
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
```

## Performance Considerations

### Optimizations

1. **Event Recurrence Expansion**
   - Only expands visible date range
   - Uses `expandRecurrence()` utility
   - Prevents memory bloat from infinite series

2. **WhatsApp Polling**
   - 3-second interval (configurable)
   - Debounced with `pollingRef` to prevent overlap
   - Clears processed events from bridge

3. **LocalStorage Persistence**
   - Zustand middleware for auto-save
   - JSON serialization
   - Lazy loading on mount

4. **React Optimizations**
   - `useCallback` for event handlers
   - `useMemo` for expensive computations
   - Minimal re-renders with Zustand selectors

## Deployment Considerations

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Update CORS whitelist with production URLs
- [ ] Configure reverse proxy (nginx) for bridge
- [ ] Set up SSL certificates
- [ ] Configure persistent storage for WhatsApp sessions
- [ ] Set up monitoring and error logging
- [ ] Build frontend: `npm run build`
- [ ] Use process manager (PM2) for bridge server

### Scalability

**Current Architecture:**
- Single-user application
- Local Ollama instance
- WhatsApp limited to one connected device

**Scaling Options:**
1. Multi-user: Add authentication and user-specific event stores
2. Cloud Ollama: Deploy Ollama on GPU server with API gateway
3. Database: Replace localStorage with PostgreSQL/MongoDB
4. WhatsApp Multi-device: Separate bridge instances per user

## Development Workflow

### Running the Application

```bash
# Terminal 1: Frontend
npm run dev          # Runs on port 5173

# Terminal 2: WhatsApp Bridge
cd whatsapp-bridge
npm start            # Runs on port 3001

# Terminal 3: Ollama
ollama serve         # Runs on port 11434
ollama pull llama3.2:3b
```

### Running Tests

```bash
npm test             # Run all tests
npm run test:watch   # Watch mode
npm run test:ui      # Vitest UI
```

### Code Quality

```bash
npm run lint         # ESLint check
npm run format       # Prettier format
npm run type-check   # TypeScript check
```

## Future Enhancements (Phase 3+)

1. **Advanced TypeScript Migration**
   - Migrate remaining `.js` files to `.ts`
   - Add strict null checks
   - Generate API types from OpenAPI spec

2. **Performance Monitoring**
   - Add Sentry for error tracking
   - Implement performance metrics
   - Add bundle size monitoring

3. **Enhanced Testing**
   - E2E tests with Playwright
   - Visual regression tests
   - Increase coverage to 90%+

4. **Feature Additions**
   - Calendar sharing
   - Email reminders
   - Calendar import/export (iCal)
   - Mobile responsive design

5. **AI Improvements**
   - Multi-turn conversations
   - Event suggestions based on history
   - Smart scheduling (find free slots)

---

**Last Updated:** Phase 2 - Code Quality & Maintainability
**Version:** 1.0.0
**Maintainer:** Ricky
