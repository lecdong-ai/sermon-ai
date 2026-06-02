'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, Loader2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react'
import { PLAN_DATA, type Plan } from '@/lib/billing/types'

export default function ChangePlanPage() {
  const router = useRouter()
  const [sub, setSub] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [targetPlan, setTargetPlan] = useState<string | null>(null)
  const [changeLoading, setChangeLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

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

  const currentPlan = sub?.plan || 'basic'
  const nextBillingDate = sub?.billing_cycle_end
    ? new Date(sub.billing_cycle_end).toLocaleDateString('ko-KR')
    : ''

  const otherPlan = currentPlan === 'pro' ? PLAN_DATA.find(p => p.id === 'basic')! : PLAN_DATA.find(p => p.id === 'pro')!

  const isUpgrade = otherPlan.id === 'pro'

  const handleChange = async () => {
    if (!targetPlan) return
    setChangeLoading(true)
    setError('')

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || '플랜 변경 중 오류가 발생했습니다.')
    } finally {
      setChangeLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="max-w-md w-full px-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10 text-center animate-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-[20px] font-extrabold text-slate-800 mb-2">플랜이 변경되었습니다</h1>
            <p className="text-[14px] text-slate-500 mb-6">
              {nextBillingDate}부터 <strong>{otherPlan.name} Plan</strong>으로 변경됩니다.
            </p>
            <Link
              href="/billing/manage"
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[15px] font-bold hover:shadow-lg transition-all"
            >
              구독 관리로 이동
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-slate-50/50">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-indigo-300/10 via-blue-300/5 to-transparent blur-3xl" />
      </div>
      <div className="relative max-w-lg mx-auto px-4 py-12">
        <Link href="/billing/manage" className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-700 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          구독 관리로 돌아가기
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 animate-in">
          <div className="text-center mb-6">
            <h1 className="text-[20px] font-extrabold text-slate-800 mb-2">플랜 변경</h1>
            <p className="text-[14px] text-slate-500">
              {isUpgrade ? '더 많은 기능을 사용해보세요' : '필요에 맞게 플랜을 조정하세요'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className={`rounded-2xl border-2 p-4 ${targetPlan === currentPlan ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 bg-slate-50/50'}`}>
              <p className="text-[11px] text-slate-400 mb-1">현재 플랜</p>
              <p className="text-[16px] font-extrabold text-slate-800">
                {currentPlan === 'pro' ? 'Pro' : 'Basic'}
              </p>
              <p className="text-[12px] text-slate-500">{currentPlan === 'pro' ? '19,800원' : '9,900원'}/월</p>
            </div>
            <div className={`rounded-2xl border-2 p-4 ${targetPlan === otherPlan.id ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200'}`}>
              <p className="text-[11px] text-slate-400 mb-1">변경할 플랜</p>
              <p className="text-[16px] font-extrabold text-indigo-600">{otherPlan.name}</p>
              <p className="text-[12px] text-indigo-500">{otherPlan.price.toLocaleString()}원/월</p>
            </div>
          </div>

          {isUpgrade && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-indigo-50 border border-indigo-100 text-[13px] text-indigo-700 mb-6">
              <Sparkles className="w-4 h-4 shrink-0" />
              업그레이드 시 차액이 일할 계산되어 적용됩니다
            </div>
          )}

          <div className="bg-slate-50 rounded-2xl p-4 mb-6 space-y-2">
            <p className="text-[13px] font-bold text-slate-700 mb-2">{otherPlan.name} Plan 혜택</p>
            {otherPlan.features.map((f, i) => (
              <div key={i} className="flex items-start gap-2 text-[12px]">
                <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${f.highlight ? 'text-indigo-600' : 'text-emerald-500'}`} />
                <span className={`${f.highlight ? 'text-indigo-700 font-medium' : 'text-slate-600'}`}>{f.text}</span>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 rounded-2xl p-4 mb-6 text-[12px] text-amber-700 leading-relaxed">
            <p className="font-medium mb-1">변경 안내</p>
            <p>플랜 변경은 <strong>{nextBillingDate}</strong>부터 적용됩니다. 현재 결제 주기가 끝날 때까지는 기존 플랜이 유지됩니다.</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-[13px] text-rose-700 mb-4">
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
              onClick={() => { setTargetPlan(otherPlan.id); handleChange() }}
              disabled={changeLoading}
              className={`flex-1 py-3 rounded-xl text-[14px] font-bold transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 ${
                isUpgrade
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:shadow-lg'
                  : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              {changeLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> 처리 중...</>
              ) : (
                <>{isUpgrade ? '업그레이드' : '다운그레이드'} 확인</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
