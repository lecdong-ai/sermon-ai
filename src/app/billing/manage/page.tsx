'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CreditCard, AlertCircle, Check, ChevronRight, Loader2, ArrowUpDown, XCircle, RefreshCw, Calendar, Shield, Wallet } from 'lucide-react'
import { SUBSCRIPTION_STATUS_LABEL, SUBSCRIPTION_STATUS_COLOR, PLAN_DATA, type SubscriptionStatus } from '@/lib/billing/types'

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

function StatusBadge({ status }: { status: string }) {
  const colorClass = SUBSCRIPTION_STATUS_COLOR[status as SubscriptionStatus] || 'bg-slate-100 text-slate-500'
  const label = SUBSCRIPTION_STATUS_LABEL[status as SubscriptionStatus] || status
  return (
    <span className={`text-[12px] font-bold px-2.5 py-0.5 rounded-full ${colorClass}`}>
      {label}
    </span>
  )
}

export default function ManageBillingPage() {
  const router = useRouter()
  const [sub, setSub] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

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
      setShowCancelConfirm(false)
    }
  }

  const handleResubscribe = async () => {
    router.push('/pricing')
  }

  const currentPlanData = PLAN_DATA.find(p => p.id === sub?.plan)
  const planPrice = currentPlanData?.price || 0

  return (
    <div className="relative min-h-screen bg-slate-50/50">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-indigo-300/10 via-blue-300/5 to-transparent blur-3xl animate-pulse-slow" />
      </div>
      <div className="relative max-w-2xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-700 mb-8 transition-colors">
          <ChevronRight className="w-4 h-4 rotate-180" />
          메인으로
        </Link>

        <div className="animate-in">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-200/20">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-[24px] font-extrabold text-slate-800">구독 관리</h1>
              <p className="text-[14px] text-slate-400">결제 및 구독 정보를 관리합니다</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            </div>
          ) : !sub ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-7 h-7 text-slate-400" />
              </div>
              <h2 className="text-[18px] font-extrabold text-slate-800 mb-2">구독이 없습니다</h2>
              <p className="text-[14px] text-slate-500 mb-6">아직 구독 중인 플랜이 없습니다. 요금제를 선택하고 구독을 시작하세요.</p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[14px] font-bold hover:shadow-lg transition-all"
              >
                요금제 보기
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 현재 구독 정보 */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-[16px] font-bold text-slate-800 mb-4">현재 구독</h2>
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-[13px] text-slate-500">플랜</span>
                    <span className="text-[16px] font-extrabold text-slate-800">{sub.plan === 'pro' ? 'Pro' : 'Basic'} Plan</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-[13px] text-slate-500">상태</span>
                    <StatusBadge status={sub.status} />
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-[13px] text-slate-500">월 결제 금액</span>
                    <span className="text-[16px] font-extrabold text-indigo-600">{planPrice.toLocaleString()}원</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-[13px] text-slate-500">사용량</span>
                    <span className="text-[13px] font-semibold text-slate-700">
                      {sub.monthly_used} / {sub.monthly_limit}회
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-[13px] text-slate-500">구독 시작일</span>
                    <span className="text-[13px] text-slate-600">
                      {new Date(sub.billing_cycle_start).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-[13px] text-slate-500">다음 결제일</span>
                    <span className="text-[13px] font-semibold text-slate-700">
                      {new Date(sub.billing_cycle_end).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[13px] text-slate-500">결제 수단</span>
                    <span className="text-[13px] text-slate-600">{sub.payment_method || '미등록'}</span>
                  </div>
                </div>
              </div>

              {/* 최근 결제 내역 */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-[16px] font-bold text-slate-800 mb-4">최근 결제</h2>
                <div className="flex items-center gap-3 py-3 px-4 bg-slate-50 rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-700">{sub.plan === 'pro' ? 'Pro' : 'Basic'} Plan · {planPrice.toLocaleString()}원</p>
                    <p className="text-[11px] text-slate-400">{sub.payment_method || '카드'} · {new Date(sub.billing_cycle_start).toLocaleDateString('ko-KR')}</p>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">결제 완료</span>
                </div>
              </div>

              {/* 메시지 */}
              {message && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[13px] font-medium ${
                  message.includes('해지') && !message.includes('실패') && !message.includes('오류')
                    ? 'bg-amber-50 border border-amber-200 text-amber-700'
                    : message.includes('실패') || message.includes('오류')
                    ? 'bg-rose-50 border border-rose-200 text-rose-700'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {message}
                </div>
              )}

              {/* 액션 버튼 */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-[16px] font-bold text-slate-800 mb-4">관리</h2>
                <div className="space-y-3">
                  {sub.status === 'active' && (
                    <>
                      <Link
                        href="/billing/change"
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <ArrowUpDown className="w-4 h-4 text-slate-500" />
                          <span className="text-[14px] font-medium text-slate-700">플랜 변경</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </Link>
                      <button
                        onClick={() => setShowCancelConfirm(true)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-rose-200 hover:bg-rose-50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <XCircle className="w-4 h-4 text-rose-400" />
                          <span className="text-[14px] font-medium text-rose-600">구독 해지</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-rose-300" />
                      </button>
                    </>
                  )}

                  {(sub.status === 'canceled' || sub.status === 'expired') && (
                    <button
                      onClick={handleResubscribe}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 hover:from-indigo-100 hover:to-blue-100 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <RefreshCw className="w-4 h-4 text-indigo-500" />
                        <span className="text-[14px] font-medium text-indigo-700">다시 구독하기</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-indigo-300" />
                    </button>
                  )}

                  {sub.status === 'past_due' && (
                    <button
                      onClick={() => router.push('/billing')}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Wallet className="w-4 h-4 text-amber-500" />
                        <span className="text-[14px] font-medium text-amber-700">결제 정보 업데이트</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-amber-300" />
                    </button>
                  )}
                </div>
              </div>

              {/* 안내 문구 */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-[16px] font-bold text-slate-800 mb-4">결제 안내</h2>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-[12px] text-slate-500">
                    <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                    모든 결제는 토스페이먼츠를 통해 안전하게 처리됩니다.
                  </li>
                  <li className="flex items-start gap-2 text-[12px] text-slate-500">
                    <Calendar className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                    매월 같은 날짜에 자동으로 결제됩니다.
                  </li>
                  <li className="flex items-start gap-2 text-[12px] text-slate-500">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                    결제 실패 시 구독 상태가 변경될 수 있습니다.
                  </li>
                  <li className="flex items-start gap-2 text-[12px] text-slate-500">
                    <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                    언제든 구독을 해지할 수 있으며, 해지 시 다음 결제일부터 자동결제가 중단됩니다.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 해지 확인 모달 */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-sm w-full mx-4 animate-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-rose-500" />
            </div>
            <h3 className="text-[17px] font-bold text-slate-800 text-center mb-2">구독을 해지하시겠습니까?</h3>
            <p className="text-[13px] text-slate-500 text-center mb-6">
              현재 결제 주기({new Date(sub?.billing_cycle_end || '').toLocaleDateString('ko-KR')})까지 서비스를 계속 사용할 수 있습니다.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleCancel}
                disabled={cancelLoading}
                className="w-full py-3 rounded-xl bg-rose-500 text-white text-[14px] font-bold hover:bg-rose-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> 처리 중...</> : '해지 확인'}
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 text-[14px] font-bold hover:bg-slate-50 transition-all"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
