'use client'

import React from 'react'
import QtQuickIndexNav from '../QtQuickIndexNav'
import QtQuickIndexNavPortrait from '../portrait/QtQuickIndexNavPortrait'

export type DiaryCoverVariant = 'all' | 'general' | 'church' | 'basic'

interface QtDiaryCoverPageProps {
  startYear?: number
  startMonth?: number
  endYear?: number
  endMonth?: number
  durationMonths?: number
  variant?: DiaryCoverVariant
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

const VARIANT_META: Record<DiaryCoverVariant, {
  title: string
  subtitle: string
  motto: string
  badge: string
  gradient: string
  accent: string
  icons: string[]
}> = {
  general: {
    title: 'GOD-LIFE DIARY',
    subtitle: '갓생 다이어리',
    motto: '"작은 습관의 변화가 위대한 운명을 만든다 — 아리스토텔레스"',
    badge: 'LIFE PLANNER · 20 PAGES PACK',
    gradient: 'linear-gradient(135deg, #0f766e 0%, #10b981 45%, #f59e0b 100%)',
    accent: '#ffffff',
    icons: ['⚡', '🌿', '📈', '💪', '🎯', '🏃'],
  },
  church: {
    title: '말씀과 함께하는',
    subtitle: '묵상 다이어리',
    motto: '"여호와는 나의 목자시니 내게 부족함이 없으리로다 — 시편 23:1"',
    badge: 'QUIET TIME PLANNER · 20 PAGES PACK',
    gradient: 'linear-gradient(160deg, #1e3a2f 0%, #3a5f43 50%, #b45309 130%)',
    accent: '#fde68a',
    icons: ['✝', '✦', '📖', '🕊️', '🙏', '🕯️'],
  },
  basic: {
    title: 'MINIMAL DIARY',
    subtitle: '미니멀 다이어리',
    motto: '"매일의 기록이 삶의 주인이 된다"',
    badge: 'CORE 5 PAGES PACK',
    gradient: 'linear-gradient(150deg, #0f172a 0%, #334155 100%)',
    accent: '#ffffff',
    icons: ['📅', '📝', '🗓️', '✏️'],
  },
  all: {
    title: 'MASTER DIARY',
    subtitle: '통합 마스터 다이어리',
    motto: '"하루의 기록, 일년의 완성"',
    badge: 'ALL 35 PAGES COLLECTION',
    gradient: 'linear-gradient(135deg, #312e81 0%, #6366f1 45%, #ec4899 100%)',
    accent: '#fef9c3',
    icons: ['✨', '📚', '🌿', '✝', '🎯', '💎'],
  },
}

export default function QtDiaryCoverPage({
  startYear = 2026,
  startMonth = 8,
  endYear = 2027,
  endMonth = 12,
  durationMonths = 17,
  variant = 'all',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtDiaryCoverPageProps) {
  const meta = VARIANT_META[variant]
  const periodLabel = `${String(startYear).padStart(4, '0')}.${String(startMonth).padStart(2, '0')} - ${String(endYear).padStart(4, '0')}.${String(endMonth).padStart(2, '0')}`
  const isLandscape = pageWidth > pageHeight
  const IndexComponent = isLandscape ? QtQuickIndexNav : QtQuickIndexNavPortrait

  return (
    <div
      data-page-key="cover"
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
      <IndexComponent activeTab="tracker" themeColor={themeColor} />
      {/* 풀배경 그라데이션 */}
      <div
        className="absolute inset-0"
        style={{ background: meta.gradient }}
      />

      {/* 장식 원형 오브 */}
      <div className="absolute rounded-full" style={{
        width: pageWidth * 0.55,
        height: pageWidth * 0.55,
        top: -pageWidth * 0.2,
        right: -pageWidth * 0.15,
        background: 'rgba(255,255,255,0.08)',
      }} />
      <div className="absolute rounded-full" style={{
        width: pageWidth * 0.4,
        height: pageWidth * 0.4,
        bottom: -pageWidth * 0.15,
        left: -pageWidth * 0.1,
        background: 'rgba(255,255,255,0.06)',
      }} />

      {/* 프리셋별 아이콘 장식 라인 */}
      <div className="absolute left-0 right-0 flex justify-center gap-4 opacity-30 select-none" style={{
        top: pageHeight * 0.1,
        fontSize: isLandscape ? 26 : 22,
        letterSpacing: '6px',
      }}>
        {meta.icons.map((ic, i) => (
          <span key={`cover-icon-${i}`}>{ic}</span>
        ))}
      </div>

      {/* 중앙 오버레이 패널 */}
      <div className="absolute flex flex-col items-center justify-center text-center" style={{
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'auto',
        maxWidth: isLandscape ? '72%' : '88%',
        padding: `${isLandscape ? 34 : 30}px ${isLandscape ? 52 : 38}px`,
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(10px)',
        borderRadius: isLandscape ? 22 : 18,
        border: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.28)',
      }}>
        <div className="flex items-center gap-3 mb-4" style={{ color: themeColor }}>
          <span style={{ fontSize: isLandscape ? 22 : 18, letterSpacing: '10px', opacity: 0.9 }}>✦</span>
          <span className="font-mono font-black tracking-[0.35em]" style={{ fontSize: isLandscape ? 11 : 10 }}>
            {meta.badge}
          </span>
          <span style={{ fontSize: isLandscape ? 22 : 18, letterSpacing: '10px', opacity: 0.9 }}>✦</span>
        </div>

        <div
          className="font-sans font-black text-slate-900 tracking-wide leading-tight"
          style={{ fontSize: isLandscape ? 46 : 38, marginBottom: 6 }}
        >
          {meta.title}
        </div>
        <div
          className="font-bold text-slate-500 tracking-widest"
          style={{ fontSize: isLandscape ? 16 : 14, marginBottom: 18 }}
        >
          {meta.subtitle}
        </div>

        <div style={{ width: isLandscape ? 72 : 56, height: 2, background: themeColor, margin: '0 auto 18px' }} />

        <div
          className="font-semibold text-slate-700"
          style={{ fontSize: isLandscape ? 14 : 12.5, lineHeight: 1.9 }}
        >
          {meta.motto}
        </div>

        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2" style={{ color: themeColor }}>
            <span className="font-black font-mono" style={{ fontSize: isLandscape ? 22 : 19 }}>{periodLabel}</span>
          </div>
          <span className="rounded-full font-bold text-white px-3 py-1" style={{ background: themeColor, fontSize: isLandscape ? 11 : 10 }}>
            {durationMonths}개월
          </span>
        </div>
      </div>

      {/* 하단 크레딧 라인 */}
      <div className="absolute left-0 right-0 flex justify-center text-white/70 font-mono select-none" style={{
        bottom: pageHeight * 0.06,
        fontSize: isLandscape ? 10 : 9,
        letterSpacing: '4px',
      }}>
        MASTER DIARY GENERATOR · {startYear} - {endYear}
      </div>
    </div>
  )
}
