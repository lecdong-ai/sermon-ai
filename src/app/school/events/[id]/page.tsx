'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin, Users, ArrowLeft, Clock, Target, Banknote, ChevronRight } from 'lucide-react'
import { getEventById } from '@/lib/events/db'
import { EVENT_TYPE_LABELS, EVENT_STATUS_LABELS, type Event } from '@/types/event'

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getEventById(id).then(data => {
      setEvent(data)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="bg-cs-warm-50 min-h-screen pt-16">
        <div className="container-custom py-8 animate-pulse">
          <div className="h-6 bg-cs-warm-200 rounded w-40 mb-6" />
          <div className="h-10 bg-cs-warm-200 rounded w-2/3 mb-4" />
          <div className="h-4 bg-cs-warm-200 rounded w-1/3 mb-8" />
          <div className="h-40 bg-cs-warm-200 rounded mb-6" />
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="bg-cs-warm-50 min-h-screen pt-16">
        <div className="container-custom py-16 text-center">
          <p className="text-cs-navy-500 text-lg">행사를 찾을 수 없습니다.</p>
        </div>
      </div>
    )
  }

  const isOpen = event.status === 'open'

  return (
    <div className="bg-cs-warm-50 min-h-screen">
      <div className="container-custom py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card-flat p-6 md:p-8 bg-white">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="badge bg-cs-orange-50 text-cs-orange-700 border border-cs-orange-200">
                  {EVENT_TYPE_LABELS[event.eventType]}
                </span>
                {event.fee === 0 && (
                  <span className="badge bg-cs-mint-50 text-cs-mint-700 border border-cs-mint-200">무료</span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-cs-navy-900 mb-4">{event.title}</h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-cs-navy-600">
                  <Calendar className="w-4 h-4 text-cs-mint-500" />
                  <span>일정: {event.eventStart} ~ {event.eventEnd}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-cs-navy-600">
                  <MapPin className="w-4 h-4 text-cs-mint-500" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-cs-navy-600">
                  <Target className="w-4 h-4 text-cs-mint-500" />
                  <span>{event.targetDescription}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-cs-navy-600">
                  <Clock className="w-4 h-4 text-cs-mint-500" />
                  <span>접수 마감: {event.registrationEnd}</span>
                </div>
              </div>

              <div className="text-sm text-cs-navy-700 whitespace-pre-line leading-relaxed">
                {event.description}
              </div>
            </div>

            {event.fee > 0 && event.bankAccountInfo && (
              <div className="card-flat p-6 bg-white">
                <h3 className="font-bold text-cs-navy-900 mb-3 flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-cs-mint-500" /> 입금 안내
                </h3>
                <p className="text-sm text-cs-navy-700">참가비: <span className="font-bold text-cs-orange-600">₩{event.fee.toLocaleString()}</span></p>
                <p className="text-sm text-cs-navy-700 mt-1">{event.bankAccountInfo}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="card-flat p-6 bg-white sticky top-24">
              <div className="text-center mb-6">
                <p className="text-2xl font-extrabold text-cs-navy-900">
                  {event.fee === 0 ? '무료' : `₩${event.fee.toLocaleString()}`}
                </p>
                <p className="text-xs text-cs-navy-500 mt-1">
                  {event.fee === 0 ? '무료 행사' : '참가비'}
                </p>
              </div>

              <div className="space-y-2 text-sm text-cs-navy-600 mb-6">
                <div className="flex justify-between">
                  <span>행사일</span>
                  <span className="font-medium">{event.eventStart} ~ {event.eventEnd}</span>
                </div>
                <div className="flex justify-between">
                  <span>접수 마감</span>
                  <span className="font-medium">{event.registrationEnd}</span>
                </div>
                <div className="flex justify-between">
                  <span>대상</span>
                  <span className="font-medium">{event.targetDescription}</span>
                </div>
                <div className="flex justify-between">
                  <span>정원</span>
                  <span className="font-medium">{event.maxParticipants}명</span>
                </div>
              </div>

              {isOpen ? (
                <Link
                  href={`/school/events/${event.id}/register`}
                  className="btn-primary w-full justify-center text-base py-4"
                >
                  참가 신청하기
                  <ChevronRight className="w-5 h-5" />
                </Link>
              ) : (
                <button disabled className="btn-primary w-full justify-center opacity-50 cursor-not-allowed text-base py-4">
                  {event.status === 'draft' ? '준비중입니다' : event.status === 'closed' ? '접수가 마감되었습니다' : '행사가 종료되었습니다'}
                </button>
              )}

              {event.fee > 0 && (
                <p className="text-xs text-cs-navy-400 text-center mt-3">
                  신청 후 입금 시 참가가 확정됩니다
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
