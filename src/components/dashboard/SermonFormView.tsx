'use client'

import { useMemo, useState } from 'react'
import { SERMONS, THEMES, TAGS, SERIES } from '@/data/sampleSermons'
import type { SermonD } from '@/types/dashboard'
import { ArrowLeft, Save, Plus, X } from 'lucide-react'

interface SermonFormViewProps {
  sermonId?: string
  onBack: () => void
  onSave: (sermon: SermonD) => void
}

export default function SermonFormView({ sermonId, onBack, onSave }: SermonFormViewProps) {
  const existing = useMemo(() => sermonId ? SERMONS.find((s) => s.id === sermonId) : null, [sermonId])
  const [form, setForm] = useState<Partial<SermonD>>(existing || {
    title: '',
    date: new Date().toISOString().slice(0, 10),
    preacher: '김은혜 목사',
    sermonType: '주일예배',
    audience: '장년',
    season: '일반주일',
    seriesId: '',
    bibleBook: '',
    chapterStart: 1,
    verseStart: 1,
    chapterEnd: 1,
    verseEnd: 1,
    normalizedPassage: '',
    coreMessage: '',
    outlineIntro: '',
    outlinePoint1: '',
    outlinePoint2: '',
    outlinePoint3: '',
    outlineConclusion: '',
    manuscript: '',
    themeIds: [],
    tagIds: [],
    relatedSermonIds: [],
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }))

  const toggleArrayItem = (key: 'themeIds' | 'tagIds' | 'relatedSermonIds', id: string) => {
    setForm((prev) => {
      const arr = prev[key] || []
      return { ...prev, [key]: arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id] }
    })
  }

  const handleSave = () => {
    if (!form.title?.trim()) { alert('제목을 입력해주세요'); return }
    const id = existing?.id || `s${Date.now()}`
    const now = new Date().toISOString()
    const sermon: SermonD = {
      id,
      title: form.title || '',
      date: form.date || now.slice(0, 10),
      preacher: form.preacher || '김은혜 목사',
      sermonType: form.sermonType || '주일예배',
      audience: form.audience || '장년',
      season: form.season || '일반주일',
      seriesId: form.seriesId || '',
      bibleBook: form.bibleBook || '',
      chapterStart: form.chapterStart || 1,
      verseStart: form.verseStart || 1,
      chapterEnd: form.chapterEnd || 1,
      verseEnd: form.verseEnd || 1,
      normalizedPassage: form.normalizedPassage || `${form.bibleBook} ${form.chapterStart}:${form.verseStart}-${form.chapterEnd}:${form.verseEnd}`,
      coreMessage: form.coreMessage || '',
      outlineIntro: form.outlineIntro || '',
      outlinePoint1: form.outlinePoint1 || '',
      outlinePoint2: form.outlinePoint2 || '',
      outlinePoint3: form.outlinePoint3 || '',
      outlineConclusion: form.outlineConclusion || '',
      manuscript: form.manuscript || '',
      themeIds: form.themeIds || [],
      tagIds: form.tagIds || [],
      relatedSermonIds: form.relatedSermonIds || [],
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    }
    onSave(sermon)
  }

  const PreviewBadge = ({ label, color }: { label: string; color?: string }) => (
    <span className="px-1.5 py-0.5 text-xs rounded" style={{ backgroundColor: (color || '#6366f1') + '15', color: color || '#6366f1' }}>{label}</span>
  )

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="px-6 py-3 border-b border-slate-200/40 bg-white/40 backdrop-blur-sm flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-700">{existing ? '설교 편집' : '새 설교 작성'}</h2>
        </div>
        <button onClick={handleSave} className="flex items-center gap-1 px-4 py-1.5 text-xs font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
          <Save className="w-3.5 h-3.5" /> 저장
        </button>
      </div>

      {/* form */}
      <div className="flex-1 overflow-y-auto px-6 py-5" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
        <div className="max-w-3xl space-y-5">
          {/* basic info */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-slate-400">기본 정보</h3>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">제목 *</label>
              <input
                type="text"
                value={form.title || ''}
                onChange={(e) => update('title', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50/60 border border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 text-slate-700"
                placeholder="설교 제목을 입력하세요"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">날짜</label>
                <input
                  type="date"
                  value={form.date || ''}
                  onChange={(e) => update('date', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50/60 border border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 text-slate-700"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">설교자</label>
                <input
                  type="text"
                  value={form.preacher || ''}
                  onChange={(e) => update('preacher', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50/60 border border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 text-slate-700"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">예배 유형</label>
                <select
                  value={form.sermonType || '주일예배'}
                  onChange={(e) => update('sermonType', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50/60 border border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 text-slate-700"
                >
                  {['주일예배', '새벽예배', '수요예배', '금요기도회', '신년예배', '부활절예배', '성탄예배', '수련회'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">대상</label>
                <select
                  value={form.audience || '장년'}
                  onChange={(e) => update('audience', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50/60 border border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 text-slate-700"
                >
                  {['장년', '청년', '학생', '새벽예배', '수요예배', '금요기도회'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">교회 절기</label>
              <select
                value={form.season || '일반주일'}
                onChange={(e) => update('season', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50/60 border border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 text-slate-700"
              >
                {['일반주일', '대림절', '성탄절', '주현절', '사순절', '부활절', '성령강림절', '신년', '추수감사절'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">시리즈</label>
              <select
                value={form.seriesId || ''}
                onChange={(e) => update('seriesId', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50/60 border border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 text-slate-700"
              >
                <option value="">시리즈 없음</option>
                {SERIES.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
                ))}
              </select>
            </div>
          </div>

          {/* passage */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-slate-400">성경 본문</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">책</label>
                <input
                  type="text"
                  value={form.bibleBook || ''}
                  onChange={(e) => update('bibleBook', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50/60 border border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 text-slate-700"
                  placeholder="예: 마태복음"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">표준 구절</label>
                <input
                  type="text"
                  value={form.normalizedPassage || ''}
                  onChange={(e) => update('normalizedPassage', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50/60 border border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 text-slate-700"
                  placeholder="마태복음 7:24-27"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">장 시작</label>
                <input
                  type="number" value={form.chapterStart || 1}
                  onChange={(e) => update('chapterStart', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-sm bg-slate-50/60 border border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 text-slate-700"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">절 시작</label>
                <input
                  type="number" value={form.verseStart || 1}
                  onChange={(e) => update('verseStart', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-sm bg-slate-50/60 border border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 text-slate-700"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">장 끝</label>
                <input
                  type="number" value={form.chapterEnd || 1}
                  onChange={(e) => update('chapterEnd', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-sm bg-slate-50/60 border border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 text-slate-700"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">절 끝</label>
                <input
                  type="number" value={form.verseEnd || 1}
                  onChange={(e) => update('verseEnd', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-sm bg-slate-50/60 border border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* core message */}
          <div className="glass-panel rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400">핵심 메시지</h3>
            <textarea
              value={form.coreMessage || ''}
              onChange={(e) => update('coreMessage', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm bg-slate-50/60 border border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 text-slate-700 resize-none"
              placeholder="이 설교의 핵심 메시지를 한 문장으로..."
            />
          </div>

          {/* outline (collapsed) */}
          <div className="glass-panel rounded-2xl p-5 space-y-3">
            <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors">
              {showAdvanced ? '▼' : '▶'} 설교 개요 및 원문 {showAdvanced ? '접기' : '펼치기'}
            </button>
            {showAdvanced && (
              <div className="space-y-3 pt-2">
                {['outlineIntro', 'outlinePoint1', 'outlinePoint2', 'outlinePoint3', 'outlineConclusion'].map((key, i) => (
                  <div key={key}>
                    <label className="text-xs text-slate-400 mb-1 block">
                      {i === 0 ? '도입' : i <= 3 ? `소제목 ${i}` : '결론'}
                    </label>
                    <textarea
                      value={(form as any)[key] || ''}
                      onChange={(e) => update(key, e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 text-sm bg-slate-50/60 border border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 text-slate-700 resize-none"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">설교 원고</label>
                  <textarea
                    value={form.manuscript || ''}
                    onChange={(e) => update('manuscript', e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 text-sm bg-slate-50/60 border border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 text-slate-700 resize-none font-[var(--font-noto-sans-kr)]"
                    placeholder="설교 원고를 입력하세요..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* themes & tags */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-400 mb-2">주제 (다중 선택)</h3>
              <div className="flex flex-wrap gap-1.5">
                {THEMES.map((t) => {
                  const selected = (form.themeIds || []).includes(t.id)
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleArrayItem('themeIds', t.id)}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                        selected
                          ? 'bg-amber-50 border-amber-200 text-amber-700'
                          : 'bg-slate-50 border-slate-200/50 text-slate-500 hover:border-amber-200 hover:text-amber-600'
                      }`}
                    >
                      {t.name}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400 mb-2">태그 (다중 선택)</h3>
              <div className="flex flex-wrap gap-1.5">
                {TAGS.map((t) => {
                  const selected = (form.tagIds || []).includes(t.id)
                  const color = t.type === 'situation' ? '#10b981' : '#6366f1'
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleArrayItem('tagIds', t.id)}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                        selected
                          ? 'border-2 text-white'
                          : 'bg-slate-50 border-slate-200/50 text-slate-500'
                      }`}
                      style={selected ? { backgroundColor: color, borderColor: color } : {}}
                    >
                      {t.name}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400 mb-2">관련 설교 (다중 선택)</h3>
              <div className="flex flex-wrap gap-1.5">
                {SERMONS.filter((s) => s.id !== sermonId).map((s) => {
                  const selected = (form.relatedSermonIds || []).includes(s.id)
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleArrayItem('relatedSermonIds', s.id)}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                        selected
                          ? 'bg-primary-50 border-primary-200 text-primary-700'
                          : 'bg-slate-50 border-slate-200/50 text-slate-500 hover:border-primary-200 hover:text-primary-600'
                      }`}
                    >
                      {s.title}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
