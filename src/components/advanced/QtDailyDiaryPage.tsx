'use client'

import React from 'react'
import PerfectGridNote from './PerfectGridNote'
import QtQuickIndexNav from './QtQuickIndexNav'

interface QtDailyDiaryPageProps {
  dateLabel: string   // 예: "01 SAT"
  dayNum: number      // 예: 1
  dayName: string     // 예: "SAT"
  monthName: string   // 예: "August"
  yearLabel?: string  // 예: "2026"
  themeColor?: string // 수채화 파스텔 테마 색상 (기본: #B8C6D9 - 8월 쿨 블루)
  activeWeek?: string // 예: "W1"
  isChurchMode?: boolean // 교회 묵상용 모드 여부 (false일 경우 일반인 갓생 모드)
  meditation?: { title: string; passage: string; content: string } // 큐티 마법사 묵상 주입용
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

export default function QtDailyDiaryPage({
  dateLabel,
  dayNum,
  dayName,
  monthName = 'August',
  yearLabel = '2026',
  themeColor = '#B8C6D9',
  activeWeek = 'W1',
  isChurchMode = false,
  meditation,
  pageWidth = 1024,
  pageHeight = 768,
}: QtDailyDiaryPageProps) {
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
      className={`qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto transition-all ${
        isSunday ? 'border-2 border-emerald-400/80 bg-gradient-to-b from-emerald-50/30 via-white to-slate-50/20' : ''
      }`}
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '20px 58px 20px 24px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      <QtQuickIndexNav currentMonth={monthNum} currentWeek={weekNum} activeTab="daily" themeColor={themeColor} />
      {/* 1. Clean Header Title Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
        <div className="flex items-center space-x-3 text-[10.5px] font-medium tracking-widest text-slate-500 font-mono">
          <span className="px-2.5 py-0.5 rounded text-white font-bold tracking-widest" style={{ backgroundColor: themeColor }}>
            {yearLabel} · {englishMonth.toUpperCase()} · DAY {paddedDay}
          </span>
          <span className="text-slate-400 font-semibold">
            Week{weekNum} Daily Record
          </span>
        </div>

        <div className="flex items-center space-x-2 text-[9.5px] font-mono text-slate-400">
          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-bold">
            {isChurchMode ? 'Christian Devotional Notes' : 'Daily Life Record'}
          </span>
        </div>
      </div>

      {/* 2. Month & Day Title Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          {/* Date Circle Badge */}
          <div
            className={`w-11 h-11 rounded-full flex flex-col items-center justify-center text-white shadow-2xs font-sans ${
              isSunday ? 'bg-emerald-600 ring-2 ring-emerald-300 shadow-md' : isSaturday ? 'bg-blue-600' : ''
            }`}
            style={{ backgroundColor: isSunday || isSaturday ? undefined : themeColor }}
          >
            <span className="text-base font-bold leading-tight">{paddedDay}</span>
            <span className="text-[8.5px] uppercase tracking-tighter font-extrabold">{dayName}</span>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-4xl font-normal text-slate-900 tracking-wide leading-none" style={{ fontFamily: "'Great Vibes', 'Alex Brush', 'Dancing Script', cursive" }}>{englishMonth} {paddedDay}</h2>
            </div>
            {isSunday && (
              <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[8.5px] font-bold border shadow-2xs whitespace-nowrap ${
                isChurchMode
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-emerald-100 text-emerald-950 border-emerald-300'
              }`}>
                {isChurchMode ? "🕊️ LORD'S DAY · 주일 예배 & 안식" : "☀️ SUNDAY RESET · 주말 휴식 & 리프레시"}
              </span>
            )}
          </div>
        </div>

        {/* Right Inspiration Quote Banner */}
        <div className={`text-right border rounded-xl px-3 py-1 shadow-2xs ${
          isChurchMode
            ? 'bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-amber-50/80 border-amber-200'
            : 'bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-emerald-50/80 border-emerald-200'
        }`}>
          <span className={`text-[7.5px] font-mono font-bold uppercase block ${isChurchMode ? 'text-amber-800' : 'text-emerald-800'}`}>
            {isChurchMode ? 'DAILY GRACE & REFLECTION' : 'DAILY MINDSET & VISION'}
          </span>
          <span className="text-[10px] font-serif font-medium text-slate-800 leading-none block whitespace-nowrap">
            {quote.l1} {quote.l2}
          </span>
        </div>
      </div>

      {/* 3. Main 3-Column Content Layout */}
      <div className="grid grid-cols-12 gap-3 flex-1 mb-2">
        {/* ===== Column 1: Priorities & Time-based To-Do List (3 cols) ===== */}
        <div className="col-span-3 flex flex-col justify-between border-r border-slate-200 pr-2 space-y-2">
          {/* Priorities Section */}
          <div className="border border-slate-200 rounded-xl p-2 bg-slate-50/50 space-y-1">
            <h3 className="text-[9.5px] font-bold text-slate-800 font-sans flex items-center justify-between border-b border-slate-200 pb-0.5">
              <span>🎯 오늘의 3대 골든 타임 과제</span>
              <span className="font-mono text-[7.5px] text-slate-400">Priorities</span>
            </h3>
            <div className="space-y-1 text-[8.5px] text-slate-600 font-sans pt-0.5">
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

          {/* Time-based To Do List Section */}
          <div className="flex-1 border border-slate-200 rounded-xl p-2 bg-white flex flex-col justify-between shadow-2xs space-y-1">
            <h3 className="text-[9.5px] font-bold text-slate-800 font-sans flex items-center justify-between border-b border-slate-200 pb-0.5">
              <span>☑️ 시간대별 할 일 (To-Do)</span>
              <span className="font-mono text-[7.5px] text-slate-400">Schedule</span>
            </h3>
            <div className="space-y-1 flex-1 flex flex-col justify-around text-[8px] font-sans pt-0.5">
              <div className="text-[7.5px] font-bold text-slate-500 font-mono">🌅 MORNING (아침):</div>
              <div className="flex items-center justify-between">
                <div className="w-2.5 h-2.5 border border-slate-400 rounded-xs bg-slate-50" />
                <div className="flex-1 border-b border-slate-200 ml-1.5 h-2.5 text-slate-400">_________</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="w-2.5 h-2.5 border border-slate-400 rounded-xs bg-slate-50" />
                <div className="flex-1 border-b border-slate-200 ml-1.5 h-2.5 text-slate-400">_________</div>
              </div>

              <div className="text-[7.5px] font-bold text-slate-500 font-mono mt-0.5">☀️ AFTERNOON (낮):</div>
              <div className="flex items-center justify-between">
                <div className="w-2.5 h-2.5 border border-slate-400 rounded-xs bg-slate-50" />
                <div className="flex-1 border-b border-slate-200 ml-1.5 h-2.5 text-slate-400">_________</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="w-2.5 h-2.5 border border-slate-400 rounded-xs bg-slate-50" />
                <div className="flex-1 border-b border-slate-200 ml-1.5 h-2.5 text-slate-400">_________</div>
              </div>

              <div className="text-[7.5px] font-bold text-slate-500 font-mono mt-0.5">🌙 EVENING (저녁):</div>
              <div className="flex items-center justify-between">
                <div className="w-2.5 h-2.5 border border-slate-400 rounded-xs bg-slate-50" />
                <div className="flex-1 border-b border-slate-200 ml-1.5 h-2.5 text-slate-400">_________</div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Column 2: Mindset / Prayer & Health Tracker (4 cols) ===== */}
        <div className="col-span-4 flex flex-col justify-between border-r border-slate-200 pr-2 space-y-2">
          {/* Affirmation / Prayer Box (Smart Adaptor) */}
          <div className={`border rounded-xl p-2.5 shadow-2xs space-y-1 ${
            isChurchMode ? 'border-amber-200 bg-amber-50/20' : 'border-emerald-200 bg-emerald-50/20'
          }`}>
            {meditation ? (
              <>
                <h4 className="text-[9.5px] font-bold font-sans border-b pb-0.5 flex items-center justify-between text-amber-950 border-amber-200">
                  <span>📖 오늘의 큐티 묵상</span>
                  <span className="font-mono text-[7.5px] text-slate-500 max-w-[55%] truncate">{meditation.passage}</span>
                </h4>
                <div className="bg-white p-1.5 rounded-lg border border-slate-200 overflow-hidden">
                  <div className="text-[8.5px] font-bold text-slate-800 leading-tight">{meditation.title}</div>
                  <div
                    className="text-[7.5px] leading-snug text-slate-600 mt-0.5"
                    style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                  >
                    {meditation.content}
                  </div>
                </div>
              </>
            ) : (
              <>
                <h4 className={`text-[9.5px] font-bold font-sans border-b pb-0.5 flex items-center justify-between ${
                  isChurchMode ? 'text-amber-950 border-amber-200' : 'text-emerald-950 border-emerald-200'
                }`}>
                  <span>{isChurchMode ? '🙏 오늘의 기도제목 & 은혜 묵상' : '💡 오늘의 다짐 & 마인드셋'}</span>
                  <span className="font-mono text-[7.5px] text-slate-400">{isChurchMode ? 'Prayer' : 'Mindset'}</span>
                </h4>
                <div className="space-y-1 text-[8.5px] font-sans text-slate-600 pt-0.5">
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                    <div className="flex items-end gap-1">
                      <span className="font-bold text-slate-700 text-[7px] whitespace-nowrap">
                        {isChurchMode ? '① 하나님을 향한 감사 & 묵상:' : '① 긍정 확언 (Daily Affirmation):'}
                      </span>
                      <div className="flex-1 border-b border-slate-300 h-[10px] mb-[1px]" />
                    </div>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                    <div className="flex items-end gap-1">
                      <span className="font-bold text-slate-700 text-[7px] whitespace-nowrap">
                        {isChurchMode ? '② 간절한 중보 기도제목:' : '② 나를 성장시킬 핵심 태도:'}
                      </span>
                      <div className="flex-1 border-b border-slate-300 h-[10px] mb-[1px]" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Health & Life Routine Tracker */}
          <div className="border border-slate-200 rounded-xl px-2 py-1.5 bg-slate-50/40">
            <div className="flex items-center justify-between">
              <h4 className="text-[9.5px] font-bold text-slate-800 font-sans whitespace-nowrap">🌿 웰니스 & 라이프 루틴</h4>
              <span className="font-mono text-[7.5px] text-slate-400">Wellness</span>
            </div>
            <div className="flex items-center justify-between gap-0.5 text-[7.5px] font-sans text-slate-600 pt-1 whitespace-nowrap">
              <div className="bg-white px-1 py-0.5 rounded-md">
                <span className="font-bold text-slate-500">감정:</span>
                <span className="text-slate-400">😊맑음/😐보통/🌧️지침</span>
              </div>
              <div className="bg-white px-1 py-0.5 rounded-md">
                <span className="font-bold text-slate-500">운동:</span>
                <span className="text-slate-400">___분/물2L💧</span>
              </div>
              <div className="bg-white px-1 py-0.5 rounded-md">
                <span className="font-bold text-slate-500">식단:</span>
                <span className="text-slate-400">아침/점심/저녁</span>
              </div>
            </div>
          </div>

          {/* Today's Reflection Satisfaction */}
          <div className="border border-slate-200 rounded-xl p-2 bg-white flex items-center justify-between text-[8.5px] font-sans">
            <span className="font-bold text-slate-700">오늘 하루에 대한 감사 만족도:</span>
            <span className="text-amber-400 font-bold text-[10px]">★ ★ ★ ★ ★</span>
          </div>
        </div>

        {/* ===== Column 3: Journaling & Notes (5 cols) ===== */}
        <div className="col-span-5 flex flex-col justify-between space-y-1">
          <div className="flex items-center justify-between border-b border-slate-200 pb-0.5">
            <h3 className="text-[9.5px] font-bold text-slate-800 font-sans flex items-center gap-1">
              <span>📝 데일리 일기 & 자유 노트 (Journal & Notes)</span>
            </h3>
            <span className="font-mono text-[7.5px] text-slate-400">Grid Note</span>
          </div>

          <div className="flex-1 border border-slate-200 rounded-xl p-1 bg-white flex flex-col justify-between">
            <div className="flex-1">
              <PerfectGridNote step={14} />
            </div>
            {/* Precious Highlight Moment */}
            <div className="border-t border-dashed border-slate-200 pt-1 mt-1 text-[8px] font-sans text-slate-500 pb-7">
              <span className="font-bold text-slate-700 block mt-1">💖 오늘 가장 소중했던 순간 1가지:</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200">
        <span>PREMIUM DIARY STUDIO — DAILY JOURNAL MASTER</span>
        <span>{yearLabel} {monthName} Edition</span>
      </div>
    </div>
  )
}
