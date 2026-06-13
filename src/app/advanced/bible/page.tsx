'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MOCK_BIBLE_STUDY } from '@/lib/advanced/bibleStudyData'
import type { BibleStudyData, WordDetail, CommentaryItem, VerseParallel } from '@/lib/advanced/bibleStudyData'
import { BIBLE_BOOKS } from '@/lib/advanced/bibleBooks'

type DetailView = 'word' | 'verse' | 'theme' | 'none'

export default function BiblePage() {
  const router = useRouter()
  const data = MOCK_BIBLE_STUDY as BibleStudyData

  const [book, setBook] = useState('로마서')
  const [chapter, setChapter] = useState(8)
  const [verseStart, setVerseStart] = useState(1)
  const [verseEnd, setVerseEnd] = useState(11)
  const [testament, setTestament] = useState<'OT' | 'NT'>('NT')
  const [memoText, setMemoText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const [detailView, setDetailView] = useState<DetailView>('none')
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null)
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)

  const [showTranslations, setShowTranslations] = useState<Record<string, boolean>>({
    greek: true, krv: true, niv: true, esv: true, translit: false,
  })

  const filteredBooks = useMemo(() => {
    let list = BIBLE_BOOKS.filter(b => b.testament === testament)
    if (searchQuery) {
      list = list.filter(b => b.name.includes(searchQuery))
    }
    return list
  }, [testament, searchQuery])

  const currentBook = useMemo(() => BIBLE_BOOKS.find(b => b.name === book), [book])
  const chapterOptions = useMemo(() => {
    if (!currentBook) return []
    return Array.from({ length: currentBook.chapters }, (_, i) => i + 1)
  }, [currentBook])

  const handleBookSelect = useCallback((name: string) => {
    const b = BIBLE_BOOKS.find(bb => bb.name === name)
    if (b) {
      setBook(name)
      setChapter(1)
      setVerseStart(1)
      setVerseEnd(11)
    }
  }, [])

  const handleChapterSelect = useCallback((ch: number) => {
    setChapter(ch)
    setVerseStart(1)
    setVerseEnd(11)
  }, [])

  const handleLoad = useCallback(() => {
    setDetailView('none')
    setSelectedWordId(null)
    setSelectedVerse(null)
    setSelectedTheme(null)
  }, [])

  const handleWordClick = useCallback((wordId: string, _verse: number) => {
    setDetailView('word')
    setSelectedWordId(wordId)
    setSelectedVerse(null)
    setSelectedTheme(null)
  }, [])

  const handleVerseClick = useCallback((verse: number) => {
    setDetailView('verse')
    setSelectedVerse(verse)
    setSelectedWordId(null)
    setSelectedTheme(null)
  }, [])

  const handleThemeClick = useCallback((theme: string) => {
    setDetailView('theme')
    setSelectedTheme(theme)
    setSelectedWordId(null)
    setSelectedVerse(null)
  }, [])

  const handleCloseDetail = useCallback(() => {
    setDetailView('none')
    setSelectedWordId(null)
    setSelectedVerse(null)
    setSelectedTheme(null)
  }, [])

  const filteredVerses = useMemo(() => {
    return data.verses.filter(v => v.verse >= verseStart && v.verse <= verseEnd)
  }, [data.verses, verseStart, verseEnd])

  return (
    <div className="flex h-full overflow-hidden">
      <BibleSidebar
        books={filteredBooks}
        selectedBook={book}
        selectedChapter={chapter}
        testament={testament}
        onTestamentChange={setTestament}
        onBookSelect={handleBookSelect}
        onChapterSelect={handleChapterSelect}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        chapterOptions={chapterOptions}
        verseStart={verseStart}
        verseEnd={verseEnd}
        onVerseStartChange={setVerseStart}
        onVerseEndChange={setVerseEnd}
        maxVerses={50}
        onLoad={handleLoad}
        showTranslations={showTranslations}
        onToggleTranslation={key => setShowTranslations(prev => ({ ...prev, [key]: !prev[key] }))}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <div className="max-w-[900px] mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Bible Study</span>
                </div>
                <h2 className="text-xl font-extrabold text-white mt-1">성경 연구</h2>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  {book} {chapter}장 {verseStart}절~{verseEnd}절 &middot; {data.verses.length}절
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-bold bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl">
                  원어 {Object.keys(data.words).length}개 &middot; 주석 {data.commentaries.length}건
                </span>
              </div>
            </div>

            <ContextInfoCard before={data.contextInfo.before} after={data.contextInfo.after} />

            <div className="rounded-2xl border border-white/5 bg-[#04060f]/60 overflow-hidden">
              <div className="px-5 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">본문 연구</span>
                <span className="text-[10px] text-slate-600 font-bold">원어 단어를 클릭하면 상세 분석을 볼 수 있습니다</span>
              </div>
              <div className="divide-y divide-white/5">
                {filteredVerses.map(v => (
                  <VerseRow
                    key={v.verse}
                    verse={v}
                    words={data.words}
                    showTranslations={showTranslations}
                    selectedWordId={selectedWordId}
                    selectedVerse={selectedVerse}
                    onWordClick={handleWordClick}
                    onVerseClick={handleVerseClick}
                  />
                ))}
              </div>
            </div>

            <TranslationNotesSection notes={data.translationNotes} />

            <CommentarySection
              commentaries={data.commentaries}
              selectedVerse={selectedVerse}
              onVerseClick={handleVerseClick}
            />

            <ParallelPassagesSection passages={data.parallelPassages} router={router} />

            <ThemeSection themes={data.themes} onThemeClick={handleThemeClick} selectedTheme={selectedTheme} />

            <StudyMemoSection value={memoText} onChange={setMemoText} />

            <div className="flex items-center gap-3 pb-8">
              <button className="text-[13px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-indigo-600/15">
                연구 노트 저장
              </button>
              <button className="text-[13px] font-bold border border-white/5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white px-5 py-2.5 rounded-xl transition-colors">
                새 설교 프로젝트로 시작 →
              </button>
            </div>
          </div>
        </div>
      </div>

      {detailView !== 'none' && (
        <DetailPanel
          data={data}
          detailView={detailView}
          selectedWordId={selectedWordId}
          selectedVerse={selectedVerse}
          selectedTheme={selectedTheme}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  )
}

/* ─── Sidebar ─── */

function BibleSidebar({
  books, selectedBook, selectedChapter, testament, onTestamentChange,
  onBookSelect, onChapterSelect, searchQuery, onSearchChange,
  chapterOptions, verseStart, verseEnd, onVerseStartChange, onVerseEndChange,
  maxVerses, onLoad, showTranslations, onToggleTranslation,
}: {
  books: { name: string; chapters: number }[]
  selectedBook: string
  selectedChapter: number
  testament: 'OT' | 'NT'
  onTestamentChange: (t: 'OT' | 'NT') => void
  onBookSelect: (name: string) => void
  onChapterSelect: (ch: number) => void
  searchQuery: string
  onSearchChange: (q: string) => void
  chapterOptions: number[]
  verseStart: number
  verseEnd: number
  onVerseStartChange: (v: number) => void
  onVerseEndChange: (v: number) => void
  maxVerses: number
  onLoad: () => void
  showTranslations: Record<string, boolean>
  onToggleTranslation: (key: string) => void
}) {
  return (
    <aside className="w-56 shrink-0 border-r border-white/5 bg-[#04060f]/70 backdrop-blur-md flex flex-col overflow-hidden">
      <div className="p-3 border-b border-white/5">
        <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">본문 선택</div>
        <div className="flex rounded-xl overflow-hidden border border-white/5 mb-2 bg-[#090d20] p-0.5 gap-0.5">
          <button
            onClick={() => onTestamentChange('OT')}
            className={`flex-1 text-[11px] py-1.5 font-bold transition-all rounded-lg ${
              testament === 'OT' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            구약
          </button>
          <button
            onClick={() => onTestamentChange('NT')}
            className={`flex-1 text-[11px] py-1.5 font-bold transition-all rounded-lg ${
              testament === 'NT' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            신약
          </button>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="책 이름 검색..."
          className="w-full text-xs bg-[#0c1020] border border-white/5 rounded-xl px-2.5 py-1.5 outline-none focus:border-indigo-500/50 placeholder:text-slate-600 text-slate-200 font-medium"
        />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {books.map(b => (
          <button
            key={b.name}
            onClick={() => onBookSelect(b.name)}
            className={`w-full text-left px-4 py-2 text-[12px] font-bold transition-all flex items-center justify-between border-l-2 ${
              selectedBook === b.name
                ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500'
                : 'text-slate-500 hover:bg-white/[0.02] hover:text-slate-300 border-transparent'
            }`}
          >
            <span>{b.name}</span>
            <span className="text-[9px] text-slate-600 font-bold">{b.chapters}장</span>
          </button>
        ))}
      </div>

      <div className="border-t border-white/5 p-3 space-y-2 bg-[#04060f]/80">
        <div>
          <label className="text-[10px] text-slate-500 font-bold block mb-1">장</label>
          <select
            value={selectedChapter}
            onChange={e => onChapterSelect(Number(e.target.value))}
            className="w-full text-[12px] font-bold border border-white/5 rounded-xl px-2 py-1.5 outline-none focus:border-indigo-500/50 bg-[#0c1020] text-slate-300"
          >
            {chapterOptions.map(ch => (
              <option key={ch} value={ch}>{ch}장</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-[10px] text-slate-500 font-bold block mb-1">시작</label>
            <select
              value={verseStart}
              onChange={e => onVerseStartChange(Number(e.target.value))}
              className="w-full text-[12px] font-bold border border-white/5 rounded-xl px-2 py-1.5 outline-none focus:border-indigo-500/50 bg-[#0c1020] text-slate-300"
            >
              {Array.from({ length: maxVerses }, (_, i) => i + 1).map(v => (
                <option key={v} value={v}>{v}절</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-slate-500 font-bold block mb-1">끝</label>
            <select
              value={verseEnd}
              onChange={e => onVerseEndChange(Number(e.target.value))}
              className="w-full text-[12px] font-bold border border-white/5 rounded-xl px-2 py-1.5 outline-none focus:border-indigo-500/50 bg-[#0c1020] text-slate-300"
            >
              {Array.from({ length: maxVerses }, (_, i) => i + 1).filter(v => v >= verseStart).map(v => (
                <option key={v} value={v}>{v}절</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={onLoad}
          className="w-full text-[12px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl transition-colors shadow-lg shadow-indigo-600/15"
        >
          본문 불러오기
        </button>
        <div className="pt-1">
          <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block mb-1.5">표시 번역</label>
          <div className="flex flex-wrap gap-1">
            {(['greek', 'krv', 'niv', 'esv', 'translit'] as const).map(key => (
              <button
                key={key}
                onClick={() => onToggleTranslation(key)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all border ${
                  showTranslations[key]
                    ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                    : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'
                }`}
              >
                {{ greek: '원문', krv: '개역', niv: 'NIV', esv: 'ESV', translit: '음역' }[key]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}

/* ─── Context Info ─── */

function ContextInfoCard({ before, after }: { before: string; after: string }) {
  return (
    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5">
      <div className="flex gap-4 text-xs text-slate-400 leading-relaxed">
        <div className="flex-1">
          <span className="font-extrabold text-indigo-300 block mb-1.5 text-[10px] uppercase tracking-wider">◀ 앞 문맥</span>
          <p className="text-slate-300 font-medium">{before}</p>
        </div>
        <div className="w-px bg-indigo-500/20" />
        <div className="flex-1">
          <span className="font-extrabold text-indigo-300 block mb-1.5 text-[10px] uppercase tracking-wider">뒤 문맥 ▶</span>
          <p className="text-slate-300 font-medium">{after}</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Verse Row ─── */

function VerseRow({
  verse, words, showTranslations,
  selectedWordId, selectedVerse, onWordClick, onVerseClick,
}: {
  verse: VerseParallel
  words: BibleStudyData['words']
  showTranslations: Record<string, boolean>
  selectedWordId: string | null
  selectedVerse: number | null
  onWordClick: (wordId: string, verse: number) => void
  onVerseClick: (verse: number) => void
}) {
  const isSelected = selectedVerse === verse.verse

  return (
    <div className={`px-5 py-4 transition-colors ${isSelected ? 'bg-indigo-500/10' : 'hover:bg-white/[0.02]'}`}>
      <div className="flex gap-4">
        <button
          onClick={() => onVerseClick(verse.verse)}
          className={`w-8 h-8 rounded-full text-xs font-extrabold shrink-0 transition-all ${
            isSelected
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-white/5 border border-white/5 text-slate-500 hover:border-indigo-500/30 hover:text-indigo-400'
          }`}
        >
          {verse.verse}
        </button>
        <div className="flex-1 min-w-0 space-y-2">
          {showTranslations.greek && (
            <div className="flex items-start gap-2">
              <span className="text-[9px] font-extrabold text-indigo-400 w-8 shrink-0 mt-1 uppercase tracking-wider">원문</span>
              <p className="text-sm text-slate-200 leading-relaxed font-greek flex-1">
                {verse.greek.split(' ').map((word, i) => {
                  const matchedEntry = Object.entries(words).find(([_, w]) =>
                    w.lemmaGreek && word.includes(w.lemmaGreek.slice(0, 4))
                  )
                  if (matchedEntry) {
                    return (
                      <button
                        key={i}
                        onClick={() => onWordClick(matchedEntry[0], verse.verse)}
                        className={`hover:text-indigo-300 transition-colors cursor-pointer border-b border-dotted ${
                          selectedWordId === matchedEntry[0]
                            ? 'text-indigo-300 border-indigo-400 bg-indigo-500/10 rounded px-0.5'
                            : 'border-slate-600 hover:border-indigo-400'
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
          {showTranslations.translit && (
            <p className="text-xs text-slate-500 italic pl-10">{verse.translit}</p>
          )}
          {showTranslations.krv && (
            <div className="flex items-start gap-2">
              <span className="text-[9px] font-extrabold text-slate-500 w-8 shrink-0 mt-0.5">KRV</span>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">{verse.korean}</p>
            </div>
          )}
          {showTranslations.niv && (
            <div className="flex items-start gap-2">
              <span className="text-[9px] font-extrabold text-sky-500 w-8 shrink-0 mt-0.5">NIV</span>
              <p className="text-xs text-slate-400 leading-relaxed">{verse.niv}</p>
            </div>
          )}
          {showTranslations.esv && (
            <div className="flex items-start gap-2">
              <span className="text-[9px] font-extrabold text-amber-500 w-8 shrink-0 mt-0.5">ESV</span>
              <p className="text-xs text-slate-400 leading-relaxed">{verse.esv}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Translation Notes ─── */

function TranslationNotesSection({ notes }: { notes: BibleStudyData['translationNotes'] }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#04060f]/60 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">번역 비교 노트</span>
        <span className="text-[10px] text-slate-600 font-bold">{notes.length}건</span>
      </div>
      <div className="space-y-3">
        {notes.map((n, i) => (
          <div key={i} className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-extrabold text-sky-300">{n.verse}절</span>
              <div className="flex gap-1">
                {n.versions.map(v => (
                  <span key={v} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-300">
                    {v}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-[12px] text-slate-400 leading-relaxed font-medium">{n.note}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Commentary ─── */

function CommentarySection({
  commentaries, selectedVerse, onVerseClick,
}: {
  commentaries: BibleStudyData['commentaries']
  selectedVerse: number | null
  onVerseClick: (v: number) => void
}) {
  const grouped = commentaries.reduce<Record<number, typeof commentaries>>((acc, c) => {
    if (!acc[c.verse]) acc[c.verse] = []
    acc[c.verse].push(c)
    return acc
  }, {})

  const typeLabel: Record<string, string> = {
    exegetical: '본문 주석',
    theological: '신학',
    historical: '역사',
    pastoral: '목회',
  }

  const typeColor: Record<string, string> = {
    exegetical: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
    theological: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    historical: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    pastoral: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-[#04060f]/60 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">원문 주석</span>
        <span className="text-[10px] text-slate-600 font-bold">{commentaries.length}건</span>
      </div>
      <div className="space-y-4">
        {Object.entries(grouped).map(([verse, comms]) => (
          <div key={verse}>
            <button
              onClick={() => onVerseClick(parseInt(verse))}
              className={`inline-flex items-center gap-2 text-xs font-extrabold mb-2 transition-colors ${
                selectedVerse === parseInt(verse) ? 'text-indigo-400' : 'text-slate-500 hover:text-indigo-400'
              }`}
            >
              <span className="w-5 h-5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[9px] flex items-center justify-center font-extrabold text-indigo-300">{verse}</span>
              절 주석 ({comms.length}건)
            </button>
            <div className="space-y-2">
              {comms.map((c, i) => (
                <div key={i} className="text-[12px] text-slate-400 leading-relaxed pl-4 border-l-2 border-indigo-500/30">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-extrabold text-slate-300">{c.author}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${typeColor[c.type] || 'bg-white/5 border-white/5 text-slate-500'}`}>
                      {typeLabel[c.type] || c.type}
                    </span>
                  </div>
                  {c.text.length > 150 ? c.text.slice(0, 150) + '...' : c.text}
                  <p className="text-[10px] text-slate-600 mt-1 italic">— {c.source}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Parallel Passages ─── */

function ParallelPassagesSection({ passages, router }: { passages: BibleStudyData['parallelPassages']; router: ReturnType<typeof useRouter> }) {
  const relationLabel: Record<string, string> = {
    direct_quote: '직접 인용',
    allusion: '암시',
    thematic: '주제적 연결',
    typology: '예표/성취',
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-[#04060f]/60 p-5 space-y-4">
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">평행본문 / 관련 본문</span>
      <div className="space-y-3">
        {passages.map((p, i) => (
          <div key={i} className="flex gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 transition-all cursor-pointer">
            <span className="text-[9px] font-extrabold px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 h-fit shrink-0">
              {relationLabel[p.relation] || p.relation}
            </span>
            <div>
              <span className="text-[12px] font-extrabold text-indigo-300">{p.ref}</span>
              <p className="text-[12px] text-slate-400 leading-relaxed mt-0.5 font-medium">{p.text}</p>
              <p className="text-[10px] text-slate-600 mt-1 italic">{p.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Themes ─── */

function ThemeSection({ themes, onThemeClick, selectedTheme }: {
  themes: BibleStudyData['themes']
  onThemeClick: (t: string) => void
  selectedTheme: string | null
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#04060f]/60 p-5 space-y-4">
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">주제 사전 연결</span>
      <div className="flex flex-wrap gap-2">
        {themes.map(t => (
          <button
            key={t.name}
            onClick={() => onThemeClick(t.name)}
            className={`text-[11px] font-bold px-3.5 py-1.5 rounded-full border transition-all ${
              selectedTheme === t.name
                ? 'bg-purple-500/15 border-purple-500/40 text-purple-300 shadow-sm'
                : 'bg-white/5 border-white/5 text-slate-400 hover:border-purple-500/30 hover:text-purple-300'
            }`}
          >
            {t.name}
            <span className="ml-1.5 text-[10px] opacity-50">{t.connectedSermons}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── Study Memo ─── */

function StudyMemoSection({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#04060f]/60 p-5 space-y-4">
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">연구 메모</span>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="본문을 연구하면서 떠오른 통찰, 질문, 적용 아이디어를 기록하세요..."
        className="w-full min-h-[120px] text-[13px] text-slate-300 bg-[#0c1020] rounded-xl p-4 border border-white/5 outline-none resize-y focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all leading-relaxed placeholder:text-slate-600 font-medium"
      />
      <div className="flex justify-between">
        <div className="flex gap-1.5">
          <span className="text-[10px] font-bold text-slate-500 bg-white/5 border border-white/5 px-2 py-1 rounded-lg">💡 통찰</span>
          <span className="text-[10px] font-bold text-slate-500 bg-white/5 border border-white/5 px-2 py-1 rounded-lg">❓ 질문</span>
          <span className="text-[10px] font-bold text-slate-500 bg-white/5 border border-white/5 px-2 py-1 rounded-lg">📌 적용</span>
        </div>
        <span className="text-[10px] text-slate-600 font-bold">{value.length}자</span>
      </div>
    </div>
  )
}

/* ─── Detail Panel ─── */

function DetailPanel({
  data, detailView, selectedWordId, selectedVerse, selectedTheme, onClose,
}: {
  data: BibleStudyData
  detailView: DetailView
  selectedWordId: string | null
  selectedVerse: number | null
  selectedTheme: string | null
  onClose: () => void
}) {
  return (
    <aside className="w-[380px] shrink-0 border-l border-white/5 bg-[#04060f]/85 backdrop-blur-md overflow-y-auto scrollbar-thin">
      {detailView === 'word' && selectedWordId && data.words[selectedWordId] && (
        <WordDetailView word={data.words[selectedWordId]} onClose={onClose} />
      )}
      {detailView === 'verse' && selectedVerse && (
        <CommentaryDetailView
          verse={selectedVerse}
          text={data.verses.find(v => v.verse === selectedVerse)?.korean || ''}
          commentaries={data.commentaries.filter(c => c.verse === selectedVerse)}
          onClose={onClose}
        />
      )}
      {detailView === 'theme' && selectedTheme && (
        <ThemeDetailView
          theme={data.themes.find(t => t.name === selectedTheme) || null}
          onClose={onClose}
        />
      )}
    </aside>
  )
}

function DetailHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
      <h3 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">{title}</h3>
      <button onClick={onClose} className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

function WordDetailView({ word, onClose }: { word: WordDetail; onClose: () => void }) {
  return (
    <div>
      <DetailHeader title="원어 단어 분석" onClose={onClose} />
      <div className="p-5 space-y-4">
        <div className="text-center py-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
          <p className="text-3xl font-greek text-indigo-200">{word.lemmaGreek}</p>
          <p className="text-xs text-slate-500 font-bold mt-1.5">{word.transliteration || word.pronunciation}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <InfoBox label="Strong 번호" value={word.strong} />
          <InfoBox label="품사" value={word.partOfSpeech} />
          <InfoBox label="발음" value={word.pronunciation} />
          <InfoBox label="형태" value={word.morphology} />
        </div>
        <SectionBox title="기본 의미" className="bg-white/5">
          {word.basicMeaning}
        </SectionBox>
        <SectionBox title="문맥상 의미" className="bg-indigo-500/10 border border-indigo-500/20">
          {word.contextualMeaning}
        </SectionBox>
        <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
          <h4 className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest mb-1.5">쉽게 설명하면</h4>
          <p className="text-[13px] text-amber-200 leading-relaxed font-medium">{word.simpleExplanation}</p>
        </div>
        {word.usage.length > 0 && (
          <div>
            <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">성경 용례</h4>
            <div className="space-y-1.5">
              {word.usage.map((u, i) => (
                <div key={i} className="text-xs text-slate-400 bg-[#0c1020] rounded-xl p-3 border border-white/5">
                  <span className="font-bold text-slate-300">{u.ref}: </span>
                  {u.text}
                </div>
              ))}
            </div>
          </div>
        )}
        {word.sermonNote && (
          <SectionBox title="설교 적용 노트" className="bg-emerald-500/10 border border-emerald-500/20">
            {word.sermonNote}
          </SectionBox>
        )}
        {word.relatedWords.length > 0 && (
          <div>
            <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">관련 원어</h4>
            <div className="flex flex-wrap gap-1.5">
              {word.relatedWords.map(r => (
                <span key={r} className="text-[11px] px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 text-slate-400 font-mono">{r}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CommentaryDetailView({ verse, text, commentaries, onClose }: {
  verse: number
  text: string
  commentaries: CommentaryItem[]
  onClose: () => void
}) {
  const typeLabel: Record<string, string> = {
    exegetical: '본문 주석',
    theological: '신학',
    historical: '역사',
    pastoral: '목회',
  }
  const typeColor: Record<string, string> = {
    exegetical: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
    theological: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    historical: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    pastoral: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  }

  return (
    <div>
      <DetailHeader title={`${verse}절 주석`} onClose={onClose} />
      <div className="p-5 space-y-4">
        <div className="bg-[#0c1020] border border-white/5 rounded-xl p-4">
          <p className="text-sm text-slate-300 leading-relaxed font-medium">{text}</p>
        </div>
        {commentaries.length > 0 ? (
          <div className="space-y-3">
            {commentaries.map((c, i) => (
              <div key={i} className="bg-[#04060f]/60 border border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-extrabold text-slate-300">{c.author}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${typeColor[c.type] || 'bg-white/5 border-white/5 text-slate-500'}`}>
                    {typeLabel[c.type] || c.type}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{c.text}</p>
                <p className="text-[10px] text-slate-600 mt-1.5 italic">— {c.source}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-500 text-center py-8">
            이 절에 대한 주석이 없습니다.
          </div>
        )}
      </div>
    </div>
  )
}

function ThemeDetailView({ theme, onClose }: {
  theme: { name: string; description: string; connectedSermons: number } | null
  onClose: () => void
}) {
  if (!theme) return null
  return (
    <div>
      <DetailHeader title="주제 연결" onClose={onClose} />
      <div className="p-5 space-y-4">
        <div className="text-center py-4">
          <span className="inline-block px-5 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-sm font-extrabold">
            {theme.name}
          </span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed font-medium">{theme.description}</p>
        <div className="flex items-center justify-between text-xs text-slate-500 bg-[#0c1020] border border-white/5 rounded-xl p-3">
          <span className="font-bold">연결된 설교</span>
          <span className="font-extrabold text-slate-300">{theme.connectedSermons}편</span>
        </div>
        <button className="w-full text-xs font-bold text-indigo-400 border border-indigo-500/30 rounded-xl py-2.5 hover:bg-indigo-500/10 transition-colors">
          이 주제로 설교 검색 →
        </button>
      </div>
    </div>
  )
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 border border-white/[0.04] rounded-xl p-3">
      <div className="text-[9px] font-extrabold text-slate-600 uppercase tracking-wider">{label}</div>
      <div className="text-[12px] font-bold text-slate-300 mt-0.5">{value}</div>
    </div>
  )
}

function SectionBox({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl p-4 ${className || 'bg-white/5'}`}>
      <h4 className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">{title}</h4>
      <p className="text-[13px] text-slate-300 leading-relaxed font-medium">{children}</p>
    </div>
  )
}
