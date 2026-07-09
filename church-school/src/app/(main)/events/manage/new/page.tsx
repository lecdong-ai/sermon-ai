'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, X, Calendar, Save } from 'lucide-react'
import { EventInput, CustomField, EventStatus } from '@/types/event'

export default function NewEventPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState<EventInput>({
    title: '', description: '', location: '',
    start_date: '', end_date: '', deadline: '',
    capacity: null, status: 'draft',
    contact_info: '', is_template: false,
    custom_fields: [],
  })

  const addCustomField = () => {
    setForm({
      ...form,
      custom_fields: [
        ...(form.custom_fields || []),
        { id: `custom_${Date.now()}`, label: '', required: false, placeholder: '' },
      ],
    })
  }

  const updateCustomField = (index: number, field: Partial<CustomField>) => {
    const fields = [...(form.custom_fields || [])]
    fields[index] = { ...fields[index], ...field }
    setForm({ ...form, custom_fields: fields })
  }

  const removeCustomField = (index: number) => {
    const fields = (form.custom_fields || []).filter((_, i) => i !== index)
    setForm({ ...form, custom_fields: fields })
  }

  const handleSubmit = async (publish: boolean) => {
    if (!form.title?.trim()) { setError('행사명을 입력해주세요.'); return }
    setSubmitting(true)
    setError('')

    const res = await fetch('/api/manage/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, status: publish ? 'open' : 'draft' }),
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setSubmitting(false); return }
    router.push('/events/manage')
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-mint-400 transition-all"
  const labelClass = "block text-sm font-medium text-navy-700 mb-1.5"

  return (
    <div className="container-custom py-8 max-w-2xl">
      <Link href="/events/manage" className="inline-flex items-center gap-1 text-navy-500 hover:text-navy-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> 행사 목록으로
      </Link>

      <h1 className="text-2xl font-bold text-navy-900 mb-6">행사 생성</h1>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-6">{error}</div>
      )}

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="card-flat p-6">
          <h2 className="text-base font-bold text-navy-900 mb-4">기본 정보</h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>행사명 *</label>
              <input className={inputClass} value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="예: 2026년 여름 수련회" />
            </div>
            <div>
              <label className={labelClass}>행사 설명</label>
              <textarea className={inputClass} rows={3} value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="행사에 대한 설명을 입력하세요" />
            </div>
            <div>
              <label className={labelClass}>장소</label>
              <input className={inputClass} value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                placeholder="예: ○○수양관" />
            </div>
            <div>
              <label className={labelClass}>문의 연락처</label>
              <input className={inputClass} value={form.contact_info}
                onChange={e => setForm({ ...form, contact_info: e.target.value })}
                placeholder="예: 010-1234-5678 (김전도사)" />
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="card-flat p-6">
          <h2 className="text-base font-bold text-navy-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-navy-500" />
            일정
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>시작일시</label>
              <input type="datetime-local" className={inputClass} value={form.start_date}
                onChange={e => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>종료일시</label>
              <input type="datetime-local" className={inputClass} value={form.end_date}
                onChange={e => setForm({ ...form, end_date: e.target.value })} />
            </div>
          </div>
          <div className="mt-4">
            <label className={labelClass}>신청 마감일시</label>
            <input type="datetime-local" className={inputClass} value={form.deadline}
              onChange={e => setForm({ ...form, deadline: e.target.value })} />
          </div>
          <div className="mt-4">
            <label className={labelClass}>정원 (0 또는 비워두면 무제한)</label>
            <input type="number" min={0} className={inputClass} value={form.capacity ?? ''}
              onChange={e => setForm({ ...form, capacity: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="예: 50" />
          </div>
        </div>

        {/* Custom Fields */}
        <div className="card-flat p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-navy-900">추가 질문 (선택)</h2>
            <button onClick={addCustomField} className="btn-ghost btn-sm text-mint-600">
              <Plus className="w-4 h-4" /> 질문 추가
            </button>
          </div>
          <p className="text-xs text-navy-400 mb-4">기본 항목 외에 추가로 받고 싶은 정보를 설정하세요.</p>
          {form.custom_fields && form.custom_fields.length > 0 ? (
            <div className="space-y-3">
              {form.custom_fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2 p-3 bg-warm-50 rounded-xl">
                  <div className="flex-1 space-y-2">
                    <input className={inputClass + ' py-2'} value={field.label}
                      onChange={e => updateCustomField(index, { label: e.target.value })}
                      placeholder="질문 내용 (예: 참가비 입금 계좌)" />
                    <input className={inputClass + ' py-2'} value={field.placeholder}
                      onChange={e => updateCustomField(index, { placeholder: e.target.value })}
                      placeholder="도움말 (선택)" />
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={field.required}
                        onChange={e => updateCustomField(index, { required: e.target.checked })}
                        className="w-4 h-4 rounded border-warm-300 text-navy-600 focus:ring-mint-400" />
                      <span className="text-navy-600">필수 응답</span>
                    </label>
                  </div>
                  <button onClick={() => removeCustomField(index)}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-navy-300 text-center py-4">추가 질문이 없습니다</p>
          )}
        </div>

        {/* Template Option */}
        <div className="card-flat p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_template}
              onChange={e => setForm({ ...form, is_template: e.target.checked })}
              className="w-5 h-5 rounded border-warm-300 text-navy-600 focus:ring-mint-400" />
            <div>
              <span className="text-sm font-medium text-navy-700">템플릿으로 저장</span>
              <p className="text-xs text-navy-400 mt-0.5">체크하면 행사 목록이 아닌 템플릿으로 저장됩니다. 나중에 복제하여 새 행사를 만들 수 있습니다.</p>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={() => handleSubmit(false)} disabled={submitting}
            className="flex-1 py-3.5 bg-white border-2 border-warm-200 text-navy-700 font-semibold rounded-xl hover:bg-warm-50 transition-colors flex items-center justify-center gap-2">
            <Save className="w-5 h-5" />
            임시저장
          </button>
          <button onClick={() => handleSubmit(true)} disabled={submitting}
            className="flex-1 py-3.5 bg-navy-900 text-white font-semibold rounded-xl hover:bg-navy-800 transition-colors flex items-center justify-center gap-2">
            {submitting ? '저장 중...' : '저장 및 신청 오픈'}
          </button>
        </div>
      </div>
    </div>
  )
}
