import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'

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

    // SQL RPC로 auth.users + 모든 서비스 데이터 한 번에 삭제
    const { error: rpcError } = await supabaseAdmin.rpc('delete_user_account', { user_uuid: userId })
    if (rpcError) {
      return NextResponse.json({ error: rpcError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('POST /api/admin/users/delete error:', err)
    return NextResponse.json({ success: false, error: err.message || '탈퇴 처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
