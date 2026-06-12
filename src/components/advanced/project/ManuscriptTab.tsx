'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ProjectDetail } from '@/lib/advanced/types'
import { JOHN_MANUSCRIPT } from '@/lib/advanced/johnManuscriptData'
import type { SermonSection, IllustrationNote, ReferenceNote, JohnManuscriptData } from '@/lib/advanced/johnManuscriptData'
import { AppSectionHeader } from '@/components/advanced/shared'
import ProjectContextRow from '@/components/advanced/shared/ProjectContextRow'
import VersionHistoryDrawer from '@/components/advanced/shared/VersionHistoryDrawer'
import { MOCK_VERSIONS } from '@/lib/advanced/statusData'
import {
  MANUSCRIPT_VERSIONS as JOHN_MANUSCRIPT_VERSIONS,
  RECENT_ACTIVITY as JOHN_RECENT_ACTIVITY,
} from '@/lib/advanced/johnVersionData'
import type { ManuscriptVersion } from '@/lib/advanced/johnVersionData'

interface Props { project: ProjectDetail }

type ViewMode = 'edit' | 'presentation' | 'print'
type WritingStatus = 'empty' | 'draft' | 'revised' | 'complete'

const STATUS_LABELS: Record<WritingStatus, string> = {
  empty: '미작성',
  draft: '초안',
  revised: '수정 필요',
  complete: '완료',
}

const STATUS_COLORS: Record<WritingStatus, string> = {
  empty: 'bg-paper-200 text-paper-400',
  draft: 'bg-blue-100 text-blue-700',
  revised: 'bg-amber-100 text-amber-700',
  complete: 'bg-green-100 text-green-700',
}

const STATUS_DOTS: Record<WritingStatus, string> = {
  empty: 'bg-paper-300',
  draft: 'bg-blue-400',
  revised: 'bg-amber-400',
  complete: 'bg-green-500',
}

const OVERALL_STATUS_LABELS: Record<string, string> = {
  draft: '초안 작성 중',
  first_draft_done: '1차 원고 완료',
  revising: '수정 진행 중',
  final_review: '최종 검토 중',
  complete: '설교 완료',
}

const OVERALL_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-blue-100 text-blue-700',
  first_draft_done: 'bg-green-100 text-green-700',
  revising: 'bg-amber-100 text-amber-700',
  final_review: 'bg-purple-100 text-purple-700',
  complete: 'bg-navy-100 text-navy-700',
}

const EMPTY_GUIDANCE: Record<string, { message: string; hint: string }> = {
  introduction: {
    message: '아직 도입 초안이 정리되지 않았습니다',
    hint: '준비 단계에서 메모한 도입 방향과 중심명제를 바탕으로 말씀을 여는 첫 문장을 적어보세요. 도입은 본문이 오늘의 회중에게 왜 필요한지 그 긴장을 보여주어야 합니다',
  },
  body: {
    message: '아직 본론 원고가 작성되지 않았습니다',
    hint: '준비 단계에서 정리한 대지 구조의 제목과 설명을 바탕으로 각 대지를 풀어가세요. 연구에서 확인한 원어 의미와 주석을 설교 문장으로 자연스럽게 녹여보십시오',
  },
  conclusion: {
    message: '아직 결론 초안이 정리되지 않았습니다',
    hint: '중심명제를 다시 강조하고, 준비 단계에서 정리한 전달 흐름의 마무리 방향을 참고하여 회중을 향한 마지막 초청을 적어보세요',
  },
  application: {
    message: '아직 적용 문장이 정리되지 않았습니다',
    hint: '준비 단계에서 정리한 적용 포인트와 목회적 분별 메모를 바탕으로 각 회중 그룹에 맞는 구체적인 적용을 문장으로 옮겨보세요. 적용은 설교 전체의 실천적 결론입니다',
  },
}

