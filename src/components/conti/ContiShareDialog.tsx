'use client'

import { useState, useEffect } from 'react'
import type { ContiSet } from '@/types/conti'
import { generateShareToken } from '@/lib/conti/mockStorage'
import { WORSHIP_TYPE_META } from '@/types/conti'
import {
  Share2, X, Copy, ExternalLink, Check, Link2, Eye, EyeOff,
  QrCode, Lock, Globe, AlertCircle, RefreshCw,
} from 'lucide-react'

interface Props {
  conti: ContiSet
  onClose: () => void
  onUpdated: (updated: ContiSet) => void
}

function formatDate(iso: string | null): string {
  if (!iso) return '날짜 미정'
  const d = new Date(iso)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}

export default function ContiShareDialog({ conti, onClose, onUpdated }: Props) {
  const [shareToken, setShareToken] = useState(conti.share_token || '')
  const [isPublic, setIsPublic] = useState(conti.is_public)
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [saving, setSaving] = useState(false)

  // 공유 URL (현재 origin 기반)
  const [shareUrl, setShareUrl] = useState('')
  useEffect(() => {
    if (typeof window !== 'undefined' && shareToken) {
      setShareUrl(`${window.location.origin}/share/conti/${shareToken}`)
    }
  }, [shareToken])

  function handleGenerateToken() {
    const newToken = generateShareToken()
    setShareToken(newToken)
    setIsPublic(true)
  }

  function handleRegenerateToken() {
    if (!confirm('기존 공유 링크가 무효화됩니다. 계속할까요?')) return
    const newToken = generateShareToken()
    setShareToken(newToken)
  }

  async function handleSave() {
    setSaving(true)
    const updated: ContiSet = {
      ...conti,
      is_public: isPublic,
      share_token: shareToken || null,
      updated_at: new Date().toISOString(),
    }
    // 잠시 대기 (UI 피드백)
    await new Promise((r) => setTimeout(r, 400))
    onUpdated(updated)
    setSaving(false)
  }

  async function handleCopy() {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const input = document.createElement('input')
      input.value = shareUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function handleOpenPreview() {
    if (shareUrl) window.open(shareUrl, '_blank', 'noopener,noreferrer')
  }

  function handleCopyContiInfo() {
    const info = `🎵 ${conti.title}
📅 ${formatDate(conti.date)} · ${WORSHIP_TYPE_META[conti.worship_type].label}

전체 콘티 보기: ${shareUrl || '(먼저 링크를 생성하세요)'}`
    navigator.clipboard?.writeText(info)
    alert('예배 정보를 클립보드에 복사했습니다.\n카톡/슬랙 등에 붙여넣기 하세요.')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03050c]/85 backdrop-blur-md" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-[#0a0f1f] border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/20 flex items-center justify-center">
              <Share2 className="w-4 h-4 text-sky-300" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-white">콘티 공유</h2>
              <p className="text-[13px] text-slate-500 font-medium">찬양팀에게 읽기 전용 링크를 보냅니다</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-5">
          {/* 콘티 요약 */}
          <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[12px] px-1.5 py-0.5 rounded font-bold ${
                WORSHIP_TYPE_META[conti.worship_type].color === 'amber' ? 'bg-amber-500/15 text-amber-300' :
                WORSHIP_TYPE_META[conti.worship_type].color === 'emerald' ? 'bg-emerald-500/15 text-emerald-300' :
                'bg-indigo-500/15 text-indigo-300'
              }`}>
                {WORSHIP_TYPE_META[conti.worship_type].label}
              </span>
              {isPublic ? (
                <span className="text-[12px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5" />
                  공개
                </span>
              ) : (
                <span className="text-[12px] px-1.5 py-0.5 rounded bg-slate-500/15 text-slate-400 font-bold flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  비공개
                </span>
              )}
            </div>
            <h3 className="text-[17px] font-extrabold text-white">{conti.title}</h3>
            <p className="text-[13px] text-slate-500 font-medium mt-1">{formatDate(conti.date)}</p>
          </div>

          {/* 공개/비공개 토글 */}
          <div>
            <label className="text-[12px] font-extrabold uppercase tracking-widest text-slate-500 mb-2 block">
              공개 설정
            </label>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                  isPublic ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm ${
                    isPublic ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-white">
                  {isPublic ? '누구나 링크로 열람 가능' : '링크가 있어도 열람 불가'}
                </p>
                <p className="text-[12px] text-slate-500 font-medium mt-0.5">
                  {isPublic
                    ? '링크를 가진 사람은 누구나 콘티를 볼 수 있습니다'
                    : '비공개 상태에서는 토큰이 있어도 404를 반환합니다'}
                </p>
              </div>
              {isPublic ? <Eye className="w-4 h-4 text-emerald-300" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
            </div>
          </div>

          {/* 공유 링크 */}
          <div>
            <label className="text-[12px] font-extrabold uppercase tracking-widest text-slate-500 mb-2 block">
              공유 링크
            </label>
            {shareToken ? (
              <div className="space-y-2">
                <div className="flex items-stretch gap-2">
                  <div className="flex-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white font-mono overflow-x-auto whitespace-nowrap scrollbar-thin">
                    {shareUrl}
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 px-4 rounded-lg font-bold text-[13px] transition-all flex-shrink-0 ${
                      copied
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? '복사됨' : '복사'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenPreview}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-bold text-slate-300 hover:bg-white/5 border border-white/5"
                  >
                    <ExternalLink className="w-3 h-3" />
                    새 창에서 열기
                  </button>
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-bold text-slate-300 hover:bg-white/5 border border-white/5"
                  >
                    <QrCode className="w-3 h-3" />
                    {showQR ? 'QR 닫기' : 'QR 보기'}
                  </button>
                  <button
                    onClick={handleRegenerateToken}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-bold text-slate-300 hover:bg-white/5 border border-white/5"
                  >
                    <RefreshCw className="w-3 h-3" />
                    링크 재발급
                  </button>
                </div>

                {showQR && (
                  <div className="mt-3 p-4 rounded-xl bg-white border border-white/10 flex flex-col items-center">
                    {/* 간단한 QR placeholder (실제로는 qrcode 라이브러리 사용 가능) */}
                    <div className="grid grid-cols-12 gap-0.5 w-32 h-32 bg-black p-1.5 rounded">
                      {Array.from({ length: 144 }).map((_, i) => {
                        // 의사 랜덤 패턴 (실제 QR 아님, 시각적 데모)
                        const filled = (i * 7 + 13) % 3 === 0
                        return (
                          <div
                            key={i}
                            className={filled ? 'bg-white' : 'bg-black'}
                            style={{ width: 8, height: 8 }}
                          />
                        )
                      })}
                    </div>
                    <p className="text-[12px] text-slate-500 font-medium mt-2 text-center">
                      핸드폰으로 스캔하면<br />바로 열립니다
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                      (시각적 데모 — 실제 QR 생성은 DB 연동 시)
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleGenerateToken}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/[0.05] text-[14px] font-bold text-slate-300 hover:text-indigo-300 transition-all"
              >
                <Link2 className="w-4 h-4" />
                공유 링크 생성
              </button>
            )}
          </div>

          {/* 카톡용 메시지 복사 */}
          {shareToken && isPublic && (
            <div>
              <label className="text-[12px] font-extrabold uppercase tracking-widest text-slate-500 mb-2 block">
                카톡/슬랙용 메시지
              </label>
              <button
                onClick={handleCopyContiInfo}
                className="w-full text-left px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 transition-all"
              >
                <p className="text-[14px] text-slate-200 font-medium">
                  🎵 <strong className="text-white">{conti.title}</strong>
                </p>
                <p className="text-[12px] text-slate-500 font-medium mt-0.5">
                  📅 {formatDate(conti.date)} · {WORSHIP_TYPE_META[conti.worship_type].label}
                </p>
                <p className="text-[12px] text-slate-500 font-mono mt-1 truncate">
                  {shareUrl}
                </p>
                <p className="text-[11px] text-indigo-300 font-bold mt-2">📋 클릭하여 메시지 + URL 복사</p>
              </button>
            </div>
          )}

          {/* 주의 사항 */}
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-500/[0.05] border border-amber-500/15">
            <AlertCircle className="w-3.5 h-3.5 text-amber-300 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-amber-100/80 font-medium leading-relaxed">
              공유 링크는 누구나 열 수 있습니다. <strong>민감한 메모(성도 개인정보 등)는 작성하지 마세요.</strong> 링크 재발급 시 기존 링크는 즉시 무효화됩니다.
            </p>
          </div>
        </div>

        {/* 풋터 */}
        <div className="flex items-center gap-2 px-6 py-4 border-t border-white/5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[13px] font-bold text-slate-400 hover:bg-white/5 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="ml-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[14px] font-extrabold transition-colors flex items-center gap-1.5 disabled:opacity-40"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                설정 저장
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
