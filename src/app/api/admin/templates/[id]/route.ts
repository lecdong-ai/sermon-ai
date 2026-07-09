import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import { extractThemeFromPptx } from '@/lib/pptxParser'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await getUserFromRequest(request)
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const name = formData.get('name') as string | null
  const category = formData.get('category') as string | null
  const aiGuide = formData.get('ai_guide') as string | null
  const file = formData.get('file') as File | null

  const updates: Record<string, any> = {}

  if (name?.trim()) updates.name = name.trim()
  if (category) updates.category = category
  if (aiGuide !== null) updates.ai_guide = aiGuide

  const primaryManual = formData.get('primary_color') as string | null
  const accentManual = formData.get('accent_color') as string | null
  const bgManual = formData.get('background_color') as string | null
  const textManual = formData.get('text_color') as string | null
  const fontTitleManual = formData.get('font_title') as string | null
  const fontBodyManual = formData.get('font_body') as string | null

  if (file) {
    const buffer = await file.arrayBuffer()
    try {
      const extracted = await extractThemeFromPptx(buffer)
      updates.primary_color = extracted.primary
      updates.accent_color = extracted.accent
      updates.background_color = extracted.background
      updates.text_color = extracted.text
      updates.font_title = extracted.fontTitle
      updates.font_body = extracted.fontBody
      updates.gradient = `from-[#${extracted.primary}] to-[#${extracted.accent}]`
    } catch (e) {
      return NextResponse.json({ error: '.pptx 테마 추출에 실패했습니다' }, { status: 400 })
    }
  } else {
    if (primaryManual) updates.primary_color = primaryManual
    if (accentManual) updates.accent_color = accentManual
    if (bgManual) updates.background_color = bgManual
    if (textManual) updates.text_color = textManual
    if (fontTitleManual) updates.font_title = fontTitleManual
    if (fontBodyManual) updates.font_body = fontBodyManual
    if (primaryManual || accentManual) {
      updates.gradient = `from-[#${updates.primary_color || primaryManual}] to-[#${updates.accent_color || accentManual}]`
    }
  }

  updates.updated_at = new Date().toISOString()

  const { data, error } = await supabaseAdmin
    .from('ppt_templates')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ template: data })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await getUserFromRequest(request)
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabaseAdmin
    .from('ppt_templates')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
