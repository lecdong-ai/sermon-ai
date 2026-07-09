'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, getCurrentUserProfile, signOutUser } from '@/lib/auth';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  isPremium: boolean;
  isAdmin: boolean;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    try {
      setSupabase(createSupabaseClient());
    } catch (err) {
      console.error('Supabase 클라이언트 생성 실패:', err);
    }
  }, []);

  // 1. 유저 프로필 조회 및 상태 동기화
  const refreshUser = async () => {
    try {
      const profile = await getCurrentUserProfile();
      setUser(profile);
    } catch (err) {
      console.error('인증 상태 갱신 실패:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 2. 초기 로드 및 Supabase Auth 상태 리스너 연동
  useEffect(() => {
    if (!supabase) return;
    refreshUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (session) {
        await refreshUser();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // 3. 로그아웃 함수
  const logout = async () => {
    setLoading(true);
    try {
      await signOutUser();
      setUser(null);
    } catch (err) {
      console.error('로그아웃 에러:', err);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoggedIn: !!user,
    isPremium: user?.plan_type === 'subscriber',
    isAdmin: user?.role === 'admin',
    loading,
    refreshUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다.');
  }
  return context;
}
