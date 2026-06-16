'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
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
import { getStorageItem, setStorageItem } from '@/lib/storage'

interface Props { project: ProjectDetail }

type ViewMode = 'edit' | 'preview' | 'presentation' | 'print'
type WritingStatus = 'empty' | 'draft' | 'revised' | 'complete'

const STATUS_LABELS: Record<WritingStatus, string> = {
  empty: '미작성',
  draft: '초안',
  revised: '수정 필요',
  complete: '완료',
}

const STATUS_COLORS: Record<WritingStatus, string> = {
  empty: 'bg-white/5 text-slate-500',
  draft: 'bg-blue-500/10 text-blue-300',
  revised: 'bg-amber-500/10 text-amber-300',
  complete: 'bg-indigo-500/10 text-indigo-300',
}

const STATUS_DOTS: Record<WritingStatus, string> = {
  empty: 'bg-white/10',
  draft: 'bg-blue-400',
  revised: 'bg-amber-400',
  complete: 'bg-indigo-600',
}

const OVERALL_STATUS_LABELS: Record<string, string> = {
  draft: '초안 작성 중',
  first_draft_done: '1차 원고 완료',
  revising: '수정 진행 중',
  final_review: '최종 검토 중',
  complete: '설교 완료',
}

const OVERALL_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-blue-500/10 text-blue-300',
  first_draft_done: 'bg-indigo-500/10 text-indigo-300',
  revising: 'bg-amber-500/10 text-amber-300',
  final_review: 'bg-purple-500/10 text-purple-300',
  complete: 'bg-indigo-500/10 text-indigo-300',
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
  const [saveError, setSaveError] = useState<string | null>(null)
  const [presentationSectionIdx, setPresentationSectionIdx] = useState(0)
  const [writingStatus, setWritingStatus] = useState<string>('draft')

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const innerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)
  const manuscriptLoadedRef = useRef(false)
  const manualSaveTriggerRef = useRef(0)

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

  /* ─── Load saved manuscript on mount ─── */

  useEffect(() => {
    const saved = getStorageItem<any | null>(`manuscript_${project.id}`, null)
    if (saved && saved.title) {
      const { _savedAt, ...manuscriptData } = saved
      setManuscript(manuscriptData as JohnManuscriptData)
      if (_savedAt) {
        setLastSaved(new Date(_savedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }))
      }
    }
    manuscriptLoadedRef.current = true
  }, [project.id])

  /* ─── Auto-save (debounced, also persists to localStorage) ─── */

  const doSave = useCallback(async (manuscriptToSave: JohnManuscriptData) => {
    setAutoSaveStatus('saving')
    setSaveError(null)
    // Save to localStorage
    setStorageItem(`manuscript_${project.id}`, { ...manuscriptToSave, _savedAt: Date.now() })
    // Save to server
    try {
      const res = await fetch('/api/sermons/' + project.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manuscript: JSON.stringify(manuscriptToSave) }),
      })
      if (!res.ok) throw new Error('서버 저장 실패')
      setAutoSaveStatus('saved')
      const now = new Date()
      setLastSaved(now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }))
    } catch (e: any) {
      setAutoSaveStatus('saved')
      setSaveError(null)
      // localStorage save succeeded even if server fails — don't alarm user
    }
  }, [project.id])

  const triggerSave = useCallback(() => {
    setAutoSaveStatus('unsaved')
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    if (innerTimerRef.current) clearTimeout(innerTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return
      doSave(manuscript)
    }, 1500)
  }, [doSave, manuscript])

  const manualSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    if (innerTimerRef.current) clearTimeout(innerTimerRef.current)
    manualSaveTriggerRef.current += 1
    doSave(manuscript)
  }, [doSave, manuscript])

  useEffect(() => {
    mountedRef.current = true
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        manualSave()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      mountedRef.current = false
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      if (innerTimerRef.current) clearTimeout(innerTimerRef.current)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [manualSave])

  // Persist to localStorage whenever manuscript changes (after initial load)
  useEffect(() => {
    if (!manuscriptLoadedRef.current) return
    const timer = setTimeout(() => {
      setStorageItem(`manuscript_${project.id}`, { ...manuscript, _savedAt: Date.now() })
    }, 800)
    return () => clearTimeout(timer)
  }, [manuscript, project.id])

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

  const handleAiGenerate = useCallback(async (sectionType: string): Promise<string> => {
    const section = manuscript.sections.find(s => s.type === sectionType)
    if (!section) return ''

    const typeMap: Record<string, string> = {
      introduction: 'manuscript-introduction',
      conclusion: 'manuscript-conclusion',
      application: 'manuscript-application',
    }
    const apiType = typeMap[sectionType]
    if (!apiType) return ''

    const payload: any = {
      passage: project.passage,
      coreMessage: manuscript.coreMessage,
      sermonTitle: manuscript.title,
      sermonPurpose: manuscript.oneSentenceSummary,
    }

    if (sectionType === 'introduction') {
      payload.passageStructure = manuscript.outlinePoints.map(o => o.title).join(' → ')
      payload.deliveryIntro = ''
    } else if (sectionType === 'conclusion') {
      payload.outlines = manuscript.outlinePoints.map(o => ({ title: o.title, description: o.content }))
      payload.applicationPoints = []
      payload.expectedResponse = ''
      payload.deliveryConclusion = ''
    } else if (sectionType === 'application') {
      payload.outlines = manuscript.outlinePoints.map(o => ({ title: o.title, description: o.content }))
      payload.applicationPoints = (section.researchPoints || []).map((p, i) => ({
        id: `app-${i}`, point: p, audienceTag: '', pastoralNote: '',
      }))
    }

    const res = await fetch('/api/advanced/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: apiType, data: payload }),
    })
    const json = await res.json()
    if (json.success) {
      return json.data.output
    }
    return ''
  }, [project, manuscript])

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

  /* ─── Preview Mode ─── */

  if (viewMode === 'preview') {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-[#04060f]/60 border-b border-white/5 px-5 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('edit')}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              편집으로 돌아가기
            </button>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-400 font-medium">{manuscript.title}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span>{totalWordCount.toLocaleString()}자</span>
            <span>· 약 {readingTimeMin}분</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-[720px] mx-auto p-10">
            <h1 className="text-2xl font-serif font-bold text-white mb-2">{manuscript.title}</h1>
            <p className="text-sm text-slate-400 mb-1">{manuscript.passage} · {manuscript.sermonDate}</p>
            <p className="text-sm text-slate-400 italic mb-10">{manuscript.oneSentenceSummary}</p>

            {manuscript.sections.filter(s => s.content.trim().length > 0).map((section, i) => {
              const sectionStyles: Record<string, { label: string; dot: string }> = {
                introduction: { label: '도입', dot: 'bg-blue-400' },
                body: { label: '본론', dot: 'bg-indigo-400' },
                conclusion: { label: '결론', dot: 'bg-amber-400' },
                application: { label: '적용', dot: 'bg-green-400' },
              }
              const style = sectionStyles[section.type] || { label: '', dot: 'bg-slate-400' }
              return (
                <div key={section.id} className="mb-10">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
                    <span className={'w-2 h-2 rounded-full ' + style.dot} />
                    <h2 className="text-lg font-serif font-bold text-white">{section.label}</h2>
                    <span className="text-[9px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">{style.label}</span>
                    <span className="text-[10px] text-slate-600 ml-auto">{section.content.replace(/\s/g, '').length}자</span>
                  </div>
                  {section.passage && (
                    <p className="text-xs text-slate-500 italic mb-3">{section.passage}</p>
                  )}
                  <div className={'text-sm leading-loose whitespace-pre-wrap font-serif ' + (
                    section.type === 'introduction' ? 'text-slate-100 italic' :
                    section.type === 'conclusion' ? 'text-slate-100' :
                    section.type === 'application' ? 'text-slate-100' :
                    'text-slate-200'
                  )}>
                    {section.content}
                  </div>
                </div>
              )
            })}

            {manuscript.sections.every(s => s.content.trim().length === 0) && (
              <div className="text-center py-16">
                <p className="text-sm text-slate-500">작성된 원고가 없습니다</p>
                <p className="text-xs text-slate-600 mt-1">편집 모드로 돌아가 원고를 작성해보세요</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  /* ─── Presentation Mode ─── */

  if (viewMode === 'presentation') {
    const section = manuscript.sections[presentationSectionIdx]
    return (
      <div className="fixed inset-0 z-50 bg-navy-900 text-white flex flex-col">
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
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
        <div className="flex items-center justify-center gap-4 px-6 py-4 border-t border-white/5">
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
      <div className="fixed inset-0 z-50 bg-[#04060f]/60 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-[#04060f]/60 border-b border-white/5 px-6 py-3 flex items-center justify-between">
          <span className="text-xs text-slate-400">인쇄 미리보기 — {manuscript.title}</span>
          <button onClick={() => setViewMode('edit')} className="text-xs text-slate-400 hover:text-slate-100 border border-white/5 px-3 py-1 rounded">
            편집으로 돌아가기
          </button>
        </div>
        <div className="max-w-[800px] mx-auto p-12 print:p-0">
          <h1 className="text-2xl font-serif font-bold text-white mb-2">{manuscript.title}</h1>
          <p className="text-sm text-slate-400 mb-1">{manuscript.passage} · {manuscript.sermonDate} · {manuscript.audience}</p>
          <p className="text-sm text-slate-400 italic mb-8">{manuscript.oneSentenceSummary}</p>
          {manuscript.sections.map(section => (
            <div key={section.id} className="mb-8">
              <h2 className="text-lg font-serif font-bold text-white mb-2 pb-2 border-b border-white/5">{section.label}</h2>
              {section.passage && <p className="text-xs text-slate-500 italic mb-2">{section.passage}</p>}
              <div className="text-sm leading-relaxed whitespace-pre-wrap text-slate-100">{section.content}</div>
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
        saveError={saveError}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onManualSave={manualSave}
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
        <div className="flex-1 overflow-y-auto scrollbar-thin bg-[#04060f]/60">
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
                onAiGenerate={handleAiGenerate}
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
  project, manuscript, autoSaveStatus, lastSaved, saveError, viewMode, onViewModeChange, onManualSave,
  onShowPrepToggle, showPrepPanel, totalWordCount, readingTimeMin, onGoToVersions, overallStatus, writingProgress,
  currentVersion,
}: {
  project: ProjectDetail
  manuscript: JohnManuscriptData
  autoSaveStatus: 'saved' | 'saving' | 'unsaved'
  lastSaved: string | null
  saveError: string | null
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onManualSave: () => void
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
  const saveDotColor =
    autoSaveStatus === 'saving' ? 'bg-blue-400 animate-pulse' :
    autoSaveStatus === 'saved' ? 'bg-green-400' :
    'bg-amber-400'
  const saveTextColor =
    autoSaveStatus === 'saving' ? 'text-blue-400' :
    autoSaveStatus === 'saved' ? 'text-green-400' :
    'text-amber-400'

  return (
    <div className="bg-[#04060f]/60 border-b border-white/5 px-5 py-2.5 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4 min-w-0">
        <span className="text-sm font-medium text-white truncate max-w-[200px]">{manuscript.title}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${OVERALL_STATUS_COLORS[overallStatus] || 'bg-white/5 text-slate-200'}`}>
          {OVERALL_STATUS_LABELS[overallStatus] || overallStatus}
        </span>
        <span className={`text-[10px] ${saveTextColor} flex items-center gap-1.5`}>
          <span className={`w-1.5 h-1.5 rounded-full ${saveDotColor}`} />
          {saveLabel}
          {lastSaved && autoSaveStatus === 'saved' && <span className="text-slate-500"> · {lastSaved}</span>}
        </span>
        <span className="text-[11px] text-slate-500">{manuscript.passage} · {totalWordCount.toLocaleString()}자 · 약 {readingTimeMin}분</span>
        {currentVersion && (
          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-bold whitespace-nowrap">
            기준본: {currentVersion.label} ({JOHN_MANUSCRIPT_VERSIONS.indexOf(currentVersion as any) + 1}개 중)
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onManualSave}
          className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-indigo-200 border border-indigo-500/20 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          저장
          <span className="text-[8px] text-indigo-400/60 hidden sm:inline">⌘S</span>
        </button>
        <button
          onClick={onShowPrepToggle}
          className={`text-[11px] px-2.5 py-1 rounded transition-colors ${
            showPrepPanel ? 'bg-indigo-500/10 text-indigo-300' : 'bg-white/5 text-slate-400'
          }`}
        >
          준비 요약
        </button>
        <button
          onClick={() => onViewModeChange('preview')}
          className="text-[11px] text-slate-400 hover:text-slate-100 border border-white/5 hover:border-white/20 rounded px-2.5 py-1 transition-colors"
        >
          미리보기
        </button>
        <button
          onClick={() => onViewModeChange('presentation')}
          className="text-[11px] text-slate-400 hover:text-slate-100 border border-white/5 hover:border-white/20 rounded px-2.5 py-1 transition-colors"
        >
          발표용 보기
        </button>
        <button
          onClick={onGoToVersions}
          className="text-[11px] text-slate-400 hover:text-slate-100 border border-white/5 hover:border-white/20 rounded px-2.5 py-1 transition-colors"
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
    <div className="bg-[#04060f]/60 border-b border-white/5 px-6 py-3 shrink-0">
      <div className="max-w-[720px] mx-auto space-y-2">
        <div className="flex items-center gap-4">
          <input
            value={title}
            onChange={e => onTitleChange(e.target.value)}
            className="flex-1 text-lg font-serif font-bold text-white bg-transparent border-none outline-none placeholder:text-slate-600"
            placeholder="설교 제목"
          />
          <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
            <span className="bg-white/5 px-2 py-0.5 rounded">{passage}</span>
            <span>{sermonDate}</span>
            <span>·</span>
            <span>{audience}</span>
          </div>
        </div>
        <textarea
          value={summary}
          onChange={e => onSummaryChange(e.target.value)}
          className="w-full text-sm text-slate-400 bg-transparent border-none outline-none resize-none placeholder:text-slate-600 leading-relaxed italic"
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
    body: 'border-l-indigo-500',
    conclusion: 'border-l-amber-500',
    application: 'border-l-amber-400',
  }

  return (
    <aside className="w-56 border-r border-white/5 bg-[#04060f]/60 flex flex-col shrink-0 overflow-y-auto scrollbar-thin">
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">원고 구조</span>
          <span className="text-xs font-semibold text-indigo-400">{writingProgress}%</span>
        </div>
        <div className="adv-progress-bar h-1 mb-2">
          <div className="adv-progress-fill bg-indigo-600 h-full rounded-full" style={{ width: `${writingProgress}%` }} />
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
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
              className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center gap-2 ${
                activeSectionId === section.id
                  ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                  : 'text-slate-200 hover:bg-white/5'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOTS[status]}`} />
              <span className="flex-1 truncate">{section.label}</span>
              {wordCount > 0 && <span className="text-[9px] text-slate-500">{wordCount}자</span>}
              <span className={`text-[8px] px-1 py-0.5 rounded ${STATUS_COLORS[status]}`}>
                {STATUS_LABELS[status]}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-auto p-4 border-t border-white/5">
        <p className="text-[10px] text-slate-500 leading-relaxed">
          각 섹션을 선택하여 원고를 작성하세요.<br />
          준비된 구조가 문장을 기다리고 있습니다.
        </p>
      </div>
    </aside>
  )
}

/* ─── Sermon Section Block ─── */

function SermonSectionBlock({
  section, sectionRef, isActive, status, onContentChange, onActivate, onAiGenerate,
}: {
  section: SermonSection
  sectionRef: (el: HTMLDivElement | null) => void
  isActive: boolean
  status: WritingStatus
  onContentChange: (content: string) => void
  onActivate: () => void
  onAiGenerate?: (sectionType: string) => Promise<string>
}) {
  const [aiLoading, setAiLoading] = useState(false)
  const emptyGuide = EMPTY_GUIDANCE[section.type === 'body' ? 'body' : section.type] || EMPTY_GUIDANCE.body
  const sectionColor: Record<string, string> = {
    introduction: 'border-l-blue-400',
    body: 'border-l-indigo-500',
    conclusion: 'border-l-amber-500',
    application: 'border-l-amber-400',
  }
  const hasContent = section.content.trim().length > 0
  const isEmpty = status === 'empty'
  const canAiGenerate = section.type === 'introduction' || section.type === 'conclusion' || section.type === 'application'

  const handleAiGenerate = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!onAiGenerate || aiLoading) return
    setAiLoading(true)
    try {
      const result = await onAiGenerate(section.type)
      if (result) onContentChange(result)
    } catch {}
    setAiLoading(false)
  }, [onAiGenerate, aiLoading, section.type, onContentChange])

  return (
    <div
      ref={sectionRef}
      className={`border-l-4 ${sectionColor[section.type] || 'border-l-white/10'} pl-5 ${isActive ? 'bg-indigo-500/10 -mx-5 px-5 py-4 rounded-xl' : ''}`}
      onClick={onActivate}
    >
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-base font-serif font-bold text-white">{section.label}</h3>
        {section.passage && (
          <span className="text-[11px] text-slate-500 bg-white/5 px-2 py-0.5 rounded">{section.passage}</span>
        )}
        <div className="flex items-center gap-2 ml-auto">
          {canAiGenerate && onAiGenerate && (
            <button
              onClick={handleAiGenerate}
              disabled={aiLoading}
              className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-indigo-200 transition-colors border border-indigo-500/20 disabled:opacity-50"
            >
              {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              {aiLoading ? '생성 중...' : 'AI 추천'}
            </button>
          )}
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${STATUS_COLORS[status]}`}>
            {STATUS_LABELS[status]}
          </span>
        </div>
      </div>

      {/* Empty state guidance */}
      {isEmpty && (
        <div className="mb-4 bg-[#04060f]/60 border border-dashed border-white/10 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-400 mb-1">{emptyGuide.message}</p>
          <p className="text-[10px] text-slate-500 leading-relaxed">{emptyGuide.hint}</p>
        </div>
      )}

      {/* Research Points & Application Direction (for body sections) */}
      {section.type === 'body' && (
        <div className="mb-4 space-y-2">
          {section.researchPoints && section.researchPoints.length > 0 && (
            <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-3">
              <div className="text-[10px] font-semibold text-teal-300 uppercase tracking-wider mb-1">연구 포인트</div>
              {section.researchPoints.map((p, i) => (
                <p key={i} className="text-xs text-teal-300 leading-relaxed">• {p}</p>
              ))}
            </div>
          )}
          {section.applicationDirection && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              <div className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider mb-1">적용 방향</div>
              <p className="text-xs text-amber-300 leading-relaxed">{section.applicationDirection}</p>
            </div>
          )}
        </div>
      )}

      {/* Application section: show prep application hints */}
      {section.type === 'application' && isEmpty && (
        <div className="mb-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3">
          <div className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-1">준비 단계의 적용 포인트</div>
          <ul className="text-xs text-indigo-300 leading-relaxed space-y-1">
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
        className={`w-full min-h-[180px] text-sm text-slate-100 bg-transparent border-none outline-none resize-y leading-loose font-serif ${
          section.type === 'introduction' ? 'italic' : ''
        } ${isEmpty ? 'opacity-60' : ''}`}
        placeholder={
          section.type === 'introduction' ? '도입을 작성하세요 — 회중의 관심을 열고 본문으로 인도하는 첫 문장을 적어보세요...' :
          section.type === 'conclusion' ? '결론을 작성하세요 — 중심명제를 다시 강조하고 회중을 향한 최종 초청을 적어보세요...' :
          section.type === 'application' ? '적용을 작성하세요 — 오늘의 회중에게 이 말씀이 어떻게 구체적으로 다가가야 하는지 문장을 정리해보세요...' :
          '본문 원고를 작성하세요 — 준비 단계의 대지 구조를 바탕으로 설교 문장을 구체화해보세요...'
        }
      />

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500">{section.content.replace(/\s/g, '').length}자</span>
          {status === 'revised' && (
            <span className="text-[9px] text-amber-600">수정 검토 권장</span>
          )}
        </div>
        {section.applicationDirection && (
          <span className="text-[9px] text-slate-500 italic">적용 방향: {section.applicationDirection.slice(0, 40)}…</span>
        )}
      </div>
    </div>
  )
}

/* ─── Illustration Notes Section ─── */

function IllustrationNotesSection({ notes }: { notes: IllustrationNote[] }) {
  const statusColors: Record<string, string> = {
    '사용': 'bg-indigo-500/10 text-indigo-300',
    '보류': 'bg-amber-500/10 text-amber-300',
    '검토중': 'bg-blue-500/10 text-blue-300',
  }

  return (
    <div className="border-t border-white/5 pt-8">
      <AppSectionHeader title="예화 메모" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {notes.map(note => (
          <div key={note.id} className="bg-[#04060f]/60 rounded-xl border border-white/5 p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-white">{note.title}</h4>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${statusColors[note.status]}`}>
                {note.status}
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">{note.content}</p>
            {note.source && <p className="text-[10px] text-slate-500 mt-1.5 italic">— {note.source}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Reference Notes Section ─── */

function ReferenceNotesSection({ notes }: { notes: ReferenceNote[] }) {
  const categoryColors: Record<string, string> = {
    commentary: 'bg-teal-500/10 text-teal-300',
    theology: 'bg-amber-500/10 text-amber-300',
    historical: 'bg-amber-500/10 text-amber-300',
    pastoral: 'bg-indigo-500/10 text-indigo-300',
    warning: 'bg-red-500/10 text-red-300',
  }
  const categoryLabels: Record<string, string> = {
    commentary: '주석',
    theology: '신학',
    historical: '역사',
    pastoral: '목회',
    warning: '경고',
  }

  return (
    <div className="border-t border-white/5 pt-8">
      <AppSectionHeader title="참고 메모" />
      <div className="space-y-2">
        {notes.map(note => (
          <div key={note.id} className="bg-[#04060f]/60 rounded-xl border border-white/5 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${categoryColors[note.category]}`}>
                {categoryLabels[note.category]}
              </span>
              <h4 className="text-xs font-medium text-white">{note.title}</h4>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Prep Summary Panel ─── */

function PrepSummaryPanel({ manuscript, onGoToPrep }: { manuscript: JohnManuscriptData; onGoToPrep?: () => void }) {
  return (
    <aside className="w-80 border-l border-white/5 bg-[#04060f]/60 flex flex-col shrink-0 overflow-y-auto scrollbar-thin">

      {/* Stage Connection Badge */}
      <div className="px-4 py-2.5 bg-indigo-500/10 border-b border-indigo-500/20">
        <div className="flex items-center gap-1.5 text-[10px] text-indigo-300">
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
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
            작성 중
          </span>
        </div>
        <p className="text-[10px] text-indigo-400 mt-0.5">준비 단계에서 정리한 구조가 원고 작성에 반영됩니다</p>
      </div>

      {/* Core Message (from prep) */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">중심명제</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-medium">준비에서 설정</span>
        </div>
        <p className="text-sm text-slate-100 leading-relaxed font-serif italic">
          &ldquo;{manuscript.coreMessage}&rdquo;
        </p>
      </div>

      {/* Status Connection: Prep → Manuscript handoff */}
      <div className="p-4 border-b border-white/5 bg-indigo-500/10">
        <div className="flex items-center gap-1.5 mb-1.5">
          <svg className="w-3 h-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <span className="text-[10px] font-medium text-indigo-300">준비 단계에서 전달된 구조</span>
        </div>
        <p className="text-[10px] text-indigo-400 leading-relaxed">
          작성 전달용 준비본(v3)을 기반으로 원고를 작성 중입니다. 중심명제, 대지 구조, 적용 포인트가 준비 단계에서 정리되어 이 원고에 반영되었습니다.
        </p>
      </div>

      {/* Prep → Manuscript connection */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">설교 준비 요약</span>
          <button
            onClick={onGoToPrep}
            className="text-[10px] text-indigo-400 hover:text-indigo-400 transition-colors"
          >
            준비 다시 보기
          </button>
        </div>

        {/* Outline from prep */}
        <div className="space-y-2 mb-3">
          <span className="text-[10px] text-slate-400 font-medium">대지 구조</span>
          {manuscript.outlinePoints.map((p, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs">
              <span className="w-4 h-4 rounded-full bg-indigo-500/10 text-indigo-300 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <div>
                <span className="font-medium text-slate-100 block">{p.title}</span>
                <span className="text-[10px] text-slate-500">{p.passage}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Purpose from prep */}
        <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-3">
          <span className="text-[10px] font-medium text-slate-400 block mb-0.5">설교 목적</span>
          <p className="text-[11px] text-slate-200 leading-relaxed">
            회중이 예수 그리스도를 추상적 진리가 아닌 생명과 빛의 주로 다시 바라보게 한다
          </p>
        </div>
      </div>

      {/* Application Points from prep */}
      <div className="p-4 border-b border-white/5">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block mb-2">적용 포인트</span>
        <div className="space-y-2">
          {[
            '익숙한 본문을 새롭게 듣는 훈련 — 말씀을 현재의 삶에 연결하기',
            '빛을 지식으로만 이해하지 않도록 — 생명으로 연결',
            '고난 중에도 그리스도의 빛이 비추고 있음을 선포',
            '새로운 시작을 앞둔 이들에게 "하나님이 당신의 이야기를 시작하신다"는 선포',
          ].map((point, i) => (
            <div key={i} className="flex items-start gap-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl p-2.5">
              <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0" />
              <span className="text-[11px] text-slate-200 leading-relaxed">{point}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Greek Words */}
      <div className="p-4 border-b border-white/5">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block mb-2">핵심 원어</span>
        <div className="space-y-2">
          {manuscript.greekWords.map(w => (
            <div key={w.word} className="bg-[#04060f]/60 rounded-xl border border-white/5 p-2.5">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-greek text-white">{w.greek}</span>
                <span className="text-[10px] text-slate-400">{w.word}</span>
              </div>
              <p className="text-[10px] text-slate-200">{w.meaning}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 italic">{w.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Prep Insights & Warning Points */}
      <div className="p-4 border-b border-white/5">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block mb-2">통찰 요약</span>
        <div className="space-y-1.5">
          {manuscript.prepInsights.map((insight, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs text-slate-200">
              <span className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
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
            <div key={i} className="flex items-start gap-1.5 text-xs text-red-600 bg-red-500/10 rounded-lg p-2 border border-red-500/20">
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
    <div className="border-t border-white/5 pt-8">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">최근 작업</span>
      </div>
      <div className="bg-[#04060f]/60 rounded-xl border border-white/5 divide-y divide-white/5">
        {JOHN_RECENT_ACTIVITY.map((entry, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5">
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              entry.section === 'manuscript' ? 'bg-indigo-400' :
              entry.section === 'prep' ? 'bg-amber-400' : 'bg-teal-400'
            }`} />
            <span className="text-[10px] text-slate-500 w-14 shrink-0 font-mono">{entry.time}</span>
            <span className="text-xs text-slate-200 flex-1">{entry.description}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
              entry.section === 'manuscript' ? 'bg-indigo-500/10 text-indigo-300' :
              entry.section === 'prep' ? 'bg-amber-500/10 text-amber-300' :
              'bg-teal-500/10 text-teal-300'
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
    <div className="bg-[#04060f]/60 border-t border-white/5 px-5 py-2.5 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${allDone ? 'bg-indigo-400' : 'bg-amber-400'}`} />
          집필도 <span className={`font-semibold ${allDone ? 'text-indigo-400' : 'text-amber-300'}`}>{writingProgress}%</span>
        </span>
        <span>{totalWordCount.toLocaleString()}자</span>
        <span>약 {readingTimeMin}분 분량</span>
        <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded">
          원고 이력 {JOHN_MANUSCRIPT_VERSIONS.length}개
        </span>
        {emptySections.length > 0 && (
          <span className="text-amber-300">{emptySections.length}개 섹션 미작성</span>
        )}
        {allDone && (
          <span className="text-indigo-400 font-medium">원고 정리 완료</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onGoToPrep}
          className="text-[11px] text-slate-400 hover:text-slate-100 border border-white/5 hover:border-teal-500/30 rounded-xl px-3 py-1.5 transition-colors"
        >
          ← 설교 준비 다시 보기
        </button>
        <button
          onClick={onGoToVersions}
          className="text-[11px] text-slate-400 hover:text-slate-100 border border-white/5 hover:border-white/20 rounded-xl px-3 py-1.5 transition-colors"
        >
          버전 기록
        </button>
      </div>
    </div>
  )
}
