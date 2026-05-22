'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/AuthProvider'
import { FileText, BookOpen, ChevronRight, Calendar, Trash2, AlertCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'

const supabase = createClient()

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [sermons, setSermons] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState('')

  const loadSermons = useCallback(async () => {
    if (!user) return
    setDataLoading(true)
    setError('')
    const { data, error } = await supabase
      .from('sermons')
      .select('id, title, passage, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    if (error) setError(`데이터를 불러올 수 없습니다: ${error.message}`)
    else setSermons(data || [])
    setDataLoading(false)
  }, [user])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/dashboard')
      return
    }
    if (user) loadSermons()
  }, [user, loading, loadSermons, router])

  const deleteSermon = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    const { error } = await supabase.from('sermons').delete().eq('id', id)
    if (!error) setSermons((prev) => prev.filter((s) => s.id !== id))
  }

  if (loading || dataLoading) {
    return (
      <div className="relative flex items-center justify-center min-h-[70vh] bg-slate-50/50">
        <div className="absolute inset-0 pointer-events-none bg-grid-tech opacity-60" />
        <div className="relative flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200/60" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin" />
          </div>
          <p className="text-[14px] text-slate-400 font-semibold tracking-wider animate-pulse">데이터를 불러오는 중입니다...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50/50">
      
      {/* 백그라운드 디자인 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden bg-grid-tech">
        <div className="absolute top-[-25%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-indigo-300/10 via-blue-300/5 to-transparent blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-15%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-purple-300/10 via-indigo-300/5 to-transparent blur-3xl animate-pulse-slower" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-10 sm:py-16">
        <div className="animate-in">
          
          {/* 헤더 섹션 */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-[28px] sm:text-[32px] font-extrabold font-outfit text-gradient tracking-tight">대시보드</h1>
              <p className="text-[14.5px] text-slate-400 font-medium mt-1">
                {sermons.length > 0
                  ? `총 ${sermons.length}개의 설교 설계가 보관되어 있습니다.`
                  : '설교 준비를 스마트하게 시작해 보세요.'}
              </p>
            </div>
            
            <Link
              href="/"
              className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 text-white font-bold text-[14px] hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <FileText className="w-4.5 h-4.5" />
              새로 만들기
            </Link>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 text-[14px] font-semibold text-rose-600 bg-rose-50/80 backdrop-blur-xl border border-rose-200/40 rounded-2xl px-5 py-4 mb-8">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
              <div className="flex-1">{error}</div>
              <button onClick={loadSermons} className="shrink-0 text-rose-400 hover:text-rose-600 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 설교 리스트 및 비어있는 상태 */}
          {sermons.length === 0 ? (
            <div className="text-center py-20 glass-panel rounded-3xl border border-white/60 shadow-lg shadow-indigo-500/5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/60 flex items-center justify-center mx-auto mb-5 shadow-inner">
                <FileText className="w-8 h-8 text-indigo-500" />
              </div>
              <p className="text-[18px] font-bold text-slate-700 mb-1.5">보관된 설교가 없습니다</p>
              <p className="text-[14px] text-slate-400 mb-6">원고를 업로드하고 첫 번째 AI 분석 콘텐츠를 생성해 보세요!</p>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-[15px] hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-200"
              >
                설교 원고 업로드하기
              </Link>
            </div>
          ) : (
            <div className="space-y-3.5">
              {sermons.map((sermon) => (
                <div
                  key={sermon.id}
                  className="group glass-panel glass-panel-hover rounded-2xl p-4.5 border border-white/70 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/workspace?id=${sermon.id}`}
                      className="flex-1 min-w-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/60 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
                          <FileText className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[15.5px] font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                            {sermon.title || '제목 없음'}
                          </p>
                          <div className="flex items-center gap-2.5 text-[13px] text-slate-400 font-medium mt-1">
                            {sermon.passage && (
                              <>
                                <span className="bg-indigo-50 text-indigo-600/80 px-2 py-0.5 rounded-md text-[11px] font-bold">{sermon.passage}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                              </>
                            )}
                            <Calendar className="w-3.5 h-3.5 text-slate-300" />
                            <span>{new Date(sermon.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                    
                    <div className="flex items-center gap-1.5 shrink-0 ml-3">
                      <button
                        onClick={() => deleteSermon(sermon.id)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50/80 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/workspace?id=${sermon.id}`}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-200"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
