import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase'
import PptxGenJS from 'pptxgenjs'
import { PPT_THEMES, PPT_THEME_KEYS } from '@/lib/pptTheme'
import type { PPTThemeKey, PPTTheme } from '@/lib/pptTheme'
import type { PPTShare } from '@/types'

const MAX_CHARS_PER_SLIDE = 400

function splitContent(content: string): string[] {
  const trimmed = content.trim()
  if (!trimmed) return ['']
  if (trimmed.length <= MAX_CHARS_PER_SLIDE) return [trimmed]
  const parts: string[] = []
  const lines = trimmed.split(/\n/)
  let current = ''
  for (const line of lines) {
    if ((current + '\n' + line).trim().length > MAX_CHARS_PER_SLIDE && current) {
      parts.push(current.trim())
      current = line
    } else {
      current += (current ? '\n' : '') + line
    }
  }
  if (current.trim()) parts.push(current.trim())
  return parts
}

function getBulletItems(content: string): string[] {
  return content
    .split('\n')
    .map(l => l.replace(/^[•\-*]\s*/, '').trim())
    .filter(Boolean)
}

function addSlideNumber(s: any, num: number, total: number, T: PPTTheme) {
  s.addText(`${num} / ${total}`, {
    x: T.layout.marginX,
    y: T.layout.slideHeight - 0.5,
    w: T.layout.contentWidth,
    h: 0.4,
    fontSize: T.font.tiny,
    color: T.content.dividerColor,
    align: 'center',
    fontFace: T.font.face,
  })
}

const ICON_MAP: Record<string, string> = {
  heart: '❤', cross: '✝', book: '📖', star: '⭐',
  lightbulb: '💡', check: '✓', quote: '"', bible: '📖', pray: '🙏',
}

