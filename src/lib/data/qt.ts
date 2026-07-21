import { supabase } from '@/lib/supabase'
import type { QtPost, QtPostDetail, Season, QtQueryParams } from '@/types/qt-index'

import listRaw from '@/lib/data-source/mock/qt.json'
import detailRaw from '@/lib/data-source/mock/qt-detail.json'
import curationRaw from '@/lib/data-source/mock/curations.json'
import shopRaw from '@/lib/data-source/mock/shop.json'


const allPosts: QtPost[] = listRaw.items as QtPost[]
const detailMap = new Map(
  (detailRaw.items as Array<Partial<QtPostDetail>>).map((d) => [d.slug, d])
)
const allCurations = curationRaw.items as Array<{
  id: string
  slug: string
  title: string
  coverImage: { src: string }
  summary: string
}>
const allShop = shopRaw.items as Array<{
  slug: string
  name: string
  thumbnail: { src: string }
  price: number
}>

let archivePostsCache: QtPost[] | null = null

async function fetchArchivePosts(): Promise<QtPost[]> {
  if (archivePostsCache) return archivePostsCache
  try {
    const { data } = await supabase
      .from('qt_archive')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(50)
    if (data && data.length > 0) {
      archivePostsCache = data.map((item: any): QtPost => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        excerpt: item.excerpt || '',
        thumbnail: item.thumbnail_url
          ? { src: item.thumbnail_url, alt: item.title }
          : { src: '/images/qt/default-cover.jpg', alt: item.title },
        season: item.season || '연중' as Season,
        tags: [],
        publishedAt: item.published_at,
        viewCount: 0,
        isFree: true,
        bibleRange: item.bible_passage || undefined,
      }))
    }
  } catch {
    // silently fail, use mock only
  }
  return archivePostsCache || []
}

function filterAndSort(
  posts: QtPost[],
  params?: QtQueryParams
): QtPost[] {
  let result = [...posts]

  if (params?.season) {
    result = result.filter((p) => p.season === params.season)
  }
  if (params?.tag) {
    result = result.filter((p) => p.tags.some((t) => t.slug === params.tag))
  }
  if (params?.search) {
    const q = params.search.toLowerCase()
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.bibleRange?.toLowerCase().includes(q)
    )
  }
  if (params?.sort === 'popular') {
    result.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
  } else {
    result.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
  }
  return result
}

function mergedPosts(): Promise<QtPost[]> {
  return fetchArchivePosts().then(archive => [...archive, ...allPosts])
}

export async function getQtPosts(params?: QtQueryParams): Promise<{
  posts: QtPost[]
  total: number
}> {
  const combined = await mergedPosts()
  const filtered = filterAndSort(combined, params)
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 12
  const start = (page - 1) * pageSize
  return {
    posts: filtered.slice(start, start + pageSize),
    total: filtered.length,
  }
}

export async function getAllQt(): Promise<QtPost[]> {
  return mergedPosts()
}

export async function getQtPost(slug: string): Promise<QtPost | undefined> {
  const combined = await mergedPosts()
  return combined.find((p) => p.slug === slug)
}

export async function getQtPostDetail(
  slug: string
): Promise<QtPostDetail | undefined> {
  const combined = await mergedPosts()
  const post = combined.find((p) => p.slug === slug)
  if (!post) return undefined

  const detail = detailMap.get(slug)
  const relatedQt = await getRelatedQt(post, 3)

  const relatedCuration = (detail?.relatedCuration ?? []).map((rc) => {
    const found = allCurations.find((c) => c.slug === rc.slug)
    return found
      ? {
          id: found.id,
          slug: found.slug,
          title: found.title,
          coverImage: found.coverImage.src,
          summary: found.summary,
        }
      : rc
  })

  const detailShop = detail?.relatedShop
  let relatedShop: QtPostDetail['relatedShop'] = undefined
  if (detailShop) {
    const found = allShop.find((s) => s.slug === detailShop.slug)
    if (found) {
      relatedShop = {
        slug: found.slug,
        name: found.name,
        thumbnail: found.thumbnail.src,
        price: found.price,
      }
    }
  }

  let seriesPosts = undefined
  if (post.series) {
    seriesPosts = combined
      .filter((p) => p.series?.id === post.series?.id)
      .map((p) => ({
        slug: p.slug,
        title: p.title,
        order: combined.indexOf(p) + 1,
        publishedAt: p.publishedAt,
      }))
      .sort((a, b) => a.order - b.order)
  }

  return {
    ...post,
    content: detail?.content ?? '',
    bibleText: detail?.bibleText,
    keyVerse: detail?.keyVerse,
    downloads: detail?.downloads ?? {},
    series: post.series
      ? {
          ...post.series,
          description: '',
          posts: seriesPosts ?? [],
        }
      : undefined,
    relatedQt,
    relatedCuration,
    relatedShop,
  }
}

export async function getRelatedQt(
  post: QtPost,
  limit = 3
): Promise<QtPost[]> {
  const combined = await mergedPosts()
  return combined
    .filter((p) => p.slug !== post.slug)
    .filter(
      (p) =>
        p.season === post.season ||
        p.tags.some((t) => post.tags.some((pt) => pt.id === t.id))
    )
    .slice(0, limit)
}

export async function getLatestQt(): Promise<QtPost | undefined> {
  const combined = await mergedPosts()
  return combined.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )[0]
}

export async function getQtBySeason(
  season: Season,
  limit = 6
): Promise<QtPost[]> {
  const combined = await mergedPosts()
  return combined.filter((p) => p.season === season).slice(0, limit)
}

export async function getAllQtSlugs(): Promise<string[]> {
  const combined = await mergedPosts()
  return combined.map((p) => p.slug)
}
