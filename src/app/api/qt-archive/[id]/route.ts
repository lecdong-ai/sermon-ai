import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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
