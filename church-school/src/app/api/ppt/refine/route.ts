import { NextRequest, NextResponse } from 'next/server'
import { refineSlideGpt } from '@/lib/workspace/openai'
import type { PptSlide } from '@/types/workspace'

export async function POST(request: NextRequest) {
  try {
    const { slide, instruction, theme } = await request.json()

    if (!slide || !instruction) {
      return NextResponse.json({ success: false, error: '슬라이드와 수정 요청이 필요합니다.' }, { status: 400 })
    }

    const refined = await refineSlideGpt(slide as PptSlide, instruction, theme)

    return NextResponse.json({ success: true, slide: refined })
  } catch (err: any) {
    console.error('PPT refine error:', err)
    return NextResponse.json(
      { success: false, error: err.message || '슬라이드 수정 중 오류가 발생했습니다.' },
      { status: 500 },
    )
  }
}
