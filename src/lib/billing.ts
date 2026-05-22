import { supabaseAdmin as supabase } from './supabase'
import type { PlanType } from '@/types'

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || ''
const TOSS_API_URL = 'https://api.tosspayments.com/v1'

function encodedKey() {
  return Buffer.from(TOSS_SECRET_KEY + ':').toString('base64')
}

export interface TossConfirmRequest {
  paymentKey: string
  orderId: string
  amount: number
}

export interface TossPaymentResponse {
  status: string
  orderId: string
  paymentKey: string
  totalAmount: number
  method: string
  failure?: { code: string; message: string }
}

// Toss 결제 승인 (서버에서 호출)
export async function confirmPayment(data: TossConfirmRequest): Promise<TossPaymentResponse> {
  const res = await fetch(`${TOSS_API_URL}/payments/confirm`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${encodedKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || '결제 승인 실패')
  }

  return res.json()
}

// Toss 결제 취소 / 환불
export async function cancelPayment(paymentKey: string, reason: string): Promise<void> {
  const res = await fetch(`${TOSS_API_URL}/payments/${paymentKey}/cancel`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${encodedKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cancelReason: reason }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || '결제 취소 실패')
  }
}

// 구독 활성화 (결제 성공 시)
export async function activateSubscription(params: {
  userId: string
  plan: PlanType
  paymentKey: string
  amount: number
  method: string
}) {
  const { userId, plan, paymentKey, amount, method } = params
  const now = new Date()
  const end = new Date(now)
  end.setMonth(end.getMonth() + 1)
  const monthlyLimit = plan === 'pro' ? 20 : 10

  // subscription 생성
  const { data: sub, error: subError } = await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      plan,
      status: 'active',
      billing_cycle_start: now.toISOString(),
      billing_cycle_end: end.toISOString(),
      monthly_limit: monthlyLimit,
      monthly_used: 0,
      payment_provider: 'tosspayments',
      payment_method_id: paymentKey,
    })
    .select()
    .single()

  if (subError) throw new Error(`구독 생성 실패: ${subError.message}`)

  // payment_history 기록
  await supabase.from('payment_history').insert({
    user_id: userId,
    subscription_id: sub.id,
    amount,
    currency: 'KRW',
    status: 'succeeded',
    payment_method: method,
    provider_tx_id: paymentKey,
  })

  // user_usage 업데이트
  await supabase
    .from('user_usage')
    .update({
      plan,
      user_status: 'active',
      monthly_limit: monthlyLimit,
      monthly_used: 0,
      subscription_id: sub.id,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  return sub
}

// 구독 해지
export async function cancelSubscription(userId: string) {
  // 현재 active 구독 찾기
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (!sub) throw new Error('활성화된 구독이 없습니다.')

  // Toss에서 정기 결제 해지 (billingKey가 있는 경우)
  if (sub.payment_method_id) {
    try {
      await fetch(`${TOSS_API_URL}/billing/${sub.payment_method_id}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${encodedKey()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: '사용자 해지' }),
      })
    } catch {} // billingKey 없어도 계속 진행
  }

  // subscription 상태 변경
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', sub.id)

  // user_usage → user_status는 'canceled'로, plan은 유지 (billing cycle 종료 시까지)
  await supabase
    .from('user_usage')
    .update({
      user_status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  return sub
}
