'use client'

import { useState, useEffect } from 'react'
import type { ContiItem } from '@/types/conti'
import { mockAICoach, type CoachReport } from '@/lib/conti/mockAi'
import { MOOD_META } from './MoodTagBadge'
import { Sparkles, Loader2, X, Check, AlertTriangle, TrendingUp, TrendingDown, Activity, Music, RefreshCw, Lightbulb } from 'lucide-react'

interface Props {
  items: ContiItem[]
  onClose: () => void
}

const FLOW_ICONS = {
  up: TrendingUp,
  down: TrendingDown,
  arc: Activity,
  flat: Activity,
  irregular: Activity,
} as const

const FLOW_COLORS = {
  up: 'text-rose-300',
  down: 'text-sky-300',
  arc: 'text-amber-300',
  flat: 'text-slate-300',
  irregular: 'text-rose-300',
}

const SCORE_COLOR = (s: number) => s >= 85 ? 'text-emerald-300' : s >= 70 ? 'text-amber-300' : s >= 50 ? 'text-orange-300' : 'text-rose-300'
const SCORE_BG = (s: number) => s >= 85 ? 'from-emerald-500/20 to-emerald-500/5' : s >= 70 ? 'from-amber-500/20 to-amber-500/5' : s >= 50 ? 'from-orange-500/20 to-orange-500/5' : 'from-rose-500/20 to-rose-500/5'

export default function ContiCoachPanel({ items, onClose }: Props) {
  const [report, setReport] = useState<CoachReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    mockAICoach(items).then((r) => {
      if (!cancelled) {
        setReport(r)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [items])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03050c]/85 backdrop-blur-md" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-[#0a0f1f] border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-white flex items-center gap-2">
                AI 콘티 코치
                {report && (
                  <span className={`text-[14px] font-extrabold ${SCORE_COLOR(report.overall_score)}`}>
                    {report.overall_score}점
                  </span>
                )}
              </h2>
              <p className="text-[13px] text-slate-500 font-medium">
                Key · BPM · 분위기를 종합 분석합니다
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-10 h-10 mx-auto mb-3 text-amber-300 animate-spin" />
              <p className="text-[15px] font-bold text-white">콘티를 분석하고 있습니다...</p>
              <p className="text-[12px] text-slate-500 font-medium mt-1">Key 호환성 · BPM 흐름 · 분위기 분포를 점검 중</p>
            </div>
          ) : report ? (
            <div className="space-y-4">
              {/* 점수 + 한 줄 요약 */}
              <div className={`rounded-2xl bg-gradient-to-br ${SCORE_BG(report.overall_score)} border border-white/10 p-5`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[12px] font-extrabold uppercase tracking-widest text-slate-400">
                    전체 점수
                  </div>
                  <div className={`text-2xl font-extrabold ${SCORE_COLOR(report.overall_score)}`}>
                    {report.overall_score}
                    <span className="text-sm text-slate-500 ml-1">/ 100</span>
                  </div>
                </div>
                <p className="text-[14px] font-bold text-white">{report.summary}</p>
              </div>

              {/* Key 분석 */}
              <Section title="🎹 Key 전이" items={report.key_analysis} />

              {/* BPM 분석 */}
              <Section
                title="🎵 BPM 흐름"
                items={report.bpm_analysis.issues.length === 0 && report.bpm_analysis.good.length === 0 ? { issues: [], good: ['BPM 데이터가 충분하지 않습니다.'] } : { issues: report.bpm_analysis.issues, good: report.bpm_analysis.good }}
                extra={
                  report.bpm_analysis.tempo_range && (
                    <div className="flex items-center gap-2 text-[12px] mb-2">
                      <span className="text-slate-500 font-medium">흐름:</span>
                      <span className={`font-bold ${FLOW_COLORS[report.bpm_analysis.flow_pattern]}`}>
                        {report.bpm_analysis.flow_label}
                      </span>
                      <span className="text-slate-700">·</span>
                      <span className="text-slate-400 font-bold">
                        ♩{report.bpm_analysis.tempo_range.min}~{report.bpm_analysis.tempo_range.max} (평균 {report.bpm_analysis.tempo_range.avg})
                      </span>
                    </div>
                  )
                }
              />

              {/* 분위기 분석 */}
              <Section
                title="🎨 분위기 분포"
                items={{ issues: report.mood_analysis.issues, good: report.mood_analysis.good }}
                extra={
                  report.mood_analysis.top_moods.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap mb-2">
                      <span className="text-[12px] text-slate-500 font-medium">주 분위기:</span>
                      {report.mood_analysis.top_moods.map((m) => (
                        <span
                          key={m}
                          className="text-[12px] font-bold text-amber-200"
                        >
                          #{MOOD_META[m as keyof typeof MOOD_META]?.label || m}
                        </span>
                      ))}
                    </div>
                  )
                }
              />

              {/* 한 줄 제안 */}
              {report.flow_suggestion && (
                <div className="rounded-xl bg-indigo-500/[0.08] border border-indigo-500/20 p-3.5 flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-indigo-300 flex-shrink-0 mt-0.5" />
                  <p className="text-[13px] text-indigo-100 font-medium leading-relaxed">
                    {report.flow_suggestion}
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* 풋터 */}
        <div className="flex items-center gap-2 px-6 py-4 border-t border-white/5">
          <button
            onClick={() => {
              setLoading(true)
              mockAICoach(items).then((r) => {
                setReport(r)
                setLoading(false)
              })
            }}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-[13px] font-bold text-slate-400 hover:bg-white/5 disabled:opacity-30"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            다시 분석
          </button>
          <button
            onClick={onClose}
            className="ml-auto px-5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[13px] font-bold transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, items, extra }: { title: string; items: { issues: string[]; good: string[] }; extra?: React.ReactNode }) {
  const hasContent = items.issues.length > 0 || items.good.length > 0
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
      <h3 className="text-[13px] font-extrabold text-slate-300 mb-2">{title}</h3>
      {extra}
      {hasContent ? (
        <div className="space-y-1.5">
          {items.good.map((g, i) => (
            <div key={`g-${i}`} className="flex items-start gap-2 text-[13px]">
              <Check className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span className="text-slate-300 font-medium leading-relaxed">{g}</span>
            </div>
          ))}
          {items.issues.map((iss, i) => (
            <div key={`i-${i}`} className="flex items-start gap-2 text-[13px]">
              <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
              <span className="text-slate-300 font-medium leading-relaxed">{iss}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[12px] text-slate-500 font-medium">데이터가 부족합니다.</p>
      )}
    </div>
  )
}
