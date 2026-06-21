'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  forceSimulation, forceManyBody, forceLink, forceCenter, forceCollide,
  type Simulation,
} from 'd3-force'
import { NOTE_TYPE_LABELS, NOTE_TYPE_DOTS, type NoteType, type NoteEntry } from '@/lib/advanced/notesData'

interface ConstellationNode {
  id: string
  label: string
  type: 'note' | 'scripture' | 'theme' | 'tag' | 'draft'
  noteType?: NoteType
  r: number
  x?: number
  y?: number
  vx?: number
  vy?: number
  fx?: number | null
  fy?: number | null
}

interface ConstellationLink {
  source: string
  target: string
  weight: number
  reason: string
}

interface ConstellationGraphProps {
  notes: NoteEntry[]
  draftText: string
  draftType: NoteType
  draftTags: string[]
  draftScripture: string[]
  onSelectNote: (id: string) => void
}

const TYPE_COLOR: Record<ConstellationNode['type'], string> = {
  note: '#f43f5e',
  scripture: '#f59e0b',
  theme: '#8b5cf6',
  tag: '#06b6d4',
  draft: '#10b981',
}

const TYPE_RADIUS: Record<ConstellationNode['type'], number> = {
  note: 8,
  scripture: 9,
  theme: 7,
  tag: 5,
  draft: 12,
}

