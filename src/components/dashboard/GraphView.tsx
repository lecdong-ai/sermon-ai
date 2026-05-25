'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SERMONS, THEMES, TAGS, SERIES } from '@/data/sampleSermons'
import type { SermonD } from '@/types/dashboard'
import { Search, Filter, ZoomIn, ZoomOut, RotateCcw, X } from 'lucide-react'

interface GraphNode {
  id: string
  label: string
  type: 'sermon' | 'theme' | 'tag' | 'series'
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  sermon?: SermonD
}

interface GraphEdge {
  source: string
  target: string
}

const NODE_COLORS = {
  sermon: '#6366f1',
  theme: '#f59e0b',
  tag: '#10b981',
  series: '#ef4444',
}

const NODE_RADIUS = {
  sermon: 12,
  theme: 10,
  tag: 8,
  series: 14,
}

const NODE_LABEL = {
  sermon: '설교',
  theme: '주제',
  tag: '태그',
  series: '시리즈',
}

type FilterType = 'all' | 'sermon' | 'theme' | 'tag' | 'series'

export default function GraphView({ onSelectSermon }: { onSelectSermon?: (id: string) => void }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number>(0)
  const [dim, setDim] = useState({ w: 900, h: 600 })
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [simulationDone, setSimulationDone] = useState(false)

  const nodes = useMemo<GraphNode[]>(() => {
    const result: GraphNode[] = []
    SERMONS.forEach((s) => {
      result.push({
        id: `sermon-${s.id}`,
        label: s.title,
        type: 'sermon',
        x: Math.random() * dim.w,
        y: Math.random() * dim.h,
        vx: 0, vy: 0,
        radius: NODE_RADIUS.sermon,
        color: NODE_COLORS.sermon,
        sermon: s,
      })
    })
    THEMES.forEach((t) => {
      result.push({
        id: `theme-${t.id}`,
        label: t.name,
        type: 'theme',
        x: Math.random() * dim.w,
        y: Math.random() * dim.h,
        vx: 0, vy: 0,
        radius: NODE_RADIUS.theme,
        color: NODE_COLORS.theme,
      })
    })
    TAGS.forEach((t) => {
      result.push({
        id: `tag-${t.id}`,
        label: t.name,
        type: 'tag',
        x: Math.random() * dim.w,
        y: Math.random() * dim.h,
        vx: 0, vy: 0,
        radius: NODE_RADIUS.tag,
        color: NODE_COLORS.tag,
      })
    })
    SERIES.forEach((s) => {
      result.push({
        id: `series-${s.id}`,
        label: s.name,
        type: 'series',
        x: Math.random() * dim.w,
        y: Math.random() * dim.h,
        vx: 0, vy: 0,
        radius: NODE_RADIUS.series,
        color: NODE_COLORS.series,
      })
    })
    return result
  }, [dim.w, dim.h])

  const edges = useMemo<GraphEdge[]>(() => {
    const result: GraphEdge[] = []
    const used = new Set<string>()
    const add = (a: string, b: string) => {
      const key = [a, b].sort().join('|')
      if (!used.has(key)) { used.add(key); result.push({ source: a, target: b }) }
    }
    SERMONS.forEach((s) => {
      const sid = `sermon-${s.id}`
      s.themeIds.forEach((th) => add(sid, `theme-${th}`))
      s.tagIds.forEach((tg) => add(sid, `tag-${tg}`))
      if (s.seriesId) add(sid, `series-${s.seriesId}`)
      s.relatedSermonIds.forEach((rid) => add(sid, `sermon-${rid}`))
    })
    return result
  }, [])

  // force simulation
  useEffect(() => {
    if (simulationDone) return
    let running = true
    const W = dim.w, H = dim.h
    let nodeArr = nodes
    let edgeArr = edges
    const REP = 8000
    const ATTR = 0.01
    const DAMP = 0.6
    const ITER = 80

    const step = (iter: number) => {
      if (!running) return
      const pos: Record<string, { x: number; y: number }> = {}
      nodeArr.forEach((n) => { pos[n.id] = { x: n.x, y: n.y } })

      for (let i = 0; i < nodeArr.length; i++) {
        for (let j = i + 1; j < nodeArr.length; j++) {
          const a = nodeArr[i], b = nodeArr[j]
          let dx = b.x - a.x, dy = b.y - a.y
          let dist = Math.sqrt(dx * dx + dy * dy) || 1
          let force = REP / (dist * dist)
          let fx = (dx / dist) * force
          let fy = (dy / dist) * force
          a.vx -= fx; a.vy -= fy
          b.vx += fx; b.vy += fy
        }
      }

      edgeArr.forEach((e) => {
        const a = pos[e.source], b = pos[e.target]
        if (!a || !b) return
        let dx = b.x - a.x, dy = b.y - a.y
        let dist = Math.sqrt(dx * dx + dy * dy) || 1
        let force = (dist - 100) * ATTR
        let fx = (dx / dist) * force
        let fy = (dy / dist) * force
        const aNode = nodeArr.find((n) => n.id === e.source)
        const bNode = nodeArr.find((n) => n.id === e.target)
        if (aNode) { aNode.vx += fx; aNode.vy += fy }
        if (bNode) { bNode.vx -= fx; bNode.vy -= fy }
      })

      let totalV = 0
      nodeArr.forEach((n) => {
        n.vx *= DAMP; n.vy *= DAMP
        n.x += n.vx; n.y += n.vy
        n.x = Math.max(30, Math.min(W - 30, n.x))
        n.y = Math.max(30, Math.min(H - 30, n.y))
        totalV += Math.abs(n.vx) + Math.abs(n.vy)
      })

      if (iter < ITER && totalV > 0.1) {
        animRef.current = requestAnimationFrame(() => step(iter + 1))
      } else {
        setSimulationDone(true)
      }
    }

    animRef.current = requestAnimationFrame(() => step(0))
    return () => { running = false; cancelAnimationFrame(animRef.current) }
  }, [nodes, edges, dim, simulationDone])

  // resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDim({ w: rect.width, h: rect.height })
        setSimulationDone(false)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const filteredNodeIds = useMemo(() => {
    let ids = new Set(nodes.map((n) => n.id))
    if (filter !== 'all') {
      ids = new Set(nodes.filter((n) => n.type === filter).map((n) => n.id))
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      const matched = nodes.filter((n) => n.label.toLowerCase().includes(q)).map((n) => n.id)
      // also include connected nodes
      const connected = new Set(matched)
      edges.forEach((e) => {
        if (matched.includes(e.source)) connected.add(e.target)
        if (matched.includes(e.target)) connected.add(e.source)
      })
      ids = new Set(Array.from(ids).filter((id) => connected.has(id)))
    }
    return ids
  }, [nodes, edges, filter, search])

  const isConnected = useCallback((nodeId: string) => {
    if (!hoveredNode && !selectedNode) return true
    const active = hoveredNode || selectedNode || ''
    if (nodeId === active) return true
    return edges.some((e) => (e.source === active && e.target === nodeId) || (e.source === nodeId && e.target === active))
  }, [hoveredNode, selectedNode, edges])

  const activeNode = useMemo(() => {
    const id = hoveredNode || selectedNode
    return nodes.find((n) => n.id === id)
  }, [hoveredNode, selectedNode, nodes])

  const getTransform = () => {
    const cx = dim.w / 2, cy = dim.h / 2
    return `translate(${cx + pan.x},${cy + pan.y}) scale(${zoom}) translate(${-cx},${-cy})`
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom((z) => Math.max(0.2, Math.min(5, z * delta)))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && (e.target as HTMLElement).tagName === 'svg')) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    }
  }

  const handleMouseUp = () => setIsDragging(false)

  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }) }

  const getNodeOpacity = (nodeId: string) => {
    if (!hoveredNode && !selectedNode) return 1
    return isConnected(nodeId) ? 1 : 0.15
  }

  const relatedSermons = useMemo(() => {
    if (!selectedNode) return []
    const active = nodes.find((n) => n.id === selectedNode)
    if (!active || active.type !== 'sermon') return []
    const connectedIds = new Set<string>()
    edges.forEach((e) => {
      if (e.source === selectedNode) connectedIds.add(e.target)
      if (e.target === selectedNode) connectedIds.add(e.source)
    })
    return SERMONS.filter((s) => connectedIds.has(`sermon-${s.id}`))
  }, [selectedNode, nodes, edges])

  return (
    <div className="flex flex-col h-full">
      {/* toolbar */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-slate-200/40 bg-white/40 backdrop-blur-sm">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="노드 검색..."
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-100/60 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 text-slate-700 placeholder-slate-400"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-slate-100/50 rounded-lg p-0.5">
          {(['all', 'sermon', 'theme', 'tag', 'series'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                filter === f ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {f === 'all' ? '전체' : NODE_LABEL[f]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => setZoom((z) => Math.min(5, z * 1.3))} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={() => setZoom((z) => Math.max(0.2, z * 0.7))} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button onClick={resetView} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* graph */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <svg
          ref={svgRef}
          className="w-full h-full cursor-grab active:cursor-grabbing select-none"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <g transform={getTransform()}>
            {/* edges */}
            {edges.map((e) => {
              const source = nodes.find((n) => n.id === e.source)
              const target = nodes.find((n) => n.id === e.target)
              if (!source || !target) return null
              if (!filteredNodeIds.has(e.source) || !filteredNodeIds.has(e.target)) return null
              const opacity = (hoveredNode || selectedNode)
                ? (isConnected(e.source) && isConnected(e.target) ? 0.4 : 0.03)
                : 0.12
              return (
                <line
                  key={`${e.source}-${e.target}`}
                  x1={source.x} y1={source.y}
                  x2={target.x} y2={target.y}
                  stroke={NODE_COLORS.sermon}
                  strokeWidth={1}
                  opacity={opacity}
                  className="transition-opacity duration-300"
                />
              )
            })}
            {/* nodes */}
            {nodes.map((n) => {
              if (!filteredNodeIds.has(n.id)) return null
              const opacity = getNodeOpacity(n.id)
              const r = n.radius * (hoveredNode === n.id ? 1.4 : selectedNode === n.id ? 1.3 : 1)
              const isActive = hoveredNode === n.id || selectedNode === n.id
              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x},${n.y})`}
                  opacity={opacity}
                  className="transition-all duration-200"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredNode(n.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => {
                    if (n.type === 'sermon' && n.sermon && onSelectSermon) {
                      onSelectSermon(n.sermon.id)
                    } else {
                      setSelectedNode(selectedNode === n.id ? null : n.id)
                    }
                  }}
                >
                  {isActive && (
                    <circle r={r + 6} fill={n.color} opacity={0.15} className="animate-pulse" />
                  )}
                  <circle r={r} fill={n.color} opacity={0.9} stroke="#fff" strokeWidth={2} />
                  <text
                    dy={r + 14}
                    textAnchor="middle"
                    className="fill-slate-600 text-[10px] font-medium pointer-events-none"
                    style={{ fontFamily: 'var(--font-noto-sans-kr), sans-serif' }}
                  >
                    {n.label.length > 8 ? n.label.slice(0, 8) + '…' : n.label}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>

        {/* legend */}
        <div className="absolute bottom-4 left-4 flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-200/40 shadow-sm text-xs">
          {Object.entries(NODE_LABEL).map(([type, label]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: NODE_COLORS[type as keyof typeof NODE_COLORS] }} />
              <span className="text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* node detail panel */}
      {selectedNode && activeNode && (
        <div className="border-t border-slate-200/40 bg-white/80 backdrop-blur-sm px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: activeNode.color }} />
                <span className="text-xs font-medium text-slate-400">{NODE_LABEL[activeNode.type]}</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-700 mt-1">{activeNode.label}</h4>
            </div>
            <button onClick={() => setSelectedNode(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          {activeNode.type === 'sermon' && activeNode.sermon && (
            <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
              <span>{activeNode.sermon.normalizedPassage}</span>
              <span>{activeNode.sermon.date}</span>
              <button
                onClick={() => onSelectSermon?.(activeNode.sermon!.id)}
                className="text-primary-500 hover:text-primary-700 font-medium"
              >
                상세보기 →
              </button>
            </div>
          )}
          {activeNode.type === 'sermon' && relatedSermons.length > 0 && (
            <div className="mt-2">
              <span className="text-xs text-slate-400">연결된 설교: </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {relatedSermons.map((rs) => (
                  <button
                    key={rs.id}
                    onClick={() => onSelectSermon?.(rs.id)}
                    className="px-2 py-0.5 text-xs bg-primary-50 text-primary-600 rounded-md hover:bg-primary-100 transition-colors"
                  >
                    {rs.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
