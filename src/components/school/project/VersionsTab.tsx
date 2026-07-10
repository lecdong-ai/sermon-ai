'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProjectDetail } from '@/lib/school/project/types'
import { type StageKey } from '@/components/school/project/shared/StageFlowIndicator'
import { getStorageItem, setStorageItem } from '@/lib/school/storage'
import { getVersions, saveVersion, restoreVersion, deleteVersion, ManuscriptVersion } from '@/lib/school/project/versionManager'
import { JohnManuscriptData, EMPTY_MANUSCRIPT } from '@/lib/school/project/johnManuscriptData'
import {
  getReflections, setReflection,
  getFeedbackList, addFeedback, deleteFeedback,
  VersionReflection, SermonFeedback,
} from '@/lib/school/project/retrospectiveStorage'
import { computeMetrics, diffLines, diffStats, pickPhaseIcon, pickPhaseTone, VersionMetrics } from '@/lib/school/project/retrospectiveHelpers'
import {
  ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Clock, Dna, FileText,
  GitBranch, History, Lightbulb, Mic2, Play, Plus, RefreshCw, Sparkles,
  Star, Trash2, X,
} from 'lucide-react'
import ProjectContextRow from '@/components/school/project/shared/ProjectContextRow'

interface Props { project: ProjectDetail }

interface AIInsight {
  trajectory: string
  highlights: string[]
  concerns: string[]
}

type Tab = 'journey' | 'compare' | 'dna' | 'worship'

