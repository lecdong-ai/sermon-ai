'use client'

import QtGenerator from '@/components/advanced/QtGenerator'
import { AdminGate } from '@/components/admin/AdminGate'

export default function QtPage() {
  return (
    <AdminGate>
      <div className="max-w-[1000px] mx-auto px-6 py-8 w-full">
        <QtGenerator />
      </div>
    </AdminGate>
  )
}
