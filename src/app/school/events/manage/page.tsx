'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Calendar, Settings, Users, Edit2, Eye, BarChart3 } from 'lucide-react'
import { getAdminEvents, getEventStats } from '@/lib/events/db'
import { EVENT_TYPE_LABELS, EVENT_STATUS_LABELS, type Event } from '@/types/event'

export default function EventManagePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [stats, setStats] = useState<Record<string, { total: number; confirmed: number; pending: number }>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminEvents().then(async data => {
      setEvents(data)
      const s: Record<string, any> = {}
      for (const e of data) {
        const st = await getEventStats(e.id)
        s[e.id] = { total: st.totalRegistrations, confirmed: st.confirmedCount, pending: st.pendingPaymentCount }
      }
      setStats(s)
      setLoading(false)
    })
  }, [])

  return (
    <div className="bg-cs-warm-50 min-h-screen">
      <section className="gradient-navy text-white py-12 md:py-16">
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold">행사 관리</h1>
              <p className="text-cs-navy-200 text-sm mt-1">행사 생성부터 참가자 관리, 명단 출력까지</p>
            </div>
            <Link href="/school/events/manage/new" className="btn-secondary">
              <Plus className="w-4 h-4" /> 새 행사
            </Link>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container-custom">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="card-flat p-6 bg-white animate-pulse">
                  <div className="h-5 bg-cs-warm-200 rounded w-1/3 mb-3" />
                  <div className="h-4 bg-cs-warm-200 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="card-flat p-12 bg-white text-center">
              <Calendar className="w-12 h-12 text-cs-navy-300 mx-auto mb-3" />
              <p className="text-cs-navy-500 font-medium mb-4">아직 등록된 행사가 없습니다.</p>
              <Link href="/school/events/manage/new" className="btn-primary">첫 행사 만들기</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map(event => {
                const s = stats[event.id] || { total: 0, confirmed: 0, pending: 0 }
                const statusColor: Record<string, string> = {
                  draft: 'bg-cs-navy-100 text-cs-navy-600',
                  open: 'bg-cs-mint-50 text-cs-mint-700',
                  closed: 'bg-cs-orange-50 text-cs-orange-700',
                  ongoing: 'bg-blue-50 text-blue-700',
                  completed: 'bg-cs-navy-100 text-cs-navy-500',
                }
                return (
                  <div key={event.id} className="card-flat p-5 bg-white hover:shadow-card-hover transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`badge text-xs ${statusColor[event.status]}`}>{EVENT_STATUS_LABELS[event.status]}</span>
                          <span className="badge bg-cs-orange-50 text-cs-orange-700 border border-cs-orange-200 text-xs">{EVENT_TYPE_LABELS[event.eventType]}</span>
                        </div>
                        <h3 className="text-base font-bold text-cs-navy-900 truncate">{event.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-cs-navy-500 mt-1">
                          <span>{event.eventStart} ~ {event.eventEnd}</span>
                          <span>정원 {event.maxParticipants}명</span>
                          {event.fee > 0 && <span>₩{event.fee.toLocaleString()}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-cs-navy-600">
                        <div className="text-center">
                          <p className="font-bold text-lg text-cs-navy-900">{s.total}</p>
                          <p className="text-[10px]">신청</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-lg text-cs-mint-600">{s.confirmed}</p>
                          <p className="text-[10px]">확정</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-lg text-cs-orange-500">{s.pending}</p>
                          <p className="text-[10px]">미입금</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/school/events/${event.id}`} className="btn-ghost btn-sm p-2" title="미리보기">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link href={`/school/events/manage/${event.id}`} className="btn-primary btn-sm">
                          관리하기
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
