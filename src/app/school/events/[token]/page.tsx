'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin, Users, Clock, AlertCircle, CheckCircle2, Phone, User, Heart, Shield } from 'lucide-react'
import { EventRecord, ApplicationInput, CustomField } from '@/types/school/event'

export default function EventApplyPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [event, setEvent] = useState<(EventRecord & { application_count: number; is_expired: boolean; is_full: boolean }) | null>(null)
  const [consentTexts, setConsentTexts] = useState<{ privacy: string; photo: string }>({ privacy: '', photo: '' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [siblingData, setSiblingData] = useState<Record<string, string> | null>(null)
  const [showSiblingPrompt, setShowSiblingPrompt] = useState(false)

  const [form, setForm] = useState<ApplicationInput>({
    student_name: '', grade: '', department: '', birth_date: '',
    gender: 'male', parent_name: '', parent_phone: '', emergency_phone: '',
    health_notes: '', allergies: '', privacy_consent: false, photo_consent: false,
    custom_responses: {},
  })

  useEffect(() => {
    fetch(`/school/api/events/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); setLoading(false); return }
        setEvent(data.event)
        setConsentTexts(data.consent_texts)
        setLoading(false)
      })
      .catch(() => { setError('행사 정보를 불러올 수 없습니다.'); setLoading(false) })
  }, [token])

  const checkSibling = async (phone: string) => {
    if (phone.length < 8) return
    const res = await fetch(`/school/api/events/${token}/check?phone=${encodeURIComponent(phone)}`)
    const data = await res.json()
    if (data.sibling) {
      setSiblingData(data.sibling)
      setShowSiblingPrompt(true)
    }
  }

  const applySibling = () => {
    if (!siblingData) return
    setForm(prev => ({
      ...prev,
      parent_name: siblingData.parent_name || prev.parent_name,
      emergency_phone: siblingData.emergency_phone || prev.emergency_phone,
      health_notes: siblingData.health_notes || prev.health_notes,
      allergies: siblingData.allergies || prev.allergies,
    }))
    setShowSiblingPrompt(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (event?.is_expired) { setError('신청 마감일이 지났습니다.'); return }
    if (event?.is_full) { setError('정원이 마감되었습니다.'); return }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch(`/school/api/events/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setSubmitting(false); return }
      router.push(`/events/${token}/complete?aid=${data.application.id}`)
    } catch {
      setError('신청 중 오류가 발생했습니다. 다시 시도해주세요.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-navy-50 to-white">
        <div className="text-navy-400">불러오는 중...</div>
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-navy-50 to-white px-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-navy-700 font-medium mb-4">{error}</p>
          <Link href="/school/" className="text-navy-500 underline">홈으로</Link>
        </div>
      </div>
    )
  }

  if (!event) return null

  const isClosed = event.status !== 'open' || event.is_expired || event.is_full

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-50/50 to-white">
      {/* Mini Header */}
      <div className="bg-white border-b border-warm-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/school/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-navy-800 to-navy-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">교</span>
            </div>
            <span className="text-sm font-bold text-navy-900">교회학교</span>
          </Link>
          <span className="text-xs text-navy-400">행사 신청</span>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Event Info Card */}
        <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden mb-6">
          {event.start_date && (
            <div className="bg-gradient-to-r from-navy-800 to-navy-600 px-5 py-4 text-white">
              <div className="text-sm opacity-80 mb-1">
                {new Date(event.start_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                {event.end_date && ` ~ ${new Date(event.end_date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}`}
              </div>
              <div className="text-xs opacity-70">
                {new Date(event.start_date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                {event.end_date && ` - ${new Date(event.end_date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`}
              </div>
            </div>
          )}
          <div className="p-5">
            <h1 className="text-xl font-bold text-navy-900 mb-3">{event.title}</h1>
            {event.description && (
              <p className="text-sm text-navy-600 mb-4 whitespace-pre-wrap">{event.description}</p>
            )}
            <div className="space-y-2 text-sm">
              {event.location && (
                <div className="flex items-center gap-2 text-navy-600">
                  <MapPin className="w-4 h-4 text-navy-400 flex-shrink-0" />
                  <span>{event.location}</span>
                </div>
              )}
              {event.deadline && (
                <div className="flex items-center gap-2 text-navy-600">
                  <Clock className="w-4 h-4 text-navy-400 flex-shrink-0" />
                  <span>신청 마감: {new Date(event.deadline).toLocaleDateString('ko-KR')} {new Date(event.deadline).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
              {event.capacity && (
                <div className="flex items-center gap-2 text-navy-600">
                  <Users className="w-4 h-4 text-navy-400 flex-shrink-0" />
                  <span>정원 {event.capacity}명 (현재 {event.application_count}명 신청)</span>
                </div>
              )}
            </div>

            {isClosed && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-700">
                  {event.is_full ? '정원이 마감되었습니다.' : event.is_expired ? '신청 마감일이 지났습니다.' : '현재 신청을 받지 않는 행사입니다.'}
                </span>
              </div>
            )}
          </div>
        </div>

        {showSiblingPrompt && siblingData && (
          <div className="bg-mint-50 border border-mint-200 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-mint-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-mint-800 mb-2">
                  같은 연락처로 이전 신청 내역이 있습니다.
                </p>
                <p className="text-xs text-mint-700 mb-3">
                  보호자 정보를 자동으로 불러올까요?
                </p>
                <div className="flex gap-2">
                  <button onClick={applySibling} className="px-4 py-2 bg-mint-600 text-white text-sm font-medium rounded-lg hover:bg-mint-700 transition-colors">
                    네, 불러오기
                  </button>
                  <button onClick={() => setShowSiblingPrompt(false)} className="px-4 py-2 bg-white text-mint-700 text-sm font-medium rounded-lg border border-mint-300 hover:bg-mint-50 transition-colors">
                    아니요
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white rounded-2xl border border-warm-200 p-5">
            <h2 className="text-base font-bold text-navy-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-navy-500" />
              학생 정보
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">학생 이름 <span className="text-red-500">*</span></label>
                <input
                  type="text" required value={form.student_name}
                  onChange={e => setForm({ ...form, student_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-mint-400 transition-all"
                  placeholder="홍길동"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1.5">학년 <span className="text-red-500">*</span></label>
                  <select required value={form.grade}
                    onChange={e => setForm({ ...form, grade: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-mint-400 transition-all">
                    <option value="">선택</option>
                    <option>유치부</option><option>유초등부</option><option>초등부</option>
                    <option>중등부</option><option>고등부</option><option>청년부</option>
                    <option>기타</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1.5">부서</label>
                  <input type="text" value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-mint-400 transition-all"
                    placeholder="예: 1학년" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">생년월일 <span className="text-red-500">*</span></label>
                <input type="date" required value={form.birth_date}
                  onChange={e => setForm({ ...form, birth_date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-mint-400 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">성별 <span className="text-red-500">*</span></label>
                <div className="flex gap-3">
                  <label className={`flex-1 px-4 py-3 rounded-xl border-2 text-center cursor-pointer transition-all ${form.gender === 'male' ? 'border-navy-600 bg-navy-50 text-navy-800 font-semibold' : 'border-warm-200 text-navy-500'}`}>
                    <input type="radio" name="gender" value="male" checked={form.gender === 'male'}
                      onChange={() => setForm({ ...form, gender: 'male' })} className="sr-only" />
                    남자
                  </label>
                  <label className={`flex-1 px-4 py-3 rounded-xl border-2 text-center cursor-pointer transition-all ${form.gender === 'female' ? 'border-navy-600 bg-navy-50 text-navy-800 font-semibold' : 'border-warm-200 text-navy-500'}`}>
                    <input type="radio" name="gender" value="female" checked={form.gender === 'female'}
                      onChange={() => setForm({ ...form, gender: 'female' })} className="sr-only" />
                    여자
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-warm-200 p-5">
            <h2 className="text-base font-bold text-navy-900 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-navy-500" />
              보호자 정보
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">보호자 이름 <span className="text-red-500">*</span></label>
                <input type="text" required value={form.parent_name}
                  onChange={e => setForm({ ...form, parent_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-mint-400 transition-all"
                  placeholder="홍부모" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">보호자 연락처 <span className="text-red-500">*</span></label>
                <input type="tel" required value={form.parent_phone}
                  onChange={e => {
                    setForm({ ...form, parent_phone: e.target.value })
                    if (e.target.value.length >= 8) checkSibling(e.target.value)
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-mint-400 transition-all"
                  placeholder="010-1234-5678" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">비상연락처</label>
                <input type="tel" value={form.emergency_phone}
                  onChange={e => setForm({ ...form, emergency_phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-mint-400 transition-all"
                  placeholder="010-0000-0000" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-warm-200 p-5">
            <h2 className="text-base font-bold text-navy-900 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-navy-500" />
              건강 정보
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">건강 특이사항</label>
                <textarea value={form.health_notes}
                  onChange={e => setForm({ ...form, health_notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-mint-400 transition-all resize-none"
                  placeholder="질병, 상처 등 (없으면 비워두세요)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">알레르기</label>
                <textarea value={form.allergies}
                  onChange={e => setForm({ ...form, allergies: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-mint-400 transition-all resize-none"
                  placeholder="음식, 약물 등 (없으면 비워두세요)" />
              </div>
            </div>
          </div>

          {/* Custom Fields */}
          {event.custom_fields && event.custom_fields.length > 0 && (
            <div className="bg-white rounded-2xl border border-warm-200 p-5">
              <h2 className="text-base font-bold text-navy-900 mb-4">추가 정보</h2>
              <div className="space-y-4">
                {event.custom_fields.map((field: CustomField) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-navy-700 mb-1.5">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <input type="text" required={field.required}
                      value={form.custom_responses?.[field.id] || ''}
                      onChange={e => setForm({
                        ...form,
                        custom_responses: { ...form.custom_responses, [field.id]: e.target.value }
                      })}
                      className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-mint-400 transition-all"
                      placeholder={field.placeholder || ''} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Consent */}
          <div className="bg-white rounded-2xl border border-warm-200 p-5">
            <h2 className="text-base font-bold text-navy-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-navy-500" />
              동의
            </h2>
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" required checked={form.privacy_consent}
                  onChange={e => setForm({ ...form, privacy_consent: e.target.checked })}
                  className="mt-1 w-5 h-5 rounded border-warm-300 text-navy-600 focus:ring-mint-400 flex-shrink-0" />
                <div>
                  <span className="text-sm font-medium text-navy-700">개인정보 수집·이용 동의 <span className="text-red-500">*</span></span>
                  <p className="text-xs text-navy-500 mt-1 leading-relaxed">{consentTexts.privacy}</p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.photo_consent}
                  onChange={e => setForm({ ...form, photo_consent: e.target.checked })}
                  className="mt-1 w-5 h-5 rounded border-warm-300 text-navy-600 focus:ring-mint-400 flex-shrink-0" />
                <div>
                  <span className="text-sm font-medium text-navy-700">사진·영상 촬영 동의 (선택)</span>
                  <p className="text-xs text-navy-500 mt-1 leading-relaxed">{consentTexts.photo}</p>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <button type="submit" disabled={submitting || isClosed}
            className="w-full py-4 bg-navy-900 text-white font-bold rounded-xl shadow-button hover:bg-navy-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg">
            {submitting ? '신청 중...' : isClosed ? '신청 불가' : '신청하기'}
          </button>
        </form>

        {event.contact_info && (
          <div className="mt-6 text-center text-sm text-navy-400">
            <p>문의: {event.contact_info}</p>
          </div>
        )}
      </div>
    </div>
  )
}
