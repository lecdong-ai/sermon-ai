'use client'

import { useEffect, useState } from 'react'

type DerivativeType = 'summary' | 'questions' | 'cardnews' | 'shorts' | 'ppt' | 'guide'

interface Derivative {
  type: DerivativeType
  label: string
  icon: string
  color: string
  content?: string
  error?: string
  status: 'pending' | 'generating' | 'done' | 'error'
  selected: boolean
}

interface HarvestModalProps {
  sermonId: string
  sermonTitle: string
  sermonPassage: string
  sermonContent: string
  coreMessage?: string
  onClose: () => void
  onSaved?: () => void
}

const ALL_TYPES: { type: DerivativeType; label: string; icon: string; color: string }[] = [
  { type: 'summary',  label: '설교 요약서',     icon: '📄', color: 'from-indigo-500/20 to-blue-500/10' },
  { type: 'questions',label: '소그룹 토론 질문', icon: '👥', color: 'from-purple-500/20 to-pink-500/10' },
  { type: 'cardnews', label: '카드뉴스 템플릿',  icon: '📱', color: 'from-pink-500/20 to-rose-500/10' },
  { type: 'shorts',   label: '유튜브 쇼츠 대본', icon: '🎬', color: 'from-cyan-500/20 to-blue-500/10' },
  { type: 'ppt',      label: 'PPT 슬라이드',     icon: '📊', color: 'from-amber-500/20 to-orange-500/10' },
  { type: 'guide',    label: '토론 가이드',      icon: '📖', color: 'from-emerald-500/20 to-teal-500/10' },
]

export default function HarvestModal({ sermonId, sermonTitle, sermonPassage, sermonContent, coreMessage, onClose, onSaved }: HarvestModalProps) {
  const [phase, setPhase] = useState<'intro' | 'growing' | 'review' | 'saving' | 'done'>('intro')
  const [items, setItems] = useState<Derivative[]>(
    ALL_TYPES.map((t) => ({ ...t, status: 'pending', selected: true })),
  )
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (phase === 'growing') {
      const start = Date.now()
      const t = setInterval(() => setElapsed((Date.now() - start) / 1000), 100)
      return () => clearInterval(t)
    }
  }, [phase])

  const startGrowing = async () => {
    setPhase('growing')
    setError(null)
    try {
      const res = await fetch('/api/notes/harvest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sermonId,
          title: sermonTitle,
          passage: sermonPassage,
          content: sermonContent,
          coreMessage,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || '수확 실패')
      setItems((prev) => prev.map((it) => {
        const r = json.results[it.type]
        if (!r) return it
        if (r.success) return { ...it, status: 'done', content: r.content, selected: true }
        return { ...it, status: 'error', error: r.error }
      }))
      setPhase('review')
    } catch (e: any) {
      setError(e?.message || '수확에 실패했습니다')
      setPhase('review')
    }
  }

  const toggleSelect = (type: DerivativeType) => {
    setItems((prev) => prev.map((it) => (it.type === type ? { ...it, selected: !it.selected } : it)))
  }

  const allSaved = async () => {
    const toSave = items.filter((it) => it.selected && it.status === 'done' && it.content)
    if (toSave.length === 0) {
      onClose()
      return
    }
    setPhase('saving')
    try {
      const res = await fetch('/api/notes/harvest/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sermonId,
          items: toSave.map((it) => ({ type: it.type, content: it.content })),
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || '저장 실패')
      setPhase('done')
      onSaved?.()
    } catch (e: any) {
      setError(e?.message || '저장 실패')
      setPhase('review')
    }
  }

  const doneCount = items.filter((it) => it.status === 'done').length
  const selectedCount = items.filter((it) => it.selected && it.status === 'done').length
  const totalElapsed = phase === 'growing' ? elapsed.toFixed(1) : null

  return (
    <div className="fixed inset-0 z-50 bg-[#02040a]/90 backdrop-blur-md flex items-center justify-center p-4" onClick={phase === 'done' ? onClose : undefined}>
      <div
        className="relative w-full max-w-3xl max-h-[90vh] rounded-3xl bg-gradient-to-br from-[#0c1020] to-[#04060f] border border-white/10 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {phase === 'intro' && <IntroPhase sermonTitle={sermonTitle} sermonPassage={sermonPassage} onStart={startGrowing} onClose={onClose} />}
        {phase === 'growing' && <GrowingPhase items={items} elapsed={elapsed} />}
        {(phase === 'review' || phase === 'saving') && (
          <ReviewPhase
            items={items}
            expanded={expanded}
            setExpanded={setExpanded}
            toggleSelect={toggleSelect}
            onSave={allSaved}
            doneCount={doneCount}
            selectedCount={selectedCount}
            saving={phase === 'saving'}
            error={error}
            onClose={onClose}
            totalElapsed={totalElapsed}
          />
        )}
        {phase === 'done' && <DonePhase count={selectedCount} onClose={onClose} />}
      </div>
    </div>
  )
}

/* ─── Phase 1: Intro ─── */

