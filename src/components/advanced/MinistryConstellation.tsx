'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  forceSimulation, forceManyBody, forceLink, forceCenter, forceCollide,
  type Simulation,
} from 'd3-force'
import { getCustomProjects } from '@/lib/advanced/customProjects'
import { readProjectCore } from '@/lib/advanced/projectStorage'

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
  conns: number
  x: number
  y: number
  vx?: number
  vy?: number
  fx?: number | null
  fy?: number | null
}

// ─── Obsidian Knowledge Graph Color Palette ───
const TYPE_COLOR: Record<string, string> = {
  sermon: '#34D399',  // Obsidian Emerald (설교)
  passage: '#FBBF24', // Obsidian Amber/Gold (본문)
  theme: '#A78BFA',   // Obsidian Lavender (주제)
  word: '#38BDF8',    // Obsidian Cyan (원어)
  note: '#FB7185',    // Obsidian Rose (통찰)
  series: '#818CF8',  // Obsidian Indigo (시리즈)
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

export default function MinistryConstellation({ onSelectNode, height = 360 }: MinistryConstellationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const simRef = useRef<Simulation<SimNode, undefined> | null>(null)
  const nodesRef = useRef<SimNode[]>([])
  const edgesRef = useRef<{ source: string; target: string; weight: number }[]>([])
  const nodeMapRef = useRef<Map<string, SimNode>>(new Map())
  const animRef = useRef<number>(0)
  const sizeRef = useRef({ w: 800, h: height })
  const dragNodeRef = useRef<SimNode | null>(null)

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
      if (rect.width > 0 && rect.height > 0) {
        sizeRef.current = { w: rect.width, h: rect.height }
        setSize({ w: rect.width, h: rect.height })
      }
    })
    ro.observe(el)
    const rect = el.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      sizeRef.current = { w: rect.width, h: rect.height }
      setSize({ w: rect.width, h: rect.height })
    }
    return () => ro.disconnect()
  }, [])

  // Fetch graph data
  useEffect(() => {
    const ac = new AbortController()
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

      // localStorage projects
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

        // Prep + manuscript core
        const { prep: prepRaw, manuscript: msRaw } = readProjectCore(p.id)
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

      // Insights
      if (insightsJson?.success && Array.isArray(insightsJson.data)) {
        for (const insight of insightsJson.data) {
          if (!insight.id) continue
          const nid = `note-${insight.id}`
          addNode({
            id: nid,
            label: insight.title || '통찰',
            type: 'note',
            subtitle: insight.summary?.slice(0, 60) || '',
            detail: '',
            size: 3,
            updatedAt: insight.updated_at || insight.created_at || '',
          })
          for (const c of (insight.connections || [])) {
            if (c?.id && nodesMap.has(c.id)) {
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
    return () => ac.abort()
  }, [])

  // Select top N nodes (Obsidian dense cluster: 26 nodes)
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
      const score = conns * 2.2 + recency * 1.5
      return { n, conns, recency, score }
    })
    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, 26).map((s) => ({ ...s.n, _conns: s.conns, _recency: s.recency }))
  }, [allNodes, allEdges])

  const topNodeIds = useMemo(() => new Set(topNodes.map((t) => t.id)), [topNodes])
  const topEdges = useMemo(() => {
    return allEdges.filter((e) => topNodeIds.has(e.source) && topNodeIds.has(e.target))
  }, [allEdges, topNodeIds])

  // Build Adjacency map for fast O(1) neighbor highlight
  const adjMap = useMemo(() => {
    const map = new Map<string, Set<string>>()
    topEdges.forEach((e) => {
      if (!map.has(e.source)) map.set(e.source, new Set())
      if (!map.has(e.target)) map.set(e.target, new Set())
      map.get(e.source)!.add(e.target)
      map.get(e.target)!.add(e.source)
    })
    return map
  }, [topEdges])

  // D3 force simulation setup
  useEffect(() => {
    simRef.current?.stop()
    nodesRef.current = []
    nodeMapRef.current = new Map()

    if (topNodes.length === 0) return

    const centerX = sizeRef.current.w / 2
    const centerY = sizeRef.current.h / 2

    const now = Date.now()
    const simNodes: SimNode[] = topNodes.map((n: any, i) => {
      const updatedT = new Date(n.updatedAt || 0).getTime()
      const ageDays = updatedT > 0 ? (now - updatedT) / (1000 * 60 * 60 * 24) : 999
      const recency = Math.max(0, 1 - ageDays / 90)
      const conns = n._conns || 0
      // Obsidian pip radius: 4.5px ~ 9px
      const r = Math.max(4.5, Math.min(9.5, 4.5 + conns * 0.75 + recency * 1.5))
      const angle = (i / topNodes.length) * Math.PI * 2
      const dist = 70 + (i % 3) * 35
      return {
        id: n.id,
        label: n.label,
        type: n.type,
        subtitle: n.subtitle || '',
        updatedAt: n.updatedAt || '',
        refValue: getRefValue(n),
        r,
        recency,
        conns,
        x: centerX + Math.cos(angle) * dist + (Math.random() - 0.5) * 20,
        y: centerY + Math.sin(angle) * dist + (Math.random() - 0.5) * 20,
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

    // Obsidian Physics tuning: gentle repulsion, subtle center gravity, clear link distance
    const sim = forceSimulation<SimNode>(simNodes)
      .force('charge', forceManyBody<SimNode>().strength(-140))
      .force('center', forceCenter(centerX, centerY).strength(0.04))
      .force('link', forceLink<SimNode, { source: string; target: string; weight: number }>(simEdges as any)
        .id((d: any) => d.id)
        .distance(75)
        .strength(0.35))
      .force('collide', forceCollide<SimNode>().radius((d) => d.r + 14).strength(0.8))
      .alpha(0.9)
      .alphaDecay(0.02)
      .on('tick', () => setTick((t) => (t + 1) % 1000000))

    simRef.current = sim

    return () => { sim.stop() }
  }, [topNodes, topEdges, size.w, size.h])

  // Continuous micro-breathing (Obsidian organic life feel)
  useEffect(() => {
    let last = performance.now()
    const animate = (now: number) => {
      last = now
      const t = now * 0.0008
      nodesRef.current.forEach((n, i) => {
        if (n.fx !== null && n.fy !== null) return
        if (dragNodeRef.current?.id === n.id) return
        const baseX = n.x || 0
        const baseY = n.y || 0
        const phase = i * 0.85
        const amp = 0.5 + (n.recency * 0.5)
        n.x = baseX + Math.sin(t * 0.8 + phase) * amp * 0.3
        n.y = baseY + Math.cos(t * 0.7 + phase * 1.2) * amp * 0.3
      })
      setTick((x) => (x + 1) % 1000000)
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  // Restart physics on demand
  const handleReheat = useCallback(() => {
    if (!simRef.current) return
    simRef.current.alpha(0.8).restart()
  }, [])

  // Interactive Drag & Hover Listeners
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    let isDragging = false

    const getSvgCoords = (e: MouseEvent) => {
      const rect = svg.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    const onMouseDown = (e: MouseEvent) => {
      const target = (e.target as Element).closest('[data-node-id]') as Element | null
      if (!target) return
      const id = target.getAttribute('data-node-id') || ''
      const node = nodeMapRef.current.get(id)
      if (!node) return

      isDragging = true
      dragNodeRef.current = node
      const { x, y } = getSvgCoords(e)
      node.fx = x
      node.fy = y
      simRef.current?.alpha(0.3).restart()
    }

    const onMouseMove = (e: MouseEvent) => {
      const { x, y } = getSvgCoords(e)

      if (isDragging && dragNodeRef.current) {
        dragNodeRef.current.fx = x
        dragNodeRef.current.fy = y
        simRef.current?.alpha(0.3).restart()
        return
      }

      const target = (e.target as Element).closest('[data-node-id]') as Element | null
      if (target) {
        const id = target.getAttribute('data-node-id') || ''
        setHoveredId(id)
        const node = nodeMapRef.current.get(id)
        if (node) setTooltip({ x, y, node })
      } else {
        setHoveredId(null)
        setTooltip(null)
      }
    }

    const onMouseUp = () => {
      if (isDragging && dragNodeRef.current) {
        dragNodeRef.current.fx = null
        dragNodeRef.current.fy = null
        dragNodeRef.current = null
        isDragging = false
        simRef.current?.alpha(0.2).restart()
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

    const onLeave = () => {
      onMouseUp()
      setHoveredId(null)
      setTooltip(null)
    }

    svg.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    svg.addEventListener('click', onClick)
    svg.addEventListener('mouseleave', onLeave)

    return () => {
      svg.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      svg.removeEventListener('click', onClick)
      svg.removeEventListener('mouseleave', onLeave)
    }
  }, [onSelectNode])

  // Time scrubber opacity
  const getNodeOpacity = useCallback((n: SimNode) => {
    if (!dateRange) return 1
    const updatedT = new Date(n.updatedAt || 0).getTime()
    if (updatedT === 0) return 0.5
    const cutoff = dateRange.min + (dateRange.max - dateRange.min) * (timePos / 100)
    const baseOpacity = updatedT >= cutoff ? 1 : 0.15
    return baseOpacity * (n.recency * 0.4 + 0.6)
  }, [dateRange, timePos])

  // Active neighborhood calculation
  const activeNeighbors = useMemo(() => {
    if (!hoveredId) return null
    const set = new Set<string>()
    set.add(hoveredId)
    const nbrs = adjMap.get(hoveredId)
    if (nbrs) nbrs.forEach((id) => set.add(id))
    return set
  }, [hoveredId, adjMap])

  return (
    <div className="space-y-2">
      {/* ─── Obsidian Knowledge Canvas Container ─── */}
      <div
        ref={containerRef}
        className="relative rounded-3xl border border-white/10 bg-[#0B0D14] overflow-hidden shadow-2xl select-none"
        style={{ height }}
      >
        {/* Obsidian subtle Dot Grid Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.25) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Deep ambient nebula glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-[90px]" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-purple-500/10 blur-[90px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px]" />
        </div>

        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />
            <span className="text-[11px] font-mono text-slate-400">지식 그래프 렌더링 중...</span>
          </div>
        ) : topNodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-6">
              <div className="w-10 h-10 mx-auto mb-2 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-lg">🕸️</div>
              <p className="text-xs text-slate-300 font-bold">아직 연결된 지식 노드가 없습니다</p>
              <p className="text-[10px] text-slate-500 mt-1">설교 연구를 시작하면 성경 본문과 신학 주제가 자동으로 연결됩니다</p>
            </div>
          </div>
        ) : null}

        {/* ─── SVG Canvas ─── */}
        <svg ref={svgRef} width={size.w} height={size.h} className="block relative z-10 w-full h-full cursor-grab active:cursor-grabbing">
          <defs>
            {/* Obsidian Luminescent Aura Glows */}
            {Object.entries(TYPE_COLOR).map(([t, c]) => (
              <radialGradient key={t} id={`obsidianGlow-${t}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={c} stopOpacity="0.8" />
                <stop offset="45%" stopColor={c} stopOpacity="0.3" />
                <stop offset="100%" stopColor={c} stopOpacity="0" />
              </radialGradient>
            ))}

            {/* Neon Filter for active edges */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ─── Obsidian Filament Edges ─── */}
          <g className="edges-layer">
            {edgesRef.current.map((e, i) => {
              const s = nodeMapRef.current.get(e.source)
              const t = nodeMapRef.current.get(e.target)
              if (!s || !t) return null

              const isConnectedToHover = hoveredId && (e.source === hoveredId || e.target === hoveredId)
              const isConnectedToSelected = selectedId && (e.source === selectedId || e.target === selectedId)
              const isHighlight = isConnectedToHover || isConnectedToSelected

              const sourceColor = TYPE_COLOR[s.type] || '#A5B4FC'
              const timeOpacity = (getNodeOpacity(s) + getNodeOpacity(t)) / 2

              // Dim non-connected edges deeply when hovering
              let edgeOpacity = timeOpacity * 0.45
              let strokeColor = 'rgba(255, 255, 255, 0.12)'
              let strokeWidth = 0.75

              if (isHighlight) {
                edgeOpacity = 0.95
                strokeColor = sourceColor
                strokeWidth = 1.6
              } else if (hoveredId || selectedId) {
                edgeOpacity = 0.04
              }

              return (
                <line
                  key={`edge-${i}`}
                  x1={s.x}
                  y1={s.y}
                  x2={t.x}
                  y2={t.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  opacity={edgeOpacity}
                  filter={isHighlight ? 'url(#neonGlow)' : undefined}
                  style={{ transition: 'opacity 180ms ease, stroke 180ms ease, stroke-width 180ms ease' }}
                />
              )
            })}
          </g>

          {/* ─── Obsidian Luminescent Nodes & Typography ─── */}
          <g className="nodes-layer">
            {nodesRef.current.map((n) => {
              const baseOpacity = getNodeOpacity(n)
              const color = TYPE_COLOR[n.type] || '#9CA3AF'
              const isHover = hoveredId === n.id
              const isSelected = selectedId === n.id
              const isConnected = activeNeighbors ? activeNeighbors.has(n.id) : true

              // Obsidian Deep Dimming on non-connected nodes
              const nodeOpacity = baseOpacity * (isConnected ? 1 : 0.12)
              const labelOpacity = isHover || isSelected ? 1 : (isConnected ? 0.75 : 0.08)

              return (
                <g
                  key={n.id}
                  data-node-id={n.id}
                  transform={`translate(${n.x},${n.y})`}
                  style={{ cursor: 'pointer', transition: 'opacity 180ms ease' }}
                  opacity={nodeOpacity}
                >
                  {/* Subtle Luminescent Aura Glow */}
                  <circle
                    r={n.r * 2.4}
                    fill={`url(#obsidianGlow-${n.type})`}
                    opacity={isHover || isSelected ? 0.9 : 0.35}
                    style={{ transition: 'opacity 180ms ease' }}
                  />

                  {/* Selected / Hover Ring Animation */}
                  {(isHover || isSelected) && (
                    <circle
                      r={n.r + 3.5}
                      fill="none"
                      stroke={color}
                      strokeWidth={1.5}
                      strokeDasharray={isSelected ? '3 3' : undefined}
                      opacity={0.9}
                    />
                  )}

                  {/* Obsidian Core Dot */}
                  <circle
                    r={n.r}
                    fill={color}
                    fillOpacity={1}
                    stroke="#FFFFFF"
                    strokeWidth={isHover || isSelected ? 1.8 : 0.9}
                    strokeOpacity={isHover || isSelected ? 1 : 0.4}
                    style={{ transition: 'transform 180ms ease, stroke-width 180ms ease' }}
                  />

                  {/* Obsidian Inline Label with dark outline */}
                  <text
                    x={n.r + 6}
                    y={3.5}
                    fill={isHover || isSelected ? '#FFFFFF' : '#CBD5E1'}
                    fontSize={10}
                    fontWeight={isHover || isSelected ? 700 : 600}
                    letterSpacing="-0.02em"
                    paintOrder="stroke"
                    stroke="#0B0D14"
                    strokeWidth={3.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={labelOpacity}
                    style={{
                      userSelect: 'none',
                      pointerEvents: 'none',
                      fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                      transition: 'opacity 180ms ease, fill 180ms ease',
                    }}
                  >
                    {n.label.length > 13 ? n.label.slice(0, 13) + '…' : n.label}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>

        {/* ─── Obsidian Floating Tooltip ─── */}
        {tooltip && (
          <div
            className="absolute pointer-events-none z-30 bg-[#0E121E]/95 backdrop-blur-xl border border-white/15 rounded-xl px-3 py-2 shadow-2xl animate-in fade-in zoom-in-95 duration-100"
            style={{
              left: Math.min(tooltip.x + 14, size.w - 220),
              top: Math.min(tooltip.y + 14, size.h - 90),
              maxWidth: 220,
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-1.8 h-1.8 rounded-full" style={{ backgroundColor: TYPE_COLOR[tooltip.node.type] }} />
                <span className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-wider">{TYPE_LABEL[tooltip.node.type] || tooltip.node.type}</span>
              </div>
              <span className="text-[8.5px] font-mono text-slate-500 font-semibold">{tooltip.node.conns}개 연결</span>
            </div>
            <p className="text-[11.5px] text-white font-bold leading-tight mt-1 truncate">{tooltip.node.label}</p>
            {tooltip.node.subtitle && (
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">{tooltip.node.subtitle}</p>
            )}
            <div className="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-white/5 text-[9px] text-emerald-400 font-bold">
              <span>클릭하여 관련 말씀 필터링</span>
              <span>→</span>
            </div>
          </div>
        )}

        {/* ─── Obsidian Minimal Top-Right Control Bar ─── */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold bg-[#0E121E]/80 px-2.5 py-1 rounded-xl border border-white/10 backdrop-blur-md shadow-sm">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{topNodes.length}개 노드</span>
            </span>
            <span className="text-white/20">·</span>
            <span>{edgesRef.current.length}개 연결</span>
          </div>

          <button
            onClick={handleReheat}
            className="flex items-center justify-center w-7 h-7 rounded-xl bg-[#0E121E]/80 hover:bg-[#1A2035] text-slate-300 hover:text-white border border-white/10 backdrop-blur-md shadow-sm transition-all hover:scale-105 active:scale-95"
            title="물리 시뮬레이션 재배치 (Reheat)"
          >
            <span className="text-xs">⚡</span>
          </button>
        </div>

        {/* ─── Obsidian Minimal Bottom-Left Category Legend ─── */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 flex-wrap text-[9.5px] text-slate-400 font-bold bg-[#0E121E]/80 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-md shadow-sm z-20">
          {Object.entries(TYPE_COLOR).map(([t, c]) => (
            <span key={t} className="flex items-center gap-1.2 hover:text-white transition-colors cursor-default">
              <span className="w-1.8 h-1.8 rounded-full shadow-xs" style={{ backgroundColor: c }} />
              <span>{TYPE_LABEL[t]}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ─── Obsidian Time Scrubber (시간 흐름 탐색) ─── */}
      {dateRange && (
        <div className="rounded-2xl border border-white/10 bg-[#0B0D14]/80 px-4 py-2 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[10.5px] font-extrabold text-slate-400 shrink-0">
              <span className="text-xs">⏱</span>
              <span>연대기 탐색</span>
            </div>
            <div className="flex-1 flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono font-medium shrink-0 tabular-nums">
                {new Date(dateRange.min + (dateRange.max - dateRange.min) * (timePos / 100)).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' })}
              </span>
              <div className="flex-1 relative h-1.5 group">
                <div className="absolute inset-0 rounded-full bg-white/10" />
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500/50 via-purple-500/50 to-indigo-500/50"
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
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-indigo-500 shadow-md pointer-events-none transition-transform group-hover:scale-125"
                  style={{ left: `calc(${timePos}% - 6px)` }}
                />
              </div>
              <span className="text-[10px] text-emerald-400 font-bold shrink-0 tabular-nums">오늘</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {timePos < 100 && (
                <button
                  onClick={() => setTimePos(100)}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold px-2 py-0.5 rounded-lg hover:bg-emerald-500/10 transition-colors"
                >
                  ↻ 오늘로 리셋
                </button>
              )}
              {selectedId && (
                <button
                  onClick={() => { setSelectedId(null); onSelectNode?.('') }}
                  className="text-[10px] text-slate-400 hover:text-slate-200 font-bold px-2 py-0.5 rounded-lg hover:bg-white/5 transition-colors"
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
