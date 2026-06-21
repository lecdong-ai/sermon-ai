'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { NoteEntry, NoteType } from '@/lib/advanced/notesData'
import { NOTE_TYPE_LABELS, NOTE_TYPE_DOTS, NOTE_TYPE_COLORS } from '@/lib/advanced/notesData'

export type Section = 'intro' | 'main1' | 'main2' | 'main3' | 'conclusion'

export const SECTIONS: Section[] = ['intro', 'main1', 'main2', 'main3', 'conclusion']

export const SECTION_LABELS: Record<Section, string> = {
  intro: '서론',
  main1: '본론 1',
  main2: '본론 2',
  main3: '본론 3',
  conclusion: '결론',
}

export const SECTION_COLORS: Record<Section, { dot: string; bg: string; text: string; border: string }> = {
  intro:      { dot: 'bg-sky-400',     bg: 'bg-sky-500/5',     text: 'text-sky-300',     border: 'border-sky-500/30' },
  main1:      { dot: 'bg-indigo-400',  bg: 'bg-indigo-500/5',  text: 'text-indigo-300',  border: 'border-indigo-500/30' },
  main2:      { dot: 'bg-violet-400',  bg: 'bg-violet-500/5',  text: 'text-violet-300',  border: 'border-violet-500/30' },
  main3:      { dot: 'bg-fuchsia-400', bg: 'bg-fuchsia-500/5', text: 'text-fuchsia-300', border: 'border-fuchsia-500/30' },
  conclusion: { dot: 'bg-emerald-400', bg: 'bg-emerald-500/5', text: 'text-emerald-300', border: 'border-emerald-500/30' },
}

export type LoomState = Record<Section, string[]>

const EMPTY_LOOM: LoomState = { intro: [], main1: [], main2: [], main3: [], conclusion: [] }

interface ProjectItem {
  id: string
  title: string
  passage: string
  coreMessage: string
  status: string
  wordCount: number
  updatedAt: string
}

interface SermonLoomProps {
  initialProjectId?: string
}

