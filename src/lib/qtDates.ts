// QT 생성기/뷰어/PDF 레이아웃이 공유하는 날짜 헬퍼
// 모든 함수는 YYYY-MM-DD 형식의 문자열을 기준으로 동작한다.

// 오늘 날짜를 YYYY-MM-DD 로 반환
export function getTodayDateString(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const date = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${date}`
}

// 월별 주차 시작일 계산 헬퍼 (Week 1은 1일, Week 2부터는 두 번째 월요일부터 시작하여 날짜 유실 방지)
export function getMonthlyWeekStartDates(year: number, month: number, weekCount: number): string[] {
  const dates: string[] = []
  dates.push(`${year}-${String(month).padStart(2, '0')}-01`)

  const d1 = new Date(year, month - 1, 1)
  const dow1 = d1.getDay() // 0: Sun, 1: Mon, ..., 6: Sat
  const daysToSecondWeekMonday = dow1 === 1 ? 7 : (8 - dow1) % 7 || 7

  const week2Monday = new Date(year, month - 1, 1 + daysToSecondWeekMonday)

  for (let i = 1; i < weekCount; i++) {
    const wDate = new Date(week2Monday)
    wDate.setDate(week2Monday.getDate() + (i - 1) * 7)
    const y = wDate.getFullYear()
    const m = String(wDate.getMonth() + 1).padStart(2, '0')
    const d = String(wDate.getDate()).padStart(2, '0')
    dates.push(`${y}-${m}-${d}`)
  }

  return dates
}

// 주차 번호(weekNumber) 및 사용 월에 따른 정확한 시작 날짜 자동 산출 헬퍼
export function computeStartDateForWeek(year: number, month: number, weekNumber: number): string {
  const dates = getMonthlyWeekStartDates(year, month, Math.max(weekNumber, 6))
  return dates[weekNumber - 1] || dates[0]
}

// 다음 달 1일을 YYYY-MM-01 로 반환
export function getNextMonthFirstDay(): string {
  const d = new Date()
  const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  const year = nextMonth.getFullYear()
  const month = String(nextMonth.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}-01`
}

// dateStr 달의 월~토(일요일 제외) 모든 날짜 라벨 배열
// 예: getWeekdayDateLabels("2026-08-01") → ["8/1 (토)", "8/3 (월)", ..., "8/31 (월)"]
export function getWeekdayDateLabels(dateStr: string): string[] {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return []
  const year = date.getFullYear()
  const month = date.getMonth()
  const lastDay = new Date(year, month + 1, 0).getDate()
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']
  const labels: string[] = []
  for (let d = 1; d <= lastDay; d++) {
    const cur = new Date(year, month, d)
    if (cur.getDay() === 0) continue
    labels.push(`${month + 1}/${d} (${dayNames[cur.getDay()]})`)
  }
  return labels
}

// dateStr 달의 월~토(일요일 제외) 일수 반환
export function getWeekdayCountInMonth(dateStr: string): number {
  return getWeekdayDateLabels(dateStr).length
}

