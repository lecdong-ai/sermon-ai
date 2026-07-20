'use client'

import { useState } from 'react'
import { Copy, Check, Heart, HandHeart } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const ACCOUNT = '3333-07-0197297'
const BANK = '카카오뱅크'
const HOLDER = '전정우'

export function DonationSection() {
  const [copied, setCopied] = useState(false)

  const copyAccount = () => {
    navigator.clipboard.writeText(`${BANK} ${ACCOUNT} ${HOLDER}`).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-lg mx-auto px-5 sm:px-6">
        <div className="text-center space-y-8">
          {/* Header */}
          <div className="space-y-3">
            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto">
              <HandHeart className="w-7 h-7 text-rose-500" />
            </div>
            <h2 className="font-serif text-h1 text-foreground">자발적 후원</h2>
            <p className="text-body text-foreground-muted max-w-sm mx-auto leading-relaxed">
              쇼핑 외에도 마음을 전하고 싶다면,<br />
              부담 없이 아래 계좌로 후원해 주세요.
            </p>
          </div>

          {/* Account card */}
          <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-elevated space-y-5">
            {/* Bank icon + name */}
            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-[11px] font-bold text-yellow-700">카뱅</span>
              </div>
              <span className="text-body font-semibold text-foreground">{BANK}</span>
            </div>

            {/* Account number */}
            <div>
              <p className="text-[32px] sm:text-[40px] font-bold tracking-[0.15em] text-foreground font-mono leading-none">
                {ACCOUNT}
              </p>
            </div>

            {/* Holder */}
            <p className="text-body text-foreground-muted">
              예금주: <span className="font-semibold text-foreground">{HOLDER}</span>
            </p>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Copy button */}
            <button
              onClick={copyAccount}
              className={cn(
                'w-full py-3.5 rounded-xl font-medium text-body transition-all duration-200 flex items-center justify-center gap-2',
                copied
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-accent text-white hover:bg-accent/90 active:scale-[0.98]'
              )}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  복사되었습니다
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  계좌번호 복사
                </>
              )}
            </button>
          </div>

          {/* Footer message */}
          <p className="text-meta text-foreground-subtle leading-relaxed">
            <Heart className="w-3.5 h-3.5 inline-block text-rose-400 align-middle mr-1" />
            소중한 마음이 사역을 이어갑니다. 진심으로 감사드립니다.
          </p>
        </div>
      </div>
    </section>
  )
}
