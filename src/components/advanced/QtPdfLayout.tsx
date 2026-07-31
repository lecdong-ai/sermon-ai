'use client'

import { forwardRef, useMemo } from 'react'
import { PAGE_SIZES } from '@/lib/qtPdfSizes'
import { getTemplate } from '@/lib/qtTemplates'
import { parseDays } from '@/lib/qtDayParser'
import { getFormattedDateListWeekdays, getWeekdayDateLabels, getWeekdayCountInMonth } from '@/lib/qtDates'
import type { QTFormData, QTResult } from './QtGenerator'

interface QtSelectedInfo {
  book: string
  passage: string
  reason: string
  coreMessage: string
  isRecommended: boolean
}

export interface LayoutSettings {
  lineSpacing: string
  fontSize: string
  fontFamily: string
  margin: string
  hiddenSections: string[]
}

interface QtPdfLayoutProps {
  form: QTFormData
  result: QTResult
  sizeOption: string
  templateId?: string
  startPassage?: string
  endPassage?: string
  userMemos?: Record<number, string>
  isBilingualSideBySide?: boolean
  selectedInfo?: QtSelectedInfo | null
  daySectionTitles?: Record<number, string[]>
  monthCalendarStrip?: {
    month: string
    daysInMonth: number
    activeDays: number[]
    dayHasContent: boolean[]
  }
  layoutSettings?: LayoutSettings
  editedContent?: Record<number, Record<string, string>>
}

// 캘린더 스트립을 표시할 sizeOption 화이트리스트
const STRIP_SIZE_OPTIONS = new Set(['A4Landscape', 'A4Portrait', 'iPad Pro 12.9', 'iPad Pro 12.9 Landscape', 'Tablet (iPad 4:3)'])

const FONT_FAMILIES: Record<string, string> = {
  gothic: "'Noto Sans KR', 'Malgun Gothic', sans-serif",
  myeongjo: "'Noto Serif KR', 'Nanum Myeongjo', serif",
  english: "'Inter', 'Noto Sans KR', sans-serif",
}

function parseBibleVerses(passageText: string) {
  const lines = passageText.split('\n')
  let korVerse = ''
  let engVerse = ''
  let passageRange = ''
  let readingGuide = ''
  let currentSection: 'kor' | 'eng' | null = null
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) { currentSection = null; continue }
    const headerMatch = line.match(/^[-·•*]*\s*(개역개정|한글\s*핵심|핵심절|KJV|영어|NIV|본문\s*범위|본문\s*읽기\s*안내)/i)
    if (headerMatch) {
      const h = headerMatch[1].toLowerCase()
      if ((h === '개역개정' || h.includes('핵심') || h.includes('한글')) && !line.match(/KJV|NIV/i)) {
        const rest = line.replace(/^[-·•*]*\s*개역개정\s*(전체\s*본문|핵심절)?\s*(또는\s*본문\s*범위\s*안내)?\s*[:：]?\s*/i, '').trim()
        if (rest) korVerse = rest
        else currentSection = 'kor'
      } else if (h === 'kjv' || h === 'niv' || h === '영어' || line.match(/^[-·•*]*\s*(KJV|NIV)/i)) {
        const rest = line.replace(/^[-·•*]*\s*(KJV|NIV)\s*(전체\s*본문|핵심절)?\s*(또는\s*본문\s*범위\s*안내)?\s*[:：]?\s*/i, '').trim()
        if (rest) engVerse = rest
        else currentSection = 'eng'
      } else if (h.includes('본문') && h.includes('범위')) {
        passageRange = line.replace(/^[-·•*]*\s*본문\s*범위\s*[:：]?\s*/i, '').trim()
        currentSection = null
      } else if (h.includes('읽기') || h.includes('안내')) {
        readingGuide = line.replace(/^[-·•*]*\s*본문\s*읽기\s*안내\s*[:：]?\s*/i, '').trim()
        currentSection = null
      } else {
        currentSection = null
      }
    } else if (currentSection === 'kor') {
      korVerse += (korVerse ? '\n' : '') + line
    } else if (currentSection === 'eng') {
      engVerse += (engVerse ? '\n' : '') + line
    }
  }
  return { korVerse, engVerse, passageRange, readingGuide }
}

