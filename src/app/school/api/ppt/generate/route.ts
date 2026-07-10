import { NextRequest, NextResponse } from 'next/server'
import { projectSupabaseAdmin } from '@/lib/school/project/supabase'
import { getUserFromRequest } from '@/lib/school/project/auth'
import { generatePptSlidesGpt } from '@/lib/school/workspace/openai'

export async function POST(request: NextRequest) {
  try {
    const { sermonId, text, theme, slideCount } = await request.json()

    if (!text) {
      return NextResponse.json({ success: false, error: '텍스트가 필요합니다.' }, { status: 400 })
    }

    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const slides = await generatePptSlidesGpt(text, { theme, slideCount })

    if (sermonId && user) {
      const { data: ownerCheck } = await projectSupabaseAdmin
        .from('sermons')
        .select('user_id')
        .eq('id', sermonId)
        .single()

      if (ownerCheck && ownerCheck.user_id === user.id) {
        const { data: existing } = await projectSupabaseAdmin
          .from('sermons')
          .select('result')
          .eq('id', sermonId)
          .single()

        const merged = {
          ...(existing?.result || {}),
          ppt: { slides },
        }

        await projectSupabaseAdmin
          .from('sermons')
          .update({ result: merged })
          .eq('id', sermonId)
      }
    }

    return NextResponse.json({ success: true, slides })
  } catch (err: any) {
    console.error('PPT generate error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'PPT 생성 중 오류가 발생했습니다.' },
      { status: 500 },
    )
  }
}
