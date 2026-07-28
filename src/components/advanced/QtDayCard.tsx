'use client'

import type { ParsedDay } from '@/lib/qtDayParser'
import type { QtTemplate } from '@/lib/qtTemplates'

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

// 한영 본문 분리 헬퍼
function splitPassageText(passageRaw: string) {
  if (!passageRaw) return { kr: '', en: '' }
  
  // KJV/NIV 전체 본문 또는 영어 본문 헤더 탐지
  const indexEng = passageRaw.search(/(?:KJV\s*전체\s*본문|NIV\s*전체\s*본문|영어\s*본문)/i)
  if (indexEng === -1) {
    return { kr: passageRaw.replace(/개역개정\s*전체\s*본문:?/g, '').trim(), en: '' }
  }
  
  let krPart = passageRaw.substring(0, indexEng)
  let enPart = passageRaw.substring(indexEng)
  
  // 헤더 정제
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

    const labelEl = isPdf ? (
      <div style={{ fontFamily: t!.fontHeading, fontSize: '10.5px', fontWeight: 600, color: t!.accent, letterSpacing: '2.5px', marginTop: '18px', marginBottom: '8px', paddingBottom: '4px', borderBottom: `1px solid ${t!.sectionLabelBorder}`, textTransform: 'uppercase' as const }}>
        {label}
      </div>
    ) : (
      <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mt-4 mb-1.5 pb-1 border-b border-white/5">
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
      if (style === 'box') {
        return isPdf ? (
          <div style={{ color: t!.bibleQuoteText, padding: '12px 16px', margin: '6px 0', borderLeft: `3px solid ${t!.bibleQuoteBorder}`, background: t!.bibleQuoteBg, borderRadius: '0 6px 6px 0', fontSize: t!.bodySize, lineHeight: t!.bodyLineHeight }}>
            {content.split('\n').map((l, i) => <div key={i} style={{ marginBottom: '2px' }}>{l}</div>)}
          </div>
        ) : (
          <div className="text-[12px] leading-relaxed text-slate-300 bg-white/[0.03] border-l-2 border-indigo-500/50 rounded-r-lg px-4 py-3 my-1.5 font-sans">
            {content.split('\n').map((l, i) => <div key={i}>{l}</div>)}
          </div>
        )
      }
      if (style === 'prayer') {
        return isPdf ? (
          <div style={{ background: t!.prayerBoxBg, borderRadius: '8px', padding: '14px 18px', marginTop: '6px', fontSize: t!.bodySize, lineHeight: t!.bodyLineHeight, color: t!.prayerBoxText }}>
            {content.split('\n').map((l, i) => <div key={i} style={{ marginBottom: '2px' }}>{l}</div>)}
          </div>
        ) : (
          <div className="text-[12px] leading-relaxed text-slate-300 bg-white/[0.04] rounded-xl px-4 py-3 mt-1.5 border border-white/5 font-sans">
            {content.split('\n').map((l, i) => <div key={i}>{l}</div>)}
          </div>
        )
      }
      if (style === 'accent') {
        return isPdf ? (
          <div style={{ fontSize: t!.bodySize, lineHeight: t!.bodyLineHeight, color: t!.textColor, padding: '10px 14px', margin: '6px 0', background: t!.accentLight, borderRadius: '6px', border: `1px solid ${t!.borderLight}` }}>
            {content.split('\n').map((l, i) => <div key={i} style={{ marginBottom: '2px' }}>{l}</div>)}
          </div>
        ) : (
          <div className="text-[12px] leading-relaxed text-indigo-200 bg-indigo-500/5 border border-indigo-500/10 rounded-xl px-4 py-3 my-1.5 font-sans">
            {content.split('\n').map((l, i) => <div key={i}>{l}</div>)}
          </div>
        )
      }
      return isPdf ? (
        <div style={{ fontSize: t!.bodySize, lineHeight: t!.bodyLineHeight, color: t!.textColor }}>
          {content.split('\n').map((l, i) => <div key={i} style={{ marginBottom: '4px' }}>{l}</div>)}
        </div>
      ) : (
        <div className="text-[12px] leading-relaxed text-slate-300 font-sans">
          {content.split('\n').map((l, i) => <div key={i} className="mb-1">{l}</div>)}
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

  // 본문 전용 한영 2단 대조 렌더링 함수
  const renderPassage = () => {
    const { kr, en } = splitPassageText(day.passage)
    
    if (!isBilingualSideBySide || !en) {
      return section('오늘의 본문', day.passage, 'box')
    }

    // 2단 대조 레이아웃
    const labelEl = isPdf ? (
      <div style={{ fontFamily: t!.fontHeading, fontSize: '10.5px', fontWeight: 600, color: t!.accent, letterSpacing: '2.5px', marginTop: '18px', marginBottom: '8px', paddingBottom: '4px', borderBottom: `1px solid ${t!.sectionLabelBorder}`, textTransform: 'uppercase' as const }}>
        오늘의 본문 (한영 대조)
      </div>
    ) : (
      <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mt-4 mb-1.5 pb-1 border-b border-white/5">
        오늘의 본문 (한영 대조)
      </div>
    )

    return (
      <div>
        {labelEl}
        {isPdf ? (
          <div style={{ display: 'flex', gap: '16px', margin: '6px 0' }}>
            <div style={{ flex: 1, color: t!.bibleQuoteText, padding: '12px 14px', borderLeft: `3px solid ${t!.bibleQuoteBorder}`, background: t!.bibleQuoteBg, borderRadius: '0 6px 6px 0', fontSize: '9.5px', lineHeight: '1.4' }}>
              <div style={{ fontWeight: 'bold', fontSize: '8.5px', color: t!.accent, marginBottom: '6px' }}>개역개정</div>
              {kr.split('\n').map((l, i) => <div key={i} style={{ marginBottom: '2.5px' }}>{l}</div>)}
            </div>
            <div style={{ flex: 1, color: t!.bibleQuoteText, padding: '12px 14px', borderLeft: `3px solid ${t!.bibleQuoteBorder}`, background: t!.bibleQuoteBg, borderRadius: '0 6px 6px 0', fontSize: '9px', lineHeight: '1.4', fontStyle: 'italic' }}>
              <div style={{ fontWeight: 'bold', fontSize: '8.5px', color: t!.accent, marginBottom: '6px', fontStyle: 'normal' }}>KJV English</div>
              {en.split('\n').map((l, i) => <div key={i} style={{ marginBottom: '2.5px' }}>{l}</div>)}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
            <div className="text-[11.5px] leading-relaxed text-slate-200 bg-white/[0.02] border-l-2 border-indigo-500/40 rounded-r-lg p-3.5 font-sans">
              <div className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-400 mb-2">개역개정</div>
              {kr.split('\n').map((l, i) => <div key={i} className="mb-0.5">{l}</div>)}
            </div>
            <div className="text-[11px] leading-relaxed text-slate-300 bg-white/[0.01] border-l-2 border-emerald-500/30 rounded-r-lg p-3.5 italic font-sans">
              <div className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-400 mb-2 not-italic">KJV English</div>
              {en.split('\n').map((l, i) => <div key={i} className="mb-0.5">{l}</div>)}
            </div>
          </div>
        )}
      </div>
    )
  }

  const refSection = () => {
    if (!studyRef) return null
    const hasContent = studyRef.background || studyRef.keyWords || studyRef.commentary || studyRef.parallelPassages
    if (!hasContent) return null

    return (
      <>
        {isPdf ? (
          <div style={{ marginTop: '24px', paddingTop: '14px', borderTop: `1px solid ${t!.border}`, fontSize: t!.bodySize, lineHeight: t!.bodyLineHeight, color: t!.textMuted }}>
            <div style={{ fontFamily: t!.fontHeading, fontSize: '10px', fontWeight: 600, color: t!.accent, letterSpacing: '2px', marginBottom: '8px', opacity: 0.7 }}>참고자료</div>
            {studyRef.background && <div style={{ marginBottom: '6px' }}>📖 {studyRef.background}</div>}
            {studyRef.keyWords && <div style={{ marginBottom: '6px' }}>🔑 {studyRef.keyWords}</div>}
            {studyRef.commentary && <div style={{ marginBottom: '6px', fontStyle: 'italic', color: t!.bibleQuoteText }}>💡 {studyRef.commentary}</div>}
            {studyRef.parallelPassages && <div style={{ marginBottom: '6px' }}>🔗 {studyRef.parallelPassages}</div>}
          </div>
        ) : (
          <div className="mt-6 pt-3 border-t border-white/5 text-[11px] text-slate-500 leading-relaxed font-sans">
            <div className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-1.5">참고자료</div>
            {studyRef.background && <div className="mb-1">📖 {studyRef.background}</div>}
            {studyRef.keyWords && <div className="mb-1">🔑 {studyRef.keyWords}</div>}
            {studyRef.commentary && <div className="mb-1 italic text-slate-400">💡 {studyRef.commentary}</div>}
            {studyRef.parallelPassages && <div className="mb-1">🔗 {studyRef.parallelPassages}</div>}
          </div>
        )}
      </>
    )
  }

  const mainContent = (
    <>
      <div className={isPdf ? '' : 'flex items-center gap-2 mb-3 font-sans'}>
        {isPdf ? (
          <div style={{ fontFamily: t!.fontHeading, fontSize: '13px', fontWeight: 600, color: t!.accent, letterSpacing: '1.5px', marginBottom: '4px' }}>
            DAY {dayNumber} · {dateLabel}
          </div>
        ) : (
          <div className="text-[11px] font-bold text-indigo-400 tracking-wider">
            DAY {dayNumber} · {dateLabel}
          </div>
        )}
      </div>

      {isPdf ? (
        <div style={{ fontFamily: t!.fontHeading, fontSize: '15px', fontWeight: 700, color: t!.textColor, letterSpacing: '0.5px', marginBottom: '16px' }}>
          {day.title || `Day ${dayNumber}`}
        </div>
      ) : (
        <div className="text-[14px] font-extrabold text-white mb-4 font-sans">
          {day.title || `Day ${dayNumber}`}
        </div>
      )}

      {renderPassage()}
      {section('본문 한눈에 보기', day.passageOverview, 'default', 'passageOverview')}
      {section('천천히 읽기', day.slowReading, 'default', 'slowReading')}
      {section('본문 관찰하기', day.observation, 'question', 'observation')}
      {section('원어 핵심단어', day.originalWords, 'box', 'originalWords')}
      {section('영어 핵심단어', day.englishWords, 'box', 'englishWords')}
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

  if (isPdf) {
    return <div style={{ fontFamily: t!.font }}>{mainContent}</div>
  }

  return <div className="font-sans">{mainContent}</div>
}
