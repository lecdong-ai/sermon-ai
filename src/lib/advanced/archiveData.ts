export interface ArchivedSermon {
  id: string
  title: string
  passage: string
  book: string
  chapter: number
  verseStart: number
  verseEnd: number | null
  sermonDate: string
  preacher: string
  sermonType: string
  audience: string[]
  season: string
  coreMessage: string
  wordCount: number
  seriesName?: string
  themeNames: string[]
  tagNames: string[]
  introduction: string
  conclusion: string
  outlineTitles: string[]
  relatedIds: string[]
  createdAt: string
  updatedAt: string
}

export function getFilterOptions(sermons: ArchivedSermon[]) {
  const books = Array.from(new Set(sermons.map(s => s.book))).sort()
  const themes = Array.from(new Set(sermons.flatMap(s => s.themeNames))).sort()
  const series = Array.from(new Set(sermons.filter(s => s.seriesName).map(s => s.seriesName!))).sort()
  const seasons = Array.from(new Set(sermons.map(s => s.season))).sort()
  const audiences = Array.from(new Set(sermons.flatMap(s => s.audience))).sort()
  const sermonTypes = Array.from(new Set(sermons.map(s => s.sermonType))).sort()
  return { books, themes, series, seasons, audiences, sermonTypes }
}

export function getRelatedSermons(sermon: ArchivedSermon, all: ArchivedSermon[]): ArchivedSermon[] {
  return sermon.relatedIds.map(id => all.find(s => s.id === id)).filter(Boolean) as ArchivedSermon[]
}

export function searchSermons(sermons: ArchivedSermon[], query: string): ArchivedSermon[] {
  const q = query.toLowerCase().trim()
  if (!q) return sermons
  return sermons.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.passage.toLowerCase().includes(q) ||
    s.book.toLowerCase().includes(q) ||
    s.coreMessage.toLowerCase().includes(q) ||
    s.themeNames.some(t => t.toLowerCase().includes(q)) ||
    s.tagNames.some(t => t.toLowerCase().includes(q)) ||
    s.sermonType.toLowerCase().includes(q) ||
    s.audience.some(a => a.toLowerCase().includes(q))
  )
}

export function filterSermons(sermons: ArchivedSermon[], filters: {
  books: string[]; themes: string[]; series: string[]; seasons: string[]; audiences: string[]
}): ArchivedSermon[] {
  return sermons.filter(s => {
    if (filters.books.length && !filters.books.includes(s.book)) return false
    if (filters.themes.length && !filters.themes.some(t => s.themeNames.includes(t))) return false
    if (filters.series.length && (!s.seriesName || !filters.series.includes(s.seriesName))) return false
    if (filters.seasons.length && !filters.seasons.includes(s.season)) return false
    if (filters.audiences.length && !filters.audiences.some(a => s.audience.includes(a))) return false
    return true
  })
}

export function getAllArchivedSermons(completedProjects: {
  id: string; title: string; passage: string; book: string; chapter: number;
  verseStart: number; verseEnd: number | null; sermonDate: string; preacher: string;
  sermonType: string; audience: string[]; season: string; coreMessage: string;
  wordCount: number; seriesName?: string; themeNames: string[]; tagNames: string[];
  createdAt: string; updatedAt: string;
}[]): ArchivedSermon[] {
  return completedProjects.map(p => ({
    ...p,
    introduction: '',
    conclusion: '',
    outlineTitles: [],
    relatedIds: [],
  }))
}
