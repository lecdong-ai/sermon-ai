'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard, FileText, Users, Calendar, Plus, Download,
  ShieldAlert, Activity, CheckCircle, XCircle, AlertTriangle,
  Info, ExternalLink, RefreshCw, Loader2, UserPlus,
  ClipboardList, Settings, BarChart3, PieChart as PieChartIcon,
  Search, TrendingUp, TrendingDown, Minus, Clock, Sparkles, Bell,
  ArrowRight,
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart,
} from 'recharts'

interface DashboardData {
  insight: string
  metrics: {
    totalUsers: number; newUsersThisWeek: number; userGrowth: number
    totalEvents: number; openEvents: number
    totalApplications: number; appsThisWeek: number; appGrowth: number
    confirmedApplications: number
    checkedIn: number; checkedInToday: number; checkinRate: number
    pptTemplates: number
  }
  eventsByStatus: { draft: number; open: number; closed: number; cancelled: number }
  dailyApplications: { date: string; count: number }[]
  upcomingEvents: {
    id: string; title: string; start_date: string; end_date: string; status: string; capacity: number; applicationCount: number
  }[]
  recentUsers: { id: string; email: string; name: string; created_at: string }[]
  alerts: { type: 'warning' | 'danger' | 'info' | 'success'; message: string; link?: string }[]
}

interface SearchResults {
  users: { id: string; name: string; email: string; church_name?: string; created_at: string }[]
  events: { id: string; title: string; status: string; start_date: string; created_at: string }[]
  applications: { id: string; student_name: string; parent_name: string; parent_phone: string; event_id: string; status: string; created_at: string }[]
}

const STATUS_LABELS: Record<string, string> = { draft: '준비중', open: '모집중', closed: '마감', cancelled: '취소' }
const PIE_COLORS = ['#64748B', '#2EC4B6', '#6366F1', '#EF4444']
const STATUS_COLORS: Record<string, string> = { draft: '#64748B', open: '#2EC4B6', closed: '#6366F1', cancelled: '#EF4444' }
const SEARCH_DEBOUNCE = 300

function fmt(d: string) {
  return new Date(d).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  return `${Math.floor(h / 24)}일 전`
}

