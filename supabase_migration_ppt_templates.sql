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
('엘레강스', 'general', '0D3320', '059669', 'FFFFFF', '1F3A2F', 'Nanum Myeongjo', 'Malgun Gothic', 'from-[#0D3320] to-[#059669]', '자연에서 영감 받은 우아한 디자인. 에메랄드 그린 계열이 차분한 신뢰감을 줍니다.'),
('은혜와 진리', 'sermon', '1E3A2F', 'D4AF37', 'FAF9F5', '2C3531', 'Nanum Myeongjo', 'Pretendard', 'from-[#1E3A2F] to-[#D4AF37]', '대예배 및 성찬식, 절기 예배에 잘 어울리는 경건한 스타일입니다. 제목은 묵직한 명조체로 깊은 신뢰감을 주고, 본문은 가독성이 뛰어난 서체로 깔끔하게 전달합니다.'),
('현대적 성막', 'sermon', '0F172A', 'F59E0B', '0B0F19', 'F8FAFC', 'Pretendard', 'Pretendard', 'from-[#0B0F19] to-[#1E293B]', '청년 예배나 찬양 집회에 최적화된 고급스러운 다크 모드 스타일입니다. 어두운 배경에 황금빛(Amber) 포인트를 주어 메시지 몰입도를 극대화합니다.'),
('푸른 초장', 'sermon', '3A5F43', 'E29578', 'F6F8F5', '2D3A31', 'Pretendard', 'Pretendard', 'from-[#3A5F43] to-[#E29578]', '마음을 편안하게 해주는 올리브 그린과 웜 코랄 컬러 조합입니다. 소그룹 모임, 교육 세미나, 따뜻하고 친근한 분위기의 설교에 적합합니다.'),
('새벽의 묵상', 'sermon', '3D3245', 'A78BFA', 'F5F3F7', '2E2735', 'Nanum Myeongjo', 'Pretendard', 'from-[#3D3245] to-[#A78BFA]', '새벽기도회, 사순절 등 깊은 묵상과 기도가 중심이 되는 예배에 어울립니다. 진중한 플럼 퍼플 컬러가 성경의 무게감과 성찰을 품격 있게 표현해줍니다.'),
('천국의 빛', 'sermon', '1E3A8A', 'F97316', 'F0F9FF', '1E293B', 'Pretendard', 'Pretendard', 'from-[#1E3A8A] to-[#F97316]', '부활절, 추수감사절 등 하나님의 영광과 기쁨을 찬양하는 밝고 화사한 경축의 메시지에 알맞은 블루 & 오렌지 테마입니다.'),
('언약의 무지개', 'sermon', '4F46E5', 'EC4899', 'FDF2F8', '312E81', 'Pretendard', 'Pretendard', 'from-[#4F46E5] to-[#EC4899]', '교회학교, 어린이 예배, 성경학교 설교에 어울리며, 화사하고 부드러운 파스텔톤 컬러로 자녀들의 흥미와 집중을 이끌어냅니다.'),
('광야의 여정', 'sermon', '4A3728', 'D97706', 'F5EBE0', '3E2A1C', 'Nanum Myeongjo', 'Pretendard', 'from-[#4A3728] to-[#D97706]', '광야에서의 신앙의 단련, 결단, 참된 순종의 의미를 나누는 고요하고 깊이 있는 설교에 깊은 샌드 브라운 컬러로 정중하게 메시지를 전합니다.'),
('영원한 소망', 'sermon', '0F766E', '2DD4BF', 'F0FDFA', '115E59', 'Pretendard', 'Pretendard', 'from-[#0F766E] to-[#2DD4BF]', '새 생명 축제, 전도 주일, 비전 선포 등 생명력 있고 소망에 가득 찬 주제의 메시지에 적합한 맑고 시원한 틸(Teal) 그린 계열 테마입니다.'),
('왕 같은 제사장', 'sermon', '3B0764', 'EAB308', 'FAF5FF', '2E1065', 'Nanum Myeongjo', 'Pretendard', 'from-[#3B0764] to-[#EAB308]', '성도의 정체성, 승리의 신앙, 은혜의 영광 등 기품 있고 깊은 권위가 느껴지는 주제 설교에 알맞은 로열 퍼플과 황금색 테마입니다.'),
('성탄의 밤', 'sermon', '111827', 'FB923C', '0F172A', 'F9FAFB', 'Nanum Myeongjo', 'Pretendard', 'from-[#0F172A] to-[#FB923C]', '성탄 예배, 송구영신 촛불 예배, 묵상 기도회 등 조용하고 평안한 밤하늘 분위기 속에 따뜻한 불빛의 메시지를 강조하는 다크 테마입니다.')
ON CONFLICT DO NOTHING;