function QtPdfLayout({ form, result, sizeOption, templateId = 'publication-2a', startPassage, endPassage, userMemos = {}, isBilingualSideBySide = false, selectedInfo, daySectionTitles, monthCalendarStrip, layoutSettings, editedContent }: QtPdfLayoutProps, ref: React.Ref<HTMLDivElement>) {
  const ls = layoutSettings || {}
  const fontScale = ls.fontSize === 'small' ? 0.9 : ls.fontSize === 'large' ? 1.15 : 1.0
  const marginScale = ls.margin === 'narrow' ? 0.7 : ls.margin === 'wide' ? 1.15 : 1.0
  const activeLineHeight = ls.lineSpacing || '1.3'
  const activeFontFamily = FONT_FAMILIES[ls.fontFamily || 'gothic'] || FONT_FAMILIES.gothic
  const hiddenSet = new Set(ls.hiddenSections || [])

  const size = PAGE_SIZES[sizeOption] || PAGE_SIZES['A4Landscape']
  // 스케일: 짧은 변(210mm) 기준 1.0
  const scale = Math.min(size.widthMm, size.heightMm) / 210.0
  const mmToPx = (mm: number) => Math.round(mm / 25.4 * 96 * scale)
  const cssW = `${mmToPx(size.widthMm)}px`
  const cssH = `${mmToPx(size.heightMm)}px`
  const tmpl = useMemo(() => getTemplate(templateId), [templateId])
  const t = tmpl
  const isLandscape = size.widthMm > size.heightMm
  const fullManuscript = result.fullManuscript || ''

  const parsedDays = useMemo(() => {
    try {
      const { days } = parseDays(fullManuscript)
      const hiddenFields = ['reflection', 'application', 'passageOverview', 'slowReading', 'observation', 'originalWords', 'englishWords', 'understanding', 'gospel', 'englishVerse', 'community', 'prayer', 'oneLine', 'leaderGuide']
      return days.map((day, i) => {
        let d = day
        if (editedContent?.[i]) {
          d = { ...d, ...editedContent[i] }
        }
        hiddenFields.forEach(f => {
          if (hiddenSet.has(f)) {
            (d as any)[f] = ''
          }
        })
        return d
      })
    } catch {
      return []
    }
  }, [fullManuscript, editedContent, hiddenSet])

  const weekdays = useMemo(() => {
    const dayCount = Math.max(parsedDays.length, 1)
    if (monthCalendarStrip) {
      const m = monthCalendarStrip.month.match(/(\d+)년\s*(\d+)월/)
      if (m) {
        const year = parseInt(m[1], 10), month = parseInt(m[2], 10)
        const dayNames = ['일', '월', '화', '수', '목', '금', '토']
        return monthCalendarStrip.activeDays.map(d => {
          const date = new Date(year, month - 1, d)
          const label = `${month}/${d} (${dayNames[date.getDay()]})`
          return { date, label }
        })
      }
    }
    if (!form.startDate) {
      const today = new Date()
      const dayNames = ['일', '월', '화', '수', '목', '금', '토']
      const mon = new Date(today); mon.setDate(mon.getDate() - mon.getDay() + 1)
      return Array.from({ length: Math.max(dayCount, 6) }, (_, i) => {
        const d = new Date(mon); d.setDate(mon.getDate() + i)
        return { date: d, label: `${d.getMonth() + 1}/${d.getDate()}(${dayNames[d.getDay()]})` }
      })
    }
    if (dayCount === getWeekdayCountInMonth(form.startDate)) {
      const labels = getWeekdayDateLabels(form.startDate)
      return labels.map(label => ({ date: new Date(), label }))
    }
    const list = getFormattedDateListWeekdays(form.startDate, dayCount)
    if (list.length > 0) return list.map(label => ({ date: new Date(), label }))
    return []
  }, [form.startDate, parsedDays.length, monthCalendarStrip])

  // 월간 vs 주간 구분 및 성경책 자동 감지 헬퍼
  const isMonthly = !!monthCalendarStrip || parsedDays.length > 7

  const monthName = useMemo(() => {
    if (monthCalendarStrip?.month) {
      const m = monthCalendarStrip.month.match(/(\d+)월/)
      if (m) return `${m[1]}월`
    }
    if (form.startDate) {
      const parts = form.startDate.split('-')
      if (parts.length >= 2) return `${parseInt(parts[1], 10)}월`
    }
    return `${new Date().getMonth() + 1}월`
  }, [monthCalendarStrip, form.startDate])

  const detectedBook = useMemo(() => {
    for (const day of parsedDays) {
      if (day.passage) {
        const match = day.passage.match(/^([가-힣1-3]+(?:\s*[가-힣]+)?)\s*\d+/)
        if (match) return match[1].trim()
      }
    }
    return form.bibleBook || '성경'
  }, [parsedDays, form.bibleBook])

  const coverMainTitle = useMemo(() => {
    if (selectedInfo?.isRecommended) return '오늘의 큐티'
    if (isMonthly) return `${monthName} Bunker 목양 월간 Q.T`
    return 'Bunker 목양 주간 Q.T'
  }, [selectedInfo, isMonthly, monthName])

  const displayStartPassage = useMemo(() => {
    if (startPassage) return startPassage
    if (parsedDays[0]?.passage) {
      const verses = parseBibleVerses(parsedDays[0].passage)
      return verses.passageRange || parsedDays[0].passage
    }
    return ''
  }, [startPassage, parsedDays])

  const displayEndPassage = useMemo(() => {
    if (endPassage) return endPassage
    const lastDay = parsedDays[parsedDays.length - 1]
    if (lastDay?.passage) {
      const verses = parseBibleVerses(lastDay.passage)
      return verses.passageRange || lastDay.passage
    }
    return ''
  }, [endPassage, parsedDays])

  // 캘린더 스트립 표시 여부: 화이트리스트 사이즈 + 일일 페이지에서만
  const showStrip = !!monthCalendarStrip && STRIP_SIZE_OPTIONS.has(sizeOption)
  const STRIP_HEIGHT_MM = 16 // 본문 padding 확보 + 라벨 + 카드

  // 페이지 스타일 — padding은 inner wrapper에서 처리
  const pageStyle: React.CSSProperties = {
    width: cssW,
    height: cssH,
    boxSizing: 'border-box',
    background: t.pageBg,
    color: t.textColor,
    fontFamily: activeFontFamily,
    position: 'relative',
    pageBreakAfter: 'always',
  }

  const pageMarginMm = 5 * marginScale
  const pageContentStyle: React.CSSProperties = {
    paddingTop: showStrip ? `${mmToPx(STRIP_HEIGHT_MM + 2)}px` : `${mmToPx(pageMarginMm)}px`,
    paddingBottom: `${mmToPx(pageMarginMm)}px`,
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
  }

  // 캘린더 스트립 렌더 함수 (A4 가로 / iPad / Tablet에서만 호출)
  // activeDay: 현재 페이지의 day (1~31) — 동적 매칭
  const renderCalendarStrip = (activeDay: number) => {
    if (!showStrip || !monthCalendarStrip) return null
    const { month, daysInMonth, dayHasContent } = monthCalendarStrip

    // 카드 폭 계산: 페이지 가로(mm) - 좌우 padding(20mm) - 라벨 영역(20mm) - 카드 사이 gap
    const pageW = size.widthMm
    const labelWidth = 22 // "◆ 2026년 3월" 영역
    const sidePadding = 10
    const cardGap = 0.5
    const availableW = pageW - labelWidth - sidePadding * 2
    const cardW = (availableW - cardGap * (daysInMonth - 1)) / daysInMonth
    const cardH = 5

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

    return (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: `${mmToPx(STRIP_HEIGHT_MM)}px`,
        padding: `0 ${sidePadding}mm`,
        display: 'flex',
        alignItems: 'center',
        gap: `${6 * scale}px`,
        borderBottom: `0.5px solid #00000020`,
        background: '#ffffff',
        zIndex: 5,
      }}>
        <span style={{
          fontFamily: t.fontHeading,
          fontSize: `${8 * scale}px`,
          fontWeight: 700,
          color: '#000000',
          letterSpacing: `${1 * scale}px`,
          whiteSpace: 'nowrap',
        }}>
          ◆ {month}
        </span>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: `${cardGap}mm`,
          flex: 1,
        }}>
          {days.map(d => {
            const isActive = d === activeDay
            const hasContent = dayHasContent[d - 1] ?? false
            // 3단계 색상: active(검정) / existing(흰+검정테두리) / empty(회색)
            const isEmpty = !hasContent && !isActive
            return (
              <div
                key={d}
                data-day={d}
                style={{
                  width: `${cardW}mm`,
                  height: `${cardH}mm`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: `${9 * scale}px`,
                  fontWeight: isActive ? 800 : 500,
                  color: isActive ? '#ffffff' : (isEmpty ? '#00000040' : '#000000'),
                  background: isActive ? '#000000' : 'transparent',
                  border: `0.5px solid ${isActive ? '#000000' : (isEmpty ? '#00000010' : '#00000030')}`,
                  borderRadius: `${1 * scale}px`,
                  opacity: isEmpty ? 0.5 : 1,
                }}
              >
                {d}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ============= 공통 컴포넌트 =============
  const sectionLabel = (text: string) => (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: `${4 * scale * marginScale}px`,
      marginTop: `${3 * scale * marginScale}px`, marginBottom: `${1.5 * scale * marginScale}px`,
      borderBottom: `0.5px solid ${t.sectionLabelBorder}`,
      paddingBottom: `${1.5 * scale * marginScale}px`,
    }}>
      <span style={{
        fontFamily: activeFontFamily,
        fontSize: `${9 * scale * fontScale}px`,
        fontWeight: 800,
        color: t.sectionLabelBorder,
        letterSpacing: `${2.5 * scale}px`,
        textTransform: 'uppercase',
      }}>
        {text}
      </span>
    </div>
  )

  const bodyText = (text: string, fs: number) => (
    <div style={{
      fontSize: `${fs * scale * fontScale}px`,
      lineHeight: activeLineHeight,
      color: t.textColor,
      textAlign: 'justify',
      letterSpacing: '0.01em',
      fontFamily: activeFontFamily,
    }}>
      {text.split('\n').map((l, i) => (
        <div key={i} style={{ marginBottom: `${1.5 * scale * marginScale}px` }}>{l}</div>
      ))}
    </div>
  )

  const pageNumber = (_num: number, _total: number) => null

  const parsedTitleSize = parseFloat(t.coverTitleSize || '28')

  // 글자수 기반 overflow 감지 (landscape / portrait 공유)
  const maxChars: Record<string, number> = {
    passageOverview: 250, slowReading: 350,
    observation: 700, understanding: 500, gospel: 1000,
    application: 300, reflection: 250, community: 150,
    originalWords: 800, englishWords: 800,
    englishVerse: 600, leaderGuide: 200, prayer: 350,
  }
  const trunc = (text: string, _key: string): string => {
    if (!text) return ''
    return text
  }

  // ============= A안: 가로 2페이지 (1일 2페이지, 2-A 디자인) =============
  const renderDailyLandscape = (day: any, dayIdx: number) => {
    const verses = parseBibleVerses(day.passage || '')
    const firstSentence = (() => {
      if (day.passageOverview) {
        const line = day.passageOverview.split('\n').filter(l => l.trim())[0]?.trim() || ''
        return line.length > 120 ? line.slice(0, 120).replace(/\s+\S*$/, '') + '…' : line
      }
      if (selectedInfo?.coreMessage) return selectedInfo.coreMessage
      const first = (verses.korVerse || '').split(/[.!?。!?]/)[0]?.trim() || ''
      return first.length > 100 ? first.slice(0, 100).replace(/\s+\S*$/, '') + '…' : first
    })()
    // Page 1 = cover (1) + dayIdx*3 + 1, Page 2 = +2, Page 3 = +3 (optional)
    pageCounter = 2 + dayIdx * 3

    // Overflow detection — 글자수 기반
    const reflect = (key: string): string => trunc((day as any)[key] || '', key)
    const hasOverflow = (['observation', 'understanding', 'application', 'reflection', 'prayer']).some(k => {
      const t = (day as any)[k] || ''
      return t.length > (maxChars[k] || 500) * 0.85
    })

    // ============= 페이지 헤더 (네이비 풀폭 바) =============
    const landscapeHeader = (subtitle: string) => (
      <div style={{
        marginBottom: `${2.5 * scale}px`,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: t.accent,
          color: '#ffffff',
          padding: `${1.5 * scale * marginScale}px ${9 * scale}px`,
          marginBottom: `${1.5 * scale * marginScale}px`,
        }}>
          <div style={{
            fontFamily: t.fontHeading,
            fontSize: `${10 * scale}px`,
            fontWeight: 700,
            letterSpacing: `${2.5 * scale}px`,
          }}>
            DAY {dayIdx + 1} · {weekdays[dayIdx]?.label || ''}
          </div>
          <div style={{
            fontFamily: t.fontHeading,
            fontSize: `${9 * scale}px`,
            fontWeight: 600,
            letterSpacing: `${1.5 * scale}px`,
            opacity: 0.9,
          }}>
            {subtitle}
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: `${8 * scale}px`,
          borderBottom: `${0.75 * scale}px solid ${t.accent}`,
          paddingBottom: `${1.5 * scale}px`,
        }}>
          <div style={{
            fontFamily: t.fontHeading,
            fontSize: `${16 * scale}px`,
            fontWeight: 800,
            color: t.textColor,
            lineHeight: '1.2',
            letterSpacing: `${0.5 * scale}px`,
            flex: '0 0 auto',
          }}>
            {day.title || `Day ${dayIdx + 1}`}
          </div>
          {verses.passageRange && (
            <div style={{
              fontFamily: t.fontHeading,
              fontSize: `${11 * scale}px`,
              fontWeight: 500,
              color: t.textMuted,
              letterSpacing: `${0.5 * scale}px`,
              marginLeft: 'auto',
            }}>
              오늘의 본문 · {verses.passageRange}
            </div>
          )}
        </div>
        {/* 성경 소제목 (다중 결합 가능) */}
        {daySectionTitles && daySectionTitles[dayIdx] && daySectionTitles[dayIdx].length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: `${3 * scale}px`,
            marginBottom: `${3 * scale}px`,
            padding: `${3 * scale}px ${6 * scale}px`,
            background: `${t.accent}1A`,
            border: `0.5px solid ${t.accent}40`,
            borderRadius: `${2 * scale}px`,
          }}>
            <span style={{
              fontFamily: t.fontHeading,
              fontSize: `${10 * scale}px`,
              fontWeight: 700,
              color: t.accent,
              letterSpacing: `${1.5 * scale}px`,
              textTransform: 'uppercase',
            }}>
              성경 소제목
            </span>
            {daySectionTitles[dayIdx].map((st, i) => (
              <span
                key={i}
                style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${10.5 * scale}px`,
                  fontWeight: 600,
                  color: t.textColor,
                  padding: `${1 * scale}px ${4 * scale}px`,
                  background: `${t.accent}26`,
                  borderRadius: `${1.5 * scale}px`,
                }}
              >
                {i > 0 && <span style={{ color: t.accent, marginRight: `${2 * scale}px` }}>+</span>}
                {st}
              </span>
            ))}
          </div>
        )}
      </div>
    )

    // 주차 및 날짜 범위 계산 (월간 큐티 호환)
    const baseWeekNum = form.weekNumber ? parseInt(String(form.weekNumber), 10) : 1
    const weekOffset = Math.floor(dayIdx / 6)
    const currentWeekNum = isNaN(baseWeekNum) ? weekOffset + 1 : baseWeekNum + weekOffset
    const weekStartIndex = weekOffset * 6

    // 해당 주차의 6일 데이터 및 날짜 라벨 구하기
    let currentWeekDaysData = parsedDays.slice(weekStartIndex, weekStartIndex + 6)
    if (currentWeekDaysData.length < 6) {
      const needed = 6 - currentWeekDaysData.length
      const extra = Array.from({ length: needed }, (_, idx) => {
        const actualIdx = weekStartIndex + currentWeekDaysData.length + idx
        return parsedDays[actualIdx] || { title: `Day ${actualIdx + 1}`, passage: '' }
      })
      currentWeekDaysData = [...currentWeekDaysData, ...extra]
    }

    const currentWeekDatesData = weekdays.slice(weekStartIndex, weekStartIndex + 6)
    const weekStartLabel = currentWeekDatesData[0]?.label || ''
    const weekEndLabel = currentWeekDatesData[currentWeekDatesData.length - 1]?.label || ''
    const dayInWeekIdx = dayIdx % 6

    return (
      <div key={dayIdx}>
        {/* ══════ Page 1 (앞면): 말씀 중심 ══════ */}
        <div className="qt-page" style={pageStyle}>
          <div style={pageContentStyle}>
            {renderCalendarStrip(monthCalendarStrip?.activeDays[dayIdx] ?? 0)}
            {landscapeHeader(`QT · ${form.bibleBook} · ${currentWeekNum}주`)}

            {/* ═══ 주간 펼침 (6일 그리드) — compact ═══ */}
            <div style={{
              marginBottom: `${3 * scale * marginScale}px`,
              padding: `${2 * scale}px ${4 * scale}px`,
              background: t.accentLight,
              borderLeft: `${1.5 * scale}px solid ${t.sectionLabelBorder}`,
              borderTop: `0.5px solid ${t.borderLight}`,
              borderRight: `0.5px solid ${t.borderLight}`,
              borderBottom: `0.5px solid ${t.borderLight}`,
            }}>
              <div style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                marginBottom: `${1 * scale}px`,
                paddingBottom: `${1 * scale}px`,
                borderBottom: `0.5px solid ${t.sectionLabelBorder}`,
              }}>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${14 * scale}px`,
                  fontWeight: 800,
                  color: t.accent,
                  letterSpacing: `${2 * scale}px`,
                  textTransform: 'uppercase',
                }}>
                  ◆ 주간 펼침 · {form.bibleBook} · 제{currentWeekNum}주
                </div>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${11 * scale}px`,
                  fontWeight: 500,
                  color: t.textMuted,
                  letterSpacing: `${0.5 * scale}px`,
                  marginTop: `${1 * scale}px`,
                }}>
                  {weekStartLabel} ~ {weekEndLabel} · {currentWeekDaysData.length}일
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: `${0.5 * scale}px`,
              }}>
                {currentWeekDaysData.map((d, i) => {
                  const actualDayNum = weekStartIndex + i + 1
                  const dv = parseBibleVerses(d?.passage || '')
                  const isCurrent = i === dayInWeekIdx
                  const passageShort = (dv.passageRange || d?.passage || '').split(' ').pop() || ''
                  const dayLabel = currentWeekDatesData[i]?.label || `Day ${actualDayNum}`
                  const displayTitle = (d?.title && d.title !== `Day ${i + 1}`) ? d.title : `Day ${actualDayNum}`

                  return (
                    <div key={i} style={{
                      display: 'flex', flexDirection: 'column',
                      padding: `${1.5 * scale}px ${1.5 * scale}px`,
                      background: isCurrent ? `${t.accent}1A` : 'transparent',
                      color: t.textColor,
                      borderTop: `0.5px solid ${t.borderLight}`,
                      minHeight: `${70 * scale}px`,
                    }}>
                      <div style={{
                        flex: 1,
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        gap: `${1 * scale}px`,
                      }}>
                        <div style={{
                          fontFamily: t.fontHeading,
                          fontSize: `${12 * scale}px`,
                          fontWeight: 800,
                          color: isCurrent ? t.accent : t.accent,
                          letterSpacing: `${0.5 * scale}px`,
                          textTransform: 'uppercase',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: `${1 * scale}px`,
                        }}>
                          <span>{dayLabel}</span>
                          {isCurrent && <span style={{ fontSize: `${12 * scale}px`, color: t.accent }}>★</span>}
                        </div>
                        {passageShort && (
                          <div style={{
                            fontFamily: t.fontHeading,
                            fontSize: `${12 * scale}px`,
                            fontWeight: 700,
                            color: t.textColor,
                            textAlign: 'center',
                          }}>
                            {passageShort}
                          </div>
                        )}
                        <div style={{
                          fontFamily: t.fontHeading,
                          fontSize: `${12 * scale}px`,
                          fontWeight: 700,
                          color: t.textColor,
                          lineHeight: '1.2',
                          textAlign: 'center',
                        }}>
                          {displayTitle}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 본문 한눈에 — 2줄 풀폭 */}
            {day.passageOverview && (
              <div style={{
                padding: `${2 * scale}px ${4 * scale}px`,
                marginBottom: `${4 * scale}px`,
                background: t.accentLight,
                borderLeft: `${1.5 * scale}px solid ${t.sectionLabelBorder}`,
                borderTop: `0.5px solid ${t.borderLight}`,
                borderRight: `0.5px solid ${t.borderLight}`,
                borderBottom: `0.5px solid ${t.borderLight}`,
              }}>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${11 * scale}px`,
                  fontWeight: 800,
                  color: t.accent,
                  letterSpacing: `${2.5 * scale}px`,
                  textTransform: 'uppercase',
                  marginBottom: `${1.5 * scale}px`,
                }}>
                  본문 한눈에 보기
                </div>
                <div style={{
                  fontSize: `${13 * scale}px`,
                  lineHeight: activeLineHeight,
                  color: t.textColor,
                  textAlign: 'justify',
                  letterSpacing: '0.01em',
                  fontWeight: 500,
                }}>
                  {day.passageOverview.split('\n').filter(l => l.trim()).slice(0, 6).map(l =>
                    l.replace(/^[-*·•\s]*\s*(보기|단락\s*요약|문맥\s*위치|오늘의\s*핵심\s*메시지|핵심\s*메시지|요약)\s*[:：]\s*/i, '').trim()
                  ).join('\n')}
                </div>
              </div>
            )}

            {/* 한/영 성경 — 5:5 정확 분할, 절 동기화, 동일 폰트 */}
            {(() => {
              const korLines = verses.korVerse.split('\n').filter(l => l.trim())
              const nivLines = verses.engVerse.split('\n').filter(l => l.trim())
              const maxLen = Math.max(korLines.length, nivLines.length)
              return (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: `${14 * scale}px`,
                  marginBottom: `${4 * scale}px`,
                }}>
                  {/* 좌: 한글 · 개역개정 */}
                  <div>
                    <div style={{
                      fontFamily: t.fontHeading,
                      fontSize: `${10 * scale}px`,
                      fontWeight: 800,
                      color: t.accent,
                      letterSpacing: `${1.5 * scale}px`,
                      textTransform: 'uppercase',
                      marginBottom: `${1.5 * scale}px`,
                      paddingBottom: `${1 * scale}px`,
                      borderBottom: `0.5px solid ${t.border}`,
                      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                    }}>
                      <span>한글 · 개역개정</span>
                      {verses.passageRange && (
                        <span style={{
                          fontFamily: t.fontHeading,
                          fontSize: `${9 * scale}px`,
                          fontWeight: 700,
                          color: t.textColor,
                          letterSpacing: `${0.3 * scale}px`,
                          textTransform: 'none',
                        }}>
                          {verses.passageRange}
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontFamily: t.font,
                      fontSize: `${13 * scale}px`,
                      lineHeight: activeLineHeight,
                      color: t.textColor,
                      textAlign: 'justify',
                      wordBreak: 'keep-all',
                    }}>
                      {Array.from({ length: maxLen }).map((_, i) => (
                        <div key={i} style={{ marginBottom: `${1 * scale}px`, minHeight: `${15 * scale}px` }}>
                          {korLines[i] || ''}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* 우: English · KJV */}
                  <div>
                    <div style={{
                      fontFamily: t.fontHeading,
                      fontSize: `${10 * scale}px`,
                      fontWeight: 800,
                      color: t.accent,
                      letterSpacing: `${1.5 * scale}px`,
                      textTransform: 'uppercase',
                      marginBottom: `${1.5 * scale}px`,
                      paddingBottom: `${1 * scale}px`,
                      borderBottom: `0.5px solid ${t.border}`,
                      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                    }}>
                      <span>English · KJV</span>
                      {verses.passageRange && (
                        <span style={{
                          fontFamily: t.fontHeading,
                          fontSize: `${9 * scale}px`,
                          fontWeight: 700,
                          color: t.textColor,
                          letterSpacing: `${0.3 * scale}px`,
                          textTransform: 'none',
                        }}>
                          {verses.passageRange}
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontFamily: t.font,
                      fontSize: `${12 * scale}px`,
                      lineHeight: activeLineHeight,
                      color: t.textColor,
                      textAlign: 'justify',
                    }}>
                      {Array.from({ length: maxLen }).map((_, i) => (
                        <div key={i} style={{ marginBottom: `${1 * scale}px`, minHeight: `${15 * scale}px` }}>
                          {nivLines[i] || ''}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* 영어로 붇는 말씀 — NEW (compact quote box) */}
            {day.englishVerse && (
              <div style={{
                marginBottom: `${1.5 * scale * marginScale}px`,
                padding: `${4 * scale}px ${7 * scale}px`,
                background: t.bibleQuoteBg,
                borderLeft: `${1.5 * scale}px solid ${t.bibleQuoteBorder}`,
                borderTop: `0.5px solid ${t.borderLight}`,
                borderRight: `0.5px solid ${t.borderLight}`,
                borderBottom: `0.5px solid ${t.borderLight}`,
              }}>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${10 * scale}px`,
                  fontWeight: 700,
                  color: t.accent,
                  letterSpacing: `${1.5 * scale}px`,
                  textTransform: 'uppercase',
                  marginBottom: `${1.5 * scale}px`,
                }}>
                  영어로 붙드는 말씀
                </div>
                <div style={{
                  fontFamily: "'Georgia', 'Noto Serif', 'Times New Roman', serif",
                  fontSize: `${12 * scale}px`,
                  lineHeight: activeLineHeight,
                  color: t.bibleQuoteText,
                  fontStyle: 'italic',
                }}>
                  {reflect('englishVerse').split('\n').filter(l => l.trim()).join('\n')}
                </div>
              </div>
            )}

            {/* 천천히 읽기 — NEW */}
            {day.slowReading && (
              <div style={{
                paddingTop: `${2 * scale}px`,
                borderTop: `0.5px solid ${t.border}`,
                marginTop: `${2 * scale}px`,
              }}>
                {sectionLabel('천천히 읽기')}
                {bodyText(
                  reflect('slowReading').split('\n').filter(l => l.trim()).slice(0, 4).join('\n'),
                  12
                )}
              </div>
            )}

            {pageNumber(pageCounter, totalPages)}
          </div>
        </div>

        {/* ══════ Page 2 (뒷면): 관찰/묵상/적용 — 2열 레이아웃 ══════ */}
        <div className="qt-page" style={pageStyle}>
          <div style={pageContentStyle}>
            {renderCalendarStrip(monthCalendarStrip?.activeDays[dayIdx] ?? 0)}
            {landscapeHeader(`QT · ${form.bibleBook} · ${form.weekNumber}주 · 묵상`)}

            {/* 2열: 관찰 | 이해 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: `${10 * scale}px`,
              marginBottom: `${8 * scale}px`,
            }}>
              {day.observation && (
                <div style={{ maxHeight: `${130 * scale}px`, overflow: 'hidden' }}>
                  {sectionLabel('본문 관찰하기')}
                  {bodyText(reflect('observation'), 12)}
                </div>
              )}
              {day.understanding && (
                <div style={{ maxHeight: `${120 * scale}px`, overflow: 'hidden' }}>
                  {sectionLabel('말씀 이해하기')}
                  {bodyText(reflect('understanding'), 12)}
                </div>
              )}
            </div>

            {/* 복음으로 보기 (full, compact) */}
            {day.gospel && (
              <div style={{
                marginBottom: `${5 * scale * marginScale}px`,
                padding: `${3 * scale}px ${6 * scale}px`,
                background: `${t.accent}0D`,
                borderTop: `0.5px solid ${t.borderLight}`,
                borderBottom: `0.5px solid ${t.borderLight}`,
              }}>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${10 * scale}px`,
                  fontWeight: 700,
                  color: t.accent,
                  letterSpacing: `${2 * scale}px`,
                  textTransform: 'uppercase',
                  marginBottom: `${1.5 * scale}px`,
                }}>
                  ✦ 복음으로 보기
                </div>
                {bodyText(reflect('gospel'), 12)}
              </div>
            )}

            {/* 2열: 적용+나를 비추어 보기 | 단어 묵상 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: `${15 * scale}px`,
              marginBottom: `${6 * scale}px`,
            }}>
              <div>
                {day.application && (
                  <div style={{ marginBottom: `${4 * scale}px` }}>
                    {sectionLabel('오늘의 적용')}
                    {bodyText(reflect('application'), 12)}
                  </div>
                )}
                {day.reflection && (
                  <div>
                    {sectionLabel('나를 비추어 보기')}
                    {bodyText(reflect('reflection'), 12)}
                  </div>
                )}
              </div>
              {(day.originalWords || day.englishWords) && (
                <div>
                  {sectionLabel('단어 묵상')}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${15 * scale}px` }}>
                    {day.originalWords && (
                      <div>
                        <div style={{
                          fontFamily: t.fontHeading,
                          fontSize: `${10 * scale}px`,
                          fontWeight: 700,
                          color: t.textMuted,
                          letterSpacing: `${1.5 * scale}px`,
                          textTransform: 'uppercase',
                          marginBottom: `${1.5 * scale}px`,
                        }}>
                          원어
                        </div>
                        {bodyText(reflect('originalWords').split('\n').filter(l => l.trim()).slice(0, 3).join('\n'), 12)}
                      </div>
                    )}
                    {day.englishWords && (
                      <div>
                        <div style={{
                          fontFamily: t.fontHeading,
                          fontSize: `${10 * scale}px`,
                          fontWeight: 700,
                          color: t.textMuted,
                          letterSpacing: `${1.5 * scale}px`,
                          textTransform: 'uppercase',
                          marginBottom: `${1.5 * scale}px`,
                        }}>
                          영어
                        </div>
                        {bodyText(reflect('englishWords').split('\n').filter(l => l.trim()).slice(0, 3).join('\n'), 12)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 공동체 연결 — NEW (compact) */}
            {day.community && (
              <div style={{
                marginBottom: `${5 * scale}px`,
                display: 'flex', alignItems: 'baseline', gap: `${5 * scale}px`,
                padding: `${2 * scale}px ${5 * scale}px`,
                background: t.accentLight,
                borderLeft: `${1.5 * scale}px solid ${t.sectionLabelBorder}`,
              }}>
                <span style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${10 * scale}px`,
                  fontWeight: 700,
                  color: t.accent,
                  letterSpacing: `${1.8 * scale}px`,
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}>
                  공동체 연결
                </span>
                <span style={{
                  fontFamily: t.font,
                  fontSize: `${12 * scale}px`,
                  lineHeight: activeLineHeight,
                  color: t.textColor,
                }}>
                  {reflect('community').split('\n').filter(l => l.trim()).slice(0, 2).join(' · ')}
                </span>
              </div>
            )}

            {/* 오늘의 기도 — 전체폭 */}
            {day.prayer && (
              <div style={{ marginBottom: `${5 * scale}px` }}>
                {sectionLabel('오늘의 기도')}
                <div style={{
                  padding: `${5 * scale}px ${7 * scale}px`,
                  background: t.prayerBoxBg,
                  borderLeft: `${1.5 * scale}px solid ${t.accent}`,
                  fontFamily: t.font,
                  fontSize: `${12 * scale}px`,
                  lineHeight: activeLineHeight,
                  color: t.prayerBoxText,
                  fontStyle: 'italic',
                }}>
                  {reflect('prayer').split('\n').filter(l => l.trim()).join('\n')}
                </div>
              </div>
            )}

            {/* 한 줄 기록 */}
            <div style={{ marginBottom: `${4 * scale}px` }}>
              <div style={{
                fontFamily: t.fontHeading,
                fontSize: `${10 * scale}px`,
                fontWeight: 700,
                color: t.textMuted,
                letterSpacing: `${1.5 * scale}px`,
                textTransform: 'uppercase',
                marginBottom: `${1.5 * scale * marginScale}px`,
              }}>
                오늘 내 마음에 남은 한 문장
              </div>
              {userMemos[dayIdx] ? (
                <div style={{
                  fontFamily: t.font,
                  fontSize: `${12 * scale}px`,
                  lineHeight: activeLineHeight,
                  color: t.textColor,
                  fontStyle: 'italic',
                  minHeight: `${12 * scale}px`,
                  paddingBottom: `${2 * scale}px`,
                  borderBottom: `0.5px solid ${t.border}`,
                  wordBreak: 'break-all',
                }}>
                  {userMemos[dayIdx]}
                </div>
              ) : (
                <div style={{
                  height: `${12 * scale}px`,
                  borderBottom: `0.5px solid ${t.border}`,
                }} />
              )}
            </div>

            {/* 인도자 해설 — 미주 */}
            {day.leaderGuide && (
              <div style={{
                position: 'absolute',
                bottom: `${mmToPx(10)}px`,
                left: 0,
                right: 0,
                padding: `${2 * scale}px ${8 * scale}px`,
                borderTop: `0.5px solid ${t.border}`,
              }}>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${11 * scale}px`,
                  fontWeight: 700,
                  color: t.textMuted,
                  letterSpacing: `${1.5 * scale}px`,
                  textTransform: 'uppercase',
                  marginBottom: `${1.5 * scale * marginScale}px`,
                }}>
                  인도자 해설
                </div>
                <div style={{
                  fontFamily: t.font,
                  fontSize: `${11 * scale}px`,
                  lineHeight: activeLineHeight,
                  color: t.textMuted,
                }}>
                  {reflect('leaderGuide').split('\n').filter(l => l.trim()).join('\n')}
                </div>
              </div>
            )}

            {pageNumber(pageCounter + 1, totalPages)}
            {hasOverflow && (
              <div style={{
                position: 'absolute',
                bottom: `${mmToPx(3)}px`,
                right: `${mmToPx(30)}px`,
                fontSize: `${7 * scale}px`,
                color: t.pageNumberColor,
                fontStyle: 'italic',
                opacity: 0.5,
              }}>
                (이어짐)
              </div>
            )}
          </div>
        </div>

        {/* ══════ Page 3 (조건부): 이어짐 ══════ */}
        {hasOverflow && (
          <div className="qt-page" style={pageStyle}>
            <div style={pageContentStyle}>
              {renderCalendarStrip(monthCalendarStrip?.activeDays[dayIdx] ?? 0)}
              <div style={{
                fontFamily: t.fontHeading,
                fontSize: `${9 * scale}px`,
                fontWeight: 600,
                color: t.textMuted,
                letterSpacing: `${2 * scale}px`,
                textTransform: 'uppercase',
                marginBottom: `${3 * scale}px`,
                paddingBottom: `${2 * scale}px`,
                borderBottom: `0.5px solid ${t.borderLight}`,
              }}>
                DAY {dayIdx + 1} · 이어짐
              </div>

              {/* 본문 관찰하기 (전체) */}
              {day.observation && (day as any).observation!.length > (maxChars.observation || 700) * 0.85 && (
                <div>
                  {sectionLabel('본문 관찰하기 (이어서)')}
                  {bodyText((day as any).observation!, 11)}
                </div>
              )}

              {/* 말씀 이해하기 (전체) */}
              {day.understanding && (day as any).understanding!.length > (maxChars.understanding || 500) * 0.85 && (
                <div>
                  {sectionLabel('말씀 이해하기 (이어서)')}
                  {bodyText((day as any).understanding!, 11)}
                </div>
              )}

              {/* 나를 비추어 보기 (전체) */}
              {day.reflection && (day as any).reflection!.length > (maxChars.reflection || 250) * 0.85 && (
                <div>
                  {sectionLabel('나를 비추어 보기 (이어서)')}
                  {bodyText((day as any).reflection!, 11)}
                </div>
              )}

              {/* 오늘의 적용 (전체) */}
              {day.application && (day as any).application!.length > (maxChars.application || 300) * 0.85 && (
                <div>
                  {sectionLabel('오늘의 적용 (이어서)')}
                  {bodyText((day as any).application!, 11)}
                </div>
              )}

              {/* 오늘의 기도 (전체) */}
              {day.prayer && (day as any).prayer!.length > (maxChars.prayer || 350) * 0.85 && (
                <div>
                  {sectionLabel('오늘의 기도 (이어서)')}
                  <div style={{
                    padding: `${4 * scale}px ${7 * scale}px`,
                    background: t.prayerBoxBg,
                    borderLeft: `${1.5 * scale}px solid ${t.accent}`,
                    fontFamily: t.font,
                    fontSize: `${11 * scale}px`,
                    lineHeight: activeLineHeight,
                    color: t.prayerBoxText,
                    fontStyle: 'italic',
                  }}>
                    {(day as any).prayer!.split('\n').filter(l => l.trim()).join('\n')}
                  </div>
                </div>
              )}

              {pageNumber(pageCounter + 2, totalPages)}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ============= A안: 세로 2면 (1일 2페이지, 2-A 디자인 유지) =============
  const renderDailyPortrait = (day: any, dayIdx: number) => {
    const verses = parseBibleVerses(day.passage || '')
    pageCounter = 1 + dayIdx * 3 + 1

    // 주차 및 날짜 범위 계산 (월간 큐티 호환)
    const baseWeekNum = form.weekNumber ? parseInt(String(form.weekNumber), 10) : 1
    const weekOffset = Math.floor(dayIdx / 6)
    const currentWeekNum = isNaN(baseWeekNum) ? weekOffset + 1 : baseWeekNum + weekOffset
    const weekStartIndex = weekOffset * 6

    // 해당 주차의 6일 데이터 및 날짜 라벨 구하기
    let currentWeekDaysData = parsedDays.slice(weekStartIndex, weekStartIndex + 6)
    if (currentWeekDaysData.length < 6) {
      const needed = 6 - currentWeekDaysData.length
      const extra = Array.from({ length: needed }, (_, idx) => {
        const actualIdx = weekStartIndex + currentWeekDaysData.length + idx
        return parsedDays[actualIdx] || { title: `Day ${actualIdx + 1}`, passage: '' }
      })
      currentWeekDaysData = [...currentWeekDaysData, ...extra]
    }

    const currentWeekDatesData = weekdays.slice(weekStartIndex, weekStartIndex + 6)
    const weekStartLabel = currentWeekDatesData[0]?.label || ''
    const weekEndLabel = currentWeekDatesData[currentWeekDatesData.length - 1]?.label || ''
    const dayInWeekIdx = dayIdx % 6

    // Overflow detection (shared with landscape)
    const reflectP = (key: string): string => trunc((day as any)[key] || '', key)
    const hasOverflowP = (['observation', 'understanding', 'application', 'reflection', 'prayer']).some(k => {
      const t = (day as any)[k] || ''
      return t.length > (maxChars[k] || 500) * 0.85
    })

    return (
      <div key={dayIdx}>
        {/* Page 1: 말씀 중심 */}
        <div className="qt-page" style={pageStyle}>
          <div style={pageContentStyle}>
            {renderCalendarStrip(monthCalendarStrip?.activeDays[dayIdx] ?? 0)}
            <div style={{
              marginBottom: `${5 * scale}px`,
              paddingBottom: `${3 * scale}px`,
              borderBottom: `${0.75 * scale}px solid ${t.accent}`,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: t.accent,
                color: '#ffffff',
                padding: `${2 * scale * marginScale}px ${7 * scale}px`,
                marginBottom: `${4 * scale}px`,
              }}>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${10 * scale}px`,
                  fontWeight: 700,
                  letterSpacing: `${2.5 * scale}px`,
                }}>
                  DAY {dayIdx + 1} · {weekdays[dayIdx]?.label || ''}
                </div>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${9 * scale}px`,
                  fontWeight: 600,
                  letterSpacing: `${1.5 * scale}px`,
                  opacity: 0.85,
                }}>
                  QT · {form.bibleBook} · {currentWeekNum}주
                </div>
              </div>
              <div style={{
                fontFamily: t.fontHeading,
                fontSize: `${17 * scale}px`,
                fontWeight: 800,
                color: t.textColor,
                lineHeight: '1.25',
                letterSpacing: `${0.5 * scale}px`,
                marginBottom: `${1.5 * scale * marginScale}px`,
              }}>
                {day.title || `Day ${dayIdx + 1}`}
              </div>
              {verses.passageRange && (
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${10.5 * scale}px`,
                  fontWeight: 500,
                  color: t.textMuted,
                  letterSpacing: `${0.5 * scale}px`,
                }}>
                  오늘의 본문 · {verses.passageRange}
                </div>
              )}
            </div>

            {/* 주간 펼침 (portrait compact) */}
            <div style={{
              marginBottom: `${5 * scale}px`,
              padding: `${2 * scale}px ${3 * scale}px`,
              background: t.accentLight,
              borderLeft: `${1.5 * scale}px solid ${t.sectionLabelBorder}`,
              borderTop: `0.5px solid ${t.borderLight}`,
              borderRight: `0.5px solid ${t.borderLight}`,
              borderBottom: `0.5px solid ${t.borderLight}`,
            }}>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                marginBottom: `${1 * scale}px`,
                paddingBottom: `${1 * scale}px`,
                borderBottom: `0.5px solid ${t.sectionLabelBorder}`,
              }}>
                <span style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${14 * scale}px`,
                  fontWeight: 800,
                  color: t.accent,
                  letterSpacing: `${1.5 * scale}px`,
                  textTransform: 'uppercase',
                }}>
                  ◆ 주간 펼침 · {form.bibleBook} · 제{currentWeekNum}주
                </span>
                <span style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${9 * scale}px`,
                  fontWeight: 500,
                  color: t.textMuted,
                  marginTop: `${1 * scale}px`,
                }}>
                  {weekStartLabel} ~ {weekEndLabel} · {currentWeekDaysData.length}일
                </span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: `${0.5 * scale}px`,
              }}>
                {currentWeekDaysData.map((d, i) => {
                  const actualDayNum = weekStartIndex + i + 1
                  const dv = parseBibleVerses(d?.passage || '')
                  const isCurrent = i === dayInWeekIdx
                  const passageShort = (dv.passageRange || d?.passage || '').split(' ').pop() || ''
                  const dayLabel = (currentWeekDatesData[i]?.label?.split('(')[0] || `Day ${actualDayNum}`)
                  const displayTitle = (d?.title && d.title !== `Day ${i + 1}`) ? d.title : `Day ${actualDayNum}`

                  return (
                    <div key={i} style={{
                      display: 'flex', flexDirection: 'column',
                      padding: `${1.5 * scale}px ${1 * scale}px`,
                      background: isCurrent ? `${t.accent}1A` : 'transparent',
                      color: t.textColor,
                      borderTop: `0.5px solid ${t.borderLight}`,
                      minHeight: `${85 * scale}px`,
                      gap: `${1 * scale}px`,
                    }}>
                      <div style={{
                        fontFamily: t.fontHeading,
                        fontSize: `${11 * scale}px`,
                        fontWeight: 800,
                        color: isCurrent ? t.accent : t.accent,
                        letterSpacing: `${0.3 * scale}px`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}>
                        <span>{dayLabel}</span>
                        {isCurrent && <span style={{ fontSize: `${10 * scale}px`, color: t.accent }}>★</span>}
                      </div>
                      {passageShort && (
                        <div style={{
                          fontFamily: t.fontHeading,
                          fontSize: `${10 * scale}px`,
                          fontWeight: 700,
                          color: t.textColor,
                        }}>
                          {passageShort}
                        </div>
                      )}
                      <div style={{
                        fontFamily: t.fontHeading,
                        fontSize: `${10 * scale}px`,
                        fontWeight: 600,
                        color: t.textMuted,
                        lineHeight: '1.1',
                      }}>
                        {displayTitle}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 본문 한눈에 보기 */}
            {day.passageOverview && (
              <div style={{
                marginBottom: `${5 * scale * marginScale}px`,
                padding: `${5 * scale}px ${8 * scale}px`,
                background: t.accentLight,
                borderLeft: `${2 * scale}px solid ${t.accent}`,
                borderTop: `0.5px solid ${t.borderLight}`,
                borderRight: `0.5px solid ${t.borderLight}`,
                borderBottom: `0.5px solid ${t.borderLight}`,
              }}>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${11 * scale}px`,
                  fontWeight: 800,
                  color: t.accent,
                  letterSpacing: `${2.5 * scale}px`,
                  textTransform: 'uppercase',
                  marginBottom: `${1.5 * scale * marginScale}px`,
                }}>
                  본문 한눈에 보기
                </div>
                <div style={{
                  fontSize: `${13 * scale}px`,
                  lineHeight: activeLineHeight,
                  color: t.textColor,
                  textAlign: 'justify',
                  letterSpacing: '0.01em',
                  fontWeight: 500,
                }}>
                  {day.passageOverview.split('\n').filter(l => l.trim()).slice(0, 2).map(l =>
                    l.replace(/^[-*·•\s]*\s*(보기|단락\s*요약|문맥\s*위치|오늘의\s*핵심\s*메시지|핵심\s*메시지|요약)\s*[:：]\s*/i, '').trim()
                  ).join('\n')}
                </div>
              </div>
            )}

            {/* 한/영 병렬 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: `${14 * scale}px`,
              marginBottom: `${6 * scale}px`,
            }}>
              <div>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${10.5 * scale}px`,
                  fontWeight: 800,
                  color: t.accent,
                  letterSpacing: `${2.2 * scale}px`,
                  textTransform: 'uppercase',
                  marginBottom: `${1.5 * scale * marginScale}px`,
                  paddingBottom: `${1.5 * scale}px`,
                  borderBottom: `0.5px solid ${t.border}`,
                }}>
                  한글 · 개역개정
                </div>
                <div style={{
                  fontFamily: t.font,
                  fontSize: `${13 * scale}px`,
                  lineHeight: activeLineHeight,
                  color: t.textColor,
                  textAlign: 'justify',
                  wordBreak: 'keep-all',
                }}>
                  {verses.korVerse.split('\n').map((l, i) => (
                    <div key={i} style={{ marginBottom: `${2 * scale}px` }}>{l}</div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${10.5 * scale}px`,
                  fontWeight: 800,
                  color: t.accent,
                  letterSpacing: `${2.2 * scale}px`,
                  textTransform: 'uppercase',
                  marginBottom: `${1.5 * scale * marginScale}px`,
                  paddingBottom: `${1.5 * scale}px`,
                  borderBottom: `0.5px solid ${t.border}`,
                }}>
                  English · KJV
                </div>
                <div style={{
                  fontFamily: "'Georgia', 'Noto Serif', 'Times New Roman', serif",
                  fontSize: `${12 * scale}px`,
                  lineHeight: activeLineHeight,
                  color: t.textColor,
                  textAlign: 'justify',
                  fontStyle: 'italic',
                }}>
                  {verses.engVerse.split('\n').map((l, i) => (
                    <div key={i} style={{ marginBottom: `${2 * scale}px` }}>{l}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* 영어로 붇는 말씀 — NEW (compact quote box) */}
            {day.englishVerse && (
              <div style={{
                marginBottom: `${5 * scale * marginScale}px`,
                padding: `${5 * scale}px ${8 * scale}px`,
                background: t.bibleQuoteBg,
                borderLeft: `${2 * scale}px solid ${t.bibleQuoteBorder}`,
                borderTop: `0.5px solid ${t.borderLight}`,
                borderRight: `0.5px solid ${t.borderLight}`,
                borderBottom: `0.5px solid ${t.borderLight}`,
              }}>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${10 * scale}px`,
                  fontWeight: 700,
                  color: t.accent,
                  letterSpacing: `${1.5 * scale}px`,
                  textTransform: 'uppercase',
                  marginBottom: `${1.5 * scale * marginScale}px`,
                }}>
                  영어로 붙드는 말씀
                </div>
                <div style={{
                  fontFamily: "'Georgia', 'Noto Serif', 'Times New Roman', serif",
                  fontSize: `${12 * scale}px`,
                  lineHeight: activeLineHeight,
                  color: t.bibleQuoteText,
                  fontStyle: 'italic',
                }}>
                  {reflectP('englishVerse').split('\n').filter(l => l.trim()).join('\n')}
                </div>
              </div>
            )}

            {/* 천천히 읽기 — NEW */}
            {day.slowReading && (
              <div>
                {sectionLabel('천천히 읽기')}
                {bodyText(
                  reflectP('slowReading').split('\n').filter(l => l.trim()).slice(0, 4).join('\n'),
                  12
                )}
              </div>
            )}

            {pageNumber(pageCounter, totalPages)}
          </div>
        </div>

        {/* Page 2: 관찰/묵상/적용 — full width, 가독성 우선 */}
        <div className="qt-page" style={pageStyle}>
          <div style={pageContentStyle}>
            {renderCalendarStrip(monthCalendarStrip?.activeDays[dayIdx] ?? 0)}
            <div style={{
              marginBottom: `${4 * scale}px`,
              paddingBottom: `${2 * scale}px`,
              borderBottom: `${0.75 * scale}px solid ${t.accent}`,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: t.accent,
                color: '#ffffff',
                padding: `${2 * scale * marginScale}px ${7 * scale}px`,
                marginBottom: `${3 * scale}px`,
              }}>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${10 * scale}px`,
                  fontWeight: 700,
                  letterSpacing: `${2.5 * scale}px`,
                }}>
                  DAY {dayIdx + 1} · 묵상
                </div>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${9 * scale}px`,
                  fontWeight: 600,
                  letterSpacing: `${1.5 * scale}px`,
                  opacity: 0.85,
                }}>
                  QT · {form.bibleBook} · {form.weekNumber}주
                </div>
              </div>
              <div style={{
                fontFamily: t.fontHeading,
                fontSize: `${14 * scale}px`,
                fontWeight: 800,
                color: t.textColor,
                lineHeight: '1.25',
              }}>
                {day.title || `Day ${dayIdx + 1}`} · {verses.passageRange}
              </div>
            </div>

            {/* 관찰하기 (full) */}
            {day.observation && (
              <div style={{ marginBottom: `${5 * scale}px` }}>
                {sectionLabel('본문 관찰하기')}
                {bodyText(reflectP('observation'), 13)}
              </div>
            )}

            {/* 말씀 이해하기 */}
            {day.understanding && (
              <div style={{ marginBottom: `${5 * scale}px` }}>
                {sectionLabel('말씀 이해하기')}
                {bodyText(reflectP('understanding'), 12.5)}
              </div>
            )}

            {/* 복음으로 보기 (full) */}
            {day.gospel && (
              <div style={{
                marginBottom: `${5 * scale}px`,
                padding: `${4 * scale}px ${7 * scale}px`,
                background: `${t.accent}0D`,
                borderTop: `0.5px solid ${t.borderLight}`,
                borderBottom: `0.5px solid ${t.borderLight}`,
              }}>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${10 * scale}px`,
                  fontWeight: 700,
                  color: t.accent,
                  letterSpacing: `${2 * scale}px`,
                  textTransform: 'uppercase',
                  marginBottom: `${1.5 * scale * marginScale}px`,
                }}>
                  ✦ 복음으로 보기
                </div>
                {bodyText(reflectP('gospel'), 12)}
              </div>
            )}

            {/* 나를 비추어 보기 */}
            {day.reflection && (
              <div style={{ marginBottom: `${5 * scale}px` }}>
                {sectionLabel('나를 비추어 보기')}
                {bodyText(reflectP('reflection'), 12)}
              </div>
            )}

            {/* 적용 (full) */}
            {day.application && (
              <div style={{ marginBottom: `${5 * scale}px` }}>
                {sectionLabel('오늘의 적용')}
                {bodyText(reflectP('application'), 13)}
              </div>
            )}

            {/* 공동체 연결 (compact line) */}
            {day.community && (
              <div style={{
                marginBottom: `${5 * scale}px`,
                display: 'flex', alignItems: 'baseline', gap: `${4 * scale}px`,
                padding: `${2 * scale}px ${5 * scale}px`,
                background: t.accentLight,
                borderLeft: `${1.5 * scale}px solid ${t.sectionLabelBorder}`,
              }}>
                <span style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${10 * scale}px`,
                  fontWeight: 700,
                  color: t.accent,
                  letterSpacing: `${1.5 * scale}px`,
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}>
                  공동체 연결
                </span>
                <span style={{
                  fontFamily: t.font,
                  fontSize: `${12 * scale}px`,
                  lineHeight: activeLineHeight,
                  color: t.textColor,
                }}>
                  {reflectP('community').split('\n').filter(l => l.trim()).slice(0, 2).join(' · ')}
                </span>
              </div>
            )}

            {/* 단어 묵상 */}
            {(day.originalWords || day.englishWords) && (
              <div style={{ marginBottom: `${5 * scale}px` }}>
                {sectionLabel('단어 묵상')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${15 * scale}px` }}>
                  {day.originalWords && (
                    <div>
                      <div style={{
                        fontFamily: t.fontHeading,
                        fontSize: `${10 * scale}px`,
                        fontWeight: 700,
                        color: t.textMuted,
                        letterSpacing: `${1.5 * scale}px`,
                        textTransform: 'uppercase',
                        marginBottom: `${1.5 * scale}px`,
                      }}>
                        원어
                      </div>
                      {bodyText(reflectP('originalWords').split('\n').filter(l => l.trim()).slice(0, 4).join('\n'), 12)}
                    </div>
                  )}
                  {day.englishWords && (
                    <div>
                      <div style={{
                        fontFamily: t.fontHeading,
                        fontSize: `${10 * scale}px`,
                        fontWeight: 700,
                        color: t.textMuted,
                        letterSpacing: `${1.5 * scale}px`,
                        textTransform: 'uppercase',
                        marginBottom: `${1.5 * scale}px`,
                      }}>
                        영어
                      </div>
                      {bodyText(reflectP('englishWords').split('\n').filter(l => l.trim()).slice(0, 4).join('\n'), 12)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 오늘의 기도 */}
            {day.prayer && (
              <div style={{ marginBottom: `${5 * scale}px` }}>
                {sectionLabel('오늘의 기도')}
                <div style={{
                  padding: `${5 * scale}px ${6 * scale}px`,
                  background: t.prayerBoxBg,
                  borderLeft: `${1.5 * scale}px solid ${t.accent}`,
                  fontFamily: t.font,
                  fontSize: `${12 * scale}px`,
                  lineHeight: activeLineHeight,
                  color: t.prayerBoxText,
                  fontStyle: 'italic',
                }}>
                  {reflectP('prayer').split('\n').filter(l => l.trim()).join('\n')}
                </div>
              </div>
            )}

            {/* 오늘 내 마음에 남은 한 문장 */}
            <div style={{ marginBottom: `${5 * scale}px` }}>
              <div style={{
                fontFamily: t.fontHeading,
                fontSize: `${10 * scale}px`,
                fontWeight: 700,
                color: t.textMuted,
                letterSpacing: `${1.5 * scale}px`,
                textTransform: 'uppercase',
                marginBottom: `${1.5 * scale * marginScale}px`,
              }}>
                오늘 내 마음에 남은 한 문장
              </div>
              {userMemos[dayIdx] ? (
                <div style={{
                  fontFamily: t.font,
                  fontSize: `${12 * scale}px`,
                  lineHeight: activeLineHeight,
                  color: t.textColor,
                  fontStyle: 'italic',
                  minHeight: `${14 * scale}px`,
                  paddingBottom: `${2 * scale}px`,
                  borderBottom: `0.5px solid ${t.border}`,
                  wordBreak: 'break-all',
                }}>
                  {userMemos[dayIdx]}
                </div>
              ) : (
                <div style={{
                  height: `${14 * scale}px`,
                  borderBottom: `0.5px solid ${t.border}`,
                }} />
              )}
            </div>

            {/* 인도자 해설 */}
            {day.leaderGuide && (
              <div style={{
                position: 'absolute',
                bottom: `${mmToPx(6)}px`,
                left: 0,
                right: 0,
              }}>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${11 * scale}px`,
                  fontWeight: 700,
                  color: t.textMuted,
                  letterSpacing: `${1.5 * scale}px`,
                  textTransform: 'uppercase',
                  marginBottom: `${1.5 * scale * marginScale}px`,
                }}>
                  인도자 해설
                </div>
                <div style={{
                  fontFamily: t.font,
                  fontSize: `${12 * scale}px`,
                  lineHeight: activeLineHeight,
                  color: t.textMuted,
                }}>
                  {reflectP('leaderGuide').split('\n').filter(l => l.trim()).join('\n')}
                </div>
              </div>
            )}

            {pageNumber(pageCounter + 1, totalPages)}
            {hasOverflowP && (
              <div style={{
                position: 'absolute',
                bottom: `${mmToPx(3)}px`,
                right: `${mmToPx(30)}px`,
                fontSize: `${7 * scale}px`,
                color: t.pageNumberColor,
                fontStyle: 'italic',
                opacity: 0.5,
              }}>
                (이어짐)
              </div>
            )}
          </div>
        </div>

        {/* ══════ Portrait Page 3 (조건부): 이어짐 ══════ */}
        {hasOverflowP && (
          <div className="qt-page" style={pageStyle}>
            <div style={pageContentStyle}>
              {renderCalendarStrip(monthCalendarStrip?.activeDays[dayIdx] ?? 0)}
              <div style={{
                fontFamily: t.fontHeading,
                fontSize: `${8 * scale}px`,
                fontWeight: 600,
                color: t.textMuted,
                letterSpacing: `${1.8 * scale}px`,
                textTransform: 'uppercase',
                marginBottom: `${1.5 * scale * marginScale}px`,
                paddingBottom: `${1.5 * scale}px`,
                borderBottom: `0.5px solid ${t.borderLight}`,
              }}>
                DAY {dayIdx + 1} · 이어짐
              </div>

              {day.observation && (day as any).observation!.length > (maxChars.observation || 700) * 0.85 && (
                <div>
                  {sectionLabel('본문 관찰하기 (이어서)')}
                  {bodyText((day as any).observation!, 11)}
                </div>
              )}
              {day.understanding && (day as any).understanding!.length > (maxChars.understanding || 500) * 0.85 && (
                <div>
                  {sectionLabel('말씀 이해하기 (이어서)')}
                  {bodyText((day as any).understanding!, 11)}
                </div>
              )}
              {day.reflection && (day as any).reflection!.length > (maxChars.reflection || 250) * 0.85 && (
                <div>
                  {sectionLabel('나를 비추어 보기 (이어서)')}
                  {bodyText((day as any).reflection!, 11)}
                </div>
              )}
              {day.application && (day as any).application!.length > (maxChars.application || 300) * 0.85 && (
                <div>
                  {sectionLabel('오늘의 적용 (이어서)')}
                  {bodyText((day as any).application!, 11)}
                </div>
              )}
              {day.prayer && (day as any).prayer!.length > (maxChars.prayer || 350) * 0.85 && (
                <div>
                  {sectionLabel('오늘의 기도 (이어서)')}
                  <div style={{
                    padding: `${3 * scale}px ${6 * scale}px`,
                    background: t.prayerBoxBg,
                    borderLeft: `${1.5 * scale}px solid ${t.accent}`,
                    fontFamily: t.font,
                    fontSize: `${10 * scale}px`,
                    lineHeight: activeLineHeight,
                    color: t.prayerBoxText,
                    fontStyle: 'italic',
                  }}>
                    {(day as any).prayer!.split('\n').filter(l => l.trim()).join('\n')}
                  </div>
                </div>
              )}

              {pageNumber(pageCounter + 2, totalPages)}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ============= 표지 (0mm 풀배경 + 원래의 단정한 처음 크기 오버레이 패널 + 가운데 정렬) =============
  const renderCover = () => (
    <div className="qt-page" style={{
      ...pageStyle,
      backgroundImage: "url('/bg.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      padding: 0,
      margin: 0,
      overflow: 'hidden',
    }}>
      <div style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        position: 'relative',
        padding: 0,
        margin: 0,
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: `${22 * scale}px ${32 * scale}px`,
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(8px)',
          borderRadius: `${14 * scale}px`,
          border: '1px solid rgba(255, 255, 255, 0.7)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.12)',
          maxWidth: isLandscape ? '65%' : '85%',
          width: 'auto',
        }}>
          {t.coverOrnament && (
            <div style={{
              color: t.accent,
              fontSize: `${14 * scale}px`,
              letterSpacing: `${8 * scale}px`,
              marginBottom: `${14 * scale}px`,
              opacity: 0.8,
            }}>
              {t.coverOrnament}
            </div>
          )}
          {selectedInfo?.isRecommended && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: `${4 * scale}px`,
              padding: `${3 * scale}px ${9 * scale}px`, marginBottom: `${12 * scale}px`,
              background: t.accentLight,
              border: `0.5px solid ${t.sectionLabelBorder}`,
              fontFamily: t.fontHeading, fontSize: `${8 * scale}px`, fontWeight: 700,
              color: t.accent, letterSpacing: `${2 * scale}px`, textTransform: 'uppercase',
            }}>
              <span style={{ fontSize: `${9 * scale}px` }}>✦</span>
              AI 추천 본문
            </div>
          )}
          <div style={{
            fontFamily: t.fontHeading,
            fontSize: `${(parsedTitleSize > 24 ? 22 : parsedTitleSize) * scale}px`,
            fontWeight: 800,
            color: t.textColor,
            letterSpacing: `${3 * scale}px`,
            marginBottom: `${6 * scale}px`,
            lineHeight: '1.25',
          }}>
            {coverMainTitle}
          </div>
          <div style={{
            fontFamily: t.fontHeading,
            fontSize: `${10 * scale}px`,
            color: t.coverSubtitleColor,
            letterSpacing: `${2.5 * scale}px`,
            marginBottom: `${16 * scale}px`,
          }}>
            {form.seriesName || '말씀과 함께하는 큐티'}
          </div>
          <div style={{
            width: `${56 * scale}px`,
            height: `${1 * scale}px`,
            background: t.coverAccentLine,
            margin: `${10 * scale}px auto`,
          }} />
          <div style={{
            fontSize: `${12 * scale}px`,
            color: t.textMuted,
            lineHeight: '1.9',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <div style={{
              fontFamily: t.fontHeading,
              fontSize: `${24 * scale}px`,
              fontWeight: 800,
              color: t.accent,
              marginBottom: `${6 * scale}px`,
              letterSpacing: `${1 * scale}px`,
            }}>
              {detectedBook}
            </div>
            <div style={{
              fontSize: `${12 * scale}px`,
              color: t.textColor,
              fontWeight: 600,
            }}>
              {isMonthly ? '월간 통합 큐티' : `제${form.weekNumber}주`}
            </div>
            {(displayStartPassage || displayEndPassage) && (
              <div style={{
                fontSize: `${10 * scale}px`,
                color: t.textMuted,
                marginTop: `${4 * scale}px`,
                fontFamily: t.font,
                letterSpacing: `${0.5 * scale}px`,
              }}>
                {displayStartPassage}{displayEndPassage && displayEndPassage !== displayStartPassage ? ` ~ ${displayEndPassage}` : ''}
              </div>
            )}
            <div style={{
              fontSize: `${9 * scale}px`,
              color: t.textMuted,
              marginTop: `${5 * scale}px`,
            }}>
              {weekdays[0]?.label} ~ {weekdays[weekdays.length - 1]?.label} {isMonthly ? `· 총 ${parsedDays.length}일` : ''}
            </div>
          </div>
        </div>
        <div style={{
          position: 'absolute',
          bottom: `${mmToPx(14)}px`,
          fontSize: `${8.5 * scale}px`,
          color: '#ffffff',
          textShadow: '0 1px 4px rgba(0,0,0,0.7)',
          letterSpacing: `${2 * scale}px`,
          fontWeight: 600,
        }}>
          bunker.ai.kr · 목회의 모든 순간을 잇다
        </div>
      </div>
    </div>
  )

  const totalPages = 1 + parsedDays.length * 3  // 1표지 + 1일=3페이지(overflow 대비)
  let pageCounter = 0

  return (
    <div>
      <div ref={ref}>
        {renderCover()}
        {isLandscape
          ? parsedDays.map((day, dayIdx) => renderDailyLandscape(day, dayIdx))
          : parsedDays.map((day, dayIdx) => renderDailyPortrait(day, dayIdx))
        }
      </div>
    </div>
  )
}

export default forwardRef(QtPdfLayout)
