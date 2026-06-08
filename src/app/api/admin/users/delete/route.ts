import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

async function deleteServiceData(userId: string) {
  await supabaseAdmin.from('sermons').delete().eq('user_id', userId)
  await supabaseAdmin.from('user_profiles').delete().eq('id', userId)
  await supabaseAdmin.from('user_usage').delete().eq('user_id', userId)
  await supabaseAdmin.from('study_guides').delete().eq('user_id', userId)
  await supabaseAdmin.from('usage_logs').delete().eq('user_id', userId)
  await supabaseAdmin.from('subscriptions').delete().eq('user_id', userId)
}

async function deleteAuthUser(userId: string): Promise<string | null> {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!SUPABASE_URL || !SERVICE_KEY) return 'Supabase 환경 변수가 설정되지 않았습니다.'

  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
  })

  if (!res.ok && res.status !== 404) {
    const body = await res.text()
    return `Auth 삭제 실패 (${res.status}): ${body}`
  }

  return null // 성공 또는 이미 없는 사용자
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    if (!await isAdmin(user.id)) return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })

    const { userId } = await request.json()
    if (!userId) return NextResponse.json({ error: '사용자 ID가 필요합니다.' }, { status: 400 })

    if (userId === user.id) {
      return NextResponse.json({ error: '자기 자신을 탈퇴시킬 수 없습니다.' }, { status: 400 })
    }

    await deleteServiceData(userId)

    const authErr = await deleteAuthUser(userId)
    if (authErr) {
      return NextResponse.json({ error: authErr }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('POST /api/admin/users/delete error:', err)
    return NextResponse.json({ success: false, error: err.message || '탈퇴 처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
