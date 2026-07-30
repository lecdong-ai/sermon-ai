import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const generation = (formData.get('generation') as string) || 'common'

    if (!file) {
      return NextResponse.json({ error: '파일이 업로드되지 않았습니다.' }, { status: 400 })
    }

    // 한글 NFD -> NFC 정규화 (macOS 파일명 분리 현상 방지)
    const normalizedName = file.name.normalize('NFC')
    const safeBaseName = normalizedName.replace(/[^a-zA-Z0-9가-힣._-]/g, '_')
    const timeStamp = Date.now()
    const filePath = `generational-qt/${encodeURIComponent(generation)}/${timeStamp}_${safeBaseName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const BUCKET_NAME = 'qt-files'

    // 1. 버킷 존재 여부 확인 및 생성 (없으면 자동 생성 시도)
    try {
      const { data: buckets } = await supabaseAdmin.storage.listBuckets()
      const bucketExists = buckets?.some(b => b.name === BUCKET_NAME)
      if (!bucketExists) {
        await supabaseAdmin.storage.createBucket(BUCKET_NAME, { public: true })
      }
    } catch (e) {
      console.warn('Storage list/create bucket warning:', e)
    }

    // 2. Supabase Storage 파일 업로드
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type || 'application/pdf',
        upsert: true,
      })

    if (uploadError) {
      console.error('Supabase Storage upload error:', uploadError)
      return NextResponse.json(
        { error: `저장소 업로드 실패: ${uploadError.message}` },
        { status: 500 }
      )
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(uploadData.path)

    return NextResponse.json({
      name: normalizedName,
      url: urlData.publicUrl,
      type: file.type || 'application/pdf',
      size: file.size,
    })
  } catch (err: any) {
    console.error('Generational QT upload route error:', err)
    return NextResponse.json(
      { error: err.message || '파일 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
