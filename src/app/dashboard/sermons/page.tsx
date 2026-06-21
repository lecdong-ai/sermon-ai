'use client'

import { Suspense, useState, useMemo } from 'react'
import { useApp } from '@/lib/dashboard/store'
import { useRouter, useSearchParams } from 'next/navigation'
import { ViewMode, Sermon } from '@/lib/dashboard/types'
import { BIBLE_BOOKS, SERMON_TYPES, AUDIENCES, SEASONS } from '@/lib/dashboard/constants'
import { Sparkles } from 'lucide-react'

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
  const [generatingId, setGeneratingId] = useState<string | null>(null)

  const handleGenerate = async (sermon: Sermon) => {
    if (generatingId) return
    setGeneratingId(sermon.id)
    try {
      const res = await fetch(`/api/sermons/${sermon.id}/generate`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        router.push(`/workspace?id=${sermon.id}`)
      } else {
        alert(data.error || '생성에 실패했습니다.')
      }
    } catch {
      alert('네트워크 오류가 발생했습니다.')
    } finally {
      setGeneratingId(null)
    }
  }

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
      className="text-xs border border-white/10 rounded-lg px-2 py-1.5 bg-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 text-slate-300 font-medium"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  )

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">설교 목록</h2>
        <button onClick={() => router.push('/dashboard/sermons/new')} className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl transition-colors shadow-lg shadow-indigo-600/20 font-bold">
          + 새 설교
        </button>
      </div>

      <div className="glass-dark rounded-2xl p-4 space-y-3 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">⌕</span>
            <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="제목, 본문, 메시지, 주제 검색..." className="w-full pl-8 pr-3 py-1.5 text-sm border border-white/10 rounded-xl bg-white/5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500/40 font-medium" />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <FilterSelect value={filterType} onChange={setFilterType} options={SERMON_TYPES} placeholder="설교 종류" />
            <FilterSelect value={filterAudience} onChange={setFilterAudience} options={AUDIENCES} placeholder="회중" />
            <FilterSelect value={filterSeason} onChange={setFilterSeason} options={SEASONS} placeholder="절기" />
            <FilterSelect value={filterSeminar} onChange={setFilterSeminar} options={seminars} placeholder="특별 세미나" />
            <select
              value={filterSeries}
              onChange={(e) => setFilterSeries(e.target.value)}
              className="text-xs border border-white/10 rounded-lg px-2 py-1.5 bg-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 text-slate-300 font-medium"
            >
              <option value="">시리즈</option>
              {series.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-xs border border-white/10 rounded-lg px-2 py-1.5 bg-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 text-slate-300 font-medium"
            >
              <option value="date-desc">최신순</option>
              <option value="date-asc">오래된순</option>
              <option value="title">제목순</option>
              <option value="book">성경책순</option>
            </select>
            <div className="flex border border-white/10 rounded-lg overflow-hidden">
              <button onClick={() => setViewMode('table')} className={`px-2.5 py-1.5 text-xs font-bold transition-colors ${viewMode === 'table' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}>☰</button>
              <button onClick={() => setViewMode('card')} className={`px-2.5 py-1.5 text-xs font-bold transition-colors ${viewMode === 'card' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}>▦</button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FilterSelect value={filterBook} onChange={setFilterBook} options={BIBLE_BOOKS} placeholder="성경책" />
          {(filterBook || filterType || filterAudience || filterSeason || filterSeminar || filterSeries) && (
            <button onClick={() => { setFilterBook(''); setFilterType(''); setFilterAudience(''); setFilterSeason(''); setFilterSeminar(''); setFilterSeries(''); setSearchText('') }} className="text-xs text-indigo-300 hover:text-indigo-200 font-bold transition-colors">필터 초기화</button>
          )}
          <span className="text-xs text-slate-500 ml-auto font-bold tabular-nums">총 {filtered.length}개의 결과</span>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="glass-dark rounded-2xl overflow-hidden border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="text-left py-3 px-4 text-xs text-slate-400 font-bold uppercase tracking-widest">제목</th>
                <th className="text-left py-3 px-4 text-xs text-slate-400 font-bold uppercase tracking-widest">본문</th>
                <th className="text-left py-3 px-4 text-xs text-slate-400 font-bold uppercase tracking-widest">종류</th>
                <th className="text-left py-3 px-4 text-xs text-slate-400 font-bold uppercase tracking-widest">회중</th>
                <th className="text-left py-3 px-4 text-xs text-slate-400 font-bold uppercase tracking-widest">날짜</th>
                <th className="text-right py-3 px-4 text-xs text-slate-400 font-bold uppercase tracking-widest">AI</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sermon) => (
                <tr key={sermon.id} onClick={() => router.push(`/dashboard/sermons/${sermon.id}`)} className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">{sermon.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">{sermon.coreMessage.slice(0, 40)}...</p>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-medium">{sermon.normalizedPassage}</td>
                  <td className="py-3 px-4 text-slate-400">{sermon.sermonType}</td>
                  <td className="py-3 px-4 text-slate-400">{sermon.audience}</td>
                  <td className="py-3 px-4 text-slate-500 shrink-0 font-bold tabular-nums">{sermon.date.replace(/-/g, '.')}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleGenerate(sermon); }}
                      disabled={generatingId === sermon.id}
                      className="inline-flex items-center gap-1 text-xs bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 disabled:opacity-50 px-2 py-1 rounded-lg transition-colors font-bold border border-indigo-500/20"
                    >
                      <Sparkles className="w-3 h-3" />
                      {generatingId === sermon.id ? '생성중...' : 'AI 생성'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-12 text-center text-slate-500 text-sm font-medium">검색 결과가 없습니다</div>}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((sermon) => (
            <div key={sermon.id} onClick={() => router.push(`/dashboard/sermons/${sermon.id}`)} className="glass-dark rounded-2xl p-4 hover:border-indigo-500/30 cursor-pointer transition-all border border-white/10 group">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-slate-200 truncate group-hover:text-indigo-300 transition-colors">{sermon.title}</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{sermon.normalizedPassage}</p>
                </div>
                <span className="text-xs text-slate-500 shrink-0 font-bold tabular-nums">{sermon.date.replace(/-/g, '.')}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2 line-clamp-2 font-medium">{sermon.coreMessage}</p>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="text-[10px] bg-white/5 text-slate-400 px-1.5 py-0.5 rounded font-bold">{sermon.sermonType}</span>
                <span className="text-[10px] bg-white/5 text-slate-400 px-1.5 py-0.5 rounded font-bold">{sermon.audience}</span>
                {sermon.season && <span className="text-[10px] bg-white/5 text-slate-400 px-1.5 py-0.5 rounded font-bold">{sermon.season}</span>}
                <button
                  onClick={(e) => { e.stopPropagation(); handleGenerate(sermon); }}
                  disabled={generatingId === sermon.id}
                  className="ml-auto inline-flex items-center gap-1 text-[10px] bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 disabled:opacity-50 px-2 py-1 rounded-lg transition-colors font-bold border border-indigo-500/20"
                >
                  <Sparkles className="w-3 h-3" />
                  {generatingId === sermon.id ? '생성중...' : 'AI 생성'}
                </button>
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
    <Suspense fallback={<div className="py-12 text-center text-slate-500 text-sm font-medium">로딩 중...</div>}>
      <SermonsContent />
    </Suspense>
  )
}
