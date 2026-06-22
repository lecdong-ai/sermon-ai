'use client'

import { useState, useCallback } from 'react'
import {
  FileText, BookOpen, Sparkles, Lightbulb, Target,
  Save, Check, Loader2, ChevronDown, ChevronRight,
  Copy
} from 'lucide-react'
import type { AnalysisOutline, OutlineSection, OutlineSubsection } from './types'

interface AnalysisOutlineProps {
  outline: AnalysisOutline
  onSeek: (time: number) => void
  savedInsights: string[]   // stored as "sectionIdx-subsectionIdx-insightIdx"
  onToggleInsight: (key: string) => void
  savingInsight: string | null
}

function formatTime(s: number | null): string {
  if (s === null || s === undefined) return ''
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function SeekLink({ time, onSeek, children }: { time: number | null; onSeek: (t: number) => void; children: React.ReactNode }) {
  if (time === null || time === undefined) return <>{children}</>
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onSeek(time) }}
      className="inline-flex items-center gap-1 text-indigo-400/70 hover:text-indigo-300 transition-colors cursor-pointer"
      title="해당 시점으로 이동"
    >
      {children}
    </button>
  )
}

const BIBLE_BOOKS: Record<string, string> = {
  '창': '창세기', '출': '출애굽기', '레': '레위기', '민': '민수기',
  '신': '신명기', '수': '여호수아', '삿': '사사기', '룻': '룻기',
  '삼상': '사무엘상', '삼하': '사무엘하', '왕상': '열왕기상', '왕하': '열왕기하',
  '대상': '역대상', '대하': '역대하', '스': '에스라', '느': '느헤미야',
  '욥': '욥기', '시': '시편', '잠': '잠언', '전': '전도서',
  '아': '아가', '사': '이사야', '렘': '예레미야', '애': '예레미야애가',
  '겔': '에스겔', '단': '다니엘', '호': '호세아', '암': '아모스',
  '미': '미가', '슥': '스가랴', '말': '말라기',
  '마': '마태복음', '막': '마가복음', '눅': '누가복음', '요': '요한복음',
  '행': '사도행전', '롬': '로마서', '고전': '고린도전서', '고후': '고린도후서',
  '갈': '갈라디아서', '엡': '에베소서', '빌': '빌립보서', '골': '골로새서',
  '살전': '데살로니가전서', '살후': '데살로니가후서', '딤전': '디모데전서',
  '딤후': '디모데후서', '딛': '디도서', '몬': '빌레몬서',
  '히': '히브리서', '약': '야고보서', '벧전': '베드로전서', '벧후': '베드로후서',
  '요일': '요한일서', '요이': '요한이서', '요삼': '요한삼서', '유': '유다서',
  '계': '요한계시록',
}

function expandPassage(passage: string): string {
  const match = passage.match(/^([가-힣]+)\s*(\d+:\d+(?:-\d+)?)$/)
  if (!match) return passage
  const [_, abbr, ref] = match
  const full = BIBLE_BOOKS[abbr]
  return full ? `${full} ${ref}` : passage
}

// ── Subsection ──────────────────────────────

