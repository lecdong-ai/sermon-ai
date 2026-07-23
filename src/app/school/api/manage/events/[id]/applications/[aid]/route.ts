import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/school/supabase'
import { getUserFromRequest } from '@/lib/school/auth'
import { ApplicationStatus, PaymentStatus, CheckInStatus } from '@/types/school/event'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

interface Params { params: { id: string; aid: string } }

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

  const { data, error } = await supabaseAdmin
    .from('applications')
    .select('*, church_events(title)')
    .eq('id', params.aid)
    .eq('event_id', event.id)
    .single()

  if (error || !data) return NextResponse.json({ error: '신청자를 찾을 수 없습니다.' }, { status: 404 })

  return NextResponse.json({ application: data })
}

export async function PUT(request: NextRequest, { params }: Params) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const event = await findEventAndVerifyOwnership(params.id, user.id)
  if (!event) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })

  const body: {
    status?: ApplicationStatus
    payment_status?: PaymentStatus
    check_in_status?: CheckInStatus
    notes?: string
  } = await request.json()

  const updateData: Record<string, unknown> = {}
  if (body.status !== undefined) updateData.status = body.status
  if (body.payment_status !== undefined) updateData.payment_status = body.payment_status
  if (body.check_in_status !== undefined) {
    updateData.check_in_status = body.check_in_status
    updateData.check_in_at = body.check_in_status === 'checked_in' ? new Date().toISOString() : null
  }

  const { data, error } = await supabaseAdmin
    .from('applications')
    .update(updateData)
    .eq('id', params.aid)
    .eq('event_id', event.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ application: data })
}
