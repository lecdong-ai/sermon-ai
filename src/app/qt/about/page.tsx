'use client';

import Link from 'next/link';
import {
  BookOpen, Heart, Sparkles, ArrowRight,
  Bookmark, Search, Share2, Layers, Gift,
  CheckCircle2, Users, Star, Quote, Smile, Baby, GraduationCap, Coffee
} from 'lucide-react';

const GENERATION_QTS = [
  {
    icon: '🐥',
    title: '유치부 큐티',
    subtitle: '그림과 쉬운 언어의 첫 묵상',
    desc: '하나님의 사랑을 느끼며 쑥쑥 자라는 유아·유치부 어린이 맞춤 그림 해설과 1-문장 나눔',
    badge: '어린이',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
  },
  {
    icon: '🎒',
    title: '초등부 큐티',
    subtitle: '스스로 묵상하고 적용하는 습관',
    desc: '학교와 일상 생활 속에서 말씀대로 살아가는 구체적인 묵상 포인트와 일일 미션',
    badge: '초등학생',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  },
  {
    icon: '🎧',
    title: '청소년부 큐티',
    subtitle: '삶의 고민에 답하는 은혜의 말씀',
    desc: '학업, 친구 관계, 미래의 고민에 대해 성경적 세계관으로 명확한 길을 보여주는 묵상',
    badge: '청소년',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-200',
  },
  {
    icon: '☕',
    title: '장년 & 교인 큐티',
    subtitle: '하루를 깨우는 깊이 있는 샘물',
    desc: '가정과 직장에서 믿음의 승리를 이루도록 돕는 깊은 원문 관찰과 삶의 적용 질문',
    badge: '장년·교사',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-200',
  },
];

