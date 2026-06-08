import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

async function getUser(request: NextRequest) {
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() {},
      },
    },
  )
  const { data } = await sb.auth.getUser()
  return data?.user ?? null
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // 서비스 테이블 데이터 삭제
    await Promise.all([
      sb.from('sermons').delete().eq('user_id', user.id),
      sb.from('user_profiles').delete().eq('id', user.id),
      sb.from('user_usage').delete().eq('user_id', user.id),
      sb.from('study_guides').delete().eq('user_id', user.id),
      sb.from('usage_logs').delete().eq('user_id', user.id),
      sb.from('subscriptions').delete().eq('user_id', user.id),
    ])

    // Auth 계정 삭제 (직접 생성한 클라이언트)
    const { error: deleteError } = await sb.auth.admin.deleteUser(user.id)
    if (deleteError) {
      console.error('deleteUser failed:', deleteError)
      return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('POST /api/auth/delete error:', err)
    return NextResponse.json({ success: false, error: err.message || '탈퇴 처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
