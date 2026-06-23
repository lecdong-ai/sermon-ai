'use client'

import { useEffect, useState, useCallback } from 'react'
import { Eye, Activity, Smartphone, Monitor, Tablet, TrendingUp, Calendar, Globe, Loader2, RefreshCw, Radio } from 'lucide-react'

interface HourlyBucket { hour: number; visits: number; unique: number }
interface DailyBucket { date: string; visits: number; unique: number }
interface DeviceData {
  counts: { mobile: number; desktop: number; tablet: number }
  ratio: { mobile: number; desktop: number; tablet: number }
  total: number
}
interface TopPath { path: string; count: number }
interface VisitorData {
  liveCount: number
  hourly: HourlyBucket[]
  daily: DailyBucket[]
  device: DeviceData
  topPaths: TopPath[]
  today: number
  yesterday: number
  weekAvg: number
}

const DEVICE_ICONS: Record<string, any> = { mobile: Smartphone, desktop: Monitor, tablet: Tablet }
const DEVICE_LABELS: Record<string, string> = { mobile: '모바일', desktop: '데스크톱', tablet: '태블릿' }
const DEVICE_COLORS: Record<string, string> = {
  mobile: 'from-indigo-500/30 to-indigo-500/10 border-indigo-500/30 text-indigo-300',
  desktop: 'from-cyan-500/30 to-cyan-500/10 border-cyan-500/30 text-cyan-300',
  tablet: 'from-amber-500/30 to-amber-500/10 border-amber-500/30 text-amber-300',
}

function shortPath(p: string, max = 28): string {
  if (p.length <= max) return p
  return p.slice(0, max - 1) + '…'
}

