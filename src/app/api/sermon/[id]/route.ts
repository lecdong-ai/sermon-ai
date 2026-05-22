import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin as db } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll() {},
        },
      },
    )
    const { data: { user } } = await supabaseAdmin.auth.getUser()

    const { data, error } = await db
      .from('sermons')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: '설교를 찾을 수 없습니다.' }, { status: 404 })
    }

    if (!user || !data.user_id || data.user_id !== user.id) {
      return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
