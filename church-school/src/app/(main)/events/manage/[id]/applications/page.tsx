'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Search, Download, CheckSquare, Square, Users, CheckCircle2, Phone } from 'lucide-react'
import { ApplicationRecord, ApplicationStatus, STATUS_LABELS, STATUS_COLORS } from '@/types/event'

export default function ApplicationsPage() {
  const params = useParams()
  const eventId = params.id as string

  const [applications, setApplications] = useState<ApplicationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [checkinFilter, setCheckinFilter] = useState<string>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [batchStatus, setBatchStatus] = useState<ApplicationStatus>('confirmed')
  const [event, setEvent] = useState<{ title: string; capacity: number | null } | null>(null)

  const fetchApps = async () => {
    setLoading(true)
    const queryParams = new URLSearchParams()
    if (statusFilter !== 'all') queryParams.set('status', statusFilter)
    if (checkinFilter !== 'all') queryParams.set('checkin', checkinFilter)
    if (search) queryParams.set('q', search)
    const res = await fetch(`/api/manage/events/${eventId}/applications?${queryParams}`)
    const data = await res.json()
    setApplications(data.applications || [])
    setLoading(false)
  }

  useEffect(() => {
    fetch(`/api/manage/events/${eventId}`)
      .then(r => r.json())
      .then(data => { if (data.event) setEvent({ title: data.event.title, capacity: data.event.capacity }) })
  }, [eventId])

  useEffect(() => { fetchApps() }, [statusFilter, checkinFilter])

  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const toggleSelectAll = () => {
    if (selected.size === applications.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(applications.map(a => a.id)))
    }
  }

  const handleBatchUpdate = async () => {
    if (selected.size === 0) return
    const res = await fetch(`/api/manage/events/${eventId}/applications/batch`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ application_ids: Array.from(selected), status: batchStatus }),
    })
    if (res.ok) {
      setSelected(new Set())
      fetchApps()
    }
  }

  const handleStatusChange = async (id: string, status: ApplicationStatus) => {
    const res = await fetch(`/api/manage/events/${eventId}/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) fetchApps()
  }

  const handleCheckinToggle = async (id: string, current: string) => {
    const res = await fetch(`/api/manage/events/${eventId}/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ check_in_status: current === 'checked_in' ? 'not_checked_in' : 'checked_in' }),
    })
    if (res.ok) fetchApps()
  }

  const checkedIn = applications.filter(a => a.check_in_status === 'checked_in').length

  return (
    <div className="container-custom py-8">
      <Link href={`/events/manage/${eventId}`} className="inline-flex items-center gap-1 text-navy-500 hover:text-navy-700 mb-4 text-sm">
        <ArrowLeft className="w-4 h-4" /> {event?.title || '행사'} 관리로
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy-900">신청자 목록</h1>
        <a href={`/api/manage/events/${eventId}/applications/export?format=csv`}
          className="btn-outline btn-sm">
          <Download className="w-4 h-4" /> CSV 다운로드
        </a>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card-flat p-4">
          <div className="flex items-center gap-2 text-navy-400 mb-1">
            <Users className="w-4 h-4" /><span className="text-xs">전체</span>
          </div>
          <p className="text-2xl font-bold text-navy-900">{applications.length}</p>
        </div>
        <div className="card-flat p-4">
          <div className="flex items-center gap-2 text-navy-400 mb-1">
            <CheckCircle2 className="w-4 h-4" /><span className="text-xs">체크인</span>
          </div>
          <p className="text-2xl font-bold text-mint-600">{checkedIn}</p>
        </div>
        <div className="card-flat p-4">
          <div className="flex items-center gap-2 text-navy-400 mb-1">
            <Users className="w-4 h-4" /><span className="text-xs">미체크인</span>
          </div>
          <p className="text-2xl font-bold text-orange-500">{applications.length - checkedIn}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-300" />
          <input type="text" placeholder="이름, 보호자, 연락처 검색"
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchApps()}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-warm-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-mint-400" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-warm-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-mint-400">
          <option value="all">전체 상태</option>
          <option value="submitted">신청완료</option>
          <option value="confirmed">확정</option>
          <option value="waiting_deposit">입금대기</option>
          <option value="deposited">입금완료</option>
          <option value="cancelled">취소</option>
        </select>
        <select value={checkinFilter} onChange={e => setCheckinFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-warm-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-mint-400">
          <option value="all">체크인 전체</option>
          <option value="checked_in">체크인 완료</option>
          <option value="not_checked_in">미체크인</option>
        </select>
      </div>

      {selected.size > 0 && (
        <div className="bg-navy-50 rounded-xl p-3 mb-4 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-navy-700">{selected.size}명 선택</span>
          <select value={batchStatus} onChange={e => setBatchStatus(e.target.value as ApplicationStatus)}
            className="px-3 py-1.5 rounded-lg border border-warm-200 bg-white text-sm">
            <option value="confirmed">확정</option>
            <option value="waiting_deposit">입금대기</option>
            <option value="deposited">입금완료</option>
            <option value="cancelled">취소</option>
          </select>
          <button onClick={handleBatchUpdate} className="btn-primary btn-sm">일괄 변경</button>
          <button onClick={() => setSelected(new Set())} className="text-sm text-navy-500 hover:text-navy-700">선택 해제</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-navy-400">불러오는 중...</div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-warm-300 mx-auto mb-3" />
          <p className="text-navy-400">신청자가 없습니다</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-3 px-1">
            <button onClick={toggleSelectAll} className="flex items-center gap-2 text-sm text-navy-600">
              {selected.size === applications.length && applications.length > 0
                ? <CheckSquare className="w-4 h-4 text-navy-600" />
                : <Square className="w-4 h-4 text-navy-300" />}
              전체 선택
            </button>
          </div>

          <div className="space-y-2">
            {applications.map((app) => (
              <div key={app.id} className={`card-flat p-4 ${selected.has(app.id) ? 'ring-2 ring-navy-400' : ''}`}>
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleSelect(app.id)} className="mt-1">
                    {selected.has(app.id)
                      ? <CheckSquare className="w-5 h-5 text-navy-600" />
                      : <Square className="w-5 h-5 text-navy-300" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Link href={`/events/manage/${eventId}/applications/${app.id}`}
                        className="font-bold text-navy-900 hover:underline">{app.student_name}</Link>
                      <span className="text-sm text-navy-400">{app.grade}</span>
                      {app.department && <span className="text-xs text-navy-400">{app.department}</span>}
                      <span className={`badge ${STATUS_COLORS[app.status]}`}>{STATUS_LABELS[app.status]}</span>
                      {app.check_in_status === 'checked_in' && (
                        <span className="badge bg-mint-50 text-mint-700 border border-mint-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> 체크인
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-navy-500">
                      <div>보호자: {app.parent_name}</div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <a href={`tel:${app.parent_phone}`} className="hover:text-navy-700">{app.parent_phone}</a>
                      </div>
                      <div>생년월일: {app.birth_date}</div>
                      {app.allergies && <div className="text-orange-600">알레르기: {app.allergies}</div>}
                      {app.health_notes && <div className="text-orange-600">건강: {app.health_notes}</div>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <select value={app.status} onChange={e => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                      className="px-2 py-1 text-xs rounded-lg border border-warm-200 bg-white">
                      <option value="submitted">신청완료</option>
                      <option value="confirmed">확정</option>
                      <option value="waiting_deposit">입금대기</option>
                      <option value="deposited">입금완료</option>
                      <option value="cancelled">취소</option>
                    </select>
                    <button onClick={() => handleCheckinToggle(app.id, app.check_in_status)}
                      className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${app.check_in_status === 'checked_in' ? 'bg-mint-100 text-mint-700' : 'bg-navy-50 text-navy-600 hover:bg-navy-100'}`}>
                      {app.check_in_status === 'checked_in' ? '체크인 취소' : '체크인'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
