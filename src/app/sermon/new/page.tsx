'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, Sparkles, Loader2, Check } from 'lucide-react'

export default function NewSermonPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [passage, setPassage] = useState('')
  const [sermonDate, setSermonDate] = useState(() => {
    const d = new Date()
    const day = d.getDay()
    const nextSunday = new Date(d)
    nextSunday.setDate(d.getDate() + (7 - day) % 7)
    return nextSunday.toISOString().split('T')[0]
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [suggesting, setSuggesting] = useState<'title' | 'passage' | null>(null)
  const [suggestions, setSuggestions] = useState<{ field: 'title' | 'passage'; items: string[] } | null>(null)

  const handleSuggest = async (field: 'title' | 'passage') => {
    setSuggesting(field)
    setError('')
    const body = field === 'title'
      ? { passage: passage.trim() }
      : { title: title.trim() }
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (json.success && json.suggestions?.length) {
        setSuggestions({ field, items: json.suggestions })
      } else {
        setError(json.error || '추천 실패')
      }
    } catch {
      setError('네트워크 오류')
    } finally {
      setSuggesting(null)
    }
  }

  const pickSuggestion = (value: string) => {
    if (!suggestions) return
    if (suggestions.field === 'title') setTitle(value)
    else setPassage(value)
    setSuggestions(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('제목을 입력해주세요.'); return }
    if (!passage.trim()) { setError('성경본문을 입력해주세요.'); return }

    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/sermons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), passage: passage.trim(), sermon_date: sermonDate }),
      })
      const json = await res.json()
      if (json.success) {
        router.push(`/sermon/${json.data.id}`)
      } else {
        setError(json.error || '생성 실패')
      }
    } catch {
      setError('네트워크 오류')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9fc] to-white">
      <div className="max-w-lg mx-auto px-4 py-10">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[13px] text-[#8b95a1] hover:text-[#191f28] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          뒤로
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-sm">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-[22px] font-extrabold text-[#191f28]">새 설교</h1>
            <p className="text-[14px] text-[#8b95a1] mt-0.5">설교 준비를 시작합니다</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[14px] font-bold text-[#191f28]">설교 제목 *</label>
              {passage.trim() && (
                <button type="button" onClick={() => handleSuggest('title')} disabled={suggesting !== null}
                  className="flex items-center gap-1 text-[12px] text-primary-500 font-semibold hover:text-primary-600 transition-colors disabled:opacity-50"
                >
                  {suggesting === 'title' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  AI 제목 추천
                </button>
              )}
            </div>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="설교의 제목을 입력하세요"
              className="w-full p-3 rounded-xl border border-[#e5e8eb] text-[14px] text-[#191f28] placeholder-[#b0b8c1] focus:outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all"
              autoFocus
            />
            {suggestions?.field === 'title' && (
              <div className="mt-2 space-y-1.5">
                {suggestions.items.map((item, i) => (
                  <button key={i} type="button" onClick={() => pickSuggestion(item)}
                    className="w-full flex items-center gap-2.5 p-3 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100 hover:border-indigo-200 text-left text-[14px] text-indigo-700 font-medium transition-all group"
                  >
                    <span className="w-5 h-5 rounded-full border-2 border-indigo-300 flex items-center justify-center group-hover:border-indigo-500 transition-colors">
                      <Check className="w-3 h-3 text-transparent group-hover:text-indigo-400" />
                    </span>
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[14px] font-bold text-[#191f28]">성경 본문 *</label>
              {title.trim() && (
                <button type="button" onClick={() => handleSuggest('passage')} disabled={suggesting !== null}
                  className="flex items-center gap-1 text-[12px] text-primary-500 font-semibold hover:text-primary-600 transition-colors disabled:opacity-50"
                >
                  {suggesting === 'passage' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  AI 본문 추천
                </button>
              )}
            </div>
            <input
              value={passage}
              onChange={e => setPassage(e.target.value)}
              placeholder="예: 에베소서 2:1-10"
              className="w-full p-3 rounded-xl border border-[#e5e8eb] text-[14px] text-[#191f28] placeholder-[#b0b8c1] focus:outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all"
            />
            {suggestions?.field === 'passage' && (
              <div className="mt-2 space-y-1.5">
                {suggestions.items.map((item, i) => (
                  <button key={i} type="button" onClick={() => pickSuggestion(item)}
                    className="w-full flex items-center gap-2.5 p-3 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100 hover:border-indigo-200 text-left text-[14px] text-indigo-700 font-medium transition-all group"
                  >
                    <span className="w-5 h-5 rounded-full border-2 border-indigo-300 flex items-center justify-center group-hover:border-indigo-500 transition-colors">
                      <Check className="w-3 h-3 text-transparent group-hover:text-indigo-400" />
                    </span>
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-[14px] font-bold text-[#191f28] mb-1.5">설교 날짜</label>
            <input
              type="date"
              value={sermonDate}
              onChange={e => setSermonDate(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#e5e8eb] text-[14px] text-[#191f28] focus:outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all"
            />
          </div>

          {error && (
            <p className="text-[13px] text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-blue-600 text-white text-[15px] font-bold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            {saving ? '생성 중...' : '설교 시작하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
