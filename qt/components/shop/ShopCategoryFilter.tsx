'use client'

import { ChipFilter } from '@/components/common/ChipFilter'
import type { ShopCategory } from '@/types'

const categoryOptions = [
  { label: '문구', value: '문구' },
  { label: '굿즈', value: '굿즈' },
  { label: '독서용품', value: '독서용품' },
] as const

interface ShopCategoryFilterProps {
  currentCategory?: string
}

export function ShopCategoryFilter({
  currentCategory,
}: ShopCategoryFilterProps) {
  return (
    <ChipFilter
      options={categoryOptions}
      paramName="category"
      currentValue={currentCategory}
    />
  )
}
