'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Heart, ShoppingBag, ArrowRight, Coffee, Apple, Sparkles,
  HandHeart, Store, ChevronRight, Gift, Users, Church,
  Copy, Check, Banknote, ShieldCheck, TrendingUp,
} from 'lucide-react';

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <div className={className} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function SupportPage() {
  const [copied, setCopied] = useState(false);

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText('3333-07-0197297');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="min-h-screen bg-warm-50 text-navy-950 font-sans overflow-x-hidden">
      {/* ════════════════════════════════════════════
          1. HERO
         ════════════════════════════════════════════ */}
      <section className="relative overflow-hidden gradient-navy text-white py-20 md:py-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-15%] right-[-5%] w-[500px] h-[500px] bg-mint-500/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[450px] h-[450px] bg-orange-500/12 rounded-full blur-[110px]" />
        </div>
        <div className="relative z-10 container-custom text-center">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-mint-300 text-sm font-semibold mb-6">
            <HandHeart className="w-4 h-4" />
            쇼핑과 후원이 함께하는 선한 영향력
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-4">
            당신의 모든 선택이<br />
            <span className="text-mint-300">사역을 살립니다</span>
          </h1>
<p className="text-sm md:text-base text-white/80 leading-relaxed max-w-lg mx-auto">
             쇼핑으로도, 직접 후원으로도 함께할 수 있습니다.<br className="hidden sm:block" />
             당신의 선택이 다음 세대 신앙교육의 든든한 기반이 됩니다.
           </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <a
              href="#stores"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-bold px-5 py-3 rounded-xl text-sm backdrop-blur-sm border border-white/20 transition-all"
            >
              <Store className="w-4 h-4" />
              스토어 보기
            </a>
            <a
              href="#donate"
              className="inline-flex items-center gap-2 bg-mint-500 hover:bg-mint-600 text-white font-bold px-5 py-3 rounded-xl text-sm transition-all"
            >
              <Heart className="w-4 h-4" />
              직접 후원하기
            </a>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          2. 파트너 스토어 — 거창한벙커 + 프레시네이쳐
         ════════════════════════════════════════════ */}
      <section id="stores" className="section bg-white pt-16 md:pt-20">
        <div className="container-custom max-w-5xl">
          <Reveal className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-600 uppercase tracking-wider mb-3">
              <span className="w-8 h-px bg-navy-200" />
              PARTNER STORE
              <span className="w-8 h-px bg-navy-200" />
            </span>
            <h2 className="section-title">쇼핑이 곧 후원입니다</h2>
