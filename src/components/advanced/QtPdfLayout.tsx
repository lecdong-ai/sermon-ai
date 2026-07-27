'use client'

import { forwardRef, useMemo } from 'react'
import { PAGE_SIZES } from '@/lib/qtPdfSizes'
import { getTemplate } from '@/lib/qtTemplates'
import { parseDays } from '@/lib/qtDayParser'
import { getFormattedDateList, getWeekdayDateLabels, getWeekdayCountInMonth } from '@/lib/qtDates'
import type { QTFormData, QTResult } from './QtGenerator'

interface QtSelectedInfo {
  book: string
  passage: string
  reason: string
  coreMessage: string
  isRecommended: boolean
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
  audienceLevel?: 'adult' | 'youth'
  selectedInfo?: QtSelectedInfo | null
  daySectionTitles?: Record<number, string[]>
  monthCalendarStrip?: {
    month: string       // "2026년 3월"
    daysInMonth: number // 28 | 29 | 30 | 31
    activeDays: number[]                    // [2, 3, 4, 5, 6, 9] — 일일 페이지별 day
    dayHasContent: boolean[]                // [true, true, ...] — 해당 day에 큐티 데이터가 있는지
  }
}

// 캘린더 스트립을 표시할 sizeOption 화이트리스트
const STRIP_SIZE_OPTIONS = new Set(['A4Landscape', 'A4Portrait', 'iPad Pro 12.9', 'Tablet (iPad 4:3)'])

function filterAudienceContent(rawText: string, level: 'adult' | 'youth'): string {
  if (!rawText) return ''
  const lower = rawText.toLowerCase()
  if (!lower.includes('장년') && !lower.includes('청소년') && !lower.includes('새신자')) return rawText
  const lines = rawText.split('\n')
  let isAdultSection = true
  const resultLines: string[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.includes('장년용') || trimmed.includes('장년') || (trimmed.startsWith('#') && trimmed.includes('장년'))) {
      isAdultSection = true
      continue
    }
    if (trimmed.includes('청소년') || trimmed.includes('새신자') || (trimmed.startsWith('#') && (trimmed.includes('청소년') || trimmed.includes('새신자')))) {
      isAdultSection = false
      continue
    }
    if (level === 'adult' && isAdultSection) resultLines.push(line)
    else if (level === 'youth' && !isAdultSection) resultLines.push(line)
  }
  return resultLines.join('\n').trim()
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

