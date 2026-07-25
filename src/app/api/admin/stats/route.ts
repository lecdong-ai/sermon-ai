import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { isAdmin, getUserStats } from '@/lib/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    if (!await isAdmin(user.id)) return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })

    const stats = await getUserStats()
    return NextResponse.json(stats)
  } catch (err: any) {
    console.error('GET /api/admin/stats error:', err)
    return NextResponse.json({ error: '통계를 불러오지 못했습니다' }, { status: 500 })
  }
}
