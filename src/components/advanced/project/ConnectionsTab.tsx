'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProjectDetail } from '@/lib/advanced/types'
import { type StageKey } from '@/components/advanced/shared/StageFlowIndicator'
import { getStorageItem } from '@/lib/storage'
import { AlertCircle, CheckCircle2, ChevronRight, ExternalLink, Loader2 } from 'lucide-react'
import ProjectContextRow from '@/components/advanced/shared/ProjectContextRow'

interface Props { project: ProjectDetail }

interface SectionInfo {
  id: string; type: string; label: string; content: string; passage?: string
}

interface GreekWord {
  word: string; greek: string; meaning: string; note: string
}

interface IllustrationNote {
  id: string; title: string; content: string; linkedSectionId?: string; category?: string
}

interface ReferenceNote {
  id: string; title: string; content: string; linkedSectionId?: string; category?: string
}

interface PrepData {
  coreMessage?: string; outlines?: { id: string; title: string; description: string }[]
  applicationPoints?: { id: string; point: string; audienceTag: string }[]
  prepInsights?: string[]
}

type Severity = 'critical' | 'recommended' | 'optional'
type SectionRole = 'intro' | 'body' | 'conclusion' | 'application' | 'other'

interface SectionAnalysis {
  id: string; type: string; label: string; wordCount: number; hasPassage: boolean
  role: SectionRole
  greekWords: { word: string; found: boolean }[]
  illustrationCount: number; referenceCount: number
  connectedApp: boolean; score: 'strong' | 'ok' | 'weak' | 'empty'
  hasWeakPoint: boolean
}

interface GreekUsage {
  word: string; greek: string; meaning: string; note: string
  usedInSections: string[]; used: boolean
}

interface WeakPoint {
  id: string
  severity: Severity
  title: string
  detail: string
  action: string
  targetNodeId?: string
  link?: { tab: string; sectionId?: string }
}

interface ConnectionAnalysis {
  sections: SectionAnalysis[]; greekUsages: GreekUsage[]
  illustrationStats: { total: number; linked: number; unlinked: number }
  referenceStats: { total: number; linked: number; unlinked: number }
  weakPoints: WeakPoint[]; overallScore: number
}

