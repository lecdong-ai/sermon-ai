import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return request.cookies.getAll() }, setAll() {} } },
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })

  const { id } = params

  const { error } = await supabaseAdmin
    .from('qt_archive')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Failed to delete qt archive:', error)
    return NextResponse.json({ error: '삭제에 실패했습니다' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
