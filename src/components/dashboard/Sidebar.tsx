'use client'

import { usePathname, useRouter } from 'next/navigation'

const MENUS = [
  { key: 'dashboard', label: '대시보드', icon: '◈', href: '/dashboard' },
  { key: 'sermons', label: '설교 목록', icon: '☰', href: '/dashboard/sermons' },
  { key: 'new', label: '새 설교 등록', icon: '✚', href: '/dashboard/sermons/new' },
  { key: 'graph', label: '그래프', icon: '✦', href: '/dashboard/graph' },
  { key: 'statistics', label: '통계', icon: '▤', href: '/dashboard/statistics' },
  { key: 'series', label: '시리즈', icon: '◈', href: '/dashboard/series' },
  { key: 'tags', label: '태그 관리', icon: '▪', href: '/dashboard/tags' },
  { key: 'settings', label: '설정', icon: '◇', href: '/dashboard/settings' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <aside className="w-56 bg-sidebar text-white flex flex-col shrink-0 h-screen sticky top-0">
      <div
        className="px-5 py-5 border-b border-white/10 cursor-pointer"
        onClick={() => router.push('/dashboard')}
      >
        <h1 className="text-lg font-bold tracking-tight">설교 대시보드</h1>
        <p className="text-xs text-white/50 mt-0.5 leading-relaxed">
          설교를 저장하고, 연결하고,<br />다시 찾는 목회 지식 지도
        </p>
      </div>
      <nav className="flex-1 py-3 overflow-y-auto">
        {MENUS.map((menu) => {
          const isActive =
            pathname === menu.href ||
            (menu.key === 'sermons' &&
              pathname.startsWith('/dashboard/sermons') &&
              pathname !== '/dashboard/sermons/new') ||
            (menu.key === 'new' && pathname === '/dashboard/sermons/new')
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
      </nav>
      <div className="px-5 py-3 border-t border-white/10 text-xs text-white/30">
        v1.0
      </div>
    </aside>
  )
}
