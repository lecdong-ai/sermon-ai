import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: '로그인 필요' }, { status: 401 })
  if (!await isAdmin(user.id)) return NextResponse.json({ error: '관리자 권한 필요' }, { status: 403 })

  const userId = request.nextUrl.searchParams.get('userId')

  // 디버그: 실제 테이블 데이터 조회
  const debug: any = {}

  const { count: manualCount } = await supabaseAdmin
    .from('manual_donations')
    .select('*', { count: 'exact', head: true })
  debug.manual_donations_total_rows = manualCount

  const { count: paymentCount } = await supabaseAdmin
    .from('payment_history')
    .select('*', { count: 'exact', head: true })
  debug.payment_history_total_rows = paymentCount

  const { count: apiCount } = await supabaseAdmin
    .from('api_usage')
    .select('*', { count: 'exact', head: true })
  debug.api_usage_total_rows = apiCount

  if (userId) {
    const { data: manualData } = await supabaseAdmin
      .from('manual_donations')
      .select('*')
      .eq('user_id', userId)
    debug.manual_donations_for_user = manualData

    const { data: paymentData } = await supabaseAdmin
      .from('payment_history')
      .select('*')
      .eq('user_id', userId)
    debug.payment_history_for_user = paymentData

    const { data: apiData } = await supabaseAdmin
      .from('api_usage')
      .select('*')
      .eq('user_id', userId)
    debug.api_usage_for_user = apiData
  }

  return NextResponse.json(debug)
}
