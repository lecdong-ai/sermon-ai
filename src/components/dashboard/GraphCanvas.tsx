'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { GraphNode } from '@/lib/dashboard/types'
import { GRAPH_COLORS } from '@/lib/dashboard/constants'
import {
  forceSimulation, forceManyBody, forceLink,
  forceCenter, forceCollide,
} from 'd3-force'

const NODE_COLORS: Record<string, string> = GRAPH_COLORS

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

interface SimNode {
  id: string
  label: string
  type: GraphNode['type']
  color: string
  size: number
  sermonCount: number
  r: number
  fx: number | null
  fy: number | null
  x: number
  y: number
  vx: number
  vy: number
  index?: number
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
  const nodesRef = useRef<SimNode[]>([])
  const nodeMapRef = useRef<Map<string, SimNode>>(new Map())
  const linksRef = useRef<SimLink[]>([])
  const dataRef = useRef(data)
  const whRef = useRef(wh)
  const themeRef = useRef(theme)
  const sermonCentricRef = useRef(sermonCentric)
  const themeCentricRef = useRef(themeCentric)
  const focusNodeIdRef = useRef(focusNodeId)
  const selRef = useRef<GraphNode | null>(null)

  useEffect(() => {
    dataRef.current = data
    whRef.current = wh
    themeRef.current = theme
    sermonCentricRef.current = sermonCentric
    themeCentricRef.current = themeCentric
    focusNodeIdRef.current = focusNodeId
    selRef.current = sel
  }, [data, wh, theme, sermonCentric, themeCentric, focusNodeId, sel])