<p className="section-subtitle text-navy-600 mx-auto">
               파트너 스토어에서 상품을 구매하시면 판매 수익의 일부가 서비스 운영비로 환원됩니다.<br className="hidden md:block" />
               특별한 기부나 추가 부담 없이, 일상적인 소비가 자연스럽게 사역을 후원하게 됩니다.
             </p>
           </Reveal>

           {/* 거창한벙커 */}
          <Reveal delay={100}>
            <div className="bg-warm-50 rounded-3xl p-6 md:p-8 border border-warm-200 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
                    <Coffee className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-navy-950 mb-2">거창한벙커</h3>
                  <p className="text-xs text-navy-600 font-semibold mb-3">레터링 수제캔커피 — 마음을 담은 한 캔</p>
                  <p className="text-sm text-navy-600 leading-relaxed mb-4">
                    감사의 메시지, 응원의 문구를 레터링으로 담아주는 수제 캔커피 스토어입니다.
                    하나하나 수작업으로 제작되어 선물하는 마음만큼 정성이 가득합니다.
                  </p>
                  <div className="bg-white rounded-2xl p-5 border border-warm-100 mb-5 space-y-3">
                    <p className="text-xs font-bold text-navy-600 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      사역 활용 아이디어
                    </p>
                    <ul className="space-y-2">
                      {['교사 감사 답례품', '수련회·캠프 기념 선물', '행사·세미나 참가자 기념품', '성탄절·부활절 선물세트'].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-navy-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <a
                    href="https://smartstore.naver.com/geochangbunker/products/4551068056"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3.5 rounded-2xl text-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-200/50"
                  >
                    <Store className="w-4 h-4" />
                    스토어 바로가기
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-2xl border border-amber-100 shadow-lg shadow-amber-200/20 group">
                    <img
                      src="/can.jpg"
                      alt="거창한벙커 수제 레터링 캔커피"
                      className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: '수제', sub: '핸드메이드' },
                      { label: '레터링', sub: '메시지 각인' },
                      { label: '선물용', sub: '감사·응원' },
                      { label: '교회', sub: '행사·기념' },
                    ].map((item, i) => (
                      <div key={i} className="bg-white rounded-2xl p-4 text-center border border-warm-200">
                        <p className="text-xl font-extrabold text-navy-950">{item.label}</p>
                        <p className="text-[10px] text-navy-600 mt-0.5">{item.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* 프레시 네이쳐 */}
          <Reveal delay={200}>
            <div className="bg-warm-50 rounded-3xl p-6 md:p-8 border border-warm-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1">
                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-2xl border border-green-100 shadow-lg shadow-green-200/20 group">
                      <img
                        src="/fluit.png"
                        alt="프레시 네이쳐 신선한 과일"
                        className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: '국내산', sub: '제철 과일' },
                        { label: '수입과일', sub: '다양한 선택' },
                        { label: '합리적', sub: '가격 경쟁력' },
                        { label: '신선', sub: '당일 발송' },
                      ].map((item, i) => (
                        <div key={i} className="bg-white rounded-2xl p-4 text-center border border-warm-200">
                          <p className="text-xl font-extrabold text-navy-950">{item.label}</p>
                          <p className="text-[10px] text-navy-600 mt-0.5">{item.sub}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-5">
                    <Apple className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-navy-950 mb-2">프레시 네이쳐</h3>
                  <p className="text-xs text-navy-600 font-semibold mb-3">신선한 과일을 합리적인 가격에</p>
                  <p className="text-sm text-navy-600 leading-relaxed mb-4">
                    국내산 제철 과일부터 엄선된 수입과일까지 모든 과일을 한곳에서 만나보세요.
                    교회 모임, 행사, 예배 후 친교 시간을 신선한 과일로 풍성하게 채워보세요.
                  </p>
                  <div className="bg-white rounded-2xl p-5 border border-warm-100 mb-5 space-y-3">
                    <p className="text-xs font-bold text-navy-600 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-green-500" />
                      사역 활용 아이디어
                    </p>
                    <ul className="space-y-2">
                      {['예배 후 친교 간식', '행사·세미나 다과 준비', '절기별 선물용 과일', '수련회·캠프 간식 준비'].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-navy-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <a
                    href="https://smartstore.naver.com/roaster"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3.5 rounded-2xl text-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-200/50"
                  >
                    <Store className="w-4 h-4" />
                    스토어 바로가기
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={300} className="text-center mt-8">
            <p className="text-xs text-navy-600 flex items-center justify-center gap-1.5">
              <ChevronRight className="w-3 h-3" />
              아래로 스크롤하면 직접 후원하기도 있어요
              <ChevronRight className="w-3 h-3" />
            </p>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          3. 자발적 후원 — 카카오뱅크
         ════════════════════════════════════════════ */}
      <section id="donate" className="section bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white">
        <div className="container-custom max-w-3xl">
          <Reveal className="text-center mb-10">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-mint-300 text-sm font-semibold mb-6">
              <Heart className="w-4 h-4" />
              자발적 후원
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-4">
              직접 마음을 전하고 싶다면<br />
              <span className="text-mint-300">자발적 후원</span>
            </h2>
<p className="text-sm text-white/70 leading-relaxed max-w-md mx-auto">
               정해진 금액은 없습니다. 당신의 마음이 곧 후원입니다.<br />
               모든 기능은 영구 무료, 후원은 언제나 자발적입니다.
             </p>
           </Reveal>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              {
                icon: Banknote,
                title: '부담 없는 금액',
                desc: '1,000원부터, 당신이 정한 만큼',
                color: 'from-mint-400/20 to-mint-500/10',
                iconColor: 'text-mint-400',
              },
              {
                icon: ShieldCheck,
                title: '투명한 사용',
                desc: '후원금 사용 내역을 정기 공개합니다',
                color: 'from-sky-400/20 to-sky-500/10',
                iconColor: 'text-sky-400',
              },
              {
                icon: TrendingUp,
                title: '지속 가능한 사역',
                desc: '서버 인프라 · 기능 개발 · 콘텐츠 제작',
                color: 'from-rose-400/20 to-rose-500/10',
                iconColor: 'text-rose-400',
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal key={i} delay={i * 100}>
                  <div className={`rounded-2xl p-5 bg-gradient-to-br ${item.color} border border-white/10 text-center`}>
                    <Icon className={`w-8 h-8 ${item.iconColor} mx-auto mb-3`} />
<h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                     <p className="text-xs text-white/70 leading-relaxed">{item.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* Account Card */}
          <Reveal delay={300}>
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 md:p-10 border border-white/10 text-center">
              <div className="w-16 h-16 rounded-full bg-mint-500/20 flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-mint-400" />
              </div>
<p className="text-sm text-white/70 font-medium mb-2">후원 계좌</p>
               <p className="text-xs text-white/70 mb-4">카카오뱅크</p>
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="text-3xl md:text-4xl font-extrabold tracking-wider text-white">
                  3333-07-0197297
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={copyAccount}
                  className="inline-flex items-center gap-2 bg-mint-500 hover:bg-mint-600 text-white font-bold px-6 py-3.5 rounded-2xl text-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-mint-500/30"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      복사 완료
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      계좌번호 복사
                    </>
                  )}
                </button>
                <Link
                  href="/login?redirect=/support"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3.5 rounded-2xl text-sm border border-white/20 transition-all"
                >
                  <HandHeart className="w-4 h-4" />
                  로그인하고 더 알아보기
                </Link>
              </div>
              {copied && (
                <p className="text-xs text-mint-300 mt-4 animate-pulse">
                  계좌번호가 클립보드에 복사되었습니다. 카카오뱅크 앱에서 송금해주세요.
                </p>
              )}
<p className="text-xs text-white/60 mt-6 leading-relaxed max-w-sm mx-auto">
                 후원금은 서버 인프라 유지 · 기능 개발 · QT 콘텐츠 제작 등<br />
                 모든 사용자가 무료로 서비스를 이용할 수 있도록 사용됩니다.
               </p>
             </div>
           </Reveal>

           <Reveal delay={400} className="text-center mt-8">
             <p className="text-xs text-white/60 flex items-center justify-center gap-2">
              <Sparkles className="w-3 h-3 text-mint-400" />
              정기 후원도 환영합니다 (월 1회 자동이체 문의: support@churchschool.kr)
            </p>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          4. 철학 — 왜 쇼핑이 후원인가 (간소화)
         ════════════════════════════════════════════ */}
      <section className="section bg-white">
        <div className="container-custom max-w-3xl">
          <Reveal className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-600 uppercase tracking-wider mb-3">
              <span className="w-8 h-px bg-navy-200" />
              OUR PHILOSOPHY
              <span className="w-8 h-px bg-navy-200" />
            </span>
            <h2 className="section-title">모든 서비스는 영구 무료입니다</h2>
