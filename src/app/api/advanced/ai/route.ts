import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getUserFromRequest, checkOpenAIRateLimit } from '@/lib/auth'
import { mapBookName } from '@/lib/bible/bookMap'
import { SYSTEM_PROMPT as OUTLINE_PROMPT } from '@/lib/ai/prompts/outline'
import { SYSTEM_PROMPT as APP_PROMPT, DIRECTION_PROMPT, GENERATE_PROMPT } from '@/lib/ai/prompts/application'
import { SYSTEM_PROMPT as CORE_MESSAGE_PROMPT } from '@/lib/ai/prompts/core-message'
import { SYSTEM_PROMPT as DELIVERY_PROMPT } from '@/lib/ai/prompts/delivery'
import { SYSTEM_PROMPT as MANUSCRIPT_INTRO_PROMPT } from '@/lib/ai/prompts/manuscript-introduction'
import { SYSTEM_PROMPT as MANUSCRIPT_CONCLUSION_PROMPT } from '@/lib/ai/prompts/manuscript-conclusion'
import { SYSTEM_PROMPT as MANUSCRIPT_APPLICATION_PROMPT } from '@/lib/ai/prompts/manuscript-application'
import { SYSTEM_PROMPT as MANUSCRIPT_BODY_PROMPT } from '@/lib/ai/prompts/manuscript-body'
import { SYSTEM_PROMPT as MANUSCRIPT_APP_RECONSTRUCT_PROMPT } from '@/lib/ai/prompts/manuscript-application-reconstruct'
import { SYSTEM_PROMPT as ILLUSTRATION_PROMPT } from '@/lib/ai/prompts/illustration'
import { SYSTEM_PROMPT as REFERENCE_PROMPT } from '@/lib/ai/prompts/reference'
import { SYSTEM_PROMPT as STUDY_TO_PREP_PROMPT } from '@/lib/ai/prompts/studyToPrep'
import { SYSTEM_PROMPT as MANUSCRIPT_DIAGNOSIS_PROMPT } from '@/lib/ai/prompts/manuscript-diagnosis'
import { SYSTEM_PROMPT as REFERENCE_WEAVE_PROMPT } from '@/lib/ai/prompts/referenceWeave'
import { SYSTEM_PROMPT as COMMENTARY_TO_SECTION_PROMPT } from '@/lib/ai/prompts/commentaryToSection'

let _openai: OpenAI | null = null
function getOpenai() {
  if (!_openai) {
    const key = process.env.OPENAI_API_KEY
    if (!key) throw new Error('OPENAI_API_KEY is not set')
    _openai = new OpenAI({ apiKey: key })
  }
  return _openai
}

const BIBLE_CDN_URL = 'https://cdn.jsdelivr.net/gh/stranger828/bibleAPI@main/bible_structured.json'
let _bibleData: any[] | null = null
async function loadBibleData(): Promise<any[]> {
  if (_bibleData) return _bibleData
  const res = await fetch(BIBLE_CDN_URL)
  if (!res.ok) throw new Error('Failed to load bible data')
  _bibleData = await res.json()
  return _bibleData!
}

