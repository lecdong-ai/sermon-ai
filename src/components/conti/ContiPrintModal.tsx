'use client'

import { useState } from 'react'
import type { ContiSet, ContiItem, PrintMode } from '@/types/conti'
import { PRINT_MODE_META } from '@/types/conti'
import PrintPreview from './PrintPreview'
import { X, Printer, Loader2, Users, User, Monitor, Music, FileText, ArrowRight } from 'lucide-react'

interface Props {
  conti: ContiSet
  items: ContiItem[]
  onClose: () => void
}

const MODE_ICONS = {
  team: Users,
  leader: User,
  ppt: Monitor,
} as const

const MODE_COLORS = {
  team: { bg: 'from-sky-500/20 to-indigo-500/20', border: 'border-sky-500/40', text: 'text-sky-300' },
  leader: { bg: 'from-amber-500/20 to-rose-500/20', border: 'border-amber-500/40', text: 'text-amber-300' },
  ppt: { bg: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/40', text: 'text-purple-300' },
} as const

export default function ContiPrintModal({ conti, items, onClose }: Props) {
  const [mode, setMode] = useState<PrintMode>('leader')
  const [printing, setPrinting] = useState(false)

  function handlePrint() {
    setPrinting(true)
    // 잠시 후 window.print() 호출 (DOM 업데이트 시간 확보)
    setTimeout(() => {
      window.print()
      setPrinting(false)
    }, 200)
  }

  const meta = PRINT_MODE_META[mode]
  const ModeIcon = MODE_ICONS[mode]

  return (
    <>
      {/* 인쇄 전용 CSS */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
          }
          @page {
            size: A4;
            margin: 15mm;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03050c]/85 backdrop-blur-md print:hidden" onClick={onClose}>
        <div
          className="relative w-full max-w-5xl rounded-3xl bg-[#0a0f1f] border border-white/10 shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/20 flex items-center justify-center">
                <Printer className="w-4 h-4 text-sky-300" />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-white">인쇄 미리보기</h2>
                <p className="text-[13px] text-slate-500 font-medium">{conti.title} · {items.length}곡</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 본문: 좌측 모드 선택 + 우측 미리보기 */}
          <div className="flex-1 flex min-h-0">
            {/* 좌측: 모드 선택 */}
            <div className="w-64 flex-shrink-0 border-r border-white/5 p-5 space-y-3 overflow-y-auto">
              <div>
                <h3 className="text-[12px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">
                  인쇄 모드
                </h3>
                <div className="space-y-2">
                  {(['team', 'leader', 'ppt'] as PrintMode[]).map((m) => {
                    const M = MODE_ICONS[m]
                    const c = MODE_COLORS[m]
                    const isActive = mode === m
                    return (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                          isActive
                            ? `bg-gradient-to-br ${c.bg} ${c.border}`
                            : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isActive ? c.bg : 'bg-white/5'
                          }`}>
                            <M className={`w-4 h-4 ${isActive ? c.text : 'text-slate-400'}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-[14px] font-bold ${isActive ? 'text-white' : 'text-slate-200'}`}>
                              {PRINT_MODE_META[m].label}
                            </p>
                            <p className="text-[12px] text-slate-500 font-medium mt-0.5">
                              {PRINT_MODE_META[m].desc}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 인쇄 옵션 요약 */}
              <div className="pt-3 border-t border-white/5">
                <h3 className="text-[12px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">
                  포함 항목
                </h3>
                <div className="space-y-1 text-[12px]">
                  {[
                    { key: 'showTitle', label: '곡 제목' },
                    { key: 'showKey', label: 'Key' },
                    { key: 'showBpm', label: 'BPM' },
                    { key: 'showLyrics', label: '가사' },
                    { key: 'showTransitionMemo', label: '전환 메모' },
                    { key: 'showMemo', label: '곡별 메모' },
                  ].map(({ key, label }) => {
                    const show = (meta as any)[key]
                    return (
                      <div key={key} className="flex items-center gap-1.5">
                        <span className={`w-3 h-3 rounded-sm flex items-center justify-center ${
                          show ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700/30 text-slate-500'
                        }`}>
                          {show ? '✓' : '–'}
                        </span>
                        <span className={show ? 'text-slate-300 font-medium' : 'text-slate-600 font-medium line-through'}>
                          {label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 text-[12px] text-slate-500 space-y-1">
                <p>📄 A4 용지</p>
                <p>🖋 폰트 {meta.fontSize}pt</p>
                <p>📑 {mode === 'team' ? '1장' : mode === 'leader' ? `${items.length + 1}장` : `${items.length * 2 + 1}장`}</p>
              </div>
            </div>

            {/* 우측: 미리보기 */}
            <div className="flex-1 overflow-y-auto bg-[#1a1f2e] p-6 scrollbar-thin">
              <div className="print-area mx-auto bg-white shadow-2xl" style={{ width: '210mm', minHeight: '297mm' }}>
                <PrintPreview conti={conti} items={items} mode={mode} />
              </div>
            </div>
          </div>

          {/* 풋터 */}
          <div className="flex items-center gap-2 px-6 py-4 border-t border-white/5 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[13px] font-bold text-slate-400 hover:bg-white/5 transition-colors"
            >
              취소
            </button>
            <span className="text-[12px] text-slate-600 font-medium ml-auto">
              💡 인쇄 시 미리보기 영역만 출력됩니다
            </span>
            <button
              onClick={handlePrint}
              disabled={printing || items.length === 0}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-[14px] font-extrabold transition-all shadow-lg shadow-sky-600/30 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {printing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  준비 중...
                </>
              ) : (
                <>
                  <Printer className="w-3.5 h-3.5" />
                  인쇄
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
