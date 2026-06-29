'use client'

import type { ContiSet, ContiItem, MusicKey } from '@/types/conti'
import type { PrintMode } from '@/types/conti'
import { PRINT_MODE_META } from '@/types/conti'
import { KEY_DISPLAY } from '@/lib/conti/keyTheory'
import { WORSHIP_TYPE_META } from '@/types/conti'
import { Music, Clock } from 'lucide-react'

interface Props {
  conti: ContiSet
  items: ContiItem[]
  mode: PrintMode
}

function getEffectiveKey(item: ContiItem): MusicKey | null {
  if (item.key) return item.key
  if (item.song?.original_key) return item.song.original_key
  return null
}

function formatDate(iso: string | null): string {
  if (!iso) return '날짜 미정'
  const d = new Date(iso)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// === 모드별 미리보기 ===

function TeamModePreview({ conti, items }: Props) {
  return (
    <div className="text-[11pt] text-black bg-white p-8 leading-relaxed" style={{ minHeight: '100%' }}>
      <div className="border-b-2 border-black pb-3 mb-4">
        <h1 className="text-[18pt] font-bold text-center">{conti.title}</h1>
        <div className="text-center text-[9pt] mt-1 text-gray-700">
          {formatDate(conti.date)} · {WORSHIP_TYPE_META[conti.worship_type].label} · {items.length}곡
        </div>
      </div>

      <table className="w-full text-[10pt]">
        <thead>
          <tr className="border-b border-black">
            <th className="text-left py-1 w-6">#</th>
            <th className="text-left py-1">곡 제목</th>
            <th className="text-left py-1 w-20">Key</th>
            <th className="text-right py-1 w-12">BPM</th>
            <th className="text-right py-1 w-12">길이</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, idx) => {
            const k = getEffectiveKey(it)
            const bpm = it.bpm_override ?? it.song?.bpm
            return (
              <tr key={it.id} className="border-b border-gray-300">
                <td className="py-1.5 font-bold">{idx + 1}</td>
                <td className="py-1.5">
                  <div className="font-bold">{it.song?.title || '(삭제됨)'}</div>
                  {it.song?.artist && <div className="text-[8pt] text-gray-600">{it.song.artist}</div>}
                </td>
                <td className="py-1.5 font-mono">{k ? KEY_DISPLAY[k] || k : '-'}</td>
                <td className="py-1.5 text-right font-mono">{bpm ? `♩${bpm}` : '-'}</td>
                <td className="py-1.5 text-right font-mono">{it.song?.duration_sec ? formatTime(it.song.duration_sec) : '-'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {items.length > 0 && (
        <div className="mt-3 text-[9pt] text-gray-700">
          <strong>전곡 메모:</strong>
          {items.filter((it) => it.transition_memo).length > 0 ? (
            <ul className="mt-1 list-disc pl-5">
              {items.map((it, idx) => it.transition_memo && (
                <li key={it.id}><strong>{idx + 1}번 →</strong> {it.transition_memo}</li>
              ))}
            </ul>
          ) : (
            <span className="ml-1">없음</span>
          )}
        </div>
      )}

      <div className="mt-6 text-[8pt] text-gray-500 text-center">
        출력: {new Date().toLocaleString('ko-KR')}
      </div>
    </div>
  )
}

function LeaderModePreview({ conti, items }: Props) {
  return (
    <div className="bg-white text-black" style={{ minHeight: '100%' }}>
      {/* 표지 */}
      <div className="p-12 border-b-2 border-black" style={{ pageBreakAfter: 'always' }}>
        <h1 className="text-[32pt] font-extrabold text-center mt-12">{conti.title}</h1>
        <div className="text-center text-[14pt] mt-3 text-gray-700">
          {formatDate(conti.date)}
        </div>
        <div className="text-center text-[12pt] mt-1 text-gray-600">
          {WORSHIP_TYPE_META[conti.worship_type].label}
        </div>

        <div className="mt-12 max-w-md mx-auto">
          <div className="border-t border-gray-300 pt-3">
            <p className="text-[10pt] font-bold text-gray-600 mb-1">예배 메모</p>
            <p className="text-[11pt] whitespace-pre-wrap">{conti.memo || '(메모 없음)'}</p>
          </div>
        </div>

        <div className="mt-6 max-w-md mx-auto grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-[9pt] text-gray-500">곡 수</div>
            <div className="text-[20pt] font-extrabold">{items.length}</div>
          </div>
          <div>
            <div className="text-[9pt] text-gray-500">총 길이</div>
            <div className="text-[20pt] font-extrabold font-mono">
              {formatTime(items.reduce((a, i) => a + (i.song?.duration_sec || 0), 0))}
            </div>
          </div>
          <div>
            <div className="text-[9pt] text-gray-500">평균 BPM</div>
            <div className="text-[20pt] font-extrabold font-mono">
              ♩{Math.round(items.reduce((a, i) => a + (i.bpm_override ?? i.song?.bpm ?? 0), 0) / Math.max(items.length, 1))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 text-center text-[9pt] text-gray-500">
          Bunker 목양 · 예배 콘티 · {new Date().toLocaleDateString('ko-KR')}
        </div>
      </div>

      {/* 곡별 페이지 */}
      {items.map((it, idx) => {
        const k = getEffectiveKey(it)
        const bpm = it.bpm_override ?? it.song?.bpm
        const lyrics = (it.song?.lyrics || '').split('\n').filter((l) => l.trim())
        return (
          <div
            key={it.id}
            className="p-10"
            style={{ pageBreakBefore: 'always', minHeight: '100vh' }}
          >
            <div className="flex items-baseline justify-between border-b-2 border-black pb-2 mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-[20pt] font-extrabold">{idx + 1}.</span>
                <h2 className="text-[20pt] font-extrabold">{it.song?.title || '(삭제됨)'}</h2>
              </div>
              <div className="text-[10pt] text-gray-700 text-right">
                {k && <div className="font-mono font-bold">Key: {KEY_DISPLAY[k] || k}</div>}
                {bpm && <div className="font-mono">♩{bpm}</div>}
                {it.song?.duration_sec && <div className="text-[9pt] text-gray-500">{formatTime(it.song.duration_sec)}</div>}
              </div>
            </div>

            {it.song?.artist && (
              <div className="text-[10pt] text-gray-600 mb-3">{it.song.artist}</div>
            )}

            {it.transition_memo && (
              <div className="mb-3 px-3 py-2 bg-yellow-50 border-l-4 border-yellow-400 text-[10pt]">
                <strong>전환:</strong> {it.transition_memo}
              </div>
            )}

            {lyrics.length > 0 ? (
              <div className="text-[12pt] leading-loose whitespace-pre-wrap font-medium">
                {lyrics.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            ) : (
              <div className="text-[10pt] text-gray-400 italic">가사 정보 없음</div>
            )}

            {it.memo && (
              <div className="mt-4 px-3 py-2 bg-blue-50 border-l-4 border-blue-400 text-[10pt]">
                <strong>메모:</strong> {it.memo}
              </div>
            )}

            <div className="mt-6 pt-3 border-t border-gray-300 text-[8pt] text-gray-500 text-center">
              {conti.title} · {idx + 1}/{items.length}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PptModePreview({ conti, items }: Props) {
  return (
    <div className="bg-white text-black" style={{ minHeight: '100%' }}>
      {/* 표지 슬라이드 */}
      <div
        className="p-12 flex flex-col items-center justify-center"
        style={{ pageBreakAfter: 'always', height: '100vh' }}
      >
        <div className="text-[14pt] text-gray-500 mb-2">{formatDate(conti.date)}</div>
        <h1 className="text-[40pt] font-extrabold text-center leading-tight">{conti.title}</h1>
        <div className="text-[18pt] text-gray-600 mt-2">{WORSHIP_TYPE_META[conti.worship_type].label}</div>
        {conti.memo && (
          <p className="text-[12pt] text-gray-500 mt-6 text-center max-w-md whitespace-pre-wrap">
            {conti.memo}
          </p>
        )}
      </div>

      {/* 곡당 슬라이드 (가사만 큼지막하게) */}
      {items.map((it, idx) => {
        const lines = (it.song?.lyrics || '').split('\n').filter((l) => l.trim())
        // 너무 길면 2슬라이드로 분할
        const half = Math.ceil(lines.length / 2)
        const part1 = lines.slice(0, half)
        const part2 = lines.slice(half)
        return (
          <div key={it.id}>
            {[{ lines: part1, part: 1 }, { lines: part2, part: 2 }].filter((p) => p.lines.length > 0).map(({ lines: lns, part }) => (
              <div
                key={`${it.id}-${part}`}
                className="p-12 flex flex-col"
                style={{ pageBreakBefore: 'always', minHeight: '100vh' }}
              >
                <div className="flex items-baseline justify-between border-b-2 border-black pb-3 mb-8">
                  <div className="flex items-baseline gap-3">
                    <span className="text-[28pt] font-extrabold text-gray-400">{idx + 1}.</span>
                    <h2 className="text-[28pt] font-extrabold leading-tight">{it.song?.title || '(삭제됨)'}</h2>
                  </div>
                  <div className="text-[10pt] text-gray-500">
                    {part === 2 && part2.length > 0 ? `${part}/${Math.ceil(lines.length / half)}` : ''}
                  </div>
                </div>
                <div className="text-[24pt] leading-snug whitespace-pre-wrap font-medium flex-1 flex flex-col justify-center">
                  {lns.map((line, i) => (
                    <div key={i} className="py-1">{line}</div>
                  ))}
                </div>
                <div className="mt-6 text-[10pt] text-gray-400 text-center">
                  {it.song?.artist}
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export default function PrintPreview({ conti, items, mode }: Props) {
  const meta = PRINT_MODE_META[mode]
  if (mode === 'team') return <TeamModePreview conti={conti} items={items} mode={mode} />
  if (mode === 'leader') return <LeaderModePreview conti={conti} items={items} mode={mode} />
  if (mode === 'ppt') return <PptModePreview conti={conti} items={items} mode={mode} />
  return null
}
