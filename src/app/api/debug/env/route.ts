import { NextResponse } from 'next/server'

// GET /api/debug/env — 운영 환경 OPENAI_API_KEY 끝 4자리 (마스킹) + 주요 env 존재 여부
// 주의: 키 값 자체는 절대 노출 안 함

export async function GET() {
  const key = process.env.OPENAI_API_KEY
  const masked = key
    ? `${key.slice(0, 10)}...${key.slice(-4)} (length ${key.length})`
    : 'NOT SET'

  return NextResponse.json({
    OPENAI_API_KEY: masked,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_KAKAO_KEY: process.env.NEXT_PUBLIC_KAKAO_KEY ? 'SET' : 'EMPTY',
    NEXT_PUBLIC_KAKAO_CHANNEL_URL: process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL || 'EMPTY',
    // Vercel deployment ID (있으면 production)
    VERCEL_DEPLOYMENT_ID: process.env.VERCEL_DEPLOYMENT_ID || 'N/A',
  })
}
