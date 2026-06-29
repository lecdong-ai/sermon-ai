'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ContiSet, WorshipType } from '@/types/conti'

interface Props {
  contis: ContiSet[]
  selectedDate: string | null
  onDateSelect: (date: string | null) => void
}

const DOT_COLORS: Record<WorshipType, string> = {
  sunday_am:  'bg-amber-400',
  sunday_pm:  'bg-orange-400',
  wednesday:  'bg-emerald-400',
  dawn:       'bg-indigo-400',
  special:    'bg-rose-400',
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1)
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
function formatKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function MiniCalendar({ contis, selectedDate, onDateSelect }: Props) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()))

  const grid = useMemo(() => {
    const first = startOfMonth(cursor)
    const firstWeekday = first.getDay()
    const start = new Date(first)
    start.setDate(first.getDate() - firstWeekday)
    const cells: Date[] = []
    for (let i = 0; i < 42; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      cells.push(d)
    }
    return cells
  }, [cursor])

  const contisByDate = useMemo(() => {
    const map: Record<string, ContiSet[]> = {}
    for (const c of contis) {
      if (!c.date) continue
      if (!map[c.date]) map[c.date] = []
      map[c.date].push(c)
    }
    return map
  }, [contis])

  const today = new Date()
  const thisMonthContis = contis.filter((c) => {
    if (!c.date) return false
    const d = new Date(c.date)
    return d.getFullYear() === cursor.getFullYear() && d.getMonth() === cursor.getMonth()
  })

  const selectedContiCount = selectedDate ? (contisByDate[selectedDate]?.length ?? 0) : 0

  return (
    <div>
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setCursor(addMonths(cursor, -1))}
          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="text-[13px] font-extrabold text-white">
          {cursor.getFullYear()}년 {cursor.getMonth() + 1}월
        </span>
        <button
          onClick={() => setCursor(addMonths(cursor, 1))}
          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-0 text-center mb-1">
        {DAY_NAMES.map((d, i) => (
          <span
            key={d}
            className={`text-[10px] font-extrabold py-1 ${
              i === 0 ? 'text-rose-400' : i === 6 ? 'text-sky-400' : 'text-slate-500'
            }`}
          >
            {d}
          </span>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-0">
        {grid.map((d) => {
          const key = formatKey(d)
          const dayContis = contisByDate[key] || []
          const isCurrentMonth = d.getMonth() === cursor.getMonth()
          const isToday = isSameDay(d, today)
          const isSelected = selectedDate === key
          const dayOfWeek = d.getDay()

          return (
            <button
              key={key}
              onClick={() => onDateSelect(isSelected ? null : key)}
              disabled={!isCurrentMonth}
              className={`relative flex flex-col items-center justify-center py-1 rounded-lg text-[12px] font-bold transition-all ${
                !isCurrentMonth
                  ? 'text-slate-700 cursor-default'
                  : isSelected
                  ? 'bg-indigo-500/20 text-indigo-200 ring-1 ring-indigo-400/40'
                  : isToday
                  ? 'bg-indigo-500/10 text-indigo-200'
                  : dayOfWeek === 0
                  ? 'text-rose-300 hover:bg-white/5'
                  : dayOfWeek === 6
                  ? 'text-sky-300 hover:bg-white/5'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <span>{d.getDate()}</span>
              {isCurrentMonth && dayContis.length > 0 && (
                <div className="flex items-center gap-0.5 mt-0.5">
                  {dayContis.slice(0, 3).map((c) => (
                    <span
                      key={c.id}
                      className={`w-1 h-1 rounded-full ${DOT_COLORS[c.worship_type]}`}
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* 하단 정보 */}
      <div className="mt-3 flex items-center justify-between text-[11px]">
        <button
          onClick={() => setCursor(startOfMonth(new Date()))}
          className="font-bold text-indigo-300 hover:text-indigo-200 transition-colors"
        >
          오늘
        </button>
        <span className="text-slate-500 font-medium">
          {selectedDate
            ? `${selectedContiCount}개`
            : `이번 달 ${thisMonthContis.length}개`}
        </span>
      </div>
    </div>
  )
}
