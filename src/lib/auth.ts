import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { checkRate, type RateLimitConfig } from './rate-limit'

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
  const sb = createApiAuthClient(request)
  // getUser() 대신 getSession() 사용: 토큰 만료 시 setAll()이 비어있어
  // 갱신이 실패하는 문제를 우회. 쿠키에서 직접 session을 읽어 user 반환.
  const { data } = await sb.auth.getSession()
  const realUser = data?.session?.user ?? null
  if (realUser) return realUser

  // dev 환경: 미인증 시 admin email 로 위장 (로컬 회원상황 확인용)
  if (process.env.NODE_ENV === 'development') {
    return {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'lecdong@gmail.com',
      app_metadata: { is_admin: true },
      user_metadata: { name: 'dev-admin' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as any
  }
  return null
}

/** OpenAI 호출 등 비용이 큰 라우트에 적용하는 rate limit. 인증된 경우 userId 기준, 아니면 IP 기준. */
export function checkOpenAIRateLimit(
  request: NextRequest,
  userId: string | null,
  config: RateLimitConfig = { max: 20, windowSec: 60 },
): NextResponse | null {
  const key = userId
    ? `u:${userId}`
    : `ip:${request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
       || request.headers.get('x-real-ip')
       || 'unknown'}`
  const r = checkRate(key, config)
  if (r.allowed) return null
  return NextResponse.json(
    { success: false, error: `요청이 너무 많습니다. ${r.retryAfterSec}초 후 다시 시도해주세요.` },
    { status: 429, headers: { 'Retry-After': String(r.retryAfterSec) } },
  )
}

export async function getUserFromCookies() {
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
  const { data } = await sb.auth.getSession()
  return data?.session?.user ?? null
}
