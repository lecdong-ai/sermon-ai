'use client'

import { useState, useMemo, useRef } from 'react'
import { ChevronLeft, ChevronRight, Download, Edit3, Loader2, Sparkles, X } from 'lucide-react'
import QtDayCard from './QtDayCard'
import QtPdfLayout, { type LayoutSettings } from './QtPdfLayout'
import { parseDays } from '@/lib/qtDayParser'
import { getTemplate, QT_TEMPLATES } from '@/lib/qtTemplates'
import { generateQtPdf } from '@/lib/qtPdfGen'
import { PAGE_SIZES } from '@/lib/qtPdfSizes'
import { getFormattedDateList, getWeekdayDateLabels, getWeekdayCountInMonth } from '@/lib/qtDates'
import type { QTFormData } from './QtGenerator'
import { saveWeeklyToMonthly, getMonthlyWeeks, clearMonthlyWeeks, getMonthlyWeekCount, combineMonthlyManuscript, combineMonthlyUserMemos, combineMonthlyCalendarStrip, totalDaysInWeeks } from '@/lib/monthlyQtStorage'

export interface QtSelectedInfo {
  book: string
  passage: string
  reason: string
  coreMessage: string
  isRecommended: boolean
}

interface QtReaderProps {
  form: QTFormData
  accumulatedManuscript: string
  templateId: string
  startPassage?: string
  endPassage?: string
  selectedInfo?: QtSelectedInfo | null
  daySectionTitles?: Record<number, string[]>
  onBack: () => void
}

