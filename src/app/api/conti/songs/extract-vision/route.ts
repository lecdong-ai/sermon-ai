import { NextRequest, NextResponse } from 'next/server'
import { extractFromImage } from '@/lib/conti/visionAi'
import { getUser, unauthorized, badRequest, serverError } from '@/lib/conti/apiHelpers'

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) return unauthorized()

    const body = await request.json()
    const { image } = body

    if (!image || typeof image !== 'string') {
      return badRequest('이미지 데이터가 필요합니다.')
    }

    if (!image.startsWith('data:image/')) {
      return badRequest('올바른 이미지 형식이 아닙니다.')
    }

    const maxSize = 20 * 1024 * 1024
    const rawSize = Math.round((image.length * 3) / 4)
    if (rawSize > maxSize) {
      return badRequest('이미지 크기가 너무 큽니다. (최대 20MB)')
    }

    const result = await extractFromImage(image)

    return NextResponse.json({ success: true, data: result })
  } catch (err: any) {
    console.error('POST /api/conti/songs/extract-vision error:', err)
    return serverError(err.message || 'OCR 분석 중 오류가 발생했습니다.')
  }
}
