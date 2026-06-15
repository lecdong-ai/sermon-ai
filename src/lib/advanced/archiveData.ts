export interface ArchivedSermon {
  id: string
  title: string
  passage: string
  book: string
  chapter: number
  verseStart: number
  verseEnd: number | null
  sermonDate: string
  preacher: string
  sermonType: string
  audience: string[]
  season: string
  coreMessage: string
  wordCount: number
  seriesName?: string
  themeNames: string[]
  tagNames: string[]
  introduction: string
  conclusion: string
  outlineTitles: string[]
  relatedIds: string[]
  createdAt: string
  updatedAt: string
}

export const ARCHIVE_SERMONS: ArchivedSermon[] = [
  {
    id: 'arc-001',
    title: '믿음으로 말미암는 의',
    passage: '롬 3:21-31',
    book: '로마서', chapter: 3, verseStart: 21, verseEnd: 31,
    sermonDate: '2026-05-17', preacher: '김바울', sermonType: '주일예배',
    audience: ['장년'], season: '일반',
    coreMessage: '율법의 행위와 상관없이, 예수 그리스도를 믿는 믿음으로 말미암아 하나님의 의가 우리에게 주어졌다.',
    wordCount: 4850, seriesName: '로마서 강해',
    themeNames: ['믿음', '칭의', '은혜'],
    tagNames: ['의', '율법', '속죄'],
    introduction: '오늘 본문은 복음의 핵심이 무엇인지 가장 선명하게 보여줍니다. 바울은 1-2장에서 인류의 보편적 죄를 선언하고, 3장 21절부터 "이제는"이라는 전환점과 함께 복음의 정수를 선포합니다.',
    conclusion: '율법의 행위가 아니라 예수 그리스도를 믿는 믿음으로 우리는 의롭다 하심을 받았습니다. 이 은혜가 우리의 자랑이 아니라 겸손의 근거가 되기를 바랍니다.',
    outlineTitles: ['율법과 선지자의 증거', '믿음으로 말미암는 하나님의 의', '율법을 폐함이 아니라 세움'],
    relatedIds: ['arc-002', 'arc-003', 'arc-004'],
    createdAt: '2026-05-10T09:00:00Z', updatedAt: '2026-05-17T12:00:00Z',
  },
  {
    id: 'arc-002',
    title: '화목하게 된 자의 즐거움',
    passage: '롬 5:1-11',
    book: '로마서', chapter: 5, verseStart: 1, verseEnd: 11,
    sermonDate: '2026-05-24', preacher: '김바울', sermonType: '주일예배',
    audience: ['장년'], season: '일반',
    coreMessage: '우리가 하나님과 화목하게 된 것은 예수 그리스도의 죽음과 부활로 말미암았으며, 이로 인해 환난 중에도 즐거워할 수 있다.',
    wordCount: 5120, seriesName: '로마서 강해',
    themeNames: ['화목', '소망', '사랑'],
    tagNames: ['환난', '성화', '성령'],
    introduction: '칭의의 결과는 무엇일까요? 바울은 5장에서 칭의가 가져오는 놀라운 결과들을 선언합니다. 하나님과의 평화, 은혜에의 접근, 소망, 그리고 환난 중에도 즐거워할 수 있는 능력입니다.',
    conclusion: '우리가 아직 죄인 되었을 때, 원수 되었을 때, 그때 그리스도께서 우리를 위해 죽으셨습니다. 이 사랑이 우리의 모든 환난을 이길 힘입니다.',
    outlineTitles: ['칭의의 결과: 평화와 소망', '환난 중의 즐거움', '하나님의 사랑의 확증'],
    relatedIds: ['arc-001', 'arc-003', 'arc-012'],
    createdAt: '2026-05-17T09:00:00Z', updatedAt: '2026-05-24T12:00:00Z',
  },
  {
    id: 'arc-003',
    title: '죄에 대하여 죽은 자',
    passage: '롬 6:1-14',
    book: '로마서', chapter: 6, verseStart: 1, verseEnd: 14,
    sermonDate: '2026-05-31', preacher: '김바울', sermonType: '주일예배',
    audience: ['장년'], season: '일반',
    coreMessage: '세례는 그리스도와 함께 죽고 함께 사는 연합을 의미하며, 이제 우리는 죄에 대하여 죽은 자로서 하나님을 위해 살아야 한다.',
    wordCount: 4980, seriesName: '로마서 강해',
    themeNames: ['성화', '세례', '자유'],
    tagNames: ['죄', '부활', '은혜'],
    introduction: '"그런즉 우리가 무슨 말을 하리요" 바울은 5장의 은혜의 선언이 오해될 수 있음을 알고 6장에서 신중하게 답변합니다. 은혜가 더해지라고 죄를 짓겠느냐? 결코 그럴 수 없습니다.',
    conclusion: '죄의 삯은 사망이지만 하나님의 은사는 그리스도 예수 우리 주 안에 있는 영생입니다. 우리는 더 이상 죄의 종이 아니라 의의 종으로 살아갑니다.',
    outlineTitles: ['은혜와 죄의 관계', '세례의 의미: 그리스도와의 연합', '의의 병기로 드리라'],
    relatedIds: ['arc-001', 'arc-002', 'arc-004'],
    createdAt: '2026-05-24T09:00:00Z', updatedAt: '2026-05-31T12:00:00Z',
  },
  {
    id: 'arc-004',
    title: '성령 안에 있는 생명',
    passage: '롬 8:1-11',
    book: '로마서', chapter: 8, verseStart: 1, verseEnd: 11,
    sermonDate: '2026-06-14', preacher: '김바울', sermonType: '주일예배',
    audience: ['장년'], season: '일반',
    coreMessage: '성령께서 그리스도 안에서 우리에게 주시는 생명의 자유와 능력',
    wordCount: 5240, seriesName: '로마서 강해',
    themeNames: ['성령', '자유', '생명'],
    tagNames: ['정죄', '율법', '부활'],
    introduction: '로마서 8장은 바울 신학의 정수입니다. 1-11절은 "그러므로"라는 접속사로 시작하여, 7장의 율법과 죄의 문제에 대한 해답을 제시합니다.',
    conclusion: '그러므로 이제 그리스도 예수 안에 있는 자에게는 결코 정죄함이 없나니 — 이 선언이 오늘 여러분의 삶 가운데 역사하기를 축복합니다.',
    outlineTitles: ['정죄에서 자유로', '성령의 생각과 육신의 생각', '부활의 소망과 성령의 내주'],
    relatedIds: ['arc-001', 'arc-002', 'arc-003'],
    createdAt: '2026-06-01T09:00:00Z', updatedAt: '2026-06-14T12:00:00Z',
  },
  {
    id: 'arc-005',
    title: '끊을 수 없는 사랑',
    passage: '롬 8:31-39',
    book: '로마서', chapter: 8, verseStart: 31, verseEnd: 39,
    sermonDate: '2026-06-28', preacher: '김바울', sermonType: '주일예배',
    audience: ['장년'], season: '일반',
    coreMessage: '하나님이 우리를 위하시면 누가 우리를 대적하리요? 그리스도의 사랑에서 우리를 끊을 수 있는 것은 아무것도 없다.',
    wordCount: 4670, seriesName: '로마서 강해',
    themeNames: ['사랑', '확신', '승리'],
    tagNames: ['고난', '약속', '보장'],
    introduction: '로마서 8장의 마지막 부분은 바울의 찬양과도 같은 확신의 고백입니다. 모든 고난과 역경에도 불구하고 그리스도의 사랑에서 끊어지지 않을 확신을 노래합니다.',
    conclusion: '사망이나 생명이나 천사나 권세자나 현재 일이나 장래 일이나 높음이나 깊음이나 다른 어떤 피조물이라도 우리를 우리 주 그리스도 예수 안에 있는 하나님의 사랑에서 끊을 수 없습니다.',
    outlineTitles: ['하나님이 우리를 위하시면', '고난과 승리의 역설', '그 사랑의 확신'],
    relatedIds: ['arc-002', 'arc-004', 'arc-007'],
    createdAt: '2026-06-21T09:00:00Z', updatedAt: '2026-06-28T12:00:00Z',
  },
  {
    id: 'arc-006',
    title: '태초에 하나님이',
    passage: '창 1:1-5',
    book: '창세기', chapter: 1, verseStart: 1, verseEnd: 5,
    sermonDate: '2025-01-05', preacher: '김바울', sermonType: '송구영신예배',
    audience: ['장년', '청년'], season: '송구영신',
    coreMessage: '태초에 하나님이 천지를 창조하셨다 — 이 선언은 모든 것의 시작이 하나님이심을 선포하며, 우리의 삶의 기초가 창조주 하나님께 있음을 가르친다.',
    wordCount: 4320,
    themeNames: ['창조', '말씀', '빛'],
    tagNames: ['질서', '선하심', '안식'],
    introduction: '성경의 첫 구절, "태초에 하나님이 천지를 창조하시니라." 이 한 구절에 우리 신앙의 모든 것이 함축되어 있습니다. 하나님이 계시고, 하나님이 일하셨고, 그 결과가 우리가 살고 있는 이 세상입니다.',
    conclusion: '하나님의 창조는 완벽했습니다. 빛이 어둠을 이겼고, 질서가 혼돈을 덮었습니다. 오늘 우리 삶의 모든 어둠과 혼돈 위에도 창조의 하나님은 여전히 "빛이 있으라" 명령하십니다.',
    outlineTitles: ['태초에', '하나님이', '천지를 창조하시니라'],
    relatedIds: ['arc-019', 'arc-008'],
    createdAt: '2024-12-28T09:00:00Z', updatedAt: '2025-01-05T12:00:00Z',
  },
  {
    id: 'arc-007',
    title: '부르심의 약속',
    passage: '창 12:1-9',
    book: '창세기', chapter: 12, verseStart: 1, verseEnd: 9,
    sermonDate: '2025-02-16', preacher: '김바울', sermonType: '주일예배',
    audience: ['장년'], season: '일반',
    coreMessage: '하나님의 부르심은 반드시 약속을 동반하며, 그 약속은 우리의 순종을 통해 이 땅에 실현된다.',
    wordCount: 3980,
    themeNames: ['소명', '약속', '순종'],
    tagNames: ['아브라함', '복', '제단'],
    introduction: '하나님의 부르심은 구체적이고 개인적입니다. 아브라함에게 "너는"이라고 말씀하신 하나님은 오늘 우리에게도 동일하게 말씀하십니다.',
    conclusion: '아브라함은 갈 바를 알지 못하고 나갔습니다. 그러나 하나님의 약속은 신실하게 성취되었습니다. 우리의 순종이 작아도, 하나님의 약속은 큽니다.',
    outlineTitles: ['부르심의 구체성', '약속의 내용', '순종의 즉각성'],
    relatedIds: ['arc-006', 'arc-011'],
    createdAt: '2025-02-09T09:00:00Z', updatedAt: '2025-02-16T12:00:00Z',
  },
  {
    id: 'arc-008',
    title: '여호와는 나의 목자',
    passage: '시 23:1-6',
    book: '시편', chapter: 23, verseStart: 1, verseEnd: 6,
    sermonDate: '2025-03-30', preacher: '김바울', sermonType: '주일예배',
    audience: ['장년', '청년', '초신자'], season: '사순절',
    coreMessage: '여호와는 나의 목자시니 내게 부족함이 없으며, 사망의 음침한 골짜기로 다닐지라도 해를 두려워하지 않을 것은 주께서 나와 함께 하심이다.',
    wordCount: 3560,
    themeNames: ['인도', '보호', '공급'],
    tagNames: ['목자', '푸른 초장', '잔'],
    introduction: '시편 23편은 성경에서 가장 사랑받는 시편 중 하나입니다. 다윗은 자신의 목자 되신 하나님을 노래하며, 인생의 모든 여정 속에서 하나님의 인도하심과 보호하심을 고백합니다.',
    conclusion: '선하심과 인자하심이 내 생애 동안 나를 따르리니 내가 여호와의 집에 영원히 살리로다. 이것이 목자 되신 하나님을 아는 자의 확신입니다.',
    outlineTitles: ['부족함이 없는 공급', '두려움이 없는 동행', '끝까지 따르는 은혜'],
    relatedIds: ['arc-006', 'arc-016', 'arc-009'],
    createdAt: '2025-03-23T09:00:00Z', updatedAt: '2025-03-30T12:00:00Z',
  },
  {
    id: 'arc-009',
    title: '회개의 시편',
    passage: '시 51:1-19',
    book: '시편', chapter: 51, verseStart: 1, verseEnd: 19,
    sermonDate: '2025-04-06', preacher: '김바울', sermonType: '특별새벽기도회',
    audience: ['장년'], season: '사순절',
    coreMessage: '진정한 회개는 죄의 고백에서 시작하여 하나님의 긍휼을 의지하고, 깨끗한 마음의 창조를 구하는 것이다.',
    wordCount: 4120,
    themeNames: ['회개', '용서', '새창조'],
    tagNames: ['다윗', '긍휼', '정결'],
    introduction: '시편 51편은 다윗이 밧세바 사건 이후 선지자 나단의 책망을 받고 지은 회개의 시입니다. 이 시편은 성경이 가르치는 진정한 회개의 본질을 가장 생생하게 보여줍니다.',
    conclusion: '하나님께서 구하시는 제사는 상한 심령입니다. 상하고 통회하는 마음을 주께서 멸시치 아니하십니다. 이것이 회개의 은혜입니다.',
    outlineTitles: ['죄의 철저한 고백', '긍휼을 향한 간구', '새로운 마음의 창조'],
    relatedIds: ['arc-008', 'arc-013'],
    createdAt: '2025-03-30T09:00:00Z', updatedAt: '2025-04-06T12:00:00Z',
  },
  {
    id: 'arc-010',
    title: '팔복의 사람',
    passage: '마 5:1-12',
    book: '마태복음', chapter: 5, verseStart: 1, verseEnd: 12,
    sermonDate: '2025-05-11', preacher: '김바울', sermonType: '주일예배',
    audience: ['장년', '청년'], season: '일반',
    coreMessage: '팔복은 천국 시민의 윤리를 제시하며, 세상이 인정하지 않는 가치(가난한 마음, 애통, 온유, 의에 주림)가 오히려 하나님 나라의 복임을 선언한다.',
    wordCount: 5630, seriesName: '산상수훈 강해',
    themeNames: ['복', '제자도', '하나님나라'],
    tagNames: ['팔복', '산상수훈', '심령'],
    introduction: '예수님은 산에 오르셔서 제자들을 가르치셨습니다. 팔복은 단순한 도덕적 권면이 아니라, 하나님 나라가 이 땅에 도래했음을 선포하는 선언입니다.',
    conclusion: '하늘의 상이 크다는 약속은 우리의 잠시 동안의 고난과 역경을 이길 힘입니다. 팔복의 사람은 세상의 소금과 빛으로 살아갑니다.',
    outlineTitles: ['심령이 가난한 자의 복', '애통하는 자의 위로', '의에 주리고 목마른 자의 충만'],
    relatedIds: ['arc-011', 'arc-012'],
    createdAt: '2025-05-04T09:00:00Z', updatedAt: '2025-05-11T12:00:00Z',
  },
  {
    id: 'arc-011',
    title: '지상 대명령',
    passage: '마 28:16-20',
    book: '마태복음', chapter: 28, verseStart: 16, verseEnd: 20,
    sermonDate: '2025-06-08', preacher: '김바울', sermonType: '주일예배',
    audience: ['장년', '청년', '학생'], season: '일반',
    coreMessage: '부활하신 예수님의 지상 대명령은 모든 족속을 제자 삼고, 세례를 주고, 가르쳐 지키게 하는 교회의 근본 사명이다.',
    wordCount: 3890,
    themeNames: ['선교', '제자도', '부활'],
    tagNames: ['명령', '권세', '약속'],
    introduction: '마태복음의 마지막 장면입니다. 부활하신 예수님은 제자들에게 마지막 명령을 주십니다. 이 명령은 단순한 권면이 아니라 교회 존재의 이유입니다.',
    conclusion: '"내가 세상 끝 날까지 항상 너희와 함께 있으리라" — 이 약속이 지상 대명령을 수행하는 우리의 힘과 위로입니다.',
    outlineTitles: ['부활의 권세', '제자 삼는 사명', '함께 하시는 약속'],
    relatedIds: ['arc-010', 'arc-013'],
    createdAt: '2025-06-01T09:00:00Z', updatedAt: '2025-06-08T12:00:00Z',
  },
  {
    id: 'arc-012',
    title: '거듭남과 영생',
    passage: '요 3:1-16',
    book: '요한복음', chapter: 3, verseStart: 1, verseEnd: 16,
    sermonDate: '2025-07-20', preacher: '김바울', sermonType: '주일예배',
    audience: ['장년', '초신자'], season: '일반',
    coreMessage: '하나님의 나라는 거듭나지 않고는 볼 수도 없고 들어갈 수도 없으며, 하나님의 아들을 믿는 자마다 영생을 얻는다.',
    wordCount: 4780,
    themeNames: ['중생', '영생', '하나님사랑'],
    tagNames: ['니고데모', '성령', '믿음'],
    introduction: '밤에 찾아온 니고데모, 그는 유대인의 지도자요 바리새인이었습니다. 그러나 예수님은 그의 모든 지식과 자격 너머에 있는 근본적인 필요를 정확히 짚으셨습니다.',
    conclusion: '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라. 복음의 핵심입니다.',
    outlineTitles: ['거듭남의 필요성', '바람처럼 오시는 성령', '세상을 향한 하나님의 사랑'],
    relatedIds: ['arc-013', 'arc-018', 'arc-002'],
    createdAt: '2025-07-13T09:00:00Z', updatedAt: '2025-07-20T12:00:00Z',
  },
  {
    id: 'arc-013',
    title: '선한 목자',
    passage: '요 10:1-18',
    book: '요한복음', chapter: 10, verseStart: 1, verseEnd: 18,
    sermonDate: '2025-08-10', preacher: '김바울', sermonType: '주일예배',
    audience: ['장년', '청년'], season: '일반',
    coreMessage: '예수님은 선한 목자로서 양을 위해 목숨을 버리시며, 양은 목자의 음성을 알고 따르며, 목자는 양을 알고 아버지께서 목자를 아신다.',
    wordCount: 4210,
    themeNames: ['목자', '희생', '앎'],
    tagNames: ['양', '문', '음성'],
    introduction: '예수님의 "나는 선한 목자라"는 선언은 구약의 목자 이미지를 완성하시는 놀라운 자기 계시입니다. 에스겔 34장에서 약속하신 참 목자의 오심을 선포하십니다.',
    conclusion: '선한 목자는 양을 위해 목숨을 버립니다. 이것이 십자가의 의미요, 우리를 향한 그리스도의 사랑의 깊이입니다.',
    outlineTitles: ['양의 문이신 예수', '선한 목자와 삯군', '한 무리와 한 목자'],
    relatedIds: ['arc-008', 'arc-012', 'arc-016'],
    createdAt: '2025-08-03T09:00:00Z', updatedAt: '2025-08-10T12:00:00Z',
  },
  {
    id: 'arc-014',
    title: '은혜로 구원 받은 자',
    passage: '엡 2:1-10',
    book: '에베소서', chapter: 2, verseStart: 1, verseEnd: 10,
    sermonDate: '2025-09-14', preacher: '김바울', sermonType: '주일예배',
    audience: ['장년', '초신자'], season: '일반',
    coreMessage: '우리는 행위로 말미암지 않고 오직 은혜로 믿음을 통해 구원을 받았으며, 이는 하나님이 예비하신 선한 일을 행하게 하심이다.',
    wordCount: 5100, seriesName: '에베소서 강해',
    themeNames: ['은혜', '구원', '새창조'],
    tagNames: ['행위', '선물', '자랑'],
    introduction: '에베소서 2장은 복음의 핵심을 가장 아름답게 요약합니다. 우리의 과거(죄와 허물), 현재(은혜로 구원), 미래(선한 일을 위해 지음)를 한눈에 보여줍니다.',
    conclusion: '우리는 그의 만드신 바라 그리스도 예수 안에서 선한 일을 위하여 지으심을 받은 자니 이 선한 일은 하나님이 전에 예비하사 우리로 그 가운데 행하게 하려 하심이니라.',
    outlineTitles: ['죄와 허물로 죽었던 우리', '긍휼이 풍성하신 하나님', '은혜의 선물과 선한 일'],
    relatedIds: ['arc-015', 'arc-001', 'arc-012'],
    createdAt: '2025-09-07T09:00:00Z', updatedAt: '2025-09-14T12:00:00Z',
  },
  {
    id: 'arc-015',
    title: '그리스도의 몸된 교회',
    passage: '엡 4:1-16',
    book: '에베소서', chapter: 4, verseStart: 1, verseEnd: 16,
    sermonDate: '2025-10-05', preacher: '김바울', sermonType: '주일예배',
    audience: ['장년'], season: '일반',
    coreMessage: '교회는 그리스도의 몸으로, 각 지체가 받은 은사대로 서로를 세우며 그리스도의 장성한 분량이 충만한 데까지 자라가야 한다.',
    wordCount: 5340, seriesName: '에베소서 강해',
    themeNames: ['교회', '일치', '성숙'],
    tagNames: ['은사', '직분', '세움'],
    introduction: '바울은 에베소서 4장에서 교회론의 정수를 제시합니다. 교회의 일치, 다양성 안의 연합, 그리고 성숙을 향한 성장의 청사진을 보여줍니다.',
    conclusion: '오직 사랑 안에서 진리를 말하며 범사에 그리스도 안에서 자라가야 합니다. 이것이 교회의 사명이요 성도의 성숙의 길입니다.',
    outlineTitles: ['일치의 기초', '은사의 다양성과 목적', '장성한 분량까지 자라감'],
    relatedIds: ['arc-014', 'arc-017'],
    createdAt: '2025-09-28T09:00:00Z', updatedAt: '2025-10-05T12:00:00Z',
  },
  {
    id: 'arc-016',
    title: '성령의 열매',
    passage: '갈 5:16-26',
    book: '갈라디아서', chapter: 5, verseStart: 16, verseEnd: 26,
    sermonDate: '2025-11-09', preacher: '김바울', sermonType: '주일예배',
    audience: ['장년', '청년'], season: '일반',
    coreMessage: '성령을 따라 행하면 육체의 욕심을 이루지 않으며, 성령의 열매인 사랑과 희락과 화평이 우리 삶에 나타난다.',
    wordCount: 4560,
    themeNames: ['성령', '열매', '자유'],
    tagNames: ['육체', '십자가', '걸음'],
    introduction: '갈라디아서는 자유의 복음을 선포합니다. 그러나 자유는 방종의 기회가 아닙니다. 5장에서 바울은 성령을 따라 행할 때 나타나는 놀라운 열매를 제시합니다.',
    conclusion: '만일 우리가 성령으로 살면 또한 성령으로 행할 것입니다. 이것이 참된 자유의 삶입니다.',
    outlineTitles: ['육체의 소욕과 성령의 소욕', '성령의 아홉 가지 열매', '성령으로 행하는 삶'],
    relatedIds: ['arc-004', 'arc-005', 'arc-017'],
    createdAt: '2025-11-02T09:00:00Z', updatedAt: '2025-11-09T12:00:00Z',
  },
  {
    id: 'arc-017',
    title: '사랑',
    passage: '고전 13:1-13',
    book: '고린도전서', chapter: 13, verseStart: 1, verseEnd: 13,
    sermonDate: '2025-12-14', preacher: '김바울', sermonType: '주일예배',
    audience: ['장년', '청년', '초신자'], season: '대림절',
    coreMessage: '모든 은사와 지식은 사랑 안에서 완성되며, 사랑은 영원히 쇠하지 않고 믿음과 소망과 함께 영원히 남는다.',
    wordCount: 3850,
    themeNames: ['사랑', '은사', '영원'],
    tagNames: ['온유', '오래참음', '온전'],
    introduction: '고린도전서 13장은 "사랑의 장"으로 불립니다. 고린도 교회는 은사에 집착했지만, 바울은 가장 뛰어난 길인 사랑을 보여줍니다. 은사는 사라져도 사랑은 영원합니다.',
    conclusion: '그런즉 믿음, 소망, 사랑 이 세 가지는 항상 있을 것인데 그중의 제일은 사랑이라. 이것이 그리스도인의 정체성입니다.',
    outlineTitles: ['사랑 없는 은사의 공허', '사랑의 속성', '영원히 남는 것'],
    relatedIds: ['arc-016', 'arc-005', 'arc-012'],
    createdAt: '2025-12-07T09:00:00Z', updatedAt: '2025-12-14T12:00:00Z',
  },
  {
    id: 'arc-018',
    title: '산 소망',
    passage: '벧전 1:3-9',
    book: '베드로전서', chapter: 1, verseStart: 3, verseEnd: 9,
    sermonDate: '2026-03-15', preacher: '김바울', sermonType: '주일예배',
    audience: ['장년'], season: '사순절',
    coreMessage: '예수 그리스도의 부활로 말미암아 우리가 거듭나게 하사 산 소망이 있게 하셨으며, 여러 가지 시험 중에도 믿음의 확실함이 칭찬과 영광을 얻게 한다.',
    wordCount: 4030,
    themeNames: ['소망', '부활', '시험'],
    tagNames: ['거듭남', '기업', '구원'],
    introduction: '베드로는 흩어진 성도들에게 편지를 씁니다. 그들은 환난과 시험 중에 있었지만, 베드로는 그들에게 산 소망이 있음을 선포합니다. 이 소망은 예수 그리스도의 부활에 근거합니다.',
    conclusion: '너희가 믿음의 결국 곧 영혼의 구원을 받음이라. 이 구원은 모든 시험을 이기게 하는 우리의 궁극적인 소망입니다.',
    outlineTitles: ['산 소망의 근거', '시험을 이기는 믿음', '보지 못하고 믿는 복'],
    relatedIds: ['arc-002', 'arc-005', 'arc-019'],
    createdAt: '2026-03-08T09:00:00Z', updatedAt: '2026-03-15T12:00:00Z',
  },
  {
    id: 'arc-019',
    title: '새 하늘과 새 땅',
    passage: '계 21:1-8',
    book: '요한계시록', chapter: 21, verseStart: 1, verseEnd: 8,
    sermonDate: '2026-04-05', preacher: '김바울', sermonType: '부활절',
    audience: ['장년', '청년'], season: '부활절',
    coreMessage: '하나님이 새 하늘과 새 땅을 창조하시고, 처음 것들이 지나가며, 하나님께서 친히 그의 백성과 함께 거하시며 모든 눈물을 닦아주신다.',
    wordCount: 4470,
    themeNames: ['새창조', '회복', '위로'],
    tagNames: ['예루살렘', '장막', '눈물'],
    introduction: '요한계시록의 마지막 장면은 인류 역사의 종착점을 보여줍니다. 새 하늘과 새 땅, 더 이상 사망이나 애통이나 곡이 없는 완전한 회복의 장면입니다.',
    conclusion: '이기는 자는 이것들을 유업으로 받으리라 나는 그 하나님이 되고 그는 내 아들이 되리라 — 이것이 모든 성도의 궁극적인 소망입니다.',
    outlineTitles: ['새 하늘과 새 땅의 도래', '하나님의 장막', '모든 것을 새롭게 하심'],
    relatedIds: ['arc-006', 'arc-018', 'arc-017'],
    createdAt: '2026-03-29T09:00:00Z', updatedAt: '2026-04-05T12:00:00Z',
  },
]

