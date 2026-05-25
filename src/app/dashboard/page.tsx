'use client'

import { useState, useCallback, useMemo } from 'react'
import type { PageView, SermonD } from '@/types/dashboard'
import { SERMONS as SAMPLE_SERMONS } from '@/data/sampleSermons'
import Sidebar from '@/components/dashboard/Sidebar'
import HomeView from '@/components/dashboard/HomeView'
import SermonListView from '@/components/dashboard/SermonListView'
import SermonDetailView from '@/components/dashboard/SermonDetailView'
import SermonFormView from '@/components/dashboard/SermonFormView'
import GraphView from '@/components/dashboard/GraphView'
import StatisticsView from '@/components/dashboard/StatisticsView'

export default function DashboardPage() {
  const [page, setPage] = useState<PageView>('home')
  const [params, setParams] = useState<Record<string, string>>({})
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sermons, setSermons] = useState<SermonD[]>(SAMPLE_SERMONS)

  const navigate = useCallback((p: PageView, p2?: Record<string, string>) => {
    setPage(p)
    if (p2) setParams(p2)
  }, [])

  const selectedSermonId = params.id

  const handleSelectSermon = useCallback((id: string) => {
    navigate('detail', { id })
  }, [navigate])

  const handleEditSermon = useCallback((id: string) => {
    navigate('edit', { id })
  }, [navigate])

  const handleDeleteSermon = useCallback((id: string) => {
    setSermons((prev) => prev.filter((s) => s.id !== id))
    navigate('list')
  }, [navigate])

  const handleSaveSermon = useCallback((sermon: SermonD) => {
    setSermons((prev) => {
      const idx = prev.findIndex((s) => s.id === sermon.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = sermon
        return next
      }
      return [sermon, ...prev]
    })
    navigate('detail', { id: sermon.id })
  }, [navigate])

  const renderContent = () => {
    switch (page) {
      case 'home':
        return <HomeView onNavigate={navigate as any} />
      case 'list':
        return <SermonListView onSelect={handleSelectSermon} onCreate={() => navigate('new')} />
      case 'detail':
        return selectedSermonId ? (
          <SermonDetailView
            sermonId={selectedSermonId}
            onBack={() => navigate('list')}
            onEdit={handleEditSermon}
            onDelete={handleDeleteSermon}
            onGraph={() => navigate('graph')}
            onNavigate={handleSelectSermon}
          />
        ) : <SermonListView onSelect={handleSelectSermon} onCreate={() => navigate('new')} />
      case 'new':
      case 'edit':
        return (
          <SermonFormView
            sermonId={page === 'edit' ? params.id : undefined}
            onBack={() => navigate('list')}
            onSave={handleSaveSermon}
          />
        )
      case 'graph':
        return <GraphView onSelectSermon={handleSelectSermon} />
      case 'stats':
        return <StatisticsView />
      case 'series':
      case 'series-detail':
      case 'tags':
        return <SeriesAndTagsFallback page={page} onNavigate={navigate as any} onSelectSermon={handleSelectSermon} />
      case 'settings':
        return <SettingsView />
      default:
        return <HomeView onNavigate={navigate as any} />
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      <Sidebar
        currentPage={page}
        onNavigate={(p, p2) => navigate(p as PageView, p2)}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
      />
      <main className="flex-1 flex flex-col min-w-0">
        {renderContent()}
      </main>
    </div>
  )
}

function SeriesAndTagsFallback({
  page,
  onNavigate,
  onSelectSermon,
}: {
  page: string
  onNavigate: (page: string, params?: Record<string, string>) => void
  onSelectSermon: (id: string) => void
}) {
  const { SERIES, SERMONS, THEMES, TAGS } = require('@/data/sampleSermons') as typeof import('@/data/sampleSermons')

  if (page === 'tags') {
    return (
      <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
        <h2 className="text-lg font-bold text-slate-700 mb-4">주제 & 태그</h2>
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">주제</h3>
            <div className="flex flex-wrap gap-2">
              {THEMES.map((t: any) => {
                const count = SERMONS.filter((s: SermonD) => s.themeIds.includes(t.id)).length
                return (
                  <div key={t.id} className="px-3 py-2 bg-amber-50 rounded-xl border border-amber-100 min-w-[100px]">
                    <p className="text-sm font-medium text-amber-700">{t.name}</p>
                    <p className="text-xs text-amber-400">{t.category} · {count}편</p>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="glass-panel rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">상황 태그</h3>
            <div className="flex flex-wrap gap-2">
              {TAGS.filter((t: any) => t.type === 'situation').map((t: any) => {
                const count = SERMONS.filter((s: SermonD) => s.tagIds.includes(t.id)).length
                return (
                  <span key={t.id} className="px-2.5 py-1 text-xs bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                    {t.name} ({count})
                  </span>
                )
              })}
            </div>
          </div>
          <div className="glass-panel rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">감정 태그</h3>
            <div className="flex flex-wrap gap-2">
              {TAGS.filter((t: any) => t.type === 'emotion').map((t: any) => {
                const count = SERMONS.filter((s: SermonD) => s.tagIds.includes(t.id)).length
                return (
                  <span key={t.id} className="px-2.5 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
                    {t.name} ({count})
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
      <h2 className="text-lg font-bold text-slate-700 mb-4">설교 시리즈</h2>
      <div className="space-y-4">
        {SERIES.map((series: any) => {
          const sSermons = SERMONS.filter((s: SermonD) => s.seriesId === series.id)
          const statusColor = series.status === '진행중' ? '#10b981' : series.status === '완료' ? '#94a3b8' : '#6366f1'
          return (
            <div key={series.id} className="glass-panel rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-700">{series.name}</h3>
                    <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: statusColor + '15', color: statusColor }}>{series.status}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{series.description}</p>
                </div>
                <div className="text-xs text-slate-400">{series.startDate} ~ {series.endDate}</div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {sSermons.map((s: SermonD) => (
                  <button
                    key={s.id}
                    onClick={() => onSelectSermon(s.id)}
                    className="px-2.5 py-1 text-xs bg-slate-50 text-slate-600 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors border border-slate-100"
                  >
                    {s.title}
                  </button>
                ))}
                {sSermons.length === 0 && (
                  <span className="text-xs text-slate-300">등록된 설교가 없습니다</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SettingsView() {
  return (
    <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
      <h2 className="text-lg font-bold text-slate-700 mb-4">설정</h2>
      <div className="glass-panel rounded-2xl p-5 space-y-4 max-w-xl">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">정보</h3>
          <p className="text-xs text-slate-400">설교 대시보드 v1.0</p>
          <p className="text-xs text-slate-400 mt-1">샘플 데이터 {SAMPLE_SERMONS.length}개, 주제 {require('@/data/sampleSermons').THEMES.length}개, 태그 {require('@/data/sampleSermons').TAGS.length}개, 시리즈 {require('@/data/sampleSermons').SERIES.length}개</p>
        </div>
        <div className="border-t border-slate-100 pt-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">데이터 관리</h3>
          <p className="text-xs text-slate-400 mb-3">현재 샘플 데이터를 사용 중입니다. 실제 데이터베이스 연동은 준비 중입니다.</p>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors">
              데이터 내보내기 (준비 중)
            </button>
            <button className="px-3 py-1.5 text-xs bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors">
              데이터 가져오기 (준비 중)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
