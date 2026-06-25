'use client'

import Link from 'next/link'
import { X, Crown, Calendar, Sparkles, FileText, Youtube, BarChart3 } from 'lucide-react'
import type { LimitsData } from './UsageCounter'

interface LimitReachedModalProps {
  open: boolean
  onClose: () => void
  limits: LimitsData
  errorCode: 'limit_reached' | 'supporter_only'
  message: string
  details?: {
    action?: string
    current?: number
    limit?: number
    resetAt?: string
    daysUntilReset?: number
  }
}

const ACTION_META: Record<string, { label: string; icon: any; shortLabel: string; description: string }> = {
  ai_analysis: {
    label: 'AI 분석 6종',
    shortLabel: 'AI 분석',
    icon: Sparkles,
    description: '설교 원고 업로드 후 6종 콘텐츠 자동 생성',
  },
  manual_sermon: {
    label: '새 설교 등록',
    shortLabel: '설교 등록',
    icon: FileText,
    description: '본문 정보를 직접 입력하여 설교 등록',
  },
  project: {
    label: '말씀 연구실',
    shortLabel: '연구실',
    icon: BarChart3,
    description: '설교 프로젝트 — 성경 정밀 연구 + 원고 작성',
  },
  youtube: {
    label: '유튜브 연구소',
    shortLabel: '유튜브',
    icon: Youtube,
    description: '유튜브 설교 영상 분석 + 통찰 노트',
  },
}

export default function LimitReachedModal({ open, onClose, limits, errorCode, message, details }: LimitReachedModalProps) {
  if (!open) return null

  const actionKey = details?.action || 'ai_analysis'
  const meta = ACTION_META[actionKey] || ACTION_META.ai_analysis
  const Icon = meta.icon

  const isSupporterOnly = errorCode === 'supporter_only'
  const isLimitReached = errorCode === 'limit_reached'

  // 유예 기간 중이면 표시 안 함
  if (limits.inGracePeriod) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#0a0e1a] border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden animate-modal-in"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors z-10"
          aria-label="닫기"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>

        {/* 헤더 */}
        <div className={`relative px-6 pt-8 pb-5 border-b border-white/5 ${
          isSupporterOnly
            ? 'bg-gradient-to-br from-amber-500/10 to-transparent'
            : 'bg-gradient-to-br from-rose-500/10 to-transparent'
        }`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${
            isSupporterOnly
              ? 'bg-amber-500/20 border border-amber-500/30'
              : 'bg-rose-500/20 border border-rose-500/30'
          }`}>
            {isSupporterOnly ? <Crown className="w-6 h-6 text-amber-300" /> : <Icon className="w-6 h-6 text-rose-300" />}
          </div>
          <h2 className="text-[18px] font-extrabold text-white">
            {isSupporterOnly ? '사역 동참자 전용 기능' : `${meta.label} 한도 도달`}
          </h2>
          <p className="text-[12.5px] text-slate-400 mt-1.5 leading-relaxed">
            {message || (isSupporterOnly
              ? '이 기능은 사역 동참자만 사용하실 수 있습니다.'
              : '이번 30일 한도를 모두 사용하셨습니다.')}
          </p>
        </div>

        {/* 상세 정보 */}
        {isLimitReached && details && (
          <div className="px-6 py-5 border-b border-white/5">
            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">이번 30일 사용량</p>
                {details.daysUntilReset !== undefined && (
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    D-{details.daysUntilReset} 리셋
                  </p>
                )}
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[24px] font-extrabold text-white leading-none tabular-nums">
                    {details.current ?? 0}
                    <span className="text-slate-500 text-[14px] font-medium mx-1">/</span>
                    <span className="text-slate-400 text-[18px]">{details.limit}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1.5">{meta.description}</p>
                </div>
                {/* 진행률 바 */}
                <div className="w-20 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-500 to-rose-400"
                    style={{ width: `${Math.min(100, ((details.current ?? 0) / (details.limit || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed mt-3">
              * 한도는 가입일 기준 30일 단위로 리셋됩니다.<br />
              * 기존에 작성한 모든 데이터는 그대로 보존됩니다.
            </p>
          </div>
        )}

        {/* 비교 */}
        <div className="px-6 py-5 border-b border-white/5">
          <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-3">
            등급별 한도
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div>
                <p className="text-[13px] font-semibold text-slate-300">일반 회원</p>
                <p className="text-[10px] text-slate-500">무료</p>
              </div>
              <p className="text-[13px] font-bold text-slate-400 tabular-nums">
                {actionKey === 'ai_analysis' ? '10편/30일' :
                 actionKey === 'manual_sermon' ? '10편/30일' :
                 actionKey === 'project' ? '1편/30일' :
                 actionKey === 'youtube' ? '1회/30일' : '-'}
              </p>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <div>
                  <p className="text-[13px] font-semibold text-amber-200">사역 동참자</p>
                  <p className="text-[10px] text-amber-300/70">월 10,000원~ · 커피 한 잔 값</p>
                </div>
              </div>
              <p className="text-[13px] font-bold text-amber-200 tabular-nums">
                {actionKey === 'ai_analysis' ? '20편/30일' :
                 actionKey === 'manual_sermon' ? '20편/30일' :
                 actionKey === 'project' ? '20편/30일' :
                 actionKey === 'youtube' ? '10회/30일' : '-'}
              </p>
            </div>
          </div>
          <p className="mt-3 text-[10.5px] text-amber-300/70 leading-relaxed">
            ✨ 벌써 47명의 목회자가 동참하며 한도를 2배로 늘렸습니다
          </p>
        </div>

        {/* CTA */}
        <div className="px-6 py-4 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[12px] text-slate-400 hover:text-slate-200 transition-colors"
          >
            나중에
          </button>
          <Link
            href="/support"
            className="group flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-[12px] font-bold transition-all shadow-md shadow-amber-500/30"
          >
            <Crown className="w-3.5 h-3.5" />
            30초 만에 한도 2배로 ↑
          </Link>
        </div>
      </div>
    </div>
  )
}
