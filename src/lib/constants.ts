/**
 * Application-wide constants
 * Centralizes magic numbers and configuration values for maintainability
 */

// ===========================
// Calendar Configuration
// ===========================

/**
 * Pixels per hour in calendar grid
 * Used for positioning and sizing events in the timeline view
 */
export const PX_PER_HOUR = 60

/**
 * Total hours displayed in calendar (24-hour clock)
 */
export const TOTAL_HOURS = 24

/**
 * Work week days (Monday-Friday)
 */
export const WORK_WEEK_DAYS = 5

/**
 * Default awake start hour (6 AM)
 */
export const DEFAULT_AWAKE_START = 6

/**
 * Default awake end hour (midnight)
 */
export const DEFAULT_AWAKE_END = 24

/**
 * Minutes snap interval for drag-and-drop
 * Events snap to 15-minute intervals
 */
export const SNAP_INTERVAL_MINUTES = 15

/**
 * Minimum event height in pixels
 */
export const MIN_EVENT_HEIGHT_PX = 24

// ===========================
// Time & Duration Defaults
// ===========================

/**
 * Default event duration in minutes
 */
export const DEFAULT_EVENT_DURATION = 60

/**
 * Default event start time
 */
export const DEFAULT_EVENT_TIME = '09:00'

/**
 * Minimum event duration in minutes
 */
export const MIN_EVENT_DURATION = 15

/**
 * Maximum event duration in minutes (24 hours)
 */
export const MAX_EVENT_DURATION = 1440

// ===========================
// Network & API Configuration
// ===========================

/**
 * Default Ollama server URL
 */
export const DEFAULT_OLLAMA_URL = 'http://localhost:11434'

/**
 * Default WhatsApp bridge server URL
 */
export const DEFAULT_BRIDGE_URL = 'http://localhost:3001'

/**
 * Default polling interval for WhatsApp sync (milliseconds)
 */
export const DEFAULT_POLL_INTERVAL = 3000

/**
 * Default frontend development server URLs
 */
export const DEFAULT_CALENDAR_URLS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
]

// ===========================
// UI & Animation
// ===========================

/**
 * Toast notification auto-dismiss duration (milliseconds)
 */
export const TOAST_DURATION = 4000

/**
 * Error toast duration (milliseconds) - longer for users to read
 */
export const ERROR_TOAST_DURATION = 6000

/**
 * Loading skeleton display duration (milliseconds)
 */
export const LOADING_SKELETON_DURATION = 500

/**
 * Modal save operation feedback delay (milliseconds)
 */
export const MODAL_SAVE_DELAY = 300

/**
 * Animation duration for drag-and-drop (seconds)
 */
export const DRAG_ANIMATION_DURATION = '0.2s'

/**
 * Cubic bezier for drag animation
 */
export const DRAG_ANIMATION_EASING = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

// ===========================
// Event Colors
// ===========================

/**
 * Available event color themes
 */
export const EVENT_COLORS = ['pink', 'green', 'blue', 'amber', 'gray'] as const

/**
 * Default event color
 */
export const DEFAULT_EVENT_COLOR = 'blue'

// ===========================
// Recurrence Types
// ===========================

/**
 * Available recurrence patterns
 */
export const RECURRENCE_TYPES = ['none', 'daily', 'weekly', 'monthly'] as const

/**
 * Default recurrence type
 */
export const DEFAULT_RECURRENCE = 'none'

// ===========================
// Task Status
// ===========================

/**
 * Available task statuses
 */
export const TASK_STATUSES = ['done', 'upcoming', 'overdue', 'cancelled'] as const

// ===========================
// Validation Limits
// ===========================

/**
 * Maximum event title length
 */
export const MAX_TITLE_LENGTH = 200

/**
 * Maximum subtitle/location length
 */
export const MAX_SUBTITLE_LENGTH = 100

/**
 * Maximum JSON payload size for bridge server (bytes)
 */
export const MAX_PAYLOAD_SIZE = 10485760 // 10MB

// ===========================
// Rate Limiting
// ===========================

/**
 * Global rate limit: requests per window
 */
export const RATE_LIMIT_MAX_REQUESTS = 100

/**
 * Global rate limit: window duration (milliseconds)
 */
export const RATE_LIMIT_WINDOW_MS = 900000 // 15 minutes

/**
 * POST /events rate limit: requests per window
 */
export const RATE_LIMIT_POST_MAX = 10

/**
 * POST /events rate limit: window duration (milliseconds)
 */
export const RATE_LIMIT_POST_WINDOW_MS = 60000 // 1 minute

// ===========================
// Date Format Patterns
// ===========================

/**
 * ISO date format (YYYY-MM-DD)
 */
export const ISO_DATE_FORMAT = 'yyyy-MM-dd'

/**
 * Time format (HH:mm)
 */
export const TIME_FORMAT = 'HH:mm'

/**
 * Display date format (MMM d)
 */
export const DISPLAY_DATE_FORMAT = 'MMM d'

// ===========================
// Storage Keys
// ===========================

/**
 * LocalStorage key for events
 */
export const STORAGE_KEY_EVENTS = 'cal_events'

/**
 * LocalStorage key for dark mode
 */
export const STORAGE_KEY_DARK_MODE = 'dark_mode'

/**
 * LocalStorage key for settings
 */
export const STORAGE_KEY_SETTINGS = 'cal_settings'
