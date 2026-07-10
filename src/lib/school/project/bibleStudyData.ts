export interface VerseParallel {
  verse: number
  greek: string
  translit: string
  korean: string
  niv: string
  esv: string
}

export interface WordDetail {
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
  usage: { ref: string; text: string }[]
  sermonNote: string
  relatedWords: string[]
}

export interface CommentaryItem {
  verse: number
  author: string
  text: string
  type: 'exegetical' | 'theological' | 'historical' | 'pastoral'
  source: string
}

export interface TranslationNote {
  verse: number
  note: string
  versions: string[]
}

export interface ParallelPassage {
  ref: string
  text: string
  relation: 'direct_quote' | 'allusion' | 'thematic' | 'typology'
  description: string
}

export interface BibleStudyData {
  passage: string
  verses: VerseParallel[]
  words: Record<string, WordDetail>
  commentaries: CommentaryItem[]
  translationNotes: TranslationNote[]
  parallelPassages: ParallelPassage[]
  themes: { name: string; description: string; connectedSermons: number }[]
  contextInfo: { before: string; after: string }
}

const GREEK_WORDS: Record<string, WordDetail> = {
  katakrima: {
    id: 'w-katakrima',
    strong: 'G2631',
    lemma: 'κατάκριμα',
    lemmaGreek: 'κατάκριμα',
    pronunciation: 'kat-ak-ree-mah',
    transliteration: 'katakrima',
    partOfSpeech: '명사 (Noun)',
    morphology: '주격/대격 중성 단수',
    basicMeaning: '정죄, 유죄 판결, 불리한 판결',
    contextualMeaning: '하나님의 최종 심판에서의 정죄 선고',
    simpleExplanation: '법정에서 "유죄"라고 선고하는 것을 말해요. 그런데 그리스도 안에 있는 사람에게는 이 유죄 선고가 더 이상 없습니다.',
    usage: [
      { ref: '롬 5:16', text: 'many trespasses led to condemnation' },
      { ref: '롬 5:18', text: 'one trespass led to condemnation for all men' },
      { ref: '롬 8:1', text: 'no condemnation for those in Christ Jesus' },
    ],
    sermonNote: '이 단어는 8장의 서곡이다. 7장의 탄식("오호라 나는 곤고한 사람이로다")에 대한 하나님의 응답이 8:1의 "없나니"로 시작된다. 정죄의 부재는 단순한 사면이 아니라, 그리스도 안에서의 완전한 새로운 신분을 의미한다.',
    relatedWords: ['krino', 'krima', 'katadikazo'],
  },
  pneuma: {
    id: 'w-pneuma',
    strong: 'G4151',
    lemma: 'πνεῦμα',
    lemmaGreek: 'πνεῦμα',
    pronunciation: 'pnyoo-mah',
    transliteration: 'pneuma',
    partOfSpeech: '명사 (Noun)',
    morphology: '주격/대격 중성 단수',
    basicMeaning: '영, 바람, 숨, 생기',
    contextualMeaning: '성령 — 하나님의 영이신 제삼위',
    simpleExplanation: '원래는 "바람"이나 "숨"을 뜻해요. 보이지 않지만 살아서 움직이는 힘을 가리킵니다. 로마서 8장에서는 하나님이 우리 안에 보내주신 성령을 가리켜요.',
    usage: [
      { ref: '요 3:8', text: '바람이 임의로 불매 네는 그 소리를 들어도' },
      { ref: '롬 8:2', text: '생명의 성령의 법이 너를 해방하였음이라' },
      { ref: '갈 5:16', text: '성령을 따라 행하라' },
    ],
    sermonNote: '8장에서 pneuma는 20회 이상 등장하는 핵심 키워드. 2절의 "생명의 성령의 법"은 7장의 율법의 한계에 대한 해답이다. 율법은 외부의 규칙이지만, 성령은 내주하시는 하나님의 능력이다.',
    relatedWords: ['pneumatikos', 'theopneustos', 'psyche'],
  },
  nomos: {
    id: 'w-nomos',
    strong: 'G3551',
    lemma: 'νόμος',
    lemmaGreek: 'νόμος',
    pronunciation: 'nom-os',
    transliteration: 'nomos',
    partOfSpeech: '명사 (Noun)',
    morphology: '주격 남성 단수',
    basicMeaning: '법, 율법, 원리, 규범',
    contextualMeaning: '모세 율법, 혹은 어떤 원리나 질서',
    simpleExplanation: '율법은 하나님의 거룩한 기준이에요. 그런데 8장에서는 율법 자체가 나쁘다는 게 아니라, 율법이 우리를 구원할 수 없다는 걸 말해요. 대신 "성령의 법"이 우리를 자유롭게 한다고 선언합니다.',
    usage: [
      { ref: '롬 7:12', text: '그런즉 율법은 거룩하고 계명은 거룩하고 의로우며 선하도다' },
      { ref: '롬 8:2', text: '죄와 사망의 법에서 너를 해방하였음이라' },
      { ref: '롬 8:3', text: '율법이 육신으로 말미암아 연약하여 할 수 없는 그것' },
    ],
    sermonNote: '바울은 7장에서 율법의 선함과 동시에 율법의 한계를 논증했다. 8:2에서 "성령의 법"이라는 역설적 표현으로 율법의 한계를 극복하는 새 원리를 제시한다. 율법은 거룩하나 능력이 없고, 성령은 거룩하시며 또한 능력이 있다.',
    relatedWords: ['nomikos', 'nomothetes', 'anomia'],
  },
  eleutheroo: {
    id: 'w-eleutheroo',
    strong: 'G1659',
    lemma: 'ἐλευθερόω',
    lemmaGreek: 'ἐλευθερόω',
    pronunciation: 'el-yoo-ther-o-o',
    transliteration: 'eleutheroo',
    partOfSpeech: '동사 (Verb)',
    morphology: '직설법 부정과거 능동태 3인칭 단수',
    basicMeaning: '자유롭게 하다, 해방하다, 석방하다',
    contextualMeaning: '죄와 사망의 권세로부터의 완전한 해방',
    simpleExplanation: '노예를 자유인으로 풀어주는 행동을 말해요. 성령의 법이 우리를 죄와 사망이라는 감옥에서 풀어주셨다는 뜻입니다. 더 이상 죄의 노예가 아닌 거예요!',
    usage: [
      { ref: '요 8:32', text: '진리가 너희를 자유롭게 하리라' },
      { ref: '요 8:36', text: '아들이 너희를 자유롭게 하면 너희가 참으로 자유롭게 되리라' },
      { ref: '롬 6:18', text: '죄로부터 해방되어 의의 종이 되었느니라' },
    ],
    sermonNote: 'eleutheroo는 해방의 선언이다. 6장에서는 죄로부터의 해방, 8장에서는 사망으로부터의 해방. 성령의 역사는 우리를 모든 형태의 속박에서 자유케 하는 하나님의 궁극적 구원 사역이다.',
    relatedWords: ['eleutheria', 'eleutheros', 'apolysis'],
  },
  phronema: {
    id: 'w-phronema',
    strong: 'G5427',
    lemma: 'φρόνημα',
    lemmaGreek: 'φρόνημα',
    pronunciation: 'fron-ay-mah',
    transliteration: 'phronema',
    partOfSpeech: '명사 (Noun)',
    morphology: '주격/대격 중성 단수',
    basicMeaning: '생각, 마음씀, 지향, 태도',
    contextualMeaning: '삶의 방향과 가치관을 결정하는 내적 지향점',
    simpleExplanation: '단순히 "뭘 생각하는가"가 아니라 "인생의 방향이 어디로 향해 있는가"를 뜻해요. 육신의 phronema는 하나님이 없는 방향으로 가는 것이고, 성령의 phronema는 하나님을 향해 가는 거예요.',
    usage: [
      { ref: '롬 8:6', text: '육신의 생각은 사망이요 성령의 생각은 생명과 평안이니라' },
      { ref: '롬 8:7', text: '육신의 생각은 하나님과 원수가 되나니' },
      { ref: '롬 8:27', text: '성령의 생각을 아시나니' },
    ],
    sermonNote: 'phronema는 바울의 독특한 용어다. 단순한 지적 동의(cognitio)가 아니라 전 인격의 방향 정향(orientation)을 의미한다. 6절의 대조(육신의 phronema = 사망, 성령의 phronema = 생명과 평안)는 설교의 핵심 적용점이다.',
    relatedWords: ['phroneo', 'phronesis', 'sophroneo'],
  },
  sarx: {
    id: 'w-sarx',
    strong: 'G4561',
    lemma: 'σάρξ',
    lemmaGreek: 'σάρξ',
    pronunciation: 'sarx',
    transliteration: 'sarx',
    partOfSpeech: '명사 (Noun)',
    morphology: '주격 여성 단수',
    basicMeaning: '육체, 육신, 인간의 연약한 본성',
    contextualMeaning: '죄의 영향을 받은 인간의 타고난 본성',
    simpleExplanation: 'sarks는 단순히 "몸"을 뜻하지 않아요. 죄의 영향을 받아 하나님을 거역하는 인간의 타고난 성향을 가리킵니다. 우리가 아무리 노력해도 이 육신의 본성으로는 하나님을 기쁘시게 할 수 없어요. 그래서 성령이 필요합니다.',
    usage: [
      { ref: '롬 7:18', text: '내 육체에 선한 것이 거하지 아니하는 줄을 아노라' },
      { ref: '롬 8:3', text: '율법이 육신으로 말미암아 연약하여' },
      { ref: '롬 8:8', text: '육신에 있는 자는 하나님을 기쁘시게 할 수 없느니라' },
    ],
    sermonNote: '8장에서 sarx는 죄의 지배 아래 있는 인간 존재의 취약성을 가리킨다. 3절에서 율법의 연약함이 sarx 때문이라고 설명하는 것은 중요하다. 율법 자체의 문제가 아니라, 우리의 sarx가 율법을 수행할 능력이 없는 것이다.',
    relatedWords: ['sarkikos', 'sarkinos'],
  },
}

