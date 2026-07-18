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

function QtPdfLayout({ form, result, sizeOption, templateId = 'publication-2a', startPassage, endPassage, userMemos = {}, isBilingualSideBySide = false, audienceLevel = 'adult', selectedInfo }: QtPdfLayoutProps, ref: React.Ref<HTMLDivElement>) {
  const size = PAGE_SIZES[sizeOption] || PAGE_SIZES['A4']
  const cssW = `${size.widthMm}mm`
  const cssH = `${size.heightMm}mm`
  const tmpl = useMemo(() => getTemplate(templateId), [templateId])
  const t = tmpl

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

  const scale = size.widthMm / 210.0

  const pageStyle: React.CSSProperties = {
    width: cssW,
    height: cssH,
    boxSizing: 'border-box',
    background: t.pageBg,
    color: t.textColor,
    fontFamily: t.font,
    position: 'relative',
    padding: `${10 * scale}mm ${12 * scale}mm`,
    pageBreakAfter: 'always',
    overflow: 'hidden',
  }

  const sectionLabel = (text: string, accent: string = t.sectionLabelBorder) => (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: `${6 * scale}px`,
      marginTop: `${7 * scale}px`, marginBottom: `${3 * scale}px`,
      borderBottom: `0.5px solid ${accent}`,
      paddingBottom: `${1.5 * scale}px`,
    }}>
      <span style={{
        fontFamily: t.fontHeading,
        fontSize: `${10 * scale}px`,
        fontWeight: 800,
        color: accent,
        letterSpacing: `${2.5 * scale}px`,
        textTransform: 'uppercase',
      }}>
        {text}
      </span>
    </div>
  )

  const bodyText = (text: string, opts?: { size?: number; indent?: boolean }) => {
    const fs = opts?.size ?? 11.5
    return (
      <div style={{
        fontSize: `${fs * scale}px`,
        lineHeight: t.bodyLineHeight,
        color: t.textColor,
        textAlign: 'justify',
        letterSpacing: '0.01em',
        paddingLeft: opts?.indent ? `${5 * scale}px` : 0,
      }}>
        {text.split('\n').map((l, i) => (
          <div key={i} style={{ marginBottom: `${1.5 * scale}px` }}>
            {l}
          </div>
        ))}
      </div>
    )
  }

  const pageHeader = (dayIdx: number, day: any, verses: any) => (
    <div style={{
      marginBottom: `${6 * scale}px`,
      paddingBottom: `${4 * scale}px`,
      borderBottom: `${0.75 * scale}px solid ${t.accent}`,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: t.accent,
        color: '#ffffff',
        padding: `${3 * scale}px ${7 * scale}px`,
        marginBottom: `${5 * scale}px`,
      }}>
        <div style={{
          fontFamily: t.fontHeading,
          fontSize: `${8.5 * scale}px`,
          fontWeight: 700,
          letterSpacing: `${2.5 * scale}px`,
        }}>
          DAY {dayIdx + 1} · {weekdays[dayIdx]?.label || ''}
        </div>
        <div style={{
          fontFamily: t.fontHeading,
          fontSize: `${7.5 * scale}px`,
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
  )

  const coreVerseBox = (korVerse: string) => {
    if (!korVerse) return null
    const firstSentence = korVerse.split(/[.!?。!?]/)[0]?.trim() || korVerse.slice(0, 60)
    return (
      <div style={{
        marginBottom: `${6 * scale}px`,
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
          marginBottom: `${2 * scale}px`,
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
    )
  }

  const bilingualBible = (korVerse: string, nivVerse: string) => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: `${7 * scale}px`,
      marginBottom: `${5 * scale}px`,
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: t.fontHeading,
          fontSize: `${9 * scale}px`,
          fontWeight: 800,
          color: t.accent,
          letterSpacing: `${2.2 * scale}px`,
          textTransform: 'uppercase',
          marginBottom: `${3 * scale}px`,
          paddingBottom: `${1.5 * scale}px`,
          borderBottom: `0.5px solid ${t.border}`,
        }}>
          한글 · 개역개정
        </div>
        <div style={{
          fontFamily: t.font,
          fontSize: `${11 * scale}px`,
          lineHeight: '1.65',
          color: t.textColor,
          textAlign: 'justify',
          wordBreak: 'keep-all',
        }}>
          {korVerse.split('\n').map((l, i) => (
            <div key={i} style={{ marginBottom: `${2.5 * scale}px` }}>{l}</div>
          ))}
        </div>
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: t.fontHeading,
          fontSize: `${9 * scale}px`,
          fontWeight: 800,
          color: t.accent,
          letterSpacing: `${2.2 * scale}px`,
          textTransform: 'uppercase',
          marginBottom: `${3 * scale}px`,
          paddingBottom: `${1.5 * scale}px`,
          borderBottom: `0.5px solid ${t.border}`,
        }}>
          English · NIV
        </div>
        <div style={{
          fontFamily: "'Georgia', 'Noto Serif', 'Times New Roman', serif",
          fontSize: `${10.5 * scale}px`,
          lineHeight: '1.6',
          color: t.textColor,
          textAlign: 'justify',
          fontStyle: 'italic',
        }}>
          {nivVerse.split('\n').map((l, i) => (
            <div key={i} style={{ marginBottom: `${2.5 * scale}px` }}>{l}</div>
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
          fontSize: `${11 * scale}px`,
          lineHeight: '1.6',
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${8 * scale}px`, marginTop: `${2 * scale}px` }}>
        {original && (
          <div>
            <div style={{
              fontFamily: t.fontHeading, fontSize: `${9 * scale}px`, fontWeight: 800,
              color: t.accent, letterSpacing: `${2 * scale}px`, textTransform: 'uppercase',
              marginBottom: `${2 * scale}px`, paddingBottom: `${1.5 * scale}px`,
              borderBottom: `0.5px solid ${t.border}`,
            }}>
              원어 묵상
            </div>
            <div style={{ fontFamily: t.font, fontSize: `${10.5 * scale}px`, lineHeight: '1.55', color: t.textColor, textAlign: 'justify' }}>
              {original.split('\n').filter(l => l.trim()).slice(0, 3).map((l, i) => (
                <div key={i} style={{ marginBottom: `${2 * scale}px` }}>{l}</div>
              ))}
            </div>
          </div>
        )}
        {english && (
          <div>
            <div style={{
              fontFamily: t.fontHeading, fontSize: `${9 * scale}px`, fontWeight: 800,
              color: t.accent, letterSpacing: `${2 * scale}px`, textTransform: 'uppercase',
              marginBottom: `${2 * scale}px`, paddingBottom: `${1.5 * scale}px`,
              borderBottom: `0.5px solid ${t.border}`,
            }}>
              영어 묵상
            </div>
            <div style={{ fontFamily: t.font, fontSize: `${10.5 * scale}px`, lineHeight: '1.55', color: t.textColor, textAlign: 'justify' }}>
              {english.split('\n').filter(l => l.trim()).slice(0, 3).map((l, i) => (
                <div key={i} style={{ marginBottom: `${2 * scale}px` }}>{l}</div>
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
        padding: `${5 * scale}px ${7 * scale}px`,
        background: t.prayerBoxBg,
        borderLeft: `${1.5 * scale}px solid ${t.accent}`,
        fontFamily: t.font,
        fontSize: `${11 * scale}px`,
        lineHeight: '1.6',
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
    <div style={{ marginTop: `${6 * scale}px` }}>
      <div style={{
        fontFamily: t.fontHeading, fontSize: `${7.5 * scale}px`, fontWeight: 700,
        color: t.textMuted, letterSpacing: `${1.8 * scale}px`, textTransform: 'uppercase',
        marginBottom: `${3 * scale}px`,
      }}>
        오늘 내 마음에 남은 한 문장
      </div>
      {memo ? (
        <div style={{
          fontFamily: t.font, fontSize: `${11.5 * scale}px`, lineHeight: '1.55',
          color: t.textColor, fontStyle: 'italic', minHeight: `${14 * scale}px`,
          paddingBottom: `${2 * scale}px`, borderBottom: `0.5px solid ${t.border}`,
          wordBreak: 'break-all',
        }}>
          {memo}
        </div>
      ) : (
        <div style={{
          height: `${14 * scale}px`,
          borderBottom: `0.5px solid ${t.border}`,
        }} />
      )}
    </div>
  )

  const pageNumber = (num: number, total: number) => (
    <div style={{
      position: 'absolute',
      bottom: `${5 * scale}mm`,
      right: `${13 * scale}mm`,
      fontSize: `${8.5 * scale}px`,
      color: t.pageNumberColor,
      fontFamily: t.fontHeading,
      letterSpacing: `${1.5 * scale}px`,
    }}>
      {num} / {total}
    </div>
  )

  const totalPages = 1 + parsedDays.length * 2
  let pageCounter = 0
  const parsedTitleSize = parseFloat(t.coverTitleSize || '28')

  return (
    <div>
      <div ref={ref}>
        {/* ==================== 표지 ==================== */}
        <div className="qt-page" style={{ ...pageStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          {t.coverOrnament && (
            <div style={{ color: t.accent, fontSize: `${16 * scale}px`, letterSpacing: `${8 * scale}px`, marginBottom: `${14 * scale}px`, opacity: 0.6 }}>
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
          <div style={{ width: `${56 * scale}px`, height: `${1 * scale}px`, background: t.coverAccentLine, margin: `${10 * scale}px auto` }} />
          <div style={{ fontSize: `${12 * scale}px`, color: t.textMuted, lineHeight: '1.9' }}>
            <div style={{ fontFamily: t.fontHeading, fontSize: `${20 * scale}px`, fontWeight: 800, color: t.accent, marginBottom: `${6 * scale}px`, letterSpacing: `${1 * scale}px` }}>
              {form.bibleBook}
            </div>
            <div style={{ fontSize: `${10.5 * scale}px`, color: t.textColor, fontWeight: 600 }}>제{form.weekNumber}주</div>
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

        {/* ==================== 일일 QT 2면 (2-A 스펙) ==================== */}
        {parsedDays.map((day, dayIdx) => {
          const verses = parseBibleVerses(day.passage || '')
          pageCounter = 1 + dayIdx * 2 + 1

          return (
            <div key={dayIdx}>
              {/* ────── Page 1 (앞면): 말씀 중심 ────── */}
              <div className="qt-page" style={pageStyle}>
                {pageHeader(dayIdx, day, verses)}
                {coreVerseBox(verses.korVerse)}
                {bilingualBible(verses.korVerse, verses.nivVerse)}
                {passageOverviewBlock(day.passageOverview)}
                {pageNumber(pageCounter, totalPages)}
              </div>

              {/* ────── Page 2 (뒷면): 관찰/이해/적용 ────── */}
              <div className="qt-page" style={pageStyle}>
                {pageHeader(dayIdx, day, verses)}

                {day.observation && (
                  <div>
                    {sectionLabel('본문 관찰하기')}
                    {bodyText(day.observation)}
                  </div>
                )}

                {day.understanding && (
                  <div>
                    {sectionLabel('본문 이해하기')}
                    {bodyText(day.understanding)}
                  </div>
                )}

                {day.gospel && (
                  <div>
                    {sectionLabel('복음으로 보기')}
                    {bodyText(day.gospel)}
                  </div>
                )}

                {day.application && (
                  <div>
                    {sectionLabel('오늘의 적용')}
                    {bodyText(filterAudienceContent(day.application, audienceLevel))}
                  </div>
                )}

                {wordsSideBySide(day.originalWords, day.englishWords)}

                {prayerBlock(day.prayer)}

                {oneLineMemo(userMemos[dayIdx])}

                {pageNumber(pageCounter + 1, totalPages)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default forwardRef(QtPdfLayout)
