'use client'

import { useRouter } from 'next/navigation'
import { ProjectDetail, PROJECT_STATUS_ORDER } from '@/lib/advanced/types'
import SaveStatusIndicator from '@/components/advanced/shared/SaveStatusIndicator'
import StatusTimeline from '@/components/advanced/shared/StatusTimeline'
import { ProjectStatusBadge } from '@/components/advanced/shared'
import { MOCK_SAVE_STATE } from '@/lib/advanced/statusData'

interface Props {
  project: ProjectDetail
}

export default function ProjectHeader({ project }: Props) {
  const router = useRouter()
  const statusIndex = PROJECT_STATUS_ORDER.indexOf(project.status)
  const totalSteps = PROJECT_STATUS_ORDER.length - 1
  const progressPercent = Math.round((statusIndex / totalSteps) * 100)

  const passageText = project.passages && project.passages.length > 0
    ? project.passages.map((p) => p.passage).join(', ')
    : project.passage

  return (
    <div className="bg-[#04060f]/60 border-b border-white/5 shrink-0">
      <div className="max-w-[1440px] mx-auto px-6 py-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-2">
          <button onClick={() => router.push('/advanced')} className="hover:text-indigo-400 transition-colors">대시보드</button>
          <span className="text-slate-600">/</span>
          <button onClick={() => router.push('/advanced/projects')} className="hover:text-indigo-400 transition-colors">프로젝트</button>
          <span className="text-slate-600">/</span>
          <span className="text-slate-200 font-medium truncate max-w-[200px]">{project.title}</span>
        </div>

        {/* 상단: 뒤로가기 + 제목 + 상태 + 버튼 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/advanced/projects')}
                className="text-slate-500 hover:text-slate-200 shrink-0 transition-colors p-1 -ml-1"
                title="프로젝트 목록"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-lg font-bold text-white truncate">
                {project.title}
              </h1>
              <ProjectStatusBadge status={project.status} />
            </div>

            {/* 본문 정보 행 */}
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400 flex-wrap">
              <div className="flex items-center gap-1">
                {project.passages && project.passages.length > 0 ? (
                  project.passages.map((p, i) => (
                    <span key={i} className="font-medium text-slate-100 bg-white/5 px-2 py-0.5 rounded">{p.passage}</span>
                  ))
                ) : (
                  <span className="font-medium text-slate-100 bg-white/5 px-2 py-0.5 rounded">{project.passage}</span>
                )}
              </div>
              <span className="text-slate-600">·</span>
              <span>{project.sermonDate}</span>
              <span className="text-slate-600">·</span>
              <span>{project.sermonType}</span>
              <span className="text-slate-600">·</span>
              <span>{Array.isArray(project.audience) ? project.audience.join(', ') : (project.audience || '')}</span>
              {project.seriesName && (
                <>
                  <span className="text-slate-600">·</span>
                  <button
                    onClick={() => project.seriesId && router.push(`/advanced/series/${project.seriesId}`)}
                    className="text-indigo-400 hover:text-indigo-400 hover:underline"
                  >
                    {project.seriesName}
                  </button>
                </>
              )}
            </div>

            {/* 태그 */}
            {project.tagNames.length > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5">
                {project.tagNames.map(t => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 우측: 저장 상태 */}
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <SaveStatusIndicator status={MOCK_SAVE_STATE.status} lastSavedAt={MOCK_SAVE_STATE.lastSavedAt} minimal />
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <StatusTimeline currentStatus={project.status} />
            <div className="adv-progress-bar h-1 mt-1.5">
              <div
                className="adv-progress-fill bg-indigo-600 h-full rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-500 shrink-0">
            v{project.version} · {project.wordCount.toLocaleString()}자
          </span>
        </div>
      </div>
    </div>
  )
}
