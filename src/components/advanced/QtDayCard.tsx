'use client'

import type { ParsedDay } from '@/lib/qtDayParser'
import type { QtTemplate } from '@/lib/qtTemplates'
import { renderSmartLine, preprocessSmartText } from '@/lib/qtSmartLine'

interface StudyRef {
  background?: string
  keyWords?: string
  commentary?: string
  parallelPassages?: string
}

interface QtDayCardProps {
  day: ParsedDay
  dayNumber: number
  dateLabel: string
  variant: 'web' | 'pdf'
  template?: QtTemplate
  studyRef?: StudyRef
  isBilingualSideBySide?: boolean
  editMode?: boolean
  edits?: Record<string, string>
  onSectionEdit?: (sectionKey: string, value: string) => void
  hiddenSections?: string[]
}

function splitPassageText(passageRaw: string) {
  if (!passageRaw) return { kr: '', en: '' }
  const indexEng = passageRaw.search(/(?:KJV\s*전체\s*본문|NIV\s*전체\s*본문|영어\s*본문)/i)
  if (indexEng === -1) {
    return { kr: passageRaw.replace(/개역개정\s*전체\s*본문:?/g, '').trim(), en: '' }
  }
  let krPart = passageRaw.substring(0, indexEng)
  let enPart = passageRaw.substring(indexEng)
  krPart = krPart.replace(/(?:##\s*개역개정\s*전체\s*본문|개역개정\s*전체\s*본문|#\s*개역개정\s*본문):?/gi, '').trim()
  enPart = enPart.replace(/(?:##\s*KJV\s*전체\s*본문|##\s*NIV\s*전체\s*본문|KJV\s*전체\s*본문|NIV\s*전체\s*본문|#\s*KJV\s*본문|#\s*NIV\s*본문):?/gi, '').trim()
  return { kr: krPart, en: enPart }
}

export default function QtDayCard({ 
  day, 
  dayNumber, 
  dateLabel, 
  variant, 
  template, 
  studyRef,
  isBilingualSideBySide = false,
  editMode = false,
  edits = {},
  onSectionEdit,
  hiddenSections = [],
}: QtDayCardProps) {
  const isPdf = variant === 'pdf'
  const t = template
  const hiddenSet = new Set(hiddenSections)

  const section = (label: string, content: string, style: 'default' | 'box' | 'prayer' | 'accent' | 'question' = 'default', sectionKey?: string) => {
    if (sectionKey && hiddenSet.has(sectionKey)) return null
    const displayContent = (sectionKey && edits[sectionKey] !== undefined) ? edits[sectionKey] : content
    if (!editMode && !displayContent) return null

    const labelEl = (
      <div style={{ fontFamily: t!.fontHeading, fontSize: '10.5px', fontWeight: 600, color: t!.accent, letterSpacing: '2.5px', marginTop: '18px', marginBottom: '8px', paddingBottom: '4px', borderBottom: `1px solid ${t!.sectionLabelBorder}`, textTransform: 'uppercase' as const }}>
        {label}
      </div>
    )

    if (editMode && sectionKey) {
      return (
        <div>
          {labelEl}
          <textarea
            value={displayContent}
            onChange={e => onSectionEdit?.(sectionKey, e.target.value)}
            rows={Math.max(3, displayContent.split('\n').length)}
            className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3 text-[12px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all resize-none font-sans"
          />
        </div>
      )
    }

    const contentEl = (() => {
      const base: React.CSSProperties = { fontSize: t!.bodySize, lineHeight: t!.bodyLineHeight }
      if (style === 'box') {
        return (
          <div style={{ ...base, color: t!.bibleQuoteText, padding: '12px 16px', margin: '6px 0', borderLeft: `3px solid ${t!.bibleQuoteBorder}`, background: t!.bibleQuoteBg, borderRadius: '0 6px 6px 0' }}>
            {preprocessSmartText(displayContent).map((l, i) => renderSmartLine(l, i, t!.accent, '2px'))}
          </div>
        )
      }
      if (style === 'prayer') {
        return (
          <div style={{ ...base, background: t!.prayerBoxBg, borderRadius: '8px', padding: '14px 18px', marginTop: '6px', color: t!.prayerBoxText }}>
            {preprocessSmartText(displayContent).map((l, i) => renderSmartLine(l, i, t!.accent, '2px'))}
          </div>
        )
      }
      if (style === 'accent') {
        return (
          <div style={{ ...base, color: t!.textColor, padding: '10px 14px', margin: '6px 0', background: t!.accentLight, borderRadius: '6px', border: `1px solid ${t!.borderLight}` }}>
            {preprocessSmartText(displayContent).map((l, i) => renderSmartLine(l, i, t!.accent, '2px'))}
          </div>
        )
      }
      return (
        <div style={{ ...base, color: t!.textColor }}>
          {preprocessSmartText(displayContent).map((l, i) => renderSmartLine(l, i, t!.accent, '4px'))}
        </div>
      )
    })()

    return (
      <div>
        {labelEl}
        {contentEl}
      </div>
    )
  }

  const renderPassage = () => {
    const { kr, en } = splitPassageText(day.passage)
    
    if (!isBilingualSideBySide || !en) {
      return section('오늘의 본문', day.passage, 'box')
    }

    const labelEl = (
      <div style={{ fontFamily: t!.fontHeading, fontSize: '10.5px', fontWeight: 600, color: t!.accent, letterSpacing: '2.5px', marginTop: '18px', marginBottom: '8px', paddingBottom: '4px', borderBottom: `1px solid ${t!.sectionLabelBorder}`, textTransform: 'uppercase' as const }}>
        오늘의 본문 (한영 대조)
      </div>
    )

    return (
      <div>
        {labelEl}
        <div style={{ display: 'flex', gap: '16px', margin: '6px 0', flexDirection: 'column' }} className="md:flex-row">
          <div style={{ flex: 1, color: t!.bibleQuoteText, padding: '12px 14px', borderLeft: `3px solid ${t!.bibleQuoteBorder}`, background: t!.bibleQuoteBg, borderRadius: '0 6px 6px 0', fontSize: '9.5px', lineHeight: '1.4' }}>
            <div style={{ fontWeight: 'bold', fontSize: '8.5px', color: t!.accent, marginBottom: '6px' }}>개역개정</div>
            {kr.split('\n').map((l, i) => <div key={i} style={{ marginBottom: '2.5px' }}>{l}</div>)}
          </div>
          <div style={{ flex: 1, color: t!.bibleQuoteText, padding: '12px 14px', borderLeft: `3px solid ${t!.bibleQuoteBorder}`, background: t!.bibleQuoteBg, borderRadius: '0 6px 6px 0', fontSize: '9px', lineHeight: '1.4', fontStyle: 'italic' }}>
            <div style={{ fontWeight: 'bold', fontSize: '8.5px', color: t!.accent, marginBottom: '6px', fontStyle: 'normal' }}>KJV English</div>
            {en.split('\n').map((l, i) => <div key={i} style={{ marginBottom: '2.5px' }}>{l}</div>)}
          </div>
        </div>
      </div>
    )
  }

  const renderWordMeditationSection = () => {
    const hasOriginal = day.originalWords && !hiddenSet.has('originalWords')
    const hasEnglish = day.englishWords && !hiddenSet.has('englishWords')
    if (!hasOriginal && !hasEnglish) return null

    const origText = edits['originalWords'] !== undefined ? edits['originalWords'] : day.originalWords
    const engText = edits['englishWords'] !== undefined ? edits['englishWords'] : day.englishWords

    return (
      <div style={{
        marginTop: '20px',
        marginBottom: '20px',
        padding: '16px',
        background: t!.accentLight || 'rgba(99, 102, 241, 0.05)',
        borderRadius: '12px',
        border: `1px solid ${t!.borderLight || t!.sectionLabelBorder}`,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: `1px solid ${t!.sectionLabelBorder}`,
        }}>
          <span style={{
            fontFamily: t!.fontHeading,
            fontSize: '11px',
            fontWeight: 800,
            color: t!.accent,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            🔤 WORD MEDITATION · 단어 묵상
          </span>
          <span style={{
            fontSize: '9.5px',
            fontWeight: 700,
            color: t!.textMuted,
            background: 'rgba(0,0,0,0.04)',
            padding: '2px 8px',
            borderRadius: '6px',
          }}>
            원어 & 영어 단어 통찰
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: hasOriginal && hasEnglish ? 'repeat(auto-fit, minmax(240px, 1fr))' : '1fr',
          gap: '16px',
        }}>
          {hasOriginal && (
            <div style={{
              padding: '14px 16px',
              background: t!.prayerBoxBg || '#ffffff',
              borderRadius: '8px',
              borderLeft: `3.5px solid ${t!.accent}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{
                fontFamily: t!.fontHeading,
                fontSize: '10.5px',
                fontWeight: 700,
                color: t!.accent,
                letterSpacing: '1.5px',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <span>🏛️ 원어 핵심</span>
                <span style={{ fontSize: '9px', opacity: 0.6, fontWeight: 500 }}>(HEBREW/GREEK)</span>
              </div>
              <div style={{ fontSize: t!.bodySize, lineHeight: t!.bodyLineHeight, color: t!.textColor }}>
                {preprocessSmartText(origText).map((l, i) => renderSmartLine(l, i, t!.accent, '6px'))}
              </div>
            </div>
          )}

          {hasEnglish && (
            <div style={{
              padding: '14px 16px',
              background: t!.prayerBoxBg || '#ffffff',
              borderRadius: '8px',
              borderLeft: `3.5px solid ${t!.accent}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{
                fontFamily: t!.fontHeading,
                fontSize: '10.5px',
                fontWeight: 700,
                color: t!.accent,
                letterSpacing: '1.5px',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <span>🔤 영어 핵심</span>
                <span style={{ fontSize: '9px', opacity: 0.6, fontWeight: 500 }}>(KEYWORDS & MEDITATION)</span>
              </div>
              <div style={{ fontSize: t!.bodySize, lineHeight: t!.bodyLineHeight, color: t!.textColor }}>
                {preprocessSmartText(engText).map((l, i) => renderSmartLine(l, i, t!.accent, '6px'))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const refSection = () => {
    if (!studyRef) return null
    const hasContent = studyRef.background || studyRef.keyWords || studyRef.commentary || studyRef.parallelPassages
    if (!hasContent) return null

    return (
      <div style={{ marginTop: '24px', paddingTop: '14px', borderTop: `1px solid ${t!.border}`, fontSize: t!.bodySize, lineHeight: t!.bodyLineHeight, color: t!.textMuted }}>
        <div style={{ fontFamily: t!.fontHeading, fontSize: '10px', fontWeight: 600, color: t!.accent, letterSpacing: '2px', marginBottom: '8px', opacity: 0.7 }}>참고자료</div>
        {studyRef.background && <div style={{ marginBottom: '6px' }}>📖 {studyRef.background}</div>}
        {studyRef.keyWords && <div style={{ marginBottom: '6px' }}>🔑 {studyRef.keyWords}</div>}
        {studyRef.commentary && <div style={{ marginBottom: '6px', fontStyle: 'italic', color: t!.bibleQuoteText }}>💡 {studyRef.commentary}</div>}
        {studyRef.parallelPassages && <div style={{ marginBottom: '6px' }}>🔗 {studyRef.parallelPassages}</div>}
      </div>
    )
  }

  const mainContent = (
    <>
      <div style={{ fontFamily: t!.fontHeading }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: t!.accent, letterSpacing: '1.5px', marginBottom: '4px' }}>
          DAY {dayNumber} · {dateLabel}
        </div>
      </div>

      <div style={{ fontFamily: t!.fontHeading, fontSize: '15px', fontWeight: 700, color: t!.textColor, letterSpacing: '0.5px', marginBottom: '16px' }}>
        {day.title || `Day ${dayNumber}`}
      </div>

      {renderPassage()}
      {section('본문 한눈에 보기', day.passageOverview, 'default', 'passageOverview')}
      {section('천천히 읽기', day.slowReading, 'default', 'slowReading')}
      {section('본문 관찰하기', day.observation, 'question', 'observation')}
      {renderWordMeditationSection()}
      {section('말씀 이해하기', day.understanding, 'default', 'understanding')}
      {section('복음으로 보기', day.gospel, 'accent', 'gospel')}
      {section('나를 비추어 보기', day.reflection, 'question', 'reflection')}
      {section('오늘의 적용', day.application, 'accent', 'application')}
      {section('영어로 붙드는 말씀', day.englishVerse, 'box', 'englishVerse')}
      {section('공동체 연결', day.community, 'default', 'community')}
      {section('오늘의 기도', day.prayer, 'prayer', 'prayer')}
      {section('한 줄 기록', day.oneLine, 'default', 'oneLine')}
      {section('인도자용 해설', day.leaderGuide, 'prayer', 'leaderGuide')}
      {section('', day.extras, 'default', 'extras')}

      {refSection()}
    </>
  )

  return (
    <div style={{ fontFamily: t!.font, background: t!.pageBg, color: t!.textColor, borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      {mainContent}
    </div>
  )
}