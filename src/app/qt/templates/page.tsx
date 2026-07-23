'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus, Search, ExternalLink, Heart, Sparkles,
  Copy, Check, Share2, Layers, Filter, CheckCircle2,
  X, User, Layout, MessageCircle, Download, Award, Star, Flame
} from 'lucide-react';

interface TemplateItem {
  id: string;
  title: string;
  author: string;
  role: string;
  church: string;
  category: string;
  type: 'Notion' | 'PPT' | 'Excel' | 'PDF';
  description: string;
  features: string[];
  tags: string[];
  link: string;
  likes: number;
  downloads: number;
  isUserAdded?: boolean;
  createdAt: string;
}

const INITIAL_TEMPLATES: TemplateItem[] = [
  {
    id: '1',
    title: '교회학교 통합 운영 대시보드 템플릿',
    author: '이동헌 목사',
    role: '총괄 목사',
    church: 'Bunker 목양',
    category: '부서 운영',
    type: 'Notion',
    description: '교사 명단, 주간 출석 체크, 부서 행사 일정, 공지사항을 한눈에 관리하는 노션 종합 대시보드입니다.',
    features: ['주간 출석률 자동 통계', '교사 업무 분담 표', '행사 준비물 체크리스트'],
    tags: ['교사 관리', '출석 데이터', '행사 일정', '부서 공지'],
    link: 'https://www.notion.so/templates',
    likes: 128,
    downloads: 452,
    createdAt: '2026.07.20',
  },
  {
    id: '2',
    title: '매일 큐티 & 묵상일지 노션 템플릿',
    author: '김은혜 전도사',
    role: '어린이부 전도사',
    church: '꿈미교회',
    category: '묵상·큐티',
    type: 'Notion',
    description: '유치부부터 장년까지, 매일의 말씀 묵상과 깨달음, 개인 기도제목을 축적하는 묵상일지 데이터베이스입니다.',
    features: ['본문 및 관찰/적용 구분', '기도 응답 기록장', '월별 묵상 회고'],
    tags: ['매일 큐티', '묵상 노트', '기도제목', '성경 구절'],
    link: 'https://www.notion.so/templates',
    likes: 95,
    downloads: 310,
    createdAt: '2026.07.21',
  },
  {
    id: '3',
    title: '수련회 & 여름성경학교 기획 노션 템플릿',
    author: '박사랑 교사',
    role: '초등부 부장교사',
    church: '빛과소금교회',
    category: '행사·수련회',
    type: 'Notion',
    description: '여름성경학교, 전교인 수련회의 타임테이블, 예산 편성, 조별 편성표, 준비물을 원스톱으로 관리합니다.',
    features: ['시간대별 프로그램표', '지출 및 예산 자동합계', '준비물 수량 체크'],
    tags: ['수련회', '여름성경학교', '예산 관리', '조별 편성'],
    link: 'https://www.notion.so/templates',
    likes: 84,
    downloads: 275,
    createdAt: '2026.07.22',
  },
  {
    id: '4',
    title: '성경 권별 설교 원고 보관함 템플릿',
    author: '최믿음 목사',
    role: '담임 목사',
    church: '은혜교회',
    category: '설교 연구',
    type: 'Notion',
    description: '성경 66권 본문별, 절기별, 설교 제목별로 지난 설교 원고와 아웃라인을 체계적으로 정리하는 노션 템플릿입니다.',
    features: ['성경 권별 필터링', '관련 예화 태그 시스템', '설교 시리즈 그룹화'],
    tags: ['설교 아웃라인', '본문 분류', '예화 보관함', '절기 설교'],
    link: 'https://www.notion.so/templates',
    likes: 112,
    downloads: 390,
    createdAt: '2026.07.18',
  },
  {
    id: '5',
    title: '주보 & 카드뉴스 기획 마스터 템플릿',
    author: '정지혜 전도사',
    role: '미디어 담당',
    church: '사랑의교회',
    category: '디자인·PPT',
    type: 'Notion',
    description: '주간 교회 소식, 예배 안내 문안, 절기별 이미지 아카이브를 팀원들과 함께 편집하는 디자인 기획 템플릿입니다.',
    features: ['주차별 소식 카테고리', '이미지 자산 보관함', '문안 검수 체크표'],
    tags: ['주보 기획', '카드뉴스', '이미지 아카이브', '절기 문안'],
    link: 'https://www.notion.so/templates',
    likes: 76,
    downloads: 215,
    createdAt: '2026.07.19',
  },
  {
    id: '6',
    title: '교사 회의록 & 기도제목 나눔 템플릿',
    author: '한샘 교사',
    role: '청소년부 교사',
    church: '온누리교회',
    category: '부서 운영',
    type: 'Notion',
    description: '매주 주일 교사 회의 내용을 기록하고 학생별 기도제목을 교사들이 동시 업데이트하는 공유 템플릿입니다.',
    features: ['주차별 회의록 작성', '학생별 1:1 기도제목', '다음 주 안건 공유'],
    tags: ['교사 회의록', '기도제목', '학생 케어', '청소년부'],
    link: 'https://www.notion.so/templates',
    likes: 63,
    downloads: 180,
    createdAt: '2026.07.23',
  },
];

