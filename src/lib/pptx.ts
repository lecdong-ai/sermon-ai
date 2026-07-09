import PptxGenJS from 'pptxgenjs'
import type { PptSlide, PptTextStyle, PptSlideTextPosition } from '@/types'

interface ThemeColors {
  primary: string
  secondary: string
  background: string
  text: string
  accent: string
}

// ─── 애플/노션 감성의 엄선된 프리미엄 HSL 컬러 스키마 ───
const THEMES: Record<string, ThemeColors> = {
  modern: {
    primary: '0F172A',     // Slate 900 (지적인 다크 네이비블랙)
    secondary: '0EA5E9',   // Sky 500 (투명하고 세련된 시안 블루)
    background: 'F8FAFC',  // Slate 50 (깨끗하고 미니멀한 소프트 화이트)
    text: '334155',        // Slate 700 (눈이 편안한 그레이시 브라운)
    accent: 'E0F2FE',      // Sky 100 (밀키한 파스텔 블루 아크릴 박스색)
  },
  warm: {
    primary: '453C33',     // Espresso (차분하고 묵직한 다크 초콜릿)
    secondary: 'C69B6D',   // Warm Camel (은혜롭고 따뜻한 샌드 골드)
    background: 'FAF7F2',  // Oatmeal Cream (안정적인 아이보리 크림)
    text: '5C5346',        // Muted Brown (가독성 높은 에스프레소 브라운)
    accent: 'F3ECE0',      // Milk Tea (포근한 오트 밀크티색)
  },
  classic: {
    primary: '4C1D24',     // Burgundy (엄숙하고 귀족적인 딥 레드 와인)
    secondary: 'D4AF37',   // Bronze Gold (영적인 깊이가 느껴지는 황동 골드)
    background: 'FCFCFA',  // Linen Ivory (격조 높은 파피루스 화이트)
    text: '2D1E1F',        // Wine Mud (중후한 버건디 브라운)
    accent: 'F9F3EB',      // Warm Cream (소프트 앤틱 베이지)
  },
}

const DEFAULT_FONT = 'Malgun Gothic'

function getTheme(themeName: string): ThemeColors {
  return THEMES[themeName] || THEMES.modern
}

function getSlideColors(slide: PptSlide, theme: ThemeColors) {
  const primary = slide.color?.primary || theme.primary
  const accent = slide.color?.accent || theme.secondary
  const background = slide.color?.background || theme.background
  const isDark = slide.darkMode || false
  return {
    primary,
    accent,
    background: isDark ? primary : background,
    isDark,
  }
}

// ─── 하단 네비게이션 가이드 및 슬라이드 번호 데코레이션 ───
function addPageDecoration(
  pres: PptxGenJS,
  s: PptxGenJS.Slide,
  colors: ThemeColors,
  index: number,
  total: number,
  isDark: boolean
): void {
  const fontColor = isDark ? 'FFFFFF' : colors.primary
  const opacity = isDark ? 45 : 30
  const lineOpacity = isDark ? 70 : 80

  // 하단 마스터 라인 (0.015인치 초미세 라인)
  s.addShape(pres.ShapeType.rect, {
    x: 0.8, y: 5.1, w: 8.4, h: 0.015,
    fill: { color: colors.accent, transparency: lineOpacity }
  })
  
  // 우측 하단 페이지 번호 (03 / 10)
  const pageStr = `${(index + 1).toString().padStart(2, '0')}  /  ${total.toString().padStart(2, '0')}`
  s.addText(pageStr, {
    x: 8.0, y: 5.15, w: 1.2, h: 0.3,
    fontSize: 8.5,
    fontFace: DEFAULT_FONT,
    color: fontColor,
    transparency: opacity,
    align: 'right',
    valign: 'middle',
    bold: true
  })

  // 좌측 하단 워터마크
  s.addText('SERMON DESIGN STUDIO', {
    x: 0.8, y: 5.15, w: 3.0, h: 0.3,
    fontSize: 8,
    fontFace: DEFAULT_FONT,
    color: fontColor,
    transparency: opacity + 10,
    align: 'left',
    valign: 'middle',
    bold: true
  })
}

