'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Download, ExternalLink, Sparkles, Heart, Crown,
  Zap, Bot, FileText, ShieldCheck, CheckCircle2,
  ArrowUpRight, Share2, Star, Check, Layers,
  Database, Bookmark, ArrowRight, Layout, Users,
  Music, BookOpen, Clock, Plus, Filter, Search, X
} from 'lucide-react';

const OFFICIAL_MSB_NOTION_URL = 'https://lava-child-76b.notion.site/Ministry-Second-Brain-PARA-faa57f770752494db4bf529eaf689998';

export interface NotionTemplateItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: '통합 시스템' | '설교·묵상' | '교회학교' | '행정·미디어';
  status: 'published' | 'coming_soon';
  badge?: string;
  icon: string;
  features: string[];
  tags: string[];
  downloadUrl?: string;
  webAppUrl?: string;
  webAppLabel?: string;
  stats?: {
    downloads?: string;
    rating?: string;
  };
  isFlagship?: boolean;
}

// 앞으로 새 템플릿을 제작할 때 이 배열에 객체만 추가하면 카드와 상세 정보가 자동으로 생성됩니다.
export const BUNKER_NOTION_TEMPLATES: NotionTemplateItem[] = [
  {
    id: 'ministry-second-brain',
    title: '사역자 세컨드 브레인 (Ministry Second Brain)',
    subtitle: 'PARA 시스템과 AI 사역 도구가 1:1로 결합된 올인원 마스터 워크스페이스',
    description: '설교 준비부터 부서 출석 통계, 주간 공지문 발송, 찬양 콘티까지 — 노션에 마우스 복사 한 번으로 서식 그대로 붙여넣는 전용 AI 웹 도구와 노션 템플릿이 결합된 한국 교회 목회자·교사 전용 시스템입니다.',
    category: '통합 시스템',
    status: 'published',
    badge: 'BUNKER 플래그십 마스터',
    icon: '⚡',
    features: [
      '노션 서식 100% 보존 리치 클립보드',
      'AI 사역 기획실 & 설교 원고 연동',
      '교회학교 4대 부서 맞춤 공지문 작성기',
      '모바일 행사 접수 & 실시간 출석 체크'
    ],
    tags: ['PARA 시스템', 'AI 사역 도구', '설교 아카이브', '부서 공지문', '100% 무료'],
    downloadUrl: OFFICIAL_MSB_NOTION_URL,
    webAppUrl: '/notion',
    webAppLabel: '전용 웹사이트 바로가기',
    stats: {
      downloads: '1,250+',
      rating: '5.0'
    },
    isFlagship: true,
  },
  {
    id: 'sermon-expository-vault',
    title: '성경 66권 강해 설교 연구 & 주석 보관함',
    subtitle: '박영선·로이드존스·파이퍼 강해 모델 및 성경 권별 체계적 설교 아카이빙',
    description: '구약과 신약 66권 본문별, 절기별, 시리즈별로 지난 설교 원고와 아웃라인, 성경 주석을 체계적으로 분류하고 축적하는 강해 설교 전용 노션 템플릿입니다.',
    category: '설교·묵상',
    status: 'coming_soon',
    badge: '차기 제작 템플릿',
    icon: '📖',
    features: [
      '성경 66권 권별·장별 데이터베이스',
      '강해 모델(목회적·교리적·본문 중심) 아웃라인 서식',
      '설교 예화 및 헬라어·히브리어 원문 주석 태깅'
    ],
    tags: ['강해 설교', '성경 66권', '설교 아웃라인', '본문 주석', '원고 보관함'],
    webAppUrl: '/',
    webAppLabel: 'AI 설교 연구실 연동',
  },
  {
    id: 'church-school-care-hub',
    title: '교회학교 통합 운영 & 학생 심방 케어 노트',
    subtitle: '학생 1:1 기도제목, 분반 공과 피드백, 교사 업무분담 종합 대시보드',
    description: '매주 주일 출석률 자동 집계부터 학생별 상담·심방 일지, 분반 교사 회의록을 공유하고 기도제목을 동역하는 교회학교 전용 종합 관리 템플릿입니다.',
    category: '교회학교',
    status: 'coming_soon',
    badge: '차기 제작 템플릿',
    icon: '🎒',
    features: [
      '주간 출석률 & 장기 결석자 자동 알림 뷰',
      '학생별 1:1 심방 케어 및 기도 응답 일지',
      '교사 주간 회의록 & 다음 주 안건 트래커'
    ],
    tags: ['교회학교', '출석 통계', '심방 케어', '교사 회의록', '학생 관리'],
    webAppUrl: '/school/notice-writer',
    webAppLabel: '부서 공지문 작성기 연동',
  },
  {
    id: 'worship-conti-master',
    title: '예배 찬양팀 주간 콘티 & 송폼 아카이브',
    subtitle: '절기별 찬양 선곡, 조옮김(Key), 악보 링크 및 팀원 주간 공유 시스템',
    description: '예배 주제와 본문에 맞는 찬양 곡을 데이터베이스화하고, 주간 콘티 시트와 송폼을 작성하여 찬양팀원들에게 1초 만에 공유하는 워십 미니스트리 템플릿입니다.',
    category: '행정·미디어',
    status: 'coming_soon',
    badge: '차기 제작 템플릿',
    icon: '🎵',
    features: [
      '찬양 곡별 Key(조), 박자, 주제별 태그 검색',
      '주간 콘티 시트 에디터 & 송폼 가이드',
      '유튜브 음원 및 악보 클라우드 링크 보관함'
    ],
    tags: ['찬양 콘티', '예배 기획', '송폼 아카이브', '찬양팀 공유'],
    webAppUrl: '/school/conti',
    webAppLabel: '찬양 콘티 에디터 연동',
  },
];