export default function QtReader({ form, accumulatedManuscript, templateId: initialTemplateId, startPassage, endPassage, selectedInfo, daySectionTitles, onBack }: QtReaderProps) {
  const generationKey = form.audience || 'default'
  const [dayIndex, setDayIndex] = useState(0)
  const [templateId, setTemplateId] = useState(initialTemplateId || 'publication-2a')
  const [sizeOption, setSizeOption] = useState(form.sizeOption || 'A4Landscape')
  const [isEcoPrint, setIsEcoPrint] = useState(false)
  const [isBilingualSideBySide, setIsBilingualSideBySide] = useState(false)
  const [userMemos, setUserMemos] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem(`qt_memos_${form.bibleBook}_w${form.weekNumber}_gen${generationKey}`)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })
  const [pdfLoading, setPdfLoading] = useState(false)
  const [dayPdfLoading, setDayPdfLoading] = useState<number | null>(null)
  const [monthlyLoading, setMonthlyLoading] = useState(false)
  const [monthlyCount, setMonthlyCount] = useState(getMonthlyWeekCount(generationKey))
  const [monthlyData, setMonthlyData] = useState<{
    manuscript: string
    memos: Record<number, string>
    strip: { month: string; daysInMonth: number; activeDays: number[]; dayHasContent: boolean[] } | undefined
  } | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>(() => {
    try {
      const saved = localStorage.getItem(`qt_layout_${form.bibleBook}_w${form.weekNumber}_gen${generationKey}`)
      if (saved) return JSON.parse(saved)
    } catch {}
    return { lineSpacing: '1.5', fontSize: 'medium', fontFamily: 'gothic', margin: 'normal', hiddenSections: [] }
  })
  const [editedContent, setEditedContent] = useState<Record<number, Record<string, string>>>(() => {
    try {
      const saved = localStorage.getItem(`qt_edits_${form.bibleBook}_w${form.weekNumber}_gen${generationKey}`)
      if (saved) return JSON.parse(saved)
    } catch {}
    return {}
  })
  const [showLayoutSettings, setShowLayoutSettings] = useState(false)
  const pdfLayoutRef = useRef<HTMLDivElement>(null)
  const monthlyPdfLayoutRef = useRef<HTMLDivElement>(null)

  const updateLayoutSettings = (updates: Partial<LayoutSettings>) => {
    setLayoutSettings(prev => {
      const next = { ...prev, ...updates }
      try { localStorage.setItem(`qt_layout_${form.bibleBook}_w${form.weekNumber}_gen${generationKey}`, JSON.stringify(next)) } catch {}
      return next
    })
  }

  const handleSectionEdit = (dayIdx: number, sectionKey: string, value: string) => {
    setEditedContent(prev => {
      const next = { ...prev }
      if (!next[dayIdx]) next[dayIdx] = {}
      next[dayIdx] = { ...next[dayIdx], [sectionKey]: value }
      try { localStorage.setItem(`qt_edits_${form.bibleBook}_w${form.weekNumber}_gen${generationKey}`, JSON.stringify(next)) } catch {}
      return next
    })
  }

  const { days } = useMemo(() => parseDays(accumulatedManuscript), [accumulatedManuscript])

  // PDF 캘린더 스트립 (A4 가로 / iPad Pro 12.9 / Tablet에서만)
  const monthCalendarStrip = useMemo(() => {
    if (!form.startDate) return undefined
    const allowedSizes = new Set(['A4Landscape', 'A4Portrait', 'iPad Pro 12.9', 'iPad Pro 12.9 Landscape', 'Tablet (iPad 4:3)'])
    if (!allowedSizes.has(sizeOption)) return undefined
    const parts = form.startDate.split('-')
    if (parts.length !== 3) return undefined
    const year = parseInt(parts[0], 10)
    const monthNum = parseInt(parts[1], 10)
    const day = parseInt(parts[2], 10)
    if (isNaN(year) || isNaN(monthNum) || isNaN(day)) return undefined
    const daysInMonth = new Date(year, monthNum, 0).getDate()

    // ★ 주간 6일(일요일 제외)의 각 day 계산
    const startDate = new Date(year, monthNum - 1, day)
    const activeDays: number[] = []
    for (let i = 0; i < 6; i++) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + i)
      if (d.getDay() !== 0) activeDays.push(d.getDate())
    }

    // 각 day에 큐티 데이터가 있는지
    const dayHasContent: boolean[] = Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1
      return activeDays.includes(dayNum)
    })

    return {
      month: `${year}년 ${monthNum}월`,
      daysInMonth,
      activeDays,
      dayHasContent,
    }
  }, [form.startDate, sizeOption])

  // 현재 보고 있는 day 계산
  const currentActiveDay = useMemo(() => {
    if (!monthCalendarStrip) return null
    return monthCalendarStrip.activeDays[dayIndex] ?? null
  }, [monthCalendarStrip, dayIndex])

  const weekdays = useMemo(() => {
    const dayCount = Math.max(days.length, 1)
    // AI 추천 일일 큐티: 오늘 날짜 단일 표시
    if (selectedInfo?.isRecommended) {
      const today = new Date()
      const dayNames = ['일', '월', '화', '수', '목', '금', '토']
      return [`${today.getMonth() + 1}/${today.getDate()}(${dayNames[today.getDay()]})`]
    }
    if (!form.startDate) {
      // 폴백: 오늘 기준 이번주 월요일부터 6일
      const today = new Date()
      const dayNames = ['일', '월', '화', '수', '목', '금', '토']
      const mon = new Date(today); mon.setDate(mon.getDate() - mon.getDay() + 1)
      return Array.from({ length: Math.max(dayCount, 6) }, (_, i) => {
        const d = new Date(mon); d.setDate(mon.getDate() + i)
        return `${d.getMonth() + 1}/${d.getDate()}(${dayNames[d.getDay()]})`
      })
    }
    // 월~토(일요일 제외) 일수와 일치하면 주말 제외 모드
    if (dayCount === getWeekdayCountInMonth(form.startDate)) {
      return getWeekdayDateLabels(form.startDate)
    }
    const list = getFormattedDateList(form.startDate, dayCount)
    if (list.length > 0) return list
    return []
  }, [form.startDate, days.length, selectedInfo?.isRecommended])

  const tmpl = useMemo(() => getTemplate(templateId), [templateId])

  const activeTmpl = useMemo(() => {
    if (isEcoPrint) {
      return {
        ...tmpl,
        pageBg: '#ffffff',
        textColor: '#000000',
        textMuted: '#4b5563',
        accent: '#000000',
        accentLight: '#f3f4f6',
        border: '#9ca3af',
        borderLight: '#e5e7eb',
        coverAccentLine: '#000000',
        sectionLabelBorder: '#6b7280',
        bibleQuoteBg: '#ffffff',
        bibleQuoteBorder: '#000000',
        bibleQuoteText: '#000000',
        prayerBoxBg: '#ffffff',
        prayerBoxText: '#000000',
        progressDotBg: '#e5e7eb',
        progressDotBorder: '#9ca3af',
        progressDotActiveBg: '#000000',
        pageNumberColor: '#6b7280',
        coverSubtitleColor: '#000000',
      }
    }
    return tmpl
  }, [tmpl, isEcoPrint])

  const currentDay = days[dayIndex]

  const handleMemoChange = (val: string) => {
    const next = { ...userMemos, [dayIndex]: val }
    setUserMemos(next)
    try {
      localStorage.setItem(`qt_memos_${form.bibleBook}_w${form.weekNumber}_gen${generationKey}`, JSON.stringify(next))
    } catch (e) {
      console.error(e)
    }
  }

  const handlePdfDownload = async () => {
    setPdfLoading(true)
    // DOM이 완전히 렌더링될 시간 확보
    await new Promise(r => setTimeout(r, 500))
    try {
      if (pdfLayoutRef.current) {
        const result = { fullManuscript: accumulatedManuscript }
        await generateQtPdf(pdfLayoutRef.current, form, result, sizeOption, activeTmpl.id, undefined, monthCalendarStrip || undefined)
      } else {
        console.error('PDF layout ref is null')
      }
    } catch (e: any) {
      console.error('PDF generation error:', e)
      alert(`PDF 생성 중 오류가 발생했습니다: ${e.message || '알 수 없는 오류'}`)
    }
    setPdfLoading(false)
  }

  const handleDayPdfDownload = async (dayIdx: number) => {
    setDayPdfLoading(dayIdx)
    await new Promise(r => setTimeout(r, 500))
    try {
      if (pdfLayoutRef.current) {
        const result = { fullManuscript: accumulatedManuscript }
        await generateQtPdf(pdfLayoutRef.current, form, result, sizeOption, activeTmpl.id, dayIdx)
      }
    } catch (e: any) {
      console.error('Day PDF generation error:', e)
      alert(`PDF 생성 중 오류가 발생했습니다: ${e.message || '알 수 없는 오류'}`)
    }
    setDayPdfLoading(null)
  }

  const handleMonthlyAdd = () => {
    saveWeeklyToMonthly({
      accumulatedManuscript,
      form,
      userMemos,
      startPassage,
      endPassage,
      daySectionTitles,
    }, generationKey)
    setMonthlyCount(getMonthlyWeekCount(generationKey))
  }

  const handleMonthlyComplete = async () => {
    const weeks = getMonthlyWeeks(generationKey)
    if (weeks.length < 2) {
      alert('최소 2주 이상의 데이터가 필요합니다.')
      return
    }
    setMonthlyLoading(true)
    const combinedManuscript = combineMonthlyManuscript(weeks)
    const combinedMemos = combineMonthlyUserMemos(weeks)
    const combinedStrip = combineMonthlyCalendarStrip(weeks)
    setMonthlyData({ manuscript: combinedManuscript, memos: combinedMemos, strip: combinedStrip })
    await new Promise(r => setTimeout(r, 800))
    try {
      if (monthlyPdfLayoutRef.current) {
        const combinedForm = { ...weeks[0].form }
        const result = { fullManuscript: combinedManuscript, daySectionTitles: undefined }
        await generateQtPdf(monthlyPdfLayoutRef.current, combinedForm, result, sizeOption, activeTmpl.id, undefined, combinedStrip || undefined)
      }
      clearMonthlyWeeks(generationKey)
      setMonthlyCount(0)
      setMonthlyData(null)
    } catch (e: any) {
      console.error('Monthly PDF generation error:', e)
      alert(`월간 PDF 생성 중 오류가 발생했습니다: ${e.message || '알 수 없는 오류'}`)
    }
    setMonthlyLoading(false)
  }

