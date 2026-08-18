import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabaseAdmin } from '@/lib/supabase'
import { checkOpenAIRateLimit, getUserFromRequest } from '@/lib/auth'
import { BIBLE_BOOKS, type BibleBook } from '@/lib/advanced/bibleBooks'
import { getSectionsInRange } from '@/lib/bible/sections'
import { SYSTEM_PROMPT } from '@/lib/ai/prompts/expositoryPlan'
import type { ExpositoryPlan, ExpositoryUnit } from '@/lib/advanced/expositoryPlan'
import { getExpositoryModel, getRecommendedTargetCount, type ExpositoryModelId } from '@/lib/advanced/expositoryModels'

let _openai: OpenAI | null = null

function getOpenai() {
  if (!_openai) {
    const key = process.env.OPENAI_API_KEY
    if (!key) throw new Error('OPENAI_API_KEY is not set')
    _openai = new OpenAI({ apiKey: key })
  }
  return _openai
}

function resolveBook(value: string): BibleBook | undefined {
  return BIBLE_BOOKS.find(book => book.id === value || book.name === value || book.abbr === value)
}

function buildPassage(book: BibleBook, startChapter: number, startVerse: number, endChapter: number, endVerse: number) {
  if (endVerse >= 999) {
    return startChapter === endChapter
      ? `${book.abbr} ${startChapter}장`
      : `${book.abbr} ${startChapter}:${startVerse}-${endChapter}장`
  }
  if (startChapter === endChapter) {
    return `${book.abbr} ${startChapter}:${startVerse}-${endVerse}`
  }
  return `${book.abbr} ${startChapter}:${startVerse}-${endChapter}:${endVerse}`
}

function getNaturalSections(book: BibleBook) {
  const sections = getSectionsInRange(book.abbr, 1, 1, book.chapters, 999)
  const byChapter = new Map<number, Array<{ startVerse: number; endVerse: number; title: string }>>()

  for (let chapter = 1; chapter <= book.chapters; chapter++) {
    const chapterSections = sections
      .filter(item => item.chap === chapter)
      .map(item => item.sec)
    byChapter.set(chapter, chapterSections.length > 0
      ? chapterSections
      : [{ startVerse: 1, endVerse: 999, title: `${chapter}장 본문` }])
  }

  return Array.from(byChapter.entries()).flatMap(([chapter, chapterSections]) =>
    chapterSections.map(section => ({
      startChapter: chapter,
      startVerse: section.startVerse,
      endChapter: chapter,
      endVerse: section.endVerse,
      title: section.title,
    })),
  )
}

function createBaseUnits(book: BibleBook, targetCount: number): ExpositoryUnit[] {
  const natural = getNaturalSections(book)

  const count = Math.min(Math.max(targetCount, 1), natural.length)
  const units: ExpositoryUnit[] = []

  // 단순히 고정 크기로 묶으면 목표 회차보다 훨씬 적은 설교가 생깁니다.
  // 나머지 본문 단위를 앞쪽부터 하나씩 배분해 목표 회차를 정확히 맞춥니다.
  let cursor = 0
  for (let unitIndex = 0; unitIndex < count; unitIndex++) {
    const remainingSections = natural.length - cursor
    const remainingUnits = count - unitIndex
    const groupLength = Math.ceil(remainingSections / remainingUnits)
    const group = natural.slice(cursor, cursor + groupLength)
    cursor += groupLength
    const first = group[0]
    const last = group[group.length - 1]
    units.push({
      order: units.length + 1,
      title: group.length === 1 ? first.title : `${first.startChapter}-${last.endChapter}장 강해`,
      passage: buildPassage(book, first.startChapter, first.startVerse, last.endChapter, last.endVerse),
      startChapter: first.startChapter,
      startVerse: first.startVerse,
      endChapter: last.endChapter,
      endVerse: last.endVerse,
      sectionTitles: group.map(section => section.title),
      focus: '',
      description: '',
    })
  }

  return units
}

function parseJson(content: string): any {
  const cleaned = content.replace(/^```json\s*|```\s*$/g, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end <= start) throw new Error('AI 응답이 JSON 형식이 아닙니다.')
  return JSON.parse(cleaned.slice(start, end + 1))
}

