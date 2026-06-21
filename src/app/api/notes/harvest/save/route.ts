import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase'

let _sbServer: ReturnType<typeof createServerClient> | null = null
async function getUser(request: NextRequest) {
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { getAll() { return request.cookies.getAll() }, setAll() {} },
    },
  )
  const { data } = await sb.auth.getUser()
  return data?.user ?? null
}

const VALID_TYPES = ['summary', 'questions', 'cardnews', 'shorts', 'ppt', 'guide'] as const

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })

    const body = await request.json()
    const { sermonId, items } = body

    if (!sermonId) {
      return NextResponse.json({ success: false, error: 'sermonId가 필요합니다.' }, { status: 400 })
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: '저장할 항목이 없습니다.' }, { status: 400 })
    }

    // 설교가 본인 것인지 확인
    const { data: sermon } = await supabaseAdmin
      .from('sermons')
      .select('id, user_id')
      .eq('id', sermonId)
      .eq('user_id', user.id)
      .single()

    if (!sermon) {
      return NextResponse.json({ success: false, error: '설교를 찾을 수 없거나 권한이 없습니다.' }, { status: 403 })
    }

    let savedCount = 0
    const errors: string[] = []

    for (const it of items) {
      if (!VALID_TYPES.includes(it.type)) {
        errors.push(`Invalid type: ${it.type}`)
        continue
      }
      if (!it.content || typeof it.content !== 'string') {
        errors.push(`Empty content: ${it.type}`)
        continue
      }
      const { error } = await supabaseAdmin
        .from('sermon_derivatives')
        .upsert(
          {
            user_id: user.id,
            sermon_id: sermonId,
            type: it.type,
            content: it.content,
          },
          { onConflict: 'sermon_id,type' },
        )
      if (error) {
        errors.push(`${it.type}: ${error.message}`)
      } else {
        savedCount++
      }
    }

    return NextResponse.json({
      success: true,
      saved: savedCount,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err: any) {
    console.error('POST /api/notes/harvest/save error:', err)
    return NextResponse.json({ success: false, error: err.message || '저장 실패' }, { status: 500 })
  }
}
