'use client'

import { useState } from 'react'
import { BookOpen, ExternalLink, RefreshCw, Shield, Sparkles } from 'lucide-react'

export default function AdminPlannerPage() {
  const [iframeKey, setIframeKey] = useState(0)

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1)
  }

  return (
    <div className="space-y-4">
      {/* ─── 페이지 상단 헤더 ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              2027 성경통독 플래너 스튜디오
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                <Shield className="w-3 h-3" /> 관리자 독점
              </span>
            </h1>
          </div>
          <p className="text-[13px] text-slate-400">
            365일 1,880쪽 초경량 벡터 PDF 성경통독 플래너를 직접 커스텀하고 0.1초 만에 인쇄·다운로드합니다.
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 h-8 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg text-[12px] font-medium border border-white/5 transition-colors"
            title="스튜디오 새로고침"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            새로고침
          </button>
          <a
            href="/admin-planner/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg text-[12px] font-semibold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02]"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            새 탭 전체화면 열기
          </a>
        </div>
      </div>

      {/* ─── 플래너 스튜디오 임베드 프레임 ─── */}
      <div className="w-full h-[calc(100vh-10.5rem)] min-h-[750px] rounded-xl overflow-hidden border border-white/10 bg-[#0a0e1a] shadow-2xl relative">
        <iframe
          key={iframeKey}
          src="/admin-planner/index.html"
          title="2027 성경통독 플래너 스튜디오"
          className="w-full h-full border-0 bg-transparent"
        />
      </div>
    </div>
  )
}
