'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, Sparkles, BookOpen, FileText, Network, Archive, Settings, 
  Users, Zap, Globe, Star, ArrowRight, BrainCircuit, MessageSquare, 
  HelpCircle, Presentation, FileCheck, Loader2, X, Play, ShieldAlert,
  ThumbsUp
} from 'lucide-react'
import { getAllArchivedSermons } from '@/lib/advanced/archiveData'
import type { ArchivedSermon } from '@/lib/advanced/archiveData'
import { useProjects } from '@/lib/advanced/useProjects'
import NewUserLanding from '@/components/advanced/NewUserLanding'

// 감정 톤 매핑 유틸리티
const getEmotionalTone = (sermon: ArchivedSermon) => {
  const title = sermon.title
  if (title.includes('죄') || title.includes('회개')) return '참회'
  if (title.includes('사랑') || title.includes('화목')) return '사랑/기쁨'
  if (title.includes('믿음') || title.includes('의') || title.includes('소망')) return '격려/소망'
  if (title.includes('명령') || title.includes('부르심')) return '결단/도전'
  return '일반'
}

// AI 모의 생성 텍스트 구성 함수
const getGeneratedContent = (sermon: ArchivedSermon, actionType: string) => {
  const p = sermon.passage
  const t = sermon.title
  switch (actionType) {
    case 'summary':
      return `📝 [AI 설교 요약서] - "${t}" (${p})\n\n■ 핵심 명제\n${sermon.coreMessage}\n\n■ 본문 전개 요약\n1. 도입: ${sermon.introduction}\n2. 전개 (대지 요약):\n${sermon.outlineTitles.map((ot, idx) => `   - 대지 ${idx + 1}: ${ot}`).join('\n')}\n3. 결론: ${sermon.conclusion}\n\n■ 사역자 노트\n본 설교는 청중의 삶 속에서의 실천적 적용을 강조하고 있으며, ${sermon.themeNames.join(', ')} 등의 성경적 원리를 내포하고 있습니다.`;
    case 'questions':
      return `👥 [소그룹 나눔 질문지] - "${t}"\n\n■ 대상 회중: ${sermon.audience.join(', ')}\n\n1. [도입 질문] 오늘 설교 주제인 '${sermon.themeNames[0] || '은혜'}'와 관련하여, 한 주간 내 삶에 가장 먼저 떠오른 생각은 무엇이었나요?\n\n2. [본문 묵상] 본문 ${p}에 나타난 하나님의 마음에 대해 깊이 나누어 봅시다.\n\n3. [실천적 질문] "${sermon.coreMessage}"라는 메시지를 나의 가정이나 직장 속에서 어떻게 구체화하여 순종할 수 있을까요?\n\n4. [기도 제목] 함께 나눈 말씀을 바탕으로 서로의 연약함을 보듬고 기도할 공동의 기도 제목을 정리해 보세요.`;
    case 'cardnews':
      return `✨ [스토리텔링 카드뉴스 기획안]\n\n■ 메인 컨셉: 설교 "${t}"의 핵심 임팩트 비주얼 카드화\n\n- [카드 1: 표지]\n  - 타이틀: ${t}\n  - 비주얼: 어두운 배경 속에서 빛이 스며드는 웅장한 아우라 아트\n  - 서브 텍스트: 본문 ${p}\n\n- [카드 2: 문제 제기]\n  - 핵심 구절: ${sermon.introduction.slice(0, 50)}...\n  - 메시지: 우리가 매일 겪는 연약함과 신앙의 도전들\n\n- [카드 3: 해결책 제시]\n  - 텍스트: ${sermon.coreMessage}\n  - 비주얼: 소망의 하늘빛 컬러 그라데이션\n\n- [카드 4: 적용점]\n  - 텍스트: ${sermon.conclusion.slice(0, 60)}...\n\n- [카드 5: 엔딩 페이지]\n  - CTA: 더 깊은 은혜 속으로 (교회 홈페이지 및 유튜브 채널 링크)`;
    case 'shorts':
      return `🎬 [유튜브 쇼츠 60초 스토리보드]\n\n[00:00-00:10] (오프닝 훅)\n- 오디오: "자꾸만 포기하고 싶고 지치는 순간이 있으신가요? 딱 60초만 이 본문을 귀담아 들어보세요."\n- 비주얼: 어둠 속에서 성경이 펴지며 은은하게 불이 켜지는 애니메이션\n\n[00:10-00:35] (본론 요약)\n- 오디오: "오늘 설교 '${t}'에서 전한 핵심입니다. ${sermon.coreMessage.slice(0, 70)}."\n- 비주얼: 자막이 형광 효과와 함께 빠르게 흐름\n\n[00:35-00:50] (실천 제안)\n- 오디오: "더 이상 정죄감과 걱정에 머물지 마세요. 하나님의 사랑은 여러분을 결코 놓지 않습니다."\n- 비주얼: 활짝 웃는 신도의 모습 및 밝은 빛줄기 연출\n\n[00:50-01:00] (클로징)\n- 오디오: "더 많은 설교 말씀과 은혜를 만나시려면 구독과 좋아요를 눌러주세요!"`;
    case 'ppt':
      return `📊 [PPT 슬라이드 자동 구성 레이아웃]\n\n■ 템플릿: 테크 다크 오션 (Deep Navy + Indigo Accent)\n\n- [슬라이드 1: 표지]\n  - 타이틀: ${t}\n  - 부제: ${p} | 설교자: ${sermon.preacher}\n\n- [슬라이드 2: 말씀 읽기]\n  - 본문 말씀 구절 요약 텍스트 배치\n\n- [슬라이드 3: 대지 1]\n  - 타이틀: 1. ${sermon.outlineTitles[0] || '하나님의 약속'}\n  - 설명 내용 요약 및 아이콘 배치\n\n- [슬라이드 4: 대지 2]\n  - 타이틀: 2. ${sermon.outlineTitles[1] || '믿음의 반응'}\n  - 설명 내용 요약\n\n- [슬라이드 5: 결론]\n  - 요약 구절: ${sermon.conclusion.slice(0, 80)}`;
    case 'guide':
      return `📖 [소그룹 리더용 토론 가이드]\n\n■ 설교: "${t}" (${p})\n■ 작성자: AI 사역 비서\n\n■ 리더 행동 지침:\n- 시작할 때 어색함을 깨는 5분 아이스브레이크를 진행하세요.\n- 나눔 도중 특정 인원이 독점하지 않도록 경청을 유도하세요.\n\n■ 토론 상세 진행 가이드:\n1. 도입: 본문 ${p}이 쓰인 당시의 시대적/신학적 배경을 짧게 설명해 줍니다.\n2. 핵심 메시지 전달: "${sermon.coreMessage}"\n3. 토의 이끌기:\n   - Q: 설교에서 강조된 "${sermon.outlineTitles[0] || '첫 번째 대지'}"는 우리에게 어떤 일상적 순종을 요구할까요?\n4. 마무리: 각자의 나눔 내용을 기반으로 한 합심 기도 데스크 가이드 제공`;
    default:
      return '콘텐츠를 준비 중입니다.';
  }
}

