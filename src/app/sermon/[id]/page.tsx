'use client'

import { useCallback, useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { AlertCircle, RefreshCw, Lock, Crown, Sparkles } from 'lucide-react'
import type { SermonWorkspace } from '@/types'

const SermonWorkbench = dynamic(() => import('@/components/sermon/SermonWorkbench'), { ssr: false })

export default function SermonWorkbenchPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const isAdvanced = searchParams.get('advanced') === 'true'
  const router = useRouter()
  const [sermon, setSermon] = useState<SermonWorkspace | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [plan, setPlan] = useState<string | null>(null)
  const [planChecked, setPlanChecked] = useState(false)

  useEffect(() => {
    fetch('/api/usage')
      .then(r => r.json())
      .then(d => { if (!d.error) setPlan(d.plan) })
      .catch(() => {})
      .finally(() => setPlanChecked(true))
  }, [])

  const loadSermon = useCallback(() => {
    setLoading(true)
    setError('')
    fetch(`/api/sermons/${params.id}`)
      .then(r => r.json())
      .then(json => {
        if (!json.success) {
          setError(json.error || '불러오기 실패')
          return
        }
        setSermon(json.data)
      })
      .catch(() => setError('네트워크 오류'))
      .finally(() => setLoading(false))
  }, [params.id])

  useEffect(() => {
    loadSermon()
  }, [loadSermon])

  // Pro-only gate
  if (planChecked && plan !== 'pro' && !loading && sermon) {
    return (
      <div className="relative min-h-screen bg-[#141829] flex items-center justify-center">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-purple-500/8 via-indigo-500/5 to-transparent blur-[120px]" />
          <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-indigo-500/8 via-blue-500/5 to-transparent blur-[120px]" />
          <div className="absolute inset-0 bg-grid-tech opacity-[0.03]" />
        </div>
        <div className="relative rounded-3xl bg-[#121420] border border-white/[0.08] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] p-8 sm:p-10 text-center max-w-md w-full animate-in">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-7 h-7 text-amber-300" />
          </div>
          <h2 className="text-[20px] font-extrabold text-white/90 mb-2">설교 워크스페이스</h2>
          <p className="text-[14px] text-white/50 mb-6 leading-relaxed">
            설교 워크스페이스는 <strong className="text-white/80">Pro 플랜</strong>에서 사용할 수 있습니다.<br />
            Pro로 업그레이드하고 AI와 함께 설교를 준비하세요.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 bg-indigo-500/10 rounded-xl px-4 py-2.5 text-[13px] text-left border border-indigo-500/10">
              <Sparkles className="w-4 h-4 text-indigo-300 shrink-0" />
              <span className="text-white/70">AI 핵심 메시지 추천</span>
            </div>
            <div className="flex items-center gap-2.5 bg-indigo-500/10 rounded-xl px-4 py-2.5 text-[13px] text-left border border-indigo-500/10">
              <Sparkles className="w-4 h-4 text-indigo-300 shrink-0" />
              <span className="text-white/70">본문 관찰 / 해석 / 적용 도구</span>
            </div>
            <div className="flex items-center gap-2.5 bg-indigo-500/10 rounded-xl px-4 py-2.5 text-[13px] text-left border border-indigo-500/10">
              <Sparkles className="w-4 h-4 text-indigo-300 shrink-0" />
              <span className="text-white/70">개요 자동 생성 및 편집</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link
              href="/pricing"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[14px] font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all active:scale-95"
            >
              <Crown className="w-4 h-4" />
              Pro 업그레이드
            </Link>
            <button
              onClick={() => router.push('/sermon')}
              className="px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.06] text-white/50 text-[14px] font-bold hover:bg-white/[0.12] transition-all"
            >
              목록으로
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#141829] flex items-center justify-center">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-indigo-500/8 via-blue-500/5 to-transparent blur-[120px] animate-pulse-slow" />
          <div className="absolute inset-0 bg-grid-tech opacity-[0.03]" />
        </div>
        <div className="relative flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-white/[0.06]" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-400 animate-spin" />
          </div>
          <p className="text-[14px] text-white/40 font-semibold tracking-wider animate-pulse">워크스페이스를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !sermon) {
    return (
      <div className="relative min-h-screen bg-[#141829] flex items-center justify-center">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-purple-500/8 via-indigo-500/5 to-transparent blur-[120px]" />
          <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-indigo-500/8 via-blue-500/5 to-transparent blur-[120px]" />
          <div className="absolute inset-0 bg-grid-tech opacity-[0.03]" />
        </div>
        <div className="relative rounded-3xl bg-[#121420] border border-white/[0.08] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] p-10 text-center max-w-md w-full animate-in">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-7 h-7 text-rose-300" />
          </div>
          <h2 className="text-[20px] font-extrabold text-white/90 mb-2">설교를 불러올 수 없습니다</h2>
          <p className="text-[15px] text-white/50 mb-6">{error || '설교를 찾을 수 없습니다'}</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={loadSermon}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[14px] font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              다시 시도
            </button>
            <button
              onClick={() => router.push('/sermon')}
              className="px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.06] text-white/50 text-[14px] font-bold hover:bg-white/[0.12] transition-all"
            >
              목록으로
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <SermonWorkbench sermon={sermon} advanced={isAdvanced} />
}
