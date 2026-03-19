import { useState, useEffect, useCallback, useRef } from 'react'
import { useChatStore } from '../store/useChatStore'
import { useEventStore } from '../store/useEventStore'

const BRIDGE_URL = 'http://localhost:3001'
const POLL_INTERVAL = 3000

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
      const res = await fetch(`${BRIDGE_URL}/events`)
      
      if (!res.ok) {
        setIsConnected(false)
        return
      }

      setIsConnected(true)
      const events = await res.json()

      if (events.length > 0) {
        const newEvents = []
        
        events.forEach(ev => {
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
            
            addEvent(newEv)
            newEvents.push(newEv)
            
            addMessage({ 
              role: 'ai', 
              text: `whatsapp : added event from ${ev.group || 'WhatsApp'}` 
            })
          }
        })

        if (newEvents.length > 0) {
          setLastSyncedEvents(newEvents)
          setSyncCount(c => c + newEvents.length)
          
          await fetch(`${BRIDGE_URL}/events`, { method: 'DELETE' })
        }
      }
    } catch (err) {
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
