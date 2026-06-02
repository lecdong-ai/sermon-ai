'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertCircle, Check, Loader2, ChevronRight } from 'lucide-react'

export default function CancelBillingPage() {
  const router = useRouter()
  const [sub, setSub] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/billing/status')
      .then(r => r.json())
      .then(data => {
        if (data.subscription) setSub(data.subscription)
        else setSub(null)
      })
      .catch(() => setSub(null))
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async () => {
    setCancelLoading(true)
    setError('')
    try {
      const res = await fetch('/api/billing/cancel', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setCancelled(true)
      } else {
        setError(data.error || '해지 처리에 실패했습니다.')
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setCancelLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!sub) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[15px] text-slate-500 mb-4">활성화된 구독이 없습니다.</p>
          <Link href="/pricing" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[14px] font-bold hover:shadow-lg transition-all">
            요금제 보기
          </Link>
        </div>
      </div>
    )
  }

  if (cancelled) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="max-w-md w-full px-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10 text-center animate-in">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-amber-500" />
            </div>
            <h1 className="text-[20px] font-extrabold text-slate-800 mb-2">구독이 해지되었습니다</h1>
            <p className="text-[14px] text-slate-500 mb-6">
              <strong>{sub.plan === 'pro' ? 'Pro' : 'Basic'} Plan</strong>의 구독이 해지되었습니다.<br />
              다음 결제일({new Date(sub.billing_cycle_end).toLocaleDateString('ko-KR')})까지 서비스를 계속 사용하실 수 있습니다.
            </p>
            <Link
              href="/pricing"
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[15px] font-bold hover:shadow-lg transition-all"
            >
              다시 구독하기
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const endDate = new Date(sub.billing_cycle_end).toLocaleDateString('ko-KR')
  const planName = sub.plan === 'pro' ? 'Pro' : 'Basic'
  const planPrice = sub.plan === 'pro' ? '19,800' : '9,900'

  return (
    <div className="relative min-h-screen bg-slate-50/50">
      <div className="max-w-lg mx-auto px-4 py-12">
        <Link href="/billing/manage" className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-700 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          구독 관리로 돌아가기
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 animate-in">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-rose-500" />
            </div>
            <h1 className="text-[20px] font-extrabold text-slate-800 mb-2">구독 해지</h1>
            <p className="text-[14px] text-slate-500">정말로 구독을 해지하시겠습니까?</p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 mb-6 space-y-2">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-slate-500">현재 플랜</span>
              <span className="font-bold text-slate-800">{planName} Plan</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-slate-500">월 결제 금액</span>
              <span className="font-bold text-slate-800">{planPrice}원</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-slate-500">서비스 이용 가능</span>
              <span className="font-bold text-slate-800">{endDate}까지</span>
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl p-4 mb-6 text-[13px] text-amber-700 leading-relaxed">
            <p className="font-medium mb-1">해지 안내</p>
            <ul className="space-y-1 text-[12px]">
              <li>• {endDate}까지 서비스를 계속 사용하실 수 있습니다.</li>
              <li>• 이후에는 AI 분석 및 설교 제작 기능이 제한됩니다.</li>
              <li>• 기존에 생성한 결과는 읽기 및 다운로드가 가능합니다.</li>
              <li>• 언제든 다시 구독하실 수 있습니다.</li>
            </ul>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-[13px] font-medium text-rose-700 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/billing/manage"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-slate-600 text-[14px] font-bold hover:bg-slate-50 transition-all"
            >
              취소
            </Link>
            <button
              onClick={handleCancel}
              disabled={cancelLoading}
              className="flex-1 py-3 rounded-xl bg-rose-500 text-white text-[14px] font-bold hover:bg-rose-600 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {cancelLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> 처리 중...</> : '구독 해지 확인'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