function IntroPhase({ sermonTitle, sermonPassage, onStart, onClose }: { sermonTitle: string; sermonPassage: string; onStart: () => void; onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-10 space-y-6">
      <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 p-1.5">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="relative">
        <div className="text-7xl">🍇</div>
        <div className="absolute inset-0 animate-pulse-dot rounded-full bg-emerald-500/10" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-white">설교의 열매를 수확하시겠습니까?</h2>
        <p className="text-xs text-slate-400 mt-2 max-w-md leading-relaxed">
          이 설교로 6가지 콘텐츠를 자동으로 만듭니다:<br />
          요약 · 토론 질문 · 카드뉴스 · 쇼츠 · PPT · 가이드
        </p>
      </div>
      <div className="bg-white/5 rounded-2xl p-4 max-w-md w-full border border-white/10">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">지금 수확할 설교</p>
        <p className="text-sm font-bold text-white">{sermonTitle}</p>
        {sermonPassage && <p className="text-xs text-indigo-300 mt-0.5">{sermonPassage}</p>}
      </div>
      <button
        onClick={onStart}
        className="text-sm font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white px-8 py-3 rounded-2xl shadow-2xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all hover:scale-[1.02] flex items-center gap-2"
      >
        <span className="text-lg">🍇</span>
        수확 시작
      </button>
      <p className="text-[10px] text-slate-500 font-medium italic">약 30초 정도 소요됩니다 · 병렬로 처리됩니다</p>
    </div>
  )
}

/* ─── Phase 2: Growing ─── */

function GrowingPhase({ items, elapsed }: { items: Derivative[]; elapsed: number }) {
  return (
    <div className="p-6 space-y-4">
      <div className="text-center">
        <div className="text-4xl mb-2 animate-pulse">🍇</div>
        <h3 className="text-base font-bold text-white">6가지 열매를 만들고 있어요...</h3>
        <p className="text-[10px] text-slate-500 font-bold mt-1 tabular-nums">{elapsed.toFixed(1)}초 경과</p>
      </div>
      <div className="space-y-2">
        {items.map((it) => {
          const isDone = it.status === 'done'
          const isError = it.status === 'error'
          return (
            <div key={it.type} className={`rounded-xl border p-3 bg-gradient-to-r ${it.color} ${
              isDone ? 'border-emerald-500/40' : isError ? 'border-red-500/40' : 'border-white/10'
            }`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">{it.icon}</span>
                <span className="text-[11px] font-bold text-slate-200 flex-1">{it.label}</span>
                {isDone ? (
                  <span className="text-[10px] font-bold text-emerald-300">✓ 완료</span>
                ) : isError ? (
                  <span className="text-[10px] font-bold text-red-300">⚠ 실패</span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    생성 중
                  </span>
                )}
              </div>
              <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isDone ? 'bg-emerald-500 w-full' : isError ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                  }`}
                  style={{ width: isDone ? '100%' : isError ? '0%' : `${Math.min(95, (elapsed * 25))}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Phase 3: Review ─── */

function ReviewPhase({ items, expanded, setExpanded, toggleSelect, onSave, doneCount, selectedCount, saving, error, onClose, totalElapsed }: {
  items: Derivative[]
  expanded: string | null
  setExpanded: (s: string | null) => void
  toggleSelect: (t: DerivativeType) => void
  onSave: () => void
  doneCount: number
  selectedCount: number
  saving: boolean
  error: string | null
  onClose: () => void
  totalElapsed: string | null
}) {
  return (
    <>
      <div className="px-6 py-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>🍇</span> 6가지 열매가 준비되었습니다!
            </h3>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
              {doneCount}개 생성됨 · {selectedCount}개 선택됨 {totalElapsed && `· ${totalElapsed} 소요`}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-2">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">{error}</div>
        )}
        {items.map((it) => {
          const isExpanded = expanded === it.type
          const isDone = it.status === 'done'
          return (
            <div
              key={it.type}
              className={`rounded-xl border p-3 transition-all ${
                it.selected && isDone
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : 'border-white/10 bg-white/5'
              } ${!isDone ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={it.selected}
                  disabled={!isDone}
                  onChange={() => toggleSelect(it.type)}
                  className="w-3.5 h-3.5 rounded accent-emerald-500"
                />
                <span className="text-base">{it.icon}</span>
                <span className="text-[11px] font-bold text-slate-200 flex-1">{it.label}</span>
                {isDone ? (
                  <span className="text-[10px] font-bold text-emerald-300">✓</span>
                ) : it.status === 'error' ? (
                  <span className="text-[10px] font-bold text-red-300">실패</span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-500">대기</span>
                )}
                {isDone && (
                  <button
                    onClick={() => setExpanded(isExpanded ? null : it.type)}
                    className="text-[10px] text-slate-500 hover:text-slate-300 font-bold"
                  >
                    {isExpanded ? '접기 ▲' : '미리보기 ▼'}
                  </button>
                )}
              </div>
              {isExpanded && it.content && (
                <div className="mt-2 p-3 rounded-lg bg-black/30 border border-white/5 text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap font-medium max-h-48 overflow-y-auto scrollbar-thin">
                  {it.content}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between gap-2 shrink-0">
        <span className="text-[10px] text-slate-500 font-medium">
          {selectedCount}개 저장됩니다
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="text-[11px] font-bold text-slate-400 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors disabled:opacity-30"
          >
            취소
          </button>
          <button
            onClick={onSave}
            disabled={saving || selectedCount === 0}
            className="text-[11px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-30 shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
          >
            {saving ? (
              <>
                <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                저장 중...
              </>
            ) : (
              <>🍇 {selectedCount}개 저장</>
            )}
          </button>
        </div>
      </div>
    </>
  )
}

/* ─── Phase 4: Done ─── */

function DonePhase({ count, onClose }: { count: number; onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-10 space-y-5">
      <div className="relative">
        <div className="text-7xl">🎉</div>
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-pulse" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-white">{count}가지 콘텐츠가 저장되었습니다!</h2>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          설교 카드에서 언제든 다시 볼 수 있습니다.
        </p>
      </div>
      <button
        onClick={onClose}
        className="text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
      >
        확인
      </button>
    </div>
  )
}
