'use client'

import { forwardRef, useMemo } from 'react'
import { PAGE_SIZES } from '@/lib/qtPdfSizes'
import { getTemplate } from '@/lib/qtTemplates'
import { parseDays } from '@/lib/qtDayParser'
import type { QTFormData, QTResult } from './QtGenerator'

interface QtPdfLayoutProps {
  form: QTFormData
  result: QTResult
  sizeOption: string
  templateId?: string
  startPassage?: string
  endPassage?: string
}

/** 본문에서 개역개정 / NIV 핵심절을 분리 추출 */
function parseBibleVerses(passageText: string) {
  const lines = passageText.split('\n').map(l => l.trim()).filter(Boolean)
  let korVerse = ''
  let nivVerse = ''
  let passageRange = ''
  let readingGuide = ''

  for (const line of lines) {
    if (line.match(/개역개정|한글\s*핵심|핵심절/i) && !line.match(/NIV/i)) {
      korVerse = line.replace(/^[-·•*]\s*/, '').replace(/개역개정\s*(핵심절)?\s*(또는\s*본문\s*범위\s*안내)?\s*[:：]?\s*/i, '').trim()
    } else if (line.match(/NIV/i)) {
      nivVerse = line.replace(/^[-·•*]\s*/, '').replace(/NIV\s*(핵심절)?\s*(또는\s*본문\s*범위\s*안내)?\s*[:：]?\s*/i, '').trim()
    } else if (line.match(/본문\s*범위/i)) {
      passageRange = line.replace(/^[-·•*]\s*/, '').replace(/본문\s*범위\s*[:：]?\s*/i, '').trim()
    } else if (line.match(/본문\s*읽기\s*안내/i)) {
      readingGuide = line.replace(/^[-·•*]\s*/, '').replace(/본문\s*읽기\s*안내\s*[:：]?\s*/i, '').trim()
    }
  }

  return { korVerse, nivVerse, passageRange, readingGuide }
}

