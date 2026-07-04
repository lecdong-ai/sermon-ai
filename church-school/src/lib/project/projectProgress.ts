import { getStorageItem } from '@/lib/storage'
import type { ProjectStatus, TabStageStatus } from './types'

export interface ProjectProgress {
  study: TabStageStatus
  prep: TabStageStatus
  manuscript: TabStageStatus
  overall: ProjectStatus
  writingProgress: number
}

interface PassageRef {
  book: string
  chapter: number
  verseStart: number
  verseEnd?: number | null
}

function passageStorageKey(p: PassageRef): string {
  const end = p.verseEnd ?? p.verseStart
  return `study_${p.book}_${p.chapter}_${p.verseStart}-${end}`
}

function multiStudyStorageKey(passages: PassageRef[]): string {
  const refs = passages
    .map(p => `${p.book}_${p.chapter}_${p.verseStart}-${p.verseEnd ?? p.verseStart}`)
    .sort()
    .join('__')
  return `multi_study_${refs}`
}

function computeStudyStatus(passages?: PassageRef[]): TabStageStatus {
  if (passages && passages.length > 0) {
    let hasAny = false
    let hasAll = true
    for (const p of passages) {
      const data = getStorageItem<any | null>(passageStorageKey(p), null)
      if (data) {
        hasAny = true
      } else {
        hasAll = false
      }
    }
    if (!hasAny) return 'empty'
    if (hasAll) {
      if (passages.length > 1) {
        const multi = getStorageItem<any | null>(multiStudyStorageKey(passages), null)
        if (multi?.integration) return 'complete'
        return 'revised'
      }
      return 'complete'
    }
    return 'draft'
  }

  if (typeof window === 'undefined') return 'empty'
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key) continue
    if (key.startsWith('study_') || key.startsWith('multi_study_')) {
      const data = getStorageItem<any | null>(key, null)
      if (data) return 'draft'
    }
  }
  return 'empty'
}

function computePrepStatus(projectId: string): TabStageStatus {
  if (typeof window === 'undefined') return 'empty'
  const prep = getStorageItem<any | null>(`prep_${projectId}`, null)
  if (!prep) return 'empty'

  const hasCoreMessage = !!prep.coreMessage?.trim()
  const hasOutlines = (prep.outlines?.length || 0) >= 2
  const hasDelivery = !!(
    prep.deliveryFlow?.trim() ||
    prep.deliveryIntro?.trim() ||
    prep.deliveryConclusion?.trim() ||
    prep.deliveryBlueprint
  )

  if (hasCoreMessage && hasOutlines && hasDelivery) return 'complete'

  const hasAny =
    hasCoreMessage ||
    (prep.outlines?.length || 0) > 0 ||
    !!prep.passageStructure?.trim() ||
    (prep.researchInsights?.length || 0) > 0 ||
    (prep.applicationPoints?.length || 0) > 0 ||
    !!prep.sermonPurpose?.trim()

  return hasAny ? 'draft' : 'empty'
}

function computeManuscriptStatus(projectId: string): TabStageStatus {
  if (typeof window === 'undefined') return 'empty'
  const ms = getStorageItem<any | null>(`manuscript_${projectId}`, null)
  if (!ms || !Array.isArray(ms.sections) || ms.sections.length === 0) return 'empty'

  const mainTypes = ['introduction', 'body', 'conclusion', 'application'] as const
  const filledCount = mainTypes.filter((t) => {
    const section = ms.sections.find((s: any) => s.type === t)
    return section && section.content?.trim()
  }).length

  if (filledCount === 0) return 'empty'
  if (filledCount === mainTypes.length) return 'complete'
  return 'draft'
}

function computeWritingProgress(projectId: string): number {
  if (typeof window === 'undefined') return 0
  const ms = getStorageItem<any | null>(`manuscript_${projectId}`, null)
  if (!ms || !Array.isArray(ms.sections)) return 0

  const mainTypes = ['introduction', 'body', 'conclusion', 'application']
  const filled = mainTypes.filter((t) => {
    const section = ms.sections.find((s: any) => s.type === t)
    return section && section.content?.trim()
  }).length

  return Math.round((filled / mainTypes.length) * 100)
}

function deriveOverallStatus(
  study: TabStageStatus,
  prep: TabStageStatus,
  manuscript: TabStageStatus
): ProjectStatus {
  // 원고가 작성 중이거나 완성됐으면 우선 반영 (사용자가 실제로 설교를 쓰고 있으면)
  if (manuscript === 'complete') return 'review'
  if (manuscript === 'draft') return 'writing'
  // 원고가 없으면 기존 흐름
  if (study === 'empty') return 'research'
  if (study !== 'complete' || prep !== 'complete') return 'prepare'
  return 'review'
}

export function computeProjectProgress(
  projectId: string,
  passages?: PassageRef[],
  storedStatus?: ProjectStatus
): ProjectProgress {
  const study = computeStudyStatus(passages)
  const prep = computePrepStatus(projectId)
  const manuscript = computeManuscriptStatus(projectId)
  const writingProgress = computeWritingProgress(projectId)

  let overall: ProjectStatus
  if (storedStatus === 'completed' || storedStatus === 'archived') {
    overall = storedStatus
  } else {
    overall = deriveOverallStatus(study, prep, manuscript)
  }

  return { study, prep, manuscript, overall, writingProgress }
}

export type FlowStatus = 'empty' | 'progress' | 'done'

export function tabToFlowStatus(status: TabStageStatus): FlowStatus {
  if (status === 'empty') return 'empty'
  if (status === 'complete' || status === 'confirmed') return 'done'
  return 'progress'
}

export function toStageStatusMap(progress: ProjectProgress): {
  study: FlowStatus
  prep: FlowStatus
  manuscript: FlowStatus
} {
  return {
    study: tabToFlowStatus(progress.study),
    prep: tabToFlowStatus(progress.prep),
    manuscript: tabToFlowStatus(progress.manuscript),
  }
}
