'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import {
  User, LogOut, LayoutDashboard, Music2, Calendar, Users, Heart,
  Settings, ChevronRight, Cross, ScrollText,
} from 'lucide-react'

export default function ContiUserMenu() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [supporter, setSupporter] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      fetch('/api/usage')
        .then((r) => r.json())
        .then((d) => { if (!d.error) setSupporter(d.supporter) })
        .catch(() => {})
    }
  }, [user])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  async function handleSignOut() {
    setOpen(false)
    await signOut()
    router.push('/')
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-bold transition-colors"
      >
        로그인
      </Link>
    )
  }

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center">
        {/* 사용자 버튼 */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 px-1.5 py-1 rounded-md border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all"
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <User className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="text-[12px] font-bold text-slate-200 hidden md:block max-w-[80px] truncate">
            {user.email?.split('@')[0]}
          </span>
        </button>
      </div>

      {/* 드롭다운 */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-[#0c1020] rounded-2xl shadow-2xl shadow-black/40 border border-white/10 py-2 z-50">
          {/* 사용자 정보 */}
          <div className="px-4 py-2.5 border-b border-white/5 mb-1.5">
            <p className="text-[12px] text-slate-500 font-medium">로그인 정보</p>
            <p className="text-[14px] font-bold text-white truncate mt-0.5">{user.email}</p>
            <div className="mt-1.5">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[12px] font-bold ${
                supporter
                  ? 'bg-indigo-500/15 text-indigo-300'
                  : 'bg-white/5 text-slate-500'
              }`}>
                {supporter ? '🏅 사역 동참자' : '일반회원'}
              </span>
            </div>
          </div>

          {/* 메뉴 */}
          <MenuLink href="/" icon={<Cross className="w-4 h-4 text-rose-300" />} label="Bunker 홈" onClick={() => setOpen(false)} />
          <MenuLink href="/dashboard" icon={<LayoutDashboard className="w-4 h-4 text-indigo-300" />} label="설교 아카이브" onClick={() => setOpen(false)} />
          <MenuLink href="/conti" icon={<Music2 className="w-4 h-4 text-indigo-300" />} label="예배 콘티" onClick={() => setOpen(false)} highlight />
          <MenuLink href="/conti/calendar" icon={<Calendar className="w-4 h-4 text-purple-300" />} label="예배 캘린더" onClick={() => setOpen(false)} />
          <MenuLink href="/conti/teams" icon={<Users className="w-4 h-4 text-amber-300" />} label="팀 관리" onClick={() => setOpen(false)} />

          {supporter ? (
            <MenuLink href="/advanced/bible" icon={<ScrollText className="w-4 h-4 text-indigo-300" />} label="말씀 연구실" onClick={() => setOpen(false)} badge="👑" />
          ) : (
            <MenuLink
              href="/support"
              icon={<Heart className="w-4 h-4 text-rose-300" />}
              label="말씀 연구실"
              onClick={() => setOpen(false)}
              badge="👑 후원"
            />
          )}

          <div className="border-t border-white/5 my-1.5" />

          <MenuLink href="/support" icon={<Heart className="w-4 h-4 text-rose-300" />} label="후원 안내" onClick={() => setOpen(false)} />
          <MenuLink href="/mypage" icon={<Settings className="w-4 h-4 text-slate-400" />} label="설정" onClick={() => setOpen(false)} />

          <div className="border-t border-white/5 my-1.5" />

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-[14px] font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
        </div>
      )}
    </div>
  )
}

function MenuLink({
  href, icon, label, onClick, badge, highlight,
}: {
  href: string
  icon: React.ReactNode
  label: string
  onClick?: () => void
  badge?: string
  highlight?: boolean
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-4 py-2 text-[14px] font-bold transition-all ${
        highlight
          ? 'text-amber-200 bg-amber-500/10'
          : 'text-slate-300 hover:text-indigo-200 hover:bg-white/5'
      }`}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="text-[11px] font-extrabold text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30">
          {badge}
        </span>
      )}
      <ChevronRight className="w-3 h-3 text-slate-600" />
    </Link>
  )
}
