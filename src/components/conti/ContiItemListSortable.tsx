'use client'

import { useState } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { ContiItem, MusicKey } from '@/types/conti'
import { getSampleSongById } from '@/lib/conti/samples'
import SortableContiItemRow from './SortableContiItemRow'
import { Plus } from 'lucide-react'

interface Props {
  items: ContiItem[]
  onReorder: (newOrder: ContiItem[]) => void
  onRemove: (itemId: string) => void
  onUpdate: (updated: ContiItem) => void
  onAdd: () => void
}

function getEffectiveKey(item: ContiItem): MusicKey | null {
  if (item.key) return item.key
  if (item.song?.original_key) return item.song.original_key
  return null
}

export default function ContiItemListSortable({ items, onReorder, onRemove, onUpdate, onAdd }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  // song 필드 자동 보강
  const itemsWithSong = items.map((it) => ({
    ...it,
    song: it.song || getSampleSongById(it.song_id) || undefined,
  }))

  const activeItem = activeId ? itemsWithSong.find((i) => i.id === activeId) : null

  function handleDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as string)
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null)
    const { active, over } = e
    if (!over || active.id === over.id) return

    const oldIdx = itemsWithSong.findIndex((i) => i.id === active.id)
    const newIdx = itemsWithSong.findIndex((i) => i.id === over.id)
    if (oldIdx === -1 || newIdx === -1) return

    const reordered = arrayMove(itemsWithSong, oldIdx, newIdx).map((it, idx) => ({
      ...it,
      position: idx + 1,
    }))
    onReorder(reordered)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={itemsWithSong.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {itemsWithSong.map((item, idx) => {
            const prevItem = idx > 0 ? itemsWithSong[idx - 1] : null
            const prevKey = prevItem ? getEffectiveKey(prevItem) : null
            return (
              <SortableContiItemRow
                key={item.id}
                item={item}
                position={item.position}
                prevKey={prevKey}
                onRemove={() => onRemove(item.id)}
                onUpdate={onUpdate}
              />
            )
          })}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeItem ? (
          <SortableContiItemRow
            item={activeItem}
            position={activeItem.position}
            prevKey={null}
            onRemove={() => {}}
            onUpdate={() => {}}
            isOverlay
          />
        ) : null}
      </DragOverlay>

      {/* 곡 추가 버튼 */}
      <div className="mt-3">
        <button
          onClick={onAdd}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-dashed border-white/10 text-[13px] font-bold text-slate-400 hover:text-indigo-300 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          곡 추가
        </button>
      </div>
    </DndContext>
  )
}
