'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Loader2, Plus } from 'lucide-react'
import PptStudio from '@/components/ppt/PptStudio'
import UploadModal from '@/components/workspace/UploadModal'
import { useAuth } from '@/components/AuthProvider'
import { redirectToMainLogin } from '@/lib/auth-redirect'

interface SermonListItem {
  id: string
  title: string
  passage?: string
  raw_text?: string
  result?: any
}

function PageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialSermonId = searchParams.get('id')
  const [sermonList, setSermonList] = useState<SermonListItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(initialSermonId)
  const [selectedSermon, setSelectedSermon] = useState<SermonListItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [showUpload, setShowUpload] = useState(false)

  const { isLoggedIn, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      redirectToMainLogin('/ppt-studio')
    }
  }, [authLoading, isLoggedIn])

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
    <div className="flex flex-col min-h-screen bg-warm-50">
      <div className="flex items-center justify-between px-6 py-3 border-b border-warm-200 bg-white">
        <button
          onClick={() => router.push('/workspace')}
          className="flex items-center gap-1.5 text-[13px] text-navy-600 hover:text-navy-900"
        >
          <ArrowLeft className="w-4 h-4" />
          워크스페이스
        </button>
        <h1 className="text-[15px] font-bold text-navy-900">PPT 스튜디오</h1>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-navy-900 text-white text-[12px] font-medium hover:bg-navy-800"
        >
          <Plus className="w-3.5 h-3.5" />
          업로드
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="w-6 h-6 text-navy-600 animate-spin" />
        </div>
      ) : loadingDetail ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="w-6 h-6 text-navy-600 animate-spin" />
          <span className="ml-2 text-[14px] text-navy-500">설교 데이터 불러오는 중...</span>
        </div>
      ) : (
        <PptStudio
          sermon={selectedSermon}
          sermons={sermonList}
          onSelectSermon={handleSelectSermon}
        />
      )}

      <UploadModal
        showUploadModal={showUpload}
        setShowUploadModal={setShowUpload}
        handleUploadSuccess={handleUploadSuccess}
      />
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[70vh] bg-warm-50">
        <div className="bg-white border border-warm-200 p-8 rounded-xl text-center max-w-xs w-full shadow-card">
          <div className="relative w-10 h-10 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-warm-200" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-navy-600 animate-spin" />
          </div>
          <p className="text-[14px] font-medium text-navy-500">PPT 스튜디오 로딩 중...</p>
        </div>
      </div>
    }>
      <PageContent />
    </Suspense>
  )
}
