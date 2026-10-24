'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, RefreshCw, ExternalLink, Shield, BookOpen } from 'lucide-react'

export default function AdminPlannerPage() {
  const [iframeKey, setIframeKey] = useState(0)

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1)
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0a0e1a] flex flex-col">
      {/* ─── 초슬림 일체형 스튜디오 탑바 (겹침 0%, 깔끔한 스튜디오 레이아웃) ─── */}
      <header className="h-10 px-3.5 bg-[#0a0e1a] border-b border-white/10 flex items-center justify-between shrink-0 select-none z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-all hover:scale-[1.02]"
            title="관리자 센터로 돌아가기"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
            <span>관리자 센터</span>
          </Link>

          <div className="h-3.5 w-px bg-white/10" />

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-500 to-indigo-600 flex items-center justify-center">
              <BookOpen className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-bold text-slate-200 hidden sm:inline">2027 성경통독 플래너 스튜디오</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 hidden md:inline-flex items-center gap-1">
              <Shield className="w-2.5 h-2.5" /> 관리자 독점
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium border border-white/5 transition-colors"
            title="스튜디오 새로고침"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">새로고침</span>
          </button>

          <a
            href="/admin-planner/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold shadow-sm transition-all hover:scale-[1.02]"
            title="새 탭 전체화면 열기"
          >
            <ExternalLink className="w-3 h-3" />
            <span>새 탭 열기</span>
          </a>
        </div>
      </header>

      {/* ─── 플래너 스튜디오 메인 (남은 100% 뷰포트 꽉 채움) ─── */}
      <main className="flex-1 w-full min-h-0 relative bg-[#0a0e1a]">
        <iframe
          key={iframeKey}
          src="/admin-planner/index.html"
          title="2027 성경통독 플래너 스튜디오"
          className="w-full h-full border-0 block bg-[#0a0e1a]"
        />
      </main>
    </div>
  )
}

