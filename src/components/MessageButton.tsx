'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { MessageSquare, X, Send, Check, Loader2, Inbox, GripVertical } from 'lucide-react'

type Category = 'question' | 'request' | 'bug' | 'praise'

const CATEGORIES: { key: Category; label: string; description: string; color: string }[] = [
  { key: 'question', label: '질문', description: '사용법이나 기능에 대한 궁금증', color: 'from-indigo-500 to-blue-500' },
  { key: 'request', label: '요청', description: '새로운 기능이나 개선 사항 제안', color: 'from-emerald-500 to-teal-500' },
  { key: 'bug', label: '버그 신고', description: '발견한 문제점이나 오류', color: 'from-rose-500 to-red-500' },
  { key: 'praise', label: '칭찬', description: '도움이 되었거나 좋아하셨던 점', color: 'from-amber-500 to-yellow-500' },
]

const POS_KEY = 'bunker_msg_btn_pos'
const LAST_SEEN_KEY = 'bunker_msg_last_seen'
const DRAG_THRESHOLD = 5 // px — 이 거리 미만 이동은 클릭으로 간주
const BUTTON_SIZE = 56 // px — w-14 h-14
const MARGIN = 38 // px — 1cm (CSS bottom-[1cm] right-[1cm]과 일치)
const SAFE_MIN = 0.04 // 4% — 화면 너무 끝에 붙지 않음
const SAFE_MAX = 0.96 // 96% — 화면 너무 끝에 붙지 않음

