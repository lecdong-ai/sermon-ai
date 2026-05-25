'use client'

import { useMemo } from 'react'
import { SERMONS, THEMES, TAGS, SERIES } from '@/data/sampleSermons'
import type { SermonD } from '@/types/dashboard'
import { ArrowLeft, Calendar, User, BookOpen, Tag, Layers, Edit3, Trash2, GitBranch } from 'lucide-react'

interface SermonDetailViewProps {
  sermonId: string
  onBack: () => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onGraph: () => void
  onNavigate: (id: string) => void
}

export default function SermonDetailView({ sermonId, onBack, onEdit, onDelete, onGraph, onNavigate }: SermonDetailViewProps) {
  const sermon = useMemo(() => SERMONS.find((s) => s.id === sermonId), [sermonId])
  const series = useMemo(() => sermon ? SERIES.find((s) => s.id === sermon.seriesId) : null, [sermon])
  const sermonThemes = useMemo(() => sermon ? THEMES.filter((t) => sermon.themeIds.includes(t.id)) : [], [sermon])
  const sermonTags = useMemo(() => sermon ? TAGS.filter((t) => sermon.tagIds.includes(t.id)) : [], [sermon])
  const relatedSermons = useMemo(() => sermon ? SERMONS.filter((s) => sermon.relatedSermonIds.includes(s.id)) : [], [sermon])

  if (!sermon) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <p>설교를 찾을 수 없습니다</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="px-6 py-3 border-b border-slate-200/40 bg-white/40 backdrop-blur-sm flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-700">{sermon.title}</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => onEdit(sermon.id)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
            <Edit3 className="w-3.5 h-3.5" /> 편집
          </button>
          <button onClick={onGraph} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
            <GitBranch className="w-3.5 h-3.5" /> 그래프
          </button>
          <button onClick={() => { if (confirm('정말 삭제하시겠습니까?')) onDelete(sermon.id) }} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> 삭제
          </button>
        </div>
      </div>

      {/* content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
        {/* metadata */}
        <div className="glass-panel rounded-2xl p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-primary-400" />
              <div>
                <p className="text-xs text-slate-400">날짜</p>
                <p className="text-slate-700 font-medium">{sermon.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-xs text-slate-400">설교자</p>
                <p className="text-slate-700 font-medium">{sermon.preacher}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-xs text-slate-400">본문</p>
                <p className="text-slate-700 font-medium">{sermon.normalizedPassage}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Layers className="w-4 h-4 text-rose-400" />
              <div>
                <p className="text-xs text-slate-400">유형</p>
                <p className="text-slate-700 font-medium">{sermon.sermonType} · {sermon.season}</p>
              </div>
            </div>
          </div>
          {series && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm">
              <Layers className="w-4 h-4 text-red-400" />
              <span className="text-xs text-slate-400">시리즈:</span>
              <span className="text-slate-700 font-medium">{series.name}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                series.status === '진행중' ? 'bg-green-50 text-green-600' : series.status === '완료' ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-blue-600'
              }`}>{series.status}</span>
            </div>
          )}
        </div>

        {/* core message */}
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-xs font-semibold text-primary-500 mb-2">핵심 메시지</h3>
          <p className="text-sm text-slate-700 leading-relaxed">{sermon.coreMessage}</p>
        </div>

        {/* outline */}
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-xs font-semibold text-amber-500 mb-3">설교 개요</h3>
          <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <div>
              <span className="font-medium text-slate-700">도입: </span>{sermon.outlineIntro}
            </div>
            <div>
              <span className="font-medium text-slate-700">① </span>{sermon.outlinePoint1}
            </div>
            <div>
              <span className="font-medium text-slate-700">② </span>{sermon.outlinePoint2}
            </div>
            <div>
              <span className="font-medium text-slate-700">③ </span>{sermon.outlinePoint3}
            </div>
            <div>
              <span className="font-medium text-slate-700">결론: </span>{sermon.outlineConclusion}
            </div>
          </div>
        </div>

        {/* manuscript */}
        {sermon.manuscript && (
          <div className="glass-panel rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-emerald-500 mb-3">설교 원고</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{sermon.manuscript}</p>
          </div>
        )}

        {/* themes & tags */}
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex flex-wrap gap-6">
            <div>
              <h3 className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1"><Tag className="w-3 h-3" /> 주제</h3>
              <div className="flex flex-wrap gap-1.5">
                {sermonThemes.map((t) => (
                  <span key={t.id} className="px-2 py-0.5 text-xs bg-amber-50 text-amber-600 rounded-full">{t.name}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1"><Tag className="w-3 h-3" /> 태그</h3>
              <div className="flex flex-wrap gap-1.5">
                {sermonTags.map((t) => (
                  <span key={t.id} className={`px-2 py-0.5 text-xs rounded-full ${
                    t.type === 'situation' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                  }`}>{t.name}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* related sermons */}
        {relatedSermons.length > 0 && (
          <div className="glass-panel rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-slate-400 mb-3">관련 설교 ({relatedSermons.length})</h3>
            <div className="flex flex-wrap gap-2">
              {relatedSermons.map((rs) => (
                <button
                  key={rs.id}
                  onClick={() => onNavigate(rs.id)}
                  className="px-3 py-1.5 text-xs bg-slate-50 text-slate-600 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors border border-slate-100"
                >
                  {rs.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
