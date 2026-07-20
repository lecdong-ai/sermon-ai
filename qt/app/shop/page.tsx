import type { Metadata } from 'next'
import { Container } from '@/components/layout/Container'
import { DonationSection } from '@/components/shop/DonationSection'
import { Coffee, Apple, Heart, ShoppingBag, HandHeart, Sparkles, Store, ArrowRight, Gift, Users, Church, BookOpen } from 'lucide-react'

export const metadata: Metadata = {
  title: '후원샵',
  description: '쇼핑이 후원입니다. 모든 수익은 무료 큐티 자료를 지키는 데 쓰입니다.',
}

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <div className={className} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ════════════════════════════════════════════
          1. HERO
         ════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-foreground via-foreground to-foreground/95 text-white py-20 md:py-28">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full bg-accent/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[450px] h-[450px] rounded-full bg-amber-500/15 blur-[110px]" />
        </div>
        <Container className="relative z-10 text-center" maxWidth="list">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-accent-soft text-sm font-semibold mb-6 border border-white/10">
            <HandHeart className="w-4 h-4" />
            쇼핑이 곧 후원입니다
          </div>
          <h1 className="font-serif text-display sm:text-[3rem] md:text-[3.75rem] font-bold leading-tight tracking-tight mb-4">
            당신의 소비가<br />
            <span className="text-accent-soft">사역을 살립니다</span>
          </h1>
          <p className="text-body sm:text-body-lg text-white/70 leading-relaxed max-w-lg mx-auto">
            모든 자료는 무료입니다. 파트너 스토어에서의 쇼핑이<br className="hidden sm:block" />
            서비스 운영과 발전을 위한 후원이 됩니다.
          </p>
        </Container>
      </section>

      {/* ════════════════════════════════════════════
          2. 철학 — 왜 쇼핑이 후원인가
         ════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20">
        <Container maxWidth="list">
          <Reveal className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 text-caption font-bold text-foreground-subtle uppercase tracking-wider mb-3">
              <span className="w-8 h-px bg-border" />
              OUR PHILOSOPHY
              <span className="w-8 h-px bg-border" />
            </div>
            <h2 className="font-serif text-h1 text-foreground">왜 쇼핑이 후원이 될까요?</h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-list mx-auto">
            {[
              {
                icon: Heart,
                color: 'bg-rose-50 text-rose-500',
                title: '모든 서비스는 영구 무료',
                desc: '큐티 아카이브의 모든 기능을 무료로 제공합니다. 사역에 비용이 걸림돌이 되어서는 안 된다고 믿기 때문입니다.',
              },
              {
                icon: ShoppingBag,
                color: 'bg-amber-50 text-amber-500',
                title: '쇼핑이 곧 선한 영향력',
                desc: '파트너 스토어에서 상품을 구매하시면 판매 수익의 일부가 서비스 운영비로 환원됩니다. 특별한 기부나 추가 부담 없이 일상적인 소비가 자연스럽게 사역을 후원하게 됩니다.',
              },
              {
                icon: HandHeart,
                color: 'bg-accent-soft text-accent',
                title: '사역과 상생의 선순환',
                desc: '좋은 상품을 합리적인 가격에 구매하고, 그 구매가 다시 서비스로 돌아오는 선순환 구조입니다. 당신의 선택이 더 많은 이들이 혜택을 누릴 수 있게 합니다.',
              },
            ].map((item, idx) => (
              <Reveal key={idx} delay={idx * 100} className="bg-surface rounded-2xl p-6 sm:p-8 border border-border shadow-card hover:shadow-card-hover transition-all duration-300">
                <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center mb-4`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-h3 text-foreground mb-2">{item.title}</h3>
                <p className="text-body text-foreground-muted leading-relaxed">{item.desc}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ════════════════════════════════════════════
          3. 파트너 스토어 — 게더링 커피
         ════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-surface/50">
        <Container maxWidth="list">
          <Reveal className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 text-caption font-bold text-foreground-subtle uppercase tracking-wider mb-3">
              <span className="w-8 h-px bg-border" />
              STORE 01
              <span className="w-8 h-px bg-border" />
            </div>
            <h2 className="font-serif text-h1 text-foreground">거창한벙커</h2>
            <p className="text-body text-foreground-muted mt-2">레터링 수제캔커피 — 마음을 담은 한 캔</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-list mx-auto">
            <Reveal delay={100}>
              <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border h-full flex flex-col shadow-card">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-5">
                  <Coffee className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="text-h3 font-serif text-foreground mb-3">레터링으로 전하는 따뜻한 마음</h3>
                <p className="text-body text-foreground-muted leading-relaxed mb-4">
                  거창한벙커는 수제 캔커피에 감사의 메시지, 응원의 문구를 레터링으로 담아주는 스토어입니다. 하나하나 수작업으로 제작되는 캔커피는 선물하는 마음만큼이나 정성이 가득합니다.
                </p>

                <div className="bg-surface-2 rounded-xl p-5 border border-border mb-5 space-y-3">
                  <p className="text-meta font-bold text-foreground-subtle flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    사역 활용 아이디어
                  </p>
                  <ul className="space-y-2">
                    {['교사 감사 답례품', '수련회·캠프 기념 선물', '행사·세미나 참가자 기념품', '성탄절·부활절 선물세트'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-meta text-foreground-muted">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent/50 shrink-0" />
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
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-meta transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
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
                <div className="overflow-hidden rounded-2xl border border-amber-100 shadow-lg group">
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
                    <div key={i} className="bg-surface rounded-xl p-4 text-center border border-border">
                      <p className="text-xl font-bold text-foreground">{item.label}</p>
                      <p className="text-caption text-foreground-subtle mt-0.5">{item.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ════════════════════════════════════════════
          4. 파트너 스토어 — 프레시 네이쳐
         ════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20">
        <Container maxWidth="list">
          <Reveal className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 text-caption font-bold text-foreground-subtle uppercase tracking-wider mb-3">
              <span className="w-8 h-px bg-border" />
              STORE 02
              <span className="w-8 h-px bg-border" />
            </div>
            <h2 className="font-serif text-h1 text-foreground">프레시 네이쳐</h2>
            <p className="text-body text-foreground-muted mt-2">국내산부터 수입과일까지, 모든 과일을 한곳에서</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-list mx-auto">
            <Reveal delay={200} className="order-2 md:order-1">
              <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl border border-green-100 shadow-lg group">
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
                    <div key={i} className="bg-surface rounded-xl p-4 text-center border border-border">
                      <p className="text-xl font-bold text-foreground">{item.label}</p>
                      <p className="text-caption text-foreground-subtle mt-0.5">{item.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={100} className="order-1 md:order-2">
              <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border h-full flex flex-col shadow-card">
                <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mb-5">
                  <Apple className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-h3 font-serif text-foreground mb-3">신선한 과일로 전하는 정성</h3>
                <p className="text-body text-foreground-muted leading-relaxed mb-4">
                  프레시 네이쳐는 국내산 제철 과일부터 엄선된 수입과일까지 모든 종류의 과일을 합리적인 가격에 공급하는 과일 전문 스토어입니다. 교회 모임, 행사, 예배 후 친교 시간을 신선한 과일로 풍성하게 채워보세요.
                </p>

                <div className="bg-surface-2 rounded-xl p-5 border border-border mb-5 space-y-3">
                  <p className="text-meta font-bold text-foreground-subtle flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    사역 활용 아이디어
                  </p>
                  <ul className="space-y-2">
                    {['예배 후 친교 간식', '행사·세미나 다과 준비', '절기별 선물용 과일', '수련회·캠프 간식 준비'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-meta text-foreground-muted">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400/60 shrink-0" />
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
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-meta transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <Store className="w-4 h-4" />
                    스토어 바로가기
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ════════════════════════════════════════════
          5. 자발적 후원
         ════════════════════════════════════════════ */}
      <section className="bg-surface/50 border-y border-border">
        <DonationSection />
      </section>

      {/* ════════════════════════════════════════════
          6. 큐레이션 — 상황별 추천
         ════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20">
        <Container maxWidth="list">
          <Reveal className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 text-caption font-bold text-foreground-subtle uppercase tracking-wider mb-3">
              <span className="w-8 h-px bg-border" />
              CURATION
              <span className="w-8 h-px bg-border" />
            </div>
            <h2 className="font-serif text-h1 text-foreground">상황별 추천 아이디어</h2>
            <p className="text-body text-foreground-muted mt-2">당신의 상황에 맞는 쇼핑을 제안합니다</p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-list mx-auto">
            {[
              {
                icon: Gift, title: '교사 감사 선물',
                desc: '레터링 캔커피로 마음을 전하세요',
                store: '거창한벙커',
                colors: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: 'bg-amber-100 text-amber-600' },
              },
              {
                icon: Users, title: '친교 간식',
                desc: '신선한 과일로 예배 후를 풍성하게',
                store: '프레시 네이쳐',
                colors: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: 'bg-green-100 text-green-600' },
              },
              {
                icon: Church, title: '절기 행사',
                desc: '과일과 커피로 특별한 날을 장식',
                store: '두 스토어 모두',
                colors: { bg: 'bg-accent-soft', text: 'text-accent', border: 'border-accent-muted', icon: 'bg-accent-muted text-accent' },
              },
              {
                icon: Heart, title: '답례품',
                desc: '수제 캔커피는 언제나 옳은 선택',
                store: '거창한벙커',
                colors: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: 'bg-rose-100 text-rose-600' },
              },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <Reveal key={i} delay={i * 100}>
                  <div className={`${item.colors.bg} rounded-2xl p-5 border ${item.colors.border} h-full flex flex-col items-center text-center hover:shadow-card-hover transition-all duration-300`}>
                    <div className={`w-10 h-10 rounded-xl ${item.colors.icon} flex items-center justify-center mb-3`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-meta font-bold text-foreground mb-1">{item.title}</h3>
                    <p className="text-caption text-foreground-muted leading-relaxed mb-3">{item.desc}</p>
                    <span className={`text-caption font-bold ${item.colors.text} mt-auto`}>
                      {item.store}
                    </span>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </Container>
      </section>

      {/* ════════════════════════════════════════════
          7. 계속 무료
         ════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-foreground via-foreground to-foreground/95 text-white">
        <Container className="text-center" maxWidth="list">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-accent-soft text-sm font-semibold mb-6 border border-white/10">
              <Sparkles className="w-4 h-4" />
              계속 무료입니다
            </div>
            <h2 className="font-serif text-h1 sm:text-[2.5rem] font-bold leading-tight mb-4">
              당신의 쇼핑이<br />
              <span className="text-accent-soft">모든 서비스를 무료로</span> 유지합니다
            </h2>
            <p className="text-body text-white/70 leading-relaxed max-w-md mx-auto mb-8">
              큐티 자료 · 템플릿 · 큐레이션<br />
              모든 콘텐츠를 계속 무료로 제공합니다.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* ════════════════════════════════════════════
          8. CTA
         ════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20">
        <Container maxWidth="content">
          <Reveal>
            <div className="bg-surface rounded-2xl p-8 sm:p-10 border border-border shadow-elevated text-center space-y-6">
              <div className="w-12 h-12 rounded-full bg-accent-soft mx-auto flex items-center justify-center">
                <Heart className="w-6 h-6 text-accent" />
              </div>
              <div className="space-y-2">
                <h2 className="font-serif text-h1 text-foreground">지금 쇼핑하고 후원에 참여하세요</h2>
                <p className="text-body text-foreground-muted max-w-sm mx-auto leading-relaxed">
                  당신의 일상적인 소비가 사역을 가볍게 하고,<br />
                  다음 세대 신앙교육의 든든한 기반이 됩니다.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href="https://smartstore.naver.com/geochangbunker/products/4551068056"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-meta transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg w-full sm:w-auto justify-center"
                >
                  <Coffee className="w-4 h-4" />
                  거창한벙커 쇼핑하기
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="https://smartstore.naver.com/roaster"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-meta transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg w-full sm:w-auto justify-center"
                >
                  <Apple className="w-4 h-4" />
                  프레시 네이쳐 쇼핑하기
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
              <p className="text-caption text-foreground-subtle">
                네이버 스마트스토어에서 바로 구매하실 수 있습니다
              </p>
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  )
}
