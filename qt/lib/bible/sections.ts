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
  '출애굽기': '출애굽기', '출': '출애굽기',
  '레위기': '레위기', '레': '레위기',
  '민수기': '민수기', '민': '민수기',
  '신명기': '신명기', '신': '신명기',
  '여호수아': '여호수아', '수': '여호수아',
  '사사기': '사사기', '삿': '사사기',
  '룻기': '룻기', '룻': '룻기',
  '사무엘상': '사무엘상', '삼상': '사무엘상', '삼상하': '사무엘상',
  '사무엘하': '사무엘하', '삼하': '사무엘하',
  '열왕기상': '열왕기상', '왕상': '열왕기상',
  '열왕기하': '열왕기하', '왕하': '열왕기하',
  '역대상': '역대상', '대상': '역대상',
  '역대하': '역대하', '대하': '역대하',
  '에스라': '에스라', '스': '에스라',
  '느헤미야': '느헤미야', '느': '느헤미야',
  '에스더': '에스더', '에': '에스더',
  '욥기': '욥기', '욥': '욥기',
  '시편': '시편', '시': '시편',
  '잠언': '잠언', '잠': '잠언',
  '전도서': '전도서', '전': '전도서',
  '아가': '아가', '아': '아가',
  '이사야': '이사야', '사': '이사야',
  '예레미야': '예레미야', '렘': '예레미야',
  '예레미야애가': '예레미야애가', '애': '예레미야애가', '렘애': '예레미야애가',
  '에스겔': '에스겔', '겔': '에스겔',
  '다니엘': '다니엘', '단': '다니엘',
  '호세아': '호세아', '호': '호세아',
  '요엘': '요엘', '욜': '요엘',
  '아모스': '아모스', '암': '아모스',
  '오바댜': '오바댜', '옵': '오바댜',
  '요나': '요나', '욘': '요나',
  '미가': '미가', '미': '미가',
  '나훔': '나훔', '나': '나훔',
  '하박국': '하박국', '합': '하박국',
  '스바냐': '스바냐', '습': '스바냐',
  '학개': '학개', '학': '학개',
  '스가랴': '스가랴', '스': '스가랴',
  '말라기': '말라기', '말': '말라기',
  '마태복음': '마태복음', '마': '마태복음',
  '마가복음': '마가복음', '막': '마가복음',
  '누가복음': '누가복음', '눅': '누가복음',
  '요한복음': '요한복음', '요': '요한복음',
  '사도행전': '사도행전', '행': '사도행전',
  '로마서': '로마서', '롬': '로마서',
  '고린도전서': '고린도전서', '고전': '고린도전서',
  '고린도후서': '고린도후서', '고후': '고린도후서',
  '갈라디아서': '갈라디아서', '갈': '갈라디아서',
  '에베소서': '에베소서', '엡': '에베소서',
  '빌립보서': '빌립보서', '빌': '빌립보서',
  '골로새서': '골로새서', '골': '골로새서',
  '데살로니가전서': '데살로니가전서', '살전': '데살로니가전서',
  '데살로니가후서': '데살로니가후서', '살후': '데살로니가후서',
  '디모데전서': '디모데전서', '딤전': '디모데전서',
  '디모데후서': '디모데후서', '딤후': '디모데후서',
  '디도서': '디도서', '딛': '디도서',
  '빌레몬서': '빌레몬서', '몬': '빌레몬서', '음': '빌레몬서',
  '히브리서': '히브리서', '히': '히브리서',
  '야고보서': '야고보서', '약': '야고보서',
  '베드로전서': '베드로전서', '벧전': '베드로전서',
  '베드로후서': '베드로후서', '벧후': '베드로후서',
  '요한일서': '요한일서', '요일': '요한일서',
  '요한이서': '요한이서', '요이': '요한이서',
  '요한삼서': '요한삼서', '요삼': '요한삼서',
  '유다서': '유다서', '유': '유다서',
  '요한계시록': '요한계시록', '계': '요한계시록', '계시': '요한계시록', '묵시': '요한계시록', '묵시록': '요한계시록',
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

  // ====== 출애굽기 ======
  '출애굽기': {
    1: [
      { startVerse: 1, endVerse: 7, title: '이스라엘의 애굽 번영' },
      { startVerse: 8, endVerse: 14, title: '새 왕의 핍박' },
      { startVerse: 15, endVerse: 22, title: '모세의 출생과 구원' },
    ],
    2: [
      { startVerse: 1, endVerse: 10, title: '모세의 교육과 도망' },
      { startVerse: 11, endVerse: 25, title: '미디안에서 모세의 생활' },
    ],
    3: [
      { startVerse: 1, endVerse: 12, title: '떨불의 모세' },
      { startVerse: 13, endVerse: 22, title: '하나님의 모세 부르심' },
    ],
    4: [
      { startVerse: 1, endVerse: 17, title: '모세의 말솜씨와 하나님의 응답' },
      { startVerse: 18, endVerse: 31, title: '모세와 아론의 임명' },
    ],
    5: [
      { startVerse: 1, endVerse: 14, title: '바로의 거부' },
      { startVerse: 15, endVerse: 23, title: '이스라엘의 박해 강화' },
    ],
    6: [
      { startVerse: 1, endVerse: 13, title: '하나님의 약속과 이스라엘의 불평' },
      { startVerse: 14, endVerse: 27, title: '족보' },
      { startVerse: 28, endVerse: 30, title: '아론의 직분' },
    ],
    7: [
      { startVerse: 1, endVerse: 13, title: '모세의 기이한 막대기' },
      { startVerse: 14, endVerse: 25, title: '장로들과 함께 바로 앞에' },
    ],
    8: [
      { startVerse: 1, endVerse: 28, title: '첫째 재앙: 물이 피로' },
      { startVerse: 29, endVerse: 32, title: '두째 재앙: 개구리' },
    ],
    9: [
      { startVerse: 1, endVerse: 12, title: '셋째 재앙: 모기' },
      { startVerse: 13, endVerse: 35, title: '넷째 재앙: 파리' },
    ],
    10: [
      { startVerse: 1, endVerse: 20, title: '다섯째 재앙: 가축의 죽음' },
      { startVerse: 21, endVerse: 29, title: '여섯째 재앙: 종기' },
    ],
    11: [
      { startVerse: 1, endVerse: 10, title: '일곱째 재앙: 우박' },
    ],
    12: [
      { startVerse: 1, endVerse: 36, title: '마지막 재앙: 장자 죽음, 유월절' },
    ],
    13: [
      { startVerse: 1, endVerse: 16, title: '유월절 규례' },
      { startVerse: 17, endVerse: 22, title: '출발 준비' },
    ],
    14: [
      { startVerse: 1, endVerse: 31, title: '홍해의 기적' },
    ],
    15: [
      { startVerse: 1, endVerse: 21, title: '모세와 미리암의 노래' },
      { startVerse: 22, endVerse: 27, title: '마라의 쓴 물과 엘림의 샘' },
    ],
    16: [
      { startVerse: 1, endVerse: 36, title: '만나와 메추라기' },
    ],
    17: [
      { startVerse: 1, endVerse: 7, title: '르비딤의 물' },
      { startVerse: 8, endVerse: 16, title: '아말렉과의 전쟁' },
    ],
    18: [
      { startVerse: 1, endVerse: 27, title: '모세와 이드로' },
    ],
    19: [
      { startVerse: 1, endVerse: 25, title: '시내 산에서' },
    ],
    20: [
      { startVerse: 1, endVerse: 21, title: '십계명' },
      { startVerse: 22, endVerse: 26, title: '제단 규례' },
    ],
    21: [
      { startVerse: 1, endVerse: 36, title: '종에 관한 법' },
    ],
    22: [
      { startVerse: 1, endVerse: 17, title: '도둑에 관한 법' },
      { startVerse: 18, endVerse: 31, title: '각종 법규' },
    ],
    23: [
      { startVerse: 1, endVerse: 19, title: '공정과 안식의 법' },
      { startVerse: 20, endVerse: 33, title: '축제의 법' },
    ],
    24: [
      { startVerse: 1, endVerse: 18, title: '모세의 40일 재회' },
    ],
    25: [
      { startVerse: 1, endVerse: 40, title: '성막 건축 명령' },
    ],
    26: [
      { startVerse: 1, endVerse: 37, title: '성막의 휘장과 문' },
    ],
    27: [
      { startVerse: 1, endVerse: 21, title: '제단' },
    ],
    28: [
      { startVerse: 1, endVerse: 43, title: '제사장들의 제복' },
    ],
    29: [
      { startVerse: 1, endVerse: 46, title: '봉헌식' },
    ],
    30: [
      { startVerse: 1, endVerse: 38, title: '향단과 회막의 조공' },
    ],
    31: [
      { startVerse: 1, endVerse: 18, title: '안식일 규례' },
      { startVerse: 19, endVerse: 35, title: '법판' },
    ],
    32: [
      { startVerse: 1, endVerse: 35, title: '금송아지' },
    ],
    33: [
      { startVerse: 1, endVerse: 23, title: '모세의 재회' },
    ],
    34: [
      { startVerse: 1, endVerse: 35, title: '율법의 재선포' },
    ],
    35: [
      { startVerse: 1, endVerse: 35, title: '안식일과 성막 봉헌' },
    ],
    36: [
      { startVerse: 1, endVerse: 38, title: '성막 완성' },
    ],
    37: [
      { startVerse: 1, endVerse: 29, title: '법궤' },
    ],
    38: [
      { startVerse: 1, endVerse: 31, title: '제단' },
    ],
    39: [
      { startVerse: 1, endVerse: 43, title: '제사장 의복 완성' },
    ],
    40: [
      { startVerse: 1, endVerse: 38, title: '성막 봉헌' },
    ],
  },

  // ====== 레위기 ======
  '레위기': {
    1: [
      { startVerse: 1, endVerse: 17, title: '번제' },
    ],
    2: [
      { startVerse: 1, endVerse: 16, title: '소제' },
    ],
    3: [
      { startVerse: 1, endVerse: 17, title: '화목제' },
    ],
    4: [
      { startVerse: 1, endVerse: 35, title: '속죄제' },
    ],
    5: [
      { startVerse: 1, endVerse: 19, title: '속건제' },
    ],
    6: [
      { startVerse: 1, endVerse: 30, title: '제사장에게 준 권면' },
    ],
    7: [
      { startVerse: 1, endVerse: 38, title: '속죄제의 법' },
    ],
    8: [
      { startVerse: 1, endVerse: 36, title: '아론의 제사장 임직' },
    ],
    9: [
      { startVerse: 1, endVerse: 24, title: '제사장들의 첫 봉헌' },
    ],
    10: [
      { startVerse: 1, endVerse: 20, title: '나답과 아비후의 죽음' },
    ],
    11: [
      { startVerse: 1, endVerse: 47, title: '정결한 것과 부정한 것' },
    ],
    12: [
      { startVerse: 1, endVerse: 8, title: '산모의 정결례' },
    ],
    13: [
      { startVerse: 1, endVerse: 59, title: '나병 규례' },
    ],
    14: [
      { startVerse: 1, endVerse: 57, title: '나병 환자의 정결례' },
    ],
    15: [
      { startVerse: 1, endVerse: 33, title: '유출의 정결례' },
    ],
    16: [
      { startVerse: 1, endVerse: 34, title: '속죄일' },
    ],
    17: [
      { startVerse: 1, endVerse: 16, title: '제물의 피' },
    ],
    18: [
      { startVerse: 1, endVerse: 30, title: '성적 윤리에 관한 법' },
    ],
    19: [
      { startVerse: 1, endVerse: 37, title: '거룩함의 계명' },
    ],
    20: [
      { startVerse: 1, endVerse: 27, title: '형벌 규정' },
    ],
    21: [
      { startVerse: 1, endVerse: 24, title: '제사장의 거룩함' },
    ],
    22: [
      { startVerse: 1, endVerse: 33, title: '거룩한 제물' },
    ],
    23: [
      { startVerse: 1, endVerse: 44, title: '절기와 절기의 의미' },
    ],
    24: [
      { startVerse: 1, endVerse: 23, title: '등불과 진설병' },
    ],
    25: [
      { startVerse: 1, endVerse: 55, title: '안식년과 희년' },
    ],
    26: [
      { startVerse: 1, endVerse: 46, title: '순종과 불순종의 결과' },
    ],
    27: [
      { startVerse: 1, endVerse: 34, title: '서원과 귀속물의 법' },
    ],
  },

  // ====== 민수기 ======
  '민수기': {
    1: [
      { startVerse: 1, endVerse: 54, title: '첫째 인구조사' },
    ],
    2: [
      { startVerse: 1, endVerse: 34, title: '진영의 배치' },
    ],
    3: [
      { startVerse: 1, endVerse: 51, title: '레위인의 인구와 직분' },
    ],
    4: [
      { startVerse: 1, endVerse: 49, title: '고바의 직무' },
    ],
    5: [
      { startVerse: 1, endVerse: 31, title: '부정하게 한 자의 정결' },
    ],
    6: [
      { startVerse: 1, endVerse: 27, title: '나실인의 법' },
    ],
    7: [
      { startVerse: 1, endVerse: 89, title: '제물의 봉헌' },
    ],
    8: [
      { startVerse: 1, endVerse: 26, title: '등잔의 조명' },
    ],
    9: [
      { startVerse: 1, endVerse: 23, title: '유월절과 구름의 인도' },
    ],
    10: [
      { startVerse: 1, endVerse: 36, title: '나팔과 출발' },
    ],
    11: [
      { startVerse: 1, endVerse: 35, title: '탐욕과 하나님의 진노' },
    ],
    12: [
      { startVerse: 1, endVerse: 16, title: '미리암의 나병' },
    ],
    13: [
      { startVerse: 1, endVerse: 33, title: '정탐꾼들' },
    ],
    14: [
      { startVerse: 1, endVerse: 45, title: '반역과 40년 유랑' },
    ],
    15: [
      { startVerse: 1, endVerse: 41, title: '법규' },
    ],
    16: [
      { startVerse: 1, endVerse: 50, title: '고라의 반역' },
    ],
    17: [
      { startVerse: 1, endVerse: 13, title: '아론의 싹 난 지팡이' },
    ],
    18: [
      { startVerse: 1, endVerse: 32, title: '제사장과 레위인의 직무' },
    ],
    19: [
      { startVerse: 1, endVerse: 22, title: '붉은 소의 재' },
    ],
    20: [
      { startVerse: 1, endVerse: 13, title: '물 사건' },
      { startVerse: 14, endVerse: 29, title: '에돔의 거절과 아론의 죽음' },
    ],
    21: [
      { startVerse: 1, endVerse: 35, title: '구리 뱀과 모압 전투' },
    ],
    22: [
      { startVerse: 1, endVerse: 41, title: '발락과 발람' },
    ],
    23: [
      { startVerse: 1, endVerse: 30, title: '발람의 축복' },
    ],
    24: [
      { startVerse: 1, endVerse: 25, title: '발람의 마지막 예언' },
    ],
    25: [
      { startVerse: 1, endVerse: 18, title: '브올의 사건' },
    ],
    26: [
      { startVerse: 1, endVerse: 65, title: '두 번째 인구조사' },
    ],
    27: [
      { startVerse: 1, endVerse: 23, title: '여호수아의 임명' },
    ],
    28: [
      { startVerse: 1, endVerse: 31, title: '정기 제물의 규례' },
    ],
    29: [
      { startVerse: 1, endVerse: 40, title: '절기의 정기 제물' },
    ],
    30: [
      { startVerse: 1, endVerse: 16, title: '서원의 규례' },
    ],
    31: [
      { startVerse: 1, endVerse: 54, title: '미디안과의 전쟁' },
    ],
    32: [
      { startVerse: 1, endVerse: 42, title: '요단河东 지파의 정착' },
    ],
    33: [
      { startVerse: 1, endVerse: 56, title: '출애굽 후의 여정' },
    ],
    34: [
      { startVerse: 1, endVerse: 29, title: '가나안 땅의 경계' },
    ],
    35: [
      { startVerse: 1, endVerse: 34, title: '성읍과 도피성' },
    ],
    36: [
      { startVerse: 1, endVerse: 13, title: '여인의 산업 법' },
    ],
  },

  // ====== 신명기 ======
  '신명기': {
    1: [
      { startVerse: 1, endVerse: 18, title: '율법의 설교' },
      { startVerse: 19, endVerse: 46, title: '호렙에서 가나안 입구까지' },
    ],
    2: [
      { startVerse: 1, endVerse: 25, title: '세일 산지를 지나며' },
      { startVerse: 26, endVerse: 37, title: '모압 영토를 지나며' },
    ],
    3: [
      { startVerse: 1, endVerse: 22, title: '바산 왕의 정벌' },
      { startVerse: 23, endVerse: 29, title: '요단 동편의 분배' },
    ],
    4: [
      { startVerse: 1, endVerse: 40, title: '율법의 권면' },
      { startVerse: 41, endVerse: 43, title: '도피성' },
    ],
    5: [
      { startVerse: 1, endVerse: 33, title: '십계명' },
    ],
    6: [
      { startVerse: 1, endVerse: 25, title: '가장 큰 계명' },
    ],
    7: [
      { startVerse: 1, endVerse: 26, title: '거룩한 백성' },
    ],
    8: [
      { startVerse: 1, endVerse: 20, title: '만민 가운데 행하신 일' },
    ],
    9: [
      { startVerse: 1, endVerse: 29, title: '금송아지 사건' },
    ],
    10: [
      { startVerse: 1, endVerse: 11, title: '새 법판' },
      { startVerse: 12, endVerse: 22, title: '하나님을 경외하라' },
    ],
    11: [
      { startVerse: 1, endVerse: 32, title: '가나안 땅의 풍성함' },
    ],
    12: [
      { startVerse: 1, endVerse: 32, title: '하나님께 제사할 곳' },
    ],
    13: [
      { startVerse: 1, endVerse: 18, title: '거짓 선지자' },
    ],
    14: [
      { startVerse: 1, endVerse: 29, title: '정결한 음식과 십일조' },
    ],
    15: [
      { startVerse: 1, endVerse: 23, title: '안식년과 종의 해방' },
    ],
    16: [
      { startVerse: 1, endVerse: 22, title: '절기와 재판관' },
    ],
    17: [
      { startVerse: 1, endVerse: 20, title: '법의 규례' },
    ],
    18: [
      { startVerse: 1, endVerse: 22, title: '제사장과 예언자' },
    ],
    19: [
      { startVerse: 1, endVerse: 21, title: '도피성과 증거' },
    ],
    20: [
      { startVerse: 1, endVerse: 20, title: '전쟁의 법' },
    ],
    21: [
      { startVerse: 1, endVerse: 23, title: '각종 법규' },
    ],
    22: [
      { startVerse: 1, endVerse: 30, title: '도덕적 법규' },
    ],
    23: [
      { startVerse: 1, endVerse: 25, title: '백성의 의무' },
    ],
    24: [
      { startVerse: 1, endVerse: 22, title: '각종 법규' },
    ],
    25: [
      { startVerse: 1, endVerse: 19, title: '각종 법규' },
    ],
    26: [
      { startVerse: 1, endVerse: 19, title: '첫 열매와 십일조' },
    ],
    27: [
      { startVerse: 1, endVerse: 26, title: '기념비와 저주' },
    ],
    28: [
      { startVerse: 1, endVerse: 68, title: '순종과 불순종의 결과' },
    ],
    29: [
      { startVerse: 1, endVerse: 29, title: '새 언약의 재확인' },
    ],
    30: [
      { startVerse: 1, endVerse: 20, title: '회복의 약속' },
    ],
    31: [
      { startVerse: 1, endVerse: 30, title: '여호수아의 임명' },
    ],
    32: [
      { startVerse: 1, endVerse: 52, title: '모세의 노래' },
    ],
    33: [
      { startVerse: 1, endVerse: 29, title: '모세의 축복' },
    ],
    34: [
      { startVerse: 1, endVerse: 12, title: '모세의 죽음' },
    ],
  },

  // ====== 여호수아 ======
  '여호수아': {
    1: [
      { startVerse: 1, endVerse: 18, title: '하나님의 명령과 약속' },
    ],
    2: [
      { startVerse: 1, endVerse: 24, title: '여리고의 정탐꾼' },
    ],
    3: [
      { startVerse: 1, endVerse: 17, title: '요단강 도하' },
    ],
    4: [
      { startVerse: 1, endVerse: 24, title: '기념 돌' },
    ],
    5: [
      { startVerse: 1, endVerse: 12, title: '할례의 재행' },
      { startVerse: 13, endVerse: 15, title: '여호수아의 발치' },
    ],
    6: [
      { startVerse: 1, endVerse: 27, title: '여리고 함락' },
    ],
    7: [
      { startVerse: 1, endVerse: 26, title: '아간의 죄와 아이 함락' },
    ],
    8: [
      { startVerse: 1, endVerse: 35, title: '아이의 점령' },
    ],
    9: [
      { startVerse: 1, endVerse: 27, title: '기브온인의 계략' },
    ],
    10: [
      { startVerse: 1, endVerse: 43, title: '남쪽 정벌' },
    ],
    11: [
      { startVerse: 1, endVerse: 23, title: '북쪽 정벌' },
    ],
    12: [
      { startVerse: 1, endVerse: 24, title: '정복한 왕들의 목록' },
    ],
    13: [
      { startVerse: 1, endVerse: 33, title: '나머지 땅의 분배' },
    ],
    14: [
      { startVerse: 1, endVerse: 15, title: '갈렙의 유산' },
    ],
    15: [
      { startVerse: 1, endVerse: 63, title: '유다의 분배' },
    ],
    16: [
      { startVerse: 1, endVerse: 10, title: '요셉의 분배' },
    ],
    17: [
      { startVerse: 1, endVerse: 18, title: '요셉의 유산' },
    ],
    18: [
      { startVerse: 1, endVerse: 28, title: '실로와 나머지 땅' },
    ],
    19: [
      { startVerse: 1, endVerse: 51, title: '남아 있는 지파의 분배' },
    ],
    20: [
      { startVerse: 1, endVerse: 9, title: '도피성' },
    ],
    21: [
      { startVerse: 1, endVerse: 45, title: '레위 사람의 성읍' },
    ],
    22: [
      { startVerse: 1, endVerse: 34, title: '요단 동편 지파의 귀환' },
    ],
    23: [
      { startVerse: 1, endVerse: 16, title: '여호수아의 마지막 말씀' },
    ],
    24: [
      { startVerse: 1, endVerse: 33, title: '세겜에서의 언약' },
    ],
  },

  // ====== 사사기 ======
  '사사기': {
    1: [
      { startVerse: 1, endVerse: 36, title: '남방 부족의 정복' },
    ],
    2: [
      { startVerse: 1, endVerse: 23, title: '이스라엘의 배신' },
    ],
    3: [
      { startVerse: 1, endVerse: 31, title: '여러 사사들의 활동' },
    ],
    4: [
      { startVerse: 1, endVerse: 24, title: '드보라와 바락' },
    ],
    5: [
      { startVerse: 1, endVerse: 31, title: '드보라의 노래' },
    ],
    6: [
      { startVerse: 1, endVerse: 40, title: '기드온' },
    ],
    7: [
      { startVerse: 1, endVerse: 25, title: '기드온의 300명' },
    ],
    8: [
      { startVerse: 1, endVerse: 35, title: '기드온의 종말' },
    ],
    9: [
      { startVerse: 1, endVerse: 57, title: '아비멜렉' },
    ],
    10: [
      { startVerse: 1, endVerse: 18, title: '입다와 블레셋' },
    ],
    11: [
      { startVerse: 1, endVerse: 40, title: '옷의 딸 입다' },
    ],
    12: [
      { startVerse: 1, endVerse: 15, title: '입다와 블레셋' },
    ],
    13: [
      { startVerse: 1, endVerse: 25, title: '삼손의 탄생' },
    ],
    14: [
      { startVerse: 1, endVerse: 20, title: '삼손의 결혼' },
    ],
    15: [
      { startVerse: 1, endVerse: 20, title: '삼손의 복수' },
    ],
    16: [
      { startVerse: 1, endVerse: 31, title: '삼손의 멸망과 죽음' },
    ],
    17: [
      { startVerse: 1, endVerse: 13, title: '미가의 신상과 레위인' },
    ],
    18: [
      { startVerse: 1, endVerse: 31, title: '단 지파의 이주' },
    ],
    19: [
      { startVerse: 1, endVerse: 30, title: '레위인의 비참한 여정' },
    ],
    20: [
      { startVerse: 1, endVerse: 48, title: '베냐민의 전쟁' },
    ],
    21: [
      { startVerse: 1, endVerse: 25, title: '베냐민 지파의 회복' },
    ],
  },

  // ====== 룻기 ======
  '룻기': {
    1: [
      { startVerse: 1, endVerse: 22, title: '나오미와 룻의 귀환' },
    ],
    2: [
      { startVerse: 1, endVerse: 23, title: '보스가의 밭' },
    ],
    3: [
      { startVerse: 1, endVerse: 18, title: '타작 마당의 밤' },
    ],
    4: [
      { startVerse: 1, endVerse: 22, title: '보스의 결혼과 다윗의 족보' },
    ],
  },

  // ====== 사무엘상 ======
  '사무엘상': {
    1: [
      { startVerse: 1, endVerse: 18, title: '사무엘의 탄생' },
      { startVerse: 19, endVerse: 28, title: '하나님께 드려진 사무엘' },
    ],
    2: [
      { startVerse: 1, endVerse: 26, title: '하나님의 기뻐하시는 자' },
      { startVerse: 27, endVerse: 36, title: '엘리의 집에 내린 심판' },
    ],
    3: [
      { startVerse: 1, endVerse: 21, title: '하나님의 부르심' },
    ],
    4: [
      { startVerse: 1, endVerse: 22, title: '법궤의 포로' },
    ],
    5: [
      { startVerse: 1, endVerse: 12, title: '블레셋 땅의 고통' },
    ],
    6: [
      { startVerse: 1, endVerse: 21, title: '법궤의 귀환' },
    ],
    7: [
      { startVerse: 1, endVerse: 17, title: '벧셀에서의 승리' },
    ],
    8: [
      { startVerse: 1, endVerse: 22, title: '왕의 요구' },
    ],
    9: [
      { startVerse: 1, endVerse: 27, title: '사울의 임명' },
    ],
    10: [
      { startVerse: 1, endVerse: 27, title: '사울의 기름부음' },
    ],
    11: [
      { startVerse: 1, endVerse: 15, title: '암몬의 위협과 사울의 승리' },
    ],
    12: [
      { startVerse: 1, endVerse: 25, title: '사무엘의 마지막 설교' },
    ],
    13: [
      { startVerse: 1, endVerse: 23, title: '사울의 불순종' },
    ],
    14: [
      { startVerse: 1, endVerse: 52, title: '요나단의 영웅적 행동' },
    ],
    15: [
      { startVerse: 1, endVerse: 35, title: '사울의 완전한 배신' },
    ],
    16: [
      { startVerse: 1, endVerse: 23, title: '다윗의 기름부음' },
    ],
    17: [
      { startVerse: 1, endVerse: 58, title: '다윗과 골리앗' },
    ],
    18: [
      { startVerse: 1, endVerse: 30, title: '요나단과 다윗의 우정' },
    ],
    19: [
      { startVerse: 1, endVerse: 24, title: '사울의 다윗 살해 미수' },
    ],
    20: [
      { startVerse: 1, endVerse: 42, title: '다윗과 요나단의 이별' },
    ],
    21: [
      { startVerse: 1, endVerse: 15, title: '다윗의 도피' },
    ],
    22: [
      { startVerse: 1, endVerse: 23, title: '다윗과 그 무리' },
    ],
    23: [
      { startVerse: 1, endVerse: 29, title: '다윗의 도피 계속' },
    ],
    24: [
      { startVerse: 1, endVerse: 22, title: '다윗이 사울을 살려주다' },
    ],
    25: [
      { startVerse: 1, endVerse: 44, title: '나발과 아비가일' },
    ],
    26: [
      { startVerse: 1, endVerse: 25, title: '다윗이 사울의 창을 가져오다' },
    ],
    27: [
      { startVerse: 1, endVerse: 12, title: '다윗의 블레셋 도피' },
    ],
    28: [
      { startVerse: 1, endVerse: 25, title: '사울의 마지막' },
    ],
    29: [
      { startVerse: 1, endVerse: 11, title: '블레셋이 다윗을 보내다' },
    ],
    30: [
      { startVerse: 1, endVerse: 31, title: '여그렐의 멸망' },
    ],
    31: [
      { startVerse: 1, endVerse: 13, title: '사울의 죽음' },
    ],
  },

  // ====== 사무엘하 ======
  '사무엘하': {
    1: [
      { startVerse: 1, endVerse: 27, title: '사울의 죽음' },
    ],
    2: [
      { startVerse: 1, endVerse: 32, title: '다윗의 유다 왕' },
    ],
    3: [
      { startVerse: 1, endVerse: 39, title: '다윗의 권좌 강화' },
    ],
    4: [
      { startVerse: 1, endVerse: 12, title: '이스보셋의 죽음' },
    ],
    5: [
      { startVerse: 1, endVerse: 25, title: '예루살렘의 점령' },
    ],
    6: [
      { startVerse: 1, endVerse: 23, title: '법궤의 예루살렘 입성' },
    ],
    7: [
      { startVerse: 1, endVerse: 29, title: '다윗의 언약' },
    ],
    8: [
      { startVerse: 1, endVerse: 18, title: '다윗의 승리' },
    ],
    9: [
      { startVerse: 1, endVerse: 13, title: '다윗과 므비보셋' },
    ],
    10: [
      { startVerse: 1, endVerse: 19, title: '암몬과 아람의 전쟁' },
    ],
    11: [
      { startVerse: 1, endVerse: 27, title: '다윗과 밧세바' },
    ],
    12: [
      { startVerse: 1, endVerse: 31, title: '나단의 꾸짖음' },
    ],
    13: [
      { startVerse: 1, endVerse: 39, title: '암논과 다말' },
    ],
    14: [
      { startVerse: 1, endVerse: 33, title: '압살롬의 귀환' },
    ],
    15: [
      { startVerse: 1, endVerse: 37, title: '압살롬의 반역' },
    ],
    16: [
      { startVerse: 1, endVerse: 23, title: '다윗의 곤경' },
    ],
    17: [
      { startVerse: 1, endVerse: 29, title: '압살롬의 실패' },
    ],
    18: [
      { startVerse: 1, endVerse: 33, title: '압살롬의 죽음' },
    ],
    19: [
      { startVerse: 1, endVerse: 43, title: '다윗의 귀환' },
    ],
    20: [
      { startVerse: 1, endVerse: 26, title: '세바의 반역' },
    ],
    21: [
      { startVerse: 1, endVerse: 22, title: '기근과 전쟁' },
    ],
    22: [
      { startVerse: 1, endVerse: 51, title: '다윗의 감사와 찬송' },
    ],
    23: [
      { startVerse: 1, endVerse: 39, title: '다윗의 마지막 말씀' },
    ],
    24: [
      { startVerse: 1, endVerse: 25, title: '다윗의 인구조사' },
    ],
  },

  // ====== 열왕기상 ======
  '열왕기상': {
    1: [
      { startVerse: 1, endVerse: 53, title: '솔로몬의 즉위' },
    ],
    2: [
      { startVerse: 1, endVerse: 46, title: '다윗의 마지막 명령' },
    ],
    3: [
      { startVerse: 1, endVerse: 28, title: '솔로몬의 꿈과 지혜' },
    ],
    4: [
      { startVerse: 1, endVerse: 34, title: '솔로몬의 권세와 지혜' },
    ],
    5: [
      { startVerse: 1, endVerse: 18, title: '성전 건축 준비' },
    ],
    6: [
      { startVerse: 1, endVerse: 38, title: '성전 건축' },
    ],
    7: [
      { startVerse: 1, endVerse: 51, title: '성전의 기구들' },
    ],
    8: [
      { startVerse: 1, endVerse: 66, title: '성전 봉헌' },
    ],
    9: [
      { startVerse: 1, endVerse: 28, title: '하나님의 응답' },
    ],
    10: [
      { startVerse: 1, endVerse: 29, title: '솔로몬의 영광' },
    ],
    11: [
      { startVerse: 1, endVerse: 43, title: '솔로몬의 타락' },
    ],
    12: [
      { startVerse: 1, endVerse: 33, title: '왕국의 분열' },
    ],
    13: [
      { startVerse: 1, endVerse: 34, title: '예언자의 불순종' },
    ],
    14: [
      { startVerse: 1, endVerse: 31, title: '여로보암의 죽음' },
    ],
    15: [
      { startVerse: 1, endVerse: 34, title: '유다와 이스라엘의 왕들' },
    ],
    16: [
      { startVerse: 1, endVerse: 34, title: '이스라엘의 여러 왕' },
    ],
    17: [
      { startVerse: 1, endVerse: 24, title: '엘리야의 사역 시작' },
    ],
    18: [
      { startVerse: 1, endVerse: 46, title: '갈멜 산의 대회' },
    ],
    19: [
      { startVerse: 1, endVerse: 21, title: '엘리야의 도피와 부르심' },
    ],
    20: [
      { startVerse: 1, endVerse: 43, title: '아합과 시리아의 전쟁' },
    ],
    21: [
      { startVerse: 1, endVerse: 29, title: '아합의 나봇의 포도원' },
    ],
    22: [
      { startVerse: 1, endVerse: 53, title: '아합의 최후' },
    ],
  },

  // ====== 열왕기하 ======
  '열왕기하': {
    1: [
      { startVerse: 1, endVerse: 18, title: '아하시야와 엘리야' },
    ],
    2: [
      { startVerse: 1, endVerse: 25, title: '엘리야의 승천과 엘리사' },
    ],
    3: [
      { startVerse: 1, endVerse: 27, title: '모압의 반역' },
    ],
    4: [
      { startVerse: 1, endVerse: 44, title: '엘리사의 기적' },
    ],
    5: [
      { startVerse: 1, endVerse: 27, title: '나아만의 나병 치유' },
    ],
    6: [
      { startVerse: 1, endVerse: 33, title: '엘리사의 기적들' },
    ],
    7: [
      { startVerse: 1, endVerse: 20, title: '기근의 끝' },
    ],
    8: [
      { startVerse: 1, endVerse: 29, title: '엘리사와 수리아의 내란' },
    ],
    9: [
      { startVerse: 1, endVerse: 37, title: '예후의 왕 즉위' },
    ],
    10: [
      { startVerse: 1, endVerse: 36, title: '바알 섬멸' },
    ],
    11: [
      { startVerse: 1, endVerse: 21, title: '아요사와 여호사벳' },
    ],
    12: [
      { startVerse: 1, endVerse: 21, title: '여호아스의 통치' },
    ],
    13: [
      { startVerse: 1, endVerse: 25, title: '엘리사의 죽음' },
    ],
    14: [
      { startVerse: 1, endVerse: 29, title: '여호아스와 여로보암' },
    ],
    15: [
      { startVerse: 1, endVerse: 38, title: '유다와 이스라엘의 여러 왕' },
    ],
    16: [
      { startVerse: 1, endVerse: 20, title: '아하스' },
    ],
    17: [
      { startVerse: 1, endVerse: 41, title: '이스라엘의 멸망' },
    ],
    18: [
      { startVerse: 1, endVerse: 37, title: '히스기야의 개혁' },
    ],
    19: [
      { startVerse: 1, endVerse: 37, title: '예루살렘의 구원' },
    ],
    20: [
      { startVerse: 1, endVerse: 21, title: '히스기야의 병과 치유' },
    ],
    21: [
      { startVerse: 1, endVerse: 26, title: '므나세와 아몬' },
    ],
    22: [
      { startVerse: 1, endVerse: 20, title: '요시야의 개혁' },
    ],
    23: [
      { startVerse: 1, endVerse: 37, title: '요시야의 개혁 완성' },
    ],
    24: [
      { startVerse: 1, endVerse: 20, title: '바벨로니아의 침략' },
    ],
    25: [
      { startVerse: 1, endVerse: 30, title: '예루살렘의 멸망' },
    ],
  },

  // ====== 역대상 ======
  '역대상': {
    1: [
      { startVerse: 1, endVerse: 54, title: '족보' },
    ],
    2: [
      { startVerse: 1, endVerse: 55, title: '족보' },
    ],
    3: [
      { startVerse: 1, endVerse: 24, title: '다윗의 자손' },
    ],
    4: [
      { startVerse: 1, endVerse: 43, title: '유다 지파의 족보' },
    ],
    5: [
      { startVerse: 1, endVerse: 26, title: '요단 동편 지파들' },
    ],
    6: [
      { startVerse: 1, endVerse: 81, title: '레위 지파' },
    ],
    7: [
      { startVerse: 1, endVerse: 40, title: '그 외 지파들' },
    ],
    8: [
      { startVerse: 1, endVerse: 40, title: '베냐민 지파' },
    ],
    9: [
      { startVerse: 1, endVerse: 44, title: '예루살렘 주민과 사울의 족보' },
    ],
    10: [
      { startVerse: 1, endVerse: 14, title: '사울의 죽음' },
    ],
    11: [
      { startVerse: 1, endVerse: 47, title: '다윗의 용사들' },
    ],
    12: [
      { startVerse: 1, endVerse: 40, title: '다윗의 도움자들' },
    ],
    13: [
      { startVerse: 1, endVerse: 14, title: '법궤의 운송 시도' },
    ],
    14: [
      { startVerse: 1, endVerse: 17, title: '다윗의 왕국 강화' },
    ],
    15: [
      { startVerse: 1, endVerse: 29, title: '법궤를 옮기다' },
    ],
    16: [
      { startVerse: 1, endVerse: 43, title: '성전 앞에서 드린 찬양' },
    ],
    17: [
      { startVerse: 1, endVerse: 27, title: '다윗의 언약' },
    ],
    18: [
      { startVerse: 1, endVerse: 17, title: '다윗의 정복' },
    ],
    19: [
      { startVerse: 1, endVerse: 19, title: '암몬과 아람의 침략' },
    ],
    20: [
      { startVerse: 1, endVerse: 8, title: '전쟁과 다윗의 죄' },
    ],
    21: [
      { startVerse: 1, endVerse: 30, title: '오르난의 타작 마당' },
    ],
    22: [
      { startVerse: 1, endVerse: 19, title: '성전 건축 준비' },
    ],
    23: [
      { startVerse: 1, endVerse: 32, title: '레위인의 직무' },
    ],
    24: [
      { startVerse: 1, endVerse: 31, title: '제사장들의 반열' },
    ],
    25: [
      { startVerse: 1, endVerse: 31, title: '음악 봉사자들' },
    ],
    26: [
      { startVerse: 1, endVerse: 32, title: '문지기들과 재무원' },
    ],
    27: [
      { startVerse: 1, endVerse: 34, title: '군 지휘관과 백부' },
    ],
    28: [
      { startVerse: 1, endVerse: 21, title: '성전 건축에 대한 지시' },
    ],
    29: [
      { startVerse: 1, endVerse: 30, title: '봉헌 예물과 다윗의 죽음' },
    ],
  },

  // ====== 역대하 ======
  '역대하': {
    1: [
      { startVerse: 1, endVerse: 17, title: '솔로몬의 지혜' },
    ],
    2: [
      { startVerse: 1, endVerse: 18, title: '성전 건축 준비' },
    ],
    3: [
      { startVerse: 1, endVerse: 17, title: '성전 건축' },
    ],
    4: [
      { startVerse: 1, endVerse: 22, title: '성전의 기구들' },
    ],
    5: [
      { startVerse: 1, endVerse: 14, title: '성전 봉헌' },
    ],
    6: [
      { startVerse: 1, endVerse: 42, title: '솔로몬의 기도' },
    ],
    7: [
      { startVerse: 1, endVerse: 22, title: '하나님의 응답' },
    ],
    8: [
      { startVerse: 1, endVerse: 18, title: '솔로몬의 활동' },
    ],
    9: [
      { startVerse: 1, endVerse: 31, title: '솔로몬의 사망' },
    ],
    10: [
      { startVerse: 1, endVerse: 19, title: '왕국의 분열' },
    ],
    11: [
      { startVerse: 1, endVerse: 23, title: '르호보암의 통치' },
    ],
    12: [
      { startVerse: 1, endVerse: 16, title: '애굽의 침략' },
    ],
    13: [
      { startVerse: 1, endVerse: 22, title: '아비야의 전쟁' },
    ],
    14: [
      { startVerse: 1, endVerse: 15, title: '아사의 초기' },
    ],
    15: [
      { startVerse: 1, endVerse: 19, title: '아사의 개혁' },
    ],
    16: [
      { startVerse: 1, endVerse: 14, title: '아사의 말년' },
    ],
    17: [
      { startVerse: 1, endVerse: 19, title: '여호사밧' },
    ],
    18: [
      { startVerse: 1, endVerse: 34, title: '미가와 아합' },
    ],
    19: [
      { startVerse: 1, endVerse: 11, title: '여호사밧의 개혁' },
    ],
    20: [
      { startVerse: 1, endVerse: 37, title: '모압의 침략' },
    ],
    21: [
      { startVerse: 1, endVerse: 20, title: '여호람의 통치' },
    ],
    22: [
      { startVerse: 1, endVerse: 12, title: '아하시야와 아탈리아' },
    ],
    23: [
      { startVerse: 1, endVerse: 21, title: '여호아다의 반란' },
    ],
    24: [
      { startVerse: 1, endVerse: 27, title: '여호아스의 통치' },
    ],
    25: [
      { startVerse: 1, endVerse: 28, title: '아마샤의 통치' },
    ],
    26: [
      { startVerse: 1, endVerse: 23, title: '웃시야' },
    ],
    27: [
      { startVerse: 1, endVerse: 9, title: '요담' },
    ],
    28: [
      { startVerse: 1, endVerse: 27, title: '아하스' },
    ],
    29: [
      { startVerse: 1, endVerse: 36, title: '히스기야의 개혁' },
    ],
    30: [
      { startVerse: 1, endVerse: 27, title: '유월절' },
    ],
    31: [
      { startVerse: 1, endVerse: 21, title: '제사 제도의 회복' },
    ],
    32: [
      { startVerse: 1, endVerse: 33, title: '히스기야의 영광과 환난' },
    ],
    33: [
      { startVerse: 1, endVerse: 25, title: '므나세와 아몬' },
    ],
    34: [
      { startVerse: 1, endVerse: 33, title: '요시야의 개혁' },
    ],
    35: [
      { startVerse: 1, endVerse: 27, title: '요시야의 유월절' },
    ],
    36: [
      { startVerse: 1, endVerse: 23, title: '유다의 마지막' },
    ],
  },

  // ====== 에스라 ======
  '에스라': {
    1: [
      { startVerse: 1, endVerse: 11, title: '페르시아의 칙령' },
    ],
    2: [
      { startVerse: 1, endVerse: 70, title: '귀환한 자들의 명단' },
    ],
    3: [
      { startVerse: 1, endVerse: 13, title: '제단의 복원' },
    ],
    4: [
      { startVerse: 1, endVerse: 24, title: '재건의 방해' },
    ],
    5: [
      { startVerse: 1, endVerse: 17, title: '재개와 다리오의 칙령' },
    ],
    6: [
      { startVerse: 1, endVerse: 22, title: '성전 완공과 봉헌' },
    ],
    7: [
      { startVerse: 1, endVerse: 28, title: '에스라의 귀환' },
    ],
    8: [
      { startVerse: 1, endVerse: 36, title: '에스라와 함께한 사람들' },
    ],
    9: [
      { startVerse: 1, endVerse: 15, title: '이방 아내와의 혼인' },
    ],
    10: [
      { startVerse: 1, endVerse: 44, title: '이혼의 결정' },
    ],
  },

  // ====== 느헤미야 ======
  '느헤미야': {
    1: [
      { startVerse: 1, endVerse: 11, title: '느헤미야의 애통' },
    ],
    2: [
      { startVerse: 1, endVerse: 20, title: '예루살렘에 가다' },
    ],
    3: [
      { startVerse: 1, endVerse: 32, title: '성벽 재건' },
    ],
    4: [
      { startVerse: 1, endVerse: 23, title: '방해와 경계' },
    ],
    5: [
      { startVerse: 1, endVerse: 19, title: '민족의 압제' },
    ],
    6: [
      { startVerse: 1, endVerse: 19, title: '마지막 방해' },
    ],
    7: [
      { startVerse: 1, endVerse: 73, title: '예루살렘 주민과 명단' },
    ],
    8: [
      { startVerse: 1, endVerse: 18, title: '율법의 강해' },
    ],
    9: [
      { startVerse: 1, endVerse: 38, title: '회개 기도' },
    ],
    10: [
      { startVerse: 1, endVerse: 39, title: '새 언약의 서명' },
    ],
    11: [
      { startVerse: 1, endVerse: 36, title: '예루살렘과 그 성읍 주민' },
    ],
    12: [
      { startVerse: 1, endVerse: 47, title: '제사장들과 레위인' },
    ],
    13: [
      { startVerse: 1, endVerse: 31, title: '느헤미야의 개혁' },
    ],
  },

  // ====== 에스더 ======
  '에스더': {
    1: [
      { startVerse: 1, endVerse: 22, title: '바사로의 잔치' },
    ],
    2: [
      { startVerse: 1, endVerse: 23, title: '에스더의 선택' },
    ],
    3: [
      { startVerse: 1, endVerse: 15, title: '하만의 음모' },
    ],
    4: [
      { startVerse: 1, endVerse: 17, title: '에스더의 결단' },
    ],
    5: [
      { startVerse: 1, endVerse: 14, title: '하만과 에스더의 잔치' },
    ],
    6: [
      { startVerse: 1, endVerse: 14, title: '하만의 굴욕' },
    ],
    7: [
      { startVerse: 1, endVerse: 10, title: '에스더의 용기' },
    ],
    8: [
      { startVerse: 1, endVerse: 17, title: '유대인의 승리' },
    ],
    9: [
      { startVerse: 1, endVerse: 32, title: '유월절의 제정' },
    ],
    10: [
      { startVerse: 1, endVerse: 3, title: '모데카의 영화' },
    ],
  },

  // ====== 욥기 ======
  '욥기': {
    1: [
      { startVerse: 1, endVerse: 22, title: '욥의 인내와 시련의 시작' },
    ],
    2: [
      { startVerse: 1, endVerse: 13, title: '사탄의 재공격' },
    ],
    3: [
      { startVerse: 1, endVerse: 26, title: '욥의 탄식' },
    ],
    4: [
      { startVerse: 1, endVerse: 21, title: '엘리바스의 첫 번째 변론' },
    ],
    5: [
      { startVerse: 1, endVerse: 27, title: '엘리바스의 변론 계속' },
    ],
    6: [
      { startVerse: 1, endVerse: 30, title: '욥의 대답' },
    ],
    7: [
      { startVerse: 1, endVerse: 21, title: '빌닷의 변론' },
    ],
    8: [
      { startVerse: 1, endVerse: 22, title: '빌닷의 변론 계속' },
    ],
    9: [
      { startVerse: 1, endVerse: 35, title: '욥의 대답' },
    ],
    10: [
      { startVerse: 1, endVerse: 22, title: '욥의 탄식' },
    ],
    11: [
      { startVerse: 1, endVerse: 20, title: '소발의 변론' },
    ],
    12: [
      { startVerse: 1, endVerse: 25, title: '욥의 대답' },
    ],
    13: [
      { startVerse: 1, endVerse: 28, title: '욥의 도전' },
    ],
    14: [
      { startVerse: 1, endVerse: 22, title: '인생의 짧음' },
    ],
    15: [
      { startVerse: 1, endVerse: 35, title: '엘리바스의 두 번째 변론' },
    ],
    16: [
      { startVerse: 1, endVerse: 22, title: '욥의 대답' },
    ],
    17: [
      { startVerse: 1, endVerse: 16, title: '생명의 희망' },
    ],
    18: [
      { startVerse: 1, endVerse: 21, title: '빌닷의 두 번째 변론' },
    ],
    19: [
      { startVerse: 1, endVerse: 29, title: '구원받음의 확신' },
    ],
    20: [
      { startVerse: 1, endVerse: 29, title: '소발의 두 번째 변론' },
    ],
    21: [
      { startVerse: 1, endVerse: 34, title: '욥의 대답' },
    ],
    22: [
      { startVerse: 1, endVerse: 30, title: '엘리바스의 세 번째 변론' },
    ],
    23: [
      { startVerse: 1, endVerse: 17, title: '하나님 앞에 서다' },
    ],
    24: [
      { startVerse: 1, endVerse: 25, title: '악인의 형통' },
    ],
    25: [
      { startVerse: 1, endVerse: 6, title: '빌닷의 세 번째 변론' },
    ],
    26: [
      { startVerse: 1, endVerse: 14, title: '하나님의 위엄' },
    ],
    27: [
      { startVerse: 1, endVerse: 23, title: '욥의 마지막 답변' },
    ],
    28: [
      { startVerse: 1, endVerse: 28, title: '지혜의 가치' },
    ],
    29: [
      { startVerse: 1, endVerse: 25, title: '옛날의 날들' },
    ],
    30: [
      { startVerse: 1, endVerse: 31, title: '고난의 시련' },
    ],
    31: [
      { startVerse: 1, endVerse: 40, title: '나의 의로움' },
    ],
    32: [
      { startVerse: 1, endVerse: 22, title: '엘리후의 분노' },
    ],
    33: [
      { startVerse: 1, endVerse: 33, title: '하나님의 교훈' },
    ],
    34: [
      { startVerse: 1, endVerse: 37, title: '하나님의 공의' },
    ],
    35: [
      { startVerse: 1, endVerse: 16, title: '사람의 행위의 무익' },
    ],
    36: [
      { startVerse: 1, endVerse: 33, title: '하나님의 위대하심' },
    ],
    37: [
      { startVerse: 1, endVerse: 24, title: '하나님의 위엄' },
    ],
    38: [
      { startVerse: 1, endVerse: 41, title: '하나님의 질문' },
    ],
    39: [
      { startVerse: 1, endVerse: 30, title: '짐승의 지혜' },
    ],
    40: [
      { startVerse: 1, endVerse: 24, title: '베헤못과 악어' },
    ],
    41: [
      { startVerse: 1, endVerse: 34, title: '리워야단' },
    ],
    42: [
      { startVerse: 1, endVerse: 17, title: '하나님의 응답과 욥의 회복' },
    ],
  },

  // ====== 시편 (주요 장만, 150장 전체) ======
  '시편': {
    1: [
      { startVerse: 1, endVerse: 6, title: '두 갈래의 길' },
    ],
    2: [
      { startVerse: 1, endVerse: 12, title: '여호와의 종속' },
    ],
    8: [
      { startVerse: 1, endVerse: 9, title: '사람의 위엄' },
    ],
    19: [
      { startVerse: 1, endVerse: 14, title: '자연과 계시의 하나님' },
    ],
    22: [
      { startVerse: 1, endVerse: 31, title: '고난받는 의인의 찬송' },
    ],
    23: [
      { startVerse: 1, endVerse: 6, title: '선한 목자' },
    ],
    27: [
      { startVerse: 1, endVerse: 14, title: '여호와는 나의 빛' },
    ],
    42: [
      { startVerse: 1, endVerse: 11, title: '사슴의 갈망' },
    ],
    46: [
      { startVerse: 1, endVerse: 11, title: '하나님은 우리의 피난처' },
    ],
    51: [
      { startVerse: 1, endVerse: 19, title: '회개의 찬송' },
    ],
    84: [
      { startVerse: 1, endVerse: 12, title: '성전의 사모' },
    ],
    90: [
      { startVerse: 1, endVerse: 17, title: '영원하신 하나님' },
    ],
    91: [
      { startVerse: 1, endVerse: 16, title: '지하하늘의 보호' },
    ],
    100: [
      { startVerse: 1, endVerse: 5, title: '감사와 찬양의 찬송' },
    ],
    103: [
      { startVerse: 1, endVerse: 22, title: '하나님의 은혜' },
    ],
    119: [
      { startVerse: 1, endVerse: 176, title: '율법의 완전함' },
    ],
    121: [
      { startVerse: 1, endVerse: 8, title: '도움은 여호와께' },
    ],
    139: [
      { startVerse: 1, endVerse: 24, title: '하나님의 전지' },
    ],
    145: [
      { startVerse: 1, endVerse: 21, title: '위엄과 나라의 하나님' },
    ],
    150: [
      { startVerse: 1, endVerse: 6, title: '만물의 찬양' },
    ],
  },

  // ====== 잠언 ======
  '잠언': {
    1: [
      { startVerse: 1, endVerse: 33, title: '지혜의 초대' },
    ],
    2: [
      { startVerse: 1, endVerse: 22, title: '지혜의 가치' },
    ],
    3: [
      { startVerse: 1, endVerse: 35, title: '지혜의 보상' },
    ],
    4: [
      { startVerse: 1, endVerse: 27, title: '지혜의 길' },
    ],
    5: [
      { startVerse: 1, endVerse: 23, title: '음행의 위험' },
    ],
    6: [
      { startVerse: 1, endVerse: 35, title: '게으름과 악의 위험' },
    ],
    7: [
      { startVerse: 1, endVerse: 27, title: '음녀의 간계' },
    ],
    8: [
      { startVerse: 1, endVerse: 36, title: '지혜의 부름' },
    ],
    9: [
      { startVerse: 1, endVerse: 18, title: '지혜와 미혹의 잔치' },
    ],
    10: [
      { startVerse: 1, endVerse: 32, title: '솔로몬의 잠언 1' },
    ],
    15: [
      { startVerse: 1, endVerse: 33, title: '솔로몬의 잠언 2' },
    ],
    20: [
      { startVerse: 1, endVerse: 30, title: '솔로몬의 잠언 3' },
    ],
    25: [
      { startVerse: 1, endVerse: 28, title: '솔로몬의 잠언 4' },
    ],
    30: [
      { startVerse: 1, endVerse: 33, title: '아굴의 잠언' },
    ],
    31: [
      { startVerse: 1, endVerse: 31, title: '르무엘의 잠언과 현모양처' },
    ],
  },

  // ====== 전도서 ======
  '전도서': {
    1: [
      { startVerse: 1, endVerse: 18, title: '일의 무익함' },
    ],
    2: [
      { startVerse: 1, endVerse: 26, title: '쾌락과 노동의 무익' },
    ],
    3: [
      { startVerse: 1, endVerse: 22, title: '때를 따른 삶' },
    ],
    4: [
      { startVerse: 1, endVerse: 16, title: '고난과 경쟁의 무익' },
    ],
    5: [
      { startVerse: 1, endVerse: 20, title: '하나님을 경외하라' },
    ],
    6: [
      { startVerse: 1, endVerse: 12, title: '부족한 행복' },
    ],
    7: [
      { startVerse: 1, endVerse: 29, title: '지혜의 가치' },
    ],
    8: [
      { startVerse: 1, endVerse: 17, title: '지혜의 한계' },
    ],
    9: [
      { startVerse: 1, endVerse: 18, title: '죽음의 확실성' },
    ],
    10: [
      { startVerse: 1, endVerse: 20, title: '어리석음의 위험' },
    ],
    11: [
      { startVerse: 1, endVerse: 10, title: '젊음의 시절' },
    ],
    12: [
      { startVerse: 1, endVerse: 14, title: '늙음의 때와 결론' },
    ],
  },

  // ====== 아가 ======
  '아가': {
    1: [
      { startVerse: 1, endVerse: 17, title: '서로의 사랑을 노래함' },
    ],
    2: [
      { startVerse: 1, endVerse: 17, title: '연인의 만남' },
    ],
    3: [
      { startVerse: 1, endVerse: 11, title: '잃어버린 연인' },
    ],
    4: [
      { startVerse: 1, endVerse: 16, title: '신랑의 미모' },
    ],
    5: [
      { startVerse: 1, endVerse: 16, title: '신부의 아름다움' },
    ],
    6: [
      { startVerse: 1, endVerse: 13, title: '서로의 사랑 확인' },
    ],
    7: [
      { startVerse: 1, endVerse: 13, title: '진정한 사랑' },
    ],
    8: [
      { startVerse: 1, endVerse: 14, title: '불멸의 사랑' },
    ],
  },

  // ====== 이사야 ======
  '이사야': {
    1: [
      { startVerse: 1, endVerse: 31, title: '반역의 백성과 회개의 부르심' },
    ],
    2: [
      { startVerse: 1, endVerse: 22, title: '만왕의 왕의 산' },
    ],
    3: [
      { startVerse: 1, endVerse: 26, title: '예루살렘의 심판' },
    ],
    4: [
      { startVerse: 1, endVerse: 6, title: '남은 자의 회복' },
    ],
    5: [
      { startVerse: 1, endVerse: 30, title: '포도원의 노래' },
    ],
    6: [
      { startVerse: 1, endVerse: 13, title: '이사야의 소명' },
    ],
    7: [
      { startVerse: 1, endVerse: 25, title: '임마누엘의 징조' },
    ],
    8: [
      { startVerse: 1, endVerse: 22, title: '두려워하지 말라' },
    ],
    9: [
      { startVerse: 1, endVerse: 21, title: '왕의 탄생' },
    ],
    10: [
      { startVerse: 1, endVerse: 34, title: '교만한 앗수르의 심판' },
    ],
    11: [
      { startVerse: 1, endVerse: 16, title: '평화의 왕' },
    ],
    12: [
      { startVerse: 1, endVerse: 6, title: '감사의 노래' },
    ],
    13: [
      { startVerse: 1, endVerse: 22, title: '바벨론의 심판' },
    ],
    14: [
      { startVerse: 1, endVerse: 32, title: '이스라엘의 회복' },
    ],
    40: [
      { startVerse: 1, endVerse: 31, title: '위로의 말씀' },
    ],
    41: [
      { startVerse: 1, endVerse: 29, title: '여호와의 능력' },
    ],
    42: [
      { startVerse: 1, endVerse: 25, title: '종의 노래' },
    ],
    43: [
      { startVerse: 1, endVerse: 28, title: '구원하시는 하나님' },
    ],
    44: [
      { startVerse: 1, endVerse: 28, title: '여호와만 하나님' },
    ],
    45: [
      { startVerse: 1, endVerse: 25, title: '고레스와 구원' },
    ],
    52: [
      { startVerse: 1, endVerse: 15, title: '고난받는 종' },
    ],
    53: [
      { startVerse: 1, endVerse: 12, title: '고난의 종' },
    ],
    54: [
      { startVerse: 1, endVerse: 17, title: '영원한 사랑' },
    ],
    55: [
      { startVerse: 1, endVerse: 13, title: '생명의 말씀' },
    ],
    60: [
      { startVerse: 1, endVerse: 22, title: '영광의 예루살렘' },
    ],
    61: [
      { startVerse: 1, endVerse: 11, title: '주님의 기름부음' },
    ],
    65: [
      { startVerse: 1, endVerse: 25, title: '새 하늘과 새 땅' },
    ],
    66: [
      { startVerse: 1, endVerse: 24, title: '마지막 심판과 소망' },
    ],
  },

  // ====== 예레미야 ======
  '예레미야': {
    1: [
      { startVerse: 1, endVerse: 19, title: '예레미야의 소명' },
    ],
    2: [
      { startVerse: 1, endVerse: 37, title: '배신한 이스라엘' },
    ],
    3: [
      { startVerse: 1, endVerse: 25, title: '회개의 부르심' },
    ],
    4: [
      { startVerse: 1, endVerse: 31, title: '심판의 예고' },
    ],
    7: [
      { startVerse: 1, endVerse: 34, title: '성전의 설교' },
    ],
    23: [
      { startVerse: 1, endVerse: 40, title: '의로운 남자의 예언' },
    ],
    29: [
      { startVerse: 1, endVerse: 32, title: '포로 중의 편지' },
    ],
    31: [
      { startVerse: 1, endVerse: 40, title: '새 언약' },
    ],
    33: [
      { startVerse: 1, endVerse: 26, title: '회복의 약속' },
    ],
    52: [
      { startVerse: 1, endVerse: 34, title: '예루살렘의 함락' },
    ],
  },

  // ====== 예레미야애가 ======
  '예레미야애가': {
    1: [
      { startVerse: 1, endVerse: 22, title: '예루살렘의 비참함' },
    ],
    2: [
      { startVerse: 1, endVerse: 22, title: '여호와의 진노' },
    ],
    3: [
      { startVerse: 1, endVerse: 66, title: '고난 중에 소망' },
    ],
    4: [
      { startVerse: 1, endVerse: 22, title: '공포의 시간' },
    ],
    5: [
      { startVerse: 1, endVerse: 22, title: '회복의 기도' },
    ],
  },

  // ====== 에스겔 ======
  '에스겔': {
    1: [
      { startVerse: 1, endVerse: 28, title: '에스겔의 환상' },
    ],
    2: [
      { startVerse: 1, endVerse: 10, title: '에스겔의 소명' },
    ],
    3: [
      { startVerse: 1, endVerse: 27, title: '파수꾼의 책임' },
    ],
    10: [
      { startVerse: 1, endVerse: 22, title: '하나님의 영광이 떠남' },
    ],
    18: [
      { startVerse: 1, endVerse: 32, title: '개인의 책임' },
    ],
    33: [
      { startVerse: 1, endVerse: 33, title: '파수꾼의 의무' },
    ],
    34: [
      { startVerse: 1, endVerse: 31, title: '선한 목자' },
    ],
    36: [
      { startVerse: 1, endVerse: 38, title: '이스라엘의 회복' },
    ],
    37: [
      { startVerse: 1, endVerse: 28, title: '마른 뼈의 환상' },
    ],
    47: [
      { startVerse: 1, endVerse: 23, title: '성전에서 흐르는 물' },
    ],
  },

  // ====== 다니엘 ======
  '다니엘': {
    1: [
      { startVerse: 1, endVerse: 21, title: '포로 중의 소년들' },
    ],
    2: [
      { startVerse: 1, endVerse: 49, title: '네브갓네살의 꿈' },
    ],
    3: [
      { startVerse: 1, endVerse: 30, title: '불 타는 풀무치' },
    ],
    4: [
      { startVerse: 1, endVerse: 37, title: '네브갓네살의 광기' },
    ],
    5: [
      { startVerse: 1, endVerse: 31, title: '벨사살의 잔치' },
    ],
    6: [
      { startVerse: 1, endVerse: 28, title: '사자 굴의 다니엘' },
    ],
    7: [
      { startVerse: 1, endVerse: 28, title: '네 짐승의 환상' },
    ],
    9: [
      { startVerse: 1, endVerse: 27, title: '예레미야의 예언과 70년' },
    ],
    10: [
      { startVerse: 1, endVerse: 21, title: '환상 속의 전쟁' },
    ],
    12: [
      { startVerse: 1, endVerse: 13, title: '최후의 환상' },
    ],
  },

  // ====== 호세아 ======
  '호세아': {
    1: [
      { startVerse: 1, endVerse: 11, title: '호세아의 불신한 아내' },
    ],
    2: [
      { startVerse: 1, endVerse: 23, title: '불신한 이스라엘의 회복' },
    ],
    3: [
      { startVerse: 1, endVerse: 5, title: '호세아의 회복된 사랑' },
    ],
    4: [
      { startVerse: 1, endVerse: 19, title: '이스라엘의 죄' },
    ],
    5: [
      { startVerse: 1, endVerse: 15, title: '심판과 회개' },
    ],
    6: [
      { startVerse: 1, endVerse: 11, title: '참 회개' },
    ],
    11: [
      { startVerse: 1, endVerse: 11, title: '하나님의 인자하심' },
    ],
    14: [
      { startVerse: 1, endVerse: 9, title: '회개의 촉구' },
    ],
  },

  // ====== 요엘 ======
  '요엘': {
    1: [
      { startVerse: 1, endVerse: 20, title: '메뚜기의 재앙' },
    ],
    2: [
      { startVerse: 1, endVerse: 32, title: '여호와의 날' },
    ],
    3: [
      { startVerse: 1, endVerse: 21, title: '열방의 심판' },
    ],
  },

  // ====== 아모스 ======
  '아모스': {
    1: [
      { startVerse: 1, endVerse: 15, title: '열방의 심판' },
    ],
    2: [
      { startVerse: 1, endVerse: 16, title: '이스라엘의 심판' },
    ],
    3: [
      { startVerse: 1, endVerse: 15, title: '여호와의 종' },
    ],
    4: [
      { startVerse: 1, endVerse: 13, title: '준비되지 않은 여호와의 날' },
    ],
    5: [
      { startVerse: 1, endVerse: 27, title: '공의와 의를 구하라' },
    ],
    7: [
      { startVerse: 1, endVerse: 17, title: '아모스의 환상들' },
    ],
    8: [
      { startVerse: 1, endVerse: 14, title: '속은 저울추' },
    ],
    9: [
      { startVerse: 1, endVerse: 15, title: '회복의 소망' },
    ],
  },

  // ====== 오바댜 ======
  '오바댜': {
    1: [
      { startVerse: 1, endVerse: 21, title: '에돔의 심판과 이스라엘의 승리' },
    ],
  },

  // ====== 요나 ======
  '요나': {
    1: [
      { startVerse: 1, endVerse: 17, title: '요나의 도피와 큰 물고기' },
    ],
    2: [
      { startVerse: 1, endVerse: 10, title: '요나의 기도' },
    ],
    3: [
      { startVerse: 1, endVerse: 10, title: '니느웨의 회개' },
    ],
    4: [
      { startVerse: 1, endVerse: 11, title: '요나의 분노와 하나님의 교훈' },
    ],
  },

  // ====== 미가 ======
  '미가': {
    1: [
      { startVerse: 1, endVerse: 16, title: '심판의 예고' },
    ],
    2: [
      { startVerse: 1, endVerse: 13, title: '압제자에 대한 심판' },
    ],
    3: [
      { startVerse: 1, endVerse: 12, title: '지도자들의 죄' },
    ],
    4: [
      { startVerse: 1, endVerse: 13, title: '평화의 나라' },
    ],
    5: [
      { startVerse: 1, endVerse: 15, title: '베들레헴에서 태어나는 다스림자' },
    ],
    6: [
      { startVerse: 1, endVerse: 16, title: '공의의 요구' },
    ],
    7: [
      { startVerse: 1, endVerse: 20, title: '고백과 소망' },
    ],
  },

  // ====== 나훔 ======
  '나훔': {
    1: [
      { startVerse: 1, endVerse: 15, title: '니느웨의 멸망' },
    ],
    2: [
      { startVerse: 1, endVerse: 13, title: '심판의 확실성' },
    ],
    3: [
      { startVerse: 1, endVerse: 19, title: '니느웨의 멸망' },
    ],
  },

  // ====== 하박국 ======
  '하박국': {
    1: [
      { startVerse: 1, endVerse: 17, title: '하박국의 탄식' },
    ],
    2: [
      { startVerse: 1, endVerse: 20, title: '의인의 삶과 악인의 삶' },
    ],
    3: [
      { startVerse: 1, endVerse: 19, title: '하박국의 기도' },
    ],
  },

  // ====== 스바냐 ======
  '스바냐': {
    1: [
      { startVerse: 1, endVerse: 18, title: '여호와의 날' },
    ],
    2: [
      { startVerse: 1, endVerse: 15, title: '회개의 촉구' },
    ],
    3: [
      { startVerse: 1, endVerse: 20, title: '남은 자의 구원' },
    ],
  },

  // ====== 학개 ======
  '학개': {
    1: [
      { startVerse: 1, endVerse: 15, title: '성전 재건의 촉구' },
    ],
    2: [
      { startVerse: 1, endVerse: 23, title: '새 성전의 영광' },
    ],
  },

  // ====== 스가랴 ======
  '스가랴': {
    1: [
      { startVerse: 1, endVerse: 21, title: "돌아오라는 명령" },
    ],
    2: [
      { startVerse: 1, endVerse: 13, title: '새 예루살렘의 약속' },
    ],
    3: [
      { startVerse: 1, endVerse: 10, title: '대제사장 여호수아' },
    ],
    4: [
      { startVerse: 1, endVerse: 14, title: '등잔대 환상' },
    ],
    8: [
      { startVerse: 1, endVerse: 23, title: '회복의 약속' },
    ],
    9: [
      { startVerse: 1, endVerse: 17, title: '왕의 입성' },
    ],
    12: [
      { startVerse: 1, endVerse: 14, title: '애통하는 자' },
    ],
    14: [
      { startVerse: 1, endVerse: 21, title: '여호와의 날' },
    ],
  },

  // ====== 말라기 ======
  '말라기': {
    1: [
      { startVerse: 1, endVerse: 14, title: '이스라엘의 배신' },
    ],
    2: [
      { startVerse: 1, endVerse: 17, title: '제사장들과 백성' },
    ],
    3: [
      { startVerse: 1, endVerse: 18, title: '여호와의 사자' },
    ],
    4: [
      { startVerse: 1, endVerse: 6, title: '심판의 날' },
    ],
  },

  // ====== 마가복음 ======
  '마가복음': {
    1: [
      { startVerse: 1, endVerse: 20, title: '세례 요한과 예수의 사역 시작' },
      { startVerse: 21, endVerse: 45, title: '예수, 가르치시고 병 고치시다' },
    ],
    2: [
      { startVerse: 1, endVerse: 28, title: '죄 사함을 받다' },
    ],
    3: [
      { startVerse: 1, endVerse: 35, title: '안식일과 예수님의 친척' },
    ],
    4: [
      { startVerse: 1, endVerse: 41, title: '비유' },
    ],
    5: [
      { startVerse: 1, endVerse: 43, title: '귀신을 쫓아내시고 병 고치시다' },
    ],
    6: [
      { startVerse: 1, endVerse: 56, title: '예수의 고향과 제자들' },
    ],
    8: [
      { startVerse: 1, endVerse: 38, title: '베드로의 고백과 십자가' },
    ],
    9: [
      { startVerse: 1, endVerse: 50, title: '변화산과 귀신 들린 아이' },
    ],
    10: [
      { startVerse: 1, endVerse: 52, title: '이혼, 어린이, 부자' },
    ],
    12: [
      { startVerse: 1, endVerse: 44, title: '율법과 가난한 과부' },
    ],
    14: [
      { startVerse: 1, endVerse: 72, title: '마지막 유월절과 체포' },
    ],
    16: [
      { startVerse: 1, endVerse: 20, title: '부활' },
    ],
  },

  // ====== 누가복음 ======
  '누가복음': {
    1: [
      { startVerse: 1, endVerse: 25, title: '예수 탄생을 위한 준비' },
      { startVerse: 26, endVerse: 56, title: '예수 탄생을 예고' },
      { startVerse: 57, endVerse: 80, title: '요한의 탄생' },
    ],
    2: [
      { startVerse: 1, endVerse: 20, title: '예수의 탄생' },
      { startVerse: 21, endVerse: 52, title: '예수의 성장' },
    ],
    4: [
      { startVerse: 1, endVerse: 30, title: '예수의 시험과 사역 시작' },
      { startVerse: 31, endVerse: 44, title: '예수의 권위' },
    ],
    5: [
      { startVerse: 1, endVerse: 39, title: '제자들의 부르심과 죄인' },
    ],
    6: [
      { startVerse: 1, endVerse: 49, title: '안식일과 산상설교' },
    ],
    7: [
      { startVerse: 1, endVerse: 50, title: '백부장의 종과 과부의 아들' },
    ],
    9: [
      { startVerse: 1, endVerse: 62, title: '제자들과 오병이어' },
    ],
    10: [
      { startVerse: 1, endVerse: 42, title: '칠십인과 선한 사마리아인' },
    ],
    15: [
      { startVerse: 1, endVerse: 32, title: '잃어버린 양' },
    ],
    18: [
      { startVerse: 1, endVerse: 43, title: '인자와 의' },
    ],
    19: [
      { startVerse: 1, endVerse: 48, title: '세리와 다시 오는 왕' },
    ],
    22: [
      { startVerse: 1, endVerse: 71, title: '마지막 유월절' },
    ],
    23: [
      { startVerse: 1, endVerse: 56, title: '십자가와 무덤' },
    ],
    24: [
      { startVerse: 1, endVerse: 53, title: '부활' },
    ],
  },

  // ====== 사도행전 ======
  '사도행전': {
    1: [
      { startVerse: 1, endVerse: 26, title: '승천과 맛시아의 선택' },
    ],
    2: [
      { startVerse: 1, endVerse: 47, title: '성령 강림과 교회' },
    ],
    3: [
      { startVerse: 1, endVerse: 26, title: '다 모고 문 앞에서' },
    ],
    4: [
      { startVerse: 1, endVerse: 37, title: '공동체 생활' },
    ],
    9: [
      { startVerse: 1, endVerse: 43, title: '사울의 회심' },
    ],
    10: [
      { startVerse: 1, endVerse: 48, title: '고넬료의 회심' },
    ],
    13: [
      { startVerse: 1, endVerse: 52, title: '바울의 첫 번째 선교 여행' },
    ],
    16: [
      { startVerse: 1, endVerse: 40, title: '빌립보와 데살로니가' },
    ],
    17: [
      { startVerse: 1, endVerse: 34, title: '아레오바고에서의 설교' },
    ],
    26: [
      { startVerse: 1, endVerse: 32, title: '바울의 변명' },
    ],
    28: [
      { startVerse: 1, endVerse: 31, title: '로마로 가는 길' },
    ],
  },

  // ====== 데살로니가전서 ======
  '데살로니가전서': {
    1: [
      { startVerse: 1, endVerse: 10, title: '감사와 칭찬' },
    ],
    2: [
      { startVerse: 1, endVerse: 20, title: '바울의 사역' },
    ],
    4: [
      { startVerse: 1, endVerse: 18, title: '주님의 재림' },
    ],
    5: [
      { startVerse: 1, endVerse: 28, title: '깨어 있을 것에 대한 권면' },
    ],
  },

  // ====== 데살로니가후서 ======
  '데살로니가후서': {
    1: [
      { startVerse: 1, endVerse: 12, title: '정의의 심판' },
    ],
    2: [
      { startVerse: 1, endVerse: 17, title: '거짓 선지자' },
    ],
    3: [
      { startVerse: 1, endVerse: 18, title: '게으름에 대한 경고' },
    ],
  },

  // ====== 디모데전서 ======
  '디모데전서': {
    1: [
      { startVerse: 1, endVerse: 20, title: '인사 및 거짓 교리에 대한 경고' },
    ],
    2: [
      { startVerse: 1, endVerse: 15, title: '교회의 기도와 질서' },
    ],
    3: [
      { startVerse: 1, endVerse: 16, title: '감독과 집사의 자격' },
    ],
    4: [
      { startVerse: 1, endVerse: 16, title: '거짓 교리와 진리의 사역' },
    ],
    6: [
      { startVerse: 1, endVerse: 21, title: '종과 하나님의 자녀' },
    ],
  },

  // ====== 디모데후서 ======
  '디모데후서': {
    1: [
      { startVerse: 1, endVerse: 18, title: '인사와 사명의 회복' },
    ],
    2: [
      { startVerse: 1, endVerse: 26, title: '참된 종' },
    ],
    3: [
      { startVerse: 1, endVerse: 17, title: '말세의 위험' },
    ],
    4: [
      { startVerse: 1, endVerse: 22, title: '바울의 마지막 권면' },
    ],
  },

  // ====== 디도서 ======
  '디도서': {
    1: [
      { startVerse: 1, endVerse: 16, title: '감독의 자격' },
    ],
    2: [
      { startVerse: 1, endVerse: 15, title: '바른 교리' },
    ],
    3: [
      { startVerse: 1, endVerse: 15, title: '그리스도인의 행동' },
    ],
  },

  // ====== 빌레몬서 ======
  '빌레몬서': {
    1: [
      { startVerse: 1, endVerse: 25, title: '오네시모를 위한 바울의 중보' },
    ],
  },

  // ====== 베드로후서 ======
  '베드로후서': {
    1: [
      { startVerse: 1, endVerse: 21, title: '신앙의 덕' },
    ],
    2: [
      { startVerse: 1, endVerse: 22, title: '거짓 선생들' },
    ],
    3: [
      { startVerse: 1, endVerse: 18, title: '주님의 재림' },
    ],
  },

  // ====== 요한이서 ======
  '요한이서': {
    1: [
      { startVerse: 1, endVerse: 13, title: '진리와 사랑' },
    ],
  },

  // ====== 요한삼서 ======
  '요한삼서': {
    1: [
      { startVerse: 1, endVerse: 14, title: '디모데와 가이오' },
    ],
  },

  // ====== 유다서 ======
  '유다서': {
    1: [
      { startVerse: 1, endVerse: 25, title: '거짓 교리에 대한 경고' },
    ],
  },

  // ====== 요한계시록 ======
  '요한계시록': {
    1: [
      { startVerse: 1, endVerse: 20, title: '인사와 환상' },
    ],
    2: [
      { startVerse: 1, endVerse: 29, title: '에베소와 서머나' },
    ],
    3: [
      { startVerse: 1, endVerse: 22, title: '바닥과 사데' },
    ],
    4: [
      { startVerse: 1, endVerse: 11, title: '보좌 앞에' },
    ],
    5: [
      { startVerse: 1, endVerse: 14, title: '인자와 어린 양' },
    ],
    7: [
      { startVerse: 1, endVerse: 17, title: '십사만 사천과 많은 무리' },
    ],
    12: [
      { startVerse: 1, endVerse: 17, title: '여자와 용' },
    ],
    19: [
      { startVerse: 1, endVerse: 21, title: '최후의 승리' },
    ],
    21: [
      { startVerse: 1, endVerse: 27, title: '새 예루살렘' },
    ],
    22: [
      { startVerse: 1, endVerse: 21, title: '생명의 강과 결론' },
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
