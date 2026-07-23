import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/school/supabase'
import { getUserFromRequest } from '@/lib/school/auth'
import { ApplicationStatus } from '@/types/school/event'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

interface Params { params: { id: string } }

async function findEventAndVerifyOwnership(identifier: string, userId: string) {
  let { data: event } = await supabaseAdmin
    .from('church_events')
    .select('id, user_id')
    .eq('id', identifier)
    .maybeSingle()

  if (!event) {
    const { data: eventByToken } = await supabaseAdmin
      .from('church_events')
      .select('id, user_id')
      .eq('link_token', identifier)
      .maybeSingle()
    event = eventByToken
  }

  if (!event || event.user_id !== userId) return null
  return event
}

export async function GET(request: NextRequest, { params }: Params) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const event = await findEventAndVerifyOwnership(params.id, user.id)
  if (!event) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') as ApplicationStatus | null
  const q = searchParams.get('q')
  const checkIn = searchParams.get('checkin')

  let query = supabaseAdmin
    .from('applications')
    .select('*')
    .eq('event_id', event.id)
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  if (q?.trim()) {
    query = query.or(`student_name.ilike.%${q}%,parent_name.ilike.%${q}%,parent_phone.ilike.%${q}%`)
  }

  if (checkIn === 'checked_in') {
    query = query.eq('check_in_status', 'checked_in')
  } else if (checkIn === 'not_checked_in') {
    query = query.eq('check_in_status', 'not_checked_in').neq('status', 'cancelled')
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ applications: data || [] })
}
