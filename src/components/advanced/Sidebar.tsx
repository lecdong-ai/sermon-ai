'use client'

import { usePathname, useRouter } from 'next/navigation'
import { ADVANCED_MENUS, SECTION_LABELS } from '@/lib/advanced/constants'
import { useLimits } from '@/components/dashboard/UsageCounter'
import { 
  LayoutDashboard, BookOpen, FileText, Network, Sparkles, Archive, 
  Settings, Info, ArrowLeft, BrainCircuit, Zap, Cross, Youtube
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
  youtube: Youtube,
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
  const { limits, loading: limitsLoading } = useLimits()

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

        {/* 📊 이번 달 연구 현황 */}
        <div className="mb-3">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider px-0.5 mb-2 flex items-center gap-1">
            <Zap className="w-2.5 h-2.5 text-indigo-400" />
            연구 현황
          </p>

          {!limits || limitsLoading ? (
            <div className="animate-pulse space-y-2 px-0.5">
              <div className="h-3 bg-white/5 rounded w-3/4" />
              <div className="h-2 bg-white/5 rounded w-1/2" />
            </div>
          ) : (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] px-3 py-2.5 space-y-2.5">
              {/* AI 분석 6종 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-medium">AI 분석</span>
                  <span className="text-[10px] tabular-nums font-bold text-slate-200">
                    {limits.actions.ai_analysis.current}
                    <span className="text-slate-600 mx-0.5">/</span>
                    {limits.actions.ai_analysis.limit > 0 ? limits.actions.ai_analysis.limit : '∞'}
                  </span>
                </div>
                <ProgressBar
                  current={limits.actions.ai_analysis.current}
                  limit={limits.actions.ai_analysis.limit}
                  color="amber"
                />
              </div>

              {/* 말씀 연구실 (project) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-medium">연구실</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] tabular-nums font-bold text-slate-200">
                      {limits.actions.project.current}
                      <span className="text-slate-600 mx-0.5">/</span>
                      {limits.actions.project.limit > 0 ? limits.actions.project.limit : '∞'}
                    </span>
                    {limits.actions.project.limit > 0 && limits.tier === 'general' && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[8.5px] font-bold">
                        🎁 1회
                      </span>
                    )}
                  </div>
                </div>
                <ProgressBar
                  current={limits.actions.project.current}
                  limit={limits.actions.project.limit}
                  color="indigo"
                />
              </div>

              {/* 리셋 D-Day */}
              <div className="flex items-center justify-between pt-1 border-t border-white/[0.03]">
                <span className="text-[9px] text-slate-600 font-medium uppercase tracking-wider">리셋</span>
                <span className="text-[10px] tabular-nums font-bold text-slate-400">D-{limits.daysUntilReset}</span>
              </div>
            </div>
          )}
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

/* ── Holographic Progress Bar ── */
function ProgressBar({ current, limit, color = 'indigo' }: {
  current: number
  limit: number
  color?: 'indigo' | 'amber' | 'emerald' | 'rose'
}) {
  if (limit <= 0) {
    return (
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full w-full bg-gradient-to-r from-emerald-500/60 via-emerald-400/40 to-emerald-500/60 animate-pulse-slow" />
      </div>
    )
  }

  const pct = Math.min(100, (current / limit) * 100)
  const isFull = current >= limit
  const isAlmost = !isFull && pct >= 80

  const colorConfig = {
    indigo: {
      bar: 'from-indigo-500 via-indigo-400 to-purple-500',
      glow: 'rgba(99, 102, 241, 0.5)',
    },
    amber: {
      bar: 'from-amber-500 via-amber-400 to-orange-500',
      glow: 'rgba(245, 158, 11, 0.5)',
    },
    emerald: {
      bar: 'from-emerald-500 via-emerald-400 to-cyan-500',
      glow: 'rgba(16, 185, 129, 0.5)',
    },
    rose: {
      bar: 'from-rose-500 via-rose-400 to-pink-500',
      glow: 'rgba(244, 63, 94, 0.5)',
    },
  }[color]

  const finalColor = isFull ? 'from-rose-500 via-rose-400 to-pink-500' :
                      isAlmost ? 'from-amber-500 via-amber-400 to-orange-500' :
                      colorConfig.bar

  const finalGlow = isFull ? 'rgba(244, 63, 94, 0.6)' :
                     isAlmost ? 'rgba(245, 158, 11, 0.6)' :
                     colorConfig.glow

  return (
    <div className="relative h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
      {/* 배경 그리드 (미래지향적) */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'repeating-linear-gradient(90deg, transparent 0, transparent 8px, rgba(255,255,255,0.05) 8px, rgba(255,255,255,0.05) 9px)'
      }} />

      {/* 진행 바 */}
      <div
        className={`relative h-full rounded-full bg-gradient-to-r ${finalColor} transition-all duration-700 ease-out`}
        style={{
          width: `${pct}%`,
          boxShadow: `0 0 8px ${finalGlow}, 0 0 2px ${finalGlow}`,
        }}
      >
        {/* 내부 shimmer */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent"
               style={{ animation: 'shimmer 2.5s ease-in-out infinite' }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  )
}
