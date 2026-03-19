require('dotenv').config()
const { Client, LocalAuth, MessageTypes } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')
const fs = require('fs')
const path = require('path')

const { WATCHED_GROUPS, KEYWORDS, MIN_KEYWORD_MATCHES } = require('./config')
const { analyzeText, analyzeImage, analyzePDF } = require('./analyzer')
const { pushEvents } = require('./calendarPush')

const QR_FILE = path.join(__dirname, 'public', 'qr.html')
const QR_IMAGE_FILE = path.join(__dirname, 'public', 'qr.png')

function log(msg, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    warning: '\x1b[33m',
    error: '\x1b[31m',
    reset: '\x1b[0m'
  }
  console.log(`${colors[type] || ''}${msg}${colors.reset}`)
}

function createQRHTML(qrData) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>WhatsApp QR Code</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
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
      max-width: 450px;
      width: 90%;
    }
    h1 { font-size: 28px; margin-bottom: 10px; color: #25D366; }
    .status { font-size: 14px; color: #aaa; margin-bottom: 30px; }
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
    }
    .instructions {
      font-size: 14px;
      color: #ccc;
      margin-top: 20px;
      line-height: 1.8;
      text-align: left;
    }
    .instructions strong { color: #25D366; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .waiting { animation: pulse 2s infinite; }
  </style>
</head>
<body>
  <div class="container">
    <h1>WhatsApp Bridge</h1>
    <p class="status" id="status">Waiting for QR code...</p>
    <div class="qr-container" id="qrContainer">
      <pre id="qrCode">Loading...</pre>
    </div>
    <div class="instructions">
      <p><strong>1.</strong> Open WhatsApp on your phone</p>
      <p><strong>2.</strong> Tap ⋮ → Linked Devices → Link a Device</p>
      <p><strong>3.</strong> Scan the QR code</p>
    </div>
  </div>
  <script>
    async function checkQR() {
      try {
        const res = await fetch('/qr-data')
        const data = await res.text()
        if (data && data !== 'waiting') {
          document.getElementById('qrCode').textContent = data
          document.getElementById('status').textContent = 'Scan this QR code!'
          document.getElementById('status').className = ''
        }
        
        const statusRes = await fetch('/status')
        const status = await statusRes.json()
        if (status.connected) {
          document.getElementById('qrContainer').style.display = 'none'
          document.getElementById('status').innerHTML = '<span style="font-size:40px">✅</span><br>WhatsApp Connected!'
          document.getElementById('status').style.color = '#25D366'
        }
      } catch (e) {}
    }
    checkQR()
    setInterval(checkQR, 2000)
  </script>
</body>
</html>
`
}

log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info')
log('  📅 my.calendar WhatsApp Bridge', 'success')
log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info')
log('  Starting WhatsApp client...', 'info')
log(`  Watching groups: ${WATCHED_GROUPS.join(', ') || 'None configured'}`, 'warning')
log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'info')

let qrData = null
let isReady = false

const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'my-calendar-bridge' }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
})

client.on('qr', (qr) => {
  qrData = qr
  log('\n  ╔═══════════════════════════════════════╗', 'warning')
  log('  ║         QR CODE READY                ║', 'warning')
  log('  ╚═══════════════════════════════════════╝', 'warning')
  log('\n  🌐 Open http://localhost:3001 in browser', 'info')
  log('  📱 Scan with WhatsApp app\n', 'info')
  
  console.log(qr)
  qrcode.generate(qr, { small: true })
  console.log()
})

client.on('authenticated', () => {
  log('  ✅ WhatsApp authenticated!', 'success')
})

client.on('ready', () => {
  isReady = true
  qrData = null
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'success')
  log('  ✅ WhatsApp connected!', 'success')
  log('  📡 Listening for messages...', 'info')
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'success')
})

client.on('auth_failure', (msg) => {
  log(`\n  ❌ Auth failed: ${msg}`, 'error')
  process.exit(1)
})

client.on('disconnected', (reason) => {
  log(`\n  ⚠ Disconnected: ${reason}`, 'warning')
  log('  Attempting reconnect...', 'info')
})

function isWatchedGroup(chatName) {
  if (!chatName) return false
  const name = chatName.toLowerCase()
  return WATCHED_GROUPS.some(g => name.includes(g.toLowerCase()))
}

function isRelevantMessage(text) {
  if (!text) return false
  const lower = text.toLowerCase()
  const matches = KEYWORDS.filter(k => lower.includes(k.toLowerCase()))
  return matches.length >= MIN_KEYWORD_MATCHES
}

client.on('message', async (msg) => {
  try {
    const chat = await msg.getChat()

    if (!chat.isGroup) return

    const groupName = chat.name || ''

    if (!isWatchedGroup(groupName)) return

    const timestamp = new Date().toLocaleTimeString()
    log(`\n[${timestamp}] 📨 "${groupName}"`, 'info')
    log(`  Type: ${msg.type}`, 'info')

    let events = []

    if (msg.type === 'chat' || msg.type === MessageTypes.TEXT) {
      const text = msg.body || ''
      log(`  Text: "${text.slice(0, 60)}${text.length > 60 ? '...' : ''}"`, 'info')

      if (!isRelevantMessage(text)) {
        log('  ⏭️  Not relevant, skipping', 'warning')
        return
      }

      log('  🔍 Relevant! Sending to Ollama...', 'info')
      events = await analyzeText(text, groupName)
    }

    else if (msg.type === MessageTypes.IMAGE || msg.type === 'image') {
      log('  🖼️  Image received, downloading...', 'info')
      const media = await msg.downloadMedia()
      if (!media) { log('  ❌ Could not download image', 'error'); return }

      const base64 = media.data
      const mimeType = media.mimetype || 'image/jpeg'
      log(`  📊 Analyzing image (${mimeType})...`, 'info')
      events = await analyzeImage(base64, mimeType, groupName)
    }

    else if (msg.type === MessageTypes.DOCUMENT || msg.type === 'document') {
      const media = await msg.downloadMedia()
      if (!media) { log('  ❌ Could not download document', 'error'); return }

      if (media.mimetype?.includes('pdf') || media.filename?.endsWith('.pdf')) {
        log('  📄 PDF received, extracting...', 'info')
        const buffer = Buffer.from(media.data, 'base64')
        events = await analyzePDF(buffer, groupName)
      } else {
        log(`  ⏭️  Document type not supported: ${media.mimetype}`, 'warning')
        return
      }
    }

    else {
      log(`  ⏭️  Message type not handled: ${msg.type}`, 'warning')
      return
    }

    if (events.length > 0) {
      log(`  ✅ Extracted ${events.length} event(s)!`, 'success')
      await pushEvents(events)
    } else {
      log('  ℹ️  No events extracted', 'info')
    }

  } catch (err) {
    log(`  ❌ Error: ${err.message}`, 'error')
  }
})

client.initialize()

process.on('SIGINT', async () => {
  log('\n\n  Shutting down...', 'warning')
  await client.destroy()
  process.exit(0)
})