return (
    <div className="flex flex-col min-h-0 flex-1 h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#060a17] shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[11px] font-bold transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            편집
          </button>
          <div className="w-px h-5 bg-white/10" />
          <div className="flex items-center gap-1.5">
            {QT_TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => setTemplateId(t.id)}
                className={`w-7 h-7 rounded-lg border transition-all ${
                  templateId === t.id
                    ? 'border-indigo-400/60 ring-1 ring-indigo-400/30 scale-110'
                    : 'border-white/10 hover:border-white/30'
                }`}
                style={{ background: t.pageBg }}
                title={t.name}
              >
                <span className="flex items-center justify-center text-[8px] font-bold" style={{ color: t.textColor }}>
                  {templateId === t.id ? '✓' : ''}
                </span>
              </button>
            ))}
          </div>
          <div className="w-px h-5 bg-white/10" />
          <div className="flex items-center gap-1">
            {Object.keys(PAGE_SIZES).map(sz => (
              <button
                key={sz}
                onClick={() => setSizeOption(sz)}
                className={`px-2 py-1 rounded-md text-[9px] font-bold border transition-all ${
                  sizeOption === sz
                    ? 'bg-indigo-600/30 border-indigo-400/50 text-indigo-200'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {PAGE_SIZES[sz]?.label?.split(' (')[0] || sz}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* 한영 2단 대조 토글 */}
          <button
            onClick={() => setIsBilingualSideBySide(!isBilingualSideBySide)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
              isBilingualSideBySide
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="한국어/영어 본문을 좌우 2단으로 대조하여 표시합니다."
          >
            🌐 한영대조
          </button>

          {/* 에코 모드 스위치 */}
          <button
            onClick={() => setIsEcoPrint(!isEcoPrint)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
              isEcoPrint
                ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="잉크 절약을 위해 배경색을 화이트로 출력합니다."
          >
            🌱 에코
          </button>
          {/* 편집 모드 토글 */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
              isEditing
                ? 'bg-amber-600/20 border-amber-500/50 text-amber-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="각 섹션의 내용을 직접 수정합니다. PDF에도 수정된 내용이 반영됩니다."
          >
            ✏️ 편집
          </button>
          {/* 레이아웃 설정 */}
          <button
            onClick={() => setShowLayoutSettings(!showLayoutSettings)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
              showLayoutSettings
                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="글자 크기, 줄간격, 폰트, 여백, 섹션 표시 설정"
          >
            ⚙️ 레이아웃
          </button>
          <span className="text-[11px] text-slate-500 font-medium">
            {selectedInfo?.isRecommended ? '✨ AI 추천 일일 큐티' : `${form.bibleBook} · ${form.weekNumber}주차`}
          </span>
          {/* 월간 PDF */}
          <div className="flex items-center gap-1.5">
            {monthlyCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {monthlyCount}주
              </span>
            )}
            <button
              onClick={handleMonthlyAdd}
              disabled={days.length === 0}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30"
              title="이번 주 QT를 월간 PDF에 추가합니다"
            >
              📅 월간 추가
            </button>
            {monthlyCount >= 2 && (
              <button
                onClick={handleMonthlyComplete}
                disabled={monthlyLoading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold transition-all disabled:opacity-40"
              >
                {monthlyLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '📖 월간 PDF 완성'}
              </button>
            )}
            {monthlyCount > 0 && (
              <button
                onClick={() => { clearMonthlyWeeks(generationKey); setMonthlyCount(0) }}
                className="px-2 py-1.5 rounded-lg text-[10px] font-bold text-slate-500 hover:text-red-400 transition-all"
                title="초기화"
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={handlePdfDownload}
            disabled={pdfLoading || days.length === 0}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-all disabled:opacity-40"
          >
            {pdfLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {pdfLoading ? 'PDF 생성 중...' : 'PDF 다운로드'}
          </button>
        </div>
      </div>

      {/* 레이아웃 설정 드로어 */}
      {showLayoutSettings && (
        <div className="border-b border-white/5 bg-[#0a0e1a] px-6 py-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[11px]">
            {/* 줄간격 */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">줄간격</span>
              {['1.3', '1.5', '1.8', '2.0'].map(v => (
                <button key={v} onClick={() => updateLayoutSettings({ lineSpacing: v })}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-all ${
                    layoutSettings.lineSpacing === v
                      ? 'bg-indigo-600/30 border-indigo-400/50 text-indigo-200'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}>{v}</button>
              ))}
            </div>
            {/* 글자크기 */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">글자크기</span>
              {[{k:'작게',v:'small'},{k:'보통',v:'medium'},{k:'크게',v:'large'}].map(({k,v}) => (
                <button key={v} onClick={() => updateLayoutSettings({ fontSize: v })}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-all ${
                    layoutSettings.fontSize === v
                      ? 'bg-indigo-600/30 border-indigo-400/50 text-indigo-200'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}>{k}</button>
              ))}
            </div>
            {/* 폰트 */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">폰트</span>
              {[{k:'고딕',v:'gothic'},{k:'명조',v:'myeongjo'},{k:'영문',v:'english'}].map(({k,v}) => (
                <button key={v} onClick={() => updateLayoutSettings({ fontFamily: v })}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-all ${
                    layoutSettings.fontFamily === v
                      ? 'bg-indigo-600/30 border-indigo-400/50 text-indigo-200'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}>{k}</button>
              ))}
            </div>
            {/* 여백 */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">여백</span>
              {[{k:'좁게',v:'narrow'},{k:'보통',v:'normal'},{k:'넓게',v:'wide'}].map(({k,v}) => (
                <button key={v} onClick={() => updateLayoutSettings({ margin: v })}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-all ${
                    layoutSettings.margin === v
                      ? 'bg-indigo-600/30 border-indigo-400/50 text-indigo-200'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}>{k}</button>
              ))}
            </div>
            {/* 섹션 표시 */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 font-medium">섹션</span>
              {[
                {k:'한눈에',v:'passageOverview'},{k:'천천히',v:'slowReading'},{k:'관찰',v:'observation'},
                {k:'원어',v:'originalWords'},{k:'영단어',v:'englishWords'},{k:'이해',v:'understanding'},
                {k:'복음',v:'gospel'},{k:'비추기',v:'reflection'},{k:'적용',v:'application'},
                {k:'영어말씀',v:'englishVerse'},{k:'공동체',v:'community'},{k:'기도',v:'prayer'},
              ].map(({k,v}) => {
                const isHidden = layoutSettings.hiddenSections.includes(v)
                return (
                  <button key={v} onClick={() => {
                    const next = isHidden
                      ? layoutSettings.hiddenSections.filter(x => x !== v)
                      : [...layoutSettings.hiddenSections, v]
                    updateLayoutSettings({ hiddenSections: next })
                  }}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all ${
                      isHidden
                        ? 'bg-white/5 border-white/10 text-slate-600 line-through'
                        : 'bg-indigo-600/20 border-indigo-500/30 text-indigo-300'
                    }`}>{k}</button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* 인터랙티브 캘린더 스트립 (웹 전용) */}
      {monthCalendarStrip && (
        <div className="sticky top-0 z-10 flex items-center gap-2 px-6 py-2.5 bg-[#0d1121]/95 backdrop-blur-sm border-b border-white/5">
          <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap tracking-wide">
            ◆ {monthCalendarStrip.month}
          </span>
          <div className="flex items-center gap-1 overflow-x-auto flex-1 scrollbar-thin">
            {Array.from({ length: monthCalendarStrip.daysInMonth }, (_, i) => {
              const d = i + 1
              const isActive = d === currentActiveDay
              const hasContent = monthCalendarStrip.dayHasContent[i] ?? false
              const isEmpty = !hasContent
              return (
                <button
                  key={d}
                  onClick={() => {
                    if (isEmpty) return
                    const targetIdx = monthCalendarStrip.activeDays.indexOf(d)
                    if (targetIdx >= 0) {
                      setDayIndex(targetIdx)
                    }
                  }}
                  disabled={isEmpty}
                  className={`shrink-0 w-7 h-8 rounded-md text-[11px] font-bold border transition-all ${
                    isActive
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_8px_rgba(99,102,241,0.3)]'
                      : isEmpty
                      ? 'bg-transparent border-white/5 text-slate-700 cursor-not-allowed'
                      : 'bg-white/[0.02] border-white/10 text-slate-300 hover:border-indigo-400/50 hover:text-indigo-300'
                  }`}
                >
                  {d}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Day content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* AI 추천 정보 배너 (추천 일일 큐티일 때만 표시) */}
          {selectedInfo?.isRecommended && (
            <div className="mb-5 rounded-2xl border border-indigo-400/30 bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-fuchsia-500/10 p-4 shadow-[0_4px_24px_rgba(99,102,241,0.12)]">
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5 w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-4.5 h-4.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 tracking-wider">
                      AI 추천
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200">
                      오늘의 큐티
                    </span>
                  </div>
                  <div className="text-[14px] font-bold text-slate-100 leading-snug">
                    {selectedInfo.book} <span className="text-indigo-300">{selectedInfo.passage}</span>
                  </div>
                  {selectedInfo.coreMessage && (
                    <div className="text-[12px] text-slate-300 mt-1 italic">
                      &ldquo;{selectedInfo.coreMessage}&rdquo;
                    </div>
                  )}
                  {selectedInfo.reason && (
                    <details className="mt-2">
                      <summary className="text-[10px] text-slate-500 cursor-pointer hover:text-slate-300 select-none">
                        선정 이유 보기
                      </summary>
                      <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                        {selectedInfo.reason}
                      </p>
                    </details>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setDayIndex(Math.max(0, dayIndex - 1))}
              disabled={dayIndex === 0}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="text-[13px] font-bold text-slate-200">DAY {dayIndex + 1}</div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDayPdfDownload(dayIndex) }}
                  disabled={dayPdfLoading === dayIndex || days.length === 0}
                  className="p-1 rounded bg-white/5 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-300 transition-all disabled:opacity-30"
                  title="이 Day만 PDF 저장"
                >
                  {dayPdfLoading === dayIndex
                    ? <Loader2 className="w-3 h-3 animate-spin" />
                    : <Download className="w-3 h-3" />}
                </button>
              </div>
              <div className="text-[10px] text-slate-500">{weekdays[dayIndex] || ''}</div>
              <div className="flex items-center justify-center gap-1.5 mt-3">
                {days.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setDayIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === dayIndex
                        ? 'bg-indigo-400 ring-2 ring-indigo-400/30 scale-125'
                        : 'bg-white/10 hover:bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={() => setDayIndex(Math.min(days.length - 1, dayIndex + 1))}
              disabled={dayIndex >= days.length - 1}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day card */}
          {currentDay ? (
            <div
              className="rounded-2xl p-8 border mx-auto shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all duration-300 flex flex-col"
              style={{
                background: activeTmpl.pageBg,
                color: activeTmpl.textColor,
                borderColor: activeTmpl.border,
                width: '100%',
                maxWidth: sizeOption === 'A4Portrait' ? '540px' : sizeOption === 'A4Landscape' ? '760px' : sizeOption === 'B5' ? '460px' : sizeOption === 'A5' ? '380px' : sizeOption === 'Tablet (iPad 4:3)' ? '500px' : '520px',
                aspectRatio: `${PAGE_SIZES[sizeOption].widthMm} / ${PAGE_SIZES[sizeOption].heightMm}`,
                height: 'auto',
                minHeight: '600px',
              }}
            >
              <div className="flex-1 overflow-y-auto scrollbar-thin pr-1">
                <QtDayCard
                  day={currentDay}
                  dayNumber={dayIndex + 1}
                  dateLabel={weekdays[dayIndex] || ''}
                  variant="pdf"
                  template={activeTmpl}
                  isBilingualSideBySide={isBilingualSideBySide}
                  editMode={isEditing}
                  edits={editedContent[dayIndex] || {}}
                  onSectionEdit={(sectionKey, value) => handleSectionEdit(dayIndex, sectionKey, value)}
                  hiddenSections={layoutSettings.hiddenSections}
                />
              </div>
            </div>
          ) : (
            <div
              className="rounded-2xl p-8 border max-h-[75vh] overflow-y-auto scrollbar-thin"
              style={{
                background: activeTmpl.pageBg,
                color: activeTmpl.textColor,
                borderColor: activeTmpl.border,
              }}
            >
              <div className="text-[12px] leading-relaxed whitespace-pre-wrap font-mono opacity-80">
                {accumulatedManuscript || '생성된 내용이 없습니다.'}
              </div>
            </div>
          )}

          {/* ✍️ 오늘 나의 묵상 노트 입력창 */}
          {currentDay && (
            <div className="mt-6 max-w-xl mx-auto bg-slate-900/50 border border-white/5 rounded-2xl p-4 shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                  ✍️ {weekdays[dayIndex] || ''} 묵상 노트 (기록 시 PDF에 함께 저장됩니다)
                </span>
                {userMemos[dayIndex] && (
                  <span className="text-[9px] text-emerald-400 font-medium animate-pulse">자동 저장됨</span>
                )}
              </div>
              <textarea
                value={userMemos[dayIndex] || ''}
                onChange={(e) => handleMemoChange(e.target.value)}
                placeholder="묵상하면서 깨달은 점이나 개인 적용을 자유롭게 적어보세요. PDF 인쇄 시 한 줄 기록란에 깔끔하게 인쇄됩니다..."
                rows={3}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3 text-[12px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Hidden PDF layout for export — 화면 밖에 렌더링하되 실제 크기로 그려서 html2canvas가 캡처 */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1, opacity: 1 }}>
        <QtPdfLayout
          ref={pdfLayoutRef}
          form={form}
          result={{ fullManuscript: accumulatedManuscript }}
          sizeOption={sizeOption}
          templateId={activeTmpl.id}
          startPassage={startPassage}
          endPassage={endPassage}
          userMemos={userMemos}
          isBilingualSideBySide={isBilingualSideBySide}
          selectedInfo={selectedInfo}
          daySectionTitles={daySectionTitles}
          monthCalendarStrip={monthCalendarStrip}
          layoutSettings={layoutSettings}
          editedContent={editedContent}
        />
      </div>

      {/* Hidden monthly PDF layout — 누적된 주간 데이터로 월간 PDF 생성 */}
      {monthlyData && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1, opacity: 1 }}>
          <QtPdfLayout
            ref={monthlyPdfLayoutRef}
            form={form}
            result={{ fullManuscript: monthlyData.manuscript }}
            sizeOption={sizeOption}
            templateId={activeTmpl.id}
            startPassage={startPassage}
            endPassage={endPassage}
            userMemos={monthlyData.memos}
            isBilingualSideBySide={isBilingualSideBySide}
            selectedInfo={selectedInfo}
            monthCalendarStrip={monthlyData.strip}
            layoutSettings={layoutSettings}
          />
        </div>
      )}
    </div>
  )
}
