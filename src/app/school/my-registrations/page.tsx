'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, ArrowRight, User } from 'lucide-react'
import { getMyRegistrations, getEvents } from '@/lib/events/db'
import { REGISTRATION_STATUS_LABELS, PAYMENT_STATUS_LABELS, type Registration, type Event } from '@/types/event'

export default function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getMyRegistrations(), getEvents()]).then(([regs, evs]) => {
      setRegistrations(regs)
      setEvents(evs)
      setLoading(false)
    })
  }, [])

  const getEvent = (eventId: string) => events.find(e => e.id === eventId)

  const statusColor: Record<string, string> = {
    registered: 'bg-blue-50 text-blue-700 border-blue-200',
    pending_payment: 'bg-cs-orange-50 text-cs-orange-700 border-cs-orange-200',
    confirmed: 'bg-cs-mint-50 text-cs-mint-700 border-cs-mint-200',
    cancelled: 'bg-cs-navy-50 text-cs-navy-500 border-cs-navy-200',
    waitlisted: 'bg-cs-warm-50 text-cs-warm-600 border-cs-warm-200',
  }

  return (
    <div className="bg-cs-warm-50 min-h-screen">
      <section className="gradient-navy text-white py-12 md:py-16">
        <div className="container-custom">
          <h1 className="text-2xl md:text-3xl font-extrabold">내 신청 내역</h1>
          <p className="text-cs-navy-200 text-sm mt-1">내가 신청한 행사를 확인할 수 있습니다.</p>
        </div>
      </section>

      <section className="py-8">
        <div className="container-custom max-w-3xl mx-auto">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="card-flat p-6 bg-white animate-pulse">
                  <div className="h-5 bg-cs-warm-200 rounded w-1/3 mb-3" />
                  <div className="h-4 bg-cs-warm-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : registrations.length === 0 ? (
            <div className="card-flat p-12 bg-white text-center">
              <User className="w-12 h-12 text-cs-navy-300 mx-auto mb-3" />
              <p className="text-cs-navy-500 font-medium mb-1">아직 신청한 행사가 없습니다.</p>
              <p className="text-sm text-cs-navy-400 mb-4">행사 목록에서 참가 신청을 해보세요.</p>
              <Link href="/school/events" className="btn-primary">행사 목록 보기</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {registrations.map(reg => {
                const event = getEvent(reg.eventId)
                return (
                  <div key={reg.id} className="card-flat p-5 bg-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`badge text-xs ${statusColor[reg.status]}`}>
                            {REGISTRATION_STATUS_LABELS[reg.status]}
                          </span>
                          <span className="text-xs text-cs-navy-400">
                            입금: {PAYMENT_STATUS_LABELS[reg.paymentStatus]}
                          </span>
                        </div>
                        <h3 className="font-bold text-cs-navy-900">{event?.title || '알 수 없음'}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-cs-navy-500 mt-1">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> {reg.participantName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {event?.eventStart} ~ {event?.eventEnd}
                          </span>
                          {event && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {event.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {event && (
                          <Link href={`/school/events/${event.id}`} className="btn-ghost btn-sm">
                            상세 <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
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
