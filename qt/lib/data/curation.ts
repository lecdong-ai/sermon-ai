import type { Curation, CurationDetail } from '@/types'
import raw from '@/lib/data-source/mock/curations.json'
import qtRaw from '@/lib/data-source/mock/qt.json'
import templateRaw from '@/lib/data-source/mock/templates.json'
import shopRaw from '@/lib/data-source/mock/shop.json'

const allCurations: Curation[] = raw.items as Curation[]
const allQtPosts = qtRaw.items
const allTemplates = templateRaw.items
const allShop = shopRaw.items

export async function getCurations(params?: {
  season?: string
  limit?: number
}): Promise<Curation[]> {
  let result = [...allCurations]
  if (params?.season) {
    result = result.filter((c) => c.season === params.season)
  }
  result.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
  if (params?.limit) result = result.slice(0, params.limit)
  return result
}

export async function getCuration(
  slug: string
): Promise<Curation | undefined> {
  return allCurations.find((c) => c.slug === slug)
}

export async function getCurationDetail(
  slug: string
): Promise<CurationDetail | undefined> {
  const curation = allCurations.find((c) => c.slug === slug)
  if (!curation) return undefined

  const editorialIntro = `${curation.title} 큐레이션에 오신 것을 환영합니다. 이 주제에 맞는 큐티 자료와 템플릿을 엄선했습니다.`

  const qtPosts = allQtPosts.slice(0, curation.counts.qt).map((p: any) => ({
    ...p,
    isFree: true as const,
  }))

  const templates = allTemplates
    .slice(0, curation.counts.templates)
    .map((t: any) => ({
      ...t,
      isFree: true as const,
    }))

  const shopProducts = allShop
    .slice(0, curation.counts.shop)
    .map((p: any) => ({
      product: { ...p, isFree: false as const },
      reason: `${curation.title} 테마와 잘 어울리는 상품입니다.`,
    }))

  const relatedCurations = allCurations.filter((c) => c.slug !== slug)

  return {
    ...curation,
    editorialIntro,
    editorNote: '이 큐레이션이 묵상의 길잡이가 되길 바랍니다.',
    qtPosts,
    templates,
    shopProducts,
    relatedCurations,
  }
}

export async function getAllCurationSlugs(): Promise<string[]> {
  return allCurations.map((c) => c.slug)
}
