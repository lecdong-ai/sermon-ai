import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const adminPassword = process.env.QT_ADMIN_PASSWORD
  if (!adminPassword) {
    return NextResponse.json({ error: '관리자 비밀번호가 설정되지 않았습니다' }, { status: 500 })
  }

  const { password } = await request.json()
  if (password !== adminPassword) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}
