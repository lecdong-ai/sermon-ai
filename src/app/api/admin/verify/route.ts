import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const adminPassword = process.env.QT_ADMIN_PASSWORD || '#Neo2531942'

  const { password } = await request.json()
  if (password !== adminPassword) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}
