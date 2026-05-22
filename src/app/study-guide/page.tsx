'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/AuthProvider'
import { BookOpen, Plus, Sparkles, AlertCircle, ChevronRight, Clock, Trash2, X, FileText } from 'lucide-react'
import type { StudyGuideRecord } from '@/types'

export default function StudyGuideListPage() {
  const router = useRouter()
  const supabase = createClient()
  const { user } = useAuth()
  const [records, setRecords] = useState<StudyGuideRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showSermonPicker, setShowSermonPicker] = useState(false)
  const [sermons, setSermons] = useState<any[]>([])
  const [sermonsLoading, setSermonsLoading] = useState(false)

  useEffect(() => {
    fetch('/api/study-guide')
      .then(r => r.json())
      .then(json => {
        if (!json.success) {
          setError(json.error || '불러오기 실패')
          return
        }
        setRecords(json.data || [])
      })
      .catch(() => setError('네트워크 오류'))
      .finally(() => setLoading(false))
  }, [])

  const openSermonPicker = async () => {
    setShowSermonPicker(true)
    setSermonsLoading(true)
    const { data } = await supabase
      .from('sermons')
      .select('id, title, passage, created_at')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(50)
    setSermons(data || [])
    setSermonsLoading(false)
  }

  const deleteGuide = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    const res = await fetch(`/api/study-guide/${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.success) {
      setRecords((prev) => prev.filter((r) => r.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9fc] to-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-[22px] font-extrabold text-[#191f28]">소그룹 리더가이드</h1>
              <p className="text-[14px] text-[#8b95a1] mt-0.5">생성한 나눔 교재를 관리합니다</p>
            </div>
          </div>
          <button
            onClick={openSermonPicker}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-blue-600 text-white text-[14px] font-bold shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Sparkles className="w-4 h-4" />
            새로 만들기
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2.5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[14px]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-2 border-[#e5e8eb]" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-500 animate-spin" />
            </div>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-[#e5e8eb] mx-auto mb-4" />
            <p className="text-[16px] font-bold text-[#191f28] mb-2">아직 생성된 교재가 없습니다</p>
            <p className="text-[14px] text-[#8b95a1] mb-6">설교 원고를 입력하고 AI로 나눔 교재를 만들어보세요</p>
            <button
              onClick={openSermonPicker}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 text-white text-[14px] font-bold hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              첫 교재 만들기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map(r => (
              <button
                key={r.id}
                onClick={() => router.push(`/study-guide/${r.id}`)}
                className="w-full flex items-center justify-between p-5 rounded-xl bg-white border border-[#e5e8eb] hover:border-primary-200 hover:shadow-sm transition-all duration-200 text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[15px] font-bold text-[#191f28] truncate">{r.input_data.title}</h3>
                    {r.is_edited && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium border border-amber-200">
                        수정됨
                      </span>
                    )}
                    <span className="text-[11px] text-[#8b95a1]">v{r.version}</span>
                  </div>
                  <p className="text-[13px] text-[#8b95a1]">{r.input_data.passage}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <div className="flex items-center gap-1.5 text-[12px] text-[#8b95a1]">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(r.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteGuide(r.id) }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-[#d1d6db] hover:text-rose-500 hover:bg-rose-50 transition-all duration-200"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-[#d1d6db]" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 설교 선택 모달 */}
      {showSermonPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={() => setShowSermonPicker(false)}>
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e8eb]">
              <h2 className="text-[16px] font-bold text-[#191f28]">설교 선택</h2>
              <button onClick={() => setShowSermonPicker(false)} className="w-8 h-8 rounded-lg hover:bg-[#f3f4f6] flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-[#8b95a1]" />
              </button>
            </div>
            <div className="max-h-[480px] overflow-y-auto p-3">
              {sermonsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="relative w-8 h-8">
                    <div className="absolute inset-0 rounded-full border-2 border-[#e5e8eb]" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-500 animate-spin" />
                  </div>
                </div>
              ) : sermons.length === 0 ? (
                <div className="text-center py-16">
                  <FileText className="w-12 h-12 text-[#e5e8eb] mx-auto mb-3" />
                  <p className="text-[15px] font-bold text-[#191f28] mb-1">등록된 설교가 없습니다</p>
                  <p className="text-[13px] text-[#8b95a1]">먼저 대시보드에서 설교를 등록해주세요</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sermons.map(s => (
                    <button
                      key={s.id}
                      onClick={() => router.push(`/study-guide/new?sermonId=${s.id}`)}
                      className="w-full flex items-center gap-3 p-4 rounded-xl border border-[#e5e8eb] hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-200 text-left"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-[#191f28] truncate">{s.title || '제목 없음'}</p>
                        {s.passage && <p className="text-[12px] text-[#8b95a1] mt-0.5">{s.passage}</p>}
                      </div>
                      <span className="text-[11px] text-[#8b95a1] shrink-0">
                        {new Date(s.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
