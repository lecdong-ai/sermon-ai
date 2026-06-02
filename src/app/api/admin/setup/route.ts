import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  if (user.email !== 'lecdong@gmail.com') {
    return NextResponse.json({ error: '설정 권한이 없습니다.' }, { status: 403 })
  }

  const { error: columnError } = await supabaseAdmin.rpc('exec_sql', {
    sql: `ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'`,
  })
  if (columnError) {
    const { error: directError } = await supabaseAdmin
      .from('user_profiles')
      .update({ role: 'admin' })
      .eq('id', user.id)

    if (directError) {
      return NextResponse.json({
        success: true,
        message: 'role 컬럼이 없지만, 유저 프로필은 업데이트되었습니다.',
        note: 'Supabase SQL Editor에서 다음 SQL을 실행해주세요: ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT \'user\';',
      })
    }
  }

  const { error: updateError } = await supabaseAdmin
    .from('user_profiles')
    .update({ role: 'admin' })
    .eq('id', user.id)

  return NextResponse.json({
    success: true,
    message: '관리자 설정이 완료되었습니다.',
    error: updateError?.message,
  })
}
