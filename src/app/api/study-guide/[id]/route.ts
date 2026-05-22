import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase'
import type { StudyGuideOutput } from '@/types'

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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('study_guides')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ success: false, error: '교재를 찾을 수 없습니다.' }, { status: 404 })
    }

    if (data.user_id !== user.id) {
      return NextResponse.json({ success: false, error: '접근 권한이 없습니다.' }, { status: 403 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('GET /api/study-guide/[id] error:', err)
    return NextResponse.json({ success: false, error: err.message || '조회 실패' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('study_guides')
      .select('id, user_id')
      .eq('id', params.id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ success: false, error: '교재를 찾을 수 없습니다.' }, { status: 404 })
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json({ success: false, error: '접근 권한이 없습니다.' }, { status: 403 })
    }

    const { error } = await supabaseAdmin
      .from('study_guides')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('DELETE /api/study-guide/[id] error:', err)
    return NextResponse.json({ success: false, error: err.message || '삭제 실패' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('study_guides')
      .select('id, user_id, version')
      .eq('id', params.id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ success: false, error: '교재를 찾을 수 없습니다.' }, { status: 404 })
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json({ success: false, error: '접근 권한이 없습니다.' }, { status: 403 })
    }

    const body = await request.json()
    const updates: any = { is_edited: true }

    if (body.output_data) {
      updates.output_data = body.output_data as StudyGuideOutput
    }
    if (body.input_data) {
      updates.input_data = body.input_data
    }

    const { data, error } = await supabaseAdmin
      .from('study_guides')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('PUT /api/study-guide/[id] error:', err)
    return NextResponse.json({ success: false, error: err.message || '수정 실패' }, { status: 500 })
  }
}
