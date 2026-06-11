'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ARCHIVE_SERMONS, getFilterOptions, getRelatedSermons, searchSermons, filterSermons } from '@/lib/advanced/archiveData'
import type { ArchivedSermon } from '@/lib/advanced/archiveData'

type ViewMode = 'card' | 'list'
type SortMode = 'recent' | 'relevance' | 'referenced' | 'reused'

export default function ArchivePage() {
  const router = useRouter()
  const allSermons = ARCHIVE_SERMONS
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
    { key: 'books', label: '성경 책', options: filterOptions.books },
    { key: 'themes', label: '주제', options: filterOptions.themes },
    { key: 'series', label: '시리즈', options: filterOptions.series },
    { key: 'seasons', label: '절기', options: filterOptions.seasons },
    { key: 'audiences', label: '회중', options: filterOptions.audiences },
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
    <div className="flex h-full overflow-hidden">
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-5">
            {sorted.length === 0 ? (
              <ArchiveEmptyState
                searchQuery={searchQuery}
                onClearFilters={clearFilters}
                quickFilters={quickFilters}
                onQuickFilter={q => setSearchQuery(q)}
              />
            ) : viewMode === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
              <div className="space-y-1">
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
    <aside className="w-56 shrink-0 border-r border-paper-200 bg-paper-50 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-paper-200">
        <div className="flex items-center gap-1 text-[10px] text-paper-400 mb-2">
          <button onClick={() => router.push('/advanced')} className="hover:text-green-600 transition-colors">말씀 사역</button>
          <span className="text-paper-300">/</span>
          <span className="text-paper-600 font-medium">설교 아카이브</span>
        </div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-paper-500">총 설교</span>
          <span className="font-bold text-paper-800">{stats.total}편</span>
        </div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-paper-500">누적 분량</span>
          <span className="font-medium text-paper-700">{(stats.totalWords / 10000).toFixed(1)}만 자</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-paper-500">올해 설교</span>
          <span className="font-medium text-green-600">{stats.thisYear}편</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filterSections.map(section => (
          <div key={section.key} className="border-b border-paper-150">
            <button
              onClick={() => onSetActiveFilter(activeFilter === section.key ? null : section.key)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-paper-100 transition-colors"
            >
              <span className="text-[11px] font-medium text-paper-600">{section.label}</span>
              <div className="flex items-center gap-1">
                {filters[section.key]?.length > 0 && (
                  <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                    {filters[section.key].length}
                  </span>
                )}
                <svg className={`w-3.5 h-3.5 text-paper-400 transition-transform ${activeFilter === section.key ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            {activeFilter === section.key && (
              <div className="px-3 pb-2 space-y-0.5">
                {section.options.map(option => (
                  <button
                    key={option}
                    onClick={() => onToggleFilter(section.key, option)}
                    className={`w-full text-left text-[11px] px-2 py-1 rounded transition-colors ${
                      filters[section.key]?.includes(option)
                        ? 'bg-green-100 text-green-700 font-medium'
                        : 'text-paper-500 hover:bg-paper-100'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {activeFilterCount > 0 && (
        <div className="p-3 border-t border-paper-200">
          <button
            onClick={onClearFilters}
            className="w-full text-[11px] text-paper-500 hover:text-paper-700 py-1.5 rounded border border-paper-200 hover:border-paper-300 transition-colors"
          >
            필터 초기화 ({activeFilterCount})
          </button>
        </div>
      )}

      {/* Top Themes */}
      <div className="p-3 border-t border-paper-200">
        <div className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest mb-2">자주 다룬 주제</div>
        <div className="flex flex-wrap gap-1">
          {stats.topThemes.map(([theme, count]) => (
            <span key={theme} className="text-[10px] px-1.5 py-0.5 rounded bg-gold-100 text-gold-700">
              {theme} <span className="opacity-60">{count}</span>
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
    recent: '최신순',
    relevance: '관련도순',
    referenced: '참조 많은 순',
    reused: '재사용 순',
  }

  return (
    <div className="bg-white border-b border-paper-200 px-5 py-3 shrink-0">
      <div className="flex items-center gap-3 mb-2">
        {/* Search Input */}
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-paper-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="설교 제목, 본문, 주제, 태그로 검색..."
            className="w-full text-sm bg-paper-50 border border-paper-200 rounded-lg pl-9 pr-4 py-2 outline-none focus:border-green-300 focus:bg-white transition-colors placeholder:text-paper-400"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex rounded-md overflow-hidden border border-paper-200">
          <button
            onClick={() => onViewModeChange('card')}
            className={`text-[11px] px-2.5 py-1.5 transition-colors ${
              viewMode === 'card' ? 'bg-navy-600 text-white' : 'bg-white text-paper-500 hover:bg-paper-50'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`text-[11px] px-2.5 py-1.5 transition-colors ${
              viewMode === 'list' ? 'bg-navy-600 text-white' : 'bg-white text-paper-500 hover:bg-paper-50'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Sort */}
        <select
          value={sortMode}
          onChange={e => onSortModeChange(e.target.value as SortMode)}
          className="text-[11px] border border-paper-200 rounded-md px-2 py-1.5 outline-none focus:border-green-300 bg-white text-paper-600"
        >
          {Object.entries(sortLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Quick Filters */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-paper-400">빠른 검색:</span>
        {quickFilters.map(f => (
          <button
            key={f.query}
            onClick={() => onSearchChange(f.query)}
            className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
              searchQuery === f.query
                ? 'bg-green-100 text-green-700 font-medium'
                : 'bg-paper-100 text-paper-500 hover:bg-paper-150'
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="text-[10px] text-paper-400 ml-auto">
          {resultCount === totalCount ? `${resultCount}편` : `${totalCount}편 중 ${resultCount}편`}
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
      className={`rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'border-green-300 bg-green-50/40 shadow-sm'
          : 'border-paper-200 bg-white hover:border-paper-300 hover:shadow-sm'
      }`}
      onClick={onSelect}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-semibold text-paper-800 line-clamp-1">{sermon.title}</h3>
          {sermon.seriesName && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 shrink-0 ml-2">
              {sermon.seriesName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-paper-500 mb-2">
          <span className="font-medium text-paper-700 bg-paper-100 px-1.5 py-0.5 rounded">{sermon.passage}</span>
          <span>{sermon.sermonDate}</span>
        </div>

        <p className="text-[11px] text-paper-500 line-clamp-2 mb-3 leading-relaxed">{sermon.coreMessage}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {sermon.themeNames.slice(0, 3).map(t => (
            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-gold-100 text-gold-700">{t}</span>
          ))}
          {sermon.tagNames.slice(0, 2).map(t => (
            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-paper-100 text-paper-500">#{t}</span>
          ))}
        </div>

        {/* Meta */}
          <div className="flex items-center justify-between text-[10px] text-paper-400 pt-2 border-t border-paper-100">
            <div className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-green-400" />
              <span>{sermon.wordCount.toLocaleString()}자 · {sermon.outlineTitles.length}대지</span>
            </div>
            <span>관련 {sermon.relatedIds.length}개</span>
          </div>
      </div>

      {/* Quick Actions */}
      <div className="flex border-t border-paper-150">
        <button
          onClick={e => { e.stopPropagation(); onOpen() }}
          className="flex-1 text-[10px] text-paper-500 hover:text-green-600 hover:bg-green-50/50 py-1.5 transition-colors border-r border-paper-150"
        >
          열기
        </button>
        <button
          onClick={e => { e.stopPropagation(); onReuse() }}
          className="flex-1 text-[10px] text-paper-500 hover:text-green-600 hover:bg-green-50/50 py-1.5 transition-colors border-r border-paper-150"
        >
          복제
        </button>
        <button
          onClick={e => { e.stopPropagation(); onSelect() }}
          className="flex-1 text-[10px] text-paper-500 hover:text-green-600 hover:bg-green-50/50 py-1.5 transition-colors"
        >
          상세
        </button>
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
      className={`flex items-center gap-4 px-4 py-3 rounded-lg border transition-all cursor-pointer ${
        isSelected
          ? 'border-green-300 bg-green-50/40'
          : 'border-transparent hover:bg-paper-50'
      }`}
      onClick={onSelect}
    >
      <div className="w-10 h-10 rounded-lg bg-paper-100 flex items-center justify-center text-[10px] font-bold text-paper-500 shrink-0">
        {sermon.book.slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-paper-800 truncate">{sermon.title}</span>
          {sermon.seriesName && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 shrink-0">
              {sermon.seriesName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-paper-500 mt-0.5">
          <span className="font-medium text-paper-600">{sermon.passage}</span>
          <span className="text-paper-300">·</span>
          <span>{sermon.sermonDate}</span>
          <span className="text-paper-300">·</span>
          <span>{sermon.audience.join(', ')}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 shrink-0 max-w-[200px]">
        {sermon.themeNames.slice(0, 2).map(t => (
          <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-gold-100 text-gold-700">{t}</span>
        ))}
      </div>
      <div className="text-[10px] text-paper-400 shrink-0 w-16 text-right">
        {sermon.wordCount.toLocaleString()}자
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={e => { e.stopPropagation(); onOpen() }}
          className="text-[10px] text-paper-400 hover:text-green-600 px-2 py-1 rounded transition-colors"
        >
          열기
        </button>
        <button
          onClick={e => { e.stopPropagation(); onReuse() }}
          className="text-[10px] text-paper-400 hover:text-green-600 px-2 py-1 rounded transition-colors"
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
    <aside className="w-80 shrink-0 border-l border-paper-200 bg-white overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="p-4 border-b border-paper-200 flex items-center justify-between">
        <h3 className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest">설교 상세</h3>
        <button onClick={onClose} className="text-paper-400 hover:text-paper-600 p-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-paper-200">
        <button
          onClick={() => setActiveTab('detail')}
          className={`flex-1 text-[11px] py-2 font-medium transition-colors ${
            activeTab === 'detail' ? 'text-paper-800 border-b-2 border-green-500' : 'text-paper-400 hover:text-paper-600'
          }`}
        >
          상세
        </button>
        <button
          onClick={() => setActiveTab('related')}
          className={`flex-1 text-[11px] py-2 font-medium transition-colors ${
            activeTab === 'related' ? 'text-paper-800 border-b-2 border-green-500' : 'text-paper-400 hover:text-paper-600'
          }`}
        >
          관련 ({relatedSermons.length})
        </button>
      </div>

      {activeTab === 'detail' ? (
        <div className="p-4 space-y-4">
          {/* Title & Passage */}
          <div>
            <h2 className="text-sm font-bold text-paper-900 font-serif">{sermon.title}</h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-paper-500">
              <span className="font-medium text-paper-700 bg-paper-100 px-2 py-0.5 rounded">{sermon.passage}</span>
              <span>{sermon.sermonDate}</span>
            </div>
          </div>

          {/* Core Message */}
          <div className="bg-green-50/60 border border-green-200/60 rounded-lg p-3">
            <div className="text-[9px] font-semibold text-green-600 uppercase tracking-wider mb-1">핵심 메시지</div>
            <p className="text-xs text-green-800 leading-relaxed italic">&ldquo;{sermon.coreMessage}&rdquo;</p>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <MetaItem label="회중" value={sermon.audience.join(', ')} />
            <MetaItem label="유형" value={sermon.sermonType} />
            <MetaItem label="분량" value={`${sermon.wordCount.toLocaleString()}자`} />
            <MetaItem label="대지" value={`${sermon.outlineTitles.length}개`} />
            <MetaItem label="설교일" value={sermon.sermonDate} />
          </div>

          {/* Series */}
          {sermon.seriesName && (
            <div>
              <div className="text-[9px] font-semibold text-paper-400 uppercase tracking-wider mb-1">시리즈</div>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">{sermon.seriesName}</span>
            </div>
          )}

          {/* Outline */}
          <div>
            <div className="text-[9px] font-semibold text-paper-400 uppercase tracking-wider mb-1.5">대지</div>
            <div className="space-y-1">
              {sermon.outlineTitles.map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-paper-600">
                  <span className="w-4 h-4 rounded-full bg-paper-150 text-[9px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Themes & Tags */}
          <div>
            <div className="text-[9px] font-semibold text-paper-400 uppercase tracking-wider mb-1.5">주제</div>
            <div className="flex flex-wrap gap-1">
              {sermon.themeNames.map(t => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-gold-100 text-gold-700">{t}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-semibold text-paper-400 uppercase tracking-wider mb-1.5">태그</div>
            <div className="flex flex-wrap gap-1">
              {sermon.tagNames.map(t => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-paper-100 text-paper-500">#{t}</span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-1.5 pt-2 border-t border-paper-200">
            <button
              onClick={onOpen}
              className="w-full text-xs bg-green-500 hover:bg-green-600 text-white py-2 rounded-md transition-colors font-medium"
            >
              프로젝트 열기
            </button>
            <button
              onClick={onReuse}
              className="w-full text-xs border border-paper-200 hover:border-green-300 text-paper-600 hover:text-green-600 py-2 rounded-md transition-colors"
            >
              새 프로젝트로 복제
            </button>
            {sermon.seriesName && (
              <button
                onClick={() => {
                  const seriesId = sermon.relatedIds.find(id => id.startsWith('ser-'))
                  if (seriesId) router.push(`/advanced/series/${seriesId}`)
                }}
                className="w-full text-xs border border-paper-200 hover:border-green-300 text-paper-500 hover:text-green-600 py-1.5 rounded-md transition-colors"
              >
                시리즈에서 보기 →
              </button>
            )}
            <button
              onClick={() => router.push('/advanced/graph')}
              className="w-full text-xs border border-paper-200 hover:border-green-300 text-paper-500 hover:text-green-600 py-1.5 rounded-md transition-colors"
            >
              그래프에서 보기 →
            </button>
            <button
              onClick={() => router.push('/advanced/notes')}
              className="w-full text-xs border border-paper-200 hover:border-green-300 text-paper-500 hover:text-green-600 py-1.5 rounded-md transition-colors"
            >
              관련 노트 보기 →
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-2">
          {relatedSermons.length > 0 ? (
            relatedSermons.map(rs => (
              <button
                key={rs.id}
                onClick={() => onNavigate(rs.id)}
                className="w-full text-left p-3 rounded-lg border border-paper-150 hover:border-green-200 hover:bg-green-50/20 transition-colors"
              >
                <div className="text-xs font-medium text-paper-800">{rs.title}</div>
                <div className="text-[10px] text-paper-400 mt-0.5">{rs.passage} · {rs.sermonDate}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {rs.themeNames.slice(0, 2).map(t => (
                    <span key={t} className="text-[9px] px-1 py-0.5 rounded bg-gold-100 text-gold-700">{t}</span>
                  ))}
                </div>
              </button>
            ))
          ) : (
            <div className="text-xs text-paper-400 text-center py-8">관련 설교가 없습니다.</div>
          )}
        </div>
      )}
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
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <svg className="w-12 h-12 mb-4 text-paper-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
      <h3 className="text-sm font-medium text-paper-700 mb-1">
        {searchQuery ? `"${searchQuery}"에 대한 결과가 없습니다` : '아카이브가 비어 있습니다'}
      </h3>
      <p className="text-xs text-paper-400 mb-4">
        {searchQuery ? '다른 검색어를 시도하거나 필터를 초기화하세요' : '설교를 작성하면 아카이브에 자동으로 저장됩니다'}
      </p>
      {searchQuery && (
        <button onClick={onClearFilters} className="text-xs text-green-600 hover:underline mb-4 font-medium">
          필터 초기화
        </button>
      )}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {quickFilters.map(f => (
          <button
            key={f.query}
            onClick={() => onQuickFilter(f.query)}
            className="text-[10px] px-2 py-1 rounded bg-paper-100 text-paper-500 hover:bg-paper-150 transition-colors"
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
    <div className="mt-8 pt-6 border-t border-paper-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-semibold text-paper-500 uppercase tracking-widest">설교 자료 분석</h3>
        <span className="text-[10px] text-paper-400 bg-paper-100 px-2 py-0.5 rounded font-medium">총 {stats.total}편</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Books */}
        <div className="bg-white rounded-xl border border-paper-200 p-4">
          <div className="text-[10px] font-semibold text-paper-400 uppercase tracking-wider mb-2">주요 설교 성경</div>
          <div className="space-y-1.5">
            {topBooks.map(([book, count]) => (
              <div key={book} className="flex items-center justify-between text-xs">
                <span className="text-paper-600">{book}</span>
                <span className="font-medium text-paper-700">{count}편</span>
              </div>
            ))}
          </div>
        </div>

        {/* Season Distribution */}
        <div className="bg-white rounded-xl border border-paper-200 p-4">
          <div className="text-[10px] font-semibold text-paper-400 uppercase tracking-wider mb-2">절기별 설교 분포</div>
          <div className="space-y-1.5">
            {Object.entries(stats.bySeason).map(([season, count]) => (
              <div key={season} className="flex items-center justify-between text-xs">
                <span className="text-paper-600">{season}</span>
                <span className="font-medium text-paper-700">{count}편</span>
              </div>
            ))}
          </div>
        </div>

        {/* Asset Flow */}
        <div className="bg-white rounded-xl border border-paper-200 p-4">
          <div className="text-[10px] font-semibold text-paper-400 uppercase tracking-wider mb-2">설교 자료 현황</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-paper-500">전체 설교</span>
              <span className="font-bold text-paper-800">{stats.total}편</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-paper-500">누적 분량</span>
              <span className="font-medium text-paper-700">{(stats.totalWords / 10000).toFixed(1)}만 자</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-paper-500">올해 설교</span>
              <span className="font-medium text-green-600">{stats.thisYear}편</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-paper-500">평균 분량</span>
              <span className="font-medium text-paper-700">{Math.round(stats.totalWords / stats.total).toLocaleString()}자</span>
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
    <div className="bg-paper-50 rounded-lg p-2">
      <div className="text-[9px] text-paper-400">{label}</div>
      <div className="text-[11px] font-medium text-paper-700 mt-0.5">{value}</div>
    </div>
  )
}
