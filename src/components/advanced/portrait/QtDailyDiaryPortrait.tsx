'use client'

import React from 'react'
import PerfectGridNote from '../PerfectGridNote'
import QtQuickIndexNavPortrait from './QtQuickIndexNavPortrait'

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

const MONTH_MAP: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
}

const ENGLISH_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const GENERAL_QUOTES: { l1: string; l2: string }[] = [
  { l1: '오늘 하루를 가치 있게 채운 찰나의', l2: '순간들이 나를 지지하는 든든한 자산이 됩니다' },
  { l1: '작은 습관 하나가 쌓여', l2: '인생의 방향을 바꾼다' },
  { l1: '오늘의 선택이', l2: '내일의 나를 만들어 간다' },
  { l1: '느려도 괜찮다, 멈추지 않는 한', l2: '언젠가는 도착한다' },
  { l1: '하루의 시작을 감사로 열면', l2: '하루의 끝은 기쁨으로 닫힌다' },
  { l1: '나를 위한 시간, 오늘', l2: '가장 소중한 투자를 한다' },
  { l1: '완벽한 하루보다', l2: '꾸준한 하루가 더 강하다' },
  { l1: '지금 이 순간의 집중이', l2: '미래의 나를 만든다' },
]

const CHURCH_QUOTES: { l1: string; l2: string }[] = [
  { l1: '오늘도 나를 향한 주님의 은혜와 사랑을', l2: '기억하며 하루를 감사함으로 봉헌합니다' },
  { l1: '주님과 함께하는 하루,', l2: '두려움 없이 걷습니다' },
  { l1: '말씀을 묵상하는 아침은', l2: '하루의 방향을 바꿉니다' },
  { l1: '은혜로 시작하는 하루는', l2: '은혜로 마무리됩니다' },
  { l1: '나의 힘으로가 아니라', l2: '주님의 인도하심으로 걷습니다' },
  { l1: '감사할 일을 찾는 눈은', l2: '세상을 변화시킵니다' },
  { l1: '주님의 사랑을 전하는', l2: '오늘이 되게 하소서' },
  { l1: '쉬는 것도 은혜, 일하는 것도', l2: '주님과 함께라면' },
]

