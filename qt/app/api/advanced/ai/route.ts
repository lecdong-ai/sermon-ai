import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { mapBookName } from '@/lib/bible/bookMap'
import { loadKjvData } from '@/lib/bible/kjvData'
import { formatSectionsForPrompt } from '@/lib/bible/sections'
import { verifyPassagePool, detectDuplicatePassages } from '@/lib/qtPassagePool'
import { countVersesInRange } from '@/lib/bible/verseCounts'
import {
  SYSTEM_PROMPT_SPLIT,
  SYSTEM_PROMPT_DRAFT,
  SYSTEM_PROMPT_REFINE,
  SYSTEM_PROMPT_ASSEMBLE,
  SYSTEM_PROMPT_RECOMMEND_DAILY,
} from '@/lib/ai/prompts/qt'

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
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(BIBLE_CDN_URL, { signal: controller.signal })
    if (!res.ok) throw new Error('Failed to load bible data')
    _bibleData = await res.json()
    return _bibleData!
  } finally {
    clearTimeout(timeoutId)
  }
}

const SYSTEM_PROMPTS: Record<string, string> = {
  'qt-split': SYSTEM_PROMPT_SPLIT,
  'qt-draft': SYSTEM_PROMPT_DRAFT,
  'qt-refine': SYSTEM_PROMPT_REFINE,
  'qt-assemble': SYSTEM_PROMPT_ASSEMBLE,
  'qt-recommend-daily': SYSTEM_PROMPT_RECOMMEND_DAILY,
  'qt-reshape-day': `당신은 QT 본문 범위 수정 도우미입니다. 사용자의 지시에 따라 JSON 형식으로만 응답하십시오.`,
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body as { type: string; data: any }

    if (!type || !data) {
      return NextResponse.json({ success: false, error: 'type과 data가 필요합니다.' }, { status: 400 })
    }

    let systemPrompt = SYSTEM_PROMPTS[type]
    if (!systemPrompt) {
      return NextResponse.json({ success: false, error: `\uc54c \uc218 \uc5c6\ub294 \ud0c0\uc785: ${type}` }, { status: 400 })
    }

    let userText: string
    let maxTokens = 2000
    let temperature = 0.3
    let frequencyPenalty = 0
    let presencePenalty = 0
    let model = 'gpt-4o-mini'
    let qtBibleBook = ''
    let qtStartPassage = ''
    let qtLimit = 0
    let qtValidationErrors = 0

    if (type === 'qt-split') {
      const { bibleBook: _bibleBook, weekNumber, startPassage: _startPassage, endPassage, audience, level, daysCount, dateList, chunkInfo, forceFullRows } = data
      qtBibleBook = _bibleBook || ''
      qtStartPassage = _startPassage || ''
      qtLimit = daysCount || 6
      const bibleBook = _bibleBook
      const startPassage = _startPassage
      const limit = qtLimit
      const hasEndPassage = !!endPassage && endPassage.trim().length > 0

      systemPrompt = systemPrompt.replace(/{일수}/g, String(limit))

      if (!hasEndPassage) {
        systemPrompt += `\n\n## 자동 이어가기 모드 (종료 본문 미지정)
- 시작 본문부터 ${limit}일치로 자연스럽게 분할하십시오.
- 하루 분량은 15~25절 기준의 의미 단락으로 결정하십시오.
- 한 성경책이 완료되면 7대 원칙에 따라 다음 성경책 1장 1절부터 이어가십시오.
- 마지막 날의 끝 절을 정확히 명시하여 다음 분할에서 이어 사용할 수 있도록 하십시오.`
      }

      if (chunkInfo) {
        systemPrompt += `\n\n## 청크 분할 정보 (월간 큐티)
- 현재 청크: ${chunkInfo.current}/${chunkInfo.total}
- 이 청크가 담당하는 일수: ${limit}일
- 이 청크는 전체 월간 큐티의 ${chunkInfo.offset + 1}~${chunkInfo.offset + limit}일차를 담당합니다.
- 이전 청크에서 끝난 본문 다음부터 정확히 이어서 분할하십시오.
- 생략이나 줄임표(...) 사용을 절대 금지합니다.
- ⚠️ [필수] 이전 청크에서 이미 다룬 장/절(시작 본문보다 더 이전의 구절)을 절대 반복하지 마십시오. 이전 주의 내용을 다시 쓰지 말고, 반드시 이어서 진행하십시오.`
      } else if (limit > 10) {
        systemPrompt += `\n\n## [경고] 반드시 ${limit}일치 데이터를 전부 작성하십시오. 중간에서 끊거나 반복하지 말고, 반드시 지정된 ${limit}일차까지의 모든 날짜의 본문 분할표 행을 누락 없이 출력해야 합니다.`
      }

      if (dateList && Array.isArray(dateList) && dateList.length > 0) {
        systemPrompt += `\n\n## 날짜 매핑 지침 (★매우 중요★)
본문 분할표의 첫 번째 열('날짜')에는 아래 제공된 실제 날짜 목록 순서대로 정확히 채우십시오.
**절대로 임의로 날짜를 건너뛰거나 선택하지 마십시오. 1일차, 2일차, ..., ${limit}일차 순서대로 빠짐없이 채워야 합니다.**

## 적용할 실제 날짜 목록 (${limit}일치):
${dateList.map((d: string, i: number) => `${i + 1}일차: ${d}`).join('\n')}`
      }

      if (forceFullRows) {
        systemPrompt += `\n\n## ★★★재시도 경고 (절대 위반 금지)★★★
[이전 시도 실패] AI가 ${limit}일치 행을 빠뜨렸습니다. 이 시도가 마지막 재시도입니다.
반드시 *정확히 ${limit}개의 행*을 생성하세요. 어떤 경우에도 행을 줄이지 마십시오.

### 행 수 부족 원인 (절대 반복하지 말 것)
- ❌ "본문이 짧다"는 이유로 행을 합치지 마라
- ❌ "내용이 비슷하다"는 이유로 행을 생략하지 마라
- ❌ 임의로 날짜를 건너뛰지 마라
- ✅ 본문이 부족하면 **다음 성경책/장/절로 확장**해서 정확히 ${limit}행을 채워라
- ✅ 한 성경책의 모든 장이 끝나면 **다음 성경책 1장 1절부터** 이어가라
- ✅ 마지막 날은 "본문: 책명 X:Y" 형식으로 정확한 끝 절을 명시하라

★★★반드시 ${limit}행을 빠짐없이 출력하면 응답이 정상으로 인정됩니다.★★★`
      }

      let sectionsText = ''
      try {
        if (bibleBook && startPassage) {
          const sMatch = String(startPassage).match(/^(.+?)\s+(\d+)\s*[:장]\s*(\d+)/)
          const eMatch = hasEndPassage
            ? String(endPassage).match(/^(.+?)\s+(\d+)\s*[:장]\s*(\d+)/)
            : null
          if (sMatch) {
            const sChap = parseInt(sMatch[2], 10)
            const sVs = parseInt(sMatch[3], 10)
            let eChap = eMatch ? parseInt(eMatch[2], 10) : sChap
            let eVs = eMatch ? parseInt(eMatch[3], 10) : sVs
            if (eChap < sChap || (eChap === sChap && eVs < sVs)) {
              eChap = sChap
              eVs = sVs
            }
            sectionsText = formatSectionsForPrompt(bibleBook, sChap, sVs, eChap, eVs)
          }
        }
      } catch (secErr) {
        console.warn('[qt-split] sections lookup failed:', secErr)
      }

      if (sectionsText) {
        systemPrompt += `\n\n## ★본문 영역의 성경 소제목 (참고용)★
아래는 성경공회 공식 개역개정 기준의 소제목(섹션 제목)입니다. **20-30절 분량 규칙이 소제목 경계보다 항상 우선합니다.**

${sectionsText}

### 소제목 기반 분할 규칙 (★우선순위 엄격 준수★)

★[1순위, 절대 위반 금지] 각 날은 1-2개 소제목, 20-30절이어야 한다★
- 20절 미만이거나 30절 초과 시 명백한 위반이다.
- 평균 25절 권장 (15-20절이면 인접 소제목과 결합, 35절+이면 2개 결합)
- 1일 = 1-2개 소제목 (소제목 경계 = 분할점)

[2순위] 소제목 경계 선호: 20-30절 범위 안에서 가능한 한 소제목 경계를 분할점으로 사용.

[3순위] 분량 균형: 한 날이 35절을 넘으면 의미 단위로 나누기 (시편 119장 등).

[4순위] 1장 이하 책 (유다서, 오바댜, 요한2/3서, 빌레몬서): 자동으로 다음 권 1장부터 결합하여 6일 분량 채우기.

[5순위] DB에 없는 책/장: 본문 내용 분석으로 자연스러운 신학적 단락을 만들어 분할.

### 결합 예시 (참고)
- 1:1-25절(25절, 천지 창조) → 1일 단독 (25절) ✓
- 1:26-31절(6절) + 2:1-3절(3절) + 2:4-17절(14절) = 1:26-2:17 (23절) → 3개 소제목 결합 (20-30절 OK) ✓
- 1:1-2절(2절) + 1:3-14절(12절) = 1:1-14절(14절) → 너무 짧음 → 1:1-14 + 1:15-23 = 1:1-23(23절) ✓
- 1:1-25 + 1:26-31 = 1:1-31(31절) → 30절 초과 → 31절은 단독 또는 1:1-25만 1일로

★중요★: 단일 소제목이 20절 미만이면 **반드시 인접 소제목과 결합**하여 20-30절을 채울 것. 평균 25절을 목표로.`
      }

      userText = `## 입력 정보
- 성경권: ${bibleBook || ''}
- 이번 주차: ${weekNumber || 1}
- 시작 본문: ${startPassage || ''}
${hasEndPassage ? `- 종료 본문: ${endPassage}` : '- 종료 본문: (지정 안 됨 - 자동 이어가기 모드)'}
- 대상 독자: ${audience || '일반 성도'}
- 난이도: ${level || '중'}
- 분할 일수: ${limit}일
${sectionsText ? `- 본문 영역의 성경 소제목: 아래 시스템 프롬프트 참조` : ''}

## 특별 요구사항
- ★[최우선] 표의 첫 번째 열에 전달된 날짜 목록(${limit}일치)을 1일차부터 ${limit}일차까지 **순서대로 하나도 빠뜨리지 말고** 출력해 주세요. 임의로 날짜를 건너뛰는 것은 명백한 위반입니다.
- ★[행 개수] 정확히 ${limit}개의 행을 생성해야 합니다. 절대로 행을 줄이거나 합치지 마세요. 본문이 부족하면 다음 성경책/장/절로 이어가서 ${limit}행을 채우세요.
- 분할 이유나 묵상 초점은 명료하고 컴팩트하게 작성하여 토큰 제한에 걸려 출력이 중간에 잘리지 않도록 하십시오.
- 동일한 문구나 패턴을 반복하지 말고, 각 날짜의 본문과 제목, 초점을 서로 다르게 작성하십시오.
- ⚠️ [매우 중요] 시작 본문("${startPassage || ''}")보다 이전 구절(더 작은 장 번호)을 절대 포함하지 마십시오. 반드시 "${startPassage || ''}"부터 정확히 시작해서 순차적으로 진행하세요. 이미 다룬 내용을 다시 쓰지 마십시오.
- ⚠️ [필수] '분할 이유' 열을 절대 비워두지 마십시오. 각 날짜 본문을 선정한 신학적/문맥적 이유를 반드시 1문장씩 채우십시오.${sectionsText ? '\n- ★성경 소제목이 제공된 경우, 그 경계를 우선 분할 지점으로 사용하세요. 단, 20-30절 분량 규칙(평균 25절)은 항상 우선합니다.' : ''}`
      model = 'gpt-4o-mini'
      maxTokens = limit > 10 ? Math.min(2500 + (limit - 10) * 100, 3500) : 2500
      temperature = 0.5
      frequencyPenalty = 0.6
      presencePenalty = 0.3

      const ignorePool = data.ignorePoolCheck === true
      if (!ignorePool) {
        const poolResult = verifyPassagePool(
          bibleBook || '',
          startPassage || '',
          (hasEndPassage ? endPassage : null) as string | null,
          limit,
          20
        )
        if (!poolResult.isSufficient) {
          return NextResponse.json({
            success: false,
            error: 'POOL_INSUFFICIENT',
            poolInfo: poolResult,
            message: `"${bibleBook}"의 선택한 범위는 ${poolResult.available}절로, ${limit}일 × 20절 = ${poolResult.required}절이 부족합니다. (${poolResult.deficit}절 부족, 약 ${poolResult.shortageDays}일분 부족)`,
          })
        }
      }
    } else if (type === 'qt-reshape-day') {
      const { bibleBook, dayDate, prevPassage, currentPassage, nextPassage, audience, level } = data
      userText = `## 재분할 요청
- 성경책: ${bibleBook || ''}
- 대상 날짜: ${dayDate || ''}
- 이전 날 본문: ${prevPassage || '없음'}
- 현재(문제) 본문: ${currentPassage || ''}
- 다음 날 본문: ${nextPassage || '없음'}
- 대상 독자: ${audience || '일반 성도'}
- 난이도: ${level || '중'}

## 지침
위 날짜의 본문 범위가 적절하지 않아 수정이 필요합니다.
- 이전 날과 다음 날 사이에 들어갈 10절 이상의 의미 단위를 추천하십시오.
- 이전/다음 날과 본문이 겹치지 않아야 합니다.
- 가능한 한 성경 소제목 단위로 유지하되, 10절이 안 되면 소제목을 결합하십시오.

## 출력 형식
다음 JSON만 출력하십시오 (설명 없음):
{"passage": "새 본문 범위", "title": "큐티 제목", "focus": "핵심 묵상 초점", "reason": "분할 이유"}

## 예시
입력: 이전=4:1-10, 현재=4:11-16, 다음=4:17-24
출력: {"passage":"4:11-24","title":"교회의 성장과 연합","focus":"각 지체의 역할과 교회의 성장","reason":"4:11-16(6절)과 4:17-24(8절)를 합쳐 14절의 의미 단위로 재구성"}

## 예시2
입력: 이전=3:14-21, 현재=4:1-10, 다음=4:11-16
출력: {"passage":"4:1-16","title":"부르심과 은사","focus":"부르심에 합당한 삶과 은사의 다양성","reason":"4:1-10(10절)과 4:11-16(6절)을 합쳐 16절 단위로 재분할"}`
      model = 'gpt-4o-mini'
      maxTokens = 1000
      temperature = 0.5
      frequencyPenalty = 0.3
      presencePenalty = 0.2
    } else if (type === 'qt-recommend-daily') {
      userText = '성경 66권 전체를 검토하여 오늘 묵상하기 좋은 최적의 본문을 선정하고 1일치 프리미엄 큐티 원고(장년용/청소년·새신자용 이중화 적용 포함)를 집필하십시오.'
      model = 'gpt-4o-mini'
      maxTokens = 6000
      temperature = 0.7
    } else if (type === 'qt-draft') {
      const {
        bibleBook, weekNumber, dayName, dayPassage, dayTitle, dayFocus,
        audience, level, tone, bibleTextPolicy, verseQuoteLimit, seriesName,
        bookOverview, passageContext, originalWordsHint, englishWordsHint
      } = data

      let parsedBook = bibleBook || ''
      let parsedChapter = 0
      let parsedVs = 0
      let parsedVe = 0
      try {
        const passStr = String(dayPassage || '').trim()
        const m1 = passStr.match(/^(.+?)\s+(\d+)\s*[:장]\s*(\d+)(?:\s*[-~]\s*(\d+))?/)
        if (m1) {
          parsedBook = m1[1].trim()
          parsedChapter = parseInt(m1[2], 10)
          parsedVs = parseInt(m1[3], 10)
          parsedVe = m1[4] ? parseInt(m1[4], 10) : parsedVs
        } else {
          const m2 = passStr.match(/^(.+?)\s+(\d+)\s*$/)
          if (m2) {
            parsedBook = m2[1].trim()
            parsedChapter = parseInt(m2[2], 10)
            parsedVs = 1
            parsedVe = 0
          }
        }
      } catch {}

      let korText = ''
      let kjvText = ''
      let verseCount = 0
      try {
        const shortName = parsedBook ? mapBookName(parsedBook) : null
        if (shortName && parsedChapter) {
          const allData = await loadBibleData()
          const veEffective = parsedVe > 0 ? parsedVe : (parsedVs > 0 ? parsedVs : 50)
          const matches = allData
            .filter(
              (v: any) =>
                v.book === shortName &&
                v.chapter === parsedChapter &&
                v.verse >= (parsedVs || 1) &&
                v.verse <= veEffective,
            )
            .sort((a: any, b: any) => a.verse - b.verse)
          korText = matches.map((v: any) => `[${v.verse}절] ${v.content}`).join(' ')
          verseCount = matches.length

          try {
            const kjvData = await loadKjvData()
            const kjvMatches = kjvData
              .filter(
                (v) =>
                  v.book === shortName &&
                  v.chapter === parsedChapter &&
                  v.verse >= (parsedVs || 1) &&
                  v.verse <= veEffective,
              )
              .sort((a, b) => a.verse - b.verse)
            kjvText = kjvMatches.map((v) => `[${v.verse}] ${v.content}`).join(' ')
          } catch (kjvErr) {
            console.warn('[qt-draft] KJV load failed, continuing with Korean only:', kjvErr)
          }
        }
      } catch (e) {
        console.error('[qt-draft] bible data load failed:', e)
      }

      const dynamicMax = verseCount > 0
        ? Math.min(6000 + Math.max(verseCount - 20, 0) * 50, 8000)
        : 6000

      userText = `## 기본 정보
- 성경권: ${bibleBook || ''}
- 주차: ${weekNumber || 1}
- 요일: ${dayName || ''}
- 오늘 본문: ${dayPassage || ''}
- 오늘 제목: ${dayTitle || ''}
- 오늘 핵심 초점: ${dayFocus || ''}

## 묵상 및 출력 설정
- 대상 독자: ${audience || '일반 성도'}
- 난이도: ${level || '중'}
- 톤: ${tone || '정중하고 따뜻한'}
- 성경 본문 정책: ${bibleTextPolicy || '전체 본문 제시 — 개역개정과 KJV 모두 본문 범위의 모든 절을 빠짐없이 포함'}
- 핵심절 인용 기준: ${verseQuoteLimit || '전체 본문 — 모든 절'}
- 시리즈명: ${seriesName || '말씀과 함께하는 큐티'}

## 추가 참조 데이터
- 성경권 개요: ${bookOverview || '없음'}
- 문맥 요약: ${passageContext || '없음'}
- 원어 후보: ${originalWordsHint || '없음'}
- 영어단어 후보: ${englishWordsHint || '없음'}

## ★실제 성경 본문 데이터 (아래 본문을 그대로 복사하여 출력에 사용하세요)★
${korText ? `### 개역개정 (한국어) — ${verseCount}절:
${korText}` : '(개역개정 본문 데이터 없음 — 본문 범위만 출력에 표기)'}
${kjvText ? `
### KJV (영문) — ${verseCount}절:
${kjvText}` : ''}

★중요: 위 본문 데이터는 이미 검증된 원문입니다. 출력 시 "## 오늘의 본문" 섹션의 "개역개정 전체 본문"과 "KJV 전체 본문"에 있는 그대로 복사·인용하세요. 절 번호 표기([1절], [1] 등)도 그대로 유지하세요. 절을 요약하거나 의역하지 마세요.★`
      maxTokens = dynamicMax
      temperature = 0.7
    } else if (type === 'qt-refine') {
      const { draftContent } = data
      userText = `아래 QT 초안을 검토하고 웹 및 PDF 가이드라인에 맞추어 최종본으로 다듬어주십시오.

[QT 초안]
${draftContent || ''}`
      maxTokens = 6000
      temperature = 0.5
    } else if (type === 'qt-assemble') {
      const { bibleBook, weekNumber, seriesName, subtitle, audience, sizeOption, designMood, days } = data
      userText = `## 기본 정보
- 성경권: ${bibleBook || ''}
- 주차: ${weekNumber || 1}
- 시리즈명: ${seriesName || ''}
- 부제: ${subtitle || ''}
- 대상 독자: ${audience || ''}
- 판형: ${sizeOption || 'A5'}
- 디자인 분위기: ${designMood || 'warm-modern'}

## 완성된 요일별 QT 원고
${(days || []).map((d: any) => `### 요일: ${d.dayName}\n${d.content}`).join('\n\n===\n\n')}`
      maxTokens = 4000
      temperature = 0.5
    }

    let res: any
    const baseRequest = {
      messages: [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: userText },
      ],
      temperature,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
      max_completion_tokens: maxTokens,
      response_format: type === 'qt-reshape-day' ? { type: 'json_object' as const } : undefined,
    }

    try {
      res = await getOpenai().chat.completions.create({ model, ...baseRequest })
    } catch (e: any) {
      throw e
    }

    let output = res.choices[0]?.message?.content || ''

    if (type === 'qt-reshape-day' && output) {
      const firstOpen = output.indexOf('{')
      const lastClose = output.lastIndexOf('}')
      if (firstOpen !== -1 && lastClose > firstOpen) {
        output = output.slice(firstOpen, lastClose + 1)
      } else {
        output = output.replace(/^```(?:json)?\s*\n?/gm, '').replace(/\n?```\s*$/gm, '').trim()
      }
      try {
        JSON.parse(output)
      } catch (e) {
        let fixed = output
          .replace(/,\s*([}\]])/g, '$1')
          .replace(/'/g, '"')
          .replace(/\n/g, '\\n')
        try {
          JSON.parse(fixed)
          output = fixed
        } catch (e2) {
          console.error('qt-reshape-day AI response is not valid JSON, length:', output.length)
          return NextResponse.json({
            success: false,
            error: `AI 응답이 완전하지 않습니다 (${output.length}자). 다시 시도해주세요.`,
          }, { status: 422 })
        }
      }
    }

    // qt-split validation + retry
    if (type === 'qt-split' && output && qtBibleBook && qtLimit > 0) {
      const MAX_RETRIES = 3

      function extractTableFromMarkdown(md: string): string {
        return md.split('\n').filter(l => l.trim().startsWith('|')).join('\n')
      }

      function parseSplitTableForServer(md: string): any[] {
        const HEADER_KEYWORDS = ['순서', '요일', '날짜', '본문 분할표']
        const results: any[] = []
        for (const line of md.split('\n')) {
          const t = line.trim()
          if (!t.startsWith('|') || !t.endsWith('|')) continue
          if (t.includes('---|') || t.includes('===')) continue
          const parts = t.split('|').map(p => p.trim()).filter((_, i, a) => i > 0 && i < a.length - 1)
          if (parts.length < 4) continue
          const dv = parts[0]
          if (!dv || /^[-:\s]+$/.test(dv) || HEADER_KEYWORDS.includes(dv)) continue
          results.push({ day: dv, passage: parts[1], title: parts[2], focus: parts[3], reason: parts[4] || '' })
        }
        return results
      }

      function validateSplitResult(rows: any[], book: string, expected: number, startPsg: string): string[] {
        const errors: string[] = []
        if (rows.length !== expected) {
          errors.push(`행 개수: ${rows.length}행 반환, ${expected}행 필요`)
          if (rows.length === 0) return errors
        }
        const sm = startPsg?.match(/\d+\s*[:장]\s*(\d+)/)
        const sVs = sm ? parseInt(sm[1]) : 0
        const sc = sm ? parseInt(startPsg.match(/\d+/)?.[0] || '0') : 0
        const passages = rows.map(r => r.passage?.trim()).filter(Boolean)

        for (let i = 0; i < rows.length; i++) {
          const p = passages[i]
          if (!p) { errors.push(`${i + 1}행: 본문 비어있음`); continue }
          const pm = p.match(/(\d+)\s*[:장]\s*(\d+)(?:\s*[-~]\s*(\d+))?/)
          if (!pm) { errors.push(`${i + 1}행: 형식 오류 "${p}"`); continue }
          const ch = parseInt(pm[1]), vs = parseInt(pm[2]), ve = pm[3] ? parseInt(pm[3]) : vs
          if (i === 0 && (ch < sc || (ch === sc && vs < sVs))) errors.push(`${i + 1}행: 시작보다 이전 "${p}"`)
          const vc = countVersesInRange(book, ch, vs, ch, ve)
          if (vc < 10) errors.push(`${i + 1}행: ${vc}절(10절 미만) "${p}"`)
        }
        const dup = detectDuplicatePassages(passages)
        if (dup.hasDuplicate) errors.push(`중복: ${dup.duplicates.join(', ')}`)
        return errors
      }

      let currentOutput = output
      let parsed = parseSplitTableForServer(extractTableFromMarkdown(currentOutput))
      let errors = validateSplitResult(parsed, qtBibleBook, qtLimit, qtStartPassage)
      let bestOutput = currentOutput
      qtValidationErrors = errors.length

      for (let attempt = 1; attempt <= MAX_RETRIES && errors.length > 0; attempt++) {
        console.warn(`[qt-split] 검증 실패 (${attempt}/${MAX_RETRIES}):`, errors)

        if (attempt === MAX_RETRIES) {
          console.warn('[qt-split] 재시도 소진. 최종 출력 사용.')
          break
        }

        const ctx = errors.map((e, i) => `${i + 1}. ${e}`).join('\n')
        const retryPrompt = systemPrompt + `\n\n## ★★★ 이전 시도 검증 오류 — 반드시 수정 ★★★\n${ctx}\n\n## 수정 지침\n- **10절 미만 행은 인접 행과 합쳐서 10절 이상으로 만드십시오** (소제목 경계보다 10절 규칙이 우선)\n- 예: 4:11-16(6절) + 4:17-24(8절) → 4:11-24(14절)\n- 정확히 ${qtLimit}행 유지: 합친 만큼 다른 행의 범위를 확장하거나 새 행을 추가하십시오\n- 각 행 최소 10절, 시작 본문 이후부터, 중복 금지`

        const retryTemp = Math.min(temperature + 0.2 * attempt, 1.0)
        const retryFreq = Math.min(frequencyPenalty + 0.1 * attempt, 1.0)
        const retryPres = Math.min(presencePenalty + 0.1 * attempt, 1.0)
        const retryRes = await getOpenai().chat.completions.create({
          model,
          messages: [
            { role: 'system', content: retryPrompt },
            { role: 'user', content: userText },
          ],
          temperature: retryTemp,
          frequency_penalty: retryFreq,
          presence_penalty: retryPres,
          max_completion_tokens: maxTokens,
        })

        currentOutput = retryRes.choices[0]?.message?.content || ''
        parsed = parseSplitTableForServer(extractTableFromMarkdown(currentOutput))
        errors = validateSplitResult(parsed, qtBibleBook, qtLimit, qtStartPassage)

        if (errors.length < qtValidationErrors) {
          bestOutput = currentOutput
          qtValidationErrors = errors.length
        }
        if (errors.length === 0) {
          console.log(`[qt-split] 검증 통과 (재시도 ${attempt})`)
          break
        }
      }

      output = qtValidationErrors === 0 ? currentOutput : bestOutput
    }

    const respData: any = {
      output,
      modelUsed: model,
    }
    if (type === 'qt-split' && qtValidationErrors > 0) {
      respData.validationWarnings = true
      console.warn(`[qt-split] 최종 출력에 ${qtValidationErrors}개 오류 남음`)
    }

    return NextResponse.json({
      success: true,
      data: respData,
    })
  } catch (err: any) {
    console.error('POST /api/advanced/ai error:', err)
    return NextResponse.json({ success: false, error: err.message || '생성 실패' }, { status: 500 })
  }
}
