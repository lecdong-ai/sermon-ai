import { NextRequest, NextResponse } from 'next/server'
import { projectSupabaseAdmin } from '@/lib/project/supabase'
import { getUserFromRequest } from '@/lib/project/auth'
import { generateCoreMessage } from '@/lib/ai/sermon-service'
import type { CoreMessageResult } from '@/types'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { data: sermon, error } = await projectSupabaseAdmin
      .from('sermons')
      .select('id, user_id')
      .eq('id', params.id)
      .single()

    if (error || !sermon) {
      return NextResponse.json({ success: false, error: '설교를 찾을 수 없습니다.' }, { status: 404 })
    }
    if (sermon.user_id !== user.id) {
      return NextResponse.json({ success: false, error: '접근 권한이 없습니다.' }, { status: 403 })
    }

    const body = await request.json()
    const passage = body.passage || ''
    const topic = body.topic || ''

    if (!passage.trim()) {
      return NextResponse.json({ success: false, error: '성경본문을 입력해주세요.' }, { status: 400 })
    }
    if (!topic.trim()) {
      return NextResponse.json({ success: false, error: '주제를 입력해주세요.' }, { status: 400 })
    }

    const result = await generateCoreMessage({
      passage: passage,
      observation_notes: topic,
      audience: [],
      church_context: '',
    })

    await projectSupabaseAdmin.from('generated_outputs').insert({
      sermon_id: params.id,
      type: 'core_message',
      input_data: { passage: passage },
      output_data: result,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (err: any) {
    console.error('POST /api/sermons/[id]/ai/generate-core-message error:', err)
    return NextResponse.json({ success: false, error: err.message || '생성 실패' }, { status: 500 })
  }
}
