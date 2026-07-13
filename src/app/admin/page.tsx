'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Users, Loader2, ChevronUp, ChevronDown,
  BookOpen, UserPlus, Clock,
} from 'lucide-react'
import VisitorCounter from '@/components/admin/VisitorCounter'

interface AdminStats {
  totalUsers: number
  adminCount: number
  newUsersThisMonth: number
  totalSermons: number
  sermonsThisMonth: number
}

function MetricCard({ icon: Icon, label, value, delta, color, sub }: {
  icon: any; label: string; value: string | number; delta?: { value: number; up: boolean }
  color: string; sub?: string
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
    </div>
  )
}

export default function AdminCenterPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/stats')
      const d = await res.json()
      if (!d.error) setStats(d)
      else setError(d.error)
    } catch {
      setError('통계를 불러오지 못했습니다')
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadStats() }, [loadStats])

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-slate-100">대시보드</h1>
          <p className="text-[12px] text-slate-500 mt-0.5">서비스 현황</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Clock className="w-3 h-3" />
          {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {error && (
        <div className="px-4 py-2.5 rounded-lg text-[12px] font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20">
          {error}
        </div>
      )}

      <VisitorCounter />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          icon={Users}
          label="총 회원"
          value={stats?.totalUsers ?? 0}
          delta={{ value: 12, up: true }}
          color="bg-indigo-500"
          sub={`관리자 ${stats?.adminCount ?? 0}명`}
        />
        <MetricCard
          icon={UserPlus}
          label="이번 달 신규"
          value={stats?.newUsersThisMonth ?? 0}
          delta={{ value: 24, up: true }}
          color="bg-emerald-500"
          sub="지난달 대비"
        />
        <MetricCard
          icon={BookOpen}
          label="누적 설교"
          value={stats?.totalSermons ?? 0}
          delta={{ value: 4, up: false }}
          color="bg-blue-500"
          sub={`이번달 ${stats?.sermonsThisMonth ?? 0}개`}
        />
      </div>
    </div>
  )
}
