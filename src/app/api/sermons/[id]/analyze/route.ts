import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'
import { generateAll } from '@/lib/openai'


export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { data: sermon, error } = await supabaseAdmin
      .from('sermons')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !sermon) {
      return NextResponse.json({ success: false, error: '설교를 찾을 수 없습니다.' }, { status: 404 })
    }
    if (sermon.user_id !== user.id) {
      return NextResponse.json({ success: false, error: '접근 권한이 없습니다.' }, { status: 403 })
    }

    const { data: notes } = await supabaseAdmin
      .from('sermon_notes')
      .select('observation_notes, background_notes, interpretation_notes, illustration_notes, application_points, core_message')
      .eq('sermon_id', params.id)
      .maybeSingle()

    let outlineText = ''
    const { data: outline } = await supabaseAdmin
      .from('sermon_outlines')
      .select('*')
      .eq('sermon_id', params.id)
      .maybeSingle()

    if (outline) {
      outlineText = [
        '--- 설교 개요 ---',
        '서론: ' + (outline.introduction || ''),
        ...(outline.main_points || []).map((p: any, i: number) => `본론 ${i+1}: ${p.title}${p.content ? ' - ' + p.content : ''}`),
        '결론: ' + (outline.conclusion || ''),
      ].join('\n')
    }

    const { data: manuscript } = await supabaseAdmin
      .from('sermon_manuscripts')
      .select('content')
      .eq('sermon_id', params.id)
      .maybeSingle()

    const fullText = [
      '제목: ' + (sermon.title || ''),
      '본문: ' + (sermon.passage || ''),
      '',
      manuscript?.content || '',
      '',
      outlineText,
      '',
      notes?.core_message ? '핵심 메시지: ' + notes.core_message : '',
      notes?.observation_notes ? '\n[본문 관찰]\n' + notes.observation_notes : '',
      notes?.background_notes ? '\n[배경 연구]\n' + notes.background_notes : '',
      notes?.interpretation_notes ? '\n[해석]\n' + notes.interpretation_notes : '',
      notes?.illustration_notes ? '\n[예화]\n' + notes.illustration_notes : '',
      notes?.application_points ? '\n[적용]\n' + notes.application_points : '',
    ].filter(Boolean).join('\n')

    const result = await generateAll(fullText)

    const { data: newSermon, error: insertError } = await supabaseAdmin
      .from('sermons')
      .insert({
        user_id: user.id,
        title: sermon.title || '제목 없음',
        passage: sermon.passage || '',
        file_name: '워크스페이스_원고.txt',
        raw_text: fullText,
        result: result,
      })
      .select()
      .single()

    if (insertError) throw insertError

    return NextResponse.json({
      success: true,
      data: {
        sermonId: newSermon.id,
      },
    })
  } catch (err: any) {
    console.error('POST /api/sermons/[id]/analyze error:', err)
    return NextResponse.json({ success: false, error: err.message || '분석 실패' }, { status: 500 })
  }
}
