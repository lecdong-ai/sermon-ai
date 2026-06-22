'use client'

import { useEffect, useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'

interface Subscription {
  id: string
  user_id: string
  plan: string
  status: string
  billing_cycle_start: string
  billing_cycle_end: string
  monthly_limit: number
  monthly_used: number
  created_at: string
}

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSubs = () => {
    setLoading(true)
    fetch('/api/admin/subscriptions')
      .then(r => r.json())
      .then(d => { if (!d.error) setSubs(d.subscriptions) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchSubs() }, [])

  const statusStyles: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    trialing: 'bg-blue-100 text-blue-700',
    past_due: 'bg-amber-100 text-amber-700',
    canceled: 'bg-white/5 text-slate-500',
    expired: 'bg-rose-500/20 text-rose-300',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-extrabold text-slate-100 mb-1">구독 관리</h1>
          <p className="text-[14px] text-slate-500">전체 {subs.length}개의 구독</p>
        </div>
        <button
          onClick={fetchSubs}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/5 bg-[#0a0e1a] text-[13px] font-semibold text-slate-600 hover:bg-white/5 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          새로고침
        </button>
      </div>

      <div className="bg-[#0a0e1a] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="text-left px-5 py-3 font-bold text-slate-600">사용자 ID</th>
                <th className="text-left px-5 py-3 font-bold text-slate-600">플랜</th>
                <th className="text-left px-5 py-3 font-bold text-slate-600">상태</th>
                <th className="text-left px-5 py-3 font-bold text-slate-600">사용량</th>
                <th className="text-left px-5 py-3 font-bold text-slate-600">결제 주기</th>
                <th className="text-left px-5 py-3 font-bold text-slate-600">생성일</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s, i) => (
                <tr key={s.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${i % 2 === 0 ? 'bg-[#0a0e1a]' : 'bg-white/5'}`}>
                  <td className="px-5 py-3">
                    <span className="font-mono text-[12px] text-slate-500">{s.user_id.slice(0, 8)}...</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-bold text-slate-200 capitalize">{s.plan}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[12px] font-bold ${statusStyles[s.status] || 'bg-white/5 text-slate-500'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-white/5 max-w-[80px]">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{ width: `${(s.monthly_used / s.monthly_limit) * 100}%` }}
                        />
                      </div>
                      <span className="text-[12px] text-slate-500">
                        {s.monthly_used}/{s.monthly_limit}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-[12px]">
                    {new Date(s.billing_cycle_start).toLocaleDateString('ko-KR')} ~ {new Date(s.billing_cycle_end).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {new Date(s.created_at).toLocaleDateString('ko-KR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
