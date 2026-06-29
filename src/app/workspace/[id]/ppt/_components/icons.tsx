'use client'

import {
  FileText,
  Plus,
  Trash2,
  Sparkles,
  ChevronUp,
  ChevronDown,
  BookOpen,
  Star,
  Heart,
  Check,
  Lightbulb,
  Quote as QuoteIcon,
} from 'lucide-react'

// 아이콘 매핑 (lucide-react 기반)
export {
  FileText,
  Plus,
  Trash2,
  Sparkles,
  ChevronUp,
  ChevronDown,
  BookOpen,
  Star,
  Heart,
  Check,
  Lightbulb,
  QuoteIcon as Quote,
}

// 십자가 (lucide에 없음)
export function Cross({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20" />
      <path d="M5 7h14" />
    </svg>
  )
}

// 기도 (lucide에 없음)
export function PrayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L9 9l-7 1 5 5-1 7 6-3 6 3-1-7 5-5-7-1z" />
    </svg>
  )
}