export function getFilterOptions(sermons: ArchivedSermon[]) {
  const books = Array.from(new Set(sermons.map(s => s.book))).sort()
  const themes = Array.from(new Set(sermons.flatMap(s => s.themeNames))).sort()
  const series = Array.from(new Set(sermons.filter(s => s.seriesName).map(s => s.seriesName!))).sort()
  const seasons = Array.from(new Set(sermons.map(s => s.season))).sort()
  const audiences = Array.from(new Set(sermons.flatMap(s => s.audience))).sort()
  const sermonTypes = Array.from(new Set(sermons.map(s => s.sermonType))).sort()
  return { books, themes, series, seasons, audiences, sermonTypes }
}

export function getRelatedSermons(sermon: ArchivedSermon, all: ArchivedSermon[]): ArchivedSermon[] {
  return sermon.relatedIds.map(id => all.find(s => s.id === id)).filter(Boolean) as ArchivedSermon[]
}

export function searchSermons(sermons: ArchivedSermon[], query: string): ArchivedSermon[] {
  const q = query.toLowerCase().trim()
  if (!q) return sermons
  return sermons.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.passage.toLowerCase().includes(q) ||
    s.book.toLowerCase().includes(q) ||
    s.coreMessage.toLowerCase().includes(q) ||
    s.themeNames.some(t => t.toLowerCase().includes(q)) ||
    s.tagNames.some(t => t.toLowerCase().includes(q)) ||
    s.sermonType.toLowerCase().includes(q) ||
    s.audience.some(a => a.toLowerCase().includes(q))
  )
}

