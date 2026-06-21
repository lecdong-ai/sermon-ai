'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AppSectionHeader } from '@/components/advanced/shared'
import { GRAPH_NODES, GRAPH_EDGES, NODE_COLORS, NODE_COLORS_BG, NODE_LABELS, getNodeConnections, getNeighborIds } from '@/lib/advanced/graphData'
import type { GraphNode, GraphEdge, NodeType } from '@/lib/advanced/graphData'

const NODE_TYPES: NodeType[] = ['sermon', 'passage', 'theme', 'word', 'note', 'series']

type FocusMode = 'full' | 'project' | 'passage' | 'theme' | 'note'

const FOCUS_MODE_LABELS: Record<FocusMode, string> = {
  full: '전체 그래프',
  project: '프로젝트 중심',
  passage: '본문 중심',
  theme: '주제 중심',
  note: '통찰 중심',
}

const FOCUS_MODE_DESCRIPTIONS: Record<FocusMode, string> = {
  full: '모든 노드를 표시합니다',
  project: '현재 작업 중인 설교와 연결된 노드만 표시합니다',
  passage: '선택한 본문과 연결된 노드만 표시합니다',
  theme: '선택한 주제와 연결된 노드만 표시합니다',
  note: '선택한 통찰과 직접 연결된 노드만 표시합니다',
}

/* ─── Helpers ─── */

function getExplanation(source: GraphNode, target: GraphNode, edge: GraphEdge): string {
  const labelMap: Record<string, string> = {
    '본문': '이 설교의 본문으로 사용됩니다',
    '연결': '개념적으로 연결됩니다',
    '강조': '이 주제를 강조합니다',
    '관련': '관련된 주제입니다',
    '원어': '이 본문에 등장하는 원어입니다',
    '평행': '평행 본문으로 연결됩니다',
    '소속': '이 시리즈에 속한 설교입니다',
    '범위': '이 시리즈가 다루는 본문입니다',
    '참조': '참조하는 관계입니다',
  }
  return labelMap[edge.label] || `${edge.label} 관계로 연결됩니다`
}

function getSuggestedConnections(nodes: GraphNode[], edges: GraphEdge[], maxResults = 6): { source: GraphNode; target: GraphNode; sharedNeighbors: string[] }[] {
  const nodeIds = new Set(nodes.map(n => n.id))
  const edgeSet = new Set(edges.map(e => `${e.source}-${e.target}`))
  const neighborMap = new Map<string, Set<string>>()
  nodes.forEach(n => {
    neighborMap.set(n.id, new Set(getNeighborIds(n.id, edges)))
  })

  const suggestions: { source: GraphNode; target: GraphNode; sharedNeighbors: string[] }[] = []
  const seen = new Set<string>()

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j]
      if (a.type === b.type) continue
      const key = `${a.id}-${b.id}`
      if (seen.has(key)) continue
      seen.add(key)
      seen.add(`${b.id}-${a.id}`)

      const hasDirect = edgeSet.has(`${a.id}-${b.id}`) || edgeSet.has(`${b.id}-${a.id}`)
      if (hasDirect) continue

      const neighborsA = neighborMap.get(a.id) || new Set()
      const neighborsB = neighborMap.get(b.id) || new Set()
      const shared = Array.from(neighborsA).filter(n => neighborsB.has(n))

      if (shared.length >= 2) {
        suggestions.push({ source: a, target: b, sharedNeighbors: shared })
      }
    }
  }

  suggestions.sort((a, b) => b.sharedNeighbors.length - a.sharedNeighbors.length)
  return suggestions.slice(0, maxResults)
}