const CATEGORIES = ['전체', '부서 운영', '묵상·큐티', '행사·수련회', '설교 연구', '디자인·PPT'];

export default function QtTemplatesLoungePage() {
  const [templates, setTemplates] = useState<TemplateItem[]>(INITIAL_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 모달 상태 및 새 템플릿 폼
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    role: '사역자',
    church: '',
    category: '부서 운영',
    type: 'Notion' as const,
    description: '',
    features: '',
    tags: '',
    link: '',
  });

  const handleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      const isLiked = next.has(id);
      if (isLiked) {
        next.delete(id);
        setTemplates((tpls) =>
          tpls.map((t) => (t.id === id ? { ...t, likes: t.likes - 1 } : t))
        );
      } else {
        next.add(id);
        setTemplates((tpls) =>
          tpls.map((t) => (t.id === id ? { ...t, likes: t.likes + 1 } : t))
        );
      }
      return next;
    });
  };

  const handleCopyLink = async (id: string, link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {}
  };

  const handleSubmitNewTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.link) {
      alert('템플릿 제목, 제작자 이름, 템플릿 링크는 필수 입력 항목입니다.');
      return;
    }

    const newItem: TemplateItem = {
      id: Date.now().toString(),
      title: formData.title,
      author: formData.author,
      role: formData.role || '사역자',
      church: formData.church || '한국교회',
      category: formData.category,
      type: formData.type,
      description: formData.description || '사역 현장을 위해 공유된 소중한 템플릿입니다.',
      features: formData.features
        ? formData.features.split(',').map((s) => s.trim())
        : ['사역 효율성 향상', '1-클릭 노션 복제', '무료 나눔'],
      tags: formData.tags
        ? formData.tags.split(',').map((s) => s.trim())
        : ['사역 템플릿', '노션', '무료 나눔'],
      link: formData.link.startsWith('http') ? formData.link : `https://${formData.link}`,
      likes: 1,
      downloads: 1,
      isUserAdded: true,
      createdAt: '방금 전',
    };

    setTemplates([newItem, ...templates]);
    setIsModalOpen(false);
    setFormData({
      title: '',
      author: '',
      role: '사역자',
      church: '',
      category: '부서 운영',
      type: 'Notion',
      description: '',
      features: '',
      tags: '',
      link: '',
    });
    alert('🎉 축하합니다! 템플릿 나눔이 성공적으로 등록되었습니다.');
  };

  const filteredTemplates = templates.filter((tpl) => {
    const matchCategory = selectedCategory === '전체' || tpl.category === selectedCategory;
    const matchSearch =
      tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent-soft selection:text-accent">

      {/* ════════════════════════════════════════════
          1. HERO SECTION
         ════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-20 border-b border-border/60 bg-surface/50">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-amber-100/40 via-rose-100/30 to-indigo-100/40 blur-3xl -z-10 opacity-70 pointer-events-none" />

        <div className="container-custom max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200/70 text-amber-800 text-xs md:text-sm font-bold shadow-2xs animate-fade-in">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>전국 사역자들의 지혜가 모이는 오픈 템플릿 라운지 🎁</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-navy-950 leading-[1.15] tracking-tight">
            사역자가 만들고 나눕니다<br />
            <span className="bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-600 bg-clip-text text-transparent">함께 세우는 사역 템플릿</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-navy-600 max-w-2xl mx-auto leading-relaxed font-medium">
            목회자, 전도사, 교회학교 선생님들이 직접 만든 노션·PPT 템플릿을 자유롭게 나누고 가져가세요.<br className="hidden sm:inline" />
            여러분의 작은 아이디어 하나가 한국 교회의 사역을 함께 세웁니다.
          </p>

          <div className="pt-4 flex flex-wrap justify-center items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white font-extrabold px-7 py-3.5 rounded-2xl text-sm md:text-base shadow-md shadow-rose-500/20 transition-all"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              내 템플릿 나눔하기
            </button>
            <a
              href="#lounge"
              className="inline-flex items-center gap-2 bg-white hover:bg-warm-50 active:scale-[0.98] text-navy-900 font-extrabold px-7 py-3.5 rounded-2xl text-sm md:text-base border border-warm-300 transition-all"
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              인기 템플릿 탐색 ({templates.length})
            </a>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          2. FILTER & SEARCH BAR
         ════════════════════════════════════════════ */}
      <section id="lounge" className="py-8 bg-surface border-b border-border/60 sticky top-16 z-30 backdrop-blur-md bg-opacity-95">
        <div className="container-custom max-w-6xl space-y-4">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-hide py-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold shrink-0 transition-all ${
                    selectedCategory === cat
                      ? 'bg-navy-950 text-white shadow-xs'
                      : 'bg-warm-100/80 text-navy-700 hover:bg-warm-200/70'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
              <input
                type="text"
                placeholder="템플릿, 제작자, 태그 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white border border-warm-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-400/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════
          3. TEMPLATES GRID
         ════════════════════════════════════════════ */}
      <section className="py-12 md:py-20">
        <div className="container-custom max-w-6xl space-y-8">

          {filteredTemplates.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-warm-200 space-y-4">
              <div className="w-16 h-16 rounded-full bg-warm-100 flex items-center justify-center mx-auto text-navy-400 text-2xl">
                🔍
              </div>
              <p className="text-base font-bold text-navy-800">검색 조건에 맞는 템플릿이 없습니다.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('전체'); }}
                className="text-xs text-rose-600 font-bold underline"
              >
                전체 목록으로 돌아가기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {filteredTemplates.map((tpl) => {
                const isLiked = likedIds.has(tpl.id);

                return (
                  <div
                    key={tpl.id}
                    className={`bg-white rounded-3xl p-6 border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${
                      tpl.isUserAdded ? 'border-amber-300 ring-2 ring-amber-400/30' : 'border-warm-200/80'
                    }`}
                  >
                    {/* User Added Ribbon Badge */}
                    {tpl.isUserAdded && (
                      <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl shadow-xs tracking-wider animate-pulse">
                        NEW 나눔 템플릿 ✨
                      </div>
                    )}

                    <div>
                      {/* Author Header */}
                      <div className="flex items-center justify-between gap-2 mb-4 pt-1">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-warm-100 flex items-center justify-center text-navy-700 font-bold text-xs border border-warm-200 shrink-0">
                            {tpl.author.substring(0, 1)}
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-navy-950 flex items-center gap-1">
                              <span>{tpl.author}</span>
                              <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/80 font-bold">
                                {tpl.role}
                              </span>
                            </p>
                            <p className="text-[11px] text-navy-500 font-medium">{tpl.church} · {tpl.createdAt}</p>
                          </div>
                        </div>

                        <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-[#37352f] text-white shrink-0">
                          {tpl.type}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-2 mb-4">
                        <h3 className="text-lg font-extrabold text-navy-950 group-hover:text-rose-600 transition-colors leading-snug">
                          {tpl.title}
                        </h3>
                        <p className="text-xs text-navy-600 leading-relaxed line-clamp-2 font-medium">
                          {tpl.description}
                        </p>
                      </div>

                      {/* Features */}
                      <div className="bg-warm-50/80 p-3 rounded-2xl border border-warm-100 space-y-1 mb-4">
                        {tpl.features.slice(0, 3).map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] text-navy-600 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-5">
                        {tpl.tags.map((tag) => (
                          <span key={tag} className="text-[10px] font-medium text-navy-500 bg-warm-100 px-2 py-0.5 rounded-md">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-warm-100 space-y-2">
                      <div className="flex items-center justify-between text-xs text-navy-500 font-bold mb-2">
                        <button
                          type="button"
                          onClick={() => handleLike(tpl.id)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all ${
                            isLiked
                              ? 'bg-rose-50 text-rose-600 border border-rose-200'
                              : 'hover:bg-warm-100 text-navy-600'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                          <span>{tpl.likes}</span>
                        </button>

                        <div className="flex items-center gap-1 text-[11px] text-navy-400">
                          <Download className="w-3.5 h-3.5" />
                          <span>{tpl.downloads}회 복제</span>
                        </div>
                      </div>

                      <a
                        href={tpl.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-extrabold text-xs bg-[#37352f] hover:bg-[#201f1c] text-white shadow-button transition-all"
                      >
                        <span>노션 템플릿 복제하기</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* ════════════════════════════════════════════
          4. SHARE MODAL (템플릿 나눔 모달)
         ════════════════════════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-warm-200 relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-warm-100 text-navy-400 hover:text-navy-700 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2 mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                템플릿 나눔 등록
              </div>
              <h2 className="text-2xl font-black text-navy-950">
                직접 만든 템플릿을 나누어 주세요 🎁
              </h2>
              <p className="text-xs text-navy-500 leading-relaxed">
                전국 사역자들과 나누고 싶은 노션 링크나 템플릿 정보를 등록해 주시면 자유롭게 공유됩니다.
              </p>
            </div>

            <form onSubmit={handleSubmitNewTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy-800 mb-1">
                  템플릿 제목 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 교회학교 주간 출석 & 교사 업무 종합 노션 템플릿"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-xs font-medium focus:ring-2 focus:ring-rose-400/50 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy-800 mb-1">
                    제작자 성함 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: 김은혜"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-xs font-medium focus:ring-2 focus:ring-rose-400/50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-800 mb-1">직분/역할</label>
                  <input
                    type="text"
                    placeholder="예: 전도사 / 교사"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-xs font-medium focus:ring-2 focus:ring-rose-400/50 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy-800 mb-1">소속 교회</label>
                  <input
                    type="text"
                    placeholder="예: 꿈미교회"
                    value={formData.church}
                    onChange={(e) => setFormData({ ...formData, church: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-xs font-medium focus:ring-2 focus:ring-rose-400/50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-800 mb-1">카테고리</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-xs font-medium focus:ring-2 focus:ring-rose-400/50 outline-none bg-white"
                  >
                    {CATEGORIES.filter((c) => c !== '전체').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-800 mb-1">
                  노션 / 파일 링크 URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://www.notion.so/..."
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-xs font-medium focus:ring-2 focus:ring-rose-400/50 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-800 mb-1">템플릿 소개 및 활용 팁</label>
                <textarea
                  rows={3}
                  placeholder="템플릿에 포함된 주요 기능이나 사역 현장에서 활용하는 팁을 간단히 적어주세요."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-xs font-medium focus:ring-2 focus:ring-rose-400/50 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-800 mb-1">핵심 기능 (쉼표로 구분)</label>
                <input
                  type="text"
                  placeholder="출석 자동통계, 회의록 서식, 업무분담"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-xs font-medium focus:ring-2 focus:ring-rose-400/50 outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-warm-200 text-xs font-bold text-navy-600 hover:bg-warm-100 transition-all"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-extrabold shadow-md shadow-rose-500/20 transition-all"
                >
                  템플릿 나눔 등록하기 ✨
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          5. BOTTOM CTA
         ════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-navy-950 text-white relative overflow-hidden">
        <div className="container-custom max-w-3xl relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <Heart className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            함께 세우는 사역 공동체
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            당신의 사역 템플릿 하나가<br />
            <span className="text-amber-400">전국 작은 교회의 힘이 됩니다</span>
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-navy-300 max-w-lg mx-auto leading-relaxed">
            지금 사역 현장에서 직접 만드신 템플릿이 있다면 언제든지 나눔터에 자랑해 주세요!
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-extrabold px-7 py-3.5 rounded-2xl text-sm sm:text-base shadow-lg shadow-rose-500/20 transition-all"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              지금 내 템플릿 나눔하기
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
