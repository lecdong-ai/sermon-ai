'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { NOTE_TYPE_LABELS, NOTE_TYPE_DOTS, type NoteEntry } from '@/lib/advanced/notesData'

interface LinkedInsightBannerProps {
  insightId: string | null
  onClose: () => void
}

export default function LinkedInsightBanner({ insightId, onClose }: LinkedInsightBannerProps) {
  const [insight, setInsight] = useState<NoteEntry | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!insightId) { setInsight(null); return }
    setLoading(true)
    fetch(`/api/insights`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const found = (json.data || []).find((n: NoteEntry) => n.id === insightId)
          setInsight(found || null)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [insightId])

  if (!insightId) return null

  const insertToManuscript = () => {
    if (!insight) return
    const quote = `> 💡 [통찰] ${insight.title}\n> ${insight.content.split('\n').join('\n> ')}\n\n`
    const event = new CustomEvent('insert-to-manuscript', { detail: quote })
    window.dispatchEvent(event)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="sticky top-0 z-20 mb-4 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-indigo-500/10 p-4 backdrop-blur-md">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-base">💡</span>
          <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">참고 통찰</span>
          <span className="text-[10px] text-slate-500">이 프로젝트를 위해 기록한 통찰이 원고에 인용 준비됨</span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-300 p-1"
          title="닫기"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {loading && <p className="text-xs text-slate-500">불러오는 중...</p>}

      {insight && (
        <>
          <div className="flex items-center gap-1.5 mb-2">
            <span className={`w-1.5 h-1.5 rounded-full ${NOTE_TYPE_DOTS[insight.type]}`} />
            <span className="text-[10px] font-bold text-slate-300">{NOTE_TYPE_LABELS[insight.type]}</span>
            {insight.starred && <span className="text-[10px] text-amber-400">★</span>}
            {insight.pinned && <span className="text-[10px] text-indigo-400">📌</span>}
          </div>
          <h4 className="text-sm font-bold text-white leading-snug mb-1">{insight.title}</h4>
          <p className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap line-clamp-4 font-medium mb-3">
            {insight.content}
          </p>
          {insight.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {insight.tags.map((t) => (
                <span key={t} className="text-[9px] text-slate-500 font-bold">#{t}</span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={insertToManuscript}
              className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg px-2.5 py-1.5 hover:bg-emerald-500/30 transition-colors"
            >
              {copied ? '✓ 복사됨' : '↳ 원고에 인용'}
            </button>
            <button
              onClick={() => router.push(`/advanced/notes?selected=${insight.id}`)}
              className="text-[10px] font-bold text-slate-300 border border-white/10 rounded-lg px-2.5 py-1.5 hover:bg-white/5 transition-colors"
            >
              통찰 페이지로 →
            </button>
          </div>
        </>
      )}
    </div>
  )
}
