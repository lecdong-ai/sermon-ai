'use client'

import type { ContiSet } from '@/types/conti'
import WorshipTypeBadge from './WorshipTypeBadge'
import { Plus, Search, Calendar, Music, ChevronRight, Sparkles, Library, CalendarDays, Users, Trash2, Star } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'

interface Props {
  contis: ContiSet[]
  loading: boolean
  selectedId: string | null
  searchText: string
  onSearchChange: (v: string) => void
  onSelect: (id: string) => void
  onNew: () => void
  onDelete?: (id: string) => void
  onTogglePin?: (id: string) => void
  pinnedIds?: string[]
}

function formatDate(iso: string | null): string {
  if (!iso) return '날짜 미정'
  const d = new Date(iso)
  const yy = d.getFullYear().toString().slice(2)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const day = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]
  return `${yy}.${mm}.${dd} (${day})`
}

function isThisWeek(dateStr: string): boolean {
  const d = new Date(dateStr)
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)
  return d >= startOfWeek && d < endOfWeek
}

function isLastWeek(dateStr: string): boolean {
  const d = new Date(dateStr)
  const now = new Date()
  const startOfThisWeek = new Date(now)
  startOfThisWeek.setDate(now.getDate() - now.getDay())
  startOfThisWeek.setHours(0, 0, 0, 0)
  const startOfLastWeek = new Date(startOfThisWeek)
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7)
  const endOfLastWeek = new Date(startOfThisWeek)
  return d >= startOfLastWeek && d < endOfLastWeek
}

