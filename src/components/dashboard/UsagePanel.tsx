'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart3, ChevronDown, ChevronUp, Sparkles, FileText, BarChart3 as StudyIcon, Youtube, ArrowRight, Crown, ShieldCheck } from 'lucide-react'
import { useLimits, type LimitsData } from './UsageCounter'
import CalendarHeatmap, { type CalendarDay } from './CalendarHeatmap'

interface CalendarData {
  periodStart: string
  periodEnd: string
  days: CalendarDay[]
  totalCount: number
}

const ACTION_META: Record<keyof LimitsData['actions'], {
  label: string
  shortLabel: string
  icon: any
  color: string
}> = {
  ai_analysis: { label: 'AI 분석 6종', shortLabel: 'AI', icon: Sparkles, color: 'purple' },
  manual_sermon: { label: '새 설교 등록', shortLabel: '설교', icon: FileText, color: 'cyan' },
  project: { label: '말씀 연구실', shortLabel: '연구실', icon: StudyIcon, color: 'amber' },
  youtube: { label: '유튜브 연구소', shortLabel: '유튜브', icon: Youtube, color: 'rose' },
}

const COLOR_CLASSES: Record<string, { bar: string; text: string; ring: string; dot: string }> = {
  purple: { bar: 'bg-purple-500', text: 'text-purple-300', ring: 'ring-purple-500/30', dot: 'bg-purple-400' },
  cyan: { bar: 'bg-cyan-500', text: 'text-cyan-300', ring: 'ring-cyan-500/30', dot: 'bg-cyan-400' },
  amber: { bar: 'bg-amber-500', text: 'text-amber-300', ring: 'ring-amber-500/30', dot: 'bg-amber-400' },
  rose: { bar: 'bg-rose-500', text: 'text-rose-300', ring: 'ring-rose-500/30', dot: 'bg-rose-400' },
}

function getColorKey(pct: number, isUnlimited: boolean, isZero: boolean): string {
  if (isUnlimited) return 'indigo'
  if (isZero) return 'amber'
  if (pct >= 100) return 'rose-strong'
  if (pct >= 80) return 'amber-strong'
  if (pct >= 50) return 'cyan'
  return 'indigo'
}

function shouldPulse(action: LimitsData['actions'][keyof LimitsData['actions']]): boolean {
  if (action.limit === -1 || action.limit === 0) return false
  return action.current / action.limit >= 0.8
}

interface UsagePanelProps {
  hideTitle?: boolean
}

