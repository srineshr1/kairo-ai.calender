import { describe, it, expect, beforeEach, vi } from 'vitest'

// Import the functions to test
const { extractEvents, parseIndianDate } = await import('../../whatsapp-bridge/extractor.js')

describe('extractor.js (WhatsApp Bridge)', () => {
  describe('parseIndianDate', () => {
    beforeEach(() => {
      // Mock today's date to March 20, 2026
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-20T10:00:00'))
    })

    it('should return string unchanged if already in YYYY-MM-DD format', () => {
      expect(parseIndianDate('2026-03-25')).toBe('2026-03-25')
      expect(parseIndianDate('2024-12-31')).toBe('2024-12-31')
    })

    it('should parse DD/MM/YYYY format', () => {
      expect(parseIndianDate('25/12/2024')).toBe('2024-12-25')
      expect(parseIndianDate('1/1/2026')).toBe('2026-01-01')
      expect(parseIndianDate('15/08/2025')).toBe('2025-08-15')
    })

    it('should parse DD-MM-YYYY format', () => {
      expect(parseIndianDate('25-12-2024')).toBe('2024-12-25')
      expect(parseIndianDate('1-1-2026')).toBe('2026-01-01')
    })

    it('should parse "17th March" format with current year', () => {
      expect(parseIndianDate('17th March')).toBe('2026-03-17')
      expect(parseIndianDate('25th December')).toBe('2026-12-25')
    })

    it('should parse "March 17" format', () => {
      expect(parseIndianDate('March 17')).toBe('2026-03-17')
      expect(parseIndianDate('December 25')).toBe('2026-12-25')
    })

    it('should parse "17 March 2025" format with year', () => {
      expect(parseIndianDate('17 March 2025')).toBe('2025-03-17')
      expect(parseIndianDate('25 December 2024')).toBe('2024-12-25')
    })

    it('should handle "tomorrow" keyword', () => {
      const result = parseIndianDate('tomorrow')
      expect(result).toBe('2026-03-21') // Tomorrow from March 20
    })

    it('should handle "next monday" format', () => {
      // March 20, 2026 is Friday, so next Monday is March 23
      const result = parseIndianDate('next monday')
      expect(result).toBe('2026-03-23')
    })

    it('should handle "next friday" format', () => {
      // March 20, 2026 is Friday, so next Friday is March 27
      const result = parseIndianDate('next friday')
      expect(result).toBe('2026-03-27')
    })

    it('should return null for invalid date strings', () => {
      expect(parseIndianDate('invalid')).toBe(null)
      expect(parseIndianDate('random text')).toBe(null)
      expect(parseIndianDate('')).toBe(null)
      expect(parseIndianDate(null)).toBe(null)
    })

    it('should handle two-digit year format (DD/MM/YY)', () => {
      expect(parseIndianDate('25/12/24')).toBe('2024-12-25')
      expect(parseIndianDate('1/1/26')).toBe('2026-01-01')
    })
  })

  describe('extractEvents', () => {
    it('should extract events from JSON format', () => {
      const jsonText = `
        [
          {
            "title": "Math Exam",
            "date": "25/03/2026",
            "time": "10:00",
            "duration": 120
          }
        ]
      `
      
      const events = extractEvents(jsonText, 'Test Group')
      
      expect(events).toHaveLength(1)
      expect(events[0].title).toBe('Math Exam')
      expect(events[0].date).toBe('2026-03-25')
      expect(events[0].time).toBe('10:00')
      expect(events[0].duration).toBe(120)
      expect(events[0].sourceGroup).toBe('Test Group')
    })

    it('should extract events from JSON with code fences', () => {
      const jsonText = `
        \`\`\`json
        {
          "title": "Physics Lab",
          "date": "2026-03-26",
          "time": "14:00"
        }
        \`\`\`
      `
      
      const events = extractEvents(jsonText)
      
      expect(events).toHaveLength(1)
      expect(events[0].title).toBe('Physics Lab')
      expect(events[0].date).toBe('2026-03-26')
    })

    it('should filter out events without title or date', () => {
      const jsonText = `
        [
          {"title": "Valid Event", "date": "2026-03-25"},
          {"title": "No Date Event"},
          {"date": "2026-03-26"},
          {"title": "Another Valid", "date": "2026-03-27"}
        ]
      `
      
      const events = extractEvents(jsonText)
      
      expect(events).toHaveLength(2)
      expect(events[0].title).toBe('Valid Event')
      expect(events[1].title).toBe('Another Valid')
    })

    it('should provide default values for missing fields', () => {
      const jsonText = `
        [
          {"title": "Minimal Event", "date": "2026-03-25"}
        ]
      `
      
      const events = extractEvents(jsonText)
      
      expect(events[0].time).toBe('09:00')          // Default time
      expect(events[0].duration).toBe(60)           // Default duration
      expect(events[0].recurrence).toBe('none')     // Default recurrence
      expect(events[0].done).toBe(false)            // Default done status
      expect(events[0].source).toBe('whatsapp')     // Source marker
    })

    it('should auto-pick color based on event title', () => {
      const examEvent = '{"title": "Final Exam", "date": "2026-03-25"}'
      const labEvent = '{"title": "Lab Session", "date": "2026-03-26"}'
      const holidayEvent = '{"title": "Holiday Break", "date": "2026-03-27"}'
      
      const examEvents = extractEvents(`[${examEvent}]`)
      const labEvents = extractEvents(`[${labEvent}]`)
      const holidayEvents = extractEvents(`[${holidayEvent}]`)
      
      expect(examEvents[0].color).toBe('pink')      // Exam = pink
      expect(labEvents[0].color).toBe('blue')       // Lab = blue
      expect(holidayEvents[0].color).toBe('green')  // Holiday = green
    })

    it('should generate unique IDs for each event', () => {
      const jsonText = `
        [
          {"title": "Event 1", "date": "2026-03-25"},
          {"title": "Event 2", "date": "2026-03-26"}
        ]
      `
      
      const events = extractEvents(jsonText)
      
      expect(events[0].id).toBeDefined()
      expect(events[1].id).toBeDefined()
      expect(events[0].id).not.toBe(events[1].id)
      expect(events[0].id).toMatch(/^wa\d+/)  // ID starts with 'wa'
    })

    it('should fallback to regex extraction when JSON parsing fails', () => {
      // Plain text with date pattern
      const plainText = 'The exam is scheduled for 25/03/2026 in the main hall'
      
      const events = extractEvents(plainText, 'College Group')
      
      expect(events.length).toBeGreaterThan(0)
      expect(events[0].date).toBe('2026-03-25')
      expect(events[0].title).toContain('exam') // Context around the date
    })

    it('should return empty array for invalid input', () => {
      expect(extractEvents('')).toEqual([])
      expect(extractEvents(null)).toEqual([])
      expect(extractEvents('no dates here')).toEqual([])
    })

    it('should extract multiple events from text', () => {
      const jsonText = `
        [
          {"title": "Event 1", "date": "2026-03-25"},
          {"title": "Event 2", "date": "2026-03-26"},
          {"title": "Event 3", "date": "2026-03-27"}
        ]
      `
      
      const events = extractEvents(jsonText)
      
      expect(events).toHaveLength(3)
      expect(events[0].title).toBe('Event 1')
      expect(events[1].title).toBe('Event 2')
      expect(events[2].title).toBe('Event 3')
    })

    it('should handle events array nested in object', () => {
      const jsonText = `
        {
          "events": [
            {"title": "Nested Event", "date": "2026-03-25"}
          ]
        }
      `
      
      const events = extractEvents(jsonText)
      
      expect(events).toHaveLength(1)
      expect(events[0].title).toBe('Nested Event')
    })
  })
})
