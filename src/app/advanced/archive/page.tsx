'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getFilterOptions, getRelatedSermons, searchSermons, filterSermons } from '@/lib/advanced/archiveData'
import type { ArchivedSermon } from '@/lib/advanced/archiveData'
import { getCustomProjects } from '@/lib/advanced/mockData'
import { readProjectCore } from '@/lib/advanced/projectStorage'
import {
  Search, LayoutGrid, List, ChevronDown, Check, X, RefreshCw,
  ArrowRight, BookOpen, Star, Sparkles, FolderOpen, Heart, MessageSquare, Archive
} from 'lucide-react'

type ViewMode = 'card' | 'list'
type SortMode = 'recent' | 'relevance' | 'referenced' | 'reused'

export default function ArchivePage() {
  const router = useRouter()
  const [allSermons, setAllSermons] = useState<ArchivedSermon[]>([])
  const [loading, setLoading] = useState(true)
  const filterOptions = getFilterOptions(allSermons)

  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('card')
  const [sortMode, setSortMode] = useState<SortMode>('recent')
  const [selectedSermon, setSelectedSermon] = useState<ArchivedSermon | null>(null)
  const [filters, setFilters] = useState<Record<string, string[]>>({
    books: [], themes: [], series: [], seasons: [], audiences: [],
  })
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [showInsights, setShowInsights] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/archive').then(r => r.json()).catch(() => ({ success: false })),
      Promise.resolve(getCustomProjects()),
    ]).then(([json, customProjects]) => {
      const apiSermons: ArchivedSermon[] = json.success && Array.isArray(json.data) ? json.data : []

      // localStorage 프로젝트를 ArchivedSermon 형식으로 변환
      const localSermons: ArchivedSermon[] = customProjects.map(p => {
        let introduction = ''
        let conclusion = ''
        let outlineTitles: string[] = []
        let wordCount = p.wordCount || 0
        let coreMessage = p.coreMessage || ''

        const { prep: prepRaw, manuscript: msRaw } = readProjectCore(p.id)
        if (prepRaw) {
          if (!coreMessage && prepRaw.coreMessage) coreMessage = prepRaw.coreMessage
          if (prepRaw.outlines?.length) outlineTitles = prepRaw.outlines.map((o: any) => o.title)
          if (prepRaw.deliveryIntro) introduction = prepRaw.deliveryIntro
          if (prepRaw.deliveryConclusion) conclusion = prepRaw.deliveryConclusion
        }
        if (msRaw) {
          if (msRaw.outlinePoints?.length) outlineTitles = msRaw.outlinePoints.map((o: any) => o.title)
          if (msRaw.sections?.length) {
            const introSection = msRaw.sections.find((s: any) => s.type === 'introduction')
            if (introSection?.content) introduction = introSection.content
            const concSection = msRaw.sections.find((s: any) => s.type === 'conclusion')
            if (concSection?.content) conclusion = concSection.content
            const msWords = msRaw.sections.reduce((sum: number, s: any) => {
              const text: string = s.content || ''
              return sum + text.replace(/\s/g, '').length
            }, 0)
            if (msWords > wordCount) wordCount = msWords
          }
          if (!coreMessage && msRaw.coreMessage) coreMessage = msRaw.coreMessage
        }

        return {
          id: p.id,
          title: p.title || '',
          passage: p.passage || '',
          book: p.book || '',
          chapter: p.chapter || 0,
          verseStart: p.verseStart || 0,
          verseEnd: p.verseEnd || null,
          sermonDate: p.sermonDate || '',
          preacher: p.preacher || '',
          sermonType: p.sermonType || '',
          audience: Array.isArray(p.audience) ? p.audience : [],
          season: p.season || '',
          coreMessage,
          wordCount,
          seriesName: p.seriesName || '',
          themeNames: p.themeNames || [],
          tagNames: p.tagNames || [],
          introduction,
          conclusion,
          outlineTitles,
          relatedIds: [],
          createdAt: p.createdAt || '',
          updatedAt: p.updatedAt || '',
        }
      })

      // API 데이터와 localStorage 데이터를 ID로 중복 제거하며 병합
      const byId = new Map<string, ArchivedSermon>()
      for (const s of apiSermons) byId.set(s.id, s)
      for (const s of localSermons) if (!byId.has(s.id)) byId.set(s.id, s)
      setAllSermons(Array.from(byId.values()))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const searched = useMemo(() => searchSermons(allSermons, searchQuery), [allSermons, searchQuery])
  const filtered = useMemo(() => filterSermons(searched, {
    books: filters.books,
    themes: filters.themes,
    series: filters.series,
    seasons: filters.seasons,
    audiences: filters.audiences,
  }), [searched, filters])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    switch (sortMode) {
      case 'recent':
        arr.sort((a, b) => new Date(b.sermonDate).getTime() - new Date(a.sermonDate).getTime())
        break
      case 'relevance':
        arr.sort((a, b) => b.wordCount - a.wordCount)
        break
      case 'referenced':
        arr.sort((a, b) => b.relatedIds.length - a.relatedIds.length)
        break
      case 'reused':
        arr.sort((a, b) => b.relatedIds.length - a.relatedIds.length)
        break
    }
    return arr
  }, [filtered, sortMode])

  const relatedSermons = useMemo(() =>
    selectedSermon ? getRelatedSermons(selectedSermon, allSermons) : [],
    [selectedSermon, allSermons],
  )

  const toggleFilter = useCallback((key: string, value: string) => {
    setFilters(prev => {
      const current = prev[key] || []
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
      return { ...prev, [key]: next }
    })
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({ books: [], themes: [], series: [], seasons: [], audiences: [] })
    setSearchQuery('')
  }, [])

  const activeFilterCount = Object.values(filters).reduce((sum, arr) => sum + arr.length, 0)

  const stats = useMemo(() => ({
    total: allSermons.length,
    totalWords: allSermons.reduce((sum, s) => sum + s.wordCount, 0),
    bySeason: allSermons.reduce((acc, s) => { acc[s.season] = (acc[s.season] || 0) + 1; return acc }, {} as Record<string, number>),
    thisYear: allSermons.filter(s => s.sermonDate.startsWith('2026')).length,
    byBook: allSermons.reduce((acc, s) => { acc[s.book] = (acc[s.book] || 0) + 1; return acc }, {} as Record<string, number>),
    topThemes: (() => {
      const counts: Record<string, number> = {}
      allSermons.forEach(s => s.themeNames.forEach(t => { counts[t] = (counts[t] || 0) + 1 }))
      return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8)
    })(),
  }), [allSermons])

  const filterSections: { key: string; label: string; options: string[] }[] = [
    { key: 'books', label: '성경 권별', options: filterOptions.books },
    { key: 'themes', label: '주제/테마', options: filterOptions.themes },
    { key: 'series', label: '시리즈', options: filterOptions.series },
    { key: 'seasons', label: '교회 절기', options: filterOptions.seasons },
    { key: 'audiences', label: '청중 유형', options: filterOptions.audiences },
  ]

  const quickFilters = [
    { label: '요한복음', query: '요한복음' },
    { label: '빛', query: '빛' },
    { label: '성육신', query: '성육신' },
    { label: '대림절', query: '대림절' },
    { label: '부활절', query: '부활절' },
    { label: '로마서', query: '로마서' },
  ]

  const handleSelectSermon = useCallback((sermon: ArchivedSermon) => {
    setSelectedSermon(prev => prev?.id === sermon.id ? null : sermon)
  }, [])

  const handleReuse = useCallback((sermon: ArchivedSermon) => {
    router.push(`/advanced/projects/new?reuse=${sermon.id}`)
  }, [router])

  const handleOpenProject = useCallback((sermon: ArchivedSermon) => {
    router.push(`/advanced/projects/${sermon.id}`)
  }, [router])

  return (
    <div className="flex h-full overflow-hidden bg-[#070a16]/20">
      {/* ─── Left Filter Panel ─── */}
      <ArchiveFilterPanel
        filterSections={filterSections}
        filters={filters}
        activeFilter={activeFilter}
        onToggleFilter={toggleFilter}
        onSetActiveFilter={setActiveFilter}
        activeFilterCount={activeFilterCount}
        onClearFilters={clearFilters}
        stats={stats}
      />

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Search Bar */}
        <ArchiveSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortMode={sortMode}
          onSortModeChange={setSortMode}
          quickFilters={quickFilters}
          resultCount={sorted.length}
          totalCount={allSermons.length}
        />

        {/* Sermon List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin relative z-10">
          <div className="p-6 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : allSermons.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Archive className="w-12 h-12 text-slate-600 mb-4" />
                <p className="text-slate-400 font-medium mb-2">아직 완료된 설교가 없습니다</p>
                <p className="text-xs text-slate-500 mb-6">첫 설교 프로젝트를 완료하고 아카이브에 보관하세요</p>
                <button
                  onClick={() => router.push('/advanced/projects/new')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  <span>+</span>
                  <span>새 설교 프로젝트 시작</span>
                </button>
              </div>
            ) : sorted.length === 0 ? (
              <ArchiveEmptyState
                searchQuery={searchQuery}
                onClearFilters={clearFilters}
                quickFilters={quickFilters}
                onQuickFilter={q => setSearchQuery(q)}
              />
            ) : viewMode === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {sorted.map(sermon => (
                  <SermonArchiveCard
                    key={sermon.id}
                    sermon={sermon}
                    isSelected={selectedSermon?.id === sermon.id}
                    onSelect={() => handleSelectSermon(sermon)}
                    onReuse={() => handleReuse(sermon)}
                    onOpen={() => handleOpenProject(sermon)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">
                {sorted.map(sermon => (
                  <SermonArchiveListItem
                    key={sermon.id}
                    sermon={sermon}
                    isSelected={selectedSermon?.id === sermon.id}
                    onSelect={() => handleSelectSermon(sermon)}
                    onReuse={() => handleReuse(sermon)}
                    onOpen={() => handleOpenProject(sermon)}
                  />
                ))}
              </div>
            )}

            {/* Insights Section */}
            {sorted.length > 0 && showInsights && (
              <ArchiveInsightSummary stats={stats} />
            )}
          </div>
        </div>
      </div>

      {/* ─── Right Preview Panel ─── */}
      {selectedSermon && (
        <ArchivePreviewPanel
          sermon={selectedSermon}
          relatedSermons={relatedSermons}
          allSermons={allSermons}
          onClose={() => setSelectedSermon(null)}
          onReuse={() => handleReuse(selectedSermon)}
          onOpen={() => handleOpenProject(selectedSermon)}
          onNavigate={(id) => {
            const s = allSermons.find(s => s.id === id)
            if (s) setSelectedSermon(s)
          }}
        />
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════ */

/* ─── Filter Panel ─── */

function ArchiveFilterPanel({
  filterSections, filters, activeFilter, onToggleFilter, onSetActiveFilter,
  activeFilterCount, onClearFilters, stats,
}: {
  filterSections: { key: string; label: string; options: string[] }[]
  filters: Record<string, string[]>
  activeFilter: string | null
  onToggleFilter: (key: string, value: string) => void
  onSetActiveFilter: (key: string | null) => void
  activeFilterCount: number
  onClearFilters: () => void
  stats: { total: number; totalWords: number; bySeason: Record<string, number>; thisYear: number; byBook: Record<string, number>; topThemes: [string, number][] }
}) {
  const router = useRouter()
  return (
    <aside className="w-56 shrink-0 border-r border-white/5 bg-[#04060f]/60 backdrop-blur-md flex flex-col overflow-hidden relative z-10">
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-2.5 font-bold">
          <button onClick={() => router.push('/advanced')} className="hover:text-indigo-400 transition-colors">말씀 사역</button>
          <span className="text-slate-600">/</span>
          <span className="text-slate-300 font-extrabold">설교 아카이브</span>
        </div>
        <div className="flex items-center justify-between text-[11px] mb-1.5 text-slate-400 font-bold">
          <span>총 아카이브</span>
          <span className="font-extrabold text-white">{stats.total}편</span>
        </div>
        <div className="flex items-center justify-between text-[11px] mb-1.5 text-slate-400 font-bold">
          <span>누적 어휘량</span>
          <span className="font-extrabold text-slate-300">{(stats.totalWords / 10000).toFixed(1)}만 자</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
          <span>올해의 설교</span>
          <span className="font-extrabold text-indigo-400">{stats.thisYear}편</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filterSections.map(section => (
          <div key={section.key} className="border-b border-white/5">
            <button
              onClick={() => onSetActiveFilter(activeFilter === section.key ? null : section.key)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-[11px] font-bold text-slate-400">{section.label}</span>
              <div className="flex items-center gap-1.5">
                {filters[section.key]?.length > 0 && (
                  <span className="text-[9px] bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded-full font-bold">
                    {filters[section.key].length}
                  </span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${activeFilter === section.key ? 'rotate-180' : ''}`} />
              </div>
            </button>
            {activeFilter === section.key && (
              <div className="px-3 pb-3 space-y-1">
                {section.options.map(option => {
                  const isSelected = filters[section.key]?.includes(option)
                  return (
                    <button
                      key={option}
                      onClick={() => onToggleFilter(section.key, option)}
                      className={`w-full text-left text-[11px] px-2 py-1.5 rounded-lg transition-colors flex items-center justify-between font-medium ${
                        isSelected
                          ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                          : 'text-slate-400 hover:bg-white/[0.02] hover:text-slate-200'
                      }`}
                    >
                      <span>{option}</span>
                      {isSelected && <Check className="w-3 h-3 text-indigo-400" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {activeFilterCount > 0 && (
        <div className="p-3 border-t border-white/5">
          <button
            onClick={onClearFilters}
            className="w-full text-[11px] text-slate-400 hover:text-white py-2 rounded-xl border border-white/5 hover:border-white/10 transition-all flex items-center justify-center gap-1.5 font-bold"
          >
            <RefreshCw className="w-3 h-3" />
            <span>필터 초기화 ({activeFilterCount})</span>
          </button>
        </div>
      )}

      {/* Top Themes */}
      <div className="p-4 border-t border-white/5 space-y-3">
        <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">자주 다룬 사역 키워드</div>
        <div className="flex flex-wrap gap-1">
          {stats.topThemes.map(([theme, count]) => (
            <span key={theme} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
              {theme} <span className="opacity-50">{count}</span>
            </span>
          ))}
        </div>
      </div>
    </aside>
  )
}

/* ─── Search Bar ─── */

function ArchiveSearchBar({
  searchQuery, onSearchChange, viewMode, onViewModeChange, sortMode, onSortModeChange,
  quickFilters, resultCount, totalCount,
}: {
  searchQuery: string
  onSearchChange: (q: string) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  sortMode: SortMode
  onSortModeChange: (mode: SortMode) => void
  quickFilters: { label: string; query: string }[]
  resultCount: number
  totalCount: number
}) {
  const sortLabels: Record<SortMode, string> = {
    recent: '최신 일자순',
    relevance: '텍스트 분량순',
    referenced: '연계 참조순',
    reused: '재사용 빈도순',
  }

  return (
    <div className="bg-[#050814]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 shrink-0 space-y-3 relative z-10">
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="설교 요약, 본문 주석, 사역 태그로 보관소 정밀 검색..."
            className="w-full text-[13px] bg-[#0c1020] border border-white/5 rounded-xl pl-9 pr-4 py-2 text-slate-200 placeholder:text-slate-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex rounded-xl overflow-hidden border border-white/5 p-0.5 bg-[#090d20]">
          <button
            onClick={() => onViewModeChange('card')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'card' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="카드 형태로 보기"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="리스트 형태로 보기"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Sort */}
        <select
          value={sortMode}
          onChange={e => onSortModeChange(e.target.value as SortMode)}
          className="text-[12px] border border-white/5 rounded-xl px-3 py-2 outline-none focus:border-indigo-500/50 bg-[#0c1020] text-slate-300 font-bold cursor-pointer"
        >
          {Object.entries(sortLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Quick Filters */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-500 font-bold">빠른 키워드 필터:</span>
        <div className="flex flex-wrap gap-1">
          {quickFilters.map(f => (
            <button
              key={f.query}
              onClick={() => onSearchChange(f.query)}
              className={`text-[10px] px-2.5 py-1 rounded-lg transition-all font-semibold ${
                searchQuery === f.query
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : 'bg-white/5 border border-white/[0.02] text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-slate-500 font-bold ml-auto">
          {resultCount === totalCount ? `${resultCount}편 전체` : `필터결과 ${resultCount}편 / 총 ${totalCount}편`}
        </span>
      </div>
    </div>
  )
}

/* ─── Sermon Archive Card ─── */

function SermonArchiveCard({
  sermon, isSelected, onSelect, onReuse, onOpen,
}: {
  sermon: ArchivedSermon
  isSelected: boolean
  onSelect: () => void
  onReuse: () => void
  onOpen: () => void
}) {
  return (
    <div
      className={`rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[240px] p-5 relative overflow-hidden group ${
        isSelected
          ? 'border-indigo-500/40 bg-indigo-950/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
          : 'border-white/5 bg-[#04060f]/60 hover:border-white/10 hover:bg-[#04060f]/80'
      }`}
      onClick={onSelect}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[14px] font-bold text-white group-hover:text-indigo-400 transition-colors leading-snug line-clamp-1">
            {sermon.title}
          </h3>
          {sermon.seriesName && (
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 shrink-0 font-bold">
              {sermon.seriesName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold">
          <span className="text-indigo-300 font-extrabold bg-indigo-500/10 px-2 py-0.5 rounded">{sermon.passage}</span>
          <span>{sermon.sermonDate}</span>
        </div>

        <p className="text-[12px] text-slate-400 line-clamp-3 leading-relaxed font-medium">
          {sermon.coreMessage}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {sermon.themeNames.slice(0, 2).map(t => (
            <span key={t} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">{t}</span>
          ))}
          {sermon.tagNames.slice(0, 2).map(t => (
            <span key={t} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/[0.02]">#{t}</span>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-3 border-t border-white/5 mt-4">
        {/* Meta */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            {sermon.wordCount.toLocaleString()}자 · {sermon.outlineTitles.length}대지
          </span>
          <span>연계 {sermon.relatedIds.length}건</span>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-1.5 pt-1">
          <button
            onClick={e => { e.stopPropagation(); onOpen() }}
            className="flex-1 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm"
          >
            <span>열기</span>
          </button>
          <button
            onClick={e => { e.stopPropagation(); onReuse() }}
            className="flex-1 text-[11px] font-bold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white py-1.5 rounded-lg transition-colors border border-white/5"
          >
            <span>복제</span>
          </button>
          <button
            onClick={e => { e.stopPropagation(); onSelect() }}
            className="flex-1 text-[11px] font-bold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white py-1.5 rounded-lg transition-colors border border-white/5"
          >
            <span>상세</span>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Sermon Archive List Item ─── */

function SermonArchiveListItem({
  sermon, isSelected, onSelect, onReuse, onOpen,
}: {
  sermon: ArchivedSermon
  isSelected: boolean
  onSelect: () => void
  onReuse: () => void
  onOpen: () => void
}) {
  return (
    <div
      className={`flex items-center gap-4 px-5 py-3 rounded-2xl border transition-all duration-300 cursor-pointer ${
        isSelected
          ? 'border-indigo-500/40 bg-indigo-950/20'
          : 'border-white/5 bg-[#04060f]/60 hover:bg-[#04060f]/80'
      }`}
      onClick={onSelect}
    >
      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-extrabold text-indigo-300 shrink-0">
        {sermon.book.slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-bold text-white truncate">{sermon.title}</span>
          {sermon.seriesName && (
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 shrink-0 font-bold">
              {sermon.seriesName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-bold">
          <span className="font-extrabold text-indigo-300">{sermon.passage}</span>
          <span className="text-slate-600">·</span>
          <span>{sermon.sermonDate}</span>
          <span className="text-slate-600">·</span>
          <span>{sermon.audience.join(', ')}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 shrink-0 max-w-[200px]">
        {sermon.themeNames.slice(0, 2).map(t => (
          <span key={t} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">{t}</span>
        ))}
      </div>
      <div className="text-[11px] text-slate-400 font-bold shrink-0 w-16 text-right">
        {sermon.wordCount.toLocaleString()}자
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={e => { e.stopPropagation(); onOpen() }}
          className="text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          열기
        </button>
        <button
          onClick={e => { e.stopPropagation(); onReuse() }}
          className="text-[11px] font-bold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/5 transition-colors"
        >
          복제
        </button>
      </div>
    </div>
  )
}

/* ─── Preview Panel ─── */

function ArchivePreviewPanel({
  sermon, relatedSermons, allSermons, onClose, onReuse, onOpen, onNavigate,
}: {
  sermon: ArchivedSermon
  relatedSermons: ArchivedSermon[]
  allSermons: ArchivedSermon[]
  onClose: () => void
  onReuse: () => void
  onOpen: () => void
  onNavigate: (id: string) => void
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'detail' | 'related'>('detail')

  return (
    <aside className="w-80 shrink-0 border-l border-white/5 bg-[#04060f]/85 backdrop-blur-md overflow-y-auto scrollbar-thin relative z-10 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
        <h3 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Sermon Inspector</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 shrink-0 bg-[#090d20]">
        <button
          onClick={() => setActiveTab('detail')}
          className={`flex-1 text-[11px] py-2.5 font-bold transition-all ${
            activeTab === 'detail' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          상세 정보
        </button>
        <button
          onClick={() => setActiveTab('related')}
          className={`flex-1 text-[11px] py-2.5 font-bold transition-all ${
            activeTab === 'related' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          연관 아카이브 ({relatedSermons.length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
        {activeTab === 'detail' ? (
          <div className="space-y-5">
            {/* Title & Passage */}
            <div className="space-y-1.5">
              <h2 className="text-sm font-bold text-white font-sans">{sermon.title}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                <span className="font-extrabold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">{sermon.passage}</span>
                <span>{sermon.sermonDate}</span>
              </div>
            </div>

            {/* Core Message */}
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
              <div className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-widest mb-1.5">핵심 메세지 (Core Message)</div>
              <p className="text-[12px] text-indigo-200 leading-relaxed font-semibold italic">&ldquo;{sermon.coreMessage}&rdquo;</p>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <MetaItem label="대상 청중" value={sermon.audience.join(', ')} />
              <MetaItem label="예배 유형" value={sermon.sermonType} />
              <MetaItem label="누적 자수" value={`${sermon.wordCount.toLocaleString()}자`} />
              <MetaItem label="구조화 대지" value={`${sermon.outlineTitles.length}개`} />
            </div>

            {/* Series */}
            {sermon.seriesName && (
              <div className="space-y-1">
                <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">강해 시리즈</div>
                <span className="inline-block text-[11px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg font-bold">{sermon.seriesName}</span>
              </div>
            )}

            {/* Outline */}
            <div className="space-y-2">
              <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">설교 전개 개요 (Outline)</div>
              <div className="space-y-1.5">
                {sermon.outlineTitles.map((t, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[11.5px] text-slate-300 font-medium leading-snug">
                    <span className="w-4 h-4 rounded-full bg-white/5 border border-white/10 text-[9px] font-extrabold flex items-center justify-center shrink-0 mt-0.5 text-indigo-300">{i + 1}</span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Themes & Tags */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">연구 주제 테마</div>
                <div className="flex flex-wrap gap-1">
                  {sermon.themeNames.map(t => (
                    <span key={t} className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">{t}</span>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">색인 태그</div>
                <div className="flex flex-wrap gap-1">
                  {sermon.tagNames.map(t => (
                    <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/[0.02]">#{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-4 border-t border-white/5 shrink-0">
              <button
                onClick={onOpen}
                className="w-full text-[12px] bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl transition-all font-bold shadow-lg shadow-indigo-600/15"
              >
                설교 프로젝트 열기
              </button>
              <button
                onClick={onReuse}
                className="w-full text-[12px] border border-white/5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white py-2.5 rounded-xl transition-all font-bold"
              >
                새 프로젝트로 복제
              </button>
              <button
                onClick={() => router.push('/advanced')}
                className="w-full text-[11px] border border-white/5 hover:border-white/10 text-slate-400 hover:text-white py-2 rounded-xl transition-all font-bold"
              >
                인텔리전스 그래프 연동 →
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {relatedSermons.length > 0 ? (
              relatedSermons.map(rs => (
                <button
                  key={rs.id}
                  onClick={() => onNavigate(rs.id)}
                  className="w-full text-left p-4 rounded-2xl border border-white/5 hover:border-indigo-500/30 bg-[#04060f]/40 hover:bg-[#04060f]/80 transition-all space-y-2"
                >
                  <div className="text-[12px] font-bold text-slate-200">{rs.title}</div>
                  <div className="text-[10px] text-slate-400 font-bold">{rs.passage} · {rs.sermonDate}</div>
                  <div className="flex flex-wrap gap-1">
                    {rs.themeNames.slice(0, 2).map(t => (
                      <span key={t} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">{t}</span>
                    ))}
                  </div>
                </button>
              ))
            ) : (
              <div className="text-[11px] text-slate-500 text-center py-10 font-bold">연계 설정된 설교 파일이 없습니다.</div>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}

/* ─── Empty State ─── */

function ArchiveEmptyState({
  searchQuery, onClearFilters, quickFilters, onQuickFilter,
}: {
  searchQuery: string
  onClearFilters: () => void
  quickFilters: { label: string; query: string }[]
  onQuickFilter: (q: string) => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 border border-white/5">
        <FolderOpen className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-white">
          {searchQuery ? `"${searchQuery}" 검색 결과 없음` : '아카이브가 비어 있습니다'}
        </h3>
        <p className="text-xs text-slate-500 font-medium">
          {searchQuery ? '질문어나 필터를 변경하거나 초기화해보세요.' : '설교 작성 완료 시 원고가 자동 보관됩니다.'}
        </p>
      </div>
      {searchQuery && (
        <button onClick={onClearFilters} className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
          검색어 및 필터 초기화
        </button>
      )}
      <div className="flex flex-wrap gap-1.5 justify-center max-w-sm pt-2">
        {quickFilters.map(f => (
          <button
            key={f.query}
            onClick={() => onQuickFilter(f.query)}
            className="text-[10px] px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/[0.02] text-slate-400 hover:text-white transition-all font-semibold"
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── Insight Summary ─── */

function ArchiveInsightSummary({ stats }: {
  stats: { total: number; totalWords: number; bySeason: Record<string, number>; thisYear: number; byBook: Record<string, number>; topThemes: [string, number][] }
}) {
  const topBooks = Object.entries(stats.byBook).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">설교 데이터 통계 분석</h3>
        <span className="text-[10px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded font-bold">전체 {stats.total}편 기준</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Top Books */}
        <div className="bg-[#04060f]/60 rounded-2xl border border-white/5 p-4 space-y-3">
          <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">다독 연구 성경 권수</div>
          <div className="space-y-2">
            {topBooks.map(([book, count]) => (
              <div key={book} className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-400">{book}</span>
                <span className="font-extrabold text-slate-200">{count}편</span>
              </div>
            ))}
          </div>
        </div>

        {/* Season Distribution */}
        <div className="bg-[#04060f]/60 rounded-2xl border border-white/5 p-4 space-y-3">
          <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">교회 절기별 통계</div>
          <div className="space-y-2">
            {Object.entries(stats.bySeason).map(([season, count]) => (
              <div key={season} className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-400">{season}</span>
                <span className="font-extrabold text-slate-200">{count}편</span>
              </div>
            ))}
          </div>
        </div>

        {/* Asset Flow */}
        <div className="bg-[#04060f]/60 rounded-2xl border border-white/5 p-4 space-y-3">
          <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">텍스트 메트릭 현황</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-500">전체 원고 분량</span>
              <span className="font-extrabold text-slate-200">{(stats.totalWords).toLocaleString()}자</span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-500">평균 단어 규모</span>
              <span className="font-extrabold text-indigo-400">{Math.round(stats.totalWords / stats.total).toLocaleString()}자</span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-500">올해 사역 비중</span>
              <span className="font-extrabold text-indigo-400">{Math.round((stats.thisYear / stats.total) * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Utility ─── */

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 rounded-xl border border-white/[0.02] p-2.5 space-y-0.5">
      <div className="text-[9.5px] text-slate-500 font-bold">{label}</div>
      <div className="text-[12px] font-bold text-slate-300">{value}</div>
    </div>
  )
}
