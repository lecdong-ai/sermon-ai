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

// 회중별 묵상 필터링 헬퍼 (QtDayCard와 동일 로직)
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

function QtPdfLayout({ form, result, sizeOption, templateId = 'qtland-classic', startPassage, endPassage, userMemos = {}, isBilingualSideBySide = false, audienceLevel = 'adult', selectedInfo }: QtPdfLayoutProps, ref: React.Ref<HTMLDivElement>) {
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

  // 날짜 라벨: parsedDays.length 기준, 일요일 제외 자동 감지
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
    // 월~토(일요일 제외) 일수와 일치하면 주말 제외 모드
    if (dayCount === getWeekdayCountInMonth(form.startDate)) {
      const labels = getWeekdayDateLabels(form.startDate)
      return labels.map(label => ({ date: new Date(), label }))
    }
    const list = getFormattedDateList(form.startDate, dayCount)
    if (list.length > 0) return list.map(label => ({ date: new Date(), label }))
    return []
  }, [form.startDate, parsedDays.length])

  // 가로폭 기준 동적 스케일 팩터 산출 (A4=210mm 기준)
  const scale = size.widthMm / 210.0

  const pageStyle: React.CSSProperties = {
    width: cssW,
    height: cssH,
    boxSizing: 'border-box',
    background: t.pageBg,
    color: t.textColor,
    fontFamily: t.font,
    position: 'relative',
    padding: `${12 * scale}mm ${14 * scale}mm`,
    pageBreakAfter: 'always',
    overflow: 'hidden',
  }

  const ribbonLabel = (text: string, iconStr?: string) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: `${4 * scale}px`,
      marginTop: `${10 * scale}px`,
      marginBottom: `${4 * scale}px`,
      padding: `${3 * scale}px ${8 * scale}px ${3 * scale}px ${10 * scale}px`,
      background: t.accentLight,
      borderLeft: `${3 * scale}px solid ${t.accent}`,
      borderRadius: `0 ${4 * scale}px ${4 * scale}px 0`,
      fontSize: `${8.5 * scale}px`,
      fontWeight: 700,
      color: t.accent,
      letterSpacing: '0.5px',
    }}>
      {iconStr && <span style={{ fontSize: `${9 * scale}px` }}>{iconStr}</span>}
      <span>{text}</span>
    </div>
  )

  const bodyText = (text: string, sizeStr?: string) => {
    const sizeVal = parseFloat(sizeStr || '10.5')
    return (
      <div style={{ fontSize: `${sizeVal * scale}px`, lineHeight: t.bodyLineHeight, color: t.textColor, textAlign: 'justify' }}>
        {text.split('\n').map((l, i) => (
          <div key={i} style={{ marginBottom: '1.5px' }}>{l}</div>
        ))}
      </div>
    )
  }

  const bulletText = (text: string, sizeStr?: string) => {
    const sizeVal = parseFloat(sizeStr || '9.5')
    return (
      <div style={{ fontSize: `${sizeVal * scale}px`, lineHeight: '1.8', color: t.textColor, paddingLeft: `${5 * scale}px`, textAlign: 'justify' }}>
        {text.split('\n').map((l, i) => (
          <div key={i} style={{ marginBottom: '1.5px' }}>{l}</div>
        ))}
      </div>
    )
  }

  const bibleTextBox = (korVerse: string, nivVerse: string) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${4 * scale}px`, margin: `${4 * scale}px 0` }}>
      {korVerse && (
        <div style={{
          padding: `${6 * scale}px ${10 * scale}px`,
          background: t.bibleQuoteBg,
          borderLeft: `${3 * scale}px solid ${t.accent}`,
          borderRadius: `0 ${6 * scale}px ${6 * scale}px 0`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.01)',
        }}>
          <div style={{ fontSize: `${6.5 * scale}px`, fontWeight: 800, color: t.accent, letterSpacing: '1.2px', marginBottom: `${2 * scale}px`, textTransform: 'uppercase' }}>
            개역개정
          </div>
          <div style={{ fontSize: `${9.5 * scale}px`, lineHeight: '1.75', color: t.bibleQuoteText, fontWeight: 500 }}>
            {korVerse}
          </div>
        </div>
      )}
      {nivVerse && (
        <div style={{
          padding: `${6 * scale}px ${10 * scale}px`,
          background: t.bibleQuoteBg,
          borderLeft: `${3 * scale}px solid #0d9488`,
          borderRadius: `0 ${6 * scale}px ${6 * scale}px 0`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.01)',
        }}>
          <div style={{ fontSize: `${6.5 * scale}px`, fontWeight: 800, color: '#0d9488', letterSpacing: '1.2px', marginBottom: `${2 * scale}px`, textTransform: 'uppercase' }}>
            NIV
          </div>
          <div style={{ fontSize: `${9 * scale}px`, lineHeight: '1.7', color: t.bibleQuoteText, fontFamily: "'Georgia', 'Noto Serif', serif" }}>
            {nivVerse}
          </div>
        </div>
      )}
    </div>
  )

  const highlightBox = (content: string) => (
    <div style={{
      padding: `${8 * scale}px ${12 * scale}px`,
      margin: `${4 * scale}px 0`,
      background: t.accentLight,
      borderRadius: `${6 * scale}px`,
      border: `1px solid ${t.borderLight}`,
      fontSize: `${9 * scale}px`,
      lineHeight: '1.8',
      color: t.textColor,
      boxShadow: '0 1px 4px rgba(0,0,0,0.01)',
    }}>
      {content.split('\n').map((l, i) => (
        <div key={i} style={{ marginBottom: '1px' }}>{l}</div>
      ))}
    </div>
  )

  const prayerBox = (content: string) => (
    <div style={{
      padding: `${8 * scale}px ${12 * scale}px`,
      margin: `${4 * scale}px 0`,
      background: t.prayerBoxBg,
      borderRadius: `${6 * scale}px`,
      fontSize: `${9.5 * scale}px`,
      lineHeight: '1.8',
      color: t.prayerBoxText,
      fontStyle: 'italic',
      boxShadow: '0 1px 4px rgba(0,0,0,0.01)',
    }}>
      {content.split('\n').map((l, i) => (
        <div key={i} style={{ marginBottom: '1px' }}>{l}</div>
      ))}
    </div>
  )

  const wordsColumn = (title: string, content: string, accentColor: string) => content ? (
    <div style={{
      flex: 1,
      padding: `${6 * scale}px ${8 * scale}px`,
      background: t.bibleQuoteBg,
      borderRadius: `${5 * scale}px`,
      border: `1px solid ${t.borderLight}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.01)',
    }}>
      <div style={{ fontSize: `${6.5 * scale}px`, fontWeight: 800, color: accentColor, letterSpacing: '1.2px', marginBottom: `${2 * scale}px`, textTransform: 'uppercase' }}>
        {title}
      </div>
      <div style={{ fontSize: `${7.5 * scale}px`, lineHeight: '1.6', color: t.textColor }}>
        {content.split('\n').map((l, i) => (
          <div key={i} style={{ marginBottom: '1px' }}>{l}</div>
        ))}
      </div>
    </div>
  ) : null

  const pageNumber = (num: number, total: number) => (
    <div style={{
      position: 'absolute',
      bottom: `${6 * scale}mm`,
      left: 0,
      right: 0,
      textAlign: 'center',
      fontSize: `${7 * scale}px`,
      color: t.pageNumberColor,
      fontFamily: t.fontHeading,
      letterSpacing: '1px',
      opacity: 0.8,
    }}>
      {num} / {total}
    </div>
  )

  const progressDots = (currentIdx: number) => (
    <div style={{ display: 'flex', gap: `${3 * scale}px`, alignItems: 'center' }}>
      {Array.from({ length: parsedDays.length || 6 }, (_, di) => (
        <div key={di} style={{
          width: `${4.5 * scale}px`, height: `${4.5 * scale}px`, borderRadius: '50%',
          background: di <= currentIdx ? t.progressDotActiveBg : t.progressDotBg,
          border: `1px solid ${di <= currentIdx ? t.progressDotActiveBg : t.progressDotBorder}`,
        }} />
      ))}
    </div>
  )

  const totalPages = 1 + parsedDays.length * 2
  let pageCounter = 0

  // coverTitleSize 파싱
  const parsedTitleSize = parseFloat(t.coverTitleSize || '28')

  return (
    <div>
      <div ref={ref}>
        {/* ==================== 표지 ==================== */}
        <div className="qt-page" style={{ ...pageStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          {t.coverOrnament && (
            <div style={{ color: t.accent, fontSize: `${20 * scale}px`, letterSpacing: `${8 * scale}px`, marginBottom: `${16 * scale}px`, opacity: 0.4 }}>
              {t.coverOrnament}
            </div>
          )}
          {selectedInfo?.isRecommended && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: `${4 * scale}px`,
              padding: `${4 * scale}px ${10 * scale}px`, marginBottom: `${14 * scale}px`,
              borderRadius: `${12 * scale}px`,
              background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(168,85,247,0.18))',
              border: `${1 * scale}px solid rgba(99,102,241,0.5)`,
              fontFamily: t.fontHeading, fontSize: `${9 * scale}px`, fontWeight: 700,
              color: t.accent, letterSpacing: `${2 * scale}px`, textTransform: 'uppercase',
            }}>
              <span style={{ fontSize: `${10 * scale}px` }}>✨</span>
              AI 추천 본문
            </div>
          )}
          <div style={{ fontFamily: t.fontHeading, fontSize: `${parsedTitleSize * scale}px`, fontWeight: 700, color: t.textColor, letterSpacing: `${5 * scale}px`, marginBottom: `${4 * scale}px` }}>
            {selectedInfo?.isRecommended ? '오늘의 큐티' : 'QT 소책자'}
          </div>
          <div style={{ fontFamily: t.fontHeading, fontSize: `${11 * scale}px`, color: t.coverSubtitleColor, letterSpacing: `${2.5 * scale}px`, marginBottom: `${18 * scale}px` }}>
            {form.seriesName || '말씀과 함께하는 큐티'}
          </div>
          <div style={{ width: `${60 * scale}px`, height: `${2 * scale}px`, background: t.coverAccentLine, margin: `${12 * scale}px auto`, borderRadius: `${1 * scale}px` }} />
          <div style={{ fontSize: `${12 * scale}px`, color: t.textMuted, lineHeight: '2.0' }}>
            <div style={{ fontFamily: t.fontHeading, fontSize: `${20 * scale}px`, fontWeight: 700, color: t.accent, marginBottom: `${8 * scale}px` }}>
              {form.bibleBook}
            </div>
            <div>제{form.weekNumber}주</div>
            {(startPassage || endPassage) && (
              <div style={{ fontSize: `${9.5 * scale}px`, color: t.accent, marginTop: `${4 * scale}px` }}>
                {startPassage}{endPassage ? ` ~ ${endPassage}` : ''}
              </div>
            )}
            <div style={{ fontSize: `${8.5 * scale}px`, color: t.textMuted, marginTop: `${6 * scale}px` }}>
              {weekdays[0]?.label} ~ {weekdays[weekdays.length - 1]?.label}
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: `${16 * scale}mm`, fontSize: `${8 * scale}px`, color: t.pageNumberColor, letterSpacing: `${2 * scale}px`, opacity: 0.5 }}>
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
                  marginBottom: `${8 * scale}px`, paddingBottom: `${5 * scale}px`,
                  borderBottom: `${2 * scale}px solid ${t.accent}`,
                }}>
                  <div style={{ fontFamily: t.fontHeading, fontSize: `${9 * scale}px`, fontWeight: 700, color: t.accent, letterSpacing: `${1.5 * scale}px` }}>
                    DAY {dayIdx + 1} · {weekdays[dayIdx]?.label || ''}
                  </div>
                  {progressDots(dayIdx)}
                </div>

                {/* 메인 제목 */}
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${15 * scale}px`,
                  fontWeight: 700,
                  color: t.textColor,
                  marginBottom: `${3 * scale}px`,
                  lineHeight: '1.35',
                }}>
                  {day.title || `Day ${dayIdx + 1}`}
                </div>

                {/* 본문 범위 */}
                {verses.passageRange && (
                  <div style={{ fontSize: `${8.5 * scale}px`, color: t.textMuted, marginBottom: `${6 * scale}px` }}>
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
                  marginBottom: `${8 * scale}px`, paddingBottom: `${5 * scale}px`,
                  borderBottom: `${1.5 * scale}px solid ${t.border}`,
                }}>
                  <div style={{ fontFamily: t.fontHeading, fontSize: `${8 * scale}px`, fontWeight: 600, color: t.textMuted, letterSpacing: '1px' }}>
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
                    {bulletText(filterAudienceContent(day.reflection, audienceLevel))}
                  </>
                )}

                {/* 오늘의 적용 */}
                {day.application && (
                  <>
                    {ribbonLabel('오늘의 적용', '🎯')}
                    {highlightBox(filterAudienceContent(day.application, audienceLevel))}
                  </>
                )}

                {/* 원어 + 영어 핵심단어 (좌우 배치) */}
                {(day.originalWords || day.englishWords) && (
                  <div style={{ display: 'flex', gap: `${7 * scale}px`, marginTop: `${6 * scale}px` }}>
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
                <div style={{ marginTop: `${8 * scale}px`, paddingTop: `${5 * scale}px`, borderTop: `${1 * scale}px dashed ${t.border}` }}>
                  <div style={{ fontSize: `${7.5 * scale}px`, fontWeight: 600, color: t.textMuted, marginBottom: `${3 * scale}px` }}>
                    📝 오늘 내 마음에 남은 한 문장
                  </div>
                  {userMemos[dayIdx] ? (
                    <div style={{
                      fontSize: `${9 * scale}px`,
                      color: t.textColor,
                      fontStyle: 'italic',
                      minHeight: `${16 * scale}px`,
                      padding: `${2 * scale}px ${4 * scale}px`,
                      borderBottom: `${1 * scale}px solid ${t.border}`,
                      wordBreak: 'break-all'
                    }}>
                      {userMemos[dayIdx]}
                    </div>
                  ) : (
                    <div style={{ borderBottom: `${1.5 * scale}px solid ${t.border}`, height: `${16 * scale}px` }} />
                  )}
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
