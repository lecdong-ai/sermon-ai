'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import type { ContiSet, ContiItem, ContiSong, AIRecommendResult } from '@/types/conti'
import {
  getSampleContiList, getSampleConti, getSampleSongById, ALL_SAMPLE_SONGS, ALL_SAMPLE_SONGS_BY_ID,
} from '@/lib/conti/samples'
import {
  loadMockContiList, loadMockContiDetail, saveMockContiList, saveMockContiDetail,
  loadMockSongList, saveMockSongList, deleteMockContiData,
} from '@/lib/conti/mockStorage'
import ContiSidebar from '@/components/conti/ContiSidebar'
import ContiDetail from '@/components/conti/ContiDetail'
import ContiTopBar from '@/components/conti/ContiTopBar'
import ContiNewDrawer from '@/components/conti/ContiNewDrawer'
import SongUploadHub from '@/components/conti/SongUploadHub'
import SongPicker from '@/components/conti/SongPicker'
import ContiAIRecommendModal from '@/components/conti/ContiAIRecommendModal'
import ContiSheetEditor from '@/components/conti/ContiSheetEditor'
import ContiCoachPanel from '@/components/conti/ContiCoachPanel'
import ContiPrintModal from '@/components/conti/ContiPrintModal'
import ContiShareDialog from '@/components/conti/ContiShareDialog'
import {
  setMockShareToken, deleteMockShareToken,
} from '@/lib/conti/mockStorage'
import { useAuth } from '@/components/AuthProvider'
import { Plus, Music2, Sparkles, Loader2 } from 'lucide-react'

interface PageClientProps {
  initialContis: ContiSet[]
  initialSelectedConti: ContiSet | null
  initialItems: ContiItem[]
  initialSelectedId: string | null
  isAuthenticated: boolean
}

