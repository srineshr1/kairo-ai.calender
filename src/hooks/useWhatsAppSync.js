import { useState, useEffect, useCallback } from 'react'

const BRIDGE_URL = 'http://localhost:3001'

export function useWhatsAppSync() {
  const [newCount, setNewCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)

  const connect = useCallback(() => {
    const ws = new WebSocket(`${BRIDGE_URL}/ws`)

    ws.onopen = () => {
      console.log('[WhatsApp Sync] Connected to bridge server')
      setIsConnected(true)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.type === 'new_message') {
          setNewCount(prev => prev + 1)
          setLastMessage({
            from: data.from,
            body: data.body,
            timestamp: new Date(data.timestamp)
          })
        }
      } catch (err) {
        console.error('[WhatsApp Sync] Failed to parse message:', err)
      }
    }

    ws.onclose = () => {
      console.log('[WhatsApp Sync] Disconnected from bridge server')
      setIsConnected(false)
      // Reconnect after 3 seconds
      setTimeout(connect, 3000)
    }

    ws.onerror = (err) => {
      console.error('[WhatsApp Sync] WebSocket error:', err)
    }

    return ws
  }, [])

  useEffect(() => {
    const ws = connect()
    return () => {
      ws.close()
    }
  }, [connect])

  const clearCount = useCallback(() => {
    setNewCount(0)
  }, [])

  const dismissMessage = useCallback(() => {
    setLastMessage(null)
  }, [])

  return {
    newCount,
    isConnected,
    lastMessage,
    clearCount,
    dismissMessage
  }
}