// ─── 그림자 대용 이중 섀도 박스 드로잉 유틸 ───
function drawShadowedCard(
  s: PptxGenJS.Slide,
  type: PptxGenJS.ShapeType,
  pos: { x: number; y: number; w: number; h: number },
  fillColor: string,
  lineColor: string,
  transparency = 0
): void {
  // 1단계: 옅고 번지는 하단 그림자 레이어
  s.addShape(type, {
    x: pos.x + 0.05,
    y: pos.y + 0.06,
    w: pos.w,
    h: pos.h,
    fill: { color: '000000', transparency: 95 }
  })
  // 2단계: 선명한 카드 본체 레이어
  s.addShape(type, {
    x: pos.x,
    y: pos.y,
    w: pos.w,
    h: pos.h,
    fill: { color: fillColor, transparency },
    line: { color: lineColor, width: 1.5, transparency: 60 }
  })
}

// ─── 텍스트 스타일 병합 유틸 ────

function defaultTitleStyle(layout: string, textColor: string): PptTextStyle {
  // 미리보기 CSS px 기준으로 PPTX pt 매핑 (preview 400px wide → PPTX 10inch)
  const sizeMap: Record<string, number> = {
    'title': 36,           // preview 28px default
    'closing': 30,         // preview 24px
    'section-header': 42,  // preview 36px (1.3x multiplier)
    'quote': 24,           // preview 20px italic
    'bullets': 28,         // preview ~22px
    'two-column': 26,      // preview ~20px
    'vs-contrast': 26,
    'timeline-flow': 26,
    'central-focus': 18,   // preview 11px (small label)
    'grid-matrix': 26,
  }
  return {
    fontFace: DEFAULT_FONT,
    fontSize: sizeMap[layout] || 26,
    bold: true,
    italic: false,
    underline: false,
    color: textColor,
    align: layout === 'quote' ? 'left' : 'center',
    valign: 'middle',
    lineSpacing: 1.2,
  }
}

function defaultBodyStyle(layout: string, textColor: string): PptTextStyle {
  // 미리보기 CSS px → PPTX pt
  const sizeMap: Record<string, number> = {
    'title': 18,           // preview 13px
    'closing': 16,         // preview 13px
    'section-header': 16,  // preview 14px
    'quote': 17,           // preview 13.5px italic
    'bullets': 16,         // preview 12.5px
    'two-column': 15,      // preview 12px
    'vs-contrast': 14,     // preview 11px
    'timeline-flow': 14,   // preview 11px
    'central-focus': 14,   // preview ~11px
    'grid-matrix': 13,     // preview ~10px
  }
  return {
    fontFace: DEFAULT_FONT,
    fontSize: sizeMap[layout] || 15,
    bold: false,
    italic: layout === 'quote',
    underline: false,
    color: textColor,
    align: 'left',
    valign: 'top',
    lineSpacing: 1.45,
  }
}

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

// ─── 레이아웃별 렌더러 구현 (10종 완벽 대응) ─────────────────────

function addTitleSlide(pres: PptxGenJS, slide: PptSlide, theme: ThemeColors, idx: number, total: number): void {
  const s = pres.addSlide()
  const colors = getSlideColors(slide, theme)
  // 미리보기: linear-gradient(135deg, primary, accent)
  s.background = { color: colors.primary }
  // accent 오버레이로 그라데이션 효과 (우측 하단)
  s.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 10, h: 5.625,
    fill: { color: colors.accent, transparency: 65 }
  })

  // 상단 우측 글로우 원
  s.addShape(pres.ShapeType.ellipse, {
    x: 7.2, y: -1.2, w: 4.0, h: 4.0,
    fill: { color: 'FFFFFF', transparency: 88 }
  })
  // 하단 좌측 글로우 원
  s.addShape(pres.ShapeType.ellipse, {
    x: -1.2, y: 3.2, w: 3.2, h: 3.2,
    fill: { color: 'FFFFFF', transparency: 93 }
  })

  // 중앙 상단 흰 구분선
  s.addShape(pres.ShapeType.rect, {
    x: 4.1, y: 1.15, w: 1.8, h: 0.04,
    fill: { color: 'FFFFFF', transparency: 20 }
  })

  const tStyle = mergeStyle(slide.titleStyle, defaultTitleStyle('title', 'FFFFFF'))
  s.addText(slide.title, textOptions(tStyle, slide.titlePosition, { x: 0.5, y: 1.4, w: 9, h: 2.0 }))

  if (slide.content.length > 0) {
    const bStyle = mergeStyle(slide.bodyStyle, defaultBodyStyle('title', 'FFFFFF'))
    s.addText(slide.content.join('\n'), {
      ...textOptions(bStyle, slide.bodyPosition, { x: 1.0, y: 3.5, w: 8.0, h: 1.2 }),
      align: 'center',
      transparency: 10
    })
  }

  // 하단 얇은 구분선
  s.addShape(pres.ShapeType.rect, {
    x: 4.3, y: 5.05, w: 1.4, h: 0.03,
    fill: { color: 'FFFFFF', transparency: 70 }
  })
}

