'use client'

import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Sparkles, Plus, X, Users, Settings2, Quote, FileText } from 'lucide-react'
import { ProjectDetail, CongregationProfile, DEFAULT_CONGREGATION_PROFILE, AGE_GROUP_OPTIONS, FAITH_MATURITY_OPTIONS } from '@/lib/advanced/types'
import { AppSectionHeader, PrepVersionHistory } from '@/components/advanced/shared'
import ProjectContextRow from '@/components/advanced/shared/ProjectContextRow'
import type { PrepVersion } from '@/lib/advanced/johnVersionData'
import { PREP_VERSIONS, RECENT_ACTIVITY } from '@/lib/advanced/johnVersionData'
import { getStorageItem, setStorageItem, removeStorageItem } from '@/lib/storage'
import { readProjectCore } from '@/lib/advanced/projectStorage'

interface Props { project: ProjectDetail }

interface PrepOutline {
  id: string
  title: string
  description: string
  relatedVerse: string
  applicationNote: string
  transitionNote: string
}

interface DeliveryBlueprintCandidate {
  archetype: string
  description: string
  deliveryIntro: string
  deliveryFlow: string
  transitions: { label: string; text: string }[]
  deliveryConclusion: string
  emotionCurve: string
  timeAllocation: { intro: string; bodySections: string[]; conclusion: string }
}

interface ApplicationPoint {
  id: string
  point: string
  audienceTag: string
  pastoralNote: string
}

interface PrepData {
  sermonTitle: string
  coreMessage: string
  sermonPurpose: string
  expectedResponse: string
  passageStructure: string
  contextPoints: string[]
  keyWords: { word: string; meaning: string; note: string }[]
  researchInsights: string[]
  outlines: PrepOutline[]
  applicationPoints: ApplicationPoint[]
  congregationProfile: CongregationProfile
  deliveryIntro: string
  deliveryFlow: string
  deliveryTransitions: string[]
  deliveryConclusion: string
  prepStatus: 'draft' | 'review' | 'ready'
  memoText: string
  memoTags: string[]
}

type SectionId = 'direction' | 'passage' | 'outline' | 'application' | 'delivery'

const SECTION_LABELS: Record<SectionId, string> = {
  direction: '설교 방향',
  passage: '본문 핵심 흐름',
  outline: '대지 구조',
  application: '적용과 회중 연결',
  delivery: '전달 흐름',
}

const PREP_STATUS_LABELS: Record<string, string> = {
  draft: '초안 정리 중',
  review: '구조 검토 필요',
  ready: '작성 준비 완료',
}

const PREP_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-amber-500/10 text-amber-300',
  review: 'bg-blue-500/10 text-blue-300',
  ready: 'bg-indigo-500/10 text-indigo-300',
}



/* ─── Required section keys for progress ─── */

const REQUIRED_FIELDS: Record<SectionId, (keyof PrepData | string)[]> = {
  direction: ['coreMessage', 'sermonPurpose'],
  passage: ['passageStructure', 'researchInsights'],
  outline: ['outlines'],
  application: ['applicationPoints'],
  delivery: ['deliveryFlow', 'deliveryConclusion'],
}

