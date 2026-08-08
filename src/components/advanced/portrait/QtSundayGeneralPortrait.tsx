'use client'

import React from 'react'
import QtQuickIndexNavPortrait from './QtQuickIndexNavPortrait'

interface QtSundayGeneralPortraitProps {
  year?: number
  month?: number
  sundayNo?: number
  dateStr?: string
  sundayLabel?: string
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtSundayGeneralPortrait({
  year = 2026,
  month = 8,
  sundayNo = 1,
  dateStr = '08/02',
  sundayLabel = '8월 2일 (1주차 선데이)',
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 1448,
}: QtSundayGeneralPortraitProps) {
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
      <QtQuickIndexNavPortrait currentMonth={month} activeTab="tracker" themeColor={themeColor} />
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
          🌿 {sundayLabel}
        </span>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2 whitespace-nowrap">
            <span>🌿 {monthName} Sunday Reset — {sundayLabel}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            한 주를 온전히 마감하고 다음 주를 완벽하게 준비하는 전용 힐링 리셋 서식입니다.
          </p>
        </div>
        <div className="px-4 py-1.5 rounded-full text-xs font-bold text-emerald-950 bg-emerald-50 border border-emerald-200 shadow-xs">
          일요일 전용 힐링 노틀
        </div>
      </div>

      {/* 3. Energy & Mindset Gauge Banner */}
      <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 mb-3 text-xs shadow-xs">
        <span className="font-bold text-emerald-950 flex items-center gap-2">
          <span>🔋 주간 에너지 & 멘탈 충전 게이지:</span>
        </span>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-700 font-bold">100% 충전 □</span>
          <span className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-slate-600">80% □</span>
          <span className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-slate-600">60% □</span>
        </div>
      </div>

      {/* 4. Main Modules Stack */}
      <div className="space-y-4 flex-1 flex flex-col justify-between mb-3">
        {/* Module A: 4 Sunday Reset Rituals Checklist */}
        <div className="border border-slate-200/90 rounded-2xl p-4 bg-slate-50/60 shadow-xs space-y-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="flex items-center gap-2 font-serif">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              🧹 일요일 4대 리셋 루틴 (Sunday Reset Rituals)
            </span>
            <span className="text-xs text-emerald-700 font-mono font-bold">Checklist</span>
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { title: '🧹 공간 정돈 (Room Clean)', desc: '책상, 옷장 주변 정리 정돈' },
              { title: '📅 다음 주 캘린더 확정', desc: '주요 일정 및 마감일 최종 확인' },
              { title: '🎒 월요일 착장 미리 픽스', desc: '가방과 월요일 옷 챙기기' },
              { title: '🕯️ 온전한 스마트폰 OFF', desc: '잠들기 1시간 전 딥슬립 준비' },
            ].map((rt, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200/80">
                <div>
                  <span className="font-bold text-slate-700 block">{rt.title}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{rt.desc}</span>
                </div>
                <span className="w-5 h-5 rounded border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-700 flex items-center justify-center shrink-0">□</span>
              </div>
            ))}
          </div>
        </div>

        {/* Module B: Weekly Highlight & Self-Care */}
        <div className="border border-slate-200/90 rounded-2xl p-4 bg-white shadow-xs space-y-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="flex items-center gap-2 font-serif">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              ☀️ 이번 주 가장 행복했던 순간 & 셀프케어
            </span>
            <span className="text-xs text-amber-700 font-mono font-bold">Weekly Highlight</span>
          </h4>
          <div className="bg-amber-50/40 p-2.5 rounded-xl border border-amber-200/60 space-y-1">
            <span className="text-xs font-bold text-amber-900 block">🎉 이번 주 최고의 하이라이트 (Best Moment):</span>
            <div className="text-slate-700 font-serif text-xs min-h-[18px]">__________________________________________________</div>
          </div>
          <div className="bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-200/60 space-y-1">
            <span className="text-xs font-bold text-emerald-900 block">☕ 주말 나를 위한 리프레시 & 칭찬 노트:</span>
            <div className="text-slate-700 font-serif text-xs min-h-[18px]">__________________________________________________</div>
          </div>
        </div>

        {/* Module C: Next Week TOP 3 Priorities */}
        <div className="border border-slate-200/90 rounded-2xl p-4 bg-white shadow-xs space-y-2 flex-1 flex flex-col justify-between">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="flex items-center gap-2 font-serif">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
              🎯 다음 주 핵심 목표 TOP 3 (Next Week Priorities)
            </span>
            <span className="text-xs text-indigo-700 font-mono font-bold">Top 3 Focus</span>
          </h4>
          <div className="space-y-2 text-xs flex-1 flex flex-col justify-around">
            {[
              { no: '01', title: '핵심 목표 1:', desc: '가장 시급하고 성과가 큰 핵심 과제' },
              { no: '02', title: '핵심 목표 2:', desc: '지속 성장 및 습관 관리를 위한 과제' },
              { no: '03', title: '핵심 목표 3:', desc: '개인 웰니스 및 관계를 위한 과제' },
            ].map((p, idx) => (
              <div key={idx} className="bg-slate-50/60 p-2.5 rounded-xl border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between text-slate-700 font-bold">
                  <span className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-mono text-xs">{p.no}</span>
                    {p.title}
                  </span>
                  <span className="text-xs text-slate-400 font-normal">{p.desc}</span>
                </div>
                <div className="text-slate-800 font-serif text-xs min-h-[16px]">__________________________________________________</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Weekly Vision Mantra Banner */}
      <div className="border border-emerald-200/90 rounded-2xl p-3 bg-emerald-50/70 shadow-xs mb-2 space-y-1">
        <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
          <span>🌟 다음 주를 이끌 나만의 비전 선언문 (Weekly Vision Mantra)</span>
          <span className="text-emerald-700 font-mono">Monday Ready!</span>
        </div>
        <div className="border-b border-dashed border-emerald-200 h-4 text-xs text-emerald-900/80 font-serif">"다음 주 나는 당당하고 지혜롭게 행동하며 내 목표를 자신 있게 달성합니다."</div>
      </div>

      {/* 6. Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-300">
        <span>PREMIUM DIARY STUDIO — SUNDAY RESET & WEEKLY REFRESH MASTER</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
