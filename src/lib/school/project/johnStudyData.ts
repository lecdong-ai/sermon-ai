export interface JohnVerse {
  verse: number
  greek: string
  translit: string
  korean: string
  niv: string
  esv: string
}

export interface JohnWordDetail {
  id: string
  strong: string
  lemma: string
  lemmaGreek: string
  pronunciation: string
  transliteration: string
  partOfSpeech: string
  morphology: string
  basicMeaning: string
  contextualMeaning: string
  simpleExplanation: string
  sermonNote: string
  usage: { ref: string; text: string }[]
  relatedWords: string[]
}

export interface JohnCommentary {
  verse: number
  author: string
  text: string
  type: 'exegetical' | 'theological' | 'historical' | 'pastoral'
  source: string
}

export interface JohnParallelPassage {
  ref: string
  text: string
  relation: 'direct_quote' | 'allusion' | 'thematic' | 'typology'
  description: string
}

export interface JohnTranslationNote {
  verse: number
  note: string
  versions: string[]
  preachingNote?: string
}

export const JOHN_VERSES: JohnVerse[] = [
  {
    verse: 1,
    greek: 'Ἐν ἀρχῇ ἦν ὁ λόγος, καὶ ὁ λόγος ἦν πρὸς τὸν θεόν, καὶ θεὸς ἦν ὁ λόγος.',
    translit: 'En archē ēn ho logos, kai ho logos ēn pros ton theon, kai theos ēn ho logos.',
    korean: '태초에 말씀이 계시니라 이 말씀이 하나님과 함께 계셨으니 이 말씀은 곧 하나님이시니라',
    niv: 'In the beginning was the Word, and the Word was with God, and the Word was God.',
    esv: 'In the beginning was the Word, and the Word was with God, and the Word was God.',
  },
  {
    verse: 2,
    greek: 'οὗτος ἦν ἐν ἀρχῇ πρὸς τὸν θεόν.',
    translit: 'Houtos ēn en archē pros ton theon.',
    korean: '그가 태초에 하나님과 함께 계셨고',
    niv: 'He was with God in the beginning.',
    esv: 'He was in the beginning with God.',
  },
  {
    verse: 3,
    greek: 'πάντα διʼ αὐτοῦ ἐγένετο, καὶ χωρὶς αὐτοῦ ἐγένετο οὐδὲ ἕν ὃ γέγονεν.',
    translit: 'Panta di autou egeneto, kai chōris autou egeneto oude hen ho gegonen.',
    korean: '만물이 그로 말미암아 지은 바 되었으니 지은 것이 하나도 그가 없이는 지은 것이 없느니라',
    niv: 'Through him all things were made; without him nothing was made that has been made.',
    esv: 'All things were made through him, and without him was not any thing made that was made.',
  },
  {
    verse: 4,
    greek: 'ἐν αὐτῷ ζωὴ ἦν, καὶ ἡ ζωὴ ἦν τὸ φῶς τῶν ἀνθρώπων·',
    translit: 'En autō zōē ēn, kai hē zōē ēn to phōs tōn anthrōpōn.',
    korean: '그 안에 생명이 있었으니 이 생명은 사람들의 빛이라',
    niv: 'In him was life, and that life was the light of all mankind.',
    esv: 'In him was life, and the life was the light of men.',
  },
  {
    verse: 5,
    greek: 'καὶ τὸ φῶς ἐν τῇ σκοτίᾳ φαίνει, καὶ ἡ σκοτία αὐτὸ οὐ κατέλαβεν.',
    translit: 'Kai to phōs en tē skotia phainei, kai hē skotia auto ou katelaben.',
    korean: '빛이 어둠에 비치되 어둠이 깨닫지 못하더라',
    niv: 'The light shines in the darkness, and the darkness has not overcome it.',
    esv: 'The light shines in the darkness, and the darkness has not overcome it.',
  },
]

