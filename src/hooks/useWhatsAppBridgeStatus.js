import { useState, useEffect } from 'react'
import { getStatus } from '../api/whatsappClient'

export function useWhatsAppBridgeStatus() {
  const [status, setStatus] = useState({
    connected: false,
    qr: null,
    message: 'Connecting...'
  })

  useEffect(() => {
    async function checkStatus() {
      try {
        const data = await getStatus()
        setStatus(data)
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