export function filterSermons(sermons: ArchivedSermon[], filters: {
  books: string[]; themes: string[]; series: string[]; seasons: string[]; audiences: string[]
}): ArchivedSermon[] {
  return sermons.filter(s => {
    if (filters.books.length && !filters.books.includes(s.book)) return false
    if (filters.themes.length && !filters.themes.some(t => s.themeNames.includes(t))) return false
    if (filters.series.length && (!s.seriesName || !filters.series.includes(s.seriesName))) return false
    if (filters.seasons.length && !filters.seasons.includes(s.season)) return false
    if (filters.audiences.length && !filters.audiences.some(a => s.audience.includes(a))) return false
    return true
  })
}

export function projectToArchivedSermon(project: {
  id: string; title: string; passage: string; book: string; chapter: number;
  verseStart: number; verseEnd: number | null; sermonDate: string; preacher: string;
  sermonType: string; audience: string[]; season: string; coreMessage: string;
  wordCount: number; seriesName?: string; themeNames: string[]; tagNames: string[];
  createdAt: string; updatedAt: string;
}): ArchivedSermon {
  return {
    ...project,
    introduction: '',
    conclusion: '',
    outlineTitles: [],
    relatedIds: [],
  }
}

export function getAllArchivedSermons(completedProjects: {
  id: string; title: string; passage: string; book: string; chapter: number;
  verseStart: number; verseEnd: number | null; sermonDate: string; preacher: string;
  sermonType: string; audience: string[]; season: string; coreMessage: string;
  wordCount: number; seriesName?: string; themeNames: string[]; tagNames: string[];
  createdAt: string; updatedAt: string;
}[]): ArchivedSermon[] {
  const fromProjects = completedProjects.map(projectToArchivedSermon)
  return [...ARCHIVE_SERMONS, ...fromProjects]
}
