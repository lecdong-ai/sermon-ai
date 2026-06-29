'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'
import type { ContiSong } from '@/types/conti'
import { ALL_SAMPLE_SONGS } from '@/lib/conti/samples'
import { loadMockSongList, saveMockSongList } from '@/lib/conti/mockStorage'
import SongLibrary from '@/components/conti/SongLibrary'
import SongUploadHub from '@/components/conti/SongUploadHub'
import SongEditModal from '@/components/conti/SongEditModal'
import { Loader2, Music, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function SongsPageInner() {
  const router = useRouter()
  const [userSongs, setUserSongs] = useState<ContiSong[]>([])
  const [searchText, setSearchText] = useState('')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'system' | 'user'>('all')
  const [showUpload, setShowUpload] = useState(false)
  const [editingSong, setEditingSong] = useState<ContiSong | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = loadMockSongList()
    // 시스템 곡 외에 사용자가 추가한 곡만 필터
    setUserSongs(stored.filter((s) => s.user_id !== null))
    setMounted(true)
  }, [])

  const handleSaved = useCallback((song: ContiSong) => {
    setUserSongs((prev) => {
      const next = [song, ...prev.filter((s) => s.id !== song.id)]
      // 전체 (시스템 포함) 목록을 mockStorage 에 저장
      const all = [...ALL_SAMPLE_SONGS.filter((s) => s.user_id === null), ...next]
      saveMockSongList(all)
      return next
    })
    setShowUpload(false)
  }, [])

  const handleUpdate = useCallback((updated: ContiSong) => {
    setUserSongs((prev) => {
      const next = prev.map((s) => (s.id === updated.id ? updated : s))
      const all = [...ALL_SAMPLE_SONGS.filter((s) => s.user_id === null), ...next]
      saveMockSongList(all)
      return next
    })
  }, [])

  const handleDelete = useCallback((id: string) => {
    setUserSongs((prev) => {
      const next = prev.filter((s) => s.id !== id)
      const all = [...ALL_SAMPLE_SONGS.filter((s) => s.user_id === null), ...next]
      saveMockSongList(all)
      return next
    })
    setEditingSong(null)
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050814]">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
    )
  }

  // 사이드바용 — 콘티 목록도 가져와야 함 (4개 sample)
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#050814] text-slate-200 overflow-hidden -mt-16 pt-16">
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col min-w-0 bg-[#080d22]/30 overflow-hidden w-full h-full">
          {/* 헤더 */}
          <div className="px-6 py-4 border-b border-white/5 bg-[#0a0f1f]/60 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Link
                href="/conti"
                className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                title="콘티로 돌아가기"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-[20px] font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Music className="w-5 h-5 text-indigo-300" />
                  곡 라이브러리
                </h1>
                <p className="text-[13px] text-slate-500 font-medium mt-0.5">
                  시스템 제공 {ALL_SAMPLE_SONGS.filter((s) => s.user_id === null).length}곡 + 내가 추가한 {userSongs.length}곡
                </p>
              </div>
            </div>
          </div>

          {/* 본문 */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
            <div className="max-w-5xl mx-auto">
              <SongLibrary
                userSongs={userSongs}
                searchText={searchText}
                onSearchChange={setSearchText}
                sourceFilter={sourceFilter}
                onSourceFilterChange={setSourceFilter}
                onSelectSong={(song) => setEditingSong(song as ContiSong)}
                onAdd={() => setShowUpload(true)}
              />
            </div>
          </div>
        {/* 모달 */}
        {showUpload && (
          <SongUploadHub
            onClose={() => setShowUpload(false)}
            onSaved={handleSaved}
          />
        )}

        {editingSong && (
          <SongEditModal
            song={editingSong}
            onClose={() => setEditingSong(null)}
            onSave={handleUpdate}
            onDelete={() => handleDelete(editingSong.id)}
          />
        )}
      </div>
    </div>
  )
}

export default function SongsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#050814]">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
    }>
      <SongsPageInner />
    </Suspense>
  )
}
