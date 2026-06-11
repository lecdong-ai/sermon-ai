export interface SeriesSermonEntry {
  id: string
  title: string
  passage: string
  sermonDate: string
  status: 'completed' | 'writing' | 'prepare' | 'research' | 'planned'
  wordCount: number
  order: number
  coreMessage: string
}

export interface SeriesTopic {
  topic: string
  count: number
}

export interface SeriesData {
  id: string
  title: string
  description: string
  purpose: string
  audience: string
  expectedFruit: string
  pastoralNote: string
  season?: string
  themeNames: string[]
  tagNames: string[]
  keyTopics: SeriesTopic[]
  relatedNoteIds: string[]
  totalSermons: number
  completedSermons: number
  sermons: SeriesSermonEntry[]
  createdAt: string
  updatedAt: string
}

const ROMANS_SERMONS: SeriesSermonEntry[] = [
  { id: 'arc-001', title: '믿음으로 말미암는 의', passage: '롬 3:21-31', sermonDate: '2026-05-17', status: 'completed', wordCount: 4850, order: 1, coreMessage: '율법의 행위와 상관없이 예수 그리스도를 믿는 믿음으로 말미암아 하나님의 의가 주어졌다.' },
  { id: 'arc-002', title: '화목하게 된 자의 즐거움', passage: '롬 5:1-11', sermonDate: '2026-05-24', status: 'completed', wordCount: 5120, order: 2, coreMessage: '우리가 하나님과 화목하게 된 것은 예수 그리스도의 죽음과 부활로 말미암았다.' },
  { id: 'arc-003', title: '죄에 대하여 죽은 자', passage: '롬 6:1-14', sermonDate: '2026-05-31', status: 'completed', wordCount: 4980, order: 3, coreMessage: '세례는 그리스도와 함께 죽고 함께 사는 연합이며, 이제 죄에 대해 죽은 자로 살아야 한다.' },
  { id: 'proj-001', title: '성령 안에 있는 생명', passage: '롬 8:1-11', sermonDate: '2026-06-14', status: 'writing', wordCount: 3240, order: 4, coreMessage: '성령께서 그리스도 안에서 우리에게 주시는 생명의 자유와 능력' },
  { id: 'arc-005', title: '끊을 수 없는 사랑', passage: '롬 8:31-39', sermonDate: '2026-06-28', status: 'completed', wordCount: 4670, order: 5, coreMessage: '하나님이 우리를 위하시면 누가 우리를 대적하리요? 그리스도의 사랑에서 끊을 수 있는 것은 아무것도 없다.' },
  { id: 'rom-6', title: '하나님의 주권과 이스라엘', passage: '롬 9:1-18', sermonDate: '2026-07-12', status: 'planned', wordCount: 0, order: 6, coreMessage: '하나님의 선택과 주권은 인간의 판단을 초월하는 신비로운 은혜의 경륜이다.' },
  { id: 'rom-7', title: '주의 이름을 부르는 자', passage: '롬 10:1-17', sermonDate: '2026-07-26', status: 'planned', wordCount: 0, order: 7, coreMessage: '누구든지 주의 이름을 부르는 자는 구원을 얻는다.' },
  { id: 'rom-8', title: '그리스도인의 삶과 사명', passage: '롬 12:1-8', sermonDate: '2026-08-09', status: 'planned', wordCount: 0, order: 8, coreMessage: '하나님의 자비하심으로 우리는 산 제사를 드리며, 은사대로 교회를 섬겨야 한다.' },
]

const JOHN_SERMONS: SeriesSermonEntry[] = [
  { id: 'john-1', title: '태초부터 계신 말씀', passage: '요 1:1-5', sermonDate: '2026-06-07', status: 'completed', wordCount: 4520, order: 1, coreMessage: '말씀이 태초부터 하나님과 함께 계셨고, 그 말씀 안에 생명과 빛이 있었다. 창세기를 새롭게 해석하는 요한의 기독론적 프롤로그.' },
  { id: 'john-2', title: '증언하러 온 사람', passage: '요 1:6-8', sermonDate: '2026-06-14', status: 'writing', wordCount: 2980, order: 2, coreMessage: '세례 요한은 빛이 아니라 빛을 증언하러 온 증인이다. 우리도 그리스도의 빛을 가리키는 증인으로 부름받았다.' },
  { id: 'john-3', title: '참빛으로 오신 예수', passage: '요 1:9-13', sermonDate: '2026-06-21', status: 'research', wordCount: 1560, order: 3, coreMessage: '참빛이 세상에 왔으나 세상이 그를 알지 못했다. 그러나 영접하는 자에게는 하나님의 자녀가 되는 특권을 주셨다.' },
  { id: 'john-4', title: '말씀이 육신이 되심', passage: '요 1:14-18', sermonDate: '2026-06-28', status: 'prepare', wordCount: 820, order: 4, coreMessage: '말씀이 육신이 되어 우리 가운데 거하셨다. 은혜와 진리가 충만한 독생자의 영광을 보았다.' },
  { id: 'john-5', title: '하나님의 어린양', passage: '요 1:29-34', sermonDate: '2026-07-05', status: 'planned', wordCount: 0, order: 5, coreMessage: '세상 죄를 지고 가는 하나님의 어린양이신 예수, 성령이 비둘기 같이 임하심으로 그리스도이심이 증언되었다.' },
]

