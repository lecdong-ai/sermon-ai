export interface AdminUser {
  id: string;
  name: string;
  email: string;
  churchName?: string;
  joinedAt: string;
  planStatus: 'free' | 'premium';
}

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'single' | 'subscription';
  connectedResourceIds?: string[];
}

export const mockUsers: AdminUser[] = [
  { id: 'u1', name: '김전도', email: 'jundo@church.kr', churchName: '사랑교회', joinedAt: '2025-01-10', planStatus: 'premium' },
  { id: 'u2', name: '이목사', email: 'pastor@grace.org', churchName: '은혜성결교회', joinedAt: '2025-02-15', planStatus: 'free' },
  { id: 'u3', name: '박부장', email: 'park@gmail.com', churchName: '샘물침례교회', joinedAt: '2025-03-01', planStatus: 'free' },
  { id: 'u4', name: '최교사', email: 'teacher@naver.com', churchName: '하늘빛교회', joinedAt: '2025-04-12', planStatus: 'premium' },
  { id: 'u5', name: '정행정', email: 'admin@hope.net', churchName: '소망장로교회', joinedAt: '2025-05-20', planStatus: 'free' },
];

export const mockProducts: AdminProduct[] = [
  { id: 'p1', name: '프리미엄 월간 구독권', description: '교회학교 솔루션의 유료 자료실과 AI 공지작성기를 무제한으로 사용합니다.', price: 9900, type: 'subscription' },
  { id: 'p2', name: '여름성경학교 안내 패키지 단건', description: '개별 구매용 여름 성경학교 오리엔테이션, 동의서, 서식 모음집입니다.', price: 2900, type: 'single', connectedResourceIds: ['r2', 'r12'] },
  { id: 'p3', name: '신입교사 훈련 매뉴얼 단건', description: '교사 세미나용 가이드 교재 및 발표용 슬라이드 세트입니다.', price: 3900, type: 'single', connectedResourceIds: ['r13', 'r14'] },
  { id: 'p4', name: '주일학교 연간 계획 종합 양식 단건', description: '행정 예산결산 통계 엑셀서식과 기획서 결합 양식입니다.', price: 3900, type: 'single', connectedResourceIds: ['r19', 'r23'] },
];