function addBulletsSlide(pres: PptxGenJS, slide: PptSlide, theme: ThemeColors, idx: number, total: number): void {
  const s = pres.addSlide()
  const colors = getSlideColors(slide, theme)
  s.background = { color: colors.background }

  const tStyle = mergeStyle(slide.titleStyle, defaultTitleStyle('bullets', colors.isDark ? 'FFFFFF' : colors.primary))
  tStyle.align = 'left'
  s.addText(slide.title, textOptions(tStyle, slide.titlePosition, { x: 0.8, y: 0.4, w: 8.4, h: 0.8 }))

  // 장식 구분선
  s.addShape(pres.ShapeType.rect, {
    x: 0.8, y: 1.15, w: 1.2, h: 0.05,
    fill: { color: colors.accent }
  })

  const bStyle = mergeStyle(slide.bodyStyle, defaultBodyStyle('bullets', colors.isDark ? 'E2E8F0' : theme.text))
  
  // 리스트 아이템 개별 디자인 배치 (불릿 형태 데코레이션 극대화)
  const yStart = 1.55
  const yGap = 0.76
  slide.content.forEach((item, itemIdx) => {
    const yPos = yStart + itemIdx * yGap
    if (yPos > 4.9) return // 네비게이션 가이드 침범 방지

    // 이중 섀도로 숫자 뱃지 입체화
    drawShadowedCard(s, pres.ShapeType.roundRect, { x: 0.8, y: yPos, w: 0.38, h: 0.38 }, colors.accent, colors.accent, 85)

    // 숫자 텍스트
    s.addText((itemIdx + 1).toString(), {
      x: 0.8, y: yPos, w: 0.38, h: 0.38,
      fontSize: 11,
      bold: true,
      color: colors.accent,
      align: 'center',
      valign: 'middle'
    })
    // 본문 내용
    s.addText(item, {
      ...textOptions(bStyle, undefined, { x: 1.35, y: yPos - 0.05, w: 7.8, h: 0.48 }),
      align: 'left',
      valign: 'middle'
    })
  })

  addPageDecoration(pres, s, colors, idx, total, colors.isDark)
}

function addSectionHeaderSlide(pres: PptxGenJS, slide: PptSlide, theme: ThemeColors, idx: number, total: number): void {
  const s = pres.addSlide()
  const colors = getSlideColors(slide, theme)
  s.background = { color: colors.background }

  // 미리보기: 우측 하단 큰 배경 원 (blur 효과)
  s.addShape(pres.ShapeType.ellipse, {
    x: 6.5, y: 2.2, w: 5.0, h: 5.0,
    fill: { color: colors.accent, transparency: 88 }
  })

  // 미리보기와 동일: 좌측 세로 액센트 바 (x:0 부터 조금 두께)
  s.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 0.22, h: 5.625,
    fill: { color: colors.accent }
  })

  const tStyle = mergeStyle(slide.titleStyle, defaultTitleStyle('section-header', colors.isDark ? 'FFFFFF' : colors.primary))
  tStyle.align = 'left'
  s.addText(slide.title, textOptions(tStyle, slide.titlePosition, { x: 0.65, y: 1.5, w: 8.5, h: 1.4 }))

  if (slide.content.length > 0) {
    const bStyle = mergeStyle(slide.bodyStyle, defaultBodyStyle('section-header', colors.isDark ? 'E2E8F0' : theme.text))
    s.addText(slide.content.join('\n'), textOptions(bStyle, slide.bodyPosition, { x: 0.65, y: 3.0, w: 8.5, h: 1.6 }))
  }

  addPageDecoration(pres, s, colors, idx, total, colors.isDark)
}

