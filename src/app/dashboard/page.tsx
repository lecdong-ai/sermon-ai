'use client'

import { useState, useCallback } from 'react'
import type { PageView, SermonD } from '@/types/dashboard'
import { SERMONS as SAMPLE_SERMONS, THEMES, TAGS, SERIES } from '@/data/sampleSermons'
import Sidebar from '@/components/dashboard/Sidebar'
import HomeView from '@/components/dashboard/HomeView'
import SermonListView from '@/components/dashboard/SermonListView'
import SermonDetailView from '@/components/dashboard/SermonDetailView'
import SermonFormView from '@/components/dashboard/SermonFormView'
import GraphView from '@/components/dashboard/GraphView'
import StatisticsView from '@/components/dashboard/StatisticsView'
import { ArrowLeft, BookOpen, Tag, Layers, FileText, Calendar, Info, Download, Upload } from 'lucide-react'

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

  const handleSelectSermon = useCallback((id: string) => navigate('detail', { id }), [navigate])
  const handleEditSermon = useCallback((id: string) => navigate('edit', { id }), [navigate])
  const handleDeleteSermon = useCallback(
    (id: string) => {
      setSermons((prev) => prev.filter((s) => s.id !== id))
      navigate('list')
    },
    [navigate]
  )
  const handleSaveSermon = useCallback(
    (sermon: SermonD) => {
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
    },
    [navigate]
  )

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
        ) : (
          <SermonListView onSelect={handleSelectSermon} onCreate={() => navigate('new')} />
        )
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
        return <SeriesView onSelectSermon={handleSelectSermon} onBack={() => navigate('home')} />
      case 'tags':
        return <TagsView onBack={() => navigate('home')} />
      case 'settings':
        return <SettingsView />
      default:
        return <HomeView onNavigate={navigate as any} />
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/20">
      <Sidebar
        currentPage={page}
        onNavigate={(p, p2) => navigate(p as PageView, p2)}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
      />
      <main className="flex-1 flex flex-col min-w-0">{renderContent()}</main>
    </div>
  )
}

/* ─── Series View ───────────────────────────────────── */
function SeriesView({ onSelectSermon, onBack }: { onSelectSermon: (id: string) => void; onBack: () => void }) {
  const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
    진행중: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: '#10b981' },
    완료: { bg: 'bg-slate-100', text: 'text-slate-500', dot: '#94a3b8' },
    예정: { bg: 'bg-indigo-50', text: 'text-indigo-600', dot: '#6366f1' },
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-3 border-b border-slate-200/30 bg-white/50 backdrop-blur-sm flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-800">설교 시리즈</h1>
          <p className="text-xs text-slate-400 mt-0.5">총 {SERIES.length}개의 시리즈</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
        {SERIES.map((series) => {
          const sSermons = SAMPLE_SERMONS.filter((s) => s.seriesId === series.id)
          const c = statusColors[series.status] || statusColors.완료
          const progress = series.status === '진행중' ? 60 : series.status === '완료' ? 100 : 20
          return (
            <div key={series.id} className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-slate-700">{series.name}</h3>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.dot }} />
                      {series.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{series.description}</p>
                </div>
                <div className="text-xs text-slate-400 flex-shrink-0 text-right">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {series.startDate} ~ {series.endDate}
                  </div>
                </div>
              </div>

              {/* progress bar */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full mb-3 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, backgroundColor: c.dot }} />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {sSermons.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onSelectSermon(s.id)}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-50 text-slate-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-slate-100 hover:border-indigo-200"
                  >
                    {s.title}
                  </button>
                ))}
                {sSermons.length === 0 && <span className="text-xs text-slate-300">등록된 설교가 없습니다</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Tags View ──────────────────────────────────────── */
function TagsView({ onBack }: { onBack: () => void }) {
  const themeCounts = THEMES.map((t) => ({
    ...t,
    count: SAMPLE_SERMONS.filter((s) => s.themeIds.includes(t.id)).length,
  }))

  const situationTags = TAGS.filter((t) => t.type === 'situation').map((t) => ({
    ...t,
    count: SAMPLE_SERMONS.filter((s) => s.tagIds.includes(t.id)).length,
  }))

  const emotionTags = TAGS.filter((t) => t.type === 'emotion').map((t) => ({
    ...t,
    count: SAMPLE_SERMONS.filter((s) => s.tagIds.includes(t.id)).length,
  }))

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-3 border-b border-slate-200/30 bg-white/50 backdrop-blur-sm flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-800">주제 & 태그</h1>
          <p className="text-xs text-slate-400 mt-0.5">주제 {themeCounts.length}개 · 상황 태그 {situationTags.length}개 · 감정 태그 {emotionTags.length}개</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
        {/* themes */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-5">
          <h3 className="text-xs font-semibold tracking-wide uppercase text-slate-400 mb-4 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> 주제
          </h3>
          <div className="flex flex-wrap gap-2">
            {themeCounts.map((t) => (
              <div
                key={t.id}
                className="px-3 py-2.5 bg-amber-50/70 rounded-xl border border-amber-100/50 min-w-[100px] hover:border-amber-200 transition-colors"
              >
                <p className="text-sm font-medium text-amber-700">{t.name}</p>
                <p className="text-[11px] text-amber-400 mt-0.5">{t.category} · {t.count}편</p>
              </div>
            ))}
          </div>
        </div>

        {/* situation tags */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-5">
          <h3 className="text-xs font-semibold tracking-wide uppercase text-slate-400 mb-4 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" /> 상황 태그
          </h3>
          <div className="flex flex-wrap gap-2">
            {situationTags.map((t) => (
              <span
                key={t.id}
                className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100/50 hover:bg-emerald-100 transition-colors"
              >
                {t.name}
                <span className="ml-1.5 text-emerald-400 font-normal">{t.count}</span>
              </span>
            ))}
          </div>
        </div>

        {/* emotion tags */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-5">
          <h3 className="text-xs font-semibold tracking-wide uppercase text-slate-400 mb-4 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" /> 감정 태그
          </h3>
          <div className="flex flex-wrap gap-2">
            {emotionTags.map((t) => (
              <span
                key={t.id}
                className="px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100/50 hover:bg-indigo-100 transition-colors"
              >
                {t.name}
                <span className="ml-1.5 text-indigo-400 font-normal">{t.count}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Settings View ──────────────────────────────────── */
function SettingsView() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-3 border-b border-slate-200/30 bg-white/50 backdrop-blur-sm">
        <h1 className="text-lg font-bold text-slate-800">설정</h1>
        <p className="text-xs text-slate-400 mt-0.5">대시보드 설정을 관리합니다</p>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
        <div className="max-w-xl space-y-4">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-5 space-y-3">
            <h3 className="text-xs font-semibold tracking-wide uppercase text-slate-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> 정보
            </h3>
            <div className="text-sm text-slate-600 space-y-1">
              <p>설교 대시보드 v1.0</p>
              <p className="text-xs text-slate-400">
                샘플 데이터 {SAMPLE_SERMONS.length}개 · 주제 {THEMES.length}개 · 태그 {TAGS.length}개 · 시리즈 {SERIES.length}개
              </p>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-5 space-y-4">
            <h3 className="text-xs font-semibold tracking-wide uppercase text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> 데이터 관리
            </h3>
            <p className="text-xs text-slate-400">현재 샘플 데이터를 사용 중입니다. 실제 데이터베이스 연동은 준비 중입니다.</p>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50" disabled>
                <Download className="w-3.5 h-3.5" /> 내보내기
              </button>
              <button className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50" disabled>
                <Upload className="w-3.5 h-3.5" /> 가져오기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
