'use client'

import { useState } from 'react'
import type { PrepVersion } from '@/lib/advanced/johnVersionData'

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('ko-KR', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function PrepVersionHistory({
  versions,
  onRestore,
}: {
  versions: PrepVersion[]
  onRestore?: (id: string) => void
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const current = versions.find(v => v.isCurrent)
  const previous = versions.filter(v => !v.isCurrent)

  return (
    <div className="bg-[#04060f]/60 rounded-xl border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-white/5 bg-[#04060f]/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">준비 이력</span>
          </div>
          {current && (
            <span className="text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
              현재 기준: {current.label}
            </span>
          )}
        </div>
      </div>

      {versions.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-xs text-slate-500">아직 준비 이력이 없습니다</p>
          <p className="text-[10px] text-slate-500 mt-1">중심명제나 대지 구조가 정리되면 이력이 누적됩니다</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {versions.map(v => {
            const isExpanded = expandedId === v.id
            const isLatest = v === versions[0]

            return (
              <div key={v.id} className={`${v.isCurrent ? 'bg-indigo-500/[0.07]' : ''}`}>
                {/* Header row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : v.id)}
                  className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      v.isCurrent
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white/5 text-slate-400'
                    }`}>
                      {versions.length - versions.indexOf(v)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-medium ${v.isCurrent ? 'text-indigo-300' : 'text-slate-100'}`}>
                          {v.label}
                        </span>
                        {v.isCurrent && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-medium">현재</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{formatDate(v.createdAt)} · {v.wordCount.toLocaleString()}자</p>
                    </div>
                  </div>
                  <svg className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Summary (always visible) */}
                <p className="px-5 pb-2 text-[11px] text-slate-400 leading-relaxed">{v.summary}</p>

                {/* Expanded changes */}
                {isExpanded && (
                  <div className="px-5 pb-4 space-y-1.5 animate-fade-in">
                    <div className="border-t border-white/5 pt-2 mb-1">
                      <span className="text-[9px] font-medium text-slate-500 uppercase tracking-wider">변경 내용</span>
                    </div>
                    {v.changes.map((change, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-slate-200">
                        <span className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                        <span>{change}</span>
                      </div>
                    ))}
                    {!v.isCurrent && onRestore && (
                      <div className="pt-2">
                        <button
                          onClick={e => { e.stopPropagation(); onRestore(v.id) }}
                          className="text-[10px] text-amber-600 hover:text-amber-700 border border-amber-200 hover:border-amber-300 px-2.5 py-1 rounded transition-colors"
                        >
                          이 버전으로 복원
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
