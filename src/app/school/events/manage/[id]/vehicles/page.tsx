'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Users, MapPin, Clock, User } from 'lucide-react'
import { getRegistrations, getVehicles, getEventById, saveVehicle, updateVehicle, deleteVehicle, updateRegistration } from '@/lib/events/db'
import type { Registration, EventVehicle } from '@/types/event'

export default function VehiclesPage() {
  const { id } = useParams<{ id: string }>()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [vehicles, setVehicles] = useState<EventVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', driverName: '', driverPhone: '', maxCapacity: 25, departureTime: '09:00', departureLocation: '', routeDescription: '' })

  const loadData = () => {
    Promise.all([getRegistrations(id), getVehicles(id)]).then(([regs, vehs]) => {
      setRegistrations(regs.filter(r => r.vehicleUsage === '이용함' && r.status !== 'cancelled'))
      setVehicles(vehs)
      setLoading(false)
    })
  }

  useEffect(loadData, [id])

  const addVehicle = async () => {
    if (!form.name.trim()) return
    await saveVehicle(id, {
      eventId: id, ...form, stops: [], order: vehicles.length,
    })
    setForm({ name: '', driverName: '', driverPhone: '', maxCapacity: 25, departureTime: '09:00', departureLocation: '', routeDescription: '' })
    setShowForm(false)
    loadData()
  }

  const removeVehicle = async (vid: string) => {
    if (!confirm('차량을 삭제하시겠습니까?')) return
    await deleteVehicle(id, vid)
    loadData()
  }

  const assignVehicle = async (regId: string, vehicleId: string | null) => {
    await updateRegistration(regId, { vehicleId })
    loadData()
  }

  const unassigned = registrations.filter(r => !r.vehicleId)
  const vehicleRegs = (vid: string) => registrations.filter(r => r.vehicleId === vid)

  if (loading) return null

  return (
    <div className="bg-cs-warm-50 min-h-screen">
      <div className="container-custom py-6">
        <Link href={`/school/events/manage/${id}`} className="inline-flex items-center gap-1.5 text-sm text-cs-navy-500 hover:text-cs-navy-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> 행사 관리
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-cs-navy-900">차량 배정</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary btn-sm">
            <Plus className="w-4 h-4" /> 차량 추가
          </button>
        </div>

        {showForm && (
          <div className="card-flat p-4 bg-white mb-6">
            <h3 className="font-bold text-cs-navy-900 text-sm mb-4">새 차량</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="text" placeholder="차량명 (예: 1호차)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field text-sm" />
              <input type="text" placeholder="기사님 이름" value={form.driverName} onChange={e => setForm({ ...form, driverName: e.target.value })} className="input-field text-sm" />
              <input type="text" placeholder="기사 연락처" value={form.driverPhone} onChange={e => setForm({ ...form, driverPhone: e.target.value })} className="input-field text-sm" />
              <input type="number" placeholder="정원" value={form.maxCapacity} onChange={e => setForm({ ...form, maxCapacity: Number(e.target.value) })} className="input-field text-sm" />
              <input type="text" placeholder="출발지" value={form.departureLocation} onChange={e => setForm({ ...form, departureLocation: e.target.value })} className="input-field text-sm" />
              <input type="time" value={form.departureTime} onChange={e => setForm({ ...form, departureTime: e.target.value })} className="input-field text-sm" />
              <div className="md:col-span-3">
                <textarea placeholder="경유지 설명" value={form.routeDescription} onChange={e => setForm({ ...form, routeDescription: e.target.value })} className="input-field text-sm" rows={2} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => setShowForm(false)} className="btn-outline btn-sm">취소</button>
              <button onClick={addVehicle} className="btn-primary btn-sm">추가</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vehicles.map(v => {
            const assigned = vehicleRegs(v.id)
            const capRatio = assigned.length / v.maxCapacity
            return (
              <div key={v.id} className="card-flat p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-cs-navy-900">{v.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-cs-navy-500 mt-0.5">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {v.driverName}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {v.departureTime}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {v.departureLocation}</span>
                    </div>
                  </div>
                  <button onClick={() => removeVehicle(v.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>

                <div className="w-full bg-cs-warm-100 rounded-full h-2 mb-3">
                  <div className={`h-2 rounded-full transition-all ${capRatio >= 1 ? 'bg-red-400' : capRatio >= 0.8 ? 'bg-cs-orange-400' : 'bg-cs-mint-400'}`} style={{ width: `${Math.min(capRatio * 100, 100)}%` }} />
                </div>
                <p className="text-xs text-cs-navy-500 mb-3">{assigned.length} / {v.maxCapacity}명 배정</p>

                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {assigned.map(reg => (
                    <div key={reg.id} className="flex items-center justify-between p-1.5 rounded bg-cs-warm-50 text-xs">
                      <span>{reg.participantName} ({reg.grade})</span>
                      <button onClick={() => assignVehicle(reg.id, null)} className="text-red-400 hover:text-red-600">×</button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {unassigned.length > 0 && (
          <div className="card-flat p-4 bg-white mt-6">
            <h3 className="font-bold text-cs-navy-900 text-sm mb-3">미배정 ({unassigned.length}명)</h3>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {unassigned.map(reg => (
                <div key={reg.id} className="flex items-center justify-between p-2 rounded-lg border border-cs-warm-100">
                  <span className="text-sm">{reg.participantName} ({reg.grade})</span>
                  <select value={reg.vehicleId || ''} onChange={e => assignVehicle(reg.id, e.target.value || null)} className="text-xs border border-cs-warm-200 rounded-lg p-1 bg-white">
                    <option value="">차량 선택</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
