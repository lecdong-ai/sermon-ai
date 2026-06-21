import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rowToNote, type InsightRow } from '@/lib/advanced/insightsApi'

const VALID_TYPES = ['insight', 'research', 'application', 'question', 'pastoral', 'illustration', 'warning']

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })

    const body = await request.json()
    const update: Record<string, unknown> = {}

    if (body.type !== undefined) {
      if (!VALID_TYPES.includes(body.type)) {
        return NextResponse.json({ success: false, error: '유효하지 않은 노트 유형입니다.' }, { status: 400 })
      }
      update.type = body.type
    }
    if (body.title !== undefined) update.title = String(body.title).slice(0, 300)
    if (body.content !== undefined) update.content = String(body.content)
    if (body.summary !== undefined) update.summary = String(body.summary).slice(0, 500)
    if (body.tags !== undefined) update.tags = Array.isArray(body.tags) ? body.tags.slice(0, 20).map(String) : []
    if (body.starred !== undefined) update.starred = !!body.starred
    if (body.pinned !== undefined) update.pinned = !!body.pinned
    if (body.connections !== undefined) update.connections = Array.isArray(body.connections) ? body.connections : []
    if (body.projectIds !== undefined) update.project_ids = Array.isArray(body.projectIds) ? body.projectIds : []
    if (body.seriesIds !== undefined) update.series_ids = Array.isArray(body.seriesIds) ? body.seriesIds : []
    if (body.archiveIds !== undefined) update.archive_ids = Array.isArray(body.archiveIds) ? body.archiveIds : []

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ success: false, error: '변경할 내용이 없습니다.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('insights')
      .update(update)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (error) throw error
    if (!data) return NextResponse.json({ success: false, error: '노트를 찾을 수 없습니다.' }, { status: 404 })

    return NextResponse.json({ success: true, data: rowToNote(data as InsightRow) })
  } catch (err: any) {
    console.error('PATCH /api/insights/[id] error:', err)
    return NextResponse.json({ success: false, error: err.message || '수정 실패' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })

    const { error } = await supabase
      .from('insights')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('DELETE /api/insights/[id] error:', err)
    return NextResponse.json({ success: false, error: err.message || '삭제 실패' }, { status: 500 })
  }
}
