'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SERMONS, THEMES, TAGS, SERIES } from '@/data/sampleSermons'
import type { SermonD } from '@/types/dashboard'
import { Search, ZoomIn, ZoomOut, RotateCcw, X, Maximize2, Minimize2 } from 'lucide-react'

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

const NODE_STYLE: Record<string, { color: string; radius: number; label: string }> = {
  sermon: { color: '#6366f1', radius: 13, label: '설교' },
  theme: { color: '#f59e0b', radius: 10, label: '주제' },
  tag: { color: '#10b981', radius: 8, label: '태그' },
  series: { color: '#f43f5e', radius: 15, label: '시리즈' },
}

type FilterType = 'all' | 'sermon' | 'theme' | 'tag' | 'series'

export default function GraphView({ onSelectSermon }: { onSelectSermon?: (id: string) => void }) {
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
  const [fullscreen, setFullscreen] = useState(false)

  const nodes = useMemo<GraphNode[]>(() => {
    const result: GraphNode[] = []
    const w = dim.w || 900, h = dim.h || 600
    SERMONS.forEach((s) => {
      result.push({
        id: `sermon-${s.id}`, label: s.title, type: 'sermon',
        x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0,
        radius: NODE_STYLE.sermon.radius, color: NODE_STYLE.sermon.color, sermon: s,
      })
    })
    THEMES.forEach((t) => {
      result.push({
        id: `theme-${t.id}`, label: t.name, type: 'theme',
        x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0,
        radius: NODE_STYLE.theme.radius, color: NODE_STYLE.theme.color,
      })
    })
    TAGS.forEach((t) => {
      result.push({
        id: `tag-${t.id}`, label: t.name, type: 'tag',
        x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0,
        radius: NODE_STYLE.tag.radius, color: NODE_STYLE.tag.color,
      })
    })
    SERIES.forEach((s) => {
      result.push({
        id: `series-${s.id}`, label: s.name, type: 'series',
        x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0,
        radius: NODE_STYLE.series.radius, color: NODE_STYLE.series.color,
      })
    })
    return result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dim.w, dim.h, simulationDone])

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
    const W = Math.max(dim.w, 1), H = Math.max(dim.h, 1)
    const nodeArr = nodes
    const edgeArr = edges
    const REP = 10000
    const ATTR = 0.008
    const DAMP = 0.65
    const ITER = 100

    const step = (iter: number) => {
      if (!running) return
      const pos: Record<string, { x: number; y: number }> = {}
      nodeArr.forEach((n) => { pos[n.id] = { x: n.x, y: n.y } })

      for (let i = 0; i < nodeArr.length; i++) {
        for (let j = i + 1; j < nodeArr.length; j++) {
          const a = nodeArr[i], b = nodeArr[j]
          const dx = b.x - a.x, dy = b.y - a.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const force = REP / (dist * dist)
          const fx = (dx / dist) * force, fy = (dy / dist) * force
          a.vx -= fx; a.vy -= fy
          b.vx += fx; b.vy += fy
        }
      }

      edgeArr.forEach((e) => {
        const a = pos[e.source], b = pos[e.target]
        if (!a || !b) return
        const dx = b.x - a.x, dy = b.y - a.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const force = (dist - 120) * ATTR
        const fx = (dx / dist) * force, fy = (dy / dist) * force
        const aNode = nodeArr.find((n) => n.id === e.source)
        const bNode = nodeArr.find((n) => n.id === e.target)
        if (aNode) { aNode.vx += fx; aNode.vy += fy }
        if (bNode) { bNode.vx -= fx; bNode.vy -= fy }
      })

      let totalV = 0
      nodeArr.forEach((n) => {
        n.vx *= DAMP; n.vy *= DAMP
        n.x += n.vx; n.y += n.vy
        n.x = Math.max(40, Math.min(W - 40, n.x))
        n.y = Math.max(40, Math.min(H - 40, n.y))
        totalV += Math.abs(n.vx) + Math.abs(n.vy)
      })

      if (iter < ITER && totalV > 0.05) {
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
      const connected = new Set(matched)
      edges.forEach((e) => {
        if (matched.includes(e.source)) connected.add(e.target)
        if (matched.includes(e.target)) connected.add(e.source)
      })
      ids = new Set(Array.from(ids).filter((id) => connected.has(id)))
    }
    return ids
  }, [nodes, edges, filter, search])

  const isConnected = useCallback(
    (nodeId: string) => {
      if (!hoveredNode && !selectedNode) return true
      const active = hoveredNode || selectedNode || ''
      if (nodeId === active) return true
      return edges.some((e) => (e.source === active && e.target === nodeId) || (e.source === nodeId && e.target === active))
    },
    [hoveredNode, selectedNode, edges]
  )

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
    if (isDragging) setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }

  const handleMouseUp = () => setIsDragging(false)
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }) }

  const getNodeOpacity = (nodeId: string) => {
    if (!hoveredNode && !selectedNode) return 1
    return isConnected(nodeId) ? 1 : 0.12
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

  const edgeOpacity = (e: GraphEdge) => {
    if (!hoveredNode && !selectedNode) return 0.08
    const active = hoveredNode || selectedNode || ''
    const h = e.source === active || e.target === active
    return h ? 0.35 : 0.015
  }

  return (
    <div className={`flex flex-col ${fullscreen ? 'fixed inset-0 z-50 bg-white' : 'h-full'}`}>
      {/* toolbar */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-slate-200/30 bg-white/50 backdrop-blur-sm">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="노드 검색..."
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-white/60 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200/50 focus:border-indigo-300 text-slate-700 placeholder-slate-400"
          />
        </div>
        <div className="flex items-center gap-1 bg-slate-100/70 rounded-xl p-0.5">
          {(['all', 'sermon', 'theme', 'tag', 'series'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                filter === f ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {f === 'all' ? '전체' : NODE_STYLE[f].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => setZoom((z) => Math.min(5, z * 1.3))} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" title="확대">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={() => setZoom((z) => Math.max(0.2, z * 0.7))} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" title="축소">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button onClick={resetView} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" title="초기화">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button onClick={() => setFullscreen((f) => !f)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 ml-1" title="전체화면">
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* graph */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/20">
        <svg
          className="w-full h-full cursor-grab active:cursor-grabbing select-none"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <defs>
            {Object.entries(NODE_STYLE).map(([type, style]) => (
              <radialGradient key={type} id={`grad-${type}`} cx="30%" cy="30%">
                <stop offset="0%" stopColor={style.color} stopOpacity="1" />
                <stop offset="100%" stopColor={style.color} stopOpacity="0.7" />
              </radialGradient>
            ))}
          </defs>
          <g transform={getTransform()}>
            {/* edges */}
            {edges.map((e) => {
              const source = nodes.find((n) => n.id === e.source)
              const target = nodes.find((n) => n.id === e.target)
              if (!source || !target) return null
              if (!filteredNodeIds.has(e.source) || !filteredNodeIds.has(e.target)) return null
              const opacity = edgeOpacity(e)
              const strokeColor = source.type === 'sermon'
                ? NODE_STYLE[target.type]?.color || '#6366f1'
                : NODE_STYLE[source.type]?.color || '#6366f1'
              return (
                <line
                  key={`${e.source}-${e.target}`}
                  x1={source.x} y1={source.y}
                  x2={target.x} y2={target.y}
                  stroke={strokeColor}
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
              const r = n.radius * (hoveredNode === n.id ? 1.5 : selectedNode === n.id ? 1.4 : 1)
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
                    if (n.type === 'sermon' && n.sermon && onSelectSermon) onSelectSermon(n.sermon.id)
                    else setSelectedNode(selectedNode === n.id ? null : n.id)
                  }}
                >
                  {isActive && <circle r={r + 8} fill={n.color} opacity={0.12} className="animate-pulse" />}
                  <circle r={r} fill={`url(#grad-${n.type})`} stroke="#fff" strokeWidth={2.5} className="drop-shadow-sm" />
                  {isActive && (
                    <circle r={r - 3} fill="none" stroke="#fff" strokeWidth={1} opacity={0.5} />
                  )}
                  <text
                    dy={r + 13}
                    textAnchor="middle"
                    className="fill-slate-600 text-[10px] font-medium pointer-events-none select-none"
                    style={{ fontFamily: 'var(--font-noto-sans-kr), sans-serif' }}
                  >
                    {n.label.length > 7 ? n.label.slice(0, 7) + '…' : n.label}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>

        {/* legend */}
        <div className="absolute bottom-4 left-4 flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-xl px-3.5 py-2 border border-slate-200/40 shadow-sm text-xs">
          {Object.entries(NODE_STYLE).map(([type, style]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: style.color }} />
              <span className="text-slate-500">{style.label}</span>
            </div>
          ))}
          <span className="text-slate-200 mx-0.5">|</span>
          <span className="text-slate-400">{edges.length}개의 연결</span>
        </div>

        {/* instructions */}
        <div className="absolute bottom-4 right-4 text-[10px] text-slate-300 bg-white/60 backdrop-blur-sm rounded-lg px-2.5 py-1.5 border border-slate-200/30">
          드래그로 이동 · 휠로 확대/축소
        </div>
      </div>

      {/* node detail panel */}
      {selectedNode && activeNode && (
        <div className="border-t border-slate-200/30 bg-white/80 backdrop-blur-sm px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeNode.color }} />
                <span className="text-[11px] font-medium text-slate-400">{NODE_STYLE[activeNode.type]?.label || '노드'}</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-800 mt-0.5">{activeNode.label}</h4>
            </div>
            <button onClick={() => setSelectedNode(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          {activeNode.type === 'sermon' && activeNode.sermon && (
            <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
              <span>{activeNode.sermon.normalizedPassage}</span>
              <span>·</span>
              <span>{activeNode.sermon.date}</span>
              <button
                onClick={() => onSelectSermon?.(activeNode.sermon!.id)}
                className="text-indigo-500 hover:text-indigo-700 font-medium ml-1 transition-colors"
              >
                상세보기
                <span className="ml-0.5">→</span>
              </button>
            </div>
          )}
          {activeNode.type === 'sermon' && relatedSermons.length > 0 && (
            <div className="mt-2.5">
              <span className="text-xs text-slate-400">연결된 설교</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {relatedSermons.map((rs) => (
                  <button
                    key={rs.id}
                    onClick={() => onSelectSermon?.(rs.id)}
                    className="px-2 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors"
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
