export type NodeType = 'sermon' | 'passage' | 'theme' | 'word' | 'note' | 'series'

export type EdgeType = 'series' | 'theme' | 'word' | 'passage' | 'note' | 'reference' | 'other'

export interface GraphNode {
  id: string
  label: string
  type: NodeType
  subtitle: string
  detail: string
  size: number
  createdAt?: string
  connectionCount?: number
}

export interface GraphEdge {
  source: string
  target: string
  label: string
  weight: number
  type?: EdgeType
}

export const NODE_COLORS: Record<NodeType, string> = {
  sermon: '#10B981',
  passage: '#F59E0B',
  theme: '#8B5CF6',
  word: '#3B82F6',
  note: '#F43F5E',
  series: '#06B6D4',
}

export const NODE_COLORS_BG: Record<NodeType, string> = {
  sermon: 'bg-green-500',
  passage: 'bg-amber-500',
  theme: 'bg-violet-500',
  word: 'bg-blue-500',
  note: 'bg-rose-500',
  series: 'bg-cyan-500',
}

export const NODE_LABELS: Record<NodeType, string> = {
  sermon: '설교',
  passage: '본문',
  theme: '주제',
  word: '원어',
  note: '노트',
  series: '시리즈',
}

export const EDGE_STYLES: Record<EdgeType, { color: string; label: string; description: string; dashed?: boolean }> = {
  series: { color: '#10B981', label: '시리즈', description: '같은 시리즈 설교' },
  theme: { color: '#8B5CF6', label: '주제', description: '공유 주제' },
  word: { color: '#3B82F6', label: '원어', description: '공유 원어' },
  passage: { color: '#F59E0B', label: '본문', description: '설교의 본문' },
  note: { color: '#F43F5E', label: '통찰', description: '통찰 노트 연결' },
  reference: { color: '#06B6D4', label: '참조', description: '직접 참조 관계' },
  other: { color: '#6B7280', label: '기타', description: '기타 연결' },
}

export function getEdgeType(label: string): EdgeType {
  switch (label) {
    case '소속':
    case '범위':
      return 'series'
    case '관련':
    case '강조':
      return 'theme'
    case '원어':
      return 'word'
    case '본문':
      return 'passage'
    case '통찰':
    case '노트':
      return 'note'
    case '참조':
    case '평행':
      return 'reference'
    default:
      return 'other'
  }
}

export const GRAPH_NODES: GraphNode[] = []

export const GRAPH_EDGES: GraphEdge[] = []

export function getNodeConnections(nodeId: string, edges: GraphEdge[]): { sources: GraphEdge[]; targets: GraphEdge[] } {
  return {
    sources: edges.filter(e => e.source === nodeId),
    targets: edges.filter(e => e.target === nodeId),
  }
}

export function getNeighborIds(nodeId: string, edges: GraphEdge[]): string[] {
  const ids: string[] = []
  edges.forEach(e => {
    if (e.source === nodeId) ids.push(e.target)
    if (e.target === nodeId) ids.push(e.source)
  })
  return Array.from(new Set(ids))
}

export function getConnectionCount(nodeId: string, edges: GraphEdge[]): number {
  return getNeighborIds(nodeId, edges).length
}

/** 생성된 지 5분 이내인지 검사 — "NEW" 배지/글로우용 */
export const RECENT_THRESHOLD_MS = 5 * 60 * 1000

export function isRecentNode(node: GraphNode, now: number = Date.now()): boolean {
  if (!node.createdAt) return false
  const t = new Date(node.createdAt).getTime()
  if (isNaN(t)) return false
  return now - t < RECENT_THRESHOLD_MS
}
