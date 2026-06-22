'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Check, CheckCheck, ExternalLink } from 'lucide-react'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  read: boolean
  created_at: string
}

const TYPE_COLORS: Record<string, string> = {
  new_user: 'bg-indigo-500',
  new_donation: 'bg-emerald-500',
  quota_warning: 'bg-amber-500',
  error: 'bg-rose-500',
  system: 'bg-slate-500',
}

const TYPE_LABELS: Record<string, string> = {
  new_user: '신규 회원',
  new_donation: '후원',
  quota_warning: 'quota 경고',
  error: '에러',
  system: '시스템',
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

export default function NotificationDropdown() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/notifications?limit=20')
      const data = await res.json()
      if (data.success) {
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Poll every 60s while open or always (background)
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  // Click outside to close
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Esc to close
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  const handleOpen = () => {
    setOpen(o => !o)
  }

  const handleItemClick = async (n: Notification) => {
    if (!n.read) {
      try {
        await fetch(`/api/admin/notifications/${n.id}`, { method: 'PATCH' })
        setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
        setUnreadCount(prev => Math.max(0, prev - 1))
      } catch (e) {
        console.error(e)
      }
    }
    if (n.link) {
      router.push(n.link)
    }
    setOpen(false)
  }

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/admin/notifications', { method: 'PATCH' })
      const data = await res.json()
      if (data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors"
        aria-label="알림"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-96 max-w-[calc(100vw-2rem)] bg-[#0a0e1a] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-modal-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <h3 className="text-[13px] font-bold text-slate-100">알림</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] text-slate-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3 h-3" />
                모두 읽음
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto scrollbar-thin">
            {loading && notifications.length === 0 ? (
              <div className="px-4 py-12 text-center text-[12px] text-slate-500">불러오는 중...</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <Bell className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-[12px] text-slate-500">알림이 없습니다</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map(n => (
                  <button
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={`w-full text-left px-4 py-3 hover:bg-white/[0.04] transition-colors flex items-start gap-2.5 ${
                      !n.read ? 'bg-indigo-500/[0.04]' : ''
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${TYPE_COLORS[n.type] || 'bg-slate-500'} ${!n.read ? '' : 'opacity-30'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          {TYPE_LABELS[n.type] || n.type}
                        </span>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                      </div>
                      <p className={`text-[12px] mt-0.5 line-clamp-2 ${!n.read ? 'text-slate-100 font-medium' : 'text-slate-300'}`}>
                        {n.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] text-slate-600">{timeAgo(n.created_at)}</span>
                        {n.link && <ExternalLink className="w-2.5 h-2.5 text-slate-600" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
