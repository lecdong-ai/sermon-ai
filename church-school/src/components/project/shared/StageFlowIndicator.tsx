'use client'

import { useRouter } from 'next/navigation'

export type StageKey = 'study' | 'prep' | 'manuscript'

export const STAGE_FLOW: { key: StageKey; label: string; prev?: StageKey; next?: StageKey }[] = [
  { key: 'study', label: '성경 연구', next: 'prep' },
  { key: 'prep', label: '설교 준비', prev: 'study', next: 'manuscript' },
  { key: 'manuscript', label: '설교 작성', prev: 'prep' },
]

export default function StageFlowIndicator({
  currentStage,
  stageStatus,
  projectId,
  compact,
}: {
  currentStage: StageKey
  stageStatus?: Partial<Record<StageKey, 'empty' | 'done' | 'progress'>>
  projectId?: string
  compact?: boolean
}) {
  const router = useRouter()

  const statusDot: Record<string, string> = {
    done: 'bg-indigo-600',
    progress: 'bg-amber-400',
    empty: 'bg-white/10',
  }

  const stageColor: Record<StageKey, string> = {
    study: 'text-teal-700',
    prep: 'text-amber-700',
    manuscript: 'text-green-700',
  }

  const stageBg: Record<StageKey, string> = {
    study: 'bg-teal-500',
    prep: 'bg-amber-500',
    manuscript: 'bg-green-500',
  }

  return (
    <div className={`flex items-center gap-0 ${compact ? 'text-[10px]' : 'text-xs'}`}>
      {STAGE_FLOW.map((stage, i) => {
        const isCurrent = stage.key === currentStage
        const status = stageStatus?.[stage.key]
        const isDone = status === 'done'

        return (
          <div key={stage.key} className="flex items-center">
            {/* Stage pill */}
            <button
              onClick={() => projectId && router.push(`/projects/${projectId}?tab=${stage.key}`)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors ${
                isCurrent
                  ? `${stageBg[stage.key]} text-white font-medium`
                    : isDone
                      ? 'bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/20'
                      : 'bg-[#04060f]/60 text-slate-500 hover:text-slate-200 border border-white/5'
              }`}
            >
              {isDone && !isCurrent && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {isCurrent && (
                <span className={`w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse shrink-0`} />
              )}
              <span>{stage.label}</span>
            </button>

            {/* Arrow to next */}
            {stage.next && (
              <div className="flex items-center mx-1">
                <svg className={`w-3.5 h-3.5 ${isCurrent ? 'text-slate-600' : 'text-slate-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
