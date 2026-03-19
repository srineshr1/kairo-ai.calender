// Extracts structured calendar events from raw model text response

const TODAY = new Date()

// Parse Indian date formats → YYYY-MM-DD
function parseIndianDate(str) {
  if (!str) return null

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str.trim())) return str.trim()

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = str.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/)
  if (dmy) {
    const d = dmy[1].padStart(2, '0')
    const m = dmy[2].padStart(2, '0')
    const y = dmy[3].length === 2 ? '20' + dmy[3] : dmy[3]
    return `${y}-${m}-${d}`
  }

  // "17th March" / "March 17" / "17 March 2026"
  const months = {
    jan:1, feb:2, mar:3, apr:4, may:5, jun:6,
    jul:7, aug:8, sep:9, oct:10, nov:11, dec:12,
    january:1, february:2, march:3, april:4, june:6,
    july:7, august:8, september:9, october:10, november:11, december:12,
  }
  const written = str.toLowerCase().match(/(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)(?:\s+(\d{4}))?/)
  if (written) {
    const day = written[1].padStart(2, '0')
    const mon = months[written[2].slice(0,3)]
    if (mon) {
      const month = String(mon).padStart(2, '0')
      const year = written[3] || TODAY.getFullYear()
      return `${year}-${month}-${day}`
    }
  }
  const written2 = str.toLowerCase().match(/([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s+(\d{4}))?/)
  if (written2) {
    const mon = months[written2[1].slice(0,3)]
    if (mon) {
      const day = written2[2].padStart(2, '0')
      const month = String(mon).padStart(2, '0')
      const year = written2[3] || TODAY.getFullYear()
      return `${year}-${month}-${day}`
    }
  }

  // "tomorrow"
  if (/tomorrow/i.test(str)) {
    const d = new Date(TODAY)
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }

  // "next monday" etc
  const days = { sun:0, mon:1, tue:2, wed:3, thu:4, fri:5, sat:6 }
  const nextDay = str.toLowerCase().match(/next\s+([a-z]+)/)
  if (nextDay) {
    const target = days[nextDay[1].slice(0,3)]
    if (target !== undefined) {
      const d = new Date(TODAY)
      const curr = d.getDay()
      const diff = (target - curr + 7) % 7 || 7
      d.setDate(d.getDate() + diff)
      return d.toISOString().split('T')[0]
    }
  }

  return null
}

// Pick event color based on type
function pickColor(title = '', type = '') {
  const t = (title + type).toLowerCase()
  if (t.includes('exam') || t.includes('test') || t.includes('viva')) return 'pink'
  if (t.includes('cancel') || t.includes('postpone') || t.includes('reschedul')) return 'amber'
  if (t.includes('holiday') || t.includes('leave')) return 'green'
  if (t.includes('lab') || t.includes('practical')) return 'blue'
  return 'blue'
}

const genId = () => 'wa' + Date.now() + Math.random().toString(36).slice(2, 6)

// Main extractor — takes raw model string, returns array of events
function extractEvents(rawText, sourceGroup = '') {
  if (!rawText) return []

  // Try JSON parse first
  let parsed = null
  try {
    const clean = rawText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim()
    // find first [ or {
    const arrStart = clean.indexOf('[')
    const objStart = clean.indexOf('{')
    if (arrStart !== -1 && (arrStart < objStart || objStart === -1)) {
      parsed = JSON.parse(clean.slice(arrStart, clean.lastIndexOf(']') + 1))
    } else if (objStart !== -1) {
      const obj = JSON.parse(clean.slice(objStart, clean.lastIndexOf('}') + 1))
      parsed = obj.events || [obj]
    }
  } catch {
    parsed = null
  }

  if (parsed && Array.isArray(parsed) && parsed.length > 0) {
    return parsed
      .filter(e => e.title && e.date)
      .map(e => ({
        id: genId(),
        title: e.title,
        date: parseIndianDate(e.date) || e.date,
        time: e.time || '09:00',
        duration: e.duration || 60,
        sub: e.sub || e.location || sourceGroup,
        color: e.color || pickColor(e.title, e.type),
        recurrence: 'none',
        recurrenceEnd: '',
        done: false,
        cancelled: false,
        source: 'whatsapp',
        sourceGroup,
      }))
  }

  // Fallback: regex scrape for dates + surrounding context
  const events = []
  const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*(?:\s+\d{4})?|tomorrow|next\s+\w+)/gi
  const matches = [...rawText.matchAll(datePattern)]

  matches.forEach(match => {
    const date = parseIndianDate(match[0])
    if (!date) return
    // grab surrounding 60 chars as title context
    const start = Math.max(0, match.index - 40)
    const end = Math.min(rawText.length, match.index + 60)
    const context = rawText.slice(start, end).replace(/\n/g, ' ').trim()
    events.push({
      id: genId(),
      title: context.slice(0, 60),
      date,
      time: '09:00',
      duration: 60,
      sub: sourceGroup,
      color: pickColor(context),
      recurrence: 'none',
      recurrenceEnd: '',
      done: false,
      cancelled: false,
      source: 'whatsapp',
      sourceGroup,
    })
  })

  return events
}

module.exports = { extractEvents, parseIndianDate }
