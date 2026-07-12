'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Share2, Users, CheckCircle2, Clock, MapPin, Calendar, Settings, Trash2, Download, MessageCircle } from 'lucide-react'
import { EventRecord, EventStatus, EVENT_STATUS_LABELS, CustomField } from '@/types/event'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  type ShareStyle = 'warm' | 'formal' | 'short'
  const [event, setEvent] = useState<(EventRecord & { application_count: number; checked_in_count: number }) | null>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareStyle, setShareStyle] = useState<ShareStyle>('warm')
  const [gradeData, setGradeData] = useState<{ grade: string; count: number }[]>([])

  const [editForm, setEditForm] = useState<Partial<EventRecord>>({})

  useEffect(() => {
    fetch(`/api/manage/events/${eventId}`)
      .then(r => r.json())
      .then(data => {
        if (data.event) { setEvent(data.event); setEditForm(data.event); setLoading(false) }
        else { setLoading(false) }
      })
    fetchGradeStats()
  }, [eventId])

  const fetchGradeStats = async () => {
    const res = await fetch(`/api/manage/events/${eventId}/applications`)
    const data = await res.json()
    if (data.applications) {
      const gradeMap: Record<string, number> = {}
      data.applications.forEach((app: { grade: string }) => {
        gradeMap[app.grade] = (gradeMap[app.grade] || 0) + 1
      })
      setGradeData(Object.entries(gradeMap).map(([grade, count]) => ({ grade, count })))
    }
  }

  const buildShareText = (style: ShareStyle = shareStyle) => {
    if (!event) return ''
    const url = `${window.location.origin}/events/${event.link_token}`
    const dateStr = event.start_date
      ? new Date(event.start_date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }) +
        (event.end_date
          ? ' ~ ' + new Date(event.end_date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
          : '')
      : ''
    const deadlineStr = event.deadline
      ? new Date(event.deadline).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }) + '까지'
      : ''

    const lines: string[] = []

    if (style === 'warm') {
      lines.push(`💌 우리 아이들과 함께하는`)
      lines.push(`   [${event.title}]에 초대합니다!`)
      lines.push('')
      if (dateStr) lines.push(`📅 일시: ${dateStr}`)
      if (event.location) lines.push(`📍 장소: ${event.location}`)
      if (deadlineStr) lines.push(`⏰ 마감: ${deadlineStr}`)
      if (event.description) { lines.push(''); lines.push(event.description) }
      lines.push('')
      lines.push('선생님들이 기다리고 있어요 😊')
      lines.push('아래 링크에서 참석 여부를 알려주세요 👇')
      lines.push(url)
    } else if (style === 'formal') {
      lines.push(`📢 [${event.title}] 신청 안내`)
      lines.push('')
      if (dateStr) lines.push(`📅 일시: ${dateStr}`)
      if (event.location) lines.push(`📍 장소: ${event.location}`)
      if (deadlineStr) lines.push(`⏰ 신청마감: ${deadlineStr}`)
      if (event.capacity) lines.push(`👥 정원: ${event.capacity}명`)
      if (event.description) { lines.push(''); lines.push(event.description) }
      lines.push('')
      lines.push('아래 링크에서 신청해주세요 👇')
      lines.push(url)
    } else {
      // short — OG 미리보기와 함께 쓸 때 효과적
      const parts = [`[${event.title}]`]
      if (dateStr) parts.push(`📅 ${dateStr}`)
      if (event.location) parts.push(`📍 ${event.location}`)
      lines.push(parts.join(' | '))
      if (event.description) lines.push('')
      if (event.description) lines.push(event.description.length > 60 ? event.description.slice(0, 60) + '…' : event.description)
      lines.push('')
      lines.push(`👉 ${url}`)
    }

    return lines.join('\n')
  }

  const handleShare = async () => {
    if (!event) return
    const text = buildShareText()
    const url = `${window.location.origin}/events/${event.link_token}`
    if (navigator.share) {
      try { await navigator.share({ title: event.title, text, url }) } catch {}
    } else {
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const copyLink = async () => {
    if (!event) return
    const text = buildShareText()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {}
  }

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch(`/api/manage/events/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    const data = await res.json()
    if (data.event) { setEvent({ ...event, ...data.event }); setEditing(false) }
    setSaving(false)
  }

  const handleStatusChange = async (status: EventStatus) => {
    const res = await fetch(`/api/manage/events/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const data = await res.json()
    if (data.event) setEvent({ ...event, ...data.event })
  }

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까? 모든 신청 내역도 함께 삭제됩니다.')) return
    const res = await fetch(`/api/manage/events/${eventId}`, { method: 'DELETE' })
    if (res.ok) router.push('/events/manage')
  }

  if (loading) return <div className="container-custom py-20 text-center text-navy-400">불러오는 중...</div>
  if (!event) return <div className="container-custom py-20 text-center text-navy-400">행사를 찾을 수 없습니다.</div>

  const inputClass = "w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-mint-400 transition-all"

  return (
    <div className="container-custom py-8 max-w-4xl">
      <Link href="/events/manage" className="inline-flex items-center gap-1 text-navy-500 hover:text-navy-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> 행사 목록으로
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">{event.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`badge ${event.status === 'open' ? 'bg-mint-50 text-mint-700 border border-mint-200' : event.status === 'closed' ? 'bg-warm-100 text-warm-700 border border-warm-200' : 'bg-navy-50 text-navy-600 border border-navy-200'}`}>
              {EVENT_STATUS_LABELS[event.status]}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing(!editing)} className="btn-outline btn-sm">
            <Settings className="w-4 h-4" /> {editing ? '취소' : '수정'}
          </button>
          <button onClick={handleDelete} className="px-3 py-2 text-red-500 border-2 border-red-200 rounded-xl hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Share Card */}
      {!event.is_template && (
        <div className="bg-gradient-to-br from-navy-800 to-navy-600 rounded-2xl p-6 mb-6 text-white">
          <h2 className="text-sm font-medium opacity-80 mb-1">학부모에게 공유하기</h2>
          <p className="text-xs opacity-60 mb-3">카카오톡에 붙여넣으면 학부모가 바로 내용을 알 수 있어요</p>

          {/* Style Tabs */}
          <div className="flex gap-1.5 mb-3 bg-white/10 rounded-xl p-1 w-fit">
            {([{ id: 'warm', label: '따뜻하게' }, { id: 'formal', label: '정식' }, { id: 'short', label: '짧게' }] as { id: ShareStyle; label: string }[]).map(s => (
              <button
                key={s.id}
                onClick={() => setShareStyle(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  shareStyle === s.id ? 'bg-white text-navy-800' : 'text-white/70 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Preview */}
          <div className="bg-white/10 rounded-xl p-4 mb-4 border border-white/20">
            <pre className="text-xs text-white/90 whitespace-pre-wrap font-sans leading-relaxed">{buildShareText(shareStyle)}</pre>
          </div>

          <div className="flex gap-2">
            <button onClick={copyLink} className="flex-1 py-3 bg-[#FEE500] text-[#3C1E1E] font-bold rounded-xl hover:brightness-95 transition-all flex items-center justify-center gap-2">
              <MessageCircle className="w-5 h-5" />
              {copied ? '복사됨! 카톡에 붙여넣으세요' : '카카오톡으로 복사'}
            </button>
            <button onClick={handleShare} className="px-4 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors flex items-center justify-center gap-2 border border-white/30">
              <Share2 className="w-5 h-5" />
              공유
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      {!event.is_template && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card-flat p-4">
            <div className="flex items-center gap-2 text-navy-400 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs">신청자</span>
            </div>
            <p className="text-2xl font-bold text-navy-900">
              {event.application_count}{event.capacity ? ` / ${event.capacity}` : ''}
            </p>
          </div>
          <div className="card-flat p-4">
            <div className="flex items-center gap-2 text-navy-400 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs">체크인</span>
            </div>
            <p className="text-2xl font-bold text-mint-600">{event.checked_in_count}</p>
          </div>
          <div className="card-flat p-4">
            <div className="flex items-center gap-2 text-navy-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">마감</span>
            </div>
            <p className="text-sm font-medium text-navy-700">
              {event.deadline ? new Date(event.deadline).toLocaleDateString('ko-KR') : '미설정'}
            </p>
          </div>
          <div className="card-flat p-4">
            <div className="flex items-center gap-2 text-navy-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">행사일</span>
            </div>
            <p className="text-sm font-medium text-navy-700">
              {event.start_date ? new Date(event.start_date).toLocaleDateString('ko-KR') : '미설정'}
            </p>
          </div>
        </div>
      )}

      {/* Status Control */}
      {!event.is_template && (
        <div className="card-flat p-5 mb-6">
          <h2 className="text-sm font-bold text-navy-900 mb-3">신청 상태</h2>
          <div className="flex gap-2">
            {(['open', 'closed', 'cancelled'] as EventStatus[]).map(s => (
              <button key={s} onClick={() => handleStatusChange(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${event.status === s ? 'bg-navy-900 text-white' : 'bg-white text-navy-600 border border-warm-200 hover:bg-navy-50'}`}>
                {EVENT_STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grade Distribution Chart */}
      {!event.is_template && gradeData.length > 0 && (
        <div className="card-flat p-5 mb-6">
          <h2 className="text-sm font-bold text-navy-900 mb-4">학년별 분포</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={gradeData}>
              <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#1B3A5C" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Edit Form */}
      {editing ? (
        <div className="card-flat p-6 space-y-4">
          <h2 className="text-base font-bold text-navy-900">행사 수정</h2>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1.5">행사명</label>
            <input className={inputClass} value={editForm.title || ''}
              onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1.5">설명</label>
            <textarea className={inputClass} rows={3} value={editForm.description || ''}
              onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1.5">장소</label>
            <input className={inputClass} value={editForm.location || ''}
              onChange={e => setEditForm({ ...editForm, location: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">시작일시</label>
              <input type="datetime-local" className={inputClass}
                value={editForm.start_date ? new Date(editForm.start_date).toISOString().slice(0, 16) : ''}
                onChange={e => setEditForm({ ...editForm, start_date: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">종료일시</label>
              <input type="datetime-local" className={inputClass}
                value={editForm.end_date ? new Date(editForm.end_date).toISOString().slice(0, 16) : ''}
                onChange={e => setEditForm({ ...editForm, end_date: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1.5">신청 마감</label>
            <input type="datetime-local" className={inputClass}
              value={editForm.deadline ? new Date(editForm.deadline).toISOString().slice(0, 16) : ''}
              onChange={e => setEditForm({ ...editForm, deadline: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1.5">정원</label>
            <input type="number" min={0} className={inputClass}
              value={editForm.capacity ?? ''}
              onChange={e => setEditForm({ ...editForm, capacity: e.target.value ? parseInt(e.target.value) : null })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1.5">문의 연락처</label>
            <input className={inputClass} value={editForm.contact_info || ''}
              onChange={e => setEditForm({ ...editForm, contact_info: e.target.value })} />
          </div>
          <button onClick={handleSave} disabled={saving}
            className="btn-primary w-full">
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      ) : (
        <div className="card-flat p-6">
          <h2 className="text-base font-bold text-navy-900 mb-4">행사 정보</h2>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <span className="text-navy-400 w-20 flex-shrink-0">설명</span>
              <span className="text-navy-700 whitespace-pre-wrap">{event.description || '-'}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-navy-400 w-20 flex-shrink-0">장소</span>
              <span className="text-navy-700">{event.location || '-'}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-navy-400 w-20 flex-shrink-0">일시</span>
              <span className="text-navy-700">
                {event.start_date ? new Date(event.start_date).toLocaleString('ko-KR') : '-'}
                {event.end_date && ` ~ ${new Date(event.end_date).toLocaleString('ko-KR')}`}
              </span>
            </div>
            <div className="flex gap-3">
              <span className="text-navy-400 w-20 flex-shrink-0">마감</span>
              <span className="text-navy-700">{event.deadline ? new Date(event.deadline).toLocaleString('ko-KR') : '-'}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-navy-400 w-20 flex-shrink-0">정원</span>
              <span className="text-navy-700">{event.capacity || '무제한'}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-navy-400 w-20 flex-shrink-0">문의</span>
              <span className="text-navy-700">{event.contact_info || '-'}</span>
            </div>
            {event.custom_fields && event.custom_fields.length > 0 && (
              <div className="flex gap-3">
                <span className="text-navy-400 w-20 flex-shrink-0">추가 질문</span>
                <div className="flex flex-wrap gap-2">
                  {event.custom_fields.map((f: CustomField) => (
                    <span key={f.id} className="badge bg-navy-50 text-navy-700 border border-navy-200">
                      {f.label}{f.required && ' *'}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Links */}
      {!event.is_template && (
        <div className="flex gap-3 mt-6">
          <Link href={`/events/manage/${event.id}/applications`}
            className="flex-1 btn-primary">
            <Users className="w-5 h-5" />
            신청자 관리 ({event.application_count})
          </Link>
          <a href={`/api/manage/events/${event.id}/applications/export?format=csv`}
            className="btn-outline">
            <Download className="w-4 h-4" />
            CSV
          </a>
        </div>
      )}
    </div>
  )
}
