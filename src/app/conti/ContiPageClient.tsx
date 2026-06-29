'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ContiSet } from '@/types/conti'
import { getSampleContiList } from '@/lib/conti/samples'
import {
  loadMockContiList, saveMockContiList, deleteMockContiData,
} from '@/lib/conti/mockStorage'
import ContiSidebar from '@/components/conti/ContiSidebar'
import ContiTopBar from '@/components/conti/ContiTopBar'
import ContiNewDrawer from '@/components/conti/ContiNewDrawer'
import ContiSheetEditor from '@/components/conti/ContiSheetEditor'
import { useAuth } from '@/components/AuthProvider'
import { Plus, Music2, Sparkles } from 'lucide-react'

interface PageClientProps {
  initialContis: ContiSet[]
  initialSelectedConti: ContiSet | null
  initialSelectedId: string | null
}

export default function ContiPageClient({
  initialContis,
  initialSelectedConti: _isc,
  initialSelectedId,
}: PageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [defaultSelectedId, setDefaultSelectedId] = useState<string | null>(null)
  const selectedId = searchParams.get('id') || defaultSelectedId || initialSelectedId
  const { loading: authLoading } = useAuth()

  const [contis, setContis] = useState<ContiSet[]>(initialContis)
  const [loadingList, setLoadingList] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [useMock, setUseMock] = useState(false)
  const [showNewDrawer, setShowNewDrawer] = useState(false)
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem('conti:mock:pinned')
      return stored ? JSON.parse(stored) : []
    } catch { return [] }
  })

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

    const stored = loadMockContiList()
    const sample = getSampleContiList()
    const merged = stored.length > 0 ? stored : sample
    setContis(merged)
    setUseMock(true)
    setLoadingList(false)
  }, [])

  useEffect(() => {
    if (authLoading) return
    fetchList()
  }, [authLoading, fetchList])

  const selectedConti = useMemo(
    () => contis.find((c) => c.id === selectedId) || null,
    [contis, selectedId],
  )

  function selectItem(id: string) {
    if (searchParams.get('id') !== id) {
      setDefaultSelectedId(null)
      router.replace(`/conti?id=${id}`, { scroll: false })
    }
  }
  function closeDetail() {
    setDefaultSelectedId(null)
    router.replace('/conti', { scroll: false })
  }

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
    setDefaultSelectedId((prev) => prev === id ? null : prev)
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

  return (
    <div className="flex flex-col h-screen bg-[#050814] text-slate-200 overflow-hidden">
      <ContiTopBar
        contis={contis}
        selectedConti={selectedConti}
        onNew={handleNew}
        onSearch={setSearchText}
      />

      <div className="flex-1 flex min-h-0 relative">
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

        {!selectedConti && (
          <div className="flex-1 flex items-center justify-center bg-[#080d22]/30 px-6">
            <div className="text-center max-w-lg space-y-5">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mx-auto shadow-2xl">
                <Music2 className="w-10 h-10 text-indigo-300" />
              </div>
              <div>
                <h1 className="text-[26px] font-extrabold text-white tracking-tight">
                  악보 편집
                </h1>
                <p className="text-[15px] text-slate-400 mt-2 leading-relaxed">
                  콘티를 선택하거나 새로 만들어 악보를 편집하세요.
                </p>
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

        {selectedConti && (
          <div className="flex-1 flex">
            <ContiSheetEditor
              conti={selectedConti}
              items={[]}
              onClose={closeDetail}
            />
          </div>
        )}
      </div>

      {showNewDrawer && (
        <ContiNewDrawer
          onClose={() => setShowNewDrawer(false)}
          onCreated={(conti, _items) => {
            setContis((prev) => [conti, ...prev])
            setDefaultSelectedId(conti.id)
          }}
          existingContis={contis}
        />
      )}
      </div>
    </div>
  )
}
