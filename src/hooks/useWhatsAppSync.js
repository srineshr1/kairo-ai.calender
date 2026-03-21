import { useState, useEffect, useCallback, useRef } from 'react'
import { useChatStore } from '../store/useChatStore'
import { useEventStore } from '../store/useEventStore'
import { useNotificationStore } from '../store/useNotificationStore'
import { getEvents, clearEvents, WhatsAppBridgeError } from '../api/whatsappClient'
import { DEFAULT_POLL_INTERVAL } from '../lib/constants'

const POLL_INTERVAL = parseInt(import.meta.env.VITE_POLL_INTERVAL || String(DEFAULT_POLL_INTERVAL), 10)

const genId = () => 'e' + Date.now() + Math.random().toString(36).slice(2, 6)

export function useWhatsAppSync() {
  const { addMessage } = useChatStore()
  const { addEvent } = useEventStore()
  const { addNotification } = useNotificationStore()
  
  const [isConnected, setIsConnected] = useState(false)
  const [lastSyncedEvents, setLastSyncedEvents] = useState([])
  const [syncCount, setSyncCount] = useState(0)
  const pollingRef = useRef(false)
  const processedIdsRef = useRef(new Set())

  const syncEvents = useCallback(async () => {
    if (pollingRef.current) return
    pollingRef.current = true

    try {
      // Use whatsappClient abstraction layer
      const events = await getEvents()
      setIsConnected(true)

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
          
          // Add notification for successful sync
          addNotification({
            type: 'whatsapp',
            title: 'WhatsApp Sync Complete',
            message: `Added ${newEvents.length} event${newEvents.length > 1 ? 's' : ''} from your groups`,
          })
          
          // Clear processed events from bridge
          try {
            await clearEvents()
          } catch (deleteErr) {
            console.warn('Failed to clear WhatsApp events from bridge:', deleteErr)
            // Don't set disconnected - this is not critical
          }
        }
      }
    } catch (err) {
      setIsConnected(false)
      
      // Log errors appropriately based on type
      if (err instanceof WhatsAppBridgeError) {
        if (err.message.includes('timed out')) {
          console.warn('WhatsApp sync timed out')
        } else if (err.message.includes('not reachable')) {
          console.warn('WhatsApp bridge not reachable. Is it running?')
        } else {
          console.error('WhatsApp sync error:', err.message)
        }
      } else {
        console.error('WhatsApp sync error:', err)
      }
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
