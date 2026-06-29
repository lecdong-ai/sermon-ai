'use client'

import { useState } from 'react'
import type { ContiSong, MoodTag, MusicKey, AIRecommendRequest, AIRecommendResult } from '@/types/conti'
import { ALL_KEYS, KEY_DISPLAY } from '@/lib/conti/keyTheory'
import { MOOD_META } from './MoodTagBadge'
import { mockAIRecommend } from '@/lib/conti/mockAi'
import { Sparkles, X, Loader2, Music, ArrowRight, RefreshCw, Check, X as XIcon, Plus, Minus } from 'lucide-react'

interface Props {
  availableSongs: ContiSong[]
  existingTitles?: string[]                  // 이미 콘티에 들어있는 곡 (제안에서 제외)
  onClose: () => void
  onApply: (items: AIRecommendResult['items']) => void
}

const ALL_TAGS: MoodTag[] = Object.keys(MOOD_META) as MoodTag[]

const PRESET_SCENARIOS: { name: string; moods: MoodTag[]; key: MusicKey | null; count: number; desc: string }[] = [
  { name: '은혜로운 주일',  moods: ['은혜', '경배'], key: 'C', count: 4, desc: '잔잔한 은혜 + 경배 4곡' },
  { name: '경배의 밤',     moods: ['경배', '찬양'], key: 'G', count: 5, desc: '경배 중심의 깊은 밤' },
  { name: '회개와 회복',     moods: ['회개', '은혜'], key: 'Am', count: 4, desc: '회개 분위기 → 은혜 마무리' },
  { name: '축제 찬양',       moods: ['찬양', '축제', '축복'], key: 'G', count: 5, desc: '밝고 역동적인 예배' },
  { name: '고백과 결단',     moods: ['고백', '결단'], key: 'D', count: 3, desc: '짧고 강렬한 결단의 시간' },
]

