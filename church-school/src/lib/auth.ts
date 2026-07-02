import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  church_name: string | null;
  role: 'user' | 'admin';
  plan_type: 'free' | 'subscriber' | 'purchaser';
  created_at: string;
}

// 1. 회원가입 (Auth Sign-up + users 테이블 추가 프로필 저장)
export async function signUpUser(email: string, password: string, name: string, churchName: string) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
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

  // Auth 가입 성공 시 users 메타데이터 테이블에 추가 정보 생성
  const { error: profileError } = await supabase
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
    // 가입 자체는 성공했으므로 우선 진행
  }

  return authData.user;
}

// 2. 로그인 (Auth Sign-in)
export async function signInUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data.user;
}

// 3. 로그아웃 (Auth Sign-out)
export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// 4. 현재 유저 정보 및 프로필 통합 조회
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    // 만약 users 프로필 테이블에 없으면 임시 복구용 프로필 반환
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
