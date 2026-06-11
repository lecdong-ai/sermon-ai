'use client'

import { usePathname, useRouter } from 'next/navigation'
import { ADVANCED_MENUS, SECTION_LABELS } from '@/lib/advanced/constants'

export default function AdvancedSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const sections = Array.from(new Set(ADVANCED_MENUS.map(m => m.section)))

  return (
    <aside className="w-56 bg-navy-600 text-white flex flex-col shrink-0 h-full">
      <div
        className="px-5 py-5 border-b border-white/[0.06] cursor-pointer"
        onClick={() => router.push('/advanced')}
      >
        <h1 className="text-base font-bold tracking-tight font-serif">말씀 연구실</h1>
        <p className="text-xs text-white/60 mt-0.5 leading-relaxed">
          목회자를 위한 고급 설교 작업실
        </p>
      </div>

      <div className="px-5 py-3 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">사용량</span>
          <span className="text-[11px] text-white/60">
            <span className="text-green-300 font-medium">6</span>
            <span className="text-white/35">/10</span>
          </span>
        </div>
        <div className="h-1 rounded-full overflow-hidden bg-white/[0.12]">
          <div className="h-full rounded-full bg-green-400 w-[60%] transition-all" />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-white/40">Pro 플랜</span>
          <span className="text-[10px] text-white/40">AI 분석</span>
        </div>
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        {sections.map(section => (
          <div key={section}>
            {section !== 'main' && (
              <p className="px-5 pt-3 pb-1 text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                {SECTION_LABELS[section]}
              </p>
            )}
            {ADVANCED_MENUS.filter(m => m.section === section).map(menu => {
              const isActive =
                pathname === menu.href ||
                (menu.key === 'projects' && pathname.startsWith('/advanced/projects')) ||
                (menu.key === 'intro' && pathname === '/intro')
              return (
                <button
                  key={menu.key}
                  onClick={() => router.push(menu.href)}
                  className={`w-full text-left px-5 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                    isActive
                      ? 'bg-navy-700 text-white border-l-2 border-green-400'
                      : 'text-white/50 hover:bg-navy-700/50 hover:text-white/80 border-l-2 border-transparent'
                  }`}
                >
                  <span className="text-xs w-4 text-center opacity-60">{menu.icon}</span>
                  <span>{menu.label}</span>
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-white/[0.06]">
        <button
          onClick={() => router.push('/')}
          className="w-full text-left px-3 py-2 text-xs text-white/50 hover:text-white hover:bg-navy-700/50 rounded-md transition-colors flex items-center gap-2"
        >
          <span className="text-xs">←</span>
          <span>메인 사이트</span>
        </button>
        <div className="px-3 py-1 text-[10px] text-white/30">v2.0</div>
      </div>
    </aside>
  )
}
