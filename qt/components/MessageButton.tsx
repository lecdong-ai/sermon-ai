'use client'

import { useEffect, useRef, useState } from 'react'
import { MessageSquare, X, Mail, GripVertical } from 'lucide-react'

const ADMIN_EMAIL = 'lecdong@gmail.com'
const POS_KEY = 'qt_msg_btn_pos'
const DRAG_THRESHOLD = 5
const BUTTON_SIZE = 56
const MARGIN = 38
const SAFE_MIN = 0.04
const SAFE_MAX = 0.96

export default function MessageButton() {
  const [open, setOpen] = useState(false)

  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ pointerX: number; pointerY: number; btnX: number; btnY: number; moved: boolean } | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

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

  const savePos = (next: { x: number; y: number }) => {
    try { localStorage.setItem(POS_KEY, JSON.stringify(next)) } catch {}
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (open) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const rect = buttonRef.current?.getBoundingClientRect()
    if (!rect) return
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
      const maxX = window.innerWidth - BUTTON_SIZE - MARGIN
      const maxY = window.innerHeight - BUTTON_SIZE - MARGIN
      const newX = Math.max(MARGIN, Math.min(maxX, start.btnX + dx))
      const newY = Math.max(MARGIN, Math.min(maxY, start.btnY + dy))
      setPos({ x: newX, y: newY })
    }
    const handlePointerUp = () => {
      const start = dragStartRef.current
      if (start?.moved && pos) {
        const ratioX = pos.x / window.innerWidth
        const ratioY = pos.y / window.innerHeight
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

  const handlePointerUpOnButton = (e: React.PointerEvent<HTMLButtonElement>) => {
    const start = dragStartRef.current
    if (start?.moved) {
      e.stopPropagation()
      e.preventDefault()
      return
    }
    setOpen(true)
  }

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

  return (
    <>
      <button
        ref={buttonRef}
        onPointerDown={(e) => { setIsDragging(true); handlePointerDown(e) }}
        onPointerUp={handlePointerUpOnButton}
        onPointerCancel={() => { setIsDragging(false); dragStartRef.current = null }}
        onClick={(e) => {
          if (dragStartRef.current?.moved) {
            e.preventDefault()
            e.stopPropagation()
            return
          }
          setOpen(true)
        }}
        style={buttonStyle}
        className={`z-40 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 flex items-center justify-center group select-none ${
          isDragging && dragStartRef.current?.moved
            ? 'cursor-grabbing scale-110 shadow-indigo-500/60'
            : 'cursor-grab hover:scale-105'
        } transition-transform ${pos ? '' : 'fixed bottom-[calc(1cm+env(safe-area-inset-bottom))] right-[1cm]'}`}
        aria-label="관리자에게 연락"
        title="클릭: 관리자 연락처 · 드래그: 위치 이동"
      >
        {isDragging && dragStartRef.current?.moved ? (
          <GripVertical className="w-5 h-5 text-white/90" />
        ) : (
          <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm bg-[#0a0e1a] border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden animate-scale-in"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-[14px] font-extrabold text-slate-100">관리자에게 연락</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Mail className="w-7 h-7 text-indigo-400" />
              </div>
              <p className="text-[13px] text-slate-300 leading-relaxed">
                궁금하신 점이나 제안사항이 있으시면<br />
                아래 이메일로 연락 부탁드립니다.
              </p>
              <a
                href={`mailto:${ADMIN_EMAIL}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-bold transition-colors"
              >
                <Mail className="w-4 h-4" />
                {ADMIN_EMAIL}
              </a>
              <a
                href="/advanced/qt"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-[13px] font-bold transition-colors"
              >
                ⚙ 관리자 페이지
              </a>
            </div>

            <div className="px-5 py-3 border-t border-white/5 flex justify-end bg-white/[0.02]">
              <button
                onClick={() => setOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-[12px] text-slate-400 hover:text-slate-200 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
