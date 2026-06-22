'use client'

import { useEffect, useState } from 'react'
import SermonWizard from '@/components/dashboard/SermonWizard'

export default function NewSermonPage() {
  const [params, setParams] = useState<{
    title?: string; passage?: string; date?: string; editId?: string
  } | null>(null)

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    setParams({
      title: sp.get('title') || undefined,
      passage: sp.get('passage') || undefined,
      date: sp.get('date') || undefined,
      editId: sp.get('edit') || undefined,
    })
  }, [])

  if (!params) {
    return (
      <div className="animate-fade-in py-12 text-center">
        <p className="text-slate-400 text-sm font-medium">로딩 중...</p>
      </div>
    )
  }

  return (
    <SermonWizard
      initialTitle={params.title}
      initialPassage={params.passage}
      initialDate={params.date}
      editId={params.editId}
    />
  )
}
