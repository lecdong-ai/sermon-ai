'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2, AlertCircle, X, Sparkles, ChevronRight, BookOpen, Zap,
  Loader2, MessageCircle, ArrowRight,
} from 'lucide-react'
import type { ProjectStatus } from '@/lib/advanced/types'
import { PROJECT_STATUS_LABELS } from '@/lib/advanced/types'
import {
  runMultiSourceCheck, loadAggregatedSources, loadAggregatedSourcesAsync, type MultiCheckReport,
  type MultiCheckResult, type InsightInfo, type QuickFill,
} from '@/lib/advanced/stageChecker'
import QuickFillWizard from './QuickFillWizard'

interface Props {
  isOpen: boolean
  onClose: () => void
  from: ProjectStatus
  to: ProjectStatus
  projectId: string
  onConfirm: () => void
  passage?: string
  book?: string
}

type ActivePanel = 'none' | 'quickfill' | 'ai'

export default function StageTransitionModal({ isOpen, onClose, from, to, projectId, onConfirm, passage, book }: Props) {
  const router = useRouter()
  const [report, setReport] = useState<MultiCheckReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [activePanel, setActivePanel] = useState<ActivePanel>('none')
  const [aiBusy, setAiBusy] = useState(false)
  const [aiResult, setAiResult] = useState<any>(null)

  const runCheck = useCallback(async () => {
    setLoading(true)
    try {
      let insights: InsightInfo[] = []
      try {
        const res = await fetch('/api/insights')
        const json = await res.json()
        if (json.success) {
          insights = (json.data || [])
            .filter((n: any) => (n.projectIds || []).includes(projectId))
            .map((n: any) => ({
              id: n.id,
              type: n.type,
              tags: n.tags || [],
              content: n.content || '',
              title: n.title || '',
            }))
        }
      } catch {}

      const sources = await loadAggregatedSourcesAsync(projectId, insights)
      const newReport = runMultiSourceCheck(from, to, sources)
      setReport(newReport)
    } finally {
      setLoading(false)
    }
  }, [projectId, from, to])

  useEffect(() => {
    if (isOpen) runCheck()
  }, [isOpen, runCheck])

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const handleQuickFillSaved = () => {
    setActivePanel('none')
    runCheck()
  }

  const handleAiFill = async () => {
    setAiBusy(true)
    setAiResult(null)
    try {
      const sources = loadAggregatedSources(projectId, [])
      const effectivePassage = passage || (sources.prep?.passage as string) || ''

      if (!effectivePassage) {
        setAiResult({ error: '본문 정보가 없습니다. 프로젝트에 본문이 설정되어 있는지 확인해주세요.' })
        setAiBusy(false)
        return
      }

      const res = await fetch('/api/notes/study-fill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passage: effectivePassage, book }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'AI 채우기 실패')
      setAiResult(json.data)
    } catch (e: any) {
      setAiResult({ error: e?.message || 'AI 채우기 실패' })
    } finally {
      setAiBusy(false)
    }
  }

  const handleAiSave = () => {
    if (!aiResult || aiResult.error) return
    const sources = loadAggregatedSources(projectId, [])
    const merged = {
      ...(sources.study || {}),
      greekWords: aiResult.keyWords?.map((w: string) => ({ word: w, note: '' })) || [],
      commentaries: aiResult.commentaries?.map((c: string, i: number) => ({ text: c, verse: i + 1, author: 'AI 보조' })) || [],
      themes: aiResult.theme ? [aiResult.theme] : [],
      passageStructure: aiResult.passageStructure || sources.study?.passageStructure || '',
    }
    // localStorage에 저장 (기존 study 데이터와 머지)
    const { setStorageItem } = require('@/lib/storage') as typeof import('@/lib/storage')
    setStorageItem(`study_${projectId}`, merged)
    setActivePanel('none')
    setAiResult(null)
    runCheck()
  }

  if (!isOpen) return null
  if (!report && !loading) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0a0e1a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              단계 전환 진단
              <span className="text-[10px] text-slate-500 font-normal">· v2</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {PROJECT_STATUS_LABELS[from]} <span className="text-indigo-400">→</span> {PROJECT_STATUS_LABELS[to]}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
              <p className="text-sm text-slate-300 font-medium">진단 중...</p>
            </div>
          ) : report && (
            <div className="p-5 space-y-4">
              {/* Progress Bar */}
              <div className="bg-[#04060f]/60 rounded-xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">진행률</span>
                  <span className={`text-sm font-bold ${report.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {report.passedCount}/{report.totalCount} ({Math.round(report.passRate * 100)}%)
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${report.passed ? 'bg-emerald-500' : 'bg-amber-400'}`}
                    style={{ width: `${report.passRate * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-2">
                  {report.passed
                    ? '✓ 다음 단계로 넘어갈 준비가 되었습니다'
                    : `여러 경로로 보충할 수 있어요 · 임계 ${Math.round(report.threshold * 100)}%`}
                </p>
              </div>

              {/* Checklist with multi-source display */}
              <div className="space-y-2">
                {report.results.map((r) => (
                  <ChecklistRow key={r.id} result={r} />
                ))}
              </div>

              {/* 4-Path Selection */}
              {!report.passed && activePanel === 'none' && (
                <div className="space-y-2 pt-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">어떻게 채울까요?</p>
                  <PathOption
                    icon="🌱"
                    label="통찰로 충족"
                    desc="이미 기록한 통찰이 있으면 자동으로 인정됩니다"
                    onClick={() => {
                      // refresh from DB
                      runCheck()
                    }}
                    disabled={!hasInsightPath(report)}
                    badge="자동"
                  />
                  <PathOption
                    icon="📖"
                    label="성경 연구로 이동"
                    desc="깊이 있는 원어·주석 연구를 직접 진행합니다"
                    onClick={() => {
                      onClose()
                      router.push(`/advanced/projects/${projectId}?tab=study`)
                    }}
                  />
                  <PathOption
                    icon="🤖"
                    label="AI 자동 생성"
                    desc="30초 안에 본문 기반 원어·주석·주제를 자동 채웁니다"
                    onClick={() => {
                      setActivePanel('ai')
                      handleAiFill()
                    }}
                    badge="1분"
                  />
                  <PathOption
                    icon="✏️"
                    label="1분 안에 채우기"
                    desc="핵심 단어·주석·주제를 직접 입력합니다"
                    onClick={() => setActivePanel('quickfill')}
                  />
                </div>
              )}

              {/* QuickFill Panel */}
              {activePanel === 'quickfill' && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">✏️ 1분 안에 채우기</p>
                    <button onClick={() => setActivePanel('none')} className="text-[10px] text-slate-500 hover:text-slate-300">
                      ← 돌아가기
                    </button>
                  </div>
                  <QuickFillWizard
                    projectId={projectId}
                    initial={loadAggregatedSources(projectId, []).quickfill}
                    passageHint={passage || ''}
                    onSaved={handleQuickFillSaved}
                    onCancel={() => setActivePanel('none')}
                  />
                </div>
              )}

              {/* AI Panel */}
              {activePanel === 'ai' && (
                <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">🤖 AI 자동 생성</p>
                    <button onClick={() => { setActivePanel('none'); setAiResult(null) }} className="text-[10px] text-slate-500 hover:text-slate-300">
                      ← 돌아가기
                    </button>
                  </div>
                  {aiBusy ? (
                    <div className="flex items-center gap-2 py-3 text-[11px] text-slate-400">
                      <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                      AI가 본문을 분석하고 있습니다...
                    </div>
                  ) : aiResult?.error ? (
                    <p className="text-[11px] text-red-300">⚠ {aiResult.error}</p>
                  ) : aiResult ? (
                    <>
                      <div>
                        <p className="text-[9px] text-slate-500 font-bold mb-1">핵심 단어</p>
                        <div className="flex flex-wrap gap-1">
                          {aiResult.keyWords?.map((w: string, i: number) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-300 font-bold">{w}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500 font-bold mb-1">주석 메모</p>
                        <div className="space-y-1">
                          {aiResult.commentaries?.map((c: string, i: number) => (
                            <p key={i} className="text-[10px] text-slate-400 leading-relaxed line-clamp-2 font-medium">· {c}</p>
                          ))}
                        </div>
                      </div>
                      {aiResult.theme && (
                        <div>
                          <p className="text-[9px] text-slate-500 font-bold mb-1">주제</p>
                          <p className="text-[11px] font-bold text-emerald-300">{aiResult.theme}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={handleAiFill}
                          className="text-[10px] font-bold text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-white/5"
                        >
                          ↻ 다시
                        </button>
                        <button
                          onClick={handleAiSave}
                          className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors"
                        >
                          저장하고 통과
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && report && activePanel === 'none' && (
          <div className="flex items-center gap-2 p-5 border-t border-white/5 shrink-0">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition-colors ${
                report.passed
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
            >
              {report.passed
                ? '✓ 다음 단계로'
                : '그래도 넘어가기'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function hasInsightPath(report: MultiCheckReport): boolean {
  return report.results.some((r) => r.availablePaths.includes('insight'))
}

function ChecklistRow({ result }: { result: MultiCheckResult }) {
  return (
    <div className={`rounded-lg border p-2.5 ${
      result.passed
        ? 'bg-emerald-500/5 border-emerald-500/20'
        : 'bg-amber-500/5 border-amber-500/20'
    }`}>
      <div className="flex items-start gap-2.5">
        {result.passed ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`text-[12px] font-bold ${result.passed ? 'text-emerald-300' : 'text-amber-300'}`}>{result.label}</p>
            <span className="text-[10px] text-slate-500 font-bold tabular-nums">{result.satisfied}/{result.required}</span>
          </div>
          {result.contributors.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {result.contributors.map((c, i) => (
                <span key={i} className="inline-flex items-center gap-0.5 text-[9px] font-bold text-slate-400 bg-white/5 border border-white/5 rounded-full px-1.5 py-0.5">
                  <span className="text-slate-500">{SOURCE_ICON[c.source]}</span>
                  <span>{c.detail}</span>
                  <span className="text-emerald-400 ml-0.5">×{c.count}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const SOURCE_ICON: Record<string, string> = {
  study: '📖',
  insight: '💡',
  quickfill: '✏️',
  prep: '📝',
  manuscript: '✍️',
}

function PathOption({ icon, label, desc, onClick, disabled, badge }: {
  icon: string
  label: string
  desc: string
  onClick: () => void
  disabled?: boolean
  badge?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-colors text-left group disabled:opacity-30 disabled:cursor-not-allowed"
    >
      <div className="text-2xl shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-[12px] font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">{label}</p>
          {badge && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {badge}
            </span>
          )}
        </div>
        <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">{desc}</p>
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
    </button>
  )
}
