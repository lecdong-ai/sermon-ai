import { AdvancedProject, RecentPassage, InsightNoteItem, Recommendation, QuickStats, GraphNode, GraphLink, ProjectDetail } from './types'

export const mockTodayProject: AdvancedProject = {
  id: 'proj-001',
  title: '성령 안에 있는 생명',
  passage: '롬 8:1-11',
  book: '로마서',
  chapter: 8,
  verseStart: 1,
  verseEnd: 11,
  status: 'writing',
  sermonDate: '2026-06-14',
  preacher: '김바울',
  sermonType: '주일예배',
  audience: ['장년'],
  season: '일반주일',
  coreMessage: '성령께서 그리스도 안에서 우리에게 주시는 생명의 자유와 능력',
  wordCount: 3240,
  version: 3,
  seriesId: 'ser-001',
  seriesName: '로마서 강해',
  themeIds: ['thm-spirit', 'thm-grace'],
  themeNames: ['성령', '은혜'],
  tagNames: ['자유', '생명', '율법'],
  studyCount: 12,
  createdAt: '2026-06-01T09:00:00Z',
  updatedAt: '2026-06-09T14:30:00Z',
}

export const mockProjects: AdvancedProject[] = [
  mockTodayProject,
  {
    id: 'proj-002',
    title: '믿음의 확신과 승리',
    passage: '요일 5:1-12',
    book: '요한일서',
    chapter: 5,
    verseStart: 1,
    verseEnd: 12,
    status: 'prepare',
    sermonDate: '2026-06-21',
    preacher: '김바울',
    sermonType: '주일예배',
    audience: ['장년'],
    season: '일반주일',
    coreMessage: '예수께서 그리스도이심을 믿는 자는 하나님께로부터 난 자요',
    wordCount: 0,
    version: 1,
    seriesId: 'ser-002',
    seriesName: '요한일서 강해',
    themeIds: ['thm-faith', 'thm-hope'],
    themeNames: ['믿음', '소망'],
    tagNames: ['승리', '확신'],
    studyCount: 5,
    createdAt: '2026-06-08T10:00:00Z',
    updatedAt: '2026-06-10T08:15:00Z',
  },
  {
    id: 'proj-003',
    title: '네 이웃을 네 자신 같이 사랑하라',
    passage: '막 12:28-34',
    book: '마가복음',
    chapter: 12,
    verseStart: 28,
    verseEnd: 34,
    status: 'research',
    sermonDate: '2026-07-05',
    preacher: '김바울',
    sermonType: '주일예배',
    audience: ['장년'],
    season: '일반주일',
    coreMessage: '',
    wordCount: 0,
    version: 1,
    themeIds: [],
    themeNames: [],
    tagNames: [],
    studyCount: 2,
    createdAt: '2026-06-09T07:00:00Z',
    updatedAt: '2026-06-09T07:00:00Z',
  },
  {
    id: 'proj-004',
    title: '하나님 나라의 비유',
    passage: '마 13:24-43',
    book: '마태복음',
    chapter: 13,
    verseStart: 24,
    verseEnd: 43,
    status: 'writing',
    sermonDate: '2026-06-28',
    preacher: '김바울',
    sermonType: '수요예배',
    audience: ['장년'],
    season: '일반주일',
    coreMessage: '하나님 나라는 현재와 미래 사이에 긴장 속에서 자라간다',
    wordCount: 2180,
    version: 2,
    themeIds: ['thm-grace'],
    themeNames: ['은혜'],
    tagNames: ['비유', '천국'],
    studyCount: 8,
    createdAt: '2026-05-25T11:00:00Z',
    updatedAt: '2026-06-08T16:45:00Z',
  },
  {
    id: 'proj-005',
    title: '성도의 삶과 소망',
    passage: '벧전 1:3-9',
    book: '베드로전서',
    chapter: 1,
    verseStart: 3,
    verseEnd: 9,
    status: 'completed',
    sermonDate: '2026-05-31',
    preacher: '김바울',
    sermonType: '주일예배',
    audience: ['장년'],
    season: '부활절',
    coreMessage: '산 소망은 예수 그리스도의 부활로 말미암았다',
    wordCount: 4510,
    version: 4,
    themeIds: ['thm-hope'],
    themeNames: ['소망'],
    tagNames: ['부활', '구원'],
    studyCount: 15,
    createdAt: '2026-05-18T09:00:00Z',
    updatedAt: '2026-05-30T22:00:00Z',
  },
]

