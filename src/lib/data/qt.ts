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

import { supabaseAdmin } from '@/lib/supabase'

let archivePostsCache: QtPost[] | null = null
let archiveCacheTime = 0
const CACHE_TTL = 3_000 // 3초 TTL — 새 큐티 작성 후 즉각 반영

async function fetchArchivePosts(): Promise<QtPost[]> {
  const now = Date.now()
  if (archivePostsCache && now - archiveCacheTime < CACHE_TTL) {
    return archivePostsCache
  }
  try {
    // supabaseAdmin을 통해 RLS 영향 없이 qt_archive 테이블 100% 신뢰 조회
    const client = supabaseAdmin || supabase
    const { data, error } = await client
      .from('qt_archive')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(300)

    if (error) {
      console.warn('fetchArchivePosts query warning:', error)
    }

    if (data && data.length > 0) {
      archivePostsCache = data.map((item: any): QtPost & { content?: string; bibleText?: string; keyVerse?: string } => {
        const rawTags = Array.isArray(item.tags) ? item.tags : []
        const tagObjs = rawTags.map((t: any, i: number) => {
          const tagName = typeof t === 'string' ? t : (t?.name || String(t))
          return {
            id: `tag-${item.id}-${i}`,
            slug: tagName.toLowerCase().replace(/\s+/g, '-'),
            name: tagName,
          }
        })

        // 썸네일 이미지 fallback — 지정되지 않은 경우 절기/성경구절에 부합하는 고품질 커버 이미지 지정
        const thumbSrc = item.thumbnail_url?.trim()
          ? item.thumbnail_url
          : item.season === '대림' ? '/images/qt/season-advent.jpg'
          : item.season === '성탄' ? '/images/qt/season-christmas.jpg'
          : item.season === '사순' ? '/images/qt/season-lent.jpg'
          : item.season === '부활' ? '/images/qt/season-easter.jpg'
          : '/images/qt/default-cover.jpg'

        return {
          id: item.id,
          slug: item.slug,
          title: item.title,
          excerpt: item.excerpt || (item.content ? item.content.slice(0, 120) + '...' : ''),
          thumbnail: { src: thumbSrc, alt: item.title, width: 800, height: 1000 },
          season: (item.season || '연중') as Season,
          tags: tagObjs,
          publishedAt: item.published_at || item.created_at || new Date().toISOString(),
          viewCount: 0,
          isFree: true,
          bibleRange: item.bible_passage || undefined,
          content: item.content || '',
          bibleText: item.bible_text || '',
          keyVerse: item.key_verse || '',
        }
      })
      archiveCacheTime = now
    } else {
      archivePostsCache = []
    }
  } catch (e) {
    console.warn('fetchArchivePosts exception:', e)
    archivePostsCache = []
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
  return fetchArchivePosts().then(archive => {
    const map = new Map<string, QtPost>()
    const seenTitles = new Set<string>()
    const result: QtPost[] = []

    // 1. Supabase DB 데이터 우선 등록 (중복 제거)
    for (const p of archive) {
      const key = (p.slug?.normalize('NFC') || p.id).trim()
      const titleKey = p.title.trim()
      if (!map.has(key) && !seenTitles.has(titleKey)) {
        map.set(key, p)
        seenTitles.add(titleKey)
        result.push(p)
      }
    }

    // 2. Mock 데이터는 DB에 중복 항목이 없는 경우에만 추가
    for (const p of allPosts) {
      const key = (p.slug?.normalize('NFC') || p.id).trim()
      const titleKey = p.title.trim()
      if (!map.has(key) && !seenTitles.has(titleKey)) {
        map.set(key, p)
        seenTitles.add(titleKey)
        result.push(p)
      }
    }

    return result
  })
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
      const client = supabaseAdmin || supabase
      const { data } = await client
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
            ? { src: data.thumbnail_url, alt: data.title, width: 800, height: 1000 }
            : { src: '/images/qt/default-cover.jpg', alt: data.title, width: 800, height: 1000 },
          season: (data.season || '연중') as Season,
          tags: [],
          publishedAt: data.published_at || data.created_at || new Date().toISOString(),
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

  // Mock에 없으면 post 객체 내장 데이터 또는 Supabase에서 본문(content) 직접 가져오기
  const rawPost = post as any
  let dbContent = rawPost.content || ''
  let dbBibleText: string | undefined = rawPost.bibleText || undefined
  let dbKeyVerse: string | undefined = rawPost.keyVerse || undefined

  if (!detail && !dbContent) {
    try {
      const client = supabaseAdmin || supabase
      const { data } = await client
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
