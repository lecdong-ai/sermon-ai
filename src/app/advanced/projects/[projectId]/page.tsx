'use client'

import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import {
  Eye, BookOpen, AlignLeft, Pen, Network, History
} from 'lucide-react'
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
        <div className="text-sm text-slate-500">로딩 중...</div>
      </div>
    }>
      <ProjectContent />
    </Suspense>
  )
}
