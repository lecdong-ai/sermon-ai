'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Heart, Store, Coffee, Apple, Sparkles,
  HandHeart, Copy, Check, ChevronDown, ChevronUp,
  ArrowRight, ShieldCheck, Zap, HelpCircle, Gift,
  CheckCircle2, Share2, Star
} from 'lucide-react';

const FEATURES = [
  '공지문 작성기 AI 4가지 시안 무제한 생성 & 실시간 편집',
  '교회학교 행사 관리 및 모바일 참가 신청서 링크 생성',
  '참가 신청자 관리, 출석 체크인 및 CSV 데이터 엑스포트',
  'PPT 스튜디오 무제한 사용 & 프레젠테이션 템플릿',
  '모든 사역 서식 & 디자인 템플릿 영구 무료 라이선스',
  '개인정보 수집 동의 & 사진/영상 촬영 동의 자동화',
  '생성 이력 보관함 저장 및 즐겨찾기 조건 콤보 기능',
];

const FAQS = [
  {
    q: '정말 모든 기능이 100% 영구 무료인가요?',
    a: '네, 그렇습니다! 교회학교 솔루션의 모든 기능(AI 공지문 작성, PPT 스튜디오, 행사 관리, 서식 다운로드 등)은 어떠한 숨겨진 비용이나 유료 구독 결제 없이 영구 무료로 이용하실 수 있습니다.',
  },
  {
    q: '스토어에서 구매하면 어떻게 후원이 되나요?',
    a: '저희 파트너 스토어(거창한벙커, 프레시 네이쳐)에서 교사 감사 선물이나 행사 다과를 구매하시면, 판매 수익금의 일부가 교회학교 서버 인프라 유지비 및 AI 엔진 연동비로 자동 환원됩니다. 별도의 기부금 부담 없이 일상적인 쇼핑으로 자연스럽게 사역을 후원하실 수 있습니다.',
  },
  {
    q: '직접 계좌 후원도 가능한가요?',
    a: '네! 마음이 닿으시는 대로 1,000원부터 자유롭게 자발적 후원이 가능합니다. 보내주신 소중한 후원금은 서버 운용, AI API 비용, 신규 사역 콘텐츠 개발에 투명하게 사용됩니다.',
  },
  {
    q: '제공되는 서식과 문안을 수정해서 사용해도 저작권 문제가 없나요?',
    a: '네, 저희 솔루션에서 제공하는 모든 공지문, PPT, 행사이미지는 교회 내부 인쇄 배포, 부서 카카오톡 전송, 주보 수록용 라이선스가 기본 포함되어 있습니다. 안전하고 자유롭게 변경하여 사용하셔도 됩니다.',
  },
];

