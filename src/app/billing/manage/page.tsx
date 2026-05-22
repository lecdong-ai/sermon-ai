'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CreditCard, AlertCircle, Check, ChevronRight, Loader2 } from 'lucide-react'

interface SubscriptionInfo {
  id: string
  plan: string
  status: string
  billing_cycle_start: string
  billing_cycle_end: string
  monthly_limit: number
  monthly_used: number
  payment_method: string | null
}

export default function ManageBillingPage() {
  const router = useRouter()
  const [sub, setSub] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [message, setMessage] = useState('')

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
    if (!confirm('정말 구독을 해지하시겠습니까? 현재 결제 주기가 종료될 때까지 서비스를 계속 사용할 수 있습니다.')) return
    setCancelLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/billing/cancel', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setMessage('구독이 해지되었습니다. 결제 주기가 종료될 때까지 서비스를 계속 사용할 수 있습니다.')
        setSub(prev => prev ? { ...prev, status: 'canceled' } : null)
      } else {
        setMessage(data.error || '해지 실패')
      }
    } catch {
      setMessage('네트워크 오류')
    } finally {
      setCancelLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-50/50">
      <div className="max-w-lg mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-700 mb-8 transition-colors">
          <ChevronRight className="w-4 h-4 rotate-180" />
          메인으로
        </Link>

        <div className="glass-panel rounded-3xl border border-white/60 p-6 animate-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-[20px] font-extrabold text-slate-800">구독 관리</h1>
              <p className="text-[13px] text-slate-400">결제 및 구독 정보를 관리합니다</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            </div>
          ) : !sub ? (
            <div className="text-center py-10">
              <p className="text-[15px] text-slate-500 mb-4">활성화된 구독이 없습니다.</p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[14px] font-bold hover:shadow-lg transition-all"
              >
                요금제 보기
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-slate-500">플랜</span>
                  <span className="text-[15px] font-bold text-slate-800">{sub.plan === 'pro' ? 'Pro' : 'Basic'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-slate-500">상태</span>
                  <span className={`text-[13px] font-bold px-2 py-0.5 rounded-full ${
                    sub.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                    sub.status === 'past_due' ? 'bg-amber-50 text-amber-600' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {sub.status === 'active' ? '이용 중' : sub.status === 'past_due' ? '결제 지연' : '해지됨'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-slate-500">사용량</span>
                  <span className="text-[13px] font-semibold text-slate-700">
                    {sub.monthly_used} / {sub.monthly_limit}회
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-slate-500">결제 주기</span>
                  <span className="text-[13px] text-slate-600">
                    {new Date(sub.billing_cycle_end).toLocaleDateString('ko-KR')} 종료
                  </span>
                </div>
                {sub.payment_method && (
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-slate-500">결제 수단</span>
                    <span className="text-[13px] text-slate-600">{sub.payment_method}</span>
                  </div>
                )}
              </div>

              {message && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[13px] font-medium ${
                  message.includes('해지') && !message.includes('실패')
                    ? 'bg-amber-50 border border-amber-200 text-amber-700'
                    : 'bg-rose-50 border border-rose-200 text-rose-700'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {message}
                </div>
              )}

              {sub.status === 'active' && (
                <button
                  onClick={handleCancel}
                  disabled={cancelLoading}
                  className="w-full py-3 rounded-xl border-2 border-rose-200 text-rose-600 text-[14px] font-bold hover:bg-rose-50 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {cancelLoading ? '처리 중...' : '구독 해지하기'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