export default function UsagePanel({ hideTitle = false }: UsagePanelProps) {
  const router = useRouter()
  const { limits, loading: limitsLoading, refresh: refreshLimits } = useLimits()
  const [expanded, setExpanded] = useState(false)
  const [calendar, setCalendar] = useState<CalendarData | null>(null)
  const [calendarLoading, setCalendarLoading] = useState(false)
  const fetchedRef = useRef(false)

  // 확장 시에만 캘린더 데이터 lazy fetch
  useEffect(() => {
    if (expanded && !fetchedRef.current && !calendar) {
      fetchedRef.current = true
      setCalendarLoading(true)
      fetch('/api/usage/calendar?days=30', { cache: 'no-store' })
        .then(r => r.json())
        .then(d => {
          if (d.error) return
          setCalendar(d)
        })
        .catch(() => {
          fetchedRef.current = false
        })
        .finally(() => setCalendarLoading(false))
    }
  }, [expanded, calendar])

  if (limitsLoading || !limits) {
    return (
      <div className="px-3 py-3 border-b border-white/10">
        <div className="animate-pulse space-y-1.5">
          <div className="h-3 bg-white/5 rounded w-3/4" />
          <div className="h-2 bg-white/5 rounded" />
        </div>
      </div>
    )
  }

  // 4개 액션의 (current, limit) 계산
  const actionEntries = (Object.keys(ACTION_META) as Array<keyof LimitsData['actions']>).map(key => {
    const a = limits.actions[key]
    const meta = ACTION_META[key]
    const colorKey = meta.color
    const isUnlimited = a.limit === -1
    const isZero = a.limit === 0
    const pct = !isUnlimited && a.limit > 0 ? Math.min(100, (a.current / a.limit) * 100) : 0
    const isFull = !isUnlimited && !isZero && a.current >= a.limit
    const isAlmost = !isUnlimited && !isZero && a.current / a.limit >= 0.8
    return { key, action: a, meta, colorKey, isUnlimited, isZero, pct, isFull, isAlmost }
  })

  // 누적 합계
  const totalCurrent = actionEntries.reduce((s, a) => s + (a.isUnlimited ? 0 : a.action.current), 0)
  const totalLimit = actionEntries.reduce((s, a) => s + (a.isUnlimited ? 0 : a.action.limit), 0)
  const totalPct = totalLimit > 0 ? Math.min(100, (totalCurrent / totalLimit) * 100) : 0
  const hasPulsing = actionEntries.some(a => a.isAlmost || a.isFull)
  const hasFull = actionEntries.some(a => a.isFull)

  // 한도 0 = 사역 동참자 전용 (project, youtube)
  const hasSupporterOnly = actionEntries.some(a => a.isZero)

  // 유예 기간
  if (limits.inGracePeriod) {
    return (
      <div className="px-3 py-3 border-b border-white/10">
        <div className="flex items-center gap-1.5 text-[11px] text-blue-300 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          유예 기간 · 기존 정책
        </div>
        <p className="text-[10px] text-blue-300/70 mt-1">30일 후 새 한도 시스템 적용</p>
      </div>
    )
  }

  // 관리자 (limit === -1)
  if (limits.tier === 'supporter' && totalLimit === 0) {
    return (
      <div className="px-3 py-3 border-b border-white/10">
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-semibold">
          <Crown className="w-3.5 h-3.5" />
          무제한
        </div>
        <p className="text-[10px] text-emerald-300/70 mt-1">관리자 / 무제한 등급</p>
      </div>
    )
  }

  // 누적 진행 바 색상
  const totalColor = totalPct >= 100 ? 'bg-rose-500' : totalPct >= 80 ? 'bg-amber-500' : limits.tier === 'supporter' ? 'bg-amber-500' : 'bg-indigo-500'
  const hasFullClass = hasFull ? 'animate-pulse-soft' : ''

  return (
    <div className="px-3 py-3 border-b border-white/10">
      {/* 헤더 (클릭 토글) */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left"
      >
        {!hideTitle && (
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              이번 30일 사용량
            </p>
            <div className="flex items-center gap-1.5">
              {hasPulsing && (
                <span className="text-[9px] font-bold text-amber-300 uppercase tracking-wider">
                  {hasFull ? '🔴 한도 도달' : '⚠️ 임박'}
                </span>
              )}
              {expanded ? (
                <ChevronUp className="w-3 h-3 text-slate-500" />
              ) : (
                <ChevronDown className="w-3 h-3 text-slate-500" />
              )}
            </div>
          </div>
        )}

        {/* 누적 요약 */}
        <div className="flex items-baseline justify-between mb-1.5">
          <p className={`text-[15px] font-extrabold tabular-nums ${hasFull ? 'text-rose-300' : 'text-white'}`}>
            {totalCurrent}
            <span className="text-slate-500 mx-1 text-[12px] font-medium">/</span>
            <span className="text-slate-400 text-[13px]">{totalLimit}</span>
          </p>
          <p className="text-[10px] text-slate-500 tabular-nums">
            D-{limits.daysUntilReset}
          </p>
        </div>

        {/* 누적 진행 바 */}
        <div className={`h-1.5 rounded-full bg-white/5 overflow-hidden ${hasFullClass}`}>
          <div
            className={`h-full rounded-full ${totalColor} transition-all duration-500`}
            style={{ width: `${totalPct}%` }}
          />
        </div>

        {/* 미니 4 액션 표시 (축소 상태) */}
        {!expanded && (
          <div className="flex items-center justify-between mt-2 px-0.5 text-[10px]">
            {actionEntries.map(({ key, action, meta, colorKey, isUnlimited, isZero, isFull, isAlmost }) => {
              const colors = COLOR_CLASSES[colorKey] || COLOR_CLASSES.purple
              const isPulsing = isAlmost || isFull
              return (
                <div key={key} className="flex flex-col items-center gap-0.5 flex-1">
                  <div className="flex items-center gap-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} ${isPulsing ? 'animate-pulse-soft' : ''}`} />
                    <span className={`tabular-nums font-bold ${isFull ? 'text-rose-300' : isAlmost ? 'text-amber-300' : isZero ? 'text-amber-300' : 'text-slate-300'}`}>
                      {isUnlimited ? '∞' : isZero ? <Crown className="w-2.5 h-2.5 inline" /> : action.current}
                    </span>
                  </div>
                  <span className={`text-[8.5px] leading-none ${isZero ? 'text-amber-300/80' : 'text-slate-500'}`}>
                    {isZero ? '사역전용' : meta.shortLabel}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </button>

      {/* 확장 상태 */}
      {expanded && (
        <div className="mt-3 space-y-2 animate-fade-in">
          {/* 4개 액션 상세 */}
          {actionEntries.map(({ key, action, meta, colorKey, isUnlimited, isZero, pct, isFull, isAlmost }) => {
            const colors = COLOR_CLASSES[colorKey] || COLOR_CLASSES.purple
            const isPulsing = isAlmost || isFull
            const Icon = meta.icon

            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="flex items-center gap-1 font-semibold text-slate-300">
                    <Icon className={`w-3 h-3 ${colors.text}`} />
                    {meta.label}
                  </span>
                  <span className={`tabular-nums font-bold ${isFull ? 'text-rose-300' : isAlmost ? 'text-amber-300' : isUnlimited ? 'text-blue-300' : isZero ? 'text-amber-400' : 'text-white'}`}>
                    {isUnlimited ? '무제한' : isZero ? '사역 전용' : `${action.current} / ${action.limit}`}
                  </span>
                </div>
                {!isUnlimited && !isZero && (
                  <div className={`h-1 rounded-full bg-white/5 overflow-hidden ${isPulsing ? 'animate-pulse-soft' : ''}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFull ? 'bg-gradient-to-r from-rose-500 to-rose-400' :
                        isAlmost ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                        colors.bar
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
                {isZero && (
                  <p className="text-[9px] text-amber-400/80 leading-tight">
                    📖 본문 주해 · 구조 분석 · 원고 작성
                  </p>
                )}
              </div>
            )
          })}

          {/* 30일 히트맵 */}
          <div className="pt-2 mt-2 border-t border-white/5">
            <CalendarHeatmap
              days={calendar?.days || []}
              periodStart={calendar?.periodStart || ''}
              periodEnd={calendar?.periodEnd || ''}
              loading={calendarLoading}
            />
          </div>

          {/* mypage로 이동 */}
          <button
            onClick={() => router.push('/mypage')}
            className="w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] font-bold text-slate-300 hover:text-white transition-colors group"
          >
            상세 보기 (mypage)
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      )}
    </div>
  )
}