const VERSES: VerseParallel[] = [
  {
    verse: 1,
    greek: 'Οὐδὲν ἄρα νῦν κατάκριμα τοῖς ἐν Χριστῷ Ἰησοῦ.',
    translit: 'Ouden ara nun katakrima tois en Christo Iesou.',
    korean: '그러므로 이제 그리스도 예수 안에 있는 자에게는 결코 정죄함이 없나니',
    niv: 'Therefore, there is now no condemnation for those who are in Christ Jesus.',
    esv: 'There is therefore now no condemnation for those who are in Christ Jesus.',
  },
  {
    verse: 2,
    greek: 'ὁ γὰρ νόμος τοῦ πνεύματος τῆς ζωῆς ἐν Χριστῷ Ἰησοῦ ἠλευθέρωσέν σε ἀπὸ τοῦ νόμου τῆς ἁμαρτίας καὶ τοῦ θανάτου.',
    translit: 'Ho gar nomos tou pneumatos tes zoes en Christo Iesou eleutherosen se apo tou nomou tes hamartias kai tou thanatou.',
    korean: '이는 그리스도 예수 안에 있는 생명의 성령의 법이 죄와 사망의 법에서 너를 해방하였음이라',
    niv: 'because through Christ Jesus the law of the Spirit who gives life has set you free from the law of sin and death.',
    esv: 'For the law of the Spirit of life has set you free in Christ Jesus from the law of sin and death.',
  },
  {
    verse: 3,
    greek: 'τὸ γὰρ ἀδύνατον τοῦ νόμου ἐν ᾧ ἠσθένει διὰ τῆς σαρκός, ὁ θεὸς τὸν ἑαυτοῦ υἱὸν πέμψας ἐν ὁμοιώματι σαρκὸς ἁμαρτίας καὶ περὶ ἁμαρτίας κατέκρινεν τὴν ἁμαρτίαν ἐν τῇ σαρκί,',
    translit: 'To gar adynaton tou nomou en ho esthenei dia tes sarkos, ho theos ton heautou huion pempsas en homoiomati sarkos hamartias kai peri hamartias katekrinen ten hamartian en te sarki.',
    korean: '율법이 육신으로 말미암아 연약하여 할 수 없는 그것을 하나님은 하시나니 곧 죄로 말미암아 자기 아들을 죄 있는 육신의 모양으로 보내어 육신에 죄를 정하사',
    niv: 'For what the law was powerless to do because it was weakened by the flesh, God did by sending his own Son in the likeness of sinful flesh to be a sin offering.',
    esv: 'For God has done what the law, weakened by the flesh, could not do. By sending his own Son in the likeness of sinful flesh and for sin, he condemned sin in the flesh,',
  },
  {
    verse: 4,
    greek: 'ἵνα τὸ δικαίωμα τοῦ νόμου πληρωθῇ ἐν ἡμῖν τοῖς μὴ κατὰ σάρκα περιπατοῦσιν ἀλλὰ κατὰ πνεῦμα.',
    translit: 'Hina to dikaioma tou nomou plerothe en hemin tois me kata sarka peripatousin alla kata pneuma.',
    korean: '육신을 따라 행하지 않고 성령을 따라 행하는 우리에게 율법의 요구가 이루어지게 하려 하심이니라',
    niv: 'in order that the righteous requirement of the law might be fully met in us, who do not live according to the flesh but according to the Spirit.',
    esv: 'in order that the righteous requirement of the law might be fulfilled in us, who walk not according to the flesh but according to the Spirit.',
  },
  {
    verse: 5,
    greek: 'οἱ γὰρ κατὰ σάρκα ὄντες τὰ τῆς σαρκὸς φρονοῦσιν, οἱ δὲ κατὰ πνεῦμα τὰ τοῦ πνεύματος.',
    translit: 'Hoi gar kata sarka ontes ta tes sarkos phronousin, hoi de kata pneuma ta tou pneumatos.',
    korean: '육신을 따르는 자는 육신의 일을, 성령을 따르는 자는 성령의 일을 생각하나니',
    niv: 'Those who live according to the flesh have their minds set on what the flesh desires; but those who live in accordance with the Spirit have their minds set on what the Spirit desires.',
    esv: 'For those who live according to the flesh set their minds on the things of the flesh, but those who live according to the Spirit set their minds on the things of the Spirit.',
  },
  {
    verse: 6,
    greek: 'τὸ γὰρ φρόνημα τῆς σαρκὸς θάνατος, τὸ δὲ φρόνημα τοῦ πνεύματος ζωὴ καὶ εἰρήνη.',
    translit: 'To gar phronema tes sarkos thanatos, to de phronema tou pneumatos zoe kai eirene.',
    korean: '육신의 생각은 사망이요 성령의 생각은 생명과 평안이니라',
    niv: 'The mind governed by the flesh is death, but the mind governed by the Spirit is life and peace.',
    esv: 'For to set the mind on the flesh is death, but to set the mind on the Spirit is life and peace.',
  },
  {
    verse: 7,
    greek: 'διότι τὸ φρόνημα τῆς σαρκὸς ἔχθρα εἰς θεόν, τῷ γὰρ νόμῳ τοῦ θεοῦ οὐχ ὑποτάσσεται, οὐδὲ γὰρ δύναται.',
    translit: 'Dioti to phronema tes sarkos echthra eis theon, to gar nomo tou theou ouch hypotassetai, oude gar dynatai.',
    korean: '육신의 생각은 하나님과 원수가 되나니 이는 하나님의 법에 굴복하지 아니할 뿐 아니라 할 수도 없음이라',
    niv: 'The mind governed by the flesh is hostile to God; it does not submit to God\'s law, nor can it do so.',
    esv: 'For the mind that is set on the flesh is hostile to God, for it does not submit to God\'s law; indeed, it cannot.',
  },
  {
    verse: 8,
    greek: 'οἱ δὲ ἐν σαρκὶ ὄντες θεῷ ἀρέσαι οὐ δύνανται.',
    translit: 'Hoi de en sarki ontes theo aresai ou dynantai.',
    korean: '육신에 있는 자는 하나님을 기쁘시게 할 수 없느니라',
    niv: 'Those who are in the realm of the flesh cannot please God.',
    esv: 'Those who are in the flesh cannot please God.',
  },
  {
    verse: 9,
    greek: 'ὑμεῖς δὲ οὐκ ἐστὲ ἐν σαρκὶ ἀλλὰ ἐν πνεύματι, εἴπερ πνεῦμα θεοῦ οἰκεῖ ἐν ὑμῖν. εἰ δέ τις πνεῦμα Χριστοῦ οὐκ ἔχει, οὗτος οὐκ ἔστιν αὐτοῦ.',
    translit: 'Hymeis de ouk este en sarki alla en pneumati, eiper pneuma theou oikei en hymin. ei de tis pneuma Christou ouk echei, houtos ouk estin autou.',
    korean: '만일 너희 속에 하나님의 영이 거하시면 너희가 육신에 있지 아니하고 성령에 있나니 누구든지 그리스도의 영이 없으면 그리스도의 사람이 아니라',
    niv: 'You, however, are not in the realm of the flesh but are in the realm of the Spirit, if indeed the Spirit of God lives in you. And if anyone does not have the Spirit of Christ, they do not belong to Christ.',
    esv: 'You, however, are not in the flesh but in the Spirit, if in fact the Spirit of God dwells in you. Anyone who does not have the Spirit of Christ does not belong to him.',
  },
  {
    verse: 10,
    greek: 'εἰ δὲ Χριστὸς ἐν ὑμῖν, τὸ μὲν σῶμα νεκρὸν διὰ ἁμαρτίαν, τὸ δὲ πνεῦμα ζωὴ διὰ δικαιοσύνην.',
    translit: 'Ei de Christos en hymin, to men soma nekron dia hamartian, to de pneuma zoe dia dikaiosynen.',
    korean: '또 그리스도께서 너희 안에 계시면 몸은 죄로 말미암아 죽은 것이나 영은 의로 말미암아 살아 있는 것이니라',
    niv: 'But if Christ is in you, then even though your body is subject to death because of sin, the Spirit gives life because of righteousness.',
    esv: 'But if Christ is in you, although the body is dead because of sin, the Spirit is life because of righteousness.',
  },
  {
    verse: 11,
    greek: 'εἰ δὲ τὸ πνεῦμα τοῦ ἐγείραντος τὸν Ἰησοῦν ἐκ νεκρῶν οἰκεῖ ἐν ὑμῖν, ὁ ἐγείρας τὸν Χριστὸν ἐκ νεκρῶν ζῳοποιήσει καὶ τὰ θνητὰ σώματα ὑμῶν διὰ τὸ ἐνοικοῦν αὐτοῦ πνεῦμα ἐν ὑμῖν.',
    translit: 'Ei de to pneuma tou egeirantos ton Iesoun ek nekron oikei en hymin, ho egeiras ton Christon ek nekron zoopoiesei kai ta thneta somata hymon dia to enoikoun autou pneuma en hymin.',
    korean: '예수를 죽은 자 가운데서 살리신 이의 영이 너희 안에 거하시면 그리스도 예수를 죽은 자 가운데서 살리신 이가 너희 안에 거하시는 그의 영으로 말미암아 너희 죽을 몸도 살리시리라',
    niv: 'And if the Spirit of him who raised Jesus from the dead is living in you, he who raised Christ from the dead will also give life to your mortal bodies because of his Spirit who lives in you.',
    esv: 'If the Spirit of him who raised Jesus from the dead dwells in you, he who raised Christ Jesus from the dead will also give life to your mortal bodies through his Spirit who dwells in you.',
  },
]

