'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2, Share2, Copy, Check, AlertCircle, ChevronDown, ChevronUp, Heart } from 'lucide-react'
import type { SermonRecord } from '@/types'
import Toast from '@/components/Toast'

export default function SharePage() {
  const params = useParams()
  const id = params.id as string

  const [sermon, setSermon] = useState<SermonRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' })
  const [kakaoLoaded, setKakaoLoaded] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(true)
  const [previewSection, setPreviewSection] = useState<'summary' | 'cardnews' | 'shorts'>('summary')

  useEffect(() => {
    const loadKakao = async () => {
      if (typeof window !== 'undefined' && !(window as any).Kakao) {
        const script = document.createElement('script')
        script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js'
        script.integrity = 'sha384-TuM2S3u4vQ2sZDVFJZeHfqL6jJNE/oO3GAL7atP3o1XpqBqTxSsR/cS7JkHn7HMo'
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

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/sermon/${id}`)
        if (!res.ok) throw new Error('데이터를 불러올 수 없습니다.')
        const data = await res.json()
        setSermon(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({
          title: sermon?.title || '설교 콘텐츠',
          text: '설교 콘텐츠를 확인해보세요',
          url,
        })
        return
      }
      if (kakaoLoaded && (window as any).Kakao?.Share) {
        (window as any).Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: sermon?.title || '설교 콘텐츠',
            description: '설교 콘텐츠를 확인해보세요',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-grid-tech relative overflow-hidden">
        <div className="glass-panel glass-border-neon p-8 rounded-2xl text-center max-w-xs w-full animate-in">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-slate-100" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
          </div>
          <p className="text-[15px] font-bold text-slate-500">콘텐츠를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !sermon) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="glass-panel glass-border-neon p-8 md:p-10 rounded-3xl shadow-xl animate-in">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-5 shadow-sm">
            <AlertCircle className="w-7 h-7 text-rose-500 animate-pulse" />
          </div>
          <h2 className="font-extrabold text-[20px] text-slate-800 mb-2">데이터를 찾을 수 없습니다</h2>
          <p className="text-[15px] text-slate-500 leading-relaxed">{error || '올바르지 않거나 이미 만료된 공유 링크입니다.'}</p>
        </div>
      </div>
    )
  }

  const result = sermon.result as any
  const summary = result?.summary

  return (
    <div className="min-h-screen bg-grid-tech relative overflow-hidden py-12 px-4">
      {/* 몽환적인 백그라운드 오로라 구체 */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse-slower" />

      <div className="max-w-3xl mx-auto z-10 relative">
        {/* 헤더 */}
        <div className="animate-in mb-8 p-6 glass-panel glass-border-neon rounded-2xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mb-1 select-all">
                {sermon.title || '설교 콘텐츠'}
              </h1>
              {sermon.passage && (
                <p className="text-[14px] font-medium text-slate-400 select-all">{sermon.passage}</p>
              )}
            </div>
            <button
              onClick={handleShare}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 text-white px-5 py-2.5 text-[15px] font-bold hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
            >
              <Share2 className="w-4 h-4" />
              공유하기
            </button>
          </div>
        </div>

        {/* 요약 */}
        {summary && (
          <div className="glass-panel glass-border-neon rounded-2xl shadow-sm overflow-hidden animate-in mb-6" style={{ animationDelay: '0.1s' }}>
            <button
              onClick={() => setPreviewOpen(!previewOpen)}
              className="w-full flex items-center justify-between p-5 hover:bg-white/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
                  <span className="text-[16px]">📄</span>
                </div>
                <p className="font-bold text-[16px] text-slate-700">설교 요약</p>
              </div>
              {previewOpen ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>
            {previewOpen && (
              <div className="px-6 pb-6 space-y-4 animate-scale">
                {summary.intro && (
                  <div className="p-4 bg-blue-50/30 rounded-xl border border-blue-100/30">
                    <p className="text-[12px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 inline-block mb-2 font-outfit uppercase tracking-wider">서론</p>
                    <p className="text-[15px] text-slate-600 leading-relaxed">{summary.intro}</p>
                  </div>
                )}
                {summary.body && (
                  <div className="p-4 bg-indigo-50/30 rounded-xl border border-indigo-100/30">
                    <p className="text-[12px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 inline-block mb-2 font-outfit uppercase tracking-wider">본론</p>
                    <p className="text-[15px] text-slate-600 leading-relaxed">{summary.body}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 카드뉴스 미리보기 */}
        {result?.cardNews?.slides?.[0] && (
          <div className="glass-panel glass-border-neon rounded-2xl shadow-sm overflow-hidden animate-in mb-6" style={{ animationDelay: '0.2s' }}>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shadow-sm">
                  <span className="text-[16px]">🎴</span>
                </div>
                <p className="font-bold text-[16px] text-slate-700">카드뉴스 미리보기</p>
              </div>
              <div className="rounded-2xl overflow-hidden border border-slate-200/50 bg-white/70 shadow-sm">
                <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                  <h4 className="text-[16px] font-extrabold text-white">{result.cardNews.slides[0].title}</h4>
                </div>
                <div className="px-5 py-4">
                  <p className="text-[15px] text-slate-600 leading-relaxed line-clamp-3">{result.cardNews.slides[0].content}</p>
                </div>
                <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-200/30 text-[13px] font-semibold text-slate-400">
                  외 {result.cardNews.slides.length - 1}장 더 보기
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 쇼츠 미리보기 */}
        {result?.shortsScript && (
          <div className="glass-panel glass-border-neon rounded-2xl shadow-sm overflow-hidden animate-in mb-6" style={{ animationDelay: '0.3s' }}>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shadow-sm">
                  <span className="text-[16px]">📱</span>
                </div>
                <p className="font-bold text-[16px] text-slate-700">유튜브 쇼츠 미리보기</p>
              </div>
              <div className="rounded-2xl overflow-hidden border border-slate-200/50 bg-white/70 shadow-sm">
                <div className="px-5 py-3 bg-gradient-to-r from-purple-500 to-indigo-600">
                  <p className="text-[13px] font-extrabold text-white tracking-wider uppercase font-outfit">쇼츠 대본</p>
                </div>
                <div className="px-5 py-4">
                  <p className="text-[15px] text-slate-600 leading-relaxed whitespace-pre-wrap line-clamp-6">
                    {result.shortsScript.length > 200
                      ? result.shortsScript.substring(0, 200) + '...'
                      : result.shortsScript}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 풀 콘텐츠 이동 */}
        <div className="text-center animate-in mt-10 p-6 glass-panel glass-border-neon rounded-2xl shadow-sm relative overflow-hidden" style={{ animationDelay: '0.4s' }}>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
          
          <a
            href={`/workspace?id=${id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 text-white px-8 py-3.5 text-[15px] font-bold hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 shadow-md shadow-blue-500/10"
          >
            전체 콘텐츠 상세히 보기
          </a>
          <p className="text-[13px] font-medium text-slate-400 mt-3.5">
            워크스페이스에 방문하시면 대본 전체 복사 및 PPT를 즉시 다운로드하실 수 있습니다.
          </p>
        </div>

        {/* 토스트 */}
        <Toast
          message={toast.message}
          type={toast.type}
          visible={toast.visible}
          onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
        />
      </div>
    </div>
  )
}
