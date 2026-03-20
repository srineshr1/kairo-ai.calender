import { useState, useEffect, useCallback, useRef } from 'react'
import { useChatStore } from '../store/useChatStore'
import { useEventStore } from '../store/useEventStore'

const BRIDGE_URL = import.meta.env.VITE_BRIDGE_URL || 'http://localhost:3001'
const POLL_INTERVAL = parseInt(import.meta.env.VITE_POLL_INTERVAL || '3000', 10)

const genId = () => 'e' + Date.now() + Math.random().toString(36).slice(2, 6)

export function useWhatsAppSync() {
  const { addMessage } = useChatStore()
  const { addEvent } = useEventStore()
  
  const [isConnected, setIsConnected] = useState(false)
  const [lastSyncedEvents, setLastSyncedEvents] = useState([])
  const [syncCount, setSyncCount] = useState(0)
  const pollingRef = useRef(false)
  const processedIdsRef = useRef(new Set())

  const syncEvents = useCallback(async () => {
    if (pollingRef.current) return
    pollingRef.current = true

    try {
      // Add timeout to fetch request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const res = await fetch(`${BRIDGE_URL}/events`, {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      
      if (!res.ok) {
        setIsConnected(false)
        console.warn(`WhatsApp bridge returned HTTP ${res.status}: ${res.statusText}`)
        return
      }

      setIsConnected(true)
      
      // Parse JSON safely
      let events
      try {
        events = await res.json()
      } catch (parseErr) {
        console.error('Failed to parse WhatsApp bridge response:', parseErr)
        setIsConnected(false)
        return
      }

      // Validate events is an array
      if (!Array.isArray(events)) {
        console.error('WhatsApp bridge returned non-array response:', events)
        return
      }

      if (events.length > 0) {
        const newEvents = []
        
        events.forEach(ev => {
          // Validate required fields
          if (!ev.id) {
            console.warn('Skipping event without ID:', ev)
            return
          }
          if (!ev.title || !ev.date) {
            console.warn('Skipping event with missing title or date:', ev)
            return
          }

          if (!processedIdsRef.current.has(ev.id)) {
            processedIdsRef.current.add(ev.id)
            
            const newEv = {
              id: genId(),
              title: ev.title,
              date: ev.date,
              time: ev.time || '09:00',
              duration: ev.duration || 60,
              sub: ev.group || 'WhatsApp',
              color: ev.color || 'blue',
              recurrence: 'none',
              recurrenceEnd: '',
              done: false,
            }
            
            try {
              addEvent(newEv)
              newEvents.push(newEv)
              
              addMessage({ 
                role: 'ai', 
                text: `📱 Added event from ${ev.group || 'WhatsApp'}: "${newEv.title}"` 
              })
            } catch (addErr) {
              console.error('Failed to add event from WhatsApp:', addErr)
              addMessage({
                role: 'ai',
                text: `⚠ Failed to add WhatsApp event: ${addErr.message}`
              })
            }
          }
        })

        if (newEvents.length > 0) {
          setLastSyncedEvents(newEvents)
          setSyncCount(c => c + newEvents.length)
          
          // Clear processed events from bridge
          try {
            await fetch(`${BRIDGE_URL}/events`, { method: 'DELETE' })
          } catch (deleteErr) {
            console.warn('Failed to clear WhatsApp events from bridge:', deleteErr)
            // Don't set disconnected - this is not critical
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.warn('WhatsApp sync timed out')
      } else if (err.message.includes('Failed to fetch')) {
        console.warn('WhatsApp bridge not reachable. Is it running?')
      } else {
        console.error('WhatsApp sync error:', err)
      }
      setIsConnected(false)
    } finally {
      pollingRef.current = false
    }
  }, [addEvent, addMessage])

  useEffect(() => {
    syncEvents()
    
    const interval = setInterval(syncEvents, POLL_INTERVAL)
    
    return () => clearInterval(interval)
  }, [syncEvents])

  return {
    isConnected,
    lastSyncedEvents,
    syncCount,
  }
}
