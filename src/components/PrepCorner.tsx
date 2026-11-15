'use client';

import Link from 'next/link';
import { ClipboardList, ExternalLink, MessageSquare, Printer } from 'lucide-react';

export interface PrepCornerProps {
  blogReviewUrl: string;
  noticeToolUrl: string;
  pdfUrl: string;
}

export default function PrepCorner({
  blogReviewUrl,
  noticeToolUrl,
  pdfUrl,
}: PrepCornerProps) {
  const hasBlogUrl = Boolean(blogReviewUrl && blogReviewUrl.trim().length > 0);
  const hasNoticeUrl = Boolean(noticeToolUrl && noticeToolUrl.trim().length > 0);
  const hasPdfUrl = Boolean(pdfUrl && pdfUrl.trim().length > 0);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-warm-200">
      <div className="flex flex-col gap-5">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint-50 text-mint-700 border border-mint-200 text-xs font-bold">
              <ClipboardList className="w-3.5 h-3.5" />
              무료
            </span>
            <span className="text-xs font-medium text-navy-500">
              Bunker 100% 무료 사역 도구
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-navy-950 tracking-tight">
            행사 준비물 체크리스트 <span className="text-mint-600">무료</span>
          </h3>

          <p className="text-sm text-navy-600 leading-relaxed">
            수련회, 성경학교, 분반 간식 때마다 다시 묻는 것을 모아놨어요. 표만 뽑아서 바로 씁니다.
          </p>
        </div>

        {/* 모바일 360px 세로 쌓기, sm 이상 가로 배치 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {hasBlogUrl ? (
            <a
              href={blogReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm px-5 py-3"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              <span>분반 간식 분량표 보기</span>
            </a>
          ) : (
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="btn-secondary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm px-5 py-3 opacity-50 cursor-not-allowed"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              <span>분반 간식 분량표 보기</span>
            </button>
          )}

          {hasNoticeUrl ? (
            <Link
              href={noticeToolUrl}
              className="btn-outline w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm px-5 py-3"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>공지문 만들기</span>
            </Link>
          ) : (
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="btn-outline w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm px-5 py-3 opacity-50 cursor-not-allowed"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>공지문 만들기</span>
            </button>
          )}

          {hasPdfUrl ? (
            <Link
              href={pdfUrl}
              className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm px-5 py-3"
            >
              <Printer className="w-4 h-4 shrink-0" />
              <span>체크리스트 인쇄</span>
            </Link>
          ) : (
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm px-5 py-3 opacity-50 cursor-not-allowed"
            >
              <Printer className="w-4 h-4 shrink-0" />
              <span>체크리스트 인쇄</span>
            </button>
          )}
        </div>

        {/* 삭제 금지: 파트너스 고지 */}
        <p className="text-xs text-navy-400 leading-relaxed pt-2 border-t border-warm-100">
          쿠팡 상품 링크가 포함된 블로그 글로 연결됩니다. 해당 글에는 파트너스 고지가 표시되어 있습니다.
        </p>
      </div>
    </div>
  );
}