export const JOHN_WORDS: Record<string, JohnWordDetail> = {
  logos: {
    id: 'w-logos',
    strong: 'G3056',
    lemma: 'λόγος',
    lemmaGreek: 'λόγος',
    pronunciation: 'log-os',
    transliteration: 'logos',
    partOfSpeech: '명사 (Noun)',
    morphology: '주격 남성 단수',
    basicMeaning: '말씀, 말, 이성, 원리, 이야기',
    contextualMeaning: '요한복음에서 logos는 예수 그리스도 자신의 인격적 실재를 가리킨다. 단순한 "말"이 아니라, 하나님의 자기 계시의 궁극적 표현으로서의 인격체다.',
    simpleExplanation: 'logos는 원래 "말"이나 "이성"을 뜻하는 그리스어입니다. 요한은 이 단어를 사용하여 예수님이 하나님의 뜻을 완전히 드러내시는 분임을 선포합니다. 예수님은 단순한 메시지가 아니라, 메시지 그 자체이신 분입니다. 하나님이 누구신지 완전히 알려주시는 살아있는 말씀입니다.',
    usage: [
      { ref: '요 1:14', text: '말씀이 육신이 되어 우리 가운데 거하시매' },
      { ref: '요일 1:1', text: '생명의 말씀에 관하여는' },
      { ref: '계 19:13', text: '그 이름은 하나님의 말씀이라 칭함' },
    ],
    sermonNote: 'logos를 지나치게 그리스 철학(스토아 학파의 보편적 이성)으로만 해석하면 인격적 그리스도가 추상적 원리로 전락한다. 요한의 logos는 창세기 1장의 "하나님이 가라사대"와 연결되며, 하나님의 창조적·계시적 행위의 주체이신 인격적 그리스도를 가리킨다. 설교에서는 "말씀이 사람이 되셨다"(1:14)는 성육신의 신비를 강조해야 한다.',
    relatedWords: ['rhema', 'laleo', 'lego'],
  },
  zoe: {
    id: 'w-zoe',
    strong: 'G2222',
    lemma: 'ζωή',
    lemmaGreek: 'ζωή',
    pronunciation: 'dzo-ay',
    transliteration: 'zoe',
    partOfSpeech: '명사 (Noun)',
    morphology: '주격 여성 단수',
    basicMeaning: '생명, 삶, 살아있음',
    contextualMeaning: '요한복음에서 zoe는 단순한 생물학적 생명(bios)이 아니라, 하나님께로부터 오는 영원하고 질적인 생명, 즉 영생을 의미한다.',
    simpleExplanation: 'zoe는 우리가 일상에서 말하는 "산다"는 것과 다릅니다. 이것은 하나님께서 주시는 영원한 생명, 즉 하나님과의 관계 안에서 누리는 참된 생명을 말합니다. 예수님 안에 이 생명이 있고, 그 생명은 사람들의 빛이 됩니다.',
    usage: [
      { ref: '요 3:16', text: '영생을 얻게 하려 하심이니라' },
      { ref: '요 10:10', text: '내가 온 것은 양으로 생명을 얻게 하려 함이라' },
      { ref: '요 14:6', text: '내가 곧 길이요 진리요 생명이니' },
    ],
    sermonNote: 'zoe는 요한복음의 핵심 주제어다(36회 등장). bios(생물학적 생명)와 구별되는 질적이고 영원한 생명이다. 4절에서 "그 안에 생명이 있었다"는 것은 예수님이 생명의 근원이시라는 선언이다. 이 생명은 단순한 연장이 아니라 하나님과의 교제 안에서 누리는 참된 삶의 질이다. 설교에서 "영생"을 단순히 "죽은 후 천국 가는 것"으로 축소하지 말고, 현재 시작되는 하나님과의 관계로 설명해야 한다.',
    relatedWords: ['bios', 'psuche', 'zoopoieo'],
  },
  phos: {
    id: 'w-phos',
    strong: 'G5457',
    lemma: 'φῶς',
    lemmaGreek: 'φῶς',
    pronunciation: 'phoce',
    transliteration: 'phos',
    partOfSpeech: '명사 (Noun)',
    morphology: '주격 중성 단수',
    basicMeaning: '빛, 광명, 밝음',
    contextualMeaning: '요한복음에서 phos는 계시, 진리, 생명, 구원을 상징한다. 어둠(skotia)과 대조되며, 하나님의 자기 드러내심을 나타낸다.',
    simpleExplanation: 'phos는 물리적인 빛만이 아니라, 하나님의 진리와 계시를 상징합니다. 요한은 빛과 어둠의 대조를 통해 예수님이 오심으로 하나님의 진리가 세상에 드러났음을 선포합니다. 이 빛은 단순한 지식이 아니라 구원의 빛입니다.',
    usage: [
      { ref: '요 8:12', text: '나는 세상의 빛이라' },
      { ref: '요 9:5', text: '내가 세상에 있는 동안에는 세상의 빛이로라' },
      { ref: '요일 1:5', text: '하나님은 빛이시라' },
    ],
    sermonNote: '빛/어둠의 이분법은 요한 신학의 핵심 구조다. 여기서 빛은 단순한 "깨달음"이나 "도덕적 선"이 아니라, 하나님의 계시와 구원의 현실이다. 5절의 "비치다"(phainei)는 현재형으로, 빛이 지속적으로 비추고 있음을 나타낸다. "깨닫지 못하더라"(ou katelaben)는 "이해하지 못했다"와 "정복하지 못했다"는 중의적 의미를 가진다. 설교에서는 이 중의성을 살려, 어둠이 빛을 이해하지도 정복하지도 못했음을 강조할 수 있다.',
    relatedWords: ['phaino', 'photizo', 'skotia'],
  },
  skotia: {
    id: 'w-skotia',
    strong: 'G4653',
    lemma: 'σκοτία',
    lemmaGreek: 'σκοτία',
    pronunciation: 'skot-ee-ah',
    transliteration: 'skotia',
    partOfSpeech: '명사 (Noun)',
    morphology: '여격 여성 단수',
    basicMeaning: '어둠, 암흑, 무지',
    contextualMeaning: '요한복음에서 skotia는 영적 무지, 죄, 하나님으로부터의 단절을 상징한다. 빛(phos)과 대조되는 구원사적 개념이다.',
    simpleExplanation: 'skotia는 단순히 "빛이 없는 상태"가 아닙니다. 이것은 하나님을 알지 못하는 상태, 죄 가운데 있는 상태, 진리에서 멀리 떨어진 상태를 상징합니다. 요한은 이 어둠이 빛을 이기지 못했다고 선포합니다.',
    usage: [
      { ref: '요 3:19', text: '사람들이 빛보다 어둠을 더 사랑하였음이라' },
      { ref: '요 12:35', text: '어둠에 다니는 자는 그 가는 곳을 알지 못하느니라' },
      { ref: '요일 2:8', text: '어둠이 지나가고 참 빛이 벌써 비취느니라' },
    ],
    sermonNote: '5절의 "어둠이 깨닫지 못하더라"에서 katelaban은 "이해하다"와 "정복하다"는 두 의미를 모두 가진다. NIV는 "overcome"(정복하다)으로 번역했고, 개역개정은 "깨닫지 못하더라"(이해하지 못하다)로 번역했다. 두 의미 모두 요한의 신학적 의도와 부합한다: 어둠은 빛을 이해하지도, 정복하지도 못했다. 설교에서는 이 중의적 의미를 모두 살리는 것이 좋다.',
    relatedWords: ['skotos', 'skotizo'],
  },
  archē: {
    id: 'w-arche',
    strong: 'G746',
    lemma: 'ἀρχή',
    lemmaGreek: 'ἀρχή',
    pronunciation: 'ar-khay',
    transliteration: 'arche',
    partOfSpeech: '명사 (Noun)',
    morphology: '여격 여성 단수',
    basicMeaning: '시작, 근원, 처음, 통치',
    contextualMeaning: '요한복음 1:1의 "태초에"(en arche)는 창세기 1:1("태초에")을 의도적으로 연상시킨다. 요한은 새 창조의 서막을 선포하고 있다.',
    simpleExplanation: 'arche는 "시작"을 의미합니다. 요한은 창세기 1:1의 "태초에 하나님께서 천지를 창조하시니라"를 의도적으로 연상시키며, 예수님이 창세전부터 계셨음을 선포합니다. 이것은 예수님이 피조물이 아니라 창조주이심을 보여주는 결정적 증거입니다.',
    usage: [
      { ref: '창 1:1', text: '태초에 하나님이 천지를 창조하시니라' },
      { ref: '요일 1:1', text: '태초부터 있던 생명의 말씀에 관하여는' },
      { ref: '골 1:18', text: '그는 몸인 교회의 머리시라 그가 근본이시요' },
    ],
    sermonNote: 'en arche는 창 1:1의 bereshit를 의도적으로 인용한 것이다. 요한은 예수님이 시간과 창조의 시작 이전에 이미 존재하셨음을 선포한다. "계셨니라"(ēn)는 동사는 과거 계속형으로, 말씀이 태초부터 계속 존재하셨음을 나타낸다. 이는 예수님이 피조물이 아님을 보여주는 결정적 문법적 증거다.',
    relatedWords: ['archomai', 'archon', 'archegos'],
  },
  en: {
    id: 'w-en',
    strong: 'G1722',
    lemma: 'ἐν',
    lemmaGreek: 'ἐν',
    pronunciation: 'en',
    transliteration: 'en',
    partOfSpeech: '전치사 (Preposition)',
    morphology: '여격 전치사',
    basicMeaning: '~안에, ~에서, ~로써',
    contextualMeaning: '요한복음 1:3-4에서 "그로 말미암아"(di autou)와 "그 안에"(en autō)는 예수님이 창조의 매개이시며 생명의 근원이심을 보여준다.',
    simpleExplanation: 'en은 "~안에"라는 뜻의 전치사입니다. 4절에서 "그 안에 생명이 있었다"는 것은 예수님이 생명의 근원이시라는 뜻입니다. 생명은 예수님 밖에서 발견되는 것이 아니라, 예수님 안에서 발견됩니다.',
    usage: [
      { ref: '요 15:4', text: '내 안에 거하라 나도 너희 안에 거하리라' },
      { ref: '요 17:21', text: '아버지여, 내 안에, 내가 아버지 안에 있는 것 같이' },
      { ref: '골 1:17', text: '만물이 그 안에 함께 섰느니라' },
    ],
    sermonNote: 'en autō(그 안에)는 요한 신학에서 핵심적인 "안에서"의 신학을 보여준다. 생명, 빛, 진리, 사랑 — 이 모든 것이 예수님 "안에" 있다. 이것은 예수님이 이 모든 것의 근원이시라는 선언이다. 설교에서 "그 안에"라는 표현의 신학적 깊이를 강조하면 회중이 그리스도와의 연합의 의미를 더 깊이 이해할 수 있다.',
    relatedWords: ['eis', 'ek', 'dia'],
  },
}

