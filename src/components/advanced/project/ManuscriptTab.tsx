'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Loader2, Sparkles, Plus, X, Trash2, BookOpen, Link2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ProjectDetail } from '@/lib/advanced/types'
import { EMPTY_MANUSCRIPT } from '@/lib/advanced/johnManuscriptData'
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
import ManuscriptStudio from './ManuscriptStudio'

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
    hint: '준비 단계에서 정리한 대지 구조의 제목과 설명을 바탕으로 각 대지를 풀어가세요. 연구에서 확인한 원어 의미와 주석을 설교 문장으로 자연스럽게 녹여보십시오. 우측 상단의 AI 추천 버튼을 활용하면 대지 초안을 빠르게 생성할 수 있습니다.',
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

/** Levenshtein distance — used for fuzzy title matching between prep outlines and manuscript sections */
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] !== b[j - 1] ? 1 : 0),
      )
  return dp[m][n]
}

/** Similarity score 0-1 between two strings (normalized Levenshtein) */
function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1
  return 1 - levenshtein(a, b) / maxLen
}

/** Sync an already-loaded manuscript with the latest prep outlines.
 *  - Smart matching: uses title similarity (Levenshtein) instead of index.
 *  - If prep has more outlines than body-sections → appends new empty sections.
 *  - If prep has fewer outlines → keeps extra sections that have content.
 *  - Updates labels, passages, prepInsights, outlinePoints, researchPoints, applicationDirection from prep. */
function syncManuscriptWithPrep(ms: JohnManuscriptData, prepRaw: any): JohnManuscriptData {
  const outlines = prepRaw?.outlines || []
  if (outlines.length === 0) return ms

  const bodySections = ms.sections.filter(s => s.type === 'body')
  const fixedSections = ms.sections.filter(s => s.type !== 'body')
  const researchInsights = prepRaw?.researchInsights || []
  const applicationPoints = prepRaw?.applicationPoints || []

  // Smart matching: find best existing section for each outline by title similarity
  const usedIdx = new Set<number>()
  const synced: SermonSection[] = outlines.map((o: any, _i: number) => {
    const outlineTitle = o.title || ''
    let bestIdx = -1
    let bestScore = 0

    bodySections.forEach((s, idx) => {
      if (usedIdx.has(idx)) return
      const secTitle = s.label.replace(/^\d+\.\s*/, '')
      const score = similarity(outlineTitle, secTitle)
      // Also check passage match as tiebreaker
      const passageBonus = o.relatedVerse && s.passage === o.relatedVerse ? 0.2 : 0
      if (score + passageBonus > bestScore) {
        bestScore = score + passageBonus
        bestIdx = idx
      }
    })

    const label = `${_i + 1}. ${outlineTitle}`
    // Prep 데이터 매핑
    const sectionResearch = researchInsights.length > 0
      ? researchInsights.filter((_: any, idx: number) => idx % outlines.length === _i)
      : []
    const sectionApp = applicationPoints.length > 0
      ? applicationPoints.filter((_: any, idx: number) => idx % outlines.length === _i)
          .map((ap: any) => `[${ap.audienceTag || '전체'}] ${ap.point}`)
      : []

    if (bestIdx >= 0 && bestScore > 0.3) {
      usedIdx.add(bestIdx)
      const existing = bodySections[bestIdx]
      return {
        ...existing,
        id: `body-${_i + 1}`,
        label,
        passage: o.relatedVerse || existing.passage || '',
        researchPoints: sectionResearch.length > 0 ? sectionResearch : existing.researchPoints,
        applicationDirection: sectionApp.length > 0 ? sectionApp.join('\n') : existing.applicationDirection,
      }
    }
    // No match → new empty section with prep data
    return {
      id: `body-${_i + 1}`,
      type: 'body' as const,
      label,
      passage: o.relatedVerse || '',
      content: '',
      aiGenerated: false,
      researchPoints: sectionResearch,
      applicationDirection: sectionApp.length > 0 ? sectionApp.join('\n') : undefined,
    }
  })

  // Keep extra body sections that have user content (don't delete their work)
  const extras = bodySections.filter((_, idx) => !usedIdx.has(idx) && bodySections[idx].content.trim())

  const prepInsights: string[] = [
    ...(prepRaw?.researchInsights || []),
    ...(prepRaw?.passageStructure ? [prepRaw.passageStructure] : []),
    ...(prepRaw?.applicationPoints || []).map((ap: any) => `[${ap.audienceTag || '전체'}] ${ap.point}`),
  ]
  const outlinePoints = outlines.map((o: any) => ({
    title: o.title || '', passage: o.relatedVerse || '', content: o.description || '',
  }))

  // Re-assemble in canonical order
  const intro = fixedSections.find(s => s.id === 'intro')
  const conclusion = fixedSections.find(s => s.id === 'conclusion')
  const application = fixedSections.find(s => s.id === 'application')

  // 적용 섹션에 Prep의 적용 포인트 전체 전달
  const allAppPoints = applicationPoints.map((ap: any) => `[${ap.audienceTag || '전체'}] ${ap.point}`).join('\n')
  const updatedApplication = application ? {
    ...application,
    applicationDirection: allAppPoints || application.applicationDirection,
  } : application

  return {
    ...ms,
    sections: [intro!, ...synced, ...extras, conclusion!, updatedApplication!].filter(Boolean),
    coreMessage: prepRaw?.coreMessage || ms.coreMessage,
    audience: (() => {
      if (prepRaw?.congregationProfile) {
        const p = prepRaw.congregationProfile
        return [p.ageGroup, p.faithMaturity].filter(Boolean).join(' · ')
      }
      return ms.audience
    })(),
    prepInsights,
    outlinePoints,
  }
}

function buildManuscriptFromPrep(project: ProjectDetail, prepRaw: any): JohnManuscriptData {
  const sections: SermonSection[] = []

  sections.push({
    id: 'intro',
    type: 'introduction',
    label: '서론',
    content: prepRaw?.deliveryIntro || '',
    aiGenerated: false,
  })

  const outlines = prepRaw?.outlines || []
  const researchInsights = prepRaw?.researchInsights || []
  const applicationPoints = prepRaw?.applicationPoints || []

  if (outlines.length > 0) {
    outlines.forEach((o: any, i: number) => {
      // Prep의 연구 통찰을 각 대지에 분배
      const sectionResearch = researchInsights.length > 0
        ? researchInsights.filter((_: any, idx: number) => idx % outlines.length === i)
        : []
      // Prep의 적용 포인트를 각 대지에 분배
      const sectionApp = applicationPoints.length > 0
        ? applicationPoints.filter((_: any, idx: number) => idx % outlines.length === i)
            .map((ap: any) => `[${ap.audienceTag || '전체'}] ${ap.point}`)
        : []

      sections.push({
        id: `body-${i + 1}`,
        type: 'body',
        label: o.title ? `${i + 1}. ${o.title}` : `${i + 1}. 본론`,
        passage: o.relatedVerse || '',
        content: '',
        aiGenerated: false,
        researchPoints: sectionResearch,
        applicationDirection: sectionApp.length > 0 ? sectionApp.join('\n') : undefined,
      })
    })
  } else {
    for (let i = 0; i < 3; i++) {
      sections.push({
        id: `body-${i + 1}`,
        type: 'body',
        label: `${i + 1}. 본론`,
        content: '',
        aiGenerated: false,
        researchPoints: researchInsights.length > 0 ? [researchInsights[i % researchInsights.length]] : [],
      })
    }
  }

  sections.push({
    id: 'conclusion',
    type: 'conclusion',
    label: '결론',
    content: prepRaw?.deliveryConclusion || '',
    aiGenerated: false,
  })

  // 적용 섹션에 Prep의 적용 포인트 전체 전달
  const allAppPoints = applicationPoints.map((ap: any) => `[${ap.audienceTag || '전체'}] ${ap.point}`).join('\n')
  sections.push({
    id: 'application',
    type: 'application',
    label: '적용',
    content: '',
    aiGenerated: false,
    applicationDirection: allAppPoints || undefined,
  })

  const outlinePoints = outlines.map((o: any) => ({
    title: o.title || '',
    passage: o.relatedVerse || '',
    content: o.description || '',
  }))

  const prepInsights: string[] = [
    ...(prepRaw?.researchInsights || []),
    ...(prepRaw?.passageStructure ? [prepRaw.passageStructure] : []),
    ...(prepRaw?.applicationPoints || []).map(
      (ap: any) => `[${ap.audienceTag || '전체'}] ${ap.point}`
    ),
  ]

  let audience = ''
  if (prepRaw?.congregationProfile) {
    const p = prepRaw.congregationProfile
    audience = [p.ageGroup, p.faithMaturity].filter(Boolean).join(' · ')
  }
  if (!audience && Array.isArray(project.audience)) {
    audience = project.audience.join(', ')
  }

  return {
    title: prepRaw?.sermonTitle || project.title || '',
    oneSentenceSummary: '',
    passage: project.passage || '',
    sermonDate: project.sermonDate || '',
    audience,
    tone: '',
    sections,
    illustrationNotes: [],
    referenceNotes: [],
    coreMessage: prepRaw?.coreMessage || project.coreMessage || '',
    outlinePoints,
    prepInsights,
    warningPoints: [],
    greekWords: [],
    relatedPassages: [],
  }
}

