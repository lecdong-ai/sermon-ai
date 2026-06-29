'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import type { CanvasElementData } from '@/types/conti'
import { Trash2 } from 'lucide-react'

interface Props {
  element: CanvasElementData
  isSelected: boolean
  imageDataUrl?: string
  cropMode?: boolean
  onSelect: (id: string) => void
  onUpdate: (id: string, updates: Partial<CanvasElementData>) => void
  onDelete: (id: string) => void
  onSplit?: (id: string, splitAt: number) => void
  scale: number
}

type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

const DIR_CURSOR: Record<ResizeDir, string> = {
  n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize',
  ne: 'nesw-resize', nw: 'nwse-resize', se: 'nwse-resize', sw: 'nesw-resize',
}

const MIN_SIZE = 20

export default function CanvasElement({
  element, isSelected, imageDataUrl, cropMode,
  onSelect, onUpdate, onDelete, onSplit, scale,
}: Props) {
  const [dragging, setDragging] = useState(false)
  const [resizeDir, setResizeDir] = useState<ResizeDir | null>(null)
  const [cursorY, setCursorY] = useState<number | null>(null)
  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 })
  const [editing, setEditing] = useState(false)
  const editRef = useRef<HTMLDivElement>(null)
  const start = useRef({
    x: 0, y: 0, elX: 0, elY: 0, elW: 0, elH: 0, lockedAspect: 0,
  })

  useEffect(() => {
    if (!imageDataUrl) return
    const img = new Image()
    img.onload = () => setImgNatural({ w: img.naturalWidth, h: img.naturalHeight })
    img.src = imageDataUrl
  }, [imageDataUrl])

  const cropTopPct = element.cropTop || 0
  const cropBottomPct = element.cropBottom || 0
  const imgDisplayH = imgNatural.w ? (imgNatural.h / imgNatural.w) * element.width : element.height
  const cursorHoverPct = cursorY !== null
    ? Math.round(cropTopPct + (cursorY / element.height) * (100 - cropTopPct - cropBottomPct))
    : null

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (cropMode || editing) return
    e.stopPropagation()
    onSelect(element.id)
    setDragging(true)
    start.current = { x: e.clientX, y: e.clientY, elX: element.x, elY: element.y, elW: 0, elH: 0, lockedAspect: 0 }
  }, [element.id, element.x, element.y, onSelect, cropMode, editing])

  const handleResizeStart = useCallback((dir: ResizeDir) => (e: React.MouseEvent) => {
    if (cropMode || editing) return
    e.stopPropagation()
    onSelect(element.id)
    setResizeDir(dir)
    start.current = {
      x: e.clientX, y: e.clientY,
      elX: element.x, elY: element.y,
      elW: element.width, elH: element.height,
      lockedAspect: e.shiftKey ? (element.width / element.height) : 0,
    }
  }, [element.id, element.x, element.y, element.width, element.height, onSelect, cropMode, editing])

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (!cropMode || !onSplit) return
    e.stopPropagation()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const visualY = e.clientY - rect.top
    const actualY = visualY / scale
    const yPct = actualY / element.height
    const range = 100 - cropTopPct - cropBottomPct
    if (range <= 0) return
    const fullPct = Math.round(cropTopPct + yPct * range)
    const clamped = Math.min(Math.max(fullPct, cropTopPct + 2), 100 - cropBottomPct - 2)
    onSplit(element.id, clamped)
  }, [cropMode, onSplit, scale, element.id, element.height, cropTopPct, cropBottomPct])

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cropMode) return
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const visualY = e.clientY - rect.top
    const actualY = visualY / scale
    setCursorY(Math.max(0, Math.min(element.height, actualY)))
  }, [cropMode, scale, element.height])

  const handleCanvasMouseLeave = useCallback(() => {
    setCursorY(null)
  }, [])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (cropMode || element.type !== 'text') return
    e.stopPropagation()
    setEditing(true)
    requestAnimationFrame(() => {
      if (editRef.current) {
        editRef.current.focus()
        const range = document.createRange()
        range.selectNodeContents(editRef.current)
        range.collapse(false)
        const sel = window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(range)
      }
    })
  }, [cropMode, element.type])

  const handleBlur = useCallback(() => {
    setEditing(false)
    const text = editRef.current?.innerText?.trim() || ''
    onUpdate(element.id, { text })
  }, [element.id, onUpdate])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      if (editRef.current) {
        editRef.current.innerText = element.text || ''
      }
      setEditing(false)
      editRef.current?.blur()
    }
  }, [element.text])

  useEffect(() => {
    if (!dragging && !resizeDir) return

    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - start.current.x) / scale
      const dy = (e.clientY - start.current.y) / scale

      if (dragging) {
        onUpdate(element.id, { x: start.current.elX + dx, y: start.current.elY + dy })
        return
      }

      if (resizeDir) {
        let { elX, elY, elW, elH, lockedAspect } = start.current
        let nx = elX, ny = elY, nw = elW, nh = elH
        const dir = resizeDir
        if (dir.includes('e')) { nw = Math.max(MIN_SIZE, elW + dx) }
        if (dir.includes('w')) { nw = Math.max(MIN_SIZE, elW - dx); nx = elX + (elW - nw) }
        if (dir.includes('s')) { nh = Math.max(MIN_SIZE, elH + dy) }
        if (dir.includes('n')) { nh = Math.max(MIN_SIZE, elH - dy); ny = elY + (elH - nh) }
        if (lockedAspect > 0) {
          const dirH = dir.includes('s') || dir.includes('n')
          const dirW = dir.includes('e') || dir.includes('w')
          if (dirH && !dirW) {
            nh = Math.max(MIN_SIZE, elH + (dir.includes('s') ? dy : -dy))
            ny = dir.includes('n') ? elY + (elH - nh) : ny
            nw = nh * lockedAspect
            if (dir.includes('w')) nx = elX + (elW - nw)
          } else {
            nw = Math.max(MIN_SIZE, elW + (dir.includes('e') ? dx : -dx))
            if (dir.includes('w')) nx = elX + (elW - nw)
            nh = nw / lockedAspect
            if (dir.includes('n')) ny = elY + (elH - nh)
          }
        }
        onUpdate(element.id, { x: nx, y: ny, width: nw, height: nh })
      }
    }

    const handleMouseUp = () => {
      setDragging(false)
      setResizeDir(null)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift' && resizeDir && start.current.lockedAspect === 0)
        start.current.lockedAspect = element.width / element.height
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') start.current.lockedAspect = 0
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [dragging, resizeDir, element.id, element.width, element.height, imgDisplayH, onUpdate, scale])

  const showControls = isSelected && !cropMode && !editing

  return (
    <div
      data-elid={element.id}
      className="absolute group"
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        cursor: cropMode ? 'pointer' : (dragging ? 'grabbing' : 'grab'),
      }}
      onMouseDown={handleMouseDown}
      onClick={handleCanvasClick}
      onMouseMove={handleCanvasMouseMove}
      onMouseLeave={handleCanvasMouseLeave}
      onDoubleClick={handleDoubleClick}
    >
      {/* 호버 미리보기 라인 (요소 루트 기준) */}
      {cropMode && cursorY !== null && (
        <div className="absolute left-0 right-0 pointer-events-none z-20" style={{ top: cursorY - 0.5 }}>
          <div className="h-px bg-amber-400 border-t border-dashed border-amber-400/90 shadow-[0_0_4px_#fbbf24]" />
        </div>
      )}

      {/* 콘텐츠 */}
      <div
        className={`w-full h-full rounded overflow-hidden border-2 transition-colors pointer-events-none ${
          isSelected
            ? cropMode
              ? 'border-amber-400 shadow-lg shadow-amber-500/20'
              : 'border-indigo-400 shadow-lg shadow-indigo-500/20'
            : 'border-transparent'
        }`}
        style={{ transform: `rotate(${element.rotation}deg)` }}
      >
        {element.type === 'image' && imageDataUrl && imgNatural.w > 0 ? (
          cropTopPct || cropBottomPct ? (
            <div className="w-full h-full relative overflow-hidden">
              <div
                style={{
                  width: '100%',
                  height: imgDisplayH,
                  marginTop: -(cropTopPct / 100) * imgDisplayH,
                }}
              >
                <img src={imageDataUrl} alt="" className="w-full h-auto block" draggable={false} />
              </div>
            </div>
          ) : (
            <img src={imageDataUrl} alt="" className="w-full h-full object-fill" draggable={false} />
          )
        ) : element.type === 'text' ? (
          <div
            ref={editRef}
            contentEditable={editing}
            suppressContentEditableWarning
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`w-full h-full bg-transparent font-bold p-1.5 text-left overflow-hidden whitespace-pre-wrap break-words ${
              element.text ? 'text-gray-900' : 'text-gray-400'
            } ${
              editing ? 'cursor-text outline-none ring-1 ring-indigo-400/40' : 'pointer-events-none'
            }`}
            style={{ fontSize: (element.fontSize || 16) + 'px', lineHeight: 1.4 }}
          >
            {element.text || '텍스트 입력'}
          </div>
        ) : (
          <div className="w-full h-full bg-white/10 flex items-center justify-center text-white/30 text-[10px]">
            {element.type === 'image' ? '로딩 중...' : '빈 요소'}
          </div>
        )}
      </div>

      {/* hover/선택 컨트롤 */}
      {showControls && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(element.id) }}
            className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center shadow-md z-20 transition-all opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-2.5 h-2.5 text-white" />
          </button>
          {(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as ResizeDir[]).map((dir) => (
            <div
              key={dir}
              onMouseDown={handleResizeStart(dir)}
              className="absolute w-3 h-3 rounded-sm bg-indigo-400 border border-white/50 shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                cursor: DIR_CURSOR[dir],
                ...((/n|s/).test(dir) && !(/e|w/).test(dir))
                  ? { left: '50%', marginLeft: -6, [dir === 'n' ? 'top' : 'bottom']: -6 } : {},
                ...((/e|w/).test(dir) && !(/n|s/).test(dir))
                  ? { top: '50%', marginTop: -6, [dir === 'w' ? 'left' : 'right']: -6 } : {},
                ...((/n/).test(dir) && (/e|w/).test(dir))
                  ? { [dir.includes('w') ? 'left' : 'right']: -6, top: -6 } : {},
                ...((/s/).test(dir) && (/e|w/).test(dir))
                  ? { [dir.includes('w') ? 'left' : 'right']: -6, bottom: -6 } : {},
              }}
            />
          ))}
        </>
      )}

      {/* 분할 모드 안내 */}
      {cropMode && isSelected && element.type === 'image' && (
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] text-slate-500 font-medium whitespace-nowrap pointer-events-none z-10">
          {cursorHoverPct !== null ? `${cursorHoverPct}% 위치 · 클릭하여 분할` : '이미지 위에 마우스를 올리세요'}
        </div>
      )}
    </div>
  )
}
