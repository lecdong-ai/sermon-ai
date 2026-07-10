'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Calendar, User, Heart, Shield, CheckCircle2, Clock, FileText } from 'lucide-react'
import { ApplicationRecord, ApplicationStatus, STATUS_LABELS, STATUS_COLORS, PaymentStatus } from '@/types/school/event'

export default function ApplicationDetailPage() {
  const params = useParams()
  const eventId = params.id as string
  const aid = params.aid as string

  const [app, setApp] = useState<(ApplicationRecord & { events?: { title: string } }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [event, setEvent] = useState<{ title: string; custom_fields: { id: string; label: string }[] } | null>(null)

  useEffect(() => {
    fetch(`/school/api/manage/events/${eventId}/applications/${aid}`)
      .then(r => r.json())
      .then(data => {
        if (data.application) setApp(data.application)
        setLoading(false)
      })
    fetch(`/school/api/manage/events/${eventId}`)
      .then(r => r.json())
      .then(data => { if (data.event) setEvent({ title: data.event.title, custom_fields: data.event.custom_fields }) })
  }, [eventId, aid])

  const handleStatusChange = async (field: 'status' | 'payment_status', value: ApplicationStatus | PaymentStatus) => {
    const res = await fetch(`/school/api/manage/events/${eventId}/applications/${aid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    })
    const data = await res.json()
    if (data.application) setApp(data.application)
  }

  const handleCheckinToggle = async () => {
    const newVal = app?.check_in_status === 'checked_in' ? 'not_checked_in' : 'checked_in'
    const res = await fetch(`/school/api/manage/events/${eventId}/applications/${aid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ check_in_status: newVal }),
    })
    const data = await res.json()
    if (data.application) setApp(data.application)
  }

  if (loading) return <div className="container-custom py-20 text-center text-navy-400">불러오는 중...</div>
  if (!app) return <div className="container-custom py-20 text-center text-navy-400">신청자를 찾을 수 없습니다.</div>

  const InfoRow = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <div className="flex gap-4 py-2.5 border-b border-warm-100 last:border-0">
      <span className="text-sm text-navy-400 w-28 flex-shrink-0">{label}</span>
      <span className="text-sm text-navy-800 flex-1">{value || '-'}</span>
    </div>
  )

  return (
    <div className="container-custom py-8 max-w-2xl">
      <Link href={`/events/manage/${eventId}/applications`}
        className="inline-flex items-center gap-1 text-navy-500 hover:text-navy-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> 신청자 목록으로
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-navy-900">{app.student_name}</h1>
        <span className={`badge ${STATUS_COLORS[app.status]}`}>{STATUS_LABELS[app.status]}</span>
        {app.check_in_status === 'checked_in' && (
          <span className="badge bg-mint-50 text-mint-700 border border-mint-200">
            <CheckCircle2 className="w-3 h-3 mr-1" /> 체크인 완료
          </span>
        )}
      </div>

      {/* Status Controls */}
      <div className="card-flat p-5 mb-6">
        <h2 className="text-sm font-bold text-navy-900 mb-4">상태 관리</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-navy-400 mb-1.5">신청 상태</label>
            <select value={app.status} onChange={e => handleStatusChange('status', e.target.value as ApplicationStatus)}
              className="w-full px-3 py-2.5 rounded-xl border border-warm-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-mint-400">
              <option value="submitted">신청완료</option>
              <option value="confirmed">확정</option>
              <option value="waiting_deposit">입금대기</option>
              <option value="deposited">입금완료</option>
              <option value="cancelled">취소</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-navy-400 mb-1.5">입금 상태</label>
            <select value={app.payment_status} onChange={e => handleStatusChange('payment_status', e.target.value as PaymentStatus)}
              className="w-full px-3 py-2.5 rounded-xl border border-warm-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-mint-400">
              <option value="pending">대기</option>
              <option value="waiting_deposit">입금대기</option>
              <option value="deposited">입금완료</option>
              <option value="cancelled">취소</option>
            </select>
          </div>
        </div>
        <button onClick={handleCheckinToggle}
          className={`w-full mt-4 py-3 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 ${app.check_in_status === 'checked_in' ? 'bg-mint-100 text-mint-700' : 'bg-navy-900 text-white hover:bg-navy-800'}`}>
          <CheckCircle2 className="w-5 h-5" />
          {app.check_in_status === 'checked_in' ? '체크인 취소' : '체크인 처리'}
        </button>
      </div>

      {/* Student Info */}
      <div className="card-flat p-5 mb-4">
        <h2 className="text-sm font-bold text-navy-900 mb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-navy-500" /> 학생 정보
        </h2>
        <InfoRow label="이름" value={app.student_name} />
        <InfoRow label="학년" value={app.grade} />
        <InfoRow label="부서" value={app.department} />
        <InfoRow label="생년월일" value={app.birth_date} />
        <InfoRow label="성별" value={app.gender === 'male' ? '남자' : '여자'} />
      </div>

      {/* Parent Info */}
      <div className="card-flat p-5 mb-4">
        <h2 className="text-sm font-bold text-navy-900 mb-3 flex items-center gap-2">
          <Phone className="w-4 h-4 text-navy-500" /> 보호자 정보
        </h2>
        <InfoRow label="보호자 이름" value={app.parent_name} />
        <div className="flex gap-4 py-2.5 border-b border-warm-100 last:border-0">
          <span className="text-sm text-navy-400 w-28 flex-shrink-0">보호자 연락처</span>
          <a href={`tel:${app.parent_phone}`} className="text-sm text-navy-800 flex-1 hover:text-navy-600 underline">{app.parent_phone}</a>
        </div>
        <div className="flex gap-4 py-2.5 border-b border-warm-100 last:border-0">
          <span className="text-sm text-navy-400 w-28 flex-shrink-0">비상연락처</span>
          {app.emergency_phone ? (
            <a href={`tel:${app.emergency_phone}`} className="text-sm text-navy-800 flex-1 hover:text-navy-600 underline">{app.emergency_phone}</a>
          ) : (
            <span className="text-sm text-navy-800 flex-1">-</span>
          )}
        </div>
      </div>

      {/* Health Info */}
      <div className="card-flat p-5 mb-4">
        <h2 className="text-sm font-bold text-navy-900 mb-3 flex items-center gap-2">
          <Heart className="w-4 h-4 text-navy-500" /> 건강 정보
        </h2>
        <InfoRow label="건강 특이사항" value={app.health_notes} />
        <InfoRow label="알레르기" value={app.allergies} />
      </div>

      {/* Custom Responses */}
      {event?.custom_fields && event.custom_fields.length > 0 && (
        <div className="card-flat p-5 mb-4">
          <h2 className="text-sm font-bold text-navy-900 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-navy-500" /> 추가 정보
          </h2>
          {event.custom_fields.map((field) => (
            <InfoRow key={field.id} label={field.label} value={app.custom_responses?.[field.id]} />
          ))}
        </div>
      )}

      {/* Consent */}
      <div className="card-flat p-5 mb-4">
        <h2 className="text-sm font-bold text-navy-900 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-navy-500" /> 동의 내역
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-mint-50 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-mint-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-navy-800">개인정보 수집·이용 동의</p>
              <p className="text-xs text-navy-500 mt-1">{app.privacy_consent_text}</p>
              <p className="text-xs text-navy-400 mt-1">동의일시: {app.privacy_consented_at ? new Date(app.privacy_consented_at).toLocaleString('ko-KR') : '-'}</p>
            </div>
          </div>
          <div className={`flex items-start gap-3 p-3 rounded-xl ${app.photo_consent ? 'bg-mint-50' : 'bg-warm-50'}`}>
            {app.photo_consent ? <CheckCircle2 className="w-5 h-5 text-mint-600 flex-shrink-0 mt-0.5" /> : <div className="w-5 h-5 rounded-full border-2 border-warm-300 flex-shrink-0 mt-0.5" />}
            <div>
              <p className="text-sm font-medium text-navy-800">사진·영상 촬영 동의 {app.photo_consent ? '(동의)' : '(미동의)'}</p>
              {app.photo_consent_text && <p className="text-xs text-navy-500 mt-1">{app.photo_consent_text}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="card-flat p-5">
        <h2 className="text-sm font-bold text-navy-900 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-navy-500" /> 신청 정보
        </h2>
        <InfoRow label="신청일시" value={new Date(app.created_at).toLocaleString('ko-KR')} />
        {app.check_in_at && <InfoRow label="체크인 일시" value={new Date(app.check_in_at).toLocaleString('ko-KR')} />}
      </div>
    </div>
  )
}
