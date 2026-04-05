# Agent Guidelines for Kairo

An intelligent calendar app with WhatsApp integration. Built with React, TypeScript, Vite, Supabase, and Zustand.

## Project Structure

```
src/
├── api/                    # API clients (Groq LLM, WhatsApp bridge)
├── components/             # React components
│   ├── Calendar/           # WeekView, MonthView, DayView, EventBlock, TopBar
│   ├── Chat/               # ChatSidebar, useLLM
│   ├── Modal/              # EventModal, SettingsModal (with tabs/)
│   ├── Notifications/      # NotificationPanel, NotificationItem
│   ├── Sidebar/            # Sidebar, TaskList, MiniCalendar
│   ├── WhatsApp/           # WhatsAppSettings, WhatsAppPopup, WhatsAppToast
│   └── *.jsx               # Icons, LoadingSpinner, MobileDrawer, etc.
├── contexts/               # AuthContext.jsx
├── hooks/                  # Custom hooks (useAsync, useDebounce, usePWA, etc.)
├── lib/                    # Utilities (dateUtils, validation, supabase, constants)
├── pages/                  # Auth pages (Login, Signup, ForgotPassword, AuthCallback)
├── store/                  # Zustand stores (useEventStore, useChatStore, etc.)
├── __tests__/              # Test files
├── App.jsx                 # Root component
├── main.jsx                # Entry point
├── setupTests.js           # Vitest setup (localStorage, matchMedia mocks)
└── index.css               # Global styles & Tailwind
```

## Build & Test Commands

```bash
# Development
npm run dev              # Vite dev server (http://localhost:5173)
npm run build            # Production build
npm run preview          # Preview production build

# Testing (Vitest + @testing-library/react)
npm run test             # Run all tests (watch mode)
npm run test:ui          # Run with Vitest UI browser
npm run test:coverage    # Run with coverage report

# Single test files - use vitest directly:
npx vitest run src/__tests__/dateUtils.test.js
npx vitest run src/components/Modal/__tests__/EventModal.test.jsx
# In watch mode, press 'o' to run only changed tests

# TypeScript
npx tsc --noEmit         # Type check without emitting

# Pre-commit checks
npm run test && npm run build && npx tsc --noEmit
```

## Code Style

### TypeScript
- **Strict mode** enabled with `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`
- Use **`.jsx`** for React components, **`.tsx`** when using TypeScript generics
- Use **`.ts`** for utilities and type definitions
- Use **interface** for object shapes, **type** for unions/primitives
- Use **JSDoc** for exported functions and complex logic
- No ESLint is configured

### Imports
- `import React, { useState } from 'react'` (always include React)
- Use `@/*` path aliases: `import { fmtDate } from '@/lib/dateUtils'`
- Order: React → external libraries → internal modules (blank line separation)
- Use `import type { TypeName }` for type-only imports

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `EventModal.jsx`, `WeekView.jsx` |
| Hooks/Stores | camelCase with `use` | `useEventStore.js`, `useMobileLayout.js` |
| Utilities | camelCase | `dateUtils.ts`, `validation.js` |
| Constants | SCREAMING_SNAKE_CASE | `PX_PER_HOUR`, `DEFAULT_DURATION` |
| Types | PascalCase | `Event`, `User`, `MiniCalDay` |

### Components
- Functional components with hooks only (no class components)
- Destructure props: `function EventModal({ isOpen, onClose, defaultDate })`
- Tailwind CSS with CSS variables for theming
- ErrorBoundary for error handling

### Theming & Colors
Dark mode via `class` on `<html>`. Use Tailwind color classes:
- **Backgrounds**: `main`, `light-bg`, `light-card`, `sidebar`, `sidebar-deep`, `sidebar-card`, `chat`
- **Text**: `light-text`, `light-text-secondary`
- **Accents**: `accent`, `accent-light`
- **Events**: `event-pink`, `event-green`, `event-blue`, `event-amber`, `event-gray`
- **Chat**: `chat-msg-user`, `chat-msg-ai`, `chat-input`
- Fonts: `DM Sans` (sans), `DM Serif Display` (display)

### Accessibility
- `announce()` from `@/lib/accessibility` for screen readers
- Focus trapping with `createFocusTrap()` for modals
- ARIA attributes: `role`, `aria-modal`, `aria-labelledby`, `aria-describedby`
- Keyboard navigation for all interactive elements

### State Management (Zustand)
```javascript
export const useEventStore = create((set, get) => ({
  events: [],
  isLoading: false,
  
  addEvent: async (ev) => {
    set({ isLoading: true })
    try {
      // async logic
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },
}))
```

### Error Handling
- Try/catch for all async operations
- Log errors with `console.error` and context
- Use toast notifications for user-facing errors (`useToastStore`)
- Never expose sensitive data in error messages

### Testing Patterns
- Vitest with `@testing-library/react`
- Test setup: `src/setupTests.js` (global mocks)
- Mock stores:
```javascript
vi.mock('../../../store/useEventStore', () => ({
  useEventStore: () => ({
    addEvent: vi.fn(),
    editEvent: vi.fn(),
  }),
}))
```
- Test file naming: `*.test.{js,jsx,ts,tsx}` or `*.spec.*`
- Test locations: `__tests__/` subdirectory or `src/__tests__/`
- Vitest config: `vitest.config.js` with jsdom, 5s timeout

### Validation & Sanitization
- Always sanitize user input with `sanitizeString()` from `@/lib/validation`
- Date format: **YYYY-MM-DD**, time format: **HH:MM** (24-hour)
- Validate both client and server-side

### API Patterns (Supabase)
- Use client from `@/lib/supabase`
- Always include `user_id` filter: `.eq('user_id', userId)`
- Real-time: `supabase.channel()` + `postgres_changes`
- Offline: `pendingSync` queue for optimistic updates

## Environment Configuration

- Variables in `.env` (see `.env.example`)
- Client-side: `import.meta.env.VITE_*`
- Runtime config: `@/lib/envConfig` with validation

## WhatsApp Bridge Server

`whatsapp-bridge/` - Node.js server with `whatsapp-web.js`, runs separately from Vite.
