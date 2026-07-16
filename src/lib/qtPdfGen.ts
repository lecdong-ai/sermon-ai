import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { PAGE_SIZES } from './qtPdfSizes'
import { getTemplate } from './qtTemplates'
import type { QTFormData, QTResult } from '@/components/advanced/QtGenerator'

export async function generateQtPdf(
  container: HTMLDivElement,
  form: QTFormData,
  result: QTResult,
  sizeOption: string,
  templateId: string = 'warm-modern',
) {
  const size = PAGE_SIZES[sizeOption] || PAGE_SIZES['A4']
  const { widthMm, heightMm } = size
  const tmpl = getTemplate(templateId)

  // .qt-page 클래스를 가진 모든 페이지 요소 수집
  const allChildren = container.children as HTMLCollectionOf<HTMLElement>
  const pages: HTMLElement[] = []

  function collectPages(element: HTMLElement) {
    if (element.classList?.contains('qt-page')) {
      pages.push(element)
    }
    // 중첩 컨테이너 내부의 qt-page도 수집
    const children = element.children as HTMLCollectionOf<HTMLElement>
    for (let i = 0; i < children.length; i++) {
      collectPages(children[i])
    }
  }

  for (let i = 0; i < allChildren.length; i++) {
    collectPages(allChildren[i])
  }

  if (pages.length === 0) {
    throw new Error('PDF 페이지 요소를 찾을 수 없습니다. 원고가 올바르게 생성되었는지 확인해주세요.')
  }

  const pdf = new jsPDF({
    orientation: widthMm > heightMm ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [widthMm, heightMm],
  })

  for (let i = 0; i < pages.length; i++) {
    const pageEl = pages[i]

    const canvas = await html2canvas(pageEl, {
      scale: 2,
      useCORS: true,
      backgroundColor: tmpl.pageBg,
      width: pageEl.scrollWidth,
      height: pageEl.scrollHeight,
      logging: false,
      allowTaint: true,
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.92)

    const imgW = canvas.width
    const imgH = canvas.height
    const aspect = imgW / imgH
    const pageAspect = widthMm / heightMm

    let drawW: number, drawH: number, drawX: number, drawY: number
    if (aspect > pageAspect) {
      drawW = widthMm
      drawH = widthMm / aspect
      drawX = 0
      drawY = (heightMm - drawH) / 2
    } else {
      drawH = heightMm
      drawW = heightMm * aspect
      drawX = (widthMm - drawW) / 2
      drawY = 0
    }

    if (i > 0) pdf.addPage([widthMm, heightMm])
    pdf.addImage(imgData, 'JPEG', drawX, drawY, drawW, drawH, undefined, 'FAST')
  }

  const filename = `QT_${form.bibleBook}_${form.weekNumber}주차_${sizeOption.replace(/\s/g, '')}.pdf`
  pdf.save(filename)
}
