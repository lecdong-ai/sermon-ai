'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, ArrowRight } from 'lucide-react'
import { getEventById, updateEvent } from '@/lib/events/db'
import { EVENT_TYPE_LABELS, type Event, type EventType } from '@/types/event'

export default function EventSettingsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>({})

  useEffect(() => {
    getEventById(id).then(ev => {
      if (!ev) return
      setEvent(ev)
      setForm({
        title: ev.title,
        eventType: ev.eventType,
        description: ev.description,
        location: ev.location,
        targetDescription: ev.targetDescription,
        fee: ev.fee,
        bankAccountInfo: ev.bankAccountInfo,
        maxParticipants: ev.maxParticipants,
        registrationStart: ev.registrationStart,
        registrationEnd: ev.registrationEnd,
        eventStart: ev.eventStart,
        eventEnd: ev.eventEnd,
      })
      setLoading(false)
    })
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    await updateEvent(id, form)
    setSaving(false)
    router.push(`/school/events/manage/${id}`)
  }

  if (loading || !event) return null

  return (
    <div className="bg-cs-warm-50 min-h-screen">
      <div className="container-custom py-6 max-w-2xl mx-auto">
        <Link href={`/school/events/manage/${id}`} className="inline-flex items-center gap-1.5 text-sm text-cs-navy-500 hover:text-cs-navy-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> 행사 관리
        </Link>

        <div className="card-flat p-6 md:p-8 bg-white">
          <h1 className="text-xl font-extrabold text-cs-navy-900 mb-6">행사 설정</h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-cs-navy-700 mb-1">행사명</label>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-cs-navy-700 mb-1">유형</label>
              <select value={form.eventType} onChange={e => setForm({ ...form, eventType: e.target.value })} className="select-field">
                {(Object.entries(EVENT_TYPE_LABELS) as [EventType, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-cs-navy-700 mb-1">설명</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" rows={4} />
            </div>
            <div>
              <label className="block text-sm font-medium text-cs-navy-700 mb-1">장소</label>
              <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-cs-navy-700 mb-1">대상</label>
              <input type="text" value={form.targetDescription} onChange={e => setForm({ ...form, targetDescription: e.target.value })} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-cs-navy-700 mb-1">행사 시작일</label>
                <input type="date" value={form.eventStart} onChange={e => setForm({ ...form, eventStart: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-cs-navy-700 mb-1">행사 종료일</label>
                <input type="date" value={form.eventEnd} onChange={e => setForm({ ...form, eventEnd: e.target.value })} className="input-field" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-cs-navy-700 mb-1">접수 시작일</label>
                <input type="date" value={form.registrationStart} onChange={e => setForm({ ...form, registrationStart: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-cs-navy-700 mb-1">접수 마감일</label>
                <input type="date" value={form.registrationEnd} onChange={e => setForm({ ...form, registrationEnd: e.target.value })} className="input-field" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-cs-navy-700 mb-1">정원</label>
                <input type="number" value={form.maxParticipants} onChange={e => setForm({ ...form, maxParticipants: Number(e.target.value) })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-cs-navy-700 mb-1">참가비</label>
                <input type="number" value={form.fee} onChange={e => setForm({ ...form, fee: Number(e.target.value) })} className="input-field" />
              </div>
            </div>
            {form.fee > 0 && (
              <div>
                <label className="block text-sm font-medium text-cs-navy-700 mb-1">입금계좌</label>
                <input type="text" value={form.bankAccountInfo} onChange={e => setForm({ ...form, bankAccountInfo: e.target.value })} className="input-field" />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <Link href={`/school/events/manage/${id}`} className="btn-outline">취소</Link>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              <Save className="w-4 h-4" /> {saving ? '저장중...' : '저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
