'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckSquare,
  ClipboardCheck,
  ExternalLink,
  Package,
  Printer,
  Square,
  Users,
} from 'lucide-react';

interface HeadcountTier {
  count: number;
  label: string;
  pieceRange: string;
  boxSummary: string;
  note: string;
}

const HEADCOUNT_TIERS: HeadcountTier[] = [
  {
    count: 15,
    label: '15명',
    pieceRange: '50~60개',
    boxSummary: '1박스 (남음)',
    note: '100개입 1박스 구매 시 40~50개 여유분 남음',
  },
  {
    count: 25,
    label: '25명',
    pieceRange: '90~100개',
    boxSummary: '1박스',
    note: '100개입 1박스 기준 딱 맞는 분량',
  },
  {
    count: 40,
    label: '40명',
    pieceRange: '150~160개',
    boxSummary: '2박스',
    note: '100개입 2박스 기준 (여유분 40~50개)',
  },
  {
    count: 50,
    label: '50명',
    pieceRange: '180~200개',
    boxSummary: '2박스',
    note: '100개입 2박스 기준 딱 맞는 분량',
  },
];

const CHECKLIST_ITEMS = [
  {
    id: 'individual-pack',
    label: '개별포장 확인',
    detail: '분반별 소분 및 위생 배분을 위해 낱개 개별포장 여부 확인',
  },
  {
    id: 'expiry-photo',
    label: '유통기한 사진',
    detail: '박스 및 낱개 봉투 유통기한 촬영 후 교사 단톡방 공유',
  },
  {
    id: 'allergy-label',
    label: '알레르기 표시',
    detail: '견과류·우유·밀 등 알레르기 유발 성분 사전 확인 및 안내',
  },
  {
    id: 'ziplock-storage',
    label: '지퍼백 보관',
    detail: '남은 간식 습기 방지용 지퍼백·밀폐용기 별도 지참',
  },
] as const;

const BLOG_REVIEW_URL = 'https://blog.naver.com/heebee';

