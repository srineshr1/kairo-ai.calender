require('dotenv').config()
const axios = require('axios')
const { extractEvents } = require('./extractor')

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

const EVENT_EXTRACTION_PROMPT = (content) => `You are a college calendar assistant for an Indian university student.

Extract all exam/class/schedule events from the following message.
Return ONLY a JSON array. No explanation. No markdown. Just the array.

If no events found return: []

Each event object:
{
  "title": "short clear title like 'Math Exam' or 'Physics Class Postponed'",
  "date": "YYYY-MM-DD or DD/MM/YYYY or written date like '17th March'",
  "time": "HH:MM in 24hr format, default 09:00 if not mentioned",
  "duration": 60,
  "sub": "subject name or additional info",
  "type": "exam|class|postponed|cancelled|holiday|lab|other",
  "color": "pink for exams, amber for postponed/cancelled, green for holiday, blue for class"
}

Today is ${new Date().toISOString().split('T')[0]}.

Message:
${content}

JSON array:`

// ── Text analysis via Ollama llama3 ──
async function analyzeText(text, groupName) {
  console.log(`  [Ollama] Analyzing text message from "${groupName}"`)
  try {
    const res = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: 'llama3',
      prompt: EVENT_EXTRACTION_PROMPT(text),
      stream: false,
      options: { temperature: 0.1 },
    }, { timeout: 30000 })

    const raw = res.data.response || ''
    console.log(`  [Ollama] Raw response: ${raw.slice(0, 100)}...`)
    return extractEvents(raw, groupName)
  } catch (err) {
    console.error(`  [Ollama] Text analysis failed: ${err.message}`)
    return []
  }
}

// ── Image analysis — try llava first, fallback to Gemini ──
async function analyzeImage(base64Image, mimeType = 'image/jpeg', groupName) {
  console.log(`  [Vision] Analyzing image from "${groupName}"`)

  // Try llava first
  try {
    console.log('  [llava] Attempting local vision analysis...')
    const res = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: 'llava',
      prompt: `You are analyzing a college timetable or schedule image.
Extract all exam/class/schedule information and return ONLY a JSON array of events.
No explanation. Just JSON array.
Today is ${new Date().toISOString().split('T')[0]}.
Each event: {"title":"...","date":"DD/MM/YYYY","time":"HH:MM","sub":"...","type":"exam|class|lab|other"}
JSON array:`,
      images: [base64Image],
      stream: false,
      options: { temperature: 0.1 },
    }, { timeout: 60000 })

    const raw = res.data.response || ''
    const events = extractEvents(raw, groupName)

    if (events.length > 0) {
      console.log(`  [llava] Found ${events.length} events`)
      return events
    }
    console.log('  [llava] No events found, falling back to Gemini...')
  } catch (err) {
    console.log(`  [llava] Failed (${err.message}), falling back to Gemini...`)
  }

  // Fallback to Gemini Vision
  return analyzeImageWithGemini(base64Image, mimeType, groupName)
}

// ── Gemini Vision fallback ──
async function analyzeImageWithGemini(base64Image, mimeType = 'image/jpeg', groupName) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.error('  [Gemini] No API key set in .env!')
    return []
  }

  try {
    console.log('  [Gemini] Analyzing image...')
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [
            {
              text: `You are analyzing a college timetable or exam schedule image for an Indian university.
Extract ALL exam/class/schedule events and return ONLY a JSON array.
No explanation. Just the JSON array.
Today is ${new Date().toISOString().split('T')[0]}.

Each event object:
{
  "title": "clear title like 'Data Structures Exam'",
  "date": "YYYY-MM-DD",
  "time": "HH:MM (24hr, default 09:00)",
  "duration": 60,
  "sub": "subject or room info",
  "type": "exam|class|lab|viva|holiday",
  "color": "pink for exam, blue for class, amber for postponed, green for holiday"
}

Return [] if no schedule info found.
JSON array:`
            },
            {
              inline_data: { mime_type: mimeType, data: base64Image }
            }
          ]
        }],
        generationConfig: { temperature: 0.1 }
      },
      { timeout: 30000 }
    )

    const raw = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    console.log(`  [Gemini] Raw response: ${raw.slice(0, 100)}...`)
    const events = extractEvents(raw, groupName)
    console.log(`  [Gemini] Found ${events.length} events`)
    return events
  } catch (err) {
    console.error(`  [Gemini] Failed: ${err.message}`)
    return []
  }
}

// ── PDF analysis ──
async function analyzePDF(buffer, groupName) {
  console.log(`  [PDF] Extracting text from PDF...`)
  try {
    const pdfParse = require('pdf-parse')
    const data = await pdfParse(buffer)
    const text = data.text?.slice(0, 4000) || '' // limit to 4k chars
    if (!text.trim()) {
      console.log('  [PDF] No text extracted from PDF')
      return []
    }
    console.log(`  [PDF] Extracted ${text.length} chars, sending to Ollama...`)
    return analyzeText(text, groupName)
  } catch (err) {
    console.error(`  [PDF] Failed: ${err.message}`)
    return []
  }
}

module.exports = { analyzeText, analyzeImage, analyzePDF }
