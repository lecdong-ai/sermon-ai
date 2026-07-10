import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/school/supabase'
import { getUserFromRequest } from '@/lib/school/auth'
import { isAdmin } from '@/lib/school/admin'
import { extractThemeFromPptx } from '@/lib/school/pptxParser'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('ppt_templates')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ templates: data || [] })
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const name = formData.get('name') as string
  const category = (formData.get('category') as string) || 'general'
  const aiGuide = formData.get('ai_guide') as string || null
  const file = formData.get('file') as File | null

  if (!name?.trim()) {
    return NextResponse.json({ error: '템플릿 이름을 입력해주세요.' }, { status: 400 })
  }

  let primary = (formData.get('primary_color') as string) || '1B3A5C'
  let accent = (formData.get('accent_color') as string) || '4A90D9'
  let background = (formData.get('background_color') as string) || 'FFFFFF'
  let text = (formData.get('text_color') as string) || '1A1A2E'
  let fontTitle = (formData.get('font_title') as string) || 'Malgun Gothic'
  let fontBody = (formData.get('font_body') as string) || 'Malgun Gothic'

  if (file) {
    const buffer = await file.arrayBuffer()
    try {
      const extracted = await extractThemeFromPptx(buffer)
      primary = extracted.primary
      accent = extracted.accent
      background = extracted.background
      text = extracted.text
      fontTitle = extracted.fontTitle
      fontBody = extracted.fontBody
    } catch (e) {
      return NextResponse.json({ error: '.pptx 테마 추출에 실패했습니다: ' + (e as Error).message }, { status: 400 })
    }
  }

  const { data, error } = await supabaseAdmin
    .from('ppt_templates')
    .insert({
      name: name.trim(),
      category,
      primary_color: primary,
      accent_color: accent,
      background_color: background,
      text_color: text,
      font_title: fontTitle,
      font_body: fontBody,
      gradient: `from-[#${primary}] to-[#${accent}]`,
      ai_guide: aiGuide,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ template: data })
}
