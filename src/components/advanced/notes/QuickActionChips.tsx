'use client'

import { useEffect, useState } from 'react'
import { FileText, Library, Network, PenLine } from 'lucide-react'
import type { NoteEntry } from '@/lib/advanced/notesData'

interface QuickActionChipsProps {
  note: NoteEntry | null
  onDismiss: () => void
  onSendToPrepare: () => void
  onAddToSeries: () => void
  onReflectInManuscript: () => void
  onViewInGraph: () => void
}

export default function QuickActionChips({ note, onDismiss, onSendToPrepare, onAddToSeries, onReflectInManuscript, onViewInGraph }: QuickActionChipsProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (note) {
      const t = setTimeout(() => setShow(true), 50)
      return () => clearTimeout(t)
    } else {
      setShow(false)
    }
  }, [note])

  if (!note) return null

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ${
      show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      <div className="bg-[#0c1020]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-indigo-500/10 px-2 py-2 flex items-center gap-1">
        <div className="flex items-center gap-2 px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-300">저장됨</span>
          <span className="text-[10px] text-slate-400 font-medium truncate max-w-[180px]">&ldquo;{note.title}&rdquo;</span>
        </div>
        <div className="w-px h-5 bg-white/10" />
        <ActionChip label="설교 준비" icon={FileText} onClick={onSendToPrepare} />
        <ActionChip label="시리즈" icon={Library} onClick={onAddToSeries} />
        <ActionChip label="원고 반영" icon={PenLine} onClick={onReflectInManuscript} />
        <ActionChip label="그래프" icon={Network} onClick={onViewInGraph} />
        <div className="w-px h-5 bg-white/10" />
        <button
          onClick={onDismiss}
          className="text-slate-500 hover:text-slate-300 p-2 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="닫기"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function ActionChip({ label, icon: Icon, onClick }: { label: string; icon: React.ComponentType<{ className?: string }>; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-[10px] font-bold text-slate-300 hover:text-indigo-300 px-2.5 py-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors flex items-center gap-1"
    >
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </button>
  )
}
