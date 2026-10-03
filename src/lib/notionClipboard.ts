/**
 * 사역자 세컨드 브레인(Ministry Second Brain | PARA) Notion 전용 클립보드 유틸리티
 * 
 * ClipboardItem API를 활용하여 text/html과 text/plain을 동시에 복사합니다.
 * 노션에 붙여넣을 때 콜아웃(Callout), 토글, 헤딩, 불릿 리스트, 구분선 등으로 자동 변환됩니다.
 */

import type { Summary, GroupDiscussion, CardNews, PPTData } from '@/types'
import type { ContiSet, ContiItem } from '@/types/conti'

export interface NotionBlockData {
  title: string
  categoryTag?: string // 예: "🌿 AREAS", "📚 RESOURCES", "🎯 PROJECTS", "📦 ARCHIVES"
  targetDatabase: string // 예: "설교 아카이브 & 본문 주석 DB", "소그룹 성경나눔 & 구역공과 DB"
  summary?: string
  contentHtml: string
  plainText: string
}

/**
 * HTML 특수문자 이스케이프
 */
function esc(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * 줄바꿈 텍스트를 HTML 문단/줄바꿈으로 변환
 */
function textToHtmlParagraphs(text: string): string {
  if (!text) return ''
  const paragraphs = text.split(/\n{2,}/).filter(Boolean)
  return paragraphs
    .map((p) => `<p style="margin: 0 0 10px 0; line-height: 1.7; color: #37352f;">${esc(p).replace(/\n/g, '<br/>')}</p>`)
    .join('')
}

/**
 * Notion 리치 서식 복사 함수
 */
export async function copyNotionRichText(data: NotionBlockData): Promise<boolean> {
  const formattedHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #37352f;">
      <div style="background-color: #f7f6f3; padding: 14px 18px; border-radius: 6px; border-left: 4px solid #2eaadc; margin-bottom: 16px;">
        <div style="font-size: 1.15em; font-weight: 700; color: #191711; margin-bottom: 4px;">🏛️ ${esc(data.title)}</div>
        <div style="font-size: 0.88em; color: #787774;">📂 저장 위치: <span style="font-weight: 600; color: #2eaadc;">${esc(data.categoryTag || '📚 RESOURCES')}</span> &gt; <strong>${esc(data.targetDatabase)}</strong></div>
      </div>
      ${data.summary ? `<blockquote style="margin: 0 0 16px 0; padding: 10px 14px; border-left: 3px solid #787774; background-color: #fbfbfa; color: #4f4d47; font-style: italic;">💡 <strong>핵심 개요:</strong> ${esc(data.summary)}</blockquote>` : ''}
      <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
      ${data.contentHtml}
      <hr style="border: 0; border-top: 1px dashed #e8e8e8; margin: 24px 0 12px 0;" />
      <p style="font-size: 0.78em; color: #9b9a97; margin: 0;">⚡ Generated via <strong>Bunker 목양 x 사역자 세컨드 브레인</strong> (PARA 결합)</p>
    </div>
  `

  const fallbackPlain = `[🏛️ 사역자 세컨드 브레인: ${data.categoryTag || ''} > ${data.targetDatabase}]\n# ${data.title}\n\n${data.summary ? `> ${data.summary}\n\n` : ''}${data.plainText}\n\n(Generated via Bunker 목양)`

  try {
    if (typeof window !== 'undefined' && navigator.clipboard && window.ClipboardItem) {
      const blobHtml = new Blob([formattedHtml], { type: 'text/html' })
      const blobText = new Blob([data.plainText || fallbackPlain], { type: 'text/plain' })
      const item = new ClipboardItem({
        'text/html': blobHtml,
        'text/plain': blobText,
      })
      await navigator.clipboard.write([item])
      return true
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(data.plainText || fallbackPlain)
      return true
    }
    return false
  } catch (err) {
    console.error('Failed to copy rich text to Notion format:', err)
    try {
      await navigator.clipboard.writeText(data.plainText || fallbackPlain)
      return true
    } catch {
      return false
    }
  }
}

// ─────────────────────────────────────────────────────────────
// 각 생성 결과물별 사역자 세컨드 브레인(PARA) 1:1 포맷터
// ─────────────────────────────────────────────────────────────

/**
 * 1. 설교 요약 (Summary) -> 📚 RESOURCES > 설교 아카이브 & 성경 본문 주석 DB
 */
export function formatSummaryForNotion(sermonTitle: string, passageText: string | undefined, summary: Summary): NotionBlockData {
  const sections = [
    { label: '중심 주제', val: summary.central_topic, color: '#2eaadc' },
    { label: '서론', val: summary.intro, color: '#4f4d47' },
    { label: '본론', val: summary.body, color: '#4f4d47' },
    { label: '결론', val: summary.conclusion, color: '#4f4d47' },
    { label: '적용', val: summary.application, color: '#0f7b6c' },
  ]

  let html = ''
  if (passageText || summary.passage_text) {
    const pText = passageText || summary.passage_text || ''
    html += `
      <div style="background-color: #fefce8; padding: 12px 16px; border-radius: 4px; border-left: 4px solid #eab308; margin-bottom: 18px;">
        <div style="font-size: 0.9em; font-weight: 700; color: #92400e; margin-bottom: 4px;">📖 성경 본문 (개역개정)</div>
        <p style="margin: 0; font-style: italic; color: #451a03; line-height: 1.7;">${esc(pText)}</p>
      </div>
    `
  }

  sections.forEach((sec) => {
    if (!sec.val) return
    html += `
      <div style="margin-bottom: 18px;">
        <h3 style="font-size: 1.1em; color: ${sec.color}; margin: 0 0 6px 0; font-weight: 700;">📌 ${sec.label}</h3>
        <div style="padding-left: 8px; border-left: 2px solid #eaeaea;">
          ${textToHtmlParagraphs(sec.val)}
        </div>
      </div>
    `
  })

  const plain = [
    `제목: ${sermonTitle}`,
    passageText || summary.passage_text ? `본문:\n${passageText || summary.passage_text}` : '',
    `중심 주제: ${summary.central_topic || ''}`,
    `서론:\n${summary.intro || ''}`,
    `본론:\n${summary.body || ''}`,
    `결론:\n${summary.conclusion || ''}`,
    `적용:\n${summary.application || ''}`,
  ].filter(Boolean).join('\n\n')

  return {
    title: sermonTitle ? `[설교 요약] ${sermonTitle}` : '설교 요약',
    categoryTag: '📚 RESOURCES',
    targetDatabase: '설교 아카이브 & 성경 본문 주석 DB',
    summary: summary.central_topic || undefined,
    contentHtml: html,
    plainText: plain,
  }
}

/**
 * 2. 소그룹 나눔 (Group Discussion) -> 📚 RESOURCES > 소그룹 성경나눔 & 구역공과 DB
 */
export function formatGroupDiscussionForNotion(sermonTitle: string, passageText: string | undefined, gd: GroupDiscussion): NotionBlockData {
  let html = `
    <div style="background-color: #f0fdf4; padding: 12px 16px; border-radius: 4px; border-left: 4px solid #16a34a; margin-bottom: 16px;">
      <strong>🎯 전체 나눔 방향:</strong>
      <ul style="margin: 6px 0 0 0; padding-left: 20px; line-height: 1.6;">
        ${gd.directionPoints.map((dp) => `<li>${esc(dp)}</li>`).join('')}
      </ul>
    </div>
  `

  if (gd.summary) {
    html += `
      <div style="margin-bottom: 16px;">
        <h3 style="font-size: 1.05em; color: #15803d; margin: 0 0 4px 0;">💬 본문 핵심 요약</h3>
        <p style="margin: 0; color: #37352f; line-height: 1.7;">${esc(gd.summary)}</p>
      </div>
    `
  }

  const ageGroups: { key: keyof Pick<GroupDiscussion, 'teens' | 'twentiesThirties' | 'forties' | 'fiftiesSixties' | 'seventiesPlus'>; label: string; icon: string }[] = [
    { key: 'teens', label: '청소년부 나눔', icon: '🏫' },
    { key: 'twentiesThirties', label: '청년·2030 나눔', icon: '✨' },
    { key: 'forties', label: '3040·중년 나눔', icon: '🌿' },
    { key: 'fiftiesSixties', label: '장년·5060 나눔', icon: '📖' },
    { key: 'seventiesPlus', label: '시니어·실버 나눔', icon: '🕊️' },
  ]

  html += `<h3 style="font-size: 1.15em; font-weight: 700; margin: 20px 0 10px 0; color: #191711;">👥 연령별 맞춤 질문 & 나눔 교재</h3>`

  ageGroups.forEach((g) => {
    const mat = gd[g.key]
    if (!mat) return
    html += `
      <div style="background: #ffffff; border: 1px solid #e5e5e5; border-radius: 6px; padding: 14px 16px; margin-bottom: 14px;">
        <div style="font-size: 1em; font-weight: 700; color: #2eaadc; margin-bottom: 8px;">${g.icon} ${g.label}: "${esc(mat.customTitle || '')}"</div>
        <p style="font-size: 0.9em; color: #6b7280; margin: 0 0 10px 0;">🎯 적용 초점: ${esc(mat.targetFocus || '')}</p>
        <div style="font-size: 0.95em; font-weight: 600; color: #374151; margin-bottom: 4px;">질문 리스트:</div>
        <ol style="margin: 0; padding-left: 20px; line-height: 1.7;">
          ${mat.iceBreak ? `<li><strong>[아이스브레이크]</strong> ${esc(mat.iceBreak)}</li>` : ''}
          ${mat.questions.map((q) => `<li>${esc(q)}</li>`).join('')}
        </ol>
      </div>
    `
  })

  if (gd.closingQuestions && gd.closingQuestions.length > 0) {
    html += `
      <div style="margin-top: 18px;">
        <h4 style="font-size: 1.05em; font-weight: 700; color: #37352f; margin: 0 0 6px 0;">🤝 공통 마무리 질문</h4>
        <ol style="margin: 0 0 14px 0; padding-left: 20px; line-height: 1.7;">
          ${gd.closingQuestions.map((cq) => `<li>${esc(cq)}</li>`).join('')}
        </ol>
      </div>
    `
  }

  if (gd.representativePrayer) {
    html += `
      <div style="background-color: #fdfbf7; border-left: 4px solid #d97706; padding: 12px 16px; border-radius: 4px; margin-top: 14px;">
        <div style="font-size: 0.9em; font-weight: 700; color: #92400e; margin-bottom: 4px;">🙏 소그룹 마무리 대표기도문</div>
        <p style="margin: 0; line-height: 1.7; color: #451a03; font-style: italic;">${esc(gd.representativePrayer)}</p>
      </div>
    `
  }

  const plain = [
    `제목: ${gd.title}`,
    `본문: ${gd.passage} | 주제: ${gd.topic}`,
    `\n[전체 나눔 방향]\n` + gd.directionPoints.map((p, i) => `${i + 1}. ${p}`).join('\n'),
    `\n[본문 핵심 요약]\n${gd.summary}`,
    ...ageGroups.map((g) => {
      const mat = gd[g.key]
      if (!mat) return ''
      return `\n[${g.label} - ${mat.customTitle}]\n초점: ${mat.targetFocus}\n` + mat.questions.map((q, i) => `  ${i + 1}) ${q}`).join('\n')
    }),
    `\n[마무리 질문]\n` + (gd.closingQuestions || []).map((q, i) => `${i + 1}. ${q}`).join('\n'),
    `\n[대표기도문]\n${gd.representativePrayer}`,
  ].filter(Boolean).join('\n')

  return {
    title: sermonTitle ? `[소그룹 공과] ${sermonTitle}` : gd.title,
    categoryTag: '📚 RESOURCES',
    targetDatabase: '소그룹 성경나눔 & 구역공과 DB',
    summary: gd.summary || gd.topic,
    contentHtml: html,
    plainText: plain,
  }
}

/**
 * 3. 카드뉴스 기획안 (Card News) -> 📚 RESOURCES > 교회 SNS & 미디어 콘텐츠 아카이브
 */
export function formatCardNewsForNotion(sermonTitle: string, cardNews: CardNews): NotionBlockData {
  let html = `
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; margin-bottom: 16px;">
      <strong>📱 인스타그램 / 교회 SNS 카드뉴스 기획안 (총 ${cardNews.slides.length}장 구성)</strong>
    </div>
  `

  html += `<div style="display: grid; gap: 12px;">`
  cardNews.slides.forEach((slide) => {
    html += `
      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px 16px; margin-bottom: 10px;">
        <div style="font-weight: 700; color: #4f46e5; margin-bottom: 4px;">🎴 [카드 ${slide.pageNumber}] ${esc(slide.title)}</div>
        <p style="margin: 0 0 6px 0; line-height: 1.6; color: #1f2937;">${esc(slide.content)}</p>
        ${slide.verse ? `<div style="font-size: 0.85em; color: #6b7280; font-style: italic;">📖 본문: ${esc(slide.verse)}</div>` : ''}
        ${slide.actionItem ? `<div style="font-size: 0.85em; color: #059669; font-weight: 600; margin-top: 4px;">✓ 적용 포인트: ${esc(slide.actionItem)}</div>` : ''}
      </div>
    `
  })
  html += `</div>`

  const plain = cardNews.slides
    .map((s) => `[카드 ${s.pageNumber}] ${s.title}\n내용: ${s.content}${s.verse ? `\n본문: ${s.verse}` : ''}${s.actionItem ? `\n적용: ${s.actionItem}` : ''}`)
    .join('\n\n')

  return {
    title: sermonTitle ? `[카드뉴스 기획안] ${sermonTitle}` : '교회 SNS 카드뉴스 기획안',
    categoryTag: '📚 RESOURCES',
    targetDatabase: '교회 SNS & 미디어 콘텐츠 아카이브',
    summary: `${cardNews.slides.length}장 구성 카드뉴스 기획안`,
    contentHtml: html,
    plainText: plain,
  }
}

/**
 * 4. 유튜브 설교 대본 / 쇼츠 대본 -> 📚 RESOURCES > 영상 설교 & 유튜브 미디어 대본 DB
 */
export function formatScriptForNotion(sermonTitle: string, scriptText: string, isShorts: boolean): NotionBlockData {
  const paragraphs = scriptText.split('\n\n').filter(Boolean)
  let html = ''

  paragraphs.forEach((p) => {
    const lines = p.split('\n').filter(Boolean)
    html += `<div style="margin-bottom: 14px; padding: 10px 14px; background: #ffffff; border: 1px solid #f0f0f0; border-radius: 6px;">`
    lines.forEach((line) => {
      html += `<p style="margin: 0 0 6px 0; line-height: 1.8; color: #2c2a29;">${esc(line)}</p>`
    })
    html += `</div>`
  })

  return {
    title: isShorts
      ? (sermonTitle ? `[유튜브 쇼츠 대본] ${sermonTitle}` : '유튜브 쇼츠 대본')
      : (sermonTitle ? `[유튜브 설교 대본] ${sermonTitle}` : '유튜브 설교 전문 대본'),
    categoryTag: '📚 RESOURCES',
    targetDatabase: isShorts ? '숏폼 & 릴스/쇼츠 사역 대본 DB' : '영상 설교 & 유튜브 미디어 대본 DB',
    summary: isShorts ? '1분 숏폼/릴스 영상용 압축 대본' : '유튜브 풀버전 설교 방송 대본',
    contentHtml: html,
    plainText: scriptText,
  }
}

/**
 * 5. PPT 슬라이드 데이터 -> 📚 RESOURCES > 예배 & 강의 PPT 템플릿 보관소
 */
export function formatPptForNotion(sermonTitle: string, pptData: PPTData): NotionBlockData {
  const slides = pptData.slides || []
  let html = `
    <div style="background: #fdf4ff; border: 1px solid #f0abfc; border-radius: 6px; padding: 12px 16px; margin-bottom: 16px;">
      <strong>🖥️ 예배/강의 PPT 슬라이드 구성안 (총 ${slides.length}장)</strong>
    </div>
    <div style="display: grid; gap: 10px;">
  `

  slides.forEach((slide) => {
    html += `
      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px 16px; margin-bottom: 8px;">
        <div style="font-weight: 700; color: #9333ea; margin-bottom: 4px;">Slide ${slide.slideNumber}: ${esc(slide.title)}</div>
        <div style="font-size: 0.92em; color: #4b5563; line-height: 1.6; white-space: pre-wrap;">${esc(slide.content)}</div>
      </div>
    `
  })
  html += `</div>`

  const plain = slides
    .map((s) => `[Slide ${s.slideNumber}] ${s.title}\n${s.content}`)
    .join('\n\n')

  return {
    title: sermonTitle ? `[예배 PPT 기획안] ${sermonTitle}` : '예배 PPT 슬라이드 기획안',
    categoryTag: '📚 RESOURCES',
    targetDatabase: '예배 & 강의 PPT 템플릿 보관소',
    summary: `총 ${slides.length}슬라이드 구성안`,
    contentHtml: html,
    plainText: plain,
  }
}

/**
 * 6. 교회학교 / 사역 공지문 -> 🎯 PROJECTS > 부서 공지 & 발송 관리 DB
 */
export function formatNoticeForNotion(params: {
  title: string
  versionTitle: string
  versionTag: string
  content: string
  situation?: string
  target?: string
  tone?: string
}): NotionBlockData {
  const html = `
    <div style="background-color: #eff6ff; padding: 12px 16px; border-radius: 6px; border-left: 4px solid #3b82f6; margin-bottom: 16px;">
      <div style="font-size: 0.9em; color: #1e40af; margin-bottom: 4px;">
        <strong>발송 유형:</strong> ${esc(params.versionTitle)} (${esc(params.versionTag)})
      </div>
      ${params.situation || params.target ? `
        <div style="font-size: 0.85em; color: #60a5fa;">
          상황: ${esc(params.situation || '일반')} | 대상: ${esc(params.target || '전체 성도')} | 어조: ${esc(params.tone || '친근하고 따뜻한')}
        </div>
      ` : ''}
    </div>
    <div style="background-color: #ffffff; border: 1px solid #dbeafe; border-radius: 6px; padding: 16px; font-size: 1em; line-height: 1.7; color: #1e293b; white-space: pre-wrap;">
${esc(params.content)}
    </div>
  `

  const plain = `[${params.versionTitle} - ${params.versionTag}]\n\n${params.content}`

  return {
    title: `[공지문] ${params.title || params.versionTitle}`,
    categoryTag: '🎯 PROJECTS',
    targetDatabase: '부서 공지 & 발송 관리 DB',
    summary: `${params.versionTitle} (${params.versionTag})`,
    contentHtml: html,
    plainText: plain,
  }
}

/**
 * 7. 찬양 콘티 (Conti Set) -> 🌿 AREAS > 찬양 사역팀 & 주간 콘티 허브
 */
export function formatContiForNotion(conti: ContiSet, items: ContiItem[] = []): NotionBlockData {
  const worshipLabelMap: Record<string, string> = {
    sunday_am: '주일 오전 예배',
    sunday_pm: '주일 오후 찬양예배',
    wednesday: '수요 예배',
    dawn: '새벽 기도회',
    special: '특별 예배 / 집회',
  }
  const wLabel = worshipLabelMap[conti.worship_type] || conti.worship_type

  let html = `
    <div style="background-color: #f5f3ff; padding: 12px 16px; border-radius: 6px; border-left: 4px solid #8b5cf6; margin-bottom: 16px;">
      <div style="font-size: 1.05em; font-weight: 700; color: #5b21b6; margin-bottom: 4px;">🎵 ${esc(conti.title)}</div>
      <div style="font-size: 0.88em; color: #7c3aed;">
        예배: <strong>${esc(wLabel)}</strong> | 일시: <strong>${esc(conti.date || '날짜 미정')}</strong>
      </div>
      ${conti.memo ? `<p style="margin: 6px 0 0 0; font-size: 0.9em; color: #6d28d9;">📝 메모: ${esc(conti.memo)}</p>` : ''}
    </div>
  `

  if (items && items.length > 0) {
    html += `
      <h3 style="font-size: 1.1em; font-weight: 700; color: #1f2937; margin: 18px 0 10px 0;">🎶 찬양 순서 (Song Setlist)</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 0.95em;">
        <thead>
          <tr style="background-color: #f3f4f6; text-align: left; border-bottom: 2px solid #e5e7eb;">
            <th style="padding: 8px 12px;">#</th>
            <th style="padding: 8px 12px;">곡명</th>
            <th style="padding: 8px 12px;">Key</th>
            <th style="padding: 8px 12px;">BPM</th>
            <th style="padding: 8px 12px;">인도/전환 메모</th>
          </tr>
        </thead>
        <tbody>
    `
    items.forEach((it, idx) => {
      const songTitle = it.song?.title || `곡 ${idx + 1}`
      html += `
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 8px 12px; font-weight: 700; color: #6b7280;">${idx + 1}</td>
          <td style="padding: 8px 12px; font-weight: 600; color: #111827;">${esc(songTitle)}</td>
          <td style="padding: 8px 12px; color: #4f46e5; font-weight: 700;">${esc(it.key || it.song?.original_key || '-')}</td>
          <td style="padding: 8px 12px; color: #6b7280;">${it.bpm_override || it.song?.bpm || '-'}</td>
          <td style="padding: 8px 12px; color: #4b5563; font-size: 0.9em;">${esc(it.transition_memo || it.memo || '-')}</td>
        </tr>
      `
    })
    html += `</tbody></table>`
  }

  const plain = [
    `콘티 제목: ${conti.title}`,
    `예배: ${wLabel} | 날짜: ${conti.date || '미정'}`,
    conti.memo ? `메모: ${conti.memo}` : '',
    items && items.length > 0 ? '\n[찬양 순서]\n' + items.map((it, i) => `${i + 1}. ${it.song?.title || '곡'} (Key: ${it.key || '-'}, BPM: ${it.bpm_override || '-'}) - ${it.transition_memo || ''}`).join('\n') : '',
  ].filter(Boolean).join('\n')

  return {
    title: `[콘티] ${conti.title}`,
    categoryTag: '🌿 AREAS',
    targetDatabase: '찬양 사역팀 & 주간 콘티 허브',
    summary: `${wLabel} (${conti.date || ''})`,
    contentHtml: html,
    plainText: plain,
  }
}
