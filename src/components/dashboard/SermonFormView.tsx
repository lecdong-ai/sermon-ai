'use client'

import { useMemo, useState } from 'react'
import { SERMONS, THEMES, TAGS, SERIES } from '@/data/sampleSermons'
import type { SermonD } from '@/types/dashboard'
import { ArrowLeft, Save, ChevronDown, ChevronRight, BookOpen, Tag, Layers, FileText, MessageSquare, Quote } from 'lucide-react'

interface SermonFormViewProps {
  sermonId?: string
  onBack: () => void
  onSave: (sermon: SermonD) => void
}

export default function SermonFormView({ sermonId, onBack, onSave }: SermonFormViewProps) {
  const existing = useMemo(() => (sermonId ? SERMONS.find((s) => s.id === sermonId) : null), [sermonId])

  const [form, setForm] = useState<Partial<SermonD>>(
    existing || {
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
    }
  )

  const [showAdvanced, setShowAdvanced] = useState(!!existing)

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }))

  const toggleArrayItem = (key: 'themeIds' | 'tagIds' | 'relatedSermonIds', id: string) => {
    setForm((prev) => {
      const arr = prev[key] || []
      return { ...prev, [key]: arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id] }
    })
  }

  const handleSave = () => {
    if (!form.title?.trim()) {
      alert('제목을 입력해주세요')
      return
    }
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

  const Section = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-5 space-y-4">
      <h3 className="text-[11px] font-semibold tracking-wide uppercase text-slate-400 flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" /> {title}
      </h3>
      {children}
    </div>
  )

  const Input = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label className="text-xs text-slate-400 mb-1.5 block font-medium">{label}</label>
      <input
        {...props}
        className="w-full px-3.5 py-2 text-sm bg-white/60 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200/50 focus:border-indigo-300 text-slate-700 placeholder-slate-400 transition-all"
      />
    </div>
  )

  const Select = ({ label, children, value, onChange }: { label: string; children: React.ReactNode; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }) => (
    <div>
      <label className="text-xs text-slate-400 mb-1.5 block font-medium">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full px-3.5 py-2 text-sm bg-white/60 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200/50 focus:border-indigo-300 text-slate-700 transition-all appearance-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
      >
        {children}
      </select>
    </div>
  )

  const Textarea = ({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <div>
      <label className="text-xs text-slate-400 mb-1.5 block font-medium">{label}</label>
      <textarea
        {...props}
        className="w-full px-3.5 py-2 text-sm bg-white/60 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200/50 focus:border-indigo-300 text-slate-700 placeholder-slate-400 transition-all resize-none"
      />
    </div>
  )

  const ToggleChip = ({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
        selected
          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium'
          : 'bg-white/50 border-slate-200/60 text-slate-500 hover:border-indigo-200 hover:text-indigo-600'
      }`}
    >
      {children}
    </button>
  )

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="px-6 py-3 border-b border-slate-200/30 bg-white/50 backdrop-blur-sm flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-slate-800">{existing ? '설교 편집' : '새 설교 작성'}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{existing ? '기존 설교를 수정합니다' : '새로운 설교를 등록합니다'}</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors shadow-sm"
        >
          <Save className="w-3.5 h-3.5" /> 저장
        </button>
      </div>

      {/* form */}
      <div className="flex-1 overflow-y-auto px-6 py-5" style={{ maxHeight: 'calc(100vh - 11rem)' }}>
        <div className="max-w-3xl mx-auto space-y-4">
          {/* basic info */}
          <Section title="기본 정보" icon={BookOpen}>
            <Input label="제목 *" type="text" value={form.title || ''} onChange={(e) => update('title', e.target.value)} placeholder="설교 제목을 입력하세요" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="날짜" type="date" value={form.date || ''} onChange={(e) => update('date', e.target.value)} />
              <Input label="설교자" type="text" value={form.preacher || ''} onChange={(e) => update('preacher', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select label="예배 유형" value={form.sermonType || '주일예배'} onChange={(e) => update('sermonType', e.target.value)}>
                {['주일예배', '새벽예배', '수요예배', '금요기도회', '신년예배', '부활절예배', '성탄예배', '수련회'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
              <Select label="대상" value={form.audience || '장년'} onChange={(e) => update('audience', e.target.value)}>
                {['장년', '청년', '학생', '새벽예배', '수요예배', '금요기도회'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
            </div>
            <Select label="교회 절기" value={form.season || '일반주일'} onChange={(e) => update('season', e.target.value)}>
              {['일반주일', '대림절', '성탄절', '주현절', '사순절', '부활절', '성령강림절', '신년', '추수감사절'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
            <Select label="시리즈" value={form.seriesId || ''} onChange={(e) => update('seriesId', e.target.value)}>
              <option value="">시리즈 없음</option>
              {SERIES.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
              ))}
            </Select>
          </Section>

          {/* passage */}
          <Section title="성경 본문" icon={Layers}>
            <div className="grid grid-cols-2 gap-3">
              <Input label="책" type="text" value={form.bibleBook || ''} onChange={(e) => update('bibleBook', e.target.value)} placeholder="예: 마태복음" />
              <Input label="표준 구절" type="text" value={form.normalizedPassage || ''} onChange={(e) => update('normalizedPassage', e.target.value)} placeholder="마태복음 7:24-27" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: 'chapterStart', label: '장 시작' },
                { key: 'verseStart', label: '절 시작' },
                { key: 'chapterEnd', label: '장 끝' },
                { key: 'verseEnd', label: '절 끝' },
              ].map(({ key, label }) => (
                <Input
                  key={key}
                  label={label}
                  type="number"
                  value={(form as any)[key] || 1}
                  onChange={(e) => update(key, parseInt(e.target.value) || 1)}
                  min={1}
                />
              ))}
            </div>
          </Section>

          {/* core message */}
          <Section title="핵심 메시지" icon={Quote}>
            <Textarea label="이 설교의 핵심 메시지를 한 문장으로" value={form.coreMessage || ''} onChange={(e) => update('coreMessage', e.target.value)} rows={3} placeholder="하나님의 사랑은 영원합니다..." />
          </Section>

          {/* outline (collapsible) */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <h3 className="text-[11px] font-semibold tracking-wide uppercase text-slate-400 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> 설교 개요 및 원문
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">{showAdvanced ? '접기' : '펼치기'}</span>
                {showAdvanced ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </div>
            </button>
            {showAdvanced && (
              <div className="px-5 pb-5 space-y-3 border-t border-slate-100 pt-4">
                {[
                  { key: 'outlineIntro', label: '도입', rows: 2 },
                  { key: 'outlinePoint1', label: '소제목 1', rows: 2 },
                  { key: 'outlinePoint2', label: '소제목 2', rows: 2 },
                  { key: 'outlinePoint3', label: '소제목 3', rows: 2 },
                  { key: 'outlineConclusion', label: '결론', rows: 2 },
                ].map(({ key, label, rows }) => (
                  <Textarea key={key} label={label} value={(form as any)[key] || ''} onChange={(e) => update(key, e.target.value)} rows={rows} />
                ))}
                <Textarea label="설교 원고" value={form.manuscript || ''} onChange={(e) => update('manuscript', e.target.value)} rows={8} placeholder="설교 원고를 입력하세요..." />
              </div>
            )}
          </div>

          {/* themes & tags */}
          <Section title="주제 및 태그" icon={Tag}>
            <div>
              <label className="text-xs text-slate-400 mb-2 block font-medium">주제 (다중 선택)</label>
              <div className="flex flex-wrap gap-1.5">
                {THEMES.map((t) => (
                  <ToggleChip key={t.id} selected={(form.themeIds || []).includes(t.id)} onClick={() => toggleArrayItem('themeIds', t.id)}>
                    {t.name}
                  </ToggleChip>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-2 block font-medium">태그 (다중 선택)</label>
              <div className="flex flex-wrap gap-1.5">
                {TAGS.map((t) => {
                  const selected = (form.tagIds || []).includes(t.id)
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleArrayItem('tagIds', t.id)}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                        selected
                          ? 'text-white font-medium border-0'
                          : 'bg-white/50 border-slate-200/60 text-slate-500 hover:border-indigo-200 hover:text-indigo-600'
                      }`}
                      style={selected ? { backgroundColor: t.type === 'situation' ? '#10b981' : '#6366f1' } : {}}
                    >
                      {t.name}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-2 block font-medium">관련 설교 (다중 선택)</label>
              <div className="flex flex-wrap gap-1.5">
                {SERMONS.filter((s) => s.id !== sermonId).map((s) => (
                  <ToggleChip key={s.id} selected={(form.relatedSermonIds || []).includes(s.id)} onClick={() => toggleArrayItem('relatedSermonIds', s.id)}>
                    {s.title}
                  </ToggleChip>
                ))}
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}
