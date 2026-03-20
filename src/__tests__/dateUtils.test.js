import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  fmt,
  fmtDate,
  fmtTime,
  parseDate,
  getWorkWeekStart,
  getWorkWeekDays,
  timeToMinutes,
  minutesToTime,
  snapTo15,
  expandRecurring,
} from '../lib/dateUtils'

describe('dateUtils', () => {
  describe('fmtDate', () => {
    it('should format date to YYYY-MM-DD', () => {
      const date = new Date('2026-03-20T10:30:00')
      expect(fmtDate(date)).toBe('2026-03-20')
    })
  })

  describe('fmtTime', () => {
    it('should format time to HH:mm', () => {
      const date = new Date('2026-03-20T09:05:00')
      expect(fmtTime(date)).toBe('09:05')
    })

    it('should format afternoon time correctly', () => {
      const date = new Date('2026-03-20T14:30:00')
      expect(fmtTime(date)).toBe('14:30')
    })
  })

  describe('parseDate', () => {
    it('should parse valid ISO date string', () => {
      const result = parseDate('2026-03-20')
      expect(result).toBeInstanceOf(Date)
      expect(fmtDate(result)).toBe('2026-03-20')
    })

    it('should return current date for invalid string', () => {
      const result = parseDate('invalid-date')
      expect(result).toBeInstanceOf(Date)
      // Should return a valid date (today as fallback)
    })
  })

  describe('getWorkWeekStart', () => {
    it('should return Monday for a date in the middle of the week', () => {
      // Wednesday, March 20, 2026
      const wednesday = new Date('2026-03-20')
      const monday = getWorkWeekStart(wednesday)
      
      expect(monday.getDay()).toBe(1) // 1 = Monday
      expect(fmtDate(monday)).toBe('2026-03-16') // Monday of that week
    })

    it('should return same date if already Monday', () => {
      const monday = new Date('2026-03-16') // Already a Monday
      const result = getWorkWeekStart(monday)
      
      expect(fmtDate(result)).toBe('2026-03-16')
    })
  })

  describe('getWorkWeekDays', () => {
    it('should return 5 days starting from Monday', () => {
      const monday = new Date('2026-03-16')
      const days = getWorkWeekDays(monday)
      
      expect(days).toHaveLength(5)
      expect(fmtDate(days[0])).toBe('2026-03-16') // Monday
      expect(fmtDate(days[1])).toBe('2026-03-17') // Tuesday
      expect(fmtDate(days[2])).toBe('2026-03-18') // Wednesday
      expect(fmtDate(days[3])).toBe('2026-03-19') // Thursday
      expect(fmtDate(days[4])).toBe('2026-03-20') // Friday
    })
  })

  describe('timeToMinutes', () => {
    it('should convert morning time to minutes', () => {
      expect(timeToMinutes('09:00')).toBe(540) // 9 * 60
    })

    it('should convert afternoon time to minutes', () => {
      expect(timeToMinutes('14:30')).toBe(870) // 14 * 60 + 30
    })

    it('should handle midnight', () => {
      expect(timeToMinutes('00:00')).toBe(0)
    })

    it('should handle end of day', () => {
      expect(timeToMinutes('23:59')).toBe(1439) // 23 * 60 + 59
    })
  })

  describe('minutesToTime', () => {
    it('should convert minutes to time format', () => {
      expect(minutesToTime(540)).toBe('09:00')
    })

    it('should convert afternoon minutes to time', () => {
      expect(minutesToTime(870)).toBe('14:30')
    })

    it('should handle midnight', () => {
      expect(minutesToTime(0)).toBe('00:00')
    })

    it('should pad single digits with zero', () => {
      expect(minutesToTime(125)).toBe('02:05') // 2 hours 5 minutes
    })
  })

  describe('snapTo15', () => {
    it('should snap to nearest 15-minute interval', () => {
      expect(snapTo15(0)).toBe(0)
      expect(snapTo15(7)).toBe(0)      // 7.5 rounds down to 0
      expect(snapTo15(8)).toBe(15)     // 8 rounds up to 15
      expect(snapTo15(15)).toBe(15)    // Exact match
      expect(snapTo15(22)).toBe(15)    // 22 rounds down to 15
      expect(snapTo15(23)).toBe(30)    // 23 rounds up to 30  
      expect(snapTo15(37)).toBe(30)    // 37 rounds down to 30
      expect(snapTo15(38)).toBe(45)    // 38 rounds up to 45
      expect(snapTo15(45)).toBe(45)    // Exact match
      expect(snapTo15(52)).toBe(45)    // 52 rounds down to 45
      expect(snapTo15(53)).toBe(60)    // 53 rounds up to 60
    })
  })

  describe('expandRecurring', () => {
    const weekDates = [
      new Date('2026-03-16'), // Monday
      new Date('2026-03-17'), // Tuesday
      new Date('2026-03-18'), // Wednesday
      new Date('2026-03-19'), // Thursday
      new Date('2026-03-20'), // Friday
    ]

    it('should not expand events with no recurrence', () => {
      const events = [
        {
          id: 'e1',
          title: 'One-time Meeting',
          date: '2026-03-17',
          time: '10:00',
          recurrence: 'none',
        },
      ]

      const expanded = expandRecurring(events, weekDates)
      
      expect(expanded).toHaveLength(1)
      expect(expanded[0].id).toBe('e1')
      expect(expanded[0].date).toBe('2026-03-17')
    })

    it('should expand daily recurring events across all week days', () => {
      const events = [
        {
          id: 'e1',
          title: 'Daily Standup',
          date: '2026-03-16', // Monday
          time: '09:00',
          recurrence: 'daily',
        },
      ]

      const expanded = expandRecurring(events, weekDates)
      
      expect(expanded).toHaveLength(5) // Should appear all 5 days
      expect(expanded[0].date).toBe('2026-03-16')
      expect(expanded[1].date).toBe('2026-03-17')
      expect(expanded[2].date).toBe('2026-03-18')
      expect(expanded[3].date).toBe('2026-03-19')
      expect(expanded[4].date).toBe('2026-03-20')
    })

    it('should expand weekly recurring events on same day of week', () => {
      const events = [
        {
          id: 'e1',
          title: 'Weekly Meeting',
          date: '2026-03-17', // Tuesday
          time: '14:00',
          recurrence: 'weekly',
        },
      ]

      const expanded = expandRecurring(events, weekDates)
      
      // Should only appear on Tuesday
      expect(expanded).toHaveLength(1)
      expect(expanded[0].date).toBe('2026-03-17')
      expect(expanded[0].title).toBe('Weekly Meeting')
    })

    it('should mark expanded events with _recurring flag', () => {
      const events = [
        {
          id: 'e1',
          title: 'Daily Standup',
          date: '2026-03-16',
          time: '09:00',
          recurrence: 'daily',
        },
      ]

      const expanded = expandRecurring(events, weekDates)
      
      // First event is the original
      expect(expanded[0]._recurring).toBeUndefined()
      
      // Rest are expanded copies
      expect(expanded[1]._recurring).toBe(true)
      expect(expanded[2]._recurring).toBe(true)
      expect(expanded[3]._recurring).toBe(true)
      expect(expanded[4]._recurring).toBe(true)
    })

    it('should respect recurrenceEnd date', () => {
      const events = [
        {
          id: 'e1',
          title: 'Limited Daily Event',
          date: '2026-03-16',
          time: '09:00',
          recurrence: 'daily',
          recurrenceEnd: '2026-03-16', // Ends same day
        },
      ]

      const expanded = expandRecurring(events, weekDates)
      
      // Should only appear Monday (the original date)
      // recurrenceEnd prevents expansion beyond the end date
      expect(expanded).toHaveLength(1)
      expect(expanded[0].date).toBe('2026-03-16')
    })

    it('should handle multiple events with mixed recurrence patterns', () => {
      const events = [
        {
          id: 'e1',
          title: 'Daily Standup',
          date: '2026-03-16',
          time: '09:00',
          recurrence: 'daily',
        },
        {
          id: 'e2',
          title: 'One-time Meeting',
          date: '2026-03-17',
          time: '14:00',
          recurrence: 'none',
        },
      ]

      const expanded = expandRecurring(events, weekDates)
      
      // 5 daily standups + 1 one-time meeting = 6 total
      expect(expanded).toHaveLength(6)
      
      // Check daily standup appears 5 times
      const standups = expanded.filter(e => e.title === 'Daily Standup')
      expect(standups).toHaveLength(5)
      
      // Check one-time meeting appears once
      const meetings = expanded.filter(e => e.title === 'One-time Meeting')
      expect(meetings).toHaveLength(1)
    })
  })
})
