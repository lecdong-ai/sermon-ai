import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://otzdebgfztoattfuvxqy.supabase.co'

function getAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured. Set it in .env.local')
  }
  return createClient(supabaseUrl, key)
}

export function getSupabaseAdmin() {
  return getAdminClient()
}
