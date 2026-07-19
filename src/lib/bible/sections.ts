// 한국 개역개정 성경의 소제목(섹션 제목) 데이터베이스
// 분할 시 AI가 자연스러운 묵상 단위로 끊을 수 있도록 안내하는 용도
// 데이터 출처: 대한성서공회 개역개정 기준 주요 소제목

export interface BibleSection {
  startVerse: number
  endVerse: number
  title: string
}

// 약어 → 풀네임 매핑
const BOOK_NAME_MAP: Record<string, string> = {
  '창세기': '창세기', '창': '창세기',
  '에베소서': '에베소서', '엡': '에베소서',
  '로마서': '로마서', '롬': '로마서',
  '빌립보서': '빌립보서', '빌': '빌립보서',
  '골로새서': '골로새서', '골': '골로새서',
  '갈라디아서': '갈라디아서', '갈': '갈라디아서',
  '고린도전서': '고린도전서', '고전': '고린도전서',
  '고린도후서': '고린도후서', '고후': '고린도후서',
  '데살로니가전서': '데살로니가전서', '살전': '데살로니가전서',
  '데살로니가후서': '데살로니가후서', '살후': '데살로니가후서',
  '디모데전서': '디모데전서', '딤전': '디모데전서',
  '디모데후서': '디모데후서', '딤후': '디모데후서',
  '히브리서': '히브리서', '히': '히브리서',
  '베드로전서': '베드로전서', '벧전': '베드로전서',
  '베드로후서': '베드로후서', '벧후': '베드로후서',
  '요한일서': '요한일서', '요일': '요한일서',
  '야고보서': '야고보서', '약': '야고보서',
  '마태복음': '마태복음', '마': '마태복음',
  '요한복음': '요한복음', '요': '요한복음',
  '시편': '시편', '시': '시편',
}

