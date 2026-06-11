'use client'

import { useRouter } from 'next/navigation'
import { ProjectDetail } from '@/lib/advanced/types'

interface Props { project: ProjectDetail }

export default function VersionsTab({ project }: Props) {
  const router = useRouter()

  return (
    <div className="space-y-6">

      {/* ─── 버전 타임라인 ─── */}
      <div className="bg-white rounded-xl border border-paper-200 p-5">
        <div className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest mb-4">버전 기록</div>
        <div className="relative">
          {/* 타임라인 선 */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-paper-200" />

          <div className="space-y-0">
            {project.versions.map((v, i) => (
              <div key={v.id} className="relative flex gap-4 pb-6 last:pb-0">
                {/* 타임라인 점 */}
                <div className="flex flex-col items-center shrink-0 z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    i === 0
                      ? 'bg-green-500 text-white border-green-500 shadow-sm'
                      : 'bg-white text-paper-500 border-paper-200'
                  }`}>
                    v{v.version}
                  </div>
                </div>

                {/* 내용 */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      v.changedBy === 'user' ? 'bg-green-100 text-green-700' :
                      v.changedBy === 'ai' ? 'bg-blue-100 text-blue-700' :
                      'bg-paper-150 text-paper-600'
                    }`}>
                      {v.changedBy === 'user' ? '사용자' : v.changedBy === 'ai' ? 'AI 생성' : '자동'}
                    </span>
                    <span className="text-[11px] text-paper-400">
                      {new Date(v.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-paper-700">{v.summary}</p>
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => router.push(`/advanced/projects/${project.id}?tab=manuscript`)}
                      className="text-[11px] text-green-600 hover:text-green-700 font-medium"
                    >
                      이 버전으로 복원
                    </button>
                    <span className="text-paper-300">·</span>
                    <button className="text-[11px] text-paper-500 hover:text-paper-700">
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
      <div className="bg-white rounded-xl border border-paper-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest">변경 내용 (v3 → v2)</div>
          <button className="text-[11px] text-paper-400 hover:text-green-600 transition-colors">
            다른 버전 비교 →
          </button>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex gap-2 bg-green-50 rounded-lg p-3 border border-green-100">
            <span className="text-green-600 font-medium shrink-0 w-8">+ 추가</span>
            <span className="text-paper-700">대지 3번 &ldquo;부활의 소망과 확신&rdquo; 항목 설명 보강, 서론 문장 2개 추가</span>
          </div>
          <div className="flex gap-2 bg-amber-50 rounded-lg p-3 border border-amber-100">
            <span className="text-amber-600 font-medium shrink-0 w-8">~ 수정</span>
            <span className="text-paper-700">중심명제 문구 수정: &ldquo;성령의 사역&rdquo; → &ldquo;성령께서 그리스도 안에서&rdquo;</span>
          </div>
          <div className="flex gap-2 bg-red-50 rounded-lg p-3 border border-red-100">
            <span className="text-red-500 font-medium shrink-0 w-8">- 삭제</span>
            <span className="text-paper-700">1차 서론의 예화 문장 1개 제거 (분량 조정)</span>
          </div>
        </div>
      </div>

      {/* ─── 자동 저장 히스토리 ─── */}
      <div className="bg-white rounded-xl border border-paper-200 p-5">
        <div className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest mb-3">자동 저장 히스토리</div>
        <div className="space-y-1.5">
          {[
            { time: '14:30', desc: '본론 2대지 문장 수정' },
            { time: '14:15', desc: '적용 블록 추가' },
            { time: '13:50', desc: '서론 문단 재구성' },
            { time: '13:30', desc: '중심명제 수정' },
            { time: '12:45', desc: '대지 1번 설명 보강' },
            { time: '11:20', desc: '제목 변경' },
          ].map((entry, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-paper-50 transition-colors">
              <span className="text-[10px] text-paper-400 w-10 text-right font-mono">{entry.time}</span>
              <span className="w-1 h-1 rounded-full bg-paper-300" />
              <span className="text-xs text-paper-600">{entry.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 하단 네비게이션 ─── */}
      <div className="flex items-center gap-3 pb-8 pt-2">
        <button
          onClick={() => router.push(`/advanced/projects/${project.id}?tab=connections`)}
          className="text-sm border border-paper-200 hover:border-slateblue-300 text-paper-600 hover:text-slateblue-600 px-5 py-2.5 rounded-md transition-colors"
        >
          ← 연결 노드
        </button>
        <button
          onClick={() => router.push(`/advanced/projects/${project.id}?tab=overview`)}
          className="text-sm bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-md transition-colors font-medium"
        >
          개요로 돌아가기
        </button>
      </div>
    </div>
  )
}
