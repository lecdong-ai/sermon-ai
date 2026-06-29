'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { ContiSet, ContiSong, WorshipType } from '@/types/conti'
import { ALL_SAMPLE_SONGS, getSampleConti } from '@/lib/conti/samples'
import { loadMockSongList, saveMockContiList, saveMockContiDetail, loadMockContiDetail } from '@/lib/conti/mockStorage'
import SongCard from './SongCard'
import { X, Search, Check, Plus, Music, Calendar, ArrowRight, Sparkles, Library, Copy } from 'lucide-react'
import { WORSHIP_TYPE_META } from '@/types/conti'

interface Props {
  onClose: () => void
  onCreated: (conti: ContiSet) => void
  existingContis: ContiSet[]
}

export default function ContiNewDrawer({ onClose, onCreated, existingContis }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<'info' | 'songs'>('info')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [worshipType, setWorshipType] = useState<WorshipType>('sunday_am')
  const [memo, setMemo] = useState('')
  const [selectedSongIds, setSelectedSongIds] = useState<Set<string>>(new Set())
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
        if ((a.user_id === null) !== (b.user_id === null)) {
          return a.user_id === null ? -1 : 1
        }
        return (b.created_at || '').localeCompare(a.created_at || '')
      })
  }, [allSongs, searchText])

  function toggleSong(id: string) {
    setSelectedSongIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const prevConti = useMemo(() => {
    return existingContis
      .filter((c) => c.worship_type === worshipType && c.id !== '')
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))[0] || null
  }, [existingContis, worshipType])

  function handleLoadFromTemplate() {
    if (!prevConti) return

    const detail = loadMockContiDetail(prevConti.id) || getSampleConti(prevConti.id)
    if (!detail) {
      alert('이전 콘티의 곡 정보를 불러올 수 없습니다.')
      return
    }

    const songIds = detail.items.map((i) => i.song_id).filter(Boolean)
    setSelectedSongIds(new Set(songIds))
    setStep('songs')
  }

  function handleNext() {
    if (!title.trim()) {
      alert('콘티 제목을 입력해 주세요.')
      return
    }
    setStep('songs')
  }

  function handleCreate() {
    if (!title.trim()) {
      alert('콘티 제목을 입력해 주세요.')
      setStep('info')
      return
    }

    const newContiId = `mock-conti-${Date.now()}`
    const newConti = {
      id: newContiId,
      user_id: 'mock-user',
      title: title.trim(),
      date,
      worship_type: worshipType,
      memo: memo.trim(),
      is_public: false,
      share_token: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // items 생성
    const items = Array.from(selectedSongIds).map((songId, idx) => {
      const song = allSongs.find((s) => s.id === songId)
      return {
        id: `ci-${newContiId}-${idx}`,
        conti_id: newContiId,
        song_id: songId,
        position: idx + 1,
        key: song?.original_key || null,
        bpm_override: null,
        transition_memo: '',
        memo: '',
        song: song || undefined,
      }
    })

    // localStorage 저장
    const stored = JSON.parse(localStorage.getItem('conti:mock:list') || '[]')
    const next = [newConti, ...stored]
    saveMockContiList(next)
    saveMockContiDetail(newContiId, { conti: newConti, items })

    onCreated(newConti)
    onClose()
    router.replace(`/conti?id=${newContiId}`, { scroll: false })
  }

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03050c]/85 backdrop-blur-md" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-[#0a0f1f] border border-white/10 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <div>
            <h2 className="text-[16px] font-bold text-white flex items-center gap-2">
              <Music className="w-4 h-4 text-indigo-300" />
              새 콘티 만들기
            </h2>
            <p className="text-[12px] text-slate-500 font-medium mt-0.5">
              {step === 'info' ? '1/2 · 기본 정보 입력' : '2/2 · 곡 선택'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === 'info' ? (
          /* ═══════ Step 1: 기본 정보 ═══════ */
          <div className="p-5 space-y-3">
            <div>
              <label className="text-[12px] font-bold text-slate-400 mb-1 block">콘티 제목 *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 2025-07-13 주일 오전 예배"
                autoFocus
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-bold text-slate-400 mb-1 block">날짜</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white focus:outline-none focus:border-indigo-500/40"
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-slate-400 mb-1 block">예배 유형</label>
                <select
                  value={worshipType}
                  onChange={(e) => setWorshipType(e.target.value as WorshipType)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white focus:outline-none focus:border-indigo-500/40"
                >
                  {(Object.keys(WORSHIP_TYPE_META) as WorshipType[]).map((t) => (
                    <option key={t} value={t}>{WORSHIP_TYPE_META[t].label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[12px] font-bold text-slate-400 mb-1 block">메모 (선택)</label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="새신자 환영 · 찬양팀 7명"
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40 resize-none"
              />
            </div>

            {prevConti && (
              <button
                onClick={handleLoadFromTemplate}
                className="w-full p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-left hover:bg-indigo-500/15 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Copy className="w-3.5 h-3.5 text-indigo-300" />
                  <span className="text-[13px] font-bold text-indigo-200">
                    저번 {WORSHIP_TYPE_META[worshipType].label} 콘티 복제
                  </span>
                </div>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  &ldquo;{prevConti.title}&rdquo; · {prevConti.date}
                </p>
                <p className="text-[11px] text-indigo-400/60 mt-0.5 group-hover:text-indigo-300 transition-colors">
                  곡 구성을 그대로 가져와요 →
                </p>
              </button>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-[13px] font-bold text-slate-400 hover:bg-white/5 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[13px] font-extrabold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
              >
                다음: 곡 선택
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* ═══════ Step 2: 곡 선택 ═══════ */
          <>
            {/* 검색 + 카운트 */}
            <div className="px-5 py-2.5 border-b border-white/5 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="곡 / 아티스트 검색..."
                  className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[13px] text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40"
                />
              </div>
              <div className="text-[12px] font-bold text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded">
                {selectedSongIds.size}곡 선택
              </div>
            </div>

            {/* 곡 목록 */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
              {filtered.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-[14px]">검색 결과가 없습니다</div>
              ) : (
                <div className="space-y-1.5">
                  {filtered.map((song) => {
                    const isSelected = selectedSongIds.has(song.id)
                    return (
                      <button
                        key={song.id}
                        onClick={() => toggleSong(song.id)}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all ${
                          isSelected
                            ? 'bg-indigo-500/15 border border-indigo-500/40 ring-1 ring-indigo-500/30'
                            : 'bg-white/[0.02] border border-white/5 hover:border-white/15'
                        }`}
                      >
                        {/* 체크박스 */}
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                            isSelected
                              ? 'bg-indigo-500 border-indigo-500'
                              : 'bg-white/5 border border-white/20'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                        <SongCard song={song} compact />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* 풋터 */}
            <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between gap-2">
              <button
                onClick={() => setStep('info')}
                className="px-3 py-2 rounded-lg text-[13px] font-bold text-slate-400 hover:bg-white/5 transition-colors"
              >
                ← 이전
              </button>
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-slate-500 font-medium">
                  곡 없이도 만들 수 있어요
                </span>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[13px] font-extrabold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  콘티 만들기
                  {selectedSongIds.size > 0 && ` (${selectedSongIds.size}곡)`}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
