// ─────────────────────────────────────────────
//  EDIT THIS FILE to configure your bridge
// ─────────────────────────────────────────────

// Add your college WhatsApp group names exactly as they appear in WhatsApp
// Case-insensitive partial match — "CSE" will match "CSE 2024 Batch"
const WATCHED_GROUPS = [
  'CSE',
  'Class',
  'College',
  'Department',
  'Faculty',
  'Exam',
  'Schedule',
  // Add your actual group names here:
  // 'JNTUH CSE 3-2',
  // 'Prof. Sharma Updates',
]

// Keywords that indicate a message is relevant
const KEYWORDS = [
  'exam', 'test', 'postponed', 'cancelled', 'rescheduled',
  'timetable', 'time table', 'schedule', 'class', 'lecture',
  'holiday', 'date', 'tomorrow', 'next week', 'internal',
  'external', 'practical', 'lab', 'unit test', 'mid',
  'semester', 'syllabus', 'notice', 'important', 'urgent',
  'hall ticket', 'results', 'viva', 'project',
]

// Minimum keyword matches to consider a message relevant (1 = any match)
const MIN_KEYWORD_MATCHES = 1

module.exports = { WATCHED_GROUPS, KEYWORDS, MIN_KEYWORD_MATCHES }
