import type { Template, TemplateDetail, TemplateCategory, ImageData } from '@/types'

interface MockTemplateDetail {
  slug: string
  galleryImages: ImageData[]
  usageSteps: TemplateDetail['usageSteps']
  includedSections: string[]
  recommendedTemplates: string[]
  relatedQt: Array<{ slug: string; title: string; excerpt: string }>
}
import listRaw from '@/lib/data-source/mock/templates.json'
import detailRaw from '@/lib/data-source/mock/templates-detail.json'
import qtRaw from '@/lib/data-source/mock/qt.json'

const allTemplates: Template[] = listRaw.items as Template[]
const detailMap = new Map(
  (detailRaw.items as MockTemplateDetail[]).map((d) => [d.slug, d])
)
const allQtPosts = qtRaw.items as Array<{
  slug: string
  title: string
  excerpt: string
}>

export async function getTemplates(params?: {
  category?: TemplateCategory
  limit?: number
}): Promise<Template[]> {
  let result = [...allTemplates]
  if (params?.category) {
    result = result.filter((t) => t.category === params.category)
  }
  result.sort(
    (a, b) => (b.downloadCount ?? 0) - (a.downloadCount ?? 0)
  )
  if (params?.limit) result = result.slice(0, params.limit)
  return result
}

export async function getTemplateBySlug(
  slug: string
): Promise<Template | undefined> {
  return allTemplates.find((t) => t.slug === slug)
}

export async function getTemplateDetail(
  slug: string
): Promise<TemplateDetail | undefined> {
  const template = allTemplates.find((t) => t.slug === slug)
  if (!template) return undefined

  const detail = detailMap.get(slug)

  // Recommended templates
  const recommendedSlugs = (detail?.recommendedTemplates as string[]) ?? []
  const recommendedTemplates = allTemplates.filter((t) =>
    recommendedSlugs.includes(t.slug)
  )

  // Related QT posts
  const relatedQtSlugs = (detail?.relatedQt as Array<{ slug: string; title: string; excerpt: string }>) ?? []
  const relatedQt = relatedQtSlugs.map((r) => {
    const found = allQtPosts.find((q) => q.slug === r.slug)
    return found ?? r
  })

  return {
    ...template,
    galleryImages: detail?.galleryImages ?? [template.previewImage],
    usageSteps: detail?.usageSteps ?? [],
    includedSections: detail?.includedSections ?? [],
    recommendedTemplates,
    relatedQt: relatedQt.length > 0 ? relatedQt : undefined,
  }
}

export async function getPopularTemplates(limit = 4): Promise<Template[]> {
  return getTemplates({ limit })
}

export async function getTemplateCategories(): Promise<TemplateCategory[]> {
  const cats = new Set(allTemplates.map((t) => t.category))
  return Array.from(cats)
}

export async function getAllTemplateSlugs(): Promise<string[]> {
  return allTemplates.map((t) => t.slug)
}
