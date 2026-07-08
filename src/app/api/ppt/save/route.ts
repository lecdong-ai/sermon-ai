import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase'

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
    const { sermonId, slides } = await request.json()

    if (!sermonId || !slides) {
      return NextResponse.json({ success: false, error: '필수 파라미터가 없습니다.' }, { status: 400 })
    }

    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { data: ownerCheck } = await supabaseAdmin
      .from('sermons')
      .select('user_id')
      .eq('id', sermonId)
      .single()

    if (!ownerCheck || ownerCheck.user_id !== user.id) {
      return NextResponse.json({ success: false, error: '접근 권한이 없습니다.' }, { status: 403 })
    }

    const slidesCleaned = slides as any[]

    const { data: existing } = await supabaseAdmin
      .from('sermons')
      .select('result')
      .eq('id', sermonId)
      .single()

    const merged = {
      ...(existing?.result || {}),
      ppt: { slides: slidesCleaned },
    }

    const { error } = await supabaseAdmin
      .from('sermons')
      .update({ result: merged })
      .eq('id', sermonId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('PPT save error:', err)
    return NextResponse.json(
      { success: false, error: err.message || '저장 실패' },
      { status: 500 },
    )
  }
}
