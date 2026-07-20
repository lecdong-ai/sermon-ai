import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const generation = formData.get('generation') as string

    if (!file || !generation) {
      return NextResponse.json({ error: '파일과 세대 정보가 필요합니다' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = file.name.split('.').pop() || 'bin'
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const filePath = `${generation}/${fileName}`

    const { data, error } = await getSupabaseAdmin().storage
      .from('qt-files')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload failed:', error)
      return NextResponse.json({ error: '파일 업로드에 실패했습니다' }, { status: 500 })
    }

    const admin = getSupabaseAdmin()
    const { data: { publicUrl } } = admin.storage
      .from('qt-files')
      .getPublicUrl(filePath)

    return NextResponse.json({
      name: file.name,
      url: publicUrl,
      type: file.type,
      size: file.size,
    })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: '업로드 처리 중 오류가 발생했습니다' }, { status: 500 })
  }
}
