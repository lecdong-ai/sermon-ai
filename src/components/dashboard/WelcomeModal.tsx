'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Upload, BrainCircuit, HardDrive, FileCheck, LayoutDashboard, ChevronRight, Users, Sparkles } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

const WELCOME_KEY = 'bunker_welcome_seen'

const QUICK_START = [
  { icon: Upload, title: '설교 파일 업로드', desc: 'PDF, DOCX, TXT (최대 20MB)', color: 'from-indigo-500 to-blue-500' },
  { icon: BrainCircuit, title: 'AI 6종 콘텐츠 생성', desc: '요약 · 소그룹 · 카드뉴스 · PPT · QT · 설교 질문', color: 'from-purple-500 to-pink-500' },
  { icon: HardDrive, title: '아카이브 영구 저장', desc: '작성한 모든 콘텐츠 클라우드 보관', color: 'from-cyan-500 to-teal-500' },
  { icon: FileCheck, title: '통찰 노트 + 검색', desc: '묵상과 아이디어 키워드로 빠르게 검색', color: 'from-amber-500 to-orange-500' },
]

export default function WelcomeModal() {
  const router = useRouter()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    if (typeof window === 'undefined') return
    try {
      const seen = localStorage.getItem(WELCOME_KEY)
      if (seen) return
    } catch {}
    setTimeout(() => setOpen(true), 400)
  }, [user])

  const close = () => {
    setOpen(false)
    try { localStorage.setItem(WELCOME_KEY, String(Date.now())) } catch {}
  }

  const handleStart = () => {
    close()
    router.push('/dashboard/sermons')
  }

  if (!user || !open) return null

  const displayName = user.email?.split('@')[0] || '회원'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={close}
    >
      <div
        className="relative w-full max-w-2xl bg-[#0a0e1a] border border-white/10 rounded-3xl shadow-2xl shadow-black/40 animate-modal-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative px-6 sm:px-8 pt-8 pb-5 border-b border-white/5">
          <button
            onClick={close}
            className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label="닫기"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold">
              <Users className="w-3 h-3" />
              모든 기능 무료
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
              <Sparkles className="w-3 h-3" />
              평생 무료
            </div>
          </div>
          <h2 className="text-[22px] sm:text-[26px] font-extrabold text-white leading-tight tracking-tight">
            환영합니다, {displayName}님!
          </h2>
          <p className="text-[13px] sm:text-[14px] text-slate-400 mt-2 leading-relaxed">
            모든 기능을 <strong className="text-emerald-300">무료</strong>로 이용하실 수 있습니다.
          </p>
        </div>

        <div className="px-6 sm:px-8 py-6 border-b border-white/5">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
            지금 바로 사용 가능한 기능
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {QUICK_START.map((item, idx) => {
              const Icon = item.icon
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5"
                >
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0 shadow-sm`}>
                    <Icon className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-bold text-white">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="px-6 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={close}
            className="text-[12px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            나중에 보기
          </button>
          <button
            onClick={handleStart}
            className="flex-1 sm:flex-none group inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-[13px] shadow-lg shadow-indigo-500/20 transition-all"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            설교 관리 시작
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  )
}
