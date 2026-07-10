'use client'

import type { PptSlide } from '@/types/school/workspace'

interface Props {
  slide: PptSlide
  index: number
  active: boolean
  onClick: () => void
}

const LAYOUT_LABELS: Record<string, string> = {
  'title': '표지',
  'bullets': '내용',
  'section-header': '구분',
  'quote': '인용',
  'two-column': '2단',
  'closing': '마무리',
  'vs-contrast': '비교',
  'timeline-flow': '흐름',
  'central-focus': '핵심',
  'grid-matrix': '그리드',
}

export default function PptSlideCard({ slide, index, active, onClick }: Props) {
  const hasImage = !!slide.imageBase64
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg border transition-all duration-150 overflow-hidden ${
        active
          ? 'border-navy-500 bg-navy-50 shadow-card'
          : 'border-warm-200 bg-white hover:border-navy-200 hover:bg-warm-50'
      }`}
    >
      <div className="flex items-stretch">
        {/* 인덱스 / 이미지 썸네일 */}
        <div className="w-12 shrink-0 flex items-center justify-center bg-warm-100 border-r border-warm-200">
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`data:image/png;base64,${slide.imageBase64}`}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <span className={`text-[12px] font-bold ${active ? 'text-navy-700' : 'text-navy-400'}`}>
              {index + 1}
            </span>
          )}
        </div>
        {/* 본문 */}
        <div className="flex-1 px-2.5 py-2 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={`text-[10px] font-bold uppercase tracking-wide ${active ? 'text-navy-600' : 'text-navy-400'}`}>
              {LAYOUT_LABELS[slide.layout] || slide.layout}
            </span>
            {hasImage && (
              <span className="text-[9px] font-bold text-mint-600 bg-mint-50 px-1 rounded">IMG</span>
            )}
          </div>
          <p className={`text-[12px] font-bold truncate ${active ? 'text-navy-900' : 'text-navy-700'}`}>
            {slide.title}
          </p>
          <p className="text-[10px] text-navy-400 truncate mt-0.5">
            {slide.content[0] || ''}
          </p>
        </div>
      </div>
    </button>
  )
}
