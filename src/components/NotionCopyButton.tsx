'use client'

import React, { useState, useEffect } from 'react'
import { Copy, Check, Info, Sparkles, ExternalLink } from 'lucide-react'
import { NotionBlockData, copyNotionRichText } from '@/lib/notionClipboard'

interface Props {
  data: NotionBlockData | (() => NotionBlockData)
  variant?: 'compact' | 'badge' | 'banner' | 'icon'
  className?: string
  onCopied?: (targetDb: string) => void
}

export default function NotionCopyButton({
  data,
  variant = 'compact',
  className = '',
  onCopied,
}: Props) {
  const [copied, setCopied] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isMac, setIsMac] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || ''))
    }
  }, [])

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const blockData = typeof data === 'function' ? data() : data
    const success = await copyNotionRichText(blockData)

    if (success) {
      setCopied(true)
      const shortcut = isMac ? 'Cmd+V' : 'Ctrl+V'
      const msg = `노션 서식으로 복사되었습니다! 노션 템플릿의 [${blockData.targetDatabase}]에서 ${shortcut}를 누르세요.`
      setToastMessage(msg)

      if (onCopied) {
        onCopied(blockData.targetDatabase)
      }

      setTimeout(() => {
        setCopied(false)
      }, 2500)

      setTimeout(() => {
        setToastMessage(null)
      }, 3500)
    }
  }

  const currentData = typeof data === 'function' ? data() : data
  const shortcut = isMac ? 'Cmd+V' : 'Ctrl+V'

  // 1. Icon only
  if (variant === 'icon') {
    return (
      <div className="relative inline-flex items-center">
        <button
          onClick={handleCopy}
          className={`p-1.5 rounded-lg border transition-all duration-200 text-xs flex items-center justify-center ${
            copied
              ? 'bg-[#2eaadc]/15 text-[#2eaadc] border-[#2eaadc]/40 font-bold'
              : 'bg-white hover:bg-[#f7f6f3] text-[#37352f] border-[#e0e0e0] hover:border-[#b0b0b0]'
          } ${className}`}
          title="사역자 세컨드 브레인(Notion) 전용 복사"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#2eaadc]" /> : <span className="text-[12px]">🏛️</span>}
        </button>
        {renderToast()}
      </div>
    )
  }

  // 2. Compact (헤더/액션바용)
  if (variant === 'compact') {
    return (
      <div className="relative inline-flex items-center">
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[13px] border transition-all duration-200 ${
            copied
              ? 'bg-[#2eaadc]/10 text-[#0c7792] border-[#2eaadc]/40 font-bold shadow-2xs'
              : 'bg-white hover:bg-[#fbfbfa] text-[#4a4744] hover:text-[#191711] border-[#e4e2dd] hover:border-[#c8c5be] shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
          } ${className}`}
          title={`노션 세컨드 브레인 서식으로 복사 (${currentData.categoryTag || ''} > ${currentData.targetDatabase})`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#0c7792]" />
              <span className="text-[#0c7792] font-semibold">노션 복사됨!</span>
            </>
          ) : (
            <>
              <span className="text-[12px] leading-none">🏛️</span>
              <span className="font-medium text-[#37352f]">노션 전용 복사</span>
            </>
          )}
        </button>
        {renderToast()}
      </div>
    )
  }

  // 3. Badge (미니멀 모노크롬 매핑 인디케이터 + 복사)
  if (variant === 'badge') {
    return (
      <div className={`relative inline-flex items-center gap-1.5 flex-wrap ${className}`}>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#f7f6f3] border border-[#e0dfdc] text-[11px] text-[#5a5652] cursor-help transition-colors hover:bg-[#f1efe9]"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <span className="text-[11px]">🏛️</span>
          <span className="font-semibold text-[#37352f]">세컨드 브레인 매핑:</span>
          <span className="font-bold text-[#2eaadc]">{currentData.categoryTag || '📚 RESOURCES'}</span>
          <span className="text-[#999]">&gt;</span>
          <span className="font-medium text-[#37352f] truncate max-w-[140px] sm:max-w-none">{currentData.targetDatabase}</span>
          <Info className="w-3 h-3 text-[#9b9a97] ml-0.5" />
        </div>

        <button
          onClick={handleCopy}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold border transition-all ${
            copied
              ? 'bg-[#2eaadc] text-white border-[#2eaadc]'
              : 'bg-white hover:bg-[#f7f6f3] text-[#37352f] border-[#d4d1c9] hover:border-[#9b9a97]'
          }`}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? '복사 완료' : '노션 복사'}</span>
        </button>

        {renderTooltip()}
        {renderToast()}
      </div>
    )
  }

  // 4. Banner (카드 하단에 위치하는 와이드 가이드 & 1초 복사 UI)
  return (
    <div className={`relative mt-4 pt-3.5 border-t border-[#e4e2dd]/70 bg-gradient-to-r from-[#fbfbfa] to-[#f7f6f3] -mx-5 -mb-5 px-5 py-3 rounded-b-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-white border border-[#e0dfdc] flex items-center justify-center shrink-0 shadow-2xs">
          <span className="text-[14px]">🏛️</span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-[#787774] uppercase tracking-wider">사역자 세컨드 브레인 매핑</span>
            <span className="text-[11px] text-[#d4d1c9]">|</span>
            <span className="text-[11px] font-bold text-[#2eaadc] px-1.5 py-0.2 rounded bg-[#2eaadc]/10">
              {currentData.categoryTag || '📚 RESOURCES'}
            </span>
            <span className="text-[11px] font-bold text-[#37352f] truncate">
              {currentData.targetDatabase}
            </span>
          </div>
          <p className="text-[11px] text-[#787774] mt-0.5 truncate">
            노션에 붙여넣으면 콜아웃, 구분선, 불릿 리스트 서식이 자동으로 완성됩니다. ({shortcut})
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all duration-200 shadow-2xs ${
            copied
              ? 'bg-[#2eaadc] text-white border-[#2eaadc]'
              : 'bg-[#191711] hover:bg-[#2c2a29] text-white border-[#191711]'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>노션 서식 복사됨!</span>
            </>
          ) : (
            <>
              <span className="text-[12px]">🏛️</span>
              <span>노션 1초 복사</span>
            </>
          )}
        </button>
      </div>

      {renderToast()}
    </div>
  )

  function renderTooltip() {
    if (!showTooltip) return null
    return (
      <div className="absolute bottom-full left-0 mb-2 z-50 w-72 p-3 bg-[#191711] text-white text-[11px] rounded-xl shadow-xl border border-white/10 animate-in fade-in zoom-in-95 pointer-events-none">
        <div className="font-bold flex items-center gap-1 mb-1 text-[#2eaadc]">
          <span>🏛️ 사역자 세컨드 브레인 (PARA 결합)</span>
        </div>
        <p className="text-white/80 leading-relaxed">
          이 자료는 사역자 세컨드 브레인 노션 템플릿의 <strong>[{currentData.categoryTag}] &gt; [{currentData.targetDatabase}]</strong> 페이지/DB에 최적화된 리치 서식(콜아웃, 토글, 리스트)으로 자동 변환됩니다.
        </p>
        <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] text-white/50">
          <span>클릭 시 자동 클립보드 저장</span>
          <span className="font-mono text-[#2eaadc]">{shortcut}</span>
        </div>
      </div>
    )
  }

  function renderToast() {
    if (!toastMessage) return null
    return (
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-3 duration-300 pointer-events-none">
        <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl bg-[#191711]/95 text-white border border-[#2eaadc]/40 backdrop-blur-xl">
          <div className="w-8 h-8 rounded-full bg-[#2eaadc]/20 flex items-center justify-center shrink-0">
            <span className="text-[16px]">🏛️</span>
          </div>
          <div className="text-left">
            <p className="text-[13px] font-bold text-white flex items-center gap-1.5">
              <span>노션 맞춤형 리치 복사 완료!</span>
              <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-[#2eaadc]/20 text-[#2eaadc]">HTML + 텍스트</span>
            </p>
            <p className="text-[12px] text-[#d4d1c9] mt-0.5">
              노션 템플릿 <strong>[{currentData.targetDatabase}]</strong>에서 <span className="font-bold text-[#2eaadc]">{shortcut}</span>를 누르세요.
            </p>
          </div>
        </div>
      </div>
    )
  }
}
