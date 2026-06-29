'use client'

import type { ContiItem, MusicKey } from '@/types/conti'
import { getKeyCompatibility, KEY_COMPAT_COLORS, KEY_DISPLAY } from '@/lib/conti/keyTheory'

interface Props {
  items: ContiItem[]
  size?: number                  // SVG 크기
}

// 캠튼 서클: 12 key (장조) + 12 key (단조) = 24 위치
// 장조: 12시 방향부터 시계방향 (B → F# → ... → A)
// 실제로는 "전환 다이어그램" 으로 단순화: 장조 12개를 원형 배치
// 각 키는 고유 각도 (30°씩)
const MAJOR_KEYS: MusicKey[] = [
  'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F', 'C', 'G', 'D', 'A', 'E',
]

function keyToAngle(key: MusicKey | null): number {
  if (!key) return 0
  // 단조는 같은 피치의 장조 위치로 매핑
  const norm: MusicKey =
    key === 'Am' ? 'C' :
    key === 'Bm' ? 'D' :
    key === 'Cm' ? 'Eb' :
    key === 'Dm' ? 'F' :
    key === 'Em' ? 'G' :
    key === 'Fm' ? 'Ab' :
    key === 'Gm' ? 'Bb' :
    key
  const idx = MAJOR_KEYS.indexOf(norm)
  if (idx === -1) return 0
  return idx * 30 - 90              // 12시 방향 = 0°
}

function polar(r: number, deg: number, cx: number, cy: number) {
  const rad = (deg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export default function KeyTransitionDiagram({ items, size = 200 }: Props) {
  const cx = size / 2
  const cy = size / 2
  const radius = size * 0.36

  // 각 곡의 유효 키
  const keys = items.map((it) => it.key || it.song?.original_key || null)

  // 곡 위치 계산
  const points = keys.map((k, idx) => {
    const angle = keyToAngle(k)
    return { idx, key: k, angle, ...polar(radius, angle, cx, cy) }
  })

  // 인접 곡 연결 (호)
  const arcs: Array<{ x1: number; y1: number; x2: number; y2: number; color: string; midX: number; midY: number }> = []
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]
    const b = points[i + 1]
    if (!a.key || !b.key) continue
    const compat = getKeyCompatibility(a.key, b.key)
    const colorMap: Record<string, string> = {
      perfect: '#34d399',
      great: '#38bdf8',
      okay: '#fbbf24',
      awkward: '#fb923c',
      clash: '#fb7185',
    }
    arcs.push({
      x1: a.x, y1: a.y, x2: b.x, y2: b.y,
      color: colorMap[compat.label] || '#94a3b8',
      midX: (a.x + b.x) / 2,
      midY: (a.y + b.y) / 2,
    })
  }

  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} className="flex-shrink-0">
        {/* 외곽 원 */}
        <circle cx={cx} cy={cy} r={radius + 12} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="2 3" />

        {/* 12 위치 라벨 (key) */}
        {MAJOR_KEYS.map((k, i) => {
          const labelAngle = i * 30 - 90
          const lp = polar(radius + 22, labelAngle, cx, cy)
          return (
            <text
              key={k}
              x={lp.x}
              y={lp.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[11px] font-bold"
              fill="rgba(148,163,184,0.4)"
            >
              {KEY_DISPLAY[k] || k}
            </text>
          )
        })}

        {/* 인접 호 */}
        {arcs.map((arc, i) => {
          // 베지어 곡선 (단순 직선 대신 부드러운 호)
          const mx = (arc.x1 + arc.x2) / 2
          const my = (arc.y1 + arc.y2) / 2
          // 중심 방향으로 살짝 휘게
          const dx = cx - mx
          const dy = cy - my
          const len = Math.sqrt(dx * dx + dy * dy) || 1
          const offset = -18                              // 안쪽으로 휘게
          const cpx = mx + (dx / len) * offset
          const cpy = my + (dy / len) * offset
          return (
            <path
              key={i}
              d={`M ${arc.x1} ${arc.y1} Q ${cpx} ${cpy} ${arc.x2} ${arc.y2}`}
              fill="none"
              stroke={arc.color}
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.7"
            />
          )
        })}

        {/* 곡 점 */}
        {points.map((p) => (
          <g key={p.idx}>
            <circle
              cx={p.x}
              cy={p.y}
              r="6"
              fill="#6366f1"
              stroke="white"
              strokeWidth="2"
            />
            <text
              x={p.x}
              y={p.y + 0.5}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] font-extrabold pointer-events-none"
              fill="white"
            >
              {p.idx + 1}
            </text>
          </g>
        ))}

        {/* 중앙 라벨 */}
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          className="text-[11px] font-bold"
          fill="rgba(148,163,184,0.5)"
        >
          KEY
        </text>
        <text
          x={cx}
          y={cy + 6}
          textAnchor="middle"
          className="text-[11px] font-bold"
          fill="rgba(148,163,184,0.5)"
        >
          FLOW
        </text>
      </svg>

      {/* 범례 */}
      <div className="flex flex-col gap-1 text-[11px] font-medium">
        <span className="text-slate-500 font-bold mb-0.5">전이 호환성</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-0.5 rounded bg-emerald-400" />
          <span className="text-slate-400">Perfect</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-0.5 rounded bg-sky-400" />
          <span className="text-slate-400">Great</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-0.5 rounded bg-amber-400" />
          <span className="text-slate-400">Okay</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-0.5 rounded bg-rose-400" />
          <span className="text-slate-400">Clash</span>
        </div>
      </div>
    </div>
  )
}
