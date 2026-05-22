'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Loader2 } from 'lucide-react'

function FailContent() {
  const searchParams = useSearchParams()
  const errorCode = searchParams.get('code')
  const errorMessage = searchParams.get('message') || '결제가 취소되었거나 실패했습니다.'

  return (
    <div className="relative min-h-screen bg-slate-50/50 flex items-center justify-center">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-rose-300/8 to-transparent blur-3xl" />
      </div>
      <div className="relative glass-panel rounded-3xl border border-white/70 shadow-xl p-10 text-center max-w-md w-full animate-in">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="w-7 h-7 text-rose-500" />
        </div>
        <h1 className="text-[20px] font-extrabold text-slate-800 mb-2">결제가 실패했습니다</h1>
        <p className="text-[14px] text-slate-500 mb-2">{errorMessage}</p>
        {errorCode && <p className="text-[12px] text-slate-400 mb-6">오류 코드: {errorCode}</p>}
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[14px] font-bold hover:shadow-lg transition-all"
        >
          다시 시도
        </Link>
      </div>
    </div>
  )
}

export default function FailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    }>
      <FailContent />
    </Suspense>
  )
}
