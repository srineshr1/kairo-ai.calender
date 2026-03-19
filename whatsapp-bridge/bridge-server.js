// Run this in your ai-calendar folder: node bridge-server.js
// It listens on port 3001 and queues events for the calendar app to pick up

const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = process.env.BRIDGE_PORT || 3001
const QUEUE_FILE = path.join(__dirname, 'public', 'events-queue.json')

// Ensure public dir and queue file exist
if (!fs.existsSync(path.join(__dirname, 'public'))) {
  fs.mkdirSync(path.join(__dirname, 'public'))
}
if (!fs.existsSync(QUEUE_FILE)) {
  fs.writeFileSync(QUEUE_FILE, '[]')
}

app.use(cors())
app.use(express.json())

// POST /events — WhatsApp bridge pushes events here
app.post('/events', (req, res) => {
  try {
    const { events } = req.body
    if (!events || !Array.isArray(events)) {
      return res.status(400).json({ error: 'events array required' })
    }

    // Read existing queue
    const existing = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8') || '[]')
    const updated = [...existing, ...events]
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(updated, null, 2))

    console.log(`[${new Date().toLocaleTimeString()}] ✅ Queued ${events.length} event(s)`)
    events.forEach(e => console.log(`  → ${e.title} on ${e.date}`))

    res.json({ success: true, queued: events.length })
  } catch (err) {
    console.error('Error queuing events:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /events — calendar app polls this
app.get('/events', (req, res) => {
  try {
    const events = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8') || '[]')
    res.json(events)
  } catch {
    res.json([])
  }
})

// DELETE /events — calendar app clears queue after consuming
app.delete('/events', (req, res) => {
  fs.writeFileSync(QUEUE_FILE, '[]')
  res.json({ success: true })
})

app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`  📡 Bridge server running on port ${PORT}`)
  console.log(`  Waiting for events from WhatsApp bridge...`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
})
