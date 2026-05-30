'use client'

import { useRef, useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { GraphNode } from '@/lib/dashboard/types'
import { GRAPH_COLORS } from '@/lib/dashboard/constants'
import {
  forceSimulation, forceManyBody, forceLink,
  forceCenter, forceCollide, SimulationNodeDatum,
} from 'd3-force'

const NODE_COLORS: Record<string, string> = {
  sermon: '#8b5cf6',
  passage: '#6366f1',
  theme: '#14b8a6',
  season: '#f59e0b',
  audience: '#f43f5e',
  series: '#64748b',
}

const THEMES = {
  light: {
    bg: '#f8f6f1',
    lineBase: 'rgba(0,0,0,',
    labelNormal: '#334155',
    labelProminent: '#0f172a',
    panelBg: '#ffffff',
    panelBorder: 'rgba(0,0,0,0.1)',
    legendText: 'rgba(0,0,0,0.5)',
  },
  dark: {
    bg: '#111318',
    lineBase: 'rgba(255,255,255,',
    labelNormal: 'rgba(255,255,255,0.85)',
    labelProminent: '#ffffff',
    panelBg: 'rgba(17,19,24,0.95)',
    panelBorder: 'rgba(255,255,255,0.1)',
    legendText: 'rgba(255,255,255,0.4)',
  },
}

const NODE_RADIUS: Record<string, number> = {
  sermon: 48,
  passage: 34,
  theme: 26,
  season: 26,
  audience: 26,
  series: 26,
}

interface SimNode extends SimulationNodeDatum {
  id: string
  label: string
  type: GraphNode['type']
  color: string
  size: number
  sermonCount: number
  r: number
  bx: number
  by: number
  fx: number | null
  fy: number | null
}

interface SimLink {
  source: string
  target: string
}

export default function GraphCanvas({ data, focusNodeId, onNodeClick, sermonCentric, themeCentric }: {
  data: { nodes: GraphNode[]; links: { source: string; target: string }[] }
  focusNodeId?: string
  onNodeClick?: (node: GraphNode) => void
  sermonCentric?: boolean
  themeCentric?: boolean
}) {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const simRef = useRef<ReturnType<typeof forceSimulation<SimNode>> | null>(null)
  const rafRef = useRef(0)
  const hoverRef = useRef<string | null>(null)
  const downRef = useRef(false)
  const movedRef = useRef(false)
  const dragNodeRef = useRef<SimNode | null>(null)
  const viewRef = useRef({ x: 0, y: 0, k: 0.6 })
  const panStartRef = useRef({ x: 0, y: 0 })
  const [wh, setWh] = useState({ w: 800, h: 600 })
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [sel, setSel] = useState<GraphNode | null>(null)
  const [linkedSermons, setLinkedSermons] = useState<{id:string;label:string}[]>([])
  const [connectedNodes, setConnectedNodes] = useState<{id:string;label:string;type:GraphNode['type']}[]>([])
  const settledRef = useRef(false)
  const settleRef = useRef(0)
  const splashDoneRef = useRef(false)

  // Build adjacency for neighborhood highlighting
  const adjRef = useRef(new Map<string, Set<string>>())
  useEffect(() => {
    const m = new Map<string, Set<string>>()
    for (const l of data.links) {
      if (!m.has(l.source)) m.set(l.source, new Set())
      if (!m.has(l.target)) m.set(l.target, new Set())
      m.get(l.source)!.add(l.target)
      m.get(l.target)!.add(l.source)
    }
    adjRef.current = m
  }, [data.links])

  const nodes = useMemo(() => {
    return data.nodes.map((n) => ({
      ...n,
      r: NODE_RADIUS[n.type] || 3,
      sermonCount: n.sermonCount || 0,
      x: 0, y: 0, vx: 0, vy: 0,
      bx: 0, by: 0,
      fx: null, fy: null,
    }))
  }, [data.nodes])

  const links = useMemo(() =>
    data.links.map((l) => ({ source: l.source, target: l.target })),
    [data.links]
  )

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentRect.width || 800
      const h = e.contentRect.height || 600
      setWh((prev) => (prev.w !== w || prev.h !== h) ? { w, h } : prev)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    ctxRef.current = c.getContext('2d')
  }, [wh])

  // Build simulation
  useEffect(() => {
    if (!wh.w || !wh.h) return
    if (nodes.length === 0) return

    const cx = wh.w / 2
    const cy = wh.h / 2

    // Start all nodes at center with random velocities (splash effect)
    for (const n of nodes) {
      n.x = cx
      n.y = cy
      n.vx = (Math.random() - 0.5) * 20
      n.vy = (Math.random() - 0.5) * 20
    }

    const sim = forceSimulation<SimNode>(nodes)
      .force('charge', forceManyBody().strength(-160))
      .force('link', forceLink<SimNode, SimLink>(links).id((d) => d.id).distance(130).strength(0.06))
      .force('center', forceCenter(cx, cy).strength(0.015))
      .force('collide', forceCollide<SimNode>().radius((d) => Math.max(4, d.r * 0.4)).strength(0.1))
      .alphaDecay(0.015)
      .velocityDecay(0.3)
      .alpha(1)

    settledRef.current = true
    viewRef.current = { x: wh.w / 2 * (1 - 0.6), y: wh.h / 2 * (1 - 0.6), k: 0.6 }
    simRef.current = sim

    return () => {
      sim.stop()
      simRef.current = null
    }
  }, [nodes, links, wh])

  // Render loop
  useEffect(() => {
    if (!settledRef.current) return
    if (!wh.w || !wh.h) return
    let running = true

    function render() {
      if (!running) return
      const canvas = canvasRef.current
      const ctx = ctxRef.current
      if (!canvas || !ctx) { rafRef.current = requestAnimationFrame(render); return }

      const W = canvas.width = wh.w
      const H = canvas.height = wh.h
      const v = viewRef.current
      const drag = dragNodeRef.current

      ctx.clearRect(0, 0, W, H)
      const T = THEMES[theme]
      ctx.fillStyle = T.bg
      ctx.fillRect(0, 0, W, H)

      // Settling physics
      const settle = settleRef.current
      const sim = simRef.current
      const simActive = sim && sim.alpha() > 0.01

      if (drag) {
        // sim controls positions
      } else if (settle > 0 && sim) {
        sim.tick(1)
        settleRef.current = settle - 1
        if (settleRef.current === 0) {
          for (const n of nodes) { n.bx = n.x; n.by = n.y; n.vx = 0; n.vy = 0 }
          sim.stop()
          splashDoneRef.current = true
        }
      } else if (simActive) {
        // Splash settling - just render sim positions
      } else if (!splashDoneRef.current && settledRef.current) {
        // Splash just finished - save positions and start float
        for (const n of nodes) { n.bx = n.x; n.by = n.y; n.vx = 0; n.vy = 0 }
        splashDoneRef.current = true
      } else if (settledRef.current) {
        const t = Date.now() / 1000
        for (const n of nodes) {
          const p = n.id.charCodeAt(0) + n.id.charCodeAt(n.id.length - 1) * 3
          const s = 0.8 + (p % 5) * 0.15
          const amp = 5 + (p % 4) * 1.5
          n.x = n.bx + Math.sin(t * s + p) * amp + Math.sin(t * s * 0.6 + p * 2.1) * amp * 0.3
          n.y = n.by + Math.cos(t * s * 0.8 + p * 1.7) * amp + Math.cos(t * s * 0.4 + p * 3.3) * amp * 0.3
        }
      }

      ctx.save()
      ctx.translate(v.x, v.y)
      ctx.scale(v.k, v.k)

      const adj = adjRef.current
      const focus = focusNodeId ? 'sermon-' + focusNodeId : null
      const hovered = hoverRef.current

      // Compute neighborhood highlights
      const focusNeighbors1 = new Set<string>()
      const focusNeighbors2 = new Set<string>()
      if (focus && adj.has(focus)) {
        adj.get(focus)!.forEach(n => focusNeighbors1.add(n))
        focusNeighbors1.forEach(n => {
          if (adj.has(n)) {
            adj.get(n)!.forEach(n2 => {
              if (n2 !== focus && !focusNeighbors1.has(n2)) focusNeighbors2.add(n2)
            })
          }
        })
      }

      const hoverNeighbors = new Set<string>()
      if (hovered && adj.has(hovered)) {
        adj.get(hovered)!.forEach(n => hoverNeighbors.add(n))
      }

      const linkData = data.links
      const linkAlpha = new Float32Array(linkData.length)

      // Determine link emphasis
      for (let i = 0; i < linkData.length; i++) {
        const l = linkData[i]
        const s = l.source, t = l.target
        let la = 0.15
        if (hovered) {
          if (s === hovered || t === hovered) la = 0.8
          else if (hoverNeighbors.has(s) && hoverNeighbors.has(t)) la = 0.5
          else if (hoverNeighbors.has(s) || hoverNeighbors.has(t)) la = 0.15
          else la = 0
        }
        if (focus) {
          if (s === focus || t === focus) la = Math.max(la, 0.7)
          else if (focusNeighbors1.has(s) && focusNeighbors1.has(t)) la = Math.max(la, 0.45)
          else if (focusNeighbors1.has(s) || focusNeighbors1.has(t)) la = Math.max(la, 0.2)
          else if (!hovered) la = 0
        }
        if (sermonCentric && !hovered && !focus) {
          const aNode = nodes.find((n) => n.id === s)
          const bNode = nodes.find((n) => n.id === t)
          if (aNode?.type !== 'sermon' && bNode?.type !== 'sermon') {
            la = 0.02
          }
        }
        if (themeCentric && !hovered && !focus) {
          const aNode = nodes.find((n) => n.id === s)
          const bNode = nodes.find((n) => n.id === t)
          if (aNode?.type !== 'theme' && bNode?.type !== 'theme') {
            la = 0.02
          }
        }
        linkAlpha[i] = la
      }

      // Draw lines
      ctx.lineCap = 'round'
      for (let i = 0; i < linkData.length; i++) {
        const l = linkData[i]
        const a = nodes.find((n) => n.id === l.source)
        const b = nodes.find((n) => n.id === l.target)
        if (!a || !b) continue
        const la = linkAlpha[i]
        if (la < 0.01) continue
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = `${T.lineBase}${la * 0.7})`
        if (la > 0.5) ctx.lineWidth = 1
        else if (la > 0.1) ctx.lineWidth = 0.6
        else ctx.lineWidth = 0.4
        ctx.stroke()
      }

      // Draw nodes
      const selId = sel?.id
      for (const n of nodes) {
        const isF = focus === n.id
        const isH = hovered === n.id
        const isSel = selId === n.id
        const neighbor1 = focus ? focusNeighbors1.has(n.id) : hoverNeighbors.has(n.id)
        const neighbor2 = focus ? focusNeighbors2.has(n.id) : false
        const dim = (focus || hovered) && !isF && !isH && !neighbor1 && !neighbor2 && !isSel
        const isSermon = n.type === 'sermon'
        const isTheme = n.type === 'theme'
        const scDim = sermonCentric && !isSermon && !isF && !isH && !isSel
        const tcDim = themeCentric && !isTheme && !isF && !isH && !isSel

        const color = NODE_COLORS[n.type] || '#888'
        const radius = n.r
        let alpha = 0.6
        let glow = 0

        if (isF || isSel) { alpha = 1; glow = 0 }
        else if (isH) { alpha = 1; glow = 0 }
        else if (neighbor1) { alpha = 0.95 }
        else if (neighbor2) { alpha = 0.8 }
        else if (scDim || tcDim) { alpha = 0.1 }
        else if (dim) { alpha = 0.12 }
        else if (hovered) { alpha = 0.15 }
        else { alpha = 0.7 }

        // Main dot
        ctx.beginPath()
        ctx.arc(n.x, n.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.globalAlpha = alpha
        ctx.fill()
        ctx.globalAlpha = 1

        // White core for prominent nodes
        if (isF || isSel || isH) {
          ctx.beginPath()
          ctx.arc(n.x, n.y, radius * 0.5, 0, Math.PI * 2)
          ctx.fillStyle = '#ffffff'
          ctx.globalAlpha = 0.5
          ctx.fill()
          ctx.globalAlpha = 1
        }

        // Labels
        {
          const isProminent = isH || isF || isSel
          if (dim || (scDim && !neighbor1 && !neighbor2) || (tcDim && !neighbor1 && !neighbor2)) {
            ctx.globalAlpha = 0
          } else {
            const fontSize = Math.max(22, Math.min(34, (isProminent ? 28 : 24) * Math.min(1.3, v.k)))
            ctx.font = `${isProminent ? 600 : 500} ${fontSize}px sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            ctx.fillStyle = isProminent ? T.labelProminent : T.labelNormal
            ctx.globalAlpha = isProminent ? 1 : 0.85
            const label = n.label.length > 18 ? n.label.slice(0, 18) + '…' : n.label
            ctx.fillText(label, n.x, n.y + radius + 4)
          }
          ctx.globalAlpha = 1
        }
      }

      ctx.restore()
      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)
    return () => { running = false; cancelAnimationFrame(rafRef.current) }
  }, [wh, nodes, data.links, focusNodeId, sel, theme, sermonCentric, themeCentric])

  function findNode(px: number, py: number): SimNode | null {
    const v = viewRef.current
    const rx = (px - v.x) / v.k
    const ry = (py - v.y) / v.k
    let best: SimNode | null = null
    let bestD = 20 / v.k
    for (const n of nodes) {
      const dx = n.x - rx, dy = n.y - ry
      const d = Math.sqrt(dx * dx + dy * dy)
      const hitR = Math.max(n.r + 4, 8)
      if (d < hitR && d < bestD) { best = n; bestD = d }
    }
    return best
  }

  function handleDown(e: React.PointerEvent) {
    downRef.current = true
    movedRef.current = false
    const el = canvasRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const n = findNode(e.clientX - rect.left, e.clientY - rect.top)
    if (n) {
      dragNodeRef.current = n
      el.setPointerCapture(e.pointerId)
      const sim = simRef.current
      if (sim) {
        sim.alphaTarget(0.3).restart()
        const v = viewRef.current
        n.fx = (e.clientX - rect.left - v.x) / v.k
        n.fy = (e.clientY - rect.top - v.y) / v.k
      }
    } else {
      panStartRef.current = { x: e.clientX - viewRef.current.x, y: e.clientY - viewRef.current.y }
      el.setPointerCapture(e.pointerId)
    }
  }

  function handleMove(e: React.PointerEvent) {
    if (!downRef.current) return
    const el = canvasRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const drag = dragNodeRef.current
    if (drag) {
      movedRef.current = true
      const v = viewRef.current
      drag.fx = (e.clientX - rect.left - v.x) / v.k
      drag.fy = (e.clientY - rect.top - v.y) / v.k
    } else {
      movedRef.current = true
      viewRef.current.x = e.clientX - panStartRef.current.x
      viewRef.current.y = e.clientY - panStartRef.current.y
    }
  }

  function handleUp() {
    const sim = simRef.current
    const drag = dragNodeRef.current
    if (drag && sim) {
      drag.fx = null; drag.fy = null
      sim.alpha(0.4).alphaTarget(0)
      settleRef.current = 60
    }
    downRef.current = false
    dragNodeRef.current = null
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault()
    const el = canvasRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const mx = e.clientX - rect.left, my = e.clientY - rect.top
    const v = viewRef.current
    const k = v.k * (e.deltaY > 0 ? 0.88 : 1.12)
    const clamped = Math.max(0.1, Math.min(8, k))
    const scale = clamped / v.k
    v.x = mx - scale * (mx - v.x)
    v.y = my - scale * (my - v.y)
    v.k = clamped
  }

  function handleCanvasMove(e: React.MouseEvent) {
    if (downRef.current) return
    const el = canvasRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const n = findNode(e.clientX - rect.left, e.clientY - rect.top)
    hoverRef.current = n?.id || null
    canvasRef.current!.style.cursor = n ? 'pointer' : 'default'
  }

  function handleLeave() { hoverRef.current = null }

  function handleClick(e: React.MouseEvent) {
    if (movedRef.current) return
    const el = canvasRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const n = findNode(e.clientX - rect.left, e.clientY - rect.top)
    if (n) {
      const orig = data.nodes.find((d) => d.id === n.id)
      if (orig) {
        setSel(orig)
        onNodeClick?.(orig)
        // Find all sermons connected to this node
        const sermons: {id:string;label:string}[] = []
        const connected: {id:string;label:string;type:GraphNode['type']}[] = []
        for (const l of data.links) {
          const otherId = l.source === n.id ? l.target : l.target === n.id ? l.source : null
          if (otherId) {
            const sn = data.nodes.find((d) => d.id === otherId)
            if (sn) {
              if (sn.id.startsWith('sermon-') && !sermons.find((s) => s.id === sn.id)) {
                sermons.push({ id: sn.id, label: sn.label })
              } else if (!sn.id.startsWith('sermon-') && !connected.find((c) => c.id === sn.id)) {
                connected.push({ id: sn.id, label: sn.label, type: sn.type })
              }
            }
          }
        }
        setLinkedSermons(sermons)
        setConnectedNodes(connected)
      }
    } else {
      setSel(null)
      setLinkedSermons([])
      setConnectedNodes([])
    }
  }

  return (
    <div ref={wrapRef} className="relative w-full h-full overflow-hidden rounded-lg border border-border" style={{ background: THEMES[theme].bg }}>
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerLeave={handleLeave}
        onWheel={handleWheel}
        onMouseMove={handleCanvasMove}
        onClick={handleClick}
        style={{ touchAction: 'none' }}
      />
      {/* Theme toggle */}
      <button
        onClick={() => setTheme((t) => t === 'light' ? 'dark' : 'light')}
        className="absolute top-3 left-3 z-20 text-lg px-3 py-2 rounded-lg border shadow-sm transition-all hover:scale-105"
        style={{background: THEMES[theme].panelBg, borderColor: THEMES[theme].panelBorder, color: THEMES[theme].labelProminent}}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
      {/* Minimal subtle legend */}
      <div className="absolute bottom-3 left-3 flex items-center gap-4 pointer-events-none">
        {(['sermon','passage','theme','season','audience','series'] as const).map((k) => (
          <div key={k} className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
            <span className="w-3.5 h-3.5 rounded-full inline-block" style={{backgroundColor:NODE_COLORS[k]}}/>
            <span className="text-xs font-medium" style={{color: THEMES[theme].labelNormal}}>
              {k === 'sermon' ? '설교' : k === 'passage' ? '본문' : k === 'theme' ? '주제' : k === 'season' ? '절기' : k === 'audience' ? '회중' : '시리즈'}
            </span>
          </div>
        ))}
      </div>
      <div className="absolute bottom-3 right-3 text-[10px] pointer-events-none" style={{color: THEMES[theme].legendText}}>
        휠 확대 · 드래그 이동 · 노드 클릭
      </div>
      {/* Detail panel */}
      {sel && (
        <div className="absolute top-12 right-3 rounded-lg p-4 shadow-md w-64 z-10 border" style={{maxHeight: '75%', overflowY: 'auto', background: THEMES[theme].panelBg, borderColor: THEMES[theme].panelBorder}}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{backgroundColor:NODE_COLORS[sel.type]}}/>
              <span className="text-xs uppercase tracking-wider" style={{color: THEMES[theme].labelNormal}}>{sel.type === 'sermon' ? '설교' : sel.type === 'passage' ? '본문' : sel.type === 'theme' ? '주제' : sel.type === 'season' ? '절기' : sel.type === 'audience' ? '회중' : '시리즈'}</span>
            </div>
            <button onClick={() => { setSel(null); setLinkedSermons([]); setConnectedNodes([]) }} style={{color: THEMES[theme].labelNormal}} className="hover:opacity-70 text-xs leading-none">✕</button>
          </div>
          <p className="text-base font-semibold" style={{color: THEMES[theme].labelProminent}}>{sel.label}</p>
          {sel.type !== 'sermon' && linkedSermons.length > 0 && (
            <div className="mt-3 pt-3" style={{borderTopColor: THEMES[theme].panelBorder, borderTopWidth: 1, borderTopStyle: 'solid'}}>
              <p className="text-sm font-medium mb-1.5" style={{color: THEMES[theme].labelNormal}}>관련 설교 ({linkedSermons.length})</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {linkedSermons.map((s) => (
                  <button key={s.id} onClick={() => { const g = data.nodes.find(d => d.id === s.id); if (g) onNodeClick?.(g) }} style={{color: THEMES[theme].labelNormal}} className="text-sm truncate block w-full text-left hover:opacity-70 cursor-pointer">• {s.label}</button>
                ))}
              </div>
            </div>
          )}
          {sel.type === 'sermon' && connectedNodes.length > 0 && (
            <div className="mt-3 pt-3" style={{borderTopColor: THEMES[theme].panelBorder, borderTopWidth: 1, borderTopStyle: 'solid'}}>
              <p className="text-sm font-medium mb-1.5" style={{color: THEMES[theme].labelNormal}}>연결된 노드</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {connectedNodes.map((c) => (
                  <div key={c.id} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor:NODE_COLORS[c.type]}}/>
                    <span className="text-sm truncate" style={{color: THEMES[theme].labelNormal}}>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {sel.type === 'sermon' && (
            <button
              onClick={() => {
                const sermonId = sel.id.replace('sermon-', '')
                router.push(`/dashboard/sermons/${sermonId}`)
              }}
              className="mt-3 w-full text-sm py-2 rounded-md border transition-colors hover:opacity-80"
              style={{borderColor: THEMES[theme].panelBorder, color: THEMES[theme].labelProminent}}
            >
              설교 상세보기 →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
