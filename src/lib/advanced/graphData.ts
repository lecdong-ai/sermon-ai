export type NodeType = 'sermon' | 'passage' | 'theme' | 'word' | 'note' | 'series'

export interface GraphNode {
  id: string
  label: string
  type: NodeType
  subtitle: string
  detail: string
  size: number
}

export interface GraphEdge {
  source: string
  target: string
  label: string
  weight: number
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
