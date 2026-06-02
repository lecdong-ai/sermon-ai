import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({
      success: false,
      message: '로그인이 필요합니다. /login 에서 로그인 후 다시 시도해주세요.',
    })
  }
  if (user.email !== 'lecdong@gmail.com') {
    return NextResponse.json({
      success: false,
      error: 'lecdong@gmail.com 계정으로 로그인해야 합니다.',
    })
  }

  try {
    const { error } = await supabaseAdmin
      .from('user_profiles')
      .update({ role: 'admin' })
      .eq('id', user.id)

    if (error) {
      if (error.message?.includes('column') || error.message?.includes('role')) {
        return NextResponse.json({
          success: false,
          message: 'DB에 role 컬럼이 없습니다. Supabase SQL Editor에서 아래 SQL을 실행해주세요:',
          sql: "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'; UPDATE user_profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'lecdong@gmail.com');",
        })
      }
      return NextResponse.json({ success: false, error: error.message })
    }

    return NextResponse.json({ success: true, message: '관리자 설정 완료! /admin 으로 접속해보세요.' })
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: '오류가 발생했습니다. Supabase SQL Editor에서 직접 SQL을 실행해주세요.',
      sql: "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'; UPDATE user_profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'lecdong@gmail.com');",
    })
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
