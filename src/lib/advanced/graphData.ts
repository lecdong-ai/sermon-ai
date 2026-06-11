export type NodeType = 'sermon' | 'passage' | 'theme' | 'word' | 'note' | 'series'

export interface GraphNode {
  id: string
  label: string
  type: NodeType
  subtitle: string
  detail: string
  size: number
}

export interface GraphEdge {
  source: string
  target: string
  label: string
  weight: number
}

export const NODE_COLORS: Record<NodeType, string> = {
  sermon: '#10B981',
  passage: '#F59E0B',
  theme: '#8B5CF6',
  word: '#3B82F6',
  note: '#F43F5E',
  series: '#06B6D4',
}

export const NODE_COLORS_BG: Record<NodeType, string> = {
  sermon: 'bg-green-500',
  passage: 'bg-amber-500',
  theme: 'bg-violet-500',
  word: 'bg-blue-500',
  note: 'bg-rose-500',
  series: 'bg-cyan-500',
}

export const NODE_LABELS: Record<NodeType, string> = {
  sermon: '설교',
  passage: '본문',
  theme: '주제',
  word: '원어',
  note: '노트',
  series: '시리즈',
}

export const GRAPH_NODES: GraphNode[] = [
  // ── Sermons (9) ──
  { id: 'sermon-current', label: '성령 안에 있는 생명', type: 'sermon', subtitle: '롬 8:1-11', detail: '현재 작업 중인 설교. 성령께서 그리스도 안에서 우리에게 주시는 생명의 자유와 능력을 선포한다.', size: 2.2 },
  { id: 'sermon-rom3', label: '믿음으로 말미암는 의', type: 'sermon', subtitle: '롬 3:21-31', detail: '율법의 행위와 상관없이 예수 그리스도를 믿는 믿음으로 말미암아 하나님의 의가 주어졌다.', size: 1.5 },
  { id: 'sermon-rom5', label: '화목하게 된 자의 즐거움', type: 'sermon', subtitle: '롬 5:1-11', detail: '칭의의 결과인 하나님과의 평화, 소망, 환난 중 즐거움을 선언한다.', size: 1.5 },
  { id: 'sermon-rom6', label: '죄에 대하여 죽은 자', type: 'sermon', subtitle: '롬 6:1-14', detail: '세례는 그리스도와 함께 죽고 함께 사는 연합을 의미하며, 이제 죄에 대해 죽은 자로 살아야 한다.', size: 1.5 },
  { id: 'sermon-rom8b', label: '끊을 수 없는 사랑', type: 'sermon', subtitle: '롬 8:31-39', detail: '하나님이 우리를 위하시면 누가 대적하리요. 그리스도의 사랑에서 끊을 수 있는 것은 아무것도 없다.', size: 1.5 },
  { id: 'sermon-eph2', label: '은혜로 구원 받은 자', type: 'sermon', subtitle: '엡 2:1-10', detail: '행위가 아닌 은혜로 믿음을 통해 구원받았으며, 선한 일을 위해 지으심을 받았다.', size: 1.3 },
  { id: 'sermon-ps23', label: '여호와는 나의 목자', type: 'sermon', subtitle: '시 23:1-6', detail: '여호와는 나의 목자시니 부족함이 없으며, 사망의 골짜기에서도 두려움 없이 주와 동행한다.', size: 1.3 },
  { id: 'sermon-gal5', label: '성령의 열매', type: 'sermon', subtitle: '갈 5:16-26', detail: '성령을 따라 행하면 육체의 욕심을 이루지 않으며, 성령의 아홉 가지 열매가 나타난다.', size: 1.3 },
  { id: 'sermon-john3', label: '거듭남과 영생', type: 'sermon', subtitle: '요 3:1-16', detail: '하나님 나라는 거듭나지 않고는 볼 수 없으며, 아들을 믿는 자마다 영생을 얻는다.', size: 1.3 },

  // ── Passages (8) ──
  { id: 'passage-rom8', label: '로마서 8:1-11', type: 'passage', subtitle: '성령의 생명', detail: '그리스도 예수 안에 있는 자에게 결코 정죄함이 없으며, 성령의 법이 죄와 사망의 법에서 해방시킨다.', size: 2.0 },
  { id: 'passage-rom6', label: '로마서 6:1-14', type: 'passage', subtitle: '죄와 은혜', detail: '은혜 아래 있는 자가 죄 가운데 거하겠느냐? 세례는 그리스도와의 연합이며, 죄에 대해 죽은 자로 살아야 한다.', size: 1.5 },
  { id: 'passage-rom5', label: '로마서 5:1-11', type: 'passage', subtitle: '화목과 소망', detail: '칭의를 얻은 자는 하나님과 화평을 누리며, 환난 중에도 소망 가운데 즐거워한다.', size: 1.5 },
  { id: 'passage-rom3', label: '로마서 3:21-31', type: 'passage', subtitle: '믿음의 의', detail: '율법 외에 하나님의 의가 나타나서 믿음으로 말미암아 모든 믿는 자에게 미치게 되었다.', size: 1.5 },
  { id: 'passage-gen1', label: '창세기 1:1-5', type: 'passage', subtitle: '천지 창조', detail: '태초에 하나님이 천지를 창조하시니라. 빛이 있으라 하시매 빛이 있었고, 보시기에 좋았더라.', size: 1.2 },
  { id: 'passage-ps23', label: '시편 23:1-6', type: 'passage', subtitle: '선한 목자', detail: '여호와는 나의 목자시니 내게 부족함이 없으며, 사망의 음침한 골짜기에서도 주가 나와 함께 하신다.', size: 1.3 },
  { id: 'passage-mat5', label: '마태복음 5:1-12', type: 'passage', subtitle: '팔복', detail: '심령이 가난한 자, 애통하는 자, 온유한 자, 의에 주리고 목마른 자에게 천국이 있다.', size: 1.2 },
  { id: 'passage-john3', label: '요한복음 3:16', type: 'passage', subtitle: '하나님의 사랑', detail: '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 그를 믿는 자마다 영생을 얻는다.', size: 1.3 },

  // ── Themes (8) ──
  { id: 'theme-spirit', label: '성령', type: 'theme', subtitle: '내주하시는 하나님', detail: '성령은 삼위일체의 제삼위로서, 믿는 자 안에 내주하시며 인도하시고 능력을 주신다. 로마서 8장의 핵심 주제.', size: 1.8 },
  { id: 'theme-freedom', label: '자유', type: 'theme', subtitle: '율법과 죄에서 해방', detail: '그리스도 안에서 죄와 사망의 법에서 해방되어 하나님의 자녀의 영광스러운 자유를 누린다.', size: 1.5 },
  { id: 'theme-life', label: '생명', type: 'theme', subtitle: '영원한 생명', detail: '성령의 생각은 생명과 평안이며, 그리스도 안에서 약속된 영생과 현재의 풍성한 삶을 의미한다.', size: 1.5 },
  { id: 'theme-grace', label: '은혜', type: 'theme', subtitle: '값없이 주시는 선물', detail: '하나님의 은혜는 우리의 행위와 무관하게 값없이 주어지는 구원의 선물이며, 모든 선한 일의 근원이다.', size: 1.6 },
  { id: 'theme-faith', label: '믿음', type: 'theme', subtitle: '의지와 신뢰', detail: '하나님과 그리스도에 대한 인격적 신뢰로서, 의롭다 하심을 받는 유일한 수단이다.', size: 1.4 },
  { id: 'theme-love', label: '사랑', type: 'theme', subtitle: '아가페', detail: '하나님의 자기희생적 사랑이 그리스도의 십자가에 나타났으며, 성도의 삶의 가장 뛰어난 길이다.', size: 1.5 },
  { id: 'theme-repent', label: '회개', type: 'theme', subtitle: '마음의 전환', detail: '죄로부터 돌아서서 하나님께로 향하는 마음의 근본적 전환, 용서와 새 삶의 시작이다.', size: 1.2 },
  { id: 'theme-hope', label: '소망', type: 'theme', subtitle: '미래를 향한 확신', detail: '그리스도의 부활에 근거한 확실한 미래의 약속으로, 현재의 고난을 견디게 하는 능력이다.', size: 1.3 },

  // ── Greek Words (7) ──
  { id: 'word-katakrima', label: 'κατάκριμα', type: 'word', subtitle: '정죄 (G2631)', detail: '법정 용어로 유죄 판결을 의미한다. 롬 8:1에서 "결코 정죄함이 없다"는 선언은 그리스도의 대속으로 완전한 사면을 선포한다.', size: 1.4 },
  { id: 'word-pneuma', label: 'πνεῦμα', type: 'word', subtitle: '영 (G4151)', detail: '바람, 숨, 생기를 의미하며 성령 하나님을 가리킨다. 로마서 8장에 20회 이상 등장하는 핵심 키워드.', size: 1.5 },
  { id: 'word-nomos', label: 'νόμος', type: 'word', subtitle: '율법 (G3551)', detail: '모세 율법 또는 어떤 원리나 질서를 의미한다. 바울은 율법 자체의 선함과 동시에 율법의 한계를 논증한다.', size: 1.3 },
  { id: 'word-eleutheroo', label: 'ἐλευθερόω', type: 'word', subtitle: '해방하다 (G1659)', detail: '노예를 자유인으로 풀어주는 행동을 의미한다. 성령의 법이 우리를 죄와 사망에서 해방시켰다.', size: 1.3 },
  { id: 'word-phronema', label: 'φρόνημα', type: 'word', subtitle: '생각/지향 (G5427)', detail: '단순한 지적 활동이 아닌 삶의 방향과 가치관을 결정하는 내적 지향점을 의미하는 바울의 독특한 용어.', size: 1.3 },
  { id: 'word-sarx', label: 'σάρξ', type: 'word', subtitle: '육신 (G4561)', detail: '죄의 영향을 받은 인간의 타고난 본성으로, 하나님을 거역하는 성향을 가리킨다.', size: 1.3 },
  { id: 'word-dikaiosyne', label: 'δικαιοσύνη', type: 'word', subtitle: '의 (G1343)', detail: '하나님의 의로운 성품과 그분이 믿는 자에게 값없이 주시는 의의 선물을 의미한다.', size: 1.2 },

  // ── Notes (6) ──
  { id: 'note-linguistic', label: 'φρόνημα의 신학적 의미', type: 'note', subtitle: '언어학적 통찰', detail: 'φρόνημα는 아리스토텔레스 윤리학의 "실천적 지혜"에서 유래했으나, 바울은 이 단어를 사용하여 인간 존재의 가장 깊은 방향 정향을 표현한다. 단순한 인지(cognitio)를 넘어 전 인격의 지향점(orientation)이다.', size: 1.1 },
  { id: 'note-theological', label: '롬 8:1-4의 법정적 은유', type: 'note', subtitle: '신학적 통찰', detail: '1절의 "정죄"(κατάκριμα)와 3절의 "정죄하셨다"(κατέκρινε)는 동일 어근의 반복이다. 우리가 받아야 할 정죄가 그리스도께 대신 집행된 전가(imputation)의 원리가 선명하게 드러난다.', size: 1.1 },
  { id: 'note-pastoral', label: '성령의 인도하심의 실제성', type: 'note', subtitle: '목회적 통찰', detail: '5-8절에서 육신의 생각과 성령의 생각의 대조는 성도에게 "더 노력하라"는 율법주의가 아니라 "성령께 의탁하라"는 복음을 가르쳐야 함을 보여준다. 성화의 길은 성령의 동행이지 인간의 노력이 아니다.', size: 1.0 },
  { id: 'note-historical', label: '루터의 로마서 8장 이해', type: 'note', subtitle: '역사적 통찰', detail: '루터는 로마서 8장을 "그리스도인의 자유에 대한 가장 웅장한 선언"이라 불렀다. 그는 칭의의 능동적 측면(그리스도 안에서의 자유)과 수동적 측면(성령의 내주)을 구분하여 설명했다.', size: 1.0 },
  { id: 'note-application', label: '정죄감을 이기는 말씀', type: 'note', subtitle: '적용 노트', detail: '죄책감과 정죄감이 들 때마다 "그리스도 예수 안에는 정죄함이 없다"는 롬 8:1을 선포하는 훈련이 필요하다. 이 말씀은 단순한 위로가 아니라 객관적 사실에 근거한 선언이다.', size: 1.0 },
  { id: 'note-connection', label: '엡 2:8-9와 롬 3:28의 연결', type: 'note', subtitle: '연결 노트', detail: '바울의 칭의 교리는 로마서와 에베소서에서 동일한 구조를 가진다. 인간의 행위가 아닌 믿음을 통한 은혜의 선물이라는 점이 일관되게 강조된다. 두 본문 모두 자랑을 배제한다.', size: 1.0 },

  // ── Series (4) ──
  { id: 'series-romans', label: '로마서 강해', type: 'series', subtitle: '2026년 상반기', detail: '로마서를 1장부터 16장까지 강해하는 시리즈. 칭의, 성화, 하나님의 주권, 그리스도인의 삶을 다룬다.', size: 1.6 },
  { id: 'series-sermonmount', label: '산상수훈 강해', type: 'series', subtitle: '2025년 상반기', detail: '마태복음 5-7장의 산상수훈을 강해한 시리즈. 팔복, 율법의 완성, 기도, 보물 등 예수의 가르침을 탐구.', size: 1.2 },
  { id: 'series-ephesians', label: '에베소서 강해', type: 'series', subtitle: '2025년 하반기', detail: '에베소서를 강해하며 교회의 정체성, 그리스도 안의 신분, 성도의 삶을 조명한 시리즈.', size: 1.2 },
  { id: 'series-psalms', label: '시편 묵상', type: 'series', subtitle: '2025년 특별시리즈', detail: '시편을 통해 기도와 찬양의 본질을 탐구하고, 고난과 회복 속에서 하나님을 만나는 시리즈.', size: 1.1 },
]

