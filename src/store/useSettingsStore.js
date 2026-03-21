import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Default settings configuration
 */
const DEFAULT_SETTINGS = {
  // General
  timeFormat: '24h', // '12h' | '24h'
  weekStartDay: 'monday', // 'sunday' | 'monday' | 'saturday'
  dateFormat: 'YYYY-MM-DD', // 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
  language: 'en',

  // Appearance
  theme: 'auto', // 'light' | 'dark' | 'auto'
  accentColor: '#3b82f6', // Hex color
  compactMode: false,
  fontSize: 'medium', // 'small' | 'medium' | 'large' | 'extraLarge'
  showWeekends: true,

  // Calendar
  defaultView: 'week', // 'day' | 'week' | 'month'
  defaultEventDuration: 60, // minutes
  defaultEventColor: 'blue', // 'pink' | 'green' | 'blue' | 'amber' | 'gray'
  awakeStart: 6, // 0-23
  awakeEnd: 24, // 1-24
  showPastEvents: true,

  // Notifications
  notificationsEnabled: true,
  reminderTime: 15, // minutes before event
  soundAlerts: false,
  quietHoursEnabled: false,
  quietHoursStart: 22, // 0-23
  quietHoursEnd: 8, // 0-23

  // AI Assistant
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'llama3.2:3b',
  ollamaTemperature: 0.7,

  // WhatsApp
  whatsappBridgeUrl: 'http://localhost:3001',
  whatsappPollInterval: 30, // seconds
  whatsappAutoAdd: true,

  // Profile
  userName: 'User',
  userEmail: '',
  userAvatar: '👤',
}

/**
 * Validate URL format
 */
const isValidUrl = (url) => {
  try {
    new URL(url)
    return url.startsWith('http://') || url.startsWith('https://')
  } catch {
    return false
  }
}

/**
 * Settings store for managing app configuration
 */
export const useSettingsStore = create(
  persist(
    (set, get) => ({
      // Settings state
      ...DEFAULT_SETTINGS,

      // Temporary state for unsaved changes
      hasUnsavedChanges: false,

      /**
       * Update a single setting
       */
      updateSetting: (key, value) => {
        set({ [key]: value, hasUnsavedChanges: true })
      },

      /**
       * Update multiple settings at once
       */
      updateMultiple: (updates) => {
        set({ ...updates, hasUnsavedChanges: true })
      },

      /**
       * Save changes and mark as saved
       */
      saveChanges: () => {
        set({ hasUnsavedChanges: false })
      },

      /**
       * Discard unsaved changes (revert to persisted state)
       */
      discardChanges: () => {
        const persistedSettings = JSON.parse(
          localStorage.getItem('user-settings') || '{}'
        )
        set({ ...DEFAULT_SETTINGS, ...persistedSettings.state, hasUnsavedChanges: false })
      },

      /**
       * Reset all settings to defaults
       */
      resetToDefaults: () => {
        set({ ...DEFAULT_SETTINGS, hasUnsavedChanges: false })
      },

      /**
       * Validate settings before saving
       */
      validate: () => {
        const state = get()
        const errors = {}

        // Validate Ollama URL
        if (!isValidUrl(state.ollamaUrl)) {
          errors.ollamaUrl = 'Invalid URL format'
        }

        // Validate WhatsApp Bridge URL
        if (!isValidUrl(state.whatsappBridgeUrl)) {
          errors.whatsappBridgeUrl = 'Invalid URL format'
        }

        // Validate email if provided
        if (state.userEmail && !state.userEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          errors.userEmail = 'Invalid email format'
        }

        // Validate awake hours
        if (state.awakeStart >= state.awakeEnd) {
          errors.awakeHours = 'End time must be after start time'
        }

        // Validate quiet hours
        if (state.quietHoursEnabled && state.quietHoursStart === state.quietHoursEnd) {
          errors.quietHours = 'Start and end time cannot be the same'
        }

        return { valid: Object.keys(errors).length === 0, errors }
      },

      /**
       * Get display value for a setting (formatted for UI)
       */
      getDisplayValue: (key) => {
        const state = get()
        const value = state[key]

        switch (key) {
          case 'timeFormat':
            return value === '12h' ? '12-hour (9:00 AM)' : '24-hour (09:00)'
          case 'weekStartDay':
            return value.charAt(0).toUpperCase() + value.slice(1)
          case 'theme':
            return value === 'auto' ? 'Auto (system)' : value.charAt(0).toUpperCase() + value.slice(1)
          case 'fontSize':
            const sizes = { small: 'Small', medium: 'Medium', large: 'Large', extraLarge: 'Extra Large' }
            return sizes[value]
          case 'defaultView':
            return value.charAt(0).toUpperCase() + value.slice(1)
          case 'defaultEventColor':
            return value.charAt(0).toUpperCase() + value.slice(1)
          case 'reminderTime':
            return `${value} minutes before`
          case 'whatsappPollInterval':
            return `${value} seconds`
          case 'awakeStart':
          case 'awakeEnd':
            return `${value}:00`
          case 'quietHoursStart':
          case 'quietHoursEnd':
            const hour = value % 12 || 12
            const ampm = value >= 12 ? 'PM' : 'AM'
            return `${hour}:00 ${ampm}`
          default:
            return value
        }
      },
    }),
    {
      name: 'user-settings',
      partialize: (state) => {
        // Don't persist hasUnsavedChanges
        const { hasUnsavedChanges, ...settings } = state
        return settings
      },
    }
  )
)