export default function GraphPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 })
  const [filterTypes, setFilterTypes] = useState<Set<NodeType>>(new Set<NodeType>(['sermon', 'passage', 'theme', 'word', 'note', 'series']))
  const [focusMode, setFocusMode] = useState<FocusMode>('full')
  const [focusCenterId, setFocusCenterId] = useState('')
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [realNodes, setRealNodes] = useState<GraphNode[]>([])
  const [realEdges, setRealEdges] = useState<GraphEdge[]>([])
  const [loading, setLoading] = useState(true)
  const isDark = true

  // Fetch real graph data
  useEffect(() => {
    setLoading(true)
    fetch('/api/graph')
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          setRealNodes(json.data.nodes)
          setRealEdges(json.data.edges)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Auto-select node from ?focus= query param (링크로 들어온 경우)
  // 노트 타입이면 자동으로 'note' focus mode 활성화
  const focusId = searchParams.get('focus')
  useEffect(() => {
    if (!focusId || realNodes.length === 0) return
    const node = realNodes.find((n) => n.id === focusId)
    if (!node) return
    setSelectedNode(node)
    if (node.type === 'note') {
      setFocusMode('note')
      setFocusCenterId(node.id)
    } else if (node.type === 'sermon') {
      setFocusMode('project')
      setFocusCenterId(node.id)
    } else if (node.type === 'passage') {
      setFocusMode('passage')
      setFocusCenterId(node.id)
    } else if (node.type === 'theme') {
      setFocusMode('theme')
      setFocusCenterId(node.id)
    }
  }, [focusId, realNodes])

  // All data comes from the API; no mock fallback
  const allNodes = realNodes
  const allEdges = realEdges

  // Set first real sermon as default for 'project' focus
  const firstRealSermonId = useMemo(() => {
    const sermon = allNodes.find(n => n.type === 'sermon')
    return sermon?.id || null
  }, [allNodes])

  // Reset focusCenterId when focusMode changes
  const handleFocusMode = useCallback((mode: FocusMode) => {
    setFocusMode(mode)
    if (mode === 'project' && firstRealSermonId) {
      setFocusCenterId(firstRealSermonId)
    } else if (mode === 'passage') {
      const firstPassage = allNodes.find(n => n.type === 'passage')
      setFocusCenterId(firstPassage?.id || '')
    } else if (mode === 'theme') {
      const firstTheme = allNodes.find(n => n.type === 'theme')
      setFocusCenterId(firstTheme?.id || '')
    } else if (mode === 'note') {
      const firstNote = allNodes.find(n => n.type === 'note')
      setFocusCenterId(firstNote?.id || '')
    }
  }, [firstRealSermonId, allNodes])

  const focusCenterNode = useMemo(() => {
    if (focusMode === 'project' || focusMode === 'passage' || focusMode === 'theme' || focusMode === 'note') {
      return allNodes.find(n => n.id === focusCenterId) || null
    }
    return null
  }, [focusMode, focusCenterId, allNodes])

  const filteredNodes = useMemo(() => {
    let nodes = allNodes.filter(n => filterTypes.has(n.type))

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      nodes = nodes.filter(n =>
        n.label.toLowerCase().includes(q) ||
        n.subtitle.toLowerCase().includes(q) ||
        n.detail.toLowerCase().includes(q)
      )
    }

    if (focusMode === 'project') {
      const centerId = focusCenterId || (allNodes.find(n => n.type === 'sermon')?.id || '')
      if (centerId) {
        const neighbors = new Set(getNeighborIds(centerId, allEdges))
        neighbors.add(centerId)
        nodes = nodes.filter(n => neighbors.has(n.id))
      }
    } else if ((focusMode === 'passage' || focusMode === 'theme' || focusMode === 'note') && focusCenterId) {
      const neighbors = new Set(getNeighborIds(focusCenterId, allEdges))
      neighbors.add(focusCenterId)
      nodes = nodes.filter(n => neighbors.has(n.id))
    }

    return nodes
  }, [filterTypes, focusMode, focusCenterId, searchQuery, allNodes, allEdges])

  const filteredEdges = useMemo(() => {
    const ids = new Set(filteredNodes.map(n => n.id))
    return allEdges.filter(e => ids.has(e.source) && ids.has(e.target))
  }, [filteredNodes, allEdges])

  // Resize observer
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      if (width > 0 && height > 0) setContainerSize({ width, height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const toggleFilter = useCallback((type: NodeType) => {
    setFilterTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }, [])

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    NODE_TYPES.forEach(t => { c[t] = allNodes.filter(n => n.type === t).length })
    return c
  }, [allNodes])

  const neighborIds = useMemo(() => {
    if (!selectedNode) return new Set<string>()
    return new Set(getNeighborIds(selectedNode.id, filteredEdges))
  }, [selectedNode, filteredEdges])

  const focusCenterOptions = useMemo(() => {
    if (focusMode === 'passage') {
      return allNodes.filter(n => n.type === 'passage')
    }
    if (focusMode === 'theme') {
      return allNodes.filter(n => n.type === 'theme')
    }
    if (focusMode === 'project') {
      return allNodes.filter(n => n.type === 'sermon')
    }
    if (focusMode === 'note') {
      return allNodes.filter(n => n.type === 'note')
    }
    return []
  }, [focusMode, allNodes])

  return (
    <div className="flex h-full">
      {/* Left: Filter Panel */}
      <aside className={`w-56 shrink-0 border-r flex flex-col overflow-y-auto scrollbar-thin ${isDark ? 'border-white/5 bg-[#111118]' : 'border-paper-200 bg-paper-50/50'}`}>
        <div className={`p-4 border-b ${isDark ? 'border-white/5' : 'border-paper-200'}`}>
          <div className={`flex items-center gap-1 text-[10px] mb-3 ${isDark ? 'text-white/25' : 'text-paper-400'}`}>
            <button onClick={() => router.push('/advanced')} className={`${isDark ? 'hover:text-green-400' : 'hover:text-green-600'} transition-colors`}>지식 연결</button>
            <span className={isDark ? 'text-white/15' : 'text-paper-300'}>/</span>
            <span className={`font-medium ${isDark ? 'text-white/50' : 'text-paper-600'}`}>그래프</span>
          </div>
          <h3 className={`text-[10px] font-semibold uppercase tracking-widest mb-3 ${isDark ? 'text-white/25' : 'text-paper-400'}`}>노드 필터</h3>
          <div className="space-y-1.5">
            {NODE_TYPES.map(type => (
              <label key={type} className={`flex items-center gap-2.5 cursor-pointer group px-2 py-1.5 rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-paper-100'} transition-colors`}>
                <input type="checkbox" checked={filterTypes.has(type)}
                  onChange={() => toggleFilter(type)}
                  className="w-3.5 h-3.5 rounded border-paper-300 focus:ring-0 focus:ring-offset-0"
                  style={{ accentColor: NODE_COLORS[type] }} />
                <span className={`w-2.5 h-2.5 rounded-full ${NODE_COLORS_BG[type]}`} />
                <span className={`text-xs flex-1 ${isDark ? 'text-white/60' : 'text-paper-700'}`}>{NODE_LABELS[type]}</span>
                <span className={`text-[10px] ${isDark ? 'text-white/25' : 'text-paper-400'}`}>{counts[type]}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={`p-4 border-b ${isDark ? 'border-white/5' : 'border-paper-200'}`}>
          <h3 className={`text-[10px] font-semibold uppercase tracking-widest mb-2 ${isDark ? 'text-white/25' : 'text-paper-400'}`}>집중 모드</h3>
          <div className="space-y-1">
            {(Object.keys(FOCUS_MODE_LABELS) as FocusMode[]).map(mode => (
              <button key={mode} onClick={() => handleFocusMode(mode)}
                className={`w-full text-xs px-3 py-2 rounded-lg transition-colors text-left ${
                  focusMode === mode ? (isDark ? 'bg-green-900/30 text-green-400 font-medium' : 'bg-green-100 text-green-700 font-medium') : (isDark ? 'text-white/50 hover:bg-white/5' : 'text-paper-600 hover:bg-paper-100')
                }`}>
                {focusMode === mode && '✓ '}{FOCUS_MODE_LABELS[mode]}
              </button>
            ))}
          </div>
        </div>

        {/* Focus center selector */}
        {(focusMode === 'project' || focusMode === 'passage' || focusMode === 'theme' || focusMode === 'note') && (
          <div className={`p-4 border-b ${isDark ? 'border-white/5' : 'border-paper-200'}`}>
            <h3 className={`text-[10px] font-semibold uppercase tracking-widest mb-2 ${isDark ? 'text-white/25' : 'text-paper-400'}`}>
              {focusMode === 'project' ? '프로젝트 선택' : focusMode === 'passage' ? '본문 선택' : focusMode === 'theme' ? '주제 선택' : '통찰 선택'}
            </h3>
            {focusCenterOptions.length > 0 ? (
              <select value={focusCenterId} onChange={e => setFocusCenterId(e.target.value)}
                className={`w-full text-xs border rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-green-400 ${isDark ? 'border-white/10 bg-[#1a1a28] text-white/60' : 'border-paper-200 bg-white text-paper-700'}`}>
                {focusCenterOptions.map(n => (
                  <option key={n.id} value={n.id}>{n.label}</option>
                ))}
              </select>
            ) : (
              <p className={`text-xs ${isDark ? 'text-white/25' : 'text-paper-400'}`}>표시할 항목이 없습니다</p>
            )}
            {focusCenterNode && (
              <p className={`text-[10px] mt-1.5 leading-relaxed ${isDark ? 'text-white/25' : 'text-paper-400'}`}>{focusCenterNode.detail.slice(0, 60)}…</p>
            )}
          </div>
        )}

        <div className="p-4">
          <h3 className={`text-[10px] font-semibold uppercase tracking-widest mb-2 ${isDark ? 'text-white/25' : 'text-paper-400'}`}>범례</h3>
          <div className="space-y-1.5">
            {NODE_TYPES.map(type => (
              <div key={type} className={`flex items-center gap-2 text-[11px] ${isDark ? 'text-white/40' : 'text-paper-500'}`}>
                <span className={`w-2 h-2 rounded-full ${NODE_COLORS_BG[type]}`} />
                <span>{NODE_LABELS[type]}</span>
                <span className={isDark ? 'text-white/15' : 'text-paper-300'}>·</span>
                <span className={isDark ? 'text-white/25' : 'text-paper-400'}>{counts[type]}개</span>
              </div>
            ))}
          </div>
          <div className={`mt-3 pt-3 border-t ${isDark ? 'border-white/5' : 'border-paper-200'} text-[10px] leading-relaxed ${isDark ? 'text-white/25' : 'text-paper-400'}`}>
            <p>클릭: 노드 선택</p>
            <p>드래그: 노드 이동</p>
            <p>휠: 확대/축소</p>
            <p>배경드래그: 이동</p>
          </div>
        </div>
      </aside>

      {/* Center: Graph Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Toolbar */}
        <div className={`flex items-center gap-3 px-4 py-2 border-b shrink-0 ${isDark ? 'border-white/5 bg-[#111118]' : 'border-paper-200 bg-white'}`}>
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <svg className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isDark ? 'text-white/20' : 'text-paper-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="노드 검색..."
              className={`w-full text-xs border rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-400 ${isDark ? 'border-white/10 bg-[#1a1a28] text-white/60 placeholder:text-white/20' : 'border-paper-200 bg-paper-50 text-paper-700 placeholder:text-paper-400'}`} />
          </div>

          {/* Focus mode tabs */}
          <div className={`flex items-center gap-0.5 rounded-lg p-0.5 ${isDark ? 'bg-white/5' : 'bg-paper-100'}`}>
            {(Object.keys(FOCUS_MODE_LABELS) as FocusMode[]).map(mode => (
              <button key={mode} onClick={() => handleFocusMode(mode)}
                className={`text-[10px] px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                  focusMode === mode ? (isDark ? 'bg-[#1a1a28] text-green-400 font-medium shadow-sm' : 'bg-white text-green-700 font-medium shadow-sm') : (isDark ? 'text-white/35 hover:text-white/50' : 'text-paper-500 hover:text-paper-700')
                }`}>
                {FOCUS_MODE_LABELS[mode]}
              </button>
            ))}
          </div>

          <span className={`text-[10px] ${isDark ? 'text-white/20' : 'text-paper-400'}`}>·</span>
          <span className={`text-[10px] ${isDark ? 'text-white/30' : 'text-paper-400'}`}>{loading ? '로딩 중...' : `${filteredNodes.length}개 노드 · ${filteredEdges.length}개 관계`}</span>

          <div className="flex-1" />

          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <button onClick={() => { const el = containerRef.current?.querySelector('svg'); if (el) el.dispatchEvent(new WheelEvent('wheel', { deltaY: -100 })) }}
              className="p-1 rounded transition-colors hover:bg-white/10 text-white/35">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
            <button onClick={() => { const el = containerRef.current?.querySelector('svg'); if (el) el.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 })) }}
              className="p-1 rounded transition-colors hover:bg-white/10 text-white/35">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
            </button>
          </div>
        </div>

        {/* Focus mode description */}
        {focusMode !== 'full' && (
          <div className={`px-4 py-1.5 border-b text-[10px] ${isDark ? 'bg-green-900/20 border-green-800/30 text-green-400' : 'bg-green-50/50 border-green-100 text-green-600'}`}>
            {FOCUS_MODE_DESCRIPTIONS[focusMode]}
            {focusCenterNode && (
              <span> 현재 중심: <strong>{focusCenterNode.label}</strong></span>
            )}
          </div>
        )}

        {/* Canvas */}
        {loading ? (
          <div className={`flex-1 flex items-center justify-center ${isDark ? 'bg-[#0d0d12]' : 'bg-paper-50/30'}`}>
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-paper-400">그래프 데이터를 불러오는 중...</p>
            </div>
          </div>
        ) : filteredNodes.length === 0 ? (
          <div className={`flex-1 flex items-center justify-center ${isDark ? 'bg-[#0d0d12]' : 'bg-paper-50/30'}`}>
            <div className="text-center">
              <p className="text-sm text-paper-400">표시할 노드가 없습니다</p>
              <button onClick={() => { setFilterTypes(new Set<NodeType>(['sermon', 'passage', 'theme', 'word', 'note', 'series'])); setSearchQuery('') }}
                className="text-xs text-green-600 hover:underline mt-2 inline-block">
                모든 필터 활성화
              </button>
            </div>
          </div>
        ) : (
          <GraphCanvas
            containerRef={containerRef}
            width={containerSize.width}
            height={containerSize.height}
            nodes={filteredNodes}
            edges={filteredEdges}
            selectedNodeId={selectedNode?.id || null}
            hoveredNodeId={hoveredNode}
            neighborIds={neighborIds}
            onSelectNode={setSelectedNode}
            onHoverNode={setHoveredNode}
            theme="dark"
          />
        )}
      </div>

      {/* Right: Node Detail */}
      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          edges={filteredEdges}
          allNodes={filteredNodes}
          onClose={() => setSelectedNode(null)}
          onNavigate={(id) => {
            const n = filteredNodes.find(n => n.id === id)
            if (n) setSelectedNode(n)
          }}
          router={router}
          theme="dark"
        />
      )}
    </div>
  )
}

