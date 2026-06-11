'use client'

import { WordDetail, CommentaryItem, BibleStudyData } from '@/lib/advanced/bibleStudyData'

interface Props {
  data: BibleStudyData
  selectedWordId: string | null
  selectedVerse: number | null
  selectedTheme: string | null
  onClose: () => void
}

export default function BibleStudyDetailPanel({ data, selectedWordId, selectedVerse, selectedTheme, onClose }: Props) {
  if (selectedWordId && data.words[selectedWordId]) {
    return <WordDetailView word={data.words[selectedWordId]} onClose={onClose} />
  }
  if (selectedVerse) {
    const verseData = data.verses.find(v => v.verse === selectedVerse)
    const verseCommentaries = data.commentaries.filter(c => c.verse === selectedVerse)
    return <CommentaryDetailView verse={selectedVerse} text={verseData?.korean || ''} commentaries={verseCommentaries} onClose={onClose} />
  }
  if (selectedTheme) {
    const themeData = data.themes.find(t => t.name === selectedTheme)
    return <ThemeDetailView theme={themeData || null} onClose={onClose} />
  }
  return <DefaultGuideView data={data} onClose={onClose} />
}

function DetailHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4 pb-3 border-b border-paper-200">
      <h3 className="text-xs font-semibold text-paper-500 uppercase tracking-widest">{title}</h3>
      <button onClick={onClose} className="text-paper-400 hover:text-paper-600 p-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  )
}

