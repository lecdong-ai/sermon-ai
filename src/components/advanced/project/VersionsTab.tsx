'use client'

import { useRouter } from 'next/navigation'
import { ProjectDetail } from '@/lib/advanced/types'

interface Props { project: ProjectDetail }

export default function VersionsTab({ project }: Props) {
  const router = useRouter()

  return (
    <div className="space-y-6">

      {/* ─── 버전 타임라인 ─── */}
      <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-5">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-4">버전 기록</div>
        <div className="relative">
          {/* 타임라인 선 */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-white/5" />

          <div className="space-y-0">
            {project.versions.map((v, i) => (
              <div key={v.id} className="relative flex gap-4 pb-6 last:pb-0">
                {/* 타임라인 점 */}
                <div className="flex flex-col items-center shrink-0 z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    i === 0
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/15'
                      : 'bg-[#04060f]/60 text-slate-400 border-white/5'
                  }`}>
                    v{v.version}
                  </div>
                </div>

                {/* 내용 */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      v.changedBy === 'user' ? 'bg-indigo-500/10 text-indigo-300' :
                      v.changedBy === 'ai' ? 'bg-blue-500/10 text-blue-300' :
                      'bg-white/5 text-slate-300'
                    }`}>
                      {v.changedBy === 'user' ? '사용자' : v.changedBy === 'ai' ? 'AI 생성' : '자동'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {new Date(v.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-100">{v.summary}</p>
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => router.push(`/advanced/projects/${project.id}?tab=manuscript`)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      이 버전으로 복원
                    </button>
                    <span className="text-slate-600">·</span>
                    <button className="text-[11px] text-slate-400 hover:text-indigo-400">
                      자세히 보기
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 변경 내용 비교 ─── */}
      <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">변경 내용 (v3 → v2)</div>
          <button className="text-[11px] text-slate-500 hover:text-indigo-400 transition-colors">
            다른 버전 비교 →
          </button>
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex-1 min-w-[180px] bg-indigo-500/10 rounded-xl p-3 border border-indigo-500/20">
            <div className="text-indigo-400 font-bold mb-1.5">+ 추가</div>
            <div className="text-slate-100 text-[11px] leading-relaxed">대지 3번 &ldquo;부활의 소망과 확신&rdquo; 항목 설명 보강, 서론 문장 2개 추가</div>
          </div>
          <div className="flex-1 min-w-[180px] bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
            <div className="text-amber-300 font-bold mb-1.5">~ 수정</div>
            <div className="text-slate-100 text-[11px] leading-relaxed">중심명제 문구 수정: &ldquo;성령의 사역&rdquo; → &ldquo;성령께서 그리스도 안에서&rdquo;</div>
          </div>
          <div className="flex-1 min-w-[180px] bg-red-500/10 rounded-xl p-3 border border-red-500/20">
            <div className="text-red-300 font-bold mb-1.5">- 삭제</div>
            <div className="text-slate-100 text-[11px] leading-relaxed">1차 서론의 예화 문장 1개 제거 (분량 조정)</div>
          </div>
        </div>
      </div>

      {/* ─── 자동 저장 히스토리 ─── */}
      <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-5">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">자동 저장 히스토리</div>
        <div className="space-y-1.5">
          {[
            { time: '14:30', desc: '본론 2대지 문장 수정' },
            { time: '14:15', desc: '적용 블록 추가' },
            { time: '13:50', desc: '서론 문단 재구성' },
            { time: '13:30', desc: '중심명제 수정' },
            { time: '12:45', desc: '대지 1번 설명 보강' },
            { time: '11:20', desc: '제목 변경' },
          ].map((entry, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-white/5 transition-colors">
              <span className="text-[10px] text-slate-500 w-10 text-right font-mono">{entry.time}</span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span className="text-xs text-slate-200">{entry.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 하단 네비게이션 ─── */}
      <div className="flex items-center gap-3 pb-8 pt-2">
        <button
          onClick={() => router.push(`/advanced/projects/${project.id}?tab=connections`)}
          className="text-sm border border-white/5 hover:border-indigo-500/30 text-slate-200 hover:text-indigo-400 px-5 py-2.5 rounded-xl transition-colors"
        >
          ← 연결 보기
        </button>
        <button
          onClick={() => router.push(`/advanced/projects/${project.id}?tab=overview`)}
          className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-colors font-medium"
        >
          개요로 돌아가기
        </button>
      </div>
    </div>
  )
}
