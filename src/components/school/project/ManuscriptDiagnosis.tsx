'use client'

import { useState, useCallback } from 'react'
import { Loader2, Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import type { JohnManuscriptData, ReferenceNote, IllustrationNote } from '@/lib/school/project/johnManuscriptData'

interface DiagnosisResult {
  overallScore: number
  metrics: { name: string; score: number; feedback: string }[]
  strengths: string[]
  improvements: string[]
  aiSuggestion: string
}

interface Props {
  manuscript: JohnManuscriptData
  referenceNotes: ReferenceNote[]
  illustrationNotes: IllustrationNote[]
}

export default function ManuscriptDiagnosis({ manuscript, referenceNotes, illustrationNotes }: Props) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DiagnosisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDiagnose = useCallback(async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/school/api/sermons/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'manuscript-diagnosis',
          data: {
            sections: manuscript.sections,
            coreMessage: manuscript.coreMessage,
            passage: manuscript.passage,
            referenceNotes,
            illustrationNotes,
          },
        }),
      })

      const json = await res.json()
      if (json.success) {
        setResult(JSON.parse(json.data.output))
      } else {
        setError(json.error || '진단에 실패했습니다.')
      }
    } catch {
      setError('서버에 연결할 수 없습니다.')
    }

    setLoading(false)
  }, [manuscript, referenceNotes, illustrationNotes])

  if (!result && !loading) {
    return (
      <div className="bg-[#0a0e1a] border border-white/5 rounded-xl p-5 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">AI 원고 진단</h3>
          <p className="text-xs text-slate-400 mt-1">설교 원고의 완성도를 AI가 분석합니다.</p>
        </div>
        <button
          onClick={handleDiagnose}
          disabled={loading}
          className="flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          진단 시작
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-[#0a0e1a] border border-white/5 rounded-xl p-5 text-center space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
        <p className="text-sm text-slate-300">AI가 원고를 분석하고 있습니다...</p>
        <p className="text-xs text-slate-500">신학적 깊이, 적용 구체성, 흐름 등을 평가 중입니다.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
        <p className="text-sm text-red-300">{error}</p>
        <button onClick={handleDiagnose} className="mt-2 text-xs text-red-400 hover:text-red-300 underline">
          다시 시도
        </button>
      </div>
    )
  }

  if (!result) return null

  return (
    <div className="bg-[#0a0e1a] border border-white/5 rounded-xl p-5 space-y-5">
      {/* Overall Score */}
      <div className="text-center">
        <div className={`text-4xl font-bold ${
          result.overallScore >= 80 ? 'text-green-400' :
          result.overallScore >= 60 ? 'text-amber-400' :
          'text-red-400'
        }`}>
          {result.overallScore}점
        </div>
        <p className="text-xs text-slate-400 mt-1">전체 완성도</p>
      </div>

      {/* Metrics */}
      <div className="space-y-3">
        {result.metrics.map((m, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">{m.name}</span>
              <span className={`font-bold ${
                m.score >= 80 ? 'text-green-400' :
                m.score >= 60 ? 'text-amber-400' :
                'text-red-400'
              }`}>{m.score}점</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  m.score >= 80 ? 'bg-green-500' :
                  m.score >= 60 ? 'bg-amber-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${m.score}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">{m.feedback}</p>
          </div>
        ))}
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-500/10 rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-green-300 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> 강점
          </div>
          {result.strengths.map((s, i) => (
            <p key={i} className="text-[10px] text-slate-300 leading-relaxed">• {s}</p>
          ))}
        </div>
        <div className="bg-amber-500/10 rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
            <AlertCircle className="w-3.5 h-3.5" /> 보완
          </div>
          {result.improvements.map((s, i) => (
            <p key={i} className="text-[10px] text-slate-300 leading-relaxed">• {s}</p>
          ))}
        </div>
      </div>

      {/* AI Suggestion */}
      {result.aiSuggestion && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-200 leading-relaxed">{result.aiSuggestion}</p>
        </div>
      )}

      <button
        onClick={handleDiagnose}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        다시 진단
      </button>
    </div>
  )
}
