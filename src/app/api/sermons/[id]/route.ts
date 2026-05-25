import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'
import type { SermonOutline } from '@/types'

async function getSermon(id: string, userId: string) {
  const { data, error } = await supabaseAdmin
    .from('sermons')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  if (data.user_id !== userId) return null
  return data
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const sermon = await getSermon(params.id, user.id)
    if (!sermon) {
      return NextResponse.json({ success: false, error: '설교를 찾을 수 없습니다.' }, { status: 404 })
    }

    const [notes, outline, manuscript] = await Promise.all([
      supabaseAdmin.from('sermon_notes').select('*').eq('sermon_id', params.id).maybeSingle(),
      supabaseAdmin.from('sermon_outlines').select('*').eq('sermon_id', params.id).maybeSingle(),
      supabaseAdmin.from('sermon_manuscripts').select('*').eq('sermon_id', params.id).maybeSingle(),
    ])

    const fullData = {
      ...sermon,
      core_message: notes.data?.core_message || null,
      observation_notes: notes.data?.observation_notes || null,
      background_notes: notes.data?.background_notes || null,
      interpretation_notes: notes.data?.interpretation_notes || null,
      illustration_notes: notes.data?.illustration_notes || null,
      application_points: notes.data?.application_points || null,
      outline: outline.data?.main_points ? { introduction: outline.data.introduction, main_points: outline.data.main_points, conclusion: outline.data.conclusion } as SermonOutline : null,
      manuscript: manuscript.data?.content || null,
    }

    return NextResponse.json({ success: true, data: fullData })
  } catch (err: any) {
    console.error('GET /api/sermons/[id] error:', err)
    return NextResponse.json({ success: false, error: err.message || '조회 실패' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const sermon = await getSermon(params.id, user.id)
    if (!sermon) {
      return NextResponse.json({ success: false, error: '설교를 찾을 수 없습니다.' }, { status: 404 })
    }

    const body = await request.json()
    const updates: any = { updated_at: new Date().toISOString() }

    if (body.title !== undefined) updates.title = body.title
    if (body.passage !== undefined) updates.passage = body.passage
    if (body.book !== undefined) updates.book = body.book
    if (body.chapter_start !== undefined) updates.chapter_start = body.chapter_start
    if (body.chapter_end !== undefined) updates.chapter_end = body.chapter_end
    if (body.verse_start !== undefined) updates.verse_start = body.verse_start
    if (body.verse_end !== undefined) updates.verse_end = body.verse_end
    if (body.sermon_date !== undefined) updates.sermon_date = body.sermon_date
    if (body.series !== undefined) updates.series = body.series
    if (body.season !== undefined) updates.season = body.season
    if (body.audience !== undefined) updates.audience = body.audience
    if (body.church_context !== undefined) updates.church_context = body.church_context
    if (body.status !== undefined) updates.status = body.status

    if (body.status === 'completed' || body.manuscript !== undefined) {
      updates.version = sermon.version + 1

      await supabaseAdmin.from('sermon_versions').insert({
        sermon_id: params.id,
        version: sermon.version,
        snapshot: { ...sermon },
      })
    }

    const { error: sermonError } = await supabaseAdmin
      .from('sermons')
      .update(updates)
      .eq('id', params.id)

    if (sermonError) throw sermonError

    const noteFields = ['core_message', 'observation_notes', 'background_notes', 'interpretation_notes', 'illustration_notes', 'application_points']
    const noteUpdates: any = {}
    let hasNoteChanges = false
    for (const field of noteFields) {
      if (body[field] !== undefined) {
        noteUpdates[field] = body[field]
        hasNoteChanges = true
      }
    }

    if (hasNoteChanges) {
      const { data: existingNotes } = await supabaseAdmin
        .from('sermon_notes')
        .select('id')
        .eq('sermon_id', params.id)
        .maybeSingle()

      if (existingNotes) {
        await supabaseAdmin.from('sermon_notes').update(noteUpdates).eq('sermon_id', params.id)
      } else {
        await supabaseAdmin.from('sermon_notes').insert({ sermon_id: params.id, ...noteUpdates })
      }
    }

    if (body.outline !== undefined) {
      const outlineData = body.outline as SermonOutline
      const { data: existingOutline } = await supabaseAdmin
        .from('sermon_outlines')
        .select('id')
        .eq('sermon_id', params.id)
        .maybeSingle()

      if (existingOutline) {
        await supabaseAdmin.from('sermon_outlines').update({
          introduction: outlineData.introduction || null,
          conclusion: outlineData.conclusion || null,
          main_points: outlineData.main_points || [],
        }).eq('sermon_id', params.id)
      } else {
        await supabaseAdmin.from('sermon_outlines').insert({
          sermon_id: params.id,
          introduction: outlineData.introduction || null,
          conclusion: outlineData.conclusion || null,
          main_points: outlineData.main_points || [],
        })
      }
    }

    if (body.manuscript !== undefined) {
      const wordCount = body.manuscript ? body.manuscript.replace(/\s/g, '').length : 0
      const { data: existingManuscript } = await supabaseAdmin
        .from('sermon_manuscripts')
        .select('id')
        .eq('sermon_id', params.id)
        .maybeSingle()

      if (existingManuscript) {
        await supabaseAdmin.from('sermon_manuscripts').update({
          content: body.manuscript,
          word_count: wordCount,
        }).eq('sermon_id', params.id)
      } else {
        await supabaseAdmin.from('sermon_manuscripts').insert({
          sermon_id: params.id,
          content: body.manuscript,
          word_count: wordCount,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('PUT /api/sermons/[id] error:', err)
    return NextResponse.json({ success: false, error: err.message || '수정 실패' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const sermon = await getSermon(params.id, user.id)
    if (!sermon) {
      return NextResponse.json({ success: false, error: '설교를 찾을 수 없습니다.' }, { status: 404 })
    }

    const { error } = await supabaseAdmin
      .from('sermons')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('DELETE /api/sermons/[id] error:', err)
    return NextResponse.json({ success: false, error: err.message || '삭제 실패' }, { status: 500 })
  }
}
