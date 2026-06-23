'use client'

import { useEffect, useState, useCallback } from 'react'
import { Loader2, BarChart3, Sparkles, FileText, Youtube, Crown } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

export interface LimitActionInfo {
  current: number
  limit: number
  remaining: number
  allowed: boolean
  reason?: 'limit_reached' | 'supporter_only'
}

export interface LimitsData {
  tier: 'general' | 'supporter'
  inGracePeriod: boolean
  gracePeriodEnd: string | null
  resetAt: string
  daysUntilReset: number
  actions: {
    ai_analysis: LimitActionInfo
    manual_sermon: LimitActionInfo
    project: LimitActionInfo
    youtube: LimitActionInfo
  }
}

const ACTION_META: Record<keyof LimitsData['actions'], {
  label: string
  icon: any
  shortLabel: string
}> = {
  ai_analysis: { label: 'AI 분석 6종', shortLabel: 'AI 분석', icon: Sparkles },
  manual_sermon: { label: '새 설교 등록', shortLabel: '설교 등록', icon: FileText },
  project: { label: '말씀 연구실', shortLabel: '연구실', icon: FileText },
  youtube: { label: '유튜브 연구소', shortLabel: '유튜브', icon: Youtube },
}

export function useLimits(): { limits: LimitsData | null; loading: boolean; refresh: () => Promise<void> } {
  const { user } = useAuth()
  const [limits, setLimits] = useState<LimitsData | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setLimits(null)
      setLoading(false)
      return
    }
    try {
      const res = await fetch('/api/usage', { cache: 'no-store' })
      const data = await res.json()
      if (data.error) {
        setLimits(null)
        return
      }
      setLimits({
        tier: data.limits.tier,
        inGracePeriod: data.limits.inGracePeriod,
        gracePeriodEnd: data.limits.gracePeriodEnd,
        resetAt: data.limits.resetAt,
        daysUntilReset: data.limits.daysUntilReset,
        actions: data.limits.actions,
      })
    } catch {
      setLimits(null)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { limits, loading, refresh }
}

interface UsageCounterProps {
  actionKey: keyof LimitsData['actions']
  limits: LimitsData
  size?: 'sm' | 'md'
  showIcon?: boolean
  className?: string
}

export function UsageCounter({ actionKey, limits, size = 'md', showIcon = true, className = '' }: UsageCounterProps) {
  const meta = ACTION_META[actionKey]
  const action = limits.actions[actionKey]
  const Icon = meta.icon
  const isUnlimited = action.limit === -1 || limits.inGracePeriod
  const isZeroLimit = action.limit === 0
  const isFull = !isUnlimited && !isZeroLimit && action.current >= action.limit
  const pct = !isUnlimited && action.limit > 0 ? Math.min(100, (action.current / action.limit) * 100) : 0

  const sizeClasses = size === 'sm'
    ? 'text-[11px] gap-1.5 px-2 py-0.5'
    : 'text-[12px] gap-2 px-2.5 py-1'

  // 한도 0 (사역 동참자 전용)
  if (isZeroLimit) {
    return (
      <div className={`inline-flex items-center ${sizeClasses} rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 ${className}`}>
        {showIcon && <Crown className="w-3 h-3" />}
        <span className="font-semibold">사역 동참자 전용</span>
      </div>
    )
  }

  // 유예 기간
  if (limits.inGracePeriod) {
    return (
      <div className={`inline-flex items-center ${sizeClasses} rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-300 ${className}`}>
        {showIcon && <Icon className="w-3 h-3" />}
        <span className="font-semibold">유예 기간 · 기존 정책</span>
      </div>
    )
  }

  // 무제한
  if (isUnlimited) {
    return (
      <div className={`inline-flex items-center ${sizeClasses} rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 ${className}`}>
        {showIcon && <Icon className="w-3 h-3" />}
        <span className="font-semibold">무제한</span>
      </div>
    )
  }

  // 한도 표시
  const colorClass = isFull
    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
    : pct >= 80
    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
    : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'

  return (
    <div className={`inline-flex items-center ${sizeClasses} rounded-md border ${colorClass} ${className}`}>
      {showIcon && <Icon className="w-3 h-3" />}
      <span className="font-bold tabular-nums">{action.current}/{action.limit}</span>
      {size === 'md' && (
        <span className="text-current/70 font-medium">· D-{limits.daysUntilReset} 리셋</span>
      )}
    </div>
  )
}

interface UsageGridProps {
  limits: LimitsData
  className?: string
}

export function UsageGrid({ limits, className = '' }: UsageGridProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 ${className}`}>
      {(Object.keys(ACTION_META) as Array<keyof LimitsData['actions']>).map(key => (
        <div key={key} className="flex flex-col gap-1">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider px-0.5">
            {ACTION_META[key].shortLabel}
          </p>
          <UsageCounter actionKey={key} limits={limits} showIcon={false} />
        </div>
      ))}
    </div>
  )
}
