'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  GripHorizontal,
  Move,
  X,
  Minus,
  Maximize2,
  Pin,
  ExternalLink,
  Sparkles,
  Loader2,
} from 'lucide-react'

export interface WordDetailData {
  strong?: string
  lemmaGreek?: string
  transliteration?: string
  pronunciation?: string
  partOfSpeech?: string
  morphology?: string
  basicMeaning?: string
  contextualMeaning?: string
  simpleExplanation?: string
  sermonNote?: string
  usage?: { ref: string; text: string }[]
  relatedWords?: string[]
}

export interface EnglishWordDetailData {
  word: string
  pronunciation?: string
  partOfSpeech?: string
  basicMeaning?: string
  contextualMeaning?: string
  simpleExplanation?: string
  sermonNote?: string
  usage?: { ref: string; text: string }[]
}

interface DraggableWordModalProps {
  isOpen: boolean
  onClose: () => void
  isFloating: boolean
  onToggleFloating?: () => void
  title?: string
  subtitle?: string
  wordData?: WordDetailData | null
  englishData?: EnglishWordDetailData | null
  fallbackWord?: { word: string; clean: string; verse: number } | null
  isLoading?: boolean
  loadingText?: string
}

export default function DraggableWordModal({
  isOpen,
  onClose,
  isFloating,
  onToggleFloating,
  title = '원어 단어 분석',
  subtitle,
  wordData,
  englishData,
  fallbackWord,
  isLoading = false,
  loadingText = 'AI가 이 단어를 정밀 분석하고 있습니다...',
}: DraggableWordModalProps) {
  const [mounted, setMounted] = useState(false)
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 100, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  const posRef = useRef<{ x: number; y: number }>({ x: 100, y: 100 })
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; elemX: number; elemY: number }>({
    mouseX: 0,
    mouseY: 0,
    elemX: 100,
    elemY: 100,
  })

  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const modalWidth = 380
      const defaultX = Math.max(20, window.innerWidth - modalWidth - 360)
      const defaultY = Math.min(130, Math.max(70, window.innerHeight * 0.12))
      setPosition({ x: defaultX, y: defaultY })
      posRef.current = { x: defaultX, y: defaultY }
    }
  }, [])

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // 버튼 클릭 시 드래그 방지
    if ((e.target as HTMLElement).closest('button')) return

    setIsDragging(true)
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      elemX: posRef.current.x,
      elemY: posRef.current.y,
    }
    e.preventDefault()
  }

  // Touch Drag Handlers (Tablet / Mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    if (e.touches.length === 1) {
      setIsDragging(true)
      dragStartRef.current = {
        mouseX: e.touches[0].clientX,
        mouseY: e.touches[0].clientY,
        elemX: posRef.current.x,
        elemY: posRef.current.y,
      }
    }
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.mouseX
      const dy = e.clientY - dragStartRef.current.mouseY
      const modalWidth = modalRef.current?.offsetWidth || 380
      const newX = Math.max(10, Math.min(window.innerWidth - modalWidth - 10, dragStartRef.current.elemX + dx))
      const newY = Math.max(10, Math.min(window.innerHeight - 80, dragStartRef.current.elemY + dy))

      posRef.current = { x: newX, y: newY }
      setPosition({ x: newX, y: newY })
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const dx = e.touches[0].clientX - dragStartRef.current.mouseX
        const dy = e.touches[0].clientY - dragStartRef.current.mouseY
        const modalWidth = modalRef.current?.offsetWidth || 380
        const newX = Math.max(10, Math.min(window.innerWidth - modalWidth - 10, dragStartRef.current.elemX + dx))
        const newY = Math.max(10, Math.min(window.innerHeight - 80, dragStartRef.current.elemY + dy))

        posRef.current = { x: newX, y: newY }
        setPosition({ x: newX, y: newY })
      }
    }

    const handleDragEnd = () => {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleDragEnd)
    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('touchend', handleDragEnd)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleDragEnd)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleDragEnd)
    }
  }, [isDragging])

  if (!mounted || !isOpen || !isFloating) return null

  const displayTitle = fallbackWord
    ? `원어 단어 (${fallbackWord.verse}절)`
    : englishData
    ? title
    : wordData
    ? '원어 단어 분석'
    : title

  const modalContent = (
    <div
      ref={modalRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
        touchAction: 'none',
      }}
      className={`w-[380px] max-w-[calc(100vw-24px)] bg-[#070b19]/95 backdrop-blur-2xl border border-indigo-500/40 rounded-2xl shadow-2xl shadow-black/90 ring-1 ring-white/15 transition-shadow select-none ${
        isDragging ? 'shadow-indigo-500/30 ring-indigo-400/50 cursor-grabbing opacity-95 scale-[1.01]' : 'shadow-black/80'
      }`}
    >
      {/* ─── Draggable Header Bar ─── */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-slate-950/80 rounded-t-2xl cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex items-center gap-2 overflow-hidden pointer-events-none">
          <Move className="w-3.5 h-3.5 text-indigo-300 shrink-0 animate-pulse" />
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-[11px] font-bold text-indigo-200 tracking-wider uppercase truncate">
              {displayTitle}
            </span>
            {subtitle && (
              <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-white/5 truncate">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {/* Dock / Float Toggle */}
          {onToggleFloating && (
            <button
              onClick={onToggleFloating}
              title="우측 사이드바로 고정"
              className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Minimize / Expand Toggle */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? '펼치기' : '최소화'}
            className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            title="닫기"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ─── Window Body ─── */}
      {!isMinimized && (
        <div className="p-4 max-h-[70vh] overflow-y-auto scrollbar-thin text-slate-200 space-y-4 text-xs select-text">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-xs text-indigo-200 font-medium text-center">{loadingText}</p>
              <p className="text-[10px] text-slate-500">원어 사전 및 문맥 정보를 조회하고 있습니다</p>
            </div>
          )}

          {/* Fallback Word State */}
          {!isLoading && fallbackWord && !wordData && (
            <div className="space-y-4">
              <div className="text-center py-5 bg-gradient-to-b from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20">
                <p className="text-2xl font-greek text-indigo-100 font-bold">{fallbackWord.word}</p>
                <p className="text-xs text-slate-400 mt-1">{fallbackWord.clean}</p>
              </div>
              <div className="bg-indigo-500/10 rounded-xl p-4 border border-indigo-500/20 text-center">
                <Sparkles className="w-5 h-5 text-indigo-400 mx-auto mb-1.5" />
                <p className="text-xs text-indigo-200 font-medium">원어 상세 분석 준비 완료</p>
                <p className="text-[11px] text-slate-400 mt-1">본문 단어를 클릭하면 AI가 정밀 분석합니다</p>
              </div>
            </div>
          )}

          {/* Greek / Hebrew Word Data */}
          {!isLoading && wordData && (
            <div className="space-y-4">
              {/* Word Header Banner */}
              <div className="text-center py-4 bg-gradient-to-b from-indigo-500/15 via-purple-500/10 to-transparent rounded-xl border border-indigo-500/25">
                <p className="text-2xl font-greek text-indigo-100 font-bold tracking-wide">
                  {wordData.lemmaGreek}
                </p>
                {wordData.transliteration && (
                  <p className="text-xs text-indigo-300 font-medium mt-1">
                    {wordData.transliteration}
                  </p>
                )}
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {wordData.strong && (
                  <div className="bg-white/5 rounded-lg p-2.5 border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-semibold">Strong 번호</span>
                    <span className="font-mono text-indigo-300 font-bold">{wordData.strong}</span>
                  </div>
                )}
                {wordData.partOfSpeech && (
                  <div className="bg-white/5 rounded-lg p-2.5 border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-semibold">품사</span>
                    <span className="text-slate-200">{wordData.partOfSpeech}</span>
                  </div>
                )}
                {wordData.pronunciation && (
                  <div className="bg-white/5 rounded-lg p-2.5 border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-semibold">발음</span>
                    <span className="text-slate-200">{wordData.pronunciation}</span>
                  </div>
                )}
                {wordData.morphology && (
                  <div className="bg-white/5 rounded-lg p-2.5 border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-semibold">형태</span>
                    <span className="text-slate-200">{wordData.morphology}</span>
                  </div>
                )}
              </div>

              {/* Basic Meaning */}
              {wordData.basicMeaning && (
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    기본 의미
                  </h4>
                  <p className="text-slate-200 leading-relaxed">{wordData.basicMeaning}</p>
                </div>
              )}

              {/* Contextual Meaning */}
              {wordData.contextualMeaning && (
                <div className="bg-indigo-500/10 rounded-xl p-3 border border-indigo-500/20">
                  <h4 className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">
                    문맥상 의미
                  </h4>
                  <p className="text-indigo-100 leading-relaxed">{wordData.contextualMeaning}</p>
                </div>
              )}

              {/* Simple Explanation */}
              {wordData.simpleExplanation && (
                <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <h4 className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                      쉽게 설명하면
                    </h4>
                  </div>
                  <p className="text-amber-200 leading-relaxed">{wordData.simpleExplanation}</p>
                </div>
              )}

              {/* Sermon Note */}
              {wordData.sermonNote && (
                <div className="bg-indigo-950/40 rounded-xl p-3 border-l-2 border-indigo-400 border-y border-r border-indigo-500/20">
                  <h4 className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">
                    설교적 의미 & 묵상 팁
                  </h4>
                  <p className="text-indigo-200/90 leading-relaxed whitespace-pre-wrap">
                    {wordData.sermonNote}
                  </p>
                </div>
              )}

              {/* Bible Usage */}
              {wordData.usage && wordData.usage.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    성경 용례
                  </h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin">
                    {wordData.usage.map((u, i) => (
                      <div key={i} className="text-[11px] text-slate-200 bg-white/5 rounded-lg p-2 border border-white/5">
                        <span className="font-semibold text-indigo-300">{u.ref}: </span>
                        <span>{u.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Words */}
              {wordData.relatedWords && wordData.relatedWords.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    관련 원어
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {wordData.relatedWords.map((r) => (
                      <span
                        key={r}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* English Word Data */}
          {!isLoading && englishData && (
            <div className="space-y-4">
              <div className="text-center py-4 bg-gradient-to-b from-indigo-500/15 via-purple-500/10 to-transparent rounded-xl border border-indigo-500/25">
                <p className="text-2xl font-serif text-white font-bold tracking-wide">
                  {englishData.word}
                </p>
                {englishData.pronunciation && (
                  <p className="text-xs text-indigo-300 font-medium mt-1">
                    {englishData.pronunciation}
                  </p>
                )}
              </div>

              {englishData.partOfSpeech && (
                <div className="bg-white/5 rounded-lg p-2.5 border border-white/5">
                  <span className="text-[10px] text-slate-400 block font-semibold">품사</span>
                  <span className="text-slate-200">{englishData.partOfSpeech}</span>
                </div>
              )}

              {englishData.basicMeaning && (
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    기본 의미
                  </h4>
                  <p className="text-slate-200 leading-relaxed">{englishData.basicMeaning}</p>
                </div>
              )}

              {englishData.contextualMeaning && (
                <div className="bg-indigo-500/10 rounded-xl p-3 border border-indigo-500/20">
                  <h4 className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">
                    문맥상 의미
                  </h4>
                  <p className="text-indigo-100 leading-relaxed">{englishData.contextualMeaning}</p>
                </div>
              )}

              {englishData.simpleExplanation && (
                <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <h4 className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                      쉽게 설명하면
                    </h4>
                  </div>
                  <p className="text-amber-200 leading-relaxed">{englishData.simpleExplanation}</p>
                </div>
              )}

              {englishData.sermonNote && (
                <div className="bg-indigo-950/40 rounded-xl p-3 border-l-2 border-indigo-400 border-y border-r border-indigo-500/20">
                  <h4 className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">
                    설교적 의미 & 묵상 팁
                  </h4>
                  <p className="text-indigo-200/90 leading-relaxed whitespace-pre-wrap">
                    {englishData.sermonNote}
                  </p>
                </div>
              )}

              {englishData.usage && englishData.usage.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    성경 용례
                  </h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin">
                    {englishData.usage.map((u, i) => (
                      <div key={i} className="text-[11px] text-slate-200 bg-white/5 rounded-lg p-2 border border-white/5">
                        <span className="font-semibold text-indigo-300">{u.ref}: </span>
                        <span>{u.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null
}