export const SERIES_DATA: SeriesData[] = [
  {
    id: 'ser-001',
    title: '로마서 강해',
    description: '로마서를 1장부터 16장까지 강해하는 시리즈. 칭의, 성화, 하나님의 주권, 그리스도인의 삶을 통시적으로 조망한다. 2026년 상반기부터 시작된 주일예배 메인 시리즈로, 바울 신학의 깊이와 복음의 능력을 선포하는 것을 목표로 한다.',
    purpose: '바울의 로마서를 통해 복음의 전체 구조(칭의-성화-하나님의 주권-그리스도인의 삶)를 선명히 이해하고, 성도들이 복음 안에서 자유와 확신을 누리게 한다.',
    audience: '장년 주일예배',
    expectedFruit: '성도들이 복음의 전인격적 차원(과거-칭의, 현재-성화, 미래-영화)을 이해하고, 율법주의나 은혜의 싸구려화에서 벗어나 복음 안에서 자유와 확신을 누리게 된다.',
    pastoralNote: '칭의가 강조되는 3-5장과 성화가 강조되는 6-8장 사이의 연결을 매 설교마다 자연스럽게 언급해야 한다. 그렇지 않으면 성도들이 칭의와 성화를 분리된 주제로 오해할 수 있다.',
    season: '일반',
    themeNames: ['칭의', '성화', '하나님의 주권', '복음'],
    tagNames: ['로마서', '바울', '강해서리즈'],
    keyTopics: [
      { topic: '칭의', count: 2 },
      { topic: '성화', count: 2 },
      { topic: '성령', count: 2 },
      { topic: '은혜', count: 3 },
      { topic: '믿음', count: 2 },
    ],
    relatedNoteIds: ['note-insight-3', 'note-research-2', 'note-app-2', 'note-app-3', 'note-pastoral-2', 'note-warn-2', 'note-q-2'],
    totalSermons: 8,
    completedSermons: 4,
    sermons: ROMANS_SERMONS,
    createdAt: '2026-05-01T09:00:00Z',
    updatedAt: '2026-06-09T14:30:00Z',
  },
  {
    id: 'ser-002',
    title: '요한복음 강해',
    description: '예수 그리스도의 정체성과 표적, 믿음, 생명을 요한복음의 전개 속에서 따라가는 장기 강해 시리즈. 요한의 독특한 신학적 언어(말씀, 빛, 생명, 증언, 표적, 영생)를 통해 예수님이 누구신지 선명히 드러내는 것을 목표로 한다.',
    purpose: '요한복음을 통해 예수 그리스도의 정체성을 선명히 붙들게 하고, 익숙한 복음의 언어를 다시 살아 있는 계시로 듣게 하며, 성도들이 예수를 단순한 종교 인물이 아니라 생명과 빛의 주로 보게 한다.',
    audience: '장년 주일예배',
    expectedFruit: '성도들이 요한복음의 독특한 신학적 언어(말씀, 빛, 생명, 표적, 영생)를 이해하고, 복음서를 단순한 예수 이야기가 아니라 "예수가 누구신가"에 대한 선명한 선언으로 읽게 된다.',
    pastoralNote: '요한복음은 공관복음과 구조와 언어가 다르므로, 회중이 익숙한 복음서 이야기와의 차이를 이해할 수 있도록 매 설교 서두에 요한의 독특한 관점을 간략히 설명하는 것이 좋다. 또한 표적을 단순한 기적이 아닌 계시 사건으로 읽는 안목을 길러주는 것이 중요하다.',
    season: '일반',
    themeNames: ['말씀', '생명', '빛', '믿음', '증언', '성육신'],
    tagNames: ['요한복음', '강해', '예수'],
    keyTopics: [
      { topic: '말씀', count: 2 },
      { topic: '빛', count: 2 },
      { topic: '생명', count: 2 },
      { topic: '믿음', count: 1 },
      { topic: '증언', count: 1 },
    ],
    relatedNoteIds: ['note-insight-1', 'note-insight-2', 'note-research-1', 'note-research-3', 'note-app-1', 'note-q-1', 'note-pastoral-1', 'note-illus-1', 'note-illus-2', 'note-warn-1'],
    totalSermons: 5,
    completedSermons: 1,
    sermons: JOHN_SERMONS,
    createdAt: '2026-06-01T09:00:00Z',
    updatedAt: '2026-06-10T10:00:00Z',
  },
  {
    id: 'ser-003',
    title: '에베소서 강해',
    description: '에베소서를 통해 그리스도 안에서의 신분, 교회의 정체성, 성도의 삶을 조명한 시리즈. "하늘에 속한 모든 신령한 복"으로 시작하여 "성령의 전신갑주"로 마무리하며, 그리스도인의 정체성과 승리의 삶을 선포한다.',
    purpose: '에베소서를 통해 성도들이 그리스도 안에서 받은 신분의 영광을 깨닫고, 교회의 정체성을 바로 세우며, 성령 안에서 승리하는 일상의 삶을 살게 한다.',
    audience: '장년 주일예배',
    expectedFruit: '성도들이 "그리스도 안에서"의 신분적 변화를 실제로 체험하고, 교회가 단순한 모임이 아니라 그리스도의 몸임을 깨닫는다.',
    pastoralNote: '1장의 신분 선언(택정하심, 예정하심, 인치심)은 설교만으로는 회중이 체감하기 어렵다. 6주 정도의 양육 과정이나 소그룹 나눔 자료를 함께 제공하는 것이 효과적이다.',
    season: '일반',
    themeNames: ['신분', '교회', '은혜', '승리'],
    tagNames: ['에베소서', '신분', '전신갑주'],
    keyTopics: [
      { topic: '신분', count: 2 },
      { topic: '은혜', count: 2 },
      { topic: '교회', count: 1 },
      { topic: '승리', count: 1 },
    ],
    relatedNoteIds: [],
    totalSermons: 4,
    completedSermons: 4,
    sermons: [
      { id: 'eph-1', title: '하늘에 속한 신령한 복', passage: '엡 1:1-14', sermonDate: '2025-09-07', status: 'completed', wordCount: 4230, order: 1, coreMessage: '하나님이 그리스도 안에서 우리에게 하늘에 속한 모든 신령한 복을 주셨다.' },
      { id: 'arc-014', title: '은혜로 구원 받은 자', passage: '엡 2:1-10', sermonDate: '2025-09-14', status: 'completed', wordCount: 5100, order: 2, coreMessage: '행위가 아닌 은혜로 믿음을 통해 구원받았으며, 선한 일을 위해 지으심을 받았다.' },
      { id: 'arc-015', title: '그리스도의 몸된 교회', passage: '엡 4:1-16', sermonDate: '2025-10-05', status: 'completed', wordCount: 5340, order: 3, coreMessage: '교회는 그리스도의 몸으로 각 지체가 은사대로 서로를 세우며 자라가야 한다.' },
      { id: 'eph-4', title: '성령의 전신갑주', passage: '엡 6:10-20', sermonDate: '2025-10-19', status: 'completed', wordCount: 4210, order: 4, coreMessage: '마귀의 간계를 대적하기 위해 하나님의 전신갑주를 입고 진리와 의와 복음으로 무장하라.' },
    ],
    createdAt: '2025-08-01T09:00:00Z',
    updatedAt: '2025-10-20T12:00:00Z',
  },
  {
    id: 'ser-004',
    title: '산상수훈 강해',
    description: '마태복음 5-7장의 산상수훈을 강해한 시리즈. 팔복, 소금과 빛, 율법의 완성, 기도, 보물, 염려, 판단, 좁은 길 등 예수님의 핵심 가르침을 탐구한다. 하나님 나라의 시민이 어떻게 살아야 하는지 구체적으로 제시한다.',
    purpose: '산상수훈을 통해 하나님 나라의 시민 윤리를 가르치고, 율법의 완성자이신 예수의 가르침을 따라 참된 제자의 삶이 무엇인지 깨닫게 한다.',
    audience: '장년 주일예배',
    expectedFruit: '성도들이 팔복의 가치관으로 자신의 삶을 점검하고, 기도와 물질과 염려의 문제를 하나님 나라의 시각으로 재정립한다.',
    pastoralNote: '산상수훈은 율법주의로 빠지기 쉬운 본문이다. "하라"는 명령이 "하나님이 먼저 행하셨다"는 선언의 맥락에서 읽혀야 함을 매 설교마다 상기시켜야 한다.',
    season: '일반',
    themeNames: ['제자도', '하나님나라', '기도', '율법'],
    tagNames: ['산상수훈', '마태복음', '예수님'],
    keyTopics: [
      { topic: '제자도', count: 2 },
      { topic: '하나님나라', count: 2 },
      { topic: '기도', count: 1 },
    ],
    relatedNoteIds: [],
    totalSermons: 5,
    completedSermons: 5,
    sermons: [
      { id: 'arc-010', title: '팔복의 사람', passage: '마 5:1-12', sermonDate: '2025-05-11', status: 'completed', wordCount: 5630, order: 1, coreMessage: '팔복은 천국 시민의 윤리를 제시하며 세상이 인정하지 않는 가치가 오히려 하나님 나라의 복이다.' },
      { id: 'sm-2', title: '소금과 빛', passage: '마 5:13-20', sermonDate: '2025-05-18', status: 'completed', wordCount: 4320, order: 2, coreMessage: '너희는 세상의 소금과 빛이니, 너희 빛을 사람 앞에 비취게 하여 하나님께 영광을 돌리라.' },
      { id: 'sm-3', title: '기도의 원리', passage: '마 6:5-15', sermonDate: '2025-05-25', status: 'completed', wordCount: 4780, order: 3, coreMessage: '골방에 들어가 은밀한 중에 보시는 아버지께 기도하라. 주기도문이 기도의 모범이다.' },
      { id: 'sm-4', title: '보물을 하늘에 쌓으라', passage: '마 6:19-34', sermonDate: '2025-06-01', status: 'completed', wordCount: 4510, order: 4, coreMessage: '땅에 보물을 쌓지 말고 하늘에 보물을 쌓으라. 염려하지 말고 먼저 그의 나라와 의를 구하라.' },
      { id: 'sm-5', title: '좁은 길과 넓은 길', passage: '마 7:13-27', sermonDate: '2025-06-08', status: 'completed', wordCount: 3980, order: 5, coreMessage: '좁은 문으로 들어가라. 멸망으로 가는 길은 넓고 생명으로 가는 길은 좁다.' },
    ],
    createdAt: '2025-04-01T09:00:00Z',
    updatedAt: '2025-06-09T12:00:00Z',
  },
  {
    id: 'ser-005',
    title: '시편 묵상 시리즈',
    description: '시편을 통해 기도와 찬양의 본질을 탐구하고, 고난과 회복 속에서 하나님을 만나는 특별 시리즈. 다윗의 목자시편, 회개시편, 탄원시편을 통해 현대 성도의 기도 생활에 실제적 도움을 준다.',
    purpose: '시편의 다양한 장르(찬양, 탄원, 회개, 감사)를 통해 성도들이 삶의 모든 상황에서 하나님께 나아가는 기도의 언어를 배우게 한다.',
    audience: '전교인 수요예배',
    expectedFruit: '성도들이 시편을 개인 기도와 묵상의 도구로 사용하는 법을 배우고, 고난 중에도 하나님께 솔직하게 나아가는 기도의 용기를 얻는다.',
    pastoralNote: '시편 설교는 신약의 그리스도 중심적 관점과 구약의 역사적 맥락 사이의 균형이 중요하다. 시편 저자의 경험을 무시한 채 무조건 그리스도에게 연결하는 것은 무리가 있다.',
    season: '특별',
    themeNames: ['기도', '찬양', '회개', '신뢰'],
    tagNames: ['시편', '다윗', '묵상'],
    keyTopics: [
      { topic: '기도', count: 2 },
      { topic: '찬양', count: 1 },
      { topic: '회개', count: 1 },
      { topic: '신뢰', count: 1 },
    ],
    relatedNoteIds: [],
    totalSermons: 3,
    completedSermons: 3,
    sermons: [
      { id: 'arc-008', title: '여호와는 나의 목자', passage: '시 23:1-6', sermonDate: '2025-03-30', status: 'completed', wordCount: 3560, order: 1, coreMessage: '여호와는 나의 목자시니 내게 부족함이 없으며 사망의 골짜기에서도 두렵지 않다.' },
      { id: 'arc-009', title: '회개의 시편', passage: '시 51:1-19', sermonDate: '2025-04-06', status: 'completed', wordCount: 4120, order: 2, coreMessage: '진정한 회개는 죄의 고백에서 시작하여 하나님의 긍휼을 의지하고 새 마음을 구하는 것이다.' },
      { id: 'ps-3', title: '깊은 곳에서 부르짖음', passage: '시 130:1-8', sermonDate: '2025-04-13', status: 'completed', wordCount: 2870, order: 3, coreMessage: '깊은 곳에서 주께 부르짖나이다. 주께서 죄악을 감찰하실지면 주가 서지 못할 자가 누구리요.' },
    ],
    createdAt: '2025-03-15T09:00:00Z',
    updatedAt: '2025-04-14T12:00:00Z',
  },
  {
    id: 'ser-006',
    title: '부활절 캠페인: 다시 사는 생명',
    description: '부활절을 맞아 예수 그리스도의 부활이 우리에게 주는 소망과 능력을 집중적으로 조명하는 캠페인 시리즈. 고난주간부터 부활절까지 이어지는 3주 시리즈로, 부활의 역사적 사실과 현재적 의미를 선포한다.',
    purpose: '그리스도의 부활을 단순한 기념일이 아니라 오늘 우리의 삶을 바꾸는 현재적 능력으로 선포하여, 성도들이 부활의 소망 안에서 살게 한다.',
    audience: '장년 주일예배 + 초청 전도',
    expectedFruit: '부활절을 맞아 성도들이 부활의 확신을 새롭게 하고, 아직 예수를 모르는 지인을 초청하는 전도의 기회를 갖는다.',
    pastoralNote: '부활절 시리즈는 신뢰성(역사적 사실)과 적용성(오늘의 능력)의 균형이 중요하다. 지나치게 역사적 증거에 치우치면 설교가 강연이 되고, 적용만 강조하면 부활의 역사적 근거가 약해진다.',
    season: '부활절',
    themeNames: ['부활', '소망', '새생명', '승리'],
    tagNames: ['부활절', '캠페인', '고난주간'],
    keyTopics: [
      { topic: '부활', count: 2 },
      { topic: '소망', count: 1 },
      { topic: '새생명', count: 1 },
    ],
    relatedNoteIds: [],
    totalSermons: 3,
    completedSermons: 2,
    sermons: [
      { id: 'eas-1', title: '십자가의 승리', passage: '골 2:13-15', sermonDate: '2026-04-03', status: 'completed', wordCount: 3890, order: 1, coreMessage: '십자가에서 모든 통치자와 권세를 벗어버리고 승리로 드러내셨다.' },
      { id: 'arc-019', title: '새 하늘과 새 땅', passage: '계 21:1-8', sermonDate: '2026-04-05', status: 'completed', wordCount: 4470, order: 2, coreMessage: '하나님이 새 하늘과 새 땅을 창조하시고 모든 눈물을 닦아주신다.' },
      { id: 'eas-3', title: '부활의 능력으로 사는 삶', passage: '빌 3:7-14', sermonDate: '2026-04-12', status: 'planned', wordCount: 0, order: 3, coreMessage: '그리스도를 아는 지식이 가장 고상하므로, 부활의 능력으로 그리스도를 닮아가자.' },
    ],
    createdAt: '2026-03-10T09:00:00Z',
    updatedAt: '2026-04-06T12:00:00Z',
  },
]

export function getSeriesById(id: string): SeriesData | undefined {
  return SERIES_DATA.find(s => s.id === id)
}

export const SORT_OPTIONS = [
  { key: 'recent', label: '최신순' },
  { key: 'progress', label: '진행률순' },
  { key: 'title', label: '제목순' },
] as const

export const STATUS_LABELS: Record<string, string> = {
  completed: '완료',
  writing: '작성중',
  prepare: '준비중',
  research: '연구중',
  planned: '예정',
}

export const STATUS_BADGE: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  writing: 'bg-blue-100 text-blue-700',
  prepare: 'bg-amber-100 text-amber-700',
  research: 'bg-violet-100 text-violet-700',
  planned: 'bg-paper-100 text-paper-500',
}
