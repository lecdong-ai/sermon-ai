'use client';

import Link from 'next/link';
import {
  Heart, ShoppingBag, ArrowRight, Coffee, Apple, Sparkles,
  HandHeart, Store, ChevronRight, Gift, Users, Church,
} from 'lucide-react';

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <div className={className} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-warm-50 text-navy-950 font-sans overflow-x-hidden">
      {/* ════════════════════════════════════════════
          1. HERO
         ════════════════════════════════════════════ */}
      <section className="relative overflow-hidden gradient-navy text-white py-20 md:py-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-15%] right-[-5%] w-[500px] h-[500px] bg-mint-500/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[450px] h-[450px] bg-orange-500/12 rounded-full blur-[110px]" style={{ animationDelay: '3s' }} />
        </div>
        <div className="relative z-10 container-custom text-center">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-mint-300 text-sm font-semibold mb-6">
            <HandHeart className="w-4 h-4" />
            쇼핑이 곧 후원입니다
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-4">
            당신의 소비가<br />
            <span className="text-mint-300">교회학교를 살립니다</span>
          </h1>
          <p className="text-sm md:text-base text-navy-200 leading-relaxed max-w-lg mx-auto">
            교회학교 솔루션의 모든 서비스는 무료입니다. 파트너 스토어에서의 쇼핑이<br className="hidden sm:block" />
            서비스 운영과 발전을 위한 후원이 됩니다.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          2. 철학 — 왜 쇼핑이 후원인가
         ════════════════════════════════════════════ */}
      <section className="section">
        <div className="container-custom max-w-3xl">
          <Reveal className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-400 uppercase tracking-wider mb-3">
              <span className="w-8 h-px bg-navy-200" />
              OUR PHILOSOPHY
              <span className="w-8 h-px bg-navy-200" />
            </span>
            <h2 className="section-title">왜 쇼핑이 후원이 될까요?</h2>
          </Reveal>

          <div className="space-y-8">
            <Reveal delay={100} className="bg-white rounded-3xl p-8 shadow-card border border-warm-200">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-mint-50 text-mint-600 flex items-center justify-center shrink-0">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-950 mb-2">모든 서비스는 영구 무료</h3>
                  <p className="text-sm text-navy-500 leading-relaxed">
                    교회학교 솔루션은 AI 공지문 작성기, PPT 스튜디오, 워크스페이스, 행사 신청 시스템까지 
                    모든 기능을 무료로 제공합니다. 교회 사역에 비용이 걸림돌이 되어서는 안 된다고 믿기 때문입니다.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={200} className="bg-white rounded-3xl p-8 shadow-card border border-warm-200">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-950 mb-2">쇼핑이 곧 선한 영향력</h3>
                  <p className="text-sm text-navy-500 leading-relaxed">
                    파트너 스토어에서 상품을 구매하시면 판매 수익의 일부가 교회학교 서비스 운영비로 
                    환원됩니다. 특별한 기부나 추가 부담 없이, 당신의 일상적인 소비가 자연스럽게 
                    교회학교 사역을 후원하게 됩니다.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={300} className="bg-white rounded-3xl p-8 shadow-card border border-warm-200">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                  <HandHeart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-950 mb-2">사역과 상생의 선순환</h3>
                  <p className="text-sm text-navy-500 leading-relaxed">
                    좋은 상품을 합리적인 가격에 구매하고, 그 구매가 다시 교회학교 서비스로 
                    돌아오는 선순환 구조입니다. 당신의 선택이 교회학교 사역자들의 사역을 
                    가볍게 하고, 더 많은 교회가 혜택을 누릴 수 있게 합니다.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          3. 파트너 스토어 — 거창한벙커
         ════════════════════════════════════════════ */}
      <section className="section bg-white">
        <div className="container-custom max-w-4xl">
          <Reveal className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-400 uppercase tracking-wider mb-3">
              <span className="w-8 h-px bg-navy-200" />
              STORE 01
              <span className="w-8 h-px bg-navy-200" />
            </span>
            <h2 className="section-title">거창한벙커</h2>
            <p className="section-subtitle mx-auto">레터링 수제캔커피 — 마음을 담은 한 캔</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <Reveal delay={100}>
              <div className="bg-warm-50 rounded-3xl p-8 border border-warm-200 h-full flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
                  <Coffee className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-navy-950 mb-3">레터링으로 전하는 따뜻한 마음</h3>
                <p className="text-sm text-navy-500 leading-relaxed mb-4">
                  거창한벙커는 수제 캔커피에 감사의 메시지, 응원의 문구, 
                  교회 이름을 레터링으로 담아주는 스토어입니다. 하나하나 수작업으로 
                  제작되는 캔커피는 선물하는 마음만큼이나 정성이 가득합니다.
                </p>

                <div className="bg-white rounded-2xl p-5 border border-warm-100 mb-5 space-y-3">
                  <p className="text-xs font-bold text-navy-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-mint-500" />
                    교회학교 활용 아이디어
                  </p>
                  <ul className="space-y-2">
                    {[
                      '주일학교 교사 감사 답례품',
                      '수련회·캠프 기념 선물',
                      '행사·세미나 참가자 기념품',
                      '성탄절·부활절 교회 선물세트',
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-navy-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-mint-400 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto">
                  <a
                    href="https://smartstore.naver.com/geochangbunker/products/4551068056"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3.5 rounded-2xl text-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <Store className="w-4 h-4" />
                    스토어 바로가기
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="space-y-4">
                <div className="overflow-hidden rounded-3xl border border-amber-100 shadow-lg shadow-amber-200/20 group">
                  <img
                    src="/can.jpg"
                    alt="거창한벙커 수제 레터링 캔커피"
                    className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-warm-50 rounded-2xl p-4 text-center border border-warm-200">
                    <p className="text-2xl font-extrabold text-navy-950">수제</p>
                    <p className="text-[10px] text-navy-400 mt-0.5">핸드메이드</p>
                  </div>
                  <div className="bg-warm-50 rounded-2xl p-4 text-center border border-warm-200">
                    <p className="text-2xl font-extrabold text-navy-950">레터링</p>
                    <p className="text-[10px] text-navy-400 mt-0.5">메시지 각인</p>
                  </div>
                  <div className="bg-warm-50 rounded-2xl p-4 text-center border border-warm-200">
                    <p className="text-2xl font-extrabold text-navy-950">선물용</p>
                    <p className="text-[10px] text-navy-400 mt-0.5">감사·응원</p>
                  </div>
                  <div className="bg-warm-50 rounded-2xl p-4 text-center border border-warm-200">
                    <p className="text-2xl font-extrabold text-navy-950">교회</p>
                    <p className="text-[10px] text-navy-400 mt-0.5">행사·기념</p>
                  </div>
                </div>

                <div className="bg-navy-900 text-white rounded-2xl p-5 text-center">
                  <Users className="w-5 h-5 text-mint-400 mx-auto mb-2" />
                  <p className="text-xs font-bold leading-relaxed">
                    "교회에서 답례품으로 거창한벙커 캔커피를 선택했어요.<br />
                    선생님들이 너무 좋아하셨습니다!"
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          4. 파트너 스토어 — 프레시 네이쳐
         ════════════════════════════════════════════ */}
      <section className="section bg-warm-50">
        <div className="container-custom max-w-4xl">
          <Reveal className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-400 uppercase tracking-wider mb-3">
              <span className="w-8 h-px bg-navy-200" />
              STORE 02
              <span className="w-8 h-px bg-navy-200" />
            </span>
            <h2 className="section-title">프레시 네이쳐</h2>
            <p className="section-subtitle mx-auto">국내산부터 수입과일까지, 모든 과일을 한곳에서</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <Reveal delay={200} className="order-2 md:order-1">
              <div className="space-y-4">
                <div className="overflow-hidden rounded-3xl border border-green-100 shadow-lg shadow-green-200/20 group">
                  <img
                    src="/fluit.png"
                    alt="프레시 네이쳐 신선한 과일"
                    className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-2xl p-4 text-center border border-warm-200">
                    <p className="text-2xl font-extrabold text-navy-950">국내산</p>
                    <p className="text-[10px] text-navy-400 mt-0.5">제철 과일</p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 text-center border border-warm-200">
                    <p className="text-2xl font-extrabold text-navy-950">수입과일</p>
                    <p className="text-[10px] text-navy-400 mt-0.5">다양한 선택</p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 text-center border border-warm-200">
                    <p className="text-2xl font-extrabold text-navy-950">합리적</p>
                    <p className="text-[10px] text-navy-400 mt-0.5">가격 경쟁력</p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 text-center border border-warm-200">
                    <p className="text-2xl font-extrabold text-navy-950">신선</p>
                    <p className="text-[10px] text-navy-400 mt-0.5">당일 발송</p>
                  </div>
                </div>

                <div className="bg-navy-900 text-white rounded-2xl p-5 text-center">
                  <Church className="w-5 h-5 text-mint-400 mx-auto mb-2" />
                  <p className="text-xs font-bold leading-relaxed">
                    "교회 모임 간식으로 과일을 자주 주문합니다.<br />
                    품질이 좋고 가격도 착해서 계속 이용 중이에요."
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={100} className="order-1 md:order-2">
              <div className="bg-white rounded-3xl p-8 border border-warm-200 h-full flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-5">
                  <Apple className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-navy-950 mb-3">신선한 과일로 전하는 정성</h3>
                <p className="text-sm text-navy-500 leading-relaxed mb-4">
                  프레시 네이쳐는 국내산 제철 과일부터 엄선된 수입과일까지 
                  모든 종류의 과일을 합리적인 가격에 공급하는 과일 전문 스토어입니다. 
                  교회 모임, 행사, 예배 후 친교 시간을 신선한 과일로 풍성하게 채워보세요.
                </p>

                <div className="bg-warm-50 rounded-2xl p-5 border border-warm-100 mb-5 space-y-3">
                  <p className="text-xs font-bold text-navy-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-mint-500" />
                    교회학교 활용 아이디어
                  </p>
                  <ul className="space-y-2">
                    {[
                      '주일 예배 후 친교 간식',
                      '행사·세미나 다과 준비',
                      '절기별 교회 선물용 과일',
                      '수련회·캠프 간식 준비',
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-navy-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto">
                  <a
                    href="https://smartstore.naver.com/roaster"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3.5 rounded-2xl text-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <Store className="w-4 h-4" />
                    스토어 바로가기
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          5. 큐레이션 — 이런 상품은 어떠세요?
         ════════════════════════════════════════════ */}
      <section className="section bg-white">
        <div className="container-custom max-w-4xl">
          <Reveal className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-400 uppercase tracking-wider mb-3">
              <span className="w-8 h-px bg-navy-200" />
              CURATION
              <span className="w-8 h-px bg-navy-200" />
            </span>
            <h2 className="section-title">상황별 추천 아이디어</h2>
            <p className="section-subtitle mx-auto">당신의 상황에 맞는 쇼핑을 제안합니다</p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Gift, label: '교사 감사 선물',
                desc: '레터링 캔커피로 마음을 전하세요',
                store: '거창한벙커', color: 'amber',
              },
              {
                icon: Users, label: '친교 간식',
                desc: '신선한 과일로 예배 후를 풍성하게',
                store: '프레시 네이쳐', color: 'green',
              },
              {
                icon: Church, label: '절기 행사',
                desc: '과일과 커피로 특별한 날을 장식',
                store: '두 스토어 모두', color: 'navy',
              },
              {
                icon: Heart, label: '답례품',
                desc: '수제 캔커피는 언제나 옳은 선택',
                store: '거창한벙커', color: 'rose',
              },
            ].map((item, i) => {
              const colorMap: Record<string, { bg: string; text: string; border: string; icon: string }> = {
                amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', icon: 'bg-amber-100 text-amber-600' },
                green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', icon: 'bg-green-100 text-green-600' },
                navy: { bg: 'bg-navy-50', text: 'text-navy-600', border: 'border-navy-200', icon: 'bg-navy-100 text-navy-600' },
                rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', icon: 'bg-rose-100 text-rose-600' },
              };
              const c = colorMap[item.color];
              const Icon = item.icon;
              return (
                <Reveal key={i} delay={i * 100}>
                  <div className={`${c.bg} rounded-2xl p-5 border ${c.border} h-full flex flex-col items-center text-center`}>
                    <div className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center mb-3`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-navy-950 mb-1">{item.label}</h3>
                    <p className="text-[11px] text-navy-500 leading-relaxed mb-3">{item.desc}</p>
                    <span className={`text-[10px] font-bold ${c.text} mt-auto`}>
                      {item.store}
                    </span>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          6. 후원 현황 + 무료 서비스 리마인드
         ════════════════════════════════════════════ */}
      <section className="section bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white">
        <div className="container-custom max-w-3xl text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-mint-300 text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              계속 무료입니다
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-4">
              당신의 쇼핑이<br />
              <span className="text-mint-300">모든 서비스를 무료로</span> 유지합니다
            </h2>
            <p className="text-sm text-navy-300 leading-relaxed max-w-md mx-auto mb-8">
              AI 공지문 작성기 · PPT 스튜디오 · 워크스페이스 · 행사 신청 시스템<br />
              모든 기능을 계속 무료로 제공할 수 있는 이유는 바로 당신의 참여 덕분입니다.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/notice-writer" className="inline-flex items-center gap-2 bg-white text-navy-900 font-bold px-6 py-3.5 rounded-2xl text-sm hover:bg-warm-50 transition-all">
                무료로 시작하기
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          7. CTA — 같이 쇼핑하고 후원하세요
         ════════════════════════════════════════════ */}
      <section className="section">
        <div className="container-custom max-w-3xl text-center">
          <Reveal>
            <div className="bg-white rounded-3xl p-10 shadow-card border border-warm-200">
              <Heart className="w-12 h-12 text-mint-500 mx-auto mb-4" />
              <h2 className="text-xl md:text-2xl font-extrabold text-navy-950 mb-3">
                지금 쇼핑하고 후원에 참여하세요
              </h2>
              <p className="text-sm text-navy-500 leading-relaxed max-w-sm mx-auto mb-8">
                당신의 일상적인 소비가 교회학교 사역자의 사역을 가볍게 하고,<br />
                다음 세대 신앙교육의 든든한 기반이 됩니다.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="https://smartstore.naver.com/geochangbunker/products/4551068056"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3.5 rounded-2xl text-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg w-full sm:w-auto justify-center"
                >
                  <Coffee className="w-4 h-4" />
                  거창한벙커 쇼핑하기
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="https://smartstore.naver.com/roaster"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3.5 rounded-2xl text-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg w-full sm:w-auto justify-center"
                >
                  <Apple className="w-4 h-4" />
                  프레시 네이쳐 쇼핑하기
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
              <p className="text-xs text-navy-400 mt-4">
                네이버 스마트스토어에서 바로 구매하실 수 있습니다
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
