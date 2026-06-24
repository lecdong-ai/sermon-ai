'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProjectDetail, PROJECT_STATUS_LABELS, PROJECT_STATUS_ORDER, type ProjectStatus } from '@/lib/advanced/types'
import SaveStatusIndicator from '@/components/advanced/shared/SaveStatusIndicator'
import VersionHistoryDrawer from '@/components/advanced/shared/VersionHistoryDrawer'
import RecentChangesPanel from '@/components/advanced/shared/RecentChangesPanel'
import StatusTimeline from '@/components/advanced/shared/StatusTimeline'
import { MOCK_SAVE_STATE, MOCK_VERSIONS, MOCK_RECENT_CHANGES } from '@/lib/advanced/statusData'
import { NOTE_TYPE_LABELS, NOTE_TYPE_DOTS, type NoteEntry } from '@/lib/advanced/notesData'

interface Props {
  project: ProjectDetail
  activeTab: string
  onProjectUpdated?: () => void
  updateStatus?: (status: ProjectStatus) => void
}

export default function RightPanel({ project, activeTab, onProjectUpdated, updateStatus }: Props) {
  const router = useRouter()
  const [showVersions, setShowVersions] = useState(false)
  const [linkedInsights, setLinkedInsights] = useState<NoteEntry[]>([])
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
  const statusIndex = PROJECT_STATUS_ORDER.indexOf(project.status)
  const totalSteps = PROJECT_STATUS_ORDER.length - 1
  const progressPercent = Math.round((statusIndex / totalSteps) * 100)

  const showToast = (kind: 'success' | 'error', text: string) => {
    setToast({ kind, text })
    setTimeout(() => setToast(null), 2500)
  }

  useEffect(() => {
    let ac: AbortController | null = null
    ac = new AbortController()
    fetch('/api/insights', { signal: ac.signal })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setLinkedInsights((json.data || []).filter((n: NoteEntry) => (n.projectIds || []).includes(project.id)))
        }
      })
      .catch(() => {})
    return () => { ac?.abort() }
  }, [project.id])

  const handleUnlink = async (insightId: string) => {
    const insight = linkedInsights.find((n) => n.id === insightId)
    if (!insight) return
    setUnlinkingId(insightId)
    const next = (insight.projectIds || []).filter((x) => x !== project.id)
    setLinkedInsights((prev) => prev.filter((n) => n.id !== insightId))
    try {
      const res = await fetch(`/api/insights/${insightId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectIds: next }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setLinkedInsights((prev) => [...prev, insight])
    } finally {
      setUnlinkingId(null)
    }
  }

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
            <InfoRow label="회중" value={Array.isArray(project.audience) ? project.audience.join(', ') : (project.audience || '')} />
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

        {/* 연결된 통찰 (양방향) */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">연결된 통찰</h3>
            <span className="text-[10px] text-slate-600 font-bold">{linkedInsights.length}개</span>
          </div>
          {linkedInsights.length === 0 ? (
            <p className="text-[10px] text-slate-600 italic">아직 연결된 통찰이 없습니다</p>
          ) : (
            <div className="space-y-1.5">
              {linkedInsights.map((n) => (
                <div key={n.id} className="group bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-2 transition-colors">
                  <div className="flex items-start gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${NOTE_TYPE_DOTS[n.type]}`} />
                    <button
                      onClick={() => router.push(`/advanced/notes?selected=${n.id}`)}
                      className="flex-1 text-left min-w-0"
                    >
                      <p className="text-[11px] font-bold text-slate-200 group-hover:text-indigo-300 line-clamp-2 leading-snug">{n.title}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5 font-medium">
                        {NOTE_TYPE_LABELS[n.type]}{n.starred && ' · ★'}
                      </p>
                    </button>
                    <button
                      onClick={() => handleUnlink(n.id)}
                      disabled={unlinkingId === n.id}
                      className="text-slate-500 hover:text-red-400 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30"
                      title="연결 해제"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => router.push(`/advanced/notes`)}
            className="w-full mt-2 text-[10px] text-indigo-400 hover:text-indigo-300 font-bold text-left"
          >
            + 통찰 기록하기 →
          </button>
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

      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl border backdrop-blur-md text-xs font-bold transition-all ${
          toast.kind === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          {toast.text}
        </div>
      )}
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
