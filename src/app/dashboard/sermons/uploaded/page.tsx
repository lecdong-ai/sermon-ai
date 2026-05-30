'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface UploadedSermon {
  id: string
  title: string
  passage: string
  file_name: string
  sermon_date: string
  status: string
  version: number
  updated_at: string
  created_at: string
  book: string | null
  series: string | null
  season: string | null
  result: {
    summary?: { title?: string; central_topic?: string } | null
    groupDiscussion?: any
    cardNews?: any
    sermonScript?: string | null
    shortsScript?: string | null
    pptData?: any
    hymn_title?: string
    sermon_title?: string
    sermon_passage?: string
  } | null
}

const SERVICES = [
  { key: 'summary', label: '요약', icon: '📋' },
  { key: 'groupDiscussion', label: '소그룹', icon: '👥' },
  { key: 'cardNews', label: '카드뉴스', icon: '🖼️' },
  { key: 'sermonScript', label: '설교문', icon: '📝' },
  { key: 'shortsScript', label: '유튜브', icon: '▶️' },
  { key: 'pptData', label: 'PPT', icon: '📊' },
]

export default function UploadedSermonsPage() {
  const router = useRouter()
  const [sermons, setSermons] = useState<UploadedSermon[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string } | null>(null)

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user)
        sb
          .from('sermons')
          .select('id, title, passage, file_name, sermon_date, status, version, updated_at, created_at, book, series, season, result')
          .eq('user_id', data.user.id)
          .order('updated_at', { ascending: false })
          .then(({ data, error }) => {
            if (!error && data) setSermons(data as UploadedSermon[])
            setLoading(false)
          })
      } else {
        setLoading(false)
      }
    })
  }, [])

  function hasService(sermon: UploadedSermon, key: string): boolean {
    if (!sermon.result) return false
    const val = sermon.result[key as keyof typeof sermon.result]
    if (val === null || val === undefined) return false
    if (typeof val === 'string') return val.length > 0
    if (typeof val === 'object') return Object.keys(val).length > 0
    return false
  }

  if (loading) {
    return (
      <div className="animate-fade-in py-12 text-center">
        <p className="text-muted text-sm">로딩 중...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="animate-fade-in py-12 text-center">
        <p className="text-muted text-sm mb-4">로그인이 필요합니다</p>
        <button
          onClick={() => router.push('/login?redirect=/dashboard/sermons/uploaded')}
          className="text-sm bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-md transition-colors"
        >
          로그인하기
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-6xl">
      <div>
        <h2 className="text-xl font-bold">업로드된 설교</h2>
        <p className="text-sm text-muted mt-0.5">메인 페이지에서 업로드하고 AI 분석을 받은 설교 원고</p>
      </div>

      {sermons.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-12 text-center">
          <p className="text-muted text-sm mb-4">업로드된 설교 원고가 없습니다</p>
          <button
            onClick={() => window.location.href = '/sermon/new'}
            className="text-sm bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-md transition-colors"
          >
            설교 원고 업로드
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sermons.map((sermon) => (
            <div
              key={sermon.id}
              onClick={() => window.location.href = `/workspace?id=${sermon.id}`}
              className="bg-surface border border-border rounded-lg p-5 hover:shadow-sm cursor-pointer transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {sermon.result?.sermon_title || sermon.title || sermon.file_name?.replace(/\.[^.]+$/, '') || '제목 없음'}
                    </h3>
                    {sermon.season && (
                      <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full shrink-0">
                        {sermon.season}
                      </span>
                    )}
                  </div>
                  {sermon.passage && (
                    <p className="text-xs text-muted mt-1">{sermon.passage}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                    <span>{new Date(sermon.created_at).toLocaleDateString('ko-KR')}</span>
                    {sermon.series && <span>· {sermon.series}</span>}
                  </div>
                </div>
                <span className="text-muted text-sm shrink-0 group-hover:text-primary transition-colors">→</span>
              </div>

              <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                {SERVICES.map((svc) => (
                  <span
                    key={svc.key}
                    className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      hasService(sermon, svc.key)
                        ? 'bg-primary/10 text-primary'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <span>{svc.icon}</span>
                    <span>{svc.label}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