function QtPdfLayout({ form, result, sizeOption, templateId = 'warm-modern', startPassage, endPassage }: QtPdfLayoutProps, ref: React.Ref<HTMLDivElement>) {
  const size = PAGE_SIZES[sizeOption] || PAGE_SIZES['A4']
  const cssW = `${size.widthMm}mm`
  const cssH = `${size.heightMm}mm`
  const tmpl = useMemo(() => getTemplate(templateId), [templateId])
  const t = tmpl

  const today = new Date()
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']
  const mon = new Date(today); mon.setDate(mon.getDate() - mon.getDay() + 1)
  const weekdays = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(mon); d.setDate(mon.getDate() + i)
    return { date: d, label: `${d.getMonth() + 1}/${d.getDate()}(${dayNames[d.getDay()]})` }
  })

  const fullManuscript = result.fullManuscript || ''

  const parsedDays = useMemo(() => {
    try {
      const { days } = parseDays(fullManuscript)
      return days
    } catch {
      return []
    }
  }, [fullManuscript])

  const pageStyle: React.CSSProperties = {
    width: cssW,
    minHeight: cssH,
    boxSizing: 'border-box' as const,
    background: t.pageBg,
    color: t.textColor,
    fontFamily: t.font,
    position: 'relative' as const,
    padding: '20mm',
    pageBreakAfter: 'always' as const,
    overflow: 'hidden',
  }

  const sectionLabel = (text: string) => (
    <div style={{
      fontFamily: t.fontHeading,
      fontSize: '9px',
      fontWeight: 700,
      color: t.accent,
      letterSpacing: '2px',
      textTransform: 'uppercase' as const,
      marginTop: '14px',
      marginBottom: '6px',
      paddingBottom: '3px',
      borderBottom: `1.2px solid ${t.sectionLabelBorder}`,
    }}>
      {text}
    </div>
  )

  const bodyText = (text: string) => (
    <div style={{ fontSize: '10.5px', lineHeight: '1.85', color: t.textColor }}>
      {text.split('\n').map((l, i) => (
        <div key={i} style={{ marginBottom: '2px' }}>{l}</div>
      ))}
    </div>
  )

  const bulletText = (text: string) => (
    <div style={{ fontSize: '10px', lineHeight: '1.8', color: t.textColor, paddingLeft: '8px' }}>
      {text.split('\n').map((l, i) => (
        <div key={i} style={{ marginBottom: '2px' }}>{l}</div>
      ))}
    </div>
  )

  const boxContent = (text: string, bg: string, borderColor: string, textColor: string) => (
    <div style={{
      padding: '10px 14px',
      margin: '4px 0',
      borderLeft: `3px solid ${borderColor}`,
      background: bg,
      borderRadius: '0 5px 5px 0',
      fontSize: '10px',
      lineHeight: '1.85',
      color: textColor,
    }}>
      {text.split('\n').map((l, i) => (
        <div key={i} style={{ marginBottom: '1px' }}>{l}</div>
      ))}
    </div>
  )

  const totalPages = 1 + parsedDays.length * 2 // cover + 2 pages per day
  let pageCounter = 0

  const pageNumber = (num: number) => (
    <div style={{
      position: 'absolute',
      bottom: '10mm',
      left: 0,
      right: 0,
      textAlign: 'center',
      fontSize: '8px',
      color: t.pageNumberColor,
      fontFamily: t.fontHeading,
      letterSpacing: '1px',
    }}>
      {num} / {totalPages}
    </div>
  )

  return (
    <div>
      <div ref={ref}>
        {/* ==================== 표지 ==================== */}
        <div className="qt-page" style={{ ...pageStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          {t.coverOrnament && (
            <div style={{ color: t.accent, fontSize: '22px', letterSpacing: '10px', marginBottom: '24px', opacity: 0.5 }}>
              {t.coverOrnament}
            </div>
          )}
          <div style={{ fontFamily: t.fontHeading, fontSize: t.coverTitleSize, fontWeight: 700, color: t.textColor, letterSpacing: '6px', marginBottom: '4px' }}>
            QT 소책자
          </div>
          <div style={{ fontFamily: t.fontHeading, fontSize: '11px', color: t.coverSubtitleColor, letterSpacing: '3px', marginBottom: '24px' }}>
            {form.seriesName || '말씀과 함께하는 큐티'}
          </div>
          <div style={{ width: '70px', height: '2px', background: t.coverAccentLine, margin: '16px auto', borderRadius: '1px' }} />
          <div style={{ fontSize: '13px', color: t.textMuted, lineHeight: '2.2' }}>
            <div style={{ fontFamily: t.fontHeading, fontSize: '20px', fontWeight: 700, color: t.accent, marginBottom: '12px' }}>
              {form.bibleBook}
            </div>
            <div>제{form.weekNumber}주</div>
            {(startPassage || endPassage) && (
              <div style={{ fontSize: '11px', color: t.accent, marginTop: '4px' }}>
                {startPassage}{endPassage ? ` ~ ${endPassage}` : ''}
              </div>
            )}
            <div style={{ fontSize: '10px', color: t.textMuted, marginTop: '6px' }}>
              {weekdays[0]?.label} ~ {weekdays[5]?.label}
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: '20mm', fontSize: '8.5px', color: t.pageNumberColor, letterSpacing: '2px', opacity: 0.6 }}>
            bunker.ai.kr · 목회의 모든 순간을 잇다
          </div>
        </div>

        {/* ==================== 일일 QT 페이지 (각 2면) ==================== */}
        {parsedDays.map((day, dayIdx) => {
          const verses = parseBibleVerses(day.passage || '')
          pageCounter = 1 + dayIdx * 2 + 1

          return (
            <div key={dayIdx}>
              {/* ────── 앞면 (Page A): 본문 + 해설 ────── */}
              <div className="qt-page" style={pageStyle}>
                {/* 상단 헤더 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '8px', borderBottom: `1.5px solid ${t.border}` }}>
                  <div style={{ fontFamily: t.fontHeading, fontSize: '10px', fontWeight: 600, color: t.accent, letterSpacing: '1.5px' }}>
                    DAY {dayIdx + 1} · {weekdays[dayIdx]?.label || ''}
                  </div>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {Array.from({ length: 6 }, (_, di) => (
                      <div key={di} style={{
                        width: '5px', height: '5px', borderRadius: '50%',
                        background: di <= dayIdx ? t.progressDotActiveBg : t.progressDotBg,
                        border: `1px solid ${di <= dayIdx ? t.progressDotActiveBg : t.progressDotBorder}`,
                      }} />
                    ))}
                  </div>
                </div>

                {/* 제목 */}
                <div style={{ fontFamily: t.fontHeading, fontSize: '14px', fontWeight: 700, color: t.textColor, marginBottom: '4px' }}>
                  {day.title || `Day ${dayIdx + 1}`}
                </div>
                {verses.passageRange && (
                  <div style={{ fontSize: '10px', color: t.textMuted, marginBottom: '10px' }}>
                    📖 {verses.passageRange}
                  </div>
                )}

                {/* 개역개정 성경 본문 */}
                {verses.korVerse && (
                  <div style={{
                    padding: '10px 14px',
                    margin: '6px 0',
                    background: t.bibleQuoteBg,
                    borderLeft: `3px solid ${t.bibleQuoteBorder}`,
                    borderRadius: '0 6px 6px 0',
                  }}>
                    <div style={{ fontSize: '8px', fontWeight: 700, color: t.accent, letterSpacing: '1.5px', marginBottom: '4px', textTransform: 'uppercase' as const }}>
                      개역개정
                    </div>
                    <div style={{ fontSize: '10.5px', lineHeight: '1.9', color: t.bibleQuoteText, fontStyle: 'italic' }}>
                      {verses.korVerse}
                    </div>
                  </div>
                )}

                {/* NIV 영어 성경 본문 */}
                {verses.nivVerse && (
                  <div style={{
                    padding: '10px 14px',
                    margin: '4px 0 8px 0',
                    background: t.bibleQuoteBg,
                    borderLeft: `3px solid ${t.accent}`,
                    borderRadius: '0 6px 6px 0',
                  }}>
                    <div style={{ fontSize: '8px', fontWeight: 700, color: t.accent, letterSpacing: '1.5px', marginBottom: '4px', textTransform: 'uppercase' as const }}>
                      NIV
                    </div>
                    <div style={{ fontSize: '10px', lineHeight: '1.85', color: t.bibleQuoteText, fontFamily: "'Georgia', serif" }}>
                      {verses.nivVerse}
                    </div>
                  </div>
                )}

                {/* 본문 한눈에 보기 */}
                {day.passageOverview && (
                  <>
                    {sectionLabel('본문 한눈에 보기')}
                    {bodyText(day.passageOverview)}
                  </>
                )}

                {/* 천천히 읽기 */}
                {day.slowReading && (
                  <>
                    {sectionLabel('천천히 읽기')}
                    {bulletText(day.slowReading)}
                  </>
                )}

                {/* 본문 관찰하기 */}
                {day.observation && (
                  <>
                    {sectionLabel('본문 관찰하기')}
                    {bulletText(day.observation)}
                  </>
                )}

                {/* 말씀 이해하기 */}
                {day.understanding && (
                  <>
                    {sectionLabel('말씀 이해하기')}
                    {bodyText(day.understanding)}
                  </>
                )}

                {pageNumber(pageCounter)}
              </div>

              {/* ────── 뒷면 (Page B): 복음 + 적용 + 기도 ────── */}
              <div className="qt-page" style={pageStyle}>
                {/* 상단 헤더 (연속감) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '8px', borderBottom: `1px solid ${t.borderLight}` }}>
                  <div style={{ fontFamily: t.fontHeading, fontSize: '9px', fontWeight: 600, color: t.textMuted, letterSpacing: '1px' }}>
                    DAY {dayIdx + 1} · {day.title || ''} (계속)
                  </div>
                </div>

                {/* 복음으로 보기 */}
                {day.gospel && (
                  <>
                    {sectionLabel('복음으로 보기')}
                    <div style={{
                      padding: '10px 14px',
                      margin: '4px 0',
                      background: t.accentLight,
                      borderRadius: '6px',
                      border: `1px solid ${t.borderLight}`,
                      fontSize: '10.5px',
                      lineHeight: '1.85',
                      color: t.textColor,
                    }}>
                      {day.gospel.split('\n').map((l, i) => (
                        <div key={i} style={{ marginBottom: '2px' }}>{l}</div>
                      ))}
                    </div>
                  </>
                )}

                {/* 나를 비추어 보기 */}
                {day.reflection && (
                  <>
                    {sectionLabel('나를 비추어 보기')}
                    {bulletText(day.reflection)}
                  </>
                )}

                {/* 오늘의 적용 */}
                {day.application && (
                  <>
                    {sectionLabel('오늘의 적용')}
                    <div style={{
                      padding: '10px 14px',
                      margin: '4px 0',
                      background: t.accentLight,
                      borderRadius: '6px',
                      border: `1px solid ${t.borderLight}`,
                      fontSize: '10.5px',
                      lineHeight: '1.85',
                      color: t.textColor,
                    }}>
                      {day.application.split('\n').map((l, i) => (
                        <div key={i} style={{ marginBottom: '2px' }}>{l}</div>
                      ))}
                    </div>
                  </>
                )}

                {/* 원어 + 영어 핵심단어 (보조 박스) */}
                {(day.originalWords || day.englishWords) && (
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '10px',
                  }}>
                    {day.originalWords && (
                      <div style={{
                        flex: 1,
                        padding: '8px 10px',
                        background: t.bibleQuoteBg,
                        borderRadius: '6px',
                        border: `1px solid ${t.borderLight}`,
                      }}>
                        <div style={{ fontSize: '7.5px', fontWeight: 700, color: t.accent, letterSpacing: '1.5px', marginBottom: '3px', textTransform: 'uppercase' as const }}>
                          원어 핵심
                        </div>
                        <div style={{ fontSize: '9px', lineHeight: '1.7', color: t.textColor }}>
                          {day.originalWords.split('\n').map((l, i) => (
                            <div key={i} style={{ marginBottom: '1px' }}>{l}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    {day.englishWords && (
                      <div style={{
                        flex: 1,
                        padding: '8px 10px',
                        background: t.bibleQuoteBg,
                        borderRadius: '6px',
                        border: `1px solid ${t.borderLight}`,
                      }}>
                        <div style={{ fontSize: '7.5px', fontWeight: 700, color: t.accent, letterSpacing: '1.5px', marginBottom: '3px', textTransform: 'uppercase' as const }}>
                          영어 핵심
                        </div>
                        <div style={{ fontSize: '9px', lineHeight: '1.7', color: t.textColor }}>
                          {day.englishWords.split('\n').map((l, i) => (
                            <div key={i} style={{ marginBottom: '1px' }}>{l}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 영어로 붙드는 말씀 */}
                {day.englishVerse && (
                  <>
                    {sectionLabel('영어로 붙드는 말씀')}
                    {boxContent(day.englishVerse, t.bibleQuoteBg, t.accent, t.bibleQuoteText)}
                  </>
                )}

                {/* 공동체 연결 */}
                {day.community && (
                  <>
                    {sectionLabel('공동체 연결')}
                    {bulletText(day.community)}
                  </>
                )}

                {/* 오늘의 기도 */}
                {day.prayer && (
                  <>
                    {sectionLabel('오늘의 기도')}
                    <div style={{
                      padding: '10px 14px',
                      margin: '4px 0',
                      background: t.prayerBoxBg,
                      borderRadius: '6px',
                      fontSize: '10.5px',
                      lineHeight: '1.85',
                      color: t.prayerBoxText,
                      fontStyle: 'italic',
                    }}>
                      {day.prayer.split('\n').map((l, i) => (
                        <div key={i} style={{ marginBottom: '2px' }}>{l}</div>
                      ))}
                    </div>
                  </>
                )}

                {/* 한 줄 기록 */}
                <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: `1px dashed ${t.border}` }}>
                  <div style={{ fontSize: '9px', fontWeight: 600, color: t.textMuted, marginBottom: '6px' }}>
                    📝 오늘 내 마음에 남은 한 문장
                  </div>
                  <div style={{ borderBottom: `1.5px solid ${t.border}`, height: '20px' }} />
                </div>

                {/* 인도자 메모 (작게) */}
                {day.leaderGuide && (
                  <div style={{
                    marginTop: '10px',
                    padding: '6px 10px',
                    background: t.bibleQuoteBg,
                    borderRadius: '4px',
                    fontSize: '8px',
                    lineHeight: '1.6',
                    color: t.textMuted,
                  }}>
                    <span style={{ fontWeight: 700, color: t.accent, letterSpacing: '1px', fontSize: '7px' }}>인도자 메모 </span>
                    {day.leaderGuide.split('\n').slice(0, 3).map((l, i) => (
                      <span key={i}>{l} </span>
                    ))}
                  </div>
                )}

                {pageNumber(pageCounter + 1)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default forwardRef(QtPdfLayout)
