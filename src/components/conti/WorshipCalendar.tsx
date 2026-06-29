'use client'

import { useState, useMemo } from 'react'
import type { ContiSet, WorshipType } from '@/types/conti'
import { WORSHIP_TYPE_META } from '@/types/conti'
import { ChevronLeft, ChevronRight, Music, Calendar as CalIcon, ChevronDown } from 'lucide-react'

interface Props {
  contis: ContiSet[]
  onSelect: (id: string) => void
}

const TYPE_COLOR: Record<WorshipType, string> = {
  sunday_am:  'bg-amber-500/20 text-amber-300 border-amber-500/40',
  sunday_pm:  'bg-orange-500/20 text-orange-300 border-orange-500/40',
  wednesday:  'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  dawn:       'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
  special:    'bg-rose-500/20 text-rose-300 border-rose-500/40',
}

const TYPE_DOT: Record<WorshipType, string> = {
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

export default function WorshipCalendar({ contis, onSelect }: Props) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()))
  const [filterType, setFilterType] = useState<WorshipType | 'all'>('all')

  // 필터된 콘티
  const filteredContis = useMemo(() => {
    if (filterType === 'all') return contis
    return contis.filter((c) => c.worship_type === filterType)
  }, [contis, filterType])

  // 캘린더 그리드: 6주 × 7일
  const grid = useMemo(() => {
    const first = startOfMonth(cursor)
    const firstWeekday = first.getDay()              // 0=일
    const startDate = new Date(first)
    startDate.setDate(first.getDate() - firstWeekday)
    const cells: Date[] = []
    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate)
      d.setDate(startDate.getDate() + i)
      cells.push(d)
    }
    return cells
  }, [cursor])

  // 일자별 콘티 매핑
  const contisByDate = useMemo(() => {
    const map: Record<string, ContiSet[]> = {}
    for (const c of filteredContis) {
      if (!c.date) continue
      if (!map[c.date]) map[c.date] = []
      map[c.date].push(c)
    }
    return map
  }, [filteredContis])

  const monthLabel = `${cursor.getFullYear()}년 ${cursor.getMonth() + 1}월`
  const today = new Date()
  const monthContis = filteredContis.filter((c) => {
    if (!c.date) return false
    const d = new Date(c.date)
    return d.getFullYear() === cursor.getFullYear() && d.getMonth() === cursor.getMonth()
  })

  return (
    <div className="space-y-4">
      {/* 헤더: 월 네비게이션 + 필터 */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCursor(addMonths(cursor, -1))}
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 min-w-[120px] text-center">
            <span className="text-[15px] font-extrabold text-white">{monthLabel}</span>
          </div>
          <button
            onClick={() => setCursor(addMonths(cursor, 1))}
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCursor(startOfMonth(new Date()))}
            className="ml-1 px-2 py-1.5 rounded-lg text-[12px] font-bold text-slate-300 hover:bg-white/5"
          >
            오늘
          </button>
        </div>

        {/* 예배 유형 필터 */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-md text-[12px] font-bold transition-colors ${
              filterType === 'all'
                ? 'bg-white/10 text-white border border-white/20'
                : 'bg-white/[0.02] text-slate-400 border border-white/5 hover:bg-white/5'
            }`}
          >
            전체 ({contis.length})
          </button>
          {(Object.keys(WORSHIP_TYPE_META) as WorshipType[]).map((t) => {
            const count = contis.filter((c) => c.worship_type === t).length
            if (count === 0) return null
            return (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-md text-[12px] font-bold transition-colors flex items-center gap-1 ${
                  filterType === t
                    ? `${TYPE_COLOR[t]} border`
                    : 'bg-white/[0.02] text-slate-400 border border-white/5 hover:bg-white/5'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${TYPE_DOT[t]}`} />
                {WORSHIP_TYPE_META[t].label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {DAY_NAMES.map((d, i) => (
          <div
            key={d}
            className={`text-[12px] font-extrabold uppercase tracking-widest py-1.5 ${
              i === 0 ? 'text-rose-400' : i === 6 ? 'text-sky-400' : 'text-slate-500'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {grid.map((d) => {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
          const dayContis = contisByDate[key] || []
          const isCurrentMonth = d.getMonth() === cursor.getMonth()
          const isToday = isSameDay(d, today)
          const dayOfWeek = d.getDay()

          return (
            <div
              key={key}
              className={`min-h-[88px] rounded-lg border p-1.5 transition-colors ${
                isCurrentMonth
                  ? isToday
                    ? 'bg-indigo-500/[0.08] border-indigo-500/30'
                    : 'bg-white/[0.02] border-white/5'
                  : 'bg-transparent border-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[12px] font-bold ${
                    isCurrentMonth
                      ? isToday
                        ? 'text-indigo-300'
                        : dayOfWeek === 0
                        ? 'text-rose-300'
                        : dayOfWeek === 6
                        ? 'text-sky-300'
                        : 'text-slate-300'
                      : 'text-slate-600'
                  }`}
                >
                  {d.getDate()}
                </span>
                {isToday && (
                  <span className="text-[10px] font-extrabold text-indigo-300">TODAY</span>
                )}
              </div>

              {/* 해당 일의 콘티 */}
              <div className="space-y-0.5">
                {dayContis.slice(0, 2).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onSelect(c.id)}
                    className={`w-full text-left px-1.5 py-0.5 rounded text-[11px] font-bold truncate transition-all hover:scale-105 ${TYPE_COLOR[c.worship_type]}`}
                    title={c.title}
                  >
                    {c.title}
                  </button>
                ))}
                {dayContis.length > 2 && (
                  <div className="text-[10px] text-slate-500 font-bold pl-1">+{dayContis.length - 2}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* 이번 달 콘티 요약 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
        <h3 className="text-[12px] font-extrabold uppercase tracking-widest text-slate-500 mb-2.5">
          {monthLabel} 예배 ({monthContis.length}건)
        </h3>
        {monthContis.length === 0 ? (
          <p className="text-[12px] text-slate-500 font-medium py-3 text-center">
            이번 달 등록된 콘티가 없습니다
          </p>
        ) : (
          <div className="space-y-1.5">
            {monthContis
              .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
              .map((c) => {
                const d = new Date(c.date!)
                const dayName = DAY_NAMES[d.getDay()]
                return (
                  <button
                    key={c.id}
                    onClick={() => onSelect(c.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all text-left"
                  >
                    <div className="flex flex-col items-center justify-center w-10 flex-shrink-0">
                      <div className="text-[16px] font-extrabold text-white leading-none">
                        {d.getDate()}
                      </div>
                      <div className="text-[11px] text-slate-500 font-bold mt-0.5">{dayName}</div>
                    </div>
                    <div className={`w-1 h-8 rounded-full ${TYPE_DOT[c.worship_type]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-white truncate">{c.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[11px] px-1.5 py-0 rounded font-bold ${TYPE_COLOR[c.worship_type]}`}>
                          {WORSHIP_TYPE_META[c.worship_type].label}
                        </span>
                        {c.is_public && (
                          <span className="text-[11px] text-emerald-300 font-bold">공개</span>
                        )}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 -rotate-90" />
                  </button>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
