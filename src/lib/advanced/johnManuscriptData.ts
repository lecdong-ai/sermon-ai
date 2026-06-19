export interface SermonSection {
  id: string
  type: 'introduction' | 'body' | 'conclusion' | 'application'
  label: string
  passage?: string
  content: string
  researchPoints?: string[]
  applicationDirection?: string
  wordCount?: number
  aiGenerated?: boolean
}

export interface IllustrationNote {
  id: string
  title: string
  content: string
  status: '사용' | '보류' | '검토중'
  source?: string
  category?: string
  connection?: string
  tags?: string[]
  relatedVerses?: string[]
  applicationTip?: string
  linkedSectionId?: string
}

export interface ReferenceNote {
  id: string
  title: string
  content: string
  category: 'commentary' | 'theology' | 'historical' | 'pastoral' | 'warning'
  author?: string
  book?: string
  tags?: string[]
  linkedSectionId?: string
}

export interface JohnManuscriptData {
  title: string
  oneSentenceSummary: string
  passage: string
  sermonDate: string
  audience: string
  tone: string
  sections: SermonSection[]
  illustrationNotes: IllustrationNote[]
  referenceNotes: ReferenceNote[]
  coreMessage: string
  outlinePoints: { title: string; passage: string; content: string }[]
  prepInsights: string[]
  warningPoints: string[]
  greekWords: { word: string; greek: string; meaning: string; note: string }[]
  relatedPassages: { ref: string; text: string; reason: string }[]
}

export const EMPTY_MANUSCRIPT: JohnManuscriptData = {
  title: '',
  oneSentenceSummary: '',
  passage: '',
  sermonDate: '',
  audience: '',
  tone: '',
  sections: [],
  illustrationNotes: [],
  referenceNotes: [],
  coreMessage: '',
  outlinePoints: [],
  prepInsights: [],
  warningPoints: [],
  greekWords: [],
  relatedPassages: [],
}

