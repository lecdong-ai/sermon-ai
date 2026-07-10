import type { SaveState, VersionDetail, RecentChange, TabProgress, SaveStatus } from './types'

export const MOCK_SAVE_STATE: SaveState = {
  status: 'saved' as SaveStatus,
  lastSavedAt: '2026-06-11T14:14:00Z',
}

export const MOCK_TAB_PROGRESS: TabProgress = {
  study: 'complete',
  prep: 'revised',
  manuscript: 'revised',
}

export const MOCK_VERSIONS: VersionDetail[] = [
  {
    id: 'v6',
    version: 6,
    label: '최신 작업본',
    summary: '본론 2 보강 및 적용 메모 추가',
    changedBy: 'user',
    sections: ['manuscript', 'prep'],
    wordCount: 3240,
    isPinned: false,
    isCurrent: true,
    createdAt: '2026-06-11T14:14:00Z',
  },
  {
    id: 'v5',
    version: 5,
    label: '본론 보강본',
    summary: '본론 구조 재정리 — 2번 항목을 3번과 통합하고 새로운 예화 추가',
    changedBy: 'user',
    sections: ['manuscript'],
    wordCount: 3120,
    isPinned: false,
    isCurrent: false,
    createdAt: '2026-06-11T13:40:00Z',
  },
  {
    id: 'v4',
    version: 4,
    label: '초안 원고 v1',
    summary: 'AI 초안을 기반으로 1차 원고 완성',
    changedBy: 'user',
    sections: ['manuscript'],
    wordCount: 2980,
    isPinned: true,
    isCurrent: false,
    createdAt: '2026-06-11T12:40:00Z',
  },
  {
    id: 'v3',
    version: 3,
    label: '대지 재구성본',
    summary: '대지 순서 변경 — 1-2-3을 2-1-3으로 재배치',
    changedBy: 'user',
    sections: ['prep', 'manuscript'],
    wordCount: 2450,
    isPinned: false,
    isCurrent: false,
    createdAt: '2026-06-11T11:05:00Z',
  },
  {
    id: 'v2',
    version: 2,
    label: '중심명제 1차 정리',
    summary: '중심명제를 "성령 안에 있는 생명"으로 확정, 대지 초안 작성',
    changedBy: 'user',
    sections: ['prep'],
    wordCount: 1820,
    isPinned: false,
    isCurrent: false,
    createdAt: '2026-06-11T09:20:00Z',
  },
  {
    id: 'v1',
    version: 1,
    label: '연구 메모 초안',
    summary: '본문 연구 및 원어 분석 메모, 번역 비교 정리',
    changedBy: 'user',
    sections: ['study'],
    wordCount: 890,
    isPinned: false,
    isCurrent: false,
    createdAt: '2026-06-10T20:35:00Z',
  },
]

export const MOCK_RECENT_CHANGES: RecentChange[] = [
  { type: 'edit', description: '본론 2 — "성령의 생각" 단락 보강', section: 'manuscript', timestamp: '2026-06-11T14:10:00Z' },
  { type: 'edit', description: '적용 메모 2개 추가 — "성령의 생각으로 하루 시작하기"', section: 'prep', timestamp: '2026-06-11T14:05:00Z' },
  { type: 'save', description: '자동 저장됨', section: 'manuscript', timestamp: '2026-06-11T14:14:00Z' },
  { type: 'edit', description: '본론 1 서론부 문장 다듬기', section: 'manuscript', timestamp: '2026-06-11T13:50:00Z' },
  { type: 'edit', description: '중심명제 미세 조정', section: 'prep', timestamp: '2026-06-11T13:35:00Z' },
  { type: 'edit', description: '대지 2-3 순서 변경', section: 'prep', timestamp: '2026-06-11T11:05:00Z' },
  { type: 'edit', description: '중심명제 확정', section: 'prep', timestamp: '2026-06-11T09:20:00Z' },
  { type: 'generate', description: 'AI 원고 초안 생성 (45분 기준)', section: 'manuscript', timestamp: '2026-06-08T10:00:00Z' },
  { type: 'save', description: '연구 노트 4개 저장', section: 'study', timestamp: '2026-06-06T11:00:00Z' },
  { type: 'create', description: '프로젝트 생성', section: 'overview', timestamp: '2026-06-01T09:00:00Z' },
]

export function getVersionById(id: string): VersionDetail | undefined {
  return MOCK_VERSIONS.find(v => v.id === id)
}

export function getCurrentVersion(): VersionDetail | undefined {
  return MOCK_VERSIONS.find(v => v.isCurrent)
}

export function getPinnedVersions(): VersionDetail[] {
  return MOCK_VERSIONS.filter(v => v.isPinned)
}

export function getRecentChanges(since?: Date): RecentChange[] {
  if (!since) return MOCK_RECENT_CHANGES
  return MOCK_RECENT_CHANGES.filter(c => new Date(c.timestamp) > since)
}

export function getChangeCountBySection(): Record<string, number> {
  const counts: Record<string, number> = {}
  MOCK_RECENT_CHANGES.forEach(c => {
    counts[c.section] = (counts[c.section] || 0) + 1
  })
  return counts
}
