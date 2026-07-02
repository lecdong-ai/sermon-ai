'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Send, Bell } from 'lucide-react'
import { getNotices, createNotice, deleteNotice, getGroups } from '@/lib/events/db'
import type { EventNotice, EventGroup } from '@/types/event'

export default function NoticesPage() {
  const { id } = useParams<{ id: string }>()
  const [notices, setNotices] = useState<EventNotice[]>([])
  const [groups, setGroups] = useState<EventGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [target, setTarget] = useState<'all' | 'group' | 'payment_pending'>('all')
  const [targetId, setTargetId] = useState('')

  const loadData = () => {
    Promise.all([getNotices(id), getGroups(id)]).then(([ns, gs]) => {
      setNotices(ns)
      setGroups(gs)
      setLoading(false)
    })
  }

  useEffect(loadData, [id])

  const handleSend = async () => {
    if (!title.trim() || !content.trim()) return
    await createNotice({
      eventId: id, title, content,
      target: target as any,
      targetId: target === 'group' ? targetId || null : null,
      sentBy: 'admin',
    })
    setTitle('')
    setContent('')
    setShowForm(false)
    loadData()
  }

  const handleDelete = async (nid: string) => {
    await deleteNotice(nid)
    loadData()
  }

  if (loading) return null

  const targetLabel = (notice: EventNotice) => {
    switch (notice.target) {
      case 'all': return '전체'
      case 'group': return `반: ${groups.find(g => g.id === notice.targetId)?.name || notice.targetId}`
      case 'payment_pending': return '미입금자'
      case 'not_checked_in': return '미체크인'
      default: return notice.target
    }
  }

  return (
    <div className="bg-cs-warm-50 min-h-screen">
      <div className="container-custom py-6 max-w-3xl mx-auto">
        <Link href={`/school/events/manage/${id}`} className="inline-flex items-center gap-1.5 text-sm text-cs-navy-500 hover:text-cs-navy-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> 행사 관리
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-cs-navy-900">공지 관리</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary btn-sm">
            <Plus className="w-4 h-4" /> 새 공지
          </button>
        </div>

        {showForm && (
          <div className="card-flat p-5 bg-white mb-6">
            <h3 className="font-bold text-cs-navy-900 text-sm mb-4">새 공지 발송</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-cs-navy-700 mb-1">제목</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-cs-navy-700 mb-1">내용</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} className="input-field text-sm" rows={5} placeholder="공지 내용을 입력하세요" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-cs-navy-700 mb-1">발송 대상</label>
                  <select value={target} onChange={e => setTarget(e.target.value as any)} className="select-field text-sm">
                    <option value="all">전체</option>
                    <option value="group">특정 반</option>
                    <option value="payment_pending">미입금자</option>
                  </select>
                </div>
                {target === 'group' && (
                  <div>
                    <label className="block text-xs font-medium text-cs-navy-700 mb-1">반 선택</label>
                    <select value={targetId} onChange={e => setTargetId(e.target.value)} className="select-field text-sm">
                      <option value="">선택</option>
                      {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowForm(false)} className="btn-outline btn-sm">취소</button>
                <button onClick={handleSend} disabled={!title || !content} className="btn-primary btn-sm">
                  <Send className="w-4 h-4" /> 발송
                </button>
              </div>
            </div>
          </div>
        )}

        {notices.length === 0 ? (
          <div className="card-flat p-12 bg-white text-center">
            <Bell className="w-10 h-10 text-cs-navy-300 mx-auto mb-3" />
            <p className="text-cs-navy-500 text-sm">발송된 공지가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notices.map(notice => (
              <div key={notice.id} className="card-flat p-4 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-cs-navy-900 text-sm">{notice.title}</h3>
                      <span className="badge bg-cs-navy-50 text-cs-navy-600 border border-cs-navy-200 text-[10px]">{targetLabel(notice)}</span>
                    </div>
                    <p className="text-xs text-cs-navy-600 whitespace-pre-line">{notice.content}</p>
                    <p className="text-[10px] text-cs-navy-400 mt-2">발송: {new Date(notice.sentAt).toLocaleString()}</p>
                  </div>
                  <button onClick={() => handleDelete(notice.id)} className="text-red-400 hover:text-red-600 ml-2 shrink-0"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