function isThisMonth(dateStr: string): boolean {
  const d = new Date(dateStr)
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

interface Group {
  label: string
  contis: ContiSet[]
}

function groupContis(contis: ContiSet[], pinnedIds: string[]): Group[] {
  const pinned = contis.filter((c) => pinnedIds.includes(c.id))
  const unpinned = contis.filter((c) => !pinnedIds.includes(c.id))
  const groups: Group[] = []

  if (pinned.length > 0) {
    groups.push({ label: '📌 고정됨', contis: pinned })
  }

  const thisWeek = unpinned.filter((c) => c.date && isThisWeek(c.date))
  if (thisWeek.length > 0) groups.push({ label: '이번 주', contis: thisWeek })

  const lastWeek = unpinned.filter((c) => c.date && isLastWeek(c.date))
  if (lastWeek.length > 0) groups.push({ label: '저번 주', contis: lastWeek })

  const thisMonth = unpinned.filter((c) => c.date && isThisMonth(c.date) && !isThisWeek(c.date) && !isLastWeek(c.date))
  if (thisMonth.length > 0) groups.push({ label: '이달', contis: thisMonth })

  const older = unpinned.filter((c) => !c.date || (!isThisWeek(c.date) && !isLastWeek(c.date) && !isThisMonth(c.date)))
  if (older.length > 0) groups.push({ label: '그 이전', contis: older })

  return groups
}

export default function ContiSidebar({
  contis, loading, selectedId, searchText,
  onSearchChange, onSelect, onNew, onDelete, onTogglePin, pinnedIds = [],
}: Props) {
  const filtered = contis
    .filter((c) => {
      if (searchText && !c.title.toLowerCase().includes(searchText.toLowerCase())) return false
      return true
    })

  const groups = useMemo(() => groupContis(filtered, pinnedIds), [filtered, pinnedIds])

  function handleDelete(conti: ContiSet) {
    if (!onDelete) return
    const displayTitle = conti.title || '(제목 없음)'
    if (window.confirm(`"${displayTitle}" 콘티를 삭제할까요?\n이 작업은 되돌릴 수 없습니다.`)) {
      onDelete(conti.id)
    }
  }

  return (
    <aside className="w-[260px] flex-shrink-0 bg-[#070b18] border-r border-white/5 flex flex-col h-full">
      {/* 헤더 */}
      <div className="px-3 pt-3 pb-2.5 border-b border-white/5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
              <Music className="w-3 h-3 text-white" />
            </div>
            <div>
              <h2 className="text-[13px] font-bold text-white">예배 콘티</h2>
              <p className="text-[10px] text-slate-500 font-medium">Worship Set Planner</p>
            </div>
          </div>
          <button
            onClick={onNew}
            className="flex items-center gap-0.5 px-1.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-bold transition-colors shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-2.5 h-2.5" />
            새 콘티
          </button>
        </div>

        {/* 검색 */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="콘티 검색..."
            className="w-full pl-7 pr-2.5 py-1.5 rounded-md bg-white/5 border border-white/5 text-[12px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40 transition-colors"
          />
        </div>

        {/* 통계 */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
          <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
          <span>전체 <strong className="text-slate-300">{contis.length}</strong>개</span>
          <span className="text-slate-700">·</span>
          <span>공개 <strong className="text-emerald-300">{contis.filter(c => c.is_public).length}</strong>개</span>
        </div>
      </div>

      {/* 목록 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* 캘린더 + 곡 라이브러리 + 팀 관리 링크 */}
        <div className="px-2 py-1.5 border-b border-white/5 space-y-1">
          <Link
            href="/conti/teams"
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-white/[0.03] border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/[0.05] transition-all group"
          >
            <div className="w-5 h-5 rounded bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-white/5 flex items-center justify-center flex-shrink-0">
              <Users className="w-2.5 h-2.5 text-amber-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-white">팀 관리</p>
            </div>
            <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-amber-300 transition-colors" />
          </Link>
          <Link
            href="/conti/calendar"
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/[0.05] transition-all group"
          >
            <div className="w-5 h-5 rounded bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-white/5 flex items-center justify-center flex-shrink-0">
              <CalendarDays className="w-2.5 h-2.5 text-purple-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-white">예배 캘린더</p>
            </div>
            <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-indigo-300 transition-colors" />
          </Link>
          <Link
            href="/conti/songs"
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/[0.05] transition-all group"
          >
            <div className="w-5 h-5 rounded bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-white/5 flex items-center justify-center flex-shrink-0">
              <Library className="w-2.5 h-2.5 text-sky-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-white">곡 라이브러리</p>
            </div>
            <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-indigo-300 transition-colors" />
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-6 text-slate-500 text-[12px]">로딩 중...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-[12px] whitespace-pre-line">
            {searchText ? '검색 결과가 없습니다' : '아직 콘티가 없습니다.\n위 [새 콘티] 버튼으로 시작하세요.'}
          </div>
        ) : (
          <div className="py-1">
            {groups.map((group) => (
              <div key={group.label}>
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-600 tracking-wide">
                  {group.label}
                </div>
                <ul>
                  {group.contis.map((conti) => {
                    const isSelected = selectedId === conti.id
                    const isPinned = pinnedIds.includes(conti.id)
                    return (
                      <li key={conti.id} className="group relative">
                        <div className="flex items-center">
                          <button
                            onClick={() => onSelect(conti.id)}
                            className={`flex-1 min-w-0 text-left px-3 py-1.5 border-l-2 transition-all duration-150 ${
                              isSelected
                                ? 'bg-indigo-500/10 border-indigo-400'
                                : 'border-transparent hover:bg-white/[0.03]'
                            }`}
                          >
                            <div className="flex items-start gap-1.5">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1 mb-0.5">
                                  {isPinned && (
                                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 flex-shrink-0" />
                                  )}
                                  <WorshipTypeBadge type={conti.worship_type} size="xs" />
                                  {conti.is_public && (
                                    <span className="text-[10px] px-1 py-0 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                                      공개
                                    </span>
                                  )}
                                </div>
                                <p className={`text-[13px] font-bold leading-snug truncate ${
                                  isSelected ? 'text-white' : 'text-slate-200'
                                }`}>
                                  {conti.title}
                                </p>
                                <div className="flex items-center gap-1 mt-0.5 text-[11px] text-slate-500 font-medium">
                                  <Calendar className="w-2.5 h-2.5" />
                                  <span>{formatDate(conti.date)}</span>
                                </div>
                              </div>
                            </div>
                          </button>
                          {onDelete && (
                            <div className="flex items-center gap-0.5 pr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => { e.stopPropagation(); onTogglePin?.(conti.id) }}
                                className={`p-1 rounded hover:bg-white/10 transition-colors ${
                                  isPinned ? 'text-amber-400' : 'text-slate-600 hover:text-amber-300'
                                }`}
                                title={isPinned ? '핀 해제' : '핀 고정'}
                              >
                                <Star className={`w-3 h-3 ${isPinned ? 'fill-amber-400' : ''}`} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(conti) }}
                                className="p-1 rounded hover:bg-white/10 text-slate-600 hover:text-red-400 transition-colors"
                                title="삭제"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