export default function QtAboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent-soft selection:text-accent">

      {/* ════════════════════════════════════════════
          1. HERO SECTION (큐티 아카이브 소개)
         ════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-16 pb-16 md:pt-24 md:pb-20 border-b border-border/60 bg-surface/50">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-amber-100/40 via-rose-100/30 to-indigo-100/40 blur-3xl -z-10 opacity-70 pointer-events-none" />

        <div className="container-custom max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 border border-rose-200/70 text-rose-700 text-xs md:text-sm font-bold shadow-2xs animate-fade-in">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>매일의 묵상을 위한 작은 서재</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-navy-950 leading-[1.15] tracking-tight">
            매일 하나님의 은혜를 누리는<br />
            <span className="bg-gradient-to-r from-rose-600 via-amber-600 to-indigo-600 bg-clip-text text-transparent">큐티 아카이브</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-navy-600 max-w-2xl mx-auto leading-relaxed font-medium">
            유치부 어린아이부터 청소년, 성도와 교사에 이르기까지.<br className="hidden sm:inline" />
            모든 성도가 매일 하나님의 말씀을 읽고 삶에 적용할 수 있도록 만든 무료 묵상 서재 공간입니다.
          </p>

          <div className="pt-4 flex flex-wrap justify-center items-center gap-3">
            <Link
              href="/qt"
              className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white font-extrabold px-7 py-3.5 rounded-2xl text-sm md:text-base shadow-md shadow-rose-500/20 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              오늘의 큐티 묵상하기
            </Link>
            <Link
              href="/qt/published"
              className="inline-flex items-center gap-2 bg-white hover:bg-warm-50 active:scale-[0.98] text-navy-900 font-extrabold px-7 py-3.5 rounded-2xl text-sm md:text-base border border-warm-300 transition-all"
            >
              <Bookmark className="w-4 h-4 text-indigo-600" />
              QT 모음집 둘러보기
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          2. FOUR SPECIAL VALUES (큐티 아카이브의 4가지 가치)
         ════════════════════════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="container-custom max-w-6xl space-y-12">

          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              SPECIAL VALUES
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-navy-950">
              큐티 아카이브가 전하는 특별함
            </h2>
            <p className="text-xs sm:text-sm text-navy-500">
              말씀 안에서 피어나는 영적 기쁨과 성장의 순간을 만듭니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Value 1 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-warm-200/80 shadow-md space-y-3 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold border border-amber-100">
                🌱
              </div>
              <h3 className="text-lg font-extrabold text-navy-950">세대별 맞춤 해설</h3>
              <p className="text-xs text-navy-600 leading-relaxed">
                아이들 눈높이에 맞는 유치·초등 큐티부터 청소년, 성도를 위한 깊이 있는 원문 해설까지 세대별 맞춤 제공
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-warm-200/80 shadow-md space-y-3 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl font-bold border border-rose-100">
                🕊️
              </div>
              <h3 className="text-lg font-extrabold text-navy-950">매일의 나눔과 적용</h3>
              <p className="text-xs text-navy-600 leading-relaxed">
                가정 예배, 부서 카카오톡 나눔방, 소그룹 모임에 바로 공유할 수 있는 적용 질문과 나눔 서식
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-warm-200/80 shadow-md space-y-3 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold border border-indigo-100">
                📚
              </div>
              <h3 className="text-lg font-extrabold text-navy-950">체계적인 아카이빙</h3>
              <p className="text-xs text-navy-600 leading-relaxed">
                날짜별, 성경 권별, 절기별(대림, 성탄, 사순, 부활 등) 지나간 묵상 자료를 언제든 검색하고 보관
              </p>
            </div>

            {/* Value 4 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-warm-200/80 shadow-md space-y-3 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold border border-emerald-100">
                🎁
              </div>
              <h3 className="text-lg font-extrabold text-navy-950">100% 무료 나눔</h3>
              <p className="text-xs text-navy-600 leading-relaxed">
                모든 성도와 사역자가 재정적 제약 없이 은혜를 누리도록 자발적 동역과 함께 영구 무료 운영
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════
          3. GENERATION QTS (세대별 큐티 안내)
         ════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-surface-2/60 border-y border-border/60">
        <div className="container-custom max-w-6xl space-y-12">

          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
              <Users className="w-3.5 h-3.5 text-amber-700" />
              GENERATIONS
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-navy-950">
              온 세대가 함께 묵상하는 큐티
            </h2>
            <p className="text-xs sm:text-sm text-navy-600">
              가정과 교회가 같은 말씀 본문으로 깊게 소통할 수 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {GENERATION_QTS.map((item, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-6 sm:p-8 border border-warm-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-3xl">{item.icon}</span>
                    <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-navy-950">{item.title}</h3>
                    <p className="text-xs text-rose-600 font-bold mt-0.5">{item.subtitle}</p>
                  </div>
                  <p className="text-xs sm:text-sm text-navy-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <Link
                  href="/qt"
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-navy-800 hover:text-rose-600 transition-colors pt-2 border-t border-warm-100"
                >
                  <span>오늘의 {item.title} 읽기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════
          4. EXPLORE QT ARCHIVE LINKS
         ════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom max-w-5xl space-y-12">

          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              NAVIGATION
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-navy-950">
              큐티 아카이브 둘러보기
            </h2>
            <p className="text-xs sm:text-sm text-navy-500">
              원하시는 말씀 서비스로 즉시 이동하세요.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <Link href="/qt" className="bg-warm-50 hover:bg-rose-50/50 p-6 rounded-3xl border border-warm-200/80 transition-all text-left space-y-3 group">
              <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold">
                📖
              </div>
              <h3 className="text-base font-bold text-navy-950 group-hover:text-rose-600 transition-colors">
                오늘의 큐티
              </h3>
              <p className="text-xs text-navy-500 leading-relaxed">
                오늘 주시는 하나님의 말씀과 세대별 묵상 해설
              </p>
            </Link>

            <Link href="/qt/published" className="bg-warm-50 hover:bg-amber-50/50 p-6 rounded-3xl border border-warm-200/80 transition-all text-left space-y-3 group">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold">
                📚
              </div>
              <h3 className="text-base font-bold text-navy-950 group-hover:text-amber-600 transition-colors">
                QT 모음집
              </h3>
              <p className="text-xs text-navy-500 leading-relaxed">
                지난 묵상 본문과 절기별 특별 큐티 아카이빙
              </p>
            </Link>

            <Link href="/qt/templates" className="bg-warm-50 hover:bg-indigo-50/50 p-6 rounded-3xl border border-warm-200/80 transition-all text-left space-y-3 group">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                📘
              </div>
              <h3 className="text-base font-bold text-navy-950 group-hover:text-indigo-600 transition-colors">
                노션 템플릿
              </h3>
              <p className="text-xs text-navy-500 leading-relaxed">
                묵상일지 및 사역 관리를 위한 노션 템플릿 모음
              </p>
            </Link>

            <Link href="/qt/shop" className="bg-warm-50 hover:bg-emerald-50/50 p-6 rounded-3xl border border-warm-200/80 transition-all text-left space-y-3 group">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                🛒
              </div>
              <h3 className="text-base font-bold text-navy-950 group-hover:text-emerald-600 transition-colors">
                후원 스토어
              </h3>
              <p className="text-xs text-navy-500 leading-relaxed">
                일상의 쇼핑으로 만드는 자발적 묵상 사역 후원
              </p>
            </Link>

          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════
          5. BOTTOM CTA
         ════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-navy-950 text-white relative overflow-hidden">
        <div className="container-custom max-w-3xl relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
            <Heart className="w-3.5 h-3.5 fill-rose-400" />
            매일의 묵상 사역
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            오늘도 큐티 아카이브와 함께<br />
            <span className="text-rose-400">말씀의 은혜를 느껴보세요</span>
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-navy-300 max-w-lg mx-auto leading-relaxed">
            사랑하는 가족, 성도, 교사들과 매일의 묵상 말씀을 함께 공유하세요.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <Link
              href="/qt"
              className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-extrabold px-7 py-3.5 rounded-2xl text-sm sm:text-base shadow-lg shadow-rose-500/20 transition-all"
            >
              오늘의 큐티 바로가기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
