'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './AuthProvider'
import { Gauge, Sparkles, AlertTriangle, Loader2, Zap } from 'lucide-react'
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

  if (authLoading || loading || !usage) {
    return (
      <div className="px-4 pt-4 pb-3">
        <div className="rounded-xl bg-[#8d7a5b] px-4 py-3 shadow-md shadow-[#8d7a5b]/20">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
              <Gauge className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[12px] font-bold text-white tracking-wide">사용량</span>
          </div>
          <div className="flex items-center justify-center py-2">
            <Loader2 className="w-4 h-4 text-white/80 animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  const trialLeft = usage.trial.remaining
  const monthlyLeft = usage.monthly.remaining
  const workspaceLeft = usage.workspace.remaining
  const workspaceLimit = usage.workspace.limit
  const isUnlimited = usage.monthly.limit === -1

  return (
    <div className="px-4 pt-4 pb-3">
      <div className="rounded-xl bg-[#8d7a5b] px-4 py-3 shadow-md shadow-[#8d7a5b]/20">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
            <Gauge className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[12px] font-bold text-white tracking-wide">사용량</span>
        </div>

        <div className="space-y-1.5">
          {trialLeft > 0 && (
            <div className="flex items-center justify-between text-[12px] bg-white/15 rounded-lg px-2.5 py-1.5 border border-white/20 backdrop-blur-sm">
              <span className="text-white font-medium flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-yellow-200" />
                AI 분석
              </span>
              <span className="font-bold text-white">
                {trialLeft}회
              </span>
            </div>
          )}
          {!isUnlimited && monthlyLeft !== undefined && (
            <div className="flex items-center justify-between text-[12px] bg-white/15 rounded-lg px-2.5 py-1.5 border border-white/20 backdrop-blur-sm">
              <span className="text-white font-medium flex items-center gap-1.5">
                <Gauge className="w-3 h-3 text-blue-200" />
                이번 달
              </span>
              <span className={`font-bold ${monthlyLeft <= 3 ? 'text-red-200' : 'text-white'}`}>
                {monthlyLeft}회
              </span>
            </div>
          )}
          {workspaceLimit > 0 && (
            <div className="flex items-center justify-between text-[12px] bg-white/15 rounded-lg px-2.5 py-1.5 border border-white/20 backdrop-blur-sm">
              <span className="text-white font-medium flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-purple-200" />
                설교원고
              </span>
              <span className={`font-bold ${workspaceLeft <= 0 ? 'text-red-200' : 'text-white'}`}>
                {workspaceLeft}회
              </span>
            </div>
          )}
          {trialLeft <= 0 && monthlyLeft <= 0 && !isUnlimited && (
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-red-900 bg-white/30 border border-red-300/50 px-2.5 py-1.5 rounded-lg">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              사용 한도 소진
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