export const BIBLE_SECTIONS: Record<string, Record<number, BibleSection[]>> = {
  // ====== 창세기 ======
  '창세기': {
    1: [
      { startVerse: 1, endVerse: 25, title: '천지 창조' },
      { startVerse: 26, endVerse: 31, title: '하나님의 형상대로 사람을 창조하시다' },
    ],
    2: [
      { startVerse: 1, endVerse: 3, title: '안식일을 거룩히 지키다' },
      { startVerse: 4, endVerse: 17, title: '에덴동산과 아담의 사명' },
      { startVerse: 18, endVerse: 25, title: '아담을 돕는 배필 하와' },
    ],
    3: [
      { startVerse: 1, endVerse: 7, title: '뱀의 유혹과 인간의 타락' },
      { startVerse: 8, endVerse: 24, title: '타락의 결과와 하나님의 심판' },
    ],
    4: [
      { startVerse: 1, endVerse: 16, title: '가인과 아벨의 제사' },
      { startVerse: 17, endVerse: 26, title: '가인의 후예와 셋의 탄생' },
    ],
    5: [
      { startVerse: 1, endVerse: 32, title: '아담으로부터 노아까지의 족보' },
    ],
    6: [
      { startVerse: 1, endVerse: 8, title: '인간의 죄악과 노아의 은혜' },
      { startVerse: 9, endVerse: 22, title: '방주 건조 명령' },
    ],
    7: [
      { startVerse: 1, endVerse: 24, title: '홍수 심판이 임하다' },
    ],
    8: [
      { startVerse: 1, endVerse: 22, title: '홍수의 끝과 노아의 제사' },
    ],
    9: [
      { startVerse: 1, endVerse: 17, title: '하나님의 언약과 무지개' },
      { startVerse: 18, endVerse: 29, title: '노아의 후예와 가나안의 저주' },
    ],
    10: [
      { startVerse: 1, endVerse: 32, title: '노아의 후예와 열국의 분포' },
    ],
    11: [
      { startVerse: 1, endVerse: 9, title: '바벨탑 사건과 언어의 혼잡' },
      { startVerse: 10, endVerse: 32, title: '셈의 족보와 아브라함의 부르심' },
    ],
  },

  // ====== 에베소서 ======
  '에베소서': {
    1: [
      { startVerse: 1, endVerse: 2, title: '인사' },
      { startVerse: 3, endVerse: 14, title: '그리스도 안의 영적 축복' },
      { startVerse: 15, endVerse: 23, title: '그리스도의 우월성과 교회의 본질' },
    ],
    2: [
      { startVerse: 1, endVerse: 10, title: '은혜로 구원받음' },
      { startVerse: 11, endVerse: 18, title: '그리스도 안에서 하나 됨' },
      { startVerse: 19, endVerse: 22, title: '하나님의 가정' },
    ],
    3: [
      { startVerse: 1, endVerse: 13, title: '이방인의 복음과 바울의 사역' },
      { startVerse: 14, endVerse: 21, title: '그리스도의 사랑을 알기 위한 기도' },
    ],
    4: [
      { startVerse: 1, endVerse: 16, title: '교회의 일치와 은사의 다양성' },
      { startVerse: 17, endVerse: 24, title: '새 사람과 의의 거룩함' },
      { startVerse: 25, endVerse: 32, title: '서로 격려하고 용서하라' },
    ],
    5: [
      { startVerse: 1, endVerse: 14, title: '빛 가운데 행하며 사랑으로 살라' },
      { startVerse: 15, endVerse: 21, title: '지혜로 때를 채우라' },
      { startVerse: 22, endVerse: 33, title: '아내와 남편의 관계' },
    ],
    6: [
      { startVerse: 1, endVerse: 9, title: '자녀와 부모, 종과 상전' },
      { startVerse: 10, endVerse: 20, title: '하나님의 전신갑주' },
      { startVerse: 21, endVerse: 24, title: '마지막 인사' },
    ],
  },

  // ====== 로마서 ======
  '로마서': {
    1: [
      { startVerse: 1, endVerse: 7, title: '인사와 감사' },
      { startVerse: 8, endVerse: 17, title: '복음의 능력과 의의 계시' },
      { startVerse: 18, endVerse: 32, title: '모든 사람의 죄와 하나님의 진노' },
    ],
    2: [
      { startVerse: 1, endVerse: 16, title: '하나님의 의로운 심판' },
      { startVerse: 17, endVerse: 29, title: '유대인의 특권과 책임' },
    ],
    3: [
      { startVerse: 1, endVerse: 8, title: '유대인의 우월성? 아니다' },
      { startVerse: 9, endVerse: 20, title: '모든 사람이 죄 아래에' },
      { startVerse: 21, endVerse: 31, title: '의롭게 하시는 하나님의 의' },
    ],
    4: [
      { startVerse: 1, endVerse: 12, title: '아브라함의 믿음의 예' },
      { startVerse: 13, endVerse: 25, title: '믿음의 약속과 의로 칭함' },
    ],
    5: [
      { startVerse: 1, endVerse: 11, title: '의롭게 된 자의 평강과 소망' },
      { startVerse: 12, endVerse: 21, title: '아담과 그리스도 — 죄와 은혜의 비교' },
    ],
    6: [
      { startVerse: 1, endVerse: 14, title: '죄 안에서 죽고 의 안에서 살다' },
      { startVerse: 15, endVerse: 23, title: '의의 종이 된 자들' },
    ],
    7: [
      { startVerse: 1, endVerse: 6, title: '율법에서 해방된 새 생명' },
      { startVerse: 7, endVerse: 25, title: '율법과 죄의 관계' },
    ],
    8: [
      { startVerse: 1, endVerse: 17, title: '성령의 따라 사는 삶' },
      { startVerse: 18, endVerse: 27, title: '현재의 고난과 미래의 영광' },
      { startVerse: 28, endVerse: 39, title: '우리를 사랑하시는 하나님' },
    ],
    9: [
      { startVerse: 1, endVerse: 5, title: '바울의 이스라엘을 위한 통곡' },
      { startVerse: 6, endVerse: 29, title: '하나님의 약속은 이스라엘의 일부가 아니라' },
      { startVerse: 30, endVerse: 33, title: '이방인의 의, 이스라엘의 걸림돌' },
    ],
    10: [
      { startVerse: 1, endVerse: 13, title: '의의 근원: 믿음' },
      { startVerse: 14, endVerse: 21, title: '복음 전파의 필요성' },
    ],
    11: [
      { startVerse: 1, endVerse: 10, title: '남은 자의 구원' },
      { startVerse: 11, endVerse: 24, title: '이방인의 접붙임' },
      { startVerse: 25, endVerse: 36, title: '만민의 구원하시는 하나님의 경륜' },
    ],
    12: [
      { startVerse: 1, endVerse: 8, title: '하나님께 드리는 합당한 예배' },
      { startVerse: 9, endVerse: 21, title: '사랑의 실천' },
    ],
    13: [
      { startVerse: 1, endVerse: 7, title: '정부에 순종하라' },
      { startVerse: 8, endVerse: 14, title: '사랑의 계명과 깨어 있는 생활' },
    ],
    14: [
      { startVerse: 1, endVerse: 12, title: '약한 자를 비판하지 말라' },
      { startVerse: 13, endVerse: 23, title: '형제를绊绊하게 하지 말라' },
    ],
    15: [
      { startVerse: 1, endVerse: 13, title: '약한 자의 평안을 도모하라' },
      { startVerse: 14, endVerse: 33, title: '바울의 사역과 여행 계획' },
    ],
    16: [
      { startVerse: 1, endVerse: 16, title: '문안 인사' },
      { startVerse: 17, endVerse: 27, title: '마지막 권고와 찬송' },
    ],
  },

  // ====== 빌립보서 ======
  '빌립보서': {
    1: [
      { startVerse: 1, endVerse: 11, title: '인사와 감사' },
      { startVerse: 12, endVerse: 26, title: '복음을 위해 사는 삶' },
      { startVerse: 27, endVerse: 30, title: '복음에 합당하게 싸우라' },
    ],
    2: [
      { startVerse: 1, endVerse: 11, title: '그리스도의 겸손과 높임' },
      { startVerse: 12, endVerse: 18, title: '두려움 없이 구원받으라' },
      { startVerse: 19, endVerse: 30, title: '디모데와 에바브로디도' },
    ],
    3: [
      { startVerse: 1, endVerse: 11, title: '율법의 의 vs 그리스도의 의' },
      { startVerse: 12, endVerse: 21, title: '앞으로 나아가 하나님을 알기' },
    ],
    4: [
      { startVerse: 1, endVerse: 7, title: '주 안에서 기뻐하라' },
      { startVerse: 8, endVerse: 13, title: '생각과 실천의 척도' },
      { startVerse: 14, endVerse: 23, title: '베풀의 결실과 인사' },
    ],
  },

  // ====== 골로새서 ======
  '골로새서': {
    1: [
      { startVerse: 1, endVerse: 14, title: '인사와 감사' },
      { startVerse: 15, endVerse: 23, title: '그리스도의 우월성' },
      { startVerse: 24, endVerse: 29, title: '바울의 사역' },
    ],
    2: [
      { startVerse: 1, endVerse: 7, title: '그리스도 안의 견고함' },
      { startVerse: 8, endVerse: 15, title: '그리스도 안의 충만' },
      { startVerse: 16, endVerse: 23, title: '그리스도 안의 자유' },
    ],
    3: [
      { startVerse: 1, endVerse: 11, title: '새 사람의 삶' },
      { startVerse: 12, endVerse: 17, title: '사랑의 공동체' },
    ],
    4: [
      { startVerse: 1, endVerse: 6, title: '기도와 전도의 생활' },
      { startVerse: 7, endVerse: 18, title: '인사와 작별' },
    ],
  },

  // ====== 갈라디아서 ======
  '갈라디아서': {
    1: [
      { startVerse: 1, endVerse: 5, title: '인사' },
      { startVerse: 6, endVerse: 10, title: '다른 복음의 정체' },
      { startVerse: 11, endVerse: 24, title: '바울의 사도직의 정당성' },
    ],
    2: [
      { startVerse: 1, endVerse: 10, title: '예루살렘 회의' },
      { startVerse: 11, endVerse: 21, title: '안디옥에서의 대면' },
    ],
    3: [
      { startVerse: 1, endVerse: 14, title: '율법의 행위 vs 믿음' },
      { startVerse: 15, endVerse: 25, title: '율법의 목적과 약속의 성취' },
      { startVerse: 26, endVerse: 29, title: '믿음으로 말미암아 아브라함의 자손' },
    ],
    4: [
      { startVerse: 1, endVerse: 11, title: '유대 율법 아래의 종 vs 하나님의 자녀' },
      { startVerse: 12, endVerse: 20, title: '바울의 갈라디아 교회 사랑' },
      { startVerse: 21, endVerse: 31, title: '종과 자유의 비유' },
    ],
    5: [
      { startVerse: 1, endVerse: 12, title: '자유를 굳건히 지키라' },
      { startVerse: 13, endVerse: 26, title: '자유 안에서의 사랑의 실천' },
    ],
    6: [
      { startVerse: 1, endVerse: 10, title: '서로를 짊어지라' },
      { startVerse: 11, endVerse: 18, title: '마지막 인사' },
    ],
  },

  // ====== 고린도전서 ======
  '고린도전서': {
    1: [
      { startVerse: 1, endVerse: 9, title: '인사와 감사' },
      { startVerse: 10, endVerse: 17, title: '교회의 분당에 대한 권면' },
      { startVerse: 18, endVerse: 31, title: '십자가의 능력과 하나님의 지혜' },
    ],
    2: [
      { startVerse: 1, endVerse: 5, title: '그리스도 안에 있는 능력' },
      { startVerse: 6, endVerse: 16, title: '성령의 가르침과 자연인의 영성' },
    ],
    3: [
      { startVerse: 1, endVerse: 9, title: '육체에 뿌리를 두지 않는 신실한 일꾼' },
      { startVerse: 10, endVerse: 23, title: '그리스도는 하나님의 성전' },
    ],
    4: [
      { startVerse: 1, endVerse: 13, title: '사도들의 직분' },
      { startVerse: 14, endVerse: 21, title: '사랑의 권면' },
    ],
    5: [
      { startVerse: 1, endVerse: 13, title: '교회 정화의 명령' },
    ],
    6: [
      { startVerse: 1, endVerse: 11, title: '형제끼리의 송사 금지' },
      { startVerse: 12, endVerse: 20, title: '몀은 성령의 전인 이유' },
    ],
    7: [
      { startVerse: 1, endVerse: 7, title: '결혼에 관한 가르침' },
      { startVerse: 8, endVerse: 16, title: '혼인하지 않은 자와 과부에게' },
      { startVerse: 17, endVerse: 24, title: '각자에게 주어진 은사에 머무라' },
      { startVerse: 25, endVerse: 40, title: '처녀에 대하여' },
    ],
    8: [
      { startVerse: 1, endVerse: 13, title: '우상의 제물에 대하여' },
    ],
    9: [
      { startVerse: 1, endVerse: 14, title: '사도의 권리' },
      { startVerse: 15, endVerse: 27, title: '복음 전파의 의무와 보상' },
    ],
    10: [
      { startVerse: 1, endVerse: 13, title: '이방인의 역사를 경계하라' },
      { startVerse: 14, endVerse: 22, title: '우상의 제사와 성찬' },
      { startVerse: 23, endVerse: 33, title: '모든 일을 하나님의 영광을 위하여' },
    ],
    11: [
      { startVerse: 1, endVerse: 16, title: '본보기와 권면' },
      { startVerse: 17, endVerse: 34, title: '주의 만찬의 제정' },
    ],
    12: [
      { startVerse: 1, endVerse: 11, title: '성령의 은사' },
      { startVerse: 12, endVerse: 31, title: '몸의 비유와 일치' },
    ],
    13: [
      { startVerse: 1, endVerse: 13, title: '사랑의 노래' },
    ],
    14: [
      { startVerse: 1, endVerse: 25, title: '예언의 은사와 방언의 은사' },
      { startVerse: 26, endVerse: 40, title: '예배 질서를 위한 규율' },
    ],
    15: [
      { startVerse: 1, endVerse: 11, title: '복음의 핵심: 그리스도의 부활' },
      { startVerse: 12, endVerse: 34, title: '부활 부재의 어리석음' },
      { startVerse: 35, endVerse: 58, title: '부활의 몸의 본질' },
    ],
    16: [
      { startVerse: 1, endVerse: 4, title: '예루살렘 성금을 모으라' },
      { startVerse: 5, endVerse: 24, title: '바울의 여행 계획과 마지막 인사' },
    ],
  },

  // ====== 고린도후서 ======
  '고린도후서': {
    1: [
      { startVerse: 1, endVerse: 11, title: '인사와 감사' },
      { startVerse: 12, endVerse: 24, title: '바울의 솔직한 마음' },
    ],
    2: [
      { startVerse: 1, endVerse: 11, title: '범죄한 자를 용서하라' },
      { startVerse: 12, endVerse: 17, title: '그리스도의 향기' },
    ],
    3: [
      { startVerse: 1, endVerse: 11, title: '새 언약의 봉사' },
      { startVerse: 12, endVerse: 18, title: '변화되어 주님과 같은 모습이 된다' },
    ],
    4: [
      { startVerse: 1, endVerse: 6, title: '복음의 빛을 비추다' },
      { startVerse: 7, endVerse: 18, title: '옥중의 보배' },
    ],
    5: [
      { startVerse: 1, endVerse: 10, title: '영원한 집에 대한 소망' },
      { startVerse: 11, endVerse: 21, title: '화목의 직분' },
    ],
    6: [
      { startVerse: 1, endVerse: 10, title: '하나님의 일꾼으로서의 고난' },
      { startVerse: 11, endVerse: 18, title: '하나님과 분리되지 말라' },
    ],
    7: [
      { startVerse: 1, endVerse: 4, title: '거룩함을 완성하라' },
      { startVerse: 5, endVerse: 16, title: '바울의 기쁨' },
    ],
    8: [
      { startVerse: 1, endVerse: 15, title: '마게도냐 교회의 귀한 은혜' },
      { startVerse: 16, endVerse: 24, title: '디도의 사역' },
    ],
    9: [
      { startVerse: 1, endVerse: 15, title: '너그러이 주는 축복' },
    ],
    10: [
      { startVerse: 1, endVerse: 11, title: '바울의 사도적 권위의 옹호' },
      { startVerse: 12, endVerse: 18, title: '주께서 권하시는 자' },
    ],
    11: [
      { startVerse: 1, endVerse: 15, title: '바울과 거짓 사도' },
      { startVerse: 16, endVerse: 33, title: '바울의 고난과 자랑' },
    ],
    12: [
      { startVerse: 1, endVerse: 10, title: '고백된 환상과 가시' },
      { startVerse: 11, endVerse: 21, title: '바울의 교회 사랑' },
    ],
    13: [
      { startVerse: 1, endVerse: 10, title: '마지막 경고' },
      { startVerse: 11, endVerse: 14, title: '인사와 축복' },
    ],
  },

  // ====== 히브리서 ======
  '히브리서': {
    1: [
      { startVerse: 1, endVerse: 4, title: '아들을 통하사 모든 것을 나타내신 하나님' },
      { startVerse: 5, endVerse: 14, title: '천사보다 뛰어나신 아들' },
    ],
    2: [
      { startVerse: 1, endVerse: 4, title: '큰 구원을 경홀히 여기지 말라' },
      { startVerse: 5, endVerse: 18, title: '인간의 형상이 되신 아들' },
    ],
    3: [
      { startVerse: 1, endVerse: 6, title: '모세보다 더 큰 분이신 그리스도' },
      { startVerse: 7, endVerse: 19, title: '안식에 들어가라' },
    ],
    4: [
      { startVerse: 1, endVerse: 13, title: '하나님의 안식에 들어가라' },
      { startVerse: 14, endVerse: 16, title: '큰 대제사장 예수' },
    ],
    5: [
      { startVerse: 1, endVerse: 10, title: '대제사장의 자격' },
      { startVerse: 11, endVerse: 14, title: '성숙한 식별의 필요' },
    ],
    6: [
      { startVerse: 1, endVerse: 12, title: '성숙으로 나아가라' },
      { startVerse: 13, endVerse: 20, title: '약속의 보증' },
    ],
    7: [
      { startVerse: 1, endVerse: 10, title: '멜기세덱의 사제직' },
      { startVerse: 11, endVerse: 28, title: '더 뛰어난 사제직의 소유자' },
    ],
    8: [
      { startVerse: 1, endVerse: 13, title: '더 뛰어난 약속의 중보자' },
    ],
    9: [
      { startVerse: 1, endVerse: 10, title: '옛 언약의 예배' },
      { startVerse: 11, endVerse: 28, title: '그리스도의 피로 성취된 속죄' },
    ],
    10: [
      { startVerse: 1, endVerse: 18, title: '그리스도의 단번의 제사' },
      { startVerse: 19, endVerse: 39, title: '하나님께 나아가는 담력' },
    ],
    11: [
      { startVerse: 1, endVerse: 7, title: '믿음의 본질' },
      { startVerse: 8, endVerse: 22, title: '족장들의 믿음' },
      { startVerse: 23, endVerse: 31, title: '모세와 이스라엘의 믿음' },
      { startVerse: 32, endVerse: 40, title: '더 큰 은혜의 약속' },
    ],
    12: [
      { startVerse: 1, endVerse: 11, title: '인내의 훈련' },
      { startVerse: 12, endVerse: 29, title: '거룩함의 격려' },
    ],
    13: [
      { startVerse: 1, endVerse: 8, title: '실천적 권면' },
      { startVerse: 9, endVerse: 19, title: '참된 예배와 정결한 생활' },
      { startVerse: 20, endVerse: 25, title: '축복과 마지막 인사' },
    ],
  },

  // ====== 야고보서 ======
  '야고보서': {
    1: [
      { startVerse: 1, endVerse: 18, title: '시련과 시험, 구원의 원천' },
      { startVerse: 19, endVerse: 27, title: '들으며 행하라' },
    ],
    2: [
      { startVerse: 1, endVerse: 13, title: '사람을 차별하지 말라' },
      { startVerse: 14, endVerse: 26, title: '행함이 없는 믿음은 죽은 것' },
    ],
    3: [
      { startVerse: 1, endVerse: 12, title: '혀를 제어하라' },
      { startVerse: 13, endVerse: 18, title: '진실한 지혜' },
    ],
    4: [
      { startVerse: 1, endVerse: 10, title: '하나님께 순종하라' },
      { startVerse: 11, endVerse: 17, title: '형제를 비방하지 말라' },
    ],
    5: [
      { startVerse: 1, endVerse: 6, title: '부자들의 망상' },
      { startVerse: 7, endVerse: 12, title: '인내와 기도' },
      { startVerse: 13, endVerse: 20, title: '병든 자의 고백과 치유 기도' },
    ],
  },

  // ====== 베드로전서 ======
  '베드로전서': {
    1: [
      { startVerse: 1, endVerse: 12, title: '인사와 구원의 축복' },
      { startVerse: 13, endVerse: 25, title: '거룩한 삶의 촉구' },
    ],
    2: [
      { startVerse: 1, endVerse: 10, title: '산 제물과 산 집' },
      { startVerse: 11, endVerse: 25, title: '하나님의 백성의 본분' },
    ],
    3: [
      { startVerse: 1, endVerse: 7, title: '아내와 남편의 의무' },
      { startVerse: 8, endVerse: 22, title: '의롭게 고난 받으신 그리스도' },
    ],
    4: [
      { startVerse: 1, endVerse: 11, title: '육체를 따라 살지 말라' },
      { startVerse: 12, endVerse: 19, title: '고난 가운데서의 기쁨' },
    ],
    5: [
      { startVerse: 1, endVerse: 5, title: '목자와 양' },
      { startVerse: 6, endVerse: 14, title: '겸손과 인내의 격려' },
    ],
  },

  // ====== 요한일서 ======
  '요한일서': {
    1: [
      { startVerse: 1, endVerse: 4, title: '생명의 말씀에 대하여' },
      { startVerse: 5, endVerse: 10, title: '빛 가운데 행하라' },
    ],
    2: [
      { startVerse: 1, endVerse: 14, title: '그리스도의 변호' },
      { startVerse: 15, endVerse: 29, title: '세상 사랑의 경고' },
    ],
    3: [
      { startVerse: 1, endVerse: 10, title: '하나님의 자녀' },
      { startVerse: 11, endVerse: 24, title: '사랑의 계명' },
    ],
    4: [
      { startVerse: 1, endVerse: 6, title: '영을 분별하라' },
      { startVerse: 7, endVerse: 21, title: '사랑은 하나님께로 말미암음' },
    ],
    5: [
      { startVerse: 1, endVerse: 12, title: '세상을 이기는 믿음' },
      { startVerse: 13, endVerse: 21, title: '영생의 확신과 결론' },
    ],
  },

  // ====== 마태복음 ======
  '마태복음': {
    1: [
      { startVerse: 1, endVerse: 17, title: '그리스도의 족보' },
      { startVerse: 18, endVerse: 25, title: '예수 그리스도의 탄생' },
    ],
    2: [
      { startVerse: 1, endVerse: 12, title: '동방 박사들의 예배' },
      { startVerse: 13, endVerse: 23, title: '이집트로 피신과 귀환' },
    ],
    3: [
      { startVerse: 1, endVerse: 12, title: '세례 요한의 사역' },
      { startVerse: 13, endVerse: 17, title: '예수의 세례' },
    ],
    4: [
      { startVerse: 1, endVerse: 11, title: '예수의 시험' },
      { startVerse: 12, endVerse: 25, title: '갈릴리에서 사역 시작' },
    ],
    5: [
      { startVerse: 1, endVerse: 12, title: '팔복' },
      { startVerse: 13, endVerse: 16, title: '소금과 빛' },
      { startVerse: 17, endVerse: 20, title: '율법과 의의 성취' },
      { startVerse: 21, endVerse: 48, title: '옛 명령의 심화' },
    ],
    6: [
      { startVerse: 1, endVerse: 18, title: '구제와 기도' },
      { startVerse: 19, endVerse: 34, title: '보화와 염려' },
    ],
    7: [
      { startVerse: 1, endVerse: 14, title: '비판과 기도' },
      { startVerse: 15, endVerse: 23, title: '거짓 선지자' },
      { startVerse: 24, endVerse: 29, title: '두 종류의 집' },
    ],
    8: [
      { startVerse: 1, endVerse: 17, title: '예수의 능력 사역' },
      { startVerse: 18, endVerse: 27, title: '제자들의 순종' },
      { startVerse: 28, endVerse: 34, title: '귀신을 쫓아내신 예수' },
    ],
    9: [
      { startVerse: 1, endVerse: 17, title: '죄인의 벗' },
      { startVerse: 18, endVerse: 38, title: '치유와 관심' },
    ],
    10: [
      { startVerse: 1, endVerse: 15, title: '열두 제자의 사명' },
      { startVerse: 16, endVerse: 42, title: '박해의 예고' },
    ],
  },

  // ====== 요한복음 ======
  '요한복음': {
    1: [
      { startVerse: 1, endVerse: 18, title: '말씀이 육신이 되시다' },
      { startVerse: 19, endVerse: 51, title: '세례 요한의 증언과 첫 제자들' },
    ],
    2: [
      { startVerse: 1, endVerse: 12, title: '가나의 혼인 잔치' },
      { startVerse: 13, endVerse: 25, title: '성전을 정결하게 하신 예수' },
    ],
    3: [
      { startVerse: 1, endVerse: 21, title: '니고데모와 재탄생' },
      { startVerse: 22, endVerse: 36, title: '세례 요한의 마지막 증언' },
    ],
    4: [
      { startVerse: 1, endVerse: 42, title: '사마리아 여인' },
      { startVerse: 43, endVerse: 54, title: '관원의 아들 치유' },
    ],
    5: [
      { startVerse: 1, endVerse: 18, title: '안식일에 병을 고치시다' },
      { startVerse: 19, endVerse: 47, title: '아들과 아버지' },
    ],
    6: [
      { startVerse: 1, endVerse: 21, title: '오천 명을 먹이시고 물 위를 걸으시다' },
      { startVerse: 22, endVerse: 71, title: '생명의 떡이신 예수' },
    ],
    7: [
      { startVerse: 1, endVerse: 13, title: '예수 형제들의 불신' },
      { startVerse: 14, endVerse: 24, title: '초막절 가운데 가르치시다' },
      { startVerse: 25, endVerse: 53, title: '예수가 메시아이심을 다시 선언' },
    ],
    8: [
      { startVerse: 1, endVerse: 11, title: '간음한 여인' },
      { startVerse: 12, endVerse: 59, title: '세상의 빛' },
    ],
    9: [
      { startVerse: 1, endVerse: 41, title: '태어날 때부터 소경된 자' },
    ],
    10: [
      { startVerse: 1, endVerse: 21, title: '선한 목자' },
      { startVerse: 22, endVerse: 42, title: '예수, 하나님과 하나이심' },
    ],
    11: [
      { startVerse: 1, endVerse: 16, title: '나사로의 병과 죽음' },
      { startVerse: 17, endVerse: 44, title: '나사로의 부활' },
      { startVerse: 45, endVerse: 57, title: '예수를 죽이기로 결의' },
    ],
    12: [
      { startVerse: 1, endVerse: 19, title: '예수의 예루살렘 입성' },
      { startVerse: 20, endVerse: 50, title: '죽음의 때가 가까우니' },
    ],
  },
}

