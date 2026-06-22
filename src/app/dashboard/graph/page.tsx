'use client'

import { Suspense, useState, useMemo, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useApp } from '@/lib/dashboard/store'
import { useSearchParams, useRouter } from 'next/navigation'
import { buildGraphData } from '@/lib/dashboard/graphUtils'
import { GraphNode } from '@/lib/dashboard/types'
import { BIBLE_BOOKS, SEASONS, AUDIENCES, ALL_THEMES } from '@/lib/dashboard/constants'
import { Loader2, Sparkles } from 'lucide-react'

const GraphCanvas = dynamic(() => import('@/components/dashboard/GraphCanvas'), { ssr: false, loading: () => <div className="flex items-center justify-center h-[600px] text-slate-500 text-sm">그래프 로딩 중...</div> })

type GraphViewMode = 'full' | 'sermon-centric' | 'theme-centric' | 'theme' | 'book'

function GraphContent() {
  const { state } = useApp()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const focusId = searchParams.get('focus') || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('focus') : null)

  const [viewMode, setViewMode] = useState<GraphViewMode>(focusId ? 'sermon-centric' : 'full')
  const [filterBook, setFilterBook] = useState('')
  const [filterSeason, setFilterSeason] = useState('')
  const [filterAudience, setFilterAudience] = useState('')
  const [showDrafts, setShowDrafts] = useState(false)
  useEffect(() => {
    setViewMode(focusId ? 'sermon-centric' : 'full')
  }, [focusId])

  const visibleSermons = useMemo(() => {
    const filtered = showDrafts ? state.sermons : state.sermons.filter(s => s.status !== 'draft')
    const map = new Map<string, typeof state.sermons[0]>()
    for (const s of filtered) {
      const key = s.title.trim().toLowerCase()
      if (!map.has(key) || new Date(s.updatedAt) > new Date(map.get(key)!.updatedAt)) {
        map.set(key, s)
      }
    }
    return Array.from(map.values())
  }, [state.sermons, showDrafts])

  const draftCount = useMemo(() =>
    state.sermons.filter(s => s.status === 'draft').length,
  [state.sermons])

  const graphData = useMemo(() => {
    return buildGraphData(visibleSermons, state.themes, state.series, {
      seasons: filterSeason ? [filterSeason] : undefined,
      audiences: filterAudience ? [filterAudience] : undefined,
      book: filterBook || undefined,
    })
  }, [visibleSermons, state.themes, state.series, filterSeason, filterAudience, filterBook])

  const unanalyzedCount = useMemo(() =>
    state.sermons.filter(s => !s.themeIds?.length && (s.manuscript || s.coreMessage)).length,
  [state.sermons])

  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeProgress, setAnalyzeProgress] = useState('')

  const handleBatchAnalyze = useCallback(async () => {
    const targets = state.sermons.filter(s =>
      !s.themeIds?.length && (s.manuscript || s.coreMessage)
    )
    if (!targets.length) return
    setAnalyzing(true)
    let done = 0
    for (const sermon of targets) {
      setAnalyzeProgress(`${done + 1}/${targets.length}: ${sermon.title || sermon.id.slice(0, 8)}`)
      try {
        const res = await fetch('/api/analyze-tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            manuscript: sermon.manuscript,
            coreMessage: sermon.coreMessage,
            title: sermon.title,
            passage: sermon.normalizedPassage,
            allThemes: ALL_THEMES.map(t => ({ id: t.id, name: t.name, category: t.category })),
          }),
        })
        const json = await res.json()
        if (json.success && json.tags?.length) {
          await fetch(`/api/sermons/${sermon.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ themeIds: json.tags }),
          })
        }
      } catch (e) {
        console.error(`[BatchAnalyze] ${sermon.id} failed:`, e)
      }
      done++
    }
    setAnalyzeProgress('')
    setAnalyzing(false)
    window.location.reload()
  }, [state.sermons])

  const handleNodeClick = (node: GraphNode) => {
    // Panel handles navigation
  }

  if (state.loading || state.sermons.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-400 text-sm">데이터를 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold">그래프</h2>
          <p className="text-sm text-slate-400 mt-0.5">설교와 본문, 주제, 절기, 회중, 시리즈의 연결 구조</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 shrink-0 flex-wrap">
        <button onClick={() => setViewMode('full')} className={`text-xs px-3 py-1.5 rounded-md transition-colors ${viewMode === 'full' ? 'bg-indigo-600 text-white' : 'bg-white/[0.03] border border-white/10 text-slate-400 hover:text-white'}`}>전체 그래프</button>
        <button onClick={() => setViewMode('sermon-centric')} className={`text-xs px-3 py-1.5 rounded-md transition-colors ${viewMode === 'sermon-centric' ? 'bg-indigo-600 text-white' : 'bg-white/[0.03] border border-white/10 text-slate-400 hover:text-white'}`}>설교 중심</button>
        <button onClick={() => setViewMode('theme-centric')} className={`text-xs px-3 py-1.5 rounded-md transition-colors ${viewMode === 'theme-centric' ? 'bg-indigo-600 text-white' : 'bg-white/[0.03] border border-white/10 text-slate-400 hover:text-white'}`}>주제 중심</button>
        <div className="w-px h-5 bg-white/10 mx-1" />
        <select value={filterBook} onChange={(e) => setFilterBook(e.target.value)} className="text-xs border border-white/10 rounded px-2 py-1.5 bg-white/[0.03] focus:outline-none text-slate-400">
          <option value="">모든 성경책</option>
          {BIBLE_BOOKS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={filterSeason} onChange={(e) => setFilterSeason(e.target.value)} className="text-xs border border-white/10 rounded px-2 py-1.5 bg-white/[0.03] focus:outline-none text-slate-400">
          <option value="">모든 절기</option>
          {SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterAudience} onChange={(e) => setFilterAudience(e.target.value)} className="text-xs border border-white/10 rounded px-2 py-1.5 bg-white/[0.03] focus:outline-none text-slate-400">
          <option value="">모든 회중</option>
          {AUDIENCES.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <div className="w-px h-5 bg-white/10 mx-1" />
        {draftCount > 0 && (
          <button onClick={() => setShowDrafts(p => !p)}
            className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${showDrafts ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' : 'bg-white border-white/10 text-slate-400 hover:text-white'}`}>
            {showDrafts ? '✓ 임시 저장 표시' : `임시 저장 ${draftCount}개 숨김`}
          </button>
        )}
        <div className="w-px h-5 bg-white/10 mx-1" />
        {unanalyzedCount > 0 && !analyzing && (
          <button type="button" onClick={handleBatchAnalyze}
            className="text-xs px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-colors flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> AI 주제 분석 ({unanalyzedCount})
          </button>
        )}
        {analyzing && (
          <div className="flex items-center gap-2 text-xs text-amber-300">
            <Loader2 className="w-3 h-3 animate-spin" />
            {analyzeProgress || '분석 중...'}
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0">
        {mounted && <GraphCanvas data={graphData} focusNodeId={focusId || undefined} onNodeClick={handleNodeClick} sermonCentric={viewMode === 'sermon-centric'} themeCentric={viewMode === 'theme-centric'} />}
      </div>
    </div>
  )
}

export default function GraphPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-slate-400 text-sm">로딩 중...</div>}>
      <GraphContent />
    </Suspense>
  )
}