export const JOHN_COMMENTARIES: JohnCommentary[] = [
  {
    verse: 1,
    author: '존 칼빈',
    type: 'exegetical',
    text: '요한은 그리스도의 신성을 밝히기 위해 "태초에"라는 표현으로 시작한다. 이는 그리스도가 시간의 시작 이전에 이미 존재하셨음을 의미한다. "말씀이 하나님과 함께 계셨으니" — 이는 아버지와 아들의 구별을 나타내며, "말씀이 하나님이시니라"는 본성의 일치를 선포한다.',
    source: '요한복음 주석 (Calvin\'s Commentaries)',
  },
  {
    verse: 1,
    author: 'D. A. 카슨',
    type: 'theological',
    text: '요한 1:1은 세 가지 절묘한 진술로 구성된다: (1) 말씀의 선재성("태초에 계셨다"), (2) 아버지와 아들의 구별("하나님과 함께 계셨다"), (3) 아들의 완전한 신성("말씀이 하나님이시니라"). 세 번째 절의 "theos"는 정관사가 없지만 질적 측면을 강조하는 보어적 용법이다.',
    source: '요한복음 주석 (Pillar NT Commentary)',
  },
  {
    verse: 1,
    author: 'C. K. 바렛',
    type: 'historical',
    text: '요한이 logos 개념을 사용한 배경에는 유대적 지혜 전통(잠 8:22-31), 헬라 철학(스토아 학파의 logos), 그리고 targumic 전통(창조에서 하나님의 "말씀")이 복합적으로 작용했다. 그러나 요한의 logos는 이 모든 것을 초월하여 인격적 그리스도를 가리킨다.',
    source: '요한복음 주석 (Black\'s NT Commentaries)',
  },
  {
    verse: 3,
    author: '레온 모리스',
    type: 'exegetical',
    text: '"만물이 그로 말미암아 지은 바 되었으니" — 요한은 예수님이 창조의 매개자이심을 선포한다. "지은 것이 하나도 그가 없이는 지은 것이 없느니라"는 이중 부정으로 그리스도의 창조 사역을 강조한다. 이는 그리스도가 피조물이 아님을 보여주는 결정적 증거다.',
    source: '요한복음 주석 (Tyndale NT Commentaries)',
  },
  {
    verse: 4,
    author: 'F. F. 브루스',
    type: 'theological',
    text: '"그 안에 생명이 있었다" — 여기서 생명(zoe)은 단순한 생물학적 존재가 아니라, 하나님과의 교제 안에서 누리는 영원한 생명이다. "이 생명은 사람들의 빛이라" — 생명과 빛은 요한 신학에서 불가분의 관계다. 생명이 빛의 내용이고, 빛이 생명의 표현이다.',
    source: '요한복음 주석 (New International Commentary)',
  },
  {
    verse: 5,
    author: '어거스틴',
    type: 'pastoral',
    text: '"빛이 어둠에 비치되 어둠이 깨닫지 못하더라" — 이 말씀은 교회의 역사를 요약한다. 빛은 항상 비추지만, 어둠은 항상 저항한다. 그러나 어둠은 빛을 이기지 못한다. 그리스도의 빛은 어떤 어둠도 정복할 수 없다. 이것은 우리의 소망이다.',
    source: '요한복음 강해 (Tractates on John)',
  },
]

