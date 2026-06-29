'use client'

import { useState, useMemo } from 'react'
import type { ContiSong, ContiSongListItem, SongCategory, MoodTag } from '@/types/conti'
import { ALL_SAMPLE_SONG_LIST } from '@/lib/conti/samples'
import SongCard from './SongCard'
import { MOOD_META } from './MoodTagBadge'
import { Search, Plus, Music, Filter, X } from 'lucide-react'

interface Props {
  userSongs: ContiSong[]
  onSelectSong: (song: ContiSong | ContiSongListItem) => void
  onAdd: () => void
  searchText: string
  onSearchChange: (v: string) => void
  sourceFilter: 'all' | 'system' | 'user'
  onSourceFilterChange: (v: 'all' | 'system' | 'user') => void
}

const CATEGORIES: SongCategory[] = ['CCM', '워십', '찬송가', '기타']
const ALL_TAGS: MoodTag[] = Object.keys(MOOD_META) as MoodTag[]

export default function SongLibrary({
  userSongs, onSelectSong, onAdd,
  searchText, onSearchChange,
  sourceFilter, onSourceFilterChange,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<SongCategory | 'all'>('all')
  const [selectedTag, setSelectedTag] = useState<MoodTag | 'all'>('all')

  const allSongs = useMemo(() => {
    const items: ContiSong[] = [
      ...ALL_SAMPLE_SONG_LIST.filter((s) => s.is_system) as unknown as ContiSong[],
      ...userSongs,
    ]
    return items
  }, [userSongs])

  const filtered = useMemo(() => {
    return allSongs
      .filter((s) => {
        if (searchText) {
          const q = searchText.toLowerCase()
          if (!s.title.toLowerCase().includes(q) && !(s.artist || '').toLowerCase().includes(q)) return false
        }
        if (sourceFilter === 'system' && s.user_id !== null) return false
        if (sourceFilter === 'user' && s.user_id === null) return false
        if (selectedCategory !== 'all' && s.category !== selectedCategory) return false
        if (selectedTag !== 'all' && !s.tags.includes(selectedTag)) return false
        return true
      })
      .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
  }, [allSongs, searchText, sourceFilter, selectedCategory, selectedTag])

  const counts = {
    all: allSongs.length,
    system: allSongs.filter((s) => s.user_id === null).length,
    user: allSongs.filter((s) => s.user_id !== null).length,
  }

  return (
    <div className="space-y-4">
      {/* 필터 바 */}
      <div className="space-y-3">
        {/* 검색 + 추가 */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="곡 제목 / 아티스트 검색..."
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40"
            />
            {searchText && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-500 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[13px] font-extrabold transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            곡 추가
          </button>
        </div>

        {/* 출처 필터 */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-3 h-3 text-slate-500" />
          {[
            { key: 'all',    label: '전체',   count: counts.all },
            { key: 'system', label: '시스템', count: counts.system },
            { key: 'user',   label: '내 곡',  count: counts.user },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => onSourceFilterChange(f.key as any)}
              className={`px-2.5 py-1 rounded-md text-[12px] font-bold transition-colors ${
                sourceFilter === f.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {f.label} <span className="opacity-60">({f.count})</span>
            </button>
          ))}
        </div>

        {/* 카테고리 */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2 py-0.5 rounded text-[12px] font-bold transition-colors ${
              selectedCategory === 'all'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            모든 카테고리
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-2 py-0.5 rounded text-[12px] font-bold transition-colors ${
                selectedCategory === c
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* 태그 필터 */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-2 py-0.5 rounded text-[12px] font-bold transition-colors ${
              selectedTag === 'all'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            모든 태그
          </button>
          {ALL_TAGS.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(t)}
              className={`px-2 py-0.5 rounded text-[12px] font-bold transition-colors ${
                selectedTag === t
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              #{MOOD_META[t].label}
            </button>
          ))}
        </div>
      </div>

      {/* 결과 */}
      <div className="flex items-center justify-between text-[12px] text-slate-500 font-medium">
        <span>검색 결과 <strong className="text-slate-300">{filtered.length}</strong>개</span>
      </div>

      {/* 그리드 */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500 text-[14px]">
          <Music className="w-10 h-10 mx-auto mb-3 text-slate-700" />
          조건에 맞는 곡이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((song) => (
            <SongCard key={song.id} song={song} onClick={() => onSelectSong(song)} />
          ))}
        </div>
      )}
    </div>
  )
}
