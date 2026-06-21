import { type NoteEntry, type NoteConnection } from '@/lib/advanced/notesData'

export interface InsightRow {
  id: string
  user_id: string
  type: string
  title: string
  content: string
  summary: string
  tags: string[]
  starred: boolean
  pinned: boolean
  connections: unknown
  project_ids: string[]
  series_ids?: string[]
  archive_ids: string[]
  last_referenced_at: string | null
  reference_count: number
  created_at: string
  updated_at: string
}

export interface NoteEntryExtended extends NoteEntry {
  seriesIds: string[]
}

export function rowToNote(row: InsightRow): NoteEntryExtended {
  return {
    id: row.id,
    type: row.type as NoteEntry['type'],
    title: row.title,
    content: row.content,
    summary: row.summary || '',
    tags: row.tags || [],
    starred: !!row.starred,
    pinned: !!row.pinned,
    connections: Array.isArray(row.connections) ? (row.connections as NoteConnection[]) : [],
    projectIds: row.project_ids || [],
    seriesIds: row.series_ids || [],
    archiveIds: row.archive_ids || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastReferencedAt: row.last_referenced_at,
    referenceCount: row.reference_count || 0,
  }
}
