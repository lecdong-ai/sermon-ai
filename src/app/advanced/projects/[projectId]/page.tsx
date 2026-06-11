'use client'

import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { getMockProjectDetail } from '@/lib/advanced/mockData'
import ProjectHeader from '@/components/advanced/project/ProjectHeader'
import RightPanel from '@/components/advanced/project/RightPanel'
import OverviewTab from '@/components/advanced/project/OverviewTab'
import BibleStudyTab from '@/components/advanced/project/BibleStudyTab'
import PrepTab from '@/components/advanced/project/PrepTab'
import ManuscriptTab from '@/components/advanced/project/ManuscriptTab'
import ConnectionsTab from '@/components/advanced/project/ConnectionsTab'
import VersionsTab from '@/components/advanced/project/VersionsTab'

const TABS = [
  { key: 'overview', label: '개요' },
  { key: 'study', label: '성경 연구' },
  { key: 'prep', label: '설교 준비' },
  { key: 'manuscript', label: '설교 작성' },
  { key: 'connections', label: '연결 보기' },
  { key: 'versions', label: '버전 기록' },
]

const TAB_COLORS: Record<string, string> = {
  overview: 'border-paper-400 text-paper-600',
  study: 'border-teal-500 text-teal-700',
  prep: 'border-amber-500 text-amber-700',
  manuscript: 'border-green-500 text-green-700',
  connections: 'border-slateblue-500 text-slateblue-700',
  versions: 'border-paper-400 text-paper-600',
}

function ProjectContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentTab = searchParams.get('tab') || 'overview'

  const project = getMockProjectDetail(params.projectId as string)

  const handleTabChange = (tab: string) => {
    router.push(`/advanced/projects/${params.projectId}?tab=${tab}`)
  }

  return (
    <div className="flex flex-col h-full">
      <ProjectHeader project={project} />

      <div className="flex flex-1 min-h-0">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {/* Tab Bar */}
          <div className="bg-white border-b border-paper-200 px-6 sticky top-0 z-10">
            <div className="flex max-w-[1440px] mx-auto">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    currentTab === tab.key
                      ? `${TAB_COLORS[tab.key]} border-b-2`
                      : 'text-paper-400 border-transparent hover:text-paper-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-[1440px] mx-auto p-6 animate-fade-in">
            {currentTab === 'overview' && <OverviewTab project={project} />}
            {currentTab === 'study' && <BibleStudyTab project={project} />}
            {currentTab === 'prep' && <PrepTab project={project} />}
            {currentTab === 'manuscript' && <ManuscriptTab project={project} />}
            {currentTab === 'connections' && <ConnectionsTab project={project} />}
            {currentTab === 'versions' && <VersionsTab project={project} />}
          </div>
        </div>

        {/* Right Panel */}
        <RightPanel project={project} activeTab={currentTab} />
      </div>
    </div>
  )
}

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-paper-400">로딩 중...</div>
      </div>
    }>
      <ProjectContent />
    </Suspense>
  )
}
