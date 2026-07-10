'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Mail, Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  next?: string | null;
}

type Mode = 'login' | 'signup' | 'reset';

export default function LoginModal({ open, onClose, next }: LoginModalProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  if (!open) return null;

  const redirectTo = next
    ? `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`
    : `${location.origin}/auth/callback`

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setError('');
    setResetSent(false);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetSent(false);
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
        if (next) router.push(next);
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo },
        });
        if (error) throw error;
        setResetSent(true);
        setMode('login');
        setPassword('');
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${location.origin}/auth/callback?next=/mypage`,
        });
        if (error) throw error;
        setResetSent(true);
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleOAuth = async (provider: 'kakao' | 'google') => {
    setLoading(true);
    setError('');
    try {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          ...(provider === 'kakao' && { scopes: 'account_email profile_nickname profile_image' }),
        },
      });
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-navy-400 hover:text-navy-700 transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-navy-700 to-navy-500 flex items-center justify-center mx-auto mb-3 shadow-md">
            <span className="text-white font-bold text-lg">BS</span>
          </div>
          <h2 className="text-xl font-extrabold text-navy-900">
            {mode === 'login' ? '로그인' : mode === 'signup' ? '회원가입' : '비밀번호 재설정'}
          </h2>
          <p className="text-sm text-navy-400 mt-1">
            {mode === 'login' && '교회학교 솔루션에 오신 것을 환영합니다'}
            {mode === 'signup' && '새 계정을 만들어보세요'}
            {mode === 'reset' && '가입한 이메일을 입력해주세요'}
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
            <input
              type="email"
              placeholder="이메일 주소"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-warm-200 text-sm outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 bg-white"
              required
            />
          </div>

          {mode !== 'reset' && (
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-3 rounded-xl border border-warm-200 text-sm outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 bg-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 px-3 py-2.5 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {resetSent && (
            <div className="flex items-start gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-2.5 rounded-lg">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {mode === 'signup'
                  ? '회원가입 확인 이메일이 발송되었습니다.'
                  : '비밀번호 재설정 링크가 이메일로 발송되었습니다.'}
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-navy-700 to-navy-600 text-white font-bold text-sm hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                처리 중...
              </span>
            ) : mode === 'login' ? '로그인' : mode === 'signup' ? '회원가입' : '재설정 링크 보내기'}
          </button>
        </form>

        {mode !== 'reset' && (
          <>
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-warm-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-navy-400">또는</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => handleOAuth('kakao')}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#FEE500] text-[#191919] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#FDD800] hover:shadow-md transition-all disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#191919">
                  <path d="M12 3C6.48 3 2 6.48 2 10.5c0 2.36 1.33 4.48 3.44 5.94L4.8 20l3.72-2.07c1.16.33 2.38.51 3.68.51 5.52 0 10-3.48 10-7.94S17.52 3 12 3z" />
                </svg>
                카카오 로그인
              </button>

              <button
                onClick={() => handleOAuth('google')}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-white text-navy-900 font-bold text-sm flex items-center justify-center gap-2.5 border border-warm-200 hover:bg-warm-50 hover:shadow-md transition-all disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google 로그인
              </button>
            </div>
          </>
        )}

        <div className="text-center text-sm text-navy-400 mt-5 space-y-1.5">
          {mode === 'login' && (
            <>
              <p>
                계정이 없으신가요?{' '}
                <button onClick={() => switchMode('signup')} className="text-navy-700 font-medium hover:underline">
                  회원가입
                </button>
              </p>
              <p>
                <button onClick={() => switchMode('reset')} className="text-navy-400 hover:text-navy-700 hover:underline text-xs">
                  비밀번호를 잊으셨나요?
                </button>
              </p>
            </>
          )}
          {mode === 'signup' && (
            <p>
              이미 계정이 있으신가요?{' '}
              <button onClick={() => switchMode('login')} className="text-navy-700 font-medium hover:underline">
                로그인
              </button>
            </p>
          )}
          {mode === 'reset' && (
            <p>
              <button onClick={() => switchMode('login')} className="text-navy-700 font-medium hover:underline">
                로그인으로 돌아가기
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