export const JOHN_MANUSCRIPT: JohnManuscriptData = {
  title: '태초부터 계신 말씀',
  oneSentenceSummary: '예수 그리스도는 태초부터 하나님과 함께 계신 말씀이시며, 우리에게 참 생명과 빛으로 오신 분이시다.',
  passage: '요한복음 1:1-5',
  sermonDate: '2026-06-14',
  audience: '장년',
  tone: '경외감과 소망 — 익숙한 본문을 새롭게 선포하되, 그리스도 중심성을 잃지 않게',

  coreMessage: '예수 그리스도는 태초부터 하나님과 함께 계신 말씀이시며, 그 안에 생명이 있고 그 생명은 사람들의 빛이다.',

  outlinePoints: [
    {
      title: '태초부터 계신 말씀',
      passage: '요 1:1-2',
      content: '요한은 창세기 1:1을 의도적으로 연상시키며, 예수님이 시간과 창조의 시작 이전에 이미 존재하셨음을 선포한다. 말씀(λόγος)은 단순한 개념이 아니라 하나님과 함께 계신 인격적 실재다.',
    },
    {
      title: '생명과 빛으로 오신 말씀',
      passage: '요 1:3-4',
      content: '만물이 그로 말미암아 지은 바 되었다. 그 안에 생명이 있었고, 그 생명은 사람들의 빛이었다. 예수님은 창조의 매개자이시며, 생명의 근원이시며, 빛의 소유자이시다.',
    },
    {
      title: '어둠을 이기는 빛',
      passage: '요 1:5',
      content: '빛이 어둠에 비치되 어둠이 깨닫지 못하더라(정복하지 못하더라). 이 빛은 어떤 어둠도 이길 수 없는 하나님의 능력이다.',
    },
  ],

  prepInsights: [
    'logos를 지나치게 철학적 개념으로만 설명하지 말 것 — 인격적 그리스도를 선포해야 한다',
    '빛/어둠의 대비는 단순 심리적 상태가 아니라 구원사적 긴장을 담고 있음',
    '익숙한 본문일수록 추상적 진술에 머물지 않고 그리스도 중심으로 선포해야 함',
    '"태초에"는 창세기 1:1의 bereshit를 의도적으로 인용 — 새 창조의 서막',
  ],

  warningPoints: [
    'logos를 헬라 철학의 보편적 이성으로만 해석하면 인격적 그리스도가 추상적 원리로 전락한다',
    '빛/어둠 이분법을 도덕주의(선/악)로 축소하지 말 것 — 이것은 구원사적 계시의 문제다',
    '서론에서 문제 제기가 본문보다 앞서지 않게 할 것 — 본문이 항상 중심이어야 한다',
  ],

  greekWords: [
    { word: 'logos', greek: 'λόγος', meaning: '말씀, 말, 이성', note: '하나님의 자기 계시의 궁극적 표현 — 인격적 그리스도' },
    { word: 'zoe', greek: 'ζωή', meaning: '생명', note: '생물학적 생명(bios)이 아닌, 하나님께로부터 오는 영원한 생명' },
    { word: 'phos', greek: 'φῶς', meaning: '빛', note: '계시, 진리, 구원을 상징 — 하나님의 자기 드러내심' },
    { word: 'skotia', greek: 'σκοτία', meaning: '어둠', note: '영적 무지, 죄, 하나님으로부터의 단절' },
  ],

  relatedPassages: [
    { ref: '창 1:1-3', text: '태초에 하나님이 천지를 창조하시니라 ... 하나님이 이르시되 빛이 있으라', reason: '요한 1:1의 "태초에"는 창세기 1:1을 의도적으로 연상 — 새 창조의 서막' },
    { ref: '골 1:15-17', text: '그는 보이지 아니하는 하나님의 형상이시요 ... 만물이 그에게서 창조되되', reason: '그리스도의 창조 사역 — 요한의 logos 신학과 평행' },
    { ref: '히 1:1-3', text: '이 아들을 만유의 상속자로 세우시고 ... 그의 영광의 광채시요', reason: '그리스도를 하나님의 궁극적 계시로 선포' },
  ],

  sections: [
    {
      id: 'intro',
      type: 'introduction',
      label: '서론',
      content: `오늘 우리가 함께 읽을 본문은 아마도 성경에서 가장 유명한 구절 중 하나일 것입니다. "태초에 말씀이 계시니라." 이 말씀을 들어본 적이 없는 분이 계실까요? 주일학교에서도 배우고, 성경공부에서도 반복하고, 찬송가에서도 노래하는 이 말씀 — 그런데 익숙함은 때로 우리를 무디게 합니다.

오늘 우리는 이 익숙한 본문을 다시, 새롭게, 그러나 더 깊이 대하고자 합니다. 요한은 이 서론을 통해 예수님이 누구신지를 선포합니다. 단순한 교사도, 위대한 선지자도, 도덕적 모범도 아닙니다. 요한은 예수님을 "태초부터 하나님과 함께 계신 말씀"으로 선포합니다.

이 말씀이 오늘 우리에게 무엇을 말하는지, 함께 살펴보겠습니다.`,
      researchPoints: [
        '창세기 1:1의 "태초에"(bereshit)를 의도적으로 인용',
        'logos는 그리스 철학의 개념이 아니라 하나님의 인격적 자기 계시',
      ],
    },
    {
      id: 'point1',
      type: 'body',
      label: '1. 태초부터 계신 말씀',
      passage: '요 1:1-2',
      content: `"태초에 말씀이 계시니라 이 말씀이 하나님과 함께 계셨으니 이 말씀은 곧 하나님이시니라" (1절)

요한은 창세기 1:1을 의도적으로 연상시키며 시작합니다. 창세기는 "태초에 하나님이 천지를 창조하시니라"라고 말하고, 요한은 "태초에 말씀이 계시니라"라고 말합니다. 이것은 우연이 아닙니다. 요한은 예수님이 창조의 시작 이전에 이미 존재하셨음을 선포하고 있는 것입니다.

"말씀"(λόγος, logos) — 이 단어는 요한이 의도적으로 선택한 표현입니다. 유대인 독자들에게 "하나님의 말씀"은 창조의 매개자였습니다(시 33:6, "그 말씀으로 하늘이 지음이 되었도다"). 헬라어 독자들에게 logos는 우주를 다스리는 이성적 원리였습니다. 그러나 요한은 이 모든 것을 초월하여, logos가 인격적 그리스도이심을 선포합니다.

"이 말씀이 하나님과 함께 계셨으니" — 여기서 "함께 계셨다"(pros)는 단순한 공존이 아니라, 친밀한 교제와 구별을 나타냅니다. 아버지와 아들은 구별되시지만, 영원한 교제 가운데 계십니다.

"이 말씀은 곧 하나님이시니라" — 이것이 요한 복음의 정점입니다. 예수님은 피조물이 아닙니다. 예수님은 하나님이십니다. 그러나 아버지와 동일하지는 않습니다(모달리즘이 아닙니다). 요한은 이 놀라운 신비를 한 절 안에 압축합니다: 말씀은 하나님과 함께 계셨고, 말씀은 하나님이셨습니다.

2절은 이를 확인합니다: "그가 태초에 하나님과 함께 계셨고." 요한은 같은 진술을 반복하여, 이것이 기독교 신앙의 기초임을 강조합니다.`,
      researchPoints: [
        'en arche(태초에) = 창 1:1의 bereshit — 새 창조의 서막',
        'ēn(계셨다)은 과거 계속형 — 태초부터 계속 존재하셨음',
        'pros ton theon(하나님과 함께) — 친밀한 교제와 구별',
      ],
      applicationDirection: '우리의 신앙은 추상적 개념이 아니라 살아 계신 그리스도께 기초한다. 예수님은 창세전부터 계신 분이시며, 우리의 구원은 시간의 우연이 아니라 영원한 계획 안에 있다.',
    },
    {
      id: 'point2',
      type: 'body',
      label: '2. 생명과 빛으로 오신 말씀',
      passage: '요 1:3-4',
      content: `"만물이 그로 말미암아 지은 바 되었으니 지은 것이 하나도 그가 없이는 지은 것이 없느니라 그 안에 생명이 있었으니 이 생명은 사람들의 빛이라" (3-4절)

3절은 예수님이 창조의 매개자이심을 선포합니다. "만물이 그로 말미암아 지은 바 되었으니" — 여기서 "만물"(πάντα)은 우주 전체를 의미합니다. 예수님은 창조의 대상이 아니라 창조의 주체이십니다.

요한은 이중 부정으로 이를 강조합니다: "지은 것이 하나도 그가 없이는 지은 것이 없느니라." 이것은 논리적 완결입니다. 만약 예수님이 피조물이라면, 그는 자신을 창조할 수 없습니다. 그러나 요한은 예수님이 만물의 창조자이므로 피조물이 아임을 논증합니다.

4절: "그 안에 생명이 있었으니." 여기서 "생명"(ζωή, zoe)은 단순한 생물학적 존재가 아닙니다. 이것은 하나님과의 교제 안에서 누리는 영원한 생명입니다. 예수님은 생명의 근원이십니다.

"이 생명은 사람들의 빛이라." 생명과 빛은 요한 신학에서 불가분의 관계입니다. 생명이 빛의 내용이고, 빛이 생명의 표현입니다. 예수님 안에 있는 생명은 어둠 가운데 있는 사람들에게 비추는 빛입니다.

이것은 단순한 철학적 진술이 아닙니다. 이것은 복음입니다. 우리가 죽어 있을 때, 예수님이 생명이 되어주셨습니다. 우리가 어둠 가운데 있을 때, 예수님이 빛이 되어주셨습니다.`,
      researchPoints: [
        'panta(만물) — 우주 전체, 예수님은 창조의 주체',
        'zoe(생명) — 생물학적 생명(bios)이 아닌 영생',
        'phos(빛) — 계시, 진리, 구원의 상징',
      ],
      applicationDirection: '예수님이 생명의 근원이시므로, 우리는 그분 안에서만 참된 생명을 찾을 수 있다. 세상의 것들에서 생명과 빛을 찾으려 하지 말고, 그리스도께로 나아가라.',
    },
    {
      id: 'point3',
      type: 'body',
      label: '3. 어둠을 이기는 빛',
      passage: '요 1:5',
      content: `"빛이 어둠에 비치되 어둠이 깨닫지 못하더라" (5절)

5절은 요한 복음의 핵심 긴장을 보여줍니다. "빛이 어둠에 비치되" — 여기서 "비치다"(φαίνει, phainei)는 현재형입니다. 빛이 지속적으로 비추고 있습니다. 이것은 일회성 사건이 아니라, 그리스도의 빛이 계속 비추고 있음을 의미합니다.

"어둠이 깨닫지 못하더라" — 여기서 "깨닫지 못하더라"(οὐ κατέλαβεν)는 중의적 의미를 가집니다. "이해하지 못했다"와 "정복하지 못했다"는 두 의미를 모두 포함합니다.

NIV는 "the darkness has not overcome it"(정복하지 못했다)로 번역했습니다. 개역개정은 "어둠이 깨닫지 못하더라"(이해하지 못했다)로 번역했습니다. 두 의미 모두 요한의 의도와 부합합니다: 어둠은 빛을 이해하지도 못했고, 정복하지도 못했습니다.

이것은 우리에게는 소망입니다. 우리의 어둠이 아무리 깊어도, 그리스도의 빛은 그것을 이깁니다. 우리의 무지가 아무리 커도, 그리스도의 빛은 그것을 밝힙니다.

이 선언은 요한 복음 전체를 관통하는 주제입니다. 빛은 어둠을 이깁니다. 생명은 사망을 이깁니다. 은혜는 죄를 이깁니다. 그리고 이것은 예수 그리스도 안에서 이미 성취되었습니다.`,
      researchPoints: [
        'phainei(비치다)는 현재형 — 지속적인 빛의 비춤',
        'katalambanō는 "이해하다"와 "정복하다"는 중의적 의미',
        'NIV: "has not overcome" / 개역: "깨닫지 못하더라"',
      ],
      applicationDirection: '어둠이 아무리 깊어도 빛은 그것을 이긴다. 오늘의 어둠(염려, 두려움, 죄책감)이 그리스도의 빛을 이길 수 없다. 이 소망을 붙들라.',
    },
    {
      id: 'conclusion',
      type: 'conclusion',
      label: '결론',
      content: `사랑하는 성도 여러분, 오늘 우리는 요한의 놀라운 선포를 들었습니다.

예수 그리스도는 태초부터 하나님과 함께 계신 말씀이십니다. 그분은 피조물이 아니라 창조주이십니다. 그분 안에 생명이 있고, 그 생명은 우리의 빛입니다. 그리고 그 빛은 어떤 어둠도 이길 수 없습니다.

이것이 우리가 붙드는 복음입니다. 이것이 우리의 소망입니다.

오늘 당신이 어떤 어둠 가운데 있든지 — 죄책감, 두려움, 불안, 절망 — 그리스도의 빛은 그것을 이길 수 있습니다. 어둠이 빛을 정복하지 못했습니다. 어둠이 빛을 이해하지 못했습니다. 그리고 오늘도 그 빛은 계속 비추고 있습니다.

"태초에 말씀이 계시니라." 이 말씀이 오늘 당신의 삶 가운데 역사하기를 주님의 이름으로 축복합니다.

아멘.`,
    },
    {
      id: 'application',
      type: 'application',
      label: '적용',
      content: `[장년 회중 적용]
이번 주, 매일 아침 "태초에 말씀이 계셨다"는 말씀을 선포하며 하루를 시작하십시오. 당신의 문제가 아무리 커도, 그리스도는 태초부터 계신 분이시며, 그분의 빛은 당신의 어둠을 이깁니다.

[고난 중인 성도 적용]
지금 어둠 가운데 있는 분들께: 요한 1:5는 당신을 위한 말씀입니다. "빛이 어둠에 비치되 어둠이 깨닫지 못하더라." 당신의 어둠이 그리스도의 빛을 이길 수 없습니다. 그 빛은 계속 비추고 있습니다.

[새가족 적용]
오늘 처음 오신 분들께: 예수님은 단순한 좋은 분이 아닙니다. 그분은 태초부터 하나님과 함께 계신 말씀이시며, 당신의 생명이 되시고 빛이 되시는 분입니다. 그분을 영접하십시오.`,
    },
  ],

  illustrationNotes: [
    {
      id: 'ill-001',
      title: '어거스틴의 회심',
      content: '어거스틴은 로마서 13:13-14을 읽은 후 "나는 그리스도 예수 안에 있는 자가 되었다"고 고백했다. 그의 회심은 요한 1:1의 살아 있는 증거다 — 말씀이 사람에게 오신 사건.',
      status: '사용',
      source: '어거스틴, 「고백록」 제8권',
    },
    {
      id: 'ill-002',
      title: '빛과 어둠의 대비 — 폭풍 속 등대',
      content: '폭풍이 몰아칠 때 등대의 빛은 흔들리지 않는다. 어둠이 아무리 깊어도 등불은 꺼지지 않는다. 그리스도의 빛도 마찬가지다. 우리의 상황은 변하지만, 그 빛은 영원히 비춘다.',
      status: '보류',
    },
    {
      id: 'ill-003',
      title: '루터의 "흔들리지 않는 뿌리"',
      content: '마틴 루터는 로마서 8장을 "그리스도인의 자유에 대한 가장 웅장한 선언"이라고 불렀다. "폭풍이 몰아칠 때 나뭇잎은 흔들려도 뿌리는 흔들리지 않는다."',
      status: '검토중',
      source: '루터의 로마서 강해',
    },
  ],

  referenceNotes: [
    {
      id: 'ref-001',
      title: 'logos의 신학적 의미',
      content: '요한의 logos는 그리스 철학의 보편적 이성이 아니라, 인격적 그리스도 자체를 가리킨다. 칼빈은 이를 "하나님의 자기 계시의 궁극적 표현"이라고 했다.',
      category: 'theology',
    },
    {
      id: 'ref-002',
      title: '창세기 1:1과의 연결',
      content: '요한 1:1의 "태초에"(en arche)는 창세기 1:1의 "태초에"(bereshit)를 의도적으로 인용한 것이다. 요한은 예수님을 새 창조의 시작점으로 제시한다.',
      category: 'commentary',
    },
    {
      id: 'ref-003',
      title: 'logos를 철학 용어로만 오해시키지 않도록 주의',
      content: '설교에서 logos를 지나치게 철학적 개념으로 설명하면 회중이 예수님을 추상적 원리로 오해할 수 있다. 반드시 인격적 그리스도로 연결해야 한다.',
      category: 'warning',
    },
    {
      id: 'ref-004',
      title: '빛/어둠의 중의적 의미',
      content: '5절의 "깨닫지 못하더라"는 "이해하지 못했다"와 "정복하지 못했다"는 두 의미를 모두 가진다. 설교에서 이 중의성을 모두 살리는 것이 좋다.',
      category: 'pastoral',
    },
  ],
}
