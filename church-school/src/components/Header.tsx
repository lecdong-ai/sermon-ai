'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, BookOpen, LogOut, LogIn, User as UserIcon, ChevronDown, Cross, ExternalLink } from 'lucide-react';
import { useAuth } from './AuthProvider';
import LoginModal from './LoginModal';

const NAV_ITEMS = [
  { href: '/', label: '홈' },
  { href: '/projects', label: '설교 프로젝트' },
  { href: '/workspace', label: '워크스페이스' },
  { href: '/ppt-studio', label: 'PPT 스튜디오' },
  { href: '/notice-writer', label: '공지문 작성기' },
  { href: '/events/manage', label: '행사 관리' },
  { href: '/pricing', label: '후원하기' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginNext, setLoginNext] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isLoggedIn, user, logout, isAdmin } = useAuth();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('login') === '1' && !isLoggedIn) {
        setLoginNext(params.get('next'));
        setLoginOpen(true);
      }
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleCloseLogin = () => {
    setLoginOpen(false);
    if (isLoggedIn && loginNext) {
      router.push(loginNext);
    }
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-warm-100 shadow-nav">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-navy-800 to-navy-600 flex items-center justify-center shadow-button group-hover:shadow-card-hover transition-shadow">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-navy-900 leading-tight">교회학교</span>
                <span className="text-[10px] text-navy-400 font-medium -mt-0.5 tracking-wide">SOLUTION</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-navy-600 rounded-lg hover:text-navy-900 hover:bg-navy-50 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              {isLoggedIn ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="btn-ghost text-sm flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4 text-navy-500" />
                    <div className="flex flex-col items-start leading-tight">
                      <span className="font-bold text-navy-900">{user?.name}님</span>
                      <span className="text-[10px] text-navy-400 font-normal">{user?.email}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-navy-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-warm-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* User Profile Header */}
                        <div className="bg-gradient-to-br from-navy-700 to-navy-600 px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                              <UserIcon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-white truncate">{user?.name || '사용자'}님</p>
                              <p className="text-[11px] text-white/70 truncate mt-0.5">{user?.email}</p>
                            </div>
                          </div>
                          <div className="flex gap-1.5 mt-3">
                            {isAdmin && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/15 text-white/90 backdrop-blur-sm border border-white/10">
                                👑 총관리자
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/10 text-white/70 backdrop-blur-sm border border-white/10">
                              🌿 교회학교
                            </span>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="px-3 pt-3 pb-1.5 space-y-0.5">
                          <Link
                            href="/mypage"
                            onClick={() => setMenuOpen(false)}
                            className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] font-bold text-navy-700 hover:bg-navy-50 transition-all"
                          >
                            <UserIcon className="w-4 h-4 text-navy-400 group-hover:text-navy-600 transition-colors" />
                            <span className="flex-1">마이페이지</span>
                            <span className="text-navy-300 group-hover:text-navy-500 group-hover:translate-x-0.5 transition-all">→</span>
                          </Link>
                        </div>

                        {/* Bunker 목양 Card */}
                        <div className="px-3 py-1.5">
                          <a
                            href="https://bunker.ai.kr"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setMenuOpen(false)}
                            className="group block relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/70 border border-indigo-200/60 px-4 py-3.5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                          >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-200/20 rounded-full -translate-y-8 translate-x-8 pointer-events-none" />
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-sm shrink-0">
                                <Cross className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <span className="text-[13px] font-bold text-indigo-800">Bunker 목양</span>
                                  <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform">↗</span>
                                </div>
                                <p className="text-[11px] text-indigo-500/80 mt-0.5">메인 사역 플랫폼 바로가기</p>
                              </div>
                            </div>
                          </a>
                        </div>

                        {/* Logout */}
                        <div className="border-t border-warm-100 mx-3 mt-1.5 pt-1.5 pb-2">
                          <button
                            onClick={handleLogout}
                            className="group flex items-center gap-3 w-full px-3 py-2 rounded-xl text-[13px] font-bold text-red-500 hover:bg-red-50 transition-all"
                          >
                            <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-500 transition-colors" />
                            <span>로그아웃</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setLoginOpen(true)}
                  className="btn-primary btn-sm py-1.5 flex items-center gap-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  로그인
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-navy-50 transition-colors"
              aria-label="메뉴"
            >
              {mobileOpen ? <X className="w-5 h-5 text-navy-700" /> : <Menu className="w-5 h-5 text-navy-700" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-warm-100 animate-slide-up">
            <nav className="container-custom py-4 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-base font-medium text-navy-700 rounded-xl hover:bg-navy-50 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <hr className="my-2 border-warm-100" />
              {isLoggedIn ? (
                <>
                  <Link
                    href="/mypage"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 text-base font-medium text-navy-700 rounded-xl hover:bg-navy-50 block"
                  >
                    <div className="flex flex-col leading-tight">
                      <span>마이페이지 ({user?.name}님)</span>
                      <span className="text-xs text-navy-400 font-normal mt-0.5">{user?.email}</span>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-3 text-base font-medium text-red-500 rounded-xl hover:bg-red-50 flex items-center gap-1"
                  >
                    <LogOut className="w-4 h-4" />
                    로그아웃
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setLoginOpen(true);
                  }}
                  className="w-full text-left px-4 py-3 text-base font-medium text-navy-700 rounded-xl hover:bg-navy-50 flex items-center gap-1"
                >
                  <LogIn className="w-4 h-4" />
                  로그인
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      <LoginModal open={loginOpen} onClose={handleCloseLogin} next={loginNext} />
    </>
  );
}
