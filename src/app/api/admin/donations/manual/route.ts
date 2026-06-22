import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import { getManualDonations, addManualDonation } from '@/lib/admin/donations'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  if (!await isAdmin(user.id)) return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })

  const userId = request.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId가 필요합니다.' }, { status: 400 })

  try {
    const donations = await getManualDonations(userId)
    return NextResponse.json({ donations })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || '조회 실패' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  if (!await isAdmin(user.id)) return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })

  try {
    const { userId, amountKrw, note } = await request.json()
    if (!userId || !amountKrw) {
      return NextResponse.json({ error: 'userId와 amountKrw는 필수입니다.' }, { status: 400 })
    }
    const donation = await addManualDonation(userId, parseInt(amountKrw), note || '', user.id)
    return NextResponse.json({ donation })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || '입력 실패' }, { status: 500 })
  }
}
