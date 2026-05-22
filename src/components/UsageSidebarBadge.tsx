'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './AuthProvider'
import { Gauge, Sparkles, AlertTriangle, Loader2 } from 'lucide-react'
import type { UsageInfo } from '@/types'

export default function UsageSidebarBadge() {
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

  if (authLoading || loading) return null
  if (!user || !usage) return null

  const trialLeft = usage.trial.remaining
  const monthlyLeft = usage.monthly.remaining
  const isUnlimited = usage.monthly.limit === -1

  return (
    <div className="px-4 pt-6 pb-5">
      <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] px-5 py-4">
        <div className="space-y-2">
          {trialLeft > 0 && (
            <div className="flex items-center justify-between text-[14px] bg-white/[0.04] rounded-xl px-3.5 py-2.5 border border-white/[0.06]">
              <span className="text-white/60 font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400/80" />
                무료 체험
              </span>
              <span className="font-bold text-white/90">
                남은 {trialLeft}회
              </span>
            </div>
          )}
          {!isUnlimited && (
            <div className="flex items-center justify-between text-[14px] bg-white/[0.04] rounded-xl px-3.5 py-2.5 border border-white/[0.06]">
              <span className="text-white/60 font-medium flex items-center gap-2">
                <Gauge className="w-4 h-4 text-primary-400/80" />
                이번 달
              </span>
              <span className={`font-bold ${monthlyLeft <= 3 ? 'text-red-400' : 'text-white/90'}`}>
                남은 {monthlyLeft}회
              </span>
            </div>
          )}
          {trialLeft <= 0 && monthlyLeft <= 0 && !isUnlimited && (
            <div className="flex items-center justify-center gap-2 text-[13px] text-red-400 bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 rounded-xl mt-1">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              사용 한도를 모두 소진했습니다
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
