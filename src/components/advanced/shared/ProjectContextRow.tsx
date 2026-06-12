'use client'

import { ProjectDetail } from '@/lib/advanced/types'
import StageFlowIndicator, { type StageKey } from './StageFlowIndicator'

export default function ProjectContextRow({
  project,
  currentStage,
  lastSaved,
  stageStatus,
}: {
  project: ProjectDetail
  currentStage: StageKey
  lastSaved?: string
  stageStatus?: Partial<Record<StageKey, 'empty' | 'done' | 'progress'>>
}) {
  return (
    <div className="flex items-center justify-between py-2 px-1 border-b border-paper-100 bg-paper-50/30 rounded-t-lg">
      <div className="flex items-center gap-3 text-[11px] text-paper-500">
        <span className="font-medium text-paper-700 truncate max-w-[160px]">{project.title}</span>
        <span className="text-paper-300">·</span>
        <span className="text-paper-600">{project.passage}</span>
        {project.seriesName && (
          <>
            <span className="text-paper-300">·</span>
            <span className="text-paper-500">{project.seriesName}</span>
          </>
        )}
        {lastSaved && (
          <>
            <span className="text-paper-300">·</span>
            <span className="text-paper-400">최근 수정: {lastSaved}</span>
          </>
        )}
      </div>
      <StageFlowIndicator
        currentStage={currentStage}
        stageStatus={stageStatus}
        projectId={project.id}
        compact
      />
    </div>
  )
}
