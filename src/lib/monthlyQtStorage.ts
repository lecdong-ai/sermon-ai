import type { QTFormData } from '@/components/advanced/QtGenerator'
import { parseDays } from '@/lib/qtDayParser'

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

interface DayDateEntry {
  date: Date
  weekIdx: number
  dayIdx: number
  rawContent: string
}

function getWeekDays(startDateStr: string): Date[] {
  const sp = startDateStr.split('-')
  if (sp.length !== 3) return []
  const wy = parseInt(sp[0], 10)
  const wm = parseInt(sp[1], 10)
  const wd = parseInt(sp[2], 10)
  if (isNaN(wy) || isNaN(wm) || isNaN(wd)) return []

  const weekStart = new Date(wy, wm - 1, wd)
  const days: Date[] = []
  let currDate = new Date(weekStart)

  for (let i = 0; i < 7; i++) {
    if (currDate.getDay() === 0) {
      // 주일(일요일)을 만나면 해당 주차 날짜 수집을 종료 (다음 주의 월요일을 넘어가서 낚아채지 않도록 함)
      break
    }
    days.push(new Date(currDate))
    if (days.length >= 6) break
    currDate.setDate(currDate.getDate() + 1)
  }
  return days
}

export function getAvailableMonthsInWeeks(weeks: MonthlyWeekEntry[]): { key: string; label: string; count: number }[] {
  const monthCounts: Record<string, number> = {}

  for (const week of weeks) {
    if (!week.form.startDate) continue
    const days = getWeekDays(week.form.startDate)
    for (const d of days) {
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`
      monthCounts[key] = (monthCounts[key] || 0) + 1
    }
  }

  return Object.entries(monthCounts)
    .sort((a, b) => b[1] - a[1]) // 날짜 수가 가장 많은 달이 최우선(첫 번째) 오도록 정렬
    .map(([key, count]) => {
      const [y, m] = key.split('-')
      return { key, label: `${y}년 ${m}월`, count }
    })
}

function getTargetMonthEntries(weeks: MonthlyWeekEntry[], targetYearMonth?: string): {
  targetYear: number
  targetMonth: number
  collected: DayDateEntry[]
} | null {
  const monthCounts: Record<string, number> = {}
  const allEntries: DayDateEntry[] = []

  for (let w = 0; w < weeks.length; w++) {
    const week = weeks[w]
    if (!week.form.startDate) continue
    const dates = getWeekDays(week.form.startDate)
    if (dates.length === 0) continue

    const { days, rawSections } = parseDays(week.accumulatedManuscript || '')
    const sections = rawSections.length > 0 ? rawSections : days.map(d => d.title || '')

    for (let dayIdx = 0; dayIdx < dates.length; dayIdx++) {
      const d = dates[dayIdx]
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`
      monthCounts[key] = (monthCounts[key] || 0) + 1

      const rawContent = sections[dayIdx] || ''
      allEntries.push({
        date: d,
        weekIdx: w,
        dayIdx,
        rawContent,
      })
    }
  }

  let selectedKey = targetYearMonth
  if (!selectedKey) {
    // 지정된 targetYearMonth가 없으면 날짜 수가 가장 많은 메인 달 사용 (자투리 달 배제)
    const sorted = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])
    if (sorted.length === 0) return null
    selectedKey = sorted[0][0]
  }

  const [targetYearStr, targetMonthStr] = selectedKey.split('-')
  const targetYear = parseInt(targetYearStr, 10)
  const targetMonth = parseInt(targetMonthStr, 10)

  // Target Month에 속하는 날짜만 남기고 이전 달이나 다음 달 날짜는 완전히 버림
  const collected = allEntries.filter(
    d => d.date.getFullYear() === targetYear && d.date.getMonth() + 1 === targetMonth
  )

  // 날짜 오름차순 정렬 (8월 1일, 8월 3일 ... 8월 31일)
  collected.sort((a, b) => a.date.getTime() - b.date.getTime())

  // 동일한 날짜(YYYY-MM-DD) 중복 제거 (실제 본문 내용이 존재하는 항목 최우선 유지)
  const seenDateMap = new Map<string, DayDateEntry>()
  for (const item of collected) {
    const dateKey = `${item.date.getFullYear()}-${item.date.getMonth() + 1}-${item.date.getDate()}`
    const existing = seenDateMap.get(dateKey)
    if (!existing) {
      seenDateMap.set(dateKey, item)
    } else if (!existing.rawContent.trim() && item.rawContent.trim()) {
      seenDateMap.set(dateKey, item)
    }
  }

  const uniqueCollected = Array.from(seenDateMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime())

  return { targetYear, targetMonth, collected: uniqueCollected }
}

export function combineMonthlyManuscript(weeks: MonthlyWeekEntry[], targetYearMonth?: string): string {
  if (weeks.length === 0) return ''
  const targetData = getTargetMonthEntries(weeks, targetYearMonth)
  if (!targetData || targetData.collected.length === 0) return ''

  const result: string[] = []
  for (let n = 0; n < targetData.collected.length; n++) {
    const item = targetData.collected[n]
    let dayContent = item.rawContent.trim()
    // 기존 헤더("### Day 1", "## Day 1", "Day 1" 등) 정제 후 새로운 "### Day n" 지정
    dayContent = dayContent.replace(/^(?:#+|\*{1,2})?\s*Day\s*\d+[^\n]*/i, '').trim()
    result.push(`### Day ${n + 1}\n${dayContent}`)
  }

  return result.join("\n\n")
}

export function combineMonthlyUserMemos(weeks: MonthlyWeekEntry[]): Record<number, string> {
  const combined: Record<number, string> = {}
  let dayOffset = 0
  for (const week of weeks) {
    for (const [key, val] of Object.entries(week.userMemos)) {
      if (val) combined[parseInt(key) + dayOffset] = val
    }
    const { days } = parseDays(week.accumulatedManuscript || '')
    dayOffset += days.length
  }
  return combined
}

export function combineMonthlyCalendarStrip(
  weeks: MonthlyWeekEntry[],
  targetYearMonth?: string,
): { month: string; daysInMonth: number; activeDays: number[]; dayHasContent: boolean[] } | undefined {
  if (weeks.length === 0) return undefined
  const targetData = getTargetMonthEntries(weeks, targetYearMonth)
  if (!targetData || targetData.collected.length === 0) return undefined

  const { targetYear, targetMonth, collected } = targetData
  const daysInMonth = new Date(targetYear, targetMonth, 0).getDate()

  const activeDays = collected.map(item => item.date.getDate())
  const uniqueDays = Array.from(new Set(activeDays)).sort((a, b) => a - b)
  const dayHasContent: boolean[] = Array.from({ length: daysInMonth }, (_, i) => uniqueDays.includes(i + 1))

  return { month: `${targetYear}년 ${targetMonth}월`, daysInMonth, activeDays: uniqueDays, dayHasContent }
}

export function totalDaysInWeeks(weeks: MonthlyWeekEntry[]): number {
  let count = 0
  for (const week of weeks) {
    const { days } = parseDays(week.accumulatedManuscript || '')
    count += days.length
  }
  return count
}