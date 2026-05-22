import { createServerClient } from '@supabase/ssr'
import { NextRequest } from 'next/server'

export function createApiClient(request: NextRequest) {
  let supabaseResponse = { cookies: {} }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        },
      },
    },
  )

  return supabase
}
