'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') || 'basic'
  const planName = plan === 'pro' ? 'Pro' : 'Basic'
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (countdown <= 0) {
      router.push('/')
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
      <div className="relative glass-panel rounded-3xl border border-white/70 shadow-xl p-10 text-center max-w-md w-full animate-in">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-5">
          <Check className="w-8 h-8 text-emerald-500" />
        </div>
        <h1 className="text-[22px] font-extrabold text-slate-800 mb-2">구독이 시작되었습니다</h1>
        <p className="text-[15px] text-slate-500 mb-2">{planName} 플랜에 가입해주셔서 감사합니다.</p>
        <p className="text-[13px] text-slate-400">{countdown}초 후 메인 페이지로 이동합니다.</p>
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
