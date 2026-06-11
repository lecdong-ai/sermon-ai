'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ProjectDetail } from '@/lib/advanced/types'
import { JOHN_MANUSCRIPT } from '@/lib/advanced/johnManuscriptData'
import type { SermonSection, IllustrationNote, ReferenceNote, JohnManuscriptData } from '@/lib/advanced/johnManuscriptData'
import { AppSectionHeader, SaveStatusIndicator } from '@/components/advanced/shared'
import VersionHistoryDrawer from '@/components/advanced/shared/VersionHistoryDrawer'
import { MOCK_VERSIONS } from '@/lib/advanced/statusData'

interface Props { project: ProjectDetail }

type ViewMode = 'edit' | 'presentation' | 'print'

export default function ManuscriptTab({ project }: Props) {
  const router = useRouter()
  const [manuscript, setManuscript] = useState<JohnManuscriptData>(JOHN_MANUSCRIPT)
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('edit')
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [showResearchPanel, setShowResearchPanel] = useState(true)
  const [showVersions, setShowVersions] = useState(false)
  const [presentationSectionIdx, setPresentationSectionIdx] = useState(0)

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const innerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  const totalWordCount = useMemo(() =>
    manuscript.sections.reduce((sum, s) => sum + s.content.replace(/\s/g, '').length, 0),
    [manuscript.sections]
  )

  const readingTimeMin = useMemo(() =>
    Math.max(1, Math.round(totalWordCount / 300)),
    [totalWordCount]
  )

  const sectionsWithContent = useMemo(() =>
    manuscript.sections.filter(s => s.content.trim().length > 0).length,
    [manuscript.sections]
  )

  const writingProgress = useMemo(() =>
    Math.round((sectionsWithContent / manuscript.sections.length) * 100),
    [sectionsWithContent, manuscript.sections.length]
  )

  // Auto-save simulation
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
        setLastSaved(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }))
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

  // Keyboard navigation for presentation mode
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

  // Presentation Mode
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

  // Print Mode
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

  // Edit Mode
  return (
    <div className="flex flex-col h-full">
      {/* ─── Writing Workspace Header ─── */}
      <WritingWorkspaceHeader
        title={manuscript.title}
        autoSaveStatus={autoSaveStatus}
        lastSaved={lastSaved}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onShowResearchToggle={() => setShowResearchPanel(prev => !prev)}
        showResearchPanel={showResearchPanel}
        totalWordCount={totalWordCount}
        readingTimeMin={readingTimeMin}
        onGoToVersions={() => setShowVersions(true)}
      />

      {/* ─── Version History Drawer ─── */}
      <VersionHistoryDrawer
        isOpen={showVersions}
        onClose={() => setShowVersions(false)}
        versions={MOCK_VERSIONS}
        projectId={project.id}
      />

      {/* ─── Sermon Metadata Panel ─── */}
      <SermonMetadataPanel
        title={manuscript.title}
        onTitleChange={updateTitle}
        summary={manuscript.oneSentenceSummary}
        onSummaryChange={updateSummary}
        passage={manuscript.passage}
        sermonDate={manuscript.sermonDate}
        audience={manuscript.audience}
        tone={manuscript.tone}
      />

      {/* ─── Main Layout: 3 Columns ─── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Left: Outline Navigator */}
        <OutlineNavigator
          sections={manuscript.sections}
          activeSectionId={activeSectionId}
          onNavigate={scrollToSection}
          writingProgress={writingProgress}
        />

        {/* Center: Sermon Editor */}
        <div className="flex-1 overflow-y-auto scrollbar-thin bg-white">
          <div className="max-w-[720px] mx-auto p-8 space-y-8">
            {manuscript.sections.map(section => (
              <SermonSectionBlock
                key={section.id}
                section={section}
                sectionRef={el => { sectionRefs.current[section.id] = el }}
                isActive={activeSectionId === section.id}
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

            <div className="h-16" />
          </div>
        </div>

        {/* Right: Research Reference Panel */}
        {showResearchPanel && (
          <ResearchReferencePanel
            manuscript={manuscript}
          />
        )}
      </div>

      {/* ─── Draft Status Bar ─── */}
      <DraftStatusBar
        writingProgress={writingProgress}
        totalWordCount={totalWordCount}
        readingTimeMin={readingTimeMin}
        sections={manuscript.sections}
        warningPoints={manuscript.warningPoints}
        onGoToVersions={() => router.push(`/advanced/projects/${project.id}?tab=versions`)}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════ */

/* ─── Writing Workspace Header ─── */

function WritingWorkspaceHeader({
  title, autoSaveStatus, lastSaved, viewMode, onViewModeChange,
  onShowResearchToggle, showResearchPanel, totalWordCount, readingTimeMin, onGoToVersions,
}: {
  title: string
  autoSaveStatus: 'saved' | 'saving' | 'unsaved'
  lastSaved: string | null
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onShowResearchToggle: () => void
  showResearchPanel: boolean
  totalWordCount: number
  readingTimeMin: number
  onGoToVersions: () => void
}) {
  return (
    <div className="bg-white border-b border-paper-200 px-5 py-2.5 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-paper-800 truncate max-w-[240px]">{title}</span>
        <div className="flex items-center gap-1.5 text-[11px]">
          {autoSaveStatus === 'saving' && <SaveStatusIndicator status="saving" lastSavedAt={null} minimal />}
          {autoSaveStatus === 'saved' && <SaveStatusIndicator status="saved" lastSavedAt={new Date().toISOString()} minimal />}
          {autoSaveStatus === 'unsaved' && <SaveStatusIndicator status="modified" lastSavedAt={null} minimal />}
        </div>
        <span className="text-[11px] text-paper-400">{totalWordCount.toLocaleString()}자 · 약 {readingTimeMin}분</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onShowResearchToggle}
          className={`text-[11px] px-2.5 py-1 rounded transition-colors ${
            showResearchPanel ? 'bg-navy-100 text-navy-700' : 'bg-paper-100 text-paper-500'
          }`}
        >
          참고 패널
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
          className="text-[11px] text-paper-500 hover:text-paper-700 border border-paper-200 hover:border-paper-400 rounded px-2.5 py-1 transition-colors"
        >
          버전 기록
        </button>
      </div>
    </div>
  )
}

/* ─── Sermon Metadata Panel ─── */

function SermonMetadataPanel({
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
    <div className="bg-paper-50 border-b border-paper-200 px-6 py-4 shrink-0">
      <div className="max-w-[720px] mx-auto space-y-3">
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
          className="w-full text-sm text-paper-600 bg-transparent border-none outline-none resize-none placeholder:text-paper-300 leading-relaxed italic"
          placeholder="이 설교의 핵심을 한 문장으로 요약하세요..."
          rows={1}
        />
        <div className="text-[10px] text-paper-400">
          <span className="font-medium">설교 톤:</span> {tone}
        </div>
      </div>
    </div>
  )
}

/* ─── Outline Navigator ─── */

function OutlineNavigator({
  sections, activeSectionId, onNavigate, writingProgress,
}: {
  sections: SermonSection[]
  activeSectionId: string | null
  onNavigate: (id: string) => void
  writingProgress: number
}) {
  const typeDots: Record<string, string> = {
    introduction: 'bg-blue-400',
    body: 'bg-green-400',
    conclusion: 'bg-gold-400',
    application: 'bg-amber-400',
  }

  return (
    <aside className="w-56 border-r border-paper-200 bg-paper-50 flex flex-col shrink-0 overflow-y-auto scrollbar-thin">
      <div className="p-4 border-b border-paper-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest">설교 구조</span>
          <span className="text-xs font-semibold text-green-600">{writingProgress}%</span>
        </div>
        <div className="adv-progress-bar h-1">
          <div className="adv-progress-fill bg-green-500 h-full rounded-full" style={{ width: `${writingProgress}%` }} />
        </div>
      </div>

      <div className="p-2 space-y-0.5">
        {sections.map(section => {
          const wordCount = section.content.replace(/\s/g, '').length
          const hasContent = wordCount > 0
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
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${typeDots[section.type] || 'bg-paper-300'}`} />
              <span className="flex-1 truncate">{section.label}</span>
              {hasContent && <span className="text-[9px] text-paper-400">{wordCount}자</span>}
            </button>
          )
        })}
      </div>
    </aside>
  )
}

/* ─── Sermon Section Block ─── */

function SermonSectionBlock({
  section, sectionRef, isActive, onContentChange, onActivate,
}: {
  section: SermonSection
  sectionRef: (el: HTMLDivElement | null) => void
  isActive: boolean
  onContentChange: (content: string) => void
  onActivate: () => void
}) {
  const sectionColors: Record<string, string> = {
    introduction: 'border-l-blue-400',
    body: 'border-l-green-400',
    conclusion: 'border-l-gold-400',
    application: 'border-l-amber-400',
  }

  return (
    <div
      ref={sectionRef}
      className={`border-l-4 ${sectionColors[section.type] || 'border-l-paper-300'} pl-5 ${isActive ? 'bg-green-50/30 -mx-5 px-5 py-4 rounded-lg' : ''}`}
      onClick={onActivate}
    >
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-base font-serif font-bold text-paper-800">{section.label}</h3>
        {section.passage && (
          <span className="text-[11px] text-paper-400 bg-paper-100 px-2 py-0.5 rounded">{section.passage}</span>
        )}
      </div>

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

      {/* Content Editor */}
      <textarea
        value={section.content}
        onChange={e => onContentChange(e.target.value)}
        className={`w-full min-h-[200px] text-sm text-paper-700 bg-transparent border-none outline-none resize-y leading-loose font-serif ${
          section.type === 'introduction' ? 'italic' : ''
        }`}
        placeholder={
          section.type === 'introduction' ? '서론을 작성하세요...' :
          section.type === 'conclusion' ? '결론을 작성하세요...' :
          section.type === 'application' ? '적용을 작성하세요...' :
          '본문을 작성하세요...'
        }
      />

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-paper-100">
        <span className="text-[10px] text-paper-400">{section.content.replace(/\s/g, '').length}자</span>
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

/* ─── Research Reference Panel ─── */

function ResearchReferencePanel({ manuscript }: { manuscript: JohnManuscriptData }) {
  return (
    <aside className="w-80 border-l border-paper-200 bg-paper-50 flex flex-col shrink-0 overflow-y-auto scrollbar-thin">

      {/* Core Message */}
      <div className="p-4 border-b border-paper-200">
        <span className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest block mb-1">중심명제</span>
        <p className="text-sm text-paper-700 leading-relaxed font-serif italic">
          &ldquo;{manuscript.coreMessage}&rdquo;
        </p>
      </div>

      {/* Outline Summary */}
      <div className="p-4 border-b border-paper-200">
        <span className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest block mb-2">대지 요약</span>
        <div className="space-y-2">
          {manuscript.outlinePoints.map((p, i) => (
            <div key={i} className="text-xs">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-4 h-4 rounded-full bg-green-100 text-green-700 text-[9px] font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span className="font-medium text-paper-700">{p.title}</span>
              </div>
              <p className="text-[10px] text-paper-400 pl-5">{p.passage}</p>
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

      {/* Related Passages */}
      <div className="p-4 border-b border-paper-200">
        <span className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest block mb-2">관련 본문</span>
        <div className="space-y-2">
          {manuscript.relatedPassages.map(p => (
            <div key={p.ref} className="bg-white rounded-lg border border-paper-150 p-2.5">
              <span className="text-xs font-medium text-paper-700">{p.ref}</span>
              <p className="text-[10px] text-paper-500 mt-0.5 line-clamp-2">{p.text}</p>
              <p className="text-[9px] text-paper-400 mt-0.5 italic">{p.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Prep Insights */}
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

/* ─── Draft Status Bar ─── */

function DraftStatusBar({
  writingProgress, totalWordCount, readingTimeMin, sections, warningPoints, onGoToVersions,
}: {
  writingProgress: number
  totalWordCount: number
  readingTimeMin: number
  sections: SermonSection[]
  warningPoints: string[]
  onGoToVersions: () => void
}) {
  const emptySections = sections.filter(s => s.content.trim().length === 0)
  const hasWarnings = warningPoints.length > 0

  return (
    <div className="bg-white border-t border-paper-200 px-5 py-2.5 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4 text-[11px] text-paper-500">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          진행률 <span className="font-semibold text-green-600">{writingProgress}%</span>
        </span>
        <span>{totalWordCount.toLocaleString()}자</span>
        <span>약 {readingTimeMin}분 분량</span>
        {emptySections.length > 0 && (
          <span className="text-amber-600">{emptySections.length}개 섹션 미작성</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onGoToVersions}
          className="text-[11px] text-paper-500 hover:text-paper-700 border border-paper-200 hover:border-paper-300 rounded-lg px-3 py-1.5 transition-colors"
        >
          버전 기록
        </button>
        <button className="text-[11px] bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-colors font-medium">
          최종 검토 →
        </button>
      </div>
    </div>
  )
}
