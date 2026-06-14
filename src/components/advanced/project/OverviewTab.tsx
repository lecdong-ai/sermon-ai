'use client'

import { useState } from 'react'
import { ProjectDetail, PROJECT_STATUS_LABELS, PROJECT_STATUS_ORDER } from '@/lib/advanced/types'
import { useRouter } from 'next/navigation'
import { BookOpen, AlignLeft, Pen, Network, History } from 'lucide-react'
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
            <QuickNavButton
              label="성경 연구"
              icon={BookOpen}
              color="teal"
              onClick={() => router.push(`/advanced/projects/${project.id}?tab=study`)}
            />
            <QuickNavButton
              label="설교 준비"
              icon={AlignLeft}
              color="amber"
              onClick={() => router.push(`/advanced/projects/${project.id}?tab=prep`)}
            />
            <QuickNavButton
              label="설교 작성"
              icon={Pen}
              color="indigo"
              onClick={() => router.push(`/advanced/projects/${project.id}?tab=manuscript`)}
            />
            <QuickNavButton
              label="연결 보기"
              icon={Network}
              color="purple"
              onClick={() => router.push(`/advanced/projects/${project.id}?tab=connections`)}
            />
            <QuickNavButton
              label="버전 기록"
              icon={History}
              color="slate"
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

function QuickNavButton({ label, icon: Icon, color, onClick }: {
  label: string; icon: any; color: string; onClick: () => void
}) {
  const colorMap: Record<string, string> = {
    teal: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20 hover:border-cyan-400/40 hover:bg-cyan-500/15',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20 hover:border-amber-400/40 hover:bg-amber-500/15',
    indigo: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20 hover:border-indigo-400/40 hover:bg-indigo-500/15',
    purple: 'bg-purple-500/10 text-purple-300 border-purple-500/20 hover:border-purple-400/40 hover:bg-purple-500/15',
    slate: 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20 hover:bg-white/10',
  }
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 px-3 py-3.5 rounded-xl border transition-all duration-200 group ${colorMap[color] || colorMap.slate}`}
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-[11px] font-bold leading-tight">{label}</span>
    </button>
  )
}
