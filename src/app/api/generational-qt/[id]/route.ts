import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const maxDuration = 60

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(props.params)
    const id = resolvedParams.id

    if (!id) {
      return NextResponse.json({ error: '유효한 ID가 없습니다.' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('generational_qt')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete generational QT:', error)
      return NextResponse.json({ error: `삭제 실패: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Delete route exception:', err)
    return NextResponse.json({ error: err.message || '삭제 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(props.params)
    const id = resolvedParams.id

    if (!id) {
      return NextResponse.json({ error: '유효한 ID가 없습니다.' }, { status: 400 })
    }

    const body = await request.json()
    const { generation, title, description, bible_passage, week_label, files, removedFiles } = body

    const patch: Record<string, unknown> = {}
    if (generation !== undefined) patch.generation = String(generation)
    if (title !== undefined) {
      if (!title) {
        return NextResponse.json({ error: '제목은 필수 입력 항목입니다.' }, { status: 400 })
      }
      patch.title = String(title)
    }
    if (description !== undefined) patch.description = String(description)
    if (bible_passage !== undefined) patch.bible_passage = String(bible_passage)
    if (week_label !== undefined) patch.week_label = String(week_label)

    // files 배열의 URL이 Data URL(base64)인 경우 DB JSONB 부하 방지를 위해 차단
    if (files !== undefined) {
      const filesArr = Array.isArray(files) ? files : []
      for (const f of filesArr) {
        if (typeof f.url === 'string' && f.url.startsWith('data:') && f.size > 100 * 1024) {
          return NextResponse.json(
            { error: `파일 "${f.name || '알 수 없음'}"이(가) 너무 커서 DB에 직접 저장할 수 없습니다. Storage 업로드를 이용해 주세요.` },
            { status: 400 }
          )
        }
      }
      patch.files = filesArr
    }

    // 제거된 기존 파일을 Storage에서 삭제
    if (Array.isArray(removedFiles) && removedFiles.length > 0) {
      const objects: { bucket: string; path: string }[] = []
      for (const url of removedFiles) {
        try {
          const parsed = new URL(url)
          const match = parsed.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/)
          if (match) {
            objects.push({ bucket: match[1], path: match[2] })
          }
        } catch {
          // URL 파싱 실패 시 무시
        }
      }
      if (objects.length > 0) {
        try {
          const byBucket = new Map<string, string[]>()
          for (const obj of objects) {
            if (!byBucket.has(obj.bucket)) byBucket.set(obj.bucket, [])
            byBucket.get(obj.bucket)!.push(obj.path)
          }
          for (const [bucket, paths] of byBucket) {
            await supabaseAdmin.storage.from(bucket).remove(paths)
          }
        } catch (e) {
          console.warn('Removed file storage cleanup warning:', e)
        }
      }
    }

    const { data, error } = await supabaseAdmin
      .from('generational_qt')
      .update(patch)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Failed to update generational QT:', error)
      return NextResponse.json(
        { error: `수정 실패 [${error.code || 'ERR'}]: ${error.message || error.details || '알 수 없는 오류'}` },
        { status: 400 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: '해당 자료를 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json(data[0])
  } catch (err: any) {
    console.error('PATCH route exception:', err)
    return NextResponse.json({ error: err.message || '수정 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
