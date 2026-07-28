import type { QTFormData } from '@/components/advanced/QtGenerator'

const BASE_KEY = 'monthly_qt_data'

function storageKey(generationKey: string): string {
  return generationKey ? `${BASE_KEY}_${generationKey}` : BASE_KEY
}

export interface MonthlyWeekEntry {
  accumulatedManuscript: string
  form: QTFormData
  userMemos: Record<number, string>
  startPassage?: string
  endPassage?: string
  daySectionTitles?: Record<number, string[]>
}

export function saveWeeklyToMonthly(data: MonthlyWeekEntry, generationKey = 'default'): void {
  const key = storageKey(generationKey)
  const existing = getMonthlyWeeks(generationKey)
  existing.push(data)
  localStorage.setItem(key, JSON.stringify(existing))
}

export function getMonthlyWeeks(generationKey = 'default'): MonthlyWeekEntry[] {
  try {
    const key = storageKey(generationKey)
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function clearMonthlyWeeks(generationKey = 'default'): void {
  const key = storageKey(generationKey)
  localStorage.removeItem(key)
}

export function getMonthlyWeekCount(generationKey = 'default'): number {
  return getMonthlyWeeks(generationKey).length
}

export function removeLastMonthlyWeek(generationKey = 'default'): void {
  const key = storageKey(generationKey)
  const weeks = getMonthlyWeeks(generationKey)
  weeks.pop()
  localStorage.setItem(key, JSON.stringify(weeks))
}

export function combineMonthlyManuscript(weeks: MonthlyWeekEntry[]): string {
  if (weeks.length === 0) return ''
  const parts: string[] = []
  let dayOffset = 0
  for (let w = 0; w < weeks.length; w++) {
    let manuscript = weeks[w].accumulatedManuscript.trim()
    if (w > 0) {
      manuscript = manuscript.replace(/^#\s+QT:.*$/m, '').trim()
    }
    let localDay = 1
    manuscript = manuscript.replace(/^##\s*Day\s*\d+/gim, () => `## Day ${dayOffset + localDay++}`)
    parts.push(manuscript)
    const dayCount = localDay - 1
    dayOffset += dayCount
  }
  return parts.join('\n\n')
}

export function combineMonthlyUserMemos(weeks: MonthlyWeekEntry[]): Record<number, string> {
  const combined: Record<number, string> = {}
  let dayOffset = 0
  for (const week of weeks) {
    for (const [key, val] of Object.entries(week.userMemos)) {
      if (val) combined[parseInt(key) + dayOffset] = val
    }
    const dayCount = (week.accumulatedManuscript.match(/^##\s*Day\s*\d+/gim) || []).length
    dayOffset += dayCount
  }
  return combined
}

export function combineMonthlyCalendarStrip(
  weeks: MonthlyWeekEntry[],
): { month: string; daysInMonth: number; activeDays: number[]; dayHasContent: boolean[] } | undefined {
  const first = weeks[0]
  if (!first?.form?.startDate) return undefined
  const parts = first.form.startDate.split('-')
  if (parts.length !== 3) return undefined
  const year = parseInt(parts[0], 10)
  const monthNum = parseInt(parts[1], 10)
  if (isNaN(year) || isNaN(monthNum)) return undefined
  const daysInMonth = new Date(year, monthNum, 0).getDate()

  const activeDays: number[] = []
  for (const week of weeks) {
    if (!week.form.startDate) continue
    const wParts = week.form.startDate.split('-')
    if (wParts.length !== 3) continue
    const startDay = parseInt(wParts[2], 10)
    if (isNaN(startDay)) continue
    const weekStart = new Date(year, monthNum - 1, startDay)
    for (let i = 0; i < 6; i++) {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + i)
      if (d.getDay() !== 0) activeDays.push(d.getDate())
    }
  }

  const dayHasContent: boolean[] = Array.from({ length: daysInMonth }, (_, i) => activeDays.includes(i + 1))

  return { month: `${year}년 ${monthNum}월`, daysInMonth, activeDays, dayHasContent }
}

export function totalDaysInWeeks(weeks: MonthlyWeekEntry[]): number {
  let count = 0
  for (const week of weeks) {
    count += (week.accumulatedManuscript.match(/^##\s*Day\s*\d+/gim) || []).length
  }
  return count
}
