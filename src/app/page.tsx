'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { 
  Upload, Sparkles, FileText, Share2, LogIn, LayoutDashboard, 
  ArrowRight, CheckCircle, Star, Shield, Zap, Globe, 
  ChevronDown, ChevronUp, Play, Users, FileCheck, BrainCircuit, 
  ArrowUpRight, Heart, Calendar
} from 'lucide-react'
import FileUpload from '@/components/FileUpload'
import UsageBadge from '@/components/UsageBadge'
import { useAuth } from '@/components/AuthProvider'

// 4-Step 워크플로우 상수
const STEPS = [
  { 
    icon: Upload, 
    stepNumber: '01',
    title: '설교 원고 업로드', 
    desc: '작성하신 설교 원고(PDF/TXT/DOCX)를 안전하고 신속하게 업로드합니다. 드래그 앤 드롭으로 간편하게 시작하세요.', 
    color: 'from-blue-500 via-sky-500 to-indigo-500',
    glow: 'rgba(56, 189, 248, 0.15)'
  },
  { 
    icon: BrainCircuit, 
    stepNumber: '02',
    title: 'AI 정밀 분석', 
    desc: '인공지능이 설교의 핵심 주제, 신학적 맥락, 핵심 성경 구절 및 문맥을 다차원적으로 깊이 있게 분석합니다.', 
    color: 'from-indigo-500 via-purple-500 to-pink-500',
    glow: 'rgba(168, 85, 247, 0.15)'
  },
  { 
    icon: Sparkles, 
    stepNumber: '03',
    title: '6종 콘텐츠 즉시 생성', 
    desc: '분석 결과를 바탕으로 요약본, 소그룹 나눔 질문, 카드뉴스, 유튜브 쇼츠 대본, 설교 대본, PPT 슬라이드를 자동 설계합니다.', 
    color: 'from-purple-500 via-pink-500 to-rose-500',
    glow: 'rgba(236, 72, 153, 0.15)'
  },
  { 
    icon: Share2, 
    stepNumber: '04',
    title: '스마트 공유 & 다운로드', 
    desc: '생성된 모든 자료를 PDF, Word, PPTX 파일로 저장하거나 링크로 간편하게 교인 및 소그룹 리더에게 전송합니다.', 
    color: 'from-pink-500 via-rose-500 to-amber-500',
    glow: 'rgba(244, 63, 94, 0.15)'
  },
]

// 6종 콘텐츠 노드 정보
const NEURAL_NODES = [
  { id: 1, title: '설교 요약', desc: '서론-본론-결론 구조화 및 핵심 적용점 도출', icon: FileCheck, posClass: 'left-[2%] top-[12%]' },
  { id: 2, title: '소그룹 나눔', desc: '연령대별 맞춤식 대화형 질문지 자동 생성', icon: Users, posClass: 'left-[-4%] top-[46%]' },
  { id: 3, title: '카드뉴스', desc: '설교의 핵심 메시지를 요약한 5페이지 이미지 설계', icon: Sparkles, posClass: 'left-[2%] top-[80%]' },
  { id: 4, title: '설교 대본', desc: '자연스러운 구어체 스타일의 10분용 전문 대본', icon: Zap, posClass: 'right-[2%] top-[12%]' },
  { id: 5, title: '쇼츠 대본', desc: '유튜브 및 인스타 숏폼 전용 60초 스토리보드', icon: Globe, posClass: 'right-[-4%] top-[46%]' },
  { id: 6, title: 'PPT 슬라이드', desc: '표지, 본문, 마무리가 조화된 디자인 파일 다운로드', icon: Star, posClass: 'right-[2%] top-[80%]' },
]

