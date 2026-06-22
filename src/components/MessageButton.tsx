'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, X, Send, Check, Loader2, Inbox } from 'lucide-react'

type Category = 'question' | 'request' | 'bug' | 'praise'

const CATEGORIES: { key: Category; label: string; description: string; color: string }[] = [
  { key: 'question', label: '질문', description: '사용법이나 기능에 대한 궁금증', color: 'from-indigo-500 to-blue-500' },
  { key: 'request', label: '요청', description: '새로운 기능이나 개선 사항 제안', color: 'from-emerald-500 to-teal-500' },
  { key: 'bug', label: '버그 신고', description: '발견한 문제점이나 오류', color: 'from-rose-500 to-red-500' },
  { key: 'praise', label: '칭찬', description: '도움이 되었거나 좋아하셨던 점', color: 'from-amber-500 to-yellow-500' },
]

export default function MessageButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<Category>('question')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)

  // Esc로 닫기
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !sending) setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, sending])

  const reset = () => {
    setCategory('question')
    setSubject('')
    setMessage('')
    setError(null)
    setSent(false)
  }

  const handleClose = () => {
    if (sending) return
    setOpen(false)
    setTimeout(reset, 200)
  }

  const handleSend = async () => {
    if (!message.trim()) {
      setError('메시지 내용을 입력해주세요.')
      return
    }
    if (message.length > 500) {
      setError('메시지는 500자 이내로 입력해주세요.')
      return
    }

    setSending(true)
    setError(null)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, subject, message }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || '전송 실패')

      setSent(true)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 4000)
      setTimeout(() => handleClose(), 2000)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSending(false)
    }
  }

  const charCount = message.length

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center justify-center group"
        aria-label="관리자에게 메시지 보내기"
      >
        <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* 토스트 */}
      {showToast && (
        <div className="fixed bottom-24 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-sm animate-fade-in">
          <p className="text-[12px] text-emerald-200 font-medium flex items-center gap-2">
            <Check className="w-3.5 h-3.5" />
            문의 감사합니다. 검토 후 답변 드리겠습니다.
          </p>
        </div>
      )}

      {/* 모달 */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={handleClose}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-[#0a0e1a] border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden flex flex-col animate-modal-in"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-[14px] font-extrabold text-slate-100">관리자에게 보내기</h2>
                  <p className="text-[10px] text-slate-500">검토 후 답변 드립니다</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={sending}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* 본문 */}
            <div className="p-5 space-y-4">
              {sent ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                    <Check className="w-7 h-7 text-emerald-400" />
                  </div>
                  <h3 className="text-[15px] font-bold text-slate-100">전송되었습니다</h3>
                  <p className="text-[12px] text-slate-400">답변은 [내 메시지]에서 확인하실 수 있습니다</p>
                  <button
                    onClick={() => { handleClose(); router.push('/messages') }}
                    className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-500/15 text-indigo-300 text-[12px] font-semibold hover:bg-indigo-500/25 transition-colors"
                  >
                    <Inbox className="w-3.5 h-3.5" />
                    내 메시지 보기
                  </button>
                </div>
              ) : (
                <>
                  {/* 카테고리 탭 */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                      카테고리
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {CATEGORIES.map(c => {
                        const active = category === c.key
                        return (
                          <button
                            key={c.key}
                            onClick={() => setCategory(c.key)}
                            className={`p-2 rounded-lg border text-[11px] font-semibold transition-all ${
                              active
                                ? `bg-gradient-to-br ${c.color} text-white border-transparent shadow-sm`
                                : 'bg-white/[0.03] border-white/5 text-slate-400 hover:bg-white/[0.06]'
                            }`}
                            title={c.description}
                          >
                            {c.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* 제목 */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                      제목 (선택)
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      maxLength={100}
                      placeholder="간단한 제목"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[13px] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-colors"
                    />
                  </div>

                  {/* 메시지 */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        메시지
                      </label>
                      <span className={`text-[10px] tabular-nums ${charCount > 500 ? 'text-rose-400' : 'text-slate-600'}`}>
                        {charCount} / 500
                      </span>
                    </div>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={500}
                      rows={6}
                      placeholder="내용을 입력해주세요. 답변을 드리겠습니다."
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-[13px] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-colors resize-none"
                    />
                  </div>

                  {error && (
                    <p className="text-[11px] text-rose-400 flex items-center gap-1">
                      <X className="w-3 h-3" />
                      {error}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* 푸터 */}
            {!sent && (
              <div className="px-5 py-3 border-t border-white/5 flex items-center justify-end gap-2 bg-white/[0.02]">
                <button
                  onClick={handleClose}
                  disabled={sending}
                  className="px-3.5 py-1.5 rounded-lg text-[12px] text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-30"
                >
                  취소
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending || !message.trim()}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-[12px] font-bold transition-colors"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      전송 중...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      보내기
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
