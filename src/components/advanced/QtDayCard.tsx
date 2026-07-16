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
}

export default function QtDayCard({ day, dayNumber, dateLabel, variant, template, studyRef }: QtDayCardProps) {
  const isPdf = variant === 'pdf'
  const t = template

  const section = (label: string, content: string, style: 'default' | 'box' | 'prayer' | 'accent' | 'question' = 'default') => {
    if (!content) return null

    const labelEl = isPdf ? (
      <div style={{ fontFamily: t!.fontHeading, fontSize: '10.5px', fontWeight: 600, color: t!.accent, letterSpacing: '2.5px', marginTop: '18px', marginBottom: '8px', paddingBottom: '4px', borderBottom: `1px solid ${t!.sectionLabelBorder}`, textTransform: 'uppercase' as const }}>
        {label}
      </div>
    ) : (
      <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mt-4 mb-1.5 pb-1 border-b border-white/5">
        {label}
      </div>
    )

    const contentEl = (() => {
      if (style === 'box') {
        return isPdf ? (
          <div style={{ color: t!.bibleQuoteText, padding: '12px 16px', margin: '6px 0', borderLeft: `3px solid ${t!.bibleQuoteBorder}`, background: t!.bibleQuoteBg, borderRadius: '0 6px 6px 0', fontSize: t!.bodySize, lineHeight: t!.bodyLineHeight }}>
            {content.split('\n').map((l, i) => <div key={i} style={{ marginBottom: '2px' }}>{l}</div>)}
          </div>
        ) : (
          <div className="text-[12px] leading-relaxed text-slate-300 bg-white/[0.03] border-l-2 border-indigo-500/50 rounded-r-lg px-4 py-3 my-1.5">
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
          <div className="text-[12px] leading-relaxed text-slate-300 bg-white/[0.04] rounded-xl px-4 py-3 mt-1.5 border border-white/5">
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
          <div className="text-[12px] leading-relaxed text-indigo-200 bg-indigo-500/5 border border-indigo-500/10 rounded-xl px-4 py-3 my-1.5">
            {content.split('\n').map((l, i) => <div key={i}>{l}</div>)}
          </div>
        )
      }
      return isPdf ? (
        <div style={{ fontSize: t!.bodySize, lineHeight: t!.bodyLineHeight, color: t!.textColor }}>
          {content.split('\n').map((l, i) => <div key={i} style={{ marginBottom: '4px' }}>{l}</div>)}
        </div>
      ) : (
        <div className="text-[12px] leading-relaxed text-slate-300">
          {content.split('\n').map((l, i) => <div key={i} className="mb-1">{l}</div>)}
        </div>
      )
    })()

    return (
      <div className={isPdf ? '' : ''}>
        {labelEl}
        {contentEl}
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
          <div className="mt-6 pt-3 border-t border-white/5 text-[11px] text-slate-500 leading-relaxed">
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
      <div className={isPdf ? '' : 'flex items-center gap-2 mb-3'}>
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
        <div className="text-[14px] font-bold text-white mb-4">
          {day.title || `Day ${dayNumber}`}
        </div>
      )}

      {section('오늘의 본문', day.passage, 'box')}
      {section('본문 한눈에 보기', day.passageOverview)}
      {section('천천히 읽기', day.slowReading)}
      {section('본문 관찰하기', day.observation, 'question')}
      {section('원어 핵심단어', day.originalWords, 'box')}
      {section('영어 핵심단어', day.englishWords, 'box')}
      {section('말씀 이해하기', day.understanding)}
      {section('복음으로 보기', day.gospel, 'accent')}
      {section('나를 비추어 보기', day.reflection, 'question')}
      {section('오늘의 적용', day.application, 'accent')}
      {section('영어로 붙드는 말씀', day.englishVerse, 'box')}
      {section('공동체 연결', day.community)}
      {section('오늘의 기도', day.prayer, 'prayer')}
      {section('한 줄 기록', day.oneLine)}
      {section('인도자용 해설', day.leaderGuide, 'prayer')}
      {section('', day.extras)}

      {refSection()}
    </>
  )

  if (isPdf) {
    return <div style={{ fontFamily: t!.font }}>{mainContent}</div>
  }

  return <div className="font-sans">{mainContent}</div>
}
