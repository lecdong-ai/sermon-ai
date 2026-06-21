'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ProjectDetail, AdvancedProject, ProjectVersion, ActivityItem, ProjectStatus } from './types'
import { getStorageItem, setStorageItem } from '@/lib/storage'
import { getCustomProjects } from './mockData'

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
        const res = await fetch(`/api/sermons/${projectId}`)
        const json = await res.json()
        if (json.success) apiProject = json.data
      } catch {}

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
        outlinePoints,
        introduction: prepData?.deliveryIntro || manuscriptData?.sections?.find((s: any) => s.id === 'intro')?.content || '',
        conclusion: prepData?.deliveryConclusion || manuscriptData?.sections?.find((s: any) => s.id === 'conclusion')?.content || '',
        applicationPoints: prepData?.applicationPoints?.map((a: any) =>
          `[${a.audienceTag || '전체'}] ${a.point}`
        ) || manuscriptData?.sections?.find((s: any) => s.id === 'application')?.content ? [manuscriptData.sections.find((s: any) => s.id === 'application')!.content] : [],
        titleCandidates: prepData?.titleCandidates || [],
        manuscriptContent: manuscriptData?.sections?.map((s: any) => `## ${s.label}\n${s.content}`).join('\n\n') || '',
        observations: prepData?.researchInsights?.[0] || manuscriptData?.prepInsights?.[0] || '',
        backgroundNotes: '', interpretationNotes: '', illustrationNotes: '',
        versions, recentActivity, relatedSermons: [],
      }

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
      // localStorage 사용자 프로젝트도 함께 업데이트 (refetch 시 폴백 방지)
      try {
        const customProjects = getCustomProjects()
        const idx = customProjects.findIndex((p) => p.id === projectId)
        if (idx !== -1) {
          customProjects[idx] = { ...customProjects[idx], status }
          setStorageItem('custom_projects', customProjects)
        }
      } catch {}
      return { ...prev, status }
    })
  }, [projectId])

  useEffect(() => {
    loadProject()
  }, [loadProject])

  return { project, loading, error, refetch: loadProject, updateStatus }
}
