import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase'
import { generateApplication } from '@/lib/ai/sermon-service'

async function getUser(request: NextRequest) {
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() {},
      },
    },
  )
  const { data } = await sb.auth.getUser()
  return data?.user ?? null
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { data: sermon, error } = await supabaseAdmin
      .from('sermons')
      .select('id, user_id, passage, church_context, audience')
      .eq('id', params.id)
      .single()

    if (error || !sermon) {
      return NextResponse.json({ success: false, error: '설교를 찾을 수 없습니다.' }, { status: 404 })
    }
    if (sermon.user_id !== user.id) {
      return NextResponse.json({ success: false, error: '접근 권한이 없습니다.' }, { status: 403 })
    }

    const { data: notes } = await supabaseAdmin
      .from('sermon_notes')
      .select('core_message')
      .eq('sermon_id', params.id)
      .maybeSingle()

    const result = await generateApplication({
      passage: sermon.passage,
      core_message: notes?.core_message || '',
      audience: sermon.audience || [],
      church_context: sermon.church_context || '',
    })

    await supabaseAdmin.from('generated_outputs').insert({
      sermon_id: params.id,
      type: 'application',
      input_data: { passage: sermon.passage, core_message: notes?.core_message },
      output_data: result,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (err: any) {
    console.error('POST /api/sermons/[id]/ai/generate-application error:', err)
    return NextResponse.json({ success: false, error: err.message || '생성 실패' }, { status: 500 })
  }
}
