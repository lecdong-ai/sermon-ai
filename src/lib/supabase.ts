import { createClient, SupabaseClient } from '@supabase/supabase-js'

export const hasSupabaseConfig = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

function makeLazyClient(init: () => SupabaseClient): SupabaseClient {
  let client: SupabaseClient | null = null
  return new Proxy({} as SupabaseClient, {
    get(_target, prop) {
      if (!client) client = init()
      const value = (client as any)[prop]
      return typeof value === 'function' ? (...args: any[]) => (value as Function).apply(client, args) : value
    },
  })
}

export const supabase = makeLazyClient(() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase environment variables are not set')
  return createClient(url, key)
})

export const supabaseAdmin = makeLazyClient(() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase environment variables are not set')
  return createClient(url, key)
})
