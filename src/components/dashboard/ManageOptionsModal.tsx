'use client'

import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { useApp } from '@/lib/dashboard/store'

interface Props {
  open: boolean
  onClose: () => void
}

type Tab = 'sermonTypes' | 'audiences' | 'preachers'

const LABELS: Record<Tab, string> = {
  sermonTypes: '설교 종류',
  audiences: '회중',
  preachers: '설교자',
}

export default function ManageOptionsModal({ open, onClose }: Props) {
  const { state, dispatch } = useApp()
  const [tab, setTab] = useState<Tab>('sermonTypes')
  const [input, setInput] = useState('')

  if (!open) return null

  const items = state[tab]

  const handleAdd = () => {
    const val = input.trim()
    if (!val) return
    const actions: Record<Tab, () => void> = {
      sermonTypes: () => dispatch({ type: 'ADD_SERMON_TYPE', payload: val }),
      audiences: () => dispatch({ type: 'ADD_AUDIENCE', payload: val }),
      preachers: () => dispatch({ type: 'ADD_PREACHER', payload: val }),
    }
    actions[tab]()
    setInput('')
  }

  const handleDelete = (item: string) => {
    const actions: Record<Tab, () => void> = {
      sermonTypes: () => dispatch({ type: 'DELETE_SERMON_TYPE', payload: item }),
      audiences: () => dispatch({ type: 'DELETE_AUDIENCE', payload: item }),
      preachers: () => dispatch({ type: 'DELETE_PREACHER', payload: item }),
    }
    actions[tab]()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold">항목 관리</h3>
          <button type="button" onClick={onClose} className="text-muted hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex border-b border-border">
          {(['sermonTypes', 'audiences', 'preachers'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setTab(t); setInput('') }}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                tab === t
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {LABELS[t]}
            </button>
          ))}
        </div>

        <div className="p-5">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } }}
              placeholder={`새 ${LABELS[tab]} 입력...`}
              className="flex-1 px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light"
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!input.trim()}
              className="px-3 py-2 text-xs font-medium text-white bg-primary rounded-md hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              추가
            </button>
          </div>

          <div className="space-y-1 max-h-64 overflow-y-auto">
            {items.map((item) => (
              <div
                key={item}
                className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-50 group"
              >
                <span className="text-sm text-foreground">{item}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  className="text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {items.length === 0 && (
              <p className="text-xs text-muted text-center py-6">등록된 항목이 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