export const JOHN_TRANSLATION_NOTES: JohnTranslationNote[] = [
  {
    verse: 1,
    note: '"말씀이 하나님이시니라"(theos ēn ho logos)에서 theos는 정관사가 없다. 이는 "말씀이 하나님과 동일하다"(modalism)는 의미가 아니라, 말씀이 하나님의 본성을 완전히 공유한다는 질적 동일성을 나타낸다. 개역개정과 ESV/NIV 모두 이 뉘앙스를 보존하고 있다.',
    versions: ['KRV', 'NIV', 'ESV'],
    preachingNote: '이 구절을 "예수님은 하나님이시다"라고 단순화하면 삼위일체의 미묘함이 손실된다. "말씀이 하나님과 함께 계셨고, 말씀이 하나님이셨다" — 이 두 진술의 긴장(구별과 일치의 동시성)을 설교에서 살려야 한다.',
  },
  {
    verse: 5,
    note: '"깨닫지 못하더라"(ou katelaben)의 동사 katalambanō는 "이해하다"와 "정복하다"는 중의적 의미를 가진다. 개역개정은 "깨닫지 못하더라"(이해)로 번역했고, NIV/ESV는 "has not overcome it"(정복)로 번역했다. 두 의미 모두 요한의 의도와 부합한다.',
    versions: ['KRV', 'NIV', 'ESV'],
    preachingNote: '이 중의적 의미를 설교에서 모두 활용하라: 어둠은 빛을 이해하지도 못했고, 정복하지도 못했다. 이것은 복음의 불가저항성과 인간의 영적 무지를 동시에 보여준다.',
  },
]

