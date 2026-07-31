import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  // Service Role 특권으로 qt-files 퍼블릭 버킷 자동 생성 및 검증
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets()
    const bucketNames = buckets?.map(b => b.name) || []
    if (!bucketNames.includes('qt-files')) {
      await supabaseAdmin.storage.createBucket('qt-files', { public: true, fileSizeLimit: 104857600 }) // 100MB
    }
  } catch (e) {
    console.warn('Bucket auto-creation in GET failed:', e)
  }

  const { searchParams } = new URL(request.url)
  const generation = searchParams.get('generation')

  let query = supabase
    .from('generational_qt')
    .select('*')
    .order('created_at', { ascending: false })

  if (generation) {
    query = query.eq('generation', generation)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: `조회 실패: ${error.message}` }, { status: 500 })
  }

  return NextResponse.json(data || [])
}

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { generation, title, description, bible_passage, week_label, files } = body

    if (!generation || !title) {
      return NextResponse.json({ error: '세대와 제목은 필수 입력 항목입니다.' }, { status: 400 })
    }

    // files 배열의 URL이 Data URL(base64)인 경우 DB JSONB 부하 방지를 위해 차단
    const filesArr = Array.isArray(files) ? files : []
    for (const f of filesArr) {
      if (typeof f.url === 'string' && f.url.startsWith('data:') && f.size > 100 * 1024) {
        return NextResponse.json(
          { error: `파일 "${f.name || '알 수 없음'}"이(가) 너무 커서 DB에 직접 저장할 수 없습니다. Storage 업로드를 이용해 주세요.` },
          { status: 400 }
        )
      }
    }

    const insertPayload = {
      generation: String(generation),
      title: String(title),
      description: description ? String(description) : '',
      bible_passage: bible_passage ? String(bible_passage) : '',
      week_label: week_label ? String(week_label) : '',
      files: filesArr,
    }

    const { data, error } = await supabaseAdmin
      .from('generational_qt')
      .insert(insertPayload)
      .select()

    if (error) {
      console.error('Failed to create generational QT:', error)
      return NextResponse.json(
        { error: `DB 저장 실패 [${error.code || 'ERR'}]: ${error.message || error.details || '알 수 없는 오류'}` },
        { status: 400 }
      )
    }

    return NextResponse.json(data?.[0] || insertPayload, { status: 201 })
  } catch (err: any) {
    console.error('Generational QT POST error:', err)
    return NextResponse.json(
      { error: `서버 예외 발생: ${err.message || '저장 중 오류가 발생했습니다.'}` },
      { status: 500 }
    )
  }
}
