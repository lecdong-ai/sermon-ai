'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Check, Loader2, CreditCard, ArrowRight } from 'lucide-react'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') || 'basic'
  const planName = plan === 'pro' ? 'Pro' : 'Basic'
  const planPrice = plan === 'pro' ? '19,800' : '9,900'
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    if (countdown <= 0) {
      router.push('/dashboard')
      return
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown, router])

  return (
    <div className="relative min-h-screen bg-slate-50/50 flex items-center justify-center">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-emerald-300/10 via-green-300/5 to-transparent blur-3xl" />
      </div>
      <div className="relative max-w-md w-full px-4">
        <div className="bg-white rounded-3xl border border-emerald-100/60 shadow-xl p-8 sm:p-10 text-center animate-in">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-emerald-500" />
          </div>

          <h1 className="text-[22px] font-extrabold text-slate-800 mb-2">구독이 시작되었습니다</h1>
          <p className="text-[15px] text-slate-500 mb-6">
            <strong className="text-slate-800">{planName} Plan</strong>에 가입해주셔서 감사합니다.<br />
            매월 {planPrice}원이 자동 결제됩니다.
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 mb-6 text-left space-y-2">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-slate-500">플랜</span>
              <span className="font-bold text-slate-800">{planName}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-slate-500">결제 주기</span>
              <span className="font-bold text-slate-800">매월 자동 결제</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-slate-500">결제 금액</span>
              <span className="font-bold text-indigo-600">{planPrice}원/월</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-slate-500">결제 수단</span>
              <span className="font-bold text-slate-800">카드</span>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[15px] font-bold hover:shadow-lg hover:shadow-indigo-200/50 transition-all mb-3"
          >
            대시보드로 이동
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/billing/manage"
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-slate-600 text-[14px] font-bold hover:bg-slate-50 transition-all"
          >
            <CreditCard className="w-4 h-4" />
            구독 관리
          </Link>

          <p className="text-[12px] text-slate-400 mt-4">
            {countdown}초 후 자동으로 대시보드로 이동합니다
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
