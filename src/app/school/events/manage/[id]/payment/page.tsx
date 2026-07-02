'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Search, Check, X, ChevronDown, Wallet } from 'lucide-react'
import { getRegistrations, getEventById, updateRegistration } from '@/lib/events/db'
import { PAYMENT_STATUS_LABELS, type Registration, type Event } from '@/types/event'

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'all' | 'pending' | 'deposited' | 'refunded'>('all')
  const [editId, setEditId] = useState<string | null>(null)
  const [editDepositor, setEditDepositor] = useState('')
  const [editAmount, setEditAmount] = useState(0)

  const loadData = () => {
    Promise.all([getEventById(id), getRegistrations(id)]).then(([ev, regs]) => {
      setEvent(ev)
      setRegistrations(regs)
      setLoading(false)
    })
  }

  useEffect(loadData, [id])

  const filtered = registrations.filter(r => {
    if (tab === 'pending' && r.paymentStatus !== 'pending') return false
    if (tab === 'deposited' && r.paymentStatus !== 'deposited') return false
    if (tab === 'refunded' && r.paymentStatus !== 'refunded') return false
    if (search && !r.participantName.includes(search) && !r.depositorName.includes(search) && !r.parentPhone.includes(search)) return false
    return true
  })

  const togglePayment = async (reg: Registration) => {
    const next = reg.paymentStatus === 'pending' ? 'deposited' : reg.paymentStatus === 'deposited' ? 'refunded' : 'pending'
    const status = next === 'deposited' ? 'confirmed' : next === 'pending' ? 'pending_payment' : reg.status
    await updateRegistration(reg.id, { paymentStatus: next, status: status as any })
    loadData()
  }

  const startEdit = (reg: Registration) => {
    setEditId(reg.id)
    setEditDepositor(reg.depositorName)
    setEditAmount(reg.paymentAmount)
  }

  const saveEdit = async () => {
    if (!editId) return
    await updateRegistration(editId, { depositorName: editDepositor, paymentAmount: editAmount, paymentDate: new Date().toISOString().split('T')[0] })
    setEditId(null)
    loadData()
  }

  if (loading || !event) return null

  const statusColor: Record<string, string> = {
    pending: 'bg-cs-orange-50 text-cs-orange-700 border-cs-orange-200',
    deposited: 'bg-cs-mint-50 text-cs-mint-700 border-cs-mint-200',
    refunded: 'bg-cs-navy-50 text-cs-navy-500 border-cs-navy-200',
  }

  const summary = {
    total: registrations.length,
    pending: registrations.filter(r => r.paymentStatus === 'pending').length,
    deposited: registrations.filter(r => r.paymentStatus === 'deposited').length,
    refunded: registrations.filter(r => r.paymentStatus === 'refunded').length,
  }

  return (
    <div className="bg-cs-warm-50 min-h-screen">
      <div className="container-custom py-6">
        <Link href={`/school/events/manage/${id}`} className="inline-flex items-center gap-1.5 text-sm text-cs-navy-500 hover:text-cs-navy-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> 행사 관리
        </Link>

        <h1 className="text-xl font-extrabold text-cs-navy-900 mb-6">입금 관리</h1>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { key: 'total', label: '전체', count: summary.total, color: 'text-cs-navy-900' },
            { key: 'pending', label: '입금대기', count: summary.pending, color: 'text-cs-orange-600' },
            { key: 'deposited', label: '입금완료', count: summary.deposited, color: 'text-cs-mint-600' },
            { key: 'refunded', label: '환불', count: summary.refunded, color: 'text-cs-navy-500' },
          ].map(s => (
            <button key={s.key} onClick={() => setTab(s.key as any)} className={`card-flat p-4 bg-white text-center hover:shadow-card-hover transition-shadow ${tab === s.key ? 'ring-2 ring-cs-mint-400' : ''}`}>
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-cs-navy-500">{s.label}</p>
            </button>
          ))}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cs-navy-400" />
          <input type="text" placeholder="이름/입금자명 검색" value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 text-sm" />
        </div>

        <div className="card-flat bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cs-warm-50 border-b border-cs-warm-200">
                  <th className="p-3 text-left font-bold text-cs-navy-700">이름</th>
                  <th className="p-3 text-left font-bold text-cs-navy-700">보호자</th>
                  <th className="p-3 text-left font-bold text-cs-navy-700">연락처</th>
                  <th className="p-3 text-center font-bold text-cs-navy-700">입금상태</th>
                  <th className="p-3 text-center font-bold text-cs-navy-700">입금자명</th>
                  <th className="p-3 text-center font-bold text-cs-navy-700">금액</th>
                  <th className="p-3 text-center font-bold text-cs-navy-700">입금일</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-cs-navy-500">내역이 없습니다.</td></tr>
                ) : filtered.map(reg => (
                  <tr key={reg.id} className="border-b border-cs-warm-100 hover:bg-cs-warm-50">
                    <td className="p-3 font-medium text-cs-navy-900">{reg.participantName}</td>
                    <td className="p-3 text-cs-navy-600">{reg.parentName}</td>
                    <td className="p-3 text-cs-navy-600">{reg.parentPhone}</td>
                    <td className="p-3 text-center">
                      <button onClick={() => togglePayment(reg)} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${statusColor[reg.paymentStatus]}`}>
                        {PAYMENT_STATUS_LABELS[reg.paymentStatus]}
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      {editId === reg.id ? (
                        <input type="text" value={editDepositor} onChange={e => setEditDepositor(e.target.value)} className="w-24 text-xs border border-cs-warm-200 rounded p-1" autoFocus onBlur={saveEdit} onKeyDown={e => e.key === 'Enter' && saveEdit()} />
                      ) : (
                        <button onClick={() => startEdit(reg)} className="text-cs-navy-600 hover:text-cs-navy-900">
                          {reg.depositorName || <span className="text-cs-navy-300">입력</span>}
                        </button>
                      )}
                    </td>
                    <td className="p-3 text-center text-cs-navy-600">
                      {editId === reg.id ? (
                        <input type="number" value={editAmount} onChange={e => setEditAmount(Number(e.target.value))} className="w-20 text-xs border border-cs-warm-200 rounded p-1" onBlur={saveEdit} onKeyDown={e => e.key === 'Enter' && saveEdit()} />
                      ) : (
                        <button onClick={() => startEdit(reg)} className="hover:text-cs-navy-900">
                          {reg.paymentAmount > 0 ? `₩${reg.paymentAmount.toLocaleString()}` : <span className="text-cs-navy-300">0</span>}
                        </button>
                      )}
                    </td>
                    <td className="p-3 text-center text-cs-navy-500 text-xs">{reg.paymentDate || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