export default function ConstellationGraph({ notes, draftText, draftType, draftTags, draftScripture, onSelectNote }: ConstellationGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const nodesRef = useRef<ConstellationNode[]>([])
  const linksRef = useRef<ConstellationLink[]>([])
  const simRef = useRef<Simulation<ConstellationNode, ConstellationLink> | null>(null)
  const nodeMapRef = useRef<Map<string, ConstellationNode>>(new Map())
  const sizeRef = useRef({ w: 400, h: 400 })
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null)
  const [, force] = useState(0)
  const [size, setSize] = useState({ w: 400, h: 400 })
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: ConstellationNode } | null>(null)

  const { nodeCount, linkCount } = useMemo(() => {
    const { nodes, links } = buildGraph(notes, draftText, draftType, draftTags, draftScripture)
    return { nodeCount: nodes.length, linkCount: links.length, _nodes: nodes, _links: links }
  }, [notes, draftText, draftType, draftTags, draftScripture])

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

  useEffect(() => {
    const { nodes, links } = buildGraph(notes, draftText, draftType, draftTags, draftScripture)
    simRef.current?.stop()

    const centerX = sizeRef.current.w / 2
    const centerY = sizeRef.current.h / 2

    const simNodes: ConstellationNode[] = nodes.map((n) => ({
      ...n,
      x: centerX + (Math.random() - 0.5) * 40,
      y: centerY + (Math.random() - 0.5) * 40,
      vx: 0, vy: 0, fx: null, fy: null,
    }))
    const nodeMap = new Map<string, ConstellationNode>()
    simNodes.forEach((n) => nodeMap.set(n.id, n))

    const simLinks: ConstellationLink[] = links.map((l) => ({ ...l }))

    nodesRef.current = simNodes
    linksRef.current = simLinks
    nodeMapRef.current = nodeMap

    if (simNodes.length === 0) {
      force((x) => x + 1)
      return
    }

    const sim = forceSimulation<ConstellationNode, ConstellationLink>(simNodes)
      .force('charge', forceManyBody<ConstellationNode>().strength((d) => (d.type === 'draft' ? -50 : -30)))
      .force('center', forceCenter(centerX, centerY).strength(0.3))
      .force('link', forceLink<ConstellationNode, ConstellationLink>(simLinks).id((d) => d.id).distance((l) => 50 + (1 - Math.min(1, l.weight)) * 30).strength(0.9))
      .force('collide', forceCollide<ConstellationNode>().radius((d) => d.r + 4))
      .alpha(0.7)
      .alphaDecay(0.035)
      .on('tick', () => force((x) => x + 1))

    simRef.current = sim

    return () => { sim.stop() }
  }, [notes, draftText, draftType, draftTags, draftScripture, size.w, size.h])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const onMove = (e: MouseEvent) => {
      const drag = dragRef.current
      if (drag) {
        const rect = svg.getBoundingClientRect()
        const node = nodeMapRef.current.get(drag.id)
        if (node) {
          node.fx = e.clientX - rect.left - drag.offsetX
          node.fy = e.clientY - rect.top - drag.offsetY
        }
        return
      }
      const target = (e.target as Element).closest('[data-node-id]') as Element | null
      if (target) {
        const id = target.getAttribute('data-node-id') || ''
        const rect = svg.getBoundingClientRect()
        setHoveredId(id)
        const node = nodeMapRef.current.get(id)
        if (node) {
          setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, node })
        }
      } else {
        setHoveredId(null)
        setTooltip(null)
      }
    }

    const onUp = () => {
      const drag = dragRef.current
      if (drag) {
        const node = nodeMapRef.current.get(drag.id)
        if (node && node.type !== 'draft') {
          node.fx = null
          node.fy = null
        }
        dragRef.current = null
      }
    }

    const onDown = (e: MouseEvent) => {
      const target = (e.target as Element).closest('[data-node-id]') as Element | null
      if (!target) return
      const id = target.getAttribute('data-node-id') || ''
      const node = nodeMapRef.current.get(id)
      if (!node) return
      const rect = svg.getBoundingClientRect()
      dragRef.current = {
        id,
        offsetX: e.clientX - rect.left - (node.x || 0),
        offsetY: e.clientY - rect.top - (node.y || 0),
      }
      node.fx = node.x
      node.fy = node.y
      simRef.current?.alpha(0.5).restart()
    }

    const onClick = (e: MouseEvent) => {
      const target = (e.target as Element).closest('[data-node-id]') as Element | null
      if (!target) return
      const id = target.getAttribute('data-node-id') || ''
      const node = nodeMapRef.current.get(id)
      if (node && node.type === 'note') onSelectNote(id)
    }

    svg.addEventListener('mousemove', onMove)
    svg.addEventListener('mousedown', onDown)
    svg.addEventListener('mouseup', onUp)
    svg.addEventListener('mouseleave', onUp)
    svg.addEventListener('click', onClick)
    return () => {
      svg.removeEventListener('mousemove', onMove)
      svg.removeEventListener('mousedown', onDown)
      svg.removeEventListener('mouseup', onUp)
      svg.removeEventListener('mouseleave', onUp)
      svg.removeEventListener('click', onClick)
    }
  }, [onSelectNote, nodeCount, linkCount])

  const nodes = nodesRef.current
  const links = linksRef.current
  const centerX = size.w / 2
  const centerY = size.h / 2

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <svg ref={svgRef} width={size.w} height={size.h} className="block">
        <defs>
          <radialGradient id="draftGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={TYPE_COLOR.draft} stopOpacity="0.35" />
            <stop offset="100%" stopColor={TYPE_COLOR.draft} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={size.w} height={size.h} fill="url(#draftGlow)" opacity="0.4" />
        <g>
          {links.map((l, i) => {
            const s = nodeMapRef.current.get(l.source)
            const t = nodeMapRef.current.get(l.target)
            if (!s || !t) return null
            const dim = hoveredId && l.source !== hoveredId && l.target !== hoveredId
            return (
              <line
                key={i}
                x1={s.x || 0}
                y1={s.y || 0}
                x2={t.x || 0}
                y2={t.y || 0}
                stroke={l.weight > 0.7 ? '#a78bfa' : '#475569'}
                strokeWidth={0.6 + l.weight * 1.6}
                strokeOpacity={dim ? 0.08 : 0.55}
                strokeDasharray={l.reason === '작성 중' ? '3 3' : undefined}
              />
            )
          })}
        </g>
        <g>
          {nodes.map((n) => {
            const dim = hoveredId && n.id !== hoveredId && !links.some((l) => (l.source === hoveredId && l.target === n.id) || (l.target === hoveredId && l.source === n.id))
            return (
              <g key={n.id} data-node-id={n.id} transform={`translate(${n.x || 0},${n.y || 0})`} style={{ cursor: n.type === 'note' ? 'pointer' : 'grab', opacity: dim ? 0.2 : 1, transition: 'opacity 200ms' }}>
                {n.type === 'draft' && (
                  <circle
                    r={n.r + 6}
                    fill="none"
                    stroke={TYPE_COLOR.draft}
                    strokeWidth={1}
                    opacity={0.5}
                  >
                    <animate attributeName="r" from={n.r + 4} to={n.r + 14} dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  r={n.r}
                  fill={TYPE_COLOR[n.type]}
                  fillOpacity={0.85}
                  stroke={n.type === 'draft' ? '#fff' : 'rgba(255,255,255,0.4)'}
                  strokeWidth={n.type === 'draft' ? 1.5 : 0.8}
                />
                <text
                  textAnchor="middle"
                  dy={n.r + 12}
                  fill={n.type === 'draft' ? '#a7f3d0' : '#cbd5e1'}
                  fontSize={9}
                  fontWeight={600}
                  paintOrder="stroke"
                  stroke="#04060f"
                  strokeWidth={3}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {n.label.length > 14 ? n.label.slice(0, 14) + '…' : n.label}
                </text>
              </g>
            )
          })}
        </g>
        {nodes.length === 0 && (
          <g transform={`translate(${centerX}, ${centerY})`}>
            <text textAnchor="middle" fontSize={11} fill="#475569" fontWeight={500}>
              <tspan x={0} dy={-4}>통찰을 작성하면</tspan>
              <tspan x={0} dy={16} fill="#94a3b8" fontWeight={700}>기록들과의 별자리가 그려집니다</tspan>
              <tspan x={0} dy={28} fontSize={9} fill="#475569">태그·본문을 추가하면 별들이 연결돼요</tspan>
            </text>
          </g>
        )}
      </svg>

      {tooltip && (
        <div
          className="absolute pointer-events-none z-10 bg-[#0c1020]/95 backdrop-blur-md border border-white/10 rounded-lg px-2.5 py-1.5 shadow-xl"
          style={{ left: tooltip.x + 12, top: tooltip.y + 12, maxWidth: 220 }}
        >
          <p className="text-[10px] font-bold text-slate-300">{tooltip.node.label}</p>
          <p className="text-[9px] text-slate-500 mt-0.5">
            {tooltip.node.type === 'draft' ? '작성 중인 통찰' :
              tooltip.node.type === 'note' ? (tooltip.node.noteType ? NOTE_TYPE_LABELS[tooltip.node.noteType] : '저장된 통찰') :
              tooltip.node.type === 'scripture' ? '성경 본문' :
              tooltip.node.type === 'theme' ? '주제' : '태그'}
          </p>
        </div>
      )}

      <div className="absolute bottom-2 left-2 flex flex-wrap gap-1.5 text-[9px]">
        {(['note', 'scripture', 'theme', 'tag', 'draft'] as const).map((t) => (
          <span key={t} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/40 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TYPE_COLOR[t] }} />
            {t === 'note' ? '통찰' : t === 'scripture' ? '본문' : t === 'theme' ? '주제' : t === 'tag' ? '태그' : '작성중'}
          </span>
        ))}
      </div>
    </div>
  )
}