export default function ContiAIRecommendModal({ availableSongs, existingTitles = [], onClose, onApply }: Props) {
  const [step, setStep] = useState<'input' | 'loading' | 'result'>('input')
  const [moods, setMoods] = useState<MoodTag[]>(['은혜', '경배'])
  const [songCount, setSongCount] = useState(4)
  const [mainKey, setMainKey] = useState<MusicKey | null>(null)
  const [result, setResult] = useState<AIRecommendResult | null>(null)
  const [removedIdx, setRemovedIdx] = useState<Set<number>>(new Set())

  function toggleMood(t: MoodTag) {
    setMoods((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])
  }

  async function handleRecommend() {
    if (moods.length === 0) {
      alert('분위기를 1개 이상 선택해 주세요.')
      return
    }
    setStep('loading')
    try {
      const req: AIRecommendRequest = {
        moods,
        song_count: songCount,
        main_key: mainKey || null,
      }
      const res = await mockAIRecommend(req, availableSongs)
      setResult(res)
      setRemovedIdx(new Set())
      setStep('result')
    } catch {
      alert('AI 추천에 실패했습니다.')
      setStep('input')
    }
  }

  function applyPreset(preset: typeof PRESET_SCENARIOS[number]) {
    setMoods(preset.moods)
    setMainKey(preset.key)
    setSongCount(preset.count)
  }

  function handleApply() {
    if (!result) return
    const items = result.items.filter((_, idx) => !removedIdx.has(idx))
    if (items.length === 0) {
      alert('적용할 곡이 없습니다.')
      return
    }
    onApply(items)
  }

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
              <h2 className="text-[17px] font-bold text-white">AI 콘티 추천</h2>
              <p className="text-[13px] text-slate-500 font-medium">
                {step === 'input' && '분위기와 곡 수를 입력하면 곡을 자동 배치합니다'}
                {step === 'loading' && 'AI가 곡을 분석 중...'}
                {step === 'result' && '마음에 안 드는 곡은 제외할 수 있어요'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
          {step === 'input' && (
            <div className="space-y-5">
              {/* 프리셋 */}
              <div>
                <label className="text-[12px] font-extrabold uppercase tracking-widest text-slate-500 mb-2 block">
                  빠른 시나리오
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRESET_SCENARIOS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className="text-left p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/[0.04] transition-all"
                    >
                      <p className="text-[14px] font-bold text-white">{preset.name}</p>
                      <p className="text-[12px] text-slate-500 font-medium mt-0.5">{preset.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 분위기 선택 */}
              <div>
                <label className="text-[12px] font-extrabold uppercase tracking-widest text-slate-500 mb-2 block">
                  분위기 ({moods.length}개 선택)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_TAGS.map((t) => {
                    const selected = moods.includes(t)
                    return (
                      <button
                        key={t}
                        onClick={() => toggleMood(t)}
                        className={`px-2.5 py-1 rounded-md text-[13px] font-bold transition-colors ${
                          selected
                            ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                            : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'
                        }`}
                      >
                        #{MOOD_META[t].label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 곡 수 + 메인키 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-extrabold uppercase tracking-widest text-slate-500 mb-2 block">
                    곡 수
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSongCount(Math.max(2, songCount - 1))}
                      disabled={songCount <= 2}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10 disabled:opacity-30"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex-1 text-center text-[17px] font-extrabold text-white">
                      {songCount}곡
                    </div>
                    <button
                      onClick={() => setSongCount(Math.min(8, songCount + 1))}
                      disabled={songCount >= 8}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10 disabled:opacity-30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-extrabold uppercase tracking-widest text-slate-500 mb-2 block">
                    메인 키 (선택)
                  </label>
                  <select
                    value={mainKey || ''}
                    onChange={(e) => setMainKey((e.target.value as MusicKey) || null)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white focus:outline-none focus:border-amber-500/40"
                  >
                    <option value="">자동</option>
                    {ALL_KEYS.map((k) => (
                      <option key={k} value={k}>{KEY_DISPLAY[k] || k}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 'loading' && (
            <div className="py-12 text-center">
              <Loader2 className="w-10 h-10 mx-auto mb-3 text-amber-300 animate-spin" />
              <p className="text-[15px] font-bold text-white">AI가 곡을 분석하고 있습니다...</p>
              <p className="text-[12px] text-slate-500 font-medium mt-1">
                라이브러리에서 분위기에 맞는 곡을 찾고 있어요
              </p>
            </div>
          )}

          {step === 'result' && result && (
            <div className="space-y-4">
              {/* 전체 요약 */}
              <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-500/20">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
                  <p className="text-[13px] text-slate-200 font-medium leading-relaxed">
                    {result.overall_reasoning}
                  </p>
                </div>
              </div>

              {/* 추천 곡 리스트 */}
              <div className="space-y-2">
                {result.items.map((item, idx) => {
                  const removed = removedIdx.has(idx)
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        removed
                          ? 'opacity-40 border-white/5 bg-white/[0.02]'
                          : 'border-white/10 bg-white/[0.03] hover:border-amber-500/30'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[13px] font-extrabold text-amber-300 flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-white truncate">{item.title}</p>
                        <p className="text-[12px] text-slate-500 font-medium truncate">
                          {item.artist || '아티스트 미상'}
                        </p>
                        <p className="text-[11px] text-slate-600 font-medium mt-0.5 truncate">
                          {item.reason}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[12px] font-extrabold text-white">
                          {KEY_DISPLAY[item.recommended_key] || item.recommended_key}
                        </span>
                        <span className="text-[11px] text-slate-400 font-bold">♩{item.recommended_bpm}</span>
                      </div>
                      <button
                        onClick={() => {
                          setRemovedIdx((prev) => {
                            const next = new Set(prev)
                            if (next.has(idx)) next.delete(idx)
                            else next.add(idx)
                            return next
                          })
                        }}
                        className={`p-1 rounded-md flex-shrink-0 transition-colors ${
                          removed
                            ? 'text-emerald-400 hover:bg-emerald-500/10'
                            : 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/10'
                        }`}
                        title={removed ? '복원' : '제외'}
                      >
                        {removed ? <Check className="w-3.5 h-3.5" /> : <XIcon className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep('input')}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-[13px] font-bold text-slate-400 hover:bg-white/5 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  다시 추천
                </button>
                <span className="text-[12px] text-slate-600 font-medium ml-auto">
                  {result.items.length - removedIdx.size}곡 적용 예정
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 풋터 */}
        <div className="flex items-center gap-2 px-6 py-4 border-t border-white/5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[13px] font-bold text-slate-400 hover:bg-white/5 transition-colors"
          >
            취소
          </button>
          {step === 'input' && (
            <button
              onClick={handleRecommend}
              disabled={moods.length === 0}
              className="ml-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white text-[14px] font-extrabold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI 추천 받기
            </button>
          )}
          {step === 'result' && (
            <button
              onClick={handleApply}
              disabled={!result || result.items.length - removedIdx.size === 0}
              className="ml-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[14px] font-extrabold transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              콘티에 적용 ({result!.items.length - removedIdx.size}곡)
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
