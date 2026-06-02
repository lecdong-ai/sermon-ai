'use client'

import { useEffect, useState } from 'react'
import { Users, CreditCard, DollarSign, TrendingUp, Loader2 } from 'lucide-react'

interface Stats {
  totalUsers: number
  totalRevenue: number
  activeSubscriptions: number
  planDistribution: { pro: number; basic: number; trial: number }
}

function StatCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-semibold text-slate-500">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <p className="text-[24px] font-extrabold text-slate-800">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {sub && <p className="text-[12px] text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { if (!d.error) setStats(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[22px] font-extrabold text-slate-800 mb-1">관리자 대시보드</h1>
        <p className="text-[14px] text-slate-500">전체 서비스 현황을 한눈에 확인합니다</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="전체 사용자"
          value={stats?.totalUsers ?? 0}
          color="bg-indigo-500"
        />
        <StatCard
          icon={CreditCard}
          label="활성 구독"
          value={stats?.activeSubscriptions ?? 0}
          color="bg-emerald-500"
        />
        <StatCard
          icon={DollarSign}
          label="총 매출"
          value={`${(stats?.totalRevenue ?? 0).toLocaleString()}원`}
          color="bg-blue-500"
        />
        <StatCard
          icon={TrendingUp}
          label="플랜 분포"
          value={`Pro ${stats?.planDistribution.pro ?? 0}`}
          sub={`Basic ${stats?.planDistribution.basic ?? 0} · Trial ${stats?.planDistribution.trial ?? 0}`}
          color="bg-purple-500"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-[16px] font-bold text-slate-800 mb-4">플랜별 사용자 수</h2>
        <div className="space-y-3">
          {[
            { label: 'Pro', value: stats?.planDistribution.pro ?? 0, color: 'bg-indigo-500', max: stats?.totalUsers || 1 },
            { label: 'Basic', value: stats?.planDistribution.basic ?? 0, color: 'bg-emerald-500', max: stats?.totalUsers || 1 },
            { label: 'Trial', value: stats?.planDistribution.trial ?? 0, color: 'bg-amber-500', max: stats?.totalUsers || 1 },
          ].map(item => (
            <div key={item.label}>
              <div className="flex items-center justify-between text-[13px] mb-1">
                <span className="font-semibold text-slate-600">{item.label}</span>
                <span className="text-slate-400">{item.value}명</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.color} transition-all duration-500`}
                  style={{ width: `${(item.value / item.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
