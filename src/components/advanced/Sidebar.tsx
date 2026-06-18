'use client'

import { usePathname, useRouter } from 'next/navigation'
import { ADVANCED_MENUS, SECTION_LABELS } from '@/lib/advanced/constants'
import { 
  LayoutDashboard, BookOpen, FileText, Network, Sparkles, Archive, 
  Settings, Info, ArrowLeft, BrainCircuit, Zap, Database, Cross, Infinity
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

const VERSES = [
  { ref: '잠 3:5-6', text: '마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라' },
  { ref: '빌 4:13', text: '내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라' },
  { ref: '시 23:1', text: '여호와는 나의 목자시니 내게 부족함이 없으리로다' },
  { ref: '사 40:31', text: '오직 여호와를 앙망하는 자는 새 힘을 얻으리니' },
  { ref: '롬 8:28', text: '하나님을 사랑하는 자 곧 그 뜻대로 부르심을 입은 자들에게는 모든 것이 합력하여 선을 이루느니라' },
  { ref: '마 11:28', text: '수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라' },
  { ref: '딤후 3:16-17', text: '모든 성경은 하나님의 영감으로 된 것으로 교훈과 책망과 바르게 함과 의로 교육하기에 유익하니' },
]

function getDailyVerse(): { ref: string; text: string } {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return VERSES[dayOfYear % VERSES.length]
}

export default function AdvancedSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const verse = getDailyVerse()

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

      {/* 서비스 현황판 */}
      <div className="px-5 py-4 border-b border-white/5 bg-[#060a16]/40">
        {/* 상태 표시 */}
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)] animate-pulse" />
          <span className="text-[10px] font-semibold text-emerald-400/90">정상 운영 중</span>
        </div>

        {/* 시스템 상태 */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-400/70" />
              <span className="text-[9px] text-slate-500">AI 엔진</span>
            </div>
            <span className="text-[9px] text-slate-400">온라인</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Database className="w-3 h-3 text-blue-400/70" />
              <span className="text-[9px] text-slate-500">데이터베이스</span>
            </div>
            <span className="text-[9px] text-slate-400">온라인</span>
          </div>
        </div>

        {/* 무제한 배지 */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/15 mb-3">
          <Infinity className="w-3 h-3 text-indigo-400" />
          <span className="text-[9px] font-semibold text-indigo-300/90">모든 기능 제한 없이 이용 중</span>
        </div>

        {/* 오늘의 말씀 */}
        <div className="px-2.5 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <div className="flex items-center gap-1 mb-1">
            <Cross className="w-2.5 h-2.5 text-amber-400/50" />
            <span className="text-[8px] font-semibold text-slate-500 uppercase tracking-wider">오늘의 말씀</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed mb-1">{verse.text}</p>
          <p className="text-[9px] text-amber-400/70 font-semibold font-outfit">{verse.ref}</p>
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
        <div className="px-3 pt-2 text-[9px] text-slate-700 font-semibold font-outfit">Bunker 목양 v2.0</div>
      </div>
    </aside>
  )
}
