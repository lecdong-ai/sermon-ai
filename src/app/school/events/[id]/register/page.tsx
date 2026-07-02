'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Check, ChevronRight, AlertCircle } from 'lucide-react'
import { getEventById, createRegistration, setEventUserId } from '@/lib/events/db'
import { EVENT_TYPE_LABELS, type Event } from '@/types/event'

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
}

const initialForm: FormData = {
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
}

export default function RegisterPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getEventById(id).then(data => {
      if (!data) { router.push('/school/events'); return }
      if (data.status !== 'open') { router.push(`/school/events/${id}`); return }
      setEvent(data)
      setLoading(false)
    })
  }, [id, router])

  const update = (key: keyof FormData, value: any) => setForm(prev => ({ ...prev, [key]: value }))

  const steps = ['기본정보', '보호자 정보', '추가사항', '확인']
  const isStepValid = () => {
    if (step === 0) return form.participantName && form.grade && form.gender && form.birth
    if (step === 1) return form.parentName && form.parentPhone && form.emergencyContact
    if (step === 2) return form.privacyConsent && form.photoConsent
    return true
  }

  const handleSubmit = async () => {
    if (!event) return
    setSubmitting(true)
    setError('')
    try {
      const userId = 'user_' + Date.now().toString(36)
      setEventUserId(userId)
      await createRegistration({
        eventId: event.id, userId,
        participantName: form.participantName, grade: form.grade,
        gender: form.gender, birth: form.birth,
        parentName: form.parentName, parentPhone: form.parentPhone,
        address: form.address, emergencyContact: form.emergencyContact,
        allergies: form.allergies, tshirtSize: form.tshirtSize,
        vehicleUsage: form.vehicleUsage || '이용하지 않음',
        friendWith: form.friendWith,
        photoConsent: form.photoConsent, privacyConsent: form.privacyConsent,
        extraFields: {},
        status: event.fee > 0 ? 'pending_payment' : 'confirmed',
        paymentStatus: 'pending', depositorName: '',
        paymentAmount: event.fee, paymentDate: '', adminMemo: '',
        groupId: null, teamId: null, vehicleId: null,
        checkInAt: null, returnCheckAt: null, notes: '',
      })
      router.push(`/school/events/${event.id}/register/complete`)
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !event) {
    return (
      <div className="bg-cs-warm-50 min-h-screen pt-16">
        <div className="container-custom py-8 max-w-lg mx-auto animate-pulse">
          <div className="h-8 bg-cs-warm-200 rounded w-1/2 mb-8" />
          <div className="h-96 bg-cs-warm-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-cs-warm-50 min-h-screen">
      <div className="container-custom py-6 max-w-lg mx-auto">
        <div className="text-center mb-6">
          <p className="text-xs text-cs-navy-500 font-medium">{EVENT_TYPE_LABELS[event.eventType]}</p>
          <h1 className="text-xl font-extrabold text-cs-navy-900 mt-0.5">{event.title}</h1>
          <p className="text-sm text-cs-navy-500 mt-1">참가 신청서</p>
        </div>

        <div className="flex items-center gap-2 mb-6">
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
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-sm mb-4">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <div className="card-flat p-6 bg-white">
          {step === 0 && (
            <div className="space-y-4">
              <p className="font-bold text-cs-navy-900 text-sm">참가자 정보</p>
              <div>
                <label className="block text-xs font-medium text-cs-navy-700 mb-1">이름 *</label>
                <input type="text" value={form.participantName} onChange={e => update('participantName', e.target.value)} className="input-field" placeholder="참가자 이름" />
              </div>
              <div>
                <label className="block text-xs font-medium text-cs-navy-700 mb-1">학년/반/부서 *</label>
                <input type="text" value={form.grade} onChange={e => update('grade', e.target.value)} className="input-field" placeholder="예: 초등3학년, 유치부" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-cs-navy-700 mb-1">성별 *</label>
                  <select value={form.gender} onChange={e => update('gender', e.target.value)} className="select-field">
                    <option value="">선택</option>
                    <option value="남">남</option>
                    <option value="여">여</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-cs-navy-700 mb-1">생년월일 *</label>
                  <input type="date" value={form.birth} onChange={e => update('birth', e.target.value)} className="input-field" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={() => setStep(1)} disabled={!isStepValid()} className="btn-primary btn-sm">
                  다음 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="font-bold text-cs-navy-900 text-sm">보호자 정보</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-cs-navy-700 mb-1">보호자 이름 *</label>
                  <input type="text" value={form.parentName} onChange={e => update('parentName', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-cs-navy-700 mb-1">연락처 *</label>
                  <input type="tel" value={form.parentPhone} onChange={e => update('parentPhone', e.target.value)} className="input-field" placeholder="010-0000-0000" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-cs-navy-700 mb-1">주소</label>
                <input type="text" value={form.address} onChange={e => update('address', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-cs-navy-700 mb-1">비상연락처 *</label>
                <input type="tel" value={form.emergencyContact} onChange={e => update('emergencyContact', e.target.value)} className="input-field" placeholder="010-0000-0000" />
              </div>
              <div className="flex justify-between pt-2">
                <button onClick={() => setStep(0)} className="btn-outline btn-sm">이전</button>
                <button onClick={() => setStep(1)} disabled={!isStepValid()} className="btn-primary btn-sm">다음 <ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="font-bold text-cs-navy-900 text-sm">추가 정보</p>
              <div>
                <label className="block text-xs font-medium text-cs-navy-700 mb-1">알레르기/복용약</label>
                <textarea value={form.allergies} onChange={e => update('allergies', e.target.value)} className="input-field" rows={2} placeholder="해당 사항이 있으면 적어주세요" />
              </div>
              <div>
                <label className="block text-xs font-medium text-cs-navy-700 mb-1">티셔츠 사이즈</label>
                <select value={form.tshirtSize} onChange={e => update('tshirtSize', e.target.value)} className="select-field">
                  <option value="">선택</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="2XL">2XL</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-cs-navy-700 mb-1">차량 이용</label>
                <div className="flex gap-3">
                  {['이용함', '이용하지 않음'].map(opt => (
                    <label key={opt} className="flex items-center gap-1.5 cursor-pointer text-sm">
                      <input type="radio" name="vehicle" value={opt} checked={form.vehicleUsage === opt} onChange={e => update('vehicleUsage', e.target.value)} className="accent-cs-mint-500" />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-cs-navy-700 mb-1">친구 동반 (같이 신청하는 친구 이름)</label>
                <input type="text" value={form.friendWith} onChange={e => update('friendWith', e.target.value)} className="input-field" placeholder="친구 이름" />
              </div>

              <hr className="border-cs-warm-100" />
              <p className="font-bold text-cs-navy-900 text-sm">동의</p>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={form.photoConsent} onChange={e => update('photoConsent', e.target.checked)} className="mt-0.5 accent-cs-mint-500" />
                <span className="text-xs text-cs-navy-700">행사 중 촬영된 사진 및 영상이 교회 홈페이지 및 SNS에 사용되는 것에 동의합니다. *</span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={form.privacyConsent} onChange={e => update('privacyConsent', e.target.checked)} className="mt-0.5 accent-cs-mint-500" />
                <span className="text-xs text-cs-navy-700">개인정보 수집 및 이용에 동의합니다. *</span>
              </label>

              <div className="flex justify-between pt-2">
                <button onClick={() => setStep(1)} className="btn-outline btn-sm">이전</button>
                <button onClick={() => setStep(3)} disabled={!isStepValid()} className="btn-primary btn-sm">다음 <ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="font-bold text-cs-navy-900 text-sm">신청 내용 확인</p>
              <div className="bg-cs-warm-50 rounded-xl p-4 space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-cs-navy-500">이름</span><span className="font-medium">{form.participantName}</span></div>
                <div className="flex justify-between"><span className="text-cs-navy-500">학년/부서</span><span className="font-medium">{form.grade}</span></div>
                <div className="flex justify-between"><span className="text-cs-navy-500">보호자</span><span className="font-medium">{form.parentName} ({form.parentPhone})</span></div>
                {form.allergies && <div className="flex justify-between"><span className="text-cs-navy-500">알레르기</span><span className="font-medium">{form.allergies}</span></div>}
                <div className="flex justify-between"><span className="text-cs-navy-500">차량</span><span className="font-medium">{form.vehicleUsage || '이용하지 않음'}</span></div>
              </div>

              {event.fee > 0 && (
                <div className="bg-cs-orange-50 rounded-xl p-4 border border-cs-orange-200 text-xs">
                  <p className="font-bold text-cs-orange-800 mb-1">참가비: ₩{event.fee.toLocaleString()}</p>
                  <p className="text-cs-orange-700">입금계좌: {event.bankAccountInfo}</p>
                  <p className="text-cs-orange-600 mt-1">※ 입금 확인 후 신청이 확정됩니다.</p>
                </div>
              )}

              <p className="text-xs text-cs-navy-500 text-center pt-2">신청 후 내용을 수정하려면 교회로 연락주세요.</p>

              <div className="flex justify-between pt-2">
                <button onClick={() => setStep(2)} className="btn-outline btn-sm">이전</button>
                <button onClick={handleSubmit} disabled={submitting} className="btn-primary btn-sm">
                  {submitting ? '처리중...' : '신청 제출하기'}
                </button>
              </div>
            </div>
          )}
        </div>

        {event.fee === 0 && (
          <p className="text-xs text-cs-mint-600 text-center mt-4 font-medium">
            무료 행사입니다. 신청 즉시 참가가 확정됩니다.
          </p>
        )}
      </div>
    </div>
  )
}
