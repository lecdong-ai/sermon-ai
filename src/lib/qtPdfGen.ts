import { toCanvas } from 'html-to-image'
import jsPDF from 'jspdf'
import { getPdfRenderProfile, PAGE_SIZES } from './qtPdfSizes'
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
  const renderProfile = getPdfRenderProfile(sizeOption)

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
  let targetPages = pages
  if (dayIndex !== undefined) {
    // ★ 월간 레이아웃에서도 정확한 날짜 매칭: data-day-idx로 해당 QT 페이지를 찾고,
    // 같은 data-day(=달력 일자)를 가진 페이지(큐티 + 다이어리)를 모두 선택
    const qtPage = pages.find(p => p.getAttribute('data-day-idx') === String(dayIndex))
    const matchedDay = qtPage?.getAttribute('data-day')
    if (matchedDay) {
      targetPages = pages.filter(p => p.getAttribute('data-day') === matchedDay)
    } else {
      targetPages = pages.slice(1 + dayIndex * pagesPerDay, 1 + dayIndex * pagesPerDay + pagesPerDay)
    }
  }

  if (targetPages.length === 0) {
    throw new Error('해당 day의 페이지를 찾을 수 없습니다.')
  }

  const pdf = new jsPDF({
    orientation: widthMm > heightMm ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [widthMm, heightMm],
    compress: true,
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
    let canvas: HTMLCanvasElement | null = null

    try {
      canvas = await toCanvas(pageEl, {
        pixelRatio: renderProfile.pixelRatio,
        backgroundColor: tmpl.pageBg,
        skipAutoScale: true,
      })

      const imgData = await canvasToJpegBytes(canvas, renderProfile.jpegQuality)

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
    } finally {
      if (canvas) {
        canvas.width = 0
        canvas.height = 0
      }
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
    } else if (navTarget) {
      const candidates = navTarget === 'prayer' ? ['prayer', 'intercessory'] :
                         navTarget === 'intercessory' ? ['intercessory', 'prayer'] :
                         navTarget === 'yearlygrid' ? ['yearlygrid', 'yearly-grid'] :
                         navTarget === 'yearly-grid' ? ['yearly-grid', 'yearlygrid'] :
                         [navTarget]
      for (const k of candidates) {
        if (pageTargetMap[k]) {
          targetPageNum = pageTargetMap[k]
          break
        }
      }
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

/**
 * ⚡ 연간 마스터 다이어리 멀티 몬스(Multi-Month) 전용 2-Pass 스마트 하이퍼링크 캡처 엔진
 */
export interface CapturedPdfLink {
  relX: number
  relY: number
  relW: number
  relH: number
  navTarget: string | null
  dayAttr: string | null
  weekAttr: string | null
  directTarget: string | null
}

export interface MasterPdfContext {
  pdf: jsPDF
  widthMm: number
  heightMm: number
  currentPageIndex: number
  pageTargetMap: Record<string, number>
  pendingLinks: PendingLinkSnapshot[]
  hasContent: boolean
}

export interface PendingLinkSnapshot {
  pdfPageIndex: number
  links: CapturedPdfLink[]
  drawX: number
  drawY: number
  drawW: number
  drawH: number
  scaleX: number
  scaleY: number
  year: number
  month: number
}

/** Resolve a captured navigation target against either a local or global page map. */
export function resolveMasterLinkTarget(
  pageTargetMap: Record<string, number>,
  link: CapturedPdfLink,
  year: number,
  month: number,
): number | null {
  const directTarget = link.directTarget
  const navTarget = link.navTarget

  if (directTarget) {
    const page = parseInt(directTarget, 10)
    return Number.isFinite(page) && page > 0 ? page : null
  }

  if (navTarget) {
    if (navTarget.startsWith('month-')) {
      const monthTarget = navTarget.slice('month-'.length)
      // Annual indexes use month-YYYY-M while monthly controls may use month-M.
      if (/^\d{4}-\d{1,2}$/.test(monthTarget)) {
        return pageTargetMap[`month-${monthTarget}`] || null
      }
      return pageTargetMap[`month-${year}-${monthTarget}`] || pageTargetMap[`month-${monthTarget}`] || null
    }

    const candidates = navTarget === 'prayer' ? ['prayer', 'intercessory'] :
      navTarget === 'intercessory' ? ['intercessory', 'prayer'] :
      navTarget === 'yearlygrid' ? ['yearlygrid', 'yearly-grid'] :
      navTarget === 'yearly-grid' ? ['yearly-grid', 'yearlygrid'] :
      [navTarget]

    for (const key of candidates) {
      const page = pageTargetMap[`${year}-${month}-${key}`] || pageTargetMap[key]
      if (page) return page
    }
  }

  if (link.dayAttr) {
    return pageTargetMap[`${year}-${month}-day-${link.dayAttr}`] || pageTargetMap[`day-${link.dayAttr}`] || null
  }
  if (link.weekAttr) {
    return pageTargetMap[`${year}-${month}-week-${link.weekAttr}`] || pageTargetMap[`week-${link.weekAttr}`] || null
  }

  return null
}

function canvasToJpegBytes(canvas: HTMLCanvasElement, quality: number): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('페이지 이미지 변환에 실패했습니다.'))
        return
      }

      blob.arrayBuffer().then(
        (buffer) => resolve(new Uint8Array(buffer)),
        reject,
      )
    }, 'image/jpeg', quality)
  })
}

