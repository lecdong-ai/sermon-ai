'use client'

import { ChipFilter } from '@/components/common/ChipFilter'
import type { TemplateCategory } from '@/types'

const categoryOptions = [
  { label: '묵상 기록', value: '묵상기록' },
  { label: '가정 묵상', value: '가정묵상' },
  { label: '새벽 기도', value: '새벽기도' },
  { label: '소그룹', value: '소그룹' },
  { label: '일기', value: '일기' },
] as const

interface TemplateCategoryFilterProps {
  currentCategory?: string
}

export function TemplateCategoryFilter({
  currentCategory,
}: TemplateCategoryFilterProps) {
  return (
    <ChipFilter
      options={categoryOptions}
      paramName="category"
      currentValue={currentCategory}
    />
  )
}
