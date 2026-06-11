'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ProjectDetail } from '@/lib/advanced/types'
import {
  JOHN_VERSES, JOHN_WORDS, JOHN_COMMENTARIES,
  JOHN_TRANSLATION_NOTES, JOHN_PARALLEL_PASSAGES,
  JOHN_THEMES, JOHN_CONTEXT,
} from '@/lib/advanced/johnStudyData'
import type { JohnWordDetail, JohnCommentary } from '@/lib/advanced/johnStudyData'

interface Props { project: ProjectDetail }

type ViewMode = 'parallel' | 'focused' | 'compare'

export default function BibleStudyTab({ project }: Props) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('parallel')
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null)
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [memoText, setMemoText] = useState('')
  const [memoTags, setMemoTags] = useState<string[]>([])
  const [expandedCommentary, setExpandedCommentary] = useState<number | null>(null)
  const [showTranslations, setShowTranslations] = useState<Record<string, boolean>>({
    greek: true, translit: false, niv: true, esv: true, korean: true,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  const handleWordClick = useCallback((wordId: string) => {
    setSelectedWordId(wordId)
    setSelectedVerse(null)
    setSelectedTheme(null)
  }, [])

  const handleVerseClick = useCallback((verse: number) => {
    setSelectedVerse(verse)
    setSelectedWordId(null)
    setSelectedTheme(null)
  }, [])

  const handleThemeClick = useCallback((theme: string) => {
    setSelectedTheme(theme)
    setSelectedWordId(null)
    setSelectedVerse(null)
  }, [])

  const handleCloseDetail = useCallback(() => {
    setSelectedWordId(null)
    setSelectedVerse(null)
    setSelectedTheme(null)
  }, [])

  const handleSaveMemo = useCallback(() => {
    if (!memoText.trim()) return
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setLastSaved(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }))
    }, 800)
  }, [memoText])

  const handleSendToPrep = useCallback(() => {
    router.push(`/advanced/projects/${project.id}?tab=prep`)
  }, [project.id, router])

  const toggleTranslation = useCallback((key: string) => {
    setShowTranslations(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const toggleMemoTag = useCallback((tag: string) => {
    setMemoTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }, [])

  return (
    <div className="flex gap-0 h-full">
      {/* ─── Main Content ─── */}
      <div className="flex-1 min-w-0 overflow-y-auto scrollbar-thin pr-5">

        {/* Research Toolbar */}
        <ResearchToolbar
          passage="요한복음 1:1-5"
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showTranslations={showTranslations}
          onToggleTranslation={toggleTranslation}
          isSaving={isSaving}
          lastSaved={lastSaved}
          onSendToPrep={handleSendToPrep}
        />

        {/* Context Explorer */}
        <ContextExplorer
          before={JOHN_CONTEXT.before}
          after={JOHN_CONTEXT.after}
          bookStructure={JOHN_CONTEXT.bookStructure}
        />

        {/* Parallel Passage Panel */}
        <ParallelPassagePanel
          verses={JOHN_VERSES}
          words={JOHN_WORDS}
          showTranslations={showTranslations}
          selectedWordId={selectedWordId}
          selectedVerse={selectedVerse}
          onWordClick={handleWordClick}
          onVerseClick={handleVerseClick}
        />

        {/* Translation Difference Card */}
        <TranslationDifferenceCard notes={JOHN_TRANSLATION_NOTES} />

        {/* Commentary Summary */}
        <CommentarySummary
          commentaries={JOHN_COMMENTARIES}
          expandedId={expandedCommentary}
          onToggleExpand={setExpandedCommentary}
          onVerseClick={handleVerseClick}
        />

        {/* Parallel Passages Section */}
        <ParallelPassagesSection passages={JOHN_PARALLEL_PASSAGES} />

        {/* Theme Connections */}
        <ThemeConnections
          themes={JOHN_THEMES}
          selectedTheme={selectedTheme}
          onThemeClick={handleThemeClick}
        />

        {/* Research Notes Editor */}
        <ResearchNotesEditor
          value={memoText}
          onChange={setMemoText}
          tags={memoTags}
          onToggleTag={toggleMemoTag}
          onSave={handleSaveMemo}
          isSaving={isSaving}
          lastSaved={lastSaved}
        />

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>

      {/* ─── Right Panel ─── */}
      <div className="w-80 shrink-0 border-l border-paper-200 bg-paper-50 overflow-y-auto scrollbar-thin">
        <RightPanel
          words={JOHN_WORDS}
          selectedWordId={selectedWordId}
          selectedVerse={selectedVerse}
          selectedTheme={selectedTheme}
          onCloseDetail={handleCloseDetail}
          onSendToPrep={handleSendToPrep}
          memoText={memoText}
          memoTags={memoTags}
        />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════ */

/* ─── Research Toolbar ─── */

function ResearchToolbar({
  passage, viewMode, onViewModeChange, showTranslations, onToggleTranslation,
  isSaving, lastSaved, onSendToPrep,
}: {
  passage: string
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  showTranslations: Record<string, boolean>
  onToggleTranslation: (key: string) => void
  isSaving: boolean
  lastSaved: string | null
  onSendToPrep: () => void
}) {
  const viewModes: { key: ViewMode; label: string }[] = [
    { key: 'parallel', label: '병렬' },
    { key: 'focused', label: '집중' },
    { key: 'compare', label: '비교' },
  ]

  return (
    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-paper-200 px-5 py-3 mb-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Current Passage */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-paper-400 uppercase tracking-wider">본문</span>
            <span className="text-sm font-bold text-paper-900 font-serif bg-paper-100 px-3 py-1 rounded-lg">
              {passage}
            </span>
          </div>

          {/* View Mode */}
          <div className="flex rounded-md overflow-hidden border border-paper-200">
            {viewModes.map(mode => (
              <button
                key={mode.key}
                onClick={() => onViewModeChange(mode.key)}
                className={`text-[11px] px-3 py-1.5 font-medium transition-colors ${
                  viewMode === mode.key
                    ? 'bg-navy-600 text-white'
                    : 'bg-white text-paper-500 hover:bg-paper-50'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Translation Toggles */}
          <div className="flex items-center gap-1">
            {([
              { key: 'greek', label: '원문' },
              { key: 'translit', label: '음역' },
              { key: 'korean', label: '개역' },
              { key: 'niv', label: 'NIV' },
              { key: 'esv', label: 'ESV' },
            ]).map(t => (
              <button
                key={t.key}
                onClick={() => onToggleTranslation(t.key)}
                className={`text-[10px] px-2 py-1 rounded transition-colors ${
                  showTranslations[t.key]
                    ? 'bg-navy-100 text-navy-700 font-medium'
                    : 'bg-white border border-paper-200 text-paper-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Save Status */}
          <div className="flex items-center gap-1.5 text-[11px]">
            {isSaving ? (
              <span className="text-amber-500">저장 중...</span>
            ) : lastSaved ? (
              <span className="text-green-600">✓ {lastSaved} 저장됨</span>
            ) : (
              <span className="text-paper-400">자동 저장</span>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={onSendToPrep}
            className="text-xs bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-md transition-colors font-medium"
          >
            설교 준비로 →
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Context Explorer ─── */

function ContextExplorer({ before, after, bookStructure }: {
  before: string; after: string; bookStructure: string
}) {
  return (
    <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-4 mb-5">
      <div className="text-[10px] font-semibold text-amber-700 uppercase tracking-widest mb-2">문맥 확장</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-paper-600 leading-relaxed">
        <div>
          <span className="font-medium text-amber-700 block mb-1">앞 문맥</span>
          {before}
        </div>
        <div className="border-x border-amber-200/60 px-4">
          <span className="font-medium text-amber-700 block mb-1">책 구조</span>
          {bookStructure}
        </div>
        <div>
          <span className="font-medium text-amber-700 block mb-1">뒤 문맥</span>
          {after}
        </div>
      </div>
    </div>
  )
}

/* ─── Parallel Passage Panel ─── */

function ParallelPassagePanel({
  verses, words, showTranslations, selectedWordId, selectedVerse,
  onWordClick, onVerseClick,
}: {
  verses: typeof JOHN_VERSES
  words: Record<string, JohnWordDetail>
  showTranslations: Record<string, boolean>
  selectedWordId: string | null
  selectedVerse: number | null
  onWordClick: (id: string) => void
  onVerseClick: (v: number) => void
}) {
  return (
    <div className="bg-white rounded-xl border border-paper-200 mb-5 overflow-hidden">
      <div className="px-5 py-3 border-b border-paper-200 bg-paper-50 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest">병렬 본문</span>
        <span className="text-[10px] text-paper-400">단어를 클릭하면 상세 분석을 볼 수 있습니다</span>
      </div>
      <div className="divide-y divide-paper-150">
        {verses.map(v => (
          <div
            key={v.verse}
            className={`px-5 py-4 transition-colors ${
              selectedVerse === v.verse ? 'bg-green-50/50' : 'hover:bg-paper-50/50'
            }`}
          >
            <div className="flex gap-4">
              <button
                onClick={() => onVerseClick(v.verse)}
                className={`w-8 h-8 rounded-full text-xs font-bold shrink-0 transition-colors ${
                  selectedVerse === v.verse
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'bg-paper-150 text-paper-500 hover:bg-paper-200'
                }`}
              >
                {v.verse}
              </button>
              <div className="flex-1 min-w-0 space-y-2">
                {/* Greek */}
                {showTranslations.greek && (
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] text-paper-400 w-10 shrink-0 mt-1 font-medium">원문</span>
                    <p className="text-sm text-paper-800 leading-relaxed font-greek flex-1">
                      {v.greek.split(' ').map((word, i) => {
                        const matchedEntry = Object.entries(words).find(([_, w]) =>
                          w.lemmaGreek && word.includes(w.lemmaGreek.slice(0, 4))
                        )
                        if (matchedEntry) {
                          return (
                            <button
                              key={i}
                              onClick={() => onWordClick(matchedEntry[0])}
                              className={`hover:text-green-600 transition-colors cursor-pointer border-b border-dotted ${
                                selectedWordId === matchedEntry[0]
                                  ? 'text-green-600 border-green-400 bg-green-50 rounded px-0.5'
                                  : 'border-paper-300 hover:border-green-400'
                              }`}
                              title={matchedEntry[1].basicMeaning}
                            >
                              {word}{' '}
                            </button>
                          )
                        }
                        return <span key={i}>{word} </span>
                      })}
                    </p>
                  </div>
                )}
                {/* Transliteration */}
                {showTranslations.translit && (
                  <p className="text-xs text-paper-400 italic pl-12">{v.translit}</p>
                )}
                {/* Korean */}
                {showTranslations.korean && (
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] text-paper-400 w-10 shrink-0 mt-0.5 font-medium">개역</span>
                    <p className="text-sm text-paper-700 leading-relaxed">{v.korean}</p>
                  </div>
                )}
                {/* NIV */}
                {showTranslations.niv && (
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] text-blue-500 w-10 shrink-0 mt-0.5 font-medium">NIV</span>
                    <p className="text-xs text-paper-500 leading-relaxed">{v.niv}</p>
                  </div>
                )}
                {/* ESV */}
                {showTranslations.esv && (
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] text-amber-600 w-10 shrink-0 mt-0.5 font-medium">ESV</span>
                    <p className="text-xs text-paper-500 leading-relaxed">{v.esv}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Translation Difference Card ─── */

function TranslationDifferenceCard({ notes }: { notes: typeof JOHN_TRANSLATION_NOTES }) {
  return (
    <div className="bg-white rounded-xl border border-paper-200 p-5 mb-5">
      <div className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest mb-3">번역 차이 설명</div>
      <div className="space-y-3">
        {notes.map((n, i) => (
          <div key={i} className="bg-blue-50/50 border border-blue-100/60 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-blue-700">{n.verse}절</span>
              <div className="flex gap-1">
                {n.versions.map(v => (
                  <span key={v} className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-blue-200 text-blue-600 font-medium">
                    {v}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-xs text-paper-600 leading-relaxed">{n.note}</p>
            {n.preachingNote && (
              <div className="mt-2 pt-2 border-t border-blue-100">
                <span className="text-[10px] font-semibold text-amber-700 block mb-0.5">설교 적용 시 참고</span>
                <p className="text-xs text-amber-800 leading-relaxed">{n.preachingNote}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Commentary Summary ─── */

function CommentarySummary({
  commentaries, expandedId, onToggleExpand, onVerseClick,
}: {
  commentaries: typeof JOHN_COMMENTARIES
  expandedId: number | null
  onToggleExpand: (id: number | null) => void
  onVerseClick: (v: number) => void
}) {
  const grouped = commentaries.reduce<Record<number, typeof commentaries>>((acc, c) => {
    if (!acc[c.verse]) acc[c.verse] = []
    acc[c.verse].push(c)
    return acc
  }, {})

  const typeLabel: Record<string, string> = {
    exegetical: '본문',
    theological: '신학',
    historical: '역사',
    pastoral: '목회',
  }
  const typeColor: Record<string, string> = {
    exegetical: 'bg-teal-100 text-teal-700',
    theological: 'bg-gold-100 text-gold-700',
    historical: 'bg-amber-100 text-amber-700',
    pastoral: 'bg-green-100 text-green-700',
  }

  return (
    <div className="bg-white rounded-xl border border-paper-200 p-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest">원문 주석 요약</div>
        <span className="text-[11px] text-paper-400">{commentaries.length}건</span>
      </div>
      <div className="space-y-3">
        {Object.entries(grouped).map(([verse, comms]) => {
          const isExpanded = expandedId === parseInt(verse)
          return (
            <div key={verse}>
              <button
                onClick={() => onToggleExpand(isExpanded ? null : parseInt(verse))}
                className="w-full flex items-center justify-between py-2 text-left group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-paper-150 text-[10px] font-bold flex items-center justify-center text-paper-600 group-hover:bg-green-100 group-hover:text-green-700 transition-colors">
                    {verse}
                  </span>
                  <span className="text-xs font-medium text-paper-600 group-hover:text-green-600 transition-colors">
                    절 주석 ({comms.length}건)
                  </span>
                </div>
                <svg className={`w-4 h-4 text-paper-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Summary (always visible) */}
              <div className="space-y-2 pl-2">
                {comms.slice(0, 1).map((c, i) => (
                  <div key={i} className="text-xs text-paper-600 leading-relaxed pl-3 border-l-2 border-paper-200">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-medium text-paper-700">{c.author}</span>
                      <span className={`text-[9px] px-1 py-0.5 rounded ${typeColor[c.type]}`}>
                        {typeLabel[c.type]}
                      </span>
                    </div>
                    {c.text.length > 120 ? c.text.slice(0, 120) + '...' : c.text}
                  </div>
                ))}
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="mt-2 space-y-2 pl-2 animate-fade-in">
                  {comms.map((c, i) => (
                    <div key={i} className="bg-paper-50 rounded-lg p-3 border border-paper-150">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-xs font-semibold text-paper-700">{c.author}</span>
                        <span className={`text-[9px] px-1 py-0.5 rounded ${typeColor[c.type]}`}>
                          {typeLabel[c.type]}
                        </span>
                      </div>
                      <p className="text-xs text-paper-600 leading-relaxed">{c.text}</p>
                      <p className="text-[10px] text-paper-400 mt-1.5 italic">— {c.source}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Parallel Passages Section ─── */

function ParallelPassagesSection({ passages }: { passages: typeof JOHN_PARALLEL_PASSAGES }) {
  const relationLabel: Record<string, string> = {
    direct_quote: '직접 인용',
    allusion: '암시',
    thematic: '주제적 연결',
    typology: '예표/성취',
  }
  const relationColor: Record<string, string> = {
    direct_quote: 'bg-green-100 text-green-700',
    allusion: 'bg-blue-100 text-blue-700',
    thematic: 'bg-gold-100 text-gold-700',
    typology: 'bg-amber-100 text-amber-700',
  }

  return (
    <div className="bg-white rounded-xl border border-paper-200 p-5 mb-5">
      <div className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest mb-3">평행본문 / 관련 본문</div>
      <div className="space-y-2">
        {passages.map((p, i) => (
          <div key={i} className="flex gap-3 p-3 rounded-lg border border-paper-150 hover:border-green-200 hover:bg-green-50/20 transition-colors cursor-pointer">
            <span className={`text-[10px] px-1.5 py-0.5 rounded h-fit shrink-0 font-medium ${relationColor[p.relation]}`}>
              {relationLabel[p.relation]}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold text-paper-800">{p.ref}</span>
              </div>
              <p className="text-xs text-paper-600 leading-relaxed">{p.text}</p>
              <p className="text-[11px] text-paper-400 mt-1 italic">{p.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Theme Connections ─── */

function ThemeConnections({
  themes, selectedTheme, onThemeClick,
}: {
  themes: typeof JOHN_THEMES
  selectedTheme: string | null
  onThemeClick: (t: string) => void
}) {
  return (
    <div className="bg-white rounded-xl border border-paper-200 p-5 mb-5">
      <div className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest mb-3">주제 사전 연결</div>
      <div className="flex flex-wrap gap-2">
        {themes.map(t => (
          <button
            key={t.name}
            onClick={() => onThemeClick(t.name)}
            className={`text-xs px-4 py-2 rounded-full border transition-colors ${
              selectedTheme === t.name
                ? 'bg-gold-100 border-gold-300 text-gold-700 font-medium'
                : 'bg-white border-paper-200 text-paper-600 hover:border-gold-300 hover:text-gold-700'
            }`}
          >
            {t.name}
            <span className="ml-1 text-[10px] opacity-60">{t.connectedSermons}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── Research Notes Editor ─── */

function ResearchNotesEditor({
  value, onChange, tags, onToggleTag, onSave, isSaving, lastSaved,
}: {
  value: string
  onChange: (v: string) => void
  tags: string[]
  onToggleTag: (t: string) => void
  onSave: () => void
  isSaving: boolean
  lastSaved: string | null
}) {
  const availableTags = ['관찰', '질문', '적용', '통찰', '예화', '핵심']

  return (
    <div className="bg-white rounded-xl border border-paper-200 p-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest">연구 메모</div>
        <div className="flex items-center gap-2 text-[11px]">
          {isSaving ? (
            <span className="text-amber-500">저장 중...</span>
          ) : lastSaved ? (
            <span className="text-green-600">✓ {lastSaved}</span>
          ) : null}
        </div>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="본문을 연구하며 떠오른 통찰, 질문, 적용 아이디어를 기록하세요. 이 메모는 설교 준비 탭으로 전달됩니다."
        className="w-full min-h-[140px] text-sm text-paper-700 bg-paper-50 rounded-lg p-4 border border-paper-200 outline-none resize-y focus:border-green-300 focus:bg-white transition-colors leading-relaxed"
      />
      <div className="flex items-center justify-between mt-2">
        <div className="flex flex-wrap gap-1.5">
          {availableTags.map(tag => (
            <button
              key={tag}
              onClick={() => onToggleTag(tag)}
              className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                tags.includes(tag)
                  ? 'bg-green-100 text-green-700 font-medium'
                  : 'bg-paper-100 text-paper-400 hover:bg-paper-150'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-paper-400">{value.length}자</span>
          <button
            onClick={onSave}
            disabled={!value.trim() || isSaving}
            className="text-xs bg-green-500 hover:bg-green-600 disabled:bg-paper-200 disabled:text-paper-400 text-white px-3 py-1 rounded-md transition-colors font-medium"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Right Panel ─── */

function RightPanel({
  words, selectedWordId, selectedVerse, selectedTheme, onCloseDetail,
  onSendToPrep, memoText, memoTags,
}: {
  words: Record<string, JohnWordDetail>
  selectedWordId: string | null
  selectedVerse: number | null
  selectedTheme: string | null
  onCloseDetail: () => void
  onSendToPrep: () => void
  memoText: string
  memoTags: string[]
}) {
  const typeLabel: Record<string, string> = {
    exegetical: '본문',
    theological: '신학',
    historical: '역사',
    pastoral: '목회',
  }
  const typeColor: Record<string, string> = {
    exegetical: 'bg-teal-100 text-teal-700',
    theological: 'bg-gold-100 text-gold-700',
    historical: 'bg-amber-100 text-amber-700',
    pastoral: 'bg-green-100 text-green-700',
  }

  // Word Detail
  if (selectedWordId && words[selectedWordId]) {
    const word = words[selectedWordId]
    return (
      <div className="p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-paper-200">
          <h3 className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest">원어 단어 분석</h3>
          <button onClick={onCloseDetail} className="text-paper-400 hover:text-paper-600 p-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div className="text-center py-4 bg-paper-100 rounded-lg">
            <p className="text-2xl font-greek text-paper-800">{word.lemmaGreek}</p>
            <p className="text-sm text-paper-500 mt-1">{word.transliteration}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <InfoBox label="Strong" value={word.strong} />
            <InfoBox label="품사" value={word.partOfSpeech} />
            <InfoBox label="발음" value={word.pronunciation} />
            <InfoBox label="형태" value={word.morphology} />
          </div>
          <SectionBox title="기본 의미" className="bg-paper-100">
            {word.basicMeaning}
          </SectionBox>
          <SectionBox title="문맥상 의미" className="bg-green-50 border border-green-100">
            {word.contextualMeaning}
          </SectionBox>
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
            <h4 className="text-[10px] font-semibold text-amber-700 mb-1">쉽게 설명하면</h4>
            <p className="text-xs text-amber-800 leading-relaxed">{word.simpleExplanation}</p>
          </div>
          <SectionBox title="설교적 의미" className="bg-paper-100 border-l-2 border-green-400">
            {word.sermonNote}
          </SectionBox>
          {word.usage.length > 0 && (
            <div>
              <h4 className="text-[10px] font-semibold text-paper-500 uppercase tracking-wider mb-1.5">성경 용례</h4>
              <div className="space-y-1">
                {word.usage.map((u, i) => (
                  <div key={i} className="text-[11px] text-paper-600 bg-paper-100 rounded-lg p-2">
                    <span className="font-medium text-paper-700">{u.ref}: </span>
                    {u.text}
                  </div>
                ))}
              </div>
            </div>
          )}
          {word.relatedWords.length > 0 && (
            <div>
              <h4 className="text-[10px] font-semibold text-paper-500 uppercase tracking-wider mb-1.5">관련 원어</h4>
              <div className="flex flex-wrap gap-1">
                {word.relatedWords.map(r => (
                  <span key={r} className="text-[10px] px-1.5 py-0.5 rounded bg-paper-150 text-paper-600 font-mono">{r}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Verse Commentary
  if (selectedVerse) {
    const verseCommentaries = JOHN_COMMENTARIES.filter(c => c.verse === selectedVerse)
    const verseData = JOHN_VERSES.find(v => v.verse === selectedVerse)
    return (
      <div className="p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-paper-200">
          <h3 className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest">{selectedVerse}절 주석</h3>
          <button onClick={onCloseDetail} className="text-paper-400 hover:text-paper-600 p-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {verseData && (
          <div className="bg-paper-100 rounded-lg p-3 mb-4">
            <p className="text-xs text-paper-600 leading-relaxed">{verseData.korean}</p>
          </div>
        )}
        {verseCommentaries.length > 0 ? (
          <div className="space-y-3">
            {verseCommentaries.map((c, i) => (
              <div key={i} className="bg-white rounded-lg border border-paper-200 p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-xs font-semibold text-paper-700">{c.author}</span>
                  <span className={`text-[9px] px-1 py-0.5 rounded ${typeColor[c.type]}`}>
                    {typeLabel[c.type]}
                  </span>
                </div>
                <p className="text-xs text-paper-600 leading-relaxed">{c.text}</p>
                <p className="text-[10px] text-paper-400 mt-1.5 italic">— {c.source}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-paper-400 text-center py-8">이 절에 대한 주석이 없습니다.</div>
        )}
      </div>
    )
  }

  // Theme Detail
  if (selectedTheme) {
    const themeData = JOHN_THEMES.find(t => t.name === selectedTheme)
    if (themeData) {
      return (
        <div className="p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-paper-200">
            <h3 className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest">주제 연결</h3>
            <button onClick={onCloseDetail} className="text-paper-400 hover:text-paper-600 p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="text-center py-4">
            <span className="inline-block px-4 py-1.5 rounded-full bg-gold-100 text-gold-700 text-sm font-medium">
              {themeData.name}
            </span>
          </div>
          <p className="text-sm text-paper-700 leading-relaxed mb-4">{themeData.description}</p>
          <div className="flex items-center justify-between text-xs text-paper-500 bg-paper-100 rounded-lg p-3">
            <span>연결된 설교</span>
            <span className="font-medium text-paper-700">{themeData.connectedSermons}편</span>
          </div>
          <button className="w-full mt-4 text-xs text-green-600 border border-green-200 rounded-lg py-2 hover:bg-green-50 transition-colors">
            이 주제로 설교 검색 →
          </button>
        </div>
      )
    }
  }

  // Default: Quick Actions + Recent Notes
  return (
    <div className="p-5 space-y-5">
      {/* Quick Actions */}
      <div>
        <h3 className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest mb-3">작업</h3>
        <div className="space-y-1.5">
          <button
            onClick={onSendToPrep}
            className="w-full text-left text-xs text-green-600 hover:bg-green-50 rounded-md px-3 py-2 transition-colors font-medium border border-green-200"
          >
            설교 준비 탭으로 보내기 →
          </button>
          <button className="w-full text-left text-xs text-paper-500 hover:text-green-600 hover:bg-green-50/50 rounded-md px-3 py-2 transition-colors">
            연구 결과 복사
          </button>
          <button className="w-full text-left text-xs text-paper-500 hover:text-green-600 hover:bg-green-50/50 rounded-md px-3 py-2 transition-colors">
            전체 장 보기
          </button>
        </div>
      </div>

      {/* 연구 메모 미리보기 */}
      {memoText && (
        <div>
          <h3 className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest mb-3">현재 메모</h3>
          <div className="bg-paper-100 rounded-lg p-3">
            <p className="text-xs text-paper-600 leading-relaxed line-clamp-4">{memoText}</p>
            {memoTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {memoTags.map(tag => (
                  <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-green-100 text-green-700">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Default Guide */}
      <div className="space-y-3 text-xs text-paper-400 leading-relaxed">
        <div className="bg-paper-100 rounded-lg p-3">
          <p className="font-medium text-paper-600 mb-1">단어 분석</p>
          <p>본문에서 원어 단어를 클릭하면 상세 정보를 볼 수 있습니다.</p>
        </div>
        <div className="bg-paper-100 rounded-lg p-3">
          <p className="font-medium text-paper-600 mb-1">주석 보기</p>
          <p>절 번호를 클릭하면 해당 절의 주석을 확인할 수 있습니다.</p>
        </div>
        <div className="bg-paper-100 rounded-lg p-3">
          <p className="font-medium text-paper-600 mb-1">주제 연결</p>
          <p>주제를 클릭하면 연결된 설교와 자료를 탐색할 수 있습니다.</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Utility Components ─── */

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper-100 rounded-lg p-2">
      <div className="text-[9px] text-paper-400">{label}</div>
      <div className="text-[11px] font-medium text-paper-700 mt-0.5">{value}</div>
    </div>
  )
}

function SectionBox({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-lg p-3 ${className || ''}`}>
      <h4 className="text-[10px] font-semibold text-paper-500 uppercase tracking-wider mb-1">{title}</h4>
      <p className="text-xs text-paper-700 leading-relaxed">{children}</p>
    </div>
  )
}
