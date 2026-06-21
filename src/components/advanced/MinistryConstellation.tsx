'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  forceSimulation, forceManyBody, forceLink, forceCenter, forceCollide,
  type Simulation,
} from 'd3-force'
import { getCustomProjects } from '@/lib/advanced/mockData'
import { getStorageItem } from '@/lib/storage'

interface GraphNode {
  id: string
  label: string
  type: string
  subtitle?: string
  detail?: string
  size?: number
  updatedAt?: string
  sermonCount?: number
}

interface GraphEdge {
  source: string
  target: string
  label?: string
  weight?: number
}

interface SimNode {
  id: string
  label: string
  type: string
  subtitle: string
  updatedAt: string
  refValue: string
  r: number
  recency: number
  x?: number
  y?: number
  vx?: number
  vy?: number
  fx?: number | null
  fy?: number | null
}

const TYPE_COLOR: Record<string, string> = {
  sermon: '#10B981',
  passage: '#F59E0B',
  theme: '#8B5CF6',
  word: '#3B82F6',
  note: '#F43F5E',
  series: '#06B6D4',
}

const TYPE_LABEL: Record<string, string> = {
  sermon: '설교',
  passage: '본문',
  theme: '주제',
  word: '원어',
  note: '통찰',
  series: '시리즈',
}

interface MinistryConstellationProps {
  onSelectNode?: (searchTerm: string) => void
  height?: number
}

