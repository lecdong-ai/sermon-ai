'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Play, Pause, RotateCcw, SkipForward, SkipBack, CheckCircle2 } from 'lucide-react'
import type { JohnManuscriptData } from '@/lib/school/project/johnManuscriptData'

interface Props {
  manuscript: JohnManuscriptData
  onClose: () => void
}

interface SectionTiming {
  id: string
  label: string
  duration: number
}

export default function PracticeMode({ manuscript, onClose }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [sectionElapsed, setSectionElapsed] = useState(0)
  const [timings, setTimings] = useState<SectionTiming[]>(
    manuscript.sections.map(s => ({ id: s.id, label: s.label, duration: 0 }))
  )
  const [isFinished, setIsFinished] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentSection = manuscript.sections[currentIdx]

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setElapsed(prev => prev + 1)
        setSectionElapsed(prev => prev + 1)
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning])

  const handleNext = useCallback(() => {
    // Save current section timing
    setTimings(prev => prev.map((t, i) => i === currentIdx ? { ...t, duration: t.duration + sectionElapsed } : t))
    setSectionElapsed(0)

    if (currentIdx < manuscript.sections.length - 1) {
      setCurrentIdx(prev => prev + 1)
    } else {
      // Finished
      setTimings(prev => prev.map((t, i) => i === currentIdx ? { ...t, duration: t.duration + sectionElapsed } : t))
      setIsRunning(false)
      setIsFinished(true)
    }
  }, [currentIdx, sectionElapsed, manuscript.sections.length])

  const handlePrev = useCallback(() => {
    if (currentIdx > 0) {
      setTimings(prev => prev.map((t, i) => i === currentIdx ? { ...t, duration: t.duration + sectionElapsed } : t))
      setSectionElapsed(0)
      setCurrentIdx(prev => prev - 1)
    }
  }, [currentIdx, sectionElapsed])

  const handleReset = () => {
    setIsRunning(false)
    setElapsed(0)
    setSectionElapsed(0)
    setCurrentIdx(0)
    setTimings(manuscript.sections.map(s => ({ id: s.id, label: s.label, duration: 0 })))
    setIsFinished(false)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (isFinished) {
    return (
      <div className="fixed inset-0 z-50 bg-[#04060f] flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full bg-[#0a0e1a] border border-white/10 rounded-2xl p-8 space-y-6">
          <div className="text-center">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white">연습 완료!</h2>
            <p className="text-slate-400 mt-2">총 소요 시간: {formatTime(elapsed)}</p>
          </div>

          <div className="space-y-2">
            {timings.map((t, i) => (
              <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg bg-white/5">
                <span className="text-slate-300">{t.label}</span>
                <span className="text-white font-mono">{formatTime(t.duration)}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-bold transition-colors"
            >
              닫기
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              다시 연습
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#04060f] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-slate-400">
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-white">{manuscript.title}</h2>
            <p className="text-xs text-slate-500">{currentSection.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-2xl font-mono text-white font-bold">
            {formatTime(elapsed)}
          </div>
          <div className="text-sm font-mono text-indigo-400">
            {currentIdx + 1} / {manuscript.sections.length}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto flex items-center justify-center p-8">
        <div className="max-w-3xl w-full space-y-6">
          <h1 className="text-3xl font-serif font-bold text-white mb-6">{currentSection.label}</h1>
          <p className="text-xl leading-loose text-slate-200 font-serif whitespace-pre-wrap">
            {currentSection.content}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 px-6 py-6 border-t border-white/5 bg-[#0a0e1a]">
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 transition-colors"
        >
          <SkipBack className="w-6 h-6" />
        </button>

        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`p-4 rounded-full transition-colors ${
            isRunning ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
        </button>

        <button
          onClick={handleNext}
          className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
        >
          <SkipForward className="w-6 h-6" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-white/5">
        <div
          className="h-full bg-indigo-600 transition-all duration-1000"
          style={{ width: `${((currentIdx + 1) / manuscript.sections.length) * 100}%` }}
        />
      </div>
    </div>
  )
}
