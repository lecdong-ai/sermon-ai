'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, ChevronRight, MessageCircle, Mail, Sparkles, Server, Cpu, ExternalLink, Quote, HandHeart, Check, X, Crown } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

const BENEFITS = [
  {
    icon: Sparkles,
    title: '말씀 연구실 전체 이용',
    desc: 'PrepTab, ManuscriptTab, 성경 정밀 연구, 연구 노트까지 모든 고급 도구를 제한 없이 사용하세요.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Cpu,
    title: '고급 AI 모델 우선 사용',
    desc: '더 정교한 설문 분석과 원고 생성을 위한 상위 모델에 우선 접근할 수 있습니다.',
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    icon: HandHeart,
    title: '서비스 방향성에 기여',
    desc: '후원자님의 의견이 기능 개발 우선순위에 반영됩니다. 함께 만들어가는 서비스입니다.',
    gradient: 'from-amber-500 to-rose-500',
  },
]

const FAQ = [
  {
    q: '후원이 필수인가요?',
    a: '아닙니다. 일반 대시보드의 모든 기능은 계속 무료입니다. 후원은 말씀 연구실(Advanced)이 필요하신 분만 참여해주시면 됩니다.',
  },
  {
    q: '얼마나 후원하면 되나요?',
    a: '월 10,000원부터 자유롭게 설정하실 수 있습니다. AI API 운영 비용을 고려한 추천 금액은 월 30,000원입니다. 부담되지 않는 선에서 참여해주세요.',
  },
  {
    q: '후원하면 바로 쓸 수 있나요?',
    a: '후원 확인 후 24시간 이내에 관리자가 수동으로 활성화해드립니다. 카카오톡으로 알려주시면 더 빠르게 처리됩니다.',
  },
  {
    q: '후원은 1회성인가요?',
    a: '1회 후원 시 30일간 이용 가능합니다. 정기 후원을 원하시면 매월 계좌 이체로 계속 이용하실 수 있습니다.',
  },
]

const costData = [
  { label: 'AI API (월)', amount: '약 150만원', icon: Cpu },
  { label: '서버 인프라 (월)', amount: '약 50만원', icon: Server },
]

type SupportTier = 'general' | 'supporter'

const COMPARISON: Array<{
  category: string
  feature: string
  note?: string
  general: SupportTier | string
  supporter: SupportTier | string
}> = [
  // 월간 한도 (Phase 1)
  { category: '월간 한도 (30일 롤링)', feature: 'AI 분석 6종', note: '업로드한 설교 6종 자동 생성', general: '10편', supporter: '20편' },
  { category: '월간 한도 (30일 롤링)', feature: '새 설교 등록', note: '본문 직접 입력', general: '10편', supporter: '20편' },
  { category: '월간 한도 (30일 롤링)', feature: '말씀 연구실 (설교 프로젝트)', note: '성경 정밀 연구 + 원고 작성', general: '1편', supporter: '20편' },
  { category: '월간 한도 (30일 롤링)', feature: '유튜브 연구소', note: '유튜브 설교 영상 분석', general: '1회', supporter: '10회' },
  // 기본 기능
  { category: '기본 기능', feature: 'AI 설교 원고 생성', note: '요약·소그룹·카드뉴스·PPT·설교 대본·쇼츠', general: 'check', supporter: 'check' },
  { category: '기본 기능', feature: '설교 아카이브', general: 'check', supporter: 'check' },
  { category: '기본 기능', feature: '데이터 보존', note: '한도 초과 시에도 영구 보존', general: 'check', supporter: 'check' },
  // 워크스페이스
  { category: '워크스페이스', feature: '동시 프로젝트 수', general: '1개', supporter: '20개' },
  // 사역 동참자 전용
  { category: '사역 동참자 전용', feature: '신규 기능 우선 접근', general: 'cross', supporter: 'check' },
  { category: '사역 동참자 전용', feature: '기능 개발 의견 반영', general: 'cross', supporter: 'check' },
  { category: '사역 동참자 전용', feature: '결제·환불 지원', general: 'check', supporter: 'check' },
]

