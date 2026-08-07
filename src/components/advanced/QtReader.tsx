'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Download,
  Edit3,
  Loader2,
  Sparkles,
  X,
  Globe,
  Leaf,
  Calendar as CalendarIcon,
  Package,
  BookOpen,
  Sliders,
  Type,
  FileText,
  Check,
  RotateCcw,
  Plus,
  LayoutGrid,
  Maximize2,
  ZoomIn,
  ZoomOut
} from 'lucide-react'
import QtDayCard from './QtDayCard'
import QtPdfLayout, { type LayoutSettings } from './QtPdfLayout'
import { parseDays } from '@/lib/qtDayParser'
import { getTemplate, QT_TEMPLATES } from '@/lib/qtTemplates'
import { generateQtPdf } from '@/lib/qtPdfGen'
import { PAGE_SIZES } from '@/lib/qtPdfSizes'
import { getFormattedDateList, getFormattedDateListWeekdays, getWeekdayDateLabels, getWeekdayCountInMonth } from '@/lib/qtDates'
import type { QTFormData } from './QtGenerator'
import { saveWeeklyToMonthly, getMonthlyWeeks, clearMonthlyWeeks, getMonthlyWeekCount, combineMonthlyManuscript, combineMonthlyUserMemos, combineMonthlyCalendarStrip } from '@/lib/monthlyQtStorage'

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
  templateId?: string
  startPassage?: string
  endPassage?: string
  selectedInfo?: QtSelectedInfo
  daySectionTitles?: Record<number, string[]>
  monthCalendarStrip?: { month: string; daysInMonth: number; activeDays: number[]; dayHasContent: boolean[] }
  initialIncludeDiaryPage?: boolean
  onBack: () => void
}

