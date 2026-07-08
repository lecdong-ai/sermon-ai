import PptxGenJS from 'pptxgenjs'
import type { PptSlide, PptTextStyle, PptSlideTextPosition } from '@/types'

interface ThemeColors {
  primary: string
  secondary: string
  background: string
  text: string
  accent: string
}

const THEMES: Record<string, ThemeColors> = {
  modern: {
    primary: '1B3A5C',
    secondary: '4A90D9',
    background: 'FFFFFF',
    text: '1A1A2E',
    accent: 'E8F0FE',
  },
  warm: {
    primary: '8D7A5B',
    secondary: 'C4A882',
    background: 'FDF8F0',
    text: '2C2A29',
    accent: 'F5EDE0',
  },
  classic: {
    primary: '6B2737',
    secondary: 'C9A84C',
    background: 'FAFAF5',
    text: '1A1A2E',
    accent: 'F0E6D3',
  },
}

function getTheme(themeName: string): ThemeColors {
  return THEMES[themeName] || THEMES.modern
}

function getSlideColors(slide: PptSlide, theme: ThemeColors) {
  return {
    primary: slide.color?.primary || theme.primary,
    accent: slide.color?.accent || theme.secondary,
    background: slide.color?.background || theme.background,
  }
}

function isDarkColor(hex: string): boolean {
  const h = hex.replace('#', '')
  if (h.length !== 6) return false
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum < 0.5
}

// ─── 텍스트 스타일 병합 유틸 (사용자 편집값 → 기본값 폴백) ────

const DEFAULT_FONT = 'Malgun Gothic'

/** 레이아웃별 제목 기본 스타일 */
function defaultTitleStyle(layout: string, textColor: string): PptTextStyle {
  const sizeMap: Record<string, number> = {
    'title': 36, 'closing': 32, 'section-header': 36, 'quote': 22,
    'bullets': 24, 'two-column': 24, 'vs-contrast': 24, 'timeline-flow': 24,
    'central-focus': 24, 'grid-matrix': 24,
  }
  const alignMap: Record<string, 'left' | 'center'> = {
    'title': 'center', 'closing': 'center', 'section-header': 'center', 'quote': 'left',
  }
  return {
    fontFace: DEFAULT_FONT,
    fontSize: sizeMap[layout] || 24,
    bold: true,
    italic: false,
    underline: false,
    color: textColor,
    align: alignMap[layout] || 'left',
    valign: 'middle',
    lineSpacing: 1.2,
  }
}

/** 레이아웃별 본문 기본 스타일 */
function defaultBodyStyle(layout: string, textColor: string): PptTextStyle {
  const sizeMap: Record<string, number> = {
    'title': 18, 'closing': 16, 'section-header': 15, 'quote': 17,
    'bullets': 16, 'two-column': 14, 'vs-contrast': 12, 'timeline-flow': 12,
    'central-focus': 14, 'grid-matrix': 12,
  }
  const alignMap: Record<string, 'left' | 'center'> = {
    'title': 'center', 'closing': 'center', 'section-header': 'center', 'quote': 'left',
  }
  return {
    fontFace: DEFAULT_FONT,
    fontSize: sizeMap[layout] || 16,
    bold: false,
    italic: layout === 'quote',
    underline: false,
    color: textColor,
    align: alignMap[layout] || 'left',
    valign: 'top',
    lineSpacing: 1.5,
  }
}

/** 사용자 스타일 + 기본 스타일 병합 (사용자값 우선) */
function mergeStyle(user: PptTextStyle | undefined, fallback: PptTextStyle): PptTextStyle {
  if (!user) return fallback
  return {
    fontFace: user.fontFace || fallback.fontFace,
    fontSize: user.fontSize ?? fallback.fontSize,
    bold: user.bold ?? fallback.bold,
    italic: user.italic ?? fallback.italic,
    underline: user.underline ?? fallback.underline,
    color: user.color || fallback.color,
    align: user.align || fallback.align,
    valign: user.valign || fallback.valign,
    lineSpacing: user.lineSpacing ?? fallback.lineSpacing,
  }
}

/** PptTextStyle → pptxgenjs addText 옵션 변환 */
function textOptions(
  style: PptTextStyle,
  pos: PptSlideTextPosition | undefined,
  fallbackPos: { x: number; y: number; w: number; h: number },
): PptxGenJS.TextPropsOptions {
  return {
    x: pos?.x ?? fallbackPos.x,
    y: pos?.y ?? fallbackPos.y,
    w: pos?.w ?? fallbackPos.w,
    h: pos?.h ?? fallbackPos.h,
    fontSize: style.fontSize,
    fontFace: style.fontFace,
    color: style.color,
    bold: style.bold,
    italic: style.italic,
    underline: style.underline ? { style: 'sng' } : undefined,
    align: style.align as any,
    valign: style.valign as any,
    lineSpacingMultiple: style.lineSpacing,
  }
}

// ─── 텍스트 전용 렌더러 ─────────────────────

