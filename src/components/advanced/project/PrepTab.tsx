'use client'

import { useState, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ProjectDetail } from '@/lib/advanced/types'
import { AppSectionHeader, PrepVersionHistory } from '@/components/advanced/shared'
import ProjectContextRow from '@/components/advanced/shared/ProjectContextRow'
import type { PrepVersion } from '@/lib/advanced/johnVersionData'
import { PREP_VERSIONS, RECENT_ACTIVITY } from '@/lib/advanced/johnVersionData'

interface Props { project: ProjectDetail }

interface PrepOutline {
  id: string
  title: string
  description: string
  relatedVerse: string
  applicationNote: string
  transitionNote: string
}

interface ApplicationPoint {
  id: string
  point: string
  audienceTag: string
  pastoralNote: string
}

interface PrepData {
  sermonTitle: string
  coreMessage: string
  sermonPurpose: string
  expectedResponse: string
  passageStructure: string
  contextPoints: string[]
  keyWords: { word: string; meaning: string; note: string }[]
  researchInsights: string[]
  outlines: PrepOutline[]
  applicationPoints: ApplicationPoint[]
  deliveryIntro: string
  deliveryFlow: string
  deliveryTransitions: string[]
  deliveryConclusion: string
  prepStatus: 'draft' | 'review' | 'ready'
}

type SectionId = 'direction' | 'passage' | 'outline' | 'application' | 'delivery'

const SECTION_LABELS: Record<SectionId, string> = {
  direction: '설교 방향',
  passage: '본문 핵심 흐름',
  outline: '대지 구조',
  application: '적용과 회중 연결',
  delivery: '전달 흐름',
}

const PREP_STATUS_LABELS: Record<string, string> = {
  draft: '초안 정리 중',
  review: '구조 검토 필요',
  ready: '작성 준비 완료',
}

const PREP_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-amber-500/10 text-amber-300',
  review: 'bg-blue-500/10 text-blue-300',
  ready: 'bg-indigo-500/10 text-indigo-300',
}

