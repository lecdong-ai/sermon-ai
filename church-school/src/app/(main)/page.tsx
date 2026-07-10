'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Sparkles, Download, Check, Users, Heart,
  MessageSquare, BookOpen, CalendarHeart, Presentation, FolderKanban,
  ChevronDown, UserCheck, GraduationCap, Handshake, Bell, Wand2,
  ClipboardList, QrCode, Layers, PenLine,
} from 'lucide-react';

/* ════════════════════════════════════════════
   애니메이션 컴포넌트
   ════════════════════════════════════════════ */

/** 스크롤 트리거 리빌 */
function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.unobserve(el); }
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${vis ? 'revealed' : ''} ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}

/** 순차 자식 리빌 */
function RevealStagger({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.unobserve(el); }
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className={`reveal-stagger ${vis ? 'revealed' : ''} ${className}`}>{children}</div>;
}

/** 카운트업 숫자 */
function CountUp({ end, suffix = '', duration = 1600 }: { end: number; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = Date.now();
        const tick = () => {
          const p = Math.min((Date.now() - t0) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(Math.floor(eased * end));
          if (p < 1) requestAnimationFrame(tick);
          else setVal(end);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/** 타자 효과 */
function TypingText({ text, speed = 28, className = '' }: { text: string; speed?: number; className?: string }) {
  const [shown, setShown] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let i = 0;
        const id = setInterval(() => {
          if (i < text.length) { setShown(text.slice(0, i + 1)); i++; }
          else clearInterval(id);
        }, speed);
        return () => clearInterval(id);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [text, speed]);
  return (
    <div ref={ref} className={className}>
      {shown}
      <span className="cursor-blink text-mint-500">▎</span>
    </div>
  );
}

/* ════════════════════════════════════════════
   데이터
   ════════════════════════════════════════════ */

const ROLES = [
  { label: '목회자', icon: GraduationCap },
  { label: '사역자', icon: UserCheck },
  { label: '교사', icon: BookOpen },
  { label: '봉사자', icon: Handshake },
];

const STATS = [
  { label: '실무 자료 템플릿', value: 30, suffix: '+', icon: FolderKanban },
  { label: '사역 참여 역할', value: 4, suffix: '+', icon: Users },
  { label: '즉시 무료 자료', value: 14, suffix: '개', icon: Download },
];

const TRANSFORM = [
  { alone: '공지문을 혼자 쓰느라 밤을 새운다', together: 'AI가 초안을 만들면, 남은 시간은 사람에게', icon: MessageSquare, color: 'mint' },
  { alone: '행사 접수를 수기로 정리한다', together: 'QR 체크인과 자동 명단으로 실시간 확인', icon: CalendarHeart, color: 'rose' },
  { alone: '설교 PPT를 매주 처음부터 만든다', together: '템플릿과 AI 생성으로 빈 칸만 채우면 완성', icon: Presentation, color: 'orange' },
  { alone: '성경 공부 자료를 혼자 찾는다', together: '설교 하나로 요약·토론·카드뉴스까지 한 번에', icon: BookOpen, color: 'indigo' },
];

const FEATURES = [
  {
    title: 'AI 공지문 작성기',
    desc: '상황·대상·말투만 선택하면 카카오톡용 공지문을 즉시 생성. 학부모 소통의 첫 단추를 가볍게.',
    icon: Wand2, color: 'mint', bg: 'bg-mint-50', href: '/notice-writer', tag: '소통',
    large: true,
  },
  {
    title: '설교 워크스페이스',
    desc: '설교 업로드 하나로 요약·토론질문·원고·숏폼·카드뉴스까지.',
    icon: Layers, color: 'orange', bg: 'bg-orange-50', href: '/workspace', tag: '성장',
  },
  {
    title: 'PPT 스튜디오',
    desc: 'AI가 10가지 레이아웃으로 슬라이드 배치. 템플릿 색상·폰트 자동 적용.',
    icon: Presentation, color: 'navy', bg: 'bg-navy-50', href: '/ppt-studio', tag: '준비',
  },
  {
    title: '행사 신청 시스템',
    desc: '맞춤 필드·QR 체크인·형제자매 자동완성·CSV 내보내기.',
    icon: QrCode, color: 'rose', bg: 'bg-rose-50', href: '/events/manage', tag: '운영',
  },
  {
    title: '설교 프로젝트',
    desc: '성경연구→준비→작성→연결보기. 6단계 스튜디오 + AI 초안.',
    icon: PenLine, color: 'indigo', bg: 'bg-indigo-50', href: '/projects', tag: '깊이',
  },
];

const FREE_ITEMS = [
  { title: '학부모 공지문 샘플 10종', desc: '절기 안내, 개학, 수련회 등 가장 많이 쓰는 공지문 모음', size: 'PDF / HWP', count: '1,205회' },
  { title: '신입교사 체크리스트 & 가이드', desc: '신임 교사가 부서에 왔을 때 챙겨야 할 10가지 실무 지침', size: 'PDF / DOCX', count: '980회' },
  { title: '운영문서 필수 샘플 3종', desc: '예배 순서지, 연간계획 양식, 기본 지출 결의서', size: 'XLSX / PPTX', count: '670회' },
];

const PLANS = [
  {
    role: '교사 · 봉사자', icon: Heart, plan: '무료 플랜', price: '₩0',
    desc: '가벼운 시작. 무료 자료와 하루 3회 공지문으로 먼저 경험하세요.',
    features: ['무료 자료 자유 다운로드', '하루 3회 공지문 작성', '워크스페이스 저장'],
    highlight: false,
  },
  {
    role: '목회자 · 사역자', icon: GraduationCap, plan: '월 구독', price: '₩9,900/월',
    desc: '전체 자료 무제한 + AI 공지문 무제한. 부서 운영 전반을 한 도구로.',
    features: ['유료 자료실 전수 다운로드', 'AI 공지문 무제한', '매월 신규 콘텐츠', '1:1 서식 제작 요청권'],
    highlight: true,
  },
  {
    role: '절기 담당자', icon: ClipboardList, plan: '단건 구매', price: '자료별',
    desc: '구독 부담 없이 필요한 절기 자료만. 평생 영구 소장.',
    features: ['개별 자료 영구 보관', '하루 10회 공지문', '구매 자료 업데이트 평생'],
    highlight: false,
  },
];

const NOTICE_EXAMPLE = `사랑하는 학부모님께,

주일 아침이 더욱 풍성해지는 교회학교 절기 예배가 이번 주에 준비되어 있습니다. 귀한 자녀들의 걸음이 은혜의 자리로 향할 수 있도록 기도와 격려로 동행해 주시기 바랍니다.

📅 일시: 이번 주 주일 오전 11시
📍 장소: 본당 2층 교육관

예배 후 다과 교제도 있으니 늦지 않게 모이도록 챙겨주세요!`;

/* ════════════════════════════════════════════
   색상 헬퍼
   ════════════════════════════════════════════ */
const COLOR_MAP: Record<string, { text: string; bg: string; ring: string; glow: string }> = {
  mint: { text: 'text-mint-600', bg: 'bg-mint-50', ring: 'ring-mint-200', glow: 'shadow-[0_0_30px_rgba(46,196,182,0.12)]' },
  orange: { text: 'text-orange-600', bg: 'bg-orange-50', ring: 'ring-orange-200', glow: 'shadow-[0_0_30px_rgba(255,107,53,0.12)]' },
  navy: { text: 'text-navy-600', bg: 'bg-navy-50', ring: 'ring-navy-200', glow: 'shadow-[0_0_30px_rgba(27,42,74,0.1)]' },
  rose: { text: 'text-rose-600', bg: 'bg-rose-50', ring: 'ring-rose-200', glow: 'shadow-[0_0_30px_rgba(244,63,94,0.1)]' },
  indigo: { text: 'text-indigo-600', bg: 'bg-indigo-50', ring: 'ring-indigo-200', glow: 'shadow-[0_0_30px_rgba(99,102,241,0.1)]' },
};

/* ════════════════════════════════════════════
   페이지
   ════════════════════════════════════════════ */
export default function HomePage() {
  return (
    <div className="bg-warm-50 min-h-screen overflow-x-hidden">

      {/* ════════════════════════════════════════════
         1. HERO — 오로라 배경 + 카운트업
         ════════════════════════════════════════════ */}
      <section className="relative overflow-hidden gradient-navy text-white py-24 md:py-36">
        {/* 오로라 오브 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-15%] right-[-5%] w-[500px] h-[500px] bg-mint-500/15 rounded-full blur-[120px] aurora-orb" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[450px] h-[450px] bg-orange-500/12 rounded-full blur-[110px] aurora-orb" style={{ animationDelay: '3s' }} />
          <div className="absolute top-[30%] left-[40%] w-[350px] h-[350px] bg-indigo-500/8 rounded-full blur-[100px] aurora-orb" style={{ animationDelay: '6s' }} />
        </div>

        {/* 그리드 패턴 오버레이 */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />

        <div className="container-custom relative z-10 text-center max-w-4xl mx-auto">
          {/* 글래스 뱃지 */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs md:text-sm text-mint-300 mb-8 font-semibold animate-fade-in">
            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-mint-400 pulse-ring" />
              <span className="relative w-2 h-2 rounded-full bg-mint-400" />
            </span>
            목회자 · 사역자 · 교사 · 봉사자가 한 팀으로
          </div>

          {/* 메인 슬로건 */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-7 tracking-tight animate-fade-up">
            함께 섬기고,
            <br />
            <span className="text-gradient-flow bg-gradient-to-r from-mint-300 via-orange-300 to-mint-300 bg-clip-text text-transparent">
              함께 자라는 교회학교
            </span>
          </h1>

          {/* 보조 문구 */}
          <p className="text-base sm:text-lg md:text-xl text-navy-200 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-up" style={{ animationDelay: '0.15s' }}>
            공지문 작성부터 행사 신청 접수, 설교 PPT와 카드뉴스까지 —
            <br />
            매주 반복되는 실무를 AI와 검증된 템플릿으로 덜어드립니다.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-20 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Link
              href="/notice-writer"
              className="group btn-lg w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-navy-900 font-bold rounded-2xl shadow-card-hover hover:bg-warm-50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(46,196,182,0.25)]"
            >
              <Sparkles className="w-5 h-5 text-mint-500 group-hover:rotate-12 transition-transform" />
              공지문 만들어보기
            </Link>
            <Link
              href="/workspace"
              className="group btn-lg w-full sm:w-auto inline-flex items-center justify-center gap-2 glass text-white font-semibold rounded-2xl hover:bg-white/15 transition-all duration-300 hover:-translate-y-0.5"
            >
              워크스페이스 둘러보기
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>

          {/* 통계 — 카운트업 */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto border-t border-white/10 pt-10 animate-fade-up" style={{ animationDelay: '0.45s' }}>
            {STATS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="text-center group">
                  <div className="w-10 h-10 mx-auto mb-3 rounded-xl glass flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-5 h-5 text-mint-300" />
                  </div>
                  <div className="text-2xl sm:text-4xl font-extrabold text-white">
                    <CountUp end={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-[11px] sm:text-xs text-navy-300 mt-1.5 font-medium">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 스크롤 인디케이터 */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1.5 z-10">
          <span className="text-[10px] text-navy-300/60 font-medium tracking-wider">SCROLL</span>
          <div className="w-6 h-10 rounded-full border-2 border-white/15 flex items-start justify-center p-1.5">
            <div className="w-1 h-2 rounded-full bg-mint-400 scroll-indicator" />
          </div>
        </div>

        {/* 웨이브 */}
        <div className="absolute bottom-0 left-0 right-0 z-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 35C840 40 960 50 1080 52.5C1200 55 1320 50 1380 47.5L1440 45V60H0Z" fill="#FAFAF8" />
          </svg>
        </div>
      </section>

      {/* ════════════════════════════════════════════
         2. 트러스트 스트립 — 역할 표시
         ════════════════════════════════════════════ */}
      <section className="bg-white border-b border-warm-100 py-7">
        <div className="container-custom">
          <Reveal className="text-center">
            <p className="text-xs text-navy-400 mb-5 font-semibold tracking-wide">한 팀으로 섬기는 모든 분들을 위해</p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 md:gap-x-16">
              {ROLES.map((r, i) => {
                const Icon = r.icon;
                return (
                  <div key={i} className="flex items-center gap-2.5 text-navy-700 hover:text-mint-600 transition-colors cursor-default group">
                    <div className="w-9 h-9 rounded-xl bg-warm-50 flex items-center justify-center group-hover:bg-mint-50 transition-colors">
                      <Icon className="w-4.5 h-4.5 text-navy-500 group-hover:text-mint-500 transition-colors" />
                    </div>
                    <span className="text-sm font-bold">{r.label}</span>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
         3. 혼자 → 함께 변환
         ════════════════════════════════════════════ */}
      <section className="section bg-warm-50">
        <div className="container-custom max-w-5xl">
          <Reveal className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-500 uppercase tracking-wider mb-3">
              <span className="w-8 h-px bg-orange-300" />
              혼자에서 함께로
              <span className="w-8 h-px bg-orange-300" />
            </span>
            <h2 className="section-title">혼자 짊어지던 실무, 이제 함께 나눕니다</h2>
            <p className="section-subtitle mx-auto">도구가 덜어주는 사역. 혼자서 전부 하려는 것이 아닙니다.</p>
          </Reveal>

          <div className="space-y-5">
            {TRANSFORM.map((item, i) => {
              const Icon = item.icon;
              const c = COLOR_MAP[item.color];
              return (
                <Reveal key={i} delay={i * 80}>
                  <div className="card-flat bg-white border border-warm-200 rounded-2xl overflow-hidden hover:shadow-card transition-shadow duration-300">
                    <div className="flex flex-col md:flex-row">
                      {/* 혼자 — 왼쪽 */}
                      <div className="flex-1 p-5 md:p-6 flex items-center gap-4 bg-warm-50/50">
                        <div className="w-10 h-10 rounded-xl bg-warm-100 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-warm-400">혼자</span>
                        </div>
                        <p className="text-sm text-navy-400 line-through decoration-warm-300/60 leading-relaxed">{item.alone}</p>
                      </div>

                      {/* 화살표 */}
                      <div className="flex items-center justify-center px-4 bg-gradient-to-r from-warm-50/50 to-white">
                        <div className={`w-10 h-10 rounded-full ${c.bg} ${c.text} flex items-center justify-center`}>
                          <ArrowRight className="w-5 h-5 rotate-90 md:rotate-0" />
                        </div>
                      </div>

                      {/* 함께 — 오른쪽 */}
                      <div className={`flex-1 p-5 md:p-6 flex items-center gap-4 ${c.bg}/30`}>
                        <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.text} flex items-center justify-center shrink-0 icon-rotate-hover`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <p className="text-sm text-navy-800 font-semibold leading-relaxed">{item.together}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
         4. 벤토 기능 그리드
         ════════════════════════════════════════════ */}
      <section className="section bg-white border-y border-warm-100">
        <div className="container-custom">
          <Reveal className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-mint-600 uppercase tracking-wider mb-3">
              <span className="w-8 h-px bg-mint-300" />
              함께하는 실무
              <span className="w-8 h-px bg-mint-300" />
            </span>
            <h2 className="section-title">한 팀이 쓰는 다섯 가지 도구</h2>
            <p className="section-subtitle mx-auto">역할이 달라도 같은 도구에서 시작하면, 소통과 협업이 자연스럽게 이어집니다.</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              const c = COLOR_MAP[f.color];
              const isLarge = f.large;
              return (
                <Reveal
                  key={i}
                  delay={i * 60}
                  className={isLarge ? 'md:col-span-2 lg:col-span-2' : ''}
                >
                  <Link
                    href={f.href}
                    className={`shine-hover group block h-full p-7 rounded-2xl border border-warm-200/60 bg-white hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 ${isLarge ? 'lg:flex lg:items-center lg:gap-8' : ''}`}
                  >
                    {/* 아이콘 */}
                    <div className={`w-14 h-14 rounded-2xl ${c.bg} ${c.text} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-[-6deg] transition-transform duration-400 ${isLarge ? 'lg:mb-0 lg:shrink-0' : ''}`}>
                      <Icon className="w-7 h-7" />
                    </div>

                    {/* 내용 */}
                    <div className={isLarge ? 'flex-1' : ''}>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`font-bold text-navy-900 ${isLarge ? 'text-lg' : 'text-base'}`}>{f.title}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>{f.tag}</span>
                      </div>
                      <p className={`text-navy-500 leading-relaxed ${isLarge ? 'text-sm' : 'text-xs'} ${isLarge ? 'max-w-md' : ''}`}>{f.desc}</p>
                      <span className={`inline-flex items-center gap-1 mt-4 text-xs font-bold ${c.text} group-hover:gap-2.5 transition-all`}>
                        바로가기 <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}

            {/* 공동체 CTA 카드 */}
            <Reveal delay={300}>
              <div className="h-full p-7 rounded-2xl bg-gradient-to-br from-navy-900 to-navy-800 text-white flex flex-col justify-center items-center text-center relative overflow-hidden shine-hover">
                <div className="absolute top-0 right-0 w-32 h-32 bg-mint-500/15 rounded-full blur-2xl animate-pulse-glow" />
                <div className="relative z-10">
                  <Handshake className="w-8 h-8 text-mint-300 mb-4" />
                  <h3 className="text-base font-bold mb-2">함께하는 사역의 시작</h3>
                  <p className="text-xs text-navy-200 leading-relaxed mb-5">한 번의 가입으로 모든 도구를 함께 쓸 수 있습니다.</p>
                  <Link href="/pricing" className="inline-flex items-center gap-1.5 text-xs font-bold text-mint-300 hover:text-mint-200 group">
                    요금제 보기 <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
         5. 공지문 작성기 데모 (타자 효과)
         ════════════════════════════════════════════ */}
      <section className="section bg-gradient-to-b from-warm-50 to-white">
        <div className="container-custom max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* 왼쪽 — 설명 */}
            <Reveal className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint-50 text-mint-600 text-xs font-bold">
                <Wand2 className="w-3.5 h-3.5" />
                AI 공지문 작성기
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-navy-900 leading-tight">
                단 몇 초 만에<br />
                <span className="text-gradient bg-gradient-to-r from-mint-500 to-orange-400 bg-clip-text text-transparent">공지문 완성</span>
              </h2>
              <p className="text-sm text-navy-500 leading-relaxed">
                상황, 대상, 말투만 선택하면 맞춤형 공지문 시안을 즉시 생성합니다. 학부모 소통의 첫 단추를 가볍게 끼워보세요.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {['환영', '결석', '행사', '알림', '감사', '교사'].map(t => (
                  <span key={t} className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white border border-warm-200 text-navy-500">{t}</span>
                ))}
              </div>
              <div className="pt-3">
                <Link href="/notice-writer" className="group btn-secondary btn-sm">
                  작성기 사용해보기
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </Reveal>

            {/* 오른쪽 — 목 앱 윈도우 */}
            <Reveal delay={200} className="lg:col-span-7">
              <div className="bg-white rounded-2xl shadow-card-hover border border-warm-200 overflow-hidden">
                {/* 윈도우 크롬 */}
                <div className="flex items-center gap-2 px-4 py-3 bg-warm-100 border-b border-warm-200">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-mint-400" />
                  </div>
                  <div className="flex-1 text-center text-[11px] text-navy-400 font-medium">공지문 작성기 — 미리보기</div>
                </div>

                {/* 입력 칩 */}
                <div className="px-6 pt-6 pb-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: '상황', value: '행사 안내' },
                      { label: '대상', value: '학부모 대상' },
                      { label: '톤', value: '따뜻한 어조' },
                    ].map((chip, ci) => (
                      <div key={ci} className="bg-warm-50 rounded-xl p-3 text-center border border-warm-200">
                        <div className="text-[10px] text-navy-400 font-medium mb-1">{chip.label}</div>
                        <div className="text-xs font-bold text-navy-800">{chip.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 결과 — 타자 효과 */}
                <div className="px-6 pb-6">
                  <div className="bg-warm-50 rounded-xl p-5 border border-warm-200 min-h-[200px]">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-warm-200">
                      <Bell className="w-3.5 h-3.5 text-mint-500" />
                      <span className="text-[11px] font-bold text-navy-600">생성된 공지문</span>
                      <span className="ml-auto text-[10px] text-mint-500 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> AI 생성
                      </span>
                    </div>
                    <TypingText
                      text={NOTICE_EXAMPLE}
                      speed={22}
                      className="text-[11px] text-navy-800 leading-relaxed whitespace-pre-line font-sans"
                    />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
         6. 무료 자료
         ════════════════════════════════════════════ */}
      <section className="section bg-white border-y border-warm-100">
        <div className="container-custom">
          <Reveal className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-mint-600 uppercase tracking-wider mb-3">
              <span className="w-8 h-px bg-mint-300" />
              무료 리소스
              <span className="w-8 h-px bg-mint-300" />
            </span>
            <h2 className="section-title">지금 바로 사용할 수 있는 인기 자료</h2>
            <p className="section-subtitle mx-auto">가입 즉시 저장하여 바로 활용할 수 있습니다.</p>
          </Reveal>

          <RevealStagger className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {FREE_ITEMS.map((item, i) => (
              <div
                key={i}
                className="shine-hover group p-6 bg-warm-50 rounded-2xl border border-warm-200 flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-card-hover hover:border-mint-200 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="badge-free">FREE</span>
                    <span className="text-[10px] text-navy-400 font-bold">{item.size}</span>
                  </div>
                  <h3 className="text-base font-bold text-navy-900 mb-2">{item.title}</h3>
                  <p className="text-xs text-navy-500 leading-relaxed">{item.desc}</p>
                </div>
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-warm-200">
                  <span className="text-[10px] text-navy-400 flex items-center gap-1 font-medium">
                    <Download className="w-3.5 h-3.5 group-hover:text-mint-500 transition-colors" />
                    {item.count}
                  </span>
                  <Link href="/pricing" className="text-xs font-bold text-mint-600 hover:text-mint-700 flex items-center gap-1 group-hover:gap-1.5 transition-all">
                    받기 <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* ════════════════════════════════════════════
         7. 역할별 요금제
         ════════════════════════════════════════════ */}
      <section className="section bg-warm-50">
        <div className="container-custom">
          <Reveal className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-400 uppercase tracking-wider mb-3">
              <span className="w-8 h-px bg-navy-200" />
              역할에 맞는 선택
              <span className="w-8 h-px bg-navy-200" />
            </span>
            <h2 className="section-title">함께하는 사역, 함께하는 선택</h2>
            <p className="section-subtitle mx-auto">사역의 규모와 주기에 맞춰 자유롭게 선택하세요.</p>
          </Reveal>

          <RevealStagger className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto items-stretch">
            {PLANS.map((plan, i) => {
              const Icon = plan.icon;
              return (
                <div
                  key={i}
                  className={`relative p-7 rounded-2xl text-center transition-all duration-300 hover:-translate-y-1 ${
                    plan.highlight
                      ? 'bg-white border-2 border-mint-400 glow-mint shadow-card-hover md:scale-105'
                      : 'bg-white border border-warm-200 hover:shadow-card'
                  }`}
                >
                  {plan.highlight && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-mint-500 to-mint-400 text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-button">
                      ★ 추천
                    </span>
                  )}
                  <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-transform hover:scale-110 duration-300 ${
                    plan.highlight ? 'bg-mint-50 text-mint-600' : 'bg-warm-50 text-navy-500'
                  }`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xs font-bold text-navy-400 uppercase tracking-wide">{plan.role}</h3>
                  <p className="text-2xl font-extrabold text-navy-950 mt-2">{plan.price}</p>
                  <p className="text-[10px] text-navy-400 mt-1 font-medium">{plan.plan}</p>
                  <p className="text-xs text-navy-500 leading-relaxed mt-4 mb-5">{plan.desc}</p>
                  <ul className="text-left space-y-2.5 mb-6">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-[12px] text-navy-600">
                        <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? 'bg-mint-50' : 'bg-warm-50'}`}>
                          <Check className={`w-3 h-3 ${plan.highlight ? 'text-mint-600' : 'text-navy-400'}`} />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/pricing"
                    className={`w-full ${plan.highlight ? 'btn-secondary' : 'btn-outline'} btn-sm`}
                  >
                    {plan.highlight ? '구독 시작하기' : '자세히 보기'}
                  </Link>
                </div>
              );
            })}
          </RevealStagger>

          <Reveal delay={200} className="text-center mt-10">
            <p className="text-xs text-navy-400 inline-flex items-center gap-1.5">
              <Handshake className="w-3.5 h-3.5 text-mint-500" />
              교회 전체 도입(단체 플랜)도 준비 중입니다.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
         8. FINAL CTA
         ════════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white text-center overflow-hidden">
        {/* 오로라 오브 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-mint-500/10 rounded-full blur-[100px] aurora-orb" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-orange-500/8 rounded-full blur-[110px] aurora-orb" style={{ animationDelay: '4s' }} />
        </div>

        {/* 그리드 패턴 */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />

        <Reveal className="container-custom max-w-xl mx-auto space-y-7 relative z-10">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-mint-300 text-sm font-semibold">
            <Heart className="w-4 h-4" />
            함께 섬기고, 함께 자라는 교회학교
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            지금 함께 시작하세요
          </h2>
          <p className="text-sm md:text-base text-navy-300 leading-relaxed max-w-md mx-auto">
            무료 자료로 먼저 경험하고, AI 공지문으로 매주의 소통을 가볍게 만들어보세요.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/notice-writer"
              className="group btn-lg w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-navy-900 font-bold rounded-2xl shadow-card-hover hover:bg-warm-50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(46,196,182,0.25)]"
            >
              <Sparkles className="w-5 h-5 text-mint-500 group-hover:rotate-12 transition-transform" />
              공지문 만들어보기
            </Link>
            <Link
              href="/pricing"
              className="group btn-lg w-full sm:w-auto inline-flex items-center justify-center gap-2 glass text-white font-semibold rounded-2xl hover:bg-white/15 transition-all duration-300 hover:-translate-y-0.5"
            >
              요금제 보기
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
