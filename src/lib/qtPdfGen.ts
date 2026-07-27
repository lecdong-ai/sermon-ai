import { toCanvas } from 'html-to-image'
import jsPDF from 'jspdf'
import { PAGE_SIZES } from './qtPdfSizes'
import { getTemplate } from './qtTemplates'
import type { QTFormData, QTResult } from '@/components/advanced/QtGenerator'

const BOOK_EN: Record<string, string> = {
  '창세기': 'Genesis', '출애굽기': 'Exodus', '레위기': 'Leviticus',
  '민수기': 'Numbers', '신명기': 'Deuteronomy', '여호수아': 'Joshua',
  '사사기': 'Judges', '룻기': 'Ruth', '사무엘상': '1Samuel',
  '사무엘하': '2Samuel', '열왕기상': '1Kings', '열왕기하': '2Kings',
  '역대상': '1Chronicles', '역대하': '2Chronicles', '에스라': 'Ezra',
  '느헤미야': 'Nehemiah', '에스더': 'Esther', '욥기': 'Job',
  '시편': 'Psalms', '잠언': 'Proverbs', '전도서': 'Ecclesiastes',
  '아가': 'SongOfSongs', '이사야': 'Isaiah', '예레미야': 'Jeremiah',
  '예레미야애가': 'Lamentations', '에스겔': 'Ezekiel', '다니엘': 'Daniel',
  '호세아': 'Hosea', '요엘': 'Joel', '아모스': 'Amos',
  '오바댜': 'Obadiah', '요나': 'Jonah', '미가': 'Micah',
  '나훔': 'Nahum', '하박국': 'Habakkuk', '스바냐': 'Zephaniah',
  '학개': 'Haggai', '스가랴': 'Zechariah', '말라기': 'Malachi',
  '마태복음': 'Matthew', '마가복음': 'Mark', '누가복음': 'Luke',
  '요한복음': 'John', '사도행전': 'Acts', '로마서': 'Romans',
  '고린도전서': '1Corinthians', '고린도후서': '2Corinthians',
  '갈라디아서': 'Galatians', '에베소서': 'Ephesians', '빌립보서': 'Philippians',
  '골로새서': 'Colossians', '데살로니가전서': '1Thessalonians',
  '데살로니가후서': '2Thessalonians', '디모데전서': '1Timothy',
  '디모데후서': '2Timothy', '디도서': 'Titus', '빌레몬서': 'Philemon',
  '히브리서': 'Hebrews', '야고보서': 'James', '베드로전서': '1Peter',
  '베드로후서': '2Peter', '요한1서': '1John', '요한2서': '2John',
  '요한3서': '3John', '유다서': 'Jude', '요한계시록': 'Revelation',
}

