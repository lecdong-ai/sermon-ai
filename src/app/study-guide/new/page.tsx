'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BookOpen, Sparkles, AlertCircle, X, Plus } from 'lucide-react'
import type { StudyGuideInput } from '@/types'

export default function NewStudyGuidePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#f8f9fc] to-white flex items-center justify-center">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-[#e5e8eb]" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-500 animate-spin" />
        </div>
      </div>
    }>
      <NewStudyGuideForm />
    </Suspense>
  )
}

const AGE_GROUPS = [
  { value: '', label: '선택 안 함' },
  { value: '청소년', label: '청소년' },
  { value: '청년', label: '청년' },
  { value: '30~40대', label: '30~40대' },
  { value: '장년', label: '장년' },
  { value: '통합', label: '통합' },
]

const ATMOSPHERES = [
  { value: '', label: '선택 안 함' },
  { value: '균형', label: '균형' },
  { value: '진지한 나눔 중심', label: '진지한 나눔 중심' },
  { value: '가벼운 교제 중심', label: '가벼운 교제 중심' },
]

function NewStudyGuideForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sermonId = searchParams.get('sermonId')

  const [loading, setLoading] = useState(false)
  const [prefilling, setPrefilling] = useState(false)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [passage, setPassage] = useState('')
  const [sermonText, setSermonText] = useState('')
  const [ageGroup, setAgeGroup] = useState('')
  const [atmosphere, setAtmosphere] = useState('')
  const [emphasis, setEmphasis] = useState<string[]>([])
  const [avoid, setAvoid] = useState<string[]>([])
  const [emphasisInput, setEmphasisInput] = useState('')
  const [avoidInput, setAvoidInput] = useState('')

  useEffect(() => {
    if (!sermonId) return
    setPrefilling(true)
    fetch(`/api/sermons/${sermonId}`)
      .then(r => r.json())
      .then(response => {
        if (!response.success) return
        const sermon = response.data
        if (sermon?.id) {
          setTitle(sermon.title || '')
          setPassage(sermon.normalizedPassage || sermon.passage || '')
          const manuscript = sermon.manuscript || sermon.result?.manuscript || ''
          const rawText = sermon.raw_text || ''
          setSermonText(manuscript || rawText || '')
        }
      })
      .catch(() => {})
      .finally(() => setPrefilling(false))
  }, [sermonId])

  const canSubmit = title.trim() && passage.trim() && sermonText.trim().length >= 100 && !loading && !prefilling

  const addTag = (list: string[], setter: (v: string[]) => void, input: string, setInput: (v: string) => void, max: number) => {
    const val = input.trim()
    if (val && !list.includes(val) && list.length < max) {
      setter([...list, val])
    }
    setInput('')
  }

  const removeTag = (list: string[], setter: (v: string[]) => void, idx: number) => {
    setter(list.filter((_, i) => i !== idx))
  }

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return
    setLoading(true)
    setError('')

    const input: StudyGuideInput = {
      title: title.trim(),
      passage: passage.trim(),
      sermonText: sermonText.trim(),
      ageGroup: ageGroup || undefined,
      atmosphere: atmosphere || undefined,
      emphasis: emphasis.length ? emphasis : undefined,
      avoid: avoid.length ? avoid : undefined,
    }

    try {
      const res = await fetch('/api/study-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const json = await res.json()
      if (!json.success) {
        setError(json.error || '생성에 실패했습니다.')
        return
      }
      router.push(`/study-guide/${json.data.id}`)
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [canSubmit, title, passage, sermonText, ageGroup, atmosphere, emphasis, avoid, router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9fc] to-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-sm">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-[22px] font-extrabold text-[#191f28]">소그룹 리더가이드 생성</h1>
            <p className="text-[14px] text-[#8b95a1] mt-0.5">설교 원고를 입력하면 AI가 나눔 교재를 만들어드립니다</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2.5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[14px]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-5">
          {/* 필수 입력 */}
          <div className="p-6 rounded-xl bg-white border border-[#e5e8eb]">
            <p className="text-[13px] font-bold text-[#8b95a1] mb-4 tracking-wide">필수 정보</p>
            <div className="space-y-4">
              <div>
                <label className="block text-[14px] font-bold text-[#191f28] mb-1.5">설교 제목</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="예: 은혜로 말미암은 구원"
                  className="w-full px-4 py-3 rounded-xl border border-[#e5e8eb] text-[14px] text-[#191f28] bg-white outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-[14px] font-bold text-[#191f28] mb-1.5">성경본문</label>
                <input
                  value={passage}
                  onChange={e => setPassage(e.target.value)}
                  placeholder="예: 에베소서 2:1-10"
                  className="w-full px-4 py-3 rounded-xl border border-[#e5e8eb] text-[14px] text-[#191f28] bg-white outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-[14px] font-bold text-[#191f28] mb-1.5">설교원고</label>
                <textarea
                  value={sermonText}
                  onChange={e => setSermonText(e.target.value)}
                  placeholder="설교 원고 전문을 입력해주세요 (최소 100자 이상)"
                  rows={10}
                  className="w-full px-4 py-3 rounded-xl border border-[#e5e8eb] text-[14px] text-[#191f28] bg-white outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all resize-y leading-[1.8]"
                />
                <p className="text-[12px] text-[#8b95a1] mt-1.5">
                  {prefilling ? (
                    <span className="text-primary-500">설교 데이터를 불러오는 중...</span>
                  ) : (
                    <>
                      {sermonText.length.toLocaleString()}자
                      {sermonText.trim().length > 0 && sermonText.trim().length < 100 && (
                        <span className="text-red-500 ml-2">최소 100자 이상 필요합니다</span>
                      )}
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* 선택 입력 */}
          <div className="p-6 rounded-xl bg-white border border-[#e5e8eb]">
            <p className="text-[13px] font-bold text-[#8b95a1] mb-4 tracking-wide">선택 설정</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[14px] font-bold text-[#191f28] mb-1.5">대상 연령층</label>
                <select
                  value={ageGroup}
                  onChange={e => setAgeGroup(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e5e8eb] text-[14px] text-[#191f28] bg-white outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                >
                  {AGE_GROUPS.map(g => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[14px] font-bold text-[#191f28] mb-1.5">모임 분위기</label>
                <select
                  value={atmosphere}
                  onChange={e => setAtmosphere(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e5e8eb] text-[14px] text-[#191f28] bg-white outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                >
                  {ATMOSPHERES.map(a => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-[14px] font-bold text-[#191f28] mb-1.5">강조 포인트 (최대 3개)</label>
                <div className="flex gap-2">
                  <input
                    value={emphasisInput}
                    onChange={e => setEmphasisInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag(emphasis, setEmphasis, emphasisInput, setEmphasisInput, 3)
                      }
                    }}
                    placeholder="입력 후 Enter"
                    className="flex-1 px-4 py-3 rounded-xl border border-[#e5e8eb] text-[14px] text-[#191f28] bg-white outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                  />
                  <button
                    onClick={() => addTag(emphasis, setEmphasis, emphasisInput, setEmphasisInput, 3)}
                    disabled={emphasis.length >= 3 || !emphasisInput.trim()}
                    className="px-3 py-3 rounded-xl bg-primary-50 text-primary-600 border border-primary-200 hover:bg-primary-100 transition-colors disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {emphasis.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {emphasis.map((tag, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 text-[12px] font-medium border border-primary-200">
                        {tag}
                        <button onClick={() => removeTag(emphasis, setEmphasis, i)} className="hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[14px] font-bold text-[#191f28] mb-1.5">피하고 싶은 방향 (최대 2개)</label>
                <div className="flex gap-2">
                  <input
                    value={avoidInput}
                    onChange={e => setAvoidInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag(avoid, setAvoid, avoidInput, setAvoidInput, 2)
                      }
                    }}
                    placeholder="입력 후 Enter"
                    className="flex-1 px-4 py-3 rounded-xl border border-[#e5e8eb] text-[14px] text-[#191f28] bg-white outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                  />
                  <button
                    onClick={() => addTag(avoid, setAvoid, avoidInput, setAvoidInput, 2)}
                    disabled={avoid.length >= 2 || !avoidInput.trim()}
                    className="px-3 py-3 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {avoid.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {avoid.map((tag, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 text-[12px] font-medium border border-red-200">
                        {tag}
                        <button onClick={() => removeTag(avoid, setAvoid, i)} className="hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 생성 버튼 */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-blue-600 text-white text-[15px] font-bold shadow-md hover:shadow-lg hover:from-primary-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  리더가이드 생성하기
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
