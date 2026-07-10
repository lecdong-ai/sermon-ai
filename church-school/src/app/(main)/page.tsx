'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Sparkles, Download, Check, Users, Heart, HandHeart,
  MessageSquare, BookOpen, CalendarHeart, Presentation, FolderKanban,
  ChevronDown, UserCheck, GraduationCap, Handshake,
} from 'lucide-react';

/* ─── 스크롤 트리거 래퍼 ─── */
function Reveal({
  children, className = '', stagger = false, delay = 0,
}: { children: React.ReactNode; className?: string; stagger?: boolean; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${stagger ? 'reveal-stagger' : 'reveal'} ${visible ? 'revealed' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/* ─── 데이터 ─── */

const HERO_STATS = [
  { label: '함께 만드는 실무 자료', value: '30+', icon: FolderKanban },
  { label: '사역 참여 역할', value: '4+', icon: Users },
  { label: '즉시 사용 무료 자료', value: '14개', icon: Download },
];

const PAIN_TOGETHER = [
  { alone: '공지문을 혼자 쓰느라 밤을 새운다', together: 'AI가 초안을 만들면, 남은 시간은 사람에게', icon: MessageSquare },
  { alone: '행사 접수를 수기로 정리한다', together: 'QR 체크인과 자동 명단으로 실시간 확인', icon: CalendarHeart },
  { alone: '설교 PPT를 매주 처음부터 만든다', together: '템플릿과 AI 생성으로 빈 칸만 채우면 완성', icon: Presentation },
  { alone: '성경 공부 자료를 혼자 찾는다', together: '설교 하나로 요약·토론·카드뉴스까지 한 번에', icon: BookOpen },
];

const FEATURES = [
  {
    title: 'AI 공지문 작성기',
    desc: '상황·대상·말투만 선택하면 카카오톡용 공지문을 즉시 생성. 학부모 소통의 첫 단추를 가볍게.',
    icon: MessageSquare, color: 'text-mint-600', bg: 'bg-mint-50', href: '/notice-writer',
    tag: '소통',
  },
  {
    title: '설교 워크스페이스',
    desc: '설교를 업로드하면 요약·소그룹 토론 질문·설교 원고·숏폼 대본·카드뉴스까지 한 번에 생성.',
    icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-50', href: '/workspace',
    tag: '성장',
  },
  {
    title: 'PPT 스튜디오',
    desc: 'AI가 설교 내용을 10가지 레이아웃 슬라이드로 배치. 템플릿 색상·폰트 자동 적용, PPTX 다운로드.',
    icon: Presentation, color: 'text-navy-600', bg: 'bg-navy-50', href: '/ppt-studio',
    tag: '준비',
  },
  {
    title: '행사 신청 시스템',
    desc: '맞춤 필드·QR 체크인·형제자매 자동완성·CSV 내보내기. 접수부터 당일까지 한 흐름으로.',
    icon: CalendarHeart, color: 'text-rose-600', bg: 'bg-rose-50', href: '/events/manage',
    tag: '운영',
  },
  {
    title: '설교 프로젝트',
    desc: '성경연구→설교준비→원고작성→연결보기까지 6단계 스튜디오. AI 초안과 버전 히스토리로 깊이 있게.',
    icon: FolderKanban, color: 'text-indigo-600', bg: 'bg-indigo-50', href: '/projects',
    tag: '깊이',
  },
];

const FREE_ITEMS = [
  { title: '학부모 공지문 샘플 10종', desc: '절기 안내, 개학, 수련회 등 가장 많이 쓰는 공지문 모음', size: 'PDF / HWP', count: '1,205회' },
  { title: '신입교사 체크리스트 & 가이드', desc: '신임 교사가 부서에 왔을 때 챙겨야 할 10가지 실무 지침', size: 'PDF / DOCX', count: '980회' },
  { title: '운영문서 필수 샘플 3종', desc: '예배 순서지, 연간계획 양식, 기본 지출 결의서', size: 'XLSX / PPTX', count: '670회' },
];

const ROLE_PLANS = [
  {
    role: '목회자 · 사역자', icon: GraduationCap, plan: '월 구독', price: '₩9,900/월',
    desc: '전체 자료 무제한 + AI 공지문 무제한. 부서 운영 전반을 한 도구로.',
    features: ['유료 자료실 전수 다운로드', 'AI 공지문 무제한', '매월 신규 콘텐츠', '1:1 서식 제작 요청권'],
    badge: '추천', highlight: true,
  },
  {
    role: '교사 · 봉사자', icon: HandHeart, plan: '무료 플랜', price: '₩0',
    desc: '가벼운 시작. 무료 자료와 하루 3회 공지문으로 먼저 경험해보세요.',
    features: ['무료 자료 자유 다운로드', '하루 3회 공지문 작성', '워크스페이스 저장'],
    badge: '', highlight: false,
  },
  {
    role: '절기 담당자', icon: UserCheck, plan: '단건 구매', price: '자료별',
    desc: '구독 부담 없이 필요한 절기 자료만. 평생 영구 소장.',
    features: ['개별 자료 영구 보관', '하루 10회 공지문', '구매 자료 업데이트 평생'],
    badge: '', highlight: false,
  },
];

/* ─── 페이지 ─── */
export default function HomePage() {
  return (
    <div className="bg-warm-50 min-h-screen">

      {/* ═══════════════ 1. HERO ═══════════════ */}
      <section className="relative overflow-hidden gradient-navy text-white py-20 md:py-32">
        {/* 떠다니는 장식 요소 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-mint-500/10 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-indigo-500/8 rounded-full blur-3xl animate-float-slow" />
        </div>

        <div className="container-custom relative z-10 text-center max-w-4xl mx-auto">
          {/* 뱃지 */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs md:text-sm text-mint-300 mb-6 font-semibold animate-fade-in">
            <Sparkles className="w-4 h-4" />
            목회자 · 사역자 · 교사 · 봉사자가 한 팀으로
          </div>

          {/* 메인 슬로건 */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight animate-fade-up">
            함께 섬기고,<br />
            <span className="text-gradient-flow bg-gradient-to-r from-mint-300 via-mint-400 to-orange-300 bg-clip-text text-transparent">
              함께 자라는 교회학교
            </span>
          </h1>

          {/* 보조 설명 */}
          <p className="text-base sm:text-lg md:text-xl text-navy-200 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-up" style={{ animationDelay: '0.15s' }}>
            공지문 작성부터 행사 신청 접수, 설교 PPT와 카드뉴스까지 —<br />
            매주 반복되는 실무를 AI와 검증된 템플릿으로 덜어드립니다.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Link href="/notice-writer" className="btn-lg w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-navy-900 font-semibold rounded-xl shadow-button hover:bg-warm-100 transition-all duration-200 hover:-translate-y-0.5">
              <Sparkles className="w-5 h-5" />
              공지문 만들어보기
            </Link>
            <Link href="/workspace" className="btn-secondary btn-lg w-full sm:w-auto group">
              워크스페이스 둘러보기
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto border-t border-white/10 pt-8 animate-fade-up" style={{ animationDelay: '0.45s' }}>
            {HERO_STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="text-center">
                  <Icon className="w-5 h-5 text-mint-400/60 mx-auto mb-2" />
                  <div className="text-xl sm:text-3xl font-extrabold text-mint-400">{stat.value}</div>
                  <div className="text-xs text-navy-300 mt-1">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 스크롤 인디케이터 */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1">
          <span className="text-[10px] text-navy-300 font-medium">아래로</span>
          <ChevronDown className="w-4 h-4 text-mint-300 scroll-indicator" />
        </div>

        {/* 웨이브 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 35C840 40 960 50 1080 52.5C1200 55 1320 50 1380 47.5L1440 45V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" fill="#FAFAF8" />
          </svg>
        </div>
      </section>

      {/* ═══════════════ 2. 혼자 → 함께 ═══════════════ */}
      <section className="section bg-warm-50">
        <div className="container-custom max-w-4xl">
          <Reveal className="text-center mb-14">
            <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">혼자에서 함께로</span>
            <h2 className="section-title mt-2">혼자 짊어지던 실무, 이제 함께 나눕니다</h2>
            <p className="section-subtitle mx-auto">혼자서 전부 하려는 사역이 아니라, 도구가 덜어주는 사역.</p>
          </Reveal>

          <Reveal stagger className="space-y-4">
            {PAIN_TOGETHER.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="card-flat p-5 md:p-6 bg-white border border-warm-200 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                  {/* 혼자 */}
                  <div className="flex-1 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-warm-100 text-navy-400 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold line-through opacity-50">혼자</span>
                    </div>
                    <p className="text-sm text-navy-400 line-through decoration-navy-300/50 leading-relaxed pt-1.5">{item.alone}</p>
                  </div>
                  {/* 화살표 */}
                  <div className="flex md:flex-col items-center justify-center gap-1 text-mint-500">
                    <ArrowRight className="w-5 h-5 rotate-90 md:rotate-0" />
                  </div>
                  {/* 함께 */}
                  <div className="flex-1 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-mint-50 text-mint-600 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="text-sm text-navy-800 font-medium leading-relaxed pt-1.5">{item.together}</p>
                  </div>
                </div>
              );
            })}
          </Reveal>
        </div>
      </section>

      {/* ═══════════════ 3. 5대 기능 ═══════════════ */}
      <section className="section bg-white border-y border-warm-100">
        <div className="container-custom">
          <Reveal className="text-center mb-14">
            <span className="text-xs font-bold text-mint-600 uppercase tracking-wider">함께하는 실무</span>
            <h2 className="section-title mt-2">한 팀이 쓰는 다섯 가지 도구</h2>
            <p className="section-subtitle mx-auto">역할이 달라도 같은 도구에서 시작하면, 소통과 협업이 자연스럽게 이어집니다.</p>
          </Reveal>

          <Reveal stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {FEATURES.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <Link
                  key={i}
                  href={feat.href}
                  className="card p-6 bg-white border border-warm-200/50 flex flex-col group hover:-translate-y-1 transition-transform duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${feat.bg} ${feat.color} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${feat.bg} ${feat.color}`}>
                      {feat.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-navy-900 mb-2">{feat.title}</h3>
                  <p className="text-xs text-navy-500 leading-relaxed mb-4 flex-1">{feat.desc}</p>
                  <span className={`text-xs font-bold ${feat.color} flex items-center gap-1 group-hover:gap-2 transition-all`}>
                    바로가기 <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              );
            })}

            {/* 여섯 번째 카드: 공동체 CTA */}
            <div className="card p-6 bg-gradient-to-br from-navy-900 to-navy-800 text-white flex flex-col justify-center items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-mint-500/10 rounded-full blur-2xl animate-pulse-glow" />
              <Handshake className="w-8 h-8 text-mint-300 mb-3" />
              <h3 className="text-base font-bold mb-2">함께하는 사역의 시작</h3>
              <p className="text-xs text-navy-200 leading-relaxed mb-4">
                한 번의 가입으로 모든 도구를 함께 쓸 수 있습니다.
              </p>
              <Link href="/pricing" className="text-xs font-bold text-mint-300 hover:text-mint-200 flex items-center gap-1.5">
                요금제 보기 <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════ 4. 공지문 작성기 데모 ═══════════════ */}
      <section className="section bg-warm-50">
        <div className="container-custom max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <Reveal className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold text-mint-600 uppercase tracking-wider">AI 공지문 작성기</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-navy-900 leading-tight">
                단 몇 초 만에<br />공지문 완성
              </h2>
              <p className="text-xs md:text-sm text-navy-500 leading-relaxed">
                상황, 대상, 말투만 선택하면 맞춤형 공지문 시안을 즉시 생성합니다. 학부모 소통의 첫 단추를 가볍게 끼워보세요.
              </p>
              <div className="pt-2">
                <Link href="/notice-writer" className="btn-secondary btn-sm group">
                  작성기 사용해보기
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </Reveal>

            <Reveal delay={150} className="lg:col-span-7 bg-warm-50 rounded-2xl p-6 border border-warm-200 space-y-4">
              <div className="text-xs font-bold text-navy-600 border-b border-warm-200 pb-2">작성기 동작 예시</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white rounded-lg p-2.5 text-center text-[10px] font-bold text-navy-800 border border-warm-200">
                  <span className="text-navy-400 block font-normal">상황</span>
                  행사 안내
                </div>
                <div className="bg-white rounded-lg p-2.5 text-center text-[10px] font-bold text-navy-800 border border-warm-200">
                  <span className="text-navy-400 block font-normal">대상</span>
                  학부모 대상
                </div>
                <div className="bg-white rounded-lg p-2.5 text-center text-[10px] font-bold text-navy-800 border border-warm-200">
                  <span className="text-navy-400 block font-normal">톤</span>
                  따뜻한 어조
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-warm-200 text-[11px] text-navy-800 leading-relaxed font-sans shadow-sm whitespace-pre-line">
                {`사랑하는 학부모님께,\n\n주일 아침이 더욱 풍성해지는 교회학교 절기 예배가 이번 주에 준비되어 있습니다. 귀한 자녀들의 걸음이 은혜의 자리로 향할 수 있도록 기도와 격려로 동행해 주시기 바랍니다.\n\n📅 일시: 이번 주 주일 오전 11시\n📍 장소: 본당 2층 교육관\n\n예배 후 다과 교제도 있으니 늦지 않게 모이도록 챙겨주세요!`}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════ 5. 무료 자료 ═══════════════ */}
      <section className="section bg-white border-y border-warm-100">
        <div className="container-custom">
          <Reveal className="text-center mb-12">
            <span className="text-xs font-bold text-mint-600 uppercase tracking-wider">무료 리소스</span>
            <h2 className="section-title mt-2">지금 바로 사용할 수 있는 인기 자료</h2>
            <p className="section-subtitle mx-auto">가입 즉시 워크스페이스에 저장하여 바로 활용할 수 있습니다.</p>
          </Reveal>

          <Reveal stagger className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
            {FREE_ITEMS.map((item, i) => (
              <div key={i} className="card-flat p-6 bg-warm-50 border border-warm-200 flex flex-col justify-between group hover:-translate-y-1 transition-transform duration-300">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="badge-free">FREE</span>
                    <span className="text-[10px] text-navy-400 font-bold">{item.size}</span>
                  </div>
                  <h3 className="text-base font-bold text-navy-900 mb-1">{item.title}</h3>
                  <p className="text-xs text-navy-500 leading-relaxed mb-4">{item.desc}</p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-warm-100">
                  <span className="text-[10px] text-navy-400 flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" />
                    {item.count}
                  </span>
                  <Link href="/pricing" className="text-xs font-bold text-mint-600 hover:underline">
                    받기
                  </Link>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ═══════════════ 6. 역할별 요금제 ═══════════════ */}
      <section className="section bg-warm-50">
        <div className="container-custom">
          <Reveal className="text-center mb-12">
            <span className="text-xs font-bold text-navy-400 uppercase tracking-wider">역할에 맞는 선택</span>
            <h2 className="section-title mt-2">함께하는 사역, 함께하는 선택</h2>
            <p className="section-subtitle mx-auto">사역의 규모와 주기에 맞춰 자유롭게 선택하세요.</p>
          </Reveal>

          <Reveal stagger className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {ROLE_PLANS.map((plan, i) => {
              const Icon = plan.icon;
              return (
                <div
                  key={i}
                  className={`card-flat p-6 text-center relative ${plan.highlight ? 'bg-white border-2 border-mint-400' : 'bg-white border border-warm-200'}`}
                >
                  {plan.badge && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-mint-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  )}
                  <div className={`w-12 h-12 rounded-full ${plan.highlight ? 'bg-mint-50 text-mint-600' : 'bg-warm-100 text-navy-500'} flex items-center justify-center mx-auto mb-3 transition-transform hover:scale-110 duration-300`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-navy-400 uppercase tracking-wide">{plan.role}</h3>
                  <p className="text-xl font-extrabold text-navy-950 mt-2">{plan.price}</p>
                  <p className="text-[10px] text-navy-400 mt-1">{plan.plan}</p>
                  <p className="text-[11px] text-navy-500 leading-relaxed mt-3 mb-4">{plan.desc}</p>
                  <ul className="text-[11px] text-navy-600 space-y-2 my-4 text-left pl-2">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-mint-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/pricing"
                    className={`${plan.highlight ? 'btn-secondary' : 'btn-outline'} btn-sm w-full`}
                  >
                    {plan.highlight ? '구독 시작하기' : '자세히 보기'}
                  </Link>
                </div>
              );
            })}
          </Reveal>

          <Reveal delay={200} className="text-center mt-8">
            <p className="text-xs text-navy-400">
              <Handshake className="w-3.5 h-3.5 inline mr-1 text-mint-500" />
              교회 전체 도입(단체 플랜)도 준비 중입니다.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════ 7. FINAL CTA ═══════════════ */}
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-navy-950 to-navy-900 text-white text-center overflow-hidden">
        {/* 떠다니는 장식 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-mint-500/8 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-orange-500/8 rounded-full blur-3xl animate-float" />
        </div>

        <Reveal className="container-custom max-w-xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 text-mint-300 mb-2">
            <Heart className="w-5 h-5" />
            <span className="text-sm font-semibold">함께 섬기고, 함께 자라는 교회학교</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            지금 함께 시작하세요
          </h2>
          <p className="text-sm md:text-base text-navy-300 leading-relaxed max-w-md mx-auto">
            무료 자료로 먼저 경험하고, AI 공지문으로 매주의 소통을 가볍게 만들어보세요.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link href="/notice-writer" className="btn-lg w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-navy-900 font-semibold rounded-xl shadow-button hover:bg-warm-100 transition-all duration-200 hover:-translate-y-0.5">
              <Sparkles className="w-5 h-5" />
              공지문 만들어보기
            </Link>
            <Link href="/pricing" className="btn-outline border-white/20 text-white hover:bg-white/10 w-full sm:w-auto">
              요금제 보기
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
