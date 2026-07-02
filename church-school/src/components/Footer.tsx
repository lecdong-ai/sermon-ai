import Link from 'next/link';
import { BookOpen, Mail, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-white">
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-mint-400" />
              </div>
              <div>
                <span className="text-base font-bold leading-tight">교회학교</span>
                <span className="text-[10px] text-navy-300 font-medium block -mt-0.5 tracking-wide">SOLUTION</span>
              </div>
            </Link>
            <p className="text-sm text-navy-300 leading-relaxed">
              교회학교 사역자를 위한<br />
              콘텐츠 + 도구형 솔루션
            </p>
          </div>

          {/* 서비스 */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">서비스</h4>
            <ul className="space-y-2.5">
              <li><Link href="/resources" className="text-sm text-navy-300 hover:text-mint-400 transition-colors">자료센터</Link></li>
              <li><Link href="/notice-writer" className="text-sm text-navy-300 hover:text-mint-400 transition-colors">공지문 작성기</Link></li>
              <li><Link href="/free" className="text-sm text-navy-300 hover:text-mint-400 transition-colors">무료자료</Link></li>
              <li><Link href="/pricing" className="text-sm text-navy-300 hover:text-mint-400 transition-colors">요금제</Link></li>
            </ul>
          </div>

          {/* 지원 */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">지원</h4>
            <ul className="space-y-2.5">
              <li><Link href="/mypage" className="text-sm text-navy-300 hover:text-mint-400 transition-colors">마이페이지</Link></li>
              <li><a href="mailto:support@churchschool.kr" className="text-sm text-navy-300 hover:text-mint-400 transition-colors">문의하기</a></li>
              <li><Link href="/terms" className="text-sm text-navy-300 hover:text-mint-400 transition-colors">이용약관</Link></li>
              <li><Link href="/privacy" className="text-sm text-navy-300 hover:text-mint-400 transition-colors">개인정보처리방침</Link></li>
            </ul>
          </div>

          {/* 연락처 */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">연락처</h4>
            <div className="space-y-3">
              <a href="mailto:support@churchschool.kr" className="flex items-center gap-2 text-sm text-navy-300 hover:text-mint-400 transition-colors">
                <Mail className="w-4 h-4" />
                support@churchschool.kr
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-navy-400">
            © 2025 교회학교 솔루션. All rights reserved.
          </p>
          <p className="text-xs text-navy-400 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-orange-400 fill-orange-400" /> for 다음세대
          </p>
        </div>
      </div>
    </footer>
  );
}
