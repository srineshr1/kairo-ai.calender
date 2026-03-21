/**
 * WhatsApp Bridge API Client
 * Centralized client for interacting with the WhatsApp bridge server.
 * Handles all HTTP communication, error handling, and response parsing.
 */

const BRIDGE_URL = import.meta.env.VITE_BRIDGE_URL || 'http://localhost:3001'
const DEFAULT_TIMEOUT = 5000 // 5 seconds

/**
 * Custom error class for WhatsApp bridge errors
 */
export class WhatsAppBridgeError extends Error {
  constructor(message, status, originalError) {
    super(message)
    this.name = 'WhatsAppBridgeError'
    this.status = status
    this.originalError = originalError
  }
}

/**
 * Helper function to make fetch requests with timeout
 * 
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Response>} Fetch response
 * @throws {WhatsAppBridgeError} If request times out or fails
 */
async function fetchWithTimeout(url, options = {}, timeout = DEFAULT_TIMEOUT) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return res
  } catch (err) {
    clearTimeout(timeoutId)
    
    if (err.name === 'AbortError') {
      throw new WhatsAppBridgeError(
        `Request timed out after ${timeout}ms`,
        null,
        err
      )
    }
    
    if (err.message.includes('Failed to fetch')) {
      throw new WhatsAppBridgeError(
        'WhatsApp bridge not reachable. Is it running?',
        null,
        err
      )
    }
    
    throw new WhatsAppBridgeError(
      err.message || 'Unknown error connecting to WhatsApp bridge',
      null,
      err
    )
  }
}

/**
 * Get events from WhatsApp bridge
 * 
 * @returns {Promise<Array>} Array of event objects
 * @throws {WhatsAppBridgeError} If request fails or response is invalid
 * 
 * @example
 * const events = await getEvents()
 * console.log(events) // [{ id: 'msg123', title: 'Meeting', date: '2026-03-22', ... }]
 */
export async function getEvents() {
  try {
    const res = await fetchWithTimeout(`${BRIDGE_URL}/events`)
    
    if (!res.ok) {
      throw new WhatsAppBridgeError(
        `Bridge returned HTTP ${res.status}: ${res.statusText}`,
        res.status,
        null
      )
    }

    // Parse JSON safely
    let events
    try {
      events = await res.json()
    } catch (parseErr) {
      throw new WhatsAppBridgeError(
        'Failed to parse bridge response',
        null,
        parseErr
      )
    }

    // Validate events is an array
    if (!Array.isArray(events)) {
      throw new WhatsAppBridgeError(
        'Bridge returned non-array response',
        null,
        null
      )
    }

    return events
  } catch (err) {
    if (err instanceof WhatsAppBridgeError) {
      throw err
    }
    
    throw new WhatsAppBridgeError(
      'Failed to get events from bridge',
      null,
      err
    )
  }
}

/**
 * Clear all events from WhatsApp bridge
 * 
 * @returns {Promise<void>}
 * @throws {WhatsAppBridgeError} If request fails
 * 
 * @example
 * await clearEvents()
 * console.log('Events cleared from bridge')
 */
export async function clearEvents() {
  try {
    const res = await fetchWithTimeout(`${BRIDGE_URL}/events`, {
      method: 'DELETE'
    })
    
    if (!res.ok) {
      throw new WhatsAppBridgeError(
        `Failed to clear events: HTTP ${res.status}`,
        res.status,
        null
      )
    }
  } catch (err) {
    if (err instanceof WhatsAppBridgeError) {
      throw err
    }
    
    throw new WhatsAppBridgeError(
      'Failed to clear events from bridge',
      null,
      err
    )
  }
}

/**
 * Get WhatsApp connection status and QR code
 * 
 * @returns {Promise<Object>} Status object with connected, qr, and message fields
 * @throws {WhatsAppBridgeError} If request fails
 * 
 * @example
 * const status = await getStatus()
 * console.log(status) // { connected: true, qr: null, message: 'Connected' }
 */
export async function getStatus() {
  try {
    const res = await fetchWithTimeout(`${BRIDGE_URL}/status`)
    
    if (!res.ok) {
      throw new WhatsAppBridgeError(
        `Bridge returned HTTP ${res.status}: ${res.statusText}`,
        res.status,
        null
      )
    }

    // Parse JSON safely
    let data
    try {
      data = await res.json()
    } catch (parseErr) {
      throw new WhatsAppBridgeError(
        'Failed to parse bridge status response',
        null,
        parseErr
      )
    }

    // Return normalized status object
    return {
      connected: data.connected || false,
      qr: data.qr || null,
      message: data.message || (data.connected ? 'Connected' : 'Disconnected')
    }
  } catch (err) {
    if (err instanceof WhatsAppBridgeError) {
      throw err
    }
    
    throw new WhatsAppBridgeError(
      'Failed to get status from bridge',
      null,
      err
    )
  }
}

/**
 * Check if WhatsApp bridge is online
 * 
 * @returns {Promise<boolean>} True if bridge is reachable, false otherwise
 * 
 * @example
 * const isOnline = await checkHealth()
 * if (isOnline) {
 *   console.log('Bridge is running')
 * }
 */
export async function checkHealth() {
  try {
    const res = await fetchWithTimeout(`${BRIDGE_URL}/status`, {}, 3000)
    return res.ok
  } catch {
    return false
  }
}

/**
 * Get the configured WhatsApp bridge URL
 * 
 * @returns {string} The bridge base URL
 * 
 * @example
 * console.log(getBridgeUrl()) // "http://localhost:3001"
 */
export function getBridgeUrl() {
  return BRIDGE_URL
}