export default function ManuscriptTab({ project }: Props) {
  const router = useRouter()
  const [manuscript, setManuscript] = useState<JohnManuscriptData>(JOHN_MANUSCRIPT)
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('edit')
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [showPrepPanel, setShowPrepPanel] = useState(true)
  const [showVersions, setShowVersions] = useState(false)
  const [presentationSectionIdx, setPresentationSectionIdx] = useState(0)
  const [writingStatus, setWritingStatus] = useState<string>('draft')

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const innerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  const totalWordCount = useMemo(() =>
    manuscript.sections.reduce((sum, s) => sum + s.content.replace(/\s/g, '').length, 0),
    [manuscript.sections],
  )

  const readingTimeMin = useMemo(() =>
    Math.max(1, Math.round(totalWordCount / 300)),
    [totalWordCount],
  )

  /* ─── Per-section writing status ─── */

  const sectionStatuses = useMemo(() => {
    const map: Record<string, WritingStatus> = {}
    manuscript.sections.forEach(s => {
      const len = s.content.replace(/\s/g, '').length
      if (len === 0) map[s.id] = 'empty'
      else if (len < 100) map[s.id] = 'draft'
      else if (len < 300) map[s.id] = 'revised'
      else map[s.id] = 'complete'
    })
    return map
  }, [manuscript.sections])

  const sectionsWithContent = useMemo(() =>
    manuscript.sections.filter(s => s.content.trim().length > 0).length,
    [manuscript.sections],
  )

  const writingProgress = useMemo(() => {
    const statuses = Object.values(sectionStatuses)
    const scores = { empty: 0, draft: 30, revised: 70, complete: 100 }
    const total = statuses.reduce((sum, s) => sum + (scores[s] || 0), 0)
    return Math.round(total / statuses.length)
  }, [sectionStatuses])

  const emptySections = useMemo(() =>
    manuscript.sections.filter(s => sectionStatuses[s.id] === 'empty'),
    [manuscript.sections, sectionStatuses],
  )

  const draftSections = useMemo(() =>
    manuscript.sections.filter(s => sectionStatuses[s.id] === 'draft'),
    [manuscript.sections, sectionStatuses],
  )

  /* ─── Auto-save simulation ─── */

  const triggerSave = useCallback(() => {
    setAutoSaveStatus('unsaved')
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    if (innerTimerRef.current) clearTimeout(innerTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return
      setAutoSaveStatus('saving')
      innerTimerRef.current = setTimeout(() => {
        if (!mountedRef.current) return
        setAutoSaveStatus('saved')
        const now = new Date()
        setLastSaved(now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }))
      }, 600)
    }, 1500)
  }, [])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      if (innerTimerRef.current) clearTimeout(innerTimerRef.current)
    }
  }, [])

  const updateSection = useCallback((id: string, content: string) => {
    setManuscript(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === id ? { ...s, content } : s),
    }))
    triggerSave()
  }, [triggerSave])

  const updateTitle = useCallback((title: string) => {
    setManuscript(prev => ({ ...prev, title }))
    triggerSave()
  }, [triggerSave])

  const updateSummary = useCallback((summary: string) => {
    setManuscript(prev => ({ ...prev, oneSentenceSummary: summary }))
    triggerSave()
  }, [triggerSave])

  const scrollToSection = useCallback((id: string) => {
    setActiveSectionId(id)
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  /* ─── Keyboard navigation for presentation mode ─── */

  useEffect(() => {
    if (viewMode !== 'presentation') return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault()
        setPresentationSectionIdx(i => Math.min(i + 1, manuscript.sections.length - 1))
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        setPresentationSectionIdx(i => Math.max(i - 1, 0))
      } else if (e.key === 'Escape') {
        setViewMode('edit')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [viewMode, manuscript.sections.length])

  /* ─── Presentation Mode ─── */

  if (viewMode === 'presentation') {
    const section = manuscript.sections[presentationSectionIdx]
    return (
      <div className="fixed inset-0 z-50 bg-navy-900 text-white flex flex-col">
        <div className="flex items-center justify-between px-6 py-3 border-b border-navy-800">
          <span className="text-xs text-paper-500">{manuscript.title} — {section.label}</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-paper-400">{presentationSectionIdx + 1} / {manuscript.sections.length}</span>
            <button onClick={() => setViewMode('edit')} className="text-xs text-paper-400 hover:text-white border border-paper-600 px-3 py-1 rounded">
              편집으로 돌아가기
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-serif font-bold mb-6">{section.label}</h2>
            {section.passage && (
              <p className="text-sm text-paper-400 mb-4 italic">{section.passage}</p>
            )}
            <div className="text-lg leading-loose whitespace-pre-wrap font-serif">
              {section.content}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 px-6 py-4 border-t border-navy-800">
          <button
            onClick={() => setPresentationSectionIdx(i => Math.max(i - 1, 0))}
            disabled={presentationSectionIdx === 0}
            className="text-xs text-paper-400 hover:text-white disabled:opacity-30 px-4 py-2 border border-paper-700 rounded"
          >
            ← 이전
          </button>
          <button
            onClick={() => setPresentationSectionIdx(i => Math.min(i + 1, manuscript.sections.length - 1))}
            disabled={presentationSectionIdx === manuscript.sections.length - 1}
            className="text-xs text-paper-400 hover:text-white disabled:opacity-30 px-4 py-2 border border-paper-700 rounded"
          >
            다음 →
          </button>
        </div>
      </div>
    )
  }

  /* ─── Print Mode ─── */

  if (viewMode === 'print') {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white border-b border-paper-200 px-6 py-3 flex items-center justify-between">
          <span className="text-xs text-paper-500">인쇄 미리보기 — {manuscript.title}</span>
          <button onClick={() => setViewMode('edit')} className="text-xs text-paper-500 hover:text-paper-700 border border-paper-200 px-3 py-1 rounded">
            편집으로 돌아가기
          </button>
        </div>
        <div className="max-w-[800px] mx-auto p-12 print:p-0">
          <h1 className="text-2xl font-serif font-bold text-paper-900 mb-2">{manuscript.title}</h1>
          <p className="text-sm text-paper-500 mb-1">{manuscript.passage} · {manuscript.sermonDate} · {manuscript.audience}</p>
          <p className="text-sm text-paper-500 italic mb-8">{manuscript.oneSentenceSummary}</p>
          {manuscript.sections.map(section => (
            <div key={section.id} className="mb-8">
              <h2 className="text-lg font-serif font-bold text-paper-800 mb-2 pb-2 border-b border-paper-200">{section.label}</h2>
              {section.passage && <p className="text-xs text-paper-400 italic mb-2">{section.passage}</p>}
              <div className="text-sm leading-relaxed whitespace-pre-wrap text-paper-700">{section.content}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* ─── Edit Mode ─── */

  return (
    <div className="flex flex-col h-full">
      {/* ─── Project Context ─── */}
      <ProjectContextRow
        project={project}
        currentStage="manuscript"
        stageStatus={{ study: 'done', prep: 'done', manuscript: 'progress' }}
        lastSaved={lastSaved || undefined}
      />

      {/* ─── Writing Context Header ─── */}
      <WritingContextHeader
        project={project}
        manuscript={manuscript}
        autoSaveStatus={autoSaveStatus}
        lastSaved={lastSaved}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onShowPrepToggle={() => setShowPrepPanel(prev => !prev)}
        showPrepPanel={showPrepPanel}
        totalWordCount={totalWordCount}
        readingTimeMin={readingTimeMin}
      onGoToVersions={() => setShowVersions(true)}
      overallStatus={writingStatus}
      writingProgress={writingProgress}
      currentVersion={JOHN_MANUSCRIPT_VERSIONS.find(v => v.isCurrent) || null}
    />

      {/* ─── Version History Drawer ─── */}
      <VersionHistoryDrawer
        isOpen={showVersions}
        onClose={() => setShowVersions(false)}
        versions={MOCK_VERSIONS}
        projectId={project.id}
      />

      {/* ─── Sermon Metadata ─── */}
      <SermonMetaBar
        title={manuscript.title}
        onTitleChange={updateTitle}
        summary={manuscript.oneSentenceSummary}
        onSummaryChange={updateSummary}
        passage={manuscript.passage}
        sermonDate={manuscript.sermonDate}
        audience={manuscript.audience}
        tone={manuscript.tone}
      />

      {/* ─── Main Layout ─── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: Outline Navigator with per-section status */}
        <ManuscriptNavigator
          sections={manuscript.sections}
          sectionStatuses={sectionStatuses}
          activeSectionId={activeSectionId}
          onNavigate={scrollToSection}
          writingProgress={writingProgress}
          emptyCount={emptySections.length}
          draftCount={draftSections.length}
        />

        {/* Center: Sermon Editor */}
        <div className="flex-1 overflow-y-auto scrollbar-thin bg-white">
          <div className="max-w-[720px] mx-auto p-8 space-y-10">
            {manuscript.sections.map(section => (
              <SermonSectionBlock
                key={section.id}
                section={section}
                sectionRef={el => { sectionRefs.current[section.id] = el }}
                isActive={activeSectionId === section.id}
                status={sectionStatuses[section.id]}
                onContentChange={content => updateSection(section.id, content)}
                onActivate={() => setActiveSectionId(section.id)}
              />
            ))}

            {/* Illustration Notes */}
            <IllustrationNotesSection
              notes={manuscript.illustrationNotes}
            />

            {/* Reference Notes */}
            <ReferenceNotesSection
              notes={manuscript.referenceNotes}
            />

            {/* ─── 최근 작업 활동 ─── */}
            <ManuscriptRecentActivity />

            <div className="h-16" />
          </div>
        </div>

        {/* Right: Prep Summary Panel */}
        {showPrepPanel && (
          <PrepSummaryPanel
            manuscript={manuscript}
            onGoToPrep={() => router.push(`/advanced/projects/${project.id}?tab=prep`)}
          />
        )}
      </div>

      {/* ─── Writing Status Bar ─── */}
      <WritingStatusBar
        writingProgress={writingProgress}
        totalWordCount={totalWordCount}
        readingTimeMin={readingTimeMin}
        sections={manuscript.sections}
        sectionStatuses={sectionStatuses}
        warningPoints={manuscript.warningPoints}
        onGoToVersions={() => router.push(`/advanced/projects/${project.id}?tab=versions`)}
        onGoToPrep={() => router.push(`/advanced/projects/${project.id}?tab=prep`)}
      />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ════════════════════════════════════════════════════════════ */

/* ─── Writing Context Header ─── */

function WritingContextHeader({
  project, manuscript, autoSaveStatus, lastSaved, viewMode, onViewModeChange,
  onShowPrepToggle, showPrepPanel, totalWordCount, readingTimeMin, onGoToVersions, overallStatus, writingProgress,
  currentVersion,
}: {
  project: ProjectDetail
  manuscript: JohnManuscriptData
  autoSaveStatus: 'saved' | 'saving' | 'unsaved'
  lastSaved: string | null
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onShowPrepToggle: () => void
  showPrepPanel: boolean
  totalWordCount: number
  readingTimeMin: number
  onGoToVersions: () => void
  overallStatus: string
  writingProgress: number
  currentVersion: ManuscriptVersion | null
}) {
  const saveLabel =
    autoSaveStatus === 'saving' ? '저장 중...' :
    autoSaveStatus === 'saved' ? '자동 저장됨' :
    '저장 대기 중'
  const saveColor =
    autoSaveStatus === 'saving' ? 'text-blue-500' :
    autoSaveStatus === 'saved' ? 'text-green-500' :
    'text-amber-500'

  return (
    <div className="bg-white border-b border-paper-200 px-5 py-2.5 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4 min-w-0">
        <span className="text-sm font-medium text-paper-800 truncate max-w-[200px]">{manuscript.title}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${OVERALL_STATUS_COLORS[overallStatus] || 'bg-paper-100 text-paper-600'}`}>
          {OVERALL_STATUS_LABELS[overallStatus] || overallStatus}
        </span>
        <span className={`text-[10px] ${saveColor} flex items-center gap-1`}>
          {autoSaveStatus === 'saving' && (
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {saveLabel}
          {lastSaved && autoSaveStatus === 'saved' && <span className="text-paper-400"> · {lastSaved}</span>}
        </span>
        <span className="text-[11px] text-paper-400">{manuscript.passage} · {totalWordCount.toLocaleString()}자 · 약 {readingTimeMin}분</span>
        {currentVersion && (
          <span className="text-[10px] px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium whitespace-nowrap">
            기준본: {currentVersion.label} ({JOHN_MANUSCRIPT_VERSIONS.indexOf(currentVersion as any) + 1}개 중)
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onShowPrepToggle}
          className={`text-[11px] px-2.5 py-1 rounded transition-colors ${
            showPrepPanel ? 'bg-green-100 text-green-700' : 'bg-paper-100 text-paper-500'
          }`}
        >
          준비 요약
        </button>
        <button
          onClick={() => onViewModeChange('presentation')}
          className="text-[11px] text-paper-500 hover:text-paper-700 border border-paper-200 hover:border-paper-400 rounded px-2.5 py-1 transition-colors"
        >
          발표용 보기
        </button>
        <button
          onClick={() => onViewModeChange('print')}
          className="text-[11px] text-paper-500 hover:text-paper-700 border border-paper-200 hover:border-paper-400 rounded px-2.5 py-1 transition-colors"
        >
          인쇄용 보기
        </button>
        <button
          onClick={onGoToVersions}
          className="text-[11px] text-paper-500 hover:text-paper-700 border border-paper-200 hover:border-paper-300 rounded px-2.5 py-1 transition-colors"
        >
          버전 기록
        </button>
      </div>
    </div>
  )
}

/* ─── Sermon Meta Bar ─── */

function SermonMetaBar({
  title, onTitleChange, summary, onSummaryChange, passage, sermonDate, audience, tone,
}: {
  title: string
  onTitleChange: (title: string) => void
  summary: string
  onSummaryChange: (summary: string) => void
  passage: string
  sermonDate: string
  audience: string
  tone: string
}) {
  return (
    <div className="bg-paper-50/70 border-b border-paper-200 px-6 py-3 shrink-0">
      <div className="max-w-[720px] mx-auto space-y-2">
        <div className="flex items-center gap-4">
          <input
            value={title}
            onChange={e => onTitleChange(e.target.value)}
            className="flex-1 text-lg font-serif font-bold text-paper-900 bg-transparent border-none outline-none placeholder:text-paper-300"
            placeholder="설교 제목"
          />
          <div className="flex items-center gap-2 text-xs text-paper-500 shrink-0">
            <span className="bg-paper-100 px-2 py-0.5 rounded">{passage}</span>
            <span>{sermonDate}</span>
            <span>·</span>
            <span>{audience}</span>
          </div>
        </div>
        <textarea
          value={summary}
          onChange={e => onSummaryChange(e.target.value)}
          className="w-full text-sm text-paper-500 bg-transparent border-none outline-none resize-none placeholder:text-paper-300 leading-relaxed italic"
          placeholder="이 설교의 핵심을 한 문장으로 요약하세요..."
          rows={1}
        />
      </div>
    </div>
  )
}

/* ─── Manuscript Navigator with per-section status ─── */

function ManuscriptNavigator({
  sections, sectionStatuses, activeSectionId, onNavigate, writingProgress, emptyCount, draftCount,
}: {
  sections: SermonSection[]
  sectionStatuses: Record<string, WritingStatus>
  activeSectionId: string | null
  onNavigate: (id: string) => void
  writingProgress: number
  emptyCount: number
  draftCount: number
}) {
  const iconByType: Record<string, string> = {
    introduction: 'border-l-blue-400',
    body: 'border-l-green-400',
    conclusion: 'border-l-gold-400',
    application: 'border-l-amber-400',
  }

  return (
    <aside className="w-56 border-r border-paper-200 bg-paper-50/50 flex flex-col shrink-0 overflow-y-auto scrollbar-thin">
      <div className="p-4 border-b border-paper-200">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest">원고 구조</span>
          <span className="text-xs font-semibold text-green-600">{writingProgress}%</span>
        </div>
        <div className="adv-progress-bar h-1 mb-2">
          <div className="adv-progress-fill bg-green-500 h-full rounded-full" style={{ width: `${writingProgress}%` }} />
        </div>
        <div className="flex items-center gap-2 text-[10px] text-paper-400">
          {emptyCount > 0 && <span>미작성 {emptyCount}</span>}
          {draftCount > 0 && <span>초안 {draftCount}</span>}
          {emptyCount === 0 && <span>모든 섹션 작성됨</span>}
        </div>
      </div>

      <div className="p-2 space-y-0.5">
        {sections.map(section => {
          const wordCount = section.content.replace(/\s/g, '').length
          const status = sectionStatuses[section.id] || 'empty'
          return (
            <button
              key={section.id}
              onClick={() => onNavigate(section.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors flex items-center gap-2 ${
                activeSectionId === section.id
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'text-paper-600 hover:bg-paper-100'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOTS[status]}`} />
              <span className="flex-1 truncate">{section.label}</span>
              {wordCount > 0 && <span className="text-[9px] text-paper-400">{wordCount}자</span>}
              <span className={`text-[8px] px-1 py-0.5 rounded ${STATUS_COLORS[status]}`}>
                {STATUS_LABELS[status]}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-auto p-4 border-t border-paper-200">
        <p className="text-[10px] text-paper-400 leading-relaxed">
          각 섹션을 선택하여 원고를 작성하세요.<br />
          준비된 구조가 문장을 기다리고 있습니다.
        </p>
      </div>
    </aside>
  )
}

/* ─── Sermon Section Block ─── */

function SermonSectionBlock({
  section, sectionRef, isActive, status, onContentChange, onActivate,
}: {
  section: SermonSection
  sectionRef: (el: HTMLDivElement | null) => void
  isActive: boolean
  status: WritingStatus
  onContentChange: (content: string) => void
  onActivate: () => void
}) {
  const emptyGuide = EMPTY_GUIDANCE[section.type === 'body' ? 'body' : section.type] || EMPTY_GUIDANCE.body
  const sectionColor: Record<string, string> = {
    introduction: 'border-l-blue-400',
    body: 'border-l-green-400',
    conclusion: 'border-l-gold-400',
    application: 'border-l-amber-400',
  }
  const hasContent = section.content.trim().length > 0
  const isEmpty = status === 'empty'

  return (
    <div
      ref={sectionRef}
      className={`border-l-4 ${sectionColor[section.type] || 'border-l-paper-300'} pl-5 ${isActive ? 'bg-green-50/30 -mx-5 px-5 py-4 rounded-lg' : ''}`}
      onClick={onActivate}
    >
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-base font-serif font-bold text-paper-800">{section.label}</h3>
        {section.passage && (
          <span className="text-[11px] text-paper-400 bg-paper-100 px-2 py-0.5 rounded">{section.passage}</span>
        )}
        <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ml-auto ${STATUS_COLORS[status]}`}>
          {STATUS_LABELS[status]}
        </span>
      </div>

      {/* Empty state guidance */}
      {isEmpty && (
        <div className="mb-4 bg-paper-50/70 border border-dashed border-paper-300 rounded-lg p-4 text-center">
          <p className="text-xs text-paper-500 mb-1">{emptyGuide.message}</p>
          <p className="text-[10px] text-paper-400 leading-relaxed">{emptyGuide.hint}</p>
        </div>
      )}

      {/* Research Points & Application Direction (for body sections) */}
      {section.type === 'body' && (
        <div className="mb-4 space-y-2">
          {section.researchPoints && section.researchPoints.length > 0 && (
            <div className="bg-teal-50/60 border border-teal-100/60 rounded-lg p-3">
              <div className="text-[10px] font-semibold text-teal-600 uppercase tracking-wider mb-1">연구 포인트</div>
              {section.researchPoints.map((p, i) => (
                <p key={i} className="text-xs text-teal-700 leading-relaxed">• {p}</p>
              ))}
            </div>
          )}
          {section.applicationDirection && (
            <div className="bg-amber-50/60 border border-amber-100/60 rounded-lg p-3">
              <div className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider mb-1">적용 방향</div>
              <p className="text-xs text-amber-700 leading-relaxed">{section.applicationDirection}</p>
            </div>
          )}
        </div>
      )}

      {/* Application section: show prep application hints */}
      {section.type === 'application' && isEmpty && (
        <div className="mb-4 bg-green-50/60 border border-green-100/60 rounded-lg p-3">
          <div className="text-[10px] font-semibold text-green-600 uppercase tracking-wider mb-1">준비 단계의 적용 포인트</div>
          <ul className="text-xs text-green-700 leading-relaxed space-y-1">
            <li>• 익숙한 본문을 새롭게 듣는 훈련 — 말씀을 현재의 삶에 연결하기</li>
            <li>• 빛을 지식으로만 이해하지 않도록 — 생명으로 연결되게</li>
            <li>• 고난 중에도 그리스도의 빛이 비추고 있음을 선포</li>
          </ul>
        </div>
      )}

      {/* Content Editor */}
      <textarea
        value={section.content}
        onChange={e => onContentChange(e.target.value)}
        className={`w-full min-h-[180px] text-sm text-paper-700 bg-transparent border-none outline-none resize-y leading-loose font-serif ${
          section.type === 'introduction' ? 'italic' : ''
        } ${isEmpty ? 'opacity-60' : ''}`}
        placeholder={
          section.type === 'introduction' ? '도입을 작성하세요 — 회중의 관심을 열고 본문으로 인도하는 첫 문장을 적어보세요...' :
          section.type === 'conclusion' ? '결론을 작성하세요 — 중심명제를 다시 강조하고 회중을 향한 최종 초청을 적어보세요...' :
          section.type === 'application' ? '적용을 작성하세요 — 오늘의 회중에게 이 말씀이 어떻게 구체적으로 다가가야 하는지 문장을 정리해보세요...' :
          '본문 원고를 작성하세요 — 준비 단계의 대지 구조를 바탕으로 설교 문장을 구체화해보세요...'
        }
      />

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-paper-100">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-paper-400">{section.content.replace(/\s/g, '').length}자</span>
          {status === 'revised' && (
            <span className="text-[9px] text-amber-600">수정 검토 권장</span>
          )}
        </div>
        {section.applicationDirection && (
          <span className="text-[9px] text-paper-400 italic">적용 방향: {section.applicationDirection.slice(0, 40)}…</span>
        )}
      </div>
    </div>
  )
}

/* ─── Illustration Notes Section ─── */

function IllustrationNotesSection({ notes }: { notes: IllustrationNote[] }) {
  const statusColors: Record<string, string> = {
    '사용': 'bg-green-100 text-green-700',
    '보류': 'bg-amber-100 text-amber-700',
    '검토중': 'bg-blue-100 text-blue-700',
  }

  return (
    <div className="border-t border-paper-200 pt-8">
      <AppSectionHeader title="예화 메모" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {notes.map(note => (
          <div key={note.id} className="bg-paper-50 rounded-lg border border-paper-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-paper-800">{note.title}</h4>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${statusColors[note.status]}`}>
                {note.status}
              </span>
            </div>
            <p className="text-xs text-paper-600 leading-relaxed">{note.content}</p>
            {note.source && <p className="text-[10px] text-paper-400 mt-1.5 italic">— {note.source}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Reference Notes Section ─── */

function ReferenceNotesSection({ notes }: { notes: ReferenceNote[] }) {
  const categoryColors: Record<string, string> = {
    commentary: 'bg-teal-100 text-teal-700',
    theology: 'bg-gold-100 text-gold-700',
    historical: 'bg-amber-100 text-amber-700',
    pastoral: 'bg-green-100 text-green-700',
    warning: 'bg-red-100 text-red-700',
  }
  const categoryLabels: Record<string, string> = {
    commentary: '주석',
    theology: '신학',
    historical: '역사',
    pastoral: '목회',
    warning: '경고',
  }

  return (
    <div className="border-t border-paper-200 pt-8">
      <AppSectionHeader title="참고 메모" />
      <div className="space-y-2">
        {notes.map(note => (
          <div key={note.id} className="bg-paper-50 rounded-lg border border-paper-200 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${categoryColors[note.category]}`}>
                {categoryLabels[note.category]}
              </span>
              <h4 className="text-xs font-medium text-paper-800">{note.title}</h4>
            </div>
            <p className="text-xs text-paper-600 leading-relaxed">{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Prep Summary Panel ─── */

function PrepSummaryPanel({ manuscript, onGoToPrep }: { manuscript: JohnManuscriptData; onGoToPrep?: () => void }) {
  return (
    <aside className="w-80 border-l border-paper-200 bg-paper-50/50 flex flex-col shrink-0 overflow-y-auto scrollbar-thin">

      {/* Stage Connection Badge */}
      <div className="px-4 py-2.5 bg-green-50/60 border-b border-green-200/60">
        <div className="flex items-center gap-1.5 text-[10px] text-green-700">
          <span className="flex items-center gap-0.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            연구 완료
          </span>
          <svg className="w-3 h-3 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="flex items-center gap-0.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            준비 완료
          </span>
          <svg className="w-3 h-3 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="flex items-center gap-0.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            작성 중
          </span>
        </div>
        <p className="text-[10px] text-green-600 mt-0.5">준비 단계에서 정리한 구조가 원고 작성에 반영됩니다</p>
      </div>

      {/* Core Message (from prep) */}
      <div className="p-4 border-b border-paper-200">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest">중심명제</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">준비에서 설정</span>
        </div>
        <p className="text-sm text-paper-700 leading-relaxed font-serif italic">
          &ldquo;{manuscript.coreMessage}&rdquo;
        </p>
      </div>

      {/* Status Connection: Prep → Manuscript handoff */}
      <div className="p-4 border-b border-paper-200 bg-green-50/20">
        <div className="flex items-center gap-1.5 mb-1.5">
          <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <span className="text-[10px] font-medium text-green-700">준비 단계에서 전달된 구조</span>
        </div>
        <p className="text-[10px] text-green-600 leading-relaxed">
          작성 전달용 준비본(v3)을 기반으로 원고를 작성 중입니다. 중심명제, 대지 구조, 적용 포인트가 준비 단계에서 정리되어 이 원고에 반영되었습니다.
        </p>
      </div>

      {/* Prep → Manuscript connection */}
      <div className="p-4 border-b border-paper-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest">설교 준비 요약</span>
          <button
            onClick={onGoToPrep}
            className="text-[10px] text-green-600 hover:text-green-700 transition-colors"
          >
            준비 다시 보기
          </button>
        </div>

        {/* Outline from prep */}
        <div className="space-y-2 mb-3">
          <span className="text-[10px] text-paper-500 font-medium">대지 구조</span>
          {manuscript.outlinePoints.map((p, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs">
              <span className="w-4 h-4 rounded-full bg-green-100 text-green-700 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <div>
                <span className="font-medium text-paper-700 block">{p.title}</span>
                <span className="text-[10px] text-paper-400">{p.passage}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Purpose from prep */}
        <div className="bg-white rounded-lg border border-paper-200 p-3">
          <span className="text-[10px] font-medium text-paper-500 block mb-0.5">설교 목적</span>
          <p className="text-[11px] text-paper-600 leading-relaxed">
            회중이 예수 그리스도를 추상적 진리가 아닌 생명과 빛의 주로 다시 바라보게 한다
          </p>
        </div>
      </div>

      {/* Application Points from prep */}
      <div className="p-4 border-b border-paper-200">
        <span className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest block mb-2">적용 포인트</span>
        <div className="space-y-2">
          {[
            '익숙한 본문을 새롭게 듣는 훈련 — 말씀을 현재의 삶에 연결하기',
            '빛을 지식으로만 이해하지 않도록 — 생명으로 연결',
            '고난 중에도 그리스도의 빛이 비추고 있음을 선포',
            '새로운 시작을 앞둔 이들에게 "하나님이 당신의 이야기를 시작하신다"는 선포',
          ].map((point, i) => (
            <div key={i} className="flex items-start gap-1.5 bg-blue-50/40 border border-blue-100/40 rounded-lg p-2.5">
              <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0" />
              <span className="text-[11px] text-paper-600 leading-relaxed">{point}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Greek Words */}
      <div className="p-4 border-b border-paper-200">
        <span className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest block mb-2">핵심 원어</span>
        <div className="space-y-2">
          {manuscript.greekWords.map(w => (
            <div key={w.word} className="bg-white rounded-lg border border-paper-200 p-2.5">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-greek text-paper-800">{w.greek}</span>
                <span className="text-[10px] text-paper-500">{w.word}</span>
              </div>
              <p className="text-[10px] text-paper-600">{w.meaning}</p>
              <p className="text-[10px] text-paper-400 mt-0.5 italic">{w.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Prep Insights & Warning Points */}
      <div className="p-4 border-b border-paper-200">
        <span className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest block mb-2">통찰 요약</span>
        <div className="space-y-1.5">
          {manuscript.prepInsights.map((insight, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs text-paper-600">
              <span className="w-1 h-1 rounded-full bg-green-400 mt-1.5 shrink-0" />
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Warning Points */}
      <div className="p-4">
        <span className="text-[10px] font-semibold text-amber-500 uppercase tracking-widest block mb-2">유의 사항</span>
        <div className="space-y-1.5">
          {manuscript.warningPoints.map((warning, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs text-red-600 bg-red-50/60 rounded-lg p-2 border border-red-100/60">
              <svg className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>{warning}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

/* ─── Recent Manuscript Activity ─── */

function ManuscriptRecentActivity() {
  return (
    <div className="border-t border-paper-200 pt-8">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-3.5 h-3.5 text-paper-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest">최근 작업</span>
      </div>
      <div className="bg-paper-50/50 rounded-lg border border-paper-200 divide-y divide-paper-100">
        {JOHN_RECENT_ACTIVITY.map((entry, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5">
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              entry.section === 'manuscript' ? 'bg-green-400' :
              entry.section === 'prep' ? 'bg-amber-400' : 'bg-teal-400'
            }`} />
            <span className="text-[10px] text-paper-400 w-14 shrink-0 font-mono">{entry.time}</span>
            <span className="text-xs text-paper-600 flex-1">{entry.description}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
              entry.section === 'manuscript' ? 'bg-green-100 text-green-700' :
              entry.section === 'prep' ? 'bg-amber-100 text-amber-700' :
              'bg-teal-100 text-teal-700'
            }`}>
              {entry.section === 'manuscript' ? '작성' : entry.section === 'prep' ? '준비' : '연구'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Writing Status Bar ─── */

function WritingStatusBar({
  writingProgress, totalWordCount, readingTimeMin, sections, sectionStatuses, warningPoints,
  onGoToVersions, onGoToPrep,
}: {
  writingProgress: number
  totalWordCount: number
  readingTimeMin: number
  sections: SermonSection[]
  sectionStatuses: Record<string, WritingStatus>
  warningPoints: string[]
  onGoToVersions: () => void
  onGoToPrep: () => void
}) {
  const versionCount = JOHN_MANUSCRIPT_VERSIONS.length
  const emptySections = sections.filter(s => sectionStatuses[s.id] === 'empty')
  const allDone = emptySections.length === 0

  return (
    <div className="bg-white border-t border-paper-200 px-5 py-2.5 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4 text-[11px] text-paper-500">
        <span className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${allDone ? 'bg-green-400' : 'bg-amber-400'}`} />
          집필도 <span className={`font-semibold ${allDone ? 'text-green-600' : 'text-amber-600'}`}>{writingProgress}%</span>
        </span>
        <span>{totalWordCount.toLocaleString()}자</span>
        <span>약 {readingTimeMin}분 분량</span>
        <span className="text-[10px] text-paper-400 bg-paper-100 px-2 py-0.5 rounded">
          원고 이력 {JOHN_MANUSCRIPT_VERSIONS.length}개
        </span>
        {emptySections.length > 0 && (
          <span className="text-amber-600">{emptySections.length}개 섹션 미작성</span>
        )}
        {allDone && (
          <span className="text-green-600 font-medium">원고 정리 완료</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onGoToPrep}
          className="text-[11px] text-paper-500 hover:text-paper-700 border border-paper-200 hover:border-teal-300 rounded-lg px-3 py-1.5 transition-colors"
        >
          ← 설교 준비 다시 보기
        </button>
        <button
          onClick={onGoToVersions}
          className="text-[11px] text-paper-500 hover:text-paper-700 border border-paper-200 hover:border-paper-300 rounded-lg px-3 py-1.5 transition-colors"
        >
          버전 기록
        </button>
      </div>
    </div>
  )
}
