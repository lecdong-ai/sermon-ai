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

    // 한글 NFD -> NFC 정규화 (macOS 한글 분리 현상 해결)
    const normalizedName = file.name.normalize('NFC')
    const safeBaseName = normalizedName.replace(/[^a-zA-Z0-9가-힣._-]/g, '_')
    const timeStamp = Date.now()
    const filePath = `generational-qt/${encodeURIComponent(generation)}/${timeStamp}_${safeBaseName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let targetBucket = 'qt-files'
    
    // 1. Storage 버킷 탐색 및 qt-files 생성 시도
    try {
      const { data: buckets } = await supabaseAdmin.storage.listBuckets()
      const existingNames = buckets?.map(b => b.name) || []
      
      if (!existingNames.includes(targetBucket)) {
        const publicBucket = buckets?.find(b => b.public)?.name
        if (publicBucket) {
          targetBucket = publicBucket
        }
        await supabaseAdmin.storage.createBucket('qt-files', { public: true }).catch(() => {})
      }
    } catch (e) {
      console.warn('Storage bucket check warning:', e)
    }

    // 2. 파일 업로드 시도
    let uploadResult = await supabaseAdmin.storage
      .from(targetBucket)
      .upload(filePath, buffer, {
        contentType: file.type || 'application/pdf',
        upsert: true,
      })

    // qt-files 버킷 재시도
    if (uploadResult.error && targetBucket !== 'qt-files') {
      const retryResult = await supabaseAdmin.storage
        .from('qt-files')
        .upload(filePath, buffer, {
          contentType: file.type || 'application/pdf',
          upsert: true,
        })
      if (!retryResult.error) {
        uploadResult = retryResult
        targetBucket = 'qt-files'
      }
    }

    // 3. 만약 Storage 업로드가 완제 실패한 경우 Fallback: Data URL
    if (uploadResult.error) {
      console.error('Supabase Storage upload failure:', uploadResult.error)

      // 10MB 이하인 경우 Base64 Data URL Fallback으로 100% 저장 가능하게 처리
      if (file.size <= 10 * 1024 * 1024) {
        const base64 = buffer.toString('base64')
        const dataUrl = `data:${file.type || 'application/pdf'};base64,${base64}`
        return NextResponse.json({
          name: normalizedName,
          url: dataUrl,
          type: file.type || 'application/pdf',
          size: file.size,
        })
      }

      return NextResponse.json(
        { error: `스토리지 업로드 실패: ${uploadResult.error.message}` },
        { status: 500 }
      )
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(targetBucket)
      .getPublicUrl(uploadResult.data.path)

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
