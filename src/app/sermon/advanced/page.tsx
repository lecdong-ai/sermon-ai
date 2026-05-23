'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, Sparkles, Loader2, Check } from 'lucide-react'

export default function AdvancedSermonPage() {
  const router = useRouter()
  const [passage, setPassage] = useState('')
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [suggesting, setSuggesting] = useState<'title' | 'passage' | null>(null)
  const [suggestions, setSuggestions] = useState<{ field: 'title' | 'passage'; items: { value: string; reason: string }[] } | null>(null)

  const handleSuggest = async (field: 'title' | 'passage') => {
    setSuggesting(field)
    setError('')
    const body = field === 'title' ? { passage: passage.trim() } : { title: title.trim() }
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      const json = await res.json()
      if (json.success && json.suggestions?.length) setSuggestions({ field, items: json.suggestions })
      else setError(json.error || '추천 실패')
    } catch { setError('네트워크 오류') }
    finally { setSuggesting(null) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('제목을 입력해주세요.'); return }
    if (!passage.trim()) { setError('성경본문을 입력해주세요.'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/sermons', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), passage: passage.trim() }),
      })
      const json = await res.json()
      if (json.success) router.push(`/sermon/${json.data.id}?advanced=true`)
      else setError(json.error || '생성 실패')
    } catch { setError('네트워크 오류') }
    finally { setSaving(false) }
  }

  const SuggItem = ({ item }: { item: { value: string; reason: string } }) => (
    <button type="button" onClick={() => { if (suggestions?.field === 'title') setTitle(item.value); else setPassage(item.value); setSuggestions(null) }}
      className="w-full flex items-start gap-2.5 p-3 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100 hover:border-indigo-200 text-left transition-all group"
    >
      <span className="w-5 h-5 rounded-full border-2 border-indigo-300 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-indigo-500 transition-colors">
        <Check className="w-3 h-3 text-transparent group-hover:text-indigo-400" />
      </span>
      <div>
        <span className="block text-[14px] font-medium text-indigo-700">{item.value}</span>
        <span className="block text-[12px] text-indigo-400 mt-0.5">{item.reason}</span>
      </div>
    </button>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9fc] to-white">
      <div className="max-w-lg mx-auto px-4 py-10">
        <button onClick={() => router.push('/sermon')} className="flex items-center gap-1.5 text-[13px] text-[#8b95a1] hover:text-[#191f28] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />설교 준비 목록
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-[22px] font-extrabold text-[#191f28]">실전형 설교 준비</h1>
            <p className="text-[14px] text-[#8b95a1] mt-0.5">GPT-4o 기반 — 기존과 동일한 워크스페이스에서 더 풍성한 결과물</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[14px] font-bold text-[#191f28]">설교 제목 *</label>
              {passage.trim() && (
                <button type="button" onClick={() => handleSuggest('title')} disabled={suggesting !== null}
                  className="flex items-center gap-1 text-[12px] text-primary-500 font-semibold hover:text-primary-600 transition-colors disabled:opacity-50"
                >{suggesting === 'title' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}AI 제목 추천</button>
              )}
            </div>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="설교의 제목을 입력하세요" autoFocus
              className="w-full p-3 rounded-xl border border-[#e5e8eb] text-[14px] text-[#191f28] placeholder-[#b0b8c1] focus:outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all" />
            {suggestions?.field === 'title' && <div className="mt-2 space-y-1.5">{suggestions.items.map((item, i) => <SuggItem key={i} item={item} />)}</div>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[14px] font-bold text-[#191f28]">성경 본문 *</label>
              {title.trim() && (
                <button type="button" onClick={() => handleSuggest('passage')} disabled={suggesting !== null}
                  className="flex items-center gap-1 text-[12px] text-primary-500 font-semibold hover:text-primary-600 transition-colors disabled:opacity-50"
                >{suggesting === 'passage' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}AI 본문 추천</button>
              )}
            </div>
            <input value={passage} onChange={e => setPassage(e.target.value)} placeholder="예: 에베소서 2:1-10"
              className="w-full p-3 rounded-xl border border-[#e5e8eb] text-[14px] text-[#191f28] placeholder-[#b0b8c1] focus:outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all" />
            {suggestions?.field === 'passage' && <div className="mt-2 space-y-1.5">{suggestions.items.map((item, i) => <SuggItem key={i} item={item} />)}</div>}
          </div>

          {error && <p className="text-[13px] text-red-500">{error}</p>}

          <button type="submit" disabled={saving}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[15px] font-bold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}{saving ? '생성 중...' : '실전형 워크스페이스 시작'}</button>
        </form>
      </div>
    </div>
  )
}
