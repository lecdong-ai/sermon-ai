'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircle, Calendar, MapPin } from 'lucide-react'
import { getEventById } from '@/lib/events/db'
import type { Event } from '@/types/event'

export default function RegisterCompletePage() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<Event | null>(null)

  useEffect(() => {
    getEventById(id).then(setEvent)
  }, [id])

  const copyEventLink = () => {
    if (typeof window !== 'undefined') {
      const url = window.location.origin + `/school/events/${id}`
      alert(`행사 안내를 다른 분과 공유하려면 이 링크를 보내주세요:\n\n${url}`)
    }
  }

  return (
    <div className="bg-cs-warm-50 min-h-screen">
      <div className="container-custom py-16 max-w-lg mx-auto text-center">
        <div className="card-flat p-8 md:p-10 bg-white">
          <div className="w-16 h-16 rounded-full bg-cs-mint-50 text-cs-mint-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-extrabold text-cs-navy-900 mb-2">신청이 완료되었습니다</h1>
          <p className="text-sm text-cs-navy-500 mb-8">참가 신청이 정상적으로 접수되었습니다.</p>

          {event && (
            <div className="bg-cs-warm-50 rounded-xl p-5 text-left space-y-2 mb-8">
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
              {event.fee === 0 && (
                <div className="mt-3 p-3 bg-cs-mint-50 rounded-lg text-xs text-cs-mint-700">
                  무료 행사로 신청이 자동 확정되었습니다.
                </div>
              )}
              <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-cs-navy-600">
                <p className="font-medium text-cs-navy-800 mb-1">📌 행사 안내</p>
                <p>일정: {event.eventStart} ~ {event.eventEnd}</p>
                <p>장소: {event.location}</p>
                <p className="mt-1">※ 행사 전 준비물과 자세한 안내가 별도로 전달됩니다.</p>
              </div>
            </div>
          )}

          <button onClick={copyEventLink} className="btn-outline btn-sm w-full">
            행사 정보 공유하기
          </button>
        </div>
      </div>
    </div>
  )
}
