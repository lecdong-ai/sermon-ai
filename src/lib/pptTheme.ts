export type PPTThemeKey = 'modern' | 'classic' | 'minimal' | 'vibrant' | 'dark' | 'elegant'

export interface PPTTheme {
  cover: {
    bg: string
    accentBg: string
    titleColor: string
    subtitleColor: string
    dateColor: string
  }
  content: {
    bg: string
    titleColor: string
    bodyColor: string
    accentColor: string
    accentLight: string
    dividerColor: string
    bulletColor: string
  }
  toc: {
    bg: string
    titleColor: string
    itemColor: string
    accentColor: string
  }
  end: {
    bg: string
    titleColor: string
    subtitleColor: string
    iconColor: string
  }
  styles: Record<'list' | 'scripture' | 'highlight' | 'apply', {
    bg: string
    titleColor: string
    bodyColor: string
    accentBar: string
  }>
  font: {
    face: string
    title: number
    subtitle: number
    body: number
    small: number
    tiny: number
    tocTitle: number
    tocItem: number
    coverTitle: number
    coverSubtitle: number
    scriptureTitle: number
    scriptureBody: number
  }
  layout: {
    slideWidth: number
    slideHeight: number
    marginX: number
    marginY: number
    contentWidth: number
    centerX: number
    contentHeight: number
    titleHeight: number
    titleTop: number
    contentTop: number
    accentBar: number
  }
}

const L = {
  slideWidth: 13.333,
  slideHeight: 7.5,
  marginX: 0.8,
  marginY: 0.3,
  contentWidth: 11.733,
  centerX: 6.667,
  contentHeight: 5.2,
  titleHeight: 0.7,
  titleTop: 0.3,
  contentTop: 1.2,
  accentBar: 0.1,
}

const F = {
  face: 'Noto Sans KR',
  title: 36,
  subtitle: 26,
  body: 26,
  small: 18,
  tiny: 14,
  tocTitle: 38,
  tocItem: 24,
  coverTitle: 48,
  coverSubtitle: 30,
  scriptureTitle: 28,
  scriptureBody: 24,
}

