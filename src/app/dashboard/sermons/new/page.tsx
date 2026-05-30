'use client'

import { useRouter } from 'next/navigation'
import { Cross, BookOpen, Sparkles } from 'lucide-react'

export default function NewSermonPage() {
  const router = useRouter()

  return (
    <div className="animate-fade-in flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">설교 방식 선택</h2>
          <p className="text-xs text-muted mt-0.5">원하시는 설교 준비 방식을 선택하세요</p>
        </div>
        <div className="p-5 space-y-3">
          <button
            onClick={() => window.location.href = '/sermon/advanced'}
            className="w-full p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200/60 hover:border-indigo-300 hover:shadow-md transition-all duration-200 text-left group"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <p className="text-[15px] font-extrabold text-indigo-700 group-hover:text-indigo-800 transition-colors">고급형 설교준비</p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] font-extrabold tracking-wide shadow-sm">
                PRO
              </span>
            </div>
            <p className="text-[12px] text-slate-500 mt-1 font-medium">업그레이드된 AI — 더 풍성한 결과물</p>
          </button>
          <button
            onClick={() => window.location.href = '/sermon/new'}
            className="w-full p-4 rounded-xl bg-background border border-border hover:border-slate-300 hover:shadow-md transition-all duration-200 text-left group"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-slate-400" />
              <p className="text-[15px] font-extrabold text-slate-700 group-hover:text-slate-800 transition-colors">일반형 설교준비</p>
            </div>
            <p className="text-[12px] text-muted mt-0.5 font-medium">기본 AI 모델 — 빠르고 간편하게</p>
          </button>
        </div>
        <div className="px-5 pb-4">
          <div className="flex items-center justify-center gap-1.5 mb-3 text-[11px] text-muted">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
            고급형 설교준비는 <strong className="text-foreground">PRO 플랜</strong> 전용입니다
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-2.5 rounded-xl text-[13px] font-bold text-muted hover:text-foreground hover:bg-background transition-all duration-200"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  )
}
