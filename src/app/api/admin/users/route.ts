import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { isAdmin, getAllUsers } from '@/lib/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  if (!await isAdmin(user.id)) return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })

  const users = await getAllUsers()
  return NextResponse.json({ users })
}
