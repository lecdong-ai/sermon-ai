'use client'

import { Crown } from 'lucide-react'
import { useLimits } from './UsageCounter'

export default function UsagePanel({ hideTitle = false }: { hideTitle?: boolean }) {
  const { limits, loading } = useLimits()

  if (loading || !limits) {
    return (
      <div className="px-3 py-3 border-b border-white/10">
        <div className="animate-pulse space-y-1.5">
          <div className="h-3 bg-white/5 rounded w-3/4" />
          <div className="h-2 bg-white/5 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="px-3 py-3 border-b border-white/10">
      <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-semibold">
        <Crown className="w-3.5 h-3.5" />
        무제한
      </div>
      <p className="text-[10px] text-emerald-300/70 mt-1">모든 기능을 무료로 이용하실 수 있습니다</p>
    </div>
  )
}
