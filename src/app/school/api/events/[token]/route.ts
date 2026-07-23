import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/school/supabase'
import { ApplicationInput, PRIVACY_CONSENT_TEXT, PHOTO_CONSENT_TEXT } from '@/types/school/event'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

interface Params { params: { token: string } }

async function findEventByTokenOrId(token: string) {
  const { data: byLink } = await supabaseAdmin
    .from('church_events')
    .select('*')
    .eq('link_token', token)
    .maybeSingle()

  if (byLink) return byLink

  const { data: byId } = await supabaseAdmin
    .from('church_events')
    .select('*')
    .eq('id', token)
    .maybeSingle()

  return byId || null
}

export async function GET(request: NextRequest, { params }: Params) {
  const { token } = params

  const event = await findEventByTokenOrId(token)

  if (!event) {
    return NextResponse.json({ error: '행사를 찾을 수 없습니다.' }, { status: 404 })
  }

  if (event.is_template) {
    return NextResponse.json({ error: '유효하지 않은 행사입니다.' }, { status: 404 })
  }

  const applicationCount = await supabaseAdmin
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', event.id)
    .neq('status', 'cancelled')

  const now = new Date()
  const deadline = event.deadline ? new Date(event.deadline) : null
  const isExpired = deadline ? now > deadline : false
  const isFull = event.capacity ? (applicationCount.count || 0) >= event.capacity : false

  return NextResponse.json({
    event: {
      ...event,
      application_count: applicationCount.count || 0,
      is_expired: isExpired,
      is_full: isFull,
    },
    consent_texts: {
      privacy: PRIVACY_CONSENT_TEXT,
      photo: PHOTO_CONSENT_TEXT,
    },
  })
}

export async function POST(request: NextRequest, { params }: Params) {
  const { token } = params

  const event = await findEventByTokenOrId(token)

  if (!event) {
    return NextResponse.json({ error: '행사를 찾을 수 없습니다.' }, { status: 404 })
  }

  if (event.status !== 'open') {
    return NextResponse.json({ error: '현재 신청을 받지 않는 행사입니다.' }, { status: 400 })
  }

  const now = new Date()
  if (event.deadline && now > new Date(event.deadline)) {
    return NextResponse.json({ error: '신청 마감일이 지났습니다.' }, { status: 400 })
  }

  if (event.capacity) {
    const { count } = await supabaseAdmin
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', event.id)
      .neq('status', 'cancelled')
    if ((count || 0) >= event.capacity) {
      return NextResponse.json({ error: '정원이 마감되었습니다.' }, { status: 400 })
    }
  }

  const body: ApplicationInput = await request.json()

  if (!body.student_name?.trim()) return NextResponse.json({ error: '학생 이름을 입력해주세요.' }, { status: 400 })
  if (!body.grade?.trim()) return NextResponse.json({ error: '학년을 입력해주세요.' }, { status: 400 })
  if (!body.birth_date) return NextResponse.json({ error: '생년월일을 입력해주세요.' }, { status: 400 })
  if (!body.parent_name?.trim()) return NextResponse.json({ error: '보호자 이름을 입력해주세요.' }, { status: 400 })
  if (!body.parent_phone?.trim()) return NextResponse.json({ error: '보호자 연락처를 입력해주세요.' }, { status: 400 })
  if (!body.privacy_consent) return NextResponse.json({ error: '개인정보 수집·이용에 동의해주세요.' }, { status: 400 })

  const { data: existing } = await supabaseAdmin
    .from('applications')
    .select('id')
    .eq('event_id', event.id)
    .eq('student_name', body.student_name.trim())
    .eq('birth_date', body.birth_date)
    .neq('status', 'cancelled')
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: '이미 신청된 학생입니다. (이름 + 생년월일 중복)' }, { status: 409 })
  }

  for (const field of event.custom_fields || []) {
    if (field.required) {
      const val = body.custom_responses?.[field.id]
      if (!val?.trim()) {
        return NextResponse.json({ error: `${field.label}을(를) 입력해주세요.` }, { status: 400 })
      }
    }
  }

  const { data: application, error: appError } = await supabaseAdmin
    .from('applications')
    .insert({
      event_id: event.id,
      student_name: body.student_name.trim(),
      grade: body.grade.trim(),
      department: body.department?.trim() || null,
      birth_date: body.birth_date,
      gender: body.gender,
      parent_name: body.parent_name.trim(),
      parent_phone: body.parent_phone.trim(),
      emergency_phone: body.emergency_phone?.trim() || null,
      health_notes: body.health_notes?.trim() || null,
      allergies: body.allergies?.trim() || null,
      privacy_consent: true,
      privacy_consented_at: new Date().toISOString(),
      privacy_consent_text: PRIVACY_CONSENT_TEXT,
      photo_consent: body.photo_consent || false,
      photo_consent_text: body.photo_consent ? PHOTO_CONSENT_TEXT : null,
      custom_responses: body.custom_responses || {},
      status: 'submitted',
      payment_status: 'pending',
    })
    .select()
    .single()

  if (appError) {
    if (appError.code === '23505') {
      return NextResponse.json({ error: '이미 신청된 학생입니다.' }, { status: 409 })
    }
    return NextResponse.json({ error: appError.message }, { status: 500 })
  }

  return NextResponse.json({ application })
}
