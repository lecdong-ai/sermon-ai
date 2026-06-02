'use client'

import { Suspense, useState, useMemo } from 'react'
import { useApp } from '@/lib/dashboard/store'
import { useRouter, useSearchParams } from 'next/navigation'
import { ViewMode, Sermon } from '@/lib/dashboard/types'
import { BIBLE_BOOKS, SERMON_TYPES, AUDIENCES, SEASONS } from '@/lib/dashboard/constants'

function SermonsContent() {
  const { state, getSeries, getTheme } = useApp()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { sermons, themes, series, seminars } = state

  const initialSearch = searchParams.get('search') || ''
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [searchText, setSearchText] = useState(initialSearch)
  const [filterBook, setFilterBook] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterAudience, setFilterAudience] = useState('')
  const [filterSeason, setFilterSeason] = useState('')
  const [filterSeminar, setFilterSeminar] = useState('')
  const [filterSeries, setFilterSeries] = useState('')
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'title' | 'book'>('date-desc')

  const filtered = useMemo(() => {
    let result = [...sermons].filter(s => s.status === 'completed')
    if (searchText) {
      const q = searchText.toLowerCase()
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.normalizedPassage.toLowerCase().includes(q) ||
          s.coreMessage.toLowerCase().includes(q) ||
          s.bibleBook.toLowerCase().includes(q)
      )
    }
    if (filterBook) result = result.filter((s) => s.bibleBook === filterBook)
    if (filterType) result = result.filter((s) => s.sermonType === filterType)
    if (filterAudience) result = result.filter((s) => s.audience === filterAudience)
    if (filterSeason) result = result.filter((s) => s.season === filterSeason)
    if (filterSeminar) result = result.filter((s) => (s as any).seminar === filterSeminar)
    if (filterSeries) result = result.filter((s) => s.seriesId === filterSeries)
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc': return new Date(b.date).getTime() - new Date(a.date).getTime()
        case 'date-asc': return new Date(a.date).getTime() - new Date(b.date).getTime()
        case 'title': return a.title.localeCompare(b.title)
        case 'book': return a.bibleBook.localeCompare(b.bibleBook)
        default: return 0
      }
    })
    return result
  }, [sermons, searchText, filterBook, filterType, filterAudience, filterSeason, filterSeminar, filterSeries, sortBy])

  const FilterSelect = ({
    value, onChange, options, placeholder,
  }: { value: string; onChange: (v: string) => void; options: readonly string[]; placeholder: string }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs border border-border rounded px-2 py-1.5 bg-surface focus:outline-none focus:ring-1 focus:ring-primary-light text-muted"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  )

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">설교 목록</h2>
        <button onClick={() => router.push('/dashboard/sermons/new')} className="text-sm bg-primary hover:bg-primary-dark text-white px-4 py-1.5 rounded-md transition-colors">
          + 새 설교
        </button>
      </div>

      <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">⌕</span>
            <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="제목, 본문, 메시지, 주제 검색..." className="w-full pl-8 pr-3 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light" />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <FilterSelect value={filterType} onChange={setFilterType} options={SERMON_TYPES} placeholder="설교 종류" />
            <FilterSelect value={filterAudience} onChange={setFilterAudience} options={AUDIENCES} placeholder="회중" />
            <FilterSelect value={filterSeason} onChange={setFilterSeason} options={SEASONS} placeholder="절기" />
            <FilterSelect value={filterSeminar} onChange={setFilterSeminar} options={seminars} placeholder="특별 세미나" />
            <select
              value={filterSeries}
              onChange={(e) => setFilterSeries(e.target.value)}
              className="text-xs border border-border rounded px-2 py-1.5 bg-surface focus:outline-none focus:ring-1 focus:ring-primary-light text-muted"
            >
              <option value="">시리즈</option>
              {series.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-xs border border-border rounded px-2 py-1.5 bg-surface focus:outline-none focus:ring-1 focus:ring-primary-light text-muted"
            >
              <option value="date-desc">최신순</option>
              <option value="date-asc">오래된순</option>
              <option value="title">제목순</option>
              <option value="book">성경책순</option>
            </select>
            <div className="flex border border-border rounded overflow-hidden">
              <button onClick={() => setViewMode('table')} className={`px-2.5 py-1.5 text-xs ${viewMode === 'table' ? 'bg-primary text-white' : 'bg-surface text-muted hover:bg-background'}`}>☰</button>
              <button onClick={() => setViewMode('card')} className={`px-2.5 py-1.5 text-xs ${viewMode === 'card' ? 'bg-primary text-white' : 'bg-surface text-muted hover:bg-background'}`}>▦</button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FilterSelect value={filterBook} onChange={setFilterBook} options={BIBLE_BOOKS} placeholder="성경책" />
          {(filterBook || filterType || filterAudience || filterSeason || filterSeminar || filterSeries) && (
            <button onClick={() => { setFilterBook(''); setFilterType(''); setFilterAudience(''); setFilterSeason(''); setFilterSeminar(''); setFilterSeries(''); setSearchText('') }} className="text-xs text-primary hover:text-primary-dark">필터 초기화</button>
          )}
          <span className="text-xs text-muted ml-auto">총 {filtered.length}개의 결과</span>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th className="text-left py-3 px-4 text-xs text-muted font-medium">제목</th>
                <th className="text-left py-3 px-4 text-xs text-muted font-medium">본문</th>
                <th className="text-left py-3 px-4 text-xs text-muted font-medium">종류</th>
                <th className="text-left py-3 px-4 text-xs text-muted font-medium">회중</th>
                <th className="text-left py-3 px-4 text-xs text-muted font-medium">날짜</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sermon) => (
                <tr key={sermon.id} onClick={() => router.push(`/dashboard/sermons/${sermon.id}`)} className="border-b border-border/50 hover:bg-background/80 cursor-pointer transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-medium text-foreground">{sermon.title}</p>
                    <p className="text-xs text-muted mt-0.5">{sermon.coreMessage.slice(0, 40)}...</p>
                  </td>
                  <td className="py-3 px-4 text-muted">{sermon.normalizedPassage}</td>
                  <td className="py-3 px-4 text-muted">{sermon.sermonType}</td>
                  <td className="py-3 px-4 text-muted">{sermon.audience}</td>
                  <td className="py-3 px-4 text-muted shrink-0">{sermon.date.replace(/-/g, '.')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-12 text-center text-muted text-sm">검색 결과가 없습니다</div>}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((sermon) => (
            <div key={sermon.id} onClick={() => router.push(`/dashboard/sermons/${sermon.id}`)} className="bg-surface border border-border rounded-lg p-4 hover:shadow-sm cursor-pointer transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-foreground truncate">{sermon.title}</p>
                  <p className="text-xs text-muted mt-1">{sermon.normalizedPassage}</p>
                </div>
                <span className="text-xs text-muted shrink-0">{sermon.date.replace(/-/g, '.')}</span>
              </div>
              <p className="text-xs text-muted mt-2 line-clamp-2">{sermon.coreMessage}</p>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="text-[10px] bg-background text-muted px-1.5 py-0.5 rounded">{sermon.sermonType}</span>
                <span className="text-[10px] bg-background text-muted px-1.5 py-0.5 rounded">{sermon.audience}</span>
                {sermon.season && <span className="text-[10px] bg-background text-muted px-1.5 py-0.5 rounded">{sermon.season}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SermonsPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-muted text-sm">로딩 중...</div>}>
      <SermonsContent />
    </Suspense>
  )
}