function buildGraph(
  notes: NoteEntry[],
  draftText: string,
  draftType: NoteType,
  draftTags: string[],
  draftScripture: string[],
): { nodes: ConstellationNode[]; links: ConstellationLink[] } {
  const nodes: ConstellationNode[] = []
  const links: ConstellationLink[] = []
  const seen = new Set<string>()

  const addNode = (n: ConstellationNode) => {
    if (seen.has(n.id)) return
    seen.add(n.id)
    nodes.push(n)
  }

  const draftId = 'draft-current'
  const draftTitle = draftText.trim().split('\n')[0]?.slice(0, 30) || '작성 중인 통찰'
  addNode({ id: draftId, label: draftTitle, type: 'draft', noteType: draftType, r: TYPE_RADIUS.draft })

  draftScripture.forEach((s) => {
    const id = `scripture-${s}`
    addNode({ id, label: s, type: 'scripture', r: TYPE_RADIUS.scripture })
    links.push({ source: draftId, target: id, weight: 1, reason: '작성 중' })
  })

  draftTags.forEach((t) => {
    const id = `tag-${t}`
    addNode({ id, label: '#' + t, type: 'tag', r: TYPE_RADIUS.tag })
    links.push({ source: draftId, target: id, weight: 0.6, reason: '작성 중' })
  })

  const related = notes.slice(0, 20)
  related.forEach((n) => {
    addNode({ id: n.id, label: n.title, type: 'note', noteType: n.type, r: TYPE_RADIUS.note })

    const sharedScripture = n.connections.filter((c) => c.type === 'passage').map((c) => c.label).filter((l) => draftScripture.includes(l))
    sharedScripture.forEach((s) => {
      links.push({ source: n.id, target: `scripture-${s}`, weight: 0.9, reason: '공통 본문' })
    })

    const sharedTags = n.tags.filter((t) => draftTags.includes(t))
    sharedTags.forEach((t) => {
      links.push({ source: n.id, target: `tag-${t}`, weight: 0.7, reason: '공통 태그' })
    })

    if (sharedScripture.length === 0 && sharedTags.length === 0 && n.tags.length > 0) {
      const t = n.tags[0]
      if (!seen.has(`tag-${t}`)) addNode({ id: `tag-${t}`, label: '#' + t, type: 'tag', r: TYPE_RADIUS.tag })
      links.push({ source: n.id, target: `tag-${t}`, weight: 0.4, reason: '약한 연결' })
    }
  })

  return { nodes, links }
}
