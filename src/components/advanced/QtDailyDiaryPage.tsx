'use client'

import React from 'react'
import PerfectGridNote from './PerfectGridNote'

interface QtDailyDiaryPageProps {
  dateLabel: string   // 예: "01 SAT"
  dayNum: number      // 예: 1
  dayName: string     // 예: "SAT"
  monthName: string   // 예: "August"
  yearLabel?: string  // 예: "2026"
  themeColor?: string // 수채화 파스텔 테마 색상 (기본: #B8C6D9 - 8월 쿨 블루)
  activeWeek?: string // 예: "W1"
  isChurchMode?: boolean // 교회 묵상용 모드 여부 (false일 경우 일반인 갓생 모드)
  pageWidth?: number
  pageHeight?: number
}

export default function QtDailyDiaryPage({
  dateLabel,
  dayNum,
  dayName,
  monthName = 'August',
  yearLabel = '2026',
  themeColor = '#B8C6D9',
  activeWeek = 'W1',
  isChurchMode = false,
  pageWidth = 1024,
  pageHeight = 768,
}: QtDailyDiaryPageProps) {
  const paddedDay = String(dayNum).padStart(2, '0')
  const isSunday = dayName === 'SUN'

  return (
    <div
      data-page-key={`day-${dayNum}`}
      data-day={dayNum}
      data-page-type="full-bleed"
      className={`qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto transition-all ${
        isSunday ? 'border-2 border-emerald-400/80 bg-gradient-to-b from-emerald-50/30 via-white to-slate-50/20' : ''
      }`}
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '24px 32px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      {/* 1. Top Navigation Bar (Header) */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-3">
        {/* Left Nav */}
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-wider text-slate-400 font-mono">
          <span data-nav-target="calendar" className="cursor-pointer hover:text-slate-600">YEARLY</span>
          <span data-nav-target="calendar" className="cursor-pointer hover:text-slate-600">{yearLabel}</span>
          <span data-nav-target="calendar" className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold cursor-pointer">{monthName.toUpperCase().slice(0, 3)}</span>
        </div>

        {/* Right Nav */}
        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-400 font-mono">
          <span data-nav-target="calendar" className="cursor-pointer hover:text-slate-600">MONTHLY</span>
          <span data-nav-target="overview" className="cursor-pointer hover:text-slate-600">OVERVIEW</span>
          {['W1', 'W2', 'W3', 'W4', 'W5'].map((w, idx) => (
            <span
              key={w}
              data-nav-target={`week-${idx + 1}`}
              className={`cursor-pointer px-1.5 py-0.5 rounded ${
                activeWeek === w ? 'bg-slate-800 text-white font-bold shadow-2xs' : 'hover:text-slate-600'
              }`}
            >
              {w}
            </span>
          ))}
        </div>
      </div>

      {/* 2. Month & Day Title Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-4">
          {/* Date Circle Badge */}
          <div
            className={`w-12 h-12 rounded-full flex flex-col items-center justify-center text-white shadow-xs font-serif ${
              isSunday ? 'bg-emerald-600 ring-2 ring-emerald-300 shadow-md' : ''
            }`}
            style={{ backgroundColor: isSunday ? undefined : themeColor }}
          >
            <span className="text-base font-bold leading-tight">{paddedDay}</span>
            <span className="text-[9px] uppercase tracking-tighter font-extrabold">{dayName}</span>
          </div>

          {/* Month Title & Subline */}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-wide">{monthName} {paddedDay}일</h2>
              {isSunday && (
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-2xs whitespace-nowrap inline-block ${
                  isChurchMode
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-emerald-100 text-emerald-950 border-emerald-300'
                }`}>
                  {isChurchMode ? "🕊️ LORD'S DAY (주일 예배 & 안식)" : "☀️ SUNDAY RESET (주말 휴식 & 리프레시)"}
                </span>
              )}
            </div>
            <div className="h-1 w-24 rounded-full mt-1" style={{ backgroundColor: isSunday ? '#059669' : themeColor, opacity: 0.7 }} />
          </div>
        </div>

        {/* Right Inspiration Quote Banner */}
        <div className="text-right border border-slate-200 rounded-xl px-3 py-1 bg-slate-50/60 shadow-2xs">
          <span className="text-[8px] font-mono font-bold text-slate-400 uppercase block">DAILY REFLECTION</span>
          <span className="text-[10px] font-serif font-semibold text-slate-700">
            {isChurchMode
              ? '"오늘도 내 걸음을 인도하시는 주님의 은혜 안에 거합니다"'
              : '"오늘 하루의 정성 어린 노력이 내일의 성장을 만든다"'
            }
          </span>
        </div>
      </div>

      {/* 3. Main 3-Column Content Layout */}
      <div className="grid grid-cols-12 gap-3 flex-1 mb-2">
        {/* ===== Column 1: Priorities & To-Do List (3 cols) ===== */}
        <div className="col-span-3 flex flex-col justify-between border-r border-slate-200 pr-2 space-y-2">
          {/* Priorities Section */}
          <div className="border border-slate-200 rounded-xl p-2 bg-slate-50/50 space-y-1">
            <h3 className="text-[9.5px] font-bold text-slate-800 font-serif flex items-center justify-between border-b border-slate-200 pb-0.5">
              <span>🎯 오늘의 3대 우선순위</span>
              <span className="font-mono text-[7.5px] text-slate-400">Priorities</span>
            </h3>
            <div className="space-y-1 text-[8.5px] text-slate-600 font-serif pt-0.5">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded border border-slate-400 inline-block text-[7px] text-center leading-tight">1</span>
                <span>__________________</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded border border-slate-400 inline-block text-[7px] text-center leading-tight">2</span>
                <span>__________________</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded border border-slate-400 inline-block text-[7px] text-center leading-tight">3</span>
                <span>__________________</span>
              </div>
            </div>
          </div>

          {/* To Do List Section */}
          <div className="flex-1 border border-slate-200 rounded-xl p-2 bg-white flex flex-col justify-between shadow-2xs space-y-1">
            <h3 className="text-[9.5px] font-bold text-slate-800 font-serif flex items-center justify-between border-b border-slate-200 pb-0.5">
              <span>☑️ TO-DO LIST (할 일 목록)</span>
              <span className="font-mono text-[7.5px] text-slate-400">Tasks</span>
            </h3>
            <div className="space-y-1 flex-1 flex flex-col justify-around text-[8px] font-serif pt-0.5">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="w-2.5 h-2.5 border border-slate-400 rounded-xs bg-slate-50" />
                  <div className="flex-1 border-b border-slate-200 ml-1.5 h-2.5 text-slate-400">_________</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== Column 2: Mindset / Prayer & Health Tracker (4 cols) ===== */}
        <div className="col-span-4 flex flex-col justify-between border-r border-slate-200 pr-2 space-y-2">
          {/* Affirmation / Prayer Box (Smart Adaptor) */}
          <div className={`border rounded-xl p-2.5 shadow-2xs space-y-1 ${
            isChurchMode ? 'border-amber-200 bg-amber-50/20' : 'border-emerald-200 bg-emerald-50/20'
          }`}>
            <h4 className={`text-[9.5px] font-bold font-serif border-b pb-0.5 flex items-center justify-between ${
              isChurchMode ? 'text-amber-950 border-amber-200' : 'text-emerald-950 border-emerald-200'
            }`}>
              <span>{isChurchMode ? '🙏 오늘의 기도제목 & 감사' : '💡 오늘의 다짐 & 마인드셋'}</span>
              <span className="font-mono text-[7.5px] text-slate-400">{isChurchMode ? 'Prayer' : 'Mindset'}</span>
            </h4>
            <div className="space-y-1 text-[8.5px] font-serif text-slate-600 pt-0.5">
              <div className="bg-white p-1 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-700 text-[8px] block">
                  {isChurchMode ? '① 하나님을 향한 감사:' : '① 긍정 확언 (Daily Affirmation):'}
                </span>
                <div className="text-slate-400 min-h-[14px]">________________________</div>
              </div>
              <div className="bg-white p-1 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-700 text-[8px] block">
                  {isChurchMode ? '② 간절한 중보 기도제목:' : '② 핵심 미션 & 태도:'}
                </span>
                <div className="text-slate-400 min-h-[14px]">________________________</div>
              </div>
            </div>
          </div>

          {/* Health & Life Tracker */}
          <div className="border border-slate-200 rounded-xl p-2 bg-slate-50/40 space-y-1">
            <h4 className="text-[9.5px] font-bold text-slate-800 font-serif border-b border-slate-200 pb-0.5 flex items-center justify-between">
              <span>🥗 웰니스 & 헬스 체크</span>
              <span className="font-mono text-[7.5px] text-slate-400">Health</span>
            </h4>
            <div className="grid grid-cols-2 gap-1 text-[8px] font-serif text-slate-600 pt-0.5">
              <div className="bg-white p-1 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-500 block">감정 (MOOD):</span>
                <span className="text-slate-400">좋음 / 보통 / 나쁨</span>
              </div>
              <div className="bg-white p-1 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-500 block">운동 (EXERCISE):</span>
                <span className="text-slate-400">___분 달성</span>
              </div>
              <div className="bg-white p-1 rounded-lg border border-slate-200 col-span-2">
                <span className="font-bold text-slate-500 block">식단 (MEALS):</span>
                <span className="text-slate-400">아침 / 점심 / 저녁 (물 2L □)</span>
              </div>
            </div>
          </div>

          {/* Today's Satisfaction */}
          <div className="border border-slate-200 rounded-xl p-2 bg-white flex items-center justify-between text-[8.5px] font-serif">
            <span className="font-bold text-slate-700">오늘 하루 종합 만족도:</span>
            <span className="text-amber-400 font-bold text-[10px]">★ ★ ★ ★ ★</span>
          </div>
        </div>

        {/* ===== Column 3: Journaling & Notes (5 cols) ===== */}
        <div className="col-span-5 flex flex-col justify-between space-y-1">
          <div className="flex items-center justify-between border-b border-slate-200 pb-0.5">
            <h3 className="text-[9.5px] font-bold text-slate-800 font-serif flex items-center gap-1">
              <span>📝 데일리 일기 & 자유 메모 (Journal & Notes)</span>
            </h3>
            <span className="font-mono text-[7.5px] text-slate-400">Grid Note</span>
          </div>

          <div className="flex-1 border border-slate-200 rounded-xl p-1 bg-white">
            <PerfectGridNote step={14} />
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200">
        <span>PREMIUM DIARY STUDIO — DAILY PLANNER MASTER</span>
        <span>{yearLabel} {monthName} Edition</span>
      </div>
    </div>
  )
}
