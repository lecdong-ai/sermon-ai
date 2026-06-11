'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

/* ═══════════════════════════════════════════════════════════
   INTRO / LANDING PAGE — 말씀 연구실
   ═══════════════════════════════════════════════════════════ */

export default function IntroPage() {
  const router = useRouter()
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-paper-800 -mt-16">
      {/* ─── Hero ─── */}
      <HeroSection />

      {/* ─── Problem Statement ─── */}
      <ProblemSection />

      {/* ─── Workflow Overview ─── */}
      <WorkflowSection />

      {/* ─── Feature Highlights ─── */}
      <FeatureSection />

      {/* ─── Differentiator ─── */}
      <DifferentiatorSection />

      {/* ─── Interface Preview ─── */}
      <PreviewSection />

      {/* ─── Value Proposition ─── */}
      <ValueSection />

      {/* ─── Audience ─── */}
      <AudienceSection />

      {/* ─── FAQ ─── */}
      <FAQSection />

      {/* ─── Final CTA ─── */}
      <FinalCTASection />

      {/* ─── Footer ─── */}
      <IntroFooter />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════════════════════════ */

function HeroSection() {
  const router = useRouter()

  return (
    <section className="relative bg-navy-900 overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-green-500/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-teal-500/5 blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-20 sm:pt-28 sm:pb-28">
        <div className="max-w-3xl">
          {/* Identity tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-[11px] text-white/60 font-medium tracking-wide">목회자를 위한 고급 설교 작업실</span>
          </div>

          {/* Headline */}
          <h1 className="text-[clamp(1.75rem,5vw,3rem)] font-serif font-bold text-white leading-[1.2] mb-6">
            설교를 쓰는 도구를 넘어,
            <br />
            <span className="text-green-400">설교를 준비하는 작업실</span>
          </h1>

          {/* Sub text */}
          <p className="text-[clamp(0.95rem,2vw,1.1rem)] text-white/50 leading-relaxed max-w-2xl mb-10">
            본문 연구, 설교 준비, 원고 작성, 아카이브, 통찰 노트, 시리즈 흐름까지.
            설교 사역의 전체 과정을 하나의 차분한 공간 안에서 연결합니다.
          </p>

          {/* CTA */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => router.push('/advanced')}
              className="text-sm bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-md transition-colors font-medium"
            >
              데모 보기
            </button>
            <button
              onClick={() => {
                document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="text-sm text-white/60 hover:text-white border border-white/15 hover:border-white/30 px-6 py-2.5 rounded-md transition-colors"
            >
              작업 흐름 살펴보기
            </button>
          </div>

          {/* Trust line */}
          <p className="text-[11px] text-white/30 mt-8">
            연구에서 원고까지, 설교의 전체 흐름을 하나의 공간에서
          </p>
        </div>

        {/* Hero mockup preview */}
        <div className="mt-16 relative">
          <div className="bg-navy-800 rounded-xl border border-white/10 overflow-hidden shadow-2xl shadow-black/30">
            {/* Mock browser chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
              </div>
              <div className="flex-1 flex justify-center">
                <span className="text-[10px] text-white/20 bg-white/5 px-4 py-0.5 rounded-full">
                  말씀 연구실 — 대시보드
                </span>
              </div>
            </div>
            {/* Mock dashboard content */}
            <div className="p-6 bg-[#1a1f2e]">
              <div className="grid grid-cols-3 gap-4">
                {/* Hero card mockup */}
                <div className="col-span-2 bg-white/5 rounded-lg border border-white/5 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[9px] text-green-400/70 uppercase tracking-wider">진행 중</span>
                    <span className="text-[9px] text-white/20 ml-auto">v3 · 3,240자</span>
                  </div>
                  <div className="text-sm font-serif font-bold text-white/80 mb-1">은혜 위에 은혜를 더하여</div>
                  <div className="text-[11px] text-white/30 mb-3">요한복음 1:1-5 · 2026년 1월 4일 · 주일예배</div>
                  <div className="bg-white/5 rounded p-2.5 mb-3">
                    <p className="text-[10px] text-white/40 italic leading-relaxed">
                      &ldquo;말씀이 육신이 되어 우리 가운데 거하시니 우리가 그의 영광을 보았다.&rdquo;
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[9px] bg-green-500/20 text-green-400/70 px-2 py-1 rounded">프로젝트 계속하기</span>
                    <span className="text-[9px] bg-white/5 text-white/30 px-2 py-1 rounded">성경 연구</span>
                    <span className="text-[9px] bg-white/5 text-white/30 px-2 py-1 rounded">원고 작성</span>
                  </div>
                </div>
                {/* Stats mockup */}
                <div className="space-y-3">
                  <div className="bg-white/5 rounded-lg border border-white/5 p-4">
                    <div className="text-[9px] text-white/30 uppercase tracking-wider mb-2">사역 현황</div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-white/40">전체 프로젝트</span>
                        <span className="text-white/70 font-bold">12</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-white/40">진행 중</span>
                        <span className="text-amber-400/70 font-bold">4</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-white/40">완료</span>
                        <span className="text-green-400/70 font-bold">8</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg border border-white/5 p-4">
                    <div className="text-[9px] text-white/30 uppercase tracking-wider mb-2">상태별</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                        <span>연구</span>
                        <span className="ml-auto text-white/60">2</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span>준비</span>
                        <span className="ml-auto text-white/60">1</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        <span>작성</span>
                        <span className="ml-auto text-white/60">1</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Glow behind mockup */}
          <div className="absolute -inset-4 bg-green-500/5 blur-2xl -z-10 rounded-2xl" />
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   PROBLEM SECTION
   ═══════════════════════════════════════════════════════════ */

function ProblemSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-[11px] text-paper-400 uppercase tracking-widest font-semibold">왜 이 도구가 필요한가</span>
          <h2 className="text-[clamp(1.4rem,3.5vw,2rem)] font-serif font-bold text-paper-900 mt-3 mb-4">
            설교 준비는 종종 흩어집니다
          </h2>
          <p className="text-sm text-paper-500 leading-relaxed max-w-xl mx-auto">
            목회자는 매주 설교를 준비하지만, 그 과정이 하나의 공간에서 이어지지 않을 때가 많습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProblemCard
            number="01"
            title="연구와 작성이 분리됩니다"
            description="본문 연구는 한 문서에, 대지 정리는 다른 파일에, 원고는 또 다른 곳에. 설교의 각 단계가 서로 연결되지 않고 흩어집니다."
          />
          <ProblemCard
            number="02"
            title="통찰이 사라지기 쉽습니다"
            description="설교 준비 중 떠오른 좋은 관찰과 아이디어는 기록되더라도 다시 발견되지 못한 채 잊히기 쉽습니다."
          />
          <ProblemCard
            number="03"
            title="이전 설교가 다음 설교와 연결되지 않습니다"
            description="완료된 설교는 어딘가에 저장되지만, 다음 설교를 준비할 때 충분히 참조되거나 재사용되지 못합니다."
          />
          <ProblemCard
            number="04"
            title="시리즈의 흐름이 보이지 않습니다"
            description="연속 설교를 준비할 때, 이전 설교와의 관계와 전체 시리즈의 흐름을 한눈에 파악하기 어렵습니다."
          />
        </div>
      </div>
    </section>
  )
}

function ProblemCard({ number, title, description }: {
  number: string; title: string; description: string
}) {
  return (
    <div className="bg-white rounded-xl border border-paper-200 p-6">
      <span className="text-[10px] text-paper-300 font-mono font-bold">{number}</span>
      <h3 className="text-sm font-semibold text-paper-800 mt-2 mb-2">{title}</h3>
      <p className="text-xs text-paper-500 leading-relaxed">{description}</p>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   WORKFLOW SECTION
   ═══════════════════════════════════════════════════════════ */

function WorkflowSection() {
  const steps = [
    {
      step: '01',
      label: '프로젝트 시작',
      title: '설교 프로젝트를 만듭니다',
      description: '본문, 설교일, 회중, 시리즈를 설정하고 설교 준비를 시작합니다.',
      color: 'border-teal-400',
      dot: 'bg-teal-400',
    },
    {
      step: '02',
      label: '성경 연구',
      title: '본문을 깊이 연구합니다',
      description: '원어 분석, 문맥 관찰, 주석 참조, 평행 본문을 한곳에서 정리합니다.',
      color: 'border-blue-400',
      dot: 'bg-blue-400',
    },
    {
      step: '03',
      label: '설교 준비',
      title: '중심명제와 대지를 정리합니다',
      description: '본문 관찰을 바탕으로 중심명제를 세우고, 대지 구조와 적용을 다듬습니다.',
      color: 'border-amber-400',
      dot: 'bg-amber-400',
    },
    {
      step: '04',
      label: '설교 작성',
      title: '원고를 작성하고 다듬습니다',
      description: '준비된 흐름을 바탕으로 설교 원고를 작성하고, 버전과 상태를 관리합니다.',
      color: 'border-green-400',
      dot: 'bg-green-400',
    },
    {
      step: '05',
      label: '아카이브',
      title: '설교를 자산으로 축적합니다',
      description: '완성된 설교를 아카이브에 저장하고, 검색·재사용·연결할 수 있게 합니다.',
      color: 'border-gold-400',
      dot: 'bg-gold-400',
    },
    {
      step: '06',
      label: '연결과 탐색',
      title: '그래프, 노트, 시리즈로 연결합니다',
      description: '설교, 본문, 주제, 통찰이 서로 연결되며 사역의 깊이를 더합니다.',
      color: 'border-slateblue-400',
      dot: 'bg-slateblue-400',
    },
  ]

  return (
    <section id="workflow" className="py-20 sm:py-28 bg-white border-y border-paper-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-[11px] text-paper-400 uppercase tracking-widest font-semibold">작업 흐름</span>
          <h2 className="text-[clamp(1.4rem,3.5vw,2rem)] font-serif font-bold text-paper-900 mt-3 mb-4">
            설교가 준비되고 축적되는 과정
          </h2>
          <p className="text-sm text-paper-500 leading-relaxed max-w-xl mx-auto">
            연구에서 작성, 아카이브, 연결까지. 설교의 전 과정이 자연스럽게 이어집니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps.map((s, i) => (
            <div key={s.step} className="relative bg-paper-50 rounded-xl border border-paper-200 p-6 hover:border-paper-300 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                <span className="text-[10px] text-paper-400 font-mono">{s.step}</span>
                <span className="text-[10px] text-paper-400 ml-auto">{s.label}</span>
              </div>
              <h3 className="text-sm font-semibold text-paper-800 mb-2">{s.title}</h3>
              <p className="text-xs text-paper-500 leading-relaxed">{s.description}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 text-paper-200">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   FEATURE SECTION
   ═══════════════════════════════════════════════════════════ */

function FeatureSection() {
  const features = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
      title: '설교 프로젝트',
      description: '본문, 설교일, 회중, 시리즈를 설정하고 설교의 전체 상태를 한눈에 관리합니다.',
      meaning: '각 설교가 독립적인 프로젝트로 체계화됩니다',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: '성경 연구',
      description: '원어 분석, 문맥 관찰, 주석, 평행 본문, 번역 비교를 하나의 공간에서 다룹니다.',
      meaning: '본문 연구가 설교의 토대로 직접 연결됩니다',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      title: '설교 준비',
      description: '중심명제, 대지 구조, 제목 후보, 회중별 적용을 단계적으로 정리합니다.',
      meaning: '연구의 통찰이 설교의 구조로 전환됩니다',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      title: '설교 작성',
      description: '준비된 흐름을 원고로 작성하고, 발표용 보기, 인쇄용 보기, 버전 기록을 관리합니다.',
      meaning: '준비와 작성이 끊김 없이 이어집니다',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      title: '설교 아카이브',
      description: '완료된 설교를 검색, 필터, 재사용할 수 있는 자산으로 축적합니다.',
      meaning: '한 편의 설교가 다음 설교의 자원이 됩니다',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="3" strokeWidth={1.5} />
          <path strokeLinecap="round" strokeWidth={1.5} d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.07-7.07l-2.83 2.83M9.76 14.24l-2.83 2.83m11.14 0l-2.83-2.83M9.76 9.76L6.93 6.93" />
        </svg>
      ),
      title: '그래프',
      description: '설교, 본문, 주제, 원어, 노트 간 연결을 시각적으로 탐색하고 새로운 관계를 발견합니다.',
      meaning: '흩어진 설교들이 하나의 지식망이 됩니다',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: '노트 / 통찰',
      description: '짧은 관찰도 사라지지 않고 유형별로 분류되며, 관련 설교와 다시 연결됩니다.',
      meaning: '작은 통찰 하나가 사역의 깊이가 됩니다',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      title: '시리즈',
      description: '연속 설교를 시리즈로 조직하고, 전체 흐름과 현재 설교의 위치를 함께 관리합니다.',
      meaning: '개별 설교가 더 큰 말씀 여정의 일부가 됩니다',
    },
  ]

  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-[11px] text-paper-400 uppercase tracking-widest font-semibold">주요 기능</span>
          <h2 className="text-[clamp(1.4rem,3.5vw,2rem)] font-serif font-bold text-paper-900 mt-3 mb-4">
            설교 사역의 전체를 다루는 도구
          </h2>
          <p className="text-sm text-paper-500 leading-relaxed max-w-xl mx-auto">
            각 기능은 독립적으로 작동하지 않습니다. 서로 연결되어 설교의 흐름을 만듭니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <div key={f.title} className="bg-white rounded-xl border border-paper-200 p-6 hover:border-paper-300 transition-colors group">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-paper-100 flex items-center justify-center text-paper-500 shrink-0 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                  {f.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-paper-800 mb-1">{f.title}</h3>
                  <p className="text-xs text-paper-500 leading-relaxed mb-2">{f.description}</p>
                  <p className="text-[10px] text-green-600/70 font-medium">{f.meaning}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   DIFFERENTIATOR SECTION
   ═══════════════════════════════════════════════════════════ */

function DifferentiatorSection() {
  const items = [
    {
      title: '단순히 설교 원고를 쓰는 도구가 아닙니다',
      description: '문서 편집기는 작성만 돕지만, 이 도구는 연구에서 준비, 작성, 아카이브까지 설교의 전체 여정을 함께합니다.',
    },
    {
      title: '흩어진 메모를 저장하는 노트앱에 머물지 않습니다',
      description: '통찰은 기록되는 것을 넘어, 관련 설교와 본문, 주제와 다시 연결되며 사역의 자산이 됩니다.',
    },
    {
      title: '설교를 한 번의 결과물이 아니라 축적되는 자산으로 다룹니다',
      description: '완료된 설교는 아카이브에 저장되고, 그래프에서 연결되며, 시리즈 안에서 흐름을 만듭니다.',
    },
  ]

  return (
    <section className="py-20 sm:py-28 bg-navy-900 text-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-[11px] text-white/40 uppercase tracking-widest font-semibold">차별점</span>
          <h2 className="text-[clamp(1.4rem,3.5vw,2rem)] font-serif font-bold text-white mt-3 mb-4">
            다른 도구들과 다른 접근
          </h2>
        </div>

        <div className="space-y-8">
          {items.map((item, i) => (
            <div key={i} className="flex gap-6 items-start">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <span className="text-xs text-green-400 font-bold">{i + 1}</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1.5">{item.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   PREVIEW SECTION
   ═══════════════════════════════════════════════════════════ */

function PreviewSection() {
  const [activePreview, setActivePreview] = useState(0)

  const previews = [
    {
      label: '대시보드',
      description: '진행 중인 프로젝트, 사역 현황, 지식 그래프, 최근 통찰을 한눈에',
      content: <DashboardPreview />,
    },
    {
      label: '성경 연구',
      description: '원어 분석, 주석, 평행 본문, 번역 비교를 하나의 공간에서',
      content: <BibleStudyPreview />,
    },
    {
      label: '설교 작성',
      description: '준비된 흐름을 원고로, 버전과 상태를 관리하며',
      content: <ManuscriptPreview />,
    },
    {
      label: '그래프',
      description: '설교, 본문, 주제, 노트 간 연결을 시각적으로 탐색',
      content: <GraphPreview />,
    },
  ]

  return (
    <section className="py-20 sm:py-28 bg-white border-y border-paper-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-[11px] text-paper-400 uppercase tracking-widest font-semibold">화면 미리보기</span>
          <h2 className="text-[clamp(1.4rem,3.5vw,2rem)] font-serif font-bold text-paper-900 mt-3 mb-4">
            차분하고 구조화된 작업 환경
          </h2>
        </div>

        {/* Tab selector */}
        <div className="flex items-center justify-center gap-1 mb-10">
          {previews.map((p, i) => (
            <button
              key={p.label}
              onClick={() => setActivePreview(i)}
              className={`text-xs px-4 py-2 rounded-md transition-colors ${
                activePreview === i
                  ? 'bg-navy-900 text-white'
                  : 'text-paper-500 hover:text-paper-700 hover:bg-paper-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Preview content */}
        <div className="bg-navy-900 rounded-xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
            </div>
            <span className="text-[10px] text-white/20 bg-white/5 px-3 py-0.5 rounded-full ml-2">
              말씀 연구실 — {previews[activePreview].label}
            </span>
          </div>
          <div className="p-6 bg-[#1a1f2e] min-h-[320px]">
            {previews[activePreview].content}
          </div>
        </div>
        <p className="text-center text-xs text-paper-400 mt-4">
          {previews[activePreview].description}
        </p>
      </div>
    </section>
  )
}

/* Preview mockups */
function DashboardPreview() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2 bg-white/5 rounded-lg border border-white/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span className="text-[8px] text-green-400/60 uppercase">진행 중</span>
          <span className="text-[8px] text-white/15 ml-auto">v3</span>
        </div>
        <div className="text-[11px] font-serif font-bold text-white/70 mb-0.5">은혜 위에 은혜를 더하여</div>
        <div className="text-[9px] text-white/25 mb-2">요한복음 1:1-5 · 2026.01.04</div>
        <div className="bg-white/5 rounded p-2 mb-2">
          <p className="text-[8px] text-white/30 italic">&ldquo;말씀이 육신이 되어 우리 가운데 거하시니...&rdquo;</p>
        </div>
        <div className="flex gap-1.5">
          <span className="text-[8px] bg-green-500/20 text-green-400/60 px-1.5 py-0.5 rounded">계속하기</span>
          <span className="text-[8px] bg-white/5 text-white/25 px-1.5 py-0.5 rounded">연구</span>
          <span className="text-[8px] bg-white/5 text-white/25 px-1.5 py-0.5 rounded">작성</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="bg-white/5 rounded-lg border border-white/5 p-3">
          <div className="text-[8px] text-white/25 uppercase mb-1.5">사역 현황</div>
          <div className="text-[18px] font-bold text-white/70">12</div>
          <div className="text-[8px] text-white/30">전체 프로젝트</div>
        </div>
        <div className="bg-white/5 rounded-lg border border-white/5 p-3">
          <div className="text-[8px] text-white/25 uppercase mb-1.5">상태별</div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-[8px] text-white/30">
              <span className="w-1 h-1 rounded-full bg-teal-400" /> 연구 <span className="ml-auto text-white/50">2</span>
            </div>
            <div className="flex items-center gap-1 text-[8px] text-white/30">
              <span className="w-1 h-1 rounded-full bg-amber-400" /> 준비 <span className="ml-auto text-white/50">1</span>
            </div>
            <div className="flex items-center gap-1 text-[8px] text-white/30">
              <span className="w-1 h-1 rounded-full bg-green-400" /> 작성 <span className="ml-auto text-white/50">1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BibleStudyPreview() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2 space-y-3">
        <div className="bg-white/5 rounded-lg border border-white/5 p-3">
          <div className="text-[8px] text-white/25 uppercase mb-1.5">본문 — 요한복음 1:1-5</div>
          <div className="text-[10px] text-white/50 leading-relaxed font-serif">
            태초에 말씀이 계시니라 이 말씀이 하나님과 함께 계셨으니 이 말씀은 곧 하나님이시니라...
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/5 rounded-lg border border-white/5 p-2.5">
            <div className="text-[8px] text-teal-400/60 uppercase mb-1">원어 분석</div>
            <div className="text-[9px] text-white/40">λόγος (로고스) — 말씀, 이성, 의미</div>
          </div>
          <div className="bg-white/5 rounded-lg border border-white/5 p-2.5">
            <div className="text-[8px] text-gold-400/60 uppercase mb-1">주석 참조</div>
            <div className="text-[9px] text-white/40">칼뱅, 바르트, 몰트만...</div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="bg-white/5 rounded-lg border border-white/5 p-2.5">
          <div className="text-[8px] text-white/25 uppercase mb-1">평행 본문</div>
          <div className="space-y-1">
            <div className="text-[8px] text-white/35">창 1:1-3</div>
            <div className="text-[8px] text-white/35">골 1:15-17</div>
            <div className="text-[8px] text-white/35">히 1:1-3</div>
          </div>
        </div>
        <div className="bg-white/5 rounded-lg border border-white/5 p-2.5">
          <div className="text-[8px] text-white/25 uppercase mb-1">번역 비교</div>
          <div className="text-[8px] text-white/35 leading-relaxed">개역개정 · NIV · ESV · KJV</div>
        </div>
      </div>
    </div>
  )
}

function ManuscriptPreview() {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="col-span-1 bg-white/5 rounded-lg border border-white/5 p-3">
        <div className="text-[8px] text-white/25 uppercase mb-2">설교 구조</div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[8px] text-green-400/60">
            <span className="w-1 h-1 rounded-full bg-green-400" /> 서론
          </div>
          <div className="flex items-center gap-1.5 text-[8px] text-green-400/60">
            <span className="w-1 h-1 rounded-full bg-green-400" /> 본론 1
          </div>
          <div className="flex items-center gap-1.5 text-[8px] text-green-400/60">
            <span className="w-1 h-1 rounded-full bg-green-400" /> 본론 2
          </div>
          <div className="flex items-center gap-1.5 text-[8px] text-white/20">
            <span className="w-1 h-1 rounded-full bg-white/15" /> 본론 3
          </div>
          <div className="flex items-center gap-1.5 text-[8px] text-white/20">
            <span className="w-1 h-1 rounded-full bg-white/15" /> 결론
          </div>
        </div>
      </div>
      <div className="col-span-2 bg-white/5 rounded-lg border border-white/5 p-4">
        <div className="text-[10px] font-serif font-bold text-white/70 mb-1">서론 — 말씀이 육신이 되다</div>
        <div className="text-[9px] text-white/30 mb-2">요한복음 1:1-5</div>
        <div className="text-[9px] text-white/45 leading-relaxed font-serif">
          요한은 그의 복음서를 창세기의 첫 문장과 울림을 같이하는 말씀으로 시작합니다. &ldquo;태초에 말씀이 계시니라.&rdquo; 이 선언은 단순한 신학적 명제가 아니라, 하나님이 우리 가운데 오신 사건 그 자체를 선포하는 것입니다...
        </div>
      </div>
      <div className="col-span-1 bg-white/5 rounded-lg border border-white/5 p-3">
        <div className="text-[8px] text-white/25 uppercase mb-1">중심명제</div>
        <p className="text-[8px] text-white/35 italic leading-relaxed mb-2">
          &ldquo;말씀이 육신이 되신 사건은 하나님의 임재가 추상적 개념이 아니라 구체적인 현실임을 보여줍니다.&rdquo;
        </p>
        <div className="text-[8px] text-white/25 uppercase mb-1">유의 사항</div>
        <div className="text-[8px] text-red-400/50">신학적 정확성 확인 필요</div>
      </div>
    </div>
  )
}

function GraphPreview() {
  return (
    <div className="relative h-[280px]">
      <svg viewBox="0 0 500 280" className="w-full h-full">
        {/* Edges */}
        <line x1="250" y1="60" x2="150" y2="120" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <line x1="250" y1="60" x2="350" y2="120" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <line x1="250" y1="60" x2="250" y2="160" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <line x1="150" y1="120" x2="100" y2="200" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        <line x1="350" y1="120" x2="400" y2="200" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        <line x1="250" y1="160" x2="250" y2="230" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        <line x1="150" y1="120" x2="250" y2="160" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
        <line x1="350" y1="120" x2="250" y2="160" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
        <line x1="100" y1="200" x2="250" y2="230" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        <line x1="400" y1="200" x2="250" y2="230" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        {/* Nodes */}
        <circle cx="250" cy="60" r="14" fill="rgba(74,222,128,0.3)" stroke="rgba(74,222,128,0.6)" strokeWidth="1" />
        <text x="250" y="64" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="7">은혜</text>
        <circle cx="150" cy="120" r="10" fill="rgba(96,165,250,0.3)" stroke="rgba(96,165,250,0.5)" strokeWidth="1" />
        <text x="150" y="123" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="6">요1:1</text>
        <circle cx="350" cy="120" r="8" fill="rgba(251,191,36,0.3)" stroke="rgba(251,191,36,0.5)" strokeWidth="1" />
        <text x="350" y="123" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="6">빛</text>
        <circle cx="250" cy="160" r="9" fill="rgba(167,139,250,0.3)" stroke="rgba(167,139,250,0.5)" strokeWidth="1" />
        <text x="250" y="163" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="6">로고스</text>
        <circle cx="100" cy="200" r="7" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <text x="100" y="203" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="5">창1</text>
        <circle cx="400" cy="200" r="7" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <text x="400" y="203" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="5">골1</text>
        <circle cx="250" cy="230" r="8" fill="rgba(248,113,113,0.2)" stroke="rgba(248,113,113,0.4)" strokeWidth="1" />
        <text x="250" y="233" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="5">시리즈</text>
      </svg>
      {/* Legend */}
      <div className="absolute bottom-2 left-3 flex gap-3 text-[8px] text-white/25">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400/50" />설교</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400/50" />본문</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gold-400/50" />주제</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400/40" />시리즈</span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   VALUE PROPOSITION SECTION
   ═══════════════════════════════════════════════════════════ */

function ValueSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-[11px] text-paper-400 uppercase tracking-widest font-semibold">왜 의미 있는가</span>
          <h2 className="text-[clamp(1.4rem,3.5vw,2rem)] font-serif font-bold text-paper-900 mt-3 mb-4">
            시간 절약이 아니라, 사고의 축적
          </h2>
        </div>

        <div className="bg-white rounded-xl border border-paper-200 p-8 sm:p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ValueItem
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
              title="깊이"
              description="연구와 작성이 분리되지 않습니다. 본문에서 원고까지의 흐름이 하나의 공간에서 이어지며, 설교의 깊이를 더합니다."
            />
            <ValueItem
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.172-1.414l1.414-1.414m4.242 0l1.415 1.414m-1.415 2.828l1.415-1.414" />
                </svg>
              }
              title="연결"
              description="이전 설교와 연구, 노트와 시리즈가 서로 연결됩니다. 흩어진 자료들이 하나의 지식망이 되어 다음 설교를 돕습니다."
            />
            <ValueItem
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              }
              title="축적"
              description="한 편의 설교가 완성되면 그것은 끝이 아닙니다. 아카이브에 저장되고, 그래프에서 연결되며, 사역의 자산이 됩니다."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function ValueItem({ icon, title, description }: {
  icon: React.ReactNode; title: string; description: string
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-xl bg-paper-100 flex items-center justify-center text-paper-500 mx-auto mb-3">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-paper-800 mb-2">{title}</h3>
      <p className="text-xs text-paper-500 leading-relaxed">{description}</p>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   AUDIENCE SECTION
   ═══════════════════════════════════════════════════════════ */

function AudienceSection() {
  return (
    <section className="py-20 sm:py-28 bg-white border-y border-paper-200">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-[11px] text-paper-400 uppercase tracking-widest font-semibold">누구를 위한 도구인가</span>
          <h2 className="text-[clamp(1.4rem,3.5vw,2rem)] font-serif font-bold text-paper-900 mt-3 mb-4">
            설교를 체계적으로 준비하는 사역자를 위해
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AudienceCard
            title="담임목사"
            description="매주 설교를 준비하며, 연구에서 원고까지의 흐름을 일관되게 관리하고 싶은 분"
          />
          <AudienceCard
            title="부목사 / 교육목회자"
            description="담당 사역의 말씀을 깊이 연구하고, 설교 자산을 체계적으로 축적하고 싶은 분"
          />
          <AudienceCard
            title="청년사역자"
            description="연속 설교 시리즈를 준비하며, 전체 흐름과 개별 설교의 관계를 함께 관리하고 싶은 분"
          />
          <AudienceCard
            title="신학생 / 강도권사"
            description="설교 준비의 구조를 배우고, 연구와 작성의 연결 과정을 체계적으로 경험하고 싶은 분"
          />
        </div>
      </div>
    </section>
  )
}

function AudienceCard({ title, description }: {
  title: string; description: string
}) {
  return (
    <div className="bg-paper-50 rounded-xl border border-paper-200 p-5">
      <h3 className="text-sm font-semibold text-paper-800 mb-1">{title}</h3>
      <p className="text-xs text-paper-500 leading-relaxed">{description}</p>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   FAQ SECTION
   ═══════════════════════════════════════════════════════════ */

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      q: '설교 원고만 작성하는 도구인가요?',
      a: '아닙니다. 성경 본문 연구, 설교 준비(중심명제·대지·적용), 원고 작성, 아카이브, 그래프 기반 연결 탐색, 노트/통찰 축적, 시리즈 관리까지 설교 사역의 전체 흐름을 다룹니다.',
    },
    {
      q: '기존 설교를 다시 활용할 수 있나요?',
      a: '네. 완료된 설교는 아카이브에 저장되며, 검색과 필터로 다시 찾을 수 있고, 새 프로젝트로 복제하여 재사용할 수 있습니다.',
    },
    {
      q: '시리즈 설교도 관리할 수 있나요?',
      a: '네. 연속 설교를 시리즈로 조직하면, 전체 흐름과 현재 설교의 위치를 함께 볼 수 있으며 시리즈 간 이동도 가능합니다.',
    },
    {
      q: '연구 메모와 통찰도 함께 저장되나요?',
      a: '네. 본문 연구 중 기록한 메모와 떠오른 통찰은 노트/통찰 기능에 유형별로 저장되며, 관련 설교와 본문에 다시 연결됩니다.',
    },
    {
      q: '일반 문서 편집기와 어떻게 다른가요?',
      a: '문서 편집기는 작성만 돕지만, 이 도구는 연구에서 준비, 작성, 아카이브까지 설교의 전체 여정을 함께합니다. 또한 설교 간 연결, 시리즈 흐름, 통찰 축적 등 목회적 맥락을 고려한 기능을 제공합니다.',
    },
  ]

  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-[11px] text-paper-400 uppercase tracking-widest font-semibold">자주 묻는 질문</span>
          <h2 className="text-[clamp(1.4rem,3.5vw,2rem)] font-serif font-bold text-paper-900 mt-3">
            궁금한 점이 있으신가요
          </h2>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-paper-200 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-paper-50 transition-colors"
              >
                <span className="text-sm font-medium text-paper-800 pr-4">{faq.q}</span>
                <svg
                  className={`w-4 h-4 text-paper-400 shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5">
                  <p className="text-xs text-paper-500 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   FINAL CTA SECTION
   ═══════════════════════════════════════════════════════════ */

function FinalCTASection() {
  const router = useRouter()

  return (
    <section className="py-20 sm:py-28 bg-navy-900 text-white">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-[clamp(1.4rem,3.5vw,2rem)] font-serif font-bold text-white mb-4">
          설교 준비의 새로운 흐름
        </h2>
        <p className="text-sm text-white/40 leading-relaxed max-w-xl mx-auto mb-10">
          연구에서 원고까지, 아카이브에서 연결까지.
          설교 사역의 전체 과정을 하나의 차분한 공간에서 경험해 보세요.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => router.push('/advanced')}
            className="text-sm bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-md transition-colors font-medium"
          >
            데모 보기
          </button>
          <button
            onClick={() => router.push('/advanced/projects')}
            className="text-sm text-white/60 hover:text-white border border-white/15 hover:border-white/30 px-8 py-3 rounded-md transition-colors"
          >
            작업 흐름 살펴보기
          </button>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════ */

function IntroFooter() {
  const router = useRouter()

  return (
    <footer className="bg-navy-950 text-white/30 py-12 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-white font-serif font-bold text-sm mb-2">말씀 연구실</h3>
            <p className="text-[11px] text-white/30 leading-relaxed">
              목회자를 위한 고급 설교 작업실.
              연구에서 원고까지, 설교의 전체 흐름을 하나의 공간에서 연결합니다.
            </p>
          </div>
          <div>
            <h4 className="text-white/50 text-[10px] uppercase tracking-widest font-semibold mb-3">탐색</h4>
            <div className="space-y-1.5">
              <button onClick={() => router.push('/advanced')} className="block text-[11px] text-white/30 hover:text-white/60 transition-colors">대시보드</button>
              <button onClick={() => router.push('/advanced/projects')} className="block text-[11px] text-white/30 hover:text-white/60 transition-colors">설교 프로젝트</button>
              <button onClick={() => router.push('/advanced/archive')} className="block text-[11px] text-white/30 hover:text-white/60 transition-colors">설교 아카이브</button>
              <button onClick={() => router.push('/advanced/graph')} className="block text-[11px] text-white/30 hover:text-white/60 transition-colors">그래프</button>
              <button onClick={() => router.push('/advanced/notes')} className="block text-[11px] text-white/30 hover:text-white/60 transition-colors">노트 / 통찰</button>
            </div>
          </div>
          <div>
            <h4 className="text-white/50 text-[10px] uppercase tracking-widest font-semibold mb-3">문의</h4>
            <p className="text-[11px] text-white/30 leading-relaxed">
              제품 문의 및 데모 요청은<br />
              언제든지 환영합니다.
            </p>
          </div>
        </div>
        <div className="border-t border-white/5 pt-6 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] text-white/20">v2.0 · 2026</span>
          <span className="text-[10px] text-white/20">설교를 준비하는 작업실</span>
        </div>
      </div>
    </footer>
  )
}
