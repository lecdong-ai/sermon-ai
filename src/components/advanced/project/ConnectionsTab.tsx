'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProjectDetail } from '@/lib/advanced/types'
import { getStorageItem } from '@/lib/storage'
import { AlertCircle, CheckCircle2, ChevronRight, ExternalLink, Loader2 } from 'lucide-react'

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

interface SectionAnalysis {
  id: string; type: string; label: string; wordCount: number; hasPassage: boolean
  greekWords: { word: string; found: boolean }[]
  illustrationCount: number; referenceCount: number
  connectedApp: boolean; score: 'strong' | 'ok' | 'weak' | 'empty'
}

interface GreekUsage {
  word: string; greek: string; meaning: string; note: string
  usedInSections: string[]; used: boolean
}

interface ConnectionAnalysis {
  sections: SectionAnalysis[]; greekUsages: GreekUsage[]
  illustrationStats: { total: number; linked: number; unlinked: number }
  referenceStats: { total: number; linked: number; unlinked: number }
  weakPoints: string[]; overallScore: number
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
  const [selectedSection, setSelectedSection] = useState<string | null>(null)

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
      const greekRatio = greekWords.length > 0 ? greekMatches.filter(m => m.found).length / greekWords.length : 0

      let score: SectionAnalysis['score'] = 'empty'
      if (wc > 0) {
        if (greekRatio > 0.3 && (illCount > 0 || refCount > 0)) score = 'strong'
        else if (greekRatio > 0 || illCount > 0 || refCount > 0) score = 'ok'
        else score = 'weak'
      }

      return {
        id: s.id, type: s.type, label: s.label, wordCount: wc, hasPassage: !!s.passage,
        greekWords: greekMatches, illustrationCount: illCount, referenceCount: refCount,
        connectedApp: hasApp, score,
      }
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

    const weakPoints: string[] = []
    const totalSections = sectionAnalyses.length
    const nonEmptySections = sectionAnalyses.filter(s => s.wordCount > 0)

    if (totalSections === 0) {
      weakPoints.push('원고 섹션이 없습니다. 설교 작성 탭에서 원고를 작성하세요.')
    } else {
      const weakSections = nonEmptySections.filter(s => s.score === 'weak')
      weakSections.forEach(s => {
        if (s.greekWords.filter(m => m.found).length === 0 && greekWords.length > 0)
          weakPoints.push(`「${s.label}」에 연구한 원어가 하나도 사용되지 않았습니다`)
        if (s.illustrationCount === 0 && s.referenceCount === 0)
          weakPoints.push(`「${s.label}」에 연결된 예화나 참고자료가 없습니다`)
      })
      const unusedGreek = greekUsages.filter(g => !g.used)
      unusedGreek.forEach(g => {
        weakPoints.push(`「${g.word}」(${g.greek}) 원어가 원고에 사용되지 않았습니다`)
      })
      if (illustrations.length > 0 && linkedIlls === 0)
        weakPoints.push(`예화 ${illustrations.length}개가 어떤 섹션에도 연결되지 않았습니다`)
      if (apps.length > 0 && !nonEmptySections.some(s => s.connectedApp))
        weakPoints.push('적용 포인트가 원고 섹션과 연결되지 않았습니다')
    }

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

