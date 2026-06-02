'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowLeft, Check, Loader2, AlertCircle, Shield, Calendar } from 'lucide-react'
import { PLAN_DATA, type Plan } from '@/lib/billing/types'

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'
const IS_TOSS_READY = !!process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY

function OrderSummary({ plan }: { plan: Plan }) {
  const now = new Date()
  const nextBilling = new Date(now)
  nextBilling.setMonth(nextBilling.getMonth() + 1)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3">
      <h3 className="text-[14px] font-bold text-slate-700">주문 요약</h3>
      <div className="flex items-center justify-between py-2 border-b border-slate-100">
        <span className="text-[13px] text-slate-500">{plan.name} Plan · 월간 구독</span>
        <span className="text-[15px] font-bold text-slate-800">{plan.price.toLocaleString()}원</span>
      </div>
      <div className="flex items-center justify-between text-[12px] text-slate-400">
        <span>VAT</span>
        <span>별도</span>
      </div>
      <div className="flex items-center justify-between text-[13px]">
        <span className="font-semibold text-slate-700">합계</span>
        <span className="text-[17px] font-extrabold text-indigo-600">{plan.price.toLocaleString()}원</span>
      </div>
      <div className="pt-2 border-t border-slate-100 space-y-1.5">
        <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
          <Calendar className="w-3.5 h-3.5" />
          첫 결제일: {now.toLocaleDateString('ko-KR')}
        </div>
        <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
          <Calendar className="w-3.5 h-3.5" />
          다음 결제일: {nextBilling.toLocaleDateString('ko-KR')}
        </div>
      </div>
    </div>
  )
}

