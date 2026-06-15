'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProjectDetail, PROJECT_STATUS_ORDER } from '@/lib/advanced/types'
import SaveStatusIndicator from '@/components/advanced/shared/SaveStatusIndicator'
import VersionHistoryDrawer from '@/components/advanced/shared/VersionHistoryDrawer'
import RecentChangesPanel from '@/components/advanced/shared/RecentChangesPanel'
import StageTransitionCard from '@/components/advanced/shared/StageTransitionCard'
import StatusTimeline from '@/components/advanced/shared/StatusTimeline'
import { MOCK_SAVE_STATE, MOCK_VERSIONS, MOCK_RECENT_CHANGES } from '@/lib/advanced/statusData'

interface Props {
  project: ProjectDetail
  activeTab: string
}

export default function RightPanel({ project, activeTab }: Props) {
  const router = useRouter()
  const [showVersions, setShowVersions] = useState(false)
  const statusIndex = PROJECT_STATUS_ORDER.indexOf(project.status)
  const totalSteps = PROJECT_STATUS_ORDER.length - 1
  const progressPercent = Math.round((statusIndex / totalSteps) * 100)

  return (
    <>
      <VersionHistoryDrawer
        isOpen={showVersions}
        onClose={() => setShowVersions(false)}
        versions={MOCK_VERSIONS}
        projectId={project.id}
      />

      <aside className="w-72 border-l border-white/5 bg-[#04060f]/60 flex flex-col shrink-0 overflow-y-auto scrollbar-thin">

        {/* 프로젝트 정보 */}
        <div className="p-4 border-b border-white/5">
          <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">프로젝트 정보</h3>
          <div className="space-y-2">
            {project.passages && project.passages.length > 0 ? (
              <div className="flex items-start gap-2">
                <span className="text-xs text-slate-500 w-14 shrink-0">본문</span>
                <div className="flex flex-wrap gap-1">
                  {project.passages.map((p, i) => (
                    <span key={i} className="text-xs text-slate-100 bg-white/5 px-2 py-0.5 rounded">{p.passage}</span>
                  ))}
                </div>
              </div>
            ) : (
              <InfoRow label="본문" value={project.passage} />
            )}
            <InfoRow label="설교일" value={project.sermonDate} />
            <InfoRow label="유형" value={project.sermonType} />
            <InfoRow label="회중" value={project.audience.join(', ')} />
            {project.season && <InfoRow label="절기" value={project.season} />}
            {project.preacher && <InfoRow label="설교자" value={project.preacher} />}
            {project.seriesName && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-14 shrink-0">시리즈</span>
                <span
                  className="text-xs text-slate-100 cursor-pointer hover:text-indigo-400 transition-colors"
                  onClick={() => router.push(`/advanced/series/${project.seriesId}`)}
                >
                  {project.seriesName} →
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 w-14 shrink-0">저장</span>
              <SaveStatusIndicator status={MOCK_SAVE_STATE.status} lastSavedAt={MOCK_SAVE_STATE.lastSavedAt} />
            </div>
          </div>
        </div>

        {/* 상태 타임라인 */}
        <div className="p-4 border-b border-white/5">
          <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">진행 단계</h3>
          <StatusTimeline currentStatus={project.status} />
          <div className="mt-2">
            <div className="adv-progress-bar h-1.5">
              <div className="adv-progress-fill bg-indigo-600 h-full rounded-full" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

        {/* 다음 단계 전환 */}
        <div className="p-4 border-b border-white/5">
          <StageTransitionCard
            currentStatus={project.status}
            onTransition={(to) => router.push(`/advanced/projects/${project.id}?status=${to}`)}
          />
        </div>

        {/* 통계 */}
        <div className="p-4 border-b border-white/5">
          <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">통계</h3>
          <div className="grid grid-cols-2 gap-2">
            <StatItem value={project.wordCount.toLocaleString()} label="글자수" />
            <StatItem value={`v${project.version}`} label="버전" />
            <StatItem value={`${project.studyCount}회`} label="연구" />
            <StatItem value={`${project.outlinePoints.length}개`} label="대지" />
          </div>
        </div>

        {/* 버전 기록 */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">버전 기록</h3>
            <button
              onClick={() => setShowVersions(true)}
              className="text-[10px] text-indigo-400 hover:text-indigo-400"
            >
              전체 보기 ({MOCK_VERSIONS.length}) →
            </button>
          </div>
          <RecentChangesPanel changes={MOCK_RECENT_CHANGES} maxItems={3} />
        </div>

        {/* 주제 / 태그 */}
        {project.themeNames.length > 0 && (
          <div className="p-4 border-b border-white/5">
            <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">주제</h3>
            <div className="flex flex-wrap gap-1.5">
              {project.themeNames.map(t => (
                <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {project.tagNames.length > 0 && (
          <div className="p-4 border-b border-white/5">
            <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">태그</h3>
            <div className="flex flex-wrap gap-1.5">
              {project.tagNames.map(t => (
                <span key={t} className="text-[11px] px-2 py-0.5 rounded-xl bg-white/5 text-slate-200">
                  #{t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 관련 자료 연결 */}
        <div className="p-4 border-b border-white/5">
          <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">관련 자료</h3>
          <div className="space-y-1">
            <QuickAction label="연결된 노트 보기" onClick={() => router.push('/advanced/notes')} />
            <QuickAction label="유사 설교 검색" onClick={() => router.push('/advanced/archive')} />
            {project.seriesName && (
              <QuickAction label="시리즈로 돌아가기" onClick={() => router.push(`/advanced/series/${project.seriesId}`)} />
            )}
          </div>
        </div>

        {/* 빠른 작업 */}
        <div className="p-4">
          <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">빠른 작업</h3>
          <div className="space-y-1">
            <QuickAction label="그래프로 보기" onClick={() => router.push(`/advanced/projects/${project.id}?tab=connections`)} />
            <QuickAction label="아카이브 검색" onClick={() => router.push('/advanced/archive')} />
          </div>
        </div>
      </aside>
    </>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 w-14 shrink-0">{label}</span>
      <span className="text-xs text-slate-100 truncate">{value}</span>
    </div>
  )
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-2.5 text-center">
      <div className="text-sm font-bold text-white">{value}</div>
      <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
    </div>
  )
}

function QuickAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full text-left text-xs text-slate-200 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl px-3 py-2 transition-colors">
      {label}
    </button>
  )
}
