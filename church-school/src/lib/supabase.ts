import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isValidUrl = supabaseUrl.startsWith('http') && !supabaseUrl.includes('YOUR_PROJECT');

// Next.js 빌드 및 실행 시 에러 방지용 프록시 객체 생성
const createDummyClient = () => {
  return new Proxy({} as any, {
    get: () => {
      return () => Promise.resolve({ data: null, error: new Error('Supabase URL이 유효하지 않습니다.') });
    }
  });
};

export const supabase = isValidUrl 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : createDummyClient();

// r1 ~ r24 등 mock 리소스 ID를 Supabase UUID 표준 포맷으로 맵핑하는 헬퍼
export function toUUID(id: string): string {
  if (id.startsWith('r') && !isNaN(Number(id.slice(1)))) {
    const num = id.slice(1).padStart(12, '0');
    return `11111111-1111-1111-1111-${num}`;
  }
  return id;
}

export function fromUUID(uuid: string): string {
  if (uuid && uuid.startsWith('11111111-1111-1111-1111-')) {
    const numStr = uuid.split('-').pop() || '';
    const num = parseInt(numStr, 10);
    return `r${num}`;
  }
  return uuid;
}