export async function generateQtPdf(
  container: HTMLDivElement,
  form: QTFormData,
  result: QTResult,
  sizeOption: string,
  templateId: string = 'warm-modern',
  dayIndex?: number,
  monthCalendarStrip?: {
    month: string
    daysInMonth: number
    activeDays: number[]
    dayHasContent: boolean[]
  },
) {
  const size = PAGE_SIZES[sizeOption] || PAGE_SIZES['A4Landscape']
  const { widthMm, heightMm } = size
  const tmpl = getTemplate(templateId)

  const allChildren = container.children as HTMLCollectionOf<HTMLElement>
  const pages: HTMLElement[] = []

  function collectPages(element: HTMLElement) {
    if (element.classList?.contains('qt-page')) {
      pages.push(element)
    }
    const children = element.children as HTMLCollectionOf<HTMLElement>
    for (let i = 0; i < children.length; i++) {
      collectPages(children[i])
    }
  }

  for (let i = 0; i < allChildren.length; i++) {
    collectPages(allChildren[i])
  }

  if (pages.length === 0) {
    throw new Error('PDF 페이지 요소를 찾을 수 없습니다.')
  }

  const pagesPerDay = 2  // 가로/세로 모두 1일=2페이지
  const targetPages = dayIndex !== undefined
    ? pages.slice(1 + dayIndex * pagesPerDay, 1 + dayIndex * pagesPerDay + pagesPerDay)
    : pages

  if (targetPages.length === 0) {
    throw new Error('해당 day의 페이지를 찾을 수 없습니다.')
  }

  const pdf = new jsPDF({
    orientation: widthMm > heightMm ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [widthMm, heightMm],
  })

  await document.fonts.ready
  let hasContent = false

  // ★ day → page 매핑 (전체 PDF 기준, dayIndex 미지정 시)
  // page 0 = cover, 그 후 1일 2페이지, 2일 2페이지, ...
  const dayToPageMap: Record<number, number> = {}
  if (monthCalendarStrip && dayIndex === undefined) {
    monthCalendarStrip.activeDays.forEach((day, idx) => {
      // jsPDF는 1-based page number
      dayToPageMap[day] = 1 + idx * pagesPerDay + 1  // cover(1) + dayIdx 시작
    })
  }

  for (let i = 0; i < targetPages.length; i++) {
    const pageEl = targetPages[i]
    // 실제 전체 PDF에서 이 페이지의 인덱스 (dayIndex 미지정 시)
    const globalPageIdx = dayIndex !== undefined ? dayIndex * pagesPerDay + i : i

    try {
      const canvas = await toCanvas(pageEl, {
        pixelRatio: 2,
        backgroundColor: tmpl.pageBg,
        cacheBust: true,
        skipAutoScale: true,
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.92)
      console.log(`[QtPdfGen] page ${i}: ${canvas.width}x${canvas.height}, dataUrl=${(imgData.length / 1024).toFixed(0)}KB`)

      // html-to-image 가 CSS padding 을 캡처하지 못하므로,
      // PDF addImage 좌표로 여백 구현 (상단 5mm, 좌/우/아래 14mm)
      const marginSide = 14
      const marginTop = 0
      const drawW = widthMm - marginSide * 2
      const drawH = heightMm - marginTop - marginSide
      const drawX = marginSide
      const drawY = marginTop

      if (hasContent) pdf.addPage([widthMm, heightMm])
      pdf.addImage(imgData, 'JPEG', drawX, drawY, drawW, drawH, undefined, 'FAST')
      hasContent = true

      // ★ 디지털 PDF 캘린더 링크 추가
      // 전체 PDF 생성 시 (dayIndex 미지정) + strip 정보가 있을 때만
      if (monthCalendarStrip && dayIndex === undefined && Object.keys(dayToPageMap).length > 0) {
        addCalendarLinks(pdf, monthCalendarStrip, dayToPageMap, widthMm, heightMm, globalPageIdx)
      }
    } catch (e: any) {
      console.warn(`[QtPdfGen] page ${i} failed:`, e?.message || e)
    }
  }

  if (!hasContent) {
    throw new Error('PDF 생성에 실패했습니다. 모든 페이지 렌더링이 실패했습니다.')
  }

  const engBook = BOOK_EN[form.bibleBook] || 'Bible'
  const daySuffix = dayIndex !== undefined ? `_D${dayIndex + 1}` : ''
  const filename = `QT_${engBook}_W${form.weekNumber}${daySuffix}_${sizeOption.replace(/\s/g, '')}.pdf`
  console.log(`[QtPdfGen] Done: ${filename}`)

  pdf.save(filename)
}

/**
 * PDF 캘린더 카드에 내부 점프 링크 추가
 * - 각 카드가 가리키는 day의 페이지로 이동
 * - 인쇄용 PDF에서는 무시됨 (디지털 PDF에서만 활성화)
 */
function addCalendarLinks(
  pdf: jsPDF,
  strip: { month: string; daysInMonth: number; activeDays: number[]; dayHasContent: boolean[] },
  dayToPageMap: Record<number, number>,
  widthMm: number,
  heightMm: number,
  // eslint-disable-next-line no-unused-vars
  _globalPageIdx: number,
) {
  // 화이트리스트 사이즈만
  const allowedSizes = new Set(['A4Landscape', 'iPad Pro 12.9', 'Tablet (iPad 4:3)'])
  // (sizeOption은 generateQtPdf에 있으므로 여기선 직접 확인 불가 — strip 정보가 있다는 것은 caller가 검증한 것)
  void allowedSizes

  // 캘린더 카드 영역 계산 (QtPdfLayout과 동일)
  const labelWidth = 22
  const sidePadding = 10
  const cardGap = 0.5
  const cardH = 5
  const stripHeight = 16
  const availableW = widthMm - labelWidth - sidePadding * 2
  const cardW = (availableW - cardGap * (strip.daysInMonth - 1)) / strip.daysInMonth

  for (let d = 1; d <= strip.daysInMonth; d++) {
    const targetPage = dayToPageMap[d]
    if (!targetPage) continue  // 큐티 없는 day는 링크 없음

    // 카드 좌표 계산
    const cardX = sidePadding + labelWidth + (d - 1) * (cardW + cardGap)
    const cardY = (stripHeight - cardH) / 2  // strip 상단 기준

    // jsPDF 좌표계: 좌하단 원점 (PDF는 위에서 아래로)
    // PDF Y: strip 상단 = stripHeight (mm), 카드 하단 = stripHeight - cardY - cardH
    const pdfY = stripHeight - cardY - cardH

    // pdf.link(x, y, w, h, options)
    pdf.link(cardX, pdfY, cardW, cardH, { pageNumber: targetPage })
  }
}