export const mockRecentPassages: RecentPassage[] = [
  { id: 'pass-001', display: '롬 8:1-11', book: '로마서', chapter: 8, verseStart: 1, verseEnd: 11, studyCount: 3, lastStudied: '2026-06-09' },
  { id: 'pass-002', display: '요일 5:1-12', book: '요한일서', chapter: 5, verseStart: 1, verseEnd: 12, studyCount: 2, lastStudied: '2026-06-08' },
  { id: 'pass-003', display: '막 12:28-34', book: '마가복음', chapter: 12, verseStart: 28, verseEnd: 34, studyCount: 1, lastStudied: '2026-06-07' },
  { id: 'pass-004', display: '마 13:24-43', book: '마태복음', chapter: 13, verseStart: 24, verseEnd: 43, studyCount: 4, lastStudied: '2026-06-05' },
  { id: 'pass-005', display: '시 23:1-6', book: '시편', chapter: 23, verseStart: 1, verseEnd: null, studyCount: 7, lastStudied: '2026-06-01' },
]

export const mockNotes: InsightNoteItem[] = [
  {
    id: 'note-001',
    title: '롬 8:1의 정죄함 없음의 의미',
    preview: '정죄함이 없다(ouden katakrima)는 법정적 면죄를 넘어...',
    passage: '롬 8:1',
    noteType: 'exegetical',
    createdAt: '2026-06-08',
  },
  {
    id: 'note-002',
    title: '율법의 의와 성령의 관계',
    preview: '바울은 율법 자체를 부정하지 않고, 율법의 한계를 지적한다...',
    passage: '롬 8:2-4',
    noteType: 'theological',
    createdAt: '2026-06-07',
  },
  {
    id: 'note-003',
    title: '육신의 생각과 성령의 생각',
    preview: '여기서 "생각"(phronema)은 단순한 지적 활동이 아니라...',
    passage: '롬 8:5-8',
    noteType: 'exegetical',
    createdAt: '2026-06-06',
  },
  {
    id: 'note-004',
    title: '양자됨의 영이 부르짖는 아빠 아버지',
    preview: '로마서 8:15의 "아빠 아버지"(Abba, ho pater)는...',
    passage: '롬 8:14-17',
    noteType: 'pastoral',
    createdAt: '2026-06-05',
  },
]

export const mockRecommendations: Recommendation[] = [
  {
    id: 'rec-001',
    type: 'reuse',
    title: '같은 본문의 이전 설교',
    description: '"성령의 법과 생명" (2025-11-02) — 로마서 8:1-11 설교가 있습니다. 중심명제와 대지를 재참고하세요.',
    sourceLabel: '롬 8:1-11',
    targetLabel: '성령의 법과 생명 (2025.11.02)',
    relevance: 9,
  },
  {
    id: 'rec-002',
    type: 'connection',
    title: '주제 연결: 성령',
    description: '"성령" 주제로 작성한 2개의 통찰 노트가 있습니다. "성령의 인도하심" (갈 5:16-25) 참고.',
    sourceLabel: '성령 안에 있는 생명',
    targetLabel: '성령의 인도하심 (통찰 노트)',
    relevance: 8,
  },
  {
    id: 'rec-003',
    type: 'suggestion',
    title: '관련 본문 추천',
    description: '롬 8장의 핵심 주제와 연결되는 본문: 갈 5:16-25 (성령을 따라 행음), 엡 1:13-14 (성령의 인치심).',
    sourceLabel: '롬 8장',
    targetLabel: '갈 5:16-25, 엡 1:13-14',
    relevance: 7,
  },
]