const COMMENTARIES: CommentaryItem[] = [
  { verse: 1, author: '존 칼빈', type: 'exegetical', text: '바울은 경건한 사람들의 양심이 겪는 투쟁을 잘 알고 있었다. 7장에서 율법과 죄의 싸움에 지친 영혼의 탄식을 기록한 후, 8장에 이르러 "그러므로 이제"라는 말로 승리의 노래를 시작한다. 이 "없나니"는 단순한 법적 선언이 아니라, 그리스도 안에서 믿는 자가 누리는 실제적 자유이다.', source: '로마서 주석 (Calvin\'s Commentaries)' },
  { verse: 1, author: '존 웨슬리', type: 'pastoral', text: '"정죄함이 없다" — 이 말씀은 모든 죄책감에 눌린 영혼에게 하는 하나님의 선언이다. 그러나 이것이 방종의 면허증이 아님을 기억하라. 그리스도 안에 있는 자에게만 이 약속이 있다. 그리스도 밖에는 정죄만이 있을 뿐이다.', source: '로마서 강해 (Wesley\'s Notes)' },
  { verse: 2, author: 'F. F. 브루스', type: 'exegetical', text: '"생명의 성령의 법"은 역설적 표현이다. 율법(nomos)은 일반적으로 외부에서 규제하는 원리인데, 성령은 내주하는 인격이시다. 바울이 "성령의 법"이라고 말한 것은, 성령께서 우리 안에서 역사하시는 것이 마치 새 원리처럼 작동하기 때문이다. 이는 죄와 사망의 옛 원리를 대체한다.', source: '로마서 (Tyndale NT Commentaries)' },
  { verse: 3, author: 'C. E. B. 크랜필드', type: 'exegetical', text: '"죄 있는 육신의 모양" — 여기서 바울은 docetic(가현설)을 경계하면서도 동시에 그리스도의 완전한 인간성을 주장한다. 그리스도는 죄 없는 육신을 입으셨으나, 죄 있는 육신의 "모양"으로 오셨다. 이는 죄를 정죄하시기 위함이었다.', source: '로마서 (ICC Critical Commentary)' },
  { verse: 4, author: '톰 라이트', type: 'theological', text: '바울이 말하는 "율법의 요구"는 단순히 율법의 조항을 지키는 것이 아니다. 그것은 창조의 원래 목적, 즉 하나님이 인간에게 의도하신 삶의 방식으로 회복되는 것을 의미한다. 성령을 따라 행함으로 우리는 아담이 상실한 참된 인류의 삶을 살게 된다.', source: '로마서 강해 (Tom Wright for Everyone)' },
  { verse: 6, author: '어거스틴', type: 'theological', text: '"육신의 생각은 사망이요 성령의 생각은 생명과 평안이니라" — 이 한 구절에 전체 그리스도인의 윤리가 요약되어 있다. 사망의 길과 생명의 길이 여기서 갈라진다. 선택은 우리의 것이지만, 선택할 능력은 은혜로 말미암는다.', source: '로마서 강해 (Augustine\'s Unfinished Commentary)' },
  { verse: 9, author: '마틴 로이드존스', type: 'pastoral', text: '"만일 너희 속에 하나님의 영이 거하시면" — 여기서 바울은 가장 놀라운 사실을 말한다. 전능하신 하나님이 성령으로 말미암아 우리 안에 거하신다. 이것은 단순한 교리가 아니라 매일의 경험이 되어야 한다. 성도의 견인은 우리의 노력이 아니라 우리 안에 거하시는 성령의 역사다.', source: '로마서 강해 (Romans: An Exposition)' },
]

