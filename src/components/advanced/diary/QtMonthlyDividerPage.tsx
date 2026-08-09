'use client'

import React from 'react'
import { DiaryCoverVariant } from './QtDiaryCoverPage'

interface QtMonthlyDividerPageProps {
  year?: number
  month?: number
  seqIndex?: number
  totalMonths?: number
  variant?: DiaryCoverVariant
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

const VARIANT_LABEL: Record<DiaryCoverVariant, { badge: string; motto: string; side: string }> = {
  general: {
    badge: 'GOD-LIFE PLANNER',
    motto: '"한 달의 습관이 일 년의 삶을 만든다"',
    side: 'LIFE · HABIT · BUDGET · KPT',
  },
  church: {
    badge: 'QUIET TIME PLANNER',
    motto: '"이 모든 것에 더하여 믿음이 있으라 — 에베소서 6:16"',
    side: 'PRAYER · SCRIPTURE · SERMON · SOAP',
  },
  basic: {
    badge: 'MINIMAL PLANNER',
    motto: '"기록하는 자가 완성한다"',
    side: 'CALENDAR · WEEKLY · DAILY',
  },
  all: {
    badge: 'MASTER DIARY',
    motto: '"모든 기록의 완성"',
    side: 'ALL 35 PAGES',
  },
}

export default function QtMonthlyDividerPage({
  year = 2026,
  month = 8,
  seqIndex = 1,
  totalMonths = 17,
  variant = 'all',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtMonthlyDividerPageProps) {
  const meta = VARIANT_LABEL[variant]
  const isLandscape = pageWidth > pageHeight
  const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']

  return (
    <div
      data-page-key="monthdivider"
      data-page-type="full-bleed"
      className="qt-page relative bg-white overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: 0,
        margin: 0,
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      {/* 풀배경: 테마 컬러 기반 딥 톤 */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(150deg, #0f172a 0%, #1e293b 60%, ${themeColor}33 100%)` }} />

      {/* 중앙 콘텐츠 */}
      <div className="absolute flex flex-col items-center justify-center text-center" style={{
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'auto',
        maxWidth: isLandscape ? '78%' : '92%',
      }}>
        <div className="flex items-center gap-2 mb-3" style={{ color: themeColor }}>
          <span className="font-mono font-bold tracking-[0.3em]" style={{ fontSize: isLandscape ? 11 : 10 }}>
            {meta.badge} · MONTH {seqIndex} / {totalMonths}
          </span>
        </div>

        <div
          className="font-black text-white tracking-tight"
          style={{ fontSize: isLandscape ? 88 : 72, lineHeight: 1, marginBottom: 4 }}
        >
          {String(month).padStart(2, '0')}
        </div>

        <div
          className="font-sans font-bold text-white/90 tracking-[0.25em]"
          style={{ fontSize: isLandscape ? 22 : 18, marginBottom: 14 }}
        >
          {monthNames[month - 1]} · {year}
        </div>

        <div style={{ width: isLandscape ? 64 : 50, height: 2, background: themeColor, margin: '0 auto 14px' }} />

        <div
          className="text-white/70 font-semibold"
          style={{ fontSize: isLandscape ? 13 : 12, lineHeight: 1.8 }}
        >
          {meta.motto}
        </div>

        <div
          className="mt-5 font-mono tracking-[0.2em] text-white/50"
          style={{ fontSize: isLandscape ? 9.5 : 8.5 }}
        >
          {meta.side}
        </div>
      </div>

      {/* 하단 크레딧 */}
      <div className="absolute left-0 right-0 flex justify-center text-white/40 font-mono select-none" style={{
        bottom: pageHeight * 0.05,
        fontSize: isLandscape ? 9 : 8,
        letterSpacing: '4px',
      }}>
        MASTER DIARY · MONTHLY DIVIDER
      </div>
    </div>
  )
}
