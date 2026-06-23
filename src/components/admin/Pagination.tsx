'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
  loading?: boolean
}

function buildPageRange(current: number, total: number): Array<number | 'gap'> {
  if (total <= 1) return [1]
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: Array<number | 'gap'> = []
  const add = (p: number) => { if (!pages.includes(p)) pages.push(p) }

  add(1)
  if (current > 4) pages.push('gap')
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) add(p)
  if (current < total - 3) pages.push('gap')
  add(total)

  return pages
}

export default function Pagination({ page, totalPages, total, limit, onPageChange, loading }: PaginationProps) {
  if (totalPages <= 1 && total === 0) {
    return null
  }

  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)
  const range = buildPageRange(page, totalPages)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
      <p className="text-[12px] text-slate-500 tabular-nums">
        {total === 0 ? (
          '결과 없음'
        ) : (
          <>
            <span className="text-slate-300 font-semibold">{from}</span>
            <span className="mx-1">–</span>
            <span className="text-slate-300 font-semibold">{to}</span>
            <span className="mx-1">/</span>
            <span className="text-slate-300 font-semibold">{total.toLocaleString('ko-KR')}</span>
            <span className="ml-1">명</span>
          </>
        )}
      </p>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={page === 1 || loading}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="처음"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1 || loading}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="이전"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-0.5">
            {range.map((p, i) =>
              p === 'gap' ? (
                <span key={`gap-${i}`} className="px-1.5 text-[11px] text-slate-600">…</span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange(p)}
                  disabled={loading}
                  className={`min-w-[28px] h-7 px-2 rounded-lg text-[12px] font-bold tabular-nums transition-colors disabled:cursor-not-allowed ${
                    p === page
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages || loading}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="다음"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages || loading}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="끝"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
