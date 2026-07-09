'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { X, Mail, Lock, User, School, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient as createSupabaseClient, hasSupabaseClient } from '@/lib/supabase/client';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [church, setChurch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'kakao' | 'google' | null>(null);

  const isSupabaseReady = hasSupabaseClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      if (isRegister) {
        await register(email, password, name, church);
      } else {
        await login(email, password);
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '인증 처리에 실패했습니다. 입력값을 확인해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKakao = async () => {
    if (!isSupabaseReady) { setErrorMsg('Supabase 인증이 구성되지 않았습니다.'); return }
    setOauthLoading('kakao')
    try {
      const supabase = createSupabaseClient()
      await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/`,
          scopes: 'profile_nickname, profile_image',
        },
      })
    } catch (err: any) {
      setErrorMsg(err.message || '카카오 로그인에 실패했습니다.')
      setOauthLoading(null)
    }
  }

  const handleGoogle = async () => {
    if (!isSupabaseReady) { setErrorMsg('Supabase 인증이 구성되지 않았았습니다.'); return }
    setOauthLoading('google')
    try {
      const supabase = createSupabaseClient()
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/`,
        },
      })
    } catch (err: any) {
      setErrorMsg(err.message || '구글 로그인에 실패했습니다.')
      setOauthLoading(null)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative overflow-hidden z-10 border border-warm-100 max-h-[90vh] overflow-y-auto"
          >
            {/* Header pattern banner */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-mint-400 via-purple-400 to-orange-400" />

            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 rounded-xl text-navy-400 hover:bg-warm-50 hover:text-navy-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6 pt-2">
              <div className="w-10 h-10 rounded-full bg-mint-50 text-mint-600 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-lg md:text-xl font-extrabold text-navy-950">
                {isRegister ? '교회학교 솔루션 회원가입' : '사역자 파트너 로그인'}
              </h2>
              <p className="text-xs text-navy-400 mt-1">
                {isRegister 
                  ? '3초 가입으로 보관함과 프리미엄 자료를 사용하세요.' 
                  : '등록된 이메일 계정으로 로그인해 주세요.'}
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 font-bold mb-4">
                ⚠ {errorMsg}
              </div>
            )}

            {/* Social Login Buttons */}
            <div className="space-y-2.5 mb-5">
              <button
                onClick={handleKakao}
                disabled={!!oauthLoading || submitting}
                className="w-full py-3 rounded-xl bg-[#FEE500] text-[#191919] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#FDD800] hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {oauthLoading === 'kakao' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#191919">
                    <path d="M12 3C6.48 3 2 6.48 2 12s4.48 9 10 9 10-3.48 10-9S17.52 3 12 3zm-1 13.5l-.5-2.5L8 13l2.5-.5L11 10l.5 2.5L14 13l-2.5 1-.5 2.5z" />
                  </svg>
                )}
                카카오로 시작하기
              </button>

              <button
                onClick={handleGoogle}
                disabled={!!oauthLoading || submitting}
                className="w-full py-3 rounded-xl bg-white text-[#191f28] font-bold text-sm flex items-center justify-center gap-2.5 border border-warm-200 hover:bg-warm-50 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {oauthLoading === 'google' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Google로 시작하기
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-warm-100" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-navy-400">또는</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs md:text-sm">
              {isRegister && (
                <>
                  <div className="space-y-1">
                    <label className="block text-navy-600 font-bold">이름</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                      <input
                        type="text"
                        placeholder="홍길동"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-field pl-10 py-2.5"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-navy-600 font-bold">소속 교회명</label>
                    <div className="relative">
                      <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                      <input
                        type="text"
                        placeholder="예안교회"
                        required
                        value={church}
                        onChange={(e) => setChurch(e.target.value)}
                        className="input-field pl-10 py-2.5"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="block text-navy-600 font-bold">이메일 주소</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                  <input
                    type="email"
                    placeholder="pastor@church.org"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10 py-2.5"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-navy-600 font-bold">비밀번호</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10 py-2.5"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !!oauthLoading}
                className="btn-secondary w-full py-3 mt-2 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  isRegister ? '회원가입 완료' : '이메일로 로그인'
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-warm-100 text-center">
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrorMsg('');
                }}
                className="text-xs text-mint-600 font-bold hover:underline"
              >
                {isRegister ? '이미 계정이 있으신가요? 로그인하기' : '처음 방문이신가요? 3초 회원가입'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
