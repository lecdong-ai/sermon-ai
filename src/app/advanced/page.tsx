'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  mockTodayProject,
  mockProjects,
  mockRecentPassages,
  mockNotes,
  mockRecommendations,
  mockQuickStats,
  mockGraphData,
} from '@/lib/advanced/mockData'
import { PROJECT_STATUS_ORDER, PROJECT_STATUS_LABELS } from '@/lib/advanced/types'
import { NextStepCard, SaveStatusIndicator, AppSectionHeader, ProjectStatusBadge } from '@/components/advanced/shared'
import { MOCK_SAVE_STATE } from '@/lib/advanced/statusData'

/* ─── Progress Bar ─── */

function ProgressBar({ value, max, color = 'bg-green-500' }: { value: number; max: number; color?: string }) {
  const pct = Math.min(Math.round((value / max) * 100), 100)
  return (
    <div className="adv-progress-bar">
      <div className={`adv-progress-fill ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

/* ─── Main Dashboard ─── */

export default function AdvancedDashboardPage() {
  const router = useRouter()
  const inProgress = useMemo(() => mockProjects.filter(p => !['completed', 'archived'].includes(p.status)), [])
  const completedCount = mockProjects.filter(p => p.status === 'completed').length
  const overallPct = mockProjects.length > 0 ? Math.round((completedCount / mockProjects.length) * 100) : 0

  const todayWordCount = mockTodayProject.wordCount
  const todayTarget = 5000
  const todayPct = Math.min(Math.round((todayWordCount / todayTarget) * 100), 100)

  const daysUntilSermon = useMemo(() => {
    const today = new Date()
    const sermon = new Date(mockTodayProject.sermonDate)
    const diff = Math.ceil((sermon.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }, [])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* ─── Header ─── */}
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-xl font-bold text-paper-900 font-serif">말씀 사역</h1>
              <p className="text-xs text-paper-500 mt-0.5">
                {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                {' '}· 김바울 목사
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-paper-400 bg-paper-100 px-3 py-1.5 rounded-full">
                설교까지 <span className="font-semibold text-paper-700">{daysUntilSermon}일</span>
              </span>
            </div>
          </div>

          {/* ─── Row 1: Hero Today's Work + Quick Stats ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Hero Card: Today's Work */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-paper-200 p-6 ">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-semibold text-green-600 uppercase tracking-wider">진행 중</span>
                </div>
                <div className="flex items-center gap-2">
                  <SaveStatusIndicator status={MOCK_SAVE_STATE.status} lastSavedAt={MOCK_SAVE_STATE.lastSavedAt} minimal />
                  <span className="text-paper-300">·</span>
                  <span className="text-[11px] text-paper-400">v{mockTodayProject.version}</span>
                  <span className="text-paper-300">·</span>
                  <span className="text-[11px] text-paper-400">{todayWordCount.toLocaleString()}자</span>
                </div>
              </div>

              <h2 className="text-lg font-bold text-paper-900 font-serif mb-1">{mockTodayProject.title}</h2>
              <div className="flex items-center gap-2 text-sm text-paper-500 mb-5">
                <span className="font-medium text-paper-700">{mockTodayProject.passage}</span>
                <span className="text-paper-300">·</span>
                <span>{mockTodayProject.sermonDate}</span>
                <span className="text-paper-300">·</span>
                <span>{mockTodayProject.sermonType}</span>
                {mockTodayProject.seriesName && (
                  <>
                    <span className="text-paper-300">·</span>
                    <span className="text-green-600">{mockTodayProject.seriesName}</span>
                  </>
                )}
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-paper-500">원고 진행률</span>
                  <span className="font-semibold text-paper-700">{todayPct}%</span>
                </div>
                <div className="adv-progress-bar h-1.5">
                  <div
                    className="adv-progress-fill bg-green-500 h-full rounded-full transition-all"
                    style={{ width: `${todayPct}%` }}
                  />
                </div>
              </div>

              <div className="bg-paper-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-paper-600 leading-relaxed italic">
                  &ldquo;{mockTodayProject.coreMessage}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => router.push(`/advanced/projects/${mockTodayProject.id}`)}
                  className="text-xs bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors font-medium"
                >
                  프로젝트 계속하기
                </button>
                <button
                  onClick={() => router.push(`/advanced/projects/${mockTodayProject.id}?tab=study`)}
                  className="text-xs border border-paper-200 hover:border-green-300 text-paper-600 hover:text-green-600 px-4 py-2 rounded-md transition-colors"
                >
                  성경 연구
                </button>
                <button
                  onClick={() => router.push(`/advanced/projects/${mockTodayProject.id}?tab=manuscript`)}
                  className="text-xs border border-paper-200 hover:border-green-300 text-paper-600 hover:text-green-600 px-4 py-2 rounded-md transition-colors"
                >
                  원고 작성
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-paper-200 p-5 ">
                <AppSectionHeader title="사역 현황" />
                <div className="space-y-3">
                  <StatRow label="전체 프로젝트" value={mockQuickStats.totalProjects} />
                  <StatRow label="진행 중" value={mockQuickStats.inProgress} highlight="text-amber-600" />
                  <StatRow label="완료" value={mockQuickStats.completed} highlight="text-green-600" />
                  <StatRow label="이달 설교" value={mockQuickStats.thisMonthSermons} />
                </div>
                <div className="mt-4 pt-3 border-t border-paper-200">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-paper-500">누적 원고</span>
                    <span className="font-semibold text-paper-700">{(mockQuickStats.totalWords / 10000).toFixed(1)}만 자</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-paper-500">총 연구</span>
                    <span className="font-semibold text-paper-700">{mockQuickStats.totalStudies}회</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-paper-200 p-5 ">
                <AppSectionHeader title="상태별" />
                <div className="space-y-2.5">
                  {PROJECT_STATUS_ORDER.map(status => {
                    const count = mockProjects.filter(p => p.status === status).length
                    const dotColor: Record<string, string> = {
                      research: 'bg-teal-500',
                      prepare: 'bg-amber-500',
                      writing: 'bg-green-500',
                      review: 'bg-blue-500',
                      completed: 'bg-paper-400',
                      archived: 'bg-paper-400',
                    }
                    return (
                      <div key={status} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${dotColor[status]}`} />
                          <span className="text-paper-600">{PROJECT_STATUS_LABELS[status]}</span>
                        </div>
                        <span className="font-medium text-paper-700">{count}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-3 pt-2.5 border-t border-paper-150">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-paper-500">전체 진행률</span>
                    <span className="font-semibold text-green-600">{overallPct}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Row 2: Projects + Graph + Notes ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Main Column: Projects + Recent Passages */}
            <div className="lg:col-span-2 space-y-5">

              {/* In-Progress Projects */}
              <div className="bg-white rounded-xl border border-paper-200 p-5 ">
                <AppSectionHeader
                  title="진행 중 프로젝트"
                  action={
                    <button
                      onClick={() => router.push('/advanced/projects')}
                      className="text-[11px] text-paper-400 hover:text-green-600 transition-colors"
                    >
                      모두 보기 →
                    </button>
                  }
                />
                {inProgress.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-sm text-paper-400">진행 중인 프로젝트가 없습니다</p>
                    <button onClick={() => router.push('/advanced/projects/new')}
                      className="text-xs text-green-600 hover:underline mt-2 inline-block font-medium">
                      + 새 프로젝트 시작하기
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-paper-150">
                    {inProgress.map(project => {
                      const statusIndex = PROJECT_STATUS_ORDER.indexOf(project.status)
                      const totalSteps = PROJECT_STATUS_ORDER.length - 1
                      const percent = Math.round((statusIndex / totalSteps) * 100)
                      return (
                        <div
                          key={project.id}
                          className="flex items-center gap-4 py-3 hover:bg-paper-50/50 rounded-lg px-2 -mx-2 cursor-pointer transition-colors"
                          onClick={() => router.push(`/advanced/projects/${project.id}`)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-medium text-paper-800 truncate">{project.title}</span>
                              <ProjectStatusBadge status={project.status} />
                            </div>
                            <div className="flex items-center gap-2 text-xs text-paper-500">
                              <span>{project.passage}</span>
                              <span className="text-paper-300">·</span>
                              <span>{project.sermonDate}</span>
                              {project.seriesName && (
                                <>
                                  <span className="text-paper-300">·</span>
                                  <span className="text-green-600">{project.seriesName}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0 w-24">
                            <ProgressBar value={percent} max={100} color={project.status === 'writing' ? 'bg-green-500' : project.status === 'prepare' ? 'bg-amber-500' : 'bg-teal-500'} />
                            <div className="text-[10px] text-paper-400 text-right mt-0.5">{percent}%</div>
                          </div>
                          <span className="text-xs text-paper-400 shrink-0 w-12 text-right">
                            v{project.version}
                          </span>
                          {project.wordCount > 0 && (
                            <span className="text-xs text-paper-400 shrink-0 w-16 text-right">
                              {project.wordCount.toLocaleString()}자
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Recent Passages */}
              <div className="bg-white rounded-xl border border-paper-200 p-5 ">
                <AppSectionHeader
                  title="최근 연구한 본문"
                  action={
                    <button
                      onClick={() => router.push('/advanced/bible')}
                      className="text-[11px] text-paper-400 hover:text-green-600 transition-colors"
                    >
                      본문 연구 →
                    </button>
                  }
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {mockRecentPassages.map(p => (
                    <button
                      key={p.id}
                      onClick={() => router.push('/advanced/bible')}
                      className="flex items-center gap-3 p-3 rounded-lg border border-paper-150 hover:border-green-200 hover:bg-green-50/30 transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-lg bg-paper-100 flex items-center justify-center text-xs font-bold text-paper-500 shrink-0">
                        {p.book.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-paper-800 block truncate">{p.display}</span>
                        <span className="text-[11px] text-paper-400">연구 {p.studyCount}회 · {p.lastStudied}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Graph + Notes */}
            <div className="space-y-5">

              {/* Graph Preview */}
              <div className="bg-white rounded-xl border border-paper-200 p-5 ">
                <AppSectionHeader
                  title="지식 그래프"
                  action={
                    <button
                      onClick={() => router.push('/advanced/graph')}
                      className="text-[11px] text-paper-400 hover:text-green-600 transition-colors"
                    >
                      전체 그래프 →
                    </button>
                  }
                />
                <div className="relative h-[220px] bg-paper-50 rounded-lg overflow-hidden border border-paper-150">
                  <GraphPreviewSVG />
                  <div className="absolute bottom-2 left-3 flex gap-3 text-[9px] text-paper-400">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />설교</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slateblue-500" />본문</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gold-500" />주제</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />시리즈</span>
                  </div>
                </div>
              </div>

              {/* Recent Notes */}
              <div className="bg-white rounded-xl border border-paper-200 p-5 ">
                <AppSectionHeader
                  title="최근 통찰 노트"
                  action={
                    <button
                      onClick={() => router.push('/advanced/notes')}
                      className="text-[11px] text-paper-400 hover:text-green-600 transition-colors"
                    >
                      모두 보기 →
                    </button>
                  }
                />
                <div className="space-y-2.5">
                  {mockNotes.map(note => (
                    <button
                      key={note.id}
                      onClick={() => router.push('/advanced/notes')}
                      className="w-full text-left p-3 rounded-lg border border-paper-150 hover:border-gold-200 hover:bg-gold-50/20 transition-colors"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <NoteTypeBadge type={note.noteType} />
                        <span className="text-[10px] text-paper-400">{note.passage}</span>
                      </div>
                      <span className="text-xs font-medium text-paper-800 block truncate">{note.title}</span>
                      <span className="text-[11px] text-paper-400 line-clamp-1 mt-0.5 block">{note.preview}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ─── Row 3: Recommendations ─── */}
          <div className="bg-white rounded-xl border border-paper-200 p-5 ">
            <AppSectionHeader title="관련 설교 자료 · 재사용 추천" />
            {mockRecommendations.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-xs text-paper-500">아직 충분한 자료가 쌓이지 않았습니다</p>
                <p className="text-[11px] text-paper-400 mt-1">프로젝트와 노트가 축적되면 관련 설교 자료를 추천해 드립니다</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mockRecommendations.map(rec => (
                  <button
                    key={rec.id}
                    onClick={() => router.push(
                      rec.type === 'reuse' ? '/advanced/projects' :
                      rec.type === 'connection' ? '/advanced/notes' :
                      '/advanced/bible'
                    )}
                    className="text-left p-4 rounded-lg border border-paper-200 hover:border-green-200 hover:bg-green-50/20 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${
                        rec.type === 'reuse' ? 'bg-green-100 text-green-700' :
                        rec.type === 'connection' ? 'bg-gold-100 text-gold-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {rec.type === 'reuse' ? '재사용' : rec.type === 'connection' ? '연결' : '추천'}
                      </span>
                      <span className="text-[9px] text-paper-400 ml-auto">
                        {rec.type === 'reuse' ? '프로젝트' : rec.type === 'connection' ? '노트' : '본문'}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-paper-800 mb-1">{rec.title}</h4>
                    <p className="text-xs text-paper-500 leading-relaxed">{rec.description}</p>
                    <div className="flex items-center gap-1 mt-2.5">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={`w-2 h-1.5 rounded-sm ${i < Math.round(rec.relevance / 2) ? 'bg-green-300' : 'bg-paper-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Next Steps Flow ─── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NextStepCard
              title="성경 연구 → 설교 준비"
              description="연구한 원어 분석과 문맥 통찰을 바탕으로 중심명제와 대지를 정리하세요."
              actions={[
                { label: '연구 계속', href: `/advanced/projects/${mockTodayProject.id}?tab=study` },
                { label: '준비로 이동', href: `/advanced/projects/${mockTodayProject.id}?tab=prep`, primary: true },
              ]}
            />
            <NextStepCard
              title="설교 준비 → 설교 작성"
              description="중심명제와 대지를 바탕으로 설교 원고를 작성하세요. 준비 단계에서 정리한 내용이 자동 반영됩니다."
              actions={[
                { label: '준비 계속', href: `/advanced/projects/${mockTodayProject.id}?tab=prep` },
                { label: '원고 작성', href: `/advanced/projects/${mockTodayProject.id}?tab=manuscript`, primary: true },
              ]}
            />
            <NextStepCard
              title="설교 작성 → 아카이브"
              description="완성된 설교를 아카이브에 저장하고, 그래프와 시리즈에 연결하세요."
              actions={[
                { label: '원고 계속', href: `/advanced/projects/${mockTodayProject.id}?tab=manuscript` },
                { label: '아카이브', href: '/advanced/archive' },
                { label: '그래프 보기', href: '/advanced/graph' },
              ]}
            />
          </div>

          {/* Bottom spacer */}
          <div className="h-4" />
        </div>
      </div>
    </div>
  )
}

/* ─── Sub-components ─── */

function StatRow({ label, value, highlight }: { label: string; value: number; highlight?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-paper-500">{label}</span>
      <span className={`text-lg font-bold ${highlight || 'text-paper-800'}`}>{value}</span>
    </div>
  )
}

function NoteTypeBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; color: string; bg: string }> = {
    exegetical: { label: '주석', color: 'text-teal-700', bg: 'bg-teal-100' },
    theological: { label: '신학', color: 'text-gold-700', bg: 'bg-gold-100' },
    pastoral: { label: '목회', color: 'text-green-700', bg: 'bg-green-100' },
  }
  const c = config[type] || { label: type, color: 'text-paper-600', bg: 'bg-paper-100' }
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${c.bg} ${c.color}`}>
      {c.label}
    </span>
  )
}

/* ─── Graph Preview (Deterministic) ─── */

function GraphPreviewSVG() {
  const nodes = mockGraphData.nodes
  const links = mockGraphData.links

  // Deterministic positions based on node type and index
  const positions: Record<string, { x: number; y: number }> = {
    'proj-001': { x: 120, y: 40 },
    'proj-002': { x: 280, y: 50 },
    'proj-004': { x: 200, y: 140 },
    'proj-005': { x: 60, y: 160 },
    'pass-008': { x: 100, y: 90 },
    'pass-005': { x: 260, y: 100 },
    'pass-013': { x: 180, y: 170 },
    'pass-024': { x: 150, y: 110 },
    'pass-ps23': { x: 50, y: 120 },
    'thm-faith': { x: 300, y: 130 },
    'thm-spirit': { x: 140, y: 70 },
    'thm-grace': { x: 220, y: 80 },
    'thm-hope': { x: 80, y: 180 },
    'ser-001': { x: 160, y: 20 },
  }

  return (
    <svg viewBox="0 0 340 200" className="w-full h-full">
      {/* Links */}
      {links.map((link, i) => {
        const s = positions[link.source]
        const t = positions[link.target]
        if (!s || !t) return null
        return (
          <line
            key={i}
            x1={s.x} y1={s.y} x2={t.x} y2={t.y}
            stroke="#E4DED4"
            strokeWidth={Math.max(0.5, link.weight / 4)}
            strokeOpacity={0.6}
          />
        )
      })}
      {/* Nodes */}
      {nodes.map(node => {
        const pos = positions[node.id]
        if (!pos) return null
        const r = node.size / 3
        return (
          <g key={node.id}>
            <circle cx={pos.x} cy={pos.y} r={r} fill={node.color} opacity={0.8} />
            <text
              x={pos.x}
              y={pos.y + r + 10}
              textAnchor="middle"
              fontSize="9.5"
              fill="#6B6358"
              fontFamily="sans-serif"
            >
              {node.label.length > 8 ? node.label.slice(0, 8) + '…' : node.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
