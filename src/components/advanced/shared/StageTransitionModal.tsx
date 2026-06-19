'use client'

import { useState, useEffect } from 'react'
import { Loader2, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react'
import type { ProjectStatus } from '@/lib/advanced/types'
import { PROJECT_STATUS_LABELS } from '@/lib/advanced/types'
import { getChecklistForTransition, type StageChecklist, type StageCheckItem } from '@/lib/advanced/stageChecklist'
import { getStorageItem } from '@/lib/storage'

interface Props {
  isOpen: boolean
  onClose: () => void
  from: ProjectStatus
  to: ProjectStatus
  projectId: string
  onConfirm: () => void
}

interface CheckResult {
  item: StageCheckItem
  passed: boolean
  data?: any
}

export default function StageTransitionModal({ isOpen, onClose, from, to, projectId, onConfirm }: Props) {
  const [checking, setChecking] = useState(false)
  const [results, setResults] = useState<CheckResult[]>([])
  const [aiFixing, setAiFixing] = useState<string | null>(null)
  const [showAiFix, setShowAiFix] = useState(false)

  useEffect(() => {
    if (isOpen) {
      runCheck()
    }
  }, [isOpen])

  const runCheck = async () => {
    setChecking(true)
    setResults([])
    setShowAiFix(false)

    const checklist = getChecklistForTransition(from, to)
    if (!checklist) {
      onConfirm()
      return
    }

    // Load relevant data based on stage
    const prepData = getStorageItem<any | null>(`prep_${projectId}`, null)
    const msData = getStorageItem<any | null>(`manuscript_${projectId}`, null)
    const studyData = getStorageItem<any | null>(`study_${projectId}`, null)

    // Merge data for checking
    const mergedData = {
      ...studyData,
      ...prepData,
      ...msData,
    }

    const checkResults: CheckResult[] = checklist.items.map(item => ({
      item,
      passed: item.check(mergedData),
      data: mergedData,
    }))

    setResults(checkResults)
    setChecking(false)

    const passedCount = checkResults.filter(r => r.passed).length
    const passRate = passedCount / checkResults.length

    if (passRate < checklist.minPassRate) {
      setShowAiFix(true)
    }
  }

  const handleAiFix = async () => {
    const failedItems = results.filter(r => !r.passed)
    if (failedItems.length === 0) return

    for (const result of failedItems) {
      setAiFixing(result.item.id)
      try {
        // Determine what AI type to call based on the check
        let aiType = ''
        let aiData: any = {}

        if (result.item.id === 'core-message') {
          aiType = 'core-message'
          aiData = { passage: result.data?.passage || '', book: result.data?.book || '', chapter: result.data?.chapter || 1, verseStart: result.data?.verseStart || 1 }
        } else if (result.item.id === 'outlines') {
          aiType = 'outline'
          aiData = { passage: result.data?.passage || '', book: result.data?.book || '', chapter: result.data?.chapter || 1, verseStart: result.data?.verseStart || 1, coreMessage: result.data?.coreMessage || '' }
        } else if (result.item.id === 'introduction') {
          aiType = 'manuscript-introduction'
          aiData = { passage: result.data?.passage || '', coreMessage: result.data?.coreMessage || '' }
        } else if (result.item.id === 'conclusion') {
          aiType = 'manuscript-conclusion'
          aiData = { coreMessage: result.data?.coreMessage || '' }
        } else if (result.item.id === 'application') {
          aiType = 'manuscript-application-reconstruct'
          aiData = { coreMessage: result.data?.coreMessage || '', applicationPoints: result.data?.applicationPoints || [] }
        }

        if (aiType) {
          const res = await fetch('/api/advanced/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: aiType, data: aiData }),
          })
          const json = await res.json()
          if (json.success) {
            // Store the result in the appropriate place
            if (aiType === 'core-message') {
              const prepData = getStorageItem<any | null>(`prep_${projectId}`, null)
              if (prepData) {
                prepData.coreMessage = json.data.output
                const { setStorageItem } = await import('@/lib/storage')
                setStorageItem(`prep_${projectId}`, { ...prepData, _savedAt: Date.now() })
              }
            }
          }
        }
      } catch { /* continue */ }
      setAiFixing(null)
    }

    // Re-run check
    runCheck()
  }

  const checklist = getChecklistForTransition(from, to)
  if (!checklist && !checking) return null

  const passedCount = results.filter(r => r.passed).length
  const totalCount = results.length
  const passRate = totalCount > 0 ? passedCount / totalCount : 0

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0a0e1a] border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <h2 className="text-sm font-bold text-white">단계 전환 진단</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {PROJECT_STATUS_LABELS[from]} → {PROJECT_STATUS_LABELS[to]}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {checking ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
              <p className="text-sm text-slate-300 font-medium">진단 중...</p>
              <p className="text-xs text-slate-500 mt-1">완료 여부를 확인하고 있습니다</p>
            </div>
          ) : (
            <>
              {/* Progress */}
              <div className="bg-[#04060f]/60 rounded-xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">완료도</span>
                  <span className={`text-sm font-bold ${passRate >= checklist.minPassRate ? 'text-green-400' : 'text-amber-400'}`}>
                    {Math.round(passRate * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${passRate >= checklist.minPassRate ? 'bg-green-500' : 'bg-amber-400'}`}
                    style={{ width: `${passRate * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-2">
                  {passRate >= checklist.minPassRate
                    ? '다음 단계로 넘어갈 준비가 되었습니다!'
                    : `${Math.round(checklist.minPassRate * 100)}% 이상 필요합니다`}
                </p>
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                {results.map((result) => (
                  <div
                    key={result.item.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                      result.passed
                        ? 'bg-green-500/5 border-green-500/20'
                        : 'bg-red-500/5 border-red-500/20'
                    }`}
                  >
                    {result.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`text-xs font-medium ${result.passed ? 'text-green-300' : 'text-red-300'}`}>
                        {result.item.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Fix Button */}
              {showAiFix && (
                <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white">AI가 나머지를 채워줄까요?</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mb-3">
                    완료되지 않은 항목을 AI가 자동으로 생성합니다.
                  </p>
                  <button
                    onClick={handleAiFix}
                    disabled={!!aiFixing}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 text-white text-xs font-bold transition-colors"
                  >
                    {aiFixing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        AI 생성 중...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        AI 자동 완성
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!checking && results.length > 0 && (
          <div className="flex items-center gap-2 p-5 border-t border-white/5">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors"
            >
              취소
            </button>
            <button
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors"
            >
              {passRate >= checklist.minPassRate ? '다음 단계로' : '그래도 넘어가기'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