function addTitleSlide(pres: PptxGenJS, slide: PptSlide, theme: ThemeColors): void {
  const s = pres.addSlide()
  const colors = getSlideColors(slide, theme)
  s.background = { color: colors.primary }
  const tStyle = mergeStyle(slide.titleStyle, defaultTitleStyle('title', 'FFFFFF'))
  const bStyle = mergeStyle(slide.bodyStyle, defaultBodyStyle('title', 'FFFFFF'))
  s.addText(slide.title, textOptions(tStyle, slide.titlePosition, { x: 0.5, y: 1.5, w: 9, h: 2 }))
  if (slide.content.length > 0) {
    s.addText(slide.content.join('\n'), textOptions(bStyle, slide.bodyPosition, { x: 1, y: 3.8, w: 8, h: 2 }))
  }
}

function addBulletsSlide(pres: PptxGenJS, slide: PptSlide, theme: ThemeColors): void {
  const s = pres.addSlide()
  const colors = getSlideColors(slide, theme)
  s.background = { color: colors.background }
  const tStyle = mergeStyle(slide.titleStyle, defaultTitleStyle('bullets', colors.primary))
  const bStyle = mergeStyle(slide.bodyStyle, defaultBodyStyle('bullets', theme.text))
  s.addText(slide.title, textOptions(tStyle, slide.titlePosition, { x: 0.5, y: 0.3, w: 9, h: 0.8 }))
  s.addText(slide.content.map((c) => `• ${c}`).join('\n'), {
    ...textOptions(bStyle, slide.bodyPosition, { x: 0.7, y: 1.3, w: 8.6, h: 4.5 }),
    paraSpaceAfter: 8,
  })
  s.addShape(pres.ShapeType.line, {
    x: 0.5, y: 1.15, w: 9, h: 0,
    line: { color: colors.accent, width: 2 },
  })
}

function addSectionHeaderSlide(pres: PptxGenJS, slide: PptSlide, theme: ThemeColors): void {
  const s = pres.addSlide()
  const colors = getSlideColors(slide, theme)
  s.background = { color: colors.accent }
  const tStyle = mergeStyle(slide.titleStyle, defaultTitleStyle('section-header', colors.primary))
  s.addText(slide.title, textOptions(tStyle, slide.titlePosition, { x: 0.5, y: 1.5, w: 9, h: 3 }))
}

function addQuoteSlide(pres: PptxGenJS, slide: PptSlide, theme: ThemeColors): void {
  const s = pres.addSlide()
  const colors = getSlideColors(slide, theme)
  s.background = { color: colors.accent }
  s.addShape(pres.ShapeType.rect, {
    x: 0.8, y: 0.6, w: 0.08, h: 5,
    fill: { color: colors.primary },
  })
  const quoteText = slide.content.map((c) => `"${c}"`).join('\n\n')
  const tStyle = mergeStyle(slide.titleStyle, defaultTitleStyle('quote', colors.primary))
  const bStyle = mergeStyle(slide.bodyStyle, defaultBodyStyle('quote', theme.text))
  s.addText(`❝\n${slide.title}`, textOptions(tStyle, slide.titlePosition, { x: 1.2, y: 0.5, w: 7.5, h: 1 }))
  s.addText(quoteText, textOptions(bStyle, slide.bodyPosition, { x: 1.2, y: 1.5, w: 7.5, h: 4 }))
}

function addClosingSlide(pres: PptxGenJS, slide: PptSlide, theme: ThemeColors): void {
  const s = pres.addSlide()
  const colors = getSlideColors(slide, theme)
  s.background = { color: colors.primary }
  const tStyle = mergeStyle(slide.titleStyle, defaultTitleStyle('closing', 'FFFFFF'))
  const bStyle = mergeStyle(slide.bodyStyle, defaultBodyStyle('closing', 'FFFFFF'))
  s.addText(slide.title || '은혜가 함께 하시길', textOptions(tStyle, slide.titlePosition, { x: 0.5, y: 1.5, w: 9, h: 1.5 }))
  if (slide.content.length > 0) {
    s.addText(slide.content.join('\n'), textOptions(bStyle, slide.bodyPosition, { x: 1, y: 3.5, w: 8, h: 2.5 }))
  }
}

const LAYOUT_RENDERERS: Record<string, (pres: PptxGenJS, slide: PptSlide, theme: ThemeColors) => void> = {
  'title': addTitleSlide,
  'bullets': addBulletsSlide,
  'section-header': addSectionHeaderSlide,
  'quote': addQuoteSlide,
  'closing': addClosingSlide,
}



export async function generatePptx(
  slides: PptSlide[],
  title: string,
  themeName = 'modern',
): Promise<Buffer> {
  const pres = new PptxGenJS()
  pres.defineLayout({ name: 'WIDE', width: 10, height: 5.625 })
  pres.layout = 'WIDE'

  const theme = getTheme(themeName)

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i]
    const renderer = LAYOUT_RENDERERS[slide.layout] || addBulletsSlide
    renderer(pres, slide, theme)
  }

  const buffer = await pres.write({ outputType: 'nodebuffer' })
  return buffer as Buffer
}
