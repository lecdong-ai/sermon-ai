export type NoteType = 'insight' | 'research' | 'application' | 'question' | 'pastoral' | 'illustration' | 'warning'

export type NoteConnectionType = 'passage' | 'theme' | 'word' | 'project' | 'series'

export interface NoteConnection {
  type: NoteConnectionType
  label: string
  id: string
}

export interface NoteEntry {
  id: string
  type: NoteType
  title: string
  content: string
  summary: string
  tags: string[]
  starred: boolean
  pinned: boolean
  connections: NoteConnection[]
  projectIds: string[]
  archiveIds: string[]
  createdAt: string
  updatedAt: string
  lastReferencedAt: string | null
  referenceCount: number
}

export const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  insight: '통찰',
  research: '연구 메모',
  application: '적용 아이디어',
  question: '질문',
  pastoral: '목회적 관찰',
  illustration: '예화 후보',
  warning: '경고 메모',
}

export const NOTE_TYPE_DESCRIPTIONS: Record<NoteType, string> = {
  insight: '핵심 진술형 통찰. 본문의 신학적, 구조적, 언어적 깊이를 꿰뚫는 요점',
  research: '깊이 있는 연구 기록. 원어 분석, 주석사, 신학적 배경 탐구',
  application: '설교 적용 아이디어. 회중의 삶과 연결되는 구체적인 실천 방안',
  question: '열린 질문. 설교 전에 생각해볼 문제, 더 연구가 필요한 지점',
  pastoral: '목회적 관찰. 회중의 상황과 설교의 접점에 대한 통찰',
  illustration: '예화/이야기 후보. 본문을 설명할 수 있는 구체적 이미지나 사례',
  warning: '설교 경고. 설교에서 피해야 할 함정, 주의할 표현, 신학적 위험',
}

export const NOTE_TYPE_COLORS: Record<NoteType, string> = {
  insight: 'bg-emerald-100 text-emerald-700',
  research: 'bg-blue-100 text-blue-700',
  application: 'bg-violet-100 text-violet-700',
  question: 'bg-amber-100 text-amber-700',
  pastoral: 'bg-rose-100 text-rose-700',
  illustration: 'bg-cyan-100 text-cyan-700',
  warning: 'bg-red-100 text-red-700',
}

export const NOTE_TYPE_DOTS: Record<NoteType, string> = {
  insight: 'bg-emerald-500',
  research: 'bg-blue-500',
  application: 'bg-violet-500',
  question: 'bg-amber-500',
  pastoral: 'bg-rose-500',
  illustration: 'bg-cyan-500',
  warning: 'bg-red-500',
}

export const NOTE_TYPES: NoteType[] = ['insight', 'research', 'application', 'question', 'pastoral', 'illustration', 'warning']

