export interface QuoteEntry {
  quote: string
  author: string
}

export const MONTHLY_QUOTES: QuoteEntry[] = [
  // 1월 — 새해 결심 & 시작
  { quote: '성공의 비결은 준비된 마음이 기회를 만날 때 시작된다.', author: '벤자민 디즈레일리' },
  { quote: '새해는 새로운 페이지다. 무엇을 쓸지는 당신의 손에 달렸다.', author: '존 그린' },
  // 2월 — 인내 & 사랑
  { quote: '인내는 괴로움을 달게 만들고, 노력을 기쁨으로 바꾼다.', author: '윌리엄 펜' },
  { quote: '가장 위대한 것은 사랑이며, 사랑은 가장 오래 지속되는 힘이다.', author: '파울로 코엘료' },
  // 3월 — 도약 & 성장
  { quote: '봄은 언제나 새로운 씨앗을 심는 계절이다. 오늘이 바로 그날이다.', author: '헨리 데이비드 소로' },
  { quote: '성장은 편안함의 반대편에서 일어난다.', author: '론 카우프만' },
  // 4월 — 희망 & 재생
  { quote: '희망은 어두운 밤을 걷는 이가 쥔 가장 작은 별빛이다.', author: '빅토르 위고' },
  { quote: '비온 뒤에 땅이 더 단단해지듯, 시련 후에 우리는 더 강해진다.', author: '헬렌 켈러' },
  // 5월 — 열정 & 노력
  { quote: '열정은 재능보다 강하다. 그것은 평범한 이에게 놀라운 힘을 준다.', author: '오프라 윈프리' },
  { quote: '노력은 재능의 결심이다. 하루의 노력이 일년의 차이를 만든다.', author: '토마스 에디슨' },
  // 6월 — 여름의 에너지
  { quote: '여름은 게으름의 계절이 아니라 더 멀리 뛰기 위한 발판이다.', author: '랠프 월도 에머슨' },
  { quote: '태양이 강할수록 그늘도 짙다. 상반기의 반성이 하반기의 밑거름이다.', author: '톨스토이' },
  // 7월 — 도전 & 용기
  { quote: '용기란 두려움이 없다는 것이 아니라, 두려움에도 행동하는 것이다.', author: '넬슨 만델라' },
  { quote: '한계는 두려움의 다른 이름이다. 한 발 내딛으면 한계는 물러난다.', author: '알베르 카뮈' },
  // 8월 — 집중 & 성실
  { quote: '탁월함은 예술이 아니라 습관의 산물이다. 매일의 성실이 그것을 만든다.', author: '아리스토텔레스' },
  { quote: '집중이 흩어지면 삶도 흩어진다. 오직 하나에 온 마음을 두라.', author: '에픽테토스' },
  // 9월 — 수확 & 성취
  { quote: '가을은 봄에 심은 것을 거두는 계절이다. 오늘의 결실은 지난 봄의 씨앗이다.', author: '라 퐁텐' },
  { quote: '수확의 기쁨은 노동의 땀에서 우러난다.', author: '제임스 러셀 로웰' },
  // 10월 — 감사 & 여유
  { quote: '감사는 마음의 뿌리다. 감사할 때 삶은 두 배로 풍요로워진다.', author: '마르쿠스 아우렐리우스' },
  { quote: '여유는 게으름이 아니라 삶을 바라볼 눈을 주는 지혜다.', author: '세네카' },
  // 11월 — 온기 & 나눔
  { quote: '나눔은 줄어들지 않는 유일한 재산이다.', author: '앙투안 드 생텍쥐페리' },
  { quote: '작은 나눔이 모여 큰 온기가 된다. 세상은 관심으로 따뜻해진다.', author: '마더 테레사' },
  // 12월 — 마무리 & 반성
  { quote: '연말은 결산의 계절이다. 성공도 실패도 모두 내일의 디딤돌이다.', author: '벤자민 프랭클린' },
  { quote: '지난날을 반성하는 이만이 새로운 내일을 설계할 자격이 있다.', author: '소크라테스' },
]

const BASE_YEAR = 2026

export function getQuotePair(year: number, monthNum: number): QuoteEntry[] {
  const slot = (year - BASE_YEAR) * 12 + (monthNum - 1)
  const idx = ((slot % MONTHLY_QUOTES.length) + MONTHLY_QUOTES.length) % MONTHLY_QUOTES.length
  const first = MONTHLY_QUOTES[idx]
  const second = MONTHLY_QUOTES[(idx + 1) % MONTHLY_QUOTES.length]
  return [first, second]
}
