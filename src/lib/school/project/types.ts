export type ProjectStatus = 'research' | 'prepare' | 'writing' | 'review' | 'completed' | 'archived'
export type SaveStatus = 'saving' | 'saved' | 'modified' | 'error' | 'idle'

export type TabStageStatus = 'empty' | 'draft' | 'revised' | 'confirmed' | 'complete'

export interface TabProgress {
  study: TabStageStatus
  prep: TabStageStatus
  manuscript: TabStageStatus
}

export interface VersionDetail {
  id: string
  version: number
  label: string
  summary: string
  changedBy: 'user' | 'ai' | 'auto'
  sections: string[]
  wordCount: number
  isPinned: boolean
  isCurrent: boolean
  createdAt: string
}

export interface RecentChange {
  type: 'edit' | 'generate' | 'save' | 'create' | 'stage'
  description: string
  section: string
  timestamp: string
}

export interface SaveState {
  status: SaveStatus
  lastSavedAt: string | null
  message?: string
}

export interface BiblePassage {
  id?: string
  book: string
  chapter: number
  verseStart: number
  verseEnd: number | null
  passage: string
}

export interface AdvancedProject {
  id: string
  title: string
  passage: string
  book: string
  chapter: number
  verseStart: number
  verseEnd: number | null
  passages?: BiblePassage[]
  status: ProjectStatus
  sermonDate: string
  preacher: string
  sermonType: string
  audience: string[]
  season: string
  coreMessage: string
  wordCount: number
  version: number
  seriesId?: string
  seriesName?: string
  themeIds: string[]
  themeNames: string[]
  tagNames: string[]
  studyCount: number
  createdAt: string
  updatedAt: string
}

export interface OutlinePoint {
  title: string
  content: string
  subPoints: string[]
}

export interface ProjectDetail extends AdvancedProject {
  outlinePoints: OutlinePoint[]
  introduction: string
  conclusion: string
  applicationPoints: string[]
  titleCandidates: string[]
  manuscriptContent: string
  observations: string
  backgroundNotes: string
  interpretationNotes: string
  illustrationNotes: string
  versions: ProjectVersion[]
  recentActivity: ActivityItem[]
  relatedSermons: { id: string; title: string; passage: string; date: string }[]
}

export interface ProjectVersion {
  id: string
  version: number
  summary: string
  changedBy: 'user' | 'ai' | 'auto'
  createdAt: string
}

export interface ActivityItem {
  type: 'edit' | 'generate' | 'save' | 'create'
  description: string
  timestamp: string
}

export interface ProjectSummary {
  id: string
  title: string
  passage: string
  status: ProjectStatus
  updatedAt: string
  completionPercent: number
}

export interface RecentPassage {
  id: string
  display: string
  book: string
  chapter: number
  verseStart: number
  verseEnd: number | null
  studyCount: number
  lastStudied: string
}

export interface InsightNoteItem {
  id: string
  title: string
  preview: string
  passage: string
  noteType: string
  createdAt: string
}

export interface GraphNode {
  id: string
  label: string
  type: 'project' | 'passage' | 'theme' | 'series' | 'note'
  size: number
  color: string
}

export interface GraphLink {
  source: string
  target: string
  type: string
  weight: number
}

export interface Recommendation {
  id: string
  type: 'reuse' | 'connection' | 'suggestion'
  title: string
  description: string
  sourceLabel: string
  targetLabel: string
  relevance: number
}

export interface CongregationProfile {
  dominantAgeGroups: string[]
  faithMaturity: 'mostly_new' | 'mixed' | 'mostly_mature' | 'diverse'
  churchContext: string
  pastoralPriorities: string
  seasonNote: string
}

export const DEFAULT_CONGREGATION_PROFILE: CongregationProfile = {
  dominantAgeGroups: [],
  faithMaturity: 'mixed',
  churchContext: '',
  pastoralPriorities: '',
  seasonNote: '',
}

export const AGE_GROUP_OPTIONS = [
  '청년 (20-30대)',
  '장년 (40-50대)',
  '시니어 (60대 이상)',
  '대학생',
  '청소년',
  '새가족',
  '온가족 (혼합)',
]

export const FAITH_MATURITY_OPTIONS = [
  { value: 'mostly_new', label: '초신자 중심' },
  { value: 'mixed', label: '혼합 (초신자~성숙)' },
  { value: 'mostly_mature', label: '성숙한 성도 중심' },
  { value: 'diverse', label: '다양한 수준 분포' },
]

export interface QuickStats {
  totalProjects: number
  inProgress: number
  completed: number
  archived: number
  totalStudies: number
  totalWords: number
  thisMonthSermons: number
}

export interface MenuItem {
  key: string
  label: string
  href: string
  icon: string
  section: 'main' | 'ministry' | 'knowledge' | 'system'
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  research: '연구 중',
  prepare: '준비 중',
  writing: '작성 중',
  review: '검토 중',
  completed: '완료',
  archived: '보관',
}

export const PROJECT_STATUS_ORDER: ProjectStatus[] = [
  'research',
  'prepare',
  'writing',
  'review',
  'completed',
]

export const SAVE_STATUS_LABELS: Record<SaveStatus, string> = {
  saving: '저장 중...',
  saved: '자동 저장됨',
  modified: '수정됨',
  error: '저장 실패',
  idle: '',
}

export const TAB_STAGE_LABELS: Record<TabStageStatus, string> = {
  empty: '시작 전',
  draft: '초안',
  revised: '수정됨',
  confirmed: '확정',
  complete: '완료',
}

export const TAB_STAGE_COLORS: Record<TabStageStatus, string> = {
  empty: 'bg-paper-200 text-paper-400',
  draft: 'bg-amber-100 text-amber-700',
  revised: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-green-100 text-green-700',
  complete: 'bg-navy-100 text-navy-700',
}

export const SAVE_STATUS_COLORS: Record<SaveStatus, string> = {
  saving: 'text-blue-500',
  saved: 'text-green-500',
  modified: 'text-amber-500',
  error: 'text-red-500',
  idle: 'text-paper-300',
}