const SEVERITY_META: Record<Severity, { color: string; bg: string; border: string; dot: string; label: string; order: number }> = {
  critical: { color: 'text-red-300', bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-400', label: '즉시 보완', order: 0 },
  recommended: { color: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: 'bg-amber-400', label: '권장', order: 1 },
  optional: { color: 'text-slate-400', bg: 'bg-white/5', border: 'border-white/10', dot: 'bg-slate-500', label: '참고', order: 2 },
}

function getSectionRole(label: string): SectionRole {
  const l = (label || '').toLowerCase()
  if (l.includes('서론') || l.includes('도입') || l.includes('인트로') || l.includes('intro')) return 'intro'
  if (l.includes('결론') || l.includes('마무리') || l.includes('요약') || l.includes('conclusion')) return 'conclusion'
  if (l.includes('적용') || l.includes('application')) return 'application'
  if (l.includes('본론') || l.includes('설명') || l.includes('body')) return 'body'
  return 'body'
}

function calcSectionScore(role: SectionRole, s: SectionAnalysis, greekWords: GreekWord[]): SectionAnalysis['score'] {
  if (s.wordCount === 0) return 'empty'
  if (role === 'intro' || role === 'conclusion') {
    return s.wordCount >= 80 ? 'strong' : 'ok'
  }
  if (role === 'application') {
    if (s.illustrationCount > 0 && s.connectedApp) return 'strong'
    if (s.illustrationCount > 0 || s.connectedApp) return 'ok'
    return 'weak'
  }
  const greekRatio = greekWords.length > 0 ? s.greekWords.filter(m => m.found).length / greekWords.length : 0
  if (greekRatio > 0.3 && (s.illustrationCount > 0 || s.referenceCount > 0)) return 'strong'
  if (greekRatio > 0 || s.illustrationCount > 0 || s.referenceCount > 0) return 'ok'
  return 'weak'
}

const SCORE_COLORS = {
  strong: { bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400', text: 'text-emerald-300', label: '강력' },
  ok: { bg: 'bg-blue-500/10 border-blue-500/20', dot: 'bg-blue-400', text: 'text-blue-300', label: '양호' },
  weak: { bg: 'bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-400', text: 'text-amber-300', label: '미흡' },
  empty: { bg: 'bg-white/5 border-white/5', dot: 'bg-slate-600', text: 'text-slate-500', label: '없음' },
}

export default function ConnectionsTab({ project }: Props) {
  const router = useRouter()
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [pinnedNode, setPinnedNode] = useState<string | null>(null)
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [dragPositions, setDragPositions] = useState<Record<string, { x: number; y: number }>>({})

  const activeNode = pinnedNode || hoveredNode

  const svgRef = useRef<SVGSVGElement>(null)
  const dragStateRef = useRef<{
    nodeId: string
    startMouseX: number
    startMouseY: number
    startNodeX: number
    startNodeY: number
    hasMoved: boolean
  } | null>(null)
  const wasDraggingRef = useRef(false)
  const [isDragging, setIsDragging] = useState(false)

  const analysis = useMemo((): ConnectionAnalysis => {
    const pid = project.id
    const manuscript = getStorageItem<any>(`manuscript_${pid}`, {})
    const prep = getStorageItem<any>(`prep_${pid}`, {}) as PrepData
    const study = getStorageItem<any>(`study_${pid}`, {})

    const sections: SectionInfo[] = (manuscript.sections || []).filter((s: any) => s?.id)
    const greekWords: GreekWord[] = manuscript.greekWords || study.greekWords || []
    const illustrations: IllustrationNote[] = manuscript.illustrationNotes || []
    const references: ReferenceNote[] = manuscript.referenceNotes || []
    const apps = prep.applicationPoints || []
    const outlines = prep.outlines || []
    const prepInsights = manuscript.prepInsights || prep.prepInsights || []

    const sectionAnalyses: SectionAnalysis[] = sections.map(s => {
      const content = (s.content || '').toLowerCase()
      const greekMatches = greekWords.map(gw => ({
        word: gw.word,
        found: gw.word ? content.includes(gw.word.toLowerCase()) || (!!gw.greek && content.includes(gw.greek)) : false,
      }))
      const illCount = illustrations.filter(i => i.linkedSectionId === s.id).length
      const refCount = references.filter(r => r.linkedSectionId === s.id).length
      const hasApp = apps.some(a =>
        a.id === s.id ||
        a.audienceTag === s.label ||
        s.label.includes(a.audienceTag)
      )
      const wc = s.content.replace(/\s/g, '').length
      const role = getSectionRole(s.label)
      const baseS: SectionAnalysis = {
        id: s.id, type: s.type, label: s.label, wordCount: wc, hasPassage: !!s.passage, role,
        greekWords: greekMatches, illustrationCount: illCount, referenceCount: refCount,
        connectedApp: hasApp, score: 'empty', hasWeakPoint: false,
      }
      return { ...baseS, score: calcSectionScore(role, baseS, greekWords) }
    })

    const greekUsages: GreekUsage[] = greekWords.map(gw => {
      const usedIn = sections.filter(s => {
        const c = (s.content || '').toLowerCase()
        return gw.word ? c.includes(gw.word.toLowerCase()) || (!!gw.greek && c.includes(gw.greek)) : false
      })
      return { ...gw, usedInSections: usedIn.map(s => s.label), used: usedIn.length > 0 }
    })

    const linkedIlls = illustrations.filter(i => i.linkedSectionId).length
    const linkedRefs = references.filter(r => r.linkedSectionId).length

    const weakPoints: WeakPoint[] = []
    const totalSections = sectionAnalyses.length
    const nonEmptySections = sectionAnalyses.filter(s => s.wordCount > 0)
    const weakSectionIds = new Set<string>()

    if (totalSections === 0) {
      weakPoints.push({
        id: 'no-sections',
        severity: 'critical',
        title: '원고 섹션이 없습니다',
        detail: '설교 작성 탭에서 본론 구조를 만들어주세요',
        action: '설교 작성 탭 → [섹션 추가]로 서론·본론·결론·적용 만들기',
        link: { tab: 'manuscript' },
      })
    } else {
      for (const s of nonEmptySections) {
        const noGreek = s.greekWords.length > 0 && s.greekWords.every(m => !m.found)
        const noSupport = s.illustrationCount === 0 && s.referenceCount === 0

        if (s.role === 'body' || s.role === 'other') {
          if (noGreek && greekWords.length > 0) {
            weakPoints.push({
              id: `greek-${s.id}`,
              severity: 'recommended',
              title: `「${s.label}」에 원어가 없습니다`,
              detail: '본론의 깊이를 위해 연구한 원어 1개 이상을 사용해보세요',
              action: '해당 단락을 다시 읽으며 핵심 단어(사랑·은혜·구원 등)와 어울리는 원어를 자연스럽게 녹이세요',
              targetNodeId: s.id,
              link: { tab: 'manuscript', sectionId: s.id },
            })
            weakSectionIds.add(s.id)
          }
          if (noSupport && s.wordCount > 100) {
            weakPoints.push({
              id: `support-${s.id}`,
              severity: 'recommended',
              title: `「${s.label}」에 예화나 참고가 없습니다`,
              detail: '추상적 내용은 청중의 공감을 얻기 어렵습니다',
              action: '설교 작성 탭 → 예화/참고 추가 또는 [예화 카드]를 본론 섹션으로 드래그',
              targetNodeId: s.id,
              link: { tab: 'manuscript', sectionId: s.id },
            })
            weakSectionIds.add(s.id)
          }
        } else if (s.role === 'application') {
          if (noSupport) {
            weakPoints.push({
              id: `app-support-${s.id}`,
              severity: 'critical',
              title: `「${s.label}」에 구체적 예시가 없습니다`,
              detail: '적용은 추상적 교훈이 아니라 "월요일 아침에 뭘 할지"여야 효과적입니다',
              action: '예화 노트 작성 또는 청중별(직장인/부모/학생) 구체적 행동 시나리오 1개 추가',
              targetNodeId: s.id,
              link: { tab: 'manuscript', sectionId: s.id },
            })
            weakSectionIds.add(s.id)
          }
          if (!s.connectedApp) {
            weakPoints.push({
              id: `app-link-${s.id}`,
              severity: 'recommended',
              title: `「${s.label}」이 적용 포인트와 연결되지 않았습니다`,
              detail: '준비한 적용 포인트가 원고에 반영되지 않으면 청중은 "그래서 뭘?"이라고 느낍니다',
              action: '준비 탭의 적용 포인트 [청중] 태그를 "적용"으로 맞추거나, 원고의 audienceTag를 수정',
              targetNodeId: s.id,
              link: { tab: 'manuscript', sectionId: s.id },
            })
            weakSectionIds.add(s.id)
          }
        } else if (s.role === 'intro') {
          if (s.wordCount < 50) {
            weakPoints.push({
              id: `intro-short-${s.id}`,
              severity: 'recommended',
              title: `「${s.label}」이 너무 짧습니다`,
              detail: '도입은 청중의 관심을 끄는 구간. 질문·일상·긴장감으로 시작하세요',
              action: '한 문장으로 끝내지 말고, 질문을 던지거나 짧은 장면으로 시작해보세요',
              targetNodeId: s.id,
              link: { tab: 'manuscript', sectionId: s.id },
            })
            weakSectionIds.add(s.id)
          }
        } else if (s.role === 'conclusion') {
          if (s.wordCount < 30) {
            weakPoints.push({
              id: `conclusion-short-${s.id}`,
              severity: 'recommended',
              title: `「${s.label}」이 너무 짧습니다`,
              detail: '결론은 본론의 핵심을 한 문장으로 압축해 기억에 남게 하는 구간입니다',
              action: '한 문장으로 "오늘의 메시지는 ____이다"를 명확히 선언하세요',
              targetNodeId: s.id,
              link: { tab: 'manuscript', sectionId: s.id },
            })
            weakSectionIds.add(s.id)
          }
        }
      }

      const unusedGreek = greekUsages.filter(g => !g.used)
      unusedGreek.slice(0, 3).forEach(g => {
        weakPoints.push({
          id: `unused-greek-${g.word}`,
          severity: 'optional',
          title: `「${g.word}」(${g.greek}) 원어가 사용되지 않았습니다`,
          detail: g.meaning ? `의미: ${g.meaning}` : '연구했지만 본문에 반영되지 않았습니다',
          action: '이번 설교에 어울리지 않으면, 다음 설교를 위해 [원어] 탭에 남겨두세요',
          targetNodeId: `g:${g.word}`,
        })
      })
      if (unusedGreek.length > 3) {
        weakPoints.push({
          id: 'unused-greek-more',
          severity: 'optional',
          title: `외 ${unusedGreek.length - 3}개 원어가 미사용`,
          detail: '기여도 낮은 원어입니다',
          action: '이번 설교에 강제 삽입보다, 어울리는 설교에 사용하는 게 효과적',
        })
      }

      if (illustrations.length > 0 && linkedIlls === 0) {
        weakPoints.push({
          id: 'ills-unlinked',
          severity: 'critical',
          title: `예화 ${illustrations.length}개가 어떤 섹션에도 연결되지 않았습니다`,
          detail: '예화는 특정 본론 주장 아래에 배치되어야 임팩트가 있습니다',
          action: '설교 작성 탭 → 예화 카드 우측의 [섹션 선택]에서 본론 섹션 지정',
          link: { tab: 'manuscript' },
        })
      } else if (illustrations.length > 0 && illustrations.length - linkedIlls > 0) {
        weakPoints.push({
          id: 'ills-partial',
          severity: 'recommended',
          title: `예화 ${illustrations.length - linkedIlls}개가 미연결`,
          detail: '어떤 본론 주장을 뒷받침할지 정해주세요',
          action: '설교 작성 탭 → 예화 카드 → [섹션 연결]',
          link: { tab: 'manuscript' },
        })
      }

      if (references.length > 0 && linkedRefs === 0 && references.length - linkedRefs > 0) {
        weakPoints.push({
          id: 'refs-unlinked',
          severity: 'recommended',
          title: `참고 ${references.length - linkedRefs}개가 미연결`,
          detail: '주석·해설 자료는 본론 흐름에 맞춰 배치해야 자연스럽습니다',
          action: '설교 작성 탭 → 참고 카드 → [섹션 연결]',
          link: { tab: 'manuscript' },
        })
      }

      if (apps.length > 0 && !nonEmptySections.some(s => s.connectedApp)) {
        weakPoints.push({
          id: 'apps-unlinked',
          severity: 'critical',
          title: '적용 포인트가 원고에 반영되지 않았습니다',
          detail: `${apps.length}개의 적용을 준비했지만 청중에게 전달되지 않습니다`,
          action: '준비 탭에서 각 적용의 [청중] 태그를 원고의 적용 섹션명과 일치시키세요',
          link: { tab: 'prep' },
        })
      }
    }

    sectionAnalyses.forEach(s => { s.hasWeakPoint = weakSectionIds.has(s.id) })

    const greekScore = greekUsages.length > 0 ? greekUsages.filter(g => g.used).length / greekUsages.length : 1
    const illScore = illustrations.length > 0 ? linkedIlls / illustrations.length : 1
    const refScore = references.length > 0 ? linkedRefs / references.length : 1
    const sectionScore = nonEmptySections.length > 0
      ? nonEmptySections.filter(s => s.score === 'strong' || s.score === 'ok').length / nonEmptySections.length
      : 0
    const overallScore = Math.round(((greekScore + illScore + refScore + sectionScore) / 4) * 100)

    return {
      sections: sectionAnalyses, greekUsages,
      illustrationStats: { total: illustrations.length, linked: linkedIlls, unlinked: illustrations.length - linkedIlls },
      referenceStats: { total: references.length, linked: linkedRefs, unlinked: references.length - linkedRefs },
      weakPoints, overallScore,
    }
  }, [project.id])

  const allGreek = analysis.greekUsages
  const allIlls = analysis.illustrationStats.total
  const allRefs = analysis.referenceStats.total
  const hasAnyData = analysis.sections.length > 0 || allGreek.length > 0 || allIlls > 0 || allRefs > 0

  const graphNodeSize = (importance: number) => Math.max(6, Math.min(28, importance * 5))

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const drag = dragStateRef.current
      if (!drag) return
      const svg = svgRef.current
      if (!svg) return
      const ctm = svg.getScreenCTM()
      if (!ctm) return
      const pt = svg.createSVGPoint()
      pt.x = e.clientX
      pt.y = e.clientY
      const t = pt.matrixTransform(ctm.inverse())
      const dx = t.x - drag.startMouseX
      const dy = t.y - drag.startMouseY
      if (!drag.hasMoved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        drag.hasMoved = true
        setIsDragging(true)
      }
      if (drag.hasMoved) {
        const id = drag.nodeId
        setDragPositions(prev => ({ ...prev, [id]: { x: drag.startNodeX + dx, y: drag.startNodeY + dy } }))
      }
    }
    const onMouseUp = () => {
      if (dragStateRef.current) {
        wasDraggingRef.current = dragStateRef.current.hasMoved
      } else {
        wasDraggingRef.current = false
      }
      dragStateRef.current = null
      setIsDragging(false)
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  // Map project.status (ProjectStatus) → StageKey for StageFlowIndicator
  const stageKey: StageKey =
    project.status === 'research' ? 'study' :
    project.status === 'prepare' ? 'prep' :
    'manuscript'

  return (
    <div className="space-y-6">
      {/* Project Context */}
      <ProjectContextRow project={project} currentStage={stageKey} />

      {/* ─── 헤더: 전체 리포트 요약 ─── */}
      {hasAnyData ? (
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest mb-1">설교 연결 분석 리포트</div>
              <h2 className="text-lg font-bold text-white">{project.title}</h2>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${
                analysis.overallScore >= 80 ? 'text-emerald-400' :
                analysis.overallScore >= 50 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {analysis.overallScore}%
              </div>
              <div className="text-[10px] text-slate-500">연결 완성도</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatBox
              value={`${analysis.sections.filter(s => s.wordCount > 0).length}/${analysis.sections.length}`}
              label="섹션 작성 완료"
              ok={analysis.sections.every(s => s.wordCount > 0)}
            />
            <StatBox
              value={allGreek.length > 0
                ? `${analysis.greekUsages.filter(g => g.used).length}/${allGreek.length}`
                : '—'}
              label="원어 사용률"
              ok={allGreek.length === 0 || analysis.greekUsages.filter(g => g.used).length >= Math.ceil(allGreek.length / 2)}
            />
            <StatBox
              value={allIlls > 0
                ? `${analysis.illustrationStats.linked}/${allIlls}`
                : '—'}
              label="예화 연결률"
              ok={allIlls === 0 || analysis.illustrationStats.linked === allIlls}
            />
            <StatBox
              value={allRefs > 0
                ? `${analysis.referenceStats.linked}/${allRefs}`
                : '—'}
              label="참고자료 연결률"
              ok={allRefs === 0 || analysis.referenceStats.linked === allRefs}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl p-10 text-center">
          <p className="text-sm text-slate-500 font-medium">분석할 데이터가 없습니다</p>
          <p className="text-[11px] text-slate-600 mt-1">성경 연구, 설교 준비, 설교 작성 탭에서 먼저 작업해주세요</p>
        </div>
      )}

      {/* ─── 대지 연결 매트릭스 ─── */}
      {analysis.sections.length > 0 && (
        <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">대지 연결 매트릭스</div>
            <span className="text-[10px] text-slate-600">각 섹션이 원어·예화·참고자료와 연결된 정도</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-2 pr-4 text-slate-500 font-medium">섹션</th>
                  <th className="text-center py-2 px-2 text-slate-500 font-medium min-w-[60px]">분량</th>
                  <th className="text-center py-2 px-2 text-slate-500 font-medium min-w-[60px]">원어</th>
                  <th className="text-center py-2 px-2 text-slate-500 font-medium min-w-[60px]">예화</th>
                  <th className="text-center py-2 px-2 text-slate-500 font-medium min-w-[60px]">참고</th>
                  <th className="text-center py-2 px-2 text-slate-500 font-medium min-w-[60px]">적용</th>
                  <th className="text-center py-2 pl-2 text-slate-500 font-medium min-w-[60px]">평가</th>
                </tr>
              </thead>
              <tbody>
                {analysis.sections.map(s => {
                  const colors = SCORE_COLORS[s.score]
                  const greekFound = s.greekWords.filter(m => m.found).length
                  const greekTotal = s.greekWords.length
                  return (
                    <tr
                      key={s.id}
                      className={`border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors ${
                        selectedSection === s.id ? 'bg-indigo-500/5' : ''
                      }`}
                      onClick={() => {
                        setSelectedSection(selectedSection === s.id ? null : s.id)
                        router.push(`/advanced/projects/${project.id}?tab=manuscript`)
                      }}
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-white">{s.label}</span>
                          {s.hasPassage && (
                            <span className="text-[9px] text-indigo-400 bg-indigo-500/10 px-1 py-0.5 rounded">본문</span>
                          )}
                        </div>
                        {s.wordCount === 0 && (
                          <span className="text-[10px] text-slate-600">작성 전</span>
                        )}
                      </td>
                      <td className="text-center py-3 px-2 text-slate-400">{s.wordCount > 0 ? `${s.wordCount}자` : '—'}</td>
                      <td className="text-center py-3 px-2">
                        {greekTotal > 0 ? (
                          <span className={greekFound > 0 ? 'text-emerald-400' : 'text-slate-600'}>
                            {greekFound}/{greekTotal}
                          </span>
                        ) : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="text-center py-3 px-2">
                        <span className={s.illustrationCount > 0 ? 'text-emerald-400' : 'text-slate-600'}>
                          {s.illustrationCount > 0 ? `${s.illustrationCount}개` : '—'}
                        </span>
                      </td>
                      <td className="text-center py-3 px-2">
                        <span className={s.referenceCount > 0 ? 'text-emerald-400' : 'text-slate-600'}>
                          {s.referenceCount > 0 ? `${s.referenceCount}개` : '—'}
                        </span>
                      </td>
                      <td className="text-center py-3 px-2">
                        {s.connectedApp
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mx-auto" />
                          : <span className="text-slate-600">—</span>
                        }
                      </td>
                      <td className="text-center py-3 pl-2">
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} text-[9px] font-bold`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                          {colors.label}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── 원어 사용 맵 ─── */}
      {allGreek.length > 0 && (
        <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">원어 사용 맵</div>
            <span className="text-[10px] text-slate-600">
              {analysis.greekUsages.filter(g => g.used).length}/{allGreek.length} 사용됨
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {analysis.greekUsages.map(g => (
              <div
                key={g.word}
                className={`rounded-xl border p-3 transition-all ${
                  g.used
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-white/5 border-white/10 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${g.used ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  <span className="text-sm font-greek text-white">{g.greek}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{g.word}</span>
                  {!g.used && (
                    <span className="ml-auto text-[9px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded font-bold">미사용</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed mb-1">{g.meaning}</p>
                {g.usedInSections.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {g.usedInSections.map(label => (
                      <span key={label} className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                        {label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 연결 네트워크 그래프 ─── */}
      {hasAnyData && (
        <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">연결 네트워크</div>
            <div className="flex items-center gap-3">
              {Object.keys(dragPositions).length > 0 && (
                <button
                  onClick={() => setDragPositions({})}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  위치 초기화
                </button>
              )}
              {pinnedNode && (
                <button
                  onClick={() => setPinnedNode(null)}
                  className="text-[10px] text-amber-400 hover:text-amber-300 transition-colors"
                >
                  선택 해제
                </button>
              )}
              <span className="text-[10px] text-slate-600">드래그로 이동 · 클릭으로 연결 고정</span>
            </div>
          </div>
          <div className="relative h-[400px] bg-[#04060f]/60 rounded-xl overflow-hidden border border-white/5">
            <svg ref={svgRef} viewBox="0 0 600 400" className="w-full h-full select-none"
              onClick={() => pinnedNode && setPinnedNode(null)}
              style={{ cursor: isDragging ? 'grabbing' : 'default' }}>
              <ConnectionsGraph
                sections={analysis.sections}
                greekUsages={analysis.greekUsages}
                illustrationCount={analysis.illustrationStats.total}
                referenceCount={analysis.referenceStats.total}
                activeNode={activeNode}
                onHover={(id) => { if (!dragStateRef.current) setHoveredNode(id) }}
                onPin={setPinnedNode}
                onSectionClick={(sectionId) => router.push(`/advanced/projects/${project.id}?tab=manuscript&section=${sectionId}`)}
                dragPositions={dragPositions}
                wasDraggingRef={wasDraggingRef}
                dragStateRef={dragStateRef}
                svgRef={svgRef}
              />
            </svg>
            <div className="absolute bottom-3 left-4 flex gap-4 text-[10px] text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" />섹션</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />원어</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />예화</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />참고</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── 개선 포인트 ─── */}
      {analysis.weakPoints.length > 0 && (() => {
        const sorted = [...analysis.weakPoints].sort((a, b) => SEVERITY_META[a.severity].order - SEVERITY_META[b.severity].order)
        const groups: Record<Severity, typeof sorted> = { critical: [], recommended: [], optional: [] }
        sorted.forEach(w => groups[w.severity].push(w))
        return (
          <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest">개선 포인트</div>
              <div className="ml-auto flex items-center gap-2 text-[10px]">
                {groups.critical.length > 0 && (
                  <span className="flex items-center gap-1 text-red-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />{groups.critical.length}
                  </span>
                )}
                {groups.recommended.length > 0 && (
                  <span className="flex items-center gap-1 text-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />{groups.recommended.length}
                  </span>
                )}
                {groups.optional.length > 0 && (
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />{groups.optional.length}
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {sorted.map(w => {
                const meta = SEVERITY_META[w.severity]
                return (
                  <div
                    key={w.id}
                    className={`rounded-xl border ${meta.border} ${meta.bg} p-3 transition-all hover:scale-[1.005]`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        <span className={`inline-block w-2 h-2 rounded-full ${meta.dot}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[11px] font-bold ${meta.color}`}>{w.title}</span>
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${meta.bg} ${meta.color} border ${meta.border}`}>
                            {meta.label}
                          </span>
                          {w.targetNodeId && (
                            <button
                              onClick={() => setPinnedNode(w.targetNodeId!)}
                              className="text-[9px] text-slate-500 hover:text-indigo-300 transition-colors"
                            >
                              노드 확인 →
                            </button>
                          )}
                          {w.link && (
                            <button
                              onClick={() => {
                                const url = w.link!.sectionId
                                  ? `/advanced/projects/${project.id}?tab=${w.link!.tab}&section=${w.link!.sectionId}`
                                  : `/advanced/projects/${project.id}?tab=${w.link!.tab}`
                                router.push(url)
                              }}
                              className="text-[9px] text-slate-500 hover:text-indigo-300 transition-colors ml-auto"
                            >
                              이동 →
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed mt-1">{w.detail}</p>
                        <div className="mt-2 flex items-start gap-1.5 bg-black/30 rounded-lg px-2.5 py-1.5">
                          <CheckCircle2 className="w-3 h-3 text-indigo-400 mt-0.5 shrink-0" />
                          <p className="text-[10px] text-indigo-200/80 leading-relaxed"><span className="font-semibold text-indigo-300">1분 개선:</span> {w.action}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      {/* ─── 하단 네비게이션 ─── */}
      <div className="flex items-center gap-3 pb-8 pt-2">
        <button
          onClick={() => router.push(`/advanced/projects/${project.id}?tab=manuscript`)}
          className="text-sm border border-white/5 hover:border-indigo-500/30 text-slate-200 hover:text-indigo-400 px-5 py-2.5 rounded-xl transition-colors"
        >
          ← 설교 작성
        </button>
        <button
          onClick={() => router.push(`/advanced/projects/${project.id}?tab=versions`)}
          className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-colors font-medium"
        >
          버전 기록 →
        </button>
      </div>
    </div>
  )
}

/* ─── 서브 컴포넌트 ─── */

function StatBox({ value, label, ok }: { value: string; label: string; ok: boolean }) {
  return (
    <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-3">
      <div className={`text-lg font-bold ${ok ? 'text-emerald-400' : 'text-slate-300'}`}>{value}</div>
      <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
    </div>
  )
}

function ConnectionsGraph({
  sections, greekUsages, illustrationCount, referenceCount, activeNode, onHover, onPin, onSectionClick,
  dragPositions, wasDraggingRef, dragStateRef, svgRef,
}: {
  sections: SectionAnalysis[]; greekUsages: GreekUsage[]
  illustrationCount: number; referenceCount: number
  activeNode: string | null; onHover: (id: string | null) => void
  onPin: (id: string | null) => void
  onSectionClick: (sectionId: string) => void
  dragPositions: Record<string, { x: number; y: number }>
  wasDraggingRef: React.MutableRefObject<boolean>
  dragStateRef: React.MutableRefObject<{
    nodeId: string; startMouseX: number; startMouseY: number
    startNodeX: number; startNodeY: number; hasMoved: boolean
  } | null>
  svgRef: React.MutableRefObject<SVGSVGElement | null>
}) {
  const layout = useMemo(() => {
    const nodes: { id: string; label: string; x: number; y: number; r: number; color: string; type: string; isWeak: boolean }[] = []
    const edges: { from: string; to: string; weight: number }[] = []

    const cx = 300, cy = 200
    const sectionRadius = 90

    sections.forEach((s, i) => {
      const angle = (i / Math.max(sections.length, 1)) * Math.PI * 2 - Math.PI / 2
      const x = cx + Math.cos(angle) * sectionRadius
      const y = cy + Math.sin(angle) * sectionRadius
      const r = Math.max(14, Math.min(22, 12 + s.wordCount / 100))
      nodes.push({ id: s.id, label: s.label.length > 5 ? s.label.slice(0, 5) + '…' : s.label, x, y, r, color: '#6366f1', type: 'section', isWeak: s.hasWeakPoint })
    })

    const greekRadius = 150
    greekUsages.forEach((g, i) => {
      const angle = (i / Math.max(greekUsages.length, 1)) * Math.PI * 2 + Math.PI / 6
      const x = cx + Math.cos(angle) * greekRadius
      const y = cy + Math.sin(angle) * greekRadius
      nodes.push({ id: `g:${g.word}`, label: g.greek, x, y, r: 10, color: '#34d399', type: 'greek', isWeak: !g.used })
      sections.forEach(s => {
        if (s.greekWords.find(m => m.word === g.word)?.found) {
          edges.push({ from: s.id, to: `g:${g.word}`, weight: 2 })
        }
      })
    })

    if (illustrationCount > 0) {
      const x = cx
      const y = cy - 195
      nodes.push({ id: '_illustrations', label: `예화 ${illustrationCount}개`, x, y, r: 12, color: '#f59e0b', type: 'ill', isWeak: illustrationCount > 0 && sections.every(s => s.illustrationCount === 0) })
      sections.forEach(s => {
        if (s.illustrationCount > 0) edges.push({ from: s.id, to: '_illustrations', weight: s.illustrationCount })
      })
    }

    if (referenceCount > 0) {
      const x = cx
      const y = cy + 195
      nodes.push({ id: '_references', label: `참고 ${referenceCount}개`, x, y, r: 12, color: '#3b82f6', type: 'ref', isWeak: referenceCount > 0 && sections.every(s => s.referenceCount === 0) })
      sections.forEach(s => {
        if (s.referenceCount > 0) edges.push({ from: s.id, to: '_references', weight: s.referenceCount })
      })
    }

    return { nodes, edges }
  }, [sections, greekUsages, illustrationCount, referenceCount])

  const renderedNodes = useMemo(
    () => layout.nodes.map(n => {
      const d = dragPositions[n.id]
      return d ? { ...n, x: d.x, y: d.y } : n
    }),
    [layout.nodes, dragPositions]
  )

  const nodeById = useMemo(
    () => new Map(renderedNodes.map(n => [n.id, n])),
    [renderedNodes]
  )

  const handleNodeMouseDown = (n: typeof layout.nodes[0]) => (e: React.MouseEvent) => {
    e.stopPropagation()
    const svg = svgRef.current
    if (!svg) return
    const ctm = svg.getScreenCTM()
    if (!ctm) return
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const t = pt.matrixTransform(ctm.inverse())
    const d = dragPositions[n.id]
    dragStateRef.current = {
      nodeId: n.id,
      startMouseX: t.x,
      startMouseY: t.y,
      startNodeX: d ? d.x : n.x,
      startNodeY: d ? d.y : n.y,
      hasMoved: false,
    }
  }

  return (
    <>
      {layout.edges.map((e, i) => {
        const from = nodeById.get(e.from)
        const to = nodeById.get(e.to)
        if (!from || !to) return null
        const isHighlighted = activeNode && (activeNode === e.from || activeNode === e.to)
        return (
          <line
            key={`e${i}`}
            x1={from.x} y1={from.y} x2={to.x} y2={to.y}
            stroke={isHighlighted ? '#6366f1' : '#6366f1'}
            strokeWidth={isHighlighted ? Math.max(1, e.weight * 1.2) : 0}
            strokeOpacity={isHighlighted ? 0.55 : 0}
          />
        )
      })}
      {renderedNodes.map(n => {
        const isConnected = !!activeNode && (activeNode === n.id ||
          layout.edges.some(e => (e.from === n.id || e.to === n.id) && (e.from === activeNode || e.to === activeNode)))
        const isPinned = activeNode === n.id
        return (
          <g
            key={n.id}
            onMouseEnter={() => onHover(n.id)}
            onMouseLeave={() => onHover(null)}
            onMouseDown={handleNodeMouseDown(n)}
            onClick={(ev) => {
              ev.stopPropagation()
              if (wasDraggingRef.current) {
                wasDraggingRef.current = false
                return
              }
              if (n.type === 'section') {
                onSectionClick(n.id)
              } else {
                onPin(isPinned ? null : n.id)
              }
            }}
            className="cursor-grab"
            style={{ opacity: activeNode ? (isConnected ? 1 : 0.25) : 1 }}
          >
            <circle cx={n.x} cy={n.y} r={n.r} fill={n.color} opacity={0.85} />
            {n.isWeak && (
              <circle cx={n.x} cy={n.y} r={n.r + 5} fill="none" stroke="#ef4444" strokeWidth={1.5} className="animate-pulse" opacity={0.7} />
            )}
            {isPinned && (
              <circle cx={n.x} cy={n.y} r={n.r + 4} fill="none" stroke="#fbbf24" strokeWidth={1.5} opacity={0.9} />
            )}
            {n.id.startsWith('g:') && (
              <circle cx={n.x} cy={n.y} r={n.r + 2} fill="none" stroke={n.color} strokeWidth={1} opacity={0.3} />
            )}
            <text
              x={n.x} y={n.y + n.r + 14}
              textAnchor="middle"
              fontSize="9"
              fill={!activeNode || isConnected ? '#cbd5e1' : '#475569'}
              fontFamily="sans-serif"
              fontWeight="500"
            >
              {n.label}
            </text>
          </g>
        )
      })}
    </>
  )
}
