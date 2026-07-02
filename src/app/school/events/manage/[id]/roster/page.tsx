'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Search, Download, Printer, ChevronDown, ArrowLeft, Check, X, Filter } from 'lucide-react'
import { getRegistrations, getEventById, updateRegistration, getGroups, getTeams, getVehicles } from '@/lib/events/db'
import { PAYMENT_STATUS_LABELS, REGISTRATION_STATUS_LABELS, type Registration, type Event, type EventGroup, type EventTeam, type EventVehicle } from '@/types/event'

type FilterKey = 'all' | 'pending_payment' | 'confirmed' | 'cancelled'

export default function RosterPage() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<Event | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [groups, setGroups] = useState<EventGroup[]>([])
  const [teams, setTeams] = useState<EventTeam[]>([])
  const [vehicles, setVehicles] = useState<EventVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [selected, setSelected] = useState<string[]>([])
  const [editingPayment, setEditingPayment] = useState<string | null>(null)

  const loadData = () => {
    Promise.all([
      getEventById(id),
      getRegistrations(id),
      getGroups(id),
      getVehicles(id),
    ]).then(([ev, regs, grps, vehs]) => {
      setEvent(ev)
      setRegistrations(regs)
      setGroups(grps)
      setVehicles(vehs)
      const allTeams: EventTeam[] = []
      Promise.all(grps.map(g => getTeams(g.id).then(ts => allTeams.push(...ts)))).then(() => {
        setTeams(allTeams)
        setLoading(false)
      })
    })
  }

  useEffect(loadData, [id])

  const filtered = registrations.filter(r => {
    if (filter === 'pending_payment' && r.paymentStatus !== 'pending') return false
    if (filter === 'confirmed' && r.status !== 'confirmed') return false
    if (filter === 'cancelled' && r.status !== 'cancelled') return false
    if (search) {
      const q = search.toLowerCase()
      if (!r.participantName.toLowerCase().includes(q) && !r.parentPhone.includes(q)) return false
    }
    return true
  })

  const togglePayment = async (reg: Registration) => {
    const next = reg.paymentStatus === 'pending' ? 'deposited' : reg.paymentStatus === 'deposited' ? 'refunded' : 'pending'
    const status = next === 'deposited' ? 'confirmed' : next === 'pending' ? 'pending_payment' : reg.status
    await updateRegistration(reg.id, { paymentStatus: next, status: status as any })
    loadData()
  }

  const updateField = async (regId: string, data: Partial<Registration>) => {
    await updateRegistration(regId, data)
    loadData()
  }

  const toggleSelect = (regId: string) => {
    setSelected(prev => prev.includes(regId) ? prev.filter(id => id !== regId) : [...prev, regId])
  }

  const selectAll = () => {
    if (selected.length === filtered.length) {
      setSelected([])
    } else {
      setSelected(filtered.map(r => r.id))
    }
  }

  const batchUpdate = async (data: Partial<Registration>) => {
    for (const regId of selected) {
      await updateRegistration(regId, data)
    }
    setSelected([])
    loadData()
  }

  if (loading || !event) return null

  const paymentColor: Record<string, string> = {
    pending: 'text-cs-orange-600 bg-cs-orange-50 border-cs-orange-200',
    deposited: 'text-cs-mint-600 bg-cs-mint-50 border-cs-mint-200',
    refunded: 'text-cs-navy-400 bg-cs-navy-50 border-cs-navy-200',
  }

  const getGroupName = (gid: string | null) => groups.find(g => g.id === gid)?.name || '-'
  const getTeamName = (tid: string | null) => teams.find(t => t.id === tid)?.name || '-'
  const getVehicleName = (vid: string | null) => vehicles.find(v => v.id === vid)?.name || '-'

  return (
    <div className="bg-cs-warm-50 min-h-screen">
      <div className="container-custom py-6">
        <Link href={`/school/events/manage/${id}`} className="inline-flex items-center gap-1.5 text-sm text-cs-navy-500 hover:text-cs-navy-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> 행사 관리
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="text-xl font-extrabold text-cs-navy-900">참가자 명단</h1>
          <div className="flex items-center gap-2">
            <button className="btn-outline btn-sm" onClick={() => window.print()}><Printer className="w-4 h-4" /> 인쇄</button>
            <button className="btn-secondary btn-sm"><Download className="w-4 h-4" /> 엑셀</button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cs-navy-400" />
            <input type="text" placeholder="이름/연락처 검색" value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 text-sm" />
          </div>
          <div className="flex gap-2">
            {(['all', 'pending_payment', 'confirmed', 'cancelled'] as FilterKey[]).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${filter === f ? 'bg-cs-mint-500 text-white' : 'bg-white border border-cs-warm-200 text-cs-navy-600 hover:bg-cs-warm-50'}`}>
                {f === 'all' ? '전체' : f === 'pending_payment' ? '입금대기' : f === 'confirmed' ? '확정' : '취소'}
              </button>
            ))}
          </div>
        </div>

        {selected.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-cs-mint-50 rounded-xl mb-4 text-sm">
            <span className="font-medium text-cs-mint-800">{selected.length}명 선택</span>
            <span className="text-cs-mint-600">|</span>
            <button onClick={() => batchUpdate({ paymentStatus: 'deposited', status: 'confirmed' })} className="font-bold text-cs-mint-700 hover:underline">일괄 입금확인</button>
            <button onClick={() => batchUpdate({ paymentStatus: 'pending', status: 'pending_payment' })} className="font-bold text-cs-orange-600 hover:underline">일괄 입금취소</button>
            <button onClick={() => batchUpdate({ status: 'cancelled' })} className="font-bold text-red-600 hover:underline">일괄 취소</button>
            <button onClick={() => setSelected([])} className="font-bold text-cs-navy-500 hover:underline ml-auto">선택 해제</button>
          </div>
        )}

        <div className="card-flat bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cs-warm-50 border-b border-cs-warm-200">
                  <th className="p-3 text-left w-10">
                    <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={selectAll} className="accent-cs-mint-500" />
                  </th>
                  <th className="p-3 text-left font-bold text-cs-navy-700">이름</th>
                  <th className="p-3 text-left font-bold text-cs-navy-700">학년/부서</th>
                  <th className="p-3 text-left font-bold text-cs-navy-700">보호자 연락처</th>
                  <th className="p-3 text-center font-bold text-cs-navy-700">입금상태</th>
                  <th className="p-3 text-center font-bold text-cs-navy-700">반</th>
                  <th className="p-3 text-center font-bold text-cs-navy-700">조</th>
                  <th className="p-3 text-center font-bold text-cs-navy-700">차량</th>
                  <th className="p-3 text-center font-bold text-cs-navy-700">체크인</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="p-8 text-center text-cs-navy-500">신청자가 없습니다.</td></tr>
                ) : filtered.map((reg, idx) => (
                  <tr key={reg.id} className={`border-b border-cs-warm-100 hover:bg-cs-warm-50 ${reg.status === 'cancelled' ? 'opacity-50' : ''}`}>
                    <td className="p-3">
                      <input type="checkbox" checked={selected.includes(reg.id)} onChange={() => toggleSelect(reg.id)} className="accent-cs-mint-500" />
                    </td>
                    <td className="p-3 font-medium text-cs-navy-900">
                      <div>{reg.participantName}</div>
                      <div className="text-[10px] text-cs-navy-400">{reg.gender} · {reg.birth}</div>
                    </td>
                    <td className="p-3 text-cs-navy-600">{reg.grade}</td>
                    <td className="p-3 text-cs-navy-600">{reg.parentPhone}</td>
                    <td className="p-3 text-center">
                      <button onClick={() => togglePayment(reg)} className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border cursor-pointer ${paymentColor[reg.paymentStatus]}`}>
                        {PAYMENT_STATUS_LABELS[reg.paymentStatus]}
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <select value={reg.groupId || ''} onChange={e => updateField(reg.id, { groupId: e.target.value || null })} className="text-xs border border-cs-warm-200 rounded-lg p-1 bg-white">
                        <option value="">-</option>
                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                    </td>
                    <td className="p-3 text-center">
                      <select value={reg.teamId || ''} onChange={e => updateField(reg.id, { teamId: e.target.value || null })} className="text-xs border border-cs-warm-200 rounded-lg p-1 bg-white">
                        <option value="">-</option>
                        {teams.filter(t => t.groupId === reg.groupId).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </td>
                    <td className="p-3 text-center">
                      <select value={reg.vehicleId || ''} onChange={e => updateField(reg.id, { vehicleId: e.target.value || null })} className="text-xs border border-cs-warm-200 rounded-lg p-1 bg-white">
                        <option value="">-</option>
                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </select>
                    </td>
                    <td className="p-3 text-center">
                      {reg.checkInAt ? (
                        <span className="text-cs-mint-600 font-bold"><Check className="w-4 h-4 inline" /></span>
                      ) : (
                        <span className="text-cs-navy-300">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-xs text-cs-navy-500 mt-3">총 {filtered.length}명 (필터 적용)</div>
      </div>
    </div>
  )
}
