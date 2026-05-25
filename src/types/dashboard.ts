export interface SermonD {
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

export interface ThemeD {
  id: string
  name: string
  category: string
  description: string
}

export interface TagD {
  id: string
  name: string
  type: 'major' | 'situation' | 'emotion'
}

export interface SeriesD {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  status: '진행중' | '완료' | '예정'
}

export interface RelationD {
  id: string
  sourceType: string
  sourceId: string
  targetType: string
  targetId: string
  relationType: string
}

export type PageView = 'home' | 'list' | 'detail' | 'new' | 'edit' | 'graph' | 'stats' | 'series' | 'series-detail' | 'tags' | 'settings'
