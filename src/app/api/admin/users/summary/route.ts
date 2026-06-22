import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  if (!await isAdmin(user.id)) return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })

  try {
    // 모든 회원의 API 비용 집계
    const { data: apiAgg } = await supabaseAdmin
      .from('api_usage')
      .select('user_id, cost_krw')

    const costByUser: Record<string, number> = {}
    for (const r of apiAgg || []) {
      if (!r.user_id) continue
      costByUser[r.user_id] = (costByUser[r.user_id] || 0) + (r.cost_krw || 0)
    }

    // 수동 후원 합계
    const { data: manualAgg } = await supabaseAdmin
      .from('manual_donations')
      .select('user_id, amount_krw')
    const manualByUser: Record<string, number> = {}
    for (const r of manualAgg || []) {
      if (!r.user_id) continue
      manualByUser[r.user_id] = (manualByUser[r.user_id] || 0) + (r.amount_krw || 0)
    }

    // 자동 후원 합계 (payment_history)
    const { data: autoAgg } = await supabaseAdmin
      .from('payment_history')
      .select('user_id, amount')
      .eq('status', 'succeeded')
    const autoByUser: Record<string, number> = {}
    for (const r of autoAgg || []) {
      if (!r.user_id) continue
      autoByUser[r.user_id] = (autoByUser[r.user_id] || 0) + (r.amount || 0)
    }

    // user_id → { manual, auto, api_cost } 매핑
    const allUserIds: string[] = Array.from(new Set([
      ...Object.keys(costByUser),
      ...Object.keys(manualByUser),
      ...Object.keys(autoByUser),
    ]))
    const summary: Record<string, {
      api_cost_krw: number
      manual_donation_krw: number
      auto_donation_krw: number
      total_donation_krw: number
    }> = {}
    for (const uid of allUserIds) {
      const manual = manualByUser[uid] || 0
      const auto = autoByUser[uid] || 0
      summary[uid] = {
        api_cost_krw: costByUser[uid] || 0,
        manual_donation_krw: manual,
        auto_donation_krw: auto,
        total_donation_krw: manual + auto,
      }
    }

    return NextResponse.json({ summary })
  } catch (e: any) {
    console.error('[admin/users/summary]', e)
    return NextResponse.json({ error: e?.message || '조회 실패' }, { status: 500 })
  }
}
