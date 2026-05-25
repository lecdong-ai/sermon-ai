'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
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
  Zap,
  Cpu,
  Brain,
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
    title: '고급 AI 분석',
    desc: 'GPT-4o가 본문을 심층 분석하여 더 정교한 인사이트를 제공합니다.',
    icon: Brain,
  },
  {
    title: '맞춤형 추천',
    desc: '입력한 내용을 기반으로 AI가 최적의 제목과 본문을 추천합니다.',
    icon: Wand2,
  },
  {
    title: '실전 워크스페이스',
    desc: '생성 즉시 본문 관찰, 메시지 정리, 개요 작성으로 바로 진입합니다.',
    icon: Layers3,
  },
]

const BENEFITS = [
  'GPT-4o 기반 — 기존보다 더 풍성하고 깊이 있는 결과물',
  '본문과 제목을 상호 맥락에 맞게 AI가 지능 추천',
  '생성 후 바로 실전형 설교 워크스페이스로 이동',
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
      className="group w-full rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50/90 to-white px-4 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md hover:shadow-amber-500/5"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber-200 bg-white text-amber-400 transition-colors group-hover:border-amber-400 group-hover:text-amber-600">
          <Check className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0">
          <span className="block text-[14px] font-bold text-slate-800">{item.value}</span>
          <span className="mt-1 block text-[12px] leading-relaxed text-slate-500">{item.reason}</span>
        </div>
      </div>
    </button>
  )
}

