'use client'

import { forwardRef, useMemo } from 'react'
import type { SheetOrientation, SheetPage, UploadedImage } from '@/types/conti'
import CanvasElement from './CanvasElement'

interface Props {
  page: SheetPage
  orientation: SheetOrientation
  zoom: number
  selectedElementId: string | null
  uploadedImages: UploadedImage[]
  cropMode?: boolean
  onSelectElement: (id: string | null) => void
  onUpdateElement: (id: string, updates: any) => void
  onDeleteElement: (id: string) => void
  onSplitElement?: (id: string, splitAt: number) => void
}

const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297
export const SCALE_FACTOR = 3.7795275591  // 1mm → px at 96dpi

const A4Canvas = forwardRef<HTMLDivElement, Props>(function A4Canvas({
  page, orientation, zoom, selectedElementId,
  uploadedImages, cropMode,
  onSelectElement, onUpdateElement, onDeleteElement, onSplitElement,
}, ref) {
  const canvasWidth = useMemo(
    () => (orientation === 'portrait' ? A4_WIDTH_MM : A4_HEIGHT_MM),
    [orientation],
  )
  const canvasHeight = useMemo(
    () => (orientation === 'portrait' ? A4_HEIGHT_MM : A4_WIDTH_MM),
    [orientation],
  )

  const pxW = canvasWidth * SCALE_FACTOR
  const pxH = canvasHeight * SCALE_FACTOR

  function getImageDataUrl(imageId: string | undefined): string | undefined {
    if (!imageId) return undefined
    return uploadedImages.find((img) => img.id === imageId)?.dataUrl
  }

  return (
    <div
      ref={ref}
      className="relative bg-white shadow-2xl mx-auto"
      style={{
        width: pxW,
        height: pxH,
        transform: `scale(${zoom / 100})`,
        transformOrigin: 'top center',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onSelectElement(null)
      }}
    >
      {/* 눈금자 배경선 (선택용 가이드) */}
      <svg className="absolute inset-0 pointer-events-none" width={pxW} height={pxH}>
        <defs>
          <pattern id="grid" width={SCALE_FACTOR * 10} height={SCALE_FACTOR * 10} patternUnits="userSpaceOnUse">
            <path d={`M ${SCALE_FACTOR * 10} 0 L 0 0 0 ${SCALE_FACTOR * 10}`} fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* 페이지 번호 */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-slate-300 font-medium select-none">
        {page.id}
      </div>

      {/* 요소들 */}
      {page.elements.map((el) => (
        <CanvasElement
          key={el.id}
          element={el}
          isSelected={selectedElementId === el.id}
          imageDataUrl={getImageDataUrl(el.imageId)}
          cropMode={cropMode}
          onSelect={onSelectElement}
          onUpdate={onUpdateElement}
          onDelete={onDeleteElement}
          onSplit={onSplitElement}
          scale={zoom / 100}
        />
      ))}

      {/* 빈 페이지 안내 */}
      {page.elements.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <div className="text-center">
            <p className="text-[30px] text-slate-200 font-extralight">A4</p>
            <p className="text-[12px] text-slate-300 mt-1">
              {orientation === 'portrait' ? '세로' : '가로'} · {canvasWidth} × {canvasHeight}mm
            </p>
            <p className="text-[11px] text-slate-400 mt-2">왼쪽에서 이미지를 업로드한 후 클릭하여 추가하세요</p>
          </div>
        </div>
      )}
    </div>
  )
})

export default A4Canvas
