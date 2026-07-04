'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
   Sparkles, Clipboard, Check, Bookmark, RefreshCw, Info, Lock, 
   ArrowRight, ShieldCheck, Mail, MessageSquare, ListTodo, AlertTriangle, AlertCircle 
} from 'lucide-react';
import { SITUATIONS, TARGETS, TONES } from '@/data/notice-templates';
import { useAuth } from '@/components/AuthProvider';
import LoginModal from '@/components/LoginModal';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';

interface GeneratedResults {
  version1: string;
  version2: string;
  version3: string;
  version4: string;
}

export default function NoticeWriterPage() {
  const supabase = createSupabaseClient();
  const [situation, setSituation] = useState('welcome');
  const [target, setTarget] = useState('kinder_parents');
  const [tone, setTone] = useState('warm');
  const [extra, setExtra] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GeneratedResults | null>(null);
  
  // Non-member free trials (3 times)
  const [freeCount, setFreeCount] = useState(3);
  // Auth Context 연동
  const { isLoggedIn, user, isPremium } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Copy success status per version
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Save status per version
  const [savedV1, setSavedV1] = useState(false);
  const [savedV2, setSavedV2] = useState(false);
  const [savedV3, setSavedV3] = useState(false);
  const [savedV4, setSavedV4] = useState(false);

  useEffect(() => {
    const count = localStorage.getItem('cs_free_notice_count');
    if (count !== null) {
      setFreeCount(Number(count));
    }
  }, []);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Limits check for guest users (프리미엄 구독자는 무제한)
    const isRestricted = !isLoggedIn && freeCount <= 0;
    if (isRestricted) {
      setShowLoginModal(true);
      return;
    }

    setLoading(true);
    setResults(null);
    
    // Reset individual saves
    setSavedV1(false);
    setSavedV2(false);
    setSavedV3(false);
    setSavedV4(false);

    try {
      const response = await fetch('/api/notice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation, target, tone, extra }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setResults({
            version1: data.version1,
            version2: data.version2,
            version3: data.version3,
            version4: data.version4,
          });

          // Decrease count for guests
          if (!isLoggedIn) {
            const nextCount = Math.max(0, freeCount - 1);
            setFreeCount(nextCount);
            localStorage.setItem('cs_free_notice_count', String(nextCount));
          }
        }
      }
    } catch (err) {
      console.error('Error generating notices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = async (text: string, versionIndex: 1 | 2 | 3 | 4) => {
    if (!isLoggedIn || !user) {
      setShowLoginModal(true);
      return;
    }

    const sitLabel = SITUATIONS.find(s => s.value === situation)?.label || '공지';
    const tgtLabel = TARGETS.find(t => t.value === target)?.label || '대상';
    const typeLabel = 
      versionIndex === 1 ? '짧은문자형' : 
      versionIndex === 2 ? '카톡공지형' : 
      versionIndex === 3 ? '상세안내형' : '리마인드형';

    try {
      const { saveNotice } = await import('@/lib/db');
      await saveNotice(user.id, {
        title: `${sitLabel} - ${tgtLabel} (${typeLabel})`,
        content: text,
        situation,
        target,
        tone
      });

      if (versionIndex === 1) setSavedV1(true);
      if (versionIndex === 2) setSavedV2(true);
      if (versionIndex === 3) setSavedV3(true);
      if (versionIndex === 4) setSavedV4(true);
    } catch (err) {
      console.error('공지문 저장 실패:', err);
      alert('보관함에 저장하는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <div className="min-h-screen bg-warm-50 py-10">
      <div className="container-custom max-w-6xl">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-warm-200 pb-6 mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint-50 text-mint-700 text-xs font-bold mb-2.5 border border-mint-200">
              <Sparkles className="w-3.5 h-3.5" />
              스마트 사역 비서
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-navy-950">공지문 작성기</h1>
            <p className="text-xs md:text-sm text-navy-500 mt-1">
              상황과 대상에 맞춰 현장에서 즉시 발송 가능한 4가지 스타일의 완성형 공지문을 실시간 작성합니다.
            </p>
          </div>

          {/* Simulated Login Switcher */}
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-warm-200 flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-navy-400 block font-semibold">내 로그인 계정</span>
              <span className="text-xs font-bold text-navy-800">
                {isLoggedIn ? (user?.name || '회원') : '🔒 비회원'}
              </span>
            </div>
            <button
              onClick={async () => {
                if (isLoggedIn) {
                  await supabase.auth.signOut();
                  window.location.reload();
                } else {
                  setShowLoginModal(true);
                }
              }}
              className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all ${
                isLoggedIn 
                  ? 'bg-warm-100 text-navy-800 border-warm-300 hover:bg-warm-200' 
                  : 'bg-mint-500 text-white border-mint-500 hover:bg-mint-600'
              }`}
            >
              {isLoggedIn ? '로그아웃' : '로그인'}
            </button>
          </div>
        </div>

        {/* Free Limits Banner */}
        {!isLoggedIn && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex gap-2.5 items-start">
              <Info className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-navy-900">무료 체험 모드로 이용 중입니다</h4>
                <p className="text-[11px] text-navy-500 mt-0.5">
                  비회원은 매달 3회까지 무료로 공지문을 제작하실 수 있습니다. 회원으로 가입하시면 무제한 내 보관함 저장 기능이 오픈됩니다.
                </p>
              </div>
            </div>
            <div className="text-xs font-bold text-orange-600 bg-white border border-orange-200 px-4 py-2 rounded-xl whitespace-nowrap">
              잔여 생성 횟수: <span className="text-sm font-extrabold">{freeCount}</span> / 3회
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: 1. Input form panel */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-card border border-warm-100 space-y-6">
            <h2 className="text-base font-bold text-navy-950 flex items-center gap-1.5 border-b border-warm-100 pb-3">
              ⚙️ 공지문 생성 조건
            </h2>

            <form onSubmit={handleGenerate} className="space-y-4 text-xs md:text-sm">
              <div>
                <label className="block font-bold text-navy-800 mb-1.5">1. 상황 종류</label>
                <select
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  className="select-field py-2.5 text-xs"
                >
                  {SITUATIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-navy-800 mb-1.5">2. 발송 대상</label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="select-field py-2.5 text-xs"
                >
                  {TARGETS.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-navy-800 mb-1.5">3. 문체/어조</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="select-field py-2.5 text-xs"
                >
                  {TONES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-navy-800 mb-1.5">
                  4. 추가 세부 정보 (이름, 일시, 장소 등)
                </label>
                <textarea
                  value={extra}
                  onChange={(e) => setExtra(e.target.value)}
                  placeholder="예: 예은이 (이번 주 분반 공부 후 달란트 시장 예정)"
                  className="input-field min-h-[110px] text-xs resize-none py-2.5 leading-relaxed"
                />
                <p className="text-[10px] text-navy-400 mt-1">
                  * 특정 자녀/교사의 이름을 적으시면 템플릿 내 플레이스홀더가 자동 치환되어 자연스럽게 완성됩니다.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 gap-2 text-sm justify-center"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    공지문 조합 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    맞춤 공지문 작성하기
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT: 2. Results display panel */}
          <div className="lg:col-span-8 space-y-6">
            
            {!results && !loading ? (
              <div className="bg-white rounded-3xl border border-dashed border-warm-300 p-16 text-center h-[540px] flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-mint-50 flex items-center justify-center text-mint-500 mb-4 border border-mint-100">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-navy-950 mb-1">작성 대기 중</h3>
                <p className="text-xs text-navy-400 max-w-xs leading-relaxed">
                  왼쪽에서 상황과 대상을 선택하신 후 생성 버튼을 누르면, 모바일 SMS부터 카카오톡 단톡방용 안내문까지 4개 버전의 문안이 바로 렌더링됩니다.
                </p>
              </div>
            ) : loading ? (
              <div className="bg-white rounded-3xl p-16 shadow-card border border-warm-100 h-[540px] flex flex-col items-center justify-center space-y-4">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-4 border-mint-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-mint-500 animate-spin" />
                </div>
                <div className="text-center">
                  <h3 className="text-base font-bold text-navy-950">사역 문안 정서 검수 중</h3>
                  <p className="text-xs text-navy-400 mt-1">상황에 맞게 따뜻하고 예의 바른 한국어 문장으로 교정하고 있습니다.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                
                <div className="bg-mint-50/50 rounded-2xl p-4 border border-mint-100 flex items-start gap-2.5 text-xs text-mint-800">
                  <Info className="w-4 h-4 text-mint-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>사역 팁:</strong> 복사하기 버튼을 눌러 발송 매체(카카오톡, 문자, 가정통신인쇄물)에 맞게 발송해 주세요. 본문에 이름/날짜를 수정한 후 최종 발송하시면 됩니다.
                  </p>
                </div>

                {/* 4 Versions grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* SMS Version */}
                  <div className="bg-white rounded-2xl shadow-sm border border-warm-200 overflow-hidden flex flex-col justify-between h-[390px] hover:border-mint-200 transition-colors">
                    <div className="px-4 py-3.5 bg-warm-50 border-b border-warm-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-navy-500" />
                        <span className="text-xs font-bold text-navy-900">시안 1: 짧은 문자형</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 bg-white border border-warm-200 rounded text-navy-500 font-bold">SMS 전송용</span>
                    </div>
                    <div className="p-5 flex-1 overflow-y-auto scrollbar-thin">
                      <pre className="text-xs text-navy-800 whitespace-pre-wrap font-sans leading-relaxed">
                        {results?.version1}
                      </pre>
                    </div>
                    <div className="p-3 bg-warm-50/50 border-t border-warm-100 flex gap-2">
                      <button
                        onClick={() => handleSave(results?.version1 || '', 1)}
                        className="btn-outline btn-sm flex-1 gap-1 text-[10px]"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${savedV1 ? 'fill-mint-500 text-mint-500' : ''}`} />
                        {savedV1 ? '저장됨' : '보관함'}
                      </button>
                      <button
                        onClick={() => handleCopy(results?.version1 || '', 'v1')}
                        className="btn-secondary btn-sm flex-1 gap-1 text-[10px]"
                      >
                        {copiedId === 'v1' ? <Check className="w-3.5 h-3.5 text-mint-500" /> : <Clipboard className="w-3.5 h-3.5" />}
                        {copiedId === 'v1' ? '복사됨' : '복사하기'}
                      </button>
                    </div>
                  </div>

                  {/* Kakao Version */}
                  <div className="bg-white rounded-2xl shadow-sm border border-mint-200 overflow-hidden flex flex-col justify-between h-[390px] relative ring-2 ring-mint-400/10">
                    <div className="px-4 py-3.5 bg-mint-50 border-b border-mint-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-mint-600" />
                        <span className="text-xs font-bold text-mint-800">시안 2: 카톡 공지형</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 bg-mint-500 text-white rounded font-bold">인기/추천</span>
                    </div>
                    <div className="p-5 flex-1 overflow-y-auto scrollbar-thin">
                      <pre className="text-xs text-navy-800 whitespace-pre-wrap font-sans leading-relaxed">
                        {results?.version2}
                      </pre>
                    </div>
                    <div className="p-3 bg-warm-50/50 border-t border-warm-100 flex gap-2">
                      <button
                        onClick={() => handleSave(results?.version2 || '', 2)}
                        className="btn-outline btn-sm flex-1 gap-1 text-[10px]"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${savedV2 ? 'fill-mint-500 text-mint-500' : ''}`} />
                        {savedV2 ? '저장됨' : '보관함'}
                      </button>
                      <button
                        onClick={() => handleCopy(results?.version2 || '', 'v2')}
                        className="btn-secondary btn-sm flex-1 gap-1 text-[10px]"
                      >
                        {copiedId === 'v2' ? <Check className="w-3.5 h-3.5 text-mint-500" /> : <Clipboard className="w-3.5 h-3.5" />}
                        {copiedId === 'v2' ? '복사됨' : '복사하기'}
                      </button>
                    </div>
                  </div>

                  {/* Detail Version */}
                  <div className="bg-white rounded-2xl shadow-sm border border-warm-200 overflow-hidden flex flex-col justify-between h-[390px] hover:border-mint-200 transition-colors">
                    <div className="px-4 py-3.5 bg-warm-50 border-b border-warm-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <ListTodo className="w-4 h-4 text-navy-500" />
                        <span className="text-xs font-bold text-navy-900">시안 3: 상세 안내형</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 bg-white border border-warm-200 rounded text-navy-500 font-bold">가정통신문형</span>
                    </div>
                    <div className="p-5 flex-1 overflow-y-auto scrollbar-thin">
                      <pre className="text-xs text-navy-800 whitespace-pre-wrap font-sans leading-relaxed">
                        {results?.version3}
                      </pre>
                    </div>
                    <div className="p-3 bg-warm-50/50 border-t border-warm-100 flex gap-2">
                      <button
                        onClick={() => handleSave(results?.version3 || '', 3)}
                        className="btn-outline btn-sm flex-1 gap-1 text-[10px]"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${savedV3 ? 'fill-mint-500 text-mint-500' : ''}`} />
                        {savedV3 ? '저장됨' : '보관함'}
                      </button>
                      <button
                        onClick={() => handleCopy(results?.version3 || '', 'v3')}
                        className="btn-secondary btn-sm flex-1 gap-1 text-[10px]"
                      >
                        {copiedId === 'v3' ? <Check className="w-3.5 h-3.5 text-mint-500" /> : <Clipboard className="w-3.5 h-3.5" />}
                        {copiedId === 'v3' ? '복사됨' : '복사하기'}
                      </button>
                    </div>
                  </div>

                  {/* Remind Version */}
                  <div className="bg-white rounded-2xl shadow-sm border border-warm-200 overflow-hidden flex flex-col justify-between h-[390px] hover:border-mint-200 transition-colors">
                    <div className="px-4 py-3.5 bg-warm-50 border-b border-warm-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <RefreshCw className="w-4 h-4 text-navy-500" />
                        <span className="text-xs font-bold text-navy-900">시안 4: 리마인드형</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded font-bold">최종 체크</span>
                    </div>
                    <div className="p-5 flex-1 overflow-y-auto scrollbar-thin">
                      <pre className="text-xs text-navy-800 whitespace-pre-wrap font-sans leading-relaxed">
                        {results?.version4}
                      </pre>
                    </div>
                    <div className="p-3 bg-warm-50/50 border-t border-warm-100 flex gap-2">
                      <button
                        onClick={() => handleSave(results?.version4 || '', 4)}
                        className="btn-outline btn-sm flex-1 gap-1 text-[10px]"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${savedV4 ? 'fill-mint-500 text-mint-500' : ''}`} />
                        {savedV4 ? '저장됨' : '보관함'}
                      </button>
                      <button
                        onClick={() => handleCopy(results?.version4 || '', 'v4')}
                        className="btn-secondary btn-sm flex-1 gap-1 text-[10px]"
                      >
                        {copiedId === 'v4' ? <Check className="w-3.5 h-3.5 text-mint-500" /> : <Clipboard className="w-3.5 h-3.5" />}
                        {copiedId === 'v4' ? '복사됨' : '복사하기'}
                      </button>
                    </div>
                  </div>

                </div>

                {/* Re-trigger action */}
                <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-warm-200">
                  <span className="text-[10px] text-navy-400">마음에 드는 시안이 없으신가요?</span>
                  <button
                    onClick={() => handleGenerate()}
                    className="btn-outline btn-xs gap-1.5 font-bold"
                  >
                    <RefreshCw className="w-3 h-3" />
                    이 조건으로 재생성
                  </button>
                </div>

              </div>
            )}

            {/* Subscribe Banner */}
            <div className="bg-gradient-to-r from-navy-900 to-navy-850 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-mint-500/10 rounded-full blur-2xl" />
              <div className="space-y-1.5 text-center md:text-left relative z-10">
                <h3 className="text-sm md:text-base font-bold text-white flex items-center justify-center md:justify-start gap-1.5">
                  <ShieldCheck className="w-5 h-5 text-mint-400" />
                  프리미엄 사역 연간 멤버십 혜택
                </h3>
                <p className="text-[11px] text-navy-200">
                  구독 회원은 AI 작성 제한이 영구 면제되며, 소속 교회 맞춤형 사역 서식을 1:1로 주문제작 요청할 수 있습니다.
                </p>
              </div>
              <Link href="/pricing" className="btn-secondary btn-sm whitespace-nowrap relative z-10 w-full md:w-auto text-center">
                멤버십 둘러보기
              </Link>
            </div>

          </div>

        </div>

      </div>

      {/* LOGIN MODAL */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

    </div>
  );
}

// Simple local close icon override for modal
function X(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
