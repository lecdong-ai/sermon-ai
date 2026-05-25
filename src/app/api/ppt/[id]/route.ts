import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase'
import PptxGenJS from 'pptxgenjs'
import { PPT_THEME as T } from '@/lib/pptTheme'

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

function isScriptureSlide(index: number): boolean {
  return index === 1
}

function isApplySlide(title: string): boolean {
  const keywords = ['적용', '실천', '결단']
  return keywords.some((k) => title.includes(k))
}

function addSlideNumber(s: any, num: number, total: number) {
  s.addText(`${num} / ${total}`, {
    x: T.layout.marginX,
    y: 6.5,
    w: T.layout.contentWidth,
    h: 0.4,
    fontSize: T.font.tiny,
    color: T.content.dividerColor,
    align: 'center',
    fontFace: T.font.face,
  })
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
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
    const rawSlides: { title?: string; content?: string }[] =
      data.result?.pptData?.slides || data.result?.ppt?.slides || []

    if (rawSlides.length === 0) {
      return NextResponse.json({ error: 'PPT 데이터가 없습니다. 먼저 AI 생성을 완료해주세요.' }, { status: 400 })
    }

    const pptx = new PptxGenJS()
    pptx.defineLayout({ name: 'CUSTOM_4x3', width: 10, height: 7.5 })
    pptx.layout = 'CUSTOM_4x3'
    pptx.author = '목회자 AI 솔루션'
    pptx.title = title
    pptx.subject = passage
    pptx.company = '목회자 AI 솔루션'

    const SW = T.layout.slideWidth
    const CX = T.layout.centerX
    const MX = T.layout.marginX
    const CW = T.layout.contentWidth
    const totalDisplaySlides = rawSlides.slice(0, 14)

    // ─── 1. 표지 ───
    const cover = pptx.addSlide()
    cover.background = { fill: T.cover.bg }
    cover.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: SW, h: 0.14,
      fill: { color: T.cover.accentBg } as any,
    })
    cover.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0.14, w: SW, h: 0.05,
      fill: { color: T.content.accentColor } as any,
    })
    cover.addText('✝', {
      x: CX - 1.2, y: 0.8, w: 2.4, h: 1.0,
      fontSize: 40, color: T.cover.subtitleColor, align: 'center', fontFace: T.font.face,
    })
    cover.addText(title, {
      x: MX, y: 1.9, w: CW, h: 1.8,
      fontSize: T.font.coverTitle, color: T.cover.titleColor, bold: true, align: 'center',
      fontFace: T.font.face, shrinkText: true,
    })
    if (passage) {
      cover.addShape(pptx.ShapeType.rect, {
        x: CX - 1.5, y: 3.9, w: 3, h: 0.05,
        fill: { color: T.content.accentColor } as any,
      })
      cover.addText(passage, {
        x: MX, y: 4.1, w: CW, h: 0.9,
        fontSize: T.font.coverSubtitle, color: T.cover.subtitleColor, align: 'center',
        fontFace: T.font.face, shrinkText: true,
      })
    }
    cover.addText('목회자 AI 솔루션', {
      x: MX, y: 5.8, w: CW, h: 0.6,
      fontSize: T.font.small, color: T.cover.dateColor, align: 'center', fontFace: T.font.face,
    })

    // ─── 2. 목차 ───
    const toc = pptx.addSlide()
    toc.background = { fill: T.toc.bg }
    toc.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: SW, h: T.layout.accentBar,
      fill: { color: T.content.accentColor } as any,
    })
    toc.addText('목  차', {
      x: MX, y: 0.35, w: 3, h: 0.8,
      fontSize: T.font.tocTitle, bold: true, color: T.toc.titleColor, fontFace: T.font.face,
    })
    toc.addShape(pptx.ShapeType.rect, {
      x: MX, y: 1.2, w: 1.2, h: 0.05,
      fill: { color: T.content.accentColor } as any,
    })
    const tocItems = rawSlides.slice(0, 10).map((s, i) => `${i + 1}.  ${s.title || ''}`)
    toc.addText(tocItems.join('\n'), {
      x: MX, y: 1.4, w: CW, h: 4.8,
      fontSize: T.font.tocItem, color: T.toc.itemColor, lineSpacing: 34,
      fontFace: T.font.face, paraSpaceAfter: 6, shrinkText: true,
    })

    // ─── 3. 내용 슬라이드 ───
    let slideNumber = 2
    const totalSlidesCount = 2 + totalDisplaySlides.length + 1

    for (let idx = 0; idx < totalDisplaySlides.length; idx++) {
      const slide = totalDisplaySlides[idx]
      const parts = splitContent(slide.content || '')
      const isScripture = isScriptureSlide(idx)
      const isApply = isApplySlide(slide.title || '')

      for (let pi = 0; pi < parts.length; pi++) {
        slideNumber++
        const s = pptx.addSlide()

        if (isScripture) {
          s.background = { fill: T.scripture.bg }
          s.addShape(pptx.ShapeType.rect, {
            x: 0, y: 0, w: SW, h: T.layout.accentBar,
            fill: { color: T.content.accentColor } as any,
          })
          s.addText('📖 ' + (slide.title || ''), {
            x: MX, y: T.layout.titleTop, w: CW, h: T.layout.titleHeight,
            fontSize: T.font.scriptureTitle, bold: true, color: T.scripture.titleColor,
            fontFace: T.font.face, shrinkText: true,
          })
          s.addText(parts[pi], {
            x: MX + 0.2, y: T.layout.contentTop, w: CW - 0.4, h: T.layout.contentHeight,
            fontSize: T.font.scriptureBody, color: T.scripture.bodyColor, lineSpacing: 34,
            fontFace: T.font.face, valign: 'top', paraSpaceAfter: 8, shrinkText: true,
          })
        } else {
          s.background = { fill: isApply ? T.apply.bg : T.content.bg }

          const colors = [T.content.accentColor, '38A169', 'D69E2E', '9F7AEA', 'E53E3E']
          const barColor = colors[idx % colors.length]
          s.addShape(pptx.ShapeType.rect, {
            x: 0, y: 0, w: SW, h: T.layout.accentBar,
            fill: { color: barColor } as any,
          })
          s.addShape(pptx.ShapeType.rect, {
            x: MX, y: T.layout.titleTop + 0.05, w: 0.08, h: 0.5,
            fill: { color: barColor } as any,
          })

          const titleColor = isApply ? T.apply.titleColor : T.content.titleColor
          const bodyColor = isApply ? T.apply.bodyColor : T.content.bodyColor

          s.addText(slide.title || '', {
            x: MX + 0.25, y: T.layout.titleTop, w: CW - 0.25, h: T.layout.titleHeight,
            fontSize: T.font.title, bold: true, color: titleColor,
            fontFace: T.font.face, shrinkText: true,
          })
          s.addText(parts[pi], {
            x: MX + 0.25, y: T.layout.contentTop, w: CW - 0.5, h: T.layout.contentHeight,
            fontSize: T.font.body, color: bodyColor, lineSpacing: 36,
            fontFace: T.font.face, valign: 'top', paraSpaceAfter: 8, shrinkText: true,
          })
        }

        addSlideNumber(s, slideNumber, totalSlidesCount)
      }
    }

    // ─── 4. 마무리 ───
    const end = pptx.addSlide()
    slideNumber++
    end.background = { fill: T.end.bg }
    end.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: SW, h: 0.14,
      fill: { color: T.end.subtitleColor } as any,
    })
    end.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0.14, w: SW, h: 0.05,
      fill: { color: T.content.accentColor } as any,
    })
    end.addText('✝', {
      x: CX - 1.2, y: 1.2, w: 2.4, h: 1.0,
      fontSize: 40, color: T.cover.subtitleColor, align: 'center', fontFace: T.font.face,
    })
    end.addText('감사합니다', {
      x: MX, y: 2.3, w: CW, h: 1.5,
      fontSize: T.font.coverTitle, color: T.end.titleColor, bold: true, align: 'center',
      fontFace: T.font.face, shrinkText: true,
    })
    end.addShape(pptx.ShapeType.rect, {
      x: CX - 1.0, y: 3.9, w: 2.0, h: 0.05,
      fill: { color: T.end.iconColor } as any,
    })
    end.addText('은혜로운 설교 되셨기를 바랍니다', {
      x: MX, y: 4.1, w: CW, h: 0.9,
      fontSize: T.font.subtitle, color: T.end.subtitleColor, align: 'center',
      fontFace: T.font.face, shrinkText: true,
    })
    end.addText('목회자 AI 솔루션', {
      x: MX, y: 5.8, w: CW, h: 0.6,
      fontSize: T.font.small, color: T.cover.dateColor, align: 'center', fontFace: T.font.face,
    })

    const buffer = await pptx.write({ outputType: 'nodebuffer' })
    const blob = new Blob([buffer as unknown as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    })

    const safeFileName = title.replace(/[/\\?%*:|"<>]/g, '').trim() || '설교'
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(safeFileName)}.pptx`,
      },
    })
  } catch (err: any) {
    console.error('PPT error:', err)
    return NextResponse.json({ error: 'PPT 생성 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
