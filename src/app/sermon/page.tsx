'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Plus, AlertCircle, Clock, ChevronRight, Trash2, BookOpen } from 'lucide-react'
import type { SermonListItem } from '@/types'

const STATUS_LABEL: Record<string, string> = {
  draft: '작성 중',
  in_progress: '진행 중',
  completed: '완료',
}

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-50 text-blue-600',
  completed: 'bg-green-50 text-green-600',
}

export default function SermonListPage() {
  const router = useRouter()
  const [sermons, setSermons] = useState<SermonListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadSermons = () => {
    setLoading(true)
    fetch('/api/sermons')
      .then(r => r.json())
      .then(json => {
        if (!json.success) {
          setError(json.error || '불러오기 실패')
          return
        }
        setSermons(json.data || [])
      })
      .catch(() => setError('네트워크 오류'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadSermons() }, [])

  const deleteSermon = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    const res = await fetch(`/api/sermons/${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.success) {
      setSermons(prev => prev.filter(s => s.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9fc] to-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-[22px] font-extrabold text-[#191f28]">설교 준비</h1>
              <p className="text-[14px] text-[#8b95a1] mt-0.5">설교를 준비하고 관리합니다</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/sermon/new')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-blue-600 text-white text-[14px] font-bold shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            새 설교
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
        ) : sermons.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-[#e5e8eb] mx-auto mb-4" />
            <p className="text-[16px] font-bold text-[#191f28] mb-2">아직 설교가 없습니다</p>
            <p className="text-[14px] text-[#8b95a1] mb-6">새 설교를 시작하고 AI 도움을 받아 준비해보세요</p>
            <button
              onClick={() => router.push('/sermon/new')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 text-white text-[14px] font-bold hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              첫 설교 시작하기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sermons.map(s => (
              <button
                key={s.id}
                onClick={() => router.push(`/sermon/${s.id}`)}
                className="w-full flex items-center justify-between p-5 rounded-xl bg-white border border-[#e5e8eb] hover:border-primary-200 hover:shadow-sm transition-all duration-200 text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[15px] font-bold text-[#191f28] truncate">{s.title || '제목 없음'}</h3>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[s.status] || ''}`}>
                      {STATUS_LABEL[s.status] || s.status}
                    </span>
                    <span className="text-[11px] text-[#8b95a1]">v{s.version}</span>
                  </div>
                  <p className="text-[13px] text-[#8b95a1]">{s.passage}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <div className="flex items-center gap-1.5 text-[12px] text-[#8b95a1]">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(s.updated_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSermon(s.id) }}
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
    </div>
  )
}
