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

  // ★ 1. 동적 Page Target Map 구축 (1-based jsPDF 페이지 번호)
  const pageTargetMap: Record<string, number> = {}
  targetPages.forEach((pageEl, idx) => {
    const pageNum = idx + 1

    const targetKey = pageEl.getAttribute('data-page-key')
    if (targetKey && !pageTargetMap[targetKey]) {
      pageTargetMap[targetKey] = pageNum
    }

    const dayAttr = pageEl.getAttribute('data-day')
    if (dayAttr) {
      const d = parseInt(dayAttr, 10)
      if (d && !pageTargetMap[`day-${d}`]) {
        pageTargetMap[`day-${d}`] = pageNum
      }
    }

    const weekAttr = pageEl.getAttribute('data-week')
    if (weekAttr) {
      const w = parseInt(weekAttr, 10)
      if (w && !pageTargetMap[`week-${w}`]) {
        pageTargetMap[`week-${w}`] = pageNum
      }
    }

    // 내부 자식 [data-page-key] 스캔
    pageEl.querySelectorAll<HTMLElement>('[data-page-key]').forEach(el => {
      const key = el.getAttribute('data-page-key')
      if (key && !pageTargetMap[key]) {
        pageTargetMap[key] = pageNum
      }
    })
  })

  for (let i = 0; i < targetPages.length; i++) {
    const pageEl = targetPages[i]

    try {
      const canvas = await toCanvas(pageEl, {
        pixelRatio: 2,
        backgroundColor: tmpl.pageBg,
        cacheBust: true,
        skipAutoScale: true,
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.92)

      const isCoverPage = (i === 0 && dayIndex === undefined)
      const isFullBleedPage = isCoverPage || pageEl.getAttribute('data-page-type') === 'full-bleed'

      const marginSide = isFullBleedPage ? 0 : 14
      const marginTop = isFullBleedPage ? 0 : 8
      const drawW = isFullBleedPage ? widthMm : widthMm - marginSide * 2
      const drawH = isFullBleedPage ? heightMm : heightMm - marginTop - marginSide
      const drawX = isFullBleedPage ? 0 : marginSide
      const drawY = isFullBleedPage ? 0 : marginTop

      if (hasContent) pdf.addPage([widthMm, heightMm])
      pdf.addImage(imgData, 'JPEG', drawX, drawY, drawW, drawH, undefined, 'FAST')
      hasContent = true

      // ★ 2. 디지털 PDF 하이퍼링크 자동 매핑 & 주입
      addInteractiveLinks(pdf, pageTargetMap, pageEl, drawX, drawY, drawW, drawH)
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
 * PDF 내부 인터랙티브 이동 하이퍼링크 주입 도우미
 * - 상단 탭, 월간달력, 주간계획, 일자별 큐티/다이어리 간 100% 클릭 이동 지원
 */
function addInteractiveLinks(
  pdf: jsPDF,
  pageTargetMap: Record<string, number>,
  pageEl: HTMLElement,
  drawX: number,
  drawY: number,
  drawW: number,
  drawH: number,
) {
  const pageRect = pageEl.getBoundingClientRect()
  const elements = pageEl.querySelectorAll<HTMLElement>('[data-nav-target], [data-day], [data-week], [data-target-page]')

  for (const el of elements) {
    let targetPageNum: number | null = null

    const navTarget = el.getAttribute('data-nav-target')
    const dayAttr = el.getAttribute('data-day')
    const weekAttr = el.getAttribute('data-week')
    const directTarget = el.getAttribute('data-target-page')

    if (directTarget) {
      targetPageNum = parseInt(directTarget, 10)
    } else if (navTarget && pageTargetMap[navTarget]) {
      targetPageNum = pageTargetMap[navTarget]
    } else if (dayAttr && pageTargetMap[`day-${dayAttr}`]) {
      targetPageNum = pageTargetMap[`day-${dayAttr}`]
    } else if (weekAttr && pageTargetMap[`week-${weekAttr}`]) {
      targetPageNum = pageTargetMap[`week-${weekAttr}`]
    }

    if (!targetPageNum) continue

    const rect = el.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) continue

    const relX = rect.left - pageRect.left
    const relY = rect.top - pageRect.top
    const relW = rect.width
    const relH = rect.height

    const baseW = pageEl.offsetWidth || pageRect.width || 1
    const baseH = pageEl.offsetHeight || pageRect.height || 1

    const scaleX = drawW / baseW
    const scaleY = drawH / baseH

    const pdfX = drawX + relX * scaleX
    const pdfY = drawY + relY * scaleY
    const pdfW = relW * scaleX
    const pdfH = relH * scaleY

    try {
      pdf.link(pdfX, pdfY, pdfW, pdfH, { pageNumber: targetPageNum })
    } catch (e) {
      // ignore single link failure
    }
  }
}
