import type { BiblePassage } from './types'

interface PassageContext {
  passage: string
  passageLabels: string[]
  passages: BiblePassage[]
}

function toLabel(p: any): string {
  if (!p) return ''
  return p.passage || p.label || ''
}

export function buildPassageContext(project: any): PassageContext {
  const raw = (project?.passages && Array.isArray(project.passages) && project.passages.length > 0)
    ? project.passages
    : []

  if (raw.length === 0) {
    const single = project?.passage || project?.normalizedPassage || ''
    return {
      passage: single,
      passageLabels: single ? [single] : [],
      passages: single
        ? [{
            book: project?.book || project?.bibleBook || '',
            chapter: project?.chapter || project?.chapterStart || 0,
            verseStart: project?.verseStart || 0,
            verseEnd: project?.verseEnd ?? null,
            passage: single,
          }]
        : [],
    }
  }

  const labels = raw.map(toLabel).filter(Boolean)
  return {
    passage: labels.join(' + '),
    passageLabels: labels,
    passages: raw.map((p: any) => ({
      ...p,
      passage: toLabel(p),
    })),
  }
}
