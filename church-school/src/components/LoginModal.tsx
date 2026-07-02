'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { X, Mail, Lock, User, School, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
            className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative overflow-hidden z-10 border border-warm-100"
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
                disabled={submitting}
                className="btn-secondary w-full py-3 mt-4 text-sm font-bold flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  isRegister ? '회원가입 완료' : '로그인 완료'
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-warm-100 text-center">
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