function addQuoteSlide(pres: PptxGenJS, slide: PptSlide, theme: ThemeColors, idx: number, total: number): void {
  const s = pres.addSlide()
  const colors = getSlideColors(slide, theme)
  // 미리보기: backgroundColor: `${primary}08` = 아주 연한 화이트 (실질적 흰 배경)
  s.background = { color: colors.isDark ? colors.primary : 'FFFFFF' }

  // 좌측 세로 구분선 (스타일: 미리보기 라인)
  s.addShape(pres.ShapeType.rect, {
    x: 0.8, y: 0.7, w: 0.08, h: 4.2,
    fill: { color: colors.primary, transparency: 0 }
  })
  s.addShape(pres.ShapeType.rect, {
    x: 0.88, y: 0.7, w: 0.08, h: 4.2,
    fill: { color: colors.accent, transparency: 0 }
  })

  // 큰 인용부호 장식
  s.addText('“', {
    x: 0.8, y: 0.4, w: 1.2, h: 1.2,
    fontFace: 'Georgia',
    fontSize: 80,
    color: colors.accent,
    transparency: 30
  })
  s.addText('”', {
    x: 7.8, y: 3.2, w: 1.2, h: 1.2,
    fontFace: 'Georgia',
    fontSize: 80,
    color: colors.isDark ? 'FFFFFF' : colors.primary,
    transparency: 78
  })

  const tStyle = mergeStyle(slide.titleStyle, defaultTitleStyle('quote', colors.isDark ? 'FFFFFF' : colors.primary))
  tStyle.align = 'left'
  s.addText(slide.title, textOptions(tStyle, slide.titlePosition, { x: 1.3, y: 1.0, w: 7.6, h: 0.9 }))

  const bStyle = mergeStyle(slide.bodyStyle, defaultBodyStyle('quote', colors.isDark ? 'E2E8F0' : theme.text))
  bStyle.italic = true
  const quoteText = slide.content.join('\n\n')
  s.addText(quoteText, textOptions(bStyle, slide.bodyPosition, { x: 1.3, y: 2.0, w: 7.6, h: 2.3 }))

  addPageDecoration(pres, s, colors, idx, total, colors.isDark)
}

function addClosingSlide(pres: PptxGenJS, slide: PptSlide, theme: ThemeColors, idx: number, total: number): void {
  const s = pres.addSlide()
  const colors = getSlideColors(slide, theme)
  // 미리보기: linear-gradient(135deg, primary, #111e2e, primary)
  s.background = { color: '0F172A' } // 다크 베이스
  // primary 오버레이 양쪽
  s.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 5, h: 5.625,
    fill: { color: colors.primary, transparency: 35 }
  })
  s.addShape(pres.ShapeType.rect, {
    x: 5, y: 0, w: 5, h: 5.625,
    fill: { color: colors.primary, transparency: 35 }
  })
  // 중앙 accent 라디얼 글로우
  s.addShape(pres.ShapeType.ellipse, {
    x: 2.5, y: 1.0, w: 5.0, h: 5.0,
    fill: { color: colors.accent, transparency: 85 }
  })

  // 이모지 박스
  drawShadowedCard(s, pres.ShapeType.roundRect, { x: 4.55, y: 0.85, w: 0.9, h: 0.9 }, 'FFFFFF', 'FFFFFF', 88)
  s.addText('🙏', {
    x: 4.55, y: 0.85, w: 0.9, h: 0.9,
    fontSize: 26,
    align: 'center',
    valign: 'middle'
  })

  const tStyle = mergeStyle(slide.titleStyle, defaultTitleStyle('closing', 'FFFFFF'))
  s.addText(slide.title || '은혜가 함께 하시길', textOptions(tStyle, slide.titlePosition, { x: 0.5, y: 2.0, w: 9, h: 1.3 }))

  if (slide.content.length > 0) {
    const bStyle = mergeStyle(slide.bodyStyle, defaultBodyStyle('closing', 'FFFFFF'))
    s.addText(slide.content.join('\n'), {
      ...textOptions(bStyle, slide.bodyPosition, { x: 1.0, y: 3.4, w: 8.0, h: 1.4 }),
      align: 'center',
      transparency: 20
    })
  }
}

