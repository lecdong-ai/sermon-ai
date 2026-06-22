'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface UsageLog {
  id: string
  user_id: string
  subscription_id: string | null
  usage_type: string
  sermon_id: string | null
  item: string
  idempotency_key: string
  deducted: number
  created_at: string
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<UsageLog[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'usage' | 'payment'>('usage')

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/logs').then(r => r.json()),
      fetch('/api/admin/payments').then(r => r.json()),
    ]).then(([logsData, paymentsData]) => {
      if (!logsData.error) setLogs(logsData.logs || [])
      if (!paymentsData.error) setPayments(paymentsData.payments || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-slate-100 mb-1">시스템 로그</h1>
        <p className="text-[14px] text-slate-500">사용량 차감 로그 및 결제 내역</p>
      </div>

      <div className="flex gap-1 mb-4 bg-white/5 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab('usage')}
          className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all ${tab === 'usage' ? 'bg-[#0a0e1a] text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-200'}`}
        >
          사용량 로그
        </button>
        <button
          onClick={() => setTab('payment')}
          className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all ${tab === 'payment' ? 'bg-[#0a0e1a] text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-200'}`}
        >
          결제 내역
        </button>
      </div>

      <div className="bg-[#0a0e1a] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                {tab === 'usage' ? (
                  <>
                    <th className="text-left px-5 py-3 font-bold text-slate-600">사용자</th>
                    <th className="text-left px-5 py-3 font-bold text-slate-600">유형</th>
                    <th className="text-left px-5 py-3 font-bold text-slate-600">항목</th>
                    <th className="text-left px-5 py-3 font-bold text-slate-600">차감</th>
                    <th className="text-left px-5 py-3 font-bold text-slate-600">시간</th>
                  </>
                ) : (
                  <>
                    <th className="text-left px-5 py-3 font-bold text-slate-600">사용자 ID</th>
                    <th className="text-left px-5 py-3 font-bold text-slate-600">금액</th>
                    <th className="text-left px-5 py-3 font-bold text-slate-600">상태</th>
                    <th className="text-left px-5 py-3 font-bold text-slate-600">결제 수단</th>
                    <th className="text-left px-5 py-3 font-bold text-slate-600">시간</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {tab === 'usage' ? (
                logs.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">로그가 없습니다</td></tr>
                ) : (
                  logs.map((l, i) => (
                    <tr key={l.id} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-[#0a0e1a]' : 'bg-white/5'}`}>
                      <td className="px-5 py-3 font-mono text-[12px] text-slate-500">{l.user_id.slice(0, 8)}...</td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded bg-white/5 text-slate-600 text-[12px] font-medium">{l.usage_type}</span>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{l.item}</td>
                      <td className="px-5 py-3 font-bold text-amber-600">-{l.deducted}</td>
                      <td className="px-5 py-3 text-slate-500 text-[12px]">
                        {new Date(l.created_at).toLocaleString('ko-KR')}
                      </td>
                    </tr>
                  ))
                )
              ) : (
                payments.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">결제 내역이 없습니다</td></tr>
                ) : (
                  payments.map((p, i) => (
                    <tr key={p.id} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-[#0a0e1a]' : 'bg-white/5'}`}>
                      <td className="px-5 py-3 font-mono text-[12px] text-slate-500">{p.user_id?.slice(0, 8)}...</td>
                      <td className="px-5 py-3 font-bold text-slate-200">{p.amount.toLocaleString()}원</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded text-[12px] font-bold ${
                          p.status === 'succeeded' ? 'bg-emerald-500/15 text-emerald-300' :
                          p.status === 'failed' ? 'bg-rose-500/20 text-rose-300' :
                          'bg-amber-500/15 text-amber-300'
                        }`}>{p.status}</span>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{p.payment_method || '-'}</td>
                      <td className="px-5 py-3 text-slate-500 text-[12px]">
                        {new Date(p.created_at).toLocaleString('ko-KR')}
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
