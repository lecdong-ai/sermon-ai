'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, BookOpen, LogOut, User as UserIcon, Calendar } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

const NAV_ITEMS = [
  { href: '/school', label: '홈' },
  { href: '/school/resources', label: '자료센터' },
  { href: '/school/events/manage', label: '행사 관리' },
  { href: '/school/notice-writer', label: '공지문 작성기' },
  { href: '/school/free', label: '무료자료' },
  { href: '/school/pricing', label: '요금제' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-cs-warm-100 shadow-nav">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/school" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cs-navy-800 to-cs-navy-600 flex items-center justify-center shadow-button group-hover:shadow-card-hover transition-shadow">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-cs-navy-900 leading-tight">교회학교</span>
              <span className="text-[10px] text-cs-navy-400 font-medium -mt-0.5 tracking-wide">SOLUTION</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-cs-navy-600 rounded-lg hover:text-cs-navy-900 hover:bg-cs-navy-50 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/school/mypage" className="btn-ghost text-sm flex items-center gap-1">
                  <UserIcon className="w-4 h-4 text-cs-navy-500" />
                  <span className="font-bold">{user?.user_metadata?.name || '회원'}님</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="btn-outline btn-sm py-1.5 flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  로그아웃
                </button>
              </>
            ) : (
              <Link href="/" className="btn-outline btn-sm py-1.5">
                메인사이트 로그인
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-cs-navy-50 transition-colors"
            aria-label="메뉴"
          >
            {mobileOpen ? <X className="w-5 h-5 text-cs-navy-700" /> : <Menu className="w-5 h-5 text-cs-navy-700" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-cs-warm-100 animate-slide-up">
          <nav className="container-custom py-4 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-base font-medium text-cs-navy-700 rounded-xl hover:bg-cs-navy-50 transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <hr className="my-2 border-cs-warm-100" />
            {user ? (
              <>
                <Link
                  href="/school/mypage"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-base font-medium text-cs-navy-700 rounded-xl hover:bg-cs-navy-50 block"
                >
                  마이페이지 ({user?.user_metadata?.name}님)
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    signOut();
                  }}
                  className="w-full text-left px-4 py-3 text-base font-medium text-red-500 rounded-xl hover:bg-red-50 flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center btn-outline py-2.5"
              >
                메인사이트 로그인
              </Link>
            )}
          </nav>
        </div>
      )}

    </header>
  );
}
