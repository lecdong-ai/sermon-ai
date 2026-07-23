import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const LIST_FILE = path.join(process.cwd(), 'src/lib/data-source/mock/qt.json')
const DETAIL_FILE = path.join(process.cwd(), 'src/lib/data-source/mock/qt-detail.json')

async function readJson<T>(file: string): Promise<T> {
  const raw = await fs.readFile(file, 'utf-8')
  return JSON.parse(raw)
}

async function writeJson(file: string, data: unknown) {
  await fs.writeFile(file, JSON.stringify(data, null, 2) + '\n', 'utf-8')
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const listData = await readJson<{ items: any[] }>(LIST_FILE)
    const target = listData.items.find((item) => item.id === id)

    if (!target) {
      return NextResponse.json({ error: '항목을 찾을 수 없습니다' }, { status: 404 })
    }

    listData.items = listData.items.filter((item) => item.id !== id)
    await writeJson(LIST_FILE, listData)

    const detailData = await readJson<{ items: any[] }>(DETAIL_FILE)
    detailData.items = detailData.items.filter((item) => item.slug !== target.slug)
    await writeJson(DETAIL_FILE, detailData)

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('qt-json DELETE error:', e)
    return NextResponse.json({ error: e.message || '삭제 실패' }, { status: 500 })
  }
}