const TRANSLATION_NOTES: TranslationNote[] = [
  { verse: 1, note: 'NIV는 "therefore"로 시작해 논리적 연결을 강조하고, ESV는 "there is therefore"로 더 공식적인 어조를 사용했다. 한국어 개역개정은 "그러므로 이제"로 시간적 긴박감까지 포함한다.', versions: ['NIV', 'ESV', 'KRV'] },
  { verse: 2, note: 'NIV는 "through Christ Jesus"를 넣어 중보자 그리스도를 강조하고, ESV는 "in Christ Jesus"로 신비적 연합을 강조한다. 이 차이는 칭의와 성화의 다른 강조점을 반영한다.', versions: ['NIV', 'ESV'] },
  { verse: 5, note: '\"phronousin\"(생각한다)에 대해 NIV는 "have their minds set on"으로 능동적 결단을, ESV는 "set their minds on"으로 비슷하지만 더 직접적인 표현을 사용한다. 개역개정의 "생각하나니"는 이 능동적 의미를 잘 살리고 있다.', versions: ['NIV', 'ESV', 'KRV'] },
  { verse: 6, note: 'NIV는 "mind governed by the flesh/Spirit"라고 paraphrase하여 통치 개념을 도입했다. ESV는 "set the mind on"으로 더 문자적이다. "phronema"가 단순한 생각이 아니라 삶의 방향을 의미함을 고려하면 NIV의 번역이 의미를 잘 전달한다.', versions: ['NIV', 'ESV'] },
]

