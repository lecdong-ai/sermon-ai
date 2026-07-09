import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const maxDuration = 10

interface Params { params: { token: string; aid: string } }

export async function GET(request: NextRequest, { params }: Params) {
  const { data: event } = await supabaseAdmin
    .from('events')
    .select('id, title')
    .eq('link_token', params.token)
    .single()

  if (!event) {
    return NextResponse.json({ error: '행사를 찾을 수 없습니다.' }, { status: 404 })
  }

  const { data: app, error } = await supabaseAdmin
    .from('applications')
    .select('id, student_name, grade, parent_name, status')
    .eq('id', params.aid)
    .eq('event_id', event.id)
    .single()

  if (error || !app) {
    return NextResponse.json({ error: '신청 내역을 찾을 수 없습니다.' }, { status: 404 })
  }

  return NextResponse.json({ application: { ...app, event_title: event.title } })
}