export default function VersionsTab({ project }: Props) {
  const router = useRouter()

  const [versions, setVersions] = useState<ManuscriptVersion[]>([])
  const [reflections, setReflections] = useState<VersionReflection[]>([])
  const [feedbackList, setFeedbackList] = useState<SermonFeedback[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('journey')
  const [showSlideIdx, setShowSlideIdx] = useState(0)

  const [snapshotNote, setSnapshotNote] = useState('')
  const [showSnapshotInput, setShowSnapshotInput] = useState(false)
  const [confirmRestore, setConfirmRestore] = useState<ManuscriptVersion | null>(null)

  const [leftVerId, setLeftVerId] = useState<string | null>(null)
  const [rightVerId, setRightVerId] = useState<string | null>(null)

  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const [fbRating, setFbRating] = useState(0)
  const [fbMemo, setFbMemo] = useState('')
  const [fbVersionId, setFbVersionId] = useState<string>('')

  const [reflectionDraft, setReflectionDraft] = useState<Record<string, string>>({})

  useEffect(() => {
    const v = getVersions(project.id)
    setVersions(v)
    setReflections(getReflections(project.id))
    setFeedbackList(getFeedbackList(project.id))
    if (v.length >= 2) {
      setLeftVerId(v[v.length - 1].id)
      setRightVerId(v[0].id)
      setFbVersionId(v[0].id)
    } else if (v.length === 1) {
      setLeftVerId(v[0].id)
      setRightVerId(v[0].id)
      setFbVersionId(v[0].id)
    }
  }, [project.id])

  const currentManuscript: JohnManuscriptData = useMemo(() => {
    const m = getStorageItem<JohnManuscriptData>(`manuscript_${project.id}`, EMPTY_MANUSCRIPT)
    return m && typeof m === 'object' ? m : EMPTY_MANUSCRIPT
  }, [project.id])

  const sortedVersions = useMemo(() =>
    [...versions].sort((a, b) => a.timestamp - b.timestamp), [versions])

  const allMetrics: VersionMetrics[] = useMemo(() => sortedVersions.map(v => computeMetrics(v.label, v.timestamp, v.data)), [sortedVersions])

  const reflectionFor = (versionId: string) => reflections.find(r => r.versionId === versionId)?.note || ''

  /* ── 스냅샷 생성 ── */
  const handleCreateSnapshot = () => {
    if (!currentManuscript.title && (currentManuscript.sections || []).every(s => !s.content?.trim())) {
      alert('스냅샷을 찍으려면 최소한 제목이나 본문이 있어야 합니다.')
      return
    }
    const v = saveVersion(project.id, currentManuscript, snapshotNote.trim())
    setVersions(getVersions(project.id))
    setSnapshotNote('')
    setShowSnapshotInput(false)
    setLeftVerId(v.id)
    setRightVerId(v.id)
  }

  /* ── 스냅샷 복원 ── */
  const handleRestore = (v: ManuscriptVersion) => {
    const data = restoreVersion(project.id, v.id)
    if (!data) return
    setStorageItem(`manuscript_${project.id}`, { ...data, _savedAt: Date.now() })
    setConfirmRestore(null)
    alert(`「${v.label}」로 복원했습니다. 설교 작성 탭에서 확인하세요.`)
    router.push(`/projects/${project.id}?tab=manuscript`)
  }

  const handleDeleteVersion = (v: ManuscriptVersion) => {
    if (!confirm(`「${v.label}」 스냅샷을 삭제하시겠습니까?`)) return
    deleteVersion(project.id, v.id)
    setVersions(getVersions(project.id))
  }

  /* ── 회고 노트 저장 ── */
  const saveReflection = (versionId: string) => {
    const note = reflectionDraft[versionId] ?? reflectionFor(versionId)
    setReflection(project.id, versionId, note)
    setReflections(getReflections(project.id))
  }

  const updateReflectionDraft = (versionId: string, value: string) => {
    setReflectionDraft(prev => ({ ...prev, [versionId]: value }))
  }

  /* ── 예배 회고 ── */
  const submitFeedback = () => {
    if (fbRating === 0) {
      alert('별점을 선택해주세요.')
      return
    }
    addFeedback(project.id, {
      date: new Date().toISOString().slice(0, 10),
      rating: fbRating,
      memo: fbMemo.trim(),
      versionId: fbVersionId || undefined,
    })
    setFeedbackList(getFeedbackList(project.id))
    setFbRating(0)
    setFbMemo('')
  }

  const handleDeleteFeedback = (idx: number) => {
    if (!confirm('이 회고를 삭제하시겠습니까?')) return
    deleteFeedback(project.id, idx)
    setFeedbackList(getFeedbackList(project.id))
  }

  /* ── AI 인사이트 ── */
  const runAiInsight = async () => {
    if (allMetrics.length < 2) {
      alert('인사이트를 뽑으려면 최소 2개 스냅샷이 필요합니다.')
      return
    }
    setAiLoading(true)
    setAiError(null)
    try {
      const res = await fetch('/school/api/sermons/retrospective-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: project.title, snapshots: allMetrics, projectId: project.id }),
      })
      if (!res.ok) throw new Error('분석 실패')
      const data = await res.json()
      setAiInsight(data)
    } catch (e: any) {
      setAiError(e?.message || '오류 발생')
    } finally {
      setAiLoading(false)
    }
  }

  /* ── 빈 상태 ── */
  if (versions.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyJourney
          onCreate={() => setShowSnapshotInput(true)}
          hasContent={!!(currentManuscript.title || (currentManuscript.sections || []).some(s => s.content?.trim()))}
        />
        {showSnapshotInput && (
          <SnapshotModal
            note={snapshotNote}
            setNote={setSnapshotNote}
            onConfirm={handleCreateSnapshot}
            onCancel={() => { setShowSnapshotInput(false); setSnapshotNote('') }}
            isFirst
          />
        )}
        <div className="flex items-center gap-3 pb-8 pt-2">
          <button onClick={() => router.push(`/projects/${project.id}?tab=connections`)} className="text-sm border border-white/5 hover:border-indigo-500/30 text-slate-200 hover:text-indigo-400 px-5 py-2.5 rounded-xl transition-colors">
            ← 연결 보기
          </button>
        </div>
      </div>
    )
  }

  const firstTs = allMetrics[0]?.timestamp || Date.now()
  const lastTs = allMetrics[allMetrics.length - 1]?.timestamp || Date.now()
  const daySpan = Math.max(1, Math.round((lastTs - firstTs) / (1000 * 60 * 60 * 24)))
  const leftVer = versions.find(v => v.id === leftVerId)
  const rightVer = versions.find(v => v.id === rightVerId)

  // Map project.status → StageKey for StageFlowIndicator
  const stageKey: StageKey =
    project.status === 'research' ? 'study' :
    project.status === 'prepare' ? 'prep' :
    'manuscript'

  return (
    <div className="space-y-6">
      {/* Project Context */}
      <ProjectContextRow project={project} currentStage={stageKey} />

      {/* ─── 여정 헤더 ─── */}
      <JourneyHeader
        project={project}
        versions={versions}
        allMetrics={allMetrics}
        daySpan={daySpan}
        onAddSnapshot={() => setShowSnapshotInput(true)}
        onStartSlideshow={() => { setActiveTab('journey'); setShowSlideIdx(allMetrics.length - 1) }}
      />

      {/* ─── 탭 네비게이션 ─── */}
      <div className="flex gap-1 border-b border-white/5 -mb-px">
        {([
          { key: 'journey', label: '🌱 진화', icon: GitBranch },
          { key: 'compare', label: '🔍 비교', icon: History },
          { key: 'dna', label: 'DNA', icon: Dna },
          { key: 'worship', label: '🎤 예배 회고', icon: Mic2 },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-[12px] font-medium transition-colors border-b-2 ${
              activeTab === t.key
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── 탭별 내용 ─── */}
      {activeTab === 'journey' && (
        <JourneyTab
          allMetrics={allMetrics}
          versions={sortedVersions}
          showSlideIdx={showSlideIdx}
          setShowSlideIdx={setShowSlideIdx}
          reflectionFor={reflectionFor}
          reflectionDraft={reflectionDraft}
          updateReflectionDraft={updateReflectionDraft}
          saveReflection={saveReflection}
          onRestoreClick={setConfirmRestore}
          onDeleteVersion={handleDeleteVersion}
        />
      )}

      {activeTab === 'compare' && (
        <CompareTab
          versions={versions}
          leftVer={leftVer}
          rightVer={rightVer}
          setLeftVerId={setLeftVerId}
          setRightVerId={setRightVerId}
        />
      )}

      {activeTab === 'dna' && (
        <DNATab
          allMetrics={allMetrics}
          aiInsight={aiInsight}
          aiLoading={aiLoading}
          aiError={aiError}
          onRunAi={runAiInsight}
        />
      )}

      {activeTab === 'worship' && (
        <WorshipTab
          versions={versions}
          feedbackList={feedbackList}
          fbRating={fbRating}
          setFbRating={setFbRating}
          fbMemo={fbMemo}
          setFbMemo={setFbMemo}
          fbVersionId={fbVersionId}
          setFbVersionId={setFbVersionId}
          onSubmit={submitFeedback}
          onDelete={handleDeleteFeedback}
        />
      )}

      {/* ─── 모달들 ─── */}
      {showSnapshotInput && (
        <SnapshotModal
          note={snapshotNote}
          setNote={setSnapshotNote}
          onConfirm={handleCreateSnapshot}
          onCancel={() => { setShowSnapshotInput(false); setSnapshotNote('') }}
        />
      )}

      {confirmRestore && (
        <RestoreModal
          version={confirmRestore}
          onCancel={() => setConfirmRestore(null)}
          onConfirm={() => handleRestore(confirmRestore)}
        />
      )}

      {/* ─── 하단 네비 ─── */}
      <div className="flex items-center gap-3 pb-8 pt-2">
        <button onClick={() => router.push(`/projects/${project.id}?tab=connections`)} className="text-sm border border-white/5 hover:border-indigo-500/30 text-slate-200 hover:text-indigo-400 px-5 py-2.5 rounded-xl transition-colors">
          ← 연결 보기
        </button>
        <button onClick={() => router.push(`/projects/${project.id}?tab=overview`)} className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-colors font-medium">
          개요로 돌아가기
        </button>
      </div>
    </div>
  )
}

/* ────────────── 여정 헤더 ────────────── */

function JourneyHeader({ project, versions, allMetrics, daySpan, onAddSnapshot, onStartSlideshow }: {
  project: ProjectDetail
  versions: ManuscriptVersion[]
  allMetrics: VersionMetrics[]
  daySpan: number
  onAddSnapshot: () => void
  onStartSlideshow: () => void
}) {
  const max = Math.max(...allMetrics.map(m => m.wordCount), 1)
  const min = Math.min(...allMetrics.map(m => m.wordCount), 0)
  const range = Math.max(max - min, 1)
  const w = 600, h = 60
  const points = allMetrics.map((m, i) => {
    const x = (i / Math.max(allMetrics.length - 1, 1)) * w
    const y = h - ((m.wordCount - min) / range) * h * 0.9 - 4
    return { x, y, m }
  })
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl border border-indigo-500/20 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[10px] font-semibold text-indigo-300 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <BookOpen className="w-3 h-3" />설교 여정
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">{project.title || '(제목 없음)'}</h2>
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <Clock className="w-3 h-3" />
            {daySpan}일 · {versions.length}단계 진화 · {allMetrics[0]?.wordCount || 0}자 → {allMetrics[allMetrics.length - 1]?.wordCount || 0}자
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onStartSlideshow}
            className="flex items-center gap-1.5 text-[11px] bg-white/5 hover:bg-white/10 text-slate-200 px-3 py-2 rounded-lg transition-colors"
          >
            <Play className="w-3.5 h-3.5" /> 여정 보기
          </button>
          <button
            onClick={onAddSnapshot}
            className="flex items-center gap-1.5 text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg transition-colors font-medium"
          >
            <Plus className="w-3.5 h-3.5" /> 스냅샷 찍기
          </button>
        </div>
      </div>
      {allMetrics.length >= 2 && (
        <div className="mt-4">
          <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">분량 변화</div>
          <svg viewBox={`0 0 ${w} ${h + 10}`} className="w-full h-[80px]" preserveAspectRatio="none">
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`${pathD} L ${w} ${h} L 0 ${h} Z`} fill="url(#grad)" />
            <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2" />
            {points.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="4" fill="#6366f1" stroke="#fff" strokeWidth="1" />
                <text x={p.x} y={h + 8} textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="sans-serif">
                  {p.m.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      )}
    </div>
  )
}

/* ────────────── 진화 탭 ────────────── */

function JourneyTab({ allMetrics, versions, showSlideIdx, setShowSlideIdx, reflectionFor, reflectionDraft, updateReflectionDraft, saveReflection, onRestoreClick, onDeleteVersion }: {
  allMetrics: VersionMetrics[]
  versions: ManuscriptVersion[]
  showSlideIdx: number
  setShowSlideIdx: (n: number) => void
  reflectionFor: (id: string) => string
  reflectionDraft: Record<string, string>
  updateReflectionDraft: (id: string, v: string) => void
  saveReflection: (id: string) => void
  onRestoreClick: (v: ManuscriptVersion) => void
  onDeleteVersion: (v: ManuscriptVersion) => void
}) {
  const isSlideshow = showSlideIdx >= 0 && showSlideIdx < allMetrics.length

  if (isSlideshow) {
    return (
      <Slideshow
        allMetrics={allMetrics}
        versions={versions}
        idx={showSlideIdx}
        setIdx={setShowSlideIdx}
        onExit={() => setShowSlideIdx(-1)}
      />
    )
  }

  return (
    <div className="space-y-3">
      {allMetrics.map((m, i) => {
        const v = versions[i]
        const phase = pickPhaseIcon(m.label, i, allMetrics.length)
        const tone = pickPhaseTone(phase.tone)
        const note = reflectionDraft[v.id] ?? reflectionFor(v.id)
        const isDirty = (reflectionDraft[v.id] ?? reflectionFor(v.id)) !== reflectionFor(v.id)
        return (
          <div key={v.id} className={`rounded-xl border ${tone.ring} ${tone.bg} p-4 transition-all hover:scale-[1.005]`}>
            <div className="flex items-start gap-4">
              <div className="shrink-0 text-3xl">{phase.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[10px] font-bold ${tone.text} px-2 py-0.5 rounded`}>{m.label}</span>
                  <span className={`text-[10px] text-slate-400`}>{tone.label}</span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(m.timestamp).toLocaleString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {v.note && <span className="text-[10px] text-slate-400 italic">· {v.note}</span>}
                  <div className="ml-auto flex gap-2">
                    <button onClick={() => onRestoreClick(v)} className="text-[10px] text-indigo-400 hover:text-indigo-300">
                      복원
                    </button>
                    <button onClick={() => onDeleteVersion(v)} className="text-[10px] text-slate-500 hover:text-red-400">
                      <Trash2 className="w-3 h-3 inline" />
                    </button>
                  </div>
                </div>
                <div className="flex gap-4 text-[10px] text-slate-400 mt-2 mb-3 flex-wrap">
                  <span className="inline-flex items-center gap-1"><FileText className="w-3 h-3" />{m.wordCount}자</span>
                  <span className="inline-flex items-center gap-1"><BookOpen className="w-3 h-3" />섹션 {m.sectionCount}</span>
                  <span className="inline-flex items-center gap-1"><Lightbulb className="w-3 h-3" />예화 {m.illCount}</span>
                  <span className="inline-flex items-center gap-1"><BookOpen className="w-3 h-3" />참고 {m.refCount}</span>
                  <span>🇬🇷 원어 {m.greekCount}</span>
                  {m.oneSentenceSummary && <span className="italic text-slate-500">· &ldquo;{m.oneSentenceSummary.slice(0, 50)}{m.oneSentenceSummary.length > 50 ? '…' : ''}&rdquo;</span>}
                </div>
                {m.topKeywords.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mb-3">
                    {m.topKeywords.map(k => (
                      <span key={k} className="text-[9px] bg-white/5 text-slate-300 px-2 py-0.5 rounded-full">{k}</span>
                    ))}
                  </div>
                )}
                <div className="bg-black/30 rounded-lg p-2.5">
                  <div className="text-[9px] text-slate-500 mb-1 flex items-center gap-1">
                    <History className="w-3 h-3" /> 회고 노트
                  </div>
                  <textarea
                    value={note}
                    onChange={e => updateReflectionDraft(v.id, e.target.value)}
                    onBlur={() => isDirty && saveReflection(v.id)}
                    placeholder="이 버전을 떠올리며 한 줄 — 왜 이렇게 바뀌었나, 이 시점에 무슨 일이 있었나"
                    className="w-full bg-transparent text-[11px] text-slate-200 placeholder:text-slate-600 outline-none resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ────────────── 슬라이드쇼 ────────────── */

function Slideshow({ allMetrics, versions, idx, setIdx, onExit }: {
  allMetrics: VersionMetrics[]
  versions: ManuscriptVersion[]
  idx: number
  setIdx: (n: number) => void
  onExit: () => void
}) {
  const m = allMetrics[idx]
  const v = versions[idx]
  const phase = pickPhaseIcon(m.label, idx, allMetrics.length)
  const tone = pickPhaseTone(phase.tone)
  const next = () => setIdx(Math.min(idx + 1, allMetrics.length - 1))
  const prev = () => setIdx(Math.max(idx - 1, 0))

  return (
    <div className="bg-gradient-to-br from-[#04060f] to-indigo-950/30 rounded-2xl border border-indigo-500/30 p-8 min-h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="text-[10px] text-slate-500 uppercase tracking-widest">
          {idx + 1} / {allMetrics.length}
        </div>
        <button onClick={onExit} className="text-slate-500 hover:text-slate-300">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="text-7xl mb-4">{phase.icon}</div>
        <div className={`text-[11px] font-bold ${tone.text} uppercase tracking-widest mb-2`}>{tone.label}</div>
        <div className="text-4xl font-bold text-white mb-2">{m.label}</div>
        <div className="text-[11px] text-slate-500 mb-6">
          {new Date(m.timestamp).toLocaleString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <div className="grid grid-cols-4 gap-3 mb-6 w-full max-w-md">
          {[
            { l: '분량', v: `${m.wordCount}자` },
            { l: '섹션', v: m.sectionCount },
            { l: '예화', v: m.illCount },
            { l: '원어', v: m.greekCount },
          ].map(s => (
            <div key={s.l} className="bg-white/5 rounded-xl p-3">
              <div className="text-lg font-bold text-white">{s.v}</div>
              <div className="text-[9px] text-slate-500 mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
        {m.oneSentenceSummary && (
          <p className="text-sm text-slate-300 italic max-w-md leading-relaxed">&ldquo;{m.oneSentenceSummary}&rdquo;</p>
        )}
        {v.note && (
          <p className="text-[11px] text-slate-500 mt-3 max-w-md">메모: {v.note}</p>
        )}
      </div>
      <div className="flex items-center justify-between mt-6">
        <button onClick={prev} disabled={idx === 0} className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
          <ArrowLeft className="w-4 h-4" /> 이전
        </button>
        <div className="flex gap-1">
          {allMetrics.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-indigo-400 w-6' : 'bg-slate-600'}`}
            />
          ))}
        </div>
        <button onClick={next} disabled={idx === allMetrics.length - 1} className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
          다음 <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

/* ────────────── 비교 탭 ────────────── */

function CompareTab({ versions, leftVer, rightVer, setLeftVerId, setRightVerId }: {
  versions: ManuscriptVersion[]
  leftVer: ManuscriptVersion | undefined
  rightVer: ManuscriptVersion | undefined
  setLeftVerId: (id: string) => void
  setRightVerId: (id: string) => void
}) {
  if (!leftVer || !rightVer) return <div className="text-slate-500 text-sm">비교할 두 버전을 선택해주세요.</div>
  const leftText = (leftVer.data.sections || []).map(s => s.content).join('\n')
  const rightText = (rightVer.data.sections || []).map(s => s.content).join('\n')
  const diff = diffLines(leftText, rightText)
  const stats = diffStats(leftText, rightText)

  return (
    <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-5">
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <select value={leftVer.id} onChange={e => setLeftVerId(e.target.value)} className="bg-white/5 border border-white/10 text-slate-200 text-[11px] px-3 py-1.5 rounded-lg">
          {versions.map(v => <option key={v.id} value={v.id}>{v.label} (이전)</option>)}
        </select>
        <span className="text-slate-600">→</span>
        <select value={rightVer.id} onChange={e => setRightVerId(e.target.value)} className="bg-white/5 border border-white/10 text-slate-200 text-[11px] px-3 py-1.5 rounded-lg">
          {versions.map(v => <option key={v.id} value={v.id}>{v.label} (이후)</option>)}
        </select>
        <div className="ml-auto flex gap-3 text-[10px]">
          <span className="text-emerald-400">+{stats.added} 추가</span>
          <span className="text-red-400">−{stats.removed} 삭제</span>
        </div>
      </div>
      <div className="bg-black/30 rounded-lg p-3 max-h-[500px] overflow-y-auto font-mono text-[11px] leading-relaxed">
        {diff.length === 0 ? (
          <p className="text-slate-500 text-center py-8">두 버전이 동일합니다.</p>
        ) : diff.map((line, i) => (
          <div
            key={i}
            className={`px-2 py-0.5 ${
              line.type === 'add' ? 'bg-emerald-500/10 text-emerald-200' :
              line.type === 'del' ? 'bg-red-500/10 text-red-200 line-through opacity-60' :
              'text-slate-400'
            }`}
          >
            <span className="inline-block w-3 text-slate-600">{line.type === 'add' ? '+' : line.type === 'del' ? '−' : ' '}</span>
            {line.text}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ────────────── DNA 탭 ────────────── */

function DNATab({ allMetrics, aiInsight, aiLoading, aiError, onRunAi }: {
  allMetrics: VersionMetrics[]
  aiInsight: AIInsight | null
  aiLoading: boolean
  aiError: string | null
  onRunAi: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl border border-purple-500/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] font-semibold text-purple-300 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Dna className="w-3 h-3" />메시지 DNA
            </div>
            <p className="text-[11px] text-slate-400">이 설교의 핵심 키워드가 시간에 따라 어떻게 자랐는지</p>
          </div>
        </div>
        <div className="space-y-2">
          {allMetrics.map((m, i) => {
            const prev = allMetrics[i - 1]
            const newKws = prev ? m.topKeywords.filter(k => !prev.topKeywords.includes(k)) : m.topKeywords
            return (
              <div key={m.label} className="bg-black/30 rounded-xl p-3">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-bold text-purple-300 w-12">{m.label}</span>
                  <span className="text-[10px] text-slate-500">{new Date(m.timestamp).toLocaleDateString('ko-KR')}</span>
                  {newKws.length > 0 && i > 0 && (
                    <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full ml-auto">
                      +{newKws.length} 새 키워드
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {m.topKeywords.map(k => {
                    const isNew = newKws.includes(k)
                    return (
                      <span
                        key={k}
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          isNew ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-slate-400'
                        }`}
                      >
                        {k}
                      </span>
                    )
                  })}
                  {m.topKeywords.length === 0 && <span className="text-[10px] text-slate-600 italic">키워드 없음</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* AI 인사이트 */}
      <div className="bg-[#04060f]/60 rounded-xl border border-indigo-500/20 p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] font-semibold text-indigo-300 uppercase tracking-widest flex items-center gap-1.5">
              <Lightbulb className="w-3 h-3" />AI 인사이트
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">이 설교의 진화를 AI가 분석합니다</p>
          </div>
          <button
            onClick={onRunAi}
            disabled={aiLoading || allMetrics.length < 2}
            className="text-[11px] bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5"
          >
            {aiLoading ? <><RefreshCw className="w-3 h-3 animate-spin" /> 분석 중...</> : <><Sparkles className="w-3 h-3" /> {aiInsight ? '다시 분석' : '분석 시작'}</>}
          </button>
        </div>
        {aiError && <p className="text-[11px] text-red-400">{aiError}</p>}
        {aiInsight && (
          <div className="space-y-3 mt-2">
            {aiInsight.trajectory && (
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
                <div className="text-[9px] text-indigo-400 uppercase tracking-widest mb-1">방향성</div>
                <p className="text-[12px] text-indigo-100 leading-relaxed">{aiInsight.trajectory}</p>
              </div>
            )}
            {aiInsight.highlights.length > 0 && (
              <div>
                <div className="text-[9px] text-emerald-400 uppercase tracking-widest mb-1.5">발견</div>
                <ul className="space-y-1">
                  {aiInsight.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-slate-200">
                      <span className="text-emerald-400 mt-1">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {aiInsight.concerns.length > 0 && (
              <div>
                <div className="text-[9px] text-amber-400 uppercase tracking-widest mb-1.5">우려</div>
                <ul className="space-y-1">
                  {aiInsight.concerns.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                      <span className="text-amber-400 mt-1">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        {!aiInsight && !aiLoading && allMetrics.length >= 2 && (
          <p className="text-[11px] text-slate-500 italic">버튼을 눌러 진화를 분석해보세요 (1회 API 호출)</p>
        )}
      </div>
    </div>
  )
}

/* ────────────── 예배 회고 탭 ────────────── */

function WorshipTab({ versions, feedbackList, fbRating, setFbRating, fbMemo, setFbMemo, fbVersionId, setFbVersionId, onSubmit, onDelete }: {
  versions: ManuscriptVersion[]
  feedbackList: SermonFeedback[]
  fbRating: number
  setFbRating: (n: number) => void
  fbMemo: string
  setFbMemo: (s: string) => void
  fbVersionId: string
  setFbVersionId: (s: string) => void
  onSubmit: () => void
  onDelete: (i: number) => void
}) {
  return (
    <div className="space-y-4">
      <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-5">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">새 예배 회고</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">버전</label>
            <select value={fbVersionId} onChange={e => setFbVersionId(e.target.value)} className="w-full bg-white/5 border border-white/10 text-slate-200 text-[11px] px-3 py-2 rounded-lg">
              {versions.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">날짜</label>
            <div className="bg-white/5 border border-white/10 text-slate-300 text-[11px] px-3 py-2 rounded-lg">
              {new Date().toLocaleDateString('ko-KR')}
            </div>
          </div>
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">청중 반응</label>
            <div className="flex gap-1 pt-1.5">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setFbRating(n)}>
                  <Star className={`w-5 h-5 ${n <= fbRating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
        <textarea
          value={fbMemo}
          onChange={e => setFbMemo(e.target.value)}
          placeholder="어떤 부분에서 청중이 반응했나요? 다음에 다시 설교한다면 바꿀 부분은?"
          className="w-full bg-white/5 border border-white/10 text-[12px] text-slate-200 placeholder:text-slate-600 outline-none rounded-lg p-3 mb-3 resize-none"
          rows={3}
        />
        <button onClick={onSubmit} className="text-[11px] bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium">
          회고 저장
        </button>
      </div>

      {feedbackList.length > 0 && (
        <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-5">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">저장된 회고</div>
          <div className="space-y-2">
            {feedbackList.map((fb, i) => {
              const v = versions.find(v => v.id === fb.versionId)
              return (
                <div key={i} className="bg-black/30 rounded-lg p-3 flex items-start gap-3">
                  <div className="shrink-0">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Star key={n} className={`w-3 h-3 ${n <= fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                      ))}
                    </div>
                    <div className="text-[9px] text-slate-500 mt-1">{fb.date}</div>
                    {v && <div className="text-[9px] text-slate-600">{v.label}</div>}
                  </div>
                  <p className="flex-1 text-[11px] text-slate-200 leading-relaxed">{fb.memo || <span className="text-slate-600 italic">메모 없음</span>}</p>
                  <button onClick={() => onDelete(i)} className="text-slate-600 hover:text-red-400 shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ────────────── 빈 상태 ────────────── */

function EmptyJourney({ onCreate, hasContent }: { onCreate: () => void; hasContent: boolean }) {
  return (
    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-500/20 p-12 text-center">
      <div className="text-7xl mb-4">🌱</div>
      <h2 className="text-2xl font-bold text-white mb-2">설교 여정이 아직 시작되지 않았습니다</h2>
      <p className="text-[13px] text-slate-300 leading-relaxed mb-6 max-w-md mx-auto">
        지금 이 순간의 원고를 <span className="text-indigo-300 font-semibold">첫 스냅샷</span>으로 저장하면,
        이후 설교가 자라날 때마다 그 변화를 한눈에 회고할 수 있습니다.
      </p>
      <div className="flex flex-col gap-3 max-w-sm mx-auto mb-6">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>버전별 분량·키워드·예화 변화 추적</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>두 버전 비교 (어디가 바뀌었나)</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>예배 후 청중 반응 기록</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>메시지 DNA 시각화 (어떤 단어가 자랐나)</span>
        </div>
      </div>
      <button
        onClick={onCreate}
        disabled={!hasContent}
        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-colors inline-flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> 첫 스냅샷 찍기
      </button>
      {!hasContent && (
        <p className="text-[10px] text-slate-500 mt-3">설교 작성 탭에서 제목이나 본문을 먼저 작성해주세요</p>
      )}
    </div>
  )
}

/* ────────────── 스냅샷 모달 ────────────── */

function SnapshotModal({ note, setNote, onConfirm, onCancel, isFirst }: {
  note: string
  setNote: (s: string) => void
  onConfirm: () => void
  onCancel: () => void
  isFirst?: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-[#0a0e1a] border border-white/10 rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="text-lg font-bold text-white mb-1">{isFirst ? '🌱 첫 스냅샷' : '📸 스냅샷 찍기'}</div>
        <p className="text-[11px] text-slate-400 mb-4">지금 시점의 원고를 저장합니다. 이 시점에 무슨 일이 있었는지 짧게 메모하면 나중에 회고할 때 큰 도움이 됩니다.</p>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="예: 5/17 설교 후 청중 반응 좋았음 · v2는 2차 청중小组 피드백 반영"
          className="w-full bg-white/5 border border-white/10 text-[12px] text-slate-200 placeholder:text-slate-600 outline-none rounded-lg p-3 resize-none"
          rows={3}
          autoFocus
        />
        <div className="flex gap-2 mt-4 justify-end">
          <button onClick={onCancel} className="text-[11px] text-slate-400 hover:text-slate-200 px-3 py-2 rounded-lg">
            취소
          </button>
          <button onClick={onConfirm} className="text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium">
            저장
          </button>
        </div>
      </div>
    </div>
  )
}

/* ────────────── 복원 모달 ────────────── */

function RestoreModal({ version, onCancel, onConfirm }: {
  version: ManuscriptVersion
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-[#0a0e1a] border border-white/10 rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold text-white">이 버전으로 복원하시겠습니까?</div>
            <div className="text-[10px] text-slate-400">{version.label} · {new Date(version.timestamp).toLocaleString('ko-KR')}</div>
          </div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4 text-[11px] text-amber-200 leading-relaxed">
          <strong>주의:</strong> 현재 원고가 {version.label} 상태로 <em>덮어쓰기</em>됩니다.
          복원 전 현재 상태를 새 스냅샷으로 저장하시려면 먼저 [스냅샷 찍기]를 눌러주세요.
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="text-[11px] text-slate-400 hover:text-slate-200 px-3 py-2 rounded-lg">
            취소
          </button>
          <button onClick={onConfirm} className="text-[11px] bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium">
            복원
          </button>
        </div>
      </div>
    </div>
  )
}
