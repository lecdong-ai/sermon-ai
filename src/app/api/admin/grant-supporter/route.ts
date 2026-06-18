import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'
import { grantSupporter } from '@/lib/donations'

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { data: adminCheck } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (adminCheck?.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, days } = body

    if (!userId || !days || days < 1) {
      return NextResponse.json({ error: 'userId와 days가 필요합니다.' }, { status: 400 })
    }

    const ok = await grantSupporter(userId, days)
    if (!ok) {
      return NextResponse.json({ error: '후원자 부여에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('POST /api/admin/grant-supporter error:', err)
    return NextResponse.json({ error: err.message || '처리 실패' }, { status: 500 })
  }
}
