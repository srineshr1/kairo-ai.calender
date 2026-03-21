import { create } from 'zustand'
import { persist } from 'zustand/middleware'
// @ts-ignore - JavaScript module, types available at runtime
import { toast } from './useToastStore.js'
import { getWorkWeekStart, addWeek, subWeek, fmtDate } from '../lib/dateUtils'

/**
 * Recurrence pattern types
 */
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly'

/**
 * Color themes for events
 */
export type EventColor = 'pink' | 'green' | 'blue' | 'amber' | 'gray'

/**
 * Task status types
 */
export type TaskStatus = 'done' | 'upcoming' | 'overdue' | 'cancelled'

/**
 * Calendar event interface
 */
export interface Event {
  id: string
  title: string
  date: string // ISO date string (YYYY-MM-DD)
  time: string // 24-hour time string (HH:mm)
  duration: number // Minutes
  sub?: string // Subtitle/location
  color: EventColor
  recurrence: RecurrenceType
  recurrenceEnd: string // ISO date string (empty if no end)
  done: boolean
  cancelled: boolean
  location?: string
}

/**
 * Task log entry for tracking status changes
 */
export interface TaskLogEntry {
  id: string
  eventId: string
  title: string
  status: TaskStatus
  timestamp: string // ISO timestamp
}

/**
 * Task status style configuration
 */
export interface StatusStyle {
  label: string
  pill: string // Tailwind CSS classes
}

/**
 * Event store state interface
 */
export interface EventStoreState {
  // State
  events: Event[]
  taskLog: TaskLogEntry[]
  currentWeekStart: Date
  searchQuery: string
  awakeStart: number // Hour 0-23
  awakeEnd: number // Hour 1-24
  isLoading: boolean
  error: string | null
  
  // Actions - Settings
  setSearchQuery: (query: string) => void
  setAwakeStart: (hour: number) => void
  setAwakeEnd: (hour: number) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Actions - Navigation
  nextWeek: () => void
  prevWeek: () => void
  jumpToDate: (date: Date) => void
  
  // Actions - CRUD
  addEvent: (event: Partial<Event>) => void
  editEvent: (id: string, changes: Partial<Event>, editAll?: boolean) => void
  deleteEvent: (id: string) => void
  markDone: (id: string) => void
  cancelEvent: (id: string) => void
  reschedule: (id: string, newDate: string, newTime: string) => void
}

/**
 * Generate unique event ID
 */
const genId = (): string => 'e' + Date.now() + Math.random().toString(36).slice(2, 6)

/**
 * Generate unique log entry ID
 */
const logId = (): string => 'l' + Date.now() + Math.random().toString(36).slice(2, 6)

/**
 * Calculate work week date offset from today
 */
const today = new Date()
const wd = (offset: number): string => {
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) + offset)
  return fmtDate(monday)
}

/**
 * Seed events for initial state
 */
const SEED_EVENTS: Event[] = [
  { id: genId(), title: 'Stand-up', sub: 'Zoom', date: wd(0), time: '09:00', duration: 30, color: 'green', done: false, cancelled: false, recurrence: 'daily', recurrenceEnd: '', location: '' },
  { id: genId(), title: 'Design Review', sub: 'Figma', date: wd(1), time: '11:00', duration: 60, color: 'pink', done: false, cancelled: false, recurrence: 'none', recurrenceEnd: '', location: '' },
  { id: genId(), title: 'Lunch', sub: 'Cafeteria', date: wd(1), time: '13:00', duration: 60, color: 'amber', done: false, cancelled: false, recurrence: 'none', recurrenceEnd: '', location: '' },
  { id: genId(), title: 'Sprint Planning', sub: 'Room A', date: wd(2), time: '10:00', duration: 90, color: 'blue', done: false, cancelled: false, recurrence: 'weekly', recurrenceEnd: '', location: '' },
  { id: genId(), title: 'Gym', sub: '', date: wd(3), time: '07:30', duration: 60, color: 'green', done: false, cancelled: false, recurrence: 'weekly', recurrenceEnd: '', location: '' },
  { id: genId(), title: 'Doctor', sub: 'St. Anna', date: wd(4), time: '15:00', duration: 45, color: 'gray', done: false, cancelled: false, recurrence: 'none', recurrenceEnd: '', location: '' },
]

/**
 * Derive task status from event data
 * @param ev - Event to check status for
 * @returns Current task status
 */
export const getTaskStatus = (ev: Event): TaskStatus => {
  if (ev.cancelled) return 'cancelled'
  if (ev.done) return 'done'
  const evDateTime = new Date(`${ev.date}T${ev.time}`)
  if (evDateTime < new Date()) return 'overdue'
  return 'upcoming'
}

