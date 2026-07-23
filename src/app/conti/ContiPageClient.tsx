'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ContiSet, WorshipType } from '@/types/conti'
import { getSampleContiList } from '@/lib/conti/samples'
import {
  loadMockContiList, saveMockContiList, deleteMockContiData,
} from '@/lib/conti/mockStorage'
import { WORSHIP_TYPE_META } from '@/types/conti'
import ContiNewDrawer from '@/components/conti/ContiNewDrawer'
import ContiSheetEditor from '@/components/conti/ContiSheetEditor'
import ContiLeftPanel from '@/components/conti/ContiLeftPanel'
import MiniCalendar from '@/components/conti/MiniCalendar'
import { useAuth } from '@/components/AuthProvider'
import {
  Plus, Music2, Search, Star, Trash2, ArrowLeft, Home
} from 'lucide-react'
import Link from 'next/link'

interface PageClientProps {
  initialContis: ContiSet[]
  initialSelectedConti: ContiSet | null
  initialSelectedId: string | null
}

const COLORS: Record<string, string> = {
  amber: 'bg-amber-400',
  orange: 'bg-orange-400',
  emerald: 'bg-emerald-400',
  indigo: 'bg-indigo-400',
  rose: 'bg-rose-400',
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

function isThisMonth(dateStr: string): boolean {
  const d = new Date(dateStr)
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

export default function ContiPageClient({
  initialContis,
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
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<WorshipType | 'all'>('all')
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

  const filtered = useMemo(
    () => contis.filter((c) => {
      if (searchText && !c.title.toLowerCase().includes(searchText.toLowerCase())) return false
      if (selectedDate && c.date !== selectedDate) return false
      if (filterType !== 'all' && c.worship_type !== filterType) return false
      return true
    }),
    [contis, searchText, selectedDate, filterType],
  )

  const sortedContis = useMemo(
    () => [...filtered].sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [filtered],
  )

  const worshipCounts = useMemo(() => {
    const map = new Map<WorshipType, number>()
    for (const c of contis) {
      map.set(c.worship_type, (map.get(c.worship_type) || 0) + 1)
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [contis])

  const stats = useMemo(() => ({
    thisWeek: contis.filter((c) => c.date && isThisWeek(c.date)).length,
    thisMonth: contis.filter((c) => c.date && isThisMonth(c.date)).length,
    total: contis.length,
    pinned: pinnedIds.length,
  }), [contis, pinnedIds])

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

  if (selectedConti) {
    return (
      <div className="flex flex-col h-screen bg-[#03050c]">
        <ContiSheetEditor
          conti={selectedConti}
          items={[]}
          onClose={closeDetail}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-[#050814] text-slate-200 overflow-hidden">
      {/* 배경 글로우 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      {/* 콘텐츠 */}
      <div className="relative z-10 flex flex-col h-full overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0a0f1f]/60 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
              title="대시보드로"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
              <Music2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-[18px] font-extrabold text-white">콘티 제작</h1>
              <p className="text-[12px] text-slate-500 font-medium">
                총 {stats.total}개 · 이번 주 {stats.thisWeek}개
              </p>
            </div>
          </div>
          <button
            onClick={handleNew}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[13px] font-extrabold transition-all shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-3.5 h-3.5" />
            새 콘티 만들기
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col lg:flex-row min-h-full">

            <ContiLeftPanel
              contis={contis}
              selectedDate={selectedDate}
              filterType={filterType}
              onDateSelect={setSelectedDate}
              onFilterTypeChange={setFilterType}
            />

            <div className="flex-1 min-w-0 p-6 space-y-6 animate-fade-in">

              {/* Stats 카드 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: '이번 주', value: stats.thisWeek, color: 'bg-indigo-500', icon: '📅' },
                  { label: '이달', value: stats.thisMonth, color: 'bg-emerald-500', icon: '📆' },
                  { label: '전체', value: stats.total, color: 'bg-purple-500', icon: '📚' },
                  { label: '고정됨', value: stats.pinned, color: 'bg-amber-500', icon: '📌' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="glass-dark rounded-2xl p-4 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                      <span className="text-lg">{stat.icon}</span>
                    </div>
                    <p className={`text-[28px] font-extrabold ${stat.value > 0 ? 'text-white' : 'text-slate-600'}`}>
                      {stat.value}
                      <span className="text-[14px] font-bold text-slate-500 ml-1">개</span>
                    </p>
                    <div className={`mt-2 h-1 rounded-full ${stat.color} ${stat.value > 0 ? 'opacity-60' : 'opacity-10'}`}
                      style={{ width: `${Math.min((stat.value / Math.max(stats.total, 1)) * 100, 100)}%` }}
                    />
                  </div>
                ))}
              </div>

              {/* 검색 + 퀵 액션 */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="콘티 검색..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[13px] text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40 transition-colors"
                  />
                </div>
                <Link
                  href="/conti/calendar"
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[12px] font-bold transition-colors border border-white/10"
                >
                  📅 캘린더
                </Link>
                <Link
                  href="/conti/teams"
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[12px] font-bold transition-colors border border-white/10"
                >
                  👥 팀
                </Link>
                <Link
                  href="/conti/songs"
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[12px] font-bold transition-colors border border-white/10"
                >
                  🎵 곡
                </Link>
              </div>

              {/* 날짜 필터 알림 */}
              {selectedDate && (
                <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-400/20">
                  <span className="text-[13px] text-indigo-200 font-medium">
                    📅 <strong>{formatDate(selectedDate)}</strong>의 콘티 {sortedContis.length}개
                  </span>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="text-[11px] font-bold text-indigo-300 hover:text-indigo-100 transition-colors"
                  >
                    필터 해제 ✕
                  </button>
                </div>
              )}

              {/* 콘티 목록 */}
              <div>
                <h2 className="text-[15px] font-bold text-white mb-3">
                  {searchText ? '검색 결과' : selectedDate ? '' : '최근 콘티'}
                  <span className="text-[12px] text-slate-500 font-medium ml-2">{sortedContis.length}개</span>
                </h2>

                {loadingList ? (
                  <div className="text-center py-12 text-slate-500 text-[14px]">로딩 중...</div>
                ) : sortedContis.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mx-auto mb-4">
                      <Music2 className="w-8 h-8 text-indigo-300" />
                    </div>
                    <p className="text-[16px] font-bold text-slate-300 mb-1">
                      {searchText ? '검색 결과가 없습니다' : selectedDate ? '이 날짜에 콘티가 없습니다' : '첫 콘티를 만들어보세요'}
                    </p>
                    <p className="text-[13px] text-slate-500 mb-6">
                      {searchText
                        ? '다른 검색어로 시도해보세요'
                        : selectedDate
                        ? '다른 날짜를 선택하거나 새 콘티를 만들어보세요'
                        : 'A4 악보를 편집하고 PDF로 내보낼 수 있습니다'}
                    </p>
                    {!searchText && !selectedDate && (
                      <button
                        onClick={handleNew}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[14px] font-extrabold transition-all shadow-lg shadow-indigo-600/30"
                      >
                        <Plus className="w-4 h-4" />
                        새 콘티 시작
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {sortedContis.map((conti) => {
                      const isPinned = pinnedIds.includes(conti.id)
                      const meta = WORSHIP_TYPE_META[conti.worship_type]
                      const dotColor = COLORS[meta.color]
                      return (
                        <div
                          key={conti.id}
                          className="group glass-dark rounded-2xl border border-white/10 hover:border-indigo-400/40 transition-all duration-200 overflow-hidden"
                        >
                          <button
                            onClick={() => selectItem(conti.id)}
                            className="w-full text-left p-4"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`inline-block w-2 h-2 rounded-full ${dotColor}`} />
                                <span className="text-[11px] font-bold text-slate-400">{meta.label}</span>
                                {isPinned && (
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                )}
                                {conti.is_public && (
                                  <span className="text-[9px] px-1 py-0 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                                    공개
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-[14px] font-bold text-slate-200 group-hover:text-white transition-colors leading-snug line-clamp-2">
                              {conti.title}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium mt-1">
                              {formatDate(conti.date)}
                            </p>
                          </button>
                          <div className="flex items-center justify-end gap-1 px-4 pb-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleTogglePin(conti.id) }}
                              className={`p-1 rounded hover:bg-white/10 transition-colors ${
                                isPinned ? 'text-amber-400' : 'text-slate-600 hover:text-amber-300'
                              }`}
                              title={isPinned ? '핀 해제' : '핀 고정'}
                            >
                              <Star className={`w-3 h-3 ${isPinned ? 'fill-amber-400' : ''}`} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (window.confirm(`"${conti.title}" 콘티를 삭제할까요?`)) {
                                  handleDeleteConti(conti.id)
                                }
                              }}
                              className="p-1 rounded hover:bg-white/10 text-slate-600 hover:text-red-400 transition-colors"
                              title="삭제"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* ─── 우측 사이드바 ─── */}
            <div className="w-full lg:w-72 flex-shrink-0 p-6 lg:pl-0 space-y-4">
              <div className="glass-dark rounded-2xl p-4 border border-white/10 sticky top-6">
                <MiniCalendar
                  contis={contis}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                />
              </div>

              <div className="glass-dark rounded-2xl p-5 border border-white/10">
                <h3 className="text-[12px] font-extrabold uppercase tracking-widest text-slate-500 mb-3">
                  예배유형별 분포
                </h3>
                <div className="space-y-2.5">
                  {worshipCounts.map(([type, count]) => {
                    const meta = WORSHIP_TYPE_META[type]
                    const pct = Math.max((count / Math.max(contis.length, 1)) * 100, 2)
                    return (
                      <div key={type}>
                        <div className="flex items-center justify-between mb-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${COLORS[meta.color]}`} />
                            <span className="text-[12px] font-bold text-slate-300">{meta.label}</span>
                          </div>
                          <span className="text-[11px] font-bold text-slate-500">{count}</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${COLORS[meta.color]} opacity-60`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
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
  )
}
