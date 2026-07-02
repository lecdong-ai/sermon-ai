'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin, Users, Won, ArrowLeft, Clock, Target, Banknote, ChevronRight } from 'lucide-react'
import { getEventById } from '@/lib/events/db'
import { EVENT_TYPE_LABELS, EVENT_STATUS_LABELS, type Event } from '@/types/event'

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
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
          <Link href="/school/events" className="btn-outline btn-sm mt-4 inline-flex">목록으로</Link>
        </div>
      </div>
    )
  }

  const isOpen = event.status === 'open'
  const isFree = event.fee === 0

  return (
    <div className="bg-cs-warm-50 min-h-screen">
      <div className="container-custom py-6">
        <Link href="/school/events" className="inline-flex items-center gap-1.5 text-sm text-cs-navy-500 hover:text-cs-navy-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> 행사 목록
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card-flat p-6 md:p-8 bg-white">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="badge bg-cs-orange-50 text-cs-orange-700 border border-cs-orange-200">
                  {EVENT_TYPE_LABELS[event.eventType]}
                </span>
                <span className={`badge ${event.status === 'open' ? 'bg-cs-mint-50 text-cs-mint-700 border border-cs-mint-200' : event.status === 'ongoing' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-cs-navy-50 text-cs-navy-500 border border-cs-navy-200'}`}>
                  {EVENT_STATUS_LABELS[event.status]}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-cs-navy-900 mb-4">{event.title}</h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-cs-navy-600">
                  <Calendar className="w-4 h-4 text-cs-mint-500" />
                  <span>행사일: {event.eventStart} ~ {event.eventEnd}</span>
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
                  <Users className="w-4 h-4 text-cs-mint-500" />
                  <span>정원 {event.maxParticipants}명</span>
                </div>
              </div>

              <div className="prose prose-sm max-w-none text-cs-navy-700 whitespace-pre-line">
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
                  {isFree ? '무료' : `₩${event.fee.toLocaleString()}`}
                </p>
                <p className="text-xs text-cs-navy-500 mt-1">
                  {isFree ? '무료 행사' : '참가비'}
                </p>
              </div>

              <div className="space-y-3 text-sm text-cs-navy-600 mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cs-navy-400" />
                  <span>접수기간: {event.registrationStart} ~ {event.registrationEnd}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-cs-navy-400" />
                  <span>정원: {event.maxParticipants}명</span>
                </div>
              </div>

              {isOpen ? (
                <Link
                  href={`/school/events/${event.id}/register`}
                  className="btn-primary w-full justify-center"
                >
                  신청하기
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <button disabled className="btn-primary w-full justify-center opacity-50 cursor-not-allowed">
                  {event.status === 'draft' ? '준비중' : event.status === 'closed' ? '접수 마감' : '종료됨'}
                </button>
              )}

              <Link href="/school/events" className="btn-outline btn-sm w-full justify-center mt-3">
                다른 행사 보기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
