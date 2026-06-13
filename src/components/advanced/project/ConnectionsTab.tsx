'use client'

import { useRouter } from 'next/navigation'
import { ProjectDetail } from '@/lib/advanced/types'

interface Props { project: ProjectDetail }

export default function ConnectionsTab({ project }: Props) {
  const router = useRouter()

  return (
    <div className="space-y-6">

      {/* ─── 그래프 미니뷰 ─── */}
      <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">지식 그래프</div>
          <button
            onClick={() => router.push('/advanced/graph')}
            className="text-[11px] text-slate-500 hover:text-indigo-400 transition-colors"
          >
            전체 그래프 →
          </button>
        </div>
        <div className="relative h-[280px] bg-[#04060f]/60 rounded-xl overflow-hidden border border-white/5">
          <ConnectionsGraphSVG project={project} />
          <div className="absolute bottom-3 left-4 flex gap-4 text-[10px] text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-600" />설교</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slateblue-500" />본문</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gold-500" />주제</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />시리즈</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-500" />원어</span>
          </div>
        </div>
      </div>

      {/* ─── 연결된 본문 ─── */}
      <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-5">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">연결된 본문</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ConnectionNodeCard
            type="passage"
            label={project.passage}
            subtitle="현재 본문"
            strength="strong"
            onClick={() => router.push('/advanced/bible')}
          />
          <ConnectionNodeCard
            type="passage"
            label="갈 5:16-25"
            subtitle="성령을 따라 행함"
            strength="medium"
            onClick={() => router.push('/advanced/bible')}
          />
          <ConnectionNodeCard
            type="passage"
            label="엡 1:13-14"
            subtitle="성령의 인치심"
            strength="medium"
            onClick={() => router.push('/advanced/bible')}
          />
          <ConnectionNodeCard
            type="passage"
            label="고후 3:17"
            subtitle="성령과 자유"
            strength="weak"
            onClick={() => router.push('/advanced/bible')}
          />
        </div>
      </div>

      {/* ─── 연결된 주제 ─── */}
      <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-5">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">연결된 주제</div>
        <div className="flex flex-wrap gap-2">
          {project.themeNames.map(t => (
            <span key={t} className="text-xs px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-300 cursor-pointer hover:bg-indigo-500/20 transition-colors font-medium">
              {t}
            </span>
          ))}
          {project.tagNames.map(t => (
            <span key={t} className="text-xs px-4 py-2 rounded-full bg-white/5 text-slate-300 cursor-pointer hover:bg-white/5 transition-colors">
              #{t}
            </span>
          ))}
        </div>
      </div>

      {/* ─── 연결된 원어 ─── */}
      <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-5">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">연결된 원어</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <WordCard greek="πνεῦμα" translit="pneuma" meaning="영, 성령" strong="G4151" />
          <WordCard greek="νόμος" translit="nomos" meaning="율법, 법" strong="G3551" />
          <WordCard greek="κατάκριμα" translit="katakrima" meaning="정죄" strong="G2631" />
          <WordCard greek="ἐλευθερόω" translit="eleutheroo" meaning="자유롭게 하다" strong="G1659" />
          <WordCard greek="φρόνημα" translit="phronema" meaning="생각, 마음씀" strong="G5427" />
          <WordCard greek="σάρξ" translit="sarx" meaning="육체, 육신" strong="G4561" />
        </div>
      </div>

      {/* ─── 연결된 시리즈 ─── */}
      {project.seriesName && (
        <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-5">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">시리즈</div>
          <button
            onClick={() => router.push(`/advanced/series/${project.seriesId}`)}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/10 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-xs font-bold text-red-300 shrink-0">
              S
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-white">{project.seriesName}</span>
              <span className="text-xs text-slate-500 block mt-0.5">시리즈 내 연결</span>
            </div>
            <span className="text-xs text-slate-500">→</span>
          </button>
        </div>
      )}

      {/* ─── 관련 설교 ─── */}
      <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-5">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">관련 설교</div>
        <div className="space-y-2">
          {project.relatedSermons.map(s => (
            <div
              key={s.id}
              className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
              onClick={() => router.push(`/advanced/projects/${s.id}`)}
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                <div>
                  <span className="text-sm text-slate-100">{s.title}</span>
                  <span className="text-xs text-slate-500 ml-2">{s.passage}</span>
                </div>
              </div>
              <span className="text-xs text-slate-500">{s.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 연결된 노트 ─── */}
      <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-5">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">연결된 노트</div>
        <div className="space-y-2">
          {[
            { title: '롬 8:1의 정죄함 없음의 의미', type: '주석', passage: '롬 8:1' },
            { title: '율법의 의와 성령의 관계', type: '신학', passage: '롬 8:2-4' },
            { title: '육신의 생각과 성령의 생각', type: '주석', passage: '롬 8:5-8' },
          ].map((note, i) => (
            <button
              key={i}
              onClick={() => router.push('/advanced/notes')}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/10 transition-colors text-left"
            >
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                note.type === '주석' ? 'bg-teal-500/10 text-teal-300' :
                note.type === '신학' ? 'bg-amber-500/10 text-amber-300' :
                'bg-indigo-500/10 text-indigo-300'
              }`}>
                {note.type}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-white block truncate">{note.title}</span>
                <span className="text-[10px] text-slate-500">{note.passage}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── 하단 네비게이션 ─── */}
      <div className="flex items-center gap-3 pb-8 pt-2">
        <button
          onClick={() => router.push(`/advanced/projects/${project.id}?tab=manuscript`)}
          className="text-sm border border-white/5 hover:border-indigo-500/30 text-slate-200 hover:text-indigo-400 px-5 py-2.5 rounded-xl transition-colors"
        >
          ← 설교 작성
        </button>
        <button
          onClick={() => router.push(`/advanced/projects/${project.id}?tab=versions`)}
          className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-colors font-medium"
        >
          버전 기록 →
        </button>
      </div>
    </div>
  )
}

/* ─── Sub-components ─── */

function ConnectionsGraphSVG({ project }: { project: ProjectDetail }) {
  const nodes = [
    { id: 'current', x: 170, y: 50, r: 16, color: '#2D6B4E', label: '현재' },
    { id: 'passage', x: 80, y: 120, r: 12, color: '#4A5B82', label: project.passage },
    { id: 'spirit', x: 260, y: 100, r: 10, color: '#C4A25C', label: '성령' },
    { id: 'series', x: 300, y: 180, r: 9, color: '#A65A4A', label: project.seriesName?.slice(0, 4) || '시리즈' },
    { id: 'grace', x: 140, y: 200, r: 8, color: '#C4A25C', label: '은혜' },
    { id: 'faith', x: 220, y: 220, r: 7, color: '#C4A25C', label: '믿음' },
    { id: 'note1', x: 50, y: 180, r: 6, color: '#1A6B66', label: '노트' },
    { id: 'word', x: 320, y: 60, r: 6, color: '#1A6B66', label: 'πνεῦμα' },
  ]

  const links = [
    { from: 'current', to: 'passage', weight: 10 },
    { from: 'current', to: 'spirit', weight: 8 },
    { from: 'current', to: 'series', weight: 7 },
    { from: 'current', to: 'grace', weight: 6 },
    { from: 'passage', to: 'note1', weight: 5 },
    { from: 'spirit', to: 'word', weight: 9 },
    { from: 'spirit', to: 'faith', weight: 4 },
    { from: 'grace', to: 'faith', weight: 3 },
    { from: 'series', to: 'grace', weight: 4 },
  ]

  return (
    <svg viewBox="0 0 380 260" className="w-full h-full">
      {links.map((link, i) => {
        const s = nodes.find(n => n.id === link.from)
        const t = nodes.find(n => n.id === link.to)
        if (!s || !t) return null
        return (
          <line
            key={i}
            x1={s.x} y1={s.y} x2={t.x} y2={t.y}
            stroke="#E4DED4"
            strokeWidth={Math.max(0.5, link.weight / 3)}
            strokeOpacity={0.5}
          />
        )
      })}
      {nodes.map(node => (
        <g key={node.id}>
          <circle cx={node.x} cy={node.y} r={node.r} fill={node.color} opacity={0.85} />
          {node.id === 'current' && (
            <circle cx={node.x} cy={node.y} r={node.r + 3} fill="none" stroke={node.color} strokeWidth={1.5} opacity={0.4} />
          )}
          <text
            x={node.x}
            y={node.y + node.r + 14}
            textAnchor="middle"
            fontSize="9.5"
            fill="#6B6358"
            fontFamily="sans-serif"
            fontWeight="500"
          >
            {node.label.length > 8 ? node.label.slice(0, 8) + '…' : node.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

function ConnectionNodeCard({ type, label, subtitle, strength, onClick }: {
  type: string; label: string; subtitle: string; strength: 'strong' | 'medium' | 'weak'; onClick: () => void
}) {
  const strengthLabel = { strong: '직접 연결', medium: '주제적 연결', weak: '암시적 연결' }[strength]
  const strengthColor = { strong: 'text-indigo-400', medium: 'text-amber-300', weak: 'text-slate-500' }[strength]

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/10 transition-colors text-left"
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
        type === 'passage' ? 'bg-indigo-500/10 text-indigo-300' : 'bg-white/5 text-slate-400'
      }`}>
        {type === 'passage' ? (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-white block truncate">{label}</span>
        <span className="text-[10px] text-slate-500">{subtitle}</span>
      </div>
      <span className={`text-[9px] ${strengthColor} shrink-0`}>{strengthLabel}</span>
    </button>
  )
}

function WordCard({ greek, translit, meaning, strong }: {
  greek: string; translit: string; meaning: string; strong: string
}) {
  return (
    <div className="bg-[#04060f]/60 rounded-xl p-3 border border-white/5">
      <div className="text-center mb-1">
        <span className="text-lg font-greek text-white">{greek}</span>
      </div>
      <div className="text-[10px] text-slate-500 text-center italic">{translit}</div>
      <div className="text-[11px] text-slate-200 text-center mt-1">{meaning}</div>
      <div className="text-[9px] text-slate-600 text-center mt-0.5">{strong}</div>
    </div>
  )
}
