'use client'

import React from 'react'
import QtQuickIndexNavPortrait from './QtQuickIndexNavPortrait'

interface QtBibleReadingMapPortraitProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

interface BibleBook { name: string; ch: number }
interface BibleCategory {
  label: string; en: string; emoji: string
  color: string; tint: string; border: string
  books: BibleBook[]
}

const OT_CATEGORIES: BibleCategory[] = [
  {
    label: '율법서', en: 'PENTATEUCH', emoji: '📜',
    color: '#B45309', tint: '#FFFBEB', border: '#FDE68A',
    books: [
      { name: '창', ch: 50 }, { name: '출', ch: 40 }, { name: '레', ch: 27 },
      { name: '민', ch: 36 }, { name: '신', ch: 34 },
    ],
  },
  {
    label: '역사서', en: 'HISTORY', emoji: '📖',
    color: '#0F766E', tint: '#F0FDFA', border: '#99F6E4',
    books: [
      { name: '수', ch: 24 }, { name: '삿', ch: 21 }, { name: '룻', ch: 4 },
      { name: '삼상', ch: 31 }, { name: '삼하', ch: 24 }, { name: '왕상', ch: 22 },
      { name: '왕하', ch: 25 }, { name: '대상', ch: 29 }, { name: '대하', ch: 36 },
      { name: '스', ch: 10 }, { name: '느', ch: 13 }, { name: '에', ch: 10 },
    ],
  },
  {
    label: '시가서', en: 'POETRY & WISDOM', emoji: '🎵',
    color: '#7C3AED', tint: '#F5F3FF', border: '#DDD6FE',
    books: [
      { name: '욥', ch: 42 }, { name: '시', ch: 150 }, { name: '잠', ch: 31 },
      { name: '전', ch: 12 }, { name: '아', ch: 8 },
    ],
  },
  {
    label: '대선지서', en: 'MAJOR PROPHETS', emoji: '🔥',
    color: '#BE123C', tint: '#FFF1F2', border: '#FECDD3',
    books: [
      { name: '사', ch: 66 }, { name: '렘', ch: 52 }, { name: '애', ch: 5 },
      { name: '겔', ch: 48 }, { name: '단', ch: 12 },
    ],
  },
  {
    label: '소선지서', en: 'MINOR PROPHETS', emoji: '🕊️',
    color: '#0369A1', tint: '#F0F9FF', border: '#BAE6FD',
    books: [
      { name: '호', ch: 14 }, { name: '욜', ch: 3 }, { name: '암', ch: 9 },
      { name: '옵', ch: 1 }, { name: '욘', ch: 4 }, { name: '미', ch: 7 },
      { name: '나', ch: 3 }, { name: '하', ch: 3 }, { name: '습', ch: 3 },
      { name: '학', ch: 2 }, { name: '슥', ch: 14 }, { name: '말', ch: 4 },
    ],
  },
]

const NT_CATEGORIES: BibleCategory[] = [
  {
    label: '복음서·역사', en: 'GOSPELS & ACTS', emoji: '✝️',
    color: '#4338CA', tint: '#EEF2FF', border: '#C7D2FE',
    books: [
      { name: '마', ch: 28 }, { name: '막', ch: 16 }, { name: '눅', ch: 24 },
      { name: '요', ch: 21 }, { name: '행', ch: 28 },
    ],
  },
  {
    label: '서신서', en: 'EPISTLES', emoji: '📬',
    color: '#475569', tint: '#F8FAFC', border: '#CBD5E1',
    books: [
      { name: '롬', ch: 16 }, { name: '고전', ch: 16 }, { name: '고후', ch: 13 },
      { name: '갈', ch: 6 }, { name: '엡', ch: 6 }, { name: '빌', ch: 4 },
      { name: '골', ch: 4 }, { name: '살전', ch: 5 }, { name: '살후', ch: 3 },
      { name: '딤전', ch: 6 }, { name: '딤후', ch: 4 }, { name: '딛', ch: 3 },
      { name: '몬', ch: 1 }, { name: '히', ch: 13 }, { name: '야', ch: 5 },
      { name: '벧전', ch: 5 }, { name: '벧후', ch: 3 }, { name: '요1', ch: 5 },
      { name: '요2', ch: 1 }, { name: '요3', ch: 1 }, { name: '유', ch: 1 },
    ],
  },
  {
    label: '예언서', en: 'REVELATION', emoji: '🌟',
    color: '#C2410C', tint: '#FFF7ED', border: '#FED7AA',
    books: [
      { name: '계', ch: 22 },
    ],
  },
]