export default function QtReader({ form, accumulatedManuscript, templateId: initialTemplateId, startPassage, endPassage, selectedInfo, daySectionTitles, monthCalendarStrip: externalStrip, initialIncludeDiaryPage, onBack }: QtReaderProps) {
  const generationKey = form.audience || 'default'

  // ★ 주간 vs 월간 큐티 판별: externalStrip이 있거나 parsedDays > 7이면 월간
  const { days: _parsedDaysForDetect } = useMemo(() => parseDays(accumulatedManuscript), [accumulatedManuscript])
  const isMonthlyMode = !!externalStrip || _parsedDaysForDetect.length > 7

  const [isPdfFullscreenModalOpen, setIsPdfFullscreenModalOpen] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false) // 미니 달력 피커 모달!
  const [zoomScale, setZoomScale] = useState(1.0)
  const [viewMode, setViewMode] = useState<'cover' | 'day'>('cover')
  const [dayIndex, setDayIndex] = useState(0)
  const [templateId, setTemplateId] = useState(initialTemplateId || 'publication-2a')
  const [sizeOption, setSizeOption] = useState(form.sizeOption || 'A4Landscape')
  const [isEcoPrint, setIsEcoPrint] = useState(false)
  const [isBilingualSideBySide, setIsBilingualSideBySide] = useState(false)
  // ★ 주간 큐티 → 다이어리/플래너 기본 OFF, 월간 큐티 → 기본 ON
  const [includeDiaryPage, setIncludeDiaryPage] = useState(initialIncludeDiaryPage ?? isMonthlyMode)

  useEffect(() => {
    if (initialIncludeDiaryPage !== undefined) {
      setIncludeDiaryPage(initialIncludeDiaryPage)
    }
  }, [initialIncludeDiaryPage])
  const [includeMonthlyPlanner, setIncludeMonthlyPlanner] = useState(isMonthlyMode)
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
  const [editionMode, setEditionMode] = useState<'member' | 'leader'>('member')
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>(() => {
    try {
      const saved = localStorage.getItem(`qt_layout_${form.bibleBook}_w${form.weekNumber}_gen${generationKey}`)
      if (saved) return JSON.parse(saved)
    } catch {}
    return { lineSpacing: '1.5', fontSize: 'medium', fontFamily: 'gothic', margin: 'normal', hiddenSections: ['leaderGuide'] }
  })

  const handleEditionChange = (mode: 'member' | 'leader') => {
    setEditionMode(mode)
    if (mode === 'member') {
      const next = layoutSettings.hiddenSections.includes('leaderGuide')
        ? layoutSettings.hiddenSections
        : [...layoutSettings.hiddenSections, 'leaderGuide']
      setLayoutSettings(prev => ({ ...prev, editionMode: 'member', hiddenSections: next }))
    } else {
      const next = layoutSettings.hiddenSections.filter(s => s !== 'leaderGuide')
      setLayoutSettings(prev => ({ ...prev, editionMode: 'leader', hiddenSections: next }))
    }
  }
  const [editedContent, setEditedContent] = useState<Record<number, Record<string, string>>>(() => {
    try {
      const saved = localStorage.getItem(`qt_edits_${form.bibleBook}_w${form.weekNumber}_gen${generationKey}`)
      if (saved) return JSON.parse(saved)
    } catch {}
    return {}
  })
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
  const modalScrollRef = useRef<HTMLDivElement>(null)

  // 팝업창 모달 스크롤 정확한 위치 이동 헬퍼
  const scrollToTargetKey = (targetKey: string) => {
    if (!modalScrollRef.current) return
    const scrollContainer = modalScrollRef.current

    const cleanKey = targetKey.startsWith('day-') || targetKey.startsWith('week-') || targetKey === 'calendar' || targetKey === 'overview'
      ? targetKey
      : !isNaN(Number(targetKey))
        ? `day-${targetKey}`
        : targetKey

    const dayNumStr = cleanKey.replace('day-', '')

    // 작은 캘린더 스트립 버튼이 아닌, 실제 페이지 컨테이너(.qt-page) 요소만 정밀 타겟팅!
    const targetEl = document.querySelector<HTMLElement>(`.qt-page#qt-page-${cleanKey}`) ||
      document.querySelector<HTMLElement>(`.qt-page[data-page-key="${cleanKey}"]`) ||
      document.querySelector<HTMLElement>(`.qt-page[data-day="${dayNumStr}"]`) ||
      document.querySelector<HTMLElement>(`.qt-page[data-week="${cleanKey.replace('week-', '')}"]`) ||
      document.getElementById(`qt-page-${cleanKey}`)

    if (targetEl) {
      const containerRect = scrollContainer.getBoundingClientRect()
      const targetRect = targetEl.getBoundingClientRect()
      const scale = zoomScale || 1.0
      const relativeTop = (targetRect.top - containerRect.top) / scale + scrollContainer.scrollTop
      scrollContainer.scrollTo({
        top: Math.max(0, relativeTop - 16),
        behavior: 'smooth',
      })
    }
  }

  // PDF 캘린더 스트립 (A4 가로 / iPad Pro 12.9 / Tablet에서만)
  const monthCalendarStrip = useMemo(() => {
    if (externalStrip) return externalStrip
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

    const dayCount = Math.max(days.length, 1)
    // 월간 모드(일수 > 7): 월간 원고의 Day 1은 해당 월의 첫 평일(월 1일 기준)부터 배치되므로
    // (combineMonthlyManuscript / QtPdfLayout 일별 루프와 동일 기준) 달력 스트립도 월 1일부터 평일을 세어야
    // 날짜 클릭 매핑이 어긋나지 않는다. (구버전: form.startDate 기준 → 8/3 시작 시 8/1 포함 원고와 1일 어긋남)
    const isMonthlyAnchor = days.length > 7
    const startDate = new Date(year, monthNum - 1, isMonthlyAnchor ? 1 : day)
    const activeDays: number[] = []

    let added = 0
    let curOffset = 0
    while (added < dayCount && curOffset < 60) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + curOffset)
      if (d.getDay() !== 0) { // 일요일(0) 제외
        if (d.getMonth() === monthNum - 1) {
          activeDays.push(d.getDate())
        }
        added++
      }
      curOffset++
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
  }, [externalStrip, form.startDate, sizeOption, days.length])

  // 현재 보고 있는 day 계산
  const currentActiveDay = useMemo(() => {
    if (!monthCalendarStrip) return null
    return monthCalendarStrip.activeDays[dayIndex] ?? null
  }, [monthCalendarStrip, dayIndex])

  const weekdays = useMemo(() => {
    const dayCount = Math.max(days.length, 1)
    if (externalStrip) {
      const m = externalStrip.month.match(/(\d+)년\s*(\d+)월/)
      if (m) {
        const year = parseInt(m[1]), month = parseInt(m[2])
        const dayNames = ['일', '월', '화', '수', '목', '금', '토']
        return externalStrip.activeDays.map(d => {
          const date = new Date(year, month - 1, d)
          return month + '/' + d + '(' + dayNames[date.getDay()] + ')'
        })
      }
    }
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
    // 월간 모드: 달력 스트립과 동일하게 월 1일 첫 평일부터 라벨 정렬 (헤더 날짜 = 달력 클릭 날짜)
    if (days.length > 7) {
      const monthLabels = getWeekdayDateLabels(form.startDate)
      if (monthLabels.length > 0) return monthLabels.slice(0, dayCount)
    }
    // 월~토(일요일 제외) 일수와 일치하면 주말 제외 모드
    if (dayCount === getWeekdayCountInMonth(form.startDate)) {
      return getWeekdayDateLabels(form.startDate)
    }
    const list = getFormattedDateListWeekdays(form.startDate, dayCount)
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

  const handlePdfDownload = async (withDiary: boolean = true) => {
    setIncludeDiaryPage(withDiary)
    setPdfLoading(true)
    await new Promise(r => setTimeout(r, 400))
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

  const layoutSections = [
    {k:'한눈에',v:'passageOverview'},{k:'천천히',v:'slowReading'},{k:'관찰',v:'observation'},
    {k:'원어',v:'originalWords'},{k:'영단어',v:'englishWords'},{k:'이해',v:'understanding'},
    {k:'복음',v:'gospel'},{k:'비추기',v:'reflection'},{k:'적용',v:'application'},
    {k:'영어말씀',v:'englishVerse'},{k:'공동체',v:'community'},{k:'기도',v:'prayer'},
  ]

  return (
    <div className="flex flex-col min-h-0 flex-1 h-full bg-[#050814] text-slate-100">
      {/* ===== Top Bar ===== */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-[#0a0f24]/90 backdrop-blur-md shrink-0 shadow-lg z-10 w-full gap-4">
        {/* Left: Back Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all border border-white/10 whitespace-nowrap shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
            양식 수정
          </button>
        </div>

        {/* Center: Cover Tab + Dropdown Mini Calendar Picker (No Scroll) */}
        <div className="flex items-center gap-2.5 justify-center flex-1 relative">
          <button
            onClick={() => {
              setViewMode('cover')
              setIsDatePickerOpen(false)
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              viewMode === 'cover'
                ? 'bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 ring-1 ring-white/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            표지 미리보기
          </button>

          <div className="w-px h-4 bg-white/10 mx-0.5 shrink-0" />

          {/* 📅 미니 달력 드롭다운 피커 그룹 */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-2xl border border-white/10 shadow-inner">
            <button
              onClick={() => {
                setViewMode('day')
                setDayIndex(Math.max(0, dayIndex - 1))
              }}
              disabled={viewMode === 'day' && dayIndex === 0}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all disabled:opacity-20 shrink-0"
              title="이전 날짜 큐티"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* 날짜 메인 드롭다운 버튼 */}
            <button
              onClick={() => {
                if (viewMode !== 'day') setViewMode('day')
                setIsDatePickerOpen(!isDatePickerOpen)
              }}
              className={`flex items-center gap-2 px-3.5 py-1 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                viewMode === 'day'
                  ? 'bg-indigo-600/90 text-white border-indigo-400/50 shadow-indigo-600/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-300" />
              <span>{weekdays[dayIndex] || `${dayIndex + 1}일차`}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/15 text-indigo-100 font-mono">
                {dayIndex + 1}/{days.length}일
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDatePickerOpen ? 'rotate-180 text-amber-400' : 'text-slate-400'}`} />
            </button>

            <button
              onClick={() => {
                setViewMode('day')
                setDayIndex(Math.min(days.length - 1, dayIndex + 1))
              }}
              disabled={viewMode === 'day' && dayIndex >= days.length - 1}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all disabled:opacity-20 shrink-0"
              title="다음 날짜 큐티"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 📅 미니 달력 드롭다운 컴팩트 팝업 모달 */}
          {isDatePickerOpen && (
            <div className="absolute top-14 mt-1 left-1/2 -translate-x-1/2 z-50 bg-[#0a0f24]/95 border border-white/15 rounded-2xl shadow-2xl p-3 w-[270px] backdrop-blur-xl animate-in zoom-in-95 duration-150 text-left ring-1 ring-black/50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                  <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>큐티 날짜 이동</span>
                </div>
                <button
                  onClick={() => setIsDatePickerOpen(false)}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  title="닫기"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 컴팩트 4열 그리드 버튼 (1일차, 2일차... 만 깔끔하게 표시) */}
              <div className="grid grid-cols-4 gap-1.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                {days.map((_, idx) => {
                  const isSelected = viewMode === 'day' && dayIndex === idx
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setDayIndex(idx)
                        setViewMode('day')
                        setIsDatePickerOpen(false)
                      }}
                      className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold text-center transition-all ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-md font-extrabold'
                          : 'bg-white/[0.03] hover:bg-white/10 border-white/5 text-slate-300 hover:text-white'
                      }`}
                    >
                      {idx + 1}일차
                    </button>
                  )
                })}
              </div>

              {/* 하단 미니 오버뷰 */}
              <div className="pt-2 mt-2 border-t border-white/10 flex justify-between items-center text-[10px] text-slate-400">
                <button
                  onClick={() => {
                    setDayIndex(0)
                    setViewMode('day')
                    setIsDatePickerOpen(false)
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
                >
                  1일차로 이동
                </button>
                <span>총 {days.length}일치 분량</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Fullscreen PDF Inspector & Download Buttons */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {/* ★ 에디션 모드 선택 토글 (성도용 vs 리더용) */}
          <div className="flex items-center p-0.5 bg-white/10 rounded-xl border border-white/10 text-xs font-bold shrink-0">
            <button
              onClick={() => handleEditionChange('member')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                editionMode === 'member'
                  ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="성도용 교재: 인도자 해설을 제외하고 본문/적용 공간을 여유롭게 확대합니다."
            >
              <span>📖 성도용</span>
            </button>
            <button
              onClick={() => handleEditionChange('leader')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                editionMode === 'leader'
                  ? 'bg-amber-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="리더용 교재: 하단에 인도자 해설(본문 핵심, 나눔 유의점 팁)이 포함됩니다."
            >
              <span>👑 리더용</span>
            </button>
          </div>
          {/* 전체화면 PDF 미리보기 팝업 버튼 */}
          <button
            onClick={() => setIsPdfFullscreenModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-400/30 transition-all shadow-md whitespace-nowrap shrink-0"
            title="모니터 전체 화면 팝업으로 PDF 종이 실물 미리보기"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            🔍 전체화면 PDF 미리보기
          </button>

          {viewMode === 'day' && (
            <button
              onClick={(e) => { e.stopPropagation(); handleDayPdfDownload(dayIndex) }}
              disabled={dayPdfLoading === dayIndex || days.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-200 text-xs font-semibold transition-all border border-white/10 disabled:opacity-30 whitespace-nowrap shrink-0"
              title="현재 일자만 단일 PDF 다운로드"
            >
              {dayPdfLoading === dayIndex
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Download className="w-3.5 h-3.5" />}
              일일 PDF
            </button>
          )}

          {/* 1. 월간 큐티만 저장 버튼 */}
          <button
            onClick={() => handlePdfDownload(false)}
            disabled={pdfLoading || days.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-indigo-500/20 text-slate-300 hover:text-white text-xs font-bold transition-all border border-white/10 disabled:opacity-40 whitespace-nowrap shrink-0"
            title="큐티 강해 본문 + 월간/주간 플래너만 구성된 PDF 저장"
          >
            {pdfLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5 text-indigo-400" />}
            📖 월간 큐티만 저장
          </button>

          {/* 2. 월간 큐티 + 다이어리 저장 버튼 */}
          <button
            onClick={() => handlePdfDownload(true)}
            disabled={pdfLoading || days.length === 0}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 border border-amber-300/30 disabled:opacity-40 whitespace-nowrap shrink-0"
            title="큐티 강해 본문 + 날짜별 수채화 다이어리가 모두 결합된 PDF 저장"
          >
            {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
            📖+📝 월간 큐티 + 다이어리 저장
          </button>
        </div>
      </header>

      {/* ===== Main Body: Smart Canvas Preview ===== */}
      <div className="flex flex-1 min-h-0">
        {/* Left: QT Canvas Preview Area */}
        <div className="flex-1 overflow-y-auto p-6 flex justify-center items-start bg-gradient-to-b from-[#050814] via-[#090e24] to-[#050814]">
          {viewMode === 'cover' ? (
            /* ★ 표지 COVER 전용 단일 실물 미리보기 (창 크기에 100% Fit) */
            <div className="w-full flex flex-col items-center justify-center py-2 min-h-[72vh]">
              <div
                className="rounded-2xl border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 bg-slate-950/60 p-1 flex items-center justify-center max-h-[75vh]"
                style={{
                  width: '100%',
                  maxWidth: sizeOption.includes('Landscape') ? '880px' : '580px',
                }}
              >
                <div className="w-full h-full flex items-center justify-center overflow-hidden scale-[0.85] sm:scale-[0.95] lg:scale-100 origin-center">
                  <QtPdfLayout
                    form={form}
                    result={{ fullManuscript: accumulatedManuscript }}
                    sizeOption={sizeOption}
                    templateId={activeTmpl.id}
                    onlyCover={true}
                    startPassage={startPassage}
                    endPassage={endPassage}
                    selectedInfo={selectedInfo}
                    monthCalendarStrip={monthCalendarStrip}
                    layoutSettings={layoutSettings}
                    includeDiaryPage={includeDiaryPage}
                    includeMonthlyPlanner={includeMonthlyPlanner}
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-3 font-medium">✦ 완벽한 비율로 맞춤 조정된 표지 미리보기입니다.</p>
            </div>
          ) : (
            /* ★ 일자별 큐티 스마트 카드 (DAY CARD) */
            <div className="w-full max-w-5xl mx-auto space-y-6">
              {selectedInfo?.isRecommended && (
                <div className="rounded-2xl border border-indigo-400/30 bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-fuchsia-500/10 p-4 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5 w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 tracking-wider">AI 추천</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200">오늘의 큐티</span>
                      </div>
                      <div className="text-sm font-bold text-slate-100 leading-snug">
                        {selectedInfo.book} <span className="text-indigo-300">{selectedInfo.passage}</span>
                      </div>
                      {selectedInfo.coreMessage && (
                        <div className="text-xs text-slate-300 mt-1 italic">&ldquo;{selectedInfo.coreMessage}&rdquo;</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentDay ? (
                <div
                  className="rounded-2xl p-6 sm:p-8 border mx-auto shadow-[0_12px_40px_rgba(0,0,0,0.2)] transition-all duration-300 flex flex-col"
                  style={{
                    background: activeTmpl.pageBg,
                    color: activeTmpl.textColor,
                    borderColor: activeTmpl.border,
                    width: '100%',
                    maxWidth: sizeOption.includes('Landscape') ? '920px' : '680px',
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
                  className="rounded-2xl p-8 border overflow-y-auto scrollbar-thin"
                  style={{
                    background: activeTmpl.pageBg,
                    color: activeTmpl.textColor,
                    borderColor: activeTmpl.border,
                  }}
                >
                  <div className="text-xs leading-relaxed whitespace-pre-wrap font-mono opacity-80">
                    {accumulatedManuscript || '생성된 내용이 없습니다.'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Modern Sidebar Controls */}
        <aside className="w-[300px] shrink-0 border-l border-white/10 bg-[#080d1e]/95 overflow-y-auto p-4 flex flex-col gap-5 shadow-2xl backdrop-blur-md">
          {/* 1. 디자인 템플릿 쇼룸 */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
                템플릿 테마 ({QT_TEMPLATES.length})
              </div>
              <span className="text-[10px] text-slate-500 font-medium">클릭 시 즉시 반영</span>
            </div>

            {/* 현재 선택된 테마의 실시간 특징 브리핑 바 */}
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-400/25 mb-3 shadow-inner">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  {tmpl.name}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  {tmpl.nameEn}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">{tmpl.description}</p>
            </div>

            {/* 템플릿 테마 카드 리스트 (이름 + 설명 + 실물 색상 칩) */}
            <div className="grid grid-cols-1 gap-2 max-h-[260px] overflow-y-auto p-1 scrollbar-thin">
              {QT_TEMPLATES.map(t => {
                const isSelected = templateId === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setTemplateId(t.id)}
                    className={`flex items-start justify-between p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-400 ring-1 ring-inset ring-indigo-400/40 shadow-md'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/25 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`text-xs font-bold ${isSelected ? 'text-indigo-200' : 'text-slate-200'}`}>
                          {t.name}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-indigo-500 text-white">
                            적용중
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate leading-tight">
                        {t.description}
                      </div>
                    </div>

                    {/* 실물 색상 듀얼 톤 프리뷰 칩 */}
                    <div className="flex items-center gap-1 shrink-0 mt-0.5 p-1 rounded-lg bg-slate-950/60 border border-white/10">
                      <div
                        className="w-3.5 h-5 rounded-sm border border-black/20 shadow-inner"
                        style={{ background: t.pageBg }}
                        title={`종이 배경: ${t.pageBg}`}
                      />
                      <div
                        className="w-3.5 h-5 rounded-sm border border-black/20"
                        style={{ background: t.accent }}
                        title={`포인트 색상: ${t.accent}`}
                      />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="border-t border-white/10" />

          {/* 2. 용지 규격 */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              용지 규격
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(PAGE_SIZES).map(sz => (
                <button
                  key={sz}
                  onClick={() => setSizeOption(sz)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    sizeOption === sz
                      ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200 font-bold shadow-sm'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                  }`}
                >
                  {PAGE_SIZES[sz]?.label?.split(' (')[0] || sz}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10" />

          {/* 3. 옵션 도구 */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              출력 옵션
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setIsBilingualSideBySide(!isBilingualSideBySide)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                  isBilingualSideBySide
                    ? 'bg-blue-600/20 border-blue-400 text-blue-200 font-bold'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                한영대조
              </button>
              {/* ★ 다이어리 & 플래너 옵션: 월간 큐티 모드에서만 표시 */}
              {isMonthlyMode && (
                <>
                  <button
                    onClick={() => setIncludeDiaryPage(!includeDiaryPage)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                      includeDiaryPage
                        ? 'bg-amber-600/20 border-amber-400 text-amber-200 font-bold'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                    }`}
                    title="diary.pdf 21쪽 양식 기반 데일리 다이어리 및 기도제목 포함"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    데일리 다이어리 (Page B)
                  </button>

                  <button
                    onClick={() => setIncludeMonthlyPlanner(!includeMonthlyPlanner)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                      includeMonthlyPlanner
                        ? 'bg-purple-600/20 border-purple-400 text-purple-200 font-bold'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                    }`}
                    title="diary.pdf 18/20쪽 양식 기반 월간달력 및 주간계획 포함"
                  >
                    <CalendarIcon className="w-3.5 h-3.5 text-purple-400" />
                    월간/주간 플래너
                  </button>
                </>
              )}

              <button
                onClick={() => setIsEcoPrint(!isEcoPrint)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                  isEcoPrint
                    ? 'bg-emerald-600/20 border-emerald-400 text-emerald-200 font-bold'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                }`}
              >
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                에코 절약
              </button>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                  isEditing
                    ? 'bg-amber-600/20 border-amber-400 text-amber-200 font-bold'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                실시간 편집
              </button>
            </div>
          </div>

          <div className="border-t border-white/10" />

          {/* 4. 레이아웃 세부 설정 */}
          <details className="group">
            <summary className="text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer select-none flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-indigo-400" />
                폰트 및 디스플레이
              </span>
              <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-3 space-y-3.5 pt-1">
              <div className="flex items-center gap-2 pb-1 border-b border-white/5">
                <span className="text-xs text-slate-400 w-12 shrink-0">에디션</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditionChange('member')}
                    className={`px-2.5 py-0.5 rounded-md text-xs border transition-all ${
                      editionMode === 'member'
                        ? 'bg-indigo-600/40 border-indigo-400 text-indigo-200 font-bold'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                    }`}
                  >📖 성도용 (해설제외)</button>
                  <button
                    onClick={() => handleEditionChange('leader')}
                    className={`px-2.5 py-0.5 rounded-md text-xs border transition-all ${
                      editionMode === 'leader'
                        ? 'bg-amber-600/40 border-amber-400 text-amber-200 font-bold'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                    }`}
                  >👑 리더용 (해설포함)</button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-12 shrink-0">줄간격</span>
                <div className="flex flex-wrap gap-1">
                  {['1.1', '1.2', '1.3', '1.5', '1.8', '2.0'].map(v => (
                    <button key={v} onClick={() => updateLayoutSettings({ lineSpacing: v })}
                      className={`px-2 py-0.5 rounded-md text-xs border transition-all ${
                        layoutSettings.lineSpacing === v
                          ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200 font-bold'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                      }`}>{v}</button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-12 shrink-0">글자크기</span>
                <div className="flex flex-wrap gap-1">
                  {[{k:'더작게',v:'xsmall'},{k:'작게',v:'small'},{k:'보통',v:'medium'},{k:'크게',v:'large'}].map(({k,v}) => (
                    <button key={v} onClick={() => updateLayoutSettings({ fontSize: v })}
                      className={`px-2 py-0.5 rounded-md text-xs border transition-all ${
                        layoutSettings.fontSize === v
                          ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200 font-bold'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                      }`}>{k}</button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-12 shrink-0">서체</span>
                <div className="flex flex-wrap gap-1">
                  {[{k:'고딕',v:'gothic'},{k:'명조',v:'myeongjo'},{k:'SUIT',v:'suit'},{k:'리디바탕',v:'ridi'},{k:'영문',v:'english'}].map(({k,v}) => (
                    <button key={v} onClick={() => updateLayoutSettings({ fontFamily: v })}
                      className={`px-2 py-0.5 rounded-md text-xs border transition-all ${
                        layoutSettings.fontFamily === v
                          ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200 font-bold'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                      }`}>{k}</button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1.5">표시 섹션 숨기기/보이기</span>
                <div className="flex flex-wrap gap-1">
                  {layoutSections.map(({k,v}) => {
                    const isHidden = layoutSettings.hiddenSections.includes(v)
                    return (
                      <button key={v} onClick={() => {
                        const next = isHidden
                          ? layoutSettings.hiddenSections.filter(x => x !== v)
                          : [...layoutSettings.hiddenSections, v]
                        updateLayoutSettings({ hiddenSections: next })
                      }}
                        className={`px-1.5 py-0.5 rounded text-[10px] border transition-all ${
                          isHidden
                            ? 'bg-white/5 border-white/10 text-slate-600 line-through'
                            : 'bg-indigo-600/20 border-indigo-500/30 text-indigo-300 font-semibold'
                        }`}>{k}</button>
                    )
                  })}
                </div>
              </div>
            </div>
          </details>

          <div className="border-t border-white/10" />

          {/* 5. 캘린더 스트립 (달력) */}
          {monthCalendarStrip && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
                {monthCalendarStrip.month}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {['일','월','화','수','목','금','토'].map(dayName => (
                  <div key={dayName} className="text-[10px] text-slate-500 font-bold text-center">{dayName}</div>
                ))}
                {Array.from({ length: new Date(
                  parseInt(form.startDate!.split('-')[0]),
                  parseInt(form.startDate!.split('-')[1]) - 1,
                  1
                ).getDay() }, (_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: monthCalendarStrip.daysInMonth }, (_, i) => {
                  const d = i + 1
                  const isActive = d === currentActiveDay
                  const hasContent = monthCalendarStrip.dayHasContent[i] ?? false
                  const isEmpty = !hasContent
                  const isSunday = form.startDate ? new Date(
                    parseInt(form.startDate.split('-')[0]),
                    parseInt(form.startDate.split('-')[1]) - 1,
                    d
                  ).getDay() === 0 : false

                  return (
                    <button
                      key={d}
                      onClick={() => {
                        if (isEmpty) return
                        const targetIdx = monthCalendarStrip.activeDays.indexOf(d)
                        if (targetIdx >= 0) setDayIndex(targetIdx)
                      }}
                      disabled={isEmpty}
                      title={isSunday ? `${d}일 (일요일 - 주일 설교 노트)` : isEmpty ? `${d}일 (큐티 없음)` : `${d}일 큐티로 이동`}
                      className={`w-full aspect-square rounded-md text-[10px] font-bold border transition-all ${
                        isActive
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                          : isSunday
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-400/50 cursor-not-allowed'
                          : isEmpty
                          ? 'bg-transparent border-white/5 text-slate-700 cursor-not-allowed'
                          : 'bg-white/[0.03] border-white/10 text-slate-300 hover:border-indigo-400/50 hover:text-indigo-200'
                      }`}
                    >
                      {d}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="border-t border-white/10" />

          {/* 6. 월간 QT 자동 통합 패널 */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Package className="w-3.5 h-3.5 text-indigo-400" />
                월간 QT 통합
              </div>
              {monthlyCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {monthlyCount}주 모임
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleMonthlyAdd}
                disabled={days.length === 0}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30"
              >
                <Plus className="w-3.5 h-3.5" />
                주차 추가
              </button>
              {monthlyCount >= 2 && (
                <button
                  onClick={handleMonthlyComplete}
                  disabled={monthlyLoading}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/20 disabled:opacity-40"
                >
                  {monthlyLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BookOpen className="w-3.5 h-3.5" />}
                  월간 완간
                </button>
              )}
              {monthlyCount > 0 && (
                <button
                  onClick={() => { clearMonthlyWeeks(generationKey); setMonthlyCount(0) }}
                  className="p-1.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-white/5 transition-all"
                  title="월간 데이터 초기화"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-white/10" />

          {/* 7. 목회자 개인 묵상 노트 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                묵상 메모
              </div>
              {userMemos[dayIndex] && (
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  저장됨
                </span>
              )}
            </div>
            <textarea
              value={userMemos[dayIndex] || ''}
              onChange={(e) => handleMemoChange(e.target.value)}
              placeholder="개인 묵상 메시지와 메모를 남겨보세요..."
              rows={4}
              className="w-full bg-slate-950/90 border border-white/10 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-all resize-none shadow-inner"
            />
          </div>
        </aside>
      </div>

      {/* Hidden PDF layout for export */}
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
          includeDiaryPage={includeDiaryPage}
          includeMonthlyPlanner={includeMonthlyPlanner}
        />
      </div>

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
            includeDiaryPage={includeDiaryPage}
            includeMonthlyPlanner={includeMonthlyPlanner}
          />
        </div>
      )}

      {/* ★ ===== [전체화면 풀스크린 PDF 실물 미리보기 팝업 모달] ===== */}
      {isPdfFullscreenModalOpen && (
        <div className="fixed inset-0 z-[100] bg-[#030612]/98 backdrop-blur-2xl flex flex-col min-h-screen min-w-full animate-in fade-in duration-200">
          {/* Top Inspector Bar */}
          <header className="flex items-center justify-between px-6 py-3.5 border-b border-white/10 bg-[#060b1e]/90 backdrop-blur-xl shrink-0 shadow-2xl z-30">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 font-extrabold text-xs shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
                <span>전체화면 PDF 실물 뷰어</span>
              </div>
              <span className="text-xs text-slate-300 font-medium hidden md:inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                용지: <strong className="text-white font-bold px-1.5 py-0.5 rounded bg-white/10">{sizeOption}</strong>
                <span className="text-slate-500">|</span>
                테마: <strong className="text-white font-bold px-1.5 py-0.5 rounded bg-white/10">{tmpl.name}</strong>
              </span>
            </div>

            {/* Center: Zoom Controls */}
            <div className="flex items-center gap-1.5 bg-slate-950/90 p-1.5 rounded-2xl border border-white/15 shadow-inner">
              <button
                onClick={() => setZoomScale(s => Math.max(0.4, Number((s - 0.1).toFixed(1))))}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-all hover:scale-105 active:scale-95"
                title="축소"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="text-xs font-mono font-bold px-3 text-indigo-300 min-w-[56px] text-center bg-indigo-500/10 py-1 rounded-lg border border-indigo-500/20">
                {Math.round(zoomScale * 100)}%
              </span>

              <button
                onClick={() => setZoomScale(s => Math.min(2.0, Number((s + 0.1).toFixed(1))))}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-all hover:scale-105 active:scale-95"
                title="확대"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <div className="w-px h-4 bg-white/20 mx-1" />

              <button
                onClick={() => setZoomScale(1.0)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-white/10 text-[11px] font-bold text-slate-300 hover:text-white transition-all active:scale-95"
                title="100% 원본 크기 리셋"
              >
                <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                100%
              </button>
            </div>

            {/* Right: PDF Save & Close */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePdfDownload(false)}
                disabled={pdfLoading || days.length === 0}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-indigo-600/30 text-slate-200 hover:text-white text-xs font-bold transition-all border border-white/15 shadow-md disabled:opacity-40 hover:scale-[1.02] active:scale-95"
              >
                {pdfLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-300" /> : <FileText className="w-3.5 h-3.5 text-indigo-400" />}
                <span>📖 월간 큐티만 PDF</span>
              </button>

              <button
                onClick={() => handlePdfDownload(true)}
                disabled={pdfLoading || days.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-extrabold transition-all shadow-lg shadow-amber-500/25 border border-amber-300/40 disabled:opacity-40 hover:scale-[1.02] active:scale-95"
              >
                {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin text-amber-200" /> : <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />}
                <span>📖+📝 월간 큐티 + 다이어리 PDF</span>
              </button>

              <button
                onClick={() => setIsPdfFullscreenModalOpen(false)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-100 text-xs font-bold transition-all border border-rose-500/20 ml-1 hover:scale-105 active:scale-95"
              >
                <X className="w-4 h-4" />
                <span>닫기</span>
              </button>
            </div>
          </header>

          {/* Modal Main Content (Quick-Jump Sidebar + Scroll Canvas Area) */}
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Quick-Jump Index Sidebar */}
            {days.length >= 7 && (
              <div id="qt-quick-jump-sidebar" className="w-56 bg-[#060a1a] border-r border-white/10 p-4 overflow-y-auto space-y-4 shrink-0 font-sans hidden md:block">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>📑 목차 Quick-Jump</span>
                  <span className="text-[9px] text-indigo-400">{days.length} Days</span>
                </div>

                {/* 1. Monthly Pages */}
                <div className="space-y-1">
                  <button
                    data-nav-target="calendar"
                    onClick={() => scrollToTargetKey('calendar')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-amber-300 border border-white/5 flex items-center justify-between"
                  >
                    <span>📅 P1. 월간 달력</span>
                  </button>
                  <button
                    data-nav-target="overview"
                    onClick={() => scrollToTargetKey('overview')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-amber-300 border border-white/5 flex items-center justify-between"
                  >
                    <span>📊 P2. 월간 개요</span>
                  </button>
                </div>

                {/* 2. Weeks & Daily Pages */}
                <div className="space-y-3 pt-2 border-t border-white/10">
                  {(() => {
                    // monthCalendarStrip가 있으면 실제 달력 일자(activeDays) 사용
                    // 없으면 기존 sequential 방식 (days.length 기반)
                    const calDays = monthCalendarStrip?.activeDays
                    if (calDays && calDays.length > 0) {
                      // 실제 달력 기반: 7일 단위로 주차 분리 (일요일 포함 전체 달력 기준)
                      const totalDaysInMonth = monthCalendarStrip?.daysInMonth || 31
                      const yearMonth = monthCalendarStrip?.month || ''
                      const ym = yearMonth.match(/(\d+)년\s*(\d+)월/)
                      const yr = ym ? parseInt(ym[1], 10) : new Date().getFullYear()
                      const mn = ym ? parseInt(ym[2], 10) : new Date().getMonth() + 1
                      const dayNames = ['일', '월', '화', '수', '목', '금', '토']

                      // 전체 일자를 7일 단위 주차로 분류
                      const weeks: { w: number, label: string, dayEntries: { dayNum: number, isSunday: boolean, dateLabel: string }[] }[] = []
                      let weekIdx = 0
                      for (let d = 1; d <= totalDaysInMonth; d++) {
                        const dt = new Date(yr, mn - 1, d)
                        const isSunday = dt.getDay() === 0
                        if (d === 1 || dt.getDay() === 0 && weeks.length > 0) {
                          // 새 주차 시작: 매 주일마다 또는 1일
                        }
                        if (!weeks[weekIdx]) {
                          weeks[weekIdx] = { w: weekIdx + 1, label: `W${weekIdx + 1}`, dayEntries: [] }
                        }
                        weeks[weekIdx].dayEntries.push({
                          dayNum: d,
                          isSunday,
                          dateLabel: `${d}일(${dayNames[dt.getDay()]})`,
                        })
                        // 토요일이면 다음 주차로
                        if (dt.getDay() === 6 && d < totalDaysInMonth) {
                          weekIdx++
                        }
                      }

                      return weeks.map((wk) => {
                        const firstDay = wk.dayEntries[0]?.dayNum
                        const lastDay = wk.dayEntries[wk.dayEntries.length - 1]?.dayNum
                        return (
                          <div key={wk.w} className="space-y-1">
                            <button
                              data-nav-target={`week-${wk.w}`}
                              onClick={() => scrollToTargetKey(`week-${wk.w}`)}
                              className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/25 flex items-center justify-between"
                            >
                              <span>📆 {wk.label} ({firstDay}~{lastDay}일)</span>
                            </button>
                            <div className="grid grid-cols-4 gap-1 pl-1">
                              {wk.dayEntries.map((entry) => (
                                <button
                                  key={entry.dayNum}
                                  data-nav-target={`day-${entry.dayNum}`}
                                  onClick={() => scrollToTargetKey(`day-${entry.dayNum}`)}
                                  className={`py-1 rounded text-[10px] text-center font-semibold ${
                                    entry.isSunday
                                      ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/40'
                                      : 'bg-white/5 hover:bg-indigo-600 hover:text-white text-slate-300'
                                  }`}
                                >
                                  {entry.dayNum}일
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      })
                    }

                    // 폴백: 기존 sequential 로직 (비-월간 모드)
                    return Array.from({ length: Math.ceil(days.length / 7) }, (_, idx) => {
                      const w = idx + 1
                      const startD = idx * 7 + 1
                      const endD = Math.min(days.length, (idx + 1) * 7)
                      const dayNums = Array.from({ length: endD - startD + 1 }, (_, dIdx) => startD + dIdx)
                      return { w, label: `W${w} (Day ${startD}~${endD})`, dayNums }
                    }).map((weekItem) => (
                      <div key={weekItem.w} className="space-y-1">
                        <button
                          data-nav-target={`week-${weekItem.w}`}
                          onClick={() => scrollToTargetKey(`week-${weekItem.w}`)}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/25 flex items-center justify-between"
                        >
                          <span>📆 {weekItem.label}</span>
                        </button>
                        <div className="grid grid-cols-4 gap-1 pl-1">
                          {weekItem.dayNums.map((d) => (
                            <button
                              key={d}
                              data-nav-target={`day-${d}`}
                              onClick={() => scrollToTargetKey(`day-${d}`)}
                              className="py-1 rounded bg-white/5 hover:bg-indigo-600 hover:text-white text-[10px] text-slate-300 text-center font-semibold"
                            >
                              {d}일
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              </div>
            )}

            {/* Canvas Scroll Area */}
            <div
              ref={modalScrollRef}
              onClick={(e) => {
                const target = e.target as HTMLElement
                const navBtn = target.closest('[data-nav-target]') as HTMLElement | null
                if (!navBtn) return

                const navTarget = navBtn.getAttribute('data-nav-target')
                if (navTarget) {
                  e.preventDefault()
                  e.stopPropagation()
                  scrollToTargetKey(navTarget)
                }
              }}
              className="qt-reader-canvas flex-1 overflow-auto p-8 flex justify-center items-start scrollbar-thin bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0b102b] via-[#040714] to-[#010206]"
            >
              <style>{`
                .qt-reader-canvas .qt-page {
                  border-radius: 4px !important;
                  margin-bottom: 52px !important;
                  box-shadow: 0 25px 70px -15px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.08) !important;
                  transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .qt-reader-canvas .qt-page:hover {
                  box-shadow: 0 30px 80px -10px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(245, 158, 11, 0.25) !important;
                }
              `}</style>
              <div
                className="transition-all duration-200 origin-top my-6 flex flex-col items-center gap-12"
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: 'top center',
                }}
              >
                <QtPdfLayout
                  form={form}
                  result={{ fullManuscript: accumulatedManuscript }}
                  sizeOption={sizeOption}
                  templateId={activeTmpl.id}
                  onlyCover={false}
                  startPassage={startPassage}
                  endPassage={endPassage}
                  userMemos={userMemos}
                  isBilingualSideBySide={isBilingualSideBySide}
                  selectedInfo={selectedInfo}
                  daySectionTitles={daySectionTitles}
                  monthCalendarStrip={monthCalendarStrip}
                  layoutSettings={layoutSettings}
                  editedContent={editedContent}
                  includeDiaryPage={includeDiaryPage}
                  includeMonthlyPlanner={includeMonthlyPlanner}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

