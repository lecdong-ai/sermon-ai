'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import FileUpload from '@/components/FileUpload'
import { X } from 'lucide-react'

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
]

export default function UploadedSermonsPage() {
  const router = useRouter()
  const [sermons, setSermons] = useState<UploadedSermon[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user)
        sb
          .from('sermons')
          .select('id, title, passage, file_name, sermon_date, status, version, updated_at, created_at, book, series, season, result')
          .eq('user_id', data.user.id)
          .or('source.eq.upload,result->>summary.neq.null')
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

  async function handleDelete(e: React.MouseEvent, sermonId: string) {
    e.stopPropagation()
    if (!confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return
    const sb = createClient()
    const { error } = await sb.from('sermons').delete().eq('id', sermonId)
    if (error) {
      alert('삭제 중 오류가 발생했습니다: ' + error.message)
    } else {
      setSermons(prev => prev.filter(s => s.id !== sermonId))
    }
  }

  const handleUploadSuccess = (sermonId: string) => {
    setShowUploadModal(false)
    router.push(`/workspace?id=${sermonId}`)
  }

  if (loading) {
    return (
      <div className="animate-fade-in py-12 text-center">
        <p className="text-slate-400 text-sm">로딩 중...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="animate-fade-in py-12 text-center">
        <p className="text-slate-400 text-sm mb-4">로그인이 필요합니다</p>
        <button
          onClick={() => router.push('/login?redirect=/dashboard/sermons/uploaded')}
          className="text-sm bg-indigo-600 hover:bg-indigo-600-dark text-white px-5 py-2 rounded-md transition-colors"
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
        <p className="text-sm text-slate-400 mt-0.5">메인 페이지에서 업로드하고 AI 분석을 받은 설교 원고</p>
      </div>

      {sermons.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/10 rounded-lg p-12 text-center">
          <p className="text-slate-400 text-sm mb-4">업로드된 설교 원고가 없습니다</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="text-sm bg-indigo-600 hover:bg-indigo-600-dark text-white px-5 py-2 rounded-md transition-colors"
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
              className="bg-white/[0.03] border border-white/10 rounded-lg p-5 hover:shadow-sm cursor-pointer transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                      {sermon.result?.sermon_title || sermon.title || sermon.file_name?.replace(/\.[^.]+$/, '') || '제목 없음'}
                    </h3>
                    {sermon.season && (
                      <span className="text-[10px] bg-purple-500/15 text-purple-300 px-1.5 py-0.5 rounded-full shrink-0">
                        {sermon.season}
                      </span>
                    )}
                  </div>
                  {sermon.passage && (
                    <p className="text-xs text-slate-400 mt-1">{sermon.passage}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span>{new Date(sermon.created_at).toLocaleDateString('ko-KR')}</span>
                    {sermon.series && <span>· {sermon.series}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => handleDelete(e, sermon.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded transition-all"
                    title="삭제"
                  >
                    🗑️
                  </button>
                  <span className="text-slate-400 text-sm group-hover:text-indigo-300 transition-colors">→</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                {SERVICES.map((svc) => (
                  <span
                    key={svc.key}
                    className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      hasService(sermon, svc.key)
                        ? 'bg-indigo-600/10 text-indigo-300'
                        : 'bg-white/5 text-slate-500'
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

      {showUploadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={() => setShowUploadModal(false)}
        >
          <div
            className="w-full max-w-2xl bg-[#0c1020] rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div>
                <h2 className="text-base font-bold text-white">설교 원고 업로드</h2>
                <p className="text-xs text-slate-400 mt-0.5">PDF, TXT, DOCX 파일을 업로드하면 AI가 6개 서비스를 생성합니다</p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <FileUpload onSuccess={handleUploadSuccess} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
