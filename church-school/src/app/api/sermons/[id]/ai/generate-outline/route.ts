import { NextRequest, NextResponse } from 'next/server'
import { projectSupabaseAdmin } from '@/lib/project/supabase'
import { getUserFromRequest } from '@/lib/project/auth'
import { generateOutline } from '@/lib/ai/sermon-service'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { data: sermon, error } = await projectSupabaseAdmin
      .from('sermons')
      .select('id, user_id, passage, church_context, audience')
      .eq('id', params.id)
      .single()

    if (error || !sermon) {
      return NextResponse.json({ success: false, error: '설교를 찾을 수 없습니다.' }, { status: 404 })
    }
    if (sermon.user_id !== user.id) {
      return NextResponse.json({ success: false, error: '접근 권한이 없습니다.' }, { status: 403 })
    }

    const { data: notes } = await projectSupabaseAdmin
      .from('sermon_notes')
      .select('observation_notes, core_message')
      .eq('sermon_id', params.id)
      .maybeSingle()

    if (!notes?.core_message?.trim()) {
      return NextResponse.json({ success: false, error: '핵심 메시지를 먼저 입력하면 더 집중된 개요를 생성할 수 있습니다.' }, { status: 400 })
    }

    const result = await generateOutline({
      passage: sermon.passage,
      core_message: notes.core_message,
      church_context: sermon.church_context || '',
      audience: sermon.audience || [],
    })

    await projectSupabaseAdmin.from('generated_outputs').insert({
      sermon_id: params.id,
      type: 'outline',
      input_data: { passage: sermon.passage, core_message: notes.core_message },
      output_data: result,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (err: any) {
    console.error('POST /api/sermons/[id]/ai/generate-outline error:', err)
    return NextResponse.json({ success: false, error: err.message || '생성 실패' }, { status: 500 })
  }
}