export default function MessageButton() {
  const router = useRouter()
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<Category>('question')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // ── 드래그 앤 드롭 상태 ──
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ pointerX: number; pointerY: number; btnX: number; btnY: number; moved: boolean } | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  // Esc로 닫기
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !sending) setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, sending])

  // 위치 복원 (localStorage)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(POS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as { x: number; y: number }
        if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
          setPos(parsed)
        }
      }
    } catch {}
  }, [])

  // 미확인 답변 카운트 폴링
  useEffect(() => {
    if (isAdminRoute) return
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/messages')
        if (!res.ok) return
        const data = await res.json()
        if (!data.success || !Array.isArray(data.messages)) return
        const lastSeen = Number(localStorage.getItem(LAST_SEEN_KEY) || 0)
        const count = data.messages.filter((m: any) =>
          m.admin_replied_at && new Date(m.admin_replied_at).getTime() > lastSeen
        ).length
        setUnreadCount(count)
      } catch {}
    }
    fetchUnread()
    const id = setInterval(fetchUnread, 60_000)
    return () => clearInterval(id)
  }, [isAdminRoute])

  // 모달 열림/이탈 시 lastSeen 갱신
  const markAsSeen = () => {
    try {
      localStorage.setItem(LAST_SEEN_KEY, String(Date.now()))
    } catch {}
    setUnreadCount(0)
  }

  // 위치 저장
  const savePos = (next: { x: number; y: number }) => {
    try { localStorage.setItem(POS_KEY, JSON.stringify(next)) } catch {}
  }

  // ── 드래그 핸들러 ──
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    // 모달이 열려있을 땐 드래그 안 됨
    if (open) return
    // 왼쪽 버튼 또는 터치만 허용
    if (e.pointerType === 'mouse' && e.button !== 0) return

    const rect = buttonRef.current?.getBoundingClientRect()
    if (!rect) return

    // 현재 위치 (저장된 값이 없으면 현재 화면 위치의 백분율 계산)
    const currentX = pos ? (window.innerWidth * pos.x) : rect.left
    const currentY = pos ? (window.innerHeight * pos.y) : rect.top

    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      btnX: currentX,
      btnY: currentY,
      moved: false,
    }
  }

  useEffect(() => {
    if (!isDragging) return

    const handlePointerMove = (e: PointerEvent) => {
      const start = dragStartRef.current
      if (!start) return

      const dx = e.clientX - start.pointerX
      const dy = e.clientY - start.pointerY

      if (!start.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
      start.moved = true

      // 경계 제한
      const maxX = window.innerWidth - BUTTON_SIZE - MARGIN
      const maxY = window.innerHeight - BUTTON_SIZE - MARGIN
      const newX = Math.max(MARGIN, Math.min(maxX, start.btnX + dx))
      const newY = Math.max(MARGIN, Math.min(maxY, start.btnY + dy))

      setPos({ x: newX, y: newY })
    }

    const handlePointerUp = () => {
      const start = dragStartRef.current
      if (start?.moved && pos) {
        // 드롭 위치를 백분율로 변환
        const ratioX = pos.x / window.innerWidth
        const ratioY = pos.y / window.innerHeight

        // 안전 범위로 정규화 (화면 끝 보호)
        const safeX = Math.max(SAFE_MIN, Math.min(SAFE_MAX, ratioX))
        const safeY = Math.max(SAFE_MIN, Math.min(SAFE_MAX, ratioY))
        const final = { x: safeX, y: safeY }

        savePos(final)
        setPos(final)
      }
      setIsDragging(false)
      dragStartRef.current = null
    }

    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', handlePointerUp)
    document.addEventListener('pointercancel', handlePointerUp)
    return () => {
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', handlePointerUp)
      document.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [isDragging, pos])

  // 클릭 vs 드래그 판정 후 처리
  const handlePointerUpOnButton = (e: React.PointerEvent<HTMLButtonElement>) => {
    const start = dragStartRef.current
    if (start?.moved) {
      // 드래그였으면 클릭 무시
      e.stopPropagation()
      e.preventDefault()
      return
    }
    setOpen(true)
  }

  // 위치를 실제 px로 계산
  const buttonStyle: React.CSSProperties = pos
    ? {
        position: 'fixed',
        left: pos.x <= 1 ? `${pos.x * 100}%` : `${pos.x}px`,
        top: pos.y <= 1 ? `${pos.y * 100}%` : `${pos.y}px`,
        transition: isDragging ? 'none' : 'left 200ms ease-out, top 200ms ease-out',
        right: 'auto',
        bottom: 'auto',
      }
    : {}

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

  // 관리자 페이지에서는 버튼 자체를 숨김
  if (isAdminRoute) return null

  return (
    <>
      {/* 플로팅 버튼 (드래그 가능) */}
      <button
        ref={buttonRef}
        onPointerDown={(e) => { setIsDragging(true); handlePointerDown(e) }}
        onPointerUp={handlePointerUpOnButton}
        onPointerCancel={() => { setIsDragging(false); dragStartRef.current = null }}
        onClick={(e) => {
          // 드래그였으면 클릭 무시 (pointerUp에서 처리됨)
          if (dragStartRef.current?.moved) {
            e.preventDefault()
            e.stopPropagation()
            return
          }
          setOpen(true)
          markAsSeen()
        }}
        style={buttonStyle}
        className={`z-40 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 flex items-center justify-center group select-none ${
          isDragging && dragStartRef.current?.moved
            ? 'cursor-grabbing scale-110 shadow-indigo-500/60'
            : 'cursor-grab hover:scale-105'
        } transition-transform ${pos ? '' : 'fixed bottom-[calc(1cm+env(safe-area-inset-bottom))] right-[1cm]'}`}
        aria-label="관리자에게 메시지 보내기 (드래그로 위치 이동)"
        title="클릭: 문의 열기 · 드래그: 위치 이동"
      >
        {isDragging && dragStartRef.current?.moved ? (
          <GripVertical className="w-5 h-5 text-white/90" />
        ) : (
          <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-[#050814] pointer-events-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* 토스트 */}
      {showToast && (
        <div
          className="fixed z-50 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-sm animate-fade-in"
          style={pos
            ? {
                // 비율 좌표 (스냅 후) → 토스트는 버튼 좌상단 기준 위로 띄움
                left: pos.x <= 1 ? `${pos.x * 100}%` : `${pos.x}px`,
                top: pos.y <= 1 ? `calc(${pos.y * 100}% - 88px)` : `${pos.y - 88}px`,
              }
            : { bottom: `calc(1cm + ${BUTTON_SIZE + 8}px + env(safe-area-inset-bottom, 0px))`, right: '1cm' }
          }
        >
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
