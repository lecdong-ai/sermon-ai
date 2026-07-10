import { createClient, SupabaseClient } from '@supabase/supabase-js'

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

export const projectSupabase = makeLazyClient(() => {
  const url = process.env.NEXT_PUBLIC_PROJECT_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_PROJECT_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Project Supabase environment variables are not set')
  return createClient(url, key)
})

export const projectSupabaseAdmin = makeLazyClient(() => {
  const url = process.env.NEXT_PUBLIC_PROJECT_SUPABASE_URL
  const key = process.env.PROJECT_SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Project Supabase admin environment variables are not set')
  return createClient(url, key)
})
