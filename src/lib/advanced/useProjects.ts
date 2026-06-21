'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { AdvancedProject, ProjectStatus, QuickStats } from './types'
import { getCustomProjects, getDeletedMockIds, mockProjects } from './mockData'
import { setStorageItem, removeStorageItem } from '@/lib/storage'

const STATUS_MAP: Record<string, ProjectStatus> = {
  draft: 'research',
  research: 'research',
  prepare: 'prepare',
  writing: 'writing',
  review: 'review',
  completed: 'completed',
  archived: 'archived',
}

function mapApiItem(item: any): AdvancedProject {
  const audience = item.audience
    ? Array.isArray(item.audience) ? item.audience : [item.audience]
    : []
  const status = STATUS_MAP[item.status] || 'writing'

  return {
    id: item.id,
    title: item.title || '',
    passage: item.normalizedPassage || '',
    book: item.bibleBook || '',
    chapter: item.chapterStart || 0,
    verseStart: item.verseStart || 0,
    verseEnd: item.verseEnd || null,
    status,
    sermonDate: item.date || '',
    preacher: item.preacher || '',
    sermonType: item.sermonType || '',
    audience,
    season: item.season || '',
    coreMessage: item.coreMessage || '',
    wordCount: item.wordCount ?? 0,
    version: item.version ?? 1,
    seriesId: item.seriesId || undefined,
    seriesName: item.seriesName || undefined,
    themeIds: item.themeIds || [],
    themeNames: item.themeNames || [],
    tagNames: item.tagNames || [],
    studyCount: item.studyCount ?? 0,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

export interface UseProjectsResult {
  projects: AdvancedProject[]
  stats: QuickStats
  loading: boolean
  error: string | null
  deleteProject: (id: string) => Promise<boolean>
  refetch: () => void
  /** Number of real (non-mock) projects — useful for new-user detection */
  totalRealCount: number
}

export function useProjects(): UseProjectsResult {
  const [apiProjects, setApiProjects] = useState<AdvancedProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/sermons')
      if (!res.ok) {
        throw new Error(
          res.status === 401
            ? '로그인이 필요합니다.'
            : '프로젝트를 불러오지 못했습니다.'
        )
      }
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setApiProjects(json.data.map(mapApiItem))
      } else {
        throw new Error(json.error || '데이터 형식이 올바르지 않습니다.')
      }
    } catch (err: any) {
      setError(err.message || '프로젝트를 불러오는 중 오류가 발생했습니다.')
      setApiProjects([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects, refreshKey])

  const refetch = useCallback(() => setRefreshKey(k => k + 1), [])

  const projects = useMemo(() => {
    const deletedIds = getDeletedMockIds()
    const customProjects = getCustomProjects()
    const filteredMock = mockProjects.filter(p => !deletedIds.includes(p.id))

    const byId = new Map<string, AdvancedProject>()
    for (const p of filteredMock) byId.set(p.id, p)
    for (const p of customProjects) byId.set(p.id, p)
    for (const p of apiProjects) byId.set(p.id, p)

    return Array.from(byId.values()).sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
    )
  }, [apiProjects, refreshKey])

  const totalRealCount = useMemo(() => {
    return apiProjects.length + getCustomProjects().length
  }, [apiProjects, refreshKey])

  const stats: QuickStats = useMemo(() => ({
    totalProjects: projects.length,
    inProgress: projects.filter(p => !['completed', 'archived'].includes(p.status)).length,
    completed: projects.filter(p => p.status === 'completed').length,
    archived: projects.filter(p => p.status === 'archived').length,
    totalStudies: projects.reduce((sum, p) => sum + (p.studyCount || 0), 0),
    totalWords: projects.reduce((sum, p) => sum + (p.wordCount || 0), 0),
    thisMonthSermons: projects.filter(p => {
      const d = new Date(p.sermonDate)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length,
  }), [projects])

  const deleteProject = useCallback(async (id: string): Promise<boolean> => {
    try {
      const custom = getCustomProjects()
      const wasCustom = custom.some(p => p.id === id)
      if (wasCustom) {
        setStorageItem('custom_projects', custom.filter(p => p.id !== id))
      }

      const isMock = mockProjects.some(p => p.id === id)
      if (isMock) {
        const deleted = getDeletedMockIds()
        if (!deleted.includes(id)) {
          deleted.push(id)
          setStorageItem('deleted_mock_ids', deleted)
        }
      }

      removeStorageItem(`prep_${id}`)
      removeStorageItem(`manuscript_${id}`)

      fetch(`/api/sermons/${id}`, { method: 'DELETE' }).catch(() => {})

      refetch()
      return true
    } catch {
      return false
    }
  }, [refetch])

  return { projects, stats, loading, error, deleteProject, refetch, totalRealCount }
}
