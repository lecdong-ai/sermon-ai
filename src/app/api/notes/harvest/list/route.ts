import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase'

async function getUser(request: NextRequest) {
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { getAll() { return request.cookies.getAll() }, setAll() {} },
    },
  )
  const { data } = await sb.auth.getUser()
  return data?.user ?? null
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const sermonId = searchParams.get('sermonId')
    if (!sermonId) {
      return NextResponse.json({ success: false, error: 'sermonId가 필요합니다.' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('sermon_derivatives')
      .select('type, content, created_at, updated_at')
      .eq('sermon_id', sermonId)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true, data: data || [] })
  } catch (err: any) {
    console.error('GET /api/notes/harvest/list error:', err)
    return NextResponse.json({ success: false, error: err.message || '조회 실패' }, { status: 500 })
  }
}