export const PPT_THEMES: Record<PPTThemeKey, PPTTheme> = {
  modern: {
    cover: { bg: '0F1B3D', accentBg: '1A3A6B', titleColor: 'FFFFFF', subtitleColor: 'B0C4DF', dateColor: '8BA4C7' },
    content: { bg: 'FFFFFF', titleColor: '1a3a6b', bodyColor: '2D3748', accentColor: '3182F6', accentLight: 'EBF4FF', dividerColor: 'E2E8F0', bulletColor: '4A5568' },
    toc: { bg: 'F0F4FA', titleColor: '1a3a6b', itemColor: '2D3748', accentColor: '3182F6' },
    end: { bg: '0F1B3D', titleColor: 'FFFFFF', subtitleColor: 'B0C4DF', iconColor: 'F6E05E' },
    styles: {
      list: { bg: 'FFFFFF', titleColor: '1a3a6b', bodyColor: '2D3748', accentBar: '3182F6' },
      scripture: { bg: '0F1B3D', titleColor: 'F6E05E', bodyColor: 'E2EDFF', accentBar: 'F6E05E' },
      highlight: { bg: 'EBF4FF', titleColor: '1a3a6b', bodyColor: '1A3A6B', accentBar: '3182F6' },
      apply: { bg: 'F0FFF4', titleColor: '276749', bodyColor: '22543D', accentBar: '38A169' },
    },
    font: F, layout: L,
  },

  classic: {
    cover: { bg: '2D1810', accentBg: '5C3A21', titleColor: 'FFF8F0', subtitleColor: 'D4B896', dateColor: 'B8956A' },
    content: { bg: 'FFFEF5', titleColor: '5C3A21', bodyColor: '3D2B1F', accentColor: 'B8860B', accentLight: 'FFF8E1', dividerColor: 'E8D5B7', bulletColor: '6B5B4E' },
    toc: { bg: 'FDF6EC', titleColor: '5C3A21', itemColor: '3D2B1F', accentColor: 'B8860B' },
    end: { bg: '2D1810', titleColor: 'FFF8F0', subtitleColor: 'D4B896', iconColor: 'DAA520' },
    styles: {
      list: { bg: 'FFFEF5', titleColor: '5C3A21', bodyColor: '3D2B1F', accentBar: 'B8860B' },
      scripture: { bg: '2D1810', titleColor: 'DAA520', bodyColor: 'F5E6D3', accentBar: 'DAA520' },
      highlight: { bg: 'FFF8E1', titleColor: '5C3A21', bodyColor: '5C3A21', accentBar: 'D4A017' },
      apply: { bg: 'F4F7E6', titleColor: '3D6B35', bodyColor: '2D4F25', accentBar: '6B8E23' },
    },
    font: F, layout: L,
  },

  minimal: {
    cover: { bg: '1E293B', accentBg: '334155', titleColor: 'F1F5F9', subtitleColor: '94A3B8', dateColor: '64748B' },
    content: { bg: 'FFFFFF', titleColor: '1E293B', bodyColor: '334155', accentColor: '475569', accentLight: 'F1F5F9', dividerColor: 'E2E8F0', bulletColor: '64748B' },
    toc: { bg: 'F8FAFC', titleColor: '1E293B', itemColor: '334155', accentColor: '475569' },
    end: { bg: '1E293B', titleColor: 'F1F5F9', subtitleColor: '94A3B8', iconColor: 'CBD5E1' },
    styles: {
      list: { bg: 'FFFFFF', titleColor: '1E293B', bodyColor: '334155', accentBar: '475569' },
      scripture: { bg: '1E293B', titleColor: 'CBD5E1', bodyColor: 'E2E8F0', accentBar: '94A3B8' },
      highlight: { bg: 'F1F5F9', titleColor: '1E293B', bodyColor: '1E293B', accentBar: '64748B' },
      apply: { bg: 'F0FDF4', titleColor: '166534', bodyColor: '14532D', accentBar: '22C55E' },
    },
    font: F, layout: L,
  },

  vibrant: {
    cover: { bg: '2D0A33', accentBg: '5B1A6E', titleColor: 'FFFFFF', subtitleColor: 'D8B4FE', dateColor: 'A855F7' },
    content: { bg: 'FFFFFF', titleColor: '4A0E5C', bodyColor: '3B0764', accentColor: '9333EA', accentLight: 'F3E8FF', dividerColor: 'E9D5FF', bulletColor: '7C3AED' },
    toc: { bg: 'FAF5FF', titleColor: '4A0E5C', itemColor: '3B0764', accentColor: '9333EA' },
    end: { bg: '2D0A33', titleColor: 'FFFFFF', subtitleColor: 'D8B4FE', iconColor: 'F472B6' },
    styles: {
      list: { bg: 'FFFFFF', titleColor: '4A0E5C', bodyColor: '3B0764', accentBar: '9333EA' },
      scripture: { bg: '2D0A33', titleColor: 'F472B6', bodyColor: 'F3E8FF', accentBar: 'D8B4FE' },
      highlight: { bg: 'FDF4FF', titleColor: '4A0E5C', bodyColor: '5B1A6E', accentBar: 'D946EF' },
      apply: { bg: 'FFF0F0', titleColor: '9D174D', bodyColor: '831843', accentBar: 'EC4899' },
    },
    font: F, layout: L,
  },

  dark: {
    cover: { bg: '020617', accentBg: '0F172A', titleColor: 'F8FAFC', subtitleColor: '64748B', dateColor: '475569' },
    content: { bg: '0F172A', titleColor: 'E2E8F0', bodyColor: 'CBD5E1', accentColor: '38BDF8', accentLight: '0C4A6E', dividerColor: '1E293B', bulletColor: '94A3B8' },
    toc: { bg: '0A0F1E', titleColor: 'E2E8F0', itemColor: 'CBD5E1', accentColor: '38BDF8' },
    end: { bg: '020617', titleColor: 'F8FAFC', subtitleColor: '64748B', iconColor: '38BDF8' },
    styles: {
      list: { bg: '0F172A', titleColor: 'E2E8F0', bodyColor: 'CBD5E1', accentBar: '38BDF8' },
      scripture: { bg: '020617', titleColor: 'FBBF24', bodyColor: 'E0F2FE', accentBar: 'FBBF24' },
      highlight: { bg: '082F49', titleColor: 'BAE6FD', bodyColor: 'E0F2FE', accentBar: '0EA5E9' },
      apply: { bg: '052E16', titleColor: '86EFAC', bodyColor: 'BBF7D0', accentBar: '22C55E' },
    },
    font: F, layout: L,
  },

  elegant: {
    cover: { bg: '0D3320', accentBg: '1A4D33', titleColor: 'F0FFF4', subtitleColor: 'A7F3D0', dateColor: '6EE7B7' },
    content: { bg: 'FFFFFF', titleColor: '0D3320', bodyColor: '1F3A2F', accentColor: '059669', accentLight: 'ECFDF5', dividerColor: 'D1FAE5', bulletColor: '047857' },
    toc: { bg: 'ECFDF5', titleColor: '0D3320', itemColor: '1F3A2F', accentColor: '059669' },
    end: { bg: '0D3320', titleColor: 'F0FFF4', subtitleColor: 'A7F3D0', iconColor: '34D399' },
    styles: {
      list: { bg: 'FFFFFF', titleColor: '0D3320', bodyColor: '1F3A2F', accentBar: '059669' },
      scripture: { bg: '0D3320', titleColor: 'FDE047', bodyColor: 'D1FAE5', accentBar: 'FDE047' },
      highlight: { bg: 'ECFDF5', titleColor: '064E3B', bodyColor: '0D3320', accentBar: '10B981' },
      apply: { bg: 'F0FDF4', titleColor: '166534', bodyColor: '14532D', accentBar: '22C55E' },
    },
    font: F, layout: L,
  },
}

export const PPT_THEME_KEYS: PPTThemeKey[] = ['modern', 'classic', 'minimal', 'vibrant', 'dark', 'elegant']

export const PPT_THEME_META: Record<PPTThemeKey, { name: string; accent: string; light: string; gradient: string }> = {
  modern:  { name: '모던',   accent: '#4F46E5', light: '#EEF2FF', gradient: 'from-indigo-50 via-white to-white' },
  classic: { name: '클래식', accent: '#B8860B', light: '#FFFBEB', gradient: 'from-amber-50 via-white to-white' },
  minimal: { name: '미니멀', accent: '#1E293B', light: '#F8FAFC', gradient: 'from-slate-50 via-white to-white' },
  vibrant: { name: '비비드', accent: '#9333EA', light: '#FAF5FF', gradient: 'from-purple-50 via-white to-white' },
  dark:    { name: '다크',   accent: '#38BDF8', light: '#0F172A', gradient: 'from-slate-900 via-slate-800 to-slate-900' },
  elegant: { name: '엘레강스', accent: '#059669', light: '#ECFDF5', gradient: 'from-emerald-50 via-white to-white' },
}
