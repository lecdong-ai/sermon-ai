export interface ExpositoryUnit {
  order: number
  title: string
  passage: string
  startChapter: number
  startVerse: number
  endChapter: number
  endVerse: number
  sectionTitles: string[]
  focus: string
  description: string
}

export interface ExpositoryPlan {
  book: string
  bookAbbr: string
  chapters: number
  seriesTitle: string
  bookTheme: string
  canonicalFlow: string
  units: ExpositoryUnit[]
}
