import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/school/supabase'
import { getUserFromRequest } from '@/lib/school/auth'
import { ApplicationStatus } from '@/types/school/event'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

interface Params { params: { id: string } }

export async function PUT(request: NextRequest, { params }: Params) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const { data: event, error: eventError } = await supabaseAdmin
    .from('events')
    .select('user_id')
    .eq('id', params.id)
    .single()

  if (eventError || !event) return NextResponse.json({ error: '행사를 찾을 수 없습니다.' }, { status: 404 })
  if (event.user_id !== user.id) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })

  const body: { application_ids: string[]; status: ApplicationStatus } = await request.json()

  if (!body.application_ids?.length || !body.status) {
    return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('applications')
    .update({ status: body.status })
    .in('id', body.application_ids)
    .eq('event_id', params.id)
    .select('id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ updated_count: data?.length || 0 })
}