export const JOHN_PARALLEL_PASSAGES: JohnParallelPassage[] = [
  {
    ref: '창 1:1-3',
    text: '태초에 하나님이 천지를 창조하시니라 ... 하나님이 이르시되 빛이 있으라',
    relation: 'typology',
    description: '요한 1:1의 "태초에"(en arche)는 창세기 1:1의 "태초에"(bereshit)를 의도적으로 연상시킨다. 요한은 예수님을 새 창조의 시작점으로 제시한다. 창세기에서 하나님이 "말씀"으로 창조하셨듯, 요한은 그 말씀이 그리스도이심을 선포한다.',
  },
  {
    ref: '골 1:15-17',
    text: '그는 보이지 아니하는 하나님의 형상이시요 ... 만물이 그에게서 창조되되',
    relation: 'thematic',
    description: '바울은 그리스도를 "보이지 아니하는 하나님의 형상"과 "만물의 창조자"로 선포한다. 요한의 logos 신학과 바울의 그리스도론은 창조에서의 그리스도의 역할을 공통으로 강조한다.',
  },
  {
    ref: '히 1:1-3',
    text: '이 아들을 만유의 상속자로 세우시고 ... 그의 영광의 광채시요',
    relation: 'thematic',
    description: '히브리서 기자는 아들을 "하나님 영광의 광채"로 표현하며, 요한의 빛 신학과 공명한다. 둘 다 그리스도를 하나님의 궁극적 계시로 제시한다.',
  },
  {
    ref: '요일 1:1-2',
    text: '태초부터 있던 생명의 말씀에 관하여는 ... 이 생명이 나타내신 바 되었으니',
    relation: 'direct_quote',
    description: '요한일서는 요한복음 서론의 주제를 직접 반복한다. "생명의 말씀"이라는 표현은 요한 공동체의 핵심 신학적 어휘였다.',
  },
  {
    ref: '잠 8:22-31',
    text: '여호와께서 그 조화의 시작 곧 태초에 일하시기 전에 나를 가지셨으며',
    relation: 'allusion',
    description: '잠언의 지혜 의인화는 요한의 logos 신학의 구약적 배경이다. 지혜가 태초에 하나님과 함께 있었다는 주제는 logos의 선재성과 평행된다.',
  },
]

