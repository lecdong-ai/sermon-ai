import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin as supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const { plan, orderId, amount } = body

    if (!plan || !orderId || !amount) {
      return NextResponse.json({ error: '필수 파라미터가 누락되었습니다.' }, { status: 400 })
    }

    const validPlans = ['basic', 'pro']
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: '유효하지 않은 플랜입니다.' }, { status: 400 })
    }

    const expectedPrice = plan === 'pro' ? 19800 : 9900
    if (amount !== expectedPrice) {
      return NextResponse.json({ error: '결제 금액이 올바르지 않습니다.' }, { status: 400 })
    }

    const now = new Date()
    const end = new Date(now)
    end.setMonth(end.getMonth() + 1)
    const monthlyLimit = plan === 'pro' ? 20 : 10

    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .in('status', ['active', 'past_due'])
      .maybeSingle()

    if (existingSub) {
      return NextResponse.json({ error: '이미 활성화된 구독이 있습니다.' }, { status: 400 })
    }

    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan,
        status: 'active',
        billing_cycle_start: now.toISOString(),
        billing_cycle_end: end.toISOString(),
        monthly_limit: monthlyLimit,
        monthly_used: 0,
        payment_provider: 'tosspayments',
        payment_method_id: `mock_billing_${Date.now()}`,
      })
      .select()
      .single()

    if (subError) {
      return NextResponse.json({ error: `구독 생성 실패: ${subError.message}` }, { status: 500 })
    }

    await supabase.from('payment_history').insert({
      user_id: user.id,
      subscription_id: sub.id,
      amount,
      currency: 'KRW',
      status: 'succeeded',
      payment_method: '카드',
      provider_tx_id: `mock_paykey_${Date.now()}`,
    })

    await supabase
      .from('user_usage')
      .update({
        plan,
        user_status: 'active',
        monthly_limit: monthlyLimit,
        monthly_used: 0,
        subscription_id: sub.id,
        updated_at: now.toISOString(),
      })
      .eq('user_id', user.id)

    return NextResponse.json({
      success: true,
      subscription: {
        id: sub.id,
        plan,
        status: 'active',
        billing_cycle_start: sub.billing_cycle_start,
        billing_cycle_end: sub.billing_cycle_end,
        monthly_limit: monthlyLimit,
        monthly_used: 0,
        payment_method: '카드',
      },
      message: `${plan === 'pro' ? 'Pro' : 'Basic'} 플랜 구독이 시작되었습니다.`,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || '결제 처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