export default function ContiPageClient({
  initialContis,
  initialSelectedConti,
  initialItems,
  initialSelectedId,
  isAuthenticated,
}: PageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedId = searchParams.get('id') || initialSelectedId
  const { user, loading: authLoading } = useAuth()

  // 서버에서 받은 초기 데이터로 시작
  const [contis, setContis] = useState<ContiSet[]>(initialContis)
  const [items, setItems] = useState<ContiItem[]>(initialItems)
  const [loadingList, setLoadingList] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [useMock, setUseMock] = useState(false)
  const [showSongPicker, setShowSongPicker] = useState(false)
  const [showSongUpload, setShowSongUpload] = useState(false)
  const [showAIRecommend, setShowAIRecommend] = useState(false)
  const [showCoach, setShowCoach] = useState(false)
  const [showPrint, setShowPrint] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showNewDrawer, setShowNewDrawer] = useState(false)
  const [showSheetEditor, setShowSheetEditor] = useState(false)
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem('conti:mock:pinned')
      return stored ? JSON.parse(stored) : []
    } catch { return [] }
  })

  // 목록 로드
  const fetchList = useCallback(async () => {
    setLoadingList(true)
    try {
      const res = await fetch('/api/conti', { credentials: 'include' })
      if (res.ok) {
        const json = await res.json()
        if (json.data !== undefined) {
          setContis(json.data || [])
          setUseMock(false)
          setLoadingList(false)
          return
        }
      }
    } catch { /* fall through */ }

    // 로그인 안 됐거나 API 미설정 시 → localStorage mock + 샘플
    const stored = loadMockContiList()
    const sample = getSampleContiList()
    const merged = stored.length > 0 ? stored : sample
    setContis(merged)
    setUseMock(true)
    setLoadingList(false)
  }, [])

  // 상세 로드
  const fetchDetail = useCallback(async (id: string) => {
    setLoadingDetail(true)
    try {
      const res = await fetch(`/api/conti/${id}`, { credentials: 'include' })
      if (res.ok) {
        const json = await res.json()
        if (json.data) {
          setItems(json.data.items || [])
          setLoadingDetail(false)
          return
        }
      }
    } catch { /* fall through */ }

    // 1) localStorage mock
    const stored = loadMockContiDetail(id)
    if (stored) {
      const itemsWithSong = stored.items.map((item) => ({
        ...item,
        song: item.song || getSampleSongById(item.song_id) || undefined,
      }))
      setItems(itemsWithSong)
      setLoadingDetail(false)
      return
    }

    // 2) sample
    const sample = getSampleConti(id)
    if (sample) {
      setItems(sample.items)
      setLoadingDetail(false)
      return
    }

    setItems([])
    setLoadingDetail(false)
  }, [])

  // 인증 준비될 때까지 대기
  useEffect(() => {
    if (authLoading) return
    fetchList()
  }, [authLoading, fetchList])

  useEffect(() => {
    if (selectedId) fetchDetail(selectedId)
    else setItems([])
  }, [selectedId, fetchDetail])

  const selectedConti = useMemo(
    () => contis.find((c) => c.id === selectedId) || null,
    [contis, selectedId],
  )

  function selectItem(id: string) {
    router.replace(`/conti?id=${id}`, { scroll: false })
  }
  function closeDetail() {
    router.replace('/conti', { scroll: false })
  }

  // ─── 액션 핸들러들 (Phase 1: 스텁 — Phase 2+ 에서 실제 구현) ───

  function handleNew() {
    setShowNewDrawer(true)
  }

  function handleDeleteConti(id: string) {
    if (useMock || id.startsWith('mock-')) {
      deleteMockContiData(id)
    } else {
      fetch(`/api/conti/${id}`, { method: 'DELETE', credentials: 'include' }).catch(() => {})
    }
    setContis((prev) => {
      const filtered = prev.filter((c) => c.id !== id)
      if (useMock || id.startsWith('mock-')) saveMockContiList(filtered)
      return filtered
    })
    setItems([])
    setPinnedIds((prev) => prev.filter((pid) => pid !== id))
    if (selectedId === id) {
      router.replace('/conti', { scroll: false })
    }
  }

  function handleTogglePin(id: string) {
    setPinnedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
      try { localStorage.setItem('conti:mock:pinned', JSON.stringify(next)) } catch {}
      return next
    })
  }

  function handleAddSong() {
    setShowSongPicker(true)
  }

  function handlePickSong(song: ContiSong) {
    setShowSongPicker(false)
    if (!selectedId) return
    // 곡을 콘티에 추가
    setItems((prev) => {
      const next = [
        ...prev,
        {
          id: `ci-${Date.now()}`,
          conti_id: selectedId,
          song_id: song.id,
          position: prev.length + 1,
          key: song.original_key,
          bpm_override: null,
          transition_memo: '',
          memo: '',
          song,
        } as ContiItem,
      ]
      persistItems(selectedId, next)
      return next
    })
  }

  function handleNewSongUploaded(song: ContiSong) {
    setShowSongUpload(false)
    // 새 곡을 라이브러리에 저장
    const stored = loadMockSongList()
    const next = [song, ...stored.filter((s) => s.id !== song.id)]
    saveMockSongList(next)
    // 콘티에 바로 추가
    handlePickSong(song)
  }

  function handleAIRecommend() {
    setShowAIRecommend(true)
  }

  function handleApplyAIRecommend(items: AIRecommendResult['items']) {
    setShowAIRecommend(false)
    if (!selectedId) return
    // 추천된 곡들을 콘티에 추가
    const newItems: ContiItem[] = items.map((rec, idx) => {
      const song = ALL_SAMPLE_SONGS_BY_ID[rec.song_id] || getSampleSongById(rec.song_id)
      return {
        id: `ci-ai-${Date.now()}-${idx}`,
        conti_id: selectedId,
        song_id: rec.song_id,
        position: idx + 1,        // AI 추천은 콘티를 대체 (1부터)
        key: rec.recommended_key,
        bpm_override: null,
        transition_memo: '',
        memo: '',
        song: song || undefined,
      }
    })
    setItems(newItems)
    persistItems(selectedId, newItems)
  }

  function handleCoach() {
    setShowCoach(true)
  }

  function handlePrint() {
    setShowPrint(true)
  }

  function handleShare() {
    setShowShare(true)
  }

  function handleSheetMusicEdit() {
    setShowSheetEditor(true)
  }

  function handleShareUpdated(updated: ContiSet) {
    setContis((prev) => {
      const next = prev.map((c) => (c.id === updated.id ? updated : c))
      if (useMock || updated.id.startsWith('mock-')) saveMockContiList(next)
      return next
    })
    // share_token 변경 시 mockStorage 의 매핑도 갱신
    if (updated.share_token) {
      setMockShareToken(updated.share_token, updated.id)
    }
    // 이전 토큰이 있었다면 매핑에서 제거 (간단화를 위해 ID 기반)
    setShowShare(false)
  }

  function handleReorder(newOrder: ContiItem[]) {
    setItems(newOrder)
    persistItems(selectedId, newOrder)
  }

  function handleUpdateItem(updated: ContiItem) {
    setItems((prev) => {
      const next = prev.map((i) => (i.id === updated.id ? updated : i))
      persistItems(selectedId, next)
      return next
    })
  }

  function handleRemove(itemId: string) {
    if (!confirm('이 곡을 콘티에서 제거할까요?')) return
    setItems((prev) => {
      const filtered = prev.filter((i) => i.id !== itemId)
      const updated = filtered.map((it, i) => ({ ...it, position: i + 1 }))
      persistItems(selectedId, updated)
      return updated
    })
  }

  function persistItems(id: string | null, nextItems: ContiItem[]) {
    if (!id) return
    if (useMock || id.startsWith('mock-')) {
      const detail = loadMockContiDetail(id) || {
        conti: contis.find((c) => c.id === id)!,
        items: [],
      }
      saveMockContiDetail(id, { ...detail, items: nextItems })
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#050814] text-slate-200 overflow-hidden">
      <ContiTopBar
        contis={contis}
        selectedConti={selectedConti}
        onNew={handleNew}
        onSearch={setSearchText}
      />

      <div className="flex-1 flex min-h-0 relative">
        {/* 배경 글로우 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-[120px]" />
        </div>

        <div className="relative z-10 flex w-full h-full">
        <ContiSidebar
          contis={contis}
          loading={loadingList}
          selectedId={selectedId}
          searchText={searchText}
          onSearchChange={setSearchText}
          onSelect={selectItem}
          onNew={handleNew}
          onDelete={handleDeleteConti}
          onTogglePin={handleTogglePin}
          pinnedIds={pinnedIds}
        />

        {selectedConti ? (
          <ContiDetail
            conti={selectedConti}
            items={items}
            loading={loadingDetail}
            onClose={closeDetail}
            onAddSong={handleAddSong}
            onAIRecommend={handleAIRecommend}
            onCoach={handleCoach}
            onPrint={handlePrint}
            onSheetMusicEdit={handleSheetMusicEdit}
            onShare={handleShare}
            onReorder={handleReorder}
            onRemove={handleRemove}
            onUpdateItem={handleUpdateItem}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#080d22]/30 px-6">
            <div className="text-center max-w-lg space-y-5">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mx-auto shadow-2xl">
                <Music2 className="w-10 h-10 text-indigo-300" />
              </div>
              <div>
                <h1 className="text-[26px] font-extrabold text-white tracking-tight">
                  예배 콘티 제작실
                </h1>
                <p className="text-[15px] text-slate-400 mt-2 leading-relaxed">
                  찬양 세트를 한눈에 배치하고, AI의 검수와 추천을 받으세요.<br />
                  왼쪽에서 콘티를 선택하거나 새 콘티를 시작해 보세요.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 max-w-md mx-auto pt-2">
                {[
                  { icon: Plus, label: '드래그 편집', desc: '곡 순서 자유롭게' },
                  { icon: Sparkles, label: 'AI 추천', desc: '분위기 → 자동 배치' },
                  { icon: Music2, label: '인쇄 3모드', desc: '팀/인도자/PPT' },
                ].map((f, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                    <f.icon className="w-4 h-4 text-indigo-300 mx-auto mb-1.5" />
                    <p className="text-[13px] font-bold text-white">{f.label}</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{f.desc}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={handleNew}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[15px] font-extrabold transition-all shadow-lg shadow-indigo-600/30"
              >
                <Plus className="w-4 h-4" />
                새 콘티 시작
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 모달: 곡 선택 + 곡 추가 */}
      {showSongPicker && (
        <SongPicker
          onClose={() => setShowSongPicker(false)}
          onPick={handlePickSong}
          onAddNew={() => {
            setShowSongPicker(false)
            setShowSongUpload(true)
          }}
        />
      )}
      {showSongUpload && (
        <SongUploadHub
          onClose={() => setShowSongUpload(false)}
          onSaved={handleNewSongUploaded}
        />
      )}
      {showAIRecommend && (
        <ContiAIRecommendModal
          availableSongs={[...ALL_SAMPLE_SONGS]}
          onClose={() => setShowAIRecommend(false)}
          onApply={handleApplyAIRecommend}
        />
      )}
      {showCoach && (
        <ContiCoachPanel
          items={items}
          onClose={() => setShowCoach(false)}
        />
      )}
      {showPrint && selectedConti && (
        <ContiPrintModal
          conti={selectedConti}
          items={items}
          onClose={() => setShowPrint(false)}
        />
      )}
      {showShare && selectedConti && (
        <ContiShareDialog
          conti={selectedConti}
          onClose={() => setShowShare(false)}
          onUpdated={handleShareUpdated}
        />
      )}
      {showNewDrawer && (
        <ContiNewDrawer
          onClose={() => setShowNewDrawer(false)}
          onCreated={(conti) => setContis((prev) => [conti, ...prev])}
          existingContis={contis}
        />
      )}
      {showSheetEditor && selectedConti && (
        <ContiSheetEditor
          conti={selectedConti}
          items={items}
          onClose={() => setShowSheetEditor(false)}
        />
      )}
      </div>
    </div>
  )
}
