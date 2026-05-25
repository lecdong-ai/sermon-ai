'use client'

import SectionCard from './SectionCard'

interface Props {
  data: string
}

const SUBTITLE_PATTERNS = /^(첫째로|둘째로|셋째로|넷째로|다섯째로|첫째|둘째|셋째|마지막으로|그렇다면|이제|결론적으로)\b/

function splitSubtitle(text: string): { subtitle: string; body: string } | null {
  const trimmed = text.trim()
  if (!SUBTITLE_PATTERNS.test(trimmed)) return null
  const idx = trimmed.search(/[.?!]\s/)
  if (idx === -1) return null
  return {
    subtitle: trimmed.slice(0, idx + 1).trim(),
    body: trimmed.slice(idx + 1).trim(),
  }
}

export default function SermonScriptSection({ data }: Props) {
  const paragraphs = data.split('\n\n').filter(Boolean)
  const labels = ['서론', '본론', '결론/적용']
  const colors = ['bg-blue-100 text-blue-700', 'bg-primary-100 text-primary-700', 'bg-purple-100 text-purple-700']

  return (
    <SectionCard title="유튜브 설교대본" emoji="🎙️" copyText={data}>
      <div className="space-y-5">
        {paragraphs.map((p, i) => {
          const split = splitSubtitle(p)
          const lines = p.split('\n').filter(Boolean)
          return (
            <div key={i} className="animate-in-fast p-5 rounded-xl bg-white border border-[#f0f2f5] shadow-sm" style={{ animationDelay: `${i * 80}ms` }}>
              {i < labels.length && (
                <span className="text-[17px] font-extrabold px-3 py-1 rounded-md inline-block mb-3 tracking-tight"
                  style={{ backgroundColor: colors[i % colors.length].split(' ')[0], color: colors[i % colors.length].split(' ')[1] }}
                >
                  {labels[i]}
                </span>
              )}
              <div className="space-y-2">
                {lines.map((line, j) => {
                  const s = splitSubtitle(line)
                  if (s) {
                    return (
                      <p key={j} className="mt-3 first:mt-0">
                        <span className="text-[20px] font-extrabold text-[#191f28] leading-snug">{s.subtitle}</span>
                        {s.body && <span className="text-[16px] text-[#4e5968] leading-[1.9]"> {s.body}</span>}
                      </p>
                    )
                  }
                  return <p key={j} className="text-[16px] text-[#4e5968] leading-[1.9]">{line}</p>
                })}
              </div>
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}
