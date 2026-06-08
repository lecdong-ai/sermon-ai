import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

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

    // 서비스 테이블 데이터 삭제
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    await Promise.all([
      sb.from('sermons').delete().eq('user_id', userId),
      sb.from('user_profiles').delete().eq('id', userId),
      sb.from('user_usage').delete().eq('user_id', userId),
      sb.from('study_guides').delete().eq('user_id', userId),
      sb.from('usage_logs').delete().eq('user_id', userId),
      sb.from('subscriptions').delete().eq('user_id', userId),
    ])

    // Auth 계정 삭제 (직접 생성한 클라이언트로 호출)
    const { error: deleteError } = await sb.auth.admin.deleteUser(userId)
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('POST /api/admin/users/delete error:', err)
    return NextResponse.json({ success: false, error: err.message || '탈퇴 처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