function WordDetailView({ word, onClose }: { word: WordDetail; onClose: () => void }) {
  return (
    <div className="p-5">
      <DetailHeader title="원어 단어 상세" onClose={onClose} />
      <div className="space-y-4">
        <div className="text-center py-4 bg-paper-100 rounded-lg">
          <p className="text-2xl font-greek text-paper-800">{word.lemmaGreek}</p>
          <p className="text-sm text-paper-500 mt-1">{word.transliteration || word.pronunciation}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <InfoBox label="Strong 번호" value={word.strong} />
          <InfoBox label="품사" value={word.partOfSpeech} />
          <InfoBox label="발음" value={word.pronunciation} />
          <InfoBox label="형태론" value={word.morphology} />
        </div>
        <div>
          <h4 className="text-[11px] font-semibold text-paper-500 uppercase tracking-wider mb-1.5">기본 의미</h4>
          <p className="text-sm text-paper-700 bg-paper-100 rounded-lg p-3">{word.basicMeaning}</p>
        </div>
        <div>
          <h4 className="text-[11px] font-semibold text-green-600 uppercase tracking-wider mb-1.5">문맥상 의미</h4>
          <p className="text-sm text-paper-700 bg-green-50 rounded-lg p-3 border border-green-100">{word.contextualMeaning}</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
          <h4 className="text-[11px] font-semibold text-amber-700 mb-1">쉽게 설명하면</h4>
          <p className="text-sm text-amber-800 leading-relaxed">{word.simpleExplanation}</p>
        </div>
        {word.usage.length > 0 && (
          <div>
            <h4 className="text-[11px] font-semibold text-paper-500 uppercase tracking-wider mb-1.5">성경 용례</h4>
            <div className="space-y-1.5">
              {word.usage.map((u, i) => (
                <div key={i} className="text-xs text-paper-600 bg-paper-100 rounded-lg p-2.5">
                  <span className="font-medium text-paper-700">{u.ref}: </span>
                  {u.text}
                </div>
              ))}
            </div>
          </div>
        )}
        {word.sermonNote && (
          <div>
            <h4 className="text-[11px] font-semibold text-green-600 uppercase tracking-wider mb-1.5">설교 적용 노트</h4>
            <p className="text-sm text-paper-700 leading-relaxed bg-paper-100 rounded-lg p-3 border-l-2 border-green-400">{word.sermonNote}</p>
          </div>
        )}
        {word.relatedWords.length > 0 && (
          <div>
            <h4 className="text-[11px] font-semibold text-paper-500 uppercase tracking-wider mb-1.5">관련 원어</h4>
            <div className="flex flex-wrap gap-1.5">
              {word.relatedWords.map(r => (
                <span key={r} className="text-[11px] px-2 py-0.5 rounded bg-paper-150 text-paper-600 font-mono">{r}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CommentaryDetailView({ verse, text, commentaries, onClose }: { verse: number; text: string; commentaries: CommentaryItem[]; onClose: () => void }) {
  return (
    <div className="p-5">
      <DetailHeader title={`${verse}절 주석`} onClose={onClose} />
      <div className="bg-paper-100 rounded-lg p-3 mb-4">
        <p className="text-xs text-paper-600 leading-relaxed">{text}</p>
      </div>
      {commentaries.length > 0 ? (
        <div className="space-y-3">
          {commentaries.map((c, i) => (
            <div key={i} className="bg-white rounded-lg border border-paper-200 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-medium text-paper-700">{c.author}</span>
                <TypeBadge type={c.type} />
              </div>
              <p className="text-xs text-paper-600 leading-relaxed">{c.text}</p>
              <p className="text-[10px] text-paper-400 mt-1.5 italic">— {c.source}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-paper-400 text-center py-8">
          이 절에 대한 주석이 없습니다.
        </div>
      )}
    </div>
  )
}

function ThemeDetailView({ theme, onClose }: { theme: { name: string; description: string; connectedSermons: number } | null; onClose: () => void }) {
  if (!theme) return null
  return (
    <div className="p-5">
      <DetailHeader title="주제 연결" onClose={onClose} />
      <div className="text-center py-4">
        <span className="inline-block px-4 py-1.5 rounded-full bg-gold-100 text-gold-700 text-sm font-medium">
          {theme.name}
        </span>
      </div>
      <p className="text-sm text-paper-700 leading-relaxed mb-4">{theme.description}</p>
      <div className="flex items-center justify-between text-xs text-paper-500 bg-paper-100 rounded-lg p-3">
        <span>연결된 설교</span>
        <span className="font-medium text-paper-700">{theme.connectedSermons}편</span>
      </div>
      <button className="w-full mt-4 text-xs text-green-600 border border-green-200 rounded-lg py-2 hover:bg-green-50 transition-colors">
        이 주제로 설교 검색 →
      </button>
    </div>
  )
}

function DefaultGuideView({ data, onClose }: { data: BibleStudyData; onClose: () => void }) {
  return (
    <div className="p-5">
      <DetailHeader title="연구 도구" onClose={onClose} />
      <div className="space-y-4 text-xs text-paper-500 leading-relaxed">
        <div className="bg-paper-100 rounded-lg p-3">
          <p className="font-medium text-paper-700 mb-1">💡 단어 분석</p>
          <p>본문에서 원어 단어를 클릭하면 상세 정보를 볼 수 있습니다.</p>
        </div>
        <div className="bg-paper-100 rounded-lg p-3">
          <p className="font-medium text-paper-700 mb-1">📖 주석 보기</p>
          <p>절 번호를 클릭하면 해당 절의 주석을 확인할 수 있습니다.</p>
        </div>
        <div className="bg-paper-100 rounded-lg p-3">
          <p className="font-medium text-paper-700 mb-1">🔗 주제 연결</p>
          <p>주제를 클릭하면 연결된 설교와 자료를 탐색할 수 있습니다.</p>
        </div>
        <div className="bg-paper-100 rounded-lg p-3">
          <p className="font-medium text-paper-700 mb-1">📊 연구 현황</p>
          <p>본문 연구 횟수: {data.verses.length}절 · 원어 분석: {Object.keys(data.words).length}개 · 주석: {data.commentaries.length}건</p>
        </div>
      </div>
    </div>
  )
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper-100 rounded-lg p-2.5">
      <div className="text-[10px] text-paper-400">{label}</div>
      <div className="text-xs font-medium text-paper-700 mt-0.5">{value}</div>
    </div>
  )
}

function TypeBadge({ type }: { type: string }) {
  const colorMap: Record<string, string> = {
    exegetical: 'bg-teal-100 text-teal-700',
    theological: 'bg-gold-100 text-gold-700',
    historical: 'bg-amber-100 text-amber-700',
    pastoral: 'bg-green-100 text-green-700',
  }
  const labelMap: Record<string, string> = {
    exegetical: '본문 주석',
    theological: '신학',
    historical: '역사',
    pastoral: '목회',
  }
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded ${colorMap[type] || 'bg-paper-150 text-paper-600'}`}>
      {labelMap[type] || type}
    </span>
  )
}
