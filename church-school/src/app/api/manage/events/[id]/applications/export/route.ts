import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'
import { STATUS_LABELS } from '@/types/event'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

interface Params { params: { id: string } }

function escapeCSV(value: string | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET(request: NextRequest, { params }: Params) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const { data: event, error: eventError } = await supabaseAdmin
    .from('events')
    .select('user_id, title, custom_fields')
    .eq('id', params.id)
    .single()

  if (eventError || !event) return NextResponse.json({ error: '행사를 찾을 수 없습니다.' }, { status: 404 })
  if (event.user_id !== user.id) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })

  const { data: apps, error: appError } = await supabaseAdmin
    .from('applications')
    .select('*')
    .eq('event_id', params.id)
    .order('created_at', { ascending: false })

  if (appError) return NextResponse.json({ error: appError.message }, { status: 500 })

  const customFields = event.custom_fields || []
  const baseHeaders = [
    '학생 이름', '학년', '부서', '생년월일', '성별',
    '보호자 이름', '보호자 연락처', '비상연락처',
    '건강 특이사항', '알레르기',
    '신청 상태', '입금 상태', '체크인 상태', '체크인 시각',
    '개인정보 동의', '사진 동의', '신청일시',
  ]
  const customHeaders = customFields.map((f: { label: string }) => f.label)
  const headers = [...baseHeaders, ...customHeaders]

  const rows = (apps || []).map((app) => {
    const baseRow = [
      app.student_name, app.grade, app.department || '',
      app.birth_date, app.gender === 'male' ? '남' : '여',
      app.parent_name, app.parent_phone, app.emergency_phone || '',
      app.health_notes || '', app.allergies || '',
      STATUS_LABELS[app.status as keyof typeof STATUS_LABELS] || app.status,
      app.payment_status === 'deposited' ? '입금완료' : app.payment_status === 'waiting_deposit' ? '입금대기' : app.payment_status === 'cancelled' ? '취소' : '대기',
      app.check_in_status === 'checked_in' ? '체크인 완료' : '미체크인',
      app.check_in_at ? new Date(app.check_in_at).toLocaleString('ko-KR') : '',
      app.privacy_consent ? '동의' : '미동의',
      app.photo_consent ? '동의' : '미동의',
      new Date(app.created_at).toLocaleString('ko-KR'),
    ]
    const customRow = customFields.map((f: { id: string }) => app.custom_responses?.[f.id] || '')
    return [...baseRow, ...customRow]
  })

  const csvLines = [headers, ...rows].map((row) => row.map(escapeCSV).join(','))
  const csv = '\uFEFF' + csvLines.join('\r\n')

  const fileName = encodeURIComponent(`${event.title}_신청자명단_${new Date().toISOString().slice(0, 10)}.csv`)

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  })
}
