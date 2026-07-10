import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/school/supabase'
import { getUserFromRequest } from '@/lib/school/auth'
import { ApplicationStatus } from '@/types/school/event'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

interface Params { params: { id: string } }

async function verifyOwnership(eventId: string, userId: string) {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('user_id')
    .eq('id', eventId)
    .single()
  if (error || !data || data.user_id !== userId) return false
  return true
}

export async function GET(request: NextRequest, { params }: Params) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const owned = await verifyOwnership(params.id, user.id)
  if (!owned) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') as ApplicationStatus | null
  const q = searchParams.get('q')
  const checkIn = searchParams.get('checkin')

  let query = supabaseAdmin
    .from('applications')
    .select('*')
    .eq('event_id', params.id)
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
