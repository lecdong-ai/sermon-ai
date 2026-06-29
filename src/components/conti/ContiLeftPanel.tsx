'use client'

import { useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Music2, ChevronRight } from 'lucide-react'
import type { ContiSet, WorshipType } from '@/types/conti'
import { WORSHIP_TYPE_META } from '@/types/conti'

interface Props {
  contis: ContiSet[]
  selectedDate: string | null
  filterType: WorshipType | 'all'
  onDateSelect: (date: string | null) => void
  onFilterTypeChange: (type: WorshipType | 'all') => void
}

const DOT_COLORS: Record<WorshipType, string> = {
  sunday_am:  'bg-amber-400',
  sunday_pm:  'bg-orange-400',
  wednesday:  'bg-emerald-400',
  dawn:       'bg-indigo-400',
  special:    'bg-rose-400',
}

const BADGE_COLORS: Record<WorshipType, string> = {
  sunday_am:  'text-amber-300 bg-amber-500/15 border-amber-500/30',
  sunday_pm:  'text-orange-300 bg-orange-500/15 border-orange-500/30',
  wednesday:  'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
  dawn:       'text-indigo-300 bg-indigo-500/15 border-indigo-500/30',
  special:    'text-rose-300 bg-rose-500/15 border-rose-500/30',
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']
const NAV_ITEMS = [
  { path: '/conti', label: '홈', icon: '🏠' },
  { path: '/conti/calendar', label: '캘린더 전체', icon: '📅' },
  { path: '/conti/teams', label: '팀', icon: '👥' },
  { path: '/conti/songs', label: '곡', icon: '🎵' },
]
const WORSHIP_TYPES: (WorshipType | 'all')[] = ['all', 'sunday_am', 'sunday_pm', 'wednesday', 'dawn', 'special']

function formatKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getWeekDays(): { date: Date; key: string }[] {
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - now.getDay())
  start.setHours(0, 0, 0, 0)
  const days: { date: Date; key: string }[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push({ date: d, key: formatKey(d) })
  }
  return days
}

function isToday(d: Date) {
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
}

export default function ContiLeftPanel({
  contis, selectedDate, filterType,
  onDateSelect, onFilterTypeChange,
}: Props) {
  const router = useRouter()
  const path = usePathname()

  const contisByDate = useMemo(() => {
    const map: Record<string, ContiSet[]> = {}
    for (const c of contis) {
      if (!c.date) continue
      if (!map[c.date]) map[c.date] = []
      map[c.date].push(c)
    }
    return map
  }, [contis])

  const weekDays = useMemo(() => getWeekDays(), [])

  const typeCounts = useMemo(() => {
    const map: Record<string, number> = { all: contis.length }
    for (const t of WORSHIP_TYPES) {
      if (t === 'all') continue
      map[t] = contis.filter((c) => c.worship_type === t).length
    }
    return map
  }, [contis])

  return (
    <div className="w-full lg:w-56 flex-shrink-0 bg-[#070b18] border-r border-white/5 flex flex-col h-full lg:h-auto lg:sticky lg:top-0 lg:max-h-screen overflow-y-auto scrollbar-thin">
      {/* 브랜딩 */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
          <Music2 className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <h1 className="text-[14px] font-extrabold text-white leading-tight">콘티 제작</h1>
          <p className="text-[10px] text-slate-500 font-medium">대시보드</p>
        </div>
      </div>

      {/* 이번 주 스트립 */}
      <div className="px-3 pt-3 pb-2 border-b border-white/5">
        <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-2.5 px-1">
          이번 주
        </h2>
        <div className="space-y-0.5">
          {weekDays.map(({ date, key }, i) => {
            const dayContis = contisByDate[key] || []
            const isPast = date < new Date(new Date().toDateString())
            const today = isToday(date)
            const isSelected = selectedDate === key

            return (
              <button
                key={key}
                onClick={() => onDateSelect(isSelected ? null : key)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all ${
                  isSelected
                    ? 'bg-indigo-500/15 ring-1 ring-indigo-400/30'
                    : today
                    ? 'bg-indigo-500/8'
                    : 'hover:bg-white/5'
                } ${isPast && !isSelected && !today ? 'opacity-40' : ''}`}
              >
                {/* 요일 + 날짜 */}
                <div className="flex flex-col items-center w-8 flex-shrink-0">
                  <span className={`text-[11px] font-extrabold leading-none ${
                    i === 0 ? 'text-rose-400' : i === 6 ? 'text-sky-400' : 'text-slate-400'
                  }`}>
                    {DAY_NAMES[i]}
                  </span>
                  <span className={`text-[13px] font-extrabold leading-tight ${
                    today ? 'text-white' : 'text-slate-300'
                  }`}>
                    {date.getDate()}
                  </span>
                </div>

                {/* 오늘 표시 */}
                {today && !isSelected && (
                  <span className="text-[9px] font-extrabold text-indigo-300 bg-indigo-500/15 px-1 py-0.5 rounded">
                    TODAY
                  </span>
                )}

                {/* 콘티 정보 */}
                <div className="flex-1 min-w-0 text-right">
                  {dayContis.length > 0 ? (
                    dayContis.map((c) => (
                      <span
                        key={c.id}
                        className={`inline-block text-[10px] font-bold px-1.5 py-0 rounded border ${BADGE_COLORS[c.worship_type]} truncate max-w-full`}
                      >
                        {WORSHIP_TYPE_META[c.worship_type].short} {c.title.length > 6 ? c.title.slice(0, 6) + '…' : c.title}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-600 font-medium">—</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 네비게이션 */}
      <div className="py-2 px-3 border-b border-white/5">
        {NAV_ITEMS.map((item) => {
          const isActive = path === item.path
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-bold transition-all ${
                isActive
                  ? 'bg-indigo-500/12 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-indigo-400" />
              )}
            </button>
          )
        })}
      </div>

      {/* 예배유형 필터 */}
      <div className="py-2 px-3 flex-1">
        <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-2 px-1">
          예배 필터
        </h2>
        <div className="space-y-0.5">
          {WORSHIP_TYPES.map((t) => {
            const isActive = filterType === t
            const meta = t === 'all' ? null : WORSHIP_TYPE_META[t]
            const count = typeCounts[t]
            if (count === 0 && t !== 'all') return null

            return (
              <button
                key={t}
                onClick={() => onFilterTypeChange(isActive && t !== 'all' ? 'all' : t)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-500/12 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {t === 'all' ? (
                  <span className="w-2 h-2 rounded-full bg-white/40" />
                ) : (
                  <span className={`w-2 h-2 rounded-full ${DOT_COLORS[t]}`} />
                )}
                <span className="flex-1 text-left">{meta ? meta.label : '전체'}</span>
                <span className="text-[11px] text-slate-500">{count}</span>
                {isActive && t !== 'all' && (
                  <span className="w-1 h-1 rounded-full bg-indigo-400" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
