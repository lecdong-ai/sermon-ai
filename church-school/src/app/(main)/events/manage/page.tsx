'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Plus, Users, Copy, Trash2, MoreVertical, Clock, MapPin, Settings } from 'lucide-react'
import { EventRecord, EVENT_STATUS_LABELS } from '@/types/event'
import { useAuth } from '@/components/AuthProvider'
import { redirectToMainLogin } from '@/lib/auth-redirect'

export default function ManageEventsPage() {
  const { isLoggedIn, loading: authLoading } = useAuth()
  const [events, setEvents] = useState<(EventRecord & { application_count: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [showTemplates, setShowTemplates] = useState(false)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  // 미로그인 시 메인 페이지 로그인으로 자동 이동
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      redirectToMainLogin('/events/manage')
    }
  }, [authLoading, isLoggedIn])

  const fetchEvents = async () => {
    setLoading(true)
    const res = await fetch(`/api/manage/events?templates=${showTemplates}`)
    const data = await res.json()
    setEvents(data.events || [])
    setLoading(false)
  }

  useEffect(() => {
    if (isLoggedIn) fetchEvents()
  }, [showTemplates, isLoggedIn])

  const handleClone = async (id: string) => {
    if (!confirm('이 행사를 복사하여 새 행사를 만드시겠습니까?')) return
    const res = await fetch(`/api/manage/events/${id}/clone`, { method: 'POST' })
    const data = await res.json()
    if (data.event) { fetchEvents(); setMenuOpen(null) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까? 모든 신청 내역도 함께 삭제됩니다.')) return
    const res = await fetch(`/api/manage/events/${id}`, { method: 'DELETE' })
    if (res.ok) { fetchEvents(); setMenuOpen(null) }
  }

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/events/${token}`
    navigator.clipboard.writeText(url)
    setMenuOpen(null)
    alert('신청 링크가 복사되었습니다!\n\n' + url)
  }

  if (authLoading || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-warm-50 py-24 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-navy-200 border-t-navy-600 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-navy-500">로그인 페이지로 이동 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">행사 관리</h1>
          <p className="text-navy-500 text-sm mt-1">행사를 생성하고 신청자를 관리하세요</p>
        </div>
        <Link href="/events/manage/new" className="btn-primary btn-sm">
          <Plus className="w-4 h-4" />
          행사 생성
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setShowTemplates(false)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!showTemplates ? 'bg-navy-900 text-white' : 'bg-white text-navy-600 border border-warm-200 hover:bg-navy-50'}`}>
          행사 목록
        </button>
        <button onClick={() => setShowTemplates(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showTemplates ? 'bg-navy-900 text-white' : 'bg-white text-navy-600 border border-warm-200 hover:bg-navy-50'}`}>
          템플릿
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-navy-400">불러오는 중...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <Calendar className="w-12 h-12 text-warm-300 mx-auto mb-4" />
          <p className="text-navy-400 mb-4">{showTemplates ? '저장된 템플릿이 없습니다' : '생성된 행사가 없습니다'}</p>
          <Link href="/events/manage/new" className="btn-primary btn-sm">
            <Plus className="w-4 h-4" />
            {showTemplates ? '템플릿 만들기' : '첫 행사 만들기'}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div key={event.id} className="card-flat p-5 relative group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-navy-900 truncate">{event.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge ${event.status === 'open' ? 'bg-mint-50 text-mint-700 border border-mint-200' : event.status === 'closed' ? 'bg-warm-100 text-warm-700 border border-warm-200' : 'bg-navy-50 text-navy-600 border border-navy-200'}`}>
                      {EVENT_STATUS_LABELS[event.status]}
                    </span>
                    {event.is_template && (
                      <span className="badge bg-purple-50 text-purple-700 border border-purple-200">템플릿</span>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <button onClick={() => setMenuOpen(menuOpen === event.id ? null : event.id)}
                    className="p-1.5 rounded-lg hover:bg-warm-50 transition-colors">
                    <MoreVertical className="w-4 h-4 text-navy-400" />
                  </button>
                  {menuOpen === event.id && (
                    <div className="absolute right-0 top-8 z-10 bg-white rounded-xl shadow-lg border border-warm-200 py-1 min-w-[160px]">
                      {!event.is_template && (
                        <button onClick={() => copyLink(event.link_token)}
                          className="w-full px-4 py-2 text-left text-sm text-navy-700 hover:bg-navy-50 flex items-center gap-2">
                          <Copy className="w-4 h-4" /> 링크 복사
                        </button>
                      )}
                      <button onClick={() => handleClone(event.id)}
                        className="w-full px-4 py-2 text-left text-sm text-navy-700 hover:bg-navy-50 flex items-center gap-2">
                        <Copy className="w-4 h-4" /> 복제
                        </button>
                      <Link href={`/events/manage/${event.id}`}
                        className="w-full px-4 py-2 text-left text-sm text-navy-700 hover:bg-navy-50 flex items-center gap-2">
                        <Settings className="w-4 h-4" /> 수정
                      </Link>
                      <button onClick={() => handleDelete(event.id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2">
                        <Trash2 className="w-4 h-4" /> 삭제
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {event.description && (
                <p className="text-sm text-navy-500 line-clamp-2 mb-3">{event.description}</p>
              )}

              <div className="space-y-1.5 text-sm text-navy-500 mb-4">
                {event.start_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-navy-300" />
                    <span>{new Date(event.start_date).toLocaleDateString('ko-KR')}</span>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-navy-300" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}
                {event.deadline && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-navy-300" />
                    <span>마감: {new Date(event.deadline).toLocaleDateString('ko-KR')}</span>
                  </div>
                )}
              </div>

              {!event.is_template && (
                <Link href={`/events/manage/${event.id}/applications`}
                  className="flex items-center justify-between p-3 bg-navy-50 rounded-xl hover:bg-navy-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-navy-500" />
                    <span className="text-sm font-medium text-navy-700">신청자</span>
                  </div>
                  <span className="text-lg font-bold text-navy-900">
                    {event.application_count}{event.capacity ? `/${event.capacity}` : ''}
                  </span>
                </Link>
              )}

              <div className="mt-3 flex gap-2">
                <Link href={`/events/manage/${event.id}`}
                  className="flex-1 py-2 text-center text-sm font-medium text-navy-700 bg-white border border-warm-200 rounded-lg hover:bg-warm-50 transition-colors">
                  관리
                </Link>
                {!event.is_template && (
                  <Link href={`/events/manage/${event.id}/applications`}
                    className="flex-1 py-2 text-center text-sm font-medium text-white bg-navy-900 rounded-lg hover:bg-navy-800 transition-colors">
                    신청자
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
