import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const maxDuration = 10

interface Params { params: { token: string } }

export async function GET(request: NextRequest, { params }: Params) {
  const { token } = params
  const { searchParams } = new URL(request.url)
  const studentName = searchParams.get('name')?.trim()
  const birthDate = searchParams.get('birth')
  const parentPhone = searchParams.get('phone')?.trim()

  const { data: event, error } = await supabaseAdmin
    .from('events')
    .select('id')
    .eq('link_token', token)
    .single()

  if (error || !event) {
    return NextResponse.json({ error: '행사를 찾을 수 없습니다.' }, { status: 404 })
  }

  const result: { is_duplicate: boolean; sibling?: Record<string, string> } = { is_duplicate: false }

  if (studentName && birthDate) {
    const { data: existing } = await supabaseAdmin
      .from('applications')
      .select('id')
      .eq('event_id', event.id)
      .eq('student_name', studentName)
      .eq('birth_date', birthDate)
      .neq('status', 'cancelled')
      .maybeSingle()

    result.is_duplicate = !!existing
  }

  if (parentPhone) {
    const { data: sibling } = await supabaseAdmin
      .from('applications')
      .select('parent_name, parent_phone, emergency_phone, health_notes, allergies')
      .eq('event_id', event.id)
      .eq('parent_phone', parentPhone)
      .neq('status', 'cancelled')
      .limit(1)
      .maybeSingle()

    if (sibling) {
      result.sibling = {
        parent_name: sibling.parent_name,
        parent_phone: sibling.parent_phone,
        emergency_phone: sibling.emergency_phone || '',
        health_notes: sibling.health_notes || '',
        allergies: sibling.allergies || '',
      }
    }
  }

  return NextResponse.json(result)
}
