export interface MonthlyQtBook {
  id: string
  year: number
  month: number
  title: string
  bibleBook: string
  fullManuscript: string
  created_at: string
  sizeOption?: string
  templateId?: string
  pageCount?: number
  includeDiaryPage?: boolean
  seriesName?: string
  audience?: string
  level?: number
  tone?: string
  monthCalendarStrip?: {
    month: string
    daysInMonth: number
    activeDays: number[]
    dayHasContent: boolean[]
  }
}

const LIBRARY_STORAGE_KEY = 'qt_monthly_library_v1'

export function getMonthlyLibrary(): MonthlyQtBook[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LIBRARY_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error('Failed to load monthly library:', e)
    return []
  }
}

export function saveMonthlyBook(book: MonthlyQtBook): MonthlyQtBook[] {
  if (typeof window === 'undefined') return []
  try {
    const library = getMonthlyLibrary()
    const existingIdx = library.findIndex(b => b.id === book.id)
    let updated: MonthlyQtBook[] = []

    if (existingIdx >= 0) {
      updated = [...library]
      updated[existingIdx] = book
    } else {
      updated = [book, ...library]
    }

    localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(updated))
    return updated
  } catch (e) {
    console.error('Failed to save monthly book:', e)
    return getMonthlyLibrary()
  }
}

export function deleteMonthlyBook(id: string): MonthlyQtBook[] {
  if (typeof window === 'undefined') return []
  try {
    const library = getMonthlyLibrary()
    const updated = library.filter(b => b.id !== id)
    localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(updated))
    return updated
  } catch (e) {
    console.error('Failed to delete monthly book:', e)
    return getMonthlyLibrary()
  }
}
