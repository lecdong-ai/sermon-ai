export const PAGE_SIZES: Record<string, { widthMm: number; heightMm: number; label: string; orientation?: 'portrait' | 'landscape' }> = {
  A4Landscape: { widthMm: 297, heightMm: 210, label: 'A4 가로 (297×210mm)', orientation: 'landscape' },
  A4Portrait: { widthMm: 210, heightMm: 297, label: 'A4 세로 (210×297mm)', orientation: 'portrait' },
  'iPad Pro 12.9': { widthMm: 215, heightMm: 280, label: 'iPad Pro 12.9 (215×280mm)' },
  'Tablet (iPad 4:3)': { widthMm: 195, heightMm: 260, label: 'iPad / Tablet (195×260mm)' },
  A5: { widthMm: 148, heightMm: 210, label: 'A5 (148×210mm)' },
  B5: { widthMm: 176, heightMm: 250, label: 'B5 (176×250mm)' },
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
