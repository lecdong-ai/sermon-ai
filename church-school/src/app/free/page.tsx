'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Download, Search, Sparkles, FileText, ArrowRight, Eye, ChevronRight } from 'lucide-react';
import { resources, CATEGORY_LABELS, CATEGORY_ICONS } from '@/data/resources';

export default function FreeResourcesPage() {
  const [search, setSearch] = useState('');

  const freeList = useMemo(() => {
    return resources.filter((r) => {
      if (!r.isFree) return false;
      const matchesSearch = !search ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase()) ||
        r.tags.some(t => t.includes(search.toLowerCase()));
      return matchesSearch;
    });
  }, [search]);

  return (
    <div className="min-h-screen bg-warm-50 pb-16">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 text-white border-b border-warm-100">
        <div className="container-custom py-12 md:py-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-mint-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-mint-500/20 text-mint-300 text-[10px] md:text-xs font-bold mb-4 border border-mint-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>회원가입만 해도 모든 무료 자료실 무제한 다운로드</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold mb-3">무료 사역 실무 자료실</h1>
            <p className="text-xs md:text-sm text-navy-200 leading-relaxed max-w-md mx-auto">
              초임 전도사님과 소형교회 사역자분들을 위해 준비한 검증된 행정 양식과 교육 가이드를 무료로 다운로드 받으실 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Search bar */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-warm-100 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
              <input
                type="text"
                placeholder="무료 자료 제목, 해시태그 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10 py-2.5 text-xs md:text-sm"
              />
            </div>
            <div className="text-xs font-bold text-navy-500 whitespace-nowrap">
              총 <span className="font-extrabold text-mint-600">{freeList.length}</span>개의 무료 자료 매칭됨
            </div>
          </div>

          {/* Grid list */}
          {freeList.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-card border border-warm-100">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-base font-bold text-navy-900 mb-1">검색 결과가 없습니다</h3>
              <p className="text-xs text-navy-400">다른 검색 키워드로 다시 찾아보세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {freeList.map((resource) => (
                <div key={resource.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-warm-200 flex flex-col justify-between hover:shadow-card transition-shadow group">
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="badge-free">무료</span>
                      <span className="text-[10px] text-navy-400 font-bold">
                        {CATEGORY_LABELS[resource.category as keyof typeof CATEGORY_LABELS]}
                      </span>
                    </div>

                    <Link href={`/resources/${resource.id}`}>
                      <h3 className="text-base font-extrabold text-navy-900 group-hover:text-mint-600 transition-colors line-clamp-1">
                        {resource.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-navy-500 leading-relaxed line-clamp-2">
                      {resource.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {resource.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 bg-warm-50 rounded-md text-navy-500 border border-warm-100">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-warm-50/50 border-t border-warm-100 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-3 text-[10px] text-navy-400">
                      <span className="flex items-center gap-0.5"><Download className="w-3.5 h-3.5" /> {resource.downloadCount}</span>
                      <span className="flex items-center gap-0.5"><Eye className="w-3.5 h-3.5" /> {resource.viewCount}</span>
                    </div>
                    
                    <Link href={`/resources/${resource.id}`} className="text-xs font-bold text-mint-600 flex items-center gap-0.5 hover:underline">
                      상세 다운로드
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Banner for Sign Up */}
          <div className="bg-gradient-to-r from-mint-50 to-warm-50 rounded-3xl p-6 md:p-8 border border-mint-200 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-base font-bold text-navy-900">
                더욱 다양한 고도화 서식을 활용해 보세요!
              </h3>
              <p className="text-xs text-navy-500">
                회원 등록 후 마이페이지를 이용하시면 내가 수정한 공지문 보관 및 다운로드 내역이 안전하게 평생 보관됩니다.
              </p>
            </div>
            <button 
              onClick={() => {
                localStorage.setItem('cs_is_logged_in', 'true');
                alert('가상 회원가입 및 로그인이 완료되었습니다. 이제 마이페이지가 활성화됩니다!');
              }}
              className="btn-primary whitespace-nowrap w-full md:w-auto text-xs py-3.5 flex items-center justify-center gap-1"
            >
              간편 3초 회원가입 진행
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
