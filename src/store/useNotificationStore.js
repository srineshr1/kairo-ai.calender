import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Notification types
 * @typedef {'reminder' | 'overdue' | 'whatsapp' | 'system'} NotificationType
 */

/**
 * Notification object structure
 * @typedef {Object} Notification
 * @property {string} id - Unique identifier
 * @property {NotificationType} type - Notification category
 * @property {string} title - Notification title
 * @property {string} message - Notification message/description
 * @property {string} timestamp - ISO timestamp of creation
 * @property {boolean} read - Read status
 * @property {string} [eventId] - Optional event ID for linking
 * @property {string} icon - Emoji icon
 */

/**
 * Generate unique notification ID
 * @returns {string}
 */
const genId = () => 'n' + Date.now() + Math.random().toString(36).slice(2, 6)

/**
 * Icon mapping for notification types
 */
const NOTIFICATION_ICONS = {
  reminder: '🔔',
  overdue: '⚠️',
  whatsapp: '📱',
  system: '✅',
}

/**
 * Notification store for managing app notifications
 * YouTube-style notification system with persistence
 */
export const useNotificationStore = create(
  persist(
    (set, get) => ({
      // State
      notifications: [],
      isOpen: false,

      // Computed: Unread count
      get unreadCount() {
        return get().notifications.filter((n) => !n.read).length
      },

      /**
       * Add a new notification
       * @param {Partial<Notification>} notification - Notification data
       */
      addNotification: (notification) => {
        const newNotification = {
          id: genId(),
          timestamp: new Date().toISOString(),
          read: false,
          icon: NOTIFICATION_ICONS[notification.type] || '📢',
          ...notification,
        }
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }))
      },

      /**
       * Mark a notification as read
       * @param {string} id - Notification ID
       */
      markRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }))
      },

      /**
       * Mark all notifications as read
       */
      markAllRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }))
      },

      /**
       * Delete a single notification
       * @param {string} id - Notification ID
       */
      deleteNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      },

      /**
       * Clear all notifications
       */
      clearAll: () => {
        set({ notifications: [] })
      },

      /**
       * Toggle notification panel open/closed
       */
      togglePanel: () => {
        set((state) => ({ isOpen: !state.isOpen }))
      },

      /**
       * Close notification panel
       */
      closePanel: () => {
        set({ isOpen: false })
      },

      /**
       * Open notification panel
       */
      openPanel: () => {
        set({ isOpen: true })
      },
    }),
    {
      name: 'notifications-history',
      partialize: (state) => ({
        notifications: state.notifications,
      }),
    }
  )
)
