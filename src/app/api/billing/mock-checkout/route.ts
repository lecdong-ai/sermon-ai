import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const { plan, paymentKey, orderId, amount } = body

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
    const nextBilling = new Date(now)
    nextBilling.setMonth(nextBilling.getMonth() + 1)

    const subscription = {
      id: `sub_mock_${Date.now()}`,
      userId: user.id,
      planId: plan,
      status: 'active',
      startDate: now.toISOString(),
      nextBillingDate: nextBilling.toISOString(),
      canceledAt: null,
      paymentMethod: '카드',
      provider: 'tosspayments',
      providerCustomerKey: `customer_${user.id}_mock`,
      providerBillingKey: paymentKey || `billing_mock_${Date.now()}`,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }

    const payment = {
      id: `pay_mock_${Date.now()}`,
      userId: user.id,
      subscriptionId: subscription.id,
      orderId,
      amount,
      status: 'succeeded',
      paidAt: now.toISOString(),
      method: '카드',
      provider: 'tosspayments',
      providerPaymentKey: paymentKey || `paykey_mock_${Date.now()}`,
      createdAt: now.toISOString(),
    }

    return NextResponse.json({
      success: true,
      subscription,
      payment,
      message: `${plan === 'pro' ? 'Pro' : 'Basic'} 플랜 구독이 시작되었습니다.`,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || '결제 처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
