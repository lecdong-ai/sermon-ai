'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { Gauge, AlertTriangle, Sparkles, Clock, Crown } from 'lucide-react'
import type { UsageInfo } from '@/types'

export default function UsageBadge() {
  const { user, loading: authLoading } = useAuth()
  const [usage, setUsage] = useState<UsageInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { setLoading(false); return }

    fetch('/api/usage')
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setUsage(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, authLoading])

  if (authLoading || loading || !usage) return null

  const { trial, monthly, plan } = usage
  const isTrial = plan === 'none'
  const trialEndDate = trial.ends_at ? new Date(trial.ends_at) : null
  const daysLeft = trialEndDate ? Math.ceil((trialEndDate.getTime() - Date.now()) / 86400000) : 0

  return (
    <div className="bg-gradient-to-br from-white to-indigo-50/30 rounded-2xl border border-indigo-100/60 px-4 py-3 w-full text-center">
      <div className="flex items-center justify-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-sm">
          <Gauge className="w-4 h-4 text-white" />
        </div>
        <span className="text-[15px] font-bold text-slate-800">
          {plan === 'none' ? '무료체험' : plan === 'basic' ? 'Basic' : 'Pro'}
        </span>
      </div>

      <div className="space-y-1.5">
        {isTrial && trial.remaining > 0 && !trial.expired && (
          <>
            <div className="flex items-center justify-between text-[13px] bg-white/80 rounded-lg px-2.5 py-1.5 border border-indigo-100/40">
              <span className="text-slate-500 font-medium flex items-center gap-1 truncate">
                <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                남은 분석
              </span>
              <span className="font-bold text-slate-800 text-[14px] shrink-0 ml-1.5">
                {trial.remaining}회
              </span>
            </div>
            <div className="flex items-center justify-between text-[12px] bg-white/80 rounded-lg px-2.5 py-1 border border-indigo-100/40">
              <span className="text-slate-400 flex items-center gap-1 truncate">
                <Clock className="w-3 h-3 shrink-0" />
                남은 기간
              </span>
              <span className={`font-semibold shrink-0 ml-1.5 ${daysLeft <= 3 ? 'text-amber-600' : 'text-slate-500'}`}>
                {daysLeft}일
              </span>
            </div>
          </>
        )}

        {isTrial && trial.expired && (
          <div className="flex items-center justify-center gap-1.5 text-[12px] text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg">
            <Clock className="w-3 h-3 shrink-0" />
            체험 기간 만료
          </div>
        )}

        {trial.remaining <= 0 && isTrial && (
          <div className="flex items-center justify-center gap-1.5 text-[12px] text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-lg">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            횟수 소진
          </div>
        )}

        {!isTrial && (
          <div className="flex items-center justify-between text-[13px] bg-white/80 rounded-lg px-2.5 py-1.5 border border-indigo-100/40">
            <span className="text-slate-500 font-medium flex items-center gap-1 truncate">
              <Crown className="w-3 h-3 text-indigo-500 shrink-0" />
              이번 달
            </span>
            <span className={`font-bold text-[14px] shrink-0 ml-1.5 ${monthly.remaining <= 3 ? 'text-rose-500' : 'text-slate-800'}`}>
              {monthly.remaining}회
            </span>
          </div>
        )}

        {!usage.can_generate && (
          <Link
            href="/pricing"
            className="block text-center text-[12px] font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg px-2.5 py-2 hover:shadow-md transition-all mt-1"
          >
            요금제 보기
          </Link>
        )}
      </div>
    </div>
  )
}
