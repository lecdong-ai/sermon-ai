'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, BookMarked, BookOpen, Calendar, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react'

interface ExpositorySermon {
  id: string
  title: string
  passage: string
  date: string
  status: string
  expositoryPlan?: {
      book?: string
      order?: number
      total?: number
      bookTheme?: string
      canonicalFlow?: string
      focus?: string
      description?: string
      sectionTitles?: string[]
  }
}

const STATUS_LABELS: Record<string, string> = {
  draft: '연구 시작 전',
  in_progress: '진행 중',
  completed: '완료',
}

export default function ExpositorySeriesPage() {
  const params = useParams()
  const router = useRouter()
  const seriesId = params.seriesId as string
  const [sermons, setSermons] = useState<ExpositorySermon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/sermons?seriesId=${encodeURIComponent(seriesId)}`)
      .then(async response => {
        const json = await response.json()
        if (!response.ok || !json.success) throw new Error(json.error || '강해 프로젝트를 불러오지 못했습니다.')
        setSermons(json.data || [])
      })
      .catch(err => setError(err.message || '강해 프로젝트를 불러오지 못했습니다.'))
      .finally(() => setLoading(false))
  }, [seriesId])

  const nextUpSermon = useMemo(() => {
    return ordered.find(s => s.status !== 'completed') || ordered[0]
  }, [ordered])

  return (
    <div className="min-h-full pb-20">
      <div className="max-w-[1100px] mx-auto px-6 py-8 space-y-6">
        <div>
          <button onClick={() => router.push('/advanced/projects')} className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 font-bold mb-4 cursor-pointer">
            <ArrowLeft className="w-3.5 h-3.5" /> 프로젝트 목록
          </button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2"><BookMarked className="w-4 h-4 text-amber-400" /><span className="text-[10px] text-amber-400/70 uppercase tracking-widest font-extrabold">Expository Bible Project</span></div>
              <h1 className="text-2xl font-black text-white">{firstPlan?.book || '성경 한 권'} 강해 프로젝트</h1>
              <p className="text-[12px] text-slate-500 mt-1">처음부터 끝까지 본문 순서대로 진행하는 스마트 강해 로드맵</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl text-white font-black">{completed}<span className="text-sm text-slate-500">/{ordered.length}</span></p>
              <p className="text-[10px] text-slate-400 font-bold">진행률 {Math.round((completed / (ordered.length || 1)) * 100)}%</p>
            </div>
          </div>
        </div>

        {/* 🌟 이번 주에 바로 준비할 차례인 다음 설교 스마트 하이퍼 릴레이 카드 */}
        {nextUpSermon && (
          <div className="rounded-3xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/60 via-slate-900/90 to-amber-950/40 p-6 shadow-[0_10px_30px_rgba(79,70,229,0.15)] relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold">
                    🔥 다음 작성할 차례 ({nextUpSermon.expositoryPlan?.order || 1}/{ordered.length}회차)
                  </span>
                  <span className="text-xs font-bold text-amber-300 font-mono">{nextUpSermon.passage}</span>
                </div>
                <h3 className="text-lg font-black text-white">{nextUpSermon.title}</h3>
                <p className="text-xs text-indigo-200/80 leading-relaxed line-clamp-2">{nextUpSermon.expositoryPlan?.focus || nextUpSermon.expositoryPlan?.description}</p>
              </div>
              <button
                onClick={() => router.push(`/advanced/projects/${nextUpSermon.id}?tab=overview`)}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-extrabold shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
              >
                <span>⚡ 이번 회차 설교 작성하기</span>
                <ChevronRight className="w-4 h-4 text-slate-950 stroke-[3]" />
              </button>
            </div>
          </div>
        )}

        {firstPlan?.bookTheme && <div className="rounded-2xl border border-indigo-500/15 bg-indigo-500/5 p-5 text-[12px] text-slate-300 leading-relaxed">{firstPlan.bookTheme}</div>}
        {firstPlan?.canonicalFlow && <div className="rounded-2xl border border-amber-500/15 bg-amber-500/5 p-5 text-[11px] text-amber-200/75 leading-relaxed">{firstPlan.canonicalFlow}</div>}

        <div className="rounded-3xl border border-white/5 bg-[#050816]/80 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between"><div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-indigo-400" /><h2 className="text-sm text-white font-extrabold">강해 설교 로드맵 전체 목록</h2></div><span className="text-[10px] text-slate-500 font-bold">{ordered.length}개 본문 단위</span></div>
          <div className="divide-y divide-white/5">
            {ordered.map(sermon => {
              const plan = sermon.expositoryPlan
              const isCompleted = sermon.status === 'completed'
              const isNext = nextUpSermon?.id === sermon.id
              return (
                <button key={sermon.id} onClick={() => router.push(`/advanced/projects/${sermon.id}?tab=overview`)} className={`w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-white/[0.03] transition-colors group ${isNext ? 'bg-indigo-500/5' : ''}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black shrink-0 border ${isCompleted ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-300' : isNext ? 'bg-amber-500/20 border-amber-400/50 text-amber-300' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'}`}>{isCompleted ? <CheckCircle2 className="w-4 h-4" /> : plan?.order}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[13px] text-white font-bold group-hover:text-indigo-300">{sermon.title}</h3>
                      <span className="text-[10px] text-amber-300/80 font-bold">{sermon.passage}</span>
                      {isNext && <span className="text-[9px] px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-extrabold border border-amber-400/30">작성 순서</span>}
                    </div>
                    <p className="text-[11px] text-indigo-200/70 mt-1 leading-relaxed line-clamp-2">{plan?.focus}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-600">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{sermon.date || '날짜 미정'}</span>
                      <span>{STATUS_LABELS[sermon.status] || sermon.status}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-300 mt-2 shrink-0" />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
