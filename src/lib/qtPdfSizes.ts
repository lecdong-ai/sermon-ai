export const PAGE_SIZES: Record<string, { widthMm: number; heightMm: number; label: string }> = {
  'iPad Pro 12.9': { widthMm: 215, heightMm: 280, label: 'iPad Pro 12.9 (215×280mm)' },
  'Tablet (iPad 4:3)': { widthMm: 195, heightMm: 260, label: 'iPad / Tablet (195×260mm)' },
  A4: { widthMm: 210, heightMm: 297, label: 'A4 (210×297mm)' },
  B5: { widthMm: 176, heightMm: 250, label: 'B5 (176×250mm)' },
  A5: { widthMm: 148, heightMm: 210, label: 'A5 (148×210mm)' },
}

export function getPageSizePx(sizeOption: string): { width: number; height: number } {
  const s = PAGE_SIZES[sizeOption] || PAGE_SIZES['A4']
  const dpi = 2
  const pxPerMm = dpi * 11.811
  return {
    width: Math.round(s.widthMm * pxPerMm),
    height: Math.round(s.heightMm * pxPerMm),
  }
}
