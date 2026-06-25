'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Sparkles, Upload, BrainCircuit, HardDrive, LayoutDashboard, Crown, FileCheck, ChevronRight, Check, Users, Heart } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

const WELCOME_KEY = 'bunker_welcome_seen'

const QUICK_START = [
  { icon: Upload, title: '설교 파일 업로드', desc: 'PDF, DOCX, TXT (최대 20MB)', color: 'from-indigo-500 to-blue-500' },
  { icon: BrainCircuit, title: 'AI 6종 콘텐츠 생성', desc: '요약 · 소그룹 · 카드뉴스 · PPT · QT · 설교 질문', color: 'from-purple-500 to-pink-500' },
  { icon: HardDrive, title: '아카이브 영구 저장', desc: '작성한 모든 콘텐츠 클라우드 보관', color: 'from-cyan-500 to-teal-500' },
  { icon: FileCheck, title: '통찰 노트 + 검색', desc: '묵상과 아이디어 키워드로 빠르게 검색', color: 'from-amber-500 to-orange-500' },
]

const PRO_PREVIEW = [
  '말씀 연구실 (Advanced) + 성경 정밀 연구',
  '고급 AI 모델 우선 사용',
  '워크스페이스 20개',
  '신규 기능 우선 접근',
]

export default function WelcomeModal() {
  const router = useRouter()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [isSupporter, setIsSupporter] = useState<boolean | null>(null)

  // 가입 후 첫 방문 감지
  useEffect(() => {
    if (!user) return
    if (typeof window === 'undefined') return
    try {
      const seen = localStorage.getItem(WELCOME_KEY)
      if (seen) return
    } catch {}

    // 사용자의 사역 동참자 여부 확인
    fetch('/api/usage')
      .then(r => r.json())
      .then(d => {
        if (d.error) {
          setIsSupporter(false)
          return
        }
        const supporter = !!d.supporter
        setIsSupporter(supporter)
        // 일반 회원만 welcome 표시 (사역 동참자는 별도 축하 모달 자리)
        if (!supporter) {
          setTimeout(() => setOpen(true), 400)
        } else {
          // 사역 동참자는 welcome 기록만 남김
          try { localStorage.setItem(WELCOME_KEY, 'supporter') } catch {}
        }
      })
      .catch(() => {
        setIsSupporter(false)
        setTimeout(() => setOpen(true), 400)
      })
  }, [user])

  const close = () => {
    setOpen(false)
    try { localStorage.setItem(WELCOME_KEY, String(Date.now())) } catch {}
  }

  const handleStart = () => {
    close()
    router.push('/dashboard/sermons')
  }

  if (!user || isSupporter !== false) return null
  if (!open) return null

  const displayName = user.email?.split('@')[0] || '회원'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={close}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0a0e1a] border border-white/10 rounded-3xl shadow-2xl shadow-black/40 animate-modal-in"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
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
              일반 회원
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
            회원님은 지금 <strong className="text-indigo-300">일반 회원</strong>입니다.
            아래 기능을 <strong className="text-emerald-300">후원 없이</strong> 바로 사용하실 수 있어요.
          </p>
        </div>

        {/* 빠른 시작 */}
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

        {/* 사역 동참자 업그레이드 미리보기 */}
        <div className="px-6 sm:px-8 py-5 border-b border-white/5 bg-gradient-to-br from-amber-500/[0.04] to-transparent">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              사역 동참자가 되면
            </h3>
          </div>
          <ul className="space-y-1.5">
            {PRO_PREVIEW.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-[12.5px] text-slate-300">
                <Check className="w-3.5 h-3.5 text-amber-300 shrink-0" strokeWidth={3} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => { close(); router.push('/support') }}
            className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-amber-300 hover:text-amber-200 transition-colors group"
          >
            비교 자세히 보기
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* 🎁 1회 체험 — 말씀 연구실 */}
        <div className="px-6 sm:px-8 py-5 border-b border-white/5 bg-gradient-to-br from-indigo-500/[0.05] to-purple-500/[0.03]">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-extrabold">
              🎁 1회 체험
            </span>
            <h3 className="text-[13px] font-extrabold text-white">말씀 연구실을 먼저 경험해보세요</h3>
          </div>
          <p className="text-[12px] text-slate-400 leading-relaxed">
            본문 주해 · 성경 정밀 연구 · 원고 작성까지. 회원가입 후 1편/30일 무료로 직접 사용해보실 수 있어요.
          </p>
          <button
            onClick={() => { close(); router.push('/advanced/projects/new') }}
            className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-[13px] shadow-lg shadow-indigo-500/20 transition-all group"
          >
            <Sparkles className="w-3.5 h-3.5" />
            지금 1회 체험하기
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* 푸터 CTA */}
        <div className="px-6 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={close}
            className="text-[12px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            나중에 보기
          </button>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => { close(); router.push('/support') }}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-bold text-[13px] hover:bg-white/10 transition-all"
            >
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              비교표 보기
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
    </div>
  )
}
