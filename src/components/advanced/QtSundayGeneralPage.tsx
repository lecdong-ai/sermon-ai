'use client'

import React from 'react'
import QtQuickIndexNav from './QtQuickIndexNav'

interface QtSundayGeneralPageProps {
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

export default function QtSundayGeneralPage({
  year = 2026,
  month = 8,
  sundayNo = 1,
  dateStr = '08/02',
  sundayLabel = '8월 2일 (1주차 선데이)',
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtSundayGeneralPageProps) {
  return (
    <div
      data-page-key="tracker"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '20px 48px 20px 24px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      <QtQuickIndexNav currentMonth={month} activeTab="tracker" themeColor={themeColor} />
      {/* 1. Header Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-2">
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-400">
          <span>SUNDAY RESET RITUAL</span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shadow-xs">
            🌿 {sundayLabel}
          </span>
        </div>
      </div>

      {/* 2. Page Title & Energy/Mindset Gauge */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>🌿 {monthName} Sunday Reset — {sundayLabel}</span>
          </h1>
          <p className="text-[10.5px] text-slate-500 mt-0.5">
            한 주를 차분히 마감하고 다음 주를 완벽하게 준비하는 온전한 일요일 힐링 리셋 노틀입니다.
          </p>
        </div>

        {/* Weekly Energy & Mindset Gauge */}
        <div className="flex items-center gap-2 bg-emerald-50/80 border border-emerald-200 rounded-xl p-1.5 px-3 text-[9.5px]">
          <span className="font-bold text-emerald-950">🔋 에너지 충전:</span>
          <div className="flex items-center gap-1 font-mono text-[8.5px]">
            <span className="px-1.5 py-0.5 rounded bg-white border border-emerald-300 text-emerald-700 font-bold">100% 충전 □</span>
            <span className="px-1.5 py-0.5 rounded bg-white border border-emerald-200 text-slate-600">80% □</span>
            <span className="px-1.5 py-0.5 rounded bg-white border border-emerald-200 text-slate-600">60% □</span>
          </div>
        </div>
      </div>

      {/* 3. Main 2 Column Ritual Layout (Left 6 cols: Rituals & Highlights / Right 6 cols: Next Week TOP 3 & Mantra) */}
      <div className="grid grid-cols-12 gap-3 flex-1">
        {/* Left Column (6 cols): Sunday Reset Rituals & Highlights */}
        <div className="col-span-6 flex flex-col justify-between space-y-2">
          {/* Module A: 4 Sunday Reset Rituals Checklist */}
          <div className="border border-slate-200/90 rounded-2xl p-2.5 bg-slate-50/60 shadow-2xs space-y-1.5">
            <h4 className="text-[10.5px] font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1">
              <span className="flex items-center gap-1.5 font-serif">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                🧹 일요일 4대 리셋 루틴 (Sunday Reset Rituals)
              </span>
              <span className="text-[8.5px] text-emerald-700 font-mono font-bold">Checklist</span>
            </h4>
            <div className="space-y-1 text-[9px]">
              {[
                { title: '🧹 공간 정돈 (Room & Desk Clean)', desc: '책상, 옷장, 주변 공간을 깔끔하게 리셋하기' },
                { title: '📅 다음 주 캘린더 확정 (Calendar Lock)', desc: '다음 주 주요 일정, 약속, 마감일 최종 확인' },
                { title: '🎒 월요일 준비물 & 착장 코디 (Monday Fit)', desc: '가방 준비와 월요일 착장을 미리 챙기기' },
                { title: '🕯️ 스마트폰 OFF & 딥슬립 (Unplug & Rest)', desc: '잠들기 1시간 전 스마트폰 끄고 온전한 휴식' },
              ].map((rt, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white p-1.5 rounded-xl border border-slate-200/80">
                  <div>
                    <span className="font-bold text-slate-700 block">{rt.title}</span>
                    <span className="text-[8px] text-slate-400 font-normal">{rt.desc}</span>
                  </div>
                  <span className="w-4 h-4 rounded border border-emerald-300 bg-emerald-50 text-[9px] font-bold text-emerald-700 flex items-center justify-center shrink-0">□</span>
                </div>
              ))}
            </div>
          </div>

          {/* Module B: Weekly Highlight & Self-Care Note */}
          <div className="border border-slate-200/90 rounded-2xl p-2.5 bg-white shadow-2xs space-y-1.5 flex-1 flex flex-col justify-between">
            <h4 className="text-[10.5px] font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1">
              <span className="flex items-center gap-1.5 font-serif">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                ☀️ 이번 주 가장 행복했던 순간 & 셀프케어
              </span>
              <span className="text-[8.5px] text-amber-700 font-mono font-bold">Weekly Highlight</span>
            </h4>

            <div className="bg-amber-50/40 p-2 rounded-xl border border-amber-200/60 space-y-1">
              <span className="text-[9px] font-bold text-amber-900 block">🎉 이번 주 최고의 하이라이트 (Best Moment):</span>
              <div className="text-slate-700 font-serif text-[9px] min-h-[16px]">______________________________________________________</div>
            </div>

            <div className="bg-emerald-50/40 p-2 rounded-xl border border-emerald-200/60 space-y-1 flex-1 flex flex-col justify-around">
              <span className="text-[9px] font-bold text-emerald-900 block">☕ 주말 나를 위한 리프레시 & 칭찬 노트:</span>
              <div className="border-b border-dashed border-emerald-200 h-3 text-[8.5px] text-slate-400 font-serif" />
            </div>
          </div>
        </div>

        {/* Right Column (6 cols): Next Week TOP 3 Goals & Vision Mantra */}
        <div className="col-span-6 flex flex-col justify-between space-y-2">
          {/* Module C: Next Week TOP 3 Priorities */}
          <div className="border border-slate-200/90 rounded-2xl p-2.5 bg-white shadow-2xs space-y-1.5 flex-1 flex flex-col justify-between">
            <h4 className="text-[10.5px] font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1">
              <span className="flex items-center gap-1.5 font-serif">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                🎯 다음 주 핵심 목표 TOP 3 (Next Week Priorities)
              </span>
              <span className="text-[8.5px] text-indigo-700 font-mono font-bold">Top 3 Focus</span>
            </h4>
            <div className="space-y-1.5 text-[9px] flex-1 flex flex-col justify-around">
              {[
                { no: '01', title: '핵심 목표 1:', desc: '가장 시급하고 성과가 큰 핵심 과제' },
                { no: '02', title: '핵심 목표 2:', desc: '지속 성장 및 습관 관리를 위한 과제' },
                { no: '03', title: '핵심 목표 3:', desc: '개인 웰니스 및 관계를 위한 과제' },
              ].map((p, idx) => (
                <div key={idx} className="bg-slate-50/60 p-2 rounded-xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between text-slate-700 font-bold">
                    <span className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white font-mono text-[8px]">{p.no}</span>
                      {p.title}
                    </span>
                    <span className="text-[8px] text-slate-400 font-normal">{p.desc}</span>
                  </div>
                  <div className="text-slate-800 font-serif text-[9px] min-h-[14px]">______________________________________________________</div>
                </div>
              ))}
            </div>
          </div>

          {/* Module D: Obstacle Protection & Solution */}
          <div className="border border-slate-200/90 rounded-2xl p-2.5 bg-slate-50/60 shadow-2xs space-y-1">
            <span className="text-[9.5px] font-bold text-rose-900 flex items-center gap-1">
              <span>🛡️ 다음 주 예상 장애물 & 사전 대비책 (Obstacle Protection):</span>
            </span>
            <div className="text-slate-600 font-serif text-[8.5px] min-h-[14px]">장애요소: ____________________ ➔ 대비책: ____________________</div>
          </div>

          {/* Module E: Weekly Vision Mantra */}
          <div className="border border-emerald-200/90 rounded-2xl p-2 bg-emerald-50/70 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-[9.5px] font-bold text-emerald-950">
              <span>🌟 다음 주를 이끌 나만의 비전 선언문 (Weekly Vision Mantra)</span>
              <span className="text-emerald-700 font-mono">Monday Ready!</span>
            </div>
            <div className="border-b border-dashed border-emerald-200 h-3 text-[8.5px] text-emerald-900/80 font-serif">"다음 주 나는 당당하고 지혜롭게 행동하며 내 목표를 자신 있게 달성합니다."</div>
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>PREMIUM DIARY STUDIO — SUNDAY RESET & WEEKLY REFRESH MASTER</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