/* ─── Graph Canvas ─── */

interface SimState {
  id: string
  x: number; y: number
  vx: number; vy: number
  pinned: boolean
}

const GraphCanvas = ({
  containerRef, width, height, nodes, edges, selectedNodeId, hoveredNodeId, neighborIds,
  onSelectNode, onHoverNode, theme = 'dark',
}: {
  containerRef: React.RefObject<HTMLDivElement>
  width: number; height: number
  nodes: GraphNode[]; edges: GraphEdge[]
  selectedNodeId: string | null; hoveredNodeId: string | null
  neighborIds: Set<string>
  onSelectNode: (n: GraphNode | null) => void
  onHoverNode: (id: string | null) => void
  theme?: 'light' | 'dark'
}) => {
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({})
  const simRef = useRef<Map<string, SimState>>(new Map())
  const prevNodeIds = useRef<string>('')
  const [viewTransform, setViewTransform] = useState({ x: 0, y: 0, scale: 1 })
  const svgRef = useRef<SVGSVGElement>(null)
  const dragState = useRef<{ type: 'node' | 'pan' | null; nodeId?: string; startX: number; startY: number; origX?: number; origY?: number } | null>(null)
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null)

  const nodeIds = nodes.map(n => n.id).sort().join(',')

  // Refs for mutable values used in continuous rAF loop
  const nodesRef = useRef(nodes)
  nodesRef.current = nodes
  const edgesRef = useRef(edges)
  edgesRef.current = edges
  const widthRef = useRef(width)
  widthRef.current = width
  const heightRef = useRef(height)
  heightRef.current = height
  const alphaRef = useRef(0.6)
  const rafRef = useRef<number>(0)

  // Initialize positions when nodes change
  useEffect(() => {
    if (!width || !height || nodes.length === 0) return
    if (prevNodeIds.current === nodeIds) return
    prevNodeIds.current = nodeIds

    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) * 0.35
    const existing = simRef.current
    const map = new Map<string, SimState>()

    nodes.forEach((node, i) => {
      const prev = existing.get(node.id)
      const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2
      map.set(node.id, prev ? { ...prev, pinned: false } : {
        id: node.id,
        x: centerX + radius * Math.cos(angle) + (Math.random() - 0.5) * 50,
        y: centerY + radius * Math.sin(angle) + (Math.random() - 0.5) * 50,
        vx: 0, vy: 0,
        pinned: false,
      })
    })
    simRef.current = map

    const initial: Record<string, { x: number; y: number }> = {}
    nodes.forEach(n => {
      const s = map.get(n.id)
      if (s) initial[n.id] = { x: s.x, y: s.y }
    })
    setPositions(initial)
    alphaRef.current = 1
  }, [nodeIds, width, height])

  // Continuous rAF simulation — pauses when not visible
  useEffect(() => {
    const ALPHA_DECAY = 0.98
    const ALPHA_AT_REST = 0.001
    let frameCount = 0
    let visible = true

    function tick() {
      if (!visible) { rafRef.current = requestAnimationFrame(tick); return }
      frameCount++
      const currentMap = simRef.current
      if (currentMap.size === 0) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      const alpha = alphaRef.current
      const entries = Array.from(currentMap.values())
      const cX = widthRef.current / 2
      const cY = heightRef.current / 2

      if (alpha > ALPHA_AT_REST) {
        entries.forEach(e => { e.vx *= 0.6; e.vy *= 0.6 })

        const REPULSION = 1600
        const ATTRACTION = 0.01
        const IDEAL_LENGTH = 85
        const GRAVITY = 0.005

        for (let i = 0; i < entries.length; i++) {
          for (let j = i + 1; j < entries.length; j++) {
            const a = entries[i], b = entries[j]
            if (a.pinned && b.pinned) continue
            const dx = a.x - b.x, dy = a.y - b.y
            const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 10)
            const force = REPULSION / (dist * dist) * alpha
            const fx = (dx / dist) * force, fy = (dy / dist) * force
            if (!a.pinned) { a.vx += fx; a.vy += fy }
            if (!b.pinned) { b.vx -= fx; b.vy -= fy }
          }
        }

        const currentEdges = edgesRef.current
        currentEdges.forEach(edge => {
          const s = currentMap.get(edge.source), t = currentMap.get(edge.target)
          if (!s || !t || (s.pinned && t.pinned)) return
          const dx = s.x - t.x, dy = s.y - t.y
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 10)
          const force = (dist - IDEAL_LENGTH) * ATTRACTION * alpha * edge.weight
          const fx = (dx / dist) * force, fy = (dy / dist) * force
          if (!s.pinned) { s.vx -= fx; s.vy -= fy }
          if (!t.pinned) { t.vx += fx; t.vy += fy }
        })

        entries.forEach(e => {
          if (!e.pinned) {
            e.vx += (cX - e.x) * GRAVITY * alpha
            e.vy += (cY - e.y) * GRAVITY * alpha
          }
        })

        entries.forEach(e => {
          if (!e.pinned) { e.x += e.vx; e.y += e.vy }
        })

        alphaRef.current *= ALPHA_DECAY
      } else {
        // Obsidian-like: almost static, barely perceptible drift
        const t = frameCount * 0.003
        entries.forEach(e => {
          if (!e.pinned) {
            const phase = e.id.charCodeAt(3) * 0.7
            // Tiny direct position offset — no velocity accumulation
            e.x += Math.sin(t + phase) * 0.03
            e.y += Math.cos(t * 0.8 + phase) * 0.02
            // Very gentle centering
            e.x += (cX - e.x) * 0.0001
            e.y += (cY - e.y) * 0.0001
          }
        })
      }

      if (frameCount % 2 === 0) {
        const next: Record<string, { x: number; y: number }> = {}
        currentMap.forEach((v, k) => { next[k] = { x: v.x, y: v.y } })
        setPositions(next)
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    }, { threshold: 0.1 })

    if (svgRef.current) observer.observe(svgRef.current)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      observer.disconnect()
    }
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as SVGElement
    const nodeGroup = target.closest('[data-node-id]') as SVGElement | null
    if (nodeGroup) {
      const id = nodeGroup.getAttribute('data-node-id')!
      const s = simRef.current.get(id)
      if (s) {
        dragState.current = { type: 'node', nodeId: id, startX: e.clientX, startY: e.clientY, origX: s.x, origY: s.y }
        s.pinned = true
        // Wake up physics gently — connected nodes follow smoothly
        alphaRef.current = Math.max(alphaRef.current, 0.8)
        // Reheat connected nodes' velocities slightly so they respond
        const connected = new Set<string>()
        edgesRef.current.forEach(edge => {
          if (edge.source === id) connected.add(edge.target)
          if (edge.target === id) connected.add(edge.source)
        })
        connected.forEach(cid => {
          const c = simRef.current.get(cid)
          if (c && !c.pinned) {
            c.vx += (Math.random() - 0.5) * 2
            c.vy += (Math.random() - 0.5) * 2
          }
        })
      }
      return
    }
    dragState.current = { type: 'pan', startX: e.clientX, startY: e.clientY }
    onSelectNode(null)
  }, [onSelectNode])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const d = dragState.current
    if (!d) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY

    if (d.type === 'node' && d.nodeId && d.origX !== undefined && d.origY !== undefined) {
      const s = simRef.current.get(d.nodeId)
      if (s) {
        s.x = d.origX + dx / viewTransform.scale
        s.y = d.origY + dy / viewTransform.scale
        setPositions(prev => ({ ...prev, [s.id]: { x: s.x, y: s.y } }))
      }
    } else if (d.type === 'pan') {
      setViewTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }))
      dragState.current = { ...d, startX: e.clientX, startY: e.clientY }
    }
  }, [viewTransform.scale])

  const handleMouseUp = useCallback(() => {
    if (dragState.current?.type === 'node' && dragState.current.nodeId) {
      const s = simRef.current.get(dragState.current.nodeId)
      if (s) s.pinned = false
    }
    dragState.current = null
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const factor = e.deltaY > 0 ? 0.9 : 1.1
    setViewTransform(prev => ({ ...prev, scale: Math.max(0.2, Math.min(5, prev.scale * factor)) }))
  }, [])

  const handleNodeClick = useCallback((node: GraphNode) => {
    onSelectNode(node)
  }, [onSelectNode])

  const resetView = () => setViewTransform({ x: 0, y: 0, scale: 1 })

  const edgeOpacity = (edge: GraphEdge) => {
    if (hoveredEdge === `${edge.source}-${edge.target}`) return 0.85
    if (!selectedNodeId) return isDark ? 0.12 : 0.1
    return edge.source === selectedNodeId || edge.target === selectedNodeId ? 0.6 : 0.04
  }

  const nodeOpacity = (nodeId: string) => {
    if (!selectedNodeId) return 1
    if (nodeId === selectedNodeId) return 1
    return neighborIds.has(nodeId) ? 0.85 : 0.2
  }

  const nodeRadius = (node: GraphNode) => {
    const base = node.size * 5.5
    const s = (nodeId: string) => {
      if (!selectedNodeId) return 1
      if (nodeId === selectedNodeId) return 1.25
      return neighborIds.has(nodeId) ? 1.08 : 0.7
    }
    return base * s(node.id)
  }

  const labelSize = (nodeId: string) => {
    if (!selectedNodeId) return 9.5
    if (nodeId === selectedNodeId) return 11.5
    return neighborIds.has(nodeId) ? 9.5 : 8.5
  }

  const isDark = theme === 'dark'
  const bgClass = isDark ? 'bg-[#0d0d12]' : 'bg-paper-50/30'
  const edgeColor = isDark ? '#4a4a5a' : '#9CA3AF'
  const edgeHighlight = isDark ? '#10B981' : '#059669'
  const labelColor = isDark ? '#a0a0b0' : '#374151'
  const labelColorDim = isDark ? '#555566' : '#9CA3AF'
  const nodeFill = (node: GraphNode) => {
    if (node.id === selectedNodeId) return isDark ? '#065F46' : '#047857'
    return NODE_COLORS[node.type]
  }

  return (
    <div ref={containerRef} className={`flex-1 overflow-hidden ${bgClass} relative`}>
      {/* Dot grid background */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <pattern id={`dotGrid-${theme}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.5" fill={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'} />
          </pattern>
        </defs>
      </svg>
      <div className="absolute inset-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='0.5' fill='${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'}'/%3E%3C/svg%3E")` }} />
      <svg ref={svgRef} width={width} height={height}
        className="w-full h-full cursor-grab active:cursor-grabbing relative z-10"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <defs>
          <filter id={`nodeGlow-${theme}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={`nodeGlowStrong-${theme}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComponentTransfer in="blur" result="glow">
              <feFuncA type="linear" slope="0.4" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g transform={`translate(${viewTransform.x}, ${viewTransform.y}) scale(${viewTransform.scale})`}>
          {/* Edges */}
          {edges.map(edge => {
            const s = positions[edge.source], t = positions[edge.target]
            if (!s || !t) return null
            const edgeKey = `${edge.source}-${edge.target}`
            const isHighlighted = hoveredEdge === edgeKey
            const isSelected = selectedNodeId && (edge.source === selectedNodeId || edge.target === selectedNodeId)
            return (
              <g key={edgeKey}>
                <line x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                  stroke={isSelected ? edgeHighlight : edgeColor}
                  strokeWidth={isHighlighted ? Math.max(0.8, edge.weight * 1.2) : Math.max(0.3, edge.weight * 0.5)}
                  opacity={edgeOpacity(edge)}
                  className="transition-all duration-300"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredEdge(edgeKey)}
                  onMouseLeave={() => setHoveredEdge(null)} />
                {/* Edge label on hover */}
                {isHighlighted && (
                  <text x={(s.x + t.x) / 2} y={(s.y + t.y) / 2 - 6}
                    textAnchor="middle" fill={isDark ? '#c0c0d0' : '#374151'} fontSize={8}
                    className="pointer-events-none select-none"
                    style={{ fontFamily: 'var(--font-noto-sans-kr), sans-serif' }}>
                    {edge.label}
                  </text>
                )}
              </g>
            )
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const pos = positions[node.id]
            if (!pos) return null
            const r = nodeRadius(node)
            const isSelected = node.id === selectedNodeId
            const isHovered = node.id === hoveredNodeId
            const opacity = nodeOpacity(node.id)
            const fill = nodeFill(node)

            return (
              <g key={node.id} data-node-id={node.id}
                onClick={() => handleNodeClick(node)}
                onMouseEnter={() => onHoverNode(node.id)}
                onMouseLeave={() => onHoverNode(null)}
                style={{ cursor: 'pointer' }}
                className="transition-opacity duration-300"
                opacity={opacity}
              >
                {isSelected && (
                  <circle cx={pos.x} cy={pos.y} r={r + 5} fill="none"
                    stroke={isDark ? '#10B981' : '#059669'} strokeWidth={1} opacity={0.3}>
                    <animate attributeName="r" values={`${r + 5};${r + 9};${r + 5}`} dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Glow layer - floating effect */}
                <circle cx={pos.x} cy={pos.y} r={r * 1.6} fill={fill} opacity={isDark ? 0.08 : 0.06}
                  filter={`url(#nodeGlow-${theme})`} />
                <circle cx={pos.x} cy={pos.y} r={r} fill={fill}
                  stroke={isHovered ? (isDark ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.8)') : 'none'}
                  strokeWidth={isHovered ? 1.5 : 0}
                  filter={isSelected ? `url(#nodeGlowStrong-${theme})` : undefined} />
                <text x={pos.x} y={pos.y + r + labelSize(node.id) + 4}
                  textAnchor="middle" fill={labelColor}
                  fontSize={labelSize(node.id)} fontWeight={isSelected ? '600' : '400'}
                  className="pointer-events-none select-none transition-all duration-300"
                  style={{ fontFamily: 'var(--font-noto-sans-kr), sans-serif' }}
                >
                  {node.label.length > 10 ? node.label.slice(0, 10) + '…' : node.label}
                </text>
                {(isSelected || isHovered) && (
                  <text x={pos.x} y={pos.y + r + labelSize(node.id) + 16}
                    textAnchor="middle" fill={labelColorDim} fontSize={8}
                    className="pointer-events-none select-none">
                    {node.subtitle}
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-20">
        <button onClick={resetView}
          className={`${isDark ? 'bg-[#1a1a2e] border-white/10 text-white/40' : 'bg-white border-paper-200 text-paper-500'} text-[11px] px-3 py-1.5 rounded-lg shadow-sm hover:${isDark ? 'bg-[#222240]' : 'bg-paper-50'} transition-colors`}>
          초기화
        </button>
      </div>
    </div>
  )
}

/* ─── Node Detail Panel ─── */

function NodeDetailPanel({ node, edges, allNodes, onClose, onNavigate, router, theme = 'dark' }: {
  node: GraphNode; edges: GraphEdge[]; allNodes: GraphNode[]
  onClose: () => void; onNavigate: (id: string) => void; router: ReturnType<typeof useRouter>
  theme?: 'light' | 'dark'
}) {
  const isDark = theme === 'dark'
  const textPrimary = isDark ? '#e0e0e8' : '#1f2937'
  const textSecondary = isDark ? '#8888a0' : '#6b7280'
  const textMuted = isDark ? '#555566' : '#9ca3af'
  const cardBg = isDark ? 'bg-[#1a1a28]' : 'bg-paper-50'
  const cardBorder = isDark ? 'border-white/5' : 'border-paper-200'
  const btnBg = isDark ? 'bg-green-700 hover:bg-green-600' : 'bg-green-500 hover:bg-green-600'
  const { sources, targets } = getNodeConnections(node.id, edges)

  const connectedEdges = [...sources, ...targets]
  const connectedNodeIds = Array.from(new Set(connectedEdges.map(e => e.source === node.id ? e.target : e.source)))

  const nodeMap = useMemo(() => {
    const m = new Map<string, GraphNode>()
    allNodes.forEach(n => m.set(n.id, n))
    return m
  }, [allNodes])

  const connectedNodes = connectedNodeIds.map(id => {
    const n = nodeMap.get(id)
    const edge = connectedEdges.find(e => (e.source === node.id && e.target === id) || (e.target === node.id && e.source === id))
    return { node: n, edge }
  }).filter(c => c.node)

  const grouped = useMemo(() => {
    const groups: Record<string, typeof connectedNodes> = {}
    connectedNodes.forEach(c => {
      const type = c.node!.type
      if (!groups[type]) groups[type] = []
      groups[type].push(c)
    })
    return groups
  }, [connectedNodes])

  const suggestions = useMemo(() => {
    const all = getSuggestedConnections(allNodes, edges)
    return all.filter(s => s.source.id === node.id || s.target.id === node.id)
  }, [allNodes, edges, node.id])

  const [showExplanations, setShowExplanations] = useState(false)

  return (
    <aside className={`w-80 shrink-0 border-l flex flex-col overflow-y-auto scrollbar-thin ${isDark ? 'border-white/5 bg-[#111118]' : 'border-paper-200 bg-white'}`}>
      <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-white/5' : 'border-paper-200'}`}>
        <span className={`text-[10px] font-semibold uppercase tracking-widest ${isDark ? 'text-white/30' : 'text-paper-400'}`}>노드 상세</span>
        <button onClick={onClose} className={`${isDark ? 'text-white/30 hover:text-white/50' : 'text-paper-400 hover:text-paper-600'} transition-colors p-1`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Type badge + title */}
        <div>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${NODE_COLORS_BG[node.type]} ${isDark ? 'text-white/80' : 'text-white'} inline-block`}>
            {NODE_LABELS[node.type]}
          </span>
          <h3 className={`text-base font-bold mt-2 font-serif ${isDark ? 'text-white/80' : 'text-paper-800'}`}>{node.label}</h3>
          <p className={`text-xs mt-0.5 ${textSecondary}`}>{node.subtitle}</p>
        </div>

        {/* Detail */}
        <div className={`${cardBg} rounded-lg border ${cardBorder} p-3`}>
          <p className={`text-xs leading-relaxed ${textSecondary}`}>{node.detail}</p>
        </div>

        {/* Connections with explanations */}
        <div>
          <AppSectionHeader
            title="연결"
            count={connectedNodes.length}
            action={connectedNodes.length > 0 ? (
              <button onClick={() => setShowExplanations(!showExplanations)}
                className="text-[10px] text-green-600 hover:text-green-700 transition-colors">
                {showExplanations ? '간략히' : '설명 보기'}
              </button>
            ) : undefined}
          />
          <div className="space-y-2">
            {Object.entries(grouped).map(([type, items]) => (
              <div key={type}>
                <div className={`text-[10px] mb-1 ${textMuted}`}>{NODE_LABELS[type as NodeType]} ({items.length})</div>
                {items.map(({ node: n, edge }) => n && (
                  <button key={n.id} onClick={() => onNavigate(n.id)}
                    className={`w-full text-left ${cardBg} rounded-lg border ${cardBorder} p-2.5 mb-1 ${isDark ? 'hover:border-green-700' : 'hover:border-green-300'} transition-colors group`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${NODE_COLORS_BG[n.type]}`} />
                      <span className={`text-xs font-medium group-hover:text-green-600 transition-colors ${isDark ? 'text-white/70' : 'text-paper-700'}`}>{n.label}</span>
                      <span className={`text-[9px] ml-auto ${textMuted}`}>{edge?.label || ''}</span>
                    </div>
                    {showExplanations && edge && (
                      <div className="flex items-center gap-1.5 mt-1.5 ml-4">
                        <svg className={`w-3 h-3 shrink-0 ${isDark ? 'text-green-500' : 'text-green-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className={`text-[10px] leading-tight ${textMuted}`}>{getExplanation(node, n, edge)}</span>
                      </div>
                    )}
                    <p className={`text-[10px] mt-0.5 ml-4 ${textMuted}`}>{n.subtitle}</p>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Connections */}
        {suggestions.length > 0 && (
          <div className="border-t border-paper-200 pt-4">
            <AppSectionHeader
              title="발견한 연결"
              count={suggestions.length}
              action={
                <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
            />
            <p className={`text-[10px] mb-2 leading-relaxed ${textMuted}`}>
              이 노드와 공통 이웃을 공유하지만 아직 직접 연결되지 않은 노드입니다.
            </p>
            <div className="space-y-1.5">
              {suggestions.map((s, i) => {
                const other = s.source.id === node.id ? s.target : s.source
                const shared = s.sharedNeighbors.map(id => nodeMap.get(id)?.label).filter(Boolean)
                return (
                  <button key={`suggest-${i}`} onClick={() => onNavigate(other.id)}
                    className={`w-full text-left rounded-lg border p-2.5 transition-colors group ${isDark ? 'bg-amber-900/10 border-amber-800/20 hover:border-amber-700/40' : 'bg-amber-50/50 border-amber-200 hover:border-amber-300'}`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${NODE_COLORS_BG[other.type]}`} />
                      <span className={`text-xs font-medium transition-colors ${isDark ? 'text-white/70 group-hover:text-amber-400' : 'text-paper-700 group-hover:text-amber-700'}`}>{other.label}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 ml-4">
                      <span className={`text-[9px] ${textMuted}`}>공통:</span>
                      <span className={`text-[9px] ${textSecondary}`}>{shared.join(', ')}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer: actions */}
      {(node.type === 'sermon' || node.type === 'passage' || node.type === 'series' || node.type === 'note') && (
        <div className={`mt-auto p-4 border-t ${isDark ? 'border-white/5' : 'border-paper-200'} space-y-1.5`}>
          {node.type === 'sermon' && (
            <button onClick={() => {
              const id = node.id.replace('sermon-', '')
              router.push(`/advanced/projects/${id}`)
            }}
              className={`w-full ${btnBg} text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors`}>
              프로젝트 열기
            </button>
          )}
          {node.type === 'passage' && (
            <button onClick={() => router.push('/advanced/bible')}
              className={`w-full ${btnBg} text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors`}>
              본문 연구 보기
            </button>
          )}
          {node.type === 'series' && (
            <button onClick={() => {
              const id = node.id.replace('series-', '')
              router.push(`/advanced/series/${id}`)
            }}
              className={`w-full ${btnBg} text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors`}>
              시리즈 보기
            </button>
          )}
          {node.type === 'note' && (
            <button onClick={() => router.push('/advanced/notes')}
              className={`w-full ${btnBg} text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors`}>
              노트 보기
            </button>
          )}
          {node.type !== 'note' && (
            <button onClick={() => router.push('/advanced/notes')}
              className={`w-full text-xs ${isDark ? 'border-white/10 text-white/40 hover:border-green-700 hover:text-green-400' : 'border-paper-200 text-paper-500 hover:border-green-300 hover:text-green-600'} py-1.5 rounded-md transition-colors`}>
              관련 노트 보기
            </button>
          )}
        </div>
      )}
    </aside>
  )
}
