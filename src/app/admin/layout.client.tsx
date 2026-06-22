'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import {
  LayoutDashboard, Users, Search, Bell, ChevronDown,
  Shield, Home, ChevronLeft,
} from 'lucide-react'

const ADMIN_MENUS = [
  { key: 'overview', label: '대시보드', icon: LayoutDashboard, href: '/admin' },
  { key: 'users', label: '회원 관리', icon: Users, href: '/admin/users' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [checking, setChecking] = useState(true)
  const [isAdminUser, setIsAdminUser] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (loading || !mounted) return
    if (!user) {
      router.push('/login?redirect=/admin')
      return
    }
    fetch('/api/admin/check-role')
      .then(r => r.json())
      .then(d => {
        if (!d.admin) {
          router.push('/dashboard')
          return
        }
        setIsAdminUser(true)
      })
      .catch(() => router.push('/dashboard'))
      .finally(() => setChecking(false))
  }, [user, loading, mounted, router])

  if (!mounted || loading || checking) {
    return (
      <div className="min-h-screen bg-[#04060f] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAdminUser) return null

  return (
    <div className="min-h-screen bg-[#04060f] text-slate-200">
      {/* ─── 상단 바 ─── */}
      <header className="sticky top-0 z-30 h-14 bg-[#0a0e1a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="h-full flex items-center px-4 gap-4">
          <Link href="/admin" className="flex items-center gap-2 pr-4 border-r border-white/5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[14px] font-bold text-slate-100">Bunker 목양</span>
            <span className="text-[10px] text-slate-500 font-medium px-1.5 py-0.5 bg-white/5 rounded">Admin</span>
          </Link>

          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="회원, 로그 검색..."
              className="w-full pl-9 pr-3 h-8 bg-white/5 border border-white/5 rounded-lg text-[13px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:bg-white/[0.07] focus:border-white/10"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">⌘K</kbd>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
            </button>
            <div className="w-px h-5 bg-white/5 mx-1" />
            <button className="flex items-center gap-2 h-8 px-2 rounded-lg hover:bg-white/5 transition-colors">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                {user?.email?.[0]?.toUpperCase() || 'A'}
              </div>
              <span className="text-[12px] text-slate-300 max-w-[120px] truncate">{user?.email}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* ─── 사이드바 ─── */}
        <aside className="w-56 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] bg-[#0a0e1a] border-r border-white/5 flex flex-col">
          <nav className="flex-1 p-3 space-y-0.5">
            {ADMIN_MENUS.map((menu) => {
              const Icon = menu.icon
              const isActive = pathname === menu.href || (
                menu.key !== 'overview' && pathname.startsWith(menu.href)
              )
              return (
                <Link
                  key={menu.key}
                  href={menu.href}
                  className={`flex items-center gap-2.5 px-3 h-8 text-[13px] rounded-md transition-colors ${
                    isActive
                      ? 'bg-white/10 text-slate-100 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {menu.label}
                </Link>
              )
            })}
          </nav>

          <div className="p-3 border-t border-white/5 space-y-0.5">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 px-3 h-8 text-[12px] text-slate-500 hover:text-slate-200 hover:bg-white/5 rounded-md transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              대시보드
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2.5 px-3 h-8 text-[12px] text-slate-500 hover:text-slate-200 hover:bg-white/5 rounded-md transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              메인페이지
            </Link>
          </div>

          {/* 시스템 상태 */}
          <div className="p-3 mx-3 mb-3 bg-white/[0.03] border border-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[11px] font-semibold text-slate-200">시스템 정상</span>
            </div>
            <p className="text-[10px] text-slate-500">모든 서비스 운영 중</p>
          </div>
        </aside>

        {/* ─── 메인 ─── */}
        <main className="flex-1 min-w-0">
          <div className="max-w-7xl mx-auto px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