/**
 * 특정 본문 범위에 해당하는 소제목 목록 반환
 * @param bookShort - 한국어 약어 또는 풀네임
 * @param startChap, startVerse - 시작 장/절
 * @param endChap, endVerse - 종료 장/절
 */
export function getSectionsInRange(
  bookShort: string,
  startChap: number,
  startVerse: number,
  endChap: number,
  endVerse: number,
): Array<{ chap: number; sec: BibleSection }> {
  const bookName = BOOK_NAME_MAP[bookShort] || bookShort
  const sections = BIBLE_SECTIONS[bookName]
  if (!sections) return []

  const result: Array<{ chap: number; sec: BibleSection }> = []
  for (let chap = startChap; chap <= endChap; chap++) {
    const chapSections = sections[chap]
    if (!chapSections) continue
    for (const sec of chapSections) {
      // 본문 범위 내의 소제목만
      if (chap === startChap && sec.endVerse < startVerse) continue
      if (chap === endChap && sec.startVerse > endVerse) continue
      result.push({ chap, sec })
    }
  }
  return result
}

/**
 * passage 문자열로 본문 범위의 모든 소제목 추출 (다중)
 * - verse 순서대로 정렬
 * - passage에 일부만 포함된 소제목은 제외
 * - 예: "에베소서 1:1-14" → ["인사", "그리스도 안의 영적 축복"]
 */
