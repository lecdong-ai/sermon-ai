import PptxGenJS from 'pptxgenjs'

/**
 * 템플릿 색상으로 구분선 장식
 */
export function addDividerLine(
  pres: PptxGenJS,
  slide: any,
  accentColor: string,
  x = 0.5,
  y: number,
  w = 3,
): void {
  slide.addShape(pres.ShapeType.line, {
    x, y, w, h: 0,
    line: { color: accentColor, width: 2.5 },
  })
}

/**
 * 수직 강조 바
 */
export function addAccentBar(
  pres: PptxGenJS,
  slide: any,
  accentColor: string,
  x: number,
  y: number,
  h: number,
): void {
  slide.addShape(pres.ShapeType.rect, {
    x, y, w: 0.08, h,
    fill: { color: accentColor },
    line: { type: 'none' },
  })
}

/**
 * SECTION-HEADER 배경 패턴 (반투명 원형)
 */
export function addSectionBgPattern(
  pres: PptxGenJS,
  slide: any,
  accentColor: string,
): void {
  slide.addShape(pres.ShapeType.ellipse, {
    x: 7.5, y: -0.5, w: 4, h: 4,
    fill: { color: accentColor, transparency: 85 },
    line: { type: 'none' },
  })
  slide.addShape(pres.ShapeType.ellipse, {
    x: -1, y: 3.5, w: 3, h: 3,
    fill: { color: accentColor, transparency: 90 },
    line: { type: 'none' },
  })
}

/**
 * 인용 슬라이드용 큰 따옴표 장식
 */
export function addQuoteMark(
  pres: PptxGenJS,
  slide: any,
  primaryColor: string,
): void {
  slide.addText('❝', {
    x: 0.3, y: 0.1, w: 1.5, h: 1.5,
    fontSize: 72,
    color: primaryColor,
    fontFace: 'Malgun Gothic',
    align: 'left',
    transparency: 70,
  })
}

/**
 * 번호 원형 불릿
 */
export function addNumberedBullet(
  pres: PptxGenJS,
  slide: any,
  index: number,
  text: string,
  accentColor: string,
  x: number,
  y: number,
  w: number,
): void {
  slide.addShape(pres.ShapeType.ellipse, {
    x, y: y + 0.05, w: 0.35, h: 0.35,
    fill: { color: accentColor },
    line: { type: 'none' },
  })
  slide.addText(String(index + 1), {
    x, y: y + 0.05, w: 0.35, h: 0.35,
    fontSize: 10,
    color: 'FFFFFF',
    bold: true,
    align: 'center',
    valign: 'middle',
  })
  slide.addText(text, {
    x: x + 0.5, y, w: w - 0.5, h: 0.45,
    fontSize: 14,
    color: '333333',
    fontFace: 'Malgun Gothic',
    valign: 'middle',
  })
}
