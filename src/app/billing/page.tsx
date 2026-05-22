'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowLeft, Check, Loader2, AlertCircle } from 'lucide-react'

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'

const PLANS = {
  basic: { name: 'Basic', price: 9900, label: '월 9,900원' },
  pro: { name: 'Pro', price: 19800, label: '월 19,800원' },
}

function BillingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = (searchParams.get('plan') || 'basic') as 'basic' | 'pro'
  const plan = PLANS[planId]

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [widgetReady, setWidgetReady] = useState(false)
  const [paymentWidget, setPaymentWidget] = useState<any>(null)

  useEffect(() => {
    // Toss Payment Widget 로드
    const script = document.createElement('script')
    script.src = 'https://js.tosspayments.com/v1/payment-widget'
    script.onload = () => {
      try {
        const widget = (window as any).PaymentWidget?.(TOSS_CLIENT_KEY, (window as any).PaymentWidget.ANONYMOUS)
        if (widget) {
          widget.renderPaymentMethods('#payment-methods', { value: plan.price })
          widget.renderAgreement('#agreement')
          setPaymentWidget(widget)
          setWidgetReady(true)
        }
      } catch (err) {
        setError('결제 위젯을 불러올 수 없습니다.')
      }
    }
    script.onerror = () => setError('결제 SDK 로드 실패')
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [planId, plan.price])

  const handlePayment = useCallback(async () => {
    if (!paymentWidget) return
    setLoading(true)
    setError('')

    try {
      const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const customerName = '' // 필요시 사용자 이름 전달

      const result = await paymentWidget.requestPayment({
        orderId,
        orderName: `SermonAI ${plan.name}`,
        customerName,
        successUrl: `${window.location.origin}/billing/success`,
        failUrl: `${window.location.origin}/billing/fail`,
      })

      // 성공 시 서버에서 confirm
      if (result?.paymentKey) {
        const res = await fetch('/api/billing/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentKey: result.paymentKey,
            orderId,
            amount: plan.price,
            plan: planId,
          }),
        })
        const data = await res.json()
        if (data.success) {
          router.push('/billing/success?plan=' + planId)
        } else {
          setError(data.error || '결제 승인 실패')
        }
      }
    } catch (err: any) {
      if (err.code !== 'USER_CANCEL') {
        setError(err.message || '결제 처리 중 오류가 발생했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }, [paymentWidget, plan, planId, router])

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

        <div className="glass-panel rounded-3xl border border-white/60 p-6 animate-in">
          <div className="text-center mb-6">
            <h1 className="text-[22px] font-extrabold text-slate-800 mb-1">결제</h1>
            <p className="text-[14px] text-slate-500">
              {plan.name} 플랜 · {plan.label}
            </p>
          </div>

          <div className="bg-indigo-50/50 rounded-2xl px-4 py-3 mb-6 flex items-center justify-between">
            <span className="text-[14px] font-bold text-slate-700">결제 금액</span>
            <span className="text-[20px] font-extrabold text-indigo-600">{plan.price.toLocaleString()}원</span>
          </div>

          {/* Toss Payment Widgets */}
          <div id="payment-methods" className="mb-4 min-h-[120px] rounded-xl bg-white border border-slate-200 p-3" />
          <div id="agreement" className="mb-6 min-h-[40px]" />

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-[13px] font-medium text-rose-700 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              {error}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={!widgetReady || loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[15px] font-bold hover:shadow-lg hover:shadow-indigo-200/50 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> 처리 중...</>
            ) : !widgetReady ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> 결제 수단 로딩 중...</>
            ) : (
              `${plan.price.toLocaleString()}원 결제하기`
            )}
          </button>

          <p className="text-[11px] text-slate-400 text-center mt-3">
            결제는 Toss Payments를 통해 안전하게 처리됩니다.
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
