import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase'

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

    // SQL RPC로 auth.users + 모든 서비스 데이터 한 번에 삭제
    const { error: rpcError } = await supabaseAdmin.rpc('delete_user_account', { user_uuid: user.id })
    if (rpcError) {
      console.error('deleteUser rpc error:', rpcError)
      return NextResponse.json({ success: false, error: rpcError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('POST /api/auth/delete error:', err)
    return NextResponse.json({ success: false, error: err.message || '탈퇴 처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
