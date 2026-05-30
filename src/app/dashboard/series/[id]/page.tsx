'use client'

import { useApp } from '@/lib/dashboard/store'
import { useRouter } from 'next/navigation'
import { use, useMemo } from 'react'

export default function SeriesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { state } = useApp()
  const router = useRouter()
  const srs = state.series.find((s) => s.id === id)

  const sermonList = useMemo(
    () =>
      srs
        ? state.sermons
            .filter((s) => s.seriesId === srs.id)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        : [],
    [state.sermons, srs]
  )

  if (!srs) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted">시리즈를 찾을 수 없습니다</p>
        <button
          onClick={() => router.push('/dashboard/series')}
          className="mt-3 text-sm text-primary hover:text-primary-dark"
        >
          ← 목록으로
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => router.back()}
        className="text-sm text-muted hover:text-foreground transition-colors"
      >
        ← 뒤로
      </button>

      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{srs.name}</h1>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              srs.status === 'active'
                ? 'bg-green-50 text-green-700'
                : srs.status === 'completed'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            {srs.status === 'active' ? '진행 중' : srs.status === 'completed' ? '완료' : '예정'}
          </span>
        </div>
        {srs.description && (
          <p className="text-sm text-muted mt-2">{srs.description}</p>
        )}
        <div className="flex items-center gap-4 mt-3 text-sm text-muted">
          <span>시작: {srs.startDate ? srs.startDate.replace(/-/g, '.') : '-'}</span>
          <span>종료: {srs.endDate ? srs.endDate.replace(/-/g, '.') : '-'}</span>
          <span>총 {sermonList.length}편</span>
        </div>
      </div>

      {sermonList.length > 0 ? (
        <div className="bg-surface border border-border rounded-lg p-5">
          <h3 className="text-sm font-semibold text-muted mb-4">설교 목록 ({sermonList.length}편)</h3>
          <div className="space-y-1">
            {sermonList.map((sermon, i) => (
              <div
                key={sermon.id}
                onClick={() => router.push(`/dashboard/sermons/${sermon.id}`)}
                className="flex items-center gap-4 py-3 px-3 rounded-md hover:bg-background cursor-pointer transition-colors group"
              >
                <span className="text-xs text-muted w-6 shrink-0">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">
                    {sermon.title}
                  </p>
                  <p className="text-xs text-muted">
                    {sermon.date.replace(/-/g, '.')} · {sermon.normalizedPassage} · {sermon.sermonType}
                  </p>
                </div>
                <span className="text-xs text-muted shrink-0 ml-2">→</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg p-12 text-center">
          <p className="text-muted text-sm">이 시리즈에 포함된 설교가 없습니다</p>
        </div>
      )}
    </div>
  )
}
