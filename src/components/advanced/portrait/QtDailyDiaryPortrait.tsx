'use client'

import React from 'react'
import PerfectGridNote from '../PerfectGridNote'

interface QtDailyDiaryPortraitProps {
  dateLabel: string
  dayNum: number
  dayName: string
  monthName: string
  yearLabel?: string
  themeColor?: string
  activeWeek?: string
  isChurchMode?: boolean
  pageWidth?: number
  pageHeight?: number
}

export default function QtDailyDiaryPortrait({
  dateLabel,
  dayNum,
  dayName,
  monthName = 'August',
  yearLabel = '2026',
  themeColor = '#B8C6D9',
  activeWeek = 'W1',
  isChurchMode = false,
  pageWidth = 1024,
  pageHeight = 1448,
}: QtDailyDiaryPortraitProps) {
  const paddedDay = String(dayNum).padStart(2, '0')
  const isSunday = dayName === 'SUN'

  return (
    <div
      data-page-key={`day-${dayNum}-portrait`}
      data-day={dayNum}
      data-page-type="full-bleed"
      className={`qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto transition-all ${
        isSunday ? 'border-2 border-emerald-400/80 bg-gradient-to-b from-emerald-50/30 via-white to-slate-50/20' : ''
      }`}
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '36px 44px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-3 mb-3">
        <div className="flex items-center space-x-4 text-xs font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{yearLabel}</span>
          <span className="px-2.5 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-900 text-white font-bold text-xs shadow-xs font-mono">
          📅 DAILY PLANNER ({paddedDay} {dayName})
        </span>
      </div>

      {/* 2. Month & Day Title Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-4">
          <div
            className={`w-14 h-14 rounded-full flex flex-col items-center justify-center text-white shadow-xs font-serif ${
              isSunday ? 'bg-emerald-600 ring-2 ring-emerald-300 shadow-md' : ''
            }`}
            style={{ backgroundColor: isSunday ? undefined : themeColor }}
          >
            <span className="text-xl font-bold leading-tight">{paddedDay}</span>
            <span className="text-[10px] uppercase tracking-tighter font-extrabold">{dayName}</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-wide">{monthName} {paddedDay}일</h2>
              {isSunday && (
                <span className={`px-3 py-0.5 rounded-full text-xs font-bold border shadow-xs whitespace-nowrap inline-block ${
                  isChurchMode
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-emerald-100 text-emerald-950 border-emerald-300'
                }`}>
                  {isChurchMode ? "🕊️ LORD'S DAY (주일 예배 & 안식)" : "☀️ SUNDAY RESET (주말 휴식 & 리프레시)"}
                </span>
              )}
            </div>
            <div className="h-1 w-28 rounded-full mt-1" style={{ backgroundColor: isSunday ? '#059669' : themeColor, opacity: 0.7 }} />
          </div>
        </div>

        <div className="text-right border border-slate-200 rounded-xl px-4 py-2 bg-slate-50/60 shadow-xs">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">DAILY REFLECTION</span>
          <span className="text-xs font-serif font-semibold text-slate-800">
            {isChurchMode
              ? '"오늘도 내 걸음을 인도하시는 주님의 은혜 안에 거합니다"'
              : '"오늘 하루의 정성 어린 노력이 내일의 성장을 만든다"'
            }
          </span>
        </div>
      </div>

      {/* 3. Top Master Controls (Priorities + Prayer/Mindset) */}
      <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
        {/* Priorities */}
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-1.5">
          <div className="font-bold text-slate-800 font-serif flex items-center justify-between border-b border-slate-200 pb-1">
            <span>🎯 오늘의 3대 핵심 우선순위</span>
            <span className="font-mono text-[10px] text-slate-400">Priorities</span>
          </div>
          <div className="space-y-1 text-xs text-slate-600 font-serif">
            <div>1. _________________________________</div>
            <div>2. _________________________________</div>
            <div>3. _________________________________</div>
          </div>
        </div>

        {/* Prayer / Mindset */}
        <div className={`border rounded-xl p-3 shadow-xs space-y-1.5 ${
          isChurchMode ? 'border-amber-200 bg-amber-50/20' : 'border-emerald-200 bg-emerald-50/20'
        }`}>
          <div className={`font-bold font-serif border-b pb-1 flex items-center justify-between ${
            isChurchMode ? 'text-amber-950 border-amber-200' : 'text-emerald-950 border-emerald-200'
          }`}>
            <span>{isChurchMode ? '🙏 오늘의 기도제목 & 감사' : '💡 오늘의 다짐 & 마인드셋'}</span>
            <span className="font-mono text-[10px] text-slate-400">{isChurchMode ? 'Prayer' : 'Mindset'}</span>
          </div>
          <div className="space-y-1 text-xs font-serif text-slate-600">
            <div>① {isChurchMode ? '하나님을 향한 감사:' : '긍정 확언 (Daily Affirmation):'} ___________________</div>
            <div>② {isChurchMode ? '간절한 중보 기도제목:' : '핵심 미션 & 태도:'} ___________________</div>
          </div>
        </div>
      </div>

      {/* 4. Main Stack: To-Do List & Full Journal Note */}
      <div className="grid grid-cols-12 gap-3 flex-1 mb-3">
        {/* Left: To-Do List & Health (5 cols) */}
        <div className="col-span-5 flex flex-col justify-between space-y-3 border-r border-slate-200 pr-3">
          <div className="border border-slate-200 rounded-xl p-3 bg-white flex-1 flex flex-col justify-between shadow-xs space-y-1.5">
            <div className="font-bold text-slate-800 font-serif flex items-center justify-between border-b border-slate-200 pb-1 text-xs">
              <span>☑️ TO-DO LIST (할 일 목록)</span>
              <span className="font-mono text-[10px] text-slate-400">Tasks</span>
            </div>
            <div className="space-y-1.5 flex-1 flex flex-col justify-around text-xs font-serif">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="w-3.5 h-3.5 border border-slate-400 rounded-xs bg-slate-50" />
                  <div className="flex-1 border-b border-slate-200 ml-2 h-3 text-slate-400">_______________</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50/40 text-xs font-serif space-y-1">
            <span className="font-bold text-slate-700 block">🥗 웰니스 & 헬스 로그:</span>
            <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600">
              <div className="bg-white p-1 rounded border border-slate-200">감정: Good / Bad</div>
              <div className="bg-white p-1 rounded border border-slate-200">운동: ___분 달성</div>
            </div>
          </div>
        </div>

        {/* Right: Full Journal Note (7 cols) */}
        <div className="col-span-7 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1 text-xs">
            <h3 className="font-bold text-slate-800 font-serif">📝 데일리 일기 & 자유 메모 (Journal & Notes)</h3>
            <span className="font-mono text-[10px] text-slate-400">Grid Note</span>
          </div>

          <div className="flex-1 border border-slate-200 rounded-xl p-1 bg-white">
            <PerfectGridNote step={15} />
          </div>
        </div>
      </div>

      {/* 5. Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-300">
        <span>PREMIUM DIARY STUDIO — DAILY PLANNER MASTER</span>
        <span>{yearLabel} {monthName} Edition</span>
      </div>
    </div>
  )
}
