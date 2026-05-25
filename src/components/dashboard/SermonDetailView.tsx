'use client'

import { useMemo } from 'react'
import { SERMONS, THEMES, TAGS, SERIES } from '@/data/sampleSermons'
import type { SermonD } from '@/types/dashboard'
import { ArrowLeft, Calendar, User, BookOpen, Tag, Layers, Edit3, Trash2, GitBranch, Quote, FileText, Clock, MessageSquare } from 'lucide-react'

interface SermonDetailViewProps {
  sermonId: string
  onBack: () => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onGraph: () => void
  onNavigate: (id: string) => void
}

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  '진행중': { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: '#10b981' },
  '완료': { bg: 'bg-slate-100', text: 'text-slate-500', dot: '#94a3b8' },
  '예정': { bg: 'bg-indigo-50', text: 'text-indigo-600', dot: '#6366f1' },
}

export default function SermonDetailView({ sermonId, onBack, onEdit, onDelete, onGraph, onNavigate }: SermonDetailViewProps) {
  const sermon = useMemo(() => SERMONS.find((s) => s.id === sermonId), [sermonId])
  const series = useMemo(() => (sermon ? SERIES.find((s) => s.id === sermon.seriesId) : null), [sermon])
  const sermonThemes = useMemo(() => (sermon ? THEMES.filter((t) => sermon.themeIds.includes(t.id)) : []), [sermon])
  const sermonTags = useMemo(() => (sermon ? TAGS.filter((t) => sermon.tagIds.includes(t.id)) : []), [sermon])
  const relatedSermons = useMemo(() => (sermon ? SERMONS.filter((s) => sermon.relatedSermonIds.includes(s.id)) : []), [sermon])

  if (!sermon) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">설교를 찾을 수 없습니다</p>
        </div>
      </div>
    )
  }

  const MetaItem = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
    <div className="flex items-center gap-2.5 text-sm">
      <div className="w-8 h-8 rounded-lg bg-indigo-50/50 flex items-center justify-center">
        <Icon className="w-4 h-4 text-indigo-400" />
      </div>
      <div>
        <p className="text-[11px] font-medium tracking-wide uppercase text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-700">{value}</p>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="px-6 py-3 border-b border-slate-200/30 bg-white/50 backdrop-blur-sm flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-slate-800 truncate">{sermon.title}</h1>
          <p className="text-xs text-slate-400">{sermon.normalizedPassage} · {sermon.date}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => onEdit(sermon.id)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
            <Edit3 className="w-3.5 h-3.5" /> 편집
          </button>
          <button onClick={onGraph} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
            <GitBranch className="w-3.5 h-3.5" /> 그래프
          </button>
          <button
            onClick={() => { if (confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) onDelete(sermon.id) }}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> 삭제
          </button>
        </div>
      </div>

      {/* content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4" style={{ maxHeight: 'calc(100vh - 11rem)' }}>
        {/* metadata */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <MetaItem icon={Calendar} label="날짜" value={sermon.date} />
            <MetaItem icon={User} label="설교자" value={sermon.preacher} />
            <MetaItem icon={BookOpen} label="본문" value={sermon.normalizedPassage} />
            <MetaItem icon={Layers} label="유형" value={`${sermon.sermonType} · ${sermon.season}`} />
          </div>
          {series && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3 text-sm">
              <BookOpen className="w-4 h-4 text-rose-400" />
              <span className="text-xs text-slate-400">시리즈</span>
              <span className="font-medium text-slate-700">{series.name}</span>
              <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${statusStyles[series.status]?.bg || 'bg-slate-100'} ${statusStyles[series.status]?.text || 'text-slate-500'}`}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusStyles[series.status]?.dot || '#94a3b8' }} />
                {series.status}
              </span>
            </div>
          )}
        </div>

        {/* core message */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-5">
          <h3 className="text-[11px] font-semibold tracking-wide uppercase text-indigo-500 mb-2 flex items-center gap-1.5">
            <Quote className="w-3 h-3" /> 핵심 메시지
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">{sermon.coreMessage}</p>
        </div>

        {/* outline */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-5">
          <h3 className="text-[11px] font-semibold tracking-wide uppercase text-amber-500 mb-3 flex items-center gap-1.5">
            <MessageSquare className="w-3 h-3" /> 설교 개요
          </h3>
          <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <div className="pl-3 border-l-2 border-indigo-200">
              <span className="font-medium text-slate-700 text-xs">도입</span>
              <p>{sermon.outlineIntro}</p>
            </div>
            {[sermon.outlinePoint1, sermon.outlinePoint2, sermon.outlinePoint3].map((point, i) => (
              point ? (
                <div key={i} className="pl-3 border-l-2 border-amber-200">
                  <span className="font-medium text-slate-700 text-xs">{i + 1}. </span>
                  <span>{point}</span>
                </div>
              ) : null
            ))}
            <div className="pl-3 border-l-2 border-emerald-200">
              <span className="font-medium text-slate-700 text-xs">결론</span>
              <p>{sermon.outlineConclusion}</p>
            </div>
          </div>
        </div>

        {/* manuscript */}
        {sermon.manuscript && (
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-5">
            <h3 className="text-[11px] font-semibold tracking-wide uppercase text-emerald-500 mb-3 flex items-center gap-1.5">
              <FileText className="w-3 h-3" /> 설교 원고
            </h3>
            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 rounded-xl p-4 border border-slate-100">
              {sermon.manuscript}
            </div>
          </div>
        )}

        {/* themes & tags */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-5">
          <div className="flex flex-wrap gap-6">
            <div className="flex-1 min-w-[140px]">
              <h3 className="text-[11px] font-semibold tracking-wide uppercase text-slate-400 mb-2 flex items-center gap-1">
                <Tag className="w-3 h-3" /> 주제
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {sermonThemes.map((t) => (
                  <span key={t.id} className="px-2.5 py-1 text-[11px] font-medium bg-amber-50 text-amber-600 rounded-full border border-amber-100/50">
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex-1 min-w-[140px]">
              <h3 className="text-[11px] font-semibold tracking-wide uppercase text-slate-400 mb-2 flex items-center gap-1">
                <Tag className="w-3 h-3" /> 태그
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {sermonTags.map((t) => (
                  <span
                    key={t.id}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-full border ${
                      t.type === 'situation'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50'
                        : 'bg-indigo-50 text-indigo-600 border-indigo-100/50'
                    }`}
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* related sermons */}
        {relatedSermons.length > 0 && (
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-5">
            <h3 className="text-[11px] font-semibold tracking-wide uppercase text-slate-400 mb-3">
              관련 설교 ( {relatedSermons.length} )
            </h3>
            <div className="flex flex-wrap gap-2">
              {relatedSermons.map((rs) => (
                <button
                  key={rs.id}
                  onClick={() => onNavigate(rs.id)}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-50 text-slate-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-slate-100 hover:border-indigo-200"
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
