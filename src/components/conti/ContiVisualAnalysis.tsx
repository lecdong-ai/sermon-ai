'use client'

import type { ContiItem } from '@/types/conti'
import KeyTransitionDiagram from './KeyTransitionDiagram'
import BpmVisualizer from './BpmVisualizer'
import MoodDistributionChart from './MoodDistributionChart'
import { BarChart3 } from 'lucide-react'

interface Props {
  items: ContiItem[]
  compact?: boolean
}

export default function ContiVisualAnalysis({ items, compact = false }: Props) {
  if (items.length === 0) return null

  return (
    <div className={`rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm ${
      compact ? 'p-2.5' : 'p-3'
    }`}>
      <div className="flex items-center gap-1.5 mb-2">
        <BarChart3 className="w-3 h-3 text-indigo-300" />
        <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
          시각 분석
        </h3>
        <span className="text-[10px] text-slate-600 font-medium ml-auto">
          흐름 한눈에
        </span>
      </div>

      <div className={`grid grid-cols-1 ${compact ? 'gap-2' : 'md:grid-cols-3 gap-3'}`}>
        {/* Key 전이 다이어그램 */}
        <div className="flex justify-center">
          <KeyTransitionDiagram items={items} size={140} />
        </div>

        {/* BPM 아크 */}
        <div className="flex flex-col items-center justify-center">
          <BpmVisualizer items={items} />
        </div>

        {/* 분위기 도넛 */}
        <div>
          <MoodDistributionChart items={items} />
        </div>
      </div>
    </div>
  )
}
