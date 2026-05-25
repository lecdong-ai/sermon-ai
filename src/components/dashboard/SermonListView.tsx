'use client'

import { useMemo, useState } from 'react'
import { SERMONS } from '@/data/sampleSermons'
import { Search, Plus, ArrowUpDown, FileText, Calendar, ChevronRight, LayoutGrid, List, MessageSquare } from 'lucide-react'

interface SermonListViewProps {
  onSelect: (id: string) => void
  onCreate: () => void
}

export default function SermonListView({ onSelect, onCreate }: SermonListViewProps) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<'date' | 'title'>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')

  const filtered = useMemo(() => {
    let list = [...SERMONS]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((s) =>
        s.title.toLowerCase().includes(q) ||
        s.normalizedPassage.toLowerCase().includes(q) ||
        s.preacher.toLowerCase().includes(q) ||
        s.sermonType.toLowerCase().includes(q)
      )
    }
    list.sort((a, b) => {
      const cmp = sortKey === 'date' ? a.date.localeCompare(b.date) : a.title.localeCompare(b.title)
      return sortDir === 'desc' ? -cmp : cmp
    })
    return list
  }, [search, sortKey, sortDir])

  const toggleSort = (key: 'date' | 'title') => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="px-6 py-4 border-b border-slate-200/30 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold text-slate-800">설교 목록</h1>
            <p className="text-xs text-slate-400 mt-0.5">총 {filtered.length}개의 설교</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('card')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                  viewMode === 'card' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                카드
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                  viewMode === 'list' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <List className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                리스트
              </button>
            </div>
            <button
              onClick={onCreate}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> 새 설교
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="제목, 본문, 설교자 검색..."
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-white/60 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200/50 focus:border-indigo-300 text-slate-700 placeholder-slate-400 transition-all"
            />
          </div>
          <button
            onClick={() => toggleSort('date')}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              sortKey === 'date' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> 날짜 <ArrowUpDown className="w-3 h-3" />
          </button>
          <button
            onClick={() => toggleSort('title')}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              sortKey === 'title' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> 제목 <ArrowUpDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* content */}
      <div className="flex-1 overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(100vh - 12.5rem)' }}>
        {viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelect(s.id)}
                className="group text-left bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-700 text-sm group-hover:text-indigo-600 transition-colors truncate">{s.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{s.normalizedPassage}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 flex-shrink-0 mt-0.5 transition-colors" />
                </div>
                <div className="flex items-center gap-3 mt-2.5 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-300" />
                    {s.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-slate-300" />
                    {s.preacher}
                  </span>
                  <span className="ml-auto px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-medium">{s.sermonType}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold tracking-wide uppercase text-slate-400">제목</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold tracking-wide uppercase text-slate-400 hidden md:table-cell">본문</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold tracking-wide uppercase text-slate-400 hidden sm:table-cell">날짜</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold tracking-wide uppercase text-slate-400">유형</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold tracking-wide uppercase text-slate-400 hidden lg:table-cell">설교자</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => onSelect(s.id)}
                    className="border-b border-slate-50 hover:bg-indigo-50/30 cursor-pointer transition-colors last:border-b-0"
                  >
                    <td className="px-4 py-3.5 font-medium text-slate-700">{s.title}</td>
                    <td className="px-4 py-3.5 text-slate-400 hidden md:table-cell">{s.normalizedPassage}</td>
                    <td className="px-4 py-3.5 text-slate-400 hidden sm:table-cell">{s.date}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 text-[11px] rounded-full bg-indigo-50 text-indigo-600 font-medium">{s.sermonType}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 hidden lg:table-cell">{s.preacher}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <FileText className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">검색 결과가 없습니다</p>
            <p className="text-xs mt-1">다른 검색어로 시도해보세요</p>
          </div>
        )}
      </div>
    </div>
  )
}