export function findAllSectionTitles(
  passage: string,
  bookShort: string,
): string[] {
  // 약어 → 풀네임 매핑 후 getSectionsInRange 활용
  const startMatch = passage.match(/(\d+)\s*[:장]\s*(\d+)/)
  const endMatch = passage.match(/(\d+)\s*[:장]\s*\d+\s*[-~]\s*(\d+)/)
  if (!startMatch) return []
  const startChap = parseInt(startMatch[1], 10)
  const startVerse = parseInt(startMatch[2], 10)
  let endChap = startChap
  let endVerse = startVerse
  if (endMatch) {
    // 같은 장 내 범위 (예: "1:1-14")
    if (passage.match(/^\S+\s+\d+\s*[:장]\s*\d+\s*[-~]\s*\d+$/)) {
      endChap = startChap
      endVerse = parseInt(endMatch[2], 10)
    } else {
      // 다장 범위 (예: "1:15-2:10")
      const m = passage.match(/(\d+)\s*[:장]\s*\d+\s*[-~]\s*(\d+)\s*[:장]\s*(\d+)/)
      if (m) {
        endChap = parseInt(m[2], 10)
        endVerse = parseInt(m[3], 10)
      }
    }
  }

  const sections = getSectionsInRange(bookShort, startChap, startVerse, endChap, endVerse)
  if (sections.length === 0) return []

  // verse 순서대로 정렬
  sections.sort((a, b) => {
    if (a.chap !== b.chap) return a.chap - b.chap
    return a.sec.startVerse - b.sec.startVerse
  })

  // 중복 제거 (title 기준)
  const seen = new Set<string>()
  const result: string[] = []
  for (const { sec } of sections) {
    if (!seen.has(sec.title)) {
      seen.add(sec.title)
      result.push(sec.title)
    }
  }
  return result
}

