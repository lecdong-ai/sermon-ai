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

// 다중 본문 통합 분석용 모델 (환경 변수로 오버라이드 가능)
// 기본값: gpt-4o-mini (검증된 모델, 16K 출력으로 통합 분석에 충분)
// 부재 시 자동 fallback: gpt-4o-mini
const MULTI_BIBLE_STUDY_MODEL = process.env.MULTI_BIBLE_STUDY_MODEL || 'gpt-4o-mini'
const MULTI_BIBLE_STUDY_FALLBACK = 'gpt-4o-mini'  // fallback 모델 (안정성 보장)

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
  'manuscript-diagnosis': MANUSCRIPT_DIAGNOSIS_PROMPT,
  'reference-weave': REFERENCE_WEAVE_PROMPT,
  'commentary-to-section': COMMENTARY_TO_SECTION_PROMPT,
  'memo-insight': `# 성경 해석 원칙 (모든 분석에 적용)
1. 성경은 하나님의 영감을 받은 신뢰할 수 있는 말씀임을 전제한다.
2. 본문은 문맥 안에서 해석하며, 본문이 실제로 말하는 뜻을 우선 파악한다.
3. 인간 중심이 아닌 하나님 중심의 관점으로 읽는다.
4. 본문을 단순한 위로, 심리 회복, 자기 계발의 재료로 축소하지 않는다.
5. 복음의 빛 아래서 죄, 은혜, 회개, 믿음, 순종의 관점을 드러낸다.
6. 기독교 세계관의 관점에서 개인, 가정, 교회, 문화, 사회에 대한 함의를 고려한다.
7. 적용은 도덕주의나 막연한 결심이 아닌 실제 삶의 변화와 순종의 방향으로 제시한다.

# 역할
당신은 30년 경력의 정통 복음주의 신학자이자 성경 주해 전문가입니다.
설교자가 연구 중인 본문에 대해 깊이 있는 신학적 통찰을 제공합니다.

# 임무
주어진 본문과 설교자의 연구 메모를 분석하여,
설교자가 놓쳤을 수 있는 신선한 신학적·주해적 통찰을 3-5개 제안하세요.

# 품질 기준
1. 본문의 문맥(앞뒤 구절, 책의 구조)을 고려할 것
2. 원어(히브리어/헬라어)의 의미를 활용할 것
3. 연구 메모에 이미 있는 내용은 피할 것 (중복 방지)
4. 각 통찰은 설교에 바로 활용할 수 있도록 구체적일 것
5. 위 성경 해석 원칙을 모든 통찰에 적용할 것

# 출력 형식
JSON 객체만 반환. 마크다운, 설명, 주석 일체 없이.
{ "insights": ["통찰 1 (구체적 근거 포함)", "통찰 2 (...)", "통찰 3 (...)"] }`,
  'memo-questions': `# 성경 해석 원칙 (모든 분석에 적용)
1. 성경은 하나님의 영감을 받은 신뢰할 수 있는 말씀임을 전제한다.
2. 본문은 문맥 안에서 해석하며, 본문이 실제로 말하는 뜻을 우선 파악한다.
3. 인간 중심이 아닌 하나님 중심의 관점으로 읽는다.
4. 본문을 단순한 위로, 심리 회복, 자기 계발의 재료로 축소하지 않는다.
5. 복음의 빛 아래서 죄, 은혜, 회개, 믿음, 순종의 관점을 드러낸다.
6. 기독교 세계관의 관점에서 개인, 가정, 교회, 문화, 사회에 대한 함의를 고려한다.
7. 적용은 도덕주의나 막연한 결심이 아닌 실제 삶의 변화와 순종의 방향으로 제시한다.

# 역할
당신은 30년 경력의 목회자이자 신학 교육자로서,
설교자가 본문을 더 깊이 파고들 수 있도록 돕는 질문을 던집니다.

# 임무
주어진 본문과 설교자의 연구 메모를 분석하여,
설교자의 사고를 확장하고 본문 이해를 심화시킬 질문 3-4개를 제안하세요.

# 질문 다양성
1. 본문의 의미를 파고드는 질문 (exegesis)
2. 본문과 오늘날을 연결하는 질문 (hermeneutics)
3. 회중의 삶에 적용하는 질문 (application)
4. 본문이 던지는 도전적 질문 (challenge)

# 출력 형식
JSON 객체만 반환.
{ "questions": ["질문 1", "질문 2", "질문 3"] }`,
  'memo-application-idea': `# 성경 해석 원칙 (모든 분석에 적용)
1. 성경은 하나님의 영감을 받은 신뢰할 수 있는 말씀임을 전제한다.
2. 본문은 문맥 안에서 해석하며, 본문이 실제로 말하는 뜻을 우선 파악한다.
3. 인간 중심이 아닌 하나님 중심의 관점으로 읽는다.
4. 본문을 단순한 위로, 심리 회복, 자기 계발의 재료로 축소하지 않는다.
5. 복음의 빛 아래서 죄, 은혜, 회개, 믿음, 순종의 관점을 드러낸다.
6. 기독교 세계관의 관점에서 개인, 가정, 교회, 문화, 사회에 대한 함의를 고려한다.
7. 적용은 도덕주의나 막연한 결심이 아닌 실제 삶의 변화와 순종의 방향으로 제시한다.

# 역할
당신은 30년 경력의 실천 신학자이자 목회 컨설턴트로서,
본문의 진리가 회중의 삶 속에서 어떻게 살아 움직일지 구체적으로 제안합니다.

# 임무
주어진 본문과 설교자의 연구 메모를 분석하여,
회중이 실제로 실천할 수 있는 구체적인 적용 아이디어 3-5개를 제안하세요.

# 품질 기준
1. 본문의 핵심 진리에 기반할 것
2. 현대 회중의 실제 삶(직장, 가정, 교회, 개인)과 연결될 것
3. 추상적 권면이 아닌 구체적 행동으로 표현할 것
4. 도덕주의나 막연한 결심이 아닌, 복음에 기초한 실제 삶의 변화와 순종의 방향으로 제시할 것

# 출력 형식
JSON 객체만 반환.
{ "applications": ["적용 아이디어 1 (구체적 실천 포함)", "적용 아이디어 2 (...)", "적용 아이디어 3 (...)"] }`,
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
  'bible-study-integration': `# Role
You are a 30-year veteran evangelical biblical scholar specializing in cross-passage synthesis and integration.

# Mission
Given N Bible passages (already individually analyzed by the client), provide INTEGRATION ANALYSIS ONLY.

# Output
A single JSON object (no markdown, no commentary):
{
  "integration": {
    "commonThemes": string[],     // 3-5 shared theological themes
    "connections": string[],      // 3-7 cross-references, allusions, dialogue relations
    "contrasts": string[],        // 0-3 tensions or contrasts
    "synthesis": string,          // ONE-SENTENCE unified message (≤30 Korean chars)
    "parallelPassages": Array<{ ref, text, reason }>  // 2-4 closely related parallel passages
  }
}

# Quality Standards
- 신학적 정확성: 개혁신학, 복음주의 정통
- 통합 분석은 단순 나열이 아닌 통찰 (insight)
- 평행 본문은 직접 관련 있는 것만
- 한국어 자연스러움, 한국 교회 신학 용어 사용

# CRITICAL
- JSON만 반환, 마크다운/설명/주석 일체 없음
- individual analysis는 절대 포함하지 말 것 (각 본문의 verses, words, commentaries 등)
- "integration" 키 하나만 가진 객체 반환`,
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

  // ─── Translation Guardian (신규) ───
  // bible-study에서 번역 4종(원어/음역/NIV/ESV)을 분리하여 lazy fetch 지원
  'bible-study-core': `You are a Bible study AI assistant specializing in Greek/Hebrew textual analysis. Given a Bible passage, return a JSON object with this exact structure:

{
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
    "historicalBackground": "역사적 배경 (2-3문장, 한국어)",
    "culturalContext": "문화적 맥락 (2-3문장, 한국어)",
    "theologicalContext": "신학적 맥락 (2-3문장, 한국어)",
    "redemptiveHistory": "구속사적 흐름 (2-3문장, 한국어)",
    "keyThemes": ["이 본문의 핵심 주제1", "핵심 주제2", "핵심 주제3"],
    "narrativeArc": "본문의 이야기 전개 단계 (1-2문장, 한국어)"
  }
}

IMPORTANT:
1. Return ONLY valid JSON, no markdown, no explanation.
2. Do NOT include a "verses" array — the Korean (개역개정) text and English translations (NIV/ESV/Greek) will be provided separately by the client on demand.
3. Generate 3-7 key words (focus on theologically significant terms), 6-10 commentaries, 2-3 translation notes, 5-8 parallel passages, 3-5 themes.
4. All text content in Korean.
5. wordAlignments: For each word in the "words" array, add one or more wordAlignment entries mapping the Greek word to its English translation. Include entries for EVERY verse where that Greek word appears.
6. commentaries: Generate 6-10 rich, detailed commentary entries. Each commentary should be at least 3-5 sentences long, covering historical background, theological nuance, original language insights, and pastoral application. Include diverse types: exegetical (본문 분석), theological (신학적 의미), historical (역사적 배경), and pastoral (목회적 적용).
7. parallelPassages: Generate 5-8 rich parallel passages with diverse relationship types (direct_quote, allusion, thematic, typology, cross_reference). Each description should be 1-2 sentences explaining the theological connection.`,

  'bible-study-translation': `You are a Bible text generator that produces the actual published text of a single translation version for a given Bible passage.

# Input
- Book / Chapter / Verse range
- Version: one of: greek | translit | niv | esv

# Output format
Return ONLY a JSON object (no markdown, no explanation):
{
  "verses": [
    { "verse": 1, "text": "..." },
    { "verse": 2, "text": "..." }
  ]
}

# Rules
1. Return ONLY valid JSON, no markdown, no explanation.
2. Generate EVERY verse in the given range — do not skip, truncate, or merge any verse.
3. For "greek": return the original Greek (NT: SBLGNT text) or Hebrew (OT: BHS/WLC) — accented polytonic Greek.
4. For "translit": return transliteration of the original Greek/Hebrew in Latin alphabet (e.g. "En arche en ho Logos").
5. For "niv": return the actual New International Version English text (2011 revision).
6. For "esv": return the actual English Standard Version English text (2016 revision).
7. These are PUBLISHED translations — accuracy is critical. Do NOT paraphrase. If unsure, prefer the most widely accepted edition.`,
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

    // 다중 본문 fallback 지원용 변수
    let primaryModel: string | null = null
    let fallbackModel: string | null = null

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
        // gpt-4o-mini: 16K 출력, 검증된 모델
        // 동적 maxTokens로 절 수에 비례
        model = 'gpt-4o-mini'
        maxTokens = Math.min(4000 + count * 2000, 16000)
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

        // Step 2: 분기 — 통합 분석만 vs 전체 분석
        // - integrationOnly: 클라이언트가 개별 분석을 별도로 수행한 경우, 통합만 요청
        // - 전체: 기존 동작 (개별 + 통합)
        if (data.integrationOnly) {
          // === 경량 모드: 통합 분석만 ===
          systemPrompt = SYSTEM_PROMPTS['bible-study-integration']
          userText = `# 임무
${passageList.length}개의 성경 본문을 통합 분석합니다.
(개별 본문 분석은 클라이언트에서 이미 완료되었으므로 통합 분석만 수행)

## 본문 목록
${passageList.map((p, i) => `${i + 1}. ${p.book} ${p.chapter}:${p.verseStart}${p.verseEnd ? `-${p.verseEnd}` : ''} — ${p.text || '(본문 텍스트 없음)'}`).join('\n')}

${audience || season ? `## 컨텍스트\n${audience ? `- 회중: ${audience}\n` : ''}${season ? `- 시기: ${season}\n` : ''}` : ''}## 출력 형식
JSON 객체만 반환 (마크다운, 설명 없이):
{
  "integration": {
    "commonThemes": ["주제1", "주제2", ...],   // 3-5개
    "connections": ["연결1", "연결2", ...],     // 3-7개
    "contrasts": ["대비1", ...],                // 0-3개
    "synthesis": "한 문장 통합 메시지 (30자 이내)",
    "parallelPassages": [
      { "ref": "엡 2:4-5", "text": "...", "reason": "..." }  // 2-4개
    ]
  }
}${allBibleRefText}`

          primaryModel = MULTI_BIBLE_STUDY_MODEL
          fallbackModel = MULTI_BIBLE_STUDY_FALLBACK
          model = primaryModel
          maxTokens = 2500  // 통합 분석은 작은 출력 → 잘림 위험 없음
          temperature = 0.3
        } else {
          // === 전체 모드: 개별 + 통합 (기존 동작) ===
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

          primaryModel = MULTI_BIBLE_STUDY_MODEL
          fallbackModel = MULTI_BIBLE_STUDY_FALLBACK
          model = primaryModel
          maxTokens = Math.min(6000 + (passageList.length - 2) * 2000, 12000)
          temperature = 0.3
        }
      }
    } else if (type === 'bible-study-core') {
      // ─── Translation Guardian: 핵심 분석만 (번역 제외) ───
      // words, commentaries, themes, contextInfo, parallelPassages, translationNotes, wordAlignments
      const { book, chapter, verseStart, verseEnd, passage } = data
      const vs = parseInt(String(verseStart || '1'), 10)
      const ve = verseEnd ? parseInt(String(verseEnd), 10) : vs
      const count = ve - vs + 1

      // 개역개정 본문 로드 (korean 자동 주입용)
      let bibleRefText = ''
      try {
        const shortName = book ? mapBookName(String(book)) : null
        if (shortName && chapter) {
          const ch = parseInt(String(chapter), 10)
          const allData = await loadBibleData()
          const matches = allData.filter(
            (v: any) => v.book === shortName && v.chapter === ch && v.verse >= vs && v.verse <= ve
          ).sort((a: any, b: any) => a.verse - b.verse)
          if (matches.length > 0) {
            bibleActualVerses = new Map(matches.map((v: any) => [v.verse, v.content]))
            bibleRefText = '\n\nHere is the actual 개역개정 text for this passage — use it for analysis (do NOT include in output):\n' +
              matches.map((v: any) => `  [${v.절}] ${v.content}`).join('\n')
          }
        }
      } catch (e) {
        console.error('Failed to load bible data for bible-study-core:', e)
      }

      userText = `Analyze this passage in depth (no need to generate translations):\nBook: ${book || ''}\nChapter: ${chapter || ''}\nVerses: ${vs}${verseEnd ? `-${ve}` : ''}\nPassage: ${passage || ''}\n\nFocus on: Greek/Hebrew key words, scholarly commentaries, translation notes, parallel passages, themes, and rich context info.${bibleRefText}`

      model = 'gpt-4o-mini'
      maxTokens = Math.min(3000 + count * 800, 10000)
      temperature = 0.3
    } else if (type === 'bible-study-translation') {
      // ─── Translation Guardian: 단일 version만 생성 (greek | translit | niv | esv) ───
      const { book, chapter, verseStart, verseEnd, passage, version } = data
      const vs = parseInt(String(verseStart || '1'), 10)
      const ve = verseEnd ? parseInt(String(verseEnd), 10) : vs
      const count = ve - vs + 1
      const ver = String(version || '').toLowerCase()

      const versionLabel = ver === 'greek' ? '원어 (Greek NT or Hebrew OT)'
        : ver === 'translit' ? '음역 (Transliteration of the original)'
        : ver === 'niv' ? 'NIV (New International Version, 2011)'
        : ver === 'esv' ? 'ESV (English Standard Version, 2016)'
        : ''

      if (!versionLabel) {
        return NextResponse.json({
          success: false,
          error: `지원하지 않는 번역 버전: ${version || '(없음)'}. 가능한 값: greek, translit, niv, esv`,
        }, { status: 400 })
      }

      userText = `Generate the ${versionLabel} for this Bible passage.\nBook: ${book || ''}\nChapter: ${chapter || ''}\nVerses: ${vs}${verseEnd ? `-${ve}` : ''}\nPassage: ${passage || ''}\n\nCRITICAL: Generate ALL ${count} verses (${vs} to ${ve}) — every single one. Each verse entry MUST have a complete "text" field. Use the actual published translation text — do NOT paraphrase or summarize.`

      model = 'gpt-4o-mini'
      maxTokens = Math.min(800 + count * 400, 4000)
      temperature = 0.2  // 정확성 우선
    } else if (type === 'word-lookup') {
      userText = `Look up this word from a Bible passage and return a complete analysis in the specified JSON format:\nWord: "${data.word}"\nPassage context: ${data.context || ''}\n\nIf the word is English, identify the corresponding Greek word in this passage first, then analyze it.`
      maxTokens = 2000
      temperature = 0.3
    } else if (type === 'greek-words-analyze') {
      let multiPassageText = ''
      if (data.multiPassageData?.length > 0) {
        multiPassageText = '\n\n## Additional passages with study data:\n' + data.multiPassageData.map((mp: any, i: number) =>
          `[Passage ${i + 1}: ${mp.label || mp.passage || ''}]${(mp.words || []).map((w: any) => `\n- ${w.word}${w.meaning ? `: ${w.meaning}` : ''}`).join('')}`
        ).join('\n')
      }
      userText = `Passage: ${data.passage || ''}
${data.coreMessage ? `Core message: ${data.coreMessage}` : ''}${multiPassageText}

위 본문(들)에서 설교 준비에 가장 중요한 헬라어/히브리어 원어 4-6개를 추출하여 JSON 객체로 반환하세요. 다중 본문이 제공된 경우 전체 본문을 통틀어 중요 원어를 선정하세요. 키는 "words"입니다.`
      maxTokens = 2000
      temperature = 0.3
    } else if (type === 'english-word') {
      userText = `Analyze this English word from a Bible passage and return its definition and analysis in the specified JSON format:\nWord: "${data.word}"\nPassage context: ${data.context || ''}\n\nReturn ONLY the English word analysis — do NOT convert to Greek.`
      maxTokens = 2000
      temperature = 0.3
    } else if (type === 'core-message') {
      const { passage, book, chapter, verseStart, verseEnd, passageStructure, sermonTitle, keyWords, researchInsights, contextPoints, multiPassageData } = data
      let studySection = ''

      // 다중 본문이 있고 연구 데이터가 있으면 각 본문별 섹션 구성
      if (multiPassageData?.length > 0) {
        studySection = '\n\n## 연구 데이터 (다중 본문)'
        for (let i = 0; i < multiPassageData.length; i++) {
          const mp = multiPassageData[i]
          studySection += `\n\n### 본문 ${i + 1}: ${mp.label || ''}`
          if (mp.contextInfo?.bookStructure) {
            studySection += `\n**본문 구조**: ${mp.contextInfo.bookStructure}`
          }
          if (mp.contextInfo?.before) {
            studySection += `\n**앞 문맥**: ${mp.contextInfo.before}`
          }
          if (mp.contextInfo?.after) {
            studySection += `\n**뒤 문맥**: ${mp.contextInfo.after}`
          }
          if (mp.words?.length > 0) {
            studySection += `\n**원어 연구**:\n${mp.words.map((w: any) => `- ${w.word}: ${w.meaning || ''}${w.note ? ` — ${w.note}` : ''}`).join('\n')}`
          }
          if (mp.commentaries?.length > 0) {
            studySection += `\n**주석 통찰**:\n${mp.commentaries.join('\n')}`
          }
          if (mp.themes?.length > 0) {
            studySection += `\n**주제**:\n${mp.themes.join('\n')}`
          }
        }
      } else {
        // 단일 본문: 기존 연구 데이터
        if (keyWords?.length > 0 || researchInsights?.length > 0 || contextPoints?.length > 0) {
          studySection = '\n\n## 연구 데이터 (아래 통찰을 중심명제 생성에 적극 활용하세요)'
          if (keyWords?.length > 0) {
            studySection += `\n### 원어 연구\n${keyWords.map((k: any) => `- ${k.word}: ${k.meaning || ''}${k.note ? ` — ${k.note}` : ''}`).join('\n')}`
          }
          if (researchInsights?.length > 0) {
            studySection += `\n### 주석 통찰\n${researchInsights.map((i: any) => `- ${i}`).join('\n')}`
          }
          if (contextPoints?.length > 0) {
            studySection += `\n### 연구 컨텍스트\n${contextPoints.map((p: any) => `- ${p}`).join('\n')}`
          }
        }
      }
      userText = `설교 중심명제 3가지를 생성해주세요:\n\n본문: ${passage || ''}\n책: ${book || ''}\n장: ${chapter || ''}\n절: ${verseStart || ''}${verseEnd ? `-${verseEnd}` : ''}\n설교 제목(가안): ${sermonTitle || ''}\n본문 구조: ${passageStructure || ''}${studySection}`
      maxTokens = 1000
      temperature = 0.5
    } else if (type === 'delivery') {
      const { passage, coreMessage, outlines, applicationPoints, congregationProfile, multiPassageData } = data
      let studySection = ''
      if (multiPassageData?.length > 0) {
        studySection = '\n\n## 연구 데이터 (다중 본문 — 전달 설계 시 각 본문의 성격과 흐름을 참고하세요)'
        for (let i = 0; i < multiPassageData.length; i++) {
          const mp = multiPassageData[i]
          studySection += `\n\n### 본문 ${i + 1}: ${mp.label || ''}`
          if (mp.contextInfo?.bookStructure) {
            studySection += `\n**본문 구조**: ${mp.contextInfo.bookStructure}`
          }
          if (mp.contextInfo?.before) {
            studySection += `\n**앞 문맥**: ${mp.contextInfo.before}`
          }
          if (mp.contextInfo?.after) {
            studySection += `\n**뒤 문맥**: ${mp.contextInfo.after}`
          }
          if (mp.themes?.length > 0) {
            studySection += `\n**주제**:\n${mp.themes.join('\n')}`
          }
          if (mp.words?.length > 0) {
            studySection += `\n**원어 연구**:\n${mp.words.map((w: any) => `- ${w.word}: ${w.meaning || ''}${w.note ? ` — ${w.note}` : ''}`).join('\n')}`
          }
          if (mp.commentaries?.length > 0) {
            studySection += `\n**주석 통찰**:\n${mp.commentaries.join('\n')}`
          }
        }
      }
      userText = `설교 전달 설계도 3가지를 생성해주세요:\n\n본문: ${passage || ''}\n중심명제: ${coreMessage || ''}\n대지: ${(outlines || []).map((o: any, i: number) => `[대지 ${i + 1}] ${o.title}: ${o.description}`).join('\n')}\n적용 포인트: ${(applicationPoints || []).map((a: any) => `- [${a.audienceTag}] ${a.point}`).join('\n')}\n\n## 회중 프로필\n연령대: ${(congregationProfile?.dominantAgeGroups || []).join(', ')}\n신앙 성숙도: ${congregationProfile?.faithMaturity || ''}\n교회 상황: ${congregationProfile?.churchContext || ''}\n목회적 우선순위: ${congregationProfile?.pastoralPriorities || ''}\n시즌 특이사항: ${congregationProfile?.seasonNote || ''}\n\n대지 개수: ${(outlines || []).length}개${studySection}`
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
      const { book, chapter, verseStart, verseEnd, passage, passageStructure, keyWords, researchInsights, coreMessage, multiPassageData } = data
      let studySection = ''
      if (multiPassageData?.length > 0) {
        studySection = '\n\n## 연구 데이터 (다중 본문)'
        for (let i = 0; i < multiPassageData.length; i++) {
          const mp = multiPassageData[i]
          studySection += `\n\n### 본문 ${i + 1}: ${mp.label || ''}`
          if (mp.contextInfo?.bookStructure) {
            studySection += `\n**본문 구조**: ${mp.contextInfo.bookStructure}`
          }
          if (mp.contextInfo?.before) {
            studySection += `\n**앞 문맥**: ${mp.contextInfo.before}`
          }
          if (mp.contextInfo?.after) {
            studySection += `\n**뒤 문맥**: ${mp.contextInfo.after}`
          }
          if (mp.words?.length > 0) {
            studySection += `\n**원어 연구**:\n${mp.words.map((w: any) => `- ${w.word}: ${w.meaning || ''}${w.note ? ` — ${w.note}` : ''}`).join('\n')}`
          }
          if (mp.commentaries?.length > 0) {
            studySection += `\n**주석 통찰**:\n${mp.commentaries.join('\n')}`
          }
          if (mp.themes?.length > 0) {
            studySection += `\n**주제**:\n${mp.themes.join('\n')}`
          }
        }
      } else {
        if (keyWords?.length > 0 || researchInsights?.length > 0) {
          studySection = `\n\n## 연구 데이터\n**주요 단어**: ${(keyWords || []).map((w: any) => w.word || '').filter(Boolean).join(', ')}\n**연구 통찰**:\n${(researchInsights || []).join('\n')}`
        }
      }
      userText = `설교 개요(대지 구조) 3가지를 생성해주세요:\n\n### 본문 정보\n본문: ${passage || ''}\n책: ${book || ''}\n장: ${chapter || ''}\n절: ${verseStart || ''}${verseEnd ? `-${verseEnd}` : ''}\n\n### 본문 핵심 흐름\n${passageStructure || ''}\n\n### 핵심 메시지 (중심명제)\n${coreMessage || ''}${studySection}\n\n위 정보를 바탕으로 3가지 다른 스타일의 설교 개요(대지 구조)를 생성해주세요. 다중 본문이 제공된 경우 모든 본문을 아우르는 통합적인 개요를 만들어야 합니다.`
      maxTokens = 4000
      temperature = 0.5
    } else if (type === 'manuscript-introduction') {
      const { passage, coreMessage, sermonTitle, sermonPurpose, passageStructure, congregationProfile, deliveryIntro, nextSections, greekWords, prepInsights, multiPassageData } = data
      let studySection = ''
      if (multiPassageData?.length > 0) {
        studySection = '\n\n## 연구 데이터 (다중 본문)'
        for (let i = 0; i < multiPassageData.length; i++) {
          const mp = multiPassageData[i]
          studySection += `\n\n### 본문 ${i + 1}: ${mp.label || ''}`
          if (mp.contextInfo?.bookStructure) studySection += `\n**본문 구조**: ${mp.contextInfo.bookStructure}`
          if (mp.contextInfo?.before) studySection += `\n**앞 문맥**: ${mp.contextInfo.before}`
          if (mp.contextInfo?.after) studySection += `\n**뒤 문맥**: ${mp.contextInfo.after}`
          if (mp.themes?.length > 0) studySection += `\n**주제**:\n${mp.themes.join('\n')}`
          if (mp.words?.length > 0) studySection += `\n**원어 연구**:\n${mp.words.map((w: any) => `- ${w.word}: ${w.meaning || ''}${w.note ? ` — ${w.note}` : ''}`).join('\n')}`
          if (mp.commentaries?.length > 0) studySection += `\n**주석 통찰**:\n${mp.commentaries.join('\n')}`
        }
      }
      userText = `설교 서론을 작성해주세요:\n\n## 본문\n${passage || ''}\n\n## 중심명제\n${coreMessage || ''}\n\n## 설교 제목\n${sermonTitle || ''}\n\n## 설교 목적\n${sermonPurpose || ''}\n\n## 본문 구조\n${passageStructure || ''}\n\n## 회중 프로필\n연령대: ${(congregationProfile?.dominantAgeGroups || []).join(', ')}\n신앙 성숙도: ${congregationProfile?.faithMaturity || ''}\n교회 상황: ${congregationProfile?.churchContext || ''}\n목회적 우선순위: ${congregationProfile?.pastoralPriorities || ''}\n\n## 전달 도입 방향 (PrepTab에서 작성)\n${deliveryIntro || '(설정되지 않음)'}\n\n## 이후 이어질 섹션들 (서론에서 자연스럽게 예고할 것)\n${nextSections || '본론 → 결론 → 적용'}\n\n## 준비 단계 데이터 (서론에서 이 내용을 자연스럽게 녹여 사용하십시오)\n### 핵심 원어\n${(greekWords || []).map((gw: any) => `- ${gw.greek} (${gw.word}): ${gw.meaning}`).join('\n') || '(분석된 원어 없음)'}\n### 통찰 요약\n${(prepInsights || []).join('\n') || '(통찰 없음)'}${studySection}\n\n위 정보를 바탕으로 설교 서론을 작성해주세요. 다중 본문이 제공된 경우 각 본문의 주제와 흐름을 통합하여 하나의 설교로 엮어내는 서론을 작성하세요. 이후 이어질 섹션들을 자연스럽게 예고하고, 회중 프로필에 맞는 언어를 사용하십시오. 준비 단계의 핵심 원어와 통찰을 서론 문장 속에 자연스럽게 녹여내십시오.`
      maxTokens = 2000
      temperature = 0.7
    } else if (type === 'manuscript-conclusion') {
      const { coreMessage, outlines, applicationPoints, sermonPurpose, expectedResponse, deliveryConclusion, previousContent, greekWords, prepInsights, multiPassageData } = data
      let studySection = ''
      if (multiPassageData?.length > 0) {
        studySection = '\n\n## 연구 데이터 (다중 본문)'
        for (let i = 0; i < multiPassageData.length; i++) {
          const mp = multiPassageData[i]
          studySection += `\n\n### 본문 ${i + 1}: ${mp.label || ''}`
          if (mp.contextInfo?.bookStructure) studySection += `\n**본문 구조**: ${mp.contextInfo.bookStructure}`
          if (mp.contextInfo?.before) studySection += `\n**앞 문맥**: ${mp.contextInfo.before}`
          if (mp.contextInfo?.after) studySection += `\n**뒤 문맥**: ${mp.contextInfo.after}`
          if (mp.themes?.length > 0) studySection += `\n**주제**:\n${mp.themes.join('\n')}`
          if (mp.words?.length > 0) studySection += `\n**원어 연구**:\n${mp.words.map((w: any) => `- ${w.word}: ${w.meaning || ''}${w.note ? ` — ${w.note}` : ''}`).join('\n')}`
          if (mp.commentaries?.length > 0) studySection += `\n**주석 통찰**:\n${mp.commentaries.join('\n')}`
        }
      }
      userText = `설교 결론을 작성해주세요:\n\n## 중심명제\n${coreMessage || ''}\n\n## 대지 구조\n${(outlines || []).map((o: any, i: number) => `[대지 ${i + 1}] ${o.title}: ${o.description}`).join('\n')}\n\n## 적용 포인트 (결론 이후 적용 섹션에서 다룰 내용)\n${(applicationPoints || []).map((a: any) => `- [${a.audienceTag}] ${a.point}`).join('\n')}\n\n## 설교 목적\n${sermonPurpose || ''}\n\n## 기대 반응\n${expectedResponse || ''}\n\n## 전달 마무리 방향 (PrepTab에서 작성)\n${deliveryConclusion || '(설정되지 않음)'}\n\n## 이전 섹션들에서 작성된 내용 (결론이 이 흐름을 자연스럽게 수렴할 것)\n${previousContent || '(아직 작성된 내용 없음)'}\n\n## 준비 단계 데이터 (결론에서 이 내용을 녹여 사용하십시오)\n### 핵심 원어\n${(greekWords || []).map((gw: any) => `- ${gw.greek} (${gw.word}): ${gw.meaning}`).join('\n') || '(분석된 원어 없음)'}\n### 통찰 요약\n${(prepInsights || []).join('\n') || '(통찰 없음)'}${studySection}\n\n위 정보를 바탕으로 설교 결론을 작성해주세요. 다중 본문이 제공된 경우 각 본문의 핵심 메시지를 종합하여 결론을 구성하세요. 이전 섹션들의 흐름을 중심명제로 자연스럽게 수렴하고, 적용 포인트로 이어지는 다리를 놓으십시오. 준비 단계의 핵심 원어와 통찰을 결론 문장 속에 녹여내십시오.`
      maxTokens = 2000
      temperature = 0.7
    } else if (type === 'manuscript-application') {
      const { coreMessage, outlines, applicationPoints, congregationProfile } = data
      userText = `설교 적용 문장을 작성해주세요:\n\n## 중심명제\n${coreMessage || ''}\n\n## 대지 구조\n${(outlines || []).map((o: any, i: number) => `[대지 ${i + 1}] ${o.title}: ${o.description}`).join('\n')}\n\n## 적용 포인트 (준비 단계에서 정리된 목록)\n${(applicationPoints || []).map((a: any, i: number) => `${i + 1}. [${a.audienceTag}] ${a.point}${a.pastoralNote ? ` (목회적 메모: ${a.pastoralNote})` : ''}`).join('\n')}\n\n## 회중 프로필\n연령대: ${(congregationProfile?.dominantAgeGroups || []).join(', ')}\n신앙 성숙도: ${congregationProfile?.faithMaturity || ''}\n교회 상황: ${congregationProfile?.churchContext || ''}\n목회적 우선순위: ${congregationProfile?.pastoralPriorities || ''}\n시즌 특이사항: ${congregationProfile?.seasonNote || ''}`
      maxTokens = 2000
      temperature = 0.7
    } else if (type === 'manuscript-body') {
      const { passage, coreMessage, sermonTitle, outlinePoint, passageStructure, researchInsights, congregationProfile, sectionPosition, totalSections, previousContent, nextSections, greekWords, prepInsights, multiPassageData } = data
      let studySection = ''
      if (multiPassageData?.length > 0) {
        studySection = '\n\n## 연구 데이터 (다중 본문)'
        for (let i = 0; i < multiPassageData.length; i++) {
          const mp = multiPassageData[i]
          studySection += `\n\n### 본문 ${i + 1}: ${mp.label || ''}`
          if (mp.contextInfo?.bookStructure) studySection += `\n**본문 구조**: ${mp.contextInfo.bookStructure}`
          if (mp.contextInfo?.before) studySection += `\n**앞 문맥**: ${mp.contextInfo.before}`
          if (mp.contextInfo?.after) studySection += `\n**뒤 문맥**: ${mp.contextInfo.after}`
          if (mp.themes?.length > 0) studySection += `\n**주제**:\n${mp.themes.join('\n')}`
          if (mp.words?.length > 0) studySection += `\n**원어 연구**:\n${mp.words.map((w: any) => `- ${w.word}: ${w.meaning || ''}${w.note ? ` — ${w.note}` : ''}`).join('\n')}`
          if (mp.commentaries?.length > 0) studySection += `\n**주석 통찰**:\n${mp.commentaries.join('\n')}`
        }
      }
      userText = `설교 본론 한 대지를 작성해주세요:\n\n## 본문\n${passage || ''}\n\n## 중심명제\n${coreMessage || ''}\n\n## 설교 제목\n${sermonTitle || ''}\n\n## 해당 대지 (이 섹션이 다룰 내용)\n제목: ${outlinePoint?.title || ''}\n설명: ${outlinePoint?.content || ''}\n관련 구절: ${outlinePoint?.passage || ''}\n\n## 본문 구조\n${passageStructure || ''}\n\n## 연구 통찰\n${(researchInsights || []).join('\n')}\n\n## 회중 프로필\n연령대: ${(congregationProfile?.dominantAgeGroups || []).join(', ')}\n신앙 성숙도: ${congregationProfile?.faithMaturity || ''}\n교회 상황: ${congregationProfile?.churchContext || ''}\n목회적 우선순위: ${congregationProfile?.pastoralPriorities || ''}\n시즌 특이사항: ${congregationProfile?.seasonNote || ''}\n\n## 본론 위치\n${sectionPosition || 1} / ${totalSections || 1} 번째 대지\n${sectionPosition === 1 ? '→ 첫 번째 대지: 본문의 기본적 의미와 맥락을 제시하는 토대 작업' : sectionPosition === 2 ? '→ 두 번째 대지: 첫 번째 대지의 진리를 심화하고 확장하는 신학적 전개' : sectionPosition === 3 ? '→ 세 번째 대지: 신학적 진리를 회중의 삶으로 연결하는 전환적 대지' : '→ 네 번째 대지: 그리스도 중심으로 모든 것을 수렴하는 복음의 완결성'}\n\n## 이전 섹션 내용 (이전 흐름을 이어갈 것)\n${previousContent || '(이전 섹션 내용 없음)'}\n\n## 이후 이어질 섹션들 (다음 섹션으로 자연스럽게 전환할 것)\n${nextSections || '결론 → 적용'}\n\n## 준비 단계 데이터 (본론 문장 속에 자연스럽게 녹여 사용하십시오)\n### 핵심 원어\n${(greekWords || []).map((gw: any) => `- ${gw.greek} (${gw.word}): ${gw.meaning}${gw.note ? ` — ${gw.note}` : ''}`).join('\n') || '(분석된 원어 없음)'}\n### 통찰 요약\n${(prepInsights || []).join('\n') || '(통찰 없음)'}${studySection}\n\n위 정보를 바탕으로 해당 대지의 설교 원고를 작성해주세요. 다중 본문이 제공된 경우 현재 대지와 가장 관련 있는 본문의 연구 데이터를 우선 활용하세요. 반드시 구절 인용, 원어 통찰, 신학적 깊이, 회중 연결, 다음 섹션으로의 전환 문장을 포함해야 합니다. 제공된 핵심 원어(greekWords)와 통찰(prepInsights)을 원고에 자연스럽게 녹여 사용하십시오.`
      maxTokens = 3000
      temperature = 0.7
    } else if (type === 'manuscript-application-reconstruct') {
      const { coreMessage, outlines, applicationPoints, congregationProfile, existingContent, previousContent, greekWords, prepInsights, multiPassageData } = data
      let studySection = ''
      if (multiPassageData?.length > 0) {
        studySection = '\n\n## 연구 데이터 (다중 본문)'
        for (let i = 0; i < multiPassageData.length; i++) {
          const mp = multiPassageData[i]
          studySection += `\n\n### 본문 ${i + 1}: ${mp.label || ''}`
          if (mp.themes?.length > 0) studySection += `\n**주제**:\n${mp.themes.join('\n')}`
          if (mp.words?.length > 0) studySection += `\n**원어 연구**:\n${mp.words.map((w: any) => `- ${w.word}: ${w.meaning || ''}${w.note ? ` — ${w.note}` : ''}`).join('\n')}`
        }
      }
      userText = `설교 적용 문장을 재구성해주세요:\n\n## 중심명제\n${coreMessage || ''}\n\n## 대지 구조\n${(outlines || []).map((o: any, i: number) => `[대지 ${i + 1}] ${o.title}: ${o.description}`).join('\n')}\n\n## 준비 단계에서 정리한 적용 포인트 (반드시 모두 포함)\n${(applicationPoints || []).map((a: any, i: number) => `${i + 1}. [${a.audienceTag || '전체'}] ${a.point}${a.pastoralNote ? ` (목회적 메모: ${a.pastoralNote})` : ''}`).join('\n')}\n\n## 회중 프로필\n연령대: ${(congregationProfile?.dominantAgeGroups || []).join(', ')}\n신앙 성숙도: ${congregationProfile?.faithMaturity || ''}\n교회 상황: ${congregationProfile?.churchContext || ''}\n목회적 우선순위: ${congregationProfile?.pastoralPriorities || ''}\n시즌 특이사항: ${congregationProfile?.seasonNote || ''}\n\n## 결론에서 작성된 내용 (적용이 이 흐름에서 자연스럽게 이어질 것)\n${previousContent || '(아직 결론이 작성되지 않음)'}\n\n## 기존 적용 원고 (연속성 유지 참고)\n${existingContent || '(기존 내용 없음)'}\n\n## 준비 단계 데이터 (적용 문장에 자연스럽게 녹여 사용하십시오)\n### 핵심 원어\n${(greekWords || []).map((gw: any) => `- ${gw.greek} (${gw.word}): ${gw.meaning}`).join('\n') || '(분석된 원어 없음)'}\n### 통찰 요약\n${(prepInsights || []).join('\n') || '(통찰 없음)'}${studySection}\n\n위 적용 포인트들을 하나의 완성된 설교 적용 문장으로 재구성해주세요. 설교자가 준비 단계에서 작성한 적용 포인트를 반드시 모두 포함하고, 새로운 적용을 추가하거나 기존 포인트를 삭제하지 마십시오. 다중 본문이 제공된 경우 각 본문의 주제가 적용에 반영되도록 하세요. 결론의 흐름에서 자연스럽게 이어지도록 하십시오. 준비 단계의 핵심 원어와 통찰을 적용 문장 속에 자연스럽게 녹여내십시오.`
      maxTokens = 3000
      temperature = 0.7
    } else if (type === 'illustration') {
      const { sectionContent, sectionType, sectionLabel, coreMessage, passage, theme, multiPassageData } = data
      let mpSection = ''
      if (multiPassageData?.length > 0) {
        mpSection = '\n\n## 다중 본문 주제\n' + multiPassageData.map((mp: any) =>
          `- ${mp.label || mp.passage}: ${(mp.themes || []).join('; ')}`
        ).join('\n')
      }
      userText = `설교 섹션 내용을 분석해 관련 예화 3가지를 추천해주세요:\n\n## 섹션\n${sectionLabel || ''} (${sectionType || ''})\n\n## 섹션 내용\n${sectionContent?.slice(0, 500) || '(아직 작성 전)'}\n\n## 중심명제\n${coreMessage || ''}\n\n## 본문\n${passage || ''}\n\n## 주제\n${theme || ''}${mpSection}\n\n위 내용을 바탕으로 이 섹션에 어울리는 예화 3가지를 생성해주세요. 다중 본문이 제공된 경우 각 본문의 주제와 연결되는 예화를 추천하세요.`
      maxTokens = 2000
      temperature = 0.7
    } else if (type === 'reference') {
      const { sectionContent, sectionType, sectionLabel, coreMessage, passage, theme, multiPassageData } = data
      let mpSection = ''
      if (multiPassageData?.length > 0) {
        mpSection = '\n\n## 다중 본문 정보\n' + multiPassageData.map((mp: any) => {
          let info = `- ${mp.label || mp.passage}`
          if (mp.contextInfo?.bookStructure) info += ` (${mp.contextInfo.bookStructure})`
          if (mp.themes?.length > 0) info += `\n  주제: ${mp.themes.join('; ')}`
          return info
        }).join('\n')
      }
      userText = `설교 섹션 내용을 분석해 관련 참고 메모 2-3가지를 추천해주세요:\n\n## 섹션\n${sectionLabel || ''} (${sectionType || ''})\n\n## 섹션 내용\n${sectionContent?.slice(0, 500) || '(아직 작성 전)'}\n\n## 중심명제\n${coreMessage || ''}\n\n## 본문\n${passage || ''}\n\n## 주제\n${theme || ''}${mpSection}\n\n위 내용을 바탕으로 이 섹션에 깊이와 통찰을 더할 참고 메모 2-3가지를 생성해주세요. 다중 본문이 제공된 경우 각 본문의 맥락과 주제를 고려한 참고 자료를 추천하세요.`
      maxTokens = 1500
      temperature = 0.5
    } else if (type === 'manuscript-diagnosis') {
      const { sections, coreMessage, passage, referenceNotes, illustrationNotes } = data
      const fullText = sections.map((s: any) => `[${s.label}]\n${s.content}`).join('\n\n')
      userText = `다음 설교 원고를 진단해주세요:\n\n## 본문\n${passage || ''}\n\n## 중심명제\n${coreMessage || ''}\n\n## 원고 전문\n${fullText}\n\n## 참고 메모\n${(referenceNotes || []).map((n: any) => `- ${n.title}: ${n.content}`).join('\n')}\n\n## 예화 메모\n${(illustrationNotes || []).map((n: any) => `- ${n.title}: ${n.content}`).join('\n')}\n\n위 내용을 바탕으로 설교의 완성도를 진단하고 구체적인 피드백을 제공해주세요.`
      model = 'gpt-4o-mini'
      maxTokens = 1500
      temperature = 0.3
    } else if (type === 'reference-weave') {
      const { sectionContent, referenceContent, referenceAuthor, referenceBook, multiPassageData } = data
      let mpSection = ''
      if (multiPassageData?.length > 0) {
        mpSection = '\n\n## 설교가 다루는 다중 본문\n' + multiPassageData.map((mp: any) =>
          `- ${mp.label || mp.passage}: ${(mp.themes || []).join('; ')}`
        ).join('\n')
      }
      userText = `현재 섹션 내용:\n${sectionContent || ''}\n\n참고 자료:\n내용: ${referenceContent || ''}\n저자: ${referenceAuthor || ''}\n출처: ${referenceBook || ''}${mpSection}\n\n위 참고 자료를 현재 섹션의 흐름에 자연스럽게 녹여낸 문장이나 단락을 작성해주세요. 설교자의 구어체 톤을 유지하고, 회중이 이해하기 쉽게 설명하십시오. 다중 본문이 제공된 경우 해당 본문의 주제와도 연결되도록 하세요.`
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

      // === NEW: text가 비어있으면 개역개정 본문 자동 로드 ===
      // 클라이언트(`new/page.tsx`)는 passageDisplay="롬 5:8" 같은 참조만 보내므로
      // AI가 본문 내용을 알 수 없음 → bible-study 분기와 동일하게 서버에서 직접 로드
      try {
        const allData = await loadBibleData()
        for (const p of passageList) {
          if (p.text && p.text.trim()) continue  // 클라이언트가 본문 텍스트를 보낸 경우 스킵
          const shortName = p.book ? mapBookName(String(p.book)) : null
          if (!shortName || !p.chapter) continue
          const ch = parseInt(String(p.chapter), 10)
          const vs = parseInt(String(p.verseStart || '1'), 10)
          const ve = p.verseEnd ? parseInt(String(p.verseEnd), 10) : vs
          if (!ch || !vs) continue
          const matches = allData.filter(
            (v: any) => v.book === shortName && v.chapter === ch && v.verse >= vs && v.verse <= ve
          ).sort((a: any, b: any) => a.verse - b.verse)
          if (matches.length > 0) {
            p.text = matches.map((v: any) => v.content).join(' ')
          }
        }
      } catch (e) {
        console.error('[suggest-titles] Failed to load bible data:', e)
      }
      // === END NEW ===

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
      maxTokens = 2500  // 5개 제목 + reason + style + passages_used 안정적 생성
    } else if (type === 'memo-insight' || type === 'memo-questions' || type === 'memo-application-idea') {
      const { book, chapter, verseStart, verseEnd, memoText, memoTags } = data

      // 개역개정 본문 서버 로드 (suggest-titles와 동일 패턴)
      let passageText = ''
      if (book && chapter) {
        try {
          const allData = await loadBibleData()
          const shortName = mapBookName(String(book))
          const ch = parseInt(String(chapter), 10)
          const vs = parseInt(String(verseStart || '1'), 10)
          const ve = verseEnd ? parseInt(String(verseEnd), 10) : vs
          if (shortName && ch && vs) {
            const matches = allData
              .filter((v: any) => v.book === shortName && v.chapter === ch && v.verse >= vs && v.verse <= ve)
              .sort((a: any, b: any) => a.verse - b.verse)
            if (matches.length > 0) passageText = matches.map((v: any) => v.content).join(' ')
          }
        } catch (e) {
          console.error(`[${type}] bible data load failed:`, e)
        }
      }

      const ref = `${book || ''} ${chapter || ''}:${verseStart || '1'}${verseEnd && String(verseEnd) !== String(verseStart) ? `-${verseEnd}` : ''}`

      userText = `## 본문\n참조: ${ref}\n내용: ${passageText || '(본문 텍스트 없음)'}\n\n## 연구 메모\n${memoText || '(작성된 메모 없음)'}\n\n## 태그\n${(memoTags || []).join(', ') || '없음'}`

      model = 'gpt-4o-mini'
      maxTokens = 2500
      temperature = 0.5
    } else {
      const s = data.sermon
      userText = `설교 제목: ${s?.title || ''}\n본문: ${s?.passage || ''}\n핵심 메시지: ${s?.coreMessage || ''}\n도입: ${s?.introduction || ''}\n대지: ${(s?.outlineTitles || []).join(', ')}\n결론: ${s?.conclusion || ''}\n설교자: ${s?.preacher || ''}\n회중: ${(s?.audience || []).join(', ')}\n주제: ${(s?.themeNames || []).join(', ')}`
    }

    // OpenAI 호출 (Option 3: 다중 본문은 자동 fallback 지원)
    let res: any
    let isFallback = false
    const baseRequest = {
      messages: [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: userText },
      ],
      temperature,
      max_completion_tokens: maxTokens,
      response_format: (type === 'bible-study' || type === 'bible-study-core' || type === 'bible-study-translation' || type === 'bible-study-multi' || type === 'suggest-titles' || type === 'outline' || type === 'application' || type === 'application-direction' || type === 'application-generate' || type === 'core-message' || type === 'delivery' || type === 'illustration' || type === 'reference' || type === 'manuscript-diagnosis' || type === 'commentary-to-section' || type === 'greek-words-analyze' || type === 'memo-insight' || type === 'memo-questions' || type === 'memo-application-idea') ? { type: 'json_object' as const } : undefined,
    }

    try {
      res = await getOpenai().chat.completions.create({ model, ...baseRequest })
    } catch (e: any) {
      // 모델 부재/접근 불가 시 fallback (다중 본문 분기에서만)
      const isModelError = e?.code === 'model_not_found' || 
                            e?.message?.includes('model') || 
                            e?.status === 404
      if (isModelError && (primaryModel || fallbackModel) && fallbackModel && model !== fallbackModel) {
        console.warn(`[bible-study] Model ${model} unavailable, falling back to ${fallbackModel}:`, e?.message)
        isFallback = true
        model = fallbackModel
        res = await getOpenai().chat.completions.create({ model, ...baseRequest })
      } else {
        throw e  // 다른 에러는 그대로 전파
      }
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

    let output = res.choices[0]?.message?.content || ''

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

    if ((type === 'bible-study' || type === 'bible-study-core' || type === 'bible-study-translation' || type === 'bible-study-multi' || type === 'suggest-titles' || type === 'outline' || type === 'application' || type === 'application-direction' || type === 'application-generate' || type === 'core-message' || type === 'delivery' || type === 'illustration' || type === 'reference' || type === 'manuscript-diagnosis' || type === 'greek-words-analyze') && output) {
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
    if ((type === 'bible-study' || type === 'bible-study-core') && bibleActualVerses && output) {
      try {
        const parsed = JSON.parse(output)
        if (type === 'bible-study-core') {
          // bible-study-core: AI가 verses를 안 만듦 → 개역개정 본문으로 자동 주입
          const verses = Array.from(bibleActualVerses.entries())
            .sort(([a], [b]) => a - b)
            .map(([verse, korean]) => ({ verse, korean }))
          if (verses.length > 0) {
            parsed.verses = verses
            output = JSON.stringify(parsed)
          }
        } else if (parsed.verses) {
          // bible-study (기존): korean 필드만 보강
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

    return NextResponse.json({
      success: true,
      data: {
        output,
        modelUsed: model,
        isFallback,
      },
    })
  } catch (err: any) {
    console.error('POST /api/advanced/ai error:', err)
    return NextResponse.json({ success: false, error: err.message || '생성 실패' }, { status: 500 })
  }
}
