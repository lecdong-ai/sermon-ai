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

function QtPdfLayout({ form, result, sizeOption, templateId = 'qtland-classic', startPassage, endPassage }: QtPdfLayoutProps, ref: React.Ref<HTMLDivElement>) {
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
    height: cssH,
    boxSizing: 'border-box',
    background: t.pageBg,
    color: t.textColor,
    fontFamily: t.font,
    position: 'relative',
    padding: '14mm 16mm',
    pageBreakAfter: 'always',
    overflow: 'hidden',
  }

  const ribbonLabel = (text: string, iconStr?: string) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      marginTop: '12px',
      marginBottom: '5px',
      padding: '4px 10px 4px 12px',
      background: t.accentLight,
      borderLeft: `4px solid ${t.accent}`,
      borderRadius: '0 4px 4px 0',
      fontSize: '9px',
      fontWeight: 700,
      color: t.accent,
      letterSpacing: '0.5px',
    }}>
      {iconStr && <span style={{ fontSize: '10px' }}>{iconStr}</span>}
      <span>{text}</span>
    </div>
  )

  const bodyText = (text: string, sizeStr?: string) => (
    <div style={{ fontSize: sizeStr || '10.5px', lineHeight: t.bodyLineHeight, color: t.textColor }}>
      {text.split('\n').map((l, i) => (
        <div key={i} style={{ marginBottom: '1px' }}>{l}</div>
      ))}
    </div>
  )

  const bulletText = (text: string, sizeStr?: string) => (
    <div style={{ fontSize: sizeStr || '10px', lineHeight: '1.8', color: t.textColor, paddingLeft: '6px' }}>
      {text.split('\n').map((l, i) => (
        <div key={i} style={{ marginBottom: '1px' }}>{l}</div>
      ))}
    </div>
  )

  const bibleTextBox = (korVerse: string, nivVerse: string) => (
    <>
      {korVerse && (
        <div style={{
          padding: '8px 12px',
          margin: '4px 0',
          background: t.bibleQuoteBg,
          borderLeft: `3px solid ${t.accent}`,
          borderRadius: '0 5px 5px 0',
        }}>
          <div style={{ fontSize: '7px', fontWeight: 700, color: t.accent, letterSpacing: '1.5px', marginBottom: '3px', textTransform: 'uppercase' }}>
            개역개정
          </div>
          <div style={{ fontSize: '10.5px', lineHeight: '1.9', color: t.bibleQuoteText }}>
            {korVerse}
          </div>
        </div>
      )}
      {nivVerse && (
        <div style={{
          padding: '8px 12px',
          margin: '3px 0 6px 0',
          background: t.bibleQuoteBg,
          borderLeft: `3px solid #0d9488`,
          borderRadius: '0 5px 5px 0',
        }}>
          <div style={{ fontSize: '7px', fontWeight: 700, color: '#0d9488', letterSpacing: '1.5px', marginBottom: '3px', textTransform: 'uppercase' }}>
            NIV
          </div>
          <div style={{ fontSize: '10px', lineHeight: '1.85', color: t.bibleQuoteText, fontFamily: "'Georgia', 'Noto Serif', serif" }}>
            {nivVerse}
          </div>
        </div>
      )}
    </>
  )

  const highlightBox = (content: string) => (
    <div style={{
      padding: '9px 13px',
      margin: '4px 0',
      background: t.accentLight,
      borderRadius: '6px',
      border: `1px solid ${t.borderLight}`,
      fontSize: '10px',
      lineHeight: '1.85',
      color: t.textColor,
    }}>
      {content.split('\n').map((l, i) => (
        <div key={i} style={{ marginBottom: '1px' }}>{l}</div>
      ))}
    </div>
  )

  const prayerBox = (content: string) => (
    <div style={{
      padding: '9px 13px',
      margin: '4px 0',
      background: t.prayerBoxBg,
      borderRadius: '6px',
      fontSize: '10.5px',
      lineHeight: '1.85',
      color: t.prayerBoxText,
      fontStyle: 'italic',
    }}>
      {content.split('\n').map((l, i) => (
        <div key={i} style={{ marginBottom: '1px' }}>{l}</div>
      ))}
    </div>
  )

  const wordsColumn = (title: string, content: string, accentColor: string) => content ? (
    <div style={{
      flex: 1,
      padding: '7px 9px',
      background: t.bibleQuoteBg,
      borderRadius: '5px',
      border: `1px solid ${t.borderLight}`,
    }}>
      <div style={{ fontSize: '7px', fontWeight: 700, color: accentColor, letterSpacing: '1.5px', marginBottom: '2px', textTransform: 'uppercase' }}>
        {title}
      </div>
      <div style={{ fontSize: '8px', lineHeight: '1.65', color: t.textColor }}>
        {content.split('\n').map((l, i) => (
          <div key={i} style={{ marginBottom: '1px' }}>{l}</div>
        ))}
      </div>
    </div>
  ) : null

  const pageNumber = (num: number, total: number) => (
    <div style={{
      position: 'absolute',
      bottom: '8mm',
      left: 0,
      right: 0,
      textAlign: 'center',
      fontSize: '7.5px',
      color: t.pageNumberColor,
      fontFamily: t.fontHeading,
      letterSpacing: '1px',
    }}>
      {num} / {total}
    </div>
  )

  const progressDots = (currentIdx: number) => (
    <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
      {Array.from({ length: 6 }, (_, di) => (
        <div key={di} style={{
          width: '5px', height: '5px', borderRadius: '50%',
          background: di <= currentIdx ? t.progressDotActiveBg : t.progressDotBg,
          border: `1px solid ${di <= currentIdx ? t.progressDotActiveBg : t.progressDotBorder}`,
        }} />
      ))}
    </div>
  )

  const totalPages = 1 + parsedDays.length * 2
  let pageCounter = 0

  return (
    <div>
      <div ref={ref}>
        {/* ==================== 표지 ==================== */}
        <div className="qt-page" style={{ ...pageStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          {t.coverOrnament && (
            <div style={{ color: t.accent, fontSize: '20px', letterSpacing: '8px', marginBottom: '20px', opacity: 0.4 }}>
              {t.coverOrnament}
            </div>
          )}
          <div style={{ fontFamily: t.fontHeading, fontSize: t.coverTitleSize, fontWeight: 700, color: t.textColor, letterSpacing: '5px', marginBottom: '4px' }}>
            QT 소책자
          </div>
          <div style={{ fontFamily: t.fontHeading, fontSize: '11px', color: t.coverSubtitleColor, letterSpacing: '2.5px', marginBottom: '20px' }}>
            {form.seriesName || '말씀과 함께하는 큐티'}
          </div>
          <div style={{ width: '60px', height: '2px', background: t.coverAccentLine, margin: '14px auto', borderRadius: '1px' }} />
          <div style={{ fontSize: '12px', color: t.textMuted, lineHeight: '2.2' }}>
            <div style={{ fontFamily: t.fontHeading, fontSize: '20px', fontWeight: 700, color: t.accent, marginBottom: '10px' }}>
              {form.bibleBook}
            </div>
            <div>제{form.weekNumber}주</div>
            {(startPassage || endPassage) && (
              <div style={{ fontSize: '10px', color: t.accent, marginTop: '4px' }}>
                {startPassage}{endPassage ? ` ~ ${endPassage}` : ''}
              </div>
            )}
            <div style={{ fontSize: '9px', color: t.textMuted, marginTop: '6px' }}>
              {weekdays[0]?.label} ~ {weekdays[5]?.label}
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: '16mm', fontSize: '8px', color: t.pageNumberColor, letterSpacing: '2px', opacity: 0.5 }}>
            bunker.ai.kr · 목회의 모든 순간을 잇다
          </div>
        </div>

        {/* ==================== 일일 QT 2면 ==================== */}
        {parsedDays.map((day, dayIdx) => {
          const verses = parseBibleVerses(day.passage || '')
          pageCounter = 1 + dayIdx * 2 + 1

          return (
            <div key={dayIdx}>
              {/* ────── Page 1 (앞면): 제목 + 본문 + 한눈에 + 관찰 ────── */}
              <div className="qt-page" style={pageStyle}>
                {/* 상단 바 */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: '10px', paddingBottom: '6px',
                  borderBottom: `2px solid ${t.accent}`,
                }}>
                  <div style={{ fontFamily: t.fontHeading, fontSize: '9px', fontWeight: 700, color: t.accent, letterSpacing: '1.5px' }}>
                    DAY {dayIdx + 1} · {weekdays[dayIdx]?.label || ''}
                  </div>
                  {progressDots(dayIdx)}
                </div>

                {/* 메인 제목 */}
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: '16px',
                  fontWeight: 700,
                  color: t.textColor,
                  marginBottom: '3px',
                  lineHeight: '1.4',
                }}>
                  {day.title || `Day ${dayIdx + 1}`}
                </div>

                {/* 본문 범위 */}
                {verses.passageRange && (
                  <div style={{ fontSize: '9px', color: t.textMuted, marginBottom: '7px' }}>
                    📖 {verses.passageRange}
                  </div>
                )}

                {/* 성경본문 (개역개정 + NIV) */}
                {bibleTextBox(verses.korVerse, verses.nivVerse)}

                {/* 본문 한눈에 보기 */}
                {day.passageOverview && (
                  <>
                    {ribbonLabel('본문 한눈에 보기', '📖')}
                    {bodyText(day.passageOverview)}
                  </>
                )}

                {/* 본문 관찰하기 */}
                {day.observation && (
                  <>
                    {ribbonLabel('본문 관찰하기', '🔍')}
                    {bulletText(day.observation)}
                  </>
                )}

                {pageNumber(pageCounter, totalPages)}
              </div>

              {/* ────── Page 2 (뒷면): 이해 + 복음 + 적용 + 단어 + 기도 ────── */}
              <div className="qt-page" style={pageStyle}>
                {/* 상단 바 */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: '10px', paddingBottom: '6px',
                  borderBottom: `1.5px solid ${t.border}`,
                }}>
                  <div style={{ fontFamily: t.fontHeading, fontSize: '8px', fontWeight: 600, color: t.textMuted, letterSpacing: '1px' }}>
                    DAY {dayIdx + 1} · {day.title || ''} (계속)
                  </div>
                </div>

                {/* 말씀 이해하기 */}
                {day.understanding && (
                  <>
                    {ribbonLabel('말씀 이해하기', '📖')}
                    {bodyText(day.understanding)}
                  </>
                )}

                {/* 복음으로 보기 */}
                {day.gospel && (
                  <>
                    {ribbonLabel('복음으로 보기', '✝️')}
                    {highlightBox(day.gospel)}
                  </>
                )}

                {/* 나를 비추어 보기 */}
                {day.reflection && (
                  <>
                    {ribbonLabel('나를 비추어 보기')}
                    {bulletText(day.reflection)}
                  </>
                )}

                {/* 오늘의 적용 */}
                {day.application && (
                  <>
                    {ribbonLabel('오늘의 적용', '🎯')}
                    {highlightBox(day.application)}
                  </>
                )}

                {/* 원어 + 영어 핵심단어 (좌우 배치) */}
                {(day.originalWords || day.englishWords) && (
                  <div style={{ display: 'flex', gap: '7px', marginTop: '8px' }}>
                    {wordsColumn('원어 핵심단어', day.originalWords, t.accent)}
                    {wordsColumn('영어 핵심단어', day.englishWords, '#0d9488')}
                  </div>
                )}

                {/* 오늘의 기도 */}
                {day.prayer && (
                  <>
                    {ribbonLabel('오늘의 기도', '🙏')}
                    {prayerBox(day.prayer)}
                  </>
                )}

                {/* 한 줄 기록 영역 */}
                <div style={{ marginTop: '10px', paddingTop: '6px', borderTop: `1px dashed ${t.border}` }}>
                  <div style={{ fontSize: '8px', fontWeight: 600, color: t.textMuted, marginBottom: '4px' }}>
                    📝 오늘 내 마음에 남은 한 문장
                  </div>
                  <div style={{ borderBottom: `1.5px solid ${t.border}`, height: '18px' }} />
                </div>

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
