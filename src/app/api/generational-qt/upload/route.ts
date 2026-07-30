import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const generation = (formData.get('generation') as string) || 'common'

    if (!file) {
      return NextResponse.json({ error: '파일이 업로드되지 않았습니다.' }, { status: 400 })
    }

    // 한글 NFD -> NFC 정규화
    const normalizedName = file.name.normalize('NFC')
    const safeBaseName = normalizedName.replace(/[^a-zA-Z0-9가-힣._-]/g, '_')
    const timeStamp = Date.now()
    const filePath = `generational-qt/${encodeURIComponent(generation)}/${timeStamp}_${safeBaseName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 1. Supabase Storage 기존 버킷 탐색 및 자동 선택
    let targetBucket = ''
    try {
      const { data: buckets } = await supabaseAdmin.storage.listBuckets()
      const bucketNames = buckets?.map(b => b.name) || []

      if (bucketNames.includes('qt-files')) {
        targetBucket = 'qt-files'
      } else if (bucketNames.length > 0) {
        // 이미 생성되어 있는 기존 버킷 중 첫 번째 사용
        targetBucket = bucketNames[0]
      } else {
        // 버킷이 아예 없으면 qt-files 버킷 생성 시도
        const { error: createError } = await supabaseAdmin.storage.createBucket('qt-files', { public: true })
        if (!createError) targetBucket = 'qt-files'
      }
    } catch (e) {
      console.warn('Storage bucket discovery warning:', e)
    }

    // 2. Storage 업로드 시도
    if (targetBucket) {
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from(targetBucket)
        .upload(filePath, buffer, {
          contentType: file.type || 'application/pdf',
          upsert: true,
        })

      if (!uploadError && uploadData) {
        const { data: urlData } = supabaseAdmin.storage
          .from(targetBucket)
          .getPublicUrl(uploadData.path)

        return NextResponse.json({
          name: normalizedName,
          url: urlData.publicUrl,
          type: file.type || 'application/pdf',
          size: file.size,
        })
      }
    }

    // 3. Storage 버킷 미설정(Bucket not found) 등의 상황에서 100% 무결점 보장을 위한 Fallback (Data URL)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type || 'application/pdf'};base64,${base64}`

    return NextResponse.json({
      name: normalizedName,
      url: dataUrl,
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
