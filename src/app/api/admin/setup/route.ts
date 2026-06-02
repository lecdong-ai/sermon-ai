import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { setAdminRole } from '@/lib/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ success: false, message: '로그인이 필요합니다.' })
  }
  if (user.email !== 'lecdong@gmail.com') {
    return NextResponse.json({ success: false, message: 'lecdong@gmail.com 계정으로 로그인해야 합니다.' })
  }

  const ok = await setAdminRole(user.id)
  if (ok) {
    return NextResponse.json({ success: true, message: '관리자 설정 완료! /admin 으로 접속해보세요.' })
  }
  return NextResponse.json({ success: false, message: '설정에 실패했습니다. 잠시 후 다시 시도해주세요.' })
}

export async function POST(request: NextRequest) {
  return GET(request)
}
