import { getStorageItem, setStorageItem } from '@/lib/storage'

export type CheckSource = 'study' | 'insight' | 'quickfill' | 'prep' | 'manuscript'

export interface SourceContrib {
  source: CheckSource
  count: number
  detail: string
}

export interface MultiCheckResult {
  id: string
  label: string
  required: number
  satisfied: number
  passed: boolean
  contributors: SourceContrib[]
  availablePaths: CheckSource[]
}

export interface MultiCheckReport {
  results: MultiCheckResult[]
  passRate: number
  passedCount: number
  totalCount: number
  threshold: number
  passed: boolean
}

export interface QuickFill {
  keyWords: string[]
  commentaries: string[]
  theme: string
  savedAt: number
}

export interface InsightInfo {
  id: string
  type: string
  tags: string[]
  content: string
  title: string
}

export interface StudyData {
  greekWords?: any[]
  commentaries?: any[]
  themes?: any[]
  passageStructure?: string
}

export interface AggregatedSources {
  study: StudyData | null
  prep: any
  manuscript: any
  quickfill: QuickFill | null
  insights: InsightInfo[]
}

const STORAGE_KEYS = {
  study: (projectId: string) => `study_${projectId}`,
  prep: (projectId: string) => `prep_${projectId}`,
  manuscript: (projectId: string) => `manuscript_${projectId}`,
  quickfill: (projectId: string) => `quickfill_${projectId}`,
}

export function loadAggregatedSources(projectId: string, insights: InsightInfo[] = []): AggregatedSources {
  return {
    study: getStorageItem<StudyData | null>(STORAGE_KEYS.study(projectId), null),
    prep: getStorageItem<any | null>(STORAGE_KEYS.prep(projectId), null),
    manuscript: getStorageItem<any | null>(STORAGE_KEYS.manuscript(projectId), null),
  quickfill: getStorageItem<QuickFill | null>(STORAGE_KEYS.quickfill(projectId), null),
    insights,
  }
}

export function saveQuickFill(projectId: string, data: Omit<QuickFill, 'savedAt'>) {
  setStorageItem(STORAGE_KEYS.quickfill(projectId), { ...data, savedAt: Date.now() })
}

/**
 * 다중 소스 통합 체크
 * 각 요구사항이 여러 소스 중 어디서든 충족되면 OK
 */
