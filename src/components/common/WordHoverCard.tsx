'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Sparkles, Move, Pin } from 'lucide-react'

export interface HoverWordInfo {
  word: string
  lemma?: string
  strong?: string
  partOfSpeech?: string
  basicMeaning?: string
  contextualMeaning?: string
  simpleExplanation?: string
  transliteration?: string
  pronunciation?: string
  verse?: number
  version?: string
  x: number
  y: number
}

interface WordHoverCardProps {
  info: HoverWordInfo | null
  onPin?: () => void
}

export default function WordHoverCard({ info, onPin }: WordHoverCardProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !info) return null

  // Calculate smart position so it stays on screen
  const cardWidth = 320
  const cardHeight = 160

  const posX = typeof window !== 'undefined'
    ? Math.min(Math.max(10, info.x + 12), window.innerWidth - cardWidth - 16)
    : info.x + 12

  const posY = typeof window !== 'undefined'
    ? info.y + cardHeight + 20 > window.innerHeight
      ? Math.max(10, info.y - cardHeight - 12)
      : info.y + 16
    : info.y + 16

  const content = (
    <div
      style={{
        position: 'fixed',
        left: `${posX}px`,
        top: `${posY}px`,
        zIndex: 9998,
        pointerEvents: 'none',
      }}
      className="w-[320px] max-w-[calc(100vw-24px)] bg-[#070b19]/95 backdrop-blur-xl border border-indigo-500/40 rounded-xl shadow-2xl shadow-black/90 ring-1 ring-white/15 p-3.5 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="text-sm font-greek text-indigo-300 font-bold">
            {info.lemma || info.word}
          </span>
          {info.transliteration && (
            <span className="text-[10px] text-slate-400 font-mono">
              ({info.transliteration})
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {info.strong && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold">
              {info.strong}
            </span>
          )}
          {info.partOfSpeech && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
              {info.partOfSpeech}
            </span>
          )}
        </div>
      </div>

      {/* Meanings */}
      {info.basicMeaning && (
        <div className="mb-1.5">
          <span className="text-[10px] text-slate-400 block font-semibold">기본 의미</span>
          <p className="text-slate-100 font-medium leading-snug">{info.basicMeaning}</p>
        </div>
      )}

      {info.contextualMeaning && (
        <div className="mb-2">
          <span className="text-[10px] text-indigo-300 block font-semibold">문맥상 의미</span>
          <p className="text-indigo-100/90 leading-snug line-clamp-2">{info.contextualMeaning}</p>
        </div>
      )}

      {info.simpleExplanation && !info.contextualMeaning && (
        <div className="mb-2">
          <span className="text-[10px] text-amber-300 block font-semibold">쉬운 설명</span>
          <p className="text-amber-100/90 leading-snug line-clamp-2">{info.simpleExplanation}</p>
        </div>
      )}

      {/* Guide Footer */}
      <div className="flex items-center justify-between pt-1.5 border-t border-white/5 text-[9px] text-slate-500">
        <span className="flex items-center gap-1 text-indigo-300/80">
          <Sparkles className="w-2.5 h-2.5" /> 클릭하여 상세 창 고정 및 드래그
        </span>
        <span className="flex items-center gap-0.5 text-slate-400">
          <Move className="w-2.5 h-2.5" /> 이동 가능
        </span>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null
}