function getPureEnglishMonth(mName?: string): string {
  if (!mName) return 'August'
  if (MONTH_MAP[mName]) return mName
  const match = mName.match(/\d+/)
  if (match) {
    const num = parseInt(match[0], 10)
    if (num >= 1 && num <= 12) return ENGLISH_MONTHS[num - 1]
  }
  return 'August'
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
  const isSaturday = dayName === 'SAT'
  const englishMonth = getPureEnglishMonth(monthName)
  const monthNum = MONTH_MAP[englishMonth] || 8
  const weekNum = parseInt(activeWeek.replace(/\D/g, ''), 10) || 1
  const quote = (isChurchMode ? CHURCH_QUOTES : GENERAL_QUOTES)[(dayNum - 1) % 8]

  return (
    <div
      data-page-key={`day-${dayNum}`}
      data-day={dayNum}
      data-page-type="full-bleed"
      className={`qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-visible shadow-[0_20px_60px_rgba(0,0,0,0.35)] rounded-xl border border-[#E6E0D4] mx-auto transition-all ${
        isSunday ? 'border-2 border-emerald-400/80 bg-gradient-to-b from-emerald-50/30 via-white to-slate-50/20' : ''
      }`}
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '24px 56px 20px 20px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      <QtQuickIndexNavPortrait currentMonth={monthNum} currentWeek={weekNum} activeTab="daily" themeColor={themeColor} />
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-3 mb-3">
        <div className="flex items-center space-x-4 text-xs font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{yearLabel}</span>
          <span className="px-2.5 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {englishMonth.toUpperCase().slice(0, 3)}
          </span>
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-900 text-white font-bold text-xs shadow-xs font-mono">
          📅 DAILY JOURNAL ({paddedDay} {dayName})
        </span>
      </div>

      {/* 2. Month & Day Title Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-4">
          <div
            className={`w-14 h-14 rounded-full flex flex-col items-center justify-center text-white shadow-xs font-sans ${
              isSunday ? 'bg-emerald-600 ring-2 ring-emerald-300 shadow-md' : isSaturday ? 'bg-blue-600' : ''
            }`}
            style={{ backgroundColor: isSunday || isSaturday ? undefined : themeColor }}
          >
            <span className="text-xl font-bold leading-tight">{paddedDay}</span>
            <span className="text-[10px] uppercase tracking-tighter font-extrabold">{dayName}</span>
          </div>

          <div>
            <div className="flex items-center gap-3 whitespace-nowrap">
              <h2 className="text-4xl font-normal text-slate-900 tracking-wide leading-none whitespace-nowrap" style={{ fontFamily: "'Great Vibes', 'Alex Brush', 'Dancing Script', cursive" }}>{englishMonth} {paddedDay}</h2>
            </div>
            {isSunday && (
              <span className={`mt-1 inline-block px-2.5 py-0.5 rounded-full text-[9.5px] font-bold border shadow-xs whitespace-nowrap ${
                isChurchMode
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-emerald-100 text-emerald-950 border-emerald-300'
              }`}>
                {isChurchMode ? "🕊️ LORD'S DAY · 주일 예배 & 안식" : "☀️ SUNDAY RESET · 주말 휴식 & 리프레시"}
              </span>
            )}
          </div>
        </div>

        <div className={`text-right border rounded-xl px-4 py-2 shadow-xs ${
          isChurchMode
            ? 'bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-amber-50/80 border-amber-200'
            : 'bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-emerald-50/80 border-emerald-200'
        }`}>
          <span className={`text-[9px] font-mono font-bold uppercase block ${isChurchMode ? 'text-amber-800' : 'text-emerald-800'}`}>
            {isChurchMode ? 'DAILY GRACE & REFLECTION' : 'DAILY MINDSET & VISION'}
          </span>
          <span className="text-[10.5px] font-serif font-medium text-slate-800 leading-[1.1] block">
            {quote.l1}
            <br />
            {quote.l2}
          </span>
        </div>
      </div>

      {/* 3. Top Master Controls (Priorities + Prayer/Mindset) */}
      <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
        {/* Priorities */}
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-1.5">
          <div className="font-bold text-slate-800 font-sans flex items-center justify-between border-b border-slate-200 pb-1">
            <span>🎯 오늘의 3대 골든 타임 과제</span>
            <span className="font-mono text-[10px] text-slate-400">Priorities</span>
          </div>
          <div className="space-y-1 text-xs text-slate-600 font-sans">
            <div>1. _________________________________</div>
            <div>2. _________________________________</div>
            <div>3. _________________________________</div>
          </div>
        </div>

        {/* Prayer / Mindset */}
        <div className={`border rounded-xl p-3 shadow-xs space-y-1.5 ${
          isChurchMode ? 'border-amber-200 bg-amber-50/20' : 'border-emerald-200 bg-emerald-50/20'
        }`}>
          <div className={`font-bold font-sans border-b pb-1 flex items-center justify-between ${
            isChurchMode ? 'text-amber-950 border-amber-200' : 'text-emerald-950 border-emerald-200'
          }`}>
            <span>{isChurchMode ? '🙏 오늘의 기도제목 & 은혜 묵상' : '💡 오늘의 다짐 & 마인드셋'}</span>
            <span className="font-mono text-[10px] text-slate-400">{isChurchMode ? 'Prayer' : 'Mindset'}</span>
          </div>
          <div className="space-y-1 text-[10.5px] font-sans text-slate-600">
            <div className="flex items-end gap-1">
              <span className="whitespace-nowrap">① {isChurchMode ? '하나님을 향한 감사:' : '긍정 확언 (Daily Affirmation):'}</span>
              <div className="flex-1 border-b border-slate-300 h-[12px] mb-[1px]" />
            </div>
            <div className="flex items-end gap-1">
              <span className="whitespace-nowrap">② {isChurchMode ? '간절한 중보 기도제목:' : '나를 성장시킬 핵심 태도:'}</span>
              <div className="flex-1 border-b border-slate-300 h-[12px] mb-[1px]" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Main Stack: To-Do List & Full Journal Note */}
      <div className="grid grid-cols-12 gap-3 flex-1 mb-3">
        {/* Left: Time-based To-Do List & Wellness Routine (5 cols) */}
        <div className="col-span-5 flex flex-col justify-between space-y-3 border-r border-slate-200 pr-3">
          <div className="border border-slate-200 rounded-xl p-3 bg-white flex-1 flex flex-col justify-between shadow-xs space-y-1.5">
            <div className="font-bold text-slate-800 font-sans flex items-center justify-between border-b border-slate-200 pb-1 text-xs">
              <span>☑️ 시간대별 할 일 (To-Do)</span>
              <span className="font-mono text-[10px] text-slate-400">Tasks</span>
            </div>
            <div className="space-y-1.5 flex-1 flex flex-col justify-around text-xs font-sans">
              <div className="text-[10px] font-bold text-slate-500 font-mono">🌅 MORNING (아침):</div>
              <div className="flex items-center justify-between">
                <div className="w-3.5 h-3.5 border border-slate-400 rounded-xs bg-slate-50" />
                <div className="flex-1 border-b border-slate-200 ml-2 h-3 text-slate-400">_______________</div>
              </div>
              <div className="text-[10px] font-bold text-slate-500 font-mono mt-1">☀️ AFTERNOON (낮):</div>
              <div className="flex items-center justify-between">
                <div className="w-3.5 h-3.5 border border-slate-400 rounded-xs bg-slate-50" />
                <div className="flex-1 border-b border-slate-200 ml-2 h-3 text-slate-400">_______________</div>
              </div>
              <div className="text-[10px] font-bold text-slate-500 font-mono mt-1">🌙 EVENING (저녁):</div>
              <div className="flex items-center justify-between">
                <div className="w-3.5 h-3.5 border border-slate-400 rounded-xs bg-slate-50" />
                <div className="flex-1 border-b border-slate-200 ml-2 h-3 text-slate-400">_______________</div>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl px-1 py-1.5 bg-slate-50/40 text-xs font-sans">
            <span className="font-bold text-slate-700 block whitespace-nowrap">🌿 웰니스 & 라이프 루틴:</span>
            <div className="flex items-center justify-between gap-px text-[10px] text-slate-600 pt-1 whitespace-nowrap">
              <div className="bg-white px-px py-0.5 rounded-md">
                <span className="font-bold text-slate-600">감정:</span>
                <span className="text-slate-400">😊맑음/😐보통/🌧️지침</span>
              </div>
              <div className="bg-white px-px py-0.5 rounded-md">
                <span className="font-bold text-slate-600">운동:</span>
                <span className="text-slate-400">___분/물2L💧</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Full Journal Note (7 cols) */}
        <div className="col-span-7 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1 text-xs">
            <h3 className="font-bold text-slate-800 font-sans">📝 데일리 일기 & 자유 노트 (Journal & Notes)</h3>
            <span className="font-mono text-[10px] text-slate-400">Grid Note</span>
          </div>

          <div className="flex-1 border border-slate-200 rounded-xl p-1 bg-white flex flex-col justify-between">
            <div className="flex-1">
              <PerfectGridNote step={15} />
            </div>
            <div className="border-t border-dashed border-slate-200 pt-1.5 mt-1.5 text-xs font-sans text-slate-600 pb-10">
              <span className="font-bold text-slate-800 block mt-1">💖 오늘 가장 소중했던 순간 1가지:</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-300">
        <span>PREMIUM DIARY STUDIO — DAILY JOURNAL MASTER</span>
        <span>{yearLabel} {monthName} Edition</span>
      </div>
    </div>
  )
}
