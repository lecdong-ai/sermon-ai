'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, BookMarked, BookOpen, Calendar, Check, ChevronRight,
  Layers, Loader2, Wand2,
} from 'lucide-react'
import { BIBLE_BOOKS, getBooksByTestament, type BibleBook } from '@/lib/advanced/bibleBooks'
import type { ExpositoryPlan } from '@/lib/advanced/expositoryPlan'
import { EXPOSITORY_MODELS, type ExpositoryModelId } from '@/lib/advanced/expositoryModels'

const SERMON_TYPES = ['주일예배', '수요예배', '금요기도회', '새벽기도회', '특별집회']
const AUDIENCES = ['장년', '청년', '학생', '전체', '혼합']
const SEASONS = ['일반주일', '사순절', '부활절', '성령강림절', '추수감사절', '대림절', '성탄절']
const FIELD_INPUT = 'w-full bg-black/20 border border-white/10 rounded-lg px-2.5 py-2 text-[11px] text-white outline-none focus:border-indigo-400/50 [color-scheme:dark]'

function nextSunday() {
  const date = new Date()
  const days = (7 - date.getDay()) % 7 || 7
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function rangeLabel(unit: ExpositoryPlan['units'][number]) {
  return unit.passage
}

export default function ExpositoryProjectPage() {
  const router = useRouter()
  const [testament, setTestament] = useState<'OT' | 'NT'>('NT')
  const [book, setBook] = useState<BibleBook | null>(null)
  const [model, setModel] = useState<ExpositoryModelId>('pastoral')
  const [startDate, setStartDate] = useState('')
  const [intervalDays, setIntervalDays] = useState(7)
  const [seriesTitle, setSeriesTitle] = useState('')
  const [preacher, setPreacher] = useState('김바울')
  const [sermonType, setSermonType] = useState('주일예배')
  const [audience, setAudience] = useState('장년')
  const [season, setSeason] = useState('일반주일')
  const [plan, setPlan] = useState<ExpositoryPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const books = useMemo(() => getBooksByTestament(testament), [testament])

  useEffect(() => {
    setStartDate(nextSunday())
  }, [])

  const handleGenerate = async () => {
    if (!book) return
    setLoading(true)
    setError(null)
    setPlan(null)
    try {
      const response = await fetch('/api/advanced/expository-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book: book.id, model }),
      })
      const json = await response.json()
      if (!response.ok || !json.success) throw new Error(json.error || '강해 계획 생성에 실패했습니다.')
      setPlan(json.data)
      setSeriesTitle(json.data.seriesTitle)
    } catch (err: any) {
      setError(err.message || '강해 계획 생성에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!plan || !startDate) return
    setCreating(true)
    setError(null)
    try {
      const response = await fetch('/api/advanced/expository-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          plan,
          seriesTitle: seriesTitle.trim() || plan.seriesTitle,
          startDate,
          intervalDays,
          preacher,
          sermonType,
          audience,
          season,
        }),
      })
      const json = await response.json()
      if (!response.ok || !json.success) throw new Error(json.error || '프로젝트 생성에 실패했습니다.')
      router.push(`/advanced/projects/expository/${json.data.seriesId}`)
    } catch (err: any) {
      setError(err.message || '프로젝트 생성에 실패했습니다.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-full pb-20">
      <div className="max-w-[1180px] mx-auto px-6 py-8 space-y-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <button
              onClick={() => router.push('/advanced/projects')}
              className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 font-bold mb-4 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> 프로젝트 목록
            </button>
            <div className="flex items-center gap-2 mb-2">
              <BookMarked className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400/70">Expository Bible Project</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">성경 한 권 강해 시작</h1>
            <p className="text-[13px] text-slate-500 mt-1 font-medium">
              한 권의 첫 본문부터 마지막 본문까지, 문맥을 따라 설교 프로젝트로 구성합니다.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 font-bold">
            <BookOpen className="w-3.5 h-3.5" /> 본문 전체 통과
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
          <section className="rounded-3xl border border-white/5 bg-[#050816]/80 p-6 space-y-6">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-3">1 · 성경책 선택</p>
              <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/5 w-fit mb-4">
                {(['OT', 'NT'] as const).map(value => (
                  <button
                    key={value}
                    onClick={() => { setTestament(value); setBook(null); setPlan(null) }}
                    className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${testament === value ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {value === 'OT' ? '구약 39권' : '신약 27권'}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-1.5 max-h-[330px] overflow-y-auto scrollbar-thin pr-1">
                {books.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setBook(item); setPlan(null) }}
                    className={`rounded-xl px-1 py-2 border text-center transition-all ${book?.id === item.id ? 'bg-indigo-500/20 border-indigo-400/50 text-indigo-200' : 'bg-white/[0.03] border-white/5 text-slate-400 hover:bg-white/[0.07] hover:text-white'}`}
                  >
                    <span className="block text-[12px] font-extrabold">{item.abbr}</span>
                    <span className="block text-[9px] text-slate-600 mt-0.5">{item.chapters}장</span>
                  </button>
                ))}
              </div>
              {book && (
                <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[12px] text-indigo-200 font-bold">
                  <BookOpen className="w-3.5 h-3.5" /> {book.name} · {book.chapters}장 전체
                </div>
              )}
            </div>

             <div className="space-y-3 border-t border-white/5 pt-5">
               <div className="flex items-center justify-between gap-2">
                 <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">2 · 강해 모델</p>
                 <span className="text-[9px] text-indigo-300/70 font-bold">회차 자동 산정</span>
               </div>
               <div className="space-y-2">
                 {EXPOSITORY_MODELS.map(item => (
                   <button
                     key={item.id}
                     onClick={() => { setModel(item.id); setPlan(null) }}
                     className={`w-full px-3 py-2.5 rounded-xl border text-left transition-all ${model === item.id ? 'bg-amber-500/15 border-amber-400/40 text-amber-200' : 'bg-white/[0.03] border-white/5 text-slate-400 hover:text-white'}`}
                   >
                     <span className="block text-[12px] font-bold">{item.label}</span>
                     <span className="block text-[9px] text-slate-500 mt-0.5">{item.reference}</span>
                     <span className="block text-[10px] text-slate-600 mt-1 leading-relaxed">{item.description}</span>
                   </button>
                 ))}
               </div>
               <p className="text-[10px] text-slate-600 leading-relaxed">실제 강해 회차는 목회자와 교회의 일정에 따라 달라집니다. 이 모델은 특정 목회자의 회차를 복제하지 않고, 선택한 책의 소제목 밀도와 본문 흐름을 반영해 권장 회차를 계산합니다.</p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!book || loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-extrabold shadow-lg shadow-indigo-600/20 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {loading ? '전체 본문을 구성하는 중...' : '강해 로드맵 생성'}
            </button>
          </section>

          <section className="rounded-3xl border border-white/5 bg-[#050816]/80 overflow-hidden min-h-[620px]">
            {!plan && !loading && (
              <div className="min-h-[620px] flex flex-col items-center justify-center text-center px-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/15 to-indigo-500/15 border border-white/10 flex items-center justify-center mb-5">
                  <Layers className="w-7 h-7 text-amber-300" />
                </div>
                <h2 className="text-base font-extrabold text-white mb-2">한 권 전체를 하나의 흐름으로</h2>
                <p className="text-[12px] text-slate-500 leading-relaxed max-w-sm">
                  성경책을 선택하면 AI가 자연스러운 본문 단위와 설교 제목, 중심 진리, 복음적 방향을 제안합니다.
                </p>
              </div>
            )}

            {loading && (
              <div className="min-h-[620px] flex flex-col items-center justify-center text-center">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
                <p className="text-sm text-slate-300 font-bold">{book?.name} 전체를 읽는 중입니다</p>
                <p className="text-[11px] text-slate-600 mt-2">본문의 순서와 문맥을 보존해 강해 단위를 구성합니다.</p>
              </div>
            )}

            {plan && !loading && (
              <div>
                <div className="p-6 border-b border-white/5 bg-gradient-to-br from-indigo-500/10 via-transparent to-amber-500/5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                       <p className="text-[10px] text-amber-300/80 font-extrabold uppercase tracking-widest mb-2">{plan.book} · {plan.units.length}편 · {plan.modelLabel || '본문 중심 강해'}</p>
                      <h2 className="text-lg font-black text-white">{plan.seriesTitle}</h2>
                    </div>
                    <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  </div>
                  <input
                    value={seriesTitle}
                    onChange={e => setSeriesTitle(e.target.value)}
                    className="w-full mt-4 bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-[12px] text-white outline-none focus:border-indigo-400/50"
                    placeholder="강해 시리즈 제목"
                  />
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-4">{plan.bookTheme}</p>
                  <div className="mt-3 px-3 py-2 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[10px] text-amber-200/70 leading-relaxed">{plan.canonicalFlow}</div>
                </div>

                <div className="max-h-[480px] overflow-y-auto scrollbar-thin p-4 space-y-2">
                  {plan.units.map(unit => (
                    <div key={unit.order} className="flex gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/20 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 flex items-center justify-center text-[11px] font-black shrink-0">{unit.order}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-[12px] text-white font-bold">{unit.title}</h3>
                          <span className="text-[10px] text-amber-300/80 font-bold">{rangeLabel(unit)}</span>
                        </div>
                        {unit.focus && <p className="text-[11px] text-indigo-200/80 mt-1 leading-relaxed">{unit.focus}</p>}
                        {unit.description && <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{unit.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-5 border-t border-white/5 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Field label="시작일" icon={<Calendar className="w-3 h-3" />}>
                      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={FIELD_INPUT} />
                    </Field>
                    <Field label="간격">
                      <select value={intervalDays} onChange={e => setIntervalDays(Number(e.target.value))} className={FIELD_INPUT}><option value={7}>매주</option><option value={14}>격주</option></select>
                    </Field>
                    <Field label="설교자">
                      <input value={preacher} onChange={e => setPreacher(e.target.value)} className={FIELD_INPUT} />
                    </Field>
                    <Field label="예배">
                      <select value={sermonType} onChange={e => setSermonType(e.target.value)} className={FIELD_INPUT}>{SERMON_TYPES.map(value => <option key={value}>{value}</option>)}</select>
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="회중"><select value={audience} onChange={e => setAudience(e.target.value)} className={FIELD_INPUT}>{AUDIENCES.map(value => <option key={value}>{value}</option>)}</select></Field>
                    <Field label="절기"><select value={season} onChange={e => setSeason(e.target.value)} className={FIELD_INPUT}>{SEASONS.map(value => <option key={value}>{value}</option>)}</select></Field>
                  </div>
                  <button onClick={handleCreate} disabled={creating || !startDate} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-[13px] font-extrabold transition-colors">
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                    {creating ? '설교 프로젝트를 만드는 중...' : `${plan.units.length}개 설교 프로젝트로 시작하기`}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>

        {error && <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[12px] text-red-300 font-bold">{error}</div>}
      </div>
    </div>
  )
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="space-y-1 block">
      <span className="flex items-center gap-1 text-[9px] text-slate-500 font-extrabold uppercase tracking-widest">{icon}{label}</span>
      {children}
    </label>
  )
}
