'use client'

import { useCallback, useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { AlertCircle, RefreshCw, Lock, Crown, Sparkles } from 'lucide-react'
import type { SermonWorkspace } from '@/types'

const SermonWorkbench = dynamic(() => import('@/components/sermon/SermonWorkbench'), { ssr: false })

export default function SermonWorkbenchPage() {
  const params = useParams()
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
      <div className="relative min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-purple-300/8 via-indigo-300/5 to-transparent blur-3xl" />
        </div>
        <div className="relative glass-panel rounded-3xl border border-white/70 shadow-xl p-8 sm:p-10 text-center max-w-md w-full animate-in">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-7 h-7 text-amber-500" />
          </div>
          <h2 className="text-[20px] font-extrabold text-slate-800 mb-2">설교 워크스페이스</h2>
          <p className="text-[14px] text-slate-500 mb-6 leading-relaxed">
            설교 워크스페이스는 <strong>Pro 플랜</strong>에서 사용할 수 있습니다.<br />
            Pro로 업그레이드하고 AI와 함께 설교를 준비하세요.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 bg-indigo-50 rounded-xl px-4 py-2.5 text-[13px] text-left">
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="text-slate-700">AI 핵심 메시지 추천</span>
            </div>
            <div className="flex items-center gap-2.5 bg-indigo-50 rounded-xl px-4 py-2.5 text-[13px] text-left">
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="text-slate-700">본문 관찰 / 해석 / 적용 도구</span>
            </div>
            <div className="flex items-center gap-2.5 bg-indigo-50 rounded-xl px-4 py-2.5 text-[13px] text-left">
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="text-slate-700">개요 자동 생성 및 편집</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link
              href="/pricing"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[14px] font-bold hover:shadow-lg hover:shadow-indigo-200/50 transition-all active:scale-95"
            >
              <Crown className="w-4 h-4" />
              Pro 업그레이드
            </Link>
            <button
              onClick={() => router.push('/sermon')}
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-[14px] font-bold hover:bg-slate-200 transition-all"
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
      <div className="relative min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-indigo-300/10 via-blue-300/5 to-transparent blur-3xl animate-pulse-slow" />
        </div>
        <div className="relative flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200/60" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin" />
          </div>
          <p className="text-[14px] text-slate-400 font-semibold tracking-wider animate-pulse">워크스페이스를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !sermon) {
    return (
      <div className="relative min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-purple-300/8 via-indigo-300/5 to-transparent blur-3xl" />
        </div>
        <div className="relative glass-panel rounded-3xl border border-white/70 shadow-xl p-10 text-center max-w-md w-full animate-in">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-7 h-7 text-rose-500" />
          </div>
          <h2 className="text-[20px] font-extrabold text-slate-800 mb-2">설교를 불러올 수 없습니다</h2>
          <p className="text-[15px] text-slate-500 mb-6">{error || '설교를 찾을 수 없습니다'}</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={loadSermon}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[14px] font-bold hover:shadow-lg hover:shadow-indigo-200/50 transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              다시 시도
            </button>
            <button
              onClick={() => router.push('/sermon')}
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-[14px] font-bold hover:bg-slate-200 transition-all"
            >
              목록으로
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <SermonWorkbench sermon={sermon} />
}