async function enrichPlan(book: BibleBook, units: ExpositoryUnit[], modelId?: string): Promise<Pick<ExpositoryPlan, 'seriesTitle' | 'bookTheme' | 'canonicalFlow' | 'units'>> {
  const source = units.map(unit => ({
    order: unit.order,
    passage: unit.passage,
    sectionTitles: unit.sectionTitles,
  }))

  const stylePrompts: Record<string, string> = {
    lloyd_jones: `[강해 스타일: 마틴 로이드 존스 (Deep Exposition)]
- 본문 구절 하나하나의 신학적 깊이와 구속사적 의미를 촘촘히 짚어냅니다.
- 인간의 전적 부패와 하나님의 영광스러운 은혜의 조명을 극대화하여 깊이 있는 강해 대지를 작성하세요.`,
    park_youngsun: `[강해 스타일: 박영선 목사 (Pastoral Depth)]
- 하나님의 절대 주권과 그분이 성도를 삶의 현실 속에서 어떻게 인격적으로 빚어가시는가(신앙의 빚어짐)에 집중합니다.
- 본문의 신학적 뼈대 위에 목양적 성숙과 영적 자람을 이끄는 강해 개요를 작성하세요.`,
    john_piper: `[강해 스타일: 존 파이퍼 (Verse-by-Verse Passion)]
- 본문의 명확한 문맥과 '하나님을 최고로 기뻐하는 복음의 열정'을 일깨우는 중심 메시지를 작성합니다.
- 성경 텍스트 본문 원문에 충실한 강해 포인트를 작성하세요.`,
    practical: `[강해 스타일: 옥한흠 목사 (Practical Expository)]
- 성도들의 실제 삶과 교회 현장에 직결되는 선명한 적용과 헌신을 이끌어냅니다.
- 명쾌한 대지 구조와 현대적인 복음적 적용점을 강해 포인트로 작성하세요.`,
  }

  const selectedModel = getExpositoryModel(modelId)
  const selectedStylePrompt = stylePrompts[selectedModel.styleKey]

  const response = await getOpenai().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: `${SYSTEM_PROMPT}\n\n${selectedStylePrompt}` },
      {
        role: 'user',
        content: [
          `[성경책] ${book.name} (${book.chapters}장)`,
          `[기본 본문 단위]\n${JSON.stringify(source, null, 2)}`,
          `\n위 단위의 개수와 순서를 그대로 유지하여 ${book.name} 전체 강해설교 계획을 작성하세요.`,
        ].join('\n'),
      },
    ],
    temperature: 0.3,
    max_completion_tokens: 16000,
    response_format: { type: 'json_object' },
  })

  const parsed = parseJson(response.choices[0]?.message?.content || '')
  const generated = Array.isArray(parsed.units) ? parsed.units : []
  if (generated.length !== units.length) throw new Error('AI가 전체 본문 단위를 완성하지 못했습니다.')

  return {
    seriesTitle: String(parsed.seriesTitle || `${book.name} 강해`),
    bookTheme: String(parsed.bookTheme || ''),
    canonicalFlow: String(parsed.canonicalFlow || ''),
    units: units.map((unit, index) => ({
      ...unit,
      title: String(generated[index]?.title || unit.title),
      focus: String(generated[index]?.focus || ''),
      description: String(generated[index]?.description || ''),
    })),
  }
}

function makeFallbackPlan(book: BibleBook, units: ExpositoryUnit[], modelId?: string): ExpositoryPlan {
  const model = getExpositoryModel(modelId)
  return {
    book: book.name,
    bookAbbr: book.abbr,
    chapters: book.chapters,
    seriesTitle: `${book.name} 강해`,
    bookTheme: `${book.name}을 처음부터 끝까지 본문의 흐름에 따라 읽으며, 그 안에서 하나님이 누구시며 무엇을 행하시는지를 살핍니다. 각 본문 단위의 죄와 인간의 무능을 정직하게 드러내고, 본문에 근거한 복음과 은혜로 연결합니다.`,
    canonicalFlow: `${book.name}의 첫 본문에서 마지막 본문까지 순서대로 진행합니다. 각 설교는 앞뒤 문맥과 성경 전체의 구속사적 흐름 안에서 본문을 해석합니다.`,
    model: model.id,
    modelLabel: model.label,
    units,
  }
}

function normalizePlan(book: BibleBook, raw: Pick<ExpositoryPlan, 'seriesTitle' | 'bookTheme' | 'canonicalFlow' | 'units'>, baseUnits: ExpositoryUnit[], modelId: ExpositoryModelId): ExpositoryPlan {
  const model = getExpositoryModel(modelId)
  return {
    book: book.name,
    bookAbbr: book.abbr,
    chapters: book.chapters,
    seriesTitle: raw.seriesTitle,
    bookTheme: raw.bookTheme,
    canonicalFlow: raw.canonicalFlow,
    model: model.id,
    modelLabel: model.label,
    units: baseUnits.map((unit, index) => ({
      ...unit,
      title: raw.units[index]?.title || unit.title,
      focus: raw.units[index]?.focus || '',
      description: raw.units[index]?.description || '',
    })),
  }
}

function validateCoverage(book: BibleBook, units: ExpositoryUnit[]) {
  const ordered = [...units].sort((a, b) => a.order - b.order)
  if (!ordered.length || ordered[0].startChapter !== 1 || ordered[0].startVerse !== 1) return false
  if (ordered[ordered.length - 1].endChapter !== book.chapters) return false

  for (let index = 1; index < ordered.length; index++) {
    const previous = ordered[index - 1]
    const current = ordered[index]
    if (current.startChapter < previous.endChapter) return false
    if (current.startChapter === previous.endChapter && current.startVerse > previous.endVerse + 1) return false
    if (current.startChapter > previous.endChapter + 1) return false
  }
  return true
}