function addTwoColumnSlide(pres: PptxGenJS, slide: PptSlide, theme: ThemeColors, idx: number, total: number): void {
  const s = pres.addSlide()
  const colors = getSlideColors(slide, theme)
  s.background = { color: colors.background }

  const tStyle = mergeStyle(slide.titleStyle, defaultTitleStyle('two-column', colors.isDark ? 'FFFFFF' : colors.primary))
  tStyle.align = 'left'
  s.addText(slide.title, textOptions(tStyle, slide.titlePosition, { x: 0.8, y: 0.4, w: 8.4, h: 0.8 }))

  // 장식선
  s.addShape(pres.ShapeType.rect, {
    x: 0.8, y: 1.15, w: 1.0, h: 0.05,
    fill: { color: colors.accent }
  })

  // 반으로 데이터 분할
  const half = Math.ceil(slide.content.length / 2)
  const leftContent = slide.content.slice(0, half)
  const rightContent = slide.content.slice(half)

  const bStyle = mergeStyle(slide.bodyStyle, defaultBodyStyle('two-column', colors.isDark ? 'E2E8F0' : theme.text))

  // 좌측 열 이중 섀도 박스
  const leftPos = { x: 0.8, y: 1.4, w: 4.0, h: 3.5 }
  drawShadowedCard(s, pres.ShapeType.roundRect, leftPos, colors.accent, colors.accent, colors.isDark ? 85 : 92)
  leftContent.forEach((text, textIdx) => {
    s.addText('✦', { x: 1.0, y: 1.6 + textIdx * 0.6, w: 0.25, h: 0.3, color: colors.isDark ? 'FFFFFF' : colors.accent, fontSize: 10, bold: true })
    s.addText(text, { ...textOptions(bStyle, undefined, { x: 1.25, y: 1.58 + textIdx * 0.6, w: 3.3, h: 0.5 }), valign: 'middle' })
  })

  // 우측 열 이중 섀도 박스
  const rightPos = { x: 5.2, y: 1.4, w: 4.0, h: 3.5 }
  drawShadowedCard(s, pres.ShapeType.roundRect, rightPos, colors.primary, colors.primary, colors.isDark ? 80 : 94)
  rightContent.forEach((text, textIdx) => {
    s.addText('✦', { x: 5.4, y: 1.6 + textIdx * 0.6, w: 0.25, h: 0.3, color: colors.isDark ? 'FFFFFF' : colors.primary, fontSize: 10, bold: true })
    s.addText(text, { ...textOptions(bStyle, undefined, { x: 5.65, y: 1.58 + textIdx * 0.6, w: 3.3, h: 0.5 }), valign: 'middle' })
  })

  addPageDecoration(pres, s, colors, idx, total, colors.isDark)
}

