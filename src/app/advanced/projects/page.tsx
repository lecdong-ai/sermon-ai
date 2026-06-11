'use client'

import { useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { mockProjects } from '@/lib/advanced/mockData'
import { PROJECT_STATUS_ORDER } from '@/lib/advanced/types'
import { ProjectStatusBadge } from '@/components/advanced/shared'

function ProjectsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('search') || ''

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return mockProjects
    const q = searchQuery.toLowerCase()
    return mockProjects.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.passage.toLowerCase().includes(q) ||
      p.coreMessage.toLowerCase().includes(q) ||
      p.sermonType.toLowerCase().includes(q)
    )
  }, [searchQuery])

  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="adv-section-title">
            {searchQuery ? `"${searchQuery}" 검색 결과` : '설교 프로젝트'}
          </h2>
          <p className="text-sm text-paper-600 mt-1">
            {searchQuery
              ? `총 ${filtered.length}개의 프로젝트`
              : '모든 설교 프로젝트를 관리합니다'}
          </p>
        </div>
        <button
          onClick={() => router.push('/advanced/projects/new')}
          className="text-sm bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors font-medium"
        >
          + 새 프로젝트
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="adv-card">
          <div className="py-12 text-center">
            <p className="text-sm text-paper-400">
              {searchQuery ? `"${searchQuery}"에 대한 검색 결과가 없습니다` : '아직 설교 프로젝트가 없습니다'}
            </p>
            <button onClick={() => router.push('/advanced/projects/new')}
              className="text-xs text-green-600 hover:underline mt-3 inline-block font-medium">
              + 첫 프로젝트 시작하기
            </button>
          </div>
        </div>
      ) : (
      <div className="adv-card divide-y divide-paper-150">
        {filtered.map(project => (
          <div
            key={project.id}
            className="adv-list-item"
            onClick={() => router.push(`/advanced/projects/${project.id}`)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-paper-800">{project.title}</span>
                <ProjectStatusBadge status={project.status} />
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-paper-500">
                <span>{project.passage}</span>
                <span>·</span>
                <span>{project.sermonDate}</span>
                <span>·</span>
                <span>{project.sermonType}</span>
              </div>
              {project.coreMessage && (
                <p className="text-xs text-paper-400 mt-1 line-clamp-1">{project.coreMessage}</p>
              )}
            </div>
            <div className="text-right shrink-0 ml-4">
              <div className="text-xs text-paper-400">v{project.version}</div>
              {project.wordCount > 0 && (
                <div className="text-xs text-paper-400">{project.wordCount.toLocaleString()}자</div>
              )}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="p-6"><p className="text-sm text-paper-400">로딩 중...</p></div>}>
      <ProjectsContent />
    </Suspense>
  )
}
