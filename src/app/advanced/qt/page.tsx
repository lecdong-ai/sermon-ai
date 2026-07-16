'use client'

import QtGenerator from '@/components/advanced/QtGenerator'

export default function QtPage() {
  return (
    <div className="h-full overflow-y-auto scrollbar-thin pb-12">
      <div className="max-w-[1000px] mx-auto px-6 py-8 w-full">
        <QtGenerator />
      </div>
    </div>
  )
}