function buildPptx(slides: PPTShare[], title: string, passage: string, themeKey: PPTThemeKey): Promise<Blob> {
  const T = PPT_THEMES[themeKey]
  const pptx = new PptxGenJS()
  pptx.defineLayout({ name: 'WIDE_16x9', width: 13.333, height: 7.5 })
  pptx.layout = 'WIDE_16x9'
  pptx.author = 'Bunker 목양'
  pptx.title = title
  pptx.subject = passage
  pptx.company = 'Bunker 목양'

  const SW = T.layout.slideWidth
  const CX = T.layout.centerX
  const MX = T.layout.marginX
  const CW = T.layout.contentWidth
  const totalDisplaySlides = slides.slice(0, 14)

  // ─── 1. 표지 ───
  const cover = pptx.addSlide()
  cover.background = { fill: T.cover.bg }
  cover.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: SW, h: 0.12, fill: { color: T.cover.accentBg } as any,
  })
  cover.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0.12, w: SW, h: 0.04, fill: { color: T.content.accentColor } as any,
  })
  cover.addText('✝', {
    x: CX - 1.5, y: 0.6, w: 3, h: 1.0,
    fontSize: 44, color: T.cover.subtitleColor, align: 'center', fontFace: T.font.face,
  })
  cover.addText(title, {
    x: MX, y: 1.7, w: CW, h: 2.0,
    fontSize: T.font.coverTitle, color: T.cover.titleColor, bold: true, align: 'center',
    fontFace: T.font.face, shrinkText: true,
  })
  if (passage) {
    cover.addShape(pptx.ShapeType.rect, {
      x: CX - 1.5, y: 3.9, w: 3, h: 0.04, fill: { color: T.content.accentColor } as any,
    })
    cover.addText(passage, {
      x: MX, y: 4.1, w: CW, h: 0.9,
      fontSize: T.font.coverSubtitle, color: T.cover.subtitleColor, align: 'center',
      fontFace: T.font.face, shrinkText: true,
    })
  }
  cover.addText('Bunker 목양', {
    x: MX, y: 6.0, w: CW, h: 0.6,
    fontSize: T.font.small, color: T.cover.dateColor, align: 'center', fontFace: T.font.face,
  })

  // ─── 2. 목차 ───
  const toc = pptx.addSlide()
  toc.background = { fill: T.toc.bg }
  toc.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: SW, h: T.layout.accentBar, fill: { color: T.content.accentColor } as any,
  })
  toc.addText('목  차', {
    x: MX, y: 0.35, w: 3, h: 0.8,
    fontSize: T.font.tocTitle, bold: true, color: T.toc.titleColor, fontFace: T.font.face,
  })
  toc.addShape(pptx.ShapeType.rect, {
    x: MX, y: 1.2, w: 1.2, h: 0.04, fill: { color: T.content.accentColor } as any,
  })
  const tocItems = slides.slice(0, 10).map((s, i) => `${i + 1}.  ${s.title || ''}`)
  toc.addText(tocItems.join('\n'), {
    x: MX, y: 1.4, w: CW, h: 5.0,
    fontSize: T.font.tocItem, color: T.toc.itemColor, lineSpacing: 36,
    fontFace: T.font.face, paraSpaceAfter: 6, shrinkText: true,
  })

  // ─── 3. 내용 슬라이드 ───
  let slideNumber = 2
  const totalSlidesCount = 2 + totalDisplaySlides.length + 1

  for (let idx = 0; idx < totalDisplaySlides.length; idx++) {
    const slide = totalDisplaySlides[idx]
    const parts = splitContent(slide.content || '')
    const style = slide.style || 'list'
    const st = T.styles[style]
    const icon = ICON_MAP[slide.icon || ''] || ''

    for (let pi = 0; pi < parts.length; pi++) {
      slideNumber++
      const s = pptx.addSlide()
      s.background = { fill: st.bg }

      s.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: SW, h: T.layout.accentBar, fill: { color: st.accentBar } as any,
      })

      if (style === 'scripture') {
        if (icon) {
          s.addText(icon, {
            x: CX - 0.6, y: 1.0, w: 1.2, h: 0.8,
            fontSize: 36, color: st.accentBar, align: 'center', fontFace: T.font.face,
          })
        }
        s.addText(slide.title || '', {
          x: MX + 1, y: 1.8, w: CW - 2, h: 0.8,
          fontSize: T.font.scriptureTitle, bold: true, color: st.titleColor,
          fontFace: T.font.face, align: 'center', shrinkText: true,
        })
        s.addText(parts[pi], {
          x: MX + 1.2, y: 2.7, w: CW - 2.4, h: 3.5,
          fontSize: T.font.scriptureBody, color: st.bodyColor, lineSpacing: 38,
          fontFace: T.font.face, align: 'center', valign: 'top', paraSpaceAfter: 10, shrinkText: true,
        })
      } else if (style === 'highlight') {
        if (icon) {
          s.addText(icon, {
            x: MX + 0.3, y: T.layout.titleTop + 0.1, w: 0.6, h: 0.6,
            fontSize: 24, color: st.accentBar, fontFace: T.font.face,
          })
        }
        s.addText(slide.title || '', {
          x: MX + 1.0, y: T.layout.titleTop, w: CW - 1.0, h: T.layout.titleHeight,
          fontSize: T.font.title, bold: true, color: st.titleColor,
          fontFace: T.font.face, shrinkText: true,
        })
        const bullets = getBulletItems(parts[pi])
        const bulletHtml = bullets.map(b => `•  ${b}`).join('\n')
        s.addText(bulletHtml, {
          x: MX + 0.5, y: T.layout.contentTop + 0.2, w: CW - 1.0, h: T.layout.contentHeight - 0.2,
          fontSize: T.font.body + 4, color: st.bodyColor, lineSpacing: 42,
          fontFace: T.font.face, valign: 'top', paraSpaceAfter: 10, bold: true, shrinkText: true,
        })
      } else if (style === 'apply') {
        if (icon) {
          s.addText(icon, {
            x: MX + 0.3, y: T.layout.titleTop + 0.1, w: 0.6, h: 0.6,
            fontSize: 24, color: st.accentBar, fontFace: T.font.face,
          })
        }
        s.addText(slide.title || '', {
          x: MX + 1.0, y: T.layout.titleTop, w: CW - 1.0, h: T.layout.titleHeight,
          fontSize: T.font.title, bold: true, color: st.titleColor,
          fontFace: T.font.face, shrinkText: true,
        })
        const bullets = getBulletItems(parts[pi])
        const checkHtml = bullets.map(b => `✓  ${b}`).join('\n')
        s.addText(checkHtml, {
          x: MX + 0.5, y: T.layout.contentTop + 0.2, w: CW - 1.0, h: T.layout.contentHeight - 0.2,
          fontSize: T.font.body, color: st.bodyColor, lineSpacing: 38,
          fontFace: T.font.face, valign: 'top', paraSpaceAfter: 8, shrinkText: true,
        })
      } else {
        if (icon) {
          s.addText(icon, {
            x: MX + 0.3, y: T.layout.titleTop + 0.1, w: 0.6, h: 0.6,
            fontSize: 24, color: st.accentBar, fontFace: T.font.face,
          })
        }
        s.addShape(pptx.ShapeType.rect, {
          x: MX + 1, y: T.layout.titleTop + 0.15, w: 0.06, h: 0.45, fill: { color: st.accentBar } as any,
        })
        s.addText(slide.title || '', {
          x: MX + 1.2, y: T.layout.titleTop, w: CW - 1.2, h: T.layout.titleHeight,
          fontSize: T.font.title, bold: true, color: st.titleColor,
          fontFace: T.font.face, shrinkText: true,
        })
        s.addText(parts[pi], {
          x: MX + 0.5, y: T.layout.contentTop, w: CW - 1.0, h: T.layout.contentHeight,
          fontSize: T.font.body, color: st.bodyColor, lineSpacing: 36,
          fontFace: T.font.face, valign: 'top', paraSpaceAfter: 8, shrinkText: true,
        })
      }

      addSlideNumber(s, slideNumber, totalSlidesCount, T)
    }
  }

  // ─── 4. 마무리 ───
  const end = pptx.addSlide()
  slideNumber++
  end.background = { fill: T.end.bg }
  end.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: SW, h: 0.12, fill: { color: T.cover.subtitleColor } as any,
  })
  end.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0.12, w: SW, h: 0.04, fill: { color: T.content.accentColor } as any,
  })
  end.addText('✝', {
    x: CX - 1.5, y: 1.0, w: 3, h: 1.0,
    fontSize: 44, color: T.cover.subtitleColor, align: 'center', fontFace: T.font.face,
  })
  end.addText('은혜로운 설교 되셨기를 바랍니다', {
    x: MX, y: 2.2, w: CW, h: 1.0,
    fontSize: T.font.subtitle, color: T.end.subtitleColor, align: 'center',
    fontFace: T.font.face, shrinkText: true,
  })
  end.addShape(pptx.ShapeType.rect, {
    x: CX - 1.0, y: 3.4, w: 2.0, h: 0.04, fill: { color: T.end.iconColor } as any,
  })
  end.addText('Bunker 목양', {
    x: MX, y: 5.5, w: CW, h: 0.6,
    fontSize: T.font.small, color: T.cover.dateColor, align: 'center', fontFace: T.font.face,
  })

  return pptx.write({ outputType: 'nodebuffer' })
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const themeParam = request.nextUrl.searchParams.get('theme') || 'modern'
    const themeKey: PPTThemeKey = PPT_THEME_KEYS.includes(themeParam as PPTThemeKey)
      ? (themeParam as PPTThemeKey) : 'modern'

    const { data, error } = await supabaseAdmin
      .from('sermons')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: '설교를 찾을 수 없습니다.' }, { status: 404 })
    }

    const { data: { user } } = await createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll() {},
        },
      },
    ).auth.getUser()

    if (!user || !data.user_id || data.user_id !== user.id) {
      return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 })
    }

    const title = data.title || '설교'
    const passage = data.passage || ''
    const rawSlides: PPTShare[] =
      data.result?.pptData?.slides || data.result?.ppt?.slides || []

    if (rawSlides.length === 0) {
      return NextResponse.json({ error: 'PPT 데이터가 없습니다. 먼저 AI 생성을 완료해주세요.' }, { status: 400 })
    }

    // 구간 선택 (from/to, 0-based inclusive)
    const fromParam = request.nextUrl.searchParams.get('from')
    const toParam = request.nextUrl.searchParams.get('to')
    let selectedSlides = rawSlides
    if (fromParam !== null || toParam !== null) {
      const from = Math.max(0, parseInt(fromParam || '0', 10) || 0)
      const to = Math.min(rawSlides.length - 1, parseInt(toParam || `${rawSlides.length - 1}`, 10) || rawSlides.length - 1)
      if (from > to) {
        return NextResponse.json({ error: '잘못된 구간입니다.' }, { status: 400 })
      }
      selectedSlides = rawSlides.slice(from, to + 1)
    }

    const buffer = await buildPptx(selectedSlides, title, passage, themeKey)

    const blob = new Blob([buffer as unknown as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    })

    const safeFileName = title.replace(/[/\\?%*:|"<>]/g, '').trim() || '설교'
    const rangeSuffix = fromParam !== null || toParam !== null
      ? `_${(fromParam !== null ? fromParam : '0')}-${(toParam !== null ? toParam : `${rawSlides.length - 1}`)}`
      : ''
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(safeFileName)}${rangeSuffix}.pptx`,
      },
    })
  } catch (err: any) {
    console.error('PPT error:', err)
    return NextResponse.json({ error: 'PPT 생성 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
