// API route 공통 헬퍼: 인증 + supabase 연결

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase'
export { hasSupabaseConfig } from '@/lib/supabase'

export function getSupabaseClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() { /* read-only in API routes */ },
      },
    },
  )
}

export async function getUser(request: NextRequest) {
  const sb = getSupabaseClient(request)
  // 세션 동기화 후 검증
  await sb.auth.getSession()
  const { data } = await sb.auth.getUser()
  return data.user
}

// 인증 필요 API 응답 헬퍼
export function unauthorized() {
  return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

export function notFound(message = '찾을 수 없습니다.') {
  return NextResponse.json({ error: message }, { status: 404 })
}

export function serverError(message: string) {
  return NextResponse.json({ error: message }, { status: 500 })
}

// Supabase 미설정 시 mockStorage 안내
export function notConfigured() {
  return NextResponse.json(
    { error: 'Supabase가 설정되지 않았습니다. localStorage mock 모드로 작동 중입니다.' },
    { status: 503 },
  )
}
