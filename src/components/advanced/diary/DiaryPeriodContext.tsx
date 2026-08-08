'use client'

import React, { createContext, useContext, useMemo } from 'react'

export interface DiaryPeriodMonth {
  year: number
  month: number
}

interface DiaryPeriodValue {
  periodMonths: DiaryPeriodMonth[]
  currentYear: number
  currentMonth: number
}

const DiaryPeriodContext = createContext<DiaryPeriodValue | null>(null)

export function useDiaryPeriod(): DiaryPeriodValue | null {
  return useContext(DiaryPeriodContext)
}

interface DiaryPeriodProviderProps {
  periodMonths: DiaryPeriodMonth[]
  currentYear: number
  currentMonth: number
  children: React.ReactNode
}

export function DiaryPeriodProvider({
  periodMonths,
  currentYear,
  currentMonth,
  children,
}: DiaryPeriodProviderProps) {
  const value = useMemo(
    () => ({ periodMonths, currentYear, currentMonth }),
    [periodMonths, currentYear, currentMonth]
  )
  return <DiaryPeriodContext.Provider value={value}>{children}</DiaryPeriodContext.Provider>
}