const PARALLEL_PASSAGES: ParallelPassage[] = [
  { ref: '갈 5:16-25', text: '내가 이르노니 너희는 성령을 따라 행하라 그리하면 육체의 욕심을 이루지 아니하리라', relation: 'thematic', description: '성령을 따라 행음과 육체의 일 대 성령의 열매 — 로마서 8장의 주제를 실천적 윤리로 발전시킴' },
  { ref: '엡 1:13-14', text: '그 안에서 너희도 진리의 말씀 곧 너희의 구원의 복음을 듣고 그 안에서 또한 믿어 약속의 성령으로 인치심을 받았으니', relation: 'thematic', description: '성령의 인치심 — 로마서 8장의 성령 내주를 보증의 개념으로 발전' },
  { ref: '고후 3:17', text: '주는 영이시니 주의 영이 계신 곳에는 자유가 있느니라', relation: 'allusion', description: '성령과 자유의 직접적 연결 — 로마서 8:2의 해방 선언과 평행' },
  { ref: '요 8:34-36', text: '진리가 너희를 자유롭게 하리라 ... 아들이 너희를 자유롭게 하면 너희가 참으로 자유롭게 되리라', relation: 'thematic', description: '그리스도의 진리가 주는 자유 — 바울이 로마서에서 발전시킨 주제의 복음서적 기초' },
  { ref: '겔 36:26-27', text: '또 새 영을 너희 속에 두고 새 마음을 너희에게 주리라 ... 내 영을 너희 속에 두어', relation: 'typology', description: '에스겔의 새 영 약속 — 로마서 8장의 성령론적 구원의 구약적 예표' },
  { ref: '시 23:4', text: '내가 사망의 음침한 골짜기로 다닐지라도 해를 두려워하지 않을 것은 주께서 나와 함께 하심이라', relation: 'allusion', description: '사망 두려움 없는 삶 — 로마서 8장의 "정죄 없음"의 목회적 울림' },
]