// 해당 월의 총 일수 계산 (윤달 포함)
// dateStr 이 "2026-02-18" 이면 28 (or 29), "2026-07-18" 이면 31
export function getDaysInMonth(dateStr: string): number {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 30
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

// 시작일부터 daysCount 개의 평일(월~토, 일요일 제외) 라벨 배열을 생성
// 예: getFormattedDateListWeekdays("2026-07-06", 3) → ["7/6 (월)", "7/7 (화)", "7/8 (수)"]
export function getFormattedDateListWeekdays(startDateStr: string, daysCount: number): string[] {
  const list: string[] = []
  const start = new Date(startDateStr)
  if (isNaN(start.getTime())) return []

  const dayNames = ['일', '월', '화', '수', '목', '금', '토']
  let i = 0
  while (list.length < daysCount) {
    const next = new Date(start)
    next.setDate(start.getDate() + i)
    if (next.getDay() !== 0) {
      const month = next.getMonth() + 1
      const date = next.getDate()
      const dayName = dayNames[next.getDay()]
      list.push(`${month}/${date} (${dayName})`)
    }
    i++
  }
  return list
}

// 시작일부터 daysCount 일 만큼 "M/D (요일)" 형식의 라벨 배열을 생성
// 예: getFormattedDateList("2026-07-15", 7) → ["7/15 (화)", "7/16 (수)", ...]
export function getFormattedDateList(startDateStr: string, daysCount: number): string[] {
  const list: string[] = []
  const start = new Date(startDateStr)
  if (isNaN(start.getTime())) return []

  const dayNames = ['일', '월', '화', '수', '목', '금', '토']
  for (let i = 0; i < daysCount; i++) {
    const next = new Date(start)
    next.setDate(start.getDate() + i)
    const month = next.getMonth() + 1
    const date = next.getDate()
    const dayName = dayNames[next.getDay()]
    list.push(`${month}/${date} (${dayName})`)
  }
  return list
}

// 요일/날짜 라벨 포맷 헬퍼 (이미 "7/15 (화)" 형태인 경우 그대로, "월" 등 단축형인 경우 "월요일" 보정)
export function formatDayLabel(day: string): string {
  const clean = day.replace(/요일/g, '').trim()
  if (['월', '화', '수', '목', '금', '토', '일'].includes(clean)) {
    return `${clean}요일`
  }
  return day
}

// 입력된 날짜가 속한 주의 월요일(YYYY-MM-DD)을 반환
// 일(0) → 6일 전, 월(1) → 0일 전, ... 토(6) → 5일 전
export function getMondayOfWeek(dateStr: string): string {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  const dayOfWeek = date.getDay()
  const diffToMonday = (dayOfWeek + 6) % 7 // 월요일까지의 일수 차이
  const monday = new Date(date)
  monday.setDate(date.getDate() - diffToMonday)
  const year = monday.getFullYear()
  const month = String(monday.getMonth() + 1).padStart(2, '0')
  const d = String(monday.getDate()).padStart(2, '0')
  return `${year}-${month}-${d}`
}

// "YYYY-MM-DD" 또는 "YYYY-MM" 을 해당 달의 1일("YYYY-MM-01")로 정규화
export function normalizeMonthlyDate(dateStr: string): string {
  if (!dateStr) return dateStr
  // "YYYY-MM" 형태면 -01 붙이기
  if (/^\d{4}-\d{2}$/.test(dateStr)) return `${dateStr}-01`
  // "YYYY-MM-DD" 형태면 -01 로 교체
  const match = dateStr.match(/^(\d{4}-\d{2})/)
  if (match) return `${match[1]}-01`
  return dateStr
}

// 날짜 범위 라벨을 하나의 문자열로 포맷 (UI 미리보기 배지용)
// 주간: "7/15 (월) ~ 7/21 (일)"
// 월간: "7/1 (수) ~ 7/31 (금) · 총 31일"
export function formatDateRangeLabel(startDateStr: string, daysCount: number): string {
  const list = getFormattedDateListWeekdays(startDateStr, daysCount)
  if (list.length === 0) return ''
  const first = list[0]
  const last = list[list.length - 1]
  return `${first} ~ ${last}`
}

// 마지막 분할 본문에서 다음 시작 본문을 추출 (청킹 분할 연결용)
// "창세기 5:1-5" → "창세기 5:6"
// "창세기 5:1-31" → "창세기 6:1"
// "창세기 5" → "창세기 6:1"
// "창세기 5:30" → "창세기 5:31" (단일 절)
// "에베소서 2:1-3(끝절 포함)" → (괄호 제거) → "에베소서 2:4"
// 실패 시 폴백으로 bookName 1:1 반환
export function getNextStartPassage(lastPassage: string, bookName: string): string {
  if (!lastPassage) return `${bookName} 1:1`
  // 한글 접미사(괄호) 제거: (끝절 포함), (포함), (끝), (일부) 등
  const clean = lastPassage.replace(/\([^)]*\)/g, '').trim()
  // "창세기 5:1-31" 또는 "창세기 5:1~31" 형태
  const rangeMatch = clean.match(/^(\S+)\s*(\d+)\s*[:：]\s*(\d+)\s*[-~]\s*(\d+)$/)
  if (rangeMatch) {
    const [, book, chap, , endV] = rangeMatch
    const endVerse = parseInt(endV)
    // 일반적인 장의 마지막 절에 가까우면 다음 장 1절로 (임계값 30)
    if (endVerse >= 30) return `${book} ${parseInt(chap) + 1}:1`
    return `${book} ${chap}:${endVerse + 1}`
  }
  // "창세기 5:5" 단일 절
  const singleVerseMatch = clean.match(/^(\S+)\s*(\d+)\s*[:：]\s*(\d+)$/)
  if (singleVerseMatch) {
    const [, book, chap, v] = singleVerseMatch
    const verse = parseInt(v)
    if (verse >= 30) return `${book} ${parseInt(chap) + 1}:1`
    return `${book} ${chap}:${verse + 1}`
  }
  // "창세기 5" 장만
  const chapterOnlyMatch = clean.match(/^(\S+)\s*(\d+)$/)
  if (chapterOnlyMatch) {
    const [, book, chap] = chapterOnlyMatch
    return `${book} ${parseInt(chap) + 1}:1`
  }
  // 실패 시 다른 성경책일 수 있으므로 원본에서 book만 추출 시도
  const bookMatch = clean.match(/^([가-힣]+(?:상|하)?(?:서|기|편|전|록|아|뎀|회)?)/)
  if (bookMatch) {
    return `${bookMatch[1]} 1:1`
  }
  return `${bookName} 1:1`
}
