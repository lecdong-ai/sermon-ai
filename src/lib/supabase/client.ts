import { createBrowserClient } from '@supabase/ssr'

const hasCreds = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export function createClient() {
  if (!hasCreds) {
    throw new Error('Supabase credentials not configured')
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export function hasSupabaseClient(): boolean {
  return hasCreds
}
