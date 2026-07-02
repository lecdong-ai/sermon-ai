'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Search, CheckCircle, XCircle, Check } from 'lucide-react'
import { getRegistrations, updateRegistration } from '@/lib/events/db'
import type { Registration } from '@/types/event'

export default function CheckinPage() {
  const { id } = useParams<{ id: string }>()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [mode, setMode] = useState<'checkin' | 'return'>('checkin')
  const [recentCheck, setRecentCheck] = useState<string | null>(null)

  const loadData = () => {
    getRegistrations(id).then(regs => {
      setRegistrations(regs.filter(r => r.status === 'confirmed'))
      setLoading(false)
    })
  }

  useEffect(loadData, [id])

  const handleCheck = async (reg: Registration) => {
    const now = new Date().toISOString()
    if (mode === 'checkin') {
      await updateRegistration(reg.id, { checkInAt: reg.checkInAt ? null : now })
    } else {
      await updateRegistration(reg.id, { returnCheckAt: reg.returnCheckAt ? null : now })
    }
    setRecentCheck(reg.id)
    setTimeout(() => setRecentCheck(null), 1500)
    loadData()
  }

  const filtered = registrations.filter(r => {
    if (!search) return true
    const q = search.toLowerCase()
    return r.participantName.toLowerCase().includes(q) || r.grade.toLowerCase().includes(q)
  })

  const checkedIn = registrations.filter(r => r.checkInAt !== null).length
  const returned = registrations.filter(r => r.returnCheckAt !== null).length

  if (loading) return null

  return (
    <div className="bg-cs-warm-50 min-h-screen">
      <div className="container-custom py-6 max-w-2xl mx-auto">
        <Link href={`/school/events/manage/${id}`} className="inline-flex items-center gap-1.5 text-sm text-cs-navy-500 hover:text-cs-navy-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> 행사 관리
        </Link>

        <h1 className="text-xl font-extrabold text-cs-navy-900 mb-6">출석 체크인</h1>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="card-flat p-4 bg-white text-center">
            <p className="text-2xl font-extrabold text-cs-mint-600">{checkedIn}</p>
            <p className="text-xs text-cs-navy-500">/ {registrations.length} 체크인 완료</p>
            <div className="w-full bg-cs-warm-100 rounded-full h-2 mt-2">
              <div className="h-2 rounded-full bg-cs-mint-400 transition-all" style={{ width: `${registrations.length ? (checkedIn / registrations.length) * 100 : 0}%` }} />
            </div>
          </div>
          <div className="card-flat p-4 bg-white text-center">
            <p className="text-2xl font-extrabold text-blue-600">{returned}</p>
            <p className="text-xs text-cs-navy-500">/ {registrations.length} 귀가 확인</p>
            <div className="w-full bg-cs-warm-100 rounded-full h-2 mt-2">
              <div className="h-2 rounded-full bg-blue-400 transition-all" style={{ width: `${registrations.length ? (returned / registrations.length) * 100 : 0}%` }} />
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setMode('checkin')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${mode === 'checkin' ? 'bg-cs-mint-500 text-white shadow-lg' : 'bg-white border border-cs-warm-200 text-cs-navy-600'}`}>
            <CheckCircle className="w-5 h-5 inline mr-1" /> 체크인
          </button>
          <button onClick={() => setMode('return')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${mode === 'return' ? 'bg-blue-500 text-white shadow-lg' : 'bg-white border border-cs-warm-200 text-cs-navy-600'}`}>
            <XCircle className="w-5 h-5 inline mr-1" /> 귀가 확인
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cs-navy-400" />
          <input type="text" placeholder="이름 또는 학년 검색" value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-12 text-base py-4" autoFocus />
        </div>

        <div className="space-y-2">
          {filtered.length === 0 ? (
            <p className="text-center text-cs-navy-500 py-8">검색 결과가 없습니다.</p>
          ) : filtered.map(reg => {
            const isChecked = mode === 'checkin' ? reg.checkInAt !== null : reg.returnCheckAt !== null
            const isRecent = recentCheck === reg.id
            return (
              <button
                key={reg.id}
                onClick={() => handleCheck(reg)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  isChecked
                    ? 'bg-cs-mint-50 border-cs-mint-300 text-cs-mint-800'
                    : 'bg-white border-cs-warm-200 text-cs-navy-900 hover:border-cs-mint-300'
                } ${isRecent ? 'scale-[1.02]' : ''}`}
              >
                <div className="text-left">
                  <p className="font-bold text-base">{reg.participantName}</p>
                  <p className="text-xs opacity-70">{reg.grade} · {reg.parentPhone}</p>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isChecked ? 'bg-cs-mint-500 text-white' : 'bg-cs-warm-100 text-cs-navy-300'
                }`}>
                  {isChecked ? <Check className="w-6 h-6" /> : <span className="text-lg font-bold">{reg.participantName[0]}</span>}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