export default function QtTemplatesLoungePage() {
  const [templates] = useState<NotionTemplateItem[]>(BUNKER_NOTION_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [likes, setLikes] = useState(528);
  const [isLiked, setIsLiked] = useState(false);
  const [isCopiedLink, setIsCopiedLink] = useState(false);

  const handleLike = () => {
    if (isLiked) {
      setLikes((prev) => prev - 1);
      setIsLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setIsLiked(true);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setIsCopiedLink(true);
        setTimeout(() => setIsCopiedLink(false), 2500);
      }
    } catch {}
  };

  const flagship = templates.find((t) => t.isFlagship) || templates[0];

  const filteredTemplates = templates.filter((tpl) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      tpl.title.toLowerCase().includes(query) ||
      tpl.subtitle.toLowerCase().includes(query) ||
      tpl.tags.some((t) => t.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-indigo-500/20 selection:text-indigo-600">

      {/* ════════════════════════════════════════════
          1. HERO SECTION (다크 럭셔리 네이비 테마)
         ════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-28 md:pb-28 bg-[#070B16] text-white border-b border-indigo-950/60">
        {/* Ambient Meshes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[520px] bg-gradient-to-tr from-indigo-600/25 via-purple-600/20 to-amber-500/15 blur-3xl -z-10 pointer-events-none opacity-90" />
        <div className="absolute -top-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="container-custom max-w-5xl text-center space-y-7">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-indigo-200 text-xs md:text-sm font-black shadow-lg backdrop-blur-md animate-fade-in">
            <Crown className="w-4 h-4 fill-amber-300 text-amber-300" />
            <span className="tracking-wide">BUNKER OFFICIAL NOTION STUDIO · 100% 영구 무료</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.12] tracking-tight">
            사역의 품격을 높이는<br />
            <span className="bg-gradient-to-r from-amber-300 via-rose-300 to-indigo-300 bg-clip-text text-transparent">
              공식 노션 템플릿 아카이브
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Bunker 목양 연구소에서 직접 기획·제작한 공식 노션 템플릿 라인업입니다.<br className="hidden sm:inline" />
            현장에 꼭 필요한 검증된 템플릿을 지속적으로 개발하여 무료로 업로드합니다.
          </p>

          {/* Quick Stats */}
          <div className="pt-3 flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-300 font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>100% 영구 무료 공유</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>전용 AI 웹 스튜디오 실시간 연동</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>지속적인 신규 템플릿 업데이트</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          2. FLAGSHIP MASTER SHOWCASE (사역자 세컨드 브레인 집중 배너)
         ════════════════════════════════════════════ */}
      <section className="py-8 md:py-10 bg-surface border-b border-border/50">
        <div className="container-custom max-w-6xl space-y-4">

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="inline-flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>OFFICIAL FLAGSHIP 01</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-navy-950">
                대표 템플릿 · 사역자 세컨드 브레인
              </h2>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              즉시 다운로드 가능
            </span>
          </div>

          {/* Flagship Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1020] via-[#111827] to-[#1E293B] text-white p-6 sm:p-8 md:p-10 border border-indigo-500/30 shadow-2xl shadow-indigo-950/40">
            {/* Ambient Lighting */}
            <div className="absolute -top-32 -right-32 w-[420px] h-[420px] bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-[420px] h-[420px] bg-gradient-to-tr from-amber-500/15 to-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              
              {/* Left Content */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-xs font-black tracking-wider">
                  <Crown className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span>{flagship.badge}</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                    {flagship.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-normal font-normal">
                    {flagship.description}
                  </p>
                </div>

                {/* 4 Feature Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {flagship.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white/[0.06] border border-white/10 px-3 py-2 rounded-xl text-xs text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-semibold truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Dual Action Buttons */}
              <div className="lg:col-span-5 bg-white/[0.06] border border-white/15 backdrop-blur-xl rounded-2xl p-5 sm:p-7 flex flex-col justify-between space-y-4 shadow-xl">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">누적 이용 현황</span>
                    <span className="text-amber-300 font-extrabold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-300" /> 평점 5.0 / 5.0
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-white/95 leading-snug">
                    별도의 회원가입 없이 누구나 즉시 <br className="hidden sm:inline" />
                    노션에 복제하여 전용 웹도구와 함께 사용하세요.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {/* 1. 템플릿 다운로드 버튼 */}
                  <a
                    href={flagship.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all group"
                  >
                    <Download className="w-4 h-4 text-emerald-100 group-hover:-translate-y-0.5 transition-transform" />
                    <span>템플릿 무료 다운로드 (노션 복제)</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-200 opacity-80" />
                  </a>

                  {/* 2. 전용 웹사이트 연결 버튼 */}
                  {flagship.webAppUrl && (
                    <Link
                      href={flagship.webAppUrl}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-indigo-600/35 active:scale-[0.98] transition-all group"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform duration-300" />
                      <span>{flagship.webAppLabel || '전용 웹사이트 바로가기'}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 text-center leading-normal">
                  🎁 한국 교회를 섬기는 100% 영구 무료 배포 프로젝트입니다.
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════
          3. NOTION TEMPLATES CATALOG (향후 템플릿 지속 업로드 공간)
         ════════════════════════════════════════════ */}
      <section className="py-8 md:py-12 bg-surface">
        <div className="container-custom max-w-6xl space-y-6 md:space-y-8">

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-wider">
                <Database className="w-4 h-4" />
                <span>NOTION TEMPLATES LINEUP</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-navy-950">
                노션 사역 템플릿 전체 라인업
              </h3>
              <p className="text-xs sm:text-sm text-navy-600 font-normal leading-normal">
                직접 검증하고 제작한 템플릿들이 순차적으로 이곳에 업로드됩니다.
              </p>
            </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72 shrink-0">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
                <input
                  type="text"
                  placeholder="템플릿 제목 또는 태그 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 rounded-2xl bg-white border border-warm-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-navy-400 hover:text-navy-700"
                    aria-label="검색어 지우기"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {filteredTemplates.map((tpl) => {
              const isAvailable = tpl.status === 'published';

              return (
                <div
                  key={tpl.id}
                  className={`bg-white rounded-3xl p-7 sm:p-8 border transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${
                    tpl.isFlagship
                      ? 'border-indigo-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 bg-gradient-to-b from-white via-indigo-50/20 to-white'
                      : isAvailable
                      ? 'border-warm-200 shadow-sm hover:shadow-xl hover:-translate-y-1'
                      : 'border-warm-200/70 shadow-2xs hover:shadow-md bg-warm-50/30'
                  }`}
                >
                  {/* Status Ribbon Badge */}
                  <div className="absolute top-0 right-0">
                    {tpl.isFlagship ? (
                      <span className="inline-flex items-center gap-1 bg-gradient-to-l from-indigo-600 to-amber-500 text-white text-[10px] font-black px-4 py-1 rounded-bl-2xl shadow-xs">
                        <Crown className="w-3 h-3 fill-amber-300" />
                        FLAGSHIP 1호
                      </span>
                    ) : isAvailable ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-black px-4 py-1 rounded-bl-2xl shadow-xs">
                        다운로드 가능
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-warm-200 text-navy-600 text-[10px] font-black px-3.5 py-1 rounded-bl-2xl">
                        <Clock className="w-3 h-3" />
                        제작 중 (출시 예정)
                      </span>
                    )}
                  </div>

                  <div>
                    {/* Header */}
                    <div className="flex items-center gap-3.5 mb-4 pt-1">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                        tpl.isFlagship
                          ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md'
                          : isAvailable
                          ? 'bg-warm-100 text-navy-900 border border-warm-200'
                          : 'bg-warm-100/60 text-navy-400 border border-warm-200/60'
                      }`}>
                        {tpl.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-warm-100 text-navy-700">
                            {tpl.category}
                          </span>
                        </div>
                        <h4 className="text-lg sm:text-xl font-extrabold text-navy-950 mt-1 leading-snug">
                          {tpl.title}
                        </h4>
                      </div>
                    </div>

                    <p className="text-xs text-rose-600 font-bold mb-2">
                      {tpl.subtitle}
                    </p>

                    <p className="text-xs text-navy-600 leading-normal font-normal mb-3 line-clamp-3">
                      {tpl.description}
                    </p>

                    {/* Features List */}
                    <div className="bg-warm-50/80 p-3.5 rounded-2xl border border-warm-100 space-y-1.5 mb-5">
                      {tpl.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px] text-navy-700 font-medium">
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isAvailable ? 'text-emerald-600' : 'text-navy-400'}`} />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {tpl.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-medium text-navy-500 bg-warm-100 px-2 py-0.5 rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Dual Action Buttons */}
                  <div className="pt-4 border-t border-warm-100 space-y-2">
                    {isAvailable && tpl.downloadUrl ? (
                      <div className="space-y-2">
                        {/* 1. 템플릿 다운로드 버튼 */}
                        <a
                          href={tpl.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all"
                        >
                          <Download className="w-4 h-4" />
                          <span>템플릿 무료 다운로드 (노션 복제)</span>
                          <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
                        </a>

                        {/* 2. 전용 웹사이트 연결 버튼 */}
                        {tpl.webAppUrl && (
                          <Link
                            href={tpl.webAppUrl}
                            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-warm-100 hover:bg-navy-950 text-navy-800 hover:text-white border border-warm-200/80 font-bold text-xs active:scale-[0.98] transition-all"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>{tpl.webAppLabel || '전용 웹사이트 바로가기'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-full py-3 rounded-2xl bg-warm-100/80 text-navy-400 font-bold text-xs text-center border border-warm-200/70 flex items-center justify-center gap-2">
                          <Clock className="w-3.5 h-3.5" />
                          <span>정성껏 제작 중입니다 · 곧 출시됩니다</span>
                        </div>

                        {tpl.webAppUrl && (
                          <Link
                            href={tpl.webAppUrl}
                            className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-2xl bg-white hover:bg-warm-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-all"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{tpl.webAppLabel} (먼저 체험하기)</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

          {/* Future Template Roadmap Notice Banner */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-warm-100/70 via-indigo-50/50 to-warm-100/70 border border-warm-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mx-auto text-xl shadow-xs border border-warm-200">
              💡
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-black text-navy-950">
                원하시는 사역 템플릿이 있으신가요?
              </h4>
              <p className="text-xs sm:text-sm text-navy-600 max-w-lg mx-auto">
                Bunker 목양 연구소는 현장 사역자들의 의견을 반영하여 실무에 즉시 쓰이는 노션 템플릿과 AI 웹 도구를 계속해서 추가 제작하고 있습니다.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════
          4. BOTTOM CTA
         ════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#0B1020] text-white relative overflow-hidden">
        <div className="container-custom max-w-3xl relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-300/30">
            <Heart className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            한국 교회를 섬기는 100% 무료 나눔
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            지금 사역자 세컨드 브레인으로<br />
            <span className="text-amber-400">사역의 품격을 한 단계 높여보세요</span>
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
            비용이나 회원가입 부담 없이 언제든 자유롭게 템플릿을 다운로드하고 전용 웹사이트를 이용하세요.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-3.5">
            <a
              href={flagship.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm sm:text-base shadow-xl shadow-emerald-500/25 active:scale-[0.98] transition-all"
            >
              <Download className="w-4 h-4" />
              <span>템플릿 무료 다운로드</span>
              <ArrowUpRight className="w-4 h-4 opacity-80" />
            </a>

            <Link
              href={flagship.webAppUrl || '/notion'}
              className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-sm sm:text-base shadow-xl shadow-indigo-600/30 active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>전용 웹사이트 바로가기</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
