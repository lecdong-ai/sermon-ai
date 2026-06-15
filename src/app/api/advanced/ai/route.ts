import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { cookies } from 'next/headers'
import { SYSTEM_PROMPT as OUTLINE_PROMPT } from '@/lib/ai/prompts/outline'

let _openai: OpenAI | null = null
function getOpenai() {
  if (!_openai) {
    const key = process.env.OPENAI_API_KEY
    if (!key) throw new Error('OPENAI_API_KEY is not set')
    _openai = new OpenAI({ apiKey: key })
  }
  return _openai
}

function getMockOutput(type: string, data: any): string {
  const { passage, book, chapter, verseStart, verseEnd, sermon } = data
  const p = passage || (sermon?.passage) || ''
  const t = sermon?.title || ''
  switch (type) {
    case 'suggest-titles': {
      const bookName = book || '성경'
      const ch = chapter || '?'
      const vs = verseStart || '?'
      return JSON.stringify([
        { title: `${bookName} ${ch}:${vs}에 담긴 은혜의 메시지`, reason: '본문의 핵심 주제를 은혜라는 보편적 프레임으로 전달합니다.' },
        { title: `${bookName} ${ch}장이 우리에게 말하는 것`, reason: '질문형 제목으로 호기심을 유발합니다.' },
        { title: '하나님의 약속을 붙드는 믿음', reason: '본문의 신학적 주제를 관통하는 보편적 제목입니다.' },
        { title: `오늘을 사는 신앙 — ${bookName} ${ch}:${vs}`, reason: '본문의 현재적 적용을 강조합니다.' },
        { title: '변화를 만나는 은혜의 자리', reason: '감동과 은혜를 강조하는 감성적 제목입니다.' },
      ])
    }
    case 'summary':
      return `📝 [AI 설교 요약서] - "${t}" (${p})\n\n■ 핵심 명제\n${sermon?.coreMessage || ''}\n\n■ 본문 전개 요약\n1. 도입: ${sermon?.introduction || ''}\n2. 전개:\n${(sermon?.outlineTitles || []).map((ot: string, idx: number) => `   - 대지 ${idx + 1}: ${ot}`).join('\n')}\n3. 결론: ${sermon?.conclusion || ''}`
    case 'questions':
      return `👥 [소그룹 나눔 질문지] - "${t}"\n\n■ 대상 회중: ${(sermon?.audience || []).join(', ')}\n\n1. [도입 질문] 오늘 설교 주제와 관련하여, 한 주간 내 삶에 가장 먼저 떠오른 생각은 무엇인가요?\n\n2. [본문 묵상] 본문 ${p}에 나타난 하나님의 마음에 대해 나누어 봅시다.\n\n3. [실천적 질문] "${sermon?.coreMessage || ''}"라는 메시지를 삶 속에서 어떻게 순종할 수 있을까요?`
    case 'cardnews':
      return `✨ [카드뉴스 기획안]\n\n■ 메인 컨셉: "${t}"\n\n- [카드 1] 표지: ${t} | ${p}\n- [카드 2] 문제 제기: ${(sermon?.introduction || '').slice(0, 50)}...\n- [카드 3] 해결책: ${sermon?.coreMessage || ''}\n- [카드 4] 적용: ${(sermon?.conclusion || '').slice(0, 60)}...\n- [카드 5] 엔딩`
    case 'shorts':
      return `🎬 [유튜브 쇼츠 60초]\n\n[00:00-00:10] (오프닝) "지치고 포기하고 싶은 순간이 있나요? 60초만 들어보세요."\n[00:10-00:35] "${sermon?.coreMessage?.slice(0, 70) || ''}"\n[00:35-00:50] 하나님의 사랑은 여러분을 결코 놓지 않습니다.\n[00:50-01:00] 구독과 좋아요를 눌러주세요!`
    case 'ppt':
      return `📊 [PPT 슬라이드]\n\n■ 템플릿: 테크 다크 오션\n\n- [슬라이드 1] ${t} | ${p}\n- [슬라이드 2] 본문 말씀\n- [슬라이드 3] ${(sermon?.outlineTitles || [])[0] || '첫 번째 대지'}\n- [슬라이드 4] ${(sermon?.outlineTitles || [])[1] || '두 번째 대지'}\n- [슬라이드 5] 결론`
    case 'guide':
      return `📖 [토론 가이드]\n\n■ 설교: "${t}" (${p})\n\n■ 진행:\n1. 본문 배경 설명\n2. 핵심 메시지: ${sermon?.coreMessage || ''}\n3. 토론 질문\n4. 기도로 마무리`
    case 'bible-study':
      return JSON.stringify({
        passage: '성경 구절',
        verses: Array.from({ length: Math.min((parseInt(verseEnd) || parseInt(chapter)) - parseInt(verseStart || '1') + 1, 5) }, (_, i) => ({
          verse: parseInt(verseStart || '1') + i,
          greek: 'original greek text',
          translit: 'transliteration',
          korean: '한글 번역',
          niv: 'NIV translation',
          esv: 'ESV translation',
        })),
        words: [
          { id: 'w-sample', strong: 'G0000', lemma: 'word', lemmaGreek: 'word', pronunciation: 'pron', transliteration: 'translit', partOfSpeech: '명사', morphology: '형태', basicMeaning: '기본 뜻', contextualMeaning: '문맥상 뜻', simpleExplanation: '쉬운 설명', usage: [{ ref: 'ref', text: 'text' }], sermonNote: '설교 적용', relatedWords: ['related'] },
        ],
        commentaries: [
          { verse: parseInt(verseStart || '1'), author: '학자명', type: 'exegetical', source: '출처', text: '주석 내용' },
        ],
        translationNotes: [
          { verse: parseInt(verseStart || '1'), versions: ['NIV', 'ESV', 'KRV'], note: '번역 차이 설명' },
        ],
        parallelPassages: [
          { ref: '예) 창 1:1', text: '본문', relation: 'thematic', description: '설명' },
        ],
        themes: [
          { name: '주제', description: '설명', connectedSermons: 5 },
        ],
        contextInfo: {
          before: '앞 문맥',
          after: '뒤 문맥',
          bookStructure: '책 구조 설명',
        },
      })
    default:
      return '콘텐츠를 준비 중입니다.'
  }
}

