'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Inbox, MessageSquare, CheckCircle2, Clock, Sparkles, Send } from 'lucide-react'

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

const CATEGORY_META: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  question: { label: '질문', bg: 'bg-indigo-500/15', text: 'text-indigo-300', icon: MessageSquare },
  request: { label: '요청', bg: 'bg-emerald-500/15', text: 'text-emerald-300', icon: Sparkles },
  bug: { label: '버그', bg: 'bg-rose-500/15', text: 'text-rose-300', icon: MessageSquare },
  praise: { label: '칭찬', bg: 'bg-amber-500/15', text: 'text-amber-300', icon: Sparkles },
}

const STATUS_META: Record<string, { label: string; bg: string; text: string }> = {
  open: { label: '대기중', bg: 'bg-slate-500/15', text: 'text-slate-400' },
  in_progress: { label: '처리중', bg: 'bg-amber-500/15', text: 'text-amber-300' },
  resolved: { label: '해결', bg: 'bg-emerald-500/15', text: 'text-emerald-300' },
  wontfix: { label: '검토됨', bg: 'bg-slate-500/15', text: 'text-slate-500' },
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function MessagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const focusId = searchParams.get('focus')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/messages')
      .then(r => r.json())
      .then(data => {
        if (data.success) setMessages(data.messages)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (focusId && messages.length > 0) {
      setTimeout(() => {
        const el = document.getElementById(`msg-${focusId}`)
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el?.classList.add('ring-2', 'ring-indigo-500/50')
        setTimeout(() => el?.classList.remove('ring-2', 'ring-indigo-500/50'), 2000)
      }, 100)
    }
  }, [focusId, messages])

  const replied = messages.filter(m => m.admin_reply)
  const pending = messages.filter(m => !m.admin_reply)

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Inbox className="w-5 h-5 text-indigo-500" />
            <h1 className="text-2xl font-extrabold text-[#191f28]">내 메시지</h1>
          </div>
          <p className="text-[13px] text-slate-500">관리자에게 보낸 메시지와 답변을 확인합니다.</p>
        </div>

        {loading ? (
          <div className="bg-white border border-[#e4e2dd] rounded-2xl p-12 text-center text-[14px] text-slate-500">
            불러오는 중...
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-white border border-[#e4e2dd] rounded-2xl p-12 text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-[14px] text-slate-600 font-medium">아직 보낸 메시지가 없습니다</p>
            <p className="text-[12px] text-slate-500 mt-1">우측 하단 버튼으로 문의해 주세요</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 답변 완료 */}
            {replied.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-[13px] font-bold text-[#191f28]">답변 완료 ({replied.length})</h2>
                </div>
                <div className="space-y-3">
                  {replied.map(m => <MessageCard key={m.id} message={m} />)}
                </div>
              </div>
            )}

            {/* 대기중 */}
            {pending.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <h2 className="text-[13px] font-bold text-[#191f28]">대기 중 ({pending.length})</h2>
                </div>
                <div className="space-y-3">
                  {pending.map(m => <MessageCard key={m.id} message={m} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function MessageCard({ message }: { message: Message }) {
  const cat = CATEGORY_META[message.category]
  const status = STATUS_META[message.status]
  const Icon = cat.icon

  return (
    <div id={`msg-${message.id}`} className="bg-white border border-[#e4e2dd] rounded-2xl p-5 transition-all">
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-8 h-8 rounded-lg ${cat.bg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-4 h-4 ${cat.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cat.bg} ${cat.text}`}>
              {cat.label}
            </span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${status.bg} ${status.text}`}>
              {status.label}
            </span>
            <span className="text-[10px] text-slate-400 ml-auto">{formatDate(message.created_at)}</span>
          </div>
          {message.subject && (
            <h3 className="text-[14px] font-bold text-[#191f28] mb-1.5">{message.subject}</h3>
          )}
          <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">{message.message}</p>
        </div>
      </div>

      {message.admin_reply && (
        <div className="mt-4 ml-11 bg-gradient-to-br from-indigo-50/60 to-purple-50/40 border-l-2 border-indigo-400 rounded-r-lg p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Send className="w-3 h-3 text-indigo-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">관리자 답변</span>
            {message.admin_replied_at && (
              <span className="text-[10px] text-slate-500 ml-auto">{formatDate(message.admin_replied_at)}</span>
            )}
          </div>
          <p className="text-[13px] text-slate-800 leading-relaxed whitespace-pre-wrap">{message.admin_reply}</p>
        </div>
      )}
    </div>
  )
}