  useEffect(() => {
    const newNodes = data.nodes.map((n) => ({
      ...n,
      r: NODE_RADIUS[n.type] || 3,
      sermonCount: n.sermonCount || 0,
      x: 0, y: 0, vx: 0, vy: 0,
      fx: null, fy: null,
    }))
    nodesRef.current = newNodes
    nodeMapRef.current = new Map(newNodes.map(n => [n.id, n]))
    linksRef.current = data.links.map((l) => ({ source: l.source, target: l.target }))
  }, [data.nodes, data.links])

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
    const nodes = nodesRef.current
    const links = linksRef.current
    settledRef.current = false
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
  }, [wh, data])

  // Render loop (pauses when canvas not visible)
  useEffect(() => {
    let running = true
    let visible = true

    function render() {
      if (!running || !visible) { rafRef.current = requestAnimationFrame(render); return }
      const canvas = canvasRef.current
      const ctx = ctxRef.current
      if (!canvas || !ctx) { rafRef.current = requestAnimationFrame(render); return }

      const curWh = whRef.current
      if (!curWh.w || !curWh.h) { rafRef.current = requestAnimationFrame(render); return }

      const W = canvas.width = curWh.w
      const H = canvas.height = curWh.h
      const v = viewRef.current
      const drag = dragNodeRef.current
      const nodes = nodesRef.current
      const nodeMap = nodeMapRef.current
      const links = linksRef.current
      const currentData = dataRef.current

      ctx.clearRect(0, 0, W, H)
      const T = THEMES[themeRef.current]
      ctx.fillStyle = T.bg
      ctx.fillRect(0, 0, W, H)

      if (!settledRef.current || nodes.length === 0) {
        rafRef.current = requestAnimationFrame(render)
        return
      }

      // Continuous float offset (always active, smoothly blends with sim)
      const sim = simRef.current
      const simAlpha = sim ? sim.alpha() : 1
      const floatFactor = simAlpha < 0.01 ? 1 : Math.max(0, 1 - simAlpha * 3)

      const t = Date.now() / 1000
      const floatX = new Map<string, number>()
      const floatY = new Map<string, number>()
      for (const n of nodes) {
        if (drag && n.id === drag.id) { floatX.set(n.id, 0); floatY.set(n.id, 0); continue }
        const p = n.id.charCodeAt(0) + n.id.charCodeAt(n.id.length - 1) * 3
        const speed = 0.6 + (p % 5) * 0.12
        const amp = (8 + (p % 5) * 2.5) * floatFactor
        const phase = p * 0.7
        const fx = Math.sin(t * speed * 0.7 + phase) * amp * 0.8
                 + Math.sin(t * speed * 1.3 + phase * 2.1) * amp * 0.35
                 + Math.sin(t * speed * 2.1 + phase * 0.3) * amp * 0.15
        const fy = Math.cos(t * speed * 0.6 + phase * 1.3) * amp * 0.7
                 + Math.cos(t * speed * 1.1 + phase * 0.8) * amp * 0.4
                 + Math.cos(t * speed * 1.8 + phase * 2.5) * amp * 0.2
        floatX.set(n.id, fx)
        floatY.set(n.id, fy)
      }

      ctx.save()
      ctx.translate(v.x, v.y)
      ctx.scale(v.k, v.k)

      const adj = adjRef.current
      const focus = focusNodeIdRef.current ? 'sermon-' + focusNodeIdRef.current : null
      const hovered = hoverRef.current
      const selNode = selRef.current

      // Compute neighborhood highlights for focus/hover
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

      // Compute neighborhood highlights for selected (clicked) node
      const selNeighbors1 = new Set<string>()
      const selNeighbors2 = new Set<string>()
      const selNodeId = selNode ? selNode.id : null
      if (selNodeId && adj.has(selNodeId)) {
        adj.get(selNodeId)!.forEach(n => selNeighbors1.add(n))
        selNeighbors1.forEach(n => {
          if (adj.has(n)) {
            adj.get(n)!.forEach(n2 => {
              if (n2 !== selNodeId && !selNeighbors1.has(n2)) selNeighbors2.add(n2)
            })
          }
        })
      }

      // Merge focus and sel neighborhoods (sel takes priority when clicked)
      const activeNeighbors1 = new Set<string>(selNodeId ? selNeighbors1 : focusNeighbors1)
      const activeNeighbors2 = new Set<string>(selNodeId ? selNeighbors2 : focusNeighbors2)
      const activeFocus = selNodeId || focus

      const linkData = currentData.links
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
        if (activeFocus) {
          if (s === activeFocus || t === activeFocus) la = Math.max(la, 0.7)
          else if (activeNeighbors1.has(s) && activeNeighbors1.has(t)) la = Math.max(la, 0.45)
          else if (activeNeighbors1.has(s) || activeNeighbors1.has(t)) la = Math.max(la, 0.2)
          else if (!hovered) la = 0
        }
        if (sermonCentricRef.current && !hovered && !activeFocus) {
          const aNode = nodeMap.get(s)
          const bNode = nodeMap.get(t)
          if (aNode?.type !== 'sermon' && bNode?.type !== 'sermon') {
            la = 0.02
          }
        }
        if (themeCentricRef.current && !hovered && !activeFocus) {
          const aNode = nodeMap.get(s)
          const bNode = nodeMap.get(t)
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
        const a = nodeMap.get(l.source)
        const b = nodeMap.get(l.target)
        if (!a || !b) continue
        const la = linkAlpha[i]
        if (la < 0.01) continue
        const afx = floatX.get(a.id) || 0, afy = floatY.get(a.id) || 0
        const bfx = floatX.get(b.id) || 0, bfy = floatY.get(b.id) || 0
        ctx.beginPath()
        ctx.moveTo(a.x + afx, a.y + afy)
        ctx.lineTo(b.x + bfx, b.y + bfy)
        ctx.strokeStyle = `${T.lineBase}${la * 0.7})`
        if (la > 0.5) ctx.lineWidth = 1
        else if (la > 0.1) ctx.lineWidth = 0.6
        else ctx.lineWidth = 0.4
        ctx.stroke()
      }

      // Draw nodes
      const selId = selRef.current?.id
      for (const n of nodes) {
        const isF = activeFocus === n.id
        const isH = hovered === n.id
        const isSel = selId === n.id
        const hasFocus = activeFocus !== null
        const hasHover = hovered !== null
        const hasSel = selNode !== null
        const neighbor1 = hasHover ? hoverNeighbors.has(n.id) : activeNeighbors1.has(n.id)
        const neighbor2 = hasHover ? false : activeNeighbors2.has(n.id)
        const dim = (hasFocus || hasHover || hasSel) && !isF && !isH && !neighbor1 && !neighbor2 && !isSel
        const isSermon = n.type === 'sermon'
        const isTheme = n.type === 'theme'

        const color = NODE_COLORS[n.type] || '#888'
        const radius = n.r
        let alpha = 0.6
        let glow = 0

        const scActive = sermonCentricRef.current && !isSermon && !isF && !isH && !isSel
        const tcActive = themeCentricRef.current && !isTheme && !isF && !isH && !isSel
        const hasViewMode = sermonCentricRef.current || themeCentricRef.current

        if (isF || isSel) { alpha = 1; glow = 0 }
        else if (isH) { alpha = 1; glow = 0 }
        else if (neighbor1) { alpha = 0.95 }
        else if (neighbor2) { alpha = 0.8 }
        else if (scActive || tcActive) { alpha = 0.08 }
        else if (dim && hasViewMode) { alpha = 0.12 }
        else if (hovered) { alpha = 0.15 }
        else { alpha = 0.7 }

        // Main dot
        const nx = n.x + (floatX.get(n.id) || 0)
        const ny = n.y + (floatY.get(n.id) || 0)
        ctx.beginPath()
        ctx.arc(nx, ny, radius, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.globalAlpha = alpha
        ctx.fill()
        ctx.globalAlpha = 1

        // White core for prominent nodes
        if (isF || isSel || isH) {
          ctx.beginPath()
          ctx.arc(nx, ny, radius * 0.5, 0, Math.PI * 2)
          ctx.fillStyle = '#ffffff'
          ctx.globalAlpha = 0.5
          ctx.fill()
          ctx.globalAlpha = 1
        }

        // Labels
        {
          const isProminent = isH || isF || isSel
          if (scActive || tcActive || (dim && hasViewMode)) {
            ctx.globalAlpha = 0
          } else {
            const fontSize = Math.max(22, Math.min(34, (isProminent ? 28 : 24) * Math.min(1.3, v.k)))
            ctx.font = `${isProminent ? 600 : 500} ${fontSize}px sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            ctx.fillStyle = isProminent ? T.labelProminent : T.labelNormal
            ctx.globalAlpha = isProminent ? 1 : 0.85
            const label = n.label.length > 18 ? n.label.slice(0, 18) + '…' : n.label
            ctx.fillText(label, nx, ny + radius + 4)
          }
          ctx.globalAlpha = 1
        }
      }

      ctx.restore()
      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    }, { threshold: 0.1 })

    if (canvasRef.current) observer.observe(canvasRef.current)

    return () => {
      running = false
      cancelAnimationFrame(rafRef.current)
      observer.disconnect()
    }
  }, [])

  function findNode(px: number, py: number): SimNode | null {
    const v = viewRef.current
    const rx = (px - v.x) / v.k
    const ry = (py - v.y) / v.k
    let best: SimNode | null = null
    let bestD = 20 / v.k
    for (const n of nodesRef.current) {
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
      sim.alphaTarget(0)
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
      const orig = dataRef.current.nodes.find((d) => d.id === n.id)
      if (orig) {
        setSel(orig)
        onNodeClick?.(orig)
        const sermons: {id:string;label:string}[] = []
        const connected: {id:string;label:string;type:GraphNode['type']}[] = []
        for (const l of dataRef.current.links) {
          const otherId = l.source === n.id ? l.target : l.target === n.id ? l.source : null
          if (otherId) {
            const sn = dataRef.current.nodes.find((d) => d.id === otherId)
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
                  <button key={s.id} onClick={() => { const id = s.id.replace('sermon-', ''); router.push(`/dashboard/sermons/${id}`) }} style={{color: THEMES[theme].labelNormal}} className="text-sm truncate block w-full text-left hover:opacity-70 cursor-pointer">• {s.label}</button>
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
