export type NoteType = 'insight' | 'research' | 'application' | 'question' | 'pastoral' | 'illustration' | 'warning'

export type NoteConnectionType = 'passage' | 'theme' | 'word' | 'project' | 'series'

export interface NoteConnection {
  type: NoteConnectionType
  label: string
  id: string
}

export interface NoteEntry {
  id: string
  type: NoteType
  title: string
  content: string
  summary: string
  tags: string[]
  starred: boolean
  pinned: boolean
  connections: NoteConnection[]
  projectIds: string[]
  archiveIds: string[]
  createdAt: string
  updatedAt: string
  lastReferencedAt: string | null
  referenceCount: number
}

export const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  insight: '통찰',
  research: '연구 메모',
  application: '적용 아이디어',
  question: '질문',
  pastoral: '목회적 관찰',
  illustration: '예화 후보',
  warning: '경고 메모',
}

export const NOTE_TYPE_DESCRIPTIONS: Record<NoteType, string> = {
  insight: '핵심 진술형 통찰. 본문의 신학적, 구조적, 언어적 깊이를 꿰뚫는 요점',
  research: '깊이 있는 연구 기록. 원어 분석, 주석사, 신학적 배경 탐구',
  application: '설교 적용 아이디어. 회중의 삶과 연결되는 구체적인 실천 방안',
  question: '열린 질문. 설교 전에 생각해볼 문제, 더 연구가 필요한 지점',
  pastoral: '목회적 관찰. 회중의 상황과 설교의 접점에 대한 통찰',
  illustration: '예화/이야기 후보. 본문을 설명할 수 있는 구체적 이미지나 사례',
  warning: '설교 경고. 설교에서 피해야 할 함정, 주의할 표현, 신학적 위험',
}

export const NOTE_TYPE_COLORS: Record<NoteType, string> = {
  insight: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  research: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  application: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  question: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  pastoral: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  illustration: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  warning: 'bg-red-500/10 text-red-300 border-red-500/20',
}

export const NOTE_TYPE_DOTS: Record<NoteType, string> = {
  insight: 'bg-emerald-500',
  research: 'bg-blue-500',
  application: 'bg-violet-500',
  question: 'bg-amber-500',
  pastoral: 'bg-rose-500',
  illustration: 'bg-cyan-500',
  warning: 'bg-red-500',
}

export const NOTE_TYPES: NoteType[] = ['insight', 'research', 'application', 'question', 'pastoral', 'illustration', 'warning']


export const NOTES: NoteEntry[] = []

/* ─── Helpers ─── */

export function getAllTags(notes: NoteEntry[] = NOTES): string[] {
  const tags = new Set<string>()
  notes.forEach(n => n.tags.forEach(t => tags.add(t)))
  return Array.from(tags).sort()
}

export function getAllConnections(notes: NoteEntry[] = NOTES): Record<string, number> {
  const conns: Record<string, number> = {}
  notes.forEach(n => {
    n.connections.forEach(c => {
      const key = `${c.type}::${c.id}`
      conns[key] = (conns[key] || 0) + 1
    })
  })
  return conns
}

export type SortMode = 'recent' | 'referenced' | 'connections' | 'starred'

export function filterNotes(
  notes: NoteEntry[],
  filters: {
    types: NoteType[]
    tags: string[]
    starredOnly: boolean
    pinnedOnly: boolean
    connectionType?: NoteConnectionType
    connectionId?: string
    searchQuery?: string
    sortMode?: SortMode
  },
): NoteEntry[] {
  let result = [...notes]

  if (filters.types.length > 0) {
    result = result.filter(n => filters.types.includes(n.type))
  }
  if (filters.tags.length > 0) {
    result = result.filter(n => filters.tags.some(t => n.tags.includes(t)))
  }
  if (filters.starredOnly) {
    result = result.filter(n => n.starred)
  }
  if (filters.pinnedOnly) {
    result = result.filter(n => n.pinned)
  }
  if (filters.connectionType && filters.connectionId) {
    result = result.filter(n =>
      n.connections.some(c => c.type === filters.connectionType && c.id === filters.connectionId),
    )
  }
  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase().trim()
    if (q) {
      result = result.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q) ||
        n.tags.some(t => t.toLowerCase().includes(q)) ||
        n.connections.some(c => c.label.toLowerCase().includes(q)),
      )
    }
  }

  // Sort
  const mode = filters.sortMode || 'recent'
  if (mode === 'recent') {
    result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  } else if (mode === 'referenced') {
    result.sort((a, b) => {
      if (!a.lastReferencedAt && !b.lastReferencedAt) return 0
      if (!a.lastReferencedAt) return 1
      if (!b.lastReferencedAt) return -1
      return new Date(b.lastReferencedAt).getTime() - new Date(a.lastReferencedAt).getTime()
    })
  } else if (mode === 'connections') {
    result.sort((a, b) => b.connections.length - a.connections.length)
  } else if (mode === 'starred') {
    result.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      if (a.starred !== b.starred) return a.starred ? -1 : 1
      return 0
    })
  }

  return result
}

export function findRelatedNotes(note: NoteEntry, allNotes: NoteEntry[], maxResults = 5): { note: NoteEntry; reason: string }[] {
  const related: { note: NoteEntry; reason: string; score: number }[] = []

  allNotes.forEach(other => {
    if (other.id === note.id) return

    // Check shared connections
    const sharedConns = note.connections.filter(nc =>
      other.connections.some(oc => oc.type === nc.type && oc.id === nc.id),
    )

    // Check shared tags
    const sharedTags = note.tags.filter(t => other.tags.includes(t))

    // Check shared project
    const sharedProjects = note.projectIds.filter(p => other.projectIds.includes(p))

    let score = 0
    let reason = ''

    if (sharedConns.length > 0) {
      score += sharedConns.length * 3
      const top = sharedConns[0]
      reason = `같은 ${top.type === 'passage' ? '본문' : top.type === 'theme' ? '주제' : top.type === 'word' ? '원어' : '연결'} 공유`
    }
    if (sharedTags.length > 0) {
      score += sharedTags.length * 2
      if (!reason) reason = `공통 태그: #${sharedTags.slice(0, 2).join(', #')}`
    }
    if (sharedProjects.length > 0) {
      score += sharedProjects.length * 2
      if (!reason) reason = '같은 프로젝트'
    }

    if (score > 0) {
      related.push({ note: other, reason, score })
    }
  })

  related.sort((a, b) => b.score - a.score)
  return related.slice(0, maxResults).map(({ note, reason }) => ({ note, reason }))
}

export function getInsightSummary(notes: NoteEntry[] = NOTES) {
  return {
    totalNotes: notes.length,
    byType: NOTE_TYPES.map(t => ({ type: t, label: NOTE_TYPE_LABELS[t], count: notes.filter(n => n.type === t).length })),
    starredCount: notes.filter(n => n.starred).length,
    pinnedCount: notes.filter(n => n.pinned).length,
    recentNotes: notes.filter(n => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return new Date(n.updatedAt) > weekAgo
    }).length,
    topTopics: getTopTopics(notes),
    mostReferenced: [...notes].sort((a, b) => b.referenceCount - a.referenceCount).slice(0, 3),
  }
}

function getTopTopics(notes: NoteEntry[]): { topic: string; count: number }[] {
  const topicCount: Record<string, number> = {}
  notes.forEach(n => {
    n.connections
      .filter(c => c.type === 'theme' || c.type === 'passage')
      .forEach(c => {
        topicCount[c.label] = (topicCount[c.label] || 0) + 1
      })
  })
  return Object.entries(topicCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic, count]) => ({ topic, count }))
}
