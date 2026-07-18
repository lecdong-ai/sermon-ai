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
  layoutMode?: 'daily' | 'weekly-spread'
}

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
  let nivVerse = ''
  let passageRange = ''
  let readingGuide = ''
  let currentSection: 'kor' | 'niv' | null = null

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) { currentSection = null; continue }

    const headerMatch = line.match(/^[-·•*]*\s*(개역개정|한글\s*핵심|핵심절|NIV|본문\s*범위|본문\s*읽기\s*안내)/i)
    if (headerMatch) {
      const h = headerMatch[1].toLowerCase()
      if ((h === '개역개정' || h.includes('핵심') || h.includes('한글')) && !line.match(/NIV/i)) {
        const rest = line.replace(/^[-·•*]*\s*개역개정\s*(전체\s*본문|핵심절)?\s*(또는\s*본문\s*범위\s*안내)?\s*[:：]?\s*/i, '').trim()
        if (rest) korVerse = rest
        else currentSection = 'kor'
      } else if (h === 'niv' || line.match(/^[-·•*]*\s*NIV/i)) {
        const rest = line.replace(/^[-·•*]*\s*NIV\s*(전체\s*본문|핵심절)?\s*(또는\s*본문\s*범위\s*안내)?\s*[:：]?\s*/i, '').trim()
        if (rest) nivVerse = rest
        else currentSection = 'niv'
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
    } else if (currentSection === 'niv') {
      nivVerse += (nivVerse ? '\n' : '') + line
    }
  }

  return { korVerse, nivVerse, passageRange, readingGuide }
}

