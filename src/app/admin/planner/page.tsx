'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, RefreshCw, ExternalLink } from 'lucide-react'

export default function AdminPlannerPage() {
  const [iframeKey, setIframeKey] = useState(0)

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1)
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0e1a]">
      {/* ─── 상단 플로팅 컨트롤 바 (미니멀 & 세련된 글래스모피즘) ─── */}
      <div className="absolute top-3 left-3 z-50 flex items-center gap-2">
        <Link
          href="/admin"
          className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0a0e1a]/85 hover:bg-[#131b2e] backdrop-blur-md border border-white/10 hover:border-white/20 text-slate-200 text-xs font-semibold shadow-xl transition-all hover:scale-[1.02]"
          title="관리자 센터로 돌아가기"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
          <span>관리자 센터</span>
        </Link>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0a0e1a]/85 hover:bg-[#131b2e] backdrop-blur-md border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-medium shadow-xl transition-all"
          title="스튜디오 새로고침"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">새로고침</span>
        </button>

        <a
          href="/admin-planner/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0a0e1a]/85 hover:bg-[#131b2e] backdrop-blur-md border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-medium shadow-xl transition-all"
          title="새 탭에서 열기"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>새 탭</span>
        </a>
      </div>

      {/* ─── 100vw × 100vh 꽉 찬 플래너 스튜디오 ─── */}
      <iframe
        key={iframeKey}
        src="/admin-planner/index.html"
        title="2027 성경통독 플래너 스튜디오"
        className="w-full h-full border-0 block bg-[#0a0e1a]"
      />
    </div>
  )
}

