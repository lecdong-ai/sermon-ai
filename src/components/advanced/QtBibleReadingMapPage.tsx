'use client'

import React from 'react'
import QtQuickIndexNav from './QtQuickIndexNav'

interface QtBibleReadingMapPageProps {
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
    color: '#64748B', tint: '#F8FAFC', border: '#E2E8F0',
    books: [
      { name: '창', ch: 50 }, { name: '출', ch: 40 }, { name: '레', ch: 27 },
      { name: '민', ch: 36 }, { name: '신', ch: 34 },
    ],
  },
  {
    label: '역사서', en: 'HISTORY', emoji: '📖',
    color: '#64748B', tint: '#F8FAFC', border: '#E2E8F0',
    books: [
      { name: '수', ch: 24 }, { name: '삿', ch: 21 }, { name: '룻', ch: 4 },
      { name: '삼상', ch: 31 }, { name: '삼하', ch: 24 }, { name: '왕상', ch: 22 },
      { name: '왕하', ch: 25 }, { name: '대상', ch: 29 }, { name: '대하', ch: 36 },
      { name: '스', ch: 10 }, { name: '느', ch: 13 }, { name: '에', ch: 10 },
    ],
  },
  {
    label: '시가서', en: 'POETRY & WISDOM', emoji: '🎵',
    color: '#64748B', tint: '#F8FAFC', border: '#E2E8F0',
    books: [
      { name: '욥', ch: 42 }, { name: '시', ch: 150 }, { name: '잠', ch: 31 },
      { name: '전', ch: 12 }, { name: '아', ch: 8 },
    ],
  },
  {
    label: '대선지서', en: 'MAJOR PROPHETS', emoji: '🔥',
    color: '#64748B', tint: '#F8FAFC', border: '#E2E8F0',
    books: [
      { name: '사', ch: 66 }, { name: '렘', ch: 52 }, { name: '애', ch: 5 },
      { name: '겔', ch: 48 }, { name: '단', ch: 12 },
    ],
  },
  {
    label: '소선지서', en: 'MINOR PROPHETS', emoji: '🕊️',
    color: '#64748B', tint: '#F8FAFC', border: '#E2E8F0',
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
    color: '#64748B', tint: '#F8FAFC', border: '#E2E8F0',
    books: [
      { name: '마', ch: 28 }, { name: '막', ch: 16 }, { name: '눅', ch: 24 },
      { name: '요', ch: 21 }, { name: '행', ch: 28 },
    ],
  },
  {
    label: '서신서', en: 'EPISTLES', emoji: '📬',
    color: '#64748B', tint: '#F8FAFC', border: '#E2E8F0',
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
    color: '#64748B', tint: '#F8FAFC', border: '#E2E8F0',
    books: [
      { name: '계', ch: 22 },
    ],
  },
]

const MILESTONES = [
  { q: 'Q1', emoji: '📜', target: '율법·역사서' },
  { q: 'Q2', emoji: '🎵', target: '시가·선지서' },
  { q: 'Q3', emoji: '✝️', target: '복음·서신서' },
  { q: 'Q4', emoji: '🏆', target: '1통독 완주' },
]

