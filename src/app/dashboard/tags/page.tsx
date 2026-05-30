'use client'

import { useState, useMemo } from 'react'
import { useApp } from '@/lib/dashboard/store'
import { Theme } from '@/lib/dashboard/types'
import { MAJOR_THEMES, SITUATION_TAGS, EMOTION_TAGS } from '@/lib/dashboard/constants'

export default function TagsPage() {
  const { state, dispatch } = useApp()
  const { themes, sermons } = state

  const [newTagName, setNewTagName] = useState('')
  const [newTagCategory, setNewTagCategory] = useState<Theme['category']>('major')
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const categorized = useMemo(() => {
    return {
      major: themes.filter((t) => t.category === 'major'),
      situation: themes.filter((t) => t.category === 'situation'),
      emotion: themes.filter((t) => t.category === 'emotion'),
    }
  }, [themes])

  const getTagUsage = (tagId: string) =>
    sermons.filter((s) => s.themeIds.includes(tagId)).length

  const handleAdd = () => {
    if (!newTagName.trim()) return
    const exists = themes.find(
      (t) => t.name === newTagName.trim() && t.category === newTagCategory
    )
    if (exists) {
      alert('이미 존재하는 태그입니다.')
      return
    }
    const newTag: Theme = {
      id: `custom-${Date.now()}`,
      name: newTagName.trim(),
      category: newTagCategory,
      description: '',
    }
    dispatch({ type: 'ADD_THEME', payload: newTag })
    setNewTagName('')
  }

  const handleDelete = (id: string) => {
    if (confirm('이 태그를 삭제하시겠습니까?')) {
      dispatch({ type: 'DELETE_THEME', payload: id })
    }
  }

  const handleEdit = (id: string) => {
    if (!editName.trim()) return
    const theme = themes.find((t) => t.id === id)
    if (theme) {
      dispatch({
        type: 'UPDATE_THEME',
        payload: { ...theme, name: editName.trim() },
      })
    }
    setEditingTag(null)
    setEditName('')
  }

  const renderTagGroup = (title: string, tags: Theme[], color: string) => (
    <div className="bg-surface border border-border rounded-lg p-5">
      <h3 className="text-sm font-semibold text-muted mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <div key={tag.id} className="group relative">
            {editingTag === tag.id ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-xs border border-border rounded px-2 py-1 w-20 focus:outline-none focus:ring-1 focus:ring-primary-light"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEdit(tag.id)
                    if (e.key === 'Escape') setEditingTag(null)
                  }}
                />
                <button
                  onClick={() => handleEdit(tag.id)}
                  className="text-[10px] text-primary hover:text-primary-dark"
                >
                  저장
                </button>
              </div>
            ) : (
              <span
                className="text-xs px-3 py-1.5 rounded-full cursor-pointer inline-flex items-center gap-1.5"
                style={{
                  backgroundColor: `${color}10`,
                  color: color,
                }}
              >
                {tag.name}
                <span className="text-[10px] opacity-60">({getTagUsage(tag.id)})</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingTag(tag.id)
                    setEditName(tag.name)
                  }}
                  className="opacity-0 group-hover:opacity-60 hover:opacity-100 text-[10px] ml-0.5"
                >
                  ✎
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(tag.id)
                  }}
                  className="opacity-0 group-hover:opacity-60 hover:opacity-100 text-[10px]"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="animate-fade-in space-y-6 max-w-6xl">
      <h2 className="text-xl font-bold">태그 관리</h2>

      <div className="bg-surface border border-border rounded-lg p-5">
        <h3 className="text-sm font-semibold text-muted mb-3">새 태그 추가</h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="태그 이름"
            className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light flex-1 max-w-xs"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <select
            value={newTagCategory}
            onChange={(e) => setNewTagCategory(e.target.value as Theme['category'])}
            className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none text-muted"
          >
            <option value="major">대주제</option>
            <option value="situation">상황</option>
            <option value="emotion">정서</option>
          </select>
          <button
            onClick={handleAdd}
            className="text-sm bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors"
          >
            추가
          </button>
        </div>
      </div>

      {renderTagGroup('대주제 태그', categorized.major, '#c05621')}
      {renderTagGroup('상황 태그', categorized.situation, '#3182ce')}
      {renderTagGroup('정서 태그', categorized.emotion, '#805ad5')}

      <p className="text-xs text-muted">
        총 {themes.length}개의 태그 · 괄호 안 숫자는 사용 횟수
      </p>
    </div>
  )
}
