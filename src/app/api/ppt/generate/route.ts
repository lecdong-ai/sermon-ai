import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase'
import { generatePptSlides } from '@/lib/gemini'

function getSupabaseAdmin(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() {},
      },
    },
  )
}

async function getUserFromRequest(request: NextRequest) {
  const sb = getSupabaseAdmin(request)
  return sb.auth.getUser().then((r) => r.data.user)
}

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

    const slides = await generatePptSlides(text, { theme, slideCount })

    if (sermonId && user) {
      const { data: ownerCheck } = await supabaseAdmin
        .from('sermons')
        .select('user_id')
        .eq('id', sermonId)
        .single()

      if (ownerCheck && ownerCheck.user_id === user.id) {
        const { data: existing } = await supabaseAdmin
          .from('sermons')
          .select('result')
          .eq('id', sermonId)
          .single()

        const merged = {
          ...(existing?.result || {}),
          ppt: { slides },
        }

        await supabaseAdmin
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