export default function VisitorCounter() {
  const [data, setData] = useState<VisitorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/visitors')
      const json = await res.json()
      if (!json.success) throw new Error(json.error || '조회 실패')
      setData(json.data)
      setError(null)
      setLastUpdated(new Date())
    } catch (e: any) {
      setError(e.message || '방문자 데이터를 불러올 수 없습니다')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 30000) // 30초마다 자동 새로고침
    return () => clearInterval(id)
  }, [load])

  if (loading && !data) {
    return (
      <div className="bg-gradient-to-br from-[#0a0e1a] to-[#0c1020] border border-white/10 rounded-2xl p-8 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="bg-[#0a0e1a] border border-rose-500/20 rounded-2xl p-4 text-[12px] text-rose-300">
        {error}
      </div>
    )
  }

  if (!data) return null

  const todayDelta = data.yesterday > 0
    ? Math.round(((data.today - data.yesterday) / data.yesterday) * 100)
    : (data.today > 0 ? 100 : 0)
  const maxHourly = Math.max(...data.hourly.map(h => h.visits), 1)
  const peakHour = data.hourly.reduce((max, h) => h.visits > max.visits ? h : max, data.hourly[0])
  const currentHour = new Date().getHours()

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#0a0e1a] via-[#0c1020] to-[#0a0e1a] border border-white/10 rounded-2xl p-5">
      {/* 배경 글로우 */}
      <div className="pointer-events-none absolute -top-20 -right-20 w-60 h-60 bg-indigo-500/10 blur-3xl rounded-full" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 w-60 h-60 bg-rose-500/5 blur-3xl rounded-full" />

      {/* 헤더 */}
      <div className="relative flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/30 to-rose-500/20 border border-white/10 flex items-center justify-center">
            <Activity className="w-4 h-4 text-indigo-300" />
          </div>
          <div>
            <h2 className="text-[14px] font-bold text-white flex items-center gap-1.5">
              방문자 분석
              <span className="flex items-center gap-1 text-[9px] font-semibold text-rose-300 bg-rose-500/15 border border-rose-500/30 px-1.5 py-0.5 rounded-full">
                <span className="relative flex w-1.5 h-1.5">
                  <span className="absolute inset-0 rounded-full bg-rose-400 animate-ping opacity-75" />
                  <span className="relative rounded-full bg-rose-400 w-1.5 h-1.5" />
                </span>
                LIVE
              </span>
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5">실시간 트래픽 모니터링 · 30초 자동 갱신</p>
          </div>
        </div>
        <button
          onClick={load}
          className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
          title="수동 새로고침"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 메인 그리드: 라이브 + 비교 */}
      <div className="relative grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {/* 라이브 카운터 */}
        <div className="col-span-2 relative overflow-hidden rounded-xl border border-rose-500/30 bg-gradient-to-br from-rose-500/15 via-rose-500/5 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-rose-300 uppercase tracking-widest font-bold flex items-center gap-1.5">
                <Radio className="w-3 h-3" />
                지금 접속 중
              </p>
              <p className="text-[40px] font-extrabold text-white leading-none mt-2 tracking-tight">
                {data.liveCount}
                <span className="text-[14px] font-medium text-slate-400 ml-1.5">명</span>
              </p>
              <p className="text-[10px] text-slate-500 mt-1.5">최근 5분 내 활동 세션</p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-rose-500/30 blur-xl animate-pulse" />
              <div className="relative w-14 h-14 rounded-full border-2 border-rose-500/40 flex items-center justify-center">
                <span className="relative flex w-3 h-3">
                  <span className="absolute inset-0 rounded-full bg-rose-400 animate-ping opacity-75" />
                  <span className="relative rounded-full bg-rose-400 w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 오늘 */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            오늘
          </p>
          <p className="text-[28px] font-extrabold text-white leading-none mt-2 tracking-tight">
            {data.today}
          </p>
          <p className={`text-[10px] mt-1.5 font-semibold ${todayDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {todayDelta >= 0 ? '▲' : '▼'} {Math.abs(todayDelta)}% vs 어제
          </p>
        </div>

        {/* 주 평균 */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3" />
            주 평균
          </p>
          <p className="text-[28px] font-extrabold text-white leading-none mt-2 tracking-tight">
            {data.weekAvg}
          </p>
          <p className="text-[10px] text-slate-500 mt-1.5">일일 방문 (7일 평균)</p>
        </div>
      </div>

      {/* 24시간 히트맵 */}
      <div className="relative rounded-xl border border-white/10 bg-white/[0.02] p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
            <Activity className="w-3 h-3" />
            24시간 트래픽
          </p>
          <p className="text-[10px] text-slate-500">
            피크: <span className="text-amber-300 font-bold">{peakHour.hour}시</span> ({peakHour.visits}회)
          </p>
        </div>
        <div className="flex items-end gap-[2px] h-16">
          {data.hourly.map((h, i) => {
            const heightPct = (h.visits / maxHourly) * 100
            const isCurrent = i === currentHour
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="w-full h-full flex items-end">
                  <div
                    className={`w-full rounded-t transition-all duration-300 ${
                      isCurrent
                        ? 'bg-gradient-to-t from-rose-500 to-rose-400 shadow-lg shadow-rose-500/30'
                        : h.visits > 0
                        ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:from-indigo-500 group-hover:to-indigo-300'
                        : 'bg-white/5'
                    }`}
                    style={{ height: h.visits > 0 ? `${Math.max(heightPct, 8)}%` : '4%' }}
                  />
                </div>
                {i % 6 === 0 && (
                  <span className="text-[8px] text-slate-500 absolute -bottom-3">{i}시</span>
                )}
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-between mt-2 text-[9px] text-slate-500">
          <span>00시</span>
          <span>06시</span>
          <span>12시</span>
          <span>18시</span>
          <span>23시</span>
        </div>
      </div>

      {/* 디바이스 + 인기 페이지 */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* 디바이스 분포 */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 mb-3">
            <Smartphone className="w-3 h-3" />
            디바이스 (24시간)
          </p>
          {data.device.total === 0 ? (
            <p className="text-[11px] text-slate-500 text-center py-4">데이터 없음</p>
          ) : (
            <div className="space-y-2.5">
              {(['mobile', 'desktop', 'tablet'] as const).map((d) => {
                const Icon = DEVICE_ICONS[d]
                const count = data.device.counts[d]
                const ratio = data.device.ratio[d]
                return (
                  <div key={d} className={`flex items-center gap-2 p-2 rounded-lg border bg-gradient-to-r ${DEVICE_COLORS[d]}`}>
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold">{DEVICE_LABELS[d]}</span>
                        <span className="text-[11px] font-bold">{count}회 ({Math.round(ratio * 100)}%)</span>
                      </div>
                      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-current opacity-60"
                          style={{ width: `${ratio * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 인기 페이지 */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 mb-3">
            <Globe className="w-3 h-3" />
            인기 페이지 TOP 5
          </p>
          {data.topPaths.length === 0 ? (
            <p className="text-[11px] text-slate-500 text-center py-4">데이터 없음</p>
          ) : (
            <div className="space-y-1.5">
              {data.topPaths.map((p, i) => {
                const max = data.topPaths[0]?.count || 1
                return (
                  <div key={p.path} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-white/5 transition-colors">
                    <span className="w-5 h-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[11px] text-slate-200 font-medium truncate">{shortPath(p.path)}</span>
                        <span className="text-[10px] text-slate-500 font-bold shrink-0 ml-2">{p.count}</span>
                      </div>
                      <div className="h-0.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                          style={{ width: `${(p.count / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 푸터: 업데이트 시간 */}
      <div className="relative mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <Eye className="w-3 h-3" />
          누적 24시간 {data.hourly.reduce((s, h) => s + h.visits, 0).toLocaleString()}회 방문
        </span>
        <span>
          마지막 업데이트: {lastUpdated.toLocaleTimeString('ko-KR')}
        </span>
      </div>
    </div>
  )
}
