// 성경 66권 사용자 정의 읽기 순서
// 큐티 분할 시 1주 단위로 순차 진행
export const BIBLE_READING_ORDER: string[] = [
  '요한복음', '창세기', '야고보서', '이사야', '룻기', '로마서',
  '아모스', '사무엘상', '히브리서', '미가', '빌립보서', '출애굽기',
  '베드로전서', '열왕기하', '마가복음', '에스더', '고린도후서', '여호수아',
  '전도서', '디모데후서', '시편', '하박국', '누가복음', '역대상',
  '유다서', '민수기', '에베소서', '요엘', '고린도전서', '느헤미야',
  '요한일서', '다니엘', '디도서', '사사기', '예레미야', '베드로후서',
  '잠언', '사도행전', '스가랴', '오바댜', '사무엘하', '갈라디아서',
  '에스겔', '나훔', '마태복음', '골로새서', '레위기', '빌레몬서',
  '말라기', '호세아', '데살로니가전서', '역대하', '예레미야애가', '신명기',
  '요한이서', '에스라', '욥기', '스바냐', '요나', '아가',
  '데살로니가후서', '학개', '요한삼서', '열왕기상', '디모데전서', '요한계시록',
]

/**
 * 66권 순서에서 현재 책의 다음 권을 반환
 * @param currentBook 현재 진행 중인 성경책
 * @returns 다음 책 (마지막 책이면 null)
 */
export function getNextBookInOrder(currentBook: string): string | null {
  const idx = BIBLE_READING_ORDER.indexOf(currentBook)
  if (idx === -1 || idx === BIBLE_READING_ORDER.length - 1) return null
  return BIBLE_READING_ORDER[idx + 1]
}

/**
 * 66권 순서에서 현재 책의 인덱스 (0-based)
 */
export function getBookIndexInOrder(currentBook: string): number {
  return BIBLE_READING_ORDER.indexOf(currentBook)
}

/**
 * 순서의 첫 번째 책 (시작용)
 */
export function getFirstBookInOrder(): string {
  return BIBLE_READING_ORDER[0]
}

/**
 * 순서의 마지막 책인지 확인
 */
export function isLastBookInOrder(currentBook: string): boolean {
  return BIBLE_READING_ORDER.indexOf(currentBook) === BIBLE_READING_ORDER.length - 1
}
