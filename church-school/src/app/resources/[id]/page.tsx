'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  ArrowLeft, Download, FileText, Share2, Bookmark, Check, ShieldAlert, 
  ShoppingBag, Eye, Award, Info, HelpCircle, FileCheck, ShoppingCart, Lock 
} from 'lucide-react';
import { CATEGORY_LABELS } from '@/data/resources';
import { useAuth } from '@/components/AuthProvider';
import LoginModal from '@/components/LoginModal';
import { 
  getDBResourceById, 
  getFavorites, 
  toggleFavorite, 
  addRecentView, 
  getPurchasedResources, 
  addPurchase 
} from '@/lib/db';

interface PageProps {
  params: { id: string };
}

export default function ResourceDetailPage({ params }: PageProps) {
  const { id } = params;
  
  const [resource, setResource] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const { isLoggedIn, user, isPremium } = useAuth();

  // 1. Load Resource and Check Ownership
  useEffect(() => {
    const loadResource = async () => {
      setLoading(true);
      try {
        const data = await getDBResourceById(id);
        if (!data) {
          setResource(null);
          return;
        }
        setResource(data);

        // 2. Track viewed history if user is logged in
        if (isLoggedIn && user) {
          await addRecentView(user.id, id);
        }
      } catch (err) {
        console.error('리소스 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    loadResource();
  }, [id, isLoggedIn, user]);

  // 3. Load bookmarks & purchase histories of the user
  useEffect(() => {
    if (!isLoggedIn || !user || !resource) return;

    const checkUserStatus = async () => {
      try {
        const [bookmarks, purchases] = await Promise.all([
          getFavorites(user.id),
          getPurchasedResources(user.id)
        ]);

        const isSaved = bookmarks.some((b: any) => b.id === resource.id);
        setBookmarked(isSaved);

        const isBought = purchases.some((p: any) => p.id === resource.id);
        setHasPurchased(isBought);
      } catch (err) {
        console.error('사용자 상태 확인 실패:', err);
      }
    };

    checkUserStatus();
  }, [isLoggedIn, user, resource]);

  // Related resources (3 in the same category)
  const relatedResources = useMemo(() => {
    if (!resource) return [];
    // 간단히 하드코딩된 mock이나 DB 전체 조회 중 동일 카테고리 필터링이 가능하나
    // 여기서는 기존 로컬 resources 목록을 이용해 편의상 구현
    const { resources: localResources } = require('@/data/resources');
    return (localResources as any[])
      .filter((r) => r.category === resource.category && r.id !== resource.id)
      .slice(0, 3);
  }, [resource]);

  // Bookmark Toggle Handler
  const handleBookmarkToggle = async () => {
    if (!isLoggedIn || !user) {
      setShowLoginPrompt(true);
      return;
    }
    try {
      const isAdded = await toggleFavorite(user.id, resource.id);
      setBookmarked(isAdded);
    } catch (err) {
      console.error('북마크 업데이트 실패:', err);
    }
  };

  const handleDownload = () => {
    // 다운로드 권한 가딩
    const canDownload = resource.isFree || isPremium || hasPurchased;
    if (!canDownload) {
      if (!isLoggedIn) {
        setShowLoginPrompt(true);
      } else {
        alert('이 유료 자료를 다운로드하려면 단건 구매 또는 프리미엄 구독 멤버십이 필요합니다.');
      }
      return;
    }

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handlePurchase = async () => {
    if (!isLoggedIn || !user) {
      setShowLoginPrompt(true);
      return;
    }
    const confirmPay = confirm(`'${resource.title}' 자료를 ₩${resource.price.toLocaleString()}에 구매하시겠습니까?\n(MVP 가상 결제가 즉시 승인되며 소유권이 영구 지급됩니다)`);
    if (confirmPay) {
      try {
        await addPurchase(user.id, resource.id, resource.price);
        setPurchaseSuccess(true);
        setHasPurchased(true);
        setTimeout(() => setPurchaseSuccess(false), 3000);
      } catch (err) {
        console.error('결제 처리 실패:', err);
        alert('결제 처리 중 문제가 발생했습니다.');
      }
    }
  };

  const handleSaveToMypage = () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    handleBookmarkToggle();
    alert(bookmarked ? '즐겨찾기에서 해제되었습니다.' : '마이페이지 즐겨찾기 보관함에 저장되었습니다.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 py-24 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-850 mx-auto"></div>
          <p className="text-sm text-navy-500 font-medium">자료 상세 정보를 가져오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (!resource) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-warm-50 py-10">
      <div className="container-custom max-w-5xl">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/resources" className="text-xs md:text-sm text-navy-500 hover:text-navy-900 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            자료센터 목록으로 돌아가기
          </Link>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('자료 링크가 클립보드에 복사되었습니다.');
              }}
              className="p-2 rounded-xl bg-white border border-warm-200 text-navy-500 hover:bg-warm-100/50 transition-colors"
              title="링크 공유"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button 
              onClick={handleBookmarkToggle}
              className="p-2 rounded-xl bg-white border border-warm-200 text-navy-500 hover:bg-warm-100/50 transition-colors"
              title="즐겨찾기 추가"
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-orange-500 text-orange-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Detail Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Core Resource Specifications & Preview */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header info */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-card border border-warm-100 space-y-4">
              <div className="flex items-center gap-2">
                <span className="badge-category">{CATEGORY_LABELS[resource.category as keyof typeof CATEGORY_LABELS]}</span>
                {resource.isFree ? (
                  <span className="badge-free text-[10px]">무료 자료</span>
                ) : (
                  <span className="badge-paid text-[10px]">유료 프리미엄</span>
                )}
                <span className="text-xs text-navy-400 ml-auto">{resource.createdAt} 등록</span>
              </div>

              <h1 className="text-xl md:text-3xl font-extrabold text-navy-950 leading-tight">
                {resource.title}
              </h1>

              <p className="text-sm md:text-base text-navy-600 leading-relaxed">
                {resource.description}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {resource.tags.map((tag: string) => (
                  <span key={tag} className="text-xs px-2.5 py-1 bg-warm-50 border border-warm-200 rounded-md text-navy-500">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Structured specifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Box 1: 사용 대상 */}
              <div className="bg-white rounded-2xl p-6 shadow-card border border-warm-100 space-y-3">
                <h3 className="text-xs font-bold text-navy-400 uppercase tracking-wider">🎯 사용 추천 대상</h3>
                <div className="flex items-start gap-2 text-xs md:text-sm text-navy-800 font-semibold">
                  <span className="text-mint-500">✓</span>
                  <span>{resource.targetUser}</span>
                </div>
                <p className="text-xs text-navy-500 leading-relaxed">
                  해당 연령대를 담당하는 교육 전도사, 부장교사 및 신임 리더십이 바로 활용하기 최적화되어 있습니다.
                </p>
              </div>

              {/* Box 2: 포함 항목 리스트 */}
              <div className="bg-white rounded-2xl p-6 shadow-card border border-warm-100 space-y-3">
                <h3 className="text-xs font-bold text-navy-400 uppercase tracking-wider">📦 다운로드 포함 품목</h3>
                <ul className="space-y-1.5 text-xs text-navy-700">
                  {resource.includes.map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-1.5 font-medium">
                      <FileCheck className="w-3.5 h-3.5 text-mint-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Markdown Preview Content */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-card border border-warm-100 space-y-4">
              <h2 className="text-base font-bold text-navy-900 border-b border-warm-100 pb-3 flex items-center gap-1.5">
                <FileText className="w-5 h-5 text-mint-500" />
                자료 샘플 미리보기
              </h2>

              <div className="bg-warm-50 border border-warm-100 rounded-xl p-5 md:p-6 overflow-x-auto">
                <pre className="text-xs md:text-sm text-navy-800 whitespace-pre-wrap font-sans leading-relaxed">
                  {resource.content}
                </pre>
              </div>
              <p className="text-[11px] text-navy-400 text-center">
                * 위 내용은 미리보기용 샘플 텍스트입니다. 원본 패키지 파일 다운로드 시 한글/PPTX/Excel 등의 고해상도 포맷으로 제공됩니다.
              </p>
            </div>

            {/* Bottom Guideline Section */}
            <div className="bg-white rounded-3xl p-6 shadow-card border border-warm-100 space-y-4 text-xs text-navy-500 leading-relaxed">
              <h3 className="font-bold text-navy-900 text-sm flex items-center gap-1">
                <Info className="w-4 h-4 text-navy-400" />
                자료 이용 규정 및 안내
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-warm-100 pt-3">
                <div className="space-y-1.5">
                  <p><strong>사용 방식:</strong> 소속 교회 내에서 부서 사역 및 교육 목적으로 자유롭게 가공하여 인쇄·배포 가능합니다.</p>
                  <p><strong>제공 파일 형식:</strong> HWP, Excel, PDF, PPTX (각 패키지 구성별로 다름)</p>
                </div>
                <div className="space-y-1.5">
                  <p><strong>최신 업데이트:</strong> 본 자료는 2026년 최신 교육 과정 지침을 반영하여 상시 수정 보완됩니다.</p>
                  <p><strong>환불 및 문의 안내:</strong> 디지털 콘텐츠 특성상 다운로드 개시 후 환불이 제한되므로, 우측 채널톡 또는 고객센터로 1:1 상담 후 결제해 주세요.</p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Download / Purchase & Call To Action card */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 shadow-card border border-warm-100 space-y-6 sticky top-6">
              
              {/* Pricing section */}
              <div>
                <span className="text-xs font-semibold text-navy-400 block">자료 판매 가격</span>
                {resource.isFree ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-extrabold text-mint-600">무료 다운로드</span>
                    <span className="badge-free text-[10px]">FREE</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-extrabold text-navy-950">₩{resource.price.toLocaleString()}</span>
                    <span className="badge-paid text-[10px]">단건 구매 가능</span>
                  </div>
                )}
              </div>

              <hr className="border-warm-100" />

              {/* Action Buttons based on Pricing Tier */}
              <div className="space-y-3">
                {(resource.isFree || isPremium || hasPurchased) ? (
                  <>
                    {/* Free or Purchased Download */}
                    <div className="bg-mint-50/50 rounded-2xl p-4 border border-mint-100/80 text-center mb-1">
                      <p className="text-[11px] text-mint-800 leading-normal font-medium">
                        {resource.isFree ? (
                          "누구나 무료로 이용할 수 있는 자료입니다."
                        ) : isPremium ? (
                          "✨ 구독 멤버십 혜택으로 무료 제공되는 자료입니다."
                        ) : (
                          "🎉 단건 구매 소장으로 이용 가능한 자료입니다."
                        )}
                      </p>
                    </div>
                    
                    <button
                      onClick={handleDownload}
                      className="btn-primary w-full py-3.5 gap-2 text-sm justify-center"
                    >
                      <Download className="w-4 h-4" />
                      자료 다운로드 받기
                    </button>

                    {/* Bookmark Save */}
                    <button
                      onClick={handleSaveToMypage}
                      className="btn-outline w-full py-3 gap-2 text-xs justify-center"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-mint-500 text-mint-500' : ''}`} />
                      내 자료함에 저장하기
                    </button>
                  </>
                ) : (
                  <>
                    {/* Paid Purchase */}
                    <button
                      onClick={handlePurchase}
                      className="btn-secondary w-full py-3.5 gap-2 text-sm justify-center"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      자료 단건 구매하기 (₩{resource.price.toLocaleString()})
                    </button>

                    <div className="text-center text-xs text-navy-400 font-medium py-1">또는</div>

                    {/* Go Premium Link Button */}
                    <Link
                      href="/pricing"
                      className="btn-primary w-full py-3.5 gap-2 text-sm justify-center bg-navy-900 hover:bg-navy-800 text-white"
                    >
                      <Award className="w-4 h-4" />
                      월 구독으로 전체 자료실 무제한 이용
                    </Link>

                    {/* Subscription Guide */}
                    <div className="bg-warm-50 rounded-xl p-3 border border-warm-200 text-center">
                      <p className="text-[10px] text-navy-500 leading-normal">
                        정기 멤버십 구독 회원은 본 자료를 포함한 <strong>모든 유료 자료실 파일이 무제한 무료</strong>입니다.
                      </p>
                      <Link href="/pricing" className="text-[10px] font-bold text-mint-600 hover:underline mt-1 inline-block">
                        멤버십 요금제 알아보기 →
                      </Link>
                    </div>

                    {/* Login prompt warning */}
                    {!isLoggedIn && (
                      <div className="flex items-center gap-1.5 justify-center text-[10px] text-navy-400 pt-1">
                        <Lock className="w-3.5 h-3.5" />
                        결제 및 다운로드는 로그인이 필요합니다.
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Spec Summary */}
              <div className="flex items-center justify-between text-[11px] text-navy-400 pt-4 border-t border-warm-50">
                <span>조회수 {resource.viewCount}회</span>
                <span>다운로드 {resource.downloadCount}회</span>
              </div>

            </div>

            {/* Success & Prompt modals/alerts */}
            {downloadSuccess && (
              <div className="bg-mint-50 border border-mint-200 rounded-xl p-4 flex gap-3 items-start animate-fade-in">
                <Check className="w-5 h-5 text-mint-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-mint-800">다운로드 성공!</h4>
                  <p className="text-[10px] text-mint-600 mt-0.5">자료 원본 파일이 내 컴퓨터에 정상적으로 수신되었습니다.</p>
                </div>
              </div>
            )}

            {purchaseSuccess && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-3 items-start animate-fade-in">
                <Award className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-orange-800">모의 결제 완료!</h4>
                  <p className="text-[10px] text-orange-600 mt-0.5">가상 결제 승인이 완료되어 마이페이지 소장 목록에 보관되었습니다.</p>
                </div>
              </div>
            )}

            {/* Non-login warning banner */}
            {showLoginPrompt && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 items-start animate-fade-in">
                <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-red-800">로그인이 필요합니다</h4>
                  <p className="text-[10px] text-red-600 mt-0.5">
                    해당 요청은 회원만 이용할 수 있습니다. 아래 버튼을 눌러 로그인 후 이용해 주세요.
                  </p>
                  <button 
                    onClick={() => {
                      setShowLoginPrompt(false);
                    }}
                    className="text-[10px] font-bold text-red-700 underline mt-2 block"
                  >
                    지금 로그인하기
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* BOTTOM: Related Resources Section */}
        {relatedResources.length > 0 && (
          <div className="mt-16 pt-10 border-t border-warm-200">
            <h2 className="text-lg md:text-xl font-bold text-navy-950 mb-6">
              이 자료와 함께 쓰면 좋은 추천 자료
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedResources.map((item) => (
                <div key={item.id} className="bg-white rounded-xl p-5 shadow-sm border border-warm-100 flex flex-col justify-between hover:shadow-card transition-shadow">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 bg-warm-50 text-navy-500 rounded font-semibold mb-2 inline-block">
                      {CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS]}
                    </span>
                    <Link href={`/resources/${item.id}`}>
                      <h3 className="text-sm font-bold text-navy-900 mb-1 hover:text-mint-600 transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-navy-400 line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-warm-50 text-xs">
                    <span className="text-navy-600 font-bold">{item.isFree ? '무료' : `₩${item.price.toLocaleString()}`}</span>
                    <Link href={`/resources/${item.id}`} className="text-mint-600 font-bold hover:underline">
                      확인하기
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
      <LoginModal isOpen={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
    </div>
  );
}
