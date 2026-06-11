'use client'

import { useRouter } from 'next/navigation'
import { ProjectDetail } from '@/lib/advanced/types'

interface Props { project: ProjectDetail }

export default function ConnectionsTab({ project }: Props) {
  const router = useRouter()

  return (
    <div className="space-y-6">

      {/* ─── 그래프 미니뷰 ─── */}
      <div className="bg-white rounded-xl border border-paper-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest">지식 그래프</div>
          <button
            onClick={() => router.push('/advanced/graph')}
            className="text-[11px] text-paper-400 hover:text-green-600 transition-colors"
          >
            전체 그래프 →
          </button>
        </div>
        <div className="relative h-[280px] bg-paper-50 rounded-xl overflow-hidden border border-paper-150">
          <ConnectionsGraphSVG project={project} />
          <div className="absolute bottom-3 left-4 flex gap-4 text-[10px] text-paper-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />설교</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slateblue-500" />본문</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gold-500" />주제</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />시리즈</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-500" />원어</span>
          </div>
        </div>
      </div>

      {/* ─── 연결된 본문 ─── */}
      <div className="bg-white rounded-xl border border-paper-200 p-5">
        <div className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest mb-3">연결된 본문</div>
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
      <div className="bg-white rounded-xl border border-paper-200 p-5">
        <div className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest mb-3">연결된 주제</div>
        <div className="flex flex-wrap gap-2">
          {project.themeNames.map(t => (
            <span key={t} className="text-xs px-4 py-2 rounded-full bg-green-100 text-green-700 cursor-pointer hover:bg-green-200 transition-colors font-medium">
              {t}
            </span>
          ))}
          {project.tagNames.map(t => (
            <span key={t} className="text-xs px-4 py-2 rounded-full bg-paper-150 text-paper-600 cursor-pointer hover:bg-paper-200 transition-colors">
              #{t}
            </span>
          ))}
        </div>
      </div>

      {/* ─── 연결된 원어 ─── */}
      <div className="bg-white rounded-xl border border-paper-200 p-5">
        <div className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest mb-3">연결된 원어</div>
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
        <div className="bg-white rounded-xl border border-paper-200 p-5">
          <div className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest mb-3">시리즈</div>
          <button
            onClick={() => router.push(`/advanced/series/${project.seriesId}`)}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-paper-200 hover:border-green-200 hover:bg-green-50/30 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-xs font-bold text-red-400 shrink-0">
              S
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-paper-800">{project.seriesName}</span>
              <span className="text-xs text-paper-400 block mt-0.5">시리즈 내 연결</span>
            </div>
            <span className="text-xs text-paper-400">→</span>
          </button>
        </div>
      )}

      {/* ─── 관련 설교 ─── */}
      <div className="bg-white rounded-xl border border-paper-200 p-5">
        <div className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest mb-3">관련 설교</div>
        <div className="space-y-2">
          {project.relatedSermons.map(s => (
            <div
              key={s.id}
              className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-paper-100 cursor-pointer transition-colors"
              onClick={() => router.push(`/advanced/projects/${s.id}`)}
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <div>
                  <span className="text-sm text-paper-700">{s.title}</span>
                  <span className="text-xs text-paper-400 ml-2">{s.passage}</span>
                </div>
              </div>
              <span className="text-xs text-paper-400">{s.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 연결된 노트 ─── */}
      <div className="bg-white rounded-xl border border-paper-200 p-5">
        <div className="text-[10px] font-semibold text-paper-400 uppercase tracking-widest mb-3">연결된 노트</div>
        <div className="space-y-2">
          {[
            { title: '롬 8:1의 정죄함 없음의 의미', type: '주석', passage: '롬 8:1' },
            { title: '율법의 의와 성령의 관계', type: '신학', passage: '롬 8:2-4' },
            { title: '육신의 생각과 성령의 생각', type: '주석', passage: '롬 8:5-8' },
          ].map((note, i) => (
            <button
              key={i}
              onClick={() => router.push('/advanced/notes')}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-paper-150 hover:border-gold-200 hover:bg-gold-50/20 transition-colors text-left"
            >
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                note.type === '주석' ? 'bg-teal-100 text-teal-700' :
                note.type === '신학' ? 'bg-gold-100 text-gold-700' :
                'bg-green-100 text-green-700'
              }`}>
                {note.type}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-paper-800 block truncate">{note.title}</span>
                <span className="text-[10px] text-paper-400">{note.passage}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── 하단 네비게이션 ─── */}
      <div className="flex items-center gap-3 pb-8 pt-2">
        <button
          onClick={() => router.push(`/advanced/projects/${project.id}?tab=manuscript`)}
          className="text-sm border border-paper-200 hover:border-green-300 text-paper-600 hover:text-green-600 px-5 py-2.5 rounded-md transition-colors"
        >
          ← 설교 작성
        </button>
        <button
          onClick={() => router.push(`/advanced/projects/${project.id}?tab=versions`)}
          className="text-sm bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-md transition-colors font-medium"
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
            y={node.y + node.r + 10}
            textAnchor="middle"
            fontSize="5.5"
            fill="#9C9487"
            fontFamily="sans-serif"
          >
            {node.label.length > 6 ? node.label.slice(0, 6) + '…' : node.label}
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
  const strengthColor = { strong: 'text-green-600', medium: 'text-amber-600', weak: 'text-paper-400' }[strength]

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-lg border border-paper-150 hover:border-slateblue-200 hover:bg-slateblue-50/20 transition-colors text-left"
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
        type === 'passage' ? 'bg-slateblue-100 text-slateblue-700' : 'bg-paper-100 text-paper-500'
      }`}>
        {type === 'passage' ? '📖' : '🔗'}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-paper-800 block truncate">{label}</span>
        <span className="text-[10px] text-paper-400">{subtitle}</span>
      </div>
      <span className={`text-[9px] ${strengthColor} shrink-0`}>{strengthLabel}</span>
    </button>
  )
}

function WordCard({ greek, translit, meaning, strong }: {
  greek: string; translit: string; meaning: string; strong: string
}) {
  return (
    <div className="bg-paper-50 rounded-lg p-3 border border-paper-150">
      <div className="text-center mb-1">
        <span className="text-lg font-greek text-paper-800">{greek}</span>
      </div>
      <div className="text-[10px] text-paper-400 text-center italic">{translit}</div>
      <div className="text-[11px] text-paper-600 text-center mt-1">{meaning}</div>
      <div className="text-[9px] text-paper-300 text-center mt-0.5">{strong}</div>
    </div>
  )
}
