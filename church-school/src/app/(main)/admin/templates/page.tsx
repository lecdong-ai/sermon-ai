'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Upload, Trash2, Edit2, X, Check, Palette, Sparkles, Loader2, FileUp, Download } from 'lucide-react'
import { invalidateCache } from '@/lib/templateRegistry'

interface Template {
  id: string
  name: string
  category: string
  primary_color: string
  accent_color: string
  background_color: string
  text_color: string
  font_title: string
  font_body: string
  gradient: string | null
  ai_guide: string | null
  is_active: boolean
  created_at: string
}

interface FormData {
  name: string
  category: string
  primary_color: string
  accent_color: string
  background_color: string
  text_color: string
  font_title: string
  font_body: string
  ai_guide: string
}

const EMPTY_FORM: FormData = {
  name: '', category: 'general',
  primary_color: '1B3A5C', accent_color: '4A90D9',
  background_color: 'FFFFFF', text_color: '1A1A2E',
  font_title: 'Malgun Gothic', font_body: 'Malgun Gothic',
  ai_guide: '',
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const loadTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/templates')
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setTemplates(data.templates || [])
    } catch (e) {
      showToast('템플릿 목록을 불러오는데 실패했습니다', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { loadTemplates() }, [loadTemplates])

  const openNew = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setUploadFile(null)
    setShowForm(true)
  }

  const openEdit = (t: Template) => {
    setForm({
      name: t.name,
      category: t.category,
      primary_color: t.primary_color,
      accent_color: t.accent_color,
      background_color: t.background_color,
      text_color: t.text_color,
      font_title: t.font_title,
      font_body: t.font_body,
      ai_guide: t.ai_guide || '',
    })
    setEditingId(t.id)
    setUploadFile(null)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      showToast('템플릿 이름을 입력해주세요', 'error')
      return
    }
    setSaving(true)
    try {
      const body = new FormData()
      body.append('name', form.name)
      body.append('category', form.category)
      body.append('primary_color', form.primary_color)
      body.append('accent_color', form.accent_color)
      body.append('background_color', form.background_color)
      body.append('text_color', form.text_color)
      body.append('font_title', form.font_title)
      body.append('font_body', form.font_body)
      body.append('ai_guide', form.ai_guide)
      if (uploadFile) body.append('file', uploadFile)

      const url = editingId ? `/api/admin/templates/${editingId}` : '/api/admin/templates'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, { method, body })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '저장 실패')

      invalidateCache()
      showToast(editingId ? '템플릿이 수정되었습니다' : '템플릿이 생성되었습니다', 'success')
      setShowForm(false)
      loadTemplates()
    } catch (e) {
      showToast((e as Error).message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 템플릿을 삭제하시겠습니까?')) return
    try {
      const res = await fetch(`/api/admin/templates/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('삭제 실패')
      invalidateCache()
      showToast('템플릿이 삭제되었습니다', 'success')
      loadTemplates()
    } catch (e) {
      showToast((e as Error).message, 'error')
    }
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-[13px] font-medium shadow-2xl transition-all ${
          toast.type === 'success' ? 'bg-emerald-900/90 text-emerald-200 border border-emerald-700/50' : 'bg-red-900/90 text-red-200 border border-red-700/50'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-100">PPT 템플릿 관리</h1>
          <p className="text-[13px] text-slate-400 mt-1">PPT 스튜디오에서 사용할 템플릿을 관리합니다. .pptx 파일을 업로드하면 색상/폰트가 자동 추출됩니다.</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-all"
        >
          <Plus className="w-4 h-4" /> 새 템플릿
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/60 backdrop-blur-sm pt-16 px-4 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-2xl bg-[#0e1420] border border-white/10 rounded-2xl shadow-2xl mb-16" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h2 className="text-base font-bold text-slate-100">{editingId ? '템플릿 수정' : '새 템플릿'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Name + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">템플릿 이름</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[13px] text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">카테고리</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[13px] text-slate-200 focus:outline-none focus:border-indigo-500">
                    <option value="general">일반</option>
                    <option value="sermon">설교</option>
                    <option value="education">교육</option>
                    <option value="event">행사</option>
                  </select>
                </div>
              </div>

              {/* .pptx Upload */}
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">.pptx 파일 업로드 (색상/폰트 자동 추출)</label>
                <div className="flex gap-2">
                  <input ref={fileRef} type="file" accept=".pptx" onChange={e => setUploadFile(e.target.files?.[0] || null)} className="hidden" />
                  <button onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[12px] text-slate-300 hover:bg-white/10 transition-all">
                    <FileUp className="w-4 h-4" />
                    {uploadFile ? uploadFile.name : '파일 선택'}
                  </button>
                  {uploadFile && (
                    <button onClick={() => setUploadFile(null)} className="p-2 text-slate-500 hover:text-red-400">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-2">색상 (Hex)</label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: '프라이머리', key: 'primary_color', value: form.primary_color },
                    { label: '액센트', key: 'accent_color', value: form.accent_color },
                    { label: '배경', key: 'background_color', value: form.background_color },
                    { label: '텍스트', key: 'text_color', value: form.text_color },
                  ].map(({ label, key, value }) => (
                    <div key={key}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-4 h-4 rounded border border-white/10" style={{ backgroundColor: `#${value}` }} />
                        <span className="text-[10px] text-slate-500">{label}</span>
                      </div>
                      <input value={value} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-[11px] text-slate-300 font-mono focus:outline-none focus:border-indigo-500 uppercase" maxLength={6} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Fonts */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">제목 폰트</label>
                  <input value={form.font_title} onChange={e => setForm(f => ({ ...f, font_title: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[13px] text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">본문 폰트</label>
                  <input value={form.font_body} onChange={e => setForm(f => ({ ...f, font_body: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[13px] text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
              </div>

              {/* AI Guide */}
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  AI 가이드 (GPT가 슬라이드 생성 시 참고할 디자인/스타일 설명)
                </label>
                <textarea value={form.ai_guide} onChange={e => setForm(f => ({ ...f, ai_guide: e.target.value }))} rows={3} placeholder="예: 깔끔하고 전문적인 비즈니스 스타일. 진한 네이비와 블루 포인트를 활용한 신뢰감 있는 디자인."
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[12px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/5">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-[12px] text-slate-400 hover:text-slate-200 transition-all">
                취소
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-[12px] font-bold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition-all">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : editingId ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                {saving ? '저장 중...' : editingId ? '수정 완료' : '템플릿 생성'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20">
          <Palette className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-[14px]">등록된 템플릿이 없습니다.</p>
          <p className="text-slate-600 text-[12px] mt-1">&apos;새 템플릿&apos; 버튼을 눌러 첫 템플릿을 추가해보세요.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {templates.map((t) => (
            <div key={t.id} className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/[0.05] transition-all">
              {/* Color preview */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <div className="w-8 h-8 rounded-lg border border-white/10" style={{ backgroundColor: `#${t.primary_color}` }} />
                <div className="w-8 h-2 rounded" style={{ backgroundColor: `#${t.accent_color}` }} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-slate-200">{t.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500">{t.category}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                  <span>#{t.primary_color} / #{t.accent_color}</span>
                  <span>{t.font_title} / {t.font_body}</span>
                  {t.ai_guide && <span className="truncate max-w-[200px]">{t.ai_guide}</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(t)}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(t.id)}
                  className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/5 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
