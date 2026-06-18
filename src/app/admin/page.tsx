'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Users, Heart, Search, Loader2, Check, X,
  TrendingUp, BookOpen, UserPlus, Activity,
  ChevronRight, Clock, Shield,
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
  { label: '30일', days: 30, desc: '5,000원' },
  { label: '90일', days: 90, desc: '12,000원' },
  { label: '365일', days: 365, desc: '50,000원' },
]

function StatCard({ icon: Icon, label, value, sub, color, trend }: {
  icon: any; label: string; value: string | number; sub?: string; color: string; trend?: { up: boolean; text: string }
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <p className="text-[28px] font-extrabold text-slate-800 tracking-tight">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <div className="flex items-center gap-2 mt-1">
        {trend && (
          <span className={`text-[12px] font-semibold ${trend.up ? 'text-emerald-600' : 'text-rose-500'}`}>
            {trend.up ? '↑' : '↓'} {trend.text}
          </span>
        )}
        {sub && <span className="text-[12px] text-slate-400">{sub}</span>}
      </div>
    </div>
  )
}

function MonthlyBarChart({ data }: { data: { label: string; count: number; max: number }[] }) {
  return (
    <div className="flex items-end gap-1.5 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-md bg-gradient-to-t from-rose-400 to-pink-400 transition-all duration-700"
            style={{ height: `${d.max > 0 ? (d.count / d.max) * 100 : 0}%`, minHeight: d.count > 0 ? '4px' : '0px' }}
          />
          <span className="text-[9px] text-slate-400 font-medium">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

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

  const maxMonthly = Math.max(...monthlySupporters.map(m => m.count), 1)

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
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div>
        <h1 className="text-[22px] font-extrabold text-slate-800 flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-500" />
          관리자 센터
        </h1>
        <p className="text-[14px] text-slate-500 mt-1">서비스 현황과 회원을 관리합니다</p>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-xl text-[13px] font-semibold flex items-center gap-2 ${
          message.type === 'ok' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'ok' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* 히어로 stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Users}
          label="총 회원"
          value={stats?.totalUsers ?? 0}
          sub={`관리자 ${stats?.adminCount ?? 0}명`}
          color="bg-indigo-500"
        />
        <StatCard
          icon={Heart}
          label="활성 후원자"
          value={activeSupporters.length}
          sub={`전환율 ${stats?.supporterRate ?? 0}%`}
          color="bg-rose-500"
          trend={stats && stats.newUsersThisMonth > 0 ? { up: true, text: `이번달 ${stats.newUsersThisMonth}명` } : undefined}
        />
        <StatCard
          icon={UserPlus}
          label="이번 달 신규"
          value={stats?.newUsersThisMonth ?? 0}
          color="bg-emerald-500"
        />
        <StatCard
          icon={BookOpen}
          label="누적 설교"
          value={stats?.totalSermons ?? 0}
          sub={`이번달 ${stats?.sermonsThisMonth ?? 0}개`}
          color="bg-blue-500"
        />
      </div>

      {/* 회원 관리 섹션 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            회원 관리
          </h2>
          <div className="flex items-center gap-2 text-[12px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              후원 {activeSupporters.length}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-300" />
              일반 {supporters.length - activeSupporters.length}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {/* 검색 */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="이메일 또는 이름으로 검색..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-[13px] font-bold hover:bg-indigo-700 transition-colors"
              >
                검색
              </button>
            </div>
          </div>

          {/* 테이블 */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            </div>
          ) : supporters.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-[14px]">검색 결과가 없습니다</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase">이메일</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase">이름</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase">가입일</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase">상태</th>
                    <th className="text-right px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {supporters.map((s) => {
                    const active = isActive(s.supporter_until)
                    return (
                      <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-[13px] font-medium text-slate-700">{s.email}</span>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-slate-500">{s.name || '-'}</td>
                        <td className="px-4 py-3 text-[13px] text-slate-500">
                          {new Date(s.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          {active ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[12px] font-semibold border border-rose-200/60">
                              <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                              ~{new Date(s.supporter_until!).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[12px] font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              일반회원
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {grantUserId === s.id ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <select
                                value={selectedDays}
                                onChange={(e) => setSelectedDays(parseInt(e.target.value))}
                                className="text-[12px] border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
                              >
                                {GRANT_PRESETS.map((p) => (
                                  <option key={p.days} value={p.days}>{p.label} ({p.desc})</option>
                                ))}
                              </select>
                              <input
                                type="number"
                                placeholder="직접"
                                value={customDays}
                                onChange={(e) => setCustomDays(e.target.value)}
                                className="w-14 text-[12px] border border-slate-200 rounded-lg px-2 py-1.5"
                                min="1"
                              />
                              <button
                                onClick={() => handleGrant(s.id)}
                                disabled={grantingId === s.id}
                                className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-[12px] font-bold hover:bg-rose-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                              >
                                {grantingId === s.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Heart className="w-3 h-3" />
                                )}
                                {active ? '연장' : '부여'}
                              </button>
                              <button
                                onClick={() => { setGrantUserId(null); setCustomDays('') }}
                                className="px-2 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[12px] font-bold hover:bg-slate-200 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setGrantUserId(s.id)}
                              className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[12px] font-bold hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                            >
                              {active ? '연장' : '부여'}
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 서비스 현황 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 후원자 추이 */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-[16px] font-bold text-slate-800 mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            후원자 추이 (최근 6개월)
          </h2>
          <p className="text-[12px] text-slate-400 mb-6">월별 후원 만료 예정자 수</p>
          <MonthlyBarChart data={monthlySupporters.map(m => ({ ...m, max: maxMonthly }))} />
        </div>

        {/* 요약 통계 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-[16px] font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-400" />
            요약 통계
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-[13px] mb-1.5">
                <span className="text-slate-500">회원 구성</span>
                <span className="text-slate-700 font-semibold">
                  {activeSupporters.length} / {supporters.length}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
                <div
                  className="h-full rounded-l-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all"
                  style={{ width: `${supporters.length > 0 ? (activeSupporters.length / supporters.length) * 100 : 0}%` }}
                />
                <div className="h-full bg-slate-200" style={{ flex: 1 }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>후원 {activeSupporters.length}명 ({stats?.supporterRate ?? 0}%)</span>
                <span>일반 {supporters.length - activeSupporters.length}명</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-[13px] mb-1">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  설교 생성
                </span>
                <span className="text-slate-700 font-semibold">{stats?.totalSermons ?? 0}개</span>
              </div>
              <p className="text-[12px] text-slate-400">이번 달 {stats?.sermonsThisMonth ?? 0}개</p>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-[13px] mb-1">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                  신규 가입
                </span>
                <span className="text-slate-700 font-semibold">{stats?.newUsersThisMonth ?? 0}명</span>
              </div>
              <p className="text-[12px] text-slate-400">이번 달</p>
            </div>
          </div>
        </div>
      </div>

      {/* 푸터 액션 */}
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-slate-700">관리자 권한</p>
            <p className="text-[12px] text-slate-400">
              후원 부여 내역은 {stats?.adminCount ?? 0}명의 관리자에게 기록됩니다
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
      </div>
    </div>
  )
}
