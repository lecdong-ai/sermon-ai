'use client'

import { memo } from 'react'
import { X, Save, Loader2, BookOpen, Clock, FileText, History, BarChart2, Play, Download, Printer, Eye, Edit3 } from 'lucide-react'
import type { JohnManuscriptData } from '@/lib/project/johnManuscriptData'

// Save indicator is isolated to prevent flickering
const SaveIndicator = memo(function SaveIndicator({ isSaving, lastSaved }: { isSaving: boolean; lastSaved: string | null }) {
  if (isSaving) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-amber-400">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        저장 중...
      </div>
    )
  }
  if (lastSaved) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-green-400">
        <Clock className="w-3.5 h-3.5" />
        {lastSaved} 저장됨
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
      <FileText className="w-3.5 h-3.5" />
      자동 저장
    </div>
  )
})

interface Props {
  manuscript: JohnManuscriptData
  totalWords: number
  sidebarTab: 'versions' | 'diagnosis' | null
  versionsCount: number
  viewMode: 'edit' | 'preview'
  onToggleViewMode: () => void
  onToggleVersions: () => void
  onToggleDiagnosis: () => void
  onPractice: () => void
  onExport: () => void
  onPrint: () => void
  onSave: () => void
  onClose: () => void
  isSaving: boolean
  lastSaved: string | null
}

export default memo(function StudioHeader({
  manuscript,
  totalWords,
  sidebarTab,
  versionsCount,
  viewMode,
  onToggleViewMode,
  onToggleVersions,
  onToggleDiagnosis,
  onPractice,
  onExport,
  onPrint,
  onSave,
  onClose,
  isSaving,
  lastSaved,
}: Props) {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#04060f] print:hidden no-print">
      <div className="flex items-center gap-4">
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/10 text-slate-400"
        >
          <X className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            {manuscript.title || '제목 없는 설교'}
          </h2>
          <p className="text-[10px] text-slate-500">
            {manuscript.passage} · {totalWords.toLocaleString()}자
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleVersions}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold ${
            sidebarTab === 'versions' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          <History className="w-4 h-4" />
          버전 ({versionsCount})
        </button>
        <button
          onClick={onToggleDiagnosis}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold ${
            sidebarTab === 'diagnosis' ? 'bg-purple-500/20 text-purple-300' : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          AI 진단
        </button>

        <div className="w-px h-4 bg-white/10" />

        <button
          onClick={onPractice}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-white/5 text-slate-300 hover:bg-white/10"
        >
          <Play className="w-4 h-4" />
          발표 연습
        </button>
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-white/5 text-slate-300 hover:bg-white/10"
        >
          <Download className="w-4 h-4" />
          내보내기
        </button>
        <button
          onClick={onToggleViewMode}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
            viewMode === 'preview' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          {viewMode === 'preview' ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {viewMode === 'preview' ? '수정' : '미리보기'}
        </button>
        <button
          onClick={onPrint}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30"
        >
          <Printer className="w-4 h-4" />
          PDF 저장
        </button>

        <SaveIndicator isSaving={isSaving} lastSaved={lastSaved} />

        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 text-white text-xs font-bold"
        >
          <Save className="w-4 h-4" />
          저장
        </button>
      </div>
    </div>
  )
})
