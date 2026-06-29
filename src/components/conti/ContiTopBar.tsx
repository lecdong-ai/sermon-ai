'use client'

import Link from 'next/link'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, Music2, Plus, Search, Calendar, Users, X } from 'lucide-react'
import ContiUserMenu from './ContiUserMenu'
import type { ContiSet } from '@/types/conti'

interface Props {
  contis: ContiSet[]
  selectedConti: ContiSet | null
  onNew: () => void
  onSearch?: (q: string) => void
}

export default function ContiTopBar({ contis, selectedConti, onNew, onSearch }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  // 오늘의 콘티 (오늘 날짜 또는 가장 가까운 미래)
  const todayConti = contis.find((c) => c.date === new Date().toISOString().slice(0, 10))
    || contis
        .filter((c) => c.date && c.date >= new Date().toISOString().slice(0, 10))
        .sort((a, b) => (a.date || '').localeCompare(b.date || ''))[0]
    || contis[0]

  function handleSearch() {
    if (onSearch) onSearch(searchValue)
  }

  return (
    <div className="relative z-20 border-b border-white/5 bg-[#0a0f1f]/95 backdrop-blur-md">
      {/* Zone 1: Breadcrumb */}
      <div className="px-3 sm:px-4 py-1.5 flex items-center gap-1.5 text-[12px] text-slate-400 font-medium">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-2.5 h-2.5" />
          <span>Bunker 목양</span>
        </button>
        <span className="text-slate-600">›</span>
        <Link href="/conti" className="hover:text-white transition-colors flex items-center gap-0.5">
          <Music2 className="w-2.5 h-2.5" />
          <span>예배 콘티</span>
        </Link>
        {selectedConti && (
          <>
            <span className="text-slate-600">›</span>
            <span className="text-slate-200 truncate max-w-[200px]">{selectedConti.title}</span>
          </>
        )}
        {pathname === '/conti/teams' && (
          <>
            <span className="text-slate-600">›</span>
            <Link href="/conti/teams" className="text-slate-200">팀 관리</Link>
          </>
        )}
        {pathname === '/conti/calendar' && (
          <>
            <span className="text-slate-600">›</span>
            <Link href="/conti/calendar" className="text-slate-200">예배 캘린더</Link>
          </>
        )}
        {pathname === '/conti/songs' && (
          <>
            <span className="text-slate-600">›</span>
            <Link href="/conti/songs" className="text-slate-200">곡 라이브러리</Link>
          </>
        )}

        <div className="ml-auto">
          <ContiUserMenu />
        </div>
      </div>

      {/* Zone 2: 빠른 액션 */}
      <div className="px-3 sm:px-4 py-1 flex items-center gap-1.5 border-t border-white/[0.03]">
        {/* 검색 */}
        {searchOpen ? (
          <div className="flex-1 flex items-center gap-1.5 max-w-md">
            <input
              autoFocus
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch()
                if (e.key === 'Escape') setSearchOpen(false)
              }}
              placeholder="콘티 검색..."
              className="flex-1 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[12px] text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/40"
            />
            <button
              onClick={() => { setSearchOpen(false); setSearchValue('') }}
              className="p-1 rounded text-slate-500 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <>
            {/* 오늘의 콘티 빠른 열기 */}
            {todayConti && pathname === '/conti' && (
              <button
                onClick={() => router.push(`/conti?id=${todayConti.id}`)}
                className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors group"
                title="오늘의 콘티"
              >
                <span className="text-[11px] font-extrabold text-amber-300">⭐ 오늘</span>
                <span className="text-[12px] font-bold text-amber-200 truncate max-w-[120px]">
                  {todayConti.title.replace(/^\d{4}-\d{2}-\d{2} /, '')}
                </span>
              </button>
            )}

            <button
              onClick={onNew}
              className="flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-bold transition-colors"
            >
              <Plus className="w-2.5 h-2.5" />
              새 콘티
            </button>

            <button
              onClick={() => setSearchOpen(true)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="검색"
            >
              <Search className="w-3 h-3" />
            </button>

            <Link
              href="/conti/calendar"
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="예배 캘린더"
            >
              <Calendar className="w-3 h-3" />
            </Link>

            <Link
              href="/conti/teams"
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="팀 관리"
            >
              <Users className="w-3 h-3" />
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