export default function AdvancedSermonPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [passage, setPassage] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
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
        }),
      })
      const json = await res.json()

      if (json.success) {
        router.push(`/sermon/${json.data.id}?advanced=true`)
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
    <div className="relative min-h-screen overflow-hidden bg-slate-50/60">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[-12%] h-[520px] w-[520px] rounded-full bg-gradient-to-br from-amber-300/12 via-orange-300/8 to-transparent blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-6%] h-[540px] w-[540px] rounded-full bg-gradient-to-tr from-amber-300/10 via-orange-300/6 to-transparent blur-3xl" />
        <div className="absolute inset-0 bg-grid-tech opacity-60" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <button
          onClick={() => router.push('/sermon')}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-[13px] font-semibold text-slate-500 shadow-sm backdrop-blur hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          설교 준비 목록으로
        </button>

        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div className="space-y-6">
            <section className="glass-panel glass-border-neon rounded-[32px] p-6 sm:p-8 lg:p-10">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-white/80 px-3.5 py-1.5 text-[12px] font-bold text-amber-600 shadow-sm">
                <Zap className="h-3.5 w-3.5" />
                실전형 설교 준비
                <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-extrabold">GPT-4o</span>
              </div>

              <div className="max-w-2xl">
                <h1 className="text-balance font-outfit text-[clamp(1.5rem,3.5vw,2.6rem)] font-extrabold leading-[1.1] text-slate-900">
                  설교 한 편을
                  <span className="text-gradient"> 가장 강력하게 완성하는 화면</span>
                </h1>
                <p className="mt-4 max-w-xl text-[15px] leading-7 text-slate-500 sm:text-[16px]">
                  GPT-4o가 본문을 깊이 분석하여 더 풍성한 인사이트와 정교한 결과물을 제공합니다.
                  제목과 성경 본문만 입력하면 실전형 워크스페이스로 바로 이어집니다.
                </p>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <p className="text-[14px] font-bold text-slate-800">GPT-4o 엔진</p>
                  <p className="mt-1 text-[13px] leading-6 text-slate-500">최신 AI 모델이 설교 준비의 완성도를 한 단계 끌어올립니다.</p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <p className="text-[14px] font-bold text-slate-800">AI 상호 추천</p>
                  <p className="mt-1 text-[13px] leading-6 text-slate-500">제목과 본문을 서로 맥락에 맞게 지능적으로 추천합니다.</p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                    <Layers3 className="h-5 w-5" />
                  </div>
                  <p className="text-[14px] font-bold text-slate-800">즉시 워크스페이스</p>
                  <p className="mt-1 text-[13px] leading-6 text-slate-500">생성 직후 본문 관찰, 개요 작성, 원고 정리 단계로 이동합니다.</p>
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              {PREP_STEPS.map((step, index) => {
                const Icon = step.icon
                return (
                  <div
                    key={step.title}
                    className="rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-sm backdrop-blur"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[12px] font-extrabold tracking-[0.14em] text-slate-300">STEP {index + 1}</span>
                    </div>
                    <p className="text-[16px] font-bold text-slate-900">{step.title}</p>
                    <p className="mt-2 text-[13px] leading-6 text-slate-500">{step.desc}</p>
                  </div>
                )
              })}
            </section>

            <section className="rounded-[28px] border border-amber-100/80 bg-gradient-to-br from-amber-50/90 via-white to-orange-50/70 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[16px] font-extrabold text-slate-900">실전형을 선택해야 하는 이유</p>
                  <div className="mt-3 space-y-2">
                    {BENEFITS.map((item) => (
                      <div key={item} className="flex items-start gap-2.5 text-[13px] text-slate-600">
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                        <span className="leading-6">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section className="lg:sticky lg:top-24">
            <div className="glass-panel rounded-[32px] border border-white/80 p-5 shadow-xl shadow-amber-500/10 sm:p-7">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-[12px] font-bold text-amber-600">
                    <Sparkles className="h-3.5 w-3.5" />
                    GPT-4o 실전형 시작
                  </div>
                  <h2 className="text-[24px] font-extrabold tracking-tight text-slate-900">실전형 설교 준비</h2>
                  <p className="mt-2 text-[14px] leading-6 text-slate-500">
                    필수 정보만 입력하면 바로 실전형 워크스페이스가 생성됩니다.
                  </p>
                </div>
                <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md sm:flex">
                  <Zap className="h-5 w-5" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="text-[14px] font-bold text-slate-900">설교 제목 *</label>
                    {passage.trim() && (
                      <button
                        type="button"
                        onClick={() => handleSuggest('title')}
                        disabled={suggesting !== null}
                        className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[12px] font-semibold text-amber-600 transition-colors hover:bg-amber-100 disabled:opacity-50"
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
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {QUICK_TITLES.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setTitle(item)}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12px] font-medium text-slate-600 transition-colors hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  {suggestions?.field === 'title' && (
                    <div className="mt-3 space-y-2">
                      {suggestions.items.map((item, i) => (
                        <SuggestionCard key={i} item={item} onPick={pickSuggestion} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="text-[14px] font-bold text-slate-900">성경 본문 *</label>
                    {title.trim() && (
                      <button
                        type="button"
                        onClick={() => handleSuggest('passage')}
                        disabled={suggesting !== null}
                        className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[12px] font-semibold text-amber-600 transition-colors hover:bg-amber-100 disabled:opacity-50"
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
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {QUICK_PASSAGES.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setPassage(item)}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12px] font-medium text-slate-600 transition-colors hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  {suggestions?.field === 'passage' && (
                    <div className="mt-3 space-y-2">
                      {suggestions.items.map((item, i) => (
                        <SuggestionCard key={i} item={item} onPick={pickSuggestion} />
                      ))}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-600">
                    {error}
                  </div>
                )}

                <div className="rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50/90 to-orange-50/90 p-4">
                  <p className="text-[13px] font-bold text-slate-800">생성 후 바로 열리는 항목</p>
                  <div className="mt-2 grid gap-2 text-[12px] text-slate-600 sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      본문 관찰과 핵심 메시지 정리
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      개요와 적용 포인트 작성
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 px-5 py-4 text-[15px] font-bold text-white shadow-lg shadow-amber-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/25 disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  {saving ? '워크스페이스 생성 중...' : '실전형 워크스페이스 시작'}
                  {!saving && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