export const NOTES: NoteEntry[] = [
  // ── INSIGHT NOTES (3) ──
  {
    id: 'note-insight-1',
    type: 'insight',
    title: '요한의 로고스는 창세기적 언어로 읽어야 한다',
    content: '요한복음 서두(1:1-5)는 창세기 1장의 창조 언어를 의도적으로 차용한다. "태초에(Ἐν ἀρχῇ)"는 창세기 1:1의 LXX 번역과 정확히 일치하며, "말씀(λόγος)"은 창세기에서 말씀으로 창조하시는 하나님을 인격적으로 발전시킨다. 중요한 것은 요한이 단순히 창세기를 인용하는 것이 아니라, 창세기의 창조를 "그리스도 중심적으로" 재해석한다는 점이다. "만물이 그로 말미암아 지은 바 되었다"(3절)는 창조의 중보자로서의 그리스도를 선언한다. 설교에서 이 연결을 보여줄 때 회중은 구약과 신약이 분리된 책이 아니라 하나의 구원사를 이루고 있음을 깨닫게 된다.',
    summary: '요한의 프롤로그는 창세기 1장을 그리스도 중심으로 재해석한다. "태초에"와 "말씀"의 창세기적 뿌리를 설교에서 드러내야 한다.',
    tags: ['로고스', '창세기', '기독론'],
    starred: true,
    pinned: true,
    connections: [
      { type: 'passage', label: '요한복음 1:1-5', id: 'passage-john1' },
      { type: 'passage', label: '창세기 1:1-5', id: 'passage-gen1' },
      { type: 'theme', label: '말씀', id: 'theme-word' },
      { type: 'word', label: 'λόγος', id: 'word-logos' },
    ],
    projectIds: ['proj-john1'],
    archiveIds: [],
    createdAt: '2026-06-08T09:15:00Z',
    updatedAt: '2026-06-10T11:30:00Z',
    lastReferencedAt: '2026-06-10T11:30:00Z',
    referenceCount: 3,
  },
  {
    id: 'note-insight-2',
    type: 'insight',
    title: '빛과 생명의 순서에 주목하라',
    content: '요한복음 1:4에서 "그 안에 생명이 있었고 그 생명은 사람들의 빛이라"는 순서가 중요하다. 생명(ζωή)이 먼저 제시되고, 그 생명이 빛(φῶς)이 된다. 이는 단순한 수사적 배열이 아니라 신학적 순서다. 그리스도 안에 있는 생명이 먼저요, 그 생명이 비출 때 비로소 빛이 된다. 우리는 먼저 그리스도 안에서 생명을 받고, 그 생명이 우리를 통해 빛으로 드러난다. "너희는 세상의 빛이라"(마 5:14)는 말씀도 같은 구조다. 자체 발광이 아니라 생명에서 비롯된 빛이다. 이 통찰은 "그리스도인의 정체성은 행함이 아니라 존재함에서 비롯된다"는 설교 포인트로 발전시킬 수 있다.',
    summary: '요한복음 1:4는 생명→빛의 순서로, 그리스도인의 정체성이 행함이 아닌 생명에서 비롯됨을 암시한다.',
    tags: ['빛', '생명', '정체성'],
    starred: true,
    pinned: false,
    connections: [
      { type: 'passage', label: '요한복음 1:4', id: 'passage-john1' },
      { type: 'theme', label: '생명', id: 'theme-life' },
      { type: 'theme', label: '빛', id: 'theme-light' },
    ],
    projectIds: ['proj-john1'],
    archiveIds: [],
    createdAt: '2026-06-07T14:20:00Z',
    updatedAt: '2026-06-09T16:00:00Z',
    lastReferencedAt: '2026-06-09T16:00:00Z',
    referenceCount: 2,
  },
  {
    id: 'note-insight-3',
    type: 'insight',
    title: '롬 8장의 "성령의 법"은 새로운 창조 질서다',
    content: '바울이 롬 8:2에서 "성령의 법(ὁ νόμος τοῦ πνεύματος)"이라는 표현을 사용한 것은 매우 의도적이다. 율법(νόμος)이라는 단어를 사용하면서도, 그것이 더 이상 모세의 율법이 아니라 성령의 새로운 질서임을 선언한다. 이 "법"은 더 이상 문자에 기록된 법이 아니라, 성령께서 내주하심으로써 성도 안에 내재화된 새로운 원리다. 에스겔 36:26-27의 "새 영을 너희 속에 두고... 내 영을 너희 속에 두어"의 성취다. 설교에서 "율법은 밖에서 요구하고, 성령은 안에서 능력을 주신다"는 대조를 분명히 해야 한다.',
    summary: '롬 8:2의 "성령의 법"은 에스겔의 새 언약 약속의 성취로서, 내재화된 새로운 창조 질서를 의미한다.',
    tags: ['성령의 법', '새창조', '내주'],
    starred: false,
    pinned: true,
    connections: [
      { type: 'passage', label: '로마서 8:1-4', id: 'passage-rom8' },
      { type: 'theme', label: '성령', id: 'theme-spirit' },
      { type: 'theme', label: '자유', id: 'theme-freedom' },
    ],
    projectIds: ['proj-current'],
    archiveIds: ['archive-romans-8'],
    createdAt: '2026-06-06T10:00:00Z',
    updatedAt: '2026-06-10T08:45:00Z',
    lastReferencedAt: '2026-06-10T08:45:00Z',
    referenceCount: 4,
  },

  // ── RESEARCH NOTES (3) ──
  {
    id: 'note-research-1',
    type: 'research',
    title: 'λόγος의 헬라적·히브리적 배경',
    content: '요한복음의 λόγος 개념을 이해하려면 두 가지 배경이 필요하다:\n\n1. 헬라적 배경: 헤라클레이토스는 λόγος를 우주의 이법(理法)으로 보았고, 스토아 철학은 λόγος를 만물에 내재한 신적 이성으로 이해했다. 필로는 λόγος를 하나님과 세계 사이의 중간자(mediator)로 개념화했다.\n\n2. 히브리적 배경: 구약의 "말씀(דָּבָר)"은 단순한 의사소통이 아니라 창조와 구원을 실행하는 능력이다(사 55:11). 지혜 문헌에서 지혜(חָכְמָה)는 창조 시 하나님과 함께 있었던 인격적 존재로 의인화된다(잠 8:22-31).\n\n요한은 이 두 전통을 종합하면서도, λόγος가 "육신이 되어 우리 가운데 거하셨다"(14절)는 독특한 기독론적 선언을 통해 모든 철학과 신학을 초월한다. 설교에서 이 배경을 간략히 소개하면 회중이 "말씀"의 깊이를 이해하는 데 큰 도움이 된다.',
    summary: 'λόγος는 헬라 철학의 이법과 히브리 지혜 전통을 종합하면서도, 성육신이라는 기독론적 사건으로 모든 배경을 초월한다.',
    tags: ['λόγος', '헬라철학', '지혜전통', '성육신'],
    starred: true,
    pinned: false,
    connections: [
      { type: 'passage', label: '요한복음 1:1-5', id: 'passage-john1' },
      { type: 'word', label: 'λόγος', id: 'word-logos' },
      { type: 'theme', label: '말씀', id: 'theme-word' },
    ],
    projectIds: ['proj-john1'],
    archiveIds: [],
    createdAt: '2026-06-05T10:30:00Z',
    updatedAt: '2026-06-08T14:00:00Z',
    lastReferencedAt: '2026-06-08T14:00:00Z',
    referenceCount: 3,
  },
  {
    id: 'note-research-2',
    type: 'research',
    title: 'φρόνημα의 신학적 의미 분석',
    content: 'φρόνημα(프로네마)는 신약에서 4회 모두 로마서 8장에만 등장한다(6, 7, 27절). 이 단어의 독특성:\n\n1. 어원: φρήν(마음, 지성)에서 파생. φρονέω(생각하다, 마음을 두다)의 파생 명사.\n\n2. 아리스토텔레스적 배경: 아리스토텔레스는 φρόνησις(실천적 지혜)를 지적 덕목 중 최고로 보았다. 그러나 바울은 같은 어근의 φρόνημα를 사용하여 인간 존재의 가장 깊은 방향 정향(orientation)을 표현한다.\n\n3. 바울의 용법: 단순한 인지 활동이 아니라, 전인격의 지향점을 의미한다. "육신의 생각"(τὸ φρόνημα τῆς σαρκός)은 사망이고, "성령의 생각"(τὸ φρόνημα τοῦ πνεύματος)은 생명과 평안이다(6절).\n\n4. 설교적 적용: 이 단어는 우리가 "무엇을 생각하는가"의 차원을 넘어 "우리의 삶이 어디를 향하는가"의 차원을 묻는다. 단순한 생각의 변화가 아니라, 존재의 방향 전환이 필요하다.',
    summary: 'φρόνημα는 단순한 생각이 아닌 존재의 지향점이다. 육신의 φρόνημα(사망)와 성령의 φρόνημα(생명·평안)의 대조는 존재론적 전환을 요구한다.',
    tags: ['φρόνημα', '성령', '육신', '지향'],
    starred: true,
    pinned: true,
    connections: [
      { type: 'passage', label: '로마서 8:5-8', id: 'passage-rom8' },
      { type: 'word', label: 'φρόνημα', id: 'word-phronema' },
      { type: 'theme', label: '성령', id: 'theme-spirit' },
    ],
    projectIds: ['proj-current'],
    archiveIds: [],
    createdAt: '2026-06-04T11:00:00Z',
    updatedAt: '2026-06-09T15:30:00Z',
    lastReferencedAt: '2026-06-09T15:30:00Z',
    referenceCount: 5,
  },
  {
    id: 'note-research-3',
    type: 'research',
    title: '어둠이 이기지 못하는 빛 — καταλαμβάνω의 이중 의미',
    content: '요한복음 1:5의 "어둠이 빛을 이기지 못하였다"의 헬라어 καταλαμβάνω(카탈람바노)는 두 가지 의미를 가진다: (1) "붙잡다, 이기다, 압도하다" (2) "이해하다, 깨닫다".\n\n초대 교부들은 이 이중 의미를 의도적인 것으로 보았다. 어둠은 빛을 (1) 압도하지 못하고 (2) 이해하지도 못한다는 뜻이다. 크리소스토무스는 이 구절을 "어둠이 빛을 이기려 했으나 이기지 못했고, 이해하려 했으나 이해하지 못했다"고 설명했다.\n\n이 이중 의미는 설교에서 풍성한 적용점을 준다: (1) 세상의 악은 그리스도의 빛을 결코 이기지 못한다 — 확신 (2) 세상은 그리스도의 빛을 결코 이해하지 못한다 — 복음의 타자성. 복음은 세상의 기준으로 이해되지 않는 "다른" 빛이다.',
    summary: 'καταλαμβάνω는 "이기지 못하다"와 "이해하지 못하다"의 이중 의미로, 설교에서 확신(승리)과 복음의 타자성(이해불가능성)을 동시에 전달한다.',
    tags: ['καταλαμβάνω', '빛', '어둠', '헬라어'],
    starred: false,
    pinned: false,
    connections: [
      { type: 'passage', label: '요한복음 1:5', id: 'passage-john1' },
      { type: 'word', label: 'καταλαμβάνω', id: 'word-katalambano' },
      { type: 'theme', label: '빛', id: 'theme-light' },
    ],
    projectIds: ['proj-john1'],
    archiveIds: [],
    createdAt: '2026-06-03T16:45:00Z',
    updatedAt: '2026-06-07T12:00:00Z',
    lastReferencedAt: null,
    referenceCount: 1,
  },

  // ── APPLICATION IDEAS (3) ──
  {
    id: 'note-app-1',
    type: 'application',
    title: '"내면의 불빛" — 청년을 위한 적용',
    content: '요한복음 1:4-5의 "빛"을 청년들의 "정체성 혼란"과 연결할 수 있다. 많은 청년들이 "나는 누구인가"의 질문 앞에서 어둠을 경험한다. 적용 포인트: (1) 우리는 스스로 빛이 될 수 없다 — 우리 안에 있는 생명의 빛은 그리스도에게서 온다 (2) 그러나 그 빛이 우리 안에 있을 때, 우리는 "빛의 자녀"가 된다 (3) 어둠이 우리를 압도할 수 없는 이유는 우리의 힘이 아니라 그리스도의 생명이 우리 안에 있기 때문이다.\n\n이를 20-30대 청년 모임에서 나눌 때, "내가 빛이 아니라 빛을 비추는 사람"이라는 정체성 전환을 경험하게 하는 것이 목표다. 워크시트: "내 삶의 어두운 영역은? 그곳에 그리스도의 빛이 어떻게 비춰질 수 있을까?"',
    summary: '요한복음 1:4-5의 빛을 청년의 정체성 혼란과 연결. "내가 빛이 아니라 빛을 비추는 사람"이라는 정체성 전환을 경험하게 한다.',
    tags: ['청년', '정체성', '빛', '워크시트'],
    starred: false,
    pinned: false,
    connections: [
      { type: 'passage', label: '요한복음 1:4-5', id: 'passage-john1' },
      { type: 'theme', label: '빛', id: 'theme-light' },
      { type: 'theme', label: '생명', id: 'theme-life' },
    ],
    projectIds: ['proj-john1'],
    archiveIds: [],
    createdAt: '2026-06-06T21:30:00Z',
    updatedAt: '2026-06-09T09:00:00Z',
    lastReferencedAt: null,
    referenceCount: 0,
  },
  {
    id: 'note-app-2',
    type: 'application',
    title: '정죄감을 이기는 말씀 선포 훈련',
    content: '롬 8:1을 삶으로 적용하는 구체적 훈련:\n\n"정죄감 다이어리" — 정죄감이 들 때마다 세 단계를 기록한다:\n(1) 인식: "지금 나는 ~라는 정죄감을 느끼고 있다"\n(2) 선포: "그러나 그리스도 예수 안에 있는 자에게 결코 정죄함이 없다"(롬 8:1)를 큰 소리로 읽는다\n(3) 기록: 정죄감의 내용과 말씀 선포 후의 마음을 한 문장으로 기록한다\n\n일주일 후 교제 시간에 나누면, 말씀이 실제 삶에서 어떻게 역사하는지 공유할 수 있다. 중요한 것은 이 훈련이 심리적 자기 확언이 아니라, 그리스도의 대속이라는 객관적 사실에 근거한 선언임을 강조하는 것이다.',
    summary: '"정죄감 다이어리" — 정죄감이 들 때 인식→선포→기록의 훈련. 심리적 확언이 아닌 객관적 사실(대속)에 근거한 선언.',
    tags: ['정죄감', '말씀선포', '훈련', '롬8장'],
    starred: true,
    pinned: false,
    connections: [
      { type: 'passage', label: '로마서 8:1', id: 'passage-rom8' },
      { type: 'theme', label: '자유', id: 'theme-freedom' },
    ],
    projectIds: ['proj-current'],
    archiveIds: ['archive-romans-8'],
    createdAt: '2026-06-04T08:15:00Z',
    updatedAt: '2026-06-07T10:30:00Z',
    lastReferencedAt: '2026-06-07T10:30:00Z',
    referenceCount: 2,
  },
  {
    id: 'note-app-3',
    type: 'application',
    title: '성령의 인도하심 7일 챌린지',
    content: '롬 8:14의 "성령의 인도하심"을 체험하는 7일 챌린지:\n\n매일 아침 기도 후 "오늘 성령님의 인도하심을 구합니다"라고 기도하고, 하루 중 성령이 인도하신 순간을 기록한다.\n\n저녁 질문:\n- 오늘 성령께서 어떻게 인도하셨는가?\n- 육신의 생각이 아닌 성령의 생각으로 반응한 순간은?\n- 내일의 기도 제목은?\n\n이 챌린지는 성령의 인도가 추상적 교리가 아니라 실제 경험임을 깨닫게 한다. 교회 전체가 함께 할 때 더 효과적이다.',
    summary: '성령의 인도하심을 7일 동안 기록하는 훈련. 추상적 교리를 실제 경험으로 전환한다.',
    tags: ['성령', '훈련', '인도하심', '챌린지'],
    starred: false,
    pinned: false,
    connections: [
      { type: 'passage', label: '로마서 8:14', id: 'passage-rom8' },
      { type: 'theme', label: '성령', id: 'theme-spirit' },
    ],
    projectIds: ['proj-current'],
    archiveIds: [],
    createdAt: '2026-06-08T07:30:00Z',
    updatedAt: '2026-06-09T10:15:00Z',
    lastReferencedAt: null,
    referenceCount: 0,
  },

  // ── QUESTION NOTES (2) ──
  {
    id: 'note-q-1',
    type: 'question',
    title: '왜 요한은 생명보다 말씀의 선재성을 먼저 강조하는가?',
    content: '요한복음 1:1-5를 읽을 때마다 드는 질문: 왜 요한은 "생명"(4절)보다 "말씀의 선재성"(1-2절)을 먼저 제시하는가?\n\n가능한 답: (1) 창세기 1장의 구조를 따르면서도, 창조 이전부터 계신 말씀의 선재성을 통해 예수의 신성을 확립하려 함 (2) 영지주의의 영향 속에서 예수의 역사적 실제성보다 신성에 초점이 맞춰진 시대적 배경 (3) 생명은 말씀 안에 있을 때만 참 생명이 된다는 점을 강조하려는 의도.\n\n더 연구가 필요한 지점: 요한공동체의 상황과 이 프롤로그의 관계. 마틴 호르트(Martin Hengel)의 연구를 참고할 것.',
    summary: '요한이 생명(4절)보다 말씀의 선재성(1-2절)을 먼저 제시한 신학적 의도는 무엇인가?',
    tags: ['질문', '프롤로그', '선재성', '요한신학'],
    starred: true,
    pinned: false,
    connections: [
      { type: 'passage', label: '요한복음 1:1-5', id: 'passage-john1' },
      { type: 'theme', label: '말씀', id: 'theme-word' },
    ],
    projectIds: ['proj-john1'],
    archiveIds: [],
    createdAt: '2026-06-05T23:00:00Z',
    updatedAt: '2026-06-06T07:30:00Z',
    lastReferencedAt: null,
    referenceCount: 1,
  },
  {
    id: 'note-q-2',
    type: 'question',
    title: '롬 8장에서 "율법"의 의미는 무엇인가?',
    content: '바울이 롬 8장에서 "율법"(νόμος)이라는 단어를 다양한 의미로 사용하는 것 같다:\n\n- 8:2: "성령의 법" — 새로운 원리\n- 8:3: "율법이 하지 못한 것" — 모세 율법\n- 8:4: "율법의 의" — 율법의 참된 목적\n- 8:7: "하나님의 법" — 하나님의 요구\n\n질문: 바울이 같은 장에서 νόμος를 이렇게 다르게 사용하는 것이 의도적인가? 아니면 헬라어 독자들에게는 자연스러운 용법인가?\n\n참고: Dunn, Romans (WBC)에서는 이 구절들에서 νόμος가 각각 다른 뉘앙스를 가진다고 주장한다. 반면 Cranfield는 더 통일된 의미를 찾는다. 이 부분은 설교에서 조심히 다뤄야 한다. 회중이 혼란스러워할 수 있기 때문이다.',
    summary: '롬 8장에서 νόμος(율법)는 다양한 의미로 사용된다. 설교에서 이 다의성을 어떻게 명확히 전달할 것인가?',
    tags: ['질문', '율법', 'νόμος', '로마서'],
    starred: false,
    pinned: false,
    connections: [
      { type: 'passage', label: '로마서 8:1-11', id: 'passage-rom8' },
      { type: 'word', label: 'νόμος', id: 'word-nomos' },
    ],
    projectIds: ['proj-current'],
    archiveIds: [],
    createdAt: '2026-06-02T15:00:00Z',
    updatedAt: '2026-06-04T09:00:00Z',
    lastReferencedAt: '2026-06-04T09:00:00Z',
    referenceCount: 2,
  },

  // ── PASTORAL OBSERVATIONS (2) ──
  {
    id: 'note-pastoral-1',
    type: 'pastoral',
    title: '익숙한 본문일수록 의미가 건너뛰어질 위험이 있다',
    content: '요한복음 1장이나 롬 8장처럼 유명한 본문을 설교할 때면 항상 느끼는 긴장감이 있다. 회중이 너무 익숙해서 "아, 그 말씀"하고 넘어갈 위험이 있다. 특히 30년 이상 신앙생활을 한 장년 회중은 본문을 들을 때 "내가 이미 아는 것"의 프레임으로 듣는다.\n\n해결 방안:\n(1) 익숙한 표현을 낯설게 만들기 — 예: "말씀" 대신 "로고스"의 배경을 먼저 설명\n(2) 본문을 "처음 듣는 것처럼" 읽는 연습 — 느리게, 다른 어조로\n(3) 회중의 삶과 직접 연결되는 질문 던지기 — "어제 당신의 어둠은 무엇이었습니까?"\n\n익숙함은 설교의 가장 큰 적이다. 본문을 다시 처음 보는 연구자의 눈으로 준비해야 한다.',
    summary: '유명 본문일수록 회중이 "이미 안다"는 프레임으로 듣는다. 익숙한 표현을 낯설게 만드는 설교 전략이 필요하다.',
    tags: ['목회', '본문', '설교전략', '회중'],
    starred: false,
    pinned: false,
    connections: [
      { type: 'passage', label: '요한복음 1:1-5', id: 'passage-john1' },
      { type: 'passage', label: '로마서 8:1-11', id: 'passage-rom8' },
    ],
    projectIds: ['proj-john1', 'proj-current'],
    archiveIds: [],
    createdAt: '2026-06-07T06:30:00Z',
    updatedAt: '2026-06-08T11:00:00Z',
    lastReferencedAt: null,
    referenceCount: 0,
  },
  {
    id: 'note-pastoral-2',
    type: 'pastoral',
    title: '정죄감에 시달리는 성도 — 감정보다 사실을 붙들게 하라',
    content: '사역 중 자주 만나는 유형: 과거의 죄로 인한 정죄감에 시달리는 성도. "내가 이렇게 해도 괜찮을까?", "하나님이 나를 정말 용서하셨을까?"\n\n이런 성도에게 롬 8:1은 결정적인 말씀이다. 주의할 점:\n(1) "괜찮다"는 위로로 끝나면 안 된다 — 객관적 선언이어야 한다\n(2) 정죄감은 감정이고, 정죄의 해제는 사실(fact)이다 — 감정보다 사실을 붙들게 해야 한다\n(3) "지금 정죄감이 들어도, 하나님의 말씀은 당신을 정죄하지 않는다고 선언합니다" — 이 선언을 스스로 하게 훈련시킨다\n\n실제 상담 사례: 한 성도가 이 말씀을 붙든 후 "더 이상 과거의 죄가 나를 지배하지 않는다"는 고백을 했다. 말씀의 선포적 능력을 경험한 순간이었다.',
    summary: '정죄감에 시달리는 성도에게 롬 8:1은 위로가 아닌 객관적 선언으로 선포되어야 한다. 감정보다 사실을 붙들게 하라.',
    tags: ['정죄감', '상담', '선포', '목회'],
    starred: true,
    pinned: true,
    connections: [
      { type: 'passage', label: '로마서 8:1', id: 'passage-rom8' },
      { type: 'theme', label: '자유', id: 'theme-freedom' },
    ],
    projectIds: ['proj-current'],
    archiveIds: [],
    createdAt: '2026-06-03T11:00:00Z',
    updatedAt: '2026-06-08T16:30:00Z',
    lastReferencedAt: '2026-06-08T16:30:00Z',
    referenceCount: 3,
  },

  // ── ILLUSTRATION CANDIDATES (2) ──
  {
    id: 'note-illus-1',
    type: 'illustration',
    title: '어두운 방 안의 초 하나',
    content: '[예화] 어두운 방 안에 있을 때, 주변의 모든 것이 보이지 않는다. 그러나 작은 초 하나만 켜져도 공간 전체의 인식이 완전히 바뀐다. 초는 방 전체를 환하게 밝히지는 못하지만, 방의 존재를 알게 하고, 가구의 윤곽을 보게 하며, 출구를 향해 걸을 수 있게 한다.\n\n연결: 요한복음 1:5의 "빛이 어둠에 비치었다" — 그리스도의 빛은 세상의 모든 어둠을 당장 제거하지는 않지만, 어둠 속에서도 우리가 걸을 수 있게 한다. 완전한 빛은 재림 때까지 기다려야 하지만, 지금 우리에게는 걸을 수 있는 빛이 주어졌다.\n\n사용처: 주일 오전 설교, 청년부 집회, 수요 예배.',
    summary: '어두운 방의 초 하나 — 그리스도의 빛은 모든 어둠을 제거하지는 않지만, 걸을 수 있는 빛을 주신다.',
    tags: ['예화', '빛', '어둠', '희망'],
    starred: false,
    pinned: false,
    connections: [
      { type: 'passage', label: '요한복음 1:5', id: 'passage-john1' },
      { type: 'theme', label: '빛', id: 'theme-light' },
    ],
    projectIds: ['proj-john1'],
    archiveIds: [],
    createdAt: '2026-06-05T20:00:00Z',
    updatedAt: '2026-06-06T08:00:00Z',
    lastReferencedAt: null,
    referenceCount: 0,
  },
  {
    id: 'note-illus-2',
    type: 'illustration',
    title: '강물 위에 비친 달빛',
    content: '[예화] 고요한 밤, 강물 위에 달빛이 비치면 물결에 따라 빛이 반짝인다. 달 자체는 움직이지 않지만, 물결이 일렁일 때마다 빛의 모양이 달라진다.\n\n연결: 우리는 그리스도의 빛을 반사하는 존재다. 우리의 삶이 잔잔할 때는 빛이 고요히 비치고, 우리가 흔들릴 때도 그 빛은 여전히 비치고 있다. 중요한 것은 빛의 근원이 흔들리지 않는다는 사실이다. 우리의 신앙 상태에 따라 빛의 반사는 달라질 수 있지만, 빛 자체는 변하지 않는다.\n\n사용처: 저녁 예배, 새벽 기도회, 회심 집회.',
    summary: '강물 위의 달빛 — 우리는 빛을 반사하는 존재다. 근원이신 그리스도는 우리의 상태와 상관없이 변함없이 비추신다.',
    tags: ['예화', '달빛', '반사', '확신'],
    starred: false,
    pinned: false,
    connections: [
      { type: 'passage', label: '요한복음 1:4-5', id: 'passage-john1' },
      { type: 'theme', label: '빛', id: 'theme-light' },
      { type: 'theme', label: '생명', id: 'theme-life' },
    ],
    projectIds: ['proj-john1'],
    archiveIds: [],
    createdAt: '2026-05-30T22:00:00Z',
    updatedAt: '2026-06-02T14:00:00Z',
    lastReferencedAt: null,
    referenceCount: 0,
  },

  // ── WARNING NOTES (2) ──
  {
    id: 'note-warn-1',
    type: 'warning',
    title: '원어 설명이 설교의 중심이 되지 않게 주의',
    content: '경고: 원어 연구는 설교의 도구이지 설교의 내용이 되어서는 안 된다.\n\n특히 λόγος나 κατάκριμα 같은 중요한 원어일수록 설교자가 원어 설명에 빠지기 쉽다. 회중이 헬라어를 모른다는 사실을 잊지 말자.\n\n지침:\n(1) 한 주제당 한 개의 원어만 깊이 다룰 것\n(2) 원어를 설명할 때는 항상 "쉬운 우리말"로 풀어쓸 것\n(3) 원어 설명은 1-2분을 넘기지 말 것\n(4) 원어보다 그 원어가 전달하는 "메시지"가 중심이 되어야 함\n\n기억하자: 회중은 당신의 헬라어 실력에 감동하러 온 것이 아니라, 하나님의 말씀을 먹으러 왔다.',
    summary: '원어 연구는 도구일 뿐 내용이 아니다. 설교의 중심은 항상 메시지여야 한다.',
    tags: ['경고', '원어', '설교기술'],
    starred: true,
    pinned: true,
    connections: [
      { type: 'passage', label: '요한복음 1:1-5', id: 'passage-john1' },
      { type: 'passage', label: '로마서 8:1-11', id: 'passage-rom8' },
      { type: 'theme', label: '말씀', id: 'theme-word' },
    ],
    projectIds: ['proj-john1', 'proj-current'],
    archiveIds: [],
    createdAt: '2026-06-01T09:00:00Z',
    updatedAt: '2026-06-03T11:30:00Z',
    lastReferencedAt: '2026-06-08T07:00:00Z',
    referenceCount: 4,
  },
  {
    id: 'note-warn-2',
    type: 'warning',
    title: '"정죄"를 지나치게 심리학적으로 해석하지 말라',
    content: '롬 8:1의 "정죄함이 없다"는 말씀을 설교할 때 흔히 하는 실수: 정죄감(죄책감)의 심리적 해소로만 해석하는 것.\n\n바울이 말하는 정죄(κατάκριμα)는 법정적 용어다. 단순한 기분이나 감정의 문제가 아니라, 하나님 앞에서의 객관적 법적 상태의 변화다. 심리적 안정을 주는 것은 복음의 부수적 효과일 뿐, 복음의 본질이 아니다.\n\n설교에서 주의할 점:\n(1) "더 이상 죄책감 느끼지 마세요"가 아니라 "하나님 앞에서 당신은 의롭다 하심을 받았다"\n(2) 심리학적 접근은 복음을 인간 중심으로 축소시킬 위험이 있다\n(3) "정죄의 해제"는 신분의 변화이지 감정의 변화가 아니다\n(4) 때로는 거룩한 정죄감(회개)이 필요한 경우도 있다는 점을 균형 있게 전달',
    summary: '롬 8:1의 "정죄"는 법정적 용어다. 심리적 위로로 축소하지 말고, 신분의 변화로서 선포해야 한다.',
    tags: ['경고', '정죄', '법정', '설교신학'],
    starred: true,
    pinned: false,
    connections: [
      { type: 'passage', label: '로마서 8:1', id: 'passage-rom8' },
      { type: 'word', label: 'κατάκριμα', id: 'word-katakrima' },
      { type: 'theme', label: '자유', id: 'theme-freedom' },
    ],
    projectIds: ['proj-current'],
    archiveIds: [],
    createdAt: '2026-05-28T14:00:00Z',
    updatedAt: '2026-06-05T16:00:00Z',
    lastReferencedAt: '2026-06-05T16:00:00Z',
    referenceCount: 2,
  },
]

