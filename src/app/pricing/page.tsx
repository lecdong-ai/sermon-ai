'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, X, Sparkles, Cross, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import type { UsageInfo } from '@/types'

const FAQ_ITEMS = [
  {
    q: 'AI 분석 1회는 무엇인가요?',
    a: '설교 원고 1건을 업로드하고 AI가 요약, 소그룹 나눔 자료, 카드뉴스, 설교 대본, 쇼츠 대본, PPT 6종 결과물을 모두 생성하는 것을 1회로 간주합니다.',
  },
  {
    q: '분석 중 오류가 나면 횟수가 차감되나요?',
    a: '아닙니다. AI 분석이 성공적으로 완료되어야만 횟수가 차감됩니다. 오류나 네트워크 문제로 실패한 경우 차감되지 않습니다.',
  },
  {
    q: 'Basic과 Pro의 차이는 무엇인가요?',
    a: 'Basic은 월 10회 분석이 가능하며 핵심 결과물을 모두 제공합니다. Pro는 월 20회 분석에 더해 설교 준비를 위한 워크스페이스(본문 관찰, 핵심 메시지, 개요 작성, 원고 작성 도구)를 추가로 사용하실 수 있습니다.',
  },
  {
    q: '사용하지 않은 횟수가 다음 달로 이월되나요?',
    a: '사용하지 않은 횟수는 다음 달로 이월되지 않습니다. 매월 초기화되는 점 양해 부탁드립니다.',
  },
  {
    q: '구독을 해지하면 어떻게 되나요?',
    a: '해지 시 현재 결제 주기가 끝날 때까지 서비스를 계속 사용하실 수 있습니다. 이후에는 분석 생성 기능이 제한되며, 기존에 생성한 결과는 읽기 및 다운로드가 가능합니다.',
  },
  {
    q: '무료체험 후 자동 결제되나요?',
    a: '아닙니다. 무료체험 종료 후에는 자동으로 결제되지 않습니다. 요금제를 직접 선택하여 구독하셔야 서비스를 계속 이용하실 수 있습니다.',
  },
]

export default function PricingPage() {
  const { user } = useAuth()
  const [usage, setUsage] = useState<UsageInfo | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return
    fetch('/api/usage').then(r => r.json()).then(d => { if (!d.error) setUsage(d) }).catch(() => {})
  }, [user])

  const currentPlan = usage?.plan || 'none'

  const plans = [
    {
      id: 'free' as const,
      name: '무료체험',
      price: '0',
      unit: '',
      period: '',
      features: [
        { text: 'AI 분석 3회', ok: true },
        { text: '요약 / 나눔 자료 / 카드뉴스', ok: true },
        { text: '설교 대본 / 쇼츠 대본 / PPT', ok: true },
        { text: '결과 공유 및 다운로드', ok: true },
        { text: '설교 워크스페이스', ok: false },
        { text: '유효 기간 15일', ok: true },
      ],
      cta: '시작하기',
      href: user ? '/' : '/login',
      highlight: false,
      current: currentPlan === 'none',
    },
    {
      id: 'basic' as const,
      name: 'Basic',
      price: '9,900',
      unit: '원',
      period: '/월',
      features: [
        { text: 'AI 분석 월 10회', ok: true },
        { text: '요약 / 나눔 자료 / 카드뉴스', ok: true },
        { text: '설교 대본 / 쇼츠 대본 / PPT', ok: true },
        { text: '결과 공유 및 다운로드', ok: true },
        { text: '설교 워크스페이스', ok: false },
        { text: '매월 초기화', ok: true },
      ],
      cta: currentPlan === 'basic' ? '현재 이용 중' : '월간 구독',
      href: currentPlan === 'none' ? '/billing/subscribe?plan=basic' : '#',
      highlight: false,
      current: currentPlan === 'basic',
    },
    {
      id: 'pro' as const,
      name: 'Pro',
      price: '19,800',
      unit: '원',
      period: '/월',
      features: [
        { text: 'AI 분석 월 20회', ok: true },
        { text: '요약 / 나눔 자료 / 카드뉴스', ok: true },
        { text: '설교 대본 / 쇼츠 대본 / PPT', ok: true },
        { text: '결과 공유 및 다운로드', ok: true },
        { text: '설교 워크스페이스', ok: true },
        { text: '매월 초기화', ok: true },
      ],
      cta: currentPlan === 'pro' ? '현재 이용 중' : currentPlan === 'basic' ? '업그레이드' : '월간 구독',
      href: currentPlan === 'none' ? '/billing/subscribe?plan=pro' : '#',
      highlight: true,
      current: currentPlan === 'pro',
    },
  ]

  return (
    <div className="relative min-h-screen bg-slate-50/50">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-indigo-300/10 via-blue-300/5 to-transparent blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-purple-300/8 via-indigo-300/5 to-transparent blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-16 sm:py-24">
        {/* Header */}
        <div className="text-center mb-12 animate-in">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gradient tracking-tight mb-4">
            목회자를 위한 현명한 선택
          </h1>
          <p className="text-[17px] text-slate-500 max-w-xl mx-auto leading-relaxed">
            AI가 설교 준비의 부담을 덜어드립니다. 필요한 만큼만 선택하세요.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16 animate-in" style={{ animationDelay: '0.1s' }}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative glass-panel rounded-3xl border p-6 transition-all duration-300 ${
                plan.highlight
                  ? 'border-indigo-300/60 shadow-xl shadow-indigo-500/10 scale-[1.02]'
                  : 'border-white/60 hover:shadow-lg'
              } ${plan.current ? 'ring-2 ring-indigo-500' : ''}`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[11px] font-bold px-3 py-1 rounded-full">
                  추천
                </div>
              )}

              <div className="text-center mb-5 mt-1">
                <h3 className="text-[18px] font-extrabold text-slate-800 mb-3">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-0.5">
                  <span className="text-3xl font-extrabold text-slate-900">{plan.price}</span>
                  {plan.unit && <span className="text-[18px] font-bold text-slate-500">{plan.unit}</span>}
                  {plan.period && <span className="text-[14px] text-slate-400 font-medium">{plan.period}</span>}
                </div>
              </div>

              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13px]">
                    {f.ok ? (
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                    )}
                    <span className={f.ok ? 'text-slate-700' : 'text-slate-400'}>{f.text}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block text-center py-3 rounded-xl text-[14px] font-bold transition-all ${
                  plan.current
                    ? 'bg-slate-100 text-slate-400 cursor-default'
                    : plan.highlight
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:shadow-lg hover:shadow-indigo-200/50 active:scale-[0.98]'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-[0.98]'
                }`}
                onClick={(e) => {
                  if (plan.current) e.preventDefault()
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* 차감 기준 설명 */}
        <div className="glass-panel rounded-2xl border border-white/60 p-6 mb-16 animate-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-slate-800 mb-1">안심하고 사용하세요</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                크레딧은 AI 분석이 <strong>성공적으로 완료되어야</strong> 차감됩니다.
                분석 중 오류가 발생하거나 중단된 경우에는 차감되지 않으니 안심하세요.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="animate-in" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-[22px] font-extrabold text-slate-800 text-center mb-6">자주 묻는 질문</h2>
          <div className="max-w-2xl mx-auto space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="glass-panel rounded-2xl border border-white/60 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-[14px] font-bold text-slate-700">{item.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-[13px] text-slate-500 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
