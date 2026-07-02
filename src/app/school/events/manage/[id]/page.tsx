'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Users, Wallet, Layers, Truck, Bell, CheckSquare, FileDown, Settings, ArrowLeft, BarChart3, Edit2 } from 'lucide-react'
import { getEventById, getEventStats, updateEvent } from '@/lib/events/db'
import { EVENT_TYPE_LABELS, EVENT_STATUS_LABELS, type Event, type EventStats } from '@/types/event'

const TABS = [
  { key: 'roster', label: '명단', icon: Users },
  { key: 'payment', label: '입금', icon: Wallet },
  { key: 'grouping', label: '편성', icon: Layers },
  { key: 'vehicles', label: '차량', icon: Truck },
  { key: 'notices', label: '공지', icon: Bell },
  { key: 'checkin', label: '체크인', icon: CheckSquare },
  { key: 'export', label: '출력', icon: FileDown },
]

export default function EventManageHubPage() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<Event | null>(null)
  const [stats, setStats] = useState<EventStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getEventById(id), getEventStats(id)]).then(([ev, st]) => {
      setEvent(ev)
      setStats(st)
      setLoading(false)
    })
  }, [id])

  if (loading) return (
    <div className="bg-cs-warm-50 min-h-screen pt-16">
      <div className="container-custom py-8 animate-pulse">
        <div className="h-8 bg-cs-warm-200 rounded w-1/2 mb-4" />
        <div className="h-20 bg-cs-warm-200 rounded mb-6" />
        <div className="h-40 bg-cs-warm-200 rounded" />
      </div>
    </div>
  )

  if (!event) return (
    <div className="bg-cs-warm-50 min-h-screen pt-16">
      <div className="container-custom py-16 text-center">
        <p className="text-cs-navy-500">행사를 찾을 수 없습니다.</p>
        <Link href="/school/events/manage" className="btn-outline btn-sm mt-4 inline-flex">목록으로</Link>
      </div>
    </div>
  )

  const toggleStatus = () => {
    const flow: Record<string, string> = { draft: 'open', open: 'closed', closed: 'ongoing', ongoing: 'completed' }
    const next = flow[event.status]
    if (next) {
      updateEvent(event.id, { status: next as any })
      setEvent({ ...event, status: next as any })
    }
  }

  return (
    <div className="bg-cs-warm-50 min-h-screen">
      <div className="container-custom py-6">
        <Link href="/school/events/manage" className="inline-flex items-center gap-1.5 text-sm text-cs-navy-500 hover:text-cs-navy-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> 행사 관리
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge bg-cs-orange-50 text-cs-orange-700 border border-cs-orange-200">{EVENT_TYPE_LABELS[event.eventType]}</span>
              <button onClick={toggleStatus} className={`badge cursor-pointer hover:opacity-80 ${event.status === 'open' ? 'bg-cs-mint-50 text-cs-mint-700 border border-cs-mint-200' : event.status === 'draft' ? 'bg-cs-navy-50 text-cs-navy-600 border border-cs-navy-200' : event.status === 'closed' ? 'bg-cs-orange-50 text-cs-orange-700 border border-cs-orange-200' : event.status === 'ongoing' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-cs-navy-100 text-cs-navy-500 border border-cs-navy-200'}`}>
                {EVENT_STATUS_LABELS[event.status]} (클릭 변경)
              </button>
            </div>
            <h1 className="text-2xl font-extrabold text-cs-navy-900">{event.title}</h1>
            <p className="text-sm text-cs-navy-500">{event.eventStart} ~ {event.eventEnd} · {event.location}</p>
          </div>
          <Link href={`/school/events/manage/${event.id}/settings`} className="btn-outline btn-sm">
            <Settings className="w-4 h-4" /> 설정
          </Link>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            <div className="card-flat p-4 bg-white text-center">
              <p className="text-2xl font-extrabold text-cs-navy-900">{stats.totalRegistrations}</p>
              <p className="text-xs text-cs-navy-500">총 신청</p>
            </div>
            <div className="card-flat p-4 bg-white text-center">
              <p className="text-2xl font-extrabold text-cs-mint-600">{stats.confirmedCount}</p>
              <p className="text-xs text-cs-navy-500">참가확정</p>
            </div>
            <div className="card-flat p-4 bg-white text-center">
              <p className="text-2xl font-extrabold text-cs-orange-500">{stats.pendingPaymentCount}</p>
              <p className="text-xs text-cs-navy-500">입금대기</p>
            </div>
            <div className="card-flat p-4 bg-white text-center">
              <p className="text-2xl font-extrabold text-blue-600">{stats.checkInCount}</p>
              <p className="text-xs text-cs-navy-500">체크인</p>
            </div>
            <div className="card-flat p-4 bg-white text-center">
              <p className="text-2xl font-extrabold text-red-500">{stats.cancelledCount}</p>
              <p className="text-xs text-cs-navy-500">취소</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {TABS.map(tab => {
            const Icon = tab.icon
            return (
              <Link
                key={tab.key}
                href={`/school/events/manage/${event.id}/${tab.key}`}
                className="card-flat p-4 bg-white flex flex-col items-center gap-2 hover:shadow-card-hover hover:-translate-y-0.5 transition-all group"
              >
                <Icon className="w-6 h-6 text-cs-navy-400 group-hover:text-cs-mint-500 transition-colors" />
                <span className="text-xs font-bold text-cs-navy-700">{tab.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
