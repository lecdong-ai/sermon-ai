'use client'

import { useRouter } from 'next/navigation'
import { Sparkles, ArrowRight, Compass } from 'lucide-react'

const QUICK_PASSAGES = [
  { label: '롬 8:1-11', book: '로마서', chapter: 8, vs: 1, ve: 11 },
  { label: '요 3:16', book: '요한복음', chapter: 3, vs: 16, ve: null },
  { label: '시 23편', book: '시편', chapter: 23, vs: 1, ve: 6 },
  { label: '마 5:1-12', book: '마태복음', chapter: 5, vs: 1, ve: 12 },
  { label: '엡 2:1-10', book: '에베소서', chapter: 2, vs: 1, ve: 10 },
]

export default function NewUserLanding() {
  const router = useRouter()

  return (
    <div className="min-h-full flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto px-6 py-16 text-center space-y-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <Compass className="w-8 h-8 text-indigo-400" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
            말씀을 준비하는
            <br />
            가장 집중된 공간
          </h1>
          <p className="text-[15px] text-slate-400 font-medium leading-relaxed">
            AI와 함께 본문을 연구하고,
            <br />
            대지를 세우고, 원고를 완성하세요
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/advanced/projects/new')}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[15px] font-bold transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Sparkles className="w-5 h-5" />
            새 프로젝트 시작하기
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 justify-center">
            <div className="h-px flex-1 max-w-[80px] bg-white/5" />
            <span className="text-[11px] font-bold text-slate-600 shrink-0">또는 본문에서 바로 시작</span>
            <div className="h-px flex-1 max-w-[80px] bg-white/5" />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {QUICK_PASSAGES.map(p => (
              <button
                key={p.label}
                onClick={() =>
                  router.push(
                    `/advanced/projects/new?book=${encodeURIComponent(p.book)}&chapter=${p.chapter}&vs=${p.vs}${p.ve ? `&ve=${p.ve}` : ''}`
                  )
                }
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-indigo-500/15 border border-white/5 hover:border-indigo-500/30 text-[13px] font-bold text-slate-400 hover:text-indigo-300 transition-all"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-slate-600 font-medium">
          개혁주의 신학 전통에 기반한 AI 설교 준비 워크스페이스
        </p>
      </div>
    </div>
  )
}
