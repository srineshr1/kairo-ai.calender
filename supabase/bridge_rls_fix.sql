-- =============================================
-- Bridge RLS Fix — User-scoped write policies
-- =============================================
-- Run in Supabase SQL Editor. Idempotent.
-- Enables RLS for INSERT/UPDATE/DELETE on WhatsApp tables
-- so the bridge can use the anon key with user JWT.

-- whatsapp_status: allow INSERT/UPDATE by authenticated user (their own row)
DROP POLICY IF EXISTS "insert own status" ON public.whatsapp_status;
CREATE POLICY "insert own status" ON public.whatsapp_status
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update own status" ON public.whatsapp_status;
CREATE POLICY "update own status" ON public.whatsapp_status
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- whatsapp_chats: allow INSERT/DELETE by authenticated user (their own rows)
DROP POLICY IF EXISTS "insert own chats" ON public.whatsapp_chats;
CREATE POLICY "insert own chats" ON public.whatsapp_chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete own chats" ON public.whatsapp_chats;
CREATE POLICY "delete own chats" ON public.whatsapp_chats
  FOR DELETE USING (auth.uid() = user_id);

-- whatsapp_events: allow INSERT by authenticated user (their own events)
DROP POLICY IF EXISTS "insert own events" ON public.whatsapp_events;
CREATE POLICY "insert own events" ON public.whatsapp_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- bridge_api_keys: allow INSERT by authenticated user (their own key)
DROP POLICY IF EXISTS "insert own api key" ON public.bridge_api_keys;
CREATE POLICY "insert own api key" ON public.bridge_api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);