/**
 * Status style configurations for UI display
 */
export const STATUS_STYLES: Record<TaskStatus, StatusStyle> = {
  done:      { label: 'Done',      pill: 'bg-green-900/40 text-green-400 border-green-700/40' },
  upcoming:  { label: 'Upcoming',  pill: 'bg-blue-900/40 text-blue-400 border-blue-700/40' },
  overdue:   { label: 'Overdue',   pill: 'bg-red-900/40 text-red-400 border-red-700/40' },
  cancelled: { label: 'Cancelled', pill: 'bg-gray-800/60 text-gray-500 border-gray-700/40' },
}

/**
 * Event store with Zustand + localStorage persistence
 */
export const useEventStore = create<EventStoreState>()(
  persist(
    (set) => ({
      // Initial state
      events: SEED_EVENTS,
      taskLog: [],
      currentWeekStart: getWorkWeekStart(today),
      searchQuery: '',
      awakeStart: 6,
      awakeEnd: 24,
      isLoading: false,
      error: null,

      // Settings actions
      setSearchQuery: (query) => set({ searchQuery: query }),
      setAwakeStart: (hour) => set({ awakeStart: hour }),
      setAwakeEnd: (hour) => set({ awakeEnd: hour }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Navigation actions
      nextWeek: () => set((s) => ({ currentWeekStart: addWeek(s.currentWeekStart) })),
      prevWeek: () => set((s) => ({ currentWeekStart: subWeek(s.currentWeekStart) })),
      jumpToDate: (date) => set({ currentWeekStart: getWorkWeekStart(date) }),

      // CRUD actions
      addEvent: (ev) => {
        set({ isLoading: true, error: null })
        try {
          set((s) => {
            const newEv: Event = {
              id: genId(),
              done: false,
              cancelled: false,
              recurrence: 'none',
              recurrenceEnd: '',
              color: 'blue',
              duration: 60,
              time: '09:00',
              location: '',
              ...ev,
              // Ensure required fields
              title: ev.title || '',
              date: ev.date || fmtDate(new Date()),
            }
            const log: TaskLogEntry = {
              id: logId(),
              eventId: newEv.id,
              title: newEv.title,
              status: getTaskStatus(newEv),
              timestamp: new Date().toISOString(),
            }
            return {
              events: [...s.events, newEv],
              taskLog: [...s.taskLog, log],
              isLoading: false
            }
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to add event'
          set({ error: message, isLoading: false })
        }
      },

      editEvent: (id, changes, editAll = false) => {
        set({ isLoading: true, error: null })
        try {
          set((s) => ({
            events: s.events.map((e) => {
              if (e.id === id) return { ...e, ...changes }
              if (editAll && e.id === id) return { ...e, ...changes }
              return e
            }),
            isLoading: false
          }))
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to edit event'
          set({ error: message, isLoading: false })
        }
      },

      deleteEvent: (id) => {
        set({ isLoading: true, error: null })
        try {
          set((s) => ({
            events: s.events.filter((e) => e.id !== id),
            taskLog: s.taskLog.filter((l) => l.eventId !== id),
            isLoading: false
          }))
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to delete event'
          set({ error: message, isLoading: false })
          toast.error(message, 'Delete Failed')
        }
      },

      markDone: (id) => set((s) => {
        const ev = s.events.find((e) => e.id === id)
        if (!ev) return {}
        const newDone = !ev.done
        const newStatus = newDone ? 'done' : getTaskStatus({ ...ev, done: false })
        const log: TaskLogEntry = {
          id: logId(),
          eventId: id,
          title: ev.title,
          status: newStatus,
          timestamp: new Date().toISOString(),
        }
        return {
          events: s.events.map((e) => e.id === id ? { ...e, done: newDone } : e),
          taskLog: [...s.taskLog, log],
        }
      }),

      cancelEvent: (id) => set((s) => {
        const ev = s.events.find((e) => e.id === id)
        if (!ev) return {}
        const log: TaskLogEntry = {
          id: logId(),
          eventId: id,
          title: ev.title,
          status: 'cancelled',
          timestamp: new Date().toISOString(),
        }
        return {
          events: s.events.map((e) => e.id === id ? { ...e, cancelled: true, done: false } : e),
          taskLog: [...s.taskLog, log],
        }
      }),

      reschedule: (id, newDate, newTime) => set((s) => ({
        events: s.events.map((e) => e.id === id ? { ...e, date: newDate, time: newTime } : e),
      })),
    }),
    {
      name: 'cal_events',
      partialize: (s) => ({
        events: s.events,
        taskLog: s.taskLog,
        awakeStart: s.awakeStart,
        awakeEnd: s.awakeEnd,
      }),
    }
  )
)
