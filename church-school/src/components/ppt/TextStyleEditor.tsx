'use client'

import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import type { PptTextStyle } from '@/types/workspace'

export const FONT_OPTIONS = [
  { value: 'Malgun Gothic', label: '맑은고딕' },
  { value: 'Nanum Gothic', label: '나눔고딕' },
  { value: 'Nanum Myeongjo', label: '나눔명조' },
  { value: 'Batang', label: '바탕' },
  { value: 'Dotum', label: '돋움' },
  { value: 'Pretendard', label: 'Pretendard' },
]

interface Props {
  label: string
  style: PptTextStyle | undefined
  onChange: (style: PptTextStyle) => void
  defaultSize: number
}

export default function TextStyleEditor({ label, style, onChange, defaultSize }: Props) {
  const s: PptTextStyle = {
    fontFace: 'Malgun Gothic',
    fontSize: defaultSize,
    bold: false,
    italic: false,
    underline: false,
    color: '1B2A4A',
    align: 'left',
    valign: 'top',
    lineSpacing: 1.5,
    ...style,
  }

  const update = (patch: Partial<PptTextStyle>) => onChange({ ...s, ...patch })

  return (
    <div className="bg-warm-50 border border-warm-200 rounded-xl p-3 space-y-2.5">
      <p className="text-[11px] font-bold text-navy-700">{label}</p>

      {/* 글꼴 */}
      <div>
        <label className="text-[10px] font-medium text-navy-500 block mb-1">글꼴</label>
        <select
          value={s.fontFace}
          onChange={(e) => update({ fontFace: e.target.value })}
          className="w-full px-2 py-1.5 rounded-lg border border-warm-200 text-[12px] text-navy-900 focus:outline-none focus:border-navy-500 bg-white"
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* 크기 */}
      <div>
        <label className="text-[10px] font-medium text-navy-500 block mb-1">
          크기: <span className="font-bold text-navy-700">{s.fontSize}pt</span>
        </label>
        <input
          type="range"
          min={10}
          max={72}
          value={s.fontSize}
          onChange={(e) => update({ fontSize: Number(e.target.value) })}
          className="w-full accent-navy-600"
        />
      </div>

      {/* 굵기/이탤릭/밑줄 */}
      <div className="flex gap-1">
        <button
          onClick={() => update({ bold: !s.bold })}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            s.bold ? 'bg-navy-700 text-white' : 'bg-white border border-warm-200 text-navy-600 hover:bg-warm-100'
          }`}
          title="굵게"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => update({ italic: !s.italic })}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            s.italic ? 'bg-navy-700 text-white' : 'bg-white border border-warm-200 text-navy-600 hover:bg-warm-100'
          }`}
          title="이탤릭"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => update({ underline: !s.underline })}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            s.underline ? 'bg-navy-700 text-white' : 'bg-white border border-warm-200 text-navy-600 hover:bg-warm-100'
          }`}
          title="밑줄"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>

        <div className="w-px bg-warm-200 mx-1" />

        {/* 정렬 */}
        <button
          onClick={() => update({ align: 'left' })}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            s.align === 'left' ? 'bg-navy-700 text-white' : 'bg-white border border-warm-200 text-navy-600 hover:bg-warm-100'
          }`}
          title="좌측 정렬"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => update({ align: 'center' })}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            s.align === 'center' ? 'bg-navy-700 text-white' : 'bg-white border border-warm-200 text-navy-600 hover:bg-warm-100'
          }`}
          title="중앙 정렬"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => update({ align: 'right' })}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            s.align === 'right' ? 'bg-navy-700 text-white' : 'bg-white border border-warm-200 text-navy-600 hover:bg-warm-100'
          }`}
          title="우측 정렬"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 행간 + 색상 */}
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-[10px] font-medium text-navy-500 block mb-1">
            행간: <span className="font-bold text-navy-700">{s.lineSpacing?.toFixed(1)}</span>
          </label>
          <input
            type="range"
            min={1}
            max={2}
            step={0.1}
            value={s.lineSpacing}
            onChange={(e) => update({ lineSpacing: Number(e.target.value) })}
            className="w-full accent-navy-600"
          />
        </div>
        <div>
          <label className="text-[10px] font-medium text-navy-500 block mb-1">색상</label>
          <input
            type="color"
            value={`#${s.color}`}
            onChange={(e) => update({ color: e.target.value.substring(1).toUpperCase() })}
            className="w-10 h-8 rounded-lg border border-warm-200 cursor-pointer bg-white p-0.5"
          />
        </div>
      </div>
    </div>
  )
}
