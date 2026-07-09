'use client'

import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import SectionCard from '@/components/workspace/SectionCard'
import {
  ChevronLeft, ChevronRight, Download, FileText, Palette,
  Sparkles, BookOpen, Heart, Quote, Flag,
  Maximize2, Pencil, Check,
} from 'lucide-react'
import type { CardNews, CardSlide } from '@/types/workspace'

interface Props {
  data: CardNews
}

type ThemeKey = 'modern' | 'classic' | 'emotional'
  | 'sacred_grace' | 'modern_liturgy' | 'peaceful_pasture' | 'dawn_prayer'
  | 'heavenly_light' | 'covenant_rainbow' | 'sandy_cross' | 'eternal_hope'
  | 'royal_priesthood' | 'silent_night'

type SizeKey = '4:5' | '1:1' | '9:16'

const CARD_TYPE_ICONS: Record<string, typeof Sparkles> = {
  '커버': Sparkles,
  '본문': BookOpen,
  '적용': Heart,
  '말씀요약': Quote,
  '마무리': Flag,
}

interface ThemeDef {
  name: string
  emoji: string
  headers: Record<string, string>
  badges: Record<string, string>
  bodyBg: Record<string, string>
  accent: string
}

const THEMES: Record<ThemeKey, ThemeDef> = {
  modern: {
    name: '모던', emoji: '🔷',
    headers: {
      '커버': 'from-indigo-500 via-purple-500 to-pink-500',
      '본문': 'from-blue-500 to-indigo-500',
      '적용': 'from-emerald-500 to-teal-500',
      '말씀요약': 'from-violet-500 to-purple-500',
      '마무리': 'from-amber-500 to-orange-500',
    },
    badges: {
      '커버': 'bg-white/20 text-white',
      '본문': 'bg-blue-100 text-blue-700',
      '적용': 'bg-emerald-100 text-emerald-700',
      '말씀요약': 'bg-violet-100 text-violet-700',
      '마무리': 'bg-amber-100 text-amber-700',
    },
    bodyBg: {
      '커버': 'from-indigo-50 to-purple-50',
      '본문': 'from-blue-50 to-indigo-50',
      '적용': 'from-emerald-50 to-teal-50',
      '말씀요약': 'from-violet-50 to-purple-50',
      '마무리': 'from-amber-50 to-orange-50',
    },
    accent: '#6366f1',
  },
  classic: {
    name: '클래식', emoji: '🏛️',
    headers: {
      '커버': 'from-amber-800 via-yellow-700 to-stone-700',
      '본문': 'from-stone-700 to-amber-900',
      '적용': 'from-emerald-800 to-teal-800',
      '말씀요약': 'from-amber-700 to-stone-800',
      '마무리': 'from-rose-800 to-stone-700',
    },
    badges: {
      '커버': 'bg-white/20 text-white',
      '본문': 'bg-stone-100 text-stone-700',
      '적용': 'bg-emerald-100 text-emerald-700',
      '말씀요약': 'bg-amber-100 text-amber-700',
      '마무리': 'bg-rose-100 text-rose-700',
    },
    bodyBg: {
      '커버': 'from-stone-50 to-amber-50',
      '본문': 'from-amber-50 to-stone-50',
      '적용': 'from-emerald-50 to-teal-50',
      '말씀요약': 'from-amber-50 to-yellow-50',
      '마무리': 'from-rose-50 to-stone-50',
    },
    accent: '#92400e',
  },
  emotional: {
    name: '감성', emoji: '🌸',
    headers: {
      '커버': 'from-rose-400 via-pink-500 to-purple-500',
      '본문': 'from-purple-400 to-indigo-500',
      '적용': 'from-teal-400 to-emerald-500',
      '말씀요약': 'from-pink-400 to-rose-500',
      '마무리': 'from-sky-400 to-indigo-500',
    },
    badges: {
      '커버': 'bg-white/20 text-white',
      '본문': 'bg-purple-100 text-purple-700',
      '적용': 'bg-teal-100 text-teal-700',
      '말씀요약': 'bg-pink-100 text-pink-700',
      '마무리': 'bg-sky-100 text-sky-700',
    },
    bodyBg: {
      '커버': 'from-rose-50 to-pink-50',
      '본문': 'from-purple-50 to-indigo-50',
      '적용': 'from-teal-50 to-emerald-50',
      '말씀요약': 'from-pink-50 to-rose-50',
      '마무리': 'from-sky-50 to-indigo-50',
    },
    accent: '#ec4899',
  },
  // ── 설교 전용 테마 10종 ──
  sacred_grace: {
    name: '은혜와 진리', emoji: '✝️',
    headers: {
      '커버': 'from-[#1E3A2F] via-[#2D5A3F] to-[#1E3A2F]',
      '본문': 'from-[#1E3A2F] to-[#2D5A3F]',
      '적용': 'from-[#2D5A3F] to-[#3A7050]',
      '말씀요약': 'from-[#1E3A2F] to-[#264A35]',
      '마무리': 'from-[#2D5A3F] to-[#1E3A2F]',
    },
    badges: {
      '커버': 'bg-white/20 text-white',
      '본문': 'bg-[#D4AF37]/20 text-[#D4AF37]',
      '적용': 'bg-[#D4AF37]/20 text-[#D4AF37]',
      '말씀요약': 'bg-[#D4AF37]/20 text-[#D4AF37]',
      '마무리': 'bg-white/20 text-white',
    },
    bodyBg: {
      '커버': 'from-[#FAF9F5] to-[#F5F3E8]',
      '본문': 'from-[#FAF9F5] to-[#F0EEE0]',
      '적용': 'from-[#F5F3E8] to-[#FAF9F5]',
      '말씀요약': 'from-[#F0EEE0] to-[#FAF9F5]',
      '마무리': 'from-[#FAF9F5] to-[#F5F3E8]',
    },
    accent: '#D4AF37',
  },
  modern_liturgy: {
    name: '현대적 성막', emoji: '🕯️',
    headers: {
      '커버': 'from-[#0F172A] via-[#1E293B] to-[#0F172A]',
      '본문': 'from-[#0F172A] to-[#1E293B]',
      '적용': 'from-[#1E293B] to-[#0F172A]',
      '말씀요약': 'from-[#0F172A] to-[#1E293B]',
      '마무리': 'from-[#1E293B] to-[#0F172A]',
    },
    badges: {
      '커버': 'bg-[#F59E0B]/20 text-[#F59E0B]',
      '본문': 'bg-[#F59E0B]/20 text-[#F59E0B]',
      '적용': 'bg-[#F59E0B]/20 text-[#F59E0B]',
      '말씀요약': 'bg-[#F59E0B]/20 text-[#F59E0B]',
      '마무리': 'bg-[#F59E0B]/20 text-[#F59E0B]',
    },
    bodyBg: {
      '커버': 'from-[#0B0F19] to-[#1E293B]',
      '본문': 'from-[#0B0F19] to-[#1E293B]',
      '적용': 'from-[#0B0F19] to-[#1E293B]',
      '말씀요약': 'from-[#0B0F19] to-[#1E293B]',
      '마무리': 'from-[#0B0F19] to-[#1E293B]',
    },
    accent: '#F59E0B',
  },
  peaceful_pasture: {
    name: '푸른 초장', emoji: '🌿',
    headers: {
      '커버': 'from-[#3A5F43] via-[#4A7053] to-[#3A5F43]',
      '본문': 'from-[#3A5F43] to-[#4A7053]',
      '적용': 'from-[#4A7053] to-[#3A5F43]',
      '말씀요약': 'from-[#3A5F43] to-[#3D6248]',
      '마무리': 'from-[#4A7053] to-[#3A5F43]',
    },
    badges: {
      '커버': 'bg-white/20 text-white',
      '본문': 'bg-[#E29578]/30 text-[#C75D3E]',
      '적용': 'bg-[#E29578]/30 text-[#C75D3E]',
      '말씀요약': 'bg-[#E29578]/30 text-[#C75D3E]',
      '마무리': 'bg-white/20 text-white',
    },
    bodyBg: {
      '커버': 'from-[#F6F8F5] to-[#E8F0E5]',
      '본문': 'from-[#F6F8F5] to-[#EDF2EB]',
      '적용': 'from-[#E8F0E5] to-[#F6F8F5]',
      '말씀요약': 'from-[#EDF2EB] to-[#F6F8F5]',
      '마무리': 'from-[#F6F8F5] to-[#E8F0E5]',
    },
    accent: '#E29578',
  },
  dawn_prayer: {
    name: '새벽의 묵상', emoji: '🌅',
    headers: {
      '커버': 'from-[#3D3245] via-[#4D3F55] to-[#3D3245]',
      '본문': 'from-[#3D3245] to-[#4D3F55]',
      '적용': 'from-[#4D3F55] to-[#3D3245]',
      '말씀요약': 'from-[#3D3245] to-[#42384A]',
      '마무리': 'from-[#4D3F55] to-[#3D3245]',
    },
    badges: {
      '커버': 'bg-white/20 text-white',
      '본문': 'bg-[#A78BFA]/30 text-[#8B6FD4]',
      '적용': 'bg-[#A78BFA]/30 text-[#8B6FD4]',
      '말씀요약': 'bg-[#A78BFA]/30 text-[#8B6FD4]',
      '마무리': 'bg-white/20 text-white',
    },
    bodyBg: {
      '커버': 'from-[#F5F3F7] to-[#EDE9F2]',
      '본문': 'from-[#F5F3F7] to-[#F0EDF5]',
      '적용': 'from-[#EDE9F2] to-[#F5F3F7]',
      '말씀요약': 'from-[#F0EDF5] to-[#F5F3F7]',
      '마무리': 'from-[#F5F3F7] to-[#EDE9F2]',
    },
    accent: '#A78BFA',
  },
  heavenly_light: {
    name: '천국의 빛', emoji: '☀️',
    headers: {
      '커버': 'from-[#1E3A8A] via-[#2563EB] to-[#1E3A8A]',
      '본문': 'from-[#1E3A8A] to-[#2563EB]',
      '적용': 'from-[#2563EB] to-[#1E3A8A]',
      '말씀요약': 'from-[#1E3A8A] to-[#2349A0]',
      '마무리': 'from-[#2563EB] to-[#1E3A8A]',
    },
    badges: {
      '커버': 'bg-white/20 text-white',
      '본문': 'bg-[#F97316]/20 text-[#F97316]',
      '적용': 'bg-[#F97316]/20 text-[#F97316]',
      '말씀요약': 'bg-[#F97316]/20 text-[#F97316]',
      '마무리': 'bg-white/20 text-white',
    },
    bodyBg: {
      '커버': 'from-[#F0F9FF] to-[#E0F2FE]',
      '본문': 'from-[#F0F9FF] to-[#E8F4FC]',
      '적용': 'from-[#E0F2FE] to-[#F0F9FF]',
      '말씀요약': 'from-[#E8F4FC] to-[#F0F9FF]',
      '마무리': 'from-[#F0F9FF] to-[#E0F2FE]',
    },
    accent: '#F97316',
  },
  covenant_rainbow: {
    name: '언약의 무지개', emoji: '🌈',
    headers: {
      '커버': 'from-[#4F46E5] via-[#6366F1] to-[#EC4899]',
      '본문': 'from-[#4F46E5] to-[#6366F1]',
      '적용': 'from-[#6366F1] to-[#4F46E5]',
      '말씀요약': 'from-[#4F46E5] to-[#5B54E8]',
      '마무리': 'from-[#6366F1] to-[#EC4899]',
    },
    badges: {
      '커버': 'bg-white/20 text-white',
      '본문': 'bg-pink-100 text-pink-600',
      '적용': 'bg-pink-100 text-pink-600',
      '말씀요약': 'bg-pink-100 text-pink-600',
      '마무리': 'bg-white/20 text-white',
    },
    bodyBg: {
      '커버': 'from-[#FDF2F8] to-[#F5F3FF]',
      '본문': 'from-[#F5F3FF] to-[#FDF2F8]',
      '적용': 'from-[#FDF2F8] to-[#F5F3FF]',
      '말씀요약': 'from-[#F5F3FF] to-[#FDF2F8]',
      '마무리': 'from-[#FDF2F8] to-[#F5F3FF]',
    },
    accent: '#EC4899',
  },
  sandy_cross: {
    name: '광야의 여정', emoji: '🏜️',
    headers: {
      '커버': 'from-[#4A3728] via-[#5C4733] to-[#4A3728]',
      '본문': 'from-[#4A3728] to-[#5C4733]',
      '적용': 'from-[#5C4733] to-[#4A3728]',
      '말씀요약': 'from-[#4A3728] to-[#523E30]',
      '마무리': 'from-[#5C4733] to-[#4A3728]',
    },
    badges: {
      '커버': 'bg-white/20 text-white',
      '본문': 'bg-[#D97706]/20 text-[#D97706]',
      '적용': 'bg-[#D97706]/20 text-[#D97706]',
      '말씀요약': 'bg-[#D97706]/20 text-[#D97706]',
      '마무리': 'bg-white/20 text-white',
    },
    bodyBg: {
      '커버': 'from-[#F5EBE0] to-[#EDDFD0]',
      '본문': 'from-[#F5EBE0] to-[#F0E5D5]',
      '적용': 'from-[#EDDFD0] to-[#F5EBE0]',
      '말씀요약': 'from-[#F0E5D5] to-[#F5EBE0]',
      '마무리': 'from-[#F5EBE0] to-[#EDDFD0]',
    },
    accent: '#D97706',
  },
  eternal_hope: {
    name: '영원한 소망', emoji: '🌱',
    headers: {
      '커버': 'from-[#0F766E] via-[#159B8F] to-[#0F766E]',
      '본문': 'from-[#0F766E] to-[#159B8F]',
      '적용': 'from-[#159B8F] to-[#0F766E]',
      '말씀요약': 'from-[#0F766E] to-[#12867E]',
      '마무리': 'from-[#159B8F] to-[#0F766E]',
    },
    badges: {
      '커버': 'bg-white/20 text-white',
      '본문': 'bg-[#2DD4BF]/20 text-[#14B8A6]',
      '적용': 'bg-[#2DD4BF]/20 text-[#14B8A6]',
      '말씀요약': 'bg-[#2DD4BF]/20 text-[#14B8A6]',
      '마무리': 'bg-white/20 text-white',
    },
    bodyBg: {
      '커버': 'from-[#F0FDFA] to-[#E0F7F4]',
      '본문': 'from-[#F0FDFA] to-[#E8FAF6]',
      '적용': 'from-[#E0F7F4] to-[#F0FDFA]',
      '말씀요약': 'from-[#E8FAF6] to-[#F0FDFA]',
      '마무리': 'from-[#F0FDFA] to-[#E0F7F4]',
    },
    accent: '#14B8A6',
  },
  royal_priesthood: {
    name: '왕 같은 제사장', emoji: '👑',
    headers: {
      '커버': 'from-[#3B0764] via-[#4C1D95] to-[#3B0764]',
      '본문': 'from-[#3B0764] to-[#4C1D95]',
      '적용': 'from-[#4C1D95] to-[#3B0764]',
      '말씀요약': 'from-[#3B0764] to-[#421070]',
      '마무리': 'from-[#4C1D95] to-[#3B0764]',
    },
    badges: {
      '커버': 'bg-[#EAB308]/20 text-[#EAB308]',
      '본문': 'bg-[#EAB308]/20 text-[#EAB308]',
      '적용': 'bg-[#EAB308]/20 text-[#EAB308]',
      '말씀요약': 'bg-[#EAB308]/20 text-[#EAB308]',
      '마무리': 'bg-[#EAB308]/20 text-[#EAB308]',
    },
    bodyBg: {
      '커버': 'from-[#FAF5FF] to-[#F3E8FF]',
      '본문': 'from-[#FAF5FF] to-[#F5EDFF]',
      '적용': 'from-[#F3E8FF] to-[#FAF5FF]',
      '말씀요약': 'from-[#F5EDFF] to-[#FAF5FF]',
      '마무리': 'from-[#FAF5FF] to-[#F3E8FF]',
    },
    accent: '#EAB308',
  },
  silent_night: {
    name: '성탄의 밤', emoji: '🎄',
    headers: {
      '커버': 'from-[#111827] via-[#1F2937] to-[#111827]',
      '본문': 'from-[#111827] to-[#1F2937]',
      '적용': 'from-[#1F2937] to-[#111827]',
      '말씀요약': 'from-[#111827] to-[#182030]',
      '마무리': 'from-[#1F2937] to-[#111827]',
    },
    badges: {
      '커버': 'bg-[#FB923C]/20 text-[#FB923C]',
      '본문': 'bg-[#FB923C]/20 text-[#FB923C]',
      '적용': 'bg-[#FB923C]/20 text-[#FB923C]',
      '말씀요약': 'bg-[#FB923C]/20 text-[#FB923C]',
      '마무리': 'bg-[#FB923C]/20 text-[#FB923C]',
    },
    bodyBg: {
      '커버': 'from-[#0F172A] to-[#1E293B]',
      '본문': 'from-[#0F172A] to-[#1E293B]',
      '적용': 'from-[#0F172A] to-[#1E293B]',
      '말씀요약': 'from-[#0F172A] to-[#1E293B]',
      '마무리': 'from-[#0F172A] to-[#1E293B]',
    },
    accent: '#FB923C',
  },
}

