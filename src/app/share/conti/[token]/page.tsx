'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import type { ContiSet, ContiItem, MusicKey } from '@/types/conti'
import { WORSHIP_TYPE_META } from '@/types/conti'
import { KEY_DISPLAY } from '@/lib/conti/keyTheory'
import {
  getMockShareContiId, loadMockContiDetail, loadMockContiList, seedMockShareTokens,
} from '@/lib/conti/mockStorage'
import { SAMPLE_CONTIS, SAMPLE_CONTI_ITEMS, getSampleSongById } from '@/lib/conti/samples'
import { Music, Clock, Calendar, ArrowLeft, AlertCircle, Printer, ExternalLink } from 'lucide-react'
import Link from 'next/link'

function formatDate(iso: string | null): string {
  if (!iso) return '날짜 미정'
  const d = new Date(iso)
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${dayNames[d.getDay()]})`
}

function getEffectiveKey(item: ContiItem): MusicKey | null {
  if (item.key) return item.key
  if (item.song?.original_key) return item.song.original_key
  return null
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function SharedContiPage() {
  const params = useParams<{ token: string }>()
  const router = useRouter()
  const token = params?.token || ''

  const [conti, setConti] = useState<ContiSet | null>(null)
  const [items, setItems] = useState<ContiItem[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!token) {
      setNotFound(true)
      setLoading(false)
      return
    }

    // 0) 샘플 콘티의 시드 토큰 자동 등록
    seedMockShareTokens()

    // 1) mockStorage 에서 토큰 → 콘티 ID 매핑
    const contiId = getMockShareContiId(token)
    if (!contiId) {
      setNotFound(true)
      setLoading(false)
      return
    }

    // 2) 콘티 ID로 콘티 + items 로드
    let foundConti: ContiSet | null = null
    let foundItems: ContiItem[] = []

    // 2-a) localStorage mock 에서
    const stored = loadMockContiDetail(contiId)
    if (stored) {
      foundConti = stored.conti
      foundItems = stored.items
    } else {
      // 2-b) Sample 데이터에서
      const allContis = loadMockContiList()
      const localConti = allContis.find((c) => c.id === contiId)
      if (localConti) {
        foundConti = localConti
        foundItems = SAMPLE_CONTI_ITEMS[contiId] || []
      } else {
        const sampleConti = SAMPLE_CONTIS.find((c) => c.id === contiId)
        if (sampleConti) {
          foundConti = sampleConti
          foundItems = SAMPLE_CONTI_ITEMS[contiId] || []
        }
      }
    }

    if (!foundConti) {
      setNotFound(true)
      setLoading(false)
      return
    }

    // 3) 공개 여부 확인
    if (!foundConti.is_public) {
      setNotFound(true)
      setLoading(false)
      return
    }

    // 4) items에 song 정보 보강
    const itemsWithSong = foundItems.map((it) => ({
      ...it,
      song: it.song || getSampleSongById(it.song_id) || undefined,
    }))

    setConti(foundConti)
    setItems(itemsWithSong)
    setLoading(false)
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050814] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
          <p className="text-[12px] text-slate-500 font-medium">콘티를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (notFound || !conti) {
    return (
      <div className="min-h-screen bg-[#050814] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-rose-400" />
          </div>
          <h1 className="text-[18px] font-extrabold text-white mb-2">콘티를 찾을 수 없습니다</h1>
          <p className="text-[12px] text-slate-400 font-medium leading-relaxed">
            공유 링크가 만료되었거나, 비공개로 전환되었거나,<br />
            존재하지 않는 콘티입니다.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 mt-5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[12px] font-bold text-slate-200 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Bunker 목양으로 이동
          </Link>
        </div>
      </div>
    )
  }

  // 통계
  const totalDuration = items.reduce((a, i) => a + (i.song?.duration_sec || 0), 0)
  const avgBpm = items.length > 0
    ? Math.round(items.reduce((a, i) => a + (i.bpm_override ?? i.song?.bpm ?? 0), 0) / items.length)
    : 0

  return (
    <div className="min-h-screen bg-[#050814] text-slate-200">
      {/* 배경 글로우 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-5 py-8 space-y-6">
        {/* 상단: 작은 헤더 */}
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-3 h-3" />
            Bunker 목양
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-medium hidden sm:block">
              {formatDate(conti.date)}
            </span>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] font-bold text-slate-300 hover:bg-white/10 transition-colors"
            >
              <Printer className="w-3 h-3" />
              인쇄
            </button>
          </div>
        </div>

        {/* 메인: 콘티 카드 */}
        <div className="rounded-3xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 overflow-hidden shadow-2xl">
          {/* 표지 */}
          <div className="px-8 py-10 border-b border-white/5 text-center">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-3">
              <Music className="w-3 h-3 text-indigo-300" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300">
                예배 콘티
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 mb-3">
              <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                WORSHIP_TYPE_META[conti.worship_type].color === 'amber' ? 'bg-amber-500/15 text-amber-300' :
                WORSHIP_TYPE_META[conti.worship_type].color === 'emerald' ? 'bg-emerald-500/15 text-emerald-300' :
                WORSHIP_TYPE_META[conti.worship_type].color === 'rose' ? 'bg-rose-500/15 text-rose-300' :
                'bg-indigo-500/15 text-indigo-300'
              }`}>
                {WORSHIP_TYPE_META[conti.worship_type].label}
              </span>
            </div>

            <h1 className="text-[28px] sm:text-[32px] font-extrabold text-white tracking-tight leading-tight">
              {conti.title}
            </h1>

            <div className="flex items-center justify-center gap-3 mt-3 text-[12px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(conti.date)}
              </span>
              <span className="text-slate-700">·</span>
              <span>{items.length}곡</span>
              {totalDuration > 0 && (
                <>
                  <span className="text-slate-700">·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(totalDuration)}
                  </span>
                </>
              )}
              {avgBpm > 0 && (
                <>
                  <span className="text-slate-700">·</span>
                  <span>♩{avgBpm}</span>
                </>
              )}
            </div>

            {conti.memo && (
              <div className="mt-5 max-w-md mx-auto px-4 py-3 rounded-xl bg-amber-500/[0.05] border border-amber-500/15">
                <p className="text-[11px] text-amber-100/90 font-medium leading-relaxed whitespace-pre-wrap">
                  {conti.memo}
                </p>
              </div>
            )}
          </div>

          {/* 곡 리스트 */}
          <div className="px-6 py-5">
            <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-3">
              곡 순서
            </h2>
            <div className="space-y-2.5">
              {items.map((it, idx) => {
                const k = getEffectiveKey(it)
                const bpm = it.bpm_override ?? it.song?.bpm
                const lyrics = (it.song?.lyrics || '').split('\n').filter((l) => l.trim())
                return (
                  <div key={it.id} className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-[12px] font-extrabold text-indigo-300 flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[14px] font-extrabold text-white">
                          {it.song?.title || '(삭제된 곡)'}
                        </h3>
                        {it.song?.artist && (
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                            {it.song.artist}
                          </p>
                        )}

                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          {k && (
                            <span className="text-[10px] font-extrabold text-white px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                              {KEY_DISPLAY[k] || k}
                            </span>
                          )}
                          {bpm && (
                            <span className="text-[10px] text-slate-300 font-bold">♩ {bpm}</span>
                          )}
                          {it.song?.duration_sec && (
                            <span className="text-[10px] text-slate-500 font-medium">
                              {formatTime(it.song.duration_sec)}
                            </span>
                          )}
                          {it.song?.tags && it.song.tags.length > 0 && (
                            <span className="text-[9px] text-slate-500 font-medium ml-auto">
                              {it.song.tags.slice(0, 3).map((t) => `#${t}`).join(' ')}
                            </span>
                          )}
                        </div>

                        {it.transition_memo && (
                          <div className="mt-2.5 px-3 py-2 rounded-lg bg-yellow-500/10 border-l-2 border-yellow-400 text-[10px] text-yellow-100 font-medium">
                            <strong className="text-yellow-300">전환:</strong> {it.transition_memo}
                          </div>
                        )}

                        {it.memo && (
                          <div className="mt-1.5 px-3 py-2 rounded-lg bg-blue-500/10 border-l-2 border-blue-400 text-[10px] text-blue-100 font-medium">
                            <strong className="text-blue-300">메모:</strong> {it.memo}
                          </div>
                        )}

                        {lyrics.length > 0 && (
                          <details className="mt-3 group">
                            <summary className="cursor-pointer text-[10px] font-bold text-slate-400 hover:text-slate-200 list-none flex items-center gap-1">
                              <span className="group-open:rotate-90 transition-transform">▸</span>
                              가사 보기
                            </summary>
                            <div className="mt-2 px-3 py-2.5 rounded-lg bg-black/30 text-[12px] text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                              {lyrics.map((line, i) => (
                                <div key={i}>{line}</div>
                              ))}
                            </div>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 푸터 */}
          <div className="px-6 py-4 border-t border-white/5 bg-white/[0.02] text-center">
            <p className="text-[10px] text-slate-500 font-medium">
              🎵 <strong className="text-slate-300">Bunker 목양</strong>으로 만든 콘티입니다
            </p>
            <p className="text-[9px] text-slate-600 font-medium mt-1">
              {new Date().toLocaleString('ko-KR')}
            </p>
          </div>
        </div>

        {/* 인쇄 안내 (인쇄 시 숨김) */}
        <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3.5 flex items-start gap-2.5 print:hidden">
          <Printer className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
            인쇄 버튼을 누르면 곡 정보 + 가사가 한 장에 깔끔하게 출력됩니다. 찬양팀은 종이로 받아 연습할 수 있어요.
          </p>
        </div>
      </div>

      {/* 인쇄 전용 CSS */}
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          @page { size: A4; margin: 12mm; }
        }
      `}</style>
    </div>
  )
}
