'use client'

import { useState, useMemo } from 'react'
import { BarChart3, BookOpen, Calendar, ChevronRight, Church, Cross, Crown, Diamond, Download, Feather, Globe, Heart, Lightbulb, Loader2, Music, Pencil, Pin, Scale, Scroll, Shield, Sparkles, Sprout, Star, Sun, Zap } from 'lucide-react'

interface SeriesWeek {
  weekNumber: number
  title: string
  passage: string
  book: string
  chapter: number
  verseStart: number
  verseEnd: number
  theme: string
  description: string
  keyVerse: string
  application: string
}

interface SeriesData {
  theme: string
  seriesTitle: string
  weeks: SeriesWeek[]
  bibleFlow: string
  suggestedHymns: string[]
}

// 자주 쓰는 주제 아이콘 매핑
const THEME_ICONS: Record<string, any> = {
  '은혜': Diamond, '믿음': Cross, '사랑': Heart, '소망': Sun,
  '성령': Feather, '회개': Lightbulb, '구원': Shield, '하나님 나라': Crown,
  '기도': Sparkles, '십자가': Cross, '부활': Star, '칭의': Scale,
  '성화': Sprout, '교회': Church, '선교': Globe, '말씀': BookOpen,
  '창조': Star, '언약': Scroll, '심판': Zap, '위로': Heart,
}

// AI 추천 주제 (아직 다루지 않은 주요 성경 주제)
const AI_SUGGESTED_TOPICS = [
  { label: '요한계시록', desc: '종말과 새 창조' },
  { label: '시편 묵상', desc: '기도와 찬양' },
  { label: '팔복', desc: '천국 시민의 윤리' },
  { label: '포도나무', desc: '그리스도 안의 거함' },
  { label: '언약', desc: '하나님의 신실하신 약속' },
  { label: '하나님의 속성', desc: '거룩, 사랑, 공의' },
  { label: '제자도', desc: '그리스도를 따르는 삶' },
  { label: '가정과 신앙', desc: '그리스도인의 가정' },
]

