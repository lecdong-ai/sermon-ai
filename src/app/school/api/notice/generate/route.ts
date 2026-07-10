import { NextResponse } from 'next/server';
import { noticeTemplates, NoticeTemplate } from '@/data/school/notice-templates';

const SITUATION_MAP: Record<string, string> = {
  welcome: '새가족 환영',
  absence: '결석 학생 가정 연락',
  event: '여름성경학교/행사 공지',
  remind: '행사 전날 리마인드',
  thanks: '감사 메시지',
  teacher: '교사 모임 공지',
};

const TARGET_MAP: Record<string, string> = {
  kinder_parents: '유치부 학부모님',
  elem_parents: '초등부 학부모님',
  teen_parents: '중고등부 학부모님',
  teachers: '교사',
  all: '전체 공지 대상자',
};

const TONE_MAP: Record<string, string> = {
  warm: '따뜻하고 은혜로운 신앙 고백적 말투',
  formal: '정중하고 격식 있는 공식 안내용 말투',
  friendly: '친근하고 다정하며 은혜 가득한 말투',
  simple: '핵심만 요약된 간결하고 부드러운 말투',
};

// 룰 베이스 및 플레이스홀더 치환 폴백 생성기
function generateFallbackNotices(situation: string, target: string, tone: string, extra: string) {
  // 1. 상황, 대상, 톤이 매치되는 템플릿 탐색
  let matched = noticeTemplates.find(
    t => t.situation === situation && t.target === target && t.tone === tone && t.isActive
  );

  // 2. 안 맞으면 상황과 대상 매치 탐색
  if (!matched) {
    matched = noticeTemplates.find(
      t => t.situation === situation && t.target === target && t.isActive
    );
  }

  // 3. 그래도 안 맞으면 상황 매치 탐색
  if (!matched) {
    matched = noticeTemplates.find(
      t => t.situation === situation && t.isActive
    );
  }

  // 4. 최종 폴백
  const template = matched || noticeTemplates[0];

  // 치환 엔진
  const replacePlaceholders = (text: string) => {
    let result = text;
    // extra가 빈칸이 아니면 첫 어절을 이름으로 치환
    const nameMatch = extra ? extra.trim().split(' ')[0] : '하준이';
    result = result.replace(/\[자녀이름\]/g, nameMatch);
    result = result.replace(/\[학부모님 성함\]/g, '학부모님');
    result = result.replace(/\[선생님 이름\]/g, '김교사');

    // 만약 추가 정보가 있고 템플릿에 직접 녹아있지 않다면 하단 가이드로 병합
    if (extra && !text.includes(extra)) {
      result += `\n\n📌 추가 안내사항: ${extra}`;
    }
    return result;
  };

  return {
    version1: replacePlaceholders(template.shortVersion),
    version2: replacePlaceholders(template.kakaoVersion),
    version3: replacePlaceholders(template.detailVersion),
    version4: replacePlaceholders(template.remindVersion),
  };
}

export async function POST(req: Request) {
  try {
    const { situation, target, tone, extra } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    
    // API 키 미작동 시 룰 베이스 고품질 폴백 작동
    if (!apiKey) {
      const fallback = generateFallbackNotices(situation, target, tone, extra);
      return NextResponse.json({ success: true, ...fallback, isMock: true });
    }

    const sitKorean = SITUATION_MAP[situation] || situation;
    const tgtKorean = TARGET_MAP[target] || target;
    const toneKorean = TONE_MAP[tone] || tone;

    // Gemini API 호출 시도
    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `당신은 교회학교 사역자(전도사, 부장교사)를 돕는 친절하고 전문적인 AI 행정 비서입니다.
다음 조건에 따라 실제 교회 현장에서 사용할 수 있는 자연스럽고 은혜로운 한국어 공지문 4가지 버전(짧은 문자형, 카톡 공지형, 상세 안내형, 리마인드형)을 작성해주세요.

- 상황: ${sitKorean}
- 대상: ${tgtKorean}
- 말투/톤: ${toneKorean}
- 추가 기입 정보: ${extra || '(없음)'}

[주의사항]
- 지나치게 기계적인 번역투나 상투적인 어조를 피하고, 교회학교 현장 정서에 맞는 다정하고 따뜻한 표현을 활용하세요.
- 4가지 결과 유형의 특징:
  1. version1 (짧은 문자형): 80~120자 내외의 깔끔한 SMS 전송용.
  2. version2 (카톡 공지형): 이모티콘과 가독성 높은 줄바꿈이 가미된 친교 소통형.
  3. version3 (상세 안내형): 일시, 장소, 지참물, 상세 설명이 번호 목록으로 정리된 공식 안내문 형태.
  4. version4 (리마인드형): 행사 하루 전 또는 출발 전 최종 체크리스트와 은혜를 되새기는 격려 알림 형태.

출력은 반드시 JSON 형식으로만 작성하세요. 마크다운 코드블록이나 백틱(\`\`\`) 없이 순수 JSON만 반환해야 합니다. 다른 사족이나 설명 텍스트를 절대 붙이지 마세요.
스키마는 다음과 같아야 합니다:
{
  "version1": "짧은 문자형 공지문 (줄바꿈은 \\n 사용)",
  "version2": "카톡 공지형 공지문 (줄바꿈은 \\n 사용)",
  "version3": "상세 안내형 공지문 (줄바꿈은 \\n 사용)",
  "version4": "리마인드형 공지문 (줄바꿈은 \\n 사용)"
}`
                    }
                  ]
                }
              ],
              generationConfig: {
                responseMimeType: "application/json"
              }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            return NextResponse.json({ success: true, ...parsed });
          }
        }
      } catch (e) {
        console.error('Gemini API Error:', e);
      }
    }

    // OpenAI API 호출 시도
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'system',
                content: `당신은 교회학교 사역자를 돕는 스마트하고 따뜻한 AI 비서입니다.
실제 교회 부서에서 바로 복사하여 발송할 수 있도록 수준 높은 4종 공지문(짧은 문자형, 카톡 공지형, 상세 안내형, 리마인드형)을 자연스럽게 한국어로 작성해야 합니다.
반드시 아래 형태의 JSON 객체로만 응답하세요:
{
  "version1": "짧은 문자형 본문",
  "version2": "카톡 공지형 본문",
  "version3": "상세 안내형 본문",
  "version4": "리마인드형 본문"
}`
              },
              {
                role: 'user',
                content: `상황: ${sitKorean}, 대상: ${tgtKorean}, 톤: ${toneKorean}, 추가정보: ${extra}`
              }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            return NextResponse.json({ success: true, ...parsed });
          }
        }
      } catch (e) {
        console.error('OpenAI API Error:', e);
      }
    }

    // 폴백
    const fallback = generateFallbackNotices(situation, target, tone, extra);
    return NextResponse.json({ success: true, ...fallback, isMock: true });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
