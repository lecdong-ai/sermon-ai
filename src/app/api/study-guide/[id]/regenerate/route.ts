import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest, checkOpenAIRateLimit } from '@/lib/auth'
import { generateStudyGuide } from '@/lib/openai'

import type { StudyGuideInput } from '@/types'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('study_guides')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ success: false, error: '교재를 찾을 수 없습니다.' }, { status: 404 })
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json({ success: false, error: '접근 권한이 없습니다.' }, { status: 403 })
    }

    const input = existing.input_data as StudyGuideInput
    const body = await request.json().catch(() => ({}))

    const mergedInput: StudyGuideInput = {
      ...input,
      ...(body.input || {}),
    }

    const output = await generateStudyGuide(mergedInput)

    const newVersion = existing.version + 1

    const { data, error } = await supabaseAdmin
      .from('study_guides')
      .update({
        output_data: output,
        version: newVersion,
        is_edited: false,
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error



    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('POST /api/study-guide/[id]/regenerate error:', err)
    return NextResponse.json({ success: false, error: err.message || '재생성 실패' }, { status: 500 })
  }
}
