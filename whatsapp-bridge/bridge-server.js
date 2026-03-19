const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = process.env.BRIDGE_PORT || 3001

const QUEUE_FILE = path.join(__dirname, 'public', 'events-queue.json')
const STATUS_FILE = path.join(__dirname, 'public', 'bridge-status.json')

if (!fs.existsSync(path.join(__dirname, 'public'))) {
  fs.mkdirSync(path.join(__dirname, 'public'))
}
if (!fs.existsSync(QUEUE_FILE)) {
  fs.writeFileSync(QUEUE_FILE, '[]')
}
if (!fs.existsSync(STATUS_FILE)) {
  fs.writeFileSync(STATUS_FILE, JSON.stringify({ connected: false, qr: null }))
}

app.use(cors())
app.use(express.json())

app.get('/qr-data', (req, res) => {
  try {
    const status = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'))
    res.type('text/plain').send(status.qr || 'waiting')
  } catch {
    res.type('text/plain').send('waiting')
  }
})

app.get('/status', (req, res) => {
  try {
    const status = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'))
    res.json(status)
  } catch {
    res.json({ connected: false })
  }
})

app.post('/events', (req, res) => {
  try {
    const { events } = req.body
    if (!events || !Array.isArray(events)) {
      return res.status(400).json({ error: 'events array required' })
    }

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

app.get('/events', (req, res) => {
  try {
    const events = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8') || '[]')
    res.json(events)
  } catch {
    res.json([])
  }
})

app.delete('/events', (req, res) => {
  fs.writeFileSync(QUEUE_FILE, '[]')
  res.json({ success: true })
})

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>WhatsApp Bridge QR</title>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    .container {
      text-align: center;
      padding: 40px;
      background: rgba(255,255,255,0.1);
      border-radius: 20px;
      backdrop-filter: blur(10px);
      max-width: 500px;
      width: 90%;
    }
    h1 { font-size: 28px; margin-bottom: 10px; color: #25D366; }
    .subtitle { font-size: 14px; color: #aaa; margin-bottom: 30px; }
    .qr-container {
      background: white;
      padding: 20px;
      border-radius: 15px;
      margin-bottom: 20px;
    }
    .qr-container pre {
      font-size: 6px;
      line-height: 1;
      color: #000;
      overflow: hidden;
      max-height: 350px;
    }
    .instructions {
      font-size: 14px;
      color: #ccc;
      margin-top: 20px;
      line-height: 2;
      text-align: left;
    }
    .instructions strong { color: #25D366; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .waiting { animation: pulse 2s infinite; }
    .countdown { font-size: 12px; color: #ff6b6b; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>WhatsApp Bridge</h1>
    <p class="subtitle" id="status">Waiting for WhatsApp bridge...</p>
    <div class="qr-container" id="qrContainer">
      <pre id="qrCode">Waiting for WhatsApp bridge to start...</pre>
      <p class="countdown" id="countdown"></p>
    </div>
    <div class="instructions">
      <p><strong>1.</strong> Start the WhatsApp bridge (node index.js)</p>
      <p><strong>2.</strong> Scan QR code with WhatsApp app</p>
      <p><strong>3.</strong> Bridge auto-connects on restart!</p>
    </div>
  </div>

  <script>
    const statusEl = document.getElementById('status')
    const qrEl = document.getElementById('qrCode')
    const countdownEl = document.getElementById('countdown')
    let countdown = 60
    
    async function check() {
      try {
        const res = await fetch('/status')
        const status = await res.json()
        
        if (status.connected) {
          document.getElementById('qrContainer').style.display = 'none'
          statusEl.innerHTML = '<span style="font-size:40px">✅</span><br>WhatsApp Connected!'
          statusEl.style.color = '#25D366'
        } else if (status.qr && status.qr !== 'waiting') {
          qrEl.textContent = status.qr
          statusEl.textContent = '✅ Scan this QR with WhatsApp!'
          statusEl.className = ''
          statusEl.style.color = '#aaa'
          countdown = 60
        } else {
          qrEl.textContent = 'Waiting for QR...'
          statusEl.textContent = 'Starting WhatsApp bridge...'
          statusEl.className = 'waiting'
          statusEl.style.color = '#aaa'
        }
      } catch (e) {
        qrEl.textContent = 'Error connecting...'
      }
    }
    
    setInterval(() => {
      countdown--
      countdownEl.textContent = countdown > 0 ? 'Expires in ' + countdown + 's' : ''
    }, 1000)
    
    check()
    setInterval(check, 2000)
  </script>
</body>
</html>
  `)
})

app.listen(PORT, () => {
  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  📡 WhatsApp Bridge Server')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`  🌐 Open http://localhost:${PORT} to scan QR`)
  console.log('  📁 Events queue: public/events-queue.json')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
})
