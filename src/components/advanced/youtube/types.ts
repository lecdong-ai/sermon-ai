export interface OutlinePoint {
  text: string
  time: number | null
}

export interface BibleConnection {
  passage: string
  explanation: string
  time: number | null
}

export interface Insight {
  title: string
  detail: string
  time: number | null
}

export interface UsageSuggestion {
  title: string
  description: string
}

export interface OutlineSubsection {
  title: string
  number: string
  timeStart: number | null
  timeEnd: number | null
  points: OutlinePoint[]
  bibleConnections: BibleConnection[]
  insights: Insight[]
}

export interface OutlineSection {
  title: string
  number: string
  timeStart: number | null
  timeEnd: number | null
  subsections: OutlineSubsection[]
  usageSuggestions: UsageSuggestion[]
}

export interface AnalysisOutline {
  overallSummary: string
  sections: OutlineSection[]
}

// Legacy format adapter
export interface LegacyAnalysis {
  summary?: string
  topics?: { title: string; description: string }[]
  bibleConnections?: { passage: string; explanation: string }[]
  keyInsights?: { title: string; detail: string }[]
  usageSuggestions?: { title: string; description: string }[]
}

export function adaptLegacyAnalysis(analysis: LegacyAnalysis): AnalysisOutline {
  if ('sections' in analysis) return analysis as unknown as AnalysisOutline

  const subsections: OutlineSubsection[] = []

  if (analysis.topics?.length) {
    subsections.push({
      title: '주요 주제',
      number: '1-1',
      timeStart: null,
      timeEnd: null,
      points: analysis.topics.map(t => ({ text: `${t.title} — ${t.description}`, time: null })),
      bibleConnections: [],
      insights: [],
    })
  }

  if (analysis.bibleConnections?.length) {
    subsections.push({
      title: '성경 연결',
      number: '1-2',
      timeStart: null,
      timeEnd: null,
      points: [],
      bibleConnections: analysis.bibleConnections.map(bc => ({
        passage: bc.passage,
        explanation: bc.explanation,
        time: null,
      })),
      insights: [],
    })
  }

  if (analysis.keyInsights?.length) {
    subsections.push({
      title: '핵심 인사이트',
      number: '1-3',
      timeStart: null,
      timeEnd: null,
      points: [],
      bibleConnections: [],
      insights: analysis.keyInsights.map(ki => ({
        title: ki.title,
        detail: ki.detail,
        time: null,
      })),
    })
  }

  return {
    overallSummary: analysis.summary || '',
    sections: [{
      title: '분석 결과',
      number: '1',
      timeStart: null,
      timeEnd: null,
      subsections,
      usageSuggestions: analysis.usageSuggestions || [],
    }],
  }
}