function SubsectionBlock({
  sub, sectionIdx, subIdx, onSeek, savedInsights, onToggleInsight, savingInsight,
}: {
  sub: OutlineSubsection
  sectionIdx: number
  subIdx: number
  onSeek: (t: number) => void
  savedInsights: string[]
  onToggleInsight: (key: string) => void
  savingInsight: string | null
}) {
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
      setTimeout(() => setCopiedText(null), 1500)
    } catch {}
  }, [])

  const hasContent = sub.points.length > 0 || sub.bibleConnections.length > 0 || sub.insights.length > 0
  if (!hasContent) return null

  return (
    <div className="space-y-2">
      {/* Subsection title */}
      <h4 className="flex items-center gap-2 text-sm font-semibold text-white/90">
        <SeekLink time={sub.timeStart} onSeek={onSeek}>
          <span className="text-indigo-400 font-mono text-[11px]">{sub.number}</span>
          <span>{sub.title}</span>
          {sub.timeStart !== null && (
            <span className="text-[10px] text-slate-600 font-mono ml-1">
              {formatTime(sub.timeStart)}
            </span>
          )}
        </SeekLink>
      </h4>

      {/* Points */}
      {sub.points.length > 0 && (
        <div className="space-y-1.5 ml-4">
          {sub.points.map((pt, i) => (
            <div key={i} className="group flex items-start gap-2">
              <span className="mt-[5px] w-1 h-1 rounded-full bg-slate-600 shrink-0" />
              <SeekLink time={pt.time} onSeek={onSeek}>
                <span className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  {pt.text}
                </span>
              </SeekLink>
              {pt.time !== null && (
                <span className="text-[9px] text-slate-700 shrink-0 mt-0.5 font-mono">
                  {formatTime(pt.time)}
                </span>
              )}
              <button
                onClick={() => copy(pt.text)}
                className={`shrink-0 mt-0.5 p-0.5 rounded transition-all ${
                  copiedText === pt.text
                    ? 'text-emerald-400'
                    : 'text-slate-700 opacity-0 group-hover:opacity-100 hover:text-slate-500'
                }`}
              >
                {copiedText === pt.text ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Bible connections */}
      {sub.bibleConnections.length > 0 && (
        <div className="space-y-1.5 ml-4 mt-2">
          {sub.bibleConnections.map((bc, i) => {
            const isSaved = savedInsights.includes(`bc-${sectionIdx}-${subIdx}-${i}`)
            const isSaving = savingInsight === `bc-${sectionIdx}-${subIdx}-${i}`
            return (
              <div key={i} className="group flex items-start gap-2 p-1.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
                <BookOpen className="w-3 h-3 text-amber-400/70 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <SeekLink time={bc.time} onSeek={onSeek}>
                    <span className="text-[11px] font-semibold text-amber-300/90 hover:text-amber-200 transition-colors">
                      {expandPassage(bc.passage)}
                    </span>
                  </SeekLink>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{bc.explanation}</p>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={() => copy(`${bc.passage}: ${bc.explanation}`)}
                    className={`p-0.5 rounded transition-all ${
                      copiedText === bc.passage
                        ? 'text-emerald-400'
                        : 'text-slate-700 opacity-0 group-hover:opacity-100 hover:text-slate-500'
                    }`}
                  >
                    {copiedText === bc.passage ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                  </button>
                  <button
                    onClick={() => onToggleInsight(`bc-${sectionIdx}-${subIdx}-${i}`)}
                    disabled={isSaving}
                    className={`p-0.5 rounded transition-all ${
                      isSaved
                        ? 'text-emerald-400'
                        : 'text-slate-700 opacity-0 group-hover:opacity-100 hover:text-slate-500'
                    }`}
                  >
                    {isSaving ? (
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    ) : isSaved ? (
                      <Check className="w-2.5 h-2.5" />
                    ) : (
                      <Save className="w-2.5 h-2.5" />
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Insights */}
      {sub.insights.length > 0 && (
        <div className="space-y-1.5 ml-4 mt-2">
          {sub.insights.map((ins, i) => {
            const key = `insight-${sectionIdx}-${subIdx}-${i}`
            const isSaved = savedInsights.includes(key)
            const isSaving = savingInsight === key
            return (
              <div key={i} className="group flex items-start gap-2 p-1.5 rounded-lg bg-rose-500/5 border border-rose-500/10">
                <Lightbulb className="w-3 h-3 text-rose-400/70 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <SeekLink time={ins.time} onSeek={onSeek}>
                    <span className="text-[11px] font-semibold text-rose-300/90 hover:text-rose-200 transition-colors">
                      {ins.title}
                    </span>
                  </SeekLink>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{ins.detail}</p>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={() => copy(`${ins.title}: ${ins.detail}`)}
                    className={`p-0.5 rounded transition-all ${
                      copiedText === ins.title
                        ? 'text-emerald-400'
                        : 'text-slate-700 opacity-0 group-hover:opacity-100 hover:text-slate-500'
                    }`}
                  >
                    {copiedText === ins.title ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                  </button>
                  <button
                    onClick={() => onToggleInsight(key)}
                    disabled={isSaving}
                    className={`p-0.5 rounded transition-all ${
                      isSaved
                        ? 'text-emerald-400'
                        : 'text-slate-700 opacity-0 group-hover:opacity-100 hover:text-slate-500'
                    }`}
                  >
                    {isSaving ? (
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    ) : isSaved ? (
                      <Check className="w-2.5 h-2.5" />
                    ) : (
                      <Save className="w-2.5 h-2.5" />
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Section ──────────────────────────────

function SectionBlock({
  section, sectionIdx, onSeek, savedInsights, onToggleInsight, savingInsight,
}: {
  section: OutlineSection
  sectionIdx: number
  onSeek: (t: number) => void
  savedInsights: string[]
  onToggleInsight: (key: string) => void
  savingInsight: string | null
}) {
  const [expanded, setExpanded] = useState(true)

  const hasContent = section.subsections.length > 0 || section.usageSuggestions.length > 0

  return (
    <div className="border border-white/10 rounded-xl bg-white/[0.02] overflow-hidden">
      {/* Section header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          )}
          <SeekLink time={section.timeStart} onSeek={onSeek}>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-indigo-400 font-mono text-xs">{section.number}.</span>
              <span>{section.title}</span>
              {section.timeStart !== null && (
                <span className="text-[10px] text-slate-600 font-mono">
                  {formatTime(section.timeStart)}
                </span>
              )}
            </h3>
          </SeekLink>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {section.subsections.map((sub, i) => (
            <SubsectionBlock
              key={i}
              sub={sub}
              sectionIdx={sectionIdx}
              subIdx={i}
              onSeek={onSeek}
              savedInsights={savedInsights}
              onToggleInsight={onToggleInsight}
              savingInsight={savingInsight}
            />
          ))}

          {/* Usage suggestions */}
          {section.usageSuggestions.length > 0 && (
            <div className="mt-3 p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-3 h-3 text-indigo-400/70" />
                <span className="text-[11px] font-semibold text-indigo-300/80">설교 활용 제안</span>
              </div>
              <div className="space-y-2">
                {section.usageSuggestions.map((sug, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-1 w-1 h-1 rounded-full bg-indigo-400/50 shrink-0" />
                    <div>
                      <p className="text-[11px] font-medium text-white/70">{sug.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{sug.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────

export function AnalysisOutlineView({ outline, onSeek, savedInsights, onToggleInsight, savingInsight }: AnalysisOutlineProps) {
  if (!outline.sections || outline.sections.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        분석 결과가 없습니다.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Overall Summary */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-sky-500/5 to-indigo-500/5 border border-sky-500/15">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-semibold text-sky-300">전체 요약</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed text-left whitespace-pre-line">{outline.overallSummary}</p>
      </div>

      {/* Sections */}
      {outline.sections.map((section, i) => (
        <SectionBlock
          key={i}
          section={section}
          sectionIdx={i}
          onSeek={onSeek}
          savedInsights={savedInsights}
          onToggleInsight={onToggleInsight}
          savingInsight={savingInsight}
        />
      ))}

      {/* Saved insights summary */}
      {savedInsights.length > 0 && (
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-emerald-300">저장한 인사이트 ({savedInsights.length})</h3>
          </div>
          <p className="text-[10px] text-slate-500">
            저장한 인사이트는 노트에 보관됩니다.
          </p>
        </div>
      )}
    </div>
  )
}
