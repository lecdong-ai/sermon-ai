'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag, ArrowRight, Coffee, Apple, Sparkles,
  Store, Heart, Star, HandHeart, Copy, Check,
  ChevronDown, ChevronUp, HelpCircle, CheckCircle2,
} from 'lucide-react';

const FAQS = [
  {
    q: '쇼핑만 해도 정말 후원이 되나요?',
    a: '네, 그렇습니다! 파트너 스토어(거창한벙커, 프레시 네이쳐)에서 상품을 구매하시면 판매 수익금의 일부가 교회학교 서버 인프라 유지비 및 AI 엔진 연동비로 자동 환원됩니다. 별도의 기부 절차 없이 일상적인 쇼핑만으로도 사역에 동참하실 수 있습니다.',
  },
  {
    q: '교회 행사에 필요한 상품이 여기 없으면 어떡하나요?',
    a: '파트너 스토어 내에서 원하시는 상품이 없다면 언제든지 건의해 주세요. 또한 직접 계좌 후원을 통해 사역을 지지해 주실 수도 있습니다. 두 가지 방법 모두 저희에게 큰 힘이 됩니다.',
  },
  {
    q: '직접 계좌 후원도 가능한가요?',
    a: '네! 마음이 닿으시는 대로 1,000원부터 자유롭게 자발적 후원이 가능합니다. 보내주신 소중한 후원금은 서버 운용, AI API 비용, 신규 사역 콘텐츠 개발에 투명하게 사용됩니다.',
  },
  {
    q: '상품 구매 시 배송은 어떻게 되나요?',
    a: '각 파트너 스토어(네이버 스마트스토어)에서 직접 배송 및 관리합니다. 구매 및 배송 관련 문의는 해당 스토어의 고객센터를 통해 문의해 주세요.',
  },
];