export default function SermonLoom({ initialProjectId }: SermonLoomProps) {
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [activeProjectId, setActiveProjectId] = useState<string | null>(initialProjectId || null)
  const [allInsights, setAllInsights] = useState<NoteEntry[]>([])
  const [projectInsights, setProjectInsights] = useState<NoteEntry[]>([])
  const [loom, setLoom] = useState<LoomState>(EMPTY_LOOM)
  const [loading, setLoading] = useState(true)
  const [arranging, setArranging] = useState(false)
  const [reasoning, setReasoning] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [hoverSection, setHoverSection] = useState<Section | null>(null)
  const [basketFilter, setBasketFilter] = useState<'unplaced' | 'all' | 'by-type'>('unplaced')
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  // Load writing projects on mount
  useEffect(() => {
    let ac: AbortController | null = null
    ac = new AbortController()
    fetch('/api/sermons?status=writing,in_progress,prepare,review,research,draft', { signal: ac.signal })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const items: ProjectItem[] = (json.data || []).map((s: any) => ({
            id: s.id,
            title: s.title || '(제목 없음)',
            passage: s.normalizedPassage || s.passage || '',
            coreMessage: s.coreMessage || '',
            status: s.status || 'draft',
            wordCount: s.wordCount || 0,
            updatedAt: s.updatedAt || s.updated_at || '',
          }))
          setProjects(items)
          if (!activeProjectId && items.length > 0) setActiveProjectId(items[0].id)
        }
      })
      .catch(() => {})
    return () => { ac?.abort() }
  }, [])

  // Load all insights once
  useEffect(() => {
    let ac: AbortController | null = null
    ac = new AbortController()
    fetch('/api/insights', { signal: ac.signal })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setAllInsights(json.data || [])
          setLoading(false)
        }
      })
      .catch(() => setLoading(false))
    return () => { ac?.abort() }
  }, [])

  const activeProject = useMemo(() => projects.find((p) => p.id === activeProjectId) || null, [projects, activeProjectId])

  // Filter insights for this project
  useEffect(() => {
    if (!activeProjectId) { setProjectInsights([]); return }
    setProjectInsights(allInsights.filter((n) => (n.projectIds || []).includes(activeProjectId)))
  }, [allInsights, activeProjectId])

  // Load saved loom from localStorage on project change
  useEffect(() => {
    if (!activeProjectId) return
    try {
      const key = `loom_${activeProjectId}`
      const raw = localStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw) as LoomState
        setLoom({ ...EMPTY_LOOM, ...parsed })
        setReasoning('')
      } else {
        setLoom(EMPTY_LOOM)
        setReasoning('')
      }
    } catch {
      setLoom(EMPTY_LOOM)
    }
  }, [activeProjectId])

  // Auto-save loom to localStorage
  useEffect(() => {
    if (!activeProjectId) return
    try {
      localStorage.setItem(`loom_${activeProjectId}`, JSON.stringify(loom))
      setSavedAt(new Date())
    } catch {}
  }, [loom, activeProjectId])

  // Loom insight lookup
  const insightMap = useMemo(() => new Map(allInsights.map((i) => [i.id, i])), [allInsights])

  const placedIds = useMemo(() => {
    const s = new Set<string>()
    SECTIONS.forEach((sec) => loom[sec].forEach((id) => s.add(id)))
    return s
  }, [loom])

  const unplacedInsights = useMemo(() => {
    if (basketFilter === 'all') return projectInsights
    return projectInsights.filter((n) => !placedIds.has(n.id))
  }, [projectInsights, placedIds, basketFilter])

  const handleArrange = useCallback(async () => {
    if (!activeProject || projectInsights.length === 0) return
    setArranging(true)
    setError(null)
    try {
      const res = await fetch('/api/notes/arrange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          insights: projectInsights.map((n) => ({
            id: n.id,
            title: n.title,
            content: n.content,
            summary: n.summary,
            tags: n.tags,
            type: n.type,
          })),
          passage: activeProject.passage,
          sermonTitle: activeProject.title,
          coreMessage: activeProject.coreMessage,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'AI 배치 실패')
      setLoom({ ...EMPTY_LOOM, ...json.arrangement })
      setReasoning(json.reasoning || '')
    } catch (e: any) {
      setError(e?.message || 'AI 배치에 실패했습니다.')
    } finally {
      setArranging(false)
    }
  }, [activeProject, projectInsights])

  // Drag handlers
  const onDragStart = (e: React.DragEvent, insightId: string) => {
    e.dataTransfer.setData('text/loom-insight', insightId)
    e.dataTransfer.effectAllowed = 'move'
    setDraggingId(insightId)
  }
  const onDragEnd = () => { setDraggingId(null); setHoverSection(null) }
  const onDragOver = (e: React.DragEvent, sec: Section) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setHoverSection(sec)
  }
  const onDrop = (e: React.DragEvent, targetSection: Section) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/loom-insight')
    if (!id) return
    setLoom((prev) => {
      const next: LoomState = { intro: [], main1: [], main2: [], main3: [], conclusion: [] }
      for (const sec of SECTIONS) {
        next[sec] = prev[sec].filter((x) => x !== id)
      }
      next[targetSection] = [...prev[targetSection], id]
      return next
    })
    setDraggingId(null)
    setHoverSection(null)
  }

  const removeFromLoom = (id: string) => {
    setLoom((prev) => {
      const next: LoomState = { intro: [], main1: [], main2: [], main3: [], conclusion: [] }
      for (const sec of SECTIONS) {
        next[sec] = prev[sec].filter((x) => x !== id)
      }
      return next
    })
  }

  const totalPlaced = placedIds.size
  const totalInsights = projectInsights.length

  return (
    <div className="flex flex-col h-full bg-[#04060f]">
      <TopBar
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={setActiveProjectId}
        savedAt={savedAt}
        arranging={arranging}
        onArrange={handleArrange}
        insightCount={totalInsights}
        placedCount={totalPlaced}
        loading={loading}
        onOpenOriginal={() => activeProjectId && router.push(`/advanced/projects/${activeProjectId}?tab=manuscript`)}
      />

      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20 text-[11px] text-red-300 flex items-center justify-between">
          <span>⚠ {error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">✕</button>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-3 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin" />
            <p className="text-xs text-slate-500 font-medium">통찰을 불러오는 중...</p>
          </div>
        </div>
      ) : !activeProject ? (
        <EmptyWorkbench projects={projects} onSelect={setActiveProjectId} onCreateNew={() => router.push('/advanced/projects/new')} />
      ) : totalInsights === 0 ? (
        <EmptyProject project={activeProject} onRecordInsight={() => router.push('/advanced/notes')} />
      ) : (
        <div className="flex-1 flex min-h-0">
          <BasketPanel
            insights={unplacedInsights}
            allInsights={projectInsights}
            placedIds={placedIds}
            filter={basketFilter}
            setFilter={setBasketFilter}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            draggingId={draggingId}
            onOpenInsight={(id) => router.push(`/advanced/notes?selected=${id}`)}
            onRemoveFromLoom={removeFromLoom}
            loom={loom}
            insightMap={insightMap}
          />

          <LoomCanvas
            loom={loom}
            insightMap={insightMap}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            hoverSection={hoverSection}
            draggingId={draggingId}
            onRemoveInsight={removeFromLoom}
            onOpenInsight={(id) => router.push(`/advanced/notes?selected=${id}`)}
          />

          <HealthPanel
            loom={loom}
            insightMap={insightMap}
            reasoning={reasoning}
            totalInsights={totalInsights}
            placedCount={totalPlaced}
          />
        </div>
      )}

      {projects.length > 0 && !loading && (
        <WorkbenchStrip
          projects={projects}
          activeProjectId={activeProjectId}
          onSelect={setActiveProjectId}
          loomTotalsByProject={projects.reduce((acc, p) => {
            try {
              const raw = localStorage.getItem(`loom_${p.id}`)
              if (raw) {
                const parsed = JSON.parse(raw) as LoomState
                acc[p.id] = SECTIONS.reduce((sum, sec) => sum + parsed[sec].length, 0)
              }
            } catch {}
            return acc
          }, {} as Record<string, number>)}
        />
      )}
    </div>
  )
}