const JOHN_PREP_DATA: PrepData = {
  sermonTitle: '말씀은 생명이요 빛이시다',
  coreMessage: '태초부터 계신 말씀은 생명과 빛으로 어둠 속의 사람을 비추신다',
  sermonPurpose: '회중이 예수 그리스도를 추상적 진리가 아닌 생명과 빛의 주로 다시 바라보게 한다',
  expectedResponse: '익숙한 본문을 다시 현재의 삶에 연결해 듣게 하고, 그리스도의 선재성과 생명 되심을 고백하게 한다',
  passageStructure: '요한은 창세기 1:1을 의도적으로 연상시키며 시작한다 — "태초에 말씀이 계시니라." 프롤로그(1:1-18)의 서두로서, 1-5절은 말씀의 선재성(1-2절), 창조와 생명(3-4절), 빛과 어둠의 긴장(5절)으로 전개된다. 전체 구조는 하강(선재성 → 성육신)과 상승(십자가 → 영광)의 큰 흐름 속에서 이 서론이 우주의 시작을 선포한다.',
  contextPoints: [
    '창세기 1:1의 "태초에"(bereshit)를 의도적으로 인용 — 새 창조의 서막',
    '요한 공동체의 상황: 예수님의 신성에 대한 도전에 응답',
    '영지주의적 경향에 대한 반박 — 로고스는 인격적 그리스도',
    '시내산 율법과 대비 — 말씀이 육신이 되어 우리 가운데 거하심',
  ],
  keyWords: [
    { word: 'λόγος (로고스)', meaning: '말씀, 말, 이성', note: '하나님의 자기 계시의 궁극적 표현 — 인격적 그리스도. 헬라 철학의 보편적 이성이 아니라, 살아 계신 말씀' },
    { word: 'ζωή (조에)', meaning: '생명', note: '생물학적 생명(bios)이 아닌, 하나님께로부터 오는 영원한 생명. 예수님 안에 그 생명이 있었다' },
    { word: 'φῶς (포스)', meaning: '빛', note: '계시, 진리, 구원의 상징. 빛은 어둠을 이기며, 사람들에게 하나님을 드러낸다' },
    { word: 'σκοτία (스코티아)', meaning: '어둠', note: '영적 무지, 죄, 하나님으로부터의 단절. 그러나 빛이 비췄고 어둠은 이기지 못했다' },
    { word: 'σάρξ (사륵스)', meaning: '육신', note: '14절로 이어지는 성육신의 핵심 개념. 말씀이 육신이 되셨다' },
  ],
  researchInsights: [
    '요한의 프롤로그는 창세기 1장과 잠언 8장의 지혜 전통을 함께 담고 있음',
    '"말씀"(λόγος)은 구약의 "다바르"(דבר) 개념과 헬라 철학의 로고스 개념이 교차하는 지점',
    '5절 "어둠이 깨닫지 못하더라"는 "이해하지 못했다"와 "정복하지 못했다"는 중의적 의미',
    '바울의 그리스도 찬송(빌 2:6-11, 골 1:15-20)과 요한의 프롤로그는 초기 교회의 그리스도론적 찬송 전통을 반영',
  ],
  outlines: [
    {
      id: 'outline-1',
      title: '말씀은 태초부터 하나님과 함께 계셨다',
      description: '요한은 창세기 1:1을 의도적으로 연상시키며, 예수님이 시간과 창조의 시작 이전에 이미 존재하셨음을 선포한다. "함께 계셨다"(πρός)는 단순한 공존이 아니라 친밀한 교제와 인격적 구별을 나타낸다.',
      relatedVerse: '요 1:1-2',
      applicationNote: '우리의 신앙은 시간의 우연이 아니라 영원 전부터 계신 그리스도에 기초한다. 창조 이전의 사랑, 그 사랑이 오늘 나를 향하고 있다.',
      transitionNote: '이 선재하신 말씀이 우리와 어떤 관계를 맺으시는가? 3-4절이 그 답을 준다.',
    },
    {
      id: 'outline-2',
      title: '말씀 안에 생명이 있었다',
      description: '만물이 그로 말미암아 지은 바 되었다. 그 안에 생명(ζωή)이 있었고, 그 생명은 사람들의 빛이었다. 예수님은 창조의 매개자이시며, 생명의 근원이시다. 이 생명은 단순한 존재가 아니라 하나님과의 교제 안에서 누리는 영원한 생명이다.',
      relatedVerse: '요 1:3-4',
      applicationNote: '예수님이 생명의 근원이시므로, 우리는 그분 안에서만 참된 생명을 찾을 수 있다. 세상의 것들(성공, 물질, 관계)에서 생명을 찾으려 하지 말라.',
      transitionNote: '그런데 이 생명이 어둠 가운데 있는 세상에 어떻게 비추어졌는가?',
    },
    {
      id: 'outline-3',
      title: '그 생명은 사람들의 빛이었다',
      description: '빛이 어둠에 비치되 어둠이 깨닫지 못하더라(οὐ κατέλαβεν). 어둠은 빛을 이해하지도 못했고, 정복하지도 못했다. 그리스도의 빛은 지속적으로 비추고 있으며(φαίνει, 현재형), 어떤 어둠도 이길 수 없다.',
      relatedVerse: '요 1:5',
      applicationNote: '오늘의 어둠(죄책감, 두려움, 절망)이 그리스도의 빛을 이길 수 없다. 이 소망을 붙들라. 어둠이 깊을수록 빛은 더 선명하게 드러난다.',
      transitionNote: '이 빛이 구체적으로 어떻게 이 땅에 찾아오셨는가? 14절이 선포한다: 말씀이 육신이 되어 우리 가운데 거하셨다.',
    },
  ],
  applicationPoints: [
    {
      id: 'app-1',
      point: '익숙한 본문을 새롭게 듣는 훈련 — 아침마다 요한 1:1-5를 읽고 "이 말씀이 오늘 나에게 하시는 말씀은 무엇인가" 질문하기',
      audienceTag: '전체 회중',
      pastoralNote: '익숙함이 경외감을 대체하지 않도록. 본문이 너무 유명해서 오히려 무디어질 위험이 있다.',
    },
    {
      id: 'app-2',
      point: '빛을 지식으로만 이해하지 않도록 — 예수님을 아는 것(지식)과 예수님 안에 거하는 것(생명)을 구분하여 적용',
      audienceTag: '신앙 성숙자',
      pastoralNote: '신학 지식이 많은 성도일수록 "말씀"을 개념으로만 소비할 위험이 있다. 생명으로 연결되게 해야 한다.',
    },
    {
      id: 'app-3',
      point: '삶의 어둠(질병, 실직, 관계의 어려움) 앞에서 그리스도의 빛이 여전히 비추고 있음을 선포하도록',
      audienceTag: '고난 중인 성도',
      pastoralNote: '고난을 부정하거나 경시하지 않으면서도, 그 고난보다 더 큰 빛이 있음을 선포해야 한다. 위로는 진실해야 한다.',
    },
    {
      id: 'app-4',
      point: '"태초에"의 의미를 창조와 새 삶의 시작으로 연결 — 세례 교육, 새가족 환영에 활용',
      audienceTag: '새가족 · 교육부',
      pastoralNote: '새로운 시작을 앞둔 이들에게 이 본문은 "하나님이 당신의 이야기를 시작하신다"는 선포가 될 수 있다.',
    },
  ],
  deliveryIntro: '익숙한 본문일수록 가장 신선하게 전해야 한다. "태초에 말씀이 계시니라" — 이 구절을 한 번도 들어본 적이 없는 사람처럼, 그러나 평생 붙들어 온 사람의 무게로 선포할 것. 도입에서 너무 많은 설명을 하지 말고, 본문의 장엄함이 스스로 말하게 하라.',
  deliveryFlow: '선재성(1-2절) → 창조와 생명(3-4절) → 빛과 어둠의 긴장(5절)으로 전개. 각 대지는 이전 대지의 긴장을 다음 대지가 해소하는 방식으로 연결. 특히 3-4절에서 "생명"과 "빛"의 연결은 요한 신학의 핵심이므로 충분히 무게를 두고 전개할 것.',
  deliveryTransitions: [
    '도입 → 1대지: "이 말씀이 오늘 우리에게 무엇을 말하는지 함께 살펴보겠습니다"',
    '1대지 → 2대지: "그런데 이 말씀, 이 로고스가 우리와 무슨 상관이 있을까요?"',
    '2대지 → 3대지: "생명의 근원이신 그분이 이 땅에 찾아오셨습니다. 그런데 세상은 어떻게 반응했을까요?"',
    '3대지 → 결론: "이 빛이 오늘도 비추고 있습니다. 그리고 그 빛은 결코 꺼지지 않습니다"',
  ],
  deliveryConclusion: '회중이 다시 그리스도를 생명의 주로 바라보게 하는 초청으로 마무리할 것. 결론은 새로운 정보를 추가하지 말고, 선포된 말씀이 회중의 삶을 어떻게 변화시킬지 선언하는 형태로. 요한 1:14(말씀이 육신이 되어)로 자연스럽게 연결되는 시사점을 남길 것.',
  prepStatus: 'draft',
}

