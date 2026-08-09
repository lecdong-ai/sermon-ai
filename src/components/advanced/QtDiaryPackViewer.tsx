'use client'

import React, { useMemo } from 'react'
import QtDiaryCoverPage from './diary/QtDiaryCoverPage'
import QtMonthlyDividerPage from './diary/QtMonthlyDividerPage'
import QtMonthlyCalendarPage from './QtMonthlyCalendarPage'
import QtMonthlyOverviewPage from './QtMonthlyOverviewPage'
import QtYearlyOverviewGridPage from './QtYearlyOverviewGridPage'
import QtWeeklyPlanPage from './QtWeeklyPlanPage'
import QtDailyDiaryPage from './QtDailyDiaryPage'
import QtYearlyWallCalendarPage from './QtYearlyWallCalendarPage'
import QtHundredGoalPage from './QtHundredGoalPage'
import QtHundredGoalPage2 from './QtHundredGoalPage2'
import QtBibleReadingMapPage from './QtBibleReadingMapPage'
import QtBibleReadingMapPage2 from './QtBibleReadingMapPage2'
import QtSoapJournalPage from './QtSoapJournalPage'
import QtSoapJournalPage2 from './QtSoapJournalPage2'
import QtIntercessoryPrayerPage from './QtIntercessoryPrayerPage'
import QtIntercessoryPrayerPage2 from './QtIntercessoryPrayerPage2'
import QtFruitsTrackerPage from './QtFruitsTrackerPage'
import QtPrayerAnswerPage from './QtPrayerAnswerPage'
import QtPrayerAnswerPage2 from './QtPrayerAnswerPage2'
import QtScriptureArtPage from './QtScriptureArtPage'
import QtScriptureArtPage2 from './QtScriptureArtPage2'
import QtSundaySermonPage from './QtSundaySermonPage'
import QtSundaySermonDeepPage from './QtSundaySermonDeepPage'
import QtMonthlyLetterPage from './QtMonthlyLetterPage'
import QtMonthlyLetterPage2 from './QtMonthlyLetterPage2'
import { CHURCH_PRESET_PAGES } from '@/lib/diaryPresets'

interface DayMeditation {
  title: string
  passage: string
  content: string
}

interface QtDiaryPackViewerProps {
  year: number
  month: number
  bibleBook: string
  themeColor: string
  manuscript: string
  includeMeditation?: boolean
  pageWidth?: number
  pageHeight?: number
  onBack: () => void
}