function QtPdfLayout({ form, result, sizeOption, templateId = 'publication-2a', startPassage, endPassage, userMemos = {}, isBilingualSideBySide = false, audienceLevel = 'adult', selectedInfo, layoutMode = 'daily' }: QtPdfLayoutProps, ref: React.Ref<HTMLDivElement>) {
  const size = PAGE_SIZES[sizeOption] || PAGE_SIZES['A4Landscape']
  const cssW = `${size.widthMm}mm`
  const cssH = `${size.heightMm}mm`
  const tmpl = useMemo(() => getTemplate(templateId), [templateId])
  const t = tmpl

  // 가로/세로 자동 감지
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

  // 스케일: 가로일 때는 짧은 변(210mm), 세로일 때는 짧은 변(210mm) 기준
  const scale = Math.min(size.widthMm, size.heightMm) / 210.0

  // 페이지 스타일
  const pageStyle: React.CSSProperties = {
    width: cssW,
    height: cssH,
    boxSizing: 'border-box',
    background: t.pageBg,
    color: t.textColor,
    fontFamily: t.font,
    position: 'relative',
    padding: isLandscape
      ? `${10 * scale}mm ${11 * scale}mm`
      : `${10 * scale}mm ${12 * scale}mm`,
    pageBreakAfter: 'always',
    overflow: 'hidden',
  }

  // 섹션 라벨
  const sectionLabel = (text: string, accent: string = t.sectionLabelBorder) => (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: `${6 * scale}px`,
      marginTop: `${5 * scale}px`, marginBottom: `${2.5 * scale}px`,
      borderBottom: `0.5px solid ${accent}`,
      paddingBottom: `${1.5 * scale}px`,
    }}>
      <span style={{
        fontFamily: t.fontHeading,
        fontSize: `${9.5 * scale}px`,
        fontWeight: 800,
        color: accent,
        letterSpacing: `${2.2 * scale}px`,
        textTransform: 'uppercase',
      }}>
        {text}
      </span>
    </div>
  )

  const bodyText = (text: string, opts?: { size?: number }) => {
    const fs = opts?.size ?? 11
    return (
      <div style={{
        fontSize: `${fs * scale}px`,
        lineHeight: t.bodyLineHeight,
        color: t.textColor,
        textAlign: 'justify',
        letterSpacing: '0.01em',
      }}>
        {text.split('\n').map((l, i) => (
          <div key={i} style={{ marginBottom: `${1.5 * scale}px` }}>
            {l}
          </div>
        ))}
      </div>
    )
  }

  // 가로/세로에 따라 폰트 크기 동적
  const fs = {
    headerBar: 9.5 * scale,
    title: (isLandscape ? 18 : 17) * scale,
    subtitle: (isLandscape ? 10 : 10.5) * scale,
    sectionLabel: 9.5 * scale,
    body: (isLandscape ? 11.5 : 11.5) * scale,
    kor: (isLandscape ? 12 : 11) * scale,
    niv: (isLandscape ? 11.5 : 10.5) * scale,
    coreVerse: (isLandscape ? 12.5 : 11.5) * scale,
    words: (isLandscape ? 11 : 10.5) * scale,
    prayer: (isLandscape ? 11.5 : 11) * scale,
    memo: (isLandscape ? 12 : 11.5) * scale,
    pageNum: 8 * scale,
  }

  // 페이지 헤더 (네이비 풀폭)
  const pageHeader = (dayIdx: number, day: any, verses: any) => (
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
          fontSize: `${fs.headerBar}px`,
          fontWeight: 700,
          letterSpacing: `${2.5 * scale}px`,
        }}>
          DAY {dayIdx + 1} · {weekdays[dayIdx]?.label || ''}
        </div>
        <div style={{
          fontFamily: t.fontHeading,
          fontSize: `${fs.headerBar * 0.9}px`,
          fontWeight: 600,
          letterSpacing: `${1.5 * scale}px`,
          opacity: 0.85,
        }}>
          QT · {form.bibleBook} · {form.weekNumber}주
        </div>
      </div>

      <div style={{
        fontFamily: t.fontHeading,
        fontSize: `${fs.title}px`,
        fontWeight: 800,
        color: t.textColor,
        lineHeight: '1.2',
        letterSpacing: `${0.5 * scale}px`,
        marginBottom: `${2 * scale}px`,
      }}>
        {day.title || `Day ${dayIdx + 1}`}
      </div>

      {verses.passageRange && (
        <div style={{
          fontFamily: t.fontHeading,
          fontSize: `${fs.subtitle}px`,
          fontWeight: 500,
          color: t.textMuted,
          letterSpacing: `${0.5 * scale}px`,
        }}>
          오늘의 본문 · {verses.passageRange}
        </div>
      )}
    </div>
  )

  // 핵심 구절 (풀폭)
  const coreVerseBox = (korVerse: string) => {
    if (!korVerse) return null
    const firstSentence = korVerse.split(/[.!?。!?]/)[0]?.trim() || korVerse.slice(0, 60)
    return (
      <div style={{
        marginBottom: `${5 * scale}px`,
        padding: `${4 * scale}px ${8 * scale}px`,
        background: t.accentLight,
        borderLeft: `${2 * scale}px solid ${t.accent}`,
        borderTop: `0.5px solid ${t.borderLight}`,
        borderRight: `0.5px solid ${t.borderLight}`,
        borderBottom: `0.5px solid ${t.borderLight}`,
      }}>
        <div style={{
          fontFamily: t.fontHeading,
          fontSize: `${8 * scale}px`,
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
          fontSize: `${fs.coreVerse}px`,
          fontWeight: 500,
          color: t.textColor,
          lineHeight: '1.5',
          fontStyle: 'italic',
        }}>
          {firstSentence}.
        </div>
      </div>
    )
  }

  // 한영 병렬 2단 (60:40 또는 50:50)
  const bilingualBible = (korVerse: string, nivVerse: string) => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isLandscape ? '1.2fr 1fr' : '1fr 1fr',
      gap: `${6 * scale}px`,
      marginBottom: `${4 * scale}px`,
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: t.fontHeading,
          fontSize: `${8.5 * scale}px`,
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
          fontSize: `${fs.kor}px`,
          lineHeight: '1.55',
          color: t.textColor,
          textAlign: 'justify',
          wordBreak: 'keep-all',
        }}>
          {korVerse.split('\n').map((l, i) => (
            <div key={i} style={{ marginBottom: `${2 * scale}px` }}>{l}</div>
          ))}
        </div>
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: t.fontHeading,
          fontSize: `${8.5 * scale}px`,
          fontWeight: 800,
          color: t.accent,
          letterSpacing: `${2.2 * scale}px`,
          textTransform: 'uppercase',
          marginBottom: `${2 * scale}px`,
          paddingBottom: `${1.5 * scale}px`,
          borderBottom: `0.5px solid ${t.border}`,
        }}>
          English · NIV
        </div>
        <div style={{
          fontFamily: "'Georgia', 'Noto Serif', 'Times New Roman', serif",
          fontSize: `${fs.niv}px`,
          lineHeight: '1.55',
          color: t.textColor,
          textAlign: 'justify',
          fontStyle: 'italic',
        }}>
          {nivVerse.split('\n').map((l, i) => (
            <div key={i} style={{ marginBottom: `${2 * scale}px` }}>{l}</div>
          ))}
        </div>
      </div>
    </div>
  )

  const passageOverviewBlock = (text: string) => {
    if (!text) return null
    const lines = text.split('\n').filter(l => l.trim())
    return (
      <div style={{ marginTop: `${2 * scale}px` }}>
        {sectionLabel('본문 한눈에 보기')}
        <div style={{
          fontFamily: t.font,
          fontSize: `${fs.body - 0.5}px`,
          lineHeight: '1.55',
          color: t.textColor,
          textAlign: 'justify',
          padding: `${2 * scale}px 0`,
        }}>
          {lines.slice(0, 2).map((l, i) => (
            <div key={i} style={{ marginBottom: `${2 * scale}px` }}>
              {l.replace(/^[-*·•\s]*\s*(단락\s*요약|문맥\s*위치|오늘의\s*핵심\s*메시지|핵심\s*메시지|요약)\s*[:：]\s*/i, '').trim()}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const wordsSideBySide = (original: string, english: string) => {
    if (!original && !english) return null
    return (
      <div style={{ display: 'grid', gridTemplateColumns: isLandscape ? '1fr 1fr 1.4fr' : '1fr 1fr', gap: `${6 * scale}px`, marginTop: `${3 * scale}px` }}>
        {original && (
          <div>
            <div style={{
              fontFamily: t.fontHeading, fontSize: `${8.5 * scale}px`, fontWeight: 800,
              color: t.accent, letterSpacing: `${2 * scale}px`, textTransform: 'uppercase',
              marginBottom: `${2 * scale}px`, paddingBottom: `${1.5 * scale}px`,
              borderBottom: `0.5px solid ${t.border}`,
            }}>
              원어 묵상
            </div>
            <div style={{ fontFamily: t.font, fontSize: `${fs.words}px`, lineHeight: '1.5', color: t.textColor, textAlign: 'justify' }}>
              {original.split('\n').filter(l => l.trim()).slice(0, 3).map((l, i) => (
                <div key={i} style={{ marginBottom: `${1.5 * scale}px` }}>{l}</div>
              ))}
            </div>
          </div>
        )}
        {english && (
          <div>
            <div style={{
              fontFamily: t.fontHeading, fontSize: `${8.5 * scale}px`, fontWeight: 800,
              color: t.accent, letterSpacing: `${2 * scale}px`, textTransform: 'uppercase',
              marginBottom: `${2 * scale}px`, paddingBottom: `${1.5 * scale}px`,
              borderBottom: `0.5px solid ${t.border}`,
            }}>
              영어 묵상
            </div>
            <div style={{ fontFamily: t.font, fontSize: `${fs.words}px`, lineHeight: '1.5', color: t.textColor, textAlign: 'justify' }}>
              {english.split('\n').filter(l => l.trim()).slice(0, 3).map((l, i) => (
                <div key={i} style={{ marginBottom: `${1.5 * scale}px` }}>{l}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const prayerBlock = (text: string) => {
    if (!text) return null
    return (
      <div style={{
        marginTop: `${2 * scale}px`,
        padding: `${4 * scale}px ${7 * scale}px`,
        background: t.prayerBoxBg,
        borderLeft: `${1.5 * scale}px solid ${t.accent}`,
        fontFamily: t.font,
        fontSize: `${fs.prayer}px`,
        lineHeight: '1.55',
        color: t.prayerBoxText,
        fontStyle: 'italic',
      }}>
        {text.split('\n').filter(l => l.trim()).map((l, i) => (
          <div key={i} style={{ marginBottom: `${1.5 * scale}px` }}>{l}</div>
        ))}
      </div>
    )
  }

  const oneLineMemo = (memo: string | undefined) => (
    <div style={{ marginTop: `${5 * scale}px` }}>
      <div style={{
        fontFamily: t.fontHeading, fontSize: `${8.5 * scale}px`, fontWeight: 700,
        color: t.textMuted, letterSpacing: `${1.8 * scale}px`, textTransform: 'uppercase',
        marginBottom: `${3 * scale}px`,
      }}>
        오늘 내 마음에 남은 한 문장
      </div>
      {memo ? (
        <div style={{
          fontFamily: t.font, fontSize: `${fs.memo}px`, lineHeight: '1.5',
          color: t.textColor, fontStyle: 'italic', minHeight: `${12 * scale}px`,
          paddingBottom: `${2 * scale}px`, borderBottom: `0.5px solid ${t.border}`,
          wordBreak: 'break-all',
        }}>
          {memo}
        </div>
      ) : (
        <div style={{
          height: `${12 * scale}px`,
          borderBottom: `0.5px solid ${t.border}`,
        }} />
      )}
    </div>
  )

  const pageNumber = (num: number, total: number) => (
    <div style={{
      position: 'absolute',
      bottom: `${4 * scale}mm`,
      right: `${11 * scale}mm`,
      fontSize: `${fs.pageNum}px`,
      color: t.pageNumberColor,
      fontFamily: t.fontHeading,
      letterSpacing: `${1.5 * scale}px`,
    }}>
      {num} / {total}
    </div>
  )

  const totalPages = layoutMode === 'weekly-spread'
    ? 1 + 1  // cover + spread
    : 1 + parsedDays.length * 2
  let pageCounter = 0
  const parsedTitleSize = parseFloat(t.coverTitleSize || '28')

  // ==========================================
  // A안: 일일 펼침 (가로) — 한 면 풀 활용
  // ==========================================
  const renderDailyLandscape = (day: any, dayIdx: number) => {
    const verses = parseBibleVerses(day.passage || '')
    pageCounter = dayIdx * 2 + 2

    return (
      <div key={dayIdx}>
        {/* ────── Page 1 (앞면): 말씀 + 묵상 (60:40 2단) ────── */}
        <div className="qt-page" style={pageStyle}>
          {pageHeader(dayIdx, day, verses)}
          {coreVerseBox(verses.korVerse)}

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: `${8 * scale}px`, marginBottom: `${4 * scale}px` }}>
            {/* 좌측 60%: 한영 병렬 + 한눈에 */}
            <div>
              {bilingualBible(verses.korVerse, verses.nivVerse)}
              {passageOverviewBlock(day.passageOverview)}
            </div>
            {/* 우측 40%: 묵상 */}
            <div style={{ borderLeft: `0.5px solid ${t.border}`, paddingLeft: `${7 * scale}px` }}>
              {day.observation && (
                <div>
                  {sectionLabel('본문 관찰하기')}
                  {bodyText(day.observation, { size: 10.5 })}
                </div>
              )}
              {day.understanding && (
                <div>
                  {sectionLabel('본문 이해하기')}
                  {bodyText(day.understanding, { size: 10.5 })}
                </div>
              )}
            </div>
          </div>

          {pageNumber(pageCounter, totalPages)}
        </div>

        {/* ────── Page 2 (뒷면): 복음 / 적용 / 단어 / 기도 / 한 줄 ────── */}
        <div className="qt-page" style={pageStyle}>
          {pageHeader(dayIdx, day, verses)}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${8 * scale}px`, marginBottom: `${4 * scale}px` }}>
            {/* 좌측: 복음 + 적용 */}
            <div>
              {day.gospel && (
                <div>
                  {sectionLabel('복음으로 보기')}
                  {bodyText(day.gospel, { size: 10.5 })}
                </div>
              )}
              {day.application && (
                <div>
                  {sectionLabel('오늘의 적용')}
                  {bodyText(filterAudienceContent(day.application, audienceLevel), { size: 10.5 })}
                </div>
              )}
            </div>
            {/* 우측: 단어 + 기도 + 한 줄 */}
            <div>
              {wordsSideBySide(day.originalWords, day.englishWords)}
              {prayerBlock(day.prayer)}
              {oneLineMemo(userMemos[dayIdx])}
            </div>
          </div>

          {pageNumber(pageCounter + 1, totalPages)}
        </div>
      </div>
    )
  }

  // ==========================================
  // A안: 일일 펼침 (세로) — 2-A 디자인 유지
  // ==========================================
  const renderDailyPortrait = (day: any, dayIdx: number) => {
    const verses = parseBibleVerses(day.passage || '')
    pageCounter = 1 + dayIdx * 2 + 1

    return (
      <div key={dayIdx}>
        {/* Page 1: 말씀 중심 */}
        <div className="qt-page" style={pageStyle}>
          {pageHeader(dayIdx, day, verses)}
          {coreVerseBox(verses.korVerse)}
          {bilingualBible(verses.korVerse, verses.nivVerse)}
          {passageOverviewBlock(day.passageOverview)}
          {pageNumber(pageCounter, totalPages)}
        </div>

        {/* Page 2: 관찰/이해/적용 */}
        <div className="qt-page" style={pageStyle}>
          {pageHeader(dayIdx, day, verses)}
          {day.observation && (
            <div>
              {sectionLabel('본문 관찰하기')}
              {bodyText(day.observation, { size: 11.5 })}
            </div>
          )}
          {day.understanding && (
            <div>
              {sectionLabel('본문 이해하기')}
              {bodyText(day.understanding, { size: 11.5 })}
            </div>
          )}
          {day.gospel && (
            <div>
              {sectionLabel('복음으로 보기')}
              {bodyText(day.gospel, { size: 11.5 })}
            </div>
          )}
          {day.application && (
            <div>
              {sectionLabel('오늘의 적용')}
              {bodyText(filterAudienceContent(day.application, audienceLevel), { size: 11.5 })}
            </div>
          )}
          {wordsSideBySide(day.originalWords, day.englishWords)}
          {prayerBlock(day.prayer)}
          {oneLineMemo(userMemos[dayIdx])}
          {pageNumber(pageCounter + 1, totalPages)}
        </div>
      </div>
    )
  }

  // ==========================================
  // B안: 주간 펼침 (가로 1면)
  // ==========================================
  const renderWeeklySpread = () => {
    const days = parsedDays.slice(0, 7)
    const COLS = 7
    const cellW = (cssW.replace('mm', '').trim() as any) // just for calc; we'll use percentages via grid

    return (
      <div key="weekly-spread" className="qt-page" style={pageStyle}>
        {/* 헤더 */}
        <div style={{
          marginBottom: `${8 * scale}px`,
          paddingBottom: `${5 * scale}px`,
          borderBottom: `${0.75 * scale}px solid ${t.accent}`,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: t.accent,
            color: '#ffffff',
            padding: `${4 * scale}px ${9 * scale}px`,
            marginBottom: `${5 * scale}px`,
          }}>
            <div style={{
              fontFamily: t.fontHeading,
              fontSize: `${11 * scale}px`,
              fontWeight: 700,
              letterSpacing: `${3 * scale}px`,
            }}>
              {form.bibleBook} · 제{form.weekNumber}주
            </div>
            <div style={{
              fontFamily: t.fontHeading,
              fontSize: `${10 * scale}px`,
              fontWeight: 600,
              letterSpacing: `${2 * scale}px`,
              opacity: 0.9,
            }}>
              주간 펼침 · {weekdays[0]?.label || ''} ~ {weekdays[weekdays.length - 1]?.label || ''}
            </div>
          </div>
          <div style={{
            fontFamily: t.fontHeading,
            fontSize: `${13 * scale}px`,
            fontWeight: 700,
            color: t.textColor,
            letterSpacing: `${0.5 * scale}px`,
          }}>
            {form.seriesName || '말씀과 함께하는 큐티'}
          </div>
        </div>

        {/* 7일 그리드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gap: `${3 * scale}px`,
          flex: 1,
        }}>
          {days.map((day, i) => {
            const verses = parseBibleVerses(day.passage || '')
            const firstSentence = (verses.korVerse || '').split(/[.!?。!?]/)[0]?.trim() || ''
            return (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column',
                borderTop: `1px solid ${t.accent}`,
                paddingTop: `${4 * scale}px`,
                minHeight: 0,
              }}>
                {/* 요일 헤더 */}
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${9 * scale}px`,
                  fontWeight: 800,
                  color: t.accent,
                  letterSpacing: `${1.5 * scale}px`,
                  textTransform: 'uppercase',
                  marginBottom: `${2 * scale}px`,
                }}>
                  {weekdays[i]?.label || `Day ${i + 1}`}
                </div>
                {/* 본문 범위 */}
                {verses.passageRange && (
                  <div style={{
                    fontFamily: t.fontHeading,
                    fontSize: `${8.5 * scale}px`,
                    fontWeight: 700,
                    color: t.textColor,
                    marginBottom: `${1.5 * scale}px`,
                  }}>
                    {verses.passageRange}
                  </div>
                )}
                {/* 제목 */}
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${9.5 * scale}px`,
                  fontWeight: 600,
                  color: t.textColor,
                  marginBottom: `${2 * scale}px`,
                  lineHeight: '1.3',
                }}>
                  {day.title || `Day ${i + 1}`}
                </div>
                {/* 핵심 구절 */}
                {firstSentence && (
                  <div style={{
                    fontFamily: t.font,
                    fontSize: `${8.5 * scale}px`,
                    lineHeight: '1.45',
                    color: t.textMuted,
                    fontStyle: 'italic',
                    paddingLeft: `${3 * scale}px`,
                    borderLeft: `1.5px solid ${t.sectionLabelBorder}`,
                    marginBottom: `${3 * scale}px`,
                  }}>
                    {firstSentence.length > 80 ? firstSentence.slice(0, 80) + '…' : firstSentence}
                  </div>
                )}
                {/* 메모란 */}
                <div style={{
                  flex: 1,
                  marginTop: 'auto',
                  borderTop: `0.5px solid ${t.border}`,
                  paddingTop: `${3 * scale}px`,
                }}>
                  <div style={{
                    fontFamily: t.fontHeading,
                    fontSize: `${7.5 * scale}px`,
                    fontWeight: 700,
                    color: t.textMuted,
                    letterSpacing: `${1.2 * scale}px`,
                    textTransform: 'uppercase',
                    marginBottom: `${2 * scale}px`,
                  }}>
                    메모
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: `${6 * scale}px` }}>
                    {[1, 2, 3].map(line => (
                      <div key={line} style={{ borderBottom: `0.5px solid ${t.borderLight}`, height: `${10 * scale}px` }} />
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* 푸터 */}
        <div style={{
          position: 'absolute',
          bottom: `${5 * scale}mm`,
          left: `${11 * scale}mm`,
          right: `${11 * scale}mm`,
          display: 'flex', justifyContent: 'space-between',
          fontSize: `${8 * scale}px`,
          color: t.pageNumberColor,
          fontFamily: t.fontHeading,
          letterSpacing: `${1.5 * scale}px`,
          borderTop: `0.5px solid ${t.border}`,
          paddingTop: `${3 * scale}px`,
        }}>
          <span>bunker.ai.kr · 주간 펼침</span>
          <span>{parsedDays.length}일 · {form.bibleBook}</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div ref={ref}>
        {/* ==================== 표지 (가로/세로 자동 적응) ==================== */}
        {layoutMode !== 'weekly-spread' && (
          <div className="qt-page" style={{
            ...pageStyle,
            display: 'flex', flexDirection: 'column',
            alignItems: isLandscape ? 'flex-start' : 'center',
            justifyContent: 'center',
            textAlign: isLandscape ? 'left' : 'center',
            paddingLeft: isLandscape ? `${20 * scale}mm` : pageStyle.padding,
          }}>
            {t.coverOrnament && (
              <div style={{
                color: t.accent, fontSize: `${14 * scale}px`,
                letterSpacing: `${8 * scale}px`, marginBottom: `${14 * scale}px`, opacity: 0.6,
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
            <div style={{ fontFamily: t.fontHeading, fontSize: `${parsedTitleSize * scale}px`, fontWeight: 800, color: t.textColor, letterSpacing: `${5 * scale}px`, marginBottom: `${3 * scale}px` }}>
              {selectedInfo?.isRecommended ? '오늘의 큐티' : 'QT 소책자'}
            </div>
            <div style={{ fontFamily: t.fontHeading, fontSize: `${10 * scale}px`, color: t.coverSubtitleColor, letterSpacing: `${2.5 * scale}px`, marginBottom: `${16 * scale}px` }}>
              {form.seriesName || '말씀과 함께하는 큐티'}
            </div>
            <div style={{ width: `${56 * scale}px`, height: `${1 * scale}px`, background: t.coverAccentLine, margin: isLandscape ? `0 0 ${10 * scale}px 0` : `${10 * scale}px auto` }} />
            <div style={{ fontSize: `${12 * scale}px`, color: t.textMuted, lineHeight: '1.9' }}>
              <div style={{ fontFamily: t.fontHeading, fontSize: `${22 * scale}px`, fontWeight: 800, color: t.accent, marginBottom: `${6 * scale}px`, letterSpacing: `${1 * scale}px` }}>
                {form.bibleBook}
              </div>
              <div style={{ fontSize: `${11 * scale}px`, color: t.textColor, fontWeight: 600 }}>제{form.weekNumber}주</div>
              {(startPassage || endPassage) && (
                <div style={{ fontSize: `${9.5 * scale}px`, color: t.textMuted, marginTop: `${4 * scale}px`, fontFamily: t.font, letterSpacing: `${0.5 * scale}px` }}>
                  {startPassage}{endPassage ? ` ~ ${endPassage}` : ''}
                </div>
              )}
              <div style={{ fontSize: `${8.5 * scale}px`, color: t.textMuted, marginTop: `${5 * scale}px` }}>
                {weekdays[0]?.label} ~ {weekdays[weekdays.length - 1]?.label}
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: `${14 * scale}mm`, fontSize: `${7.5 * scale}px`, color: t.pageNumberColor, letterSpacing: `${2 * scale}px`, opacity: 0.7 }}>
              bunker.ai.kr · 목회의 모든 순간을 잇다
            </div>
          </div>
        )}

        {/* ==================== 일일 펼침 ==================== */}
        {layoutMode === 'weekly-spread' ? (
          renderWeeklySpread()
        ) : isLandscape ? (
          parsedDays.map((day, dayIdx) => renderDailyLandscape(day, dayIdx))
        ) : (
          parsedDays.map((day, dayIdx) => renderDailyPortrait(day, dayIdx))
        )}
      </div>
    </div>
  )
}

export default forwardRef(QtPdfLayout)