export default function ShopPage() {
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText('3333-07-0197297');
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2500);
    } catch {
      alert('계좌번호: 카카오뱅크 3333-07-0197297');
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-navy-950 font-sans selection:bg-rose-100 selection:text-rose-900">

      {/* ════════════════════════════════════════════
          1. HERO
         ════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-16 pb-16 md:pt-24 md:pb-20 border-b border-warm-200/60 bg-gradient-to-b from-white via-warm-50/50 to-[#fbfaf7]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-amber-100/40 via-rose-100/30 to-mint-100/40 blur-3xl -z-10 opacity-70 pointer-events-none" />

        <div className="container-custom max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200/70 text-amber-700 text-xs md:text-sm font-bold shadow-2xs animate-fade-in">
            <ShoppingBag className="w-4 h-4 text-amber-600" />
            <span>일상의 쇼핑이 사역이 되는 곳</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-navy-950 leading-[1.15] tracking-tight">
            쇼핑이 <span className="text-mint-600 underline decoration-mint-300 decoration-wavy decoration-2">선한 영향력</span>으로,<br />
            당신의 소비가 <span className="bg-gradient-to-r from-amber-600 via-rose-600 to-amber-500 bg-clip-text text-transparent">따뜻한 후원</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-navy-600 max-w-2xl mx-auto leading-relaxed font-medium">
            특별한 기부 없이, 평소처럼 쇼핑하고 자연스럽게 교회학교 사역을 후원하세요.<br className="hidden sm:inline" />
            당신의 선택이 다음 세대 신앙교육의 기반이 됩니다.
          </p>

          <div className="pt-4 flex flex-wrap justify-center items-center gap-3">
            <a
              href="#stores"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-extrabold px-7 py-3.5 rounded-2xl text-sm md:text-base shadow-md shadow-amber-500/20 transition-all"
            >
              <Store className="w-4 h-4" />
              파트너 스토어 구경하기
            </a>
            <button
              onClick={handleCopyAccount}
              className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white font-extrabold px-7 py-3.5 rounded-2xl text-sm md:text-base shadow-md shadow-rose-500/20 transition-all"
            >
              <Heart className="w-4 h-4 fill-white" />
              {copiedAccount ? '계좌번호 복사 완료! ❤️' : '자발적 후원하기 (계좌)'}
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          2. SHOP = DONATION EXPLAINER CARD
         ════════════════════════════════════════════ */}
      <section className="py-16 md:py-20">
        <div className="container-custom max-w-4xl space-y-12">

          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              SHOP & DONATE
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950">
              두 가지 방법으로 함께할 수 있습니다
            </h2>
            <p className="text-xs sm:text-sm text-navy-500">
              당신의 선택이 다음 세대를 살리는 선순환이 됩니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Method 1: Shopping */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-white text-xs font-black px-5 py-2 rounded-bl-2xl shadow-xs tracking-wider">
                SHOPPING
              </div>
              <div className="space-y-4 pt-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-navy-950">파트너 스토어 이용</h3>
                <p className="text-xs sm:text-sm text-navy-600 leading-relaxed">
                  교회 행사, 수련회, 선생님 감사 선물, 다과를 파트너 스토어에서 구매하세요.<br />
                  구매금액의 일부가 서비스 운영비로 자동 환원됩니다.
                </p>
                <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-100 text-left">
                  <p className="text-xs font-bold text-amber-800 mb-1 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    추가 비용 없음
                  </p>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    파트너 스토어 상품 가격은 일반 소비자가와 동일합니다. 별도의 기부금이 추가되지 않아요.
                  </p>
                </div>
              </div>
            </div>

            {/* Method 2: Direct Donation */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-rose-200 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-rose-500 to-rose-600 text-white text-xs font-black px-5 py-2 rounded-bl-2xl shadow-xs tracking-wider">
                DONATION
              </div>
              <div className="space-y-4 pt-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Heart className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-navy-950">자발적 계좌 후원</h3>
                <p className="text-xs sm:text-sm text-navy-600 leading-relaxed">
                  마음이 감동하시는 대로 1,000원부터 자유롭게 후원하실 수 있습니다.<br />
                  정해진 금액이나 부담스러운 정기 결제는 없어요.
                </p>
                <div className="bg-rose-50/70 rounded-2xl p-4 border border-rose-100 text-left">
                  <p className="text-xs font-bold text-rose-800 mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />
                    100% 투명 사용
                  </p>
                  <p className="text-[11px] text-rose-700 leading-relaxed">
                    서버 인프라, AI API 연동비, 신규 콘텐츠 개발에만 사용됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════
          3. PARTNER STORES
         ════════════════════════════════════════════ */}
      <section id="stores" className="py-16 md:py-24 bg-warm-100/70 border-y border-warm-200/60">
        <div className="container-custom max-w-6xl space-y-12">

          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
              <Store className="w-4 h-4 text-amber-700" />
              <span>PARTNER STORE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-navy-950">
              쇼핑이 곧 <span className="text-amber-600">후원</span>입니다
            </h2>
            <p className="text-xs sm:text-sm text-navy-600 leading-relaxed max-w-xl mx-auto">
              파트너 스토어에서의 구매가 서비스 운영비로 환원됩니다.<br className="hidden sm:inline" />
              특별한 기부 없이, 일상적인 소비가 자연스럽게 후원이 됩니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* 벙커 목양 (homeggmi) */}
            <div className="bg-white rounded-2xl overflow-hidden border border-warm-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="aspect-[4/3] overflow-hidden bg-indigo-50">
                <img
                  src="/main.jpg"
                  alt="벙커 목양 굿노트 말씀 다이어리 & 디지털 플래너"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-900">벙커 목양</h3>
                    <p className="text-xs text-navy-600">굿노트 말씀 다이어리 & QT 플래너</p>
                  </div>
                </div>
                <p className="text-sm text-navy-700 leading-relaxed mb-4 flex-1">
                  말씀과 일상을 하나로 잇다. 17개월 올인원 하이퍼링크, 365 성경 통독, SOAP 묵상 서식 등 크리스천의 영적 루틴을 돕는 프리미엄 디지털 플래너 전문 숍.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {['굿노트 다이어리', '하이퍼링크 QT', '성경 통독 365', 'SOAP 묵상'].map((tag) => (
                    <span key={tag} className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <a
                  href="https://smartstore.naver.com/homeggmi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all mt-auto"
                >
                  <Store className="w-4 h-4" />
                  스토어 바로가기
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* 거창한벙커 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-warm-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="aspect-[4/3] overflow-hidden bg-amber-50">
                <img
                  src="/can.jpg"
                  alt="거창한벙커 수제 레터링 캔커피"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-900">거창한벙커</h3>
                    <p className="text-xs text-navy-600">레터링 수제캔커피</p>
                  </div>
                </div>
                <p className="text-sm text-navy-700 leading-relaxed mb-4 flex-1">
                  감사와 응원의 메시지를 레터링으로 담아 선물하는 수제 캔커피 스토어.
                  하나하나 수작업으로 제작되어 마음이 그대로 전해집니다.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {['교사 감사', '수련회 기념', '행사 선물', '절기 선물'].map((tag) => (
                    <span key={tag} className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <a
                  href="https://smartstore.naver.com/geochangbunker/products/4551068056"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all mt-auto"
                >
                  <Store className="w-4 h-4" />
                  스토어 바로가기
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* 프레시 네이쳐 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-warm-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="aspect-[4/3] overflow-hidden bg-green-50">
                <img
                  src="/fluit.png"
                  alt="프레시 네이쳐 신선한 과일"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                    <Apple className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-900">프레시 네이쳐</h3>
                    <p className="text-xs text-navy-600">신선한 과일 전문</p>
                  </div>
                </div>
                <p className="text-sm text-navy-700 leading-relaxed mb-4 flex-1">
                  국내산 제철 과일부터 엄선된 수입과일까지 모든 과일을 합리적인 가격에 만나보세요.
                  교회 모임과 행사를 신선한 과일로 풍성하게 채워보세요.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {['친교 간식', '행사 다과', '선물용', '수련회'].map((tag) => (
                    <span key={tag} className="text-[11px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <a
                  href="https://smartstore.naver.com/roaster"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all mt-auto"
                >
                  <Store className="w-4 h-4" />
                  스토어 바로가기
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>

          <div className="bg-white/80 rounded-2xl p-4 border border-warm-200 text-center max-w-xl mx-auto">
            <p className="text-xs text-navy-600 flex items-center justify-center gap-1.5 font-semibold">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              파트너 스토어 구매 건은 별도의 기부금 수수료 없이 안전하게 지원됩니다.
            </p>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════
          4. DIRECT DONATION
         ════════════════════════════════════════════ */}
      <section id="donate" className="py-16 md:py-24 bg-white">
        <div className="container-custom max-w-3xl text-center space-y-10">

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
              <HandHeart className="w-4 h-4 text-rose-500" />
              <span>DIRECT DONATION</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-navy-950">
              직접 따뜻한 마음을 <span className="text-rose-600">후원하기</span>
            </h2>
            <p className="text-xs sm:text-sm text-navy-600 max-w-lg mx-auto leading-relaxed">
              정해진 후원 금액이나 부담스러운 정기 결제는 없습니다.<br />
              마음이 감동하시는 대로 자유롭게 응원해 주세요.
            </p>
          </div>

          <div className="bg-gradient-to-b from-warm-50 to-rose-50/30 rounded-3xl p-8 sm:p-12 border border-rose-200/70 shadow-lg relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-white text-rose-500 shadow-md flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <Heart className="w-8 h-8 fill-rose-500" />
            </div>
            <p className="text-xs font-bold text-navy-400 uppercase tracking-widest">후원 계좌 (카카오뱅크)</p>
            <div className="text-3xl sm:text-5xl font-black text-navy-950 tracking-wider my-4 font-mono">
              3333-07-0197297
            </div>

            <button
              onClick={handleCopyAccount}
              className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white font-extrabold px-8 py-3.5 rounded-2xl text-sm sm:text-base shadow-md shadow-rose-500/20 transition-all"
            >
              {copiedAccount ? (
                <><Check className="w-4 h-4 stroke-[3]" />계좌번호가 복사되었습니다!</>
              ) : (
                <><Copy className="w-4 h-4" />계좌번호 1-초 복사하기</>
              )}
            </button>

            {copiedAccount && (
              <p className="text-xs text-rose-600 font-bold mt-3 animate-pulse">
                클립보드에 복사되었습니다. 카카오뱅크 또는 보유하신 은행 앱에서 송금해 주세요.
              </p>
            )}

            <div className="mt-8 pt-6 border-t border-rose-200/60 text-xs text-navy-500 leading-relaxed max-w-md mx-auto">
              소중한 후원금은 <strong>서버 유지 인프라 비용</strong>, <strong>AI 공지문 생성 API 연동비</strong>, <strong>신규 사역 콘텐츠 제작</strong>을 위해 100% 투명하게 사용됩니다.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-warm-50 rounded-2xl p-5 border border-warm-200 text-left space-y-1">
              <p className="text-sm font-bold text-navy-950 flex items-center gap-1.5"><span>🛍️</span> 쇼핑으로 후원</p>
              <p className="text-xs text-navy-500 leading-relaxed">평소처럼 쇼핑하고, 수익금이 자동으로 환원됩니다.</p>
            </div>
            <div className="bg-warm-50 rounded-2xl p-5 border border-warm-200 text-left space-y-1">
              <p className="text-sm font-bold text-navy-950 flex items-center gap-1.5"><span>💝</span> 직접 후원</p>
              <p className="text-xs text-navy-500 leading-relaxed">1,000원부터 자유롭게 마음을 전하실 수 있습니다.</p>
            </div>
            <div className="bg-warm-50 rounded-2xl p-5 border border-warm-200 text-left space-y-1">
              <p className="text-sm font-bold text-navy-950 flex items-center gap-1.5"><span>🤝</span> 함께하는 사역</p>
              <p className="text-xs text-navy-500 leading-relaxed">당신의 선택이 다음 세대 신앙교육을 지킵니다.</p>
            </div>
          </div>

          <p className="text-xs text-navy-400 font-medium">
            정기 후원 및 기업 제휴 문의: <a href="mailto:support@churchschool.kr" className="underline hover:text-navy-700">support@churchschool.kr</a>
          </p>

        </div>
      </section>

      {/* ════════════════════════════════════════════
          5. FAQ
         ════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-warm-100/50 border-t border-warm-200/60">
        <div className="container-custom max-w-3xl space-y-8">

          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 flex items-center justify-center gap-2">
              <HelpCircle className="w-6 h-6 text-mint-600" />
              자주 묻는 질문 (FAQ)
            </h2>
            <p className="text-xs sm:text-sm text-navy-500">
              쇼핑과 후원에 관한 궁금증을 빠르게 해결해 드립니다.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-warm-200 space-y-3">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="border-b border-warm-100 last:border-0 pb-3 last:pb-0">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 text-left font-bold text-sm sm:text-base text-navy-900 py-3 hover:text-mint-700 transition-colors"
                  >
                    <span>Q. {faq.q}</span>
                    <span className="p-1 rounded-lg bg-warm-50 text-navy-400 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4 text-mint-600" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="mt-1 mb-3 text-xs sm:text-sm text-navy-600 leading-relaxed bg-warm-50/70 p-4 rounded-2xl border border-warm-100 font-sans">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════
          6. BOTTOM CTA
         ════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-navy-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-navy-800 via-navy-950 to-navy-950 opacity-80" />

        <div className="container-custom max-w-3xl relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <ShoppingBag className="w-3.5 h-3.5" />
            오늘 시작하세요
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            당신의 오늘 쇼핑이<br />
            <span className="text-amber-400">다음 세대를 살립니다</span>
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-navy-300 max-w-lg mx-auto leading-relaxed">
            지금 바로 파트너 스토어를 방문하거나, 마음을 전해 주세요.<br />
            모든 교회학교 사역자는 계속 무료로 서비스를 이용할 수 있습니다.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <a
              href="#stores"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-7 py-3.5 rounded-2xl text-sm sm:text-base shadow-lg shadow-amber-500/20 transition-all"
            >
              <Store className="w-4 h-4" />
              파트너 스토어 가기
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/school/"
              className="inline-flex items-center gap-2 bg-navy-800 hover:bg-navy-700 text-white font-bold px-6 py-3.5 rounded-2xl text-sm border border-navy-700 transition-all"
            >
              교회학교 서비스 이용하기
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
