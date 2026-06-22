'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import {
  LayoutDashboard, Users, ChevronLeft, Shield,
  Loader2, Home,
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
    return null
  }

  if (!isAdminUser) return null

  return (
    <div className="min-h-screen bg-[#04060f]">
      <div className="flex">
        <aside className="w-60 h-screen bg-[#0a0e1a] border-r border-white/5 flex flex-col shrink-0 fixed left-0 top-0 z-30">
          <div className="px-5 py-5 border-b border-white/5">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[15px] font-extrabold text-slate-100">Admin</p>
                <p className="text-[10px] text-slate-500">관리자 패널</p>
              </div>
            </Link>
          </div>
          <nav className="flex-1 py-3 overflow-y-auto">
            {ADMIN_MENUS.map((menu) => {
              const Icon = menu.icon
              const isActive = pathname === menu.href || (
                menu.key !== 'overview' && pathname.startsWith(menu.href)
              )
              return (
                <Link
                  key={menu.key}
                  href={menu.href}
                  className={`flex items-center gap-3 px-5 py-2.5 text-[14px] font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-300 border-r-2 border-indigo-500'
                      : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {menu.label}
                </Link>
              )
            })}
          </nav>
          <div className="px-4 py-3 border-t border-white/5 space-y-1">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-[13px] text-slate-500 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-all w-full"
            >
              <Home className="w-3.5 h-3.5" />
              메인페이지
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 text-[13px] text-slate-500 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-all w-full"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              대시보드
            </Link>
          </div>
        </aside>
        <main className="ml-60 flex-1 min-h-screen">
          <div className="max-w-6xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
