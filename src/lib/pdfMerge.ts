import { PDFArray, PDFDocument, PDFName } from 'pdf-lib'
import type { MonthlyDiaryRecord } from './diaryStorage'
import { resolveMasterLinkTarget } from './qtPdfGen'

const POINTS_PER_MM = 72 / 25.4

export interface PdfMergeProgress {
  phase: 'loading' | 'links' | 'saving'
  done: number
  total: number
}

function addInternalLink(
  document: PDFDocument,
  sourcePage: ReturnType<PDFDocument['addPage']>,
  targetPage: ReturnType<PDFDocument['addPage']>,
  xMm: number,
  yMm: number,
  widthMm: number,
  heightMm: number,
) {
  const { height: pageHeight } = sourcePage.getSize()
  const x = xMm * POINTS_PER_MM
  const width = widthMm * POINTS_PER_MM
  const height = heightMm * POINTS_PER_MM
  const y = pageHeight - (yMm + heightMm) * POINTS_PER_MM

  const annotation = document.context.obj({
    Type: 'Annot',
    Subtype: 'Link',
    Rect: [x, y, x + width, y + height],
    Border: [0, 0, 0],
    A: {
      S: 'GoTo',
      D: [targetPage.ref, 'XYZ', null, null, null],
    },
  })
  const annotationRef = document.context.register(annotation)
  const currentAnnots = sourcePage.node.get(PDFName.of('Annots'))
  if (currentAnnots) {
    const array = document.context.lookup(currentAnnots, PDFArray)
    array.push(annotationRef)
  } else {
    sourcePage.node.set(PDFName.of('Annots'), document.context.obj([annotationRef]))
  }
}

function removeCopiedAnnotations(page: ReturnType<PDFDocument['addPage']>) {
  page.node.delete(PDFName.of('Annots'))
}

/** Merge raw monthly PDFs and rebuild all internal links using global page offsets. */
export async function mergeMonthlyDiaries(
  records: MonthlyDiaryRecord[],
  onProgress?: (progress: PdfMergeProgress) => void,
): Promise<Uint8Array> {
  if (records.length === 0) throw new Error('조립할 월간 다이어리가 없습니다.')

  const sorted = [...records].sort((a, b) => a.year - b.year || a.month - b.month)
  const output = await PDFDocument.create()
  const mergedPages: ReturnType<typeof output.addPage>[] = []
  const globalPageTargetMap: Record<string, number> = {}
  const offsets: number[] = []
  let pageOffset = 0

  for (let recordIndex = 0; recordIndex < sorted.length; recordIndex++) {
    const record = sorted[recordIndex]
    offsets.push(pageOffset)
    const source = await PDFDocument.load(await record.pdfBlob.arrayBuffer())
    const copiedPages = await output.copyPages(source, source.getPageIndices())

    copiedPages.forEach((page) => {
      removeCopiedAnnotations(page)
      output.addPage(page)
      mergedPages.push(page)
    })

    for (const [key, localPage] of Object.entries(record.pageTargetMap)) {
      const globalPage = pageOffset + localPage
      if (!globalPageTargetMap[key]) globalPageTargetMap[key] = globalPage
    }

    pageOffset += record.pageCount
    onProgress?.({ phase: 'loading', done: recordIndex + 1, total: sorted.length })
    await new Promise((resolve) => setTimeout(resolve, 0))
  }

  const totalLinkItems = sorted.reduce((sum, record) => sum + record.pendingLinks.length, 0)
  let linkDone = 0
  for (let recordIndex = 0; recordIndex < sorted.length; recordIndex++) {
    const record = sorted[recordIndex]
    const offset = offsets[recordIndex]

    for (const item of record.pendingLinks) {
      const sourcePage = mergedPages[offset + item.pdfPageIndex - 1]
      if (!sourcePage) continue

      for (const link of item.links) {
        const targetPageNumber = resolveMasterLinkTarget(globalPageTargetMap, link, item.year, item.month)
        if (!targetPageNumber) continue
        const targetPage = mergedPages[targetPageNumber - 1]
        if (!targetPage) continue

        addInternalLink(
          output,
          sourcePage,
          targetPage,
          item.drawX + link.relX * item.scaleX,
          item.drawY + link.relY * item.scaleY,
          link.relW * item.scaleX,
          link.relH * item.scaleY,
        )
      }

      linkDone += 1
      onProgress?.({ phase: 'links', done: linkDone, total: Math.max(1, totalLinkItems) })
      if (linkDone % 10 === 0) await new Promise((resolve) => setTimeout(resolve, 0))
    }
  }

  onProgress?.({ phase: 'saving', done: 0, total: 1 })
  const bytes = await output.save({ useObjectStreams: true })
  onProgress?.({ phase: 'saving', done: 1, total: 1 })
  return bytes
}
