import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const maxDuration = 10

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const body = await request.json()
  const { application_id, event_token, event_id } = body

  if (!application_id || (!event_token && !event_id)) {
    return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 })
  }

  let eventQuery = supabaseAdmin.from('events').select('id, user_id')
  if (event_token) {
    eventQuery = eventQuery.eq('link_token', event_token)
  } else {
    eventQuery = eventQuery.eq('id', event_id)
  }
  const { data: event, error: eventError } = await eventQuery.single()

  if (eventError || !event) {
    return NextResponse.json({ error: '행사를 찾을 수 없습니다.' }, { status: 404 })
  }

  if (event.user_id !== user.id) {
    return NextResponse.json({ error: '이 행사의 체크인 권한이 없습니다.' }, { status: 403 })
  }

  const { data: app, error: appError } = await supabaseAdmin
    .from('applications')
    .select('id, student_name, check_in_at, check_in_status, status')
    .eq('id', application_id)
    .eq('event_id', event.id)
    .single()

  if (appError || !app) {
    return NextResponse.json({ error: '신청자를 찾을 수 없습니다.' }, { status: 404 })
  }

  if (app.status === 'cancelled') {
    return NextResponse.json({ error: '취소된 신청자입니다.' }, { status: 400 })
  }

  if (app.check_in_status === 'checked_in') {
    return NextResponse.json({
      already_checked_in: true,
      student_name: app.student_name,
      check_in_at: app.check_in_at,
    })
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('applications')
    .update({
      check_in_status: 'checked_in',
      check_in_at: new Date().toISOString(),
    })
    .eq('id', application_id)
    .select('id, student_name, check_in_at')
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({
    already_checked_in: false,
    student_name: updated.student_name,
    check_in_at: updated.check_in_at,
  })
}
