import PptxGenJS from 'pptxgenjs'
import type { PptSlide } from '@/types'

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

function addTitleSlide(pres: PptxGenJS, slide: PptSlide, theme: ThemeColors): void {
  const s = pres.addSlide()
  s.background = { color: theme.primary }
  s.addText(slide.title, {
    x: 0.5, y: 1.5, w: 9, h: 2,
    fontSize: 36,
    fontFace: 'Malgun Gothic',
    color: 'FFFFFF',
    bold: true,
    align: 'center',
    valign: 'middle',
  })
  if (slide.content.length > 0) {
    s.addText(slide.content.join('\n'), {
      x: 1, y: 3.8, w: 8, h: 2,
      fontSize: 18,
      fontFace: 'Malgun Gothic',
      color: 'FFFFFF',
      align: 'center',
      valign: 'top',
      lineSpacingMultiple: 1.5,
    })
  }
}

function addBulletsSlide(pres: PptxGenJS, slide: PptSlide, theme: ThemeColors): void {
  const s = pres.addSlide()
  s.background = { color: theme.background }

  const titleShape = s.addText(slide.title, {
    x: 0.5, y: 0.3, w: 9, h: 0.8,
    fontSize: 24,
    fontFace: 'Malgun Gothic',
    color: theme.primary,
    bold: true,
    align: 'left',
    valign: 'middle',
  })

  const bulletText = slide.content.map((c) => `• ${c}`).join('\n')
  s.addText(bulletText, {
    x: 0.7, y: 1.3, w: 8.6, h: 4.5,
    fontSize: 16,
    fontFace: 'Malgun Gothic',
    color: theme.text,
    valign: 'top',
    lineSpacingMultiple: 1.6,
    paraSpaceAfter: 8,
  })

  s.addShape(pres.ShapeType.line, {
    x: 0.5, y: 1.15, w: 9, h: 0,
    line: { color: theme.secondary, width: 2 },
  })
}

function addSectionHeaderSlide(pres: PptxGenJS, slide: PptSlide, theme: ThemeColors): void {
  const s = pres.addSlide()
  s.background = { color: theme.accent }
  s.addText(slide.title, {
    x: 0.5, y: 1.5, w: 9, h: 3,
    fontSize: 36,
    fontFace: 'Malgun Gothic',
    color: theme.primary,
    bold: true,
    align: 'center',
    valign: 'middle',
  })
}

function addQuoteSlide(pres: PptxGenJS, slide: PptSlide, theme: ThemeColors): void {
  const s = pres.addSlide()
  s.background = { color: theme.accent }

  s.addShape(pres.ShapeType.rect, {
    x: 0.8, y: 0.6, w: 0.08, h: 5,
    fill: { color: theme.primary },
  })

  const quoteText = slide.content.map((c) => `"${c}"`).join('\n\n')
  s.addText(`❝\n${slide.title}`, {
    x: 1.2, y: 0.5, w: 7.5, h: 1,
    fontSize: 22,
    fontFace: 'Malgun Gothic',
    color: theme.primary,
    bold: true,
    align: 'left',
  })
  s.addText(quoteText, {
    x: 1.2, y: 1.5, w: 7.5, h: 4,
    fontSize: 18,
    fontFace: 'Malgun Gothic',
    color: theme.text,
    italic: true,
    valign: 'top',
    lineSpacingMultiple: 1.6,
  })
}

function addTwoColumnSlide(pres: PptxGenJS, slide: PptSlide, theme: ThemeColors): void {
  const s = pres.addSlide()
  s.background = { color: theme.background }

  s.addText(slide.title, {
    x: 0.5, y: 0.3, w: 9, h: 0.8,
    fontSize: 24,
    fontFace: 'Malgun Gothic',
    color: theme.primary,
    bold: true,
    align: 'left',
  })

  s.addShape(pres.ShapeType.line, {
    x: 0.5, y: 1.15, w: 9, h: 0,
    line: { color: theme.secondary, width: 2 },
  })

  const mid = slide.content.length
  const leftItems = slide.content.slice(0, Math.ceil(mid / 2))
  const rightItems = slide.content.slice(Math.ceil(mid / 2))

  if (leftItems.length > 0) {
    s.addShape(pres.ShapeType.rect, {
      x: 0.5, y: 1.4, w: 4.2, h: 3.8,
      fill: { color: theme.accent },
      rectRadius: 0.2,
    })
    s.addText(leftItems.map((c) => `• ${c}`).join('\n'), {
      x: 0.7, y: 1.6, w: 3.8, h: 3.4,
      fontSize: 14,
      fontFace: 'Malgun Gothic',
      color: theme.text,
      valign: 'top',
      lineSpacingMultiple: 1.5,
    })
  }

  if (rightItems.length > 0) {
    s.addShape(pres.ShapeType.rect, {
      x: 5.3, y: 1.4, w: 4.2, h: 3.8,
      fill: { color: theme.accent },
      rectRadius: 0.2,
    })
    s.addText(rightItems.map((c) => `• ${c}`).join('\n'), {
      x: 5.5, y: 1.6, w: 3.8, h: 3.4,
      fontSize: 14,
      fontFace: 'Malgun Gothic',
      color: theme.text,
      valign: 'top',
      lineSpacingMultiple: 1.5,
    })
  }
}

function addClosingSlide(pres: PptxGenJS, slide: PptSlide, theme: ThemeColors): void {
  const s = pres.addSlide()
  s.background = { color: theme.primary }

  s.addText(slide.title || '은혜가 함께 하시길', {
    x: 0.5, y: 1.5, w: 9, h: 1.5,
    fontSize: 32,
    fontFace: 'Malgun Gothic',
    color: 'FFFFFF',
    bold: true,
    align: 'center',
    valign: 'middle',
  })

  if (slide.content.length > 0) {
    s.addText(slide.content.join('\n'), {
      x: 1, y: 3.5, w: 8, h: 2.5,
      fontSize: 16,
      fontFace: 'Malgun Gothic',
      color: 'FFFFFF',
      align: 'center',
      valign: 'top',
      lineSpacingMultiple: 1.5,
    })
  }
}

const LAYOUT_RENDERERS: Record<string, (pres: PptxGenJS, slide: PptSlide, theme: ThemeColors) => void> = {
  'title': addTitleSlide,
  'bullets': addBulletsSlide,
  'section-header': addSectionHeaderSlide,
  'quote': addQuoteSlide,
  'two-column': addTwoColumnSlide,
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

  for (const slide of slides) {
    const renderer = LAYOUT_RENDERERS[slide.layout] || addBulletsSlide
    renderer(pres, slide, theme)
  }

  const buffer = await pres.write({ outputType: 'nodebuffer' })
  return buffer as Buffer
}