<p className="section-subtitle text-navy-600 mx-auto">
               목회 사역에 비용이 걸림돌이 되어서는 안 된다고 믿습니다.<br />
               쇼핑과 후원이라는 두 가지 방식으로 지속 가능한 서비스를 만들어갑니다.
             </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: ShoppingBag,
                title: '파트너 스토어 쇼핑',
                desc: '필요한 상품을 구매하면 수익의 일부가 서비스 운영비로 환원됩니다. 특별한 추가 부담 없이 자연스러운 후원이 이루어집니다.',
                color: 'bg-amber-50',
                iconColor: 'text-amber-600',
                border: 'border-amber-200',
              },
              {
                icon: Heart,
                title: '자발적 직접 후원',
                desc: '카카오뱅크 계좌로 직접 후원하실 수 있습니다. 정해진 금액은 없으며, 모든 후원금은 투명하게 사용됩니다.',
                color: 'bg-rose-50',
                iconColor: 'text-rose-600',
                border: 'border-rose-200',
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal key={i} delay={i * 100}>
                  <div className={`${item.color} rounded-3xl p-6 ${item.border} h-full`}>
                    <div className={`w-12 h-12 rounded-2xl ${item.color} ${item.iconColor} flex items-center justify-center mb-4 border ${item.border}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-navy-950 mb-2">{item.title}</h3>
                    <p className="text-sm text-navy-600 leading-relaxed">{item.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          5. 큐레이션
         ════════════════════════════════════════════ */}
      <section className="section bg-warm-50">
        <div className="container-custom max-w-4xl">
          <Reveal className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-600 uppercase tracking-wider mb-3">
              <span className="w-8 h-px bg-navy-200" />
              CURATION
              <span className="w-8 h-px bg-navy-200" />
            </span>
            <h2 className="section-title">상황별 추천 아이디어</h2>
            <p className="section-subtitle text-navy-600 mx-auto">당신의 상황에 맞는 쇼핑을 제안합니다</p>
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
                    <p className="text-[11px] text-navy-600 leading-relaxed mb-3">{item.desc}</p>
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
          6. 계속 무료 + CTA
         ════════════════════════════════════════════ */}
      <section className="section bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white">
        <div className="container-custom max-w-3xl text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-mint-300 text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              계속 무료입니다
            </div>
<h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-4">
               당신의 쇼핑과 후원이<br />
               <span className="text-mint-300">모든 서비스를 무료로</span> 유지합니다
             </h2>
             <p className="text-sm text-white/70 leading-relaxed max-w-md mx-auto mb-8">
              설교 준비 · 공지문 작성 · PPT 제작 · 행사 관리 · QT 아카이브<br />
              모든 기능을 계속 무료로 제공합니다.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/dashboard" className="inline-flex items-center gap-2 bg-white text-navy-900 font-bold px-6 py-3.5 rounded-2xl text-sm hover:bg-warm-50 transition-all">
                대시보드로 가기
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#donate"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3.5 rounded-2xl text-sm border border-white/20 transition-all"
              >
                <Heart className="w-4 h-4" />
                후원 참여하기
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          7. 최종 CTA
         ════════════════════════════════════════════ */}
      <section className="section">
        <div className="container-custom max-w-3xl text-center">
          <Reveal>
            <div className="bg-white rounded-3xl p-10 shadow-card border border-warm-200">
              <Heart className="w-12 h-12 text-mint-500 mx-auto mb-4" />
              <h2 className="text-xl md:text-2xl font-extrabold text-navy-950 mb-3">
                지금 참여하세요
              </h2>
              <p className="text-sm text-navy-600 leading-relaxed max-w-sm mx-auto mb-8">
                쇼핑으로도, 직접 후원으로도 함께할 수 있습니다.<br />
                당신의 선택이 다음 세대 신앙교육의 든든한 기반이 됩니다.
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
              <div className="mt-4 pt-4 border-t border-warm-200">
                <button
                  onClick={copyAccount}
                  className="inline-flex items-center gap-2 text-xs text-navy-700 hover:text-navy-900 transition-colors font-semibold"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-mint-500" />
                      계좌번호 복사 완료
                    </>
                  ) : (
                    <>
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      직접 후원하기 — 카카오뱅크 3333-07-0197297 (클릭 시 복사)
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-navy-600 mt-4">
                네이버 스마트스토어에서 바로 구매하실 수 있습니다
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
