'use client'

import { useState, useMemo } from 'react'
import type { ContiSong, ContiSongListItem } from '@/types/conti'
import { ALL_SAMPLE_SONGS, ALL_SAMPLE_SONG_LIST } from '@/lib/conti/samples'
import { loadMockSongList } from '@/lib/conti/mockStorage'
import { useEffect } from 'react'
import SongCard from './SongCard'
import { X, Search, Plus, Sparkles, Library } from 'lucide-react'

interface Props {
  onClose: () => void
  onPick: (song: ContiSong) => void
  onAddNew: () => void
}

export default function SongPicker({ onClose, onPick, onAddNew }: Props) {
  const [searchText, setSearchText] = useState('')
  const [userSongs, setUserSongs] = useState<ContiSong[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = loadMockSongList()
    setUserSongs(stored.filter((s) => s.user_id !== null))
    setMounted(true)
  }, [])

  const allSongs = useMemo(() => {
    return [
      ...userSongs,
      ...ALL_SAMPLE_SONGS.filter((s) => s.user_id === null) as ContiSong[],
    ]
  }, [userSongs])

  const filtered = useMemo(() => {
    return allSongs
      .filter((s) => {
        if (searchText) {
          const q = searchText.toLowerCase()
          if (!s.title.toLowerCase().includes(q) && !(s.artist || '').toLowerCase().includes(q)) return false
        }
        return true
      })
      .sort((a, b) => {
        // 시스템 곡 먼저, 그 다음 사용자 곡
        if ((a.user_id === null) !== (b.user_id === null)) {
          return a.user_id === null ? -1 : 1
        }
        return (b.created_at || '').localeCompare(a.created_at || '')
      })
  }, [allSongs, searchText])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03050c]/85 backdrop-blur-md" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-[#0a0f1f] border border-white/10 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h2 className="text-[17px] font-bold text-white flex items-center gap-2">
              <Library className="w-4 h-4 text-sky-300" />
              곡 라이브러리에서 선택
            </h2>
            <p className="text-[13px] text-slate-500 font-medium mt-0.5">
              {allSongs.length}곡 중 검색 — 클릭하면 콘티에 추가됩니다
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 검색 + 새 곡 추가 */}
        <div className="px-6 py-3 border-b border-white/5 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="곡 제목 / 아티스트..."
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40"
            />
          </div>
          <button
            onClick={onAddNew}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[13px] font-extrabold transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            새 곡 추가
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-[14px]">
              검색 결과가 없습니다.
            </div>
          ) : (
            <div className="space-y-1.5">
              {filtered.map((song) => (
                <SongCard
                  key={song.id}
                  song={song}
                  compact
                  onClick={() => onPick(song)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
