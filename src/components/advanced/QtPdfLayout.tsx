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
  const size = PAGE_SIZES[sizeOption] || PAGE_SIZES['A4Landscape']
  const cssW = `${size.widthMm}mm`
  const cssH = `${size.heightMm}mm`
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

  // 스케일: 짧은 변(210mm) 기준 1.0
  const scale = Math.min(size.widthMm, size.heightMm) / 210.0

  // 페이지 스타일 — 좁은 여백, 풀 활용
  const pageStyle: React.CSSProperties = {
    width: cssW,
    height: cssH,
    boxSizing: 'border-box',
    background: t.pageBg,
    color: t.textColor,
    fontFamily: t.font,
    position: 'relative',
    padding: isLandscape
      ? `${9 * scale}mm ${10 * scale}mm`
      : `${10 * scale}mm ${12 * scale}mm`,
    pageBreakAfter: 'always',
    overflow: 'hidden',
  }

  // ============= 공통 컴포넌트 =============
  const sectionLabel = (text: string) => (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: `${5 * scale}px`,
      marginTop: `${4 * scale}px`, marginBottom: `${2 * scale}px`,
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
      bottom: `${4 * scale}mm`,
      right: `${10 * scale}mm`,
      fontSize: `${8 * scale}px`,
      color: t.pageNumberColor,
      fontFamily: t.fontHeading,
      letterSpacing: `${1.5 * scale}px`,
    }}>
      {num} / {total}
    </div>
  )

  const parsedTitleSize = parseFloat(t.coverTitleSize || '28')

  // ============= A안: 가로 2페이지 (1일 2페이지, 2-A 디자인) =============
  const renderDailyLandscape = (day: any, dayIdx: number) => {
    const verses = parseBibleVerses(day.passage || '')
    const firstSentence = (verses.korVerse || '').split(/[.!?。!?]/)[0]?.trim() || ''
    // Page 1 = cover (1) + dayIdx*2 + 1, Page 2 = +2
    pageCounter = 2 + dayIdx * 2

    // ============= 페이지 헤더 (네이비 풀폭 바) =============
    const landscapeHeader = (subtitle: string) => (
      <div style={{
        marginBottom: `${5 * scale}px`,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: t.accent,
          color: '#ffffff',
          padding: `${3.5 * scale}px ${9 * scale}px`,
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
            opacity: 0.9,
          }}>
            {subtitle}
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: `${8 * scale}px`,
          borderBottom: `${0.75 * scale}px solid ${t.accent}`,
          paddingBottom: `${3 * scale}px`,
        }}>
          <div style={{
            fontFamily: t.fontHeading,
            fontSize: `${20 * scale}px`,
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
      </div>
    )

    return (
      <div key={dayIdx}>
      {/* ══════ Page 1 (앞면): 말씀 중심 ══════ */}
      <div className="qt-page" style={pageStyle}>
        {landscapeHeader(`QT · ${form.bibleBook} · ${form.weekNumber}주`)}

        {/* ═══ 주간 펼침 미니 (7일치 가로 네비게이션) ═══ */}
        <div style={{
          marginBottom: `${5 * scale}px`,
          padding: `${5 * scale}px ${6 * scale}px`,
          background: t.accentLight,
          borderLeft: `${1.5 * scale}px solid ${t.sectionLabelBorder}`,
          borderTop: `0.5px solid ${t.borderLight}`,
          borderRight: `0.5px solid ${t.borderLight}`,
          borderBottom: `0.5px solid ${t.borderLight}`,
        }}>
          {/* 주간 펼침 헤더 */}
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            marginBottom: `${3 * scale}px`,
            paddingBottom: `${1.5 * scale}px`,
            borderBottom: `0.5px solid ${t.sectionLabelBorder}`,
          }}>
            <div style={{
              fontFamily: t.fontHeading,
              fontSize: `${7.5 * scale}px`,
              fontWeight: 800,
              color: t.accent,
              letterSpacing: `${2 * scale}px`,
              textTransform: 'uppercase',
            }}>
              ◆ 주간 펼침 · {form.bibleBook} · 제{form.weekNumber}주
            </div>
            <div style={{
              fontFamily: t.fontHeading,
              fontSize: `${7 * scale}px`,
              fontWeight: 500,
              color: t.textMuted,
              letterSpacing: `${0.5 * scale}px`,
            }}>
              {weekdays[0]?.label} ~ {weekdays[weekdays.length - 1]?.label}
            </div>
          </div>

          {/* 7일 그리드 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: `${2 * scale}px`,
          }}>
            {parsedDays.slice(0, 7).map((d, i) => {
              const dv = parseBibleVerses(d.passage || '')
              const isCurrent = i === dayIdx
              const passageShort = (dv.passageRange || '').split(' ').pop() || ''
              return (
                <div key={i} style={{
                  display: 'flex', flexDirection: 'column',
                  padding: `${3 * scale}px ${2 * scale}px`,
                  background: isCurrent ? t.accent : 'transparent',
                  color: isCurrent ? '#ffffff' : t.textColor,
                  borderTop: isCurrent ? 'none' : `0.5px solid ${t.borderLight}`,
                }}>
                  {/* 요일 + ★ */}
                  <div style={{
                    fontFamily: t.fontHeading,
                    fontSize: `${7.5 * scale}px`,
                    fontWeight: 800,
                    color: isCurrent ? '#ffffff' : t.accent,
                    letterSpacing: `${1.2 * scale}px`,
                    textTransform: 'uppercase',
                    marginBottom: `${1.5 * scale}px`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span>{weekdays[i]?.label || `Day ${i + 1}`}</span>
                    {isCurrent && <span style={{ fontSize: `${8 * scale}px` }}>★</span>}
                  </div>
                  {/* 본문 (짧게) */}
                  {passageShort && (
                    <div style={{
                      fontFamily: t.fontHeading,
                      fontSize: `${7 * scale}px`,
                      fontWeight: 700,
                      color: isCurrent ? '#ffffff' : t.textColor,
                      marginBottom: `${1 * scale}px`,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {passageShort}
                    </div>
                  )}
                  {/* 제목 */}
                  <div style={{
                    fontFamily: t.fontHeading,
                    fontSize: `${7 * scale}px`,
                    fontWeight: 600,
                    color: isCurrent ? '#ffffff' : t.textColor,
                    lineHeight: '1.2',
                    marginBottom: `${2 * scale}px`,
                    height: `${16 * scale}px`,
                    overflow: 'hidden',
                  }}>
                    {d.title || `Day ${i + 1}`}
                  </div>
                  {/* 메모란 */}
                  <div style={{
                    flex: 1,
                    display: 'flex', flexDirection: 'column', gap: `${3 * scale}px`,
                    paddingTop: `${2 * scale}px`,
                    borderTop: isCurrent ? `0.5px solid rgba(255,255,255,0.3)` : `0.5px solid ${t.borderLight}`,
                  }}>
                    {[1, 2].map(line => (
                      <div key={line} style={{
                        borderBottom: isCurrent ? `0.5px solid rgba(255,255,255,0.3)` : `0.5px solid ${t.borderLight}`,
                        height: `${5 * scale}px`,
                      }} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 한/영 성경 좌우 병렬 2단 (55:45) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '55fr 45fr',
          gap: `${8 * scale}px`,
          marginBottom: `${5 * scale}px`,
        }}>
          <div>
            <div style={{
              fontFamily: t.fontHeading,
              fontSize: `${9 * scale}px`,
              fontWeight: 800,
              color: t.accent,
              letterSpacing: `${2.5 * scale}px`,
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
              lineHeight: '1.65',
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
              fontSize: `${9 * scale}px`,
              fontWeight: 800,
              color: t.accent,
              letterSpacing: `${2.5 * scale}px`,
              textTransform: 'uppercase',
              marginBottom: `${2 * scale}px`,
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
              {verses.nivVerse.split('\n').map((l, i) => (
                <div key={i} style={{ marginBottom: `${2 * scale}px` }}>{l}</div>
              ))}
            </div>
          </div>
        </div>

        {/* 본문 한눈에 보기 (하단 풀폭) */}
        {day.passageOverview && (
          <div style={{
            paddingTop: `${4 * scale}px`,
            borderTop: `0.5px solid ${t.border}`,
          }}>
            {sectionLabel('본문 한눈에 보기')}
            {bodyText(
              day.passageOverview.split('\n').filter(l => l.trim()).slice(0, 2).map(l =>
                l.replace(/^[-*·•\s]*\s*(단락\s*요약|문맥\s*위치|오늘의\s*핵심\s*메시지|핵심\s*메시지|요약)\s*[:：]\s*/i, '').trim()
              ).join('\n'),
              11
            )}
          </div>
        )}

        {pageNumber(pageCounter, totalPages)}
      </div>

      {/* ══════ Page 2 (뒷면): 관찰/이해/적용 ══════ */}
      <div className="qt-page" style={pageStyle}>
        {landscapeHeader(`QT · ${form.bibleBook} · ${form.weekNumber}주 · 묵상`)}

        {/* 상단: 관찰 → 이해 → 복음 → 적용 (순차 풀폭) */}
        {day.observation && (
          <div>
            {sectionLabel('본문 관찰하기')}
            {bodyText(day.observation, 11)}
          </div>
        )}
        {day.understanding && (
          <div>
            {sectionLabel('본문 이해하기')}
            {bodyText(day.understanding, 11)}
          </div>
        )}
        {day.gospel && (
          <div>
            {sectionLabel('복음으로 보기')}
            {bodyText(day.gospel, 11)}
          </div>
        )}
        {day.application && (
          <div>
            {sectionLabel('오늘의 적용')}
            {bodyText(filterAudienceContent(day.application, audienceLevel), 11)}
          </div>
        )}

        {/* 하단: 단어 묵상 (원어/영어 2단) + 기도문 + 한 줄 — 카드 분절 없이 연결감 유지 */}
        {(day.originalWords || day.englishWords) && (
          <div>
            {sectionLabel('단어 묵상')}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${8 * scale}px` }}>
              {day.originalWords && (
                <div>
                  <div style={{
                    fontFamily: t.fontHeading,
                    fontSize: `${8.5 * scale}px`,
                    fontWeight: 700,
                    color: t.textMuted,
                    letterSpacing: `${1.8 * scale}px`,
                    textTransform: 'uppercase',
                    marginBottom: `${1.5 * scale}px`,
                  }}>
                    원어
                  </div>
                  {bodyText(
                    day.originalWords.split('\n').filter(l => l.trim()).slice(0, 4).join('\n'),
                    10
                  )}
                </div>
              )}
              {day.englishWords && (
                <div>
                  <div style={{
                    fontFamily: t.fontHeading,
                    fontSize: `${8.5 * scale}px`,
                    fontWeight: 700,
                    color: t.textMuted,
                    letterSpacing: `${1.8 * scale}px`,
                    textTransform: 'uppercase',
                    marginBottom: `${1.5 * scale}px`,
                  }}>
                    영어
                  </div>
                  {bodyText(
                    day.englishWords.split('\n').filter(l => l.trim()).slice(0, 4).join('\n'),
                    10
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {day.prayer && (
          <div>
            {sectionLabel('오늘의 기도')}
            <div style={{
              padding: `${4 * scale}px ${7 * scale}px`,
              background: t.prayerBoxBg,
              borderLeft: `${1.5 * scale}px solid ${t.accent}`,
              fontFamily: t.font,
              fontSize: `${10.5 * scale}px`,
              lineHeight: '1.6',
              color: t.prayerBoxText,
              fontStyle: 'italic',
            }}>
              {day.prayer.split('\n').filter(l => l.trim()).map((l, i) => (
                <div key={i} style={{ marginBottom: `${1.5 * scale}px` }}>{l}</div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div style={{
            fontFamily: t.fontHeading,
            fontSize: `${8.5 * scale}px`,
            fontWeight: 700,
            color: t.textMuted,
            letterSpacing: `${1.8 * scale}px`,
            textTransform: 'uppercase',
            marginBottom: `${3 * scale}px`,
            marginTop: `${2 * scale}px`,
          }}>
            오늘 내 마음에 남은 한 문장
          </div>
          {userMemos[dayIdx] ? (
            <div style={{
              fontFamily: t.font,
              fontSize: `${11 * scale}px`,
              lineHeight: '1.55',
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

        {pageNumber(pageCounter + 1, totalPages)}
      </div>
      </div>
    )
  }

  // ============= A안: 세로 2면 (1일 2페이지, 2-A 디자인 유지) =============
  const renderDailyPortrait = (day: any, dayIdx: number) => {
    const verses = parseBibleVerses(day.passage || '')
    const firstSentence = (verses.korVerse || '').split(/[.!?。!?]/)[0]?.trim() || ''
    pageCounter = 1 + dayIdx * 2 + 1

    return (
      <div key={dayIdx}>
        {/* Page 1: 말씀 중심 */}
        <div className="qt-page" style={pageStyle}>
          {/* 헤더 */}
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
            gap: `${6 * scale}px`,
            marginBottom: `${4 * scale}px`,
          }}>
            <div>
              <div style={{
                fontFamily: t.fontHeading,
                fontSize: `${9 * scale}px`,
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
                fontSize: `${11 * scale}px`,
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
                fontSize: `${9 * scale}px`,
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
                fontSize: `${10.5 * scale}px`,
                lineHeight: '1.55',
                color: t.textColor,
                textAlign: 'justify',
                fontStyle: 'italic',
              }}>
                {verses.nivVerse.split('\n').map((l, i) => (
                  <div key={i} style={{ marginBottom: `${2 * scale}px` }}>{l}</div>
                ))}
              </div>
            </div>
          </div>

          {/* 본문 한눈에 */}
          {day.passageOverview && (
            <div>
              {sectionLabel('본문 한눈에 보기')}
              {bodyText(
                day.passageOverview.split('\n').filter(l => l.trim()).slice(0, 2).map(l =>
                  l.replace(/^[-*·•\s]*\s*(단락\s*요약|문맥\s*위치|오늘의\s*핵심\s*메시지|핵심\s*메시지|요약)\s*[:：]\s*/i, '').trim()
                ).join('\n'),
                10.5
              )}
            </div>
          )}

          {pageNumber(pageCounter, totalPages)}
        </div>

        {/* Page 2: 관찰/이해/적용 */}
        <div className="qt-page" style={pageStyle}>
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
              fontSize: `${15 * scale}px`,
              fontWeight: 800,
              color: t.textColor,
              lineHeight: '1.25',
            }}>
              {day.title || `Day ${dayIdx + 1}`} · {verses.passageRange}
            </div>
          </div>

          {day.observation && (
            <div>
              {sectionLabel('본문 관찰하기')}
              {bodyText(day.observation, 11.5)}
            </div>
          )}
          {day.understanding && (
            <div>
              {sectionLabel('본문 이해하기')}
              {bodyText(day.understanding, 11.5)}
            </div>
          )}
          {day.gospel && (
            <div>
              {sectionLabel('복음으로 보기')}
              {bodyText(day.gospel, 11.5)}
            </div>
          )}
          {day.application && (
            <div>
              {sectionLabel('오늘의 적용')}
              {bodyText(filterAudienceContent(day.application, audienceLevel), 11.5)}
            </div>
          )}

          {/* 단어 묵상 2단 */}
          {(day.originalWords || day.englishWords) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${7 * scale}px`, marginTop: `${3 * scale}px` }}>
              {day.originalWords && (
                <div>
                  {sectionLabel('원어 묵상')}
                  {bodyText(day.originalWords.split('\n').filter(l => l.trim()).slice(0, 4).join('\n'), 10.5)}
                </div>
              )}
              {day.englishWords && (
                <div>
                  {sectionLabel('영어 묵상')}
                  {bodyText(day.englishWords.split('\n').filter(l => l.trim()).slice(0, 4).join('\n'), 10.5)}
                </div>
              )}
            </div>
          )}

          {/* 기도문 */}
          {day.prayer && (
            <div>
              {sectionLabel('오늘의 기도')}
              <div style={{
                marginTop: `${1 * scale}px`,
                padding: `${5 * scale}px ${7 * scale}px`,
                background: t.prayerBoxBg,
                borderLeft: `${1.5 * scale}px solid ${t.accent}`,
                fontFamily: t.font,
                fontSize: `${11 * scale}px`,
                lineHeight: '1.6',
                color: t.prayerBoxText,
                fontStyle: 'italic',
              }}>
                {day.prayer.split('\n').filter(l => l.trim()).map((l, i) => (
                  <div key={i} style={{ marginBottom: `${1.5 * scale}px` }}>{l}</div>
                ))}
              </div>
            </div>
          )}

          {/* 한 줄 기록 */}
          <div style={{ marginTop: `${5 * scale}px` }}>
            <div style={{
              fontFamily: t.fontHeading,
              fontSize: `${8.5 * scale}px`,
              fontWeight: 700,
              color: t.textMuted,
              letterSpacing: `${1.8 * scale}px`,
              textTransform: 'uppercase',
              marginBottom: `${3 * scale}px`,
            }}>
              오늘 내 마음에 남은 한 문장
            </div>
            {userMemos[dayIdx] ? (
              <div style={{
                fontFamily: t.font,
                fontSize: `${11.5 * scale}px`,
                lineHeight: '1.55',
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

          {pageNumber(pageCounter + 1, totalPages)}
        </div>
      </div>
    )
  }

  // ============= 표지 (가로/세로 자동 적응) =============
  const renderCover = () => (
    <div className="qt-page" style={{
      ...pageStyle,
      display: 'flex',
      flexDirection: isLandscape ? 'row' : 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: isLandscape ? `${20 * scale}mm` : pageStyle.padding,
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
        bottom: `${14 * scale}mm`,
        fontSize: `${8 * scale}px`,
        color: t.pageNumberColor,
        letterSpacing: `${2 * scale}px`,
        opacity: 0.7,
      }}>
        bunker.ai.kr · 목회의 모든 순간을 잇다
      </div>
    </div>
  )

  const totalPages = 1 + parsedDays.length * 2  // 1표지 + 1일=2페이지
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
