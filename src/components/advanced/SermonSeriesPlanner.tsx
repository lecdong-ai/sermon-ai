'use client'

import { useState } from 'react'
import { Loader2, Sparkles, Download, BookOpen, Cross, ChevronRight, Calendar, Music } from 'lucide-react'

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

const THEMES = [
  { id: 'grace', label: '은혜', icon: '💎', desc: '값없이 주시는 하나님의 선물' },
  { id: 'faith', label: '믿음', icon: '✝️', desc: '의지와 신뢰' },
  { id: 'love', label: '사랑', icon: '❤️', desc: '아가페, 자기희생적 사랑' },
  { id: 'hope', label: '소망', icon: '🌅', desc: '미래를 향한 확신' },
  { id: 'spirit', label: '성령', icon: '🕊️', desc: '내주하시는 하나님' },
  { id: 'repentance', label: '회개', icon: '🙏', desc: '마음의 전환' },
  { id: 'salvation', label: '구원', icon: '🛡️', desc: '죄에서 해방' },
  { id: 'kingdom', label: '하나님 나라', icon: '👑', desc: '통치와 다스리심' },
]

export default function SermonSeriesPlanner() {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [series, setSeries] = useState<SeriesData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async (themeId: string) => {
    setSelectedTheme(themeId)
    setLoading(true)
    setError(null)
    setSeries(null)

    try {
      const themeLabel = THEMES.find(t => t.id === themeId)?.label || themeId
      const res = await fetch('/api/advanced/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: themeLabel }),
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
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">설교 시리즈 플래너</h3>
        </div>
        <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
          주제를 선택하면 AI가 4주 설교 시리즈를 자동 구성합니다.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map(theme => (
            <button
              key={theme.id}
              onClick={() => handleGenerate(theme.id)}
              className="text-left p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-indigo-500/30 transition-all group"
            >
              <span className="text-lg block mb-1">{theme.icon}</span>
              <span className="text-[12px] font-semibold text-slate-300 group-hover:text-white transition-colors">{theme.label}</span>
              <span className="text-[9px] text-slate-600 block mt-0.5">{theme.desc}</span>
            </button>
          ))}
        </div>
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
                <p className="text-[11px] text-indigo-200/80 italic leading-relaxed">"{week.keyVerse}"</p>
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
