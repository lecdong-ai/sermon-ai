import { createServerClient } from '@supabase/ssr'
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export function createApiAuthClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() {},
      },
    },
  )
}

export async function getUserFromRequest(request: NextRequest) {
  if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return { id: '25721757-65b2-474c-8668-e762ae319b4e', email: 'mock@example.com' } as any
  }
  const sb = createApiAuthClient(request)
  const { data } = await sb.auth.getUser()
  return data?.user ?? null
}

export async function getUserFromCookies() {
  if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return { id: '25721757-65b2-474c-8668-e762ae319b4e', email: 'mock@example.com' } as any
  }
  const cookieStore = await cookies()
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    },
  )
  const { data } = await sb.auth.getUser()
  return data?.user ?? null
}