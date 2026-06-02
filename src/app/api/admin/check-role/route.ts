import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ admin: false })

  const admin = await isAdmin(user.id)
  return NextResponse.json({ admin })
}
