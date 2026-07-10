'use client';

import Link from 'next/link';
import {
  Check, Zap, Shield, HelpCircle, CheckCircle2,
  ArrowRight, Award, Sparkles,
} from 'lucide-react';
import { useState } from 'react';

const FEATURES = [
  '모든 프리미엄 자료 무제한 열람 & 다운로드',
  '공지문 작성기 AI 무제한 이용',
  '보관함 영구 저장 및 즐겨찾기 지원',
  '매월 추가되는 신규 콘텐츠 즉시 제공',
  'PPT 스튜디오 무제한 사용',
  '행사 관리 시스템 무료 이용',
  '1:1 실무 서식 제작 요청권 제공',
];

const FAQS = [
  {
    q: '정말 모든 기능을 무료로 사용할 수 있나요?',
    a: '네, 교회학교 솔루션의 모든 기능은 영구 무료입니다. 별도의 결제나 구독 없이 모든 프리미엄 자료, AI 공지문 작성, PPT 스튜디오, 행사 관리 시스템을 제한 없이 이용하실 수 있습니다.',
  },
  {
    q: '앞으로 유료로 전환될 예정이 있나요?',
    a: '현재로서는 유료 전환 계획이 없습니다. 교회학교 사역을 지원하는 것이 저희의 사명이며, 앞으로도 무료 서비스를 지속할 예정입니다.',
  },
  {
    q: '자료를 가공하여 우리 교회학교 배포물로 써도 저작권에 문제가 없나요?',
    a: '네, 저희가 제공하는 모든 서식과 템플릿은 교회 내부 인쇄 배포 및 부서 카카오톡 소통 채널 전송용 라이선스가 모두 기본 포함되어 있어 저작권 염려 없이 안전하게 변경하여 쓰셔도 됩니다. (단, 타인에게 템플릿 자체를 유료로 재판매하는 것은 금지됩니다.)',
  },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-warm-50 py-12 md:py-20 text-navy-950 font-sans">
      <div className="container-custom max-w-4xl space-y-16">

        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint-50 text-mint-700 text-xs font-bold border border-mint-200">
            <Sparkles className="w-3.5 h-3.5" />
            전면 무료 — 감사합니다
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-navy-950 leading-tight tracking-tight">
            모든 기능을<br />무료로 이용하세요
          </h1>
          <p className="text-sm md:text-base text-navy-500 leading-relaxed max-w-lg mx-auto">
            교회학교 솔루션은 모든 기능을 영구 무료로 제공합니다.
            별도의 결제나 구독 없이 모든 서비스를 제한 없이 사용하실 수 있습니다.
          </p>
        </div>

        {/* Free Card */}
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-3xl p-8 border-2 border-mint-300 shadow-lg ring-4 ring-mint-400/10 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-mint-50 flex items-center justify-center mx-auto border border-mint-200">
              <Zap className="w-8 h-8 text-mint-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-navy-950">무료 플랜</h2>
              <div className="mt-2">
                <span className="text-4xl font-black text-navy-950">₩0</span>
                <span className="text-sm text-navy-400 ml-1.5">/ 영구 무료</span>
              </div>
              <p className="text-sm text-navy-500 mt-2">모든 기능 제한 없이 이용 가능</p>
            </div>

            <hr className="border-warm-100" />

            <ul className="space-y-3 text-left">
              {FEATURES.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-navy-700 leading-relaxed">
                  <Check className="w-4 h-4 text-mint-500 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/school/"
              className="block w-full text-center py-4 rounded-2xl text-sm font-bold bg-mint-500 text-white hover:bg-mint-600 shadow-md shadow-mint-500/10 transition-all"
            >
              무료로 시작하기
            </Link>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-card border border-warm-100 max-w-3xl mx-auto space-y-6">
          <h2 className="text-base md:text-lg font-bold text-navy-950 text-center flex items-center justify-center gap-2 border-b border-warm-100 pb-4">
            <HelpCircle className="w-5 h-5 text-mint-500" />
            자주 묻는 질문 (FAQ)
          </h2>

          <div className="divide-y divide-warm-100">
            {FAQS.map((faq, i) => (
              <div key={i} className="py-4 first:pt-0 last:pb-0">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 text-left font-bold text-sm text-navy-800 hover:text-navy-950 transition-colors"
                >
                  <span>Q. {faq.q}</span>
                  <span className="text-navy-400 font-bold text-base">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <p className="mt-2.5 text-sm text-navy-500 leading-relaxed bg-warm-50 p-4 rounded-2xl border border-warm-100">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
