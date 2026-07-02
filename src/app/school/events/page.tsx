'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, Users, ArrowRight, Search, Filter } from 'lucide-react'
import { getEvents } from '@/lib/events/db'
import { EVENT_TYPE_LABELS, EVENT_STATUS_LABELS, type Event, type EventType } from '@/types/event'

const EVENT_TYPES: ('all' | EventType)[] = [
  'all', 'summer_bible', 'retreat', 'camp', 'teacher_seminar', 'sports_day', 'custom',
]

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | EventType>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed' | 'ongoing'>('all')

  useEffect(() => {
    getEvents().then(data => {
      setEvents(data)
      setLoading(false)
    })
  }, [])

  const filtered = events.filter(e => {
    if (typeFilter !== 'all' && e.eventType !== typeFilter) return false
    if (statusFilter !== 'all' && e.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!e.title.toLowerCase().includes(q) && !e.description.toLowerCase().includes(q)) return false
    }
    return true
  })

  return (
    <div className="bg-cs-warm-50 min-h-screen">
      <section className="gradient-navy text-white py-12 md:py-20">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">교회 행사</h1>
          <p className="text-cs-navy-200 text-sm md:text-base max-w-xl">
            여름성경학교, 수련회, 세미나 등 교회 행사에 참가 신청을 할 수 있습니다.
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cs-navy-400" />
              <input
                type="text"
                placeholder="행사 검색..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="select-field md:w-40"
            >
              <option value="all">전체 상태</option>
              <option value="open">접수중</option>
              <option value="closed">접수마감</option>
              <option value="ongoing">진행중</option>
            </select>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
              className="select-field md:w-40"
            >
              <option value="all">전체 유형</option>
              {EVENT_TYPES.filter(t => t !== 'all').map(t => (
                <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="h-4 bg-cs-warm-200 rounded w-1/3 mb-4" />
                  <div className="h-6 bg-cs-warm-200 rounded w-2/3 mb-3" />
                  <div className="h-4 bg-cs-warm-200 rounded w-full mb-2" />
                  <div className="h-4 bg-cs-warm-200 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-cs-navy-300 mx-auto mb-4" />
              <p className="text-cs-navy-500 font-medium">등록된 행사가 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(event => (
                <Link
                  key={event.id}
                  href={`/school/events/${event.id}`}
                  className="card p-6 bg-white flex flex-col group hover:shadow-card-hover transition-all"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`badge text-xs ${event.status === 'open' ? 'bg-cs-mint-50 text-cs-mint-700 border border-cs-mint-200' : event.status === 'ongoing' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-cs-navy-50 text-cs-navy-500 border border-cs-navy-200'}`}>
                      {EVENT_STATUS_LABELS[event.status]}
                    </span>
                    <span className="badge bg-cs-orange-50 text-cs-orange-700 border border-cs-orange-200 text-xs">
                      {EVENT_TYPE_LABELS[event.eventType]}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-cs-navy-900 mb-2 group-hover:text-cs-mint-600 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-xs text-cs-navy-500 line-clamp-2 mb-4 flex-1">{event.description}</p>
                  <div className="space-y-1.5 text-xs text-cs-navy-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cs-navy-400" />
                      {event.eventStart} ~ {event.eventEnd}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cs-navy-400" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-cs-navy-400" />
                      정원 {event.maxParticipants}명
                      {event.fee > 0 && <span className="ml-auto font-bold text-cs-orange-600">₩{event.fee.toLocaleString()}</span>}
                      {event.fee === 0 && <span className="ml-auto font-bold text-cs-mint-600">무료</span>}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-cs-warm-100 flex items-center justify-between">
                    <span className="text-[11px] text-cs-navy-400">신청기간: {event.registrationStart} ~ {event.registrationEnd}</span>
                    <ArrowRight className="w-4 h-4 text-cs-mint-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
