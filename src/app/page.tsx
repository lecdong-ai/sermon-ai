'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen, ScrollText, Users, Heart, Sparkles, CheckCircle2,
  ArrowRight, ArrowUpRight, Download, ExternalLink, Calendar,
  Presentation, Music2, Layers, ShieldCheck, Clock, Quote,
  MessageSquare, ChevronRight, Check, LayoutDashboard, Star,
  FileText, Smartphone, Crown, Church, HelpCircle, X,
  GraduationCap, Copy, Share2, BookMarked
} from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import { useAuth } from '@/components/AuthProvider';
import AnimatedSacredBackground from '@/components/AnimatedSacredBackground';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'sermon' | 'notion' | 'school' | 'qt' | 'worship'>('sermon');
  const [showDashboardModal, setShowDashboardModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleUploadSuccess = (sermonId: string) => {
    router.push(`/workspace?id=${sermonId}`);
  };

  const handleCopySnippet = (text: string, key: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const isLoggedIn = !loading && !!user;

  return (
    <div className="relative min-h-screen text-slate-100 font-sans selection:bg-amber-400/20 selection:text-amber-200">
      {/* 🌟 살아 움직이는 오로라 & 은은한 빛가루 파티클 애니메이션 배경 */}
      <AnimatedSacredBackground />

      {/* ════════════════════════════════════════════════════════════
          1. HERO SECTION (목회자의 고뇌를 품은 온기 있는 첫인상)
         ════════════════════════════════════════════════════════════ */}
      <section className="relative pt-24 pb-20 md:pt-36 md:pb-28 overflow-hidden border-b border-white/[0.07]">
        {/* Subtle Warm Atmospheric Light (자연스러운 촛불/서재 조명감) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[480px] bg-gradient-to-b from-amber-500/[0.08] via-indigo-600/[0.05] to-transparent blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-blue-600/[0.04] rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-5 sm:px-8 text-center space-y-7">
          
          {/* Subtle Warm Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-slate-300 text-xs sm:text-sm font-medium backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>한국 교회를 섬기는 비영리 사역 연구실 · 100% 영구 무료</span>
          </div>

          {/* Sincere Human Headline */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.22] text-white">
              말씀을 연구하고 영혼을 돌보는 일에만,<br />
              <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 bg-clip-text text-transparent font-extrabold">
                온전히 마음을 쏟으실 수 있도록.
              </span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-300/90 leading-relaxed max-w-2xl mx-auto font-normal">
              토요일 밤 설교 원고의 깊은 고뇌부터, 주일 아침 분반 아이들을 향한 공지문,<br className="hidden sm:inline" />
              온 가족이 식탁에서 나누는 매일의 묵상까지 — 목회의 모든 현장을 묵묵히 뒷받침합니다.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-wrap justify-center items-center gap-3.5">
            {!isLoggedIn ? (
              <a
                href="#demo-upload"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-amber-400/20 active:scale-[0.98] transition-all"
              >
                <BookOpen className="w-4 h-4 text-slate-900" />
                <span>설교 원고 1초 체험하기</span>
                <ArrowRight className="w-4 h-4 text-slate-900" />
              </a>
            ) : (
              <button
                onClick={() => setShowDashboardModal(true)}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-amber-400/20 active:scale-[0.98] transition-all"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-900" />
                <span>사역 대시보드 바로가기</span>
                <ArrowRight className="w-4 h-4 text-slate-900" />
              </button>
            )}

            <Link
              href="/notion"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] text-white font-semibold text-sm sm:text-base border border-white/10 active:scale-[0.98] transition-all"
            >
              <Crown className="w-4 h-4 text-amber-300" />
              <span>사역자 세컨드 브레인 스튜디오</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="pt-4 flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>회원가입 없이 즉시 체험 가능</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>신용카드 등록 요구 없음</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>개척교회·주일학교 현장 맞춤 설계</span>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          2. LIVE MINISTRY DESK (실제 사역 데스크탑 인터랙티브 쇼케이스)
         ════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-[#080C16]/65 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-10">

          <div className="text-center space-y-2.5 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-amber-300 tracking-wider uppercase">
              HANDCRAFTED MINISTRY WORKFLOWS
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
              실제 사역의 흐름을 그대로 담았습니다
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-normal">
              복잡한 기계식 AI가 아닙니다. 목회 현장의 언어와 서식을 그대로 담아낸 5가지 사역 도구를 미리 살펴보세요.
            </p>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto scrollbar-hide pb-2">
            {[
              { id: 'sermon', label: '설교 연구 & 6종 가공', icon: BookOpen },
              { id: 'notion', label: '사역자 세컨드 브레인', icon: Crown },
              { id: 'school', label: '교회학교 스마트 공지문', icon: MessageSquare },
              { id: 'qt', label: '세대별 매일 큐티', icon: Heart },
              { id: 'worship', label: '예배 콘티 & PPT', icon: Music2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all ${
                    isActive
                      ? 'bg-white text-slate-950 shadow-md shadow-white/10 scale-[1.02]'
                      : 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.09] hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Interactive Preview Canvas */}
          <div className="rounded-3xl border border-white/10 bg-[#0E1322] shadow-2xl p-6 sm:p-8 md:p-10 transition-all">
            
            {/* ── TAB 1: 설교 연구 & 6종 가공 ── */}
            {activeTab === 'sermon' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-5 text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>설교 준비의 품격을 지키는 연구실</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    원고 한 편으로 완성되는<br />
                    6가지 목회 양육 자료
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-normal font-normal">
                    작성하신 설교문(.hwp, .docx, .txt)을 넣으면 본문의 성경적 원맥을 분석하고,
                    성도용 요약문, 구역·소그룹 나눔 질문, 교회 SNS 카드뉴스, 유튜브 쇼츠 대본까지 서식 그대로 완성합니다.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>박영선·로이드존스·존 파이퍼 강해 모델 기반 분석</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>노션(Notion)에 1초 만에 그대로 붙여넣는 서식 보존 복사</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>설교 표절·단순 요약이 아닌 목회자 중심적 2차 나눔 설계</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link
                      href="/workspace"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm transition-all"
                    >
                      <span>말씀 연구실 체험하기</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#070A14] rounded-2xl border border-white/10 p-5 sm:p-6 space-y-4 shadow-inner text-left font-sans">
                  {/* Mock Window Top Bar */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      <span className="text-slate-400 font-mono ml-2">로마서 8:28 설교 연구 프로젝트</span>
                    </div>
                    <span className="text-[11px] text-amber-300 font-semibold">완료 (6종 가공)</span>
                  </div>

                  {/* Mock Content Snippet */}
                  <div className="space-y-3">
                    <div className="bg-white/[0.04] p-3.5 rounded-xl border border-white/5 space-y-1.5">
                      <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">소그룹 나눔 질문 1선</span>
                      <p className="text-xs text-white font-medium">
                        &quot;우리의 연약함에도 불구하고, 하나님이 모든 것을 합력하여 선을 이루셨던 개인적인 은혜의 순간은 언제였습니까?&quot;
                      </p>
                    </div>

                    <div className="bg-white/[0.04] p-3.5 rounded-xl border border-white/5 space-y-1.5">
                      <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">교회 인스타그램 카드뉴스 헤드라인</span>
                      <p className="text-xs text-white font-medium">
                        &quot;지금 겪는 고난의 조각도, 하나님의 손에서는 거룩한 퍼즐이 됩니다.&quot;
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                      <span>📌 노션(Notion) 붙여넣기 완벽 호환</span>
                      <button
                        onClick={() => handleCopySnippet("로마서 8:28 소그룹 나눔 및 설교 요약 예시", "sermon")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-all"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedKey === 'sermon' ? '복사 완료!' : '노션 서식으로 복사'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: 사역자 세컨드 브레인 ── */}
            {activeTab === 'notion' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-5 text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-300/30">
                    <Crown className="w-3.5 h-3.5 fill-amber-300" />
                    <span>노션 기반 마스터 워크스페이스</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    목회의 모든 흩어진 메모를<br />
                    PARA 구조로 단번에 정리
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-normal font-normal">
                    노트북, 카톡, 수첩에 흩어져 있던 설교 원고, 성도 심방 기록, 행사 기획, 찬양 콘티를 
                    검증된 PARA(Projects, Areas, Resources, Archives) 체계로 묶어낸 사역자 전용 템플릿과 웹 스튜디오입니다.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>성경 66권 주석 & 설교 아카이브 1:1 매핑 데이터베이스</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>별도 설치 없는 전용 웹 스튜디오 (`/notion`) 실시간 연동</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>1초 복제 가능한 공식 노션 템플릿 무료 배포</span>
                    </li>
                  </ul>
                  <div className="pt-2 flex items-center gap-3">
                    <Link
                      href="/notion"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm transition-all"
                    >
                      <span>전용 웹사이트 바로가기</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                    </Link>
                    <Link
                      href="/qt/templates"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm border border-white/10 transition-all"
                    >
                      <span>템플릿 다운로드</span>
                      <Download className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#070A14] rounded-2xl border border-white/10 p-5 sm:p-6 space-y-4 shadow-inner text-left">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs">
                    <span className="font-bold text-slate-200">🗂️ Bunker 사역자 세컨드 브레인 DB</span>
                    <span className="text-slate-400 text-[11px]">PARA MASTER HUB</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/5 space-y-1">
                      <span className="text-[10px] font-bold text-indigo-300">🎯 PROJECTS</span>
                      <p className="font-semibold text-white">가을 특별 새벽기도회</p>
                      <p className="text-[11px] text-slate-400">설교 10회차 원고 & 포스터</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/5 space-y-1">
                      <span className="text-[10px] font-bold text-emerald-300">🌿 AREAS</span>
                      <p className="font-semibold text-white">3교구 심방 & 기도제목</p>
                      <p className="text-[11px] text-slate-400">가정별 심방 일지 & 응답 기록</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/5 space-y-1">
                      <span className="text-[10px] font-bold text-amber-300">📚 RESOURCES</span>
                      <p className="font-semibold text-white">성경 66권 주석 연구</p>
                      <p className="text-[11px] text-slate-400">헬라어·히브리어 원어 단어장</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/5 space-y-1">
                      <span className="text-[10px] font-bold text-purple-300">📦 ARCHIVES</span>
                      <p className="font-semibold text-white">지난 3년간의 절기 설교</p>
                      <p className="text-[11px] text-slate-400">부활절·성탄절 원고 보관함</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 3: 교회학교 스마트 공지문 ── */}
            {activeTab === 'school' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-5 text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>주일학교 교사의 토요일 밤을 지키는 도구</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    학부모 카카오톡 공지문과<br />
                    수련회 모바일 접수를 3분 만에
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-normal font-normal">
                    문자, 카카오톡 옐로우 버블, 가정통신문 등 부서별·상황별 맞춤 안내문을 자동 작성하고,
                    학부모님이 폰에서 터치 한 번으로 등록하는 모바일 참가 신청서 링크를 제공합니다.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>유치부·초등부·청소년부·청년부 4대 부서 맞춤 톤앤매너</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>수련회·성경학교 현장 QR 모바일 출석 체크인 지원</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>참석자 명단 엑셀(CSV) 1-클릭 다운로드</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link
                      href="/school/notice-writer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all"
                    >
                      <span>공지문 작성기 열기</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#070A14] rounded-2xl border border-white/10 p-5 sm:p-6 space-y-3.5 shadow-inner text-left font-sans">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5 text-xs">
                    <span className="font-bold text-slate-200">💬 카카오톡 학부모 공지문 미리보기</span>
                    <span className="text-emerald-400 text-[11px] font-semibold">복사 즉시 전송 가능</span>
                  </div>

                  <div className="bg-[#FAE100] text-slate-900 p-4 rounded-2xl rounded-tl-xs space-y-2 max-w-md shadow-md text-xs leading-relaxed">
                    <p className="font-bold text-[13px]">🌿 [유초등부 여름성경학교 신청 안내]</p>
                    <p>샬롬, 학부모님! 무더운 여름, 우리 아이들의 영적 성장을 위한 2026 여름성경학교가 열립니다.</p>
                    <div className="bg-black/[0.06] p-2 rounded-lg text-[11px] space-y-0.5">
                      <p>• 일시: 8월 14일(토) ~ 15일(주일)</p>
                      <p>• 주제: 믿음의 모험을 떠나요 (히브리서 11:1)</p>
                      <p>• 모바일 신청 링크: bunker.ai.kr/event/summer-camp</p>
                    </div>
                    <p className="text-[11px] text-slate-700">기도로 함께 동역해 주시길 부탁드립니다. 🙏</p>
                  </div>

                  <div className="flex items-center justify-end pt-1">
                    <button
                      onClick={() => handleCopySnippet("유초등부 여름성경학교 카카오톡 공지문 예시", "school")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedKey === 'school' ? '복사 완료!' : '카카오톡 서식 복사'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 4: 세대별 매일 큐티 ── */}
            {activeTab === 'qt' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-5 text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 text-xs font-bold border border-rose-500/30">
                    <Heart className="w-3.5 h-3.5" />
                    <span>가정과 온 성도를 위한 말씀 서재</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    온 가족이 같은 본문으로<br />
                    매일 묵상하고 식탁에서 나눕니다
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-normal font-normal">
                    어린 자녀의 눈높이에 맞춘 질문부터 청소년, 어른들을 위한 깊이 있는 묵상 해설까지
                    날마다 같은 본문으로 채워지는 세대 통합 큐티 아카이브와 출력용 묵상 팩을 제공합니다.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>유치부·초등부·청소년·장년 4단계 묵상 본문 매일 갱신</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>가정 식탁 나눔 질문 & 카카오톡 은혜 나눔 카드</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>출력하여 바로 쓰는 QT 묵상 다이어리 팩 연동</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link
                      href="/qt"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm transition-all"
                    >
                      <span>오늘의 큐티 읽기</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#070A14] rounded-2xl border border-white/10 p-5 sm:p-6 space-y-3.5 shadow-inner text-left font-serif">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5 text-xs font-sans">
                    <span className="font-bold text-slate-200">📖 오늘의 말씀과 묵상</span>
                    <span className="text-rose-400 text-[11px] font-semibold">시편 23편 1-3절</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.04] border border-white/5 space-y-2">
                    <p className="text-sm font-semibold text-amber-200 leading-relaxed">
                      &quot;여호와는 나의 목자시니 내게 부족함이 없으리로다. 그가 나를 푸른 풀밭에 누이시며 쉴 만한 물 가로 인도하시는도다.&quot;
                    </p>
                    <p className="text-xs text-slate-300 font-sans leading-normal pt-1 border-t border-white/5">
                      💡 <strong>오늘의 한 줄 묵상:</strong> 목자 되신 주님께 나의 오늘 염려를 맡길 때, 영혼에 비로소 참된 쉼이 시작됩니다.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 5: 예배 콘티 & PPT ── */}
            {activeTab === 'worship' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-5 text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 text-xs font-bold border border-purple-500/30">
                    <Music2 className="w-3.5 h-3.5" />
                    <span>찬양팀과 방송실의 호흡을 잇다</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    은혜로운 찬양 선곡부터<br />
                    예배 슬라이드까지 10분 완성
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-normal font-normal">
                    예배 주제에 맞춘 찬양 곡별 조옮김(Key), 송폼, 유튜브 레퍼런스 링크를 팀원들과 실시간으로 공유하고,
                    성경 구절과 가사를 담은 깔끔한 16:9 와이드 PPT를 클릭 한 번으로 내려받습니다.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>찬양팀원을 위한 모바일 콘티 공유 링크 생성</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>예배 봉독 성경 구절 & 가사 자동 슬라이드 분할 PPT</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>절기별·주제별 찬양 곡 데이터베이스 보관</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link
                      href="/school/ppt-studio"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm transition-all"
                    >
                      <span>PPT 스튜디오 열기</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#070A14] rounded-2xl border border-white/10 p-5 sm:p-6 space-y-3 shadow-inner text-left">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5 text-xs">
                    <span className="font-bold text-slate-200">🎵 주일 찬양 콘티 (4곡 셋리스트)</span>
                    <span className="text-purple-400 text-[11px] font-semibold">16:9 PPT 다운로드 가능</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.04] border border-white/5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-white/10 text-[10px] font-bold flex items-center justify-center">1</span>
                        <span className="font-medium text-white">꽃들도 (Flowers)</span>
                      </div>
                      <span className="text-[11px] font-mono text-purple-300">Key: G ➔ A</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.04] border border-white/5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-white/10 text-[10px] font-bold flex items-center justify-center">2</span>
                        <span className="font-medium text-white">은혜 아니면 (Grace Alone)</span>
                      </div>
                      <span className="text-[11px] font-mono text-purple-300">Key: C</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.04] border border-white/5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-white/10 text-[10px] font-bold flex items-center justify-center">3</span>
                        <span className="font-medium text-white">주 은혜임을 (Lord, It Is Your Grace)</span>
                      </div>
                      <span className="text-[11px] font-mono text-purple-300">Key: D</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          3. OUR PHILOSOPHY & MANIFESTO (진심 어린 사역 선언문)
         ════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#0A0E1A]/40 backdrop-blur-sm relative border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center space-y-12">
          
          <div className="space-y-4">
            <span className="text-xs font-bold text-amber-300 tracking-wider uppercase">
              WHY WE SERVE THE CHURCH
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-snug">
              &ldquo;기술은 결코 성령의 감동과<br className="hidden sm:inline" />
              목회자의 눈물을 대신할 수 없습니다.&rdquo;
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
              우리는 설교를 기계로 대체하려는 것이 아닙니다.<br className="hidden sm:inline" />
              목회자가 말씀을 묵상하고 영혼을 심방하는 본질적인 목양의 시간에 머무르실 수 있도록,<br className="hidden sm:inline" />
              반복되는 문서 작업과 행정의 무거운 짐을 덜어드리는 묵묵한 도구가 되고자 합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-300 font-bold">
                01
              </div>
              <h4 className="text-base font-bold text-white">말씀의 권위와 깊이 보존</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                단순 요약이나 임의 생성이 아닌, 목회자가 작성하신 성경 원맥과 강해 모델의 맥락을 존중하여 2차 양육 자료로 확장합니다.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-400/10 flex items-center justify-center text-indigo-300 font-bold">
                02
              </div>
              <h4 className="text-base font-bold text-white">목회 현장 1:1 밀착 서식</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                노션 서식 100% 보존 복사, 카카오톡 알림톡 서식, 16:9 슬라이드 등 주일 사역 현장에서 마우스 한 번으로 쓰이는 실무 서식을 제공합니다.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center text-emerald-300 font-bold">
                03
              </div>
              <h4 className="text-base font-bold text-white">재정적 장벽 없는 영구 무료</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                작은 개척교회도, 시골 교회의 유일한 교사도 비용 부담 없이 최고의 사역 도구를 누리실 수 있도록 평생 무료로 운영합니다.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          4. WHO CAN BENEFIT (공동체 구성원별 안내)
         ════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-[#080C16]/65 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-10">

          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              교회의 모든 사역자가 함께 누립니다
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              각자의 사역 현장에서 가장 필요한 도구로 연결됩니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
            
            {/* 교역자 */}
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-sm">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">교역자 · 사역자</h4>
                  <p className="text-[11px] text-indigo-300 font-medium">설교 준비 & 말씀 연구실</p>
                </div>
                <p className="text-xs text-slate-400 leading-normal">
                  설교 원맥 분석, 강해 모델 아웃라인, 소그룹 질문지 생성 및 노션 템플릿 아카이빙
                </p>
              </div>
              <Link
                href="/workspace"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300 hover:text-white pt-3 border-t border-white/5 transition-colors"
              >
                <span>설교 연구실 가기</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 주일학교 교사 */}
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-sm">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">교회학교 교사</h4>
                  <p className="text-[11px] text-emerald-300 font-medium">공지문 & 행사 체크인</p>
                </div>
                <p className="text-xs text-slate-400 leading-normal">
                  학부모 카카오톡 공지문 작성기, 수련회 모바일 참가 신청서 링크 및 실시간 출석 체크
                </p>
              </div>
              <Link
                href="/school"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-white pt-3 border-t border-white/5 transition-colors"
              >
                <span>교회학교 솔루션</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 예배자 & 찬양팀 */}
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-sm">
                  <Music2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">찬양팀 & 방송실</h4>
                  <p className="text-[11px] text-purple-300 font-medium">예배 콘티 & PPT</p>
                </div>
                <p className="text-xs text-slate-400 leading-normal">
                  찬양 조옮김 및 모바일 콘티 시트 공유, 성경 봉독 및 찬양 가사 자동 PPT 다운로드
                </p>
              </div>
              <Link
                href="/school/ppt-studio"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-300 hover:text-white pt-3 border-t border-white/5 transition-colors"
              >
                <span>PPT 스튜디오</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 성도 & 가정 */}
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold text-sm">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">온 성도 & 가정</h4>
                  <p className="text-[11px] text-rose-300 font-medium">세대별 매일 큐티</p>
                </div>
                <p className="text-xs text-slate-400 leading-normal">
                  유치부부터 장년까지 같은 본문 세대 통합 묵상, 가족 나눔 질문과 묵상 다이어리
                </p>
              </div>
              <Link
                href="/qt"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-300 hover:text-white pt-3 border-t border-white/5 transition-colors"
              >
                <span>큐티 아카이브</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          5. INSTANT SERMON EXPERIMENT SANDBOX (즉시 체험존)
         ════════════════════════════════════════════════════════════ */}
      <section id="demo-upload" className="py-20 md:py-28 bg-[#0A0E1A]/40 backdrop-blur-sm border-b border-white/[0.06]">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 text-center space-y-8">
          
          <div className="space-y-3">
            <span className="text-xs font-bold text-amber-300 tracking-wider uppercase">
              EXPERIENCE RIGHT NOW
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              지금 설교 원고 파일 하나를 올려보세요
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-normal">
              복잡한 절차 없이, 지금 준비 중이신 원고(.hwp, .docx, .txt)를 넣으면<br className="hidden sm:inline" />
              소그룹 나눔과 카드뉴스 기획안이 즉시 눈앞에 펼쳐집니다.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0E1322] p-6 sm:p-8 shadow-2xl">
            {isLoggedIn ? (
              <FileUpload onSuccess={handleUploadSuccess} dark />
            ) : (
              <div className="space-y-5 text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.06] flex items-center justify-center mx-auto text-slate-300">
                  <ScrollText className="w-7 h-7 text-amber-300" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">
                    가입 즉시 무제한 무료로 이용하실 수 있습니다
                  </h4>
                  <p className="text-xs text-slate-400">
                    이메일 하나로 30초 만에 시작하여 모든 사역 솔루션을 평생 무료로 누리세요.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/login?redirect=/"
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-400/20 active:scale-[0.98] transition-all"
                  >
                    <span>무료로 시작하기</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </Link>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          6. FAQ (사역자들의 솔직한 궁금증)
         ════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-[#080C16]/65 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 space-y-8 text-left">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              자주 묻는 질문
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              사역자분들이 가장 많이 질문해 주시는 내용입니다.
            </p>
          </div>

          <div className="space-y-3.5">
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-300 shrink-0" />
                <span>AI가 설교 원고를 임의로 작성해 주는 방식인가요?</span>
              </h4>
              <p className="text-xs text-slate-300 leading-normal pl-6">
                아닙니다. 설교는 하나님과 목회자 간의 깊은 기도와 묵상에서 나오는 고유한 영적 열매입니다. 
                본 플랫폼은 목회자가 작성하신 설교 원고를 바탕으로, 소그룹 질문지, 성도용 요약문, 카드뉴스 등 
                사역에 꼭 필요한 2차 양육 자료로 가공해 드리는 ‘연구 보조 도구’입니다.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-300 shrink-0" />
                <span>정말 모든 기능이 평생 무료인가요?</span>
              </h4>
              <p className="text-xs text-slate-300 leading-normal pl-6">
                네, 그렇습니다. Bunker 목양 연구소는 한국 교회를 섬기기 위해 시작된 비영리 사역 프로젝트입니다. 
                작은 개척교회나 농어촌 교회도 재정적 부담 없이 최고의 사역 도구를 누리실 수 있도록 평생 무료로 개방합니다.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-300 shrink-0" />
                <span>올린 설교 원고와 성도 정보의 보안은 안전한가요?</span>
              </h4>
              <p className="text-xs text-slate-300 leading-normal pl-6">
                모든 데이터는 암호화되어 안전하게 전송 및 보관되며, 목회자님의 고유 자산으로 철저히 보호됩니다. 
                외부에 공개되거나 상업적 용도로 재학습되지 않으니 안심하고 이용하셔도 좋습니다.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          7. GENTLE CLOSING (따뜻한 마무리와 초대)
         ════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#0A0E1A]/40 backdrop-blur-sm text-center">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center mx-auto text-amber-300">
            <Church className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            오늘도 묵묵히 사역의 자리를 지키시는<br />
            당신의 수고를 깊이 응원합니다.
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-normal">
            번잡한 행정 노동은 Bunker에 맡기시고,<br />
            오직 기도와 말씀, 영혼을 돌보는 기쁨을 회복하세요.
          </p>

          <div className="pt-3">
            <Link
              href="/notion"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-400/20 active:scale-[0.98] transition-all"
            >
              <span>사역자 세컨드 브레인 스튜디오 열기</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </Link>
          </div>
        </div>
      </section>

      {/* 대시보드 팝업 모달 */}
      {showDashboardModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setShowDashboardModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-[#0F1424] border border-white/10 p-6 sm:p-7 shadow-2xl text-left"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white">어디로 이동할까요?</h3>
              <button
                onClick={() => setShowDashboardModal(false)}
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white"
                aria-label="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-5">필요하신 사역 공간을 선택하세요</p>

            <div className="space-y-2.5">
              <Link
                href="/dashboard"
                onClick={() => setShowDashboardModal(false)}
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
                onClick={() => setShowDashboardModal(false)}
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
                onClick={() => setShowDashboardModal(false)}
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
                onClick={() => setShowDashboardModal(false)}
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
                onClick={() => setShowDashboardModal(false)}
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
