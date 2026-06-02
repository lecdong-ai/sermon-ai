'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Loader2, RefreshCw, ArrowLeft } from 'lucide-react'

function FailContent() {
  const searchParams = useSearchParams()
  const errorCode = searchParams.get('code')
  const errorMessage = searchParams.get('message') || '결제가 취소되었거나 실패했습니다.'

  return (
    <div className="relative min-h-screen bg-slate-50/50 flex items-center justify-center">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-rose-300/8 to-transparent blur-3xl" />
      </div>
      <div className="relative max-w-md w-full px-4">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10 text-center animate-in">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-7 h-7 text-rose-500" />
          </div>

          <h1 className="text-[20px] font-extrabold text-slate-800 mb-2">결제가 실패했습니다</h1>
          <p className="text-[14px] text-slate-500 mb-2">{errorMessage}</p>
          {errorCode && <p className="text-[12px] text-slate-400 mb-6">오류 코드: {errorCode}</p>}

          {!errorCode && !searchParams.get('message') && (
            <div className="bg-amber-50 rounded-2xl p-4 mb-6 text-left text-[13px] text-amber-700">
              <p className="font-medium mb-1">자주 발생하는 원인</p>
              <ul className="space-y-1 text-[12px]">
                <li>• 카드 한도 초과 또는 잔액 부족</li>
                <li>• 카드 정보 오류 (유효기간, CVC)</li>
                <li>• 일시적인 네트워크 오류</li>
                <li>• 결제 취소</li>
              </ul>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/pricing"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[14px] font-bold hover:shadow-lg transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              다시 시도
            </Link>
            <Link
              href="/billing/manage"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-slate-600 text-[14px] font-bold hover:bg-slate-50 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              구독 관리
            </Link>
          </div>
        </div>
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
