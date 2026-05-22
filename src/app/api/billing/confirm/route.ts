import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { confirmPayment, activateSubscription } from '@/lib/billing'

function getUser(request: NextRequest) {
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
  return supabase.auth.getUser().then(r => r.data.user)
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
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

    // 1. Toss 결제 승인 (서버에서)
    const payment = await confirmPayment({ paymentKey, orderId, amount })

    if (payment.status !== 'DONE') {
      return NextResponse.json({
        error: '결제가 완료되지 않았습니다.',
        status: payment.status,
        failure: payment.failure,
      }, { status: 400 })
    }

    // 2. 구독 활성화
    const subscription = await activateSubscription({
      userId: user.id,
      plan,
      paymentKey,
      amount,
      method: payment.method,
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