export default function PrepTab({ project }: Props) {
  const router = useRouter()
  const [prepData, setPrepData] = useState<PrepData>(() => ({
    sermonTitle: project.title || '',
    coreMessage: project.coreMessage || '',
    sermonPurpose: '',
    expectedResponse: '',
    passageStructure: '',
    contextPoints: [],
    keyWords: [],
    researchInsights: [],
    outlines: [],
    applicationPoints: [],
    congregationProfile: DEFAULT_CONGREGATION_PROFILE,
    deliveryIntro: '',
    deliveryFlow: '',
    deliveryTransitions: [],
    deliveryConclusion: '',
    prepStatus: 'draft',
    memoText: '',
    memoTags: [],
  }))
  const [activeSection, setActiveSection] = useState<SectionId | null>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [outlineLoading, setOutlineLoading] = useState(false)
  const [outlineCandidates, setOutlineCandidates] = useState<AiOutlineCandidate[] | null>(null)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const prepLoadedRef = useRef(false)
  const prepDataRef = useRef(prepData)
  prepDataRef.current = prepData

  // Flush save immediately on unmount (tab switch) to avoid losing debounced writes.
  // The ManuscriptTab mount effect runs *after* this cleanup, so localStorage is always up to date.
  useEffect(() => {
    return () => {
      if (prepLoadedRef.current) {
        setStorageItem(`prep_${project.id}`, { ...prepDataRef.current, _savedAt: Date.now() })
      }
    }
  }, [project.id])

  // Auto-save: debounced save to localStorage whenever prepData changes
  useEffect(() => {
    if (!prepLoadedRef.current) return
    const timer = setTimeout(() => {
      const now = Date.now()
      setStorageItem(`prep_${project.id}`, { ...prepData, _savedAt: now })
      setLastSaved(new Date(now).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }))
    }, 600)
    return () => clearTimeout(timer)
  }, [prepData, project.id])

  useEffect(() => {
    try {
      let studyData: any = null
      // 1) global variable buffer (synchronous, same-page transition)
      const buffer = (window as any).__prepDataBuffer
      if (buffer) {
        studyData = buffer
        ;(window as any).__prepDataBuffer = null
      }
      // 2) sessionStorage
      if (!studyData) {
        const ss = sessionStorage.getItem(`sermonai_study_to_prep_${project.id}`)
        if (ss) {
          studyData = JSON.parse(ss)
          sessionStorage.removeItem(`sermonai_study_to_prep_${project.id}`)
        }
      }
      // 3) localStorage fallback
      if (!studyData) {
        const ls = getStorageItem<Record<string, any> | null>(`study_to_prep_${project.id}`, null)
        if (ls) {
          studyData = ls
          removeStorageItem(`study_to_prep_${project.id}`)
        }
      }
      if (studyData) {
        setPrepData(prev => ({
          ...prev,
          passageStructure: studyData.passageStructure || prev.passageStructure,
          contextPoints: studyData.contextPoints?.length ? studyData.contextPoints : prev.contextPoints,
          keyWords: studyData.keyWords?.length ? studyData.keyWords : prev.keyWords,
          researchInsights: studyData.researchInsights?.length ? studyData.researchInsights : prev.researchInsights,
          memoText: studyData.memoText || prev.memoText,
          memoTags: studyData.memoTags?.length ? studyData.memoTags : prev.memoTags,
        }))
      }
    } catch (e) {
      console.error('[PrepTab] Failed to load study data:', e)
    }

    // 4) saved prep data from auto-save (if no fresh study handoff came in)
    const { prep: raw } = readProjectCore(project.id)
    if (raw) {
      const { _savedAt, ...savedPrep } = raw
      setPrepData(prev => {
        const hasStudyData = prev.passageStructure.length > 0
        return {
          ...(hasStudyData ? prev : savedPrep),
          ...(hasStudyData ? {
            passageStructure: prev.passageStructure || savedPrep.passageStructure,
            contextPoints: prev.contextPoints.length ? prev.contextPoints : savedPrep.contextPoints,
            keyWords: prev.keyWords.length ? prev.keyWords : savedPrep.keyWords,
            researchInsights: prev.researchInsights.length ? prev.researchInsights : savedPrep.researchInsights,
          } : {}),
          // Preserve user input or load from saved
          sermonTitle: prev.sermonTitle || savedPrep.sermonTitle || '',
          coreMessage: prev.coreMessage || savedPrep.coreMessage || '',
          sermonPurpose: prev.sermonPurpose || savedPrep.sermonPurpose || '',
          expectedResponse: prev.expectedResponse || savedPrep.expectedResponse || '',
          outlines: prev.outlines.length ? prev.outlines : (savedPrep.outlines || []),
          applicationPoints: prev.applicationPoints.length ? prev.applicationPoints : (savedPrep.applicationPoints || []),
          congregationProfile: savedPrep.congregationProfile || DEFAULT_CONGREGATION_PROFILE,
          deliveryIntro: prev.deliveryIntro || savedPrep.deliveryIntro,
          deliveryFlow: prev.deliveryFlow || savedPrep.deliveryFlow,
          deliveryTransitions: prev.deliveryTransitions.length ? prev.deliveryTransitions : (savedPrep.deliveryTransitions || []),
          deliveryConclusion: prev.deliveryConclusion || savedPrep.deliveryConclusion,
          prepStatus: savedPrep.prepStatus || 'draft',
          memoText: prev.memoText || savedPrep.memoText || '',
          memoTags: prev.memoTags?.length ? prev.memoTags : (savedPrep.memoTags || []),
        }
      })
      if (_savedAt) {
        setLastSaved(new Date(_savedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }))
      }
    }

    prepLoadedRef.current = true
  }, [project.id])

  const scrollToSection = useCallback((id: SectionId) => {
    setActiveSection(id)
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const updateField = useCallback(<K extends keyof PrepData>(key: K, value: PrepData[K]) => {
    setPrepData(prev => ({ ...prev, [key]: value }))
  }, [])

  const updateOutline = useCallback((id: string, field: keyof PrepOutline, value: string) => {
    setPrepData(prev => ({
      ...prev,
      outlines: prev.outlines.map(o => o.id === id ? { ...o, [field]: value } : o),
    }))
  }, [])

  const updateApplication = useCallback((id: string, field: keyof ApplicationPoint, value: string) => {
    setPrepData(prev => ({
      ...prev,
      applicationPoints: prev.applicationPoints.map(a => a.id === id ? { ...a, [field]: value } : a),
    }))
  }, [])

  const generateOutlines = useCallback(() => {
    setOutlineLoading(true)
    setOutlineCandidates(null)
    fetch('/api/advanced/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'outline',
        data: {
          book: project.book,
          chapter: String(project.chapter),
          verseStart: String(project.verseStart),
          verseEnd: project.verseEnd ? String(project.verseEnd) : undefined,
          passage: project.passage,
          passageStructure: prepData.passageStructure,
          keyWords: prepData.keyWords,
          researchInsights: prepData.researchInsights,
          coreMessage: prepData.coreMessage,
        },
      }),
    })
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          const parsed = JSON.parse(json.data.output)
          setOutlineCandidates(parsed.candidates || [])
        }
      })
      .catch(() => {})
      .finally(() => setOutlineLoading(false))
  }, [project, prepData])

  const selectOutlineCandidate = useCallback((index: number) => {
    const candidate = outlineCandidates?.[index]
    if (!candidate) return
    const newOutlines: PrepOutline[] = candidate.mainPoints.map((mp, i) => ({
      id: `outline-${Date.now()}-${i}`,
      title: mp.title,
      description: mp.description,
      relatedVerse: mp.relatedVerse,
      applicationNote: mp.applicationNote,
      transitionNote: mp.transitionNote,
    }))
    setPrepData(prev => ({ ...prev, outlines: newOutlines }))
    setOutlineCandidates(null)
  }, [outlineCandidates])

  const discardOutlineCandidates = useCallback(() => {
    setOutlineCandidates(null)
  }, [])

  const addEmptyOutline = useCallback(() => {
    setPrepData(prev => ({
      ...prev,
      outlines: [...prev.outlines, {
        id: `outline-${Date.now()}`,
        title: '',
        description: '',
        relatedVerse: '',
        applicationNote: '',
        transitionNote: '',
      }],
    }))
  }, [])

  /* ─── Progress calculation ─── */

  const sectionProgress = useMemo(() => {
    const result: Record<SectionId, { filled: number; total: number; done: boolean }> = {} as any
    for (const [sectionId, fields] of Object.entries(REQUIRED_FIELDS)) {
      const sid = sectionId as SectionId
      const total = fields.length
      const filled = fields.filter(f => {
        const val = (prepData as any)[f]
        if (Array.isArray(val)) return val.length > 0
        if (typeof val === 'string') return val.trim().length > 0
        return val != null
      }).length
      result[sid] = { filled, total, done: filled >= total }
    }
    return result
  }, [prepData])

  const overallProgress = useMemo(() => {
    const all = Object.values(sectionProgress)
    const total = all.reduce((s, x) => s + x.total, 0)
    const filled = all.reduce((s, x) => s + x.filled, 0)
    return Math.round((filled / total) * 100)
  }, [sectionProgress])

  const allRequiredDone = useMemo(() =>
    Object.values(sectionProgress).every(x => x.done),
    [sectionProgress]
  )

  const totalOutlineWords = useMemo(() =>
    prepData.outlines.reduce((sum, o) => sum + o.description.replace(/\s/g, '').length, 0),
    [prepData.outlines],
  )

  const lastSavedDisplay = lastSaved || '방금 전'

  return (
    <div className="flex flex-col h-full">
      {/* ─── Project Context ─── */}
      <ProjectContextRow
        project={project}
        currentStage="prep"
        stageStatus={{ study: 'done', prep: 'progress', manuscript: 'empty' }}
        lastSaved={lastSavedDisplay}
      />

      {/* ─── Prep Context Header ─── */}
      <PrepContextHeader
        project={project}
        prepStatus={prepData.prepStatus}
        overallProgress={overallProgress}
        allRequiredDone={allRequiredDone}
        lastSaved={lastSavedDisplay}
        onGoToStudy={() => router.push(`/advanced/projects/${project.id}?tab=study`)}
        onGoToManuscript={() => router.push(`/advanced/projects/${project.id}?tab=manuscript`)}
      />

      {/* ─── Research Memo (handoff from Study tab) ─── */}
      {(prepData.memoText?.trim() || prepData.memoTags?.length > 0) && (
        <div className="px-6 pt-4 pb-2 border-b border-white/5">
          <div className="max-w-[1100px] mx-auto">
            <div className="flex items-center gap-1.5 mb-2">
              <FileText className="w-3 h-3 text-amber-300" />
              <span className="text-[10px] font-semibold text-amber-300/80 uppercase tracking-widest">본문 연구 메모</span>
              <span className="text-[10px] text-slate-500">· 연구 탭에서 가져옴</span>
            </div>
            {prepData.memoText?.trim() && (
              <p className="text-[12.5px] text-slate-300 leading-relaxed line-clamp-3 whitespace-pre-wrap">
                {prepData.memoText}
              </p>
            )}
            {prepData.memoTags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {prepData.memoTags.map((t, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0 border-t border-white/5">
        {/* ─── Left: Section Navigator (sticky) ─── */}
        <PrepNavigator
          sectionProgress={sectionProgress}
          activeSection={activeSection}
          onNavigate={scrollToSection}
          overallProgress={overallProgress}
        />

        {/* ─── Center: Main Prep Content ─── */}
        <div className="flex-1 overflow-y-auto scrollbar-thin bg-[#04060f]/60">
          <div className="max-w-[720px] mx-auto p-8 space-y-10">

            {/* Section: 설교 방향 */}
            <DirectionSection
              data={prepData}
              project={project}
              sectionRef={el => { sectionRefs.current['direction'] = el }}
              isActive={activeSection === 'direction'}
              onActivate={() => setActiveSection('direction')}
              onUpdate={updateField}
            />

            {/* Section: 본문 핵심 흐름 */}
            <PassageFlowSection
              data={prepData}
              sectionRef={el => { sectionRefs.current['passage'] = el }}
              isActive={activeSection === 'passage'}
              onActivate={() => setActiveSection('passage')}
              onUpdate={updateField}
              onGoToStudy={() => router.push(`/advanced/projects/${project.id}?tab=study`)}
            />

            {/* Section: 대지 구조 */}
            <OutlineSection
              outlines={prepData.outlines}
              sectionRef={el => { sectionRefs.current['outline'] = el }}
              isActive={activeSection === 'outline'}
              onActivate={() => setActiveSection('outline')}
              onUpdate={updateOutline}
              onGenerateAI={generateOutlines}
              onAddOutline={addEmptyOutline}
              aiLoading={outlineLoading}
              aiCandidates={outlineCandidates}
              onSelectCandidate={selectOutlineCandidate}
              onDiscardCandidates={discardOutlineCandidates}
            />

            {/* Section: 적용과 회중 연결 */}
            <ApplicationSection
              points={prepData.applicationPoints}
              congregationProfile={prepData.congregationProfile}
              project={project}
              prepData={prepData}
              sectionRef={el => { sectionRefs.current['application'] = el }}
              isActive={activeSection === 'application'}
              onActivate={() => setActiveSection('application')}
              onUpdate={updateApplication}
              onUpdateProfile={profile => updateField('congregationProfile', profile)}
              onSetPoints={points => updateField('applicationPoints', points)}
            />

            {/* Section: 전달 흐름 */}
            <DeliverySection
              data={prepData}
              project={project}
              sectionRef={el => { sectionRefs.current['delivery'] = el }}
              isActive={activeSection === 'delivery'}
              onActivate={() => setActiveSection('delivery')}
              onUpdate={updateField}
            />

            {/* ─── 준비 이력 ─── */}
            <div className="pt-4">
              <PrepVersionHistory versions={PREP_VERSIONS} />
            </div>

            {/* ─── 최근 작업 활동 ─── */}
            <RecentPrepActivity />

            <div className="h-16" />
          </div>
        </div>
      </div>

      {/* ─── Footer Status Bar ─── */}
      <PrepStatusBar
        overallProgress={overallProgress}
        allRequiredDone={allRequiredDone}
        prepStatus={prepData.prepStatus}
        outlineCount={prepData.outlines.length}
        appCount={prepData.applicationPoints.length}
        totalOutlineWords={totalOutlineWords}
        onGoToStudy={() => router.push(`/advanced/projects/${project.id}?tab=study`)}
        onGoToManuscript={() => router.push(`/advanced/projects/${project.id}?tab=manuscript`)}
      />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ════════════════════════════════════════════════════════════ */

/* ─── Prep Context Header ─── */

function PrepContextHeader({
  project, prepStatus, overallProgress, allRequiredDone, lastSaved,
  onGoToStudy, onGoToManuscript,
}: {
  project: ProjectDetail
  prepStatus: string
  overallProgress: number
  allRequiredDone: boolean
  lastSaved: string
  onGoToStudy: () => void
  onGoToManuscript: () => void
}) {
  return (
    <div className="bg-[#04060f]/60 border-b border-white/5 px-6 py-4 shrink-0">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">설교 준비</h2>
              <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${PREP_STATUS_COLORS[prepStatus] || 'bg-white/5 text-slate-200'}`}>
                {PREP_STATUS_LABELS[prepStatus] || prepStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400">연구에서 정리한 내용을 설교 흐름으로 세워가는 단계입니다</p>
            {(project.coreMessage || project.sermonType || project.preacher) && (
              <div className="flex items-center gap-2.5 flex-wrap">
                {project.coreMessage && (
                  <div className="flex items-center gap-2 pl-3 pr-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-400/30 max-w-[560px]">
                    <Quote className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span className="text-[13px] text-amber-50 font-semibold italic truncate">
                      {project.coreMessage}
                    </span>
                  </div>
                )}
                {project.sermonType && (
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-[11px] text-indigo-200 font-medium">
                    {project.sermonType}
                  </span>
                )}
                {project.preacher && (
                  <span className="text-[12px] text-slate-300">
                    설교자 <span className="text-white font-semibold">{project.preacher}</span>
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onGoToStudy}
              className="text-xs border border-white/5 hover:border-teal-500/30 text-slate-400 hover:text-teal-300 px-3 py-1.5 rounded-xl transition-colors"
            >
              연구 내용 다시 보기
            </button>
            <button
              onClick={onGoToManuscript}
              disabled={!allRequiredDone}
              className={`text-xs px-3 py-1.5 rounded-xl transition-colors font-medium ${
                allRequiredDone
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-white/5 text-slate-500 cursor-not-allowed'
              }`}
            >
              설교 작성으로 이어가기
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${allRequiredDone ? 'bg-indigo-600' : 'bg-amber-400'}`}
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <span className={`text-[10px] font-medium ${allRequiredDone ? 'text-indigo-400' : 'text-amber-300'}`}>
            준비도 {overallProgress}%
          </span>
        </div>
        {allRequiredDone && (
          <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-indigo-400">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>작성 단계로 넘어갈 준비가 되었습니다 — 대지 구조와 적용 포인트가 정리되었습니다</span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Prep Navigator ─── */

function PrepNavigator({
  sectionProgress, activeSection, onNavigate, overallProgress,
}: {
  sectionProgress: Record<SectionId, { filled: number; total: number; done: boolean }>
  activeSection: SectionId | null
  onNavigate: (id: SectionId) => void
  overallProgress: number
}) {
  const sections: { id: SectionId; label: string }[] = [
    { id: 'direction', label: '설교 방향' },
    { id: 'passage', label: '본문 핵심 흐름' },
    { id: 'outline', label: '대지 구조' },
    { id: 'application', label: '적용과 회중 연결' },
    { id: 'delivery', label: '전달 흐름' },
  ]

  return (
    <aside className="w-52 border-r border-white/5 bg-[#04060f]/60 flex flex-col shrink-0 overflow-y-auto scrollbar-thin sticky top-0 self-start h-fit max-h-screen">
      <div className="p-4 border-b border-white/5">
        <AppSectionHeader title="준비 단계" count={`${overallProgress}%`} />
        <div className="adv-progress-bar h-1 mt-2">
          <div
            className={`adv-progress-fill h-full rounded-full transition-all duration-500 ${overallProgress === 100 ? 'bg-indigo-600' : 'bg-amber-400'}`}
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>
      <div className="p-2 space-y-0.5">
        {sections.map(({ id, label }) => {
          const prog = sectionProgress[id]
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-colors ${
                activeSection === id
                  ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                  : 'text-slate-200 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  prog.done ? 'bg-indigo-600' : prog.filled > 0 ? 'bg-amber-400' : 'bg-slate-600'
                }`} />
                <span className="flex-1 truncate">{label}</span>
                <span className={`text-[9px] ${prog.done ? 'text-indigo-400' : 'text-slate-500'}`}>
                  {prog.filled}/{prog.total}
                </span>
              </div>
            </button>
          )
        })}
      </div>
      <div className="mt-auto p-4 border-t border-white/5">
        <div className="text-[10px] text-slate-500 leading-relaxed">
          <p>필수 항목을 모두 채우면</p>
          <p>작성 단계로 넘어갈 수 있습니다</p>
        </div>
      </div>
    </aside>
  )
}

/* ─── Direction Section ─── */

function DirectionSection({
  data, project, sectionRef, isActive, onActivate, onUpdate,
}: {
  data: PrepData
  project: ProjectDetail
  sectionRef: (el: HTMLDivElement | null) => void
  isActive: boolean
  onActivate: () => void
  onUpdate: <K extends keyof PrepData>(key: K, value: PrepData[K]) => void
}) {
  const [loadingCore, setLoadingCore] = useState(false)
  const [coreCandidates, setCoreCandidates] = useState<{ style: string; coreMessage: string; reason: string }[] | null>(null)

  const generateCoreMessages = useCallback(() => {
    setLoadingCore(true)
    setCoreCandidates(null)
    fetch('/api/advanced/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'core-message',
        data: {
          passage: project.passage,
          book: project.book,
          chapter: String(project.chapter),
          verseStart: String(project.verseStart),
          verseEnd: project.verseEnd ? String(project.verseEnd) : undefined,
          passageStructure: data.passageStructure,
          sermonTitle: data.sermonTitle,
        },
      }),
    })
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          const parsed = JSON.parse(json.data.output)
          setCoreCandidates(parsed.candidates || [])
        }
      })
      .catch(() => {})
      .finally(() => setLoadingCore(false))
  }, [project, data.passageStructure, data.sermonTitle])

  const selectCoreMessage = useCallback((msg: string) => {
    onUpdate('coreMessage', msg)
    setCoreCandidates(null)
  }, [onUpdate])

  return (
    <div ref={sectionRef} onClick={onActivate}
      className={`border-l-4 border-l-indigo-500 pl-5 ${isActive ? 'bg-indigo-500/[0.07] -mx-5 px-5 py-4 rounded-xl' : ''}`}>
      <div className="flex items-center gap-2 mb-5">
        <span className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-bold flex items-center justify-center">1</span>
        <h3 className="text-base font-semibold text-white">설교 방향</h3>
        <span className="text-[10px] text-slate-500 ml-auto">설교 전체를 묶는 중심축입니다</span>
      </div>

      <div className="space-y-4">
        {/* Sermon Title */}
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">설교 제목 (가안)</label>
          <input
            value={data.sermonTitle}
            onChange={e => onUpdate('sermonTitle', e.target.value)}
            className="w-full text-sm font-serif font-medium text-white bg-[#04060f]/60 rounded-xl border border-white/5 px-4 py-2.5 outline-none focus:border-indigo-500/30 focus:bg-[#04060f]/60 transition-colors"
            placeholder="설교 제목을 적어보세요 (확정되지 않아도 괜찮습니다)"
          />
        </div>

        {/* Core Message */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">중심명제</label>
            <button
              onClick={(e) => { e.stopPropagation(); generateCoreMessages() }}
              disabled={loadingCore}
              className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 transition-colors border border-amber-500/20 disabled:opacity-50"
            >
              {loadingCore ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              AI 추천
            </button>
          </div>

          {loadingCore && (
            <div className="flex items-center gap-2 py-4 justify-center bg-[#04060f]/40 rounded-xl border border-dashed border-white/10 mb-2">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span className="text-xs text-slate-400">본문을 분석해 3가지 스타일의 중심명제를 생성 중...</span>
            </div>
          )}

          {coreCandidates && coreCandidates.length > 0 && (
            <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/5 to-indigo-500/5 border border-amber-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-white">3가지 중심명제 후보</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setCoreCandidates(null) }}
                  className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-1.5">
                {coreCandidates.map((c, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); selectCoreMessage(c.coreMessage) }}
                    className="w-full text-left p-2.5 rounded-xl bg-[#04060f]/80 border border-white/10 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 text-[8px] font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="text-[10px] font-bold text-amber-300">{c.style}</span>
                    </div>
                    <p className="text-xs text-slate-100 leading-relaxed font-serif">&ldquo;{c.coreMessage}&rdquo;</p>
                    <p className="text-[9px] text-slate-500 mt-1">{c.reason}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <textarea
            value={data.coreMessage}
            onChange={e => onUpdate('coreMessage', e.target.value)}
            className="w-full min-h-[72px] text-sm font-serif text-slate-100 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 outline-none resize-none focus:border-amber-500/30 focus:bg-[#04060f]/60 transition-colors leading-relaxed"
            placeholder="이 설교를 듣는 회중이 기억해야 할 한 문장은 무엇인가요?"
            rows={2}
          />
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] text-amber-300">설교 전체를 관통하는 핵심 명제를 한 문장으로 정리하세요</span>
            <span className="text-[10px] text-slate-500">{data.coreMessage.length}자</span>
          </div>
        </div>

        {/* Sermon Purpose & Expected Response */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">설교 목적</label>
            <textarea
              value={data.sermonPurpose}
              onChange={e => onUpdate('sermonPurpose', e.target.value)}
              className="w-full min-h-[80px] text-xs text-slate-200 bg-[#04060f]/60 rounded-xl border border-white/5 p-3 outline-none resize-none focus:border-indigo-500/30 focus:bg-[#04060f]/60 transition-colors leading-relaxed"
              placeholder="이 설교를 통해 회중이 무엇을 깨닫고 결단하게 하려는가?"
              rows={3}
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">기대 반응</label>
            <textarea
              value={data.expectedResponse}
              onChange={e => onUpdate('expectedResponse', e.target.value)}
              className="w-full min-h-[80px] text-xs text-slate-200 bg-[#04060f]/60 rounded-xl border border-white/5 p-3 outline-none resize-none focus:border-indigo-500/30 focus:bg-[#04060f]/60 transition-colors leading-relaxed"
              placeholder="회중이 이 말씀을 듣고 어떻게 반응하기를 기대하는가?"
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Passage Flow Section ─── */

function PassageFlowSection({
  data, sectionRef, isActive, onActivate, onUpdate, onGoToStudy,
}: {
  data: PrepData
  sectionRef: (el: HTMLDivElement | null) => void
  isActive: boolean
  onActivate: () => void
  onUpdate: <K extends keyof PrepData>(key: K, value: PrepData[K]) => void
  onGoToStudy?: () => void
}) {
  return (
    <div ref={sectionRef} onClick={onActivate}
      className={`border-l-4 border-l-teal-400 pl-5 ${isActive ? 'bg-teal-500/10 -mx-5 px-5 py-4 rounded-xl' : ''}`}>
      <div className="flex items-center gap-2 mb-5">
        <span className="w-6 h-6 rounded-full bg-teal-500/10 text-teal-300 text-xs font-bold flex items-center justify-center">2</span>
        <h3 className="text-base font-semibold text-white">본문 핵심 흐름</h3>
        <span className="text-[10px] text-slate-500 ml-auto">연구에서 확인한 핵심을 설교를 위해 선별합니다</span>
      </div>

      {/* Research Connection Banner */}
      <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-3 mb-5">
        <div className="flex items-center gap-1.5 mb-2">
          <svg className="w-3.5 h-3.5 text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-[10px] font-semibold text-teal-300 uppercase tracking-widest">연구에서 가져온 내용</span>
        </div>
        <div className="space-y-1 text-[11px] text-teal-300 leading-relaxed">
          <p>본문 구조: {data.passageStructure.slice(0, 120)}{data.passageStructure.length > 120 ? '...' : ''}</p>
          {data.keyWords.length > 0 && (
            <p>핵심 원어: {data.keyWords.map(k => k.word.replace(/\(.*?\)/g, '').trim()).slice(0, 6).join(', ')} — 각 단어의 문맥적 의미가 연구에서 확인됨</p>
          )}
          {data.contextPoints.length > 0 && (
            <p>문맥 포인트: {data.contextPoints.slice(0, 3).join(' · ')}</p>
          )}
        </div>
        <button
          onClick={onGoToStudy}
          className="mt-2 text-[10px] text-teal-300 hover:text-teal-300 underline underline-offset-2 transition-colors"
        >
          연구 내용 다시 보기 →
        </button>
      </div>

      <div className="space-y-4">
        {/* Passage Structure */}
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">본문 구조 요약</label>
          <textarea
            value={data.passageStructure}
            onChange={e => onUpdate('passageStructure', e.target.value)}
            className="w-full min-h-[80px] text-sm text-slate-100 bg-[#04060f]/60 rounded-xl border border-white/5 p-4 outline-none resize-none focus:border-teal-500/30 focus:bg-[#04060f]/60 transition-colors leading-relaxed font-serif"
            rows={3}
          />
        </div>

        {/* Context Points */}
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 block">문맥 포인트</label>
          <div className="space-y-1.5">
            {data.contextPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                <input
                  value={point}
                  onChange={e => {
                    const next = [...data.contextPoints]
                    next[i] = e.target.value
                    onUpdate('contextPoints', next)
                  }}
                  className="flex-1 text-xs text-slate-200 bg-transparent border-none outline-none py-0.5"
                />
              </div>
            ))}
            <button
              onClick={() => onUpdate('contextPoints', [...data.contextPoints, ''])}
              className="text-[10px] text-teal-300 hover:text-teal-300 mt-1 transition-colors"
            >
              + 문맥 포인트 추가
            </button>
          </div>
        </div>

        {/* Key Words */}
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 block">핵심 단어 / 원어</label>
          <div className="space-y-2">
            {data.keyWords.map((kw, i) => (
              <div key={i} className="bg-[#04060f]/60 rounded-xl border border-white/5 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-slate-100 font-greek">{kw.word}</span>
                  <span className="text-[10px] text-slate-500">·</span>
                  <span className="text-[11px] text-slate-400">{kw.meaning}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{kw.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Research Insights */}
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 block">연구 통찰 요약</label>
          <div className="space-y-1.5">
            {data.researchInsights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                <svg className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <textarea
                  value={insight}
                  onChange={e => {
                    const next = [...data.researchInsights]
                    next[i] = e.target.value
                    onUpdate('researchInsights', next)
                  }}
                  className="flex-1 text-xs text-slate-200 bg-transparent border-none outline-none resize-none leading-relaxed"
                  rows={2}
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => onUpdate('researchInsights', [...data.researchInsights, ''])}
            className="text-[10px] text-teal-300 hover:text-teal-300 mt-1 transition-colors"
          >
            + 통찰 추가
          </button>
        </div>

        {/* Link to Study */}
        <div className="text-right">
          <button
            onClick={onGoToStudy}
            className="text-[10px] text-teal-300 hover:text-teal-300 border border-teal-500/20 hover:border-teal-500/30 px-3 py-1.5 rounded transition-colors"
          >
            연구 전체 보기
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Outline Section ─── */

interface AiOutlineCandidate {
  styleTitle: string
  introductionSuggestion: string
  mainPoints: {
    title: string
    description: string
    relatedVerse: string
    applicationNote: string
    transitionNote: string
  }[]
  conclusionSuggestion: string
}

function OutlineSection({
  outlines, sectionRef, isActive, onActivate, onUpdate,
  onGenerateAI, onAddOutline, aiLoading, aiCandidates, onSelectCandidate, onDiscardCandidates,
}: {
  outlines: PrepOutline[]
  sectionRef: (el: HTMLDivElement | null) => void
  isActive: boolean
  onActivate: () => void
  onUpdate: (id: string, field: keyof PrepOutline, value: string) => void
  onGenerateAI?: () => void
  onAddOutline?: () => void
  aiLoading?: boolean
  aiCandidates?: AiOutlineCandidate[] | null
  onSelectCandidate?: (index: number) => void
  onDiscardCandidates?: () => void
}) {
  return (
    <div ref={sectionRef} onClick={onActivate}
      className={`border-l-4 border-l-amber-400 pl-5 ${isActive ? 'bg-amber-500/10 -mx-5 px-5 py-4 rounded-xl' : ''}`}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold flex items-center justify-center">3</span>
          <h3 className="text-base font-semibold text-white">대지 구조</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{outlines.length}개 대지</span>
          {onAddOutline && (
            <button
              onClick={(e) => { e.stopPropagation(); onAddOutline() }}
              className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5"
            >
              <Plus className="w-3 h-3" />
              대지 추가
            </button>
          )}
          {onGenerateAI && (
            <button
              onClick={(e) => { e.stopPropagation(); onGenerateAI() }}
              disabled={aiLoading}
              className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 transition-colors border border-amber-500/20 disabled:opacity-50"
            >
              {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              AI 대지 생성
            </button>
          )}
        </div>
      </div>

      {/* AI Candidate Selection */}
      {aiCandidates && aiCandidates.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/5 to-indigo-500/5 border border-amber-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">3가지 스타일 후보가 생성되었습니다. 하나를 선택하세요.</span>
            </div>
            {onDiscardCandidates && (
              <button
                onClick={(e) => { e.stopPropagation(); onDiscardCandidates() }}
                className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {aiCandidates.map((c, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); onSelectCandidate?.(i) }}
                className="text-left p-3 rounded-xl bg-[#04060f]/80 border border-white/10 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all group"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">{c.styleTitle}</span>
                </div>
                <p className="text-[10px] text-slate-400 mb-1">{c.mainPoints.length}개 대지</p>
                <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">{c.introductionSuggestion}</p>
                <div className="mt-2 text-[9px] text-amber-400/60 group-hover:text-amber-400 transition-colors opacity-0 group-hover:opacity-100">
                  클릭하여 적용 →
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {outlines.length === 0 && !aiCandidates && (
        <div className="text-center py-10 bg-[#04060f]/40 rounded-xl border border-dashed border-white/10 mb-5">
          <p className="text-sm text-slate-400 mb-1">대지 구조가 비어 있습니다</p>
          <p className="text-xs text-slate-500">AI로 3가지 스타일의 대지 후보를 생성하거나, 직접 추가해보세요</p>
        </div>
      )}

      <div className="space-y-5">
        {outlines.map((outline, i) => (
          <div key={outline.id} className="bg-[#04060f]/60 rounded-xl border border-white/5 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2.5 px-4 py-3 bg-[#04060f]/60 border-b border-white/5">
              <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <input
                value={outline.title}
                onChange={e => onUpdate(outline.id, 'title', e.target.value)}
                className="flex-1 text-sm font-medium text-white bg-transparent border-none outline-none"
                placeholder="대지 제목"
              />
              <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded">{outline.relatedVerse}</span>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1 block">설명</label>
                <textarea
                  value={outline.description}
                  onChange={e => onUpdate(outline.id, 'description', e.target.value)}
                  className="w-full text-xs text-slate-200 bg-[#04060f]/60 rounded-xl border border-white/5 p-3 outline-none resize-none focus:border-amber-500/30 transition-colors leading-relaxed"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1 block">관련 절</label>
                <input
                  value={outline.relatedVerse}
                  onChange={e => onUpdate(outline.id, 'relatedVerse', e.target.value)}
                  className="w-full text-xs text-slate-200 bg-[#04060f]/60 rounded-xl border border-white/5 px-3 py-1.5 outline-none focus:border-amber-500/30 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1 block">적용 메모</label>
                  <textarea
                    value={outline.applicationNote}
                    onChange={e => onUpdate(outline.id, 'applicationNote', e.target.value)}
                    className="w-full text-[10px] text-slate-400 bg-[#04060f]/60 rounded-xl border border-white/5 p-2 outline-none resize-none focus:border-indigo-500/30 transition-colors leading-relaxed"
                    rows={2}
                    placeholder="이 대지를 통해 회중이 받을 적용"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1 block">전환 메모</label>
                  <textarea
                    value={outline.transitionNote}
                    onChange={e => onUpdate(outline.id, 'transitionNote', e.target.value)}
                    className="w-full text-[10px] text-slate-400 bg-[#04060f]/60 rounded-xl border border-white/5 p-2 outline-none resize-none focus:border-blue-500/30 transition-colors leading-relaxed"
                    rows={2}
                    placeholder="다음 대지로의 연결"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Application Section ─── */

interface AiDirection {
  audienceTag: string
  direction: string
  reason: string
}

interface AiDirectionCandidate {
  styleTitle: string
  styleDescription: string
  directions: AiDirection[]
}

function ApplicationSection({
  points, congregationProfile, project, prepData,
  sectionRef, isActive, onActivate, onUpdate, onUpdateProfile, onSetPoints,
}: {
  points: ApplicationPoint[]
  congregationProfile: CongregationProfile
  project: ProjectDetail
  prepData: PrepData
  sectionRef: (el: HTMLDivElement | null) => void
  isActive: boolean
  onActivate: () => void
  onUpdate: (id: string, field: keyof ApplicationPoint, value: string) => void
  onUpdateProfile: (profile: CongregationProfile) => void
  onSetPoints: (points: ApplicationPoint[]) => void
}) {
  const [showProfileEditor, setShowProfileEditor] = useState(false)
  const [genStep, setGenStep] = useState<'idle' | 'loading-directions' | 'selecting' | 'loading-points' | 'review-points'>('idle')
  const [directionCandidates, setDirectionCandidates] = useState<AiDirectionCandidate[] | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null)
  const [pendingPoints, setPendingPoints] = useState<ApplicationPoint[]>([])
  const [selectedPendingIds, setSelectedPendingIds] = useState<Set<string>>(new Set())
  const [mergeMode, setMergeMode] = useState<'append' | 'replace'>('append')

  const generateDirections = useCallback(() => {
    setGenStep('loading-directions')
    setDirectionCandidates(null)
    setSelectedCandidate(null)
    fetch('/api/advanced/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'application-direction',
        data: {
          passage: project.passage,
          coreMessage: prepData.coreMessage,
          outlines: prepData.outlines,
          congregationProfile,
        },
      }),
    })
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          const parsed = JSON.parse(json.data.output)
          setDirectionCandidates(parsed.candidates || [parsed])
          setGenStep('selecting')
        } else {
          setGenStep('idle')
        }
      })
      .catch(() => setGenStep('idle'))
  }, [project, prepData, congregationProfile])

  const confirmDirections = useCallback((candidateIndex: number) => {
    setSelectedCandidate(candidateIndex)
    setGenStep('loading-points')
    const candidate = directionCandidates?.[candidateIndex]
    if (!candidate) { setGenStep('idle'); return }
    fetch('/api/advanced/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'application-generate',
        data: {
          passage: project.passage,
          coreMessage: prepData.coreMessage,
          outlines: prepData.outlines,
          congregationProfile,
          directions: candidate.directions,
        },
      }),
    })
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          const parsed = JSON.parse(json.data.output)
          const newPoints: ApplicationPoint[] = (parsed.applications || []).map((a: any, i: number) => ({
            id: `app-${Date.now()}-${i}`,
            point: a.point,
            audienceTag: a.audienceTag,
            pastoralNote: a.pastoralNote || '',
          }))
          if (newPoints.length > 0) {
            setPendingPoints(newPoints)
            setSelectedPendingIds(new Set(newPoints.map(p => p.id)))
            setMergeMode(points.length > 0 ? 'append' : 'append')
            setGenStep('review-points')
          } else {
            setGenStep('idle')
            setDirectionCandidates(null)
            setSelectedCandidate(null)
          }
        } else {
          setGenStep('idle')
          setDirectionCandidates(null)
          setSelectedCandidate(null)
        }
      })
      .catch(() => {
        setGenStep('idle')
        setDirectionCandidates(null)
        setSelectedCandidate(null)
      })
  }, [project, prepData, congregationProfile, directionCandidates, points, onSetPoints])

  const discardDirections = useCallback(() => {
    setDirectionCandidates(null)
    setSelectedCandidate(null)
    setGenStep('idle')
  }, [])

  const hasProfile = congregationProfile.dominantAgeGroups.length > 0

  return (
    <div ref={sectionRef} onClick={onActivate}
      className={`border-l-4 border-l-blue-400 pl-5 ${isActive ? 'bg-blue-500/10 -mx-5 px-5 py-4 rounded-xl' : ''}`}>
      <div className="flex items-center gap-2 mb-5">
        <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-300 text-xs font-bold flex items-center justify-center">4</span>
        <h3 className="text-base font-semibold text-white">적용과 회중 연결</h3>
        <span className="text-[10px] text-slate-500 ml-auto">말씀이 오늘의 회중에게 어떻게 들려야 하는가</span>
      </div>

      {/* Congregation Profile Banner */}
      <div className={`rounded-xl p-3 mb-4 border transition-colors ${
        hasProfile
          ? 'bg-blue-500/10 border-blue-500/20'
          : 'bg-amber-500/10 border-amber-500/20'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-blue-300" />
            <span className="text-[10px] font-semibold text-blue-300 uppercase tracking-widest">회중 프로필</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setShowProfileEditor(true) }}
            className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5"
          >
            <Settings2 className="w-3 h-3" />
            {hasProfile ? '편집' : '설정'}
          </button>
        </div>
        {hasProfile ? (
          <div className="mt-2 text-[11px] text-slate-300 leading-relaxed">
            <p>연령대: {congregationProfile.dominantAgeGroups.join(', ')}</p>
            <p>신앙 수준: {FAITH_MATURITY_OPTIONS.find(o => o.value === congregationProfile.faithMaturity)?.label || congregationProfile.faithMaturity}</p>
            {congregationProfile.churchContext && <p>교회 상황: {congregationProfile.churchContext}</p>}
          </div>
        ) : (
          <p className="mt-2 text-[11px] text-amber-300">회중 프로필을 설정하면 AI가 더 정확한 적용을 생성할 수 있습니다</p>
        )}
      </div>

      {/* AI Application Generation */}
      {genStep === 'idle' && !directionCandidates && (
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-slate-500">{points.length}개 적용 포인트</span>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); generateDirections() }}
              className="flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 hover:text-blue-200 transition-colors border border-blue-500/20"
            >
              <Sparkles className="w-3 h-3" />
              AI 적용 생성
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                const newId = `app-${Date.now()}`
                onSetPoints([...points, { id: newId, point: '', audienceTag: '', pastoralNote: '' }])
              }}
              className="flex items-center gap-1 text-[10px] px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5"
            >
              <Plus className="w-3 h-3" />
              수동 추가
            </button>
          </div>
        </div>
      )}

      {/* Loading Directions */}
      {genStep === 'loading-directions' && (
        <div className="flex items-center gap-2 py-6 justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
          <span className="text-xs text-slate-400">회중 프로필과 본문을 분석해 적용 방향을 생성 중...</span>
        </div>
      )}

      {/* Direction Selection */}
      {directionCandidates && directionCandidates.length > 0 && genStep === 'selecting' && (
        <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-white">적용 방향을 선택하세요</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); discardDirections() }}
              className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {directionCandidates.map((c, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); confirmDirections(i) }}
                disabled={false}
                className="text-left p-3 rounded-xl bg-[#04060f]/80 border border-white/10 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group disabled:opacity-50"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 text-[9px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">{c.styleTitle}</span>
                </div>
                <p className="text-[10px] text-slate-500 mb-2">{c.styleDescription}</p>
                <div className="space-y-1">
                  {c.directions.map((d, di) => (
                    <div key={di} className="flex items-center gap-1.5 text-[9px]">
                      <span className="px-1 py-0.5 rounded bg-blue-500/10 text-blue-300 shrink-0">{d.audienceTag}</span>
                      <span className="text-slate-400">{d.direction}</span>
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading Points */}
      {genStep === 'loading-points' && (
        <div className="flex items-center gap-2 py-6 justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          <span className="text-xs text-slate-400">선택한 방향으로 구체적인 적용 포인트를 생성 중...</span>
        </div>
      )}

      {/* Review Generated Points */}
      {genStep === 'review-points' && pendingPoints.length > 0 && (
        <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-indigo-500/5 to-blue-500/5 border border-indigo-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white">생성된 적용 포인트</span>
              <span className="text-[10px] text-slate-500">({pendingPoints.length}개)</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setGenStep('idle'); setDirectionCandidates(null); setSelectedCandidate(null); setPendingPoints([]) }}
              className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Merge mode toggle — only when existing points exist */}
          {points.length > 0 && (
            <div className="flex items-center gap-2 mb-3 bg-[#04060f]/60 rounded-xl p-2 border border-white/5">
              <span className="text-[10px] text-slate-400 mr-1">적용 방식:</span>
              <button
                onClick={(e) => { e.stopPropagation(); setMergeMode('append') }}
                className={`text-[10px] px-2 py-1 rounded-lg transition-colors ${mergeMode === 'append' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200'}`}
              >
                기존 목록에 추가
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setMergeMode('replace') }}
                className={`text-[10px] px-2 py-1 rounded-lg transition-colors ${mergeMode === 'replace' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'}`}
              >
                전체 교체
              </button>
            </div>
          )}

          {/* Generated point cards with checkboxes */}
          <div className="space-y-2 mb-3">
            {pendingPoints.map((app, i) => (
              <div
                key={app.id}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedPendingIds(prev => {
                    const next = new Set(prev)
                    if (next.has(app.id)) { next.delete(app.id) } else { next.add(app.id) }
                    return next
                  })
                }}
                className={`rounded-xl p-3 border cursor-pointer transition-all ${
                  selectedPendingIds.has(app.id)
                    ? 'bg-indigo-500/10 border-indigo-500/30'
                    : 'bg-[#04060f]/60 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-4 h-4 rounded border-2 mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                    selectedPendingIds.has(app.id)
                      ? 'bg-indigo-500 border-indigo-500'
                      : 'border-white/20'
                  }`}>
                    {selectedPendingIds.has(app.id) && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-300 text-[9px] font-bold flex items-center justify-center">{i + 1}</span>
                      {app.audienceTag && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300">{app.audienceTag}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-100 leading-relaxed font-serif">{app.point}</p>
                    {app.pastoralNote && (
                      <p className="text-[9px] text-slate-500 mt-1 italic">{app.pastoralNote}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                const selected = pendingPoints.filter(p => selectedPendingIds.has(p.id))
                if (selected.length === 0) return
                if (mergeMode === 'replace') {
                  onSetPoints(selected)
                } else {
                  onSetPoints([...points, ...selected])
                }
                setGenStep('idle')
                setDirectionCandidates(null)
                setSelectedCandidate(null)
                setPendingPoints([])
              }}
              disabled={selectedPendingIds.size === 0}
              className="flex-1 text-[11px] py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors disabled:opacity-40"
            >
              {mergeMode === 'replace' ? '교체 적용' : '목록에 추가'} ({selectedPendingIds.size}개)
            </button>
            {selectedPendingIds.size < pendingPoints.length && (
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedPendingIds(new Set(pendingPoints.map(p => p.id))) }}
                className="text-[11px] px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 transition-colors"
              >
                모두 선택
              </button>
            )}
          </div>
        </div>
      )}

      {/* Application Points List */}
      <div className="space-y-3">
        {points.length === 0 && genStep === 'idle' && (
          <div className="text-center py-8 bg-[#04060f]/40 rounded-xl border border-dashed border-white/10">
            <p className="text-sm text-slate-400 mb-1">적용 포인트가 없습니다</p>
            <p className="text-xs text-slate-500">회중 프로필을 설정하고 AI로 생성하거나, 직접 추가해보세요</p>
          </div>
        )}
        {points.map((app, i) => (
          <div key={app.id} className="bg-[#04060f]/60 rounded-xl border border-white/5 p-4 group">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-300 text-[10px] font-medium flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <input
                value={app.audienceTag}
                onChange={e => onUpdate(app.id, 'audienceTag', e.target.value)}
                className="text-[10px] font-medium text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded px-2 py-0.5 outline-none focus:border-blue-500/30"
                placeholder="대상 그룹"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setGenStep('loading-points')
                  fetch('/api/advanced/ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      type: 'application-generate',
                      data: {
                        passage: project.passage,
                        coreMessage: prepData.coreMessage,
                        outlines: prepData.outlines,
                        congregationProfile,
                        directions: [{ audienceTag: app.audienceTag, direction: app.point, reason: '' }],
                      },
                    }),
                  })
                    .then(r => r.json())
                    .then(json => {
                      if (json.success) {
                        const parsed = JSON.parse(json.data.output)
                        const newPoints: ApplicationPoint[] = (parsed.applications || []).map((a: any, idx: number) => ({
                          id: `app-${Date.now()}-${idx}`,
                          point: a.point,
                          audienceTag: a.audienceTag || app.audienceTag,
                          pastoralNote: a.pastoralNote || '',
                        }))
                        if (newPoints.length > 0) {
                          setPendingPoints(newPoints)
                          setSelectedPendingIds(new Set(newPoints.map(p => p.id)))
                          setMergeMode('replace')
                          setGenStep('review-points')
                        } else {
                          setGenStep('idle')
                        }
                      } else {
                        setGenStep('idle')
                      }
                    })
                    .catch(() => setGenStep('idle'))
                }}
                className="p-1 rounded hover:bg-white/10 text-slate-600 hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100"
                title="이 포인트 다시 생성"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            <textarea
              value={app.point}
              onChange={e => onUpdate(app.id, 'point', e.target.value)}
              className="w-full text-sm text-slate-100 bg-transparent border-none outline-none resize-none leading-relaxed font-serif"
              rows={2}
              placeholder="적용 포인트를 입력하세요"
            />
            <div className="mt-2 pt-2 border-t border-white/5">
              <div className="flex items-start gap-1.5">
                <svg className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <textarea
                  value={app.pastoralNote}
                  onChange={e => onUpdate(app.id, 'pastoralNote', e.target.value)}
                  className="flex-1 text-[10px] text-slate-400 bg-transparent border-none outline-none resize-none leading-relaxed"
                  rows={2}
                  placeholder="목회적 분별 메모..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Congregation Profile Editor Modal */}
      {showProfileEditor && (
        <CongregationProfileEditor
          profile={congregationProfile}
          onSave={(profile) => {
            onUpdateProfile(profile)
            setShowProfileEditor(false)
          }}
          onClose={() => setShowProfileEditor(false)}
        />
      )}
    </div>
  )
}

/* ─── Congregation Profile Editor ─── */

function CongregationProfileEditor({
  profile, onSave, onClose,
}: {
  profile: CongregationProfile
  onSave: (profile: CongregationProfile) => void
  onClose: () => void
}) {
  const [local, setLocal] = useState<CongregationProfile>({ ...profile })

  const toggleAgeGroup = (group: string) => {
    setLocal(prev => ({
      ...prev,
      dominantAgeGroups: prev.dominantAgeGroups.includes(group)
        ? prev.dominantAgeGroups.filter(g => g !== group)
        : [...prev.dominantAgeGroups, group],
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-[#0a0e1a] border border-white/10 rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">회중 프로필 설정</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto scrollbar-thin">
          {/* Age Groups */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 block">주요 연령대 (중복 선택 가능)</label>
            <div className="flex flex-wrap gap-1.5">
              {AGE_GROUP_OPTIONS.map(group => (
                <button
                  key={group}
                  onClick={() => toggleAgeGroup(group)}
                  className={`text-[10px] px-2.5 py-1.5 rounded-lg border transition-colors ${
                    local.dominantAgeGroups.includes(group)
                      ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>

          {/* Faith Maturity */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 block">신앙 성숙도 분포</label>
            <div className="flex flex-wrap gap-1.5">
              {FAITH_MATURITY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setLocal(prev => ({ ...prev, faithMaturity: opt.value as CongregationProfile['faithMaturity'] }))}
                  className={`text-[10px] px-2.5 py-1.5 rounded-lg border transition-colors ${
                    local.faithMaturity === opt.value
                      ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Church Context */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">교회 상황 / 특징</label>
            <textarea
              value={local.churchContext}
              onChange={e => setLocal(prev => ({ ...prev, churchContext: e.target.value }))}
              className="w-full min-h-[60px] text-xs text-slate-200 bg-[#04060f]/60 rounded-xl border border-white/5 p-3 outline-none resize-none focus:border-blue-500/30 transition-colors leading-relaxed"
              placeholder="예: 도심형 대형교회, 농촌 소형교회, 개척 3년차, 교회 분열 중..."
              rows={2}
            />
          </div>

          {/* Pastoral Priorities */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">목회적 우선순위</label>
            <textarea
              value={local.pastoralPriorities}
              onChange={e => setLocal(prev => ({ ...prev, pastoralPriorities: e.target.value }))}
              className="w-full min-h-[60px] text-xs text-slate-200 bg-[#04060f]/60 rounded-xl border border-white/5 p-3 outline-none resize-none focus:border-blue-500/30 transition-colors leading-relaxed"
              placeholder="예: 제자양육 중심, 전도와 부흥, 성도 간 회복과 화해..."
              rows={2}
            />
          </div>

          {/* Season Note */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">시즌 / 특이사항</label>
            <textarea
              value={local.seasonNote}
              onChange={e => setLocal(prev => ({ ...prev, seasonNote: e.target.value }))}
              className="w-full min-h-[60px] text-xs text-slate-200 bg-[#04060f]/60 rounded-xl border border-white/5 p-3 outline-none resize-none focus:border-blue-500/30 transition-colors leading-relaxed"
              placeholder="예: 사순절, 부활절, 추수감사절, 교회 창립기념일, 성탄절..."
              rows={2}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/5">
          <button
            onClick={onClose}
            className="text-[11px] px-3 py-1.5 rounded-xl text-slate-400 hover:text-slate-200 border border-white/5 hover:border-white/10 transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => onSave(local)}
            className="text-[11px] px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors font-medium"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Delivery Section ─── */

function DeliverySection({
  data, project, sectionRef, isActive, onActivate, onUpdate,
}: {
  data: PrepData
  project: ProjectDetail
  sectionRef: (el: HTMLDivElement | null) => void
  isActive: boolean
  onActivate: () => void
  onUpdate: <K extends keyof PrepData>(key: K, value: PrepData[K]) => void
}) {
  const [loading, setLoading] = useState(false)
  const [candidates, setCandidates] = useState<DeliveryBlueprintCandidate[] | null>(null)

  const generateBlueprints = useCallback(() => {
    setLoading(true)
    setCandidates(null)
    fetch('/api/advanced/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'delivery',
        data: {
          passage: project.passage,
          coreMessage: data.coreMessage,
          outlines: data.outlines,
          applicationPoints: data.applicationPoints,
          congregationProfile: data.congregationProfile,
        },
      }),
    })
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          const parsed = JSON.parse(json.data.output)
          setCandidates(parsed.candidates || [])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [project, data.coreMessage, data.outlines, data.applicationPoints, data.congregationProfile])

  const applyBlueprint = useCallback((candidate: DeliveryBlueprintCandidate) => {
    onUpdate('deliveryIntro', candidate.deliveryIntro)
    onUpdate('deliveryFlow', candidate.deliveryFlow)
    onUpdate('deliveryTransitions', (candidate.transitions || []).map(t => t.text))
    onUpdate('deliveryConclusion', candidate.deliveryConclusion)
    setCandidates(null)
  }, [onUpdate])

  const discard = useCallback(() => {
    setCandidates(null)
  }, [])

  return (
    <div ref={sectionRef} onClick={onActivate}
      className={`border-l-4 border-l-purple-400 pl-5 ${isActive ? 'bg-purple-500/10 -mx-5 px-5 py-4 rounded-xl' : ''}`}>
      <div className="flex items-center gap-2 mb-5">
        <span className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-300 text-xs font-bold flex items-center justify-center">5</span>
        <h3 className="text-base font-semibold text-white">전달 흐름</h3>
        <span className="text-[10px] text-slate-500 ml-auto">원고가 아닌 전달 설계입니다</span>
      </div>

      <div className="space-y-4">
        {/* AI Generation */}
        {!loading && !candidates && (
          <div className="flex justify-end">
            <button
              onClick={(e) => { e.stopPropagation(); generateBlueprints() }}
              className="flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 transition-colors border border-purple-500/20"
            >
              <Sparkles className="w-3 h-3" />
              AI 전달 설계도 생성
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-2 py-6 justify-center bg-[#04060f]/40 rounded-xl border border-dashed border-white/10">
            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            <span className="text-xs text-slate-400">3가지 전달 아키타입(선포형/대화형/서사형)을 분석 중...</span>
          </div>
        )}

        {/* Candidates */}
        {candidates && candidates.length > 0 && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 border border-purple-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white">3가지 전달 설계도</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); discard() }}
                className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {candidates.map((c, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); applyBlueprint(c) }}
                  className="text-left p-3 rounded-xl bg-[#04060f]/80 border border-white/10 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-[9px] font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">{c.archetype}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed mb-2">{c.description}</p>
                  <div className="flex items-center gap-2 text-[9px] text-slate-500">
                    <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300">{c.emotionCurve}</span>
                    <span>도입 {c.timeAllocation?.intro} · 결론 {c.timeAllocation?.conclusion}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Introduction */}
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">도입 방향</label>
          <textarea
            value={data.deliveryIntro}
            onChange={e => onUpdate('deliveryIntro', e.target.value)}
            className="w-full min-h-[72px] text-sm text-slate-100 bg-[#04060f]/60 rounded-xl border border-white/5 p-4 outline-none resize-none focus:border-purple-500/30 focus:bg-[#04060f]/60 transition-colors leading-relaxed font-serif italic"
            rows={3}
          />
        </div>

        {/* Flow */}
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">전개 흐름</label>
          <textarea
            value={data.deliveryFlow}
            onChange={e => onUpdate('deliveryFlow', e.target.value)}
            className="w-full min-h-[72px] text-sm text-slate-100 bg-[#04060f]/60 rounded-xl border border-white/5 p-4 outline-none resize-none focus:border-purple-500/30 focus:bg-[#04060f]/60 transition-colors leading-relaxed"
            rows={3}
          />
        </div>

        {/* Transitions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">전환 지점</label>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onUpdate('deliveryTransitions', [...data.deliveryTransitions, ''])
              }}
              className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5"
            >
              <Plus className="w-3 h-3" />
              전환 추가
            </button>
          </div>
          <div className="space-y-2">
            {data.deliveryTransitions.length === 0 && (
              <div className="text-center py-6 bg-[#04060f]/40 rounded-xl border border-dashed border-white/10">
                <p className="text-xs text-slate-500">대지 사이의 전환 문장을 추가해보세요</p>
                <p className="text-[10px] text-slate-600 mt-0.5">예: &ldquo;그렇다면 우리는 어떻게 반응해야 할까요?&rdquo;</p>
              </div>
            )}
            {data.deliveryTransitions.map((t, i) => (
              <div key={i} className="flex items-start gap-2 bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 group">
                <span className="text-[10px] text-purple-500 font-medium w-16 shrink-0 mt-0.5">
                  {i === 0 ? '도입→1' : i === data.deliveryTransitions.length - 1 ? `${i}→결론` : `${i}→${i + 1}`}
                </span>
                <textarea
                  value={t}
                  onChange={e => {
                    const next = [...data.deliveryTransitions]
                    next[i] = e.target.value
                    onUpdate('deliveryTransitions', next)
                  }}
                  className="flex-1 text-xs text-slate-200 bg-transparent border-none outline-none resize-none leading-relaxed"
                  rows={2}
                  placeholder="다음 단계로 이어지는 전환 문장을 적어보세요"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const next = data.deliveryTransitions.filter((_, idx) => idx !== i)
                    onUpdate('deliveryTransitions', next)
                  }}
                  className="p-1 rounded hover:bg-white/10 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Conclusion */}
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">마무리 방향</label>
          <textarea
            value={data.deliveryConclusion}
            onChange={e => onUpdate('deliveryConclusion', e.target.value)}
            className="w-full min-h-[72px] text-sm text-slate-100 bg-[#04060f]/60 rounded-xl border border-white/5 p-4 outline-none resize-none focus:border-purple-300 focus:bg-[#04060f]/60 transition-colors leading-relaxed font-serif"
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}

/* ─── Recent Prep Activity ─── */

function RecentPrepActivity() {
  return (
    <div className="bg-[#04060f]/60 rounded-xl border border-white/5 overflow-hidden">
      <div className="px-5 py-3 border-b border-white/5 bg-[#04060f]/60">
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">최근 작업</span>
        </div>
      </div>
      <div className="divide-y divide-white/5">
        {RECENT_ACTIVITY.map((entry, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-2.5">
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              entry.section === 'prep' ? 'bg-amber-400' :
              entry.section === 'manuscript' ? 'bg-indigo-400' :
              'bg-teal-400'
            }`} />
            <span className="text-[10px] text-slate-500 w-14 shrink-0 font-mono">{entry.time}</span>
            <span className="text-xs text-slate-200 flex-1">{entry.description}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
              entry.section === 'prep' ? 'bg-amber-500/10 text-amber-300' :
              entry.section === 'manuscript' ? 'bg-indigo-500/10 text-indigo-300' :
              'bg-teal-500/10 text-teal-300'
            }`}>
              {entry.section === 'prep' ? '준비' : entry.section === 'manuscript' ? '작성' : '연구'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Prep Status Bar ─── */

function PrepStatusBar({
  overallProgress, allRequiredDone, prepStatus,
  outlineCount, appCount, totalOutlineWords,
  onGoToStudy, onGoToManuscript,
}: {
  overallProgress: number
  allRequiredDone: boolean
  prepStatus: string
  outlineCount: number
  appCount: number
  totalOutlineWords: number
  onGoToStudy: () => void
  onGoToManuscript: () => void
}) {
  return (
    <div className="bg-[#04060f]/60 border-t border-white/5 px-5 py-2.5 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${allRequiredDone ? 'bg-indigo-400' : 'bg-amber-400'}`} />
          준비도 <span className={`font-semibold ${allRequiredDone ? 'text-indigo-400' : 'text-amber-300'}`}>{overallProgress}%</span>
        </span>
        <span>대지 {outlineCount}개</span>
        <span>적용 {appCount}건</span>
        <span>대지 본문 {totalOutlineWords.toLocaleString()}자</span>
        <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded">
          준비 이력 {PREP_VERSIONS.length}개
        </span>
        {allRequiredDone && (
          <span className="text-indigo-400 font-bold">작성으로 넘길 준비가 되었습니다</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onGoToStudy}
          className="text-[11px] text-slate-400 hover:text-slate-100 border border-white/5 hover:border-white/5 rounded-xl px-3 py-1.5 transition-colors"
        >
          ← 연구로 돌아가기
        </button>
        <button
          onClick={onGoToManuscript}
          disabled={!allRequiredDone}
          className={`text-[11px] rounded-xl px-3 py-1.5 transition-colors font-medium ${
            allRequiredDone
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-white/5 text-slate-500 cursor-not-allowed'
          }`}
        >
          이 구조로 원고 쓰기 →
        </button>
      </div>
    </div>
  )
}
