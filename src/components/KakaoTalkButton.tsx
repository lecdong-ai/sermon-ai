'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, X, ExternalLink, Check } from 'lucide-react'

const KAKAO_CHANNEL_URL = process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL || ''

export default function KakaoTalkButton() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(Boolean(KAKAO_CHANNEL_URL))
  }, [])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  const handleOpenKakao = () => {
    if (!KAKAO_CHANNEL_URL) {
      setError('카카오톡 채널이 준비 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }
    window.open(KAKAO_CHANNEL_URL, '_blank', 'noopener,noreferrer')
    setOpen(false)
  }

  const handleClick = () => {
    setError(null)
    setOpen(true)
  }

  return (
    <>
      {/* 플로팅 버튼 (MessageButton 위에 배치) */}
      <button
        onClick={handleClick}
        className="fixed bottom-[6.5rem] right-6 z-40 w-14 h-14 rounded-full bg-[#FEE500] hover:bg-[#FDD800] text-[#3C1E1E] shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all hover:scale-105 flex items-center justify-center group"
        aria-label="카카오톡으로 문의"
      >
        <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" />
      </button>

      {/* 모달 */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-[#0a0e1a] border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden animate-modal-in"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FEE500] flex items-center justify-center">
                  <MessageCircle className="w-4.5 h-4.5 text-[#3C1E1E]" fill="currentColor" />
                </div>
                <div>
                  <h2 className="text-[14px] font-extrabold text-slate-100">카카오톡 문의</h2>
                  <p className="text-[10px] text-slate-500">카카오톡 채널로 연결합니다</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* 본문 */}
            <div className="p-6 space-y-4">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FEE500] flex items-center justify-center">
                  <MessageCircle className="w-9 h-9 text-[#3C1E1E]" fill="currentColor" />
                </div>
                <h3 className="text-[15px] font-bold text-slate-100">카카오톡 채널로 이동합니다</h3>
                <p className="text-[12px] text-slate-400 leading-relaxed">
                  관리자가 직접 답변드립니다.<br />
                  빠른 상담이 필요하신 분께 추천합니다.
                </p>
              </div>

              {ready ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <p className="text-[11px] text-emerald-300">카카오톡 채널이 준비되었습니다</p>
                </div>
              ) : (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2">
                  <span className="text-amber-300 text-[14px] leading-none mt-0.5">⚠</span>
                  <p className="text-[11px] text-amber-300 leading-relaxed">
                    카카오톡 채널이 준비 중입니다.<br />
                    잠시 후 다시 시도하시거나, 메시지로 문의해 주세요.
                  </p>
                </div>
              )}

              {error && (
                <p className="text-[11px] text-rose-400 text-center">{error}</p>
              )}
            </div>

            {/* 푸터 */}
            <div className="px-5 py-3 border-t border-white/5 flex items-center justify-end gap-2 bg-white/[0.02]">
              <button
                onClick={() => setOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-[12px] text-slate-400 hover:text-slate-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleOpenKakao}
                disabled={!ready}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#FEE500] hover:bg-[#FDD800] disabled:bg-slate-700 disabled:cursor-not-allowed text-[#3C1E1E] text-[12px] font-bold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                카카오톡으로 연결
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
