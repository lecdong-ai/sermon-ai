'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Copy, Check, RefreshCw, Loader2, ArrowLeft, BookOpen, AlertCircle } from 'lucide-react'

const SERMON_TYPES = [
  { id: 'expository', label: '강해설교' },
  { id: 'topical', label: '주제설교' },
  { id: 'sunday', label: '주일예배' },
  { id: 'wednesday', label: '수요예배' },
  { id: 'dawn', label: '새벽예배' },
  { id: 'youth', label: '청년부' },
  { id: 'adult', label: '장년부' },
  { id: 'newfamily', label: '전도/새가족' },
]

const LENGTH_OPTIONS = [
  { id: 'outline', label: '개요형', desc: '핵심 골자만 간략히' },
  { id: 'standard', label: '표준형', desc: '일반 설교 분량' },
  { id: 'full', label: '풍성한 원고형', desc: '강단에서 바로 사용 가능' },
]

export default function AdvancedSermonPage() {
  const router = useRouter()
  const [passage, setPassage] = useState('')
  const [topic, setTopic] = useState('')
  const [audience, setAudience] = useState('')
  const [context, setContext] = useState('')
  const [sermonType, setSermonType] = useState('expository')
  const [length, setLength] = useState('full')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!passage.trim()) { setError('성경본문을 입력해주세요.'); return }
    setLoading(true)
    setError('')
    setResult('')

    try {
      const res = await fetch('/api/sermons/advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passage: passage.trim(),
          topic: topic.trim(),
          audience: audience.trim(),
          context: context.trim(),
          sermon_type: sermonType,
          length,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setResult(json.data.full_text)
      } else {
        setError(json.error || '생성 실패')
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f4ff] to-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <button onClick={() => router.push('/sermon')} className="flex items-center gap-1.5 text-[13px] text-[#8b95a1] hover:text-[#191f28] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          설교 준비 목록
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-[24px] font-extrabold text-[#191f28]">실전형 설교 준비</h1>
            <p className="text-[14px] text-[#8b95a1] mt-0.5">GPT-4o 기반 풍성한 설교원고 자동 생성</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* 입력 영역 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-[#e5e8eb] p-5 shadow-sm">
              <h2 className="text-[15px] font-bold text-[#191f28] mb-4">설교 정보 입력</h2>
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[13px] font-bold text-[#4e5968] mb-1">성경본문 *</label>
                  <input value={passage} onChange={e => setPassage(e.target.value)} placeholder="예: 에베소서 2:1-10"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e8eb] text-[14px] focus:outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[#4e5968] mb-1">설교 주제 (선택)</label>
                  <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="예: 하나님의 은혜로 구원받은 자의 정체성"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e8eb] text-[14px] focus:outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[#4e5968] mb-1">회중 상황 (선택)</label>
                  <input value={audience} onChange={e => setAudience(e.target.value)} placeholder="예: 청년부, 장년부, 새가족"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e8eb] text-[14px] focus:outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[#4e5968] mb-1">교회 상황/특이사항 (선택)</label>
                  <textarea value={context} onChange={e => setContext(e.target.value)} placeholder="교회의 특별한 상황이나 강조하고 싶은 포인트"
                    className="w-full min-h-[60px] px-3.5 py-2.5 rounded-xl border border-[#e5e8eb] text-[14px] resize-y focus:outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all" />
                </div>
              </div>
            </div>

            {/* 설교 스타일 */}
            <div className="bg-white rounded-2xl border border-[#e5e8eb] p-5 shadow-sm">
              <h2 className="text-[15px] font-bold text-[#191f28] mb-3">설교 스타일</h2>
              <div className="grid grid-cols-2 gap-1.5">
                {SERMON_TYPES.map(t => (
                  <button key={t.id} onClick={() => setSermonType(t.id)}
                    className={`px-3 py-2 rounded-xl text-[12px] font-bold transition-all ${
                      sermonType === t.id
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >{t.label}</button>
                ))}
              </div>
            </div>

            {/* 출력 길이 */}
            <div className="bg-white rounded-2xl border border-[#e5e8eb] p-5 shadow-sm">
              <h2 className="text-[15px] font-bold text-[#191f28] mb-3">출력 길이</h2>
              <div className="space-y-1.5">
                {LENGTH_OPTIONS.map(o => (
                  <button key={o.id} onClick={() => setLength(o.id)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-[13px] transition-all ${
                      length === o.id
                        ? 'bg-amber-50 border border-amber-200 text-amber-700 font-bold'
                        : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{o.label}</span>
                    <span className="text-[11px] opacity-60">{o.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleGenerate} disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white text-[15px] font-bold hover:shadow-lg hover:shadow-amber-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {loading ? '생성 중...' : '실전형 설교원고 생성'}
            </button>

            {error && (
              <div className="flex items-start gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}
          </div>

          {/* 결과 영역 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-[#e5e8eb] shadow-sm min-h-[500px] flex flex-col">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e5e8eb] bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="text-[14px] font-bold text-amber-800">생성 결과</span>
                  {result && <span className="text-[11px] text-amber-500 font-medium">({result.length.toLocaleString()}자)</span>}
                </div>
                <div className="flex items-center gap-2">
                  {result && (
                    <>
                      <button onClick={handleCopy} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-amber-200 text-[12px] font-bold text-amber-700 hover:bg-amber-50 transition-all">
                        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? '복사됨' : '복사'}
                      </button>
                      <button onClick={handleGenerate} disabled={loading} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white text-[12px] font-bold hover:shadow-md transition-all disabled:opacity-50">
                        <RefreshCw className="w-3.5 h-3.5" />
                        다시 생성
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="flex-1 p-6 overflow-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-[#8b95a1] py-20">
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 rounded-full border-4 border-amber-200" />
                      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-600 animate-spin" />
                    </div>
                    <p className="text-[14px] font-medium">GPT-4o가 설교원고를 작성 중입니다...</p>
                    <p className="text-[12px]">잠시만 기다려주세요 (약 30~60초 소요)</p>
                  </div>
                ) : result ? (
                  <div className="text-[15px] text-[#191f28] leading-[1.9] whitespace-pre-wrap font-[15px]">
                    {result}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-[#8b95a1] py-20">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-amber-400" />
                    </div>
                    <p className="text-[15px] font-bold text-[#4e5968]">설교원고가 생성됩니다</p>
                    <p className="text-[13px] text-center max-w-xs">성경본문을 입력하고 생성 버튼을 누르면<br />GPT-4o가 풍성한 설교원고를 작성합니다</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
