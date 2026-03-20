import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useEventStore, getTaskStatus, STATUS_STYLES } from '../store/useEventStore'

describe('useEventStore', () => {
  // Clear localStorage and reset store before each test
  beforeEach(() => {
    localStorage.clear()
    useEventStore.setState({
      events: [],
      taskLog: [],
      searchQuery: '',
    })
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('addEvent', () => {
    it('should add a new event with generated ID', () => {
      const { addEvent, events } = useEventStore.getState()
      
      addEvent({
        title: 'Team Meeting',
        date: '2026-03-25',
        time: '14:00',
        duration: 60,
        color: 'blue',
      })
      
      const updatedEvents = useEventStore.getState().events
      
      expect(updatedEvents).toHaveLength(1)
      expect(updatedEvents[0].id).toBeDefined()
      expect(updatedEvents[0].id).toMatch(/^e\d+/) // ID starts with 'e'
      expect(updatedEvents[0].title).toBe('Team Meeting')
    })

    it('should set default values for new events', () => {
      const { addEvent } = useEventStore.getState()
      
      addEvent({
        title: 'Simple Event',
        date: '2026-03-25',
        time: '10:00',
        duration: 30,
      })
      
      const event = useEventStore.getState().events[0]
      
      expect(event.done).toBe(false)
      expect(event.cancelled).toBe(false)
      expect(event.recurrence).toBe('none')
      expect(event.recurrenceEnd).toBe('')
    })

    it('should add event to task log when created', () => {
      const { addEvent } = useEventStore.getState()
      
      addEvent({
        title: 'New Task',
        date: '2026-03-30',
        time: '10:00',
        duration: 60,
      })
      
      const { taskLog } = useEventStore.getState()
      
      expect(taskLog).toHaveLength(1)
      expect(taskLog[0].title).toBe('New Task')
      expect(taskLog[0].status).toBe('upcoming')
      expect(taskLog[0].timestamp).toBeDefined()
    })

    it('should handle multiple events', () => {
      const { addEvent } = useEventStore.getState()
      
      addEvent({ title: 'Event 1', date: '2026-03-25', time: '09:00', duration: 30 })
      addEvent({ title: 'Event 2', date: '2026-03-25', time: '11:00', duration: 30 })
      addEvent({ title: 'Event 3', date: '2026-03-26', time: '14:00', duration: 60 })
      
      const { events } = useEventStore.getState()
      
      expect(events).toHaveLength(3)
      expect(events[0].title).toBe('Event 1')
      expect(events[1].title).toBe('Event 2')
      expect(events[2].title).toBe('Event 3')
    })
  })

  describe('editEvent', () => {
    it('should edit an existing event', () => {
      const { addEvent, editEvent } = useEventStore.getState()
      
      addEvent({ title: 'Original Title', date: '2026-03-25', time: '10:00', duration: 60 })
      const eventId = useEventStore.getState().events[0].id
      
      editEvent(eventId, { title: 'Updated Title', time: '11:00' })
      
      const event = useEventStore.getState().events[0]
      
      expect(event.title).toBe('Updated Title')
      expect(event.time).toBe('11:00')
      expect(event.date).toBe('2026-03-25') // Unchanged fields stay the same
    })

    it('should not affect other events when editing one', () => {
      const { addEvent, editEvent } = useEventStore.getState()
      
      addEvent({ title: 'Event 1', date: '2026-03-25', time: '10:00', duration: 60 })
      addEvent({ title: 'Event 2', date: '2026-03-26', time: '14:00', duration: 30 })
      
      const eventId = useEventStore.getState().events[0].id
      
      editEvent(eventId, { title: 'Modified Event 1' })
      
      const events = useEventStore.getState().events
      
      expect(events[0].title).toBe('Modified Event 1')
      expect(events[1].title).toBe('Event 2') // Unchanged
    })

    it('should return unchanged state if event ID not found', () => {
      const { addEvent, editEvent } = useEventStore.getState()
      
      addEvent({ title: 'Event 1', date: '2026-03-25', time: '10:00', duration: 60 })
      
      const before = useEventStore.getState().events
      editEvent('non-existent-id', { title: 'Should Not Apply' })
      const after = useEventStore.getState().events
      
      expect(after[0].title).toBe('Event 1') // No change
    })
  })

  describe('deleteEvent', () => {
    it('should delete an event by ID', () => {
      const { addEvent, deleteEvent } = useEventStore.getState()
      
      addEvent({ title: 'Event to Delete', date: '2026-03-25', time: '10:00', duration: 60 })
      const eventId = useEventStore.getState().events[0].id
      
      deleteEvent(eventId)
      
      const events = useEventStore.getState().events
      
      expect(events).toHaveLength(0)
    })

    it('should remove associated task log entries', () => {
      const { addEvent, deleteEvent } = useEventStore.getState()
      
      addEvent({ title: 'Event with Log', date: '2026-03-25', time: '10:00', duration: 60 })
      const eventId = useEventStore.getState().events[0].id
      
      // Task log should have 1 entry from addEvent
      expect(useEventStore.getState().taskLog).toHaveLength(1)
      
      deleteEvent(eventId)
      
      expect(useEventStore.getState().taskLog).toHaveLength(0)
    })

    it('should only delete the specified event', () => {
      const { addEvent, deleteEvent } = useEventStore.getState()
      
      addEvent({ title: 'Keep This', date: '2026-03-25', time: '10:00', duration: 60 })
      addEvent({ title: 'Delete This', date: '2026-03-26', time: '14:00', duration: 30 })
      
      const eventToDelete = useEventStore.getState().events[1].id
      
      deleteEvent(eventToDelete)
      
      const events = useEventStore.getState().events
      
      expect(events).toHaveLength(1)
      expect(events[0].title).toBe('Keep This')
    })
  })

  describe('markDone', () => {
    it('should toggle done status of an event', () => {
      const { addEvent, markDone } = useEventStore.getState()
      
      addEvent({ title: 'Task', date: '2026-03-25', time: '10:00', duration: 60 })
      const eventId = useEventStore.getState().events[0].id
      
      markDone(eventId)
      
      const event = useEventStore.getState().events[0]
      
      expect(event.done).toBe(true)
    })

    it('should log status change to task log', () => {
      const { addEvent, markDone } = useEventStore.getState()
      
      addEvent({ title: 'Task', date: '2026-03-25', time: '10:00', duration: 60 })
      const eventId = useEventStore.getState().events[0].id
      
      const logBefore = useEventStore.getState().taskLog.length
      
      markDone(eventId)
      
      const logAfter = useEventStore.getState().taskLog
      
      expect(logAfter).toHaveLength(logBefore + 1)
      expect(logAfter[logAfter.length - 1].status).toBe('done')
    })

    it('should toggle back to not done', () => {
      const { addEvent, markDone } = useEventStore.getState()
      
      addEvent({ title: 'Task', date: '2026-03-25', time: '10:00', duration: 60 })
      const eventId = useEventStore.getState().events[0].id
      
      markDone(eventId) // Mark as done
      markDone(eventId) // Toggle back
      
      const event = useEventStore.getState().events[0]
      
      expect(event.done).toBe(false)
    })
  })

  describe('cancelEvent', () => {
    it('should mark event as cancelled', () => {
      const { addEvent, cancelEvent } = useEventStore.getState()
      
      addEvent({ title: 'Event', date: '2026-03-25', time: '10:00', duration: 60 })
      const eventId = useEventStore.getState().events[0].id
      
      cancelEvent(eventId)
      
      const event = useEventStore.getState().events[0]
      
      expect(event.cancelled).toBe(true)
    })

    it('should set done to false when cancelled', () => {
      const { addEvent, markDone, cancelEvent } = useEventStore.getState()
      
      addEvent({ title: 'Event', date: '2026-03-25', time: '10:00', duration: 60 })
      const eventId = useEventStore.getState().events[0].id
      
      markDone(eventId) // Mark as done first
      cancelEvent(eventId) // Then cancel
      
      const event = useEventStore.getState().events[0]
      
      expect(event.cancelled).toBe(true)
      expect(event.done).toBe(false)
    })

    it('should log cancellation to task log', () => {
      const { addEvent, cancelEvent } = useEventStore.getState()
      
      addEvent({ title: 'Event', date: '2026-03-25', time: '10:00', duration: 60 })
      const eventId = useEventStore.getState().events[0].id
      
      cancelEvent(eventId)
      
      const taskLog = useEventStore.getState().taskLog
      const lastLog = taskLog[taskLog.length - 1]
      
      expect(lastLog.status).toBe('cancelled')
      expect(lastLog.eventId).toBe(eventId)
    })
  })

  describe('reschedule', () => {
    it('should update event date and time', () => {
      const { addEvent, reschedule } = useEventStore.getState()
      
      addEvent({ title: 'Meeting', date: '2026-03-25', time: '10:00', duration: 60 })
      const eventId = useEventStore.getState().events[0].id
      
      reschedule(eventId, '2026-03-27', '14:30')
      
      const event = useEventStore.getState().events[0]
      
      expect(event.date).toBe('2026-03-27')
      expect(event.time).toBe('14:30')
    })

    it('should not affect other fields', () => {
      const { addEvent, reschedule } = useEventStore.getState()
      
      addEvent({ 
        title: 'Meeting',
        date: '2026-03-25',
        time: '10:00',
        duration: 60,
        color: 'blue',
        sub: 'Room A'
      })
      const eventId = useEventStore.getState().events[0].id
      
      reschedule(eventId, '2026-03-27', '14:30')
      
      const event = useEventStore.getState().events[0]
      
      expect(event.title).toBe('Meeting')
      expect(event.duration).toBe(60)
      expect(event.color).toBe('blue')
      expect(event.sub).toBe('Room A')
    })
  })

  describe('navigation actions', () => {
    it('should navigate to next week', () => {
      const { nextWeek, currentWeekStart } = useEventStore.getState()
      const initialWeek = currentWeekStart
      
      nextWeek()
      
      const newWeek = useEventStore.getState().currentWeekStart
      
      expect(newWeek).not.toEqual(initialWeek)
      // New week should be 7 days ahead
      expect(newWeek.getTime()).toBeGreaterThan(initialWeek.getTime())
    })

    it('should navigate to previous week', () => {
      const { prevWeek, currentWeekStart } = useEventStore.getState()
      const initialWeek = currentWeekStart
      
      prevWeek()
      
      const newWeek = useEventStore.getState().currentWeekStart
      
      expect(newWeek).not.toEqual(initialWeek)
      // New week should be 7 days before
      expect(newWeek.getTime()).toBeLessThan(initialWeek.getTime())
    })

    it('should jump to specific date', () => {
      const { jumpToDate } = useEventStore.getState()
      const targetDate = new Date('2026-12-25')
      
      jumpToDate(targetDate)
      
      const currentWeekStart = useEventStore.getState().currentWeekStart
      
      // Should jump to the week containing Dec 25, 2026
      expect(currentWeekStart.getMonth()).toBe(11) // December (0-indexed)
      expect(currentWeekStart.getFullYear()).toBe(2026)
    })
  })

  describe('search and settings', () => {
    it('should update search query', () => {
      const { setSearchQuery } = useEventStore.getState()
      
      setSearchQuery('meeting')
      
      expect(useEventStore.getState().searchQuery).toBe('meeting')
    })

    it('should update awake hours', () => {
      const { setAwakeStart, setAwakeEnd } = useEventStore.getState()
      
      setAwakeStart(7)
      setAwakeEnd(22)
      
      const state = useEventStore.getState()
      
      expect(state.awakeStart).toBe(7)
      expect(state.awakeEnd).toBe(22)
    })
  })
})

describe('getTaskStatus helper', () => {
  it('should return "cancelled" for cancelled events', () => {
    const event = {
      title: 'Cancelled Event',
      date: '2026-03-30',
      time: '10:00',
      cancelled: true,
      done: false,
    }
    
    expect(getTaskStatus(event)).toBe('cancelled')
  })

  it('should return "done" for completed events', () => {
    const event = {
      title: 'Done Event',
      date: '2026-03-30',
      time: '10:00',
      cancelled: false,
      done: true,
    }
    
    expect(getTaskStatus(event)).toBe('done')
  })

  it('should return "overdue" for past events', () => {
    const event = {
      title: 'Past Event',
      date: '2020-01-01',
      time: '10:00',
      cancelled: false,
      done: false,
    }
    
    expect(getTaskStatus(event)).toBe('overdue')
  })

  it('should return "upcoming" for future events', () => {
    const event = {
      title: 'Future Event',
      date: '2030-01-01',
      time: '10:00',
      cancelled: false,
      done: false,
    }
    
    expect(getTaskStatus(event)).toBe('upcoming')
  })
})

describe('STATUS_STYLES', () => {
  it('should have styles for all status types', () => {
    expect(STATUS_STYLES.done).toBeDefined()
    expect(STATUS_STYLES.upcoming).toBeDefined()
    expect(STATUS_STYLES.overdue).toBeDefined()
    expect(STATUS_STYLES.cancelled).toBeDefined()
  })

  it('should have label and pill properties for each status', () => {
    Object.values(STATUS_STYLES).forEach((style) => {
      expect(style.label).toBeDefined()
      expect(style.pill).toBeDefined()
      expect(typeof style.label).toBe('string')
      expect(typeof style.pill).toBe('string')
    })
  })
})
