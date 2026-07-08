import type { PptSlide } from '@/types/workspace'

export type TemplateKey = 'modern' | 'warm' | 'classic' | 'minimal' | 'vibrant' | 'dark' | 'elegant'

export interface TemplateTheme {
  name: string
  primary: string
  accent: string
  background: string
  text: string
  fontTitle: string
  fontBody: string
  divider: string
  gradient: string
}

export const TEMPLATES: Record<TemplateKey, TemplateTheme> = {
  modern: {
    name: '모던',
    primary: '1B3A5C',
    accent: '4A90D9',
    background: 'FFFFFF',
    text: '1A1A2E',
    fontTitle: 'Malgun Gothic',
    fontBody: 'Malgun Gothic',
    divider: 'E8F0FE',
    gradient: 'from-[#1B3A5C] to-[#4A90D9]',
  },
  warm: {
    name: '웜',
    primary: '8D7A5B',
    accent: 'C4A882',
    background: 'FDF8F0',
    text: '2C2A29',
    fontTitle: 'Nanum Myeongjo',
    fontBody: 'Malgun Gothic',
    divider: 'F5EDE0',
    gradient: 'from-[#8D7A5B] to-[#C4A882]',
  },
  classic: {
    name: '클래식',
    primary: '6B2737',
    accent: 'C9A84C',
    background: 'FAFAF5',
    text: '1A1A2E',
    fontTitle: 'Nanum Myeongjo',
    fontBody: 'Nanum Gothic',
    divider: 'F0E6D3',
    gradient: 'from-[#6B2737] to-[#C9A84C]',
  },
  minimal: {
    name: '미니멀',
    primary: '1E293B',
    accent: '475569',
    background: 'FFFFFF',
    text: '334155',
    fontTitle: 'Pretendard',
    fontBody: 'Pretendard',
    divider: 'E2E8F0',
    gradient: 'from-[#1E293B] to-[#475569]',
  },
  vibrant: {
    name: '비비드',
    primary: '4A0E5C',
    accent: '9333EA',
    background: 'FFFFFF',
    text: '3B0764',
    fontTitle: 'Malgun Gothic',
    fontBody: 'Malgun Gothic',
    divider: 'E9D5FF',
    gradient: 'from-[#4A0E5C] to-[#9333EA]',
  },
  dark: {
    name: '다크',
    primary: '0F172A',
    accent: '38BDF8',
    background: '0F172A',
    text: 'E2E8F0',
    fontTitle: 'Pretendard',
    fontBody: 'Pretendard',
    divider: '1E293B',
    gradient: 'from-[#020617] to-[#0F172A]',
  },
  elegant: {
    name: '엘레강스',
    primary: '0D3320',
    accent: '059669',
    background: 'FFFFFF',
    text: '1F3A2F',
    fontTitle: 'Nanum Myeongjo',
    fontBody: 'Malgun Gothic',
    divider: 'D1FAE5',
    gradient: 'from-[#0D3320] to-[#059669]',
  },
}

export function applyTemplate(slide: PptSlide, templateKey: TemplateKey): PptSlide {
  const t = TEMPLATES[templateKey]
  return {
    ...slide,
    titleStyle: {
      fontFace: t.fontTitle,
      fontSize: slide.titleStyle?.fontSize || 32,
      bold: true,
      italic: false,
      underline: false,
      color: t.primary,
      align: slide.titleStyle?.align || 'center',
    },
    bodyStyle: {
      fontFace: t.fontBody,
      fontSize: slide.bodyStyle?.fontSize || 16,
      bold: false,
      italic: false,
      underline: false,
      color: t.text,
      align: slide.bodyStyle?.align || 'left',
    },
    color: {
      primary: t.primary,
      accent: t.accent,
      background: t.background,
    },
  }
}
