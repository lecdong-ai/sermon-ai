'use client'

import { useState } from 'react'
import { NOTE_TYPE_LABELS, NOTE_TYPE_COLORS, NOTE_TYPE_DOTS, type NoteType, type NoteEntry } from '@/lib/advanced/notesData'

interface InsightMasonryGridProps {
  notes: NoteEntry[]
  selectedId: string | null
  onSelect: (n: NoteEntry) => void
  onStar: (id: string) => void
  onPin: (id: string) => void
}

export default function InsightMasonryGrid({ notes, selectedId, onSelect, onStar, onPin }: InsightMasonryGridProps) {
  if (notes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 border border-white/10 flex items-center justify-center">
            <span className="text-2xl text-indigo-300">✦</span>
          </div>
          <p className="text-sm text-slate-300 font-bold mb-1">아직 기록된 통찰이 없습니다</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            오른쪽 캡처 무대에서 첫 통찰을 기록해보세요.<br />
            작은 관찰 한 줄이 사역의 별이 됩니다.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="p-3">
        <div className="columns-2 2xl:columns-3 gap-3 space-y-3">
          {notes.map((n) => (
            <InsightCard
              key={n.id}
              note={n}
              isSelected={n.id === selectedId}
              onSelect={() => onSelect(n)}
              onStar={() => onStar(n.id)}
              onPin={() => onPin(n.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function InsightCard({ note, isSelected, onSelect, onStar, onPin }: { note: NoteEntry; isSelected: boolean; onSelect: () => void; onStar: () => void; onPin: () => void }) {
  const passageConns = note.connections.filter((c) => c.type === 'passage')
  const themeConns = note.connections.filter((c) => c.type === 'theme')
  const totalConns = note.connections.length + (note.projectIds.length > 0 ? 1 : 0)
  const connDensity = Math.min(5, totalConns)

  return (
    <div
      onClick={onSelect}
      className={`break-inside-avoid rounded-xl border transition-all cursor-pointer group mb-3 ${
        isSelected
          ? 'border-indigo-500/40 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
          : 'border-white/5 bg-[#0c1020]/70 hover:border-indigo-500/25 hover:bg-[#0c1020]'
      }`}
    >
      <div className="p-3.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${NOTE_TYPE_DOTS[note.type]}`} />
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${NOTE_TYPE_COLORS[note.type]}`}>
              {NOTE_TYPE_LABELS[note.type]}
            </span>
            {note.pinned && (
              <svg className="w-2.5 h-2.5 text-indigo-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            )}
          </div>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onStar}
              className={`p-0.5 rounded text-[10px] transition-colors ${note.starred ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'}`}
            >
              {note.starred ? '★' : '☆'}
            </button>
            <button
              onClick={onPin}
              className={`p-0.5 rounded text-[10px] transition-colors ${note.pinned ? 'text-indigo-400' : 'text-slate-600 hover:text-indigo-400'}`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </div>

        <h4 className="text-[13px] font-bold text-white leading-snug mb-1.5">{note.title}</h4>
        <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-4 font-medium whitespace-pre-wrap">
          {note.summary || note.content}
        </p>

        {passageConns.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {passageConns.slice(0, 2).map((c) => (
              <span key={c.id} className="text-[9px] font-bold bg-teal-500/10 text-teal-300 px-1.5 py-0.5 rounded border border-teal-500/20">
                {c.label}
              </span>
            ))}
            {themeConns.slice(0, 1).map((c) => (
              <span key={c.id} className="text-[9px] font-bold bg-purple-500/10 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/20">
                {c.label}
              </span>
            ))}
          </div>
        )}

        {note.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map((t) => (
              <span key={t} className="text-[9px] text-slate-500 font-bold">#{t}</span>
            ))}
          </div>
        )}

        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
          <span className="text-[9px] text-slate-500 font-bold">
            {new Date(note.updatedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
          </span>
          {totalConns > 0 && (
            <span className="flex items-center gap-0.5" title={`연결 ${totalConns}개`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`w-1 h-1 rounded-full ${
                    i < connDensity
                      ? i < 2 ? 'bg-slate-500' : i < 4 ? 'bg-indigo-400' : 'bg-emerald-400'
                      : 'bg-white/5'
                  }`}
                />
              ))}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
