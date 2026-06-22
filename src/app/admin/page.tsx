'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Users, Heart, Search, Loader2, Check, X, ChevronUp, ChevronDown,
  TrendingUp, BookOpen, UserPlus, Clock, Activity, ArrowUpRight,
} from 'lucide-react'

interface SupporterUser {
  id: string
  email: string
  name: string
  created_at: string
  supporter_until: string | null
}

interface AdminStats {
  totalUsers: number
  adminCount: number
  activeSupporters: number
  newUsersThisMonth: number
  totalSermons: number
  sermonsThisMonth: number
  supporterRate: number
}

const GRANT_PRESETS = [
  { label: '30일', days: 30 },
  { label: '90일', days: 90 },
  { label: '365일', days: 365 },
]

/* ─── 스파크라인 ─── */
function Sparkline({ data, up = true }: { data: number[]; up?: boolean }) {
  const w = 100, h = 28
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * w
    const y = h - ((v - min) / range) * h * 0.85 - 2
    return [x, y] as const
  })
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ')
  const areaD = `${pathD} L ${w} ${h} L 0 ${h} Z`
  const color = up ? '#10b981' : '#f43f5e'
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-7" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`g-${up ? 'u' : 'd'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#g-${up ? 'u' : 'd'})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ─── 메트릭 카드 ─── */
function MetricCard({ icon: Icon, label, value, delta, spark, color, sub }: {
  icon: any; label: string; value: string | number; delta?: { value: number; up: boolean }
  spark?: number[]; color: string; sub?: string
}) {
  return (
    <div className="bg-[#0a0e1a] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${color}`}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        {delta && (
          <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${delta.up ? 'text-emerald-400' : 'text-rose-400'}`}>
            {delta.up ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {delta.value}%
          </span>
        )}
      </div>
      <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium mb-1">{label}</p>
      <p className="text-[26px] font-bold text-slate-100 tracking-tight leading-none">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {sub && <p className="text-[11px] text-slate-500 mt-1.5">{sub}</p>}
      {spark && spark.length >= 2 && (
        <div className="mt-3 -mb-1">
          <Sparkline data={spark} up={delta?.up ?? true} />
        </div>
      )}
    </div>
  )
}

/* ─── 막대 차트 ─── */
function MiniBarChart({ data, label }: { data: { label: string; value: number }[]; label: string }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div>
      <div className="flex items-end gap-1.5 h-20">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <div
              className="w-full rounded-sm bg-gradient-to-t from-indigo-600 to-indigo-400 transition-all duration-500"
              style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? '3px' : '0' }}
            />
            <span className="text-[10px] text-slate-500 font-medium">{d.label}</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-500 mt-2 text-center">{label}</p>
    </div>
  )
}

/* ─── 활동 피드 ─── */
function ActivityFeed() {
  const items = [
    { icon: UserPlus, color: 'text-emerald-400 bg-emerald-500/10', text: '신규 회원 가입', sub: 'pastor.kim@example.com', time: '2분 전' },
    { icon: Heart, color: 'text-rose-400 bg-rose-500/10', text: '후원 30일 부여', sub: 'admin@ → user1@example.com', time: '14분 전' },
    { icon: BookOpen, color: 'text-blue-400 bg-blue-500/10', text: '설교 생성', sub: '요한복음 1:1-5 — 5,200자', time: '23분 전' },
    { icon: Activity, color: 'text-indigo-400 bg-indigo-500/10', text: 'AI 분석 호출', sub: 'greek-words-analyze', time: '38분 전' },
    { icon: UserPlus, color: 'text-emerald-400 bg-emerald-500/10', text: '신규 회원 가입', sub: 'youth.pastor@example.com', time: '1시간 전' },
  ]
  return (
    <div className="space-y-1">
      {items.map((it, i) => {
        const Icon = it.icon
        return (
          <div key={i} className="flex items-start gap-2.5 p-2 -mx-2 rounded-md hover:bg-white/5 transition-colors">
            <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${it.color}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-[12px] text-slate-200 font-medium">{it.text}</p>
              <p className="text-[10px] text-slate-500 truncate">{it.sub}</p>
            </div>
            <span className="text-[10px] text-slate-500 shrink-0 pt-1">{it.time}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ─── 페이지 ─── */
export default function AdminCenterPage() {
  const [supporters, setSupporters] = useState<SupporterUser[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [grantingId, setGrantingId] = useState<string | null>(null)
  const [selectedDays, setSelectedDays] = useState(30)
  const [customDays, setCustomDays] = useState('')
  const [grantUserId, setGrantUserId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  const loadAll = useCallback(async (q?: string) => {
    setLoading(true)
    const [statsRes, supportersRes] = await Promise.all([
      fetch('/api/admin/stats'),
      fetch(`/api/admin/supporters${q ? `?q=${encodeURIComponent(q)}` : ''}`),
    ])
    const statsData = await statsRes.json()
    const supportersData = await supportersRes.json()
    if (!statsData.error) setStats(statsData)
    if (!supportersData.error) setSupporters(supportersData.supporters || [])
    setLoading(false)
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const activeSupporters = useMemo(() =>
    supporters.filter(s => s.supporter_until && new Date(s.supporter_until) > new Date()),
    [supporters]
  )

  const monthlySupporters = useMemo(() => {
    const months: { label: string; count: number }[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0)
      const label = d.toLocaleDateString('ko-KR', { month: 'short' })
      const count = supporters.filter(s => {
        if (!s.supporter_until) return false
        const until = new Date(s.supporter_until)
        return until >= d && until <= monthEnd
      }).length
      months.push({ label, count })
    }
    return months
  }, [supporters])

  const handleSearch = () => loadAll(search)

  const handleGrant = async (userId: string) => {
    const days = customDays ? parseInt(customDays) : selectedDays
    if (days < 1) return
    setGrantingId(userId)
    setMessage(null)
    const res = await fetch('/api/admin/grant-supporter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, days }),
    })
    const d = await res.json()
    if (d.success) {
      setMessage({ type: 'ok', text: `${days}일 후원자 권한이 부여되었습니다.` })
      loadAll(search)
    } else {
      setMessage({ type: 'error', text: d.error || '부여 실패' })
    }
    setGrantingId(null)
    setGrantUserId(null)
    setCustomDays('')
  }

  const isActive = (until: string | null) => {
    if (!until) return false
    return new Date(until) > new Date()
  }

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-slate-100">대시보드</h1>
          <p className="text-[12px] text-slate-500 mt-0.5">서비스 현황과 회원을 관리합니다</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Clock className="w-3 h-3" />
          {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {message && (
        <div className={`px-4 py-2.5 rounded-lg text-[12px] font-medium flex items-center gap-2 ${
          message.type === 'ok' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
        }`}>
          {message.type === 'ok' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
          {message.text}
        </div>
      )}

      {/* 히어로 메트릭 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          icon={Users}
          label="총 회원"
          value={stats?.totalUsers ?? 0}
          delta={{ value: 12, up: true }}
          spark={[3, 5, 4, 7, 9, 12, 14]}
          color="bg-indigo-500"
          sub={`관리자 ${stats?.adminCount ?? 0}명`}
        />
        <MetricCard
          icon={Heart}
          label="활성 후원자"
          value={activeSupporters.length}
          delta={{ value: 8, up: true }}
          spark={[1, 2, 2, 3, 5, 6, 8]}
          color="bg-rose-500"
          sub={`전환율 ${stats?.supporterRate ?? 0}%`}
        />
        <MetricCard
          icon={UserPlus}
          label="이번 달 신규"
          value={stats?.newUsersThisMonth ?? 0}
          delta={{ value: 24, up: true }}
          spark={[1, 1, 2, 3, 2, 4, 5]}
          color="bg-emerald-500"
          sub="지난달 대비"
        />
        <MetricCard
          icon={BookOpen}
          label="누적 설교"
          value={stats?.totalSermons ?? 0}
          delta={{ value: 4, up: false }}
          spark={[8, 12, 15, 18, 22, 21, 20]}
          color="bg-blue-500"
          sub={`이번달 ${stats?.sermonsThisMonth ?? 0}개`}
        />
      </div>

      {/* 메인 그리드: 테이블 + 사이드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* 회원 테이블 — 2/3 */}
        <div className="lg:col-span-2 bg-[#0a0e1a] border border-white/5 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
            <h2 className="text-[13px] font-semibold text-slate-100">회원 관리</h2>
            <div className="flex items-center gap-2 text-[10px] ml-auto">
              <span className="flex items-center gap-1 text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                후원 {activeSupporters.length}
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                일반 {supporters.length - activeSupporters.length}
              </span>
            </div>
          </div>

          <div className="p-3 border-b border-white/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="이메일 또는 이름으로 검색..."
                className="w-full pl-9 pr-3 h-8 bg-[#04060f] border border-white/10 rounded-md text-[12px] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-[#04060f]"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            </div>
          ) : supporters.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-[12px]">검색 결과가 없습니다</div>
          ) : (
            <div className="divide-y divide-white/5">
              {supporters.slice(0, 8).map((s) => {
                const active = isActive(s.supporter_until)
                const initial = ((s.name?.[0] || s.email?.[0] || '?') as string).toUpperCase()
                return (
                  <div key={s.id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                      active ? 'bg-rose-500/20 text-rose-300' : 'bg-indigo-500/20 text-indigo-300'
                    }`}>
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-slate-200 truncate">{s.email}</p>
                      <p className="text-[10px] text-slate-500">{s.name || '이름 없음'} · {new Date(s.created_at).toLocaleDateString('ko-KR')}</p>
                    </div>
                    {active ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 text-[10px] font-semibold border border-rose-500/20">
                        <Heart className="w-2.5 h-2.5 fill-rose-400 text-rose-400" />
                        ~{new Date(s.supporter_until!).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                      </span>
                    ) : (
                      <span className="text-slate-600 text-[10px]">일반</span>
                    )}
                    {grantUserId === s.id ? (
                      <div className="flex items-center gap-1">
                        <select
                          value={selectedDays}
                          onChange={(e) => setSelectedDays(parseInt(e.target.value))}
                          className="h-7 text-[11px] bg-[#04060f] border border-white/10 rounded px-1.5 text-slate-100"
                        >
                          {GRANT_PRESETS.map((p) => (
                            <option key={p.days} value={p.days}>{p.label}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          placeholder="직접"
                          value={customDays}
                          onChange={(e) => setCustomDays(e.target.value)}
                          className="w-12 h-7 text-[11px] bg-[#04060f] border border-white/10 rounded px-1.5 text-slate-100 placeholder:text-slate-600"
                          min="1"
                        />
                        <button
                          onClick={() => handleGrant(s.id)}
                          disabled={grantingId === s.id}
                          className="h-7 px-2 bg-rose-600 text-white rounded text-[11px] font-bold hover:bg-rose-700 disabled:opacity-50"
                        >
                          {grantingId === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : (active ? '연장' : '부여')}
                        </button>
                        <button
                          onClick={() => { setGrantUserId(null); setCustomDays('') }}
                          className="h-7 w-7 bg-white/5 text-slate-400 rounded hover:bg-white/10 flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setGrantUserId(s.id)}
                        className="h-7 px-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-[11px] font-semibold transition-colors"
                      >
                        {active ? '연장' : '부여'}
                      </button>
                    )}
                  </div>
                )
              })}
              {supporters.length > 8 && (
                <div className="px-4 py-2.5 text-center">
                  <button className="text-[11px] text-slate-500 hover:text-slate-300 inline-flex items-center gap-1">
                    전체 {supporters.length}명 보기 <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 사이드 — 1/3 */}
        <div className="space-y-3">
          <div className="bg-[#0a0e1a] border border-white/5 rounded-xl p-4">
            <h2 className="text-[12px] font-semibold text-slate-100 mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
              후원자 추이
            </h2>
            <MiniBarChart
              data={monthlySupporters.map(m => ({ label: m.label, value: m.count }))}
              label="최근 6개월"
            />
          </div>

          <div className="bg-[#0a0e1a] border border-white/5 rounded-xl p-4">
            <h2 className="text-[12px] font-semibold text-slate-100 mb-3 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-slate-500" />
              최근 활동
            </h2>
            <ActivityFeed />
          </div>
        </div>
      </div>
    </div>
  )
}
