import type { PptSlide } from '@/types'

export interface TemplateRecord {
  id: string
  name: string
  category: string
  primary_color: string
  accent_color: string
  background_color: string
  text_color: string
  font_title: string
  font_body: string
  gradient: string | null
  ai_guide: string | null
  file_url: string | null
  is_active: boolean
}

const CACHE_KEY = 'ppt_templates_cache'
const CACHE_TTL = 5 * 60 * 1000

const FALLBACK_TEMPLATES: TemplateRecord[] = [
  { id: 'modern', name: '모던', category: 'general', primary_color: '1B3A5C', accent_color: '4A90D9', background_color: 'FFFFFF', text_color: '1A1A2E', font_title: 'Malgun Gothic', font_body: 'Malgun Gothic', gradient: 'from-[#1B3A5C] to-[#4A90D9]', ai_guide: '깔끔하고 전문적인 비즈니스 스타일.', file_url: null, is_active: true },
  { id: 'warm', name: '웜', category: 'general', primary_color: '8D7A5B', accent_color: 'C4A882', background_color: 'FDF8F0', text_color: '2C2A29', font_title: 'Nanum Myeongjo', font_body: 'Malgun Gothic', gradient: 'from-[#8D7A5B] to-[#C4A882]', ai_guide: '따뜻하고 포근한 감성의 웜톤 디자인.', file_url: null, is_active: true },
  { id: 'classic', name: '클래식', category: 'general', primary_color: '6B2737', accent_color: 'C9A84C', background_color: 'FAFAF5', text_color: '1A1A2E', font_title: 'Nanum Myeongjo', font_body: 'Nanum Gothic', gradient: 'from-[#6B2737] to-[#C9A84C]', ai_guide: '전통적이고 품위 있는 클래식 스타일.', file_url: null, is_active: true },
  { id: 'minimal', name: '미니멀', category: 'general', primary_color: '1E293B', accent_color: '475569', background_color: 'FFFFFF', text_color: '334155', font_title: 'Pretendard', font_body: 'Pretendard', gradient: 'from-[#1E293B] to-[#475569]', ai_guide: '심플하고 모던한 미니멀 디자인.', file_url: null, is_active: true },
  { id: 'vibrant', name: '비비드', category: 'general', primary_color: '4A0E5C', accent_color: '9333EA', background_color: 'FFFFFF', text_color: '3B0764', font_title: 'Malgun Gothic', font_body: 'Malgun Gothic', gradient: 'from-[#4A0E5C] to-[#9333EA]', ai_guide: '화려하고 생동감 있는 비비드 스타일.', file_url: null, is_active: true },
  { id: 'dark', name: '다크', category: 'general', primary_color: '0F172A', accent_color: '38BDF8', background_color: '0F172A', text_color: 'E2E8F0', font_title: 'Pretendard', font_body: 'Pretendard', gradient: 'from-[#020617] to-[#0F172A]', ai_guide: '세련되고 몰입감 있는 다크 테마.', file_url: null, is_active: true },
  { id: 'elegant', name: '엘레강스', category: 'general', primary_color: '0D3320', accent_color: '059669', background_color: 'FFFFFF', text_color: '1F3A2F', font_title: 'Nanum Myeongjo', font_body: 'Malgun Gothic', gradient: 'from-[#0D3320] to-[#059669]', ai_guide: '자연에서 영감 받은 우아한 디자인.', file_url: null, is_active: true },
  
  // 설교 전용 명품 테마 10종
  { id: 'sacred_grace', name: '은혜와 진리', category: 'sermon', primary_color: '1E3A2F', accent_color: 'D4AF37', background_color: 'FAF9F5', text_color: '2C3531', font_title: 'Nanum Myeongjo', font_body: 'Pretendard', gradient: 'from-[#1E3A2F] to-[#D4AF37]', ai_guide: '대예배 및 성찬식, 절기 예배에 잘 어울리는 경건한 스타일입니다. 제목은 묵직한 명조체로 깊은 신뢰감을 주고, 본문은 가독성이 뛰어난 서체로 깔끔하게 전달합니다.', file_url: null, is_active: true },
  { id: 'modern_liturgy', name: '현대적 성막', category: 'sermon', primary_color: '0F172A', accent_color: 'F59E0B', background_color: '0B0F19', text_color: 'F8FAFC', font_title: 'Pretendard', font_body: 'Pretendard', gradient: 'from-[#0B0F19] to-[#1E293B]', ai_guide: '청년 예배나 찬양 집회에 최적화된 고급스러운 다크 모드 스타일입니다. 어두운 배경에 황금빛(Amber) 포인트를 주어 메시지 몰입도를 극대화합니다.', file_url: null, is_active: true },
  { id: 'peaceful_pasture', name: '푸른 초장', category: 'sermon', primary_color: '3A5F43', accent_color: 'E29578', background_color: 'F6F8F5', text_color: '2D3A31', font_title: 'Pretendard', font_body: 'Pretendard', gradient: 'from-[#3A5F43] to-[#E29578]', ai_guide: '마음을 편안하게 해주는 올리브 그린과 웜 코랄 컬러 조합입니다. 소그룹 모임, 교육 세미나, 따뜻하고 친근한 분위기의 설교에 적합합니다.', file_url: null, is_active: true },
  { id: 'dawn_prayer', name: '새벽의 묵상', category: 'sermon', primary_color: '3D3245', accent_color: 'A78BFA', background_color: 'F5F3F7', text_color: '2E2735', font_title: 'Nanum Myeongjo', font_body: 'Pretendard', gradient: 'from-[#3D3245] to-[#A78BFA]', ai_guide: '새벽기도회, 사순절 등 깊은 묵상과 기도가 중심이 되는 예배에 어울립니다. 진중한 플럼 퍼플 컬러가 성경의 무게감과 성찰을 품격 있게 표현해줍니다.', file_url: null, is_active: true },
  { id: 'heavenly_light', name: '천국의 빛', category: 'sermon', primary_color: '1E3A8A', accent_color: 'F97316', background_color: 'F0F9FF', text_color: '1E293B', font_title: 'Pretendard', font_body: 'Pretendard', gradient: 'from-[#1E3A8A] to-[#F97316]', ai_guide: '부활절, 추수감사절 등 하나님의 영광과 기쁨을 찬양하는 밝고 화사한 경축의 메시지에 알맞은 블루 & 오렌지 테마입니다.', file_url: null, is_active: true },
  { id: 'covenant_rainbow', name: '언약의 무지개', category: 'sermon', primary_color: '4F46E5', accent_color: 'EC4899', background_color: 'FDF2F8', text_color: '312E81', font_title: 'Pretendard', font_body: 'Pretendard', gradient: 'from-[#4F46E5] to-[#EC4899]', ai_guide: '교회학교, 어린이 예배, 성경학교 설교에 어울리며, 화사하고 부드러운 파스텔톤 컬러로 자녀들의 흥미와 집중을 이끌어냅니다.', file_url: null, is_active: true },
  { id: 'sandy_cross', name: '광야의 여정', category: 'sermon', primary_color: '4A3728', accent_color: 'D97706', background_color: 'F5EBE0', text_color: '3E2A1C', font_title: 'Nanum Myeongjo', font_body: 'Pretendard', gradient: 'from-[#4A3728] to-[#D97706]', ai_guide: '광야에서의 신앙의 단련, 결단, 참된 순종의 의미를 나누는 고요하고 깊이 있는 설교에 깊은 샌드 브라운 컬러로 정중하게 메시지를 전합니다.', file_url: null, is_active: true },
  { id: 'eternal_hope', name: '영원한 소망', category: 'sermon', primary_color: '0F766E', accent_color: '2DD4BF', background_color: 'F0FDFA', text_color: '115E59', font_title: 'Pretendard', font_body: 'Pretendard', gradient: 'from-[#0F766E] to-[#2DD4BF]', ai_guide: '새 생명 축제, 전도 주일, 비전 선포 등 생명력 있고 소망에 가득 찬 주제의 메시지에 적합한 맑고 시원한 틸(Teal) 그린 계열 테마입니다.', file_url: null, is_active: true },
  { id: 'royal_priesthood', name: '왕 같은 제사장', category: 'sermon', primary_color: '3B0764', accent_color: 'EAB308', background_color: 'FAF5FF', text_color: '2E1065', font_title: 'Nanum Myeongjo', font_body: 'Pretendard', gradient: 'from-[#3B0764] to-[#EAB308]', ai_guide: '성도의 정체성, 승리의 신앙, 은혜의 영광 등 기품 있고 깊은 권위가 느껴지는 주제 설교에 알맞은 로열 퍼플과 황금색 테마입니다.', file_url: null, is_active: true },
  { id: 'silent_night', name: '성탄의 밤', category: 'sermon', primary_color: '111827', accent_color: 'FB923C', background_color: '0F172A', text_color: 'F9FAFB', font_title: 'Nanum Myeongjo', font_body: 'Pretendard', gradient: 'from-[#0F172A] to-[#FB923C]', ai_guide: '성탄 예배, 송구영신 촛불 예배, 묵상 기도회 등 조용하고 평안한 밤하늘 분위기 속에 따뜻한 불빛의 메시지를 강조하는 다크 테마입니다.', file_url: null, is_active: true }
]

