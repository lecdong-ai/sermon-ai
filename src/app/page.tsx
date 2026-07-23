'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Upload, Sparkles, FileText, Share2, LogIn, LayoutDashboard,
  ArrowRight, CheckCircle, Star, Shield, Zap, Globe,
  Play, Users, FileCheck, BrainCircuit, Heart, X, HardDrive,
  Cross, GraduationCap, BookOpen, Wand2, Presentation, Calendar,
  Store, Smile, Coffee, Music2, BookMarked, Layers, CheckCircle2,
  ScrollText
} from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import { useAuth } from '@/components/AuthProvider';

// 4가지 공동체 구성원별 맞춤 안내
const COMMUNITY_ROLES = [
  {
    role: '교역자 (목회자/전도사)',
    icon: '👨‍💼',
    badge: 'PASTORAL',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    title: '깊이 있는 말씀 연구와 설교 준비',
    desc: '설교 원고를 입력하면 6가지 목회 자료(요약, 소그룹 질문, 카드뉴스, 대본, PPT)가 자동 설계되며 깊이 있는 말씀 연구실을 제공합니다.',
    features: ['설교 프로젝트 & 6종 가공', '말씀 연구실 & 원맥 분석', '설교 아카이브 보관함'],
    link: '/advanced',
    linkText: '설교 솔루션 보기',
  },
  {
    role: '교회학교 교사 (선생님)',
    icon: '👩‍🏫',
    badge: 'TEACHER',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    title: '스마트한 부서 운영과 행사 관리',
    desc: '문자·카톡·가정통신문 공지문을 몇 초 만에 완성하고, 수련회 모바일 신청서 링크 생성 및 출석 체크인을 원스톱으로 처리합니다.',
    features: ['스마트 공지문 작성기 (4종)', '수련회 모바일 신청 & 체크인', '예배/교육 PPT 스튜디오'],
    link: '/school',
    linkText: '교회학교 솔루션 보기',
  },
  {
    role: '일반 성도 & 가정',
    icon: '☕',
    badge: 'MEMBERS',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    title: '매일의 세대별 묵상과 영적 나눔',
    desc: '유치부 어린이부터 청소년, 성도에 이르기까지 온 가족이 매일 동일한 말씀 본문으로 묵상하고 은혜를 함께 나누는 작은 서재입니다.',
    features: ['세대별 매일 큐티 아카이브', '개인 묵상일지 & 통찰 노트', '카카오톡 1-초 나눔 카드'],
    link: '/qt',
    linkText: '큐티 아카이브 가기',
  },
  {
    role: '예배자 & 찬양팀',
    icon: '🎵',
    badge: 'WORSHIP',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    title: '은혜로운 예배 콘티와 찬양 준비',
    desc: '예배 콘티를 쉽게 구성하고, 콘티 공유 및 악보/싱어 악보집을 출력하여 예배를 풍성하게 준비합니다.',
    features: ['예배 콘티 제작 & 공유', '찬양 악보 및 세션집 관리', '예배 프레젠테이션 연동'],
    link: '/conti',
    linkText: '예배 콘티 보러가기',
  },
];

// 6대 통합 사역 솔루션
const CORE_SOLUTIONS = [
  {
    icon: BookOpen,
    title: '설교 준비 & 6종 가공',
    target: '교역자 전용',
    desc: '설교 원고 파일 하나로 요약본, 소그룹 질문지, 카드뉴스, 유튜브 쇼츠 대본, PPT를 자동 생성합니다.',
    link: '/advanced',
    color: 'from-indigo-500 to-blue-600',
  },
  {
    icon: Wand2,
    title: '스마트 공지문 작성기',
    target: '교사 & 부서',
    desc: '문자, 카카오톡 옐로우 버블, 가정통신문, 리마인더 4가지 상황별 맞춤 공지문을 3초 만에 만듭니다.',
    link: '/school/notice-writer',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Calendar,
    title: '모바일 행사 & 체크인',
    target: '교회학교 & 행사진행',
    desc: '수련회 및 여름성경학교 모바일 참가 신청서 링크를 생성하고, 현장 체크인 및 CSV 엑스포트를 제공합니다.',
    link: '/school/events/manage',
    color: 'from-rose-500 to-pink-600',
  },
  {
    icon: Heart,
    title: '세대별 매일 큐티 아카이브',
    target: '온 성도 & 가정',
    desc: '유치부, 초등부, 청소년부, 장년 4단계 맞춤 묵상 해설과 날짜/절기별 과거 묵상 아카이빙을 지원합니다.',
    link: '/qt',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: Presentation,
    title: 'PPT 스튜디오 & 예배 콘티',
    target: '방송실 & 찬양팀',
    desc: '예배 찬양, 성경 구절, 공지 프레젠테이션 템플릿과 찬양 콘티를 손쉽게 제작하고 공유합니다.',
    link: '/school/ppt-studio',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    icon: Layers,
    title: '노션 사역 템플릿 나눔터',
    target: '모든 사역자 & 교사',
    desc: '전국의 목회자와 선생님들이 직접 제작한 노션 사역 대시보드 템플릿을 1-클릭으로 복제하여 사용합니다.',
    link: '/qt/templates',
    color: 'from-cyan-500 to-blue-600',
  },
];

