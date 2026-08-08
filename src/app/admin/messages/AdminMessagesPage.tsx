'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Inbox, MessageSquare, Sparkles, Search, Send, Loader2, ChevronRight } from 'lucide-react'

interface Message {
  id: string
  user_id: string
  category: 'question' | 'request' | 'bug' | 'praise'
  subject: string | null
  message: string
  status: 'open' | 'in_progress' | 'resolved' | 'wontfix'
  admin_reply: string | null
  admin_replied_at: string | null
  created_at: string
  updated_at: string
}

const CATEGORY_META: Record<string, { label: string; bg: string; text: string }> = {
  question: { label: '질문', bg: 'bg-indigo-500/15', text: 'text-indigo-300' },
  request: { label: '요청', bg: 'bg-emerald-500/15', text: 'text-emerald-300' },
  bug: { label: '버그', bg: 'bg-rose-500/15', text: 'text-rose-300' },
  praise: { label: '칭찬', bg: 'bg-amber-500/15', text: 'text-amber-300' },
}

const STATUS_META: Record<string, { label: string; bg: string; text: string }> = {
  open: { label: '대기', bg: 'bg-slate-500/20', text: 'text-slate-300' },
  in_progress: { label: '처리중', bg: 'bg-amber-500/20', text: 'text-amber-300' },
  resolved: { label: '해결', bg: 'bg-emerald-500/20', text: 'text-emerald-300' },
  wontfix: { label: '검토됨', bg: 'bg-slate-500/15', text: 'text-slate-500' },
}

const STATUS_FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'open', label: '대기' },
  { key: 'in_progress', label: '처리중' },
  { key: 'resolved', label: '해결' },
]

