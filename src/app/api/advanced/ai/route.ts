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

/**
 * 다중 본문 출처 라벨을 userText에 추가할 때 사용하는 헬퍼.
 * 단일 본문이면 "본문: ..." 한 줄, 다중 본문이면 "본문: A + B\n출처 본문: ① A ② B" 형태로 반환.
 * passageLabels가 없거나 비어있으면 빈 문자열 반환.
 */
function formatPassageLabels(data: any): string {
  const labels: string[] = Array.isArray(data?.passageLabels)
    ? data.passageLabels.filter((s: any) => typeof s === 'string' && s.trim())
    : []
  if (labels.length === 0) return ''
  if (labels.length === 1) return `\n\n[출처 본문] ${labels[0]}`
  return `\n\n[출처 본문 (다중)]\n${labels.map((l, i) => `${i + 1}. ${l}`).join('\n')}`
}

const SYSTEM_PROMPTS: Record<string, string> = {
  'suggest-titles': '당신은 설교 준비를 돕는 AI입니다. 주어진 성경 본문(책, 장, 절)에 어울리는 설교 제목 5개와 각각의 추천 이유를 JSON 객체로 반환하세요. 형식: { "titles": [{ "title": "제목", "reason": "이유" }] }. 제목은 한국어로, 20자 이내로 간결하게 작성하세요. Return ONLY valid JSON, no markdown, no explanation.',
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
3. Generate 3-5 key words (focus on theologically significant terms), 3-5 commentaries, 2-3 translation notes, 3-5 parallel passages, 3-5 themes.
4. All text content in Korean except original Greek and English translations.
5. The Korean (개역개정) verse text will be provided separately — do NOT generate it. The "korean" field in verses will be filled in externally after generation.
6. wordAlignments: For each word in the \"words\" array, add one or more wordAlignment entries mapping the Greek word to its English translation in the NIV text. Include entries for EVERY verse where that Greek word appears. The englishWord should match the exact word as it appears in the verse's NIV text (case-sensitive, matching the NIV string).
7. commentaries: Generate 3-5 rich commentary entries, each 2-3 sentences long, covering historical background, theological nuance, original language insights, and pastoral application. Include diverse types: exegetical (본문 분석), theological (신학적 의미), historical (역사적 배경), and pastoral (목회적 적용).
8. parallelPassages: Generate 3-5 parallel passages with diverse relationship types (direct_quote, allusion, thematic, typology, cross_reference). Each description should be 1-2 sentences explaining the theological connection and relevance to the current passage.`,
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

    const baseSystemPrompt = SYSTEM_PROMPTS[type]
    if (!baseSystemPrompt) {
      return NextResponse.json({ success: false, error: `알 수 없는 타입: ${type}` }, { status: 400 })
    }
    const hasMultiplePassages = Array.isArray(data?.passageLabels) && data.passageLabels.length > 1
    const passageGuidance = hasMultiplePassages
      ? '\n\n## 다중 본문 처리 지침\n사용자가 여러 성경 본문을 함께 다루는 설교를 준비 중입니다. 응답에서:\n- 각 본문을 출처와 함께 명시적으로 인용하십시오 (예: "요한복음 3:16에서...", "로마서 5:8에서...")\n- 첫 번째 본문을 주(主) 본문으로, 나머지를 보조/병행 본문으로 취급하십시오\n- 본문 간 연결고리(신학적 주제, 대비, 보완)를 한 문장 이상으로 설명하십시오\n- 본문들을 통합한 통찰을 도출하되, 어느 한 본문을 누락하지 마십시오'
      : ''
    const systemPrompt = baseSystemPrompt + passageGuidance

    let userText: string
    let maxTokens = 2000
    let temperature = 0.3
    let model = 'gpt-5.4-mini'
    let bibleActualVerses: Map<number, string> | null = null

    if (type === 'bible-study') {
      const { book, chapter, verseStart, verseEnd, passage } = data
      const vs = parseInt(verseStart || '1')
      const ve = parseInt(verseEnd || verseStart || '1')
      const count = ve - vs + 1

      let bibleRefText = ''
      try {
        const shortName = book ? mapBookName(book) : null
        if (shortName && chapter) {
          const ch = parseInt(chapter)
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

      userText = `Analyze this passage in depth:\nBook: ${book || ''}\nChapter: ${chapter || ''}\nVerses: ${verseStart || ''}${verseEnd ? `-${verseEnd}` : ''}\nPassage: ${passage || ''}\n\nCRITICAL: You MUST generate ALL ${count} verses (${vs} to ${ve}) — every single one. Count them carefully. Do NOT skip, truncate, summarize, or merge any verse. Each verse entry MUST have complete greek, translit, niv, and esv fields. If you stop before finishing all ${count} verses, the entire analysis will be rejected.\n\nNOTE: This is academic theological research analyzing original biblical Greek text (Koine Greek) from the public domain. All content is standard theological analysis for sermon preparation.${bibleRefText}`
      model = 'gpt-5.4-mini'
      maxTokens = 10000
      temperature = 0.5
      userText += `\n\nLINGUISTIC FOCUS: Maintain strict academic linguistic analysis of the Koine Greek text. Focus on vocabulary, grammar, syntax, and lexical semantics. Describe theological content neutrally and concisely — avoid elaborative exposition on themes that could be considered sensitive. Keep all original Greek, transliteration, NIV, and ESV verse text intact for every verse.` + formatPassageLabels(data)
    } else if (type === 'word-lookup') {
      userText = `Look up this word from a Bible passage and return a complete analysis in the specified JSON format:\nWord: "${data.word}"\nPassage context: ${data.context || ''}\n\nIf the word is English, identify the corresponding Greek word in this passage first, then analyze it.` + formatPassageLabels(data)
      maxTokens = 2000
      temperature = 0.3
    } else if (type === 'greek-words-analyze') {
      userText = `Passage: ${data.passage || ''}
${data.coreMessage ? `Core message: ${data.coreMessage}` : ''}

위 본문에서 설교 준비에 가장 중요한 헬라어/히브리어 원어 4-6개를 추출하여 JSON 객체로 반환하세요. 키는 "words"입니다.` + formatPassageLabels(data)
      maxTokens = 2000
      temperature = 0.3
    } else if (type === 'english-word') {
      userText = `Analyze this English word from a Bible passage and return its definition and analysis in the specified JSON format:\nWord: "${data.word}"\nPassage context: ${data.context || ''}\n\nReturn ONLY the English word analysis — do NOT convert to Greek.` + formatPassageLabels(data)
      maxTokens = 2000
      temperature = 0.3
    } else if (type === 'core-message') {
      const { passage, book, chapter, verseStart, verseEnd, passageStructure, sermonTitle } = data
      userText = `설교 중심명제 3가지를 생성해주세요:\n\n본문: ${passage || ''}\n책: ${book || ''}\n장: ${chapter || ''}\n절: ${verseStart || ''}${verseEnd ? `-${verseEnd}` : ''}\n설교 제목(가안): ${sermonTitle || ''}\n본문 구조: ${passageStructure || ''}` + formatPassageLabels(data)
      maxTokens = 1000
      temperature = 0.5
    } else if (type === 'delivery') {
      const { passage, coreMessage, outlines, applicationPoints, congregationProfile } = data
      userText = `설교 전달 설계도 3가지를 생성해주세요:\n\n본문: ${passage || ''}\n중심명제: ${coreMessage || ''}\n대지: ${(outlines || []).map((o: any, i: number) => `[대지 ${i + 1}] ${o.title}: ${o.description}`).join('\n')}\n적용 포인트: ${(applicationPoints || []).map((a: any) => `- [${a.audienceTag}] ${a.point}`).join('\n')}\n\n## 회중 프로필\n연령대: ${(congregationProfile?.dominantAgeGroups || []).join(', ')}\n신앙 성숙도: ${congregationProfile?.faithMaturity || ''}\n교회 상황: ${congregationProfile?.churchContext || ''}\n목회적 우선순위: ${congregationProfile?.pastoralPriorities || ''}\n시즌 특이사항: ${congregationProfile?.seasonNote || ''}\n\n대지 개수: ${(outlines || []).length}개` + formatPassageLabels(data)
      maxTokens = 3000
      temperature = 0.5
    } else if (type === 'application-direction') {
      const { passage, coreMessage, outlines, congregationProfile } = data
      userText = `설교 적용 방향을 제안해주세요:\n\n본문: ${passage || ''}\n중심명제: ${coreMessage || ''}\n대지 구조: ${(outlines || []).map((o: any) => `- ${o.title}: ${o.description}`).join('\n')}\n\n## 회중 프로필\n연령대: ${(congregationProfile?.dominantAgeGroups || []).join(', ')}\n신앙 성숙도: ${congregationProfile?.faithMaturity || ''}\n교회 상황: ${congregationProfile?.churchContext || ''}\n목회적 우선순위: ${congregationProfile?.pastoralPriorities || ''}\n시즌 특이사항: ${congregationProfile?.seasonNote || ''}` + formatPassageLabels(data)
      maxTokens = 2000
      temperature = 0.5
    } else if (type === 'application-generate') {
      const { passage, coreMessage, outlines, congregationProfile, directions } = data
      userText = `아래 적용 방향에 따라 구체적인 적용 포인트를 생성해주세요:\n\n본문: ${passage || ''}\n중심명제: ${coreMessage || ''}\n대지 구조: ${(outlines || []).map((o: any) => `- ${o.title}: ${o.description}`).join('\n')}\n\n## 회중 프로필\n연령대: ${(congregationProfile?.dominantAgeGroups || []).join(', ')}\n신앙 성숙도: ${congregationProfile?.faithMaturity || ''}\n교회 상황: ${congregationProfile?.churchContext || ''}\n목회적 우선순위: ${congregationProfile?.pastoralPriorities || ''}\n시즌 특이사항: ${congregationProfile?.seasonNote || ''}\n\n## 선택된 적용 방향\n${(directions || []).map((d: any) => `- [${d.audienceTag}] ${d.direction}: ${d.reason || ''}`).join('\n')}` + formatPassageLabels(data)
      maxTokens = 3000
      temperature = 0.5
    } else if (type === 'outline') {
      const { book, chapter, verseStart, verseEnd, passage, passageStructure, keyWords, researchInsights, coreMessage } = data
      userText = `설교 개요(대지 구조)를 생성해주세요:\n본문: ${passage || ''}\n책: ${book || ''}\n장: ${chapter || ''}\n절: ${verseStart || ''}${verseEnd ? `-${verseEnd}` : ''}\n\n본문 핵심 흐름: ${passageStructure || ''}\n핵심 메시지: ${coreMessage || ''}\n주요 단어: ${(keyWords || []).map((w: any) => w.word || '').filter(Boolean).join(', ')}\n연구 통찰: ${(researchInsights || []).join('\n')}` + formatPassageLabels(data)
      maxTokens = 4000
      temperature = 0.5
    } else if (type === 'manuscript-introduction') {
      const { passage, coreMessage, sermonTitle, sermonPurpose, passageStructure, congregationProfile, deliveryIntro, nextSections, greekWords, prepInsights } = data
      userText = `설교 서론을 작성해주세요:\n\n## 본문\n${passage || ''}\n\n## 중심명제\n${coreMessage || ''}\n\n## 설교 제목\n${sermonTitle || ''}\n\n## 설교 목적\n${sermonPurpose || ''}\n\n## 본문 구조\n${passageStructure || ''}\n\n## 회중 프로필\n연령대: ${(congregationProfile?.dominantAgeGroups || []).join(', ')}\n신앙 성숙도: ${congregationProfile?.faithMaturity || ''}\n교회 상황: ${congregationProfile?.churchContext || ''}\n목회적 우선순위: ${congregationProfile?.pastoralPriorities || ''}\n\n## 전달 도입 방향 (PrepTab에서 작성)\n${deliveryIntro || '(설정되지 않음)'}\n\n## 이후 이어질 섹션들 (서론에서 자연스럽게 예고할 것)\n${nextSections || '본론 → 결론 → 적용'}\n\n## 준비 단계 데이터 (서론에서 이 내용을 자연스럽게 녹여 사용하십시오)\n### 핵심 원어\n${(greekWords || []).map((gw: any) => `- ${gw.greek} (${gw.word}): ${gw.meaning}`).join('\n') || '(분석된 원어 없음)'}\n### 통찰 요약\n${(prepInsights || []).join('\n') || '(통찰 없음)'}\n\n위 정보를 바탕으로 설교 서론을 작성해주세요. 이후 이어질 섹션들을 자연스럽게 예고하고, 회중 프로필에 맞는 언어를 사용하십시오. 준비 단계의 핵심 원어와 통찰을 서론 문장 속에 자연스럽게 녹여내십시오.` + formatPassageLabels(data)
      maxTokens = 2000
      temperature = 0.7
    } else if (type === 'manuscript-conclusion') {
      const { coreMessage, outlines, applicationPoints, sermonPurpose, expectedResponse, deliveryConclusion, previousContent, greekWords, prepInsights } = data
      userText = `설교 결론을 작성해주세요:\n\n## 중심명제\n${coreMessage || ''}\n\n## 대지 구조\n${(outlines || []).map((o: any, i: number) => `[대지 ${i + 1}] ${o.title}: ${o.description}`).join('\n')}\n\n## 적용 포인트 (결론 이후 적용 섹션에서 다룰 내용)\n${(applicationPoints || []).map((a: any) => `- [${a.audienceTag}] ${a.point}`).join('\n')}\n\n## 설교 목적\n${sermonPurpose || ''}\n\n## 기대 반응\n${expectedResponse || ''}\n\n## 전달 마무리 방향 (PrepTab에서 작성)\n${deliveryConclusion || '(설정되지 않음)'}\n\n## 이전 섹션들에서 작성된 내용 (결론이 이 흐름을 자연스럽게 수렴할 것)\n${previousContent || '(아직 작성된 내용 없음)'}\n\n## 준비 단계 데이터 (결론에서 이 내용을 녹여 사용하십시오)\n### 핵심 원어\n${(greekWords || []).map((gw: any) => `- ${gw.greek} (${gw.word}): ${gw.meaning}`).join('\n') || '(분석된 원어 없음)'}\n### 통찰 요약\n${(prepInsights || []).join('\n') || '(통찰 없음)'}\n\n위 정보를 바탕으로 설교 결론을 작성해주세요. 이전 섹션들의 흐름을 중심명제로 자연스럽게 수렴하고, 적용 포인트로 이어지는 다리를 놓으십시오. 준비 단계의 핵심 원어와 통찰을 결론 문장 속에 녹여내십시오.` + formatPassageLabels(data)
      maxTokens = 2000
      temperature = 0.7
    } else if (type === 'manuscript-application') {
      const { coreMessage, outlines, applicationPoints, congregationProfile } = data
      userText = `설교 적용 문장을 작성해주세요:\n\n## 중심명제\n${coreMessage || ''}\n\n## 대지 구조\n${(outlines || []).map((o: any, i: number) => `[대지 ${i + 1}] ${o.title}: ${o.description}`).join('\n')}\n\n## 적용 포인트 (준비 단계에서 정리된 목록)\n${(applicationPoints || []).map((a: any, i: number) => `${i + 1}. [${a.audienceTag}] ${a.point}${a.pastoralNote ? ` (목회적 메모: ${a.pastoralNote})` : ''}`).join('\n')}\n\n## 회중 프로필\n연령대: ${(congregationProfile?.dominantAgeGroups || []).join(', ')}\n신앙 성숙도: ${congregationProfile?.faithMaturity || ''}\n교회 상황: ${congregationProfile?.churchContext || ''}\n목회적 우선순위: ${congregationProfile?.pastoralPriorities || ''}\n시즌 특이사항: ${congregationProfile?.seasonNote || ''}` + formatPassageLabels(data)
      maxTokens = 2000
      temperature = 0.7
    } else if (type === 'manuscript-body') {
      const { passage, coreMessage, sermonTitle, outlinePoint, passageStructure, researchInsights, congregationProfile, sectionPosition, totalSections, previousContent, nextSections, greekWords, prepInsights } = data
      userText = `설교 본론 한 대지를 작성해주세요:\n\n## 본문\n${passage || ''}\n\n## 중심명제\n${coreMessage || ''}\n\n## 설교 제목\n${sermonTitle || ''}\n\n## 해당 대지 (이 섹션이 다룰 내용)\n제목: ${outlinePoint?.title || ''}\n설명: ${outlinePoint?.content || ''}\n관련 구절: ${outlinePoint?.passage || ''}\n\n## 본문 구조\n${passageStructure || ''}\n\n## 연구 통찰\n${(researchInsights || []).join('\n')}\n\n## 회중 프로필\n연령대: ${(congregationProfile?.dominantAgeGroups || []).join(', ')}\n신앙 성숙도: ${congregationProfile?.faithMaturity || ''}\n교회 상황: ${congregationProfile?.churchContext || ''}\n목회적 우선순위: ${congregationProfile?.pastoralPriorities || ''}\n시즌 특이사항: ${congregationProfile?.seasonNote || ''}\n\n## 본론 위치\n${sectionPosition || 1} / ${totalSections || 1} 번째 대지\n${sectionPosition === 1 ? '→ 첫 번째 대지: 본문의 기본적 의미와 맥락을 제시하는 토대 작업' : sectionPosition === 2 ? '→ 두 번째 대지: 첫 번째 대지의 진리를 심화하고 확장하는 신학적 전개' : sectionPosition === 3 ? '→ 세 번째 대지: 신학적 진리를 회중의 삶으로 연결하는 전환적 대지' : '→ 네 번째 대지: 그리스도 중심으로 모든 것을 수렴하는 복음의 완결성'}\n\n## 이전 섹션 내용 (이전 흐름을 이어갈 것)\n${previousContent || '(이전 섹션 내용 없음)'}\n\n## 이후 이어질 섹션들 (다음 섹션으로 자연스럽게 전환할 것)\n${nextSections || '결론 → 적용'}\n\n## 준비 단계 데이터 (본론 문장 속에 자연스럽게 녹여 사용하십시오)\n### 핵심 원어\n${(greekWords || []).map((gw: any) => `- ${gw.greek} (${gw.word}): ${gw.meaning}${gw.note ? ` — ${gw.note}` : ''}`).join('\n') || '(분석된 원어 없음)'}\n### 통찰 요약\n${(prepInsights || []).join('\n') || '(통찰 없음)'}\n\n위 정보를 바탕으로 해당 대지의 설교 원고를 작성해주세요. 반드시 구절 인용, 원어 통찰, 신학적 깊이, 회중 연결, 다음 섹션으로의 전환 문장을 포함해야 합니다. 제공된 핵심 원어(greekWords)와 통찰(prepInsights)을 원고에 자연스럽게 녹여 사용하십시오.` + formatPassageLabels(data)
      maxTokens = 3000
      temperature = 0.7
    } else if (type === 'manuscript-application-reconstruct') {
      const { coreMessage, outlines, applicationPoints, congregationProfile, existingContent, previousContent, greekWords, prepInsights } = data
      userText = `설교 적용 문장을 재구성해주세요:\n\n## 중심명제\n${coreMessage || ''}\n\n## 대지 구조\n${(outlines || []).map((o: any, i: number) => `[대지 ${i + 1}] ${o.title}: ${o.description}`).join('\n')}\n\n## 준비 단계에서 정리한 적용 포인트 (반드시 모두 포함)\n${(applicationPoints || []).map((a: any, i: number) => `${i + 1}. [${a.audienceTag || '전체'}] ${a.point}${a.pastoralNote ? ` (목회적 메모: ${a.pastoralNote})` : ''}`).join('\n')}\n\n## 회중 프로필\n연령대: ${(congregationProfile?.dominantAgeGroups || []).join(', ')}\n신앙 성숙도: ${congregationProfile?.faithMaturity || ''}\n교회 상황: ${congregationProfile?.churchContext || ''}\n목회적 우선순위: ${congregationProfile?.pastoralPriorities || ''}\n시즌 특이사항: ${congregationProfile?.seasonNote || ''}\n\n## 결론에서 작성된 내용 (적용이 이 흐름에서 자연스럽게 이어질 것)\n${previousContent || '(아직 결론이 작성되지 않음)'}\n\n## 기존 적용 원고 (연속성 유지 참고)\n${existingContent || '(기존 내용 없음)'}\n\n## 준비 단계 데이터 (적용 문장에 자연스럽게 녹여 사용하십시오)\n### 핵심 원어\n${(greekWords || []).map((gw: any) => `- ${gw.greek} (${gw.word}): ${gw.meaning}`).join('\n') || '(분석된 원어 없음)'}\n### 통찰 요약\n${(prepInsights || []).join('\n') || '(통찰 없음)'}\n\n위 적용 포인트들을 하나의 완성된 설교 적용 문장으로 재구성해주세요. 설교자가 준비 단계에서 작성한 적용 포인트를 반드시 모두 포함하고, 새로운 적용을 추가하거나 기존 포인트를 삭제하지 마십시오. 결론의 흐름에서 자연스럽게 이어지도록 하십시오. 준비 단계의 핵심 원어와 통찰을 적용 문장 속에 자연스럽게 녹여내십시오.` + formatPassageLabels(data)
      maxTokens = 3000
      temperature = 0.7
    } else if (type === 'illustration') {
      const { sectionContent, sectionType, sectionLabel, coreMessage, passage, theme } = data
      userText = `설교 섹션 내용을 분석해 관련 예화 3가지를 추천해주세요:\n\n## 섹션\n${sectionLabel || ''} (${sectionType || ''})\n\n## 섹션 내용\n${sectionContent?.slice(0, 500) || '(아직 작성 전)'}\n\n## 중심명제\n${coreMessage || ''}\n\n## 본문\n${passage || ''}\n\n## 주제\n${theme || ''}\n\n위 내용을 바탕으로 이 섹션에 어울리는 예화 3가지를 생성해주세요.` + formatPassageLabels(data)
      maxTokens = 2000
      temperature = 0.7
    } else if (type === 'reference') {
      const { sectionContent, sectionType, sectionLabel, coreMessage, passage, theme } = data
      userText = `설교 섹션 내용을 분석해 관련 참고 메모 2-3가지를 추천해주세요:\n\n## 섹션\n${sectionLabel || ''} (${sectionType || ''})\n\n## 섹션 내용\n${sectionContent?.slice(0, 500) || '(아직 작성 전)'}\n\n## 중심명제\n${coreMessage || ''}\n\n## 본문\n${passage || ''}\n\n## 주제\n${theme || ''}\n\n위 내용을 바탕으로 이 섹션에 깊이와 통찰을 더할 참고 메모 2-3가지를 생성해주세요.` + formatPassageLabels(data)
      maxTokens = 1500
      temperature = 0.5
    } else if (type === 'study-to-prep') {
      const { passage, themes, commentaries, words, contextInfo, memoText } = data
      userText = `연구 결과를 설교 준비 자료로 변환해주세요:\n\n## 본문\n${passage || ''}\n\n## 문맥 정보\n앞 문맥: ${contextInfo?.before || ''}\n뒤 문맥: ${contextInfo?.after || ''}\n책 구조: ${contextInfo?.bookStructure || ''}\n\n## 주제\n${(themes || []).map((t: any) => `- ${t.name}: ${t.description}`).join('\n')}\n\n## 주석 통찰\n${(commentaries || []).slice(0, 6).map((c: any) => `- ${c.author}: ${c.text}`).join('\n')}\n\n## 원어 연구\n${Object.values(words || {}).slice(0, 5).map((w: any) => `- ${w.lemmaGreek || w.word}: ${w.basicMeaning}`).join('\n')}\n\n## 연구 메모\n${memoText || '(없음)'}\n\n위 연구 결과를 바탕으로 설교 준비 자료 전체를 생성해주세요.` + formatPassageLabels(data)
      model = 'gpt-5.4-mini'
      maxTokens = 4000
      temperature = 0.5
    } else if (type === 'manuscript-diagnosis') {
      const { sections, coreMessage, passage, referenceNotes, illustrationNotes } = data
      const fullText = sections.map((s: any) => `[${s.label}]\n${s.content}`).join('\n\n')
      userText = `다음 설교 원고를 진단해주세요:\n\n## 본문\n${passage || ''}\n\n## 중심명제\n${coreMessage || ''}\n\n## 원고 전문\n${fullText}\n\n## 참고 메모\n${(referenceNotes || []).map((n: any) => `- ${n.title}: ${n.content}`).join('\n')}\n\n## 예화 메모\n${(illustrationNotes || []).map((n: any) => `- ${n.title}: ${n.content}`).join('\n')}\n\n위 내용을 바탕으로 설교의 완성도를 진단하고 구체적인 피드백을 제공해주세요.` + formatPassageLabels(data)
      model = 'gpt-5.4-mini'
      maxTokens = 1500
      temperature = 0.3
    } else if (type === 'reference-weave') {
      const { sectionContent, referenceContent, referenceAuthor, referenceBook } = data
      userText = `현재 섹션 내용:\n${sectionContent || ''}\n\n참고 자료:\n내용: ${referenceContent || ''}\n저자: ${referenceAuthor || ''}\n출처: ${referenceBook || ''}\n\n위 참고 자료를 현재 섹션의 흐름에 자연스럽게 녹여낸 문장이나 단락을 작성해주세요. 설교자의 구어체 톤을 유지하고, 회중이 이해하기 쉽게 설명하십시오.` + formatPassageLabels(data)
      model = 'gpt-5.4-mini'
      maxTokens = 500
      temperature = 0.7
    } else if (type === 'commentary-to-section') {
      const { author, text, source, type: commType } = data
      userText = `Create a sermon body section from this commentary:\n\nAuthor: ${author || ''}\nCommentary: ${text || ''}\nSource: ${source || ''}\n\nGenerate a compelling sermon section that naturally incorporates this commentary.` + formatPassageLabels(data)
      model = 'gpt-5.4-mini'
      maxTokens = 1000
      temperature = 0.7
    } else if (type === 'suggest-titles') {
      const { passage, book, chapter, verseStart, verseEnd } = data
      userText = `성경 본문: ${book || ''} ${chapter || ''}장${verseStart ? ` ${verseStart}절` : ''}${verseEnd ? `-${verseEnd}절` : ''}\n본문 구절: ${passage || ''}` + formatPassageLabels(data)
      model = 'gpt-4o-mini'
      maxTokens = 1000
    } else {
      const s = data.sermon
      userText = `설교 제목: ${s?.title || ''}\n본문: ${s?.passage || ''}\n핵심 메시지: ${s?.coreMessage || ''}\n도입: ${s?.introduction || ''}\n대지: ${(s?.outlineTitles || []).join(', ')}\n결론: ${s?.conclusion || ''}\n설교자: ${s?.preacher || ''}\n회중: ${(s?.audience || []).join(', ')}\n주제: ${(s?.themeNames || []).join(', ')}` + formatPassageLabels(data)
    }

    const respFormat = (type === 'suggest-titles' || type === 'outline' || type === 'application' || type === 'application-direction' || type === 'application-generate' || type === 'core-message' || type === 'delivery' || type === 'illustration' || type === 'reference' || type === 'study-to-prep' || type === 'manuscript-diagnosis' || type === 'commentary-to-section' || type === 'greek-words-analyze') ? { type: 'json_object' as const } : undefined

    const callOpenAI = async (m: string, u: string) => {
      const params: any = {
        model: m,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: u },
        ],
        temperature,
        response_format: respFormat,
      }
      params[m === 'gpt-5.4-mini' ? 'max_completion_tokens' : 'max_tokens'] = maxTokens
      return getOpenai().chat.completions.create(params)
    }

    let res = await callOpenAI(model, userText)
    let choice = res.choices[0]

    // content_filter 발생 시 gpt-5.4-mini로 재시도
    if (choice?.finish_reason === 'content_filter') {
      console.log(`[RETRY] ${type} content_filter → retrying with gpt-5.4-mini`)
      res = await callOpenAI('gpt-5.4-mini', userText)
      choice = res.choices[0]
    }

    // 디버그: truncation 원인 파악
    if (choice?.finish_reason !== 'stop') {
      console.log(`[DEBUG] ${type} finish_reason: ${choice?.finish_reason}, completion_tokens: ${res.usage?.completion_tokens}, output_length: ${choice?.message?.content?.length}`)
    }

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

    let output = choice?.message?.content || ''
    // Extract JSON robustly — handle both {} objects and [] arrays
    const isArrayType = type === 'illustration' || type === 'reference'
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

    if ((type === 'bible-study' || type === 'suggest-titles' || type === 'outline' || type === 'application' || type === 'application-direction' || type === 'application-generate' || type === 'core-message' || type === 'delivery' || type === 'illustration' || type === 'reference' || type === 'study-to-prep' || type === 'manuscript-diagnosis' || type === 'greek-words-analyze') && output) {
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