  return (
    <div className="space-y-6">
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
            <span className="text-[10px] text-slate-600">노드에 마우스를 올리면 연결선이 강조됩니다</span>
          </div>
          <div className="relative h-[400px] bg-[#04060f]/60 rounded-xl overflow-hidden border border-white/5">
            <svg viewBox="0 0 600 400" className="w-full h-full">
              <ConnectionsGraph
                sections={analysis.sections}
                greekUsages={analysis.greekUsages}
                illustrationCount={analysis.illustrationStats.total}
                referenceCount={analysis.referenceStats.total}
                hoveredNode={hoveredNode}
                onHover={setHoveredNode}
                projectId={project.id}
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
      {analysis.weakPoints.length > 0 && (
        <div className="bg-[#04060f]/60 rounded-xl border border-amber-500/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest">발견된 연결 약점</div>
            <span className="text-[10px] text-slate-500 ml-auto">{analysis.weakPoints.length}개</span>
          </div>
          <div className="space-y-1.5">
            {analysis.weakPoints.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px] text-amber-200/80 leading-relaxed">
                <span className="w-1 h-1 rounded-full bg-amber-400/50 mt-1.5 shrink-0" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
  sections, greekUsages, illustrationCount, referenceCount, hoveredNode, onHover, projectId,
}: {
  sections: SectionAnalysis[]; greekUsages: GreekUsage[]
  illustrationCount: number; referenceCount: number
  hoveredNode: string | null; onHover: (id: string | null) => void; projectId: string
}) {
  const layout = useMemo(() => {
    const nodes: { id: string; label: string; x: number; y: number; r: number; color: string; type: string }[] = []
    const edges: { from: string; to: string; weight: number }[] = []

    const cx = 300, cy = 180
    const sectionRadius = 130

    sections.forEach((s, i) => {
      const angle = (i / sections.length) * Math.PI * 2 - Math.PI / 2
      const x = cx + Math.cos(angle) * sectionRadius
      const y = cy + Math.sin(angle) * sectionRadius
      const r = Math.max(14, Math.min(26, 14 + s.wordCount / 100))
      nodes.push({ id: s.id, label: s.label.length > 6 ? s.label.slice(0, 6) + '…' : s.label, x, y, r, color: '#6366f1', type: 'section' })
    })

    const greekRadius = 210
    greekUsages.forEach((g, i) => {
      const angle = (i / Math.max(greekUsages.length, 1)) * Math.PI * 2 + Math.PI / 6
      const x = cx + Math.cos(angle) * greekRadius
      const y = cy + Math.sin(angle) * greekRadius
      nodes.push({ id: `g:${g.word}`, label: g.greek, x, y, r: 10, color: '#34d399', type: 'greek' })
      sections.forEach(s => {
        if (s.greekWords.find(m => m.word === g.word)?.found) {
          edges.push({ from: s.id, to: `g:${g.word}`, weight: 2 })
        }
      })
    })

    if (illustrationCount > 0) {
      const angle = 0.3
      const x = cx + Math.cos(angle) * 260
      const y = cy + Math.sin(angle) * 260
      nodes.push({ id: '_illustrations', label: `예화 ${illustrationCount}개`, x, y, r: 12, color: '#f59e0b', type: 'ill' })
      sections.forEach(s => {
        if (s.illustrationCount > 0) edges.push({ from: s.id, to: '_illustrations', weight: s.illustrationCount })
      })
    }

    if (referenceCount > 0) {
      const angle = -0.3
      const x = cx + Math.cos(angle) * 270
      const y = cy + Math.sin(angle) * 270
      nodes.push({ id: '_references', label: `참고 ${referenceCount}개`, x, y, r: 12, color: '#3b82f6', type: 'ref' })
      sections.forEach(s => {
        if (s.referenceCount > 0) edges.push({ from: s.id, to: '_references', weight: s.referenceCount })
      })
    }

    return { nodes, edges }
  }, [sections, greekUsages, illustrationCount, referenceCount])

  return (
    <>
      {layout.edges.map((e, i) => {
        const from = layout.nodes.find(n => n.id === e.from)
        const to = layout.nodes.find(n => n.id === e.to)
        if (!from || !to) return null
        const isHighlighted = !hoveredNode || hoveredNode === e.from || hoveredNode === e.to
        return (
          <line
            key={`e${i}`}
            x1={from.x} y1={from.y} x2={to.x} y2={to.y}
            stroke={isHighlighted ? '#6366f1' : '#1e293b'}
            strokeWidth={isHighlighted ? Math.max(0.5, e.weight * 1.5) : 0.5}
            strokeOpacity={isHighlighted ? 0.4 : 0.1}
            className="transition-all duration-300"
          />
        )
      })}
      {layout.nodes.map(n => {
        const isHighlighted = !hoveredNode || hoveredNode === n.id ||
          layout.edges.some(e => (e.from === n.id || e.to === n.id) && (e.from === hoveredNode || e.to === hoveredNode))
        return (
          <g
            key={n.id}
            onMouseEnter={() => onHover(n.id)}
            onMouseLeave={() => onHover(null)}
            className="cursor-pointer transition-all duration-300"
            style={{ opacity: isHighlighted ? 1 : 0.2 }}
          >
            <circle cx={n.x} cy={n.y} r={n.r} fill={n.color} opacity={0.85} />
            {n.id.startsWith('g:') && (
              <circle cx={n.x} cy={n.y} r={n.r + 2} fill="none" stroke={n.color} strokeWidth={1} opacity={0.3} />
            )}
            <text
              x={n.x} y={n.y + n.r + 14}
              textAnchor="middle"
              fontSize="9"
              fill={isHighlighted ? '#cbd5e1' : '#475569'}
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