export const GRAPH_EDGES: GraphEdge[] = [
  // ── Sermon → Passage ──
  { source: 'sermon-current', target: 'passage-rom8', label: '본문', weight: 3 },
  { source: 'sermon-rom3', target: 'passage-rom3', label: '본문', weight: 3 },
  { source: 'sermon-rom5', target: 'passage-rom5', label: '본문', weight: 3 },
  { source: 'sermon-rom6', target: 'passage-rom6', label: '본문', weight: 3 },
  { source: 'sermon-rom8b', target: 'passage-rom8', label: '본문', weight: 3 },
  { source: 'sermon-eph2', target: 'passage-rom3', label: '연결', weight: 2 },
  { source: 'sermon-ps23', target: 'passage-ps23', label: '본문', weight: 3 },
  { source: 'sermon-gal5', target: 'passage-rom8', label: '연결', weight: 2 },
  { source: 'sermon-john3', target: 'passage-john3', label: '본문', weight: 3 },
  { source: 'sermon-john3', target: 'passage-rom5', label: '연결', weight: 1 },

  // ── Sermon → Theme ──
  { source: 'sermon-current', target: 'theme-spirit', label: '강조', weight: 3 },
  { source: 'sermon-current', target: 'theme-freedom', label: '강조', weight: 2 },
  { source: 'sermon-current', target: 'theme-life', label: '강조', weight: 2 },
  { source: 'sermon-current', target: 'theme-grace', label: '관련', weight: 1 },
  { source: 'sermon-rom3', target: 'theme-faith', label: '강조', weight: 3 },
  { source: 'sermon-rom3', target: 'theme-grace', label: '강조', weight: 2 },
  { source: 'sermon-rom5', target: 'theme-hope', label: '강조', weight: 3 },
  { source: 'sermon-rom5', target: 'theme-love', label: '강조', weight: 2 },
  { source: 'sermon-rom6', target: 'theme-grace', label: '강조', weight: 3 },
  { source: 'sermon-rom6', target: 'theme-freedom', label: '관련', weight: 2 },
  { source: 'sermon-rom8b', target: 'theme-love', label: '강조', weight: 3 },
  { source: 'sermon-rom8b', target: 'theme-hope', label: '강조', weight: 2 },
  { source: 'sermon-eph2', target: 'theme-grace', label: '강조', weight: 3 },
  { source: 'sermon-eph2', target: 'theme-faith', label: '관련', weight: 2 },
  { source: 'sermon-ps23', target: 'theme-life', label: '관련', weight: 2 },
  { source: 'sermon-ps23', target: 'theme-hope', label: '관련', weight: 1 },
  { source: 'sermon-gal5', target: 'theme-spirit', label: '강조', weight: 3 },
  { source: 'sermon-gal5', target: 'theme-love', label: '강조', weight: 2 },
  { source: 'sermon-john3', target: 'theme-life', label: '강조', weight: 3 },
  { source: 'sermon-john3', target: 'theme-faith', label: '강조', weight: 2 },
  { source: 'sermon-john3', target: 'theme-repent', label: '관련', weight: 2 },

  // ── Sermon → Series ──
  { source: 'sermon-current', target: 'series-romans', label: '소속', weight: 2 },
  { source: 'sermon-rom3', target: 'series-romans', label: '소속', weight: 2 },
  { source: 'sermon-rom5', target: 'series-romans', label: '소속', weight: 2 },
  { source: 'sermon-rom6', target: 'series-romans', label: '소속', weight: 2 },
  { source: 'sermon-rom8b', target: 'series-romans', label: '소속', weight: 2 },
  { source: 'sermon-eph2', target: 'series-ephesians', label: '소속', weight: 2 },
  { source: 'sermon-ps23', target: 'series-psalms', label: '소속', weight: 2 },

  // ── Passage → Word ──
  { source: 'passage-rom8', target: 'word-katakrima', label: '원어', weight: 2 },
  { source: 'passage-rom8', target: 'word-pneuma', label: '원어', weight: 3 },
  { source: 'passage-rom8', target: 'word-nomos', label: '원어', weight: 2 },
  { source: 'passage-rom8', target: 'word-eleutheroo', label: '원어', weight: 2 },
  { source: 'passage-rom8', target: 'word-phronema', label: '원어', weight: 2 },
  { source: 'passage-rom8', target: 'word-sarx', label: '원어', weight: 2 },
  { source: 'passage-rom3', target: 'word-dikaiosyne', label: '원어', weight: 2 },
  { source: 'passage-rom3', target: 'word-nomos', label: '원어', weight: 2 },
  { source: 'passage-rom5', target: 'word-dikaiosyne', label: '원어', weight: 1 },
  { source: 'passage-rom6', target: 'word-nomos', label: '원어', weight: 1 },
  { source: 'passage-rom6', target: 'word-sarx', label: '원어', weight: 1 },
  { source: 'passage-ps23', target: 'word-pneuma', label: '연결', weight: 1 },

  // ── Passage → Passage (parallel) ──
  { source: 'passage-rom8', target: 'passage-rom6', label: '평행', weight: 2 },
  { source: 'passage-rom8', target: 'passage-rom5', label: '평행', weight: 2 },
  { source: 'passage-rom8', target: 'passage-rom3', label: '평행', weight: 1 },
  { source: 'passage-rom8', target: 'passage-john3', label: '연결', weight: 1 },
  { source: 'passage-ps23', target: 'passage-john3', label: '연결', weight: 1 },

  // ── Note → Sermon / Passage ──
  { source: 'note-linguistic', target: 'passage-rom8', label: '참조', weight: 1 },
  { source: 'note-linguistic', target: 'word-phronema', label: '참조', weight: 2 },
  { source: 'note-theological', target: 'passage-rom8', label: '참조', weight: 1 },
  { source: 'note-theological', target: 'word-katakrima', label: '참조', weight: 2 },
  { source: 'note-pastoral', target: 'sermon-current', label: '참조', weight: 1 },
  { source: 'note-pastoral', target: 'passage-rom8', label: '참조', weight: 1 },
  { source: 'note-historical', target: 'sermon-current', label: '참조', weight: 1 },
  { source: 'note-historical', target: 'theme-freedom', label: '참조', weight: 1 },
  { source: 'note-application', target: 'sermon-current', label: '참조', weight: 1 },
  { source: 'note-application', target: 'passage-rom8', label: '참조', weight: 1 },
  { source: 'note-connection', target: 'passage-rom3', label: '참조', weight: 1 },
  { source: 'note-connection', target: 'sermon-eph2', label: '참조', weight: 1 },

  // ── Theme → Word ──
  { source: 'theme-spirit', target: 'word-pneuma', label: '연결', weight: 2 },
  { source: 'theme-freedom', target: 'word-eleutheroo', label: '연결', weight: 2 },
  { source: 'theme-life', target: 'word-pneuma', label: '연결', weight: 1 },
  { source: 'theme-grace', target: 'word-dikaiosyne', label: '연결', weight: 2 },
  { source: 'theme-faith', target: 'word-dikaiosyne', label: '연결', weight: 1 },

  // ── Series → Passage ──
  { source: 'series-romans', target: 'passage-rom8', label: '범위', weight: 1 },
  { source: 'series-romans', target: 'passage-rom6', label: '범위', weight: 1 },
  { source: 'series-romans', target: 'passage-rom5', label: '범위', weight: 1 },
  { source: 'series-romans', target: 'passage-rom3', label: '범위', weight: 1 },
]

export function getNodeConnections(nodeId: string, edges: GraphEdge[]): { sources: GraphEdge[]; targets: GraphEdge[] } {
  return {
    sources: edges.filter(e => e.source === nodeId),
    targets: edges.filter(e => e.target === nodeId),
  }
}

export function getNeighborIds(nodeId: string, edges: GraphEdge[]): string[] {
  const ids: string[] = []
  edges.forEach(e => {
    if (e.source === nodeId) ids.push(e.target)
    if (e.target === nodeId) ids.push(e.source)
  })
  return Array.from(new Set(ids))
}
