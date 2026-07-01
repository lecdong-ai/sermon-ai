import { NextRequest, NextResponse } from 'next/server'
import { generatePptx } from '@/lib/pptx'
import type { PptSlide } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { slides, title, theme } = await request.json()

    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json({ success: false, error: '슬라이드 데이터가 필요합니다.' }, { status: 400 })
    }

    const buffer = await generatePptx(slides as PptSlide[], title || 'PPT', theme || 'modern')

    const fileName = encodeURIComponent(`${title || 'ppt'}-${Date.now()}.pptx`)

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename*=UTF-8''${fileName}`,
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (err: any) {
    console.error('PPTX download error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'PPTX 생성 중 오류가 발생했습니다.' },
      { status: 500 },
    )
  }
}
