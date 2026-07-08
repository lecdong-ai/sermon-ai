'use client'

import { Plus, FileText } from 'lucide-react'

interface Props {
  onUpload: () => void
}

export default function EmptyWorkspace({ onUpload }: Props) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 rounded-3xl bg-white border border-[#e4e2dd] flex items-center justify-center mx-auto mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <FileText className="w-9 h-9 text-[#8d7a5b]" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold text-[#2c2a29] mb-2">아직 업로드된 설교가 없습니다</h3>
      <p className="text-[14px] text-[#8a8580] mb-6 leading-relaxed max-w-md mx-auto">
        설교 원고를 업로드하면 AI가 4가지 콘텐츠를 자동 생성합니다.<br />
        요약 · 나눔 자료 · 설교 대본 · 쇼츠 대본
      </p>
      <button
        onClick={onUpload}
        className="inline-flex items-center gap-2 rounded-xl bg-[#8d7a5b] text-white px-6 py-3 text-[15px] font-bold hover:bg-[#7a694e] active:scale-[0.98] transition-all duration-200 shadow-md"
      >
        <Plus className="w-4 h-4" />
        설교 원고 업로드
      </button>
    </div>
  )
}
