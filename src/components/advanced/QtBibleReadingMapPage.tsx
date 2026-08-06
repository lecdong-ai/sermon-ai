'use client'

import React from 'react'

interface QtBibleReadingMapPageProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

// ─── 성경 카테고리 정의 (구약 5 + 신약 3) ───────────────────

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

const OT_BOOK_COUNT = OT_CATEGORIES.reduce((s, c) => s + c.books.length, 0)
const NT_BOOK_COUNT = NT_CATEGORIES.reduce((s, c) => s + c.books.length, 0)
const TOTAL_BOOKS = OT_BOOK_COUNT + NT_BOOK_COUNT

// ─── 책 카드 (높이가 장수에 비례하는 "서가 스파인" 디자인) ───

function BookCard({ name, ch, color, tint, border }: {
  name: string; ch: number; color: string; tint: string; border: string
}) {
  const height = Math.round(28 + (ch / 150) * 28)
  return (
    <div
      style={{
        width: '38px',
        height: `${height}px`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1px',
        borderRadius: '4px 4px 1px 1px',
        backgroundColor: tint,
        border: `1px solid ${border}`,
        borderTop: `2.5px solid ${color}`,
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: '7px', color, fontWeight: 700, lineHeight: 1, opacity: 0.75 }}>{ch}</span>
      <span style={{ fontSize: '10px', fontWeight: 800, color: '#1E293B', lineHeight: 1 }}>{name}</span>
    </div>
  )
}

// ─── 카테고리 스트립 (배지 + 책 그리드 + 선반 라인) ──────────

