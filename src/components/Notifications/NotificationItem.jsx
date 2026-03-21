import React from 'react'
import { Icon } from '../Icons'
import { useDarkStore } from '../../store/useDarkStore'
import { useNotificationStore } from '../../store/useNotificationStore'

/**
 * Format timestamp to relative time (e.g., "5 min ago", "2 hours ago")
 * @param {string} timestamp - ISO timestamp
 * @returns {string}
 */
const formatRelativeTime = (timestamp) => {
  const now = new Date()
  const past = new Date(timestamp)
  const diffMs = now - past
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return past.toLocaleDateString()
}

/**
 * Individual notification item component
 * @param {Object} props
 * @param {Object} props.notification - Notification object
 * @param {Function} props.onViewEvent - Callback when view event is clicked
 */
export default function NotificationItem({ notification, onViewEvent }) {
  const { isDark } = useDarkStore()
  const { markRead, deleteNotification } = useNotificationStore()

  const handleClick = () => {
    if (!notification.read) {
      markRead(notification.id)
    }
    if (notification.eventId && onViewEvent) {
      onViewEvent(notification.eventId)
    }
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    deleteNotification(notification.id)
  }

  return (
    <div
      onClick={handleClick}
      className={`group relative flex items-start gap-3 px-3 py-3 cursor-pointer transition-colors border-l-2 ${
        notification.read
          ? isDark
            ? 'hover:bg-white/[0.03] border-transparent'
            : 'hover:bg-gray-50 border-transparent'
          : isDark
          ? 'bg-white/[0.04] hover:bg-white/[0.06] border-accent'
          : 'bg-accent/5 hover:bg-accent/10 border-accent'
      }`}
    >
      {/* Icon */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg ${
          isDark ? 'bg-white/[0.08]' : 'bg-gray-100'
        }`}
      >
        {notification.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4
              className={`text-[13px] font-medium ${
                notification.read
                  ? isDark
                    ? 'text-gray-300'
                    : 'text-gray-700'
                  : isDark
                  ? 'text-gray-100'
                  : 'text-gray-900'
              }`}
            >
              {notification.title}
            </h4>
            <p
              className={`text-[12px] mt-0.5 ${
                isDark ? 'text-gray-500' : 'text-gray-600'
              }`}
            >
              {notification.message}
            </p>
            <p
              className={`text-[11px] mt-1 ${
                isDark ? 'text-gray-600' : 'text-gray-400'
              }`}
            >
              {formatRelativeTime(notification.timestamp)}
            </p>
          </div>

          {/* Unread indicator & Delete button */}
          <div className="flex items-center gap-2">
            {!notification.read && (
              <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
            )}
            <button
              onClick={handleDelete}
              className={`opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded flex items-center justify-center ${
                isDark
                  ? 'hover:bg-white/[0.1] text-gray-500'
                  : 'hover:bg-gray-200 text-gray-400'
              }`}
              aria-label="Delete notification"
            >
              <Icon name="x" className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* View Event Link */}
        {notification.eventId && (
          <button
            className={`text-[11px] mt-2 font-medium transition-colors ${
              isDark
                ? 'text-accent hover:text-accent/80'
                : 'text-accent hover:text-accent/80'
            }`}
          >
            View Event →
          </button>
        )}
      </div>
    </div>
  )
}
