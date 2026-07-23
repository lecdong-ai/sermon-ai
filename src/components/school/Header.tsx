'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, BookOpen, LogOut, User as UserIcon, LayoutDashboard, Music2, ScrollText, Crown, Heart, BookMarked } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

const NAV_ITEMS = [
  { href: '/school', label: '홈' },

  { href: '/school/workspace', label: '워크스페이스' },
  { href: '/school/ppt-studio', label: 'PPT 스튜디오' },
  { href: '/school/notice-writer', label: '공지문 작성기' },
  { href: '/school/events/manage', label: '행사 관리' },
  { href: '/school/pricing', label: '스토어' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-warm-100 shadow-nav">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-navy-800 to-navy-600 flex items-center justify-center shadow-button group-hover:shadow-card-hover transition-shadow">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-navy-500 hover:text-navy-700 transition-colors">Bunker 목양</span>
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
            {isLoggedIn && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="btn-ghost text-sm flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4 text-navy-500" />
                  <span className="font-bold text-navy-900">{user?.user_metadata?.name || user?.email?.split('@')[0] || ''}님</span>
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-warm-100 py-2 z-50 animate-slide-up">
                      <div className="px-4 py-2.5 border-b border-warm-100 mb-1.5">
                        <p className="text-[12px] text-navy-400 font-medium">{user?.user_metadata?.name || user?.email?.split('@')[0] || ''}님</p>
                        <p className="text-[13px] font-bold text-navy-900 truncate mt-0.5">{user?.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-bold text-navy-700 hover:text-navy-900 hover:bg-navy-50 transition-all"
                      >
                        <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                        설교 대시보드
                      </Link>
                      <Link
                        href="/conti"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-bold text-navy-700 hover:text-navy-900 hover:bg-navy-50 transition-all"
                      >
                        <Music2 className="w-4 h-4 text-indigo-500" />
                        예배 콘티
                      </Link>
                      <Link
                        href="/qt"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-bold text-navy-700 hover:text-navy-900 hover:bg-navy-50 transition-all"
                      >
                        <BookMarked className="w-4 h-4 text-indigo-500" />
                        QT 아카이브
                      </Link>
                      <Link
                        href="/advanced/bible"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-bold text-navy-700 hover:text-navy-900 hover:bg-navy-50 transition-all"
                      >
                        <ScrollText className="w-4 h-4 text-indigo-500" />
                        말씀 연구실
                      </Link>
                      <Link
                        href="/support"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-bold text-navy-700 hover:text-navy-900 hover:bg-navy-50 transition-all"
                      >
                        <Heart className="w-4 h-4 text-rose-500" />
                        후원 안내
                      </Link>
                      <div className="border-t border-warm-100 mt-1.5 pt-1.5">
                        <Link
                          href="/mypage"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-bold text-navy-700 hover:text-navy-900 hover:bg-navy-50 transition-all"
                        >
                          <UserIcon className="w-4 h-4 text-navy-500" />
                          마이페이지
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full px-4 py-2 text-[13px] font-bold text-red-500 hover:text-red-600 hover:bg-red-50 transition-all"
                        >
                          <LogOut className="w-4 h-4" />
                          로그아웃
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
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
            <p className="px-4 py-1 text-[11px] font-bold text-navy-400 uppercase tracking-wider">다른 서비스</p>
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 text-base font-medium text-navy-700 rounded-xl hover:bg-navy-50 flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-500" />
              설교 대시보드
            </Link>
            <Link
              href="/conti"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 text-base font-medium text-navy-700 rounded-xl hover:bg-navy-50 flex items-center gap-2"
            >
              <Music2 className="w-4 h-4 text-indigo-500" />
              예배 콘티
            </Link>
            <Link
              href="/qt"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 text-base font-medium text-navy-700 rounded-xl hover:bg-navy-50 flex items-center gap-2"
            >
              <BookMarked className="w-4 h-4 text-indigo-500" />
              QT 아카이브
            </Link>
            <Link
              href="/support"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 text-base font-medium text-navy-700 rounded-xl hover:bg-navy-50 flex items-center gap-2"
            >
              <Heart className="w-4 h-4 text-rose-500" />
              후원 안내
            </Link>
            {isLoggedIn && (
              <>
                <hr className="my-2 border-warm-100" />
                <Link
                  href="/mypage"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-base font-medium text-navy-700 rounded-xl hover:bg-navy-50 block"
                >
                  <div className="flex flex-col leading-tight">
                    <span>마이페이지 ({user?.user_metadata?.name || user?.email?.split('@')[0] || ''}님)</span>
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
            )}
          </nav>
        </div>
      )}

    </header>
  );
}
