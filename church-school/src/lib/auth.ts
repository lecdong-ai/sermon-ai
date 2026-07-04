import { supabase } from './supabase';
import { createClient as createBrowserSupabase } from './supabase/client';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { checkRate, type RateLimitConfig } from './rate-limit';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  church_name: string | null;
  role: 'user' | 'admin';
  plan_type: 'free' | 'subscriber' | 'purchaser';
  created_at: string;
}

export async function signUpUser(email: string, password: string, name: string, churchName: string) {
  const sb = createBrowserSupabase();
  const { data: authData, error: authError } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        church_name: churchName,
      }
    }
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('회원가입에 실패했습니다.');

  const { error: profileError } = await sb
    .from('users')
    .insert([
      {
        id: authData.user.id,
        name,
        email,
        church_name: churchName,
        role: 'user',
        plan_type: 'free'
      }
    ]);

  if (profileError) {
    console.error('프로필 테이블 생성 에러:', profileError);
  }

  return authData.user;
}

export async function signInUser(email: string, password: string) {
  const sb = createBrowserSupabase();
  const { data, error } = await sb.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data.user;
}

export async function signOutUser() {
  const sb = createBrowserSupabase();
  const { error } = await sb.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const sb = createBrowserSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await sb
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || '사역자',
      church_name: user.user_metadata?.church_name || null,
      role: 'user',
      plan_type: 'free',
      created_at: new Date().toISOString(),
    };
  }

  return profile as UserProfile;
}

export async function getUserFromRequest(request: NextRequest) {
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() {},
      },
    },
  )
  const { data } = await sb.auth.getSession()
  return data?.session?.user ?? null
}

export function checkOpenAIRateLimit(
  request: NextRequest,
  userId: string | null,
  config: RateLimitConfig = { max: 20, windowSec: 60 },
): NextResponse | null {
  const key = userId
    ? `u:${userId}`
    : `ip:${request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
       || request.headers.get('x-real-ip')
       || 'unknown'}`
  const r = checkRate(key, config)
  if (r.allowed) return null
  return NextResponse.json(
    { success: false, error: `요청이 너무 많습니다. ${r.retryAfterSec}초 후 다시 시도해주세요.` },
    { status: 429, headers: { 'Retry-After': String(r.retryAfterSec) } },
  )
}
