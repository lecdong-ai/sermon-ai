'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, Check } from 'lucide-react'
import { createEvent } from '@/lib/events/db'
import { EVENT_TYPE_LABELS, DEFAULT_FORM_FIELDS, type EventType, type FormFieldConfig } from '@/types/event'

export default function CreateEventPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    eventType: 'summer_bible' as EventType,
    description: '',
    location: '',
    targetDescription: '',
    fee: 0,
    bankAccountInfo: '',
    maxParticipants: 100,
    registrationStart: '',
    registrationEnd: '',
    eventStart: '',
    eventEnd: '',
    formFields: DEFAULT_FORM_FIELDS,
  })

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }))

  const toggleField = (key: string) => {
    setForm(prev => ({
      ...prev,
      formFields: prev.formFields.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f),
    }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const event = await createEvent({
        title: form.title,
        eventType: form.eventType,
        description: form.description,
        location: form.location,
        targetDescription: form.targetDescription,
        fee: form.fee,
        bankAccountInfo: form.bankAccountInfo,
        maxParticipants: form.maxParticipants,
        registrationStart: form.registrationStart,
        registrationEnd: form.registrationEnd,
        eventStart: form.eventStart,
        eventEnd: form.eventEnd,
        status: 'draft',
        formFields: form.formFields.filter(f => f.enabled),
        createdBy: 'admin',
      })
      router.push(`/school/events/manage/${event.id}`)
    } catch (err) {
      alert('행사 생성 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const steps = ['기본정보', '일정/비용', '신청항목', '확인']

  return (
    <div className="bg-cs-warm-50 min-h-screen">
      <div className="container-custom py-6 max-w-2xl mx-auto">
        <Link href="/school/events/manage" className="inline-flex items-center gap-1.5 text-sm text-cs-navy-500 hover:text-cs-navy-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> 행사 관리
        </Link>

        <div className="card-flat p-6 md:p-8 bg-white">
          <h1 className="text-xl font-extrabold text-cs-navy-900 mb-6">새 행사 만들기</h1>

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

          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-cs-navy-700 mb-1">행사명 *</label>
                <input type="text" value={form.title} onChange={e => update('title', e.target.value)} className="input-field" placeholder="예: 2026 여름성경학교" />
              </div>
              <div>
                <label className="block text-sm font-medium text-cs-navy-700 mb-1">행사 유형 *</label>
                <select value={form.eventType} onChange={e => update('eventType', e.target.value)} className="select-field">
                  {(Object.entries(EVENT_TYPE_LABELS) as [EventType, string][]).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-cs-navy-700 mb-1">행사 설명</label>
                <textarea value={form.description} onChange={e => update('description', e.target.value)} className="input-field" rows={4} placeholder="행사에 대한 상세 설명을 입력하세요" />
              </div>
              <div>
                <label className="block text-sm font-medium text-cs-navy-700 mb-1">장소</label>
                <input type="text" value={form.location} onChange={e => update('location', e.target.value)} className="input-field" placeholder="예: 본 교회 교육관" />
              </div>
              <div>
                <label className="block text-sm font-medium text-cs-navy-700 mb-1">대상 설명</label>
                <input type="text" value={form.targetDescription} onChange={e => update('targetDescription', e.target.value)} className="input-field" placeholder="예: 유치부 ~ 초등 6학년" />
              </div>
              <div className="flex justify-end pt-4">
                <button onClick={() => setStep(1)} disabled={!form.title} className="btn-primary">
                  다음 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cs-navy-700 mb-1">행사 시작일 *</label>
                  <input type="date" value={form.eventStart} onChange={e => update('eventStart', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cs-navy-700 mb-1">행사 종료일 *</label>
                  <input type="date" value={form.eventEnd} onChange={e => update('eventEnd', e.target.value)} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cs-navy-700 mb-1">접수 시작일 *</label>
                  <input type="date" value={form.registrationStart} onChange={e => update('registrationStart', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cs-navy-700 mb-1">접수 마감일 *</label>
                  <input type="date" value={form.registrationEnd} onChange={e => update('registrationEnd', e.target.value)} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-cs-navy-700 mb-1">정원</label>
                <input type="number" value={form.maxParticipants} onChange={e => update('maxParticipants', Number(e.target.value))} className="input-field" min={1} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cs-navy-700 mb-1">참가비 (0 = 무료)</label>
                  <input type="number" value={form.fee} onChange={e => update('fee', Number(e.target.value))} className="input-field" min={0} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cs-navy-700 mb-1">입금계좌 정보</label>
                  <input type="text" value={form.bankAccountInfo} onChange={e => update('bankAccountInfo', e.target.value)} className="input-field" placeholder="은행 계좌번호" disabled={form.fee === 0} />
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(0)} className="btn-outline">이전</button>
                <button onClick={() => setStep(2)} className="btn-primary">다음 <ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-cs-navy-500">신청서에 포함할 항목을 선택하세요.</p>
              <div className="space-y-2">
                {DEFAULT_FORM_FIELDS.map(field => (
                  <label key={field.key} className="flex items-center justify-between p-3 rounded-lg border border-cs-warm-200 cursor-pointer hover:bg-cs-warm-50">
                    <div>
                      <span className="text-sm font-medium text-cs-navy-700">{field.label}</span>
                      <span className="text-[10px] text-cs-navy-400 ml-2">{field.required ? '필수' : '선택'}</span>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-colors ${field.enabled ? 'bg-cs-mint-500' : 'bg-cs-warm-300'} relative`} onClick={() => toggleField(field.key)}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${field.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(1)} className="btn-outline">이전</button>
                <button onClick={() => setStep(3)} className="btn-primary">다음 <ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-bold text-cs-navy-900">행사 정보 확인</h2>
              <div className="bg-cs-warm-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-cs-navy-500">행사명</span><span className="font-medium">{form.title}</span></div>
                <div className="flex justify-between"><span className="text-cs-navy-500">유형</span><span className="font-medium">{EVENT_TYPE_LABELS[form.eventType]}</span></div>
                <div className="flex justify-between"><span className="text-cs-navy-500">일정</span><span className="font-medium">{form.eventStart} ~ {form.eventEnd}</span></div>
                <div className="flex justify-between"><span className="text-cs-navy-500">장소</span><span className="font-medium">{form.location}</span></div>
                <div className="flex justify-between"><span className="text-cs-navy-500">참가비</span><span className="font-medium">{form.fee === 0 ? '무료' : `₩${form.fee.toLocaleString()}`}</span></div>
                <div className="flex justify-between"><span className="text-cs-navy-500">정원</span><span className="font-medium">{form.maxParticipants}명</span></div>
                <div className="flex justify-between"><span className="text-cs-navy-500">신청 항목</span><span className="font-medium">{form.formFields.filter(f => f.enabled).length}개</span></div>
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(2)} className="btn-outline">이전</button>
                <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
                  {submitting ? '생성중...' : '행사 생성하기'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
