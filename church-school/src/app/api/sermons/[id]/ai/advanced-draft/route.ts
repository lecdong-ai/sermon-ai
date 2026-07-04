import { NextRequest, NextResponse } from 'next/server'
import { projectSupabaseAdmin } from '@/lib/project/supabase'
import { getUserFromRequest } from '@/lib/project/auth'
import { generateAdvancedDraft } from '@/lib/ai/sermon-service'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json().catch(() => ({}))

    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { data: sermon, error } = await projectSupabaseAdmin
      .from('sermons')
      .select('id, user_id, passage, title, sermon_date, series, church_context, audience')
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
      .select('observation_notes, core_message, background_notes, interpretation_notes, illustration_notes, application_points')
      .eq('sermon_id', params.id)
      .maybeSingle()

    let outlineData = null
    const { data: outline } = await projectSupabaseAdmin
      .from('sermon_outlines')
      .select('*')
      .eq('sermon_id', params.id)
      .maybeSingle()

    if (outline) {
      outlineData = {
        introduction: outline.introduction,
        main_points: outline.main_points,
        conclusion: outline.conclusion,
      }
    }

    const result = await generateAdvancedDraft({
      title: sermon.title || '',
      passage: sermon.passage,
      sermon_date: sermon.sermon_date || '',
      series: sermon.series || '',
      core_message: notes?.core_message || '',
      church_context: sermon.church_context || '',
      audience: sermon.audience || [],
      outline: outlineData,
      observation_notes: notes?.observation_notes || '',
      background_notes: notes?.background_notes || '',
      interpretation_notes: notes?.interpretation_notes || '',
      illustration_notes: notes?.illustration_notes || '',
      application_points: notes?.application_points || '',
    })

    await projectSupabaseAdmin.from('generated_outputs').insert({
      sermon_id: params.id,
      type: 'advanced_draft',
      input_data: { passage: sermon.passage, core_message: notes?.core_message },
      output_data: { full_text: result },
    })

    return NextResponse.json({ success: true, data: { full_text: result } })
  } catch (err: any) {
    console.error('POST /api/sermons/[id]/ai/advanced-draft error:', err)
    return NextResponse.json({ success: false, error: err.message || '생성 실패' }, { status: 500 })
  }
}
