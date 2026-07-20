import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabaseAdmin = getSupabaseAdmin()

  const { data, error } = await supabaseAdmin
    .from('qt_history')
    .select('*')
    .eq('id', id)
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
  const { id } = await params
  const supabaseAdmin = getSupabaseAdmin()
  const body = await request.json()
  const { full_manuscript, day_data, series_name, size_option, design_template, subtitle } = body

  const updateData: Record<string, any> = {}
  if (full_manuscript !== undefined) updateData.full_manuscript = full_manuscript
  if (day_data !== undefined) updateData.day_data = day_data
  if (series_name !== undefined) updateData.series_name = series_name
  if (size_option !== undefined) updateData.size_option = size_option
  if (design_template !== undefined) updateData.design_template = design_template
  if (subtitle !== undefined) updateData.subtitle = subtitle

  const { data, error } = await supabaseAdmin
    .from('qt_history')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Not found' }, { status: error ? 500 : 404 })
  }

  return NextResponse.json({ entry: data })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabaseAdmin = getSupabaseAdmin()

  const { error } = await supabaseAdmin
    .from('qt_history')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
