import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase'
import { generateStudyGuide } from '@/lib/openai'
import type { StudyGuideInput, StudyGuideRecord } from '@/types'

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
      .from('study_guides')
      .select('id, input_data, output_data, version, is_edited, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('GET /api/study-guide error:', err)
    return NextResponse.json({ success: false, error: err.message || '조회 실패' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body: StudyGuideInput = await request.json()

    if (!body.title?.trim()) {
      return NextResponse.json({ success: false, error: '설교 제목을 입력해주세요.' }, { status: 400 })
    }
    if (!body.passage?.trim()) {
      return NextResponse.json({ success: false, error: '성경본문을 입력해주세요.' }, { status: 400 })
    }
    if (!body.sermonText?.trim() || body.sermonText.trim().length < 100) {
      return NextResponse.json({ success: false, error: '설교원고는 최소 100자 이상 입력해주세요.' }, { status: 400 })
    }

    const output = await generateStudyGuide(body)

    const { data, error } = await supabaseAdmin
      .from('study_guides')
      .insert({
        user_id: user.id,
        version: 1,
        input_data: body,
        output_data: output,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (err: any) {
    console.error('POST /api/study-guide error:', err)
    return NextResponse.json({ success: false, error: err.message || '생성 실패' }, { status: 500 })
  }
}
