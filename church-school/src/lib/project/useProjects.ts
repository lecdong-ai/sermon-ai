'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { AdvancedProject, ProjectStatus, QuickStats } from './types'
import { getCustomProjects, removeCustomProject } from './customProjects'
import { setStorageItem, removeStorageItem } from '@/lib/storage'
import { readProjectCore } from '@/lib/project/projectStorage'
import { computeProjectProgress } from '@/lib/project/projectProgress'
import { useProjectMigration } from './useProjectMigration'

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
    passages: item.passages && item.passages.length > 0
      ? item.passages.map((p: any) => ({
          id: p.id,
          book: p.book ?? '',
          chapter: p.chapter ?? p.chapterStart ?? 0,
          verseStart: p.verseStart ?? 1,
          verseEnd: p.verseEnd ?? p.chapterEnd ?? null,
          passage: p.passage ?? p.label ?? '',
        }))
      : undefined,
  }
}

export interface UseProjectsResult {
  projects: AdvancedProject[]
  stats: QuickStats
  loading: boolean
  error: string | null
  deleteProject: (id: string) => Promise<boolean>
  refetch: () => void
}

export function useProjects(): UseProjectsResult {
  const [apiProjects, setApiProjects] = useState<AdvancedProject[]>([])
  const [customProjects, setCustomProjects] = useState<AdvancedProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // localStorage는 client에서만 접근 (hydration mismatch 방지)
  useEffect(() => {
    setCustomProjects(getCustomProjects())
  }, [refreshKey])

  const allProjectIds = useMemo(() => {
    const ids = new Set<string>()
    for (const p of apiProjects) ids.add(p.id)
    for (const p of customProjects) ids.add(p.id)
    return Array.from(ids)
  }, [apiProjects, customProjects])

  useProjectMigration(allProjectIds)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/sermons')
      if (!res.ok) {
        let serverMsg = ''
        let serverDetail = ''
        try {
          const j = await res.json()
          serverMsg = j?.error || ''
          serverDetail = j?.detail || ''
        } catch {}
        if (res.status === 401) {
          throw new Error('로그인이 필요합니다.')
        }
        const composed = serverDetail
          ? `${serverMsg} (${serverDetail})`
          : (serverMsg || '프로젝트를 불러오지 못했습니다.')
        throw new Error(composed)
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
    // Enrich projects with coreMessage from localStorage (skip if not in browser)
    const enrichCore = (p: AdvancedProject): AdvancedProject => {
      let enriched: AdvancedProject = p
      if (typeof window !== 'undefined' && !p.coreMessage) {
        try {
          const { prep, manuscript: ms } = readProjectCore(p.id)
          if (prep?.coreMessage) enriched = { ...enriched, coreMessage: prep.coreMessage }
          else if (ms?.coreMessage) enriched = { ...enriched, coreMessage: ms.coreMessage }
        } catch {}
      }
      if (typeof window !== 'undefined') {
        try {
          const progress = computeProjectProgress(p.id, p.passages, p.status)
          enriched = { ...enriched, status: progress.overall }
        } catch {}
      }
      return enriched
    }

    const byId = new Map<string, AdvancedProject>()
    for (const p of customProjects) byId.set(p.id, enrichCore(p))
    for (const p of apiProjects) byId.set(p.id, enrichCore(p))

    return Array.from(byId.values()).sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
    )
  }, [apiProjects, customProjects, refreshKey])

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
      removeCustomProject(id)
      removeStorageItem(`prep_${id}`)
      removeStorageItem(`manuscript_${id}`)

      setApiProjects((prev) => prev.filter(p => p.id !== id))
      await fetch(`/api/sermons/${id}`, { method: 'DELETE' })
      refetch()
      return true
    } catch {
      refetch()
      return false
    }
  }, [refetch])

  return { projects, stats, loading, error, deleteProject, refetch }
}
