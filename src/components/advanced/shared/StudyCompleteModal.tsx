'use client'

import { useState } from 'react'
import { ArrowRight, BarChart3, CheckCircle2, Copy, Download, Image, ListTree, Loader2, MessageSquare, Sparkles, Target, Users, X } from 'lucide-react'
import { setStorageItem } from '@/lib/storage'

interface Props {
  isOpen: boolean
  onClose: () => void
  studyData: any
  projectId: string
  onSendToPrep: () => void
}

interface PrepPackage {
  coreMessages: { style: string; coreMessage: string; reason: string }[]
  outlines: { title: string; description: string; relatedVerse: string; applicationNote: string; transitionNote: string }[]
  applicationPoints: { point: string; audienceTag: string; pastoralNote: string }[]
  deliveryIntro: string
  deliveryConclusion: string
  deliveryFlow: string
  smallGroupQuestions: { question: string; type: string }[]
  cardNewsContent: { slide: number; title: string; content: string }[]
  pptOutline: { slide: number; title: string; bulletPoints: string[] }[]
}

export default function StudyCompleteModal({ isOpen, onClose, studyData, projectId, onSendToPrep }: Props) {
  const [generating, setGenerating] = useState(false)
  const [prepPackage, setPrepPackage] = useState<PrepPackage | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    setPrepPackage(null)

    try {
      const words = studyData?.words || {}
      const wordList = Object.values(words).slice(0, 5)

      const res = await fetch('/api/advanced/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'study-to-prep',
          data: {
            passage: studyData?.passage || '',
            themes: studyData?.themes || [],
            commentaries: studyData?.commentaries || [],
            words: wordList,
            contextInfo: studyData?.contextInfo || {},
            memoText: '',
          },
        }),
      })

      const json = await res.json()
      if (json.success) {
        const parsed = JSON.parse(json.data.output)
        setPrepPackage(parsed)

        // Auto-save to prep storage
        const prepPayload = {
          sermonTitle: '',
          coreMessage: parsed.coreMessages?.[0]?.coreMessage || '',
          sermonPurpose: '',
          expectedResponse: '',
          passageStructure: studyData?.contextInfo?.bookStructure || '',
          contextPoints: [
            ...(studyData?.themes || []).map((t: any) => `${t.name}: ${t.description}`),
          ].slice(0, 5),
          keyWords: wordList.map((w: any) => ({
            word: w.lemmaGreek ? `${w.lemmaGreek} (${w.lemma || ''})` : w.word || '',
            meaning: w.basicMeaning || '',
            note: w.contextualMeaning || w.simpleExplanation || '',
          })),
          researchInsights: (studyData?.commentaries || []).slice(0, 5).map((c: any) => c.text),
          outlines: parsed.outlines || [],
          applicationPoints: parsed.applicationPoints || [],
          congregationProfile: {},
          deliveryIntro: parsed.deliveryIntro || '',
          deliveryFlow: parsed.deliveryFlow || '',
          deliveryTransitions: parsed.outlines?.map((o: any) => o.transitionNote).filter(Boolean) || [],
          deliveryConclusion: parsed.deliveryConclusion || '',
          prepStatus: 'ready' as const,
        }

        setStorageItem(`prep_${projectId}`, { ...prepPayload, _savedAt: Date.now() })
        sessionStorage.setItem(`sermonai_study_to_prep_${projectId}`, JSON.stringify(prepPayload))
        ;(window as any).__prepDataBuffer = prepPayload
      } else {
        setError(json.error || '생성에 실패했습니다.')
      }
    } catch {
      setError('서버에 연결할 수 없습니다.')
    }

    setGenerating(false)
  }

  const handleCopyResults = () => {
    if (!prepPackage) return
    const text = formatAsMarkdown(prepPackage, studyData)
    navigator.clipboard.writeText(text)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0a0e1a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">연구 완료 — 설교 자료 자동 생성</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">AI가 연구 결과를 설교 자료로 변환합니다</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {!prepPackage && !generating && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">연구가 완료되었습니다!</h3>
              <p className="text-sm text-slate-400 mb-6">
                AI가 연구 결과를 바탕으로 설교 준비 자료를 자동 생성합니다.
              </p>
              <button
                onClick={handleGenerate}
                className="flex items-center gap-2 mx-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors shadow-lg shadow-indigo-600/20"
              >
                <Sparkles className="w-4 h-4" />
                설교 자료 생성하기
              </button>
            </div>
          )}

          {generating && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
              <p className="text-sm text-slate-300 font-medium">AI가 설교 자료를 생성하고 있습니다...</p>
              <p className="text-xs text-slate-500 mt-1">중심명제, 대지 구조, 적용 포인트 등을 생성 중입니다 (15-30초)</p>
              <div className="w-full max-w-md space-y-3 mt-6 animate-pulse">
                <div className="h-4 bg-white/5 rounded-xl w-3/4" />
                <div className="h-4 bg-white/5 rounded-xl w-full" />
                <div className="h-4 bg-white/5 rounded-xl w-5/6" />
                <div className="h-20 bg-white/5 rounded-xl w-full" />
                <div className="h-4 bg-white/5 rounded-xl w-2/3" />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
              <p className="text-sm text-red-300">{error}</p>
              <button
                onClick={handleGenerate}
                className="mt-3 text-xs text-red-400 hover:text-red-300 underline"
              >
                다시 시도
              </button>
            </div>
          )}

          {prepPackage && (
            <div className="space-y-4">
              {/* Success Banner */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-300">설교 자료가 생성되었습니다!</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">설교 준비 탭으로 이동하면 모든 자료가 이미 준비되어 있습니다.</p>
                </div>
              </div>

              {/* Generated Items */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  icon={MessageSquare}
                  label="중심명제"
                  value={`${prepPackage.coreMessages?.length || 0}개`}
                  preview={prepPackage.coreMessages?.[0]?.coreMessage?.slice(0, 30)}
                />
                <StatCard
                  icon={ListTree}
                  label="대지 구조"
                  value={`${prepPackage.outlines?.length || 0}대지`}
                  preview={prepPackage.outlines?.[0]?.title}
                />
                <StatCard
                  icon={Target}
                  label="적용 포인트"
                  value={`${prepPackage.applicationPoints?.length || 0}개`}
                  preview={prepPackage.applicationPoints?.[0]?.point?.slice(0, 30)}
                />
                <StatCard
                  icon={Users}
                  label="소그룹 질문"
                  value={`${prepPackage.smallGroupQuestions?.length || 0}개`}
                  preview={prepPackage.smallGroupQuestions?.[0]?.question?.slice(0, 30)}
                />
                <StatCard
                  icon={Image}
                  label="카드뉴스"
                  value={`${prepPackage.cardNewsContent?.length || 0}장`}
                  preview={prepPackage.cardNewsContent?.[0]?.title}
                />
                <StatCard
                  icon={BarChart3}
                  label="PPT 개요"
                  value={`${prepPackage.pptOutline?.length || 0}장`}
                  preview={prepPackage.pptOutline?.[0]?.title}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleCopyResults}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors border border-white/5"
                >
                  <Copy className="w-4 h-4" />
                  결과 복사
                </button>
                <button
                  onClick={onSendToPrep}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors"
                >
                  설교 준비 탭으로
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, preview }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; preview?: string }) {
  return (
    <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-indigo-300" />
        </div>
        <div>
          <p className="text-[10px] text-slate-500">{label}</p>
          <p className="text-sm font-bold text-white">{value}</p>
        </div>
      </div>
      {preview && <p className="text-[10px] text-slate-400 truncate">{preview}...</p>}
    </div>
  )
}

function formatAsMarkdown(prep: PrepPackage, studyData: any): string {
  let md = `# ${studyData?.passage || ''} 연구 결과\n\n`

  if (prep.coreMessages?.length) {
    md += `## 중심명제 후보\n\n`
    prep.coreMessages.forEach((m, i) => {
      md += `${i + 1}. **${m.coreMessage}** (${m.style}) — ${m.reason}\n`
    })
    md += '\n'
  }

  if (prep.outlines?.length) {
    md += `## 대지 구조\n\n`
    prep.outlines.forEach((o, i) => {
      md += `${i + 1}. **${o.title}** (${o.relatedVerse})\n   ${o.description}\n`
    })
    md += '\n'
  }

  if (prep.applicationPoints?.length) {
    md += `## 적용 포인트\n\n`
    prep.applicationPoints.forEach((a, i) => {
      md += `- [${a.audienceTag}] ${a.point}\n`
    })
    md += '\n'
  }

  if (prep.smallGroupQuestions?.length) {
    md += `## 소그룹 나눔 질문\n\n`
    prep.smallGroupQuestions.forEach((q, i) => {
      md += `${i + 1}. ${q.question}\n`
    })
    md += '\n'
  }

  return md
}
