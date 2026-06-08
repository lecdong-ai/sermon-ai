'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, X, Sparkles, ChevronDown, ChevronUp, Shield, CreditCard } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { PLAN_DATA, FREE_PLAN, type Plan } from '@/lib/billing/types'
import type { UsageInfo } from '@/types'

const FAQ_ITEMS = [
  {
    q: 'AI 분석 및 컨텐츠 제작 1회는 무엇인가요?',
    a: '설교 원고 1건을 업로드하고 AI가 요약, 소그룹 나눔 자료, 카드뉴스, 설교 대본, 쇼츠 대본, PPT 6종 결과물을 모두 생성하는 것을 1회로 간주합니다.',
  },
  {
    q: 'Basic과 Pro의 차이는 무엇인가요?',
    a: 'Basic은 월 10회, Pro는 월 20회의 AI 분석 및 컨텐츠 제작과 설교원고제작이 가능합니다. Pro는 또한 고급형 설교원고제작을 월 20회 이용하실 수 있어 설교 준비를 더 풍성하게 하실 수 있습니다.',
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
    q: '매월 자동결제되나요?',
    a: '네, 매월 같은 날짜에 자동으로 결제됩니다. 언제든 구독을 해지할 수 있으며, 해지 시 다음 결제일부터 자동결제가 중단됩니다.',
  },
  {
    q: '결제는 안전하게 처리되나요?',
    a: '모든 결제는 토스페이먼츠(Toss Payments)를 통해 안전하게 처리됩니다. 카드 정보는 토스페이먼츠가 안전하게 보관하며, 당사 서버에 저장되지 않습니다.',
  },
  {
    q: '무료체험 후 자동 결제되나요?',
    a: '아닙니다. 무료체험 종료 후에는 자동으로 결제되지 않습니다. 요금제를 직접 선택하여 구독하셔야 서비스를 계속 이용하실 수 있습니다.',
  },
]

