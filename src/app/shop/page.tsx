'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag, ArrowRight, Coffee, Apple, Sparkles,
  Store, Heart, ChevronRight, Gift, Church,
  Users, Leaf, Star,
} from 'lucide-react';

const CATEGORIES = [
  { icon: Gift, label: '교사 감사 선물', color: 'rose', desc: '선생님께 전하는 특별한 마음' },
  { icon: Church, label: '행사·절기 선물', color: 'amber', desc: '부활절·추수감사절·성탄절' },
  { icon: Users, label: '수련회·MT', color: 'mint', desc: '청소년 수련회 준비물' },
  { icon: Coffee, label: '친교·다과', color: 'indigo', desc: '주일 친교와 모임 간식' },
];

const PRODUCTS = [
  {
    img: '/can.jpg',
    title: '수제 레터링 캔커피',
    store: '거창한벙커',
    price: '4,500원~',
    tags: ['교사 감사', '행사 선물', '소량 주문'],
    href: 'https://smartstore.naver.com/geochangbunker/products/4551068056',
    color: 'amber' as const,
  },
  {
    img: '/fluit.png',
    title: '신선 과일 세트',
    store: '프레시 네이쳐',
    price: '15,000원~',
    tags: ['친교 간식', '행사 다과', '대량 구매'],
    href: 'https://smartstore.naver.com/roaster',
    color: 'green' as const,
  },
  {
    img: '/can.jpg',
    title: '레터링 캔커피 10개 세트',
    store: '거창한벙커',
    price: '38,000원',
    tags: ['단체 선물', '수련회', '할인'],
    href: 'https://smartstore.naver.com/geochangbunker',
    color: 'amber' as const,
  },
  {
    img: '/fluit.png',
    title: '제철 과일 바구니',
    store: '프레시 네이쳐',
    price: '25,000원~',
    tags: ['선물용', '행사', '프리미엄'],
    href: 'https://smartstore.naver.com/roaster',
    color: 'green' as const,
  },
];

