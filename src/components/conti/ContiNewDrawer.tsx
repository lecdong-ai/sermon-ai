'use client'

import { useState, useMemo } from 'react'
import type { ContiSet, ContiItem, WorshipType } from '@/types/conti'
import { getSampleConti } from '@/lib/conti/samples'
import { saveMockContiList, saveMockContiDetail, loadMockContiDetail } from '@/lib/conti/mockStorage'
import { X, Music, Sparkles, Copy } from 'lucide-react'
import { WORSHIP_TYPE_META } from '@/types/conti'

interface Props {
  onClose: () => void
  onCreated: (conti: ContiSet, items: ContiItem[]) => void
  existingContis: ContiSet[]
}

export default function ContiNewDrawer({ onClose, onCreated, existingContis }: Props) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [worshipType, setWorshipType] = useState<WorshipType>('sunday_am')
  const [memo, setMemo] = useState('')

  const prevConti = useMemo(() => {
    return existingContis
      .filter((c) => c.worship_type === worshipType && c.id !== '')
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))[0] || null
  }, [existingContis, worshipType])

  function createContiAndSave(items: ContiItem[]) {
    const newContiId = `mock-conti-${Date.now()}`
    const newConti = {
      id: newContiId,
      user_id: 'mock-user',
      title: title.trim(),
      date,
      worship_type: worshipType,
      memo: memo.trim(),
      is_public: false,
      share_token: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const finalizedItems = items.map((item, idx) => ({
      id: `ci-${newContiId}-${idx}`,
      conti_id: newContiId,
      song_id: item.song_id,
      position: idx + 1,
      key: item.key || null,
      bpm_override: item.bpm_override || null,
      transition_memo: item.transition_memo || '',
      memo: item.memo || '',
      song: item.song || undefined,
    }))

    const stored = JSON.parse(localStorage.getItem('conti:mock:list') || '[]')
    saveMockContiList([newConti, ...stored])
    saveMockContiDetail(newContiId, { conti: newConti, items: finalizedItems })

    onCreated(newConti, finalizedItems)
    onClose()
  }

  function handleCreate() {
    if (!title.trim()) {
      alert('콘티 제목을 입력해 주세요.')
      return
    }
    createContiAndSave([])
  }

  function handleLoadFromTemplate() {
    if (!prevConti) return
    if (!title.trim()) {
      alert('콘티 제목을 입력해 주세요.')
      return
    }

    const detail = loadMockContiDetail(prevConti.id) || getSampleConti(prevConti.id)
    if (!detail) {
      alert('이전 콘티의 곡 정보를 불러올 수 없습니다.')
      return
    }

    createContiAndSave(detail.items)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03050c]/85 backdrop-blur-md" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-[#0a0f1f] border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <h2 className="text-[16px] font-bold text-white flex items-center gap-2">
            <Music className="w-4 h-4 text-indigo-300" />
            새 콘티 만들기
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 기본 정보 */}
        <div className="p-5 space-y-3">
          <div>
            <label className="text-[12px] font-bold text-slate-400 mb-1 block">콘티 제목 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 2025-07-13 주일 오전 예배"
              autoFocus
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-bold text-slate-400 mb-1 block">날짜</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white focus:outline-none focus:border-indigo-500/40"
              />
            </div>
            <div>
              <label className="text-[12px] font-bold text-slate-400 mb-1 block">예배 유형</label>
              <select
                value={worshipType}
                onChange={(e) => setWorshipType(e.target.value as WorshipType)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white focus:outline-none focus:border-indigo-500/40"
              >
                {(Object.keys(WORSHIP_TYPE_META) as WorshipType[]).map((t) => (
                  <option key={t} value={t}>{WORSHIP_TYPE_META[t].label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[12px] font-bold text-slate-400 mb-1 block">메모 (선택)</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="새신자 환영 · 찬양팀 7명"
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40 resize-none"
            />
          </div>

          {prevConti && (
            <button
              onClick={handleLoadFromTemplate}
              className="w-full p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-left hover:bg-indigo-500/15 transition-all group"
            >
              <div className="flex items-center gap-2">
                <Copy className="w-3.5 h-3.5 text-indigo-300" />
                <span className="text-[13px] font-bold text-indigo-200">
                  저번 {WORSHIP_TYPE_META[worshipType].label} 콘티 복제
                </span>
              </div>
              <p className="text-[12px] text-slate-500 mt-0.5">
                &ldquo;{prevConti.title}&rdquo; · {prevConti.date}
              </p>
              <p className="text-[11px] text-indigo-400/60 mt-0.5 group-hover:text-indigo-300 transition-colors">
                곡 구성을 그대로 가져와요 →
              </p>
            </button>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[13px] font-bold text-slate-400 hover:bg-white/5 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[13px] font-extrabold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
            >
              <Sparkles className="w-3.5 h-3.5" />
              콘티 만들기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
