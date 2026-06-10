'use client'

import { useEffect, useState, memo } from 'react'
import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { Gauge, AlertTriangle, Sparkles, Clock, Crown, Infinity, Zap } from 'lucide-react'
import type { UsageInfo } from '@/types'

export default memo(function UsageBadge() {
  const { user, loading: authLoading } = useAuth()
  const [usage, setUsage] = useState<UsageInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    setNow(Date.now())
  }, [])

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

  const { trial, monthly, workspace, plan } = usage
  const isTrial = plan === 'none'
  const trialEndDate = trial.ends_at ? new Date(trial.ends_at) : null
  const daysLeft = trialEndDate ? Math.ceil((trialEndDate.getTime() - now) / 86400000) : 0
  const isUnlimited = trial.remaining >= 999999 || (monthly.limit === 0 && monthly.remaining === 0 && !isTrial)
  const hasWorkspace = workspace.limit > 0

  const planColors = {
    none: { bg: 'from-amber-500 to-orange-500', light: 'from-amber-50 to-orange-50', text: 'text-amber-600', border: 'border-amber-200/50' },
    basic: { bg: 'from-blue-500 to-indigo-500', light: 'from-blue-50 to-indigo-50', text: 'text-blue-600', border: 'border-blue-200/50' },
    pro: { bg: 'from-purple-500 to-indigo-600', light: 'from-purple-50 to-indigo-50', text: 'text-purple-600', border: 'border-purple-200/50' },
  }
  const colors = planColors[plan] || planColors.none

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl border border-slate-200/40 shadow-lg shadow-indigo-500/3 w-full">
      {/* 상단 플래너 바 */}
      <div className={`bg-gradient-to-r ${colors.bg} px-4 py-2.5`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              {isUnlimited ? (
                <Infinity className="w-4 h-4 text-white" />
              ) : (
                <Gauge className="w-4 h-4 text-white" />
              )}
            </div>
            <span className="text-[14px] font-bold text-white">
              {isUnlimited ? '무제한' : plan === 'none' ? '무료체험' : plan === 'basic' ? 'Basic' : 'Pro'}
            </span>
          </div>
          {!isUnlimited && !isTrial && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
              <Crown className="w-3 h-3 text-white" />
              <span className="text-[11px] font-semibold text-white">Premium</span>
            </div>
          )}
        </div>
      </div>

      {/* 본문 */}
      <div className="p-4 space-y-3">
        {isUnlimited ? (
          <div className="text-center py-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/50">
              <Zap className="w-4 h-4 text-purple-500" />
              <span className="text-[14px] font-bold text-purple-700">무제한 사용 가능</span>
            </div>
          </div>
        ) : isTrial && trial.remaining > 0 && !trial.expired ? (
          <>
            {/* 사용량 프로그레스 바 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] font-medium text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  남은 분석
                </span>
                <span className="text-[16px] font-extrabold text-slate-800">
                  {trial.remaining}<span className="text-[12px] font-medium text-slate-400 ml-0.5">/ {trial.limit}</span>
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                  style={{ width: `${(trial.remaining / trial.limit) * 100}%` }}
                />
              </div>
            </div>

            {/* 남은 기간 */}
            <div className="flex items-center justify-between text-[12px] bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                남은 기간
              </span>
              <span className={`font-bold ${daysLeft <= 3 ? 'text-amber-600' : 'text-slate-600'}`}>
                {daysLeft}일
              </span>
            </div>

            {/* 설교원고제작 */}
            {hasWorkspace && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] font-medium text-slate-500 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-purple-500" />
                    설교원고제작
                  </span>
                  <span className="text-[16px] font-extrabold text-slate-800">
                    {workspace.remaining}회
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-500"
                    style={{ width: `${(workspace.remaining / workspace.limit) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </>
        ) : isTrial && trial.expired ? (
          <div className="flex items-center justify-center gap-2 py-3 text-[13px] text-amber-600 bg-amber-50 border border-amber-200 rounded-xl">
            <Clock className="w-4 h-4 shrink-0" />
            <span className="font-semibold">체험 기간이 만료되었습니다</span>
          </div>
        ) : trial.remaining <= 0 && isTrial ? (
          <div className="flex items-center justify-center gap-2 py-3 text-[13px] text-rose-600 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">사용 횟수가 모두 소진되었습니다</span>
          </div>
        ) : (
          <>
            {/* 유료 사용자 - 월간 사용량 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] font-medium text-slate-500 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-indigo-500" />
                  AI 분석
                </span>
                <span className="text-[16px] font-extrabold text-slate-800">
                  {monthly.remaining === 0 ? '무제한' : `${monthly.remaining}회`}
                </span>
              </div>
              {monthly.limit > 0 && (
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500"
                    style={{ width: `${(monthly.remaining / monthly.limit) * 100}%` }}
                  />
                </div>
              )}
            </div>

            {/* 설교원고제작 사용량 */}
            {workspace.limit > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] font-medium text-slate-500 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-purple-500" />
                    설교원고제작
                  </span>
                  <span className="text-[16px] font-extrabold text-slate-800">
                    {workspace.remaining}회
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-500"
                    style={{ width: `${(workspace.remaining / workspace.limit) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* CTA 버튼 */}
        {!usage.can_generate && !isUnlimited && (
          <Link
            href="/pricing"
            className="block text-center text-[13px] font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl px-4 py-2.5 hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            요금제 업그레이드
          </Link>
        )}
      </div>
    </div>
  )
})
