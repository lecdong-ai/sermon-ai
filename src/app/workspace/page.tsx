'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import {
  AlertCircle,
  RefreshCw,
  Menu,
  LayoutGrid,
  List,
  Plus,
  X,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import ResultTabs from '@/components/ResultTabs'
import GenerateButton from '@/components/GenerateButton'
import Toast from '@/components/Toast'
import FileUpload from '@/components/FileUpload'
import type { SermonRecord, GenerationItem, GenerationState } from '@/types'

const SummarySection = dynamic(() => import('@/components/SummarySection'), { ssr: false })
const GroupDiscussionSection = dynamic(() => import('@/components/GroupDiscussionSection'), { ssr: false })
const CardNewsSection = dynamic(() => import('@/components/CardNewsSection'), { ssr: false })
const SermonScriptSection = dynamic(() => import('@/components/SermonScriptSection'), { ssr: false })
const ShortsScriptSection = dynamic(() => import('@/components/ShortsScriptSection'), { ssr: false })
const PPTSection = dynamic(() => import('@/components/PPTSection'), { ssr: false })
const WorkspaceSidebar = dynamic(() => import('@/components/WorkspaceSidebar'), { ssr: false })

const TABS = [
  { id: 'summary', label: '📄 요약' },
  { id: 'groupDiscussion', label: '💬 나눔' },
  { id: 'cardNews', label: '🎴 카드뉴스' },
  { id: 'sermonScript', label: '🎙️ 유튜브 설교대본' },
  { id: 'shortsScript', label: '📱 유튜브 쇼츠대본' },
  { id: 'pptData', label: '📊 PPT' },
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
      setError('워크스페이스 ID가 없습니다.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)
      const res = await fetch(`/api/sermons/${sermonId}`, { signal: controller.signal })
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

  const doneCount = [
    'summary', 'groupDiscussion', 'cardNews',
    'sermonScript', 'shortsScript', 'pptData',
  ].filter((key) => (sermon?.result as any)?.[key]).length

  const handleGenerate = async (item: GenerationItem) => {
    if (!sermonId || generatingItem) return
    setGeneratingItem(item)
    setGenerationStates((prev) => ({ ...prev, [item]: { status: 'generating' } }))
    try {
      const res = await fetch('/api/upload', {
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
        if (data.block_reason) {
          setToast({ visible: true, message: data.error + ' 요금제를 확인해주세요.', type: 'error' })
        }
        throw new Error(data.error || '생성 실패')
      }
      const { success, deduction, remaining, ...newResult } = data
      setSermon((prev) => prev ? { ...prev, result: { ...prev.result, ...newResult } } : prev)
      setGenerationStates((prev) => ({ ...prev, [item]: { status: 'done' } }))
      if (deduction && remaining !== undefined) {
        setToast({ visible: true, message: `분석 완료! (남은 횟수: ${remaining}회)`, type: 'success' })
      }
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
    const url = `${window.location.origin}/share/${sermonId}`
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

  const handleDownloadPPT = async () => {
    if (!sermonId) return
    try {
      const res = await fetch(`/api/ppt/${sermonId}`)
      if (!res.ok) throw new Error('PPT 생성 실패')
      const blob = await res.blob()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `sermon-${sermonId}.pptx`
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (err: any) {
      setToast({ visible: true, message: err.message || 'PPT 다운로드 실패', type: 'error' })
    }
  }

  const handleUploadSuccess = (newSermonId: string) => {
    setShowUploadModal(false)
    router.push(`/workspace?id=${newSermonId}`)
  }

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
        <div className="glass-panel glass-border-neon p-8 md:p-10 rounded-3xl shadow-xl animate-in">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-5 shadow-sm">
            <AlertCircle className="w-7 h-7 text-rose-500 animate-pulse" />
          </div>
          <h2 className="font-extrabold text-[20px] text-slate-800 mb-2">설교를 불러올 수 없습니다</h2>
          <p className="text-[15px] text-slate-500 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={loadSermon}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 text-[15px] font-bold hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all duration-200 shadow-md shadow-blue-500/10"
          >
            <RefreshCw className="w-4 h-4" />
            다시 불러오기
          </button>
        </div>
      </div>
    )
  }

  if (!sermon) return null

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
      case 'pptData':
        return result.pptData ? <PPTSection data={result.pptData} sermonId={sermonId || ''} /> : null
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
        sermonId={sermonId || undefined}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onShare={handleShare}
        onDownloadPPT={handleDownloadPPT}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* 메인 컨텐츠 */}
      <div className="flex-1 min-w-0">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* 상단 헤더 */}
          <div className="flex items-center gap-4 mb-8 p-6 bg-white border border-[#e4e2dd] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] animate-in">
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
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#8d7a5b] text-white text-[13px] font-medium hover:bg-[#7a694e] active:scale-[0.98] transition-all duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    <span>새로 만들기</span>
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
            <div className="mb-6 animate-in" style={{ animationDelay: '0.05s' }}>
              <ResultTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
            </div>
          )}

          {/* 컨텐츠 */}
          <div className="animate-in" style={{ animationDelay: '0.1s' }}>
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
      {showUploadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={() => setShowUploadModal(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">새 설교 원고 업로드</h2>
                <p className="text-xs text-gray-400 mt-0.5">PDF, TXT, DOCX 파일을 업로드하면 AI가 6개 서비스를 생성합니다</p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
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
    </div>
  )
}
