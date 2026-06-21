'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, X, Trash2, AlertTriangle } from 'lucide-react'
import SermonSeriesPlanner from '@/components/advanced/SermonSeriesPlanner'

interface DbSeries {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  status: string
  isSample: boolean
  createdAt: string
}

const STATUS_LABELS: Record<string, string> = {
  active: '진행중',
  completed: '완료',
  paused: '일시중지',
  planned: '예정',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  completed: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  paused: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  planned: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
}

export default function SeriesPage() {
  const router = useRouter()
  const [series, setSeries] = useState<DbSeries[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPlanner, setShowPlanner] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [bulkBusy, setBulkBusy] = useState<'all' | 'sample' | null>(null)
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
  const [confirm, setConfirm] = useState<null | { kind: 'delete-one'; id: string; name: string } | { kind: 'delete-all' } | { kind: 'delete-sample' }>(null)

  const showToast = useCallback((kind: 'success' | 'error', text: string) => {
    setToast({ kind, text })
    setTimeout(() => setToast(null), 2500)
  }, [])

  const fetchSeries = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/series')
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || '조회 실패')
      setSeries(json.data || [])
    } catch (e: any) {
      setError(e?.message || '불러오기 실패')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSeries() }, [fetchSeries])

  const sampleCount = useMemo(() => series.filter((s) => s.isSample).length, [series])

  const filtered = useMemo(() => {
    if (filterStatus === 'active') return series.filter((s) => s.status === 'active' || s.status === 'planned')
    if (filterStatus === 'completed') return series.filter((s) => s.status === 'completed')
    return series
  }, [series, filterStatus])

  const counts = useMemo(() => ({
    all: series.length,
    active: series.filter((s) => s.status === 'active' || s.status === 'planned').length,
    completed: series.filter((s) => s.status === 'completed').length,
  }), [series])

  const deleteOne = useCallback(async (id: string) => {
    setBusyId(id)
    try {
      const res = await fetch(`/api/series/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || '삭제 실패')
      setSeries((prev) => prev.filter((s) => s.id !== id))
      showToast('success', '삭제되었습니다')
    } catch (e: any) {
      showToast('error', e?.message || '삭제 실패')
    } finally {
      setBusyId(null)
    }
  }, [showToast])

  const bulkDelete = useCallback(async (filter: 'all' | 'sample') => {
    setBulkBusy(filter)
    try {
      const res = await fetch('/api/series/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filter }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || '일괄 삭제 실패')
      await fetchSeries()
      showToast('success', json.message || `${json.deleted}개 삭제됨`)
    } catch (e: any) {
      showToast('error', e?.message || '일괄 삭제 실패')
    } finally {
      setBulkBusy(null)
    }
  }, [fetchSeries, showToast])

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-white">설교 시리즈</h1>
          <p className="text-xs text-slate-500 font-bold mt-1">
            연속 설교를 계획하고 관리합니다 · 총 {series.length}개
            {sampleCount > 0 && <span className="text-violet-400 ml-1">· 샘플 {sampleCount}개</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {sampleCount > 0 && (
            <button
              onClick={() => setConfirm({ kind: 'delete-sample' })}
              disabled={bulkBusy !== null}
              className="flex items-center gap-1.5 text-[11px] font-bold text-violet-300 border border-violet-500/30 rounded-xl px-3 py-2 hover:bg-violet-500/10 transition-colors disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              샘플 {sampleCount}개 일괄 삭제
            </button>
          )}
          {series.length > 0 && (
            <button
              onClick={() => setConfirm({ kind: 'delete-all' })}
              disabled={bulkBusy !== null}
              className="flex items-center gap-1.5 text-[11px] font-bold text-red-300 border border-red-500/30 rounded-xl px-3 py-2 hover:bg-red-500/10 transition-colors disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              전체 삭제
            </button>
          )}
          <button
            onClick={() => setShowPlanner(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[13px] font-bold shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4" />
            AI로 시리즈 만들기
          </button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-1.5 mb-6 bg-white/5 border border-white/5 rounded-xl p-0.5 w-fit">
        <FilterBtn label={`전체 (${counts.all})`} active={filterStatus === 'all'} onClick={() => setFilterStatus('all')} />
        <FilterBtn label={`진행중 (${counts.active})`} active={filterStatus === 'active'} onClick={() => setFilterStatus('active')} />
        <FilterBtn label={`완료 (${counts.completed})`} active={filterStatus === 'completed'} onClick={() => setFilterStatus('completed')} />
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-3 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin" />
            <p className="text-xs text-slate-500 font-medium">시리즈를 불러오는 중...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-[#04060f]/60 rounded-2xl border border-red-500/20 p-6 text-center">
          <p className="text-sm text-red-300 font-bold mb-2">시리즈를 불러올 수 없습니다</p>
          <p className="text-xs text-slate-500 mb-3">{error}</p>
          <button onClick={fetchSeries} className="text-[11px] font-bold text-indigo-300 border border-indigo-500/30 rounded-lg px-3 py-1.5 hover:bg-indigo-500/10">
            다시 시도
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#04060f]/60 rounded-2xl border border-white/5 py-16">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-indigo-300" />
            </div>
            <p className="text-sm text-slate-300 font-bold mb-1">
              {series.length === 0 ? '아직 시리즈가 없습니다' : '조건에 맞는 시리즈가 없습니다'}
            </p>
            <p className="text-xs text-slate-500 mb-4">
              {series.length === 0
                ? 'AI 플래너로 첫 시리즈를 만들어보세요'
                : '다른 필터를 선택해보세요'}
            </p>
            {series.length === 0 && (
              <button
                onClick={() => setShowPlanner(true)}
                className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
              >
                + AI로 첫 시리즈 만들기
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((s) => (
            <SeriesCard
              key={s.id}
              series={s}
              busy={busyId === s.id}
              onOpen={() => router.push(`/advanced/series/${s.id}`)}
              onDelete={() => setConfirm({ kind: 'delete-one', id: s.id, name: s.name })}
            />
          ))}
        </div>
      )}

      {/* AI Planner Modal */}
      {showPlanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03050c]/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0a0e1a] border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="text-[14px] font-bold text-white">설교 시리즈 플래너</h3>
              </div>
              <button onClick={() => setShowPlanner(false)} className="p-1.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SermonSeriesPlanner frequentTopics={[]} />
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirm && (
        <ConfirmDialog
          confirm={confirm}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            if (confirm.kind === 'delete-one') deleteOne(confirm.id)
            else if (confirm.kind === 'delete-all') bulkDelete('all')
            else if (confirm.kind === 'delete-sample') bulkDelete('sample')
            setConfirm(null)
          }}
          loading={busyId !== null || bulkBusy !== null}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl border backdrop-blur-md text-xs font-bold transition-all ${
          toast.kind === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          {toast.text}
        </div>
      )}

      {bulkBusy && (
        <div className="fixed top-4 right-4 z-50 px-3 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-[10px] text-indigo-300 font-bold flex items-center gap-1.5 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          {bulkBusy === 'all' ? '전체 삭제 중...' : '샘플 삭제 중...'}
        </div>
      )}
    </div>
  )
}

function FilterBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-1.5 text-[11px] rounded-lg font-bold transition-colors ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-slate-500 hover:text-slate-300'}`}>
      {label}
    </button>
  )
}

function SeriesCard({ series, busy, onOpen, onDelete }: { series: DbSeries; busy: boolean; onOpen: () => void; onDelete: () => void }) {
  const isCompleted = series.status === 'completed'
  const isSample = series.isSample
  const dateRange = [series.startDate, series.endDate].filter(Boolean).join(' ~ ') || null

  return (
    <div onClick={onOpen}
      className="relative bg-[#04060f]/60 rounded-2xl border border-white/5 overflow-hidden hover:border-indigo-500/30 transition-all cursor-pointer group">
      <div className={`h-1 ${isCompleted ? 'bg-emerald-500' : isSample ? 'bg-violet-500' : 'bg-amber-500'}`} />

      <button
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        disabled={busy}
        className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-30"
        title="삭제"
      >
        {busy ? (
          <span className="block w-3.5 h-3.5 rounded-full border-2 border-red-300/30 border-t-red-300 animate-spin" />
        ) : (
          <Trash2 className="w-3.5 h-3.5" />
        )}
      </button>

      <div className="p-5">
        <div className="flex items-start gap-2 mb-1.5 pr-8">
          <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2">{series.name || '(이름 없음)'}</h3>
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          {isSample && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/20">샘플</span>
          )}
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${STATUS_COLORS[series.status] || STATUS_COLORS.planned}`}>
            {STATUS_LABELS[series.status] || series.status}
          </span>
        </div>

        {series.description && (
          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3 font-medium">{series.description}</p>
        )}

        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-bold">
          <span>{dateRange || '날짜 미설정'}</span>
          <span className="text-indigo-400 group-hover:underline">상세보기 →</span>
        </div>
      </div>
    </div>
  )
}

function ConfirmDialog({ confirm, onCancel, onConfirm, loading }: {
  confirm: { kind: 'delete-one'; id: string; name: string } | { kind: 'delete-all' } | { kind: 'delete-sample' }
  onCancel: () => void
  onConfirm: () => void
  loading: boolean
}) {
  const titleMap = {
    'delete-one': '시리즈 삭제',
    'delete-all': '전체 시리즈 삭제',
    'delete-sample': '샘플 시리즈 일괄 삭제',
  }
  const descMap = {
    'delete-one': `「${('name' in confirm) ? confirm.name : ''}」을(를) 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
    'delete-all': '모든 시리즈를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.',
    'delete-sample': '샘플로 표시된 모든 시리즈를 삭제합니다.\n본인이 직접 만든 시리즈는 보호됩니다.',
  }
  const isDestructive = confirm.kind === 'delete-all'
  const isSafe = confirm.kind === 'delete-sample'

  return (
    <div className="fixed inset-0 z-50 bg-[#03050c]/80 backdrop-blur-md flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-[#0c1020] border border-white/10 rounded-2xl shadow-2xl w-[420px] max-w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isDestructive ? 'bg-red-500/15' : isSafe ? 'bg-violet-500/15' : 'bg-amber-500/15'
            }`}>
              <AlertTriangle className={`w-4 h-4 ${
                isDestructive ? 'text-red-400' : isSafe ? 'text-violet-400' : 'text-amber-400'
              }`} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">{titleMap[confirm.kind]}</h3>
              <p className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-line font-medium">{descMap[confirm.kind]}</p>
            </div>
          </div>
        </div>
        <div className="flex border-t border-white/5">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 text-xs font-bold text-slate-300 py-3 hover:bg-white/5 transition-colors disabled:opacity-50 border-r border-white/5"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 text-xs font-bold py-3 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 ${
              isDestructive
                ? 'text-red-300 hover:bg-red-500/15'
                : isSafe
                  ? 'text-violet-300 hover:bg-violet-500/15'
                  : 'text-amber-300 hover:bg-amber-500/15'
            }`}
          >
            {loading && <span className="w-3 h-3 rounded-full border-2 border-current/30 border-t-current animate-spin" />}
            {loading ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>
    </div>
  )
}