const CATEGORY_FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'question', label: '질문' },
  { key: 'request', label: '요청' },
  { key: 'bug', label: '버그' },
  { key: 'praise', label: '칭찬' },
]

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function timeAgo(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

export default function AdminMessagesPage() {
  const searchParams = useSearchParams()
  const focusId = searchParams?.get('focus')
  const [messages, setMessages] = useState<Message[]>([])
  const [userMap, setUserMap] = useState<Record<string, { email: string }>>({})
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedId, setSelectedId] = useState<string | null>(focusId)
  const [search, setSearch] = useState('')

  const loadMessages = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (categoryFilter !== 'all') params.set('category', categoryFilter)
      const res = await fetch(`/api/admin/messages?${params}`)
      const data = await res.json()
      if (data.success) {
        setMessages(data.messages)
        setUserMap(data.userMap || {})
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, categoryFilter])

  useEffect(() => {
    if (focusId) setSelectedId(focusId)
  }, [focusId])

  useEffect(() => {
    if (selectedId) {
      setTimeout(() => {
        const el = document.getElementById(`adm-msg-${selectedId}`)
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
  }, [selectedId])

  const filtered = messages.filter(m => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    const userEmail = userMap[m.user_id]?.email || ''
    return (
      m.message.toLowerCase().includes(q) ||
      m.subject?.toLowerCase().includes(q) ||
      userEmail.toLowerCase().includes(q) ||
      m.admin_reply?.toLowerCase().includes(q)
    )
  })

  const counts = {
    all: messages.length,
    open: messages.filter(m => m.status === 'open').length,
    in_progress: messages.filter(m => m.status === 'in_progress').length,
    resolved: messages.filter(m => m.status === 'resolved').length,
  }

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Inbox className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-extrabold text-white">사용자 메시지</h1>
          </div>
          <p className="text-[12px] text-slate-500 mt-1">사용자가 보낸 문의와 요청을 확인하고 답변합니다.</p>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="메시지/이메일/답변 검색"
            className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[12px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
        <div className="flex items-center bg-white/5 rounded-lg p-0.5">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                statusFilter === f.key ? 'bg-indigo-500/20 text-indigo-200' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label} {f.key !== 'all' && counts[f.key as keyof typeof counts] > 0 && (
                <span className="ml-1 text-[10px] opacity-70">{counts[f.key as keyof typeof counts]}</span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center bg-white/5 rounded-lg p-0.5">
          {CATEGORY_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setCategoryFilter(f.key)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                categoryFilter === f.key ? 'bg-indigo-500/20 text-indigo-200' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 메시지 리스트 + 상세 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 리스트 */}
        <div className="bg-[#0a0e1a] border border-white/5 rounded-2xl overflow-hidden">
          <div className="max-h-[70vh] overflow-y-auto scrollbar-thin divide-y divide-white/5">
            {loading ? (
              <div className="p-8 text-center text-[12px] text-slate-500">불러오는 중...</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <MessageSquare className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                <p className="text-[12px] text-slate-500">메시지가 없습니다</p>
              </div>
            ) : (
              filtered.map(m => {
                const cat = CATEGORY_META[m.category]
                const status = STATUS_META[m.status]
                const userEmail = userMap[m.user_id]?.email || m.user_id.slice(0, 8)
                const isSelected = m.id === selectedId
                return (
                  <button
                    key={m.id}
                    id={`adm-msg-${m.id}`}
                    onClick={() => setSelectedId(m.id)}
                    className={`w-full text-left p-3.5 transition-colors ${
                      isSelected ? 'bg-indigo-500/10 border-l-2 border-indigo-400' : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cat.bg} ${cat.text}`}>
                        {cat.label}
                      </span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                      <span className="text-[10px] text-slate-500 ml-auto">{timeAgo(m.created_at)}</span>
                    </div>
                    <p className="text-[12px] text-slate-300 line-clamp-1 font-medium">
                      {m.subject || '(제목 없음)'}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{m.message}</p>
                    <p className="text-[10px] text-slate-600 mt-1.5 truncate">{userEmail}</p>
                    {!m.admin_reply && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        미답변
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* 상세 */}
        <div className="bg-[#0a0e1a] border border-white/5 rounded-2xl overflow-hidden flex flex-col">
          {selectedId ? (
            <MessageDetail
              key={selectedId}
              messageId={selectedId}
              userMap={userMap}
              onUpdate={loadMessages}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500">
              <ChevronRight className="w-10 h-10 text-slate-700 mb-2 rotate-180" />
              <p className="text-[12px]">왼쪽에서 메시지를 선택하세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MessageDetail({ messageId, userMap, onUpdate }: { messageId: string; userMap: Record<string, any>; onUpdate: () => void }) {
  const [message, setMessage] = useState<Message | null>(null)
  const [reply, setReply] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/messages?limit=200')
      .then(r => r.json())
      .then(data => {
        const m = data.messages?.find((x: Message) => x.id === messageId)
        if (m) {
          setMessage(m)
          setReply(m.admin_reply || '')
        }
      })
  }, [messageId])

  if (!message) {
    return <div className="p-8 text-center text-[12px] text-slate-500">불러오는 중...</div>
  }

  const cat = CATEGORY_META[message.category]
  const status = STATUS_META[message.status]
  const userEmail = userMap[message.user_id]?.email || message.user_id

  const handleSave = async (override?: { status?: string }) => {
    if (saving) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/messages/${message.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminReply: reply, status: override?.status }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage(data.message)
        onUpdate()
      }
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/messages/${message.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage(data.message)
        onUpdate()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* 헤더 */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cat.bg} ${cat.text}`}>
            {cat.label}
          </span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${status.bg} ${status.text}`}>
            {status.label}
          </span>
          <span className="text-[10px] text-slate-500 ml-auto">{formatDate(message.created_at)}</span>
        </div>
        {message.subject && (
          <h2 className="text-[15px] font-extrabold text-white mb-1">{message.subject}</h2>
        )}
        <p className="text-[11px] text-slate-500">보낸 사람: {userEmail}</p>
      </div>

      {/* 메시지 본문 */}
      <div className="p-4 border-b border-white/5 max-h-[40vh] overflow-y-auto scrollbar-thin">
        <p className="text-[13px] text-slate-200 leading-relaxed whitespace-pre-wrap">{message.message}</p>
      </div>

      {/* 상태 변경 */}
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-1.5 bg-white/[0.02]">
        <span className="text-[10px] text-slate-500 mr-1">상태:</span>
        {(['open', 'in_progress', 'resolved', 'wontfix'] as const).map(s => (
          <button
            key={s}
            onClick={() => handleStatusChange(s)}
            disabled={saving}
            className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-colors ${
              message.status === s
                ? STATUS_META[s].bg + ' ' + STATUS_META[s].text + ' ring-1 ring-current'
                : 'bg-white/5 text-slate-500 hover:bg-white/10'
            } disabled:opacity-50`}
          >
            {STATUS_META[s].label}
          </button>
        ))}
      </div>

      {/* 답변 */}
      <div className="p-4 flex-1 flex flex-col">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 block">
          관리자 답변
        </label>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          rows={6}
          placeholder="답변을 입력하세요. 비워두면 답변 삭제됩니다."
          className="flex-1 w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[13px] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
        />
        {message.admin_replied_at && (
          <p className="text-[10px] text-slate-500 mt-1.5">
            마지막 답변: {formatDate(message.admin_replied_at)}
          </p>
        )}
        <div className="flex items-center justify-end gap-2 mt-3">
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-[12px] font-bold transition-colors"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            답변 저장
          </button>
        </div>
      </div>
    </div>
  )
}
