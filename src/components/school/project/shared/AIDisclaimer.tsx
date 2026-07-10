'use client'

import { Sparkles, AlertCircle } from 'lucide-react'

interface AIDisclaimerProps {
  variant?: 'inline' | 'banner' | 'compact'
  className?: string
}

/**
 * AI 생성 콘텐츠 면책 고지
 * - 사용자가 AI가 생성한 텍스트를 보고 강단/출판에 사용하기 전에
 *   신학적·교리적 검수를 해야 한다는 점을 명시
 */
export default function AIDisclaimer({ variant = 'inline', className = '' }: AIDisclaimerProps) {
  if (variant === 'banner') {
    return (
      <div className={`flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[12px] text-amber-200 leading-relaxed ${className}`}>
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
        <p>
          <strong className="font-semibold">AI가 생성한 초안입니다.</strong> 신학적·교리적 정확성은
          <strong>목회자 본인이 직접 검수</strong>해야 하며, 강단 선포·출판 전 반드시 본문 대조와 신학 검토를 거치시기 바랍니다.
        </p>
      </div>
    )
  }
  if (variant === 'compact') {
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] text-amber-400/80 ${className}`} title="AI가 생성한 초안 — 목회자 검수 필요">
        <Sparkles className="w-3 h-3" />
        AI 초안 · 검수 필요
      </span>
    )
  }
  return (
    <div className={`flex items-center gap-1.5 text-[11px] text-amber-300/80 ${className}`}>
      <Sparkles className="w-3 h-3" />
      <span>AI 생성 · 목회자 직접 검수 권장</span>
    </div>
  )
}