// 신뢰 정보 상수
const STATS = [
  { label: '누적 설교 분석 수', count: '24,500+', desc: '신뢰로 입증된 인공지능 분석 원고 수' },
  { label: '함께하는 목회자 수', count: '3,200명+', desc: '전국 및 해외 한인 교회 목회자 사용자' },
  { label: '생성된 목회 콘텐츠', count: '147,000건+', desc: '설교에서 2차 가공 완료된 미디어 자료' },
]

const TRUST_BADGES = [
  { icon: Shield, text: 'SSL 암호화 전송 및 데이터 보호' },
  { icon: Calendar, text: '신규 회원 15일 무료 체험 혜택' },
  { icon: Zap, text: '최신 거대 언어 모델(LLM) 탑재' },
]

const TESTIMONIALS = [
  {
    quote: "설교 후 주일 오후에 소그룹 교재와 카드뉴스 제작으로 늘 밤을 새웠는데, SermonAI 덕분에 설교 원고 하나만으로 5분 만에 해결되었습니다. 목회 패러다임이 바뀝니다.",
    author: "김은호 목사",
    role: "빛과소금교회 담임",
  },
  {
    quote: "나이가 있어 새로운 IT 기기나 AI 사용이 꺼려졌는데, 회원가입 후 원고 파일만 던져 넣으면 다 알아서 분석해 주니 정말 쉽고 똑똑합니다. 강력 추천합니다.",
    author: "박창훈 목사",
    role: "새소망교회 은퇴목사",
  },
]

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    els.forEach((el) => {
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight) {
        el.classList.add('visible')
      }
    })
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observerRef.current?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    )
    els.forEach((el) => observerRef.current?.observe(el))
    return () => observerRef.current?.disconnect()
  }, [])

  const handleUploadSuccess = (sermonId: string) => {
    router.push(`/workspace?id=${sermonId}`)
  }

  const isLoggedIn = mounted && !loading && !!user

  return (
    <div className="relative min-h-screen bg-[#050814] text-slate-100 overflow-x-hidden font-sans">
      {/* 1. 미래형 백그라운드 효과 (WebGL / CSS Glowing Particle Field) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* 그리드 테크 배경 */}
        <div className="absolute inset-0 bg-grid-tech opacity-15" />
        {/* 네온 구체 */}
        <div className="absolute top-[-10%] left-[-15%] w-[80vw] h-[80vw] max-w-[1000px] rounded-full bg-gradient-to-br from-indigo-600/15 via-blue-500/5 to-transparent blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-[20%] right-[-15%] w-[70vw] h-[70vw] max-w-[900px] rounded-full bg-gradient-to-tr from-purple-600/10 via-pink-500/5 to-transparent blur-3xl animate-pulse-slower" />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-blue-500/5 blur-3xl animate-pulse-slow" />
      </div>

      {/* 2. 히어로 섹션 */}
      <section className="relative pt-24 pb-16 sm:pt-36 sm:pb-28 z-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* 좌측 콘텐츠 */}
            <div className="lg:col-span-6 text-left space-y-6 sm:space-y-8">
              <div className="reveal inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-[13px] font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                설교 준비의 완전한 지능형 세대 교체
              </div>

              <h1 className="reveal text-[clamp(2.25rem,5.5vw,3.75rem)] font-extrabold tracking-tight leading-[1.15] text-white">
                설교 준비의 미래,
                <br />
                <span className="text-gradient-neon glow-text-neon">한 편의 설교가</span>
                <br />
                <span className="text-gradient-neon glow-text-neon">여섯 개의 콘텐츠로</span>
              </h1>

              <p className="reveal text-[clamp(1rem,2.2vw,1.125rem)] text-slate-400 leading-relaxed font-medium max-w-xl">
                작성하신 한 편의 설교 원고만 있으면, 고도화된 목회 전문 AI가 소그룹 교재, 요약본, 카드뉴스, 유튜브 쇼츠, 설교 대본, 그리고 시각화된 PPT 완성 슬라이드까지 단 20초 만에 정교하게 완성합니다.
              </p>

              <div className="reveal pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                {!isLoggedIn ? (
                  <Link
                    href="/login?redirect=/"
                    className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 text-white font-bold text-[16px] shadow-lg shadow-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                  >
                    무료로 시작하기
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 text-white font-bold text-[16px] shadow-lg shadow-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    대시보드로 이동
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
                <a
                  href="#transformation"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl glass-dark hover:bg-white/10 text-slate-200 hover:text-white font-bold text-[16px] border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <Play className="w-4 h-4 text-indigo-400 fill-current" />
                  데모 보기
                </a>
              </div>

              {/* 신뢰 배지 */}
              <div className="reveal pt-4 border-t border-white/5 flex flex-wrap items-center gap-6">
                {TRUST_BADGES.map((badge, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[12.5px] text-slate-400 font-medium">
                    <badge.icon className="w-4 h-4 text-indigo-400" />
                    {badge.text}
                  </div>
                ))}
              </div>
            </div>

            {/* 우측 3D / 플로팅 글래스 카드 비주얼 */}
            <div className="lg:col-span-6 relative flex items-center justify-center min-h-[400px]">
              {/* 무늬 효과 백그라운드 원 */}
              <div className="absolute w-[350px] h-[350px] rounded-full bg-gradient-to-tr from-indigo-500/10 to-purple-500/15 blur-2xl animate-pulse" />
              
              {/* 실제 AI 분석 UI 연출용 플로팅 카드 레이아웃 */}
              <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
                {/* 메인 설교 원고 카드 */}
                <div className="z-20 w-[240px] p-6 rounded-2xl glass-dark border border-white/15 shadow-2xl shadow-indigo-950/50 text-left animate-float">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">설교 원고</span>
                  </div>
                  <h4 className="text-[15px] font-bold text-white mb-2 truncate">기쁨으로 심는 씨앗.pdf</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                    {"\"오늘 우리가 읽은 갈라디아서 본문은 심은 대로 거두는 성경적 법칙을 이야기합니다. 신앙의 여정에서 선을 행하되...\""}
                  </p>
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">크기 14.2KB</span>
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      업로드 성공
                    </span>
                  </div>
                </div>

                {/* 플로팅 콘텐츠 결과 1 - 소그룹 질문지 */}
                <div className="absolute top-2 -right-2 z-30 w-[180px] p-4 rounded-xl glass-dark border border-white/10 shadow-xl text-left animate-float-delayed">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span className="text-[11px] font-bold text-slate-200">소그룹 질문</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    Q1. 이번 설교에서 나에게 주신 가장 깊은 도전은 무엇이었나요?
                  </p>
                </div>

                {/* 플로팅 콘텐츠 결과 2 - 카드뉴스 */}
                <div className="absolute bottom-6 -left-8 z-30 w-[180px] p-4 rounded-xl glass-dark border border-white/10 shadow-xl text-left animate-float-slow">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                    <span className="text-[11px] font-bold text-slate-200">카드뉴스 메시지</span>
                  </div>
                  <div className="h-16 rounded-lg bg-gradient-to-br from-indigo-950 to-purple-950 border border-white/5 flex items-center justify-center text-center p-2">
                    <span className="text-[9px] text-indigo-200 font-medium">{"\"낙심하지 말지니 때가 이르매 거두리라\""}</span>
                  </div>
                </div>

                {/* 플로팅 콘텐츠 결과 3 - 유튜브 쇼츠 */}
                <div className="absolute bottom-1 right-2 z-10 w-[150px] p-3.5 rounded-xl glass-dark border border-white/5 shadow-xl text-left opacity-90 scale-95 animate-float">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[10px] font-bold text-slate-300">유튜브 쇼츠</span>
                  </div>
                  <p className="text-[9px] text-slate-500 leading-snug line-clamp-2">
                    {"[00:05] (자막) '포기하고 싶을 때 꼭 보세요!'"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 소셜 증명 수치 섹션 */}
      <section className="relative py-12 border-y border-white/5 bg-[#070b1a]/80 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {STATS.map((stat, idx) => (
              <div key={idx} className="reveal space-y-1" style={{ transitionDelay: `${idx * 100}ms` }}>
                <p className="text-[13px] font-semibold text-slate-400">{stat.label}</p>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-outfit tracking-tight text-gradient-neon">{stat.count}</h3>
                <p className="text-[11.5px] text-slate-500">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. 애니메이션 타임라인 워크플로우 섹션 */}
      <section className="relative py-24 sm:py-32 z-10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-24">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[12px] font-bold mb-4">
              워크플로우
            </div>
            <h2 className="reveal text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
              설교 업로드부터 배포까지 한눈에
            </h2>
            <p className="reveal text-[15px] sm:text-[17px] text-slate-400 leading-relaxed font-medium">
              간단하고 명확한 4단계 흐름을 따라 고품질의 자료가 손쉽게 설계됩니다.
            </p>
          </div>

          {/* 타임라인 가로 레이아웃 (데스크톱) / 세로 레이아웃 (모바일) */}
          <div className="relative grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 연결 라인 (데스크톱 전용) */}
            <div className="hidden lg:block absolute top-[44px] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-rose-500/40 z-0" />
            
            {STEPS.map((step, idx) => {
              const Icon = step.icon
              const isActive = activeStep === idx
              return (
                <div 
                  key={idx}
                  className="reveal relative z-10 group cursor-pointer"
                  style={{ transitionDelay: `${idx * 150}ms` }}
                  onMouseEnter={() => setActiveStep(idx)}
                >
                  <div className={`h-full p-6 sm:p-8 rounded-2xl border transition-all duration-500 ${
                    isActive 
                      ? 'glass-dark border-indigo-500/30 shadow-lg shadow-indigo-500/5 -translate-y-1.5' 
                      : 'bg-transparent border-white/5 hover:border-white/10'
                  }`}>
                    {/* 상단 스텝 뱃지 및 아이콘 */}
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-[20px] font-extrabold font-outfit text-slate-600 opacity-60 group-hover:opacity-100 transition-opacity">
                        {step.stepNumber}
                      </span>
                    </div>

                    <h3 className="text-[17px] font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-[13px] sm:text-[14px] text-slate-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 5. 콘텐츠 신경망 인터랙티브 맵 섹션 (리디자인 핵심 포인트) */}
      <section id="transformation" className="relative py-24 sm:py-32 bg-[#060918]/60 border-y border-white/5 z-10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[12px] font-bold mb-4">
              콘텐츠 트랜스포메이션
            </div>
            <h2 className="reveal text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
              한 편의 원고가 일으키는 지능형 연쇄 반응
            </h2>
            <p className="reveal text-[15px] sm:text-[17px] text-slate-400 leading-relaxed font-medium">
              업로드된 원고를 중앙 기점으로 삼아 6개의 고품질 미디어 및 목회 콘텐츠로 다면 변환됩니다.
            </p>
          </div>

          {/* 신경망 레이아웃 컨테이너 */}
          <div className="relative w-full max-w-4xl mx-auto min-h-[550px] aspect-[8/5] hidden md:block">
            {/* 1. 배경을 지나는 SVG 빛줄기 연결선 */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 800 500">
              <defs>
                <linearGradient id="grad-to-left" x1="1" y1="0.5" x2="0" y2="0.5">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <linearGradient id="grad-to-right" x1="0" y1="0.5" x2="1" y2="0.5">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>

              {/* 중앙에서 각 노드로 흐르는 백그라운드 선 */}
              {/* 좌측 그룹 */}
              <path d="M 400 250 C 300 250, 220 100, 120 100" stroke="url(#grad-to-left)" strokeWidth="2.5" fill="none" opacity="0.12" />
              <path d="M 400 250 C 300 250, 220 250, 80 250" stroke="url(#grad-to-left)" strokeWidth="2.5" fill="none" opacity="0.12" />
              <path d="M 400 250 C 300 250, 220 400, 120 400" stroke="url(#grad-to-left)" strokeWidth="2.5" fill="none" opacity="0.12" />

              {/* 우측 그룹 */}
              <path d="M 400 250 C 500 250, 580 100, 680 100" stroke="url(#grad-to-right)" strokeWidth="2.5" fill="none" opacity="0.12" />
              <path d="M 400 250 C 500 250, 580 250, 720 250" stroke="url(#grad-to-right)" strokeWidth="2.5" fill="none" opacity="0.12" />
              <path d="M 400 250 C 500 250, 580 400, 680 400" stroke="url(#grad-to-right)" strokeWidth="2.5" fill="none" opacity="0.12" />

              {/* 애니메이션 라이트 트레일 */}
              <path d="M 400 250 C 300 250, 220 100, 120 100" stroke="url(#grad-to-left)" strokeWidth="2" fill="none" opacity="0.75" className="line-trail" />
              <path d="M 400 250 C 300 250, 220 250, 80 250" stroke="url(#grad-to-left)" strokeWidth="2" fill="none" opacity="0.75" className="line-trail" />
              <path d="M 400 250 C 300 250, 220 400, 120 400" stroke="url(#grad-to-left)" strokeWidth="2" fill="none" opacity="0.75" className="line-trail" />

              <path d="M 400 250 C 500 250, 580 100, 680 100" stroke="url(#grad-to-right)" strokeWidth="2" fill="none" opacity="0.75" className="line-trail" />
              <path d="M 400 250 C 500 250, 580 250, 720 250" stroke="url(#grad-to-right)" strokeWidth="2" fill="none" opacity="0.75" className="line-trail" />
              <path d="M 400 250 C 500 250, 580 400, 680 400" stroke="url(#grad-to-right)" strokeWidth="2" fill="none" opacity="0.75" className="line-trail" />
            </svg>

            {/* 2. 중앙 노드: 설교 원고 */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center">
              {/* 바깥 진동 링 */}
              <div className="absolute w-28 h-28 rounded-full bg-indigo-500/20 animate-ping" />
              {/* 본체 구체 */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 border border-white/20 flex flex-col items-center justify-center shadow-[0_0_35px_rgba(99,102,241,0.5)] z-10">
                <FileText className="w-7 h-7 text-white mb-1 animate-bounce" />
                <span className="text-[12px] font-extrabold text-white">설교 원고</span>
              </div>
            </div>

            {/* 3. 6개 외부 노드 렌더링 */}
            {NEURAL_NODES.map((node) => {
              const NodeIcon = node.icon
              return (
                <div 
                  key={node.id} 
                  className={`absolute ${node.posClass} z-10 w-[200px] p-4 rounded-xl glass-dark border border-white/5 shadow-lg glass-dark-hover`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                      <NodeIcon className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="text-[13px] font-bold text-white">{node.title}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">{node.desc}</p>
                </div>
              )
            })}
          </div>

          {/* 모바일 화면용 심플 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
            {NEURAL_NODES.map((node) => {
              const NodeIcon = node.icon
              return (
                <div 
                  key={node.id} 
                  className="p-5 rounded-2xl glass-dark border border-white/5 flex items-start gap-3.5"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center shrink-0">
                    <NodeIcon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[15px] font-bold text-white">{node.title}</h4>
                    <p className="text-[12px] text-slate-400 leading-relaxed">{node.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 6. 메인 업로드 & 대시보드 온보딩 영역 */}
      <section className="relative py-24 sm:py-32 z-10">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="reveal text-2xl sm:text-3xl font-extrabold text-white mb-3">
              지금 직접 설교를 분석해보세요
            </h2>
            <p className="reveal text-[14px] sm:text-[15px] text-slate-400 font-medium">
              간단히 파일을 업로드하는 것으로 목회의 지능화 여정이 시작됩니다.
            </p>
          </div>

          <div className="reveal">
            {isLoggedIn ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                <div className="md:col-span-2">
                  <div className="rounded-3xl glass-dark border border-white/10 shadow-2xl p-1 h-full">
                    {/* 내장 업로드 컴포넌트는 light-themed 카드이므로 내부 스타일 커스터마이징을 위해 상위 래퍼에서 관리 */}
                    <div className="text-slate-900 bg-white rounded-[20px] overflow-hidden">
                      <FileUpload onSuccess={handleUploadSuccess} />
                    </div>
                  </div>
                </div>
                <div className="md:col-span-1">
                  <div className="rounded-3xl glass-dark border border-white/10 shadow-2xl p-6 h-full flex flex-col items-center justify-center">
                    <UsageBadge />
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-3xl glass-dark border border-white/10 p-8 sm:p-12 text-center shadow-2xl shadow-indigo-950/20">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-5 border border-indigo-500/20">
                    <Upload className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-[18px] sm:text-[22px] font-bold text-white mb-2">
                    원고 업로드를 위해 로그인이 필요합니다
                  </h3>
                  <p className="text-[13.5px] sm:text-[14.5px] text-slate-400 mb-6 max-w-md mx-auto">
                    간단한 회원가입(이메일 또는 소셜) 즉시 15일간 매일 생성 서비스를 이용하실 수 있습니다.
                  </p>
                  <Link
                    href="/login?redirect=/"
                    className="group inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-[15px] shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                  >
                    로그인 및 가입하기
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7. 신뢰성 및 한도 안내 섹션 (Tip) */}
      <section className="relative pb-24 sm:pb-32 z-10">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="reveal rounded-3xl glass-dark border border-white/5 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20 mt-0.5">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="min-w-0 space-y-3">
                <h4 className="font-bold text-[15px] sm:text-[16px] text-white">
                  목회자 AI 솔루션 사용 팁 안내
                </h4>
                <ul className="space-y-2">
                  {[
                    'PDF, TXT, DOCX 포맷을 완벽하게 지원합니다 (최대 20MB 용량)',
                    '한글(.doc) 형식은 최신 워드 파일(.docx) 형식으로 변환 후 업로드하시면 정확히 파싱됩니다.',
                    'AI 다차원 가공 설계는 서버 연산 상황에 따라 20초~40초 가량 소요됩니다.',
                    '완료된 모든 콘텐츠는 클라우드 계정에 영구적으로 백업되어 언제든 열람 가능합니다.',
                  ].map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[12.5px] sm:text-[13.5px] text-slate-400 font-medium">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. 신뢰 구역 (Testimonials) */}
      <section className="relative pb-24 sm:pb-36 z-10">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="reveal text-2xl sm:text-3xl font-extrabold text-white">
              사역의 변화를 경험한 목회자들의 고백
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="reveal p-6 sm:p-8 rounded-2xl glass-dark border border-white/5 flex flex-col justify-between">
                <p className="text-[13.5px] text-slate-300 leading-relaxed italic mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-[13px]">
                    {t.author[0]}
                  </div>
                  <div>
                    <h5 className="text-[13.5px] font-bold text-white">{t.author}</h5>
                    <p className="text-[11px] text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. 고정 푸터 */}
      <footer className="relative bg-[#050814]/90 backdrop-blur-md border-t border-white/10 py-6 text-center text-[12px] text-slate-400 z-50">
        <div className="max-w-7xl mx-auto px-5">
          로스터 768-19-00582 · 전정우 · 경남 거창군 거창읍 거열로1길 86. 상가동 202호 · 070-8925-7400
        </div>
      </footer>

      <style jsx>{`
        .reveal {
          opacity: 1;
        }
        .reveal.visible {
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
