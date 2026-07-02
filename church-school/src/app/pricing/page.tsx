'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Check, Star, Zap, Shield, HelpCircle, CheckCircle2, 
  ArrowRight, ShieldAlert, Award, Building, Landmark, Lock, HelpCircle as HelpIcon
} from 'lucide-react';

const PLANS = [
  {
    id: 'free',
    name: '무료 체험 플랜',
    price: '₩0',
    period: '영구 무료',
    targetAudience: '사역을 처음 구상하거나 가볍게 체험해보고 싶은 신임 사역자',
    description: '기본적인 기능과 일부 무료 서식을 부담 없이 체험할 수 있는 요금제입니다.',
    icon: Shield,
    iconColor: 'text-navy-400',
    borderColor: 'border-warm-200',
    features: [
      '일부 무료 자료만 열람 & 다운로드',
      '공지문 작성기 월 3회 체험 한도',
      '작성한 공지문 보관함 저장 불가',
      '최근 본 자료 트래킹 미지원',
    ],
    ctaText: '무료로 시작하기',
    popular: false,
  },
  {
    id: 'premium',
    name: '프리미엄 월 구독',
    price: '₩9,900',
    period: '매월 정기결제',
    targetAudience: '교회학교의 모든 서식과 소통 도구를 무제한으로 사용하고 싶은 부서 담당자',
    description: '가장 합리적인 비용으로 사역 행정을 완전히 자동화하고 모든 콘텐츠를 무제한으로 활용하는 패키지입니다.',
    icon: Zap,
    iconColor: 'text-orange-500',
    borderColor: 'border-mint-400 shadow-md ring-2 ring-mint-400/20',
    features: [
      '전체 프리미엄 자료 무제한 열람 & 다운로드',
      '공지문 작성기 AI 무제한 이용',
      '내 보관함 영구 저장 및 즐겨찾기 지원',
      '매월 추가되는 신규 콘텐츠 즉시 제공',
      '1:1 실무 서식 제작 우선 요청권 제공',
    ],
    ctaText: '구독 시작하기',
    popular: true, // Emphasized as recommended
  },
  {
    id: 'single',
    name: '자료 단건 구매',
    price: '자료별 상이',
    period: '영구 소장',
    targetAudience: '구독 부담 없이 절기별 행사나 특정 교육 자료만 쏙쏙 골라 사용하고 싶으신 분',
    description: '개별 단품 패키지 상품을 일시불로 구매하여 제한 없이 영구적으로 보관할 수 있습니다.',
    icon: Star,
    iconColor: 'text-mint-600',
    borderColor: 'border-warm-200',
    features: [
      '필요한 유료 패키지 자료만 개별 결제',
      '공지문 작성기 일일 10회 권한 부여',
      '구매한 자료의 업데이트 평생 제공',
      '인쇄용 PPT 원본 서식 영구 소장',
    ],
    ctaText: '자료 보러가기',
    popular: false,
  },
];

const COMPARISON_ROWS = [
  {
    feature: '자료 접근 범위',
    free: '일부 무료 자료만 가능',
    single: '구매한 자료에 한해 영구 소장',
    premium: '전체 유료 자료 무제한 열람',
  },
  {
    feature: '공지문 작성기 권한',
    free: '월 최대 3회 체험 제공',
    single: '구매자 대상 일일 10회 완화',
    premium: 'AI 무제한 자동 작성',
  },
  {
    feature: '보관함 저장 기능',
    free: '지원 안 함 (단순 복사만 가능)',
    single: '구매한 자료 목록만 아카이빙',
    premium: '공지문/즐겨찾기 무제한 보관',
  },
  {
    feature: '신규 업데이트 자료',
    free: '받아볼 수 없음',
    single: '구매 자료의 패치만 제공',
    premium: '매월 신규 자료 즉시 무료 다운',
  },
  {
    feature: '다운로드/구매 방식',
    free: '일부 무료 파일만 다운',
    single: '원하는 자료별 단건 간편 결제',
    premium: '구독 기간 내 모든 파일 프리패스',
  },
];

const FAQS = [
  {
    q: '결제한 단건 자료는 언제까지 다운로드할 수 있나요?',
    a: '개별 단건 결제로 소장하신 자료나 구독 기간 내에 다운로드하여 마이페이지 보관함에 보관해 둔 자료는 서비스 해지 여부와 상관없이 평생 동안 안전하게 다시 다운로드받으실 수 있습니다.',
  },
  {
    q: '정기구독 해지는 언제든지 가능한가요?',
    a: '네, 물론입니다. 마이페이지의 계정 관리 탭에서 언제든지 수수료나 별도의 약정 기간 없이 1클릭 해지가 가능합니다. 해지하셔도 남은 구독 기간까지는 프리미엄 권한이 정상 유지됩니다.',
  },
  {
    q: '자료를 가공하여 우리 교회학교 배포물로 써도 저작권에 문제가 없나요?',
    a: '네, 저희가 제공하는 모든 서식과 안내 템플릿은 교회 내부 인쇄 배포 및 부서 카카오톡 소통 채널 전송용 라이선스가 모두 기본 포함되어 있어 저작권 염려 없이 안전하게 변경하여 쓰셔도 됩니다. (단, 타인에게 템플릿 자체를 유료로 재판매하는 것은 금지됩니다.)',
  },
];

