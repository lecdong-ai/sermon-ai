'use client'

import { ProjectDetail } from '@/lib/project/types'
import StageFlowIndicator, { type StageKey } from './StageFlowIndicator'

export default function ProjectContextRow({
  project,
  currentStage,
  lastSaved,
  stageStatus,
}: {
  project: ProjectDetail
  currentStage?: StageKey
  lastSaved?: string
  stageStatus?: Partial<Record<StageKey, 'empty' | 'done' | 'progress'>>
}) {
  // 본문 참조 chip 목록 (다중 본문 → 여러 chip, 단일 본문 → 1개 chip)
  const passageChips = (project.passages && project.passages.length > 0
    ? project.passages
    : project.passage
      ? [{ passage: project.passage } as { passage: string }]
      : []
  )

  return (
    <div className="flex items-center justify-between py-2 px-1 border-b border-white/5 bg-[#04060f]/60 rounded-t-lg">
      <div className="flex items-center gap-2.5 text-[11px] text-slate-400 flex-1 min-w-0">
        {passageChips.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {passageChips.map((p, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/25 text-indigo-200 font-medium whitespace-nowrap"
              >
                {p.passage}
              </span>
            ))}
          </div>
        )}
        {Array.isArray(project.audience) && project.audience.length > 0 && (
          <>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 whitespace-nowrap">회중: {project.audience.join(', ')}</span>
          </>
        )}
        {project.season && (
          <>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 whitespace-nowrap">{project.season}</span>
          </>
        )}
        {project.seriesName && (
          <>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 whitespace-nowrap">{project.seriesName}</span>
          </>
        )}
        {lastSaved && (
          <>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500 whitespace-nowrap">최근 수정: {lastSaved}</span>
          </>
        )}
      </div>
      {currentStage && (
        <StageFlowIndicator
          currentStage={currentStage}
          stageStatus={stageStatus}
          projectId={project.id}
          compact
        />
      )}
    </div>
  )
}
