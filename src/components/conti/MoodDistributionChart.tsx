'use client'

import type { ContiItem, MoodTag } from '@/types/conti'
import { MOOD_META } from './MoodTagBadge'
import { useState } from 'react'

interface Props {
  items: ContiItem[]
}

// 분위기별 색상 (donut 차트용 - 더 진한 버전)
const MOOD_CHART_COLORS: Record<MoodTag, string> = {
  '은혜': '#38bdf8',
  '경배': '#818cf8',
  '찬양': '#fbbf24',
  '회개': '#94a3b8',
  '축제': '#fb7185',
  '축복': '#34d399',
  '말씀': '#a78bfa',
  '고백': '#60a5fa',
  '선교': '#fb923c',
  '위로': '#2dd4bf',
  '소망': '#22d3ee',
  '감사': '#facc15',
  '사랑': '#f472b6',
  '결단': '#e879f9',
}

export default function MoodDistributionChart({ items }: Props) {
  const [hoveredTag, setHoveredTag] = useState<MoodTag | null>(null)

  // 각 분위기 카운트 (곡 단위, 한 곡에 여러 태그 가능 → 가중치 분배)
  const counts: Record<string, number> = {}
  items.forEach((it) => {
    if (!it.song?.tags || it.song.tags.length === 0) return
    const weight = 1 / it.song.tags.length
    it.song.tags.forEach((t) => {
      counts[t] = (counts[t] || 0) + weight
    })
  })

  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  if (total === 0) {
    return (
      <div className="h-[120px] flex items-center justify-center text-[12px] text-slate-500">
        분위기 정보 없음
      </div>
    )
  }

  // 비율 정렬
  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({
      tag: tag as MoodTag,
      count,
      percent: count / total,
    }))

  // 도넛 차트 path 계산
  const radius = 36
  const innerRadius = 22
  const cx = 50
  const cy = 50
  const circumference = 2 * Math.PI * radius

  let cumulative = 0
  const segments = sorted.map(({ tag, percent }) => {
    const dashArray = `${percent * circumference} ${circumference}`
    const dashOffset = -cumulative * circumference
    cumulative += percent
    return { tag, percent, dashArray, dashOffset, color: MOOD_CHART_COLORS[tag] || '#94a3b8' }
  })

  const hoveredSegment = hoveredTag ? sorted.find((s) => s.tag === hoveredTag) : null

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
        <span>분위기 분포</span>
        <span className="text-slate-600">·</span>
        <span>{sorted.length}종</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <svg width="100" height="100" viewBox="0 0 100 100">
            {/* 배경 원 */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="14"
            />
            {/* 세그먼트 */}
            {segments.map((seg) => (
              <circle
                key={seg.tag}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth="14"
                strokeDasharray={seg.dashArray}
                strokeDashoffset={seg.dashOffset}
                transform={`rotate(-90 ${cx} ${cy})`}
                strokeLinecap="butt"
                className="cursor-pointer"
                style={{
                  opacity: hoveredTag && hoveredTag !== seg.tag ? 0.4 : 1,
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={() => setHoveredTag(seg.tag)}
                onMouseLeave={() => setHoveredTag(null)}
              />
            ))}
            {/* 중앙 텍스트 */}
            <text
              x={cx}
              y={cy - 4}
              textAnchor="middle"
              className="text-[16px] font-extrabold"
              fill="white"
            >
              {hoveredSegment ? `${Math.round(hoveredSegment.percent * 100)}%` : `${items.length}곡`}
            </text>
            <text
              x={cx}
              y={cy + 10}
              textAnchor="middle"
              className="text-[10px] font-bold"
              fill="rgba(148,163,184,0.7)"
            >
              {hoveredSegment ? MOOD_META[hoveredSegment.tag].label : 'TOTAL'}
            </text>
          </svg>
        </div>

        {/* 범례 */}
        <div className="flex flex-col gap-0.5 text-[11px] max-h-[100px] overflow-y-auto scrollbar-thin">
          {sorted.slice(0, 6).map(({ tag, percent }) => (
            <div
              key={tag}
              className={`flex items-center gap-1.5 transition-opacity ${
                hoveredTag && hoveredTag !== tag ? 'opacity-40' : ''
              }`}
              onMouseEnter={() => setHoveredTag(tag)}
              onMouseLeave={() => setHoveredTag(null)}
            >
              <span
                className="w-2 h-2 rounded-sm flex-shrink-0"
                style={{ backgroundColor: MOOD_CHART_COLORS[tag] }}
              />
              <span className="text-slate-300 font-medium">#{MOOD_META[tag].label}</span>
              <span className="text-slate-500 ml-auto font-bold">
                {Math.round(percent * 100)}%
              </span>
            </div>
          ))}
          {sorted.length > 6 && (
            <span className="text-slate-600 text-[10px]">+{sorted.length - 6} more</span>
          )}
        </div>
      </div>
    </div>
  )
}
