'use client'

import { useState } from 'react'
import type { ContiItem } from '@/types/conti'
import { Music, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Props {
  items: ContiItem[]
}

export default function BpmVisualizer({ items }: Props) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const bpms = items.map((it) => it.bpm_override ?? it.song?.bpm ?? null)
  const validBpms = bpms.filter((b): b is number => b != null)
  if (validBpms.length === 0) {
    return (
      <div className="h-[120px] flex items-center justify-center text-[12px] text-slate-500">
        BPM 정보 없음
      </div>
    )
  }

  const minBpm = Math.min(...validBpms) - 8
  const maxBpm = Math.max(...validBpms) + 8
  const range = maxBpm - minBpm || 1

  const W = 240
  const H = 100
  const padX = 16
  const padY = 14
  const innerW = W - padX * 2
  const innerH = H - padY * 2

  // 좌표 계산
  const points = bpms.map((bpm, idx) => {
    if (bpm == null) return null
    const x = items.length === 1 ? padX + innerW / 2 : padX + (idx / (items.length - 1)) * innerW
    const y = padY + (1 - (bpm - minBpm) / range) * innerH
    return { x, y, bpm, idx }
  }).filter((p): p is { x: number; y: number; bpm: number; idx: number } => p != null)

  // 평균 BPM (arc 표시용)
  const avgBpm = Math.round(validBpms.reduce((a, b) => a + b, 0) / validBpms.length)
  const avgY = padY + (1 - (avgBpm - minBpm) / range) * innerH

  // 흐름 분석
  const firstBpm = validBpms[0]
  const lastBpm = validBpms[validBpms.length - 1]
  const diff = lastBpm - firstBpm
  let flow: 'up' | 'down' | 'flat' | 'arc' = 'flat'
  if (Math.abs(diff) <= 4) flow = 'flat'
  else if (diff > 0) flow = 'up'
  else flow = 'down'
  // 중간이 가장 빠른지 확인 (arc)
  const midBpm = validBpms[Math.floor(validBpms.length / 2)]
  if (midBpm > firstBpm + 8 && midBpm > lastBpm) flow = 'arc'

  const FlowIcon = flow === 'up' ? TrendingUp : flow === 'down' ? TrendingDown : Minus
  const flowLabel = flow === 'up' ? '빌드업' : flow === 'down' ? '다운' : flow === 'arc' ? '아크형' : '안정'
  const flowColor = flow === 'up' ? 'text-rose-300' : flow === 'down' ? 'text-sky-300' : flow === 'arc' ? 'text-amber-300' : 'text-slate-300'

  // 경로 (라인)
  const pathD = points.length > 0
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    : ''

  // 영역 (라인 아래 채우기)
  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${H - padY} L ${points[0].x} ${H - padY} Z`
    : ''

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5">
          <Music className="w-3 h-3 text-slate-500" />
          <span className="text-slate-500 font-medium">BPM 아크</span>
        </div>
        <div className={`flex items-center gap-1 ${flowColor} font-bold`}>
          <FlowIcon className="w-3 h-3" />
          {flowLabel} · 평균 ♩{avgBpm}
        </div>
      </div>

      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-[240px] h-[100px]"
      >
        {/* 그리드 */}
        <line x1={padX} y1={padY} x2={W - padX} y2={padY} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <line x1={padX} y1={H - padY} x2={W - padX} y2={H - padY} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

        {/* 평균 BPM 라인 */}
        <line
          x1={padX} y1={avgY} x2={W - padX} y2={avgY}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <text
          x={W - padX - 2} y={avgY - 3}
          textAnchor="end"
          className="text-[10px] font-bold"
          fill="rgba(148,163,184,0.6)"
        >
          avg
        </text>

        {/* 영역 */}
        {areaD && (
          <path d={areaD} fill="url(#bpmGrad)" opacity="0.4" />
        )}
        <defs>
          <linearGradient id="bpmGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 라인 */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="#a78bfa"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* 점 */}
        {points.map((p) => {
          const isHovered = hoveredIdx === p.idx
          return (
            <g key={p.idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 6 : 4}
                fill={isHovered ? '#fbbf24' : '#a78bfa'}
                stroke="white"
                strokeWidth="1.5"
                onMouseEnter={() => setHoveredIdx(p.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
                style={{ transition: 'r 0.15s, fill 0.15s' }}
              />
              {isHovered && (
                <g>
                  <rect
                    x={p.x - 22}
                    y={p.y - 22}
                    width="44"
                    height="16"
                    rx="3"
                    fill="#0a0f1f"
                    stroke="#fbbf24"
                    strokeWidth="1"
                  />
                  <text
                    x={p.x}
                    y={p.y - 11}
                    textAnchor="middle"
                    className="text-[10px] font-extrabold"
                    fill="#fbbf24"
                  >
                    ♩{p.bpm} · {p.idx + 1}번
                  </text>
                </g>
              )}
            </g>
          )
        })}

        {/* 라벨 */}
        <text x={padX} y={H - 2} className="text-[10px] font-bold" fill="rgba(148,163,184,0.5)">
          ♩{minBpm + 8}
        </text>
        <text x={W - padX} y={H - 2} textAnchor="end" className="text-[10px] font-bold" fill="rgba(148,163,184,0.5)">
          ♩{maxBpm - 8}
        </text>
      </svg>
    </div>
  )
}
