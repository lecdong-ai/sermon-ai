'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { VersionDetail } from '@/lib/advanced/types'

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('ko-KR', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function VersionCard({
  version, isSelected, onSelect, onRestore,
}: {
  version: VersionDetail
  isSelected: boolean
  onSelect: () => void
  onRestore: () => void
}) {
  const changedByLabel = version.changedBy === 'user' ? '직접 편집' : version.changedBy === 'ai' ? 'AI 생성' : '자동 저장'
  const sectionLabels: Record<string, string> = {
    study: '성경 연구',
    prep: '설교 준비',
    manuscript: '설교 작성',
    overview: '개요',
  }

  return (
    <div
      className={`p-3 rounded-lg border transition-all cursor-pointer ${
        isSelected
          ? 'border-green-300 bg-green-50/50'
          : version.isCurrent
            ? 'border-green-200 bg-green-50/20'
            : 'border-paper-200 hover:border-paper-300 bg-white'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-paper-800">
              {version.label}
            </span>
            {version.isCurrent && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 shrink-0">현재</span>
            )}
            {version.isPinned && (
              <span className="text-[9px] text-amber-500 shrink-0">★</span>
            )}
          </div>
          <p className="text-[11px] text-paper-500 mt-0.5 leading-relaxed">{version.summary}</p>
          <div className="flex items-center gap-2 mt-1 text-[9px] text-paper-400">
            <span>{formatDateTime(version.createdAt)}</span>
            <span className="text-paper-300">·</span>
            <span>{changedByLabel}</span>
            <span className="text-paper-300">·</span>
            <span>v{version.version}</span>
            {version.wordCount > 0 && (
              <>
                <span className="text-paper-300">·</span>
                <span>{version.wordCount.toLocaleString()}자</span>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {version.sections.map(s => (
              <span key={s} className="text-[8px] px-1.5 py-0.5 rounded bg-paper-100 text-paper-500">
                {sectionLabels[s] || s}
              </span>
            ))}
          </div>
        </div>
      </div>
      {isSelected && !version.isCurrent && (
        <div className="mt-2 pt-2 border-t border-paper-200">
          <button onClick={e => { e.stopPropagation(); onRestore() }}
            className="text-[10px] text-amber-600 hover:text-amber-700 font-medium">
            이 버전으로 복원
          </button>
        </div>
      )}
    </div>
  )
}

export default function VersionHistoryDrawer({
  isOpen,
  onClose,
  versions,
  projectId,
}: {
  isOpen: boolean
  onClose: () => void
  versions: VersionDetail[]
  projectId: string
}) {
  const router = useRouter()
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)
  const [filterSection, setFilterSection] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!filterSection) return versions
    return versions.filter(v => v.sections.includes(filterSection))
  }, [versions, filterSection])

  const selectedVersion = selectedVersionId ? versions.find(v => v.id === selectedVersionId) : null
  const currentVersion = versions.find(v => v.isCurrent)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-paper-800/30" onClick={onClose} />
      <div className="w-[420px] bg-white border-l border-paper-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-paper-200">
          <div>
            <h3 className="text-sm font-bold text-paper-800 font-serif">버전 기록</h3>
            <p className="text-[10px] text-paper-400 mt-0.5">
              총 {versions.length}개 버전 · 현재: {currentVersion?.label || '없음'}
            </p>
          </div>
          <button onClick={onClose} className="text-paper-400 hover:text-paper-600 p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filter */}
        <div className="px-5 py-2.5 border-b border-paper-200 flex gap-1.5">
          <button onClick={() => setFilterSection(null)}
            className={`text-[10px] px-2 py-1 rounded-full transition-colors ${!filterSection ? 'bg-green-100 text-green-700' : 'bg-paper-100 text-paper-500 hover:bg-paper-150'}`}>
            전체
          </button>
          <button onClick={() => setFilterSection('study')}
            className={`text-[10px] px-2 py-1 rounded-full transition-colors ${filterSection === 'study' ? 'bg-green-100 text-green-700' : 'bg-paper-100 text-paper-500 hover:bg-paper-150'}`}>
            연구
          </button>
          <button onClick={() => setFilterSection('prep')}
            className={`text-[10px] px-2 py-1 rounded-full transition-colors ${filterSection === 'prep' ? 'bg-green-100 text-green-700' : 'bg-paper-100 text-paper-500 hover:bg-paper-150'}`}>
            준비
          </button>
          <button onClick={() => setFilterSection('manuscript')}
            className={`text-[10px] px-2 py-1 rounded-full transition-colors ${filterSection === 'manuscript' ? 'bg-green-100 text-green-700' : 'bg-paper-100 text-paper-500 hover:bg-paper-150'}`}>
            작성
          </button>
        </div>

        {/* Version list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-paper-400">해당하는 버전이 없습니다</div>
          ) : (
            filtered.map(v => (
              <VersionCard
                key={v.id}
                version={v}
                isSelected={selectedVersionId === v.id}
                onSelect={() => setSelectedVersionId(v.id === selectedVersionId ? null : v.id)}
                onRestore={() => {
                  router.push(`/advanced/projects/${projectId}`)
                  onClose()
                }}
              />
            ))
          )}
        </div>

        {/* Selected version detail */}
        {selectedVersion && (
          <div className="border-t border-paper-200 p-4 space-y-2">
            <div className="text-[10px] font-semibold text-paper-400 uppercase tracking-wider">선택한 버전</div>
            <p className="text-xs text-paper-700 leading-relaxed">{selectedVersion.summary}</p>
            <div className="flex gap-2">
              {selectedVersion.isCurrent ? (
                <span className="text-[10px] text-green-600">현재 작업 중인 버전입니다</span>
              ) : (
                <button
                  onClick={() => router.push(`/advanced/projects/${projectId}`)}
                  className="text-[10px] bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-md transition-colors"
                >
                  이 버전으로 복원
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
