'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, Download, Eye, ChevronRight, Filter, X, Grid, BookOpen, Clock, TrendingUp, Check, Bookmark } from 'lucide-react';
import { CATEGORY_LABELS, CATEGORY_ICONS, type Category } from '@/data/resources';
import { useAuth } from '@/components/AuthProvider';
import LoginModal from '@/components/LoginModal';
import { getDBResources, toggleFavorite, getFavorites } from '@/lib/db';

const ALL_CATEGORIES: (Category | 'all')[] = ['all', 'parent_comm', 'teacher_edu', 'operation', 'season_event'];

export default function ResourcesPage() {
  const [dbResources, setDbResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'views' | 'downloads'>('latest');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // Mobile Filter Drawer State
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Bookmark State
  const [bookmarkIds, setBookmarkIds] = useState<Set<string>>(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { isLoggedIn, user } = useAuth();

  // 1. Load resources from DB
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const data = await getDBResources();
        setDbResources(data);
      } catch (err) {
        console.error('리소스 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  // 2. Load user's bookmarks
  useEffect(() => {
    if (!isLoggedIn || !user) {
      setBookmarkIds(new Set());
      return;
    }
    const fetchBookmarks = async () => {
      try {
        const data = await getFavorites(user.id);
        setBookmarkIds(new Set(data.map((b: any) => b.id)));
      } catch (err) {
        console.error('북마크 조회 실패:', err);
      }
    };
    fetchBookmarks();
  }, [isLoggedIn, user]);

  const handleToggleBookmark = async (resourceId: string) => {
    if (!isLoggedIn || !user) {
      setShowLoginModal(true);
      return;
    }
    try {
      const isAdded = await toggleFavorite(user.id, resourceId);
      setBookmarkIds(prev => {
        const next = new Set(prev);
        if (isAdded) {
          next.add(resourceId);
        } else {
          next.delete(resourceId);
        }
        return next;
      });
    } catch (err) {
      console.error('북마크 설정 실패:', err);
    }
  };

  // Extract all unique tags for the tag cloud (top 8 tags)
  const allTags = useMemo(() => {
    const tagsMap: Record<string, number> = {};
    dbResources.forEach((r) => {
      r.tags.forEach((t: string) => {
        tagsMap[t] = (tagsMap[t] || 0) + 1;
      });
    });
    return Object.entries(tagsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [dbResources]);

  // Filter & Sort Logic
  const filteredAndSorted = useMemo(() => {
    let result = dbResources.filter((r) => {
      // 1. Category Filter
      const matchesCategory = category === 'all' || r.category === category;
      
      // 2. Price Filter
      const matchesPrice = 
        priceFilter === 'all' || 
        (priceFilter === 'free' && r.isFree) || 
        (priceFilter === 'paid' && !r.isFree);
      
      // 3. Tag Filter
      const matchesTag = !selectedTag || r.tags.includes(selectedTag);

      // 4. Search Filter
      const matchesSearch = !search ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase()) ||
        r.tags.some((t: string) => t.includes(search.toLowerCase()));

      return matchesCategory && matchesPrice && matchesTag && matchesSearch;
    });

    // Sort Logic
    return result.sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'views') {
        return b.viewCount - a.viewCount;
      }
      if (sortBy === 'downloads') {
        return b.downloadCount - a.downloadCount;
      }
      return 0;
    });
  }, [dbResources, category, priceFilter, selectedTag, search, sortBy]);

  const clearAllFilters = () => {
    setCategory('all');
    setPriceFilter('all');
    setSelectedTag(null);
    setSearch('');
    setSortBy('latest');
  };

  return (
    <div className="min-h-screen bg-warm-50">
      
      {/* Header section */}
      <div className="bg-white border-b border-warm-100">
        <div className="container-custom py-8 md:py-12">
          <div className="max-w-3xl">
            <span className="text-xs font-bold text-mint-600 uppercase tracking-wider">자료 라이브러리</span>
            <h1 className="text-2xl md:text-4xl font-extrabold text-navy-900 mt-2 mb-3">교회학교 실무 자료센터</h1>
            <p className="text-xs md:text-sm text-navy-500 leading-relaxed">
              교회학교 부장 교사, 전도사, 목사님들이 매주 사용하는 검증된 행정 서식과 교육 자료들을 한번에 검색하고 활용하세요.
            </p>
          </div>
        </div>
      </div>

      {/* Main Search & Control Panel */}
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR: FILTERS (Desktop) */}
          <div className="hidden lg:block lg:col-span-3 space-y-6">
            
            {/* Filter Card */}
            <div className="bg-white rounded-2xl p-5 shadow-card border border-warm-100 space-y-6">
              <div className="flex items-center justify-between border-b border-warm-100 pb-3">
                <span className="font-bold text-navy-900 text-sm flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-mint-500" />
                  필터 설정
                </span>
                <button 
                  onClick={clearAllFilters}
                  className="text-[10px] font-semibold text-navy-400 hover:text-navy-700 hover:underline"
                >
                  초기화
                </button>
              </div>

              {/* 1. Category */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy-800">카테고리</label>
                <div className="flex flex-col gap-1.5">
                  {ALL_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`text-left text-xs px-3 py-2 rounded-lg font-semibold transition-all flex items-center justify-between ${
                        category === cat 
                          ? 'bg-navy-900 text-white shadow-sm' 
                          : 'text-navy-500 hover:bg-warm-50'
                      }`}
                    >
                      <span>{cat === 'all' ? '전체 자료' : CATEGORY_LABELS[cat]}</span>
                      {category === cat && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Price */}
              <div className="space-y-2 pt-2 border-t border-warm-100">
                <label className="text-xs font-bold text-navy-800">구분 (유/무료)</label>
                <div className="grid grid-cols-3 gap-1 bg-warm-50 p-1 rounded-lg">
                  {(['all', 'free', 'paid'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setPriceFilter(opt)}
                      className={`text-[10px] font-bold py-1.5 rounded-md transition-all ${
                        priceFilter === opt 
                          ? 'bg-white text-navy-900 shadow-xs' 
                          : 'text-navy-400 hover:text-navy-700'
                      }`}
                    >
                      {opt === 'all' ? '전체' : opt === 'free' ? '무료' : '유료'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Tags */}
              <div className="space-y-2 pt-2 border-t border-warm-100">
                <label className="text-xs font-bold text-navy-800">인기 키워드</label>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      className={`text-[10px] px-2.5 py-1 rounded-md font-semibold transition-all border ${
                        selectedTag === tag
                          ? 'bg-mint-500 text-white border-mint-500'
                          : 'bg-white text-navy-500 border-warm-200 hover:border-navy-300'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT VIEW: LISTINGS */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Search, Sort and Mobile Filter trigger */}
            <div className="bg-white rounded-2xl p-4 shadow-card border border-warm-100 flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Search Bar */}
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                <input
                  type="text"
                  placeholder="제목 또는 해시태그 검색..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-10 py-2.5 text-xs md:text-sm"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto border-t border-warm-100 md:border-0 pt-3 md:pt-0">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 text-xs font-bold text-navy-700 bg-warm-50 px-3 py-2 rounded-xl border border-warm-200"
                >
                  <Filter className="w-3.5 h-3.5 text-mint-500" />
                  필터 설정
                </button>

                {/* Sort Toggle */}
                <div className="flex items-center gap-1 bg-warm-50 p-1 rounded-lg">
                  <button
                    onClick={() => setSortBy('latest')}
                    className={`text-[10px] font-bold px-2.5 py-1.5 rounded-md transition-all flex items-center gap-1 ${
                      sortBy === 'latest' ? 'bg-white text-navy-900 shadow-xs' : 'text-navy-400 hover:text-navy-700'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    최신순
                  </button>
                  <button
                    onClick={() => setSortBy('views')}
                    className={`text-[10px] font-bold px-2.5 py-1.5 rounded-md transition-all flex items-center gap-1 ${
                      sortBy === 'views' ? 'bg-white text-navy-900 shadow-xs' : 'text-navy-400 hover:text-navy-700'
                    }`}
                  >
                    <TrendingUp className="w-3 h-3" />
                    인기순
                  </button>
                  <button
                    onClick={() => setSortBy('downloads')}
                    className={`text-[10px] font-bold px-2.5 py-1.5 rounded-md transition-all flex items-center gap-1 ${
                      sortBy === 'downloads' ? 'bg-white text-navy-900 shadow-xs' : 'text-navy-400 hover:text-navy-700'
                    }`}
                  >
                    <Download className="w-3 h-3" />
                    다운로드순
                  </button>
                </div>
              </div>

            </div>

            {/* List Metadata */}
            <div className="flex items-center justify-between text-xs text-navy-400 px-1">
              <div>
                검색 결과: <span className="font-bold text-navy-700">{filteredAndSorted.length}개</span>의 매칭 자료
              </div>
              {(category !== 'all' || priceFilter !== 'all' || selectedTag) && (
                <button onClick={clearAllFilters} className="text-mint-600 font-semibold hover:underline">
                  모든 조건 초기화
                </button>
              )}
            </div>

            {/* Listings Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="bg-white rounded-3xl p-6 border border-warm-100 shadow-card animate-pulse space-y-4">
                    <div className="h-28 bg-warm-100 rounded-2xl w-full" />
                    <div className="h-4 bg-warm-100 rounded-md w-3/4" />
                    <div className="h-3 bg-warm-100 rounded-md w-full" />
                    <div className="h-3 bg-warm-100 rounded-md w-5/6" />
                    <div className="flex gap-2 pt-2">
                      <div className="h-8 bg-warm-100 rounded-lg flex-1" />
                      <div className="h-8 bg-warm-100 rounded-lg w-10" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredAndSorted.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-warm-100 shadow-card">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-navy-900">원하시는 자료를 찾지 못했습니다</h3>
                <p className="text-xs text-navy-400 mt-1 mb-6">검색어 철자를 확인하시거나 다른 필터 설정을 적용해 보세요.</p>
                <button onClick={clearAllFilters} className="btn-secondary btn-sm">
                  전체 목록으로 돌아가기
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {filteredAndSorted.map((resource) => (
                  <div key={resource.id} className="card bg-white overflow-hidden flex flex-col justify-between group">
                    <div>
                      {/* Header visual */}
                      <div className="h-32 bg-gradient-to-br from-warm-100 to-warm-50 flex items-center justify-center relative border-b border-warm-100/50">
                        <span className="text-4xl group-hover:scale-110 transition-transform">{CATEGORY_ICONS[resource.category as keyof typeof CATEGORY_ICONS]}</span>
                        <span className="absolute top-3 left-3">
                          {resource.isFree ? (
                            <span className="badge-free">무료</span>
                          ) : (
                            <span className="badge-paid">₩{resource.price.toLocaleString()}</span>
                          )}
                        </span>
                        <button
                          onClick={(e) => { e.preventDefault(); handleToggleBookmark(resource.id); }}
                          className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/80 backdrop-blur border border-warm-200 text-navy-400 hover:text-orange-500 transition-colors"
                          title="즐겨찾기"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${bookmarkIds.has(resource.id) ? 'fill-orange-500 text-orange-500' : ''}`} />
                        </button>
                      </div>

                      {/* Info details */}
                      <div className="p-5 space-y-2">
                        <div className="flex items-center justify-between gap-1 text-[10px] text-navy-400 font-semibold">
                          <span>{CATEGORY_LABELS[resource.category as keyof typeof CATEGORY_LABELS]}</span>
                          <span>{resource.createdAt}</span>
                        </div>

                        <Link href={`/resources/${resource.id}`}>
                          <h3 className="text-sm md:text-base font-bold text-navy-900 line-clamp-1 group-hover:text-mint-600 transition-colors">
                            {resource.title}
                          </h3>
                        </Link>

                        <p className="text-xs text-navy-500 leading-relaxed line-clamp-2">
                          {resource.description}
                        </p>

                        <div className="flex flex-wrap gap-1 pt-1.5">
                          {resource.tags.slice(0, 3).map((tag: string) => (
                            <span key={tag} className="text-[9px] px-2 py-0.5 bg-warm-50 border border-warm-100 rounded text-navy-400">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-warm-100 flex items-center justify-between bg-warm-50/50">
                      <div className="flex items-center gap-2.5 text-[10px] text-navy-400">
                        <span className="flex items-center gap-0.5"><Download className="w-3 h-3" /> {resource.downloadCount}</span>
                        <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {resource.viewCount}</span>
                      </div>
                      <Link href={`/resources/${resource.id}`} className="text-xs font-bold text-mint-600 flex items-center gap-0.5 hover:underline">
                        자세히 보기
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      </div>

      {/* MOBILE FILTER MODAL / DRAWER */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
          <div className="bg-white w-80 h-full p-6 space-y-6 overflow-y-auto animate-slide-up flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-warm-200 pb-3">
                <span className="font-bold text-navy-950 flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-mint-500" />
                  필터 설정
                </span>
                <button onClick={() => setMobileFilterOpen(false)} className="text-navy-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 1. Category */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy-800">카테고리</label>
                <div className="flex flex-col gap-1">
                  {ALL_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`text-left text-xs px-3 py-2 rounded-lg font-semibold transition-all flex items-center justify-between ${
                        category === cat 
                          ? 'bg-navy-900 text-white shadow-sm' 
                          : 'text-navy-50 hover:bg-warm-50'
                      }`}
                    >
                      <span>{cat === 'all' ? '전체 자료' : CATEGORY_LABELS[cat]}</span>
                      {category === cat && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Price */}
              <div className="space-y-2 pt-2 border-t border-warm-100">
                <label className="text-xs font-bold text-navy-800">구분 (유/무료)</label>
                <div className="grid grid-cols-3 gap-1 bg-warm-50 p-1 rounded-lg">
                  {(['all', 'free', 'paid'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setPriceFilter(opt)}
                      className={`text-[10px] font-bold py-1.5 rounded-md transition-all ${
                        priceFilter === opt 
                          ? 'bg-white text-navy-900 shadow-xs' 
                          : 'text-navy-400 hover:text-navy-700'
                      }`}
                    >
                      {opt === 'all' ? '전체' : opt === 'free' ? '무료' : '유료'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Tags */}
              <div className="space-y-2 pt-2 border-t border-warm-100">
                <label className="text-xs font-bold text-navy-800">인기 키워드</label>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      className={`text-[10px] px-2.5 py-1 rounded-md font-semibold transition-all border ${
                        selectedTag === tag
                          ? 'bg-mint-500 text-white border-mint-500'
                          : 'bg-white text-navy-500 border-warm-200 hover:border-navy-300'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="btn-secondary w-full py-3"
            >
              필터 적용 완료
            </button>
          </div>
        </div>
      )}

      {/* LOGIN MODAL */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
