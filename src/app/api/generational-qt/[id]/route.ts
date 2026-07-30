import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(props.params)
    const id = resolvedParams.id

    if (!id) {
      return NextResponse.json({ error: '유효한 ID가 없습니다.' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('generational_qt')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete generational QT:', error)
      return NextResponse.json({ error: `삭제 실패: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Delete route exception:', err)
    return NextResponse.json({ error: err.message || '삭제 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
