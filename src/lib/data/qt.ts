import { supabase } from '@/lib/supabase'
import type { QtPost, QtPostDetail, Season, QtQueryParams } from '@/types/qt-index'

import listRaw from '@/lib/data-source/mock/qt.json'
import detailRaw from '@/lib/data-source/mock/qt-detail.json'
import curationRaw from '@/lib/data-source/mock/curations.json'
import shopRaw from '@/lib/data-source/mock/shop.json'


const allPosts: QtPost[] = (listRaw.items as QtPost[]).map((p) => ({
  ...p,
  slug: p.slug?.normalize('NFC') ?? p.slug,
}))
const detailMap = new Map(
  (detailRaw.items as Array<Partial<QtPostDetail>>).map((d) => [
    d.slug?.normalize('NFC') ?? d.slug,
    { ...d, slug: d.slug?.normalize('NFC') ?? d.slug },
  ])
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
let archiveCacheTime = 0
const CACHE_TTL = 30_000 // 30초 TTL — 새 큐티 작성 후 최대 30초 내 반영

async function fetchArchivePosts(): Promise<QtPost[]> {
  const now = Date.now()
  if (archivePostsCache && now - archiveCacheTime < CACHE_TTL) {
    return archivePostsCache
  }
  try {
    const { data } = await supabase
      .from('qt_archive')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(200)
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
      archiveCacheTime = now
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

const normalize = (s: string) => s.normalize('NFC')

export async function getQtPost(slug: string): Promise<QtPost | undefined> {
  const combined = await mergedPosts()
  return combined.find((p) => p.slug === normalize(slug))
}

export async function getQtPostDetail(
  slug: string
): Promise<QtPostDetail | undefined> {
  const normalizedSlug = normalize(slug)
  const combined = await mergedPosts()
  let post = combined.find((p) => p.slug === normalizedSlug)

  // 캐시에 없으면 DB에서 직접 한 번 더 조회 (방금 작성된 큐티 대응)
  if (!post) {
    try {
      const { data } = await supabase
        .from('qt_archive')
        .select('*')
        .eq('slug', normalizedSlug)
        .single()
      if (data) {
        post = {
          id: data.id,
          slug: data.slug,
          title: data.title,
          excerpt: data.excerpt || '',
          thumbnail: data.thumbnail_url
            ? { src: data.thumbnail_url, alt: data.title }
            : { src: '/images/qt/default-cover.jpg', alt: data.title },
          season: data.season || '연중' as Season,
          tags: [],
          publishedAt: data.published_at,
          viewCount: 0,
          isFree: true,
          bibleRange: data.bible_passage || undefined,
        }
        // 캐시 무효화하여 다음 목록 조회 시 갱신
        archivePostsCache = null
      }
    } catch { /* fall through */ }
  }

  if (!post) return undefined

  // Mock 상세 데이터 조회
  const detail = detailMap.get(normalizedSlug)

  // Mock에 없으면 Supabase에서 본문(content) 직접 가져오기
  let dbContent = ''
  let dbBibleText: string | undefined
  let dbKeyVerse: string | undefined
  if (!detail) {
    try {
      const { data } = await supabase
        .from('qt_archive')
        .select('content, bible_text, key_verse')
        .eq('slug', normalizedSlug)
        .single()
      if (data) {
        dbContent = data.content || ''
        dbBibleText = data.bible_text || undefined
        dbKeyVerse = data.key_verse || undefined
      }
    } catch { /* fall through */ }
  }

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
    content: detail?.content ?? dbContent,
    bibleText: detail?.bibleText ?? dbBibleText,
    keyVerse: detail?.keyVerse ?? dbKeyVerse,
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
  return combined.map((p) => normalize(p.slug))
}
