'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  FileText,
  Layers3,
  Lightbulb,
  Loader2,
  Sparkles,
  Wand2,
} from 'lucide-react'

const QUICK_PASSAGES = [
  '시편 23:1-6',
  '에베소서 2:1-10',
  '누가복음 15:11-24',
  '마태복음 11:28-30',
]

const QUICK_TITLES = [
  '지친 영혼을 회복하시는 하나님',
  '은혜로 다시 시작하는 삶',
  '돌아오는 자를 기다리시는 아버지',
]

const PREP_STEPS = [
  {
    title: '주제와 본문 정리',
    desc: '설교 제목과 성경 본문만 입력하면 준비의 방향이 또렷해집니다.',
    icon: FileText,
  },
  {
    title: 'AI 추천으로 보완',
    desc: '입력이 막힐 때 제목과 본문을 서로 추천받아 흐름을 빠르게 잡을 수 있습니다.',
    icon: Wand2,
  },
  {
    title: '워크스페이스 시작',
    desc: '생성 직후 본문 관찰, 메시지 정리, 개요 작성 단계로 바로 이어집니다.',
    icon: Layers3,
  },
]

const BENEFITS = [
  '다음 주일 날짜가 기본값으로 자동 설정됩니다.',
  'AI가 제목과 본문을 서로 맥락에 맞게 추천합니다.',
  '입력 후 바로 설교 워크스페이스로 이동합니다.',
]

interface SuggestionItem {
  value: string
  reason: string
}

function SuggestionCard({ item, onPick }: { item: SuggestionItem; onPick: (value: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPick(item.value)}
      className="group w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:shadow-lg hover:shadow-indigo-500/20"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-500/15 text-indigo-300 transition-colors group-hover:border-indigo-400 group-hover:text-indigo-200">
          <Check className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0">
          <span className="block text-[14px] font-bold text-white">{item.value}</span>
          <span className="mt-1 block text-[12px] leading-relaxed text-slate-400">{item.reason}</span>
        </div>
      </div>
    </button>
  )
}

export default function NewSermonPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [passage, setPassage] = useState('')
  const [sermonDate, setSermonDate] = useState(() => {
    const d = new Date()
    const day = d.getDay()
    const nextSunday = new Date(d)
    nextSunday.setDate(d.getDate() + (7 - day) % 7)
    return nextSunday.toISOString().split('T')[0]
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [recentTitles, setRecentTitles] = useState<string[]>([])
  const [recentPassages, setRecentPassages] = useState<string[]>([])
  const [loadingRecent, setLoadingRecent] = useState(true)

  useEffect(() => {
    fetch('/api/sermons')
      .then(r => r.json())
      .then(data => {
        const sermons = data.data || data.sermons || []
        const titles = Array.from(new Set(sermons.map((s: any) => s.title).filter(Boolean))).slice(0, 5) as string[]
        const passages = Array.from(new Set(sermons.map((s: any) => s.normalizedPassage || s.passage).filter(Boolean))).slice(0, 5) as string[]
        setRecentTitles(titles)
        setRecentPassages(passages)
      })
      .catch(() => {})
      .finally(() => setLoadingRecent(false))
  }, [])
  const [suggesting, setSuggesting] = useState<'title' | 'passage' | null>(null)
  const [suggestions, setSuggestions] = useState<{
    field: 'title' | 'passage'
    items: SuggestionItem[]
  } | null>(null)

  const handleSuggest = async (field: 'title' | 'passage') => {
    setSuggesting(field)
    setError('')

    const body = field === 'title' ? { passage: passage.trim() } : { title: title.trim() }

    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()

      if (json.success && json.suggestions?.length) {
        setSuggestions({ field, items: json.suggestions })
      } else {
        setError(json.error || '추천 실패')
      }
    } catch {
      setError('네트워크 오류')
    } finally {
      setSuggesting(null)
    }
  }

  const pickSuggestion = (value: string) => {
    if (!suggestions) return
    if (suggestions.field === 'title') setTitle(value)
    else setPassage(value)
    setSuggestions(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('제목을 입력해주세요.')
      return
    }
    if (!passage.trim()) {
      setError('성경본문을 입력해주세요.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/sermons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          passage: passage.trim(),
          sermon_date: sermonDate,
        }),
      })
      const json = await res.json()

      if (json.success) {
        router.push(`/sermon/${json.data.id}`)
      } else {
        setError(json.error || '생성 실패')
      }
    } catch {
      setError('네트워크 오류')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050814]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[-12%] h-[520px] w-[520px] rounded-full bg-gradient-to-br from-indigo-500/20 via-blue-500/10 to-transparent blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-6%] h-[540px] w-[540px] rounded-full bg-gradient-to-tr from-purple-500/15 via-indigo-500/8 to-transparent blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div className="space-y-6">
            <section className="glass-dark rounded-[32px] p-6 sm:p-8 lg:p-10 border border-white/10">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-3.5 py-1.5 text-[12px] font-bold text-indigo-300">
                <BookOpen className="h-3.5 w-3.5" />
                설교 생성
              </div>

              <div className="max-w-2xl">
                <h1 className="text-balance font-outfit text-[clamp(1.7rem,4vw,3rem)] font-extrabold leading-[1.15] text-white">