function addVsContrastSlide(pres: PptxGenJS, slide: PptSlide, theme: ThemeColors, idx: number, total: number): void {
  const s = pres.addSlide()
  const colors = getSlideColors(slide, theme)
  s.background = { color: colors.background }

  const tStyle = mergeStyle(slide.titleStyle, defaultTitleStyle('vs-contrast', colors.isDark ? 'FFFFFF' : colors.primary))
  s.addText(slide.title, textOptions(tStyle, slide.titlePosition, { x: 0.5, y: 0.4, w: 9.0, h: 0.8 }))

  const parseSide = (raw: string) => {
    const colonIdx = raw.indexOf(':')
    if (colonIdx === -1) return { label: raw, items: [] }
    return {
      label: raw.slice(0, colonIdx).trim(),
      items: raw.slice(colonIdx + 1).split('|').map(x => x.trim()).filter(Boolean)
    }
  }

  const leftRaw = slide.content[0] || ''
  const rightRaw = slide.content[1] || ''
  const left = parseSide(leftRaw)
  const right = parseSide(rightRaw)
  const extra = slide.content.slice(2)

  // 좌측 대조군 입체 박스
  const leftPos = { x: 0.8, y: 1.4, w: 3.8, h: 3.3 }
  // 다크모드일 때 카드 테두리 및 텍스트 대비 향상
  drawShadowedCard(s, pres.ShapeType.roundRect, leftPos, colors.primary, 'FFFFFF', 0)
  s.addText(left.label || '항목 A', {
    x: 0.8, y: 1.5, w: 3.8, h: 0.55,
    fontSize: 16,
    bold: true,
    color: 'FFFFFF',
    align: 'center'
  })
  s.addShape(pres.ShapeType.rect, { x: 1.2, y: 2.05, w: 3.0, h: 0.02, fill: { color: 'FFFFFF', transparency: 70 } })
  
  if (left.items.length > 0) {
    s.addText(left.items.join('\n\n'), {
      x: 1.0, y: 2.2, w: 3.4, h: 2.3,
      fontSize: 12,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle',
      lineSpacingMultiple: 1.3
    })
  }

  // 중간 VS 서클 데코
  s.addShape(pres.ShapeType.rect, { x: 4.98, y: 1.4, w: 0.04, h: 1.2, fill: { color: colors.accent, transparency: 50 } })
  s.addShape(pres.ShapeType.ellipse, {
    x: 4.75, y: 2.6, w: 0.5, h: 0.5,
    fill: { color: 'FFFFFF' },
    line: { color: colors.primary, width: 1.5 }
  })
  s.addText('VS', {
    x: 4.75, y: 2.6, w: 0.5, h: 0.5,
    fontSize: 10,
    bold: true,
    color: colors.primary,
    align: 'center',
    valign: 'middle'
  })
  s.addShape(pres.ShapeType.rect, { x: 4.98, y: 3.1, w: 0.04, h: 1.6, fill: { color: colors.accent, transparency: 50 } })

  // 우측 대조군 입체 박스
  const rightPos = { x: 5.4, y: 1.4, w: 3.8, h: 3.3 }
  drawShadowedCard(s, pres.ShapeType.roundRect, rightPos, colors.accent, 'FFFFFF', 0)
  s.addText(right.label || '항목 B', {
    x: 5.4, y: 1.5, w: 3.8, h: 0.55,
    fontSize: 16,
    bold: true,
    color: 'FFFFFF',
    align: 'center'
  })
  s.addShape(pres.ShapeType.rect, { x: 5.8, y: 2.05, w: 3.0, h: 0.02, fill: { color: 'FFFFFF', transparency: 70 } })

  if (right.items.length > 0) {
    s.addText(right.items.join('\n\n'), {
      x: 5.6, y: 2.2, w: 3.4, h: 2.3,
      fontSize: 12,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle',
      lineSpacingMultiple: 1.3
    })
  }

  // 하단 추가 메시지
  if (extra.length > 0) {
    s.addText(extra.join('  |  '), {
      x: 0.8, y: 4.75, w: 8.4, h: 0.35,
      fontSize: 11,
      color: colors.isDark ? 'FFFFFF' : theme.text,
      align: 'center',
      valign: 'middle'
    })
  }

  addPageDecoration(pres, s, colors, idx, total, colors.isDark)
}

function addTimelineFlowSlide(pres: PptxGenJS, slide: PptSlide, theme: ThemeColors, idx: number, total: number): void {
  const s = pres.addSlide()
  const colors = getSlideColors(slide, theme)
  s.background = { color: colors.background }

  const tStyle = mergeStyle(slide.titleStyle, defaultTitleStyle('timeline-flow', colors.isDark ? 'FFFFFF' : colors.primary))
  tStyle.align = 'left'
  s.addText(slide.title, textOptions(tStyle, slide.titlePosition, { x: 0.8, y: 0.4, w: 8.4, h: 0.8 }))

  // 세로축 타임라인 베이스 라인
  s.addShape(pres.ShapeType.rect, {
    x: 1.18, y: 1.45, w: 0.04, h: 3.3,
    fill: { color: colors.accent }
  })

  const yStart = 1.45
  const yGap = 0.85
  const bStyle = mergeStyle(slide.bodyStyle, defaultBodyStyle('timeline-flow', colors.isDark ? 'E2E8F0' : theme.text))

  slide.content.forEach((step, stepIdx) => {
    const yPos = yStart + stepIdx * yGap
    if (yPos > 4.8) return

    const colonIdx = step.indexOf(':')
    const stepLabel = colonIdx !== -1 ? step.slice(0, colonIdx).trim() : `단계 ${stepIdx + 1}`
    const stepContent = colonIdx !== -1 ? step.slice(colonIdx + 1).trim() : step

    // 타임라인 서클 노드 (섀도우 효과 탑재)
    s.addShape(pres.ShapeType.ellipse, {
      x: 1.02, y: yPos, w: 0.36, h: 0.36,
      fill: { color: colors.primary },
      line: { color: 'FFFFFF', width: 2 }
    })
    s.addText((stepIdx + 1).toString(), {
      x: 1.02, y: yPos, w: 0.36, h: 0.36,
      fontSize: 10,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle'
    })

    // 단계 카드 박스 (입체 섀도우 카드 기술)
    const cardPos = { x: 1.6, y: yPos - 0.05, w: 7.6, h: 0.7 }
    drawShadowedCard(s, pres.ShapeType.roundRect, cardPos, colors.accent, colors.accent, colors.isDark ? 85 : 92)

    // 단계명
    s.addText(stepLabel, {
      x: 1.8, y: yPos - 0.02, w: 7.2, h: 0.32,
      fontSize: 14,
      bold: true,
      color: colors.isDark ? 'FFFFFF' : colors.primary,
      valign: 'middle'
    })

    // 단계 세부내용
    if (stepContent && stepContent !== stepLabel) {
      s.addText(stepContent, {
        ...textOptions(bStyle, undefined, { x: 1.8, y: yPos + 0.28, w: 7.2, h: 0.32 }),
        valign: 'middle'
      })
    }
  })

  addPageDecoration(pres, s, colors, idx, total, colors.isDark)
}