export function createMasterPdfContext(sizeOption: string): MasterPdfContext {
  const size = PAGE_SIZES[sizeOption] || PAGE_SIZES['A4Landscape']
  const { widthMm, heightMm } = size
  const pdf = new jsPDF({
    orientation: widthMm > heightMm ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [widthMm, heightMm],
    compress: true,
  })
  return {
    pdf,
    widthMm,
    heightMm,
    currentPageIndex: 0,
    pageTargetMap: {},
    pendingLinks: [],
    hasContent: false,
  }
}

export async function appendContainerPagesToMasterPdf(
  ctx: MasterPdfContext,
  container: HTMLDivElement,
  sizeOption: string,
  year: number,
  month: number,
  onPageProgress?: (done: number, total: number, failed: number) => void
) {
  const size = PAGE_SIZES[sizeOption] || PAGE_SIZES['A4Landscape']
  const { widthMm, heightMm } = size
  const renderProfile = getPdfRenderProfile(sizeOption)

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

  const allChildren = container.children as HTMLCollectionOf<HTMLElement>
  for (let i = 0; i < allChildren.length; i++) {
    collectPages(allChildren[i])
  }

  if (pages.length === 0) return

  await document.fonts.ready

  let failedPages = 0

  for (let i = 0; i < pages.length; i++) {
    const pageEl = pages[i]
    const pageNum = ctx.currentPageIndex + 1
    let canvas: HTMLCanvasElement | null = null
    let addedPdfPage = false

    const pageKey = pageEl.getAttribute('data-page-key')
    const dayKey = pageEl.getAttribute('data-day')
    const weekKey = pageEl.getAttribute('data-week')

    // 1-Pass: 캡처 직전(현재 월 실제 DOM 기준) 하이퍼링크 상대 좌표 캐시
    // ★ 재렌더로 인한 DOM detach/내용 교체 후 rect 계산 불가 문제를 원천 차단
    const pageRect = pageEl.getBoundingClientRect()
    // 연간 부록은 화면 미리보기용 scale 래퍼 안에서 캡처되므로 실제 표시 크기를 사용한다.
    const baseW = pageRect.width || pageEl.offsetWidth || 1
    const baseH = pageRect.height || pageEl.offsetHeight || 1
    const clickableEls = pageEl.querySelectorAll<HTMLElement>(
      '[data-nav-target], [data-day], [data-week], [data-target-page]'
    )
    const links: CapturedPdfLink[] = []
    for (let li = 0; li < clickableEls.length; li++) {
      const el = clickableEls[li]
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) continue
      links.push({
        relX: rect.left - pageRect.left,
        relY: rect.top - pageRect.top,
        relW: rect.width,
        relH: rect.height,
        navTarget: el.getAttribute('data-nav-target'),
        dayAttr: el.getAttribute('data-day'),
        weekAttr: el.getAttribute('data-week'),
        directTarget: el.getAttribute('data-target-page'),
      })
    }

    try {
      canvas = await toCanvas(pageEl, {
        pixelRatio: renderProfile.pixelRatio,
      })

      const imgData = await canvasToJpegBytes(canvas, renderProfile.jpegQuality)
      const isFullBleedPage = pageEl.getAttribute('data-page-type') === 'full-bleed'
      const marginSide = isFullBleedPage ? 0 : 14
      const marginTop = isFullBleedPage ? 0 : 8
      const drawW = isFullBleedPage ? widthMm : widthMm - marginSide * 2
      const drawH = isFullBleedPage ? heightMm : heightMm - marginTop - marginSide
      const drawX = isFullBleedPage ? 0 : marginSide
      const drawY = isFullBleedPage ? 0 : marginTop

      if (ctx.hasContent) {
        ctx.pdf.addPage([widthMm, heightMm])
        addedPdfPage = true
      }
      ctx.pdf.addImage(imgData, 'JPEG', drawX, drawY, drawW, drawH, undefined, 'FAST')
      ctx.hasContent = true
      ctx.currentPageIndex = pageNum

      if (pageKey) {
        ctx.pageTargetMap[`${year}-${month}-${pageKey}`] = pageNum
        if (!ctx.pageTargetMap[pageKey]) ctx.pageTargetMap[pageKey] = pageNum
      }
      if (dayKey) {
        ctx.pageTargetMap[`${year}-${month}-day-${dayKey}`] = pageNum
        if (!ctx.pageTargetMap[`day-${dayKey}`]) ctx.pageTargetMap[`day-${dayKey}`] = pageNum
      }
      if (weekKey) {
        ctx.pageTargetMap[`${year}-${month}-week-${weekKey}`] = pageNum
        if (!ctx.pageTargetMap[`week-${weekKey}`]) ctx.pageTargetMap[`week-${weekKey}`] = pageNum
      }

      // 월별 달력 첫 페이지를 대표 월 인덱스로 등록
      if (pageKey === 'calendar') {
        ctx.pageTargetMap[`month-${month}`] = pageNum
        ctx.pageTargetMap[`month-${year}-${month}`] = pageNum
      }

      // 연간 마스터 그리드는 연도별 고유 키로 등록
      const yearlyGridYear = pageEl.getAttribute('data-yearly-year')
      if (yearlyGridYear) {
        ctx.pageTargetMap[`yearlygrid-${yearlyGridYear}`] = pageNum
        if (!ctx.pageTargetMap['yearlygrid']) ctx.pageTargetMap['yearlygrid'] = pageNum
      }

      if (links.length > 0) {
        ctx.pendingLinks.push({
          pdfPageIndex: pageNum,
          links,
          drawX,
          drawY,
          drawW,
          drawH,
          scaleX: drawW / baseW,
          scaleY: drawH / baseH,
          year,
          month,
        })
      }

      await new Promise((resolve) => setTimeout(resolve, 24))
    } catch (e: any) {
      if (addedPdfPage) {
        try {
          ctx.pdf.deletePage(pageNum)
        } catch {
          // 페이지 정리 실패는 원래 캡처 오류를 가리지 않도록 무시한다.
        }
      }
      failedPages += 1
      console.warn(`[MasterPdfGen] page append failed:`, e?.message || e)
    } finally {
      // html-to-image가 만든 캔버스의 백킹 스토어를 다음 페이지 전에 해제한다.
      if (canvas) {
        canvas.width = 0
        canvas.height = 0
      }
      onPageProgress?.(i + 1, pages.length, failedPages)
    }
  }
}