async function createSermonSeries(request: NextRequest, userId: string, body: any) {
  const plan = body.plan as ExpositoryPlan | undefined
  const book = resolveBook(plan?.book || body.book)
  if (!book || !plan?.units?.length) {
    return NextResponse.json({ success: false, error: '유효한 강해 계획이 필요합니다.' }, { status: 400 })
  }
  if (!validateCoverage(book, plan.units)) {
    return NextResponse.json({ success: false, error: '강해 계획이 성경책 전체 본문을 연속해서 포함하지 않습니다.' }, { status: 422 })
  }

  const seriesId = `series-expository-${Date.now()}`
  const seriesTitle = String(body.seriesTitle || plan.seriesTitle || `${book.name} 강해`).trim()
  const startDate = body.startDate || new Date().toISOString().slice(0, 10)
  const intervalDays = Math.max(1, Math.min(31, Number(body.intervalDays) || 7))
  const preacher = String(body.preacher || '')
  const sermonType = String(body.sermonType || '주일예배')
  const audience = String(body.audience || '장년')
  const season = String(body.season || '일반주일')

  const { error: seriesError } = await supabaseAdmin.from('series').insert({
    id: seriesId,
    user_id: userId,
    name: seriesTitle,
    description: `${book.name} ${book.chapters}장 전체 강해 · ${plan.units.length}편\n${plan.canonicalFlow || ''}`,
    start_date: startDate,
    end_date: new Date(new Date(startDate).getTime() + (plan.units.length - 1) * intervalDays * 86400000).toISOString().slice(0, 10),
    status: 'planned',
  })
  if (seriesError) throw seriesError

  const sermons = plan.units.map((unit, index) => {
    const sermonDate = new Date(new Date(startDate).getTime() + index * intervalDays * 86400000).toISOString().slice(0, 10)
    const passageRecord = {
      id: `${seriesId}-${unit.order}`,
      book: book.name,
      chapterStart: unit.startChapter,
      chapterEnd: unit.endChapter,
      verseStart: unit.startVerse,
      verseEnd: unit.endVerse,
      label: unit.passage,
      role: 'primary',
    }
    return {
      user_id: userId,
      title: unit.title,
      passage: unit.passage,
      book: book.name,
      chapter_start: unit.startChapter,
      chapter_end: unit.endChapter,
      verse_start: unit.startVerse,
      verse_end: unit.endVerse,
      sermon_date: sermonDate,
      series: seriesTitle,
      season,
      audience: [],
      church_context: null,
      source: 'manual',
      status: 'draft',
      version: 1,
      passages: [passageRecord],
      result: {
        preacher,
        sermonType,
        audience,
        season,
        seriesId,
        seriesName: seriesTitle,
        coreMessage: unit.focus,
        expositoryPlan: {
          book: book.name,
          order: unit.order,
          total: plan.units.length,
          model: plan.model,
          modelLabel: plan.modelLabel,
          bookTheme: plan.bookTheme,
          canonicalFlow: plan.canonicalFlow,
          focus: unit.focus,
          description: unit.description,
          sectionTitles: unit.sectionTitles,
        },
      },
    }
  })

  const { data, error } = await supabaseAdmin.from('sermons').insert(sermons).select('id, title, sermon_date')
  if (error) {
    await supabaseAdmin.from('series').delete().eq('id', seriesId).eq('user_id', userId)
    throw error
  }

  return NextResponse.json({
    success: true,
    data: {
      seriesId,
      seriesTitle,
      createdCount: data?.length || 0,
      firstProjectId: data?.[0]?.id || null,
      sermons: data || [],
    },
  }, { status: 201 })
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })

    const body = await request.json()
    if (body.action === 'create') return createSermonSeries(request, user.id, body)

    const book = resolveBook(body.book)
    if (!book) return NextResponse.json({ success: false, error: '성경책을 선택해주세요.' }, { status: 400 })
    const rateLimitResponse = checkOpenAIRateLimit(request, user.id, { max: 5, windowSec: 60 })
    if (rateLimitResponse) return rateLimitResponse

    const model = getExpositoryModel(body.model)
    const naturalSectionCount = getNaturalSections(book).length
    const requestedTarget = Number(body.targetCount)
    const targetCount = Number.isFinite(requestedTarget) && requestedTarget > 0
      ? Math.max(1, Math.min(72, requestedTarget))
      : getRecommendedTargetCount(naturalSectionCount, model.id)
    const baseUnits = createBaseUnits(book, targetCount)
    let plan: ExpositoryPlan
    try {
      plan = normalizePlan(book, await enrichPlan(book, baseUnits, model.id), baseUnits, model.id)
    } catch (error) {
      console.error('[expository-plan] AI enrichment failed, using base plan:', error)
      plan = makeFallbackPlan(book, baseUnits, model.id)
    }

    return NextResponse.json({ success: true, data: plan })
  } catch (error: any) {
    console.error('[expository-plan] Error:', error)
    return NextResponse.json({ success: false, error: error.message || '강해 계획 생성에 실패했습니다.' }, { status: 500 })
  }
}