// 신뢰 정보 수치
const STATS = [
  { label: '함께하는 사역 공동체', count: '12,500명+', desc: '전국 및 해외 교역자, 교사, 일반 성도' },
  { label: '누적 목회 & 묵상 수', count: '48,000건+', desc: '생성 및 묵상 완료된 사역 자산' },
  { label: '운영 서비스 만족도', count: '99.8%', desc: '100% 영구 무료로 선한 영향력 실천' },
];

const TESTIMONIALS = [
  {
    quote: "설교 원고 하나로 소그룹 질문과 카드뉴스까지 완성되어 목회 준비 시간이 절반 이하로 줄었습니다. 사역의 본질에 더 집중할 수 있어 감사합니다.",
    author: "김은호 목사",
    role: "빛과소금교회 담임목사",
  },
  {
    quote: "수련회 모바일 참가 신청서와 공지문 작성을 몇 분 만에 끝냈습니다! 교사 생활 5년 동안 가장 스마트하게 행사를 진행할 수 있었습니다.",
    author: "박사랑 선생님",
    role: "초등부 부장교사",
  },
  {
    quote: "매일 큐티 아카이브 덕분에 저희 집 아이들과 같은 본문으로 묵상하고 저녁에 은혜를 나눕니다. 우리 가족의 영적 보물창고입니다.",
    author: "이수진 집사",
    role: "가정 예배 성도",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [showDashboardPopup, setShowDashboardPopup] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    els.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        el.classList.add('visible');
      }
    });
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  const handleUploadSuccess = (sermonId: string) => {
    router.push(`/workspace?id=${sermonId}`);
  };

  const isLoggedIn = mounted && !loading && !!user;

  return (
    <div className="relative min-h-screen bg-[#050814] text-slate-100 overflow-x-hidden font-sans">
      
      {/* 1. 미래형 백그라운드 효과 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-grid-tech opacity-15" />
        <div className="absolute top-[-10%] left-[-15%] w-[80vw] h-[80vw] max-w-[1000px] rounded-full bg-gradient-to-br from-indigo-600/15 via-blue-500/5 to-transparent blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-[20%] right-[-15%] w-[70vw] h-[70vw] max-w-[900px] rounded-full bg-gradient-to-tr from-purple-600/10 via-pink-500/5 to-transparent blur-3xl animate-pulse-slower" />
      </div>

      {/* 2. HERO SECTION */}
      <section className="relative pt-24 pb-16 sm:pt-36 sm:pb-24 z-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center space-y-8">
          
          <div className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs sm:text-sm font-bold shadow-2xs">
            <Cross className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>교역자 · 교사 · 성도 온 공동체가 함께하는 사역 통합 플랫폼</span>
          </div>

          <h1 className="reveal text-[clamp(2.25rem,5.5vw,3.75rem)] font-extrabold tracking-tight leading-[1.15] text-white max-w-4xl mx-auto">
            교회의 모든 사역을 하나로,<br />
            <span className="text-gradient-neon glow-text-neon">온 공동체가 함께 섬기는</span><br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-rose-400 bg-clip-text text-transparent">Bunker 목양</span>
          </h1>

          <p className="reveal text-[clamp(1rem,2vw,1.15rem)] text-slate-300 leading-relaxed font-medium max-w-2xl mx-auto">
            설교 준비부터 교회학교 운영, 매일의 큐티, 예배 콘티, 행사 관리까지.<br className="hidden sm:inline" />
            특정 사역자만이 아닌 교역자, 일반 성도, 교회학교 교사 등 공동체 누구나 함께 기쁨으로 사용할 수 있습니다.
          </p>

          <div className="reveal pt-4 flex flex-wrap justify-center items-center gap-4">
            {!isLoggedIn ? (
              <Link
                href="/login?redirect=/"
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 text-white font-extrabold text-[16px] shadow-lg shadow-indigo-500/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
              >
                <Sparkles className="w-5 h-5 text-indigo-200" />
                무료로 사역 시작하기
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <button
                onClick={() => setShowDashboardPopup(true)}
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 text-white font-extrabold text-[16px] shadow-lg shadow-indigo-500/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
              >
                <LayoutDashboard className="w-5 h-5" />
                대시보드로 이동
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            <a
              href="#solutions"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl glass-dark hover:bg-white/10 text-slate-200 hover:text-white font-bold text-[16px] border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              6대 사역 솔루션 둘러보기
            </a>
          </div>

        </div>
      </section>

      {/* 3. 소셜 수치 섹션 */}
      <section className="relative py-12 border-y border-white/5 bg-[#070b1a]/80 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {STATS.map((stat, idx) => (
              <div key={idx} className="reveal space-y-1">
                <p className="text-[13px] font-semibold text-slate-400">{stat.label}</p>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-outfit tracking-tight text-gradient-neon">{stat.count}</h3>
                <p className="text-[11.5px] text-slate-500">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WHO IT'S FOR — 공동체 구성원별 맞춤 안내 */}
      <section className="relative py-20 sm:py-28 z-10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>COMMUNITY MEMBERS</span>
            </div>
            <h2 className="reveal text-3xl sm:text-4xl font-black text-white">
              누구나 함께 참여하는 사역
            </h2>
            <p className="reveal text-xs sm:text-sm text-slate-400">
              교회의 모든 직분자와 구성원이 각자의 위치에서 기쁨으로 섬길 수 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {COMMUNITY_ROLES.map((item, idx) => (
              <div key={idx} className="reveal glass-dark rounded-3xl p-6 sm:p-8 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-6 group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-3xl sm:text-4xl">{item.icon}</span>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {item.role}
                    </h3>
                    <p className="text-xs text-indigo-400 font-bold mt-0.5">{item.title}</p>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {item.desc}
                  </p>

                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1.5">
                    {item.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={item.link}
                  className="inline-flex items-center justify-between w-full pt-3 border-t border-white/10 text-xs sm:text-sm font-bold text-indigo-300 hover:text-white transition-colors"
                >
                  <span>{item.linkText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. CORE SOLUTIONS (6대 핵심 사역 솔루션) */}
      <section id="solutions" className="relative py-20 sm:py-28 bg-[#060918]/80 border-y border-white/5 z-10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-12">

          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>INTEGRATED SOLUTIONS</span>
            </div>
            <h2 className="reveal text-3xl sm:text-4xl font-black text-white">
              6대 통합 사역 솔루션
            </h2>
            <p className="reveal text-xs sm:text-sm text-slate-400">
              교회 사역에 필요한 핵심 기능들이 하나의 플랫폼에 구축되어 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CORE_SOLUTIONS.map((sol, idx) => {
              const Icon = sol.icon;
              return (
                <Link
                  key={idx}
                  href={sol.link}
                  className="reveal glass-dark rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all hover:-translate-y-1 group flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${sol.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                        {sol.target}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {sol.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {sol.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-indigo-400 pt-2 border-t border-white/5">
                    <span>이용하기</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. UPLOAD DEMO SECTION */}
      <section className="relative py-20 sm:py-28 z-10">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 text-center space-y-8">
          <div className="space-y-3">
            <h2 className="reveal text-2xl sm:text-3xl font-extrabold text-white">
              지금 사역 솔루션을 체험해 보세요
            </h2>
            <p className="reveal text-xs sm:text-sm text-slate-400">
              설교 원고 파일 하나로 다채로운 사역 자료를 즉시 경험하실 수 있습니다.
            </p>
          </div>

          <div className="reveal">
            {isLoggedIn ? (
              <FileUpload onSuccess={handleUploadSuccess} dark />
            ) : (
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-10 sm:p-14 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.06] flex items-center justify-center mx-auto mb-5">
                  <Upload className="w-7 h-7 text-white/50" />
                </div>
                <h3 className="text-[18px] sm:text-[20px] font-bold text-white/90 mb-2">
                  로그인하고 모든 사역 솔루션을 이용해 보세요
                </h3>
                <p className="text-[14px] text-white/40 mb-6 max-w-sm mx-auto">
                  가입 즉시 교역자, 교사, 성도 전용 도구를 무제한 무료로 이용할 수 있습니다.
                </p>
                <Link
                  href="/login?redirect=/"
                  className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 text-white font-extrabold text-[15px] shadow-lg shadow-indigo-500/20 hover:shadow-xl transition-all"
                >
                  30초 만에 무료 시작하기
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7. COMMUNITY TESTIMONIALS */}
      <section className="relative pb-24 sm:pb-32 z-10">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="reveal text-2xl sm:text-3xl font-extrabold text-white">
              사역 공동체가 전하는 생생한 후기
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">교역자, 교사, 성도가 함께 누리는 사역의 기쁨입니다.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="reveal p-6 rounded-2xl glass-dark border border-white/5 flex flex-col justify-between space-y-4">
                <p className="text-[13px] text-slate-300 leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center text-white font-bold text-xs">
                    {t.author[0]}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{t.author}</h5>
                    <p className="text-[10px] text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. 100% PERMANENTLY FREE */}
      <section className="relative pb-24 sm:pb-32 z-10">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="reveal relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.08] via-cyan-500/[0.04] to-transparent p-8 sm:p-12 text-center space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              100% 영구 무료 · 카드 등록 없음
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white">
              온 공동체를 위한 <span className="text-emerald-300">영구 무료 선언</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              교회를 섬기는 일에 재정적 장벽이 없어야 한다는 마음으로,<br />
              모든 사역 도구를 모든 사용자에게 영구히 무료로 선사합니다.
            </p>

            {!user && (
              <div className="pt-2">
                <Link
                  href="/login?redirect=/"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all"
                >
                  지금 무료로 시작하기
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 대시보드 선택 팝업 모달 */}
      {showDashboardPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setShowDashboardPopup(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl glass-dark border border-white/10 p-6 sm:p-8 shadow-2xl shadow-indigo-950/40"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white">어디로 이동할까요?</h3>
              <button
                onClick={() => setShowDashboardPopup(false)}
                className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-6">목적에 맞는 사역 공간을 선택하세요</p>

            <div className="space-y-2.5">
              <Link
                href="/dashboard"
                onClick={() => setShowDashboardPopup(false)}
                className="group flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:border-indigo-500/30 hover:bg-white/[0.07] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shrink-0 shadow-md">
                  <LayoutDashboard className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">설교 대시보드</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">설교 원고 분석 · 소그룹 · 6종 가공</p>
                </div>
              </Link>

              <Link
                href="/advanced"
                onClick={() => setShowDashboardPopup(false)}
                className="group flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:border-purple-500/30 hover:bg-white/[0.07] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shrink-0 shadow-md">
                  <ScrollText className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">말씀 연구실</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">설교 프로젝트 · 본문 연구 · 원맥 파악</p>
                </div>
              </Link>

              <Link
                href="/school"
                onClick={() => setShowDashboardPopup(false)}
                className="group flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:border-emerald-500/30 hover:bg-white/[0.07] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-md">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">교회학교 솔루션</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">공지문 작성기 · 행사 모바일 체크인</p>
                </div>
              </Link>

              <Link
                href="/qt"
                onClick={() => setShowDashboardPopup(false)}
                className="group flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:border-amber-500/30 hover:bg-white/[0.07] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 shadow-md">
                  <BookMarked className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">큐티 아카이브</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">세대별 매일 묵상 · 나눔 카드</p>
                </div>
              </Link>

              <Link
                href="/conti"
                onClick={() => setShowDashboardPopup(false)}
                className="group flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:border-blue-500/30 hover:bg-white/[0.07] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
                  <Music2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">예배 콘티</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">찬양 콘티 구성 · 악보집 관리</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