export default function PricingPage() {
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedCta, setCopiedCta] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleCopyAccount = async (setter: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText('3333-07-0197297');
      setter(true);
      setTimeout(() => setter(false), 2500);
    } catch {
      alert('계좌번호: 카카오뱅크 3333-07-0197297');
    }
  };

  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-navy-950 font-sans selection:bg-rose-100 selection:text-rose-900">

      {/* ════════════════════════════════════════════
          1. HERO SECTION
         ════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-16 pb-16 md:pt-24 md:pb-20 border-b border-warm-200/60 bg-gradient-to-b from-white via-warm-50/50 to-[#fbfaf7]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-rose-100/40 via-amber-100/30 to-mint-100/40 blur-3xl -z-10 opacity-70 pointer-events-none" />

        <div className="container-custom max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 border border-rose-200/70 text-rose-700 text-xs md:text-sm font-bold shadow-2xs animate-fade-in">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span>쇼핑과 후원이 만드는 다음 세대 선한 영향력</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-navy-950 leading-[1.15] tracking-tight">
            모든 기능 <span className="text-mint-600 underline decoration-mint-300 decoration-wavy decoration-2">100% 영구 무료</span>,<br />
            사역을 살리는 <span className="bg-gradient-to-r from-rose-600 via-amber-600 to-rose-500 bg-clip-text text-transparent">따뜻한 동행</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-navy-600 max-w-2xl mx-auto leading-relaxed font-medium">
            교회학교 목회자와 선생님들의 사역 부담을 줄여드리기 위해 모든 기능을 무료로 제공합니다.<br className="hidden sm:inline" />
            여러분의 따뜻한 파트너 스토어 이용과 자발적 후원이 이 사역을 지속시킵니다.
          </p>

          <div className="pt-4 flex flex-wrap justify-center items-center gap-3">
            <a
              href="#stores"
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-extrabold px-7 py-3.5 rounded-2xl text-sm md:text-base shadow-md shadow-amber-500/20 transition-all"
            >
              <Store className="w-4 h-4" />
              파트너 스토어 구경하기
            </a>
            <button
              onClick={() => handleCopyAccount(setCopiedAccount)}
              className="inline-flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white font-extrabold px-7 py-3.5 rounded-2xl text-sm md:text-base shadow-md shadow-rose-500/20 transition-all"
            >
              <Heart className="w-4 h-4 fill-white" />
              {copiedAccount ? '계좌번호 복사 완료! ❤️' : '자발적 후원하기 (계좌)'}
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          2. FREE PLAN HIGHLIGHT CARD
         ════════════════════════════════════════════ */}
      <section className="py-16 md:py-20">
        <div className="container-custom max-w-4xl space-y-12">
          
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint-50 text-mint-700 text-xs font-bold border border-mint-200">
              <Zap className="w-3.5 h-3.5 text-mint-600" />
              ALWAYS FREE PLAN
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950">
              구독료 걱정 없이 마음껏 사용하세요
            </h2>
            <p className="text-xs sm:text-sm text-navy-500">
              현장 사역에 꼭 필요한 7가지 핵심 기능을 제한 없이 영구 무료로 제공합니다.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-mint-300 shadow-xl ring-8 ring-mint-400/5 relative overflow-hidden">
            {/* Top Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-l from-mint-500 to-mint-600 text-white text-xs font-black px-6 py-2 rounded-bl-2xl shadow-xs tracking-wider">
              100% PERMANENT FREE
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Price Tag & Value */}
              <div className="md:col-span-5 text-center md:text-left space-y-4 border-b md:border-b-0 md:border-r border-warm-100 pb-6 md:pb-0 md:pr-6">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-warm-100 text-navy-700 text-xs font-bold">
                  <Gift className="w-3.5 h-3.5 text-rose-500" />
                  목회자 & 교사 전용 플랜
                </div>
                <div>
                  <div className="flex items-baseline justify-center md:justify-start gap-1">
                    <span className="text-5xl sm:text-6xl font-black text-navy-950 tracking-tight">₩0</span>
                    <span className="text-sm font-bold text-navy-400">/ 평생 무료</span>
                  </div>
                  <p className="text-xs text-mint-700 font-bold mt-1">별도의 카드 등록이나 기간 제한 없음</p>
                </div>

                <div className="bg-warm-50 p-4 rounded-2xl border border-warm-200 text-left space-y-1">
                  <p className="text-xs font-bold text-navy-900 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-mint-600" />
                    왜 무료로 제공되나요?
                  </p>
                  <p className="text-[11px] text-navy-500 leading-relaxed">
                    다음 세대 신앙 교육을 위해 헌신하시는 사역자분들의 재정 부담을 덜어드리기 위해 동역자분들의 자발적 후원으로 운영됩니다.
                  </p>
                </div>

                <Link
                  href="/school/"
                  className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-sm font-extrabold bg-navy-900 hover:bg-navy-800 text-white shadow-button transition-all"
                >
                  <Sparkles className="w-4 h-4 text-mint-400" />
                  무료로 사역 시작하기
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Right Column: Features List */}
              <div className="md:col-span-7 space-y-3">
                <p className="text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">무료 포함 혜택 리스트</p>
                <ul className="space-y-3">
                  {FEATURES.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-navy-800 font-medium leading-relaxed">
                      <div className="w-5 h-5 rounded-full bg-mint-100 text-mint-700 flex items-center justify-center shrink-0 mt-0.5 border border-mint-200">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════
          3. PARTNER STORE SECTION (쇼핑=후원)
         ════════════════════════════════════════════ */}
      <section id="stores" className="py-16 md:py-24 bg-warm-100/70 border-y border-warm-200/60">
        <div className="container-custom max-w-6xl space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
              <Store className="w-4 h-4 text-amber-700" />
              <span>PARTNER SHOPPING</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-navy-950">
              일상의 소비가 <span className="text-amber-600">사역의 후원</span>이 됩니다
            </h2>
            <p className="text-xs sm:text-sm text-navy-600 leading-relaxed">
              교회 행사, 수련회, 선생님 감사 선물, 다과 구매 시 파트너 스토어를 이용해 보세요.<br className="hidden sm:inline" />
              구매금액의 일부가 서비스 운영비로 환원되어 모든 사역자가 무료로 이용할 수 있는 기반이 됩니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">

            {/* Partner 1: 벙커 목양 (homeggmi) */}
            <div className="bg-white rounded-3xl overflow-hidden border border-warm-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-indigo-50">
                  <img
                    src="/main.jpg"
                    alt="벙커 목양 굿노트 말씀 다이어리 & 디지털 플래너"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-indigo-600 text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    디지털 말씀 플래너
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center font-bold text-lg shrink-0">
                      📖
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-navy-950">벙커 목양</h3>
                      <p className="text-xs text-navy-500">굿노트 말씀 다이어리 & QT 플래너</p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-navy-700 leading-relaxed">
                    말씀과 일상을 하나로 잇다. 17개월 올인원 하이퍼링크, 성경 통독 365, SOAP 묵상 서식 등 크리스천의 영적 루틴을 돕는 프리미엄 디지털 플래너 전문 숍.
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['굿노트 다이어리', '하이퍼링크 QT', '성경 통독 365', 'SOAP 묵상'].map((tag) => (
                      <span key={tag} className="text-[11px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200/60 px-2.5 py-1 rounded-lg">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 pt-0">
                <a
                  href="https://smartstore.naver.com/homeggmi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-button transition-all"
                >
                  <Store className="w-4 h-4" />
                  스토어에서 구경 & 구매하기
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Partner 2: 거창한벙커 */}
            <div className="bg-white rounded-3xl overflow-hidden border border-warm-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-amber-50">
                  <img
                    src="/can.jpg"
                    alt="거창한벙커 수제 레터링 캔커피"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-amber-500 text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                    <Coffee className="w-3.5 h-3.5" />
                    수제 레터링 캔커피
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center font-bold text-lg shrink-0">
                      ☕
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-navy-950">거창한벙커</h3>
                      <p className="text-xs text-navy-500">감사의 마음을 담는 수제 레터링 캔커피 스토어</p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-navy-700 leading-relaxed">
                    선생님 위로회, 수련회 참가자 선물, 절기 및 교회 행사용으로 맞춤 문구를 캔에 새겨드립니다. 하나하나 정성스럽게 수작업 제작되어 감동을 선사합니다.
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['교사 감사선물', '수련회 기념', '행사 다과', '맞춤 레터링'].map((tag) => (
                      <span key={tag} className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-lg">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 pt-0">
                <a
                  href="https://smartstore.naver.com/geochangbunker/products/4551068056"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-sm bg-amber-500 hover:bg-amber-600 text-white shadow-button transition-all"
                >
                  <Store className="w-4 h-4" />
                  스토어에서 구경 & 구매하기
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Partner 3: 프레시 네이쳐 */}
            <div className="bg-white rounded-3xl overflow-hidden border border-warm-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-green-50">
                  <img
                    src="/fluit.png"
                    alt="프레시 네이쳐 신선 과일"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                    <Apple className="w-3.5 h-3.5" />
                    신선 과일 전문
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center font-bold text-lg shrink-0">
                      🍎
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-navy-950">프레시 네이쳐</h3>
                      <p className="text-xs text-navy-500">엄선된 신선한 국산 및 수입 제철 과일 스토어</p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-navy-700 leading-relaxed">
                    국내산 제철 과일부터 수입과일까지 산지 직송의 신선함으로 전달합니다. 교회 친교 모임, 부서 행사, 선생님 선물용으로 건강한 과일 다과를 준비해 보세요.
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['부서 친교간식', '행사 다과', '제철 과일', '선물세트'].map((tag) => (
                      <span key={tag} className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-lg">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 pt-0">
                <a
                  href="https://smartstore.naver.com/roaster"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-button transition-all"
                >
                  <Store className="w-4 h-4" />
                  스토어에서 구경 & 구매하기
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
          4. DIRECT DONATION SECTION (자발적 계좌 후원)
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

          {/* Account Card */}
          <div className="bg-gradient-to-b from-warm-50 to-rose-50/30 rounded-3xl p-8 sm:p-12 border border-rose-200/70 shadow-lg relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-white text-rose-500 shadow-md flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <Heart className="w-8 h-8 fill-rose-500" />
            </div>

            <p className="text-xs font-bold text-navy-400 uppercase tracking-widest">후원 계좌 (카카오뱅크)</p>
            <div className="text-3xl sm:text-5xl font-black text-navy-950 tracking-wider my-4 font-mono">
              3333-07-0197297
            </div>

            <button
              onClick={() => handleCopyAccount(setCopiedAccount)}
              className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white font-extrabold px-8 py-3.5 rounded-2xl text-sm sm:text-base shadow-md shadow-rose-500/20 transition-all"
            >
              {copiedAccount ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  계좌번호가 복사되었습니다!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  계좌번호 1-초 복사하기
                </>
              )}
            </button>

            {copiedAccount && (
              <p className="text-xs text-rose-600 font-bold mt-3 animate-pulse">
                클립보드에 복사되었습니다. 카카오뱅크 또는 보유하신 은행 앱에서 송금해 주세요.
              </p>
            )}

            <div className="mt-8 pt-6 border-t border-rose-200/60 text-xs text-navy-500 leading-relaxed max-w-md mx-auto">
              소중한 후원금은 <strong>서버 유지 인프라 비용</strong>, <strong>AI 공지문 생성 API 연동비</strong>, <strong>신규 사역 서식 제작</strong>을 위해 100% 투명하게 사용됩니다.
            </div>
          </div>

          {/* 3 Pillars of Donation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-warm-50 rounded-2xl p-5 border border-warm-200 text-left space-y-1">
              <p className="text-sm font-bold text-navy-950 flex items-center gap-1.5">
                <span>🌱</span> 부담 없는 후원
              </p>
              <p className="text-xs text-navy-500 leading-relaxed">
                1,000원부터 얼마든지 자유롭게 마음을 전하실 수 있습니다.
              </p>
            </div>
            <div className="bg-warm-50 rounded-2xl p-5 border border-warm-200 text-left space-y-1">
              <p className="text-sm font-bold text-navy-950 flex items-center gap-1.5">
                <span>🔒</span> 투명한 사용
              </p>
              <p className="text-xs text-navy-500 leading-relaxed">
                오직 서버 및 AI 연동 비용 등 운영 목적으로만 쓰입니다.
              </p>
            </div>
            <div className="bg-warm-50 rounded-2xl p-5 border border-warm-200 text-left space-y-1">
              <p className="text-sm font-bold text-navy-950 flex items-center gap-1.5">
                <span>🤝</span> 사역자 무료 지원
              </p>
              <p className="text-xs text-navy-500 leading-relaxed">
                전국 모든 교회학교 목회자가 계속 무료로 사용할 수 있습니다.
              </p>
            </div>
          </div>

          <p className="text-xs text-navy-400 font-medium">
            정기 후원 및 기업 제휴 문의: <a href="mailto:support@churchschool.kr" className="underline hover:text-navy-700">support@churchschool.kr</a>
          </p>

        </div>
      </section>

      {/* ════════════════════════════════════════════
          5. FAQ SECTION (아코디언)
         ════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-warm-100/50 border-t border-warm-200/60">
        <div className="container-custom max-w-3xl space-y-8">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 flex items-center justify-center gap-2">
              <HelpCircle className="w-6 h-6 text-mint-600" />
              자주 묻는 질문 (FAQ)
            </h2>
            <p className="text-xs sm:text-sm text-navy-500">
              궁금하신 점을 빠르게 해결해 드립니다.
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
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-mint-500/20 text-mint-300 text-xs font-bold border border-mint-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            함께하는 사역 동역자
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            당신의 관심과 후원이<br />
            <span className="text-mint-400">다음 세대를 살립니다</span>
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-navy-300 max-w-lg mx-auto leading-relaxed">
            지금 바로 공지문 작성기, PPT 템플릿, 행사 관리 시스템을 이용해 보세요.<br />
            주변 목회자와 선생님들에게도 이 무료 솔루션을 공유해 주세요!
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <Link
              href="/school/"
              className="inline-flex items-center gap-2 bg-mint-500 hover:bg-mint-600 text-white font-extrabold px-7 py-3.5 rounded-2xl text-sm sm:text-base shadow-lg shadow-mint-500/20 transition-all"
            >
              교회학교 메인으로 가기
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={handleShareLink}
              className="inline-flex items-center gap-2 bg-navy-800 hover:bg-navy-700 text-white font-bold px-6 py-3.5 rounded-2xl text-sm border border-navy-700 transition-all"
            >
              {copiedShare ? <CheckCircle2 className="w-4 h-4 text-mint-400" /> : <Share2 className="w-4 h-4" />}
              {copiedShare ? '페이지 링크 복사됨!' : '이 페이지 공유하기'}
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