export const MOCK_BIBLE_STUDY: BibleStudyData = {
  passage: '롬 8:1-11',
  verses: VERSES,
  words: GREEK_WORDS,
  commentaries: COMMENTARIES,
  translationNotes: TRANSLATION_NOTES,
  parallelPassages: PARALLEL_PASSAGES,
  themes: [
    { name: '성령', description: '하나님의 영이신 성령께서 믿는 자 안에 거하시며 새 생명을 주심', connectedSermons: 12 },
    { name: '자유', description: '죄와 율법과 사망의 권세로부터의 해방과 새 삶', connectedSermons: 8 },
    { name: '정죄', description: '그리스도 안에서 더 이상 없는 유죄 선고', connectedSermons: 5 },
    { name: '생명', description: '성령이 주시는 영생과 부활의 소망', connectedSermons: 15 },
    { name: '율법', description: '거룩하나 연약하여 구원할 수 없는 하나님의 법', connectedSermons: 7 },
  ],
  contextInfo: {
    before: '로마서 7장에서 바울은 율법과 죄의 관계를 논하며, "오호라 나는 곤고한 사람이로다"라는 탄식으로 끝맺는다. 8장은 이에 대한 하나님의 응답으로 시작된다.',
    after: '8:12-30절에서는 성령의 인도하심과 양자됨, 현재의 고난과 미래의 영광, 성도의 견인을 논한다. 8:31-39절은 "누가 우리를 그리스도의 사랑에서 끊으리요"라는 승리의 찬가로 마무리된다.',
  },
}
