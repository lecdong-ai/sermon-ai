'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProjectDetail } from '@/lib/advanced/types'
import { AppSectionHeader } from '@/components/advanced/shared'

interface Props { project: ProjectDetail }

export default function PrepTab({ project }: Props) {
  const router = useRouter()
  const [outlineTitles, setOutlineTitles] = useState(project.outlinePoints.map(p => p.title))
  const [outlineContents, setOutlineContents] = useState(project.outlinePoints.map(p => p.content))
  const [coreMessage, setCoreMessage] = useState(project.coreMessage)
  const [showWarning, setShowWarning] = useState(true)

  const wordCount = outlineContents.reduce((sum, c) => sum + c.length, 0)

  return (
    <div className="space-y-6">

      {/* ─── 준비 진행률 ─── */}
      <PrepProgressCard project={project} />

      {/* ─── 설교 경고 박스 ─── */}
      {showWarning && (
        <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-amber-800 mb-1">설교 준비 확인</h4>
              <ul className="text-xs text-amber-700 space-y-1">
                <li>본문 전체를 최소 3번 이상 읽으셨나요?</li>
                <li>중심명제가 한 문장으로 명확하게 정리되었나요?</li>
                <li>각 대지가 중심명제를 지지하고 있나요?</li>
                <li>회중의 실제 상황에 맞는 적용이 준비되었나요?</li>
              </ul>
            </div>
            <button onClick={() => setShowWarning(false)} className="text-amber-400 hover:text-amber-600 shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

        {/* ─── 1단계: 본문 관찰 ─── */}
      <div className="bg-white rounded-xl border border-paper-200 p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center">1</span>
          <h3 className="text-sm font-semibold text-paper-800">본문 관찰</h3>
          <span className="text-[10px] text-paper-400 ml-auto">본문에서 관찰한 내용을 정리해보세요</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ObservationCard title="반복어" items={['성령', '법', '생명', '자유', '정죄']} />
          <ObservationCard title="구조" items={['선언(1-2절)', '설명(3-4절)', '대조(5-8절)', '적용(9-11절)']} />
          <ObservationCard title="전환 포인트" items={['그러므로(1절)', '이는(2절)', '율법이(3절)', '육신을(5절)']} />
        </div>
      </div>

      {/* ─── 2단계: 중심명제 ─── */}
      <div className="bg-white rounded-xl border border-paper-200 p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">2</span>
          <h3 className="text-sm font-semibold text-paper-800">중심명제</h3>
          <span className="text-[10px] text-paper-400 ml-auto">설교의 핵심이 한 문장으로 정리됩니다</span>
        </div>
        <textarea
          value={coreMessage}
          onChange={e => setCoreMessage(e.target.value)}
          className="w-full min-h-[80px] text-sm text-paper-700 bg-paper-50 rounded-lg p-4 border border-paper-200 outline-none resize-none focus:border-green-300 focus:bg-white transition-colors leading-relaxed font-serif"
          placeholder="이 설교를 듣는 회중이 기억해야 할 한 문장은 무엇인가요?"
        />
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-2">
            <span className="text-[10px] text-paper-400 bg-paper-100 px-2 py-0.5 rounded">자동 제안</span>
            <span className="text-[10px] text-paper-400 bg-paper-100 px-2 py-0.5 rounded">수동 편집</span>
          </div>
          <span className="text-[10px] text-paper-400">{coreMessage?.length || 0}자</span>
        </div>
      </div>

      {/* ─── 3단계: 대지 작성 ─── */}
      <div className="bg-white rounded-xl border border-paper-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">3</span>
            <h3 className="text-sm font-semibold text-paper-800">대지 구조</h3>
          </div>
          <span className="text-[11px] text-paper-400">{outlineTitles.length}개 대지 · {wordCount.toLocaleString()}자</span>
        </div>
        <div className="space-y-4">
          {outlineTitles.map((title, i) => (
            <div key={i} className="bg-paper-50 rounded-lg border border-paper-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <input
                  value={title}
                  onChange={e => {
                    const next = [...outlineTitles]
                    next[i] = e.target.value
                    setOutlineTitles(next)
                  }}
                  className="text-sm font-medium text-paper-800 bg-transparent border-none outline-none flex-1"
                  placeholder="대지 제목"
                />
              </div>
              <textarea
                value={outlineContents[i]}
                onChange={e => {
                  const next = [...outlineContents]
                  next[i] = e.target.value
                  setOutlineContents(next)
                }}
                className="w-full text-xs text-paper-600 bg-transparent border-none outline-none resize-none leading-relaxed"
                rows={3}
                placeholder="대지 설명"
              />
              {project.outlinePoints[i]?.subPoints.length > 0 && (
                <div className="mt-2 space-y-1 pt-2 border-t border-paper-200">
                  {project.outlinePoints[i].subPoints.map((sp, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs text-paper-500">
                      <span className="w-1 h-1 rounded-full bg-paper-400" />
                      <span>{sp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <button
            onClick={() => {
              setOutlineTitles(prev => [...prev, ''])
              setOutlineContents(prev => [...prev, ''])
            }}
            className="w-full py-2.5 text-xs text-paper-500 border border-dashed border-paper-300 rounded-lg hover:border-green-300 hover:text-green-600 transition-colors"
          >
            + 대지 추가
          </button>
        </div>
      </div>

      {/* ─── 4단계: 제목 후보 ─── */}
      <div className="bg-white rounded-xl border border-paper-200 p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-6 h-6 rounded-full bg-gold-100 text-gold-700 text-xs font-bold flex items-center justify-center">4</span>
          <h3 className="text-sm font-semibold text-paper-800">제목 후보</h3>
          <span className="text-[10px] text-paper-400 ml-auto">설교의 첫인상을 결정하는 제목을 고민해보세요</span>
        </div>
        <div className="space-y-2">
          {project.titleCandidates.map((t, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-colors ${
                i === 0 ? 'bg-green-50 border border-green-200' : 'hover:bg-paper-100'
              }`}
            >
              <span className="text-[10px] text-paper-400 w-4">{i + 1}.</span>
              <span className="text-sm text-paper-700">{t}</span>
              {i === 0 && <span className="text-[10px] text-green-600 ml-auto font-medium">선택됨</span>}
            </div>
          ))}
        </div>
      </div>

      {/* ─── 5단계: 적용 정리 ─── */}
      <div className="bg-white rounded-xl border border-paper-200 p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">5</span>
          <h3 className="text-sm font-semibold text-paper-800">회중별 적용</h3>
          <span className="text-[10px] text-paper-400 ml-auto">말씀이 회중의 삶에 어떻게 적용될 수 있을까요?</span>
        </div>
        <div className="space-y-3">
          {project.applicationPoints.map((a, i) => (
            <div key={i} className="flex gap-3 items-start p-3 rounded-lg bg-blue-50/40 border border-blue-100/40">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-medium flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-paper-700 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 6단계: 목회적 통찰 ─── */}
      <div className="bg-white rounded-xl border border-paper-200 p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center">6</span>
          <h3 className="text-sm font-semibold text-paper-800">목회적 통찰</h3>
          <span className="text-[10px] text-paper-400 ml-auto">회중을 아는 목회자만이 전할 수 있는 통찰을 기록하세요</span>
        </div>
        <textarea
          className="w-full min-h-[100px] text-sm text-paper-700 bg-paper-50 rounded-lg p-4 border border-paper-200 outline-none resize-none focus:border-purple-200 focus:bg-white transition-colors leading-relaxed placeholder:text-paper-300"
          placeholder="이 본문을 통해 오늘날 회중에게 전할 목회자의 마음을 기록하세요..."
        />
        <div className="flex justify-between mt-2">
          <div className="flex gap-2">
            <span className="text-[10px] text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded">통찰</span>
            <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">질문</span>
            <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">적용</span>
          </div>
          <span className="text-[10px] text-paper-400">0자</span>
        </div>
      </div>

      {/* ─── 하단 네비게이션 ─── */}
      <div className="flex items-center justify-between pb-8 pt-2 border-t border-paper-200">
        <div className="flex items-center gap-2 text-[10px] text-paper-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span>준비는 연구와 작성 사이의 다리입니다</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/advanced/projects/${project.id}?tab=study`)}
            className="text-xs border border-paper-200 hover:border-teal-300 text-paper-500 hover:text-teal-600 px-4 py-2 rounded-lg transition-colors"
          >
            ← 성경 연구로
          </button>
          <button
            onClick={() => router.push(`/advanced/projects/${project.id}?tab=manuscript`)}
            className="text-xs bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            설교 작성으로 →
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Sub-components ─── */

function PrepProgressCard({ project }: { project: ProjectDetail }) {
  const steps = [
    { label: '본문 읽기', done: true },
    { label: '본문 관찰', done: true },
    { label: '구조 분석', done: true },
    { label: '중심명제', done: !!project.coreMessage },
    { label: '대지 작성', done: project.outlinePoints.length > 0 },
    { label: '적용 정리', done: project.applicationPoints.length > 0 },
  ]
  const doneCount = steps.filter(s => s.done).length
  const pct = Math.round((doneCount / steps.length) * 100)

  return (
    <div className="bg-white rounded-xl border border-paper-200 p-5">
      <AppSectionHeader title="준비 진행률" count={`${pct}%`} />
      <div className="adv-progress-bar h-1.5 mb-3">
        <div className="adv-progress-fill bg-green-500 h-full rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {steps.map((s, i) => (
          <div key={i} className={`text-center p-2 rounded-lg text-xs ${
            s.done ? 'bg-green-50 text-green-700' : 'bg-paper-50 text-paper-400'
          }`}>
            <span className="block text-sm mb-0.5">{s.done ? '✓' : '○'}</span>
            <span className="text-[10px]">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ObservationCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-paper-50 rounded-lg p-3">
      <h4 className="text-[11px] font-semibold text-paper-500 uppercase tracking-wider mb-2">{title}</h4>
      <div className="flex flex-wrap gap-1">
        {items.map((item, i) => (
          <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-white border border-paper-200 text-paper-600">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
