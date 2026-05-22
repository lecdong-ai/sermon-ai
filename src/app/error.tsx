'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 런타임 에러를 콘솔에 기록하여 원인 분석을 돕습니다.
    console.error('SermonAI Runtime Error:', error)
  }, [error])

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative bg-grid-tech">
      {/* 백그라운드 몽환적인 네온 글로우 */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400/10 rounded-full blur-[100px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-400/10 rounded-full blur-[100px] animate-pulse-slower pointer-events-none" />

      {/* 미래지향적 글래스 패널 */}
      <div className="glass-panel glass-border-neon max-w-lg w-full p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden text-center animate-in">
        {/* 상단 장식 빛 */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

        {/* 에러 아이콘 데코레이션 */}
        <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 bg-rose-500/10 rounded-2xl rotate-6 animate-pulse" />
          <div className="absolute inset-0 bg-rose-500/5 rounded-2xl -rotate-6" />
          <div className="relative w-16 h-16 bg-white/80 rounded-2xl border border-rose-200/50 flex items-center justify-center shadow-lg">
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          </div>
        </div>

        {/* 타이틀 및 설명 */}
        <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight font-outfit">
          시스템에 은혜로운 <span className="text-gradient">조율이 필요합니다</span>
        </h2>
        <p className="text-[15px] text-slate-500 leading-relaxed mb-8">
          일시적인 통신 불안정 또는 런타임 오류가 발생했습니다.<br />
          아래의 버튼을 눌러 안전하게 화면을 복구하시거나 홈으로 이동하실 수 있습니다.
        </p>

        {/* 에러 상세 메시지 (개발용) */}
        {error.message && (
          <div className="mb-8 p-4 bg-slate-900/5 rounded-xl border border-slate-200/40 text-left">
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Error Log</p>
            <p className="text-xs font-mono text-rose-600 break-all select-all font-semibold leading-relaxed">
              {error.message}
            </p>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 text-[15px] font-bold hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all duration-200 shadow-md shadow-blue-500/10"
          >
            <RotateCcw className="w-4 h-4" />
            다시 시도하기
          </button>
          
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 text-slate-700 px-6 py-3 text-[15px] font-bold hover:bg-slate-50 active:scale-[0.98] transition-all duration-200"
          >
            <Home className="w-4 h-4 text-slate-500" />
            대시보드로 가기
          </Link>
        </div>
      </div>
    </div>
  )
}
