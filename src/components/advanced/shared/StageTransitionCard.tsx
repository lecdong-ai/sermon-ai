'use client'

import type { ProjectStatus } from '@/lib/advanced/types'
import { PROJECT_STATUS_LABELS, STAGE_TRANSITIONS } from '@/lib/advanced/types'

export default function StageTransitionCard({
  currentStatus,
  onTransition,
}: {
  currentStatus: ProjectStatus
  onTransition: (to: ProjectStatus) => void
}) {
  const available = STAGE_TRANSITIONS.filter(t => t.from === currentStatus)
  if (available.length === 0) return null

  return (
    <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-4">
      <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">다음 단계</h3>
      <div className="space-y-2">
        {available.map(t => (
          <button
            key={t.to}
            onClick={() => onTransition(t.to)}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 transition-colors">
              <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-indigo-300">
                {PROJECT_STATUS_LABELS[currentStatus]} → {PROJECT_STATUS_LABELS[t.to]}
              </div>
              <p className="text-[10px] text-indigo-400 mt-0.5">{t.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