export default function ManuscriptTab({ project }: Props) {
  const router = useRouter()
  const [manuscript, setManuscript] = useState<JohnManuscriptData>(() => ({
    ...EMPTY_MANUSCRIPT,
    title: project.title || '',
    passage: project.passage || '',
    sermonDate: project.sermonDate || '',
    coreMessage: project.coreMessage || '',
    audience: Array.isArray(project.audience) ? project.audience.join(', ') : project.audience || '',
    sections: [
      { id: 'intro', type: 'introduction' as const, label: '서론', content: '', aiGenerated: false },
      { id: 'body-1', type: 'body' as const, label: '1. 본론', content: '', aiGenerated: false },
      { id: 'body-2', type: 'body' as const, label: '2. 본론', content: '', aiGenerated: false },
      { id: 'body-3', type: 'body' as const, label: '3. 본론', content: '', aiGenerated: false },
      { id: 'conclusion', type: 'conclusion' as const, label: '결론', content: '', aiGenerated: false },
      { id: 'application', type: 'application' as const, label: '적용', content: '', aiGenerated: false },
    ],
  }))
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('edit')
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [showPrepPanel, setShowPrepPanel] = useState(true)
  const [showVersions, setShowVersions] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [lastPrepSyncAt, setLastPrepSyncAt] = useState<number | null>(null)
  const [hasPrepData, setHasPrepData] = useState(false)
  const [rehearsalPhase, setRehearsalPhase] = useState<'idle' | 'setup' | 'running' | 'finished'>('idle')
  const [rehearsalDuration, setRehearsalDuration] = useState(20)
  const [rehearsalElapsed, setRehearsalElapsed] = useState(0)
  const [rehearsalPaused, setRehearsalPaused] = useState(false)
  const [sectionTimings, setSectionTimings] = useState<{ id: string; label: string; reachedAt: number | null }[]>([])
  const rehearsalContainerRef = useRef<HTMLDivElement>(null)
  const rehearsalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const rehearsalAnimRef = useRef<number | null>(null)
  const [presentationSectionIdx, setPresentationSectionIdx] = useState(0)
  const [writingStatus, setWritingStatus] = useState<string>('draft')
  const [boostingSections, setBoostingSections] = useState<Set<string>>(new Set())
  const [showStudio, setShowStudio] = useState(false)
  const [weavingRefId, setWeavingRefId] = useState<string | null>(null)

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const innerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)
  const manuscriptLoadedRef = useRef(false)
  const manuscriptRef = useRef(manuscript)

  // 상태 업데이트 시 Ref도 즉시 동기화하여 탭 이동 시 최신 데이터 저장 보장
  const setManuscriptSafe = useCallback((updater: React.SetStateAction<JohnManuscriptData>) => {
    const next = typeof updater === 'function' ? (updater as Function)(manuscriptRef.current) : updater
    manuscriptRef.current = next
    setManuscript(() => next)
  }, [])
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
      else if (s.aiGenerated) map[s.id] = 'complete'
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

  /* ─── Manuscript Health Score (0-100) ─── */

  const healthScore = useMemo(() => {
    const sections = manuscript.sections
    const intro = sections.find(s => s.type === 'introduction')
    const bodies = sections.filter(s => s.type === 'body')
    const conclusion = sections.find(s => s.type === 'conclusion')
    const application = sections.find(s => s.type === 'application')

    let score = 0
    const details: { label: string; ok: boolean; note: string; tip?: string }[] = []

    // 1. Introduction (15 pts)
    const introLen = intro?.content.replace(/\s/g, '').length || 0
    if (introLen > 0) {
      const introPts = introLen >= 150 ? 15 : introLen >= 50 ? 10 : 5
      score += introPts
      details.push({
        label: '도입',
        ok: introPts === 15,
        note: `${introLen}자`,
        tip: introPts < 15 ? '150자 이상이면 만점입니다' : undefined,
      })
    } else {
      details.push({ label: '도입', ok: false, note: '내용 없음', tip: 'AI 추천으로 초안을 생성해보세요' })
    }

    // 2. Body sections (30 pts total, based on content length)
    const totalBodyLen = bodies.reduce((sum, s) => sum + s.content.replace(/\s/g, '').length, 0)
    const avgBodyLen = bodies.length > 0 ? totalBodyLen / bodies.length : 0
    if (avgBodyLen > 0) {
      const bodyPts = Math.min(30, Math.round((avgBodyLen / 200) * 30))
      score += bodyPts
      details.push({
        label: '본론',
        ok: bodyPts >= 25,
        note: `평균 ${Math.round(avgBodyLen)}자/섹션`,
        tip: bodyPts < 25 ? '섹션당 200자 이상이면 만점입니다' : undefined,
      })
    } else {
      details.push({ label: '본론', ok: false, note: '작성 전', tip: 'AI 추천으로 각 대지를 작성해보세요' })
    }

    // 3. Prep data integration (15 pts) — 연구/적용 방향 대신 Prep 데이터 연동 평가
    const hasPrepInsights = manuscript.prepInsights.length > 0
    const hasOutlines = manuscript.outlinePoints.length > 0
    const prepPts = (hasPrepInsights ? 8 : 0) + (hasOutlines ? 7 : 0)
    score += prepPts
    if (prepPts > 0) {
      details.push({
        label: '준비 데이터',
        ok: prepPts === 15,
        note: hasPrepInsights && hasOutlines ? '연구+대지 연동' : hasPrepInsights ? '연구 연동' : '대지 연동',
        tip: prepPts < 15 ? '설교 준비 탭에서 대지 구조를 작성하세요' : undefined,
      })
    } else {
      details.push({ label: '준비 데이터', ok: false, note: '연동 없음', tip: '설교 준비 탭에서 내용을 작성하면 자동 연동됩니다' })
    }

    // 4. Conclusion (10 pts)
    const conclLen = conclusion?.content.replace(/\s/g, '').length || 0
    if (conclLen > 0) {
      const conclPts = conclLen >= 100 ? 10 : conclLen >= 40 ? 6 : 3
      score += conclPts
      details.push({
        label: '결론',
        ok: conclPts === 10,
        note: `${conclLen}자`,
        tip: conclPts < 10 ? '100자 이상이면 만점입니다' : undefined,
      })
    } else {
      details.push({ label: '결론', ok: false, note: '내용 없음', tip: 'AI 추천으로 초청 문장을 생성해보세요' })
    }

    // 5. Application (10 pts)
    const appLen = application?.content.replace(/\s/g, '').length || 0
    if (appLen > 0) {
      const appPts = appLen >= 100 ? 10 : appLen >= 40 ? 6 : 3
      score += appPts
      details.push({
        label: '적용',
        ok: appPts === 10,
        note: `${appLen}자`,
        tip: appPts < 10 ? '100자 이상이면 만점입니다' : undefined,
      })
    } else {
      details.push({ label: '적용', ok: false, note: '내용 없음', tip: 'AI 재구성으로 적용을 생성해보세요' })
    }

    // 6. Scripture references (10 pts)
    const sectionsWithPassage = sections.filter(s => s.passage?.trim()).length
    if (sectionsWithPassage > 0) {
      const refScore = Math.min(10, sectionsWithPassage * 3)
      score += refScore
      details.push({ label: '성경 참조', ok: refScore >= 9, note: `${sectionsWithPassage}개 섹션` })
    }

    return { score: Math.min(100, score), details }
  }, [manuscript.sections, manuscript.prepInsights, manuscript.outlinePoints])

  /* ─── Empty state detection ─── */

  const isCompletelyEmpty = useMemo(() => {
    const allSectionsEmpty = manuscript.sections.every(s => !s.content.trim())
    const noPrepInsights = manuscript.prepInsights.length === 0
    const noOutlines = manuscript.outlinePoints.length === 0
    return allSectionsEmpty && noPrepInsights && noOutlines
  }, [manuscript.sections, manuscript.prepInsights, manuscript.outlinePoints])

  /* ─── Load saved manuscript or prep handoff on mount ─── */
  // Priority: saved manuscript (synced with prep) > build from prep > empty template
  // This effect runs *after* PrepTab's unmount cleanup, so `prep_{id}` is always current.

  useEffect(() => {
    const saved = getStorageItem<any | null>(`manuscript_${project.id}`, null)
    const prepRaw = getStorageItem<any | null>(`prep_${project.id}`, null)
    const prepSavedAt = (prepRaw as any)?._savedAt ?? null
    setHasPrepData(!!(prepRaw?.outlines?.length || prepRaw?.coreMessage))

    if (saved) {
      const { _savedAt, ...restored } = saved

      // 중복된 예화/참고 메모 제거 (title + content 기준)
      const deduplicateNotes = <T extends { title: string; content: string }>(notes: T[]): T[] => {
        const seen = new Set<string>()
        return notes.filter(note => {
          const key = `${note.title}|||${note.content}`
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
      }

      if (restored.illustrationNotes) {
        restored.illustrationNotes = deduplicateNotes(restored.illustrationNotes)
      }
      if (restored.referenceNotes) {
        restored.referenceNotes = deduplicateNotes(restored.referenceNotes)
      }

      // 저장된 manuscript가 비어있고 prep 데이터가 있다면 prep에서 빌드
      const allSectionsEmpty = !restored.sections || restored.sections.every((s: any) => !s.content?.trim())
      const hasPrepData = prepRaw?.outlines?.length > 0

      if (allSectionsEmpty && hasPrepData) {
        console.log('[ManuscriptTab] Saved manuscript is empty, building from prep')
        const fromPrep = buildManuscriptFromPrep(project, prepRaw)
        setManuscriptSafe(fromPrep)
        setLastPrepSyncAt(prepSavedAt)
        manuscriptLoadedRef.current = true
        return
      }

      console.log('[ManuscriptTab] Loading saved manuscript directly', restored.title)

      // sections가 비어있으면 기본 구조 생성
      if (!restored.sections || restored.sections.length === 0) {
        restored.sections = [
          { id: 'intro', type: 'introduction', label: '서론', content: '', aiGenerated: false },
          { id: 'body-1', type: 'body', label: '1. 본론', content: '', aiGenerated: false },
          { id: 'conclusion', type: 'conclusion', label: '결론', content: '', aiGenerated: false },
          { id: 'application', type: 'application', label: '적용', content: '', aiGenerated: false },
        ]
      }
      setManuscriptSafe(restored as JohnManuscriptData)

      // 중복 제거된 데이터로 localStorage 업데이트
      setStorageItem(`manuscript_${project.id}`, { ...restored, _savedAt: Date.now() })

      setLastPrepSyncAt(prepSavedAt)
      if (_savedAt) {
        setLastSaved(new Date(_savedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }))
      }
      manuscriptLoadedRef.current = true
      console.log('[ManuscriptTab] Loaded saved manuscript')
      return
    }

    // Build from prep data (first visit, no saved manuscript yet)
    if (prepRaw?.outlines?.length) {
      const fromPrep = buildManuscriptFromPrep(project, prepRaw)
      setManuscriptSafe(fromPrep)
      setLastPrepSyncAt(prepSavedAt)
    }

    manuscriptLoadedRef.current = true
  }, [project.id])

  /* ─── Manual sync with latest prep data ─── */

  const handleSyncPrep = useCallback(() => {
    const prepRaw = getStorageItem<any | null>(`prep_${project.id}`, null)
    if (!prepRaw?.outlines?.length) return
    const prepSavedAt = (prepRaw as any)?._savedAt ?? null
    const ms = syncManuscriptWithPrep(manuscript, prepRaw)
    setManuscriptSafe(ms)
    setLastPrepSyncAt(prepSavedAt)
  }, [manuscript, project.id])

  /* ─── Check if prep has been updated since last sync ─── */

  const prepNeedsSync = useMemo(() => {
    if (!hasPrepData) return false
    const prepRaw = getStorageItem<any | null>(`prep_${project.id}`, null)
    const prepSavedAt = (prepRaw as any)?._savedAt ?? null
    if (!prepSavedAt) return false
    return !lastPrepSyncAt || prepSavedAt > lastPrepSyncAt
  }, [hasPrepData, lastPrepSyncAt, project.id])

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
      doSave(manuscriptRef.current)
    }, 1500)
  }, [doSave])

  const manualSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    if (innerTimerRef.current) clearTimeout(innerTimerRef.current)
    manualSaveTriggerRef.current += 1
    doSave(manuscriptRef.current)
  }, [doSave])

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

  // Flush save immediately on unmount (tab switch) to avoid losing debounced writes
  useEffect(() => {
    return () => {
      if (manuscriptLoadedRef.current) {
        setStorageItem(`manuscript_${project.id}`, { ...manuscriptRef.current, _savedAt: Date.now() })
      }
    }
  }, [project.id])

  // Persist to localStorage whenever manuscript changes (after initial load)
  useEffect(() => {
    if (!manuscriptLoadedRef.current) return
    const timer = setTimeout(() => {
      setStorageItem(`manuscript_${project.id}`, { ...manuscript, _savedAt: Date.now() })
    }, 800)
    return () => clearTimeout(timer)
  }, [manuscript, project.id])

  const updateSection = useCallback((id: string, content: string) => {
    // 1. Ref를 먼저 동기적으로 업데이트 (언마운트 시 최신 데이터 저장 보장)
    manuscriptRef.current = {
      ...manuscriptRef.current,
      sections: manuscriptRef.current.sections.map(s =>
        s.id === id ? { ...s, content, aiGenerated: content.trim() ? s.aiGenerated : false } : s
      ),
    }
    
    // 2. React 상태 업데이트
    setManuscriptSafe(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === id ? { ...s, content, aiGenerated: content.trim() ? s.aiGenerated : false } : s
      ),
    }))
    triggerSave()
  }, [triggerSave])

  const updateTitle = useCallback((title: string) => {
    const next = { ...manuscriptRef.current, title };
    manuscriptRef.current = next;
    setStorageItem(`manuscript_${project.id}`, { ...next, _savedAt: Date.now() });
    setManuscriptSafe(prev => ({ ...prev, title }));
    triggerSave();
  }, [triggerSave, project.id])

  const updateSummary = useCallback((summary: string) => {
    const next = { ...manuscriptRef.current, oneSentenceSummary: summary };
    manuscriptRef.current = next;
    setStorageItem(`manuscript_${project.id}`, { ...next, _savedAt: Date.now() });
    setManuscriptSafe(prev => ({ ...prev, oneSentenceSummary: summary }));
    triggerSave();
  }, [triggerSave, project.id])

  /* ─── Illustration Notes Handlers ─── */
  const addIllustration = useCallback((note: IllustrationNote) => {
    setManuscriptSafe(prev => {
      const exists = prev.illustrationNotes.some(n =>
        n.id === note.id ||
        (n.title === note.title && n.content === note.content)
      )
      if (exists) return prev
      const next = { ...prev, illustrationNotes: [...prev.illustrationNotes, note] }
      manuscriptRef.current = next
      setStorageItem(`manuscript_${project.id}`, { ...next, _savedAt: Date.now() })
      return next
    })
    triggerSave()
  }, [triggerSave, project.id])

  const deleteIllustration = useCallback((id: string) => {
    const next = { ...manuscriptRef.current, illustrationNotes: manuscriptRef.current.illustrationNotes.filter(n => n.id !== id) };
    manuscriptRef.current = next;
    setStorageItem(`manuscript_${project.id}`, { ...next, _savedAt: Date.now() });
    setManuscriptSafe(prev => ({ ...prev, illustrationNotes: prev.illustrationNotes.filter(n => n.id !== id) }));
    triggerSave();
  }, [triggerSave, project.id])

  const updateIllustrationStatus = useCallback((id: string, status: IllustrationNote['status']) => {
    const next = { ...manuscriptRef.current, illustrationNotes: manuscriptRef.current.illustrationNotes.map(n => n.id === id ? { ...n, status } : n) };
    manuscriptRef.current = next;
    setStorageItem(`manuscript_${project.id}`, { ...next, _savedAt: Date.now() });
    setManuscriptSafe(prev => ({ ...prev, illustrationNotes: prev.illustrationNotes.map(n => n.id === id ? { ...n, status } : n) }));
    triggerSave();
  }, [triggerSave, project.id])

  const insertIllustrationToSection = useCallback((note: IllustrationNote, sectionId: string) => {
    const next = {
      ...manuscriptRef.current,
      illustrationNotes: manuscriptRef.current.illustrationNotes.map(n =>
        n.id === note.id ? { ...n, linkedSectionId: sectionId } : n
      ),
    };
    manuscriptRef.current = next;
    setStorageItem(`manuscript_${project.id}`, { ...next, _savedAt: Date.now() });
    setManuscriptSafe(prev => ({
      ...prev,
      illustrationNotes: prev.illustrationNotes.map(n =>
        n.id === note.id ? { ...n, linkedSectionId: sectionId } : n
      ),
    }));
    triggerSave();
  }, [triggerSave, project.id])

  /* ─── Reference Notes Handlers ─── */
  const addReference = useCallback((note: ReferenceNote) => {
    setManuscriptSafe(prev => {
      const exists = prev.referenceNotes.some(n =>
        n.id === note.id ||
        (n.title === note.title && n.content === note.content)
      )
      if (exists) return prev
      const next = { ...prev, referenceNotes: [...prev.referenceNotes, note] }
      manuscriptRef.current = next
      setStorageItem(`manuscript_${project.id}`, { ...next, _savedAt: Date.now() })
      return next
    })
    triggerSave()
  }, [triggerSave, project.id])

  const deleteReference = useCallback((id: string) => {
    const next = { ...manuscriptRef.current, referenceNotes: manuscriptRef.current.referenceNotes.filter(n => n.id !== id) };
    manuscriptRef.current = next;
    setStorageItem(`manuscript_${project.id}`, { ...next, _savedAt: Date.now() });
    setManuscriptSafe(prev => ({ ...prev, referenceNotes: prev.referenceNotes.filter(n => n.id !== id) }));
    triggerSave();
  }, [triggerSave, project.id])

  const updateReferenceLink = useCallback((noteId: string, sectionId: string | null) => {
    setManuscriptSafe(prev => {
      const next = {
        ...prev,
        referenceNotes: prev.referenceNotes.map(n =>
          n.id === noteId ? { ...n, linkedSectionId: sectionId || undefined } : n
        ),
      }
      setStorageItem(`manuscript_${project.id}`, { ...next, _savedAt: Date.now() })
      return next
    })
    triggerSave()
  }, [triggerSave, project.id])

  const handleWeaveReference = useCallback(async (note: ReferenceNote, sectionId: string) => {
    setWeavingRefId(note.id)
    try {
      const section = manuscriptRef.current.sections.find(s => s.id === sectionId)
      const res = await fetch('/api/advanced/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'reference-weave',
          data: {
            sectionContent: section?.content || '',
            referenceContent: note.content,
            referenceAuthor: note.author,
            referenceBook: note.book,
          },
        }),
      })
      const json = await res.json()
      if (json.success) {
        const wovenText = json.data.output
        const currentContent = manuscriptRef.current.sections.find(s => s.id === sectionId)?.content || ''
        const newContent = currentContent + '\n\n' + wovenText
        updateSection(sectionId, newContent)
      }
    } catch { /* ignore */ }
    setWeavingRefId(null)
  }, [updateSection])

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
      application: 'manuscript-application-reconstruct',
      body: 'manuscript-body',
    }
    const apiType = typeMap[sectionType]
    if (!apiType) return ''

    // Load prep data once
    const prepRaw = getStorageItem<any | null>(`prep_${project.id}`, null)
    const congregationProfile = prepRaw?.congregationProfile || null
    const deliveryIntro = prepRaw?.deliveryIntro || ''
    const deliveryConclusion = prepRaw?.deliveryConclusion || ''
    const prepAppPoints = prepRaw?.applicationPoints || []
    const researchInsights = prepRaw?.researchInsights || []
    const passageStructure = prepRaw?.passageStructure || ''

    const payload: any = {
      passage: project.passage,
      coreMessage: manuscript.coreMessage,
      sermonTitle: manuscript.title,
      sermonPurpose: manuscript.oneSentenceSummary,
      congregationProfile,
    }

    if (sectionType === 'introduction') {
      payload.passageStructure = passageStructure || manuscript.outlinePoints.map(o => o.title).join(' → ')
      payload.deliveryIntro = deliveryIntro
      // Next sections preview
      const bodySections = manuscript.sections.filter(s => s.type === 'body')
      payload.nextSections = bodySections.map(s => s.label).join(' → ') + ' → 결론 → 적용'

    } else if (sectionType === 'conclusion') {
      payload.outlines = manuscript.outlinePoints.map(o => ({ title: o.title, description: o.content }))
      payload.applicationPoints = prepAppPoints.length > 0
        ? prepAppPoints.map((a: any) => ({
            id: a.id || `app-${Math.random()}`,
            point: a.point || '',
            audienceTag: a.audienceTag || '전체',
            pastoralNote: a.pastoralNote || '',
          }))
        : []
      payload.expectedResponse = ''
      payload.deliveryConclusion = deliveryConclusion
      // Previous content summary
      const prevContent = manuscript.sections
        .filter(s => s.content.trim() && s.type !== 'conclusion' && s.type !== 'application')
        .map(s => `[${s.label}]\n${s.content.slice(0, 300)}${s.content.length > 300 ? '...' : ''}`)
        .join('\n\n')
      payload.previousContent = prevContent || '(아직 작성된 내용 없음)'

    } else if (sectionType === 'application') {
      payload.outlines = manuscript.outlinePoints.map(o => ({ title: o.title, description: o.content }))
      payload.applicationPoints = prepAppPoints.length > 0
        ? prepAppPoints.map((a: any) => ({
            id: a.id || `app-${Math.random()}`,
            point: a.point || '',
            audienceTag: a.audienceTag || '전체',
            pastoralNote: a.pastoralNote || '',
          }))
        : (section.researchPoints || []).map((p, i) => ({
            id: `app-${i}`, point: p, audienceTag: '', pastoralNote: '',
          }))
      payload.existingContent = section.content.trim() ? section.content.slice(0, 500) : ''
      // Previous content (conclusion summary)
      const conclusionSection = manuscript.sections.find(s => s.type === 'conclusion')
      payload.previousContent = conclusionSection?.content.trim()
        ? `[결론]\n${conclusionSection.content.slice(0, 300)}${conclusionSection.content.length > 300 ? '...' : ''}`
        : '(아직 결론이 작성되지 않음)'

    } else if (sectionType === 'body') {
      const bodySections = manuscript.sections.filter(s => s.type === 'body')
      const bodyIdx = bodySections.indexOf(section)
      const outlinePoint = manuscript.outlinePoints[bodyIdx] || null

      // Previous sections content
      const prevSections = manuscript.sections.filter(s => {
        const idx = manuscript.sections.indexOf(s)
        return idx < manuscript.sections.indexOf(section) && s.content.trim()
      })
      const previousContent = prevSections.map(s => `[${s.label}]\n${s.content.slice(0, 200)}${s.content.length > 200 ? '...' : ''}`).join('\n\n')

      // Next sections preview
      const remainingBodies = bodySections.slice(bodyIdx + 1)
      const nextSections = remainingBodies.map(s => s.label).join(' → ')
      const nextPlan = nextSections
        ? `${nextSections} → 결론 → 적용`
        : bodySections.length > 1 ? '결론 → 적용' : '결론 → 적용'

      payload.outlinePoint = outlinePoint ? {
        title: outlinePoint.title,
        content: outlinePoint.content,
        passage: outlinePoint.passage,
      } : { title: section.label.replace(/^\d+\.\s*/, ''), content: '', passage: section.passage || '' }
      payload.passageStructure = passageStructure
      payload.researchInsights = researchInsights
      payload.sectionPosition = bodyIdx + 1
      payload.totalSections = bodySections.length
      payload.previousContent = previousContent || '(이전 섹션 내용 없음)'
      payload.nextSections = nextPlan
    }

    const res = await fetch('/api/advanced/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: apiType, data: payload }),
    })
    const json = await res.json()
    if (json.success) {
      const next = {
        ...manuscriptRef.current,
        sections: manuscriptRef.current.sections.map(s =>
          s.id === section.id ? { ...s, content: json.data.output, aiGenerated: true } : s
        ),
      }
      manuscriptRef.current = next
      setStorageItem(`manuscript_${project.id}`, { ...next, _savedAt: Date.now() })
      setManuscriptSafe(next)
      return json.data.output
    }
    return ''
  }, [project, manuscript])

  /* ─── 원클릭 건강도 높이기 ─── */
  const handleBoostHealth = useCallback(async () => {
    const emptySections = manuscript.sections.filter(s => !s.content.trim() && (s.type === 'introduction' || s.type === 'body' || s.type === 'conclusion' || s.type === 'application'))
    if (emptySections.length === 0) return

    const sectionIds = new Set(emptySections.map(s => s.id))
    setBoostingSections(sectionIds)

    for (const section of emptySections) {
      try {
        const result = await handleAiGenerate(section.type)
        if (result) {
          updateSection(section.id, result)
        }
      } catch { /* continue */ }
    }

    setBoostingSections(new Set())
  }, [manuscript.sections, handleAiGenerate, updateSection])

  const startRehearsal = useCallback((minutes: number) => {
    setRehearsalDuration(minutes)
    setRehearsalElapsed(0)
    setRehearsalPaused(false)
    setRehearsalPhase('running')
    setSectionTimings(
      manuscript.sections
        .filter(s => s.content.trim().length > 0)
        .map(s => ({ id: s.id, label: s.label, reachedAt: null }))
    )
    setTimeout(() => {
      rehearsalTimerRef.current = setInterval(() => {
        setRehearsalElapsed(prev => prev + 1)
      }, 1000)
    }, 100)
  }, [manuscript.sections])

  const pauseRehearsal = useCallback(() => {
    setRehearsalPaused(prev => {
      if (!prev) {
        if (rehearsalTimerRef.current) clearInterval(rehearsalTimerRef.current)
        if (rehearsalAnimRef.current) cancelAnimationFrame(rehearsalAnimRef.current)
      } else {
        rehearsalTimerRef.current = setInterval(() => {
          setRehearsalElapsed(prev => prev + 1)
        }, 1000)
      }
      return !prev
    })
  }, [])

  const finishRehearsal = useCallback(() => {
    setSectionTimings(prev => {
      const updated = [...prev]
      const remaining = updated.filter(t => t.reachedAt === null)
      const now = Math.floor(rehearsalElapsed)
      remaining.forEach(t => { t.reachedAt = now })
      return updated
    })
    if (rehearsalTimerRef.current) clearInterval(rehearsalTimerRef.current)
    if (rehearsalAnimRef.current) cancelAnimationFrame(rehearsalAnimRef.current)
    setRehearsalPhase('finished')
  }, [rehearsalElapsed])

  const resetRehearsal = useCallback(() => {
    if (rehearsalTimerRef.current) clearInterval(rehearsalTimerRef.current)
    if (rehearsalAnimRef.current) cancelAnimationFrame(rehearsalAnimRef.current)
    setRehearsalPhase('idle')
    setRehearsalElapsed(0)
    setRehearsalPaused(false)
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

  /* ─── Rehearsal Studio Mode ─── */

  if (rehearsalPhase === 'running' || rehearsalPhase === 'setup' || rehearsalPhase === 'finished') {
    const emptySectionIds = new Set(manuscript.sections.filter(s => s.content.trim().length === 0).map(s => s.id))
    const contentSections = manuscript.sections.filter(s => s.content.trim().length > 0)
    const totalContentHeight = contentSections.length * 300 // rough estimate
    const scrollSpeed = rehearsalDuration > 0 && totalContentHeight > 0
      ? totalContentHeight / (rehearsalDuration * 60 * 1000)
      : 0 // pixels per ms
    const avgWpm = rehearsalElapsed > 0 ? Math.round(totalWordCount / (rehearsalElapsed / 60)) : 0
    const targetSeconds = rehearsalDuration * 60
    const timeRatio = targetSeconds > 0 ? Math.min(1, rehearsalElapsed / targetSeconds) : 0
    const progressPct = Math.round(timeRatio * 100)

    if (rehearsalPhase === 'setup') {
      return (
        <div className="fixed inset-0 z-50 bg-navy-900/95 flex items-center justify-center">
          <div className="bg-[#0a0e1a] border border-white/10 rounded-2xl p-8 w-full max-w-sm">
            <h2 className="text-lg font-bold text-white mb-2">리허설 시작</h2>
            <p className="text-sm text-slate-400 mb-6">목표 설교 시간을 선택하세요</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[10, 15, 20, 25, 30, 40].map(m => (
                <button
                  key={m}
                  onClick={() => startRehearsal(m)}
                  className={`py-3 rounded-xl text-sm font-medium border transition-colors ${
                    rehearsalDuration === m
                      ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  {m}분
                </button>
              ))}
            </div>
            <button
              onClick={() => setRehearsalPhase('idle')}
              className="w-full text-[11px] py-2 rounded-xl text-slate-400 hover:text-slate-200 border border-white/5 hover:border-white/20 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )
    }

    if (rehearsalPhase === 'finished') {
      const sectionCount = contentSections.length
      const perSectionAvg = sectionCount > 0 ? Math.round(rehearsalElapsed / sectionCount) : 0
      return (
        <div className="fixed inset-0 z-50 bg-navy-900/95 flex items-center justify-center overflow-y-auto">
          <div className="bg-[#0a0e1a] border border-white/10 rounded-2xl p-8 w-full max-w-md my-8">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg font-bold text-white">리허설 완료</h2>
            </div>
            <p className="text-xs text-slate-500 mb-6">설교 전달 연습이 종료되었습니다</p>

            <div className="space-y-4 mb-6">
              <div className="bg-[#04060f]/60 rounded-xl p-4 border border-white/5">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">{Math.floor(rehearsalElapsed / 60)}:{String(rehearsalElapsed % 60).padStart(2, '0')}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">실제 시간</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-indigo-400">{rehearsalDuration}:00</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">목표 시간</div>
                  </div>
                  <div>
                    <div className={'text-2xl font-bold ' + (Math.abs(rehearsalElapsed - targetSeconds) <= 60 ? 'text-green-400' : 'text-amber-400')}>
                      {Math.abs(rehearsalElapsed - targetSeconds) <= 60 ? '✓' : Math.round(Math.abs(rehearsalElapsed - targetSeconds) / 60) + '분'}
                    </div>
                    <div className="text-[9px] text-slate-500 mt-0.5">차이</div>
                  </div>
                </div>
              </div>

              <div className="bg-[#04060f]/60 rounded-xl p-4 border border-white/5">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">전달 통계</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">분당 글자 수</span>
                    <span className="text-white font-medium">{avgWpm}자/분</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">전체 분량</span>
                    <span className="text-white font-medium">{totalWordCount.toLocaleString()}자</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">평균 섹션당</span>
                    <span className="text-white font-medium">{perSectionAvg}초 ({Math.round(perSectionAvg / 60 * 10) / 10}분)</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#04060f]/60 rounded-xl p-4 border border-white/5">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">섹션별 분석</div>
                <div className="space-y-1.5">
                  {sectionTimings.map((st, i) => {
                    const prevTime = i === 0 ? 0 : (sectionTimings[i - 1].reachedAt || 0)
                    const sectionTime = st.reachedAt ? st.reachedAt - prevTime : 0
                    const section = manuscript.sections.find(s => s.id === st.id)
                    const charCount = section ? section.content.replace(/\s/g, '').length : 0
                    return (
                      <div key={st.id} className="flex items-center gap-2 text-xs">
                        <span className={'w-1.5 h-1.5 rounded-full shrink-0 ' + (
                          st.id.includes('intro') ? 'bg-blue-400' :
                          st.id.includes('concl') ? 'bg-amber-400' :
                          st.id.includes('app') ? 'bg-green-400' : 'bg-indigo-400'
                        )} />
                        <span className="text-slate-400 w-16 truncate">{st.label}</span>
                        <span className="text-white font-medium w-14 text-right">{Math.floor(sectionTime / 60)}:{String(sectionTime % 60).padStart(2, '0')}</span>
                        <span className="text-slate-500 text-[9px]">{charCount}자</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-[#04060f]/60 rounded-xl p-4 border border-white/5">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">시간 분배 피드백</div>
                <div className="space-y-1.5 text-xs text-slate-300">
                  {timeRatio < 0.8 && <p>• 목표 시간보다 일찍 끝났습니다 ({Math.round((1 - timeRatio) * 100)}% 단축). 더 천천히, 여유 있게 전달해보세요.</p>}
                  {timeRatio > 1.2 && <p>• 목표 시간을 초과했습니다 ({Math.round((timeRatio - 1) * 100)}% 초과). 각 대지를 더 간결하게 정리해보세요.</p>}
                  {timeRatio >= 0.8 && timeRatio <= 1.2 && <p>• 목표 시간에 알맞게 전달했습니다. 시간 감각이 좋습니다.</p>}
                  {avgWpm > 400 && <p>• 분당 글자 수가 빠릅니다({avgWpm}자). 말하는 속도를 조금 늦추면 청중의 이해도가 높아집니다.</p>}
                  {avgWpm < 200 && <p>• 분당 글자 수가 느립니다({avgWpm}자). 좀 더 역동적인 전달을 고려해보세요.</p>}
                </div>
              </div>
            </div>

            <button
              onClick={resetRehearsal}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
            >
              편집으로 돌아가기
            </button>
          </div>
        </div>
      )
    }

    // Running state
    return (
      <div className="fixed inset-0 z-50 bg-navy-900 text-white flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">리허설</span>
            <span className="text-xs text-slate-400 font-medium">{manuscript.title}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-mono text-indigo-300 font-bold">
              {Math.floor(rehearsalElapsed / 60)}:{String(rehearsalElapsed % 60).padStart(2, '0')}
              <span className="text-slate-500"> / {rehearsalDuration}:00</span>
            </span>
            <button
              onClick={pauseRehearsal}
              className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/10"
            >
              {rehearsalPaused ? (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
              )}
              {rehearsalPaused ? '계속' : '일시 정지'}
            </button>
            <button
              onClick={finishRehearsal}
              className="text-[11px] px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors font-medium"
            >
              리허설 종료
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          ref={rehearsalContainerRef}
          className="flex-1 overflow-y-auto scrollbar-thin px-6 py-8"
        >
          <div className="max-w-[720px] mx-auto">
            <h1 className="text-xl font-serif font-bold text-white mb-1">{manuscript.title}</h1>
            <p className="text-xs text-slate-500 mb-8">{manuscript.passage} · {manuscript.oneSentenceSummary}</p>

            {contentSections.map((section, i) => (
              <div key={section.id} className="mb-8" data-section-id={section.id}>
                <h2 className="text-base font-serif font-bold text-white mb-2 pb-1 border-b border-white/5">{section.label}</h2>
                {section.passage && (
                  <p className="text-xs text-slate-500 italic mb-3">{section.passage}</p>
                )}
                <div className={'text-sm leading-loose whitespace-pre-wrap font-serif ' + (
                  section.type === 'introduction' ? 'text-slate-100 italic' :
                  section.type === 'application' ? 'text-slate-100' : 'text-slate-200'
                )}>
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar at bottom */}
        <div className="h-1 bg-white/5 shrink-0">
          <div
            className="h-full bg-indigo-600 transition-all duration-1000 ease-linear"
            style={{ width: Math.min(100, progressPct) + '%' }}
          />
        </div>
      </div>
    )
  }

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

      {/* ─── Tab Action Bar (sticky below header) ─── */}
      <div className="sticky top-0 z-20 bg-[#04060f]/90 backdrop-blur-md border-b border-white/5 px-5 py-2 flex items-center gap-2 shrink-0">
        <button
          onClick={manualSave}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 transition-colors font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          저장
          <span className="text-[9px] text-indigo-400/60">⌘S</span>
        </button>
        <div className="w-px h-4 bg-white/10" />
        <button
          onClick={() => setShowStudio(true)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          원고 스튜디오
        </button>
        <div className="w-px h-4 bg-white/10" />
        <button
          onClick={() => setViewMode('preview')}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 hover:border-white/20 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          미리보기
        </button>
        <button
          onClick={() => setViewMode('presentation')}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 hover:border-white/20 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          발표
        </button>
        <div className="w-px h-4 bg-white/10" />
        <button
          onClick={() => setRehearsalPhase('setup')}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-300 border border-green-500/20 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
          리허설
        </button>
      </div>

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
      <div className="flex flex-1 min-h-0">
        {/* Left: Outline Navigator with per-section status (sticky) */}
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
            {/* Empty State: first visit with no prep data */}
            {isCompletelyEmpty && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-lg font-serif font-bold text-white mb-2">아직 작성된 원고가 없습니다</h3>
                <p className="text-sm text-slate-400 mb-1">먼저 설교 준비 탭에서 다음을 정리하세요:</p>
                <ul className="text-xs text-slate-500 space-y-1 mb-6">
                  <li>1. 핵심 메시지</li>
                  <li>2. 대지 구조 (2-4개)</li>
                  <li>3. 적용 포인트</li>
                </ul>
                <button
                  onClick={() => router.push(`/advanced/projects/${project.id}?tab=prep`)}
                  className="flex items-center gap-2 text-sm px-5 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  설교 준비 탭으로 이동
                </button>
              </div>
            )}

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
                prepHints={section.type === 'application' ? manuscript.prepInsights : undefined}
                linkedIllustrations={manuscript.illustrationNotes.filter(n => n.linkedSectionId === section.id)}
                linkedReferences={manuscript.referenceNotes.filter(n => n.linkedSectionId === section.id)}
                onWeaveReference={handleWeaveReference}
                weavingRefId={weavingRefId}
              />
            ))}

            {/* Illustration Notes */}
            <IllustrationNotesSection
              notes={manuscript.illustrationNotes}
              manuscript={manuscript}
              onAdd={addIllustration}
              onDelete={deleteIllustration}
              onStatusChange={updateIllustrationStatus}
              onInsertToSection={insertIllustrationToSection}
            />

            {/* Reference Notes */}
            <ReferenceNotesSection
              notes={manuscript.referenceNotes}
              manuscript={manuscript}
              onAdd={addReference}
              onDelete={deleteReference}
              onLinkToSection={updateReferenceLink}
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
            prepNeedsSync={prepNeedsSync}
            onSyncPrep={handleSyncPrep}
            healthScore={healthScore}
            onBoostHealth={handleBoostHealth}
            boostingSections={boostingSections}
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

      {/* ─── Manuscript Studio ─── */}
      {showStudio && (
        <ManuscriptStudio
          manuscript={manuscript}
          projectId={project.id}
          referenceNotes={manuscript.referenceNotes}
          illustrationNotes={manuscript.illustrationNotes}
          onUpdateSection={updateSection}
          onClose={() => setShowStudio(false)}
        />
      )}
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
          onClick={onShowPrepToggle}
          className={`text-[11px] px-2.5 py-1 rounded transition-colors ${
            showPrepPanel ? 'bg-indigo-500/10 text-indigo-300' : 'bg-white/5 text-slate-400'
          }`}
        >
          준비 요약
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
    <aside className="w-56 border-r border-white/5 bg-[#04060f]/60 flex flex-col shrink-0 overflow-y-auto scrollbar-thin sticky top-0 self-start h-fit max-h-screen">
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
  section, sectionRef, isActive, status, onContentChange, onActivate, onAiGenerate, prepHints,
  linkedIllustrations = [],
  linkedReferences = [],
  onWeaveReference,
  weavingRefId,
}: {
  section: SermonSection
  sectionRef: (el: HTMLDivElement | null) => void
  isActive: boolean
  status: WritingStatus
  onContentChange: (content: string) => void
  onActivate: () => void
  onAiGenerate?: (sectionType: string) => Promise<string>
  prepHints?: string[]
  linkedIllustrations?: IllustrationNote[]
  linkedReferences?: ReferenceNote[]
  onWeaveReference?: (note: ReferenceNote, sectionId: string) => void
  weavingRefId?: string | null
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
  const canAiGenerate = section.type === 'introduction' || section.type === 'conclusion' || section.type === 'application' || section.type === 'body'
  const aiButtonLabel = section.type === 'application' ? '재구성' : 'AI 추천'

  // AI 코칭 팁 생성
  const coachingTip = useMemo(() => {
    const len = section.content.replace(/\s/g, '').length
    if (len === 0) {
      return { label: '시작 전', message: 'AI 추천으로 초안을 생성하거나 직접 작성해보세요', color: 'text-slate-500' }
    }
    if (section.type === 'body') {
      if (!section.researchPoints?.length && !section.applicationDirection) {
        return { label: '연구 연결 권장', message: '설교 준비 탭의 연구 데이터가 이 섹션에 아직 연결되지 않았습니다. 준비 탭에서 내용을 추가하면 자동 연동됩니다.', color: 'text-amber-400' }
      }
      if (len < 150) {
        return { label: '확장 권장', message: '150자 이상으로 본문을 풀면 더 풍부한 설교가 됩니다', color: 'text-blue-400' }
      }
      return { label: '좋음', message: '연구 데이터가 연결되어 있습니다', color: 'text-green-400' }
    }
    if (section.type === 'introduction') {
      if (len < 100) return { label: '도입 확장', message: '100자 이상으로 청중의 관심을 더 끌어보세요', color: 'text-blue-400' }
      return { label: '좋음', message: '충분한 도입 분량입니다', color: 'text-green-400' }
    }
    if (section.type === 'conclusion') {
      if (len < 80) return { label: '결론 강화', message: '80자 이상으로 명확한 초청을 추가해보세요', color: 'text-blue-400' }
      return { label: '좋음', message: '명확한 결론입니다', color: 'text-green-400' }
    }
    if (section.type === 'application') {
      if (len < 80) return { label: '적용 구체화', message: '80자 이상으로 구체적인 실천 방안을 적어보세요', color: 'text-blue-400' }
      return { label: '좋음', message: '구체적인 적용입니다', color: 'text-green-400' }
    }
    return null
  }, [section.content, section.type, section.researchPoints, section.applicationDirection])

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
              {aiLoading ? '재구성 중...' : aiButtonLabel}
            </button>
          )}
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${STATUS_COLORS[status]}`}>
            {STATUS_LABELS[status]}
          </span>
        </div>
      </div>

      {/* AI 코칭 팁 */}
      {coachingTip && hasContent && (
        <div className={`mb-3 flex items-start gap-2 text-[11px] ${coachingTip.color}`}>
          <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{coachingTip.message}</span>
        </div>
      )}

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
      {section.type === 'application' && isEmpty && prepHints && prepHints.length > 0 && (
        <div className="mb-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3">
          <div className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-1">준비 단계의 적용 포인트</div>
          <ul className="text-xs text-indigo-300 leading-relaxed space-y-1">
            {prepHints.map((hint, i) => (
              <li key={i}>• {hint}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Linked Illustrations */}
      {linkedIllustrations.length > 0 && (
        <div className="mb-4 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 space-y-2">
          <div className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            연결된 예화
          </div>
          {linkedIllustrations.map(note => (
            <div key={note.id} className="text-xs text-slate-300 leading-relaxed border-l-2 border-amber-500/30 pl-3">
              <span className="text-amber-200 font-medium">{note.title}:</span> {note.content}
            </div>
          ))}
        </div>
      )}

      {/* Linked References */}
      {linkedReferences.length > 0 && (
        <div className="mb-4 bg-teal-500/5 border border-teal-500/20 rounded-xl p-3 space-y-2">
          <div className="text-[10px] font-semibold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            연결된 참고
          </div>
          {linkedReferences.map(note => (
            <div key={note.id} className="text-xs text-slate-300 leading-relaxed border-l-2 border-teal-500/30 pl-3 flex items-start justify-between gap-2">
              <div>
                <span className="text-teal-200 font-medium">{note.title}:</span> {note.content}
              </div>
              {onWeaveReference && (
                <button
                  onClick={(e) => { e.stopPropagation(); onWeaveReference(note, section.id) }}
                  disabled={weavingRefId === note.id}
                  className="shrink-0 text-[9px] px-2 py-1 rounded bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 transition-colors font-medium disabled:opacity-50"
                  title="원고에 자연스럽게 녹여 넣기"
                >
                  {weavingRefId === note.id ? <Loader2 className="w-3 h-3 animate-spin" /> : '✨ 녹이기'}
                </button>
              )}
            </div>
          ))}
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
          '본문 원고를 작성하세요 — 대지의 제목과 설명을 바탕으로 설교 문장을 구체화하거나 AI 추천을 활용해보세요...'
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

function IllustrationNotesSection({
  notes,
  manuscript,
  onAdd,
  onDelete,
  onStatusChange,
  onInsertToSection,
}: {
  notes: IllustrationNote[]
  manuscript: JohnManuscriptData
  onAdd: (note: IllustrationNote) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: IllustrationNote['status']) => void
  onInsertToSection: (note: IllustrationNote, sectionId: string) => void
}) {
  const [aiLoading, setAiLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newNote, setNewNote] = useState({ title: '', content: '', source: '' })
  const [aiSuggestions, setAiSuggestions] = useState<IllustrationNote[]>([])
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const statusColors: Record<string, string> = {
    '사용': 'bg-indigo-500/10 text-indigo-300',
    '보류': 'bg-amber-500/10 text-amber-300',
    '검토중': 'bg-blue-500/10 text-blue-300',
  }
  const categoryIcons: Record<string, string> = {
    '일상': '🏠',
    '역사': '📜',
    '성경인물': '📖',
    '현대사례': '🌍',
    '교회사': '⛪',
    '과학/자연': '🔬',
  }

  const handleAiGenerate = async () => {
    setAiLoading(true)
    setAiSuggestions([])
    try {
      const activeSection = manuscript.sections.find(s => s.content.trim())
      const res = await fetch('/api/advanced/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'illustration',
          data: {
            sectionContent: activeSection?.content || '',
            sectionType: activeSection?.type || '',
            sectionLabel: activeSection?.label || '',
            coreMessage: manuscript.coreMessage,
            passage: manuscript.passage,
            theme: manuscript.title,
          },
        }),
      })
      const json = await res.json()
      if (json.success) {
        const parsed = JSON.parse(json.data.output)
        setAiSuggestions(parsed.map((item: any, i: number) => ({
          id: `ill-ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${i}`,
          title: item.title,
          content: item.content,
          status: '검토중' as const,
          source: item.source || '',
          category: item.category,
          tags: item.tags || [],
          relatedVerses: item.relatedVerses || [],
          applicationTip: item.applicationTip || '',
          linkedSectionId: activeSection?.id,
        })))
      }
    } catch { /* ignore */ }
    setAiLoading(false)
  }

  const handleAddManual = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return
    onAdd({
      id: `ill-manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: newNote.title,
      content: newNote.content,
      status: '검토중',
      source: newNote.source,
    })
    setNewNote({ title: '', content: '', source: '' })
    setShowAddForm(false)
  }

  const filteredNotes = notes.filter(n => {
    const matchesCategory = filterCategory === 'all' || n.category === filterCategory
    const matchesSearch = searchQuery === '' || n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="border-t border-white/5 pt-8">
      <div className="flex items-center justify-between mb-4">
        <AppSectionHeader title="예화 메모" count={`${notes.length}개`} />
        <div className="flex items-center gap-2">
          <button
            onClick={handleAiGenerate}
            disabled={aiLoading}
            className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition-colors disabled:opacity-50"
          >
            {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            AI 예화 추천
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            직접 추가
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {['all', '일상', '역사', '성경인물', '현대사례', '교회사', '과학/자연'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap ${
                filterCategory === cat
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                  : 'bg-[#04060f]/60 border-white/5 text-slate-400 hover:border-white/20'
              }`}
            >
              {cat === 'all' ? '전체' : `${categoryIcons[cat] || ''} ${cat}`}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="예화 검색..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[120px] text-[11px] bg-[#04060f]/60 border border-white/5 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500/30 text-slate-200"
        />
      </div>

      {/* AI 추천 예화 */}
      {aiSuggestions.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/5 to-indigo-500/5 border border-amber-500/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              AI가 추천하는 예화 ({aiSuggestions.length}개)
            </span>
            <button onClick={() => setAiSuggestions([])} className="p-1 rounded hover:bg-white/10 text-slate-500">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {aiSuggestions.map((note) => (
              <div key={note.id} className="bg-[#04060f]/80 border border-white/10 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{categoryIcons[note.category as string] || '💡'}</span>
                    <h4 className="text-sm font-medium text-white">{note.title}</h4>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300">{note.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <select
                      onChange={(e) => e.target.value && onInsertToSection(note, e.target.value)}
                      className="text-[10px] bg-[#04060f] border border-white/10 rounded-lg px-2 py-1 text-slate-300 outline-none"
                      defaultValue=""
                    >
                      <option value="" disabled>섹션에 삽입</option>
                      {manuscript.sections.map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => { onAdd(note); setAiSuggestions(prev => prev.filter(n => n.id !== note.id)) }}
                      className="text-[10px] px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors"
                    >
                      저장
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed mb-2">{note.content}</p>
                {note.applicationTip && (
                  <p className="text-[10px] text-green-400 mb-1.5 flex items-center gap-1">
                    💡 적용 팁: {note.applicationTip}
                  </p>
                )}
                {note.relatedVerses && note.relatedVerses.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1">
                    {note.relatedVerses.map((v, i) => (
                      <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300">{v}</span>
                    ))}
                  </div>
                )}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {note.tags.map((t, i) => (
                      <span key={i} className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">#{t}</span>
                    ))}
                  </div>
                )}
                {note.source && <p className="text-[10px] text-slate-500 mt-1.5 italic">— {note.source}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 직접 추가 폼 */}
      {showAddForm && (
        <div className="mb-4 bg-[#04060f]/60 border border-white/10 rounded-xl p-4 space-y-3">
          <input
            value={newNote.title}
            onChange={e => setNewNote(prev => ({ ...prev, title: e.target.value }))}
            className="w-full text-sm text-white bg-transparent border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-indigo-500/30"
            placeholder="예화 제목"
          />
          <textarea
            value={newNote.content}
            onChange={e => setNewNote(prev => ({ ...prev, content: e.target.value }))}
            className="w-full text-xs text-slate-200 bg-transparent border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-indigo-500/30 resize-none"
            rows={3}
            placeholder="예화 내용"
          />
          <input
            value={newNote.source}
            onChange={e => setNewNote(prev => ({ ...prev, source: e.target.value }))}
            className="w-full text-xs text-slate-400 bg-transparent border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-indigo-500/30"
            placeholder="출처 (선택)"
          />
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setShowAddForm(false)} className="text-[11px] px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors">
              취소
            </button>
            <button onClick={handleAddManual} className="text-[11px] px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
              추가
            </button>
          </div>
        </div>
      )}

      {/* 저장된 예화 목록 */}
      {filteredNotes.length === 0 && !aiSuggestions.length && (
        <div className="text-center py-8 bg-[#04060f]/40 rounded-xl border border-dashed border-white/10">
          <p className="text-sm text-slate-500">아직 예화 메모가 없습니다</p>
          <p className="text-xs text-slate-600 mt-1">AI 추천으로 예화를 찾거나 직접 추가해보세요</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredNotes.map(note => (
          <div key={note.id} className="bg-[#04060f]/60 rounded-xl border border-white/5 p-4 group hover:border-white/10 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-base">{categoryIcons[note.category as string] || '💡'}</span>
                <h4 className="text-sm font-medium text-white truncate">{note.title}</h4>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${statusColors[note.status]}`}>
                  {note.status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <select
                  value={note.status}
                  onChange={e => onStatusChange(note.id, e.target.value as IllustrationNote['status'])}
                  className={`text-[9px] px-1.5 py-0.5 rounded font-medium border-0 outline-none cursor-pointer ${statusColors[note.status]}`}
                >
                  <option value="사용">사용</option>
                  <option value="보류">보류</option>
                  <option value="검토중">검토중</option>
                </select>
                <button
                  onClick={() => onDelete(note.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-slate-600 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed mb-2 line-clamp-3">{note.content}</p>
            {note.applicationTip && (
              <p className="text-[10px] text-green-400 mb-1.5 flex items-center gap-1">
                💡 적용: {note.applicationTip}
              </p>
            )}
            {note.relatedVerses && note.relatedVerses.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1">
                {note.relatedVerses.map((v, i) => (
                  <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300">{v}</span>
                ))}
              </div>
            )}
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {note.tags.map((t, i) => (
                  <span key={i} className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">#{t}</span>
                ))}
              </div>
            )}
            {note.source && <p className="text-[10px] text-slate-500 mt-1.5 italic">— {note.source}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Reference Notes Section ─── */

function ReferenceNotesSection({
  notes,
  manuscript,
  onAdd,
  onDelete,
  onLinkToSection,
}: {
  notes: ReferenceNote[]
  manuscript: JohnManuscriptData
  onAdd: (note: ReferenceNote) => void
  onDelete: (id: string) => void
  onLinkToSection: (noteId: string, sectionId: string | null) => void
}) {
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<ReferenceNote[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newNote, setNewNote] = useState({ title: '', content: '', category: 'commentary' as ReferenceNote['category'], author: '', book: '' })
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [linkingNoteId, setLinkingNoteId] = useState<string | null>(null)

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

  const handleAiGenerate = async () => {
    setAiLoading(true)
    setAiSuggestions([])
    try {
      const activeSection = manuscript.sections.find(s => s.content.trim())
      const res = await fetch('/api/advanced/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'reference',
          data: {
            sectionContent: activeSection?.content || '',
            sectionType: activeSection?.type || '',
            sectionLabel: activeSection?.label || '',
            coreMessage: manuscript.coreMessage,
            passage: manuscript.passage,
            theme: manuscript.title,
          },
        }),
      })
      const json = await res.json()
      if (json.success) {
        const parsed = JSON.parse(json.data.output)
        setAiSuggestions(parsed.map((item: any, i: number) => ({
          id: `ref-ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${i}`,
          title: item.title,
          content: item.content,
          category: item.category as ReferenceNote['category'],
          author: item.author || '',
          book: item.book || '',
          tags: item.tags || [],
          linkedSectionId: activeSection?.id,
        })))
      }
    } catch { /* ignore */ }
    setAiLoading(false)
  }

  const handleAddManual = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return
    onAdd({
      id: `ref-manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: newNote.title,
      content: newNote.content,
      category: newNote.category,
      author: newNote.author,
      book: newNote.book,
    })
    setNewNote({ title: '', content: '', category: 'commentary', author: '', book: '' })
    setShowAddForm(false)
  }

  const filteredNotes = notes.filter(n => {
    const matchesCategory = filterCategory === 'all' || n.category === filterCategory
    const matchesSearch = searchQuery === '' || n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="border-t border-white/5 pt-8">
      <div className="flex items-center justify-between mb-4">
        <AppSectionHeader title="참고 메모" count={`${notes.length}개`} />
        <div className="flex items-center gap-2">
          <button
            onClick={handleAiGenerate}
            disabled={aiLoading}
            className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/20 transition-colors disabled:opacity-50"
          >
            {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            AI 참고 추천
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            직접 추가
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {['all', 'commentary', 'theology', 'historical', 'pastoral', 'warning'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap ${
                filterCategory === cat
                  ? `${categoryColors[cat]} border-current`
                  : 'bg-[#04060f]/60 border-white/5 text-slate-400 hover:border-white/20'
              }`}
            >
              {cat === 'all' ? '전체' : categoryLabels[cat]}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="참고 메모 검색..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[120px] text-[11px] bg-[#04060f]/60 border border-white/5 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500/30 text-slate-200"
        />
      </div>

      {/* AI 추천 참고 메모 */}
      {aiSuggestions.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-teal-500/5 to-indigo-500/5 border border-teal-500/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              AI가 추천하는 참고 메모 ({aiSuggestions.length}개)
            </span>
            <button onClick={() => setAiSuggestions([])} className="p-1 rounded hover:bg-white/10 text-slate-500">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {aiSuggestions.map((note) => (
              <div key={note.id} className="bg-[#04060f]/80 border border-white/10 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${categoryColors[note.category]}`}>
                      {categoryLabels[note.category]}
                    </span>
                    <h4 className="text-sm font-medium text-white">{note.title}</h4>
                  </div>
                  <button
                    onClick={() => { onAdd(note); setAiSuggestions(prev => prev.filter(n => n.id !== note.id)) }}
                    className="text-[10px] px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors shrink-0"
                  >
                    저장
                  </button>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed mb-2">{note.content}</p>
                {note.author && (
                  <p className="text-[10px] text-slate-300 mb-1">
                    👤 {note.author} {note.book ? `· 《${note.book}》` : ''}
                  </p>
                )}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {note.tags.map((t, i) => (
                      <span key={i} className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">#{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 직접 추가 폼 */}
      {showAddForm && (
        <div className="mb-4 bg-[#04060f]/60 border border-white/10 rounded-xl p-4 space-y-3">
          <input
            value={newNote.title}
            onChange={e => setNewNote(prev => ({ ...prev, title: e.target.value }))}
            className="w-full text-sm text-white bg-transparent border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-indigo-500/30"
            placeholder="참고 메모 제목"
          />
          <textarea
            value={newNote.content}
            onChange={e => setNewNote(prev => ({ ...prev, content: e.target.value }))}
            className="w-full text-xs text-slate-200 bg-transparent border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-indigo-500/30 resize-none"
            rows={3}
            placeholder="참고 내용"
          />
          <div className="flex items-center gap-3">
            <select
              value={newNote.category}
              onChange={e => setNewNote(prev => ({ ...prev, category: e.target.value as ReferenceNote['category'] }))}
              className="text-[11px] bg-[#04060f] border border-white/10 rounded-lg px-2 py-1.5 text-slate-300 outline-none"
            >
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <input
              value={newNote.author}
              onChange={e => setNewNote(prev => ({ ...prev, author: e.target.value }))}
              className="flex-1 text-[11px] bg-[#04060f] border border-white/10 rounded-lg px-2 py-1.5 text-slate-300 outline-none"
              placeholder="저자"
            />
            <input
              value={newNote.book}
              onChange={e => setNewNote(prev => ({ ...prev, book: e.target.value }))}
              className="flex-1 text-[11px] bg-[#04060f] border border-white/10 rounded-lg px-2 py-1.5 text-slate-300 outline-none"
              placeholder="책 이름"
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setShowAddForm(false)} className="text-[11px] px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors">
              취소
            </button>
            <button onClick={handleAddManual} className="text-[11px] px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
              추가
            </button>
          </div>
        </div>
      )}

      {/* 저장된 참고 메모 목록 */}
      {filteredNotes.length === 0 && !aiSuggestions.length && (
        <div className="text-center py-8 bg-[#04060f]/40 rounded-xl border border-dashed border-white/10">
          <p className="text-sm text-slate-500">아직 참고 메모가 없습니다</p>
          <p className="text-xs text-slate-600 mt-1">AI 추천으로 참고 자료를 찾거나 직접 추가해보세요</p>
        </div>
      )}

      <div className="space-y-2">
        {filteredNotes.map(note => (
          <div key={note.id} className="bg-[#04060f]/60 rounded-xl border border-white/5 p-4 group hover:border-white/10 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${categoryColors[note.category]}`}>
                    {categoryLabels[note.category]}
                  </span>
                  <h4 className="text-sm font-medium text-white">{note.title}</h4>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed mb-1">{note.content}</p>
                {note.author && (
                  <p className="text-[10px] text-slate-400">
                    👤 {note.author} {note.book ? `· 《${note.book}》` : ''}
                  </p>
                )}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {note.tags.map((t, i) => (
                      <span key={i} className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">#{t}</span>
                    ))}
                  </div>
                )}
                {note.linkedSectionId && (
                  <div className="mt-1.5 flex items-center gap-1 text-[9px] text-teal-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                    {manuscript.sections.find(s => s.id === note.linkedSectionId)?.label || '알 수 없음'}에 연결됨
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setLinkingNoteId(linkingNoteId === note.id ? null : note.id)}
                  className={`p-1.5 rounded transition-all ${
                    note.linkedSectionId
                      ? 'text-teal-400 bg-teal-500/10'
                      : 'opacity-0 group-hover:opacity-100 text-slate-500 hover:text-teal-400'
                  }`}
                  title="섹션에 연결"
                >
                  <Link2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(note.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {linkingNoteId === note.id && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">연결할 섹션 선택</div>
                <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin">
                  <button
                    onClick={() => { onLinkToSection(note.id, null); setLinkingNoteId(null) }}
                    className="w-full text-left text-[11px] px-3 py-1.5 rounded-lg text-slate-400 hover:bg-white/5 transition-colors"
                  >
                    연결 해제
                  </button>
                  {manuscript.sections.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { onLinkToSection(note.id, s.id); setLinkingNoteId(null) }}
                      className={`w-full text-left text-[11px] px-3 py-1.5 rounded-lg transition-colors ${
                        note.linkedSectionId === s.id
                          ? 'bg-teal-500/10 text-teal-300'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      {s.label} {s.passage ? `(${s.passage})` : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Prep Summary Panel ─── */

function PrepSummaryPanel({
  manuscript, onGoToPrep, prepNeedsSync, onSyncPrep, healthScore, onBoostHealth, boostingSections,
}: {
  manuscript: JohnManuscriptData
  onGoToPrep?: () => void
  prepNeedsSync: boolean
  onSyncPrep: () => void
  healthScore: { score: number; details: { label: string; ok: boolean; note: string; tip?: string }[] }
  onBoostHealth?: () => void
  boostingSections?: Set<string>
}) {
  const emptySections = manuscript.sections.filter(s => !s.content.trim())
  const canBoost = emptySections.length > 0 || healthScore.score < 80

  return (
    <aside className="w-80 border-l border-white/5 bg-[#04060f]/60 flex flex-col shrink-0 overflow-y-auto scrollbar-thin">

      {/* ✨ 건강도 높이기 버튼 */}
      {canBoost && (
        <div className="px-4 py-3 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-indigo-500/20">
          <button
            onClick={onBoostHealth}
            disabled={boostingSections?.size === 0 && !canBoost}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/20"
          >
            {boostingSections && boostingSections.size > 0 ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {boostingSections.size}개 섹션 생성 중...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                ✨ 건강도 높이기 ({healthScore.score} → {Math.min(100, healthScore.score + 20)} 예상)
              </>
            )}
          </button>
          <p className="text-[9px] text-indigo-400/70 mt-1.5 text-center">
            빈 섹션 AI 생성 + 연구 데이터 자동 연결
          </p>
        </div>
      )}

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

      {/* PrepSync Badge */}
      {prepNeedsSync && (
        <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] text-amber-300">
              <svg className="w-3 h-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="font-medium">준비 단계 업데이트 있음</span>
            </div>
            <button
              onClick={onSyncPrep}
              className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-colors font-medium"
            >
              동기화
            </button>
          </div>
        </div>
      )}

      {/* Manuscript Health Score */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">원고 건강도</span>
          <span className={`text-xs font-bold ${
            healthScore.score >= 80 ? 'text-green-400' :
            healthScore.score >= 50 ? 'text-amber-400' :
            'text-red-400'
          }`}>{healthScore.score}/100</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              healthScore.score >= 80 ? 'bg-green-500' :
              healthScore.score >= 50 ? 'bg-amber-500' :
              'bg-red-500'
            }`}
            style={{ width: `${healthScore.score}%` }}
          />
        </div>
        <div className="space-y-1">
          {healthScore.details.map((d, i) => (
            <div key={i} className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${d.ok ? 'bg-green-400' : 'bg-white/10'}`} />
                <span className="text-slate-400">{d.label}</span>
              </div>
              <span className={d.ok ? 'text-slate-500' : 'text-slate-600'}>{d.note}</span>
            </div>
          ))}
        </div>
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
