'use client'

import { useState, useEffect, useRef } from 'react'
import type { NoteEntry } from '@/lib/advanced/notesData'

interface PassageSidePanelProps {
  note: NoteEntry
  onClose: () => void
}

interface PassageFetch {
  book: string
  chapter: number
  verseStart: number
  verseEnd: number
  label: string
  text: string | null
  loading: boolean
  error: string | null
}

/**
 * Parse a Korean Bible reference like "요한복음 3:16" or "요한복음 3:16-18"
 * Returns the 4 params the /api/bible route expects, or null if not parseable.
 */
function parseRef(label: string): { book: string; chapter: number; verseStart: number; verseEnd: number } | null {
  // Examples: "요한복음 3:16", "요한복음 3:16-18", "창세기 1:1-3"
  const m = label.trim().match(/^(.+?)\s+(\d+):(\d+)(?:\s*[-–~]\s*(\d+))?$/)
  if (!m) return null
  return {
    book: m[1].trim(),
    chapter: parseInt(m[2], 10),
    verseStart: parseInt(m[3], 10),
    verseEnd: m[4] ? parseInt(m[4], 10) : parseInt(m[3], 10),
  }
}

export default function PassageSidePanel({ note, onClose }: PassageSidePanelProps) {
  // Extract passage-type connections from the note
  const passageConnections = (note.connections || []).filter((c) => c.type === 'passage')
  const refs = passageConnections
    .map((c) => ({ ref: parseRef(c.label), label: c.label }))
    .filter((x): x is { ref: NonNullable<ReturnType<typeof parseRef>>; label: string } => x.ref !== null)

  const [activeIdx, setActiveIdx] = useState(0)
  const [fetched, setFetched] = useState<PassageFetch[]>([])
  const acRef = useRef<AbortController | null>(null)

  // Reset and fetch when note changes
  useEffect(() => {
    setActiveIdx(0)
    acRef.current?.abort()
    if (refs.length === 0) {
      setFetched([])
      return
    }
    const ac = new AbortController()
    acRef.current = ac
    const initial: PassageFetch[] = refs.map(({ ref, label }) => ({
      book: ref.book,
      chapter: ref.chapter,
      verseStart: ref.verseStart,
      verseEnd: ref.verseEnd,
      label,
      text: null,
      loading: true,
      error: null,
    }))
    setFetched(initial)

    Promise.all(
      refs.map(async ({ ref }, i) => {
        try {
          const url = `/api/bible?book=${encodeURIComponent(ref.book)}&chapter=${ref.chapter}&verseStart=${ref.verseStart}&verseEnd=${ref.verseEnd}`
          const res = await fetch(url, { signal: ac.signal })
          const json = await res.json()
          if (!res.ok || !json.success) throw new Error(json.error || '조회 실패')
          return { i, text: json.text as string }
        } catch (e: any) {
          if (e?.name === 'AbortError') return { i, text: null, aborted: true }
          return { i, text: null, error: e?.message || '불러오기 실패' }
        }
      })
    ).then((results) => {
      if (ac.signal.aborted) return
      setFetched((prev) =>
        prev.map((p, i) => {
          const r = results.find((x) => x.i === i)
          if (!r) return p
          if ('aborted' in r) return p
          if ('error' in r) return { ...p, loading: false, error: r.error }
          return { ...p, loading: false, text: r.text, error: null }
        })
      )
    })

    return () => ac.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.id])

  if (refs.length === 0) return null

  const active = fetched[activeIdx]

  return (
    <aside className="w-80 shrink-0 border-l border-white/5 bg-[#04060f]/85 backdrop-blur-md flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">본문</span>
          <span className="text-[10px] text-slate-500 font-bold">{refs.length}개</span>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1" title="닫기">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {refs.length > 1 && (
        <div className="px-3 pt-2 flex gap-1 overflow-x-auto border-b border-white/5 shrink-0">
          {refs.map((r, i) => (
            <button
              key={r.label}
              onClick={() => setActiveIdx(i)}
              className={`px-2 py-1 text-[10px] font-bold rounded-md whitespace-nowrap transition-colors ${
                i === activeIdx
                  ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                  : 'bg-white/5 text-slate-500 border border-transparent hover:text-slate-300'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {active?.loading && (
          <div className="p-6 text-center">
            <div className="w-6 h-6 mx-auto mb-2 rounded-full border-2 border-teal-500/30 border-t-teal-400 animate-spin" />
            <p className="text-[10px] text-slate-500 font-medium">본문 불러오는 중...</p>
          </div>
        )}
        {active?.error && (
          <div className="p-4 text-center">
            <p className="text-[11px] text-red-300 font-bold mb-1">본문을 불러올 수 없습니다</p>
            <p className="text-[10px] text-slate-500">{active.error}</p>
          </div>
        )}
        {active?.text && (
          <div className="p-4 space-y-3">
            <h4 className="text-xs font-bold text-teal-300">{active.label}</h4>
            <div className="space-y-2">
              {active.text.split('\n').map((line, i) => (
                <p key={i} className="text-[11px] text-slate-300 leading-relaxed font-medium">
                  {line}
                </p>
              ))}
            </div>
            <div className="pt-3 mt-3 border-t border-white/5">
              <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
                💡 노트와 함께 본문을 보며 묵상해보세요
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
