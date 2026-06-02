import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { confirmPayment, activateSubscription } from '@/lib/billing'

function getUser(request: NextRequest): Promise<string | null> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() {},
      },
    },
  )
  return supabase.auth.getUser().then(r => r.data.user?.id ?? null)
}

const PLAN_PRICES: Record<string, number> = {
  basic: 9900,
  pro: 19800,
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUser(request)
    if (!userId) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const { paymentKey, orderId, amount, plan } = body

    if (!paymentKey || !orderId || !amount || !plan) {
      return NextResponse.json({ error: '필수 파라미터가 누락되었습니다.' }, { status: 400 })
    }

    if (plan !== 'basic' && plan !== 'pro') {
      return NextResponse.json({ error: '유효하지 않은 플랜입니다.' }, { status: 400 })
    }

    const expectedAmount = PLAN_PRICES[plan]
    if (amount !== expectedAmount) {
      return NextResponse.json({ error: '결제 금액이 올바르지 않습니다.' }, { status: 400 })
    }

    const isTossReady = !!process.env.TOSS_SECRET_KEY

    let paymentMethod = '카드'
    if (isTossReady) {
      const payment = await confirmPayment({ paymentKey, orderId, amount })
      if (payment.status !== 'DONE') {
        return NextResponse.json({
          error: '결제가 완료되지 않았습니다.',
          status: payment.status,
          failure: payment.failure,
        }, { status: 400 })
      }
      paymentMethod = payment.method
    }

    const subscription = await activateSubscription({
      userId,
      plan,
      paymentKey,
      amount,
      method: paymentMethod,
    })

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        plan,
        status: 'active',
        billing_cycle_end: subscription.billing_cycle_end,
      },
    })
  } catch (err: any) {
    console.error('Billing confirm error:', err)
    return NextResponse.json({
      error: err.message || '결제 처리 중 오류가 발생했습니다.',
    }, { status: 500 })
  }
}
