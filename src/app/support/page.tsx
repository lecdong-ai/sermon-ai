'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Heart, ShoppingBag, ArrowRight, Coffee, Apple, Sparkles,
  HandHeart, Store, Copy, Check, ChevronRight,
} from 'lucide-react';

export default function SupportPage() {
  const [copied, setCopied] = useState(false);
  const [copiedCta, setCopiedCta] = useState(false);

  const copyAccount = async (set: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText('3333-07-0197297');
      set(true);
      setTimeout(() => set(false), 2000);
    } catch {}
  };

  return (
    <div className="bg-white text-navy-900 font-sans">

      {/* ════════════════════════════════════════════
          1. HERO
         ════════════════════════════════════════════ */}
      <section className="bg-white pt-24 pb-16 md:pt-32 md:pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-full text-rose-600 text-sm font-bold mb-6">
            <Heart className="w-4 h-4" />
            쇼핑과 후원이 함께하는 선한 영향력
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-navy-900 mb-4">
            당신의 모든 선택이<br />
            <span className="text-rose-500">사역을 살립니다</span>
          </h1>
          <p className="text-base md:text-lg text-navy-600 max-w-xl mx-auto leading-relaxed mb-8">
            쇼핑으로도, 직접 후원으로도 함께할 수 있습니다.<br />
            당신의 선택이 다음 세대 신앙교육의 기반이 됩니다.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="#stores"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-all"
            >
              <Store className="w-4 h-4" />
              스토어 보기
            </a>
            <a
              href="#donate"
              className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-all"
            >
              <Heart className="w-4 h-4" />
              직접 후원하기
            </a>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          2. 파트너 스토어
         ════════════════════════════════════════════ */}
      <section id="stores" className="bg-warm-50 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-sm font-bold text-navy-500 uppercase tracking-wider mb-2">PARTNER STORE</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-navy-900 mb-2">쇼핑이 곧 후원입니다</h2>
            <p className="text-base text-navy-600 max-w-xl mx-auto">
              파트너 스토어에서의 구매가 서비스 운영비로 환원됩니다.<br />
              특별한 기부 없이, 일상적인 소비가 자연스럽게 후원이 됩니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* 거창한벙커 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-warm-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-[4/3] overflow-hidden bg-amber-50">
                <img
                  src="/can.jpg"
                  alt="거창한벙커 수제 레터링 캔커피"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-900">거창한벙커</h3>
                    <p className="text-xs text-navy-600">레터링 수제캔커피</p>
                  </div>
                </div>
                <p className="text-sm text-navy-700 leading-relaxed mb-4">
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
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
                >
                  <Store className="w-4 h-4" />
                  스토어 바로가기
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* 프레시 네이쳐 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-warm-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-[4/3] overflow-hidden bg-green-50">
                <img
                  src="/fluit.png"
                  alt="프레시 네이쳐 신선한 과일"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                    <Apple className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-900">프레시 네이쳐</h3>
                    <p className="text-xs text-navy-600">신선한 과일 전문</p>
                  </div>
                </div>
                <p className="text-sm text-navy-700 leading-relaxed mb-4">
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
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
                >
                  <Store className="w-4 h-4" />
                  스토어 바로가기
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-navy-500 flex items-center justify-center gap-1">
              <ChevronRight className="w-4 h-4" />
              아래로 내리면 직접 후원하기도 있어요
              <ChevronRight className="w-4 h-4" />
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          3. 자발적 후원
         ════════════════════════════════════════════ */}
      <section id="donate" className="bg-white py-16 md:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-full text-rose-600 text-sm font-bold mb-6">
            <HandHeart className="w-4 h-4" />
            자발적 후원
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-navy-900 mb-2">
            직접 마음을 전하고 싶다면
          </h2>
          <p className="text-base text-navy-600 mb-2">
            정해진 금액은 없습니다. 당신의 마음이 곧 후원입니다.
          </p>
          <p className="text-sm text-navy-500 mb-10">
            모든 기능은 영구 무료, 후원은 언제나 자발적입니다.
          </p>

          <div className="bg-warm-50 rounded-2xl p-8 md:p-10 border border-warm-200">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-5">
              <Heart className="w-8 h-8 text-rose-500" />
            </div>
            <p className="text-sm font-bold text-navy-500 mb-1">후원 계좌</p>
            <p className="text-xs text-navy-400 mb-4">카카오뱅크</p>
            <p className="text-3xl md:text-4xl font-extrabold tracking-wider text-navy-900 mb-6">
              3333-07-0197297
            </p>
            <button
              onClick={() => copyAccount(setCopied)}
              className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all"
            >
              {copied ? (
                <><Check className="w-4 h-4" /> 복사 완료</>
              ) : (
                <><Copy className="w-4 h-4" /> 계좌번호 복사</>
              )}
            </button>
            {copied && (
              <p className="text-xs text-rose-600 mt-3">
                계좌번호가 복사되었습니다. 카카오뱅크 앱에서 송금해주세요.
              </p>
            )}
            <div className="mt-6 pt-6 border-t border-warm-200">
              <p className="text-xs text-navy-500 leading-relaxed">
                후원금은 서버 인프라 유지 · 기능 개발 · QT 콘텐츠 제작 등<br />
                모든 사용자가 무료로 서비스를 이용할 수 있도록 사용됩니다.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            {[
              { label: '부담 없는 금액', desc: '1,000원부터 자유롭게' },
              { label: '투명한 사용', desc: '후원 내역 정기 공개' },
              { label: '지속 가능', desc: '서버 · 개발 · 콘텐츠' },
            ].map((item) => (
              <div key={item.label} className="bg-warm-50 rounded-xl p-4 border border-warm-200">
                <p className="text-sm font-bold text-navy-900">{item.label}</p>
                <p className="text-xs text-navy-600 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-navy-500 mt-6">
            정기 후원 문의: support@churchschool.kr
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          4. CTA
         ════════════════════════════════════════════ */}
      <section className="bg-warm-50 py-16 md:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-mint-50 px-4 py-2 rounded-full text-mint-600 text-sm font-bold mb-6">
            <Sparkles className="w-4 h-4" />
            계속 무료입니다
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-navy-900 mb-3">
            당신의 관심이<br />
            <span className="text-rose-500">모든 서비스를 무료로</span> 유지합니다
          </h2>
          <p className="text-sm text-navy-600 max-w-md mx-auto mb-8">
            설교 준비 · 공지문 작성 · PPT 제작 · 행사 관리 · QT 아카이브<br />
            모든 기능을 계속 무료로 제공합니다.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all"
            >
              대시보드로 가기
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => copyAccount(setCopiedCta)}
              className="inline-flex items-center gap-2 bg-white hover:bg-warm-50 text-navy-900 font-bold px-6 py-3 rounded-xl text-sm border border-warm-300 transition-all"
            >
              {copiedCta ? (
                <><Check className="w-4 h-4 text-rose-500" /> 계좌번호 복사 완료</>
              ) : (
                <><Heart className="w-4 h-4 text-rose-500" /> 후원 계좌보기</>
              )}
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