function BookCheckCard({ name, ch, color, tint, border }: {
  name: string; ch: number; color: string; tint: string; border: string
}) {
  return (
    <div
      style={{
        width: '40px',
        padding: '3px 3px 2px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: '6px',
        backgroundColor: 'white',
        border: `1px solid ${border}`,
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 1px' }}>
        <span style={{ fontSize: '8.5px', fontWeight: 800, color: '#0F172A' }}>{name}</span>
        <span style={{ fontSize: '6.5px', color, fontWeight: 800 }}>{ch}</span>
      </div>
      <div style={{ display: 'flex', gap: '1.5px', marginTop: '2px' }}>
        {[1, 2, 3, 4].map(boxNo => (
          <div
            key={boxNo}
            style={{
              width: '6.5px',
              height: '6.5px',
              border: `1px solid ${border}`,
              backgroundColor: 'white',
              borderRadius: '2px',
            }}
          />
        ))}
      </div>
    </div>
  )
}

function CategoryCheckStrip({ cat }: { cat: BibleCategory }) {
  const totalCh = cat.books.reduce((acc, b) => acc + b.ch, 0)
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
        <span
          style={{
            padding: '1.5px 8px',
            borderRadius: '999px',
            backgroundColor: 'white',
            border: `1px solid ${cat.border}`,
            color: cat.color,
            fontSize: '8px',
            fontWeight: 800,
          }}
        >
          {cat.emoji} {cat.label}
        </span>
        <span style={{ fontSize: '7px', color: '#94A3B8', fontWeight: 700, letterSpacing: '0.05em' }}>
          {cat.books.length}권 · {totalCh.toLocaleString()}장
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
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

export default function QtBibleReadingMapPage({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtBibleReadingMapPageProps) {
  const monthNum = MONTH_MAP[monthName] || 8

  return (
    <div
      data-page-key="bible"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '20px 58px 20px 24px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      <QtQuickIndexNav currentMonth={monthNum} activeTab="tracker" themeColor={themeColor} isChristian={true} />

      {/* 1. Header Bar */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
        <div className="flex items-center space-x-3 text-[10.5px] font-medium tracking-widest text-slate-400 font-mono">
          <span className="text-slate-700 font-bold">{year}</span>
          <span className="w-px h-3 bg-slate-300" />
          <span>YEARLY BIBLE READING</span>
          <span className="px-2 py-0.5 rounded-md text-white font-bold tracking-widest" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[10.5px] font-mono text-slate-400">
          <span className="tracking-[0.2em] font-bold text-slate-500">66 BOOKS ROADMAP</span>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-bold text-[9.5px] shadow-2xs tracking-wide">
            🕊️ 통독 ① VOL. 1
          </span>
        </div>
      </div>

      {/* 2. Page Title & Progress Gauge */}
      <div className="mb-2">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[8.5px] font-mono font-bold tracking-[0.3em] text-slate-400 mb-1">MONTHLY BIBLE READING PROGRESS</div>
            <h1 className="text-[22px] leading-none font-sans font-extrabold text-slate-800 tracking-wide whitespace-nowrap">
              🕊️ {monthName} Bible 66 Books Reading Progress Roadmap
            </h1>
            <p className="text-[10px] text-slate-500 mt-1.5 whitespace-nowrap">
              구약 39권(929장) + 신약 27권(260장) = 총 1,189장 — 한 장씩 체크하며 1년 1통독을 완주합니다.
            </p>
          </div>

          <div className="flex items-center gap-2 mb-0.5">
            <div className="text-center px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200">
              <div className="font-mono text-[8px] text-slate-400 font-bold">OT</div>
              <div className="text-[11px] font-black text-slate-700">39권</div>
            </div>
            <div className="text-center px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200">
              <div className="font-mono text-[8px] text-slate-400 font-bold">NT</div>
              <div className="text-[11px] font-black text-slate-700">27권</div>
            </div>
            <div className="text-center px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200">
              <div className="font-mono text-[8px] text-slate-400 font-bold">1 DAY</div>
              <div className="text-[11px] font-black text-slate-700">약 3.3장</div>
            </div>
          </div>
        </div>

        {/* Gauge */}
        <div className="flex items-center gap-3 mt-2">
          <div className="flex-1 relative h-4 rounded-full bg-white border border-dashed border-slate-300 shadow-inner">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-[9px] font-bold text-slate-400 tracking-[0.2em]">
                ______ / 1,189장 (______%)
              </span>
            </div>
          </div>
          <span className="text-[9.5px] font-bold text-slate-500 whitespace-nowrap font-sans">
            1년 1통독 완주 목표
          </span>
        </div>
      </div>

      {/* 3. Main Grid (Left 7 Cols OT / Right 5 Cols NT & Milestones) */}
      <div className="grid grid-cols-12 gap-3 flex-1 mb-2">
        {/* Left: OT 39 Books (7 cols) */}
        <div className="col-span-7 border border-slate-200 rounded-2xl p-2.5 bg-white flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-xl text-[9.5px] font-bold mb-1.5">
            <span>📜 구약 39권 완독 체크 그리드 (OLD TESTAMENT)</span>
            <span className="font-mono text-[8.5px] text-slate-400">39 Books · 929 Chapters</span>
          </div>
          <div className="space-y-1 flex-1 flex flex-col justify-around">
            {OT_CATEGORIES.map((cat, idx) => (
              <CategoryCheckStrip key={idx} cat={cat} />
            ))}
          </div>
        </div>

        {/* Right: NT 27 Books & 4-Quarter Milestones (5 cols) */}
        <div className="col-span-5 flex flex-col justify-between space-y-2">
          {/* NT Box */}
          <div className="border border-slate-200 rounded-2xl p-2.5 bg-white flex-1 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-xl text-[9.5px] font-bold mb-1.5">
              <span>✝️ 신약 27권 완독 체크 그리드 (NEW TESTAMENT)</span>
              <span className="font-mono text-[8.5px] text-slate-400">27 Books · 260 Chapters</span>
            </div>
            <div className="space-y-1 flex-1 flex flex-col justify-around">
              {NT_CATEGORIES.map((cat, idx) => (
                <CategoryCheckStrip key={idx} cat={cat} />
              ))}
            </div>
          </div>

          {/* 4 Quarters Milestone Stamps */}
          <div className="border border-slate-200 rounded-2xl p-2 bg-slate-50/50 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-black text-slate-700">🏆 4분기 완주 마일스톤 도장</span>
              <span className="font-mono text-[7.5px] text-slate-400 font-bold">1,189 Chapters</span>
            </div>
            <div className="grid grid-cols-4 gap-2 items-center">
              {MILESTONES.map((m, mIdx) => (
                <div key={mIdx} className="flex flex-col items-center">
                  <div
                    className="w-13 h-13 rounded-full border border-slate-300 bg-white flex flex-col items-center justify-center shadow-2xs"
                  >
                    <span className="text-[9px] font-black text-slate-700 leading-none">{m.q}</span>
                    <span className="text-[11px] leading-none my-0.5">{m.emoji}</span>
                    <span className="text-[6px] font-bold text-slate-500 leading-none">{m.target}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200">
        <span>PREMIUM DIARY STUDIO — BIBLE 66 READING ROADMAP (VOL. 1)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
