'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Upload, Sparkles, FileText, Share2, Cross, LogIn, LayoutDashboard, ArrowRight, CheckCircle, Star, Shield, Zap, Globe } from 'lucide-react'
import FileUpload from '@/components/FileUpload'
import UsageBadge from '@/components/UsageBadge'
import { useAuth } from '@/components/AuthProvider'

const STEPS = [
  { icon: Upload, title: '파일 업로드', desc: '설교 원고(PDF/TXT/DOCX)를 안전하게 업로드하세요', color: 'from-blue-500 to-indigo-600' },
  { icon: Sparkles, title: 'AI 초고속 생성', desc: '인공지능이 6종 고품질 콘텐츠를 즉시 설계합니다', color: 'from-indigo-500 to-purple-600' },
  { icon: FileText, title: '다차원 결과 분석', desc: '설교 요약, 나눔, 대본 등을 한눈에 검토하세요', color: 'from-purple-500 to-pink-600' },
  { icon: Share2, title: '스마트 공유 & 다운', desc: '링크 전달은 물론, PPT 및 문서로 간편 저장', color: 'from-pink-500 to-rose-600' },
]

const FEATURES = [
  { icon: FileText, title: '설교 요약', desc: '서론/본론/결론/적용 포인트 자동 정리' },
  { icon: Share2, title: '소그룹 나눔', desc: '연령대별 맞춤 나눔 질문 자동 생성' },
  { icon: Sparkles, title: '카드뉴스', desc: '5장 슬라이드 + 이미지 저장' },
  { icon: Zap, title: '설교 대본', desc: '구어체 10분 설교 대본 생성' },
  { icon: Globe, title: '쇼츠 대본', desc: 'YouTube Shorts 60초 대본' },
  { icon: Star, title: 'PPT 다운로드', desc: '표지/목차/본문/마무리 .pptx' },
]

