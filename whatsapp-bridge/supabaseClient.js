const { createClient } = require('@supabase/supabase-js')

if (typeof WebSocket === 'undefined') {
  try { global.WebSocket = require('ws') } catch (_) { /* native available */ }
}

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

let client = null

function getSupabase() {
  if (client) return client
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
  }
  client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return client
}

module.exports = { getSupabase }
