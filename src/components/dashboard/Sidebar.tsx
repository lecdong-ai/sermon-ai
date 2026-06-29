'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import UsagePanel from './UsagePanel'

const MENUS = [
  { key: 'dashboard', label: '대시보드', icon: '◈', href: '/dashboard' },
  { key: 'sermons', label: '설교 목록', icon: '☰', href: '/dashboard/sermons' },
  { key: 'new', label: '새 설교 등록', icon: '✚', href: '/sermon/new' },
  { key: 'uploaded', label: '업로드된 설교', icon: '⬆', href: '/dashboard/sermons/uploaded' },
  { key: 'graph', label: '그래프', icon: '✦', href: '/dashboard/graph' },
  { key: 'statistics', label: '통계', icon: '▤', href: '/dashboard/statistics' },
  { key: 'series', label: '시리즈', icon: '◈', href: '/dashboard/series' },
  { key: 'tags', label: '태그 관리', icon: '▪', href: '/dashboard/tags' },
  { key: 'conti', label: '콘티 제작', icon: '🎵', href: '/conti' },
  { key: 'settings', label: '설정', icon: '◇', href: '/dashboard/settings' },
]

function SupporterBadge() {
  const [data, setData] = useState<{ supporter: boolean; supporter_until: string | null } | null>(null)

  useEffect(() => {
    fetch('/api/usage')
      .then(r => r.json())
      .then(d => { if (!d.error) setData(d) })
      .catch(() => {})
  }, [])

  if (!data) return null

  return (
    <div className="px-5 py-3 border-b border-white/10">
      {data.supporter ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <span className="text-[14px]">🏅</span>
          <div>
            <p className="text-[12px] font-bold text-amber-300">사역 동참자</p>
            {data.supporter_until && (
              <p className="text-[9px] text-amber-400/60">
                ~{new Date(data.supporter_until).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      ) : (
        <Link
          href="/support"
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
        >
          <span className="text-[14px]">❤️</span>
          <div>
            <p className="text-[12px] font-semibold text-white/70">지금 후원하기</p>
            <p className="text-[9px] text-white/30">일반회원</p>
          </div>
        </Link>
      )}
    </div>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetch('/api/admin/check-role')
      .then(r => r.json())
      .then(d => setIsAdmin(d.admin))
      .catch(() => {})
  }, [])

  return (
    <aside className="w-56 bg-sidebar text-white flex flex-col shrink-0 h-full">
      <div
        className="px-5 py-5 border-b border-white/10 cursor-pointer"
        onClick={() => router.push('/dashboard')}
      >
        <h1 className="text-lg font-bold tracking-tight">설교 대시보드</h1>
        <p className="text-xs text-white/50 mt-0.5 leading-relaxed">
          설교를 저장하고, 연결하고,<br />다시 찾는 목회 지식 지도
        </p>
      </div>
      <SupporterBadge />
      <UsagePanel />
      <nav className="flex-1 py-3 overflow-y-auto">
        {MENUS.map((menu) => {
          const isActive =
            pathname === menu.href ||
            (menu.key === 'sermons' &&
              pathname.startsWith('/dashboard/sermons') &&
              pathname !== '/dashboard/sermons/new' &&
              pathname !== '/dashboard/sermons/uploaded') ||
            (menu.key === 'new' && pathname === '/sermon/new') ||
            (menu.key === 'uploaded' && pathname === '/dashboard/sermons/uploaded')
          return (
            <button
              key={menu.key}
              onClick={() => router.push(menu.href)}
              className={`w-full text-left px-5 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                isActive
                  ? 'bg-sidebar-active text-white border-l-2 border-white'
                  : 'text-white/60 hover:bg-sidebar-hover hover:text-white/90 border-l-2 border-transparent'
              }`}
            >
              <span className="text-xs w-4 text-center">{menu.icon}</span>
              <span>{menu.label}</span>
            </button>
          )
        })}
        {isAdmin && (
          <div className="px-5 pt-3 pb-1 mt-2 border-t border-white/10">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1 px-1">관리자</p>
            <button
              onClick={() => router.push('/admin')}
              className={`w-full text-left px-5 py-2.5 text-sm flex items-center gap-3 transition-colors rounded-lg ${
                pathname.startsWith('/admin')
                  ? 'bg-sidebar-active text-white'
                  : 'text-white/60 hover:bg-sidebar-hover hover:text-white/90'
              }`}
            >
              <span className="text-xs w-4 text-center">⚙</span>
              <span>관리자 패널</span>
            </button>
          </div>
        )}
      </nav>
      <div className="px-4 py-3 border-t border-white/10">
        <Link
          href="/"
          className="w-full text-left px-3 py-2 text-xs text-white/50 hover:text-white hover:bg-sidebar-hover rounded-md transition-colors flex items-center gap-2"
        >
          <span>←</span>
          <span>처음으로</span>
        </Link>
        <div className="px-3 py-1 text-[10px] text-white/20">
          v1.0
        </div>
      </div>
    </aside>
  )
}