export const mockQuickStats: QuickStats = {
  totalProjects: 47,
  inProgress: 3,
  completed: 38,
  totalStudies: 124,
  totalWords: 156800,
  thisMonthSermons: 2,
}

export const mockGraphData: { nodes: GraphNode[]; links: GraphLink[] } = {
  nodes: [
    { id: 'proj-001', label: '성령 안에 있는 생명', type: 'project', size: 20, color: '#2D6B4E' },
    { id: 'proj-002', label: '믿음의 확신', type: 'project', size: 16, color: '#2D6B4E' },
    { id: 'proj-004', label: '하나님 나라의 비유', type: 'project', size: 14, color: '#2D6B4E' },
    { id: 'proj-005', label: '성도의 삶과 소망', type: 'project', size: 12, color: '#7A8B99' },
    { id: 'pass-008', label: '롬 8:1-11', type: 'passage', size: 18, color: '#4A5B82' },
    { id: 'pass-005', label: '요일 5:1-12', type: 'passage', size: 14, color: '#4A5B82' },
    { id: 'pass-013', label: '막 12:28-34', type: 'passage', size: 12, color: '#4A5B82' },
    { id: 'pass-024', label: '마 13:24-43', type: 'passage', size: 14, color: '#4A5B82' },
    { id: 'pass-ps23', label: '시 23:1-6', type: 'passage', size: 10, color: '#4A5B82' },
    { id: 'thm-faith', label: '믿음', type: 'theme', size: 12, color: '#C4A25C' },
    { id: 'thm-spirit', label: '성령', type: 'theme', size: 14, color: '#C4A25C' },
    { id: 'thm-grace', label: '은혜', type: 'theme', size: 10, color: '#C4A25C' },
    { id: 'thm-hope', label: '소망', type: 'theme', size: 10, color: '#C4A25C' },
    { id: 'ser-001', label: '로마서 강해', type: 'series', size: 14, color: '#A65A4A' },
  ],
  links: [
    { source: 'proj-001', target: 'pass-008', type: 'studies', weight: 10 },
    { source: 'proj-002', target: 'pass-005', type: 'studies', weight: 10 },
    { source: 'proj-004', target: 'pass-024', type: 'studies', weight: 10 },
    { source: 'proj-005', target: 'pass-008', type: 'references', weight: 5 },
    { source: 'proj-001', target: 'thm-spirit', type: 'has_theme', weight: 8 },
    { source: 'proj-002', target: 'thm-faith', type: 'has_theme', weight: 8 },
    { source: 'proj-004', target: 'thm-grace', type: 'has_theme', weight: 6 },
    { source: 'proj-005', target: 'thm-hope', type: 'has_theme', weight: 7 },
    { source: 'proj-001', target: 'ser-001', type: 'part_of_series', weight: 8 },
    { source: 'pass-008', target: 'pass-ps23', type: 'parallel', weight: 4 },
    { source: 'thm-spirit', target: 'thm-faith', type: 'related_to', weight: 5 },
  ],
}

import { getStorageItem, setStorageItem } from '@/lib/storage'

const CUSTOM_PROJECTS_KEY = 'custom_projects'
const DELETED_MOCK_IDS_KEY = 'deleted_mock_ids'

export function getCustomProjects(): AdvancedProject[] {
  return getStorageItem<AdvancedProject[]>(CUSTOM_PROJECTS_KEY, [])
}

export function getDeletedMockIds(): string[] {
  return getStorageItem<string[]>(DELETED_MOCK_IDS_KEY, [])
}

export function getAllProjects(): AdvancedProject[] {
  const deletedIds = getDeletedMockIds()
  const filteredMock = mockProjects.filter(p => !deletedIds.includes(p.id))
  return [...filteredMock, ...getCustomProjects()]
}