/* ─── Top Bar ─── */

function TopBar({ projects, activeProjectId, onSelectProject, savedAt, arranging, onArrange, insightCount, placedCount, loading, onOpenOriginal }: {
  projects: ProjectItem[]
  activeProjectId: string | null
  onSelectProject: (id: string) => void
  savedAt: Date | null
  arranging: boolean
  onArrange: () => void
  insightCount: number
  placedCount: number
  loading: boolean
  onOpenOriginal: () => void
}) {
  const active = projects.find((p) => p.id === activeProjectId)
  return (
      <div className="shrink-0 border-b border-white/5 bg-[#04060f]/80 backdrop-blur-md">
      <div className="px-5 py-3 flex items-center gap-3">
        <div className="shrink-0">
          <h1 className="text-base font-bold text-white flex items-center gap-1.5">
            <span className="text-indigo-300">🧵</span> 설교 휘장
            <span className="text-[9px] text-slate-600 font-medium ml-1 normal-case tracking-normal">출 26:31</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-medium">통찰이라는 실이 설교라는 휘장으로 짜여지는 곳</p>
        </div>

        {projects.length > 0 && (
          <select
            value={activeProjectId || ''}
            onChange={(e) => onSelectProject(e.target.value)}
            className="text-xs font-bold bg-[#0c1020] border border-white/10 rounded-xl px-2.5 py-2 text-slate-200 outline-none focus:border-indigo-500/50 max-w-[260px]"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} {p.passage && `· ${p.passage}`}
              </option>
            ))}
          </select>
        )}

        {active && (
          <div className="hidden md:flex items-center gap-1.5 text-[10px]">
            <span className="text-slate-500">연결된 통찰</span>
            <span className="text-indigo-300 font-bold tabular-nums">{insightCount}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">배치</span>
            <span className="text-emerald-300 font-bold tabular-nums">{placedCount}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 tabular-nums">{insightCount}</span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {savedAt && !arranging && !loading && activeProjectId && (
            <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
              자동저장 · 방금 전
            </span>
          )}
          {activeProjectId && (
            <>
              <button
                onClick={onArrange}
                disabled={arranging || insightCount === 0}
                className="text-[11px] font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1.5 rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-30 flex items-center gap-1.5"
              >
                {arranging ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    AI 배치 중
                  </>
                ) : (
                  <>🤖 AI 자동 배치</>
                )}
              </button>
              <button
                onClick={onOpenOriginal}
                className="text-[11px] font-bold text-slate-300 border border-white/10 rounded-lg px-2.5 py-1.5 hover:bg-white/5 transition-colors"
              >
                원고 작성 →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Basket (Left) ─── */

function BasketPanel({ insights, allInsights, placedIds, filter, setFilter, onDragStart, onDragEnd, draggingId, onOpenInsight, onRemoveFromLoom, loom, insightMap }: {
  insights: NoteEntry[]
  allInsights: NoteEntry[]
  placedIds: Set<string>
  filter: 'unplaced' | 'all' | 'by-type'
  setFilter: (f: 'unplaced' | 'all' | 'by-type') => void
  onDragStart: (e: React.DragEvent, id: string) => void
  onDragEnd: () => void
  draggingId: string | null
  onOpenInsight: (id: string) => void
  onRemoveFromLoom: (id: string) => void
  loom: LoomState
  insightMap: Map<string, NoteEntry>
}) {
  return (
    <aside className="w-72 shrink-0 border-r border-white/5 bg-[#04060f]/60 flex flex-col">
      <div className="px-3 py-3 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">🧺 통찰 보따리</span>
          <span className="text-[9px] text-slate-500 font-bold">{allInsights.length - placedIds.size}개 미배치</span>
        </div>
        <div className="flex gap-1">
          <FilterBtn active={filter === 'unplaced'} onClick={() => setFilter('unplaced')}>미배치</FilterBtn>
          <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')}>전체</FilterBtn>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1.5">
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[11px] text-slate-500">
              {filter === 'unplaced' ? '🎉 모든 통찰이 배치되었습니다' : '통찰이 없습니다'}
            </p>
          </div>
        ) : (
          insights.map((n) => (
            <InsightBasketCard
              key={n.id}
              insight={n}
              isDragging={draggingId === n.id}
              onDragStart={(e) => onDragStart(e, n.id)}
              onDragEnd={onDragEnd}
              onOpen={() => onOpenInsight(n.id)}
            />
          ))
        )}
      </div>
      {Object.values(loom).flat().length > 0 && (
        <div className="border-t border-white/5 p-2 max-h-[160px] overflow-y-auto scrollbar-thin">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-1.5">✓ 배치된 통찰</span>
          <div className="space-y-1">
            {SECTIONS.flatMap((sec) => loom[sec].map((id) => {
              const n = insightMap.get(id)
              if (!n) return null
              const c = SECTION_COLORS[sec]
              return (
                <div key={id} className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${c.bg} border ${c.border}`}>
                  <span className={`w-1 h-1 rounded-full shrink-0 ${c.dot}`} />
                  <span className="text-[10px] text-slate-300 truncate flex-1 font-medium">{n.title}</span>
                  <button onClick={() => onRemoveFromLoom(id)} className="text-slate-500 hover:text-red-400 text-[10px]">✕</button>
                </div>
              )
            }))}
          </div>
        </div>
      )}
    </aside>
  )
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${
        active ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-500 hover:text-slate-300 border border-transparent'
      }`}
    >
      {children}
    </button>
  )
}

function InsightBasketCard({ insight, isDragging, onDragStart, onDragEnd, onOpen }: {
  insight: NoteEntry
  isDragging: boolean
  onDragStart: (e: React.DragEvent) => void
  onDragEnd: () => void
  onOpen: () => void
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      className={`group rounded-xl border p-2.5 cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? 'opacity-30 scale-95' : 'border-white/5 bg-[#0c1020]/60 hover:border-indigo-500/30 hover:bg-[#0c1020]'
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${NOTE_TYPE_DOTS[insight.type]}`} />
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{NOTE_TYPE_LABELS[insight.type]}</span>
        {insight.starred && <span className="text-[9px] text-amber-400">★</span>}
      </div>
      <p className="text-[11px] font-bold text-slate-200 leading-snug line-clamp-2 mb-1 group-hover:text-indigo-300 transition-colors">{insight.title}</p>
      <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2 font-medium">{insight.summary || insight.content.slice(0, 80)}</p>
      {insight.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {insight.tags.slice(0, 3).map((t) => (
            <span key={t} className="text-[8px] text-slate-600 font-bold">#{t}</span>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Loom Canvas (Center) ─── */

function LoomCanvas({ loom, insightMap, onDragOver, onDrop, onDragEnd, hoverSection, draggingId, onRemoveInsight, onOpenInsight }: {
  loom: LoomState
  insightMap: Map<string, NoteEntry>
  onDragOver: (e: React.DragEvent, sec: Section) => void
  onDrop: (e: React.DragEvent, sec: Section) => void
  onDragEnd: () => void
  hoverSection: Section | null
  draggingId: string | null
  onRemoveInsight: (id: string) => void
  onOpenInsight: (id: string) => void
}) {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="max-w-3xl mx-auto p-6 space-y-3">
        <div className="text-center pb-2">
          <p className="text-[10px] text-slate-500 font-medium">통찰을 끌어다 놓아 설교의 뼈대를 직조하세요</p>
        </div>
        {SECTIONS.map((sec, idx) => (
          <LoomSection
            key={sec}
            section={sec}
            index={idx}
            insights={loom[sec].map((id) => insightMap.get(id)).filter(Boolean) as NoteEntry[]}
            isHover={hoverSection === sec}
            isDragging={!!draggingId}
            onDragOver={(e) => onDragOver(e, sec)}
            onDrop={(e) => onDrop(e, sec)}
            onDragEnd={onDragEnd}
            onRemove={onRemoveInsight}
            onOpen={onOpenInsight}
          />
        ))}
      </div>
    </div>
  )
}

function LoomSection({ section, index, insights, isHover, isDragging, onDragOver, onDrop, onDragEnd, onRemove, onOpen }: {
  section: Section
  index: number
  insights: NoteEntry[]
  isHover: boolean
  isDragging: boolean
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onDragEnd: () => void
  onRemove: (id: string) => void
  onOpen: (id: string) => void
}) {
  const c = SECTION_COLORS[section]
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`w-2 h-2 rounded-full ${c.dot}`} />
        <span className={`text-[11px] font-bold ${c.text} uppercase tracking-wider`}>{SECTION_LABELS[section]}</span>
        <span className="text-[10px] text-slate-500 font-bold">{insights.length}개</span>
        <div className="flex-1 h-px bg-gradient-to-r from-white/5 to-transparent" />
      </div>
      <div
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
        className={`min-h-[60px] rounded-2xl border-2 border-dashed p-2.5 transition-all ${
          isHover
            ? `${c.border} ${c.bg} scale-[1.01]`
            : isDragging
              ? `border-white/10 ${c.bg}`
              : 'border-white/5 bg-[#04060f]/30'
        }`}
      >
        {insights.length === 0 ? (
          <div className="flex items-center justify-center py-3 text-[10px] text-slate-600 font-medium">
            {isDragging ? '↓ 여기에 놓기' : '통찰을 끌어다 놓으세요'}
          </div>
        ) : (
          <div className="space-y-1.5">
            {insights.map((n) => (
              <PlacedInsightCard
                key={n.id}
                insight={n}
                section={section}
                onRemove={() => onRemove(n.id)}
                onOpen={() => onOpen(n.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PlacedInsightCard({ insight, section, onRemove, onOpen }: {
  insight: NoteEntry
  section: Section
  onRemove: () => void
  onOpen: () => void
}) {
  const c = SECTION_COLORS[section]
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/loom-insight', insight.id)}
      onClick={onOpen}
      className={`group flex items-start gap-2 rounded-lg border ${c.border} ${c.bg} px-3 py-2 cursor-pointer hover:brightness-125 transition-all`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${c.dot}`} />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-slate-100 leading-snug line-clamp-1">{insight.title}</p>
        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 font-medium">{insight.summary || insight.content.slice(0, 60)}</p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove() }}
        className="text-slate-500 hover:text-red-400 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        title="제거"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

/* ─── Health Panel (Right) ─── */

function HealthPanel({ loom, insightMap, reasoning, totalInsights, placedCount }: {
  loom: LoomState
  insightMap: Map<string, NoteEntry>
  reasoning: string
  totalInsights: number
  placedCount: number
}) {
  const health = useMemo(() => {
    const total = totalInsights
    const sectionScores: Record<Section, number> = { intro: 0, main1: 0, main2: 0, main3: 0, conclusion: 0 }
    let weighted = 0
    const weights: Record<Section, number> = { intro: 1.2, main1: 1, main2: 1, main3: 1, conclusion: 1.2 }

    if (total === 0) {
      return { sectionScores, overall: 0, warnings: [] as string[], strengths: [] as string[] }
    }

    SECTIONS.forEach((sec) => {
      const count = loom[sec].length
      const target = total / 5
      const score = target > 0 ? Math.min(100, Math.round((count / target) * 100)) : 0
      sectionScores[sec] = count > 0 ? Math.max(40, score) : 0
      weighted += sectionScores[sec] * weights[sec]
    })

    const wSum = Object.values(weights).reduce((a, b) => a + b, 0)
    const overall = Math.round(weighted / wSum)

    const warnings: string[] = []
    const strengths: string[] = []
    if (loom.intro.length === 0 && total > 0) warnings.push('서론이 비어 있어요')
    if (loom.conclusion.length === 0 && total > 0) warnings.push('결론이 비어 있어요')
    if (loom.main1.length === 0 && loom.main2.length === 0 && loom.main3.length === 0 && total > 2) warnings.push('본론 전체가 비어 있어요')
    if (loom.main1.length + loom.main2.length + loom.main3.length > total * 0.6) warnings.push('본론에 너무 몰려 있어요')
    if (loom.intro.length > 0 && loom.intro.length <= 2) strengths.push('서론이 간결해요')
    if (loom.conclusion.length > 0) strengths.push('결론이 준비됐어요')
    if (loom.main2.length > 0 && loom.main2.length <= Math.ceil(total / 3)) strengths.push('본론 2 균형 좋아요')

    return { sectionScores, overall, warnings, strengths }
  }, [loom, totalInsights])

  return (
    <aside className="w-72 shrink-0 border-l border-white/5 bg-[#04060f]/60 flex flex-col">
      <div className="px-4 py-3 border-b border-white/5">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">🩺 설교 건강도</h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="text-center">
          <div className={`text-3xl font-bold tabular-nums ${
            health.overall >= 80 ? 'text-emerald-400' : health.overall >= 50 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {health.overall}
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">전체 균형 점수</p>
          <p className="text-[10px] text-slate-600 font-medium mt-0.5">{placedCount} / {totalInsights} 배치됨</p>
        </div>

        <div className="space-y-2">
          {SECTIONS.map((sec) => {
            const score = health.sectionScores[sec]
            const c = SECTION_COLORS[sec]
            return (
              <div key={sec}>
                <div className="flex items-center justify-between text-[10px] mb-0.5">
                  <span className={`font-bold ${c.text}`}>{SECTION_LABELS[sec]}</span>
                  <span className="text-slate-500 font-bold tabular-nums">{score}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${c.dot}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {health.warnings.length > 0 && (
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">⚠ 약한 부분</p>
            <ul className="space-y-1">
              {health.warnings.map((w, i) => (
                <li key={i} className="text-[11px] text-amber-300 flex items-start gap-1">
                  <span className="text-amber-500 shrink-0">·</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {health.strengths.length > 0 && (
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">✓ 강점</p>
            <ul className="space-y-1">
              {health.strengths.map((s, i) => (
                <li key={i} className="text-[11px] text-emerald-300 flex items-start gap-1">
                  <span className="text-emerald-500 shrink-0">·</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {reasoning && (
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">🤖 AI 배치 이유</p>
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium bg-white/5 rounded-lg p-2.5 border border-white/5">{reasoning}</p>
          </div>
        )}
      </div>
    </aside>
  )
}

/* ─── Workbench Strip (Bottom) ─── */

function WorkbenchStrip({ projects, activeProjectId, onSelect, loomTotalsByProject }: {
  projects: ProjectItem[]
  activeProjectId: string | null
  onSelect: (id: string) => void
  loomTotalsByProject: Record<string, number>
}) {
  return (
    <div className="shrink-0 border-t border-white/5 bg-[#04060f]/80 backdrop-blur-md">
      <div className="px-4 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-thin">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0">📚 다른 작성 중 설교</span>
        <div className="flex gap-2">
          {projects.slice(0, 8).map((p) => {
            const isActive = p.id === activeProjectId
            const total = loomTotalsByProject[p.id] || 0
            return (
              <button
                key={p.id}
                onClick={() => onSelect(p.id)}
                className={`shrink-0 text-left px-3 py-1.5 rounded-xl border transition-colors ${
                  isActive
                    ? 'border-indigo-500/40 bg-indigo-500/10'
                    : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10'
                }`}
              >
                <p className={`text-[11px] font-bold truncate max-w-[200px] ${isActive ? 'text-indigo-200' : 'text-slate-300'}`}>
                  {p.title}
                </p>
                <p className="text-[9px] text-slate-500 font-medium">
                  {p.passage || '본문 미설정'} {total > 0 && `· 배치 ${total}개`}
                </p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ─── Empty States ─── */

function EmptyWorkbench({ projects, onSelect, onCreateNew }: { projects: ProjectItem[]; onSelect: (id: string) => void; onCreateNew: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center px-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
          <span className="text-2xl">🧵</span>
        </div>
        <h3 className="text-base font-bold text-white mb-1">작성 중인 설교가 없습니다</h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-4">
          {projects.length === 0
            ? '먼저 설교 프로젝트를 만들고 작성 단계로 진행하세요.'
            : '직조할 작성 중 설교가 없어요.'}
        </p>
        <button
          onClick={onCreateNew}
          className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
        >
          + 새 설교 프로젝트 만들기
        </button>
      </div>
    </div>
  )
}

function EmptyProject({ project, onRecordInsight }: { project: ProjectItem; onRecordInsight: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center px-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-sky-500/20 border border-white/10 flex items-center justify-center">
          <span className="text-2xl">🧺</span>
        </div>
        <h3 className="text-base font-bold text-white mb-1">&ldquo;{project.title}&rdquo;에 연결된 통찰이 없습니다</h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-1">
          {project.passage && <span className="text-teal-300 font-bold">{project.passage}</span>}
          {project.passage && ' · '}
          통찰을 기록하고 이 설교와 연결하면 직조할 수 있어요.
        </p>
        <p className="text-[10px] text-slate-600 font-medium mb-4">통찰 페이지에서 + 연결 버튼으로 이 설교에 이어보세요</p>
        <button
          onClick={onRecordInsight}
          className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
        >
          ✦ 통찰 페이지로 이동
        </button>
      </div>
    </div>
  )
}
