'use client'

import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { X, Save, Loader2, BookOpen, Sparkles, Clock, FileText, History, ArrowLeft, GitCompare, RotateCcw, Plus, BarChart2, Play, Download, Eye, Edit3 } from 'lucide-react'
import type { JohnManuscriptData, IllustrationNote, ReferenceNote } from '@/lib/advanced/johnManuscriptData'
import { setStorageItem } from '@/lib/storage'
import { getVersions, saveVersion, restoreVersion, type ManuscriptVersion } from '@/lib/advanced/versionManager'
import ManuscriptDiagnosis from './ManuscriptDiagnosis'
import PracticeMode from './PracticeMode'
import StudioHeader from './StudioHeader'
import AntigravityRewritePanel from './AntigravityRewritePanel'

interface Props {
  manuscript: JohnManuscriptData
  projectId: string
  referenceNotes: ReferenceNote[]
  illustrationNotes: IllustrationNote[]
  onUpdateSection: (id: string, content: string) => void
  onClose: () => void
}

export default function ManuscriptStudio({
  manuscript,
  projectId,
  referenceNotes,
  illustrationNotes,
  onUpdateSection,
  onClose,
}: Props) {
  const [localManuscript, setLocalManuscript] = useState<JohnManuscriptData>(manuscript)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [sidebarTab, setSidebarTab] = useState<'versions' | 'diagnosis' | null>(null)
  const [showPractice, setShowPractice] = useState(false)
  const [showAntigravity, setShowAntigravity] = useState(false)
  const [weavingRefId, setWeavingRefId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')
  const [versions, setVersions] = useState<ManuscriptVersion[]>([])
  const [selectedVersion, setSelectedVersion] = useState<ManuscriptVersion | null>(null)
  const [showDiff, setShowDiff] = useState(false)
  const [versionNote, setVersionNote] = useState('')
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const localManuscriptRef = useRef(localManuscript)
  localManuscriptRef.current = localManuscript
  const versionNoteRef = useRef(versionNote)
  versionNoteRef.current = versionNote

  useEffect(() => {
    setLocalManuscript(manuscript)
    setVersions(getVersions(projectId))
  }, [manuscript, projectId])

  const handleSave = useCallback((note?: string) => {
    setIsSaving(true)
    const current = localManuscriptRef.current
    // Update parent state
    current.sections.forEach(section => {
      onUpdateSection(section.id, section.content)
    })
    // Save to storage
    setStorageItem(`manuscript_${projectId}`, { ...current, _savedAt: Date.now() })
    // Save version
    const newVersion = saveVersion(projectId, current, note || versionNoteRef.current)
    setVersions(prev => [newVersion, ...prev])
    setVersionNote('')
    setLastSaved(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }))
    setTimeout(() => setIsSaving(false), 500)
  }, [projectId, onUpdateSection])

  const handleRestore = (version: ManuscriptVersion) => {
    if (!confirm(`"${version.label}" (${new Date(version.timestamp).toLocaleString('ko-KR')}) 버전으로 복원하시겠습니까?`)) return
    const restored = restoreVersion(projectId, version.id)
    if (restored) {
      setLocalManuscript(restored)
      // Save restored as new version
      const newVersion = saveVersion(projectId, restored, `${version.label}에서 복원`)
      setVersions(prev => [newVersion, ...prev])
      setSelectedVersion(null)
      setShowDiff(false)
    }
  }

  const handleSectionChange = (id: string, value: string) => {
    setLocalManuscript(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === id ? { ...s, content: value } : s)
    }))
    // Debounced auto-save
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      handleSave()
    }, 3000) // 3초 후 자동 저장
  }

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      handleSave()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalWords = localManuscript.sections.reduce((sum, s) => sum + s.content.replace(/\s/g, '').length, 0)

  const handleExport = useCallback(() => {
    const content = localManuscriptRef.current.sections.map(s => `[${s.label}]\n${s.content}`).join('\n\n')
    const fullText = `# ${localManuscriptRef.current.title}\n${localManuscriptRef.current.passage}\n\n${content}`
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${localManuscriptRef.current.title || 'sermon'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  const toggleVersions = useCallback(() => setSidebarTab(prev => prev === 'versions' ? null : 'versions'), [])
  const toggleDiagnosis = useCallback(() => setSidebarTab(prev => prev === 'diagnosis' ? null : 'diagnosis'), [])
  const openPractice = useCallback(() => setShowPractice(true), [])
  const openAntigravity = useCallback(() => setShowAntigravity(true), [])

  const handlePrint = useCallback(() => {
    const e = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const data = localManuscriptRef.current;

    const sectionHtml = data.sections.map(section => {
      const refNotes = referenceNotes.filter(n => n.linkedSectionId === section.id);
      const illNotes = illustrationNotes.filter(n => n.linkedSectionId === section.id);
      let html = `<div class="section">`;
      html += `<h2>${e(section.label)}${section.passage ? ` <span class="passage-label">(${e(section.passage)})</span>` : ''}</h2>`;
      html += `<div class="content">${e(section.content) || '<em>(내용 없음)</em>'}</div>`;
      if (refNotes.length > 0) {
        html += `<div class="notes ref-notes"><div class="notes-title">참고 메모</div>`;
        refNotes.forEach(n => { html += `<div class="note"><strong>${e(n.title)}:</strong> ${e(n.content)}</div>`; });
        html += `</div>`;
      }
      if (illNotes.length > 0) {
        html += `<div class="notes ill-notes"><div class="notes-title">예화 메모</div>`;
        illNotes.forEach(n => { html += `<div class="note"><strong>${e(n.title)}:</strong> ${e(n.content)}</div>`; });
        html += `</div>`;
      }
      html += `</div>`;
      return html;
    }).join('');

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none;';
    document.body.appendChild(iframe);
    const win = iframe.contentWindow!;
    const doc = win.document;
    doc.write(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${e(data.title || '설교 원고')}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { margin: 2cm; }
  body {
    font-family: 'Nanum Gothic', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
    color: #000;
    background: #fff;
    line-height: 1.8;
    font-size: 12pt;
    padding: 0;
  }
  h1 { text-align: center; font-size: 30pt; font-weight: bold; margin-bottom: 0.3rem; line-height: 1.3; }
  .passage { text-align: center; font-size: 14pt; color: #444; font-style: italic; margin-bottom: 1.5rem; }
  .core-message {
    background: #f5f5f5; border: 1px solid #ddd; border-radius: 8px;
    padding: 1rem 1.5rem; margin-bottom: 2rem; font-style: italic;
    font-size: 11pt; color: #333; text-align: center;
  }
  .section { margin-bottom: 2.5rem; }
  h2 {
    font-size: 20pt; font-weight: bold; margin-bottom: 0.75rem;
    padding-bottom: 0.4rem; border-bottom: 1px solid #ccc;
  }
  .passage-label { font-size: 11pt; color: #666; font-weight: normal; margin-left: 0.5rem; }
  .content {
    font-size: 12pt; line-height: 1.8; white-space: pre-wrap;
    text-align: justify; word-break: break-word;
  }
  .notes { margin-top: 1rem; padding-top: 0.75rem; border-top: 1px dashed #ccc; }
  .ref-notes { border-top-color: #aaa; }
  .ill-notes { border-top-color: #aaa; }
  .notes-title { font-size: 9pt; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem; }
  .note { font-size: 10pt; color: #444; padding-left: 0.5rem; border-left: 2px solid #ccc; margin-bottom: 0.3rem; line-height: 1.5; }
  .note strong { color: #222; }
</style>
</head>
<body>
  <h1>${e(data.title || '(제목 없음)')}</h1>
  <p class="passage">${e(data.passage)}</p>
  ${data.coreMessage ? `<div class="core-message">"${e(data.coreMessage)}"</div>` : ''}
  ${sectionHtml}
</body>
</html>`);
    doc.close();
    win.focus();
    win.print();
    setTimeout(() => { if (iframe.parentNode) iframe.parentNode.removeChild(iframe); }, 1000);
  }, [referenceNotes, illustrationNotes]);

  return (
    <div className="fixed inset-0 z-50 bg-[#04060f] flex flex-col">
      {/* Header */}
      <StudioHeader
        manuscript={localManuscript}
        totalWords={totalWords}
        isSaving={isSaving}
        lastSaved={lastSaved}
        sidebarTab={sidebarTab}
        versionsCount={versions.length}
        onToggleVersions={toggleVersions}
        onToggleDiagnosis={toggleDiagnosis}
        onPractice={openPractice}
        onRewrite={openAntigravity}
        onExport={handleExport}
        onPrint={handlePrint}
        onSave={() => handleSave()}
        onClose={onClose}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(prev => prev === 'edit' ? 'preview' : 'edit')}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Content */}
        <div className={`flex-1 overflow-y-auto scrollbar-thin ${sidebarTab ? 'mr-80' : ''}`}>
          <div className="max-w-[800px] mx-auto py-10 px-8 space-y-10 print-content">
            {/* Title & Meta */}
            <div className="text-center space-y-2 mb-12">
              <input
                value={localManuscript.title}
                onChange={e => setLocalManuscript(prev => ({ ...prev, title: e.target.value }))}
                className="w-full text-center text-3xl font-serif font-bold text-white bg-transparent border-none outline-none placeholder:text-slate-600 print:text-black print:placeholder:text-transparent"
                placeholder="설교 제목"
              />
              <p className="text-lg text-slate-400 font-serif italic print:text-gray-600">
                {localManuscript.passage}
              </p>
              {localManuscript.coreMessage && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mt-4 print:bg-gray-100 print:border-gray-300 print:text-gray-800">
                  <p className="text-sm text-indigo-200 font-serif print:text-gray-800">
                    &ldquo;{localManuscript.coreMessage}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Sections */}
            {localManuscript.sections.map((section) => (
              <div key={section.id} className="group mb-12">
                {/* Document Heading Style */}
                <div className="flex items-baseline gap-3 mb-6 border-b border-white/10 pb-3 print:border-gray-200">
                  <h2 className="text-2xl font-serif font-bold text-white print:text-black">
                    {section.label}
                  </h2>
                  {section.passage && (
                    <span className="text-sm text-slate-500 font-serif italic print:text-gray-600">
                      ({section.passage})
                    </span>
                  )}
                </div>

                {/* Content: Preview vs Edit */}
                {viewMode === 'preview' ? (
                  <div className="text-lg text-slate-200 leading-relaxed font-serif whitespace-pre-wrap print:text-black print:text-justify">
                    {section.content || <span className="text-slate-600 italic">내용을 입력하세요...</span>}
                  </div>
                ) : (
                  <textarea
                    value={section.content}
                    onChange={e => handleSectionChange(section.id, e.target.value)}
                    className="w-full min-h-[200px] text-lg text-slate-200 bg-transparent border-none outline-none resize-none leading-relaxed font-serif placeholder:text-slate-600 print:text-black print:placeholder:text-transparent"
                    placeholder={`${section.label} 내용을 작성하세요...`}
                  />
                )}

                {/* Linked Notes (Footnote Style) */}
                {referenceNotes.filter(n => n.linkedSectionId === section.id).length > 0 && (
                  <div className="mt-8 pt-6 border-t border-teal-500/20 print:border-gray-300">
                    <div className="flex items-center gap-2 text-[10px] text-teal-300 uppercase tracking-widest print:text-gray-500 mb-3">
                      <Sparkles className="w-3 h-3" />
                      참고 메모
                    </div>
                    <div className="space-y-3">
                      {referenceNotes.filter(n => n.linkedSectionId === section.id).map(note => (
                        <div key={note.id} className="text-sm text-slate-400 leading-relaxed border-l-2 border-teal-500/30 pl-4 print:text-gray-700 print:border-gray-400">
                          <span className="text-teal-200 font-medium print:text-gray-900">{note.title}:</span> {note.content}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {illustrationNotes.filter(n => n.linkedSectionId === section.id).length > 0 && (
                  <div className="mt-6 pt-6 border-t border-amber-500/20 print:border-gray-300">
                    <div className="flex items-center gap-2 text-[10px] text-amber-300 uppercase tracking-widest print:text-gray-500 mb-3">
                      <Sparkles className="w-3 h-3" />
                      예화 메모
                    </div>
                    <div className="space-y-3">
                      {illustrationNotes.filter(n => n.linkedSectionId === section.id).map(note => (
                        <div key={note.id} className="text-sm text-slate-400 leading-relaxed border-l-2 border-amber-500/30 pl-4 print:text-gray-700 print:border-gray-400">
                          <span className="text-amber-200 font-medium print:text-gray-900">{note.title}:</span> {note.content}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className="h-32" />
          </div>
        </div>

        {/* Sidebar */}
        {sidebarTab && (
          <div className="w-80 border-l border-white/5 bg-[#04060f] overflow-y-auto scrollbar-thin print:hidden no-print">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSidebarTab('versions')}
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      sidebarTab === 'versions' ? 'text-indigo-300 bg-indigo-500/10' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    버전
                  </button>
                  <button
                    onClick={() => setSidebarTab('diagnosis')}
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      sidebarTab === 'diagnosis' ? 'text-purple-300 bg-purple-500/10' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    AI 진단
                  </button>
                </div>
                <button onClick={() => setSidebarTab(null)} className="p-1 rounded hover:bg-white/10 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {sidebarTab === 'versions' && (
                <>
                  {/* New Version Note */}
                  <div className="space-y-2">
                    <textarea
                      value={versionNote}
                      onChange={e => setVersionNote(e.target.value)}
                      className="w-full text-xs text-slate-200 bg-[#0a0e1a] border border-white/5 rounded-lg p-2 outline-none resize-none focus:border-indigo-500/30"
                      rows={2}
                      placeholder="버전 메모 (선택)"
                    />
                    <button
                      onClick={() => handleSave()}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      새 버전 저장
                    </button>
                  </div>

                  {/* Version List */}
                  <div className="space-y-2">
                    {versions.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">아직 저장된 버전이 없습니다.</p>
                    ) : (
                      versions.map(v => (
                        <div
                          key={v.id}
                          className={`p-3 rounded-xl border cursor-pointer ${
                            selectedVersion?.id === v.id
                              ? 'bg-indigo-500/10 border-indigo-500/30'
                              : 'bg-[#0a0e1a] border-white/5 hover:border-white/20'
                          }`}
                          onClick={() => { setSelectedVersion(v); setShowDiff(false) }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-white">{v.label}</span>
                            <span className="text-[9px] text-slate-500">
                              {new Date(v.timestamp).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {v.note && <p className="text-[10px] text-slate-400 truncate">{v.note}</p>}
                          {selectedVersion?.id === v.id && (
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                              <button
                                onClick={() => setShowDiff(!showDiff)}
                                className="flex-1 flex items-center justify-center gap-1 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-slate-300"
                              >
                                <GitCompare className="w-3 h-3" />
                                비교
                              </button>
                              <button
                                onClick={() => handleRestore(v)}
                                className="flex-1 flex items-center justify-center gap-1 py-1 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-[10px] text-indigo-300"
                              >
                                <RotateCcw className="w-3 h-3" />
                                복원
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Diff View */}
                  {selectedVersion && showDiff && (
                    <div className="p-3 rounded-xl bg-[#0a0e1a] border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-white">변경 사항</span>
                        <button onClick={() => setShowDiff(false)} className="text-slate-500 hover:text-white">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-xs text-slate-300 leading-relaxed max-h-60 overflow-y-auto space-y-1">
                        {localManuscript.sections.map((section, idx) => {
                          const oldSection = selectedVersion.data.sections[idx]
                          if (!oldSection || oldSection.content === section.content) return null
                          return (
                            <div key={section.id} className="space-y-1">
                              <p className="text-[10px] font-bold text-slate-400">{section.label}</p>
                              <DiffText oldText={oldSection.content} newText={section.content} />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {sidebarTab === 'diagnosis' && (
                <ManuscriptDiagnosis
                  manuscript={localManuscript}
                  referenceNotes={referenceNotes}
                  illustrationNotes={illustrationNotes}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Practice Mode */}
      {showPractice && (
        <PracticeMode
          manuscript={localManuscript}
          onClose={() => setShowPractice(false)}
        />
      )}

      {showAntigravity && (
        <AntigravityRewritePanel
          manuscript={localManuscript}
          projectId={projectId}
          onClose={() => setShowAntigravity(false)}
        />
      )}
    </div>
  )
}

function DiffText({ oldText, newText }: { oldText: string; newText: string }) {
  const oldWords = oldText.split(/(\s+)/)
  const newWords = newText.split(/(\s+)/)
  const result: { type: 'same' | 'added' | 'removed'; text: string }[] = []

  let i = 0, j = 0
  while (i < oldWords.length || j < newWords.length) {
    if (i >= oldWords.length) {
      result.push({ type: 'added', text: newWords.slice(j).join('') })
      break
    }
    if (j >= newWords.length) {
      result.push({ type: 'removed', text: oldWords.slice(i).join('') })
      break
    }
    if (oldWords[i] === newWords[j]) {
      result.push({ type: 'same', text: oldWords[i] })
      i++
      j++
    } else {
      let found = false
      for (let k = j + 1; k < Math.min(j + 5, newWords.length); k++) {
        if (oldWords[i] === newWords[k]) {
          result.push({ type: 'added', text: newWords.slice(j, k).join('') })
          result.push({ type: 'same', text: oldWords[i] })
          j = k + 1
          i++
          found = true
          break
        }
      }
      if (!found) {
        result.push({ type: 'removed', text: oldWords[i] })
        i++
      }
    }
  }

  return (
    <p>
      {result.map((r, idx) => (
        <span
          key={idx}
          className={
            r.type === 'added' ? 'bg-green-500/20 text-green-300' :
            r.type === 'removed' ? 'bg-red-500/20 text-red-300 line-through' :
            'text-slate-300'
          }
        >
          {r.text}
        </span>
      ))}
    </p>
  )
}
