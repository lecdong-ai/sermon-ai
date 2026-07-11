'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, Mail, School, Sparkles, FileText, 
  Trash2, Clipboard, Check, Eye, ExternalLink, Lock, X,
  Calendar, Heart, Quote, PenLine, ArrowUpRight, BookOpen
} from 'lucide-react';
import { SITUATIONS, TARGETS, TONES } from '@/data/notice-templates';
import { useAuth } from '@/components/AuthProvider';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';
import { 
  getSavedNotices, 
  deleteSavedNotice, 
} from '@/lib/db';
import { redirectToMainLogin } from '@/lib/auth-redirect';

interface SavedNotice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  situation?: string;
  target?: string;
  tone?: string;
}

export default function MyPage() {
  const supabase = createSupabaseClient();
  const { isLoggedIn, user, refreshUser, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'notices' | 'settings'>('dashboard');

  // 미로그인 시 메인 페이지 로그인으로 자동 이동
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      redirectToMainLogin('/mypage')
    }
  }, [loading, isLoggedIn])

  // Profile State
  const [name, setName] = useState('');
  const [church, setChurch] = useState('');
  const [email, setEmail] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Profile Edit fields
  const [editName, setEditName] = useState('');
  const [editChurch, setEditChurch] = useState('');

  // Password Edit fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Data States
  const [savedNotices, setSavedNotices] = useState<SavedNotice[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Clipboard copies
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Notice Viewer Modal
  const [viewNotice, setViewNotice] = useState<SavedNotice | null>(null);

  // 1. 유저 정보 매핑
  useEffect(() => {
    if (user) {
      setName(user.name);
      setChurch(user.church_name || '미등록 교회');
      setEmail(user.email);
      setEditName(user.name);
      setEditChurch(user.church_name || '');
    }
  }, [user]);

  // 2. DB 데이터 로드
  useEffect(() => {
    if (!isLoggedIn || !user) return;

    const loadData = async () => {
      setLoadingData(true);
      try {
        const [notices] = await Promise.all([
          getSavedNotices(user.id),
        ]);

        setSavedNotices(notices as SavedNotice[]);
      } catch (err) {
        console.error('마이페이지 데이터 조회 에러:', err);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [isLoggedIn, user]);

  // Save Profile Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: editName, church_name: editChurch }
      });

      if (error) throw error;

      await refreshUser();
      setName(editName);
      setChurch(editChurch || '미등록 교회');
      setIsEditingProfile(false);
      alert('프로필이 성공적으로 변경되었습니다.');
    } catch (err: any) {
      console.error(err);
      alert('프로필 변경 중 에러가 발생했습니다: ' + err.message);
    }
  };

  // Password change simulation
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    setPasswordError('');
    setPasswordSuccess(false);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setPasswordSuccess(true);
      setNewPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setPasswordError(err.message || '비밀번호 변경 실패');
    }
  };

  // Delete Notice
  const handleDeleteNotice = async (id: string) => {
    if (!confirm('이 공지문을 보관함에서 삭제하시겠습니까?')) return;
    try {
      await deleteSavedNotice(id);
      setSavedNotices(prev => prev.filter(n => n.id !== id));
      if (viewNotice?.id === id) setViewNotice(null);
    } catch (err) {
      console.error(err);
      alert('삭제에 실패했습니다.');
    }
  };

  // Copy Notice Text
  const handleCopyNotice = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Remove Bookmark
  if (loading || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-warm-50 py-24 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-navy-200 border-t-navy-600 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-navy-500">로그인 페이지로 이동 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50 py-10">
      <div className="container-custom max-w-6xl">
        
        {/* Main Dashboard Header */}
        <h1 className="text-2xl md:text-4xl font-extrabold text-navy-950 mb-8">마이페이지</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Profile summary & Navigation */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Profile Card */}
            <div className="bg-white rounded-3xl p-6 shadow-card border border-warm-100 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-mint-50 border border-mint-200 text-mint-600 flex items-center justify-center font-extrabold text-xl">
                  {name[0] || 'G'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-navy-950 text-base md:text-lg">{name}</span>
                    {isAdmin && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-navy-100 text-navy-700">
                        👑 관리자
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-navy-400 block mt-0.5">{email}</span>
                </div>
              </div>

              <hr className="border-warm-100" />

              {/* Edit Mode / Static info */}
              {!isEditingProfile ? (
                <div className="space-y-3.5 text-xs md:text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-navy-400 flex items-center gap-1.5"><School className="w-4 h-4 text-navy-300" /> 소속 교회</span>
                    <span className="font-semibold text-navy-800">{church || '미등록'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-navy-400 flex items-center gap-1.5"><Heart className="w-4 h-4 text-navy-300" /> 회원 가입</span>
                    <span className="font-semibold text-navy-800">모든 서비스 무료</span>
                  </div>
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="btn-outline w-full py-2 text-xs font-bold animate-hover"
                  >
                    프로필 수정하기
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-navy-500 font-bold mb-1">이름</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input-field py-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-navy-500 font-bold mb-1">소속 교회명</label>
                    <input
                      type="text"
                      required
                      value={editChurch}
                      onChange={(e) => setEditChurch(e.target.value)}
                      className="input-field py-1.5"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="btn-outline flex-1 py-1.5"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="btn-secondary flex-1 py-1.5"
                    >
                      저장 완료
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Quick Navigation Tabs */}
            <div className="bg-white rounded-2xl p-3 shadow-card border border-warm-100 flex flex-col gap-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`text-left text-xs md:text-sm px-4 py-2.5 rounded-xl font-bold transition-all flex items-center justify-between ${
                  activeTab === 'dashboard' ? 'bg-navy-900 text-white shadow-sm' : 'text-navy-500 hover:bg-warm-50'
                }`}
              >
                <span>📊 마이 대시보드</span>
              </button>
              <button
                onClick={() => setActiveTab('notices')}
                className={`text-left text-xs md:text-sm px-4 py-2.5 rounded-xl font-bold transition-all flex items-center justify-between ${
                  activeTab === 'notices' ? 'bg-navy-900 text-white shadow-sm' : 'text-navy-500 hover:bg-warm-50'
                }`}
              >
                <span>📝 저장한 공지문 ({savedNotices.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`text-left text-xs md:text-sm px-4 py-2.5 rounded-xl font-bold transition-all flex items-center justify-between ${
                  activeTab === 'settings' ? 'bg-navy-900 text-white shadow-sm' : 'text-navy-500 hover:bg-warm-50'
                }`}
              >
                <span>⚙️ 계정 설정</span>
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: Tab Views */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* VIEW 1: DASHBOARD OVERVIEW */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Welcome Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-700 to-navy-600 px-6 md:px-8 py-6 md:py-7">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-16 translate-x-16 blur-2xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-mint-400/5 rounded-full translate-y-8 -translate-x-8 blur-xl pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                          반갑습니다, {name}님
                          <span className="text-white/50 text-sm font-normal">🙏</span>
                        </h2>
                        <p className="text-[12px] text-white/70 mt-1">
                          오늘도 함께 섬겨주셔서 감사합니다. 교회학교의 모든 도구를 자유롭게 사용하세요.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 text-white/80 border border-white/10">
                        <Heart className="w-3 h-3 text-mint-300" />
                        모든 서비스 무료
                      </span>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 text-white/80 border border-white/10">
                          👑 총관리자
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl p-5 shadow-card border border-warm-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-mint-50 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-mint-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-extrabold text-navy-900">{savedNotices.length}</p>
                        <p className="text-[11px] text-navy-400 font-medium">저장한 공지문</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-5 shadow-card border border-warm-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-extrabold text-navy-900">
                          {savedNotices.length > 0 ? '✓' : '-'}
                        </p>
                        <p className="text-[11px] text-navy-400 font-medium">활성 서비스</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-5 shadow-card border border-warm-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-extrabold text-navy-900">{user?.name || '회원'}</p>
                        <p className="text-[11px] text-navy-400 font-medium">교회학교 회원</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-sm font-bold text-navy-900 mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-navy-400" />
                    바로 시작하기
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/notice-writer"
                      className="group bg-white rounded-2xl p-4 shadow-card border border-warm-100 hover:border-mint-200 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="w-9 h-9 rounded-xl bg-mint-50 flex items-center justify-center mb-2.5 group-hover:bg-mint-100 transition-colors">
                        <PenLine className="w-4 h-4 text-mint-600" />
                      </div>
                      <p className="text-[13px] font-bold text-navy-900">공지문 작성</p>
                      <p className="text-[10px] text-navy-400 mt-0.5">AI가 초안을 만들어드려요</p>
                    </Link>
                    <Link
                      href="/ppt-studio"
                      className="group bg-white rounded-2xl p-4 shadow-card border border-warm-100 hover:border-purple-200 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center mb-2.5 group-hover:bg-purple-100 transition-colors">
                        <FileText className="w-4 h-4 text-purple-600" />
                      </div>
                      <p className="text-[13px] font-bold text-navy-900">PPT 스튜디오</p>
                      <p className="text-[10px] text-navy-400 mt-0.5">10가지 레이아웃으로 슬라이드</p>
                    </Link>
                    <Link
                      href="/events/manage"
                      className="group bg-white rounded-2xl p-4 shadow-card border border-warm-100 hover:border-amber-200 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center mb-2.5 group-hover:bg-amber-100 transition-colors">
                        <Calendar className="w-4 h-4 text-amber-600" />
                      </div>
                      <p className="text-[13px] font-bold text-navy-900">행사 관리</p>
                      <p className="text-[10px] text-navy-400 mt-0.5">QR 체크인·신청 접수</p>
                    </Link>
                    <Link
                      href="/projects"
                      className="group bg-white rounded-2xl p-4 shadow-card border border-warm-100 hover:border-navy-200 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="w-9 h-9 rounded-xl bg-navy-50 flex items-center justify-center mb-2.5 group-hover:bg-navy-100 transition-colors">
                        <BookOpen className="w-4 h-4 text-navy-600" />
                      </div>
                      <p className="text-[13px] font-bold text-navy-900">설교 프로젝트</p>
                      <p className="text-[10px] text-navy-400 mt-0.5">연구·준비·작성·연결보기</p>
                    </Link>
                  </div>
                </div>

                {/* Recent Activity */}
                {savedNotices.length > 0 && (
                  <div className="bg-white rounded-3xl p-5 shadow-card border border-warm-100">
                    <h3 className="text-sm font-bold text-navy-900 mb-3 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-mint-500" />
                      최근 저장한 공지문
                    </h3>
                    <div className="space-y-2">
                      {savedNotices.slice(0, 3).map((notice) => (
                        <div key={notice.id} className="flex items-center justify-between p-3 bg-warm-50/50 rounded-xl hover:bg-warm-100/50 transition-colors cursor-pointer" onClick={() => setViewNotice(notice)}>
                          <div className="flex-1 min-w-0 mr-3">
                            <p className="text-[13px] font-bold text-navy-900 truncate">{notice.title}</p>
                            <p className="text-[10px] text-navy-400 mt-0.5">{notice.createdAt}</p>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-navy-300 shrink-0" />
                        </div>
                      ))}
                    </div>
                    {savedNotices.length > 3 && (
                      <button
                        onClick={() => setActiveTab('notices')}
                        className="w-full text-center text-[12px] font-bold text-navy-500 hover:text-navy-700 py-2.5 mt-2 rounded-xl hover:bg-warm-50 transition-colors"
                      >
                        저장 공지문 모두 보기 ({savedNotices.length}개)
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* VIEW 2: SAVED NOTICES LIST */}
            {activeTab === 'notices' && (
              <div className="bg-white rounded-3xl p-6 shadow-card border border-warm-100 space-y-4">
                <h3 className="text-sm md:text-base font-bold text-navy-900 flex items-center gap-1.5 border-b border-warm-100 pb-3">
                  <FileText className="w-5 h-5 text-mint-500" />
                  보관한 공지문 내역
                </h3>

                {savedNotices.length === 0 ? (
                  <div className="text-center py-16 space-y-4 border border-dashed border-warm-200 rounded-2xl bg-warm-50/20">
                    <FileText className="w-10 h-10 text-warm-300 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-xs text-navy-600 font-bold">보관된 공지문 초안이 없습니다.</p>
                      <p className="text-[10px] text-navy-400">공지문 작성기에서 마음에 드는 완성본을 보관함에 담아보세요.</p>
                    </div>
                    <Link href="/notice-writer" className="btn-secondary btn-xs inline-block">
                      공지문 작성해보기
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedNotices.map((notice) => {
                      const sitLabel = SITUATIONS.find(s => s.value === notice.situation)?.label || notice.situation;
                      const tgtLabel = TARGETS.find(t => t.value === notice.target)?.label || notice.target;
                      const toneLabel = TONES.find(t => t.value === notice.tone)?.label || notice.tone;

                      return (
                        <div key={notice.id} className="bg-warm-50/50 rounded-xl p-4 border border-warm-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-mint-200 transition-colors">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap gap-1">
                              <span className="text-[9px] text-navy-400 bg-white border border-warm-100 px-1.5 py-0.5 rounded">
                                {notice.createdAt} 보관
                              </span>
                              {sitLabel && (
                                <span className="text-[9px] text-mint-700 bg-mint-50 border border-mint-100 px-1.5 py-0.5 rounded font-semibold">
                                  {sitLabel}
                                </span>
                              )}
                              {tgtLabel && (
                                <span className="text-[9px] text-purple-700 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded font-semibold">
                                  {tgtLabel}
                                </span>
                              )}
                              {toneLabel && (
                                <span className="text-[9px] text-orange-700 bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded font-semibold">
                                  {toneLabel}
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs md:text-sm font-bold text-navy-900">{notice.title}</h4>
                          </div>
                          <div className="flex gap-2 self-end sm:self-auto">
                            <button
                              onClick={() => handleDeleteNotice(notice.id)}
                              className="p-2 text-navy-400 hover:text-red-500 rounded-lg bg-white border border-warm-200"
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCopyNotice(notice.content, notice.id)}
                              className="btn-outline btn-xs gap-1 py-1.5"
                            >
                              {copiedId === notice.id ? <Check className="w-3.5 h-3.5 text-mint-500" /> : <Clipboard className="w-3.5 h-3.5" />}
                              {copiedId === notice.id ? '복사됨' : '복사'}
                            </button>
                            <button
                              onClick={() => setViewNotice(notice)}
                              className="btn-secondary btn-xs py-1.5"
                            >
                              내용 확인
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* VIEW 3: SETTINGS & ACCOUNT MANAGEMENT */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                
                {/* Password modification simulation */}
                <div className="bg-white rounded-3xl p-6 shadow-card border border-warm-100 space-y-4">
                  <h3 className="text-sm md:text-base font-bold text-navy-900 flex items-center gap-1.5">
                    <Lock className="w-5 h-5 text-mint-500" />
                    비밀번호 변경
                  </h3>

                  <form onSubmit={handlePasswordChange} className="space-y-4 text-xs md:text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-navy-500 font-bold mb-1">현재 비밀번호</label>
                        <input
                          type="password"
                          required
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="input-field py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-navy-500 font-bold mb-1">새 비밀번호</label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="input-field py-2"
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn-secondary btn-sm">
                      비밀번호 업데이트
                    </button>
                  </form>

                  {passwordSuccess && (
                    <div className="bg-mint-50 border border-mint-200 rounded-xl p-3 text-xs text-mint-800 font-bold">
                      ✓ 비밀번호가 성공적으로 변경되었습니다. (MVP 가상 처리 완료)
                    </div>
                  )}
                </div>

                {/* Account Info Card */}
                <div className="bg-gradient-to-r from-navy-700 to-navy-600 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="space-y-1 text-center md:text-left relative z-10">
                    <h3 className="text-sm md:text-base font-bold text-white flex items-center justify-center md:justify-start gap-1.5">
                      <BookOpen className="w-5 h-5 text-mint-300" />
                      교회학교 솔루션
                    </h3>
                    <p className="text-[11px] text-navy-200">
                      모든 서비스를 제한 없이 무료로 이용하실 수 있습니다. 사역에 필요한 도구를 자유롭게 활용하세요.
                    </p>
                  </div>
                  <Link href="/" className="btn-ghost btn-sm whitespace-nowrap relative z-10 text-white border border-white/20 hover:bg-white/10">
                    서비스 둘러보기
                  </Link>
                </div>

              </div>
            )}

          </div>

        </div>
      </div>

      {/* NOTICE VIEWER MODAL */}
      {viewNotice && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full max-h-[80vh] overflow-y-auto space-y-4 shadow-2xl relative">
            <button
              onClick={() => setViewNotice(null)}
              className="absolute right-4 top-4 p-2 rounded-xl text-navy-400 hover:bg-warm-50"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] text-navy-400 block">{viewNotice.createdAt} 보관</span>
              <h3 className="text-base md:text-lg font-bold text-navy-950">{viewNotice.title}</h3>
            </div>

            <div className="bg-warm-50 border border-warm-100 rounded-xl p-5 overflow-x-auto">
              <pre className="text-xs md:text-sm text-navy-800 whitespace-pre-wrap font-sans leading-relaxed">
                {viewNotice.content}
              </pre>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setViewNotice(null)}
                className="btn-outline btn-sm flex-1"
              >
                닫기
              </button>
              <button
                onClick={() => handleCopyNotice(viewNotice.content, viewNotice.id)}
                className="btn-secondary btn-sm flex-1 gap-1.5"
              >
                {copiedId === viewNotice.id ? <Check className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                {copiedId === viewNotice.id ? '복사 완료' : '내용 복사'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
