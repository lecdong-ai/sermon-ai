'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, ChevronRight, AlertCircle } from 'lucide-react'
import { getEventById, createRegistration, setEventUserId } from '@/lib/events/db'
import { EVENT_TYPE_LABELS, DEFAULT_FORM_FIELDS, type Event, type FormFieldConfig } from '@/types/event'

interface FormData {
  participantName: string
  grade: string
  gender: string
  birth: string
  parentName: string
  parentPhone: string
  address: string
  emergencyContact: string
  allergies: string
  tshirtSize: string
  vehicleUsage: string
  friendWith: string
  photoConsent: boolean
  privacyConsent: boolean
  extraFields: Record<string, string>
}

const initialFormData: FormData = {
  participantName: '',
  grade: '',
  gender: '',
  birth: '',
  parentName: '',
  parentPhone: '',
  address: '',
  emergencyContact: '',
  allergies: '',
  tshirtSize: '',
  vehicleUsage: '',
  friendWith: '',
  photoConsent: false,
  privacyConsent: false,
  extraFields: {},
}

export default function RegisterPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(initialFormData)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getEventById(id).then(data => {
      if (!data) {
        router.push('/school/events')
        return
      }
      if (data.status !== 'open') {
        router.push(`/school/events/${id}`)
        return
      }
      setEvent(data)
      setLoading(false)
    })
  }, [id, router])

  const updateField = (key: keyof FormData, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const isStepValid = () => {
    if (step === 0) {
      return form.participantName && form.grade && form.gender && form.birth
    }
    if (step === 1) {
      return form.parentName && form.parentPhone && form.emergencyContact
    }
    if (step === 2) {
      return form.privacyConsent && form.photoConsent
    }
    return true
  }

  const nextStep = () => setStep(s => Math.min(s + 1, 3))
  const prevStep = () => setStep(s => Math.max(s - 1, 0))

  const handleSubmit = async () => {
    if (!event) return
    setSubmitting(true)
    setError('')

    try {
      const userId = 'user_' + Date.now().toString(36)
      setEventUserId(userId)

      await createRegistration({
        eventId: event.id,
        userId,
        participantName: form.participantName,
        grade: form.grade,
        gender: form.gender,
        birth: form.birth,
        parentName: form.parentName,
        parentPhone: form.parentPhone,
        address: form.address,
        emergencyContact: form.emergencyContact,
        allergies: form.allergies,
        tshirtSize: form.tshirtSize,
        vehicleUsage: form.vehicleUsage || '이용하지 않음',
        friendWith: form.friendWith,
        photoConsent: form.photoConsent,
        privacyConsent: form.privacyConsent,
        extraFields: form.extraFields,
        status: event.fee > 0 ? 'pending_payment' : 'confirmed',
        paymentStatus: 'pending',
        depositorName: '',
        paymentAmount: event.fee,
        paymentDate: '',
        adminMemo: '',
        groupId: null,
        teamId: null,
        vehicleId: null,
        checkInAt: null,
        returnCheckAt: null,
        notes: '',
      })

      router.push(`/school/events/${event.id}/register/complete`)
    } catch (err: any) {
      setError(err.message || '신청 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !event) {
    return (
      <div className="bg-cs-warm-50 min-h-screen pt-16">
        <div className="container-custom py-8 animate-pulse">
          <div className="h-6 bg-cs-warm-200 rounded w-40 mb-6" />
          <div className="h-8 bg-cs-warm-200 rounded w-1/2 mb-8" />
          <div className="h-96 bg-cs-warm-200 rounded" />
        </div>
      </div>
    )
  }

  const steps = ['기본정보', '보호자 정보', '추가사항/동의', '확인']

  return (
    <div className="bg-cs-warm-50 min-h-screen">
      <div className="container-custom py-6 max-w-2xl mx-auto">
        <Link href={`/school/events/${event.id}`} className="inline-flex items-center gap-1.5 text-sm text-cs-navy-500 hover:text-cs-navy-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> 행사 상세
        </Link>

        <div className="card-flat p-6 md:p-8 bg-white">
          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-extrabold text-cs-navy-900">{event.title}</h1>
            <p className="text-sm text-cs-navy-500 mt-1">{EVENT_TYPE_LABELS[event.eventType]} · 참가 신청</p>
          </div>

          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === step ? 'bg-cs-mint-500 text-white' : i < step ? 'bg-cs-mint-100 text-cs-mint-700' : 'bg-cs-warm-100 text-cs-navy-400'
                }`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs font-medium ${i === step ? 'text-cs-mint-700' : 'text-cs-navy-400'}`}>{s}</span>
                {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-cs-mint-300' : 'bg-cs-warm-200'}`} />}
              </div>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-sm mb-6">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-bold text-cs-navy-900">참가자 기본정보</h2>
              <div>
                <label className="block text-sm font-medium text-cs-navy-700 mb-1">이름 *</label>
                <input type="text" value={form.participantName} onChange={e => updateField('participantName', e.target.value)} className="input-field" placeholder="참가자 이름" />
              </div>
              <div>
                <label className="block text-sm font-medium text-cs-navy-700 mb-1">학년/반/부서 *</label>
                <input type="text" value={form.grade} onChange={e => updateField('grade', e.target.value)} className="input-field" placeholder="예: 초등3학년, 유치부" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cs-navy-700 mb-1">성별 *</label>
                  <select value={form.gender} onChange={e => updateField('gender', e.target.value)} className="select-field">
                    <option value="">선택</option>
                    <option value="남">남</option>
                    <option value="여">여</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-cs-navy-700 mb-1">생년월일 *</label>
                  <input type="date" value={form.birth} onChange={e => updateField('birth', e.target.value)} className="input-field" />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button onClick={nextStep} disabled={!isStepValid()} className="btn-primary">
                  다음 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-bold text-cs-navy-900">보호자 정보</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cs-navy-700 mb-1">보호자 이름 *</label>
                  <input type="text" value={form.parentName} onChange={e => updateField('parentName', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cs-navy-700 mb-1">보호자 연락처 *</label>
                  <input type="tel" value={form.parentPhone} onChange={e => updateField('parentPhone', e.target.value)} className="input-field" placeholder="010-0000-0000" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-cs-navy-700 mb-1">주소</label>
                <input type="text" value={form.address} onChange={e => updateField('address', e.target.value)} className="input-field" placeholder="주소" />
              </div>
              <div>
                <label className="block text-sm font-medium text-cs-navy-700 mb-1">비상연락처 *</label>
                <input type="tel" value={form.emergencyContact} onChange={e => updateField('emergencyContact', e.target.value)} className="input-field" placeholder="010-0000-0000" />
              </div>
              <div className="flex justify-between pt-4">
                <button onClick={prevStep} className="btn-outline">이전</button>
                <button onClick={nextStep} disabled={!isStepValid()} className="btn-primary">
                  다음 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-bold text-cs-navy-900">추가사항</h2>
              <div>
                <label className="block text-sm font-medium text-cs-navy-700 mb-1">알레르기/복용약</label>
                <textarea value={form.allergies} onChange={e => updateField('allergies', e.target.value)} className="input-field" rows={2} placeholder="알레르기나 복용 중인 약이 있으면 적어주세요" />
              </div>
              <div>
                <label className="block text-sm font-medium text-cs-navy-700 mb-1">티셔츠 사이즈</label>
                <select value={form.tshirtSize} onChange={e => updateField('tshirtSize', e.target.value)} className="select-field">
                  <option value="">선택</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="2XL">2XL</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-cs-navy-700 mb-1">차량 이용</label>
                <div className="flex gap-3">
                  {['이용함', '이용하지 않음'].map(opt => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="vehicle" value={opt} checked={form.vehicleUsage === opt} onChange={e => updateField('vehicleUsage', e.target.value)} className="accent-cs-mint-500" />
                      <span className="text-sm text-cs-navy-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-cs-navy-700 mb-1">친구 동반 (같이 신청하는 친구 이름)</label>
                <input type="text" value={form.friendWith} onChange={e => updateField('friendWith', e.target.value)} className="input-field" placeholder="친구 이름" />
              </div>

              <hr className="border-cs-warm-200" />
              <h2 className="font-bold text-cs-navy-900">동의사항</h2>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.photoConsent} onChange={e => updateField('photoConsent', e.target.checked)} className="mt-1 accent-cs-mint-500" />
                <span className="text-sm text-cs-navy-700">행사 중 촬영된 사진 및 영상이 교회 홈페이지 및 SNS에 사용되는 것에 동의합니다. *</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.privacyConsent} onChange={e => updateField('privacyConsent', e.target.checked)} className="mt-1 accent-cs-mint-500" />
                <span className="text-sm text-cs-navy-700">개인정보 수집 및 이용에 동의합니다. (이름, 연락처, 생년월일 등) *</span>
              </label>

              <div className="flex justify-between pt-4">
                <button onClick={prevStep} className="btn-outline">이전</button>
                <button onClick={nextStep} disabled={!isStepValid()} className="btn-primary">
                  다음 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-bold text-cs-navy-900">신청 내용 확인</h2>
              <div className="bg-cs-warm-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-cs-navy-500">이름</span><span className="font-medium text-cs-navy-900">{form.participantName}</span></div>
                <div className="flex justify-between"><span className="text-cs-navy-500">학년/반/부서</span><span className="font-medium text-cs-navy-900">{form.grade}</span></div>
                <div className="flex justify-between"><span className="text-cs-navy-500">성별</span><span className="font-medium text-cs-navy-900">{form.gender}</span></div>
                <div className="flex justify-between"><span className="text-cs-navy-500">생년월일</span><span className="font-medium text-cs-navy-900">{form.birth}</span></div>
                <div className="flex justify-between"><span className="text-cs-navy-500">보호자</span><span className="font-medium text-cs-navy-900">{form.parentName} ({form.parentPhone})</span></div>
                <div className="flex justify-between"><span className="text-cs-navy-500">비상연락처</span><span className="font-medium text-cs-navy-900">{form.emergencyContact}</span></div>
                {form.allergies && <div className="flex justify-between"><span className="text-cs-navy-500">알레르기</span><span className="font-medium text-cs-navy-900">{form.allergies}</span></div>}
                <div className="flex justify-between"><span className="text-cs-navy-500">차량 이용</span><span className="font-medium text-cs-navy-900">{form.vehicleUsage || '이용하지 않음'}</span></div>
              </div>

              {event.fee > 0 && (
                <div className="bg-cs-orange-50 rounded-xl p-4 border border-cs-orange-200">
                  <p className="text-sm font-bold text-cs-orange-800">참가비: ₩{event.fee.toLocaleString()}</p>
                  <p className="text-xs text-cs-orange-700 mt-1">입금계좌: {event.bankAccountInfo}</p>
                  <p className="text-xs text-cs-orange-600 mt-1">※ 입금 확인 후 신청이 확정됩니다.</p>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button onClick={prevStep} className="btn-outline">이전</button>
                <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
                  {submitting ? '처리중...' : '신청 제출하기'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
