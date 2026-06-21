'use client'

import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import {
  Eye, BookOpen, AlignLeft, Pen, Network, History, Zap, X
} from 'lucide-react'
import { useProjectDetail } from '@/lib/advanced/useProjectDetail'
import { detectCurrentStage } from '@/lib/advanced/stageChecker'
import { PROJECT_STATUS_LABELS, type ProjectStatus } from '@/lib/advanced/types'
import ProjectHeader from '@/components/advanced/project/ProjectHeader'
import RightPanel from '@/components/advanced/project/RightPanel'
import OverviewTab from '@/components/advanced/project/OverviewTab'
import BibleStudyTab from '@/components/advanced/project/BibleStudyTab'
import PrepTab from '@/components/advanced/project/PrepTab'
import ManuscriptTab from '@/components/advanced/project/ManuscriptTab'
import ConnectionsTab from '@/components/advanced/project/ConnectionsTab'
import VersionsTab from '@/components/advanced/project/VersionsTab'
import LinkedInsightBanner from '@/components/advanced/project/LinkedInsightBanner'

const TABS = [
  { key: 'overview', label: '개요', icon: Eye },
  { key: 'study', label: '성경 연구', icon: BookOpen },
  { key: 'prep', label: '설교 준비', icon: AlignLeft },
  { key: 'manuscript', label: '설교 작성', icon: Pen },
  { key: 'connections', label: '연결 보기', icon: Network },
  { key: 'versions', label: '버전 기록', icon: History },
]

function ProjectContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentTab = searchParams.get('tab') || 'overview'
  const insightParam = searchParams.get('insight')
  const [showInsightBanner, setShowInsightBanner] = useState(!!insightParam)
  const [dismissedSync, setDismissedSync] = useState(false)
  const [detectedStage, setDetectedStage] = useState<ProjectStatus | null>(null)
  const [syncing, setSyncing] = useState(false)

  const { project, loading, error, refetch, updateStatus } = useProjectDetail(params.projectId as string)

  useEffect(() => {
    if (project) {
      const detected = detectCurrentStage(params.projectId as string)
      setDetectedStage(detected)
    }
  }, [project, params.projectId])

  useEffect(() => {
    if (dismissedSync) {
      const t = setTimeout(() => setDismissedSync(false), 8000)
      return () => clearTimeout(t)
    }
  }, [dismissedSync])

  const handleStageSync = async () => {
    if (!detectedStage || syncing || !project || detectedStage === project.status) return
    const prevStatus = project.status
    setSyncing(true)
    updateStatus(detectedStage)
    try {
      const res = await fetch(`/api/sermons/${params.projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: detectedStage }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'API 오류')
      // 백그라운드에서 최신 데이터 동기화 (지연 실행으로 충돌 방지)
      setTimeout(() => refetch(), 500)
    } catch {
      updateStatus(prevStatus)
    }
    setSyncing(false)
    setDismissedSync(true)
  }

  const showSyncBanner = project && detectedStage &&
    detectedStage !== project.status &&
    detectedStage !== 'research' &&
    !dismissedSync

  const handleTabChange = (tab: string) => {
    router.push(`/advanced/projects/${params.projectId}?tab=${tab}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400 font-bold">프로젝트 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-sm">
          <p className="text-sm text-red-400 font-bold mb-2">{error || '프로젝트를 찾을 수 없습니다'}</p>
          <button
            onClick={() => router.push('/advanced/projects')}
            className="text-xs px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors">
            프로젝트 목록으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <ProjectHeader project={project} />

      <div className="flex flex-1 min-h-0">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {/* 스마트 싱크 배너 */}
          {showSyncBanner && (
            <div className="max-w-[1440px] mx-auto px-6 pt-3">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 animate-fade-in">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="text-[11px] text-amber-200 font-medium leading-relaxed flex-1">
                  이 프로젝트의 내용이 현재 단계(&apos;<span className="font-bold">{PROJECT_STATUS_LABELS[project.status]}</span>&apos;)보다 앞서 있습니다.
                  <span className="text-amber-300/70 ml-1">탐지된 단계: <span className="font-bold text-amber-200">{PROJECT_STATUS_LABELS[detectedStage]}</span></span>
                </p>
                <button
                  onClick={handleStageSync}
                  disabled={syncing}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-[10px] font-bold transition-all disabled:opacity-50"
                >
                  {syncing ? (
                    <span className="w-3 h-3 rounded-full border-2 border-current/30 border-t-current animate-spin" />
                  ) : (
                    <Zap className="w-3 h-3" />
                  )}
                  {syncing ? '동기화 중...' : `${PROJECT_STATUS_LABELS[detectedStage]}(으)로 업데이트`}
                </button>
                <button
                  onClick={() => setDismissedSync(true)}
                  className="p-1 rounded hover:bg-white/5 text-amber-400/50 hover:text-amber-300 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Tab Bar */}
          <div className="sticky top-0 z-10 bg-[#04060f]/80 backdrop-blur-md border-b border-white/5">
            <div className="max-w-[1440px] mx-auto px-6 py-3">
              <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/5 w-fit">
                {TABS.map(tab => {
                  const Icon = tab.icon
                  const isActive = currentTab === tab.key
                  return (
                    <button
                      key={tab.key}
                      onClick={() => handleTabChange(tab.key)}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200
                        ${isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/25'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                        }
                      `}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-[1440px] mx-auto p-6 animate-fade-in">
            {currentTab === 'manuscript' && showInsightBanner && (
              <LinkedInsightBanner
                insightId={insightParam}
                onClose={() => {
                  setShowInsightBanner(false)
                  const next = new URLSearchParams(searchParams.toString())
                  next.delete('insight')
                  router.replace(`/advanced/projects/${params.projectId}?${next.toString()}`)
                }}
              />
            )}
            {currentTab === 'overview' && <OverviewTab project={project} onProjectUpdated={refetch} updateStatus={updateStatus} />}
            {currentTab === 'study' && <BibleStudyTab project={project} passages={project.passages} />}
            {currentTab === 'prep' && <PrepTab project={project} />}
            {currentTab === 'manuscript' && <ManuscriptTab project={project} />}
            {currentTab === 'connections' && <ConnectionsTab project={project} />}
            {currentTab === 'versions' && <VersionsTab project={project} />}
          </div>
        </div>

        {/* Right Panel */}
        <RightPanel project={project} activeTab={currentTab} onProjectUpdated={refetch} updateStatus={updateStatus} />
      </div>
    </div>
  )
}

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-slate-500">로딩 중...</div>
      </div>
    }>
      <ProjectContent />
    </Suspense>
  )
}
