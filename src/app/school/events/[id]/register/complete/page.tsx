'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Calendar, MapPin, ArrowRight } from 'lucide-react'
import { getEventById } from '@/lib/events/db'
import { EVENT_TYPE_LABELS, type Event } from '@/types/event'

export default function RegisterCompletePage() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<Event | null>(null)

  useEffect(() => {
    getEventById(id).then(setEvent)
  }, [id])

  return (
    <div className="bg-cs-warm-50 min-h-screen">
      <div className="container-custom py-16 max-w-lg mx-auto text-center">
        <div className="card-flat p-8 md:p-10 bg-white">
          <div className="w-16 h-16 rounded-full bg-cs-mint-50 text-cs-mint-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-extrabold text-cs-navy-900 mb-2">신청이 완료되었습니다</h1>
          <p className="text-sm text-cs-navy-500 mb-8">행사 참가 신청이 정상적으로 접수되었습니다.</p>

          {event && (
            <div className="bg-cs-warm-50 rounded-xl p-4 text-left space-y-2 mb-8">
              <p className="font-bold text-cs-navy-900">{event.title}</p>
              <div className="flex items-center gap-1.5 text-xs text-cs-navy-500">
                <Calendar className="w-3.5 h-3.5" /> {event.eventStart} ~ {event.eventEnd}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-cs-navy-500">
                <MapPin className="w-3.5 h-3.5" /> {event.location}
              </div>
              {event.fee > 0 && (
                <div className="mt-3 p-3 bg-cs-orange-50 rounded-lg text-xs text-cs-orange-700">
                  참가비 <strong>₩{event.fee.toLocaleString()}</strong>를 아래 계좌로 입금해주세요.<br />
                  {event.bankAccountInfo}<br />
                  입금 확인 후 신청이 확정됩니다.
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Link href="/school/events" className="btn-primary justify-center">
              행사 목록으로 <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/school/events/manage" className="btn-outline justify-center text-sm">
              내 신청 내역 보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