function Trend({ value, label }: { value: number; label?: string }) {
  if (value === 0) return <span className="text-[11px] text-navy-500 flex items-center gap-0.5"><Minus className="w-3 h-3" />{label || '변동 없음'}</span>
  const up = value > 0
  return (
    <span className={`text-[11px] flex items-center gap-0.5 font-medium ${up ? 'text-emerald-400' : 'text-red-400'}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up ? '+' : ''}{value}% {label || ''}
    </span>
  )
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [admin, setAdmin] = useState<boolean | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null)
  const [searching, setSearching] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/admin/stats')
      if (res.status === 401) { setAdmin(false); setLoading(false); return }
      setAdmin(true)
      if (res.ok) { setData(await res.json()); setLastUpdated(new Date().toLocaleTimeString()) }
    } catch { setError('데이터를 불러오는 중 오류가 발생했습니다.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (!searchOpen || !searchQuery.trim()) { setSearchResults(null); return }
    const t = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`)
        if (res.ok) setSearchResults(await res.json())
      } catch {} finally { setSearching(false) }
    }, SEARCH_DEBOUNCE)
    return () => clearTimeout(t)
  }, [searchQuery, searchOpen])

  if (admin === false) return (
    <div className="min-h-screen bg-[#0b111e] flex items-center justify-center p-4">
      <div className="bg-[#141b2d] rounded-3xl p-8 max-w-sm w-full text-center border border-white/[0.06] space-y-5">
        <div className="w-14 h-14 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-100">접근 권한 없음</h2>
        <p className="text-xs text-slate-400">교회학교 최고 관리자(lecdong@gmail.com)만 접근할 수 있습니다.</p>
        <Link href="/" className="inline-block px-5 py-2.5 rounded-xl bg-white/[0.06] text-slate-300 text-sm font-semibold hover:bg-white/[0.1] transition-colors">메인 홈으로 이동</Link>
      </div>
    </div>
  )

  if (loading) return (
    <div className="min-h-screen bg-[#0b111e] flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">대시보드 로딩 중...</span></div>
    </div>
  )

  if (error || !data) return (
    <div className="min-h-screen bg-[#0b111e] flex items-center justify-center p-4">
      <div className="bg-[#141b2d] rounded-3xl p-8 max-w-sm text-center border border-white/[0.06] space-y-4">
        <XCircle className="w-10 h-10 text-red-400 mx-auto" />
        <p className="text-sm text-slate-400">{error || '데이터를 불러올 수 없습니다.'}</p>
        <button onClick={fetchData} className="px-4 py-2 rounded-xl bg-white/[0.06] text-slate-300 text-sm font-semibold hover:bg-white/[0.1] transition-colors">다시 시도</button>
      </div>
    </div>
  )

  const { insight, metrics, eventsByStatus, dailyApplications, upcomingEvents, recentUsers, alerts } = data
  const hasData = metrics.totalEvents > 0 || metrics.totalUsers > 0 || metrics.totalApplications > 0
  const hasUpcoming = upcomingEvents.length > 0

  return (
    <div className="min-h-screen bg-[#0b111e]">
      <div className="max-w-[1400px] mx-auto p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-mint-400 to-mint-600 flex items-center justify-center shadow-lg shadow-mint-500/20">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-100">오퍼레이션 센터</h1>
                <p className="text-[11px] text-slate-500">최고 관리자 · lecdong@gmail.com</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setSearchOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-slate-400 text-sm hover:bg-white/[0.08] hover:text-slate-300 transition-all">
              <Search className="w-4 h-4" />통합 검색
            </button>
            <button onClick={fetchData} className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:bg-white/[0.08] hover:text-slate-300 transition-all" title="새로고침">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* AI Insight */}
        <div className="bg-gradient-to-r from-[#141b2d] to-[#1a2340] rounded-2xl p-5 border border-white/[0.06] flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-mint-500/10 text-mint-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-mint-400 mb-1">AI 인사이트</p>
            <p className="text-sm text-slate-300 leading-relaxed">{insight}</p>
          </div>
          <div className="text-[10px] text-slate-600 shrink-0 flex items-center gap-1"><Clock className="w-3 h-3" />{lastUpdated}</div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((a, i) => (
              <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${
                a.type === 'danger' ? 'bg-red-500/10 border-red-500/20 text-red-300' :
                a.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' :
                a.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' :
                'bg-blue-500/10 border-blue-500/20 text-blue-300'
              }`}>
                {a.type === 'danger' ? <XCircle className="w-4 h-4 mt-0.5 shrink-0" /> :
                 a.type === 'warning' ? <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> :
                 a.type === 'success' ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" /> :
                 <Info className="w-4 h-4 mt-0.5 shrink-0" />}
                <p className="text-sm flex-1">{a.message}</p>
                {a.link && <Link href={a.link} className="shrink-0 p-1 rounded-lg hover:bg-white/5"><ExternalLink className="w-4 h-4" /></Link>}
              </div>
            ))}
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <MetricCard label="총 회원" value={metrics.totalUsers} trend={metrics.userGrowth} icon={<Users className="w-4 h-4" />} color="blue" />
          <MetricCard label="진행 행사" value={metrics.openEvents} sub={`전체 ${metrics.totalEvents}개`} icon={<Calendar className="w-4 h-4" />} color="purple" />
          <MetricCard label="금주 신청" value={metrics.appsThisWeek} trend={metrics.appGrowth} icon={<ClipboardList className="w-4 h-4" />} color="orange" />
          <MetricCard label="금주 체크인" value={metrics.checkedInToday} sub={`전체 ${metrics.checkedIn}명`} icon={<Activity className="w-4 h-4" />} color="mint" />
          <MetricCard label="PPT 템플릿" value={metrics.pptTemplates} icon={<FileText className="w-4 h-4" />} color="indigo" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Donut */}
          <div className="lg:col-span-2 bg-[#141b2d] rounded-2xl p-6 border border-white/[0.06]">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-mint-400" />행사 상태
            </h3>
            {hasData && metrics.totalEvents > 0 ? (
              <div className="flex items-center gap-6">
                <div className="w-36 h-36 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: '준비중', value: eventsByStatus.draft },
                          { name: '모집중', value: eventsByStatus.open },
                          { name: '마감', value: eventsByStatus.closed },
                          { name: '취소', value: eventsByStatus.cancelled },
                        ].filter(d => d.value > 0)}
                        cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value"
                      >
                        {PIE_COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {Object.entries(eventsByStatus).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[k] }} /><span className="text-slate-400">{STATUS_LABELS[k]}</span></div>
                      <span className="font-bold text-slate-200">{v}개</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-600"><PieChartIcon className="w-10 h-10 mx-auto mb-2 opacity-50" /><p className="text-sm">등록된 행사가 없습니다</p></div>
            )}
          </div>

          {/* 30-day Line Chart */}
          <div className="lg:col-span-3 bg-[#141b2d] rounded-2xl p-6 border border-white/[0.06]">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-mint-400" />30일 신청 추이
              {metrics.appGrowth !== 0 && <span className={`text-[11px] font-medium ${metrics.appGrowth > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {metrics.appGrowth > 0 ? '▲' : '▼'} 전주 대비 {Math.abs(metrics.appGrowth)}%
              </span>}
            </h3>
            {dailyApplications.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={dailyApplications}>
                  <defs>
                    <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2EC4B6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#2EC4B6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#475569' }} tickFormatter={v => v.slice(5)} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#475569' }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: '#1a2340', color: '#e2e8f0' }}
                    labelFormatter={v => `${v.slice(0, 4)}년 ${v.slice(5, 7)}월 ${v.slice(8, 10)}일`}
                  />
                  <Area type="monotone" dataKey="count" stroke="#2EC4B6" strokeWidth={2} fill="url(#appGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-10 text-slate-600"><BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" /><p className="text-sm">30일간 신청 데이터가 없습니다</p></div>
            )}
          </div>
        </div>

        {/* Event Timeline */}
        <div className="bg-[#141b2d] rounded-2xl p-6 border border-white/[0.06]">
          <h3 className="text-sm font-bold text-slate-200 mb-5 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-mint-400" />행사 타임라인
            {hasUpcoming && <span className="text-[11px] text-slate-500 font-medium">{upcomingEvents.length}개 예정</span>}
          </h3>
          {hasUpcoming ? (
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-4 min-w-max">
                {upcomingEvents.map((ev, i) => {
                  const fillPct = ev.capacity ? Math.min(Math.round(ev.applicationCount / ev.capacity * 100), 100) : 0
                  const barColor = fillPct >= 80 ? 'bg-emerald-500' : fillPct >= 50 ? 'bg-amber-500' : 'bg-mint-500'
                  return (
                    <Link key={ev.id} href={`/events/manage/${ev.id}`} className="group w-48 shrink-0 bg-[#1a2340] rounded-xl p-4 border border-white/[0.06] hover:border-mint-500/30 hover:-translate-y-0.5 transition-all">
                      <div className="text-[10px] text-slate-500 font-medium mb-2">
                        {ev.start_date ? fmt(ev.start_date) : '날짜 미정'}
                      </div>
                      <p className="text-sm font-bold text-slate-200 truncate group-hover:text-mint-400 transition-colors mb-3">{ev.title}</p>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-slate-400">신청 {ev.applicationCount}{ev.capacity ? `/${ev.capacity}` : ''}</span>
                        <span className={fillPct >= 80 ? 'text-emerald-400' : fillPct >= 50 ? 'text-amber-400' : 'text-slate-400'}>{fillPct}%</span>
                      </div>
                      <div className="w-full bg-white/[0.06] rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full transition-all ${barColor}`} style={{ width: `${fillPct}%` }} />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-600"><Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">예정된 행사가 없습니다</p></div>
          )}
        </div>

        {/* Recent Users + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users */}
          <div className="bg-[#141b2d] rounded-2xl p-6 border border-white/[0.06]">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-mint-400" />최근 가입 회원
            </h3>
            {recentUsers.length > 0 ? (
              <div className="space-y-2">
                {recentUsers.map(u => (
                  <div key={u.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-mint-400 to-mint-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {(u.name || u.email || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate">{u.name || '—'}</p>
                      <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                    </div>
                    <span className="text-[10px] text-slate-600 shrink-0">{timeAgo(u.created_at)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-600"><Users className="w-10 h-10 mx-auto mb-2 opacity-50" /><p className="text-sm">가입한 회원이 없습니다</p></div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="bg-[#141b2d] rounded-2xl p-6 border border-white/[0.06]">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-mint-400" />
              최근 활동
              <span className="text-[11px] text-slate-500 font-medium ml-auto">실시간</span>
            </h3>
            {data.alerts.length > 0 ? (
              <div className="space-y-2 max-h-[320px] overflow-y-auto">
                {data.alerts.slice(0, 8).map((a, i) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      a.type === 'danger' ? 'bg-red-500/10 text-red-400' :
                      a.type === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                      a.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {a.type === 'danger' ? <XCircle className="w-3.5 h-3.5" /> :
                       a.type === 'warning' ? <AlertTriangle className="w-3.5 h-3.5" /> :
                       a.type === 'success' ? <CheckCircle className="w-3.5 h-3.5" /> :
                       <Info className="w-3.5 h-3.5" />}
                    </div>
                    <p className="text-xs text-slate-300 flex-1">{a.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-600"><Activity className="w-10 h-10 mx-auto mb-2 opacity-50" /><p className="text-sm">최근 활동이 없습니다</p></div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ActionCard href="/events/manage/new" icon={<Plus className="w-5 h-5" />} bg="bg-mint-500/10 text-mint-400" label="새 행사" sub="행사 개설하기" />
          <ActionCard href="/admin/templates" icon={<FileText className="w-5 h-5" />} bg="bg-purple-500/10 text-purple-400" label="PPT 템플릿" sub={`${metrics.pptTemplates}개 등록됨`} />
          <ActionCard href="/events/manage" icon={<Calendar className="w-5 h-5" />} bg="bg-orange-500/10 text-orange-400" label="행사 목록" sub="전체 행사 관리" />
          <ActionCard href="/mypage" icon={<Settings className="w-5 h-5" />} bg="bg-blue-500/10 text-blue-400" label="마이페이지" sub="계정 설정" />
        </div>
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-[15vh] p-4" onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-2xl bg-[#141b2d] rounded-2xl border border-white/[0.06] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 p-4 border-b border-white/[0.06]">
              <Search className="w-5 h-5 text-slate-500 shrink-0" />
              <input
                type="text" placeholder="회원 이름, 이메일, 행사명, 신청자 전화번호 검색..." autoFocus
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 outline-none"
              />
              {searching && <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />}
              <button onClick={() => setSearchOpen(false)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-500"><XCircle className="w-4 h-4" /></button>
            </div>
            {searchQuery.trim() && searchResults && (
              <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5">
                {searchResults.users.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase mb-2">회원 ({searchResults.users.length})</p>
                    <div className="space-y-1">
                      {searchResults.users.map(u => (
                        <div key={u.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] text-sm">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-mint-400 to-mint-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">{(u.name || u.email || '?')[0].toUpperCase()}</div>
                          <span className="font-semibold text-slate-200">{u.name || '—'}</span>
                          <span className="text-slate-500">{u.email}</span>
                          <span className="text-[10px] text-slate-600 ml-auto">{timeAgo(u.created_at)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {searchResults.events.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase mb-2">행사 ({searchResults.events.length})</p>
                    <div className="space-y-1">
                      {searchResults.events.map(ev => (
                        <Link key={ev.id} href={`/events/manage/${ev.id}`} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] text-sm group">
                          <div className="w-7 h-7 rounded-lg bg-mint-500/10 text-mint-400 flex items-center justify-center shrink-0"><Calendar className="w-3.5 h-3.5" /></div>
                          <span className="font-semibold text-slate-200 group-hover:text-mint-400 transition-colors">{ev.title}</span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${ev.status === 'open' ? 'bg-emerald-500/10 text-emerald-400' : ev.status === 'draft' ? 'bg-slate-500/10 text-slate-400' : 'bg-slate-500/10 text-slate-500'}`}>{STATUS_LABELS[ev.status]}</span>
                          <span className="text-[10px] text-slate-600 ml-auto">{ev.start_date ? fmt(ev.start_date) : '날짜 미정'}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {searchResults.applications.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase mb-2">신청자 ({searchResults.applications.length})</p>
                    <div className="space-y-1">
                      {searchResults.applications.map(a => (
                        <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] text-sm">
                          <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0"><UserPlus className="w-3.5 h-3.5" /></div>
                          <span className="font-semibold text-slate-200">{a.student_name}</span>
                          <span className="text-slate-500">{a.parent_name}</span>
                          <span className="text-slate-600 text-[11px]">{a.parent_phone}</span>
                          <span className="text-[10px] text-slate-600 ml-auto">{timeAgo(a.created_at)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {searchResults.users.length === 0 && searchResults.events.length === 0 && searchResults.applications.length === 0 && (
                  <div className="text-center py-8 text-slate-600"><Search className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">검색 결과가 없습니다</p></div>
                )}
              </div>
            )}
            {!searchQuery.trim() && (
              <div className="text-center py-10 text-slate-600"><Search className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">검색어를 입력하세요</p></div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function MetricCard({ label, value, sub, trend, icon, color }: {
  label: string; value: number; sub?: string; trend?: number
  icon: React.ReactNode; color: 'blue' | 'purple' | 'orange' | 'mint' | 'indigo'
}) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-400' },
    mint: { bg: 'bg-mint-500/10', text: 'text-mint-400' },
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400' },
  }
  const c = colorMap[color]
  return (
    <div className="bg-[#141b2d] rounded-2xl p-5 border border-white/[0.06] flex items-center justify-between">
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase">{label}</p>
        <p className="text-2xl font-bold text-slate-100 mt-1">{value.toLocaleString()}</p>
        {trend !== undefined && <Trend value={trend} />}
        {sub && !trend && <span className="text-[11px] text-slate-600">{sub}</span>}
      </div>
      <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.text} flex items-center justify-center`}>{icon}</div>
    </div>
  )
}

function ActionCard({ href, icon, bg, label, sub }: { href: string; icon: React.ReactNode; bg: string; label: string; sub: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 p-4 rounded-2xl bg-[#141b2d] border border-white/[0.06] hover:border-mint-500/30 hover:-translate-y-0.5 transition-all group">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>{icon}</div>
      <div>
        <p className="text-sm font-bold text-slate-200">{label}</p>
        <p className="text-[10px] text-slate-500">{sub}</p>
      </div>
    </Link>
  )
}
