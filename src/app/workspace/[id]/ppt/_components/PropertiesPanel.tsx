'use client'

import { useState } from 'react'
import {
  Plus,
  Trash2,
  Sparkles,
  ChevronUp,
  ChevronDown,
  FileText,
  BookOpen,
  Star,
  Check,
  Heart,
  Cross,
  Lightbulb,
  Quote,
  PrayIcon,
} from './icons'
import type { PPTShare } from '@/types'

interface Props {
  slide: PPTShare
  index: number
  total: number
  isFirst: boolean
  isLast: boolean
  onChange: (slide: PPTShare) => void
  onAdd: () => void
  onDelete: () => void
  onMove: (direction: 'up' | 'down') => void
  onRefineAI: () => void
}

const STYLES: { key: PPTShare['style']; label: string; color: string; bg: string }[] = [
  { key: 'list', label: '일반', color: 'text-slate-700', bg: 'bg-slate-100' },
  { key: 'scripture', label: '말씀', color: 'text-amber-700', bg: 'bg-amber-100' },
  { key: 'highlight', label: '강조', color: 'text-indigo-700', bg: 'bg-indigo-100' },
  { key: 'apply', label: '적용', color: 'text-emerald-700', bg: 'bg-emerald-100' },
]

const ICONS: { key: string; label: string; render: (active: boolean) => React.ReactNode }[] = [
  { key: 'star', label: '별', render: (a) => <Star className="w-3.5 h-3.5" active={a} /> },
  { key: 'heart', label: '하트', render: (a) => <Heart className="w-3.5 h-3.5" active={a} /> },
  { key: 'cross', label: '십자가', render: (a) => <Cross className="w-3.5 h-3.5" active={a} /> },
  { key: 'book', label: '책', render: (a) => <BookOpen className="w-3.5 h-3.5" active={a} /> },
  { key: 'bible', label: '성경', render: (a) => <BookOpen className="w-3.5 h-3.5" active={a} /> },
  { key: 'lightbulb', label: '아이디어', render: (a) => <Lightbulb className="w-3.5 h-3.5" active={a} /> },
  { key: 'check', label: '체크', render: (a) => <Check className="w-3.5 h-3.5" active={a} /> },
  { key: 'quote', label: '인용', render: (a) => <Quote className="w-3.5 h-3.5" active={a} /> },
  { key: 'pray', label: '기도', render: (a) => <PrayIcon className="w-3.5 h-3.5" active={a} /> },
]

export default function PropertiesPanel({
  slide,
  index,
  total,
  isFirst,
  isLast,
  onChange,
  onAdd,
  onDelete,
  onMove,
  onRefineAI,
}: Props) {
  const [titleDraft, setTitleDraft] = useState(slide.title || '')
  const [contentDraft, setContentDraft] = useState(slide.content || '')

  // 슬라이드가 바뀌면 드래프트도 갱신
  if (slide.title !== titleDraft && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
    setTitleDraft(slide.title || '')
  }
  if (slide.content !== contentDraft && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
    setContentDraft(slide.content || '')
  }

  const commitTitle = () => {
    if (titleDraft !== slide.title) onChange({ ...slide, title: titleDraft })
  }
  const commitContent = () => {
    if (contentDraft !== slide.content) onChange({ ...slide, content: contentDraft })
  }

  const setStyle = (style: PPTShare['style']) => {
    onChange({ ...slide, style })
  }
  const setIcon = (icon: string) => {
    onChange({ ...slide, icon })
  }

  return (
    <aside className="hidden lg:flex flex-col w-[300px] shrink-0 border-l border-gray-200 bg-white overflow-y-auto">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">슬라이드 속성</p>
        <p className="text-[12px] text-gray-500 mt-0.5">슬라이드 {index + 1} / {total}</p>
      </div>

      <div className="p-4 space-y-5 flex-1">
        {/* 이동 / 추가 / 삭제 */}
        <div className="grid grid-cols-4 gap-1.5">
          <button
            onClick={() => onMove('up')}
            disabled={isFirst}
            className="h-9 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="위로"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onMove('down')}
            disabled={isLast}
            className="h-9 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="아래로"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onAdd}
            className="h-9 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition-colors"
            title="새 슬라이드 추가"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            disabled={total <= 1}
            className="h-9 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="삭제"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">제목</label>
          <input
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.currentTarget as HTMLElement).blur() }}
            placeholder="슬라이드 제목"
            className="w-full px-3 py-2 text-[13px] text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            maxLength={40}
          />
        </div>

        {/* 스타일 */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">스타일</label>
          <div className="grid grid-cols-4 gap-1.5">
            {STYLES.map(s => {
              const active = (slide.style || 'list') === s.key
              return (
                <button
                  key={s.key}
                  onClick={() => setStyle(s.key)}
                  className={`py-2 rounded-lg text-[12px] font-bold transition-all ${
                    active
                      ? `${s.bg} ${s.color} ring-2 ring-offset-1 ring-current`
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* 아이콘 */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">아이콘</label>
          <div className="grid grid-cols-9 gap-1">
            {ICONS.map(ic => {
              const active = (slide.icon || '') === ic.key
              return (
                <button
                  key={ic.key}
                  onClick={() => setIcon(ic.key)}
                  className={`aspect-square rounded-lg flex items-center justify-center transition-all ${
                    active
                      ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-300'
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                  }`}
                  title={ic.label}
                >
                  {ic.render(active)}
                </button>
              )
            })}
          </div>
        </div>

        {/* 본문 */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            본문 <span className="text-gray-400 normal-case font-normal">(불릿 5~8개)</span>
          </label>
          <textarea
            value={contentDraft}
            onChange={(e) => setContentDraft(e.target.value)}
            onBlur={commitContent}
            placeholder={'• 첫 번째 포인트\n• 두 번째 포인트\n• 세 번째 포인트'}
            rows={10}
            className="w-full px-3 py-2 text-[13px] text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-y font-mono leading-relaxed"
          />
          <p className="text-[10px] text-gray-400 mt-1">각 줄이 불릿 포인트로 표시됩니다 (• 기호로 시작 가능)</p>
        </div>

        {/* AI 리파인 */}
        <div>
          <button
            onClick={onRefineAI}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-[13px] font-bold shadow-md shadow-violet-200 hover:shadow-lg hover:shadow-violet-300 hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            AI 리파인
          </button>
          <p className="text-[10px] text-gray-400 mt-1.5 text-center">AI가 현재 슬라이드를 개선합니다</p>
        </div>
      </div>
    </aside>
  )
}
