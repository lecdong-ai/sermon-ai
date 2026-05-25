'use client'

import { useMemo } from 'react'
import { type PageView } from '@/types/dashboard'
import { SERMONS, SERIES } from '@/data/sampleSermons'
import {
  LayoutDashboard, FileText, GitBranch, BarChart3,
  BookOpen, Tags, Settings, ChevronRight, BookMarked, Plus
} from 'lucide-react'

interface SidebarProps {
  currentPage: PageView
  onNavigate: (page: PageView, params?: Record<string, string>) => void
  collapsed: boolean
  onToggle: () => void
}

const navItems: { id: PageView; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: '대시보드', icon: LayoutDashboard },
  { id: 'list', label: '설교 목록', icon: FileText },
  { id: 'graph', label: '지식 그래프', icon: GitBranch },
  { id: 'stats', label: '통계', icon: BarChart3 },
  { id: 'series', label: '시리즈', icon: BookOpen },
  { id: 'tags', label: '태그', icon: Tags },
  { id: 'new', label: '새 설교', icon: Plus },
  { id: 'settings', label: '설정', icon: Settings },
]

export default function Sidebar({ currentPage, onNavigate, collapsed, onToggle }: SidebarProps) {
  const sermonCount = useMemo(() => SERMONS.length, [])
  const seriesCount = useMemo(() => SERIES.length, [])

  return (
    <aside
      className={`relative z-40 flex flex-col bg-white/80 backdrop-blur-xl border-r border-slate-200/40 transition-all duration-300 ease-out ${
        collapsed ? 'w-[60px]' : 'w-60'
      }`}
    >
      {/* logo */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-slate-200/30">
        {!collapsed && (
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-slate-700 hover:text-indigo-600 transition-colors">
            <span className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
              <BookMarked className="w-4 h-4 text-indigo-500" />
            </span>
            <span className="font-semibold text-sm tracking-tight">설교 대시보드</span>
          </button>
        )}
        <button
          onClick={onToggle}
          className={`p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all ${collapsed ? 'mx-auto' : ''}`}
        >
          <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id || (currentPage === 'detail' && item.id === 'list') || (currentPage === 'edit' && item.id === 'list')
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-full" />
              )}
              <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-indigo-500' : ''}`} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.id === 'list' && (
                    <span className="text-[11px] font-medium bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{sermonCount}</span>
                  )}
                  {item.id === 'series' && (
                    <span className="text-[11px] font-medium bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{seriesCount}</span>
                  )}
                </>
              )}
            </button>
          )
        })}
      </nav>

      {/* footer */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-slate-200/30">
          <p className="text-[11px] text-slate-400">설교 대시보드 v1.0</p>
        </div>
      )}
    </aside>
  )
}