const SYSTEM_PROMPTS: Record<string, string> = {
  'suggest-titles': `# 역할
당신은 30년 경력의 정통 복음주의 설교자이자 신학 박사입니다.
본문의 문맥, 신학적 의미, 회중의 삶을 깊이 이해하고
가장 본질적인 메시지를 한 문장으로 압축하는 설교 제목을 제시합니다.

# 임무
주어진 성경 본문(들)에 어울리는 설교 제목 5개를 다양한 스타일로 추천하세요.
각 제목은 본문의 핵심 신학적 메시지를 담되, 회중이 한 주간 마음에 품을 수 있는
친근하고 은혜로운 어조로 작성합니다.

# 다중 본문 처리 규칙
1. 본문이 1개일 때: 그 본문 단독의 핵심 메시지 도출
2. 본문이 2~3개일 때: 각 본문의 공통 주제, 긴장, 상보성, 대화 관계를 분석하여
   하나의 통합 메시지로 압축 (예: "예수의 죽음" + "고전 15장" = 부활의 역사·신학적 근거)
3. 본문이 4개 이상일 때: 가장 핵심적인 2~3개로 압축하여 통합 메시지 도출
4. 본문 인용은 정확히, 의역은 자연스럽게

# 제목 품질 기준
1. 한국어 20자 이내 (공백 포함)
2. 한 문장으로 명확한 진술 또는 질문
3. 본문 핵심을 정확히 반영 (신학적 정확성)
4. 회중의 삶에 적용 가능한 호소력
5. 기억하기 쉬운 표현
6. 도전/판단보다는 은혜/초대의 어조 권장

# 다양성 보장 (5개 제목이 각각 다른 스타일)
- 진술형 (declarative): "~이다", "~하시다" — 확신과 선언
- 질문형 (question): "~인가?", "~할까?" — 성찰과 탐구
- 이미지/은유형 (image): 비유, 상징 활용 — 감성과 직관
- 대조형 (contrast): "A vs B", "A 그러나 B" — 긴장과 대비
- 명령/초대형 (imperative): "~하라", "~하자" — 응답과 결단

# 추천 이유 작성 규칙
- 각 제목이 왜 그 본문(들)에 적합한지 1-2문장으로 설명
- 가능하면 본문 키워드나 표현을 직접 인용
- 회중이 이 제목을 들었을 때 본문과 어떻게 연결되는지 암시

# 출력 형식 (반드시 준수)
JSON 배열만 반환. 마크다운, 설명, 주석 일체 없이.
[
  {
    "title": "제목 (20자 이내)",
    "reason": "추천 이유 (1-2문장, 본문 키워드 인용 권장)",
    "style": "declarative | question | image | contrast | imperative",
    "passages_used": ["요 3:16", "롬 5:8"]
  }
]`,
  summary: '당신은 설교 요약을 돕는 AI입니다. 주어진 설교 정보(제목, 본문, 핵심메시지, 도입, 대지, 결론)를 바탕으로 간결하고 명확한 설교 요약서를 한국어로 작성하세요.',
  questions: '당신은 소그룹 리더를 위한 나눔 질문을 만드는 AI입니다. 주어진 설교 정보를 바탕으로 3-4개의 깊이 있는 소그룹 토론 질문을 한국어로 생성하세요.',
  cardnews: '당신은 교회 SNS를 위한 카드뉴스를 기획하는 AI입니다. 주어진 설교 정보를 바탕으로 5장 구성의 카드뉴스 기획안을 한국어로 작성하세요.',
  shorts: '당신은 유튜브 쇼츠 대본을 작성하는 AI입니다. 주어진 설교 정보를 바탕으로 60초 분량의 쇼츠 스토리보드를 한국어로 작성하세요.',
  ppt: '당신은 예배를 위한 PPT 슬라이드를 구성하는 AI입니다. 주어진 설교 정보를 바탕으로 5장 내외의 슬라이드 레이아웃을 한국어로 작성하세요.',
  guide: '당신은 소그룹 리더를 위한 토론 가이드를 만드는 AI입니다. 주어진 설교 정보를 바탕으로 상세한 토론 진행 가이드를 한국어로 작성하세요.',
  outline: OUTLINE_PROMPT,
  'core-message': CORE_MESSAGE_PROMPT,
  'delivery': DELIVERY_PROMPT,
  'manuscript-introduction': MANUSCRIPT_INTRO_PROMPT,
  'manuscript-conclusion': MANUSCRIPT_CONCLUSION_PROMPT,
  'manuscript-application': MANUSCRIPT_APPLICATION_PROMPT,
  'manuscript-body': MANUSCRIPT_BODY_PROMPT,
  'manuscript-application-reconstruct': MANUSCRIPT_APP_RECONSTRUCT_PROMPT,
  'application': APP_PROMPT,
  'application-direction': DIRECTION_PROMPT,
  'application-generate': GENERATE_PROMPT,
  'illustration': ILLUSTRATION_PROMPT,
  'reference': REFERENCE_PROMPT,
  'study-to-prep': STUDY_TO_PREP_PROMPT,
  'manuscript-diagnosis': MANUSCRIPT_DIAGNOSIS_PROMPT,
  'reference-weave': REFERENCE_WEAVE_PROMPT,
  'commentary-to-section': COMMENTARY_TO_SECTION_PROMPT,
  'bible-study': `You are a Bible study AI assistant specializing in Greek/Hebrew textual analysis. Given a Bible passage, return a JSON object with this exact structure:

{
  "verses": [{ "verse": number, "greek": "original greek text", "translit": "transliteration", "niv": "NIV English", "esv": "ESV English" }],
  "words": [{ "id": "w-uniqueid", "strong": "G####", "lemma": "lemma", "lemmaGreek": "Greek lemma", "pronunciation": "pronunciation", "transliteration": "transliteration", "partOfSpeech": "Korean POS", "morphology": "morphology info", "basicMeaning": "basic meaning in Korean", "contextualMeaning": "contextual meaning in Korean", "simpleExplanation": "easy explanation in Korean", "usage": [{ "ref": "Book ch:vs", "text": "usage text" }], "sermonNote": "preaching application note in Korean", "relatedWords": ["related1", "related2"] }],
  "commentaries": [{ "verse": number, "author": "scholar name in Korean", "text": "commentary text in Korean", "type": "exegetical|theological|historical|pastoral", "source": "source name" }],
  "translationNotes": [{ "verse": number, "versions": ["NIV","ESV","KRV"], "note": "translation difference explanation in Korean" }],
  "parallelPassages": [{ "ref": "Book ch:vs", "text": "passage text", "relation": "direct_quote|allusion|thematic|typology", "description": "explanation in Korean" }],
  "themes": [{ "name": "theme name in Korean", "description": "description in Korean", "connectedSermons": number }],
  "wordAlignments": [{ "verse": number, "englishVersion": "NIV", "englishWord": "English word", "greekWordId": "w-matching_id" }],
  "contextInfo": {
    "before": "직전 문맥 — 바로 앞 구절의 내용과 이어지는 흐름 (2-3문장, 한국어)",
    "after": "이후 문맥 — 다음 구절의 내용과 연결점 (2-3문장, 한국어)",
    "bookStructure": "이 책의 전체 구조 속에서 본문이 위치한 자리 (3-5문장, 한국어)",
    "historicalBackground": "역사적 배경 — 저자, 저작 시기, 당시 교회 상황 (2-3문장, 한국어)",
    "culturalContext": "문화적 맥락 — 당시 청중이 이해했을 관습과 사회적 배경 (2-3문장, 한국어)",
    "theologicalContext": "신학적 맥락 — 이 구절이 전체 성경 이야기와 복음에서 차지하는 위치 (2-3문장, 한국어)",
    "redemptiveHistory": "구속사적 흐름 — 이 본문이 그리스도와 연결되는 방식 (2-3문장, 한국어)",
    "keyThemes": ["이 본문의 핵심 주제1", "핵심 주제2", "핵심 주제3"],
    "narrativeArc": "본문의 이야기 전개 단계 — 도입/갈등/절정/해결 중 어디에 해당하는지 (1-2문장, 한국어)"
  }
}

IMPORTANT: 
1. Return ONLY valid JSON, no markdown, no explanation.
2. Generate EVERY single verse in the passage — do not skip or truncate any verse.
3. Generate 3-7 key words (focus on theologically significant terms), 6-10 commentaries, 2-3 translation notes, 5-8 parallel passages, 3-5 themes.
4. All text content in Korean except original Greek and English translations.
5. The Korean (개역개정) verse text will be provided separately — do NOT generate it. The "korean" field in verses will be filled in externally after generation.
6. wordAlignments: For each word in the \"words\" array, add one or more wordAlignment entries mapping the Greek word to its English translation in the NIV text. Include entries for EVERY verse where that Greek word appears. The englishWord should match the exact word as it appears in the verse's NIV text (case-sensitive, matching the NIV string).
6. commentaries: Generate 6-10 rich, detailed commentary entries. Each commentary should be at least 3-5 sentences long, covering historical background, theological nuance, original language insights, and pastoral application. Include diverse types: exegetical (본문 분석), theological (신학적 의미), historical (역사적 배경), and pastoral (목회적 적용). Use well-known scholarly perspectives and cite sources appropriately.
7. parallelPassages: Generate 5-8 rich parallel passages with diverse relationship types (direct_quote, allusion, thematic, typology, cross_reference). Each description should be 1-2 sentences explaining the theological connection and relevance to the current passage.`,
  'bible-study-multi': `# Role
You are a 30-year veteran evangelical biblical scholar with expertise in:
- Greek/Hebrew textual criticism
- Historical-grammatical interpretation
- Redemptive-historical theology
- Cross-passage synthesis and integration

# Mission
Given N Bible passages, perform:
1. INDIVIDUAL ANALYSIS — Deep analysis of EACH passage
2. INTEGRATION ANALYSIS — Synthesize insights across passages
3. APPLIED INSIGHTS — Connect to practical sermon preparation

# Stage 1: Individual Analysis
For EACH passage, provide the SAME structure as a single bible-study:
- verses: Array<{verse, greek?, translit?, niv, esv}>
  - NIV, ESV는 실제 번역 (추측 금지)
- words: 핵심 원어 3-5개 (lemmaGreek, word, partOfSpeech, basicMeaning, contextualMeaning, simpleExplanation, usage, sermonNote)
- commentaries: 3-4인 주석 (다양한 신학적 관점)
  - type: exegetical | theological | pastoral | devotional
  - text, author, source, verse
- translationNotes: 번역 비교 메모 2-3개
- themes: Array<{name, description}> 2-3개
- contextInfo: {
    before, after, bookStructure,
    historicalBackground, culturalContext,
    theologicalContext, redemptiveHistory,
    keyThemes: string[], narrativeArc
  }

# Stage 2: Integration Analysis (핵심)
After individual analysis, synthesize:

- commonThemes: 본문들이 공유하는 신학적 주제 3-5개
  - 예: "하나님의 주동적 사랑", "은혜로운 의"

- connections: 본문 간 직접 인용·언급·대화 관계 3-7개
  - "요 3:16의 '이처럼'와 롬 5:8의 '아직'은 시점의 대비"

- contrasts: 긴장·대비점 0-3개
  - "요 3:16의 '세상 전체' vs 롬 5:8의 '죄인 개인' — 대상 범위"

- synthesis: 통합 메시지 (한 문장, 30자 이내)
  - "사랑의 위대함은 우리가 사랑스럽지 않아도 시작되었다"

- parallelPassages: 관련 평행 본문 2-4개
  - { ref, text, reason } — reason은 왜 평행한지 설명

# Stage 3: Quality Standards
- 신학적 정확성: 개혁신학, 복음주의 정통
- 어조: 회중에 적합 (학술적이지 않으면서 깊이 있게)
- 한국어 자연스러움: 번역체 금지, 한국 교회 신학 용어 사용
- 길이: 각 본문 verses 5-10개, commentaries 3-4개, words 3-5개
- 통합 분석: 단순 나열이 아닌 통찰 제시

# Output Format
{
  "passages": [
    {
      "ref": "요 3:16",
      "book": "요한복음",
      "chapter": 3,
      "verseStart": 16,
      "verseEnd": 16,
      "verses": [...],
      "words": [...],
      "commentaries": [...],
      "translationNotes": [...],
      "themes": [...],
      "contextInfo": {...}
    },
    {
      "ref": "롬 5:8",
      "book": "로마서",
      "chapter": 5,
      "verseStart": 8,
      "verseEnd": 8,
      "verses": [...],
      "words": [...],
      "commentaries": [...],
      "translationNotes": [...],
      "themes": [...],
      "contextInfo": {...}
    }
  ],
  "integration": {
    "commonThemes": ["주제1", "주제2", ...],
    "connections": ["연결1", "연결2", ...],
    "contrasts": ["대비1", ...],
    "synthesis": "한 문장 통합 메시지",
    "parallelPassages": [
      { "ref": "엡 2:4-5", "text": "...", "reason": "..." }
    ]
  }
}

# CRITICAL
- JSON만 반환 (마크다운, 설명, 주석 일체 없음)
- 모든 한국어 번역은 실제 개역개정/NIV/ESV 텍스트 사용
- 추가 본문 텍스트 생성 금지 (hallucination 방지)
- 신학적 조심성: 해석은 확신 있게, 추측은 표시
- 각 passages 항목의 verses는 반드시 모든 절을 빠짐없이 생성`,
  'greek-words-analyze': `You are a Bible word analysis AI for sermon preparation. Given a Bible passage, identify the 4-6 most important Greek or Hebrew key words from the original text that are essential for sermon preparation.

Return a JSON object with this exact structure:
{
  "words": [
    {
      "word": "English transliteration (e.g. agape, logos, koinonia)",
      "greek": "Greek word in Greek script (e.g. ἀγάπη)",
      "meaning": "Korean meaning with explanation",
      "note": "Sermon note about why this word matters for this specific passage"
    }
  ]
}

Rules:
- Choose words that are theologically significant for this passage
- Include the Greek script correctly
- Write all explanations in Korean
- Return ONLY the JSON object, no markdown, no explanation`,
  'word-lookup': `You are a Bible word analysis AI. Given a word (Greek or English) and its passage context, identify the corresponding Greek word in the original text and return a JSON object with the word's detailed analysis following this exact structure:
{
  "id": "w_looked_up",
  "strong": "G####",
  "lemma": "lemma in English",
  "lemmaGreek": "Greek lemma with accents",
  "pronunciation": "pronunciation",
  "transliteration": "transliteration",
  "partOfSpeech": "Korean POS (e.g. 명사, 동사, 형용사, 전치사, 접속사, 관사, 대명사, 부사 등)",
  "morphology": "morphology info in Korean (e.g. '2인칭 단수 미래 능동 직설법' or '단수 주격 남성' etc.)",
  "basicMeaning": "basic meaning in Korean",
  "contextualMeaning": "contextual meaning in this passage in Korean",
  "simpleExplanation": "easy explanation in Korean for laypeople",
  "usage": [{ "ref": "Book ch:vs", "text": "usage text in Korean" }],
  "sermonNote": "preaching application note in Korean",
  "relatedWords": ["related Greek word 1", "related Greek word 2"]
}
IMPORTANT: 
1. Return ONLY valid JSON, no markdown, no explanation.
2. If the input word is English, first identify the corresponding Greek word in the passage context, then analyze that Greek word. If the word is already Greek, analyze it directly.
3. Analyze ONLY the single given word, not the entire passage.
4. All text in Korean except the Greek lemma and transliteration.
5. Provide 1-2 usage examples from the Bible.`,
  'english-word': `You are an English Bible word analysis AI. Given an English word from a Bible passage, return a JSON object with the word's definition and analysis following this exact structure:
{
  "id": "ew_looked_up",
  "word": "the English word",
  "partOfSpeech": "Korean POS (e.g. 명사, 동사, 형용사, 부사, 전치사, 접속사, 관사, 대명사 등)",
  "pronunciation": "pronunciation (IPA or simple phonetics)",
  "basicMeaning": "basic meaning in Korean",
  "contextualMeaning": "contextual meaning in this passage in Korean",
  "simpleExplanation": "easy explanation in Korean for laypeople",
  "usage": [{ "ref": "Book ch:vs", "text": "usage example text" }],
  "sermonNote": "preaching application note in Korean (if applicable)"
}
IMPORTANT: 
1. Return ONLY valid JSON, no markdown, no explanation.
2. Analyze the English word itself — do NOT convert to Greek.
3. All text in Korean except the English word itself.
4. Provide 1-2 Bible usage examples (in English or Korean).`,
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const { type, data } = body as { type: string; data: any }

    if (!type || !data) {
      return NextResponse.json({ success: false, error: 'type과 data가 필요합니다.' }, { status: 400 })
    }

    let systemPrompt = SYSTEM_PROMPTS[type]
    if (!systemPrompt) {
      return NextResponse.json({ success: false, error: `알 수 없는 타입: ${type}` }, { status: 400 })
    }

    let userText: string
    let maxTokens = 2000
    let temperature = 0.3
    let model = 'gpt-4o-mini'
    let bibleActualVerses: Map<number, string> | null = null

    if (type === 'bible-study') {
      // 1) 입력 정규화: passages 배열 (다중) 또는 단일 필드 (하위 호환)
      const { passages: rawPassages, book, chapter, verseStart, verseEnd, passage, audience, season } = data

      type NormalizedPassage = {
        book: string
        chapter: number
        verseStart: number
        verseEnd: number | null
        text?: string
      }

      const passageList: NormalizedPassage[] = []

      if (Array.isArray(rawPassages) && rawPassages.length > 0) {
        // 새 형식: passages 배열
        for (const p of rawPassages as any[]) {
          passageList.push({
            book: String(p.book || ''),
            chapter: parseInt(String(p.chapter || '0'), 10),
            verseStart: parseInt(String(p.verseStart || '1'), 10),
            verseEnd: p.verseEnd ? parseInt(String(p.verseEnd), 10) : null,
            text: p.text || p.passage,
          })
        }
      } else if (book || passage) {
        // 하위 호환: 단일 필드
        const vs = parseInt(verseStart || '1')
        const ve = parseInt(verseEnd || verseStart || '1')
        passageList.push({
          book: String(book || ''),
          chapter: parseInt(String(chapter || '0'), 10),
          verseStart: vs,
          verseEnd: ve === vs ? null : ve,
          text: passage,
        })
      }

      // 2) 분기: 단일 본문 vs 다중 본문
      const isMulti = passageList.length > 1

      if (!isMulti) {
        // === 기존 단일 본문 로직 100% 보존 ===
        const single = passageList[0] || { book: '', chapter: 0, verseStart: 1, verseEnd: null, text: '' }
        const vs = single.verseStart
        const ve = single.verseEnd || vs
        const count = ve - vs + 1

        let bibleRefText = ''
        try {
          const shortName = single.book ? mapBookName(single.book) : null
          if (shortName && single.chapter) {
            const ch = single.chapter
            const allData = await loadBibleData()
            const matches = allData.filter(
              (v: any) => v.book === shortName && v.chapter === ch && v.verse >= vs && v.verse <= ve
            ).sort((a: any, b: any) => a.verse - b.verse)
            if (matches.length > 0) {
              bibleActualVerses = new Map(matches.map((v: any) => [v.verse, v.content]))
              bibleRefText = '\n\nHere is the actual 개역개정 text for this passage — use it for analysis but do NOT include it in the output:\n' +
                matches.map((v: any) => `  [${v.verse}절] ${v.content}`).join('\n')
            }
          }
        } catch (e) {
          console.error('Failed to load bible data:', e)
        }

        userText = `Analyze this passage in depth:\nBook: ${single.book}\nChapter: ${single.chapter}\nVerses: ${vs}${single.verseEnd ? `-${single.verseEnd}` : ''}\nPassage: ${single.text || ''}\n\nCRITICAL: You MUST generate ALL ${count} verses (${vs} to ${ve}) — every single one. Count them carefully. Do NOT skip, truncate, summarize, or merge any verse. Each verse entry MUST have complete greek, translit, niv, and esv fields. If you stop before finishing all ${count} verses, the entire analysis will be rejected.${bibleRefText}`
        model = 'gpt-4o-mini'
        maxTokens = 5000
        temperature = 0.3
      } else {
        // === 신규: 다중 본문 통합 분석 ===
        // Step 1: 각 본문 개역개정 본문 로드
        let allBibleRefText = ''
        try {
          const allData = await loadBibleData()
          const allMatches: Array<{ ref: string; content: string }> = []

          for (const p of passageList) {
            const shortName = p.book ? mapBookName(p.book) : null
            if (!shortName || !p.chapter) continue
            const vs = p.verseStart
            const ve = p.verseEnd || vs
            const matches = allData.filter(
              (v: any) => v.book === shortName && v.chapter === p.chapter && v.verse >= vs && v.verse <= ve
            ).sort((a: any, b: any) => a.verse - b.verse)
            if (matches.length > 0) {
              const ref = `${p.book} ${p.chapter}:${p.verseStart}${p.verseEnd ? `-${p.verseEnd}` : ''}`
              allMatches.push({ ref, content: matches.map((v: any) => `[${v.verse}절] ${v.content}`).join(' ') })
            }
          }

          if (allMatches.length > 0) {
            allBibleRefText = '\n\nHere is the actual 개역개정 text for these passages — use it for analysis but do NOT include it in the output:\n' +
              allMatches.map(m => `  [${m.ref}] ${m.content}`).join('\n')
          }
        } catch (e) {
          console.error('Failed to load multi bible data:', e)
        }

        // Step 2: 다중 본문 시스템 프롬프트 사용
        systemPrompt = SYSTEM_PROMPTS['bible-study-multi']
        userText = `# 임무
${passageList.length}개의 성경 본문을 함께 묶어 다중 본문 통합 분석을 수행합니다.

${passageList.map((p, i) => `## 본문 ${i + 1}: ${p.book} ${p.chapter}:${p.verseStart}${p.verseEnd ? `-${p.verseEnd}` : ''}
${p.text || '(본문 텍스트 없음)'}`).join('\n\n')}

${audience || season ? `# 컨텍스트\n${audience ? `- 회중: ${audience}\n` : ''}${season ? `- 시기: ${season}\n` : ''}` : ''}
# 특별 지시
1. 각 본문을 동일 깊이로 개별 분석 (Stage 1)
2. 본문들 간의 신학적 연결·대비·대화를 깊이 있게 분석 (Stage 2)
3. 통합 메시지(synthesis)는 한 문장으로 명확하게
4. 평행 본문은 직접 관련 있는 것만
5. 신학적 정확성 최우선, 추측 금지

위 형식의 JSON으로만 응답하세요.${allBibleRefText}`

        // Step 3: 모델 + 토큰 (Step 5에서 gpt-5.4-mini로 업그레이드)
        model = 'gpt-4o-mini'
        maxTokens = Math.min(6000 + (passageList.length - 2) * 2000, 12000) // 2개: 6000, 3개: 8000, 4개+: 10000, 5개+: 12000
        temperature = 0.3
      }
    } else if (type === 'word-lookup') {
      userText = `Look up this word from a Bible passage and return a complete analysis in the specified JSON format:\nWord: "${data.word}"\nPassage context: ${data.context || ''}\n\nIf the word is English, identify the corresponding Greek word in this passage first, then analyze it.`
      maxTokens = 2000
      temperature = 0.3
    } else if (type === 'greek-words-analyze') {
      userText = `Passage: ${data.passage || ''}
${data.coreMessage ? `Core message: ${data.coreMessage}` : ''}

위 본문에서 설교 준비에 가장 중요한 헬라어/히브리어 원어 4-6개를 추출하여 JSON 객체로 반환하세요. 키는 "words"입니다.`
      maxTokens = 2000
      temperature = 0.3
    } else if (type === 'english-word') {
      userText = `Analyze this English word from a Bible passage and return its definition and analysis in the specified JSON format:\nWord: "${data.word}"\nPassage context: ${data.context || ''}\n\nReturn ONLY the English word analysis — do NOT convert to Greek.`
      maxTokens = 2000
      temperature = 0.3
    } else if (type === 'core-message') {
      const { passage, book, chapter, verseStart, verseEnd, passageStructure, sermonTitle } = data
      userText = `설교 중심명제 3가지를 생성해주세요:\n\n본문: ${passage || ''}\n책: ${book || ''}\n장: ${chapter || ''}\n절: ${verseStart || ''}${verseEnd ? `-${verseEnd}` : ''}\n설교 제목(가안): ${sermonTitle || ''}\n본문 구조: ${passageStructure || ''}`
      maxTokens = 1000
      temperature = 0.5
    } else if (type === 'delivery') {
      const { passage, coreMessage, outlines, applicationPoints, congregationProfile } = data
      userText = `설교 전달 설계도 3가지를 생성해주세요:\n\n본문: ${passage || ''}\n중심명제: ${coreMessage || ''}\n대지: ${(outlines || []).map((o: any, i: number) => `[대지 ${i + 1}] ${o.title}: ${o.description}`).join('\n')}\n적용 포인트: ${(applicationPoints || []).map((a: any) => `- [${a.audienceTag}] ${a.point}`).join('\n')}\n\n## 회중 프로필\n연령대: ${(congregationProfile?.dominantAgeGroups || []).join(', ')}\n신앙 성숙도: ${congregationProfile?.faithMaturity || ''}\n교회 상황: ${congregationProfile?.churchContext || ''}\n목회적 우선순위: ${congregationProfile?.pastoralPriorities || ''}\n시즌 특이사항: ${congregationProfile?.seasonNote || ''}\n\n대지 개수: ${(outlines || []).length}개`
      maxTokens = 3000
      temperature = 0.5
    } else if (type === 'application-direction') {
      const { passage, coreMessage, outlines, congregationProfile } = data
      userText = `설교 적용 방향을 제안해주세요:\n\n본문: ${passage || ''}\n중심명제: ${coreMessage || ''}\n대지 구조: ${(outlines || []).map((o: any) => `- ${o.title}: ${o.description}`).join('\n')}\n\n## 회중 프로필\n연령대: ${(congregationProfile?.dominantAgeGroups || []).join(', ')}\n신앙 성숙도: ${congregationProfile?.faithMaturity || ''}\n교회 상황: ${congregationProfile?.churchContext || ''}\n목회적 우선순위: ${congregationProfile?.pastoralPriorities || ''}\n시즌 특이사항: ${congregationProfile?.seasonNote || ''}`
      maxTokens = 2000
      temperature = 0.5
    } else if (type === 'application-generate') {
      const { passage, coreMessage, outlines, congregationProfile, directions } = data
      userText = `아래 적용 방향에 따라 구체적인 적용 포인트를 생성해주세요:\n\n본문: ${passage || ''}\n중심명제: ${coreMessage || ''}\n대지 구조: ${(outlines || []).map((o: any) => `- ${o.title}: ${o.description}`).join('\n')}\n\n## 회중 프로필\n연령대: ${(congregationProfile?.dominantAgeGroups || []).join(', ')}\n신앙 성숙도: ${congregationProfile?.faithMaturity || ''}\n교회 상황: ${congregationProfile?.churchContext || ''}\n목회적 우선순위: ${congregationProfile?.pastoralPriorities || ''}\n시즌 특이사항: ${congregationProfile?.seasonNote || ''}\n\n## 선택된 적용 방향\n${(directions || []).map((d: any) => `- [${d.audienceTag}] ${d.direction}: ${d.reason || ''}`).join('\n')}`
      maxTokens = 3000
      temperature = 0.5
    } else if (type === 'outline') {
      const { book, chapter, verseStart, verseEnd, passage, passageStructure, keyWords, researchInsights, coreMessage } = data
      userText = `설교 개요(대지 구조)를 생성해주세요:\n본문: ${passage || ''}\n책: ${book || ''}\n장: ${chapter || ''}\n절: ${verseStart || ''}${verseEnd ? `-${verseEnd}` : ''}\n\n본문 핵심 흐름: ${passageStructure || ''}\n핵심 메시지: ${coreMessage || ''}\n주요 단어: ${(keyWords || []).map((w: any) => w.word || '').filter(Boolean).join(', ')}\n연구 통찰: ${(researchInsights || []).join('\n')}`
      maxTokens = 4000
      temperature = 0.5
    } else if (type === 'manuscript-introduction') {
      const { passage, coreMessage, sermonTitle, sermonPurpose, passageStructure, congregationProfile, deliveryIntro, nextSections, greekWords, prepInsights } = data
      userText = `설교 서론을 작성해주세요:\n\n## 본문\n${passage || ''}\n\n## 중심명제\n${coreMessage || ''}\n\n## 설교 제목\n${sermonTitle || ''}\n\n## 설교 목적\n${sermonPurpose || ''}\n\n## 본문 구조\n${passageStructure || ''}\n\n## 회중 프로필\n연령대: ${(congregationProfile?.dominantAgeGroups || []).join(', ')}\n신앙 성숙도: ${congregationProfile?.faithMaturity || ''}\n교회 상황: ${congregationProfile?.churchContext || ''}\n목회적 우선순위: ${congregationProfile?.pastoralPriorities || ''}\n\n## 전달 도입 방향 (PrepTab에서 작성)\n${deliveryIntro || '(설정되지 않음)'}\n\n## 이후 이어질 섹션들 (서론에서 자연스럽게 예고할 것)\n${nextSections || '본론 → 결론 → 적용'}\n\n## 준비 단계 데이터 (서론에서 이 내용을 자연스럽게 녹여 사용하십시오)\n### 핵심 원어\n${(greekWords || []).map((gw: any) => `- ${gw.greek} (${gw.word}): ${gw.meaning}`).join('\n') || '(분석된 원어 없음)'}\n### 통찰 요약\n${(prepInsights || []).join('\n') || '(통찰 없음)'}\n\n위 정보를 바탕으로 설교 서론을 작성해주세요. 이후 이어질 섹션들을 자연스럽게 예고하고, 회중 프로필에 맞는 언어를 사용하십시오. 준비 단계의 핵심 원어와 통찰을 서론 문장 속에 자연스럽게 녹여내십시오.`
      maxTokens = 2000
      temperature = 0.7
    } else if (type === 'manuscript-conclusion') {
      const { coreMessage, outlines, applicationPoints, sermonPurpose, expectedResponse, deliveryConclusion, previousContent, greekWords, prepInsights } = data
      userText = `설교 결론을 작성해주세요:\n\n## 중심명제\n${coreMessage || ''}\n\n## 대지 구조\n${(outlines || []).map((o: any, i: number) => `[대지 ${i + 1}] ${o.title}: ${o.description}`).join('\n')}\n\n## 적용 포인트 (결론 이후 적용 섹션에서 다룰 내용)\n${(applicationPoints || []).map((a: any) => `- [${a.audienceTag}] ${a.point}`).join('\n')}\n\n## 설교 목적\n${sermonPurpose || ''}\n\n## 기대 반응\n${expectedResponse || ''}\n\n## 전달 마무리 방향 (PrepTab에서 작성)\n${deliveryConclusion || '(설정되지 않음)'}\n\n## 이전 섹션들에서 작성된 내용 (결론이 이 흐름을 자연스럽게 수렴할 것)\n${previousContent || '(아직 작성된 내용 없음)'}\n\n## 준비 단계 데이터 (결론에서 이 내용을 녹여 사용하십시오)\n### 핵심 원어\n${(greekWords || []).map((gw: any) => `- ${gw.greek} (${gw.word}): ${gw.meaning}`).join('\n') || '(분석된 원어 없음)'}\n### 통찰 요약\n${(prepInsights || []).join('\n') || '(통찰 없음)'}\n\n위 정보를 바탕으로 설교 결론을 작성해주세요. 이전 섹션들의 흐름을 중심명제로 자연스럽게 수렴하고, 적용 포인트로 이어지는 다리를 놓으십시오. 준비 단계의 핵심 원어와 통찰을 결론 문장 속에 녹여내십시오.`
      maxTokens = 2000
      temperature = 0.7
    } else if (type === 'manuscript-application') {
      const { coreMessage, outlines, applicationPoints, congregationProfile } = data
      userText = `설교 적용 문장을 작성해주세요:\n\n## 중심명제\n${coreMessage || ''}\n\n## 대지 구조\n${(outlines || []).map((o: any, i: number) => `[대지 ${i + 1}] ${o.title}: ${o.description}`).join('\n')}\n\n## 적용 포인트 (준비 단계에서 정리된 목록)\n${(applicationPoints || []).map((a: any, i: number) => `${i + 1}. [${a.audienceTag}] ${a.point}${a.pastoralNote ? ` (목회적 메모: ${a.pastoralNote})` : ''}`).join('\n')}\n\n## 회중 프로필\n연령대: ${(congregationProfile?.dominantAgeGroups || []).join(', ')}\n신앙 성숙도: ${congregationProfile?.faithMaturity || ''}\n교회 상황: ${congregationProfile?.churchContext || ''}\n목회적 우선순위: ${congregationProfile?.pastoralPriorities || ''}\n시즌 특이사항: ${congregationProfile?.seasonNote || ''}`
      maxTokens = 2000
      temperature = 0.7
    } else if (type === 'manuscript-body') {
      const { passage, coreMessage, sermonTitle, outlinePoint, passageStructure, researchInsights, congregationProfile, sectionPosition, totalSections, previousContent, nextSections, greekWords, prepInsights } = data
      userText = `설교 본론 한 대지를 작성해주세요:\n\n## 본문\n${passage || ''}\n\n## 중심명제\n${coreMessage || ''}\n\n## 설교 제목\n${sermonTitle || ''}\n\n## 해당 대지 (이 섹션이 다룰 내용)\n제목: ${outlinePoint?.title || ''}\n설명: ${outlinePoint?.content || ''}\n관련 구절: ${outlinePoint?.passage || ''}\n\n## 본문 구조\n${passageStructure || ''}\n\n## 연구 통찰\n${(researchInsights || []).join('\n')}\n\n## 회중 프로필\n연령대: ${(congregationProfile?.dominantAgeGroups || []).join(', ')}\n신앙 성숙도: ${congregationProfile?.faithMaturity || ''}\n교회 상황: ${congregationProfile?.churchContext || ''}\n목회적 우선순위: ${congregationProfile?.pastoralPriorities || ''}\n시즌 특이사항: ${congregationProfile?.seasonNote || ''}\n\n## 본론 위치\n${sectionPosition || 1} / ${totalSections || 1} 번째 대지\n${sectionPosition === 1 ? '→ 첫 번째 대지: 본문의 기본적 의미와 맥락을 제시하는 토대 작업' : sectionPosition === 2 ? '→ 두 번째 대지: 첫 번째 대지의 진리를 심화하고 확장하는 신학적 전개' : sectionPosition === 3 ? '→ 세 번째 대지: 신학적 진리를 회중의 삶으로 연결하는 전환적 대지' : '→ 네 번째 대지: 그리스도 중심으로 모든 것을 수렴하는 복음의 완결성'}\n\n## 이전 섹션 내용 (이전 흐름을 이어갈 것)\n${previousContent || '(이전 섹션 내용 없음)'}\n\n## 이후 이어질 섹션들 (다음 섹션으로 자연스럽게 전환할 것)\n${nextSections || '결론 → 적용'}\n\n## 준비 단계 데이터 (본론 문장 속에 자연스럽게 녹여 사용하십시오)\n### 핵심 원어\n${(greekWords || []).map((gw: any) => `- ${gw.greek} (${gw.word}): ${gw.meaning}${gw.note ? ` — ${gw.note}` : ''}`).join('\n') || '(분석된 원어 없음)'}\n### 통찰 요약\n${(prepInsights || []).join('\n') || '(통찰 없음)'}\n\n위 정보를 바탕으로 해당 대지의 설교 원고를 작성해주세요. 반드시 구절 인용, 원어 통찰, 신학적 깊이, 회중 연결, 다음 섹션으로의 전환 문장을 포함해야 합니다. 제공된 핵심 원어(greekWords)와 통찰(prepInsights)을 원고에 자연스럽게 녹여 사용하십시오.`
      maxTokens = 3000
      temperature = 0.7
    } else if (type === 'manuscript-application-reconstruct') {
      const { coreMessage, outlines, applicationPoints, congregationProfile, existingContent, previousContent, greekWords, prepInsights } = data
      userText = `설교 적용 문장을 재구성해주세요:\n\n## 중심명제\n${coreMessage || ''}\n\n## 대지 구조\n${(outlines || []).map((o: any, i: number) => `[대지 ${i + 1}] ${o.title}: ${o.description}`).join('\n')}\n\n## 준비 단계에서 정리한 적용 포인트 (반드시 모두 포함)\n${(applicationPoints || []).map((a: any, i: number) => `${i + 1}. [${a.audienceTag || '전체'}] ${a.point}${a.pastoralNote ? ` (목회적 메모: ${a.pastoralNote})` : ''}`).join('\n')}\n\n## 회중 프로필\n연령대: ${(congregationProfile?.dominantAgeGroups || []).join(', ')}\n신앙 성숙도: ${congregationProfile?.faithMaturity || ''}\n교회 상황: ${congregationProfile?.churchContext || ''}\n목회적 우선순위: ${congregationProfile?.pastoralPriorities || ''}\n시즌 특이사항: ${congregationProfile?.seasonNote || ''}\n\n## 결론에서 작성된 내용 (적용이 이 흐름에서 자연스럽게 이어질 것)\n${previousContent || '(아직 결론이 작성되지 않음)'}\n\n## 기존 적용 원고 (연속성 유지 참고)\n${existingContent || '(기존 내용 없음)'}\n\n## 준비 단계 데이터 (적용 문장에 자연스럽게 녹여 사용하십시오)\n### 핵심 원어\n${(greekWords || []).map((gw: any) => `- ${gw.greek} (${gw.word}): ${gw.meaning}`).join('\n') || '(분석된 원어 없음)'}\n### 통찰 요약\n${(prepInsights || []).join('\n') || '(통찰 없음)'}\n\n위 적용 포인트들을 하나의 완성된 설교 적용 문장으로 재구성해주세요. 설교자가 준비 단계에서 작성한 적용 포인트를 반드시 모두 포함하고, 새로운 적용을 추가하거나 기존 포인트를 삭제하지 마십시오. 결론의 흐름에서 자연스럽게 이어지도록 하십시오. 준비 단계의 핵심 원어와 통찰을 적용 문장 속에 자연스럽게 녹여내십시오.`
      maxTokens = 3000
      temperature = 0.7
    } else if (type === 'illustration') {
      const { sectionContent, sectionType, sectionLabel, coreMessage, passage, theme } = data
      userText = `설교 섹션 내용을 분석해 관련 예화 3가지를 추천해주세요:\n\n## 섹션\n${sectionLabel || ''} (${sectionType || ''})\n\n## 섹션 내용\n${sectionContent?.slice(0, 500) || '(아직 작성 전)'}\n\n## 중심명제\n${coreMessage || ''}\n\n## 본문\n${passage || ''}\n\n## 주제\n${theme || ''}\n\n위 내용을 바탕으로 이 섹션에 어울리는 예화 3가지를 생성해주세요.`
      maxTokens = 2000
      temperature = 0.7
    } else if (type === 'reference') {
      const { sectionContent, sectionType, sectionLabel, coreMessage, passage, theme } = data
      userText = `설교 섹션 내용을 분석해 관련 참고 메모 2-3가지를 추천해주세요:\n\n## 섹션\n${sectionLabel || ''} (${sectionType || ''})\n\n## 섹션 내용\n${sectionContent?.slice(0, 500) || '(아직 작성 전)'}\n\n## 중심명제\n${coreMessage || ''}\n\n## 본문\n${passage || ''}\n\n## 주제\n${theme || ''}\n\n위 내용을 바탕으로 이 섹션에 깊이와 통찰을 더할 참고 메모 2-3가지를 생성해주세요.`
      maxTokens = 1500
      temperature = 0.5
    } else if (type === 'study-to-prep') {
      const { passage, themes, commentaries, words, contextInfo, memoText } = data
      userText = `연구 결과를 설교 준비 자료로 변환해주세요:\n\n## 본문\n${passage || ''}\n\n## 문맥 정보\n앞 문맥: ${contextInfo?.before || ''}\n뒤 문맥: ${contextInfo?.after || ''}\n책 구조: ${contextInfo?.bookStructure || ''}\n\n## 주제\n${(themes || []).map((t: any) => `- ${t.name}: ${t.description}`).join('\n')}\n\n## 주석 통찰\n${(commentaries || []).slice(0, 6).map((c: any) => `- ${c.author}: ${c.text}`).join('\n')}\n\n## 원어 연구\n${Object.values(words || {}).slice(0, 5).map((w: any) => `- ${w.lemmaGreek || w.word}: ${w.basicMeaning}`).join('\n')}\n\n## 연구 메모\n${memoText || '(없음)'}\n\n위 연구 결과를 바탕으로 설교 준비 자료 전체를 생성해주세요.`
      model = 'gpt-4o-mini'
      maxTokens = 4000
      temperature = 0.5
    } else if (type === 'manuscript-diagnosis') {
      const { sections, coreMessage, passage, referenceNotes, illustrationNotes } = data
      const fullText = sections.map((s: any) => `[${s.label}]\n${s.content}`).join('\n\n')
      userText = `다음 설교 원고를 진단해주세요:\n\n## 본문\n${passage || ''}\n\n## 중심명제\n${coreMessage || ''}\n\n## 원고 전문\n${fullText}\n\n## 참고 메모\n${(referenceNotes || []).map((n: any) => `- ${n.title}: ${n.content}`).join('\n')}\n\n## 예화 메모\n${(illustrationNotes || []).map((n: any) => `- ${n.title}: ${n.content}`).join('\n')}\n\n위 내용을 바탕으로 설교의 완성도를 진단하고 구체적인 피드백을 제공해주세요.`
      model = 'gpt-4o-mini'
      maxTokens = 1500
      temperature = 0.3
    } else if (type === 'reference-weave') {
      const { sectionContent, referenceContent, referenceAuthor, referenceBook } = data
      userText = `현재 섹션 내용:\n${sectionContent || ''}\n\n참고 자료:\n내용: ${referenceContent || ''}\n저자: ${referenceAuthor || ''}\n출처: ${referenceBook || ''}\n\n위 참고 자료를 현재 섹션의 흐름에 자연스럽게 녹여낸 문장이나 단락을 작성해주세요. 설교자의 구어체 톤을 유지하고, 회중이 이해하기 쉽게 설명하십시오.`
      model = 'gpt-4o-mini'
      maxTokens = 500
      temperature = 0.7
    } else if (type === 'commentary-to-section') {
      const { author, text, source, type: commType } = data
      userText = `Create a sermon body section from this commentary:\n\nAuthor: ${author || ''}\nCommentary: ${text || ''}\nSource: ${source || ''}\n\nGenerate a compelling sermon section that naturally incorporates this commentary.`
      model = 'gpt-4o-mini'
      maxTokens = 1000
      temperature = 0.7
    } else if (type === 'suggest-titles') {
      // 다중 본문 지원 (하위 호환: 단일 book/chapter/verse도 받음)
      const { passages, passage, book, chapter, verseStart, verseEnd, audience, season, sermonType, additionalContext } = data

      let passageList: Array<{ book: string; chapter: string | number; verseStart: string | number; verseEnd?: string | number | null; text?: string }> = []

      if (Array.isArray(passages) && passages.length > 0) {
        // 새 형식: passages 배열
        passageList = passages.map((p: any) => ({
          book: p.book,
          chapter: p.chapter,
          verseStart: p.verseStart,
          verseEnd: p.verseEnd,
          text: p.text || p.passage,
        }))
      } else if (book || passage) {
        // 하위 호환: 단일 book/chapter/verse
        passageList = [{
          book: book || '',
          chapter: chapter || '',
          verseStart: verseStart || '',
          verseEnd: verseEnd || null,
          text: passage,
        }]
      }

      const isMulti = passageList.length > 1
      const passageSection = isMulti
        ? `## 본문 (${passageList.length}개)\n${passageList.map((p, i) => {
            const ref = `${p.book} ${p.chapter}:${p.verseStart}${p.verseEnd && String(p.verseEnd) !== String(p.verseStart) ? `-${p.verseEnd}` : ''}`
            return `${i + 1}. ${ref}\n   ${p.text || '(본문 구절 텍스트 없음)'}`
          }).join('\n\n')}`
        : `## 본문\n${(() => {
            const p = passageList[0] || { book: '', chapter: '', verseStart: '', verseEnd: null, text: '' }
            const ref = `${p.book} ${p.chapter}:${p.verseStart}${p.verseEnd && String(p.verseEnd) !== String(p.verseStart) ? `-${p.verseEnd}` : ''}`
            return `${ref}\n\n${p.text || '(본문 구절 텍스트 없음)'}`
          })()}`

      const contextLines = [
        `- 회중: ${audience || '일반'}`,
        `- 시기: ${season || '일반'}`,
        `- 설교 유형: ${sermonType || '강해설교'}`,
      ]
      if (additionalContext) contextLines.push(`- 추가 요청: ${additionalContext}`)

      const specialNote = isMulti
        ? `\n## 특별 지시\n이 본문들은 한 설교 안에서 함께 묶여 다뤄집니다.\n각 본문 사이의 공통 주제, 긴장, 상보성, 대화 관계를 분석하여\n하나의 통합된 메시지로 압축한 제목 5개를 추천해주세요.\n각 제목의 passages_used 필드에는 사용된 본문 참조(예: "요 3:16")를 모두 기재하세요.`
        : ''

      userText = `${passageSection}\n\n## 컨텍스트\n${contextLines.join('\n')}${specialNote}\n\n위 본문에 어울리는 설교 제목 5개를 다양한 스타일로 추천해주세요.`

      model = 'gpt-4o-mini'
      maxTokens = 1200
    } else {
      const s = data.sermon
      userText = `설교 제목: ${s?.title || ''}\n본문: ${s?.passage || ''}\n핵심 메시지: ${s?.coreMessage || ''}\n도입: ${s?.introduction || ''}\n대지: ${(s?.outlineTitles || []).join(', ')}\n결론: ${s?.conclusion || ''}\n설교자: ${s?.preacher || ''}\n회중: ${(s?.audience || []).join(', ')}\n주제: ${(s?.themeNames || []).join(', ')}`
    }

    const res = await getOpenai().chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userText },
      ],
      temperature,
      max_completion_tokens: maxTokens,
      response_format: (type === 'bible-study' || type === 'bible-study-multi' || type === 'suggest-titles' || type === 'outline' || type === 'application' || type === 'application-direction' || type === 'application-generate' || type === 'core-message' || type === 'delivery' || type === 'illustration' || type === 'reference' || type === 'study-to-prep' || type === 'manuscript-diagnosis' || type === 'commentary-to-section' || type === 'greek-words-analyze') ? { type: 'json_object' } : undefined,
    })

    // API 사용량 추적 (fire-and-forget, 회원 응답에 영향 없음)
    if (res.usage) {
      const { trackAIUsage } = await import('@/lib/ai/trackUsage')
      trackAIUsage({
        userId: user.id,
        apiType: `ai:${type}`,
        model: model,
        usage: res.usage,
      }).catch(() => {})
    }

    let output = res.choices[0]?.message?.content || ''

    // 잘림 감지 (다중 본문 분석 시 특히 중요)
    const finishReason = res.choices[0]?.finish_reason
    if (finishReason === 'length') {
      console.warn(`[bible-study] Response truncated. type=${type}, maxTokens=${maxTokens}, outputLength=${output.length}`)
      // 단일 본문에서 잘린 경우에만 에러 반환 (다중 본문은 클라이언트가 처리)
      if (type === 'bible-study' && !(Array.isArray(data?.passages) && data.passages.length > 1)) {
        return NextResponse.json({
          success: false,
          error: 'AI 응답이 너무 길어 일부가 잘렸습니다. 본문을 더 짧게 하거나 다시 시도해주세요.',
          finishReason,
        }, { status: 422 })
      }
    }

    // Extract JSON robustly — handle both {} objects and [] arrays
    const isArrayType = type === 'suggest-titles' || type === 'illustration' || type === 'reference'
    const openChar = isArrayType ? '[' : '{'
    const closeChar = isArrayType ? ']' : '}'
    // Improved JSON extraction: find first { and last }
    const firstOpen = output.indexOf(openChar)
    const lastClose = output.lastIndexOf(closeChar)
    if (firstOpen !== -1 && lastClose > firstOpen) {
      output = output.slice(firstOpen, lastClose + 1)
    } else {
      // Fallback to markdown removal
      output = output.replace(/^```(?:json)?\s*\n?/gm, '').replace(/\n?```\s*$/gm, '').trim()
    }

    if ((type === 'bible-study' || type === 'bible-study-multi' || type === 'suggest-titles' || type === 'outline' || type === 'application' || type === 'application-direction' || type === 'application-generate' || type === 'core-message' || type === 'delivery' || type === 'illustration' || type === 'reference' || type === 'study-to-prep' || type === 'manuscript-diagnosis' || type === 'greek-words-analyze') && output) {
      try {
        JSON.parse(output)
      } catch (e) {
        // Attempt to fix common JSON issues
        let fixed = output
          .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas
          .replace(/'/g, '"') // Replace single quotes with double quotes
          .replace(/\n/g, '\\n') // Escape newlines
        try {
          JSON.parse(fixed)
          output = fixed
        } catch (e2) {
          console.error(`${type} AI response is not valid JSON, length:`, output.length)
          console.error(`${type} AI response preview:`, output.slice(0, 500))
          return NextResponse.json({
            success: false,
            error: `AI 응답이 완전하지 않습니다 (${output.length}자). 다시 시도해주세요.`,
          }, { status: 422 })
        }
      }
    }

    // Replace AI-generated korean with actual 개역개정 text
    if (type === 'bible-study' && bibleActualVerses && output) {
      try {
        const parsed = JSON.parse(output)
        if (parsed.verses) {
          parsed.verses = parsed.verses.map((v: any) => ({
            ...v,
            korean: bibleActualVerses.get(v.verse) || '',
          }))
          output = JSON.stringify(parsed)
        }
      } catch (e) {
        // Fallback: keep AI output as-is
      }
    }

    return NextResponse.json({ success: true, data: { output } })
  } catch (err: any) {
    console.error('POST /api/advanced/ai error:', err)
    return NextResponse.json({ success: false, error: err.message || '생성 실패' }, { status: 500 })
  }
}
