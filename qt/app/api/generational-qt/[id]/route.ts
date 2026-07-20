import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params

  const { error } = await getSupabaseAdmin()
    .from('generational_qt')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Failed to delete generational QT:', error)
    return NextResponse.json({ error: '삭제에 실패했습니다' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