function FeatureList({ plan }: { plan: Plan }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
      <h3 className="text-[14px] font-bold text-slate-700 mb-3">포함 혜택</h3>
      <ul className="space-y-2">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px]">
            <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
            <span className={`font-medium ${f.highlight ? 'text-indigo-700' : 'text-slate-600'}`}>{f.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function BillingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = (searchParams.get('plan') || 'basic') as 'basic' | 'pro'
  const plan = PLAN_DATA.find(p => p.id === planId) || PLAN_DATA[0]

  const [step, setStep] = useState<'review' | 'payment' | 'processing'>('review')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreed, setAgreed] = useState(false)

  const handleStartPayment = () => {
    if (!agreed) return
    setStep('payment')
  }

  const handleMockPayment = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

      const res = await fetch('/api/billing/mock-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planId,
          orderId,
          amount: plan.price,
          paymentKey: `mock_paykey_${Date.now()}`,
        }),
      })
      const data = await res.json()
      if (data.success) {
        router.push(`/billing/success?plan=${planId}&orderId=${orderId}`)
      } else {
        setError(data.error || '결제 처리에 실패했습니다.')
      }
    } catch (err: any) {
      setError(err.message || '결제 처리 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [planId, plan.price, router])

  const handleTossPayment = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const script = document.createElement('script')
      script.src = 'https://js.tosspayments.com/v1/payment-widget'
      script.onload = async () => {
        try {
          const widget = (window as any).PaymentWidget?.(TOSS_CLIENT_KEY, (window as any).PaymentWidget.ANONYMOUS)
          if (!widget) {
            setError('결제 위젯을 불러올 수 없습니다.')
            setLoading(false)
            return
          }

          const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

          widget.renderPaymentMethods('#payment-methods', { value: plan.price })
          widget.renderAgreement('#agreement')

          await widget.requestPayment({
            orderId,
            orderName: `SermonAI ${plan.name} 월간 구독`,
            customerName: '',
            successUrl: `${window.location.origin}/billing/success?plan=${planId}`,
            failUrl: `${window.location.origin}/billing/fail`,
          })
        } catch (err: any) {
          if (err.code !== 'USER_CANCEL') {
            setError(err.message || '결제 처리 중 오류가 발생했습니다.')
          }
        }
      }
      script.onerror = () => {
        setError('토스페이먼츠 SDK를 불러올 수 없습니다. 토스페이먼츠 키를 확인해주세요.')
        setLoading(false)
      }
      document.head.appendChild(script)
    } catch (err: any) {
      setError(err.message || '결제 처리 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }, [planId, plan.name, plan.price])

  const handlePayment = useCallback(async () => {
    if (IS_TOSS_READY) {
      await handleTossPayment()
    } else {
      await handleMockPayment()
    }
  }, [handleTossPayment, handleMockPayment])

  if (step === 'review') {
    return (
      <div className="relative min-h-screen bg-slate-50/50">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-indigo-300/10 via-blue-300/5 to-transparent blur-3xl animate-pulse-slow" />
        </div>
        <div className="relative max-w-lg mx-auto px-4 py-12">
          <Link href="/pricing" className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-700 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            요금제로 돌아가기
          </Link>

          <div className="space-y-4 animate-in">
            <div className="text-center mb-6">
              <h1 className="text-[22px] font-extrabold text-slate-800 mb-1">구독 확인</h1>
              <p className="text-[14px] text-slate-500">선택한 플랜을 확인하고 결제를 진행합니다</p>
            </div>

            <OrderSummary plan={plan} />
            <FeatureList plan={plan} />

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-[12px] text-slate-500 leading-relaxed">
                매월 {plan.price.toLocaleString()}원이 자동 결제되는 것에 동의합니다. 언제든 구독을 해지할 수 있으며, 해지 시 다음 결제일부터 결제가 중단됩니다.
              </span>
            </label>

            <button
              onClick={handleStartPayment}
              disabled={!agreed}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[15px] font-bold hover:shadow-lg hover:shadow-indigo-200/50 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {plan.price.toLocaleString()}원 결제하기
            </button>

            <p className="text-[11px] text-slate-400 text-center">
              결제는 토스페이먼츠를 통해 안전하게 처리됩니다.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-slate-50/50">
      <div className="max-w-lg mx-auto px-4 py-12">
        <Link href="/pricing" className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-700 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          요금제로 돌아가기
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 animate-in">
          <div className="text-center mb-6">
            <h1 className="text-[22px] font-extrabold text-slate-800 mb-1">결제</h1>
            <p className="text-[14px] text-slate-500">
              {plan.name} Plan · {plan.price.toLocaleString()}원/월
            </p>
          </div>

          {!IS_TOSS_READY && (
            <div className="bg-indigo-50/50 rounded-2xl px-4 py-3 mb-4 flex items-center gap-2 text-[12px] text-indigo-600">
              <Shield className="w-4 h-4 shrink-0" />
              토스페이먼츠 심사 대기 중 — 모드로 진행됩니다
            </div>
          )}

          {IS_TOSS_READY ? (
            <>
              <div id="payment-methods" className="mb-4 min-h-[120px] rounded-xl bg-white border border-slate-200 p-3" />
              <div id="agreement" className="mb-6 min-h-[40px]" />
            </>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 mb-4 text-center">
              <p className="text-[14px] font-bold text-slate-700 mb-2">테스트 결제</p>
              <p className="text-[12px] text-slate-400 mb-4">토스페이먼츠 승인 후 실제 결제가 연결됩니다. 지금은 테스트 환경입니다.</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-[13px] text-slate-500">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                {plan.price.toLocaleString()}원 결제 (테스트)
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-[13px] font-medium text-rose-700 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              {error}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[15px] font-bold hover:shadow-lg hover:shadow-indigo-200/50 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> 처리 중...</>
            ) : (
              `${plan.price.toLocaleString()}원 결제하기`
            )}
          </button>

          <p className="text-[11px] text-slate-400 text-center mt-3">
            매월 자동 결제되며, 언제든 해지할 수 있습니다
          </p>
        </div>
      </div>
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    }>
      <BillingContent />
    </Suspense>
  )
}