interface CacheData {
  templates: TemplateRecord[]
  timestamp: number
}

export async function getTemplates(): Promise<TemplateRecord[]> {
  const cached = localStorage.getItem(CACHE_KEY)
  if (cached) {
    try {
      const data: CacheData = JSON.parse(cached)
      if (Date.now() - data.timestamp < CACHE_TTL) {
        return data.templates
      }
    } catch { }
  }

  try {
    const res = await fetch('/api/admin/templates')
    if (!res.ok) throw new Error('Fetch failed')
    const data = await res.json()
    const templates: TemplateRecord[] = data.templates || data.data || []
    localStorage.setItem(CACHE_KEY, JSON.stringify({ templates, timestamp: Date.now() }))
    return templates
  } catch {
    return FALLBACK_TEMPLATES
  }
}

export function invalidateCache() {
  localStorage.removeItem(CACHE_KEY)
  localStorage.removeItem('ppt_templates_cache_timestamp')
}

export function getFallbackTemplates(): TemplateRecord[] {
  return FALLBACK_TEMPLATES
}

export function applyTemplate(slide: PptSlide, template: TemplateRecord): PptSlide {
  return {
    ...slide,
    titleStyle: {
      fontFace: template.font_title,
      fontSize: slide.titleStyle?.fontSize || 32,
      bold: true,
      italic: false,
      underline: false,
      color: template.primary_color,
      align: slide.titleStyle?.align || 'center',
    },
    bodyStyle: {
      fontFace: template.font_body,
      fontSize: slide.bodyStyle?.fontSize || 16,
      bold: false,
      italic: false,
      underline: false,
      color: template.text_color,
      align: slide.bodyStyle?.align || 'left',
    },
    color: {
      primary: template.primary_color,
      accent: template.accent_color,
      background: template.background_color,
    },
  }
}
