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
      className={`rounded-2xl border border-[#e5e8eb] bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden animate-in ${className}`}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e8eb]/60 bg-gradient-to-r from-[#fafbfc] to-white">
        <h3 className="text-[17px] font-bold text-[#191f28]">
          {emoji ? <span className="mr-1.5">{emoji}</span> : null}
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {action}
          {copyText && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[14px] text-[#8b95a1] hover:text-primary-500 hover:bg-primary-50 transition-all duration-200"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-500 font-medium">복사됨</span>
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
