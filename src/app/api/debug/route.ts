import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { data: users, error } = await supabaseAdmin.auth.admin.listUsers()
  return NextResponse.json({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    keyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 30),
    userCount: users?.users?.length || 0,
    users: users?.users?.map(u => ({ id: u.id, email: u.email })) || [],
    error: error?.message || null,
  })
}
