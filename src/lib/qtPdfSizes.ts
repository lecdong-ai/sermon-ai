export const PAGE_SIZES: Record<string, { widthMm: number; heightMm: number; label: string; orientation?: 'portrait' | 'landscape' }> = {
  A4Landscape: { widthMm: 297, heightMm: 210, label: 'A4 가로 (297×210mm)', orientation: 'landscape' },
  A4Portrait: { widthMm: 210, heightMm: 297, label: 'A4 세로 (210×297mm)', orientation: 'portrait' },
  B5Landscape: { widthMm: 250, heightMm: 176, label: 'B5 가로 (250×176mm)', orientation: 'landscape' },
  B5Portrait: { widthMm: 176, heightMm: 250, label: 'B5 세로 (176×250mm)', orientation: 'portrait' },
  A5Landscape: { widthMm: 210, heightMm: 148, label: 'A5 가로 (210×148mm)', orientation: 'landscape' },
  A5Portrait: { widthMm: 148, heightMm: 210, label: 'A5 세로 (148×210mm)', orientation: 'portrait' },
  'iPad Pro 12.9 Landscape': { widthMm: 280, heightMm: 215, label: 'iPad Pro 가로 (280×215mm)', orientation: 'landscape' },
  'Tablet (iPad 4:3)': { widthMm: 195, heightMm: 260, label: 'iPad / Tablet (195×260mm)', orientation: 'portrait' },
}

export interface PdfRenderProfile {
  pixelRatio: number
  jpegQuality: number
}

const IPAD_SIZE_OPTIONS = new Set([
  'iPad Pro 12.9 Landscape',
  'Tablet (iPad 4:3)',
])

export function getPdfRenderProfile(sizeOption: string): PdfRenderProfile {
  if (IPAD_SIZE_OPTIONS.has(sizeOption)) {
    return {
      // 1.5x keeps text and ruled lines sharp on-screen without the cost of print DPI.
      pixelRatio: 1.5,
      jpegQuality: 0.86,
    }
  }

  return {
    pixelRatio: 2,
    jpegQuality: 0.92,
  }
}

export function getPageSizePx(sizeOption: string): { width: number; height: number } {
  const s = PAGE_SIZES[sizeOption] || PAGE_SIZES['A4Landscape']
  const dpi = 2
  const pxPerMm = dpi * 11.811
  return {
    width: Math.round(s.widthMm * pxPerMm),
    height: Math.round(s.heightMm * pxPerMm),
  }
}
