'use client'

import { Suspense } from 'react'
import SermonLoom from '@/components/advanced/manuscript-loom/SermonLoom'

export default function ManuscriptPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin" />
      </div>
    }>
      <SermonLoom />
    </Suspense>
  )
}