export default function MinistryConstellation({ onSelectNode, height = 340 }: MinistryConstellationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const simRef = useRef<Simulation<SimNode, undefined> | null>(null)
  const nodesRef = useRef<SimNode[]>([])
  const edgesRef = useRef<{ source: string; target: string; weight: number }[]>([])
  const nodeMapRef = useRef<Map<string, SimNode>>(new Map())
  const animRef = useRef<number>(0)
  const sizeRef = useRef({ w: 800, h: height })

  const [allNodes, setAllNodes] = useState<GraphNode[]>([])
  const [allEdges, setAllEdges] = useState<GraphEdge[]>([])
  const [loading, setLoading] = useState(true)
  const [size, setSize] = useState({ w: 800, h: height })
  const [, setTick] = useState(0)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: SimNode } | null>(null)

  // Time scrub: 0 = oldest, 100 = today
  const [timePos, setTimePos] = useState(100)
  const dateRange = useMemo(() => {
    if (allNodes.length === 0) return null
    const dates = allNodes.map((n) => new Date(n.updatedAt || 0).getTime()).filter((d) => d > 0)
    if (dates.length === 0) return null
    return { min: Math.min(...dates), max: Math.max(...dates) }
  }, [allNodes])

  // Resize observer
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect()
      const w = rect.width, h = rect.height
      if (sizeRef.current.w !== w || sizeRef.current.h !== h) {
        sizeRef.current = { w, h }
        setSize({ w, h })
      }
    })
    ro.observe(el)
    const rect = el.getBoundingClientRect()
    sizeRef.current = { w: rect.width, h: rect.height }
    setSize({ w: rect.width, h: rect.height })
    return () => ro.disconnect()
  }, [])

  // Fetch graph data
  useEffect(() => {
    let ac: AbortController | null = null
    ac = new AbortController()
    setLoading(true)
    Promise.all([
      fetch('/api/graph', { signal: ac.signal }).then(r => r.json()).catch(() => ({ success: false })),
      Promise.resolve(getCustomProjects()),
      fetch('/api/insights?limit=200', { signal: ac.signal }).then(r => r.json()).catch(() => ({ success: false, data: [] })),
    ]).then(([json, customProjects, insightsJson]) => {
      const nodesMap = new Map<string, GraphNode>()
      const edgesMap = new Map<string, GraphEdge>()

      const addNode = (n: GraphNode) => { if (!nodesMap.has(n.id)) nodesMap.set(n.id, n) }
      const addEdge = (source: string, target: string, label: string, weight = 1) => {
        const key = `${source}::${target}`
        const rev = `${target}::${source}`
        if (!edgesMap.has(key) && !edgesMap.has(rev)) {
          edgesMap.set(key, { source, target, label, weight })
        }
      }

      // API nodes
      if (json.success && json.data) {
        for (const n of (json.data.nodes || [])) {
          addNode({
            id: n.id, label: n.label, type: n.type,
            subtitle: n.subtitle || '', detail: n.detail || '',
            size: n.size || 0,
            updatedAt: n.updatedAt || n.updated_at || '',
            sermonCount: n.sermonCount || 0,
          })
        }
        for (const e of (json.data.edges || [])) {
          const src = typeof e.source === 'string' ? e.source : e.source?.id
          const tgt = typeof e.target === 'string' ? e.target : e.target?.id
          if (src && tgt) addEdge(src, tgt, e.label || '', e.weight || 1)
        }
      }

      // localStorage projects — 진행 중 + 완료만 (보관 제외)
      const activeLocalProjects = customProjects.filter((p: any) => p.status !== 'archived')
      for (const p of activeLocalProjects) {
        const sid = `sermon-${p.id}`
        addNode({ id: sid, label: p.title || '(제목 없음)', type: 'sermon', subtitle: p.passage || '', detail: '', size: 5, updatedAt: p.updatedAt || p.createdAt || '' })

        if (p.book && p.chapter) {
          const pid = `passage-${p.book}-${p.chapter}`
          if (!nodesMap.has(pid)) {
            const plabel = p.passage || `${p.book} ${p.chapter}:${p.verseStart}${p.verseEnd && p.verseEnd !== p.verseStart ? '-' + p.verseEnd : ''}`
            addNode({ id: pid, label: plabel, type: 'passage', subtitle: p.book, detail: `${p.book} ${p.chapter}장`, size: 4, updatedAt: p.updatedAt || '' })
          }
          addEdge(sid, pid, '본문', 2)
        }

        for (const t of (p.themeNames || [])) {
          if (!t) continue
          const tid = `theme-${t}`
          if (!nodesMap.has(tid)) addNode({ id: tid, label: t, type: 'theme', subtitle: '주제', detail: '', size: 4, updatedAt: '' })
          addEdge(sid, tid, '관련', 1)
        }

        // Prep: keywords + themes fallback
        const prepRaw = getStorageItem<any | null>(`prep_${p.id}`, null)
        if (prepRaw) {
          if (!p.themeNames || p.themeNames.length === 0) {
            for (const t of (prepRaw.themes || [])) {
              if (!t.name) continue
              const tid = `theme-${t.name}`
              if (!nodesMap.has(tid)) addNode({ id: tid, label: t.name, type: 'theme', subtitle: '주제', detail: '', size: 4, updatedAt: '' })
              addEdge(sid, tid, '관련', 1)
            }
          }
          for (const kw of (prepRaw.keyWords || [])) {
            const wordLabel = kw.word || ''
            if (!wordLabel) continue
            const wid = `word-${p.id}-${wordLabel.replace(/[^a-zA-Z0-9가-힣]/g, '_')}`
            if (!nodesMap.has(wid)) addNode({ id: wid, label: wordLabel, type: 'word', subtitle: kw.meaning || '', detail: '', size: 3, updatedAt: '' })
            addEdge(sid, wid, '원어', 1)
          }
        }

        // Manuscript: greek words
        const msRaw = getStorageItem<any | null>(`manuscript_${p.id}`, null)
        if (msRaw) {
          for (const gw of (msRaw.greekWords || [])) {
            const wordLabel = gw.greek || gw.word || ''
            if (!wordLabel) continue
            const wid = `word-${p.id}-${wordLabel.replace(/[^a-zA-Z0-9가-힣]/g, '_')}`
            if (!nodesMap.has(wid)) addNode({ id: wid, label: wordLabel, type: 'word', subtitle: gw.meaning || '', detail: '', size: 3, updatedAt: '' })
            addEdge(sid, wid, '원어', 1)
          }
        }
      }

      // Insights (통찰 노트) — 자동 추가
      if (insightsJson?.success && Array.isArray(insightsJson.data)) {
        for (const insight of insightsJson.data) {
          if (!insight.id) continue
          const nid = `note-${insight.id}`
          const typeColor = insight.type === 'word' ? '#F43F5E' : '#EC4899'
          addNode({
            id: nid,
            label: insight.title || '통찰',
            type: 'note',
            subtitle: insight.summary?.slice(0, 60) || '',
            detail: '',
            size: insight.type === 'word' ? 5 : 4,
            updatedAt: insight.updatedAt || insight.createdAt || '',
          })

          // connections: word → note, sermon → note
          const conns = Array.isArray(insight.connections) ? insight.connections : []
          for (const c of conns) {
            if (c?.type === 'word' && c.id) {
              addEdge(c.id, nid, '통찰', 1)
            }
            if (c?.type === 'sermon' && c.id) {
              addEdge(`sermon-${c.id}`, nid, '통찰', 1)
            }
          }
        }
      }

      setAllNodes(Array.from(nodesMap.values()))
      setAllEdges(Array.from(edgesMap.values()))
    })
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => ac?.abort()
  }, [])

  // Select top N nodes by connection count + recency
  const topNodes = useMemo(() => {
    if (allNodes.length === 0) return []
    const degree = new Map<string, number>()
    allEdges.forEach((e) => {
      degree.set(e.source, (degree.get(e.source) || 0) + 1)
      degree.set(e.target, (degree.get(e.target) || 0) + 1)
    })
    const now = Date.now()
    const scored = allNodes.map((n) => {
      const conns = degree.get(n.id) || 0
      const updatedT = new Date(n.updatedAt || 0).getTime()
      const ageDays = updatedT > 0 ? (now - updatedT) / (1000 * 60 * 60 * 24) : 999
      const recency = Math.max(0, 1 - ageDays / 90)
      const score = conns * 2 + recency * 1
      return { n, conns, recency, score }
    })
    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, 22).map((s) => ({ ...s.n, _conns: s.conns, _recency: s.recency }))
  }, [allNodes, allEdges])

  const topNodeIds = useMemo(() => new Set(topNodes.map((t) => t.id)), [topNodes])
  const topEdges = useMemo(() => {
    return allEdges.filter((e) => topNodeIds.has(e.source) && topNodeIds.has(e.target))
  }, [allEdges, topNodeIds])

  const topNodeMap = useMemo(() => {
    const m = new Map<string, GraphNode & { _conns: number; _recency: number }>()
    topNodes.forEach((n: any) => m.set(n.id, n))
    return m
  }, [topNodes])

  // Build simulation nodes
  useEffect(() => {
    simRef.current?.stop()
    nodesRef.current = []
    nodeMapRef.current = new Map()

    if (topNodes.length === 0) return

    const centerX = sizeRef.current.w / 2
    const centerY = sizeRef.current.h / 2

    const now = Date.now()
    const simNodes: SimNode[] = topNodes.map((n: any) => {
      const updatedT = new Date(n.updatedAt || 0).getTime()
      const ageDays = updatedT > 0 ? (now - updatedT) / (1000 * 60 * 60 * 24) : 999
      const recency = Math.max(0, 1 - ageDays / 90)
      const conns = n._conns || 0
      const r = 4 + Math.min(10, conns * 0.6) + recency * 3
      return {
        id: n.id,
        label: n.label,
        type: n.type,
        subtitle: n.subtitle || '',
        updatedAt: n.updatedAt || '',
        refValue: getRefValue(n),
        r,
        recency,
        x: centerX + (Math.random() - 0.5) * 100,
        y: centerY + (Math.random() - 0.5) * 100,
        vx: 0,
        vy: 0,
        fx: null,
        fy: null,
      }
    })

    const nodeMap = new Map<string, SimNode>()
    simNodes.forEach((n) => nodeMap.set(n.id, n))

    const simEdges = topEdges.map((e) => ({ source: e.source, target: e.target, weight: e.weight || 1 }))

    nodesRef.current = simNodes
    edgesRef.current = simEdges
    nodeMapRef.current = nodeMap

    const sim = forceSimulation<SimNode>(simNodes)
      .force('charge', forceManyBody<SimNode>().strength(-180))
      .force('center', forceCenter(centerX, centerY).strength(0.05))
      .force('link', forceLink<SimNode, { source: string; target: string; weight: number }>(simEdges as any)
        .id((d: any) => d.id)
        .distance(70)
        .strength(0.4))
      .force('collide', forceCollide<SimNode>().radius((d) => d.r + 6))
      .alpha(0.9)
      .alphaDecay(0.025)
      .on('tick', () => setTick((t) => (t + 1) % 1000000))

    simRef.current = sim

    return () => { sim.stop() }
  }, [topNodes, topEdges, size.w, size.h])

  // Floating animation
  useEffect(() => {
    let last = performance.now()
    const animate = (now: number) => {
      const dt = Math.min(40, now - last) * 0.001
      last = now
      const t = now * 0.001
      nodesRef.current.forEach((n, i) => {
        if (n.fx !== null && n.fy !== null) return
        const baseX = n.x || 0
        const baseY = n.y || 0
        const phase = (i * 0.7) + (n.id.charCodeAt(0) % 5) * 0.3
        const ampX = 1.2 + (n.recency * 1.5)
        const ampY = 1.2 + (n.recency * 1.5)
        n.x = baseX + Math.sin(t * 0.3 + phase) * ampX
        n.y = baseY + Math.cos(t * 0.4 + phase * 1.1) * ampY
      })
      setTick((x) => (x + 1) % 1000000)
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  // Mouse handlers
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const onMove = (e: MouseEvent) => {
      const target = (e.target as Element).closest('[data-node-id]') as Element | null
      const rect = svg.getBoundingClientRect()
      if (target) {
        const id = target.getAttribute('data-node-id') || ''
        setHoveredId(id)
        const node = nodeMapRef.current.get(id)
        if (node) setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, node })
      } else {
        setHoveredId(null)
        setTooltip(null)
      }
    }
    const onClick = (e: MouseEvent) => {
      const target = (e.target as Element).closest('[data-node-id]') as Element | null
      if (!target) return
      const id = target.getAttribute('data-node-id') || ''
      const node = nodeMapRef.current.get(id)
      if (!node) return
      setSelectedId(id)
      onSelectNode?.(node.refValue)
    }
    const onLeave = () => { setHoveredId(null); setTooltip(null) }
    svg.addEventListener('mousemove', onMove)
    svg.addEventListener('click', onClick)
    svg.addEventListener('mouseleave', onLeave)
    return () => {
      svg.removeEventListener('mousemove', onMove)
      svg.removeEventListener('click', onClick)
      svg.removeEventListener('mouseleave', onLeave)
    }
  }, [onSelectNode])

  // Compute node opacity based on time scrub
  const getNodeOpacity = useCallback((n: SimNode) => {
    if (!dateRange) return 1
    const updatedT = new Date(n.updatedAt || 0).getTime()
    if (updatedT === 0) return 0.4
    const cutoff = dateRange.min + (dateRange.max - dateRange.min) * (timePos / 100)
    const baseOpacity = updatedT >= cutoff ? 1 : 0.15
    return baseOpacity * (n.recency * 0.5 + 0.5)
  }, [dateRange, timePos])

  const visibleNodeCount = useMemo(() => {
    if (!dateRange) return nodesRef.current.length
    const cutoff = dateRange.min + (dateRange.max - dateRange.min) * (timePos / 100)
    return nodesRef.current.filter((n) => new Date(n.updatedAt || 0).getTime() >= cutoff).length
  }, [timePos, dateRange, nodesRef.current.length])

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="relative rounded-3xl border border-white/5 bg-[#04060f]/60 overflow-hidden shadow-2xl"
        style={{ height }}
      >
        {/* Background ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />
        </div>

        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin" />
          </div>
        ) : topNodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-6">
              <div className="text-2xl mb-2">🌌</div>
              <p className="text-xs text-slate-400 font-bold">아직 별이 없습니다</p>
              <p className="text-[10px] text-slate-600 mt-1">설교·통찰·시리즈를 기록하면 별이 피어납니다</p>
            </div>
          </div>
        ) : null}

        <svg ref={svgRef} width={size.w} height={size.h} className="block relative z-10">
          <defs>
            {Object.entries(TYPE_COLOR).map(([t, c]) => (
              <radialGradient key={t} id={`starGlow-${t}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={c} stopOpacity="0.7" />
                <stop offset="50%" stopColor={c} stopOpacity="0.2" />
                <stop offset="100%" stopColor={c} stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>

          {/* Edges */}
          <g>
            {edgesRef.current.map((e, i) => {
              const s = nodeMapRef.current.get(e.source)
              const t = nodeMapRef.current.get(e.target)
              if (!s || !t) return null
              const opacity = (getNodeOpacity(s) + getNodeOpacity(t)) / 2
              return (
                <line
                  key={i}
                  x1={s.x || 0}
                  y1={s.y || 0}
                  x2={t.x || 0}
                  y2={t.y || 0}
                  stroke="rgba(165, 180, 252, 0.18)"
                  strokeWidth={0.6 + (e.weight || 1) * 0.3}
                  opacity={opacity}
                />
              )
            })}
          </g>

          {/* Nodes */}
          <g>
            {nodesRef.current.map((n) => {
              const opacity = getNodeOpacity(n)
              const color = TYPE_COLOR[n.type] || '#9ca3af'
              const isHover = hoveredId === n.id
              const isSelected = selectedId === n.id
              const dim = hoveredId && !isHover ? 0.2 : 1
              return (
                <g
                  key={n.id}
                  data-node-id={n.id}
                  transform={`translate(${n.x || 0},${n.y || 0})`}
                  style={{ cursor: 'pointer', opacity: opacity * dim, transition: 'opacity 200ms' }}
                >
                  {/* Glow halo for recent stars */}
                  {n.recency > 0.5 && (
                    <circle
                      r={n.r * 2.2}
                      fill={`url(#starGlow-${n.type})`}
                      opacity={n.recency * 0.6}
                    >
                      <animate
                        attributeName="opacity"
                        values={`${n.recency * 0.4};${n.recency * 0.8};${n.recency * 0.4}`}
                        dur={`${3 + (n.id.charCodeAt(0) % 3)}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                  {/* Pulse for selected */}
                  {isSelected && (
                    <circle r={n.r + 4} fill="none" stroke={color} strokeWidth={1.5} opacity={0.6}>
                      <animate attributeName="r" from={n.r + 3} to={n.r + 12} dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.8" to="0" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {/* Main star */}
                  <circle
                    r={n.r}
                    fill={color}
                    fillOpacity={0.9}
                    stroke={isHover || isSelected ? '#fff' : 'rgba(255,255,255,0.3)'}
                    strokeWidth={isHover || isSelected ? 1.5 : 0.5}
                  />
                  <circle
                    r={n.r * 0.4}
                    fill="#fff"
                    fillOpacity={0.4}
                    cx={-n.r * 0.2}
                    cy={-n.r * 0.2}
                  />
                </g>
              )
            })}
          </g>
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute pointer-events-none z-20 bg-[#0c1020]/95 backdrop-blur-md border border-white/15 rounded-lg px-3 py-2 shadow-2xl"
            style={{ left: Math.min(tooltip.x + 12, size.w - 200), top: Math.min(tooltip.y + 12, size.h - 80) }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TYPE_COLOR[tooltip.node.type] }} />
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{TYPE_LABEL[tooltip.node.type] || tooltip.node.type}</span>
            </div>
            <p className="text-[11px] text-slate-100 font-bold leading-snug mt-0.5 max-w-[180px]">{tooltip.node.label}</p>
            {tooltip.node.subtitle && (
              <p className="text-[10px] text-slate-500 mt-0.5 max-w-[180px] truncate">{tooltip.node.subtitle}</p>
            )}
            <p className="text-[9px] text-indigo-400 mt-1 font-bold">클릭하여 필터 →</p>
          </div>
        )}

        {/* Stats overlay (top right) */}
        <div className="absolute top-3 right-3 flex items-center gap-2 text-[10px] text-slate-500 font-bold bg-[#070a16]/80 px-3 py-1.5 rounded-xl border border-white/5 backdrop-blur-sm">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{visibleNodeCount}개 별</span>
          <span className="text-slate-700">·</span>
          <span>{edgesRef.current.length}개 연결</span>
        </div>

        {/* Legend (bottom left) */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 text-[9px] text-slate-500 font-bold bg-[#070a16]/80 px-2.5 py-1.5 rounded-xl border border-white/5 backdrop-blur-sm">
          {Object.entries(TYPE_COLOR).map(([t, c]) => (
            <span key={t} className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c }} />
              {TYPE_LABEL[t]}
            </span>
          ))}
        </div>
      </div>

      {/* Time scrub */}
      {dateRange && (
        <div className="rounded-2xl border border-white/5 bg-[#04060f]/40 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 shrink-0">
              <span>⏱</span>
              <span>시간</span>
            </div>
            <div className="flex-1 flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-medium shrink-0 tabular-nums">
                {new Date(dateRange.min + (dateRange.max - dateRange.min) * (timePos / 100)).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' })}
              </span>
              <div className="flex-1 relative h-1.5 group">
                <div className="absolute inset-0 rounded-full bg-white/5" />
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500/40 via-purple-500/40 to-emerald-500/40"
                  style={{ width: `${timePos}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={timePos}
                  onChange={(e) => setTimePos(Number(e.target.value))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-indigo-500 shadow-md pointer-events-none"
                  style={{ left: `calc(${timePos}% - 6px)` }}
                />
              </div>
              <span className="text-[10px] text-slate-300 font-bold shrink-0 tabular-nums">오늘</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {timePos < 100 && (
                <button
                  onClick={() => setTimePos(100)}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold px-2 py-0.5 rounded hover:bg-indigo-500/10"
                >
                  ↻ 초기화
                </button>
              )}
              {selectedId && (
                <button
                  onClick={() => { setSelectedId(null); onSelectNode?.('') }}
                  className="text-[10px] text-slate-500 hover:text-slate-300 font-bold px-2 py-0.5 rounded hover:bg-white/5"
                >
                  ✕ 선택 해제
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getRefValue(n: GraphNode): string {
  if (n.type === 'passage') return n.label
  if (n.type === 'theme') return n.label
  if (n.type === 'series') return n.label
  if (n.type === 'note' && n.subtitle) return n.subtitle
  return n.label
}