const THEME_KEYS: ThemeKey[] = [
  'modern', 'classic', 'emotional',
  'sacred_grace', 'modern_liturgy', 'peaceful_pasture', 'dawn_prayer',
  'heavenly_light', 'covenant_rainbow', 'sandy_cross', 'eternal_hope',
  'royal_priesthood', 'silent_night',
]

const CARD_TYPE_LABELS = [
  '커버', '본문', '본문', '본문', '말씀요약', '적용', '적용', '마무리',
]

const SIZE_OPTIONS: { key: SizeKey; label: string; aspect: string; w: number; h: number }[] = [
  { key: '4:5', label: '카카오톡', aspect: 'aspect-[4/5]', w: 1080, h: 1350 },
  { key: '1:1', label: '인스타', aspect: 'aspect-square', w: 1080, h: 1080 },
  { key: '9:16', label: '스토리', aspect: 'aspect-[9/16]', w: 1080, h: 1920 },
]

function nextTheme(key: ThemeKey): ThemeKey {
  const idx = THEME_KEYS.indexOf(key)
  return THEME_KEYS[(idx + 1) % THEME_KEYS.length]
}

export default function CardNewsSection({ data }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [theme, setTheme] = useState<ThemeKey>('sacred_grace')
  const [size, setSize] = useState<SizeKey>('4:5')
  const [editedSlides, setEditedSlides] = useState<CardSlide[]>(data.slides || [])
  const [isEditing, setIsEditing] = useState(false)
  const [showThemePicker, setShowThemePicker] = useState(false)
  const [showSizePicker, setShowSizePicker] = useState(false)

  const total = editedSlides.length || 0
  const cardRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)

  const th = THEMES[theme]
  const sizeOption = SIZE_OPTIONS.find(s => s.key === size)!

  useEffect(() => {
    setEditedSlides(data.slides || [])
  }, [data.slides])

  const cardTypes = useMemo(() => {
    return editedSlides.map((_, i) => {
      const idx = Math.min(i, CARD_TYPE_LABELS.length - 1)
      return CARD_TYPE_LABELS[idx]
    })
  }, [editedSlides])

  const goPrev = useCallback(() => {
    setCurrentIdx(prev => prev > 0 ? prev - 1 : prev)
  }, [])

  const goNext = useCallback(() => {
    setCurrentIdx(prev => prev < total - 1 ? prev + 1 : prev)
  }, [total])

  const goToSlide = useCallback((idx: number) => {
    setCurrentIdx(idx)
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIdx < total - 1) goNext()
      else if (diff < 0 && currentIdx > 0) goPrev()
    }
  }, [currentIdx, total, goNext, goPrev])

  const handleEditField = useCallback((idx: number, field: 'title' | 'content', value: string) => {
    setEditedSlides(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }, [])

  const handleSaveSlide = useCallback(async (idx?: number) => {
    const targetIdx = idx ?? currentIdx
    setCurrentIdx(targetIdx)
    await new Promise(r => setTimeout(r, 100))
    if (!cardRef.current) return
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true, backgroundColor: '#ffffff' })
      const link = document.createElement('a')
      link.download = `card-news-${String(targetIdx + 1).padStart(2, '0')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {}
  }, [currentIdx])

  const handleSavePdf = useCallback(async () => {
    try {
      const [html2canvas, jsPdfModule] = await Promise.all([
        import('html2canvas').then(m => m.default),
        import('jspdf'),
      ])
      const jsPDF = jsPdfModule.default
      const isPortrait = size === '9:16'
      const pdf = new jsPDF(isPortrait ? 'p' : 'p', 'mm', 'a4')
      const pageW = 210
      const pageH = 297
      const margin = 10
      const cardW = pageW - margin * 2
      const cardH = cardW * (sizeOption.h / sizeOption.w)

      for (let i = 0; i < total; i++) {
        setCurrentIdx(i)
        await new Promise(r => setTimeout(r, 200))
        if (!cardRef.current) continue
        const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
        if (i > 0) pdf.addPage()
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, margin, cardW, cardH)
      }
      pdf.save('card-news.pdf')
    } catch {}
  }, [total, size, sizeOption])

  if (!total) return (
    <SectionCard title="카드뉴스" emoji="🎴">
      <p className="text-[15px] text-[#8b95a1] text-center py-6">카드뉴스 데이터가 없습니다.</p>
    </SectionCard>
  )

  const slide = editedSlides[currentIdx]
  const label = cardTypes[currentIdx]
  const headerGradient = th.headers[label] || th.headers['본문']
  const badgeClass = th.badges[label] || th.badges['본문']
  const bodyBg = th.bodyBg[label] || th.bodyBg['본문']
  const Icon = CARD_TYPE_ICONS[label] || BookOpen
  const isDarkTheme = theme === 'modern_liturgy' || theme === 'silent_night'

  return (
    <SectionCard
      title="카드뉴스"
      emoji="🎴"
      action={
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* 편집 토글 */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[14px] transition-all ${
              isEditing
                ? 'bg-[#8d7a5b] text-white'
                : 'text-[#8b95a1] hover:text-[#8d7a5b] hover:bg-[#8d7a5b]/10'
            }`}
            title="카드 편집"
          >
            {isEditing ? <Check className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
            <span className="font-medium">{isEditing ? '완료' : '편집'}</span>
          </button>

          {/* 테마 피커 */}
          <div className="relative">
            <button
              onClick={() => { setShowThemePicker(!showThemePicker); setShowSizePicker(false) }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[14px] text-[#8b95a1] hover:text-[#8d7a5b] hover:bg-[#8d7a5b]/10 transition-all"
              title={`테마: ${th.name}`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span className="font-medium">{th.emoji}</span>
            </button>
            {showThemePicker && (
              <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl shadow-xl border border-[#e5e8eb] p-2 grid grid-cols-2 gap-1 w-[220px] max-h-[280px] overflow-y-auto">
                {THEME_KEYS.map(tk => (
                  <button
                    key={tk}
                    onClick={() => { setTheme(tk); setShowThemePicker(false) }}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                      theme === tk ? 'bg-[#8d7a5b]/10 text-[#8d7a5b] font-bold' : 'text-[#6b6764] hover:bg-[#f5f4f0]'
                    }`}
                  >
                    <span>{THEMES[tk].emoji}</span>
                    <span className="truncate">{THEMES[tk].name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 사이즈 피커 */}
          <div className="relative">
            <button
              onClick={() => { setShowSizePicker(!showSizePicker); setShowThemePicker(false) }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[14px] text-[#8b95a1] hover:text-[#8d7a5b] hover:bg-[#8d7a5b]/10 transition-all"
              title={`사이즈: ${sizeOption.label}`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="font-medium">{size}</span>
            </button>
            {showSizePicker && (
              <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl shadow-xl border border-[#e5e8eb] p-2 flex flex-col gap-1 w-[130px]">
                {SIZE_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => { setSize(opt.key); setShowSizePicker(false) }}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-[12px] font-medium transition-all ${
                      size === opt.key ? 'bg-[#8d7a5b]/10 text-[#8d7a5b] font-bold' : 'text-[#6b6764] hover:bg-[#f5f4f0]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className="text-[10px] text-[#8b95a1]">{opt.key}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PNG 다운로드 */}
          <button
            onClick={() => handleSaveSlide()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[14px] text-[#8b95a1] hover:text-[#8d7a5b] hover:bg-[#8d7a5b]/10 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="font-medium">PNG</span>
          </button>

          {/* PDF 다운로드 */}
          <button
            onClick={handleSavePdf}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[14px] text-[#8b95a1] hover:text-[#8d7a5b] hover:bg-[#8d7a5b]/10 transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="font-medium">PDF</span>
          </button>
        </div>
      }
    >
      {/* 썸네일 그리드 */}
      <div className="mb-5">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {editedSlides.map((s, i) => {
            const tLabel = cardTypes[i]
            const tGradient = th.headers[tLabel] || th.headers['본문']
            const TIcon = CARD_TYPE_ICONS[tLabel] || BookOpen
            return (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`rounded-lg border-2 overflow-hidden transition-all duration-200 bg-white ${
                  i === currentIdx
                    ? 'border-[#8d7a5b] shadow-md ring-1 ring-[#8d7a5b]/20'
                    : 'border-[#e5e8eb] opacity-60 hover:opacity-100'
                }`}
              >
                <div className={`bg-gradient-to-r ${tGradient} px-1 py-[4px] flex items-center gap-0.5`}>
                  <TIcon className="w-2 h-2 text-white/70 shrink-0" />
                  <p className="text-[8px] text-white/80 font-medium truncate">{tLabel}</p>
                </div>
                <div className="p-1">
                  <p className="text-[9px] text-[#4e5968] font-bold truncate">{s.title}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 메인 카드 */}
      <div className="relative w-full max-w-sm mx-auto">
        <div
          ref={cardRef}
          className={`rounded-2xl overflow-hidden bg-white shadow-lg ${sizeOption.aspect} flex flex-col`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* 헤더 */}
          <div className={`px-6 pt-5 pb-4 bg-gradient-to-r ${headerGradient} shrink-0 relative overflow-hidden`}>
            {/* 장식 레이어 1: 라디얼 하이라이트 */}
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 60%)' }} />
            {/* 장식 레이어 2: 좌측 컬러 바 */}
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: th.accent, opacity: 0.6 }} />

            <div className="relative z-10 flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center ${badgeClass}`}>
                  <Icon className="w-3 h-3" />
                </span>
                <span className={`text-[11px] font-bold px-2 py-[2px] rounded-full ${badgeClass}`}>
                  {label}
                </span>
              </div>
              <span className="text-[11px] text-white/40 font-medium">
                {currentIdx + 1} / {total}
              </span>
            </div>

            {/* 제목 (편집 가능) */}
            {isEditing ? (
              <textarea
                value={slide.title}
                onChange={(e) => handleEditField(currentIdx, 'title', e.target.value)}
                className="relative z-10 w-full bg-white/10 text-white font-bold leading-tight border-0 outline-none resize-none px-2 py-1 rounded-lg backdrop-blur-sm text-[20px]"
                rows={2}
                style={{ fontSize: currentIdx === 0 ? '24px' : '20px' }}
              />
            ) : (
              <h4
                className={`relative z-10 font-bold leading-tight text-white ${
                  currentIdx === 0 ? 'text-[26px] mt-1' : 'text-[20px]'
                }`}
              >
                {slide.title}
              </h4>
            )}
          </div>

          {/* 본문 */}
          <div className={`flex-1 px-6 py-5 overflow-y-auto bg-gradient-to-b ${bodyBg} relative`}>
            {/* 말씀요약 카드: 큰 따옴표 장식 */}
            {label === '말씀요약' && (
              <div
                className="absolute top-2 left-3 text-6xl font-serif leading-none select-none"
                style={{ color: `${th.accent}20` }}
              >
                &ldquo;
              </div>
            )}

            {/* 본문 카드: 좌측 컬러바 */}
            {label === '본문' && (
              <div
                className="absolute left-0 top-4 bottom-4 w-1 rounded-full"
                style={{ backgroundColor: th.accent, opacity: 0.4 }}
              />
            )}

            {isEditing ? (
              <textarea
                value={slide.content}
                onChange={(e) => handleEditField(currentIdx, 'content', e.target.value)}
                className={`relative z-10 w-full bg-white/50 border border-[#e5e8eb] rounded-lg p-3 outline-none resize-none text-[16px] leading-[1.8] ${
                  isDarkTheme ? 'text-white' : 'text-[#4e5968]'
                }`}
                rows={6}
              />
            ) : (
              <p
                className={`relative z-10 text-[17px] leading-[1.85] whitespace-pre-wrap break-words font-medium ${
                  isDarkTheme ? 'text-gray-200' : 'text-[#4e5968]'
                }`}
              >
                {slide.content}
              </p>
            )}

            {/* 마무리 카드: 해시태그 영역 장식 */}
            {label === '마무리' && !isEditing && (
              <div
                className="relative z-10 mt-4 pt-3 border-t flex items-center gap-2"
                style={{ borderColor: `${th.accent}30` }}
              >
                <Flag className="w-3.5 h-3.5" style={{ color: th.accent }} />
                <span className="text-[12px] font-bold" style={{ color: th.accent }}>
                  결단과 나아감
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 내비게이션 */}
        {total > 1 && (
          <>
            <button
              onClick={goPrev}
              disabled={currentIdx === 0}
              className="absolute -left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-lg border border-[#e5e8eb] flex items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all disabled:opacity-0 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4.5 h-4.5 text-[#4e5968]" />
            </button>
            <button
              onClick={goNext}
              disabled={currentIdx === total - 1}
              className="absolute -right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-lg border border-[#e5e8eb] flex items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all disabled:opacity-0 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4.5 h-4.5 text-[#4e5968]" />
            </button>
          </>
        )}
      </div>

      {/* 하단 닷 내비게이션 */}
      {total > 1 && (
        <div className="flex justify-center gap-1.5 mt-5">
          {editedSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`transition-all duration-300 rounded-full ${
                i === currentIdx ? 'w-7 h-2' : 'w-2 h-2 bg-[#d1d6db] hover:bg-[#8b95a1]'
              }`}
              style={i === currentIdx ? { backgroundColor: th.accent } : {}}
            />
          ))}
        </div>
      )}

      {/* 편집 모드 안내 */}
      {isEditing && (
        <p className="text-center text-[12px] text-[#8d7a5b] mt-3 font-medium">
          ✏️ 카드 제목과 내용을 직접 수정할 수 있습니다. 수정 후 PNG/PDF로 다운로드하세요.
        </p>
      )}
    </SectionCard>
  )
}
