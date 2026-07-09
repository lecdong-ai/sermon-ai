import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

interface Params { params: { id: string } }

export async function POST(request: NextRequest, { params }: Params) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const { data: source, error } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !source) return NextResponse.json({ error: '원본 행사를 찾을 수 없습니다.' }, { status: 404 })
  if (source.user_id !== user.id) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })

  const { data: cloned, error: cloneError } = await supabaseAdmin
    .from('events')
    .insert({
      user_id: user.id,
      title: `${source.title} (복사)`,
      description: source.description,
      location: source.location,
      start_date: null,
      end_date: null,
      deadline: null,
      capacity: source.capacity,
      status: 'draft',
      custom_fields: source.custom_fields,
      is_template: false,
      cloned_from: source.id,
      contact_info: source.contact_info,
    })
    .select()
    .single()

  if (cloneError) return NextResponse.json({ error: cloneError.message }, { status: 500 })

  return NextResponse.json({ event: cloned })
}
