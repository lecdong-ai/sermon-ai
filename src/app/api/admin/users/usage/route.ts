import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'
import { getTotalDonation } from '@/lib/admin/donations'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  if (!await isAdmin(user.id)) return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })

  const userId = request.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId가 필요합니다.' }, { status: 400 })

  try {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    // API 사용량 집계 (이번 달 + 누적)
    const { data: monthlyUsage } = await supabaseAdmin
      .from('api_usage')
      .select('cost_krw, api_type, total_tokens, created_at')
      .eq('user_id', userId)
      .gte('created_at', monthStart)

    const { data: totalUsage } = await supabaseAdmin
      .from('api_usage')
      .select('cost_krw, api_type, total_tokens, created_at')
      .eq('user_id', userId)

    const monthly_cost_krw = (monthlyUsage || []).reduce((s, r) => s + (r.cost_krw || 0), 0)
    const total_cost_krw = (totalUsage || []).reduce((s, r) => s + (r.cost_krw || 0), 0)
    const monthly_count = (monthlyUsage || []).length
    const total_count = (totalUsage || []).length

    // API별 집계 (누적 기준)
    const byApi: Record<string, { cost_krw: number; count: number }> = {}
    for (const r of totalUsage || []) {
      const t = r.api_type || 'unknown'
      if (!byApi[t]) byApi[t] = { cost_krw: 0, count: 0 }
      byApi[t].cost_krw += r.cost_krw || 0
      byApi[t].count += 1
    }
    const byApiList = Object.entries(byApi)
      .map(([api_type, v]) => ({ api_type, cost_krw: v.cost_krw, count: v.count }))
      .sort((a, b) => b.cost_krw - a.cost_krw)

    // 최근 호출 10건
    const { data: recentRaw } = await supabaseAdmin
      .from('api_usage')
      .select('api_type, cost_krw, model, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)
    const recent = (recentRaw || []).map(r => ({
      api_type: r.api_type,
      model: r.model,
      cost_krw: r.cost_krw,
      created_at: r.created_at,
    }))

    // 후원 정보 (수동 + 자동)
    const donation = await getTotalDonation(userId)

    return NextResponse.json({
      monthly: { cost_krw: monthly_cost_krw, count: monthly_count },
      total: { cost_krw: total_cost_krw, count: total_count },
      byApi: byApiList,
      recent,
      donation,
    })
  } catch (e: any) {
    console.error('[admin/usage]', e)
    return NextResponse.json({ error: e?.message || '조회 실패' }, { status: 500 })
  }
}
