'use client'

import React from 'react'
import QtQuickIndexNav from './QtQuickIndexNav'

interface QtKptReviewPage2Props {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

const MONTH_MAP: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
}

export default function QtKptReviewPage2({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtKptReviewPage2Props) {
  const monthNum = MONTH_MAP[monthName] || 8

  return (
    <div
      data-page-key="kpt"
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
      <QtQuickIndexNav currentMonth={monthNum} activeTab="tracker" themeColor={themeColor} />
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-2">
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-400">
          <span>WEEKLY RETROSPECTIVE & ACTION TRACKER</span>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-bold text-[10px] shadow-xs">
            ⚡ 4주차 딥다이브 & 액션 트래커 (VOL. 2)
          </span>
        </div>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-sans font-bold text-slate-800 tracking-wide whitespace-nowrap">
            ⚡ {monthName} 4-Week KPT Deep-Dive & Action Tracker
          </h1>
          <p className="text-[10.5px] text-slate-500 mt-0.5 whitespace-nowrap">
            주차별 KPT를 지속적으로 기록하고 Try에서 이어진 구체적 실행 과제의 달성 여부를 모니터링합니다.
          </p>
        </div>

        <div className="px-3 py-1 rounded-full text-xs font-bold text-indigo-950 bg-indigo-50 border border-indigo-200 shadow-xs whitespace-nowrap">
          실행 중심 4주차 회고 매트릭스
        </div>
      </div>

      {/* 3. 4-Week KPT Matrix Grid (2 rows x 2 cols) */}
      <div className="grid grid-cols-2 gap-3 flex-1 mb-2">
        {[
          { week: '1주차 (01일~07일)', label: 'Week 1 KPT', color: 'border-emerald-300 bg-emerald-50/20' },
          { week: '2주차 (08일~14일)', label: 'Week 2 KPT', color: 'border-indigo-300 bg-indigo-50/20' },
          { week: '3주차 (15일~21일)', label: 'Week 3 KPT', color: 'border-amber-300 bg-amber-50/20' },
          { week: '4주차 (22일~31일)', label: 'Week 4 KPT', color: 'border-purple-300 bg-purple-50/20' },
        ].map((w, idx) => (
          <div
            key={idx}
            className={`border rounded-2xl p-2.5 ${w.color} flex flex-col justify-between shadow-2xs space-y-1`}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-1 text-[9.5px]">
              <span className="font-bold text-slate-800 font-sans">📅 {w.week}</span>
              <span className="font-mono text-[8.5px] text-slate-400 font-bold">{w.label}</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 flex-1 text-[8.5px]">
              <div className="bg-white/90 p-1.5 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                <span className="font-bold text-emerald-800 block border-b border-slate-100 pb-0.5">🟢 Keep</span>
                <div className="text-slate-400 font-sans text-[8px] min-h-[24px]">· ______________</div>
              </div>
              <div className="bg-white/90 p-1.5 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                <span className="font-bold text-rose-800 block border-b border-slate-100 pb-0.5">🔴 Problem</span>
                <div className="text-slate-400 font-sans text-[8px] min-h-[24px]">· ______________</div>
              </div>
              <div className="bg-white/90 p-1.5 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                <span className="font-bold text-indigo-800 block border-b border-slate-100 pb-0.5">🔵 Try</span>
                <div className="text-slate-400 font-sans text-[8px] min-h-[24px]">· ______________</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Action Items & Execution Tracker Table (5 Rows) */}
      <div className="border border-indigo-200/90 rounded-2xl p-2.5 bg-white shadow-2xs space-y-1.5">
        <div className="flex items-center justify-between border-b border-indigo-200 pb-1 text-[10px]">
          <span className="font-bold text-indigo-950 font-sans flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
            ⚡ KPT 기반 핵심 실행 과제 & 달성 여부 (Action Items & Execution Checklist)
          </span>
          <span className="text-[8.5px] text-slate-400 font-mono">Action / Due Date / Status</span>
        </div>

        <div className="grid grid-cols-12 gap-1 text-[8.5px] font-bold text-slate-500 bg-slate-100 p-1 rounded-md text-center">
          <span className="col-span-1">NO</span>
          <span className="col-span-6 text-left pl-1">구체적 실행 과제 (Action Item from Try)</span>
          <span className="col-span-2">담당/목표</span>
          <span className="col-span-2">완료 기한</span>
          <span className="col-span-1">상태</span>
        </div>

        <div className="space-y-0.5 text-[8.5px]">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="grid grid-cols-12 gap-1 items-center border-b border-dashed border-slate-200 py-[1.5px] text-slate-400">
              <span className="col-span-1 text-center font-mono font-bold text-slate-600">0{n}</span>
              <span className="col-span-6 text-slate-300 truncate">_________________________________________</span>
              <span className="col-span-2 text-center text-slate-300">내 목표</span>
              <span className="col-span-2 text-center font-mono text-[8px] text-slate-400">2026.08.__</span>
              <span className="col-span-1 text-center text-[8px] text-emerald-700 font-bold">완료 □</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>PREMIUM RETROSPECTIVE STUDIO — 4-WEEK DEEP-DIVE & ACTION TRACKER (VOL. 2)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