function QtPdfLayout({ form, result, sizeOption, templateId = 'publication-2a', startPassage, endPassage, userMemos = {}, isBilingualSideBySide = false, audienceLevel = 'adult', selectedInfo, daySectionTitles, monthCalendarStrip }: QtPdfLayoutProps, ref: React.Ref<HTMLDivElement>) {
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
      return days
    } catch {
      return []
    }
  }, [fullManuscript])

  const weekdays = useMemo(() => {
    const dayCount = Math.max(parsedDays.length, 1)
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
    const list = getFormattedDateList(form.startDate, dayCount)
    if (list.length > 0) return list.map(label => ({ date: new Date(), label }))
    return []
  }, [form.startDate, parsedDays.length])

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
    fontFamily: t.font,
    position: 'relative',
    pageBreakAfter: 'always',
  }

  const pageContentStyle: React.CSSProperties = {
    paddingTop: showStrip ? `${mmToPx(STRIP_HEIGHT_MM + 2)}px` : undefined,
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
                style={{
                  width: `${cardW}mm`,
                  height: `${cardH}mm`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: `${7 * scale}px`,
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
      display: 'flex', alignItems: 'baseline', gap: `${5 * scale}px`,
      marginTop: `${3 * scale}px`, marginBottom: `${1.5 * scale}px`,
      borderBottom: `0.5px solid ${t.sectionLabelBorder}`,
      paddingBottom: `${1.5 * scale}px`,
    }}>
      <span style={{
        fontFamily: t.fontHeading,
        fontSize: `${9 * scale}px`,
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
      fontSize: `${fs * scale}px`,
      lineHeight: t.bodyLineHeight,
      color: t.textColor,
      textAlign: 'justify',
      letterSpacing: '0.01em',
    }}>
      {text.split('\n').map((l, i) => (
        <div key={i} style={{ marginBottom: `${1.5 * scale}px` }}>{l}</div>
      ))}
    </div>
  )

  const pageNumber = (num: number, total: number) => (
    <div style={{
      position: 'absolute',
      bottom: `${mmToPx(2)}px`,
      right: `${mmToPx(10)}px`,
      fontSize: `${8 * scale}px`,
      color: t.pageNumberColor,
      fontFamily: t.fontHeading,
      letterSpacing: `${1.5 * scale}px`,
    }}>
      {num} / {total}
    </div>
  )

  const parsedTitleSize = parseFloat(t.coverTitleSize || '28')

  // 글자수 기반 overflow 감지 (landscape / portrait 공유)
  const maxChars: Record<string, number> = {
    passageOverview: 250, slowReading: 350,
    observation: 700, understanding: 500, gospel: 1000,
    application: 300, reflection: 250, community: 150,
    originalWords: 800, englishWords: 800,
    englishVerse: 600, leaderGuide: 200, prayer: 350,
  }
  const trunc = (text: string, key: string): string => {
    if (!text) return ''
    const limit = maxChars[key] || 500
    return text.length > limit ? text.slice(0, limit).replace(/\s+\S*$/, '') + ' …' : text
  }

  // ============= A안: 가로 2페이지 (1일 2페이지, 2-A 디자인) =============
  const renderDailyLandscape = (day: any, dayIdx: number) => {
    const verses = parseBibleVerses(day.passage || '')
    const firstSentence = (verses.korVerse || '').split(/[.!?。!?]/)[0]?.trim() || ''
    // Page 1 = cover (1) + dayIdx*3 + 1, Page 2 = +2, Page 3 = +3 (optional)
    pageCounter = 2 + dayIdx * 3

    // Overflow detection — 글자수 기반
    const reflect = (key: string): string => trunc((day as any)[key] || '', key)
    const hasOverflow = (['observation','understanding','application','reflection','prayer']).some(k => {
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
          padding: `${2 * scale}px ${9 * scale}px`,
          marginBottom: `${2 * scale}px`,
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

    return (
      <div key={dayIdx}>
      {/* ══════ Page 1 (앞면): 말씀 중심 ══════ */}
      <div className="qt-page" style={pageStyle}>
        <div style={pageContentStyle}>
          {renderCalendarStrip(monthCalendarStrip?.activeDays[dayIdx] ?? 0)}
          {landscapeHeader(`QT · ${form.bibleBook} · ${form.weekNumber}주`)}

        {/* ═══ 주간 펼침 (6일 그리드) — compact ═══ */}
        <div style={{
          marginBottom: `${2 * scale}px`,
          padding: `${3 * scale}px ${4 * scale}px`,
          background: t.accentLight,
          borderLeft: `${1.5 * scale}px solid ${t.sectionLabelBorder}`,
          borderTop: `0.5px solid ${t.borderLight}`,
          borderRight: `0.5px solid ${t.borderLight}`,
          borderBottom: `0.5px solid ${t.borderLight}`,
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: `${1.5 * scale}px`,
            paddingBottom: `${1 * scale}px`,
            borderBottom: `0.5px solid ${t.sectionLabelBorder}`,
          }}>
            <div style={{
              fontFamily: t.fontHeading,
              fontSize: `${10.5 * scale}px`,
              fontWeight: 800,
              color: t.accent,
              letterSpacing: `${2 * scale}px`,
              textTransform: 'uppercase',
            }}>
              ◆ 주간 펼침 · {form.bibleBook} · 제{form.weekNumber}주
            </div>
            <div style={{
              fontFamily: t.fontHeading,
              fontSize: `${9 * scale}px`,
              fontWeight: 500,
              color: t.textMuted,
              letterSpacing: `${0.5 * scale}px`,
              marginTop: `${1.5 * scale}px`,
            }}>
              {weekdays[0]?.label} ~ {weekdays[weekdays.length - 1]?.label} · 6일
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: `${0.5 * scale}px`,
          }}>
            {parsedDays.slice(0, 6).map((d, i) => {
              const dv = parseBibleVerses(d.passage || '')
              const isCurrent = i === dayIdx
              const passageShort = (dv.passageRange || '').split(' ').pop() || ''
              return (
                <div key={i} style={{
                  display: 'flex', flexDirection: 'column',
                  padding: `${2 * scale}px ${1.5 * scale}px`,
                  background: isCurrent ? `${t.accent}1A` : 'transparent',
                  color: t.textColor,
                  borderTop: `0.5px solid ${t.borderLight}`,
                  minHeight: `${90 * scale}px`,
                }}>
                  <div style={{
                    flex: 1,
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    gap: `${0.5 * scale}px`,
                  }}>
                    <div style={{
                      fontFamily: t.fontHeading,
                      fontSize: `${9.5 * scale}px`,
                      fontWeight: 800,
                      color: isCurrent ? t.accent : t.accent,
                      letterSpacing: `${0.5 * scale}px`,
                      textTransform: 'uppercase',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <span>{weekdays[i]?.label || `Day ${i + 1}`}</span>
                      {isCurrent && <span style={{ fontSize: `${10 * scale}px`, color: t.accent }}>★</span>}
                    </div>
                    {passageShort && (
                      <div style={{
                        fontFamily: t.fontHeading,
                        fontSize: `${9.5 * scale}px`,
                        fontWeight: 700,
                        color: t.textColor,
                      }}>
                        {passageShort}
                      </div>
                    )}
                    <div style={{
                      fontFamily: t.fontHeading,
                      fontSize: `${9.5 * scale}px`,
                      fontWeight: 700,
                      color: t.textColor,
                      lineHeight: '1.2',
                    }}>
                      {d.title || `Day ${i + 1}`}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex', flexDirection: 'column', gap: `${3 * scale}px`,
                    paddingTop: `${2 * scale}px`,
                    marginTop: `${1.5 * scale}px`,
                    borderTop: `0.5px solid ${t.borderLight}`,
                  }}>
                    {[1].map(line => (
                      <div key={line} style={{
                        borderBottom: `0.5px solid ${t.borderLight}`,
                        height: `${10 * scale}px`,
                      }} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

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
              marginBottom: `${2 * scale}px`,
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
                  fontSize: `${10.5 * scale}px`,
                  lineHeight: '1.45',
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
                  fontSize: `${10.5 * scale}px`,
                  lineHeight: '1.45',
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
            marginBottom: `${2 * scale}px`,
            padding: `${3 * scale}px ${6 * scale}px`,
            background: t.bibleQuoteBg,
            borderLeft: `${1.5 * scale}px solid ${t.bibleQuoteBorder}`,
            borderTop: `0.5px solid ${t.borderLight}`,
            borderRight: `0.5px solid ${t.borderLight}`,
            borderBottom: `0.5px solid ${t.borderLight}`,
          }}>
            <div style={{
              fontFamily: t.fontHeading,
              fontSize: `${8 * scale}px`,
              fontWeight: 700,
              color: t.accent,
              letterSpacing: `${1.5 * scale}px`,
              textTransform: 'uppercase',
              marginBottom: `${1 * scale}px`,
            }}>
              영어로 붙드는 말씀
            </div>
            <div style={{
              fontFamily: "'Georgia', 'Noto Serif', 'Times New Roman', serif",
              fontSize: `${9.5 * scale}px`,
              lineHeight: '1.45',
              color: t.bibleQuoteText,
              fontStyle: 'italic',
            }}>
              {reflect('englishVerse').split('\n').filter(l => l.trim()).join('\n')}
            </div>
          </div>
        )}

        {/* 본문 한눈에 — 2줄 풀폭 */}
        {day.passageOverview && (
          <div style={{
            paddingTop: `${2 * scale}px`,
            borderTop: `0.5px solid ${t.border}`,
          }}>
            {sectionLabel('본문 한눈에 보기')}
            {bodyText(
              day.passageOverview.split('\n').filter(l => l.trim()).slice(0, 2).map(l =>
                l.replace(/^[-*·•\s]*\s*(보기|단락\s*요약|문맥\s*위치|오늘의\s*핵심\s*메시지|핵심\s*메시지|요약)\s*[:：]\s*/i, '').trim()
              ).join('\n'),
              10
            )}
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
              10
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
          marginBottom: `${2 * scale}px`,
        }}>
          {day.observation && (
            <div style={{ maxHeight: `${100 * scale}px`, overflow: 'hidden' }}>
              {sectionLabel('본문 관찰하기')}
              {bodyText(reflect('observation'), 10.5)}
            </div>
          )}
          {day.understanding && (
            <div style={{ maxHeight: `${90 * scale}px`, overflow: 'hidden' }}>
              {sectionLabel('말씀 이해하기')}
              {bodyText(reflect('understanding'), 10.5)}
            </div>
          )}
        </div>

        {/* 복음으로 보기 (full, compact) */}
        {day.gospel && (
          <div style={{
            marginBottom: `${2 * scale}px`,
            padding: `${2 * scale}px ${5 * scale}px`,
            background: `${t.accent}0D`,
            borderTop: `0.5px solid ${t.borderLight}`,
            borderBottom: `0.5px solid ${t.borderLight}`,
          }}>
            <div style={{
              fontFamily: t.fontHeading,
              fontSize: `${9 * scale}px`,
              fontWeight: 700,
              color: t.accent,
              letterSpacing: `${2 * scale}px`,
              textTransform: 'uppercase',
              marginBottom: `${1 * scale}px`,
            }}>
              ✦ 복음으로 보기
            </div>
            {bodyText(reflect('gospel'), 10)}
          </div>
        )}

        {/* 2열: 적용 | 나를 비추어 보기 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: `${10 * scale}px`,
          marginBottom: `${2 * scale}px`,
        }}>
          {day.application && (
            <div>
              {sectionLabel('오늘의 적용')}
              {bodyText(filterAudienceContent(reflect('application'), audienceLevel), 10.5)}
            </div>
          )}
          {day.reflection && (
            <div>
              {sectionLabel('나를 비추어 보기')}
              {bodyText(reflect('reflection'), 10.5)}
            </div>
          )}
        </div>

        {/* 공동체 연결 — NEW (compact) */}
        {day.community && (
          <div style={{
            marginBottom: `${2 * scale}px`,
            display: 'flex', alignItems: 'baseline', gap: `${5 * scale}px`,
            padding: `${2 * scale}px ${5 * scale}px`,
            background: t.accentLight,
            borderLeft: `${1.5 * scale}px solid ${t.sectionLabelBorder}`,
          }}>
            <span style={{
              fontFamily: t.fontHeading,
              fontSize: `${8.5 * scale}px`,
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
              fontSize: `${10 * scale}px`,
              lineHeight: '1.5',
              color: t.textColor,
            }}>
              {reflect('community').split('\n').filter(l => l.trim()).slice(0, 2).join(' · ')}
            </span>
          </div>
        )}

        {/* 2열: 단어 묵상 | 기도 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: `${10 * scale}px`,
          marginBottom: `${2 * scale}px`,
        }}>
          {(day.originalWords || day.englishWords) && (
            <div>
              {sectionLabel('단어 묵상')}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${4 * scale}px` }}>
                {day.originalWords && (
                  <div>
                    <div style={{
                      fontFamily: t.fontHeading,
                      fontSize: `${8 * scale}px`,
                      fontWeight: 700,
                      color: t.textMuted,
                      letterSpacing: `${1.5 * scale}px`,
                      textTransform: 'uppercase',
                      marginBottom: `${1 * scale}px`,
                    }}>
                      원어
                    </div>
                    {bodyText(reflect('originalWords').split('\n').filter(l => l.trim()).slice(0, 3).join('\n'), 9.5)}
                  </div>
                )}
                {day.englishWords && (
                  <div>
                    <div style={{
                      fontFamily: t.fontHeading,
                      fontSize: `${8 * scale}px`,
                      fontWeight: 700,
                      color: t.textMuted,
                      letterSpacing: `${1.5 * scale}px`,
                      textTransform: 'uppercase',
                      marginBottom: `${1 * scale}px`,
                    }}>
                      영어
                    </div>
                    {bodyText(reflect('englishWords').split('\n').filter(l => l.trim()).slice(0, 3).join('\n'), 9.5)}
                  </div>
                )}
              </div>
            </div>
          )}
          {day.prayer && (
            <div>
              {sectionLabel('오늘의 기도')}
              <div style={{
                padding: `${3 * scale}px ${5 * scale}px`,
                background: t.prayerBoxBg,
                borderLeft: `${1.5 * scale}px solid ${t.accent}`,
                fontFamily: t.font,
                fontSize: `${9.5 * scale}px`,
                lineHeight: '1.5',
                color: t.prayerBoxText,
                fontStyle: 'italic',
                maxHeight: `${80 * scale}px`,
                overflow: 'hidden',
              }}>
                {reflect('prayer').split('\n').filter(l => l.trim()).slice(0, 5).join('\n')}
              </div>
            </div>
          )}
        </div>

        {/* 2열: 한 줄 기록 | 인도자 해설 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: `${10 * scale}px`,
        }}>
          <div>
            <div style={{
              fontFamily: t.fontHeading,
              fontSize: `${8.5 * scale}px`,
              fontWeight: 700,
              color: t.textMuted,
              letterSpacing: `${1.5 * scale}px`,
              textTransform: 'uppercase',
              marginBottom: `${2 * scale}px`,
            }}>
              오늘 내 마음에 남은 한 문장
            </div>
            {userMemos[dayIdx] ? (
              <div style={{
                fontFamily: t.font,
                fontSize: `${10 * scale}px`,
                lineHeight: '1.5',
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
          {day.leaderGuide && (
            <div>
              <div style={{
                fontFamily: t.fontHeading,
                fontSize: `${8 * scale}px`,
                fontWeight: 700,
                color: t.textMuted,
                letterSpacing: `${1.5 * scale}px`,
                textTransform: 'uppercase',
                marginBottom: `${1 * scale}px`,
              }}>
                인도자 해설
              </div>
              <div style={{
                fontFamily: t.font,
                fontSize: `${8.5 * scale}px`,
                lineHeight: '1.45',
                color: t.textMuted,
                maxHeight: `${50 * scale}px`,
                overflow: 'hidden',
              }}>
                {reflect('leaderGuide').split('\n').filter(l => l.trim()).slice(0, 3).join('\n')}
              </div>
            </div>
          )}
        </div>

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
              {bodyText(filterAudienceContent((day as any).application!, audienceLevel), 11)}
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
                lineHeight: '1.6',
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
    const firstSentence = (verses.korVerse || '').split(/[.!?。!?]/)[0]?.trim() || ''
    pageCounter = 1 + dayIdx * 3 + 1

    // Overflow detection (shared with landscape)
    const reflectP = (key: string): string => trunc((day as any)[key] || '', key)
    const hasOverflowP = (['observation','understanding','application','reflection','prayer']).some(k => {
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
              padding: `${3 * scale}px ${7 * scale}px`,
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
                QT · {form.bibleBook} · {form.weekNumber}주
              </div>
            </div>
            <div style={{
              fontFamily: t.fontHeading,
              fontSize: `${17 * scale}px`,
              fontWeight: 800,
              color: t.textColor,
              lineHeight: '1.25',
              letterSpacing: `${0.5 * scale}px`,
              marginBottom: `${2 * scale}px`,
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
            marginBottom: `${3 * scale}px`,
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
                ◆ 주간 펼침 · {form.bibleBook} · 제{form.weekNumber}주
              </span>
              <span style={{
                fontFamily: t.fontHeading,
                fontSize: `${9 * scale}px`,
                fontWeight: 500,
                color: t.textMuted,
                marginTop: `${1 * scale}px`,
              }}>
                {weekdays[0]?.label} ~ {weekdays[weekdays.length - 1]?.label} · 6일
              </span>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: `${0.5 * scale}px`,
            }}>
              {parsedDays.slice(0, 6).map((d, i) => {
                const dv = parseBibleVerses(d.passage || '')
                const isCurrent = i === dayIdx
                const passageShort = (dv.passageRange || '').split(' ').pop() || ''
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
                      <span>{weekdays[i]?.label?.split('(')[0] || `Day ${i + 1}`}</span>
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
                      {d.title || `Day ${i + 1}`}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 핵심 구절 */}
          {firstSentence && (
            <div style={{
              marginBottom: `${5 * scale}px`,
              padding: `${5 * scale}px ${8 * scale}px`,
              background: t.accentLight,
              borderLeft: `${2 * scale}px solid ${t.accent}`,
              borderTop: `0.5px solid ${t.borderLight}`,
              borderRight: `0.5px solid ${t.borderLight}`,
              borderBottom: `0.5px solid ${t.borderLight}`,
            }}>
              <div style={{
                fontFamily: t.fontHeading,
                fontSize: `${8.5 * scale}px`,
                fontWeight: 700,
                color: t.accent,
                letterSpacing: `${2 * scale}px`,
                textTransform: 'uppercase',
                marginBottom: `${1.5 * scale}px`,
              }}>
                핵심 구절
              </div>
              <div style={{
                fontFamily: t.font,
                fontSize: `${11.5 * scale}px`,
                fontWeight: 500,
                color: t.textColor,
                lineHeight: '1.5',
                fontStyle: 'italic',
              }}>
                {firstSentence}.
              </div>
            </div>
          )}

          {/* 한/영 병렬 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: `${14 * scale}px`,
            marginBottom: `${4 * scale}px`,
          }}>
            <div>
              <div style={{
                fontFamily: t.fontHeading,
                fontSize: `${10.5 * scale}px`,
                fontWeight: 800,
                color: t.accent,
                letterSpacing: `${2.2 * scale}px`,
                textTransform: 'uppercase',
                marginBottom: `${2 * scale}px`,
                paddingBottom: `${1.5 * scale}px`,
                borderBottom: `0.5px solid ${t.border}`,
              }}>
                한글 · 개역개정
              </div>
              <div style={{
                fontFamily: t.font,
                fontSize: `${11.5 * scale}px`,
                lineHeight: '1.6',
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
                marginBottom: `${2 * scale}px`,
                paddingBottom: `${1.5 * scale}px`,
                borderBottom: `0.5px solid ${t.border}`,
              }}>
                English · KJV
              </div>
              <div style={{
                fontFamily: "'Georgia', 'Noto Serif', 'Times New Roman', serif",
                fontSize: `${10.5 * scale}px`,
                lineHeight: '1.55',
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
              marginBottom: `${7 * scale}px`,
              padding: `${4 * scale}px ${7 * scale}px`,
              background: t.bibleQuoteBg,
              borderLeft: `${2 * scale}px solid ${t.bibleQuoteBorder}`,
              borderTop: `0.5px solid ${t.borderLight}`,
              borderRight: `0.5px solid ${t.borderLight}`,
              borderBottom: `0.5px solid ${t.borderLight}`,
            }}>
              <div style={{
                fontFamily: t.fontHeading,
                fontSize: `${8 * scale}px`,
                fontWeight: 700,
                color: t.accent,
                letterSpacing: `${1.5 * scale}px`,
                textTransform: 'uppercase',
                marginBottom: `${1 * scale}px`,
              }}>
                영어로 붙드는 말씀
              </div>
              <div style={{
                fontFamily: "'Georgia', 'Noto Serif', 'Times New Roman', serif",
                fontSize: `${10.5 * scale}px`,
                lineHeight: '1.5',
                color: t.bibleQuoteText,
                fontStyle: 'italic',
              }}>
                {reflectP('englishVerse').split('\n').filter(l => l.trim()).join('\n')}
              </div>
            </div>
          )}

          {/* 본문 한눈에 */}
          {day.passageOverview && (
            <div style={{ marginBottom: `${4 * scale}px` }}>
              {sectionLabel('본문 한눈에 보기')}
              {bodyText(
                day.passageOverview.split('\n').filter(l => l.trim()).slice(0, 2).map(l =>
                  l.replace(/^[-*·•\s]*\s*(보기|단락\s*요약|문맥\s*위치|오늘의\s*핵심\s*메시지|핵심\s*메시지|요약)\s*[:：]\s*/i, '').trim()
                ).join('\n'),
                10.5
              )}
            </div>
          )}

          {/* 천천히 읽기 — NEW */}
          {day.slowReading && (
            <div>
              {sectionLabel('천천히 읽기')}
              {bodyText(
                reflectP('slowReading').split('\n').filter(l => l.trim()).slice(0, 4).join('\n'),
                10.5
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
              padding: `${3 * scale}px ${7 * scale}px`,
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
              {bodyText(reflectP('observation'), 11.5)}
            </div>
          )}

          {/* 말씀 이해하기 */}
          {day.understanding && (
            <div style={{ marginBottom: `${5 * scale}px` }}>
              {sectionLabel('말씀 이해하기')}
              {bodyText(reflectP('understanding'), 11)}
            </div>
          )}

          {/* 복음으로 보기 (full) */}
          {day.gospel && (
            <div style={{
              marginBottom: `${5 * scale}px`,
              padding: `${3 * scale}px ${6 * scale}px`,
              background: `${t.accent}0D`,
              borderTop: `0.5px solid ${t.borderLight}`,
              borderBottom: `0.5px solid ${t.borderLight}`,
            }}>
              <div style={{
                fontFamily: t.fontHeading,
                fontSize: `${9 * scale}px`,
                fontWeight: 700,
                color: t.accent,
                letterSpacing: `${2 * scale}px`,
                textTransform: 'uppercase',
                marginBottom: `${1.5 * scale}px`,
              }}>
                ✦ 복음으로 보기
              </div>
              {bodyText(reflectP('gospel'), 11)}
            </div>
          )}

          {/* 나를 비추어 보기 */}
          {day.reflection && (
            <div style={{ marginBottom: `${5 * scale}px` }}>
              {sectionLabel('나를 비추어 보기')}
              {bodyText(reflectP('reflection'), 11)}
            </div>
          )}

          {/* 적용 (full) */}
          {day.application && (
            <div style={{ marginBottom: `${5 * scale}px` }}>
              {sectionLabel('오늘의 적용')}
              {bodyText(filterAudienceContent(reflectP('application'), audienceLevel), 11.5)}
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
                fontSize: `${8.5 * scale}px`,
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
                fontSize: `${10.5 * scale}px`,
                lineHeight: '1.5',
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${5 * scale}px` }}>
                {day.originalWords && (
                  <div>
                    <div style={{
                      fontFamily: t.fontHeading,
                      fontSize: `${8.5 * scale}px`,
                      fontWeight: 700,
                      color: t.textMuted,
                      letterSpacing: `${1.5 * scale}px`,
                      textTransform: 'uppercase',
                      marginBottom: `${1 * scale}px`,
                    }}>
                      원어
                    </div>
                    {bodyText(reflectP('originalWords').split('\n').filter(l => l.trim()).slice(0, 4).join('\n'), 10)}
                  </div>
                )}
                {day.englishWords && (
                  <div>
                    <div style={{
                      fontFamily: t.fontHeading,
                      fontSize: `${8.5 * scale}px`,
                      fontWeight: 700,
                      color: t.textMuted,
                      letterSpacing: `${1.5 * scale}px`,
                      textTransform: 'uppercase',
                      marginBottom: `${1 * scale}px`,
                    }}>
                      영어
                    </div>
                    {bodyText(reflectP('englishWords').split('\n').filter(l => l.trim()).slice(0, 4).join('\n'), 10)}
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
                padding: `${4 * scale}px ${5 * scale}px`,
                background: t.prayerBoxBg,
                borderLeft: `${1.5 * scale}px solid ${t.accent}`,
                fontFamily: t.font,
                fontSize: `${10.5 * scale}px`,
                lineHeight: '1.5',
                color: t.prayerBoxText,
                fontStyle: 'italic',
              }}>
                {reflectP('prayer').split('\n').filter(l => l.trim()).slice(0, 5).join('\n')}
              </div>
            </div>
          )}

          {/* 오늘 내 마음에 남은 한 문장 */}
          <div style={{ marginBottom: `${5 * scale}px` }}>
            <div style={{
              fontFamily: t.fontHeading,
              fontSize: `${8.5 * scale}px`,
              fontWeight: 700,
              color: t.textMuted,
              letterSpacing: `${1.5 * scale}px`,
              textTransform: 'uppercase',
              marginBottom: `${2 * scale}px`,
            }}>
              오늘 내 마음에 남은 한 문장
            </div>
            {userMemos[dayIdx] ? (
              <div style={{
                fontFamily: t.font,
                fontSize: `${11 * scale}px`,
                lineHeight: '1.5',
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
              bottom: `${mmToPx(14)}px`,
              left: 0,
              right: 0,
            }}>
              <div style={{
                fontFamily: t.fontHeading,
                fontSize: `${10 * scale}px`,
                fontWeight: 700,
                color: t.textMuted,
                letterSpacing: `${1.5 * scale}px`,
                textTransform: 'uppercase',
                marginBottom: `${1.5 * scale}px`,
              }}>
                인도자 해설
              </div>
              <div style={{
                fontFamily: t.font,
                fontSize: `${11.5 * scale}px`,
                lineHeight: '1.5',
                color: t.textMuted,
              }}>
                {reflectP('leaderGuide').split('\n').filter(l => l.trim()).slice(0, 4).join('\n')}
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
              marginBottom: `${2 * scale}px`,
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
                {bodyText(filterAudienceContent((day as any).application!, audienceLevel), 11)}
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
                  lineHeight: '1.5',
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

  // ============= 표지 (가로/세로 자동 적응) =============
  const renderCover = () => (
    <div className="qt-page" style={pageStyle}>
      <div style={{
        ...pageContentStyle,
        display: 'flex',
        flexDirection: isLandscape ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isLandscape ? 'flex-start' : 'center',
        textAlign: isLandscape ? 'left' : 'center',
        flex: 1,
      }}>
        {t.coverOrnament && (
          <div style={{
            color: t.accent,
            fontSize: `${14 * scale}px`,
            letterSpacing: `${8 * scale}px`,
            marginBottom: `${14 * scale}px`,
            opacity: 0.6,
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
          fontSize: `${parsedTitleSize * scale}px`,
          fontWeight: 800,
          color: t.textColor,
          letterSpacing: `${5 * scale}px`,
          marginBottom: `${3 * scale}px`,
        }}>
          {selectedInfo?.isRecommended ? '오늘의 큐티' : 'QT 소책자'}
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
          margin: isLandscape ? `0 0 ${10 * scale}px 0` : `${10 * scale}px auto`,
        }} />
        <div style={{
          fontSize: `${12 * scale}px`,
          color: t.textMuted,
          lineHeight: '1.9',
        }}>
          <div style={{
            fontFamily: t.fontHeading,
            fontSize: `${24 * scale}px`,
            fontWeight: 800,
            color: t.accent,
            marginBottom: `${6 * scale}px`,
            letterSpacing: `${1 * scale}px`,
          }}>
            {form.bibleBook}
          </div>
          <div style={{
            fontSize: `${12 * scale}px`,
            color: t.textColor,
            fontWeight: 600,
          }}>
            제{form.weekNumber}주
          </div>
          {(startPassage || endPassage) && (
            <div style={{
              fontSize: `${10 * scale}px`,
              color: t.textMuted,
              marginTop: `${4 * scale}px`,
              fontFamily: t.font,
              letterSpacing: `${0.5 * scale}px`,
            }}>
              {startPassage}{endPassage ? ` ~ ${endPassage}` : ''}
            </div>
          )}
          <div style={{
            fontSize: `${9 * scale}px`,
            color: t.textMuted,
            marginTop: `${5 * scale}px`,
          }}>
            {weekdays[0]?.label} ~ {weekdays[weekdays.length - 1]?.label}
          </div>
        </div>
      </div>
      <div style={{
        position: 'absolute',
        bottom: `${mmToPx(14)}px`,
        fontSize: `${8 * scale}px`,
        color: t.pageNumberColor,
        letterSpacing: `${2 * scale}px`,
        opacity: 0.7,
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