export default function SermonSeriesPlanner({ frequentTopics }: { frequentTopics?: { label: string; count: number }[] }) {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [customTheme, setCustomTheme] = useState('')
  const [loading, setLoading] = useState(false)
  const [series, setSeries] = useState<SeriesData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 자주 다룬 주제 (props로 받음)
  const frequentTopicsData = frequentTopics || []

  // 아직 다루지 않은 주제 (AI 추천)
  const uncoveredTopics = useMemo(() => {
    if (frequentTopicsData.length === 0) return AI_SUGGESTED_TOPICS.slice(0, 4)
    const covered = new Set(frequentTopicsData.map(t => t.label))
    return AI_SUGGESTED_TOPICS.filter(t => !covered.has(t.label)).slice(0, 4)
  }, [frequentTopicsData])

  const handleGenerate = async (theme: string) => {
    if (!theme.trim()) return
    setSelectedTheme(theme)
    setLoading(true)
    setError(null)
    setSeries(null)

    try {
      const res = await fetch('/api/advanced/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: theme.trim() }),
      })

      const data = await res.json()
      if (!data.success) throw new Error(data.error || '생성 실패')
      setSeries(data.data)
    } catch (err: any) {
      setError(err.message || '알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (!series) return
    const text = `${series.seriesTitle}\n\n${series.weeks.map(w =>
      `[${w.weekNumber}주차] ${w.title}\n본문: ${w.passage}\n핵심: ${w.keyVerse}\n\n${w.description}\n\n적용: ${w.application}`
    ).join('\n\n─────────────────\n\n')}\n\n📖 성경 흐름: ${series.bibleFlow}\n\n🎵 추천 찬송: ${series.suggestedHymns.join(', ')}`

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${series.seriesTitle.replace(/\s+/g, '_')}_시리즈_계획서.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!selectedTheme) {
    return (
      <div className="p-5 space-y-5">
        {/* 1. 자주 다룬 주제 */}
        {frequentTopicsData.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">자주 다룬 주제</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {frequentTopicsData.map(topic => (
                <button
                  key={topic.label}
                  onClick={() => handleGenerate(topic.label)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-semibold hover:bg-indigo-500/20 transition-colors"
                >
                  {(() => {
                    const Icon = THEME_ICONS[topic.label] || Pin
                    return <Icon className="w-4 h-4 text-amber-300" />
                  })()}
                  <span>{topic.label}</span>
                  <span className="text-[9px] text-indigo-400/60">{topic.count}회</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2. 직접 입력 */}
        <div>
          <div className="flex items-center gap-1.5 mb-2.5">
            <Pencil className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">직접 입력</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customTheme}
              onChange={e => setCustomTheme(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleGenerate(customTheme) }}
              placeholder="예: 십자가, 시편, 요한계시록..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[12px] text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/50 transition-colors"
            />
            <button
              onClick={() => handleGenerate(customTheme)}
              disabled={!customTheme.trim()}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11px] font-bold transition-colors"
            >
              생성
            </button>
          </div>
        </div>

        {/* 3. AI 추천 */}
        {uncoveredTopics.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">AI 추천 · 아직 안 다룬 주제</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {uncoveredTopics.map(topic => (
                <button
                  key={topic.label}
                  onClick={() => handleGenerate(topic.label)}
                  className="text-left p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-amber-500/20 transition-all group"
                >
                  <span className="text-[11px] font-semibold text-slate-300 group-hover:text-white transition-colors">{topic.label}</span>
                  <span className="text-[9px] text-slate-600 block mt-0.5">{topic.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 기본 주제 (자주 다룬 주제가 없을 때 폴백) */}
        {frequentTopicsData.length === 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">주제 선택</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(THEME_ICONS).map(([label, icon]) => (
                <button
                  key={label}
                  onClick={() => handleGenerate(label)}
                  className="text-left p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-indigo-500/20 transition-all group"
                >
                  <span className="text-lg block mb-0.5">{icon}</span>
                  <span className="text-[11px] font-semibold text-slate-300 group-hover:text-white transition-colors">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mb-3" />
        <p className="text-[12px] text-slate-400 font-medium">AI가 시리즈를 구성 중입니다...</p>
        <p className="text-[10px] text-slate-600 mt-1">약 10-15초 소요됩니다</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-[12px] text-red-400 font-medium">{error}</p>
          <button
            onClick={() => handleGenerate(selectedTheme)}
            className="mt-3 text-[11px] text-red-300 hover:text-red-200 underline"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  if (!series) return null

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Cross className="w-3 h-3 text-amber-400/60" />
              <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">4주 시리즈</span>
            </div>
            <h3 className="text-[14px] font-bold text-white">{series.seriesTitle}</h3>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-[10px] font-semibold hover:bg-indigo-500/25 transition-colors"
          >
            <Download className="w-3 h-3" />
            내보내기
          </button>
        </div>
      </div>

      {/* Weeks */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {series.weeks.map((week, i) => (
          <div
            key={week.weekNumber}
            className="rounded-xl bg-white/[0.02] border border-white/[0.05] overflow-hidden"
          >
            {/* Week header */}
            <div className="px-3 py-2.5 bg-gradient-to-r from-indigo-500/10 to-transparent border-b border-white/[0.03]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-indigo-500/20 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-indigo-300">{week.weekNumber}</span>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-white">{week.title}</p>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-2.5 h-2.5 text-amber-400/60" />
                    <span className="text-[10px] text-amber-400/80 font-medium">{week.passage}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Week content */}
            <div className="px-3 py-2.5 space-y-2">
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1">주제</p>
                <p className="text-[11px] text-slate-300">{week.theme}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1">핵심 구절</p>
                <p className="text-[11px] text-indigo-200/80 italic leading-relaxed">&ldquo;{week.keyVerse}&rdquo;</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1">적용</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">{week.application}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Bible Flow */}
        <div className="rounded-xl bg-amber-500/5 border border-amber-500/15 p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Calendar className="w-3 h-3 text-amber-400/60" />
            <span className="text-[9px] font-semibold text-amber-400/80 uppercase tracking-wider">성경 흐름</span>
          </div>
          <p className="text-[11px] text-amber-200/70 leading-relaxed">{series.bibleFlow}</p>
        </div>

        {/* Suggested Hymns */}
        {series.suggestedHymns.length > 0 && (
          <div className="rounded-xl bg-purple-500/5 border border-purple-500/15 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Music className="w-3 h-3 text-purple-400/60" />
              <span className="text-[9px] font-semibold text-purple-400/80 uppercase tracking-wider">추천 찬송</span>
            </div>
            <div className="space-y-1">
              {series.suggestedHymns.map((hymn, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <ChevronRight className="w-2.5 h-2.5 text-purple-400/40" />
                  <span className="text-[11px] text-purple-200/70">{hymn}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reset button */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={() => { setSelectedTheme(null); setSeries(null) }}
          className="w-full text-center text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
        >
          ← 다른 주제 선택
        </button>
      </div>
    </div>
  )
}
