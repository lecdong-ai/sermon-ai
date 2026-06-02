'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const MENUS = [
  { key: 'dashboard', label: '대시보드', icon: '◈', href: '/dashboard' },
  { key: 'sermons', label: '설교 목록', icon: '☰', href: '/dashboard/sermons' },
  { key: 'new', label: '새 설교 등록', icon: '✚', href: '/sermon/new' },
  { key: 'uploaded', label: '업로드된 설교', icon: '⬆', href: '/dashboard/sermons/uploaded' },
  { key: 'graph', label: '그래프', icon: '✦', href: '/dashboard/graph' },
  { key: 'statistics', label: '통계', icon: '▤', href: '/dashboard/statistics' },
  { key: 'series', label: '시리즈', icon: '◈', href: '/dashboard/series' },
  { key: 'tags', label: '태그 관리', icon: '▪', href: '/dashboard/tags' },
  { key: 'settings', label: '설정', icon: '◇', href: '/dashboard/settings' },
]

function UsageBadge() {
  const [usage, setUsage] = useState<{ plan: string; trial?: { used: number; limit: number; remaining: number }; monthly?: { used: number; limit: number; remaining: number } } | null>(null)

  useEffect(() => {
    fetch('/api/usage')
      .then(r => r.json())
      .then(d => { if (!d.error) setUsage(d) })
      .catch(() => {})
  }, [])

  if (!usage) return null

  const trial = usage.trial
  const monthly = usage.monthly
  const remaining = trial?.remaining ?? monthly?.remaining ?? 0
  const limit = trial?.limit ?? monthly?.limit ?? 0
  const used = trial?.used ?? monthly?.used ?? 0
  const pct = limit > 0 ? (used / limit) * 100 : 0
  const barColor = pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981'

  return (
    <div className="px-5 py-3 border-b border-white/10">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">사용량</span>
        <span className="text-[10px] text-white/50">
          <span style={{ color: barColor, fontWeight: 600 }}>{remaining}</span>
          <span className="text-white/30">/{limit}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }}
        />
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[9px] text-white/25">
          {usage.plan === 'pro' ? 'Pro 플랜' : trial ? '무료체험' : '월간'}
        </span>
        {usage.plan === 'pro' ? (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium">무제한</span>
        ) : (
          <span className="text-[9px] text-white/25">AI 분석</span>
        )}
      </div>
    </div>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

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
      <UsageBadge />
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
      </nav>
      <div className="px-4 py-3 border-t border-white/10">
        <button
          onClick={() => router.push('/')}
          className="w-full text-left px-3 py-2 text-xs text-white/50 hover:text-white hover:bg-sidebar-hover rounded-md transition-colors flex items-center gap-2"
        >
          <span>←</span>
          <span>처음으로</span>
        </button>
        <div className="px-3 py-1 text-[10px] text-white/20">
          v1.0
        </div>
      </div>
    </aside>
  )
}
