# my.calendar

An intelligent calendar application that combines traditional calendar management with AI-powered features and WhatsApp integration. Designed primarily for college students to automatically extract and manage schedule information from WhatsApp group messages.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![React](https://img.shields.io/badge/React-18.3.1-61dafb)
![Tests](https://img.shields.io/badge/tests-78%20passing-success)
![License](https://img.shields.io/badge/license-Private-red)

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
- **Natural Language Processing** - Uses Ollama (llama3 model) for calendar queries
- **Conversational Event Management**
  - Add events: "Add lunch at 1pm tomorrow"
  - Query schedule: "What do I have today?"
  - Edit/Delete events through conversation
- **Model Selection** - Customizable Ollama model
- **Connection Status** - Visual indicator (green/yellow/red dot) showing Ollama connectivity

### WhatsApp Integration
- **Automated Event Extraction** - Monitors WhatsApp groups for schedule information
- **Multi-format Support**
  - **Text Messages** - Extracts events from text containing keywords (exam, postponed, timetable, etc.)
  - **Images** - Uses llava (local) or Gemini Vision API for timetable/schedule images
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

## Tech Stack

### Frontend
- **React 18.3.1** - UI framework
- **Vite 5.3.5** - Build tool & dev server
- **Vitest 4.1.0** - Unit testing framework
- **Tailwind CSS 3.4.7** - Utility-first CSS framework
- **date-fns 3.6.0** - Date manipulation library
- **Zustand 4.5.4** - Lightweight state management with localStorage persistence
- **@dnd-kit/core** - Modern drag-and-drop toolkit

### AI/Backend
- **Ollama** (localhost:11434) - Local LLM for chat assistant
  - Default model: `llama3`
  - Vision model: `llava` (for image analysis)
- **Google Gemini 1.5 Flash** - Fallback for image/vision analysis

### WhatsApp Bridge
- **Node.js** (CommonJS)
- **whatsapp-web.js 1.34.6** - WhatsApp Web API wrapper
- **Express 4.19.2** - HTTP server (port 3001)
- **express-rate-limit** - API rate limiting for security
- **Puppeteer** - Browser automation for WhatsApp
- **axios** - HTTP client
- **pdf-parse** - PDF text extraction

## Installation

### Prerequisites
- Node.js (v16 or higher)
- [Ollama](https://ollama.ai) installed and running locally
- Ollama models installed:
  ```bash
  ollama pull llama3
  ollama pull llava  # Optional, for WhatsApp image analysis
  ```

### Setup

1. **Clone the repository**
   ```bash
   cd ai-calendar
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install WhatsApp bridge dependencies**
   ```bash
   cd whatsapp-bridge
   npm install
   cd ..
   ```

4. **Configure Environment Variables**
   
   **Frontend** (root directory):
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` if you need to change default ports:
   ```env
   VITE_OLLAMA_URL=http://localhost:11434      # Ollama server URL
   VITE_BRIDGE_URL=http://localhost:3001       # WhatsApp bridge URL
   VITE_POLL_INTERVAL=3000                     # Polling interval in ms
   ```

   **WhatsApp Bridge** (whatsapp-bridge directory):
   ```bash
   cd whatsapp-bridge
   cp .env.example .env
   ```
   
   Edit `whatsapp-bridge/.env`:
   ```env
   OLLAMA_URL=http://localhost:11434      # Ollama server URL
   GEMINI_API_KEY=your_api_key_here       # For image analysis fallback
   BRIDGE_PORT=3001                       # Bridge server port
   CALENDAR_URL=http://localhost:5173     # Frontend URL for CORS
   ```

5. **Configure WhatsApp Bridge** (Optional)
   
   Edit `whatsapp-bridge/config.js` to customize:
   - `WATCHED_GROUPS` - WhatsApp group names to monitor
   - `KEYWORDS` - Trigger words for event detection
   - `MIN_KEYWORD_MATCHES` - Minimum keyword matches required

## Usage

### Starting the Application

1. **Start Ollama** (in a separate terminal)
   ```bash
   ollama serve
   ```

2. **Start the WhatsApp Bridge** (optional, in a separate terminal)
   ```bash
   cd whatsapp-bridge
   node index.js
   ```
   - Open `http://localhost:3001` in your browser
   - Scan the QR code with WhatsApp on your phone
   - Session persists in `.wwebjs_auth/` folder

3. **Start the Calendar App**
   ```bash
   npm run dev
   ```
   - Open your browser to the URL shown (usually `http://localhost:5173`)

### Using the Calendar

#### Adding Events
- **Manual**: Click "Add Event" button or double-click on a calendar slot
- **Via AI Chat**: Type in the chat sidebar (e.g., "Add meeting at 2pm tomorrow")
- **From WhatsApp**: Enable sync in WhatsApp settings, events auto-import from watched groups

#### Managing Events
- **Edit**: Double-click on an event
- **Move**: Drag and drop to a new time/day
- **Delete**: Open event modal and click delete
- **Mark Done**: Double-click on task in sidebar
- **Cancel**: Open event modal and toggle cancelled status

#### Using AI Chat
- Ask questions: "What do I have today?"
- Add events: "Schedule gym session at 6pm on Friday"
- Edit events: "Move my meeting to 3pm"
- Delete events: "Cancel my lunch appointment"

#### WhatsApp Integration
1. Click WhatsApp icon in top bar
2. Enable sync toggle
3. Select which groups to monitor
4. Bridge will automatically extract events from messages
5. Toast notifications appear when events are added

## Project Structure

```
ai-calendar/
├── src/
│   ├── components/
│   │   ├── Calendar/       # WeekView, DayColumn, EventBlock, TopBar
│   │   ├── Chat/           # ChatSidebar, AI integration
│   │   ├── Modal/          # EventModal
│   │   ├── Sidebar/        # Sidebar, TaskList, MiniCalendar
│   │   ├── WhatsApp/       # WhatsAppSettings, Toast
│   │   ├── ErrorBoundary.jsx  # Error boundary component
│   │   ├── LoadingSpinner.jsx # Loading components
│   │   ├── ToastContainer.jsx # Toast notification system
│   │   └── Icons.jsx       # Icon components
│   ├── hooks/              # useWhatsAppSync, useWhatsAppBridgeStatus
│   ├── lib/                # dateUtils.js
│   ├── store/              # Zustand stores (events, chat, settings, toast)
│   ├── __tests__/          # Unit & integration tests
│   ├── App.jsx             # Root component
│   ├── main.jsx            # React entry point
│   └── index.css           # Global styles
├── whatsapp-bridge/
│   ├── index.js            # WhatsApp client initialization
│   ├── bridge-server.js    # Express API server with rate limiting
│   ├── analyzer.js         # AI-powered content analysis
│   ├── extractor.js        # Event parsing utilities
│   ├── calendarPush.js     # Event queue management
│   ├── config.js           # User configuration
│   ├── .env.example        # Environment variable template
│   └── public/             # JSON queue storage
├── .env.example            # Frontend environment template
├── package.json
├── vite.config.js
├── vitest.config.js        # Test configuration
├── tailwind.config.js
└── index.html
```

## How It Works

### Event Storage
- Events stored in browser localStorage via Zustand persist middleware
- Each event contains: id, title, location, date, time, duration, color, recurrence
- Recurring events stored once and expanded dynamically for display

### AI Chat Assistant
- User input sent to Ollama with context (current events, today's date)
- Model responds with structured JSON actions: add/edit/delete/none
- Calendar automatically updates based on AI responses
- Temperature set to 0.1 for consistent structured output

### WhatsApp Event Extraction
1. Bridge monitors configured WhatsApp groups for messages
2. Filters messages by keyword relevance
3. Routes to appropriate analyzer based on content type:
   - **Text**: Ollama llama3 with event extraction prompt
   - **Images**: llava or Gemini Vision API for timetable recognition
   - **PDFs**: Text extraction → event parsing
4. Extracts structured event data with Indian date format support
5. Pushes events to queue (JSON file + HTTP endpoint)
6. Frontend polls queue every 3 seconds and auto-imports events
7. Toast notifications confirm additions

### Drag & Drop
- Events are draggable via @dnd-kit library
- Day columns are droppable targets
- On drop: calculates new date/time based on Y-axis delta (snapped to 15-min intervals)
- Updates event in store automatically

## API Endpoints (WhatsApp Bridge)

The WhatsApp Bridge server runs on `http://localhost:3001`:

- `GET /` - QR code display page for authentication
- `GET /status` - Returns connection status and QR code
- `GET /events` - Fetch event queue
- `POST /events` - Add event to queue
- `DELETE /events` - Clear event queue

## Configuration

### Customizing Awake Hours
Click the clock icon in the WeekView to set your sleep/awake schedule.

### Selecting AI Model
Click the model name in the chat sidebar to choose a different Ollama model.

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

## Testing

This project uses [Vitest](https://vitest.dev/) for unit and integration testing.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

Current test coverage:
- **78 tests** across 4 test suites
- **Coverage**: Utilities, stores, and core business logic

Test files:
- `src/__tests__/dateUtils.test.js` - Date parsing and manipulation utilities
- `src/__tests__/useEventStore.test.js` - Event store CRUD operations
- `src/__tests__/extractor.test.js` - Event extraction from natural language
- `src/__tests__/ErrorBoundary.test.jsx` - Error boundary component

### Writing Tests

Example test structure:
```javascript
import { describe, it, expect } from 'vitest'
import { useEventStore } from '../store/useEventStore'

describe('useEventStore', () => {
  it('should add an event', () => {
    const store = useEventStore.getState()
    const event = { title: 'Test', date: '2024-01-01', time: '10:00' }
    store.addEvent(event)
    expect(store.events).toHaveLength(1)
  })
})
```

## Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

To preview the production build:
```bash
npm run preview
```

## Known Limitations

- WhatsApp bridge requires active internet connection
- Ollama must be running locally for AI features
- WhatsApp session may need re-authentication after ~2 weeks
- Image analysis requires either llava model or Gemini API key
- Calendar currently supports 5-day work week only (Monday-Friday)

## Troubleshooting

### Ollama Connection Issues
- Ensure Ollama is running: `ollama serve`
- Check Ollama is accessible: `curl http://localhost:11434`
- Verify model is installed: `ollama list`

### WhatsApp Bridge Not Working
- Check bridge server is running on port 3001
- Re-scan QR code if session expired
- Check `.wwebjs_auth/` folder permissions
- Verify group names in `config.js` match actual WhatsApp groups

### Events Not Syncing
- Verify sync is enabled in WhatsApp settings
- Check bridge server logs for errors
- Ensure keywords in `config.js` match your message content
- Try lowering `MIN_KEYWORD_MATCHES` in config

## License

Private - Not for redistribution

## Acknowledgments

- [Ollama](https://ollama.ai) - Local LLM inference
- [whatsapp-web.js](https://wwebjs.dev) - WhatsApp Web API
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [dnd-kit](https://dndkit.com) - Drag and drop
- [Zustand](https://zustand-demo.pmnd.rs) - State management

---

Built with React, powered by AI
