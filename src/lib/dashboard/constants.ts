export const MAJOR_THEMES = [
  { id: 'theme-major-1', name: '믿음', category: 'major' as const },
  { id: 'theme-major-2', name: '회개', category: 'major' as const },
  { id: 'theme-major-3', name: '은혜', category: 'major' as const },
  { id: 'theme-major-4', name: '구원', category: 'major' as const },
  { id: 'theme-major-5', name: '순종', category: 'major' as const },
  { id: 'theme-major-6', name: '기도', category: 'major' as const },
  { id: 'theme-major-7', name: '위로', category: 'major' as const },
  { id: 'theme-major-8', name: '소망', category: 'major' as const },
  { id: 'theme-major-9', name: '고난', category: 'major' as const },
  { id: 'theme-major-10', name: '치유', category: 'major' as const },
  { id: 'theme-major-11', name: '헌신', category: 'major' as const },
  { id: 'theme-major-12', name: '전도', category: 'major' as const },
  { id: 'theme-major-13', name: '공동체', category: 'major' as const },
  { id: 'theme-major-14', name: '가정', category: 'major' as const },
  { id: 'theme-major-15', name: '제자도', category: 'major' as const },
  { id: 'theme-major-16', name: '사랑', category: 'major' as const },
  { id: 'theme-major-17', name: '감사', category: 'major' as const },
  { id: 'theme-major-18', name: '용서', category: 'major' as const },
  { id: 'theme-major-19', name: '겸손', category: 'major' as const },
  { id: 'theme-major-20', name: '성령', category: 'major' as const },
  { id: 'theme-major-21', name: '예배', category: 'major' as const },
  { id: 'theme-major-22', name: '거룩', category: 'major' as const },
  { id: 'theme-major-23', name: '인내', category: 'major' as const },
  { id: 'theme-major-24', name: '평안', category: 'major' as const },
  { id: 'theme-major-25', name: '사명', category: 'major' as const },
]

export const SITUATION_TAGS = [
  { id: 'situation-1', name: '두려움', category: 'situation' as const },
  { id: 'situation-2', name: '불안', category: 'situation' as const },
  { id: 'situation-3', name: '염려', category: 'situation' as const },
  { id: 'situation-4', name: '상실', category: 'situation' as const },
  { id: 'situation-5', name: '자녀', category: 'situation' as const },
  { id: 'situation-6', name: '관계', category: 'situation' as const },
  { id: 'situation-7', name: '질병', category: 'situation' as const },
  { id: 'situation-8', name: '경제', category: 'situation' as const },
  { id: 'situation-9', name: '진로', category: 'situation' as const },
  { id: 'situation-10', name: '외로움', category: 'situation' as const },
  { id: 'situation-11', name: '침체', category: 'situation' as const },
  { id: 'situation-12', name: '죄책감', category: 'situation' as const },
  { id: 'situation-13', name: '회복', category: 'situation' as const },
  { id: 'situation-14', name: '선택', category: 'situation' as const },
  { id: 'situation-15', name: '갈등', category: 'situation' as const },
  { id: 'situation-16', name: '시험', category: 'situation' as const },
  { id: 'situation-17', name: '유혹', category: 'situation' as const },
  { id: 'situation-18', name: '실패', category: 'situation' as const },
  { id: 'situation-19', name: '낙심', category: 'situation' as const },
  { id: 'situation-20', name: '중독', category: 'situation' as const },
  { id: 'situation-21', name: '상처', category: 'situation' as const },
  { id: 'situation-22', name: '결혼', category: 'situation' as const },
  { id: 'situation-23', name: '직장', category: 'situation' as const },
  { id: 'situation-24', name: '죽음', category: 'situation' as const },
  { id: 'situation-25', name: '노년', category: 'situation' as const },
]

export const EMOTION_TAGS = [
  { id: 'emotion-1', name: '위로', category: 'emotion' as const },
  { id: 'emotion-2', name: '도전', category: 'emotion' as const },
  { id: 'emotion-3', name: '회개', category: 'emotion' as const },
  { id: 'emotion-4', name: '격려', category: 'emotion' as const },
  { id: 'emotion-5', name: '소망', category: 'emotion' as const },
  { id: 'emotion-6', name: '경고', category: 'emotion' as const },
  { id: 'emotion-7', name: '헌신', category: 'emotion' as const },
]

export const ALL_THEMES = [...MAJOR_THEMES, ...SITUATION_TAGS, ...EMOTION_TAGS]

export const SEASONS = [
  '대림절',
  '성탄절',
  '신년',
  '사순절',
  '고난주간',
  '부활절',
  '성령강림절',
  '추수감사절',
  '송구영신',
  '일반주일',
] as const

export const AUDIENCES = [
  '장년',
  '청년',
  '청소년',
  '교사',
  '새가족',
] as const

export const SERMON_TYPES = [
  '주일예배',
  '새벽예배',
  '수요예배',
  '금요기도회',
  '청년예배',
  '특별집회',
] as const

export const BIBLE_BOOKS = [
  '창세기', '출애굽기', '레위기', '민수기', '신명기',
  '여호수아', '사사기', '룻기', '사무엘상', '사무엘하',
  '열왕기상', '열왕기하', '역대상', '역대하', '에스라',
  '느헤미야', '에스더', '욥기', '시편', '잠언',
  '전도서', '아가', '이사야', '예레미야', '예레미야애가',
  '에스겔', '다니엘', '호세아', '요엘', '아모스',
  '오바댜', '요나', '미가', '나훔', '하박국',
  '스바냐', '학개', '스가랴', '말라기',
  '마태복음', '마가복음', '누가복음', '요한복음',
  '사도행전', '로마서', '고린도전서', '고린도후서',
  '갈라디아서', '에베소서', '빌립보서', '골로새서',
  '데살로니가전서', '데살로니가후서', '디모데전서', '디모데후서',
  '디도서', '빌레몬서', '히브리서', '야고보서',
  '베드로전서', '베드로후서', '요한일서', '요한이서',
  '요한삼서', '유다서', '요한계시록',
] as const

export const GRAPH_COLORS = {
  sermon: '#3b82f6',
  passage: '#22c55e',
  theme: '#f97316',
  season: '#a855f7',
  audience: '#6b7280',
  series: '#ef4444',
} as const

export const SIDEBAR_MENUS = [
  { key: 'dashboard', label: '대시보드', icon: '📊', href: '/dashboard' },
  { key: 'sermons', label: '설교 목록', icon: '📜', href: '/sermons' },
  { key: 'sermons-new', label: '새 설교 등록', icon: '✏️', href: '/sermons/new' },
  { key: 'graph', label: '그래프', icon: '🔗', href: '/graph' },
  { key: 'statistics', label: '통계', icon: '📈', href: '/statistics' },
  { key: 'series', label: '시리즈', icon: '📚', href: '/series' },
  { key: 'tags', label: '태그 관리', icon: '🏷️', href: '/tags' },
  { key: 'settings', label: '설정', icon: '⚙️', href: '/settings' },
]
