// 대한민국 법정공휴일 및 주요 기독교 절기 계산 모듈

export interface CalendarHoliday {
  name: string
  type: 'public' | 'christian' // 'public': 법정공휴일, 'christian': 기독교 절기
  isRedDay?: boolean // 빨간날 (공휴일) 여부
}

// 서양 양력 부활절 날짜 계산 (Meeus/Jones/Butcher 알고리즘)
export function getEasterDate(year: number): { month: number; day: number } {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return { month, day }
}

// 2024~2030 주요 음력 공휴일 (설날, 추석, 부처님오신날)
const LUNAR_HOLIDAYS_MAP: Record<number, Record<string, string>> = {
  2024: {
    '02-09': '설날 연휴', '02-10': '설날', '02-11': '설날 연휴', '02-12': '대체공휴일',
    '05-15': '부처님오신날',
    '09-16': '추석 연휴', '09-17': '추석', '09-18': '추석 연휴',
  },
  2025: {
    '01-28': '설날 연휴', '01-29': '설날', '01-30': '설날 연휴',
    '05-05': '어린이날/부처님오신날',
    '10-05': '추석 연휴', '10-06': '추석', '10-07': '추석 연휴', '10-08': '대체공휴일',
  },
  2026: {
    '02-16': '설날 연휴', '02-17': '설날', '02-18': '설날 연휴',
    '05-24': '부처님오신날',
    '09-24': '추석 연휴', '09-25': '추석', '09-26': '추석 연휴',
  },
  2027: {
    '02-06': '설날 연휴', '02-07': '설날', '02-08': '설날 연휴', '02-09': '대체공휴일',
    '05-13': '부처님오신날',
    '09-14': '추석 연휴', '09-15': '추석', '09-16': '추석 연휴',
  },
  2028: {
    '01-26': '설날 연휴', '01-27': '설날', '01-28': '설날 연휴',
    '05-02': '부처님오신날',
    '10-02': '추석 연휴', '10-03': '개천절/추석', '10-04': '추석 연휴', '10-05': '대체공휴일',
  },
}

// 연도와 월/일(YYYY, M, D)에 해당하는 공휴일 및 기독교 절기 목록 가져오기
export function getHolidaysAndFestivals(year: number, month: number, day: number): CalendarHoliday[] {
  const results: CalendarHoliday[] = []
  const mm = String(month).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  const key = `${mm}-${dd}`

  // 1. 고정 양력 대한민국 공휴일
  const fixedPublicHolidays: Record<string, string> = {
    '01-01': '신정',
    '03-01': '삼일절',
    '05-05': '어린이날',
    '06-06': '현충일',
    '08-15': '광복절',
    '10-03': '개천절',
    '10-09': '한글날',
    '12-25': '성탄절',
  }

  if (fixedPublicHolidays[key]) {
    const isXmas = key === '12-25'
    results.push({
      name: fixedPublicHolidays[key],
      type: isXmas ? 'christian' : 'public',
      isRedDay: true,
    })
  }

  // 2. 음력 공휴일 (설날, 추석, 석가탄신일)
  if (LUNAR_HOLIDAYS_MAP[year] && LUNAR_HOLIDAYS_MAP[year][key]) {
    if (!results.some(r => r.name === LUNAR_HOLIDAYS_MAP[year][key])) {
      results.push({
        name: LUNAR_HOLIDAYS_MAP[year][key],
        type: 'public',
        isRedDay: true,
      })
    }
  }

  // 3. 동적 기독교 절기 계산 (부활절 기준)
  const easter = getEasterDate(year)
  const easterDate = new Date(year, easter.month - 1, easter.day)
  const currentDate = new Date(year, month - 1, day)
  const diffDays = Math.round((currentDate.getTime() - easterDate.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    results.push({ name: '부활절', type: 'christian', isRedDay: false })
  } else if (diffDays === -7) {
    results.push({ name: '종려주일', type: 'christian', isRedDay: false })
  } else if (diffDays === -2) {
    results.push({ name: '성금요일', type: 'christian', isRedDay: false })
  } else if (diffDays === -46) {
    results.push({ name: '사순절 시작(재의 수요일)', type: 'christian', isRedDay: false })
  } else if (diffDays === 49) {
    results.push({ name: '성령강림절', type: 'christian', isRedDay: false })
  } else if (diffDays === 56) {
    results.push({ name: '삼위일체주일', type: 'christian', isRedDay: false })
  }

  // 4. 고정 기독교 절기 및 주일 절기
  if (key === '01-06') {
    results.push({ name: '주현절', type: 'christian', isRedDay: false })
  }

  // 맥추감사주일: 7월 첫째 주일
  if (month === 7 && currentDate.getDay() === 0 && day <= 7) {
    results.push({ name: '맥추감사주일', type: 'christian', isRedDay: false })
  }

  // 추수감사주일: 11월 셋째 주일
  if (month === 11 && currentDate.getDay() === 0 && day >= 15 && day <= 21) {
    results.push({ name: '추수감사주일', type: 'christian', isRedDay: false })
  }

  // 대림절(대강절) 첫째 주일
  if ((month === 11 || month === 12) && currentDate.getDay() === 0) {
    const xmasDate = new Date(year, 11, 25)
    const xmasDayOfWeek = xmasDate.getDay()
    const adventStartDiff = xmasDayOfWeek === 0 ? 28 : (xmasDayOfWeek + 21)
    const adventStartDate = new Date(year, 11, 25 - adventStartDiff)
    if (currentDate.toDateString() === adventStartDate.toDateString()) {
      results.push({ name: '대림절 시작', type: 'christian', isRedDay: false })
    }
  }

  if (month === 10 && currentDate.getDay() === 0 && day >= 25) {
    results.push({ name: '종교개혁주일', type: 'christian', isRedDay: false })
  }
  if (key === '12-31') {
    results.push({ name: '송구영신', type: 'christian', isRedDay: false })
  }

  return results
}
