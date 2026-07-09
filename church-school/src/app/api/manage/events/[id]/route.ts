import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'
import { EventInput, CustomField } from '@/types/event'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

interface Params { params: { id: string } }

async function getOwnedEvent(id: string, userId: string) {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return null
  if (data.user_id !== userId) return null
  return data
}

export async function GET(request: NextRequest, { params }: Params) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const event = await getOwnedEvent(params.id, user.id)
  if (!event) return NextResponse.json({ error: '행사를 찾을 수 없습니다.' }, { status: 404 })

  const { count } = await supabaseAdmin
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', event.id)
    .neq('status', 'cancelled')

  const { count: checkedIn } = await supabaseAdmin
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', event.id)
    .eq('check_in_status', 'checked_in')

  return NextResponse.json({
    event: { ...event, application_count: count || 0, checked_in_count: checkedIn || 0 },
  })
}

export async function PUT(request: NextRequest, { params }: Params) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const event = await getOwnedEvent(params.id, user.id)
  if (!event) return NextResponse.json({ error: '행사를 찾을 수 없습니다.' }, { status: 404 })

  const body: Partial<EventInput> = await request.json()

  const updateData: Record<string, unknown> = {}
  if (body.title !== undefined) updateData.title = body.title.trim()
  if (body.description !== undefined) updateData.description = body.description?.trim() || null
  if (body.location !== undefined) updateData.location = body.location?.trim() || null
  if (body.start_date !== undefined) updateData.start_date = body.start_date || null
  if (body.end_date !== undefined) updateData.end_date = body.end_date || null
  if (body.deadline !== undefined) updateData.deadline = body.deadline || null
  if (body.capacity !== undefined) updateData.capacity = body.capacity
  if (body.status !== undefined) updateData.status = body.status
  if (body.contact_info !== undefined) updateData.contact_info = body.contact_info?.trim() || null
  if (body.is_template !== undefined) updateData.is_template = body.is_template

  if (body.custom_fields !== undefined) {
    updateData.custom_fields = (body.custom_fields as CustomField[]).map((f, i) => ({
      id: f.id || `custom_${Date.now()}_${i}`,
      label: f.label,
      required: f.required || false,
      placeholder: f.placeholder || '',
    }))
  }

  const { data, error } = await supabaseAdmin
    .from('events')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ event: data })
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const event = await getOwnedEvent(params.id, user.id)
  if (!event) return NextResponse.json({ error: '행사를 찾을 수 없습니다.' }, { status: 404 })

  const { error } = await supabaseAdmin
    .from('events')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
