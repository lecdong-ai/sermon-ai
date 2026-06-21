import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase'

async function getUser(request: NextRequest) {
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() {},
      },
    },
  )
  const { data } = await sb.auth.getUser()
  return data?.user ?? null
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('series')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    const series = (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description || '',
      startDate: row.start_date || '',
      endDate: row.end_date || '',
      status: row.status || 'active',
      isSample: !!row.is_sample,
      createdAt: row.created_at || '',
    }))

    return NextResponse.json({ success: true, data: series })
  } catch (err: any) {
    console.error('GET /api/series error:', err)
    return NextResponse.json({ success: false, error: err.message || '조회 실패' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const id = `series-${Date.now()}`

    const { data, error } = await supabaseAdmin
      .from('series')
      .insert({
        id,
        user_id: user.id,
        name: body.name || '',
        description: body.description || null,
        start_date: body.startDate || null,
        end_date: body.endDate || null,
        status: body.status || 'active',
      })
      .select()
      .single()

    if (error) throw error

    const series = {
      id: data.id,
      name: data.name,
      description: data.description || '',
      startDate: data.start_date || '',
      endDate: data.end_date || '',
      status: data.status || 'active',
      isSample: !!data.is_sample,
      createdAt: data.created_at || '',
    }

    return NextResponse.json({ success: true, data: series }, { status: 201 })
  } catch (err: any) {
    console.error('POST /api/series error:', err)
    return NextResponse.json({ success: false, error: err.message || '생성 실패' }, { status: 500 })
  }
}
