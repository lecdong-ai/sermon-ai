'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getSeriesById, STATUS_LABELS, STATUS_BADGE } from '@/lib/advanced/seriesData'
import { NOTES, NOTE_TYPE_LABELS, NOTE_TYPE_COLORS } from '@/lib/advanced/notesData'
import { X, ChevronLeft, Calendar, Eye, Sparkles, Plus, Loader2, TrendingUp, BookOpen, Link2, Lightbulb, FileText } from 'lucide-react'

interface InsightsData {
  theologicalBalance: {
    distribution: { topic: string; percentage: number }[]
    insight: string
    suggestion: string
  }
  bibleCoverage: {
    focusedPassages: string[]
    gaps: string[]
    insight: string
  }
  sermonFlow: {
    connections: { from: string; to: string; quality: string; reason: string }[]
    overallFlow: string
  }
  nextSermonSuggestion: {
    passage: string
    title: string
    reason: string
  }
  writingPattern: {
    averageWordCount: number
    trend: string
    insight: string
  }
}

export default function SeriesDetailPage() {
  const params = useParams()
  const router = useRouter()
  const series = getSeriesById(params.seriesId as string)
  const [showInsights, setShowInsights] = useState(false)
  const [showOverview, setShowOverview] = useState(false)
  const [selectedSermonId, setSelectedSermonId] = useState<string | null>(null)
  const [insights, setInsights] = useState<InsightsData | null>(null)
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [insightsError, setInsightsError] = useState<string | null>(null)

  const handleGenerateInsights = async () => {
    setShowInsights(true)
    setLoadingInsights(true)
    setInsightsError(null)
    try {
      const res = await fetch(`/api/advanced/series/${params.seriesId}/insights`)
      const data = await res.json()
      if (data.success) {
        setInsights(data.data)
      } else {
        setInsightsError(data.error || '분석 실패')
      }
    } catch (err: any) {
      setInsightsError(err.message || '알 수 없는 오류')
    } finally {
      setLoadingInsights(false)
    }
  }

  if (!series) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 text-sm">
        시리즈를 찾을 수 없습니다
      </div>
    )
  }

  const progress = series.totalSermons > 0 ? Math.round((series.completedSermons / series.totalSermons) * 100) : 0
  const isCompleted = series.completedSermons >= series.totalSermons
  const lastCompletedIdx = series.sermons.reduce((max, s, i) => s.status === 'completed' ? i : max, -1)
  const nextPlannedIdx = series.sermons.findIndex(s => s.status === 'planned')
  const nextSermon = nextPlannedIdx >= 0 ? series.sermons[nextPlannedIdx] : null

  const relatedNotes = NOTES.filter(n => series.relatedNoteIds.includes(n.id))
  const selectedSermon = selectedSermonId ? series.sermons.find(s => s.id === selectedSermonId) : null

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6">
      {/* ==================== HEADER ==================== */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <button onClick={() => router.push('/advanced/series')}
              className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1">
              <ChevronLeft className="w-3 h-3" />
              시리즈 목록
            </button>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">{series.title}</h1>
          <p className="text-sm text-slate-400 mt-1 leading-relaxed">{series.description}</p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {series.themeNames.map(t => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">{t}</span>
            ))}
            {series.season && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/10">{series.season}</span>
            )}
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/10">{series.audience}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <button onClick={() => setShowOverview(true)}
            className="flex items-center gap-1.5 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white text-xs px-3 py-2 rounded-lg transition-colors">
            <Eye className="w-3.5 h-3.5" />
            시리즈 개요
          </button>
          <button onClick={() => handleGenerateInsights()}
            className="flex items-center gap-1.5 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white text-xs px-3 py-2 rounded-lg transition-colors">
            <Sparkles className="w-3.5 h-3.5" />
            AI 인사이트
          </button>
          <button
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-3.5 h-3.5" />
            설교 추가
          </button>
        </div>
      </div>

      {/* ==================== PROGRESS SUMMARY ==================== */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#0a0e1a] rounded-xl border border-white/5 p-4">
          <div className="text-[11px] text-slate-500 mb-1">진행률</div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${isCompleted ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${progress}%` }} />
            </div>
            <span className="text-lg font-bold text-white">{progress}%</span>
          </div>
        </div>
        <div className="bg-[#0a0e1a] rounded-xl border border-white/5 p-4">
          <div className="text-[11px] text-slate-500 mb-1">완료</div>
          <span className="text-lg font-bold text-white">{series.completedSermons}/{series.totalSermons}</span>
          <span className="ml-2 text-[11px] text-slate-500">편</span>
        </div>
        <div className="bg-[#0a0e1a] rounded-xl border border-white/5 p-4">
          <div className="text-[11px] text-slate-500 mb-1">예정</div>
          <span className="text-lg font-bold text-white">{series.sermons.filter(s => s.status === 'planned').length}</span>
          <span className="ml-2 text-[11px] text-slate-500">편</span>
        </div>
        <div className="bg-[#0a0e1a] rounded-xl border border-white/5 p-4">
          <div className="text-[11px] text-slate-500 mb-1">진행중</div>
          <span className="text-lg font-bold text-white">{series.sermons.filter(s => s.status === 'writing' || s.status === 'prepare' || s.status === 'research').length}</span>
          <span className="ml-2 text-[11px] text-slate-500">편</span>
        </div>
      </div>

      {/* ==================== ROADMAP ==================== */}
      <div className="bg-[#0a0e1a] rounded-xl border border-white/5 p-5">
        <h2 className="text-sm font-bold text-white mb-4">설교 로드맵</h2>
        <div className="relative">
          <div className="absolute top-6 left-8 right-8 h-0.5 bg-white/5" />
          {lastCompletedIdx >= 0 && (
            <div className="absolute top-6 left-8 h-0.5 bg-emerald-500/40 transition-all"
              style={{ width: `${((lastCompletedIdx) / (series.sermons.length - 1 || 1)) * 100}%`, maxWidth: 'calc(100% - 64px)' }} />
          )}

          <div className="flex items-start justify-between relative">
            {series.sermons.map((sermon, idx) => {
              const isPast = idx <= lastCompletedIdx
              const isCurrent = idx === lastCompletedIdx + 1 && sermon.status !== 'planned'
              const isPlanned = sermon.status === 'planned'
              const isLastCompleted = idx === lastCompletedIdx

              return (
                <button key={sermon.id} onClick={() => setSelectedSermonId(sermon.id)}
                  className="flex flex-col items-center gap-2 group relative z-10 flex-1 min-w-0 px-1">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 shrink-0 transition-all
                    ${isPast ? 'bg-emerald-500 border-emerald-500' :
                      isCurrent ? 'bg-amber-500 border-amber-500 ring-2 ring-amber-500/20' :
                      isPlanned ? 'bg-[#0a0e1a] border-white/20 group-hover:border-white/40' :
                      'bg-amber-500/20 border-amber-500'}`}>
                    {isPast && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="text-center min-w-0">
                    <div className={`text-[10px] font-medium truncate max-w-[80px]
                      ${isPast ? 'text-slate-400' : isCurrent ? 'text-amber-400' : 'text-slate-600'}`}>
                      {sermon.title}
                    </div>
                    <div className="text-[8px] text-slate-600 mt-0.5">{sermon.passage}</div>
                  </div>
                  {isLastCompleted && <span className="text-[7px] px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">최신</span>}
                  {isPlanned && <span className="text-[7px] px-1 py-0.5 rounded bg-white/5 text-slate-500 border border-white/10">예정</span>}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ==================== SELECTED SERMON DETAIL ==================== */}
      {selectedSermon && (
        <div className="bg-[#0a0e1a] rounded-xl border border-white/5 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                ${selectedSermon.status === 'completed' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                  selectedSermon.status === 'writing' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                  selectedSermon.status === 'planned' ? 'bg-white/5 text-slate-500 border border-white/10' :
                  'bg-amber-500/10 text-amber-300 border border-amber-500/20'}`}>
                {selectedSermon.order}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{selectedSermon.title}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-slate-400 font-medium">{selectedSermon.passage}</span>
                  <span className="text-[9px] text-slate-700">·</span>
                  <span className="text-[10px] text-slate-500">{selectedSermon.sermonDate}</span>
                  <span className="text-[9px] text-slate-700">·</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${STATUS_BADGE[selectedSermon.status] || 'bg-white/5 text-slate-500 border border-white/10'}`}>
                    {STATUS_LABELS[selectedSermon.status] || selectedSermon.status}
                  </span>
                  {selectedSermon.wordCount > 0 && (
                    <>
                      <span className="text-[9px] text-slate-700">·</span>
                      <span className="text-[10px] text-slate-500">{selectedSermon.wordCount.toLocaleString()}자</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {selectedSermon.status !== 'planned' ? (
                <button onClick={() => router.push(`/advanced/projects/${selectedSermon.id}`)}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium px-3 py-1.5 rounded-md hover:bg-indigo-500/10 transition-colors">
                  설교 열기 →
                </button>
              ) : (
                <button
                  className="text-[10px] text-slate-500 hover:text-indigo-400 font-medium px-3 py-1.5 rounded-md hover:bg-indigo-500/10 transition-colors border border-dashed border-white/10">
                  + 새 프로젝트
                </button>
              )}
              <button onClick={() => setSelectedSermonId(null)}
                className="text-slate-500 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          {selectedSermon.coreMessage && (
            <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-lg p-3 mt-2">
              <div className="text-[10px] font-medium text-indigo-300 mb-1">핵심 메시지</div>
              <p className="text-xs text-indigo-200/80 leading-relaxed">{selectedSermon.coreMessage}</p>
            </div>
          )}
        </div>
      )}

      {/* ==================== OVERVIEW MODAL ==================== */}
      {showOverview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-8" onClick={() => setShowOverview(false)}>
          <div className="bg-[#0a0e1a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h3 className="text-sm font-bold text-white">시리즈 개요</h3>
              <button onClick={() => setShowOverview(false)} className="text-slate-500 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                  <span className="text-[11px] font-bold text-white">시리즈 목적</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pl-4">{series.purpose}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  <span className="text-[11px] font-bold text-white">대상 청중</span>
                </div>
                <div className="pl-4">
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/10">{series.audience}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-[11px] font-bold text-white">기대되는 열매</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pl-4">{series.expectedFruit}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                  <span className="text-[11px] font-bold text-white">목회적 노트</span>
                </div>
                <div className="bg-rose-500/5 border border-rose-500/10 rounded-lg p-3 pl-4">
                  <p className="text-xs text-rose-200/70 leading-relaxed">{series.pastoralNote}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                  <span className="text-[11px] font-bold text-white">주요 주제 분포</span>
                </div>
                <div className="space-y-1.5 pl-4">
                  {series.keyTopics.map(kt => (
                    <div key={kt.topic} className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-14 shrink-0">{kt.topic}</span>
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full"
                          style={{ width: `${(kt.count / Math.max(...series.keyTopics.map(x => x.count))) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-500 w-4 text-right">{kt.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-3 border-t border-white/5">
                <span>시작: {series.createdAt.slice(0, 10)}</span>
                <span>최종 수정: {series.updatedAt.slice(0, 10)}</span>
                <span>{series.totalSermons}편 · {series.season}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SERMON LIST ==================== */}
      <div>
        <h2 className="text-sm font-bold text-white mb-3">설교 목록</h2>
        <div className="space-y-2">
          {series.sermons.map((sermon, idx) => {
            const isLastCompleted = idx === lastCompletedIdx
            const isNext = idx === nextPlannedIdx

            return (
              <button key={sermon.id} onClick={() => setSelectedSermonId(sermon.id)}
                className={`w-full text-left bg-[#0a0e1a] rounded-xl border overflow-hidden transition-all hover:border-indigo-500/20 ${
                  sermon.status === 'planned' ? 'border-dashed border-white/10 opacity-70 hover:opacity-100' : 'border-white/5'
                } ${selectedSermonId === sermon.id ? 'ring-2 ring-indigo-500/30' : ''}`}>
                <div className="flex items-center p-4 gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    sermon.status === 'completed' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                    sermon.status === 'writing' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                    sermon.status === 'planned' ? 'bg-white/5 text-slate-500 border border-white/10' :
                    'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                  }`}>
                    {sermon.order}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-white">{sermon.title}</h3>
                      {isLastCompleted && <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">마지막 설교</span>}
                      {isNext && <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">다음 설교</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-400 font-medium">{sermon.passage}</span>
                      <span className="text-[9px] text-slate-700">·</span>
                      <span className="text-[10px] text-slate-500">{sermon.sermonDate}</span>
                      <span className="text-[9px] text-slate-700">·</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${STATUS_BADGE[sermon.status] || 'bg-white/5 text-slate-500 border border-white/10'}`}>
                        {STATUS_LABELS[sermon.status] || sermon.status}
                      </span>
                    </div>
                    {sermon.status !== 'planned' && (
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{sermon.coreMessage}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {sermon.wordCount > 0 && (
                      <span className="text-[10px] text-slate-500">{sermon.wordCount.toLocaleString()}자</span>
                    )}
                    {sermon.status !== 'planned' ? (
                      <span onClick={e => { e.stopPropagation(); router.push(`/advanced/projects/${sermon.id}`) }}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium px-3 py-1.5 rounded-md hover:bg-indigo-500/10 transition-colors">
                        열기 →
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 hover:text-indigo-400 font-medium px-3 py-1.5 rounded-md hover:bg-indigo-500/10 transition-colors border border-dashed border-white/10">
                        + 새 프로젝트
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ==================== RELATED NOTES ==================== */}
      {relatedNotes.length > 0 && (
        <div className="bg-[#0a0e1a] rounded-xl border border-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white">연결된 노트 · 인사이트</h2>
            <span className="text-[10px] text-slate-500">{relatedNotes.length}개</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {relatedNotes.map(note => (
              <div key={note.id}
                className="border border-white/5 rounded-lg p-3 hover:border-indigo-500/20 transition-colors cursor-pointer"
                onClick={() => router.push(`/advanced/notes`)}>
                <div className="flex items-start gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${NOTE_TYPE_COLORS[note.type]?.split(' ')[0] || 'bg-slate-500'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium text-white line-clamp-1">{note.title}</span>
                      <span className={`text-[8px] px-1 py-0.5 rounded shrink-0 ${NOTE_TYPE_COLORS[note.type] || 'bg-white/5 text-slate-500 border border-white/10'}`}>
                        {NOTE_TYPE_LABELS[note.type] || note.type}
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{note.summary}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[8px] text-slate-600">
                      <span>{note.referenceCount}회 참조</span>
                      {note.starred && <span className="text-amber-400">★</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== NEXT SERMON PLANNER ==================== */}
      {nextSermon && (
        <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Calendar className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-300">다음 설교 준비</h3>
              <p className="text-xs text-amber-200/70 mt-1 leading-relaxed">
                <strong>{nextSermon.title}</strong> ({nextSermon.passage})이{' '}
                {nextSermon.sermonDate}로 예정되어 있습니다.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button className="bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-medium px-4 py-2 rounded-lg transition-colors">
                  새 프로젝트 시작
                </button>
                <button className="text-[11px] text-amber-300 hover:text-amber-200 underline">
                  본문 연구하기 →
                </button>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-[10px] text-amber-300 font-medium">{nextSermon.passage}</div>
              <div className="text-[9px] text-amber-400/60 mt-1">{nextSermon.sermonDate}</div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== KEY TOPICS ==================== */}
      <div className="bg-[#0a0e1a] rounded-xl border border-white/5 p-5">
        <h2 className="text-sm font-bold text-white mb-3">주요 주제 분포</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {series.keyTopics.map(kt => {
            const maxCount = Math.max(...series.keyTopics.map(x => x.count))
            const pct = Math.round((kt.count / maxCount) * 100)
            return (
              <div key={kt.topic} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-16 shrink-0">{kt.topic}</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[10px] text-slate-500 w-4 text-right">{kt.count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ==================== INSIGHTS MODAL ==================== */}
      {showInsights && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-8" onClick={() => setShowInsights(false)}>
          <div className="bg-[#0a0e1a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">AI 시리즈 인사이트</h3>
              </div>
              <button onClick={() => setShowInsights(false)} className="text-slate-500 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingInsights ? (
              <div className="p-12 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
                <p className="text-[12px] text-slate-400 font-medium">AI가 시리즈를 분석 중입니다...</p>
                <p className="text-[10px] text-slate-600 mt-1">약 10-15초 소요됩니다</p>
              </div>
            ) : insightsError ? (
              <div className="p-6">
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-[12px] text-red-400 font-medium">{insightsError}</p>
                  <button onClick={handleGenerateInsights} className="mt-3 text-[11px] text-red-300 hover:text-red-200 underline">다시 시도</button>
                </div>
              </div>
            ) : insights ? (
              <div className="p-6 space-y-5">
                {/* Theological Balance */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[11px] font-bold text-white">신학적 균형</span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {insights.theologicalBalance.distribution.map(d => (
                        <span key={d.topic} className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {d.topic} {d.percentage}%
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400">{insights.theologicalBalance.insight}</p>
                    <p className="text-[11px] text-amber-300/80">💡 {insights.theologicalBalance.suggestion}</p>
                  </div>
                </div>

                {/* Bible Coverage */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] font-bold text-white">성경 커버리지</span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] text-slate-500 shrink-0 mt-0.5">집중:</span>
                      <div className="flex flex-wrap gap-1">
                        {insights.bibleCoverage.focusedPassages.map(p => (
                          <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300">{p}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] text-slate-500 shrink-0 mt-0.5">공백:</span>
                      <div className="flex flex-wrap gap-1">
                        {insights.bibleCoverage.gaps.map(g => (
                          <span key={g} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300">{g}</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400">{insights.bibleCoverage.insight}</p>
                  </div>
                </div>

                {/* Sermon Flow */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Link2 className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[11px] font-bold text-white">설교 간 연결</span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-2">
                    {insights.sermonFlow.connections.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px]">
                        <span className="text-slate-300">{c.from}</span>
                        <span className="text-slate-600">→</span>
                        <span className="text-slate-300">{c.to}</span>
                        <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded ${
                          c.quality === 'strong' ? 'bg-emerald-500/10 text-emerald-300' :
                          c.quality === 'natural' ? 'bg-blue-500/10 text-blue-300' :
                          'bg-amber-500/10 text-amber-300'
                        }`}>{c.quality === 'strong' ? '강함' : c.quality === 'natural' ? '자연스러움' : '약함'}</span>
                      </div>
                    ))}
                    <p className="text-[11px] text-slate-400 pt-1 border-t border-white/5">{insights.sermonFlow.overallFlow}</p>
                  </div>
                </div>

                {/* Next Sermon Suggestion */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] font-bold text-white">다음 설교 제안</span>
                  </div>
                  <div className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[12px] font-bold text-amber-300">{insights.nextSermonSuggestion.passage}</span>
                      <span className="text-[11px] text-amber-200/70">— {insights.nextSermonSuggestion.title}</span>
                    </div>
                    <p className="text-[11px] text-amber-200/60">{insights.nextSermonSuggestion.reason}</p>
                  </div>
                </div>

                {/* Writing Pattern */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-[11px] font-bold text-white">원고 패턴</span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                    <div className="flex items-center gap-4 mb-2">
                      <div>
                        <div className="text-lg font-bold text-white">{insights.writingPattern.averageWordCount.toLocaleString()}</div>
                        <div className="text-[9px] text-slate-500">평균 글자수</div>
                      </div>
                      <div>
                        <div className={`text-lg font-bold ${
                          insights.writingPattern.trend === 'increasing' ? 'text-emerald-400' :
                          insights.writingPattern.trend === 'decreasing' ? 'text-amber-400' : 'text-blue-400'
                        }`}>
                          {insights.writingPattern.trend === 'increasing' ? '↗ 증가' :
                           insights.writingPattern.trend === 'decreasing' ? '↘ 감소' : '→ 안정'}
                        </div>
                        <div className="text-[9px] text-slate-500">추세</div>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400">{insights.writingPattern.insight}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
