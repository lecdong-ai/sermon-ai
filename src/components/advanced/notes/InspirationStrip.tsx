'use client'

import { useEffect, useState } from 'react'
import { Flame } from 'lucide-react'

interface DailyVerse {
  text: string
  ref: string
}

const DAILY_VERSES: DailyVerse[] = [
  { text: '여호수아가 그 백성 앞에서 이같이 이르되 보라 여호와께서 온 땅을 너희에게 주셨나니', ref: '수 1:2' },
  { text: '너는 마음을 다하고 뜻을 다하여 여호와 네 하나님을 사랑하라', ref: '마 22:37' },
  { text: '내 은혜가 네게 족하도다 이는 내 능력이 약한 데서 온전하여짐이니라', ref: '고후 12:9' },
  { text: '여호와는 나의 목자시니 내게 부족함이 없으리로다', ref: '시 23:1' },
  { text: '항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라', ref: '살전 5:16-18' },
  { text: '너희는 세상의 빛이라 산 위에 있는 동네는 숨겨지지 못할 것이요', ref: '마 5:14' },
  { text: '수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라', ref: '마 11:28' },
]

function pickVerse(): DailyVerse {
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24))
  return DAILY_VERSES[dayIndex % DAILY_VERSES.length]
}

interface InspirationStripProps {
  totalNotes: number
  weeklyCount: number
  streak: number
  lastRecordedAt: string | null
}

export default function InspirationStrip({ totalNotes, weeklyCount, streak, lastRecordedAt }: InspirationStripProps) {
  const [verse, setVerse] = useState<DailyVerse | null>(null)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    setVerse(pickVerse())
    const t = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])

  const lastGap = lastRecordedAt
    ? Math.max(0, Math.floor((now.getTime() - new Date(lastRecordedAt).getTime()) / 60_000))
    : null
  const lastLabel = lastGap == null
    ? '아직 기록 없음'
    : lastGap < 1
      ? '방금 전'
      : lastGap < 60
        ? `${lastGap}분 전`
        : lastGap < 60 * 24
          ? `${Math.floor(lastGap / 60)}시간 전`
          : `${Math.floor(lastGap / (60 * 24))}일 전`

  return (
    <div className="relative shrink-0 border-b border-white/5 bg-[#04060f]/70 backdrop-blur-md">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-indigo-500/5 via-transparent to-emerald-500/5" />
      <div className="relative flex items-center gap-4 px-5 py-2.5">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="relative shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500/30 to-emerald-500/20 border border-white/10 flex items-center justify-center">
              <span className="text-[11px] text-indigo-300">✦</span>
            </div>
            <div className="absolute inset-0 rounded-lg animate-pulse-dot bg-indigo-500/10" />
          </div>
          {verse ? (
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-widest">오늘의 말씀</p>
              <p className="text-xs text-slate-300 truncate font-medium leading-snug">
                <span className="text-slate-100">&ldquo;{verse.text}&rdquo;</span>
                <span className="text-slate-500 ml-1.5">— {verse.ref}</span>
              </p>
            </div>
          ) : (
            <div className="h-3 w-48 rounded bg-white/5 animate-pulse" />
          )}
        </div>

        <div className="flex items-center gap-1 text-[10px] shrink-0">
          <Stat label="전체" value={totalNotes} unit="개" color="text-slate-300" />
          <Divider />
          <Stat label="이번 주" value={weeklyCount} unit="회" color="text-emerald-400" pulse />
          <Divider />
          <Stat label="연속" value={streak} unit="일" color="text-amber-400" icon={Flame} />
          <Divider />
          <div className="text-right min-w-[80px]">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">마지막 통찰</p>
            <p className="text-[11px] text-slate-300 font-bold">{lastLabel}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, unit, color, pulse, icon: Icon }: { label: string; value: number; unit: string; color: string; pulse?: boolean; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="text-right px-1">
      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{label}</p>
      <p className={`text-sm font-bold ${color} flex items-center justify-end gap-0.5`}>
        {Icon && <Icon className="w-3 h-3" />}
        <span className={pulse ? 'tabular-nums' : 'tabular-nums'}>{value}</span>
        <span className="text-[9px] text-slate-500 font-bold">{unit}</span>
      </p>
    </div>
  )
}

function Divider() {
  return <div className="w-px h-6 bg-white/5 mx-1" />
}