const SYSTEM_PROMPTS: Record<string, string> = {
  'suggest-titles': '당신은 설교 준비를 돕는 AI입니다. 주어진 성경 본문(책, 장, 절)에 어울리는 설교 제목 5개와 각각의 추천 이유를 JSON 배열로 반환하세요. 각 항목은 { title: string, reason: string } 형식입니다. 제목은 한국어로, 20자 이내로 간결하게 작성하세요. Return ONLY valid JSON, no markdown, no explanation.',
  summary: '당신은 설교 요약을 돕는 AI입니다. 주어진 설교 정보(제목, 본문, 핵심메시지, 도입, 대지, 결론)를 바탕으로 간결하고 명확한 설교 요약서를 한국어로 작성하세요.',
  questions: '당신은 소그룹 리더를 위한 나눔 질문을 만드는 AI입니다. 주어진 설교 정보를 바탕으로 3-4개의 깊이 있는 소그룹 토론 질문을 한국어로 생성하세요.',
  cardnews: '당신은 교회 SNS를 위한 카드뉴스를 기획하는 AI입니다. 주어진 설교 정보를 바탕으로 5장 구성의 카드뉴스 기획안을 한국어로 작성하세요.',
  shorts: '당신은 유튜브 쇼츠 대본을 작성하는 AI입니다. 주어진 설교 정보를 바탕으로 60초 분량의 쇼츠 스토리보드를 한국어로 작성하세요.',
  ppt: '당신은 예배를 위한 PPT 슬라이드를 구성하는 AI입니다. 주어진 설교 정보를 바탕으로 5장 내외의 슬라이드 레이아웃을 한국어로 작성하세요.',
  guide: '당신은 소그룹 리더를 위한 토론 가이드를 만드는 AI입니다. 주어진 설교 정보를 바탕으로 상세한 토론 진행 가이드를 한국어로 작성하세요.',
  outline: OUTLINE_PROMPT,
  'bible-study': `You are a Bible study AI assistant specializing in Greek/Hebrew textual analysis. Given a Bible passage, return a JSON object with this exact structure:

{
  "verses": [{ "verse": number, "greek": "original greek text", "translit": "transliteration", "korean": "개역개정 Korean", "niv": "NIV English", "esv": "ESV English" }],
  "words": [{ "id": "w-uniqueid", "strong": "G####", "lemma": "lemma", "lemmaGreek": "Greek lemma", "pronunciation": "pronunciation", "transliteration": "transliteration", "partOfSpeech": "Korean POS", "morphology": "morphology info", "basicMeaning": "basic meaning in Korean", "contextualMeaning": "contextual meaning in Korean", "simpleExplanation": "easy explanation in Korean", "usage": [{ "ref": "Book ch:vs", "text": "usage text" }], "sermonNote": "preaching application note in Korean", "relatedWords": ["related1", "related2"] }],
  "commentaries": [{ "verse": number, "author": "scholar name in Korean", "text": "commentary text in Korean", "type": "exegetical|theological|historical|pastoral", "source": "source name" }],
  "translationNotes": [{ "verse": number, "versions": ["NIV","ESV","KRV"], "note": "translation difference explanation in Korean" }],
  "parallelPassages": [{ "ref": "Book ch:vs", "text": "passage text", "relation": "direct_quote|allusion|thematic|typology", "description": "explanation in Korean" }],
  "themes": [{ "name": "theme name in Korean", "description": "description in Korean", "connectedSermons": number }],
  "wordAlignments": [{ "verse": number, "englishVersion": "NIV", "englishWord": "English word", "greekWordId": "w-matching_id" }],
  "contextInfo": { "before": "previous context in Korean", "after": "following context in Korean", "bookStructure": "book structure overview in Korean" }
}

IMPORTANT: 
1. Return ONLY valid JSON, no markdown, no explanation.
2. Generate EVERY single verse in the passage — do not skip or truncate any verse.
3. Generate 3-7 key words (focus on theologically significant terms), 2-4 commentaries, 2-3 translation notes, 2-3 parallel passages, 3-5 themes.
4. All text content in Korean except original Greek and English translations.
5. wordAlignments: For each word in the \"words\" array, add one or more wordAlignment entries mapping the Greek word to its English translation in the NIV text. Include entries for EVERY verse where that Greek word appears. The englishWord should match the exact word as it appears in the verse's NIV text (case-sensitive, matching the NIV string).`,
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
    const cookieStore = cookies()
    const useMock = cookieStore.get('use_mock')?.value === 'true'

    const body = await request.json()
    const { type, data } = body as { type: string; data: any }

    if (!type || !data) {
      return NextResponse.json({ success: false, error: 'type과 data가 필요합니다.' }, { status: 400 })
    }

    if (useMock) {
      await new Promise(r => setTimeout(r, 800))
      return NextResponse.json({ success: true, data: { output: getMockOutput(type, data) } })
    }

    const systemPrompt = SYSTEM_PROMPTS[type]
    if (!systemPrompt) {
      return NextResponse.json({ success: false, error: `알 수 없는 타입: ${type}` }, { status: 400 })
    }

    let userText: string
    let maxTokens = 2000
    let temperature = 0.3
    let model = 'gpt-4o-mini'

    if (type === 'bible-study') {
      const { book, chapter, verseStart, verseEnd, passage } = data
      const vs = parseInt(verseStart || '1')
      const ve = parseInt(verseEnd || verseStart || '1')
      const count = ve - vs + 1
      userText = `Analyze this passage in depth:\nBook: ${book || ''}\nChapter: ${chapter || ''}\nVerses: ${verseStart || ''}${verseEnd ? `-${verseEnd}` : ''}\nPassage: ${passage || ''}\n\nCRITICAL: You MUST generate ALL ${count} verses (${vs} to ${ve}) — every single one. Count them carefully. Do NOT skip, truncate, summarize, or merge any verse. Each verse entry MUST have complete greek, translit, korean, niv, and esv fields. If you stop before finishing all ${count} verses, the entire analysis will be rejected.`
      model = 'gpt-4o-mini'
      maxTokens = 16384
      temperature = 0.3
    } else if (type === 'word-lookup') {
      userText = `Look up this word from a Bible passage and return a complete analysis in the specified JSON format:\nWord: "${data.word}"\nPassage context: ${data.context || ''}\n\nIf the word is English, identify the corresponding Greek word in this passage first, then analyze it.`
      maxTokens = 2000
      temperature = 0.3
    } else if (type === 'english-word') {
      userText = `Analyze this English word from a Bible passage and return its definition and analysis in the specified JSON format:\nWord: "${data.word}"\nPassage context: ${data.context || ''}\n\nReturn ONLY the English word analysis — do NOT convert to Greek.`
      maxTokens = 2000
      temperature = 0.3
    } else if (type === 'outline') {
      const { book, chapter, verseStart, verseEnd, passage, passageStructure, keyWords, researchInsights, coreMessage } = data
      userText = `설교 개요(대지 구조)를 생성해주세요:\n본문: ${passage || ''}\n책: ${book || ''}\n장: ${chapter || ''}\n절: ${verseStart || ''}${verseEnd ? `-${verseEnd}` : ''}\n\n본문 핵심 흐름: ${passageStructure || ''}\n핵심 메시지: ${coreMessage || ''}\n주요 단어: ${(keyWords || []).map((w: any) => w.word || '').filter(Boolean).join(', ')}\n연구 통찰: ${(researchInsights || []).join('\n')}`
      maxTokens = 4000
      temperature = 0.5
    } else if (type === 'suggest-titles') {
      const { passage, book, chapter, verseStart, verseEnd } = data
      userText = `성경 본문: ${book || ''} ${chapter || ''}장${verseStart ? ` ${verseStart}절` : ''}${verseEnd ? `-${verseEnd}절` : ''}\n본문 구절: ${passage || ''}`
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
    })

    let output = res.choices[0]?.message?.content || ''
    // Extract JSON from markdown or surrounding text robustly
    const start = output.indexOf('{')
    const end = output.lastIndexOf('}')
    if (start !== -1 && end > start) {
      output = output.slice(start, end + 1)
    } else {
      output = output.replace(/^```(?:json)?\s*\n?/gm, '').replace(/\n?```\s*$/gm, '').trim()
    }

    if ((type === 'bible-study' || type === 'suggest-titles' || type === 'outline') && output) {
      try {
        JSON.parse(output)
      } catch {
        console.error(`${type} AI response is not valid JSON, length:`, output.length)
        return NextResponse.json({
          success: false,
          error: `AI 응답이 완전하지 않습니다 (${output.length}자). 다시 시도해주세요.`,
        }, { status: 422 })
      }
    }

    return NextResponse.json({ success: true, data: { output } })
  } catch (err: any) {
    console.error('POST /api/advanced/ai error:', err)
    return NextResponse.json({ success: false, error: err.message || '생성 실패' }, { status: 500 })
  }
}