function CategoryStrip({ cat }: { cat: BibleCategory }) {
  return (
    <div style={{ marginBottom: '4px' }}>
      {/* 카테고리 배지 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
        <span
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '2px',
            padding: '1px 7px', borderRadius: '3px',
            backgroundColor: cat.color, color: 'white',
            fontSize: '8px', fontWeight: 700, letterSpacing: '0.03em',
            whiteSpace: 'nowrap',
          }}
        >
          {cat.emoji} {cat.label}
        </span>
        <span style={{ fontSize: '7px', color: '#94A3B8', fontWeight: 600, letterSpacing: '0.05em' }}>
          {cat.en} · {cat.books.length}
        </span>
      </div>
      {/* 책 카드 (서가 정렬: 바닥 기준) */}
      <div style={{ display: 'flex', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2px' }}>
        {cat.books.map((book, i) => (
          <BookCard key={i} name={book.name} ch={book.ch} color={cat.color} tint={cat.tint} border={cat.border} />
        ))}
      </div>
      {/* 선반 라인 */}
      <div style={{
        height: '1.5px',
        background: `linear-gradient(90deg, ${cat.color}33, ${cat.border}, ${cat.color}33)`,
        borderRadius: '1px',
        marginTop: '0px',
      }} />
    </div>
  )
}

// ─── 메인 페이지 컴포넌트 ───────────────────────────────────

export default function QtBibleReadingMapPage({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtBibleReadingMapPageProps) {
  return (
    <div
      data-page-key="bible-map"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '12px 18px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      {/* ━━━ 1. Header Navigation Bar ━━━ */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-1.5 shrink-0">
        <div className="flex items-center space-x-3 text-[10.5px] font-medium tracking-wider text-slate-400">
          <span data-nav-target="calendar" className="cursor-pointer hover:text-slate-600">YEARLY</span>
          <span>{year}</span>
          <span data-nav-target="calendar" className="px-1.5 py-0.5 rounded text-white font-bold cursor-pointer" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[10.5px] font-medium text-slate-400">
          <span data-nav-target="calendar" className="hover:text-slate-600 cursor-pointer">MONTHLY</span>
          <span data-nav-target="overview" className="hover:text-slate-600 cursor-pointer">OVERVIEW</span>
          <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold cursor-pointer shadow-xs">BIBLE 66 MAP</span>
        </div>
      </div>

      {/* ━━━ 2. Page Title + 비율 바 ━━━ */}
      <div style={{ marginBottom: '8px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{
              fontSize: '15.5px', fontWeight: 800, color: '#0F172A', margin: 0,
              fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
              letterSpacing: '0.01em',
              whiteSpace: 'nowrap',
            }}>
              🕊️ 성경 66권 통독 여정 맵 (Bible Reading Journey)
            </h1>
            <p style={{ fontSize: '9px', color: '#64748B', margin: '2px 0 0', fontWeight: 500 }}>
              권별 총 장수(숫자)와 함께 읽을 때마다 스티커나 색칠로 완독을 체크하세요!
            </p>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '3px 10px', borderRadius: '99px',
            backgroundColor: themeColor, color: 'white',
            fontSize: '9.5px', fontWeight: 700, whiteSpace: 'nowrap',
          }}>
            📖 {TOTAL_BOOKS} Books
          </div>
        </div>
        {/* 구약/신약 비율 바 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
          <span style={{ fontSize: '8px', color: '#047857', fontWeight: 700, whiteSpace: 'nowrap' }}>구약 {OT_BOOK_COUNT}권 (929장)</span>
          <div style={{ display: 'flex', flex: 1, height: '5px', borderRadius: '3px', overflow: 'hidden', gap: '1px', backgroundColor: '#E2E8F0' }}>
            <div style={{ width: `${(OT_BOOK_COUNT / TOTAL_BOOKS) * 100}%`, background: 'linear-gradient(90deg, #059669, #34D399)', borderRadius: '3px 0 0 3px' }} />
            <div style={{ width: `${(NT_BOOK_COUNT / TOTAL_BOOKS) * 100}%`, background: 'linear-gradient(90deg, #4338CA, #6366F1)', borderRadius: '0 3px 3px 0' }} />
          </div>
          <span style={{ fontSize: '8px', color: '#4338CA', fontWeight: 700, whiteSpace: 'nowrap' }}>신약 {NT_BOOK_COUNT}권 (260장)</span>
        </div>
      </div>

      {/* ━━━ 3. Main Content (좌: 구약 39권 / 우: 신약 27권 & 목표) ━━━ */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '10px', minHeight: 0 }}>

        {/* ── [좌측 7컬럼] 구약 OLD TESTAMENT ── */}
        <div style={{
          gridColumn: 'span 7', minHeight: 0,
          border: '1px solid #CBD5E1', borderRadius: '10px',
          padding: '8px 10px',
          backgroundColor: '#FAFDFB',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          {/* 구약 섹션 헤더 */}
          <div style={{
            background: 'linear-gradient(90deg, #047857, #10B981)',
            borderRadius: '6px',
            padding: '4px 10px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '6px', flexShrink: 0,
          }}>
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: 'white', letterSpacing: '0.05em' }}>
              📜 구약 39권 (OLD TESTAMENT)
            </span>
            <span style={{ fontSize: '8.5px', color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>
              39 Books · 929 Chapters
            </span>
          </div>
          {/* 카테고리 스트립들 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', minHeight: 0 }}>
            {OT_CATEGORIES.map((cat, idx) => (
              <CategoryStrip key={idx} cat={cat} />
            ))}
          </div>
        </div>

        {/* ── [우측 5컬럼] 신약 NEW TESTAMENT & 목표 ── */}
        <div style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: 0 }}>
          {/* 신약 박스 */}
          <div style={{
            flex: 1, minHeight: 0,
            border: '1px solid #CBD5E1', borderRadius: '10px',
            padding: '8px 10px',
            backgroundColor: '#FAFAFF',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            {/* 신약 섹션 헤더 */}
            <div style={{
              background: 'linear-gradient(90deg, #3730A3, #6366F1)',
              borderRadius: '6px',
              padding: '4px 10px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '6px', flexShrink: 0,
            }}>
              <span style={{ fontSize: '10.5px', fontWeight: 800, color: 'white', letterSpacing: '0.05em' }}>
                ✝️ 신약 27권 (NEW TESTAMENT)
              </span>
              <span style={{ fontSize: '8.5px', color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>
                27 Books · 260 Chapters
              </span>
            </div>
            {/* 카테고리 스트립들 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', minHeight: 0 }}>
              {NT_CATEGORIES.map((cat, idx) => (
                <CategoryStrip key={idx} cat={cat} />
              ))}
            </div>
          </div>

          {/* 이달의 통독 목표 메모 박스 */}
          <div style={{
            border: '1px solid #A7F3D0', borderRadius: '8px',
            padding: '6px 10px',
            backgroundColor: '#ECFDF5', flexShrink: 0,
          }}>
            <div style={{
              fontSize: '9px', fontWeight: 800, color: '#065F46',
              marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              🎯 이달의 성경 통독 목표 & 기도제목
            </div>
            <div style={{
              height: '32px', borderRadius: '6px',
              border: '1px solid #6EE7B7', backgroundColor: '#FFFFFF',
              padding: '4px 8px', fontSize: '9px', color: '#334155',
            }} />
          </div>
        </div>
      </div>

      {/* ━━━ 5. Footer ━━━ */}
      <div className="flex items-center justify-between border-t border-slate-300 pt-1 mt-1 text-[9.5px] text-slate-400 font-medium shrink-0">
        <span>SERMON AI QT DIARY — BIBLE READING JOURNEY MAP</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
