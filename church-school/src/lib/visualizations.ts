import PptxGenJS from 'pptxgenjs'
import type { PptSlide, PptTextStyle, PptSlideTextPosition } from '@/types/workspace'

export type ContentType = 'timeline' | 'comparison' | 'steps' | 'scripture' | 'list'

interface ThemeColors {
  primary: string
  accent: string
  background: string
  text: string
}

/**
 * 슬라이드 내용 타입 자동 감지
 */
export function detectContentType(slide: PptSlide): ContentType {
  const all = [slide.title, ...slide.content].join(' ')
  if (slide.layout === 'quote') return 'scripture'

  if (slide.layout === 'timeline-flow' ||
      /첫째|둘째|셋째|첫번째|두번째|세번째|1단계|2단계|3단계|→|->|순서|과정|단계/.test(all)) {
    return 'steps'
  }

  if (slide.layout === 'vs-contrast' ||
      /비교|차이|vs\.|대조|구분/.test(all)) {
    return 'comparison'
  }

  if (/성경|말씀|하나님|예수|하나님의|구절|본문/.test(slide.title)) {
    return 'scripture'
  }

  if (slide.layout === 'two-column') return 'comparison'
  if (slide.layout === 'timeline-flow') return 'timeline'

  return 'list'
}

/**
 * 타임라인 렌더링
 */
export function addTimelineSlide(
  pres: PptxGenJS,
  slide: PptSlide,
  colors: ThemeColors,
  tStyle: PptTextStyle,
  bStyle: PptTextStyle,
): void {
  const s = pres.addSlide()
  s.background = { color: colors.background }

  s.addText(slide.title, {
    x: 0.5, y: 0.2, w: 9, h: 0.7,
    fontSize: tStyle.fontSize || 24,
    fontFace: tStyle.fontFace || 'Malgun Gothic',
    color: colors.primary,
    bold: true,
  })

  const items = slide.content
  const count = items.length
  const startX = 0.8
  const endX = 9.2
  const lineY = 3.0

  s.addShape(pres.ShapeType.line, {
    x: startX, y: lineY, w: endX - startX, h: 0,
    line: { color: colors.accent, width: 3 },
  })

  items.forEach((item, i) => {
    const cx = startX + (i + 0.5) * (endX - startX) / count
    s.addShape(pres.ShapeType.ellipse, {
      x: cx - 0.2, y: lineY - 0.2, w: 0.4, h: 0.4,
      fill: { color: colors.accent },
      line: { type: 'none' },
    })
    s.addText(item, {
      x: cx - 0.8, y: lineY + 0.5, w: 1.6, h: 1.5,
      fontSize: 11,
      fontFace: bStyle.fontFace || 'Malgun Gothic',
      color: colors.text,
      align: 'center',
      valign: 'top',
    })
  })
}

/**
 * 단계별 프로세스 렌더링
 */
export function addStepsSlide(
  pres: PptxGenJS,
  slide: PptSlide,
  colors: ThemeColors,
  tStyle: PptTextStyle,
  bStyle: PptTextStyle,
): void {
  const s = pres.addSlide()
  s.background = { color: colors.background }

  s.addText(slide.title, {
    x: 0.5, y: 0.2, w: 9, h: 0.7,
    fontSize: tStyle.fontSize || 24,
    fontFace: tStyle.fontFace || 'Malgun Gothic',
    color: colors.primary,
    bold: true,
  })

  const items = slide.content
  const startX = 1.0
  const spacing = 8.0 / Math.max(items.length, 1)

  items.forEach((item, i) => {
    const cx = startX + i * spacing
    s.addShape(pres.ShapeType.roundRect, {
      x: cx, y: 1.3, w: spacing - 0.4, h: 3.5,
      fill: { color: colors.accent, transparency: 92 },
      line: { color: colors.accent, width: 1.2 },
      rectRadius: 0.15,
    })
    s.addShape(pres.ShapeType.ellipse, {
      x: cx + (spacing - 0.4) / 2 - 0.25, y: 1.5, w: 0.5, h: 0.5,
      fill: { color: colors.accent },
      line: { type: 'none' },
    })
    s.addText(String(i + 1), {
      x: cx + (spacing - 0.4) / 2 - 0.25, y: 1.5, w: 0.5, h: 0.5,
      fontSize: 14,
      color: 'FFFFFF',
      bold: true,
      align: 'center',
      valign: 'middle',
    })
    s.addText(item, {
      x: cx + 0.15, y: 2.2, w: spacing - 0.7, h: 2.3,
      fontSize: 12,
      fontFace: bStyle.fontFace || 'Malgun Gothic',
      color: colors.text,
      align: 'center',
      valign: 'top',
    })
  })
}

/**
 * 비교 (좌우) 렌더링
 */
export function addComparisonSlide(
  pres: PptxGenJS,
  slide: PptSlide,
  colors: ThemeColors,
  tStyle: PptTextStyle,
  bStyle: PptTextStyle,
): void {
  const s = pres.addSlide()
  s.background = { color: colors.background }

  s.addText(slide.title, {
    x: 0.5, y: 0.2, w: 9, h: 0.7,
    fontSize: tStyle.fontSize || 24,
    fontFace: tStyle.fontFace || 'Malgun Gothic',
    color: colors.primary,
    bold: true,
  })

  const parts = slide.title.split('vs')
  const leftTitle = parts[0].trim()
  const rightTitle = parts.length > 1 ? parts[1].trim() : ''

  const halfItems = Math.ceil(slide.content.length / 2)
  const leftItems = slide.content.slice(0, halfItems)
  const rightItems = slide.content.slice(halfItems)

  const renderColumn = (x: number, label: string, items: string[], isLeft: boolean) => {
    s.addShape(pres.ShapeType.rect, {
      x, y: 1.1, w: 4.2, h: 4.0,
      fill: { color: isLeft ? colors.accent : colors.primary, transparency: isLeft ? 92 : 90 },
      line: { color: isLeft ? colors.accent : colors.primary, width: 1 },
      rectRadius: 0.1,
    })
    if (label) {
      s.addText(label, {
        x: x + 0.2, y: 1.2, w: 3.8, h: 0.5,
        fontSize: 14,
        fontFace: bStyle.fontFace || 'Malgun Gothic',
        color: colors.primary,
        bold: true,
      })
    }
    items.forEach((item, idx) => {
      s.addText(`• ${item}`, {
        x: x + 0.3, y: 1.8 + idx * 0.5, w: 3.6, h: 0.45,
        fontSize: 11,
        fontFace: bStyle.fontFace || 'Malgun Gothic',
        color: colors.text,
      })
    })
  }

  renderColumn(0.5, leftTitle, leftItems, true)
  renderColumn(5.3, rightTitle, rightItems, false)
}
