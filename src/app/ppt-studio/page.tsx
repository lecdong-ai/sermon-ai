'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react'
import PptStudio from '@/components/PptStudio'
import FileUpload from '@/components/FileUpload'

interface SermonListItem {
  id: string
  title: string
  normalizedPassage?: string
  passage?: string
  raw_text?: string
  result?: any
}

function PageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialSermonId = searchParams?.get('id')
  const [sermonList, setSermonList] = useState<SermonListItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(initialSermonId)
  const [selectedSermon, setSelectedSermon] = useState<SermonListItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [showUpload, setShowUpload] = useState(false)

  const listUploaded = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/sermons?source=upload')
      if (!res.ok) throw new Error('불러오기 실패')
      const data = await res.json()
      setSermonList(data.data || [])
      if (data.data?.length > 0 && !selectedId) {
        setSelectedId(data.data[0].id)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [selectedId])

  const loadDetail = useCallback(async (id: string) => {
    setLoadingDetail(true)
    try {
      const res = await fetch(`/api/sermons/${id}`)
      if (!res.ok) throw new Error('불러오기 실패')
      const data = await res.json()
      if (data.success) {
        setSelectedSermon(data.data)
      }
    } catch {
      // silent
    } finally {
      setLoadingDetail(false)
    }
  }, [])

  useEffect(() => {
    listUploaded()
  }, [])

  useEffect(() => {
    if (selectedId) {
      loadDetail(selectedId)
    }
  }, [selectedId, loadDetail])

  const handleSelectSermon = useCallback((sermon: SermonListItem) => {
    setSelectedId(sermon.id)
  }, [])

  const handleUploadSuccess = (newSermonId: string) => {
    setShowUpload(false)
    listUploaded().then(() => {
      setSelectedId(newSermonId)
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#fbfaf7]">
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#e4e2dd] bg-white">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-1.5 text-[13px] text-[#6b6764] hover:text-[#2c2a29]"
        >
          <ArrowLeft className="w-4 h-4" />
          워크스페이스
        </button>
        <h1 className="text-[15px] font-bold text-[#2c2a29]">📽️ PPT 스튜디오</h1>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#8d7a5b] text-white text-[12px] font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          업로드
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="w-6 h-6 text-[#8d7a5b] animate-spin" />
        </div>
      ) : loadingDetail ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="w-6 h-6 text-[#8d7a5b] animate-spin" />
          <span className="ml-2 text-[14px] text-[#8a8580]">설교 데이터 불러오는 중...</span>
        </div>
      ) : (
        <PptStudio
          sermon={selectedSermon}
          sermons={sermonList}
          onSelectSermon={handleSelectSermon}
        />
      )}

      {showUpload && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={() => setShowUpload(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">새 설교 원고 업로드</h2>
                <p className="text-xs text-gray-400 mt-0.5">PDF, TXT, DOCX 파일을 업로드하세요</p>
              </div>
              <button
                onClick={() => setShowUpload(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <FileUpload onSuccess={handleUploadSuccess} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[70vh] bg-[#fbfaf7]">
        <div className="bg-white border border-[#e4e2dd] p-8 rounded-xl text-center max-w-xs w-full shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="relative w-10 h-10 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-[#e4e2dd]" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#8d7a5b] animate-spin" />
          </div>
          <p className="text-[14px] font-medium text-[#8a8580]">PPT 스튜디오 로딩 중...</p>
        </div>
      </div>
    }>
      <PageContent />
    </Suspense>
  )
}
