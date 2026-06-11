'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getSeriesById, STATUS_LABELS, STATUS_BADGE } from '@/lib/advanced/seriesData'
import { NOTES, NOTE_TYPE_LABELS, NOTE_TYPE_COLORS } from '@/lib/advanced/notesData'

export default function SeriesDetailPage() {
  const params = useParams()
  const router = useRouter()
  const series = getSeriesById(params.seriesId as string)
  const [showGraph, setShowGraph] = useState(false)
  const [showOverview, setShowOverview] = useState(false)
  const [selectedSermonId, setSelectedSermonId] = useState<string | null>(null)

  if (!series) {
    return (
      <div className="flex items-center justify-center h-full text-paper-400 text-sm">
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
              className="text-[11px] text-paper-400 hover:text-paper-600 transition-colors">
              ← 시리즈 목록
            </button>
          </div>
          <h1 className="text-xl font-bold text-paper-800 font-serif mt-1">{series.title}</h1>
          <p className="text-sm text-paper-500 mt-1 leading-relaxed">{series.description}</p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {series.themeNames.map(t => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">{t}</span>
            ))}
            {series.season && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-paper-100 text-paper-500">{series.season}</span>
            )}
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-navy-100 text-navy-700">{series.audience}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <button onClick={() => setShowOverview(true)}
            className="border border-paper-200 hover:border-paper-400 text-paper-600 text-xs px-3 py-2 rounded-lg transition-colors">
            시리즈 개요
          </button>
          <button onClick={() => setShowGraph(!showGraph)}
            className="border border-paper-200 hover:border-paper-400 text-paper-600 text-xs px-3 py-2 rounded-lg transition-colors">
            그래프 보기
          </button>
          <button
            className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors">
            + 설교 추가
          </button>
        </div>
      </div>

      {/* ==================== PROGRESS SUMMARY ==================== */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-paper-200 p-4">
          <div className="text-[11px] text-paper-500 mb-1">진행률</div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-paper-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${isCompleted ? 'bg-green-400' : 'bg-amber-400'}`}
                style={{ width: `${progress}%` }} />
            </div>
            <span className="text-lg font-bold text-paper-800">{progress}%</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-paper-200 p-4">
          <div className="text-[11px] text-paper-500 mb-1">완료</div>
          <span className="text-lg font-bold text-paper-800">{series.completedSermons}/{series.totalSermons}</span>
          <span className="ml-2 text-[11px] text-paper-500">편</span>
        </div>
        <div className="bg-white rounded-xl border border-paper-200 p-4">
          <div className="text-[11px] text-paper-500 mb-1">예정</div>
          <span className="text-lg font-bold text-paper-800">{series.sermons.filter(s => s.status === 'planned').length}</span>
          <span className="ml-2 text-[11px] text-paper-500">편</span>
        </div>
        <div className="bg-white rounded-xl border border-paper-200 p-4">
          <div className="text-[11px] text-paper-500 mb-1">진행중</div>
          <span className="text-lg font-bold text-paper-800">{series.sermons.filter(s => s.status === 'writing' || s.status === 'prepare' || s.status === 'research').length}</span>
          <span className="ml-2 text-[11px] text-paper-500">편</span>
        </div>
      </div>

      {/* ==================== ROADMAP ==================== */}
      <div className="bg-white rounded-xl border border-paper-200 p-5">
        <h2 className="text-sm font-bold text-paper-800 font-serif mb-4">설교 로드맵</h2>
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-6 left-8 right-8 h-0.5 bg-paper-200" />
          {/* Completed line overlay */}
          {lastCompletedIdx >= 0 && (
            <div className="absolute top-6 left-8 h-0.5 bg-green-400 transition-all"
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
                  {/* Node */}
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 shrink-0 transition-all
                    ${isPast ? 'bg-green-400 border-green-400' :
                      isCurrent ? 'bg-amber-400 border-amber-400 ring-2 ring-amber-200' :
                      isPlanned ? 'bg-white border-paper-300 group-hover:border-paper-400' :
                      'bg-amber-100 border-amber-400'}`}>
                    {isPast && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  {/* Label */}
                  <div className="text-center min-w-0">
                    <div className={`text-[10px] font-medium truncate max-w-[80px]
                      ${isPast ? 'text-paper-600' : isCurrent ? 'text-amber-700' : 'text-paper-400'}`}>
                      {sermon.title}
                    </div>
                    <div className="text-[8px] text-paper-400 mt-0.5">{sermon.passage}</div>
                  </div>
                  {/* Badge */}
                  {isLastCompleted && <span className="text-[7px] px-1 py-0.5 rounded bg-green-100 text-green-700">최신</span>}
                  {isPlanned && <span className="text-[7px] px-1 py-0.5 rounded bg-paper-100 text-paper-400">예정</span>}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ==================== SELECTED SERMON DETAIL ==================== */}
      {selectedSermon && (
        <div className="bg-white rounded-xl border border-paper-200 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                ${selectedSermon.status === 'completed' ? 'bg-green-100 text-green-700' :
                  selectedSermon.status === 'writing' ? 'bg-amber-100 text-amber-700' :
                  selectedSermon.status === 'planned' ? 'bg-paper-100 text-paper-400' :
                  'bg-amber-100 text-amber-700'}`}>
                {selectedSermon.order}
              </div>
              <div>
                <h3 className="text-sm font-bold text-paper-800 font-serif">{selectedSermon.title}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-paper-600 font-medium">{selectedSermon.passage}</span>
                  <span className="text-[9px] text-paper-300">·</span>
                  <span className="text-[10px] text-paper-400">{selectedSermon.sermonDate}</span>
                  <span className="text-[9px] text-paper-300">·</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${STATUS_BADGE[selectedSermon.status] || 'bg-paper-100 text-paper-500'}`}>
                    {STATUS_LABELS[selectedSermon.status] || selectedSermon.status}
                  </span>
                  {selectedSermon.wordCount > 0 && (
                    <>
                      <span className="text-[9px] text-paper-300">·</span>
                      <span className="text-[10px] text-paper-400">{selectedSermon.wordCount.toLocaleString()}자</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {selectedSermon.status !== 'planned' ? (
                <button onClick={() => router.push(`/advanced/projects/${selectedSermon.id}`)}
                  className="text-[10px] text-green-600 hover:text-green-700 font-medium px-3 py-1.5 rounded-md hover:bg-green-50 transition-colors">
                  설교 열기 →
                </button>
              ) : (
                <button
                  className="text-[10px] text-paper-500 hover:text-green-600 font-medium px-3 py-1.5 rounded-md hover:bg-green-50 transition-colors border border-dashed border-paper-300">
                  + 새 프로젝트
                </button>
              )}
              <button onClick={() => setSelectedSermonId(null)}
                className="text-paper-400 hover:text-paper-600 p-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          {/* Core message */}
          {selectedSermon.coreMessage && (
            <div className="bg-green-50 border border-green-100 rounded-lg p-3 mt-2">
              <div className="text-[10px] font-medium text-green-700 mb-1">핵심 메시지</div>
              <p className="text-xs text-green-800 leading-relaxed">{selectedSermon.coreMessage}</p>
            </div>
          )}
        </div>
      )}

      {/* ==================== OVERVIEW MODAL ==================== */}
      {showOverview && (
        <div className="fixed inset-0 z-50 bg-paper-800/40 flex items-center justify-center p-8" onClick={() => setShowOverview(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-paper-800 font-serif">시리즈 개요</h3>
              <button onClick={() => setShowOverview(false)} className="text-paper-400 hover:text-paper-600 p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-5">
              {/* Purpose */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  <span className="text-[11px] font-bold text-paper-800">시리즈 목적</span>
                </div>
                <p className="text-xs text-paper-600 leading-relaxed pl-4">{series.purpose}</p>
              </div>

              {/* Audience */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-navy-500 shrink-0" />
                  <span className="text-[11px] font-bold text-paper-800">대상 청중</span>
                </div>
                <div className="pl-4">
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-navy-100 text-navy-700">{series.audience}</span>
                </div>
              </div>

              {/* Expected Fruit */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-[11px] font-bold text-paper-800">기대되는 열매</span>
                </div>
                <p className="text-xs text-paper-600 leading-relaxed pl-4">{series.expectedFruit}</p>
              </div>

              {/* Pastoral Note */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span className="text-[11px] font-bold text-paper-800">목회적 노트</span>
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 pl-4">
                  <p className="text-xs text-rose-800 leading-relaxed">{series.pastoralNote}</p>
                </div>
              </div>

              {/* Key Topics */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                  <span className="text-[11px] font-bold text-paper-800">주요 주제 분포</span>
                </div>
                <div className="space-y-1.5 pl-4">
                  {series.keyTopics.map(kt => (
                    <div key={kt.topic} className="flex items-center gap-2">
                      <span className="text-xs text-paper-600 w-14 shrink-0">{kt.topic}</span>
                      <div className="flex-1 h-1.5 bg-paper-100 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-400 rounded-full"
                          style={{ width: `${(kt.count / Math.max(...series.keyTopics.map(x => x.count))) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-paper-400 w-4 text-right">{kt.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className="flex items-center gap-4 text-[10px] text-paper-400 pt-3 border-t border-paper-100">
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
        <h2 className="text-sm font-bold text-paper-800 font-serif mb-3">설교 목록</h2>
        <div className="space-y-2">
          {series.sermons.map((sermon, idx) => {
            const isLastCompleted = idx === lastCompletedIdx
            const isNext = idx === nextPlannedIdx

            return (
              <button key={sermon.id} onClick={() => setSelectedSermonId(sermon.id)}
                className={`w-full text-left bg-white rounded-xl border overflow-hidden transition-all hover:shadow-sm ${
                  sermon.status === 'planned' ? 'border-dashed border-paper-300 opacity-70 hover:opacity-100' : 'border-paper-200'
                } ${selectedSermonId === sermon.id ? 'ring-2 ring-green-300' : ''}`}>
                <div className="flex items-center p-4 gap-4">
                  {/* Order */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    sermon.status === 'completed' ? 'bg-green-100 text-green-700' :
                    sermon.status === 'writing' ? 'bg-amber-100 text-amber-700' :
                    sermon.status === 'planned' ? 'bg-paper-100 text-paper-400' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {sermon.order}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-paper-800">{sermon.title}</h3>
                      {isLastCompleted && <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-100 text-green-700">마지막 설교</span>}
                      {isNext && <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-700">다음 설교</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-paper-600 font-medium">{sermon.passage}</span>
                      <span className="text-[9px] text-paper-300">·</span>
                      <span className="text-[10px] text-paper-400">{sermon.sermonDate}</span>
                      <span className="text-[9px] text-paper-300">·</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${STATUS_BADGE[sermon.status] || 'bg-paper-100 text-paper-500'}`}>
                        {STATUS_LABELS[sermon.status] || sermon.status}
                      </span>
                    </div>
                    {sermon.status !== 'planned' && (
                      <p className="text-[10px] text-paper-500 mt-1 line-clamp-1">{sermon.coreMessage}</p>
                    )}
                  </div>

                  {/* Word count + action */}
                  <div className="flex items-center gap-3 shrink-0">
                    {sermon.wordCount > 0 && (
                      <span className="text-[10px] text-paper-400">{sermon.wordCount.toLocaleString()}자</span>
                    )}
                    {sermon.status !== 'planned' ? (
                      <span onClick={e => { e.stopPropagation(); router.push(`/advanced/projects/${sermon.id}`) }}
                        className="text-[10px] text-green-600 hover:text-green-700 font-medium px-3 py-1.5 rounded-md hover:bg-green-50 transition-colors">
                        열기 →
                      </span>
                    ) : (
                      <span className="text-[10px] text-paper-500 hover:text-green-600 font-medium px-3 py-1.5 rounded-md hover:bg-green-50 transition-colors border border-dashed border-paper-300">
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

      {/* ==================== RELATED NOTES PANEL ==================== */}
      {relatedNotes.length > 0 && (
        <div className="bg-white rounded-xl border border-paper-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-paper-800 font-serif">연결된 노트 · 인사이트</h2>
            <span className="text-[10px] text-paper-400">{relatedNotes.length}개</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {relatedNotes.map(note => (
              <div key={note.id}
                className="border border-paper-200 rounded-lg p-3 hover:border-green-200 transition-colors cursor-pointer"
                onClick={() => router.push(`/advanced/notes`)}>
                <div className="flex items-start gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${NOTE_TYPE_COLORS[note.type]?.split(' ')[0] || 'bg-paper-400'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium text-paper-800 line-clamp-1">{note.title}</span>
                      <span className={`text-[8px] px-1 py-0.5 rounded shrink-0 ${NOTE_TYPE_COLORS[note.type] || 'bg-paper-100 text-paper-500'}`}>
                        {NOTE_TYPE_LABELS[note.type] || note.type}
                      </span>
                    </div>
                    <p className="text-[9px] text-paper-500 mt-1 line-clamp-2 leading-relaxed">{note.summary}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[8px] text-paper-400">
                      <span>{note.referenceCount}회 참조</span>
                      {note.starred && <span className="text-amber-500">★</span>}
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
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-800 font-serif">다음 설교 준비</h3>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                <strong>{nextSermon.title}</strong> ({nextSermon.passage})이{' '}
                {nextSermon.sermonDate}로 예정되어 있습니다. 아래에서 준비를 시작하세요.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-medium px-4 py-2 rounded-lg transition-colors">
                  새 프로젝트 시작
                </button>
                <button
                  className="border border-amber-300 hover:border-amber-400 text-amber-700 text-[11px] px-4 py-2 rounded-lg transition-colors">
                  메모 추가
                </button>
                <button
                  className="text-[11px] text-amber-600 hover:text-amber-700 underline">
                  본문 연구하기 →
                </button>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-[10px] text-amber-600 font-medium">{nextSermon.passage}</div>
              <div className="text-[9px] text-amber-500 mt-1">{nextSermon.sermonDate}</div>
            </div>
          </div>

          {/* Quick resources */}
          <div className="mt-4 pt-3 border-t border-amber-200">
            <div className="text-[10px] font-medium text-amber-700 mb-2">관련 자료</div>
            <div className="flex flex-wrap gap-2">
              {series.keyTopics.slice(0, 3).map(kt => (
                <span key={kt.topic}
                  className="text-[9px] px-2 py-1 rounded-full bg-white border border-amber-200 text-amber-700">
                  {kt.topic} 관련 노트 {kt.count}개
                </span>
              ))}
              <span className="text-[9px] px-2 py-1 rounded-full bg-white border border-amber-200 text-amber-700">
                {series.relatedNoteIds.length}개 연결 노트
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ==================== KEY TOPICS ==================== */}
      <div className="bg-white rounded-xl border border-paper-200 p-5">
        <h2 className="text-sm font-bold text-paper-800 font-serif mb-3">주요 주제 분포</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {series.keyTopics.map(kt => {
            const maxCount = Math.max(...series.keyTopics.map(x => x.count))
            const pct = Math.round((kt.count / maxCount) * 100)
            return (
              <div key={kt.topic} className="flex items-center gap-3">
                <span className="text-xs text-paper-600 w-16 shrink-0">{kt.topic}</span>
                <div className="flex-1 h-2 bg-paper-100 rounded-full overflow-hidden">
                  <div className="h-full bg-navy-400 rounded-full"
                    style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[10px] text-paper-400 w-4 text-right">{kt.count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ==================== GRAPH MODAL ==================== */}
      {showGraph && (
        <div className="fixed inset-0 z-50 bg-paper-800/40 flex items-center justify-center p-8" onClick={() => setShowGraph(false)}>
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-paper-800 font-serif">{series.title} 그래프</h3>
              <button onClick={() => setShowGraph(false)} className="text-paper-400 hover:text-paper-600 p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <svg viewBox="0 0 600 300" className="w-full h-auto">
              {series.sermons.map((s, i) => {
                if (i === 0) return null
                const x1 = 80 + (i - 1) * 60
                const y1 = 150
                const x2 = 80 + i * 60
                const y2 = i % 2 === 0 ? 80 : 170
                return (
                  <line key={`line-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={s.status === 'completed' ? '#10B981' : s.status === 'planned' ? '#D1D5DB' : '#F59E0B'}
                    strokeWidth={2} strokeDasharray={s.status === 'planned' ? '4,4' : 'none'} />
                )
              })}
              {series.themeNames.map((t, i) => {
                const angle = (2 * Math.PI * i) / series.themeNames.length - Math.PI / 2
                const x = 500 + 40 * Math.cos(angle)
                const y = 60 + 40 * Math.sin(angle)
                return (
                  <g key={t}>
                    <circle cx={x} cy={y} r={12} fill="#4A5B82" opacity={0.7} />
                    <text x={x} y={y + 3} textAnchor="middle" fill="white" fontSize={7}>{t.slice(0, 2)}</text>
                  </g>
                )
              })}
              {series.sermons.map((s, i) => {
                const idx = i % series.themeNames.length
                const angle = (2 * Math.PI * idx) / series.themeNames.length - Math.PI / 2
                return (
                  <line key={`conn-${i}`} x1={80 + i * 60} y1={s.status === 'planned' ? 180 : 100}
                    x2={500 + 40 * Math.cos(angle)} y2={60 + 40 * Math.sin(angle)}
                    stroke="#4A5B82" strokeWidth={0.5} opacity={0.3} />
                )
              })}
              {series.sermons.map((s, i) => (
                <g key={s.id}>
                  <circle cx={80 + i * 60} cy={s.status === 'planned' ? 180 : 100} r={16}
                    fill={s.status === 'completed' ? '#10B981' : s.status === 'planned' ? '#D1D5DB' : '#F59E0B'}
                    opacity={s.status === 'planned' ? 0.5 : 1} />
                  <text x={80 + i * 60} y={s.status === 'planned' ? 185 : 105}
                    textAnchor="middle" fill="#6B7280" fontSize={8}>{s.order}</text>
                </g>
              ))}
              <text x={300} y={270} textAnchor="middle" fill="#374151" fontSize={11} fontWeight={600}
                style={{ fontFamily: 'var(--font-noto-serif-kr), serif' }}>
                {series.title} · {series.completedSermons}/{series.totalSermons}
              </text>
            </svg>
            <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-paper-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> 완료</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> 진행중</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-paper-400 inline-block" /> 예정</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-slateblue-400 inline-block" /> 주제</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