/* ─── Required section keys for progress ─── */

const REQUIRED_FIELDS: Record<SectionId, (keyof PrepData | string)[]> = {
  direction: ['coreMessage', 'sermonPurpose'],
  passage: ['passageStructure', 'researchInsights'],
  outline: ['outlines'],
  application: ['applicationPoints'],
  delivery: ['deliveryFlow', 'deliveryConclusion'],
}

export default function PrepTab({ project }: Props) {
  const router = useRouter()
  const [prepData, setPrepData] = useState<PrepData>(JOHN_PREP_DATA)
  const [activeSection, setActiveSection] = useState<SectionId | null>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const scrollToSection = useCallback((id: SectionId) => {
    setActiveSection(id)
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const updateField = useCallback(<K extends keyof PrepData>(key: K, value: PrepData[K]) => {
    setPrepData(prev => ({ ...prev, [key]: value }))
  }, [])

  const updateOutline = useCallback((id: string, field: keyof PrepOutline, value: string) => {
    setPrepData(prev => ({
      ...prev,
      outlines: prev.outlines.map(o => o.id === id ? { ...o, [field]: value } : o),
    }))
  }, [])

  const updateApplication = useCallback((id: string, field: keyof ApplicationPoint, value: string) => {
    setPrepData(prev => ({
      ...prev,
      applicationPoints: prev.applicationPoints.map(a => a.id === id ? { ...a, [field]: value } : a),
    }))
  }, [])

  /* ─── Progress calculation ─── */

  const sectionProgress = useMemo(() => {
    const result: Record<SectionId, { filled: number; total: number; done: boolean }> = {} as any
    for (const [sectionId, fields] of Object.entries(REQUIRED_FIELDS)) {
      const sid = sectionId as SectionId
      const total = fields.length
      const filled = fields.filter(f => {
        const val = (prepData as any)[f]
        if (Array.isArray(val)) return val.length > 0
        if (typeof val === 'string') return val.trim().length > 0
        return val != null
      }).length
      result[sid] = { filled, total, done: filled >= total }
    }
    return result
  }, [prepData])

  const overallProgress = useMemo(() => {
    const all = Object.values(sectionProgress)
    const total = all.reduce((s, x) => s + x.total, 0)
    const filled = all.reduce((s, x) => s + x.filled, 0)
    return Math.round((filled / total) * 100)
  }, [sectionProgress])

  const allRequiredDone = useMemo(() =>
    Object.values(sectionProgress).every(x => x.done),
    [sectionProgress]
  )

  const totalOutlineWords = useMemo(() =>
    prepData.outlines.reduce((sum, o) => sum + o.description.replace(/\s/g, '').length, 0),
    [prepData.outlines],
  )

  const lastSavedDisplay = '오전 11:24'

  return (
    <div className="flex flex-col h-full">
      {/* ─── Project Context ─── */}
      <ProjectContextRow
        project={project}
        currentStage="prep"
        stageStatus={{ study: 'done', prep: 'progress', manuscript: 'empty' }}
        lastSaved={lastSavedDisplay}
      />

      {/* ─── Prep Context Header ─── */}
      <PrepContextHeader
        project={project}
        prepStatus={prepData.prepStatus}
        overallProgress={overallProgress}
        allRequiredDone={allRequiredDone}
        lastSaved={lastSavedDisplay}
        onGoToStudy={() => router.push(`/advanced/projects/${project.id}?tab=study`)}
        onGoToManuscript={() => router.push(`/advanced/projects/${project.id}?tab=manuscript`)}
      />

      <div className="flex flex-1 min-h-0 border-t border-white/5">
        {/* ─── Left: Section Navigator ─── */}
        <PrepNavigator
          sectionProgress={sectionProgress}
          activeSection={activeSection}
          onNavigate={scrollToSection}
          overallProgress={overallProgress}
        />

        {/* ─── Center: Main Prep Content ─── */}
        <div className="flex-1 overflow-y-auto scrollbar-thin bg-[#04060f]/60">
          <div className="max-w-[720px] mx-auto p-8 space-y-10">

            {/* Section: 설교 방향 */}
            <DirectionSection
              data={prepData}
              sectionRef={el => { sectionRefs.current['direction'] = el }}
              isActive={activeSection === 'direction'}
              onActivate={() => setActiveSection('direction')}
              onUpdate={updateField}
            />

            {/* Section: 본문 핵심 흐름 */}
            <PassageFlowSection
              data={prepData}
              sectionRef={el => { sectionRefs.current['passage'] = el }}
              isActive={activeSection === 'passage'}
              onActivate={() => setActiveSection('passage')}
              onUpdate={updateField}
              onGoToStudy={() => router.push(`/advanced/projects/${project.id}?tab=study`)}
            />

            {/* Section: 대지 구조 */}
            <OutlineSection
              outlines={prepData.outlines}
              sectionRef={el => { sectionRefs.current['outline'] = el }}
              isActive={activeSection === 'outline'}
              onActivate={() => setActiveSection('outline')}
              onUpdate={updateOutline}
            />

            {/* Section: 적용과 회중 연결 */}
            <ApplicationSection
              points={prepData.applicationPoints}
              sectionRef={el => { sectionRefs.current['application'] = el }}
              isActive={activeSection === 'application'}
              onActivate={() => setActiveSection('application')}
              onUpdate={updateApplication}
            />

            {/* Section: 전달 흐름 */}
            <DeliverySection
              data={prepData}
              sectionRef={el => { sectionRefs.current['delivery'] = el }}
              isActive={activeSection === 'delivery'}
              onActivate={() => setActiveSection('delivery')}
              onUpdate={updateField}
            />

            {/* ─── 준비 이력 ─── */}
            <div className="pt-4">
              <PrepVersionHistory versions={PREP_VERSIONS} />
            </div>

            {/* ─── 최근 작업 활동 ─── */}
            <RecentPrepActivity />

            <div className="h-16" />
          </div>
        </div>
      </div>

      {/* ─── Footer Status Bar ─── */}
      <PrepStatusBar
        overallProgress={overallProgress}
        allRequiredDone={allRequiredDone}
        prepStatus={prepData.prepStatus}
        outlineCount={prepData.outlines.length}
        appCount={prepData.applicationPoints.length}
        totalOutlineWords={totalOutlineWords}
        onGoToStudy={() => router.push(`/advanced/projects/${project.id}?tab=study`)}
        onGoToManuscript={() => router.push(`/advanced/projects/${project.id}?tab=manuscript`)}
      />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ════════════════════════════════════════════════════════════ */

/* ─── Prep Context Header ─── */

function PrepContextHeader({
  project, prepStatus, overallProgress, allRequiredDone, lastSaved,
  onGoToStudy, onGoToManuscript,
}: {
  project: ProjectDetail
  prepStatus: string
  overallProgress: number
  allRequiredDone: boolean
  lastSaved: string
  onGoToStudy: () => void
  onGoToManuscript: () => void
}) {
  return (
    <div className="bg-[#04060f]/60 border-b border-white/5 px-6 py-4 shrink-0">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">설교 준비</h2>
              <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${PREP_STATUS_COLORS[prepStatus] || 'bg-white/5 text-slate-200'}`}>
                {PREP_STATUS_LABELS[prepStatus] || prepStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400">연구에서 정리한 내용을 설교 흐름으로 세워가는 단계입니다</p>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-slate-200 font-medium">{project.title}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">{project.passage}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">{project.seriesName}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-500">마지막 수정: {lastSaved}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onGoToStudy}
              className="text-xs border border-white/5 hover:border-teal-500/30 text-slate-400 hover:text-teal-300 px-3 py-1.5 rounded-xl transition-colors"
            >
              연구 내용 다시 보기
            </button>
            <button
              onClick={onGoToManuscript}
              disabled={!allRequiredDone}
              className={`text-xs px-3 py-1.5 rounded-xl transition-colors font-medium ${
                allRequiredDone
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-white/5 text-slate-500 cursor-not-allowed'
              }`}
            >
              설교 작성으로 이어가기
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${allRequiredDone ? 'bg-indigo-600' : 'bg-amber-400'}`}
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <span className={`text-[10px] font-medium ${allRequiredDone ? 'text-indigo-400' : 'text-amber-300'}`}>
            준비도 {overallProgress}%
          </span>
        </div>
        {allRequiredDone && (
          <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-indigo-400">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>작성 단계로 넘어갈 준비가 되었습니다 — 대지 구조와 적용 포인트가 정리되었습니다</span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Prep Navigator ─── */

function PrepNavigator({
  sectionProgress, activeSection, onNavigate, overallProgress,
}: {
  sectionProgress: Record<SectionId, { filled: number; total: number; done: boolean }>
  activeSection: SectionId | null
  onNavigate: (id: SectionId) => void
  overallProgress: number
}) {
  const sections: { id: SectionId; label: string }[] = [
    { id: 'direction', label: '설교 방향' },
    { id: 'passage', label: '본문 핵심 흐름' },
    { id: 'outline', label: '대지 구조' },
    { id: 'application', label: '적용과 회중 연결' },
    { id: 'delivery', label: '전달 흐름' },
  ]

  return (
    <aside className="w-52 border-r border-white/5 bg-[#04060f]/60 flex flex-col shrink-0 overflow-y-auto scrollbar-thin">
      <div className="p-4 border-b border-white/5">
        <AppSectionHeader title="준비 단계" count={`${overallProgress}%`} />
        <div className="adv-progress-bar h-1 mt-2">
          <div
            className={`adv-progress-fill h-full rounded-full transition-all duration-500 ${overallProgress === 100 ? 'bg-indigo-600' : 'bg-amber-400'}`}
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>
      <div className="p-2 space-y-0.5">
        {sections.map(({ id, label }) => {
          const prog = sectionProgress[id]
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-colors ${
                activeSection === id
                  ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                  : 'text-slate-200 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  prog.done ? 'bg-indigo-600' : prog.filled > 0 ? 'bg-amber-400' : 'bg-slate-600'
                }`} />
                <span className="flex-1 truncate">{label}</span>
                <span className={`text-[9px] ${prog.done ? 'text-indigo-400' : 'text-slate-500'}`}>
                  {prog.filled}/{prog.total}
                </span>
              </div>
            </button>
          )
        })}
      </div>
      <div className="mt-auto p-4 border-t border-white/5">
        <div className="text-[10px] text-slate-500 leading-relaxed">
          <p>필수 항목을 모두 채우면</p>
          <p>작성 단계로 넘어갈 수 있습니다</p>
        </div>
      </div>
    </aside>
  )
}

/* ─── Direction Section ─── */

function DirectionSection({
  data, sectionRef, isActive, onActivate, onUpdate,
}: {
  data: PrepData
  sectionRef: (el: HTMLDivElement | null) => void
  isActive: boolean
  onActivate: () => void
  onUpdate: <K extends keyof PrepData>(key: K, value: PrepData[K]) => void
}) {
  return (
    <div ref={sectionRef} onClick={onActivate}
      className={`border-l-4 border-l-indigo-500 pl-5 ${isActive ? 'bg-indigo-500/[0.07] -mx-5 px-5 py-4 rounded-xl' : ''}`}>
      <div className="flex items-center gap-2 mb-5">
        <span className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-bold flex items-center justify-center">1</span>
        <h3 className="text-base font-semibold text-white">설교 방향</h3>
        <span className="text-[10px] text-slate-500 ml-auto">설교 전체를 묶는 중심축입니다</span>
      </div>

      <div className="space-y-4">
        {/* Sermon Title */}
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">설교 제목 (가안)</label>
          <input
            value={data.sermonTitle}
            onChange={e => onUpdate('sermonTitle', e.target.value)}
            className="w-full text-sm font-serif font-medium text-white bg-[#04060f]/60 rounded-xl border border-white/5 px-4 py-2.5 outline-none focus:border-indigo-500/30 focus:bg-[#04060f]/60 transition-colors"
            placeholder="설교 제목을 적어보세요 (확정되지 않아도 괜찮습니다)"
          />
        </div>

        {/* Core Message */}
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">중심명제</label>
          <textarea
            value={data.coreMessage}
            onChange={e => onUpdate('coreMessage', e.target.value)}
            className="w-full min-h-[72px] text-sm font-serif text-slate-100 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 outline-none resize-none focus:border-amber-500/30 focus:bg-[#04060f]/60 transition-colors leading-relaxed"
            placeholder="이 설교를 듣는 회중이 기억해야 할 한 문장은 무엇인가요?"
            rows={2}
          />
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] text-amber-300">설교 전체를 관통하는 핵심 명제를 한 문장으로 정리하세요</span>
            <span className="text-[10px] text-slate-500">{data.coreMessage.length}자</span>
          </div>
        </div>

        {/* Sermon Purpose & Expected Response */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">설교 목적</label>
            <textarea
              value={data.sermonPurpose}
              onChange={e => onUpdate('sermonPurpose', e.target.value)}
              className="w-full min-h-[80px] text-xs text-slate-200 bg-[#04060f]/60 rounded-xl border border-white/5 p-3 outline-none resize-none focus:border-indigo-500/30 focus:bg-[#04060f]/60 transition-colors leading-relaxed"
              placeholder="이 설교를 통해 회중이 무엇을 깨닫고 결단하게 하려는가?"
              rows={3}
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">기대 반응</label>
            <textarea
              value={data.expectedResponse}
              onChange={e => onUpdate('expectedResponse', e.target.value)}
              className="w-full min-h-[80px] text-xs text-slate-200 bg-[#04060f]/60 rounded-xl border border-white/5 p-3 outline-none resize-none focus:border-indigo-500/30 focus:bg-[#04060f]/60 transition-colors leading-relaxed"
              placeholder="회중이 이 말씀을 듣고 어떻게 반응하기를 기대하는가?"
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Passage Flow Section ─── */

function PassageFlowSection({
  data, sectionRef, isActive, onActivate, onUpdate, onGoToStudy,
}: {
  data: PrepData
  sectionRef: (el: HTMLDivElement | null) => void
  isActive: boolean
  onActivate: () => void
  onUpdate: <K extends keyof PrepData>(key: K, value: PrepData[K]) => void
  onGoToStudy?: () => void
}) {
  return (
    <div ref={sectionRef} onClick={onActivate}
      className={`border-l-4 border-l-teal-400 pl-5 ${isActive ? 'bg-teal-500/10 -mx-5 px-5 py-4 rounded-xl' : ''}`}>
      <div className="flex items-center gap-2 mb-5">
        <span className="w-6 h-6 rounded-full bg-teal-500/10 text-teal-300 text-xs font-bold flex items-center justify-center">2</span>
        <h3 className="text-base font-semibold text-white">본문 핵심 흐름</h3>
        <span className="text-[10px] text-slate-500 ml-auto">연구에서 확인한 핵심을 설교를 위해 선별합니다</span>
      </div>

      {/* Research Connection Banner */}
      <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-3 mb-5">
        <div className="flex items-center gap-1.5 mb-2">
          <svg className="w-3.5 h-3.5 text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-[10px] font-semibold text-teal-300 uppercase tracking-widest">연구에서 가져온 내용</span>
        </div>
        <div className="space-y-1 text-[11px] text-teal-300 leading-relaxed">
          <p>본문 구조: 요한 1:1-5 — 말씀의 선재성(1-2절) → 창조와 생명(3-4절) → 빛과 어둠의 긴장(5절)</p>
          <p>핵심 원어: λόγος(말씀), ζωή(생명), φῶς(빛), σκοτία(어둠) — 각 단어의 문맥적 의미가 연구에서 확인됨</p>
          <p>반복 주제: 말씀·생명·빛·어둠 — 창세기 1장의 새 창조 맥락</p>
        </div>
        <button
          onClick={onGoToStudy}
          className="mt-2 text-[10px] text-teal-300 hover:text-teal-300 underline underline-offset-2 transition-colors"
        >
          연구 내용 다시 보기 →
        </button>
      </div>

      <div className="space-y-4">
        {/* Passage Structure */}
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">본문 구조 요약</label>
          <textarea
            value={data.passageStructure}
            onChange={e => onUpdate('passageStructure', e.target.value)}
            className="w-full min-h-[80px] text-sm text-slate-100 bg-[#04060f]/60 rounded-xl border border-white/5 p-4 outline-none resize-none focus:border-teal-500/30 focus:bg-[#04060f]/60 transition-colors leading-relaxed font-serif"
            rows={3}
          />
        </div>

        {/* Context Points */}
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 block">문맥 포인트</label>
          <div className="space-y-1.5">
            {data.contextPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                <input
                  value={point}
                  onChange={e => {
                    const next = [...data.contextPoints]
                    next[i] = e.target.value
                    onUpdate('contextPoints', next)
                  }}
                  className="flex-1 text-xs text-slate-200 bg-transparent border-none outline-none py-0.5"
                />
              </div>
            ))}
            <button
              onClick={() => onUpdate('contextPoints', [...data.contextPoints, ''])}
              className="text-[10px] text-teal-300 hover:text-teal-300 mt-1 transition-colors"
            >
              + 문맥 포인트 추가
            </button>
          </div>
        </div>

        {/* Key Words */}
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 block">핵심 단어 / 원어</label>
          <div className="space-y-2">
            {data.keyWords.map((kw, i) => (
              <div key={i} className="bg-[#04060f]/60 rounded-xl border border-white/5 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-slate-100 font-greek">{kw.word}</span>
                  <span className="text-[10px] text-slate-500">·</span>
                  <span className="text-[11px] text-slate-400">{kw.meaning}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{kw.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Research Insights */}
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 block">연구 통찰 요약</label>
          <div className="space-y-1.5">
            {data.researchInsights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                <svg className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <textarea
                  value={insight}
                  onChange={e => {
                    const next = [...data.researchInsights]
                    next[i] = e.target.value
                    onUpdate('researchInsights', next)
                  }}
                  className="flex-1 text-xs text-slate-200 bg-transparent border-none outline-none resize-none leading-relaxed"
                  rows={2}
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => onUpdate('researchInsights', [...data.researchInsights, ''])}
            className="text-[10px] text-teal-300 hover:text-teal-300 mt-1 transition-colors"
          >
            + 통찰 추가
          </button>
        </div>

        {/* Link to Study */}
        <div className="text-right">
          <button
            onClick={onGoToStudy}
            className="text-[10px] text-teal-300 hover:text-teal-300 border border-teal-500/20 hover:border-teal-500/30 px-3 py-1.5 rounded transition-colors"
          >
            연구 전체 보기
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Outline Section ─── */

function OutlineSection({
  outlines, sectionRef, isActive, onActivate, onUpdate,
}: {
  outlines: PrepOutline[]
  sectionRef: (el: HTMLDivElement | null) => void
  isActive: boolean
  onActivate: () => void
  onUpdate: (id: string, field: keyof PrepOutline, value: string) => void
}) {
  return (
    <div ref={sectionRef} onClick={onActivate}
      className={`border-l-4 border-l-amber-400 pl-5 ${isActive ? 'bg-amber-500/10 -mx-5 px-5 py-4 rounded-xl' : ''}`}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold flex items-center justify-center">3</span>
          <h3 className="text-base font-semibold text-white">대지 구조</h3>
        </div>
        <span className="text-xs text-slate-500">{outlines.length}개 대지</span>
      </div>

      <div className="space-y-5">
        {outlines.map((outline, i) => (
          <div key={outline.id} className="bg-[#04060f]/60 rounded-xl border border-white/5 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2.5 px-4 py-3 bg-[#04060f]/60 border-b border-white/5">
              <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <input
                value={outline.title}
                onChange={e => onUpdate(outline.id, 'title', e.target.value)}
                className="flex-1 text-sm font-medium text-white bg-transparent border-none outline-none"
                placeholder="대지 제목"
              />
              <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded">{outline.relatedVerse}</span>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1 block">설명</label>
                <textarea
                  value={outline.description}
                  onChange={e => onUpdate(outline.id, 'description', e.target.value)}
                  className="w-full text-xs text-slate-200 bg-[#04060f]/60 rounded-xl border border-white/5 p-3 outline-none resize-none focus:border-amber-500/30 transition-colors leading-relaxed"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1 block">관련 절</label>
                <input
                  value={outline.relatedVerse}
                  onChange={e => onUpdate(outline.id, 'relatedVerse', e.target.value)}
                  className="w-full text-xs text-slate-200 bg-[#04060f]/60 rounded-xl border border-white/5 px-3 py-1.5 outline-none focus:border-amber-500/30 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1 block">적용 메모</label>
                  <textarea
                    value={outline.applicationNote}
                    onChange={e => onUpdate(outline.id, 'applicationNote', e.target.value)}
                    className="w-full text-[10px] text-slate-400 bg-[#04060f]/60 rounded-xl border border-white/5 p-2 outline-none resize-none focus:border-indigo-500/30 transition-colors leading-relaxed"
                    rows={2}
                    placeholder="이 대지를 통해 회중이 받을 적용"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1 block">전환 메모</label>
                  <textarea
                    value={outline.transitionNote}
                    onChange={e => onUpdate(outline.id, 'transitionNote', e.target.value)}
                    className="w-full text-[10px] text-slate-400 bg-[#04060f]/60 rounded-xl border border-white/5 p-2 outline-none resize-none focus:border-blue-500/30 transition-colors leading-relaxed"
                    rows={2}
                    placeholder="다음 대지로의 연결"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Application Section ─── */

function ApplicationSection({
  points, sectionRef, isActive, onActivate, onUpdate,
}: {
  points: ApplicationPoint[]
  sectionRef: (el: HTMLDivElement | null) => void
  isActive: boolean
  onActivate: () => void
  onUpdate: (id: string, field: keyof ApplicationPoint, value: string) => void
}) {
  return (
    <div ref={sectionRef} onClick={onActivate}
      className={`border-l-4 border-l-blue-400 pl-5 ${isActive ? 'bg-blue-500/10 -mx-5 px-5 py-4 rounded-xl' : ''}`}>
      <div className="flex items-center gap-2 mb-5">
        <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-300 text-xs font-bold flex items-center justify-center">4</span>
        <h3 className="text-base font-semibold text-white">적용과 회중 연결</h3>
        <span className="text-[10px] text-slate-500 ml-auto">말씀이 오늘의 회중에게 어떻게 들려야 하는가</span>
      </div>

      <div className="space-y-3">
        {points.map((app, i) => (
          <div key={app.id} className="bg-[#04060f]/60 rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-300 text-[10px] font-medium flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <input
                value={app.audienceTag}
                onChange={e => onUpdate(app.id, 'audienceTag', e.target.value)}
                className="text-[10px] font-medium text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded px-2 py-0.5 outline-none focus:border-blue-500/30"
              />
            </div>
            <textarea
              value={app.point}
              onChange={e => onUpdate(app.id, 'point', e.target.value)}
              className="w-full text-sm text-slate-100 bg-transparent border-none outline-none resize-none leading-relaxed font-serif"
              rows={2}
            />
            <div className="mt-2 pt-2 border-t border-white/5">
              <div className="flex items-start gap-1.5">
                <svg className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <textarea
                  value={app.pastoralNote}
                  onChange={e => onUpdate(app.id, 'pastoralNote', e.target.value)}
                  className="flex-1 text-[10px] text-slate-400 bg-transparent border-none outline-none resize-none leading-relaxed"
                  rows={2}
                  placeholder="목회적 분별 메모..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Delivery Section ─── */

function DeliverySection({
  data, sectionRef, isActive, onActivate, onUpdate,
}: {
  data: PrepData
  sectionRef: (el: HTMLDivElement | null) => void
  isActive: boolean
  onActivate: () => void
  onUpdate: <K extends keyof PrepData>(key: K, value: PrepData[K]) => void
}) {
  return (
    <div ref={sectionRef} onClick={onActivate}
      className={`border-l-4 border-l-purple-400 pl-5 ${isActive ? 'bg-purple-500/10 -mx-5 px-5 py-4 rounded-xl' : ''}`}>
      <div className="flex items-center gap-2 mb-5">
        <span className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-300 text-xs font-bold flex items-center justify-center">5</span>
        <h3 className="text-base font-semibold text-white">전달 흐름</h3>
        <span className="text-[10px] text-slate-500 ml-auto">원고가 아닌 전달 설계입니다</span>
      </div>

      <div className="space-y-4">
        {/* Introduction */}
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">도입 방향</label>
          <textarea
            value={data.deliveryIntro}
            onChange={e => onUpdate('deliveryIntro', e.target.value)}
            className="w-full min-h-[72px] text-sm text-slate-100 bg-[#04060f]/60 rounded-xl border border-white/5 p-4 outline-none resize-none focus:border-purple-500/30 focus:bg-[#04060f]/60 transition-colors leading-relaxed font-serif italic"
            rows={3}
          />
        </div>

        {/* Flow */}
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">전개 흐름</label>
          <textarea
            value={data.deliveryFlow}
            onChange={e => onUpdate('deliveryFlow', e.target.value)}
            className="w-full min-h-[72px] text-sm text-slate-100 bg-[#04060f]/60 rounded-xl border border-white/5 p-4 outline-none resize-none focus:border-purple-500/30 focus:bg-[#04060f]/60 transition-colors leading-relaxed"
            rows={3}
          />
        </div>

        {/* Transitions */}
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 block">전환 지점</label>
          <div className="space-y-2">
            {data.deliveryTransitions.map((t, i) => (
              <div key={i} className="flex items-start gap-2 bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
                <span className="text-[10px] text-purple-500 font-medium w-16 shrink-0 mt-0.5">
                  {i === 0 ? '도입→1' : i === data.deliveryTransitions.length - 1 ? `${i}→결론` : `${i}→${i + 1}`}
                </span>
                <textarea
                  value={t}
                  onChange={e => {
                    const next = [...data.deliveryTransitions]
                    next[i] = e.target.value
                    onUpdate('deliveryTransitions', next)
                  }}
                  className="flex-1 text-xs text-slate-200 bg-transparent border-none outline-none resize-none leading-relaxed"
                  rows={2}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Conclusion */}
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">마무리 방향</label>
          <textarea
            value={data.deliveryConclusion}
            onChange={e => onUpdate('deliveryConclusion', e.target.value)}
            className="w-full min-h-[72px] text-sm text-slate-100 bg-[#04060f]/60 rounded-xl border border-white/5 p-4 outline-none resize-none focus:border-purple-300 focus:bg-[#04060f]/60 transition-colors leading-relaxed font-serif"
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}

/* ─── Recent Prep Activity ─── */

function RecentPrepActivity() {
  return (
    <div className="bg-[#04060f]/60 rounded-xl border border-white/5 overflow-hidden">
      <div className="px-5 py-3 border-b border-white/5 bg-[#04060f]/60">
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">최근 작업</span>
        </div>
      </div>
      <div className="divide-y divide-white/5">
        {RECENT_ACTIVITY.map((entry, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-2.5">
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              entry.section === 'prep' ? 'bg-amber-400' :
              entry.section === 'manuscript' ? 'bg-indigo-400' :
              'bg-teal-400'
            }`} />
            <span className="text-[10px] text-slate-500 w-14 shrink-0 font-mono">{entry.time}</span>
            <span className="text-xs text-slate-200 flex-1">{entry.description}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
              entry.section === 'prep' ? 'bg-amber-500/10 text-amber-300' :
              entry.section === 'manuscript' ? 'bg-indigo-500/10 text-indigo-300' :
              'bg-teal-500/10 text-teal-300'
            }`}>
              {entry.section === 'prep' ? '준비' : entry.section === 'manuscript' ? '작성' : '연구'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Prep Status Bar ─── */

function PrepStatusBar({
  overallProgress, allRequiredDone, prepStatus,
  outlineCount, appCount, totalOutlineWords,
  onGoToStudy, onGoToManuscript,
}: {
  overallProgress: number
  allRequiredDone: boolean
  prepStatus: string
  outlineCount: number
  appCount: number
  totalOutlineWords: number
  onGoToStudy: () => void
  onGoToManuscript: () => void
}) {
  return (
    <div className="bg-[#04060f]/60 border-t border-white/5 px-5 py-2.5 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${allRequiredDone ? 'bg-indigo-400' : 'bg-amber-400'}`} />
          준비도 <span className={`font-semibold ${allRequiredDone ? 'text-indigo-400' : 'text-amber-300'}`}>{overallProgress}%</span>
        </span>
        <span>대지 {outlineCount}개</span>
        <span>적용 {appCount}건</span>
        <span>대지 본문 {totalOutlineWords.toLocaleString()}자</span>
        <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded">
          준비 이력 {PREP_VERSIONS.length}개
        </span>
        {allRequiredDone && (
          <span className="text-indigo-400 font-bold">작성으로 넘길 준비가 되었습니다</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onGoToStudy}
          className="text-[11px] text-slate-400 hover:text-slate-100 border border-white/5 hover:border-white/5 rounded-xl px-3 py-1.5 transition-colors"
        >
          ← 연구로 돌아가기
        </button>
        <button
          onClick={onGoToManuscript}
          disabled={!allRequiredDone}
          className={`text-[11px] rounded-xl px-3 py-1.5 transition-colors font-medium ${
            allRequiredDone
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-white/5 text-slate-500 cursor-not-allowed'
          }`}
        >
          이 구조로 원고 쓰기 →
        </button>
      </div>
    </div>
  )
}
