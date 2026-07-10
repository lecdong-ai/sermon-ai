'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, BookOpen, LogOut, LogIn, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { redirectToMainLogin } from '@/lib/school/auth-redirect';

const NAV_ITEMS = [
  { href: '/school', label: '홈' },
  { href: '/school/projects', label: '설교 프로젝트' },
  { href: '/school/workspace', label: '워크스페이스' },
  { href: '/school/ppt-studio', label: 'PPT 스튜디오' },
  { href: '/school/notice-writer', label: '공지문 작성기' },
  { href: '/school/events/manage', label: '행사 관리' },
  { href: '/school/pricing', label: '요금제' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();

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
            {isLoggedIn ? (
              <>
                <Link
                  href="/school/mypage"
                  className="btn-ghost text-sm flex items-center gap-2"
                  title={user?.email}
                >
                  <UserIcon className="w-4 h-4 text-navy-500" />
                  <div className="flex flex-col items-start leading-tight">
                    <span className="font-bold text-navy-900">{user?.name}님</span>
                    <span className="text-[10px] text-navy-400 font-normal">{user?.email}</span>
                  </div>
                </Link>
                <button
                  onClick={() => logout()}
                  className="btn-outline btn-sm py-1.5 flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  로그아웃
                </button>
              </>
            ) : (
              <button
                onClick={() => redirectToMainLogin('/school')}
                className="btn-outline btn-sm py-1.5 flex items-center gap-1"
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
                  href="/school/mypage"
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
                  redirectToMainLogin('/school');
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
  );
}