function ComparisonCell({ value, tier }: { value: string; tier: 'general' | 'supporter' }) {
  if (value === 'check') {
    return (
      <div className="flex items-center justify-center">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
          tier === 'supporter'
            ? 'bg-amber-500/20 border border-amber-500/40'
            : 'bg-emerald-500/15 border border-emerald-500/30'
        }`}>
          <Check className={`w-3.5 h-3.5 ${tier === 'supporter' ? 'text-amber-300' : 'text-emerald-300'}`} strokeWidth={3} />
        </div>
      </div>
    )
  }
  if (value === 'cross') {
    return (
      <div className="flex items-center justify-center">
        <X className="w-4 h-4 text-slate-600" strokeWidth={2.5} />
      </div>
    )
  }
  return (
    <span className={`text-[12px] font-semibold tabular-nums ${
      tier === 'supporter' ? 'text-amber-200' : 'text-slate-300'
    }`}>{value}</span>
  )
}

export default function SupportPage() {
  const { user } = useAuth()
  const [isSupporter, setIsSupporter] = useState<boolean | null>(null)
  const [supporterUntil, setSupporterUntil] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setIsSupporter(null)
      return
    }
    fetch('/api/usage')
      .then(r => r.json())
      .then(d => {
        if (d.error) return
        setIsSupporter(!!d.supporter)
        setSupporterUntil(d.supporter_until || null)
      })
      .catch(() => {})
  }, [user])

  // 카테고리별 그룹화
  const groupedComparison = COMPARISON.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, typeof COMPARISON>)

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100">
      {/* 배경 이펙트 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-15%] w-[80vw] h-[80vw] max-w-[1000px] rounded-full bg-gradient-to-br from-rose-600/10 via-purple-500/5 to-transparent blur-3xl" />
        <div className="absolute bottom-[10%] right-[-15%] w-[70vw] h-[70vw] max-w-[900px] rounded-full bg-gradient-to-tr from-amber-600/8 via-rose-500/5 to-transparent blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 py-16 sm:py-24">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-500/20">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            함께 만들어가는
            <br />
            <span className="text-gradient-neon">Bunker 목양</span>
          </h1>
          <p className="text-[16px] text-slate-400 max-w-xl mx-auto leading-relaxed">
            이 서비스는 목회자님의 후원으로 운영됩니다. <br />
            강요하지 않습니다. 가치를 느끼셨다면 함께해 주세요.
          </p>
        </div>

        {/* 개발자의 편지 */}
        <div className="relative rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] p-8 sm:p-10 mb-8 overflow-hidden">
          {/* 장식 따옴표 */}
          <Quote className="absolute top-4 right-5 w-16 h-16 text-white/[0.04]" />
          <div className="relative">
            <h2 className="text-[13px] font-bold text-rose-400/80 mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              개발자의 편지
            </h2>
            <div className="space-y-4 text-[15px] text-slate-300 leading-relaxed">
              <p>
                안녕하세요. Bunker 목양을 만들고 있는 개발자입니다.
              </p>
              <p>
                이 서비스는 제가 목회하시는 분들을 위해 시작한 프로젝트입니다.
                주일 설교 준비로 밤을 새우는 목사님들을 보면서, AI가 그 짐을 조금이라도 덜어드릴 수 있다면 좋겠다고 생각했습니다.
              </p>
              <p>
                지금은 매일 수백 건의 설교 분석이 이루어지고 있습니다. 기쁜 일이지만, AI API 비용과 서버 비용은 개인이 감당하기에 만만치 않은 수준입니다.
              </p>
              <p>
                솔직히 말씀드립니다. 후원은 이 서비스를 지속 가능하게 만드는 힘입니다.
                부담되지 않는 선에서 함께해 주신다면, 이 서비스를 더욱 발전시켜 목회자님들의 사역을 돕는 도구로 키워나가겠습니다.
              </p>
            </div>
            <div className="mt-6 pt-5 border-t border-white/[0.06]">
              <p className="text-[14px] text-slate-400">
                감사합니다. <span className="text-slate-400">거창에서</span> <span className="text-white font-medium">전집사</span> 드림
              </p>
            </div>
          </div>
        </div>

        {/* 비교표 — 일반 vs 사역 동참자 */}
        <div className="rounded-3xl bg-white/[0.04] border border-white/[0.06] p-6 sm:p-8 mb-6 overflow-hidden">
          <h2 className="text-[16px] font-bold text-white mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-400" />
            일반 회원 vs 사역 동참자
          </h2>
          <p className="text-[12px] text-slate-500 mb-5">
            한도는 가입일 기준 30일 단위로 리셋됩니다. 사역 동참자는 모든 한도가 2배 이상으로 늘어납니다.
          </p>

          {/* 현재 등급 표시 */}
          {user && isSupporter !== null && (
            <div className={`mb-5 px-4 py-3 rounded-xl border flex items-center gap-2.5 ${
              isSupporter
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-indigo-500/10 border-indigo-500/30'
            }`}>
              {isSupporter ? (
                <Crown className="w-4 h-4 text-amber-300" />
              ) : (
                <Heart className="w-4 h-4 text-indigo-300" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-[13px] font-bold ${isSupporter ? 'text-amber-200' : 'text-indigo-200'}`}>
                  현재 회원님은 {isSupporter ? '사역 동참자' : '일반 회원'}입니다
                </p>
                {isSupporter && supporterUntil && (
                  <p className="text-[11px] text-amber-300/70 mt-0.5">
                    만료 예정: {new Date(supporterUntil).toLocaleDateString('ko-KR')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 데스크톱 테이블 */}
          <div className="hidden sm:block overflow-hidden rounded-2xl border border-white/[0.08]">
            <table className="w-full">
              <thead>
                <tr className="bg-white/[0.04]">
                  <th className="text-left px-5 py-3.5 text-[12px] font-bold text-slate-400 w-[40%]">기능</th>
                  <th className={`text-center px-4 py-3.5 text-[12px] font-bold w-[30%] ${
                    user && isSupporter === false ? 'text-indigo-300 bg-indigo-500/[0.08]' : 'text-slate-400'
                  }`}>
                    <div className="flex flex-col items-center gap-0.5">
                      <span>일반 회원</span>
                      <span className="text-[10px] font-normal text-slate-500">무료</span>
                    </div>
                  </th>
                  <th className={`text-center px-4 py-3.5 text-[12px] font-bold w-[30%] ${
                    user && isSupporter === true ? 'text-amber-300 bg-amber-500/[0.08]' : 'text-slate-400'
                  }`}>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="flex items-center gap-1">
                        <Crown className="w-3 h-3" /> 사역 동참자
                      </span>
                      <span className="text-[10px] font-normal text-slate-500">월 10,000원~</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedComparison).map(([category, items], catIdx) => (
                  <React.Fragment key={category}>
                    <tr>
                      <td colSpan={3} className={`px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white/[0.02] ${
                        catIdx > 0 ? 'border-t border-white/[0.04]' : ''
                      }`}>
                        {category}
                      </td>
                    </tr>
                    {items.map((item, idx) => (
                      <tr
                        key={`${category}-${idx}`}
                        className={`border-t border-white/[0.04] ${
                          idx === items.length - 1 && catIdx === Object.keys(groupedComparison).length - 1
                            ? ''
                            : ''
                        }`}
                      >
                        <td className="px-5 py-3">
                          <p className="text-[13px] text-slate-200 font-medium">{item.feature}</p>
                          {item.note && <p className="text-[10px] text-slate-500 mt-0.5">{item.note}</p>}
                        </td>
                        <td className={`px-4 py-3 text-center ${
                          user && isSupporter === false ? 'bg-indigo-500/[0.05]' : ''
                        }`}>
                          <ComparisonCell value={item.general} tier="general" />
                        </td>
                        <td className={`px-4 py-3 text-center ${
                          user && isSupporter === true ? 'bg-amber-500/[0.05]' : ''
                        }`}>
                          <ComparisonCell value={item.supporter} tier="supporter" />
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* 모바일 카드 뷰 */}
          <div className="sm:hidden space-y-4">
            {Object.entries(groupedComparison).map(([category, items]) => (
              <div key={category}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 px-1">
                  {category}
                </p>
                <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.04]">
                  {items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-slate-200 font-medium">{item.feature}</p>
                        {item.note && <p className="text-[10px] text-slate-500 mt-0.5">{item.note}</p>}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex flex-col items-center gap-0.5 min-w-[50px]">
                          <span className="text-[9px] text-slate-500">일반</span>
                          <ComparisonCell value={item.general} tier="general" />
                        </div>
                        <div className="flex flex-col items-center gap-0.5 min-w-[50px]">
                          <span className="text-[9px] text-amber-400">동참</span>
                          <ComparisonCell value={item.supporter} tier="supporter" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-500 italic mt-4 text-center">
            * 모든 기능은 사전 고지 없이 변경될 수 있습니다.
          </p>
        </div>

        {/* 운영 투명성 */}
        <div className="rounded-3xl bg-white/[0.04] border border-white/[0.06] p-6 sm:p-8 mb-6">
          <h2 className="text-[16px] font-bold text-white mb-5 flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-rose-400" />
            운영 비용 투명 공개
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {costData.map((item, idx) => {
              const Icon = item.icon
              return (
                <div key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <p className="text-[12px] text-slate-400">{item.label}</p>
                    <p className="text-[17px] font-bold text-white">{item.amount}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-[13px] text-slate-500 italic">
            * 후원금은 전액 AI API 및 서버 인프라 비용으로 사용됩니다.
          </p>
        </div>



        {/* 혜택 */}
        <div className="rounded-3xl bg-white/[0.04] border border-white/[0.06] p-6 sm:p-8 mb-6">
          <h2 className="text-[16px] font-bold text-white mb-5 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-400" />
            사역 동참자 혜택
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {BENEFITS.map((b, i) => {
              const Icon = b.icon
              return (
                <div
                  key={i}
                  className="relative group p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${b.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-[14px] font-bold text-white mb-1.5">{b.title}</h4>
                  <p className="text-[12px] text-slate-400 leading-relaxed">{b.desc}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* 후원 방법 */}
        <div className="rounded-3xl bg-white/[0.04] border border-white/[0.06] p-6 sm:p-8 mb-6">
          <h2 className="text-[16px] font-bold text-white mb-6">후원 방법</h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0 border border-rose-500/20">
                <span className="text-[13px] font-bold text-rose-400">1</span>
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-slate-200 mb-2">아래 계좌로 후원금을 보내주세요</p>
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 sm:p-5">
                  <p className="text-[11px] font-semibold text-slate-500 mb-1">💰 계좌번호</p>
                  <p className="text-[22px] font-extrabold text-white tracking-tight select-all">농협 351-1078-3343-33</p>
                  <p className="text-[13px] text-slate-400 mt-1">예금주: 전정우(벙커)</p>
                  <div className="mt-3 pt-3 border-t border-white/[0.06]">
                    <p className="text-[13px] text-slate-400">
                      금액: <span className="font-semibold text-slate-200">월 10,000원</span>부터 자유롭게 설정
                    </p>
                    <p className="text-[13px] text-slate-500 mt-0.5">추천: 30,000원 (하루 1,000원)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0 border border-rose-500/20">
                <span className="text-[13px] font-bold text-rose-400">2</span>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-slate-200 mb-1">후원 후, 아래 버튼으로 알려주세요</p>
                <p className="text-[13px] text-slate-500 mb-4">확인 즉시 활성화해드립니다.</p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://open.kakao.com/o/gqUit5zi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FEE500] text-[#3C1E1E] font-bold text-[13px] hover:brightness-95 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    카카오톡으로 알리기
                  </a>
                  <a
                    href="mailto:lecdong@gmail.com?subject=후원완료&body=이름%3A%0A이메일%3A%0A금액%3A"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] text-slate-300 font-bold text-[13px] hover:bg-white/[0.1] transition-all border border-white/[0.06]"
                  >
                    <Mail className="w-4 h-4" />
                    이메일로 알리기
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="rounded-3xl bg-white/[0.04] border border-white/[0.06] p-6 sm:p-8 mb-8">
          <h2 className="text-[16px] font-bold text-white mb-5">자주 묻는 질문</h2>
          <div className="space-y-4">
            {FAQ.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <p className="text-[14px] font-semibold text-slate-200 mb-1.5">{item.q}</p>
                <p className="text-[13px] text-slate-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href={user ? '/dashboard' : '/login?redirect=/support'}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-slate-300 font-bold text-[14px] hover:bg-white/[0.1] hover:text-white transition-all"
          >
            {user ? '대시보드로 돌아가기' : '로그인하고 시작하기'}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
