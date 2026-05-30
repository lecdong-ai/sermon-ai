export interface Sermon {
  id: string
  title: string
  date: string
  preacher: string
  sermonType: string
  audience: string
  season: string
  seriesId: string
  bibleBook: string
  chapterStart: number
  verseStart: number
  chapterEnd: number
  verseEnd: number
  normalizedPassage: string
  coreMessage: string
  outlineIntro: string
  outlinePoint1: string
  outlinePoint2: string
  outlinePoint3: string
  outlineConclusion: string
  manuscript: string
  themeIds: string[]
  tagIds: string[]
  relatedSermonIds: string[]
  createdAt: string
  updatedAt: string
}

export interface Theme {
  id: string
  name: string
  category: 'major' | 'situation' | 'emotion'
  description: string
}

export interface Series {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'planned'
}

export type SermonType =
  | '주일예배'
  | '새벽예배'
  | '수요예배'
  | '금요기도회'
  | '청년예배'
  | '특별집회'

export type Audience =
  | '장년'
  | '청년'
  | '청소년'
  | '교사'
  | '새가족'
  | '새벽예배'
  | '수요예배'
  | '금요기도회'

export type Season =
  | '대림절'
  | '성탄절'
  | '신년'
  | '사순절'
  | '고난주간'
  | '부활절'
  | '성령강림절'
  | '추수감사절'
  | '송구영신'
  | '일반주일'

export interface GraphNode {
  id: string
  label: string
  type: 'sermon' | 'passage' | 'theme' | 'season' | 'audience' | 'series'
  color: string
  size: number
  sermonCount?: number
}

export interface GraphLink {
  source: string
  target: string
  type: string
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

export type ViewMode = 'table' | 'card'
