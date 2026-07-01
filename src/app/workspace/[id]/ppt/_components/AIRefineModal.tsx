'use client'

import { useState } from 'react'
import { Sparkles, X, Loader2, Check, RotateCcw, Wand2 } from 'lucide-react'
import type { PPTShare, Summary } from '@/types'

interface Props {
  open: boolean
  slide: PPTShare
  index: number
  sermonContext?: {
    title?: string
    passage?: string
    summary?: Summary | null
  }
  onClose: () => void
  onApply: (refined: PPTShare) => void
}

const PRESET_PROMPTS = [
  { label: '더 간결하게', icon: '✂️', prompt: '각 불릿을 10자 내외로 줄여서 더 간결하게 만들어주세요.' },
  { label: '예화 추가', icon: '📖', prompt: '각 포인트에 짧은 예화나 비유를 추가해서 이해하기 쉽게 만들어주세요.' },
  { label: '질문형으로', icon: '❓', prompt: '각 포인트를 회중이 스스로 생각해볼 수 있는 질문 형태로 바꿔주세요.' },
  { label: '감성적으로', icon: '💝', prompt: '따뜻하고 감성적인 어조로 다시 작성해주세요. 위로와 은혜가 느껴지게.' },
  { label: '본문 인용 추가', icon: '✝️', prompt: '각 포인트에 관련된 성경 구절을 인용으로 추가해주세요.' },
  { label: '어린이를 위해', icon: '🧒', prompt: '어린 아이도 이해할 수 있는 쉬운 단어와 비유를 사용해서 다시 작성해주세요.' },
]

export default function AIRefineModal({ open, slide, index, sermonContext, onClose, onApply }: Props) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [refined, setRefined] = useState<PPTShare | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const handleRefine = async () => {
    if (!prompt.trim()) {
      setError('리파인 요청을 입력해주세요.')
      return
    }
    setLoading(true)
    setError(null)
    setRefined(null)
    try {
      const sermonId = window.location.pathname.match(/\/workspace\/([^/]+)\/ppt/)?.[1]
      if (!sermonId) throw new Error('설교 ID를 찾을 수 없습니다.')

      const res = await fetch(`/api/ppt/${sermonId}/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slide,
          prompt: prompt.trim(),
          context: {
            summaryIntro: sermonContext?.summary?.intro,
            passageText: sermonContext?.summary?.passage_text,
          },
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || '리파인 실패')
      setRefined({
        title: data.data.title,
        content: data.data.content,
        style: data.data.style,
        icon: data.data.icon,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = () => {
    if (refined) {
      onApply(refined)
      handleReset()
      onClose()
    }
  }

  const handleReset = () => {
    setPrompt('')
    setRefined(null)
    setError(null)
  }

  const handlePresetClick = (presetPrompt: string) => {
    setPrompt(presetPrompt)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-fuchsia-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-800">AI 리파인</h2>
              <p className="text-[11px] text-gray-500">슬라이드 {index + 1} · {slide.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
              <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-[12px] text-red-700">{error}</p>
            </div>
          )}

          {/* 프리셋 */}
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">빠른 요청</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {PRESET_PROMPTS.map(p => (
                <button
                  key={p.label}
                  onClick={() => handlePresetClick(p.prompt)}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-gray-50 hover:bg-violet-50 text-left text-[11px] text-gray-700 hover:text-violet-700 transition-colors border border-transparent hover:border-violet-200"
                >
                  <span className="text-[14px]">{p.icon}</span>
                  <span className="font-bold">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 프롬프트 인풋 */}
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">리파인 요청</p>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="예: 이 슬라이드의 포인트를 3개로 줄이고, 각 포인트에 짧은 예화를 추가해주세요."
              rows={3}
              className="w-full px-3 py-2.5 text-[13px] text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-violet-300 focus:ring-2 focus:ring-violet-100 outline-none transition-all resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault()
                  handleRefine()
                }
              }}
            />
            <p className="text-[10px] text-gray-400 mt-1">Ctrl/Cmd + Enter로 실행</p>
          </div>

          {/* 생성 버튼 */}
          <button
            onClick={handleRefine}
            disabled={loading || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-[13px] font-bold shadow-md shadow-violet-200 hover:shadow-lg hover:shadow-violet-300 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                AI가 리파인 중...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                리파인 실행
              </>
            )}
          </button>

          {/* 결과 미리보기 */}
          {refined && (
            <div className="rounded-xl border-2 border-violet-200 bg-violet-50/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-violet-700 uppercase tracking-wider">리파인 결과</p>
                <button
                  onClick={() => setRefined(null)}
                  className="text-[11px] text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  다시 생성
                </button>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">제목</p>
                <p className="text-[14px] font-bold text-gray-800">{refined.title}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">스타일 · 아이콘</p>
                <p className="text-[12px] text-gray-600">{refined.style} · {refined.icon}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">본문</p>
                <pre className="text-[12px] text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
{refined.content}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        {refined && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg text-[12px] font-bold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-[12px] font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              적용
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