function BookCheckCard({ name, ch, color, tint, border }: {
  name: string; ch: number; color: string; tint: string; border: string
}) {
  return (
    <div
      style={{
        width: '46px',
        padding: '3px 2px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: '5px',
        backgroundColor: tint,
        border: `1px solid ${border}`,
        borderTop: `2.5px solid ${color}`,
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 2px' }}>
        <span style={{ fontSize: '10px', fontWeight: 800, color: '#1E293B' }}>{name}</span>
        <span style={{ fontSize: '8px', color, fontWeight: 700 }}>{ch}장</span>
      </div>
      <div style={{ display: 'flex', gap: '1.5px', marginTop: '2px' }}>
        {[1, 2, 3, 4].map(boxNo => (
          <div
            key={boxNo}
            style={{
              width: '8px',
              height: '8px',
              border: `1px solid ${border}`,
              backgroundColor: 'white',
              borderRadius: '1px',
            }}
          />
        ))}
      </div>
    </div>
  )
}

function CategoryCheckStrip({ cat }: { cat: BibleCategory }) {
  return (
    <div style={{ marginBottom: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
        <span
          style={{
            padding: '1px 7px', borderRadius: '3px',
            backgroundColor: cat.color, color: 'white',
            fontSize: '9px', fontWeight: 700,
          }}
        >
          {cat.emoji} {cat.label}
        </span>
        <span style={{ fontSize: '8px', color: '#64748B', fontWeight: 600 }}>
          {cat.books.length}권
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
        {cat.books.map((b, i) => (
          <BookCheckCard key={i} name={b.name} ch={b.ch} color={cat.color} tint={cat.tint} border={cat.border} />
        ))}
      </div>
    </div>
  )
}

const MONTH_MAP: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
}

export default function QtBibleReadingMapPortrait({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 1448,
}: QtBibleReadingMapPortraitProps) {
  const monthNum = MONTH_MAP[monthName] || 8

  return (
    <div
      data-page-key="tracker"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '52px 20px 20px 20px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      <QtQuickIndexNavPortrait currentMonth={monthNum} activeTab="tracker" themeColor={themeColor} />
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-3 mb-3">
        <div className="flex items-center space-x-4 text-xs font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2.5 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-xs">
          🕊️ BIBLE 66 READING ROADMAP
        </span>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2 whitespace-nowrap">
            <span>🕊️ {monthName} Bible 66 Books Roadmap</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            구약 39권(929장) + 신약 27권(260장) = 총 1,189장 완독 진도율을 색칠하며 1년 1통독을 완주합니다.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-full text-xs font-bold text-emerald-950 shadow-xs">
          <span>총 1,189장 중</span>
          <span className="font-mono text-emerald-700">____ / 1,189장 (___%)</span>
        </div>
      </div>

      {/* 3. Main Stack: OT + NT + 4-Quarter Milestones */}
      <div className="space-y-4 flex-1 flex flex-col justify-between mb-3">
        {/* OT Box */}
        <div className="border border-emerald-200 rounded-2xl p-3.5 bg-emerald-50/10 flex-1 flex flex-col justify-between shadow-xs space-y-2">
          <div className="flex items-center justify-between bg-emerald-700 text-white px-3 py-1 rounded-xl text-xs font-bold">
            <span>📜 구약 39권 완독 체크 그리드 (OLD TESTAMENT)</span>
            <span className="font-mono text-xs">39 Books · 929 Chapters</span>
          </div>
          <div className="space-y-1.5 flex-1 flex flex-col justify-around">
            {OT_CATEGORIES.map((cat, idx) => (
              <CategoryCheckStrip key={idx} cat={cat} />
            ))}
          </div>
        </div>

        {/* NT Box */}
        <div className="border border-indigo-200 rounded-2xl p-3.5 bg-indigo-50/10 flex-1 flex flex-col justify-between shadow-xs space-y-2">
          <div className="flex items-center justify-between bg-indigo-700 text-white px-3 py-1 rounded-xl text-xs font-bold">
            <span>✝️ 신약 27권 완독 체크 그리드 (NEW TESTAMENT)</span>
            <span className="font-mono text-xs">27 Books · 260 Chapters</span>
          </div>
          <div className="space-y-1.5 flex-1 flex flex-col justify-around">
            {NT_CATEGORIES.map((cat, idx) => (
              <CategoryCheckStrip key={idx} cat={cat} />
            ))}
          </div>
        </div>

        {/* 4 Quarters Milestones */}
        <div className="border border-amber-200 rounded-2xl p-3 bg-amber-50/40 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-amber-950">
            <span>🏆 1년 1통독 4분기 완주 마일스톤 도장</span>
            <span className="font-mono text-xs text-amber-700">1,189 Chapters Completed</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { q: '1분기 (Q1)', target: '율법·역사서' },
              { q: '2분기 (Q2)', target: '시가·선지서' },
              { q: '3분기 (Q3)', target: '복음·서신서' },
              { q: '4분기 (Q4)', target: '성경 1통독 완주' },
            ].map((m, mIdx) => (
              <div key={mIdx} className="bg-white p-2 rounded-xl border border-amber-200 text-xs">
                <span className="font-bold text-amber-800 block text-xs">{m.q}</span>
                <span className="text-slate-400 text-[10px]">{m.target}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-300">
        <span>PREMIUM DIARY STUDIO — BIBLE 66 READING ROADMAP (VOL. 1)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