function addCentralFocusSlide(pres: PptxGenJS, slide: PptSlide, theme: ThemeColors, idx: number, total: number): void {
  const s = pres.addSlide()
  const colors = getSlideColors(slide, theme)
  s.background = { color: colors.background }

  // 연한 배경 대각선 라인 가이드들
  s.addShape(pres.ShapeType.line, { x: 3.5, y: 1.5, w: 1.0, h: 0.8, line: { color: colors.accent, width: 1.5 } })
  s.addShape(pres.ShapeType.line, { x: 5.5, y: 1.5, w: 1.0, h: -0.8, line: { color: colors.accent, width: 1.5 } })
  s.addShape(pres.ShapeType.line, { x: 3.5, y: 3.5, w: 1.0, h: -0.8, line: { color: colors.accent, width: 1.5 } })
  s.addShape(pres.ShapeType.line, { x: 5.5, y: 3.5, w: 1.0, h: 0.8, line: { color: colors.accent, width: 1.5 } })

  const tStyle = mergeStyle(slide.titleStyle, defaultTitleStyle('central-focus', colors.isDark ? 'FFFFFF' : colors.primary))
  s.addText(slide.title, textOptions(tStyle, slide.titlePosition, { x: 0.5, y: 0.3, w: 9.0, h: 0.6 }))

  const keyword = slide.content[0] || slide.title
  const supporting = slide.content.slice(1)

  // 중심 서클 구체 (입체 입혀주기)
  drawShadowedCard(s, pres.ShapeType.ellipse, { x: 4.2, y: 2.0, w: 1.6, h: 1.6 }, colors.primary, 'FFFFFF', 0)
  s.addText(keyword, {
    x: 4.2, y: 2.0, w: 1.6, h: 1.6,
    fontSize: 13.5,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
    valign: 'middle'
  })

  // 주변 카드들 배치 (최대 4개)
  const cardPositions = [
    { x: 1.0, y: 1.2, w: 2.6, h: 1.2 },
    { x: 6.4, y: 1.2, w: 2.6, h: 1.2 },
    { x: 1.0, y: 3.2, w: 2.6, h: 1.2 },
    { x: 6.4, y: 3.2, w: 2.6, h: 1.2 }
  ]

  supporting.slice(0, 4).forEach((text, cardIdx) => {
    const pos = cardPositions[cardIdx]
    // 다크모드일 때 주변 카드 배경색을 semi-transparent로 변경해 묻히게 만듦
    drawShadowedCard(s, pres.ShapeType.roundRect, pos, colors.isDark ? 'FFFFFF' : 'FFFFFF', colors.accent, colors.isDark ? 92 : 0)
    s.addText(text, {
      x: pos.x + 0.15, y: pos.y + 0.1, w: pos.w - 0.3, h: pos.h - 0.2,
      fontSize: 11.5,
      color: colors.isDark ? 'FFFFFF' : theme.text,
      align: 'center',
      valign: 'middle'
    })
  })

  addPageDecoration(pres, s, colors, idx, total, colors.isDark)
}

