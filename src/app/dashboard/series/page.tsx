'use client'

import { useApp } from '@/lib/dashboard/store'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { Trash2 } from 'lucide-react'

export default function SeriesPage() {
  const { state, deleteSeries } = useApp()
  const router = useRouter()
  const { series, sermons } = state

  const seriesWithCounts = useMemo(
    () =>
      series.map((srs) => {
        const sList = sermons
          .filter((s) => s.seriesId === srs.id)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        return { ...srs, sermonCount: sList.length, sermons: sList }
      }),
    [series, sermons]
  )

  return (
    <div className="animate-fade-in space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">시리즈</h2>
      </div>

      {seriesWithCounts.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/10 rounded-lg p-12 text-center">
          <p className="text-slate-400 text-sm">등록된 시리즈가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-4">
          {seriesWithCounts.map((srs) => (
            <div
              key={srs.id}
              className="bg-white/[0.03] border border-white/10 rounded-lg p-5 hover:shadow-sm transition-shadow cursor-pointer"
              onClick={() => router.push(`/series/${srs.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{srs.name}</h3>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        srs.status === 'active'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : srs.status === 'completed'
                          ? 'bg-blue-500/15 text-blue-300'
                          : 'bg-amber-500/15 text-amber-300'
                      }`}
                    >
                      {srs.status === 'active' ? '진행 중' : srs.status === 'completed' ? '완료' : '예정'}
                    </span>
                  </div>
                  {srs.description && (
                    <p className="text-xs text-slate-400 mt-1">{srs.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span>설교 {srs.sermonCount}편</span>
                    {srs.startDate && <span>시작: {srs.startDate.replace(/-/g, '.')}</span>}
                    {srs.endDate && <span>종료: {srs.endDate.replace(/-/g, '.')}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.stopPropagation()
                      if (confirm(`'${srs.name}' 시리즈를 삭제하시겠습니까?\n시리즈에 속한 설교는 삭제되지 않습니다.`)) {
                        const ok = await deleteSeries(srs.id)
                        if (ok) {
                          alert('삭제되었습니다.')
                        } else {
                          alert('삭제 중 오류가 발생했습니다.')
                        }
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <span className="text-slate-400 text-sm">→</span>
                </div>
              </div>

              {srs.sermons.length > 0 && (
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  {srs.sermons.map((s) => (
                    <span
                      key={s.id}
                      className="text-[10px] bg-white/[0.02] text-slate-400 px-2 py-0.5 rounded-full truncate max-w-[120px]"
                    >
                      {s.title}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