function ProductCard({ product }: { product: typeof PRODUCTS[number] }) {
  const isAmber = product.color === 'amber';
  const bgClass = isAmber ? 'bg-amber-50' : 'bg-green-50';
  const dotClass = isAmber ? 'bg-amber-500' : 'bg-green-500';
  const tagBg = isAmber ? 'bg-amber-50' : 'bg-green-50';
  const tagText = isAmber ? 'text-amber-700' : 'text-green-700';

  return (
    <a
      href={product.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-white rounded-2xl overflow-hidden border border-warm-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      <div className={`aspect-square overflow-hidden ${bgClass}`}>
        <img
          src={product.img}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
          <span className="text-[10px] font-bold text-navy-500">{product.store}</span>
        </div>
        <h3 className="text-sm font-bold text-navy-900 mb-1.5 leading-snug">{product.title}</h3>
        <p className="text-base font-extrabold text-amber-600 mb-2">{product.price}</p>
        <div className="flex flex-wrap gap-1">
          {product.tags.map((tag) => (
            <span key={tag} className={`text-[9px] font-bold ${tagText} ${tagBg} px-2 py-0.5 rounded-full`}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}

function StepCard({ step, icon: Icon, title, desc }: { step: string; icon: any; title: string; desc: string }) {
  const bgMap: Record<string, string> = { '01': 'bg-amber-500', '02': 'bg-green-500', '03': 'bg-rose-500' };
  const iconBg: Record<string, string> = { '01': 'bg-amber-50 text-amber-600', '02': 'bg-green-50 text-green-600', '03': 'bg-rose-50 text-rose-600' };
  return (
    <div className="text-center p-6">
      <div className={`w-14 h-14 rounded-2xl ${iconBg[step]} flex items-center justify-center mx-auto mb-4`}>
        <Icon className="w-7 h-7" />
      </div>
      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${bgMap[step]} text-white text-xs font-bold mb-3`}>
        {step}
      </div>
      <h3 className="text-base font-bold text-navy-900 mb-2">{title}</h3>
      <p className="text-sm text-navy-600 leading-relaxed">{desc}</p>
    </div>
  );
}

function BenefitCard({ icon: Icon, title, desc, color }: { icon: any; title: string; desc: string; color: string }) {
  const iconClasses: Record<string, string> = {
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    green: 'bg-green-50 text-green-600',
  };
  return (
    <div className="bg-white rounded-2xl p-6 border border-warm-200 hover:shadow-md transition-shadow text-center">
      <div className={`w-12 h-12 rounded-xl ${iconClasses[color]} flex items-center justify-center mx-auto mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-navy-900 mb-2">{title}</h3>
      <p className="text-sm text-navy-600 leading-relaxed">{desc}</p>
    </div>
  );
}

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  return (
    <div className="bg-white text-navy-900 font-sans">

      {/* ════════════════════════════════════════════
          1. HERO
         ════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-amber-800 pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-amber-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-rose-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-amber-300 text-sm font-bold mb-6 border border-white/10">
            <ShoppingBag className="w-4 h-4" />
            쇼핑으로 함께하는 사역 후원
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white mb-4">
            쇼핑이<br />
            <span className="text-amber-400">사역이 되는 곳</span>
          </h1>
          <p className="text-base md:text-lg text-navy-200 max-w-xl mx-auto leading-relaxed mb-10">
            특별한 기부 없이, 일상적인 쇼핑이 자연스럽게 후원이 됩니다.<br />
            당신의 선택이 다음 세대 신앙교육의 기반이 됩니다.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#products"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-7 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/25"
            >
              <Store className="w-4 h-4" />
              쇼핑하러 가기
            </a>
            <Link
              href="/support"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-7 py-3.5 rounded-xl text-sm transition-all backdrop-blur-sm border border-white/10"
            >
              <Heart className="w-4 h-4" />
              직접 후원하기
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </section>

      {/* ════════════════════════════════════════════
          2. CATEGORIES
         ════════════════════════════════════════════ */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-sm font-bold text-navy-500 uppercase tracking-wider mb-2">CATEGORIES</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-navy-900">무엇을 찾으세요?</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat, i) => {
              const active = activeCategory === i;
              return (
                <button
                  key={cat.label}
                  onClick={() => setActiveCategory(active ? null : i)}
                  className={`group text-center p-6 rounded-2xl border-2 transition-all ${
                    active ? 'border-amber-400 bg-amber-50 shadow-md' : 'border-warm-200 bg-white hover:border-amber-200 hover:shadow-sm'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl ${
                    cat.color === 'rose' ? 'bg-rose-50 text-rose-600' :
                    cat.color === 'amber' ? 'bg-amber-50 text-amber-600' :
                    cat.color === 'mint' ? 'bg-mint-50 text-mint-600' :
                    'bg-indigo-50 text-indigo-600'
                  } flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    <cat.icon className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-navy-900 mb-1">{cat.label}</p>
                  <p className="text-[11px] text-navy-500">{cat.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          3. FEATURED PRODUCTS
         ════════════════════════════════════════════ */}
      <section id="products" className="bg-warm-50 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-sm font-bold text-navy-500 uppercase tracking-wider mb-2">FEATURED PRODUCTS</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-navy-900 mb-2">지금 가장 사랑받는 상품</h2>
            <p className="text-base text-navy-600">파트너 스토어에서 판매 중인 인기 상품입니다.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRODUCTS.map((product) => (
              <ProductCard key={product.title} product={product} />
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-sm text-navy-500 flex items-center justify-center gap-1 mb-4">
              <ChevronRight className="w-4 h-4" />
              더 많은 상품은 파트너 스토어에서
              <ChevronRight className="w-4 h-4" />
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="https://smartstore.naver.com/geochangbunker"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
              >
                <Coffee className="w-4 h-4" />
                거창한벙커 스토어
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="https://smartstore.naver.com/roaster"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
              >
                <Apple className="w-4 h-4" />
                프레시 네이쳐 스토어
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          4. HOW IT WORKS
         ════════════════════════════════════════════ */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-mint-50 px-4 py-2 rounded-full text-mint-600 text-sm font-bold mb-4">
              <Sparkles className="w-4 h-4" />
              작동 방식
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-navy-900">쇼핑이 어떻게 후원이 되나요?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard step="01" icon={ShoppingBag} title="스토어에서 쇼핑" desc="파트너 스토어에서 평소처럼 상품을 구매합니다." />
            <StepCard step="02" icon={Leaf} title="수익금이 환원" desc="판매 수익금의 일부가 교회학교 서버 인프라 유지비로 환원됩니다." />
            <StepCard step="03" icon={Heart} title="서비스는 무료 유지" desc="모든 기능을 계속 무료로 제공할 수 있는 선순환이 완성됩니다." />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          5. WHY SHOP HERE
         ════════════════════════════════════════════ */}
      <section className="bg-gradient-to-br from-amber-50 via-white to-rose-50 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-navy-900 mb-2">여기서 쇼핑해야 하는 이유</h2>
            <p className="text-base text-navy-600">당신의 선택이 만드는 변화</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <BenefitCard icon={Star} title="품질 좋은 상품" desc="엄선된 파트너의 검증된 상품만을 소개합니다." color="amber" />
            <BenefitCard icon={Heart} title="부담 없는 참여" desc="기부가 아닌 쇼핑으로 자연스럽게 동참하세요." color="rose" />
            <BenefitCard icon={Leaf} title="선한 영향력" desc="당신의 소비가 교회학교 사역을 지속 가능하게 합니다." color="green" />
          </div>

          <div className="text-center mt-8">
            <Link
              href="/support"
              className="inline-flex items-center gap-2 text-sm text-rose-600 font-bold hover:text-rose-700 transition-colors"
            >
              <Heart className="w-4 h-4" />
              직접 후원도 가능합니다
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          6. CTA
         ════════════════════════════════════════════ */}
      <section className="bg-navy-900 py-16 md:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-amber-300 text-sm font-bold mb-6 border border-white/10">
            <ShoppingBag className="w-4 h-4" />
            지금 시작하세요
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
            오늘 첫 쇼핑으로<br />
            <span className="text-amber-400">사역에 날개를</span> 달아주세요
          </h2>
          <p className="text-sm text-navy-200 max-w-md mx-auto mb-8">
            1,000원부터 시작하는 후원,<br />
            쇼핑으로도 함께할 수 있습니다.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="#products"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/25"
            >
              <Store className="w-4 h-4" />
              스토어 보기
            </a>
            <Link
              href="/support"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all border border-white/10"
            >
              <Heart className="w-4 h-4" />
              후원 안내
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
