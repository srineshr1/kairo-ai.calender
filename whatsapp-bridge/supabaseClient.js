require('dotenv').config()

const { createClient } = require('@supabase/supabase-js')
const jwt = require('jsonwebtoken')

if (typeof WebSocket === 'undefined') {
  try { global.WebSocket = require('ws') } catch (_) { /* native available */ }
}

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

let adminClient = null
const userClients = new Map()

function getSupabase() {
  return getAdminSupabase()
}

function getAdminSupabase() {
  if (adminClient) return adminClient
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
  }
  adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return adminClient
}

function getUserSupabase(userId) {
  if (!SUPABASE_JWT_SECRET) {
    console.warn('[Supabase] SUPABASE_JWT_SECRET not set — falling back to admin client for userId:', userId)
    return getAdminSupabase()
  }
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_URL, SUPABASE_ANON_KEY, or SUPABASE_SERVICE_ROLE_KEY env vars')
  }
  const existing = userClients.get(userId)
  if (existing) return existing

  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: {
        'Authorization': `Bearer ${signUserJwt(userId)}`,
      },
    },
  })
  userClients.set(userId, client)
  return client
}

function signUserJwt(userId) {
  const secret = process.env.SUPABASE_JWT_SECRET || SUPABASE_SERVICE_ROLE_KEY
  return jwt.sign(
    { sub: userId, role: 'authenticated', aud: 'authenticated' },
    secret,
    { algorithm: 'HS256', expiresIn: '1h' },
  )
}

module.exports = { getSupabase, getAdminSupabase, getUserSupabase }