export default function ReadyPage() {
  const [selectedCount, setSelectedCount] = useState<number>(25);
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});

  const activeTier =
    HEADCOUNT_TIERS.find((tier) => tier.count === selectedCount) ??
    HEADCOUNT_TIERS[1];

  const hasBlogUrl = Boolean(BLOG_REVIEW_URL && BLOG_REVIEW_URL.trim().length > 0);

  const toggleCheck = (id: string) => {
    setCheckedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-warm-50 text-navy-950 py-8 sm:py-12 px-4 print:bg-white print:py-0 print:px-0">
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 10mm;
        }
        @media print {
          html,
          body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          header,
          nav,
          footer,
          .no-print,
          .fixed {
            display: none !important;
          }
          main {
            padding-top: 0 !important;
            min-height: auto !important;
          }
          .print-sheet {
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 12px !important;
            padding: 14px 16px !important;
            max-width: 100% !important;
            width: 100% !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .print-compact-gap {
            gap: 10px !important;
          }
          .print-compact-section {
            margin-top: 10px !important;
            padding-top: 10px !important;
          }
        }
      `}</style>

      <div className="max-w-3xl mx-auto space-y-5 print:space-y-0">
        {/* 상단 네비게이션 (인쇄 시 숨김) */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Link
            href="/school"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-600 hover:text-navy-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>교회학교 솔루션으로 돌아가기</span>
          </Link>
          <span className="inline-flex items-center self-start sm:self-auto px-3 py-1 rounded-full bg-mint-50 text-mint-700 border border-mint-200 text-xs font-bold">
            Bunker 100% 무료 사역 도구
          </span>
        </div>

        {/* A4 1장 인쇄 대상 시트 */}
        <div className="print-sheet bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-warm-200 space-y-6 print:space-y-3">
          {/* 제목 영역 */}
          <div className="border-b border-warm-200 pb-4 print:pb-2.5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-mint-700 mb-1">
                <ClipboardCheck className="w-4 h-4 text-mint-600" />
                <span>행사 준비물 체크리스트 · 무료</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight print:text-xl">
                분반 간식 분량표 &amp; 준비물 체크리스트
              </h1>
              <p className="text-sm text-navy-600 mt-1 print:text-xs">
                수련회, 성경학교, 분반 간식 때마다 다시 묻는 것을 모아놨어요. 표만 뽑아서 바로 씁니다.
              </p>
            </div>
            <div className="text-xs text-navy-400 font-medium shrink-0">
              기준: 100개입 1박스
            </div>
          </div>

          {/* 기능 A: 인원 선택 및 100개입 기준 박스 수 표시 */}
          <section className="space-y-4 print:space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-bold text-navy-950 flex items-center gap-2 print:text-sm">
                <Users className="w-4 h-4 text-mint-600" />
                <span>1. 인원 선택 (100개입 기준 박스 수)</span>
              </h2>
            </div>

            {/* 인원 선택 버튼 (360px에서도 2열로 겹침 없이 배치) */}
            <div className="no-print grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {HEADCOUNT_TIERS.map((tier) => {
                const isSelected = tier.count === selectedCount;
                return (
                  <button
                    key={tier.count}
                    type="button"
                    onClick={() => setSelectedCount(tier.count)}
                    className={`px-4 py-3 rounded-xl text-sm font-bold border transition-all ${
                      isSelected
                        ? 'bg-navy-900 text-white border-navy-900 shadow-card'
                        : 'bg-warm-50 text-navy-700 border-warm-200 hover:bg-warm-100'
                    }`}
                  >
                    {tier.label}
                  </button>
                );
              })}
            </div>

            {/* 선택된 인원 요약 카드 */}
            <div className="rounded-2xl bg-mint-50 border border-mint-200 p-4 sm:p-5 print:p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xs font-bold text-mint-700">
                  선택 인원: {activeTier.label}
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-navy-950 print:text-base">
                  필요 수량 {activeTier.pieceRange} ·{' '}
                  <span className="text-mint-700">{activeTier.boxSummary}</span>
                </div>
                <p className="text-xs text-navy-600">{activeTier.note}</p>
              </div>
              <div className="inline-flex items-center gap-2 self-start sm:self-center px-3.5 py-2 rounded-xl bg-white border border-mint-200 text-xs font-bold text-navy-800 shrink-0">
                <Package className="w-4 h-4 text-mint-600" />
                <span>100개입 기준 {activeTier.boxSummary}</span>
              </div>
            </div>

            {/* 전체 분량표 (인쇄 시 A4 1장에 함께 출력) */}
            <div className="overflow-x-auto rounded-2xl border border-warm-200">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-warm-100 text-navy-800 border-b border-warm-200">
                    <th className="py-2.5 px-3 font-bold">인원</th>
                    <th className="py-2.5 px-3 font-bold">필요 수량</th>
                    <th className="py-2.5 px-3 font-bold">100개입 기준</th>
                    <th className="py-2.5 px-3 font-bold">비고</th>
                  </tr>
                </thead>
                <tbody>
                  {HEADCOUNT_TIERS.map((tier) => {
                    const isSelected = tier.count === selectedCount;
                    return (
                      <tr
                        key={tier.count}
                        onClick={() => setSelectedCount(tier.count)}
                        className={`border-b border-warm-100 last:border-b-0 cursor-pointer transition-colors ${
                          isSelected ? 'bg-mint-50/70 font-semibold' : 'bg-white hover:bg-warm-50'
                        }`}
                      >
                        <td className="py-2.5 px-3 text-navy-950 font-bold">
                          {tier.label}
                          {isSelected && (
                            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-mint-500 text-white">
                              선택
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-navy-800">{tier.pieceRange}</td>
                        <td className="py-2.5 px-3 text-mint-700 font-bold">{tier.boxSummary}</td>
                        <td className="py-2.5 px-3 text-navy-500">{tier.note}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* 기능 B: 체크박스 4개 */}
          <section className="print-compact-section pt-4 border-t border-warm-200 space-y-3 print:space-y-2">
            <h2 className="text-base font-bold text-navy-950 print:text-sm">
              2. 현장 배분 필수 체크리스트
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 print:gap-2">
              {CHECKLIST_ITEMS.map((item) => {
                const checked = Boolean(checkedMap[item.id]);
                return (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-3.5 print:p-2.5 rounded-2xl border cursor-pointer transition-all ${
                      checked
                        ? 'bg-mint-50 border-mint-300'
                        : 'bg-warm-50 border-warm-200 hover:bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCheck(item.id)}
                      className="sr-only"
                    />
                    <span className="mt-0.5 text-mint-600 shrink-0">
                      {checked ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5 text-navy-400" />
                      )}
                    </span>
                    <div className="space-y-0.5">
                      <div className="text-sm font-bold text-navy-950 print:text-xs">
                        {item.label}
                      </div>
                      <p className="text-xs text-navy-600 leading-snug print:text-[11px]">
                        {item.detail}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          {/* 기능 C: 인쇄 & 연결 버튼 (모바일 360px 세로 쌓기, 인쇄 시 숨김) */}
          <div className="no-print pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm px-5 py-3"
            >
              <Printer className="w-4 h-4 shrink-0" />
              <span>A4 1장으로 인쇄하기</span>
            </button>

            {hasBlogUrl ? (
              <a
                href={BLOG_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm px-5 py-3"
              >
                <ExternalLink className="w-4 h-4 shrink-0" />
                <span>분반 간식 분량표 블로그 보기</span>
              </a>
            ) : (
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="btn-secondary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm px-5 py-3 opacity-50 cursor-not-allowed"
              >
                <ExternalLink className="w-4 h-4 shrink-0" />
                <span>분반 간식 분량표 블로그 보기</span>
              </button>
            )}

            <Link
              href="/school/notice-writer"
              className="btn-outline w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm px-5 py-3"
            >
              <span>공지문 작성기로 이동</span>
            </Link>
          </div>

          {/* 기능 D: 하단 고지 */}
          {/* 삭제 금지: 파트너스 고지 */}
          <div className="print-compact-section pt-4 border-t border-warm-200 text-xs text-navy-500 leading-relaxed print:text-[10px]">
            이 페이지의 구매 링크는 쿠팡 파트너스 글로 연결되며 수수료가 발생할 수 있습니다. 가격은 쿠팡 표시 기준입니다.
          </div>
        </div>
      </div>
    </div>
  );
}