import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import LoginModal from '@/components/LoginModal';

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [paySuccess, setPaySuccess] = useState(false);
  const [selectedPlanName, setSelectedPlanName] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { isLoggedIn, user, isPremium, refreshUser } = useAuth();

  const handleSubscribe = async (planId: string, planName: string) => {
    if (planId === 'free') {
      if (!isLoggedIn) {
        setShowLoginModal(true);
      } else {
        alert('이미 무료 플랜으로 이용 중이십니다! 자료실이나 공지문 작성기를 마음껏 시작해 보세요.');
        window.location.href = '/resources';
      }
      return;
    }

    if (planId === 'single') {
      window.location.href = '/resources';
      return;
    }

    // 로그인하지 않은 사용자는 프리미엄 정기 구독 결제 불가
    if (!isLoggedIn || !user) {
      alert('정기 구독을 신청하시려면 먼저 로그인이 필요합니다.');
      setShowLoginModal(true);
      return;
    }

    // Premium Subscription simulator
    const confirmPay = confirm(
      `'${planName}' 혜택을 이용하기 위해 가상 결제창을 호출합니다.\n(실제 카드 청구 없이 즉시 프리미엄 'subscriber' 멤버십 승격이 진행됩니다)`
    );

    if (confirmPay) {
      try {
        const { error } = await supabase
          .from('users')
          .update({ plan_type: 'subscriber' })
          .eq('id', user.id);

        if (error) throw error;

        // Auth metadata도 업데이트 (필요시)
        await supabase.auth.updateUser({
          data: { plan_type: 'subscriber' }
        });

        await refreshUser();
        setSelectedPlanName(planName);
        setPaySuccess(true);
        
        setTimeout(() => {
          setPaySuccess(false);
          window.location.href = '/mypage';
        }, 2000);
      } catch (err: any) {
        console.error('구독 결제 승격 중 오류 발생:', err);
        alert('멤버십 등급 변경 중 오류가 발생했습니다: ' + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-warm-50 py-12 md:py-20 text-navy-950 font-sans">
      <div className="container-custom max-w-5xl space-y-16">
        
        {/* Header Block */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint-50 text-mint-700 text-xs font-bold border border-mint-200">
            <Award className="w-3.5 h-3.5" />
            현명한 사역 행정의 시작
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-navy-950 leading-tight tracking-tight">
            부서 상황에 알맞은<br />합리적인 요금을 선택하세요
          </h1>
          <p className="text-xs md:text-sm text-navy-500 leading-relaxed">
            무료 체험 플랜부터 단품 영구 소장, 무제한 AI 행정 작성이 가능한 프리미엄 구독까지 다양한 방식을 제안합니다. 과도한 약정이나 위약금 없이 유연하게 해지할 수 있습니다.
          </p>

          {isPremium && (
            <div className="inline-block bg-mint-50 text-mint-800 text-xs font-bold px-4 py-2 rounded-2xl border border-mint-200 mt-2">
              🎉 성도님은 현재 <strong>프리미엄 요금제 구독 중</strong>입니다. 무제한 혜택을 누려보세요.
            </div>
          )}
        </div>

        {/* Action success alert */}
        {paySuccess && (
          <div className="max-w-md mx-auto bg-mint-50 border border-mint-200 rounded-3xl p-6 text-center space-y-3 animate-pulse shadow-lg">
            <CheckCircle2 className="w-10 h-10 text-mint-600 mx-auto" />
            <h3 className="text-base font-bold text-mint-900">'{selectedPlanName}' 가상 결제 및 승인 완료!</h3>
            <p className="text-xs text-mint-600 leading-relaxed">
              성공적으로 결제 처리되었습니다. 회원 계정이 프리미엄 등급으로 연동 승격되었습니다. 마이페이지로 즉시 리다이렉트합니다.
            </p>
          </div>
        )}

        {/* 3-Column Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`bg-white rounded-3xl p-6 md:p-8 flex flex-col justify-between relative border-2 ${plan.borderColor} transition-transform hover:-translate-y-1 duration-200 ${
                  plan.popular ? 'shadow-lg ring-4 ring-mint-400/10' : 'shadow-sm'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-mint-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-md tracking-wider uppercase">
                    추천 요금제
                  </span>
                )}

                <div className="space-y-5">
                  {/* Plan Meta */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-warm-50 flex items-center justify-center border border-warm-100 shrink-0">
                      <Icon className={`w-5 h-5 ${plan.iconColor}`} />
                    </div>
                    <div>
                      <span className="text-[10px] text-navy-400 font-bold block">FOR WHOM</span>
                      <h3 className="text-sm md:text-base font-extrabold text-navy-950 leading-none">{plan.name}</h3>
                    </div>
                  </div>

                  <div>
                    <span className="text-3xl md:text-4xl font-black text-navy-950">{plan.price}</span>
                    <span className="text-xs text-navy-400 ml-1.5">/ {plan.period}</span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-mint-600 bg-mint-50/50 p-2 rounded-xl border border-mint-100/50">
                      🎯 권장 대상: {plan.targetAudience}
                    </p>
                    <p className="text-[11px] text-navy-500 leading-relaxed pt-1">
                      {plan.description}
                    </p>
                  </div>

                  <hr className="border-warm-100" />

                  {/* Bullet points */}
                  <ul className="space-y-3 pt-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-navy-700 leading-relaxed">
                        <Check className="w-4 h-4 text-mint-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plan Call-to-action button */}
                <button
                  onClick={() => handleSubscribe(plan.id, plan.name)}
                  className={`w-full text-center py-4 rounded-2xl text-xs font-bold transition-all mt-8 ${
                    plan.popular
                      ? 'bg-mint-500 text-white hover:bg-mint-600 shadow-md shadow-mint-500/10'
                      : 'bg-navy-900 text-white hover:bg-navy-850'
                  }`}
                >
                  {plan.ctaText}
                </button>
              </div>
            );
          })}
        </div>

        {/* Enterprise Coming-Soon Banner */}
        <div className="bg-gradient-to-r from-navy-950 to-navy-900 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
          <div className="flex gap-4 items-center text-center md:text-left">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 mx-auto">
              <Building className="w-6 h-6 text-mint-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2 justify-center md:justify-start">
                교회 전체 플랜 (단체 도입형)
                <span className="text-[9px] bg-mint-500/20 text-mint-300 border border-mint-500/30 px-2 py-0.5 rounded-full font-bold">준비 중</span>
              </h3>
              <p className="text-xs text-navy-300 mt-1">
                담임 목사님부터 영아부, 초등부, 중고등부까지 교회 전체 부서의 서식 라이선스를 단체 가격으로 묶어 구독하는 멀티 계정 플랜입니다.
              </p>
            </div>
          </div>
          <button 
            disabled 
            className="btn-secondary btn-sm bg-white/10 border-white/20 text-white/50 cursor-not-allowed whitespace-nowrap"
          >
            단체 제휴 문의
          </button>
        </div>

        {/* Feature Matrix Table */}
        <div className="space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="text-lg md:text-xl font-bold text-navy-950">한눈에 비교하는 플랜 차이점</h2>
            <p className="text-xs text-navy-400">나에게 꼭 필요한 옵션을 꼼꼼하게 따져보고 합리적인 소비를 계획하세요.</p>
          </div>

          <div className="bg-white rounded-3xl border border-warm-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="bg-warm-50 border-b border-warm-100 text-navy-600 font-bold">
                    <th className="p-4 md:p-5">비교 기능</th>
                    <th className="p-4 md:p-5">무료 체험</th>
                    <th className="p-4 md:p-5">단건 구매</th>
                    <th className="p-4 md:p-5 bg-mint-50/30 text-mint-900">프리미엄 구독</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-100 text-navy-800 font-medium">
                  {COMPARISON_ROWS.map((row, index) => (
                    <tr key={index} className="hover:bg-warm-50/30">
                      <td className="p-4 md:p-5 font-bold text-navy-950">{row.feature}</td>
                      <td className="p-4 md:p-5 text-navy-500">{row.free}</td>
                      <td className="p-4 md:p-5 text-navy-700">{row.single}</td>
                      <td className="p-4 md:p-5 bg-mint-50/20 text-mint-800 font-semibold">{row.premium}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-card border border-warm-100 max-w-3xl mx-auto space-y-6">
          <h2 className="text-base md:text-lg font-bold text-navy-950 text-center flex items-center justify-center gap-2 border-b border-warm-100 pb-4">
            <HelpIcon className="w-5 h-5 text-mint-500" />
            요금 관련 자주 묻는 질문 (FAQ)
          </h2>

          <div className="divide-y divide-warm-100">
            {FAQS.map((faq, i) => (
              <div key={i} className="py-4 first:pt-0 last:pb-0">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 text-left font-bold text-xs md:text-sm text-navy-850 hover:text-navy-950 transition-colors"
                >
                  <span>Q. {faq.q}</span>
                  <span className="text-navy-400 font-bold text-base">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <p className="mt-2.5 text-xs text-navy-500 leading-relaxed bg-warm-50 p-4 rounded-2xl border border-warm-100">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
