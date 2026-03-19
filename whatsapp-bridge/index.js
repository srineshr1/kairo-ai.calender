require('dotenv').config()
const { Client, LocalAuth, MessageTypes } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')
const { WATCHED_GROUPS, KEYWORDS, MIN_KEYWORD_MATCHES } = require('./config')
const { analyzeText, analyzeImage, analyzePDF } = require('./analyzer')
const { pushEvents } = require('./calendarPush')

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('  📅 my.calendar WhatsApp Bridge')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('  Starting WhatsApp client...')
console.log(`  Watching for groups matching: ${WATCHED_GROUPS.join(', ')}`)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'my-calendar-bridge' }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
})

// ── QR Code ──
client.on('qr', (qr) => {
  console.log('\n  Scan this QR code with WhatsApp:\n')
  qrcode.generate(qr, { small: true })
  console.log('\n  Waiting for scan...\n')
})

// ── Ready ──
client.on('ready', () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  ✅ WhatsApp connected!')
  console.log('  📡 Listening for college group messages...')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
})

// ── Auth failure ──
client.on('auth_failure', (msg) => {
  console.error('  ✗ Auth failed:', msg)
  process.exit(1)
})

// ── Disconnected ──
client.on('disconnected', (reason) => {
  console.log('  ⚠ Disconnected:', reason)
  console.log('  Attempting reconnect...')
  client.initialize()
})

// ── Check if group is watched ──
function isWatchedGroup(chatName) {
  if (!chatName) return false
  const name = chatName.toLowerCase()
  return WATCHED_GROUPS.some(g => name.includes(g.toLowerCase()))
}

// ── Check if message is relevant ──
function isRelevantMessage(text) {
  if (!text) return false
  const lower = text.toLowerCase()
  const matches = KEYWORDS.filter(k => lower.includes(k.toLowerCase()))
  return matches.length >= MIN_KEYWORD_MATCHES
}

// ── Main message handler ──
client.on('message', async (msg) => {
  try {
    const chat = await msg.getChat()

    // Only process group messages
    if (!chat.isGroup) return

    const groupName = chat.name || ''

    // Only process watched groups
    if (!isWatchedGroup(groupName)) return

    const timestamp = new Date().toLocaleTimeString()
    console.log(`\n[${timestamp}] 📨 Message from: "${groupName}"`)
    console.log(`  Type: ${msg.type}`)

    let events = []

    // ── Handle text messages ──
    if (msg.type === 'chat' || msg.type === MessageTypes.TEXT) {
      const text = msg.body || ''
      console.log(`  Text: "${text.slice(0, 80)}${text.length > 80 ? '...' : ''}"`)

      if (!isRelevantMessage(text)) {
        console.log('  → Not relevant, skipping')
        return
      }

      console.log('  → Relevant! Sending to Ollama...')
      events = await analyzeText(text, groupName)
    }

    // ── Handle images ──
    else if (msg.type === MessageTypes.IMAGE || msg.type === 'image') {
      console.log('  → Image received, downloading...')
      const media = await msg.downloadMedia()
      if (!media) { console.log('  → Could not download image'); return }

      const base64 = media.data
      const mimeType = media.mimetype || 'image/jpeg'
      console.log(`  → Downloaded (${mimeType}), analyzing...`)
      events = await analyzeImage(base64, mimeType, groupName)
    }

    // ── Handle PDFs / documents ──
    else if (
      msg.type === MessageTypes.DOCUMENT ||
      msg.type === 'document' ||
      (msg.type === MessageTypes.AUDIO && msg.mimetype?.includes('pdf'))
    ) {
      const media = await msg.downloadMedia()
      if (!media) { console.log('  → Could not download document'); return }

      if (media.mimetype?.includes('pdf') || media.filename?.endsWith('.pdf')) {
        console.log('  → PDF received, extracting text...')
        const buffer = Buffer.from(media.data, 'base64')
        events = await analyzePDF(buffer, groupName)
      } else {
        console.log(`  → Document type ${media.mimetype} not supported`)
        return
      }
    }

    else {
      console.log(`  → Message type "${msg.type}" not handled`)
      return
    }

    // ── Push to calendar ──
    if (events.length > 0) {
      console.log(`  ✅ Extracted ${events.length} event(s)!`)
      await pushEvents(events)
    } else {
      console.log('  → No events extracted from this message')
    }

  } catch (err) {
    console.error('  ✗ Error processing message:', err.message)
  }
})

// ── Start ──
client.initialize()

// ── Graceful shutdown ──
process.on('SIGINT', async () => {
  console.log('\n\n  Shutting down...')
  await client.destroy()
  process.exit(0)
})
