import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileType, generation } = await request.json()

    if (!fileName) {
      return NextResponse.json({ error: '파일명이 지정되지 않았습니다.' }, { status: 400 })
    }

    const normalizedName = (fileName as string).normalize('NFC')
    const safeBaseName = normalizedName.replace(/[^a-zA-Z0-9가-힣._-]/g, '_')
    const timeStamp = Date.now()
    const filePath = `generational-qt/${encodeURIComponent(generation || 'common')}/${timeStamp}_${safeBaseName}`

    const BUCKET_NAME = 'qt-files'

    // 1. Storage 버킷 존재 확인 및 자동 생성
    try {
      const { data: buckets } = await supabaseAdmin.storage.listBuckets()
      const bucketNames = buckets?.map(b => b.name) || []
      if (!bucketNames.includes(BUCKET_NAME)) {
        await supabaseAdmin.storage.createBucket(BUCKET_NAME, { public: true }).catch(() => {})
      }
    } catch (e) {
      console.warn('Bucket list/create warning:', e)
    }

    // 2. Service Role로 15분간 유효한 1회용 Signed Upload URL 생성
    const { data: signedData, error: signedError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .createSignedUploadUrl(filePath)

    if (signedError || !signedData) {
      console.error('Failed to create signed upload URL:', signedError)
      return NextResponse.json({ error: `서명된 업로드 URL 생성 실패: ${signedError?.message}` }, { status: 500 })
    }

    // 3. Public URL 추출
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    return NextResponse.json({
      signedUrl: signedData.signedUrl,
      token: signedData.token,
      path: filePath,
      publicUrl: urlData.publicUrl,
      fileName: normalizedName,
    })
  } catch (err: any) {
    console.error('Signed upload URL route exception:', err)
    return NextResponse.json({ error: err.message || '업로드 서명 요청 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
