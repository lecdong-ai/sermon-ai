import { Sermon, Series, Theme } from './types'
import {
  ALL_THEMES,
  MAJOR_THEMES,
  SITUATION_TAGS,
  EMOTION_TAGS,
} from './constants'

export const sampleThemes: Theme[] = ALL_THEMES.map((t) => ({
  ...t,
  description: '',
}))

export const sampleSeries: Series[] = []

export const sampleSermons: Sermon[] = [
  {
    id: 'sermon-1',
    title: '두려움을 이기는 믿음',
    date: '2026-03-02',
    preacher: '김은혜 목사',
    sermonType: '주일예배',
    audience: '장년',
    season: '사순절',
    seriesId: 'series-1',
    bibleBook: '마가복음',
    chapterStart: 4,
    verseStart: 35,
    chapterEnd: 4,
    verseEnd: 41,
    normalizedPassage: '마가복음 4:35-41',
    coreMessage:
      '폭풍 앞에서도 두려워하지 않는 이유는 예수님이 함께하시기 때문이다. 우리의 두려움을 믿음으로 바꾸실 주님을 신뢰하자.',
    outlineIntro:
      '인생의 폭풍은 누구에게나 찾아옵니다. 제자들도 갈릴리 바다에서 경험한 폭풍처럼, 우리도 예기치 못한 상황에서 두려움에 사로잡힙니다.',
    outlinePoint1:
      '1. 폭풍은 제자됨의 현실이다 - 예수님과 함께 있어도 폭풍은 온다',
    outlinePoint2:
      '2. 두려움은 믿음의 부재에서 온다 - "믿음이 없느냐"라는 책망',
    outlinePoint3:
      '3. 예수님은 폭풍의 주인이시다 - 말씀 한마디로 잠잠해지는 창조주',
    outlineConclusion:
      '우리 인생의 배에 예수님이 계시다면 어떤 폭풍도 두렵지 않습니다. 오늘도 함께하시는 주님을 바라봅시다.',
    manuscript:
      '그날 저녁에 예수님께서 제자들에게 "바다 저편으로 가자"고 말씀하셨습니다. 제자들은 예수님을 배에 태우고 출발했습니다. 그런데 큰 폭풍이 일어나 파도가 배에 들이치기 시작했습니다. 예수님께서는 고물에서 베개를 베고 주무시고 계셨습니다. 제자들이 예수님을 깨우며 "선생님, 우리가 죽게 되었는데도 돌보지 않으십니까?"라고 말했습니다. 예수님께서 일어나 바람을 꾸짖으시고 바다에게 "잠잠하라, 고요하라"고 말씀하셨습니다. 그러자 바람이 그치고 아주 고요해졌습니다. 예수님께서 제자들에게 "왜 이렇게 두려워하느냐? 아직도 믿음이 없느냐?"고 말씀하셨습니다. 제자들은 매우 두려워하며 서로 말했습니다. "이분이 누구이기에 바람과 바다도 순종하는가?"',
    themeIds: ['theme-major-1', 'theme-major-9', 'situation-1', 'emotion-2'],
    tagIds: ['theme-major-1', 'theme-major-9', 'situation-1', 'emotion-2'],
    relatedSermonIds: ['sermon-2', 'sermon-6'],
    createdAt: '2026-03-02T10:00:00Z',
    updatedAt: '2026-03-02T10:00:00Z',
  },
  {
    id: 'sermon-2',
    title: '여호와는 나의 목자시니',
    date: '2026-02-16',
    preacher: '김은혜 목사',
    sermonType: '주일예배',
    audience: '장년',
    season: '일반주일',
    seriesId: 'series-2',
    bibleBook: '시편',
    chapterStart: 23,
    verseStart: 1,
    chapterEnd: 23,
    verseEnd: 6,
    normalizedPassage: '시편 23:1-6',
    coreMessage:
      '하나님은 나의 목자이시므로 내게 부족함이 없다. 가장 어두운 골짜기에서도 주님의 인도하심을 경험한다.',
    outlineIntro:
      '시편 23편은 다윗이 인생의 목양자 경험을 통해 하나님을 목자로 고백하는 가장 아름다운 신앙고백입니다.',
    outlinePoint1:
      '1. 부족함이 없는 삶 - "내게 부족함이 없으리라"',
    outlinePoint2:
      '2. 인도하심을 경험하는 삶 - "의의 길로 인도하시도다"',
    outlinePoint3:
      '3. 두려움을 이기는 삶 - "주께서 나와 함께 하심이라"',
    outlineConclusion:
      '우리의 목자되신 하나님은 오늘도 우리를 푸른 초장과 쉴 만한 물가로 인도하십니다. 두려워하지 말고 그분을 따르기만 하면 됩니다.',
    manuscript:
      '여호와는 나의 목자시니 내게 부족함이 없으리로다. 그가 나를 푸른 초장에 누이시며 쉴 만한 물가로 인도하시는도다. 내 영혼을 소생시키시고 자기 이름을 위하여 의의 길로 인도하시는도다. 내가 사망의 음침한 골짜기로 다닐지라도 해를 두려워하지 않을 것은 주께서 나와 함께 하심이라. 주의 지팡이와 막대기가 나를 안위하시나이다. 주께서 내 원수 앞에서 내게 상을 베푸시고 기름으로 내 머리에 바르셨으니 내 잔이 넘치나이다. 내 평생에 선하심과 인자하심이 반드시 나를 따르리니 내가 여호와의 집에 영원히 살리로다.',
    themeIds: ['theme-major-7', 'theme-major-8', 'situation-10', 'emotion-1'],
    tagIds: ['theme-major-7', 'theme-major-8', 'situation-10', 'emotion-1'],
    relatedSermonIds: ['sermon-1', 'sermon-6', 'sermon-9'],
    createdAt: '2026-02-16T10:00:00Z',
    updatedAt: '2026-02-16T10:00:00Z',
  },
  {
    id: 'sermon-3',
    title: '잃어버린 아들을 찾는 아버지',
    date: '2026-03-09',
    preacher: '이사랑 목사',
    sermonType: '청년예배',
    audience: '청년',
    season: '사순절',
    seriesId: 'series-1',
    bibleBook: '누가복음',
    chapterStart: 15,
    verseStart: 11,
    chapterEnd: 15,
    verseEnd: 32,
    normalizedPassage: '누가복음 15:11-32',
    coreMessage:
      '하나님의 사랑은 우리가 상상하는 그 이상이다. 아버지의 품으로 돌아오기만 하면 모든 것을 용서하시고 회복시켜 주신다.',
    outlineIntro:
      '탕자 비유는 단순히 방탕한 아들의 이야기가 아니라, 끊임없이 기다리시는 아버지의 사랑에 관한 이야기입니다.',
    outlinePoint1:
      '1. 먼 곳으로 간 아들 - 하나님 없이 살아보려는 우리의 모습',
    outlinePoint2:
      '2. 돌아오기를 기다리는 아버지 - 조건 없는 사랑과 용서',
    outlinePoint3:
      '3. 잔치를 베푸는 아버지 - 회복과 축복의 은혜',
    outlineConclusion:
      '하나님은 우리가 아무리 멀리 가도 돌아오기를 기다리시는 아버지이십니다. 오늘 주님의 품으로 돌아가는 잔치가 있기를 바랍니다.',
    manuscript:
      '어떤 사람에게 두 아들이 있었는데, 그중 작은 아들이 아버지에게 "아버지, 재산 중에서 내게 돌아올 분깃을 주소서"라고 말했습니다. 아버지는 재산을 두 아들에게 나누어 주었습니다. 작은 아들은 모든 것을 다 팔아 먼 나라로 가서 방탕하게 살다가 재산을 다 낭비했습니다. 그 후에 그 나라에 큰 흉년이 들어 궁핍해졌습니다. 그때서야 정신이 든 아들은 "내 아버지에게는 먹을 것이 풍족한데 나는 여기서 굶어 죽겠구나. 일어나 아버지께로 가자"고 말하고 돌아갔습니다. 아버지는 아직도 먼 곳에서 아들을 보고 측은히 여겨 달려가 목을 안고 입을 맞추었습니다. 아들은 "아버지, 내가 하늘과 아버지께 죄를 지었사오니 아버지의 아들이라 일컬음을 감당하지 못하겠나이다"라고 고백했습니다. 그러나 아버지는 상처 입은 아들을 위해 가장 좋은 옷을 입히고 살진 송아지를 잡아 잔치를 베풀었습니다.',
    themeIds: [
      'theme-major-2',
      'theme-major-3',
      'theme-major-10',
      'situation-12',
      'situation-13',
      'emotion-3',
    ],
    tagIds: [
      'theme-major-2',
      'theme-major-3',
      'theme-major-10',
      'situation-12',
      'situation-13',
      'emotion-3',
    ],
    relatedSermonIds: ['sermon-5', 'sermon-8'],
    createdAt: '2026-03-09T10:00:00Z',
    updatedAt: '2026-03-09T10:00:00Z',
  },
  {
    id: 'sermon-4',
    title: '네가 나를 사랑하느냐',
    date: '2026-02-09',
    preacher: '김은혜 목사',
    sermonType: '새벽예배',
    audience: '새벽예배',
    season: '일반주일',
    seriesId: '',
    bibleBook: '요한복음',
    chapterStart: 21,
    verseStart: 15,
    chapterEnd: 21,
    verseEnd: 19,
    normalizedPassage: '요한복음 21:15-19',
    coreMessage:
      '실패와 넘어짐에도 불구하고 주님은 우리를 다시 세우시고 사명을 맡기신다. 중요한 것은 우리의 실패가 아니라 주님을 향한 사랑이다.',
    outlineIntro:
      '베드로는 예수님을 세 번 부인했지만, 부활하신 주님은 그를 다시 찾아오셔서 세 번 "네가 나를 사랑하느냐"고 물으십니다.',
    outlinePoint1:
      '1. 실패에도 찾아오시는 주님 - 부인한 베드로를 찾으신 예수님',
    outlinePoint2:
      '2. 세 번의 질문, 세 번의 회복 - 부인을 넘어선 사랑의 고백',
    outlinePoint3:
      '3. 사랑이 사명이 될 때 - "내 양을 먹이라"는 부르심',
    outlineConclusion:
      '우리의 과거 실패가 현재의 사명을 막지 못합니다. 주님을 사랑한다면 그 사랑이 가장 큰 사명이 됩니다.',
    manuscript:
      '예수님께서 시몬 베드로에게 물으셨습니다. "요한의 아들 시몬아, 네가 이 사람들보다 나를 더 사랑하느냐?" 베드로가 대답했습니다. "주님, 그러하나이다. 내가 주님을 사랑하는 줄 주님께서 아시나이다." 예수님께서 말씀하셨습니다. "내 어린 양을 먹이라." 예수님께서 두 번째로 물으셨습니다. "요한의 아들 시몬아, 네가 나를 사랑하느냐?" 베드로가 대답했습니다. "주님, 그러하나이다. 내가 주님을 사랑하는 줄 주님께서 아시나이다." 예수님께서 말씀하셨습니다. "내 양을 치라." 세 번째로 예수님께서 물으셨습니다. "요한의 아들 시몬아, 네가 나를 사랑하느냐?" 베드로가 근심하며 말했습니다. "주님, 모든 것을 아시오매 내가 주님을 사랑하는 줄을 주님께서 아시나이다." 예수님께서 말씀하셨습니다. "내 양을 먹이라."',
    themeIds: [
      'theme-major-11',
      'theme-major-3',
      'theme-major-15',
      'situation-12',
      'emotion-7',
    ],
    tagIds: [
      'theme-major-11',
      'theme-major-3',
      'theme-major-15',
      'situation-12',
      'emotion-7',
    ],
    relatedSermonIds: ['sermon-3', 'sermon-5'],
    createdAt: '2026-02-09T10:00:00Z',
    updatedAt: '2026-02-09T10:00:00Z',
  },
  {
    id: 'sermon-5',
    title: '믿음으로 살리라',
    date: '2025-10-12',
    preacher: '김은혜 목사',
    sermonType: '수요예배',
    audience: '수요예배',
    season: '일반주일',
    seriesId: 'series-3',
    bibleBook: '하박국',
    chapterStart: 3,
    verseStart: 17,
    chapterEnd: 3,
    verseEnd: 19,
    normalizedPassage: '하박국 3:17-19',
    coreMessage:
      '상황이 어떠하든지 하나님만을 바라고 믿음으로 살아가는 것이 참된 신앙이다. 환경에 흔들리지 않는 믿음이 필요하다.',
    outlineIntro:
      '하박국 선지자는 이해할 수 없는 현실 앞에서 하나님께 질문합니다. 그러나 결국 그는 상황을 넘어선 믿음을 고백합니다.',
    outlinePoint1:
      '1. 이해할 수 없는 현실 - "어찌하여..."라는 선지자의 질문',
    outlinePoint2:
      '2. 상황을 초월한 고백 - 모든 것이 사라져도 주님을 기뻐하리라',
    outlinePoint3:
      '3. 믿음의 결과 - 사슴의 발과 같은 인도하심',
    outlineConclusion:
      '우리의 믿음은 상황에 근거하지 않습니다. 하나님의 성품에 근거합니다. 오늘도 상황을 넘어 주님을 바라보는 믿음으로 살아갑시다.',
    manuscript:
      '비록 무화과나무가 무성하지 못하며 포도나무에 열매가 없으며 감람나무에 소출이 없으며 밭에 먹을 것이 없으며 우리에 양이 없으며 외양간에 소가 없을지라도 나는 여호와로 말미암아 즐거워하며 나의 구원의 하나님으로 말미암아 기뻐하리로다. 주 여호와는 나의 힘이시라 나의 발을 사슴과 같게 하사 나를 높은 곳으로 다니게 하시리로다.',
    themeIds: ['theme-major-1', 'theme-major-9', 'situation-11', 'emotion-5'],
    tagIds: ['theme-major-1', 'theme-major-9', 'situation-11', 'emotion-5'],
    relatedSermonIds: ['sermon-1', 'sermon-6'],
    createdAt: '2025-10-12T10:00:00Z',
    updatedAt: '2025-10-12T10:00:00Z',
  },
  {
    id: 'sermon-6',
    title: '그렇다면 우리가 무슨 말을 하리요',
    date: '2026-01-19',
    preacher: '박하늘 목사',
    sermonType: '주일예배',
    audience: '장년',
    season: '신년',
    seriesId: '',
    bibleBook: '로마서',
    chapterStart: 8,
    verseStart: 31,
    chapterEnd: 8,
    verseEnd: 39,
    normalizedPassage: '로마서 8:31-39',
    coreMessage:
      '하나님이 우리 편이시라면 누가 우리를 대적하겠는가. 그 어떤 것도 하나님의 사랑에서 우리를 끊을 수 없다.',
    outlineIntro:
      '바울은 로마서 8장에서 구원의 확신에 대해 선포합니다. 그 누구도, 그 무엇도 우리를 향한 하나님의 사랑을 막을 수 없습니다.',
    outlinePoint1:
      '1. 하나님이 우리 편이시라면 - 가장 강력한 보증',
    outlinePoint2:
      '2. 정죄함이 없는 삶 - 예수님 안에서의 자유',
    outlinePoint3:
      '3. 끊을 수 없는 사랑 - 어떤 고난도 이길 수 있는 힘',
    outlineConclusion:
      '우리는 승리자 이상입니다. 우리를 향한 하나님의 사랑은 영원하고 변함이 없습니다. 이 사랑 안에서 우리는 어떤 상황도 이겨낼 수 있습니다.',
    manuscript:
      '그렇다면 우리가 이 모든 일에 무슨 말을 하리요. 만일 하나님이 우리를 위하시면 누가 우리를 대적하리요. 자기 아들을 아끼지 아니하시고 우리 모든 사람을 위하여 내주신 이가 어찌 그 아들과 함께 모든 것을 우리에게 은사로 주지 아니하시겠느냐. 누가 능히 하나님께서 택하신 자들을 고발하리요. 의롭다 하신 이는 하나님이시니 누가 정죄하리요. 죽으실 뿐 아니라 다시 살아나신 이는 그리스도 예수시니 그는 하나님 우편에 계신 우리를 위하여 간구하시는 자시니라. 누가 우리를 그리스도의 사랑에서 끊으리요. 환난이나 곤고나 박해나 기근이나 적신이나 위험이나 칼이랴. 내가 확신하노니 사망이나 생명이나 천사들이나 권세자들이나 현재 일이나 장래 일이나 능력이나 높음이나 깊음이나 다른 어떤 피조물이라도 우리를 우리 주 그리스도 예수 안에 있는 하나님의 사랑에서 끊을 수 없으리라.',
    themeIds: ['theme-major-8', 'theme-major-7', 'theme-major-3', 'emotion-1'],
    tagIds: ['theme-major-8', 'theme-major-7', 'theme-major-3', 'emotion-1'],
    relatedSermonIds: ['sermon-2', 'sermon-9', 'sermon-5'],
    createdAt: '2026-01-19T10:00:00Z',
    updatedAt: '2026-01-19T10:00:00Z',
  },
  {
    id: 'sermon-7',
    title: '하나님을 경외하는 순종',
    date: '2026-01-05',
    preacher: '김은혜 목사',
    sermonType: '주일예배',
    audience: '장년',
    season: '신년',
    seriesId: 'series-2',
    bibleBook: '창세기',
    chapterStart: 22,
    verseStart: 1,
    chapterEnd: 22,
    verseEnd: 19,
    normalizedPassage: '창세기 22:1-19',
    coreMessage:
      '아브라함의 순종은 우리에게 믿음의 본질이 무엇인지 보여준다. 가장 소중한 것조차 하나님께 드릴 때 하나님은 반드시 채우신다.',
    outlineIntro:
      '하나님께서 아브라함에게 독자 이삭을 번제로 드리라고 명령하십니다. 이해할 수 없는 명령 앞에서 아브라함은 순종합니다.',
    outlinePoint1:
      '1. 이해할 수 없는 명령 - 가장 소중한 것을 요구하시는 하나님',
    outlinePoint2:
      '2. 순종의 여정 - 믿음의 발걸음',
    outlinePoint3:
      '3. 여호와 이레 - 준비하시는 하나님을 경험함',
    outlineConclusion:
      '때로 하나님의 명령은 이해할 수 없습니다. 그러나 그분은 우리의 순종 위에 더 큰 은혜를 예비하신 분이십니다. 오늘도 여호와 이레를 경험하는 믿음으로 살아갑시다.',
    manuscript:
      '하나님께서 아브라함을 시험하시고자 하셨습니다. "아브라함아!" 그가 대답했습니다. "내가 여기 있나이다." 하나님께서 말씀하셨습니다. "네 아들, 네 사랑하는 독자 이삭을 데리고 모리아 땅으로 가서 내가 네게 지시하는 한 산에서 그를 번제로 드려라." 아브라함이 아침 일찍 일어나 나귀에 안장을 지우고 두 종과 그의 아들 이삭을 데리고 번제에 쓸 나무를 쪼개어 하나님께서 그에게 지시하신 곳으로 갔습니다. 사흘째 되는 날 아브라함이 눈을 들어 그곳을 멀리 바라보았습니다. 아브라함이 종들에게 말했습니다. "너희는 나귀와 함께 여기서 기다리라. 내가 아이와 함께 저기 가서 예배하고 너희에게로 돌아오리라." 아브라함이 번제 나무를 가져다가 아들 이삭에게 지우고 자기는 불과 칼을 손에 들고 두 사람이 함께 갔습니다.',
    themeIds: ['theme-major-5', 'theme-major-11', 'theme-major-1', 'emotion-7'],
    tagIds: ['theme-major-5', 'theme-major-11', 'theme-major-1', 'emotion-7'],
    relatedSermonIds: ['sermon-3', 'sermon-8'],
    createdAt: '2026-01-05T10:00:00Z',
    updatedAt: '2026-01-05T10:00:00Z',
  },
  {
    id: 'sermon-8',
    title: '두려워하지 말고 가만히 있으라',
    date: '2025-11-14',
    preacher: '박하늘 목사',
    sermonType: '금요기도회',
    audience: '금요기도회',
    season: '추수감사절',
    seriesId: '',
    bibleBook: '출애굽기',
    chapterStart: 14,
    verseStart: 10,
    chapterEnd: 14,
    verseEnd: 31,
    normalizedPassage: '출애굽기 14:10-31',
    coreMessage:
      '하나님의 구원은 우리가 아무것도 할 수 없는 바로 그 순간에 역사하신다. 가만히 서서 하나님의 구원을 보라.',
    outlineIntro:
      '이스라엘 백성은 홍해 앞에 서 있습니다. 앞에는 바다, 뒤에는 애굽 군대. 절망적인 상황 속에서 모세는 "두려워하지 말라"고 외칩니다.',
    outlinePoint1:
      '1. 절망의 순간에 찾아오시는 하나님 - 앞길이 막혔을 때',
    outlinePoint2:
      '2. 두려워하지 말고 가만히 있으라 - 하나님의 전쟁',
    outlinePoint3:
      '3. 홍해가 갈라지는 기적 - 오늘도 역사하시는 하나님',
    outlineConclusion:
      '하나님은 우리에게 불가능한 상황에서 가장 크게 역사하십니다. 두려워하지 말고 가만히 서서 오늘도 역사하실 하나님을 바라봅시다.',
    manuscript:
      '바로가 가까이 올 때에 이스라엘 자손이 눈을 들어 보니 애굽 사람들이 자기들 뒤에 이른지라 그들이 매우 두려워하여 여호와께 부르짖었습니다. 그들이 모세에게 말했습니다. "애굽에 매장지가 없어서 당신이 우리를 인도하여 광야에서 죽게 하느냐?" 모세가 백성에게 말했습니다. "너희는 두려워하지 말고 가만히 서서 여호와께서 오늘 너희를 위하여 행하시는 구원을 보라. 너희가 오늘 본 애굽 사람을 다시는 영원히 보지 못하리라. 여호와께서 너희를 위하여 싸우시리니 너희는 가만히 있을지니라." 모세가 바다 위로 손을 내밀매 여호와께서 큰 동풍으로 밤새도록 바다를 물러가게 하시니 물이 갈라져 바다가 마른 땅이 되었습니다.',
    themeIds: ['theme-major-1', 'theme-major-4', 'situation-1', 'emotion-2'],
    tagIds: ['theme-major-1', 'theme-major-4', 'situation-1', 'emotion-2'],
    relatedSermonIds: ['sermon-1', 'sermon-5', 'sermon-7'],
    createdAt: '2025-11-14T10:00:00Z',
    updatedAt: '2025-11-14T10:00:00Z',
  },
  {
    id: 'sermon-9',
    title: '고난이 주는 유익',
    date: '2025-11-30',
    preacher: '김은혜 목사',
    sermonType: '수요예배',
    audience: '수요예배',
    season: '일반주일',
    seriesId: 'series-3',
    bibleBook: '시편',
    chapterStart: 119,
    verseStart: 65,
    chapterEnd: 119,
    verseEnd: 72,
    normalizedPassage: '시편 119:65-72',
    coreMessage:
      '고난은 저주가 아니라 하나님의 훈련이며, 말씀을 배우게 하는 하나님의 도구이다. 고난을 통해 우리는 더 깊은 신앙으로 자란다.',
    outlineIntro:
      '시편 기자는 고난이 자신에게 유익이 되었다고 고백합니다. 고난이 없었다면 말씀을 배우지 못했을 것이라고 말합니다.',
    outlinePoint1:
      '1. 고난의 원리 - 하나님께서 허락하시는 훈련',
    outlinePoint2:
      '2. 고난의 유익 - 말씀을 배우는 기회',
    outlinePoint3:
      '3. 고난 이후의 은혜 - 단련된 믿음',
    outlineConclusion:
      '우리가 지금 겪는 고난이 헛되지 않습니다. 하나님은 그 고난을 통해 우리를 단련시키시고 더 큰 은혜를 예비하십니다.',
    manuscript:
      '주께서 주의 말씀대로 주의 종을 선대하셨나이다. 내가 주의 교훈을 믿었사오니 주께서 내게 지식과 선견을 가르치소서. 내가 고난 당하기 전에는 잘못하였더니 이제는 주의 말씀을 지키나이다. 주는 선하사 선을 행하시오니 주의 율례를 내게 가르치소서. 교만한 자들이 거짓으로 나를 더럽혔사오나 나는 전심으로 주의 법도를 지키나이다. 그들의 마음은 살찌고 기름 덩어리 같으나 나는 주의 법을 즐거워하나이다. 고난 당한 것이 내게 유익이라 이로 말미암아 내가 주의 율례를 배우게 되었나이다. 주의 입의 법이 내게는 천천 금은보다 좋으니이다.',
    themeIds: ['theme-major-9', 'theme-major-5', 'theme-major-8', 'emotion-5'],
    tagIds: ['theme-major-9', 'theme-major-5', 'theme-major-8', 'emotion-5'],
    relatedSermonIds: ['sermon-5', 'sermon-6', 'sermon-2'],
    createdAt: '2025-11-30T10:00:00Z',
    updatedAt: '2025-11-30T10:00:00Z',
  },
  {
    id: 'sermon-10',
    title: '하나님 나라의 가치',
    date: '2026-02-23',
    preacher: '이사랑 목사',
    sermonType: '청년예배',
    audience: '청년',
    season: '일반주일',
    seriesId: 'series-4',
    bibleBook: '누가복음',
    chapterStart: 15,
    verseStart: 1,
    chapterEnd: 15,
    verseEnd: 10,
    normalizedPassage: '누가복음 15:1-10',
    coreMessage:
      '하나님 나라는 잃어버린 한 영혼을 찾기 위해 모든 것을 거시는 가치의 전환을 요구한다. 잃어버린 자를 향한 하나님의 마음을 배우자.',
    outlineIntro:
      '예수님께서 세리와 죄인들과 함께 식사하신다는 비난에 대해 잃은 양과 잃은 드라크마 비유로 하나님 나라의 가치를 설명하십니다.',
    outlinePoint1:
      '1. 잃은 양을 찾는 목자 - 한 영혼의 소중함',
    outlinePoint2:
      '2. 잃은 드라크마를 찾는 여인 - 값진 것을 찾는 열정',
    outlinePoint3:
      '3. 하늘의 잔치 - 회개하는 한 사람으로 인한 기쁨',
    outlineConclusion:
      '하나님은 우리가 생각하는 것보다 훨씬 더 잃어버린 영혼을 소중히 여기십니다. 우리도 그 마음을 품고 살아가야 합니다.',
    manuscript:
      '모든 세리와 죄인들이 예수님의 말씀을 들으러 가까이 나아왔습니다. 바리새인과 서기관들이 수군거려 말했습니다. "이 사람이 죄인을 영접하고 음식을 같이 먹는다." 예수님께서 이 비유를 말씀하셨습니다. "너희 중에 어떤 사람이 양 백 마리가 있는데 그중에 하나를 잃으면 아흔아홉 마리를 들에 두고 그 잃은 것을 찾을 때까지 찾아다니지 않겠느냐? 찾은 즉 기뻐하며 어깨에 메고 집에 와서 친구와 이웃을 불러 함께 기뻐하자고 하리라. 이와 같이 회개할 필요 없는 의인 아흔아홉보다 회개하는 죄인 하나로 인하여 하늘에서는 더 기뻐하리라."',
    themeIds: ['theme-major-3', 'theme-major-12', 'theme-major-13', 'emotion-4'],
    tagIds: ['theme-major-3', 'theme-major-12', 'theme-major-13', 'emotion-4'],
    relatedSermonIds: ['sermon-3', 'sermon-4'],
    createdAt: '2026-02-23T10:00:00Z',
    updatedAt: '2026-02-23T10:00:00Z',
  },
  {
    id: 'sermon-11',
    title: '함께 세워가는 공동체',
    date: '2026-03-16',
    preacher: '김은혜 목사',
    sermonType: '주일예배',
    audience: '장년',
    season: '사순절',
    seriesId: 'series-1',
    bibleBook: '에베소서',
    chapterStart: 4,
    verseStart: 1,
    chapterEnd: 4,
    verseEnd: 16,
    normalizedPassage: '에베소서 4:1-16',
    coreMessage:
      '교회는 그리스도의 몸으로, 각 지체가 제 역할을 감당할 때 건강하게 자란다. 우리는 서로를 필요로 하는 공동체이다.',
    outlineIntro:
      '바울은 에베소 교회에 부르심에 합당하게 행하고, 교회가 그리스도의 몸으로 어떻게 성장해 가는지 가르칩니다.',
    outlinePoint1:
      '1. 하나 됨의 기초 - "몸이 하나요 성령도 하나"',
    outlinePoint2:
      '2. 다양한 은사 - 각자에게 주신 달란트',
    outlinePoint3:
      '3. 사랑 안에서 자라는 몸 - 공동체의 성장',
    outlineConclusion:
      '우리는 혼자 자라는 것이 아닙니다. 교회라는 몸 안에서 함께 자라가고 있습니다. 서로를 존중하고 섬길 때 우리는 더욱 건강한 공동체가 됩니다.',
    manuscript:
      '그러므로 주 안에서 갇힌 내가 너희를 권하노니 너희가 부르심을 받은 그 부르심에 합당하게 행하여 모든 겸손과 온유로 하고 오래 참음으로 사랑 가운데 서로 용납하며 평안의 매는 줄로 성령의 하나 되게 하신 것을 힘써 지키라. 몸이 하나요 성령도 한 분이시니 이와 같이 너희가 부르심의 한 소망 안에서 부르심을 받았느니라. 주도 한 분이시요 믿음도 하나요 세례도 하나요 하나님도 한 분이시니 곧 만유의 아버지시라. 그가 우리 모두를 통틀어 역사하신다. 우리 각 사람에게 그리스도의 선물의 분량대로 은혜를 주셨나니 그가 어떤 사람은 사도로, 어떤 사람은 선지자로, 어떤 사람은 복음 전하는 자로, 어떤 사람은 목사와 교사로 삼으셨으니 이는 성도를 온전하게 하여 봉사의 일을 하게 하며 그리스도의 몸을 세우려 하심이라.',
    themeIds: ['theme-major-13', 'theme-major-14', 'theme-major-15', 'emotion-4'],
    tagIds: ['theme-major-13', 'theme-major-14', 'theme-major-15', 'emotion-4'],
    relatedSermonIds: ['sermon-10', 'sermon-6', 'sermon-4'],
    createdAt: '2026-03-16T10:00:00Z',
    updatedAt: '2026-03-16T10:00:00Z',
  },
  {
    id: 'sermon-12',
    title: '기도하지 않을 수 없습니다',
    date: '2026-01-26',
    preacher: '박하늘 목사',
    sermonType: '새벽예배',
    audience: '새벽예배',
    season: '신년',
    seriesId: '',
    bibleBook: '누가복음',
    chapterStart: 11,
    verseStart: 1,
    chapterEnd: 11,
    verseEnd: 13,
    normalizedPassage: '누가복음 11:1-13',
    coreMessage:
      '기도는 우리의 필요를 채우는 수단일 뿐 아니라, 하나님과의 인격적인 교제의 통로이다. 예수님이 가르쳐주신 기도를 통해 바른 기도를 배운다.',
    outlineIntro:
      '제자들이 예수님께 "기도하는 법을 가르쳐주소서"라고 요청합니다. 예수님은 주기도문을 가르쳐주시고 기도에 대한 비유를 말씀하십니다.',
    outlinePoint1:
      '1. 기도의 모델 - 주기도문이 가르치는 기도의 우선순위',
    outlinePoint2:
      '2. 간청하는 기도 - 밤중에 찾아온 친구 비유',
    outlinePoint3:
      '3. 구하고 찾고 두드리라 - 응답하시는 아버지의 마음',
    outlineConclusion:
      '하나님은 우리의 기도를 들으시고 응답하시기를 기뻐하시는 아버지이십니다. 오늘도 담대히 주님 앞에 나아가 구하고 찾고 두드리는 기도를 드립시다.',
    manuscript:
      `예수님께서 한 곳에서 기도하시고 마치시매 제자 중 하나가 여쭈었습니다. "주님, 요한이 자기 제자들에게 기도를 가르친 것과 같이 우리에게도 가르쳐 주옵소서." 예수님께서 말씀하셨습니다. "기도할 때는 이렇게 하라. 아버지여, 이름이 거룩히 여김을 받으시오며 나라가 임하시오며 우리에게 날마다 일용할 양식을 주시고 우리가 우리에게 죄 지은 모든 사람을 용서하오니 우리의 죄도 용서하여 주시고 우리를 시험에 들게 하지 마옵소서." 또 말씀하셨습니다. "너희 중에 누가 벗이 있어 밤중에 그에게 가서 말하기를 \'친구여, 나에게 떡 세 덩이를 꾸어 주게. 내 친구가 길에서 왔는데 내가 먹일 것이 없도다\' 하면 그가 안에서 대답하여 \'나를 괴롭게 하지 마옵소서. 문이 이미 닫혔고 아이들이 나와 함께 침소에 누웠으니 일어나서 줄 수가 없노라\' 하겠느냐? 내가 너희에게 말하노니 비록 벗됨으로 인하여 일어나서 주지 아니할지라도 강청함으로 말미암아 일어나서 그 요구대로 주리라. 내가 또 너희에게 말하노니 구하라 그러면 너희에게 주실 것이요 찾으라 그러면 찾을 것이요 문을 두드리라 그러면 열릴 것이니 구하는 이마다 받을 것이요 찾는 이마다 찾을 것이요 두드리는 이마다 열릴 것이니라."`,
    themeIds: ['theme-major-6', 'theme-major-1', 'theme-major-3', 'emotion-2'],
    tagIds: ['theme-major-6', 'theme-major-1', 'theme-major-3', 'emotion-2'],
    relatedSermonIds: ['sermon-7', 'sermon-8', 'sermon-2'],
    createdAt: '2026-01-26T10:00:00Z',
    updatedAt: '2026-01-26T10:00:00Z',
  },
  {
    id: 'sermon-13',
    title: '치유하시는 하나님',
    date: '2025-12-07',
    preacher: '이사랑 목사',
    sermonType: '주일예배',
    audience: '장년',
    season: '대림절',
    seriesId: '',
    bibleBook: '마가복음',
    chapterStart: 5,
    verseStart: 25,
    chapterEnd: 5,
    verseEnd: 34,
    normalizedPassage: '마가복음 5:25-34',
    coreMessage:
      '예수님께 나아가는 믿음은 우리의 가장 깊은 상처도 치유하신다. 두려움을 극복하고 주님의 옷자락을 붙잡는 믿음이 필요하다.',
    outlineIntro:
      '12년 동안 혈루증으로 고통받던 여인. 그녀는 모든 재산을 의사에게 쏟아부었지만 나아지지 않았습니다. 그러나 예수님에 대한 소문을 듣고 마지막 희망을 품습니다.',
    outlinePoint1:
      '1. 12년의 고통 - 희망을 잃지 않은 여인',
    outlinePoint2:
      '2. 예수의 옷에 손을 댐 - 두려움을 넘어선 믿음',
    outlinePoint3:
      '3. "네 딸아, 네 믿음이 너를 구원했느니라" - 온전한 치유',
    outlineConclusion:
      '때로 우리의 상처는 너무 오래되어 치유될 수 없다고 생각합니다. 그러나 예수님께 나아가는 믿음은 여전히 역사합니다. 오늘 그 믿음의 손을 내밀어 주님을 만지십시오.',
    manuscript:
      '열두 해 동안 혈루증으로 고통받는 한 여인이 있었습니다. 그가 많은 의사에게 많은 고생을 하며 가진 것을 다 허비하였으나 아무 효과도 없고 도리어 더 중하여졌습니다. 그가 예수에 관한 소문을 듣고 무리 가운데로 들어와 예수의 뒤로 가서 그 옷에 손을 대었습니다. 이는 그가 "그의 옷에만 손을 대어도 구원을 받으리라"고 생각했기 때문입니다. 곧 그 출혈이 멎고 병이 나은 것을 몸에 깨달았습니다. 예수님께서 그 능력이 자기에게서 나간 것을 곧 아시고 무리 가운데서 돌이켜 "누가 내 옷에 손을 대었느냐"고 물으셨습니다. 그 여인이 자기에게 일어난 일을 알고 두려워하며 떨며 나아와 그 앞에 엎드려 모든 사실을 말씀드렸습니다. 예수님께서 그에게 말씀하셨습니다. "딸아, 네 믿음이 너를 구원하였으니 평안히 가라. 네 병에서 놓여 건강할지어다."',
    themeIds: ['theme-major-10', 'theme-major-1', 'situation-7', 'emotion-1'],
    tagIds: ['theme-major-10', 'theme-major-1', 'situation-7', 'emotion-1'],
    relatedSermonIds: ['sermon-1', 'sermon-8', 'sermon-5'],
    createdAt: '2025-12-07T10:00:00Z',
    updatedAt: '2025-12-07T10:00:00Z',
  },
  {
    id: 'sermon-14',
    title: '가정을 향한 하나님의 약속',
    date: '2025-12-24',
    preacher: '김은혜 목사',
    sermonType: '주일예배',
    audience: '장년',
    season: '성탄절',
    seriesId: '',
    bibleBook: '마태복음',
    chapterStart: 1,
    verseStart: 18,
    chapterEnd: 1,
    verseEnd: 25,
    normalizedPassage: '마태복음 1:18-25',
    coreMessage:
      '성탄은 하나님이 우리와 함께하시기 위해 이 땅에 오신 사건이다. 요셉의 순종을 통해 하나님의 구원 계획이 가정을 통해 이루어짐을 배운다.',
    outlineIntro:
      '성탄절, 우리는 종종 아기 예수님의 탄생 자체에 집중하지만, 그 배경에는 요셉과 마리아의 순종이 있었습니다.',
    outlinePoint1:
      '1. 이해할 수 없는 상황 - 약혼녀 마리아의 임신',
    outlinePoint2:
      '2. 요셉의 고민과 꿈 - 하나님의 개입',
    outlinePoint3:
      '3. 임마누엘 - 하나님이 우리와 함께 계시다',
    outlineConclusion:
      '성탄의 핵심은 임마누엘, 하나님이 우리와 함께하신다는 사실입니다. 어떤 상황 속에서도 우리와 함께하시는 주님을 바라봅시다.',
    manuscript:
      '예수 그리스도의 나심은 이러하니라. 그의 어머니 마리아가 요셉과 약혼하고 동거하기 전에 성령으로 잉태된 것이 나타났더니 그의 남편 요셉은 의로운 사람이라 그를 드러내지 아니하고 가만히 끊고자 하여 이 일을 생각할 때에 주의 사자가 꿈에 나타나 이르되 "다윗의 자손 요셉아, 네 아내 마리아 데려오기를 두려워하지 말라. 그에게 잉태된 자는 성령으로 된 것이라. 아들을 낳으리니 이름을 예수라 하라. 이는 그가 자기 백성을 그들의 죄에서 구원할 자이심이라" 하니라. 이 모든 일이 된 것은 주께서 선지자로 하신 말씀을 이루려 하심이니 이르시되 "보라 처녀가 잉태하여 아들을 낳을 것이요 그의 이름은 임마누엘이라 하리라" 하셨으니 이를 번역한즉 "하나님이 우리와 함께 계시다" 함이라. 요셉이 잠에서 깨어 일어나 주의 사자가 분부한 대로 그의 아내를 데려왔으나 아들을 낳기까지 동침하지 아니하더니 낳으매 이름을 예수라 하니라.',
    themeIds: ['theme-major-3', 'theme-major-14', 'theme-major-4', 'emotion-1'],
    tagIds: ['theme-major-3', 'theme-major-14', 'theme-major-4', 'emotion-1'],
    relatedSermonIds: ['sermon-7', 'sermon-12'],
    createdAt: '2025-12-24T10:00:00Z',
    updatedAt: '2025-12-24T10:00:00Z',
  },
]
