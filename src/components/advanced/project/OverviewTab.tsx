'use client'

import { useState } from 'react'
import { ProjectDetail, PROJECT_STATUS_LABELS, PROJECT_STATUS_ORDER } from '@/lib/advanced/types'
import { useRouter } from 'next/navigation'
import { AppSectionHeader } from '@/components/advanced/shared'
import StageTransitionCard from '@/components/advanced/shared/StageTransitionCard'
import VersionHistoryDrawer from '@/components/advanced/shared/VersionHistoryDrawer'
import RecentChangesPanel from '@/components/advanced/shared/RecentChangesPanel'
import { MOCK_VERSIONS, MOCK_RECENT_CHANGES } from '@/lib/advanced/statusData'

interface Props { project: ProjectDetail }

export default function OverviewTab({ project }: Props) {
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

      <div className="space-y-6">

        {/* ─── 핵심 메시지 히어로 ─── */}
        {project.coreMessage && (
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5">
            <div className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest mb-2">중심명제</div>
            <p className="text-base font-serif text-indigo-200 leading-relaxed">
              &ldquo;{project.coreMessage}&rdquo;
            </p>
          </div>
        )}

        {/* ─── 상태 타임라인 ─── */}
        <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-5">
          <AppSectionHeader title="진행 단계" />
          <div className="mt-3">
            <StageTransitionCard
              currentStatus={project.status}
              onTransition={(to) => router.push(`/advanced/projects/${project.id}?status=${to}`)}
            />
          </div>
        </div>

        {/* ─── 요약 통계 ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <OverviewStatCard
            value={`${progressPercent}%`}
            label="진행률"
            color="text-indigo-400"
            subtitle={PROJECT_STATUS_LABELS[project.status]}
          />
          <OverviewStatCard
            value={`${project.wordCount.toLocaleString()}`}
            label="원고 분량"
            color="text-white"
            subtitle="자"
          />
          <OverviewStatCard
            value={`v${project.version}`}
            label="현재 버전"
            color="text-white"
            subtitle={MOCK_VERSIONS.length > 0 ? `${MOCK_VERSIONS.length}개 기록` : ''}
          />
          <OverviewStatCard
            value={`${project.studyCount}회`}
            label="본문 연구"
            color="text-white"
            subtitle={`${project.outlinePoints.length}개 대지`}
          />
        </div>

        {/* ─── 빠른 이동 + 버전 기록 ─── */}
        <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-4">
          <AppSectionHeader title="작업 영역" />
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <QuickNavButton
              label="성경 연구"
              icon={<BookIcon />}
              color="teal"
              onClick={() => router.push(`/advanced/projects/${project.id}?tab=study`)}
            />
            <QuickNavButton
              label="설교 준비"
              icon={<EditIcon />}
              color="amber"
              onClick={() => router.push(`/advanced/projects/${project.id}?tab=prep`)}
            />
            <QuickNavButton
              label="설교 작성"
              icon={<PencilIcon />}
              color="green"
              onClick={() => router.push(`/advanced/projects/${project.id}?tab=manuscript`)}
            />
            <QuickNavButton
              label="연결 보기"
              icon={<LinkIcon />}
              color="slateblue"
              onClick={() => router.push(`/advanced/projects/${project.id}?tab=connections`)}
            />
            <QuickNavButton
              label="버전 기록"
              icon={<HistoryIcon />}
              color="paper"
              onClick={() => setShowVersions(true)}
            />
          </div>
          <div className="border-t border-white/5 pt-3">
            <AppSectionHeader
              title="최근 변경"
              action={
                <button onClick={() => setShowVersions(true)} className="text-[10px] text-indigo-400 hover:text-indigo-400">
                  전체 버전 보기 →
                </button>
              }
            />
            <RecentChangesPanel changes={MOCK_RECENT_CHANGES} maxItems={4} />
          </div>
        </div>

      {/* ─── 본문 정보 ─── */}
      <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-5">
        <AppSectionHeader title="본문 정보" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-[11px] text-slate-500 block mb-1">본문</span>
            <span className="text-sm text-white bg-white/5 px-3 py-1.5 rounded-xl inline-block">{project.passage}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block mb-1">설교일</span>
            <span className="text-sm text-slate-100">{project.sermonDate}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block mb-1">유형 · 회중</span>
            <span className="text-sm text-slate-100">{project.sermonType} · {project.audience.join(', ')}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block mb-1">시리즈</span>
            <span className="text-sm text-indigo-400">{project.seriesName || '—'}</span>
          </div>
        </div>
      </div>

      {/* ─── 대지 미리보기 ─── */}
      {project.outlinePoints.length > 0 && (
        <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-5">
          <AppSectionHeader
            title="대지 구조"
            action={
              <button onClick={() => router.push(`/advanced/projects/${project.id}?tab=prep`)}
                className="text-[11px] text-slate-500 hover:text-indigo-400 transition-colors">
                편집 →
              </button>
            }
          />
          <div className="space-y-3">
            {project.outlinePoints.map((p, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-[#04060f]/60">
                <span className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white">{p.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-2">{p.content}</p>
                  {p.subPoints.length > 0 && (
                    <div className="mt-1.5 space-y-0.5">
                      {p.subPoints.map((sp, j) => (
                        <div key={j} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <span className="w-1 h-1 rounded-full bg-slate-600" />
                          <span>{sp}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 최근 활동 ─── */}
      <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-5">
        <AppSectionHeader title="최근 활동" />
        <div className="space-y-0">
          {project.recentActivity.slice(0, 5).map((a, i) => (
            <div key={i} className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
              <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                a.type === 'generate' ? 'bg-green-400' :
                a.type === 'edit' ? 'bg-amber-400' :
                a.type === 'save' ? 'bg-blue-400' :
                'bg-paper-400'
              }`} />
              <div className="flex-1 min-w-0">
                <span className="text-xs text-slate-100">{a.description}</span>
              </div>
              <span className="text-[11px] text-slate-500 shrink-0">
                {new Date(a.timestamp).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 관련 설교 ─── */}
      {project.relatedSermons.length > 0 && (
        <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-5">
          <AppSectionHeader
            title="관련 설교"
            action={
              <button onClick={() => router.push(`/advanced/projects/${project.id}?tab=connections`)}
                className="text-[11px] text-slate-500 hover:text-indigo-400 transition-colors">
                모두 보기 →
              </button>
            }
          />
          <div className="space-y-2">
            {project.relatedSermons.map(s => (
              <div
                key={s.id}
                className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
                onClick={() => router.push(`/advanced/projects/${s.id}`)}
              >
                <div>
                  <span className="text-sm text-slate-100">{s.title}</span>
                  <span className="text-xs text-slate-500 ml-2">{s.passage}</span>
                </div>
                <span className="text-xs text-slate-500">{s.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 제목 후보 ─── */}
      {project.titleCandidates.length > 0 && (
        <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-5">
          <AppSectionHeader
            title="제목 후보"
            action={
              <button onClick={() => router.push(`/advanced/projects/${project.id}?tab=prep`)}
                className="text-[11px] text-slate-500 hover:text-indigo-400 transition-colors">
                편집 →
              </button>
            }
          />
          <div className="space-y-1.5">
            {project.titleCandidates.map((t, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
              >
                <span className="text-[10px] text-slate-500 w-4">{i + 1}.</span>
                <span className="text-sm text-slate-100">{t}</span>
                {i === 0 && <span className="text-[10px] text-indigo-400 ml-auto">현재</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  )
}

/* ─── Sub-components ─── */



function OverviewStatCard({ value, label, color, subtitle }: {
  value: string; label: string; color: string; subtitle?: string
}) {
  return (
    <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-4">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-[11px] text-slate-500 mt-1">{label}</div>
      {subtitle && <div className="text-[10px] text-slate-600 mt-0.5">{subtitle}</div>}
    </div>
  )
}

function QuickNavButton({ label, icon, color, onClick }: {
  label: string; icon: React.ReactNode; color: string; onClick: () => void
}) {
  const colorMap: Record<string, string> = {
    teal: 'border-teal-200 text-teal-700 bg-teal-50/50 hover:bg-teal-100',
    amber: 'border-amber-200 text-amber-700 bg-amber-50/50 hover:bg-amber-100',
    green: 'border-indigo-500/20 text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20',
    slateblue: 'border-slateblue-200 text-slateblue-700 bg-slateblue-50/50 hover:bg-slateblue-100',
    paper: 'border-white/5 text-slate-200 bg-[#04060f]/60 hover:bg-white/5',
  }
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-2 rounded-xl border transition-colors flex items-center gap-1.5 ${colorMap[color] || colorMap.paper}`}
    >
      <span className="w-4 h-4">{icon}</span>
      {label}
    </button>
  )
}

function BookIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
}
function EditIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
}
function PencilIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
}
function LinkIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
}
function HistoryIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></svg>
}
