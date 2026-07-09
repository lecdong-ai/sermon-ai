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
