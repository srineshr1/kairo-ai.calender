import http from 'http'
import { WebSocketServer } from 'ws'
import { Client } from 'whatsapp-web.js'

const PORT = 3001

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ status: 'ok', service: 'whatsapp-bridge' }))
})

const wss = new WebSocketServer({ server })

let waClient = null
let isReady = false

function broadcast(message) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(message))
    }
  })
}

async function initWhatsApp() {
  console.log('[Bridge] Initializing WhatsApp client...')
  
  waClient = new Client({
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  })

  waClient.on('qr', (qr) => {
    console.log('[Bridge] QR Code received. Scan with WhatsApp:')
    console.log(qr)
  })

  waClient.on('ready', () => {
    console.log('[Bridge] WhatsApp client is ready!')
    isReady = true
    broadcast({ type: 'status', connected: true })
  })

  waClient.on('message', async (msg) => {
    console.log(`[Bridge] Message from ${msg.from}: ${msg.body}`)
    
    broadcast({
      type: 'new_message',
      from: msg.from,
      body: msg.body,
      timestamp: Date.now(),
      hasMedia: msg.hasMedia,
      msgType: msg.type
    })
  })

  waClient.on('disconnected', (reason) => {
    console.log('[Bridge] WhatsApp disconnected:', reason)
    isReady = false
    broadcast({ type: 'status', connected: false })
    setTimeout(initWhatsApp, 5000)
  })

  waClient.on('auth_failure', (error) => {
    console.error('[Bridge] Authentication failed:', error)
    process.exit(1)
  })

  waClient.initialize()
}

wss.on('connection', (ws) => {
  console.log('[Bridge] Client connected')
  
  ws.send(JSON.stringify({
    type: 'status',
    connected: isReady
  }))

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message)
      console.log('[Bridge] Received:', data)
      
      if (data.type === 'send_message') {
        if (isReady && waClient) {
          waClient.sendMessage(data.to, data.body)
            .then(() => {
              ws.send(JSON.stringify({ type: 'message_sent', to: data.to }))
            })
            .catch(err => {
              ws.send(JSON.stringify({ type: 'error', message: err.message }))
            })
        } else {
          ws.send(JSON.stringify({ type: 'error', message: 'WhatsApp not ready' }))
        }
      }
      
      if (data.type === 'get_status') {
        ws.send(JSON.stringify({ type: 'status', connected: isReady }))
      }
    } catch (err) {
      console.error('[Bridge] Failed to parse message:', err)
    }
  })

  ws.on('close', () => {
    console.log('[Bridge] Client disconnected')
  })
})

server.listen(PORT, () => {
  console.log(`[Bridge] WhatsApp Bridge Server running on port ${PORT}`)
  console.log(`[Bridge] WebSocket available at ws://localhost:${PORT}`)
  initWhatsApp()
})

process.on('SIGINT', async () => {
  console.log('[Bridge] Shutting down...')
  if (waClient) {
    await waClient.destroy()
  }
  process.exit(0)
})