export default function AdvancedDashboardPage() {
  const router = useRouter()
  const { projects, loading, totalRealCount } = useProjects()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeActionSermon, setActiveActionSermon] = useState<ArchivedSermon | null>(null)
  const [activeActionType, setActiveActionType] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [modalOutput, setModalOutput] = useState('')

  // ── Computed data (before early returns to satisfy rules-of-hooks) ──
  const SUGGESTION_CHIPS = [
    { label: '💡 은혜에 관한 설교', query: '은혜' },
    { label: '💡 로마서 강해 시리즈', query: '로마서' },
    { label: '💡 소망에 대한 본문', query: '소망' },
    { label: '💡 칭의 연구', query: '칭의' },
  ]

  const completedProjects = projects
    .filter(p => p.status === 'completed')
    .map(p => ({
      id: p.id, title: p.title, passage: p.passage, book: p.book, chapter: p.chapter,
      verseStart: p.verseStart, verseEnd: p.verseEnd, sermonDate: p.sermonDate,
      preacher: p.preacher, sermonType: p.sermonType, audience: p.audience,
      season: p.season, coreMessage: p.coreMessage, wordCount: p.wordCount,
      seriesName: p.seriesName, themeNames: p.themeNames, tagNames: p.tagNames,
      createdAt: p.createdAt, updatedAt: p.updatedAt,
    }))

  const allSermons = getAllArchivedSermons(completedProjects)

  const filteredSermons = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return allSermons.slice(0, 6)
    return allSermons.filter(s => 
      s.title.toLowerCase().includes(q) ||
      s.passage.toLowerCase().includes(q) ||
      s.book.toLowerCase().includes(q) ||
      s.coreMessage.toLowerCase().includes(q) ||
      s.themeNames.some(t => t.toLowerCase().includes(q)) ||
      s.tagNames.some(t => t.toLowerCase().includes(q))
    )
  }, [searchQuery, allSermons])

  // ── New user detection ──
  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-[12px] text-slate-500 font-bold">대시보드 로딩 중...</p>
        </div>
      </div>
    )
  }

  if (totalRealCount === 0) {
    return <NewUserLanding />
  }

  // ── Existing user dashboard ──

  // 3. 지식 그래프 노드 구조 정의 (데스크톱 전용)
  const GRAPH_NODES = [
    { id: 'romans', label: '로마서', type: 'book', color: 'rgba(99, 102, 241, 0.8)', glowColor: 'rgba(99, 102, 241, 0.4)', cx: 400, cy: 190, r: 28 },
    
    // 설교 노드들
    { id: 'arc-001', label: '믿음으로 말미암는 의', type: 'sermon', color: 'rgba(56, 189, 248, 0.8)', glowColor: 'rgba(56, 189, 248, 0.3)', cx: 220, cy: 90, r: 16 },
    { id: 'arc-002', label: '화목하게 된 즐거움', type: 'sermon', color: 'rgba(56, 189, 248, 0.8)', glowColor: 'rgba(56, 189, 248, 0.3)', cx: 580, cy: 90, r: 16 },
    { id: 'arc-003', label: '죄에 대하여 죽은 자', type: 'sermon', color: 'rgba(56, 189, 248, 0.8)', glowColor: 'rgba(56, 189, 248, 0.3)', cx: 160, cy: 220, r: 16 },
    { id: 'arc-004', label: '성령 안에 있는 생명', type: 'sermon', color: 'rgba(56, 189, 248, 0.8)', glowColor: 'rgba(56, 189, 248, 0.3)', cx: 640, cy: 220, r: 16 },
    
    // 주제 노드들
    { id: 'theme-grace', label: '은혜', type: 'theme', color: 'rgba(192, 132, 252, 0.8)', glowColor: 'rgba(192, 132, 252, 0.3)', cx: 330, cy: 310, r: 20 },
    { id: 'theme-faith', label: '믿음', type: 'theme', color: 'rgba(192, 132, 252, 0.8)', glowColor: 'rgba(192, 132, 252, 0.3)', cx: 470, cy: 310, r: 20 },
    
    // 시리즈 노드
    { id: 'series-rom', label: '로마서 강해', type: 'series', color: 'rgba(251, 191, 36, 0.8)', glowColor: 'rgba(251, 191, 36, 0.3)', cx: 400, cy: 50, r: 22 },
  ]

  const GRAPH_LINKS = [
    { source: 'romans', target: 'arc-001' },
    { source: 'romans', target: 'arc-002' },
    { source: 'romans', target: 'arc-003' },
    { source: 'romans', target: 'arc-004' },
    { source: 'romans', target: 'theme-grace' },
    { source: 'romans', target: 'theme-faith' },
    { source: 'series-rom', target: 'romans' },
    { source: 'theme-grace', target: 'arc-001' },
    { source: 'theme-grace', target: 'arc-004' },
    { source: 'theme-faith', target: 'arc-001' },
    { source: 'theme-faith', target: 'arc-002' },
  ]

  // 4. AI 액션 핸들러
  const handleAiAction = async (sermon: ArchivedSermon, type: string) => {
    setActiveActionSermon(sermon)
    setActiveActionType(type)
    setGenerating(true)
    setModalOutput('')

    try {
      const res = await fetch('/api/advanced/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          data: { sermon },
        }),
      })
      const json = await res.json()
      if (json.success) {
        setModalOutput(json.data.output)
      } else {
        setModalOutput(`오류: ${json.error}`)
      }
    } catch (e: any) {
      setModalOutput(`요청 실패: ${e.message}`)
    }
    setGenerating(false)
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin pb-12">
      {/* 백그라운드 테크니컬 파티클 구형 렌더링 */}
      <div className="absolute inset-x-0 top-0 h-[700px] pointer-events-none overflow-hidden z-0 bg-radial-glow opacity-60" />

      <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-10 w-full relative z-10">
        {/* ─── 1. AI Search Experience (Ask Bunker 목양) ─── */}
        <section className="relative glass-dark p-8 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          {/* 글로잉 내부 장식 */}
          <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold">
              <Sparkles className="w-3 h-3 text-indigo-400 animate-bounce" />
              Bunker 목양 Cognitive Search
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">지능형 말씀 사역 탐색</h3>
              <p className="text-xs text-slate-500 font-medium">
                키워드 검색을 넘어 인공지능에게 설교 준비에 필요한 데이터 분석을 직접 질문해 보세요.
              </p>
            </div>

            {/* ChatGPT 스타일 인풋창 */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-500" />
              <div className="relative flex items-center bg-[#070b18] rounded-2xl border border-white/5 overflow-hidden">
                <Search className="w-5 h-5 text-slate-500 ml-4 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Bunker 목양에게 물어보세요: '은혜에 관한 로마서 설교 중 요약본이 완성된 것들만 보여줘...'"
                  className="w-full bg-transparent text-[14px] text-slate-100 placeholder:text-slate-600 outline-none px-4 py-4 font-medium"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white mr-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* 추천 칩 리스트 */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {SUGGESTION_CHIPS.map(chip => (
                <button
                  key={chip.label}
                  onClick={() => setSearchQuery(chip.query)}
                  className={`text-[11px] px-3.5 py-1.5 rounded-xl border transition-all duration-300 font-semibold ${
                    searchQuery === chip.query
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/25'
                      : 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 3. Knowledge Graph Section (Obsidian Style) ─── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-purple-400 animate-pulse" />
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Knowledge Network Graph</h2>
            </div>
            <span className="text-[10px] text-slate-600 font-medium">노드를 클릭하여 즉시 검색 필터를 적용하세요.</span>
          </div>

          <div className="relative h-[340px] rounded-3xl border border-white/5 bg-[#04060f]/60 overflow-hidden shadow-2xl">
            {/* SVG 링크 및 노드 그리기 */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 800 340">
              <defs>
                <radialGradient id="node-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* 연결 선 */}
              {GRAPH_LINKS.map((link, idx) => {
                const src = GRAPH_NODES.find(n => n.id === link.source)
                const tgt = GRAPH_NODES.find(n => n.id === link.target)
                if (!src || !tgt) return null
                return (
                  <line
                    key={idx}
                    x1={src.cx} y1={src.cy}
                    x2={tgt.cx} y2={tgt.cy}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="1.5"
                    className="line-trail"
                  />
                )
              })}

              {/* 노드 그래픽 요소 */}
              {GRAPH_NODES.map((node) => (
                <g key={node.id}>
                  {/* 글로우 백그라운드 */}
                  <circle 
                    cx={node.cx} 
                    cy={node.cy} 
                    r={node.r * 1.8} 
                    fill="url(#node-glow)" 
                    opacity="0.3"
                  />
                </g>
              ))}
            </svg>

            {/* 실제 마우스 클릭을 지원하기 위해 절대좌표 div 노드를 배치 */}
            {GRAPH_NODES.map((node) => (
              <button
                key={node.id}
                onClick={() => setSearchQuery(node.label)}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group"
                style={{ left: `${(node.cx / 800) * 100}%`, top: `${(node.cy / 340) * 100}%` }}
              >
                <div 
                  className="rounded-full flex items-center justify-center border transition-all shadow-lg text-white font-bold"
                  style={{ 
                    width: `${node.r * 2}px`, 
                    height: `${node.r * 2}px`,
                    backgroundColor: node.color,
                    borderColor: 'rgba(255, 255, 255, 0.25)',
                    boxShadow: `0 0 15px ${node.glowColor}`
                  }}
                >
                  <span className="text-[10px] tracking-tight">{node.label.slice(0, 2)}</span>
                </div>
                {/* 툴팁/레이블 */}
                <div className="absolute top-[105%] px-2 py-0.5 rounded bg-[#090d20] border border-white/10 text-[9.5px] font-bold text-slate-300 opacity-80 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
                  {node.label}
                </div>
              </button>
            ))}

            {/* 그래프 맵 범례 */}
            <div className="absolute bottom-4 left-5 flex gap-4 text-[10px] text-slate-500 font-bold bg-[#070a16]/80 px-4 py-2 rounded-xl border border-white/5 backdrop-blur-sm">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500" />성경 권</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-500" />설교 원고</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-400" />사역 주제</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" />강해 시리즈</span>
            </div>
          </div>
        </section>

        {/* ─── 4. Sermon Cards Section ─── */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Archive className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Sermon Asset Cards</h2>
            </div>
            <span className="text-xs text-slate-500 font-bold">
              {filteredSermons.length}개의 정렬 결과
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSermons.map(sermon => {
              const tone = getEmotionalTone(sermon)
              const theme = sermon.themeNames[0] || '은혜'
              return (
                <div
                  key={sermon.id}
                  className="group relative rounded-2xl glass-dark border border-white/5 p-6 space-y-4 hover:border-indigo-500/30 transition-all duration-500 flex flex-col justify-between min-h-[300px]"
                  style={{
                    boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.4)'
                  }}
                >
                  <div className="space-y-3">
                    {/* 상단 메타 정보 */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500">{sermon.sermonDate}</span>
                      {sermon.seriesName && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold">
                          {sermon.seriesName}
                        </span>
                      )}
                    </div>

                    {/* 타이틀 및 성경 구절 */}
                    <div className="space-y-1">
                      <h3 className="text-[16px] font-bold text-white group-hover:text-indigo-400 transition-colors leading-snug">
                        {sermon.title}
                      </h3>
                      <div className="inline-block text-[11px] font-extrabold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">
                        {sermon.passage}
                      </div>
                    </div>

                    {/* 설교 요약 */}
                    <p className="text-[12px] text-slate-400 leading-relaxed line-clamp-3 font-medium">
                      {sermon.coreMessage}
                    </p>
                  </div>

                  {/* 🚨 AI 생성 메타데이터 태그 (Theme, Tone, Audience, Keywords) */}
                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-bold">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-600">주제:</span>
                        <span className="text-purple-300 font-extrabold">{theme}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-600">감정 톤:</span>
                        <span className="text-emerald-300 font-extrabold">{tone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-600">회중:</span>
                        <span className="text-blue-300 font-extrabold">{sermon.audience.join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-600">키워드:</span>
                        <span className="text-amber-300 font-extrabold truncate">{sermon.tagNames.slice(0, 2).join(', ')}</span>
                      </div>
                    </div>

                    {/* 🚀 AI Action Panel (Hover Slide-Up / Grid Action buttons) */}
                    <div className="pt-2">
                      <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-600 mb-1.5">AI Action Panel</div>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          onClick={() => handleAiAction(sermon, 'summary')}
                          className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/5 hover:bg-indigo-600 text-[10px] text-slate-400 hover:text-white transition-all font-bold"
                          title="설교 요약서 생성"
                        >
                          <FileCheck className="w-3 h-3" />
                          <span>요약</span>
                        </button>
                        <button
                          onClick={() => handleAiAction(sermon, 'questions')}
                          className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/5 hover:bg-purple-600 text-[10px] text-slate-400 hover:text-white transition-all font-bold"
                          title="소그룹 질문 생성"
                        >
                          <Users className="w-3 h-3" />
                          <span>질문</span>
                        </button>
                        <button
                          onClick={() => handleAiAction(sermon, 'cardnews')}
                          className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/5 hover:bg-pink-600 text-[10px] text-slate-400 hover:text-white transition-all font-bold"
                          title="카드뉴스 템플릿 생성"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>카드</span>
                        </button>
                        <button
                          onClick={() => handleAiAction(sermon, 'shorts')}
                          className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/5 hover:bg-blue-600 text-[10px] text-slate-400 hover:text-white transition-all font-bold"
                          title="유튜브 쇼츠 대본"
                        >
                          <Globe className="w-3 h-3" />
                          <span>쇼츠</span>
                        </button>
                        <button
                          onClick={() => handleAiAction(sermon, 'ppt')}
                          className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/5 hover:bg-amber-600 text-[10px] text-slate-400 hover:text-white transition-all font-bold"
                          title="PPT 슬라이드 레이아웃 생성"
                        >
                          <Presentation className="w-3 h-3" />
                          <span>PPT</span>
                        </button>
                        <button
                          onClick={() => handleAiAction(sermon, 'guide')}
                          className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/5 hover:bg-emerald-600 text-[10px] text-slate-400 hover:text-white transition-all font-bold"
                          title="토론 가이드 생성"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>가이드</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      {/* ─── AI Generation Modal ─── */}
      {activeActionSermon && activeActionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03050c]/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-3xl glass-dark border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto scrollbar-thin">
            {/* 닫기 버튼 */}
            <button
              onClick={() => {
                setActiveActionSermon(null)
                setActiveActionType(null)
              }}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 헤더 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <BrainCircuit className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
              <div>
                <h4 className="text-[17px] font-bold text-white">Bunker 목양 컨텐츠 생성</h4>
                <p className="text-[11px] text-slate-500 font-semibold">{activeActionSermon.title} · {activeActionSermon.passage}</p>
              </div>
            </div>

            {/* 출력 화면 */}
            <div className="bg-[#060a17] border border-white/5 rounded-2xl p-5 min-h-[250px] relative overflow-hidden flex flex-col justify-center">
              {generating ? (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                  <div className="text-center">
                    <p className="text-[13px] font-bold text-slate-300">인공지능 가공 엔진 작동 중</p>
                    <p className="text-[10.5px] text-slate-500">본문 문맥을 토대로 최적의 산출물을 조율하고 있습니다...</p>
                  </div>
                </div>
              ) : (
                <pre className="text-slate-300 text-xs sm:text-[13px] font-medium leading-relaxed font-sans whitespace-pre-wrap select-all">
                  {modalOutput}
                </pre>
              )}
            </div>

            {/* 풋버튼 */}
            {!generating && (
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
                  <ThumbsUp className="w-3.5 h-3.5 text-indigo-400" />
                  텍스트를 드래그하거나 복사하여 즉시 활용할 수 있습니다.
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(modalOutput)
                    alert('클립보드에 복사되었습니다.')
                  }}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[12px] shadow-lg shadow-indigo-600/15 transition-all"
                >
                  클립보드 복사
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
