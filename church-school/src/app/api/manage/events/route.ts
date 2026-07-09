import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'
import { EventInput, CustomField } from '@/types/event'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const includeTemplates = searchParams.get('templates') === 'true'

  let query = supabaseAdmin
    .from('events')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (!includeTemplates) {
    query = query.eq('is_template', false)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const eventsWithCounts = await Promise.all(
    (data || []).map(async (event) => {
      const { count } = await supabaseAdmin
        .from('applications')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', event.id)
        .neq('status', 'cancelled')
      return { ...event, application_count: count || 0 }
    })
  )

  return NextResponse.json({ events: eventsWithCounts })
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const body: EventInput = await request.json()

  if (!body.title?.trim()) {
    return NextResponse.json({ error: '행사명을 입력해주세요.' }, { status: 400 })
  }

  const customFields: CustomField[] = (body.custom_fields || []).map((f, i) => ({
    id: f.id || `custom_${Date.now()}_${i}`,
    label: f.label,
    required: f.required || false,
    placeholder: f.placeholder || '',
  }))

  const { data, error } = await supabaseAdmin
    .from('events')
    .insert({
      user_id: user.id,
      title: body.title.trim(),
      description: body.description?.trim() || null,
      location: body.location?.trim() || null,
      start_date: body.start_date || null,
      end_date: body.end_date || null,
      deadline: body.deadline || null,
      capacity: body.capacity ?? null,
      status: body.status || 'draft',
      custom_fields: customFields,
      is_template: body.is_template || false,
      contact_info: body.contact_info?.trim() || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ event: data })
}
