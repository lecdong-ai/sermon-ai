'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, Clipboard, Download, Loader2, RefreshCw, Sparkles, X } from 'lucide-react'
import type { JohnManuscriptData } from '@/lib/advanced/johnManuscriptData'
import { getStorageItem, setStorageItem } from '@/lib/storage'

interface Props {
  manuscript: JohnManuscriptData
  projectId: string
  onClose: () => void
}

const MAX_SOURCE_LENGTH = 60000

export default function AntigravityRewritePanel({ manuscript, projectId, onClose }: Props) {
  const storageKey = `antigravity_rewrite_${projectId}`
  const [result, setResult] = useState(() => getStorageItem<string>(storageKey, ''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const rewrite = useCallback(async () => {
    const sourceLength = manuscript.sections.reduce((total, section) => total + section.content.length, 0)
    if (sourceLength > MAX_SOURCE_LENGTH) {
      setError('원고가 너무 깁니다. 60,000자 이하로 줄인 뒤 다시 시도해주세요.')
      return
    }

    setLoading(true)
    setError(null)
    setCopied(false)
    try {
      const response = await fetch('/api/advanced/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'antigravity-rewrite',
          data: {
            title: manuscript.title,
            passage: manuscript.passage,
            coreMessage: manuscript.coreMessage,
            sections: manuscript.sections,
            referenceNotes: manuscript.referenceNotes,
            illustrationNotes: manuscript.illustrationNotes,
          },
        }),
      })
      const json = await response.json()
      if (!response.ok || !json.success) throw new Error(json.error || '원고 재가공에 실패했습니다.')
      const nextResult = String(json.data?.output || '').trim()
      if (!nextResult) throw new Error('재가공 결과가 비어 있습니다. 다시 시도해주세요.')
      setResult(nextResult)
      setStorageItem(storageKey, nextResult)
    } catch (err: any) {
      setError(err.message || '원고 재가공에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [manuscript, storageKey])

  useEffect(() => {
    if (!result) void rewrite()
  }, [result, rewrite])

  const handleCopy = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  const handleDownload = () => {
    if (!result) return
    const safeTitle = (manuscript.title || '설교').replace(/[\\/:*?"<>|]/g, '_')
    const blob = new Blob([result], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${safeTitle}_안티그래비티_시나리오.md`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-5xl h-[min(900px,calc(100vh-1.5rem))] sm:h-[min(900px,calc(100vh-3rem))] rounded-3xl border border-cyan-400/20 bg-[#07101d] shadow-2xl shadow-cyan-950/40 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-5 sm:px-7 py-4 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 via-transparent to-indigo-500/10">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-cyan-300">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-black">Antigravity Script Rewriter</span>
            </div>
            <h2 className="text-base sm:text-lg text-white font-black mt-1 truncate">말하는 사람과 듣는 사람을 잇는 시나리오</h2>
            <p className="text-[11px] text-slate-500 mt-1">원본 원고는 유지되며, 이 결과는 별도 시나리오로 저장됩니다.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 shrink-0" aria-label="닫기">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 px-5 sm:px-7 py-3 border-b border-white/5 bg-black/10">
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            {result ? '최근 생성 결과' : '새 시나리오 생성'}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={rewrite} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 text-[10px] text-slate-300 font-bold">
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              새로 생성
            </button>
            <button onClick={handleCopy} disabled={!result || loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 disabled:opacity-40 text-[10px] text-cyan-200 font-bold">
              {copied ? <Check className="w-3 h-3" /> : <Clipboard className="w-3 h-3" />}
              {copied ? '복사됨' : '복사'}
            </button>
            <button onClick={handleDownload} disabled={!result || loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 disabled:opacity-40 text-[10px] text-indigo-200 font-bold">
              <Download className="w-3 h-3" />
              다운로드
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin px-5 sm:px-10 py-7 sm:py-10">
          {loading && !result && (
            <div className="h-full min-h-80 flex flex-col items-center justify-center text-center">
              <Sparkles className="w-9 h-9 text-cyan-300 animate-pulse mb-4" />
              <p className="text-sm text-slate-200 font-bold">원고의 메시지와 호흡을 다시 설계하고 있습니다</p>
              <p className="text-[11px] text-slate-500 mt-2">구어체 흐름, 후킹, 적용, 촬영 지시어를 구성하는 중입니다.</p>
            </div>
          )}
          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-center">
              <p className="text-sm text-red-300">{error}</p>
              <button onClick={rewrite} disabled={loading} className="mt-3 px-4 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-xs text-red-200 font-bold">다시 시도</button>
            </div>
          )}
          {result && !error && (
            <article className="max-w-3xl mx-auto text-[14px] sm:text-[15px] leading-[1.95] text-slate-200 whitespace-pre-wrap font-sans selection:bg-cyan-500/30">
              {result.split('\n').map((line, index) => {
                if (/^-{20,}$/.test(line.trim())) {
                  return <hr key={index} className="my-7 border-white/10" />
                }
                if (/^#{1,5}\s/.test(line)) {
                  const heading = line.replace(/^#{1,5}\s+/, '')
                  return <h3 key={index} className="text-lg sm:text-xl font-black text-white mt-7 mb-3">{renderInlineMarkdown(heading)}</h3>
                }
                if (!line.trim()) return <div key={index} className="h-3" />
                return <p key={index} className="min-h-[1.6em]">{renderInlineMarkdown(line)}</p>
              })}
            </article>
          )}
        </div>
      </div>
    </div>
  )
}

function renderInlineMarkdown(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-black text-cyan-100">{part.slice(2, -2)}</strong>
    }
    return <span key={index}>{part}</span>
  })
}
