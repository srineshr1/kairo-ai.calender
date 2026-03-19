import { useEffect, useRef, useState } from 'react'
import { useEventStore } from '../store/useEventStore'

const POLL_INTERVAL = 10000 // 10 seconds
const BRIDGE_URL = 'http://localhost:3001'

export function useWhatsAppSync() {
  const { addEvent } = useEventStore()
  const [lastSync, setLastSync] = useState(null)
  const [newCount, setNewCount] = useState(0)
  const timerRef = useRef(null)

  const poll = async () => {
    try {
      const res = await fetch(`${BRIDGE_URL}/events`)
      if (!res.ok) return
      const events = await res.json()
      if (!Array.isArray(events) || events.length === 0) return

      // Add each event to calendar store
      events.forEach(ev => addEvent(ev))

      // Clear the queue
      await fetch(`${BRIDGE_URL}/events`, { method: 'DELETE' })

      setNewCount(events.length)
      setLastSync(new Date())
      console.log(`[WhatsApp Sync] Added ${events.length} event(s) from WhatsApp`)

      // Auto-clear notification after 5s
      setTimeout(() => setNewCount(0), 5000)
    } catch {
      // Bridge server not running — silent fail
    }
  }

  useEffect(() => {
    // Poll immediately on mount then every interval
    poll()
    timerRef.current = setInterval(poll, POLL_INTERVAL)
    return () => clearInterval(timerRef.current)
  }, [])

  return { lastSync, newCount }
}
