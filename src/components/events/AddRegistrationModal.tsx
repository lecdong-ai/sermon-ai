'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { createRegistration } from '@/lib/events/db'
import type { Event } from '@/types/event'

interface Props {
  event: Event
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

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
  gender: '남',
  birth: '',
  parentName: '',
  parentPhone: '',
  address: '',
  emergencyContact: '',
  allergies: '',
  tshirtSize: '',
  vehicleUsage: '이용하지 않음',
  friendWith: '',
  photoConsent: true,
  privacyConsent: true,
}

export default function AddRegistrationModal({ event, open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState<FormData>(initialForm)
  const [submitting, setSubmitting] = useState(false)

  if (!open) return null

  const update = (key: keyof FormData, value: any) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    if (!form.participantName.trim()) return
    setSubmitting(true)
    try {
      await createRegistration({
        eventId: event.id,
        userId: 'admin',
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
        vehicleUsage: form.vehicleUsage,
        friendWith: form.friendWith,
        photoConsent: form.photoConsent,
        privacyConsent: form.privacyConsent,
        extraFields: {},
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
      setForm(initialForm)
      onSuccess()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-cs-warm-100">
          <h2 className="text-lg font-bold text-cs-navy-900">참가자 등록</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-cs-warm-50"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-cs-navy-700 mb-1">이름 *</label>
              <input type="text" value={form.participantName} onChange={e => update('participantName', e.target.value)} className="input-field text-sm" placeholder="참가자 이름" autoFocus />
            </div>
            <div>
              <label className="block text-xs font-medium text-cs-navy-700 mb-1">학년/반/부서</label>
              <input type="text" value={form.grade} onChange={e => update('grade', e.target.value)} className="input-field text-sm" placeholder="예: 초등3학년" />
            </div>
            <div>
              <label className="block text-xs font-medium text-cs-navy-700 mb-1">생년월일</label>
              <input type="date" value={form.birth} onChange={e => update('birth', e.target.value)} className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-cs-navy-700 mb-1">성별</label>
              <select value={form.gender} onChange={e => update('gender', e.target.value)} className="select-field text-sm">
                <option value="남">남</option>
                <option value="여">여</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-cs-navy-700 mb-1">티셔츠 사이즈</label>
              <select value={form.tshirtSize} onChange={e => update('tshirtSize', e.target.value)} className="select-field text-sm">
                <option value="">-</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="2XL">2XL</option>
              </select>
            </div>
          </div>

          <hr className="border-cs-warm-100" />
          <p className="text-xs font-bold text-cs-navy-700">보호자 정보</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-cs-navy-700 mb-1">보호자 이름</label>
              <input type="text" value={form.parentName} onChange={e => update('parentName', e.target.value)} className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-cs-navy-700 mb-1">연락처</label>
              <input type="tel" value={form.parentPhone} onChange={e => update('parentPhone', e.target.value)} className="input-field text-sm" placeholder="010-0000-0000" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-cs-navy-700 mb-1">주소</label>
              <input type="text" value={form.address} onChange={e => update('address', e.target.value)} className="input-field text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-cs-navy-700 mb-1">비상연락처</label>
              <input type="tel" value={form.emergencyContact} onChange={e => update('emergencyContact', e.target.value)} className="input-field text-sm" placeholder="010-0000-0000" />
            </div>
          </div>

          <hr className="border-cs-warm-100" />
          <p className="text-xs font-bold text-cs-navy-700">추가 정보</p>
          <div>
            <label className="block text-xs font-medium text-cs-navy-700 mb-1">알레르기/복용약</label>
            <textarea value={form.allergies} onChange={e => update('allergies', e.target.value)} className="input-field text-sm" rows={2} />
          </div>
          <div>
            <label className="block text-xs font-medium text-cs-navy-700 mb-1">차량 이용</label>
            <div className="flex gap-3">
              {['이용함', '이용하지 않음'].map(opt => (
                <label key={opt} className="flex items-center gap-1.5 cursor-pointer text-sm">
                  <input type="radio" name="vehicleModal" value={opt} checked={form.vehicleUsage === opt} onChange={e => update('vehicleUsage', e.target.value)} className="accent-cs-mint-500" />
                  {opt}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-cs-navy-700 mb-1">친구 동반</label>
            <input type="text" value={form.friendWith} onChange={e => update('friendWith', e.target.value)} className="input-field text-sm" placeholder="같이 신청하는 친구 이름" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-5 border-t border-cs-warm-100">
          <button onClick={onClose} className="btn-outline btn-sm">취소</button>
          <button onClick={handleSubmit} disabled={submitting || !form.participantName.trim()} className="btn-primary btn-sm">
            {submitting ? '저장중...' : '등록'}
          </button>
        </div>
      </div>
    </div>
  )
}
