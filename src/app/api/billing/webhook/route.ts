import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'

// Toss Payments 웹훅 처리
// 결제 상태 변경, 구독 갱신, 결제 실패 등을 처리
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const event = body.eventType
    const data = body.data

    console.log('[Toss Webhook]', event, data?.orderId)

    // 웹훅 서명 검증 (보안)
    // Toss는 Webhook Secret 검증을 지원합니다.
    // 토스페이먼츠 대시보드 → 웹훅 설정에서 Webhook Secret 발급 가능
    const webhookSecret = process.env.TOSS_WEBHOOK_SECRET
    if (webhookSecret) {
      const signature = request.headers.get('tosspayments-webhook-signature')
      if (!signature) {
        return NextResponse.json({ error: '서명이 없습니다.' }, { status: 401 })
      }
      // TODO: 서명 검증 로직 (토스 문서 참고)
    }

    switch (event) {
      case 'PAYMENT_STATUS_CHANGED': {
        // 결제 상태 변경
        if (data?.status === 'DONE') {
          // 결제 성공 → subscription이 이미 activateSubscription에서 생성됨
          console.log('Payment completed:', data.orderId)
        } else if (data?.status === 'CANCELED') {
          // 결제 취소
          await handlePaymentCanceled(data)
        } else if (data?.status === 'FAILED') {
          // 결제 실패
          console.error('Payment failed:', data.orderId, data.failure)
        }
        break
      }

      case 'BILLING_KEY_ISSUED': {
        // 정기 결제용 빌링키 발급
        console.log('Billing key issued:', data.billingKey)
        break
      }

      case 'SUBSCRIPTION_CANCELED': {
        // 정기 결제 해지
        await handleSubscriptionCanceled(data)
        break
      }

      case 'SUBSCRIPTION_PAYMENT_SUCCESS': {
        // 정기 결제 성공 (매월 자동 결제)
        await handleRecurringPaymentSuccess(data)
        break
      }

      case 'SUBSCRIPTION_PAYMENT_FAILED': {
        // 정기 결제 실패
        await handleRecurringPaymentFailed(data)
        break
      }

      default:
        console.log('Unhandled webhook event:', event)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

async function handlePaymentCanceled(data: any) {
  const paymentKey = data.paymentKey
  // payment_key로 subscription 조회
  const { data: subs } = await supabase
    .from('subscriptions')
    .select('id, user_id')
    .eq('payment_method_id', paymentKey)
    .single()

  if (subs) {
    await supabase
      .from('subscriptions')
      .update({ status: 'canceled', canceled_at: new Date().toISOString() })
      .eq('id', subs.id)

    await supabase
      .from('user_usage')
      .update({ user_status: 'canceled' })
      .eq('user_id', subs.user_id)
  }
}

async function handleSubscriptionCanceled(data: any) {
  // Toss에서 정기 결제가 해지됨
  const billingKey = data.billingKey
  const { data: subs } = await supabase
    .from('subscriptions')
    .select('id, user_id')
    .eq('payment_method_id', billingKey)
    .single()

  if (subs) {
    await supabase
      .from('subscriptions')
      .update({ status: 'canceled', canceled_at: new Date().toISOString() })
      .eq('id', subs.id)

    await supabase
      .from('user_usage')
      .update({ user_status: 'canceled' })
      .eq('user_id', subs.user_id)
  }
}

async function handleRecurringPaymentSuccess(data: any) {
  // 정기 결제 성공 → billing_cycle 갱신
  const paymentKey = data.paymentKey
  const { data: subs } = await supabase
    .from('subscriptions')
    .select('id, user_id, billing_cycle_end')
    .eq('payment_method_id', paymentKey)
    .single()

  if (subs) {
    const now = new Date()
    const end = new Date(now)
    end.setMonth(end.getMonth() + 1)

    await supabase
      .from('subscriptions')
      .update({
        billing_cycle_start: now.toISOString(),
        billing_cycle_end: end.toISOString(),
        monthly_used: 0,
        updated_at: now.toISOString(),
      })
      .eq('id', subs.id)

    // payment_history 기록
    await supabase.from('payment_history').insert({
      user_id: subs.user_id,
      subscription_id: subs.id,
      amount: data.totalAmount || 0,
      currency: 'KRW',
      status: 'succeeded',
      provider_tx_id: paymentKey,
    })

    // user_usage 월 사용량 초기화
    await supabase
      .from('user_usage')
      .update({ monthly_used: 0, updated_at: now.toISOString() })
      .eq('user_id', subs.user_id)
  }
}

async function handleRecurringPaymentFailed(data: any) {
  // 정기 결제 실패 → past_due
  const billingKey = data.billingKey
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, user_id')
    .eq('payment_method_id', billingKey)
    .single()

  if (sub) {
    await supabase
      .from('subscriptions')
      .update({ status: 'past_due', updated_at: new Date().toISOString() })
      .eq('id', sub.id)

    await supabase
      .from('user_usage')
      .update({ user_status: 'past_due' })
      .eq('user_id', sub.user_id)
  }
}
