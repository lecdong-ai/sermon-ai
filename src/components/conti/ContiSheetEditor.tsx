'use client'

import { useState, useRef, useEffect } from 'react'
import type { SheetProject, SheetOrientation, SheetPage, UploadedImage, CanvasElementData, ContiSet, ContiItem } from '@/types/conti'
import { loadMockSheetProject, saveMockSheetProject } from '@/lib/conti/mockStorage'
import { saveImageBlob, loadImageBlob, deleteImageBlob, deleteImageBlobs } from '@/lib/conti/imageStorage'
import { preprocessImage } from '@/lib/conti/imagePreprocess'
import A4Canvas, { SCALE_FACTOR } from './A4Canvas'
import OcrReviewModal from './OcrReviewModal'
import type { ChordPlacement } from '@/lib/conti/visionAi'
import {
  X, Download, RotateCcw, ZoomIn, ZoomOut,
  FolderOpen, Plus, Trash2, Scissors,
  LayoutGrid, Type, Music, Scan,
} from 'lucide-react'

interface Props {
  conti: ContiSet
  items: ContiItem[]
  onClose: () => void
}

function generateId(): string {
  return `e-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export default function ContiSheetEditor({ conti, items, onClose }: Props) {
  const [project, setProject] = useState<SheetProject | null>(null)
  const [currentPageIdx, setCurrentPageIdx] = useState(0)
  const [zoom, setZoom] = useState(80)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [cropMode, setCropMode] = useState(false)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [ocrResult, setOcrResult] = useState<{
    title: string
    artist: string | null
    originalKey: string | null
    lyrics: string
    chordData: ChordPlacement[][]
    alignedPreview: string
  } | null>(null)
  const [ocrToast, setOcrToast] = useState<string | null>(null)
  const [hoveredImgId, setHoveredImgId] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const imageUrlsRef = useRef<Record<string, string>>({})

  useEffect(() => {
    const saved = loadMockSheetProject(conti.id)
    if (saved) {
      const metaImages: UploadedImage[] = (saved.uploadedImages || []).map(
        ({ dataUrl: _d, ...rest }) => rest, // strip any leftover dataUrl
      )
      setUploadedImages(metaImages)
      setProject({
        ...saved,
        uploadedImages: metaImages,
        marginMm: saved.marginMm ?? 3,
      })
      // load blobs from IndexedDB → create object URLs
      loadBlobUrls(metaImages)
      return
    }
    const firstPage: SheetPage = { id: `page-1`, elements: [] }
    setProject({
      orientation: 'portrait',
      pages: [firstPage],
      uploadedImages: [],
      marginMm: 3,
    })
  }, [conti.id])

  async function loadBlobUrls(images: UploadedImage[]) {
    const urls: Record<string, string> = {}
    for (const img of images) {
      try {
        const blob = await loadImageBlob(img.id)
        if (blob) urls[img.id] = URL.createObjectURL(blob)
      } catch { /* blob missing — ignore */ }
    }
    // apply to state using the original images array
    setUploadedImages(
      images.map((u) => (urls[u.id] ? { ...u, dataUrl: urls[u.id] } : u)),
    )
    // store for cleanup
    imageUrlsRef.current = { ...imageUrlsRef.current, ...urls }
  }

  // unmount cleanup: revoke all object URLs
  useEffect(() => {
    return () => {
      Object.values(imageUrlsRef.current).forEach(URL.revokeObjectURL)
    }
  }, [])

  useEffect(() => {
    if (!project) return
    // strip dataUrl before persisting (images live in IndexedDB)
    const strippedImages = uploadedImages.map(
      ({ dataUrl: _d, ...rest }) => rest,
    )
    saveMockSheetProject(conti.id, { ...project, uploadedImages: strippedImages })
  }, [project, uploadedImages, conti.id])

  const currentPage = project?.pages[currentPageIdx]
  const selectedElement = currentPage?.elements.find((el) => el.id === selectedElementId)

  function pageOrientation(page: SheetPage): SheetOrientation {
    return page.orientation ?? project!.orientation
  }

  function handleOrientationChange(newOrientation: SheetOrientation) {
    if (!project || !currentPage || pageOrientation(currentPage) === newOrientation) return

    const oldW = (pageOrientation(currentPage) === 'portrait' ? 210 : 297) * SCALE_FACTOR
    const oldH = (pageOrientation(currentPage) === 'portrait' ? 297 : 210) * SCALE_FACTOR
    const newW = (newOrientation === 'portrait' ? 210 : 297) * SCALE_FACTOR
    const newH = (newOrientation === 'portrait' ? 297 : 210) * SCALE_FACTOR

    const sx = newW / oldW
    const sy = newH / oldH

    setProject((prev) => {
      if (!prev) return prev
      const pages = [...prev.pages]
      pages[currentPageIdx] = {
        ...pages[currentPageIdx],
        orientation: newOrientation,
        elements: pages[currentPageIdx].elements.map((el) => ({
          ...el,
          x: el.x * sx,
          y: el.y * sy,
          width: el.width * sx,
          height: el.height * sy,
        })),
      }
      return { ...prev, pages }
    })
    setTimeout(() => handleAutoArrange(), 0)
  }

  function handleMarginChange(delta: number) {
    if (!project) return
    const newMargin = Math.max(1, Math.min(10, (project.marginMm ?? 3) + delta))
    setProject({ ...project, marginMm: newMargin })
    setTimeout(() => handleAutoArrange(), 0)
  }

  function addPage() {
    if (!project) return
    const newPage: SheetPage = {
      id: `page-${project.pages.length + 1}`,
      elements: [],
      orientation: currentPage ? pageOrientation(currentPage) : undefined,
    }
    setProject({ ...project, pages: [...project.pages, newPage] })
    setCurrentPageIdx(project.pages.length)
  }

  function deletePage(idx: number) {
    if (!project || project.pages.length <= 1) return
    const next = project.pages.filter((_, i) => i !== idx)
    setProject({ ...project, pages: next })
    setCurrentPageIdx(Math.min(idx, next.length - 1))
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const useIndexedDB = typeof window !== 'undefined' && window.indexedDB
    files.forEach((file) => {
      const id = generateId()
      // save raw blob to IndexedDB
      if (useIndexedDB) {
        saveImageBlob(id, file).catch(() => {})
      }

      // read as dataUrl for Image() to get natural dimensions
      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.onload = () => {
          const objectUrl = useIndexedDB ? URL.createObjectURL(file) : (reader.result as string)
          const newImage: UploadedImage = {
            id,
            name: file.name,
            dataUrl: objectUrl,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
          }
          if (useIndexedDB) {
            imageUrlsRef.current[id] = objectUrl
          }
          setUploadedImages((prev) => [...prev, newImage])
        }
        img.src = reader.result as string
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  async function handleOcr(imageId: string) {
    const img = uploadedImages.find((i) => i.id === imageId)
    if (!img) return
    setOcrLoading(true)
    try {
      const blob = await loadImageBlob(imageId)
      if (!blob) throw new Error('이미지를 불러올 수 없습니다.')
      const rawBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(blob)
      })
      const processedBase64 = await preprocessImage(rawBase64)
      const res = await fetch('/api/conti/songs/extract-vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: processedBase64 }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'OCR 분석에 실패했습니다.')
      setOcrResult({
        title: json.data.title,
        artist: json.data.artist,
        originalKey: json.data.original_key,
        lyrics: json.data.lyrics,
        chordData: json.data.chord_data || [],
        alignedPreview: json.data.aligned_preview || '',
      })
    } catch (err: any) {
      alert(err.message || 'OCR 분석 중 오류가 발생했습니다.')
    } finally {
      setOcrLoading(false)
    }
  }

  async function handleOcrSave(data: {
    title: string
    artist: string
    originalKey: string
    lyrics: string
    chordData: ChordPlacement[][]
    alignedPreview: string
  }) {
    try {
      const songRes = await fetch('/api/conti/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          artist: data.artist || null,
          original_key: data.originalKey || null,
          lyrics: data.lyrics,
          chords: JSON.stringify(data.chordData),
          source: 'image',
          category: 'CCM',
        }),
      })
      const songJson = await songRes.json()
      if (!songJson.success) throw new Error(songJson.error || '곡 저장에 실패했습니다.')

      await fetch(`/api/conti/${conti.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ song_id: songJson.data.id }),
      })

      setOcrResult(null)
      setOcrToast('OCR 완료')
      setTimeout(() => setOcrToast(null), 3000)
    } catch (err: any) {
      alert(err.message || '저장 중 오류가 발생했습니다.')
    }
  }

  function addImageToCanvas(imageId: string) {
    if (!project || !currentPage) return
    const img = uploadedImages.find((i) => i.id === imageId)
    if (!img) return

    const isPortrait = pageOrientation(currentPage) === 'portrait'
    const canvasW = (isPortrait ? 210 : 297) * SCALE_FACTOR
    const canvasH = (isPortrait ? 297 : 210) * SCALE_FACTOR

    const maxW = canvasW * 0.88
    const maxH = canvasH * 0.78
    const aspect = img.naturalWidth / img.naturalHeight

    let w = maxW
    let h = w / aspect
    if (h > maxH) {
      h = maxH
      w = h * aspect
    }

    const newEl: CanvasElementData = {
      id: generateId(),
      type: 'image',
      x: (canvasW - w) / 2,
      y: (canvasH - h) / 2,
      width: w,
      height: h,
      rotation: 0,
      imageId,
    }

    const updatedPages = [...project.pages]
    updatedPages[currentPageIdx] = {
      ...currentPage,
      elements: [...currentPage.elements, newEl],
    }
    setProject({ ...project, pages: updatedPages })
    setSelectedElementId(newEl.id)
  }

  function handleAddText() {
    if (!project || !currentPage) return
    const isPortrait = pageOrientation(currentPage) === 'portrait'
    const canvasW = (isPortrait ? 210 : 297) * SCALE_FACTOR
    const canvasH = (isPortrait ? 297 : 210) * SCALE_FACTOR
    const w = 200
    const h = 50
    const newEl: CanvasElementData = {
      id: generateId(),
      type: 'text',
      x: (canvasW - w) / 2,
      y: (canvasH - h) / 2,
      width: w,
      height: h,
      rotation: 0,
      text: '텍스트 입력',
      fontSize: 16,
    }
    const updatedPages = [...project.pages]
    updatedPages[currentPageIdx] = {
      ...currentPage,
      elements: [...currentPage.elements, newEl],
    }
    setProject({ ...project, pages: updatedPages })
    setSelectedElementId(newEl.id)
  }

  function handleGenerateChordChart(item: ContiItem) {
    if (!project || !currentPage) return
    const song = item.song
    if (!song?.lyrics) return

    const lyricLines = song.lyrics.split('\n')
    const chordLines: string[] = (() => {
      if (!song.chords) return []
      try {
        const parsed = JSON.parse(song.chords)
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
          return parsed.map((line: ChordPlacement[]) => {
            if (!line.length) return ''
            return line.map((p) => p.chord).join(' - ')
          })
        }
      } catch {}
      return song.chords.split('\n')
    })()
    const isPortrait = pageOrientation(currentPage) === 'portrait'
    const canvasW = (isPortrait ? 210 : 297) * SCALE_FACTOR
    const margin = (project.marginMm ?? 3) * SCALE_FACTOR
    const contentW = canvasW - margin * 2

    let chartText = `${song.title}`
    if (song.original_key) chartText += `  ·  ${song.original_key}`
    chartText += '\n\n'

    for (let i = 0; i < lyricLines.length; i++) {
      const lyric = lyricLines[i]
      const chord = chordLines[i] || ''
      if (!lyric && !chord) { chartText += '\n'; continue }
      if (chord) chartText += chord + '\n'
      chartText += lyric + '\n'
    }

    const lineCount = chartText.split('\n').length
    const lineHeight = 11 * 1.5
    const estHeight = Math.min(lineCount * lineHeight + 40, (isPortrait ? 297 : 210) * SCALE_FACTOR - margin * 2)

    const newEl: CanvasElementData = {
      id: generateId(),
      type: 'text',
      x: margin,
      y: margin + (currentPage.elements.length * 20),
      width: contentW,
      height: estHeight,
      rotation: 0,
      text: chartText,
      fontSize: 11,
      songId: song.id,
    }

    const updatedPages = [...project.pages]
    updatedPages[currentPageIdx] = {
      ...currentPage,
      elements: [...currentPage.elements, newEl],
    }
    setProject({ ...project, pages: updatedPages })
    setSelectedElementId(newEl.id)
  }

  function updateElement(id: string, updates: Partial<CanvasElementData>) {
    if (!project || !currentPage) return
    const updated = currentPage.elements.map((el) =>
      el.id === id ? { ...el, ...updates } : el
    )
    const pages = [...project.pages]
    pages[currentPageIdx] = { ...currentPage, elements: updated }
    setProject({ ...project, pages })
  }

  function deleteElement(id: string) {
    if (!project || !currentPage) return
    const updated = currentPage.elements.filter((el) => el.id !== id)
    const pages = [...project.pages]
    pages[currentPageIdx] = { ...currentPage, elements: updated }
    setProject({ ...project, pages })
    if (selectedElementId === id) setSelectedElementId(null)
  }

  // 이미지 클릭 시 그 위치에서 즉시 분할
  function handleSplit(id: string, splitAt: number) {
    if (!project || !currentPage) return
    const el = currentPage.elements.find((e) => e.id === id)
    if (!el || el.type !== 'image') return
    const cropTop = el.cropTop || 0
    const cropBottom = el.cropBottom || 0
    const visibleRange = 100 - cropTop - cropBottom
    if (visibleRange <= 0) return
    const relSplit = Math.min(Math.max((splitAt - cropTop) / visibleRange, 0.05), 0.95)

    const topPart: CanvasElementData = {
      ...el,
      id: generateId(),
      height: el.height * relSplit,
    }

    const botPart: CanvasElementData = {
      ...el,
      id: generateId(),
      y: el.y + topPart.height + 2,
      cropTop: splitAt,
      height: el.height * (1 - relSplit),
    }

    const updated = currentPage.elements.map((e) =>
      e.id === el.id ? topPart : e
    )
    updated.push(botPart)

    const pages = [...project.pages]
    pages[currentPageIdx] = { ...currentPage, elements: updated }
    setProject({ ...project, pages })
    setSelectedElementId(topPart.id)
    setCropMode(false)
  }

  function handleAutoArrange() {
    if (!project || !currentPage) return
    const imgEls = currentPage.elements.filter((el) => el.type === 'image')
    if (imgEls.length === 0) return

    const isPortrait = pageOrientation(currentPage) === 'portrait'
    const canvasW = (isPortrait ? 210 : 297) * SCALE_FACTOR
    const canvasH = (isPortrait ? 297 : 210) * SCALE_FACTOR
    const margin = (project.marginMm ?? 3) * SCALE_FACTOR
    const availableW = canvasW - margin * 2
    const availableH = canvasH - margin * 2
    const gap = (project.marginMm ?? 3) * 0.5 * SCALE_FACTOR

    function getBestFit(slotW: number, slotH: number) {
      return (el: CanvasElementData) => {
        const img = uploadedImages.find((i) => i.id === el.imageId)
        const aspect = img && img.naturalWidth && img.naturalHeight
          ? img.naturalWidth / img.naturalHeight : 1
        let w = slotW, h = w / aspect
        if (h > slotH) {
          h = slotH
          w = h * aspect
        }
        return { ...el, calcW: w, calcH: h }
      }
    }

    if (isPortrait) {
      const cols = imgEls.length <= 2 ? 1 : 2
      const colW = (availableW - gap * (cols - 1)) / cols
      const sized = imgEls.map(getBestFit(colW, availableH))
      let totalH = 0
      for (let i = 0; i < sized.length; i += cols) {
        const rowH = Math.max(...sized.slice(i, i + cols).map((e) => e.calcH))
        totalH += (i > 0 ? gap : 0) + rowH
      }
      const scale = totalH > availableH ? availableH / totalH : 1

      // Pre-calculate row Y positions and item sizes
      const rowLayouts: { y: number; ids: string[] }[] = []
      const itemSizes = new Map<string, { w: number; h: number }>()
      let yPos = margin, ri = 0

      while (ri < sized.length) {
        const rowItems = sized.slice(ri, ri + cols)
        const rowY = yPos
        const rowIds: string[] = []
        let rowItemH = 0
        for (const item of rowItems) {
          const w = item.calcW * scale
          const h = item.calcH * scale
          itemSizes.set(item.id, { w, h })
          rowIds.push(item.id)
          rowItemH = Math.max(rowItemH, h)
        }
        rowLayouts.push({ y: rowY, ids: rowIds })
        yPos += rowItemH + gap * scale
        ri += cols
      }

      const updated = currentPage.elements.map((el) => {
        if (el.type !== 'image') return el
        const size = itemSizes.get(el.id)
        if (!size) return el
        const row = rowLayouts.find((r) => r.ids.includes(el.id))
        if (!row) return el
        const rowW = row.ids.reduce((sum, id, i) => {
          const s = itemSizes.get(id)!
          return sum + (i > 0 ? gap * scale : 0) + s.w
        }, 0)
        let sx = (canvasW - rowW) / 2
        for (const id of row.ids) {
          if (id === el.id) break
          sx += itemSizes.get(id)!.w + gap * scale
        }
        return {
          ...el, x: sx, y: row.y,
          width: size.w, height: size.h,
          cropTop: 0, cropBottom: 0, rotation: 0,
        }
      })

      setProject((prev) => {
        if (!prev) return prev
        const pages = [...prev.pages]
        pages[currentPageIdx] = { ...pages[currentPageIdx], elements: updated }
        return { ...prev, pages }
      })
    } else {
      const colW = (availableW - gap) / 2
      const sized = imgEls.map(getBestFit(colW, availableH))
      const nonImages = currentPage.elements.filter((el) => el.type !== 'image')

      function placePair(items: Array<CanvasElementData & { calcW: number; calcH: number }>) {
        const rowH = Math.max(...items.map((e) => e.calcH), 0)
        const scale = rowH > availableH ? availableH / rowH : 1
        const totalW = items.reduce((sum, item, i) => sum + (i > 0 ? gap * scale : 0) + item.calcW * scale, 0)
        let x = (canvasW - totalW) / 2
        return items.map((item) => {
          const w = item.calcW * scale
          const h = item.calcH * scale
          const result: CanvasElementData = {
            ...item, x, y: margin, width: w, height: h,
            cropTop: 0, cropBottom: 0, rotation: 0,
          }
          x += w + gap * scale
          return result
        })
      }

      const pages = [...project.pages]

      const firstPair = sized.slice(0, 2)
      const firstPlaced = placePair(firstPair)
      pages[currentPageIdx] = { ...pages[currentPageIdx], elements: [...nonImages, ...firstPlaced] }

      for (let i = 2; i < sized.length; i += 2) {
        const pair = sized.slice(i, i + 2)
        const placed = placePair(pair)
        pages.push({ id: `page-${pages.length + 1}`, elements: placed })
      }

      setProject((prev) => prev ? { ...prev, pages } : prev)
    }
  }

  function exportPdf() {
    if (!canvasRef.current) return
    setCropMode(false)
    setTimeout(() => {
      import('html2canvas').then(({ default: html2canvas }) => {
        import('jspdf').then(({ jsPDF }) => {
          const pages = project!.pages
          const firstOrient = pageOrientation(pages[0]) === 'landscape' ? 'l' : 'p'
          const pdf = new jsPDF(firstOrient, 'mm', 'a4')

          const renderNext = (idx: number) => {
            if (idx >= pages.length) {
              pdf.save(`${conti.title}_악보.pdf`)
              return
            }
            setCurrentPageIdx(idx)
            setTimeout(() => {
              if (!canvasRef.current) { renderNext(idx + 1); return }
              html2canvas(canvasRef.current, {
                scale: 2, useCORS: true, backgroundColor: '#ffffff',
              }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png')
                if (idx > 0) {
                  const orient = pageOrientation(pages[idx]) === 'landscape' ? 'l' : 'p'
                  pdf.addPage([297, 210], orient)
                }
                const orient = pageOrientation(pages[idx]) === 'landscape' ? 'l' : 'p'
                const pdfW = orient === 'l' ? 297 : 210
                const pdfH = orient === 'l' ? 210 : 297
                pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH)
                renderNext(idx + 1)
              })
            }, 400)
          }
          renderNext(0)
        })
      })
    }, 100)
  }

  function deleteUploadedImage(id: string) {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id))
    // clean up IndexedDB
    deleteImageBlob(id).catch(() => {})
    // revoke object URL
    const url = imageUrlsRef.current[id]
    if (url) {
      URL.revokeObjectURL(url)
      delete imageUrlsRef.current[id]
    }
    // also remove from canvas elements
    if (!project || !currentPage) return
    const filtered = currentPage.elements.filter((el) => el.imageId !== id)
    const pages = [...project.pages]
    pages[currentPageIdx] = { ...currentPage, elements: filtered }
    setProject({ ...project, pages })
  }

  function exitCropMode() {
    setCropMode(false)
  }

  if (!project) return null

  return (
    <div className="flex flex-col w-full h-full bg-[#03050c] relative">
      {/* ─── 툴바 ─── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-[#0a0f1f] flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
          <h1 className="text-[15px] font-bold text-white">콘티 제작</h1>
          <span className="text-[11px] text-slate-500">{conti.title}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* 자르기 모드 토글 (이미지 요소 선택 시 활성화) */}
          {selectedElement?.type === 'image' && !cropMode && (
            <button
              onClick={() => setCropMode(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-[11px] font-bold transition-colors border border-amber-500/30"
            >
              <Scissors className="w-3.5 h-3.5" />
              자르기
            </button>
          )}
          {cropMode && (
            <button
              onClick={exitCropMode}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-bold transition-colors border border-white/10"
            >
              취소
            </button>
          )}

          {!cropMode && (
            <button
              onClick={handleAutoArrange}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-bold transition-colors border border-white/10"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              자동 배열
            </button>
          )}



          {/* 줌 */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg px-1.5 py-1 border border-white/10">
            <button onClick={() => setZoom((z) => Math.max(30, z - 10))} className="p-1 rounded hover:bg-white/10 text-slate-400">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-bold text-slate-300 w-10 text-center">{zoom}%</span>
            <button onClick={() => setZoom((z) => Math.min(200, z + 10))} className="p-1 rounded hover:bg-white/10 text-slate-400">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setZoom(80)} className="p-1 rounded hover:bg-white/10 text-slate-500" title="원래대로">
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* PDF */}
          <button
            onClick={exportPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[11px] font-extrabold transition-colors shadow-md shadow-indigo-600/30"
          >
            <Download className="w-3.5 h-3.5" />
            PDF 내보내기
          </button>
        </div>
      </div>

      {/* ─── 본문 ─── */}
      <div className="flex-1 flex min-h-0">
        {/* 왼쪽: 이미지 불러오기 */}
        <div className="w-56 flex-shrink-0 border-r border-white/10 bg-[#080d1a] flex flex-col">
          <div className="p-3 border-b border-white/5">
            <label className="flex items-center justify-center gap-1.5 px-3 py-3 rounded-lg border-2 border-dashed border-white/20 hover:border-indigo-400/50 cursor-pointer transition-colors text-slate-400 hover:text-indigo-300">
              <FolderOpen className="w-4 h-4" />
              <span className="text-[11px] font-bold">악보 불러오기</span>
              <input type="file" accept="image/*" multiple onChange={handleImport} className="hidden" />
            </label>
          </div>

          <div className="p-2 border-b border-white/5">
            <button
              onClick={handleAddText}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border-2 border-dashed border-white/20 hover:border-indigo-400/50 cursor-pointer transition-colors text-slate-400 hover:text-indigo-300 w-full"
            >
              <Type className="w-4 h-4" />
              <span className="text-[11px] font-bold">텍스트 추가</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {uploadedImages.length === 0 ? (
              <p className="text-[10px] text-slate-600 text-center py-6">
                불러온 악보가 없습니다.<br />
                이미지를 드래그하거나<br />
                위 버튼으로 선택하세요.
              </p>
            ) : uploadedImages.map((img) => {
              const isHovered = hoveredImgId === img.id
              return (
                <div
                  key={img.id}
                  className="relative rounded-lg overflow-hidden border border-white/10 bg-white/5"
                  onMouseEnter={() => setHoveredImgId(img.id)}
                  onMouseLeave={() => setHoveredImgId(null)}
                >
                  <button
                    onClick={() => addImageToCanvas(img.id)}
                    className="w-full aspect-[3/4] overflow-hidden"
                  >
                    <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </button>
                  {isHovered && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOcr(img.id) }}
                      disabled={ocrLoading}
                      className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-indigo-600/80 hover:bg-indigo-500 disabled:bg-slate-600/50 text-white text-[9px] font-extrabold transition-all z-10 flex items-center gap-1"
                    >
                      <Scan className="w-2.5 h-2.5" />
                      {ocrLoading ? '...' : 'OCR'}
                    </button>
                  )}
                  <div className="p-1.5 flex items-center justify-between">
                    <span className="text-[9px] text-slate-500 truncate flex-1">{img.name}</span>
                    {isHovered && (
                      <button
                        onClick={() => deleteUploadedImage(img.id)}
                        className="p-0.5 rounded hover:bg-white/10 text-slate-500 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 중앙: A4 캔버스 */}
        <div className="flex-1 overflow-auto bg-[#050814] p-6">
          <div className="min-h-full flex items-start justify-center">
            {currentPage && (
              <A4Canvas
                ref={canvasRef}
                page={currentPage}
                orientation={pageOrientation(currentPage)}
                zoom={zoom}
                selectedElementId={selectedElementId}
                uploadedImages={uploadedImages}
                cropMode={cropMode}
                onSelectElement={setSelectedElementId}
                onUpdateElement={updateElement}
                onDeleteElement={deleteElement}
                onSplitElement={cropMode ? handleSplit : undefined}
              />
            )}
          </div>
        </div>

        {/* 오른쪽: 페이지 네비게이터 */}
        <div className="w-48 flex-shrink-0 border-l border-white/10 bg-[#080d1a] flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-300">페이지</span>
              <div className="flex items-center gap-0.5 bg-white/5 rounded-md p-0.5 border border-white/10">
                <button
                  onClick={() => handleOrientationChange('portrait')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                    currentPage && pageOrientation(currentPage) === 'portrait'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >세로</button>
                <button
                  onClick={() => handleOrientationChange('landscape')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                    currentPage && pageOrientation(currentPage) === 'landscape'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >가로</button>
              </div>
            </div>
            <button
              onClick={addPage}
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-[10px] font-bold transition-colors"
            >
              <Plus className="w-2.5 h-2.5" /> 추가
            </button>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5">
            <span className="text-[10px] text-slate-400">여백</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleMarginChange(-1)}
                className="w-5 h-5 rounded flex items-center justify-center text-[11px] font-bold bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/10"
              >−</button>
              <span className="text-[11px] font-bold text-slate-300 w-8 text-center">{project.marginMm ?? 3}mm</span>
              <button
                onClick={() => handleMarginChange(1)}
                className="w-5 h-5 rounded flex items-center justify-center text-[11px] font-bold bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/10"
              >+</button>
            </div>
          </div>
          {selectedElement?.type === 'text' && (
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5">
              <span className="text-[10px] text-slate-400">글자 크기</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const fs = Math.max(8, (selectedElement.fontSize || 16) - 2)
                    updateElement(selectedElement.id, { fontSize: fs })
                  }}
                  className="w-5 h-5 rounded flex items-center justify-center text-[11px] font-bold bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/10"
                >−</button>
                <span className="text-[11px] font-bold text-slate-300 w-8 text-center">{selectedElement.fontSize || 16}</span>
                <button
                  onClick={() => {
                    const fs = Math.min(72, (selectedElement.fontSize || 16) + 2)
                    updateElement(selectedElement.id, { fontSize: fs })
                  }}
                  className="w-5 h-5 rounded flex items-center justify-center text-[11px] font-bold bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/10"
                >+</button>
              </div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {project.pages.map((page, idx) => {
              const isActive = idx === currentPageIdx
              return (
                <div
                  key={page.id}
                  onClick={() => setCurrentPageIdx(idx)}
                  className={`cursor-pointer rounded-lg border overflow-hidden transition-all group ${
                    isActive
                      ? 'border-indigo-400/60 ring-1 ring-indigo-400/30'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className={`${pageOrientation(page) === 'portrait' ? 'aspect-[210/297]' : 'aspect-[297/210]'} bg-white relative overflow-hidden`}>
                    {(() => {
                      const cw = (pageOrientation(page) === 'portrait' ? 210 : 297) * SCALE_FACTOR
                      const ch = (pageOrientation(page) === 'portrait' ? 297 : 210) * SCALE_FACTOR
                      const images = page.elements.filter(el => el.type === 'image')
                      if (images.length === 0) {
                        return <div className="absolute inset-0 flex items-center justify-center"><span className="text-[8px] text-slate-300">빈 페이지</span></div>
                      }
                      return (
                        <svg viewBox={`0 0 ${cw} ${ch}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full">
                          {images.map(el => {
                            const imgData = el.imageId ? uploadedImages.find(i => i.id === el.imageId)?.dataUrl : undefined
                            if (!imgData) return null
                            return <image key={el.id} href={imgData} x={el.x} y={el.y} width={el.width} height={el.height} preserveAspectRatio="xMidYMid slice" />
                          })}
                        </svg>
                      )
                    })()}
                  </div>
                  <div className="flex items-center justify-between px-1.5 py-1 bg-white/5">
                    <span className={`text-[9px] font-medium truncate ${isActive ? 'text-indigo-300' : 'text-slate-500'}`}>
                      {(() => {
                        const songEl = page.elements.find(el => el.songId)
                        const songItem = songEl ? items.find(i => i.song?.id === songEl.songId) : undefined
                        if (songItem?.song) return `${items.indexOf(songItem) + 1}. ${songItem.song.title}`
                        return page.id
                      })()}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deletePage(idx) }}
                      className={`flex items-center gap-0.5 p-0.5 rounded transition-all ${
                        project.pages.length <= 1
                          ? 'opacity-0'
                          : 'opacity-0 group-hover:opacity-100 text-red-400/70 hover:text-red-300'
                      }`}
                      disabled={project.pages.length <= 1}
                    >
                      <Trash2 className="w-3 h-3" />
                      <span className="text-[8px]">삭제</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* OCR 로딩 오버레이 */}
      {ocrLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 bg-[#0d1225] border border-white/10 rounded-2xl px-8 py-6 shadow-2xl">
            <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-[13px] text-slate-300 font-medium">악보 분석 중...</p>
            <p className="text-[11px] text-slate-500">잠시만 기다려주세요</p>
          </div>
        </div>
      )}

      {/* OCR 리뷰 모달 */}
      {ocrResult && (
        <OcrReviewModal
          title={ocrResult.title}
          artist={ocrResult.artist}
          originalKey={ocrResult.originalKey}
          lyrics={ocrResult.lyrics}
          chordData={ocrResult.chordData}
          alignedPreview={ocrResult.alignedPreview}
          onCancel={() => setOcrResult(null)}
          onSave={handleOcrSave}
        />
      )}

      {/* OCR 완료 토스트 */}
      {ocrToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[13px] font-bold shadow-lg backdrop-blur-md animate-fade-in">
          {ocrToast}
        </div>
      )}

      {/* 분할 모드 안내 */}
      {cropMode && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-amber-600/30 border border-amber-500/40 text-amber-200 text-[11px] font-medium backdrop-blur-md shadow-lg">
          원하는 위치에 마우스를 올리고 클릭하면 그 자리에서 분할됩니다
        </div>
      )}
    </div>
  )
}
