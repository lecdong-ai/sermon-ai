import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(_request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!(await isAdmin(user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from('qt_history')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ entry: data })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!(await isAdmin(user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const { full_manuscript, day_data, series_name, size_option, design_template, subtitle, target_year, target_month, start_date } = body

  const updateData: Record<string, any> = {}
  if (full_manuscript !== undefined) updateData.full_manuscript = full_manuscript
  if (day_data !== undefined) updateData.day_data = day_data
  if (series_name !== undefined) updateData.series_name = series_name
  if (size_option !== undefined) updateData.size_option = size_option
  if (design_template !== undefined) updateData.design_template = design_template
  if (subtitle !== undefined) updateData.subtitle = subtitle
  if (target_year !== undefined) updateData.target_year = target_year
  if (target_month !== undefined) updateData.target_month = target_month
  if (start_date !== undefined) updateData.start_date = start_date

  let { data, error } = await supabaseAdmin
    .from('qt_history')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error && (error.message?.includes('target_year') || error.message?.includes('target_month') || error.message?.includes('start_date'))) {
    delete updateData.target_year
    delete updateData.target_month
    delete updateData.start_date
    const retry = await supabaseAdmin
      .from('qt_history')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    data = retry.data
    error = retry.error
  }

  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Not found' }, { status: error ? 500 : 404 })
  }

  return NextResponse.json({ entry: data })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!(await isAdmin(user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  const { error } = await supabaseAdmin
    .from('qt_history')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
