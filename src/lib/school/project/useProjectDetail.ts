'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ProjectDetail, AdvancedProject, ProjectVersion, ActivityItem, ProjectStatus } from './types'
import { getStorageItem, setStorageItem } from '@/lib/school/storage'
import { getCustomProjects, updateCustomProject } from './customProjects'
import { computeProjectProgress } from '@/lib/school/project/projectProgress'

interface ProjectDetailResult {
  project: ProjectDetail | null
  loading: boolean
  error: string | null
  refetch: () => void
  updateStatus: (status: ProjectStatus) => void
}

export function useProjectDetail(projectId: string): ProjectDetailResult {
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProject = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    setError(null)

    try {
      // 1. Load from API
      let apiProject: AdvancedProject | null = null
      try {
        const res = await fetch(`/school/api/sermons/${projectId}`)
        const json = await res.json()
        if (json.success) apiProject = json.data
      } catch {}

      // Normalize status: DB uses 'draft', UI uses ProjectStatus enum
      const VALID_STATUSES: ProjectStatus[] = ['research', 'prepare', 'writing', 'review', 'completed', 'archived']
      if (apiProject) {
        const s = (apiProject as any).status
        if (s === 'draft' || !s || !VALID_STATUSES.includes(s)) {
          apiProject = { ...apiProject, status: 'research' }
        }
      }

      // 2. Load from localStorage custom projects
      let customProject: AdvancedProject | null = null
      try {
        const customProjects = getCustomProjects()
        customProject = customProjects.find(p => p.id === projectId) || null
      } catch {}

      // 3. Load prep/manuscript data
      let prepData: any = null
      let manuscriptData: any = null
      try {
        prepData = getStorageItem(`prep_${projectId}`, null)
        manuscriptData = getStorageItem(`manuscript_${projectId}`, null)
      } catch {}

      // 4. Build ProjectDetail
      const base = apiProject || customProject || {
        id: projectId,
        title: manuscriptData?.title || '',
        passage: manuscriptData?.passage || '',
        book: '', chapter: 0, verseStart: 0, verseEnd: null,
        status: 'research' as const,
        sermonDate: manuscriptData?.sermonDate || '',
        preacher: '', sermonType: '', audience: [], season: '',
        coreMessage: prepData?.coreMessage || manuscriptData?.coreMessage || '',
        wordCount: 0, version: 1, seriesId: undefined, seriesName: undefined,
        themeIds: [], themeNames: [], tagNames: [], studyCount: 0,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      }

      // Extract outlines
      const prepOutlines = prepData?.outlines || []
      const manuscriptOutlines = manuscriptData?.outlinePoints || []
      const outlinePoints = (prepOutlines.length > 0 ? prepOutlines : manuscriptOutlines).map((o: any, i: number) => ({
        title: o.title || `대지 ${i + 1}`,
        content: o.description || o.content || '',
        subPoints: o.subPoints || [],
      }))

      const recentActivity: ActivityItem[] = []
      if (base.updatedAt) {
        recentActivity.push({ type: 'edit', description: '프로젝트 업데이트', timestamp: base.updatedAt })
      }
      recentActivity.push({ type: 'create', description: '프로젝트 생성', timestamp: base.createdAt })

      const versions: ProjectVersion[] = []
      if (base.updatedAt) {
        versions.push({ id: `v${base.version}`, version: base.version, summary: '최근 업데이트', changedBy: 'user', createdAt: base.updatedAt })
      }

      const detail: ProjectDetail = {
        ...base,
        passage: (base as any).passage || (base as any).normalizedPassage || '',
        sermonDate: (base as any).sermonDate || (base as any).date || '',
        book: (base as any).book || (base as any).bibleBook || '',
        chapter: (base as any).chapter || (base as any).chapterStart || 0,
        outlinePoints,
        wordCount: (base as any).wordCount || manuscriptData?.sections?.reduce((sum: number, s: any) => sum + (s.content?.length || 0), 0) || 0,
        version: (base as any).version || 1,
        studyCount: (base as any).studyCount || 0,
        passages: ((base as any).passages || []).map((p: any) => ({
          ...p,
          book: p.book ?? p.bibleBook ?? '',
          chapter: p.chapter ?? p.chapterStart ?? 0,
          verseStart: p.verseStart ?? p.verseStart_ ?? 1,
          verseEnd: p.verseEnd ?? p.verseEnd_ ?? null,
          passage: p.passage ?? p.label ?? '',
        })),
        themeNames: (base as any).themeNames || [],
        tagNames: (base as any).tagNames || [],
        audience: (base as any).audience || [],
        introduction: prepData?.deliveryIntro || manuscriptData?.sections?.find((s: any) => s.id === 'intro')?.content || '',
        conclusion: prepData?.deliveryConclusion || manuscriptData?.sections?.find((s: any) => s.id === 'conclusion')?.content || '',
        applicationPoints: prepData?.applicationPoints?.map((a: any) =>
          `[${a.audienceTag || '전체'}] ${a.point}`
        ) || manuscriptData?.sections?.find((s: any) => s.id === 'application')?.content ? [manuscriptData.sections.find((s: any) => s.id === 'application')!.content] : [],
        titleCandidates: prepData?.titleCandidates || (base as any).titleCandidates || [],
        manuscriptContent: manuscriptData?.sections?.map((s: any) => `## ${s.label}\n${s.content}`).join('\n\n') || '',
        observations: prepData?.researchInsights?.[0] || manuscriptData?.prepInsights?.[0] || '',
        backgroundNotes: '', interpretationNotes: '', illustrationNotes: '',
        versions, recentActivity, relatedSermons: (base as any).relatedSermons || [],
      }

      // Auto-derive status from actual data (respects completed/archived)
      try {
        const progress = computeProjectProgress(projectId, detail.passages, detail.status)
        detail.status = progress.overall
      } catch {}

      setProject(detail)
    } catch (err: any) {
      setError(err.message || '프로젝트를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  const updateStatus = useCallback((status: ProjectStatus) => {
    setProject((prev) => {
      if (!prev) return prev
      updateCustomProject(projectId, { status })
      return { ...prev, status }
    })
  }, [projectId])

  useEffect(() => {
    loadProject()
  }, [loadProject])

  return { project, loading, error, refetch: loadProject, updateStatus }
}
