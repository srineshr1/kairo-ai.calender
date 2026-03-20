import { useState, useEffect } from 'react'

const BRIDGE_URL = import.meta.env.VITE_BRIDGE_URL || 'http://localhost:3001'

export function useWhatsAppBridgeStatus() {
  const [status, setStatus] = useState({
    connected: false,
    qr: null,
    message: 'Connecting...'
  })

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch(`${BRIDGE_URL}/status`)
        if (res.ok) {
          const data = await res.json()
          setStatus({
            connected: data.connected || false,
            qr: data.qr,
            message: data.message || (data.connected ? 'Connected' : 'Disconnected')
          })
        }
      } catch (err) {
        setStatus({
          connected: false,
          qr: null,
          message: 'Bridge offline'
        })
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  return status
}