export function deleteProject(id: string): boolean {
  try {
    const custom = getCustomProjects()
    const isCustom = custom.some(p => p.id === id)
    if (isCustom) {
      const filtered = custom.filter(p => p.id !== id)
      setStorageItem(CUSTOM_PROJECTS_KEY, filtered)
      return true
    }
    const isMock = mockProjects.some(p => p.id === id)
    if (isMock) {
      const deleted = getDeletedMockIds()
      if (deleted.includes(id)) return false
      deleted.push(id)
      setStorageItem(DELETED_MOCK_IDS_KEY, deleted)
      return true
    }
    return false
  } catch {
    return false
  }
}

function createMinimalProjectDetail(project: AdvancedProject): ProjectDetail {
  return {
    ...project,
    outlinePoints: [],
    introduction: '',
    conclusion: '',
    applicationPoints: [],
    titleCandidates: [],
    manuscriptContent: '',
    observations: '',
    backgroundNotes: '',
    interpretationNotes: '',
    illustrationNotes: '',
    versions: [],
    recentActivity: [
      { type: 'create', description: '프로젝트 생성', timestamp: project.createdAt }
    ],
    relatedSermons: [],
  }
}

export function getMockProjectDetail(id: string): ProjectDetail {
  const customProjects = getCustomProjects()
  const foundCustom = customProjects.find(p => p.id === id)
  if (foundCustom) return createMinimalProjectDetail(foundCustom)

  const base = [...mockProjects, mockTodayProject].find(p => p.id === id) || mockTodayProject

  return {
    ...base,
    outlinePoints: [
      {
        title: '정죄에서 자유로',
        content: '그리스도 예수 안에 있는 자에게는 결코 정죄함이 없다. 이는 우리의 행위가 아니라 그리스도의 대속 때문이다.',
        subPoints: ['율법의 정죄 vs 복음의 자유', '행위가 아닌 은혜의 원리', '더 이상 두려워하지 않는 삶'],
      },
      {
        title: '성령의 법이 주는 생명',
        content: '율법의 의가 성령을 따라 행하는 우리에게 성취되었다. 성령의 법은 죄와 사망의 법에서 우리를 해방시킨다.',
        subPoints: ['율법의 한계와 성령의 능력', '육신의 생각과 성령의 생각', '성령의 인도하심을 따라 사는 삶'],
      },
      {
        title: '부활의 소망과 확신',
        content: '그리스도를 죽은 자 가운데서 살리신 이가 성령으로 말미암아 우리 죽을 몸도 살리시리라.',
        subPoints: ['현재의 성령 내주', '미래의 부활 소망', '몸의 구속을 기다리는 창조의 탄식'],
      },
    ],
    introduction: '로마서 8장은 바울 신학의 정수라고 할 수 있습니다. 1-11절은 그중에서도 "정죄함이 없다"는 선언으로 시작하여, 성령 안에서 누리는 완전한 자유와 생명을 선포합니다. 오늘 우리는 이 본문을 통해 성령께서 우리에게 주시는 놀라운 은혜를 함께 나누고자 합니다.',
    conclusion: '사랑하는 성도 여러분, 우리는 더 이상 정죄 아래 있지 않습니다. 성령의 법이 우리를 자유롭게 하셨습니다. 이제 육신의 생각이 아니라 성령의 생각으로 살아가며, 우리 안에 거하시는 성령의 인도하심을 따라 날마다 승리하는 삶을 살아가시기를 주님의 이름으로 축복합니다.',
    applicationPoints: [
      '이번 주 하루씩 "성령의 생각"으로 하루를 시작해보기 — 아침 기도 후 성령의 인도하심을 구체적으로 구하기',
      '죄책감과 정죄감이 들 때마다 "그리스도 예수 안에는 정죄함이 없다"는 말씀을 선포하기',
      '육신의 생각(염려, 두려움, 불안)이 들 때 성령의 생각(말씀, 기도, 감사)으로 전환하는 연습하기',
    ],
    titleCandidates: [
      '성령 안에 있는 생명',
      '정죄에서 자유로',
      '성령의 법이 주는 자유',
      '더 이상 정죄함이 없나니',
      '성령으로 사는 새 생명',
    ],
    manuscriptContent: `# 성령 안에 있는 생명

## 서론
로마서 8장은 바울 신학의 정수입니다. 그중 1-11절은 "그러므로"라는 접속사로 시작하여, 7장의 율법과 죄의 문제에 대한 해답을 제시합니다. 바울은 7장에서 "오호라 나는 곤고한 사람이로다"라고 탄식했지만, 8장에서는 "그리스도 예수 안에 있는 자에게는 결코 정죄함이 없다"는 승리의 선언을 합니다.

## 1. 정죄에서 자유로 (1-4절)
"그러므로 이제 그리스도 예수 안에 있는 자에게는 결코 정죄함이 없나니"

율법은 거룩하고 의로우나, 육신으로 말미암아 연약하여 능히 행할 수 없었습니다. 그러나 하나님은 아들을 보내사 죄를 정직하심으로, 율법의 요구가 우리에게 성취되게 하셨습니다. 이는 우리가 육신을 따라 걷지 않고 성령을 따라 걸을 때 가능합니다.

## 2. 성령의 생각과 육신의 생각 (5-8절)
"육신을 따르는 자는 육신의 일을, 성령을 따르는 자는 성령의 일을 생각하나니"

여기서 "생각"(phronema)은 단순한 지적 활동이 아니라 삶의 방향과 태도를 의미합니다. 육신의 생각은 사망이요, 성령의 생각은 생명과 평안입니다.`,
    observations: '바울은 8장에서 "정죄"(katakrima)와 "자유"(eleutheria)의 대비를 통해 복음의 본질을 선명하게 보여준다. 1절의 "그러므로"(ara)는 7장의 결론을 연결하는 중요한 접속사다.',
    backgroundNotes: '로마서는 AD 57년경 고린도에서 기록됨. 로마 교회는 유대인 그리스도인과 이방인 그리스도인이 공존하던 공동체. 1-7장은 복음의 필요성과 원리, 8장은 성령의 역할과 보장을 다룬다.',
    interpretationNotes: 'phronema (φρόνημα)는 "마음씀", "생각하는 태도"를 의미. 단순한 인지적 동의가 아니라 삶의 방향과 지향점을 포함하는 개념. 헬라어 윤리철학에서 중요한 용어.',
    illustrationNotes: '어거스틴의 "고백록"에서 성령의 인도하심에 대한 고백 — "주께서 나를 당신께로 돌이키셨습니다." 칼빈은 이 구절을 "성도의 견인"의 근거로 사용.',
    versions: [
      { id: 'v3', version: 3, summary: 'AI 초안 생성 — 45분 기준', changedBy: 'ai', createdAt: '2026-06-08T10:00:00Z' },
      { id: 'v2', version: 2, summary: '2차 대지 수정 및 적용 추가', changedBy: 'user', createdAt: '2026-06-05T14:00:00Z' },
      { id: 'v1', version: 1, summary: '프로젝트 생성 및 본문 연구', changedBy: 'user', createdAt: '2026-06-01T09:00:00Z' },
    ],
    recentActivity: [
      { type: 'edit', description: '원고 3차 수정 — 본론 보강', timestamp: '2026-06-09T14:30:00Z' },
      { type: 'generate', description: 'AI 원고 초안 생성 (45분)', timestamp: '2026-06-08T10:00:00Z' },
      { type: 'edit', description: '대지 3번 항목 설명 수정', timestamp: '2026-06-07T16:00:00Z' },
      { type: 'save', description: '연구 노트 4개 저장', timestamp: '2026-06-06T11:00:00Z' },
      { type: 'edit', description: '중심명제 수정', timestamp: '2026-06-05T09:00:00Z' },
      { type: 'create', description: '프로젝트 생성', timestamp: '2026-06-01T09:00:00Z' },
    ],
    relatedSermons: [
      { id: 'proj-005', title: '성도의 삶과 소망', passage: '벧전 1:3-9', date: '2026-05-31' },
      { id: 'proj-arch-001', title: '성령의 법과 생명', passage: '롬 8:1-11', date: '2025-11-02' },
      { id: 'proj-arch-002', title: '성령을 따라 행음', passage: '갈 5:16-25', date: '2025-08-15' },
    ],
  }
}