/* ─── Helpers ─── */

export function getAllTags(notes: NoteEntry[] = NOTES): string[] {
  const tags = new Set<string>()
  notes.forEach(n => n.tags.forEach(t => tags.add(t)))
  return Array.from(tags).sort()
}

export function getAllConnections(notes: NoteEntry[] = NOTES): Record<string, number> {
  const conns: Record<string, number> = {}
  notes.forEach(n => {
    n.connections.forEach(c => {
      const key = `${c.type}::${c.id}`
      conns[key] = (conns[key] || 0) + 1
    })
  })
  return conns
}

export type SortMode = 'recent' | 'referenced' | 'connections' | 'starred'

export function filterNotes(
  notes: NoteEntry[],
  filters: {
    types: NoteType[]
    tags: string[]
    starredOnly: boolean
    pinnedOnly: boolean
    connectionType?: NoteConnectionType
    connectionId?: string
    searchQuery?: string
    sortMode?: SortMode
  },
): NoteEntry[] {
  let result = [...notes]

  if (filters.types.length > 0) {
    result = result.filter(n => filters.types.includes(n.type))
  }
  if (filters.tags.length > 0) {
    result = result.filter(n => filters.tags.some(t => n.tags.includes(t)))
  }
  if (filters.starredOnly) {
    result = result.filter(n => n.starred)
  }
  if (filters.pinnedOnly) {
    result = result.filter(n => n.pinned)
  }
  if (filters.connectionType && filters.connectionId) {
    result = result.filter(n =>
      n.connections.some(c => c.type === filters.connectionType && c.id === filters.connectionId),
    )
  }
  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase().trim()
    if (q) {
      result = result.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q) ||
        n.tags.some(t => t.toLowerCase().includes(q)) ||
        n.connections.some(c => c.label.toLowerCase().includes(q)),
      )
    }
  }

  // Sort
  const mode = filters.sortMode || 'recent'
  if (mode === 'recent') {
    result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  } else if (mode === 'referenced') {
    result.sort((a, b) => {
      if (!a.lastReferencedAt && !b.lastReferencedAt) return 0
      if (!a.lastReferencedAt) return 1
      if (!b.lastReferencedAt) return -1
      return new Date(b.lastReferencedAt).getTime() - new Date(a.lastReferencedAt).getTime()
    })
  } else if (mode === 'connections') {
    result.sort((a, b) => b.connections.length - a.connections.length)
  } else if (mode === 'starred') {
    result.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      if (a.starred !== b.starred) return a.starred ? -1 : 1
      return 0
    })
  }

  return result
}

