'use client'

import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'
import {
  Eye, BookOpen, AlignLeft, Pen, Network, History, AlertTriangle, Loader2
} from 'lucide-react'
import { useProjectDetail } from '@/lib/project/useProjectDetail'
import { detectCurrentStage } from '@/lib/project/stageChecker'
import { PROJECT_STATUS_ORDER, type ProjectStatus } from '@/lib/project/types'
import ProjectHeader from '@/components/project/ProjectHeader'
import RightPanel from '@/components/project/RightPanel'
import OverviewTab from '@/components/project/OverviewTab'
import BibleStudyTab from '@/components/project/BibleStudyTab'
import PrepTab from '@/components/project/PrepTab'
import ManuscriptTab from '@/components/project/ManuscriptTab'
import ConnectionsTab from '@/components/project/ConnectionsTab'
import VersionsTab from '@/components/project/VersionsTab'
import LinkedInsightBanner from '@/components/project/LinkedInsightBanner'

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
  const [detectedStage, setDetectedStage] = useState<ProjectStatus | null>(null)
  const [syncing, setSyncing] = useState(false)
  const autoSyncAttempted = useRef(false)

  const { project, loading, error, refetch, updateStatus } = useProjectDetail(params.projectId as string)

  // 탐지된 단계가 현재 상태보다 앞서면 자동 동기화 (최초 1회만)
  useEffect(() => {
    if (!project || !detectedStage || syncing || autoSyncAttempted.current) return
    if (detectedStage === project.status) return

    const currentIdx = PROJECT_STATUS_ORDER.indexOf(project.status)
    const detectedIdx = PROJECT_STATUS_ORDER.indexOf(detectedStage)
    if (currentIdx === -1 || detectedIdx === -1) return

    if (detectedIdx > currentIdx) {
      autoSyncAttempted.current = true
      setSyncing(true)
      updateStatus(detectedStage)
      fetch(`/api/sermons/${params.projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: detectedStage }),
      }).then(async res => {
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          if (!json?.error?.includes('찾을 수 없습니다')) {
            updateStatus(project.status)
          }
        }
        setTimeout(() => refetch(), 500)
      }).catch(() => {
        // 네트워크 오류
      }).finally(() => setSyncing(false))
    }
  }, [project?.status, detectedStage])

  // 클라이언트 사이드에서만 단계 감지 (localStorage 접근)
  useEffect(() => {
    if (project && typeof window !== 'undefined') {
      try {
        const detected = detectCurrentStage(params.projectId as string)
        setDetectedStage(detected)
      } catch {}
    }
  }, [project, params.projectId])

  const handleTabChange = (tab: string) => {
    router.push(`/projects/${params.projectId}?tab=${tab}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-4rem)]" style={{ background: 'linear-gradient(180deg, #050816 0%, #0a0e1a 50%, #0d1220 100%)' }}>
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400 font-bold">프로젝트 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-4rem)]" style={{ background: 'linear-gradient(180deg, #050816 0%, #0a0e1a 50%, #0d1220 100%)' }}>
        <div className="text-center max-w-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-300" strokeWidth={2} />
          </div>
          <p className="text-base font-bold text-white">{error || '프로젝트를 찾을 수 없습니다'}</p>
          <button
            onClick={() => router.push('/projects')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[13px] font-bold transition-all">
            프로젝트 목록으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] relative" style={{ background: 'linear-gradient(180deg, #050816 0%, #0a0e1a 50%, #0d1220 100%)' }}>
      <ProjectHeader project={project} />

      <div className="flex flex-1 min-h-0 relative">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {/* Tab Bar */}
          <div className="sticky top-0 z-10 backdrop-blur-md border-b border-white/5" style={{ background: 'rgba(5, 8, 22, 0.85)' }}>
            <div className="max-w-[1440px] mx-auto px-6 py-3">
              <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/5 w-fit overflow-x-auto max-w-full">
                {TABS.map(tab => {
                  const Icon = tab.icon
                  const isActive = currentTab === tab.key
                  return (
                    <button
                      key={tab.key}
                      onClick={() => handleTabChange(tab.key)}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all duration-200 whitespace-nowrap
                        ${isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/25'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                        }
                      `}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} strokeWidth={2.5} />
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
                  router.replace(`/projects/${params.projectId}?${next.toString()}`)
                }}
              />
            )}
            {currentTab === 'overview' && <OverviewTab project={project} onProjectUpdated={refetch} updateStatus={updateStatus} />}
            {currentTab === 'study' && <BibleStudyTab project={project} passages={project.passages} />}
            {currentTab === 'prep' && <PrepTab project={project} />}
            {currentTab === 'manuscript' && <ManuscriptTab project={project} onStatusUpdate={updateStatus} />}
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
      <div
        className="flex items-center justify-center h-full min-h-[calc(100vh-4rem)]"
        style={{ background: 'linear-gradient(180deg, #050816 0%, #0a0e1a 50%, #0d1220 100%)' }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-[12px] text-slate-500 font-bold">로딩 중...</p>
        </div>
      </div>
    }>
      <ProjectContent />
    </Suspense>
  )
}
