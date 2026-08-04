'use client'

import React, { useState, useEffect, useRef } from 'react'

interface PerfectGridNoteProps {
  baseStep?: number
  step?: number // baseStep의 별칭
  color?: string
  borderColor?: string
  rounded?: string
  className?: string
  children?: React.ReactNode
}

/**
 * PerfectGridNote
 * 부모 영역을 100% 가득 채우면서(여백 제거), 둥근 테두리(rounded-lg)를 유지하고,
 * 끄트머리에 반쪽짜리로 잘리는 모눈 없이 딱 떨어진 정방형 모눈만 렌더링하는 컴포넌트입니다.
 */
export default function PerfectGridNote({
  baseStep,
  step = 16,
  color = '#cbd5e1',
  borderColor = 'border-slate-400',
  rounded = 'rounded-lg',
  className = '',
  children,
}: PerfectGridNoteProps) {
  const effectiveStep = baseStep || step
  const containerRef = useRef<HTMLDivElement>(null)
  const [gridConfig, setGridConfig] = useState<{ cols: number; rows: number } | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const updateGrid = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const w = rect.width
      const h = rect.height

      if (w > 0 && h > 0) {
        // 목표 step 크기에 맞춰 가장 가까운 정수 개수의 컬럼과 로우 계산
        const cols = Math.max(1, Math.round(w / effectiveStep))
        const cellWidth = w / cols
        const rows = Math.max(1, Math.round(h / cellWidth))
        setGridConfig({ cols, rows })
      }
    }

    updateGrid()

    const observer = new ResizeObserver(updateGrid)
    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [effectiveStep])

  return (
    <div
      ref={containerRef}
      className={`w-full h-full border ${borderColor} ${rounded} bg-white shadow-2xs overflow-hidden relative flex flex-col ${className}`}
      style={{
        backgroundImage: `
          linear-gradient(to right, ${color} 1px, transparent 1px),
          linear-gradient(to bottom, ${color} 1px, transparent 1px)
        `,
        backgroundSize: gridConfig
          ? `calc(100% / ${gridConfig.cols}) calc(100% / ${gridConfig.rows})`
          : `${effectiveStep}px ${effectiveStep}px`,
      }}
    >
      {children}
    </div>
  )
}
