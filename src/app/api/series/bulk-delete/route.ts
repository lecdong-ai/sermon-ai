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

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const filter: string = body?.filter || 'all'

    if (filter !== 'all' && filter !== 'sample') {
      return NextResponse.json({ success: false, error: 'filter는 "all" 또는 "sample"이어야 합니다.' }, { status: 400 })
    }

    // 먼저 삭제 대상 조회 (응답에 개수 포함하기 위함)
    let countQuery = supabaseAdmin
      .from('series')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
    if (filter === 'sample') {
      countQuery = countQuery.eq('is_sample', true)
    }
    const { count } = await countQuery

    if (!count || count === 0) {
      return NextResponse.json({ success: true, deleted: 0, message: '삭제할 시리즈가 없습니다.' })
    }

    let deleteQuery = supabaseAdmin
      .from('series')
      .delete()
      .eq('user_id', user.id)
    if (filter === 'sample') {
      deleteQuery = deleteQuery.eq('is_sample', true)
    }

    const { error } = await deleteQuery

    if (error) throw error

    return NextResponse.json({
      success: true,
      deleted: count,
      message: filter === 'sample'
        ? `샘플 시리즈 ${count}개를 삭제했습니다.`
        : `전체 시리즈 ${count}개를 삭제했습니다.`,
    })
  } catch (err: any) {
    console.error('POST /api/series/bulk-delete error:', err)
    return NextResponse.json({ success: false, error: err.message || '일괄 삭제 실패' }, { status: 500 })
  }
}