function PlanCard({ plan, isFree, currentPlan, isLoggedIn, trialRemaining }: { plan: any; isFree?: boolean; currentPlan: string; isLoggedIn: boolean; trialRemaining?: number }) {
  const isCurrent = isFree ? currentPlan === 'none' : currentPlan === plan.id

  const getHref = () => {
    if (isCurrent) return '#'
    if (!isLoggedIn) return '/login?redirect=/pricing'
    if (isFree) return '/'
    return `/billing?plan=${plan.id}`
  }

  const getCtaText = () => {
    if (isCurrent && isFree) return trialRemaining ? `무료체험 중 (${trialRemaining}회 남음)` : '현재 이용 중'
    if (isCurrent) return '현재 이용 중'
    if (!isLoggedIn) return isFree ? '회원가입 후 시작' : '로그인 후 구독'
    if (isFree) return '시작하기'
    return '구독 시작하기'
  }

  const getPriceDisplay = () => {
    if (isFree) {
      return (
        <>
          <span className="text-3xl font-extrabold text-slate-900">무료</span>
        </>
      )
    }
    return (
      <>
        <span className="text-3xl font-extrabold text-slate-900">{plan.price.toLocaleString()}</span>
        <span className="text-[18px] font-bold text-slate-500">원</span>
        <span className="text-[14px] text-slate-400 font-medium">/월</span>
      </>
    )
  }

  return (
    <div
      className={`relative rounded-3xl border p-6 sm:p-8 transition-all duration-300 flex flex-col ${
        plan.isRecommended && !isFree
          ? 'border-indigo-300/60 shadow-xl shadow-indigo-500/10 scale-[1.02] bg-white'
          : 'border-slate-200/60 hover:shadow-lg bg-white/90'
      } ${isCurrent ? 'ring-2 ring-indigo-500' : ''}`}
    >
      {plan.isRecommended && !isFree && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
          가장 인기 있는 플랜
        </div>
      )}

      {isCurrent && (
        <div className="absolute -top-3 right-4 bg-emerald-500 text-white text-[11px] font-bold px-3 py-1 rounded-full">
          {isFree ? '현재 이용 중' : '현재 이용 중'}
        </div>
      )}

      <div className="text-center mb-6 mt-1">
        <h3 className="text-[18px] font-extrabold text-slate-800 mb-2">{plan.name}{!isFree && ' Plan'}</h3>
        <p className="text-[13px] text-slate-400 leading-relaxed mb-4">{plan.description}</p>
        <div className="flex items-baseline justify-center gap-0.5">
          {getPriceDisplay()}
        </div>
        {!isFree && <p className="text-[11px] text-slate-400 mt-1">(VAT 별도)</p>}
      </div>

      <ul className="space-y-3 mb-6 flex-1">
        {plan.features.map((f: any, i: number) => (
          <li key={i} className={`flex items-start gap-2.5 text-[13px] ${f.highlight ? 'bg-gradient-to-r from-indigo-50 to-purple-50 -mx-2 px-2 py-1.5 rounded-lg border border-indigo-100' : ''}`}>
            {f.ok ? (
              <Check className={`w-4 h-4 shrink-0 mt-0.5 ${f.highlight ? 'text-indigo-600' : 'text-emerald-500'}`} />
            ) : (
              <X className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
            )}
            <span className={`font-medium ${f.highlight ? 'text-indigo-700' : f.ok ? 'text-slate-700' : 'text-slate-400'}`}>
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={getHref()}
        className={`block text-center py-3 rounded-xl text-[14px] font-bold transition-all ${
          isCurrent
            ? 'bg-slate-100 text-slate-400 cursor-default'
            : plan.isRecommended && !isFree
            ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:shadow-lg hover:shadow-indigo-200/50 active:scale-[0.98]'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-[0.98]'
        }`}
        onClick={(e) => { if (isCurrent) e.preventDefault() }}
      >
        {getCtaText()}
      </Link>
    </div>
  )
}

export default function PricingPage() {
  const { user } = useAuth()
  const [usage, setUsage] = useState<UsageInfo | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return
    fetch('/api/usage').then(r => r.json()).then(d => { if (!d.error) setUsage(d) }).catch(() => {})
  }, [user])

  const currentPlan = usage?.plan || 'none'
  const trialRemaining = usage?.trial?.remaining

  return (
    <div className="relative min-h-screen bg-slate-50/50">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-indigo-300/10 via-blue-300/5 to-transparent blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-purple-300/8 via-indigo-300/5 to-transparent blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-12 animate-in">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gradient tracking-tight mb-4">
            목회자를 위한 현명한 선택
          </h1>
          <p className="text-[17px] text-slate-500 max-w-xl mx-auto leading-relaxed">
            AI가 설교 준비의 부담을 덜어드립니다. 필요한 만큼만 선택하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16 animate-in" style={{ animationDelay: '0.1s' }}>
          <PlanCard plan={FREE_PLAN} isFree currentPlan={currentPlan} isLoggedIn={!!user} trialRemaining={trialRemaining} />
          {PLAN_DATA.map((plan) => (
            <PlanCard key={plan.id} plan={plan} currentPlan={currentPlan} isLoggedIn={!!user} />
          ))}
        </div>

        <div className="text-center mb-16 animate-in" style={{ animationDelay: '0.15s' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-[13px] text-slate-500">
            <CreditCard className="w-4 h-4 text-slate-400" />
            매월 자동 갱신되며, 언제든 해지할 수 있습니다
          </div>
          <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-[12px] text-slate-400">
            <Shield className="w-3.5 h-3.5" />
            결제는 토스페이먼츠를 통해 안전하게 처리됩니다
          </div>
        </div>

        <div className="animate-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-[22px] font-extrabold text-slate-800 text-center mb-8">자주 묻는 질문</h2>
          <div className="max-w-2xl mx-auto space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
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

        <div className="mt-12 text-center animate-in" style={{ animationDelay: '0.3s' }}>
          <Link
            href="/billing/manage"
            className="inline-flex items-center gap-2 text-[13px] text-slate-400 hover:text-slate-600 transition-colors"
          >
            이미 구독 중이신가요? 구독 관리 페이지로 이동
          </Link>
        </div>
      </div>
    </div>
  )
}