export function runMultiSourceCheck(
  fromStatus: string,
  toStatus: string,
  sources: AggregatedSources,
): MultiCheckReport {
  const { study, prep, manuscript, quickfill, insights } = sources

  const reportResults: MultiCheckResult[] = []

  if (fromStatus === 'research' && toStatus === 'prepare') {
    // 원어: study.greekWords OR (quickfill.keyWords ≥ 2) OR (insights.research ≥ 2)
    const studyWords = study?.greekWords?.length || 0
    const qfWords = quickfill?.keyWords?.filter(Boolean).length || 0
    const insightWords = insights.filter((i) => i.type === 'research').length

    reportResults.push({
      id: 'greek-words',
      label: '원어 연구',
      required: 2,
      satisfied: Math.max(studyWords, qfWords, insightWords),
      passed: studyWords >= 2 || qfWords >= 2 || insightWords >= 2,
      contributors: [
        { source: 'study', count: studyWords, detail: '성경 연구 탭' },
        { source: 'insight', count: insightWords, detail: '연구 통찰' },
        { source: 'quickfill', count: qfWords, detail: '빠른 채우기' },
      ].filter((c): c is SourceContrib => c.count > 0),
      availablePaths: ['insight', 'study', 'quickfill', 'manuscript'],
    })

    // 주석: study.commentaries OR (quickfill.commentaries ≥ 3) OR (insights.research ≥ 3)
    const studyComms = study?.commentaries?.length || 0
    const qfComms = quickfill?.commentaries?.filter(Boolean).length || 0
    const insightComms = insights.filter((i) => i.type === 'research' || i.type === 'illustration').length

    reportResults.push({
      id: 'commentaries',
      label: '주석 확인',
      required: 3,
      satisfied: Math.max(studyComms, qfComms, insightComms),
      passed: studyComms >= 3 || qfComms >= 3 || insightComms >= 3,
      contributors: [
        { source: 'study', count: studyComms, detail: '성경 연구 탭' },
        { source: 'insight', count: insightComms, detail: '연구/예화 통찰' },
        { source: 'quickfill', count: qfComms, detail: '빠른 채우기' },
      ].filter((c): c is SourceContrib => c.count > 0),
      availablePaths: ['insight', 'study', 'quickfill', 'manuscript'],
    })

    // 주제: study.themes OR (quickfill.theme) OR (insights tags)
    const studyThemes = study?.themes?.length || 0
    const qfTheme = quickfill?.theme?.trim() ? 1 : 0
    const insightTags = new Set<string>()
    insights.forEach((i) => i.tags?.forEach((t) => insightTags.add(t)))

    reportResults.push({
      id: 'themes',
      label: '주제 설정',
      required: 1,
      satisfied: Math.max(studyThemes, qfTheme, insightTags.size),
      passed: studyThemes >= 1 || qfTheme >= 1 || insightTags.size >= 1,
      contributors: [
        { source: 'study', count: studyThemes, detail: '성경 연구 탭' },
        { source: 'insight', count: insightTags.size, detail: '통찰 태그' },
        { source: 'quickfill', count: qfTheme, detail: '빠른 채우기' },
      ].filter((c): c is SourceContrib => c.count > 0),
      availablePaths: ['insight', 'study', 'quickfill'],
    })
  } else if (fromStatus === 'prepare' && toStatus === 'writing') {
    // 중심명제, 대지, 적용, 전달흐름 — prep 데이터 기준
    const coreMsg = (prep?.coreMessage && String(prep.coreMessage).length > 10) ? 1 : 0
    const outlines = Array.isArray(prep?.outlines) ? prep.outlines.length : 0
    const apps = Array.isArray(prep?.applicationPoints) ? prep.applicationPoints.length : 0
    const flow = (prep?.deliveryFlow && String(prep.deliveryFlow).length > 10) ? 1 : 0

    reportResults.push({
      id: 'core-message',
      label: '중심명제',
      required: 1, satisfied: coreMsg, passed: coreMsg >= 1,
      contributors: coreMsg ? [{ source: 'prep', count: 1, detail: '설교 준비' }] : [],
      availablePaths: ['prep', 'manuscript'],
    })
    reportResults.push({
      id: 'outlines',
      label: '대지 구조',
      required: 2, satisfied: outlines, passed: outlines >= 2,
      contributors: outlines ? [{ source: 'prep', count: outlines, detail: '설교 준비' }] : [],
      availablePaths: ['prep', 'manuscript'],
    })
    reportResults.push({
      id: 'application-points',
      label: '적용 포인트',
      required: 1, satisfied: apps, passed: apps >= 1,
      contributors: apps ? [{ source: 'prep', count: apps, detail: '설교 준비' }] : [],
      availablePaths: ['prep', 'manuscript'],
    })
    reportResults.push({
      id: 'delivery-flow',
      label: '전달 흐름',
      required: 1, satisfied: flow, passed: flow >= 1,
      contributors: flow ? [{ source: 'prep', count: 1, detail: '설교 준비' }] : [],
      availablePaths: ['prep', 'manuscript'],
    })
  } else if (fromStatus === 'writing' && toStatus === 'review') {
    // 원고 섹션 확인
    const sections = manuscript?.sections || []
    const intro = sections.find((s: any) => s.type === 'introduction' || s.label?.includes('서론') || s.label?.includes('도입'))
    const bodies = sections.filter((s: any) => s.type === 'body' || s.label?.match(/본론|대지/))
    const concl = sections.find((s: any) => s.type === 'conclusion' || s.label?.includes('결론'))
    const app = sections.find((s: any) => s.type === 'application' || s.label?.includes('적용'))

    reportResults.push({
      id: 'introduction', label: '서론', required: 1,
      satisfied: intro?.content?.length > 50 ? 1 : 0,
      passed: !!intro?.content && intro.content.length > 50,
      contributors: intro?.content ? [{ source: 'manuscript', count: 1, detail: '원고' }] : [],
      availablePaths: ['manuscript'],
    })
    reportResults.push({
      id: 'body-sections', label: '본론', required: 2,
      satisfied: bodies.filter((s: any) => s.content?.length > 100).length,
      passed: bodies.filter((s: any) => s.content?.length > 100).length >= 2,
      contributors: bodies.length ? [{ source: 'manuscript', count: bodies.length, detail: '원고' }] : [],
      availablePaths: ['manuscript'],
    })
    reportResults.push({
      id: 'conclusion', label: '결론', required: 1,
      satisfied: concl?.content?.length > 50 ? 1 : 0,
      passed: !!concl?.content && concl.content.length > 50,
      contributors: concl?.content ? [{ source: 'manuscript', count: 1, detail: '원고' }] : [],
      availablePaths: ['manuscript'],
    })
    reportResults.push({
      id: 'application', label: '적용', required: 1,
      satisfied: app?.content?.length > 50 ? 1 : 0,
      passed: !!app?.content && app.content.length > 50,
      contributors: app?.content ? [{ source: 'manuscript', count: 1, detail: '원고' }] : [],
      availablePaths: ['manuscript'],
    })
  } else if (fromStatus === 'review' && toStatus === 'completed') {
    const total = (manuscript?.sections || []).reduce((sum: number, s: any) => sum + (s.content?.length || 0), 0)
    const sections = manuscript?.sections || []
    const allFilled = sections.length > 0 && sections.every((s: any) => s.content?.length > 20)
    const illustrations = Array.isArray(manuscript?.illustrationNotes) ? manuscript.illustrationNotes.length : 0

    reportResults.push({
      id: 'word-count', label: '원고 분량', required: 1000, satisfied: total,
      passed: total >= 1000,
      contributors: [{ source: 'manuscript', count: total, detail: '원고 글자수' }],
      availablePaths: ['manuscript'],
    })
    reportResults.push({
      id: 'all-sections', label: '모든 섹션 채워짐', required: 1, satisfied: allFilled ? 1 : 0,
      passed: allFilled,
      contributors: allFilled ? [{ source: 'manuscript', count: 1, detail: '원고' }] : [],
      availablePaths: ['manuscript'],
    })
    reportResults.push({
      id: 'illustrations', label: '예화 포함', required: 1, satisfied: illustrations,
      passed: illustrations >= 1,
      contributors: illustrations ? [{ source: 'manuscript', count: illustrations, detail: '원고' }] : [],
      availablePaths: ['manuscript'],
    })
  }

  const passedCount = reportResults.filter((r) => r.passed).length
  const totalCount = reportResults.length
  const passRate = totalCount > 0 ? passedCount / totalCount : 1

  // 기본 임계값: 0.6 (다중 소스이므로 더 관대하게)
  const thresholds: Record<string, number> = {
    'research->prepare': 0.6,
    'prepare->writing': 0.6,
    'writing->review': 0.6,
    'review->completed': 0.6,
  }
  const threshold = thresholds[`${fromStatus}->${toStatus}`] ?? 0.6

  return {
    results: reportResults,
    passRate,
    passedCount,
    totalCount,
    threshold,
    passed: passRate >= threshold,
  }
}