function addGridMatrixSlide(pres: PptxGenJS, slide: PptSlide, theme: ThemeColors, idx: number, total: number): void {
  const s = pres.addSlide()
  const colors = getSlideColors(slide, theme)
  s.background = { color: colors.background }

  const tStyle = mergeStyle(slide.titleStyle, defaultTitleStyle('grid-matrix', colors.isDark ? 'FFFFFF' : colors.primary))
  tStyle.align = 'left'
  s.addText(slide.title, textOptions(tStyle, slide.titlePosition, { x: 0.8, y: 0.4, w: 8.4, h: 0.8 }))

  // 열 개수 수동 오버라이드 지원 (columnCount)
  const cols = slide.columnCount || (slide.content.length <= 4 ? 2 : 3)
  const count = slide.content.length

  // 행렬 배치용 좌표
  let cellPositions: { x: number; y: number; w: number; h: number }[] = []

  if (cols === 2) {
    const colWidth = 4.0
    const rowHeight = 1.6
    cellPositions = [
      { x: 0.8, y: 1.4, w: colWidth, h: rowHeight },
      { x: 5.2, y: 1.4, w: colWidth, h: rowHeight },
      { x: 0.8, y: 3.2, w: colWidth, h: rowHeight },
      { x: 5.2, y: 3.2, w: colWidth, h: rowHeight }
    ]
  } else {
    const colWidth = 2.6
    const rowHeight = 1.6
    cellPositions = [
      { x: 0.8, y: 1.4, w: colWidth, h: rowHeight },
      { x: 3.7, y: 1.4, w: colWidth, h: rowHeight },
      { x: 6.6, y: 1.4, w: colWidth, h: rowHeight },
      { x: 0.8, y: 3.2, w: colWidth, h: rowHeight },
      { x: 3.7, y: 3.2, w: colWidth, h: rowHeight },
      { x: 6.6, y: 3.2, w: colWidth, h: rowHeight }
    ]
  }

  slide.content.slice(0, 6).forEach((item, cellIdx) => {
    const pos = cellPositions[cellIdx]
    if (!pos) return

    const colonIdx = item.indexOf(':')
    const label = colonIdx !== -1 ? item.slice(0, colonIdx).trim() : item
    const desc = colonIdx !== -1 ? item.slice(colonIdx + 1).trim() : ''

    const isEven = cellIdx % 2 === 0
    let cellBg = isEven ? colors.accent : colors.primary
    let cellBgTrans = isEven ? 92 : 94

    // 다크모드일 때 투명도 대비 조율
    if (colors.isDark) {
      cellBg = isEven ? colors.accent : 'FFFFFF'
      cellBgTrans = isEven ? 85 : 92
    }

    // 입체 섀도 그리드 카드형 쉘
    drawShadowedCard(s, pres.ShapeType.roundRect, pos, cellBg, cellBg, cellBgTrans)

    // 라벨
    s.addText(label, {
      x: pos.x + 0.15, y: pos.y + 0.15, w: pos.w - 0.3, h: desc ? 0.6 : pos.h - 0.3,
      fontSize: 12.5,
      bold: true,
      color: colors.isDark ? 'FFFFFF' : colors.primary,
      align: 'center',
      valign: 'middle'
    })

    // 설명
    if (desc) {
      s.addText(desc, {
        x: pos.x + 0.15, y: pos.y + 0.75, w: pos.w - 0.3, h: pos.h - 0.9,
        fontSize: 10,
        color: colors.isDark ? 'E2E8F0' : theme.text,
        align: 'center',
        valign: 'top',
        lineSpacingMultiple: 1.2
      })
    }
  })

  addPageDecoration(pres, s, colors, idx, total, colors.isDark)
}

// ─── 렌더러 맵 바인딩 ───

const LAYOUT_RENDERERS: Record<string, (pres: PptxGenJS, slide: PptSlide, theme: ThemeColors, idx: number, total: number) => void> = {
  'title': addTitleSlide,
  'bullets': addBulletsSlide,
  'section-header': addSectionHeaderSlide,
  'quote': addQuoteSlide,
  'closing': addClosingSlide,
  'two-column': addTwoColumnSlide,
  'vs-contrast': addVsContrastSlide,
  'timeline-flow': addTimelineFlowSlide,
  'central-focus': addCentralFocusSlide,
  'grid-matrix': addGridMatrixSlide,
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
    renderer(pres, slide, theme, i, slides.length)
  }

  const buffer = await pres.write({ outputType: 'nodebuffer' })
  return buffer as Buffer
}
