import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const LIST_FILE = path.join(process.cwd(), 'src/lib/data-source/mock/qt.json')
const DETAIL_FILE = path.join(process.cwd(), 'src/lib/data-source/mock/qt-detail.json')

const SEASONS = ['연중', '대림', '성탄', '사순', '부활'] as const
type Season = typeof SEASONS[number]

interface QtListItem {
  id: string
  slug: string
  title: string
  excerpt: string
  thumbnail: { src: string; alt: string; width?: number; height?: number }
  season: Season
  bibleRange?: string
  tags: { id: string; slug: string; name: string }[]
  publishedAt: string
  isFree: true
  readTime?: number
  viewCount?: number
}

interface QtDetailItem {
  slug: string
  content: string
  bibleText?: string
  keyVerse?: string
  downloads: { pdf?: string; text?: string }
}

async function readJson<T>(file: string): Promise<T> {
  const raw = await fs.readFile(file, 'utf-8')
  return JSON.parse(raw)
}

async function writeJson(file: string, data: unknown) {
  await fs.writeFile(file, JSON.stringify(data, null, 2) + '\n', 'utf-8')
}

function makeSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return `${base}-${Date.now().toString(36)}`
}

export async function GET() {
  try {
    const data = await readJson<{ items: QtListItem[] }>(LIST_FILE)
    return NextResponse.json({ items: data.items })
  } catch (e) {
    console.error('qt-json GET error:', e)
    return NextResponse.json({ items: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      excerpt,
      content,
      biblePassage,
      bibleText,
      keyVerse,
      season,
      thumbnailSrc,
      thumbnailAlt,
      tags,
    } = body

    if (!title || !title.trim()) {
      return NextResponse.json({ error: '제목은 필수입니다' }, { status: 400 })
    }

    const seasonValue: Season = SEASONS.includes(season) ? season : '연중'
    const slug = makeSlug(title)
    const id = `qt-json-${Date.now().toString(36)}`
    const now = new Date().toISOString()

    const listData = await readJson<{ items: QtListItem[] }>(LIST_FILE)

    const newItem: QtListItem = {
      id,
      slug,
      title: title.trim(),
      excerpt: excerpt?.trim() || '',
      thumbnail: {
        src: thumbnailSrc?.trim() || `https://picsum.photos/seed/${slug}/800/1000`,
        alt: thumbnailAlt?.trim() || title.trim(),
        width: 800,
        height: 1000,
      },
      season: seasonValue,
      bibleRange: biblePassage?.trim() || undefined,
      tags: Array.isArray(tags)
        ? tags.map((t: string, i: number) => ({
            id: `tag-${id}-${i}`,
            slug: t.toLowerCase().replace(/\s+/g, '-'),
            name: t,
          }))
        : [],
      publishedAt: now,
      isFree: true,
      viewCount: 0,
    }

    listData.items.unshift(newItem)
    await writeJson(LIST_FILE, listData)

    if (content?.trim()) {
      const detailData = await readJson<{ items: QtDetailItem[] }>(DETAIL_FILE)
      const newDetail: QtDetailItem = {
        slug,
        content: content.trim(),
        bibleText: bibleText?.trim() || undefined,
        keyVerse: keyVerse?.trim() || undefined,
        downloads: {},
      }
      detailData.items.unshift(newDetail)
      await writeJson(DETAIL_FILE, detailData)
    }

    return NextResponse.json({ ok: true, item: newItem }, { status: 201 })
  } catch (e: any) {
    console.error('qt-json POST error:', e)
    return NextResponse.json({ error: e.message || '저장 실패' }, { status: 500 })
  }
}
