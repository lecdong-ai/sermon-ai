import { createClient, SupabaseClient } from '@supabase/supabase-js'

export const hasSupabaseConfig = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Next.js Server Component의 Data Cache에 GET 응답이 캐시(stale)되지 않도록 no-store 강제
// (supabase-js는 내부적으로 전역 fetch를 사용 → Next 14 기본 force-cache에 걸림)
const noStoreFetch: typeof fetch = (input, init) => {
  return fetch(input, { ...init, cache: 'no-store' })
}

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
  return createClient(url, key, { global: { fetch: noStoreFetch } })
})

export const supabaseAdmin = makeLazyClient(() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase environment variables are not set')
  return createClient(url, key, { global: { fetch: noStoreFetch } })
})
