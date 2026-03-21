import { useEffect, useRef } from 'react'
import { useEventStore } from '../store/useEventStore'
import { useNotificationStore } from '../store/useNotificationStore'
import { fmtDate } from '../lib/dateUtils'

/**
 * Auto-generate notifications based on events
 * 
 * Triggers:
 * - Event reminders (15 minutes before start)
 * - Overdue tasks (daily at 9 AM)
 */
export function useNotificationTriggers() {
  const { events } = useEventStore()
  const { addNotification } = useNotificationStore()
  const remindedEventsRef = useRef(new Set())
  const lastOverdueCheckRef = useRef(null)

  useEffect(() => {
    // Load reminded events from localStorage
    const storedReminded = localStorage.getItem('reminded-events')
    if (storedReminded) {
      try {
        remindedEventsRef.current = new Set(JSON.parse(storedReminded))
      } catch (e) {
        console.error('Failed to parse reminded events:', e)
      }
    }

    /**
     * Check for upcoming events and create reminders
     */
    const checkEventReminders = () => {
      const now = new Date()
      const fifteenMinutesLater = new Date(now.getTime() + 15 * 60 * 1000)

      events.forEach((event) => {
        // Skip if already reminded, cancelled, or done
        if (
          remindedEventsRef.current.has(event.id) ||
          event.cancelled ||
          event.done
        ) {
          return
        }

        // Parse event date and time
        const eventDateTime = new Date(`${event.date}T${event.time}`)

        // Check if event is within the 15-minute window
        if (eventDateTime > now && eventDateTime <= fifteenMinutesLater) {
          // Create reminder notification
          addNotification({
            type: 'reminder',
            title: 'Event starting soon',
            message: `${event.title} starts in 15 minutes`,
            eventId: event.id,
          })

          // Mark as reminded
          remindedEventsRef.current.add(event.id)
          localStorage.setItem(
            'reminded-events',
            JSON.stringify([...remindedEventsRef.current])
          )
        }
      })
    }

    /**
     * Check for overdue tasks (daily at 9 AM)
     */
    const checkOverdueTasks = () => {
      const now = new Date()
      const todayDate = fmtDate(now)
      const currentHour = now.getHours()

      // Only check at 9 AM and once per day
      if (currentHour !== 9 || lastOverdueCheckRef.current === todayDate) {
        return
      }

      // Find overdue events
      const overdueEvents = events.filter((event) => {
        const eventDateTime = new Date(`${event.date}T${event.time}`)
        return (
          eventDateTime < now &&
          !event.done &&
          !event.cancelled
        )
      })

      if (overdueEvents.length > 0) {
        addNotification({
          type: 'overdue',
          title: 'Overdue tasks',
          message: `You have ${overdueEvents.length} overdue task${
            overdueEvents.length > 1 ? 's' : ''
          }`,
        })

        // Mark check as done for today
        lastOverdueCheckRef.current = todayDate
        localStorage.setItem('last-overdue-check', todayDate)
      }
    }

    // Load last overdue check date
    const storedLastCheck = localStorage.getItem('last-overdue-check')
    if (storedLastCheck) {
      lastOverdueCheckRef.current = storedLastCheck
    }

    // Check immediately on mount
    checkEventReminders()
    checkOverdueTasks()

    // Set up intervals
    const reminderInterval = setInterval(checkEventReminders, 60000) // Every minute
    const overdueInterval = setInterval(checkOverdueTasks, 3600000) // Every hour

    return () => {
      clearInterval(reminderInterval)
      clearInterval(overdueInterval)
    }
  }, [events, addNotification])
}