/**
 * ⚡ 2-Pass: 전체 17개월 페이지 번호 인덱스가 완료된 후 PDF 하이퍼링크 일괄 주입
 * 1-Pass에서 캐시된 상대 좌표 + 속성값만 사용 (DOM 접근 없음)
 */
export async function finalizeMasterPdfLinks(
  ctx: MasterPdfContext,
  onProgress?: (done: number, total: number) => void,
) {
  const { pdf, pageTargetMap, pendingLinks } = ctx

  for (let itemIndex = 0; itemIndex < pendingLinks.length; itemIndex++) {
    const item = pendingLinks[itemIndex]
    const { pdfPageIndex, links, drawX, drawY, drawW, drawH, scaleX, scaleY, year, month } = item

    pdf.setPage(pdfPageIndex)

    for (const link of links) {
      let targetPageNum: number | null = null

      targetPageNum = resolveMasterLinkTarget(pageTargetMap, link, year, month)

      if (!targetPageNum) continue

      const pdfX = drawX + link.relX * scaleX
      const pdfY = drawY + link.relY * scaleY
      const pdfW = link.relW * scaleX
      const pdfH = link.relH * scaleY

      try {
        pdf.link(pdfX, pdfY, pdfW, pdfH, { pageNumber: targetPageNum })
      } catch (e) {
        // ignore single link failure
      }
    }

    onProgress?.(itemIndex + 1, pendingLinks.length)
    if (itemIndex % 10 === 9) {
      await new Promise((resolve) => setTimeout(resolve, 0))
    }
  }
}

export function saveMasterPdf(pdf: jsPDF, filename: string) {
  pdf.save(filename)
}

export function masterPdfBytes(ctx: MasterPdfContext): Uint8Array {
  const output = ctx.pdf.output('arraybuffer')
  return new Uint8Array(output)
}