/**
 * 특정 본문 범위의 소제목을 마크다운 텍스트로 포맷 (AI 프롬프트 주입용)
 */
export function formatSectionsForPrompt(
  bookShort: string,
  startChap: number,
  startVerse: number,
  endChap: number,
  endVerse: number,
): string {
  const sections = getSectionsInRange(bookShort, startChap, startVerse, endChap, endVerse)
  if (sections.length === 0) return ''

  // 장별로 그룹화
  const grouped: Record<number, BibleSection[]> = {}
  for (const { chap, sec } of sections) {
    if (!grouped[chap]) grouped[chap] = []
    grouped[chap].push(sec)
  }

  // 풀네임으로 통일 (약어 → 풀네임 매핑)
  const displayBook = BOOK_NAME_MAP[bookShort] || bookShort
  const lines: string[] = []
  for (const chap of Object.keys(grouped).map(Number).sort((a, b) => a - b)) {
    lines.push(`${displayBook} ${chap}장:`)
    for (const sec of grouped[chap]) {
      const total = sec.endVerse - sec.startVerse + 1
      const range = sec.startVerse === sec.endVerse
        ? `${chap}:${sec.startVerse}절 (1절)`
        : `${chap}:${sec.startVerse}-${sec.endVerse}절 (${total}절)`
      lines.push(`- ${range}: ${sec.title}`)
    }
    lines.push('')
  }
  return lines.join('\n').trim()
}
