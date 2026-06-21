'use client'

import { useApp } from '@/lib/dashboard/store'
import { useRouter } from 'next/navigation'
import { useMemo, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/AuthProvider'

export default function DashboardPage() {
  const { state, getSeries } = useApp()
  const { user } = useAuth()
  const router = useRouter()
  const { sermons, themes, series } = state
  const [userName, setUserName] = useState('')
  const [uploadedSermons, setUploadedSermons] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    createClient()
      .from('user_profiles')
      .select('name')
      .eq('id', user.id)
      .single()
      .then(({ data }) => { if (data?.name) setUserName(data.name) })
  }, [user])

  useEffect(() => {
    if (!user) return
    const sb = createClient()
    sb
      .from('sermons')
      .select('id, title, passage, file_name, sermon_date, status, version, updated_at, created_at, book, series, season, result')
      .eq('user_id', user.id)
      .or('source.eq.upload,result->>summary.neq.null')
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => { if (!error && data) setUploadedSermons(data) })
  }, [user])

  const recentSermons = useMemo(
    () => [...sermons]
      .filter(s => s.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5),
    [sermons]
  )

  const completedSermons = useMemo(
    () => sermons.filter(s => s.status === 'completed'),
    [sermons]
  )

  const themeNames = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of completedSermons) {
      for (const tid of s.themeIds) {
        const theme = themes.find((t) => t.id === tid)
        const name = theme?.name || tid
        map.set(name, (map.get(name) || 0) + 1)
      }
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))
  }, [completedSermons, themes])

  const bookCount = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of completedSermons) {
      map.set(s.bibleBook, (map.get(s.bibleBook) || 0) + 1)
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([book, count]) => ({ book, count }))
  }, [completedSermons])

  const seasonCount = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of completedSermons) {
      if (s.season) {
        map.set(s.season, (map.get(s.season) || 0) + 1)
      }
    }
    return Array.from(map.entries()).map(([season, count]) => ({ season, count }))
  }, [completedSermons])

  const audienceCount = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of completedSermons) {
      map.set(s.audience, (map.get(s.audience) || 0) + 1)
    }
    return Array.from(map.entries()).map(([audience, count]) => ({ audience, count }))
  }, [completedSermons])

  const seriesProgress = useMemo(() => {
    return series.map((srs) => {
      const count = completedSermons.filter((s) => s.seriesId === srs.id).length
      return { ...srs, sermonCount: count }
    })
  }, [series, completedSermons])

  return (
    <div className="animate-fade-in space-y-6 max-w-6xl relative">
      {/* 배경 글로우 효과 */}
      <div className="absolute inset-x-0 top-0 h-[400px] pointer-events-none overflow-hidden z-0 bg-radial-glow opacity-50" />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{userName ? `${userName}의 설교아카이브` : '대시보드'}</h2>
            <p className="text-sm text-slate-500 mt-0.5 font-medium">
              총 {completedSermons.length}개의 설교 · {themes.length}개의 태그 · {series.length}개의 시리즈
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/sermons/new')}
            className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl transition-colors shadow-lg shadow-indigo-600/20 font-bold"
          >
            + 새 설교 등록
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 relative z-10">
        <div className="col-span-2 glass-dark rounded-2xl p-5 border border-white/10">
          <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-widest">최근 등록된 설교</h3>
          <div className="space-y-2">
            {recentSermons.map((sermon, i) => (
              <div
                key={sermon.id}
                onClick={() => router.push(`/dashboard/sermons/${sermon.id}`)}
                className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-200 truncate group-hover:text-indigo-300 transition-colors">
                    {sermon.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    {sermon.normalizedPassage} · {sermon.sermonType} · {sermon.audience}
                  </p>
                </div>
                <div className="text-xs text-slate-500 shrink-0 ml-3 font-bold tabular-nums">
                  {sermon.date.replace(/-/g, '.')}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-dark rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">업로드된 설교</h3>
            <button
              onClick={() => router.push('/dashboard/sermons/uploaded')}
              className="text-[11px] text-indigo-300 hover:text-indigo-200 font-bold transition-colors"
            >
              전체 보기 →
            </button>
          </div>
          <div className="space-y-2">
            {uploadedSermons.slice(0, 5).map((sermon, i) => (
              <div
                key={sermon.id}
                onClick={() => router.push(`/workspace?id=${sermon.id}`)}
                className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-200 truncate group-hover:text-indigo-300 transition-colors">
                    {sermon.result?.sermon_title || sermon.title || sermon.file_name?.replace(/\.[^.]+$/, '') || '제목 없음'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate font-medium">
                    {sermon.passage || sermon.file_name?.replace(/\.[^.]+$/, '') || ''}
                  </p>
                </div>
                <div className="text-xs text-slate-500 shrink-0 ml-3 font-bold tabular-nums">
                  {(() => {
                    const d = new Date(sermon.created_at || sermon.createdAt)
                    if (isNaN(d.getTime())) return ''
                    const year = String(d.getFullYear()).slice(-2)
                    const month = String(d.getMonth() + 1).padStart(2, '0')
                    const day = String(d.getDate()).padStart(2, '0')
                    return `${year}/${month}/${day}`
                  })()}
                </div>
              </div>
            ))}
            {uploadedSermons.length === 0 && (
              <p className="text-xs text-slate-500 font-medium">업로드된 설교가 없습니다</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 relative z-10">
        <div className="glass-dark rounded-2xl p-5 border border-white/10">
          <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-widest">성경책별 설교</h3>
          <div className="space-y-1.5">
            {bookCount.slice(0, 8).map((item) => (
              <div key={item.book} className="flex items-center justify-between text-sm">
                <span className="truncate text-slate-200 font-medium">{item.book}</span>
                <span className="text-xs text-slate-500 shrink-0 ml-2 font-bold tabular-nums">{item.count}편</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-dark rounded-2xl p-5 border border-white/10">
          <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-widest">절기별 설교</h3>
          <div className="space-y-1.5">
            {seasonCount.map((item) => (
              <div key={item.season} className="flex items-center justify-between text-sm">
                <span className="truncate text-slate-200 font-medium">{item.season}</span>
                <span className="text-xs text-slate-500 shrink-0 ml-2 font-bold tabular-nums">{item.count}편</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-dark rounded-2xl p-5 border border-white/10">
          <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-widest">회중별 설교</h3>
          <div className="space-y-1.5">
            {audienceCount.map((item) => (
              <div key={item.audience} className="flex items-center justify-between text-sm">
                <span className="truncate text-slate-200 font-medium">{item.audience}</span>
                <span className="text-xs text-slate-500 shrink-0 ml-2 font-bold tabular-nums">{item.count}편</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-dark rounded-2xl p-5 border border-white/10">
          <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-widest">시리즈 진행 현황</h3>
          <div className="space-y-2">
            {seriesProgress.map((srs) => (
              <div key={srs.id} className="text-sm">
                <div className="flex items-center justify-between">
                  <span className="truncate text-slate-200 font-medium">{srs.name}</span>
                  <span className="text-xs text-slate-500 shrink-0 ml-2 font-bold tabular-nums">{srs.sermonCount}편</span>
                </div>
                <div className="mt-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      srs.status === 'active'
                        ? 'bg-indigo-500'
                        : srs.status === 'completed'
                        ? 'bg-emerald-500'
                        : 'bg-amber-400'
                    }`}
                    style={{ width: `${Math.min((srs.sermonCount / 10) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block font-bold">
                  {srs.status === 'active' ? '진행 중' : srs.status === 'completed' ? '완료' : '예정'}
                </span>
              </div>
            ))}
            {seriesProgress.length === 0 && (
              <p className="text-xs text-slate-500 font-medium">등록된 시리즈가 없습니다</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
