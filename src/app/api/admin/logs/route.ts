import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  if (!await isAdmin(user.id)) return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })

  const url = new URL(request.url)
  const limit = Math.min(Number(url.searchParams.get('limit')) || 50, 100)
  const offset = Number(url.searchParams.get('offset')) || 0

  const { data } = await supabaseAdmin
    .from('usage_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return NextResponse.json({ logs: data || [] })
}