const TRUST_BADGES = [
  { icon: Shield, text: 'SSL 암호화 전송' },
  { icon: CheckCircle, text: '15일 무료 체험' },
  { icon: Zap, text: 'GPT-4o-mini 탑재' },
]

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

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

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 배경 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#fafbfc]" />
        <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] rounded-full bg-gradient-to-br from-blue-400/10 via-indigo-300/8 to-transparent blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-purple-400/10 via-indigo-300/6 to-transparent blur-3xl" />
      </div>

      {/* 히어로 */}
      <section className="relative pt-20 pb-12 sm:pt-28 sm:pb-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50/70 border border-indigo-200/40 text-indigo-600 text-[13px] font-semibold mb-6 sm:mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              AI 기반 설교 준비 플랫폼
            </div>

            <h1 className="reveal text-[clamp(2rem,6vw,3.75rem)] font-extrabold tracking-tight leading-[1.1] font-outfit mb-5">
              <span className="text-gradient">목회자를 위한</span>
              <br />
              <span className="text-slate-900">지능형 AI 솔루션</span>
            </h1>

            <p className="reveal text-[clamp(1rem,2.5vw,1.2rem)] text-slate-500 leading-relaxed max-w-2xl mx-auto font-medium">
              복잡한 설교 준비 과정을 획기적으로 혁신합니다. 원고를 업로드하면 요약서,
              소그룹 나눔 질문, 카드뉴스, 유튜브 쇼츠 대본까지 자동으로 정밀 설계됩니다.
            </p>

            <div className="reveal mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              {!loading && !user && (
                <Link
                  href="/login?redirect=/"
                  className="group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 text-white font-bold text-[16px] shadow-xl shadow-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto justify-center"
                >
                  <LogIn className="w-5 h-5" />
                  지금 시작하기
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              {!loading && user && (
                <>
                  <Link
                    href="/dashboard"
                    className="group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 text-white font-bold text-[16px] shadow-xl shadow-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto justify-center"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    대시보드로 이동
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white border border-slate-200/60 text-slate-700 font-bold text-[16px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto justify-center"
                  >
                    <Upload className="w-5 h-5 text-indigo-500" />
                    새 설교 만들기
                  </button>
                </>
              )}
            </div>

            {/* 신뢰 배지 */}
            <div className="reveal mt-10 flex flex-wrap items-center justify-center gap-5 sm:gap-8">
              {TRUST_BADGES.map((badge) => (
                <div key={badge.text} className="flex items-center gap-1.5 text-[13px] text-slate-400 font-medium">
                  <badge.icon className="w-4 h-4 text-emerald-500" />
                  {badge.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step 워크플로우 */}
      <section className="relative py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="reveal text-[clamp(1.5rem,4vw,2rem)] font-extrabold text-slate-900 font-outfit mb-3">
              설교 준비, 이제 4단계로
            </h2>
            <p className="reveal text-[15px] sm:text-[17px] text-slate-500 font-medium">
              업로드부터 공유까지, 모든 과정이 매끄럽게 연결됩니다
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="reveal group"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="relative h-full p-6 sm:p-7 rounded-2xl bg-white/70 backdrop-blur-xl border border-slate-200/50 hover:border-indigo-200/60 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-500">
                  <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:text-center">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg shadow-indigo-500/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                      <step.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="sm:mt-3">
                      <div className="flex items-center gap-2 sm:justify-center">
                        <span className="text-[11px] font-bold text-indigo-400">STEP {i + 1}</span>
                      </div>
                      <p className="text-[15px] sm:text-[17px] font-bold text-slate-800 mt-0.5">{step.title}</p>
                    </div>
                  </div>
                  <p className="text-[13px] sm:text-[14px] text-slate-400 leading-relaxed mt-3 sm:text-center">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 주요 기능 */}
      <section className="relative py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="reveal text-[clamp(1.5rem,4vw,2rem)] font-extrabold text-slate-900 font-outfit mb-3">
              하나의 원고로 여섯 가지 결과
            </h2>
            <p className="reveal text-[15px] sm:text-[17px] text-slate-500 font-medium">
              AI가 설교 원고를 분석하여 다양한 형태의 콘텐츠로 변환합니다
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className="reveal group"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="h-full p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/40 hover:border-indigo-200/50 shadow-sm hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-300 text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:from-indigo-100 group-hover:to-blue-100 transition-all duration-300">
                    <feature.icon className="w-5 h-5 text-indigo-500" />
                  </div>
                  <p className="text-[13px] sm:text-[15px] font-bold text-slate-800 mb-1">{feature.title}</p>
                  <p className="text-[11px] sm:text-[12px] text-slate-400 leading-snug">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 업로드 섹션 */}
      <section className="relative py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="reveal">
            {!loading && (
              <>
                {user ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-stretch">
                    <div className="sm:col-span-2">
                      <div className="rounded-2xl sm:rounded-3xl bg-white/60 backdrop-blur-xl border border-slate-200/40 shadow-lg shadow-indigo-500/3 p-1 h-full">
                        <FileUpload onSuccess={handleUploadSuccess} />
                      </div>
                    </div>
                    <div className="sm:col-span-1">
                      <div className="rounded-2xl sm:rounded-3xl bg-white/60 backdrop-blur-xl border border-slate-200/40 shadow-lg shadow-indigo-500/3 p-4 sm:p-5 h-full flex flex-col items-center justify-center">
                        <UsageBadge />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/60 backdrop-blur-xl border border-slate-200/40 shadow-lg p-8 sm:p-12 text-center">
                    <div className="relative">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center mx-auto mb-5">
                        <Upload className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400" />
                      </div>
                      <p className="text-[17px] sm:text-[20px] font-bold text-slate-800 mb-2">
                        원고 업로드를 위해 로그인이 필요합니다
                      </p>
                      <p className="text-[14px] sm:text-[15px] text-slate-400 mb-6 max-w-md mx-auto">
                        간단히 소셜/이메일 로그인 후 AI 생성 서비스를 이용하실 수 있습니다.
                      </p>
                      <Link
                        href="/login?redirect=/"
                        className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-[15px] shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <LogIn className="w-4 h-4" />
                        로그인하기
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* 팁 */}
      <section className="relative pb-16 sm:pb-24">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="reveal rounded-2xl bg-gradient-to-br from-indigo-50/60 via-blue-50/40 to-transparent border border-indigo-200/30 p-5 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-100/70 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[14px] sm:text-[15px] text-indigo-900 mb-2.5">
                  스마트 솔루션 꿀팁
                </p>
                <ul className="space-y-1.5">
                  {[
                    'PDF, TXT, DOCX 포맷을 완벽하게 지원합니다 (최대 20MB)',
                    '옛날 한글 문서(.doc)는 미리 .docx로 변환해 주세요!',
                    'AI 정밀 모델 설계는 통상 20~40초 가량 소요됩니다',
                    '분석 완료된 모든 콘텐츠는 마이페이지에 영구 소장됩니다',
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12.5px] sm:text-[13.5px] text-indigo-700/80 font-medium">
                      <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-md px-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-sm glass-panel rounded-2xl border border-white/70 shadow-2xl overflow-hidden animate-scale"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-200/60">
              <h2 className="text-[16px] font-extrabold text-slate-800">설교 방식 선택</h2>
              <p className="text-[12px] text-slate-400 mt-0.5">원하시는 설교 준비 방식을 선택하세요</p>
            </div>
            <div className="p-5 space-y-2">
              <button
                onClick={() => router.push('/sermon/advanced')}
                className="w-full p-4 rounded-xl bg-gradient-to-br from-indigo-50/80 to-blue-50/80 border border-indigo-200/40 hover:border-indigo-300/60 hover:shadow-md transition-all duration-200 text-left group relative"
              >
                <div className="flex items-center gap-2">
                  <p className="text-[15px] font-extrabold text-indigo-700 group-hover:text-indigo-800 transition-colors">실전형 설교준비</p>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] font-extrabold tracking-wide shadow-sm">
                    PRO
                  </span>
                </div>
                <p className="text-[12px] text-slate-500 mt-1 font-medium">업그레이드된 AI — 더 풍성한 결과물</p>
              </button>
              <button
                onClick={() => router.push('/sermon/new')}
                className="w-full p-4 rounded-xl bg-white border border-slate-200/60 hover:border-slate-300/80 hover:shadow-md transition-all duration-200 text-left group"
              >
                <p className="text-[15px] font-extrabold text-slate-700 group-hover:text-slate-800 transition-colors">일반형 설교준비</p>
                <p className="text-[12px] text-slate-400 mt-0.5 font-medium">기본 AI 모델 — 빠르고 간편하게</p>
              </button>
            </div>
            <div className="px-5 pb-3">
              <div className="flex items-center justify-center gap-1.5 mb-3 text-[11px] text-slate-400">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
                실전형 설교준비는 <strong className="text-slate-600">PRO 플랜</strong> 전용입니다
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2.5 rounded-xl text-[13px] font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 transition-all duration-200"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .reveal {
          opacity: 1;
        }
        .reveal.visible {
          animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
