import { NextResponse } from 'next/server'
import { PLAN_DATA } from '@/lib/billing/types'

export async function GET() {
  return NextResponse.json({ plans: PLAN_DATA })
}
