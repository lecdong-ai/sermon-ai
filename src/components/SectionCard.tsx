'use client'

import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface Props {
  title: string
  emoji?: string
  children: React.ReactNode
  copyText?: string
  action?: React.ReactNode
  className?: string
}

export default function SectionCard({ title, emoji, children, copyText, action, className = '' }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!copyText) return
    try {
      await navigator.clipboard.writeText(copyText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <section
      className={`rounded-xl border border-[#e4e2dd] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] animate-in ${className}`}
    >
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e4e2dd]/60 bg-[#fdfcf9]">
        <h3 className="text-[15px] font-bold text-[#2c2a29]">
          {emoji ? <span className="mr-1.5">{emoji}</span> : null}
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {action}
          {copyText && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[13px] text-[#8a8580] hover:text-[#8d7a5b] hover:bg-[#f5f4f0] transition-all duration-200"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#8d7a5b]" />
                  <span className="text-[#8d7a5b] font-medium">복사됨</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="font-medium">복사</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
      <div className="p-5">
        {children}
      </div>
    </section>
  )
}