export const JOHN_THEMES = [
  { name: '말씀', description: '그리스도는 하나님의 자기 계시의 궁극적 표현이시다', connectedSermons: 18 },
  { name: '생명', description: '그리스도 안에 있는 영원하고 질적인 생명, 영생', connectedSermons: 15 },
  { name: '빛', description: '하나님의 계시와 진리가 그리스도를 통해 세상에 드러남', connectedSermons: 12 },
  { name: '창조', description: '그리스도는 창조의 매개자이시며 새 창조의 시작점이심', connectedSermons: 8 },
  { name: '계시', description: '하나님이 누구신지 그리스도를 통해 완전히 알려주심', connectedSermons: 10 },
  { name: '성육신', description: '말씀이 육신이 되어 우리 가운데 거하심 (1:14)', connectedSermons: 14 },
]

export const JOHN_CONTEXT = {
  before: '요한복음의 서론(프롤로그, 1:1-18)은 복음 전체의 신학적 개요를 제공한다. 1:1-5는 그중에서도 그리스도의 선재성, 신성, 창조 사역, 생명과 빛의 근원이심을 선포하는 핵심 부분이다.',
  after: '1:6-13에서는 세례 요한의 증언과 빛을 영접하는 자들의 권세(하나님의 자녀가 됨)를 논한다. 1:14는 프롤로그의 정점으로 "말씀이 육신이 되었다"는 성육신의 신비를 선포한다.',
  bookStructure: '요한복음은 1-12장(표적의 책)과 13-21장(고난의 책)으로 구분된다. 1:1-18의 프롤로그는 전체 복음의 신학적 렌즈 역할을 하며, 독자로 하여금 예수님의 표적과 말씀을 "신성의 관점"에서 읽도록 안내한다.',
}
