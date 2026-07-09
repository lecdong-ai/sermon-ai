-- ppt_templates 테이블 생성 + 시드 데이터
CREATE TABLE IF NOT EXISTS ppt_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  primary_color TEXT NOT NULL DEFAULT '1B3A5C',
  accent_color TEXT NOT NULL DEFAULT '4A90D9',
  background_color TEXT NOT NULL DEFAULT 'FFFFFF',
  text_color TEXT NOT NULL DEFAULT '1A1A2E',
  font_title TEXT NOT NULL DEFAULT 'Malgun Gothic',
  font_body TEXT NOT NULL DEFAULT 'Malgun Gothic',
  gradient TEXT,
  ai_guide TEXT,
  file_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed data: 7 default templates matching @/lib/templates.ts
INSERT INTO ppt_templates (name, category, primary_color, accent_color, background_color, text_color, font_title, font_body, gradient, ai_guide) VALUES
('모던', 'general', '1B3A5C', '4A90D9', 'FFFFFF', '1A1A2E', 'Malgun Gothic', 'Malgun Gothic', 'from-[#1B3A5C] to-[#4A90D9]', '깔끔하고 전문적인 비즈니스 스타일. 진한 네이비와 블루 포인트를 활용한 신뢰감 있는 디자인.'),
('웜', 'general', '8D7A5B', 'C4A882', 'FDF8F0', '2C2A29', 'Nanum Myeongjo', 'Malgun Gothic', 'from-[#8D7A5B] to-[#C4A882]', '따뜻하고 포근한 감성의 웜톤 디자인. 브라운 계열 포인트와 명조체 제목이 조화를 이룹니다.'),
('클래식', 'general', '6B2737', 'C9A84C', 'FAFAF5', '1A1A2E', 'Nanum Myeongjo', 'Nanum Gothic', 'from-[#6B2737] to-[#C9A84C]', '전통적이고 품위 있는 클래식 스타일. 버건디와 골드 포인트가 고급스러움을 더합니다.'),
('미니멀', 'general', '1E293B', '475569', 'FFFFFF', '334155', 'Pretendard', 'Pretendard', 'from-[#1E293B] to-[#475569]', '심플하고 모던한 미니멀 디자인. 슬레이트 계열 무채색으로 콘텐츠에 집중도를 높입니다.'),
('비비드', 'general', '4A0E5C', '9333EA', 'FFFFFF', '3B0764', 'Malgun Gothic', 'Malgun Gothic', 'from-[#4A0E5C] to-[#9333EA]', '화려하고 생동감 있는 비비드 스타일. 퍼플 계열 강렬한 포인트가 시선을 사로잡습니다.'),
('다크', 'general', '0F172A', '38BDF8', '0F172A', 'E2E8F0', 'Pretendard', 'Pretendard', 'from-[#020617] to-[#0F172A]', '세련되고 몰입감 있는 다크 테마. 네이비 블랙 배경에 블루 포인트가 강조됩니다.'),
('엘레강스', 'general', '0D3320', '059669', 'FFFFFF', '1F3A2F', 'Nanum Myeongjo', 'Malgun Gothic', 'from-[#0D3320] to-[#059669]', '자연에서 영감 받은 우아한 디자인. 에메랄드 그린 계열이 차분한 신뢰감을 줍니다.')
ON CONFLICT DO NOTHING;
