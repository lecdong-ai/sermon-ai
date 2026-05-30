'use client'

import { Suspense, useState, useMemo } from 'react'
import { useApp } from '@/lib/dashboard/store'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { buildGraphData } from '@/lib/dashboard/graphUtils'
import { GraphNode } from '@/lib/dashboard/types'
import { BIBLE_BOOKS, SEASONS, AUDIENCES } from '@/lib/dashboard/constants'

const GraphCanvas = dynamic(() => import('@/components/dashboard/GraphCanvas'), { ssr: false })

type GraphViewMode = 'full' | 'sermon-centric' | 'theme-centric' | 'theme' | 'book'

function GraphContent() {
  const { state } = useApp()
  const searchParams = useSearchParams()
  const router = useRouter()
  const focusId = searchParams.get('focus')

  const [viewMode, setViewMode] = useState<GraphViewMode>(focusId ? 'sermon-centric' : 'full')
  const [filterBook, setFilterBook] = useState('')
  const [filterSeason, setFilterSeason] = useState('')
  const [filterAudience, setFilterAudience] = useState('')
  const [searchHighlight, setSearchHighlight] = useState('')

  const graphData = useMemo(() => {
    return buildGraphData(state.sermons, state.themes, state.series, {
      seasons: filterSeason ? [filterSeason] : undefined,
      audiences: filterAudience ? [filterAudience] : undefined,
    })
  }, [state.sermons, state.themes, state.series, filterSeason, filterAudience])

  const handleNodeClick = (node: GraphNode) => {
    // Panel handles navigation
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold">그래프</h2>
          <p className="text-sm text-muted mt-0.5">설교와 본문, 주제, 절기, 회중, 시리즈의 연결 구조</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 shrink-0 flex-wrap">
        <button onClick={() => setViewMode('full')} className={`text-xs px-3 py-1.5 rounded-md transition-colors ${viewMode === 'full' ? 'bg-primary text-white' : 'bg-surface border border-border text-muted hover:text-foreground'}`}>전체 그래프</button>
        <button onClick={() => setViewMode('sermon-centric')} className={`text-xs px-3 py-1.5 rounded-md transition-colors ${viewMode === 'sermon-centric' ? 'bg-primary text-white' : 'bg-surface border border-border text-muted hover:text-foreground'}`}>설교 중심</button>
        <button onClick={() => setViewMode('theme-centric')} className={`text-xs px-3 py-1.5 rounded-md transition-colors ${viewMode === 'theme-centric' ? 'bg-primary text-white' : 'bg-surface border border-border text-muted hover:text-foreground'}`}>주제 중심</button>
        <div className="w-px h-5 bg-border mx-1" />
        <select value={filterBook} onChange={(e) => setFilterBook(e.target.value)} className="text-xs border border-border rounded px-2 py-1.5 bg-surface focus:outline-none text-muted">
          <option value="">모든 성경책</option>
          {BIBLE_BOOKS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={filterSeason} onChange={(e) => setFilterSeason(e.target.value)} className="text-xs border border-border rounded px-2 py-1.5 bg-surface focus:outline-none text-muted">
          <option value="">모든 절기</option>
          {SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterAudience} onChange={(e) => setFilterAudience(e.target.value)} className="text-xs border border-border rounded px-2 py-1.5 bg-surface focus:outline-none text-muted">
          <option value="">모든 회중</option>
          {AUDIENCES.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <div className="relative flex-1 max-w-xs ml-auto">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-xs">⌕</span>
          <input type="text" value={searchHighlight} onChange={(e) => setSearchHighlight(e.target.value)} placeholder="그래프 내 검색..." className="w-full pl-7 pr-3 py-1.5 text-xs border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light" />
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <GraphCanvas data={graphData} focusNodeId={focusId || undefined} onNodeClick={handleNodeClick} sermonCentric={viewMode === 'sermon-centric'} themeCentric={viewMode === 'theme-centric'} />
      </div>
    </div>
  )
}

export default function GraphPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-muted text-sm">로딩 중...</div>}>
      <GraphContent />
    </Suspense>
  )
}