export function findRelatedNotes(note: NoteEntry, allNotes: NoteEntry[], maxResults = 5): { note: NoteEntry; reason: string }[] {
  const related: { note: NoteEntry; reason: string; score: number }[] = []

  allNotes.forEach(other => {
    if (other.id === note.id) return

    // Check shared connections
    const sharedConns = note.connections.filter(nc =>
      other.connections.some(oc => oc.type === nc.type && oc.id === nc.id),
    )

    // Check shared tags
    const sharedTags = note.tags.filter(t => other.tags.includes(t))

    // Check shared project
    const sharedProjects = note.projectIds.filter(p => other.projectIds.includes(p))

    let score = 0
    let reason = ''

    if (sharedConns.length > 0) {
      score += sharedConns.length * 3
      const top = sharedConns[0]
      reason = `같은 ${top.type === 'passage' ? '본문' : top.type === 'theme' ? '주제' : top.type === 'word' ? '원어' : '연결'} 공유`
    }
    if (sharedTags.length > 0) {
      score += sharedTags.length * 2
      if (!reason) reason = `공통 태그: #${sharedTags.slice(0, 2).join(', #')}`
    }
    if (sharedProjects.length > 0) {
      score += sharedProjects.length * 2
      if (!reason) reason = '같은 프로젝트'
    }

    if (score > 0) {
      related.push({ note: other, reason, score })
    }
  })

  related.sort((a, b) => b.score - a.score)
  return related.slice(0, maxResults).map(({ note, reason }) => ({ note, reason }))
}

export function getInsightSummary(notes: NoteEntry[] = NOTES) {
  return {
    totalNotes: notes.length,
    byType: NOTE_TYPES.map(t => ({ type: t, label: NOTE_TYPE_LABELS[t], count: notes.filter(n => n.type === t).length })),
    starredCount: notes.filter(n => n.starred).length,
    pinnedCount: notes.filter(n => n.pinned).length,
    recentNotes: notes.filter(n => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return new Date(n.updatedAt) > weekAgo
    }).length,
    topTopics: getTopTopics(notes),
    mostReferenced: [...notes].sort((a, b) => b.referenceCount - a.referenceCount).slice(0, 3),
  }
}

function getTopTopics(notes: NoteEntry[]): { topic: string; count: number }[] {
  const topicCount: Record<string, number> = {}
  notes.forEach(n => {
    n.connections
      .filter(c => c.type === 'theme' || c.type === 'passage')
      .forEach(c => {
        topicCount[c.label] = (topicCount[c.label] || 0) + 1
      })
  })
  return Object.entries(topicCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic, count]) => ({ topic, count }))
}
