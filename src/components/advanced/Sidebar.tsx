'use client'

import { usePathname, useRouter } from 'next/navigation'
import { ADVANCED_MENUS, SECTION_LABELS } from '@/lib/advanced/constants'
import { 
  LayoutDashboard, BookOpen, FileText, Network, Sparkles, Archive, 
  Settings, Info, ArrowLeft, BrainCircuit, Activity
} from 'lucide-react'

const MENU_ICONS: Record<string, any> = {
  intro: Info,
  dashboard: LayoutDashboard,
  projects: FileText,
  bible: BookOpen,
  prepare: FileText,
  manuscript: FileText,
  archive: Archive,
  graph: Network,
  notes: Sparkles,
  series: BookOpen,
  settings: Settings,
}

export default function AdvancedSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const sections = Array.from(new Set(ADVANCED_MENUS.map(m => m.section)))

  return (
    <aside className="w-56 bg-[#04060f] border-r border-white/5 text-slate-300 flex flex-col shrink-0 h-full relative z-20">
      {/* 로고 영역 */}
      <div
        className="px-5 py-5 border-b border-white/5 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => router.push('/advanced')}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BrainCircuit className="w-3.5 h-3.5 text-white" />
          </div>
          <h1 className="text-[15px] font-bold tracking-tight text-white font-outfit">말씀 연구실</h1>
        </div>
        <p className="text-[10px] text-slate-500 mt-1 font-medium">
          목회자를 위한 지능형 AI 워크스페이스
        </p>
      </div>

      {/* 사용량 모니터링 */}
      <div className="px-5 py-4 border-b border-white/5 bg-[#060a16]/40">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">AI 분석 크레딧</span>
          <span className="text-[10px] text-slate-400 font-bold">
            <span className="text-indigo-400">6</span>
            <span className="text-slate-600"> / 10</span>
          </span>
        </div>
        <div className="h-1 rounded-full overflow-hidden bg-white/5 border border-white/[0.02]">
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[60%] transition-all duration-500" />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[9px] text-slate-600">Pro 플랜 적용 중</span>
          <span className="text-[9px] text-indigo-400/80 font-semibold flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-indigo-400 animate-ping" />
            활성 상태
          </span>
        </div>
      </div>

      {/* 메뉴 링크 */}
      <nav className="flex-1 py-4 overflow-y-auto space-y-4 scrollbar-thin">
        {sections.map(section => (
          <div key={section} className="space-y-1">
            {section !== 'main' && (
              <p className="px-5 text-[9px] font-semibold text-slate-600 uppercase tracking-widest mb-1">
                {SECTION_LABELS[section]}
              </p>
            )}
            {ADVANCED_MENUS.filter(m => m.section === section).map(menu => {
              const isActive =
                pathname === menu.href ||
                (menu.key === 'projects' && pathname.startsWith('/advanced/projects')) ||
                (menu.key === 'intro' && pathname === '/intro')
              
              const IconComp = MENU_ICONS[menu.key] || FileText
              
              return (
                <button
                  key={menu.key}
                  onClick={() => router.push(menu.href)}
                  className={`w-full text-left px-5 py-2.5 text-[13px] font-medium flex items-center justify-between transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-950/40 via-indigo-950/15 to-transparent text-white border-l-2 border-indigo-500 shadow-inner'
                      : 'text-slate-500 hover:bg-white/[0.02] hover:text-slate-300 border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-400'
                    }`} />
                    <span>{menu.label}</span>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse" />
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* 하단 제어 */}
      <div className="px-4 py-4 border-t border-white/5 bg-[#03050b]/80">
        <button
          onClick={() => router.push('/')}
          className="w-full text-left px-3 py-2 text-[11px] text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all flex items-center gap-2 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-600 group-hover:text-white transition-transform group-hover:-translate-x-0.5" />
          <span>메인 사이트 이동</span>
        </button>
        <div className="px-3 pt-2 text-[9px] text-slate-700 font-semibold font-outfit">SermonAI OS v2.0</div>
      </div>
    </aside>
  )
}
