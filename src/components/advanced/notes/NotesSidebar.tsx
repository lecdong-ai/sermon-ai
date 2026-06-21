'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  NOTE_TYPES,
  NOTE_TYPE_LABELS,
  NOTE_TYPE_DOTS,
  type NoteType,
  type NoteEntry,
  type SortMode,
} from '@/lib/advanced/notesData'

interface NotesSidebarProps {
  notes: NoteEntry[]
  filterTypes: NoteType[]
  filterTags: string[]
  starredOnly: boolean
  pinnedOnly: boolean
  searchQuery: string
  setSearchQuery: (s: string) => void
  sortMode: SortMode
  setSortMode: (m: SortMode) => void
  toggleTypeFilter: (t: NoteType) => void
  toggleTagFilter: (t: string) => void
  setStarredOnly: (v: boolean) => void
  setPinnedOnly: (v: boolean) => void
  clearFilters: () => void
  activeFilterCount: number
  view: 'atelier' | 'gallery' | 'summary'
  setView: (v: 'atelier' | 'gallery' | 'summary') => void
  totalCount: number
}

export default function NotesSidebar({
  notes,
  filterTypes,
  filterTags,
  starredOnly,
  pinnedOnly,
  searchQuery,
  setSearchQuery,
  sortMode,
  setSortMode,
  toggleTypeFilter,
  toggleTagFilter,
  setStarredOnly,
  setPinnedOnly,
  clearFilters,
  activeFilterCount,
  view,
  setView,
  totalCount,
}: NotesSidebarProps) {
  const router = useRouter()
  const allTags = useMemo(() => {
    const set = new Set<string>()
    notes.forEach((n) => n.tags.forEach((t) => set.add(t)))
    return Array.from(set).sort().slice(0, 18)
  }, [notes])

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    NOTE_TYPES.forEach((t) => { c[t] = notes.filter((n) => n.type === t).length })
    return c
  }, [notes])

  return (
    <aside className="w-60 shrink-0 border-r border-white/5 bg-[#04060f]/70 backdrop-blur-md flex flex-col overflow-y-auto scrollbar-thin">
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center gap-1 text-[10px] text-slate-500">
          <button onClick={() => router.push('/advanced')} className="hover:text-indigo-400 transition-colors font-bold">말씀 사역</button>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400 font-bold">노트/통찰</span>
        </div>
        <h2 className="text-base font-bold text-white mt-1.5">영감의 작업실</h2>
        <p className="text-[10px] text-slate-500 font-medium mt-0.5">{totalCount}개의 통찰이 모이고 있습니다</p>
      </div>

      <div className="px-3 pt-3 space-y-1">
        <ViewBtn active={view === 'atelier'} onClick={() => setView('atelier')} icon="✦" label="작업실" desc="기록 + 별자리" />
        <ViewBtn active={view === 'gallery'} onClick={() => setView('gallery')} icon="▦" label="갤러리" desc="Masonry 보기" />
        <ViewBtn active={view === 'summary'} onClick={() => setView('summary')} icon="◈" label="요약" desc="통찰 통계" />
      </div>

      <div className="px-3 py-3 border-b border-white/5">
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="제목·내용·태그 검색..."
            className="w-full text-xs font-medium border border-white/5 rounded-xl pl-8 pr-3 py-1.5 bg-[#0c1020] text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          />
        </div>
      </div>

      <div className="p-3 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">유형</span>
          {filterTypes.length > 0 && (
            <button onClick={() => filterTypes.forEach(toggleTypeFilter)} className="text-[9px] text-slate-500 hover:text-slate-300">초기화</button>
          )}
        </div>
        <div className="space-y-0.5">
          {NOTE_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => toggleTypeFilter(type)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterTypes.includes(type) ? 'bg-indigo-500/15 text-indigo-300' : 'hover:bg-white/5 text-slate-500'
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${NOTE_TYPE_DOTS[type]}`} />
              <span className="flex-1 text-left">{NOTE_TYPE_LABELS[type]}</span>
              <span className="text-[10px] text-slate-600">{counts[type] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 border-b border-white/5">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">보기</span>
        <div className="space-y-0.5">
          <button
            onClick={() => { setStarredOnly(!starredOnly); if (pinnedOnly) setPinnedOnly(false) }}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              starredOnly ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'hover:bg-white/5 text-slate-500 border border-transparent'
            }`}
          >
            <span>★</span>
            <span>중요</span>
            <span className="text-[10px] text-slate-600 ml-auto">{notes.filter((n) => n.starred).length}</span>
          </button>
          <button
            onClick={() => { setPinnedOnly(!pinnedOnly); if (starredOnly) setStarredOnly(false) }}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              pinnedOnly ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30' : 'hover:bg-white/5 text-slate-500 border border-transparent'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span>고정</span>
            <span className="text-[10px] text-slate-600 ml-auto">{notes.filter((n) => n.pinned).length}</span>
          </button>
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="p-3 border-b border-white/5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">태그</span>
          <div className="flex flex-wrap gap-1">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTagFilter(tag)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors border ${
                  filterTags.includes(tag)
                    ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                    : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-3">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">정렬</span>
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          className="w-full text-xs font-bold border border-white/5 rounded-xl px-2 py-1.5 outline-none focus:border-indigo-500/50 bg-[#0c1020] text-slate-300"
        >
          <option value="recent">최신순</option>
          <option value="referenced">최근 참조순</option>
          <option value="connections">연결 많은 순</option>
          <option value="starred">중요순</option>
        </select>
      </div>

      {activeFilterCount > 0 && (
        <div className="px-3 pb-3">
          <button
            onClick={clearFilters}
            className="w-full text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors py-1.5 border border-white/5 rounded-lg"
          >
            필터 초기화 ({activeFilterCount})
          </button>
        </div>
      )}
    </aside>
  )
}

function ViewBtn({ active, onClick, icon, label, desc }: { active: boolean; onClick: () => void; icon: string; label: string; desc: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors ${
        active
          ? 'bg-gradient-to-r from-indigo-500/15 to-emerald-500/10 border border-indigo-500/30 text-white'
          : 'border border-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/5'
      }`}
    >
      <span className="text-sm">{icon}</span>
      <div className="text-left flex-1">
        <p className="text-xs font-bold leading-tight">{label}</p>
        <p className="text-[9px] text-slate-500 leading-tight">{desc}</p>
      </div>
    </button>
  )
}