const ENGLISH_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function parseManuscript(manuscript: string): DayMeditation[] {
  const parts = manuscript.split(/###\s*Day\s*(\d+)/).slice(1)
  const days: DayMeditation[] = []
  for (let i = 0; i < parts.length; i += 2) {
    const dayNo = parseInt(parts[i], 10) || i / 2 + 1
    const raw = (parts[i + 1] || '').replace(/\r/g, '')
    const lines = raw.split('\n')
    let title = `Day ${dayNo} 묵상`
    let passage = ''
    const body: string[] = []
    for (const line of lines) {
      const t = line.match(/^#\s+(.+)/)
      if (t) {
        title = t[1].trim()
        continue
      }
      const p = line.match(/\*\*성경 본문\*\*\s*[:：]?\s*(.+)/) || line.match(/성경\s*본문\s*[:：]\s*(.+)/)
      if (p) {
        passage = p[1].trim()
        continue
      }
      body.push(line)
    }
    days.push({
      title,
      passage,
      content: body.join(' ').replace(/[*#`>]/g, '').replace(/\s+/g, ' ').trim(),
    })
  }
  return days
}

export default function QtDiaryPackViewer({
  year,
  month,
  bibleBook,
  themeColor,
  manuscript,
  includeMeditation = true,
  pageWidth = 1024,
  pageHeight = 768,
  onBack,
}: QtDiaryPackViewerProps) {
  const monthName = ENGLISH_MONTHS[month - 1] || 'August'
  const daysInMonth = new Date(year, month, 0).getDate()
  const weekCount = Math.ceil(daysInMonth / 7)
  const meditations = useMemo(() => parseManuscript(manuscript), [manuscript])

  const pad = (n: number) => String(n).padStart(2, '0')

  const getWeekData = (wIndex: number) => {
    const startDay = (wIndex - 1) * 7 + 1
    const endDay = Math.min(daysInMonth, wIndex * 7)
    const dateRangeText = `${pad(month)}/${pad(startDay)} - ${pad(month)}/${pad(endDay)}`
    const daysInWeek = Array.from({ length: 7 }, (_, i) => {
      const dayNum = (wIndex - 1) * 7 + i + 1
      const isValid = dayNum <= daysInMonth
      const d = isValid ? new Date(year, month - 1, dayNum) : null
      return {
        dayNum: isValid ? dayNum : 0,
        dayName: d ? DAY_NAMES[d.getDay()] : DAY_NAMES[i],
        dateStr: isValid ? `${pad(month)}/${pad(dayNum)}` : '-',
      }
    })
    return { weekNum: wIndex, weekLabel: `WEEK ${wIndex}`, dateRangeText, daysInWeek }
  }

  // 연간 부록 (1회): /diary 렌더 순서와 동일 — 표지 / 벽달력 / 연간 그리드 / 100가지 소원 / 성경 66권 로드맵
  const renderAnnexPages = (renderPageCard: (key: string, node: React.ReactNode) => React.ReactNode) => {
    const pages: React.ReactNode[] = []
    const chunk = month <= 6
      ? [1, 2, 3, 4, 5, 6]
      : [7, 8, 9, 10, 11, 12]

    if (CHURCH_PRESET_PAGES.cover) {
      pages.push(renderPageCard('cover', (
        <QtDiaryCoverPage
          startYear={year}
          startMonth={month}
          endYear={year}
          endMonth={month}
          durationMonths={1}
          variant="church"
          themeColor={themeColor}
          pageWidth={pageWidth}
          pageHeight={pageHeight}
        />
      )))
    }

    if (CHURCH_PRESET_PAGES.wallcalendar) {
      pages.push(renderPageCard('wallcalendar', (
        <QtYearlyWallCalendarPage
          months={chunk.map(m => ({ year, month: m }))}
          chunkIndex={month <= 6 ? 1 : 2}
          chunkCount={2}
          themeColor={themeColor}
          pageWidth={pageWidth}
          pageHeight={pageHeight}
        />
      )))
    }

    if (CHURCH_PRESET_PAGES.yearlygrid) {
      pages.push(renderPageCard('yearlygrid', (
        <QtYearlyOverviewGridPage
          startYear={year}
          startMonth={1}
          endYear={year}
          endMonth={12}
          themeColor={themeColor}
          pageWidth={pageWidth}
          pageHeight={pageHeight}
          isGeneralMode={false}
        />
      )))
    }

    if (CHURCH_PRESET_PAGES.hundredgoal) {
      pages.push(renderPageCard('hundredgoal', (
        <QtHundredGoalPage year={year} monthName={monthName} themeColor={themeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
      )))
    }
    if (CHURCH_PRESET_PAGES.hundredgoal2) {
      pages.push(renderPageCard('hundredgoal2', (
        <QtHundredGoalPage2 year={year} monthName={monthName} themeColor={themeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
      )))
    }
    if (CHURCH_PRESET_PAGES.biblemap) {
      pages.push(renderPageCard('biblemap', (
        <QtBibleReadingMapPage year={year} monthName={monthName} themeColor={themeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
      )))
    }
    if (CHURCH_PRESET_PAGES.biblemap2) {
      pages.push(renderPageCard('biblemap2', (
        <QtBibleReadingMapPage2 year={year} monthName={monthName} themeColor={themeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
      )))
    }
    return pages
  }

  // 월간 파트: 구분 / 캘린더 / 개요 / (주간+데일리 인터리브) / 크리스천 영성 15종
  const renderMonthlyPages = (renderPageCard: (key: string, node: React.ReactNode) => React.ReactNode) => {
    const pages: React.ReactNode[] = []

    if (CHURCH_PRESET_PAGES.monthlydivider) {
      pages.push(renderPageCard('divider', (
        <QtMonthlyDividerPage
          year={year}
          month={month}
          seqIndex={1}
          totalMonths={1}
          variant="church"
          themeColor={themeColor}
          pageWidth={pageWidth}
          pageHeight={pageHeight}
        />
      )))
    }

    if (CHURCH_PRESET_PAGES.calendar) {
      pages.push(renderPageCard('calendar', (
        <QtMonthlyCalendarPage
          year={year}
          month={month}
          monthName={monthName}
          themeColor={themeColor}
          pageWidth={pageWidth}
          pageHeight={pageHeight}
          isGeneralMode={false}
        />
      )))
    }

    if (CHURCH_PRESET_PAGES.overview) {
      pages.push(renderPageCard('overview', (
        <QtMonthlyOverviewPage
          year={year}
          monthName={monthName}
          themeColor={themeColor}
          pageWidth={pageWidth}
          pageHeight={pageHeight}
          isGeneralMode={false}
        />
      )))
    }

    if (CHURCH_PRESET_PAGES.weekly && CHURCH_PRESET_PAGES.daily) {
      for (let wNum = 1; wNum <= weekCount; wNum++) {
        const w = getWeekData(wNum)
        if (CHURCH_PRESET_PAGES.weekly) {
          pages.push(renderPageCard(`weekly-${wNum}`, (
            <QtWeeklyPlanPage
              year={year}
              weekNum={w.weekNum}
              weekLabel={w.weekLabel}
              monthName={monthName}
              dateRangeText={w.dateRangeText}
              daysInWeek={w.daysInWeek}
              themeColor={themeColor}
              pageWidth={pageWidth}
              pageHeight={pageHeight}
              isGeneralMode={false}
            />
          )))
        }
        const startDay = (wNum - 1) * 7 + 1
        const endDay = Math.min(daysInMonth, wNum * 7)
        if (CHURCH_PRESET_PAGES.daily) {
          for (let d = startDay; d <= endDay; d++) {
            const dateObj = new Date(year, month - 1, d)
            const med = includeMeditation ? meditations[d - 1] : undefined
            pages.push(renderPageCard(`day-${wNum}-${d}`, (
              <QtDailyDiaryPage
                dateLabel={`${pad(d)} DAY`}
                dayNum={d}
                dayName={DAY_NAMES[dateObj.getDay()]}
                monthName={monthName}
                yearLabel={String(year)}
                themeColor={themeColor}
                activeWeek={`W${wNum}`}
                isChurchMode={true}
                meditation={med}
                pageWidth={pageWidth}
                pageHeight={pageHeight}
              />
            )))
          }
        }
      }
    }

    // 크리스천 영성 전용 내지 (교회 모드 프리셋 기준)
    if (CHURCH_PRESET_PAGES.soapjournal) {
      pages.push(renderPageCard('soapjournal', (
        <QtSoapJournalPage year={year} monthName={monthName} themeColor={themeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
      )))
    }
    if (CHURCH_PRESET_PAGES.soapjournal2) {
      pages.push(renderPageCard('soapjournal2', (
        <QtSoapJournalPage2 year={year} monthName={monthName} themeColor={themeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
      )))
    }
    if (CHURCH_PRESET_PAGES.intercessory) {
      pages.push(renderPageCard('intercessory', (
        <QtIntercessoryPrayerPage year={year} monthName={monthName} themeColor={themeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
      )))
    }
    if (CHURCH_PRESET_PAGES.intercessory2) {
      pages.push(renderPageCard('intercessory2', (
        <QtIntercessoryPrayerPage2 year={year} monthName={monthName} themeColor={themeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
      )))
    }
    if (CHURCH_PRESET_PAGES.fruitstracker) {
      pages.push(renderPageCard('fruitstracker', (
        <QtFruitsTrackerPage year={year} monthName={monthName} themeColor={themeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
      )))
    }
    if (CHURCH_PRESET_PAGES.prayer) {
      pages.push(renderPageCard('prayer', (
        <QtPrayerAnswerPage year={year} monthName={monthName} themeColor={themeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
      )))
    }
    if (CHURCH_PRESET_PAGES.prayer2) {
      pages.push(renderPageCard('prayer2', (
        <QtPrayerAnswerPage2 year={year} monthName={monthName} themeColor={themeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
      )))
    }
    if (CHURCH_PRESET_PAGES.scripture) {
      pages.push(renderPageCard('scripture', (
        <QtScriptureArtPage year={year} monthName={monthName} themeColor={themeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
      )))
    }
    if (CHURCH_PRESET_PAGES.scripture2) {
      pages.push(renderPageCard('scripture2', (
        <QtScriptureArtPage2 year={year} monthName={monthName} themeColor={themeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
      )))
    }
    if (CHURCH_PRESET_PAGES.sermon) {
      for (let sNo = 1; sNo <= 4; sNo++) {
        pages.push(renderPageCard(`sermon-${sNo}`, (
          <QtSundaySermonPage
            year={year}
            month={month}
            sundayNo={sNo}
            sundayLabel={`${month}월 ${sNo}주차 주일예배`}
            monthName={monthName}
            themeColor={themeColor}
            pageWidth={pageWidth}
            pageHeight={pageHeight}
          />
        )))
      }
    }
    if (CHURCH_PRESET_PAGES.sermondeep) {
      pages.push(renderPageCard('sermondeep', (
        <QtSundaySermonDeepPage
          year={year}
          month={month}
          sundayNo={1}
          dateStr={`${pad(month)}/02`}
          monthName={monthName}
          themeColor={themeColor}
          pageWidth={pageWidth}
          pageHeight={pageHeight}
        />
      )))
    }
    if (CHURCH_PRESET_PAGES.letter) {
      pages.push(renderPageCard('letter', (
        <QtMonthlyLetterPage year={year} monthName={monthName} themeColor={themeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
      )))
    }
    if (CHURCH_PRESET_PAGES.letter2) {
      pages.push(renderPageCard('letter2', (
        <QtMonthlyLetterPage2 year={year} monthName={monthName} themeColor={themeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
      )))
    }

    return pages
  }

  const renderPageCard = (key: string, node: React.ReactNode) => (
    <div
      key={key}
      className="rounded-xl bg-slate-800 border border-white/10 p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]"
    >
      {node}
    </div>
  )

  return (
    <div className="w-full min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <div className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/85 backdrop-blur-2xl px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-all duration-200 flex items-center gap-1.5 text-xs font-semibold"
          >
            ← 마법사로 돌아가기
          </button>
          <h1 className="text-sm font-extrabold truncate">
            {year}년 {month}월 {bibleBook} 월간 큐티 다이어리
          </h1>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold">
          <span className="px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            🗓️ {daysInMonth}일 · {weekCount}주차
          </span>
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
            {includeMeditation ? '큐티 + 묵상 팩' : '다이어리 팩'}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-10 py-8 px-4">
        {renderAnnexPages(renderPageCard)}
        {renderMonthlyPages(renderPageCard)}
      </div>
    </div>
  )
}
