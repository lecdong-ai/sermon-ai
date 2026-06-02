import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  if (!await isAdmin(user.id)) return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })

  const { data: subscriptions } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false })

  return NextResponse.json({ subscriptions: subscriptions || [] })
}
