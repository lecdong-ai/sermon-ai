'use client'

import { useEffect } from 'react'
import { AlertOctagon, RotateCcw } from 'lucide-react'
import './globals.css'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('SermonAI Global Error:', error)
  }, [error])

  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-50 text-slate-800 overflow-x-hidden flex items-center justify-center p-4 bg-grid-tech">
        {/* 백그라운드 오로라 */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* 메인 에러 박스 */}
        <div className="glass-panel glass-border-neon max-w-lg w-full p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden text-center animate-in">
          {/* 상단 빔 데코레이션 */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

          {/* 에러 아이콘 */}
          <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <div className="absolute inset-0 bg-red-500/10 rounded-2xl rotate-6 animate-pulse" />
            <div className="relative w-16 h-16 bg-white rounded-2xl border border-red-200/50 flex items-center justify-center shadow-lg">
              <AlertOctagon className="w-8 h-8 text-red-500" />
            </div>
          </div>

          {/* 에러 타이틀 */}
          <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight font-outfit">
            치명적인 <span className="text-gradient-gold">오류가 감지되었습니다</span>
          </h2>
          <p className="text-[15px] text-slate-500 leading-relaxed mb-8">
            최상위 애플리케이션 환경을 초기화하는 중 오류가 발생했습니다.<br />
            전체 세션을 다시 초기화하여 복구해보세요.
          </p>

          {/* 에러 메시지 */}
          {error.message && (
            <div className="mb-8 p-4 bg-slate-900/5 rounded-xl border border-slate-200/40 text-left">
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Global Error Log</p>
              <p className="text-xs font-mono text-red-600 break-all select-all font-semibold leading-relaxed">
                {error.message}
              </p>
            </div>
          )}

          {/* 리셋 버튼 */}
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-600 text-white px-6 py-3 text-[15px] font-bold hover:shadow-md hover:shadow-orange-200 active:scale-[0.98] transition-all duration-200"
          >
            <RotateCcw className="w-4 h-4" />
            애플리케이션 다시 불러오기
          </button>
        </div>
      </body>
    </html>
  )
}
