require('dotenv').config()
const axios = require('axios')
const fs = require('fs')
const path = require('path')

const BRIDGE_PORT = process.env.BRIDGE_PORT || 3001
const QUEUE_FILE = path.join(__dirname, 'events-queue.json')

// Push events to the queue file (calendar app polls this)
async function pushEvents(events) {
  if (!events || events.length === 0) return

  console.log(`\n  [Calendar] Pushing ${events.length} event(s) to calendar...`)
  events.forEach(e => console.log(`    → ${e.title} on ${e.date} at ${e.time}`))

  try {
    // Try HTTP push to bridge server first
    await axios.post(`http://localhost:${BRIDGE_PORT}/events`, { events }, {
      timeout: 5000,
    })
    console.log(`  [Calendar] ✓ Pushed via HTTP`)
  } catch {
    // Fallback: write directly to queue file
    try {
      let existing = []
      if (fs.existsSync(QUEUE_FILE)) {
        existing = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8') || '[]')
      }
      const updated = [...existing, ...events]
      fs.writeFileSync(QUEUE_FILE, JSON.stringify(updated, null, 2))
      console.log(`  [Calendar] ✓ Written to events-queue.json (bridge server not running)`)
    } catch (err) {
      console.error(`  [Calendar] ✗ Failed to push events: ${err.message}`)
    }
  }
}

module.exports = { pushEvents }