목회자의 묵상과 말씀 준비를 돕는
          <br /><span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">지혜로운 설교 파트너</span>
                </h1>
                <p className="mt-4 max-w-xl text-[15px] leading-7 text-slate-400 sm:text-[16px] font-medium">
                  제목과 성경 본문, 설교 날짜만 정리하면 바로 설교 워크스페이스로 이어집니다.
                  막막한 시작 대신, 집중할 수 있는 출발점을 만들어 드립니다.
                </p>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <p className="text-[14px] font-bold text-white">AI 추천</p>
                  <p className="mt-1 text-[13px] leading-6 text-slate-400 font-medium">본문 기반 제목 추천, 제목 기반 본문 추천을 바로 사용할 수 있습니다.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <p className="text-[14px] font-bold text-white">주일 기본값</p>
                  <p className="mt-1 text-[13px] leading-6 text-slate-400 font-medium">다가오는 주일 날짜가 자동으로 채워져 다음 설교 준비에 바로 들어갈 수 있습니다.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-300 border border-purple-500/20">
                    <Layers3 className="h-5 w-5" />
                  </div>
                  <p className="text-[14px] font-bold text-white">즉시 워크스페이스</p>
                  <p className="mt-1 text-[13px] leading-6 text-slate-400 font-medium">생성 후 곧바로 본문 관찰, 개요 작성, 원고 정리 단계로 이동합니다.</p>
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              {PREP_STEPS.map((step, index) => {
                const Icon = step.icon
                return (
                  <div
                    key={step.title}
                    className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[12px] font-extrabold tracking-[0.14em] text-slate-500">STEP {index + 1}</span>
                    </div>
                    <p className="text-[16px] font-bold text-white">{step.title}</p>
                    <p className="mt-2 text-[13px] leading-6 text-slate-400 font-medium">{step.desc}</p>
                  </div>
                )
              })}
            </section>

            <section className="rounded-[28px] border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-white/[0.02] to-purple-500/5 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[16px] font-extrabold text-white">입력을 더 잘 시작하는 방법</p>
                  <div className="mt-3 space-y-2">
                    {BENEFITS.map((item) => (
                      <div key={item} className="flex items-start gap-2.5 text-[13px] text-slate-300">
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-400" />
                        <span className="leading-6 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section className="lg:sticky lg:top-4">
            <div className="glass-dark rounded-[32px] border border-white/10 p-5 shadow-2xl shadow-indigo-500/10 sm:p-7">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-3 py-1 text-[12px] font-bold text-indigo-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    설교 시작 정보 입력
                  </div>
                  <h2 className="text-[24px] font-extrabold tracking-tight text-white">새 설교 준비</h2>
                  <p className="mt-2 text-[14px] leading-6 text-slate-400 font-medium">
                    필수 정보만 입력하면 바로 설교 워크스페이스가 생성됩니다.
                  </p>
                </div>
                <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 sm:flex">
                  <BookOpen className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="text-[14px] font-bold text-white">설교 제목 *</label>
                    {passage.trim() && (
                      <button
                        type="button"
                        onClick={() => handleSuggest('title')}
                        disabled={suggesting !== null}
                        className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-3 py-1 text-[12px] font-bold text-indigo-300 transition-colors hover:bg-indigo-500/25 disabled:opacity-50 border border-indigo-500/20"
                      >
                        {suggesting === 'title' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                        AI 제목 추천
                      </button>
                    )}
                  </div>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="예: 은혜는 무너진 마음을 다시 세웁니다"
                    autoFocus
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium"
                  />
                  {recentTitles.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-1.5 text-[11px] font-bold text-slate-500">최근 입력한 제목</p>
                      <div className="flex flex-wrap gap-2">
                        {recentTitles.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setTitle(item)}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] font-medium text-slate-300 transition-colors hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-300"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {recentTitles.length === 0 && !loadingRecent && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {QUICK_TITLES.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setTitle(item)}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] font-medium text-slate-300 transition-colors hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-300"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                  {suggestions?.field === 'title' && (
                    <div className="mt-3 space-y-2">
                      {suggestions.items.map((item, i) => (
                        <SuggestionCard key={i} item={item} onPick={pickSuggestion} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="text-[14px] font-bold text-white">성경 본문 *</label>
                    {title.trim() && (
                      <button
                        type="button"
                        onClick={() => handleSuggest('passage')}
                        disabled={suggesting !== null}
                        className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-3 py-1 text-[12px] font-bold text-indigo-300 transition-colors hover:bg-indigo-500/25 disabled:opacity-50 border border-indigo-500/20"
                      >
                        {suggesting === 'passage' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                        AI 본문 추천
                      </button>
                    )}
                  </div>
                  <input
                    value={passage}
                    onChange={(e) => setPassage(e.target.value)}
                    placeholder="예: 마태복음 11:28-30"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium"
                  />
                  {recentPassages.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-1.5 text-[11px] font-semibold text-slate-400">최근 입력한 본문</p>
                      <div className="flex flex-wrap gap-2">
                        {recentPassages.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setPassage(item)}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] font-medium text-slate-300 transition-colors hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-300"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {recentPassages.length === 0 && !loadingRecent && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {QUICK_PASSAGES.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setPassage(item)}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] font-medium text-slate-300 transition-colors hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-300"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                  {suggestions?.field === 'passage' && (
                    <div className="mt-3 space-y-2">
                      {suggestions.items.map((item, i) => (
                        <SuggestionCard key={i} item={item} onPick={pickSuggestion} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <label className="mb-2 flex items-center gap-2 text-[14px] font-bold text-white">
                    <CalendarDays className="h-4 w-4 text-indigo-300" />
                    설교 날짜
                  </label>
                  <input
                    type="date"
                    value={sermonDate}
                    onChange={(e) => setSermonDate(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-white focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium scheme-dark"
                  />
                  <p className="mt-2 text-[12px] text-slate-500 font-medium">기본값은 다음 주일로 자동 설정됩니다.</p>
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] font-medium text-red-300">
                    {error}
                  </div>
                )}

                <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 to-purple-500/5 p-4">
                  <p className="text-[13px] font-bold text-white">생성 후 바로 열리는 항목</p>
                  <div className="mt-2 grid gap-2 text-[12px] text-slate-400 sm:grid-cols-2 font-medium">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                      본문 관찰과 핵심 메시지 정리
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                      개요와 적용 포인트 작성
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams()
                    if (title) params.set('title', title)
                    if (passage) params.set('passage', passage)
                    if (sermonDate) params.set('date', sermonDate)
                    router.push(`/dashboard/sermons/new?${params.toString()}`)
                  }}
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-5 py-4 text-[15px] font-extrabold text-white shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/40"
                >
                  <BookOpen className="h-4 w-4" />
                  새 설교 시작하기
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
