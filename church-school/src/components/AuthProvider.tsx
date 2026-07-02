'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, getCurrentUserProfile, signInUser, signUpUser, signOutUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  isPremium: boolean;
  isAdmin: boolean;
  loading: boolean;
  refreshUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, churchName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
  }, []);

  // 3. 로그인 함수
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInUser(email, password);
      await refreshUser();
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // 4. 회원가입 함수
  const register = async (email: string, password: string, name: string, churchName: string) => {
    setLoading(true);
    try {
      await signUpUser(email, password, name, churchName);
      await refreshUser();
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // 5. 로그아웃 함수
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
    login,
    register,
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
