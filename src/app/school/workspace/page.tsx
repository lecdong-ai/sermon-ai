'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  AlertCircle,
  RefreshCw,
  Menu,
  LayoutGrid,
  List,
  Upload,
  Sparkles,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import ResultTabs from '@/components/school/workspace/ResultTabs'
import GenerateButton from '@/components/school/workspace/GenerateButton'
import Toast from '@/components/school/workspace/Toast'
import UploadModal from '@/components/school/workspace/UploadModal'
import WorkspaceDashboard from '@/components/school/workspace/WorkspaceDashboard'
import type { SermonRecord, GenerationItem, GenerationState } from '@/types/school/workspace'

const SummarySection = dynamic(() => import('@/components/school/workspace/SummarySection'), { ssr: false })
const GroupDiscussionSection = dynamic(() => import('@/components/school/workspace/GroupDiscussionSection'), { ssr: false })
const CardNewsSection = dynamic(() => import('@/components/school/CardNewsSection'), { ssr: false })
const SermonScriptSection = dynamic(() => import('@/components/school/workspace/SermonScriptSection'), { ssr: false })
const ShortsScriptSection = dynamic(() => import('@/components/school/workspace/ShortsScriptSection'), { ssr: false })
const WorkspaceSidebar = dynamic(() => import('@/components/school/workspace/WorkspaceSidebar'), { ssr: false })

const TABS = [
  { id: 'summary', label: '📄 요약' },
  { id: 'groupDiscussion', label: '💬 나눔' },
  { id: 'cardNews', label: '🎴 카드뉴스' },
  { id: 'sermonScript', label: '🎙️ 설교대본' },
  { id: 'shortsScript', label: '📱 쇼츠대본' },
]

type ViewMode = 'tabs' | 'all'

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[70vh] bg-[#fbfaf7]">
        <div className="bg-white border border-[#e4e2dd] p-8 rounded-xl text-center max-w-xs w-full shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="relative w-10 h-10 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-[#e4e2dd]" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#8d7a5b] animate-spin" />
          </div>
          <p className="text-[14px] font-medium text-[#8a8580]">워크스페이스 준비 중...</p>
        </div>
      </div>
    }>
      <WorkspacePage />
    </Suspense>
  )
}

function WorkspacePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sermonId = searchParams.get('id')

  const [sermon, setSermon] = useState<SermonRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('summary')
  const [viewMode, setViewMode] = useState<ViewMode>('tabs')
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)

  const [generationStates, setGenerationStates] = useState<Record<string, GenerationState>>({})
  const [generatingItem, setGeneratingItem] = useState<string | null>(null)
  const [kakaoLoaded, setKakaoLoaded] = useState(false)

  useEffect(() => {
    const loadKakao = async () => {
      if (typeof window !== 'undefined' && !(window as any).Kakao) {
        const script = document.createElement('script')
        script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js'
        script.integrity = 'sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4'
        script.crossOrigin = 'anonymous'
        script.onload = () => {
          const key = process.env.NEXT_PUBLIC_KAKAO_KEY
          if (key && !(window as any).Kakao.isInitialized()) {
            ;(window as any).Kakao.init(key)
          }
          setKakaoLoaded(true)
        }
        document.head.appendChild(script)
      } else {
        setKakaoLoaded(true)
      }
    }
    loadKakao()
  }, [])

  const loadSermon = useCallback(async () => {
    if (!sermonId) {
      // sermonId가 없으면 대시보드 모드 (목록 + 통계)
      setLoading(false)
      setError(null)
      setSermon(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)
      const res = await fetch(`/school/api/sermons/${sermonId}`, { signal: controller.signal })
      clearTimeout(timeout)
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || '데이터를 불러올 수 없습니다.')
      }
      const data = await res.json()
      setSermon(data.data)
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('요청 시간이 초과되었습니다. 서버 연결을 확인해주세요.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }, [sermonId])

  useEffect(() => {
    loadSermon()
  }, [loadSermon])

  const handleGenerate = async (item: GenerationItem) => {
    if (!sermonId || generatingItem) return
    setGeneratingItem(item)
    setGenerationStates((prev) => ({ ...prev, [item]: { status: 'generating' } }))
    try {
      const res = await fetch('/school/api/upload', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sermonId,
          text: sermon?.raw_text,
          item,
          idempotency_key: crypto.randomUUID(),
        }),
      })
      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || '생성 실패')
      }
      const { success, ...newResult } = data
      setSermon((prev) => prev ? { ...prev, result: { ...prev.result, ...newResult } } : prev)
      setGenerationStates((prev) => ({ ...prev, [item]: { status: 'done' } }))
      setToast({ visible: true, message: '분석 완료!', type: 'success' })
    } catch (err: any) {
      setGenerationStates((prev) => ({
        ...prev,
        [item]: { status: 'error', error: err.message },
      }))
    } finally {
      setGeneratingItem(null)
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/school/workspace?id=${sermonId}`
    try {
      if (navigator.share) {
        await navigator.share({
          title: sermon?.title || '설교 콘텐츠',
          text: sermon?.result?.summary?.intro || '설교 콘텐츠를 확인해보세요',
          url,
        })
        return
      }
      if (kakaoLoaded && (window as any).Kakao?.Share) {
        (window as any).Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: sermon?.title || '설교 콘텐츠',
            description: sermon?.result?.summary?.intro || '',
            imageUrl: `${window.location.origin}/og-image.png`,
            link: { mobileWebUrl: url, webUrl: url },
          },
        })
        return
      }
      await navigator.clipboard.writeText(url)
      setToast({ visible: true, message: '링크가 복사되었습니다!', type: 'success' })
    } catch {}
  }

  const handleUploadSuccess = (newSermonId: string) => {
    setShowUploadModal(false)
    router.push(`/school/workspace?id=${newSermonId}`)
  }

  // 대시보드 모드: sermonId가 없을 때 목록 + 통계 페이지 표시
  if (!sermonId) {
    return (
      <>
        <WorkspaceDashboard
          onUpload={() => setShowUploadModal(true)}
        />
        <Toast
          message={toast.message}
          type={toast.type}
          visible={toast.visible}
          onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
        />
        <UploadModal
          showUploadModal={showUploadModal}
          setShowUploadModal={setShowUploadModal}
          handleUploadSuccess={handleUploadSuccess}
        />
      </>
    )
  }

  // 작업 모드: sermonId가 있을 때 로딩/에러/워크스페이스 표시
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-[#fbfaf7]">
        <div className="bg-white border border-[#e4e2dd] p-8 rounded-xl text-center max-w-xs w-full shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="relative w-10 h-10 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-[#e4e2dd]" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#8d7a5b] animate-spin" />
          </div>
          <p className="text-[14px] font-medium text-[#8a8580]">콘텐츠를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-[#e4e2dd] p-8 md:p-10 rounded-2xl shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-5 shadow-sm">
            <AlertCircle className="w-7 h-7 text-rose-500 animate-pulse" />
          </div>
          <h2 className="font-extrabold text-[20px] text-slate-800 mb-2">설교를 불러올 수 없습니다</h2>
          <p className="text-[15px] text-slate-500 mb-6 leading-relaxed">{error}</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => router.push('/school/workspace')}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-[#e4e2dd] text-[#4a4744] px-5 py-3 text-[14px] font-bold hover:bg-[#fbfaf7] transition-all"
            >
              목록으로
            </button>
            <button
              onClick={loadSermon}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 text-[15px] font-bold hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all duration-200 shadow-md shadow-blue-500/10"
            >
              <RefreshCw className="w-4 h-4" />
              다시 불러오기
            </button>
            <Link
              href="/school/ppt-studio"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-navy-700 to-navy-500 text-white px-6 py-3 text-[15px] font-bold hover:from-navy-800 hover:to-navy-600 active:scale-[0.98] transition-all duration-200 shadow-button"
            >
              <Sparkles className="w-4 h-4" />
              AI PPT 만들기
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!sermon) {
    // sermonId가 있지만 설교를 불러오지 못한 경우 → 대시보드로 폴백
    return (
      <>
        <WorkspaceDashboard
          onUpload={() => setShowUploadModal(true)}
        />
        <Toast
          message={toast.message}
          type={toast.type}
          visible={toast.visible}
          onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
        />
        <UploadModal
          showUploadModal={showUploadModal}
          setShowUploadModal={setShowUploadModal}
          handleUploadSuccess={handleUploadSuccess}
        />
      </>
    )
  }

  const result = sermon.result as any

  const renderSection = (tabId: string) => {
    const state = generationStates[tabId as GenerationItem]
    const status = state?.status || (result?.[tabId] ? 'done' : 'idle')

    if (status === 'idle' || status === 'generating' || status === 'error') {
      return (
        <GenerateButton
          itemId={tabId as GenerationItem}
          label={TABS.find((t) => t.id === tabId)?.label.replace(/^[^\s]+\s/, '') || ''}
          status={status}
          error={state?.error}
          onGenerate={handleGenerate}
          onRetry={handleGenerate}
        />
      )
    }

    switch (tabId) {
      case 'summary':
        return result.summary ? <SummarySection data={result.summary} /> : null
      case 'groupDiscussion':
        return result.groupDiscussion ? <GroupDiscussionSection data={result.groupDiscussion} passageText={result.summary?.passage_text || ''} /> : null
      case 'cardNews':
        return result.cardNews ? <CardNewsSection data={result.cardNews} /> : null
      case 'sermonScript':
        return result.sermonScript ? <SermonScriptSection data={result.sermonScript} /> : null
      case 'shortsScript':
        return result.shortsScript ? <ShortsScriptSection data={result.shortsScript} /> : null
      default:
        return null
    }
  }

  return (
    <div className="flex justify-center min-h-[calc(100vh-4rem)] relative bg-[#fbfaf7]">
      <div className="flex w-full max-w-7xl z-10">
      {/* 사이드바 */}
      <WorkspaceSidebar
        sermon={sermon}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* 메인 컨텐츠 */}
      <div className="flex-1 min-w-0">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* 상단 헤더 */}
          <div className="flex items-center gap-4 mb-8 p-6 bg-white border border-[#e4e2dd] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            {/* 워크스페이스 홈으로 */}
            <button
              onClick={() => router.push('/school/workspace')}
              className="w-10 h-10 rounded-lg bg-white border border-[#e4e2dd] flex items-center justify-center hover:bg-[#fbfaf7] active:scale-95 transition-all duration-200 shrink-0"
              title="워크스페이스 홈"
            >
              <svg className="w-5 h-5 text-[#4a4744]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {/* 모바일 햄버거 */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 rounded-lg bg-white border border-[#e4e2dd] flex items-center justify-center hover:bg-[#fbfaf7] active:scale-95 transition-all duration-200 lg:hidden"
            >
              <Menu className="w-5 h-5 text-[#4a4744]" />
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-[#2c2a29] truncate tracking-tight">
                    {sermon.title || '설교 워크스페이스'}
                  </h1>
                  {sermon.passage && (
                    <p className="text-[13px] font-medium text-[#8a8580] mt-1 select-all">{sermon.passage}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Link
                    href={`/school/ppt-studio${sermonId ? `?id=${sermonId}` : ''}`}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-gradient-to-r from-navy-700 to-navy-500 text-white text-[13px] font-bold hover:from-navy-800 hover:to-navy-600 active:scale-[0.98] transition-all duration-200 shadow-button"
                    title="GPT-5.5 + gpt-image-1로 전문가급 PPT 제작"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden sm:inline">AI PPT 만들기</span>
                    <span className="sm:hidden">PPT</span>
                  </Link>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-white border border-[#e4e2dd] text-[#4a4744] text-[13px] font-medium hover:bg-[#fbfaf7] active:scale-[0.98] transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span>공유</span>
                  </button>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#8d7a5b] text-white text-[13px] font-medium hover:bg-[#7a694e] active:scale-[0.98] transition-all duration-200"
                  >
                    <Upload className="w-4 h-4" />
                    <span>설교원고 업로드</span>
                  </button>
                  <button
                    onClick={() => setViewMode(viewMode === 'tabs' ? 'all' : 'tabs')}
                    className="w-9 h-9 rounded-lg bg-white border border-[#e4e2dd] hover:bg-[#fbfaf7] flex items-center justify-center active:scale-95 transition-all duration-200"
                    title={viewMode === 'tabs' ? '전체 보기' : '탭으로 보기'}
                  >
                    {viewMode === 'tabs' ? (
                      <LayoutGrid className="w-4 h-4 text-[#8a8580]" />
                    ) : (
                      <List className="w-4 h-4 text-[#8a8580]" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 탭 */}
          {viewMode === 'tabs' && (
            <div className="mb-6">
              <ResultTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
            </div>
          )}

          {/* 컨텐츠 */}
          <div>
            {viewMode === 'tabs' ? (
              <div key={activeTab}>
                {renderSection(activeTab)}
              </div>
            ) : (
              <div className="space-y-6">
                {TABS.map((tab) => (
                  <div key={tab.id}>
                    {renderSection(tab.id)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 토스트 */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {/* 업로드 모달 */}
      <UploadModal
        showUploadModal={showUploadModal}
        setShowUploadModal={setShowUploadModal}
        handleUploadSuccess={handleUploadSuccess}
      />
      </div>
    </div>
  )
}
